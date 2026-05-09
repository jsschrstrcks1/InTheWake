---
name: ai-summary-rewriter
description: "Rewrites <meta name=\"ai-summary\"> tags that ICP-018 flags as boilerplate. Each rewrite carries 2 ship-specific facts (class/year/tonnage/distinctive feature) + 1 voice-aligned editorial line, ≤80 words, no boilerplate phrases. Companion to validator rule ICP-018."
version: 1.0.0
---

# AI-Summary Rewriter

> Boilerplate is what AI search engines deduplicate against. Specificity is what they reward.

## Purpose

When `validate-ship-page.js` fires `icp_lite/ai_summary_boilerplate` (ICP-018), the page's
`<meta name="ai-summary">` matches one or more of the boilerplate phrases listed in
`admin/validator-config.json` (e.g. "deck plans, live tracker, dining venues, and stateroom
videos. Plan your Royal Caribbean cruise"). These summaries are what AI answer-engines
(Perplexity, ChatGPT search, Google AI Overviews) read first; if every ship page in the
fleet says the same thing, the AI engines bucket the page as low-information and refuse
to surface it as an answer-source.

This skill repairs those summaries, one page at a time, into specific human-voiced
factoids that meaningfully describe the ship.

## When to Fire

- On `/rewrite-ai-summary <ship-slug>` command.
- Auto-suggest when validator emits `icp_lite/ai_summary_boilerplate`.
- Manually invoked when batch-repairing the ships flagged in
  `audit-reports/ship-validation-dashboard.json`.

## Scope

**In scope:** the `content` attribute of `<meta name="ai-summary">`. If the same boilerplate
also appears in `<meta name="description">`, that gets the same rewrite. (The two tags
serve different audiences — bots vs. humans-via-search-snippets — but for ship pages where
the only point of difference *is* the ship name, they should both be specific.)

**Out of scope:** prose voice in body copy, JSON-LD descriptions, og/twitter cards, FAQ
answers. Those have their own audits.

## The Rule

A non-boilerplate ai-summary is:

1. **≤250 characters.** This is the validator's hard cap (`icp_lite/ai_summary_length`).
   Roughly 40 words at average-cruise-vocabulary density. The 80-word target floated in
   earlier drafts is the OG-snippet soft ceiling — the 250-char limit is binding and
   tighter; budget by characters, not words.
2. **At least 2 ship-specific facts.** Class + year + gross tonnage + distinctive feature
   + sister-ship lineage + builder yard + retired-status — pick two. The ship name in the
   sentence does NOT count as a fact (it's just the entity).
3. **At least 1 voice-aligned editorial line.** Per `Like-a-human.md`: one sentence of
   first-person sensibility; concrete sensory detail beats marketing adjectives;
   no "ultimate," "perfect," "world-class," "redefines," or any phrase from
   `validator-config.json` `ai_summary_boilerplate_phrases`.
4. **Zero boilerplate phrases.** The list lives in `admin/validator-config.json`. The
   validator checks against it. New boilerplate found in the wild gets added to the list,
   not whitelisted in this skill.

## Process per ship

### 1. Read the page

Open and read:
- `ships/<line>/<slug>.html` — the target page (focus on fact-block, hero stat, FAQ
  answers, "Who She's For" section — these carry the ship-specific facts you'll lift)
- `assets/data/ships/<line>/<slug>.page.json` — for canonical guests/GT/year if present

Run the validator first to confirm exactly which phrases triggered:
```bash
node admin/validate-ship-page.js ships/<line>/<slug>.html --json-output \
  | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate")'
```

### 2. Pick 2 facts

Order of preference for ship-specific facts:
1. **Distinctive feature** ("Ultimate Abyss 100-foot slide", "first ice-skating rink at
   sea", "North Star observation pod 300 feet up", "ex-Costa Firenze transferred 2024").
2. **Class + role-in-class** ("lead ship of Quantum class", "smallest of the Radiance
   four", "scrapped 2014, retired 2008").
3. **Year + gross tonnage** ("2002, 90,090 GT") — better when paired together.
4. **Capacity + crew + builder** — only if (1)–(3) wouldn't be more memorable.

### 3. Compose the voice line

The voice line is what stops the summary from reading like a Wikipedia infobox. It should
be ONE sentence. Patterns that work:

- **The metaphor**: "City-at-sea — you can spend a week aboard and never see all of her."
- **The pithy observation**: "The 'glass ship' — wall-to-wall windows turn the Caribbean
  horizon into the décor."
- **The historical hook**: "She invented the Royal Promenade — the indoor 'street' every
  cruise ship has copied since."
- **The candid trade-off**: "Bigger than Voyager-class, smaller than Oasis. Rare sweet
  spot."

Patterns to avoid:
- "Perfect for [X]." — overclaim and lazy.
- "Offers something for everyone." — explicitly on the boilerplate list.
- "The ultimate [N]-something." — flagged by ICP-018.
- Any sentence that, with `<ShipName>` substituted, would describe a different ship.

### 4. Compose the rewrite

Format: `<ShipName>: <Class> (<Year>, <GT>) — <fact 2>. <Voice line.>`

Or any natural variant. The grammar isn't fixed; the constraints are: 2 facts, 1 voice
line, ≤250 characters. Measure with `grep 'name="ai-summary"' <file> | sed -E 's/.*content="([^"]*)".*/\1/' | wc -c` — the ship-page batch in this repo runs 232–249 chars after the first compression pass.

Examples (from the Phase 3.2 batch):

| Ship | Rewrite |
|---|---|
| Brilliance of the Seas | "Brilliance of the Seas: Radiance Class (2002, 90,090 GT) — glass-walled atrium and panoramic Centrum bar; carries 2,145 guests at double occupancy. The 'glass ship' — wall-to-wall windows turn the Caribbean horizon into the décor." |
| Harmony of the Seas | "Harmony of the Seas: Oasis Class (2016, 226,963 GT) — Ultimate Abyss 10-story slide; seven distinct neighborhoods, 5,479 guests, crew of 2,394. City-at-sea — you can spend a week aboard and never see all of her." |
| Sovereign of the Seas | "Sovereign of the Seas: lead ship of the Sovereign Class, served Royal Caribbean 1988–2008; 73,192 GT, 2,276 guests. The grandmother of every megaship that came after — a piece of cruising history worth knowing, even though she's been gone since 2014." |

### 5. Apply

Replace the `content` attribute of:
- `<meta name="ai-summary">` (always)
- `<meta name="description">` if it currently matches the same boilerplate (Brilliance,
  Explorer, Harmony, Ovation all have description = ai-summary; Sovereign + Carnival
  Adventure differ)

If the description differs from ai-summary but ALSO contains a boilerplate phrase, rewrite
both — but they don't have to be identical. The description targets human search-snippet
readers; ai-summary targets AI engines. Both must avoid boilerplate; both should carry
ship-specific facts.

### 6. Re-validate

```bash
node admin/validate-ship-page.js ships/<line>/<slug>.html --json-output \
  | jq '.blocking_errors[] | select(.rule=="ai_summary_boilerplate")'
```

Result must be empty.

### 7. Audit log

Write `audit-reports/ai-summary-rewrites/<slug>.md`:

```markdown
# <Ship Name> — ai-summary rewrite

**Date:** YYYY-MM-DD
**Branch:** claude/phase3-ai-summary-rewriter
**Rule closed:** ICP-018 (icp_lite/ai_summary_boilerplate)

## Before

> "<original boilerplate ai-summary>"

**Triggered phrases:** "deck plans, live tracker, dining venues, and stateroom videos.
Plan your Royal Caribbean cruise" (and 1 more)

## After

> "<rewritten ai-summary>"

## Facts cited

1. <fact 1>
2. <fact 2>

## Voice line

> "<the voice line, called out>"

**Voice analysis:** <one-sentence note on why this line lands as voice-aligned and not
boilerplate>

## Sister meta updated

- `<meta name="description">` was the same boilerplate; rewritten to match (or with a
  human-snippet-friendly variant).

## Verification

`node admin/validate-ship-page.js ships/<line>/<slug>.html --json-output | jq ...` returns
empty for `ai_summary_boilerplate`.
```

### 8. Commit

One commit per batch (5–10 ships). Commit message:

```
Phase 3.2: ai-summary rewrites for <N> ships

ICP-018 boilerplate cleared. Each rewrite carries 2 ship-specific facts
+ 1 voice-aligned editorial line, ≤80 words.

Ships: <list>

Audit logs: audit-reports/ai-summary-rewrites/
```

## Multi-LLM hookpoints

- **`consult`** once per batch: ask GPT or Grok "are any of these still boilerplate?
  flag any that read like marketing copy or could substitute for a different ship."
  Save transcript next to the audit logs at
  `audit-reports/ai-summary-rewrites/_consult-<date>.json`.

- **`orchestra`** is reserved for harder cases — when the only available facts are
  generic class-level facts and the ship has no distinguishing feature. The debate
  surfaces "what makes THIS ship not a clone of its sisters" by triangulating multiple
  models' takes on the line's catalog.

## Boundaries

- Don't write claims you can't source from the page itself or from Wikipedia. If the
  ship's distinctive feature requires research, escalate to Phase 3.4 (historic-ship-
  verifier) — the ai-summary is the wrong place to introduce un-sourced facts.
- Don't borrow voice lines across ships. Each rewrite is bespoke. If you find yourself
  reaching for a previously-used metaphor, stop and study what makes THIS ship different.
- Don't update og:description / twitter:description in this skill. Those serve a different
  audience (social-share previews, Twitter cards) and have their own audit/treatment.

## Cross-references

- `admin/POLICY_DECISIONS.md` § ICP-2 standard — AI-search optimization
- `admin/validator-spec/rules/ICP-018.md` — the validator rule this skill closes
- `admin/validator-config.json` `ai_summary_boilerplate_phrases` — current trip-list
- `.claude/skills/Humanization/Like-a-human.md` — voice standard
- `.claude/skills/voice-dna/SKILL.md` — voice discovery for the ship line

---

*Soli Deo Gloria*
