---
id: SHIP-002
name: Ship page required sections (active ships)
family: ship
severity: error
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateSectionsDetected (required sections branch for active ships)
    lines: "1107"
check: ship pages for active ships contain all 7 required sections — page_intro, first_look, dining, logbook, faq, attribution, recent_rail. TBN (to-be-named) ships use a 6-section variant (see SHIP-003).
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Active ship pages must contain all 7 required sections: `page_intro`, `first_look`, `dining`, `logbook`, `faq`, `attribution`, `recent_rail`. Missing any one fails as BLOCKING.

(To-be-named ships are exempt from the `logbook` requirement — no real trips to log. See SHIP-003.)

## Why (rationale)
A ship page earns its reader by covering: what is this ship (page_intro), what does she look like (first_look), what do I eat (dining), what have others said (logbook), what's left I want to ask (faq), who took the photos (attribution), what similar content is there (recent_rail). Skipping any one produces either an incomplete first impression or a page that hides its editorial soul (logbook).

Validator enforces at BLOCKING. Standards describe sections individually but don't enumerate the required-set. Backfill needed.

## Pass example
Ship page with sections in the file: page_intro, first_look, dining, logbook, videos, faq, attribution, recent_rail. All 7 required present (+ optional videos). Passes.

## Fail example
Ship page missing logbook. Validator emits: `Missing required sections: logbook`.

## Fix guidance
Add the missing section(s). Each has its own content bar:
- `page_intro` must include answer-line + key-facts (SHIP-001)
- `first_look` word count 50-150 (SHIP-004)
- `dining` needs the dining hero (SHIP-005 — under conflict)
- `logbook` needs required personas (SHIP-006)

## Related
- SHIP-003 — TBN ship variant
- STRUCT-001 — section order (legacy or emotional-hook)
