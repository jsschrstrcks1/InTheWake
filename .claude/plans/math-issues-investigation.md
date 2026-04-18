# Math Issues Found — Investigation Log

## Status: 3 bugs found, user's bug NOT YET IDENTIFIED

## Bug 1: Per-Adult vs Group-Total Input Mismatch
**Found:** Session 2026-04-18
**Severity:** Major
**Affects:** All 15 lines
**Description:** UI label says "Enter drinks per adult... The calculator will multiply by your group size" (line 1328, 1333, 1336). But the math engine treats qty as group-total and never multiplies by adults. `rawTotal = price × qty × days` (line 563) — no adults multiplier. Package costs DO multiply by adults: `sodaPkg = pkgSoda × (1+grat) × days × adults` (line 616).
**Impact:** For multi-adult cabins, à la carte costs are understated relative to package costs. Makes packages look worse than they are.
**Interaction:** The overcap `× adults` that was removed in the earlier audit may have been correct if qty is meant to be per-adult.

## Bug 2: Gratuity on Packages but Not on À La Carte
**Found:** Session 2026-04-18
**Severity:** Major
**Affects:** RCL (18%), Carnival (20%), NCL (20%), Celebrity (20%), Princess (18%), HAL (18%)
**Not affected:** MSC, Virgin, Costa, Cunard, Oceania, Regent, Seabourn, Silversea, Explora (gratuity=0%)
**Description:** Package costs include gratuity: `pkgDeluxe × (1 + grat)` (line 621). Individual drink costs do NOT: `price × qty × days` (line 563). In the real world, bars charge the same 18-20% gratuity on every individual drink.
**Impact:** À la carte total is understated by 18-20% for affected lines. Example: 8 cocktails/day on RCL shows $784 but real bar tab is $925.

## Bug 3: Sea-Day Weighting Does Not Preserve Total Consumption
**Found:** Session 2026-04-18
**Severity:** Major
**Affects:** All 15 lines (universal `applyWeight` function)
**Description:** Formula `weighted = (q × seaFactor × S + q × portFactor × P) / D` only preserves the entered average when S = P. When port days > sea days (most itineraries), total drinks silently DECREASES. Worst case: 0 sea days with weighting enabled → 20% penalty on total.
**Impact:** Port-heavy itineraries (Caribbean, Alaska, Med) get systematically understated à la carte costs. Sea-day weighting is ON by default.
**Fix concept:** Normalize seaFactor/portFactor so total = q × D regardless of S/P split.

## Bug 4: USER'S BUG — NOT YET FOUND
**Hint:** User found it on the Carnival page specifically. It could apply to all or most lines.
**Investigation status:** In progress.
