# Internal-consistency repair — Carnival Glory

**Phase:** v3 B1 (internal-consistency-repair) · batch 2
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)

## Conflict before fix

| Number | Occurrences | Locations |
|---|---|---|
| **2,974** | 4 | FAQ JSON-LD; fact-block prose; Quick Answer; ship-stats-fallback inline JSON |
| 2,984 | 3 | header badge; UI stat-item; key-facts `<dl>` card |

Same Conquest-class UI-vs-JSON-LD drift pattern as `carnival-conquest.md`.

## Canonical decision

**Canonical guest count: 2,974** — Conquest-class double-occupancy per Carnival
Cruise Line. Glory shares the published lower-berth capacity with her four
sister ships.

## Edits applied

| Surface | Before | After |
|---|---|---|
| Header badge | `2,984 Guests` | `2,974 Guests` |
| Stat-item value | `<div class="stat-value">2,984</div>` | `<div class="stat-value">2,974</div>` |
| Key-facts `<dl>` | `<dt>Guests</dt><dd>2,984</dd>` | `<dt>Guests</dt><dd>2,974</dd>` |

## Verification

```
node admin/check-ship-regression.cjs ships/carnival/carnival-glory.html
→ FIXED 1 rule(s): js:data_consistency/internal_numeric_inconsistency
→ regressions: 0
```
