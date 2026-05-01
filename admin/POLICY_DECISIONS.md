# Policy Decisions Log

**Branch:** `claude/review-ship-validation-zR3qd`
**Plan reference:** `/root/.claude/plans/bucket-1-1-here-witty-graham.md` § Phase 0
**Status:** Recommendations drafted; orchestra challenge pending.

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

**Recommendation:** `Product` as the `mainEntity` `@type`, with an optional
sibling JSON-LD graph node typed `TouristAttraction` for geo/discovery.

**Rationale:**
- A ship page is an evergreen reference for a vessel. `Cruise` schema models
  a single voyage instance (`departureLocation`, `arrivalLocation`,
  `cruiseLine`, `itinerary`) — wrong shape for an evergreen page.
- `Product` enables `aggregateRating`, `offers`, `brand`, `image`,
  `additionalProperty` (gross tonnage, beam, draft) — fields a ship page
  surfaces. Google rich-results documented support.
- `TouristAttraction` adds geo/discovery surface area for AI assistants
  asking "what cruise ships visit Cozumel?"
- `Thing` is the Schema.org root — semantically meaningless. Always wrong.

**Validator rule:** SCHEMA-002. Whitelist `Product`, `TouristAttraction`.
Blacklist `Cruise`, `Service`, `Thing`, `WebPage` as `mainEntity`. ERROR
when not in whitelist; ERROR when in blacklist.

**Migration cost:** 30 ships need their `mainEntity.@type` changed from
`Cruise` to `Product`; 4 from `Thing` to `Product`. JSON-LD-only edit, no
prose changes. Scripted.

**Orchestra challenge:** _pending — will run before SCHEMA-002 lands._

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

**Consult challenge:** _pending — `consult` GPT for industry-standard
canonical guest-count convention._

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

**Investigate query:** _pending — `investigate` "optimal image count for
cruise-ship product pages, 2026 — UX research backed; what does Baymard,
NN/g, RCL/Carnival/Norwegian own galleries show?"_

---

## 0.4 — `page.json` fate

**Question:** 89 `assets/data/ships/<line>/<slug>.page.json` files exist.
None are read by any current site code. The validator's Section 9o was
demoted to info-only in commit `42b3863e` because the warning incentivised
gaming. Should we delete them, keep them dormant, or build the loader?

**Recommendation:** **KEEP and BUILD the loader.**

**Rationale:**
- Data shape is already correct. Field names map directly to ship-page
  elements: `tracker.{provider, embed_name, details_url}` → tracker iframe;
  `deck_plans.{official_url, preview_img}` → deck-plans CTA;
  `dining.{provider, json, aliases}` → dining-card data source;
  `stats_fallback.{entered_service, gt, guests, crew, length, beam,
  builder, registry}` → fact-block; `related.sister_ships[]` → sister-ships
  rail.
- Building the loader removes duplication between hardcoded HTML and the
  JSON, enabling Phase 5's "visual/conceptual similarity" goal — the HTML
  stays structurally identical across ships, content varies via JSON.
- Six of the 89 files (the ones recently created in the gaming campaign)
  had a fake `compliance` block stripped in commit `20adc53f`. The
  Legend (1995) had its copy-paste-from-Splendour stats removed in the
  same commit. Both repairs leave the files in a good state.
- Deleting risks rework if the loader is built later anyway.

**Implementation:** New file `assets/js/ship-page-data.js` — fetches the
page.json, hydrates tracker iframe src, deck-plans CTA href, fact-block
stats, sister-ships rail. Falls back to existing static HTML when JSON
missing.

**Validator rule:** DATA-005. When both `page.json` and HTML hardcoded
values are present, the JSON wins; flag mismatches as ERROR.

**Orchestra challenge:** _pending — KEEP+BUILD vs. DELETE is architectural;
worth multi-LLM debate before code lands._

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

**Threshold validation:** _pending — run cosine similarity on the current
fleet to confirm 0.6 catches the known-bad cases (Radiance class FAQ,
Quantum class FAQ) without false-flagging genuinely-different pages._

---

## Decision summary

| # | Question | Recommendation | Rule ID | Validation method |
|---|---|---|---|---|
| 0.1 | mainEntity `@type` | `Product` (+ optional `TouristAttraction` sibling) | SCHEMA-002 | orchestra (pending) |
| 0.2 | Canonical guest-count | `passengers_double_occupancy` | DATA-004 | consult (pending) |
| 0.3 | Image-count threshold | min 8, target 12, max 24 + diversity | IMG-015 | investigate (pending) |
| 0.4 | page.json fate | KEEP + BUILD loader | DATA-005 | orchestra (pending) |
| 0.5 | Sister-FAQ similarity ceiling | >0.6 cosine | LOG-006 | empirical fleet test (pending) |

Each pending validation produces a transcript or report, committed
alongside the resulting validator-rule code.

**Soli Deo Gloria.**
