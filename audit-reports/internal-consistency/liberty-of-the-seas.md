# liberty-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 3,634, 4,960

## Canonical chosen

**3,634** (source: most-frequent-on-page)

## Swaps applied (3)

1. `4,960` → `3,634` — ade. At 154,407 GT with up to ⟨4,960→3,634⟩, it's larger than <a href="/s
2. `4,960` → `3,634` — -class experience with around ⟨4,960→3,634⟩ — larger than <a href="/ships
3. `4,960` → `3,634` — ade. At 154,407 GT with up to ⟨4,960→3,634⟩, it's larger than Voyager cla

## Verification

`node admin/validate-ship-page.js ships/rcl/liberty-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
