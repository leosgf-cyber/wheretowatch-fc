/**
 * Merge API-Football fixtures + standings with Sheet broadcaster mapping
 * into the final `data.json` shape consumed by the site.
 *
 * Output schema mirrors leagues/data.js (bilingual {en,pt} fields):
 *   {
 *     generated_at, leagues: {<slug>: {...}}, networks: {<slug>: {...}},
 *     health: { last_success_at, errors: [...] }
 *   }
 */

import { LEAGUE_META, STAT_LABELS, LEAGUE_SLUGS } from './league-meta.js';
import { teamSlug, buildMatchKey } from './slugify.js';
import { applyAlias } from './team-aliases.js';
import { normalizeStage, computeFirstLegMap } from './api-football.js';

/* ───────── time / date helpers ───────── */

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3, no DST

function toBRT(utcDate) {
  return new Date(utcDate.getTime() - BRT_OFFSET_MS);
}

function fmtDateBRT(utcDate) {
  // ISO yyyy-mm-dd of the BRT calendar date
  return toBRT(utcDate).toISOString().slice(0, 10);
}

const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Compute the bilingual-friendly `day` and `dayShort` strings the
 * site expects (canonical EN form; I18N.day() in the browser translates).
 *   day      = "Tuesday, 28 Apr"
 *   dayShort = "Tue 28"
 *
 * `referenceUtc` is the current cron run time in UTC; used to compute
 * "Tonight" prefix when the kickoff is later today (in BRT).
 */
function buildDayLabels(utcDate, referenceUtc) {
  const brt = toBRT(utcDate);
  const ref = toBRT(referenceUtc);
  const dow = DAY_NAMES_EN[brt.getUTCDay()];   // BRT day-of-week
  const dowShort = DAY_SHORT_EN[brt.getUTCDay()];
  const dd = String(brt.getUTCDate()).padStart(2, '0');
  const mon = MON_SHORT_EN[brt.getUTCMonth()];

  const sameBRTDay = brt.toISOString().slice(0, 10) === ref.toISOString().slice(0, 10);
  const day = sameBRTDay ? `Tonight, ${dowShort} ${dd} ${mon}` : `${dow}, ${dd} ${mon}`;
  const dayShort = `${dowShort} ${dd}`;
  const hr = String(brt.getUTCHours()).padStart(2, '0') + ':' + String(brt.getUTCMinutes()).padStart(2, '0');
  return { day, dayShort, hr };
}

/* ───────── match scoring / live state ───────── */

function buildLiveLabel(fix) {
  // API-Football fixture.status.short:
  // NS, 1H, HT, 2H, ET, BT, P, SUSP, INT, FT, AET, PEN, AWD, WO, LIVE
  const s = fix.fixture.status;
  if (!s) return null;
  const elapsed = s.elapsed;
  switch (s.short) {
    case '1H': case '2H': case 'ET': case 'P':
      return elapsed != null ? `${elapsed}' LIVE` : 'LIVE';
    case 'HT': return 'HT';
    case 'BT': return 'BT';
    case 'INT': case 'SUSP': return 'PAUSED';
    default: return null;
  }
}

function buildScore(fix) {
  const g = fix.goals;
  if (g == null || g.home == null || g.away == null) return null;
  return `${g.home} – ${g.away}`;
}

const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO']);

/* ───────── per-league transform ───────── */

/**
 * Transform a single league's API data + Sheet mapping into the
 * site-shaped league object.
 */
export function transformLeague({
  slug,
  fixtures,
  standings,
  broadcasterByMatchKey,
  broadcasterCatalog,    // Map<networkName, {slug, name, c, kind}>
  referenceUtc,
  windowStartUtc,
  windowEndUtc
}) {
  const meta = LEAGUE_META[slug];
  if (!meta) throw new Error(`unknown league slug: ${slug}`);

  const firstLegMap = computeFirstLegMap(fixtures);

  // Filter fixtures to display window: -7 days .. +21 days from now (BRT-aware).
  const windowStart = windowStartUtc.getTime();
  const windowEnd = windowEndUtc.getTime();
  const inWindow = fixtures.filter(f => {
    const t = new Date(f.fixture.date).getTime();
    return t >= windowStart && t <= windowEnd;
  });

  // Sort by kickoff
  inWindow.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

  // Build matches array
  const matches = [];
  for (const f of inWindow) {
    const utc = new Date(f.fixture.date);
    const dateBRT = fmtDateBRT(utc);
    const home = f.teams.home.name;
    const away = f.teams.away.name;

    // Match key: use canonical (alias-applied) team slugs for stable lookup
    const homeSlug = applyAlias(teamSlug(home));
    const awaySlug = applyAlias(teamSlug(away));
    const matchKey = `${dateBRT}_${slug}_${homeSlug}-${awaySlug}`;

    const labels = buildDayLabels(utc, referenceUtc);
    const stage = normalizeStage(f.league.round, {
      firstLeg: firstLegMap.get(f.fixture.id),
      group: f.league.group   // sometimes API exposes group like "A","B"
    });

    // Lookup broadcasters from Sheet
    const sheetRow = broadcasterByMatchKey.get(matchKey);
    let nets = [];
    if (sheetRow && sheetRow.networks) {
      const names = String(sheetRow.networks).split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
      nets = names.map(name => {
        const cat = broadcasterCatalog.get(name);
        return cat
          ? { name, c: cat.c }
          : { name, c: '#65718a' }; // unknown net → muted color, still rendered
      });
    }

    const isFinished = FINISHED_STATUSES.has(f.fixture.status && f.fixture.status.short);
    const live = buildLiveLabel(f);
    const score = (live || isFinished) ? buildScore(f) : null;

    matches.push({
      match_key: matchKey,
      day: labels.day,
      dayShort: labels.dayShort,
      hr: live ? null : labels.hr,
      live,
      h: home,
      a: away,
      score,
      stage,
      nets
    });
  }

  // Build stats (best-effort; fields tailored per league kind)
  const stats = buildStats(slug, fixtures, matches, broadcasterCatalog);

  // Build standings (single table for league, top group for groups, note for bracket)
  const out = {
    name: meta.name,
    region: meta.region,
    crest: meta.crest,
    color: meta.color,
    blurb: meta.blurb,
    stats,
    networks: collectNetworksUsed(matches, broadcasterCatalog),
    matches
  };

  if (meta.standingsKind === 'league' || meta.standingsKind === 'groups') {
    out.tableTitle = meta.tableTitle;
    out.standings = buildStandings(standings, meta.standingsKind);
  } else if (meta.standingsKind === 'bracket') {
    out.standingsNote = meta.standingsNote;
  }

  return out;
}

/* ───────── derived stats ───────── */

function buildStats(slug, fixtures, matches, broadcasterCatalog) {
  const meta = LEAGUE_META[slug];
  const stats = [];

  // Find current matchday from API (the round of fixtures where most are not-yet-finished or recent).
  let currentRound = '';
  for (const f of fixtures) {
    const status = f.fixture.status && f.fixture.status.short;
    if (!FINISHED_STATUSES.has(status)) {
      currentRound = f.league.round || '';
      break;
    }
  }
  const stageNorm = normalizeStage(currentRound) || '—';

  if (meta.standingsKind === 'league') {
    stats.push({ n: { en: stageNorm, pt: stageNorm }, l: STAT_LABELS.matchday });
    const clubs = new Set();
    fixtures.forEach(f => { if (f.teams) { clubs.add(f.teams.home.id); clubs.add(f.teams.away.id); } });
    stats.push({ n: { en: String(clubs.size), pt: String(clubs.size) }, l: STAT_LABELS.clubs });
  } else if (meta.standingsKind === 'groups') {
    stats.push({ n: { en: stageNorm, pt: stageNorm }, l: STAT_LABELS.stage });
    const clubs = new Set();
    fixtures.forEach(f => { if (f.teams) { clubs.add(f.teams.home.id); clubs.add(f.teams.away.id); } });
    stats.push({ n: { en: String(clubs.size), pt: String(clubs.size) }, l: STAT_LABELS.clubs });
  } else if (meta.standingsKind === 'bracket') {
    stats.push({ n: { en: stageNorm, pt: stageNorm }, l: STAT_LABELS.stage });
    const teamsLeft = new Set();
    fixtures.forEach(f => {
      const status = f.fixture.status && f.fixture.status.short;
      if (!FINISHED_STATUSES.has(status)) {
        teamsLeft.add(f.teams.home.id);
        teamsLeft.add(f.teams.away.id);
      }
    });
    stats.push({ n: { en: String(teamsLeft.size), pt: String(teamsLeft.size) }, l: STAT_LABELS.teamsleft });
  }

  // Matches this week: matches in next 7 BRT days
  const now = Date.now();
  const weekEnd = now + 7 * 24 * 3600 * 1000;
  const inWeek = matches.filter(m => {
    // approximate: parse from match.day "<dow>, <dd> <mon>" → not robust enough.
    // Use the match_key date (yyyy-mm-dd) instead.
    const d = m.match_key.slice(0, 10);
    const t = new Date(d + 'T00:00:00-03:00').getTime();
    return t >= now && t <= weekEnd;
  });
  stats.push({ n: { en: String(inWeek.length), pt: String(inWeek.length) }, l: STAT_LABELS.matchesweek });

  // Networks tracked (count of distinct broadcasters in upcoming matches)
  const netSet = new Set();
  matches.forEach(m => (m.nets || []).forEach(n => netSet.add(n.name)));
  stats.push({ n: { en: String(netSet.size), pt: String(netSet.size) }, l: STAT_LABELS.networks });

  return stats;
}

/* ───────── networks used by this league ───────── */

function collectNetworksUsed(matches, broadcasterCatalog) {
  const seen = new Set();
  const out = [];
  for (const m of matches) {
    for (const n of (m.nets || [])) {
      if (seen.has(n.name)) continue;
      seen.add(n.name);
      const cat = broadcasterCatalog.get(n.name);
      out.push({ name: n.name, c: cat ? cat.c : n.c });
    }
  }
  return out;
}

/* ───────── standings ───────── */

function buildStandings(rawStandings, kind) {
  // rawStandings is array of arrays. For "league": single table. For "groups": pick top group as preview.
  if (!rawStandings || !rawStandings.length) return [];
  const table = rawStandings[0];
  const top = table.slice(0, 8);
  return top.map(row => ({
    name: row.team.name,
    gd: row.goalsDiff != null ? row.goalsDiff : 0,
    pts: row.points != null ? row.points : 0
  }));
}

/* ───────── full pipeline ───────── */

/**
 * Build the final data.json from raw API + Sheet inputs.
 * Errors per-league are isolated: failure on one league doesn't kill others.
 *
 * @param input.referenceUtc       Date — current run time in UTC (cron trigger time)
 * @param input.fixturesByLeague   Map<slug, fixtures[]>
 * @param input.standingsByLeague  Map<slug, standings[]>
 * @param input.broadcasterCatalog Map<networkName, {slug, name, c, kind}>
 * @param input.fixtureBroadcasters Array of {match_key, networks, notes}
 */
export function buildDataJson({
  referenceUtc = new Date(),
  fixturesByLeague,
  standingsByLeague,
  broadcasterCatalog,
  fixtureBroadcasters
}) {
  const errors = [];

  // Index broadcaster mappings by match_key
  const broadcasterByMatchKey = new Map();
  for (const row of (fixtureBroadcasters || [])) {
    if (row && row.match_key) broadcasterByMatchKey.set(String(row.match_key).trim(), row);
  }

  // Build leagues
  const leagues = {};
  const windowStartUtc = new Date(referenceUtc.getTime() - 7 * 24 * 3600 * 1000);
  const windowEndUtc = new Date(referenceUtc.getTime() + 21 * 24 * 3600 * 1000);

  for (const slug of LEAGUE_SLUGS) {
    try {
      const fixtures = fixturesByLeague.get(slug) || [];
      const standings = standingsByLeague.get(slug) || [];
      leagues[slug] = transformLeague({
        slug,
        fixtures,
        standings,
        broadcasterByMatchKey,
        broadcasterCatalog,
        referenceUtc,
        windowStartUtc,
        windowEndUtc
      });
    } catch (err) {
      errors.push({ league: slug, msg: err.message || String(err) });
    }
  }

  // Build networks object (substitutes networks/networks.js)
  const networks = {};
  for (const [name, cat] of broadcasterCatalog.entries()) {
    networks[cat.slug] = {
      name: cat.name,
      c: cat.c,
      kind: cat.kind
    };
  }

  return {
    generated_at: referenceUtc.toISOString(),
    leagues,
    networks,
    health: {
      last_success_at: errors.length === 0 ? referenceUtc.toISOString() : null,
      errors
    }
  };
}

/**
 * Helper to convert the Sheet `broadcasters` tab rows into the
 * Map<networkName, {slug, name, c, kind}> the transform expects.
 *
 * Expected columns: slug, name, brand_color, kind_en, kind_pt
 */
export function buildBroadcasterCatalog(sheetRows) {
  const m = new Map();
  for (const row of (sheetRows || [])) {
    if (!row.name || !row.slug) continue;
    m.set(row.name, {
      slug: row.slug,
      name: row.name,
      c: row.brand_color || '#65718a',
      kind: {
        en: row.kind_en || '',
        pt: row.kind_pt || row.kind_en || ''
      }
    });
  }
  return m;
}
