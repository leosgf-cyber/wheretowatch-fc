/**
 * WhereToWatch FC — runtime data loader.
 *
 * Loads `window.LEAGUES` and `window.NETWORKS` from the live API endpoint
 * served by the Cloudflare Worker. If that fails (Worker down, offline,
 * still pre-deploy), gracefully falls back to the static `data.js` and
 * `networks.js` files committed in the repo.
 *
 * Pages listen for `w2w:data-ready` before running their boot scripts.
 * (See WhereToWatch FC.html, leagues/_template.html, networks/_template.html,
 * networks/index.html — those have been adapted to use this event.)
 *
 * Configure the API base by setting `window.W2W_API_BASE` BEFORE this script
 * loads. Defaults to same-origin (works when site + worker share a domain
 * via Cloudflare routes), with a hard-coded staging fallback for dev.
 */
(function() {
  // Resolve API base. Priority:
  //   1. window.W2W_API_BASE (set by page if needed)
  //   2. same-origin (production: site + worker on same domain via routes)
  //   3. local fallback (signals "use local data.js immediately")
  const API_BASE = (typeof window !== 'undefined' && window.W2W_API_BASE)
    ? String(window.W2W_API_BASE).replace(/\/$/, '')
    : '';

  const TIMEOUT_MS = 6000;

  function dispatchReady(source) {
    // Mark how the data was loaded for debugging.
    document.documentElement.setAttribute('data-w2w-source', source);
    document.dispatchEvent(new CustomEvent('w2w:data-ready', { detail: { source } }));
  }

  function loadFallbackScripts() {
    // Determine relative path prefix based on location.
    // - root pages (WhereToWatch FC.html, about.html, ...) use 'leagues/data.js' + 'networks/networks.js'
    // - subpages in /leagues/ use 'data.js' + '../networks/networks.js'
    // - subpages in /networks/ use '../leagues/data.js' + 'networks.js'
    const path = location.pathname;
    let leaguesSrc, networksSrc;
    if (/\/leagues\//.test(path)) {
      leaguesSrc = 'data.js';
      networksSrc = '../networks/networks.js';
    } else if (/\/networks\//.test(path)) {
      leaguesSrc = '../leagues/data.js';
      networksSrc = 'networks.js';
    } else {
      leaguesSrc = 'leagues/data.js';
      networksSrc = 'networks/networks.js';
    }

    // Load both fallbacks sequentially. They're <100KB each so it's quick.
    function load(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error('failed to load ' + src));
        document.head.appendChild(s);
      });
    }

    Promise.all([load(leaguesSrc), load(networksSrc)])
      .then(() => dispatchReady('local-fallback'))
      .catch(err => {
        console.error('[w2w] fallback also failed', err);
        // Still dispatch — pages handle missing data gracefully via I18N.pick fallbacks.
        dispatchReady('none');
      });
  }

  async function loadFromApi() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${API_BASE}/api/data.json`, {
        cache: 'no-cache',
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !data.leagues || !data.networks) throw new Error('malformed response');
      window.LEAGUES = data.leagues;
      window.NETWORKS = data.networks;
      window.W2W_GENERATED_AT = data.generated_at;
      window.W2W_HEALTH = data.health;
      dispatchReady('api');
      return true;
    } catch (err) {
      clearTimeout(timer);
      console.warn('[w2w] API load failed, falling back to local data:', err.message);
      return false;
    }
  }

  // Kick off
  loadFromApi().then(ok => {
    if (!ok) loadFallbackScripts();
  });
})();
