# carnival-firenze — internal-consistency repair

**Date:** 2026-05-07
**Branch:** `claude/phase3-internal-consistency`

## Before

Distinct non-max integers: 4,126, 2,680

## Canonical chosen

**2,680** (source: most-frequent-on-page)

## Swaps applied (2)

1. `4,126` → `2,680` — an> <span class="badge">⟨4,126→2,680⟩</span> <span class="bad
2. `4,126` → `2,680` —  feet long, and carries up to ⟨4,126→2,680⟩ in 2,136 staterooms across 15

## Manual follow-up (post-bulk)

Bulk script left two stale `4,126` references the cheerio-based validator
caught but the line-by-line survey missed (whitespace-separated stat-card
where the integer and "Guest Capacity" label are on different lines):

3. Hero stat panel: `<div class="stat-value">4,126</div>` paired with
   `<div class="stat-label">Guest Capacity</div>` → 2,680.
4. FAQ "How many staterooms": "Total guest capacity is 4,126 at double
   occupancy." → "Total guest capacity is 2,680 at double occupancy
   (4,126 maximum)." (max figure now explicitly labeled.)

## Verification

`node admin/validate-ship-page.js ships/carnival/carnival-firenze.html --json-output | jq '.blocking_errors[] | select(.rule=="internal_numeric_inconsistency")'`
returns empty (verified 2026-05-07).

*Soli Deo Gloria*
