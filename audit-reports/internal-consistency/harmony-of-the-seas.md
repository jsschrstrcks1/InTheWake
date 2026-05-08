# harmony-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 6,780, 5,479

## Canonical chosen

**5,479** (source: most-frequent-on-page)

## Swaps applied (3)

1. `6,780` → `5,479` — ers. At 226,963 GT with up to ⟨6,780→5,479⟩, it's one of the largest crui
2. `6,780` → `5,479` — rgest cruise ships with up to ⟨6,780→5,479⟩ and extensive dining and ente
3. `6,780` → `5,479` — ers. At 226,963 GT with up to ⟨6,780→5,479⟩, it's one of the largest crui

## Verification

`node admin/validate-ship-page.js ships/rcl/harmony-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
