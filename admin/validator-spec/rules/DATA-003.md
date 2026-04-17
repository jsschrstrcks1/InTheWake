---
id: DATA-003
name: Ship spec values consistent across HTML sections and JSON data
family: data
severity: warn
applies-to:
  - ship
provenance: S-only
status: live
implementation: none
check: ship tonnage, crew count, passenger capacity, year built, and length values are consistent between the HTML stats block, the ship JSON data file, and the Review JSON-LD itemReviewed.description; discrepancies flag as inconsistency
standards-source:
  - doc: admin/SHIP_AUDIT_FINDINGS.md
    section: "Crew specification conflicts — Specs vs Stats vs Stats JSON disagree (Silver Nova: 554 vs 586)"
  - doc: admin/ANTHEM_OF_THE_SEAS_AUDIT_2026_04_11.md
    section: "Physical spec conflicts — length, beam, draft, deck count, cabin count mismatches"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Ship physical specifications (tonnage, crew, capacity, year, length, beam, draft, deck count) must be consistent across all surfaces they appear on: the HTML stats block, `assets/data/ships/<slug>.json`, and any Review JSON-LD `itemReviewed.description`. The Anthem audit found multiple spec fields disagreeing across sections of the same page; the fleet audit found Silver Nova with crew counts of 554 in one block and 586 in another. No validator currently cross-checks — orphan.

## Fix guidance
Pick one authoritative source (the cruise line's official spec sheet or CruiseDeckPlans) and propagate values to all surfaces in one commit. When in doubt, use the conservative number (smaller capacity, fewer decks) rather than the marketing number.
