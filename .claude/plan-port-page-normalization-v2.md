# Port Page Normalization Plan v2

**Created:** 2026-03-27
**Supersedes:** plan-port-page-remediation.md (2026-02-12)
**Validator:** `admin/validate-port-page-v2.js` (ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300)
**Previous baseline:** 126/380 pass (33.2%) — 2026-02-12
**Starting baseline:** 337/387 valid (87.1%) — 2026-03-27
**Current:** 370/387 valid (95.6%) — 2026-03-27 (after all phases executed)
**Target:** 387/387 valid (100%)
**Orchestra review:** GPT-4o + Grok-3 + Gemini-2.5-Flash consulted 2026-03-27

---

## Executive Summary

Significant progress since the original plan: pass rate jumped from 33.2% to 87.1% (211 additional pages now passing). 50 pages remain failing. The remaining work is categorized into 5 phases (consolidated from 6 per orchestra recommendation) ordered by ROI and scriptability. The error landscape has shifted — the dominant blocking errors are now content-quality issues (`template_filler_detected`, `booking_guidance`, word count minimums) rather than structural/HTML issues.

### Orchestra Synthesis (GPT-4o + Claude)
- **Merge phases 1-3** into a single automated scriptable pass (GPT: HIGH confidence, Claude: WHEAT)
- **Validate-before-and-after protocol** for all scripted changes — use the v2 validator itself as the regression test (GPT proposed testing framework; Claude refined to use existing validator as test harness)
- **AI-assisted content generation** for Tier C rebuilds, with voice-audit hook and human editorial review (GPT: MEDIUM confidence, Claude: WHEAT with site-specific guardrail enforcement)
- **Adjust `answer_too_long` threshold** — 384/387 pages flagged means the threshold is too aggressive (GPT: low-hanging fruit, Claude: WHEAT)
- **Validator allowlist** for false positives (place names like Hell's Gate) rather than content rewrites (Claude lead position)

---

## Current State (2026-03-27)

### Score Distribution
| Range | Count | Notes |
|-------|-------|-------|
| 95-100 | 29 | Excellent — passing |
| 90-94 | 96 | Solid — passing |
| 85-89 | 87 | Good — passing |
| 80-84 | 103 | Acceptable — passing |
| 70-79 | 33 | Borderline — 22 passing, 11 failing |
| 60-69 | 2 | Failing |
| 50-59 | 3 | Failing |
| 40-49 | 3 | Failing |
| 20-29 | 4 | Failing |
| 10-19 | 8 | Failing |
| 0-9 | 19 | Failing |

### Blocking Error Frequency (50 failing pages)
| Error Rule | Count | Scriptable? | Description |
|------------|-------|-------------|-------------|
| `missing_required_sections` | 33 | Partial | Missing hero, excursions, depth_soundings, etc. |
| `getting_around_minimum` | 32 | No | Getting around section below word count |
| `booking_guidance` | 32 | Template | Missing booking/reservation guidance |
| `excursions_minimum` | 31 | No | Excursions section below word count |
| `template_filler_detected` | 30 | Yes | Generic passport advice copy-pasted across ports |
| `logbook_minimum` | 23 | No | Logbook section below word count |
| `cruise_port_minimum` | 22 | No | Cruise port section below word count |
| `reflection_missing` | 21 | No | Logbook missing reflection/insight |
| `emotional_pivot_missing` | 19 | No | Logbook missing emotional pivot |
| `diy_price_mentions` | 16 | Template | Missing DIY pricing information |
| `out_of_order` | 13 | Yes | Sections out of canonical order |
| `total_minimum` | 6 | No | Page below total word count |
| `first_person_minimum` | 6 | No | Insufficient first-person narrative |
| `first_person_voice` | 5 | No | Logbook not in first-person voice |
| `minimum_images` | 4 | No | Not enough images |
| `accessibility_notes` | 2 | Template | Missing accessibility information |
| `stray_details_tag` | 2 | Yes | Malformed HTML details tags |
| Other structural | 6 | Mixed | JSON-LD, hero, sidebar, gambling/profanity false positives |

### Top Warnings (all 387 pages — non-blocking but quality indicators)
| Warning | Count | Priority |
|---------|-------|----------|
| `answer_too_long` | 384 | Low — FAQ answers exceed ideal length |
| `insufficient_pois` | 290 | Medium — weather widget POI data |
| `poi_ids_without_pois` | 261 | Medium — orphaned POI references |
| `generic_noscript_weather` | 168 | Low — generic weather noscript fallback |
| `first_person_maximum` | 164 | Low — excessive first-person narrative |
| `voice_v01` | 151 | Medium — voice quality flags |
| `gallery_credit_low_diversity` | 151 | Low — credit source diversity |
| `disclaimer_logbook_contradiction` | 126 | Medium — disclaimer vs logbook mismatch |
| `duplicate_html_ids` | 85 | Medium — HTML ID conflicts |
| `generic_alt_text` | 76 | Medium — accessibility |

---

## Remediation Phases

> **Protocol (per orchestra recommendation):** Every scripted phase follows validate→modify→re-validate. Run `node admin/validate-port-page-v2.js --all-ports --json-output` before AND after each phase. Diff results to confirm only intended changes. Git commit after each successful phase.

### Phase 1: Unified Scriptable Pass (43 pages) — AUTOMATED
**Goal:** 337 → ~350 valid (+13 pages where scriptable fixes are the sole blockers)
**Combines:** Template filler removal (30 pages) + Section reordering (13 pages) + Stray HTML fixes (2 pages)
**Method:** Single Node.js script (`admin/normalize-port-pages-v2.cjs`) that performs three operations per page in one pass:

1. **Template filler removal** — Find and remove `generic_passport_advice` blocks (30 pages). Replace with a single port-specific sentence about entry requirements, or remove entirely if covered elsewhere on the page.
2. **Section reordering** — Parse sections by ID, reorder to canonical sequence (13 pages):
   > hero → weather-guide → logbook → cruise-port → getting-around → from-the-pier → map → beaches → excursions → food → notices → depth-soundings → practical → faq → gallery → credits
3. **Stray HTML tag cleanup** — Fix malformed `<details>` and `<article>` tags (kusadasi, falmouth).

**Pages resolved by this phase alone:**
- kagoshima (80), cococay (78), picton (74) — section reorder only
- chilean-fjords (78), colon (72), charlottetown (72), cherbourg (70), cephalonia (70) — filler removal only
- sharm-el-sheikh (68), doha (68) — section reorder only
- kusadasi partial (stray tags fixed, still needs reflection_missing content)

**Risk:** Low — removing generic content and reordering existing sections. Git provides rollback.
**Effort:** 3-4 hours (script development + testing + review).

### Phase 2: Tier A Quick Wins — Remaining Single-Error Pages (5 pages)
After Phase 1, these pages still need targeted fixes:

| Page | Score | Remaining Error | Fix Strategy |
|------|-------|----------------|--------------|
| santos.html | 80 | minimum_images | Source/add port images |
| catania.html | 78 | emotional_pivot_missing | Add emotional pivot to logbook narrative |
| sihanoukville.html | 74 | logbook_minimum | Expand logbook content (~200 words) |
| kusadasi.html | 46 | reflection_missing | Add reflection/insight to logbook |
| falmouth.html | 40 | logbook_min, min_images, emotional_pivot, reflection | Logbook rewrite + source images |

**Method:** Manual content work per page. Use AI-assisted drafting with voice-audit hook validation.
**Effort:** 1-2 hours.

### Phase 3: Tier B Content Additions (6 pages, score 40-69)
After Phase 1 removes filler and reorders sections, these pages need content additions:

| Page | Score | Key Remaining Errors |
|------|-------|---------------------|
| callao.html | 56 | missing_sections, cruise_port/excursions minimum, booking |
| puerto-montt.html | 52 | missing_sections, getting_around minimum |
| trinidad.html | 44 | getting_around/excursions minimum, booking guidance |
| tender-ports.html | 52 | **RECOMMEND: exclude from validation (hub page)** |
| south-pacific.html | 24 | **RECOMMEND: exclude from validation (regional overview)** |
| zadar.html | 26 | missing_sections, multiple minimums, booking |

**Strategy:**
- tender-ports.html + south-pacific.html: Add to validator exclusion list (not individual port pages)
- Others: Add missing sections with port-specific content, booking guidance, getting-around details
**Effort:** 4-6 hours.

### Phase 4: Tier C Structural Rebuild (31 pages, score 0-39)
These pages have 6-22 blocking errors each. Common pattern: missing multiple required sections, below word minimums, no first-person logbook, no booking guidance, template filler.

**Content Generation Strategy (per orchestra recommendation):**
Use AI-assisted drafting with the following guardrails:
1. Draft content using Claude with port-specific research data
2. Voice-audit hook validates each draft automatically before commit
3. Careful-not-clever guardrail ensures verified, documented content only
4. Human editorial review for logbook narratives (first-person voice, emotional pivot, reflection)
5. All content must pass the v2 validator's word count minimums and content purity checks

**Sub-groupings:**

**4A: Pages needing content expansion (25 pages)**
Most have structural sections present but content is too thin. Need:
- Expanded logbook with first-person voice, emotional pivot, reflection
- Getting around section with transport details
- Excursions section with activity recommendations
- Booking guidance paragraphs
- DIY pricing mentions
- Template filler removal (handled in Phase 1 script)

**4B: torshavn.html — Full rebuild (1 page)**
22 blocking errors including missing JSON-LD, hero, sidebar. Needs complete page rebuild from template.

**4C: Special cases (3 pages)**
- `tauranga.html` — 13 errors including false positive gambling/profanity (Hell's Gate place name). **Requires validator allowlist entry + content expansion.**
- `salvador.html` — Missing hero image, no first-person content. Needs hero image sourcing + logbook rewrite.
- `papeete.html` — Out of order + content deficiencies. Phase 1 handles reordering; content needs expansion.

**4D: Validator changes needed (2 items)**
- Add `tender-ports.html` and `south-pacific.html` to validator exclusion list
- Add place-name allowlist for `forbidden_gambling`/`forbidden_profanity` (Hell's Gate/Rotorua, Hell-Ville/Madagascar, Hell/Grand Cayman, Casino de Monte-Carlo)

**Effort:** High — each content page needs 30-60 minutes. Total ~20-30 hours for all 31 pages.
**Recommended approach:** Batch by cruise region (Caribbean → Mediterranean → Asia-Pacific → Expeditionary) to maintain contextual consistency.

### Phase 5: Warning Remediation & Validator Tuning
**Goal:** Reduce warning count from ~2,500 to <500 across all 387 pages.

**5A: Validator threshold adjustment (LOW effort, HIGH impact)**
- `answer_too_long`: 384/387 pages flagged. Raise threshold or convert to INFO. (Orchestra consensus: WHEAT)
- `first_person_maximum`: 164 pages. Review threshold — may be too aggressive.

**5B: Accessibility warnings (MEDIUM effort)**
- `duplicate_html_ids`: 85 pages — scriptable dedup
- `generic_alt_text`: 76 pages — needs per-image review
- `short_alt`: 51 pages — expand alt text
- `missing_h1`: 33 pages — add h1 elements

**5C: Technical debt (LOW priority)**
- `insufficient_pois`: 290 pages — requires POI data import (ask user about data source)
- `poi_ids_without_pois`: 261 pages — orphaned references to clean up
- `missing_swiper_ready`: 20 pages — gallery initialization fix

**Effort:** 8-12 hours total across all warning categories.

---

## Recommended Execution Order

1. **Phase 1** (template filler removal) — highest ROI, scriptable, instantly fixes 6 pages
2. **Phase 2** (section reordering) — scriptable, fixes 5 more pages (including sharm-el-sheikh + doha)
3. **Phase 3** (stray HTML fixes) — quick manual fixes for kusadasi + falmouth
4. **Phase 4** (remaining single-error pages) — santos (images), sihanoukville (logbook), catania (emotional pivot)
**Expected progression:**
| After Phase | Valid Pages | Pass Rate |
|-------------|-------------|-----------|
| Current | 337 | 87.1% |
| Phase 1 | ~350 | ~90.4% |
| Phase 2 | ~355 | ~91.7% |
| Phase 3 | ~359 | ~92.8% |
| Phase 4 | ~385 | ~99.5% |
| Phase 5 | 387 | 100% (warnings addressed) |

---

## Open Questions for User

1. Should `tender-ports.html` + `south-pacific.html` be excluded from port-page validation? (Hub/regional pages)
2. `tauranga.html` — Hell's Gate triggers `forbidden_gambling`/`forbidden_profanity`. Validator allowlist or content rewrite?
3. For Tier C content generation — prioritize by traffic/season relevance, or alphabetical?
4. `answer_too_long` warning on 384/387 pages — what should the revised threshold be?
5. `insufficient_pois` on 290 pages — is there a POI data source for bulk import?
6. Should `falmouth-jamaica.html`/`ho-chi-minh-city.html` duplicates be resolved?

---

## Files Modified by This Plan

- 50 port HTML files (various phases)
- `admin/normalize-port-pages-v2.cjs` (new — Phase 1 unified script)
- `admin/validate-port-page-v2.js` (false positive allowlist + threshold adjustments)
- No JavaScript/CSS framework changes needed
