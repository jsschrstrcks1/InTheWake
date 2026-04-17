---
id: SCHEMA-001
name: Entity pages declare mainEntity in JSON-LD
family: schema
severity: error
applies-to:
  - port
  - ship
  - venue
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateMetadataAndCompliance (JSON-LD section)
    lines: "780-835"
check: page has a WebPage (or equivalent) JSON-LD block with a `mainEntity` property resolving to a typed entity (Place for ports, Product for ships, Restaurant or SportsActivityLocation for venues)
standards-source:
  - doc: admin/claude/CLAUDE.md
    section: "ICP-Lite v1.4 — mainEntity Required"
  - doc: .claude/ONBOARDING.md
    section: "mainEntity required on entity pages"
  - doc: new-standards/v3.010/ICP_LITE_v1.0_PROTOCOL.md
    section: "JSON-LD mainEntity specification"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every entity page (a page whose subject is a specific cruise ship, port, or restaurant/venue) must include a JSON-LD `@type: WebPage` (or suitable parent type) block with a `mainEntity` property referring to the typed entity. The entity type must match the page type: `Place` for ports, `Product` for ships, `Restaurant` / `SportsActivityLocation` / `AmusementPark` for venues.

## Why (rationale)
Schema.org's `mainEntity` tells crawlers, AI assistants, and rich-result systems what the page is primarily about. Without it, a port page looks generically like any webpage. With it, the page participates in structured-data ecosystems (Google's Place knowledge panel, AI summaries, voice-assistant responses).

## Pass example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Nassau, Bahamas — Cruise Port Guide",
  "description": "...",
  "dateModified": "2026-04-15",
  "mainEntity": {
    "@type": "Place",
    "name": "Port of Nassau",
    "address": { "@type": "PostalAddress", "addressLocality": "Nassau", "addressCountry": "BS" },
    "geo": { "@type": "GeoCoordinates", "latitude": 25.0838, "longitude": -77.3412 }
  }
}
</script>
```

## Fail example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Nassau, Bahamas — Cruise Port Guide"
}
</script>
```
Missing `mainEntity`. Validator emits: `Page schema JSON-LD must have mainEntity (Place for ports, FAQPage for FAQ)` (line 832).

## Fix guidance
Add the `mainEntity` block. The entity type must match the page category. Do NOT substitute `FAQPage` for `mainEntity` unless the FAQ really is the primary subject of the page (it isn't, on entity pages). Pair FAQ schema as a separate `@graph` entry.
