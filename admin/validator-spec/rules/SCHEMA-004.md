---
id: SCHEMA-004
name: FAQPage JSON-LD schema required
family: schema
severity: error
applies-to:
  - all
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateICPLite (hasFAQPage check)
    lines: "811-817"
  - file: admin/validate-ship-page.js
    function: validateJSONLD (required types)
    lines: "587-592"
  - file: admin/validate-venue-page-v2.js
    function: T-code FAQPage check
    lines: "451-452"
check: at least one parsed JSON-LD block has @type "FAQPage"
standards-source:
  - doc: admin/claude/TECHNICAL_STANDARDS.md
    section: "Required JSON-LD — FAQPage"
  - doc: new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md
    section: "FAQ section"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every page must include a `FAQPage` JSON-LD block whose `mainEntity` is a list of `Question` entities. The `FAQPage` must correspond to visible FAQ content on the page (validator doesn't verify the 1-to-1 correspondence today, but see LOG / STRUCT family for related rules).

## Why (rationale)
Google and Bing render FAQ rich-results directly in SERPs when FAQPage JSON-LD is present. It's the single highest-leverage structured-data type on a travel site. Every page gets a FAQ section and every FAQ section should have the schema.

## Pass example
```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Does Nassau dock or tender?",
      "acceptedAnswer": { "@type": "Answer", "text": "Nassau's Prince George Wharf is a dock port — no tender required." } },
    { "@type": "Question", "name": "How far is downtown from the cruise terminal?",
      "acceptedAnswer": { "@type": "Answer", "text": "Bay Street is a 5-minute walk from Prince George Wharf." } }
  ]
}
</script>
```

## Fail example
Page with only WebPage + BreadcrumbList. Validator emits: `Missing FAQPage JSON-LD schema`.

## Fix guidance
Add a FAQPage block whose `mainEntity` lists the page's real FAQ questions and answers. Do not fabricate FAQ items to satisfy the schema — write the FAQ section first, then mirror into JSON-LD.
