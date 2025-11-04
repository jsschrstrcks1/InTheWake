/* sw-bridge.js — calculator/SW glue (v20.4) */

(() => {
  const UI = {
    bar: null,
    text: null,
    btn: null
  };

  function ensureBar() {
    if (UI.bar) return;
    const bar = document.createElement('div');
    bar.id = 'sw-stale-bar';
    bar.style.cssText = `
      position: sticky; top:0; z-index: 1000;
      display: none; gap:.5rem; align-items:center; justify-content:space-between;
      padding:.6rem .8rem; background:#fff7ed; border-bottom:1px solid #fed7aa; color:#7c2d12;
      font: 14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    `;
    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '.5rem';

    const dot = document.createElement('span');
    dot.ariaHidden = 'true';
    dot.textContent = '⚠️';

    const text = document.createElement('span');
    text.id = 'sw-stale-text';

    left.appendChild(dot);
    left.appendChild(text);

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '.5rem';

    const refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.id = 'sw-force-refresh';
    refreshBtn.textContent = 'Force refresh';
    refreshBtn.style.cssText = `
      appearance:none;border:1px solid #fdba74;background:#fff;color:#7c2d12;
      padding:.35rem .6rem;border-radius:8px;font-weight:600;cursor:pointer;
    `;

    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.textContent = 'Dismiss';
    dismissBtn.style.cssText = `
      appearance:none;border:1px solid transparent;background:transparent;color:#7c2d12;
      padding:.35rem .2rem;border-radius:8px;cursor:pointer;
    `;

    btns.appendChild(refreshBtn);
    btns.appendChild(dismissBtn);

    bar.appendChild(left);
    bar.appendChild(btns);

    document.body.prepend(bar);

    UI.bar = bar;
    UI.text = text;
    UI.btn = refreshBtn;

    dismissBtn.addEventListener('click', () => {
      bar.style.display = 'none';
    });
    refreshBtn.addEventListener('click', forceRefresh);
  }

  function fmtAge(ms) {
    if (!ms || ms < 1000) return 'just now';
    const m = Math.floor(ms/60000);
    if (m < 60) return `${m} min${m===1?'':'s'} ago`;
    const h = Math.floor(m/60);
    if (h < 48) return `${h} hour${h===1?'':'s'} ago`;
    const d = Math.floor(h/24);
    return `${d} day${d===1?'':'s'} ago`;
  }

  function confidenceBadge(conf) {
    if (conf === 'high') return '✅ fresh-ish';
    if (conf === 'medium') return '🟡 aging';
    return '🟠 stale';
  }

  async function updateBannerFromHealth() {
    try {
      ensureBar();
      const r = await fetch('/__sw_health', { cache:'no-store' });
      if (!r.ok) throw new Error('health ' + r.status);
      const j = await r.json();
      const pricing = j?.calculator?.pricing;
      if (!pricing?.cached) {
        UI.bar.style.display = 'none';
        return;
      }
      const { ageMs=0, confidence='high', maxAgeMs=0 } = pricing;
      // only show banner if we actually used a cached response recently OR confidence < high
      const show = confidence !== 'high' || ageMs > 15*60*1000; // >15m old
      if (!show) { UI.bar.style.display = 'none'; return; }

      UI.text.textContent =
        `Using cached pricing (${confidenceBadge(confidence)} • ${fmtAge(ageMs)}). ` +
        `We’ll auto-refresh in the background; you can force it now.`;

      UI.bar.style.display = 'flex';
    } catch {
      // best-effort; hide on failure
      if (UI.bar) UI.bar.style.display = 'none';
    }
  }

  async function forceRefresh() {
    try {
      UI.btn.disabled = true;
      UI.btn.textContent = 'Refreshing…';
      // Ask the SW to refresh pricing now
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'FORCE_DATA_REFRESH' });
      }
      // also re-check health in a moment
      setTimeout(updateBannerFromHealth, 2000);
    } finally {
      setTimeout(() => {
        UI.btn.disabled = false;
        UI.btn.textContent = 'Force refresh';
      }, 2000);
    }
  }

  // Listen for the SW telling us it refreshed the data
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (evt) => {
      const { type, resource } = evt.data || {};
      if (type === 'DATA_REFRESHED' && resource === 'pricing') {
        // During testing, the simplest/most reliable is to reload.
        // If you prefer without reload: call a public loader on your app and re-run scheduleCalc().
        location.reload();
      }
    });
  }

  // Run on load and on visibility changes (cheap)
  window.addEventListener('load', updateBannerFromHealth, { once:true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') updateBannerFromHealth();
  });

  // Expose a manual hook for DevTools
  window.__itwRefreshPricing = forceRefresh;
})();
