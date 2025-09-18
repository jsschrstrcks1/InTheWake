/* dining-card.js — builds the Dining Venues card
   Priority: hook.json (e.g., /assets/data/rc-restaurants.json) → /assets/data/fleet_index.json → /data/fleet_index.json
   Expects: <section id="dining-card" class="card" data-ship="..."> … <script id="dining-data-source">{...}</script> … </section>
   Renders two lists: Included (complimentary) and Premium (specialty)
*/

(function(){
  const CARD = document.querySelector('#dining-card');
  if (!CARD) return;

  // --- detect name from page (fallbacks) ---
  function detectShipName(){
    const ds = (CARD.getAttribute('data-ship') || '').trim();
    if (ds) return ds;
    const t = (document.title || '').replace(/—.*$/, '').trim();
    if (t) return t;
    const h = document.querySelector('h1, header h1, main h1, h2, header h2, main h2');
    return h ? (h.textContent || '').trim() : '';
  }
  const DISPLAY_NAME = detectShipName();

  // --- read hook config (preferred source) ---
  let cfg = {};
  const hookEl = document.getElementById('dining-data-source');
  if (hookEl) {
    try { cfg = JSON.parse(hookEl.textContent || '{}'); } catch(_) {}
  }
  const provider = (cfg.provider || '').toLowerCase();
  const slug     = (cfg.ship_slug || '').toLowerCase();
  const aliases  = Array.isArray(cfg.aliases) ? cfg.aliases : [];
  const preferredJSON =
    cfg.json ||
    (provider ? `/assets/data/${provider}-restaurants.json` : null);

  const SOURCES = [
    preferredJSON,
    '/assets/data/fleet_index.json',
    '/data/fleet_index.json'
  ].filter(Boolean);

  // --- utils ---
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s || '').trim().toLowerCase()
      .replace(/\s+/g,' ').replace(/’/g,"'");

  // create/locate a safe content container so we don’t nuke your header/image
  let content = CARD.querySelector('#dining-content');
  if (!content) {
    content = document.createElement('div');
    content.id = 'dining-content';
    CARD.appendChild(content);
  }

  function setBusy(on){ CARD.setAttribute('aria-busy', on ? 'true' : 'false'); }
  function showError(msg){
    content.innerHTML = `<p class="tiny" role="alert">Could not load dining data: ${esc(msg)}</p>`;
  }

  async function fetchFirst(urls){
    let lastErr;
    for (const u of urls){
      try {
        const r = await fetch(u, {credentials:'omit', cache:'default'});
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return {json: await r.json(), url: u};
      } catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('No data sources reachable');
  }

  // iterate flexible JSON shapes
  function* walk(root){
    if (!root) return;
    if (Array.isArray(root)) { for (const x of root) yield x; return; }
    if (typeof root === 'object') {
      // common shapes
      if (root.ships) yield* walk(root.ships);
      if (root.venues || root.dining || root.name || root.slug) yield root;
      for (const k of Object.keys(root)) {
        if (k === 'ships') continue;
        const v = root[k];
        if (v && typeof v === 'object') yield* walk(v);
      }
    }
  }

  function pickDining(node){
    const d = node?.dining || node?.venues || {};
    const included = d.included || d.complimentary || [];
    const premium  = d.premium  || d.specialty     || d.extra || [];
    if (!included.length && !premium.length && Array.isArray(d)) {
      const inc=[], pre=[];
      d.forEach(v=>{
        if (!v) return;
        const name = typeof v === 'string' ? v : (v.name || v.title || v.label || '');
        const fee  = typeof v === 'object' && (v.type||'').toLowerCase().includes('prem') || v.fee === true;
        (fee ? pre : inc).push(name);
      });
      return {included:inc, premium:pre};
    }
    return {included, premium};
  }

  function dedupeSort(list){
    const out = [];
    (list||[]).forEach(v=>{
      const s = (typeof v === 'string' ? v : (v.name || v.title || v.label || '')).toString().trim();
      if (s) out.push(s);
    });
    const seen = new Set();
    return out.filter(x=>{ const k=norm(x); if (seen.has(k)) return false; seen.add(k); return true; })
              .sort((a,b)=>a.localeCompare(b, undefined, {sensitivity:'base'}));
  }

  function renderLists(inc, pre, srcUrl){
    const section = (title, arr, id) => {
      const c = arr.length;
      return `<section class="venue-block" aria-labelledby="${id}">
        <h3 id="${id}">${esc(title)} <span class="count" aria-hidden="true">(${c})</span></h3>
        ${c ? `<ul class="venue-list">` + arr.map(v=>`<li>${esc(v)}</li>`).join('') + `</ul>`
             : `<p class="tiny">No ${esc(title).toLowerCase()} listed.</p>`}
      </section>`;
    };
    content.innerHTML =
      `<p class="small">This list is generated from <code>${esc(srcUrl)}</code>.</p>
       <div class="venues two-col">
         ${section('Included (Complimentary)', inc, 'incHeading')}
         ${section('Premium (Specialty / Extra Charge)', pre, 'preHeading')}
       </div>`;
  }

  (async function init(){
    try {
      setBusy(true);
      const {json, url} = await fetchFirst(SOURCES);
      // preferred: slug → aliases → display name
      const wantSlug = slug;
      const wantNames = [DISPLAY_NAME, ...aliases].map(norm).filter(Boolean);

      let best = null;
      for (const node of walk(json)){
        const nName = norm(node?.name || node?.ship || node?.title || node?.displayName || '');
        const nSlug = norm(node?.slug || '');
        if (wantSlug && nSlug === wantSlug) { best = node; break; }
        if (!best && nSlug && wantNames.some(x => x === nSlug)) best = node;
        if (!best && nName && wantNames.some(x => x === nName)) best = node;
        if (!best && nName && wantNames.some(x => nName.includes(x) || x.includes(nName))) best = node;
      }

      if (!best) {
        showError(`No dining record found for “${DISPLAY_NAME}”.`);
        setBusy(false);
        return;
      }

      const {included, premium} = pickDining(best);
      renderLists(dedupeSort(included), dedupeSort(premium), url);
      setBusy(false);
    } catch (e) {
      showError(e && e.message ? e.message : String(e));
      setBusy(false);
    }
  })();
})();
