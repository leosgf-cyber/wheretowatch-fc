/* WhereToWatch FC — i18n
 *
 * Default lang = 'pt'. Toggle persists in localStorage('w2w-lang').
 *
 * Three levels of translation:
 *   1. UI strings — element has data-i18n="key", looked up in STR[lang][key].
 *   2. Long static text — sibling elements with data-lang="pt" / data-lang="en";
 *      the inactive one is hidden via [hidden] attribute.
 *   3. Dynamic data (data.js) — fields are objects {en, pt}; read with I18N.pick().
 *      Day strings + stage labels translated via I18N.day() / I18N.stage().
 */
window.I18N = (function(){

  const STR = {
    pt: {
      // header / nav
      'nav.home':            'Início',
      'nav.live':            'Ao vivo',
      'nav.calendar':        'Calendário',
      'nav.networks':        'Canais',
      'search.placeholder':  'Buscar competições, jogos, canais…',

      // hero (main page)
      'hero.eyebrow':        'Próximas rodadas · BRT',
      'hero.title.html':     'Encontre onde assistir <em>suas ligas favoritas</em>, em um só lugar.',
      'hero.subtitle':       'Brasileirão, Champions, La Liga, Serie A, Bundesliga e mais — tudo num único guia.',
      'stats.leagues':       'Ligas',
      'stats.matches':       'Jogos',
      'stats.networks':      'Canais',
      'stats.updated':       'Atualizado',

      // league cards (main page)
      'card.viewcomp':       'Ver competição →',
      'card.status.season':  'Em curso',
      'card.status.r16':     'Oitavas',
      'card.status.qf':      'Quartas',
      'card.status.sf':      'Semifinal',
      'card.status.group':   'Fase de grupos',
      'card.status.bracket': 'Mata-mata',
      'card.broadcasters':   'Transmissão',
      'card.next':           'Próximos jogos',

      // sidebar
      'sidebar.topnetworks':       'Principais canais',
      'sidebar.topnetworks.more':  'Todos →',
      'sidebar.legend':            'Legenda',
      'sidebar.legend.fta':        'Aberto / streaming gratuito',
      'sidebar.legend.live':       'Ao vivo agora',
      'sidebar.legend.ppv':        'Pay-per-view',
      'sidebar.matches':           'matches',
      'sidebar.match':             'match',
      'sidebar.jogos':             'jogos',
      'sidebar.jogo':              'jogo',

      // breadcrumbs / back
      'crumbs.home':         'Início',
      'crumbs.allleagues':   'Todas as ligas',
      'crumbs.networks':     'Canais',
      'back.toleagues':      '← Voltar para todas as ligas',
      'back.tonetworks':     '← Todos os canais',

      // league subpage
      'lg.matchcount.tpl':   '{n} jogos',
      'lg.matchcount.one':   '1 jogo',
      'lg.matches.label':    'jogos',
      'lg.match.label':      'jogo',
      'lg.standings.title':  'Classificação',
      'lg.standings.bracket':'Competição em formato mata-mata.',

      // league stats labels (used dynamically — mirrored in data.js per-league;
      // these are fallbacks)
      'stat.matchday':       'Rodada atual',
      'stat.clubs':          'Clubes',
      'stat.matchesweek':    'Jogos esta semana',
      'stat.networks':       'Canais cobertos',
      'stat.stage':          'Fase atual',
      'stat.teams':          'Times',
      'stat.teams.left':     'Times restantes',
      'stat.legs':           'Mãos',

      // network index page
      'net.index.eyebrow':   'Canais · Transmissoras',
      'net.index.title.html':'Todos os canais e plataformas <em>cobertos</em>, em um só lugar.',
      'net.index.subtitle':  'Escolha um canal para ver todos os jogos que ele transmite nas ligas que cobrimos — da TV aberta ao streaming.',
      'net.filter.all':      'Todos',
      'net.filter.streaming':'Streaming',
      'net.filter.fta':      'TV aberta',
      'net.filter.cable':    'Cabo / TV paga',
      'net.filter.ppv':      'Pay-per-view',
      'net.card.matches':    'jogos',
      'net.card.leagues':    'ligas',
      'net.about.title':     'Sobre esta lista',
      'net.about.body':      'Os canais exibidos são os que estão transmitindo pelo menos um jogo nas ligas que cobrimos. As contagens atualizam conforme a programação muda.',
      'net.about.cta.text':  'Viu algo errado ou faltando? Ajude a corrigir.',
      'net.about.cta.link':  'Enviar correção →',

      // network detail page
      'net.detail.back':            '← Todos os canais',
      'net.detail.othernets':       'Outros canais',
      'net.detail.stats.matches':   'Jogos cobertos',
      'net.detail.stats.comps':     'Competições',
      'net.detail.stats.kind':      'Distribuição',
      'net.detail.blurb.tpl':       'Atualmente transmitindo {n} {jogo} em {c} {competicao}. Disputa de grupos, mata-mata e rodadas dos campeonatos — tudo num só lugar.',
      'net.detail.blurb.empty':     'Nenhum jogo atribuído a {name} no momento. Volte mais perto da próxima rodada.',
      'net.detail.empty.body':      'Sem jogos programados para {name} na janela atual. Tente outro canal ou volte em breve.',
      'net.detail.viewleague':      'Ver →',

      // about page
      'about.eyebrow':       'Sobre o projeto',

      // privacy page
      'privacy.eyebrow':     'Legal · Privacidade',

      // contact page
      'contact.eyebrow':     'Entre em contato',

      // footer
      'footer.tagline':      '© 2026 WhereToWatch FC · Guia independente de transmissões',
      'footer.about':        'Sobre',
      'footer.networks':     'Canais',
      'footer.privacy':      'Privacidade',
      'footer.contact':      'Contato',

      // misc
      'live.label':          'AO VIVO',
      'tonight':             'Hoje',
      'today':               'Hoje',
      'tomorrow':            'Amanhã'
    },

    en: {
      'nav.home':            'Home',
      'nav.live':            'Live',
      'nav.calendar':        'Calendar',
      'nav.networks':        'Networks',
      'search.placeholder':  'Search competitions, fixtures, networks…',

      'hero.eyebrow':        'Upcoming matchdays · BRT',
      'hero.title.html':     'Find where to watch <em>your favorite leagues</em>, in one place.',
      'hero.subtitle':       'Brasileirão, Champions League, La Liga, Serie A, Bundesliga and more — all in one guide.',
      'stats.leagues':       'Leagues',
      'stats.matches':       'Matches',
      'stats.networks':      'Networks',
      'stats.updated':       'Updated',

      'card.viewcomp':       'View competition →',
      'card.status.season':  'In season',
      'card.status.r16':     'Round of 16',
      'card.status.qf':      'Quarter-finals',
      'card.status.sf':      'Semi-finals',
      'card.status.group':   'Group stage',
      'card.status.bracket': 'Knockout',
      'card.broadcasters':   'Where to watch',
      'card.next':           'Next fixtures',

      'sidebar.topnetworks':       'Top networks',
      'sidebar.topnetworks.more':  'All →',
      'sidebar.legend':            'Legend',
      'sidebar.legend.fta':        'Free-to-air / streaming',
      'sidebar.legend.live':       'Currently live',
      'sidebar.legend.ppv':        'Pay-per-view',
      'sidebar.matches':           'matches',
      'sidebar.match':             'match',
      'sidebar.jogos':             'matches',
      'sidebar.jogo':              'match',

      'crumbs.home':         'Home',
      'crumbs.allleagues':   'All leagues',
      'crumbs.networks':     'Networks',
      'back.toleagues':      '← Back to all leagues',
      'back.tonetworks':     '← All networks',

      'lg.matchcount.tpl':   '{n} matches',
      'lg.matchcount.one':   '1 match',
      'lg.matches.label':    'matches',
      'lg.match.label':      'match',
      'lg.standings.title':  'Standings',
      'lg.standings.bracket':'Bracket-based competition.',

      'stat.matchday':       'Current matchday',
      'stat.clubs':          'Clubs',
      'stat.matchesweek':    'Matches this week',
      'stat.networks':       'Networks tracked',
      'stat.stage':          'Current stage',
      'stat.teams':          'Teams',
      'stat.teams.left':     'Teams left',
      'stat.legs':           'Legs',

      'net.index.eyebrow':   'Networks · Broadcasters',
      'net.index.title.html':'Every channel and streamer <em>covered</em>, in one place.',
      'net.index.subtitle':  'Pick a broadcaster to see every match it\'s airing across the leagues we track — from free-to-air giants to streaming-only deals.',
      'net.filter.all':      'All',
      'net.filter.streaming':'Streaming',
      'net.filter.fta':      'Free-to-air',
      'net.filter.cable':    'Cable / Pay TV',
      'net.filter.ppv':      'Pay-per-view',
      'net.card.matches':    'matches',
      'net.card.leagues':    'leagues',
      'net.about.title':     'About this list',
      'net.about.body':      'The networks shown are those currently broadcasting at least one fixture in the leagues we track. Counts update as the schedule shifts.',
      'net.about.cta.text':  'Spotted one missing or wrong? Help us fix it.',
      'net.about.cta.link':  'Send a correction →',

      'net.detail.back':            '← All networks',
      'net.detail.othernets':       'Other networks',
      'net.detail.stats.matches':   'Matches tracked',
      'net.detail.stats.comps':     'Competitions',
      'net.detail.stats.kind':      'Distribution',
      'net.detail.blurb.tpl':       'Currently broadcasting {n} {jogo} across {c} {competicao}. Group-stage drama, knockout rounds and weekend league fixtures — all in one place.',
      'net.detail.blurb.empty':     'No upcoming matches assigned to {name} right now. Check back closer to the next matchday.',
      'net.detail.empty.body':      'Nothing scheduled for {name} in the current window. Try another network or check back soon.',
      'net.detail.viewleague':      'View →',

      'about.eyebrow':       'About the project',
      'privacy.eyebrow':     'Legal · Privacy',
      'contact.eyebrow':     'Get in touch',

      'footer.tagline':      '© 2026 WhereToWatch FC · Independent broadcast guide',
      'footer.about':        'About',
      'footer.networks':     'Networks',
      'footer.privacy':      'Privacy',
      'footer.contact':      'Contact',

      'live.label':          'LIVE',
      'tonight':             'Tonight',
      'today':               'Today',
      'tomorrow':            'Tomorrow'
    }
  };

  /* Day-of-week and month abbreviation maps for translating m.day / m.dayShort
   * strings that come from data.js (kept in EN canonical form there). */
  const DAY_PT = {
    Mon:'Seg', Tue:'Ter', Wed:'Qua', Thu:'Qui', Fri:'Sex', Sat:'Sáb', Sun:'Dom',
    Monday:'Segunda-feira', Tuesday:'Terça-feira', Wednesday:'Quarta-feira',
    Thursday:'Quinta-feira', Friday:'Sexta-feira', Saturday:'Sábado', Sunday:'Domingo',
    Tonight:'Hoje', Today:'Hoje', Tomorrow:'Amanhã'
  };
  const MON_PT = {
    Jan:'jan', Feb:'fev', Mar:'mar', Apr:'abr', May:'mai', Jun:'jun',
    Jul:'jul', Aug:'ago', Sep:'set', Oct:'out', Nov:'nov', Dec:'dez',
    January:'janeiro', February:'fevereiro', March:'março', April:'abril',
    June:'junho', July:'julho', August:'agosto', September:'setembro',
    October:'outubro', November:'novembro', December:'dezembro'
  };

  const STAGE_PT = [
    [/^MD (\d+)$/,            (m) => `Rod ${m[1]}`],
    [/^Group ([A-H])$/,       (m) => `Grupo ${m[1]}`],
    [/^R16 · 1st leg$/,       () => 'Oitavas · ida'],
    [/^R16 · 2nd leg$/,       () => 'Oitavas · volta'],
    [/^R16$/,                 () => 'Oitavas'],
    [/^QF · 1st leg$/,        () => 'Quartas · ida'],
    [/^QF · 2nd leg$/,        () => 'Quartas · volta'],
    [/^QF$/,                  () => 'Quartas'],
    [/^SF · 1st leg$/,        () => 'Semi · ida'],
    [/^SF · 2nd leg$/,        () => 'Semi · volta'],
    [/^SF$/,                  () => 'Semi'],
    [/^Final · 1st leg$/,     () => 'Final · ida'],
    [/^Final · 2nd leg$/,     () => 'Final · volta'],
    [/^Final$/,               () => 'Final']
  ];

  const lang = localStorage.getItem('w2w-lang') || 'pt';

  function t(k){
    return (STR[lang] && STR[lang][k]) || (STR.en && STR.en[k]) || k;
  }

  function pick(v){
    if (v && typeof v === 'object' && (v.en !== undefined || v.pt !== undefined)){
      return v[lang] !== undefined ? v[lang] : v.en;
    }
    return v;
  }

  function day(s){
    if (!s || lang === 'en') return s;
    let out = String(s);
    Object.keys(DAY_PT).forEach(en => {
      out = out.replace(new RegExp('\\b' + en + '\\b', 'g'), DAY_PT[en]);
    });
    Object.keys(MON_PT).forEach(en => {
      out = out.replace(new RegExp('\\b' + en + '\\b'), MON_PT[en]);
    });
    return out;
  }

  function stage(s){
    if (!s || lang === 'en') return s;
    for (let i = 0; i < STAGE_PT.length; i++){
      const m = String(s).match(STAGE_PT[i][0]);
      if (m) return STAGE_PT[i][1](m);
    }
    return s;
  }

  function set(l){
    if (l !== 'pt' && l !== 'en') return;
    localStorage.setItem('w2w-lang', l);
    location.reload();
  }

  function apply(){
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!key) return;
      const v = t(key);
      if (key.endsWith('.html') || el.hasAttribute('data-i18n-html')){
        el.innerHTML = v;
      } else {
        el.textContent = v;
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    document.querySelectorAll('[data-lang]').forEach(el => {
      el.hidden = el.dataset.lang !== lang;
    });

    document.querySelectorAll('[data-lang-set]').forEach(b => {
      if (b.dataset.langSet === lang) b.classList.add('active');
      else b.classList.remove('active');
      if (!b._w2wBound){
        b._w2wBound = true;
        b.addEventListener('click', () => set(b.dataset.langSet));
      }
    });
  }

  return { lang, t, pick, day, stage, set, apply };
})();
