/* dining-card.js — robust Dining Venues card (v2.243)
   - Canonical RC JSON first; graceful fallbacks
   - Keeps the top hero image by writing into #dining-content
   - Links each venue to /restaurants.html#<venue-slug>
   - Ship detection: slug (preferred) or relaxed name
*/
(() => {
  const CARD = document.querySelector('#dining-card');
  if (!CARD) return;

  const CONTENT = CARD.querySelector('#dining-content') || CARD;

  const SOURCES = [
    'https://www.cruisinginthewake.com/assets/data/rc-restaurants.json',
    'http://cruisinginthewake.com/assets/data/rc-restaurants.json',
    '/assets/data/rc-restaurants.json'
  ];

  // Inline config hook (prefers slug)
  let shipSlug = '', aliases = [];
  const cfgHook = document.getElementById('dining-data-source');
  if (cfgHook) {
    try {
      const cfg = JSON.parse(cfgHook.textContent || '{}');
      shipSlug = (cfg.ship_slug || '').trim();
      aliases = Array.isArray(cfg.aliases) ? cfg.aliases : [];
    } catch {}
  }

  // Detect display name (fallbacks)
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
  const norm = s => String(s||'').toLowerCase().replace(/’/g,"'").trim();
  const normShip = s => norm(s).replace(/\s+of the seas$/,'');
  const targetKey = shipSlug ? norm(shipSlug) : '';
  const targetName = DISPLAY_NAME ? normShip(DISPLAY_NAME) : '';

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
    throw lastErr || new Error('All dining data sources failed');
  }

  function* iterShips(root){
    if (!root) return;
    if (Array.isArray(root)) { for (const it of root) yield it; return; }
    const buckets = [root.ships, root.brands, root.lines, root.royal, root.rcl, root.royal_caribbean, root];
    for (const b of buckets){
      const list = Array.isArray(b) ? b : (b && typeof b==='object' ? Object.values(b) : []);
      for (const v of list){
        if (!v) continue;
        if (v && (v.name||v.title||v.ship||v.slug||v.id||v.dining||v.Included||v.Premium)) yield v;
      }
    }
  }

  const idFrom = (o) => ({
    name: o?.name || o?.title || o?.ship || o?.displayName || '',
    slug: o?.slug || o?.id || ''
  });

  function pullDining(obj){
    const d = obj?.dining || obj?.venues || obj || {};
    const inc = d.included || d.complimentary || d.Included || d.Complimentary || [];
    const pre = d.premium || d.specialty || d.Premium || d.Specialty || d.extra || d.Extra || [];
    if (!inc.length && !pre.length && Array.isArray(d)){
      const INC=[], PRE=[];
      d.forEach(v=>{
        if (!v) return;
        const label = (typeof v==='string' ? v : (v.name||v.title||v.label||'')).trim();
        const t = (typeof v==='string' ? '' : (v.type||'')).toLowerCase();
        if (!label) return;
        if (t.includes('prem') || t.includes('spec') || v.fee===true) PRE.push(label); else INC.push(label);
      });
      return { inc:INC, pre:PRE };
    }
    return { inc: inc.slice?.()||[], pre: pre.slice?.()||[] };
  }

  function uniqSort(list){
    const seen=new Set();
    return (list||[])
      .map(v => typeof v==='string' ? v.trim() : (v?.name||v?.title||'').trim())
      .filter(Boolean)
      .filter(v=>{const k=norm(v); if(seen.has(k)) return false; seen.add(k); return true;})
      .sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  }

  const slugify = (s) => norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

  function renderOK(shipLabel, inc, pre){
    const intro = `
      <p class="small">Set sail through a world of flavors on board, where complimentary main dining and casual bites keep your voyage fueled, while premium specialty restaurants offer exclusive culinary adventures worth charting a course for.</p>
    `;

    const toList = (arr) => arr.length
      ? `<ul class="venue-list">${arr.map(v=>{
           const id=slugify(v);
           const href=`/restaurants.html#${id}`;
           return `<li><a href="${href}">${v}</a></li>`;
         }).join('')}</ul>`
      : `<p class="tiny">No venues listed yet.</p>`;

    const html = `
      ${intro}
      <div class="venues two-col">
        <section class="venue-block" aria-labelledby="incHeading">
          <h3 id="incHeading">Included (Complimentary) <span class="count" aria-hidden="true">(${inc.length})</span></h3>
          ${toList(inc)}
        </section>
        <section class="venue-block" aria-labelledby="preHeading">
          <h3 id="preHeading">Premium (Specialty / Extra Charge) <span class="count" aria-hidden="true">(${pre.length})</span></h3>
          ${toList(pre)}
        </section>
      </div>`;
    CONTENT.innerHTML = html;
    CARD.removeAttribute('aria-busy');
  }

  function renderError(msg){
    CONTENT.innerHTML = `<p class="tiny" role="alert">${msg}</p>`;
    CARD.removeAttribute('aria-busy');
  }

  (async function init(){
    CARD.setAttribute('aria-busy','true');
    if (!targetKey && !targetName) { renderError('Ship name not detected.'); return; }

    try{
      const { json } = await fetchFirst(SOURCES);
      let best=null, score=-1;

      for (const cand of iterShips(json)){
        const { name, slug } = idFrom(cand);
        const nName = normShip(name);
        const nSlug = norm(slug);
        let s=0;
        if (targetKey && nSlug && nSlug===targetKey) s=4;
        else if (targetName && nName && nName===targetName) s=3;
        else if (aliases.length && aliases.map(normShip).includes(nName)) s=2;
        else if (targetName && nName && (nName.includes(targetName)||targetName.includes(nName))) s=1;
        if (s>score){ best=cand; score=s; if (s===4) break; }
      }

      if (!best){ renderError(`No dining record found for “${DISPLAY_NAME}”.`); return; }

      const { inc, pre } = pullDining(best);
      renderOK(DISPLAY_NAME || idFrom(best).name || 'This Ship', uniqSort(inc), uniqSort(pre));
    }catch(err){
      renderError(`Could not load dining data (${err?.message||err}).`);
    }
  })();
})();
