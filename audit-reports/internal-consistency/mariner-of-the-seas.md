# mariner-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 3,334, 3,344

## Canonical chosen

**3,334** (source: most-frequent-on-page)

## Swaps applied (1)

1. `3,344` → `3,334` — ner of the Seas (139,863 GT | ⟨3,344→3,334⟩ | 2003) is a Voyager Class sh

## Verification

`node admin/validate-ship-page.js ships/rcl/mariner-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
