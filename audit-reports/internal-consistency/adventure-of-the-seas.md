# adventure-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 3,114, 3,286

## Canonical chosen

**3,114** (source: most-frequent-on-page)

## Swaps applied (1)

1. `3,286` → `3,114` — yager Class ship (137,276 GT, ⟨3,286→3,114⟩, 2001) featuring the Royal Pr

## Verification

`node admin/validate-ship-page.js ships/rcl/adventure-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
