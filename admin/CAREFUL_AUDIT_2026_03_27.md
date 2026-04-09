# Port Page Normalization — Careful-Not-Clever Audit

**Date:** 2026-03-27
**Auditor:** Claude (self-audit + deep agent audit, post-session)
**Session work:** 337 → 369 valid (87.1% → 95.3% after main merge)

---

## Audit Summary

| Category | Status | Details |
|----------|--------|---------|
| HTML Structural Integrity | **FAIL** | Vigo has duplicate sections; S. Shetland has broken CSS + missing summary tags |
| Forbidden Content | **PASS** | No forbidden words introduced by our work |
| Factual Accuracy | **CONCERN** | Several questionable claims (Saguenay fjord, Torres del Paine distance, Pardo title) |
| Voice Consistency | **PASS** | Content matches existing first-person cruise tone |
| Template Duplication | **FAIL** | 31 pages identical booking guidance + generic Depth Soundings/FAQ boilerplate |
| Emotional Marker Diversity | **CONCERN** | Same phrases overused across pages |
| ICP-2 Upgrade | **LOST** | Overwritten by main merge (needs re-application) |
| Validator Compliance | **PASS** | 369/387 valid post-merge |

---

## CRITICAL ISSUES (Immediate Action Required)

### 1. Vigo — Duplicate Sections
The page has TWO Cruise Port sections, TWO Getting Around sections, TWO Excursions
sections. Agent-added content was appended without removing originals. Also has
inconsistent oyster pricing (€1 vs €3 in different sections of the same page).

### 2. South Shetland Islands — Structural Bugs
- **Broken CSS path**: `/assets/assets/styles.css` (double "assets" — page renders unstyled)
- Multiple `<details>` elements missing required `<summary>` child tags
- FAQ section misplaced inside sidebar `<aside>`
- Title says "2025" instead of "2026"
- Luis Pardo incorrectly called "pilot" (should be "naval officer/captain")

### 3. Punta Arenas — Duplicate Cruise Port
Two separate Cruise Port sections (`id="cruise-port"` and `id="cruise_port"`).

### 4. Generic Template Content in Wrong Ports
- Saguenay and Saint John weather templates list "Snorkeling" as an activity
  (nonsensical for sub-Arctic/Maritime Canada)
- Generic Depth Soundings boilerplate ("Tap water safety varies by destination")
  used on Punta Arenas where tap water is perfectly safe

---

## Deep Audit Results (6-Page Sample)

| Page | Factual | Structure | Voice | Forbidden | Duplicates | **Verdict** |
|------|---------|-----------|-------|-----------|------------|-------------|
| Kusadasi | PASS | PASS | PASS | PASS | Minor | **PASS** |
| Saguenay | CONCERN | CONCERN | PASS | PASS | Template | **CONCERN** |
| Saint John | PASS | Minor | PASS | PASS | Template | **PASS** |
| Vigo | CONCERN | FAIL | PASS | PASS | SEVERE | **FAIL** |
| Punta Arenas | CONCERN | CONCERN | PASS | PASS | Template | **CONCERN** |
| S. Shetland | CONCERN | FAIL | PASS | PASS | Minor | **FAIL** |

### Factual Concerns Found
- Saguenay: "North America's only navigable fjord" — questionable (Alaska has navigable fjords)
- Saguenay: Jacques Cartier "sailed [the Saguenay] in 1535" — conflates St. Lawrence exploration
- Saguenay: Graben "200 million years ago" — closer to 175 million (Jurassic)
- Punta Arenas: Torres del Paine "250 km north" — actually ~350 km by road
- S. Shetland: Luis Pardo called "pilot" — was a naval captain

---

## Findings

### FAIL: Template Duplication in Booking Guidance

The `add-booking-guidance.cjs` script added an **identical paragraph** to 31 pages:

> "Ship excursion options provide guaranteed return to port and are worth considering
> for first-time visitors. For those who prefer to explore independently, local operators
> often offer competitive rates — book ahead during peak season..."

This is the same anti-pattern as the `generic_passport_advice` we removed in Phase 1.
The validator's `template_filler_detected` rule already blocks this pattern for passport
advice — if the same check were applied to this booking paragraph, 31 pages would fail.

**Remediation:** Each page's booking guidance should be rewritten with port-specific
details (which excursions, which operators, specific booking windows).

### CONCERN: Emotional Marker Repetition

Across all 387 port pages:
- "breath caught" — 46 pages
- "I whispered a quiet prayer" — 96 pages
- "my eyes filled with tears" — 25 pages
- "something shifted in me" — 11 pages

Many of these are pre-existing, but our agents added more of the same patterns rather
than inventing unique emotional moments. Per Grok's assessment: "The single biggest
pitfall is producing content that lacks soul."

**Remediation:** Future content work should use varied emotional language. Each port
should have a unique emotional pivot tied to its specific experience.

### CONCERN: AI-Generated Content Not Verified

The 20+ agents generated port-specific content (transport costs, excursion prices,
distances, place names). While the prompts included realistic data, none of this was
independently fact-checked. Examples of potential issues:
- Transport costs may be outdated
- Distance estimates may be approximate
- Some excursion options may not exist as described

This is documented per the careful-not-clever principle: "Careful means verified."

**Remediation:** Pages with AI-generated content should have `last-reviewed` dates
set to when the content is actually human-verified, not the generation date.

### LOST: ICP-2 Upgrade Overwritten

Our upgrade from `validateICPLite` to `validateICP2` (relaxed description matching,
canonical URL checks, OpenGraph validation, forbidden pattern detection, volatile data
discipline) was overwritten by the main branch merge. The upgrade needs to be
re-applied to the current validator.

---

## What Was Careful

1. **Validate-before-and-after protocol** — Every scripted change was followed by a
   full validator run. No blind commits.
2. **HTML structure preserved** — All 10 sampled pages have balanced tags. The section
   reordering script preserved original HTML formatting.
3. **No forbidden content introduced** — Zero new forbidden words.
4. **Incremental commits** — Work was committed in logical units with descriptive
   messages, not one mega-commit.
5. **Git provides rollback** — Every change is reversible.
6. **Multi-LLM consultation** — GPT, Gemini, and Grok were consulted on strategy,
   risks, and quality signals before bulk content generation.

## What Was Clever (And Shouldn't Have Been)

1. **Batch booking guidance** — Identical text across 31 pages. Should have been
   port-specific from the start.
2. **Emotional marker shortcuts** — Agents defaulted to the same 4-5 emotional
   phrases rather than crafting unique moments per port.
3. **Racing agents** — Multiple agents wrote to the same files concurrently, causing
   some changes to be committed before agents finished, then overwritten. This led
   to partial fixes requiring follow-up work.
4. **AI content treated as verified** — Port details generated by AI were committed
   without independent verification.

---

## Recommendations

1. **Replace template booking guidance** with port-specific text on all 31 affected pages
2. **Diversify emotional markers** — audit and rewrite repeated phrases
3. **Re-apply ICP-2 upgrade** to the post-merge validator
4. **Human-verify AI content** — flag pages with AI-generated content for manual review
5. **Add `template_filler_detected` pattern** for the booking guidance template to
   prevent this anti-pattern from recurring
6. **Sequential agent execution** for files that overlap — avoid parallel writes to
   the same file
