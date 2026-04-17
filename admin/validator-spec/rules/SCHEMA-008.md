---
id: SCHEMA-008
name: Review JSON-LD schema required on ship pages
family: schema
severity: error
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateJSONLD (required types iteration)
    lines: "587-592"
check: ship pages contain at least one parsed JSON-LD block with @type "Review"
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Ship pages must include a `Review` JSON-LD block containing editorial assessment of the ship. The Review must have: `itemReviewed` (a Product / Ship entity), `author` (a Person), and optionally `reviewBody` + `reviewRating`.

See SCHEMA-010 for the class-reference correctness check, SCHEMA-011 for the generic-template check, and SCHEMA-012 for the rating-authenticity warning.

## Why (rationale)
Ship pages on this site ARE editorial reviews — a pastoral assessment of who the ship is for, what the voyage feels like, what works and what doesn't. The Review schema is the structured-data surface for that editorial content. Declaring it makes the review eligible for rich-result treatment and AI-assistant citation.

## Pass example
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "Allure of the Seas",
    "description": "Oasis-class ship operated by Royal Caribbean International, 2010"
  },
  "author": { "@type": "Person", "name": "In the Wake Editorial" },
  "reviewBody": "Allure's size is the draw and the trade-off — ..."
}
</script>
```

## Fail example
Ship page missing Review block. Validator emits: `Missing Review JSON-LD schema`.

## Fix guidance
Add the Review block. Populate `itemReviewed` with the ship's real class and operator (see SCHEMA-010 — wrong-class reference is a separate error). Write `reviewBody` as real editorial content, not templated prose (SCHEMA-011). Do NOT invent a ratingValue you haven't actually assigned (SCHEMA-012).
