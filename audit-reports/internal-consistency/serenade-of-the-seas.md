# serenade-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 2,476, 2,490, 2,100

## Canonical chosen

**2,476** (source: most-frequent-on-page)

## Swaps applied (2)

1. `2,100` → `2,476` — id-size atmosphere with about ⟨2,100→2,476⟩, the signature Viking Crown L
2. `2,490` → `2,476` — nade of the Seas (90,090 GT | ⟨2,490→2,476⟩ | 2003) is a Radiance Class s

## Verification

`node admin/validate-ship-page.js ships/rcl/serenade-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
