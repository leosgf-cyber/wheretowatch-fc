#!/usr/bin/env node
/**
 * Build worker/public/data.seed.json from the site's current
 * leagues/data.js + networks/networks.js.
 *
 * Run from the worker/ directory:
 *   node scripts/build-seed.mjs
 *
 * Re-run whenever the local fallback files change.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');           // KEN PASSA/
const SITE_LEAGUES = path.join(ROOT, 'leagues/data.js');
const SITE_NETWORKS = path.join(ROOT, 'networks/networks.js');
const OUT = path.resolve(__dirname, '../public/data.seed.json');

async function evalAsObject(filePath, globalName) {
  const src = await fs.readFile(filePath, 'utf8');
  // The site files declare `window.<NAME> = { ... };`. Convert to a CJS-like
  // assignment we can eval safely in this script.
  const wrapped = `
    const window = {};
    ${src}
    return window.${globalName};
  `;
  // eslint-disable-next-line no-new-func
  const fn = new Function(wrapped);
  return fn();
}

async function main() {
  const [LEAGUES, NETWORKS] = await Promise.all([
    evalAsObject(SITE_LEAGUES, 'LEAGUES'),
    evalAsObject(SITE_NETWORKS, 'NETWORKS')
  ]);

  const seed = {
    generated_at: new Date().toISOString(),
    leagues: LEAGUES,
    networks: NETWORKS,
    health: { last_success_at: null, errors: [], note: 'seed snapshot — pre-Worker' }
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(seed, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${OUT}`);
  console.log(`  leagues:  ${Object.keys(seed.leagues).length}`);
  console.log(`  networks: ${Object.keys(seed.networks).length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
