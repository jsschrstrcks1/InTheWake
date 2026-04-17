---
id: PROOF-001
name: Curly quotes used consistently (no straight quotes in prose)
family: proof
severity: warn
applies-to:
  - all
provenance: S-only
status: live
implementation: llm-review
check: prose content uses curly/typographic quotes (" " ' ') not straight quotes (" ') in visible text; code blocks and HTML attributes exempt
standards-source:
  - doc: .claude/skills/publication-proofreader/SKILL.md
    section: "Typography — curly quotes"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Visible prose must use typographic (curly) quotes — `"` `"` `'` `'` — not straight ASCII quotes `"` `'`. HTML attributes, code blocks, and `<script>` content are exempt.

## Why (rationale)
Typographic quotes are a baseline publishing quality signal. Straight quotes in prose tell readers the content was machine-generated or copy-pasted from code without editorial polish. The publication-proofreader skill checks this; no regex validator currently enforces it at commit time.

## Fix guidance
Most modern editors auto-convert. For batch fixes: regex `"([^"]*)"` → `\u201C$1\u201D` on prose blocks only (not inside tags). The proofreader skill handles detection during LLM review.
