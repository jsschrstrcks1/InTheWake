---
id: PORT-007
name: FAQ section minimum 200 words
family: port
severity: error
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateWordCounts (faq)
    lines: "1121-1128"
check: word count in the FAQ section text >= 200
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
The FAQ section must contain at least 200 words of question + answer text. The visible FAQ content must also be mirrored in the FAQPage JSON-LD block (SCHEMA-004) — the two are linked.

## Why (rationale)
FAQ pages rank disproportionately well in search and AI-assistant answers. 200 words covers roughly 4-6 real questions with one- or two-sentence answers — enough to capture the actual reader-facing concerns (tender vs dock? walkable downtown? safety? stroller-friendly?). Less than 200 means templated Q&A with no substance.

## Pass example
Six questions covered, each with a 30-40 word answer. Total ~210 words. Passes.

## Fail example
Three questions with one-line yes/no answers. Total ~90 words. Validator emits: `FAQ section has 90 words, minimum is 200`.

## Fix guidance
Add more questions, or expand short answers to include the WHY ("Does Nassau dock or tender?" → "Dock — Prince George Wharf is a fixed-pier dock. You walk off. No tender required. The exception is when all three Oasis-class ships are in port simultaneously and one of them ends up at the commercial pier; that's rare and your cruise line will tell you in advance."). See VENUE_PAGE_AUDIT_2026_03_04 — duplicated FAQ answers across pages were flagged for 9 venues; originality matters here too.

## Related
- SCHEMA-004 — FAQPage JSON-LD required
- VENUE-001 + the audit document warn about duplicated/templated FAQ content
