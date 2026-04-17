---
id: SHIP-009
name: Personality-first ordering compatibility (who_shes_for before first_look)
family: ship
severity: info
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateSectionsDetected (personality-first detection)
    lines: "1161-1165"
check: ship page uses personality-first ordering if EITHER who_shes_for section is present OR logbook appears before first_look in source order; historic ships and TBN ships exempt from the check
standards-source:
  - doc: admin/claude/PLAN-validator-emotional-hook.md
    section: "Emotional-hook ordering — personality-first"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
A ship page is considered "personality-first" if it satisfies at least one of:
1. The page includes a `who_shes_for` section (explicit personality callout), OR
2. The `logbook` section appears before the `first_look` section in source order (emotional-hook order from STRUCT-001).

Pages that satisfy neither are "legacy-ordered" — valid, but lose the 30-second-promise benefit of leading with editorial voice.

The check is informational (not error or warning). Historic-style ships and TBN ships are exempt.

## Why (rationale)
The `PLAN-validator-emotional-hook.md` document documents the shift from legacy ordering (specs-first) to personality-first ordering (logbook or who_shes_for early). Validator detects which ordering a page uses and records it for reporting — so the team can track adoption of the personality-first pattern across the fleet.

This was a deliberate design change captured as a validator enhancement. The info-severity keeps it from blocking any ship page while making adoption visible.

## Pass example (personality-first via who_shes_for)
```html
<main>
  <section class="page-intro">...</section>
  <aside class="who-shes-for">Who She's For: couples, families with teens, first-time cruisers.</aside>
  <section class="first-look">...</section>
  ...
```

## Pass example (personality-first via logbook-before-first-look)
```html
<main>
  <section class="page-intro">...</section>
  <section class="logbook">...</section>
  <section class="first-look">...</section>
  ...
```

## Legacy-ordered (valid but info-flagged)
```html
<main>
  <section class="page-intro">...</section>
  <section class="first-look">...</section>
  <section class="logbook">...</section>
  ...
```

## Fix guidance
Adding who_shes_for is the low-friction upgrade: it's a small aside-style callout that doesn't require restructuring the page. Moving logbook before first_look is a bigger structural change and affects SHIP-007 (grid2 layout pairing).

See STRUCT-001 for the section-order rule that accepts both orderings as valid.
