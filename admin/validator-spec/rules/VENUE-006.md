---
id: VENUE-006
name: venue-tags meta tag present with style / cruise-line / ship-availability attributes
family: venue
severity: warn
applies-to:
  - venue
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkVenueTagsMeta (S07)
    lines: "644-650 (added 2026-04-16)"
check: venue page has <meta name="venue-tags" content="..."> (presence check; structure validation deferred to future enhancement)
standards-source:
  - doc: admin/VENUE_PAGE_AUDIT_2026_03_04.md
    section: "Missing venue-tags meta: 453 of 472 pages (96%)"
  - doc: new-standards/foundation/VENUE_PAGE_STANDARDS_v3.010.md
    section: "Venue metadata — venue-tags"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Venue pages should include a `<meta name="venue-tags">` tag carrying machine-parseable style, cruise-line, and ship-availability attributes. Standards document this as a metadata requirement; no validator currently enforces. Rule is on the orphan list awaiting implementation.

## Why (rationale)
The 2026-03 venue audit found 453 of 472 venue pages (96%) missing venue-tags meta. This tag is the machine-parseable surface for the site's venue filtering tools and AI-assistant "find me a steakhouse on a Royal Caribbean ship" queries. Without it, venue discovery falls back to scraping page body text — unreliable.

## Pass example
```html
<meta name="venue-tags" content="style:steakhouse cruise-line:royal-caribbean ships:allure,harmony,icon,oasis,symphony,wonder price:specialty-dining reservation:recommended"/>
```

## Fail example
```html
<!-- no venue-tags meta -->
```
No validator currently flags this. Audit manually catches absence.

## Fix guidance
Add the tag. The exact schema for tag values should become part of regenerated standards (Phase 6). In the meantime, use the format: `style:<style>`, `cruise-line:<line-slug>`, `ships:<comma-separated-slugs>`, `price:<tier>`, `reservation:<required|recommended|not-needed>`.

Validator implementation: pattern match on meta[name="venue-tags"] presence, then regex-validate the tag structure. Small code addition; high-value gap.
