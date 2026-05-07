# brilliance-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,112, 2,145, 2,100

## Canonical chosen

**2,145** (source: most-frequent-on-page)

## Swaps applied (2)

1. `2,100` → `2,145` — id-size atmosphere with about ⟨2,100→2,145⟩, the signature Viking Crown L
2. `2,112` → `2,145` — diance Class ship (90,090 GT, ⟨2,112→2,145⟩, 2002) known for panoramic fl

## Verification

`node admin/validate-ship-page.js ships/rcl/brilliance-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
