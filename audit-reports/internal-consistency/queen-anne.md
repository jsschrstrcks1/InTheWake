# queen-anne — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,996, 2,081

## Canonical chosen

**2,996** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,081` → `2,996` —  fit at roughly 90,000 GT and ⟨2,081→2,996⟩. </p> <div class

## Verification

`node admin/validate-ship-page.js ships/cunard/queen-anne.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
