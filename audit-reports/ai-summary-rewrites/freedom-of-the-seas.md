# Freedom of the Seas — ai-summary rewrite

**Date:** 2026-05-07
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)
**Length rule satisfied:** icp_lite/ai_summary_length (≤250 chars)

## Before (boilerplate)

> "Freedom of the Seas: deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise with In the Wake."

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise"

## After (final, 232 chars)

> "Freedom of the Seas: Freedom Class (2006, 154,407 GT, 4,024 guests / 4,829 max) — built by Aker Yards in Turku, first Royal Caribbean ship to launch with a FlowRider. Bigger than Voyager-class, smaller than Oasis: rare sweet spot."

## Facts cited

1. Freedom Class, 2006, 154,407 GT, 4,024/4,829 guests, built by Aker Yards in Turku
2. First Royal Caribbean ship to launch with a FlowRider surf simulator

## Voice line

> "Bigger than Voyager-class, smaller than Oasis: rare sweet spot."

**Voice analysis:** Candid trade-off pattern — names where Freedom sits in the fleet hierarchy and calls the position desirable. Grok flagged "sweet spot" as mild over-claim; accepted because the comparison frames it (between two named classes), not free-floating praise.

## Sister meta updated

`<meta name="description">` carried the same boilerplate; replaced with the same rewrite.

## Verification

`node admin/validate-ship-page.js ships/rcl/freedom-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate" or .rule=="ai_summary_length")'` — empty.

## Multi-LLM check

Grok scored the first draft 4/5 SPECIFIC, 3/5 VOICED, 4/5 HONEST. Concerns noted but no content revision applied. Final wording was tightened only to fit the 250-char hard cap. See `_consult-grok-2026-05-07.json`.
