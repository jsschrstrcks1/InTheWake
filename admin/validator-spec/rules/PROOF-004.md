---
id: PROOF-004
name: Proper ellipsis character instead of three dots
family: proof
severity: info
applies-to:
  - all
provenance: S-only
status: live
implementation: llm-review
check: prose content uses the Unicode ellipsis character (…) not three consecutive periods (...)
standards-source:
  - doc: .claude/skills/publication-proofreader/SKILL.md
    section: "Typography — ellipsis"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Prose should use the Unicode ellipsis `…` (U+2026) rather than three periods `...`. Info severity — not blocking, not even warning, just a polish note.

## Why (rationale)
Three periods render with variable inter-dot spacing depending on the font. The single ellipsis character has consistent spacing and correct screen-reader pronunciation ("ellipsis" vs "period period period"). Lowest-priority typography rule.

## Fix guidance
Regex `\.\.\.` → `…` in prose blocks. Most word processors auto-convert; the issue arises from pasting code-style text or markdown-authored content.
