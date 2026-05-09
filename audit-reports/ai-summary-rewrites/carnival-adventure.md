# Carnival Adventure — ai-summary rewrite

**Date:** 2026-05-07
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)
**Length rule satisfied:** icp_lite/ai_summary_length (≤250 chars)

## Before (boilerplate)

> "Carnival Adventure: deck plans, live tracker, dining venues, and stateroom videos. Plan your Carnival cruise with In the Wake."

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos. Plan your"

## After (final, 245 chars)

> "Carnival Adventure: Grand Class (108,865 GT, 2,600 guests) launched 2001 as Golden Princess; sails for Carnival from Mobile and Sydney with Movies Under the Stars. A Princess hand-me-down rebadged for Carnival fun — older bones, lighter price."

## Facts cited

1. Grand Class hull, 108,865 GT, 2,600 guests, launched 2001 as Golden Princess
2. Now sails for Carnival from Mobile and Sydney with Movies Under the Stars

## Voice line

> "A Princess hand-me-down rebadged for Carnival fun — older bones, lighter price."

**Voice analysis:** Names the trade-off explicitly (older Princess hull, value play) instead of papering over it. Reads like someone who's seen the ship, not a brochure.

## Sister meta updated

`<meta name="description">` carried the same boilerplate; replaced with the same rewrite.

## Verification

`node admin/validate-ship-page.js ships/carnival/carnival-adventure.html --json-output | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate" or .rule=="ai_summary_length")'` — empty.

## Multi-LLM check

Grok scored the first draft 4/5 SPECIFIC, 4/5 VOICED, 5/5 HONEST. No content revision needed; final wording was tightened only to fit the 250-char hard cap. See `_consult-grok-2026-05-07.json`.
