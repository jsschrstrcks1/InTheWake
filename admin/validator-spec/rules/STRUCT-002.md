---
id: STRUCT-002
name: Port page sections appear in the EXPECTED_MAIN_ORDER sequence
family: struct
severity: warn
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateSectionOrder (EXPECTED_MAIN_ORDER)
    lines: "260-265, 983-1035"
check: detected port-page sections in source order match the EXPECTED_MAIN_ORDER sequence (missing sections OK; out-of-order sections fail)
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
A port page's detected sections must appear in the sequence defined by `EXPECTED_MAIN_ORDER`:

```
hero → logbook → featured_images → cruise_port → getting_around →
map → beaches → excursions → history → cultural → shopping →
food → notices → depth_soundings → practical → gallery →
credits → faq → back_nav
```

Not every port needs every section (REQUIRED_SECTIONS in STRUCT-003 lists the must-haves). Sections that DO appear must appear in this order. Out-of-order = warn.

## Why (rationale)
Readers learn the reading pattern from their first port page and expect the same shape on the next. Hero first. Story before facts (logbook before cruise_port). Practical guidance before excursions (getting_around before excursions). Credits before FAQ, FAQ before back navigation. The order is not arbitrary — it maps to a cruiser's decision-making arc on the morning of a port day.

Validator emits warning (not error) because some legitimate sequencing edits may occur; the warning creates visibility without blocking.

## Pass example
Port page with sections in order: hero, logbook, cruise_port, getting_around, excursions, depth_soundings, gallery, faq. Skipped sections (map, beaches, history, cultural, shopping, food, notices, practical, credits, back_nav) — fine. Order of the present ones matches EXPECTED_MAIN_ORDER — passes.

## Fail example
Section order: hero, getting_around, logbook, cruise_port, excursions. Logbook should precede cruise_port; getting_around should follow cruise_port. Two out-of-order. Validator emits warning listing actual vs expected.

## Fix guidance
Review the section sequence. Common fix: move the logbook section up to follow hero. Reorder excursions / food / notices / depth_soundings / practical / gallery per the canonical order.

## Related
- STRUCT-001 — ship page section order (ships have their own order + an emotional-hook alternate)
- STRUCT-003 — required sections that cannot be skipped
