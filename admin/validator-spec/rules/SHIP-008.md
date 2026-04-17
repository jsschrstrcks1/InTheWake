---
id: SHIP-008
name: Meta description coherence — claimed features must exist on page
family: ship
severity: warn
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateMetaDescriptionCoherence
    lines: "1355-1380"
check: if meta description mentions "deck plans", page has a deck plan section (matching signals deck-plans, deck plan, deckplan); same for "live tracker" (tracker, marinetraffic, where is) and "video" (youtube.com, video-grid, ship-videos)
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
The meta description must not claim features the page doesn't have. The validator checks three claim-vs-content pairings:

1. **"deck plans"** in meta description → page must contain deck-plans / deck plan / deckplan signal
2. **"live tracker"** in meta description → page must contain tracker / marinetraffic / where-is signal
3. **"video"** in meta description → page must contain youtube.com / youtube-nocookie.com / video-grid / ship-videos signal

Each mismatch produces a WARNING.

## Why (rationale)
SEO + AI trust. A meta description promising "includes interactive deck plans" when no deck-plan content exists is a broken promise that degrades both search-result click-through and AI-summary quality. The validator treats this as a coherence check between the descriptor and the payload.

## Pass example
Meta description: "Allure of the Seas — dining, deck plans, live tracker, and cruise videos."
Page body: contains deck-plans section, live tracker iframe, video grid. All claims match.

## Fail (warning) examples
Meta description mentions "deck plans" but page has no deck-plan section:
```
Validator emits: "Meta description mentions 'deck plans' but no deck plan section found"
```

Meta description mentions "live tracker" but page has no tracker signal:
```
Validator emits: "Meta description mentions 'live tracker' but no tracker section found"
```

## Fix guidance
Either add the claimed feature to the page, or remove the claim from the meta description. Both are legitimate fixes — decide based on whether the feature is worth adding or the claim was aspirational.
