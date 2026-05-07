# icon-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 5,610, 7,600

## Canonical chosen

**5,610** (source: most-frequent-on-page)

## Swaps applied (3)

1. `7,600` → `5,610` — ods. At 248,663 GT with up to ⟨7,600→5,610⟩, it is the world's largest cr
2. `7,600` → `5,610` — volutionary design with up to ⟨7,600→5,610⟩ on the world's most innovativ
3. `7,600` → `5,610` — ods. At 248,663 GT with up to ⟨7,600→5,610⟩, it is the world's largest cr

## Verification

`node admin/validate-ship-page.js ships/rcl/icon-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
