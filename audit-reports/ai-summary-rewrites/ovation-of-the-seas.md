# Ovation of the Seas — ai-summary rewrite

**Date:** 2026-05-07
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)
**Length rule satisfied:** icp_lite/ai_summary_length (≤250 chars)

## Before (boilerplate)

> "Ovation of the Seas: deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise with In the Wake."

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise"

## After (final, 242 chars)

> "Ovation of the Seas: Quantum Class (2016, 168,666 GT, 4,180 guests) — Royal Amplification refit 2026; carries the North Star pod 300 feet above the sea and a RipCord skydive simulator aft. Built for travelers who want the ship in the story."

## Facts cited

1. Quantum Class, 2016, 168,666 GT, 4,180 guests; Royal Amplification refit landed 2026 (per the page's fact-block)
2. North Star observation pod (300 ft above the sea) + RipCord skydive simulator aft — Quantum-class signatures

## Voice line

> "Built for travelers who want the ship in the story."

**Voice analysis:** Names the audience instead of rating the experience. Avoids "ultimate" / "perfect" — identifies who Ovation is built for (travelers who want the ship itself to be the destination).

## Sister meta updated

`<meta name="description">` carried the same boilerplate; replaced with the same rewrite.

## Verification

`node admin/validate-ship-page.js ships/rcl/ovation-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate" or .rule=="ai_summary_length")'` — empty.

## Multi-LLM check

Grok scored 5/5 SPECIFIC, 4/5 VOICED, 4/5 HONEST. Grok flagged the 2026 refit date as a possible future-tense typo; verified — today is 2026-05-07, refit is past per the page's fact-block. See `_consult-grok-2026-05-07.json`.
