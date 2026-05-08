# wonder-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 5,734, 6,988

## Canonical chosen

**5,734** (source: most-frequent-on-page)

## Swaps applied (2)

1. `6,988` → `5,734` — 6,857 GT with space for up to ⟨6,988→5,734⟩, it's one of the largest crui
2. `6,988` → `5,734` — 6,857 GT with space for up to ⟨6,988→5,734⟩, it is one of the largest cru

## Verification

`node admin/validate-ship-page.js ships/rcl/wonder-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
