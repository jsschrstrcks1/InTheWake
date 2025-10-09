/* dining-card.js — Dining Venues card (v2.246, repaired)
   - Supports new rc.venues.v1: /assets/data/venues.json { venues[], ships{} }
   - Back-compat with legacy rc/msc restaurants JSON
   - Auto ship detection (inline JSON or URL)
   - Venue names link to restaurants anchors: /restaurants.html#<provider>-<slug>
*/
(() => {
  const CARD = document.querySelector('#dining-card');
  if (!CARD) return;

  // Inline config (provider, json, ship_slug, aliases, schema)
  const cfgHook = document.getElementById('dining-data-source');
  const CFG = (() => { try { return JSON.parse(cfgHook?.textContent || '{}'); } catch { return {}; } })();

  const provider = (CFG.provider || 'rcl').toLowerCase();
  const customJson = CFG.json || '';
  const inlineSlug = (CFG.ship_slug || '').toLowerCase();
  const aliases = (CFG.aliases || []).map(s => (s || '').toLowerCase());
  const schema = CFG.schema || ''; // 'rc.venues.v1' when the pointer script updates it

  // Display title used for helpful error text
  const DISPLAY = (CARD.getAttribute('data-ship') || document.title.replace(/—.*/, '') || '').trim();
  const DISPLAY_N = DISPLAY.toLowerCase();

  // Normalizers
  const norm   = s => String(s || '').toLowerCase().replace(/’/g, "'").trim();
  const normShip = s => norm(s).replace(/\s+of the seas$/, ''); // RC tolerance
  const slugify = s => String(s || '').toLowerCase().replace(/&/g, 'and')
                    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // Absolute helper if present
  const abs = (p) => (typeof window._abs === 'function' ? window._abs(p) : p);

  // Auto-detect the ship slug if inline is missing
  function detectSlug() {
    if (inlineSlug) return inlineSlug;
    const m = location.pathname.match(/\/ships\/[^/]+\/([^/.]+)/i);
    if (m && m[1]) return m[1].toLowerCase();
    return ''; // let matching logic handle it
  }
  const shipSlug = detectSlug();

  // Data sources (venues.json first; legacy files as fallbacks)
  const SOURCES = [
    abs('/assets/data/venues.json'),
    'https://www.cruisinginthewake.com/assets/data/venues.json',
    'https://www.cruisinginthewake.com/assets/data/rc-restaurants.json',
    'https://www.cruisinginthewake.com/assets/data/msc-restaurants.json',
    abs('/assets/data/rc-restaurants.json'),
    abs('/assets/data/ccl-restaurants.json'),
    abs('/assets/data/msc-restaurants.json')
  ];

  // Fetch the first good JSON (respect customJson override first if present)
  async function fetchFirst(urls) {
    let lastErr;
    const list = customJson ? [customJson, ...urls] : urls;
    for (const url of list) {
      try {
        const r = await fetch(url, { credentials: 'omit', cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        const json = await r.json();
        return { json, url };
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('All data sources failed');
  }

  // ---------- Rendering ----------
  function linkifyNames(arr) {
    const base = `/restaurants.html#${provider}-`;
    return arr.map(({ name }) => `<a href="${base}${slugify(name)}">${name}</a>`);
  }

  function renderOK(incObjects, preObjects) {
    const intro = `
      <p class="tiny" style="margin-top:.25rem">
        Set sail through a world of flavors on board, where complimentary main dining and casual bites keep your voyage fueled,
        while premium specialty restaurants offer exclusive culinary adventures worth charting a course for.
      </p>
    `;
    const block = (title, items, id) => `
      <section class="venue-block" aria-labelledby="${id}">
        <h3 id="${id}">${title} <span class="count" aria-hidden="true">(${items.length})</span></h3>
        ${items.length
          ? `<ul class="venue-list">${linkifyNames(items).map(a => `<li>${a}</li>`).join('')}</ul>`
          : `<p class="tiny">No ${title.toLowerCase()} listed yet.</p>`}
      </section>`;

    const mount = document.getElementById('dining-content');
    if (mount) {
      mount.innerHTML = intro + `
        <div class="venues two-col">
          ${block('Included (Complimentary)', incObjects, 'incHeading')}
          ${block('Premium (Specialty / Extra Charge)', preObjects, 'preHeading')}
        </div>`;
    }
    CARD.removeAttribute('aria-busy');
  }

  function renderError(msg) {
    const mount = document.getElementById('dining-content');
    if (mount) mount.innerHTML = `<p class="tiny" role="alert">${msg}</p>`;
    CARD.removeAttribute('aria-busy');
  }

  // ---------- New schema path (rc.venues.v1) ----------
  function isVenuesV1(root) {
    return root && Array.isArray(root.venues) && root.ships && typeof root.ships === 'object';
  }

  function pickShipFromVenuesV1(root) {
    const target = (shipSlug || '').toLowerCase();
    if (target && root.ships[target]) return { key: target, ship: root.ships[target] };

    // Try name/alias matching if no exact slug
    const entries = Object.entries(root.ships);
    const wantedName = normShip(DISPLAY_N);

    let best = null, bestScore = -1;
    for (const [key, ship] of entries) {
      const nName = normShip(ship?.name || '');
      const score =
        (wantedName && nName && (nName === wantedName || aliases.includes(nName))) ? 2 : 0;
      if (score > bestScore) { best = { key, ship }; bestScore = score; }
      if (bestScore === 2) break;
    }
    return best;
  }

  function buildListsFromVenuesV1(root, shipObj) {
    // Index venues by slug for expansion
    const vIndex = Object.fromEntries((root.venues || []).map(v => [v.slug, v]));

    const slugs = Array.isArray(shipObj.venues) ? shipObj.venues : [];
    const expanded = slugs.map(slug => {
      const v = vIndex[slug];
      return v ? { ...v, slug } : { slug, name: slug, category: 'unknown' };
    });

    // Partition by category
    const incObjs = [], preObjs = [];
    const seen = new Set();

    for (const v of expanded) {
      const name = (v.name || v.slug || '').trim();
      if (!name) continue;
      const key = norm(name);
      if (seen.has(key)) continue; seen.add(key);

      const cat = (v.category || '').toLowerCase();
      if (cat === 'complimentary' || cat === 'included') incObjs.push({ name, slug: v.slug });
      else if (cat === 'premium' || cat === 'specialty' || cat === 'extra') preObjs.push({ name, slug: v.slug });
      else incObjs.push({ name, slug: v.slug }); // default to included if unknown
    }

    // Sort by name
    incObjs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    preObjs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    return { incObjs, preObjs };
  }

  // ---------- Legacy path ----------
  function* iterShips(root) {
    if (!root) return;
    if (Array.isArray(root)) { for (const it of root) yield it; return; }
    const buckets = [root.ships, root.brands, root.lines, root.royal, root.rcl, root[provider]];
    for (const b of buckets) {
      if (!b) continue;
      if (Array.isArray(b)) { for (const it of b) yield it; }
      else if (typeof b === 'object') { for (const k of Object.keys(b)) { const v = b[k]; if (v) yield v; } }
    }
    // Heuristic fallback
    for (const k of Object.keys(root)) {
      const v = root[k];
      if (v && typeof v === 'object' && (v.name || v.title || v.ship || v.dining || v.Included || v.Premium)) yield v;
    }
  }

  const idFrom = o => ({ name: o?.name || o?.title || o?.ship || '', slug: o?.slug || o?.id || o?.key || '' });

  function pullDining(obj) {
    // Try common legacy shapes
    const d = obj?.dining || obj?.venues || obj || {};
    const inc = d.included || d.complimentary || d.Included || d.Complimentary || [];
    const pre = d.premium || d.specialty || d.Premium || d.Specialty || d['Extra'] || d.extra || [];
    if (!inc.length && !pre.length && Array.isArray(d)) {
      const INC = [], PRE = [];
      d.forEach(v => {
        const label = (typeof v === 'string') ? v.trim() : (v?.name || v?.title || '').trim();
        const t = (typeof v === 'string') ? '' : (v.type || '').toLowerCase();
        if (!label) return;
        if (t.includes('prem') || t.includes('spec') || v.fee === true) PRE.push(label); else INC.push(label);
      });
      return { inc: INC, pre: PRE };
    }
    return { inc: [...inc], pre: [...pre] };
  }

  function uniqueSortedStrings(list) {
    const seen = new Set();
    return (list || [])
      .map(v => typeof v === 'string' ? v.trim() : (v?.name || v?.title || '').trim())
      .filter(Boolean)
      .filter(v => { const k = norm(v); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }

  // For legacy rendering we only have names; upgrade them to {name} objects for linkify
  const toNameObjects = (arr) => arr.map(name => ({ name, slug: slugify(name) }));

  // ---------- Boot ----------
  (async function init() {
    CARD.setAttribute('aria-busy', 'true');
    try {
      const { json } = await fetchFirst(SOURCES);

      // If pointer set schema to rc.venues.v1 OR we can detect the venues structure, use the new path
      if (schema === 'rc.venues.v1' || isVenuesV1(json)) {
        const root = json;

        const picked = pickShipFromVenuesV1(root);
        if (!picked || !picked.ship) {
          renderError(`No dining record found for “${DISPLAY}”.`);
          return;
        }

        const { incObjs, preObjs } = buildListsFromVenuesV1(root, picked.ship);
        renderOK(incObjs, preObjs);
        return;
      }

      // Legacy path (original behavior)
      let best = null, bestScore = -1;
      for (const cand of iterShips(json)) {
        const { name, slug } = idFrom(cand);
        const nName = normShip(name);
        const nSlug = norm(slug);
        const score =
          (shipSlug && nSlug && nSlug === shipSlug) ? 3 :
          (DISPLAY_N && nName && (nName === normShip(DISPLAY_N) || aliases.includes(nName))) ? 2 : 0;
        if (score > bestScore) { best = cand; bestScore = score; if (score === 3) break; }
      }

      if (!best) {
        renderError(`No dining record found for “${DISPLAY}”.`);
        return;
      }

      const pulled = pullDining(best);
      const inc = uniqueSortedStrings(pulled.inc);
      const pre = uniqueSortedStrings(pulled.pre);

      renderOK(toNameObjects(inc), toNameObjects(pre));
    } catch (err) {
      renderError(`Could not load dining data (${err?.message || err}).`);
    }
  })();
})();
