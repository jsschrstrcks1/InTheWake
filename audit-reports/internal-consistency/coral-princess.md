# coral-princess — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 1,970, 3,000

## Canonical chosen

**1,970** (source: most-frequent-on-page)

## Swaps applied (1)

1. `3,000` → `1,970` — hip, the Grand Class carries ~⟨3,000→1,970⟩; for the newest design, the S

## Verification

`node admin/validate-ship-page.js ships/princess/coral-princess.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
