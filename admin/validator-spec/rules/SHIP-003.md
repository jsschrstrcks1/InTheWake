---
id: SHIP-003
name: TBN (to-be-named) ship page required sections
family: ship
severity: error
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateSectionsDetected (TBN branch)
    lines: "1104"
check: ship pages marked TBN (to-be-named / pre-launch) contain 6 required sections — page_intro, first_look, dining, faq, attribution, recent_rail. Logbook NOT required (no real voyages logged yet).
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Ship pages for to-be-named (TBN) / pre-launch / not-yet-sailing ships have a lighter required-section set: `page_intro`, `first_look`, `dining`, `faq`, `attribution`, `recent_rail`. The `logbook` section is NOT required because there are no real voyages to draw stories from.

## Why (rationale)
Shipping a logbook section with fabricated or placeholder stories on a ship that hasn't sailed yet violates the pastoral guardrail ("never rewrite hard stories into chipper" + "no invented guides"). Rather than forcing an empty or fake logbook, the validator acknowledges the real-world fact: TBN ships cover only what's genuinely known (design, specs, announced itineraries).

## Pass example
Pre-launch ship page with: page_intro, first_look (gallery from renders), dining (announced venues), faq, attribution, recent_rail. No logbook. Passes.

## Fail example
Pre-launch ship page missing `page_intro`. Validator emits: `Missing required sections: page_intro`.

## Fix guidance
The validator auto-detects TBN status from page markers (naming convention on the ship or metadata — the `is_tbn` logic in validate-ship-page.js determines branch selection). If your ship has sailed, make sure it's not mis-marked as TBN; otherwise logbook won't be required when it should be.

## Related
- SHIP-002 — active ship variant (7 required sections)
- LOGBOOK_ENTRY_STANDARDS_v2.300 — logbook content standards (for ships that need them)
