---
id: VENUE-005
name: Logbook entries have ship + date attribution
family: venue
severity: warn
applies-to:
  - venue
provenance: V-only
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkLogbookAttribution (W06)
    lines: "various (W06 handler)"
check: each logbook entry on a venue page carries a ship name + visit date; missing attribution warns
standards-source:
  - doc: admin/claude/LOGBOOK_WRITING_GUIDE.md
    section: "Fact verification — ship-dated references"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Each logbook entry on a venue page should carry a ship name and a visit date (or cruise date). Entries without attribution warn — they can't be verified, and they lose the "this was an actual experience on an actual ship" trust signal.

## Why (rationale)
Logbook entries are only valuable if they're real. Ship + date is the minimum proof: the reader can cross-reference against sailing schedules, the writer has to have been there, and the signal survives time (a 2022 entry from Symphony of the Seas has different weight than a 2024 entry from Icon). The venue-page-writer skill's fact verification checklist makes this explicit.

## Pass example
```html
<div class="logbook-entry">
  <h3>Dinner at Chops Grille, Allure of the Seas, Nov 2024</h3>
  <p>The surf-and-turf came medium-rare as ordered, the lobster tail was...</p>
</div>
```

## Fail (warning) example
```html
<div class="logbook-entry">
  <h3>Great steakhouse!</h3>
  <p>The food was excellent and service was perfect.</p>
</div>
```
No ship, no date. Validator emits: `Missing ship+date attribution in logbook`.

## Fix guidance
Add ship name and month/year to each logbook entry heading. If the entry genuinely has no attribution (it's a composite persona voice, not a specific visit), mark it accordingly — but then it fails VENUE-010 (templated review) instead. Honest attribution or honest persona; not ambiguity.
