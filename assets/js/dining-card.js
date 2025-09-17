/* dining-card.js — builds the Dining Venues card from fleet_index.json
   - Tries /assets/data/fleet_index.json, then /data/fleet_index.json
   - Expects a <section id="dining-card" class="card" data-ship="..."></section> in the DOM
   - Supports flexible JSON shapes (array or object, nested by brand/class, etc.)
   - Renders two lists: Included (complimentary) and Premium (extra charge)
   - Degrades gracefully if data missing; no layout breakage
*/
(function(){
  const CARD_SELECTOR = '#dining-card';
  const SOURCES = ['/assets/data/fleet_index.json', '/data/fleet_index.json'];

  const $card = document.querySelector(CARD_SELECTOR);
  if (!$card) return; // nothing to do

  // 1) Work out the ship name we should lookup
  function detectShipName(){
    // Preferred: data-ship attr on the dining card
    const ds = ($card.getAttribute('data-ship') || '').trim();
    if (ds) return ds;

    // Fallback: parse document <title> like "Grandeur of the Seas — In the Wake"
    const t = (document.title || '').replace(/—.*$/, '').trim();
    if (t) return t;

    // Last resort: h1/h2 text on the page (common on ship pages)
    const h = document.querySelector('h1, header h1, main h1, h2, header h2, main h2');
    return h ? (h.textContent || '').trim() : '';
  }

  const SHIP_NAME = detectShipName();

  // Util: HTML escape (avoid weird names breaking markup)
  function esc(s){
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  // 2) Fetch JSON (first hit wins); allow CORS/cache as default
  async function fetchFirst(paths){
    let lastErr;
    for (const url of paths){
      try{
        const res = await fetch(url, { credentials:'omit', cache:'default' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return { json, url };
      }catch(err){
        lastErr = err;
      }
    }
    throw lastErr || new Error('No data sources reachable');
  }

  // 3) Walk a very flexible schema to find the ship record
  // Acceptable shapes include:
  //  a) { ships:[{name:'Grandeur of the Seas', dining:{included:[], premium:[]}}] }
  //  b) [{name:'Grandeur of the Seas', ...}, ...]
  //  c) { rcl:{ ships:[...] }, carnival:{...}, ...}
  //  d) { "Grandeur of the Seas": { dining:{...} }, ... }
  function* iterateShipCandidates(root){
    if (!root) return;
    // direct array
    if (Array.isArray(root)){
      for (const it of root) yield it;
      return;
    }
    // object with ships array or object
    if (root.ships){
      const s = root.ships;
      if (Array.isArray(s)){
        for (const it of s) yield it;
      }else if (s && typeof s === 'object'){
        for (const k of Object.keys(s)) yield s[k];
      }
    }
    // nested brands/classes
    for (const key of Object.keys(root)){
      if (key === 'ships') continue;
      const v = root[key];
      if (!v) continue;
      if (Array.isArray(v)){
        for (const it of v) yield it;
      }else if (typeof v === 'object'){
        // dive 1 level
        if (v.ships){
          const s = v.ships;
          if (Array.isArray(s)){
            for (const it of s) yield it;
          }else if (s && typeof s === 'object'){
            for (const k of Object.keys(s)) yield s[k];
          }
        }
        // yield nested plain ship-like objects as well
        for (const k of Object.keys(v)){
          const vv = v[k];
          if (vv && typeof vv === 'object' && (vv.name || vv.ship || vv.title || vv.dining)){
            yield vv;
          }
        }
      }
    }
    // object keyed by ship name
    for (const k of Object.keys(root)){
      const v = root[k];
      if (v && typeof v === 'object' && (v.dining || v.venues)){
        // attach key as a name if missing
        yield Object.assign({ name: k }, v);
      }
    }
  }

  function normalizeName(x){
    return (x || '').toString().trim().toLowerCase()
      .replace(/\s+/g,' ')
      .replace(/ of the seas$/,'') // allow matching without suffix too
      .replace(/’/g,"'");
  }

  function candidateName(obj){
    return obj?.name || obj?.ship || obj?.title || obj?.displayName || '';
  }

  function pickDining(obj){
    // Look for obj.dining.included/premium or obj.venues.{included,premium}
    const d = obj?.dining || obj?.venues || {};
    // some sources may use 'complimentary' instead of 'included'
    const included = d.included || d.complimentary || [];
    const premium  = d.premium || d.specialty || d.extra || [];
    // sometimes venues is a flat array of {name, type:'included'|'premium'}
    if (!included.length && !premium.length && Array.isArray(d)){
      const inc = [], pre = [];
      d.forEach(v => {
        if (!v) return;
        if ((v.type||'').toLowerCase().includes('prem') || (v.fee===true)){
          pre.push(v.name || v.title || v);
        }else{
          inc.push(v.name || v.title || v);
        }
      });
      return { included: inc, premium: pre };
    }
    return { included, premium };
  }

  function cleanList(arr){
    // flatten, to strings, trim, dedupe, sort
    const out = [];
    (arr || []).forEach(v => {
      if (v == null) return;
      const s = (typeof v === 'string' ? v : (v.name || v.title || v.label || '')).toString().trim();
      if (!s) return;
      out.push(s);
    });
    const seen = new Set();
    const unique = out.filter(x => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    return unique.sort((a,b)=> a.localeCompare(b, undefined, { sensitivity:'base' }));
  }

  function renderList(title, items, id){
    const count = items.length;
    const aria = count ? `${title} (${count})` : `${title} (none listed)`;
    const listMarkup = count
      ? `<ul class="venue-list" aria-label="${esc(aria)}">` + items.map(v => `<li>${esc(v)}</li>`).join('') + `</ul>`
      : `<p class="tiny" role="note">No ${esc(title).toLowerCase()} listed yet.</p>`;
    return `<section class="venue-block" aria-labelledby="${id}">
      <h3 id="${id}">${esc(title)} <span class="count" aria-hidden="true">(${count})</span></h3>
      ${listMarkup}
    </section>`;
  }

  function renderCard(shipName, dataUrl, included, premium){
    const head = `<h2 id="diningHeading">Dining Venues on ${esc(shipName)}</h2>
      <p class="small">This list is generated from <code>fleet_index.json</code> (<span class="src">${esc(dataUrl)}</span>). Update that file to change what appears here.</p>`;

    const inc = renderList('Included (Complimentary)', included, 'incHeading');
    const pre = renderList('Premium (Specialty / Extra Charge)', premium, 'preHeading');

    const html = head + `<div class="venues two-col">${inc}${pre}</div>`;
    $card.innerHTML = html;
    $card.setAttribute('aria-busy','false');
  }

  function renderError(msg){
    $card.innerHTML = `<h2 id="diningHeading">Dining Venues</h2><p class="tiny" role="alert">Could not load dining data: ${esc(msg)}</p>`;
    $card.setAttribute('aria-busy','false');
  }

  // 4) Boot
  (async function init(){
    try{
      $card.setAttribute('aria-busy','true');
      const { json, url } = await fetchFirst(SOURCES);
      if (!SHIP_NAME){
        renderError('Ship name not detected on the page.');
        return;
      }

      // find matching record(s)
      const target = normalizeName(SHIP_NAME);
      let best = null;

      for (const cand of iterateShipCandidates(json)){
        const nm = candidateName(cand);
        if (!nm) continue;
        const norm = normalizeName(nm);
        // Exact match or forgiving match without "of the seas"
        if (norm === target || norm.replace(/\s* of the seas$/,'') === target.replace(/\s* of the seas$/,'')){
          best = cand; break;
        }
        // soft match: one contains the other
        if (!best && (norm.includes(target) || target.includes(norm))) best = cand;
      }

      if (!best){
        renderError(`No dining record found for “${SHIP_NAME}”.`);
        return;
      }

      const { included, premium } = pickDining(best);
      const inc = cleanList(included);
      const pre = cleanList(premium);
      renderCard(SHIP_NAME, url, inc, pre);
    }catch(err){
      renderError(err && err.message ? err.message : String(err));
    }
  })();
})();
