# oosterdam — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 1,916, 1,848

## Canonical chosen

**1,848** (source: most-frequent-on-page)

## Swaps applied (2)

1. `1,916` → `1,848` — ns, and carries approximately ⟨1,916→1,848⟩ at double occupancy.</p> 
2. `1,916` → `1,848` — g 81,769 GT and accommodating ⟨1,916→1,848⟩. Launched in 2003, she featur

## Verification

`node admin/validate-ship-page.js ships/holland-america-line/oosterdam.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
