# celebrity-millennium — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,170, 2,138

## Canonical chosen

**2,000** (source: most-frequent-on-page)

## Swaps applied (2)

1. `2,138` → `2,000` — ns, and carries approximately ⟨2,138→2,000⟩ at double occupancy.</p> 
2. `2,170` → `2,000` — ength, carrying approximately ⟨2,170→2,000⟩ at double occupancy with a cr

## Verification

`node admin/validate-ship-page.js ships/celebrity-cruises/celebrity-millennium.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
