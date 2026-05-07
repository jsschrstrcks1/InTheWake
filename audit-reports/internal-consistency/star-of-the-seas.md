# star-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 5,610, 7,600

## Canonical chosen

**5,610** (source: most-frequent-on-page)

## Swaps applied (1)

1. `7,600` → `5,610` — gest ships (248,663 GT, up to ⟨7,600→5,610⟩) with cutting-edge technology

## Verification

`node admin/validate-ship-page.js ships/rcl/star-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
