/* dining-card.js — Dining Venues card (v2.241)
   - Uses canonical RC data first, then fallbacks
   - Preserves the card hero image by rendering into .dining-content
   - Links each venue to the Restaurants page anchor
*/
(() => {
  const CARD = document.querySelector('#dining-card');
  if (!CARD) return;

  const SLOT = CARD.querySelector('#dining-content') || CARD;

  // Canonical-first, then fallbacks (https before http to avoid mixed content)
  const SOURCES = [
    'https://www.cruisinginthewake.com/assets/data/rc-restaurants.json',
    'http://cruisinginthewake.com/assets/data/rc-restaurants.json',
    '/assets/data/rc-restaurants.json',
    '/assets/data/fleet_index.json',
    '/data/fleet_index.json'
  ];

  // Inline hook
  let shipSlug = '', provider = 'rcl';
  const cfgHook = document.getElementById('dining-data-source');
  if (cfgHook) {
    try {
      const cfg = JSON.parse(cfgHook.textContent || '{}');
      shipSlug = (cfg.ship_slug || '').trim();
      provider = (cfg.provider || 'rcl').trim();
    } catch {}
  }

  // Detect display name
  const displayName = (CARD.getAttribute('data-ship') || '')
    || (document.title || '').replace(/—.*/, '').trim()
    || (document.querySelector('h1,header h1,main h1,h2,header h2,main h2')?.textContent || '').trim();

  // Normalizers
  const norm = s => String(s||'').trim().toLowerCase().replace(/\s+/g,' ').replace(/’/g,"'");
  const normShip = s => norm(s).replace(/\s+of the seas$/,'');
  const targetKey = shipSlug ? norm(shipSlug) : '';
  const targetName = displayName ? normShip(displayName) : '';

  // Fetch-first helper
  async function fetchFirst(urls){
    let lastErr;
    for (const url of urls){
      try{
        const r = await fetch(url, { credentials:'omit', cache:'default' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        return { j, url };
      }catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('All data sources failed');
  }

  // Iterate possible ship objects
  function* iterShips(root){
    if (!root) return;
    if (Array.isArray(root)) { for (const it of root) yield it; return; }
    const pools = [root.ships, root.royal, root.rcl, root.lines, root.brands, root];
    for (const p of pools){
      if (!p) continue;
      const coll = Array.isArray(p) ? p : Object.values(p);
      for (const it of coll){
        if (!it) continue;
        if (it.ships) {
          const inner = Array.isArray(it.ships)? it.ships : Object.values(it.ships);
          for (const s of inner) yield s;
        } else {
          yield it;
        }
      }
    }
  }

  // Pull identifiers
  const ids = o => ({ name: o?.name || o?.title || o?.ship || '', slug: o?.slug || o?.id || o?.key || '' });

  // Pull venues regardless of casing/shape
  function pullDining(obj){
    const d = obj?.dining || obj?.venues || obj || {};
    const included = d.included || d.complimentary || d.Included || d.Complimentary || [];
    const premium  = d.premium || d.specialty || d.Premium || d.Specialty || d.extra || d.Extra || [];
    if (!included.length && !premium.length && Array.isArray(d)){
      const inc=[], pre=[];
      d.forEach(v=>{
        const label = (typeof v==='string'? v : (v.name||v.title||v.label||'')).trim();
        const t = (typeof v==='string'? '' : (v.type||'')).toLowerCase();
        if (!label) return;
        if (t.includes('prem') || t.includes('spec') || v.fee===true) pre.push(label); else inc.push(label);
      });
      return { included:inc, premium:pre };
    }
    return { included, premium };
  }

  // Unique + sort
  function uniqSort(list){
    const seen = new Set();
    return (list||[])
      .map(v => typeof v === 'string' ? v.trim() : (v?.name || v?.title || v?.label || '').trim())
      .filter(Boolean)
      .filter(v => { const k = norm(v); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a,b)=> a.localeCompare(b, undefined, { sensitivity:'base' }));
  }

  // Slugify to anchor id used on Restaurants page
  const slugify = s => norm(s).replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const restaurantsHref = name => `/restaurants.html#${slugify(name)}`;

  function renderOK(srcUrl, shipLabel, inc, pre){
    const head = `
      <p class="tiny">This list is generated from <code>rc-restaurants.json</code> (<span class="src">${srcUrl.replace(/^https?:\/\//,'/')}</span>).</p>
    `;
    const list = (title, arr, id) => `
      <section class="venue-block" aria-labelledby="${id}">
        <h3 id="${id}">${title} <span class="count" aria-hidden="true">(${arr.length})</span></h3>
        ${arr.length
          ? `<ul class="venue-list">${arr.map(v=>`<li><a href="${restaurantsHref(v)}">${v}</a></li>`).join('')}</ul>`
          : `<p class="tiny">No ${title.toLowerCase()} listed yet.</p>`
        }
      </section>`;
    SLOT.innerHTML = head + `<div class="venues two-col">${list('Included (Complimentary)', inc, 'incHeading')}${list('Premium (Specialty / Extra Charge)', pre, 'preHeading')}</div>`;
    CARD.removeAttribute('aria-busy');
  }

  function renderError(msg){
    SLOT.innerHTML = `<p class="tiny" role="alert">${msg}</p>`;
    CARD.removeAttribute('aria-busy');
  }

  (async function init(){
    CARD.setAttribute('aria-busy','true');
    if (!targetKey && !targetName){ renderError('Ship name not detected on the page.'); return; }

    try{
      const { j, url } = await fetchFirst(SOURCES);

      let best=null, score=-1;
      for (const c of iterShips(j)){
        const { name, slug } = ids(c);
        const nSlug = norm(slug), nName = normShip(name);
        let s = 0;
        if (targetKey && nSlug && nSlug===targetKey) s = 3;
        else if (targetName && nName && nName===targetName) s = 2;
        else if (targetName && nName && (nName.includes(targetName) || targetName.includes(nName))) s = 1;
        if (s>score){ best=c; score=s; if (s===3) break; }
      }
      if (!best){ renderError(`No dining record found for “${displayName}”.`); return; }

      const { included, premium } = pullDining(best);
      renderOK(url, displayName, uniqSort(included), uniqSort(premium));
    }catch(err){
      renderError(`Could not load dining data (${err?.message || err}).`);
    }
  })();
})();
