---
id: SCHEMA-003
name: WebPage (or TouristDestination for ports) JSON-LD schema required
family: schema
severity: error
applies-to:
  - all
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateICPLite (hasPageSchema check)
    lines: "778-810"
  - file: admin/validate-ship-page.js
    function: validateJSONLD (required types iteration)
    lines: "587-592"
  - file: admin/validate-venue-page-v2.js
    function: T-code WebPage check
    lines: "443-444"
check: at least one parsed JSON-LD block has @type "WebPage"; port pages also accept "TouristDestination" as a valid substitute
standards-source:
  - doc: admin/claude/ONBOARDING.md
    section: "JSON-LD Mirroring"
  - doc: admin/claude/TECHNICAL_STANDARDS.md
    section: "Required JSON-LD schemas"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every page must include a JSON-LD block whose `@type` is `WebPage`. Port pages additionally accept `TouristDestination` as an acceptable WebPage-substitute (Schema.org recognizes both as Thing subtypes).

## Why (rationale)
`WebPage` is the generic root for any page's structured data. Without it, there's no container for `dateModified`, `description`, `mainEntity` (which are required by ICP-013, ICP-014, SCHEMA-001). Pages can still have FAQPage or BreadcrumbList blocks without WebPage, but the core page-identity data has nowhere to live.

## Pass example
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "WebPage",
  "name": "Nassau, Bahamas — Cruise Port Guide" }
</script>
```

OR for ports:
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "TouristDestination",
  "name": "Nassau" }
</script>
```

## Fail example
Page with only FAQPage + BreadcrumbList blocks, no WebPage. Validator emits: `Missing WebPage or TouristDestination JSON-LD schema` (port) or `Missing WebPage JSON-LD schema` (ship/venue).

## Fix guidance
Add a WebPage block. It's the container for ICP-013 (dateModified) and ICP-014 (description) and SCHEMA-001 (mainEntity) — so you almost certainly need it anyway to pass those rules.
