# carnival-glory — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,974, 2,984

## Canonical chosen

**2,974** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,984` → `2,974` — an> <span class="badge">⟨2,984→2,974⟩</span> <span class="bad

## Verification

`node admin/validate-ship-page.js ships/carnival/carnival-glory.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
