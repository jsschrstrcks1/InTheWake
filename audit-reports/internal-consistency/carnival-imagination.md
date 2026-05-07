# carnival-imagination — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,040, 2,056

## Canonical chosen

**2,040** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,056` → `2,040` — ns, and carries approximately ⟨2,056→2,040⟩ at double occupancy.</p> 

## Verification

`node admin/validate-ship-page.js ships/carnival/carnival-imagination.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
