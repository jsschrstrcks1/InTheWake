# Explorer of the Seas — ai-summary rewrite

**Date:** 2026-05-07
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)
**Length rule satisfied:** icp_lite/ai_summary_length (≤250 chars)

## Before (boilerplate)

> "Explorer of the Seas: deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise with In the Wake."

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise"

## After (final, 249 chars)

> "Explorer of the Seas: Voyager Class (2000, 137,308 GT, 3,286 guests) — built by Kvaerner Masa-Yards in Finland with the four-deck Royal Promenade and Studio B ice rink. Helped invent the indoor 'main street at sea' every megaship has copied since."

## Facts cited

1. Voyager Class, 2000, 137,308 GT, 3,286 guests, built by Kvaerner Masa-Yards in Finland
2. Four-deck Royal Promenade and Studio B ice rink (her signature interior architecture)

## Voice line

> "Helped invent the indoor 'main street at sea' every megaship has copied since."

**Voice analysis:** Historical-hook pattern — locates Explorer in cruising history rather than describing her in marketing terms. Verifiable claim: the Voyager-class Royal Promenade was the original indoor street and has been imitated since.

## Sister meta updated

`<meta name="description">` carried the same boilerplate; replaced with the same rewrite.

## Verification

`node admin/validate-ship-page.js ships/rcl/explorer-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate" or .rule=="ai_summary_length")'` — empty.

## Multi-LLM check

Grok scored the first draft 5/5 SPECIFIC, 4/5 VOICED, 5/5 HONEST — the strongest of the seven. Final wording was tightened only to fit the 250-char hard cap. See `_consult-grok-2026-05-07.json`.
