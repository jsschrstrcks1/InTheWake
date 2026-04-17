---
id: SCHEMA-006
name: Organization JSON-LD schema required on ship pages
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
check: ship pages contain at least one parsed JSON-LD block with @type "Organization"
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Ship pages must include an `Organization` JSON-LD block identifying the cruise line (Royal Caribbean International, Carnival Cruise Line, etc.). This lets search engines and AI assistants attribute the ship correctly to its operator and link in brand-level knowledge graph entities.

## Why (rationale)
A ship is not a standalone entity — it's operated by a specific cruise line, which is itself a notable organization with rich structured-data elsewhere on the web (Wikipedia, parent corporation pages, stock ticker). Declaring the Organization makes the ship page part of that graph.

Ship validator requires this type specifically; port and venue validators do not. Standards docs don't describe it — backfill required in Phase 6.

## Pass example
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Organization",
  "name": "Royal Caribbean International",
  "url": "https://www.royalcaribbean.com",
  "sameAs": ["https://en.wikipedia.org/wiki/Royal_Caribbean_International"]
}
</script>
```

## Fail example
Ship page missing Organization block. Validator emits: `Missing Organization JSON-LD schema`.

## Fix guidance
Add the Organization block. Use the cruise line's official name (not shorthand like "RCI"). Include `url` pointing to their official site and `sameAs` for their Wikipedia entry if notable.
