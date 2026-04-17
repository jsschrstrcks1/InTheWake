---
id: VENUE-008
name: Meta description coherence — menu/price claims must have matching section
family: venue
severity: warn
applies-to:
  - venue
provenance: V-only
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkMetaDescriptionCoherence (S06)
    lines: "610-620"
check: if venue meta description contains "menu" or "price", page must have id="menu-prices" section
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
When a venue's meta description claims menu or price information, the page must actually have an `id="menu-prices"` section. Claim-without-payload is flagged at warn.

## Why (rationale)
Same pattern as SHIP-008 for ship pages. The meta description is a promise; the page body fulfills it. A description promising "menu prices and specialty cocktail list" that lacks a menu-prices section degrades search-result click satisfaction and AI-summary trust.

## Pass example
Meta description: "Chops Grille — the Oasis-class steakhouse menu, prices, and our logbook of real meals." Page has `id="menu-prices"` with real content (VENUE-003). Passes.

## Fail (warning) example
Meta description promises menu prices; page has no menu-prices section. Validator emits: `Meta description mentions menu/prices but no menu section exists`.

## Fix guidance
Either add the menu-prices section (with real prices per VENUE-003) or rewrite the description to match what the page actually covers.
