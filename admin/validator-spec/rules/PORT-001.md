---
id: PORT-001
name: Port page includes a notices / advisories section
family: port
severity: warn
applies-to:
  - port
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: detectSectionsInMain (notices pattern at SECTION_PATTERNS)
    lines: "250, 983-1030, 263-278"
check: main contains an element with id="notices" OR a heading matching /(special )?notices?|warnings?|alerts?|important|know before/i
standards-source:
  - doc: admin/claude/PORT-PAGE-STANDARD.md
    section: "Required sections"
  - doc: admin/PORT_VALIDATION_STATUS.md
    section: "Missing elements fleet-wide"
  - doc: admin/claude/SITE_REFERENCE.md
    section: "Port page structure"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every port page must contain a "notices" section — a callout for advisories, seasonal warnings, tender-only status, safety notes, or port-specific gotchas that a reader should see before planning the day. The section is detected either by `id="notices"` or a heading text matching the pattern `(special )?notices?|warnings?|alerts?|important|know before`.

## Why (rationale)
Safety and preparation content is a core pastoral duty of this site — readers planning to cruise Nassau need to know about the 2024 crime advisories; Glacier Bay visitors need to know about reservation windows; Labadee visitors need to know that getting sunburned on a tender day without water is a real concern. The validator flags pages missing this section because the content is often missing, not hidden.

A 2026-02 fleet-wide audit found ~79% of port pages missing `id="notices"` (per `PORT_VALIDATION_STATUS.md`).

## Pass example
```html
<section id="notices" class="section-collapse">
  <h2>Know Before You Go</h2>
  <details>
    <summary>Safety advisory (current)</summary>
    <p>US State Department maintains a Level 2 advisory for New Providence due to crime in certain downtown-adjacent areas. Taxi drivers are licensed and safe; independent walking after dark in areas east of Bay Street is discouraged.</p>
  </details>
  <details>
    <summary>Seasonal (June–November)</summary>
    <p>Hurricane season affects itinerary probability. Most cruise lines re-route or skip Nassau when systems approach; your shore-excursion refund policy matters.</p>
  </details>
</section>
```

## Fail example
A port page with hero → logbook → cruise-port → getting-around → ... but no notices block anywhere. Validator emits a notice in its section-detection report: port has no `notices` section matched.

## Fix guidance
Add the section even for ports with nothing obviously to warn about — at minimum note weather/seasonality, tender-vs-dock status, and visa/passport reminders. When there's nothing substantive to say, that's itself worth saying explicitly ("No active advisories as of YYYY-MM") rather than omitting the section.
