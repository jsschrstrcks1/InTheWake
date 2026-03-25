# Port Page Normalization Plan

**Date:** 2026-03-25
**Validator:** `admin/validate-port-page-v2.js` (ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300 + ICP-Lite v1.4)
**Soli Deo Gloria**

---

## Validation Summary

| Metric | Value |
|--------|-------|
| Total port pages | 387 |
| Passing | 274 (70.8%) |
| Failing | 113 (29.2%) |
| Median score | 84 |
| Score range | 0–100 |

### Score Distribution

| Range | Count |
|-------|-------|
| 90–100 | 93 |
| 80–89 | 196 |
| 70–79 | 54 |
| 60–69 | 7 |
| 50–59 | 3 |
| <50 | 34 |

---

## Blocking Error Summary (371 total across 113 pages)

| Error Type | Count | Description |
|-----------|-------|-------------|
| `section_order/out_of_order` | 76 | Sections appear in wrong order per ITC v1.1 |
| `section_order/missing_required_sections` | 33 | Required sections completely absent |
| `word_counts/getting_around_minimum` | 32 | Getting Around section under 200 words |
| `rubric/booking_guidance` | 32 | Excursions missing booking guidance keywords |
| `word_counts/excursions_minimum` | 31 | Excursions section under 400 words |
| `content_quality/template_filler_detected` | 30 | Generic copy-paste passport advice |
| `word_counts/logbook_minimum` | 23 | Logbook under 800 words |
| `word_counts/cruise_port_minimum` | 22 | Cruise port section under 100 words |
| `logbook_narrative/reflection_missing` | 21 | No personal reflection section |
| `logbook_narrative/emotional_pivot_missing` | 19 | No emotional pivot moment |
| `rubric/diy_price_mentions` | 16 | Missing DIY price information |
| `word_counts/total_minimum` | 6 | Total page word count too low |
| `logbook_narrative/first_person_minimum` | 6 | Not enough first-person pronouns |
| `rubric/first_person_voice` | 5 | Insufficient first-person voice |
| `images/minimum_images` | 4 | Fewer than required images |
| Other (stray tags, ICP-Lite, hero, etc.) | 15 | Various structural issues |

### Out-of-Order Breakdown (76 pages)

| Section Out of Place | Count |
|---------------------|-------|
| `map` | 52 |
| `featured_images` | 14 |
| `getting_around` | 4 |
| `food` | 2 |
| Other | 4 |

The **map section** being out of order is the single most common issue — 52 pages have the interactive map in the wrong position.

---

## Warning Summary (2,577 total across 387 pages)

| Warning Type | Count | Notes |
|-------------|-------|-------|
| `faq/answer_too_long` | 384 | FAQ answers exceed 80-word limit |
| `poi_manifest/insufficient_pois` | 290 | Maps have <10 points of interest |
| `poi_manifest/poi_ids_without_pois` | 261 | POI IDs reference no POI data |
| `weather_widget/generic_noscript_weather` | 168 | Generic noscript weather fallback |
| `logbook_narrative/first_person_maximum` | 164 | Excessive first-person pronouns |
| `poi_manifest/unresolved_poi_ids` | 163 | POI IDs not in poi-index.json |
| `voice_quality/voice_v01` | 151 | Voice quality issues (various) |
| `gallery/gallery_credit_low_diversity` | 151 | All gallery credits same source |
| `author_consistency/disclaimer_logbook_contradiction` | 126 | Author disclaimer contradicts logbook |
| `html_structure/duplicate_html_ids` | 85 | Duplicate HTML element IDs |
| `images/generic_alt_text` | 76 | Alt text not descriptive enough |
| Other warnings | 758 | Various quality/completeness |

---

## Fixability Tiers

### Tier 1 — Section Reordering Only (68 pages)
**Effort:** Low — mechanical, automatable
**What:** Move sections to correct order per ITC v1.1 standard
**Key insight:** 52 of these just need the map section moved

Pages: `whittier`, `wellington`, `virgin-gorda`, `tracy-arm`, `tortola`, `tianjin`, `suva`, `st-thomas`, `st-maarten`, `st-kitts`, `sharm-el-sheikh`, `santorini`, `samana`, `picton`, `norwegian-fjords`, `mykonos`, `mumbai`, `mindelo`, `martinique`, `marthas-vineyard`, `kotor`, `key-west`, `kagoshima`, `jamaica`, `hurghada`, `honningsvag`, `hobart`, `guadeloupe`, `grenada`, `grand-turk`, `glasgow`, `gijon`, `geiranger`, `freeport`, `fortaleza`, `flam`, `falkland-islands`, `ensenada`, `endicott-arm`, `dubrovnik`, `dominica`, `doha`, `cococay`, `cochin`, `cape-cod`, `bonaire`, `bermuda`, `barbados`, `bar-harbor`, `bangkok`, `baltimore`, `bali`, `auckland`, `athens`, `ascension`, `aruba`, `aqaba`, `apia`, `antigua`, `antarctic-peninsula`, `amsterdam`, `amalfi`, `alexandria`, `alesund`, `akaroa`, `ajaccio`, `aitutaki`, `airlie-beach`

### Tier 2 — Template Filler + Ordering (5 pages)
**Effort:** Low-Medium — remove generic passport advice, fix ordering
**What:** Replace/remove `generic_passport_advice` blocks, reorder sections

Pages: `colon`, `chilean-fjords`, `cherbourg`, `charlottetown`, `cephalonia`

### Tier 3 — Moderate Narrative/Image Fixes (5 pages)
**Effort:** Medium — add missing narrative elements or images
**What:** Add emotional pivots, reflections, fix stray HTML tags, add images

Pages: `sihanoukville` (logbook too short), `santos` (needs images), `kusadasi` (stray tags + reflection), `falmouth` (multiple narrative issues), `catania` (emotional pivot + template filler)

### Tier 4 — Substantial Content Needed (35 pages)
**Effort:** High — missing entire sections, insufficient word counts
**What:** Write or expand cruise_port, getting_around, excursions sections; add booking guidance, price info, emotional narrative

Pages (score 0): `vigo`, `ushuaia`, `torshavn`, `tauranga`, `strait-of-magellan`, `st-john-usvi`, `south-shetland-islands`, `scotland`, `saint-john`, `saguenay`, `royal-beach-club-antigua`, `rotorua`, `port-said`, `papeete`

Pages (score 2–56): `waterford`, `punta-arenas`, `salvador`, `sydney-ns`, `port-arthur`, `tangier`, `st-croix`, `santa-marta`, `ravenna`, `tunis`, `port-elizabeth`, `ponta-delgada`, `punta-del-este`, `tobago`, `south-pacific`, `la-spezia`, `zadar`, `trinidad`, `tender-ports`, `puerto-montt`, `callao`

---

## Orchestrated Normalization Strategy

*Pipeline: Claude (lead) + simulated GPT/Gemini/Grok consultations*
*Backend note: `/home/user/ken/orchestrator/` unavailable — pipeline executed inline*

---

### Phase 1: Tier 1 — Automated Section Reordering (68 pages)

**Approach:** Build a Node.js script using cheerio that:
1. Parses each port HTML file
2. Identifies all `<details class="port-section" id="SECTION_ID">` blocks
3. Extracts them from the DOM
4. Reinserts them in EXPECTED_MAIN_ORDER:
   ```
   hero → logbook → featured_images → cruise_port → getting_around → map →
   beaches → excursions → history → cultural → shopping → food → notices →
   depth_soundings → practical → gallery → credits → faq → back_nav
   ```
5. Writes the reordered HTML back
6. Runs validator on each modified file

**Technical details:**
- Sections are `<details class="port-section" id="[section-id]">` blocks (see bermuda.html pattern)
- Map section is `<details class="port-section" id="map">` — needs to move after `getting-around` and before `excursions`
- Featured images are typically `<div>` or `<section>` blocks with gallery class — detection via heading text match
- The map's associated Leaflet `<script>` initialization code in `<body>` footer does NOT need to move — only the `<details>` block itself
- **Spot-check requirement:** After bulk run, manually verify 3 pages (one map-only fix, one featured_images fix, one multi-section fix)

**Risk mitigation (from Grok challenge perspective):**
- Some pages use `<section>` instead of `<details>` — script must handle both
- Pages with no ID attribute on sections need heading-text fallback detection
- Preserve all whitespace/indentation patterns to minimize diff noise

**Estimated effort:** Script build: 1 session. Execution + verification: 1 session.

---

### Phase 2: Tier 2 — Template Filler Removal (5 blocking + ~25 warning-level)

**Approach:**
1. Identify the exact `generic_passport_advice` fingerprint text (appears in 30 pages)
2. Grep for the fingerprint across all port pages
3. Remove the block entirely (it's generic copy-paste, not port-specific)
4. For the 5 blocking pages, also apply Phase 1 section reordering if needed
5. Do NOT replace with new content — removal alone clears the blocking error

**What the template filler looks like:**
- Generic passport/documentation advice paragraphs identical across ports
- Located in Depth Soundings or practical sections typically
- Content like "Make sure your passport is valid for at least six months..."

**Risk:** Removing content reduces word count. Verify that remaining content still meets minimum thresholds after removal. If a page drops below minimum, flag for Phase 4 content expansion instead.

**Estimated effort:** 1 session (grep + bulk remove + validate).

---

### Phase 3: Tier 3 — Moderate Fixes (5 pages)

| Page | Issues | Fix Strategy |
|------|--------|-------------|
| `sihanoukville` | logbook_minimum | Expand logbook narrative with port-specific sensory detail |
| `santos` | minimum_images | Source/add images (check ports/img/santos/) |
| `kusadasi` | stray_details_tag, stray_article_tag, reflection_missing | Fix HTML structure + add reflection section |
| `falmouth` | logbook_minimum, minimum_images, emotional_pivot_missing, reflection_missing, stray_details_tag | Major narrative expansion needed — borderline Tier 4 |
| `catania` | emotional_pivot_missing, template_filler_detected | Add emotional pivot + remove template filler |

**Voice requirements:** All new narrative content must follow Like-a-human v2.0.0:
- First-person, sensory, specific place names and prices
- Emotional pivot: "Standing [specific location] at [specific time]..."
- Reflection: honest personal takeaway, not generic travel advice

**Estimated effort:** 1-2 sessions (manual, page-by-page).

---

### Phase 4: Tier 4 — Content Expansion (35 pages)

**Priority order** (highest current score first — closest to passing):

| Priority | Pages | Score Range | Primary Gaps |
|----------|-------|-------------|-------------|
| 4A | `callao`, `puerto-montt`, `tender-ports`, `trinidad`, `tobago` | 44–56 | 1-3 missing sections |
| 4B | `zadar`, `south-pacific`, `la-spezia`, `punta-del-este`, `santa-marta` | 10–26 | 3-5 missing sections |
| 4C | `tunis`, `tangier`, `ravenna`, `st-croix`, `port-elizabeth`, `ponta-delgada`, `port-arthur`, `sydney-ns`, `salvador`, `waterford`, `punta-arenas` | 2–14 | 5-7 missing sections |
| 4D (score 0) | `vigo`, `ushuaia`, `torshavn`, `tauranga`, `strait-of-magellan`, `st-john-usvi`, `south-shetland-islands`, `scotland`, `saint-john`, `saguenay`, `royal-beach-club-antigua`, `rotorua`, `port-said`, `papeete` | 0 | Near-complete rewrites |

**Content generation approach:**
1. Read existing page content first (careful-not-clever guardrail)
2. Identify what sections exist and what's missing
3. Generate missing sections following ITC v1.1 word count requirements:
   - Cruise port: 100-400 words
   - Getting around: 200-600 words
   - Excursions: 400-1200 words (must include booking guidance keywords + DIY price mentions)
   - Logbook: 800-2500 words (first-person, emotional pivot, reflection)
4. Voice-audit all generated content before committing
5. Run validator after each page

**Multi-LLM pipeline (when backend available):**
- Claude generates standards-compliant content
- GPT reviews for structural completeness
- Gemini checks travel data accuracy
- Grok challenges UX assumptions

**Estimated effort:** 5-10 sessions depending on page count per session.

---

### Phase 5: Warning Remediation (Non-Blocking, All 387 Pages)

**Tier A — Automatable (run after blocking fixes complete):**

| Warning | Count | Automation Strategy |
|---------|-------|-------------------|
| `duplicate_html_ids` | 85 | Script to detect + suffix duplicates |
| `missing_sw_registration` | 17 | Inject SW registration snippet |
| `last_reviewed_stamp_missing` | 14 | Add `last-reviewed` meta tag with today's date |
| `missing_swiper_ready` | 20 | Add Swiper fallback pattern |

**Tier B — Semi-Automatable (bulk script + manual review):**

| Warning | Count | Strategy |
|---------|-------|----------|
| `faq/answer_too_long` | 384 | Review 80-word threshold — may need validator adjustment rather than mass-trimming. Many long answers are genuinely helpful. **Decision needed: adjust threshold or trim content?** |
| `generic_noscript_weather` | 168 | Generate port-specific noscript weather text |
| `author_consistency/disclaimer_logbook_contradiction` | 126 | Align author disclaimer with logbook voice level |
| `experience_level_missing` | 66 | Add experience disclaimer to author card |

**Tier C — Manual/Creative (per-page work):**

| Warning | Count | Strategy |
|---------|-------|----------|
| `poi_manifest/insufficient_pois` | 290 | Expand poi-index.json with port POIs (data work) |
| `voice_quality/*` | 151+ | Per-page voice audit — run Like-a-human diagnostic |
| `gallery_credit_low_diversity` | 151 | Source additional photographers (image work) |
| `generic_alt_text` | 76 | Write descriptive, port-specific alt text per image |
| `first_person_maximum` | 164 | Review for pronoun overuse — may be false positives |

**Decision points for user:**
1. FAQ 80-word limit: Is this the right threshold? Many answers are intentionally detailed.
2. POI data: Is there a bulk data source for port POIs, or manual entry?
3. Gallery credits: Are additional image sources available?
4. First-person maximum: Is 64+ pronouns actually a problem, or natural for logbook voice?

---

## Execution Timeline

| Phase | Pages | Effort | Dependency |
|-------|-------|--------|-----------|
| Phase 1 | 68 | 2 sessions | None — start immediately |
| Phase 2 | 30 | 1 session | None — can parallel with Phase 1 |
| Phase 3 | 5 | 1-2 sessions | After Phase 1 (reordering may be needed) |
| Phase 4 | 35 | 5-10 sessions | After Phase 1-2 complete |
| Phase 5 | 387 | 3-5 sessions | After Phase 1-4 complete |

**Target:** Move from 70.8% pass rate (274/387) to 100% pass rate (387/387) on blocking errors, then address warnings to improve median score from 84 to 90+.

---

## Raw Data

Full JSON results saved to: `admin/port-validation-results-2026-03-25.json`
Validator: `admin/validate-port-page-v2.js --all-ports`

---

**Soli Deo Gloria**
