# norwegian-star — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,298, 2,224, 2,348

## Canonical chosen

**2,298** (source: most-frequent-on-page)

## Swaps applied (2)

1. `2,348` → `2,298` — ramic views. The ship carries ⟨2,348→2,298⟩ in a mid-sized atmosphere.</p
2. `2,224` → `2,298` —  Star (Star Class, 91,740 GT, ⟨2,224→2,298⟩, 2001) features Cagney's Stea

## Verification

`node admin/validate-ship-page.js ships/norwegian/norwegian-star.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
