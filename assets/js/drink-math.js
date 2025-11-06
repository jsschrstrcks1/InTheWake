/* drink-math.js — v.9.001.000 (pure math + voucher companion)
   - Preserves v.9.000.004 behavior (ranges, weighting, itinerary, gratuity, caps, minors)
   - Adds computeWithVouchers(inputs, economics, dataset, vouchers)
     • Vouchers reduce ALC (à-la-carte) only.
     • Adult vouchers: apply to alcoholic first, overflow to non-alc.
     • Minor vouchers: non-alc only.
     • All values assumed to include gratuity (consistent with cost model).
*/

/* ------------------------- tiny utils ------------------------- */
const toNum = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, toNum(n)));
const safe = (n) => (Number.isFinite(n) ? n : 0);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const round2 = (n) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

/* If val is a {min,max} range, extract min/mean/max; else coerce to number */
function scalarize(val, mode) {
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
function applyWeight(list, days, seaDays, seaApply, seaWeight) {
  if (!seaApply) return list;
  const D = clamp(days, 0, 365);
  const S = clamp(seaDays, 0, D);
  if (D <= 0) return list;

  const w = clamp(seaWeight, 0, 40) / 100; // 0–0.4
  const seaF = 1 + w, portF = 1 - w;
  const portDays = Math.max(0, D - S);

  return list.map(([id, qty]) => {
    const q = toNum(qty);
    const weighted = ((q * seaF * S) + (q * portF * portDays)) / D;
    return [id, safe(weighted)];
  });
}

/* ------------------------- dataset adapter ------------------------- */
function adaptDataset(dataset) {
  // Prices
  let prices = dataset?.prices;
  if (!prices && Array.isArray(dataset?.items)) {
    prices = {};
    for (const it of dataset.items) {
      if (!it || !it.id) continue;
      prices[it.id] = toNum(it.price);
    }
  }
  prices = prices || {};

  // Sets: support new 'alcohol' or legacy 'alcoholic'
  const sets = Object.assign(
    { soda: [], refresh: [], alcoholic: [], alcohol: [] },
    dataset?.sets || {}
  );
  const alcoholSet = Array.isArray(sets.alcohol) ? sets.alcohol : (sets.alcoholic || []);

  // Rules
  const grat = Number.isFinite(dataset?.rules?.gratuity) ? dataset.rules.gratuity : undefined;
  const epsilon = Number.isFinite(dataset?.rules?.epsilon) ? dataset.rules.epsilon : 0;
  const capFromRules = Number.isFinite(dataset?.rules?.caps?.deluxeAlcohol)
    ? dataset.rules.caps.deluxeAlcohol
    : undefined;

  // Packages (object form)
  let pkgFromDataset = null;
  if (dataset?.packages && typeof dataset.packages === 'object') {
    const p = dataset.packages;
    const pick = (obj) => obj && (toNum(obj.priceMid) || toNum(obj.price) || 0);
    pkgFromDataset = {
      soda: pick(p.soda),
      refresh: pick(p.refreshment || p.refresh),
      deluxe: pick(p.deluxe)
    };
  }

  return {
    prices,
    sets: { soda: sets.soda || [], refresh: sets.refresh || [], alcoholic: alcoholSet },
    grat,
    capFromRules,
    epsilon,
    pkgFromDataset
  };
}

/* ------------------------- component helpers ------------------------- */
function totalFor(list, prices, grat) {
  return safe(sum(list.map(([id, qty]) => (toNum(qty) * toNum(prices[id])) * (1 + grat))));
}
function incForSet(list, set, prices, grat) {
  return safe(sum(list.filter(([id]) => set.includes(id))
    .map(([id, qty]) => (toNum(qty) * toNum(prices[id])) * (1 + grat))));
}
function deluxeBreakdown(list, sets, prices, grat, cap) {
  let included = 0, overcap = 0;
  for (const [id, qtyRaw] of list) {
    const q = toNum(qtyRaw);
    if (q <= 0) continue;
    const unit = toNum(prices[id]);

    if (sets.alcoholic.includes(id)) {
      if (unit <= cap) {
        included += (q * unit) * (1 + grat);
      } else {
        included += (q * cap) * (1 + grat);
        overcap += (q * (unit - cap)) * (1 + grat);
      }
    } else {
      // Non-alc (refresh+soda) fully included on Deluxe
      included += (q * unit) * (1 + grat);
    }
  }
  return { included: safe(included), overcap: safe(overcap) };
}

/* ------------------------- compute (base) ------------------------- */
export function compute(inputs, economics, dataset) {
  const { prices: dsPrices, sets: dsSets, grat: dsGrat, capFromRules, epsilon } =
    adaptDataset(dataset || {});
  const keys = [
    "soda", "coffee", "teaprem", "freshjuice", "mocktail",
    "energy", "milkshake", "bottledwater", "beer", "wine",
    "cocktail", "spirits"
  ];

  // Economics
  const grat = clamp(economics?.grat ?? dsGrat ?? 0.18, 0, 0.5);
  const cap = clamp(economics?.deluxeCap ?? capFromRules ?? 14.0, 0, 200);
  const kid = clamp(economics?.minorDiscount ?? 1.0, 0, 1);

  // Package prices
  const pkgEco = economics?.pkg || {};
  const pkg = {
    soda: toNum(pkgEco.soda) ||
      toNum(dataset?.packages?.soda?.priceMid || dataset?.packages?.soda?.price) || 0,
    refresh: toNum(pkgEco.refresh) ||
      toNum((dataset?.packages?.refreshment || dataset?.packages?.refresh)?.priceMid ||
             (dataset?.packages?.refreshment || dataset?.packages?.refresh)?.price) || 0,
    deluxe: toNum(pkgEco.deluxe) ||
      toNum(dataset?.packages?.deluxe?.priceMid || dataset?.packages?.deluxe?.price) || 0
  };

  // Clamp inputs
  const days = clamp(inputs?.days, 1, 365) || 1;
  const seaDays = clamp(inputs?.seaDays, 0, days);
  const seaApply = !!(inputs?.seaApply ?? true);
  const seaWeight = clamp(inputs?.seaWeight, 0, 40);
  const adults = clamp(inputs?.adults, 1, 20) || 1;
  const minors = clamp(inputs?.minors, 0, 20) || 0;

  // Drinks (normalize)
  const drinks = {};
  for (const k of keys) {
    const v = inputs?.drinks?.[k];
    drinks[k] = (v && typeof v === 'object')
      ? { min: Math.max(0, toNum(v.min)), max: Math.max(0, toNum(v.max)) }
      : Math.max(0, toNum(v));
  }

  // --- Build per-day base list (supports itinerary mode) ---
  let base;
  let hasRange;

  const isItinerary = (inputs?.calcMode === 'itinerary') &&
                      Array.isArray(inputs?.itinerary) &&
                      inputs.itinerary.length > 0;

  if (isItinerary) {
    // Sum each day's quantities, then average back to per-day
    const totals = Object.fromEntries(keys.map(k => [k, 0]));
    for (const day of inputs.itinerary) {
      for (const k of keys) totals[k] += toNum(day?.drinks?.[k]);
    }
    const denom = Math.max(1, (inputs?.itinerary?.length || 0));
    base = keys.map(k => [k, totals[k] / denom]);
    hasRange = false; // day-by-day entries are scalar
  } else {
    base = keys.map(k => [k, drinks[k]]);
    hasRange = base.some(([, v]) => v && typeof v === 'object');
  }

  // Build min/mean/max lists and apply weighting unless itinerary
  const lists = ['min', 'mean', 'max'].map(mode => {
    const L = base.map(([k, v]) => [k, scalarize(v, mode)]);
    return isItinerary ? L : applyWeight(L, days, seaDays, seaApply, seaWeight);
  });
  const [minL, meanL, maxL] = lists;

  // --- Totals (à-la-carte and included values) ---
  const alcMin  = round2(totalFor(minL,  dsPrices, grat));
  const alcMean = round2(totalFor(meanL, dsPrices, grat));
  const alcMax  = round2(totalFor(maxL,  dsPrices, grat));

  const incSMin  = round2(incForSet(minL,  dsSets.soda,    dsPrices, grat));
  const incSMean = round2(incForSet(meanL, dsSets.soda,    dsPrices, grat));
  const incSMax  = round2(incForSet(maxL,  dsSets.soda,    dsPrices, grat));

  const incRMin  = round2(incForSet(minL,  dsSets.refresh, dsPrices, grat));
  const incRMean = round2(incForSet(meanL, dsSets.refresh, dsPrices, grat));
  const incRMax  = round2(incForSet(maxL,  dsSets.refresh, dsPrices, grat));

  const delMin  = deluxeBreakdown(minL,  dsSets, dsPrices, grat, cap);
  const delMean = deluxeBreakdown(meanL, dsSets, dsPrices, grat, cap);
  const delMax  = deluxeBreakdown(maxL,  dsSets, dsPrices, grat, cap);

  // ------- Effective daily total costs (what you actually pay per day) -------
  const costSoda = {
    min: round2((pkg.soda || 0)    + Math.max(0, alcMin  - incSMin)),
    mean: round2((pkg.soda || 0)   + Math.max(0, alcMean - incSMean)),
    max: round2((pkg.soda || 0)    + Math.max(0, alcMax  - incSMax))
  };
  const costRefresh = {
    min: round2((pkg.refresh || 0) + Math.max(0, alcMin  - incRMin)),
    mean: round2((pkg.refresh || 0)+ Math.max(0, alcMean - incRMean)),
    max: round2((pkg.refresh || 0) + Math.max(0, alcMax  - incRMax))
  };
  const costDeluxe = {
    min: round2((pkg.deluxe || 0)  + delMin.overcap),
    mean: round2((pkg.deluxe || 0) + delMean.overcap),
    max: round2((pkg.deluxe || 0)  + delMax.overcap)
  };
  const costAlc = { min: alcMin, mean: alcMean, max: alcMax };

  // ------- Winner selection (per-person, daily) -------
  const candidates = [
    { key: 'alc',     val: costAlc.mean },
    { key: 'soda',    val: costSoda.mean },
    { key: 'refresh', val: costRefresh.mean },
    { key: 'deluxe',  val: costDeluxe.mean }
  ];
  let best = { key: 'alc', val: Infinity };
  for (const c of candidates) if (c.val < best.val) best = c;
  if (epsilon && Number.isFinite(epsilon)) {
    // optional tie handling hook (unused)
  }
  const winnerKey = best.key;

  const perDay =
    winnerKey === 'soda'    ? costSoda.mean    :
    winnerKey === 'refresh' ? costRefresh.mean :
    winnerKey === 'deluxe'  ? costDeluxe.mean  :
    costAlc.mean;

  // ------- Policy & group -------
  const alcoholQty = safe(sum(meanL.filter(([id]) => dsSets.alcoholic.includes(id)).map(([, q]) => toNum(q))));
  const deluxeRequired = (alcoholQty > 0 && adults > 1);
  const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;

  function priceForKey(key) {
    return key === 'alc'     ? costAlc.mean
         : key === 'soda'    ? costSoda.mean
         : key === 'refresh' ? costRefresh.mean
         :                     costDeluxe.mean;
  }
  function labelForKey(key, { isMinor=false, discount=false } = {}) {
    if (key === 'alc')     return 'À-la-carte';
    if (key === 'soda')    return discount && isMinor ? 'Soda (disc.)' : 'Soda';
    if (key === 'refresh') return discount && isMinor ? 'Refreshment (disc.)' : 'Refreshment';
    if (key === 'deluxe')  return 'Deluxe';
    return 'À-la-carte';
  }

  const rows = [];
  let multiplier = 0;

  // Adults
  for (let i = 1; i <= adults; i++) {
    const k = adultStrategy;                 // 'alc' | 'soda' | 'refresh' | 'deluxe'
    const d = priceForKey(k);
    rows.push({
      who: `Adult ${i}`,
      pkgKey: k,
      pkg: labelForKey(k, { isMinor:false, discount:false }),
      perDay: round2(d),
      trip: round2(d * days),
      isMinor: false,
      discountApplied: false
    });
    multiplier += 1;
  }

  // Minors: If adults (or winner) are Deluxe, minors use Refreshment; else they follow the winnerKey (never Deluxe).
  const minorPkgKeyBase = (adultStrategy === 'deluxe' || winnerKey === 'deluxe') ? 'refresh' : winnerKey;

  for (let i = 1; i <= minors; i++) {
    const k = (minorPkgKeyBase === 'deluxe') ? 'refresh' : minorPkgKeyBase;
    const dBase = priceForKey(k);
    const d = dBase * kid;
    rows.push({
      who: `Minor ${i}`,
      pkgKey: k,
      pkg: labelForKey(k, { isMinor:true, discount:true }),
      perDay: round2(d),
      trip: round2(d * days),
      isMinor: true,
      discountApplied: true
    });
    multiplier += kid;
  }

  const trip = round2(perDay * days * multiplier);

  // For voucher math: split mean ALC into alcoholic vs non-alc subtotal
  const alcAlcoholicMean = round2(totalFor(meanL.filter(([id]) => dsSets.alcoholic.includes(id)), dsPrices, grat));
  const alcNonAlcoholicMean = round2(totalFor(meanL.filter(([id]) => !dsSets.alcoholic.includes(id)), dsPrices, grat));

  return {
    hasRange,
    bars: {
      alc:     { min: safe(costAlc.min),     mean: safe(costAlc.mean),     max: safe(costAlc.max) },
      soda:    { min: safe(costSoda.min),    mean: safe(costSoda.mean),    max: safe(costSoda.max) },
      refresh: { min: safe(costRefresh.min), mean: safe(costRefresh.mean), max: safe(costRefresh.max) },
      deluxe:  { min: safe(costDeluxe.min),  mean: safe(costDeluxe.mean),  max: safe(costDeluxe.max) }
    },
    winnerKey,
    perDay: safe(round2(perDay)),
    trip: safe(trip),
    groupRows: rows.map(r => ({
      who: r.who,
      pkg: r.pkg,
      pkgKey: r.pkgKey,
      perDay: safe(round2(r.perDay)),
      trip: safe(round2(r.trip)),
      isMinor: !!r.isMinor,
      discountApplied: !!r.discountApplied
    })),
    included: {
      soda:    safe(round2(incSMean)),
      refresh: safe(round2(incRMean)),
      deluxe:  safe(round2(delMean.included))
    },
    overcap: safe(round2(delMean.overcap)),
    deluxeRequired,
    // Voucher helpers
    _alcAlcoholicMean: alcAlcoholicMean,
    _alcNonAlcoholicMean: alcNonAlcoholicMean,
    _days: days,
    _adults: adults,
    _minors: minors
  };
}

/* ------------------------- vouchers companion ------------------------- */
/**
 * vouchers = {
 *   adultCountPerDay: number,  // e.g., 4
 *   minorCountPerDay: number,  // e.g., 4 (non-alc only)
 *   perVoucherValue:  number   // currency incl. gratuity (e.g., 12.00)
 * }
 */
export function computeWithVouchers(inputs, economics, dataset, vouchers) {
  const base = compute(inputs, economics, dataset);

  const vAdults = clamp(vouchers?.adultCountPerDay ?? 0, 0, 12);
  const vMinors = clamp(vouchers?.minorCountPerDay ?? 0, 0, 12);
  const vVal    = Math.max(0, toNum(vouchers?.perVoucherValue ?? 0));

  // Pools (per-cabin, per-day) in currency (incl. grat)
  const adultPool = round2(vAdults * vVal * base._adults);
  const minorPool = round2(vMinors * vVal * base._minors);

  // Split ALC mean into alcoholic + non-alc subtotals
  const alcAlcohol = base._alcAlcoholicMean;
  const alcNonAlc  = base._alcNonAlcoholicMean;

  // Apply adults to alcoholic first, then overflow to non-alc
  const adultOnAlcohol = Math.min(adultPool, alcAlcohol);
  const adultOverflow  = Math.max(0, adultPool - adultOnAlcohol);

  // Minors: non-alc only
  const minorOnNonAlc = Math.min(minorPool, Math.max(0, alcNonAlc - adultOverflow));

  const totalCredit = round2(adultOnAlcohol + adultOverflow + minorOnNonAlc);
  const newAlcMean  = round2(Math.max(0, base.bars.alc.mean - totalCredit));

  // Re-evaluate winner with adjusted ALC only (packages unchanged)
  const candidates = [
    { key: 'alc',     val: newAlcMean },
    { key: 'soda',    val: base.bars.soda.mean },
    { key: 'refresh', val: base.bars.refresh.mean },
    { key: 'deluxe',  val: base.bars.deluxe.mean }
  ];
  let best = { key: 'alc', val: Infinity };
  for (const c of candidates) if (c.val < best.val) best = c;

  const winnerKey = best.key;
  const perDay =
    winnerKey === 'alc'     ? newAlcMean
  : winnerKey === 'soda'    ? base.bars.soda.mean
  : winnerKey === 'refresh' ? base.bars.refresh.mean
  :                           base.bars.deluxe.mean;

  // Trip: multiply by adult/minor multiplier rule used in base
  // Adults count as 1 each; minors count as (minorDiscount) each.
  const kid = clamp(economics?.minorDiscount ?? 1.0, 0, 1);
  const multiplier = base._adults + (base._minors * kid);
  const trip = round2(perDay * base._days * multiplier);

  return {
    ...base,
    bars: {
      ...base.bars,
      alc: { ...base.bars.alc, mean: newAlcMean }
    },
    winnerKey,
    perDay,
    trip,
    vouchersAppliedPerDay: totalCredit,
    vouchers: {
      adultPoolPerDay: adultPool,
      minorPoolPerDay: minorPool,
      applied: {
        adultOnAlcohol,
        adultOverflowToNonAlcohol: adultOverflow,
        minorOnNonAlcohol: minorOnNonAlc
      }
    }
  };
}
