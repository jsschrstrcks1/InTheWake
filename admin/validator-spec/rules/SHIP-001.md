---
id: SHIP-001
name: Ship page has answer-line AND key-facts blocks
family: ship
severity: error
applies-to:
  - ship
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateAnswerLineAndKeyFacts
    lines: "2617-2640"
check: page contains an element with class "answer-line" (or class containing "answer-line") AND an element with class "key-facts" (or class containing "key-facts")
standards-source:
  - doc: admin/claude/PLAN-ship-30-second-promise.md
    section: "ICP elements"
  - doc: admin/claude/ITW-LITE_PROTOCOL.md
    section: "Level 2 — answer-line + fit-guidance + key-facts"
  - doc: new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md
    section: "30-second promise required elements"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
A ship page must contain both:
1. An `answer-line` element — one sentence answering "what ship is this, and is it right for me?" visible in the first fold.
2. A `key-facts` block — class, year, capacity, tonnage, best-for audience, home regions, at minimum.

Both are required. Missing either fails the "30-second promise" standard.

## Why (rationale)
The site's ship pages serve readers who often have 30 seconds to decide whether to keep reading. Without answer-line and key-facts, the page forces them to scroll-and-scan. The Plan document `PLAN-ship-30-second-promise.md` tracked this across 185+ ship pages still missing these elements as of 2026-03. Validator enforces presence; absence is an error.

## Pass example
```html
<main>
  <p class="answer-line">Allure of the Seas is a 2010 Oasis-class ship for families who want endless onboard options and can live with embarkation-day crowds.</p>
  <ul class="key-facts">
    <li><b>Class:</b> Oasis</li>
    <li><b>Year:</b> 2010 (refurbished 2020)</li>
    <li><b>Capacity:</b> 5,484 guests (double occupancy)</li>
    <li><b>Tonnage:</b> 225,282 GT</li>
    <li><b>Best for:</b> Families, first-time cruisers, onboard-experience seekers</li>
  </ul>
</main>
```

## Fail example
A ship page with only a long narrative introduction and a stats table — no `.answer-line` class, no `.key-facts` class. Validator emits:
- `Missing answer-line element. Every ship page needs a quick one-line answer.`
- `Missing key-facts element. Every ship page needs a key facts summary.`

## Fix guidance
Add the two elements near the top of `<main>`. The answer-line must be genuinely informative — not template prose like "This ship offers a great cruise experience." See `PLAN-ship-30-second-promise.md` for the voice bar on answer-lines (must include at least one differentiating fact).
