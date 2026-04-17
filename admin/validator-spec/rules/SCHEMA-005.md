---
id: SCHEMA-005
name: BreadcrumbList JSON-LD schema required
family: schema
severity: error
applies-to:
  - all
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateICPLite (hasBreadcrumbs check)
    lines: "819-825"
  - file: admin/validate-ship-page.js
    function: validateJSONLD (required types)
    lines: "587-592"
  - file: admin/validate-venue-page-v2.js
    function: T-code BreadcrumbList check
    lines: "447-448"
check: at least one parsed JSON-LD block has @type "BreadcrumbList"
standards-source:
  - doc: admin/claude/ONBOARDING.md
    section: "JSON-LD requirements"
  - doc: new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md
    section: "BreadcrumbList schema"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every page must include a `BreadcrumbList` JSON-LD block describing the page's location in the site's hierarchy (Home → Ports → Nassau, or Home → Ships → Royal Caribbean → Icon).

## Why (rationale)
Breadcrumb rich results let search engines show the page's site-location path directly in results. They also feed AI assistants building navigation context. Without the block, the site's structure is invisible to machines even if a visible breadcrumb trail is on the page.

## Pass example
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",
      "item": "https://cruisinginthewake.com/" },
    { "@type": "ListItem", "position": 2, "name": "Ports",
      "item": "https://cruisinginthewake.com/ports.html" },
    { "@type": "ListItem", "position": 3, "name": "Nassau" }
  ]
}
</script>
```

## Fail example
Page with WebPage + FAQPage but no BreadcrumbList. Validator emits: `Missing BreadcrumbList JSON-LD schema`.

## Fix guidance
Add the block. Positions must be contiguous integers starting at 1. The last item typically omits `item:` (the current page has no separate URL to link to itself).
