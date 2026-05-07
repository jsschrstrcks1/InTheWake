# Internal-consistency repair — Carnival Conquest

**Phase:** v3 B1 (internal-consistency-repair) · batch 2
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)

## Conflict before fix

| Number | Occurrences | Locations |
|---|---|---|
| **2,974** | 4 | FAQ JSON-LD; fact-block prose; Quick Answer; ship-stats-fallback inline JSON |
| 2,980 | 3 | header badge; UI stat-item; key-facts `<dl>` card |

## Canonical decision

**Canonical guest count: 2,974** — Conquest-class double-occupancy per Carnival
Cruise Line. JSON-LD + fact-block agree, and 2,974 is the published Conquest-
class lower-berth capacity across all five sister ships (Conquest, Glory,
Valor, Liberty, Freedom).

The 2,980 figure has no upstream authority — appears to be a UI-side off-by-six
drift introduced by a separate batch.

## Edits applied

| Surface | Before | After |
|---|---|---|
| Header badge | `2,980 Guests` | `2,974 Guests` |
| Stat-item value | `<div class="stat-value">2,980</div>` | `<div class="stat-value">2,974</div>` |
| Key-facts `<dl>` | `<dt>Guests</dt><dd>2,980</dd>` | `<dt>Guests</dt><dd>2,974</dd>` |

## Verification

```
node admin/check-ship-regression.cjs ships/carnival/carnival-conquest.html
→ FIXED 1 rule(s): js:data_consistency/internal_numeric_inconsistency
→ regressions: 0
```
