# Internal-consistency repair — Carnival Horizon

**Phase:** v3 B1 (internal-consistency-repair) · batch 2
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)

## Conflict before fix

| Number | Occurrences | Locations |
|---|---|---|
| **3,954** | 4 | fact-block prose; Quick Answer; ship-stats-fallback inline JSON; FAQ ("3,954 guests at double occupancy") |
| 3,960 | 3 | header badge; UI stat-item; key-facts `<dd>` (with the explicit label "double occupancy") |

## Canonical decision

**Canonical guest count: 3,954** — Vista-class double-occupancy as published by
Carnival Cruise Line for Carnival Horizon. JSON-LD + fact-block + Quick Answer
agree, and 3,954 matches Carnival's press archive.

The 3,960 figure on the UI side is a rounding/transcription drift (out by six);
the explicit "double occupancy" label on the key-facts `<dd>` made the conflict
particularly visible to readers who scrolled to the spec card.

## Edits applied

| Surface | Before | After |
|---|---|---|
| Header badge | `3,960 Guests` | `3,954 Guests` |
| Stat-item value | `<div class="stat-value">3,960</div>` | `<div class="stat-value">3,954</div>` |
| Key-facts `<dd>` | `3,960 (double occupancy)` | `3,954 (double occupancy)` |

## Verification

```
node admin/check-ship-regression.cjs ships/carnival/carnival-horizon.html
→ FIXED 1 rule(s): js:data_consistency/internal_numeric_inconsistency
→ regressions: 0
```
