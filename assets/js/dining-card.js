/* dining-card.js — robust Dining Venues card (v2)
   Looks for RC first at the canonical URL, then falls back to legacy paths.
   Works with many JSON shapes and casing differences.
*/
(() => {
  const CARD = document.querySelector('#dining-card');
  if (!CARD) return;

  // ----- CONFIG: canonical-first, then fallbacks (https before http to avoid mixed-content) -----
  const SOURCES = [
    'https://www.cruisinginthewake.com/assets/data/rc-restaurants.json',
    'http://cruisinginthewake.com/assets/data/rc-restaurants.json',
    '/assets/data/rc-restaurants.json',
    '/assets/data/fleet_index.json',
    '/data/fleet_index.json'
  ];

  // Optional inline config hook:
  let shipSlug = '';
  const cfgHook = document.getElementById('dining-data-source');
  if (cfgHook) {
    try { shipSlug = (JSON.parse(cfgHook.textContent || '{}').ship_slug || '').trim(); } catch {}
  }

  // Detect display name from data-ship, <title>, or first H1/H2
  function detectDisplayName(){
    const ds = (CARD.getAttribute('data-ship') || '').trim();
    if (ds) return ds;
    const titleName = (document.title || '').replace(/—.*/, '').trim();
    if (titleName) return titleName;
    const h = document.querySelector('h1,header h1,main h1,h2,header h2,main h2');
    return h ? (h.textContent || '').trim() : '';
  }

  const DISPLAY_NAME = detectDisplayName();

  // Normalizers
  const norm = s => String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const normShip = s => norm(s).replace(/’/g,"'").replace(/\s+of the seas$/,''); // “of the seas” tolerant

  const targetKey = shipSlug ? norm(shipSlug) : '';
  const targetName = DISPLAY_NAME ? normShip(DISPLAY_NAME) : '';

  // Fetch first source that responds with ok JSON
  async function fetchFirst(urls){
    let lastErr;
    for (const url of urls){
      try{
        const res = await fetch(url, { credentials:'omit', cache:'default' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return { json, url };
      }catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('All data sources failed');
  }

  // Iterate over many plausible shapes and yield ship-like objects
  function* iterShips(root){
    if (!root) return;
    // 1) Root array of ships
    if (Array.isArray(root)) { for (const it of root) yield it; return; }

    // 2) Common containers
    const buckets = [];
    if (root.ships) buckets.push(root.ships);
    if (root.brands) buckets.push(root.brands);
    if (root.lines) buckets.push(root.lines);
    if (root.royal || root.rcl) buckets.push(root.royal || root.rcl);

    for (const b of buckets){
      if (!b) continue;
      if (Array.isArray(b)) { for (const it of b) yield it; }
      else if (typeof b === 'object'){
        for (const k of Object.keys(b)){
          const v = b[k];
          if (!v) continue;
          if (Array.isArray(v)) { for (const it of v) yield it; }
          else if (typeof v === 'object'){
            // If keyed by slug -> ship object
            if (v.name || v.title || v.ship || v.dining || v.Included || v.Premium) yield v;
            // Or nested again
            for (const kk of Object.keys(v)){
              const vv = v[kk];
              if (vv && (vv.name || vv.title || vv.ship || vv.dining || vv.Included || vv.Premium || Array.isArray(vv))) {
                if (Array.isArray(vv)) { for (const it of vv) yield it; }
                else yield vv;
              }
            }
          }
        }
      }
    }

    // 3) Last-resort: scan every object property
    for (const k of Object.keys(root)){
      const v = root[k];
      if (v && typeof v === 'object' && (v.name || v.title || v.ship || v.dining || v.Included || v.Premium)) yield v;
    }
  }

  // Extract a candidate's identifiers
  function idFrom(obj){
    const name = obj?.name || obj?.title || obj?.ship || obj?.displayName || '';
    const slug = obj?.slug || obj?.id || obj?.key || '';
    return { name, slug };
  }

  // Pull lists regardless of casing/shape
  function pullDining(obj){
    const d = obj?.dining || obj?.venues || obj || {};

    // Case-insensitive fields
    const inc = d.included || d.complimentary || d.Included || d.Complimentary || [];
    const pre = d.premium || d.specialty || d.Premium || d.Specialty || d['Extra'] || d.extra || [];

    // Array-of-objects fallback: [{name:'Chops', type:'premium'}]
    if (!inc.length && !pre.length && Array.isArray(d)){
      const INC = [], PRE = [];
      d.forEach(v => {
        if (!v) return;
        const label = (typeof v === 'string' ? v : (v.name || v.title || v.label || '')).trim();
        const t = (typeof v === 'string' ? '' : (v.type || '')).toLowerCase();
        if (!label) return;
        if (t.includes('prem') || t.includes('spec') || v.fee === true) PRE.push(label); else INC.push(label);
      });
      return { inc: INC, pre: PRE };
    }

    return { inc: inc.slice?.() || [], pre: pre.slice?.() || [] };
  }

  function uniqueSorted(list){
    const seen = new Set();
    return (list||[])
      .map(v => typeof v === 'string' ? v.trim() : (v?.name || v?.title || '').trim())
      .filter(Boolean)
      .filter(v => { const k = norm(v); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a,b)=> a.localeCompare(b, undefined, { sensitivity:'base' }));
  }

  function renderOK(srcUrl, shipLabel, inc, pre){
    const head = `
      <h2 id="diningHeading">Dining Venues on ${shipLabel}</h2>
      <p class="tiny">This list is generated from <code>rc-restaurants.json</code> (<span class="src">${srcUrl}</span>).</p>
    `;
    const block = (title, arr, id) => `
      <section class="venue-block" aria-labelledby="${id}">
        <h3 id="${id}">${title} <span class="count" aria-hidden="true">(${arr.length})</span></h3>
        ${arr.length ? `<ul class="venue-list">${arr.map(v=>`<li>${v}</li>`).join('')}</ul>` : `<p class="tiny">No ${title.toLowerCase()} listed yet.</p>`}
      </section>`;

    CARD.innerHTML = head + `<div class="venues two-col">${block('Included (Complimentary)', inc, 'incHeading')}${block('Premium (Specialty / Extra Charge)', pre, 'preHeading')}</div>`;
    CARD.removeAttribute('aria-busy');
  }

  function renderError(msg){
    CARD.innerHTML = `<h2 id="diningHeading">Dining Venues</h2><p class="tiny" role="alert">${msg}</p>`;
    CARD.removeAttribute('aria-busy');
  }

  (async function init(){
    CARD.setAttribute('aria-busy','true');

    // Must have at least a name (slug is optional)
    if (!targetKey && !targetName) {
      renderError('Ship name not detected on the page.');
      return;
    }

    try{
      const { json, url } = await fetchFirst(SOURCES);

      // Pick best candidate
      let best = null, bestScore = -1;
      for (const cand of iterShips(json)){
        const { name, slug } = idFrom(cand);
        const nName = normShip(name);
        const nSlug = norm(slug);

        let score = 0;
        if (targetKey && nSlug && nSlug === targetKey) score = 3;
        else if (targetName && nName && nName === targetName) score = 2;
        else if (targetName && nName && (nName.includes(targetName) || targetName.includes(nName))) score = 1;

        if (score > bestScore) { best = cand; bestScore = score; if (score === 3) break; }
      }

      if (!best) { renderError(`No dining record found for “${DISPLAY_NAME}”.`); return; }

      const pulled = pullDining(best);
      const inc = uniqueSorted(pulled.inc);
      const pre = uniqueSorted(pulled.pre);

      renderOK(url, DISPLAY_NAME || (idFrom(best).name || 'This Ship'), inc, pre);
    }catch(err){
      renderError(`Could not load dining data (${err?.message || err}).`);
    }
  })();
})();
