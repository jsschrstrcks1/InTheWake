---
id: SCHEMA-010
name: Review itemReviewed must reference the correct ship class
family: schema
severity: error
applies-to:
  - ship
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateJSONLD (Review class reference check)
    lines: "612-629"
check: if Review.itemReviewed.description contains the substring "<className>-class", the ship must actually belong to that class (per SHIP_CLASSES mapping)
standards-source:
  - doc: admin/SHIP_AUDIT_FINDINGS.md
    section: "Cross-fleet dining hero image / class-name swaps (Silver Shadow ↔ Silver Whisper)"
  - doc: new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md
    section: "Ship facts accuracy"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
If a ship page's `Review.itemReviewed.description` contains a substring matching `<className>-class` (e.g., "Oasis-class", "Quantum-class", "Vista-class"), the ship must actually belong to that class. The validator cross-references against its internal `SHIP_CLASSES` mapping.

## Why (rationale)
**This exists because of real escapes.** The 2026-02 ship audit found pages where a Review claimed "Quantum-class" on a ship that was actually Oasis, and Silver Shadow / Silver Whisper had each other's class names swapped across their pages. Wrong class references in structured data leak into search results, AI summaries, and knowledge-graph entries — propagating the error far beyond the local page.

## Pass example
Allure of the Seas (an Oasis-class ship):
```html
<script type="application/ld+json">
{ "@type": "Review",
  "itemReviewed": {
    "@type": "Product", "name": "Allure of the Seas",
    "description": "Oasis-class ship operated by Royal Caribbean International"
  }
}
</script>
```
SHIP_CLASSES maps "Oasis" → includes "Allure" → passes.

## Fail example
Allure of the Seas page claiming Quantum class:
```html
{ "@type": "Review",
  "itemReviewed": { "description": "Quantum-class ship ..." }
}
```
Validator emits: `Review references "Quantum-class" but this ship is not Quantum class`.

## Fix guidance
Check the ship's actual class before writing the Review. The cruise line's spec sheet or a reliable reference (Wikipedia, the ship's CruiseDeckPlans page) settles it. When in doubt, omit the `-class` phrasing entirely — a generic description ("large cruise ship in Royal Caribbean's fleet") is safer than a wrong specific one.
