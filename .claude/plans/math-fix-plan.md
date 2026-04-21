# Plan: Fix All 12 Math Bugs — Careful, Thorough, One at a Time

## Context

12 bugs found in the drink calculator math engine. All bias in the same direction:
making packages look worse than they are. A visitor who should buy a package gets
told not to. This is the opposite of the site's integrity mission.

The fix order matters — some bugs interact. Fix from deepest (engine core) to
shallowest (config data), verifying after each.

---

## Phase 1: Engine Core Fixes (calculator-math-v2.js)

### Fix 1: Bug 2 — Add gratuity to à la carte drinks
**File:** `assets/js/calculator-math-v2.js` line 563
**Change:** `const cost = price * qty * days` → `const cost = price * qty * days * (1 + grat)`
**Why first:** This is the deepest bug. Every other calculation derives from rawTotal. Fixing this changes every output number. Must fix first so subsequent fixes are verified against correct baselines.
**Verify:** 1 adult, 8 cocktails/day, Carnival. Engine should show ~$764 à la carte (not $637). Break-even should shift to ~6 drinks.
**Risk:** This changes the meaning of `trip` and `perDay` — they now include gratuity. Check that the chart help text ("including X% gratuity") becomes CORRECT instead of a lie.
**Interaction with Bug 7:** After this fix, Bug 7 is automatically resolved (chart text will be truthful).

### Fix 2: Bug 4 — Enforce 15-drink daily limit
**File:** `assets/js/calculator-math-v2.js` after line 660 (after overcap calc)
**Change:** Read `lineConfig?.rules?.deluxeDailyLimit`. If set and total alcoholic drinks/day exceeds it, compute excess cost:
```
const dailyLimit = lineConfig?.rules?.deluxeDailyLimit || null;
if (dailyLimit && dailyLimit > 0) {
  const alcDrinksPerDay = categoryRows
    .filter(r => sets.alcoholic.includes(r.id))
    .reduce((sum, r) => sum + r.qty, 0);
  if (alcDrinksPerDay > dailyLimit) {
    const excessQty = alcDrinksPerDay - dailyLimit;
    // Excess drinks paid at average alcoholic drink price × (1+grat) × days
    const avgAlcPrice = alcTotal > 0
      ? alcTotal / (alcDrinksPerDay * days)  // per-drink cost already includes grat after Fix 1
      : 0;
    drinkOvercapTotal += excessQty * avgAlcPrice * days;  // adds to deluxe cost
  }
}
```
**Verify:** 20 cocktails/day on Carnival → should show 5 uncovered at ~$15.60 each = $78/day extra.
**Note:** This uses average price for excess drinks. A more precise approach would use the cheapest drinks first (maximizing coverage) but average is simpler and defensible.

### Fix 3: Bug 9 — Use correct minor package based on line policy
**File:** `assets/js/calculator-math-v2.js` line 634
**Change:** Replace hardcoded `refreshMinorCost` with conditional:
```
// Determine what minors actually pay when adults buy deluxe
const forceMinorsRefresh = lineConfig?.rules?.minorsForceRefreshment !== false;
const minorDeluxeCost = forceMinorsRefresh
  ? refreshMinorCost  // RCL: minors forced to Refreshment
  : sodaMinorCost;    // Other lines: minors buy cheapest (soda/child)
const deluxePkgWithMinors = deluxePkg + minorDeluxeCost;
```
**Verify:** Carnival family (2a+2m, 7 days): minor cost should use $6.95 Bubbles, not $29.99 Zero Proof. Total should drop by ~$387.
**Note:** This uses the existing `forceMinorsRefresh` variable already computed at line 378 in `determineWinners`. But that's in a different function. Need to compute it in `compute()` too, or read from lineConfig directly.

### Fix 4: Bug 3 — Preserve total consumption in sea-day weighting
**File:** `assets/js/calculator-math-v2.js` function `applyWeight` (line 185-202)
**Change:** Normalize factors so total = q × D:
```
function applyWeight(list, days, seaDays, seaApply, seaWeight) {
  if (!seaApply) return list;
  const D = clamp(days, 0, 365);
  const S = clamp(seaDays, 0, D);
  if (D <= 0) return list;

  const w = clamp(seaWeight, 0, 40) / 100;
  const seaFactor = 1 + w;
  const portFactor = 1 - w;
  const portDays = Math.max(0, D - S);

  // Normalize so total consumption is preserved (q × D stays constant)
  const rawFactor = (seaFactor * S + portFactor * portDays) / D;
  const normSea = rawFactor > 0 ? seaFactor / rawFactor : 1;
  const normPort = rawFactor > 0 ? portFactor / rawFactor : 1;

  return list.map(([id, qty]) => {
    const q = toNum(qty);
    const weighted = ((q * normSea * S) + (q * normPort * portDays)) / D;
    return [id, safe(weighted)];
  });
}
```
**Verify:** 4 cocktails/day, 7 days, any sea/port split → trip total should always = 4 × $price × 7 × (1+grat). The split only redistributes WHEN drinking happens, not HOW MUCH.
**Note:** Edge case — if seaDays = 0 and seaApply is true, normPort = 1.0 (no change). No more 20% penalty.

### Fix 5: Bug 1 — Multiply drink quantities by adults
**File:** `assets/js/calculator-math-v2.js` line 491 (after drinkList is created)
**Change:** Scale quantities by adults count BEFORE weighting:
```
const drinkList = Object.keys(inputs.drinks || {}).map(key => [key, toNum(inputs.drinks[key]) * adults]);
```
**Why after other fixes:** This changes the entire scale of rawTotal. Must be verified against the already-fixed gratuity and sea-weighting to avoid compounding errors.
**Verify:** 2 adults, 5 cocktails/day (per adult), Carnival → rawTotal should be 10 × $13 × 1.20 × 7 = $1,092. Package = $587.58. Deluxe wins.
**Interaction:** The overcap fix I previously made (removing × adults) was correct IF this fix is applied (qty is now group-level after multiplication). The two fixes work together.
**UI label:** Already says "per adult" — no HTML change needed.

---

## Phase 2: Config Data Fixes (calculator-config.json)

### Fix 6: Bug 10 — Correct set coverage for all 8 affected lines
**File:** `assets/data/calculator-config.json`
**Changes:**
- Carnival: `sets.soda` → `["soda", "freshjuice"]`
- Celebrity: `sets.soda` → `["soda", "freshjuice", "coffee", "teaprem", "mocktail", "energy", "milkshake", "bottledwater"]` (fare-included covers all basic)
- Princess: `sets.soda` → `["soda", "freshjuice", "coffee", "teaprem", "mocktail", "energy", "milkshake", "bottledwater"]` (fare-included)
- HAL: `sets.soda` → `["soda", "freshjuice", "coffee", "teaprem", "mocktail", "energy", "milkshake", "bottledwater"]` (Quench covers all NA)
- MSC: `sets.soda` → `["soda", "freshjuice", "bottledwater"]`
- Costa: `sets.soda` → `["soda", "freshjuice", "coffee", "bottledwater"]`
- Cunard: `sets.soda` → `["soda", "freshjuice", "coffee", "bottledwater"]`
- Oceania: `sets.soda` → add `"coffee"` to existing
**Verify:** Carnival with 2 juices/day → soda package cost should NOT include $91 in juice.

### Fix 7: Bug 5 — Sync breakEvenDrink.price with actual drink prices
**File:** `assets/data/calculator-config.json`
**Changes:** For each line, set `breakEvenDrink.price` = the actual price from the `drinks[]` array for that drink ID.
- Carnival soda: $2.75 → $3.00
- Carnival refresh: $3.50 → $4.25
- Carnival deluxe: $11.00 → $13.00
- Celebrity deluxe: $10.00 → $15.00
- Princess deluxe: $12.00 → $13.00
- HAL deluxe: $13.00 → $11.00
- Costa soda: $4.00 → $3.50 (teaprem→coffee corrected)
- Costa refresh: $6.00 → $9.30 (cocktail)
- Costa deluxe: $10.00 → $9.30
- Cunard soda: $4.00 → $4.50
- Cunard deluxe: $14.00 → $13.00
**Verify:** Comparison table shows correct break-even numbers. Carnival CHEERS! should show ~6 (not 8).

---

## Phase 3: UI/Display Fixes

### Fix 8: Bug 6 + Bug 8 — Label prices as "before gratuity"
**File:** `drink-calculatorv2.html` lines 1603, 1613, 1623
**Change:** Replace "per person, per day" with "per person, per day (before X% gratuity)" where X is dynamically rendered from config. Add inline helper text near editable prices explaining the basis.
**Also:** Update `updatePackageCards()` to render the with-grat total underneath: "Total with gratuity: $X.XX/day"

### Fix 9: Bug 7 — Chart help text (auto-resolved by Fix 1)
After Fix 1, the à la carte bar DOES include gratuity, so "including X% gratuity" becomes truthful. No separate fix needed — just verify.

---

## Phase 4: Verification

After ALL fixes:
1. `node scripts/test-math-engine.js` — will need test updates (expected values change)
2. `node scripts/test-personas-calculator.js` — trip totals will change (gratuity now included)
3. `node scripts/test-edge-cases.js` — re-verify all 46 assertions
4. `node scripts/test-ui-browser.js` — verify display
5. Manual spot-check: Carnival 8 cocktails/day → break-even should be ~6 not 8
6. Manual: RCL 2 adults, 5 cocktails each → package should win at higher consumption
7. Manual: 0 sea days with weighting → total unchanged
8. Manual: Carnival family 2a+2m → minors charged Bubbles not Zero Proof

---

## Execution Order (CAREFUL — one at a time)

1. Fix 1 (gratuity) → run tests, note expected failures, update test baselines
2. Fix 2 (daily limit) → run tests
3. Fix 3 (minor package) → run tests
4. Fix 4 (sea weighting) → run tests
5. Fix 5 (per-adult multiply) → run tests, major baseline shift expected
6. Fix 6 (set coverage) → run tests
7. Fix 7 (break-even prices) → run tests
8. Fix 8 (price labels) → browser test
9. Final full-suite verification
10. Commit with detailed message

Each fix gets its own commit. No batching. Verify before moving to next.

---

## Bugs NOT Fixed in This Plan (deferred)

- **Bug 11** (sets.deluxe unused): Architecture gap, not causing wrong output currently
- **Bug 12** (intermediate caps): Requires engine redesign for multi-tier overcap. Deferred to Phase 2 of multi-line architecture.
- **User's unfound bug**: Still investigating. May surface during fixes.

---

## Risk Assessment

**Fix 1 is the riskiest** — it changes EVERY number the engine produces. All tests will fail initially. Must update 124+ test assertions. But it's also the most impactful: 18-20% systematic error on 6 lines.

**Fix 5 is the second riskiest** — doubles raw totals for multi-adult cabins. Combined with Fix 1, the numbers change dramatically. Must be very careful about the interaction with overcap (my earlier fix removing × adults becomes correct AFTER Fix 5 is applied).

**Fix 4 has an edge case** — when seaDays = days (all sea) and weight = 0, normalization must not divide by zero. Guard with `rawFactor > 0` check.
