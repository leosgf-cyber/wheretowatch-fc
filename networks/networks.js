/* Slug → display name + brand color + kind (bilingual).
 * Slugs match the file names in this directory.
 * The display `name` MUST match exactly the broadcaster strings used in
 * ../leagues/data.js so the reverse-lookup can find matches.
 */
window.NETWORKS = {
  'caze-tv':       { name:'CazéTV',      c:'#c6ff3d', kind:{ en:'Streaming · Free',           pt:'Streaming · Gratuito' } },
  'disney-plus':   { name:'Disney+',     c:'#003cff', kind:{ en:'Streaming · Subscription',   pt:'Streaming · Assinatura' } },
  'espn':          { name:'ESPN',        c:'#ffb547', kind:{ en:'Cable · Pay TV',             pt:'Cabo · TV paga' } },
  'globo':         { name:'Globo',       c:'#0a4cdc', kind:{ en:'Free-to-air · Brazil',       pt:'TV aberta · Brasil' } },
  'goat':          { name:'GOAT',        c:'#ff6a00', kind:{ en:'Streaming · Free',           pt:'Streaming · Gratuito' } },
  'max':           { name:'Max',         c:'#c6ff3d', kind:{ en:'Streaming · Subscription',   pt:'Streaming · Assinatura' } },
  'onefootball':   { name:'OneFootball', c:'#ff6a00', kind:{ en:'Streaming · Free',           pt:'Streaming · Gratuito' } },
  'paramount-plus':{ name:'Paramount+',  c:'#c6ff3d', kind:{ en:'Streaming · Subscription',   pt:'Streaming · Assinatura' } },
  'premiere':      { name:'Premiere',    c:'#ff0033', kind:{ en:'Pay-per-view · Brazil',      pt:'Pay-per-view · Brasil' } },
  'prime-video':   { name:'Prime Video', c:'#00a8e1', kind:{ en:'Streaming · Subscription',   pt:'Streaming · Assinatura' } },
  'sbt':           { name:'SBT',         c:'#ff0033', kind:{ en:'Free-to-air · Brazil',       pt:'TV aberta · Brasil' } },
  'space':         { name:'Space',       c:'#0a4cdc', kind:{ en:'Cable · Pay TV',             pt:'Cabo · TV paga' } },
  'sportv':        { name:'SporTV',      c:'#ff0033', kind:{ en:'Cable · Pay TV',             pt:'Cabo · TV paga' } },
  'sportynet':     { name:'SportyNet',   c:'#ff6a00', kind:{ en:'Streaming · Subscription',   pt:'Streaming · Assinatura' } },
  'tnt':           { name:'TNT',         c:'#ffb547', kind:{ en:'Cable · Pay TV',             pt:'Cabo · TV paga' } },
  'xsports':       { name:'Xsports',     c:'#ff6a00', kind:{ en:'Streaming · Free',           pt:'Streaming · Gratuito' } }
};
