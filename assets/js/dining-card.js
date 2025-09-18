/* dining-card.js — robust Dining Venues card (v2.1)
   - Keeps the card-hero image (renders into #dining-content only)
   - Uses canonical RC JSON first (HTTPS), then fallbacks
   - Turns venue items into links to /restaurants.html#<slug>
*/
(() => {
  const CARD = document.querySelector('#dining-card');
  if (!CARD) return;
  const MOUNT = CARD.querySelector('#dining-content') || CARD;

  const SOURCES = [
    'https://www.cruisinginthewake.com/assets/data/rc-restaurants.json',
    'http://cruisinginthewake.com/assets/data/rc-restaurants.json',
    '/assets/data/rc-restaurants.json',
    '/assets/data/fleet_index.json',
    '/data/fleet_index.json'
  ];

  // Inline cfg (preferred: ship_slug)
  let shipSlug = '', aliases = [];
  const cfgHook = document.getElementById('dining-data-source');
  if (cfgHook) {
    try {
      const cfg = JSON.parse(cfgHook.textContent || '{}');
      shipSlug = (cfg.ship_slug || '').trim().toLowerCase();
      aliases = Array.isArray(cfg.aliases) ? cfg.aliases : [];
    } catch {}
  }

  function detectDisplayName(){
    const ds = (CARD.getAttribute('data-ship') || '').trim();
    if (ds) return ds;
    const titleName = (document.title || '').replace(/—.*/, '').trim();
    if (titleName) return titleName;
    const h = document.querySelector('h1,header h1,main h1,h2,header h2,main h2');
    return h ? (h.textContent || '').trim() : '';
  }
  const DISPLAY = detectDisplayName();

  const norm = s => String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const normShip = s => norm(s).replace(/’/g,"'").replace(/\s+of the seas$/,'');
  const TARGET_SLUG = shipSlug || '';
  const TARGET_NAME = DISPLAY ? normShip(DISPLAY) : '';

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

  function* iterShips(root){
    if (!root) return;
    if (Array.isArray(root)) { for (const it of root) yield it; return; }
    const buckets = [root.ships, root.brands, root.lines, root.royal, root.rcl];
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
              if (!vv) continue;
              if (Array.isArray(vv)) { for (const it of vv) yield it; }
              else if (typeof vv === 'object' && (vv.name || vv.title || vv.ship || vv.dining || vv.Included || vv.Premium)) yield vv;
            }
          }
        }
      }
    }
    for (const k of Object.keys(root)){
      const v = root[k];
      if (v && typeof v === 'object' && (v.name || v.title || v.ship || v.dining || v.Included || v.Premium)) yield v;
    }
  }

  const rcAlias = (s) => {
    const table = {
      "giovanni’s italian kitchen / jamie’s italian (varies by ship)":"giovannis-italian-kitchen",
      "giovanni’s italian kitchen":"giovannis-italian-kitchen",
      "jamie’s italian":"jamies-italian",
      "chops grille (steakhouse)":"chops-grille",
      "windjammer marketplace (buffet)":"windjammer-marketplace",
      "main dining room":"main-dining-room",
      "café promenade":"cafe-promenade",
      "el loco fresh":"el-loco-fresh",
      "izumi (sushi & hibachi)":"izumi",
      "playmakers sports bar & arcade":"playmakers-sports-bar-arcade",
      "johnny rockets":"johnny-rockets",
      "150 central park":"150-central-park",
      "hooked seafood":"hooked-seafood",
      "wonderland":"wonderland"
    };
    return table[s] || null;
  };

  const slugify = (label) => {
    const base = String(label||'')
      .replace(/\(.*?\)/g,'')        // remove parentheticals
      .split('/')[0]                 // take first if “A / B”
      .toLowerCase()
      .replace(/[’']/g,'')
      .replace(/&/g,'and')
      .replace(/[^a-z0-9\s-]/g,'')
      .trim()
      .replace(/\s+/g,'-');
    return rcAlias(base) || base;
  };

  function idFrom(obj){
    const name = obj?.name || obj?.title || obj?.ship || obj?.displayName || '';
    const slug = (obj?.slug || obj?.id || obj?.key || '').toString().toLowerCase();
    return { name, slug };
  }

  function pullDining(obj){
    const d = obj?.dining || obj?.venues || obj || {};
    const inc = d.included || d.complimentary || d.Included || d.Complimentary || [];
    const pre = d.premium || d.specialty || d.Premium || d.Specialty || d['Extra'] || d.extra || [];
    if (!inc.length && !pre.length && Array.isArray(d)){
      const INC=[], PRE=[];
      d.forEach(v=>{
        if (!v) return;
        const label = (typeof v==='string'?v:(v.name||v.title||v.label||'')).trim();
        const t = (typeof v==='string'?'':(v.type||'')).toLowerCase();
        if (!label) return;
        if (t.includes('prem') || t.includes('spec') || v.fee===true) PRE.push(label); else INC.push(label);
      });
      return { inc:INC, pre:PRE };
    }
    return { inc: inc.slice?.()||[], pre: pre.slice?.()||[] };
  }

  function uniqueSorted(list){
    const seen=new Set();
    return (list||[])
      .map(v => typeof v==='string' ? v.trim() : (v?.name||v?.title||'').trim())
      .filter(Boolean)
      .filter(v => { const k=norm(v); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a,b)=> a.localeCompare(b, undefined, { sensitivity:'base' }));
  }

  const linkify = (arr) =>
    arr.map(label => {
      const slug = slugify(label);
      const href = `/restaurants.html#${slug}`;
      return `<li><a href="${href}">${label}</a></li>`;
    });

  function renderOK(srcUrl, shipLabel, inc, pre){
    const head = `
      <h2 id="diningHeading">Dining Venues on ${shipLabel}</h2>
      <p class="tiny">This list is generated from <code>rc-restaurants.json</code> (<span class="src">${srcUrl.replace(/^https?:\/\//,'/')}</span>).</p>
    `;
    const block = (title, items, id) => `
      <section class="venue-block" aria-labelledby="${id}">
        <h3 id="${id}">${title} <span class="count" aria-hidden="true">(${items.length})</span></h3>
        ${items.length ? `<ul class="venue-list">${linkify(items).join('')}</ul>` : `<p class="tiny">No ${title.toLowerCase()} listed yet.</p>`}
      </section>`;
    MOUNT.innerHTML = head + `<div class="venues two-col">${block('Included (Complimentary)', inc, 'incHeading')}${block('Premium (Specialty / Extra Charge)', pre, 'preHeading')}</div>`;
    CARD.removeAttribute('aria-busy');
  }

  function renderError(msg){
    MOUNT.innerHTML = `<h2 id="diningHeading">Dining Venues</h2><p class="tiny" role="alert">${msg}</p>`;
    CARD.removeAttribute('aria-busy');
  }

  (async function init(){
    CARD.setAttribute('aria-busy','true');
    if (!TARGET_SLUG && !TARGET_NAME && !aliases.length){ renderError('Ship name not detected on the page.'); return; }

    try{
      const { json, url } = await fetchFirst(SOURCES);

      let best=null, bestScore=-1;
      const aliasSet = new Set([TARGET_NAME, ...aliases.map(normShip)].filter(Boolean));

      for (const cand of iterShips(json)){
        const { name, slug } = idFrom(cand);
        const nName = normShip(name);
        const nSlug = norm(slug);

        let score = 0;
        if (TARGET_SLUG && nSlug && nSlug === TARGET_SLUG) score = 3;
        else if ((nName && aliasSet.has(nName)) || (TARGET_NAME && nName === TARGET_NAME)) score = 2;
        else if (TARGET_NAME && nName && (nName.includes(TARGET_NAME) || TARGET_NAME.includes(nName))) score = 1;

        if (score > bestScore){ best=cand; bestScore=score; if (score===3) break; }
      }
      if (!best){ renderError(`No dining record found for “${DISPLAY}”.`); return; }

      const pulled = pullDining(best);
      const inc = uniqueSorted(pulled.inc);
      const pre = uniqueSorted(pulled.pre);
      renderOK(url, DISPLAY || (idFrom(best).name || 'This Ship'), inc, pre);
    }catch(err){
      renderError(`Could not load dining data (${err?.message || err}).`);
    }
  })();
})();
