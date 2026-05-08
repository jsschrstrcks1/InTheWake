# norwegian-sun — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 1,878, 2,000

## Canonical chosen

**1,878** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,000` → `1,878` — intimate ocean ships at under ⟨2,000→1,878⟩. Her smaller size is a delibe

## Verification

`node admin/validate-ship-page.js ships/norwegian/norwegian-sun.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
