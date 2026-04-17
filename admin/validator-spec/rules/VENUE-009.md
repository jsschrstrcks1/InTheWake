---
id: VENUE-009
name: Guest Experience Summary placeholder review forbidden
family: venue
severity: warn
applies-to:
  - venue
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkReviewTemplate (W08)
    lines: "W08 handler"
check: venue logbook does not contain the placeholder heading "Guest Experience Summary" or the templated prose patterns associated with it
standards-source:
  - doc: admin/VENUE_PAGE_AUDIT_2026_03_04.md
    section: "Generic logbook reviews — 'Guest Experience Summary' template (297 pages)"
  - doc: .claude/skills/venue-page-writer/SKILL.md
    section: "Authenticity stress test"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Venue logbook entries must NOT use the "Guest Experience Summary" placeholder heading or its associated templated prose. This is the single most-flagged venue defect — 297 of 472 pages (63%) carry this template per the 2026-03 audit.

## Why (rationale)
"Guest Experience Summary" is a generator-default heading used when no real logbook content was written. The prose underneath is almost always interchangeable across venues ("Guests enjoyed the atmosphere and service...") — a pure voice-audit failure pattern. Pages with this heading are shipping template, not reviews.

Warn (not error) because the fix is rewriting content, which takes time; blocking would freeze all 297 pages. The warning is the work-queue signal.

## Pass example
Logbook entry with a specific ship + date heading and voice-specific prose:
> "Dinner at Chops Grille, Allure of the Seas, Nov 2024"
>
> "Friday night crowd. Server recommended the surf-and-turf, medium-rare. Lobster tail was 6 oz, butter sauce on the side. Bread basket wasn't up to the "$35 cover" expectation — three rolls and a pat of butter. Main was solid, not great..."

## Fail (warning) example
```html
<h3>Guest Experience Summary</h3>
<p>Guests consistently praise the atmosphere, service, and quality of food at this specialty dining venue. A memorable experience for special occasions.</p>
```
Validator emits warning per W08.

## Fix guidance
Rewrite per the venue-page-writer skill + LOGBOOK_ENTRY_STANDARDS_v2.300. Real experiences, ship-dated (VENUE-005), voice-audited (VOI-001). This is one of the largest content-quality debt items on the site; the warn severity is a holding pattern while the 297-page rewrite project proceeds.
