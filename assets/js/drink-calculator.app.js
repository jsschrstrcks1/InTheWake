/* drink-calculator.app.js — v3.013.3 (Bug fix + code clean-up) */

/* ------------------------- Config ------------------------- */
const USE_WORKER = false;  // flip to false to run calc on main thread
const VERSION = '3.013.3'; // Bumped version
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
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => (n || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
function announce(msg){ const live = $('#a11y-status'); if (live) live.textContent = msg; }

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

  // shallow compare for slice keys
  function hasDiff(next, keys){
    return keys.some(k => JSON.stringify(state[k]) !== JSON.stringify(next[k]));
  }

  function set(patch){
    const next = { ...state, ...patch };
    const changedKeys = Object.keys(next).filter(k => JSON.stringify(next[k]) !== JSON.stringify(state[k]));
    if (!changedKeys.length) return;
    state = next;
    changedKeys.forEach(k => {
      const set = subs.get(k);
      if (set) set.forEach(cb => cb(state[k], state));
    });
    // wildcard subs
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
    list.forEach(k => {
      if (!subs.has(k)) subs.set(k, new Set());
      subs.get(k).add(cb);
    });
    // unsubscribe
    return () => list.forEach(k => subs.get(k)?.delete(cb));
  }

  return { get, set, patch, subscribe, hasDiff };
}

/* ------------------------- App State Shape ------------------------- */
const initialState = {
  version: VERSION,
  dataset: null,           // loaded or fallback
  // source-of-truth inputs
  inputs: {
    days: 7,
    seaDays: 3,
    seaApply: true,
    seaWeight: 20,         // 0–40
    adults: 1,
    minors: 0,
    drinks: {
      soda: 0, coffee: 0, teaprem: 0, freshjuice: 0, mocktail: 0, energy: 0,
      milkshake: 0, bottledwater: 0, beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  // editable economics
  economics: {
    pkg: { soda: 13.99, refresh: 34.0, deluxe: 85.0 },
    grat: 0.18,
    deluxeCap: 14.0,
    minorDiscount: 0.5
  },
  // derived results
  results: {
    hasRange: false,
    bars: { alc: {min:0,mean:0,max:0}, soda:{min:0,mean:0,max:0}, refresh:{min:0,mean:0,max:0}, deluxe:{min:0,mean:0,max:0} },
    winnerKey: 'alc',
    perDay: 0,
    trip: 0,
    groupRows: [], // [{who, pkg, perDay, trip}]
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

function loadPersisted(){
  // URL first
  const q = new URLSearchParams(location.search);
  const patch = structuredClone(store.get());

  // numeric-ish fields
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

  // drinks
  Object.keys(patch.inputs.drinks).forEach(k=>{
    if (q.has(k)) write(`inputs.drinks.${k}`, parseQty(q.get(k)), patch);
  });

  // localStorage fallback
  try{
    if (!q.toString()) {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        patch.inputs = saved.inputs ?? patch.inputs;
        patch.economics = saved.economics ?? patch.economics;
      }
    }
  }catch(_e){/* ignore */}

  store.set(patch);
}
function persistNow(){
  try {
    const { inputs, economics } = store.get();
    localStorage.setItem(LS_KEY, JSON.stringify({ inputs, economics }));
  } catch(_e) {/* ignore */}
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
function write(path, val, obj){
  let ref = obj;
  const hops = path.split('.');
  for (let i=0;i<hops.length-1;i++) ref = ref[hops[i]];
  ref[hops.at(-1)] = val;
}

/* ------------------------- Dataset loader ------------------------- */
async function loadDataset(){
  try{
    const r = await fetch(DS_URL, { cache:'default' });
    if (!r.ok) throw new Error('bad status');
    const j = await r.json();
    store.patch('dataset', j);
    // apply dataset economics if present
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

/* ------------------------- Pure math (shared with worker) ------------------------- */
function scalarize(val, mode){
  if (typeof val==='object') {
    if (mode==='min') return val.min||0;
    if (mode==='max') return val.max||0;
    return ((val.min||0)+(val.max||0))/2;
  }
  return val||0;
}
function applyWeight(list, days, seaDays, seaApply, seaWeight){
  if (!seaApply) return list;
  const w = (seaWeight||20)/100;
  const seaF = 1+w, portF = 1-w;
  return list.map(([id,qty]) => [id, ((qty*seaF*seaDays)+(qty*portF*(days-seaDays)))/days]);
}
function sum(arr){ return arr.reduce((a,b)=>a+b,0); }

function compute(inputs, economics, dataset){
  const prices = dataset?.prices ?? FALLBACK_DATASET.prices;
  const sets   = dataset?.sets   ?? FALLBACK_DATASET.sets;
  const grat   = economics.grat ?? 0.18;
  const cap    = economics.deluxeCap ?? 14.0;
  const kid    = economics.minorDiscount ?? 0.5;

  const keys = ["soda","coffee","teaprem","freshjuice","mocktail","energy","milkshake","bottledwater","beer","wine","cocktail","spirits"];
  const base = keys.map(k => [k, inputs.drinks[k]||0]);
  const hasRange = base.some(([,_v])=> typeof _v==='object');

  const lists = ['min','mean','max'].map(mode => {
    const L = base.map(([k,v])=>[k, scalarize(v,mode)]);
    return applyWeight(L, inputs.days, inputs.seaDays, inputs.seaApply, inputs.seaWeight);
  });
  const [minL, meanL, maxL] = lists;

  const alc = (list)=> sum(list.map(([id,qty]) => qty*(prices[id]||0)*(1+grat)));
  const inc = (list, set) => sum(list.filter(([id])=> set.includes(id)).map(([id,qty])=> qty*(prices[id]||0)*(1+grat)));
  const del = (list) => {
    let included=0, overcap=0;
    list.forEach(([id,qty])=>{
      const unit = prices[id]||0;
      if (sets.alcoholic.includes(id)) {
        if (unit<=cap) included += qty*unit*(1+grat);
        else { included += qty*cap*(1+grat); overcap += qty*(unit-cap)*(1+grat); }
      } else if (sets.refresh.includes(id) || sets.soda.includes(id)) {
        included += qty*unit*(1+grat);
      }
    });
    return { included, overcap };
  };

  const alcMin  = alc(minL),  alcMean = alc(meanL),  alcMax  = alc(maxL);
  const incSMin = inc(minL, sets.soda),  incSMean = inc(meanL, sets.soda),  incSMax = inc(maxL, sets.soda);
  const incRMin = inc(minL, sets.refresh),incRMean = inc(meanL, sets.refresh),incRMax = inc(maxL, sets.refresh);
  const delMin  = del(minL),  delMean  = del(meanL),  delMax  = del(maxL);

  const soda   = { min:economics.pkg.soda,   mean:economics.pkg.soda,   max:economics.pkg.soda };
  const refresh= { min:economics.pkg.refresh,mean:economics.pkg.refresh,max:economics.pkg.refresh };
  const deluxe = { min:economics.pkg.deluxe + delMin.overcap, mean:economics.pkg.deluxe + delMean.overcap, max:economics.pkg.deluxe + delMax.overcap };

  const netS = { min: soda.min - incSMin, mean: soda.mean - incSMean, max: soda.max - incSMax };
  const netR = { min: refresh.min - incRMin, mean: refresh.mean - incRMean, max: refresh.max - incRMax };
  const netD = { min: deluxe.min - delMin.included, mean: deluxe.mean - delMean.included, max: deluxe.max - delMax.included };

  const candidates = [{key:'alc',val:alcMean},{key:'soda',val:netS.mean},{key:'refresh',val:netR.mean},{key:'deluxe',val:netD.mean}];
  const winnerKey = candidates.reduce((a,c)=> c.val<a.val?c:a, {key:'alc',val:Infinity}).key;

  // policy & group
  const alcoholQty = sum(meanL.filter(([id])=>sets.alcoholic.includes(id)).map(([id,qty])=>qty));
  const deluxeRequired = (alcoholQty>0 && inputs.adults>1);
  const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;
  const perDay = (adultStrategy==='alc')? alcMean : (adultStrategy==='soda'? netS.mean : (adultStrategy==='refresh'? netR.mean : (adultStrategy==='deluxe'? netD.mean : alcMean)));

  const rows = [];
  let mult = 0;
  for (let i=1;i<=inputs.adults;i++){
    rows.push({ who:`Adult ${i}`, pkg: adultStrategy, perDay, trip: perDay*inputs.days });
    mult += 1;
  }
  for (let i=1;i<=inputs.minors;i++){
    const k = (adultStrategy==='deluxe' || winnerKey==='deluxe') ? 'refresh' : winnerKey;
    const d = (k==='alc')? alcMean : (k==='soda'? netS.mean : (k==='refresh'? netR.mean : (k==='deluxe'? netD.mean : alcMean)));
    rows.push({ who:`Minor ${i}`, pkg: k==='alc'?'À-la-carte':'Refreshment (disc.)', perDay: d*kid, trip: d*inputs.days*kid });
  	mult += kid;
  }
  const trip = perDay * inputs.days * mult;

  return {
    hasRange,
    bars: { alc:{min:alcMin,mean:alcMean,max:alcMax}, soda:netS, refresh:netR, deluxe:netD },
    winnerKey,
    perDay,
    trip,
    groupRows: rows,
    included: { soda: incSMean, refresh: incRMean, deluxe: delMean.included },
    overcap: delMean.overcap,
    deluxeRequired
  };
}

/* ------------------------- Optional worker ------------------------- */
function createCalcWorker(){
  const code = `
    onmessage = (e) => {
      const { inputs, economics, dataset } = e.data;
      function sum(a){return a.reduce((x,y)=>x+y,0)}
      function scalarize(v,m){ if(typeof v==='object'){ if(m==='min')return v.min||0; if(m==='max')return v.max||0; return ((v.min||0)+(v.max||0))/2 } return v||0 }
      function applyWeight(L, days, seaDays, seaApply, seaWeight){
        if(!seaApply) return L;
        const w=(seaWeight||20)/100, seaF=1+w, portF=1-w;
        return L.map(([id,q])=>[id, ((q*seaF*seaDays)+(q*portF*(days-seaDays)))/days ]);
      }
      const prices = dataset?.prices ?? {};
      const sets   = dataset?.sets   ?? { refresh:[], soda:[], alcoholic:[] };
      const grat   = economics.grat ?? 0.18;
      const cap    = economics.deluxeCap ?? 14.0;
      const kid    = economics.minorDiscount ?? 0.5;
      const keys = ["soda","coffee","teaprem","freshjuice","mocktail","energy","milkshake","bottledwater","beer","wine","cocktail","spirits"];
      const base = keys.map(k => [k, inputs.drinks[k]||0]);
      const hasRange = base.some(([,_v])=> typeof _v==='object');
      const lists = ['min','mean','max'].map(mode=>applyWeight(base.map(([k,v])=>[k,scalarize(v,mode)]), inputs.days, inputs.seaDays, inputs.seaApply, inputs.seaWeight));
	  const [minL, meanL, maxL] = lists;
      const alc = L => sum(L.map(([id,q])=> q*(prices[id]||0)*(1+grat)));
      const inc = (L, set) => sum(L.filter(([id])=>set.includes(id)).map(([id,q])=> q*(prices[id]||0)*(1+grat)));
      const del = L => {
        let included=0, overcap=0;
        L.forEach(([id,q])=>{
  	      const u=prices[id]||0;
          if(sets.alcoholic.includes(id)){
            if(u<=cap) included+=q*u*(1+grat);
            else { included+=q*cap*(1+grat); overcap+=q*(u-cap)*(1+grat); }
          } else if (sets.refresh.includes(id) || sets.soda.includes(id)) {
            included+=q*u*(1+grat);
          }
        });
        return {included, overcap};
      };
      const alcMin=alc(minL), alcMean=alc(meanL), alcMax=alc(maxL);
      const incSMin=inc(minL, sets.soda), incSMean=inc(meanL, sets.soda), incSMax=inc(maxL, sets.soda);
      const incRMin=inc(minL, sets.refresh), incRMean=inc(meanL, sets.refresh), incRMax=inc(maxL, sets.refresh);
      const delMin=del(minL), delMean=del(meanL), delMax=del(maxL);
      const soda={min:economics.pkg.soda,mean:economics.pkg.soda,max:economics.pkg.soda};
      const refresh={min:economics.pkg.refresh,mean:economics.pkg.refresh,max:economics.pkg.refresh};
      const deluxe={min:economics.pkg.deluxe+delMin.overcap,mean:economics.pkg.deluxe+delMean.overcap,max:economics.pkg.deluxe+delMax.overcap};
      const netS={min:soda.min-incSMin,mean:soda.mean-incSMean,max:soda.max-incSMax};
      const netR={min:refresh.min-incRMin,mean:refresh.mean-incRMean,max:refresh.max-incRMax};
test      const netD={min:deluxe.min-delMin.included,mean:deluxe.mean-delMean.included,max:deluxe.max-delMax.included};
      const c=[{k:'alc',v:alcMean},{k:'soda',v:netS.mean},{k:'refresh',v:netR.mean},{k:'deluxe',v:netD.mean}];
      const winnerKey=c.reduce((a,b)=> b.v<a.v?b:a, {k:'alc',v:Infinity}).k;
      const alcoholQty = sum(meanL.filter(([id])=>sets.alcoholic.includes(id)).map(([id,q])=>q));
      const deluxeRequired = (alcoholQty>0 && inputs.adults>1);
      const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;
      const perDay = (adultStrategy==='alc')? alcMean : (adultStrategy==='soda'? netS.mean : (adultStrategy==='refresh'? netR.mean : (adultStrategy==='deluxe'? netD.mean : alcMean)));
in    const rows=[], days=inputs.days; let mult=0;
      for(let i=1;i<=inputs.adults;i++){ rows.push({who:'Adult '+i, pkg:adultStrategy, perDay, trip:perDay*days}); mult+=1; }
      for(let i=1;i<=inputs.minors;i++){
        const k=(adultStrategy==='deluxe'||winnerKey==='deluxe')?'refresh':winnerKey;
        const d=(k==='alc')? alcMean : (k==='soda'? netS.mean : (k==='refresh'? netR.mean : (k==='deluxe'? netD.mean : alcMean)));
        rows.push({who:'Minor '+i, pkg: k==='alc'?'À-la-carte':'Refreshment (disc.)', perDay:d*kid, trip:d*days*kid}); mult+=kid;
      }
      const trip = perDay * days * mult;
      postMessage({
        hasRange, bars:{alc:{min:alcMin,mean:alcMean,max:alcMax},soda:netS,refresh:netR,deluxe:netD},
m        winnerKey, perDay, trip, groupRows:rows, included:{soda:incSMean,refresh:incRMean,deluxe:delMean.included}, overcap:delMean.overcap, deluxeRequired
      });
    };
  `;
  return new Worker(URL.createObjectURL(new Blob([code], { type:'text/javascript' })));
}
let calcWorker = null;

/* ------------------------- Renderer ------------------------- */
let chart = null;

function ensureChart(){
  if (chart) return chart;
  const el = $('#breakeven-chart');
  if (!el) return null;
  chart = new Chart(el.getContext('2d'), {
    type:'bar',
    data:{
      labels:['À-la-carte','Soda','Refreshment','Deluxe'],
      datasets:[
        { label:'Daily cost', data:[0,0,0,0], backgroundColor:'#60a5fa' } // Added color
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>'$'+v } } },
Next      plugins:{ legend:{ position:'bottom' } }
    }
  });
  store.patch('ui.chartReady', true); // Signal chart is ready
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
CSS        `<tr><td>${row.who}</td><td>${row.pkg==='alc'?'À-la-carte':row.pkg}</td><td>${money(row.perDay)}</td><td>${money(row.trip)}</td></tr>`);
    });
  }
  if (sec) sec.hidden = r.groupRows.length<=1; // show when more than 1 person effective

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
Example  const c = ensureChart();
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

/* ------------------------- Controller ------------------------- */
const debounced = (fn, ms=250)=>{let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),ms);}};

function scheduleCalc(){
  const { inputs, economics, dataset } = store.get();
  if (!USE_WORKER){
    const results = compute(inputs, economics, dataset||FALLBACK_DATASET);
    store.patch('results', results);
    return;
 }
CSS  if (!calcWorker) calcWorker = createCalcWorker();
  calcWorker.onmessage = (e)=> store.patch('results', e.data);
  calcWorker.postMessage({ inputs, economics, dataset: (dataset||FALLBACK_DATASET) });
}

const debouncedCalc = debounced(scheduleCalc, 120);

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
  s  };
    inp.addEventListener('input', e => { writeInput(e.target.type==='checkbox' ? e.target.checked : e.target.value); debouncedCalc(); });
    inp.addEventListener('change', e => { writeInput(e.target.type==='checkbox' ? e.target.checked : e.target.value); scheduleCalc(); syncURL(); persistNow(); });
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
A    if (v>0){
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
  I  if (v>=0){
      const eco = store.get().economics; eco.deluxeCap = v; store.patch('economics', eco);
      window.toggleCapEdit(true); announce(`Updated deluxe cap to $${v.toFixed(2)}`); scheduleCalc(); persistNow();
    }
  };

  // reset
  window.resetInputs = ()=>{
  	store.patch('inputs', structuredClone(initialState.inputs));
  	store.patch('economics', structuredClone({ ...initialState.economics,
img    pkg: { ...initialState.economics.pkg, ...((store.get().dataset||FALLBACK_DATASET).packages) }
    }));
    scheduleCalc(); syncURL(); persistNow(); announce('All inputs reset');
    // reflectInputsToDOM() is now handled by the 'inputs' subscription
  };

  // Replaced PDF export with browser print (Tier 2)
  window.printResults = ()=>{
  	window.print();
  };

  // Stepper button +/- controller (Tier 2)
  // This function directly modifies the store, which then triggers
  // the 'inputs' subscription to update the DOM.
s  window.stepInput = (key, amount) => {
    const state = store.get();
    const currentDrinkVal = state.inputs.drinks[key];
    
    // Use scalarize (mean) if it's a range, or just parseNum if it's a number/string
  	let currentVal;
  	if (typeof currentDrinkVal === 'object') {
      currentVal = scalarize(currentDrinkVal, 'mean');
    } else {
      currentVal = parseNum(String(currentDrinkVal)); // force to string for parseNum
    }

  	let newVal = currentVal + amount;
  	if (newVal < 0) newVal = 0;

    // Handle half-steps
  	let finalValStr = (amount === 0.5 || amount === -0.5 || (currentVal.toString().includes('.')))
      ? newVal.toFixed(1)
      : newVal.toFixed(0);

    // 1. Patch the store (will trigger DOM reflect via new subscription)
css  	store.patch(`inputs.drinks.${key}`, parseNum(finalValStr));
    
    // 2. Manually trigger calc and persist
    // We use the full scheduleCalc, not the debounced one, for a snappy feel
  	scheduleCalc(); 
  	syncURL();
  	persistNow();
  };

  // presets
  window.loadPreset = (name)=>{
  	const set = {
      light:   { beer:'1', wine:'1', soda:'1' },
      moderate:{ beer:'2', wine:'1', cocktail:'2', coffee:'1' },
      heavy:   { beer:'3', cocktail:'3', spirits:'2', bottledwater:'2' },
CSS      coffee:  { coffee:'4', soda:'0', beer:'0', wine:'0', cocktail:'0', spirits:'0' }
  	}[name] || {};
  	const next = structuredClone(store.get().inputs);
  	// Clear all drinks first
  	Object.keys(next.drinks).forEach(k => next.drinks[k] = 0);
  	// Apply preset
  	Object.entries(set).forEach(([k,v])=> next.drinks[k] = parseQty(v));
    
  	store.patch('inputs', next);
  	scheduleCalc(); persistNow(); announce('Preset loaded: '+name);
  File  // reflectInputsToDOM() is now handled by the 'inputs' subscription
  };

  // jump to winner
  const jump = $('#jump-winner');
  if (jump) jump.addEventListener('click', ()=>{
  	const el = document.querySelector('.pkg.winner') || document.querySelector('.packages');
  	el?.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // Esc closes tooltips
  document.addEventListener('keydown', e=>{
  	if (e.key==='Escape'){ $$('.tooltip [role="tooltip"]').forEach(tt=>tt.style.display='none'); }
  });
}

/**
 * [FIXED] This function now uses .value instead of setAttribute
 * to correctly update live form field values.
 */
function reflectInputsToDOM(){
  const { inputs } = store.get();
  
  const days = $('#input-days'); if (days) days.value = String(inputs.days);
css  const seadays = $('#input-seadays'); if (seadays) seadays.value = String(inputs.seaDays);
  
  $('#sea-toggle') && ($('#sea-toggle').checked = !!inputs.seaApply);
  
  const adults = $('#input-adults'); if (adults) adults.value = String(inputs.adults);
  const minors = $('#input-minors'); if (minors) minors.value = String(inputs.minors);
  
  Object.entries(inputs.drinks).forEach(([k,v])=>{
  	const el = document.querySelector(`[data-input="${k}"]`);
  	if (el) el.value = (typeof v==='object') ? `${v.min||0}-${v.max||0}` : String(v||0);
  });
}

/* ------------------------- Subscriptions ------------------------- */

// [NEW] Reflect input state back to DOM (T3 enhancement)
// This ensures that state changes (from presets, steppers) update the inputs.
store.subscribe('inputs', (inputs) => {
indented  reflectInputsToDOM();
});

// render dataset economics and price pills when dataset/economics change
store.subscribe(['dataset','economics'], ()=>{
  renderEconomics();
  renderPricePills();
});

// render results slice
store.subscribe('results', (r)=>{
  // toggle winner class on cards
  ['soda','refresh','deluxe'].forEach(k => {
alot    const el = document.querySelector(`[data-card="${k}"]`);
  	if (el) el.classList.toggle('winner', (r.winnerKey===k));
  });
  renderResults(r);
});

// show fallback banner
store.subscribe('ui', ui=>{
  const b = $('#fallback-banner'); if (b) b.hidden = !ui.fallbackBanner;
});

/* ------------------------- Boot ------------------------- */
(async function boot(){
  // Ensure chart.js is loaded
  if (typeof Chart === 'undefined') {
  	console.error('Chart.js is not loaded. Cannot boot calculator.');
  	return;
  }
  
  // Create chart instance *before* loading data
  ensureChart();

  // load persisted state
  loadPersisted();

  // wire DOM -> state
s  wireInputs();

  // dataset
  await loadDataset();

  // initial reflect + calc
  reflectInputsToDOM();
  renderPricePills();
  renderEconomics();
  scheduleCalc();

  // persist on navigation-ish events
  window.addEventListener('beforeunload', persistNow);
  // sync URL after silent changes (throttle a bit)
  const throttledURL = (fn => { let t; return ()=>{ clearTimeout(t); t=setTimeout(fn, 300);} })(syncURL);
  store.subscribe(['inputs','economics'], throttledURL);
})();
