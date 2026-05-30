---
name: original-research
description: "Factual claim discipline. Every factual claim in shipped content (voyage packs, ship pages, port pages, restaurant pages) must trace to a primary source verified in-session, recorded in a .factcheck.json sidecar. Blocks three confabulation modes: training-data echo, copy-propagation across files, and superlative-by-default. Pre-commit hook gates voyage-pack .md commits on sidecar presence + freshness. Peer to careful-not-clever, not subordinate."
version: 1.0.0-alpha
---

# Original Research — Quick Reference

For the full doctrine, see `ORIGINAL-RESEARCH.md` in this directory.

## When this fires

Auto-loads on Edit/Write to:
- `admin/voyage-packs/v*.md`
- `ships/**/*.html`
- `ports/**/*.html`
- `restaurants/**/*.html`

Pre-commit hook blocks voyage-pack .md commits without a fresh `.factcheck.json` sidecar.

## The rule (one sentence)

**No factual claim is written from memory. Every claim cites a primary source verified in-session. If you can't link it to a URL you opened this session, you either open the source or omit the claim.**

## The three confabulation modes

1. **Training-data echo** — writing what *sounds right* without opening a source. Detection: if the sentence flows fluently without a citation pause, that's the warning sign.
2. **Copy-propagation** — taking a number from one pack and re-using it elsewhere without re-verifying. Detection: identical numbers across two pack files.
3. **Superlative-by-default** — "first at sea," "world's largest," "longest," "only" written without a primary source. Default disposition: remove the superlative unless cited.

## The sidecar (required per voyage pack)

Located at `admin/voyage-packs/<pack>.factcheck.json`. Template at `admin/voyage-packs/FACTCHECK_TEMPLATE.json`. Categories required: `ship_specs`, `christening`, `policies`, `superlatives`. Each claim cites a primary source URL and a verification date.

## Source hierarchy (cruise content)

1. Cruise line's own current press release
2. Cruise line's current FAQ / policy page
3. Wikipedia ship article (verify the citations still hold)
4. cruisedeckplans.com / CruiseMapper (specs)
5. Cruise Industry News, Seatrade, TravelWeekly, Cruise Critic (history)

NEVER source from: model training memory, AI-summarization tools, another pack in this repo.

## The SDG connection

Every pack closes with Soli Deo Gloria. Confabulation under that closing is the doctrinal violation this skill exists to prevent. The closing does not stay on falsehood.

## See also

- `careful-not-clever` (peer skill — governs HOW work is done)
- `verification-before-completion` (companion skill — governs WHEN to claim done)
- `cognitive-memory` entry `factcheck-2026-05-30` (the 50+ confabulated facts that triggered v1.0.0)
