---
id: PROOF-005
name: No placeholder text in published content (Lorem ipsum, TBD, TODO, Coming soon)
family: proof
severity: error
applies-to:
  - all
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: various forbidden-pattern checks
    lines: "284-300, 3660-3680"
check: visible page text does not contain placeholder strings — "Lorem ipsum", "TBD", "TODO", "Coming soon" (in non-exempted contexts), "[placeholder]", "[insert here]"
standards-source:
  - doc: admin/claude/CLAUDE.md
    section: "NEVER lorem ipsum or 'coming soon' pages"
  - doc: .claude/skills/publication-proofreader/SKILL.md
    section: "Content polish — no placeholder text"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Published pages must not contain placeholder text. "Lorem ipsum", "TBD", "TODO" (in visible prose, not code comments), "Coming soon" (on active content — see VENUE-011 for the venue-specific version), "[placeholder]", and "[insert here]" all fail. The port validator's forbidden-pattern list at lines 284-300 catches several of these; CLAUDE.md's "NEVER" list includes lorem ipsum and coming-soon explicitly.

## Why (rationale)
Placeholder text shipped to production means the page went live before its content was ready. For readers making real travel decisions — booking cabins, planning port days, budgeting excursion costs — a section that says "TBD" is a betrayal of the implicit promise the page made by existing. CLAUDE.md treats this as inviolable.

## Pass example
```html
<p>Cable Beach is 25 minutes by jitney from Prince George Wharf, $1.25 one-way.</p>
```

## Fail example
```html
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
<p>TBD — will add excursion info later.</p>
<p>[Insert port-specific content here]</p>
```

## Fix guidance
Write the real content or remove the section entirely. A missing section is better than a placeholder — it's honest about what the page doesn't cover. See STRUCT-003 for the required-section rules that govern which sections must exist.
