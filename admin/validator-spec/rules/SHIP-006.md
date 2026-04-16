---
id: SHIP-006
name: Logbook contains required persona categories
family: ship
severity: warn
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateLogbookPersonas
    lines: "99-103, 1856-1870"
check: ship logbook section contains content tagged with all 7 required persona labels — solo, multi-generational, honeymoon, elderly, single woman, single man, single parent; validator warns if more than 3 personas are missing
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
A ship's logbook section should include content addressing multiple persona perspectives. The validator tracks 7 declared personas:

1. **solo** — solo travelers
2. **multi-generational** — three-generation family trips
3. **honeymoon** — couples at life's start
4. **elderly** — older travelers, mobility-aware content
5. **single woman** — solo female travel considerations
6. **single man** — solo male travel considerations
7. **single parent** — single-parent families

The validator WARNS when more than 3 of the 7 are missing from the logbook (line 1866-1870). Not a hard block — some ships legitimately have fewer distinct persona stories, and the pastoral voice requires stories to be earned, not invented.

## Why (rationale)
A single-persona logbook defaults to "ship overview as experienced by a generic cruiser." That's the voice-audit failure mode — interchangeable descriptions (VOI-001). Personas force differentiation: a solo woman's Icon-of-the-Seas day feels different from a single parent's day, and the differences are exactly what the site exists to articulate.

Warn severity (not error) reflects the tension: forcing all 7 personas on every page would push writers toward template prose to satisfy the count. Quality of real persona voice > coverage checkbox.

## Pass example
Logbook with 5 persona-tagged entries (solo, multi-generational, honeymoon, elderly, single parent) — single-woman and single-man not yet written. Validator doesn't warn (only 2 missing, threshold is 3+).

## Fail (warning) example
Logbook with only 2 persona-tagged entries (solo, honeymoon). Five missing. Validator emits: `Missing personas: multi-generational, elderly, single woman, single man, single parent`.

## Fix guidance
Add real persona-grounded logbook entries over time — don't batch-generate fake ones to hit the count. The 85-page "missing logbook personas" flag from the 2026-02 ship audit is tracked as a real content-quality issue, not a validation hurdle to game.

## Related
- LOGBOOK_ENTRY_STANDARDS_v2.300 — the narrative standard each persona entry must follow
- VOI-001 — voice rules catching templated persona prose
