# Plan: Fix Math Bugs — Careful Version

## Guiding Principle

Each fix must be:
1. **Prototyped in-memory** (load engine, apply change, verify specific numbers)
2. **Manually verified** (hand-calculate expected output, compare to engine)
3. **Committed alone** (one fix per commit)
4. **Tested against hand-computed baselines** (not just "do tests pass" — tests may be wrong)

---

## Fix Order: Shallowest First

Previous plan said "deepest first." That's wrong. Deepest-first (gratuity) changes every number, making it impossible to verify subsequent fixes against known baselines.

**Correct order: Fix things that DON'T change other numbers first.**

1. **Config fixes** (set coverage, break-even prices) — pure data, no engine change
2. **Sea-day weighting** — isolated function, doesn't interact with package math
3. **Daily limit** — additive (adds cost to deluxe), doesn't change other paths
4. **Minor package policy** — changes one calculation (deluxePkgWithMinors)
5. **Per-adult multiply** — changes qty scale (cascading but predictable)
6. **Gratuity** — changes everything (last, because now we can verify against known-good config + qty + weighting)
7. **UI labels** — cosmetic, after math is stable

---

## Fix 1: Config — Set Coverage (Bug 10)

**What:** Update `sets.soda` for 8 lines to include drinks their packages actually cover.
**File:** `assets/data/calculator-config.json`
**Verification:** Run Carnival with 2 juices/day. Before: juice adds ~$91 to soda cost. After: juice is covered, soda cost drops.
**Risk:** Low. Config-only change.
**Interactions:** None.

Changes:
- Carnival: `sets.soda` → `["soda", "freshjuice"]` (Bubbles covers juice)
- HAL: `sets.soda` already has all 8 NA drinks? Let me verify during execution.
- Each line: verify WHAT the soda package actually covers, add those IDs.

---

## Fix 2: Config — Break-Even Prices (Bug 5)

**What:** Sync `breakEvenDrink.price` with actual `drinks[].price` for each line.
**File:** `assets/data/calculator-config.json`
**Verification:** Comparison table for Carnival shows ~7 cocktails/day (not 8).
**Risk:** Low. Affects display only, not engine math.
**Interactions:** None.

---

## Fix 3: Sea-Day Weighting (Bug 3)

**What:** Normalize `applyWeight` so total consumption = q × D regardless of sea/port split.
**File:** `assets/js/calculator-math-v2.js` function `applyWeight` (lines 185-202)
**Verification:**
- 4 cocktails/day, 7 days, 0 sea days → trip = 4 × $13 × 7 = $364 (Carnival, no grat currently)
- 4 cocktails/day, 7 days, 7 sea days → trip = 4 × $13 × 7 = $364 (same total)
- 4 cocktails/day, 7 days, 3 sea/4 port → trip = $364 (same total)
**Risk:** Medium. Need to verify normalization doesn't produce NaN when seaDays=0 or seaDays=days.
**Interactions:** Does not affect package costs. Only affects rawTotal via qty adjustment.
**Edge cases to test:**
- seaDays = 0, seaApply = true → factor = portFactor × D / D = portFactor. Norm = 1/portFactor. Result: weighted = q. ✓
- seaDays = days → factor = seaFactor. Norm = 1/seaFactor. Result: weighted = q. ✓
- seaWeight = 0 → factor = 1.0, norm = 1.0. No change. ✓

---

## Fix 4: Daily Limit (Bug 4)

**What:** Read `deluxeDailyLimit` from config. If alcoholic drinks/day exceeds it, add excess cost to deluxeTotalCost.
**File:** `assets/js/calculator-math-v2.js` after overcap calculation (after line 660)
**Verification:** 20 cocktails/day on Carnival → 5 excess × $13 × 7 = $455 extra (pre-grat). Deluxe total increases.
**Risk:** Medium. Must not double-count with overcap.
**Interactions:** Only affects deluxeTotalCost. Does not change à la carte.
**Implementation detail:** Excess drinks are charged at their raw price (same as à la carte). The `drinkOvercapTotal` variable already feeds into deluxeTotalCost, so I can add the excess there.
**Important:** If a drink is BOTH over cap AND over daily limit, it should only be penalized once. Need to separate: first cover up to dailyLimit drinks (with cap applied), then excess is fully à la carte.

---

## Fix 5: Minor Package Policy (Bug 9)

**What:** When `minorsForceRefreshment === false`, use soda minor cost (not refresh) in deluxePkgWithMinors.
**File:** `assets/js/calculator-math-v2.js` line 634
**Verification:** Carnival family 2a+2m: deluxe fixed cost should be $1,175 (adults) + $117 (minors Bubbles) = $1,292, not $1,679.
**Risk:** Low. Only changes one line of code.
**Interactions:** `forceMinorsRefresh` is already computed in `determineWinners()` but NOT in `compute()`. Need to read from lineConfig directly.
**Edge case:** Lines with soda priceMid = 0 (Celebrity, Princess): minors get $0 cost. That's correct — fare-included.

---

## Fix 6: Per-Adult Multiply (Bug 1)

**What:** Multiply drink quantities by adults before all calculations.
**File:** `assets/js/calculator-math-v2.js` line 491
**Verification:** 2 adults, 5 cocktails/day (per adult), Carnival: rawTotal = 10 × $13 × 7 = $910.
**Risk:** HIGH. Changes all trip totals for multi-adult scenarios.
**Interactions:**
- Vouchers: `totalVouchersPerDay = adultVouchers × adults`. After Fix 6, `drink.qty = perAdult × adults`. So `min(vouchers, qty) = min(4×2, 5×2) = min(8, 10) = 8`. Correct.
- Coffee: `totalPunchesNeeded = coffeeQty × days`. After Fix 6, coffeeQty is group-level. Correct.
- Overcap: uses `row.qty × days`. After Fix 6, row.qty is group-level. The earlier fix removing `× adults` from overcap IS correct with Fix 6 applied.
- Sea weighting: operates on qty. After Fix 6, operates on group qty. Still preserves total (per Fix 3).
**My earlier overcap fix:** Was correct. No revert needed. Fix 6 makes it fully consistent.

---

## Fix 7: Gratuity on À La Carte (Bug 2)

**What:** Apply `(1 + grat)` to drink costs so à la carte total includes gratuity.
**File:** `assets/js/calculator-math-v2.js` line 563
**Verification:** 1 adult, 8 cocktails/day, Carnival: trip = 8 × $13 × 1.20 × 7 = $873.60. Package = $587.58. Deluxe wins.
**Risk:** HIGH. Changes every output number.
**Interactions that ALSO need fixing:**
- `actualVoucherSavings` (line 543): must multiply by `(1+grat)` because a voucher saves you the with-grat price
- `coffeeDiscount` (lines 596-598): must use prices × `(1+grat)` because a free coffee saves you the with-grat price
- `coffeeCardCost` (line 601): already includes `(1+grat)` ✓ no change
- `included.soda/refresh/deluxe`: derived from sodaTotal/refreshTotal which will now be post-grat ✓ auto-correct
- `perDay` and `trip`: will now show with-grat totals ✓ correct — this is what the user pays
- Bug 7 (chart help text): auto-resolved — "including X% gratuity" becomes truthful
**What I MUST NOT do:** Apply grat twice. Packages already have `(1+grat)`. Drinks now get `(1+grat)`. If I accidentally add grat somewhere that already has it, I'll get double-counting.

---

## Fix 8: UI Labels (Bugs 6 + 8)

**What:** After Fix 7, prices shown in editable fields are PRE-grat. Add "(before X% gratuity)" text. Also show the with-grat total.
**File:** `drink-calculatorv2.html`
**Verification:** Carnival shows "$69.95 (before 20% gratuity). You pay: $83.94/day"
**Risk:** Low. Display only.

---

## Test Strategy (Careful)

**I will NOT blindly update 376 test assertions.** Instead:

For each fix, I will:
1. Pick 3 scenarios (1 simple, 1 moderate, 1 edge case)
2. Hand-calculate the expected output with pen-and-paper math
3. Run the modified engine and compare to my hand calculation
4. If they match: the fix is correct
5. Only THEN update the automated test assertions to match

After all fixes are applied:
6. Run full test suite with UPDATED assertions
7. Run Playwright browser test
8. Spot-check 3 lines (Carnival, RCL, Princess) manually

---

## What I Will NOT Fix Yet

- Bug 11 (sets.deluxe unused) — no wrong output currently
- Bug 12 (intermediate caps) — requires multi-tier architecture redesign
- The user's unfound bug — may surface during fixes; if not, will ask
