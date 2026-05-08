# noordam — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 1,972, 1,918

## Canonical chosen

**1,972** (source: most-frequent-on-page)

## Swaps applied (1)

1. `1,918` → `1,972` —  GT and 936 feet, she carries ⟨1,918→1,972⟩ with the uncrowded, spacious 

## Verification

`node admin/validate-ship-page.js ships/holland-america-line/noordam.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
