# norwegian-spirit — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 1,972, 2,018

## Canonical chosen

**1,972** (source: most-frequent-on-page)

## Swaps applied (2)

1. `2,018` → `1,972` — Star Cruises, she now carries ⟨2,018→1,972⟩ at 75,904 gross tons with an 
2. `2,018` → `1,972` — rit (Spirit Class, 75,904 GT, ⟨2,018→1,972⟩, 1998) features Cagney's Stea

## Verification

`node admin/validate-ship-page.js ships/norwegian/norwegian-spirit.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
