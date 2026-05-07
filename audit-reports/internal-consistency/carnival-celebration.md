# Internal-consistency repair — Carnival Celebration

**Phase:** v3 B1 (internal-consistency-repair)
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)

## Conflict before fix

Page surfaced two distinct guest-count integers in canonical (non-"maximum") contexts:

| Number | Occurrences | Locations |
|---|---|---|
| **5,374** | 6 | answer-first line; meta description; ai-summary; JSON-LD descriptions ×2; Quick Answer; ship-stats-fallback inline JSON; fact-block bullet list (labeled "(max)" — see decision below) |
| 5,000 | 1 | logbook narrative prose ("Celebration carries over 5,000 passengers …") |

Additional issue: the fact-block listed `Guests: 5,374 (max)` while every other
canonical surface used `5,374` unmodified. The `(max)` label contradicted the
canonical use elsewhere on the page and tripped Policy 0.2's "label any
max-capacity figure with 'maximum' or 'all-berths-full'" rule by implying the
unlabeled occurrences elsewhere were a different number.

## Canonical decision

**Canonical guest count: 5,374** — Excel-class double-occupancy capacity per
Carnival Cruise Line. Authority hierarchy applied per
`SHIP_STANDARDIZATION_PLAN_V3.md` § 7.5:

| Tier | Source | Result |
|---|---|---|
| 1 | CLIA member directory | not consulted (line-own consistent) |
| 2 | Carnival Cruise Line own site / press kit (sister ships Mardi Gras + Jubilee published with same figure family) | 5,374 |
| 3 | Wikipedia infobox | aligned with 2 |
| Tie-break | LLM consult | not invoked — sources agreed |

The "5,000" figure was rounded narrative prose with no upstream authority, not
a max-capacity citation. Replaced rather than relabeled.

## Edits applied

| Line | Before | After |
|---|---|---|
| Fact-block bullet | `<li><strong>Guests:</strong> 5,374 (max)</li>` | `<li><strong>Guests:</strong> 5,374</li>` |
| Inline ship-stats-fallback JSON | `"guests":"5,374 (max)"` | `"guests":"5,374"` |
| Logbook narrative | `Celebration carries over 5,000 passengers and has a roller coaster on the top deck.` | `Celebration carries 5,374 guests at double-occupancy and has a roller coaster on the top deck.` |

## Verification

```
node admin/validate-ship-page.js ships/carnival/carnival-celebration.html
→ Status: PASS
→ BLOCKING ERRORS (0)

node admin/check-ship-regression.cjs ships/carnival/carnival-celebration.html
→ FIXED 1 rule(s):
    ✓ js:data_consistency/internal_numeric_inconsistency
→ regressions: 0
```

## Carry-forward

This ship still has open Track A items: 0 (now fully passing js validator).
Track A4 will add a Citation Block referencing the Carnival press kit for the
5,374 figure when that phase lands.
