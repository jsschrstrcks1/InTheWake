---
name: cruise-statements
description: "Upkeep of In the Wake's ship statements and the pilot stats cards rendered from them (Lexicon Track C). How to change a ship fact so every page that shows it agrees: change the record, regenerate the statements, render the cards, pass the gates. Fires on itw_statement_unsourced, itw_infobox_drift, itw_conflict_published, or an edit to a pilot page's card or an entity file."
version: 1.0.0
---

<!-- Soli Deo Gloria. "Buy the truth, and sell it not." Proverbs 23:23 -->

# Cruise statements

> A fact is written once. Every page that shows it is rendered from it.

## Purpose

A ship's figures live as **statements** in `assets/data/entities/ship/<slug>.json`: one property, one value,
its sources, and when it was read. On the seven pilot pages the stats card is rendered from them, between
`<!-- itw:infobox -->` markers. This skill is the order of work for changing one of those facts, and the repair
path when a gate refuses. The full rules are `assets/data/entities/README.md`; this skill does not restate them.

## When to fire

- A gate prints `itw_statement_unsourced`, `itw_infobox_drift` or `itw_conflict_published`.
- Someone asks to change a ship's tonnage, guests, crew, length, class, year or IMO on a pilot page.
- An edit lands inside an `itw:infobox` block, or in `assets/data/entities/`.

## The order of work

1. **Change the record, never the card or the statement.** A figure comes from this site's ship record
   (`assets/data/ships/<line>/<slug>.page.json` or the page's `#ship-stats-fallback`) or from the cruise line's own
   page, captured by `admin/lexicon/capture-official.mjs`. Training recall is never a source.
2. **Commit the record**, then regenerate the statements: `node admin/lexicon/ship-statements.mjs`. It reads
   committed content only, because each fact is dated by its source's commit.
3. **Render the cards:** `node admin/lexicon/render-infobox.mjs`. It rewrites the pilot cards and
   `assets/data/lexicon/infobox-manifest.json`.
4. **Gate:** `node admin/lexicon/statement-gates.mjs`. Full depth needs Project-Sophos beside the checkout; the
   output says which depth ran.
5. **Commit the entity files, pages and manifest together.**

## When two sources disagree

The card shows **no** value for that figure and names it under the card. Do not pick a side, and do not type the
figure into the page to fill the gap. Settling a dispute is a governance act, recorded in the statements
(README, "Disagreements"). Until then the honest card says the sources disagree.

## Repair paths

Each gate code, its cause and its repair by hand: `assets/data/entities/README.md#gates-track-c4`.

## Not in scope

The prose, the Key Facts list, the meta description and the JSON-LD still repeat figures by hand. They are not
rendered from statements yet. When you change a pilot ship's figure, read those too and say plainly which ones
still disagree with the card.

*Soli Deo Gloria.*
