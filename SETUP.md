# SETUP — Fase 1 da automação

Tudo o que **você precisa fazer fora do código** pra ligar o pipeline. Tempo total estimado: **45-90 minutos**.

A ordem importa porque cada passo gera uma credencial usada no próximo. Marque ✅ conforme avança.

---

## Checklist resumido

- [ ] **1.** Criar conta API-Football (RapidAPI) e copiar a API key
- [ ] **2.** Criar projeto Google Cloud + Service Account + baixar JSON
- [ ] **3.** Criar Google Sheet, importar os 2 CSVs, compartilhar com o Service Account, copiar o Sheet ID
- [ ] **4.** Instalar `wrangler` e logar no Cloudflare
- [ ] **5.** Criar KV namespace, salvar o ID no `wrangler.toml`
- [ ] **6.** Configurar 2 secrets (`API_FOOTBALL_KEY`, `GOOGLE_SA_KEY`) e 2 vars (`SHEET_ID`, `GOOGLE_SA_EMAIL`)
- [ ] **7.** Deploy do Worker: `wrangler deploy`
- [ ] **8.** Forçar primeiro cron pra popular KV: `curl -X POST .../api/trigger -H "x-trigger-token: ..."`
- [ ] **9.** Apontar o site (Cloudflare Pages) pro mesmo domínio do Worker via Routes/Custom domain
- [ ] **10.** Confirmar que `/api/data.json` retorna o JSON real e o site usa ele (DevTools → Network)

---

## 1. API-Football (RapidAPI)

1. Abra: https://rapidapi.com/api-sports/api/api-football
2. Crie conta (login com Google funciona)
3. Clique em **Subscribe to Test** → escolha **"Basic" ($0/mês, 100 req/dia)** — suficiente pra Fase 1.
4. Na aba **"App"** (canto superior direito), copie a chave em **`X-RapidAPI-Key`**. Guarda num lugar seguro — vai usar no passo 6.
5. (Opcional) Confira que sua chave funciona:
   ```bash
   curl -H "x-rapidapi-key: SUA_CHAVE" \
        -H "x-rapidapi-host: v3.football.api-sports.io" \
        "https://v3.football.api-sports.io/leagues?country=Brazil&season=2026"
   ```
   Deve retornar JSON com `response[]`.

---

## 2. Google Cloud — Service Account

1. Abra https://console.cloud.google.com → topo da página, **Selecionar projeto** → **Novo projeto**.
   - Nome: `wheretowatch-fc` (ou qualquer)
2. Com o projeto novo selecionado, vá em **APIs e serviços → Biblioteca**.
3. Busque **Google Sheets API** → clique → **Habilitar**.
4. Vá em **APIs e serviços → Credenciais** → **+ Criar credenciais → Conta de serviço**.
   - Nome: `w2w-worker`
   - Função: **deixe em branco** (não precisa de role no projeto; a permissão real vem de compartilhar o Sheet com esse email).
   - Clique **Concluído**.
5. Clica na conta de serviço criada → aba **Chaves** → **Adicionar chave → Criar nova chave** → tipo **JSON**.
6. Vai baixar um arquivo `.json` — **NÃO COMITE**, guarde em local seguro. Vai abrir no passo 6.
7. Copie o `client_email` desse JSON (algo como `w2w-worker@<projeto>.iam.gserviceaccount.com`). Vai usar no próximo passo.

---

## 3. Google Sheet

1. Abra https://sheets.google.com → **Em branco**.
2. Renomeie a primeira aba pra **`broadcasters`** (clica duas vezes na aba).
3. Importe `worker/sheet-templates/broadcasters.csv`:
   - **Arquivo → Importar → Fazer upload** → arrasta o CSV
   - Em "Importar local": **Substituir planilha atual**
   - **Importar dados**
4. Clica no **+** no rodapé → cria nova aba → renomeia pra **`fixtures`**.
5. Com a aba `fixtures` ativa, importe `worker/sheet-templates/fixtures.csv` (mesma sequência do passo 3).
6. **Compartilhar** (botão azul no canto superior direito):
   - Cola o `client_email` do passo 2.7 (o `w2w-worker@...iam.gserviceaccount.com`)
   - Permissão: **Visualizador** (read-only, suficiente)
   - Desmarca "Notificar pessoas" (já que é robô)
   - **Compartilhar**
7. Copie o **Sheet ID** da URL — entre `/d/` e `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/AAAAA_ESSE_PEDACO_BBBBB/edit#gid=0
                                          ↑ Sheet ID ↑
   ```

---

## 4. Cloudflare + Wrangler

1. Crie conta gratuita em https://cloudflare.com (se ainda não tem).
2. Instale o Wrangler:
   ```bash
   cd "/Users/leosgf/Documents/AGENTES AI/KEN PASSA/KEN PASSA/worker"
   npm install
   ```
   (instala wrangler localmente como devDep — sem precisar de `-g`)
3. Login:
   ```bash
   npx wrangler login
   ```
   Vai abrir o navegador. Autorize.

---

## 5. KV namespace

```bash
cd "/Users/leosgf/Documents/AGENTES AI/KEN PASSA/KEN PASSA/worker"
npx wrangler kv namespace create W2W_KV
```

Output vai ser algo como:
```
🌀  Creating namespace with title "wheretowatch-worker-W2W_KV"
✨  Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "W2W_KV", id = "abc123def456..." }
```

Copie esse `id` e cole em `worker/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "W2W_KV"
id = "abc123def456..."   # ← cola aqui (substituindo "REPLACE_ME_KV_ID")
```

---

## 6. Secrets e vars

No `worker/wrangler.toml`, substitua os placeholders:

```toml
[vars]
SHEET_ID = "AAAAA_ESSE_PEDACO_BBBBB"            # passo 3.7
GOOGLE_SA_EMAIL = "w2w-worker@projeto.iam.gserviceaccount.com"  # passo 2.7
SEASON = "2026"
```

Configure os 2 secrets (não vão pro `wrangler.toml`):

```bash
cd "/Users/leosgf/Documents/AGENTES AI/KEN PASSA/KEN PASSA/worker"

# 6.1 — API key da API-Football (passo 1)
npx wrangler secret put API_FOOTBALL_KEY
# cola a chave quando pedir → enter

# 6.2 — Private key do service account (passo 2.6)
# Abra o JSON baixado, copie o valor do campo "private_key" (incluindo
# os "-----BEGIN PRIVATE KEY-----" e "-----END PRIVATE KEY-----").
# Cole quando pedir.
npx wrangler secret put GOOGLE_SA_KEY

# (opcional) token pra trigger manual via curl
npx wrangler secret put TRIGGER_TOKEN
# digite uma string aleatória, salva — vai precisar no passo 8
```

> **Cuidado com o `private_key`:** ele tem `\n` literais quando você copia do JSON. O Worker normaliza automaticamente (vê `sheets.js`), então pode colar do jeito que está.

---

## 7. Deploy do Worker

```bash
cd "/Users/leosgf/Documents/AGENTES AI/KEN PASSA/KEN PASSA/worker"
node scripts/build-seed.mjs        # gera public/data.seed.json
npx wrangler deploy
```

Output mostra a URL do Worker, algo como:
```
https://wheretowatch-worker.<seu-subdominio>.workers.dev
```

Salve essa URL.

---

## 8. Forçar primeiro cron pra popular o KV

O cron diário roda às 03:00 BRT. Pra não esperar, dispara manualmente:

```bash
WORKER_URL="https://wheretowatch-worker.<seu-subdominio>.workers.dev"
TOKEN="o-token-que-voce-gerou-no-passo-6.2"
curl -X POST "$WORKER_URL/api/trigger" -H "x-trigger-token: $TOKEN"
```

Resposta esperada:
```json
{"ok": true, "started_at": "2026-04-28T...", "elapsed_ms": 4521, "leagues_ok": 9, "errors": []}
```

Se vier `errors[]` com algo, leia a mensagem — geralmente é:
- `sheet:fixtures: 403` → o Service Account não tem acesso ao Sheet (volte ao passo 3.6)
- `api:<liga>: 401` → API key errada (passo 6.1)
- `api:<liga>: 429` → quota da API estourada (raro pra Fase 1)

Verifique também:
```bash
curl "$WORKER_URL/api/health" | jq
curl "$WORKER_URL/api/data.json" | jq '.leagues | keys'
```

A segunda chamada deve listar os 9 slugs: `["brasileirao", "bundesliga", "champions-league", ...]`.

---

## 9. Cloudflare Pages (site estático) + custom domain

1. No painel Cloudflare → **Pages** → **Create a project** → **Direct Upload** (ou conecte ao GitHub repo `wheretowatch-fc`).
2. Faça upload da pasta `KEN PASSA/KEN PASSA/` (toda — exceto `worker/`, `node_modules/`, `.git/`).
3. Project name sugerido: `wheretowatch-fc`. URL ficará tipo `wheretowatch-fc.pages.dev`.
4. **Settings → Custom domains** (opcional, se você tem um domínio).
5. **Crítico:** roteie `/api/*` do site pro Worker. Duas formas:
   - **Mesmo domínio:** crie um **Workers Route** apontando `seusite.pages.dev/api/*` → `wheretowatch-worker`. Painel: **Workers & Pages → seu Worker → Settings → Triggers → Routes → Add route**.
   - **Domínio diferente:** edite cada HTML pra setar `window.W2W_API_BASE = "https://wheretowatch-worker.../"` ANTES do `<script src="loader.js">` (mais chato, prefere a opção 1).

---

## 10. Verificação final

1. Abra o site no navegador (URL do Pages).
2. Abra **DevTools → Network**:
   - Deve haver um request pra `/api/data.json` retornando 200 com `application/json`.
   - **Não** deve haver request pra `leagues/data.js` nem `networks/networks.js` (esses são fallback).
3. Abre o console do DevTools:
   - `window.W2W_GENERATED_AT` → timestamp ISO recente
   - `window.W2W_HEALTH` → `{ last_success_at: ..., errors: [] }`
4. Edite o Sheet `fixtures`: altere os canais de algum jogo. Force o cron (passo 8) e recarregue o site (Ctrl+F5). Confira que a pill nova apareceu.
5. Toggle PT/EN segue funcionando — `I18N.apply()` continua sendo chamado dentro do `w2wBoot` pós-evento `data-ready`.

---

## Manutenção

**Adicionar canais a uma rodada nova:**
1. Abre o Sheet `fixtures` → adiciona linhas com `match_key, networks`.
2. Espera o próximo cron (03:00 BRT) ou força via passo 8.

**Adicionar um broadcaster novo:**
1. Aba `broadcasters` → adiciona linha com `slug, name, brand_color, kind_en, kind_pt`.
2. Crie a página estática correspondente em `networks/<slug>.html` (cópia do `_template.html`) — esse passo continua manual por ora.
3. Próximo cron pega.

**Adicionar uma liga nova:**
1. Edite `worker/src/league-meta.js` adicionando a entrada com `apiId` correto.
2. `wrangler deploy`.
3. Crie `leagues/<slug>.html` (cópia do template).

**Algo deu errado:**
- `npx wrangler tail` mostra logs do Worker em tempo real.
- `/api/health` mostra a saúde da última run.
- Rollback: `npx wrangler kv key get data:previous --binding=W2W_KV | npx wrangler kv key put data:current --binding=W2W_KV`.
