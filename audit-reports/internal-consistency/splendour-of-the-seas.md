# splendour-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 1,804, 2,076, 2,000

## Canonical chosen

**1,804** (source: most-frequent-on-page)

## Swaps applied (2)

1. `2,000` → `1,804` — ribbean experience with about ⟨2,000→1,804⟩, the signature Viking Crown L
2. `2,076` → `1,804` — ons and carried approximately ⟨2,076→1,804⟩ at double occupancy, with a c

## Verification

`node admin/validate-ship-page.js ships/rcl/splendour-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
