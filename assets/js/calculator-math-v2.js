/**
 * Drink Calculator v2 - Math Engine (Config-Driven)
 * Version: 2.000.000 (Multi-Cruise-Line Architecture)
 * Based on: v1.009.000 (Overcap Calculation Fix)
 *
 * "I was eyes to the blind and feet to the lame" - Job 29:15
 * "The fear of the LORD is the beginning of wisdom" - Proverbs 9:10
 *
 * Soli Deo Gloria ✝️
 *
 * ═══════════════════════════════════════════════════════════════
 * v2 ARCHITECTURE: CONFIG-DRIVEN MULTI-CRUISE-LINE SUPPORT
 * ═══════════════════════════════════════════════════════════════
 *
 * This file is a DUPLICATE of calculator-math.js with targeted
 * modifications to support multiple cruise lines via config.
 * The original v1 file is UNTOUCHED.
 *
 * v2 CHANGES (3 surgical modifications):
 *
 * 1. SIGNATURE: compute() accepts 6th parameter `lineConfig`
 *    - function compute(..., lineConfig = null)
 *    - Defaults to null — fully backward-compatible with v1 callers
 *    - lineConfig is the active cruise line object from calculator-config.json
 *    - Search for: "function compute" to find the signature
 *
 * 2. COFFEE CARD PUNCHES: Config-driven instead of hardcoded
 *    - COFFEE_CARD_PUNCHES = lineConfig?.coffeeCard?.punches || 15
 *    - Was: const COFFEE_CARD_PUNCHES = 15 (RCL-specific)
 *    - Now: reads from config, falls back to 15 if config unavailable
 *    - Enables lines with different punch counts (e.g., Carnival has no coffee card)
 *    - Search for: "COFFEE_CARD_PUNCHES" to find the change
 *
 * 3. VOUCHER MAX PER DAY: Config-driven instead of hardcoded 6
 *    - voucherMaxPerDay derived from lineConfig.loyalty.tiers
 *    - Was: clamp(vouchers, 0, 6) — hardcoded for RCL Pinnacle
 *    - Now: reads max vouchersPerDay from all tiers, falls back to 6
 *    - adultVouchers/minorVouchers use voucherMaxPerDay instead of literal 6
 *    - Enables lines with different loyalty tier structures
 *    - Search for: "voucherMaxPerDay" to find the change
 *
 * WHAT DID NOT CHANGE:
 * - All v1 math logic is identical (overcap, break-even, package comparison)
 * - adaptDataset() unchanged — still reads from dataset parameter
 * - All drink price calculations unchanged
 * - All package cost formulas unchanged
 * - Export interface unchanged (window.ITW_MATH.compute)
 *
 * DATA FLOW:
 *   calculator-v2.js calls compute(inputs, economics, dataset, vouchers, forcedPkg, lineConfig)
 *                                                                         ^^^^^^^^^^
 *                                                               NEW: from window.ITW_LINE_CONFIG
 *
 * ═══════════════════════════════════════════════════════════════
 * ORIGINAL v1 CHANGELOG (preserved for reference):
 * ═══════════════════════════════════════════════════════════════
 *
 * CHANGELOG v1.009.000:
 * ✅ CRITICAL BUG FIX: Deluxe package overcap was calculated completely wrong!
 *    - OLD (WRONG): overcap = (total_daily_alc_spend / adults) - $14
 *      This treated $14 as a per-DAY cap, not per-DRINK cap!
 *      With 4444 cocktails at $13: overcap = $57,772 - $14 = $57,758 (INSANE!)
 *    - NEW (CORRECT): overcap = sum of (drink_price - $14) for drinks where price > $14
 *      With 4444 cocktails at $13: overcap = $0 (all drinks under $14 cap!)
 *    - This bug caused Deluxe to show hundreds of thousands of dollars
 *    - Now correctly: cocktails at $13 are FULLY COVERED, $0 extra charge
 *    - Premium drinks over $14 (like $18 whiskey) correctly charge the $4 difference
 *
 * CHANGELOG v1.008.000:
 * ✅ FEATURE: Added packageBreakdown to results for transparent cost display
 *    - Each package now exposes: fixedCost, uncoveredCost, total, dailyRate, days, people
 *    - UI can show: "Package: $X (fixed) + Uncovered: $Y = Total: $Z"
 *    - Clarifies that package price is FIXED, only uncovered drinks add to cost
 *    - Example: Soda Package = $181.55 (fixed) + $119 beer (uncovered) = $300.55
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
  const gratuity = Number.isFinite(rules.gratuity) ? rules.gratuity : 0.20; // RT-10 FIX: 0.18→0.20
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
// v2: Accept lineConfig to check minorsForceRefreshment policy
function determineWinners(costs, minors, lineConfig) {
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

  // CRITICAL FIX: If adults choose Deluxe AND line enforces minorsForceRefreshment
  // v2 FIX (EC-23): Read policy from config instead of hardcoding (Carnival = false)
  const forceMinorsRefresh = lineConfig?.rules?.minorsForceRefreshment !== false; // default true for backward compat
  if (adultWinner.key === 'deluxe' && forceMinorsRefresh) {
    console.log('[Math Engine] POLICY ENFORCED: Minors forced to Refreshment (adults buying Deluxe)');
    return {
      adultWinner: 'deluxe',
      minorWinner: 'refresh',
      showTwoWinners: true,
      minorForced: true,
      minorForcedReason: 'Required when adults purchase ' + (lineConfig?.packages?.deluxe?.shortName || 'Deluxe')
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
 * @param {object} lineConfig - v2: Cruise line config from calculator-config.json
 */
function compute(inputs, economics, dataset, vouchers = null, forcedPackage = null, lineConfig = null) {
  const { prices, sets, gratuity, deluxeCap } = adaptDataset(dataset);

  const days = clamp(inputs.days, 1, 365);
  const seaDays = clamp(inputs.seaDays, 0, days);
  const seaApply = Boolean(inputs.seaApply);
  const seaWeight = clamp(inputs.seaWeight, 0, 40);
  const adults = clamp(inputs.adults, 1, 20);
  const minors = clamp(inputs.minors, 0, 20);
  const coffeeCards = clamp(inputs.coffeeCards || 0, 0, 10);
  const coffeePunches = clamp(inputs.coffeePunches || 0, 0, 5);

  // v2.1 NEW INPUTS (optional, backward-compatible):
  // - freeAtSeaMode: NCL Free-at-Sea toggle. When true and lineConfig.freeAtSea.available,
  //   the deluxe package cost becomes the flat service charge per person per day, not
  //   priceMid × (1+grat). Acknowledged simplification: applies to all adults; NCL's
  //   real rule limits Free-at-Sea to guests 1–2. Surfaced via appliedPolicies warning.
  // - bookingDate: ISO date string (YYYY-MM-DD). Used to grandfather policies with an
  //   effectiveDate: if bookingDate is strictly before the policy's effectiveDate,
  //   that policy is marked grandfathered and does not apply in the returned
  //   appliedPolicies array. No direct math impact (policies are advisory).
  const freeAtSeaMode = Boolean(inputs.freeAtSeaMode);
  const bookingDate = typeof inputs.bookingDate === 'string' ? inputs.bookingDate : null;

  // v2 FIX: Use ?? instead of || so 0 is a valid price (defensive for future lines)
  const pkgSoda = toNum(economics.pkg?.soda ?? 10.99);
  const pkgRefresh = toNum(economics.pkg?.refresh ?? 34.0);
  const pkgDeluxe = toNum(economics.pkg?.deluxe ?? 85.0);
  // v2 FIX: Use ?? instead of || so that 0 is valid (Carnival has no coffee card, price=0)
  const coffeeCardPrice = toNum(economics.pkg?.coffee ?? 31.0);
  const grat = toNum(economics.grat ?? gratuity);
  const cap = toNum(economics.deluxeCap ?? deluxeCap);

  // v2.1 NEW: child pricing for soda/refresh packages (e.g., Carnival Bottomless Bubbles $6.95/kid).
  // Fallback: use adult price when no child price configured.
  const pkgSodaChild = toNum(lineConfig?.packages?.soda?.childPriceMid ?? pkgSoda);
  const pkgRefreshChild = toNum(lineConfig?.packages?.refreshment?.childPriceMid ?? pkgRefresh);

  // v2.1 NEW: Free-at-Sea flat service charge (NCL). Only used when freeAtSeaMode is on
  // AND the active line advertises availability via lineConfig.freeAtSea.
  const freeAtSea = lineConfig?.freeAtSea;
  const freeAtSeaActive = freeAtSeaMode && freeAtSea?.available === true && toNum(freeAtSea.serviceChargePerDay) > 0;
  const freeAtSeaDaily = freeAtSeaActive ? toNum(freeAtSea.serviceChargePerDay) : 0;

  const drinkList = Object.keys(inputs.drinks || {}).map(key => [key, toNum(inputs.drinks[key])]);
  const weighted = applyWeight(drinkList, days, seaDays, seaApply, seaWeight);

  // CRITICAL FIX v1.006.000: Voucher application - most expensive drinks first!
  // v2: Max vouchers per day from line config (RCL Pinnacle = 6)
  // FIX: Guard against empty tiers array (Math.max(...[]) = -Infinity)
  const tierVouchers = (lineConfig?.loyalty?.tiers || []).map(t => t.vouchersPerDay || 0);
  const voucherMaxPerDay = tierVouchers.length > 0 ? Math.max(...tierVouchers) : 6;
  let totalVouchersPerDay = 0;
  let actualVoucherSavings = 0; // Track actual savings for accurate reporting

  if (vouchers && vouchers.perVoucherValue > 0) {
    const adultVouchers = clamp(vouchers.adultCountPerDay || 0, 0, voucherMaxPerDay);
    const minorVouchers = clamp(vouchers.minorCountPerDay || 0, 0, voucherMaxPerDay);
    totalVouchersPerDay = (adultVouchers * adults) + (minorVouchers * minors);

    if (adultVouchers === 6 || minorVouchers === 6) {
      console.log('[Math Engine] Pinnacle vouchers detected (6/day)');
    }
  }

  let adjustedWeighted = weighted;

  if (totalVouchersPerDay > 0) {
    // CRITICAL FIX: Apply vouchers to MOST EXPENSIVE drinks first (up to deluxe cap)
    // Vouchers only work on drinks ≤ cap (RCL $14, Carnival $20, etc.)

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
  // v2: Coffee card punches from line config (RCL = 15, other lines may differ)
  // v2 FIX: Use ?? so 0 is valid (disabled coffee card = 0 punches, not fallback 15)
  const COFFEE_CARD_PUNCHES = lineConfig?.coffeeCard?.punches ?? 15;
  const coffeeSmallQty = categoryRows.find(r => r.id === 'coffeeSmall')?.qty || 0;
  const coffeeLargeQty = categoryRows.find(r => r.id === 'coffeeLarge')?.qty || 0;

  // Total punches needed = (small × 1) + (large × 2)
  const totalPunchesNeeded = (coffeeSmallQty * 1 + coffeeLargeQty * 2) * days;

  // Calculate how many cards are actually used (can't use more cards than you bought)
  // v2 FIX: Guard against division by zero when coffee card is disabled (0 punches)
  const cardsUsed = COFFEE_CARD_PUNCHES > 0
    ? Math.min(coffeeCards, Math.floor(totalPunchesNeeded / COFFEE_CARD_PUNCHES))
    : 0;

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
  // v2.1: Deluxe adult cost uses Free-at-Sea flat rate when active, else standard priceMid+gratuity.
  const deluxePkg = freeAtSeaActive
    ? freeAtSeaDaily * days * adults
    : pkgDeluxe * (1 + grat) * days * adults;

  // CRITICAL FIX v1.005.000: Add minors' package costs to all package calculations!
  // v2.1: Use child price (if configured) for minors on soda/refresh packages.
  const sodaMinorCost = minors > 0 ? (pkgSodaChild * (1 + grat) * days * minors) : 0;
  const refreshMinorCost = minors > 0 ? (pkgRefreshChild * (1 + grat) * days * minors) : 0;
  const sodaPkgWithMinors = sodaPkg + sodaMinorCost;
  const refreshPkgWithMinors = refreshPkg + refreshMinorCost;

  // CRITICAL v1.003.000: Minors MUST buy Refreshment when adults buy Deluxe (Royal Caribbean policy)
  // v2.1: When Free-at-Sea is active, minors use their existing soda/refresh billing (unchanged).
  const deluxePkgWithMinors = deluxePkg + refreshMinorCost;

  // CRITICAL FIX v1.009.000: Calculate overcap correctly per-drink, not per-day total!
  // The $14 deluxe cap applies to INDIVIDUAL drinks, not daily totals!
  // - Cocktail at $13 → fully covered by deluxe, $0 out of pocket
  // - Premium whiskey at $18 → $4 out of pocket (18 - 14)
  //
  // OLD BUG: overcap = (total_daily_alc_spend / adults) - $14
  //   With 4444 cocktails at $13: overcap = $57,772 - $14 = $57,758 (WRONG!)
  //   This made deluxe package cost $57,858 instead of ~$105
  //
  // NEW FIX: overcap = sum of (drink_price - $14) for drinks where price > $14
  //   With 4444 cocktails at $13: overcap = $0 (all drinks under cap!)
  let drinkOvercapTotal = 0;
  for (const row of categoryRows) {
    if (sets.alcoholic.includes(row.id) && row.price > cap) {
      // row.qty is drinks per adult per day, row.price is per-drink price
      // Excess per drink = price - cap ($14)
      // Total excess = excess_per_drink × qty × days × adults
      const perDrinkExcess = row.price - cap;
      drinkOvercapTotal += perDrinkExcess * row.qty * days * adults;
    }
  }

  // For backwards compatibility, keep overcap as per-person per-day value for display
  const overcap = drinkOvercapTotal > 0 ? round2(drinkOvercapTotal / (days * adults)) : 0;

  // CRITICAL FIX v1.004.000 + v1.005.000 + v1.006.000: Calculate TRUE total cost for each package option
  // Each package only covers certain drinks - uncovered drinks must be paid à la carte!
  // AND include minors' package costs in the total!
  //
  // CRITICAL BUG FIX v1.006.000: Use rawTotal (not totalAlc) for package comparisons!
  // - totalAlc includes coffee card purchase cost, which is only for à la carte option
  // - Packages COVER coffee, so you don't buy coffee cards with packages
  // - Using totalAlc incorrectly added coffee card cost to package totals
  const sodaTotalCost = sodaPkgWithMinors + (rawTotal - sodaTotal); // Soda pkg (all people) + all non-soda drinks à la carte
  const refreshTotalCost = refreshPkgWithMinors + (rawTotal - refreshTotal); // Refresh pkg (all people) + alcoholic drinks à la carte
  const deluxeTotalCost = deluxePkgWithMinors + drinkOvercapTotal; // Deluxe pkg + over-cap drinks (FIXED v1.009.000)

  console.log('[Math Engine] Package comparison (including uncovered drinks + minors):');
  console.log(`  À la carte: $${totalAlc.toFixed(2)} (raw: $${rawTotal.toFixed(2)}, coffee discount: $${coffeeDiscount.toFixed(2)}, coffee cards: $${coffeeCardCost.toFixed(2)})`);
  if (hasCoffeeCards) {
    console.log(`  Coffee Card option: $${coffeeCardTotal.toFixed(2)} (can compete as winner)`);
  }
  console.log(`  Soda: $${sodaPkgWithMinors.toFixed(2)} (pkg for ${adults + minors} people) + $${(rawTotal - sodaTotal).toFixed(2)} (uncovered) = $${sodaTotalCost.toFixed(2)}`);
  console.log(`  Refresh: $${refreshPkgWithMinors.toFixed(2)} (pkg for ${adults + minors} people) + $${(rawTotal - refreshTotal).toFixed(2)} (uncovered) = $${refreshTotalCost.toFixed(2)}`);
  console.log(`  Deluxe: $${deluxePkgWithMinors.toFixed(2)} (pkg: adults=${adults} deluxe, minors=${minors} refresh) + $${drinkOvercapTotal.toFixed(2)} (over-cap) = $${deluxeTotalCost.toFixed(2)}`);

  // NEW v1.008.000: Package cost breakdown for transparent display
  // Shows: Fixed Package Cost + Uncovered Drinks = Total
  const packageBreakdown = {
    soda: {
      fixedCost: sodaPkgWithMinors,
      uncoveredCost: rawTotal - sodaTotal,
      total: sodaTotalCost,
      dailyRate: pkgSoda,
      days: days,
      people: adults + minors
    },
    refresh: {
      fixedCost: refreshPkgWithMinors,
      uncoveredCost: rawTotal - refreshTotal,
      total: refreshTotalCost,
      dailyRate: pkgRefresh,
      days: days,
      people: adults + minors
    },
    deluxe: {
      fixedCost: deluxePkgWithMinors,
      uncoveredCost: drinkOvercapTotal, // FIXED v1.009.000: Use correct per-drink overcap
      total: deluxeTotalCost,
      dailyRate: pkgDeluxe,
      days: days,
      people: adults + minors
    }
  };

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
      if (forcedPackage === 'deluxe' && (lineConfig?.rules?.minorsForceRefreshment !== false)) {
        // v2 FIX (EC-23): Only force minors to Refreshment if policy requires it
        winners.minorWinner = 'refresh';
        winners.showTwoWinners = true;
        winners.minorForced = true;
        winners.minorForcedReason = 'Required when adults purchase ' + (lineConfig?.packages?.deluxe?.shortName || 'Deluxe');
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

    winners = determineWinners(costs, minors, lineConfig);
  }

  // FIXED v1.003.000: Correct Royal Caribbean policy messaging
  // Policy triggers when Deluxe is the winner AND there are multiple adults
  const showDeluxePolicy = (winners.adultWinner === 'deluxe' && adults > 1);
  // RT-6 FIX: Use config names instead of hardcoded "Royal Caribbean"
  const lineName = lineConfig?.name || 'Cruise Line';
  const pkgNames = {
    deluxe: lineConfig?.packages?.deluxe?.shortName || 'Deluxe',
    refresh: lineConfig?.packages?.refreshment?.shortName || 'Refreshment',
    soda: lineConfig?.packages?.soda?.shortName || 'Soda',
    coffee: 'Coffee Card',
    alc: 'À la carte'
  };
  const getLabelForPkg = (key) => pkgNames[key] || key;

  const policyNote = showDeluxePolicy
    ? lineName + ' Policy: If ANY adult in your stateroom purchases ' + pkgNames.deluxe + ', ALL adults must purchase it. No exceptions.'
    : null;

  const voucherSavings = actualVoucherSavings * days;

  // RT-7 FIX: Config-driven package names in results
  const adultPackageName = getLabelForPkg(winners.adultWinner);

  const minorPackageName = winners.minorForced ? pkgNames.refresh + ' (Required)' :
    winners.minorWinner === 'refresh' ? pkgNames.refresh :
      getLabelForPkg(winners.minorWinner);

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

  // RT-7 FIX: Config-driven package labels for results, aria, groupRows
  const getLabelForPackage = (key) => {
    const labels = {
      alc: 'À la carte',
      soda: (lineConfig?.packages?.soda?.name || 'Soda') + ' Package',
      refresh: (lineConfig?.packages?.refreshment?.name || 'Refreshment') + ' Package',
      deluxe: (lineConfig?.packages?.deluxe?.name || 'Deluxe') + ' Package',
      coffee: lineConfig?.coffeeCard?.name || 'Coffee Card'
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

  // v2.1 NEW: appliedPolicies — compute which line-config policies are in effect for
  // this booking. A policy with an effectiveDate is considered grandfathered (effective:
  // false) if the provided bookingDate is strictly before it. Used by the UI to toggle
  // "your package still includes X" messaging for pre-cutoff bookings (e.g., RCL's
  // March 15, 2026 Coca-Cola Freestyle removal).
  const appliedPolicies = (lineConfig?.policies || []).map(p => {
    if (!p.effectiveDate || !bookingDate) {
      return { id: p.id, severity: p.severity, title: p.title, effective: true, grandfathered: false };
    }
    const grandfathered = bookingDate < p.effectiveDate;
    return {
      id: p.id,
      severity: p.severity,
      title: p.title,
      effectiveDate: p.effectiveDate,
      effective: !grandfathered,
      grandfathered
    };
  });

  return {
    hasRange: false,
    bars,
    packageBreakdown, // NEW v1.008.000: Fixed cost + uncovered drinks breakdown
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
    // v2.1 new fields
    freeAtSeaActive,
    freeAtSeaDaily: round2(freeAtSeaDaily),
    appliedPolicies,
    ariaAnnouncement
  };
}

/* ==================== EXPORTS ==================== */

if (typeof window !== 'undefined') {
  window.ITW_MATH = Object.freeze({
    compute,
    version: '2.001.000'
  });



} else if (typeof self !== 'undefined') {
  self.ITW_MATH = Object.freeze({
    compute,
    version: '2.001.000'
  });
}

// "I was eyes to the blind and feet to the lame" - Job 29:15
// Soli Deo Gloria ✝️
