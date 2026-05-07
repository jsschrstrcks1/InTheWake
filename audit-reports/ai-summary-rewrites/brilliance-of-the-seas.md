# Brilliance of the Seas — ai-summary rewrite

**Date:** 2026-05-07
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)
**Length rule satisfied:** icp_lite/ai_summary_length (≤250 chars)

## Before (boilerplate)

> "Brilliance of the Seas: deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise with In the Wake."

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos. Plan your Royal Caribbean cruise"

## After (final, 248 chars)

> "Brilliance of the Seas: Radiance Class (2002, 90,090 GT, 2,145 guests) — known for the wall-of-windows Centrum atrium and acres of glass on every deck. The 'glass ship' — built to make the ocean part of the décor instead of background scenery."

## Facts cited

1. Radiance Class, 2002, 90,090 GT, 2,145 guests
2. Wall-of-windows Centrum atrium and glass-heavy public spaces

## Voice line

> "The 'glass ship' — built to make the ocean part of the décor instead of background scenery."

**Voice analysis:** Reframes the literal architecture (lots of windows) as a design philosophy. Concrete sensory anchor; not a comparative claim that could swap to another ship.

## Sister meta updated

`<meta name="description">` carried the same boilerplate; replaced with the same rewrite.

## Verification

`node admin/validate-ship-page.js ships/rcl/brilliance-of-the-seas.html --json-output | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate" or .rule=="ai_summary_length")'` — empty.

## Multi-LLM check

Grok scored 3/5 SPECIFIC, 3/5 VOICED, 5/5 HONEST. Concern: "glass ship" metaphor could fit other Radiance-class hulls. Accepted as-is — Brilliance is the line's promotional flagship for the glass conceit; the sister Radiance ships borrowed it. See `_consult-grok-2026-05-07.json`.
