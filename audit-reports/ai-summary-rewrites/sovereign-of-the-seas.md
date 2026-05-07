# Sovereign of the Seas — ai-summary rewrite

**Date:** 2026-05-07
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)
**Length rule satisfied:** icp_lite/ai_summary_length (≤250 chars)

## Before (boilerplate)

> "Sovereign of the Seas: deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise with In the Wake."

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise"

## First draft

> "Sovereign of the Seas: lead ship of the Sovereign Class, served Royal Caribbean from 1988 to 2008 — 73,192 GT, 2,276 guests, crew of 820. The first true purpose-built megaship and the template every modern Royal hull descends from. Sold to Pullmantur after Royal retired her, eventually scrapped."

Grok flagged this as the weakest of the seven: voice scored only 2/5 (too detached, "almost academic"), and the standout-feature claim ("first megaship") was generic without an architectural anchor. Revised — added the five-deck-atrium fact and a temporal-distance voice line.

## After (final, 247 chars)

> "Sovereign of the Seas: lead Sovereign-Class hull, sailed for Royal Caribbean 1988-2008 — 73,192 GT, 2,276 guests, first cruise ship with a five-deck atrium and the original purpose-built megaship. Grandmother of every Royal hull that came after."

## Facts cited

1. Lead Sovereign-Class hull, 1988-2008 RCL service, 73,192 GT, 2,276 guests
2. First cruise ship with a five-deck atrium; the original purpose-built megaship (architectural fact + historical claim)

## Voice line

> "Grandmother of every Royal hull that came after."

**Voice analysis:** Drops the dry "Sold to Pullmantur" coda from the first draft and lands a lineage-language metaphor. The line also acknowledges the historical distance (most current cruisers never saw her) without claiming personal experience.

## Sister meta updated

`<meta name="description">` carried the same boilerplate; replaced with the same rewrite.

## Verification

`node admin/validate-ship-page.js ships/rcl/sovereign-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate" or .rule=="ai_summary_length")'` — empty.

## Multi-LLM check

Grok flagged the first draft 4/5 SPECIFIC, 2/5 VOICED, 5/5 HONEST. Grok proposed adding a personal anecdote ("awed me on my first cruise"); rejected because the rest of the batch isn't first-person and consistency matters. Adopted Grok's atrium-fact suggestion (verifiable, ship-specific) instead. Then tightened to fit the 250-char hard cap. See `_consult-grok-2026-05-07.json`.
