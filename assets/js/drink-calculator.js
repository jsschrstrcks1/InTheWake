/* drink-calculator.js — v3.011.007 (removed PDF libs) */

/* -------------------- Data layer with fallback -------------------- */
const FALLBACK_DATASET = {
  version: "3.011.007",
  rules: { gratuity: 0.18, deluxeCap: 14.00, minorDiscount: 0.5 },
  packages: { soda: 13.99, refresh: 34.00, deluxe: 85.00 },
  prices: {
    soda: 2.00, coffee: 4.50, teaprem: 3.50, freshjuice: 6.00, mocktail: 6.50,
    energy: 5.50, milkshake: 6.95, bottledwater: 2.95, beer: 8.50, wine: 11.00,
    cocktail: 13.00, spirits: 10.00
  },
  sets: {
    refresh: ["soda","coffee","teaprem","freshjuice","mocktail","energy","milkshake","bottledwater"],
    soda: ["soda"],
    alcoholic: ["beer","wine","cocktail","spirits"]
  }
};

(function loadDataset(){
  const url = '/assets/data/lines/royal-caribbean.json?v=3.011.006'; // Note: you might want to update this version query string
  fetch(url, {cache:'default'})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP '+r.status)))
    .then(j => { window.itwDataset = j; document.dispatchEvent(new Event('itw:dataset-ready')); })
    .catch(() => {
      window.itwDataset = FALLBACK_DATASET;
      const b = document.getElementById('fallback-banner'); if (b) b.hidden = false;
      document.dispatchEvent(new Event('itw:dataset-ready'));
    });
})();

/* -------------------- Utilities -------------------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function money(n){ return (n||0).toLocaleString(undefined,{style:'currency',currency:'USD'}); }
function parseNum(s){
  if (typeof s !== 'string') return Number(s) || 0;
  let t = s.trim().replace(/\s+/g,'');
  if (t.includes(',') && !t.includes('.')) t = t.replace(',', '.');
  t = t.replace(/,/g,''); // strip thousands if mixed
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}
function parseQty(v){
  if (typeof v !== 'string') return Number(v)||0;
  const s = v.trim();
  const m = s.match(/^(\d+[.,]?\d*)\s*[-–]\s*(\d+[.,]?\d*)$/);
  if (m) return { min: parseNum(m[1]), max: parseNum(m[2]) };
  return parseNum(s);
}
function sum(arr){ return arr.reduce((a,b)=>a+b,0); }
function announce(msg){ const live = $('#a11y-status'); if (live){ live.textContent = msg; }}

/* Debounce: used for recompute() to avoid firing on every keystroke */
function debounce(func, wait){
  let timeout;
  return function(...args){
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this,args), wait);
  };
}

/* -------------------- Reads & state -------------------- */
function readPicks(){
  const p = {};
  $$('[data-input]').forEach(inp=>{
    if (inp.type === 'checkbox') p[inp.dataset.input] = inp.checked;
    else p[inp.dataset.input] = parseQty(inp.value);
  });
  p.days = Math.max(1, (typeof p.days === 'object'? p.days.max: p.days) || 1);
  p.seadays = Math.min(p.days, Math.max(0, (typeof p.seadays==='object'? p.seadays.max: p.seadays) || 0));
  p.seaapply = p.seaapply !== false;
  p.seaweight = Math.max(0, Math.min(40, (typeof p.seaweight==='object'? p.seaweight.max: p.seaweight) || 20));
  p.adults = Math.max(1, (typeof p.adults==='object'? p.adults.max: p.adults) || 1);
  p.minors = Math.max(0, (typeof p.minors==='object'? p.minors.max: p.minors) || 0);
  return p;
}
function picksList(p){
  const keys = ["soda","coffee","teaprem","freshjuice","mocktail","energy","milkshake","bottledwater","beer","wine","cocktail","spirits"];
  return keys.map(k => [k, p[k] || 0]);
}
function listToScalar(list, mode="mean"){
  return list.map(([k,v])=>{
    if (typeof v === 'object') {
      if (mode==="min") return [k, v.min||0];
      if (mode==="max") return [k, v.max||0];
      return [k, ((v.min||0)+(v.max||0))/2];
    }
    return [k, v||0];
  });
}
function applySeaPortWeight(list, days, seaDays, weightPct){
  if (!$('#sea-toggle')?.checked) return list;
  const w = (weightPct||20)/100;
  const seaF = 1+w, portF = 1-w;
  return list.map(([id,qty])=>{
    const adj = ((qty*seaF*seaDays) + (qty*portF*(days-seaDays))) / days;
    return [id, adj];
  });
}

/* -------------------- Math -------------------- */
function includedValue(list, priceMap, setArr, grat){
  return sum(list.filter(([id])=>setArr.includes(id)).map(([id,qty]) => qty * priceMap[id] * (1+grat)));
}
function deluxeIncludedAndOvercap(list, priceMap, sets, cap, grat){
  let included = 0, overcap = 0;
  list.forEach(([id,qty])=>{
    const unit = priceMap[id]||0;
    if (sets.alcoholic.includes(id)) {
      if (unit <= cap) {
        included += qty * unit * (1+grat);
      } else {
        included += qty * cap * (1+grat);
        overcap += qty * (unit - cap) * (1+grat);
      }
    } else if (sets.refresh.includes(id) || sets.soda.includes(id)) {
      included += qty * unit * (1+grat);
    }
  });
  return {included, overcap};
}
function alcPerDay(list, priceMap, grat){
  return sum(list.map(([id,qty]) => qty * (priceMap[id]||0) * (1+grat)));
}

/* -------------------- Chart -------------------- */
let chart;
function paintChart(values){
  const c = $('#breakeven-chart');
  if (!c) return;
  const ctx = c.getContext('2d');
  const labels = ['À-la-carte','Soda','Refreshment','Deluxe'];
  const datasets = [
    {label:'Daily cost', data:[values.alc.mean, values.soda.mean, values.refresh.mean, values.deluxe.mean], backgroundColor:'#60a5fa'}
  ];
  if (values.hasRange) {
    datasets.push({label:'(max)', data:[values.alc.max, values.soda.max, values.refresh.max, values.deluxe.max], borderColor:'rgba(0,0,0,.35)', borderWidth:2, backgroundColor:'transparent' });
    datasets.push({label:'(min)', data:[values.alc.min, values.soda.min, values.refresh.min, values.deluxe.min], borderColor:'rgba(0,0,0,.2)', borderDash:[6,4], borderWidth:2, backgroundColor:'transparent' });
    const rn = $('#range-note'); if (rn) rn.textContent = 'Range bars show min/max based on your ranges.';
  } else {
    const rn = $('#range-note'); if (rn) rn.textContent = '';
  }
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true, ticks:{ callback:(v)=>'$'+v } } },
      plugins:{ legend:{ position:'bottom' } }
    }
  });
}

/* -------------------- UI helpers (exposed to window for buttons) -------------------- */
function highlightWinner(key){
  ['soda','refresh','deluxe'].forEach(k => $('#pkg-'+k)?.classList.toggle('winner', k===key));
  const chip = $('#best-chip'), text = $('#best-text');
  if (chip) chip.textContent = `Best value: ${key==='alc'?'à-la-carte':key.charAt(0).toUpperCase()+key.slice(1)}`;
  if (text) text.textContent = (key==='alc')
    ? 'Your daily picks are cheapest without a package.'
    : `Your daily picks are cheapest with the ${key==='deluxe'?'Deluxe':key==='refresh'?'Refreshment':'Soda'} package.`;
  announce('Best value updated: ' + (key==='alc'?'à-la-carte':key));
}

function togglePriceEdit(which, cancel=false){
  const form = $('#edit-'+which);
  if (!form) return;
  form.hidden = cancel ? true : !form.hidden;
  if (!form.hidden) form.querySelector('input')?.focus();
}
function savePackagePrice(which){
  const ds = window.itwDataset;
  const el = $('#edit-'+which+'-val');
  const v = parseNum(el?.value);
  if (v>0) {
    ds.packages[which] = v;
    const label = document.querySelector(`[data-pkg-price="${which}"]`);
    if (label) label.textContent = money(v) + '/day';
    togglePriceEdit(which,true);
    announce(`Updated ${which} to ${money(v)} per day`);
    recompute();
  }
}
function toggleCapEdit(cancel=false){
  const f = $('#edit-cap');
  if (!f) return;
  f.hidden = cancel ? true : !f.hidden;
  if (!f.hidden) f.querySelector('input')?.focus();
}
function saveCap(){
  const ds = window.itwDataset;
  const v = parseNum($('#edit-cap-val')?.value);
  if (v>=0) {
    ds.rules.deluxeCap = v;
    const capBadge = $('#cap-badge');
    if (capBadge) capBadge.textContent = v.toFixed(2);
    toggleCapEdit(true);
    announce(`Updated deluxe cap to $${v.toFixed(2)}`);
    recompute();
  }
}
function resetInputs(){
  $$('[data-input]').forEach(el=>{
    if (el.type==='checkbox') el.checked = (el.id==='sea-toggle');
    else {
      const def = (el.dataset.input==='days')?7:
                  (el.dataset.input==='seadays')?3:
                  (el.dataset.input==='adults')?1:
                  (el.dataset.input==='minors')?0:
                  (el.dataset.input==='seaweight')?20:0;
      el.value = def;
    }
  });
  // reset edits
  const ds = window.itwDataset;
  ds.packages = {...FALLBACK_DATASET.packages};
  ds.rules.deluxeCap = FALLBACK_DATASET.rules.deluxeCap;
  const p1 = $('[data-pkg-price="soda"]');
  const p2 = $('[data-pkg-price="refresh"]');
  const p3 = $('[data-pkg-price="deluxe"]');
  if (p1) p1.textContent = money(ds.packages.soda)+'/day';
  if (p2) p2.textContent = money(ds.packages.refresh)+'/day';
  if (p3) p3.textContent = money(ds.packages.deluxe)+'/day';
  const cb = $('#cap-badge'); if (cb) cb.textContent = ds.rules.deluxeCap.toFixed(2);
  announce('All inputs reset');
  recompute();
}

/**
 * Replaces the old exportToPDF function.
 * Relies on the browser's native print dialog, which supports "Save to PDF".
 */
function printResults() {
  window.print();
}

/* Expose for buttons */
window.togglePriceEdit = togglePriceEdit;
window.savePackagePrice = savePackagePrice;
window.toggleCapEdit = toggleCapEdit;
window.saveCap = saveCap;
window.resetInputs = resetInputs;
window.printResults = printResults; // <-- Replaced exportToPDF

/* -------------------- Compute -------------------- */
function recompute(){
  const ds = window.itwDataset; if (!ds) return;

  // price pills
  Object.entries(ds.prices).forEach(([k,v])=>{
    const pill = document.querySelector(`[data-price-pill="${k}"]`);
    if (pill) pill.textContent = `avg ${money(v)}`;
  });

  const grat = Number(ds.rules?.gratuity ?? 0.18);
  const cap  = Number(ds.rules?.deluxeCap ?? 14.00);
  const sets = ds.sets;

  const p = readPicks();
  const baseList = picksList(p);
  const meanList = applySeaPortWeight(listToScalar(baseList,'mean'), p.days, p.seadays, p.seaweight);
  const minList  = applySeaPortWeight(listToScalar(baseList,'min'),  p.days, p.seadays, p.seaweight);
  const maxList  = applySeaPortWeight(listToScalar(baseList,'max'),  p.days, p.seadays, p.seaweight);

  const hasRange = baseList.some(([,_v])=>typeof _v==='object');

  // ALC
  const alcMean = alcPerDay(meanList, ds.prices, grat);
  const alcMin  = alcPerDay(minList,  ds.prices, grat);
  const alcMax  = alcPerDay(maxList,  ds.prices, grat);

  // Included values
  const incS_mean = includedValue(meanList, ds.prices, sets.soda, grat);
  const incR_mean = includedValue(meanList, ds.prices, sets.refresh, grat);
  const del_mean  = deluxeIncludedAndOvercap(meanList, ds.prices, sets, cap, grat);

  const incS_min = includedValue(minList, ds.prices, sets.soda, grat);
  const incR_min = includedValue(minList, ds.prices, sets.refresh, grat);
  const del_min  = deluxeIncludedAndOvercap(minList, ds.prices, sets, cap, grat);

  const incS_max = includedValue(maxList, ds.prices, sets.soda, grat);
  const incR_max = includedValue(maxList, ds.prices, sets.refresh, grat);
  const del_max  = deluxeIncludedAndOvercap(maxList, ds.prices, sets, cap, grat);

  const soda   = { mean: ds.packages.soda,    min: ds.packages.soda,    max: ds.packages.soda };
a  const refresh= { mean: ds.packages.refresh, min: ds.packages.refresh, max: ds.packages.refresh };
  const deluxe = { mean: ds.packages.deluxe + del_mean.overcap, min: ds.packages.deluxe + del_min.overcap, max: ds.packages.deluxe + del_max.overcap };

  // Nets vs included value
  const netS = { mean: soda.mean   - incS_mean, min: soda.min   - incS_min,   max: soda.max   - incS_max };
  const netR = { mean: refresh.mean- incR_mean, min: refresh.min- incR_min,   max: refresh.max- incR_max };
  const netD = { mean: deluxe.mean - del_mean.included, min: deluxe.min - del_min.included, max: deluxe.max - del_max.included };

  // Winner by mean
  const candidates = [
    {key:'alc', val: alcMean},
    {key:'soda', val: netS.mean},
    {key:'refresh', val: netR.mean},
    {key:'deluxe', val: netD.mean}
a  ];
  const minVal = Math.min(...candidates.map(c=>c.val));
  const win = candidates.find(c=>c.val===minVal)?.key || 'alc';
  highlightWinner(win);

  // Fill included/overcap text
  const incS = document.querySelector('[data-inc="soda"]');
  const incR = document.querySelector('[data-inc="refresh"]');
  const incD = document.querySelector('[data-inc="deluxe"]');
  if (incS) incS.textContent = money(incS_mean)+'/day';
  if (incR) incR.textContent = money(incR_mean)+'/day';
  if (incD) incD.textContent = money(del_mean.included)+'/day';
  const oc = $('#overcap-est'); if (oc) oc.textContent = money(del_mean.overcap)+'/day';

  // Totals + policy
  const strategyCostForKey = (key) => (key==='alc')? alcMean : (key==='soda'? netS.mean : (key==='refresh'? netR.mean : netD.mean));
s  const perDay = strategyCostForKey(win);
  const daysEl = $('#totals');

  const alcoholQty = sum(meanList.filter(([id])=>sets.alcoholic.includes(id)).map(([id,qty])=>qty));
  const pState = readPicks(); // re-use for counts
  const deluxeRequired = (alcoholQty>0 && pState.adults>1);
  const policyEl = $('#policy-warning'); if (policyEl) policyEl.hidden = !deluxeRequired;

s  const kidDisc = window.itwDataset.rules.minorDiscount ?? 0.5;
  let groupMult = 0;
  let adultStrategy = deluxeRequired ? 'deluxe' : win;

  const body = $('#group-table-body');
  const sec  = $('#group-breakdown');
  if (body) body.innerHTML='';

  for(let i=1;i<=pState.adults;i++){
    const k = adultStrategy;
    const d = strategyCostForKey(k);
    if (body) body.innerHTML += `<tr><td>Adult ${i}</td><td>${k==='alc'?'À-la-carte':k.charAt(0).toUpperCase()+k.slice(1)}</td><td>${money(d)}</td><td>${money(d*pState.days)}</td></tr>`;
    groupMult += 1;
  }
  for(let i=1;i<=pState.minors;i++){
    const k = (adultStrategy==='deluxe' || win==='deluxe') ? 'refresh' : win;
    const d = strategyCostForKey(k) * kidDisc;
    if (body) body.innerHTML += `<tr><td>Minor ${i}</td><td>${k==='alc'?'À-la-carte':'Refreshment (disc.)'}</td><td>${money(d)}</td><td>${money(d*pState.days)}</td></tr>`;
s    groupMult += kidDisc;
  }
  if (sec) sec.hidden = !(pState.adults>1 || pState.minors>0);

  const trip = strategyCostForKey(adultStrategy) * pState.days * groupMult;
  if (daysEl) daysEl.textContent = `${money(strategyCostForKey(adultStrategy))}/day • ${money(trip)} trip`;

  // Chart
  paintChart({
    alc:{mean:alcMean,min:alcMin,max:alcMax},
    soda:{mean:netS.mean,min:netS.min,max:netS.max},
s    refresh:{mean:netR.mean,min:netR.min,max:netR.max},
    deluxe:{mean:netD.mean,min:netD.min,max:netD.max},
    hasRange
  });
}

/* Debounced recompute for input events */
const debouncedRecompute = debounce(recompute, 250);

/* -------------------- Wiring -------------------- */
document.addEventListener('itw:dataset-ready', ()=>{
  // header prices & cap
  const ds = window.itwDataset;
  const p1 = $('[data-pkg-price="soda"]');
  const p2 = $('[data-pkg-price="refresh"]');
  const p3 = $('[data-pkg-price="deluxe"]');
i  if (p1) p1.textContent = money(ds.packages.soda)+'/day';
  if (p2) p2.textContent = money(ds.packages.refresh)+'/day';
  if (p3) p3.textContent = money(ds.packages.deluxe)+'/day';
  const cb = $('#cap-badge'); if (cb) cb.textContent = (ds.rules.deluxeCap||14).toFixed(2);

s  // inputs -> recompute (debounced on input; immediate on change)
  $$('input').forEach(el=>{
    el.addEventListener('input', ()=>{
      if (el.id==='sea-weight') {
        const v = $('#sea-weight-val');
        if (v) v.textContent = el.value + '%';
      }
      debouncedRecompute();
    });
    el.addEventListener('change', recompute);
  });

  // tooltips: Esc to close basic
  document.addEventListener('keydown', (e)=>{
Do    if (e.key==='Escape'){
      $$('.tooltip [role="tooltip"]').forEach(tt=>tt.style.display='none');
      }
    });
  });

  // presets (exposed)
  window.loadPreset = function(name){
    const set = {
      light:   { beer:'1', wine:'1', soda:'1' },
      moderate:{ beer:'2', wine:'1', cocktail:'2', coffee:'1' },
      heavy:   { beer:'3', cocktail:'3', spirits:'2', bottledwater:'2' },
      coffee:  { coffee:'4', soda:'0', beer:'0', wine:'0', cocktail:'0', spirits:'0' }
    }[name] || {};
    Object.entries(set).forEach(([k,v])=>{
      const el = document.querySelector(`[data-input="${k}"]`);
      if (el) el.value = v;
  s   });
    announce('Preset loaded: ' + name);
    recompute();
  };

  // jump to winner
  const jump = $('#jump-winner');
  if (jump) jump.addEventListener('click', ()=>{
    const winner = document.querySelector('.pkg.winner') || document.querySelector('.packages');
A    winner?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // initial compute
  recompute();
});
