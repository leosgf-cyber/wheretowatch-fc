// Shared league data for the league subpages
// Text-bearing fields (region, blurb, stats[*].n/l, tableTitle, standingsNote)
// are bilingual objects { en, pt }, read at render time via I18N.pick().
// match.stage / match.day are kept canonical EN strings — translated by
// I18N.stage() / I18N.day() at render time.
window.LEAGUES = {

  'brasileirao': {
    name: 'Campeonato Brasileiro',
    region: { en:'Brazil · Série A', pt:'Brasil · Série A' },
    crest: 'CBF',
    color: '#f7c52b',
    blurb: {
      en: 'Top-flight Brazilian football. 20 clubs, 38 matchdays, played from April to December.',
      pt: 'Primeira divisão do futebol brasileiro. 20 clubes, 38 rodadas, disputado de abril a dezembro.'
    },
    stats: [
      { n: { en:'20',     pt:'20' },     l: { en:'Clubs',             pt:'Clubes' } },
      { n: { en:'MD 5',   pt:'Rod 5' },  l: { en:'Current matchday',  pt:'Rodada atual' } },
      { n: { en:'10',     pt:'10' },     l: { en:'Matches this week', pt:'Jogos esta semana' } },
      { n: { en:'5',      pt:'5' },      l: { en:'Networks tracked',  pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'Globo',     c:'#0a4cdc' },
      { name:'Premiere',  c:'#ff0033' },
      { name:'Prime Video',c:'#00a8e1' },
      { name:'CazéTV',    c:'#c6ff3d' },
      { name:'SportyNet', c:'#ff6a00' }
    ],
    matches: [
      { day:'Tonight, Mon 27 Apr', dayShort:'Mon 27', live:'67\' LIVE', h:'Flamengo', a:'Fluminense', score:'2 – 1', stage:'MD 5', nets:[{name:'Globo',c:'#0a4cdc'},{name:'Premiere',c:'#ff0033'}] },
      { day:'Tuesday, 28 Apr',     dayShort:'Tue 28', hr:'19:00', h:'Palmeiras', a:'Botafogo',     stage:'MD 5', nets:[{name:'Prime Video',c:'#00a8e1'}] },
      { day:'Tuesday, 28 Apr',     dayShort:'Tue 28', hr:'21:30', h:'Cruzeiro', a:'Internacional', stage:'MD 5', nets:[{name:'Premiere',c:'#ff0033'}] },
      { day:'Wednesday, 29 Apr',   dayShort:'Wed 29', hr:'16:00', h:'São Paulo', a:'Bahia',        stage:'MD 5', nets:[{name:'CazéTV',c:'#c6ff3d'}] },
      { day:'Wednesday, 29 Apr',   dayShort:'Wed 29', hr:'19:30', h:'Atlético-MG', a:'Vasco',      stage:'MD 5', nets:[{name:'Premiere',c:'#ff0033'}] },
      { day:'Thursday, 30 Apr',    dayShort:'Thu 30', hr:'21:30', h:'Grêmio', a:'Fortaleza',       stage:'MD 5', nets:[{name:'Prime Video',c:'#00a8e1'}] },
      { day:'Saturday, 02 May',    dayShort:'Sat 02', hr:'18:30', h:'Bragantino', a:'Athletico-PR',stage:'MD 6', nets:[{name:'CazéTV',c:'#c6ff3d'}] },
      { day:'Saturday, 02 May',    dayShort:'Sat 02', hr:'21:00', h:'Corinthians', a:'Juventude',  stage:'MD 6', nets:[{name:'Globo',c:'#0a4cdc'},{name:'Premiere',c:'#ff0033'}] },
      { day:'Sunday, 03 May',      dayShort:'Sun 03', hr:'16:00', h:'Flamengo', a:'Corinthians',   stage:'MD 6', nets:[{name:'Globo',c:'#0a4cdc'},{name:'Premiere',c:'#ff0033'}] },
      { day:'Sunday, 03 May',      dayShort:'Sun 03', hr:'18:30', h:'Santos', a:'Mirassol',        stage:'MD 6', nets:[{name:'Premiere',c:'#ff0033'}] }
    ],
    tableTitle: { en:'Série A table', pt:'Classificação Série A' },
    standings: [
      { name:'Palmeiras', gd:7, pts:11 },
      { name:'Flamengo',  gd:6, pts:10 },
      { name:'Cruzeiro',  gd:4, pts:10 },
      { name:'Botafogo',  gd:3, pts:9  },
      { name:'São Paulo', gd:2, pts:8  },
      { name:'Internacional', gd:1, pts:7 },
      { name:'Bahia',     gd:0, pts:6 },
      { name:'Grêmio',    gd:-1, pts:5 }
    ]
  },

  'copa-do-brasil': {
    name: 'Copa do Brasil',
    region: { en:'Brazil · Knockout cup', pt:'Brasil · Copa nacional' },
    crest: 'CDB',
    color: '#36d399',
    blurb: {
      en: 'Brazilian national knockout cup. 92 clubs enter; the winner qualifies for the Copa Libertadores.',
      pt: 'Copa nacional eliminatória do Brasil. 92 clubes entram; o campeão garante vaga na Libertadores.'
    },
    stats: [
      { n: { en:'R16',  pt:'Oitavas' }, l: { en:'Current round',     pt:'Fase atual' } },
      { n: { en:'16',   pt:'16' },      l: { en:'Clubs left',        pt:'Times restantes' } },
      { n: { en:'8',    pt:'8' },       l: { en:'Matches this week', pt:'Jogos esta semana' } },
      { n: { en:'3',    pt:'3' },       l: { en:'Networks tracked',  pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'Globo', c:'#0a4cdc' },
      { name:'Prime Video', c:'#00a8e1' },
      { name:'SporTV', c:'#ff0033' }
    ],
    matches: [
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'19:30', h:'Atlético-MG', a:'Bahia',       stage:'R16 · 1st leg', nets:[{name:'Prime Video',c:'#00a8e1'}] },
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'21:30', h:'Corinthians', a:'Vasco',       stage:'R16 · 1st leg', nets:[{name:'Globo',c:'#0a4cdc'},{name:'Prime Video',c:'#00a8e1'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'19:30', h:'Palmeiras', a:'CRB',         stage:'R16 · 1st leg', nets:[{name:'Prime Video',c:'#00a8e1'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'21:30', h:'Athletico-PR', a:'Bragantino', stage:'R16 · 1st leg', nets:[{name:'SporTV',c:'#ff0033'}] },
      { day:'Thursday, 30 Apr', dayShort:'Thu 30', hr:'19:30', h:'Fluminense', a:'Internacional', stage:'R16 · 1st leg', nets:[{name:'Prime Video',c:'#00a8e1'}] },
      { day:'Thursday, 30 Apr', dayShort:'Thu 30', hr:'21:30', h:'Botafogo', a:'Cuiabá',        stage:'R16 · 1st leg', nets:[{name:'Globo',c:'#0a4cdc'}] },
      { day:'Wednesday, 06 May', dayShort:'Wed 06', hr:'21:30', h:'Flamengo', a:'Goiás',        stage:'R16 · 1st leg', nets:[{name:'Globo',c:'#0a4cdc'},{name:'Prime Video',c:'#00a8e1'}] },
      { day:'Thursday, 07 May', dayShort:'Thu 07', hr:'21:30', h:'São Paulo', a:'Náutico',      stage:'R16 · 1st leg', nets:[{name:'SporTV',c:'#ff0033'}] }
    ],
    standingsNote: {
      en: 'Knockout bracket — no league table. 1st-leg ties this week.',
      pt: 'Mata-mata — sem tabela. Jogos de ida das oitavas nesta semana.'
    }
  },

  'sulamericana': {
    name: 'Copa Sulamericana',
    region: { en:'CONMEBOL · Continental', pt:'CONMEBOL · Continental' },
    crest: 'CSA',
    color: '#ff7a59',
    blurb: {
      en: 'Second-tier continental competition for South American clubs. 32 teams across 8 groups feed into a knockout phase.',
      pt: 'Segunda principal competição continental sul-americana. 32 times em 8 grupos avançam para o mata-mata.'
    },
    stats: [
      { n: { en:'GS · MD 4', pt:'Grupos · Rod 4' }, l: { en:'Current stage',      pt:'Fase atual' } },
      { n: { en:'32',        pt:'32' },             l: { en:'Clubs',              pt:'Clubes' } },
      { n: { en:'8',         pt:'8' },              l: { en:'Matches this week',  pt:'Jogos esta semana' } },
      { n: { en:'3',         pt:'3' },              l: { en:'Networks tracked',   pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'ESPN', c:'#ffb547' },
      { name:'Disney+', c:'#003cff' },
      { name:'Paramount+', c:'#c6ff3d' }
    ],
    matches: [
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'19:00', h:'Atlético-MG', a:'Caracas',     stage:'Group G', nets:[{name:'ESPN',c:'#ffb547'},{name:'Disney+',c:'#003cff'}] },
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'21:30', h:'São Paulo',  a:'LDU Quito',    stage:'Group F', nets:[{name:'ESPN',c:'#ffb547'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'19:00', h:'Fortaleza', a:'Racing',      stage:'Group H', nets:[{name:'Disney+',c:'#003cff'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'21:30', h:'Grêmio', a:'Defensa y Just.', stage:'Group D', nets:[{name:'Paramount+',c:'#c6ff3d'}] },
      { day:'Thursday, 30 Apr', dayShort:'Thu 30', hr:'19:00', h:'Cruzeiro', a:'Unión La Calera', stage:'Group B', nets:[{name:'Paramount+',c:'#c6ff3d'}] },
      { day:'Thursday, 30 Apr', dayShort:'Thu 30', hr:'21:30', h:'Corinthians', a:'América de Cali', stage:'Group C', nets:[{name:'ESPN',c:'#ffb547'},{name:'Disney+',c:'#003cff'}] }
    ],
    tableTitle: { en:'Group F (top 4)', pt:'Grupo F (top 4)' },
    standings: [
      { name:'São Paulo', gd:5, pts:9 },
      { name:'LDU Quito', gd:2, pts:7 },
      { name:'Talleres',  gd:0, pts:4 },
      { name:'Alianza Lima', gd:-7, pts:1 }
    ]
  },

  'la-liga': {
    name: 'La Liga',
    region: { en:'Spain · Top flight', pt:'Espanha · 1ª divisão' },
    crest: 'LFP',
    color: '#ff2b56',
    blurb: {
      en: 'Spanish top flight. 20 clubs, 38 matchdays, August to May. Home of Madrid, Barcelona and the rest.',
      pt: 'Primeira divisão espanhola. 20 clubes, 38 rodadas, de agosto a maio. Casa de Madrid, Barcelona e companhia.'
    },
    stats: [
      { n: { en:'MD 34', pt:'Rod 34' }, l: { en:'Current matchday',  pt:'Rodada atual' } },
      { n: { en:'20',    pt:'20' },     l: { en:'Clubs',              pt:'Clubes' } },
      { n: { en:'10',    pt:'10' },     l: { en:'Matches this week',  pt:'Jogos esta semana' } },
      { n: { en:'2',     pt:'2' },      l: { en:'Networks tracked',   pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'ESPN', c:'#ffb547' },
      { name:'Disney+', c:'#003cff' }
    ],
    matches: [
      { day:'Tonight, Mon 27 Apr', dayShort:'Mon 27', live:'HT', h:'Real Madrid', a:'Sevilla', score:'0 – 0', stage:'MD 34', nets:[{name:'Disney+',c:'#003cff'}] },
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'14:00', h:'Villarreal', a:'Getafe', stage:'MD 34', nets:[{name:'Disney+',c:'#003cff'}] },
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'16:30', h:'Athletic Club', a:'Valencia', stage:'MD 34', nets:[{name:'ESPN',c:'#ffb547'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'14:00', h:'Las Palmas', a:'Mallorca', stage:'MD 34', nets:[{name:'Disney+',c:'#003cff'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'16:30', h:'Real Sociedad', a:'Osasuna', stage:'MD 34', nets:[{name:'Disney+',c:'#003cff'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'09:00', h:'Girona', a:'Betis', stage:'MD 35', nets:[{name:'Disney+',c:'#003cff'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'12:30', h:'Atlético Madrid', a:'Real Sociedad', stage:'MD 35', nets:[{name:'ESPN',c:'#ffb547'},{name:'Disney+',c:'#003cff'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'16:00', h:'Barcelona', a:'Valladolid', stage:'MD 35', nets:[{name:'ESPN',c:'#ffb547'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'12:30', h:'Sevilla', a:'Las Palmas', stage:'MD 35', nets:[{name:'Disney+',c:'#003cff'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'16:00', h:'Real Madrid', a:'Celta Vigo', stage:'MD 35', nets:[{name:'ESPN',c:'#ffb547'},{name:'Disney+',c:'#003cff'}] }
    ],
    tableTitle: { en:'La Liga table', pt:'Classificação La Liga' },
    standings: [
      { name:'Real Madrid', gd:48, pts:78 },
      { name:'Barcelona',   gd:42, pts:73 },
      { name:'Atlético Madrid', gd:30, pts:69 },
      { name:'Athletic Club', gd:18, pts:62 },
      { name:'Real Sociedad', gd:10, pts:55 },
      { name:'Real Betis',  gd:7,  pts:51 },
      { name:'Villarreal',  gd:5,  pts:49 },
      { name:'Valencia',    gd:1,  pts:45 }
    ]
  },

  'champions-league': {
    name: 'Champions League',
    region: { en:'UEFA · Continental', pt:'UEFA · Continental' },
    crest: 'UCL',
    color: '#3a86ff',
    blurb: {
      en: 'Europe\'s elite club competition. The semi-final ties this week decide who plays in Munich for the trophy.',
      pt: 'Principal competição de clubes da Europa. As semifinais desta semana definem quem vai disputar o título em Munique.'
    },
    stats: [
      { n: { en:'SF', pt:'Semi' }, l: { en:'Current round',      pt:'Fase atual' } },
      { n: { en:'4',  pt:'4' },    l: { en:'Clubs left',         pt:'Times restantes' } },
      { n: { en:'2',  pt:'2' },    l: { en:'Matches this week',  pt:'Jogos esta semana' } },
      { n: { en:'4',  pt:'4' },    l: { en:'Networks tracked',   pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'SBT', c:'#ff0033' },
      { name:'Space', c:'#0a4cdc' },
      { name:'Max',   c:'#c6ff3d' },
      { name:'TNT',   c:'#ffb547' }
    ],
    matches: [
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'16:00', h:'PSG', a:'Arsenal', stage:'SF · 1st leg', nets:[{name:'TNT',c:'#ffb547'},{name:'Max',c:'#c6ff3d'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'16:00', h:'Barcelona', a:'Inter', stage:'SF · 1st leg', nets:[{name:'SBT',c:'#ff0033'},{name:'Space',c:'#0a4cdc'},{name:'Max',c:'#c6ff3d'}] },
      { day:'Tuesday, 06 May', dayShort:'Tue 06', hr:'16:00', h:'Inter', a:'Barcelona', stage:'SF · 2nd leg', nets:[{name:'SBT',c:'#ff0033'},{name:'Space',c:'#0a4cdc'},{name:'Max',c:'#c6ff3d'}] },
      { day:'Wednesday, 07 May', dayShort:'Wed 07', hr:'16:00', h:'Arsenal', a:'PSG', stage:'SF · 2nd leg', nets:[{name:'TNT',c:'#ffb547'},{name:'Max',c:'#c6ff3d'}] }
    ],
    standingsNote: {
      en: 'Bracket: PSG–Arsenal & Barcelona–Inter. Final on 31 May at Allianz Arena, Munich.',
      pt: 'Chaveamento: PSG–Arsenal e Barcelona–Inter. Final em 31 de maio no Allianz Arena, Munique.'
    }
  },

  'serie-a': {
    name: 'Serie A',
    region: { en:'Italy · Top flight', pt:'Itália · 1ª divisão' },
    crest: 'LSA',
    color: '#0a8e3a',
    blurb: {
      en: 'Italian top flight. 20 clubs, 38 matchdays. Tradition-rich league with Inter, Milan, Juventus, Napoli and more.',
      pt: 'Primeira divisão italiana. 20 clubes, 38 rodadas. Liga tradicionalíssima com Inter, Milan, Juventus, Napoli e companhia.'
    },
    stats: [
      { n: { en:'MD 34', pt:'Rod 34' }, l: { en:'Current matchday',  pt:'Rodada atual' } },
      { n: { en:'20',    pt:'20' },     l: { en:'Clubs',              pt:'Clubes' } },
      { n: { en:'10',    pt:'10' },     l: { en:'Matches this week',  pt:'Jogos esta semana' } },
      { n: { en:'2',     pt:'2' },      l: { en:'Networks tracked',   pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'CazéTV', c:'#c6ff3d' },
      { name:'OneFootball', c:'#ff6a00' }
    ],
    matches: [
      { day:'Tonight, Mon 27 Apr', dayShort:'Mon 27', live:'34\' LIVE', h:'Atalanta', a:'Cagliari', score:'1 – 0', stage:'MD 34', nets:[{name:'CazéTV',c:'#c6ff3d'}] },
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'15:45', h:'Napoli', a:'Bologna', stage:'MD 34', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Wednesday, 29 Apr', dayShort:'Wed 29', hr:'15:45', h:'Inter', a:'Hellas Verona', stage:'MD 34', nets:[{name:'CazéTV',c:'#c6ff3d'}] },
      { day:'Thursday, 30 Apr', dayShort:'Thu 30', hr:'15:30', h:'Juventus', a:'Lazio', stage:'MD 34', nets:[{name:'CazéTV',c:'#c6ff3d'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'10:00', h:'Genoa', a:'Lecce', stage:'MD 35', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'13:00', h:'Empoli', a:'Sassuolo', stage:'MD 35', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'15:45', h:'Fiorentina', a:'Torino', stage:'MD 35', nets:[{name:'CazéTV',c:'#c6ff3d'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'10:00', h:'Milan', a:'Roma', stage:'MD 35', nets:[{name:'CazéTV',c:'#c6ff3d'},{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'13:00', h:'Como', a:'Parma', stage:'MD 35', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'15:45', h:'Atalanta', a:'Monza', stage:'MD 35', nets:[{name:'CazéTV',c:'#c6ff3d'}] }
    ],
    tableTitle: { en:'Serie A table', pt:'Classificação Serie A' },
    standings: [
      { name:'Inter',     gd:42, pts:80 },
      { name:'Napoli',    gd:36, pts:74 },
      { name:'Atalanta',  gd:31, pts:69 },
      { name:'Juventus',  gd:18, pts:64 },
      { name:'Roma',      gd:14, pts:58 },
      { name:'Milan',     gd:9,  pts:55 },
      { name:'Lazio',     gd:7,  pts:54 },
      { name:'Bologna',   gd:5,  pts:52 }
    ]
  },

  'bundesliga': {
    name: 'Bundesliga',
    region: { en:'Germany · Top flight', pt:'Alemanha · 1ª divisão' },
    crest: 'BUN',
    color: '#d22020',
    blurb: {
      en: 'German top flight. 18 clubs, 34 matchdays. Bayern, Dortmund, Leverkusen and Saturday afternoon kickoffs.',
      pt: 'Primeira divisão alemã. 18 clubes, 34 rodadas. Bayern, Dortmund, Leverkusen e os clássicos jogos de sábado à tarde.'
    },
    stats: [
      { n: { en:'MD 31', pt:'Rod 31' }, l: { en:'Current matchday',  pt:'Rodada atual' } },
      { n: { en:'18',    pt:'18' },     l: { en:'Clubs',              pt:'Clubes' } },
      { n: { en:'9',     pt:'9' },      l: { en:'Matches this week',  pt:'Jogos esta semana' } },
      { n: { en:'2',     pt:'2' },      l: { en:'Networks tracked',   pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'OneFootball', c:'#ff6a00' },
      { name:'CazéTV', c:'#c6ff3d' }
    ],
    matches: [
      { day:'Tonight, Mon 27 Apr', dayShort:'Mon 27', live:'82\' LIVE', h:'Leverkusen', a:'Stuttgart', score:'3 – 2', stage:'MD 31', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Friday, 01 May', dayShort:'Fri 01', hr:'16:30', h:'Dortmund', a:'Bayern', stage:'MD 32', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'10:30', h:'Wolfsburg', a:'Augsburg', stage:'MD 32', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'10:30', h:'Hoffenheim', a:'Mainz', stage:'MD 32', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'10:30', h:'Heidenheim', a:'Bochum', stage:'MD 32', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'13:30', h:'Frankfurt', a:'Werder Bremen', stage:'MD 32', nets:[{name:'CazéTV',c:'#c6ff3d'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'10:30', h:'Union Berlin', a:'Köln', stage:'MD 32', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'12:30', h:'Freiburg', a:'M\'gladbach', stage:'MD 32', nets:[{name:'OneFootball',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'14:30', h:'St. Pauli', a:'Leipzig', stage:'MD 32', nets:[{name:'OneFootball',c:'#ff6a00'}] }
    ],
    tableTitle: { en:'Bundesliga table', pt:'Classificação Bundesliga' },
    standings: [
      { name:'Bayern',     gd:54, pts:74 },
      { name:'Leverkusen', gd:40, pts:66 },
      { name:'Leipzig',    gd:22, pts:58 },
      { name:'Dortmund',   gd:17, pts:53 },
      { name:'Frankfurt',  gd:14, pts:51 },
      { name:'Stuttgart',  gd:13, pts:49 },
      { name:'Mainz',      gd:6,  pts:46 },
      { name:'Freiburg',   gd:0,  pts:42 }
    ]
  },

  'ligue-1': {
    name: 'Ligue 1',
    region: { en:'France · Top flight', pt:'França · 1ª divisão' },
    crest: 'LFP',
    color: '#9b5dff',
    blurb: {
      en: 'French top flight. 18 clubs, 34 matchdays. PSG, Marseille, Monaco and rising provincial sides.',
      pt: 'Primeira divisão francesa. 18 clubes, 34 rodadas. PSG, Marseille, Monaco e equipes regionais em ascensão.'
    },
    stats: [
      { n: { en:'MD 32', pt:'Rod 32' }, l: { en:'Current matchday',  pt:'Rodada atual' } },
      { n: { en:'18',    pt:'18' },     l: { en:'Clubs',              pt:'Clubes' } },
      { n: { en:'9',     pt:'9' },      l: { en:'Matches this week',  pt:'Jogos esta semana' } },
      { n: { en:'2',     pt:'2' },      l: { en:'Networks tracked',   pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'CazéTV', c:'#c6ff3d' },
      { name:'Xsports', c:'#ff6a00' }
    ],
    matches: [
      { day:'Friday, 01 May', dayShort:'Fri 01', hr:'15:45', h:'Lille', a:'Nantes', stage:'MD 32', nets:[{name:'Xsports',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'12:00', h:'Reims', a:'Toulouse', stage:'MD 32', nets:[{name:'Xsports',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'14:00', h:'Brest', a:'Strasbourg', stage:'MD 32', nets:[{name:'Xsports',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'16:00', h:'Marseille', a:'Lyon', stage:'MD 32', nets:[{name:'CazéTV',c:'#c6ff3d'},{name:'Xsports',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'08:00', h:'Le Havre', a:'Auxerre', stage:'MD 32', nets:[{name:'Xsports',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'10:00', h:'Angers', a:'Nice', stage:'MD 32', nets:[{name:'Xsports',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'10:00', h:'Montpellier', a:'Saint-Étienne', stage:'MD 32', nets:[{name:'Xsports',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'12:00', h:'Rennes', a:'Lens', stage:'MD 32', nets:[{name:'Xsports',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'15:45', h:'PSG', a:'Monaco', stage:'MD 32', nets:[{name:'CazéTV',c:'#c6ff3d'},{name:'Xsports',c:'#ff6a00'}] }
    ],
    tableTitle: { en:'Ligue 1 table', pt:'Classificação Ligue 1' },
    standings: [
      { name:'PSG',        gd:52, pts:80 },
      { name:'Monaco',     gd:24, pts:62 },
      { name:'Marseille',  gd:18, pts:58 },
      { name:'Lille',      gd:14, pts:55 },
      { name:'Nice',       gd:10, pts:51 },
      { name:'Lyon',       gd:6,  pts:48 },
      { name:'Lens',       gd:3,  pts:45 },
      { name:'Strasbourg', gd:0,  pts:42 }
    ]
  },

  'primeira-liga': {
    name: 'Primeira Liga',
    region: { en:'Portugal · Top flight', pt:'Portugal · 1ª divisão' },
    crest: 'LPF',
    color: '#f25c5c',
    blurb: {
      en: 'Portuguese top flight. 18 clubs, 34 matchdays. The eternal three — Benfica, Porto, Sporting — plus Braga and the rest.',
      pt: 'Primeira divisão portuguesa. 18 clubes, 34 rodadas. Os três eternos — Benfica, Porto, Sporting — mais Braga e companhia.'
    },
    stats: [
      { n: { en:'MD 31', pt:'Rod 31' }, l: { en:'Current matchday',  pt:'Rodada atual' } },
      { n: { en:'18',    pt:'18' },     l: { en:'Clubs',              pt:'Clubes' } },
      { n: { en:'9',     pt:'9' },      l: { en:'Matches this week',  pt:'Jogos esta semana' } },
      { n: { en:'3',     pt:'3' },      l: { en:'Networks tracked',   pt:'Canais cobertos' } }
    ],
    networks: [
      { name:'ESPN', c:'#ffb547' },
      { name:'Disney+', c:'#003cff' },
      { name:'GOAT', c:'#ff6a00' }
    ],
    matches: [
      { day:'Tuesday, 28 Apr', dayShort:'Tue 28', hr:'16:30', h:'Porto', a:'Braga', stage:'MD 31', nets:[{name:'ESPN',c:'#ffb547'},{name:'Disney+',c:'#003cff'}] },
      { day:'Friday, 01 May', dayShort:'Fri 01', hr:'15:15', h:'Estoril', a:'Famalicão', stage:'MD 32', nets:[{name:'GOAT',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'11:30', h:'Vitória SC', a:'Casa Pia', stage:'MD 32', nets:[{name:'GOAT',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'13:30', h:'Boavista', a:'Arouca', stage:'MD 32', nets:[{name:'GOAT',c:'#ff6a00'}] },
      { day:'Saturday, 02 May', dayShort:'Sat 02', hr:'17:30', h:'Sporting CP', a:'Benfica', stage:'MD 32', nets:[{name:'ESPN',c:'#ffb547'},{name:'Disney+',c:'#003cff'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'11:30', h:'Gil Vicente', a:'Rio Ave', stage:'MD 32', nets:[{name:'GOAT',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'13:30', h:'Moreirense', a:'Estrela Amadora', stage:'MD 32', nets:[{name:'GOAT',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'15:30', h:'AVS', a:'Nacional', stage:'MD 32', nets:[{name:'GOAT',c:'#ff6a00'}] },
      { day:'Sunday, 03 May', dayShort:'Sun 03', hr:'17:30', h:'Porto', a:'Farense', stage:'MD 32', nets:[{name:'Disney+',c:'#003cff'}] }
    ],
    tableTitle: { en:'Primeira Liga table', pt:'Classificação Primeira Liga' },
    standings: [
      { name:'Sporting CP', gd:56, pts:78 },
      { name:'Benfica',     gd:48, pts:72 },
      { name:'Porto',       gd:34, pts:64 },
      { name:'Braga',       gd:18, pts:56 },
      { name:'Vitória SC',  gd:6,  pts:46 },
      { name:'Famalicão',   gd:2,  pts:42 },
      { name:'Estoril',     gd:-2, pts:40 },
      { name:'Moreirense',  gd:-4, pts:37 }
    ]
  }

};
