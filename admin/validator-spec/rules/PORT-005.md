---
id: PORT-005
name: Excursions section minimum 400 words
family: port
severity: error
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateWordCounts (excursions)
    lines: "1099-1108"
check: word count in the excursions section text >= 400
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
The excursions section (things to do ashore) must contain at least 400 words.

## Why (rationale)
Excursions is the primary "what should I actually do with my day" answer. 400 words is enough to cover ~4-5 options with real specifics (location, cost, time, what to bring, who it's for). Thinner than that degrades into "you can visit beaches and see historic sites" — template prose that fails VOI-001.

The 400-word minimum is not negotiable because this is where readers who stop reading at this section form their whole plan. It has to be usable on its own.

## Pass example
Nassau excursions section covering: Atlantis day pass (price, transport, kid-friendly assessment); Queen's Staircase + Fort Fincastle (walking distance, time required, accessibility note); Junkanoo Beach (walk-to beach nearest the terminal); Cable Beach (transport + cost + comparison to Atlantis beach); Straw Market (what's actually worth buying, negotiation norms); Pirates of Nassau museum (indoor alternative when weather turns). ~450 words.

## Fail example
Excursions section at 120 words listing three generic options. Validator emits: `Excursions section has 120 words, minimum is 400`.

## Fix guidance
For each option include: one-sentence description of the experience, cost, transport + time to get there, what to bring, a practical assessment (good for families? for mobility-limited travelers? for grief-heavy days when a quiet beach is better than a themed attraction?). The VOI voice-audit applies — generic "you'll love" prose fails both rules.
