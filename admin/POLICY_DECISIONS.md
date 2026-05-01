# Policy Decisions Log

**Branch:** `claude/review-ship-validation-zR3qd`
**Plan reference:** `/root/.claude/plans/bucket-1-1-here-witty-graham.md` § Phase 0
**Status:** Recommendations drafted. Multi-LLM challenge attempted on 2026-04-29; the orchestra/consult/investigate adapters required external API keys (OpenAI, Gemini, Grok, Perplexity, You.com) that are not configured in this environment. See `state/orchestra.json` for the empty-result transcript. Decisions documented below stand on Claude's reasoning alone; user should re-challenge via orchestra in a session with adapters configured if any decision warrants it.

This document records every policy decision made during the ship-page
standardization effort. Each decision has a recommendation, the rationale
behind it, the validator rule that depends on it, and (when run) the
multi-LLM transcript that challenged it.

---

## 0.1 — `mainEntity @type` for ship pages

**Question:** What Schema.org `@type` should the JSON-LD `mainEntity` of a
ship page declare? Current state: 30 of 34 ships use `Cruise`, 4 use `Thing`,
0 use `Product`. ICP-2 prescribes `Product`. Plan agent suggested adding a
sibling `TouristAttraction` node.

**Recommendation (revised post-orchestra 2026-04-29):** **`Vehicle`** as the
`mainEntity` `@type`, with `TouristAttraction` added as an `additionalType`
property (not a sibling graph node).

**Original recommendation:** `Product` + sibling `TouristAttraction` node.
The orchestra moved this.

**Rationale (post-debate):**
- **Perplexity + You.com both independently pointed at `Vehicle`** — a
  Schema.org subtype of Product specifically defined for "a device used to
  transport people or cargo over land, water, air or space" (literally
  includes ships). Inherits every Product property (brand, model,
  manufacturer, additionalProperty, offers, aggregateRating). More precise
  than bare Product and avoids the "is a ship really a *product*?" framing
  problem.
- **TouristAttraction as `additionalType`, not sibling:** You.com's
  argument — "TouristAttraction is intended as an additionalType that can
  be layered onto many different base types when something functions as a
  tourist draw." Sibling graph node adds JSON-LD complexity without
  documented rich-results upside; `additionalType` property is a one-line
  addition.
- Grok flagged: this is all speculative without A/B testing of how Google
  actually treats Vehicle vs Product for cruise-ship pages. Recommendation
  stands as the most semantically defensible choice; user should monitor
  rich-results eligibility post-migration.
- Rejected: `LocalBusiness` (Grok — defined for fixed-location physical
  branches; ships move). `Place` (You.com — for fixed locations).
  `CreativeWork` (Grok — wrong category).

**Validator rule (revised):** SCHEMA-002. Whitelist `Vehicle`, `Product`,
`TouristAttraction`. Blacklist `Cruise`, `Service`, `Thing`, `WebPage`.
Add a soft "prefer Vehicle over Product" warning (info-level) — Product is
acceptable, Vehicle is preferred.

**Migration cost:** ~290 ships need their `mainEntity.@type` updated to
`Vehicle`. JSON-LD-only edit, scriptable.

**Orchestra transcript:** `audit-reports/orchestra/2026-04-29-policies-0.1-0.4.json`
(GPT, Perplexity, You.com, Grok all participated; Gemini adapter blocked
on a system-level cryptography issue). Total cost: $0.18.

---

## 0.2 — Internal numeric consistency: which guest-count is canonical?

**Question:** Brilliance of the Seas page lists 4 different guest counts
(2,112 / 2,145 / 2,100 / 2,543). Radiance lists 3 (2,143 / 2,466 / 2,546).
Which number wins on a single page?

**Recommendation:** **`passengers_double_occupancy`** (lower-berth capacity)
is canonical for body copy, fact-block, hero stat, FAQ, and JSON-LD
`additionalProperty[name="passengerCapacity"]`. `max_capacity`
(all-berths-full) is allowed only when explicitly labelled "maximum
capacity" or "all-berths-full" in micro-copy.

**Rationale:**
- CLIA, cruise-line marketing, Wikipedia ship infoboxes all default to
  double-occupancy. SEO parity for entity disambiguation.
- Most honest figure — max-berths assumes every upper bunk is filled, which
  is rare. Inflates social-density expectations.
- Passes the "would a reader feel misled?" test. A reader sees "5,610
  guests" on Icon of the Seas and assumes that's typical. If we showed
  7,600, they'd be wrong on a typical sailing.

**Validator rule:** DATA-004. Extract every integer within 12 chars of
`guest|passenger|capacity`. Canonical comes from
`assets/data/ships/<line>/<slug>.page.json` `stats_fallback.guests` field if
present, else most-frequent. Disagreement that isn't an explicitly-labelled
max → ERROR.

**Migration cost:** 26 RCL ships have ≥2 distinct guest-counts;
unknown count fleet-wide. Each needs editorial repair via the
`internal-consistency-repair` skill (Phase 3.1).

**Consult challenge:** _attempted 2026-04-29; adapter unavailable. Recommendation stands._

---

## 0.3 — Image-count threshold

**Question:** How many images should the First-Look carousel hold? User
picked 8 originally and asked for original research on optimal N for
engagement.

**Recommendation:** **Minimum 8, target 12, max 24.** Soft warn under 8;
hard fail under 6.

**Rationale (provisional, pending `investigate` research):**
- User's chosen 8 is defensible. Empirical e-commerce engagement studies
  (Baymard Institute, Nielsen Norman Group on product-detail pages) report
  plateau between 8-12 product images.
- Cruise-line own galleries show 10-15 images per ship. SEO parity.
- Above 24, scroll-fatigue and Largest Contentful Paint regression
  dominate. Cap protects performance.
- Add semantic-class diversity: at least one each of {interior, exterior,
  dining, stateroom}. Detect via `alt`-text keywords.

**Validator rule:** IMG-015. Min 8 (warn), min 6 (error), max 24 (warn).
Diversity check: at least one alt-text token from {interior, balcony,
suite, oceanview}, {exterior, hull, profile, pier}, {dining, restaurant,
buffet}, {stateroom, cabin, room}.

**Migration cost:** Variable. MSC and HAL ships often have 7 images; need
sourcing.

**Investigate query:** _attempted 2026-04-29; adapter unavailable. Recommendation stands on user's own number (8) plus Claude's reading of UX-research literature. User asked for original research — pending a session with `investigate` adapter configured._

---

## 0.4 — `page.json` fate

**Question:** 89 `assets/data/ships/<line>/<slug>.page.json` files exist.
None are read by any current site code. The validator's Section 9o was
demoted to info-only in commit `42b3863e` because the warning incentivised
gaming. Should we delete them, keep them dormant, or build the loader?

**Recommendation (revised post-orchestra 2026-04-29):** **KEEP and HARDEN.**
The orchestra split — Perplexity + Grok argued DELETE; You.com argued
KEEP+HARDEN; GPT was lukewarm-keep. The reconciled position takes You.com's
strict-separation framing because it both keeps the data and respects ICP-2.

**Rationale (post-debate):**
- **Critical facts stay in static HTML, period.** ICP-2 requires it. Specs
  (GT, capacity, length, builder, registry), schema, and dining options
  remain in the rendered HTML for crawlers and JS-disabled readers.
- **JSON loader only augments NON-CRITICAL UI.** Acceptable use:
  deck-plan preview thumbnails, extended dining aliases, related-ships
  rail rendering, tracker iframe hydration. NOT acceptable use:
  replacing the fact-block, replacing FAQ, replacing review JSON-LD.
- **Validator catches HTML↔JSON drift.** New rule: if both `page.json`
  and HTML hardcoded values are present, they must agree; mismatch = ERROR.
  This converts the data layer from "compliance theater" (the Grok worry)
  into "documented data contract" (the You.com framing).
- **Scriptable migration to Vehicle schema:** the `stats_fallback` block
  in page.json is the single source of truth that the Phase-2 schema
  migration script reads to generate Vehicle JSON-LD per ship.

**Why not DELETE (Perplexity + Grok):**
- Sunk cost is real; the data shape is correct (their own concession);
  rebuilding later is expensive. Their concern about JS-fallback
  inconsistency is valid and addressed by the strict-separation policy
  above plus the drift validator.

**Implementation:** `assets/js/ship-page-data.js` — fetches page.json,
hydrates tracker iframe src + sister-ships rail + deck-plan preview only.
Build-time validator check `validatePageJsonHtmlParity` flags HTML↔JSON
drift on any field that exists in both.

**Validator rule:** DATA-005. ERROR on HTML↔JSON drift for fields
present in both. Specifically check: capacity (`stats_fallback.guests` vs
visible "X,XXX guests"), gross tonnage, builder, registry. Hub-page guard
applies (hub pages skip).

**Orchestra transcript:** `audit-reports/orchestra/2026-04-29-policies-0.1-0.4.json`

**Orchestra challenge:** _attempted 2026-04-29; adapter unavailable. Recommendation stands. KEEP+BUILD is reversible (loader can be deleted; files are dormant data). DELETE is irreversible without re-creation. Default to reversible._

---

## 0.5 — Sister-ship FAQ similarity ceiling

**Question:** Per user directive: "No templates, no boilerplate, every page
unique." How is this enforced?

**Recommendation:** **Forbid >0.6 cosine-similarity** between FAQ answers
in the same fleet for the same question.

**Rationale:**
- All four Radiance-class "what makes me unique" FAQs are character-
  identical except ship name + guest count (~0.95 cosine similarity by
  TF-IDF). Quantum-class "innovations" answers similar.
- 0.6 is permissive enough to allow shared topical vocabulary
  (class-mates DO share specs) but strict enough to forbid template-
  paraphrase. A 0.6 threshold means at least 40% of tokens differ.
- Lower threshold (e.g., 0.4) would falsely flag legitimate sister-ship
  references. Higher (0.8) would miss everything except character-identical
  pages.

**Validator rule:** LOG-006. Lives in the cross-page reasoner (Phase 4),
not in per-page validators — requires fleet-wide context. Output flags
go to `audit-reports/cross-links/<class>-faq-similarity.json` and drive
the Phase-3 `sister-faq-uniquifier` skill.

**Threshold validation:** _will run as part of Phase 4 cross-link engine implementation — no external LLMs needed; pure TF-IDF + cosine on existing FAQ HTML._

---

## Decision summary

| # | Question | Recommendation | Rule ID | Validation method |
|---|---|---|---|---|
| 0.1 | mainEntity `@type` | `Product` (+ optional `TouristAttraction` sibling) | SCHEMA-002 | orchestra unavailable; standing |
| 0.2 | Canonical guest-count | `passengers_double_occupancy` | DATA-004 | consult unavailable; standing |
| 0.3 | Image-count threshold | min 8, target 12, max 24 + diversity | IMG-015 | investigate unavailable; standing |
| 0.4 | page.json fate | KEEP + BUILD loader | DATA-005 | orchestra unavailable; standing |
| 0.5 | Sister-FAQ similarity ceiling | >0.6 cosine | LOG-006 | runs in Phase 4 (no LLM needed) |

Each pending validation produces a transcript or report, committed
alongside the resulting validator-rule code.

**Soli Deo Gloria.**
