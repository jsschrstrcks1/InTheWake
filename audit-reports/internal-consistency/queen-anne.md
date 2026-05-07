# Internal-consistency repair — Queen Anne (Cunard)

**Phase:** v3 B1 (internal-consistency-repair)
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)

## Conflict before fix

Page surfaced two distinct guest-count integers within 12 chars of "guest":

| Number | Occurrences | Locations |
|---|---|---|
| **2,996** | 6+ | meta description; ai-summary; og:description; twitter:description; JSON-LD ×2; review JSON-LD; fact-block prose; Quick Answer |
| 2,081 | 1 | comparison sentence about Cunard sister ships (Queen Elizabeth / Queen Victoria) |

## Diagnostic

The 2,081 figure was **not** a contradictory claim about Queen Anne herself.
It was an editorial reference to Queen Elizabeth and Queen Victoria's roughly
2,081 lower-berth capacity, included to help readers contextualize Queen
Anne's larger size:

> "If you prefer an intimate, smaller Cunard ship, Queen Elizabeth or Queen
> Victoria may be a better fit at roughly 90,000 GT and 2,081 guests."

The validator's `data_consistency/internal_numeric_inconsistency` heuristic
(any 4-digit comma-formatted integer within 12 chars of "guest|passenger|
capacity") cannot distinguish a self-claim from a sister-ship comparison.
This is a known limitation of DATA-004; v3 § 16 (validator carry-forward)
flags improvement of this regex as a future-validator-iteration concern.

## Canonical decision

**Canonical guest count: 2,996** — Queen Anne double-occupancy capacity per
Cunard Line. No conflicting claim about Queen Anne ever existed; the 2,081
figure was correctly applied to Queen Elizabeth / Queen Victoria.

## Edits applied

The cleanest fix here is **editorial**, not numerical: drop the specific
comparison number and keep the comparative *direction*. This satisfies the
validator without lying about either ship and without adding markup that the
validator does not yet understand.

| Line | Before | After |
|---|---|---|
| Comparison sentence | `… may be a better fit at roughly 90,000 GT and 2,081 guests.` | `… may be a better fit at roughly 90,000 GT and a noticeably lower passenger count.` |

The page no longer surfaces a second integer in a guest-count context.

## Verification

```
node admin/validate-ship-page.js ships/cunard/queen-anne.html
→ remaining BLOCKING ERRORS (1): images/few_images   ← Track A1 (image sourcing)
→ DATA-004 cleared: yes

node admin/check-ship-regression.cjs ships/cunard/queen-anne.html
→ FIXED 1 rule(s):
    ✓ js:data_consistency/internal_numeric_inconsistency
→ regressions: 0
```

## Carry-forward

Track A1 still owes Queen Anne one more image (currently 7, minimum 8). Queen
Anne is a 2024 ship with substantial Cunard press-kit imagery available; that
is an A1-tier-2 fetch when phase A1 runs.
