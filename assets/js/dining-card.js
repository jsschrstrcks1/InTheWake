/* dining-card.js — robust Dining Venues card (v2.242)
   - Writes into #dining-content if present (preserves the top image)
   - Canonical-first fetch for RC JSON
   - Flexible schema readers
*/
(() => {
  const CARD = document.querySelector('#dining-card');
  if (!CARD) return;

  const TARGET = CARD.querySelector('#dining-content') || CARD; // <-- write here
  const SOURCES = [
    'https://www.cruisinginthewake.com/assets/data/rc-restaurants.json',
    'http://cruisinginthewake.com/assets/data/rc-restaurants.json',
    '/assets/data/rc-restaurants.json',
    '/assets/data/fleet_index.json',
    '/data/fleet_index.json'
  ];

  let shipSlug = '';
  const cfgHook = document.getElementById('dining-data-source');
  if (cfgHook) { try { shipSlug = (JSON.parse(cfgHook.textContent || '{}').ship_slug || '').trim(); } catch {} }

  function detectDisplayName(){
    const ds = (CARD.getAttribute('data-ship') || '').trim();
    if (ds) return ds;
    const t = (document.title || '').replace(/—.*/, '').trim();
    if (t) return t;
    const h = document.querySelector('h1,header h1,main h1,h2,header h2,main h2');
    return h ? (h.textContent || '').trim() : '';
  }

  const DISPLAY_NAME = detectDisplayName();
  const norm = s => String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const normShip = s => norm(s).replace(/’/g,"'").replace(/\s+of the seas$/,'');
  const targetKey = shipSlug ? norm(shipSlug) : '';
  const targetName = DISPLAY_NAME ? normShip(DISPLAY_NAME) : '';

  async function fetchFirst(list){
    let lastErr;
    for (const u of list){
      try{
        const r = await fetch(u, {cache:'default', credentials:'omit'});
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return { json: await r.json(), url: u };
      }catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('All data sources failed');
  }

  function* iterShips(root){
    if (!root) return;
    if (Array.isArray(root)) { for (const it of root) yield it; return; }
    const buckets = [root.ships, root.brands, root.lines, root.royal, root.rcl, root];
    for (const b of buckets){
      if (!b) continue;
      if (Array.isArray(b)) { for (const it of b) yield it; }
      else if (typeof b === 'object'){
        for (const k of Object.keys(b)){
          const v = b[k];
          if (!v) continue;
          if (Array.isArray(v)) { for (const it of v) yield it; }
          else if (typeof v === 'object'){
            if (v.name || v.title || v.ship || v.dining || v.Included || v.Premium) yield v;
            for (const kk of Object.keys(v)){
              const vv = v[kk];
              if (vv && (vv.name || vv.title || vv.ship || vv.dining || vv.Included || vv.Premium || Array.isArray(vv))){
                if (Array.isArray(vv)) { for (const it of vv) yield it; } else yield vv;
              }
            }
          }
        }
      }
    }
  }

  function idFrom(obj){
    return {
      name: obj?.name || obj?.title || obj?.ship || obj?.displayName || '',
      slug: obj?.slug || obj?.id || obj?.key || ''
    };
  }

  function pullDining(obj){
    const d = obj?.dining || obj?.venues || obj || {};
    const inc = d.included || d.complimentary || d.Included || d.Complimentary || [];
    const pre = d.premium || d.specialty || d.Premium || d.Specialty || d['Extra'] || d.extra || [];
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

  // Pretty blurb (replaces the old “generated from …” line)
  const DINING_PROSE =
    'Set sail through a world of flavors on board, where complimentary main dining and casual bites keep your voyage fueled, while premium specialty restaurants offer exclusive culinary adventures worth charting a course for.';

  function renderOK(shipLabel, inc, pre){
    const block = (title, arr, id) => `
      <section class="venue-block" aria-labelledby="${id}">
        <h3 id="${id}">${title} <span class="count" aria-hidden="true">(${arr.length})</span></h3>
        ${arr.length ? `<ul class="venue-list">${arr.map(v=>`<li>${v}</li>`).join('')}</ul>` : `<p class="tiny">No ${title.toLowerCase()} listed yet.</p>`}
      </section>`;

    TARGET.innerHTML = `
      <p class="small">${DINING_PROSE}</p>
      <div class="venues two-col">
        ${block('Included (Complimentary)', inc, 'incHeading')}
        ${block('Premium (Specialty / Extra Charge)', pre, 'preHeading')}
      </div>`;
    CARD.removeAttribute('aria-busy');
  }

  function renderError(msg){
    TARGET.innerHTML = `<p class="tiny" role="alert">${msg}</p>`;
    CARD.removeAttribute('aria-busy');
  }

  (async function init(){
    CARD.setAttribute('aria-busy','true');
    if (!targetKey && !targetName) { renderError('Ship name not detected on the page.'); return; }

    try{
      const { json } = await fetchFirst(SOURCES);

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
      renderOK(DISPLAY_NAME || (idFrom(best).name || 'This Ship'),
               uniqueSorted(pulled.inc),
               uniqueSorted(pulled.pre));
    }catch(err){
      renderError(`Could not load dining data (${err?.message || err}).`);
    }
  })();
})();
