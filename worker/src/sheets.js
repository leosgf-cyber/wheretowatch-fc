/**
 * Google Sheets read-only client for Cloudflare Workers.
 *
 * Uses Service Account auth (no OAuth dance) — Worker holds the SA's
 * private key as `wrangler secret GOOGLE_SA_KEY`, mints a short-lived
 * JWT, exchanges it for an access token, and reads ranges from the Sheet.
 *
 * Required env:
 *   env.SHEET_ID           — the Google Sheet ID (from URL)
 *   env.GOOGLE_SA_EMAIL    — service account client_email (public, in vars)
 *   env.GOOGLE_SA_KEY      — service account private_key (-----BEGIN PRIVATE KEY-----...)
 *
 * The Sheet must be shared with read access for GOOGLE_SA_EMAIL.
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

/**
 * Cache the access token in memory across requests within a single
 * Worker isolate. Tokens are valid for 1 hour; we refresh at 50 min.
 */
let _cachedToken = null;
let _cachedTokenExpiresAt = 0;

async function getAccessToken(env) {
  const now = Date.now();
  if (_cachedToken && now < _cachedTokenExpiresAt) {
    return _cachedToken;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: env.GOOGLE_SA_EMAIL,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 3600
  };

  const enc = (obj) => base64url(new TextEncoder().encode(JSON.stringify(obj)));
  const headerB64 = enc(header);
  const claimB64 = enc(claim);
  const toSign = `${headerB64}.${claimB64}`;

  const key = await importPrivateKey(env.GOOGLE_SA_KEY);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(toSign));
  const sigB64 = base64url(new Uint8Array(sig));
  const jwt = `${toSign}.${sigB64}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed ${res.status}: ${body}`);
  }
  const j = await res.json();
  _cachedToken = j.access_token;
  _cachedTokenExpiresAt = now + (j.expires_in || 3600) * 1000 - 10 * 60 * 1000;
  return _cachedToken;
}

/**
 * Read a sheet range as a 2D array of strings.
 * Range example: "broadcasters!A1:E"
 */
export async function readRange(env, range) {
  const token = await getAccessToken(env);
  const url = `${SHEETS_BASE}/${env.SHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets readRange ${res.status}: ${body}`);
  }
  const j = await res.json();
  return j.values || [];
}

/**
 * Read a sheet tab and convert into array of objects keyed by the header row.
 *   tab = "broadcasters" → reads "broadcasters!A1:Z"
 *   header row is row 1; data rows are row 2 onward.
 */
export async function readTab(env, tab) {
  const rows = await readRange(env, `${tab}!A1:Z`);
  if (!rows.length) return [];
  const [header, ...data] = rows;
  return data
    .filter(row => row.length > 0 && row.some(cell => cell !== ''))
    .map(row => {
      const obj = {};
      header.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
      return obj;
    });
}

/* ───────── helpers ───────── */

function base64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importPrivateKey(pemRaw) {
  // GOOGLE_SA_KEY may have literal `\n` if pasted from JSON; normalize.
  const pem = String(pemRaw).replace(/\\n/g, '\n').trim();
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const der = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}
