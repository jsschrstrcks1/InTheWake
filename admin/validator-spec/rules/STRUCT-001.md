---
id: STRUCT-001
name: Ship page sections appear in a canonical order (either legacy or emotional-hook)
family: struct
severity: warn
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: checkSectionOrder (via VALID_SECTION_ORDERS)
    lines: "142-160, 1145-1250"
check: detected section sequence matches at least one order in VALID_SECTION_ORDERS (legacy order OR emotional-hook order)
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
A ship page's detected sections must appear in one of the validator's declared valid orderings. The `VALID_SECTION_ORDERS` constant in `admin/validate-ship-page.js` currently accepts two: the legacy order (stats → first-look → logbook → ...) and the emotional-hook order (who-shes-for → logbook → first-look → stats → ...). Either passes; neither-match fails.

## Why (rationale)
A ship page built for the "personality in 60 seconds" promise (logbook before stats, answer-line first) shouldn't fail validation just because it put its heart first. The `PLAN-validator-emotional-hook.md` plan documented this as an open defect. The validator was updated to accept both orders. Standards docs don't currently describe the emotional-hook order — backfill required during Phase 6.

## Pass example
Legacy order:
```
<main>
  <section id="page-intro">...</section>
  <section id="first-look">...</section>
  <section id="stats">...</section>
  <section id="logbook">...</section>
  ...
</main>
```

Emotional-hook order:
```
<main>
  <section id="who-shes-for">...</section>
  <section id="logbook">...</section>
  <section id="first-look">...</section>
  <section id="stats">...</section>
  ...
</main>
```

Both pass.

## Fail example
```
<main>
  <section id="stats">...</section>
  <section id="logbook">...</section>
  <section id="page-intro">...</section>  <!-- intro after content — neither order -->
</main>
```
Validator emits section-order failure listing both valid orderings.

## Fix guidance
Choose one order deliberately and stick with it for that page. Don't interleave sections from the two orderings arbitrarily. If a new ordering needs to be supported (e.g., "specs-first" for tech-obsessed readers), add it to `VALID_SECTION_ORDERS` — update this rule too, since changing the validator's definition changes the rule.
