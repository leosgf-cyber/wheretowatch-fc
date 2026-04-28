/**
 * Static, bilingual metadata per league.
 *
 * The Worker hardcodes these because they don't change per matchday —
 * region/blurb/color/crest/name are league constants. Stats labels
 * (`Current matchday`, `Clubs`, etc.) are also bilingual constants;
 * the numeric `n` values come from API data and are computed at
 * transform time.
 *
 * `apiId` is the API-Football league ID. Confirmed via:
 *   curl -H "X-RapidAPI-Key: $KEY" \
 *     "https://v3.football.api-sports.io/leagues?country=Brazil&season=2026"
 *
 * If a league ID changes between seasons (it shouldn't), update here.
 */
export const LEAGUE_META = {
  'brasileirao': {
    apiId: 71,
    name: 'Campeonato Brasileiro',
    region: { en: 'Brazil · Série A',     pt: 'Brasil · Série A' },
    crest: 'CBF',
    color: '#f7c52b',
    blurb: {
      en: 'Top-flight Brazilian football. 20 clubs, 38 matchdays, played from April to December.',
      pt: 'Primeira divisão do futebol brasileiro. 20 clubes, 38 rodadas, disputado de abril a dezembro.'
    },
    tableTitle: { en: 'Série A table', pt: 'Classificação Série A' },
    standingsKind: 'league'   // full standings table
  },

  'copa-do-brasil': {
    apiId: 73,
    name: 'Copa do Brasil',
    region: { en: 'Brazil · Knockout cup', pt: 'Brasil · Copa nacional' },
    crest: 'CDB',
    color: '#36d399',
    blurb: {
      en: 'Brazilian national knockout cup. 92 clubs enter; the winner qualifies for the Copa Libertadores.',
      pt: 'Copa nacional eliminatória do Brasil. 92 clubes entram; o campeão garante vaga na Libertadores.'
    },
    standingsKind: 'bracket',
    standingsNote: {
      en: 'Knockout bracket — no league table.',
      pt: 'Mata-mata — sem tabela.'
    }
  },

  'sulamericana': {
    apiId: 11,
    name: 'Copa Sulamericana',
    region: { en: 'CONMEBOL · Continental', pt: 'CONMEBOL · Continental' },
    crest: 'CSA',
    color: '#ff7a59',
    blurb: {
      en: 'Second-tier continental competition for South American clubs. 32 teams across 8 groups feed into a knockout phase.',
      pt: 'Segunda principal competição continental sul-americana. 32 times em 8 grupos avançam para o mata-mata.'
    },
    tableTitle: { en: 'Group stage', pt: 'Fase de grupos' },
    standingsKind: 'groups'
  },

  'la-liga': {
    apiId: 140,
    name: 'La Liga',
    region: { en: 'Spain · Top flight', pt: 'Espanha · 1ª divisão' },
    crest: 'LFP',
    color: '#ff2b56',
    blurb: {
      en: 'Spanish top flight. 20 clubs, 38 matchdays, August to May. Home of Madrid, Barcelona and the rest.',
      pt: 'Primeira divisão espanhola. 20 clubes, 38 rodadas, de agosto a maio. Casa de Madrid, Barcelona e companhia.'
    },
    tableTitle: { en: 'La Liga table', pt: 'Classificação La Liga' },
    standingsKind: 'league'
  },

  'champions-league': {
    apiId: 2,
    name: 'Champions League',
    region: { en: 'UEFA · Continental', pt: 'UEFA · Continental' },
    crest: 'UCL',
    color: '#3a86ff',
    blurb: {
      en: "Europe's elite club competition. The semi-final ties this week decide who plays for the trophy.",
      pt: 'Principal competição de clubes da Europa. As semifinais desta semana definem quem vai disputar o título.'
    },
    standingsKind: 'bracket',
    standingsNote: {
      en: 'UEFA Champions League knockout bracket.',
      pt: 'Chaveamento da fase final da Champions League.'
    }
  },

  'serie-a': {
    apiId: 135,
    name: 'Serie A',
    region: { en: 'Italy · Top flight', pt: 'Itália · 1ª divisão' },
    crest: 'LSA',
    color: '#0a8e3a',
    blurb: {
      en: 'Italian top flight. 20 clubs, 38 matchdays. Tradition-rich league with Inter, Milan, Juventus, Napoli and more.',
      pt: 'Primeira divisão italiana. 20 clubes, 38 rodadas. Liga tradicionalíssima com Inter, Milan, Juventus, Napoli e companhia.'
    },
    tableTitle: { en: 'Serie A table', pt: 'Classificação Serie A' },
    standingsKind: 'league'
  },

  'bundesliga': {
    apiId: 78,
    name: 'Bundesliga',
    region: { en: 'Germany · Top flight', pt: 'Alemanha · 1ª divisão' },
    crest: 'BUN',
    color: '#d22020',
    blurb: {
      en: 'German top flight. 18 clubs, 34 matchdays. Bayern, Dortmund, Leverkusen and Saturday afternoon kickoffs.',
      pt: 'Primeira divisão alemã. 18 clubes, 34 rodadas. Bayern, Dortmund, Leverkusen e os clássicos jogos de sábado à tarde.'
    },
    tableTitle: { en: 'Bundesliga table', pt: 'Classificação Bundesliga' },
    standingsKind: 'league'
  },

  'ligue-1': {
    apiId: 61,
    name: 'Ligue 1',
    region: { en: 'France · Top flight', pt: 'França · 1ª divisão' },
    crest: 'LFP',
    color: '#9b5dff',
    blurb: {
      en: 'French top flight. 18 clubs, 34 matchdays. PSG, Marseille, Monaco and rising provincial sides.',
      pt: 'Primeira divisão francesa. 18 clubes, 34 rodadas. PSG, Marseille, Monaco e equipes regionais em ascensão.'
    },
    tableTitle: { en: 'Ligue 1 table', pt: 'Classificação Ligue 1' },
    standingsKind: 'league'
  },

  'primeira-liga': {
    apiId: 94,
    name: 'Primeira Liga',
    region: { en: 'Portugal · Top flight', pt: 'Portugal · 1ª divisão' },
    crest: 'LPF',
    color: '#f25c5c',
    blurb: {
      en: 'Portuguese top flight. 18 clubs, 34 matchdays. The eternal three — Benfica, Porto, Sporting — plus Braga and the rest.',
      pt: 'Primeira divisão portuguesa. 18 clubes, 34 rodadas. Os três eternos — Benfica, Porto, Sporting — mais Braga e companhia.'
    },
    tableTitle: { en: 'Primeira Liga table', pt: 'Classificação Primeira Liga' },
    standingsKind: 'league'
  }
};

/**
 * Bilingual labels for league stats. The Worker fills the `n` (number)
 * from API data; `l` (label) comes from these constants.
 */
export const STAT_LABELS = {
  matchday:    { en: 'Current matchday',  pt: 'Rodada atual' },
  clubs:       { en: 'Clubs',             pt: 'Clubes' },
  matchesweek: { en: 'Matches this week', pt: 'Jogos esta semana' },
  networks:    { en: 'Networks tracked',  pt: 'Canais cobertos' },
  stage:       { en: 'Current stage',     pt: 'Fase atual' },
  teamsleft:   { en: 'Teams left',        pt: 'Times restantes' }
};

export const LEAGUE_SLUGS = Object.keys(LEAGUE_META);
