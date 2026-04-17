---
id: PROOF-002
name: Em-dashes used instead of double-hyphens
family: proof
severity: warn
applies-to:
  - all
provenance: S-only
status: live
implementation: llm-review
check: prose content uses em-dash (—) not double-hyphen (--) for parenthetical breaks; en-dash (–) used for ranges (e.g., "$8–$15")
standards-source:
  - doc: .claude/skills/publication-proofreader/SKILL.md
    section: "Typography — em-dashes and en-dashes"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Prose uses em-dash `—` for parenthetical breaks (not `--`). Number/date ranges use en-dash `–` (not `-`). Example: "Cable Beach — the postcard option — is 25 minutes by jitney" and "excursions $8–$15 per person."

## Why (rationale)
Double-hyphens are a typewriter convention. Em-dashes are the publishing standard. The site's voice guide (Like-a-human) uses em-dashes extensively for gear-shift markers ("But —", "And then —"). Consistent typography supports the steady-observer voice.

## Fix guidance
Find-replace `--` → `—` in prose (not in code/attributes). For ranges, `(\d+)\s*-\s*(\d+)` → `$1–$2`. The publication-proofreader skill catches both during LLM review.
