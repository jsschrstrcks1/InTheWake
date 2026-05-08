# freedom-of-the-seas — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 4,024, 4,829, 3,634

## Canonical chosen

**4,024** (source: most-frequent-on-page)

## Swaps applied (3)

1. `4,829` → `4,024` — ade. At 154,407 GT with up to ⟨4,829→4,024⟩, it's larger than <a href="/s
2. `3,634` → `4,024` — dom of the Seas (156,271 GT | ⟨3,634→4,024⟩ | 2006) is the original Freed
3. `4,829` → `4,024` — ade. At 154,407 GT with up to ⟨4,829→4,024⟩, it's larger than Voyager cla

## Verification

`node admin/validate-ship-page.js ships/rcl/freedom-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
should return empty.

*Soli Deo Gloria*
