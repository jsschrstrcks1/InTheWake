# norwegian-pearl — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,344, 2,400

## Canonical chosen

**2,344** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,400` → `2,344` —  lanes was a fleet first. At ~⟨2,400→2,344⟩ she's well-suited for port-in

## Verification

`node admin/validate-ship-page.js ships/norwegian/norwegian-pearl.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
