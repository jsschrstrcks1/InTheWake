<script>
/* dining-card.js — RCL restaurants source of truth (rc-restaurants.json)
   - Canonical first: http://cruisinginthewake.com/assets/data/rc-restaurants.json
   - Fallbacks: /assets/data/rc-restaurants.json, /data/rc-restaurants.json
   - <section id="dining-card" class="card" data-ship="..."></section>
   - Looks up by slug (preferred) or name.
*/

(() => {
  const CARD_SEL = '#dining-card';
  const CANON = 'http://cruisinginthewake.com/assets/data/rc-restaurants.json';
  const SOURCES = [CANON, '/assets/data/rc-restaurants.json', '/data/rc-restaurants.json'];
  const DINING_IMG = 'https://upload.wikimedia.org/wikipedia/commons/1/11/Cordelia_Empress_Food_Court.jpg';

  const $card = document.querySelector(CARD_SEL);
  if (!$card) return;

  // --- Ship identity (prefer slug; fallback to data-ship then <title>) ---
  function getSlugFromPath() {
    // e.g. /ships/rcl/grandeur-of-the-seas.html -> grandeur-of-the-seas
    const m = location.pathname.match(/\/ships\/[^/]+\/([^/.]+)\.html$/i);
    return m ? m[1] : '';
  }
  function getShipSlug() {
    // allow explicit override via <script id="dining-data-source">{ "ship_slug": "..." }</script>
    const hook = document.getElementById('dining-data-source');
    if (hook) {
      try {
        const cfg = JSON.parse(hook.textContent || '{}');
        if (cfg.ship_slug) return String(cfg.ship_slug).trim();
      } catch {}
    }
    const fromAttr = ($card.getAttribute('data-slug') || '').trim();
    return fromAttr || getSlugFromPath();
  }
  function getShipName() {
    const fromAttr = ($card.getAttribute('data-ship') || '').trim();
    if (fromAttr) return fromAttr;
    const t = (document.title || '').replace(/—.*$/, '').trim();
    return t || '';
  }

  const TARGET_SLUG = getShipSlug().toLowerCase();
  const TARGET_NAME = getShipName();

  const norm = s => String(s || '').toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'");

  async function fetchFirst(urls) {
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { credentials: 'omit', cache: 'default' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { url, json: await res.json() };
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('No data sources reachable');
  }

  function pickShipRecord(root) {
    // expected: { ships: [ { name, slug, included, suite_included, premium }, ... ] }
    const list = Array.isArray(root?.ships) ? root.ships : [];
    if (!list.length) return null;

    // 1) slug match
    if (TARGET_SLUG) {
      const s = list.find(x => norm(x.slug) === TARGET_SLUG);
      if (s) return s;
    }
    // 2) name match
    if (TARGET_NAME) {
      const tn = norm(TARGET_NAME).replace(/\s+of the seas$/, ''); // be forgiving
      let best = null;
      for (const x of list) {
        const n = norm(x.name).replace(/\s+of the seas$/, '');
        if (n === tn) return x;
        if (!best && (n.includes(tn) || tn.includes(n))) best = x;
      }
      if (best) return best;
    }
    return null;
  }

  function cleanList(arr) {
    const out = [];
    (arr || []).forEach(v => {
      if (!v) return;
      const label = (typeof v === 'string' ? v : (v.name || v.title || v.label || '')).toString().trim();
      if (label) out.push(label);
    });
    // unique + alpha
    const seen = new Set();
    return out.filter(x => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
              .sort((a,b)=>a.localeCompare(b));
  }

  function section(title, items, id) {
    const count = items.length;
    return `
      <section class="venue-block" aria-labelledby="${id}">
        <h3 id="${id}">${title} <span class="count" aria-hidden="true">(${count})</span></h3>
        ${count ? `<ul class="venue-list">${items.map(v=>`<li>${v}</li>`).join('')}</ul>` :
                  `<p class="tiny" role="note">No ${title.toLowerCase()} listed yet.</p>`}
      </section>`;
  }

  function render(ship, dataUrl) {
    const included = cleanList(ship.included);
    const suiteInc = cleanList(ship.suite_included);
    const premium  = cleanList(ship.premium);

    $card.innerHTML = `
      <h2 id="diningHeading">Dining Venues on ${ship.name}</h2>
      <figure class="dining-hero"><img src="${DINING_IMG}" alt="Dining area view from the ship" loading="lazy"/></figure>
      <p class="tiny">This list is generated from <code>rc-restaurants.json</code> <span class="src">(${dataUrl})</span>.</p>
      <div class="venues two-col">
        ${section('Included (Complimentary)', included, 'incHeading')}
        ${suiteInc.length ? section('Included (Suites / Perks)', suiteInc, 'suiteHeading') : ''}
        ${section('Premium (Specialty / Extra Charge)', premium, 'preHeading')}
      </div>
    `;
    // match card heights without cropping photos
    $card.style.alignSelf = 'stretch';
  }

  function renderError(msg) {
    $card.innerHTML = `
      <h2 id="diningHeading">Dining Venues</h2>
      <figure class="dining-hero"><img src="${DINING_IMG}" alt="Dining area view" loading="lazy"/></figure>
      <p class="tiny" role="alert">Could not load dining data: ${String(msg)}</p>
    `;
  }

  (async function init(){
    try {
      const { url, json } = await fetchFirst(SOURCES);
      const ship = pickShipRecord(json);
      if (!ship) {
        renderError(`No dining record found for “${TARGET_NAME || TARGET_SLUG || 'this ship'}”.`);
        return;
      }
      render(ship, url);
    } catch (e) {
      renderError(e?.message || e);
    }
  })();
})();
</script>
