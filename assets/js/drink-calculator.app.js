/* drink-calculator.app.js — v3.014.0 (Worker-enabled, Offline-First FX) */

/* ------------------------- Config ------------------------- */
const VERSION = '3.014.0';
const USE_WORKER = true; // ✅ enable worker by default
const WORKER_URL = `/assets/js/drink-worker.js?v=${VERSION}`;
const DS_URL = `/assets/data/lines/royal-caribbean.json?v=${VERSION}`;

const FALLBACK_DATASET = {
  version: VERSION,
  rules: { gratuity: 0.18, deluxeCap: 14.0, minorDiscount: 0.5 },
  packages: { soda: 13.99, refresh: 34.0, deluxe: 85.0 },
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

/* ------------------------- Tiny DOM helpers ------------------------- */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
function announce(msg){ const n = $('#a11y-status'); if (n) n.textContent = msg; }
function isOffline(){ return typeof navigator !== 'undefined' && navigator && navigator.onLine === false; }

/* ------------------------- Parse helpers ------------------------- */
function parseNum(s){
  if (typeof s !== 'string') return Number(s) || 0;
  let t = s.trim().replace(/\s+/g,'');
  if (t.includes(',') && !t.includes('.')) t = t.replace(',', '.'); // comma decimal
  t = t.replace(/,/g,''); // thousands
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

/* ------------------------- Store (pub/sub + diff) ------------------------- */
function createStore(initial){
  let state = structuredClone(initial);
  const subs = new Map(); // key -> Set(callback)

  function get(){ return state; }

  function set(patch){
    const next = { ...state, ...patch };
    const changedKeys = Object.keys(next).filter(k => JSON.stringify(next[k]) !== JSON.stringify(state[k]));
    if (!changedKeys.length) return;
    state = next;
    changedKeys.forEach(k => { const set = subs.get(k); if (set) set.forEach(cb => cb(state[k], state)); });
    const any = subs.get('*'); if (any) any.forEach(cb => cb(state, state));
  }

  function patch(path, val){
    const next = structuredClone(state);
    let ref = next;
    const hops = path.split('.');
    for (let i=0;i<hops.length-1;i++) ref = ref[hops[i]];
    ref[hops.at(-1)] = val;
    set(next);
  }

  function subscribe(keys, cb){
    const list = Array.isArray(keys) ? keys : [keys];
    list.forEach(k => { if (!subs.has(k)) subs.set(k, new Set()); subs.get(k).add(cb); });
    return () => list.forEach(k => subs.get(k)?.delete(cb));
  }

  return { get, set, patch, subscribe };
}

/* ------------------------- App State Shape ------------------------- */
const initialState = {
  version: VERSION,
  dataset: null,
  inputs: {
    days: 7,
    seaDays: 3,
    seaApply: true,
    seaWeight: 20,
    adults: 1,
    minors: 0,
    drinks: {
      soda: 0, coffee: 0, teaprem: 0, freshjuice: 0, mocktail: 0, energy: 0,
      milkshake: 0, bottledwater: 0, beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  economics: {
    pkg: { soda: 13.99, refresh: 34.0, deluxe: 85.0 },
    grat: 0.18,
    deluxeCap: 14.0,
    minorDiscount: 0.5
  },
  results: {
    hasRange: false,
    bars: { alc: {min:0,mean:0,max:0}, soda:{min:0,mean:0,max:0}, refresh:{min:0,mean:0,max:0}, deluxe:{min:0,mean:0,max:0} },
    winnerKey: 'alc',
    perDay: 0,
    trip: 0,
    groupRows: [],
    included: { soda:0, refresh:0, deluxe:0 },
    overcap: 0,
    deluxeRequired: false
  },
  ui: {
    fallbackBanner: false,
    chartReady: false
  }
};

const store = createStore(initialState);

/* ------------------------- Persistence (URL + localStorage) ------------------------- */
const LS_KEY = 'itw:rc:state:v1';

function write(path, val, obj){
  let ref = obj;
  const hops = path.split('.');
  for (let i=0;i<hops.length-1;i++) ref = ref[hops[i]];
  ref[hops.at(-1)] = val;
}

function loadPersisted(){
  const q = new URLSearchParams(location.search);
  const patch = structuredClone(store.get());
  const map = [
    ['inputs.days','days'], ['inputs.seaDays','seadays'], ['inputs.adults','adults'], ['inputs.minors','minors'],
    ['inputs.seaApply','seaapply'], ['inputs.seaWeight','seaweight']
  ];

  map.forEach(([path,key])=>{
    if (!q.has(key)) return;
    const raw = q.get(key);
    const val = key==='seaapply' ? raw!=='false' : parseNum(raw);
    write(path, val, patch);
  });

  Object.keys(patch.inputs.drinks).forEach(k=>{
    if (q.has(k)) write(`inputs.drinks.${k}`, parseQty(q.get(k)), patch);
  });

  try{
    if (!q.toString()) {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        patch.inputs = saved.inputs ?? patch.inputs;
        patch.economics = saved.economics ?? patch.economics;
      }
    }
  }catch(_e){}

  store.set(patch);
}
function persistNow(){
  try {
    const { inputs, economics } = store.get();
    localStorage.setItem(LS_KEY, JSON.stringify({ inputs, economics }));
  } catch(_e) {}
}
function syncURL(){
  const { inputs } = store.get();
  const u = new URLSearchParams();
  if (inputs.days!==7) u.set('days', String(inputs.days));
  if (inputs.seaDays!==3) u.set('seadays', String(inputs.seaDays));
  if (!inputs.seaApply) u.set('seaapply','false');
  if (inputs.seaWeight!==20) u.set('seaweight', String(inputs.seaWeight));
  if (inputs.adults!==1) u.set('adults', String(inputs.adults));
  if (inputs.minors!==0) u.set('minors', String(inputs.minors));
  Object.entries(inputs.drinks).forEach(([k,v])=>{
    if (typeof v==='object' ? (v.min||v.max) : v) u.set(k, typeof v==='object' ? `${v.min}-${v.max}` : String(v));
  });
  history.replaceState(null,'', u.toString()?`?${u.toString()}`:location.pathname);
}

/* ------------------------- Dataset loader ------------------------- */
async function loadDataset(){
  try{
    const r = await fetch(DS_URL, { cache:'default' });
    if (!r.ok) throw new Error('bad status');
    const j = await r.json();
    store.patch('dataset', j);
    const eco = store.get().economics;
    eco.pkg = { ...eco.pkg, ...j.packages };
    eco.grat = Number(j.rules?.gratuity ?? eco.grat);
    eco.deluxeCap = Number(j.rules?.deluxeCap ?? eco.deluxeCap);
    eco.minorDiscount = Number(j.rules?.minorDiscount ?? eco.minorDiscount);
    store.patch('economics', eco);
  }catch(_e){
    store.patch('dataset', FALLBACK_DATASET);
    store.patch('ui.fallbackBanner', true);
  }
}

/* ------------------------- FX (display-only) ------------------------- */
const FX_KEY = 'itw:fx:v1';
const FX_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h refresh
const FX_STALE_MS   = 48 * 60 * 60 * 1000; // 48h = warn stale
const SUPPORTED_CCYS = ['USD','GBP','EUR','CAD','AUD','INR','CNY','MXN','BRL'];

let currentCurrency = (localStorage.getItem('itw:currency') || 'USD').toUpperCase();
if (!SUPPORTED_CCYS.includes(currentCurrency)) currentCurrency = 'USD';

let FX = { base:'USD', asOf:null, source:null, rates:{ USD:1 }, _ts:null };

async function fetchFrankfurter(){
  const to = SUPPORTED_CCYS.filter(c=>c!=='USD').join(',');
  const url = `https://api.frankfurter.app/latest?from=USD&to=${encodeURIComponent(to)}`;
  const r = await fetch(url, { cache:'no-store' });
  if (!r.ok) throw new Error('Frankfurter failed');
  const j = await r.json();
  return { base:j.base||'USD', asOf:j.date, source:'ECB (Frankfurter)', rates:{ USD:1, ...(j.rates||{}) } };
}
async function fetchHost(){
  const to = SUPPORTED_CCYS.filter(c=>c!=='USD').join(',');
  const url = `https://api.exchangerate.host/latest?base=USD&symbols=${encodeURIComponent(to)}`;
  const r = await fetch(url, { cache:'no-store' });
  if (!r.ok) throw new Error('exchangerate.host failed');
  const j = await r.json();
  return { base:j.base||'USD', asOf:j.date, source:'ECB (exchangerate.host)', rates:{ USD:1, ...(j.rates||{}) } };
}
function safeJSON(s){ try { return JSON.parse(s||''); } catch { return null; } }

async function loadFx() {
  const cached = safeJSON(localStorage.getItem(FX_KEY));

  if (isOffline()) {
    if (cached) { FX = cached; renderFxNote(true); }
    else { FX = { base:'USD', asOf:null, source:'USD only (offline)', rates:{USD:1}, _ts:null }; renderFxNote(true); }
    return;
  }

  const freshEnough = cached && (Date.now() - new Date(cached._ts||0).getTime() < FX_MAX_AGE_MS);
  if (freshEnough) { FX = cached; renderFxNote(); }

  try {
    const latest = await fetchFrankfurter();
    FX = { ...latest, _ts: new Date().toISOString() };
    localStorage.setItem(FX_KEY, JSON.stringify(FX));
    renderFxNote();
  } catch {
    try {
      const fallback = await fetchHost();
      FX = { ...fallback, _ts: new Date().toISOString() };
      localStorage.setItem(FX_KEY, JSON.stringify(FX));
      renderFxNote();
    } catch {
      if (cached) { FX = cached; renderFxNote(true); }
      else { FX = { base:'USD', asOf:null, source:'USD only', rates:{USD:1}, _ts:null }; renderFxNote(true); }
    }
  }
}

function convertUSD(amount, to = currentCurrency){
  const r = (FX.rates && FX.rates[to]) || 1;
  return amount * r;
}
function money(n){
  const amt = convertUSD(n, currentCurrency);
  try {
    return new Intl.NumberFormat(undefined, { style:'currency', currency: currentCurrency }).format(amt || 0);
  } catch {
    return (amt || 0).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' ' + currentCurrency;
  }
}
function renderFxNote(isFallback = false){
  const el = document.getElementById('currency-note');
  const chip = document.getElementById('offline-chip');
  if (chip) chip.style.display = isOffline() ? 'inline-block' : 'none';
  if (!el) return;
  const ageMs = FX._ts ? (Date.now() - new Date(FX._ts).getTime()) : Infinity;
  const stale = ageMs > FX_STALE_MS;
  const datePart = FX.asOf ? ` • ${FX.asOf}` : '';
  const src = FX.source ? ` • ${FX.source}` : '';
  const offlineTxt = isOffline() ? ' (offline)' : '';
  const base = isFallback
    ? `Using last known rates${offlineTxt}${datePart}${src}`
    : `Rates as of${offlineTxt}${datePart}${src}`;
  const warn = stale ? ' • may be out of date' : '';
  el.textContent = `${base}${warn} • display only; onboard charges in USD`;
  el.style.color = stale ? '#b45309' : '';
}
function wireCurrencyUI(){
  const sel = document.getElementById('currency-select');
  if (!sel) return;
  sel.value = currentCurrency;
  sel.addEventListener('change', ()=>{
    currentCurrency = (sel.value || 'USD').toUpperCase();
    if (!SUPPORTED_CCYS.includes(currentCurrency)) currentCurrency = 'USD';
    localStorage.setItem('itw:currency', currentCurrency);
    renderEconomics();
    renderPricePills();
    renderResults(store.get().results);
  });
}

/* ------------------------- Worker Bridge ------------------------- */
let calcWorker = null;
let workerReady = false;
function ensureWorker(){
  if (!USE_WORKER) return false;
  if (calcWorker) return true;
  try {
    calcWorker = new Worker(WORKER_URL, { type: 'module' });
    calcWorker.onmessage = (e)=>{
      const { type, payload } = e.data || {};
      if (type === 'ready') { workerReady = true; return; }
      if (type === 'result') { store.patch('results', payload); return; }
    };
    calcWorker.onerror = ()=>{
      // disable worker silently and fall back
      workerReady = false;
      calcWorker.terminate();
      calcWorker = null;
    };
    return true;
  } catch {
    return false;
  }
}

/* ------------------------- Controller ------------------------- */
const debounced = (fn, ms=250)=>{let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),ms);}};

function scheduleCalc(){
  const { inputs, economics, dataset } = store.get();

  if (ensureWorker() && workerReady) {
    calcWorker.postMessage({ type:'compute', payload: { inputs, economics, dataset: (dataset||FALLBACK_DATASET) } });
    return;
  }

  // Fallback to inline compute (from worker’s shared module signature)
  // Minimal inline version: load math in Part B normally; here we only fallback if worker not ready.
  if (window.ITW_MATH && typeof window.ITW_MATH.compute === 'function') {
    const results = window.ITW_MATH.compute(inputs, economics, dataset||FALLBACK_DATASET);
    store.patch('results', results);
  } else {
    // absolute worst-case: no math module loaded; show zeros
    store.patch('results', initialState.results);
  }
}
const debouncedCalc = debounced(scheduleCalc, 120);

/* ------------------------- Chart & Rendering ------------------------- */
let chart = null;
function ensureChart(){
  if (chart) return chart;
  const el = $('#breakeven-chart');
  if (!el) return null;
  chart = new Chart(el.getContext('2d'), {
    type:'bar',
    data:{
      labels:['À-la-carte','Soda','Refreshment','Deluxe'],
      datasets:[ { label:'Daily cost', data:[0,0,0,0], backgroundColor:'#60a5fa' } ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>'$'+v } } },
      plugins:{ legend:{ position:'bottom' } }
    }
  });
  store.patch('ui.chartReady', true);
  return chart;
}

function renderResults(r){
  // winner banner
  const chip = $('#best-chip'), text = $('#best-text');
  const label = r.winnerKey==='alc' ? 'à-la-carte' : (r.winnerKey==='deluxe'?'Deluxe':r.winnerKey.charAt(0).toUpperCase()+r.winnerKey.slice(1));
  if (chip) chip.textContent = `Best value: ${label}`;
  if (text) text.textContent = (r.winnerKey==='alc')
    ? 'Your daily picks are cheapest without a package.'
    : `Your daily picks are cheapest with the ${label} package.`;
  announce('Best value: ' + label);

  // totals
  const totals = $('#totals');
  if (totals) totals.textContent = `${money(r.perDay)}/day • ${money(r.trip)} trip`;

  // group breakdown
  const tbody = $('#group-table-body'), sec = $('#group-breakdown');
  if (tbody) {
    tbody.innerHTML = '';
    r.groupRows.forEach(row=>{
      tbody.insertAdjacentHTML('beforeend',
        `<tr><td>${row.who}</td><td>${row.pkg==='alc'?'À-la-carte':row.pkg}</td><td>${money(row.perDay)}</td><td>${money(row.trip)}</td></tr>`);
    });
  }
  if (sec) sec.hidden = r.groupRows.length<=1;

  // included + overcap
  const incS = document.querySelector('[data-inc="soda"]');
  const incR = document.querySelector('[data-inc="refresh"]');
  const incD = document.querySelector('[data-inc="deluxe"]');
  if (incS) incS.textContent = money(r.included.soda)+'/day';
  if (incR) incR.textContent = money(r.included.refresh)+'/day';
  if (incD) incD.textContent = money(r.included.deluxe)+'/day';
  const oc = $('#overcap-est'); if (oc) oc.textContent = money(r.overcap)+'/day';

  // policy
  const policy = $('#policy-warning'); if (policy) policy.hidden = !r.deluxeRequired;

  // chart soft update
  const c = ensureChart();
  if (c){
    const d = c.data.datasets;
    d.length = 0;
    d.push({label:'Daily cost', data:[r.bars.alc.mean, r.bars.soda.mean, r.bars.refresh.mean, r.bars.deluxe.mean], backgroundColor:'#60a5fa'});
    if (r.hasRange){
      d.push({label:'(max)', data:[r.bars.alc.max, r.bars.soda.max, r.bars.refresh.max, r.bars.deluxe.max], type:'line', borderWidth:2, pointRadius:0, borderColor:'rgba(0,0,0,.35)'});
      d.push({label:'(min)', data:[r.bars.alc.min, r.bars.soda.min, r.bars.refresh.min, r.bars.deluxe.min], type:'line', borderDash:[6,4], borderWidth:2, pointRadius:0, borderColor:'rgba(0,0,0,.2)'});
      const rn = $('#range-note'); if (rn) rn.textContent = 'Range bars show min/max based on your ranges.';
    } else {
      const rn = $('#range-note'); if (rn) rn.textContent = '';
    }
    c.update('none');
  }

  // A11y table
  const srAlc = $('#sr-alc'); if (srAlc) srAlc.textContent = money(r.bars.alc.mean);
  const srSoda = $('#sr-soda'); if (srSoda) srSoda.textContent = money(r.bars.soda.mean);
  const srRefresh = $('#sr-refresh'); if (srRefresh) srRefresh.textContent = money(r.bars.refresh.mean);
  const srDeluxe = $('#sr-deluxe'); if (srDeluxe) srDeluxe.textContent = money(r.bars.deluxe.mean);
}

function renderEconomics(){
  const { economics } = store.get();
  const pS = $('[data-pkg-price="soda"]');
  const pR = $('[data-pkg-price="refresh"]');
  const pD = $('[data-pkg-price="deluxe"]');
  if (pS) pS.textContent = money(economics.pkg.soda)+'/day';
  if (pR) pR.textContent = money(economics.pkg.refresh)+'/day';
  if (pD) pD.textContent = money(economics.pkg.deluxe)+'/day';
  const cap = $('#cap-badge'); if (cap) cap.textContent = economics.deluxeCap.toFixed(2);
}

function renderPricePills(){
  const ds = store.get().dataset || FALLBACK_DATASET;
  Object.entries(ds.prices).forEach(([k,v])=>{
    const pill = document.querySelector(`[data-price-pill="${k}"]`);
    if (pill) pill.textContent = `avg ${money(v)}`;
  });
}

/* ------------------------- Inputs & UI Wiring ------------------------- */
const debouncedInput = (fn, ms=250)=>{let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),ms);}};

function wireInputs(){
  // generic inputs using data-input
  $$('[data-input]').forEach(inp=>{
    const key = inp.dataset.input;
    const writeInput = (val)=>{
      if (key==='seaapply') store.patch('inputs.seaApply', Boolean(val));
      else if (key==='days') store.patch('inputs.days', parseNum(val));
      else if (key==='seadays') store.patch('inputs.seaDays', parseNum(val));
      else if (key==='adults') store.patch('inputs.adults', parseNum(val));
      else if (key==='minors') store.patch('inputs.minors', parseNum(val));
      else if (key==='seaweight') store.patch('inputs.seaWeight', parseNum(val));
      else store.patch(`inputs.drinks.${key}`, parseQty(String(val)));
    };
    inp.addEventListener('input', e => {
      const val = e.target.type==='checkbox' ? e.target.checked : e.target.value;
      writeInput(val);
      debouncedCalc();
      if (key === 'seaweight') {
        const out = document.getElementById('sea-weight-val');
        if (out) out.textContent = `${parseNum(val)}%`;
      }
    });
    inp.addEventListener('change', e => {
      writeInput(e.target.type==='checkbox' ? e.target.checked : e.target.value);
      scheduleCalc();
      syncURL();
      persistNow();
    });
  });

  // editable package prices
  window.togglePriceEdit = (which, cancel=false)=>{
    const form = document.getElementById(`edit-${which}`);
    if (!form) return;
    form.hidden = cancel ? true : !form.hidden;
    if (!form.hidden) form.querySelector('input')?.focus();
  };
  window.savePackagePrice = (which)=>{
    const el = document.getElementById(`edit-${which}-val`);
    const v = parseNum(el?.value);
    if (v>0){
      const eco = store.get().economics;
      eco.pkg[which] = v;
      store.patch('economics', eco);
      window.togglePriceEdit(which, true);
      announce(`Updated ${which} to ${money(v)}/day`);
      scheduleCalc(); persistNow();
    }
  };

  // cap edit
  window.toggleCapEdit = (cancel=false)=>{
    const f = $('#edit-cap');
    if (f){ f.hidden = cancel ? true : !f.hidden; if (!f.hidden) f.querySelector('input')?.focus(); }
  };
  window.saveCap = ()=>{
    const v = parseNum($('#edit-cap-val')?.value);
    if (v>=0){
      const eco = store.get().economics; eco.deluxeCap = v; store.patch('economics', eco);
      window.toggleCapEdit(true); announce(`Updated deluxe cap to $${v.toFixed(2)}`); scheduleCalc(); persistNow();
    }
  };

  // reset
  window.resetInputs = ()=>{
    store.patch('inputs', structuredClone(initialState.inputs));
    store.patch('economics', structuredClone({ ...initialState.economics,
      pkg: { ...initialState.economics.pkg, ...((store.get().dataset||FALLBACK_DATASET).packages) }
    }));
    scheduleCalc(); syncURL(); persistNow(); announce('All inputs reset');
  };

  // print
  window.printResults = ()=> window.print();

  // steppers
  window.stepInput = (key, amount) => {
    const state = store.get();
    const currentDrinkVal = state.inputs.drinks[key];
    let currentVal = (typeof currentDrinkVal === 'object') ? ((currentDrinkVal.min||0)+(currentDrinkVal.max||0))/2 : parseNum(String(currentDrinkVal));
    let newVal = currentVal + amount; if (newVal < 0) newVal = 0;
    const finalValStr = (amount === 0.5 || amount === -0.5 || (currentVal.toString().includes('.')))
      ? newVal.toFixed(1) : newVal.toFixed(0);
    store.patch(`inputs.drinks.${key}`, parseNum(finalValStr));
    scheduleCalc(); syncURL(); persistNow();
  };

  // presets
  window.loadPreset = (name)=>{
    const set = {
      light:    { beer:'1', wine:'1', soda:'1' },
      moderate: { beer:'2', wine:'1', cocktail:'2', coffee:'1' },
      heavy:    { beer:'3', cocktail:'3', spirits:'2', bottledwater:'2' },
      coffee:   { coffee:'4', soda:'0', beer:'0', wine:'0', cocktail:'0', spirits:'0' }
    }[name] || {};
    const next = structuredClone(store.get().inputs);
    Object.keys(next.drinks).forEach(k => next.drinks[k] = 0);
    Object.entries(set).forEach(([k,v])=> next.drinks[k] = parseQty(v));
    store.patch('inputs', next);
    scheduleCalc(); persistNow(); announce('Preset loaded: '+name);
  };

  // jump to winner
  const jump = $('#jump-winner');
  if (jump) jump.addEventListener('click', ()=>{
    const el = document.querySelector('.pkg.winner') || document.querySelector('.packages');
    el?.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // ESC closes tooltips
  document.addEventListener('keydown', e=>{
    if (e.key==='Escape'){ $$('.tooltip [role="tooltip"]').forEach(tt=>tt.style.display='none'); }
  });
}

/* ------------------------- Reflect inputs to DOM ------------------------- */
function reflectInputsToDOM(){
  const { inputs } = store.get();
  const days = $('#input-days'); if (days) days.value = String(inputs.days);
  const seadays = $('#input-seadays'); if (seadays) seadays.value = String(inputs.seaDays);
  const seaToggle = $('#sea-toggle'); if (seaToggle) seaToggle.checked = !!inputs.seaApply;
  const adults = $('#input-adults'); if (adults) adults.value = String(inputs.adults);
  const minors = $('#input-minors'); if (minors) minors.value = String(inputs.minors);

  Object.entries(inputs.drinks).forEach(([k,v])=>{
    const el = document.querySelector(`[data-input="${k}"]`);
    if (el) el.value = (typeof v==='object') ? `${v.min||0}-${v.max||0}` : String(v||0);
  });

  const seaWeightOut = document.getElementById('sea-weight-val');
  if (seaWeightOut) seaWeightOut.textContent = `${inputs.seaWeight}%`;
}

/* ------------------------- Subscriptions ------------------------- */
store.subscribe('inputs', () => { reflectInputsToDOM(); });
store.subscribe(['dataset','economics'], ()=>{ renderEconomics(); renderPricePills(); });
store.subscribe('results', (r)=>{
  ['soda','refresh','deluxe'].forEach(k => {
    const el = document.querySelector(`[data-card="${k}"]`);
    if (el) el.classList.toggle('winner', (r.winnerKey===k));
  });
  renderResults(r);
});
store.subscribe('ui', ui=>{
  const b = $('#fallback-banner'); if (b) b.hidden = !ui.fallbackBanner;
});

/* ------------------------- Boot ------------------------- */
(async function boot(){
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded. Cannot boot calculator.');
    return;
  }

  ensureChart();         // chart instance early
  loadPersisted();       // restore state
  wireInputs();          // wire form controls
  wireCurrencyUI();      // currency selector
  await loadFx();        // fetch FX (non-blocking rendering)
  renderFxNote();

  await loadDataset();   // prices dataset

  reflectInputsToDOM();
  renderPricePills();
  renderEconomics();

  // start/prime worker
  if (USE_WORKER) ensureWorker();

  // first calc
  scheduleCalc();

  // persist/sync
  window.addEventListener('beforeunload', persistNow);
  const throttledURL = (fn => { let t; return ()=>{ clearTimeout(t); t=setTimeout(fn, 300);} })(syncURL);
  store.subscribe(['inputs','economics'], throttledURL);

  // network changes
  window.addEventListener('online', async ()=>{
    await loadFx();
    renderResults(store.get().results);
    renderEconomics();
    renderPricePills();
  });
  window.addEventListener('offline', ()=>{ renderFxNote(true); });
})();
