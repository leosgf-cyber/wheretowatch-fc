/**
 * Aliases for team names that the API-Football returns in long form
 * but the Sheet (and the site UI) uses in short form.
 *
 * Apply AFTER teamSlug(). Keys are post-slugify; values too.
 *
 * Add entries when you spot a mismatch in production:
 * 1. Worker logs `errors[] = "no broadcaster found for match X"`
 * 2. Inspect API name vs Sheet name
 * 3. Add { '<api-slug>': '<canonical-slug>' } here, redeploy.
 */
export const TEAM_ALIASES = {
  // UEFA / European
  'paris-saint-germain': 'psg',
  'fc-barcelona': 'barcelona',
  'real-madrid-cf': 'real-madrid',
  'atletico-de-madrid': 'atletico-madrid',
  'club-atletico-de-madrid': 'atletico-madrid',
  'real-sociedad-de-futbol': 'real-sociedad',
  'real-betis-balompie': 'real-betis',
  'club-athletic-bilbao': 'athletic-club',
  'athletic-bilbao': 'athletic-club',
  'fc-bayern-munchen': 'bayern',
  'fc-bayern-munich': 'bayern',
  'borussia-dortmund': 'dortmund',
  'borussia-monchengladbach': 'mgladbach',
  'rb-leipzig': 'leipzig',
  'bayer-04-leverkusen': 'leverkusen',
  'eintracht-frankfurt': 'frankfurt',
  'sc-freiburg': 'freiburg',
  'fsv-mainz-05': 'mainz',
  'union-berlin': 'union-berlin',
  'fc-koln': 'koln',
  'fc-internazionale': 'inter',
  'inter-milan': 'inter',
  'ac-milan': 'milan',
  'as-roma': 'roma',
  'ss-lazio': 'lazio',
  'ssc-napoli': 'napoli',
  'olympique-de-marseille': 'marseille',
  'olympique-marseille': 'marseille',
  'olympique-lyonnais': 'lyon',
  'as-monaco': 'monaco',
  'lille-olympique-sporting-club': 'lille',
  'rc-lens': 'lens',
  'ogc-nice': 'nice',
  'rc-strasbourg-alsace': 'strasbourg',
  'fc-porto': 'porto',
  'sl-benfica': 'benfica',
  'sporting-cp': 'sporting-cp',
  'sporting-clube-de-portugal': 'sporting-cp',
  'sc-braga': 'braga',
  'vitoria-de-guimaraes': 'vitoria-sc',
  'gd-estoril-praia': 'estoril',
  'fc-famalicao': 'famalicao',
  'moreirense-fc': 'moreirense',

  // Brazilian Série A
  'sport-recife': 'sport',
  'flamengo': 'flamengo',
  'fluminense': 'fluminense',
  'palmeiras': 'palmeiras',
  'botafogo': 'botafogo',
  'sao-paulo': 'sao-paulo',
  'internacional': 'internacional',
  'gremio': 'gremio',
  'corinthians': 'corinthians',
  'cruzeiro': 'cruzeiro',
  'bahia-ec': 'bahia',
  'red-bull-bragantino': 'bragantino',
  'rb-bragantino': 'bragantino',
  'club-athletico-paranaense': 'athletico-pr',
  'athletico-paranaense': 'athletico-pr',
  'atletico-mineiro': 'atletico-mg',
  'clube-atletico-mineiro': 'atletico-mg',
  'fortaleza-ec': 'fortaleza',
  'cr-vasco-da-gama': 'vasco',
  'vasco-da-gama': 'vasco',
  'santos-fc': 'santos',
  'mirassol-fc': 'mirassol',
  'juventude': 'juventude',
  'crb': 'crb',
  'goias-ec': 'goias',
  'cuiaba': 'cuiaba',

  // CONMEBOL
  'liga-de-quito': 'ldu-quito',
  'ldu-de-quito': 'ldu-quito',
  'club-alianza-lima': 'alianza-lima',
  'club-atletico-talleres': 'talleres',
  'racing-club': 'racing',
  'caracas-fc': 'caracas',
  'defensa-y-justicia': 'defensa-y-just',
  'union-la-calera': 'union-la-calera',
  'america-de-cali': 'america-de-cali'
};

/**
 * Apply alias mapping. Always call AFTER teamSlug().
 */
export function applyAlias(slug) {
  return TEAM_ALIASES[slug] || slug;
}
