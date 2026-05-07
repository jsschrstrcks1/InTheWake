# vision-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,036, 2,000

## Canonical chosen

**2,036** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,000` → `2,036` — ribbean experience with about ⟨2,000→2,036⟩, the signature Viking Crown L

## Verification

`node admin/validate-ship-page.js ships/rcl/vision-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
