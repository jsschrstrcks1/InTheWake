# norwegian-dawn — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,290, 2,340

## Canonical chosen

**2,290** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,340` → `2,290` — ion lounges. The ship carries ⟨2,340→2,290⟩ in a refined atmosphere.</p> 

## Verification

`node admin/validate-ship-page.js ships/norwegian/norwegian-dawn.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
