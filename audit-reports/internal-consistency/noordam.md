# Internal-consistency repair — Noordam (Holland America Line)

**Phase:** v3 B1 (internal-consistency-repair)
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)

## Conflict before fix

| Number | Occurrences | Locations |
|---|---|---|
| **1,972** | 3 | JSON-LD review (`reviewBody`); fact-block prose; inline ship-stats-fallback JSON `"guests":"1,972"` |
| 1,918 | 1 | logbook narrative prose ("At 82,318 GT and 936 feet, she carries 1,918 guests …") |

A second tonnage discrepancy was nested in the same prose: `82,318 GT` (one
prose occurrence) vs `82,305 GT` (canonical, in fact-block, JSON-LD, and
inline JSON). DATA-004 only flags guest-count, but the same authority
hierarchy applies and the same edit corrects both.

## Canonical decision

**Canonical guest count: 1,972** — Noordam's published double-occupancy
capacity per Holland America Line. Authority hierarchy:

| Tier | Source | Figure |
|---|---|---|
| 2 | HAL own site | 1,972 (lower berth) / 2,388 (max) |
| 2 | HAL press archives | 1,972 |
| 3 | Wikipedia infobox | 1,972 (matches HAL) |

The 1,918 figure has no upstream authority — appears to be a transcription
error in the original prose. **Canonical tonnage: 82,305 GT** for the same
reasons; the 82,318 in the prose is a similar transcription drift.

## Edits applied

| Line | Before | After |
|---|---|---|
| Logbook narrative | `At 82,318 GT and 936 feet, she carries 1,918 guests with the uncrowded, spacious feel that defines HAL's mid-size premium experience.` | `At 82,305 GT and 936 feet, she carries 1,972 guests with the uncrowded, spacious feel that defines HAL's mid-size premium experience.` |

## Verification

```
node admin/validate-ship-page.js ships/holland-america-line/noordam.html
→ Status: PASS
→ BLOCKING ERRORS (0)

node admin/check-ship-regression.cjs ships/holland-america-line/noordam.html
→ FIXED 1 rule(s):
    ✓ js:data_consistency/internal_numeric_inconsistency
→ regressions: 0
```

## Carry-forward

Noordam is now fully passing both the js side and the rule families this PR
targets. Future Track A4 work will add a Citation Block crediting the HAL
press archive for the 1,972 / 82,305 figures.
