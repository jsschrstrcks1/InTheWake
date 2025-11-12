/**
 * Royal Caribbean Drink Calculator - Math Engine
 * Version: 1,001.001 (Phase 1 Complete)
 * 
 * "The fear of the LORD is the beginning of wisdom" - Proverbs 9:10
 * 
 * Soli Deo Gloria ✝️
 * 
 * PHASE 1 FEATURES:
 * ✅ #3  Unified compute() API (handles vouchers internally)
 * ✅ #9  Gentle nudges (breakeven distance calculations)
 * ✅ #10 Health guidelines (CDC alcohol threshold warnings)
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
    : (Number.isFinite(rules.deluxeCap) ? rules.deluxeCap : 14.0);
  
  return { prices, sets: { ...sets, alcoholic }, gratuity, deluxeCap };
}

/* ==================== GENTLE NUDGES ==================== */
/**
 * ✅ PHASE 1 ITEM #9: Gentle nudges system
 * "A word fitly spoken is like apples of gold" - Proverbs 25:11
 * 
 * Calculates how close user is to breaking even on each package
 */
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
  
  // Current spend per day
  const currentDaily = round2(results.perDay / Math.max(1, adults));
  
  // Soda package nudge
  if (currentDaily < perPersonDaily.soda && currentDaily > 0) {
    const gap = perPersonDaily.soda - currentDaily;
    const sodaPrice = prices.soda || 2.0;
    const sodaNeeded = Math.ceil(gap / sodaPrice);
    if (sodaNeeded > 0 && sodaNeeded <= 5) {
      nudges.push({
        package: 'soda',
        message: `Add ${sodaNeeded} ${sodaNeeded === 1 ? 'soda' : 'sodas'} per day → Soda package breaks even`,
        icon: '🥤',
        priority: 1
      });
    }
  }
  
  // Refresh package nudge
  if (currentDaily < perPersonDaily.refresh && currentDaily >= perPersonDaily.soda) {
    const gap = perPersonDaily.refresh - currentDaily;
    const coffeePrice = prices.coffee || 4.5;
    const drinksNeeded = Math.ceil(gap / coffeePrice);
    if (drinksNeeded > 0 && drinksNeeded <= 5) {
      nudges.push({
        package: 'refresh',
        message: `Add ${drinksNeeded} premium ${drinksNeeded === 1 ? 'drink' : 'drinks'} per day → Refreshment package breaks even`,
        icon: '☕',
        priority: 2
      });
    }
  }
  
  // Deluxe package nudge
  if (currentDaily < perPersonDaily.deluxe && currentDaily >= perPersonDaily.refresh) {
    const gap = perPersonDaily.deluxe - currentDaily;
    const cocktailPrice = prices.cocktail || 13.0;
    const drinksNeeded = Math.ceil(gap / cocktailPrice);
    if (drinksNeeded > 0 && drinksNeeded <= 5) {
      nudges.push({
        package: 'deluxe',
        message: `Add ${drinksNeeded} ${drinksNeeded === 1 ? 'cocktail' : 'cocktails'} per day → Deluxe package breaks even`,
        icon: '🍹',
        priority: 3
      });
    }
  }
  
  // You're close! message
  if (currentDaily >= perPersonDaily.soda * 0.85 && currentDaily < perPersonDaily.soda) {
    nudges.push({
      package: 'soda',
      message: `You're only ${round2(perPersonDaily.soda - currentDaily)} away from breaking even on Soda!`,
      icon: '🎯',
      priority: 0
    });
  }
  
  return nudges.sort((a, b) => a.priority - b.priority);
}

/* ==================== HEALTH GUIDELINES ==================== */
/**
 * ✅ PHASE 1 ITEM #10: Health guidelines (CDC threshold)
 * "Do you not know that your body is a temple?" - 1 Corinthians 6:19
 * 
 * CDC Guidelines:
 * - Men: ≤2 drinks/day
 * - Women: ≤1 drink/day
 * 
 * Non-judgmental, informational only
 */
function calculateHealthNote(inputs, results) {
  const { days, adults, drinks } = inputs;
  
  if (days <= 0 || adults <= 0) return null;
  
  // Calculate total alcoholic drinks per day
  const alcoholicDrinks = ['beer', 'wine', 'cocktail', 'spirits'];
  const totalAlcoholPerDay = alcoholicDrinks.reduce((sum, key) => {
    return sum + toNum(drinks[key]);
  }, 0);
  
  if (totalAlcoholPerDay === 0) return null;
  
  const perPerson = totalAlcoholPerDay / adults;
  
  // CDC thresholds (using conservative limit for mixed gender groups)
  const moderateLimit = 2; // CDC moderate drinking threshold
  const highLimit = 4; // Heavy drinking threshold
  
  if (perPerson > highLimit) {
    return {
      level: 'high',
      message: 'Your drink plan exceeds CDC guidelines for moderate consumption. Consider pacing yourself to honor your health.',
      icon: '⚕️'
    };
  } else if (perPerson > moderateLimit) {
    return {
      level: 'moderate',
      message: 'CDC recommends moderation: up to 1-2 drinks daily. Your wallet, body, and spirit will thank you.',
      icon: '💙'
    };
  }
  
  return null;
}

/* ==================== MAIN COMPUTATION ==================== */

/**
 * ✅ PHASE 1 ITEM #3: Unified compute() function
 * "Let all things be done decently and in order" - 1 Corinthians 14:40
 * 
 * Single API that handles vouchers, gentle nudges, and health guidelines internally
 * 
 * @param {Object} inputs - User inputs (days, adults, drinks, vouchers, etc.)
 * @param {Object} economics - Package prices and economics (pkg, grat, deluxeCap)
 * @param {Object} dataset - Pricing dataset with prices, sets, rules
 * @param {Object|null} vouchers - Voucher configuration (optional)
 * @returns {Object} Complete results with bars, rows, nudges, healthNote
 */
function compute(inputs, economics, dataset, vouchers = null) {
  // Adapt dataset
  const { prices, sets, gratuity, deluxeCap } = adaptDataset(dataset);
  
  // Extract inputs
  const days = clamp(inputs.days, 1, 365);
  const seaDays = clamp(inputs.seaDays, 0, days);
  const seaApply = Boolean(inputs.seaApply);
  const seaWeight = clamp(inputs.seaWeight, 0, 40);
  const adults = clamp(inputs.adults, 1, 20);
  const minors = clamp(inputs.minors, 0, 20);
  const coffeeCards = clamp(inputs.coffeeCards || 0, 0, 10);
  const coffeePunches = clamp(inputs.coffeePunches || 0, 0, 5);
  
  // Package prices
  const pkgSoda = toNum(economics.pkg?.soda || 13.99);
  const pkgRefresh = toNum(economics.pkg?.refresh || 34.0);
  const pkgDeluxe = toNum(economics.pkg?.deluxe || 85.0);
  const grat = toNum(economics.grat || gratuity);
  const cap = toNum(economics.deluxeCap || deluxeCap);
  
  // Build consumption list
  const drinkList = Object.keys(inputs.drinks || {}).map(key => [key, toNum(inputs.drinks[key])]);
  const weighted = applyWeight(drinkList, days, seaDays, seaApply, seaWeight);
  
  // Calculate costs
  let categoryRows = weighted.map(([id, qty]) => {
    const price = prices[id] || 0;
    const cost = price * qty * days;
    return { id, qty, price, cost };
  });
  
  const rawTotal = sum(categoryRows.map(r => r.cost));
  
  // Coffee card discount
  const coffeeItems = categoryRows.filter(r => r.id === 'coffee');
  const coffeeQtyTotal = coffeeItems.reduce((s, r) => s + r.qty, 0) * days;
  const cardsUsed = Math.min(coffeeCards, Math.floor(coffeeQtyTotal / 10));
  const punchesUsed = Math.min(coffeePunches, coffeeQtyTotal - cardsUsed * 10);
  const coffeeDiscount = cardsUsed * 10 * (prices.coffee || 4.5) + punchesUsed * (prices.coffee || 4.5);
  
  const alcTotal = sum(categoryRows.filter(r => sets.alcoholic.includes(r.id)).map(r => r.cost));
  const refreshTotal = sum(categoryRows.filter(r => sets.refresh.includes(r.id)).map(r => r.cost));
  const sodaTotal = sum(categoryRows.filter(r => sets.soda.includes(r.id)).map(r => r.cost));
  
  // Voucher credit
  let voucherCredit = 0;
  if (vouchers && vouchers.perVoucherValue > 0) {
    const adultVouchers = clamp(vouchers.adultCountPerDay || 0, 0, 10);
    const minorVouchers = clamp(vouchers.minorCountPerDay || 0, 0, 10);
    voucherCredit = (adultVouchers * adults + minorVouchers * minors) * days * vouchers.perVoucherValue;
  }
  
  const totalAlc = Math.max(0, rawTotal - coffeeDiscount - voucherCredit);
  
  // Check Royal Caribbean policy: if any adult, all must buy Deluxe
  const deluxeRequired = adults > 0 && alcTotal > 0;
  const policyNote = deluxeRequired 
    ? 'Royal Caribbean requires all adults to purchase the Deluxe package when alcohol is consumed'
    : null;
  
  // Package costs
  const sodaPkg = pkgSoda * (1 + grat) * days * adults;
  const refreshPkg = pkgRefresh * (1 + grat) * days * adults;
  const deluxePkg = pkgDeluxe * (1 + grat) * days * adults;
  
  // Check over-cap
  const alcPerDay = alcTotal / days;
  const alcPerPerson = adults > 0 ? alcPerDay / adults : 0;
  const overcap = Math.max(0, alcPerPerson - cap);
  
  const included = {
    soda: sodaTotal,
    refresh: refreshTotal + sodaTotal,
    deluxe: Math.min(alcTotal, cap * days * adults) + refreshTotal + sodaTotal
  };
  
  // Winner determination
  const bars = {
    alc: { min: totalAlc, mean: totalAlc, max: totalAlc },
    soda: { min: sodaPkg, mean: sodaPkg, max: sodaPkg },
    refresh: { min: refreshPkg, mean: refreshPkg, max: refreshPkg },
    deluxe: { min: deluxePkg, mean: deluxePkg, max: deluxePkg }
  };
  
  const costs = [
    { key: 'alc', cost: totalAlc },
    { key: 'soda', cost: sodaPkg },
    { key: 'refresh', cost: refreshPkg },
    { key: 'deluxe', cost: deluxePkg }
  ];
  
  const winner = costs.reduce((min, curr) => curr.cost < min.cost ? curr : min, costs[0]);
  
  // Group breakdown
  const groupRows = [
    { label: 'Adults', count: adults, pkg: 'deluxe', cost: deluxePkg },
    { label: 'Minors', count: minors, pkg: 'refresh', cost: 0 }
  ];
  
  // ✅ PHASE 1 ITEM #9: Calculate gentle nudges
  const nudges = calculateNudges(inputs, economics, dataset, {
    perDay: totalAlc / days,
    trip: totalAlc,
    bars
  });
  
  // ✅ PHASE 1 ITEM #10: Calculate health guidelines
  const healthNote = calculateHealthNote(inputs, {});
  
  return {
    hasRange: false,
    bars,
    winnerKey: winner.key,
    perDay: round2(totalAlc / days),
    trip: round2(totalAlc),
    groupRows,
    categoryRows: categoryRows.map(r => ({
      ...r,
      qty: round2(r.qty),
      cost: round2(r.cost)
    })),
    included,
    overcap: round2(overcap),
    deluxeRequired,
    policyNote,
    nudges, // ✅ #9
    healthNote // ✅ #10
  };
}

/* ==================== EXPORTS ==================== */

if (typeof window !== 'undefined') {
  window.ITW_MATH = Object.freeze({
    compute, // ✅ #3: Single unified API
    version:  '1.001.001'
  });
} else if (typeof self !== 'undefined') {
  self.ITW_MATH = Object.freeze({
    compute,
    version:  '1.001.001'
  });
}

// "In all thy ways acknowledge him, and he shall direct thy paths" - Proverbs 3:6
// Soli Deo Gloria ✝️
