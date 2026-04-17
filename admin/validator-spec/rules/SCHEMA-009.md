---
id: SCHEMA-009
name: Person JSON-LD schema required on ship pages (for Review.author)
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
check: ship pages contain at least one parsed JSON-LD block with @type "Person" (typically inside Review.author, but can be a sibling block)
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Ship pages must have a `Person` JSON-LD entity present — typically as the `author` of the Review (SCHEMA-008). The recursive type-scanner accepts Person declared inline within Review.author OR as a sibling block.

## Why (rationale)
Reviews without attribution are less trustworthy to search engines and AI consumers. Schema.org requires `author` on Review for valid markup. The editorial voice of "In the Wake" is a real author entity; declaring it gives readers and crawlers a named, accountable source.

Ship validator requires this; other validators don't. Standards silent — backfill needed.

## Pass example (inline inside Review)
```html
<script type="application/ld+json">
{ "@type": "Review",
  "author": { "@type": "Person", "name": "In the Wake Editorial",
              "sameAs": "https://cruisinginthewake.com/about-us.html" }
}
</script>
```

## Pass example (sibling block)
```html
<script type="application/ld+json">
{ "@type": "Person", "name": "In the Wake Editorial",
  "url": "https://cruisinginthewake.com/about-us.html" }
</script>
```

## Fail example
Ship page has Review schema but no Person anywhere. Validator emits: `Missing Person JSON-LD schema`.

## Fix guidance
Simplest: put Person inline inside Review.author. Use a stable author identity ("In the Wake Editorial" or a real named editor); don't fabricate names. Link to about-us.html via `sameAs` or `url`.
