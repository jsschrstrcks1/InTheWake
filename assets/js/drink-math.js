/* drink-math.js — v3.014.0 (shared pure math, hardened) */

/* ------------------------- tiny utils ------------------------- */
const toNum = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g,''));
  return Number.isFinite(n) ? n : 0;
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, toNum(n)));
const safe = (n) => Number.isFinite(n) ? n : 0;
const sum = (arr) => arr.reduce((a,b)=> a + b, 0);
const round2 = (n) => Math.round(n * 100) / 100; // optional light rounding to tame float noise

/* If val is a {min,max} range, extract min/mean/max; else coerce to number */
function scalarize(val, mode){
  if (val && typeof val === 'object') {
    const mn = toNum(val.min);
    const mx = toNum(val.max);
    const lo = Math.max(0, Math.min(mn, mx));
    const hi = Math.max(lo, Math.max(mn, mx));
    if (mode === 'min') return lo;
    if (mode === 'max') return hi;
    return (lo + hi) / 2;
  }
  return Math.max(0, toNum(val));
}

/* Apply sea/port weighting; guard against days <= 0 */
function applyWeight(list, days, seaDays, seaApply, seaWeight){
  if (!seaApply) return list;
  const D = toNum(days);
  const S = clamp(seaDays, 0, D);
  if (!Number.isFinite(D) || D <= 0) return list;

  const w = clamp(seaWeight, 0, 40) / 100; // 0–0.4
  const seaF = 1 + w, portF = 1 - w;
  const portDays = Math.max(0, D - S);

  return list.map(([id,qty]) => {
    const q = toNum(qty);
    const weighted = ((q * seaF * S) + (q * portF * portDays)) / D;
    return [id, safe(weighted)];
  });
}

/* Helpers that ensure gratuity is applied consistently and results are finite */
function alcTotal(list, prices, grat){
  return safe(sum(list.map(([id,qty]) => {
    const unit = toNum(prices[id]);
    const q = toNum(qty);
    return (q * unit) * (1 + grat);
  })));
}
function includedForSet(list, set, prices, grat){
  return safe(sum(list
    .filter(([id]) => set.includes(id))
    .map(([id,qty]) => (toNum(qty) * toNum(prices[id])) * (1 + grat))));
}
function deluxeBreakdown(list, sets, prices, grat, cap){
  let included = 0, overcap = 0;
  for (const [id,qtyRaw] of list){
    const q = toNum(qtyRaw);
    if (q <= 0) continue;
    const unit = toNum(prices[id]);

    if (sets.alcoholic.includes(id)) {
      if (unit <= cap) {
        included += (q * unit) * (1 + grat);
      } else {
        included += (q * cap) * (1 + grat);
        overcap  += (q * (unit - cap)) * (1 + grat);
      }
    } else if (sets.refresh.includes(id) || sets.soda.includes(id)) {
      included += (q * unit) * (1 + grat);
    }
  }
  return { included: safe(included), overcap: safe(overcap) };
}

/* ------------------------- compute ------------------------- */
export function compute(inputs, economics, dataset){
  // ---- Defensive defaults / clamps ----
  const keys = ["soda","coffee","teaprem","freshjuice","mocktail","energy","milkshake","bottledwater","beer","wine","cocktail","spirits"];

  const dsPrices = (dataset && dataset.prices) || {};
  const dsSets   = (dataset && dataset.sets)   || { refresh:[], soda:[], alcoholic:[] };

  const grat  = clamp(economics?.grat, 0, 0.5) || 0.18;
  const cap   = clamp(economics?.deluxeCap, 0, 200) || 14.0;
  const kid   = clamp(economics?.minorDiscount, 0, 1) || 0.5;

  const pkg = {
    soda:    clamp(economics?.pkg?.soda,    0, 200) || 13.99,
    refresh: clamp(economics?.pkg?.refresh, 0, 300) || 34.00,
    deluxe:  clamp(economics?.pkg?.deluxe,  0, 400) || 85.00
  };

  const days    = clamp(inputs?.days,    1, 365) || 1;  // 🔒 never 0
  const seaDays = clamp(inputs?.seaDays, 0, days);
  const seaApply  = !!(inputs?.seaApply ?? true);
  const seaWeight = clamp(inputs?.seaWeight, 0, 40);

  const adults = clamp(inputs?.adults, 1, 20) || 1;
  const minors = clamp(inputs?.minors, 0, 20) || 0;

  // Drinks (coerce weird ranges)
  const drinks = {};
  for (const k of keys){
    const v = inputs?.drinks?.[k];
    drinks[k] = (v && typeof v === 'object')
      ? { min: Math.max(0, toNum(v.min)), max: Math.max(0, toNum(v.max)) }
      : Math.max(0, toNum(v));
  }

  // ---- Build min/mean/max lists, then apply weighting safely ----
  const base = keys.map(k => [k, drinks[k]]);
  const hasRange = base.some(([,v]) => v && typeof v === 'object');

  const lists = ['min','mean','max'].map(mode => {
    const L = base.map(([k,v]) => [k, scalarize(v, mode)]);
    return applyWeight(L, days, seaDays, seaApply, seaWeight);
  });
  const [minL, meanL, maxL] = lists;

  // ---- A la carte + inclusions ----
  const alcMin  = round2(alcTotal(minL,  dsPrices, grat));
  const alcMean = round2(alcTotal(meanL, dsPrices, grat));
  const alcMax  = round2(alcTotal(maxL,  dsPrices, grat));

  const incSMin  = round2(includedForSet(minL,  dsSets.soda,     dsPrices, grat));
  const incSMean = round2(includedForSet(meanL, dsSets.soda,     dsPrices, grat));
  const incSMax  = round2(includedForSet(maxL,  dsSets.soda,     dsPrices, grat));

  const incRMin  = round2(includedForSet(minL,  dsSets.refresh,  dsPrices, grat));
  const incRMean = round2(includedForSet(meanL, dsSets.refresh,  dsPrices, grat));
  const incRMax  = round2(includedForSet(maxL,  dsSets.refresh,  dsPrices, grat));

  const delMin   = deluxeBreakdown(minL,  dsSets, dsPrices, grat, cap);
  const delMean  = deluxeBreakdown(meanL, dsSets, dsPrices, grat, cap);
  const delMax   = deluxeBreakdown(maxL,  dsSets, dsPrices, grat, cap);

  // ---- Effective daily costs to compare (package price – included value + any overcap) ----
  const soda =    { min: pkg.soda,    mean: pkg.soda,    max: pkg.soda };
  const refresh = { min: pkg.refresh, mean: pkg.refresh, max: pkg.refresh };
  const deluxe  = {
    min:  round2(pkg.deluxe + delMin.overcap),
    mean: round2(pkg.deluxe + delMean.overcap),
    max:  round2(pkg.deluxe + delMax.overcap)
  };

  const netS = { min: round2(soda.min    - incSMin),  mean: round2(soda.mean    - incSMean),  max: round2(soda.max    - incSMax) };
  const netR = { min: round2(refresh.min - incRMin),  mean: round2(refresh.mean - incRMean),  max: round2(refresh.max - incRMax) };
  const netD = { min: round2(deluxe.min  - delMin.included),  mean: round2(deluxe.mean  - delMean.included),  max: round2(deluxe.max  - delMax.included) };

  // Note: net values can be negative (meaning the package beats à la carte by that amount).
  // That's desirable for winner selection; the chart can visualize negatives if needed.

  const candidates = [
    { key:'alc',     val: alcMean },
    { key:'soda',    val: netS.mean },
    { key:'refresh', val: netR.mean },
    { key:'deluxe',  val: netD.mean }
  ];
  const winnerKey = candidates.reduce((best, c) => (c.val < best.val ? c : best), { key:'alc', val: Infinity }).key;

  // ---- Policy & group logic ----
  const alcoholQty = safe(sum(meanL.filter(([id]) => dsSets.alcoholic.includes(id)).map(([,q]) => toNum(q))));
  const deluxeRequired = (alcoholQty > 0 && adults > 1);

  const perDay =
      winnerKey === 'soda'    ? netS.mean
    : winnerKey === 'refresh' ? netR.mean
    : winnerKey === 'deluxe'  ? netD.mean
    : /* alc */                 alcMean;

  const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;

  const rows = [];
  let multiplier = 0;
  for (let i = 1; i <= adults; i++){
    rows.push({ who:`Adult ${i}`, pkg: adultStrategy, perDay, trip: round2(perDay * days) });
    multiplier += 1;
  }
  for (let i = 1; i <= minors; i++){
    const k = (adultStrategy === 'deluxe' || winnerKey === 'deluxe') ? 'refresh' : winnerKey;
    const d = (k==='alc') ? alcMean : (k==='soda' ? netS.mean : (k==='refresh' ? netR.mean : netD.mean));
    rows.push({ who:`Minor ${i}`, pkg: k==='alc'?'À-la-carte':'Refreshment (disc.)', perDay: round2(d * kid), trip: round2(d * days * kid) });
    multiplier += kid;
  }

  const trip = round2(perDay * days * multiplier);

  // ---- Always return finite numbers ----
  const finBars = {
    alc:     { min: safe(alcMin),    mean: safe(alcMean),    max: safe(alcMax) },
    soda:    { min: safe(netS.min),  mean: safe(netS.mean),  max: safe(netS.max) },
    refresh: { min: safe(netR.min),  mean: safe(netR.mean),  max: safe(netR.max) },
    deluxe:  { min: safe(netD.min),  mean: safe(netD.mean),  max: safe(netD.max) }
  };

  return {
    hasRange,
    bars: finBars,
    winnerKey,
    perDay: safe(round2(perDay)),
    trip: safe(trip),
    groupRows: rows.map(r => ({
      who: r.who,
      pkg: r.pkg,
      perDay: safe(round2(r.perDay)),
      trip: safe(round2(r.trip))
    })),
    included: {
      soda:    safe(round2(incSMean)),
      refresh: safe(round2(incRMean)),
      deluxe:  safe(round2(delMean.included))
    },
    overcap: safe(round2(delMean.overcap)),
    deluxeRequired
  };
}

/* Attach to window/self for inline fallback (non-module envs) */
try {
  // eslint-disable-next-line no-undef
  const g = (typeof window !== 'undefined') ? window : (typeof self !== 'undefined' ? self : {});
  g.ITW_MATH = Object.assign({}, g.ITW_MATH || {}, { compute });
} catch(_) {}
