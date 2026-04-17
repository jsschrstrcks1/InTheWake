---
id: SCHEMA-011
name: Review reviewBody must not contain generic templated text
family: schema
severity: warn
applies-to:
  - ship
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateJSONLD (generic_review_text check)
    lines: "631-648"
check: Review.reviewBody text (lowercased) does NOT contain any of the known templated phrases — "offers memorable cruise experiences with excellent amenities", "memorable cruise experiences with excellent amenities and service", etc.
standards-source:
  - doc: admin/SHIP_VALIDATION_AUDIT_2026_02_14.md
    section: "Generic review text — JSON-LD review bodies use template instead of real editorial (208 pages)"
  - doc: .claude/skills/Humanization/voice-audit.md
    section: "Generic interchangeable descriptions — fails"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
A ship page's `Review.reviewBody` content must not contain known templated marketing phrases. The validator maintains a list of offender-phrases ("offers memorable cruise experiences with excellent amenities", etc.) and warns when any match. The list grows as new templated phrases are discovered in audits.

## Why (rationale)
The 2026-02 ship validation audit found 208 ship pages (out of 315) whose Review.reviewBody was templated marketing copy — not real editorial content. The template-detection list in the validator was populated from that audit. Voice-audit (VOI-001) would flag the same text at page-body level; SCHEMA-011 catches it in the JSON-LD specifically.

## Pass example
```html
{ "@type": "Review", "reviewBody": "Allure's size is the draw and the trade-off. In the first hour aboard you will either be overwhelmed by the number of choices or delighted — there is no middle ground." }
```
Real, specific, voice-driven.

## Fail example
```html
{ "@type": "Review", "reviewBody": "Allure of the Seas offers memorable cruise experiences with excellent amenities and service." }
```
Validator emits (WARNING): `Review contains generic templated text — reviewBody should reflect real editorial assessment`.

## Fix guidance
Rewrite the reviewBody with a concrete, specific observation about this specific ship. If you can't — because you haven't actually researched it — leave reviewBody out entirely rather than filling it with template prose. An empty-but-present Review with author and itemReviewed is better than a Review full of interchangeable marketing claims.

## Extension note
The templated-phrase list is incomplete. As new templates are spotted during audits, lines 635-639 of validate-ship-page.js should gain entries. Track this in a separate spec refinement issue (not per-rule).
