# WhereToWatch FC — Automação de Dados (Schedule, Canais, Placar, Tabela)

## Context

Hoje todos os dados do site (`leagues/data.js` + `networks/networks.js`) são editados à mão. Isso é insustentável: 9 ligas, ~140 jogos/semana, 16 canais — qualquer rodada exige dezenas de edições manuais. O pivot é tornar o site auto-atualizável **sem você ter que abrir um editor de código a cada rodada**.

Decisões fechadas com o usuário:

| Decisão | Escolha |
|---|---|
| Sheet | Só a tabela de canais (broadcaster mapping). Calendário, placar e classificação vêm de API. |
| Hospedagem | **Cloudflare Pages + Workers + KV** |
| Roadmap | Incremental: **Fase 1 diário ($0/mês) → Fase 2 quase-real 15 min ($0/mês) → Fase 3 real-time 1 min ($19/mês)** |
| API de dados | API-Football (RapidAPI) — único provedor com cobertura completa das 9 ligas, incluindo Copa do Brasil e Sulamericana |
| Idioma do output | Mantém schema bilíngue do `data.js` atual (`{en, pt}`) |

Por que separei "canais" como o único item manual: nenhuma API pública consolida quem-transmite-qual-jogo de forma confiável. Sites de broadcasters mudam de schema toda hora. Um Sheet onde você (ou um colab) escreve "Flamengo×Fluminense → Globo+Premiere" leva 30 segundos por rodada e é 100× mais confiável que scraping.

---

## Arquitetura final

```
┌─────────────────────┐         ┌──────────────────────┐
│  Google Sheets      │         │  API-Football        │
│  (broadcaster map)  │         │  (schedule + score   │
│  você preenche      │         │   + standings)       │
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           │  Sheets API                   │  HTTPS
           │  (read-only)                  │
           ▼                               ▼
┌─────────────────────────────────────────────────────┐
│  Cloudflare Worker (cron)                           │
│  1. Fetch fixtures + scores + standings da API      │
│  2. Fetch broadcaster mapping do Sheet              │
│  3. Merge → gera objeto LEAGUES + NETWORKS          │
│  4. Escreve em KV: chave "data:current"             │
└──────────┬──────────────────────────────────────────┘
           │
           │  KV read
           ▼
┌─────────────────────────────────────────────────────┐
│  Cloudflare Worker (HTTP endpoint)                  │
│  GET /api/data.json → lê KV, devolve com cache 60s  │
└──────────┬──────────────────────────────────────────┘
           │
           │  fetch() do navegador
           ▼
┌─────────────────────────────────────────────────────┐
│  Site estático no Cloudflare Pages                  │
│  WhereToWatch FC.html, leagues/*.html, networks/*   │
│  Carrega data.json em vez de data.js inline         │
└─────────────────────────────────────────────────────┘
```

---

## Fontes de dados

### 1. API-Football (RapidAPI) — fixtures, scores, standings

- **Endpoints relevantes:**
  - `/fixtures?league={id}&season=2026` — calendário + placar
  - `/standings?league={id}&season=2026` — tabela
  - `/fixtures/live?all=true` (Fase 3) — placar em tempo real
- **League IDs** (a confirmar no painel API-Football antes de codar; valores típicos):
  - 71 = Brasileirão Série A · 73 = Copa do Brasil · 11 = Sulamericana
  - 140 = La Liga · 2 = Champions · 135 = Serie A · 78 = Bundesliga · 61 = Ligue 1 · 94 = Primeira Liga
- **Auth:** API key em `X-RapidAPI-Key` header. Guardar em `wrangler secret`.
- **Rate limit:** Free tier 100/dia (suficiente pra Fase 1 diária); Pro $19/mês 7.500/dia (suficiente pra Fase 3 real-time).

### 2. Google Sheets — broadcaster mapping

**Tabs:**

**`broadcasters`** (catálogo dos canais — substitui `networks/networks.js`):
| slug | name | brand_color | kind_en | kind_pt |
|---|---|---|---|---|
| globo | Globo | #0a4cdc | Free-to-air · Brazil | TV aberta · Brasil |
| caze-tv | CazéTV | #c6ff3d | Streaming · Free | Streaming · Gratuito |

**`fixtures`** (mapping jogo → canais — preenchido por rodada):
| match_key | networks | notes |
|---|---|---|
| 2026-04-29_brasileirao_flamengo-fluminense | Globo, Premiere | |
| 2026-04-30_champions-league_psg-arsenal | TNT, Max | |

`match_key` é gerado deterministicamente a partir dos dados da API (`{date}_{league_slug}_{home-slug}-{away-slug}`) — o Worker calcula a mesma chave dos dois lados pra fazer o merge.

**`overrides`** (opcional, Fase 2+ — caso a API esteja errada):
| match_key | field | value |
|---|---|---|
| 2026-05-01_la-liga_real-madrid-celta-vigo | hr | 17:00 |

**Acesso:** Worker usa Google Sheets API com Service Account (service account email recebe permissão de leitura no Sheet). Credenciais como `wrangler secret`.

---

## Schema do `data.json` gerado

Mantém compatibilidade com o `data.js` atual (formato bilíngue `{en, pt}`) pra **não exigir mudança nas páginas**. Apenas troca a fonte: em vez de `<script src="leagues/data.js">` que define `window.LEAGUES`, vamos pra:

```html
<script src="/api/loader.js"></script>
<!-- loader.js fetcha /api/data.json, atribui a window.LEAGUES e window.NETWORKS,
     e dispara um custom event 'w2w:data-ready' que o boot script escuta -->
```

Os boot scripts existentes (`leagues/_template.html`, `networks/_template.html`, `networks/index.html`, `WhereToWatch FC.html`) ficam quase idênticos — só envolvem o trecho de render num listener desse evento.

`data.json` shape:

```json
{
  "generated_at": "2026-04-27T03:00:00Z",
  "leagues": {
    "brasileirao": {
      "name": "Campeonato Brasileiro",
      "region": { "en": "...", "pt": "..." },
      "color": "#f7c52b",
      "blurb": { "en": "...", "pt": "..." },
      "stats": [...],
      "matches": [
        { "day": "Tue, 28 Apr", "dayShort": "Tue 28", "hr": "19:00",
          "h": "Palmeiras", "a": "Botafogo", "stage": "MD 5",
          "nets": [{ "name": "Prime Video", "c": "#00a8e1" }],
          "match_key": "2026-04-28_brasileirao_palmeiras-botafogo",
          "score": null, "live": null }
      ],
      "tableTitle": { "en": "...", "pt": "..." },
      "standings": [...]
    }
  },
  "networks": { /* mesmo shape do networks.js atual */ }
}
```

---

## Cloudflare Worker — pseudocódigo

```js
// worker.js
const LEAGUES = [
  { slug:'brasileirao',     apiId:71,  season:2026 },
  { slug:'copa-do-brasil',  apiId:73,  season:2026 },
  // ... 9 entradas
];

export default {
  // cron — Fase 1: "0 6 * * *" (03:00 BRT diário)
  async scheduled(event, env, ctx) {
    const data = { generated_at: new Date().toISOString(), leagues: {}, networks: {} };

    // 1. Fetch broadcaster catalog do Sheet
    const broadcasters = await fetchSheet(env, 'broadcasters');
    data.networks = buildNetworksObject(broadcasters);

    // 2. Fetch fixtures por jogo do Sheet (broadcaster mapping)
    const fixtureBroadcasters = await fetchSheet(env, 'fixtures');
    const broadcasterByKey = indexBy(fixtureBroadcasters, 'match_key');

    // 3. Pra cada liga, fetch API
    for (const L of LEAGUES) {
      const [fixtures, standings] = await Promise.all([
        apiCall(env, `/fixtures?league=${L.apiId}&season=${L.season}`),
        apiCall(env, `/standings?league=${L.apiId}&season=${L.season}`)
      ]);

      data.leagues[L.slug] = transformLeague(L, fixtures, standings, broadcasterByKey, broadcasters);
    }

    // 4. Grava no KV
    await env.W2W_KV.put('data:current', JSON.stringify(data), { expirationTtl: 86400 });
  },

  // HTTP — serve /api/data.json
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/data.json') {
      const data = await env.W2W_KV.get('data:current');
      return new Response(data, {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=60',
          'access-control-allow-origin': '*'
        }
      });
    }
    return new Response('Not found', { status: 404 });
  }
};
```

`transformLeague()` é onde mora a lógica de:
- Filtrar fixtures pra próxima janela (digamos, próximas 2 semanas + 1 semana passada)
- Calcular `match_key` deterministicamente e fazer lookup em `broadcasterByKey`
- Converter `stage` da API para o formato canônico EN do site (`"Round of 16 - 1st Leg"` → `"R16 · 1st leg"`) — `I18N.stage()` já traduz esse formato
- Construir os campos bilíngues estáticos (`region`, `blurb`, `tableTitle`) — esses ficam **hardcoded num arquivo de constantes** (`league-meta.js` no Worker), porque não mudam de rodada pra rodada
- Calcular `stats` derivadas (matchday atual, jogos da semana, contagem de canais)

---

## Mudanças no site

### Novo arquivo `loader.js` (raiz, servido pelo Worker)

```js
(async function(){
  const r = await fetch('/api/data.json', { cache:'no-cache' });
  const j = await r.json();
  window.LEAGUES = j.leagues;
  window.NETWORKS = j.networks;
  document.dispatchEvent(new CustomEvent('w2w:data-ready'));
})();
```

### Adapt nos boot scripts

Em `leagues/_template.html`, `networks/_template.html`, `networks/index.html` e `WhereToWatch FC.html`:

- Trocar `<script src="data.js">` / `<script src="../leagues/data.js">` por `<script src="/loader.js"></script>`
- Envolver o boot em listener:
  ```js
  document.addEventListener('w2w:data-ready', () => {
    I18N.apply();
    // ... resto do boot existente
  });
  ```

`data.js` e `networks.js` viram **fallback de desenvolvimento** (servidos só se o `data.json` falhar). Ou são removidos depois que o pipeline estiver estável.

---

## Roadmap incremental

### Fase 1 — MVP automatizado (semana 1)

**Objetivo:** site fica fresco diariamente sem você editar código.

**Itens:**
- [ ] Conta Cloudflare Pages criada; deploy do site estático atual
- [ ] Conta API-Football criada (free tier inicial); chave guardada como secret
- [ ] Google Sheet criado com 2 abas (`broadcasters`, `fixtures`); compartilhado read com Service Account
- [ ] Service Account do Google Cloud criado; JSON do credential como secret
- [ ] Worker deployado: cron `0 6 * * *` (UTC = 03:00 BRT) + endpoint `/api/data.json`
- [ ] `loader.js` adicionado ao site
- [ ] Páginas migradas para usar `loader.js` em vez de `data.js`
- [ ] `data.js` mantido como fallback (deletar depois)

**Resultado:** rodada nova entra → você adiciona 10 linhas no Sheet `fixtures` → no dia seguinte às 03:00 o site se atualiza sozinho. Calendário, classificações e canais sempre frescos. Placar = resultado final do último jogo encerrado.

**Custo: $0/mês.** Free tier de Cloudflare + free tier da API-Football aguentam.

### Fase 2 — Quase-real-time (semana 2-3)

**Objetivo:** placar com delay de até 15 min durante janelas de jogo.

**Itens:**
- [ ] Worker passa a ler do próprio JSON quais são as próximas janelas de jogo (datetime do início + 2h após o último kickoff do dia)
- [ ] Adiciona segundo cron `*/15 * * * *` que **só dispara o fetch se** estiver dentro de uma janela ativa
- [ ] No fetch durante janela, atualiza só `match.score` e `match.live` (não refaz o JSON inteiro — patch)
- [ ] UI já tem `.is-live` styling pronto; só precisa começar a receber `m.live = "67' AO VIVO"` da API

**Custo: $0/mês.** Free tier API-Football (100 req/dia) ainda comporta — durante janelas, ~30 calls.

### Fase 3 — Real-time 1 minuto (mês 2+ ou quando AdSense pagar)

**Objetivo:** placar minute-a-minute durante os jogos.

**Itens:**
- [ ] Upgrade pra plano Pro da API-Football ($19/mês)
- [ ] Cron passa pra `* * * * *` durante janelas
- [ ] Endpoint do Worker reduz cache pra `max-age=15`
- [ ] Site ganha auto-refresh dos placares (poll `/api/data.json` a cada 30s na home; só durante janelas)

**Custo: $19/mês.**

---

## Arquivos críticos a criar / modificar

| Arquivo | Ação | Propósito |
|---|---|---|
| `worker/wrangler.toml` | criar | Config do Worker (KV binding, cron triggers, secrets) |
| `worker/src/index.js` | criar | Cron + HTTP handler |
| `worker/src/api-football.js` | criar | Cliente HTTP da API-Football + transformação dos fixtures/standings |
| `worker/src/sheets.js` | criar | Cliente Google Sheets API (read-only) |
| `worker/src/transform.js` | criar | `transformLeague()`, `match_key()` builder, stage normalizer |
| `worker/src/league-meta.js` | criar | Constantes bilíngues por liga (`region`, `blurb`, `name`, `crest`, `color`) |
| `loader.js` (raiz do site) | criar | Fetch do JSON + dispatch do `w2w:data-ready` |
| `WhereToWatch FC.html` | editar | Trocar `data.js`-deps pelo listener do evento |
| `leagues/_template.html` | editar | Idem; depois regenerar 9 cópias |
| `networks/_template.html` | editar | Idem; depois regenerar 16 cópias |
| `networks/index.html` | editar | Idem |
| `leagues/data.js` | manter | Fallback dev-time (deletar quando pipeline estabilizar) |
| `networks/networks.js` | manter | Idem |

Estrutura do worker (separada do site estático):

```
KEN PASSA/
  worker/
    wrangler.toml
    src/
      index.js
      api-football.js
      sheets.js
      transform.js
      league-meta.js
  WhereToWatch FC.html          ← site estático (Cloudflare Pages serve esses)
  loader.js                      ← novo
  leagues/                       ← site estático
  networks/                      ← site estático
  i18n.js                        ← já existe
```

---

## Verification

### Fase 1
1. Worker deployado com `wrangler deploy`. Logs do cron mostram fetch da API + Sheet sem erro.
2. Manualmente: `curl https://w2w-worker.workers.dev/api/data.json` retorna JSON válido com 9 ligas e 16 networks.
3. Browser abre o site no Cloudflare Pages; **DevTools Network** mostra request de `/api/data.json` (não mais `data.js`).
4. Edite uma linha no Sheet `fixtures` (acrescente um canal num jogo). Force o cron via Cloudflare Dashboard ("Trigger"). Recarregue o site → o canal novo aparece na pill do jogo.
5. Toggle PT/EN segue funcionando (`I18N.apply()` continua sendo chamado no listener `w2w:data-ready`).

### Fase 2
6. Inicia uma janela de jogo de teste (ajuste manualmente um fixture pra "agora" no Sheet override). Cron de 15 min dispara; depois de 1 ciclo, `score` e `live` aparecem no JSON.
7. UI mostra `.is-live` na linha do jogo, com pulso vermelho.

### Fase 3
8. Cron 1-min ativo; durante janela real, abrir o site e ver o placar mudar sem F5 (auto-poll do browser).
9. Painel da API-Football mostra ~10k calls/mês; conta no Pro.

---

## Custo consolidado

| Fase | Cloudflare | API | Sheet | Total/mês |
|---|---|---|---|---|
| 1 (diário) | $0 (free tier) | $0 (free tier) | $0 | **$0** |
| 2 (15 min) | $0 | $0 | $0 | **$0** |
| 3 (1 min real-time) | $0 | $19 (API-Football Pro) | $0 | **$19** |

---

## Cuidados / armadilhas conhecidas

1. **`match_key` precisa ser determinístico dos 2 lados.** A regra de slugificar o nome do time (`São Paulo` → `sao-paulo`) tem que ser idêntica no Sheet (manual) e no Worker (auto). Documentar a regra no topo do Sheet.
2. **Stage da API ≠ stage do site.** API-Football usa `"Group Stage - 4"`, `"Round of 16 - 1st Leg"`. O Worker normaliza pra `"Group D"`, `"R16 · 1st leg"` (formato que `I18N.stage()` já entende).
3. **Datas em fuso correto.** Site é BRT. API retorna UTC. Worker converte na hora de gerar `day` / `dayShort` / `hr`.
4. **Fallback gracioso.** Se `/api/data.json` falhar, `loader.js` tenta carregar `data.js` local como backup (não trava o site).
5. **Sheet edit lag.** Mudança no Sheet só vira realidade no próximo cron. Documentar isso pro user; se urgente, ele clica "Trigger cron now" no painel Cloudflare.
6. **API-Football free tier (100/dia)** suporta Fase 1 e 2. Conferir limite real antes de subir Fase 3 sem upgrade.
7. **Logos / crests** continuam placeholders (initials das siglas). Se quiser logos reais, é projeto separado (CDN de assets).
