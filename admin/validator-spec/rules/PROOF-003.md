---
id: PROOF-003
name: No double spaces after periods
family: proof
severity: warn
applies-to:
  - all
provenance: S-only
status: live
implementation: llm-review
check: prose content does not contain two consecutive space characters after a period (typewriter convention, not web publishing)
standards-source:
  - doc: .claude/skills/publication-proofreader/SKILL.md
    section: "Typography — double spaces"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
No double spaces after periods in prose. Single space only. Double-spacing is a typewriter convention that produces uneven word-spacing in proportional web fonts.

## Why (rationale)
Double spaces are visually harmless on most screens but create inconsistent whitespace in justified text and break clean text comparison/diffing. They're also a reliable tell that content was typed in a word processor and pasted without cleanup.

## Fix guidance
Regex `\.  ` (period + two spaces) → `. ` (period + one space), applied to prose blocks only. Most editors have a "remove double spaces" function.
