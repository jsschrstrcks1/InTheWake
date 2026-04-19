# Math Issues Found — Investigation Log

## Status: 10 bugs found + 11 config mismatches

## Bug 1: Per-Adult vs Group-Total Input Mismatch
**Severity:** Major | **Affects:** All 15 lines
**Description:** UI says "Enter drinks per adult... The calculator will multiply by your group size" (lines 1328-1336). Engine treats qty as group total — never multiplies by adults. `rawTotal = price × qty × days` (line 563).
**Impact:** Multi-adult cabins get understated à la carte costs. Packages look relatively worse.

## Bug 2: Gratuity on Packages but Not on À La Carte
**Severity:** Critical | **Affects:** RCL (18%), Carnival (20%), NCL (20%), Celebrity (20%), Princess (18%), HAL (18%)
**Description:** Package costs include gratuity: `pkgDeluxe × (1 + grat)`. Individual drink costs do NOT. In reality, bars charge the same percentage on every drink.
**Impact:** À la carte understated by 18-20%. On Carnival at 6 cocktails/day, engine says "alc wins" but reality is "CHEERS! saves $67." Winner flips one drink too late on every affected line.
**Carnival proof:** Break-even should be 5.4 cocktails/day (at $15.60 each with grat). Engine shows break-even at 7 (using $13 without grat). The 6-drink user gets wrong advice.

## Bug 3: Sea-Day Weighting Does Not Preserve Total Consumption
**Severity:** Major | **Affects:** All 15 lines
**Description:** `applyWeight` formula changes total trip consumption based on sea/port split. 0 sea days + weighting enabled → 20% penalty. The "average per day" the user entered is not preserved.
**Impact:** Port-heavy itineraries get understated à la carte costs. On by default.

## Bug 4: 15-Drink Daily Limit Not Enforced
**Severity:** Critical | **Affects:** RCL, Carnival, Princess, HAL, MSC (5 lines)
**Description:** `rules.deluxeDailyLimit` is in config but engine never reads it. Someone entering 20 cocktails/day on CHEERS! sees all covered when only 15 are — $546 in uncovered drinks over 7 nights.
**Impact:** Engine over-recommends packages for heavy drinkers by hiding the daily-cap penalty.

## Bug 5: Break-Even Drink Prices Stale / Mismatched
**Severity:** Medium | **Affects:** Carnival, Celebrity, Princess, HAL, Costa, Cunard (6 lines, 11 total mismatches)
**Description:** `packages[].breakEvenDrink.price` doesn't match the actual drink price in `drinks[]`. The comparison table shows wrong break-even counts.
**Impact on Carnival:**
  - Bubbles: shows 6 sodas/day, should be 5
  - Zero Proof: shows 11 coffees/day, should be 9
  - CHEERS!: shows 8 cocktails/day, should be 7
**Impact on Celebrity:** Classic shows 9 cocktails/day, should be 6 (50% overstatement!)
**All affected lines overstate break-even → visitors told they need MORE drinks than reality.**

## Summary of Impact on Carnival Specifically

A Carnival cruiser using the calculator sees:
1. Their à la carte cost WITHOUT the 20% gratuity they'll actually pay at the bar (Bug 2)
2. Break-even stated as "8 cocktails/day" when it's really 5.4 (Bug 5 + Bug 2 compounding)
3. No warning that CHEERS! stops covering after 15 alcoholic drinks/day (Bug 4)
4. Sea-day weighting silently reducing their total drinks if they're on a port-heavy Caribbean itinerary (Bug 3)

All four bugs push in the SAME direction: **making packages look worse than they are.** A visitor who should buy CHEERS! gets told not to. This is the opposite of the site's integrity mission — it's not honest math, it's systematically wrong math that happens to be conservative.

## Bug 6: Double Gratuity Trap on Price Editing
**Severity:** Major | **Affects:** RCL, Carnival, NCL, Celebrity, Princess, HAL (6 lines)
**Description:** Editable price shows pre-gratuity ($69.95 CHEERS!). Cruise websites show with-grat ($83.94). User edits to match → engine adds 20% again = $100.73. Double gratuity.

## Bug 7: Chart Help Text Claims Gratuity Included But It Isn't
**Severity:** Medium | **Affects:** All lines with grat > 0
**Description:** Chart says "including X% gratuity" but alc bar uses rawTotal which has no gratuity.

## Bug 8: Ambiguous Price Labels
**Severity:** Medium | **Affects:** All lines with grat > 0
**Description:** Labels say "per person, per day" but not "before gratuity." Feeds Bug 6.

## Bug 9: deluxePkgWithMinors ALWAYS Adds Refresh Cost for Minors
**Severity:** CRITICAL | **Affects:** 9 of 10 non-luxury lines (all except RCL)
**Found on:** Carnival page, confirmed across all lines
**Description:** Line 634 always adds refreshMinorCost when adults buy deluxe. Only RCL forces this. Other lines let minors buy cheapest (soda at child price or $0).
**Impact:** Princess $1,074, Cunard $756, Celebrity $588, HAL $545, Carnival $387 overcharge per 7-night with 2 minors.
**Root cause:** Built for RCL's force-to-refresh rule. Multi-line generalization missed it.

## Bug 10: Package Set Coverage Doesn't Match Actual Inclusions
**Severity:** Critical | **Affects:** 8 of 10 non-luxury lines
**Found on:** Carnival Bottomless Bubbles (includes juice but soda set = ["soda"] only)
**Description:** The sets.soda array defines which drinks are covered by the soda package. Uncovered drinks are added at a la carte: sodaTotalCost = sodaPkg + (rawTotal - sodaTotal). If a drink IS covered by the real package but NOT in the set, the engine treats it as uncovered and inflates the package cost.
**Carnival example:** Bubbles covers juice but sets.soda=["soda"]. 2 juices/day x $6.50 x 7 = $91 wrongly added.
**Affected:** Carnival (juice), Celebrity (coffee, water), Princess (coffee, water), HAL (juice, coffee, water), MSC (juice, water), Costa (juice, coffee), Cunard (juice, coffee), Oceania (coffee).
**Impact:** Packages consistently look more expensive than they are.
