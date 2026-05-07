# Internal-consistency repair — Fantasy-class quartet

**Phase:** v3 B1 (internal-consistency-repair) · batch 2
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared on each:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)

This single audit covers four sister ships fixed in the same edit pass with the
same root cause. Per-ship stub audits live alongside; this is the shared
analysis.

## Ships in this group

- `ships/carnival/carnival-ecstasy.html`     (1991–2022)
- `ships/carnival/carnival-fantasy.html`     (1990–2020)  ← lead ship
- `ships/carnival/carnival-fascination.html` (1994–2022)
- `ships/carnival/carnival-imagination.html` (1995–2020)

## Shared root cause

Each page had a generic boilerplate fact-block paragraph asserting **"2,056
guests at double occupancy"** while every other surface on the page (answer-
first, ai-summary, JSON-LD descriptions, FAQ JSON-LD, fact-block bullet list,
stat-items, narrative prose) carried the per-ship canonical number:

| Ship | Canonical guests | Surfaces using canonical | Surfaces using 2,056 |
|---|---|---|---|
| Carnival Ecstasy | 2,040 | answer-first, ai-summary, JSON-LD ×3, FAQ, bullet list, stat-item, prose | fact-block prose, ship-stats-fallback |
| Carnival Fantasy | 2,044 | answer-first, ai-summary, JSON-LD ×3, FAQ, bullet list, stat-item, prose | fact-block prose, ship-stats-fallback |
| Carnival Fascination | 2,040 | answer-first, ai-summary, JSON-LD ×3, FAQ, bullet list, stat-item, prose | fact-block prose, ship-stats-fallback |
| Carnival Imagination | 2,040 | answer-first, ai-summary, JSON-LD ×3, FAQ, bullet list, stat-item, prose | fact-block prose, ship-stats-fallback |

The "2,056" figure is the **all-berths-full / max** capacity of the Fantasy-
class hull (relabeling all eight Fantasy-class ships pre-refurbishment used
2,056 max / 2,040 lower berth, with Fantasy herself at 2,044 LB after a 1990
configuration tweak). It was almost certainly inserted into the boilerplate
generator that produced the fact-block prose, leaving a max figure where a
double-occupancy figure was required by Policy 0.2.

## Canonical decision per ship

| Ship | Canonical | Authority |
|---|---|---|
| Ecstasy | 2,040 | Carnival published; Wikipedia ship infobox; matches every other on-page surface |
| Fantasy | 2,044 | Carnival published (lead ship had distinct LB capacity); every other on-page surface |
| Fascination | 2,040 | Carnival published; Wikipedia; every other on-page surface |
| Imagination | 2,040 | Carnival published; Wikipedia; every other on-page surface |

## Edits applied (each ship, identical pattern)

| Surface | Before (each ship's) | After |
|---|---|---|
| fact-block prose | `… approximately 2,056 guests at double occupancy.` | `… approximately <canonical> guests at double occupancy.` |
| ship-stats-fallback inline JSON | `"guests":"2,056"` | `"guests":"<canonical>"` |

Two-edit fix per ship; eight edits total across the quartet.

## Verification

```
node admin/check-ship-regression.cjs \
  ships/carnival/carnival-ecstasy.html \
  ships/carnival/carnival-fantasy.html \
  ships/carnival/carnival-fascination.html \
  ships/carnival/carnival-imagination.html
→ each ship: FIXED 1 rule (js:data_consistency/internal_numeric_inconsistency)
→ regressions: 0
```

## Carry-forward

The remaining four Fantasy-class ships in the fleet (Sensation, Inspiration,
Elation, Paradise) should be checked for the same boilerplate-fact-block bug
in batch 3 — `carnival-sensation.html` and `carnival-inspiration.html` are
already on the B1 list. Same fix recipe will likely apply.
