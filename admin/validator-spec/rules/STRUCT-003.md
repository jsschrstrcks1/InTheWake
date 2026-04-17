---
id: STRUCT-003
name: Port page must contain all 8 REQUIRED sections
family: struct
severity: error
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateSectionOrder (REQUIRED_SECTIONS check)
    lines: "267-271, 983-1035"
check: port page contains all 8 sections in REQUIRED_SECTIONS — hero, logbook, cruise_port, getting_around, excursions, depth_soundings, faq, gallery. Detected via heading text OR section/div id/class matching SECTION_PATTERNS regex.
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
Every port page must contain all 8 required sections:
1. **hero** — header imagery with port name
2. **logbook** — first-person pastoral story (≥800 words, see PORT-002)
3. **cruise_port** — the terminal and immediate surroundings
4. **getting_around** — transport options from the pier
5. **excursions** — things to do
6. **depth_soundings** — final thoughts / the honest story
7. **faq** — common questions
8. **gallery** — photo gallery

Missing any one fails as BLOCKING. Other sections (map, beaches, history, cultural, shopping, food, notices, practical, credits, back_nav) are optional.

## Why (rationale)
These 8 constitute the minimum viable port page. A reader's morning-of-port-day arc cannot be completed without them: hero (recognition) → logbook (emotional anchor) → cruise_port (where you step off) → getting_around (how you move) → excursions (what to do) → depth_soundings (the real story) → FAQ (residual questions) → gallery (visual confirmation). Skipping any one leaves a gap a reader will notice.

Standards docs describe these sections individually but don't enumerate the required-set. Backfill in Phase 6.

## Pass example
Port page detected sections: `hero, logbook, cruise_port, getting_around, excursions, depth_soundings, gallery, faq`. All 8 present. Passes.

## Fail example
Port page detected sections: `hero, cruise_port, getting_around, excursions, gallery, faq`. Missing logbook AND depth_soundings. Validator emits: `Missing required sections: logbook, depth_soundings`.

## Fix guidance
Add the missing sections. Each has a minimum word count (PORT-002 through PORT-007) — shipping empty placeholder headings to satisfy this rule will fail the word-count rules immediately.
