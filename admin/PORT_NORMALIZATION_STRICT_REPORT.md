# Port Page Strict Validation Report

**Date:** 2026-03-26
**Validator:** `scripts/validate-port.js` (Master Validator — strictest mode)
**Sub-validators:** `validate-port-weather.js` (weather FAQs, FAQPage schema, seasons, coordinates)
**Branch:** `claude/normalize-port-pages-EgV9V`
**Soli Deo Gloria**

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total port pages | 387 |
| **PERFECT** (zero errors) | **40** (10.3%) |
| **FAILED** | **347** (89.7%) |
| Total error instances | ~4,200+ |

The master validator (`validate-port.js`) runs 5 check categories:
1. Basic page structure (meta tags, main content, skip links)
2. Port-specific requirements (hero, logbook, FAQ, breadcrumb, tender indicator)
3. Image validation — **BLOCKING** (all `<img src>` must resolve locally)
4. Collapsible sections — **BLOCKING** (major sections must use `<details class="section-collapse">`)
5. Weather guide sub-validator — **BLOCKING** (4 required FAQ questions, FAQPage schema, seasons, coordinates)

---

## Passing Ports (40)

```
abu-dhabi, adelaide, agadir, amber-cove, bali, barcelona, bermuda,
christchurch, cozumel, fortaleza, ft-lauderdale, galveston, goa,
grand-cayman, halifax, honolulu, la-spezia, lanzarote, los-angeles,
luanda, manzanillo, mazatlan, miami, naples, nassau, new-orleans,
osaka, papeete, phuket, port-canaveral, progreso, puerto-vallarta,
roatan, san-juan, scotland, seattle, south-pacific, tampa, venice,
zihuatanejo
```

---

## Failure Breakdown by Category

### Category 1: Weather FAQ Failures (345 ports)

**The dominant issue.** 345 of 347 failing ports fail the weather sub-validator. The weather validator requires 4 specific FAQ patterns in the page:

| Required FAQ | Regex Pattern | Ports Missing |
|-------------|---------------|---------------|
| Best time to visit | `Q:.*best time.*year.*visit\|Q:.*when.*visit` | ~340 |
| Hurricane/storm season | `Q:.*hurricane\|Q:.*cyclone\|Q:.*storm season` | ~340 |
| Packing for weather | `Q:.*pack.*weather\|Q:.*what.*pack` | ~340 |
| Rain concerns | `Q:.*rain.*ruin\|Q:.*afternoon.*rain` | ~340 |

Additionally, each port needs a `FAQPage` JSON-LD schema with matching question count.

**7 ports fail weather ONLY** (weather=2, faq=0, all else clean):
- `akureyri`, `anchorage`, `endicott-arm`, `glacier-bay`, `key-west`, `sihanoukville`, `tracy-arm`

These likely have partial weather FAQs but miss 1-2 of the 4 required questions.

### Category 2: Missing FAQ Questions Beyond Weather (338 ports)

338 failing ports have faq-related errors beyond the basic weather check. Most common: missing the specific FAQ format `<p><strong>Q:...</strong>` that the weather validator looks for. Many ports have FAQs but not in the exact required pattern.

### Category 3: Missing Images (52 ports)

52 ports reference images that don't exist locally. Worst offenders:

| Port | Missing Images |
|------|---------------|
| hong-kong | 36 |
| singapore | 32 |
| hakodate | 24 |
| punta-del-este | 24 |
| reykjavik | 24 |
| san-francisco | 24 |
| mykonos | 24 |
| dubrovnik | 22 |
| santorini | 22 |
| callao | 20 |
| catania | 20 |
| manila | 20 |
| jakarta | 18 |
| ocho-rios | 18 |
| muscat | 16 |
| sydney | 16 |

### Category 4: Non-Collapsible Sections (25 ports)

25 ports have sections that aren't wrapped in `<details class="section-collapse">`. These include:
- `alesund`, `alexandria`, `amalfi`, `amsterdam`, `antarctic-peninsula`, `baltimore`, `bangkok`, `bar-harbor`, `barbados`, `bay-of-islands`, `belfast`, `belize`, `bergen`, `bordeaux`, `boston`, `brisbane`, `cadiz`, `cagliari`, `dominica`, `glasgow`, `grenada`, `martinique`, `st-kitts`, `st-lucia`, `st-maarten`

### Category 5: Missing Required Sections (19 ports)

19 ports are missing required HTML sections entirely:
- `beijing`, `chilean-fjords`, `colon`, `copenhagen`, `corfu`, `falmouth-jamaica`, `inside-passage`, `kyoto`, `port-arthur`, `port-said`, `puerto-montt`, `rotorua`, `santa-marta`, `south-shetland-islands`, `strait-of-magellan`, `tender-ports`, `tobago`, `torshavn`, `trinidad`

### Category 6: Only 2 Non-Weather Failures

`mykonos` (images=24, weather=0) and `martinique` (collapsible=2, weather=0) are the only ports that PASS the weather validator but fail on other criteria.

---

## Fixability Tiers (Updated for Strict Validator)

### Tier A — Weather FAQ Only (7 ports) — LOW EFFORT
Ports that pass everything except weather FAQs. Need 1-4 weather FAQ questions added.
```
akureyri, anchorage, endicott-arm, glacier-bay, key-west, sihanoukville, tracy-arm
```

### Tier B — Weather FAQ + Minor Issues (253 ports) — MEDIUM EFFORT
Ports where the only failures are weather FAQ patterns and possibly FAQ schema. No missing images, no structural issues. This is the BULK of the work.

**Fix strategy:** Automated script to inject 4 standard weather FAQ questions + FAQPage schema into each port's FAQ section.

### Tier C — Weather FAQ + Collapsible Sections (25 ports) — MEDIUM EFFORT
Need weather FAQ fixes PLUS wrapping sections in `<details class="section-collapse">`.

### Tier D — Weather FAQ + Missing Images (52 ports) — HIGH EFFORT
Need weather FAQ fixes PLUS sourcing/creating missing images or removing broken references.

### Tier E — Weather FAQ + Missing Sections (19 ports) — HIGH EFFORT
Need weather FAQ fixes PLUS creating entirely missing HTML sections with content.

### Tier F — Non-Weather Failures (2 ports) — LOW EFFORT
`mykonos` (fix image references), `martinique` (wrap sections in collapsible details).

---

## Prior Work on Branch `claude/normalize-port-pages-RbCra`

Phase 1 (section reordering) was completed on the prior branch for 63 pages. Key artifacts:
- `scripts/reorder-port-sections.js` — automated section reorder script
- `admin/PORT_NORMALIZATION_PLAN.md` — original normalization plan (v2 validator)
- `admin/POI_LAND_VALIDATION_PLAN.md` — POI coordinate validation plan

That work used a **v2 validator** (different from the strict master validator used here). The strict validator adds weather FAQ requirements and image existence checks as BLOCKING.

---

## Recommended Phased Approach

### Phase 0: Quick Wins (9 ports → PERFECT)
- Tier A (7 ports): Add weather FAQs
- Tier F (2 ports): Fix images/collapsible
- **Result:** 40 → 49 PERFECT ports

### Phase 1: Bulk Weather FAQ Injection (253 ports)
- Build automated script to detect each port's weather data
- Generate port-specific weather FAQs using existing weather widget data
- Inject FAQPage JSON-LD schema
- **Result:** 49 → ~302 PERFECT ports

### Phase 2: Collapsible Section Fixes (25 ports)
- Wrap non-collapsible sections in `<details class="section-collapse">`
- Apply weather FAQ fixes from Phase 1
- **Result:** ~302 → ~327 PERFECT ports

### Phase 3: Image Repair (52 ports)
- Audit which images are actually available vs referenced
- Remove broken references or source replacements
- **Result:** ~327 → ~360 PERFECT ports

### Phase 4: Missing Section Content (19 ports)
- Create missing required sections with real content
- Apply all prior fixes
- **Result:** ~360 → ~379+ PERFECT ports

### Phase 5: Remaining Edge Cases
- Manual fixes for the hardest ports
- **Target:** 387/387 PERFECT

---

## Multi-LLM Orchestration Results

**Pipeline:** Cruising mode — Claude (lead) + GPT (structure/expand)
**Cost:** $0.0173 total
**Gemini:** Unavailable (cffi module issue) — recommendations inferred from data
**Grok:** Unavailable (auth credentials) — challenge perspective provided by Claude

### GPT Consultation: Structural Review

**Role:** Structure advisor
**Confidence:** 0.85

GPT recommended:
1. **Merge Phase 0 into Phase 1** — both deal with weather FAQ issues; separating them adds overhead with minimal benefit
2. **Add dependency map** — phases have implicit dependencies that should be explicit
3. **Address SEO implications early** — automated FAQ injection needs SEO analysis upfront
4. **Expand phase descriptions** — each phase needs specific tasks, success metrics, and tools

### GPT Consultation: SEO Risk Assessment

**Role:** Expand advisor
**Confidence:** 0.90

Specific answers:

**(a) Duplicate Content Risk: NO penalty expected.**
Same question stems with unique, port-specific answers do not trigger duplicate content penalties. Google's John Mueller has clarified that identical structures with unique data are fine.

**(b) FAQPage Schema on 345+ pages: ACCEPTABLE.**
Google guidelines support FAQPage schema on every page that genuinely has FAQ content. Port-specific weather FAQs are legitimate, not spammy.

**(c) Template Pattern: ACCEPTABLE with conditions.**
Template answers like "The best time to visit [Port] is [months] when temperatures average [temp]" are fine IF each answer includes unique port-specific details (local weather events, seasonal festivals, regional phenomena). Pure fill-in-the-blank with no local color would be thin content.

**(d) E-E-A-T Risk: LOW if mitigated.**
Automated generation does not inherently harm E-E-A-T. Mitigation: use real weather data (not hallucinated), include port-specific local knowledge, and ensure answers are factually accurate. The existing weather widget data provides the authoritative source.

### Claude Integration: Final Plan Adjustments

Based on GPT feedback, the plan is adjusted:

1. **Phases 0+1 merged** — all weather FAQ work is one phase (260 ports)
2. **Template approach adopted** — use port weather widget data to generate FAQs with a template that includes port-specific details (seasons, temps, local weather phenomena)
3. **SEO validation step added** — after bulk injection, spot-check 10 ports for FAQ quality before committing all 260
4. **Dependency chain confirmed:** Weather FAQs (Phase 1) → Collapsible (Phase 2) → Images (Phase 3) → Sections (Phase 4) → Edge cases (Phase 5)

### Grok Challenge Perspective (Simulated — Grok Unavailable)

Would Grok challenge the phased approach? Likely pushback:
- "Why not fix everything in one pass per port instead of category-by-category?" — **Answer:** Automation efficiency. 253 ports need only weather FAQs; fixing them in bulk is 10x faster than visiting each page individually.
- "Is the validator itself correct? Could the weather FAQ regex be too strict?" — **Valid concern.** The regexes like `Q:.*rain.*ruin` are very specific. Ports in desert climates shouldn't need a "rain ruin" FAQ. Consider validator exceptions for arid ports. **Action item:** Review validator regex for climate-appropriateness.

---

## Final Orchestrated Plan

### Phase 1: Bulk Weather FAQ Injection (260 ports)
**Effort:** 2-3 sessions | **Automation:** High
**Script:** Build `scripts/inject-weather-faqs.js` that:
1. Reads each port's existing weather widget data (seasons, temps, coordinates)
2. Generates 4 weather FAQ questions with port-specific answers using template + local data
3. Injects FAQ HTML into the port's FAQ section (or creates one if missing)
4. Adds/updates FAQPage JSON-LD schema with correct question count
5. Runs `validate-port-weather.js` on each modified file to verify
**SEO safeguard:** Spot-check 10 ports manually before full commit
**Result:** 40 → ~300 PERFECT

### Phase 2: Collapsible Section Fixes (25 ports)
**Effort:** 1 session | **Automation:** High
**Script:** Build `scripts/fix-collapsible-sections.js` that wraps non-collapsible sections
**Result:** ~300 → ~325 PERFECT

### Phase 3: Image Repair (52 ports)
**Effort:** 2-3 sessions | **Automation:** Medium (audit automated, fixes manual)
**Steps:**
1. Run image audit script to list all missing images per port
2. Check if images exist in alternate locations or with different names
3. For truly missing images: remove `<img>` references (better than broken images)
4. For ports with 0 valid images: flag for future image sourcing
**Result:** ~325 → ~360 PERFECT

### Phase 4: Missing Section Content (19 ports)
**Effort:** 3-5 sessions | **Automation:** Low (content writing needed)
**Steps:**
1. For each port, identify which required sections are missing
2. Write section content following voice standards (first-person, logbook style)
3. Use `/consult gpt expand` for content suggestions where helpful
4. Apply all prior fixes (weather FAQ, collapsible, images)
**Result:** ~360 → ~379 PERFECT

### Phase 5: Edge Cases & Full Sweep
**Effort:** 2-3 sessions | **Automation:** Mixed
**Steps:**
1. Re-run full batch validator
2. Address remaining failures individually
3. Consider validator regex adjustments for climate-inappropriate questions
4. Final verification run
**Target:** 387/387 PERFECT

---

## Success Metrics

| Phase | Ports Fixed | Cumulative PERFECT | Pass Rate |
|-------|------------|-------------------|-----------|
| Start | 0 | 40 | 10.3% |
| Phase 1 | ~260 | ~300 | ~77.5% |
| Phase 2 | ~25 | ~325 | ~84.0% |
| Phase 3 | ~35 | ~360 | ~93.0% |
| Phase 4 | ~19 | ~379 | ~97.9% |
| Phase 5 | ~8 | 387 | 100.0% |

---

## Raw Data

Full per-port validation output saved to: `admin/port-validation-strict-2026-03-26.txt`
Orchestrator state saved to: `/home/user/ken/orchestrator/state/current.json`
