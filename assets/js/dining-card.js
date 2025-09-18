/* dining-card.js — builds the Dining Venues card from JSON
   v2.240 — canonical RC path first, with fleet fallback
   - Primary: http://cruisinginthewake.com/assets/data/rc-restaurants.json
   - Fallback: http://cruisinginthewake.com/assets/data/fleet_index.json
   - Final fallbacks: /assets/data/fleet_index.json, /data/fleet_index.json
   - Expects: <section id="dining-card" class="card" data-ship="..."></section>
*/

(function(){
  const CARD_SELECTOR = '#dining-card';

  // Absolute-first sources per standards
  const SOURCES = [
    'http://cruisinginthewake.com/assets/data/rc-restaurants.json',
    'http://cruisinginthewake.com/assets/data/fleet_index.json',
    '/assets/data/fleet_index.json',
    '/data/fleet_index.json'
  ];

  const $card = document.querySelector(CARD_SELECTOR);
  if (!$card) return;

  // ——— Ship identity (prefer slug passed via JSON script hook)
  let shipName = ($card.getAttribute('data-ship') || '').trim();
  let shipSlug = '';
  const hook = document.getElementById('dining-data-source');
  if (hook) {
    try {
      const cfg = JSON.parse(hook.textContent || '{}');
      shipSlug = (cfg.ship_slug || '').trim();
      window.__DINING_SOURCE__ = cfg; // optional debug
    } catch(e){}
  }
  const KEY = shipSlug || shipName || detectShipName();

  function detectShipName(){
    const t = (document.title || '').replace(/—.*$/, '').trim();
    if (t) return t;
    const h = document.querySelector('h1, header h1, main h1, h2, header h2, main h2');
    return h ? (h.textContent || '').trim() : '';
  }

  // ——— utils
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s||'').trim().toLowerCase().replace(/\s+/g,' ')
                     .replace(/’/g,"'").replace(/\s+of the seas$/,'');

  async function fetchFirst(urls){
    let lastErr;
    for (const url of urls){
      try{
        const res = await fetch(url, { credentials:'omit', cache:'default' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { json: await res.json(), url };
      }catch(e){ lastErr=e; }
    }
    throw lastErr || new Error('No data sources reachable');
  }

  // iterate flexible shapes (array, {ships:{}}, brand buckets, etc.)
  function* iterCandidates(root){
    if (!root) return;
    if (Array.isArray(root)) { for (const it of root) yield it; return; }
    if (root.ships){
      const s = root.ships;
      if (Array.isArray(s)) for (const it of s) yield it;
      else if (s && typeof s==='object') for (const k of Object.keys(s)) yield s[k];
    }
    for (const k of Object.keys(root)){
      if (k==='ships') continue;
      const v = root[k];
      if (!v) continue;
      if (Array.isArray(v)) for (const it of v) yield it;
      else if (typeof v==='object'){
        if (v.ships){
          const s = v.ships;
          if (Array.isArray(s)) for (const it of s) yield it;
          else if (s && typeof s==='object') for (const kk of Object.keys(s)) yield s[kk];
        }
        for (const kk of Object.keys(v)){
          const vv = v[kk];
          if (vv && typeof vv==='object' && (vv.name||vv.ship||vv.title||vv.dining)) yield vv;
        }
      }
    }
    // also allow { "Ship Name": { dining:{...} } } style objects
    for (const k of Object.keys(root)){
      const v = root[k];
      if (v && typeof v==='object' && (v.dining || v.venues)) yield Object.assign({ name:k }, v);
    }
  }

  const candidateName = o => o?.slug || o?.ship_slug || o?.name || o?.ship || o?.title || '';
  function pickDining(o){
    // support both rc-restaurants.json and fleet_index shapes
    const d = o?.dining || o?.venues || {};
    const included = d.included || d.complimentary || d.free || [];
    const premium  = d.premium || d.specialty || d.extra || [];
    if (!included.length && !premium.length && Array.isArray(d)){
      const inc=[], pre=[];
      d.forEach(v=>{
        if (!v) return;
        const name = (typeof v==='string') ? v : (v.name||v.title||'');
        const isPrem = (v.type||'').toLowerCase().includes('prem') || v.fee===true || v.price || v.charge;
        (isPrem?pre:inc).push(name);
      });
      return { included:inc, premium:pre };
    }
    return { included, premium };
  }
  function uniqSort(arr){
    const out=[]; (arr||[]).forEach(v=>{
      const s = (typeof v==='string'?v:(v.name||v.title||v.label||'')).trim();
      if (s) out.push(s);
    });
    const seen=new Set();
    const u=out.filter(x=>{const k=x.toLowerCase(); if(seen.has(k))return false; seen.add(k); return true;});
    return u.sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  }

  function renderList(title, items, id){
    const n = items.length;
    return `<section class="venue-block" aria-labelledby="${id}">
      <h3 id="${id}">${esc(title)} <span class="count" aria-hidden="true">(${n})</span></h3>
      ${n?`<ul class="venue-list">${items.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:
          `<p class="tiny" role="note">No ${esc(title).toLowerCase()} listed yet.</p>`}
    </section>`;
  }

  function renderCard(ship, srcUrl, inc, pre){
    const head = `<h2 id="diningHeading">Dining Venues on ${esc(ship)}</h2>
      <p class="small">Source of truth: <code>${esc(srcUrl)}</code>.
         Update that JSON to change this list.</p>`;
    $card.innerHTML = head + `<div class="venues two-col">${renderList('Included (Complimentary)', inc,'inc')}
      ${renderList('Premium (Specialty / Extra Charge)', pre,'pre')}</div>`;
    $card.removeAttribute('aria-busy');
  }
  function renderError(msg){
    $card.innerHTML = `<h2 id="diningHeading">Dining Venues</h2>
      <p class="tiny" role="alert">Could not load dining data: ${esc(msg)}</p>`;
    $card.removeAttribute('aria-busy');
  }

  (async function init(){
    $card.setAttribute('aria-busy','true');

    const targetKey = KEY || detectShipName();
    if (!targetKey){ renderError('Ship name not detected on the page.'); return; }
    const target = norm(targetKey);

    try{
      const { json, url } = await fetchFirst(SOURCES);

      let match=null;
      for (const c of iterCandidates(json)){
        const name = candidateName(c);
        if (!name) continue;
        const n = norm(name);
        if (n === target || n.replace(/\s*of the seas$/,'') === target) { match=c; break; }
        if (!match && (n.includes(target) || target.includes(n))) match=c;
      }

      if (!match){ renderError(`No dining record found for “${targetKey}”.`); return; }

      const { included, premium } = pickDining(match);
      renderCard(targetKey, url, uniqSort(included), uniqSort(premium));
    }catch(err){
      renderError(err?.message || String(err));
    }
  })();
})();
