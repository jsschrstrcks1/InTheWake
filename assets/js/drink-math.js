/**
 * Royal Caribbean Drink Package Calculator - Math Engine
 * Version: 10.0.0
 * Soli Deo Gloria ✝️
 * 
 * CONTRACTS:
 * - Pure functions, no side effects
 * - Idempotent (same inputs = same outputs)
 * - All business logic lives here
 * - UI/Worker never modify financial calculations
 * 
 * BUSINESS RULES:
 * - Minors never get alcoholic packages
 * - If any adult buys Deluxe, ALL adults must buy Deluxe (cabin rule)
 * - When adults have Deluxe, minors must have a package (cheapest)
 * - Vouchers offset À-la-carte only, never package prices
 * - Sea weighting applies to consumption calculations
 */

// ==================== UTILITY FUNCTIONS ====================

const toNum = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, toNum(n)));
const safe = (n) => (Number.isFinite(n) ? n : 0);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const round2 = (n) => Math.round(safe(n) * 100) / 100;

/**
 * Scalarize a value or range to min/mean/max
 */
function scalarize(val, mode = 'mean') {
  if (val && typeof val === 'object' && 'min' in val && 'max' in val) {
    const lo = Math.max(0, toNum(val.min));
    const hi = Math.max(lo, toNum(val.max));
    if (mode === 'min') return lo;
    if (mode === 'max') return hi;
    return (lo + hi) / 2;
  }
  return Math.max(0, toNum(val));
}

/**
 * Apply sea/port day weighting to consumption
 * Sea days get (1 + seaWeight) multiplier, port days get (1 - seaWeight)
 */
function applySeaWeighting(drinkList, days, seaDays, seaApply, seaWeight) {
  if (!seaApply) return drinkList;
  
  const D = clamp(days, 1, 365);
  const S = clamp(seaDays, 0, D);
  if (D <= 0) return drinkList;
  
  const w = clamp(seaWeight, 0, 40) / 100; // Convert to 0-0.4
  const seaFactor = 1 + w;
  const portFactor = 1 - w;
  const portDays = Math.max(0, D - S);
  
  return drinkList.map(([id, qty]) => {
    const q = toNum(qty);
    const weighted = ((q * seaFactor * S) + (q * portFactor * portDays)) / D;
    return [id, safe(weighted)];
  });
}

// ==================== DATASET ADAPTER ====================

/**
 * Normalize dataset from various formats
 */
function adaptDataset(dataset) {
  // Extract prices
  let prices = dataset?.prices || {};
  if (!prices && Array.isArray(dataset?.items)) {
    prices = {};
    for (const item of dataset.items) {
      if (item?.id) prices[item.id] = toNum(item.price);
    }
  }
  
  // Extract sets
  const sets = {
    soda: [],
    refresh: [],
    alcoholic: [],
    ...dataset?.sets
  };
  const alcoholSet = Array.isArray(sets.alcohol) ? sets.alcohol : (sets.alcoholic || []);
  
  // Extract rules
  const grat = dataset?.rules?.gratuity;
  const epsilon = dataset?.rules?.epsilon || 0;
  const capFromRules = dataset?.rules?.caps?.deluxeAlcohol;
  
  // Extract packages
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
    sets: { 
      soda: sets.soda || [], 
      refresh: sets.refresh || [], 
      alcoholic: alcoholSet 
    },
    grat: grat !== undefined ? grat : undefined,
    epsilon,
    capFromRules,
    pkgFromDataset
  };
}

// ==================== CORE ENGINE ====================

/**
 * Main computation function
 * @param {Object} inputs - User inputs (drinks, guests, days, vouchers)
 * @param {Object} economics - Package prices, gratuity, caps
 * @param {Object} dataset - Brand pricing data
 * @returns {Object} Complete calculation results
 */
export function compute(inputs, economics, dataset) {
  // Sanitize and clamp inputs
  const days = clamp(Math.round(inputs.days ?? 7), 1, 365);
  const seaDays = clamp(Math.round(inputs.seaDays ?? 0), 0, days);
  const seaApply = !!(inputs.seaApply ?? true);
  const seaWeight = clamp(inputs.seaWeight ?? 20, 0, 40);
  const adults = clamp(Math.round(inputs.adults ?? 1), 1, 20);
  const minors = clamp(Math.round(inputs.minors ?? 0), 0, 20);
  
  // Adapt dataset
  const ds = adaptDataset(dataset);
  const dsPrices = ds.prices;
  const dsSets = ds.sets;
  
  // Economics with fallbacks
  const grat = economics.grat ?? ds.grat ?? 0.18;
  const deluxeCap = economics.deluxeCap ?? ds.capFromRules ?? 14.0;
  const minorDiscount = clamp(economics.minorDiscount ?? 0, 0, 1);
  
  const pkgPrices = {
    soda: economics.pkg?.soda ?? ds.pkgFromDataset?.soda ?? 13.99,
    refresh: economics.pkg?.refresh ?? ds.pkgFromDataset?.refresh ?? 34.00,
    deluxe: economics.pkg?.deluxe ?? ds.pkgFromDataset?.deluxe ?? 85.00
  };
  
  // Parse drinks input into [id, quantity] pairs
  const drinks = inputs.drinks || {};
  const drinkCategories = [
    'soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail', 
    'energy', 'milkshake', 'bottledwater', 
    'beer', 'wine', 'cocktail', 'spirits'
  ];
  
  let drinkList = drinkCategories.map(id => {
    const val = drinks[id];
    return [id, scalarize(val, 'mean')];
  });
  
  // Get min/max ranges for bars
  const drinkListMin = drinkCategories.map(id => [id, scalarize(drinks[id], 'min')]);
  const drinkListMax = drinkCategories.map(id => [id, scalarize(drinks[id], 'max')]);
  
  // Apply sea weighting
  const meanList = applySeaWeighting(drinkList, days, seaDays, seaApply, seaWeight);
  const minList = applySeaWeighting(drinkListMin, days, seaDays, seaApply, seaWeight);
  const maxList = applySeaWeighting(drinkListMax, days, seaDays, seaApply, seaWeight);
  
  // Separate alcoholic vs non-alcoholic
  const alcoholicIds = dsSets.alcoholic;
  const sodaIds = dsSets.soda;
  const refreshIds = dsSets.refresh;
  
  const alcoholicMean = meanList.filter(([id]) => alcoholicIds.includes(id));
  const nonAlcMean = meanList.filter(([id]) => !alcoholicIds.includes(id));
  
  // Calculate À-la-carte cost per day
  const alcCostPerDay = round2(sum(meanList.map(([id, qty]) => {
    const price = dsPrices[id] || 0;
    return qty * price * (1 + grat);
  })));
  
  const alcCostPerDayMin = round2(sum(minList.map(([id, qty]) => {
    const price = dsPrices[id] || 0;
    return qty * price * (1 + grat);
  })));
  
  const alcCostPerDayMax = round2(sum(maxList.map(([id, qty]) => {
    const price = dsPrices[id] || 0;
    return qty * price * (1 + grat);
  })));
  
  // Calculate package costs
  
  // Soda package: covers soda set items
  const sodaIncluded = sum(meanList
    .filter(([id]) => sodaIds.includes(id))
    .map(([, qty]) => qty)
  );
  const sodaNotIncluded = sum(meanList
    .filter(([id]) => !sodaIds.includes(id))
    .map(([id, qty]) => {
      const price = dsPrices[id] || 0;
      return qty * price * (1 + grat);
    })
  );
  const sodaPerDay = round2(pkgPrices.soda * (1 + grat) + sodaNotIncluded);
  
  // Refreshment package: covers refresh set items
  const refreshIncluded = sum(meanList
    .filter(([id]) => refreshIds.includes(id))
    .map(([, qty]) => qty)
  );
  const refreshNotIncluded = sum(meanList
    .filter(([id]) => !refreshIds.includes(id))
    .map(([id, qty]) => {
      const price = dsPrices[id] || 0;
      return qty * price * (1 + grat);
    })
  );
  const refreshPerDay = round2(pkgPrices.refresh * (1 + grat) + refreshNotIncluded);
  
  // Deluxe package: covers all drinks up to cap
  const deluxeIncluded = sum(meanList.map(([, qty]) => qty));
  let deluxeOvercap = 0;
  const deluxeNotIncluded = sum(meanList.map(([id, qty]) => {
    const price = dsPrices[id] || 0;
    const pricePerDrink = price * (1 + grat);
    if (pricePerDrink > deluxeCap) {
      deluxeOvercap += qty * (pricePerDrink - deluxeCap);
      return qty * (pricePerDrink - deluxeCap);
    }
    return 0;
  }));
  const deluxePerDay = round2(pkgPrices.deluxe * (1 + grat) + deluxeNotIncluded);
  
  // Apply vouchers if present
  let vouchersAppliedPerDay = 0;
  let alcCostAfterVouchers = alcCostPerDay;
  
  if (inputs.vouchers && Array.isArray(inputs.vouchers)) {
    const voucherValue = {
      'none': 0,
      'diamond': 4,
      'diamondplus': 5,
      'pinnacle': 5
    };
    
    // Calculate total voucher credits per day
    const totalVoucherCredits = sum(inputs.vouchers.map(v => {
      const level = v?.level || 'none';
      return voucherValue[level] || 0;
    }));
    
    // Vouchers offset À-la-carte only
    vouchersAppliedPerDay = Math.min(alcCostPerDay, totalVoucherCredits);
    alcCostAfterVouchers = Math.max(0, alcCostPerDay - vouchersAppliedPerDay);
  }
  
  // Determine winner (lowest cost per day)
  const candidates = [
    { key: 'alc', cost: alcCostAfterVouchers },
    { key: 'soda', cost: sodaPerDay },
    { key: 'refresh', cost: refreshPerDay },
    { key: 'deluxe', cost: deluxePerDay }
  ];
  
  let winner = candidates[0];
  for (const c of candidates) {
    if (c.cost < winner.cost) winner = c;
  }
  
  const winnerKey = winner.key;
  const perDay = winner.cost;
  
  // Build group rows (guest-by-guest breakdown)
  const groupRows = [];
  
  // Determine if cabin rule applies
  // Rule: If any adult buys Deluxe, ALL adults must buy Deluxe
  const anyAdultNeedsDeluxe = winnerKey === 'deluxe';
  const deluxeRequired = anyAdultNeedsDeluxe && adults > 1;
  
  // Adults
  const adultStrategy = anyAdultNeedsDeluxe ? 'deluxe' : winnerKey;
  
  for (let i = 1; i <= adults; i++) {
    const pkg = adultStrategy;
    const cost = pkg === 'alc' ? alcCostAfterVouchers :
                 pkg === 'soda' ? sodaPerDay :
                 pkg === 'refresh' ? refreshPerDay :
                 deluxePerDay;
    
    groupRows.push({
      who: `Adult ${i}`,
      pkg: pkg,
      perDay: round2(cost),
      trip: round2(cost * days)
    });
  }
  
  // Minors
  // If any adult has Deluxe, minors must have a package (cheapest)
  // Otherwise, minors can be À-la-carte
  if (minors > 0) {
    const minorNonAlcCost = sum(nonAlcMean.map(([id, qty]) => {
      const price = dsPrices[id] || 0;
      return qty * price * (1 + grat);
    }));
    
    // Minors can choose from: À-la-carte (non-alc only), Soda, or Refreshment
    // Never Deluxe (contains alcohol)
    const minorOptions = [
      { key: 'alc', cost: minorNonAlcCost },
      { key: 'soda', cost: pkgPrices.soda * (1 + grat) * (1 - minorDiscount) },
      { key: 'refresh', cost: pkgPrices.refresh * (1 + grat) * (1 - minorDiscount) }
    ];
    
    // If adults have Deluxe, minors must have a package (not à-la-carte)
    const minorCandidates = anyAdultNeedsDeluxe 
      ? minorOptions.filter(o => o.key !== 'alc')
      : minorOptions;
    
    // Find cheapest option for minors
    let minorWinner = minorCandidates[0];
    for (const c of minorCandidates) {
      if (c.cost < minorWinner.cost) minorWinner = c;
    }
    
    for (let i = 1; i <= minors; i++) {
      groupRows.push({
        who: `Minor ${i}`,
        pkg: minorWinner.key,
        perDay: round2(minorWinner.cost),
        trip: round2(minorWinner.cost * days)
      });
    }
  }
  
  // Calculate trip total
  const trip = round2(sum(groupRows.map(r => r.trip)));
  
  // Build results object
  return {
    bars: {
      alc: { min: alcCostPerDayMin, mean: alcCostAfterVouchers, max: alcCostPerDayMax },
      soda: { min: sodaPerDay, mean: sodaPerDay, max: sodaPerDay },
      refresh: { min: refreshPerDay, mean: refreshPerDay, max: refreshPerDay },
      deluxe: { min: deluxePerDay, mean: deluxePerDay, max: deluxePerDay }
    },
    winnerKey,
    perDay: round2(perDay),
    trip,
    groupRows,
    included: {
      soda: round2(sodaIncluded),
      refresh: round2(refreshIncluded),
      deluxe: round2(deluxeIncluded)
    },
    overcap: round2(deluxeOvercap),
    deluxeRequired,
    policy: {
      anyAdultDeluxe: anyAdultNeedsDeluxe,
      minorsRequirePackage: anyAdultNeedsDeluxe && minors > 0
    },
    vouchersAppliedPerDay: round2(vouchersAppliedPerDay),
    // Store metadata for debugging
    _meta: {
      days,
      adults,
      minors,
      seaDays,
      seaApply,
      seaWeight
    }
  };
}

// Safe zero fallback
export const SAFE_ZERO = {
  bars: {
    alc: { min: 0, mean: 0, max: 0 },
    soda: { min: 0, mean: 0, max: 0 },
    refresh: { min: 0, mean: 0, max: 0 },
    deluxe: { min: 0, mean: 0, max: 0 }
  },
  winnerKey: 'alc',
  perDay: 0,
  trip: 0,
  groupRows: [],
  included: { soda: 0, refresh: 0, deluxe: 0 },
  overcap: 0,
  deluxeRequired: false,
  policy: { anyAdultDeluxe: false, minorsRequirePackage: false },
  vouchersAppliedPerDay: 0
};
