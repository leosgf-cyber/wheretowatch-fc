# Google Sheet templates

Two CSVs ready to import into Google Sheets, one tab per file.

## How to set up the Sheet

1. Create a new Google Sheet (sheets.google.com → Blank).
2. Rename the default tab to **`broadcasters`**.
3. **File → Import → Upload `broadcasters.csv`** → "Replace current sheet".
4. Click **+** at the bottom to create a second tab. Rename it **`fixtures`**.
5. **File → Import → Upload `fixtures.csv`** → with the `fixtures` tab active, "Replace current sheet".
6. (Optional) Create a third tab **`overrides`** for Phase 2+ corrections.
7. **Share** the Sheet with **Read access** for the Service Account email
   (the one ending in `@<project>.iam.gserviceaccount.com` — see SETUP.md).
8. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<this part>`**`/edit`
9. Paste the Sheet ID into `worker/wrangler.toml` under `[vars] SHEET_ID = "..."`.

## `broadcasters` tab — catalog of channels (substitutes networks/networks.js)

Columns (header row 1):

| Column        | Description                                       |
| ------------- | ------------------------------------------------- |
| `slug`        | URL slug, e.g. `globo`, `caze-tv`, `prime-video`  |
| `name`        | Display name. **Must match exactly** what appears in `fixtures.networks` and what API-Football returns in `nets` (it doesn't, but stays for human reference). |
| `brand_color` | Hex color for the pill swatch                      |
| `kind_en`     | Distribution model in English (Streaming · Free, Cable · Pay TV, ...) |
| `kind_pt`     | Same in Portuguese                                |

**Convention:** keep `slug` lowercase-hyphenated. Adding a new broadcaster?
Add a row here AND propagate the slug to the site (the Worker auto-generates
`networks.json`, but pages are static — adding a new `<broadcaster>.html`
in `networks/` is still a manual step for now).

## `fixtures` tab — broadcaster mapping per match

Columns:

| Column      | Description |
| ----------- | ----------- |
| `match_key` | Deterministic key: `<YYYY-MM-DD>_<league_slug>_<home_slug>-<away_slug>`. The date is the **BRT calendar date** of the kickoff (UTC-3). |
| `networks`  | Comma-, semicolon-, or pipe-separated list of broadcaster names (must match `broadcasters.name` exactly, case-sensitive). E.g. `Globo, Premiere`. |
| `notes`     | Optional human notes. Worker ignores. |

### Match key — slugify rules (apply to both team names)

```
"São Paulo"     → "sao-paulo"
"Atlético-MG"   → "atletico-mg"
"M'gladbach"    → "mgladbach"
"Real Sociedad" → "real-sociedad"
"Inter & Milan" → "inter-and-milan"
```

Algorithm: lowercase → strip accents → strip apostrophes → any non-alnum
becomes a hyphen → trim leading/trailing hyphens. The Worker applies the
same algorithm to API team names, then runs through `team-aliases.js` for
known mismatches (e.g. API "Paris Saint-Germain" → canonical `psg`).

### League slugs

| Site slug          | Used in match_key |
| ------------------ | ----------------- |
| `brasileirao`      | Brasileirão Série A |
| `copa-do-brasil`   | Copa do Brasil |
| `sulamericana`     | Copa Sulamericana |
| `la-liga`          | La Liga (Spain) |
| `champions-league` | UEFA Champions League |
| `serie-a`          | Serie A (Italy) |
| `bundesliga`       | Bundesliga (Germany) |
| `ligue-1`          | Ligue 1 (France) |
| `primeira-liga`    | Primeira Liga (Portugal) |

### Examples

```
2026-04-28_brasileirao_flamengo-fluminense       → Globo, Premiere
2026-04-29_champions-league_barcelona-inter      → SBT, Space, Max
2026-05-02_la-liga_atletico-madrid-real-sociedad → ESPN, Disney+
```

## `overrides` tab (Phase 2+, optional)

When the API has a wrong kickoff time or stage label that you want to
correct without waiting for them to fix it. Columns:

| Column      | Description |
| ----------- | ----------- |
| `match_key` | Same format as fixtures. |
| `field`     | One of: `hr` (kickoff time HH:MM), `stage`, `score`, `live` |
| `value`     | New value. |

The Worker applies overrides AFTER pulling from the API but BEFORE writing to KV.
