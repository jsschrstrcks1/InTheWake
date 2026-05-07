# Carnival Firenze — DEFERRED from B1 to B2 (historic-ship-verifier)

**Phase:** v3 B1 attempted · deferred to B2
**Branch:** `claude/review-client-proposal-vILOr`
**Date:** 2026-05-07
**Validator rule still failing:** `js:data_consistency/internal_numeric_inconsistency` (DATA-004) — and several upstream issues that B1 cannot resolve.

## Why this is not a B1 fix

The validator flagged a guest-count contradiction (4,126 vs 2,680). Investigating
the page surfaced a **larger data-source error**: the fact-block contains data
for a **different ship** entirely.

| Surface | Class | Tonnage | Length | Guests | Match for Carnival Firenze (former Costa Firenze)? |
|---|---|---|---|---|---|
| Fact-block prose + Quick Answer + key-facts + ship-stats-fallback | Spirit Class | 86,000 GT | 960 ft | 2,680 | **No.** These are Spirit-class numbers. |
| Header badges + FAQ + stat-item + narrative | Costa Firenze derivative | 135,156 GT | 1,061 ft | 4,126 | Yes (Costa Firenze hull data) |

Carnival Firenze is the **former Costa Firenze**, transferred and reflagged in
2024. Her actual specs are in the second row, not the first. The fact-block
appears to have been populated by the standard Carnival fact-block generator
using **Spirit-class defaults** as if she were a Spirit-class ship. She is
not.

## Why B1 cannot resolve this

B1 (internal-consistency-repair) is constrained to picking the canonical
on-page figure and aligning the rest. Here both candidate numbers (4,126 and
2,680) are *internally consistent* with their own surfaces — but one comes
from the wrong ship. Picking 4,126 would leave the page asserting "Spirit
Class, 86,000 GT, 4,126 guests" — which is more wrong than the original.

## Handoff to B2 (historic-ship-verifier)

Per `SHIP_STANDARDIZATION_PLAN_V3.md` § 5 (Track B2), the historic-ship-verifier
skill applies the § 7.5 authority hierarchy to source canonical specs from
Equasis / classification societies / cruise-line press archives. For Firenze:

| Tier | Source | Expected canonical |
|---|---|---|
| 1 | Equasis (IMO 9787475) | actual GT, length, year built |
| 2 | Costa Cruises press archive (pre-transfer) + Carnival press release (2024 transfer) | double-occupancy guest count |
| 3 | Wikipedia infobox | cross-check |

After B2 fills the page.json correctly, a follow-up B1 pass will be a no-op
because the fact-block will be regenerated from corrected source data.

## Action items

- [ ] B2 picks up Firenze in its first batch of "newly-transferred ships."
- [ ] After B2, re-run `admin/check-ship-regression.cjs ships/carnival/carnival-firenze.html` to confirm DATA-004 cleared.
- [ ] Same handoff likely required for `carnival-venezia.html` (former Costa Venezia, same transfer programme) — currently still on the B1 list; check before editing.

This file is the deferral record; no edits made to `ships/carnival/carnival-firenze.html` in this PR.
