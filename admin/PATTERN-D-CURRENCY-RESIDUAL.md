# Pattern D residual — half-filled "currency is used in" answers

**Date:** 2026-07-13  
**Task:** `pattern-d-half-filled-currency-is-used-in-answer` (#2032)  
**Patron:** skynet2  
**Soli Deo Gloria. Careful, not clever.**

## Defect
Port FAQs/schema answered currency questions with the generic boilerplate:

> Check local currency requirements before your visit. Major credit cards are typically accepted at tourist areas, but having some local currency is useful for smaller vendors and markets.

Audit neighbor: `admin/port-page-audit.cjs` B3 also flags `The local currency is used in.` (none live on main at execute time).

## Fixed ports (8)
| Port | Currency filled |
|------|-----------------|
| st-petersburg | RUB / ruble |
| tallinn | EUR |
| porto | EUR |
| riga | EUR |
| st-kitts | XCD (+ USD tip) |
| quebec-city | CAD |
| rhodes | EUR |
| taormina | EUR |

Fleet residual for exact generic phrase: **0**.

## Not this task
USD $ shopping on non-USD ports (B3 pricing class) — separate fleet migration.  
Ports with real currency names already exact (eye-ball detector false positives: TZS, PGK, MMK, VUV, TOP, BZD, etc.).

## Not suite green
Ad-hoc hermes-verify only.
