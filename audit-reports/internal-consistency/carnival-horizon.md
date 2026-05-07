# carnival-horizon — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 3,960, 3,954

## Canonical chosen

**3,954** (source: most-frequent-on-page)

## Swaps applied (1)

1. `3,960` → `3,954` — an> <span class="badge">⟨3,960→3,954⟩</span> <span class="bad

## Manual follow-up (post-bulk)

Bulk script missed two `3,960` references (whitespace-separated stat-card
+ Key Facts `<dd>` block):

2. Hero stat panel: `<div class="stat-value">3,960</div>` paired with
   `<div class="stat-label">Guest Capacity</div>` → 3,954.
3. Key Facts: `<dd>3,960 (double occupancy)</dd>` → `3,954 (double
   occupancy)`.

## Verification

`node admin/validate-ship-page.js ships/carnival/carnival-horizon.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
returns empty (verified 2026-05-07).

*Soli Deo Gloria*
