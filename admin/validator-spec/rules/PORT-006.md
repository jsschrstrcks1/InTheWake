---
id: PORT-006
name: Depth Soundings section minimum 150 words
family: port
severity: error
applies-to:
  - port
provenance: V-only
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateWordCounts (depth_soundings)
    lines: "1110-1119"
check: word count in the depth_soundings section text >= 150
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-15
---

## Rule
The depth_soundings section (final thoughts / the honest story / in conclusion) must contain at least 150 words.

## Why (rationale)
Depth soundings is the "what no one tells you" section — the editorial judgment about whether this port lives up to its marketing, what to watch out for, who shouldn't bother, who will especially love it. It's where the site earns readers' trust. 150 words is the floor to say something real; thinner than that defaults to empty "have a great day!" filler.

The section-name pattern `/depth soundings|final thoughts?|in conclusion|the (real|honest) story/i` means different port pages may label the section differently; the validator recognizes any of these titles.

## Pass example
"Nassau is one of the more honestly rough Caribbean cruise ports. The downtown feel is working-class Bahamian — not polished. The 2024 crime advisory is real and the aggressive merchandise pitch on Bay Street is not a myth. But Junkanoo Beach is two minutes from the terminal and nearly free, and the Queen's Staircase is authentic in a way most cruise destinations have lost. Cable Beach is the reliable "postcard Caribbean" if that's what you wanted. Skip Atlantis unless you have kids under 12 — the day-pass value collapses quickly for adults. If this is your first cruise stop, taxi to Cable Beach and stay. If you've been here twice, try the bus system and eat lunch somewhere without a cruise-line logo on the door." ~160 words.

## Fail example
Depth soundings at 40 words ("Nassau is a wonderful port..."). Validator emits: `Depth Soundings section has 40 words, minimum is 150`.

## Fix guidance
Write real editorial judgment. What surprised you? What was oversold? Who is this port for, who is it not for? This is the section that voice-audit (VOI-001) scrutinizes most — generic wrap-up prose fails both rules.
