---
id: THEO-001
name: Soli Deo Gloria invocation present and positioned before content
family: theological
severity: error
applies-to:
  - all
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateSoliDeoGloria
    lines: "3034-3060"
  - file: admin/validate-ship-page.js
    function: validateSoliDeoGloriaComment
    lines: "393-420"
  - file: .claude/standards/theological.yml
    function: standards-yaml-declaration
    lines: "whole file"
check: html contains "Soli Deo Gloria" inside an HTML comment block that appears before <!doctype html> or within the first 3 source lines
standards-source:
  - doc: admin/claude/PASTORAL_GUARDRAILS.md
    section: "Theological foundation — immutable"
  - doc: admin/claude/CLAUDE.md
    section: "Critical NEVER DO Rules — Integrity"
  - doc: .claude/ONBOARDING.md
    section: "Theological Requirements (NON-NEGOTIABLE)"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every HTML file in the site MUST contain the Soli Deo Gloria invocation (with at least one Scripture reference — Proverbs 3:5 or Colossians 3:23) inside an HTML comment block at the very top of the file, before `<!doctype html>` and within the first 3 source lines.

## Why (rationale)
This is the theological foundation of the site — "excellence as worship." It is immutable across all standards versions. Claude must not move it, shorten it, or relocate it for SEO, performance, or any technical reason. The rule has independent grounding in three locations (port validator, ship validator, standards YAML) — all agree.

## Pass example
```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily..." — Colossians 3:23
-->
<!doctype html>
<html lang="en">
```

## Fail example
```html
<!doctype html>
<!--
Soli Deo Gloria
-->
<html lang="en">
```
Fails because the comment block appears *after* `<!doctype html>`. The port validator (line 3058) flags this as `soli_deo_gloria_position: Soli Deo Gloria found but not in first 3 lines. Should appear before <!doctype html>.`

## Fix guidance
Move the entire Soli Deo Gloria comment block to the first lines of the file, before `<!doctype html>`. Keep the full four-line invocation with both Scripture references. Never compress to a single-line comment — the full text IS the rule.
