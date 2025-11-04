/* drink-math.js — v.9.000.003 (shared pure math, schema-adaptive & hardened) */

/* ------------------------- tiny utils ------------------------- */
const toNum = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, toNum(n)));
const safe = (n) => Number.isFinite(n) ? n : 0;
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
  // Prices: prefer legacy map; else build from items[]
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
  const alcoholSet = Array.isArray(sets.alcohol)
    ? sets.alcohol
    : (sets.alcoholic || []);

  // Rules: gratuity & caps
  const grat = Number.isFinite(dataset?.rules?.gratuity)
    ? dataset.rules.gratuity
    : undefined;
  const epsilon = Number.isFinite(dataset?.rules?.epsilon)
    ? dataset.rules.epsilon
    : 0;
  const capFromRules = Number.isFinite(dataset?.rules?.caps?.deluxeAlcohol)
    ? dataset.rules.caps.deluxeAlcohol
    : undefined;

  // Packages: support object form (priceMid || price)
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
function alcTotal(list, prices, grat) {
  return safe(sum(list.map(([id, qty]) => {
    const unit = toNum(prices[id]);
    const q = toNum(qty);
    return (q * unit) * (1 + grat);
  })));
}
function includedForSet(list, set, prices, grat) {
  return safe(sum(list
    .filter(([id]) => set.includes(id))
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
    } else if (sets.refresh.includes(id) || sets.soda.includes(id)) {
      included += (q * unit) * (1 + grat);
    }
  }
  return { included: safe(included), overcap: safe(overcap) };
}

/* ------------------------- compute ------------------------- */
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
  const kid = clamp(economics?.minorDiscount ?? 0.5, 0, 1);

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
      for (const k of keys) {
        totals[k] += toNum(day?.drinks?.[k]);
      }
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
    return isItinerary
      ? L
      : applyWeight(L, days, seaDays, seaApply, seaWeight);
  });
  const [minL, meanL, maxL] = lists;


  // --- Totals ---
  const alcMin = round2(alcTotal(minL, dsPrices, grat));
  const alcMean = round2(alcTotal(meanL, dsPrices, grat));
  const alcMax = round2(alcTotal(maxL, dsPrices, grat));

  const incSMin = round2(includedForSet(minL, dsSets.soda, dsPrices, grat));
  const incSMean = round2(includedForSet(meanL, dsSets.soda, dsPrices, grat));
  const incSMax = round2(includedForSet(maxL, dsSets.soda, dsPrices, grat));

  const incRMin = round2(includedForSet(minL, dsSets.refresh, dsPrices, grat));
  const incRMean = round2(includedForSet(meanL, dsSets.refresh, dsPrices, grat));
  const incRMax = round2(includedForSet(maxL, dsSets.refresh, dsPrices, grat));

  const delMin = deluxeBreakdown(minL, dsSets, dsPrices, grat, cap);
  const delMean = deluxeBreakdown(meanL, dsSets, dsPrices, grat, cap);
  const delMax = deluxeBreakdown(maxL, dsSets, dsPrices, grat, cap);

  // ------- Effective daily total costs (what you actually pay per day) -------
  const costSoda = {
    min: round2((pkg.soda || 0) + Math.max(0, alcMin - incSMin)),
    mean: round2((pkg.soda || 0) + Math.max(0, alcMean - incSMean)),
    max: round2((pkg.soda || 0) + Math.max(0, alcMax - incSMax))
  };
  const costRefresh = {
    min: round2((pkg.refresh || 0) + Math.max(0, alcMin - incRMin)),
    mean: round2((pkg.refresh || 0) + Math.max(0, alcMean - incRMean)),
    max: round2((pkg.refresh || 0) + Math.max(0, alcMax - incRMax))
  };
  const costDeluxe = {
    min: round2((pkg.deluxe || 0) + delMin.overcap),
    mean: round2((pkg.deluxe || 0) + delMean.overcap),
    max: round2((pkg.deluxe || 0) + delMax.overcap)
  };
  const costAlc = { min: alcMin, mean: alcMean, max: alcMax };

  // ------- Winner selection -------
  const candidates = [
    { key: 'alc', val: costAlc.mean },
    { key: 'soda', val: costSoda.mean },
    { key: 'refresh', val: costRefresh.mean },
    { key: 'deluxe', val: costDeluxe.mean }
  ];
  let best = { key: 'alc', val: Infinity };
  for (const c of candidates) if (c.val < best.val) best = c;
  if (epsilon && Number.isFinite(epsilon)) {
    // Optional tie handling (unused)
  }
  const winnerKey = best.key;

  const perDay =
    winnerKey === 'soda' ? costSoda.mean :
    winnerKey === 'refresh' ? costRefresh.mean :
    winnerKey === 'deluxe' ? costDeluxe.mean :
    costAlc.mean;

  // ------- Policy & group -------
  const alcoholQty = safe(sum(meanL.filter(([id]) => dsSets.alcoholic.includes(id)).map(([, q]) => toNum(q))));
  const deluxeRequired = (alcoholQty > 0 && adults > 1);
  const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;

  const rows = [];
  let multiplier = 0;
  for (let i = 1; i <= adults; i++) {
    rows.push({ who: `Adult ${i}`, pkg: adultStrategy, perDay, trip: round2(perDay * days) });
    multiplier += 1;
  }
  for (let i = 1; i <= minors; i++) {
    const k = (adultStrategy === 'deluxe' || winnerKey === 'deluxe') ? 'refresh' : winnerKey;
    const d = (k === 'alc') ? costAlc.mean : (k === 'soda' ? costSoda.mean : (k === 'refresh' ? costRefresh.mean : costDeluxe.mean));
    rows.push({
      who: `Minor ${i}`,
      pkg: k === 'alc' ? 'À-la-carte' : 'Refreshment (disc.)',
      perDay: round2(d * kid),
      trip: round2(d * days * kid)
    });
    multiplier += kid;
  }

  const trip = round2(perDay * days * multiplier);

  return {
    hasRange,
    bars: {
      alc: { min: safe(costAlc.min), mean: safe(costAlc.mean), max: safe(costAlc.max) },
      soda: { min: safe(costSoda.min), mean: safe(costSoda.mean), max: safe(costSoda.max) },
      refresh: { min: safe(costRefresh.min), mean: safe(costRefresh.mean), max: safe(costRefresh.max) },
      deluxe: { min: safe(costDeluxe.min), mean: safe(costDeluxe.mean), max: safe(costDeluxe.max) }
    },
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
      soda: safe(round2(incSMean)),
      refresh: safe(round2(incRMean)),
      deluxe: safe(round2(delMean.included))
    },
    overcap: safe(round2(delMean.overcap)),
    deluxeRequired
  };
}

/* Attach to window/self for inline fallback (non-module envs) */
try {
  const g = (typeof window !== 'undefined') ? window : (typeof self !== 'undefined' ? self : {});
  g.ITW_MATH = Object.assign({}, g.ITW_MATH || {}, { compute });
} catch (_) {}
