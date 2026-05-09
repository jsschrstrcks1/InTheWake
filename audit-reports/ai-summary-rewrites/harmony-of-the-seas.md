# Harmony of the Seas — ai-summary rewrite

**Date:** 2026-05-07
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)
**Length rule satisfied:** icp_lite/ai_summary_length (≤250 chars)

## Before (boilerplate)

> "Harmony of the Seas: deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise with In the Wake."

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise"

## First draft

> "Harmony of the Seas: Oasis Class (2016, 226,963 GT, 5,479 guests, crew of 2,394) — third Oasis-class hull and the first to launch with the 10-story Ultimate Abyss dry slide. Seven distinct neighborhoods, real Central Park trees, and a week aboard isn't long enough to see all of her."

Grok flagged the "week aboard isn't long enough" line as drifting promotional. Revised.

## After (final, 241 chars)

> "Harmony of the Seas: Oasis Class (2016, 226,963 GT, 5,479 guests) — third Oasis hull, first to launch with the 10-story Ultimate Abyss slide. Seven neighborhoods including a Central Park of living plants — built to feel less like a ship."

## Facts cited

1. Oasis Class, 2016, 226,963 GT, 5,479 guests, third Oasis-class hull
2. First Oasis-class hull launched with the 10-story Ultimate Abyss slide; Central Park is real plants

## Voice line

> "Built to feel less like a ship."

**Voice analysis:** Replaces the soft-promotional "week isn't long enough" with a concrete observation (real plants, not plastic) and a tighter, less marketing-y framing of the design intent.

## Sister meta updated

`<meta name="description">` carried the same boilerplate; replaced with the same rewrite.

## Verification

`node admin/validate-ship-page.js ships/rcl/harmony-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate" or .rule=="ai_summary_length")'` — empty.

## Multi-LLM check

Grok flagged the first draft 5/5 SPECIFIC, 3/5 VOICED, 3/5 HONEST. Voice line revised in response to the VOICED concern, then tightened to fit the 250-char hard cap. See `_consult-grok-2026-05-07.json`.
