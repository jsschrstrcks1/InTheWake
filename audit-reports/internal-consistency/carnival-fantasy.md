# Internal-consistency repair — Carnival Fantasy

**Phase:** v3 B1 · batch 2 · Fantasy-class quartet
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule cleared:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004)
**Shared analysis:** [`carnival-fantasy-class-quartet.md`](carnival-fantasy-class-quartet.md)

## Conflict before fix

| Number | Where | Why on this page |
|---|---|---|
| **2,044** (canonical) | answer-first, ai-summary, JSON-LD ×3, FAQ, fact-block bullet list, stat-item value, deck-overview "<strong>Guests:</strong> 2,044" | Fantasy is the lead ship of the class with a slightly distinct LB capacity (Carnival published) |
| 2,056 | fact-block prose; ship-stats-fallback inline JSON | All-berths-full max figure leaked from a boilerplate generator |

## Edits applied

| Surface | Before | After |
|---|---|---|
| fact-block prose | `… measures 70,367 gross tons, and carries approximately 2,056 guests at double occupancy.` | `… measures 70,367 gross tons, and carries approximately 2,044 guests at double occupancy.` |
| ship-stats-fallback inline JSON | `"guests":"2,056"` | `"guests":"2,044"` |

Verified via `admin/check-ship-regression.cjs`: FIXED 1 rule, 0 regressions.
