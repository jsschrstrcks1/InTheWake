# norwegian-jade — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,352, 2,400

## Canonical chosen

**2,352** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,400` → `2,352` — renamed and repositioned. At ~⟨2,400→2,352⟩ she offers a mid-size Freesty

## Verification

`node admin/validate-ship-page.js ships/norwegian/norwegian-jade.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
