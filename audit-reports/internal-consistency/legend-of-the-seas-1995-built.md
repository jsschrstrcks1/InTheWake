# legend-of-the-seas-1995-built — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 1,804, 2,000

## Canonical chosen

**1,804** (source: most-frequent-on-page)

## Swaps applied (1)

1. `2,000` → `1,804` — ribbean experience with about ⟨2,000→1,804⟩, the signature Viking Crown L

## Verification

`node admin/validate-ship-page.js ships/rcl/legend-of-the-seas-1995-built.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
