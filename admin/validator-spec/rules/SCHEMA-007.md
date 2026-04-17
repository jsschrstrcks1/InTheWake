---
id: SCHEMA-007
name: WebSite JSON-LD schema required on ship pages
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
check: ship pages contain at least one parsed JSON-LD block with @type "WebSite"
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Ship pages must include a `WebSite` JSON-LD block identifying the enclosing site (In the Wake, cruisinginthewake.com). This is separate from `WebPage` — the Website is the whole property; the WebPage is the specific page.

## Why (rationale)
WebSite schema supports sitelinks search box in Google SERPs and allows declaring publisher-level metadata (site name, search action URL, publisher Organization). Ship validator requires this; port and venue validators do not. Standards docs silent — backfill needed.

## Pass example
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "WebSite",
  "name": "In the Wake",
  "url": "https://cruisinginthewake.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://cruisinginthewake.com/search.html?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

## Fail example
Ship page missing WebSite block. Validator emits: `Missing WebSite JSON-LD schema`.

## Fix guidance
Add the WebSite block, typically near the top of the JSON-LD set. One block per page covers it — the same block is suitable across all ship pages.
