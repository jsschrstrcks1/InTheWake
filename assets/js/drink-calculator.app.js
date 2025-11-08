/* drink-calculator.app.js — v.9.002.005 (Worker-enabled, Offline-First FX, Surgical v.9.002.003 Updates)
   Core updates:
   - CONFIG constants block for magic numbers
   - Exposed window.ITW with store, money, getCurrency
   - Enhanced announce() with dual live regions
   - Voucher input clamping (0-10)
   - 100ms debounce on currency change for FX settle
   - Preserved all existing behavior, no regressions
*/

// ----- Unified version from <meta name="version" content="..."> -----
const META_VER = (document.querySelector('meta[name="version"]')?.content || '').trim();
const VERSION = META_VER ? (META_VER.startsWith('v') ? META_VER : `v${META_VER}`) : 'v.dev';

// ----- Configuration Constants (single source of truth) -----
const CONFIG = {
  QUIZ_EXPIRY_DAYS: 90,
  SEA_WEIGHT_MAX: 40,
  DELUXE_CAP_FALLBACK: 14.0,      // USD-denominated business logic cap
  VOUCHER_MAX_PER_PERSON: 10,
  FX_REFRESH_HOURS: 12,
  FX_STALE_HOURS: 48,
  CALC_DEBOUNCE_MS: 120
};
window.ITW_CONFIG = CONFIG;

const USE_WORKER = true;
const WORKER_URL = `/assets/js/drink-worker.js?v=${VERSION}`;
const DS_URL     = `/assets/data/lines/royal-caribbean.json?v=${VERSION}`;

// ---------- Sanitize and clamp utilities ----------
function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d. -]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

const FALLBACK_DATASET = {
  version: VERSION,
  rules: { gratuity: 0.18, deluxeCap: CONFIG.DELUXE_CAP_FALLBACK },
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

function announce(msg, level='polite'){
  const id = level === 'assertive' ? 'a11y-alerts' : 'a11y-status';
  const n = document.getElementById(id);
  if (n) {
    n.textContent = msg;
    setTimeout(() => { n.textContent = ''; }, 3000);
  }
}

function isOffline(){ 
  return typeof navigator !== 'undefined' && navigator && navigator.onLine === false; 
}

/* ------------------------- Parse helpers ------------------------- */
function parseNum(s){
  if (typeof s !== 'string') return Number(s) || 0;
  let t = s.trim().replace(/\s+/g,'');
  if (t.includes(',') && !t.includes('.')) t = t.replace(',', '.');
  t = t.replace(/,/g,'');
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
  const subs = new Map();
  
  function get(){ return state; }
  
  function set(patch){
    const next = { ...state, ...patch };
    const changedKeys = Object.keys(next).filter(k => 
      JSON.stringify(next[k]) !== JSON.stringify(state[k])
    );
    if (!changedKeys.length) return;
    state = next;
    changedKeys.forEach(k => {
      const set = subs.get(k);
      if (set) set.forEach(cb => cb(state[k], state));
    });
    const any = subs.get('*');
    if (any) any.forEach(cb => cb(state, state));
  }
  
  function patch(path, val){
    const next = structuredClone(state);
    let ref = next;
    const hops = path.split('.');
    for (let i=0; i<hops.length-1; i++) ref = ref[hops[i]];
    ref[hops.at(-1)] = val;
    set(next);
  }
  
  function subscribe(keys, cb){
    const list = Array.isArray(keys) ? keys : [keys];
    list.forEach(k => {
      if (!subs.has(k)) subs.set(k, new Set());
      subs.get(k).add(cb);
    });
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
    calcMode: 'simple',
    itinerary: [],
    drinks: {
      soda: 0, coffee: 0, teaprem: 0, freshjuice: 0, mocktail: 0, energy: 0,
      milkshake: 0, bottledwater: 0, beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  economics: {
    pkg: { soda: 13.99, refresh: 34.0, deluxe: 85.0 },
    grat: 0.18,
    deluxeCap: CONFIG.DELUXE_CAP_FALLBACK
  },
  results: {
    hasRange: false,
    bars: {
      alc: {min:0,mean:0,max:0},
      soda: {min:0,mean:0,max:0},
      refresh: {min:0,mean:0,max:0},
      deluxe: {min:0,mean:0,max:0}
    },
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
    chartReady: false,
    fxDriftPct: 0
  }
};

const store = createStore(initialState);

/* ------------------------- Persistence (URL + localStorage) ------------------------- */
const LS_KEY = 'itw:rc:state:v1';

function write(path, val, obj){
  let ref = obj;
  const hops = path.split('.');
  for (let i=0; i<hops.length-1; i++) ref = ref[hops[i]];
  ref[hops.at(-1)] = val;
}

function loadPersisted(){
  const q = new URLSearchParams(location.search);
  const patch = structuredClone(store.get());
  const map = [
    ['inputs.days','days'],
    ['inputs.seaDays','seadays'],
    ['inputs.adults','adults'],
    ['inputs.minors','minors'],
    ['inputs.seaApply','seaapply'],
    ['inputs.seaWeight','seaweight']
  ];
  
  map.forEach(([path, key])=>{
    if (!q.has(key)) return;
    const raw = q.get(key);
    const val = key==='seaapply' ? raw!=='false' : parseNum(raw);
    write(path, val, patch);
  });
  
  Object.keys(patch.inputs.drinks).forEach(k=>{
    if (q.has(k)) write(`inputs.drinks.${k}`, parseQty(q.get(k)), patch);
  });
  
  try {
    if (!q.toString()) {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        patch.inputs = saved.inputs ?? patch.inputs;
        patch.economics = saved.economics ?? patch.economics;
      }
    }
  } catch(_e) {}
  
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
    if (typeof v==='object' ? (v.min||v.max) : v) {
      u.set(k, typeof v==='object' ? `${v.min}-${v.max}` : String(v));
    }
  });
  
  const qs = u.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

/* ------------------------- Dataset loader ------------------------- */
function flattenPrices(ds){
  if (ds?.prices && Object.keys(ds.prices).length) return ds.prices;
  const out = {};
  (ds.items||[]).forEach(it => { if (it?.id) out[it.id] = Number(it.price)||0; });
  return out;
}

function normalizeSets(ds){
  const s = ds?.sets || {};
  const alcoholic = Array.isArray(s.alcoholic) ? s.alcoholic : (s.alcohol || []);
  return { ...s, alcoholic };
}

async function loadDataset(){
  try {
    const r = await fetch(DS_URL, { cache:'default' });
    if (!r.ok) throw new Error('bad status');
    const j = await r.json();
    
    window.itwInfo?.update?.({ pricingResponse: r, pricingSource: DS_URL });
    
    j.prices = flattenPrices(j);
    j.sets   = normalizeSets(j);
    store.patch('dataset', j);
    
    const eco = { ...store.get().economics };
    const dsPkg = j.packages || {};
    const getPrice = (obj) => Number(obj?.priceMid ?? obj?.price);
    
    eco.pkg = {
      soda: Number.isFinite(getPrice(dsPkg.soda)) ? getPrice(dsPkg.soda) : eco.pkg.soda,
      refresh: Number.isFinite(getPrice(dsPkg.refreshment || dsPkg.refresh)) 
        ? getPrice(dsPkg.refreshment || dsPkg.refresh) 
        : eco.pkg.refresh,
      deluxe: Number.isFinite(getPrice(dsPkg.deluxe)) ? getPrice(dsPkg.deluxe) : eco.pkg.deluxe,
    };
    
    eco.grat = Number(j.rules?.gratuity ?? eco.grat);
    eco.deluxeCap = Number(j.rules?.caps?.deluxeAlcohol ?? j.rules?.deluxeCap ?? eco.deluxeCap);
    
    store.patch('economics', eco);
    announce('Pricing data loaded');
  } catch(_e) {
    store.patch('dataset', FALLBACK_DATASET);
    store.patch('ui.fallbackBanner', true);
    announce('Using default pricing', 'polite');
  }
}

/* ------------------------- FX (display-only) ------------------------- */
const FX_KEY = 'itw:fx:v1';
const FX_MAX_AGE_MS = CONFIG.FX_REFRESH_HOURS * 60 * 60 * 1000;
const FX_STALE_MS   = CONFIG.FX_STALE_HOURS * 60 * 60 * 1000;
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
  const rates = Object.assign({ USD:1 }, j && j.rates ? j.rates : {});
  return { base:(j&&j.base)||'USD', asOf:j&&j.date, source:'ECB (Frankfurter)', rates, _response:r };
}

async function fetchHost(){
  const to = SUPPORTED_CCYS.filter(c=>c!=='USD').join(',');
  const url = `https://api.exchangerate.host/latest?base=USD&symbols=${encodeURIComponent(to)}`;
  const r = await fetch(url, { cache:'no-store' });
  if (!r.ok) throw new Error('exchangerate.host failed');
  const j = await r.json();
  const rates = Object.assign({ USD:1 }, j && j.rates ? j.rates : {});
  return { base:(j&&j.base)||'USD', asOf:j&&j.date, source:'ECB (exchangerate.host)', rates, _response:r };
}

function safeJSON(s){ try { return JSON.parse(s||''); } catch { return null; } }

async function loadFx() {
  const cached = safeJSON(localStorage.getItem(FX_KEY));
  
  if (isOffline()) {
    if (cached) {
      FX = cached;
      renderFxNote(true);
    } else {
      FX = { base:'USD', asOf:null, source:'USD only (offline)', rates:{USD:1}, _ts:null };
      renderFxNote(true);
    }
    return;
  }
  
  const freshEnough = cached && (Date.now() - new Date(cached._ts||0).getTime() < FX_MAX_AGE_MS);
  if (freshEnough) {
    FX = cached;
    renderFxNote();
  }
  
  try {
    const latest = await fetchFrankfurter();
    const { _response, ...rest } = latest;
    FX = { ...rest, _ts: new Date().toISOString() };
    localStorage.setItem(FX_KEY, JSON.stringify(FX));
    renderFxNote();
    window.itwInfo?.update?.({ fxResponse: _response, fxSource: 'Frankfurter' });
  } catch {
    try {
      const fallback = await fetchHost();
      const { _response, ...rest } = fallback;
      FX = { ...rest, _ts: new Date().toISOString() };
      localStorage.setItem(FX_KEY, JSON.stringify(FX));
      renderFxNote();
      window.itwInfo?.update?.({ fxResponse: _response, fxSource: 'exchangerate.host' });
    } catch {
      if (cached) {
        FX = cached;
        renderFxNote(true);
      } else {
        FX = { base:'USD', asOf:null, source:'USD only', rates:{USD:1}, _ts:null };
        renderFxNote(true);
      }
    }
  }
}

function convertUSD(amount, to = currentCurrency){
  const baseRate = FX?.rates?.[to] || 1;
  const driftPct = Number(store?.get?.().ui?.fxDriftPct ?? 0);
  return amount * baseRate * (1 + (driftPct / 100));
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
    
    // Allow 100ms for FX rates to settle if needed
    setTimeout(() => {
      window.renderAll();
    }, 100);
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
      if (type === 'ready') {
        workerReady = true;
        return;
      }
      if (type === 'result') {
        store.patch('results', payload);
        document.dispatchEvent(new CustomEvent('itw:calc-updated', {
          detail: { results: payload }
        }));
        return;
      }
    };
    calcWorker.onerror = ()=>{
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
const debounced = (fn, ms=CONFIG.CALC_DEBOUNCE_MS) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

function scheduleCalc(){
  const { inputs, economics, dataset } = store.get();
  
  // Voucher input clamping (0-10)
  const clampVoucher = (v) => Math.max(0, Math.min(CONFIG.VOUCHER_MAX_PER_PERSON, Math.round(num(v))));
  
  const cnaDetails = document.getElementById('vouchers') || document.getElementById('cna-vouchers');
  const vouchersEnabled = !!(cnaDetails && cnaDetails.open);
  
  const vAdultD  = clampVoucher(document.getElementById('v-adult-d')?.value || 0);
  const vAdultDP = clampVoucher(document.getElementById('v-adult-dp')?.value || 0);
  const vAdultP  = clampVoucher(document.getElementById('v-adult-p')?.value || 0);
  const vMinorD  = clampVoucher(document.getElementById('v-minor-d')?.value || 0);
  const vMinorDP = clampVoucher(document.getElementById('v-minor-dp')?.value || 0);
  const vMinorP  = clampVoucher(document.getElementById('v-minor-p')?.value || 0);
  
  const face = Number((economics && economics.deluxeCap) ?? CONFIG.DELUXE_CAP_FALLBACK);
  
  const vouchers = {
    adultCountPerDay: (vAdultD*4) + (vAdultDP*5) + (vAdultP*5),
    minorCountPerDay: (vMinorD*4) + (vMinorDP*5) + (vMinorP*5),
    perVoucherValue: face
  };
  
  const wantVouchers = vouchersEnabled && (vouchers.adultCountPerDay > 0 || vouchers.minorCountPerDay > 0);
  const canUseWorker = ensureWorker() && workerReady && !wantVouchers;
  
  if (canUseWorker) {
    calcWorker.postMessage({
      type:'compute',
      payload: { inputs, economics, dataset: (dataset||FALLBACK_DATASET) }
    });
    return;
  }
  
  if (!window.ITW_MATH || typeof window.ITW_MATH.compute !== 'function') {
    store.patch('results', initialState.results);
    return;
  }
  
  let results;
  if (wantVouchers && typeof window.ITW_MATH.computeWithVouchers === 'function'){
    results = window.ITW_MATH.computeWithVouchers(
      inputs,
      economics,
      dataset || FALLBACK_DATASET,
      vouchers
    );
    
    const chip = document.getElementById('voucher-badge');
    if (chip) {
      const amt = Number(results.vouchersAppliedPerDay || 0);
      chip.hidden = !(amt > 0);
      chip.textContent = amt > 0 ? `C&A: −${money(amt)}/day` : '';
    }
  } else {
    results = window.ITW_MATH.compute(inputs, economics, dataset || FALLBACK_DATASET);
    const chip = document.getElementById('voucher-badge');
    if (chip) chip.hidden = true;
  }
  
  store.patch('results', results);
  document.dispatchEvent(new CustomEvent('itw:calc-updated', { detail: { results } }));
}

const debouncedCalc = debounced(scheduleCalc);

/* ------------------------- Chart & Rendering ------------------------- */
let chart = null;

const BAR_COLORS = {
  alc: '#0e6e8e',
  soda: '#cbd5e1',
  refresh: '#a7e0f0',
  deluxe: '#f7b4a2',
  lineMax: 'rgba(0,0,0,.35)',
  lineMin: 'rgba(0,0,0,.20)'
};

function ensureChart(){
  if (chart) return chart;

  const el = $('#breakeven-chart');
  if (!el) return null;

  // Let CSS control sizing. Just ensure the parent has some height in CSS.
  chart = new Chart(el.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['À-la-carte','Soda','Refreshment','Deluxe'],
      datasets: [{
        label: 'Daily cost',
        data: [0,0,0,0],
        backgroundColor: [
          BAR_COLORS.alc,
          BAR_COLORS.soda,
          BAR_COLORS.refresh,
          BAR_COLORS.deluxe
        ]
      }]
    },
    options: {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  scales: {
    x: { stacked: false, grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,.08)' },
      ticks: {
        // Show ticks in the currently selected currency
        callback: (v) => {
          try {
            return new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: currentCurrency
            }).format(v);
          } catch {
            return v;
          }
        }
      }
    }
  },
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true } },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const name = ctx.chart.data.labels?.[ctx.dataIndex] || 'Value';
          const v = ctx.parsed.y;
          try {
            const formatted = new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: currentCurrency
            }).format(v);
            return `${name}: ${formatted}`;
          } catch {
            return `${name}: ${v}`;
          }
        }
      }
    }
  }
}
  });

  el._chart = chart;
  store.patch('ui.chartReady', true);
  return chart;
}

function renderResults(r){
  const chip = $('#best-chip');
  const text = $('#best-text');
  
  const label = r.winnerKey==='alc' ? 'à-la-carte' :
    (r.winnerKey==='deluxe' ? 'Deluxe' :
     r.winnerKey.charAt(0).toUpperCase() + r.winnerKey.slice(1));
  
if (chip) chip.textContent = `Best value: ${label}`;
// Gratuity disclosure (once, under header)
;(function gratuityDisclosure(){
  const node = document.getElementById('grat-note');
  const gratPct = Math.round((store.get().economics.grat ?? 0.18) * 100);
  if (!node) return;
  node.textContent = `All prices shown include the ship’s automatic gratuity (currently ${gratPct}%).`;
  node.hidden = false;
})();
  if (text) {
    text.textContent = (r.winnerKey==='alc')
      ? 'Your daily picks are cheapest without a package.'
      : `Your daily picks are cheapest with the ${label} package.`;
    
    // Category Breakdown
    (function renderCategoryBreakdown(){
      const section = document.getElementById('category-breakdown');
      const grid = document.getElementById('category-grid');
      if (!section || !grid) return;
      
      const rows = Array.isArray(r?.categoryRows) ? r.categoryRows : [];
      const clean = rows.filter(x => !/voucher/i.test(String(x?.id || x?.name || '')));
      
      if (!clean.length) {
        section.hidden = true;
        grid.innerHTML = '';
        return;
      }
      
      grid.innerHTML = clean.map(row => `
        <div class="category-item">
          <span class="cat-name">${row.label || row.name || ''}</span>
          <span class="cat-cost">${money(row.perDay ?? row.value ?? 0)}/day</span>
        </div>
      `).join('');
      
      section.hidden = false;
    })();
  }
  
  announce(`Best value: ${label}`);
  
  // Kids package hint
  (function showKidsHint(){
    const container = document.getElementById('best-text');
    if (!container) return;
    
    Array.from(container.querySelectorAll('.kids-hint')).forEach(n => n.remove());
    
    const minors = (r.groupRows || []).filter(x =>
      x && (x.isMinor || /Minor\s+\d+/.test(x.who||''))
    );
    if (!minors.length) return;
    
    const keys = new Set(minors.map(m => m.pkgKey || (
      /refresh/i.test(m.pkg||'') ? 'refresh' :
      /soda/i.test(m.pkg||'') ? 'soda' :
      /à[-\s]?la[-\s]?carte/i.test(m.pkg||'') ? 'alc' : ''
    )));
    
    let kidsMsg = '';
    if (keys.has('refresh')) {
      kidsMsg = 'Kids are best served by the Refreshment Package based on your inputs.';
    } else if (keys.has('soda')) {
      kidsMsg = 'Kids are best served by the Soda Package based on your inputs.';
    } else if (keys.has('alc')) {
      kidsMsg = 'Kids are best on à-la-carte based on your inputs.';
    }
    
    if (kidsMsg) {
      const add = document.createElement('div');
      add.className = 'small kids-hint';
      add.style.marginTop = '4px';
      add.textContent = kidsMsg;
      container.appendChild(add);
    }
  })();
  
  // Totals
  const totals = $('#totals');
  if (totals) totals.textContent = `${money(r.perDay)}/day • ${money(r.trip)} trip`;
  
  // Group breakdown table
  const tbody = $('#group-table-body');
  const sec = $('#group-breakdown');
  if (tbody) {
    tbody.innerHTML = '';
    r.groupRows.forEach(row => {
      tbody.insertAdjacentHTML('beforeend',
        `<tr><td>${row.who}</td><td>${row.pkg}</td><td>${money(row.perDay)}</td><td>${money(row.trip)}</td></tr>`
      );
    });
  }
  if (sec) sec.hidden = r.groupRows.length <= 1;
  
  // Included value badges
  const incSNode = document.querySelector('[data-inc="soda"]');
  const incRNode = document.querySelector('[data-inc="refresh"]');
  const incDNode = document.querySelector('[data-inc="deluxe"]');
  if (incSNode) incSNode.textContent = money(r.included.soda)+'/day';
  if (incRNode) incRNode.textContent = money(r.included.refresh)+'/day';
  if (incDNode) incDNode.textContent = money(r.included.deluxe)+'/day';
  
  const oc = $('#overcap-est');
  if (oc) oc.textContent = money(r.overcap)+'/day';
  
  // Chart
const c = ensureChart();
const rn = document.getElementById('range-note');

if (c) {
  // Base bars (converted)
  c.data.datasets = [
    {
      label: 'Daily cost',
      data: [
        convertUSD(r.bars.alc.mean),
        convertUSD(r.bars.soda.mean),
        convertUSD(r.bars.refresh.mean),
        convertUSD(r.bars.deluxe.mean)
      ],
      backgroundColor: [
        BAR_COLORS.alc,
        BAR_COLORS.soda,
        BAR_COLORS.refresh,
        BAR_COLORS.deluxe
      ]
    }
  ];

  // Optional range lines (also converted)
  if (r.hasRange) {
    c.data.datasets.push(
      {
        label: '(max)',
        data: [
          convertUSD(r.bars.alc.max),
          convertUSD(r.bars.soda.max),
          convertUSD(r.bars.refresh.max),
          convertUSD(r.bars.deluxe.max)
        ],
        type: 'line',
        borderWidth: 2,
        pointRadius: 0,
        borderColor: BAR_COLORS.lineMax,
        fill: false
      },
      {
        label: '(min)',
        data: [
          convertUSD(r.bars.alc.min),
          convertUSD(r.bars.soda.min),
          convertUSD(r.bars.refresh.min),
          convertUSD(r.bars.deluxe.min)
        ],
        type: 'line',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        borderColor: BAR_COLORS.lineMin,
        fill: false
      }
    );
    if (rn) rn.textContent = 'Range lines show min/max based on your ranges.';
  } else {
    if (rn) rn.textContent = '';
  }

  c.update('none');
}
  
  // Update Screen-Reader a11y Table
  const srAlc = document.getElementById('sr-alc');
  const srSoda = document.getElementById('sr-soda');
  const srRefresh = document.getElementById('sr-refresh');
  const srDeluxe = document.getElementById('sr-deluxe');
  
  if (srAlc && r.bars) srAlc.textContent = money(r.bars.alc.mean);
  if (srSoda && r.bars) srSoda.textContent = money(r.bars.soda.mean);
  if (srRefresh && r.bars) srRefresh.textContent = money(r.bars.refresh.mean);
  if (srDeluxe && r.bars) srDeluxe.textContent = money(r.bars.deluxe.mean);
  
  // >>> Break-even helpers (rounded, gratuity-included, deluxe-cap aware)
(function renderBreakevenHelpers(){
  const sodaEl     = document.getElementById('soda-breakeven');
  const refreshEl  = document.getElementById('refresh-breakeven');
  const deluxeEl   = document.getElementById('deluxe-breakeven');
  if (!sodaEl && !refreshEl && !deluxeEl) return;

  // Pull current state we already have available in this scope
  const state     = store.get();
  const inputs    = state.inputs || {};
  const economics = state.economics || {};
  const ds        = state.dataset || FALLBACK_DATASET;
  const prices    = ds.prices || {};
  const sets      = (ds.sets || {});
  const grat      = Number(economics.grat ?? 0.18);

  // Guard sets we depend on
  const sodaSet      = Array.isArray(sets.soda) ? sets.soda : ['soda'];
  const refreshSet   = Array.isArray(sets.refresh) ? sets.refresh : [];
  

  // Helpers
  function niceLabel(k){
    if (k === 'teaprem') return 'Premium Tea';
    if (k === 'freshjuice') return 'Fresh Juice';
    if (k === 'bottledwater') return 'Bottled Water';
    return k.charAt(0).toUpperCase() + k.slice(1);
  }
  function unitWithGrat(k){
    const base = Number(prices[k] || 0);
    return base > 0 ? base * (1 + grat) : 0;
  }
  // Prefer items the user already drinks; otherwise take the cheapest
  function pickCheapest(setKeys){
    const prefer = [];
    const fallback = [];
    for (const key of setKeys) {
      const unit = unitWithGrat(key);
      if (!Number.isFinite(unit) || unit <= 0) continue;
      const qty = Number(inputs?.drinks?.[key] || 0);
      (qty > 0 ? prefer : fallback).push({ key, unit });
    }
    const pool = prefer.length ? prefer : fallback;
    pool.sort((a,b) => a.unit - b.unit);
    return pool[0] || null;
  }
  // Build cheapest-first suggestions (primary + up to 2 alternates)
  function topSuggestions(setKeys, max=3){
    const rows = [];
    for (const key of setKeys) {
      const unit = unitWithGrat(key);
      if (!Number.isFinite(unit) || unit <= 0) continue;
      rows.push({ key, unit, liked: (Number(inputs?.drinks?.[key] || 0) > 0) });
    }
    rows.sort((a,b) => (b.liked - a.liked) || (a.unit - b.unit));
    return rows.slice(0, max);
  }

  // GAP = (package price – included value) for each package
  const incS = r?.included?.soda ?? 0;
  const incR = r?.included?.refresh ?? 0;
  const incD = r?.included?.deluxe ?? 0;
  const pkg  = economics.pkg || { soda:0, refresh:0, deluxe:0 };

  const gap = {
    soda:    (pkg.soda    ?? 0) - incS,
    refresh: (pkg.refresh ?? 0) - incR,
    deluxe:  (pkg.deluxe  ?? 0) - incD
  };

// SODA
if (sodaEl) {
  // prevent stacking notes on re-render
  sodaEl.querySelector('.grat-note')?.remove();

  if (gap.soda <= 0) {
    sodaEl.innerHTML =
      `<p class="small" style="color:var(--good);font-weight:800">✅ Soda Package is already saving you ${money(Math.abs(gap.soda))}/day.</p>`;
  } else {
    const pick = pickCheapest(sodaSet);
    if (!pick) {
      sodaEl.innerHTML = `<p class="small">Enter soda items to see break-even tips.</p>`;
    } else {
      const need = Math.ceil(gap.soda / pick.unit);
      sodaEl.innerHTML =
        `<p class="small" style="font-weight:800">Soda Package: You're ${money(gap.soda)} from breaking even.</p>
         <p class="small">Add <strong>${need} more ${niceLabel(pick.key)}${need>1?'s':''}</strong> per day to make Soda worth it (${money(pick.unit)} each).</p>`;
    }
  }

  // single, non-duplicating gratuity disclosure
  sodaEl.insertAdjacentHTML('beforeend',
    `<p class="xsmall muted grat-note">(Each drink price shown includes the ship’s automatic gratuity of ${(grat*100).toFixed(0)}%.)</p>`
  );
}

  // REFRESHMENT
if (refreshEl) {
  // prevent stacking notes on re-render
  refreshEl.querySelector('.grat-note')?.remove();

  if (gap.refresh <= 0) {
    refreshEl.innerHTML =
      `<p class="small" style="color:var(--good);font-weight:800">✅ Refreshment is already saving you ${money(Math.abs(gap.refresh))}/day.</p>`;
  } else {
    const sugg = topSuggestions(refreshSet, 3);
    if (!sugg.length) {
      refreshEl.innerHTML = `<p class="small">Enter non-alcoholic items to see break-even tips.</p>`;
    } else {
      const needPrimary = Math.ceil(gap.refresh / sugg[0].unit);
      const alts = sugg.slice(1).map(s => {
        const n = Math.ceil(gap.refresh / s.unit);
        return `${n} ${niceLabel(s.key)}${n>1?'s':''} (${money(s.unit)} each)`;
      });
      const altText = alts.length ? ` or ${alts.join(' or ')}` : '';
      refreshEl.innerHTML =
        `<p class="small" style="font-weight:800">Refreshment Package: You're ${money(gap.refresh)} from breaking even.</p>
         <p class="small">Add <strong>${needPrimary} ${niceLabel(sugg[0].key)}${needPrimary>1?'s':''}</strong> (${money(sugg[0].unit)} each)${altText} per day to make Refreshment worth it.</p>`;
    }
  }

  // single, non-duplicating gratuity disclosure
  refreshEl.insertAdjacentHTML('beforeend',
    `<p class="xsmall muted grat-note">(Each drink price shown includes the ship’s automatic gratuity of ${(grat*100).toFixed(0)}%.)</p>`
  );
}

// DELUXE
if (deluxeEl) {
  // Use cap *with* gratuity for alcoholic items
  const cap = Number(economics.deluxeCap ?? CONFIG.DELUXE_CAP_FALLBACK);
  const capWithGrat = cap * (1 + grat);
  const need = capWithGrat > 0 ? Math.ceil(gap.deluxe / capWithGrat) : 0;

  // Remove any previous gratuity note to avoid duplicates
  deluxeEl.querySelector('.grat-note')?.remove();

  if (gap.deluxe <= 0) {
    // Already saving
    deluxeEl.innerHTML =
      `<p class="small" style="color:var(--good);font-weight:800">✅ Deluxe is already saving you ${money(Math.abs(gap.deluxe))}/day.</p>`;
  } else {
    // Tips to break even
    deluxeEl.innerHTML =
      `<p class="small" style="font-weight:800">Deluxe Package: You're ${money(gap.deluxe)} from breaking even.</p>
       <p class="small">Add <strong>${need} cap-price alcoholic drink${need>1?'s':''}</strong> per day (cap $${cap.toFixed(2)} + grat = ${money(capWithGrat)} each).</p>`;
  }

  // Gratuity disclosure (single, non-duplicating)
  deluxeEl.insertAdjacentHTML('beforeend',
    `<p class="xsmall muted grat-note">(Each drink price shown includes the ship’s automatic gratuity of ${(grat*100).toFixed(0)}%.)</p>`
  );
   }
;(function kidsChips(){
  // remove any existing chips on the correct class
  document.querySelectorAll('.package-card .kids-chip').forEach(el => el.remove());

  const minors = (r.groupRows || []).filter(x =>
    x && (x.isMinor || /Minor\s+\d+/.test(x.who||''))
  );
  if (!minors.length) return;

  const keys = new Set(minors.map(m => m.pkgKey || (
    /refresh/i.test(m.pkg||'') ? 'refresh' :
    /soda/i.test(m.pkg||'') ? 'soda' : ''
  )));

  const targetEls = [];
  if (keys.has('soda'))    targetEls.push(document.querySelector('[data-card="soda"]'));
  if (keys.has('refresh')) targetEls.push(document.querySelector('[data-card="refresh"]'));

  targetEls.filter(Boolean).forEach(card => {
    const hd = card.querySelector('h4') || card.querySelector('.phd') || card;
    const chipEl = document.createElement('span');
    chipEl.className = 'kids-chip';
    chipEl.textContent = '👧 Recommended for kids';
    chipEl.style.cssText =
      'margin-left:8px;background:#ccfbf1;color:#115e59;border:1px solid #99f6e4;' +
      'padding:3px 8px;border-radius:999px;font-size:.75rem;font-weight:800;white-space:nowrap;';
    hd.appendChild(chipEl);
  });
   })();
}

/* ------------------------- Economics/Prices UI ------------------------- */
function renderEconomics(){
  const { economics } = store.get();
  
  const pS = $('[data-pkg-price="soda"]');
  const pR = $('[data-pkg-price="refresh"]');
  const pD = $('[data-pkg-price="deluxe"]');
  
  if (pS) pS.textContent = money(economics.pkg.soda);
  if (pR) pR.textContent = money(economics.pkg.refresh);
  if (pD) pD.textContent = money(economics.pkg.deluxe);
  
const cap = $('#cap-badge');
if (cap) {
  const c = economics.deluxeCap;
  const g = economics.grat ?? 0.18;

  cap.textContent = `$${c.toFixed(2)}`;

  const titleStr =
    `We use the cap plus gratuity for break-even math. ` +
    `Example: $${c.toFixed(2)} × (1 + ${(g * 100).toFixed(0)}%) = ${money(c * (1 + g))}`;
  cap.setAttribute('title', titleStr);

  const ariaStr =
    `Deluxe cap is $${c.toFixed(2)} before gratuity. ` +
    `With gratuity it's ${money(c * (1 + g))} per drink.`;
  cap.setAttribute('aria-label', ariaStr);

   cap.tabIndex = 0; // make it focusable for keyboard users
}   // closes: if (cap)
}   // closes: function renderEconomics
function renderPricePills(){
  const ds = store.get().dataset || FALLBACK_DATASET;
  let priceMap = ds.prices;
  
  if (!priceMap && Array.isArray(ds.items)) {
    priceMap = {};
    ds.items.forEach(it => {
      if (it && it.id) priceMap[it.id] = Number(it.price) || 0;
    });
  }
  
  if (!priceMap) return;
  
  Object.entries(priceMap).forEach(([k,v]) => {
    const pill = document.querySelector(`[data-price-pill="${k}"]`);
    if (pill) pill.textContent = `avg ${money(v)}`;
  });
}

/* ---------- Global re-render helper ------------------------- */
window.renderAll = () => {
  renderEconomics();
  renderPricePills();
  renderResults(store.get().results);
};

/* ------------------------- Itinerary Mode UI ------------------------- */
const DRINK_KEYS = [
  "soda","coffee","teaprem","freshjuice","mocktail","energy",
  "milkshake","bottledwater","beer","wine","cocktail","spirits"
];
const DAY_TYPES = [["sea","Sea Day"],["port","Port Day"],["embark","Embark/Debark"]];

function prettyName(k){
  return (k==='teaprem' ? 'Specialty tea' :
    k==='freshjuice' ? 'Fresh juice/smoothie' :
    k==='bottledwater' ? 'Bottled water' :
    k.charAt(0).toUpperCase() + k.slice(1));
}

function ensureItineraryArray(){
  const s = store.get();
  const days = Math.max(1, Math.min(365, Number(s.inputs.days||7)));
  let it = Array.isArray(s.inputs.itinerary) ? structuredClone(s.inputs.itinerary) : [];
  
  if (it.length !== days) {
    const baseDrinks = structuredClone(s.inputs.drinks || {});
    const out = [];
    for (let i=0; i<days; i++) {
      out.push(it[i] || { day:i+1, type:'sea', drinks: i===0 ? baseDrinks : {} });
    }
    store.patch('inputs.itinerary', out);
    return out;
  }
  
  return it;
}

function toggleModeUI(mode){
  const showItin = (mode === 'itinerary');

  // 1) Containers
  const simpleBox = document.getElementById('simple-inputs');
  const itinBox   = document.getElementById('itinerary-inputs');
  if (simpleBox) simpleBox.style.display = showItin ? 'none' : '';
  if (itinBox)   itinBox.style.display   = showItin ? '' : 'none';

  // 2) Sea/Port weighting fieldset (hide in itinerary mode)
  const seaFieldset = document.getElementById('sea-toggle')?.closest('fieldset');
  if (seaFieldset) seaFieldset.style.display = showItin ? 'none' : '';

  // 3) Keep the radios reflecting current mode
  const rSimple = document.getElementById('mode-simple');
  const rItin   = document.getElementById('mode-itinerary');
  if (rSimple) rSimple.checked = !showItin;
  if (rItin)   rItin.checked   = showItin;
}

function renderItineraryUI(){
  const container = document.getElementById('itinerary-inputs');
  if (!container) return;
  
  const it = ensureItineraryArray();
  container.innerHTML = '';
  
  it.forEach((day, idx) => {
    const fs = document.createElement('fieldset');
    fs.className = 'day-row';
    fs.style.cssText = 'border:1px solid var(--bd);padding:12px;border-radius:10px;margin-top:12px';
    
    fs.insertAdjacentHTML('afterbegin', `
      <legend style="font-weight:800;padding:0 6px">
        <span class="day-label">Day ${idx+1}</span>
        <select class="day-type-select small" data-day-index="${idx}" aria-label="Day type" style="margin-left:8px;">
          ${DAY_TYPES.map(([v,l]) => 
            `<option value="${v}" ${day.type===v?'selected':''}>${l}</option>`
          ).join('')}
        </select>
      </legend>
    `);
    
    DRINK_KEYS.forEach(key => {
      const val = Number(day.drinks?.[key]||0);
      const row = document.createElement('div');
      row.className = 'row row--stepper';
      row.innerHTML = `
        <label class="small" style="line-height:1.2;">${prettyName(key)}</label>
        <div class="input-stepper">
          <button class="btn-step" type="button" data-day-index="${idx}" data-day-key="${key}" data-day-op="dec" aria-label="Decrease ${prettyName(key)} for day ${idx+1}">−</button>
          <input type="text" inputmode="decimal" value="${val}" class="day-input" data-day-index="${idx}" data-day-key="${key}" aria-label="${prettyName(key)} for day ${idx+1}">
          <button class="btn-step" type="button" data-day-index="${idx}" data-day-key="${key}" data-day-op="inc" aria-label="Increase ${prettyName(key)} for day ${idx+1}">+</button>
        </div>
      `;
      fs.appendChild(row);
    });
    
    container.appendChild(fs);
  });
  
  container.removeEventListener('click', _handleItinClick);
  container.addEventListener('click', _handleItinClick);
  container.removeEventListener('change', _handleItinChange);
  container.addEventListener('change', _handleItinChange);
  container.removeEventListener('input', _handleItinInput);
  container.addEventListener('input', _handleItinInput);
}

function _handleItinClick(e){
  const btn = e.target.closest('.btn-step');
  if (!btn) return;
  
  const dayIndex = Number(btn.dataset.dayIndex);
  const key = btn.dataset.dayKey;
  const op = btn.dataset.dayOp;
  const amount = op==='inc' ? 1 : -1;
  
  const s = store.get();
  const it = structuredClone(s.inputs.itinerary || []);
  if (!it[dayIndex]) return;
  
  const cur = Number(it[dayIndex].drinks?.[key]||0);
  const next = Math.max(0, cur + amount);
  it[dayIndex].drinks[key] = next;
  store.patch('inputs.itinerary', it);
  
  const input = document.querySelector(`.day-input[data-day-index="${dayIndex}"][data-day-key="${key}"]`);
  if (input) input.value = String(next);
  
  scheduleCalc();
  syncURL();
  persistNow();
}

function _handleItinChange(e){
  const t = e.target;
  const dayIndex = Number(t.dataset.dayIndex);
  if (!Number.isFinite(dayIndex)) return;
  
  const s = store.get();
  const it = structuredClone(s.inputs.itinerary || []);
  if (!it[dayIndex]) return;
  
  if (t.classList.contains('day-type-select')) {
    it[dayIndex].type = t.value;
  } else if (t.classList.contains('day-input')) {
    const key = t.dataset.dayKey;
    it[dayIndex].drinks[key] = Math.max(0, parseNum(t.value));
  }
  
  store.patch('inputs.itinerary', it);
  scheduleCalc();
  syncURL();
  persistNow();
}

const _debouncedItin = (() => {
  let h;
  return () => {
    clearTimeout(h);
    h = setTimeout(() => {
      scheduleCalc();
      syncURL();
      persistNow();
    }, CONFIG.CALC_DEBOUNCE_MS);
  };
})();

function _handleItinInput(e){
  const t = e.target;
  if (!t.classList.contains('day-input')) return;
  
  const dayIndex = Number(t.dataset.dayIndex);
  const key = t.dataset.dayKey;
  
  const s = store.get();
  const it = structuredClone(s.inputs.itinerary || []);
  if (!it[dayIndex]) return;
  
  it[dayIndex].drinks[key] = Math.max(0, parseNum(t.value));
  store.patch('inputs.itinerary', it);
  _debouncedItin();
}

/* ------------------------- Inputs & UI Wiring ------------------------- */
function wireInputs(){
  const debouncedInput = (fn, ms=CONFIG.CALC_DEBOUNCE_MS) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };
  
  function writeInput(inp, rawVal){
    const key = inp.dataset.input;
    const isCheckbox = inp.type === 'checkbox';
    const parsed = isCheckbox ? Boolean(rawVal) : num(rawVal);
    
    switch (key) {
      case 'seaapply':
        store.patch('inputs.seaApply', parsed);
        break;
      case 'days': {
        const days = clamp(Math.round(parsed), 1, 365);
        store.patch('inputs.days', days);
        const s = store.get();
        if ((s.inputs.seaDays ?? 0) > days) {
          store.patch('inputs.seaDays', days);
        }
        if (s.inputs.calcMode === 'itinerary') {
          ensureItineraryArray();
          renderItineraryUI();
        }
        break;
      }
      case 'seadays': {
        const days = (store.get().inputs.days || 7);
        const sea = clamp(Math.round(parsed), 0, days);
        store.patch('inputs.seaDays', sea);
        break;
      }
      case 'seaweight':
        store.patch('inputs.seaWeight', clamp(parsed, 0, CONFIG.SEA_WEIGHT_MAX));
        break;
      case 'adults':
        store.patch('inputs.adults', clamp(Math.round(parsed), 1, 20));
        break;
      case 'minors':
        store.patch('inputs.minors', clamp(Math.round(parsed), 0, 20));
        break;
      default:
        store.patch(`inputs.drinks.${key}`, Math.max(0, parsed));
        break;
    }
  }
  
  $$('[data-input]').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const val = (inp.type === 'checkbox') ? e.target.checked : e.target.value;
      writeInput(inp, val);
      
      if (inp.dataset.input === 'seaweight') {
        const out = document.getElementById('sea-weight-val');
        if (out) out.textContent = `${parseNum(val)}%`;
      }
      
      debouncedCalc();
    });
    
    inp.addEventListener('change', (e) => {
      const val = (inp.type === 'checkbox') ? e.target.checked : e.target.value;
      writeInput(inp, val);
      scheduleCalc();
      syncURL();
      persistNow();
    });
  });
  
  const modeSimple = document.getElementById('mode-simple');
  const modeItinerary = document.getElementById('mode-itinerary');
  
  if (modeSimple) {
    modeSimple.addEventListener('change', () => {
      store.patch('inputs.calcMode', 'simple');
      toggleModeUI('simple');
      scheduleCalc();
      syncURL();
      persistNow();
    });
  }
  
  if (modeItinerary) {
    modeItinerary.addEventListener('change', () => {
      ensureItineraryArray();
      store.patch('inputs.calcMode', 'itinerary');
      renderItineraryUI();
      toggleModeUI('itinerary');
      scheduleCalc();
      syncURL();
      persistNow();
    });
  }
  
  /* ---------- Editable package prices ---------- */
  window.togglePriceEdit = (which, cancel=false) => {
    const form = document.getElementById(`edit-${which}`);
    if (!form) return;
    form.hidden = cancel ? true : !form.hidden;
    if (!form.hidden) form.querySelector('input')?.focus();
  };
  
  window.savePackagePrice = (which) => {
    const el = document.getElementById(`edit-${which}-val`);
    const v = parseNum(el?.value);
    if (v > 0) {
      const eco = { ...store.get().economics, pkg: { ...store.get().economics.pkg, [which]: v } };
      store.patch('economics', eco);
      window.togglePriceEdit(which, true);
      announce(`Updated ${which} to ${money(v)}/day`);
      scheduleCalc();
      persistNow();
    }
  };
  
  /* ---------- Deluxe cap edit ---------- */
  window.toggleCapEdit = (cancel=false) => {
    const f = $('#edit-cap');
    if (f) {
      f.hidden = cancel ? true : !f.hidden;
      if (!f.hidden) f.querySelector('input')?.focus();
    }
  };
  
  window.saveCap = () => {
    const v = parseNum($('#edit-cap-val')?.value);
    if (v >= 0) {
      const eco = { ...store.get().economics, deluxeCap: v };
      store.patch('economics', eco);
      window.toggleCapEdit(true);
      announce(`Updated deluxe cap to $${v.toFixed(2)}`);
      scheduleCalc();
      persistNow();
    }
  };
  
  /* ---------- Reset ---------- */
  window.resetInputs = () => {
    const ds = store.get().dataset || FALLBACK_DATASET;
    store.patch('inputs', structuredClone(initialState.inputs));
    store.patch('economics', {
      ...structuredClone(initialState.economics),
      pkg: { ...initialState.economics.pkg, ...(ds.packages || {}) }
    });
    scheduleCalc();
    syncURL();
    persistNow();
    announce('All inputs reset');
  };
  
  /* ---------- Print ---------- */
  window.printResults = () => window.print();
  
  /* ---------- Share Scenario Button ---------- */
  window.shareScenario = () => {
    try {
      syncURL();
      navigator.clipboard.writeText(location.href);
      const btn = document.querySelector('[onclick="shareScenario()"]');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ Link Copied!';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2000);
      }
    } catch (e) {
      console.error('Failed to copy scenario link:', e);
      alert('Failed to copy link. Please copy the URL from your browser bar.');
    }
  };
  
  /* ---------- Steppers (supports ±0.5) ---------- */
  window.stepInput = (key, amount) => {
    const s = store.get();
    if (!s.inputs.drinks.hasOwnProperty(key)) return;
    
    const cur = s.inputs.drinks[key];
    const currentVal = (typeof cur === 'object')
      ? ((Number(cur.min)||0) + (Number(cur.max)||0)) / 2
      : parseNum(String(cur));
    
    let next = currentVal + Number(amount || 0);
    if (next < 0) next = 0;
    
    const needsHalf = (Math.abs(amount) === 0.5) || String(currentVal).includes('.');
    const finalStr = needsHalf ? next.toFixed(1) : next.toFixed(0);
    
    store.patch(`inputs.drinks.${key}`, parseNum(finalStr));
    scheduleCalc();
    syncURL();
    persistNow();
  };
  
  /* ---------- Presets ---------- */
  window.loadPreset = (name) => {
    const set = {
      light: { beer:'1', wine:'1', soda:'1' },
      moderate: { beer:'2', wine:'1', cocktail:'2', coffee:'1' },
      heavy: { beer:'3', cocktail:'3', spirits:'2', bottledwater:'2' },
      coffee: { coffee:'4', soda:'0', beer:'0', wine:'0', cocktail:'0', spirits:'0' }
    }[name] || {};
    
    const next = structuredClone(store.get().inputs);
    Object.keys(next.drinks).forEach(k => next.drinks[k] = 0);
    Object.entries(set).forEach(([k,v]) => next.drinks[k] = parseQty(v));
    
    store.patch('inputs', next);
    scheduleCalc();
    persistNow();
    announce('Preset loaded: '+name);
  };
  
  /* ---------- Personas ---------- */
  const PERSONAS = {
    family: {
      label: "Family with Kids",
      adults: 2,
      minors: 2,
      drinks: {
        soda: 3.5, freshjuice: 2, mocktail: 1.5, energy: 0.5, bottledwater: 4.5, coffee: 1.5,
        beer: 1.0, wine: 1.5, cocktail: 0, spirits: 0, teaprem: 0, milkshake: 0
      }
    },
    girls: {
      label: "Girls Trip",
      adults: 4,
      minors: 0,
      drinks: {
        soda: 1.5, freshjuice: 2.5, mocktail: 2, energy: 1, bottledwater: 3.5, coffee: 2,
        beer: 0.5, wine: 1.5, cocktail: 1.5, spirits: 0, teaprem: 0.3, milkshake: 0
      }
    },
    boys: {
      label: "Boys Trip",
      adults: 3,
      minors: 0,
      drinks: {
        soda: 2.5, freshjuice: 1, mocktail: 1, energy: 2, bottledwater: 4, coffee: 1,
        beer: 3, wine: 0.5, cocktail: 0.8, spirits: 0.7, teaprem: 0, milkshake: 0
      }
    },
    romance: {
      label: "Romantic Couple",
      adults: 2,
      minors: 0,
      drinks: {
        soda: 1, freshjuice: 2, mocktail: 1.5, energy: 0, bottledwater: 3, coffee: 2,
        beer: 0.3, wine: 1.3, cocktail: 0.7, spirits: 0, teaprem: 0.2, milkshake: 0
      }
    },
    solo: {
      label: "Health-Conscious Solo",
      adults: 1,
      minors: 0,
      drinks: {
        soda: 0.5, freshjuice: 3.5, mocktail: 2, energy: 1, bottledwater: 5.5, coffee: 2,
        beer: 0.3, wine: 0.7, cocktail: 0, spirits: 0, teaprem: 0.3, milkshake: 0
      }
    },
    seniors: {
      label: "Senior Group Outing",
      adults: 4,
      minors: 0,
      drinks: {
        soda: 2, freshjuice: 2, mocktail: 1, energy: 0, bottledwater: 4, coffee: 3,
        beer: 0.7, wine: 1.3, cocktail: 0, spirits: 0, teaprem: 0.4, milkshake: 0
      }
    },
    light: {
      label: "Light Drinker",
      adults: 1,
      minors: 0,
      drinks: {
        soda: 1, coffee: 1, bottledwater: 2, beer: 1, wine: 1, cocktail: 0.5
      }
    },
    moderate: {
      label: "Moderate Drinker",
      adults: 1,
      minors: 0,
      drinks: {
        soda: 1, coffee: 2, bottledwater: 2, beer: 2, wine: 2, cocktail: 2
      }
    }
  };
  
  window.applyPersona = (key) => {
    const p = PERSONAS[key];
    if (!p) return;
    
    const next = structuredClone(store.get().inputs);
    next.adults = Math.max(1, Math.min(20, Math.round(p.adults ?? next.adults)));
    next.minors = Math.max(0, Math.min(20, Math.round(p.minors ?? next.minors)));
    
    Object.keys(next.drinks).forEach(k => next.drinks[k] = 0);
    Object.entries(p.drinks || {}).forEach(([k,v]) => {
      if (k in next.drinks) next.drinks[k] = Math.max(0, Number(v) || 0);
    });
    
    store.patch('inputs', next);
    scheduleCalc();
    persistNow();
    announce(`Loaded persona: ${p.label}`);
    
    document.getElementById('jump-winner')?.click();
  };
  
  /* ---------- Jump to best value ---------- */
  const jump = $('#jump-winner');
  if (jump) {
    jump.addEventListener('click', () => {
      const el = document.querySelector('.package-card.winner') || document.getElementById('packages');
      el?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  }
  
  /* ---------- ESC closes tooltips ---------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $$('.tooltip [role="tooltip"]').forEach(tt => tt.style.display = 'none');
    }
  });
}

/* ------------------------- Reflect inputs to DOM ------------------------- */
function reflectInputsToDOM(){
  const { inputs } = store.get();
  
  const days = $('#input-days');
  if (days) days.value = String(inputs.days);
  
  const seadays = $('#input-seadays');
  if (seadays) seadays.value = String(inputs.seaDays);
  
  const seaToggle = $('#sea-toggle');
  if (seaToggle) seaToggle.checked = !!inputs.seaApply;
  
  const adults = $('#input-adults');
  if (adults) adults.value = String(inputs.adults);
  
  const minors = $('#input-minors');
  if (minors) minors.value = String(inputs.minors);
  
  Object.entries(inputs.drinks).forEach(([k,v]) => {
    const el = document.querySelector(`[data-input="${k}"]`);
    if (el) {
      el.value = (typeof v==='object') ? `${v.min||0}-${v.max||0}` : String(v||0);
    }
  });
  
  const seaWeightOut = document.getElementById('sea-weight-val');
  if (seaWeightOut) seaWeightOut.textContent = `${inputs.seaWeight}%`;
}

/* ------------------------- Subscriptions ------------------------- */
store.subscribe('inputs', () => { reflectInputsToDOM(); });

store.subscribe(['dataset','economics'], () => {
  renderEconomics();
  renderPricePills();
});

store.subscribe('results', (r) => {
  ['soda','refresh','deluxe'].forEach(k => {
    const el = document.querySelector(`[data-card="${k}"]`);
    if (el) el.classList.toggle('winner', (r.winnerKey===k));
  });
  renderResults(r);
});

store.subscribe('ui', ui => {
  const b = $('#fallback-banner');
  if (b) b.hidden = !ui.fallbackBanner;
});

/* ------------------------- Expose API ------------------------- */
window.ITW = Object.assign(window.ITW || {}, {
  store,
  chart: null, // Set by ensureChart()
  money,
  getCurrency: () => currentCurrency
});

window.formatMoney = money;

/* ------------------------- Boot ------------------------- */
(async function boot(){
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded. Cannot boot calculator.');
    return;
  }
   ensureChart();
  window.ITW.chart = chart;
  loadPersisted();
  wireInputs();
  wireCurrencyUI();
  
  await loadFx();
  renderFxNote();
  await loadDataset();
  
  reflectInputsToDOM();
  renderPricePills();
  renderEconomics();
  
  const m = store.get().inputs.calcMode || 'simple';
  if (m === 'itinerary') {
    ensureItineraryArray();
    renderItineraryUI();
  }
  toggleModeUI(m);
  
  if (USE_WORKER) ensureWorker();
  scheduleCalc();
  // make calculator triggers available to the UI layer
window.scheduleCalc = scheduleCalc;
window.debouncedCalc = debouncedCalc;
  window.addEventListener('beforeunload', persistNow);
  
  const throttledURL = (() => {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(syncURL, 300);
    };
  })();
  
  store.subscribe(['inputs','economics'], throttledURL);
  
  window.addEventListener('online', async () => {
    await loadFx();
    window.renderAll();
  });
  
  window.addEventListener('offline', () => {
    renderFxNote(true);
  });
})();
