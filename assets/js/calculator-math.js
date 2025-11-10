/* calculator-math.js v10.0.0 assets/js/calculator-math.js
 * Royal Caribbean Drink Package Calculation Engine
 * Soli Deo Gloria ✝️
 */

/* ==================== UTILITIES ==================== */
(function() {
'use strict';
const toNum = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, toNum(n)));
const safe = (n) => (Number.isFinite(n) ? n : 0);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const round2 = (n) => Math.round(safe(n) * 100) / 100;

function scalarize(val, mode = 'mean') {
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

function applyWeight(list, days, seaDays, seaApply, seaWeight) {
  if (!seaApply) return list;
  
  const D = clamp(days, 0, 365);
  const S = clamp(seaDays, 0, D);
  if (D <= 0) return list;
  
  const w = clamp(seaWeight, 0, 40) / 100;
  const seaFactor = 1 + w;
  const portFactor = 1 - w;
  const portDays = Math.max(0, D - S);
  
  return list.map(([id, qty]) => {
    const q = toNum(qty);
    const weighted = ((q * seaFactor * S) + (q * portFactor * portDays)) / D;
    return [id, safe(weighted)];
  });
}

/* ==================== DATASET ADAPTER ==================== */

function adaptDataset(dataset) {
  // Prices
  let prices = dataset?.prices;
  if (!prices && Array.isArray(dataset?.items)) {
    prices = {};
    for (const item of dataset.items) {
      if (item && item.id) {
        prices[item.id] = toNum(item.price);
      }
    }
  }
  prices = prices || {};
  
  // Sets
  const sets = Object.assign(
    { soda: [], refresh: [], alcoholic: [] },
    dataset?.sets || {}
  );
  const alcoholic = Array.isArray(sets.alcohol) ? sets.alcohol : (sets.alcoholic || []);
  
  // Rules
  const rules = dataset?.rules || {};
  const gratuity = Number.isFinite(rules.gratuity) ? rules.gratuity : 0.18;
  const deluxeCap = Number.isFinite(rules.caps?.deluxeAlcohol) 
    ? rules.caps.deluxeAlcohol 
    : (rules.deluxeCap || 14.0);
  
  // Packages
  let packages = null;
  if (dataset?.packages && typeof dataset.packages === 'object') {
    const pick = (obj) => obj && (toNum(obj.priceMid) || toNum(obj.price) || 0);
    packages = {
      soda: pick(dataset.packages.soda),
      refresh: pick(dataset.packages.refreshment || dataset.packages.refresh),
      deluxe: pick(dataset.packages.deluxe)
    };
  }
  
  return {
    prices,
    sets: { soda: sets.soda || [], refresh: sets.refresh || [], alcoholic },
    gratuity,
    deluxeCap,
    packages
  };
}

/* ==================== CORE CALCULATION ==================== */
function compute(inputs, economics, dataset) {
  const { prices, sets, gratuity: dsGratuity, deluxeCap: dsCap } = adaptDataset(dataset || {});
  
  const drinkKeys = [
    'soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail',
    'energy', 'milkshake', 'bottledwater', 'beer', 'wine',
    'cocktail', 'spirits'
  ];
  
  // Economics
  const gratuity = clamp(economics?.grat ?? dsGratuity, 0, 0.5);
  const deluxeCap = clamp(economics?.deluxeCap ?? dsCap, 0, 200);
  
  // Package prices
  const pkgEco = economics?.pkg || {};
  const pkg = {
    soda: toNum(pkgEco.soda) || toNum(dataset?.packages?.soda?.priceMid || dataset?.packages?.soda?.price) || 13.99,
    refresh: toNum(pkgEco.refresh) || toNum((dataset?.packages?.refreshment || dataset?.packages?.refresh)?.priceMid || (dataset?.packages?.refreshment || dataset?.packages?.refresh)?.price) || 34.0,
    deluxe: toNum(pkgEco.deluxe) || toNum(dataset?.packages?.deluxe?.priceMid || dataset?.packages?.deluxe?.price) || 85.0
  };
  
  // Inputs
  const days = clamp(inputs?.days, 1, 365) || 1;
  const seaDays = clamp(inputs?.seaDays, 0, days);
  const seaApply = !!(inputs?.seaApply ?? true);
  const seaWeight = clamp(inputs?.seaWeight, 0, 40);
  const adults = clamp(inputs?.adults, 1, 20) || 1;
  const minors = clamp(inputs?.minors, 0, 20) || 0;
  
  // Drinks
  const drinks = {};
  for (const key of drinkKeys) {
    const val = inputs?.drinks?.[key];
    if (val && typeof val === 'object') {
      const min = Math.max(0, toNum(val.min));
      const max = Math.max(min, toNum(val.max));
      drinks[key] = { min, max };
    } else {
      drinks[key] = Math.max(0, toNum(val));
    }
  }
  
  // Build quantity lists
  let base, hasRange;
  
  const isItinerary = (inputs?.calcMode === 'itinerary') &&
                      Array.isArray(inputs?.itinerary) &&
                      inputs.itinerary.length > 0;
  
  if (isItinerary) {
    // Sum daily quantities and average
    const totals = Object.fromEntries(drinkKeys.map(k => [k, 0]));
    for (const day of inputs.itinerary) {
      for (const key of drinkKeys) {
        totals[key] += toNum(day?.drinks?.[key]);
      }
    }
    const count = Math.max(1, inputs.itinerary.length);
    base = drinkKeys.map(k => [k, totals[k] / count]);
    hasRange = false;
  } else {
    base = drinkKeys.map(k => [k, drinks[k]]);
    hasRange = Object.values(drinks).some(v => v && typeof v === 'object');
  }
  
  // Generate min/mean/max lists
  const lists = ['min', 'mean', 'max'].map(mode => {
    const list = base.map(([k, v]) => [k, scalarize(v, mode)]);
    return isItinerary ? list : applyWeight(list, days, seaDays, seaApply, seaWeight);
  });
  
  const [minList, meanList, maxList] = lists;
  
  // Calculate totals
  const totalFor = (list) => safe(sum(list.map(([id, qty]) => 
    (toNum(qty) * toNum(prices[id])) * (1 + gratuity)
  )));
  
  const includeFor = (list, set) => safe(sum(
    list.filter(([id]) => set.includes(id))
        .map(([id, qty]) => (toNum(qty) * toNum(prices[id])) * (1 + gratuity))
  ));
  
  const deluxeBreakdown = (list) => {
    let included = 0, overcap = 0;
    
    for (const [id, qty] of list) {
      const q = toNum(qty);
      if (q <= 0) continue;
      
      const unit = toNum(prices[id]);
      
      if (sets.alcoholic.includes(id)) {
        if (unit <= deluxeCap) {
          included += (q * unit) * (1 + gratuity);
        } else {
          included += (q * deluxeCap) * (1 + gratuity);
          overcap += (q * (unit - deluxeCap)) * (1 + gratuity);
        }
      } else {
        included += (q * unit) * (1 + gratuity);
      }
    }
    
    return { included: safe(included), overcap: safe(overcap) };
  };
  
  // À-la-carte costs
  const alcMin = round2(totalFor(minList));
  const alcMean = round2(totalFor(meanList));
  const alcMax = round2(totalFor(maxList));
  
  // Included values
  const incSodaMin = round2(includeFor(minList, sets.soda));
  const incSodaMean = round2(includeFor(meanList, sets.soda));
  const incSodaMax = round2(includeFor(maxList, sets.soda));
  
  const incRefreshMin = round2(includeFor(minList, sets.refresh));
  const incRefreshMean = round2(includeFor(meanList, sets.refresh));
  const incRefreshMax = round2(includeFor(maxList, sets.refresh));
  
  const delMin = deluxeBreakdown(minList);
  const delMean = deluxeBreakdown(meanList);
  const delMax = deluxeBreakdown(maxList);
  
  // Effective daily costs (what you actually pay)
  const costSoda = {
    min: round2(pkg.soda + Math.max(0, alcMin - incSodaMin)),
    mean: round2(pkg.soda + Math.max(0, alcMean - incSodaMean)),
    max: round2(pkg.soda + Math.max(0, alcMax - incSodaMax))
  };
  
  const costRefresh = {
    min: round2(pkg.refresh + Math.max(0, alcMin - incRefreshMin)),
    mean: round2(pkg.refresh + Math.max(0, alcMean - incRefreshMean)),
    max: round2(pkg.refresh + Math.max(0, alcMax - incRefreshMax))
  };
  
  const costDeluxe = {
    min: round2(pkg.deluxe + delMin.overcap),
    mean: round2(pkg.deluxe + delMean.overcap),
    max: round2(pkg.deluxe + delMax.overcap)
  };
  
  const costAlc = { min: alcMin, mean: alcMean, max: alcMax };
  
  // Winner selection
  const candidates = [
    { key: 'alc', val: costAlc.mean },
    { key: 'soda', val: costSoda.mean },
    { key: 'refresh', val: costRefresh.mean },
    { key: 'deluxe', val: costDeluxe.mean }
  ];
  
  let best = candidates[0];
  for (const candidate of candidates) {
    if (candidate.val < best.val) {
      best = candidate;
    }
  }
  
  const winnerKey = best.key;
  const perDay = best.val;
  
  // Group breakdown (policy: deluxe required if winner is deluxe + alcohol present + multiple adults)
  const alcoholQty = safe(sum(
    meanList.filter(([id]) => sets.alcoholic.includes(id))
            .map(([, q]) => toNum(q))
  ));
  
  const deluxeRequired = (winnerKey === 'deluxe' && alcoholQty > 0 && adults > 1);
  const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;
  
  const priceForKey = (key) => {
    return key === 'alc' ? costAlc.mean :
           key === 'soda' ? costSoda.mean :
           key === 'refresh' ? costRefresh.mean :
           costDeluxe.mean;
  };
  
  const labelForKey = (key) => {
    return key === 'alc' ? 'À-la-carte' :
           key === 'soda' ? 'Soda' :
           key === 'refresh' ? 'Refreshment' :
           'Deluxe';
  };
  
  const groupRows = [];
  
  // Adults
  for (let i = 1; i <= adults; i++) {
    const key = adultStrategy;
    const dailyCost = priceForKey(key);
    groupRows.push({
      who: `Adult ${i}`,
      pkgKey: key,
      pkg: labelForKey(key),
      perDay: round2(dailyCost),
      trip: round2(dailyCost * days),
      isMinor: false
    });
  }
  
  // Minors (never deluxe)
  const minorKey = (adultStrategy === 'deluxe' || winnerKey === 'deluxe') ? 'refresh' : winnerKey;
  const finalMinorKey = (minorKey === 'deluxe') ? 'refresh' : minorKey;
  
  for (let i = 1; i <= minors; i++) {
    const dailyCost = priceForKey(finalMinorKey);
    groupRows.push({
      who: `Minor ${i}`,
      pkgKey: finalMinorKey,
      pkg: labelForKey(finalMinorKey),
      perDay: round2(dailyCost),
      trip: round2(dailyCost * days),
      isMinor: true
    });
  }
  
  const multiplier = adults + minors;
  const trip = round2(perDay * days * multiplier);
  
  // Split ALC for voucher support
  const alcAlcoholic = round2(totalFor(
    meanList.filter(([id]) => sets.alcoholic.includes(id))
  ));
  const alcNonAlcoholic = round2(totalFor(
    meanList.filter(([id]) => !sets.alcoholic.includes(id))
  ));
  
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
    groupRows,
    included: {
      soda: safe(round2(incSodaMean)),
      refresh: safe(round2(incRefreshMean)),
      deluxe: safe(round2(delMean.included))
    },
    overcap: safe(round2(delMean.overcap)),
    deluxeRequired,
    policyNote: deluxeRequired 
      ? 'Royal Caribbean requires all adults in your stateroom to purchase the Deluxe package.' 
      : null,
    
    // Private helpers for voucher computation
    _alcAlcoholic: alcAlcoholic,
    _alcNonAlcoholic: alcNonAlcoholic,
    _days: days,
    _adults: adults,
    _minors: minors,
    _gratuity: gratuity,
    _deluxeCap: deluxeCap,
    _pkg: pkg,
    _sets: sets,
    _prices: prices,
    _meanList: meanList
  };
}

/* ==================== VOUCHER COMPUTATION ==================== */

function computeWithVouchers(inputs, economics, dataset, vouchers) {
  const base = compute(inputs, economics, dataset);
  
  const vAdults = clamp(vouchers?.adultCountPerDay ?? 0, 0, 50);
  const vMinors = clamp(vouchers?.minorCountPerDay ?? 0, 0, 50);
  const vValue = Math.max(0, toNum(vouchers?.perVoucherValue ?? 0));
  
  // Calculate pools
  const adultPool = round2(vAdults * vValue * base._adults);
  const minorPool = round2(vMinors * vValue * base._minors);
  
  // Apply adult vouchers to alcoholic first, then non-alcoholic
  const adultOnAlcohol = Math.min(adultPool, base._alcAlcoholic);
  const adultOverflow = Math.max(0, adultPool - adultOnAlcohol);
  
  // Apply minor vouchers to non-alcoholic only
  const minorOnNonAlc = Math.min(minorPool, Math.max(0, base._alcNonAlcoholic - adultOverflow));
  
  const totalCredit = round2(adultOnAlcohol + adultOverflow + minorOnNonAlc);
  const newAlcMean = round2(Math.max(0, base.bars.alc.mean - totalCredit));
  
  // Re-evaluate winner
  const candidates = [
    { key: 'alc', val: newAlcMean },
    { key: 'soda', val: base.bars.soda.mean },
    { key: 'refresh', val: base.bars.refresh.mean },
    { key: 'deluxe', val: base.bars.deluxe.mean }
  ];
  
  let best = candidates[0];
  for (const candidate of candidates) {
    if (candidate.val < best.val) {
      best = candidate;
    }
  }
  
  const winnerKey = best.key;
  
  // Rebuild group rows with new winner
  const alcoholQty = safe(sum(
    base._meanList.filter(([id]) => base._sets.alcoholic.includes(id))
                  .map(([, q]) => toNum(q))
  ));
  
  const deluxeRequired = (winnerKey === 'deluxe' && alcoholQty > 0 && base._adults > 1);
  const adultStrategy = deluxeRequired ? 'deluxe' : winnerKey;
  
  const priceForKey = (key) => {
    return key === 'alc' ? newAlcMean :
           key === 'soda' ? base.bars.soda.mean :
           key === 'refresh' ? base.bars.refresh.mean :
           base.bars.deluxe.mean;
  };
  
  const labelForKey = (key) => {
    return key === 'alc' ? 'À-la-carte' :
           key === 'soda' ? 'Soda' :
           key === 'refresh' ? 'Refreshment' :
           'Deluxe';
  };
  
  const groupRows = [];
  
  // Adults
  for (let i = 1; i <= base._adults; i++) {
    const key = adultStrategy;
    const dailyCost = priceForKey(key);
    groupRows.push({
      who: `Adult ${i}`,
      pkgKey: key,
      pkg: labelForKey(key),
      perDay: round2(dailyCost),
      trip: round2(dailyCost * base._days),
      isMinor: false
    });
  }
  
  // Minors
  const minorKey = (adultStrategy === 'deluxe' || winnerKey === 'deluxe') ? 'refresh' : winnerKey;
  const finalMinorKey = (minorKey === 'deluxe') ? 'refresh' : minorKey;
  
  for (let i = 1; i <= base._minors; i++) {
    const dailyCost = priceForKey(finalMinorKey);
    groupRows.push({
      who: `Minor ${i}`,
      pkgKey: finalMinorKey,
      pkg: labelForKey(finalMinorKey),
      perDay: round2(dailyCost),
      trip: round2(dailyCost * base._days),
      isMinor: true
    });
  }
  
  const perDay = priceForKey(winnerKey);
  const multiplier = base._adults + base._minors;
  const trip = round2(perDay * base._days * multiplier);
  
  return {
    ...base,
    bars: {
      ...base.bars,
      alc: { ...base.bars.alc, mean: newAlcMean }
    },
    winnerKey,
    perDay: safe(round2(perDay)),
    trip: safe(trip),
    groupRows,
    deluxeRequired,
    policyNote: deluxeRequired 
      ? 'Royal Caribbean requires all adults in your stateroom to purchase the Deluxe package.' 
      : null,
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

// Expose globally for fallback (when worker unavailable)
if (typeof window !== 'undefined') {
  window.ITW_MATH = { compute, computeWithVouchers };
}
})();
