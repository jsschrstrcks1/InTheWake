/* drink-math.js — v3.014.0 (shared pure math) */

// ---------- helpers ----------
function scalarize(val, mode){
  if (typeof val === 'object' && val) {
    if (mode === 'min') return val.min || 0;
    if (mode === 'max') return val.max || 0;
    return ((val.min || 0) + (val.max || 0)) / 2;
  }
  return val || 0;
}
function applyWeight(list, days, seaDays, seaApply, seaWeight){
  if (!seaApply) return list;
  const w = (seaWeight || 20) / 100;
  const seaF = 1 + w, portF = 1 - w;
  return list.map(([id,qty]) => [id, ((qty*seaF*seaDays) + (qty*portF*(days-seaDays))) / days]);
}
function sum(arr){ return arr.reduce((a,b)=>a+b,0); }

// ---------- compute ----------
export function compute(inputs, economics, dataset){
  // dataset fallbacks (defensive)
  const prices = dataset?.prices ?? {};
  const sets   = dataset?.sets   ?? { refresh:[], soda:[], alcoholic:[] };
  const grat   = Number.isFinite(economics?.grat) ? economics.grat : 0.18;
  const cap    = Number.isFinite(economics?.deluxeCap) ? economics.deluxeCap : 14.0;
  const kid    = Number.isFinite(economics?.minorDiscount) ? economics.minorDiscount : 0.5;

  const keys = ["soda","coffee","teaprem","freshjuice","mocktail","energy","milkshake","bottledwater","beer","wine","cocktail","spirits"];
  const base = keys.map(k => [k, inputs?.drinks?.[k] || 0]);
  const hasRange = base.some(([,_v])=> typeof _v === 'object');

  const lists = ['min','mean','max'].map(mode => {
    const L = base.map(([k,v])=>[k, scalarize(v,mode)]);
    return applyWeight(L, inputs?.days||0, inputs?.seaDays||0, !!inputs?.seaApply, inputs?.seaWeight||20);
  });
  const [minL, meanL, maxL] = lists;

  const alc = (list)=> sum(list.map(([id,qty]) => qty*(prices[id]||0)*(1+grat)));
  const inc = (list, set) => sum(list
    .filter(([id])=> set.includes(id))
    .map(([id,qty])=> qty*(prices[id]||0)*(1+grat)));
  const del = (list) => {
    let included=0, overcap=0;
    list.forEach(([id,qty])=>{
      const unit = prices[id]||0;
      if (sets.alcoholic.includes(id)) {
        if (unit <= cap) included += qty*unit*(1+grat);
        else { included += qty*cap*(1+grat); overcap += qty*(unit-cap)*(1+grat); }
      } else if (sets.refresh.includes(id) || sets.soda.includes(id)) {
        included += qty*unit*(1+grat);
      }
    });
    return { included, overcap };
  };

  const alcMin  = alc(minL),  alcMean = alc(meanL),  alcMax  = alc(maxL);
  const incSMin = inc(minL, sets.soda),   incSMean = inc(meanL, sets.soda),   incSMax = inc(maxL, sets.soda);
  const incRMin = inc(minL, sets.refresh),incRMean = inc(meanL, sets.refresh),incRMax = inc(maxL, sets.refresh);
  const delMin  = del(minL),  delMean  = del(meanL),  delMax  = del(maxL);

  const soda    = { min:economics.pkg.soda,    mean:economics.pkg.soda,    max:economics.pkg.soda };
  const refresh = { min:economics.pkg.refresh, mean:economics.pkg.refresh, max:economics.pkg.refresh };
  const deluxe  = { min:economics.pkg.deluxe + delMin.overcap,
                    mean:economics.pkg.deluxe + delMean.overcap,
                    max:economics.pkg.deluxe + delMax.overcap };

  const netS = { min: soda.min    - incSMin,  mean: soda.mean    - incSMean,  max: soda.max    - incSMax };
  const netR = { min: refresh.min - incRMin,  mean: refresh.mean - incRMean,  max: refresh.max - incRMax };
  const netD = { min: deluxe.min  - delMin.included,  mean: deluxe.mean  - delMean.included,  max: deluxe.max  - delMax.included };

  const candidates = [
    {key:'alc',     val: alcMean},
    {key:'soda',    val: netS.mean},
    {key:'refresh', val: netR.mean},
    {key:'deluxe',  val: netD.mean}
  ];
  const winnerKey = candidates.reduce((a,c)=> c.val<a.val?c:a, {key:'alc',val:Infinity}).key;

  // policy & group
  const alcoholQty = sum(meanL.filter(([id])=>sets.alcoholic.includes(id)).map(([id,qty])=>qty));
  const deluxeRequired = (alcoholQty>0 && (inputs?.adults||0)>1);
  const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;
  const perDay = (adultStrategy==='alc') ? alcMean
              : (adultStrategy==='soda') ? netS.mean
              : (adultStrategy==='refresh') ? netR.mean
              : (adultStrategy==='deluxe') ? netD.mean
              : alcMean;

  const rows = [];
  let mult = 0;
  for (let i=1;i<=((inputs?.adults)||0);i++){
    rows.push({ who:`Adult ${i}`, pkg: adultStrategy, perDay, trip: perDay*(inputs?.days||0) });
    mult += 1;
  }
  for (let i=1;i<=((inputs?.minors)||0);i++){
    const k = (adultStrategy==='deluxe' || winnerKey==='deluxe') ? 'refresh' : winnerKey;
    const d = (k==='alc')? alcMean : (k==='soda'? netS.mean : (k==='refresh'? netR.mean : (k==='deluxe'? netD.mean : alcMean)));
    rows.push({ who:`Minor ${i}`, pkg: k==='alc'?'À-la-carte':'Refreshment (disc.)', perDay: d*kid, trip: d*(inputs?.days||0)*kid });
    mult += kid;
  }
  const trip = perDay * (inputs?.days||0) * mult;

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

// Attach to window/self for inline fallback (non-module environments)
try {
  // eslint-disable-next-line no-undef
  const g = (typeof window !== 'undefined') ? window : (typeof self !== 'undefined' ? self : {});
  g.ITW_MATH = Object.assign({}, g.ITW_MATH || {}, { compute });
} catch(_) {}
