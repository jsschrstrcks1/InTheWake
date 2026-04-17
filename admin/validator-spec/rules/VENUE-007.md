---
id: VENUE-007
name: Generic FAQ phrase contamination (specialty-dining FAQ on wrong venue type)
family: venue
severity: error
applies-to:
  - venue
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkFAQRelevance (S04)
    lines: "553-567, 197-225 (phrase list), 226-228 (venue style list)"
check: if venue style is in NO_RESERVATION_FAQ_STYLES (counter-service, coffee, dessert, bar, activity, neighborhood) AND FAQ contains any phrase from GENERIC_FAQ_PHRASES list → BLOCKING. If phrases present without style mismatch → WARN.
standards-source:
  - doc: admin/VENUE_PAGE_AUDIT_2026_03_04.md
    section: "Duplicated FAQ answers — text repeated within same JSON answer (9 pages)"
  - doc: admin/claude/LOGBOOK_WRITING_GUIDE.md
    section: "Venue voice — match FAQ to venue type"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Venue FAQ answers must match the venue type. The validator maintains a `GENERIC_FAQ_PHRASES` list of specialty-dining boilerplate (reservation advice, dress code expectations, tasting-menu references). A counter-service, coffee, dessert, bar, activity, or neighborhood venue that carries these phrases is presenting nonsense — a quick-service ice cream stand does not need a reservation FAQ.

- **BLOCKING:** venue style in `NO_RESERVATION_FAQ_STYLES` AND generic-phrase match found
- **WARN:** any venue has generic phrases (signal of templated rather than venue-specific FAQ)

## Why (rationale)
The 2026-03 venue audit found 9 pages with duplicated FAQ text copied from a specialty-dining template onto casual venues. The result: Sprinkles Ice Cream (counter-service) had a FAQ explaining reservation norms for fine dining. The specific contamination made the site actively misleading.

## Pass example
A counter-service ice cream stand's FAQ:
> Q: How do I pay?
> A: Charged to your SeaPass card. Cash not accepted.
>
> Q: Are there dairy-free options?
> A: Yes — sorbet on every ship; vegan soft-serve on Quantum class and newer.

Venue-type-appropriate. Passes.

## Fail example (BLOCKING)
Sprinkles Ice Cream FAQ contains the phrase "reservations are recommended for peak dining hours." Validator emits: `Generic specialty-dining FAQ on counter-service venue. "reservations are recommended..." makes no sense for this venue type`.

## Fix guidance
Rewrite FAQ answers per venue type. The GENERIC_FAQ_PHRASES list in the validator is the reject set; don't edit it to add your phrase — the rule catches the contamination by design. If your venue legitimately needs one of the listed phrases, rephrase the answer without the boilerplate.
