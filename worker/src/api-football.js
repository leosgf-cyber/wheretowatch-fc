/**
 * API-Football (RapidAPI) thin client.
 *
 * Endpoints used:
 *   GET /fixtures?league=<id>&season=<year>
 *   GET /standings?league=<id>&season=<year>
 *
 * Auth: header X-RapidAPI-Key (set as wrangler secret API_FOOTBALL_KEY).
 * Free tier rate limit: 100 req/day. Worker uses ~9-18 req/day in Phase 1.
 */

const BASE_URL = 'https://v3.football.api-sports.io';
const TIMEOUT_MS = 15_000;

async function apiCall(env, path) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'x-rapidapi-key': env.API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      signal: ctrl.signal
    });
    if (!res.ok) {
      throw new Error(`API-Football ${res.status} on ${path}`);
    }
    const j = await res.json();
    if (j.errors && Object.keys(j.errors).length > 0) {
      throw new Error(`API-Football errors on ${path}: ${JSON.stringify(j.errors)}`);
    }
    return j.response;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fetch fixtures for one league/season.
 * Returns the raw `response[]` from API-Football.
 */
export async function fetchFixtures(env, leagueApiId, season) {
  return apiCall(env, `/fixtures?league=${leagueApiId}&season=${season}`);
}

/**
 * Fetch standings for one league/season.
 * Returns the raw `response[].league.standings` (array of arrays — one
 * sub-array per group; for single-table leagues there's just one).
 */
export async function fetchStandings(env, leagueApiId, season) {
  const resp = await apiCall(env, `/standings?league=${leagueApiId}&season=${season}`);
  if (!resp || !resp[0]) return [];
  return resp[0].league.standings || [];
}

/**
 * Normalize an API-Football `round` string into the canonical EN form
 * that I18N.stage() in the site already understands.
 *
 * Examples:
 *   "Regular Season - 5"          → "MD 5"
 *   "Group Stage - 4"             → "Group X"  (X resolved via fixture.league.round group meta — best effort)
 *   "Round of 16"                 → "R16"      (1st/2nd leg disambiguated by `firstLeg` flag)
 *   "Quarter-finals - 1st Leg"    → "QF · 1st leg"
 *   "Semi-finals - 1st Leg"       → "SF · 1st leg"
 *   "Final"                       → "Final"
 *
 * If a `firstLeg` boolean is provided (computed by transform.js from
 * fixture date + opponent pairing), it overrides leg detection.
 */
export function normalizeStage(round, { firstLeg, group } = {}) {
  if (!round) return '';
  const r = String(round).trim();

  // Regular Season - N → MD N
  let m = r.match(/^Regular Season\s*-\s*(\d+)$/i);
  if (m) return `MD ${m[1]}`;

  // Group Stage - N → Group <letter> (use group hint if available, else MD-style)
  m = r.match(/^Group Stage\s*-\s*(\d+)$/i);
  if (m) {
    return group ? `Group ${group}` : `MD ${m[1]}`;
  }

  // "Group A" / "Group B" — sometimes the round itself is "Group A".
  m = r.match(/^Group ([A-H])$/i);
  if (m) return `Group ${m[1].toUpperCase()}`;

  // Round of 16 / Quarter-finals / Semi-finals / Final, optionally with leg
  const knockout = (label, leg) => leg ? `${label} · ${leg}` : label;
  const legFromRound = (s) => {
    if (/1st\s*leg/i.test(s)) return '1st leg';
    if (/2nd\s*leg/i.test(s)) return '2nd leg';
    return null;
  };
  const legHint = legFromRound(r) || (firstLeg === true ? '1st leg' : firstLeg === false ? '2nd leg' : null);

  if (/^Round of 16/i.test(r)) return knockout('R16', legHint);
  if (/^Quarter[- ]finals?/i.test(r)) return knockout('QF', legHint);
  if (/^Semi[- ]finals?/i.test(r)) return knockout('SF', legHint);
  if (/^Final/i.test(r)) return knockout('Final', legHint);
  if (/^3rd Place|^Third Place/i.test(r)) return '3rd place';

  // Fall through — return the raw round so we can spot it in logs and add a rule.
  return r;
}

/**
 * Compute first-leg vs second-leg from a fixtures array.
 * Two fixtures with the same teams (regardless of home/away order)
 * within the same knockout round form a tie. The earlier date is the 1st leg.
 *
 * Returns a Map<fixtureId, boolean> where true = first leg.
 */
export function computeFirstLegMap(fixtures) {
  const ties = new Map();   // key: "round:setOfTeamSlugs", val: [fixtureId, dateMs][]
  const setKey = (a, b) => [a, b].sort().join('|');

  for (const f of fixtures) {
    const round = (f.league && f.league.round) || '';
    if (!/leg|round of|quarter|semi|final/i.test(round)) continue;
    if (!f.teams || !f.teams.home || !f.teams.away) continue;
    const k = `${round}:${setKey(f.teams.home.id, f.teams.away.id)}`;
    if (!ties.has(k)) ties.set(k, []);
    ties.get(k).push([f.fixture.id, new Date(f.fixture.date).getTime()]);
  }

  const map = new Map();
  for (const arr of ties.values()) {
    if (arr.length < 2) continue;
    arr.sort((a, b) => a[1] - b[1]);
    map.set(arr[0][0], true);    // earliest = 1st leg
    map.set(arr[1][0], false);   // later = 2nd leg
  }
  return map;
}
