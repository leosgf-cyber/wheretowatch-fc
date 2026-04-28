/**
 * WhereToWatch FC — Cloudflare Worker
 *
 * Two responsibilities:
 *   1. Cron (`scheduled`): pull fixtures + standings from API-Football,
 *      pull broadcaster mapping from Google Sheets, merge, and write to KV.
 *   2. HTTP (`fetch`): serve `/api/data.json` from KV (with CORS + cache).
 *
 * Resilience:
 *   - Per-league failures don't kill the whole run; errors collected in
 *     `data.health.errors`.
 *   - KV holds two versions: `data:current` (last validated run) and
 *     `data:previous` (one before). Schema validation gates promotion.
 *   - If KV is empty (cold start), fetch handler falls back to the
 *     `data.seed.json` static asset.
 */

import { LEAGUE_META, LEAGUE_SLUGS } from './league-meta.js';
import { fetchFixtures, fetchStandings } from './api-football.js';
import { readTab } from './sheets.js';
import { buildDataJson, buildBroadcasterCatalog } from './transform.js';

const KV_KEY_CURRENT = 'data:current';
const KV_KEY_PREVIOUS = 'data:previous';

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runUpdate(env, event.scheduledTime));
  },

  async fetch(req, env) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/api/data.json') {
      return serveDataJson(env);
    }

    if (url.pathname === '/api/health') {
      return serveHealth(env);
    }

    if (url.pathname === '/api/trigger' && req.method === 'POST') {
      // Manual trigger — guarded by a token to prevent abuse.
      const token = req.headers.get('x-trigger-token');
      if (!env.TRIGGER_TOKEN || token !== env.TRIGGER_TOKEN) {
        return new Response('forbidden', { status: 403, headers: corsHeaders() });
      }
      const result = await runUpdate(env, Date.now());
      return new Response(JSON.stringify(result), {
        headers: { 'content-type': 'application/json', ...corsHeaders() }
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders() });
  }
};

/* ───────── pipeline ───────── */

async function runUpdate(env, scheduledTime) {
  const started = Date.now();
  const referenceUtc = new Date(typeof scheduledTime === 'number' ? scheduledTime : Date.parse(scheduledTime) || started);
  const result = { ok: false, started_at: new Date(started).toISOString(), errors: [] };

  try {
    // 1) Pull broadcaster catalog + per-fixture mapping from Sheet (parallel)
    const [broadcastersRaw, fixturesRaw] = await Promise.all([
      readTab(env, 'broadcasters').catch(err => { result.errors.push({ scope: 'sheet:broadcasters', msg: err.message }); return []; }),
      readTab(env, 'fixtures').catch(err => { result.errors.push({ scope: 'sheet:fixtures', msg: err.message }); return []; })
    ]);
    const broadcasterCatalog = buildBroadcasterCatalog(broadcastersRaw);

    // 2) Pull fixtures + standings from API-Football, league by league.
    const fixturesByLeague = new Map();
    const standingsByLeague = new Map();
    const season = String(env.SEASON || '2026');

    // Sequential to be gentle with rate limits (free tier 100/day, we use ~18/day).
    for (const slug of LEAGUE_SLUGS) {
      const meta = LEAGUE_META[slug];
      try {
        const [fx, st] = await Promise.all([
          fetchFixtures(env, meta.apiId, season),
          fetchStandings(env, meta.apiId, season)
        ]);
        fixturesByLeague.set(slug, fx || []);
        standingsByLeague.set(slug, st || []);
      } catch (err) {
        result.errors.push({ scope: `api:${slug}`, msg: err.message || String(err) });
        // Try to retain previous data for this league from KV (Phase 2+).
        // For Phase 1, skipping is acceptable — site falls back to seed if all leagues fail.
      }
    }

    // 3) Merge into final shape.
    const data = buildDataJson({
      referenceUtc,
      fixturesByLeague,
      standingsByLeague,
      broadcasterCatalog,
      fixtureBroadcasters: fixturesRaw
    });

    // Add pipeline-level errors to data.health
    if (result.errors.length) {
      data.health.errors = [...(data.health.errors || []), ...result.errors];
    }

    // 4) Schema validation before promoting.
    if (!validateData(data)) {
      result.errors.push({ scope: 'validation', msg: 'output failed schema validation; not promoting' });
      console.error('[w2w] validation failed', JSON.stringify(data.health));
      return result;
    }

    // 5) Promote: current → previous, new → current.
    const oldCurrent = await env.W2W_KV.get(KV_KEY_CURRENT);
    if (oldCurrent) {
      await env.W2W_KV.put(KV_KEY_PREVIOUS, oldCurrent);
    }
    await env.W2W_KV.put(KV_KEY_CURRENT, JSON.stringify(data));

    result.ok = true;
    result.elapsed_ms = Date.now() - started;
    result.leagues_ok = Object.keys(data.leagues).length;
    result.errors = data.health.errors;
    console.log('[w2w] update OK', JSON.stringify(result));
    return result;
  } catch (err) {
    result.errors.push({ scope: 'fatal', msg: err.message || String(err) });
    console.error('[w2w] update FATAL', err.stack || err);
    return result;
  }
}

/* ───────── schema validation ───────── */

function validateData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!data.leagues || typeof data.leagues !== 'object') return false;
  if (!data.networks || typeof data.networks !== 'object') return false;

  // Must have at least 5 of the 9 leagues populated to be promotable.
  // (Tolerates 1-2 individual league API failures without rolling back.)
  const populated = LEAGUE_SLUGS.filter(s => {
    const L = data.leagues[s];
    return L && Array.isArray(L.matches);
  });
  if (populated.length < 5) return false;

  // Each league must have name + region + color
  for (const slug of populated) {
    const L = data.leagues[slug];
    if (!L.name || !L.color || !L.region) return false;
  }

  return true;
}

/* ───────── HTTP handlers ───────── */

async function serveDataJson(env) {
  let body = await env.W2W_KV.get(KV_KEY_CURRENT);

  if (!body) {
    // Cold start fallback: serve seed asset.
    if (env.ASSETS) {
      try {
        const seedRes = await env.ASSETS.fetch('https://w2w/data.seed.json');
        if (seedRes.ok) {
          body = await seedRes.text();
        }
      } catch (err) {
        console.error('[w2w] seed fetch failed', err);
      }
    }
  }

  if (!body) {
    return new Response(JSON.stringify({ error: 'no data yet' }), {
      status: 503,
      headers: { 'content-type': 'application/json', ...corsHeaders() }
    });
  }

  return new Response(body, {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=60',
      ...corsHeaders()
    }
  });
}

async function serveHealth(env) {
  const body = await env.W2W_KV.get(KV_KEY_CURRENT);
  if (!body) {
    return new Response(JSON.stringify({ status: 'cold', kv: 'empty' }), {
      headers: { 'content-type': 'application/json', ...corsHeaders() }
    });
  }
  try {
    const j = JSON.parse(body);
    return new Response(JSON.stringify({
      status: 'ok',
      generated_at: j.generated_at,
      leagues: Object.keys(j.leagues || {}).length,
      networks: Object.keys(j.networks || {}).length,
      health: j.health
    }), { headers: { 'content-type': 'application/json', ...corsHeaders() } });
  } catch {
    return new Response(JSON.stringify({ status: 'corrupt' }), {
      status: 500, headers: { 'content-type': 'application/json', ...corsHeaders() }
    });
  }
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-trigger-token'
  };
}
