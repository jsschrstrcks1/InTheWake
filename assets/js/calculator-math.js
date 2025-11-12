/**
 * Royal Caribbean Drink Calculator - Math Engine
 * Version: 1.002.000 (Accessibility Promise Kept)
 * 
 * "I was eyes to the blind and feet to the lame" - Job 29:15
 * "The fear of the LORD is the beginning of wisdom" - Proverbs 9:10
 * 
 * Soli Deo Gloria ✝️
 * 
 * ACCESSIBILITY COMMITMENT:
 * This calculator serves ALL travelers - regardless of ability.
 * Every calculation is designed to be understood by screen readers,
 * keyboard navigators, and visual users alike.
 * 
 * FEATURES:
 * ✅ Two-winner system (adults + kids when minors present)
 * ✅ Kids package restrictions (soda/refresh only, never deluxe)
 * ✅ Vouchers = FREE DRINKS (count subtraction, not dollar credits)
 * ✅ Gentle nudges (breakeven distance calculations)
 * ✅ Health guidelines (CDC alcohol threshold warnings)
 * ✅ Results structured for screen reader announcements
 */

'use strict';

/* ==================== UTILITIES ==================== */

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
  
  const sets = Object.assign(
    { soda: [], refresh: [], alcoholic: [] },
    dataset?.sets || {}
  );
  const alcoholic = Array.isArray(sets.alcohol) ? sets.alcohol : (sets.alcoholic || []);
  
  const rules = dataset?.rules || {};
  const gratuity = Number.isFinite(rules.gratuity) ? rules.gratuity : 0.18;
  const deluxeCap = Number.isFinite(rules.caps?.deluxeAlcohol) 
    ? rules.caps.deluxeAlcohol 
    : (Number.isFinite(rules.deluxeCap) ? rules.deluxeCap : 14.0);
  
  return { prices, sets: { ...sets, alcoholic }, gratuity, deluxeCap };
}

/* ==================== GENTLE NUDGES ==================== */

function calculateNudges(inputs, economics, dataset, results) {
  const nudges = [];
  const { days, adults, drinks } = inputs;
  const { pkg } = economics;
  const { prices } = adaptDataset(dataset);
  
  if (days <= 0 || adults <= 0) return nudges;
  
  const perPersonDaily = {
    soda: round2(pkg.soda / days),
    refresh: round2(pkg.refresh / days),
    deluxe: round2(pkg.deluxe / days)
  };
  
  const currentDaily = round2(results.perDay / Math.max(1, adults));
  
  if (currentDaily < perPersonDaily.soda && currentDaily > 0) {
    const gap = perPersonDaily.soda - currentDaily;
    const sodaPrice = prices.soda || 2.0;
    const sodaNeeded = Math.ceil(gap / sodaPrice);
    if (sodaNeeded > 0 && sodaNeeded <= 5) {
      nudges.push({
        package: 'soda',
        message: `Add ${sodaNeeded} ${sodaNeeded === 1 ? 'soda' : 'sodas'} per day to break even with Soda package`,
        icon: '🥤',
        priority: 1,
        ariaLabel: `Breakeven tip: Add ${sodaNeeded} sodas per day to reach Soda package value`
      });
    }
  }
  
  if (currentDaily < perPersonDaily.refresh && currentDaily >= perPersonDaily.soda) {
    const gap = perPersonDaily.refresh - currentDaily;
    const coffeePrice = prices.coffee || 4.5;
    const drinksNeeded = Math.ceil(gap / coffeePrice);
    if (drinksNeeded > 0 && drinksNeeded <= 5) {
      nudges.push({
        package: 'refresh',
        message: `Add ${drinksNeeded} premium ${drinksNeeded === 1 ? 'drink' : 'drinks'} per day to break even with Refreshment package`,
        icon: '☕',
        priority: 2,
        ariaLabel: `Breakeven tip: Add ${drinksNeeded} premium drinks per day to reach Refreshment package value`
      });
    }
  }
  
  if (currentDaily < perPersonDaily.deluxe && currentDaily >= perPersonDaily.refresh) {
    const gap = perPersonDaily.deluxe - currentDaily;
    const cocktailPrice = prices.cocktail || 13.0;
    const drinksNeeded = Math.ceil(gap / cocktailPrice);
    if (drinksNeeded > 0 && drinksNeeded <= 5) {
      nudges.push({
        package: 'deluxe',
        message: `Add ${drinksNeeded} ${drinksNeeded === 1 ? 'cocktail' : 'cocktails'} per day to break even with Deluxe package`,
        icon: '🍹',
        priority: 3,
        ariaLabel: `Breakeven tip for adults: Add ${drinksNeeded} cocktails per day to reach Deluxe package value`
      });
    }
  }
  
  return nudges.sort((a, b) => a.priority - b.priority);
}

/* ==================== HEALTH GUIDELINES ==================== */

function calculateHealthNote(inputs, results) {
  const { days, adults, drinks } = inputs;
  
  if (days <= 0 || adults <= 0) return null;
  
  const alcoholicDrinks = ['beer', 'wine', 'cocktail', 'spirits'];
  const totalAlcoholPerDay = alcoholicDrinks.reduce((sum, key) => {
    return sum + toNum(drinks[key]);
  }, 0);
  
  if (totalAlcoholPerDay === 0) return null;
  
  const perPerson = totalAlcoholPerDay / adults;
  
  const moderateLimit = 2;
  const highLimit = 4;
  
  if (perPerson > highLimit) {
    return {
      level: 'high',
      message: 'Your drink plan exceeds CDC guidelines for moderate consumption. Consider pacing yourself to honor your health.',
      icon: '⚕️',
      ariaLabel: 'Health advisory: Alcohol consumption exceeds CDC recommended limits'
    };
  } else if (perPerson > moderateLimit) {
    return {
      level: 'moderate',
      message: 'CDC recommends moderation: up to 1-2 drinks daily. Your wallet, body, and spirit will thank you.',
      icon: '💙',
      ariaLabel: 'Health reminder: CDC recommends moderate alcohol consumption'
    };
  }
  
  return null;
}

/* ==================== TWO-WINNER SYSTEM ==================== */

function determineWinners(costs, minors) {
  const adultOptions = [
    { key: 'alc', cost: costs.alc },
    { key: 'soda', cost: costs.soda },
    { key: 'refresh', cost: costs.refresh },
    { key: 'deluxe', cost: costs.deluxe }
  ];
  
  const adultWinner = adultOptions.reduce((min, curr) => 
    curr.cost < min.cost ? curr : min, adultOptions[0]
  );
  
  if (minors === 0) {
    return {
      adultWinner: adultWinner.key,
      minorWinner: null,
      showTwoWinners: false
    };
  }
  
  const minorOptions = [
    { key: 'soda', cost: costs.soda },
    { key: 'refresh', cost: costs.refresh }
  ];
  
  const minorWinner = minorOptions.reduce((min, curr) => 
    curr.cost < min.cost ? curr : min, minorOptions[0]
  );
  
  return {
    adultWinner: adultWinner.key,
    minorWinner: minorWinner.key,
    showTwoWinners: true
  };
}

/* ==================== MAIN COMPUTATION ==================== */

function compute(inputs, economics, dataset, vouchers = null) {
  const { prices, sets, gratuity, deluxeCap } = adaptDataset(dataset);
  
  const days = clamp(inputs.days, 1, 365);
  const seaDays = clamp(inputs.seaDays, 0, days);
  const seaApply = Boolean(inputs.seaApply);
  const seaWeight = clamp(inputs.seaWeight, 0, 40);
  const adults = clamp(inputs.adults, 1, 20);
  const minors = clamp(inputs.minors, 0, 20);
  const coffeeCards = clamp(inputs.coffeeCards || 0, 0, 10);
  const coffeePunches = clamp(inputs.coffeePunches || 0, 0, 5);
  
  const pkgSoda = toNum(economics.pkg?.soda || 13.99);
  const pkgRefresh = toNum(economics.pkg?.refresh || 34.0);
  const pkgDeluxe = toNum(economics.pkg?.deluxe || 85.0);
  const grat = toNum(economics.grat || gratuity);
  const cap = toNum(economics.deluxeCap || deluxeCap);
  
  const drinkList = Object.keys(inputs.drinks || {}).map(key => [key, toNum(inputs.drinks[key])]);
  const weighted = applyWeight(drinkList, days, seaDays, seaApply, seaWeight);
  
  let totalVouchersPerDay = 0;
  if (vouchers && vouchers.perVoucherValue > 0) {
    const adultVouchers = clamp(vouchers.adultCountPerDay || 0, 0, 10);
    const minorVouchers = clamp(vouchers.minorCountPerDay || 0, 0, 10);
    totalVouchersPerDay = (adultVouchers * adults) + (minorVouchers * minors);
  }
  
  let vouchersRemaining = totalVouchersPerDay;
  const adjustedWeighted = weighted.map(([id, qty]) => {
    if (vouchersRemaining <= 0) return [id, qty];
    const vouchersUsed = Math.min(vouchersRemaining, qty);
    vouchersRemaining -= vouchersUsed;
    return [id, Math.max(0, qty - vouchersUsed)];
  });
  
  let categoryRows = adjustedWeighted.map(([id, qty]) => {
    const price = prices[id] || 0;
    const cost = price * qty * days;
    return { id, qty, price, cost };
  });
  
  const rawTotal = sum(categoryRows.map(r => r.cost));
  
  const coffeeItems = categoryRows.filter(r => r.id === 'coffee');
  const coffeeQtyTotal = coffeeItems.reduce((s, r) => s + r.qty, 0) * days;
  const cardsUsed = Math.min(coffeeCards, Math.floor(coffeeQtyTotal / 10));
  const punchesUsed = Math.min(coffeePunches * days, coffeeQtyTotal - cardsUsed * 10);
  const coffeeDiscount = (cardsUsed * 10 + punchesUsed) * (prices.coffee || 4.5);
  
  const alcTotal = sum(categoryRows.filter(r => sets.alcoholic.includes(r.id)).map(r => r.cost));
  const refreshTotal = sum(categoryRows.filter(r => sets.refresh.includes(r.id)).map(r => r.cost));
  const sodaTotal = sum(categoryRows.filter(r => sets.soda.includes(r.id)).map(r => r.cost));
  
  const totalAlc = Math.max(0, rawTotal - coffeeDiscount);
  
  const deluxeRequired = adults > 0 && alcTotal > 0;
  const policyNote = deluxeRequired 
    ? 'Royal Caribbean requires all adults to purchase the Deluxe package when alcohol is consumed'
    : null;
  
  const sodaPkg = pkgSoda * (1 + grat) * days * adults;
  const refreshPkg = pkgRefresh * (1 + grat) * days * adults;
  const deluxePkg = pkgDeluxe * (1 + grat) * days * adults;
  
  const alcPerDay = alcTotal / days;
  const alcPerPerson = adults > 0 ? alcPerDay / adults : 0;
  const overcap = Math.max(0, alcPerPerson - cap);
  
  const bars = {
    alc: { min: totalAlc, mean: totalAlc, max: totalAlc },
    soda: { min: sodaPkg, mean: sodaPkg, max: sodaPkg },
    refresh: { min: refreshPkg, mean: refreshPkg, max: refreshPkg },
    deluxe: { min: deluxePkg, mean: deluxePkg, max: deluxePkg }
  };
  
  const winners = determineWinners({
    alc: totalAlc,
    soda: sodaPkg,
    refresh: refreshPkg,
    deluxe: deluxePkg
  }, minors);
  
  const voucherSavings = totalVouchersPerDay > 0 
    ? totalVouchersPerDay * days * (prices.cocktail || 13.0)
    : 0;
  
  const groupRows = [
    { label: 'Adults', count: adults, pkg: 'deluxe', cost: deluxePkg },
    { label: 'Minors', count: minors, pkg: 'refresh', cost: 0 }
  ];
  
  const nudges = calculateNudges(inputs, economics, dataset, {
    perDay: totalAlc / days,
    trip: totalAlc,
    bars
  });
  
  const healthNote = calculateHealthNote(inputs, {});
  
  const getLabelForPackage = (key) => {
    const labels = {
      alc: 'À la carte',
      soda: 'Soda Package',
      refresh: 'Refreshment Package',
      deluxe: 'Deluxe Package'
    };
    return labels[key] || 'À la carte';
  };
  
  const adultLabel = getLabelForPackage(winners.adultWinner);
  const perDay = round2(totalAlc / days);
  
  let ariaAnnouncement;
  if (!winners.showTwoWinners) {
    ariaAnnouncement = `Calculation complete. Best value: ${adultLabel}. Total cost: $${perDay} per day.`;
  } else {
    const minorLabel = getLabelForPackage(winners.minorWinner);
    ariaAnnouncement = `Calculation complete. Best value for adults: ${adultLabel}. Best value for children: ${minorLabel}. Total cost: $${perDay} per day.`;
  }
  
  return {
    hasRange: false,
    bars,
    winnerKey: winners.adultWinner,
    minorWinnerKey: winners.minorWinner,
    showTwoWinners: winners.showTwoWinners,
    winnerLabel: getLabelForPackage(winners.adultWinner),
    minorWinnerLabel: winners.minorWinner ? getLabelForPackage(winners.minorWinner) : null,
    perDay: round2(totalAlc / days),
    trip: round2(totalAlc),
    groupRows,
    categoryRows: categoryRows.map(r => ({
      ...r,
      qty: round2(r.qty),
      cost: round2(r.cost)
    })),
    included: {
      soda: sodaTotal,
      refresh: refreshTotal + sodaTotal,
      deluxe: Math.min(alcTotal, cap * days * adults) + refreshTotal + sodaTotal
    },
    overcap: round2(overcap),
    deluxeRequired,
    policyNote,
    nudges,
    healthNote,
    voucherSavings: round2(voucherSavings),
    vouchersUsed: totalVouchersPerDay,
    ariaAnnouncement
  };
}

/* ==================== EXPORTS ==================== */

if (typeof window !== 'undefined') {
  window.ITW_MATH = Object.freeze({
    compute,
    version: '1.002.000'
  });
} else if (typeof self !== 'undefined') {
  self.ITW_MATH = Object.freeze({
    compute,
    version: '1.002.000'
  });
}

// "I was eyes to the blind and feet to the lame" - Job 29:15
// Soli Deo Gloria ✝️
