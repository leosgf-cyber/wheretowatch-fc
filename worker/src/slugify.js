/**
 * Slugify a team or league name into a stable, lowercased ASCII slug.
 *
 * The merge between API-Football fixtures and the human-curated
 * Google Sheet broadcaster mapping depends on this function producing
 * the SAME slug from both sides. Document any change carefully — it
 * may invalidate already-curated rows in the Sheet.
 *
 * Examples:
 *   teamSlug("São Paulo")     → "sao-paulo"
 *   teamSlug("Atlético-MG")   → "atletico-mg"
 *   teamSlug("M'gladbach")    → "mgladbach"
 *   teamSlug("Real Sociedad") → "real-sociedad"
 *   teamSlug("Inter & Milan") → "inter-and-milan"
 */
export function teamSlug(name) {
  if (!name) return '';
  return String(name)
    .normalize('NFD')                      // decompose accents
    .replace(/[̀-ͯ]/g, '')       // strip accents
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['’`]/g, '')                 // strip apostrophes (M'gladbach → mgladbach)
    .replace(/[^a-z0-9]+/g, '-')           // any non-alnum → hyphen
    .replace(/^-+|-+$/g, '');              // trim leading/trailing hyphens
}

/**
 * Build the canonical match_key used to merge API fixtures with
 * Sheet-curated broadcaster rows.
 *
 * Format: ${YYYY-MM-DD}_${league_slug}_${home_slug}-${away_slug}
 * Date is the BRT calendar date of kickoff (UTC-3).
 */
export function buildMatchKey({ dateBRT, leagueSlug, home, away }) {
  return `${dateBRT}_${leagueSlug}_${teamSlug(home)}-${teamSlug(away)}`;
}
