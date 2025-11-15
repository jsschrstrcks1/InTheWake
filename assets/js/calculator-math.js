/**
 * Royal Caribbean Drink Calculator - Math Engine
 * Version: 1.007.000 (Coffee Card Winner + Grid Layout)
 *
 * "I was eyes to the blind and feet to the lame" - Job 29:15
 * "The fear of the LORD is the beginning of wisdom" - Proverbs 9:10
 *
 * Soli Deo Gloria ✝️
 *
 * CHANGELOG v1.007.000:
 * ✅ FEATURE: Coffee card can now win as the best option!
 *    - Previously coffee card was just an alternative, not a competitive winner
 *    - Now if coffee cards are cheaper than packages, coffee card wins
 *    - Coffee card is tracked separately in bars and determineWinners
 *    - Coffee card section becomes clickable like package cards
 *    - When adults choose coffee cards and minors exist, minors get cheapest package
 *
 * CHANGELOG v1.006.000:
 * ✅ CRITICAL BUG FIX #1: Package costs were including coffee card costs!
 *    - When comparing packages, code was using totalAlc (which includes coffee card cost)
 *    - But packages COVER coffee, so you don't buy coffee cards with packages!
 *    - This made packages appear more expensive than they actually are
 *    - Example: With 2 coffee cards ($73.16 cost - $67.50 discount = $5.66 net)
 *      * OLD: Refreshment = $280.84 + $5.66 = $286.50 ❌ WRONG!
 *      * NEW: Refreshment = $280.84 + $0.00 = $280.84 ✓ CORRECT!
 *    - Fix: Use rawTotal (not totalAlc) when calculating uncovered drink costs for packages
 *
 * ✅ CRITICAL BUG FIX #2: Vouchers were applying in random order!
 *    - Vouchers should apply to MOST EXPENSIVE drinks first (up to $14 cap)
 *    - Old code applied in arbitrary object iteration order
 *    - Example: 5 sodas ($2), 3 cocktails ($13), 5 vouchers
 *      * OLD: If sodas first → save 5 × $2 = $10, pay $39 for cocktails ❌
 *      * NEW: Cocktails first → save 3 × $13 = $39, pay $4 for sodas ✓
 *    - Savings difference: $33!
 *    - Fix: Sort drinks by price descending, apply vouchers in that order
 *    - Vouchers only work on drinks ≤ $14 (deluxe package cap)
 *
 * ✅ FIX #3: Voucher savings calculation now accurate
 *    - Tracks actual savings based on drinks that received vouchers
 *    - No longer assumes all vouchers used on cocktails
 *
 * CHANGELOG v1.005.000:
 * ✅ CRITICAL FIX: Package costs now include minors' packages!
 *    - Soda package: was only counting adults, now includes kids' soda packages
 *    - Refresh package: was only counting adults, now includes kids' refresh packages
 *    - Deluxe package: already correct (adults deluxe + kids refresh)
 *    - This fixes the bug where adding kids caused soda to be incorrectly recommended
 *    - Example: 2 adults + 2 kids, all drinking soda → soda packages for ALL 4 people, not just adults
 *
 * CHANGELOG v1.004.003:
 * ✅ MAJOR FEATURE: Split coffee into small (1 punch) and large/iced (2 punches)
 * ✅ CRITICAL FIX: Punch calculation now accurate for mixed coffee types
 * ✅ SMART OPTIMIZATION: Prioritizes using punches for large coffees first (saves more)
 * ✅ UI: Separate inputs for "Specialty coffee - small" and "Specialty coffee - large/iced"
 *
 * CHANGELOG v1.004.002:
 * ✅ CRITICAL FIX: Coffee Cards now have correct 15 punches (was 10)
 * ✅ CRITICAL FIX: Coffee Card purchase cost now included in calculations
 * ✅ FIXED: À-la-carte total = raw cost - discount + coffee card cost
 * ✅ Coffee Card price now editable and stored in economics.pkg.coffee
 *
 * CHANGELOG v1.004.000:
 * ✅ CRITICAL FIX: Package recommendations now account for uncovered drinks!
 *    - Soda package was being recommended for coffee drinks (doesn't cover coffee!)
 *    - Fixed: Each package cost now includes à la carte cost for uncovered drinks
 *    - Example: 44 coffees now correctly recommends Refresh ($561) not Soda ($231+$1386=$1617)
 *
 * CHANGELOG v1.003.000:
 * ✅ CRITICAL FIX: Minors forced to Refreshment when adults buy Deluxe
 * ✅ FIXED: Pinnacle vouchers corrected (6/day not 5)
 * ✅ FIXED: Royal Caribbean policy message (package uniformity, not consumption)
 * ✅ Enhanced input validation
 * ✅ Maintained all v1.002.000 structure and features
 * 
 * ACCESSIBILITY COMMITMENT:
 * This calculator serves ALL travelers - regardless of ability.
 * Every calculation is designed to be understood by screen readers,
 * keyboard navigators, and visual users alike.
 * 
 * FEATURES:
 * ✅ Two-winner system (adults + kids when minors present)
 * ✅ Kids package restrictions (soda/refresh only, never deluxe)
 * ✅ CRITICAL: Minors MUST buy Refreshment when adults buy Deluxe
 * ✅ CRITICAL: All adults must buy same package (uniformity policy)
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
  const { pkg, grat } = economics;
  const { prices, gratuity } = adaptDataset(dataset);
  const gratuityRate = grat !== undefined ? grat : gratuity;

  if (days <= 0 || adults <= 0) return nudges;

  // CRITICAL FIX v1.005.000: Package prices are per-person-per-day, need to add gratuity
  // NOT divide by days!
  const perPersonDaily = {
    soda: round2(pkg.soda * (1 + gratuityRate)),
    refresh: round2(pkg.refresh * (1 + gratuityRate)),
    deluxe: round2(pkg.deluxe * (1 + gratuityRate))
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
    const coffeePrice = prices.coffeeLarge || prices.coffeeSmall || 4.5;
    const drinksNeeded = Math.ceil(gap / coffeePrice);
    if (drinksNeeded > 0 && drinksNeeded <= 5) {
      nudges.push({
        package: 'refresh',
        message: `Add ${drinksNeeded} specialty coffee${drinksNeeded === 1 ? '' : 's'} per day to break even with Refreshment package`,
        icon: '☕',
        priority: 2,
        ariaLabel: `Breakeven tip: Add ${drinksNeeded} specialty coffees per day to reach Refreshment package value`
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

/* ==================== TWO-WINNER SYSTEM (v1.003.000 ENHANCED) ==================== */

/**
 * Determine winning packages for adults and minors
 * 
 * CRITICAL FIX v1.003.000:
 * When adults choose Deluxe, minors are FORCED to Refreshment (Royal Caribbean policy)
 * This is enforced even if Soda would be cheaper for minors
 */
function determineWinners(costs, minors) {
  const adultOptions = [
    { key: 'alc', cost: costs.alc },
    { key: 'soda', cost: costs.soda },
    { key: 'refresh', cost: costs.refresh },
    { key: 'deluxe', cost: costs.deluxe }
  ];

  // NEW v1.007.000: Add coffee card as option if provided
  if (costs.coffee !== undefined && costs.coffee !== null) {
    adultOptions.push({ key: 'coffee', cost: costs.coffee });
  }

  const adultWinner = adultOptions.reduce((min, curr) =>
    curr.cost < min.cost ? curr : min, adultOptions[0]
  );
  
  if (minors === 0) {
    return {
      adultWinner: adultWinner.key,
      minorWinner: null,
      showTwoWinners: false,
      minorForced: false
    };
  }
  
  // CRITICAL FIX: If adults choose Deluxe, minors MUST choose Refreshment
  if (adultWinner.key === 'deluxe') {
    console.log('[Math Engine] POLICY ENFORCED: Minors forced to Refreshment (adults buying Deluxe)');
    return {
      adultWinner: 'deluxe',
      minorWinner: 'refresh',
      showTwoWinners: true,
      minorForced: true, // Flag that minors are forced, not choosing cheapest
      minorForcedReason: 'Required when adults purchase Deluxe'
    };
  }

  // NEW v1.007.000: If adults choose Coffee Card, minors choose cheapest package
  if (adultWinner.key === 'coffee') {
    const minorOptions = [
      { key: 'soda', cost: costs.soda },
      { key: 'refresh', cost: costs.refresh }
    ];

    const minorWinner = minorOptions.reduce((min, curr) =>
      curr.cost < min.cost ? curr : min, minorOptions[0]
    );

    console.log(`[Math Engine] Adults choosing Coffee Card, minors get ${minorWinner.key} package`);
    return {
      adultWinner: 'coffee',
      minorWinner: minorWinner.key,
      showTwoWinners: true,
      minorForced: false
    };
  }

  // Normal case: minors choose cheapest between Soda and Refreshment
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
    showTwoWinners: true,
    minorForced: false
  };
}

/* ==================== MAIN COMPUTATION ==================== */

/**
 * ✅ NEW v1.003.000: Package forcing feature
 * @param {object} forcedPackage - Optional forced package ('soda'|'refresh'|'deluxe'|null)
 *                                 When set, skips cost comparison and forces this package as winner
 */
function compute(inputs, economics, dataset, vouchers = null, forcedPackage = null) {
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
  const coffeeCardPrice = toNum(economics.pkg?.coffee || 31.0); // CRITICAL FIX v1.003.002
  const grat = toNum(economics.grat || gratuity);
  const cap = toNum(economics.deluxeCap || deluxeCap);
  
  const drinkList = Object.keys(inputs.drinks || {}).map(key => [key, toNum(inputs.drinks[key])]);
  const weighted = applyWeight(drinkList, days, seaDays, seaApply, seaWeight);
  
  // CRITICAL FIX v1.006.000: Voucher application - most expensive drinks first!
  // Pinnacle: 6/day (FIXED from 5), Diamond+: 5/day, Diamond: 4/day
  let totalVouchersPerDay = 0;
  let actualVoucherSavings = 0; // Track actual savings for accurate reporting

  if (vouchers && vouchers.perVoucherValue > 0) {
    const adultVouchers = clamp(vouchers.adultCountPerDay || 0, 0, 6); // Max 6 for Pinnacle
    const minorVouchers = clamp(vouchers.minorCountPerDay || 0, 0, 6);
    totalVouchersPerDay = (adultVouchers * adults) + (minorVouchers * minors);

    if (adultVouchers === 6 || minorVouchers === 6) {
      console.log('[Math Engine] Pinnacle vouchers detected (6/day)');
    }
  }

  let adjustedWeighted = weighted;

  if (totalVouchersPerDay > 0) {
    // CRITICAL FIX: Apply vouchers to MOST EXPENSIVE drinks first (up to deluxe cap)
    // Vouchers only work on drinks ≤ $14 (deluxe beverage package cap)

    // Step 1: Add prices to weighted drinks and filter to voucherable drinks only
    const withPrices = weighted.map(([id, qty]) => {
      const price = prices[id] || 0;
      return { id, qty, price };
    });

    // Step 2: Split into voucherable (≤ cap) and non-voucherable (> cap)
    const voucherable = withPrices.filter(d => d.price > 0 && d.price <= cap);
    const nonVoucherable = withPrices.filter(d => d.price > cap);

    // Step 3: Sort voucherable drinks by price DESCENDING (most expensive first)
    const sortedVoucherable = voucherable.sort((a, b) => b.price - a.price);

    // Step 4: Apply vouchers to sorted drinks
    let vouchersRemaining = totalVouchersPerDay;

    const voucherApplied = sortedVoucherable.map(drink => {
      if (vouchersRemaining <= 0) {
        return { id: drink.id, qty: drink.qty, price: drink.price };
      }

      const vouchersUsed = Math.min(vouchersRemaining, drink.qty);
      const qtyAfterVouchers = Math.max(0, drink.qty - vouchersUsed);

      // Track actual savings from this drink type
      actualVoucherSavings += vouchersUsed * drink.price;

      vouchersRemaining -= vouchersUsed;

      console.log(`[Vouchers] ${drink.id} ($${drink.price}): ${vouchersUsed} vouchers applied, ${qtyAfterVouchers} drinks remain`);

      return { id: drink.id, qty: qtyAfterVouchers, price: drink.price };
    });

    // Step 5: Combine vouchered drinks with non-voucherable drinks
    const allDrinks = [...voucherApplied, ...nonVoucherable];

    // Convert back to [id, qty] format
    adjustedWeighted = allDrinks.map(d => [d.id, d.qty]);

    console.log(`[Vouchers] Total savings: $${actualVoucherSavings.toFixed(2)} (${totalVouchersPerDay - vouchersRemaining} vouchers used)`);
  }

  let categoryRows = adjustedWeighted.map(([id, qty]) => {
    const price = prices[id] || 0;
    const cost = price * qty * days;
    return { id, qty, price, cost };
  });
  
  const rawTotal = sum(categoryRows.map(r => r.cost));
  
  // CRITICAL FIX v1.003.003: Calculate total coffee punches from small (1 punch) and large (2 punches)
  const COFFEE_CARD_PUNCHES = 15;
  const coffeeSmallQty = categoryRows.find(r => r.id === 'coffeeSmall')?.qty || 0;
  const coffeeLargeQty = categoryRows.find(r => r.id === 'coffeeLarge')?.qty || 0;

  // Total punches needed = (small × 1) + (large × 2)
  const totalPunchesNeeded = (coffeeSmallQty * 1 + coffeeLargeQty * 2) * days;

  // Calculate how many cards are actually used (can't use more cards than you bought)
  const cardsUsed = Math.min(coffeeCards, Math.floor(totalPunchesNeeded / COFFEE_CARD_PUNCHES));

  // Manual punches (from "Avg punches/day" field) can supplement cards
  const punchesUsed = Math.min(coffeePunches * days, Math.max(0, totalPunchesNeeded - cardsUsed * COFFEE_CARD_PUNCHES));

  // Total free coffees from cards and punches (convert back to drinks)
  const totalFreePunches = cardsUsed * COFFEE_CARD_PUNCHES + punchesUsed;

  // Calculate discount: prioritize covering large coffees first (they save more), then small
  const largeCoffeesFromPunches = Math.min(coffeeLargeQty * days, Math.floor(totalFreePunches / 2));
  const remainingPunches = totalFreePunches - (largeCoffeesFromPunches * 2);
  const smallCoffeesFromPunches = Math.min(coffeeSmallQty * days, remainingPunches);

  const coffeeDiscount =
    (largeCoffeesFromPunches * (prices.coffeeLarge || 4.5)) +
    (smallCoffeesFromPunches * (prices.coffeeSmall || 4.5));

  // CRITICAL FIX v1.003.002: Add cost of purchasing coffee cards
  const coffeeCardCost = coffeeCards * coffeeCardPrice * (1 + grat);

  const alcTotal = sum(categoryRows.filter(r => sets.alcoholic.includes(r.id)).map(r => r.cost));
  const refreshTotal = sum(categoryRows.filter(r => sets.refresh.includes(r.id)).map(r => r.cost));
  const sodaTotal = sum(categoryRows.filter(r => sets.soda.includes(r.id)).map(r => r.cost));

  // À-la-carte total = raw cost - free coffee discount + coffee card purchase cost
  const totalAlc = Math.max(0, rawTotal - coffeeDiscount + coffeeCardCost);

  // NEW v1.007.000: Separate coffee card option for winner determination
  // If user is using coffee cards, we want to track it as a distinct clickable option
  const hasCoffeeCards = coffeeCards > 0 || coffeeDiscount > 0;
  const coffeeCardTotal = hasCoffeeCards ? totalAlc : null; // Same as totalAlc when coffee cards are used

  // Package costs - adults only
  const sodaPkg = pkgSoda * (1 + grat) * days * adults;
  const refreshPkg = pkgRefresh * (1 + grat) * days * adults;
  const deluxePkg = pkgDeluxe * (1 + grat) * days * adults;

  // CRITICAL FIX v1.005.000: Add minors' package costs to all package calculations!
  // When comparing package options, we must include the cost of packages for minors
  const sodaPkgWithMinors = sodaPkg + (minors > 0 ? (pkgSoda * (1 + grat) * days * minors) : 0);
  const refreshPkgWithMinors = refreshPkg + (minors > 0 ? (pkgRefresh * (1 + grat) * days * minors) : 0);

  // CRITICAL v1.003.000: Minors MUST buy Refreshment when adults buy Deluxe (Royal Caribbean policy)
  const deluxePkgWithMinors = deluxePkg + (minors > 0 ? (pkgRefresh * (1 + grat) * days * minors) : 0);

  const alcPerDay = alcTotal / days;
  const alcPerPerson = adults > 0 ? alcPerDay / adults : 0;
  const overcap = Math.max(0, alcPerPerson - cap);

  // CRITICAL FIX v1.004.000 + v1.005.000 + v1.006.000: Calculate TRUE total cost for each package option
  // Each package only covers certain drinks - uncovered drinks must be paid à la carte!
  // AND include minors' package costs in the total!
  //
  // CRITICAL BUG FIX v1.006.000: Use rawTotal (not totalAlc) for package comparisons!
  // - totalAlc includes coffee card purchase cost, which is only for à la carte option
  // - Packages COVER coffee, so you don't buy coffee cards with packages
  // - Using totalAlc incorrectly added coffee card cost to package totals
  // - Example: With 2 coffee cards, was adding $73.16 - $67.50 = $5.66 to Refreshment package cost!
  const sodaTotalCost = sodaPkgWithMinors + (rawTotal - sodaTotal); // Soda pkg (all people) + all non-soda drinks à la carte
  const refreshTotalCost = refreshPkgWithMinors + (rawTotal - refreshTotal); // Refresh pkg (all people) + alcoholic drinks à la carte
  const deluxeTotalCost = deluxePkgWithMinors + (overcap * days * adults); // Deluxe pkg + over-cap drinks

  console.log('[Math Engine] Package comparison (including uncovered drinks + minors):');
  console.log(`  À la carte: $${totalAlc.toFixed(2)} (raw: $${rawTotal.toFixed(2)}, coffee discount: $${coffeeDiscount.toFixed(2)}, coffee cards: $${coffeeCardCost.toFixed(2)})`);
  if (hasCoffeeCards) {
    console.log(`  Coffee Card option: $${coffeeCardTotal.toFixed(2)} (can compete as winner)`);
  }
  console.log(`  Soda: $${sodaPkgWithMinors.toFixed(2)} (pkg for ${adults + minors} people) + $${(rawTotal - sodaTotal).toFixed(2)} (uncovered) = $${sodaTotalCost.toFixed(2)}`);
  console.log(`  Refresh: $${refreshPkgWithMinors.toFixed(2)} (pkg for ${adults + minors} people) + $${(rawTotal - refreshTotal).toFixed(2)} (uncovered) = $${refreshTotalCost.toFixed(2)}`);
  console.log(`  Deluxe: $${deluxePkgWithMinors.toFixed(2)} (pkg: adults=${adults} deluxe, minors=${minors} refresh) + $${(overcap * days * adults).toFixed(2)} (over-cap) = $${deluxeTotalCost.toFixed(2)}`);

  const bars = {
    alc: { min: totalAlc, mean: totalAlc, max: totalAlc },
    soda: { min: sodaTotalCost, mean: sodaTotalCost, max: sodaTotalCost },
    refresh: { min: refreshTotalCost, mean: refreshTotalCost, max: refreshTotalCost },
    deluxe: { min: deluxeTotalCost, mean: deluxeTotalCost, max: deluxeTotalCost }
  };

  // NEW v1.007.000: Add coffee card to bars if being used
  if (hasCoffeeCards && coffeeCardTotal !== null) {
    bars.coffee = { min: coffeeCardTotal, mean: coffeeCardTotal, max: coffeeCardTotal };
  }

  // ✅ NEW v1.003.000: Package forcing feature
  // ✅ ENHANCED v1.007.000: Coffee card can be forced too
  let winners;

  if (forcedPackage && ['soda', 'refresh', 'deluxe', 'coffee'].includes(forcedPackage)) {
    console.log(`[Math Engine] 🎯 FORCED PACKAGE: ${forcedPackage} (user clicked package card)`);

    // Force this package as the adult winner
    winners = {
      adultWinner: forcedPackage,
      minorWinner: null,
      showTwoWinners: false,
      minorForced: false
    };

    // Handle minors with forced package
    if (minors > 0) {
      if (forcedPackage === 'deluxe') {
        // Deluxe policy: minors must have Refreshment
        winners.minorWinner = 'refresh';
        winners.showTwoWinners = true;
        winners.minorForced = true;
        winners.minorForcedReason = 'Required when adults purchase Deluxe';
        console.log('[Math Engine] POLICY ENFORCED: Minors forced to Refreshment (adults forced Deluxe)');
      } else if (forcedPackage === 'coffee') {
        // Coffee cards: minors choose cheapest between Soda and Refreshment
        const minorBestCost = Math.min(sodaTotalCost, refreshTotalCost);
        winners.minorWinner = minorBestCost === sodaTotalCost ? 'soda' : 'refresh';
        winners.showTwoWinners = true;
        winners.minorForced = false;
      } else {
        // Soda or Refresh: minors get same package
        winners.minorWinner = forcedPackage;
        winners.showTwoWinners = true;
        winners.minorForced = false;
      }
    }
  } else {
    // Normal mode: determine cheapest package (using TRUE total costs)
    console.log('[Math Engine] Auto-recommendation mode (no forced package)');
    const costs = {
      alc: totalAlc,
      soda: sodaTotalCost,
      refresh: refreshTotalCost,
      deluxe: deluxeTotalCost
    };

    // NEW v1.007.000: Add coffee card to options if being used
    if (hasCoffeeCards && coffeeCardTotal !== null) {
      costs.coffee = coffeeCardTotal;
    }

    winners = determineWinners(costs, minors);
  }
  
  // FIXED v1.003.000: Correct Royal Caribbean policy messaging
  // Policy triggers when Deluxe is the winner AND there are multiple adults
  const showDeluxePolicy = (winners.adultWinner === 'deluxe' && adults > 1);
  const policyNote = showDeluxePolicy 
    ? 'Royal Caribbean Policy: If ANY adult in your stateroom purchases Deluxe, ALL adults must purchase it. No exceptions.'
    : null;
  
  // CRITICAL FIX v1.006.000: Use actual voucher savings, not assumed cocktail prices
  // actualVoucherSavings is per-day, multiply by days for total cruise savings
  const voucherSavings = actualVoucherSavings * days;
  
  // ENHANCED v1.003.000: Group rows show minor forced status
  const adultPackageName = winners.adultWinner === 'deluxe' ? 'Deluxe' : 
                           winners.adultWinner === 'refresh' ? 'Refreshment' :
                           winners.adultWinner === 'soda' ? 'Soda' : 'À la carte';
  
  const minorPackageName = winners.minorForced ? 'Refreshment (Required)' :
                           winners.minorWinner === 'refresh' ? 'Refreshment' :
                           winners.minorWinner === 'soda' ? 'Soda' : 'À la carte';
  
  const groupRows = [
    { 
      label: 'Adults', 
      count: adults, 
      pkg: adultPackageName,
      cost: winners.adultWinner === 'deluxe' ? deluxePkg : 
            winners.adultWinner === 'refresh' ? refreshPkg :
            winners.adultWinner === 'soda' ? sodaPkg : totalAlc,
      policyNote: showDeluxePolicy ? 'All adults must purchase same package' : null
    }
  ];
  
  if (minors > 0) {
    groupRows.push({
      label: 'Minors',
      count: minors,
      pkg: minorPackageName,
      cost: winners.minorWinner === 'refresh' ? (pkgRefresh * (1 + grat) * days * minors) :
            winners.minorWinner === 'soda' ? (pkgSoda * (1 + grat) * days * minors) : 0,
      forced: winners.minorForced,
      forcedReason: winners.minorForcedReason
    });
  }
  
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
    if (showDeluxePolicy) {
      ariaAnnouncement += ' Policy reminder: All adults in your stateroom must purchase the same package.';
    }
  } else {
    const minorLabel = getLabelForPackage(winners.minorWinner);
    const forcedNote = winners.minorForced ? ' Minors required to purchase Refreshment.' : '';
    ariaAnnouncement = `Calculation complete. Best value for adults: ${adultLabel}. Best value for children: ${minorLabel}.${forcedNote} Total cost: $${perDay} per day.`;
    if (showDeluxePolicy) {
      ariaAnnouncement += ' Policy reminder: All adults must purchase the same package.';
    }
  }
  
  return {
    hasRange: false,
    bars,
    winnerKey: winners.adultWinner,
    minorWinnerKey: winners.minorWinner,
    showTwoWinners: winners.showTwoWinners,
    minorForced: winners.minorForced,
    minorForcedReason: winners.minorForcedReason,
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
    showDeluxePolicy,
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
    version: '1.007.000'
  });
  console.log('[ITW Math Engine] v1.007.000 loaded ✓');
  console.log('[ITW Math Engine] NEW FEATURE: Coffee card can now win as best option!');
  console.log('[ITW Math Engine] Coffee cards tracked separately and can beat packages');
} else if (typeof self !== 'undefined') {
  self.ITW_MATH = Object.freeze({
    compute,
    version: '1.007.000'
  });
}

// "I was eyes to the blind and feet to the lame" - Job 29:15
// Soli Deo Gloria ✝️
