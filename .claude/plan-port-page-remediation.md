# Port Page Remediation Plan

**Created:** 2026-02-12
**Updated:** 2026-02-12
**Validator:** `admin/validate-port-page-v2.js` (ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300)
**Baseline:** 71/380 pass (18.7%), 309/380 fail (81.3%)

---

## Work Completed (2026-02-12): section_order/missing_required_sections Fix

**Result:** Reduced `missing_required_sections` from **248 → 164** pages (84 pages fixed, 34% reduction)

### What was done:
1. **Hero detection (145 fixed, 64 remaining):**
   - Converted 156 `<div class="port-hero">` → `<section class="port-hero" id="hero">` (element change + id addition)
   - Added `id="hero"` to 14 `<section class="port-hero">` elements lacking it
   - 64 pages have NO port-hero element at all (need hero images)

2. **Depth soundings (82 fixed, 91 remaining):**
   - Renamed 69 `<h3>Pro Tips</h3>` → `<h3>Depth Soundings Ashore</h3>` + added id
   - Renamed 8 `<h2>Practical Tips/Realities</h2>` → `<h2>Depth Soundings Ashore</h2>` + added id
   - Added `id="depth_soundings"` to 68 sections with existing correct heading
   - 91 pages genuinely lack any depth soundings content

3. **Excursions (47 fixed, 78 remaining):**
   - Renamed 84 `<h3>Top Experiences</h3>` → `<h3>Excursions &amp; Activities</h3>` + added id
   - Added `id="excursions"` to 17 port-specific activity sections heuristically
   - 78 pages have no recognizable excursions/activity section

4. **Cruise port (45 fixed, 61 remaining):**
   - Renamed 90 `<h3>Port Essentials</h3>` → `<h3>The Cruise Port</h3>` + added id
   - Added `id="cruise_port"` to 2 sections with existing correct heading
   - 61 pages lack cruise port content

5. **Getting around (added IDs to 157, 46 still absent):**
   - Added `id="getting_around"` to 155 existing "Getting Around" sections
   - 46 pages have no getting around section

6. **Gallery & FAQ IDs added**: 71 gallery + 7 FAQ sections tagged

### What remains (164 pages):
The remaining missing sections represent **genuine content gaps** — the HTML sections don't exist on these pages at all. Fixing requires creating new port-specific content, not structural changes.

| Missing Section | Pages | Fix Required |
|-----------------|-------|-------------|
| depth_soundings | 91 | Write practical tips per port |
| excursions | 78 | Write activity recommendations per port |
| hero | 64 | Source hero images per port |
| cruise_port | 61 | Write cruise terminal info per port |
| getting_around | 46 | Write transport info per port |
| gallery | 4 | Source gallery images |
| logbook | 3 | Write logbook narratives |
| faq | 3 | Write FAQ content |

### Note on pass rate:
The pass rate remains 71/380 because the v2 validator checks ~60 different blocking error categories. Pages that had `missing_required_sections` also have many other blocking errors (word count minimums, logbook narrative quality, content purity, etc.). The structural fixes resolved one category of errors but cannot make these pages pass alone.

---

## Validation Results Summary

| Score Range | Count | % of Failures |
|-------------|-------|---------------|
| 90-100      | 38    | 12.3%         |
| 80-89       | 16    | 5.2%          |
| 70-79       | 1     | 0.3%          |
| 50-69       | 0     | 0%            |
| 0-49        | 254   | 82.2%         |
| **Total Failing** | **309** | |
| **Total Passing** | **71**  | |

---

## Blocking Errors by Frequency

| Error Code | Count | Description |
|------------|-------|-------------|
| `section_order/missing_required_sections` | 248 | Missing hero, excursions, depth_soundings, etc. |
| `hero/hero_missing_image_credit` | 142 | Hero image has no credit/attribution link |
| `hero/hero_missing` | 90 | No `class="port-hero"` section at all |
| `icp_lite/datemodified_mismatch` | 24 | JSON-LD dateModified doesn't match last-reviewed |
| `icp_lite/missing_faqpage` | 20 | Missing FAQPage JSON-LD schema |
| `icp_lite/missing_webpage` | 19 | Missing WebPage JSON-LD schema |
| `icp_lite/missing_mainentity` | 19 | Missing mainEntity in JSON-LD |
| `icp_lite/description_mismatch` | 19 | Meta description doesn't match JSON-LD |
| `hero/hero_missing_image` | 10 | Hero section exists but has no `<img>` |
| `hero/hero_missing_overlay` | 7 | Hero section missing text overlay |
| `icp_lite/ai_summary_length` | 4 | ai-summary too short (<150 chars) |
| `site_integration/not_in_ports_html` | 3 | Not listed in ports.html hub page |
| `icp_lite/missing_breadcrumbs` | 2 | Missing BreadcrumbList JSON-LD |
| `icp_lite/protocol_version` | 1 | Wrong ICP-Lite version string |
| `hero/hero_not_webp` | 1 | Hero image not in WebP format |
| `port_images/missing_port_img_directory` | 1 | No `/ports/img/{slug}/` directory |

## Warnings by Frequency

| Warning Code | Count | Description |
|--------------|-------|-------------|
| `images/short_alt` | 87 | Alt text too short on images |
| `port_images/potential_duplicate_images` | 27 | Images with identical file sizes |
| `icp_lite/ai_summary_length` | 16 | ai-summary short (134-149 chars) |
| `author_disclaimer/experience_level_missing` | 3 | No "soundings in another's wake" disclaimer |
| `content/last_reviewed_stamp_missing` | 1 | Missing last-reviewed date in content |
| `word_counts/total_maximum` | 1 | Exceeds 6,000 word maximum |

---

## Three Tiers of Port Pages

### Tier A: "One Fix Away" — Score 90+ (38 pages)
These pages score 90/100 and have a single blocking error: **section order** (usually `map` appearing before `excursions`, or `food` appearing out of expected sequence).

**Pages:** airlie-beach, akaroa, alexandria, amalfi, antigua, apia, bali, belize, bergen, bermuda, boston, cairns, cannes, charleston, cozumel, curacao, glacier-bay, grand-cayman, huatulco, hubbard-glacier, icy-strait-point, juneau, key-west, manzanillo, martinique, mazatlan, naples, nassau, puerto-vallarta, santorini, seward, sitka, skagway, st-lucia, st-maarten, tampa, venice, zihuatanejo

**Fix:** Reorder `<section>` elements within the `<article>` to match the canonical order defined in PORT_PAGE_STANDARD_v3.010.md. The expected section order is:
1. hero → 2. weather-guide → 3. logbook → 4. cruise-port → 5. getting-around → 6. from-the-pier → 7. map → 8. beaches → 9. excursions → 10. food → 11. notices → 12. depth-soundings → 13. practical → 14. faq → 15. gallery → 16. credits

**Effort:** Low — mechanical section reordering, no content changes needed.
**Estimated:** ~38 files, scriptable.

---

### Tier B: "Near Miss" — Score 80-89 (16 pages)
These pages have 2-3 issues, typically section order PLUS one of:
- Missing hero image credit link
- ICP-Lite dateModified mismatch
- Missing port image directory
- Author disclaimer missing

**Pages:** cephalonia, brunei, buenos-aires, darwin, dubai, dublin, royal-beach-club-antigua, acapulco, agadir, akureyri, alesund, amber-cove, christchurch, ft-lauderdale, galveston, seattle

**Fixes needed:**
- Section reordering (same as Tier A)
- Add `<a>` credit link to hero `<figcaption>` where missing
- Fix `dateModified` in JSON-LD to match `last-reviewed` meta tag
- Add author experience disclaimer where missing

**Effort:** Low-Medium — mostly mechanical, some require reading each page to add the correct credit link.

---

### Tier C: "Structural Rebuild" — Score 0-49 (254 pages)
These pages are missing fundamental structural elements. The most common pattern (vast majority):

**Pattern C1: Missing hero + missing required sections (232 pages)**
Page has content but was built to an older template that doesn't match v3.010. Typically missing:
- `class="port-hero"` wrapper (90 pages have no hero at all; 142 have hero but no credit link)
- Required sections like `excursions`, `depth_soundings`, `hero`
- Sections exist but in wrong order
- Some also missing JSON-LD schemas (WebPage, FAQPage, mainEntity)

**Pattern C2: ICP-Lite schema deficiencies (19 pages)**
Pages missing multiple JSON-LD schemas (WebPage, FAQPage, BreadcrumbList, mainEntity) and having meta description mismatches. These were likely built before ICP-Lite v1.4 was standardized.
Pages: beijing, buzios, cape-cod, cape-horn, denali, drake-passage, fairbanks, glasgow, ilhabela, inside-passage, isafjordur, jakarta, kyoto, marthas-vineyard, port-arthur, port-said, punta-del-este, rotorua, torshavn

**Pattern C3: Special pages (4 pages)**
Pages that may not be standard port pages:
- `tender-ports.html` — Index/hub page for tender ports, not a single port
- `falmouth-jamaica.html` — May be a duplicate of `falmouth.html`
- `ho-chi-minh-city.html` — May be a duplicate of `ho-chi-minh.html`
- `port-moresby.html` — Scored 0 with no extractable errors (may be empty or malformed)

**Effort:** High — each page needs structural work, not just reordering.

---

## Remediation Strategy

### Phase 1: Quick Wins — Tier A Section Reordering (38 pages)
**Goal:** Move from 71 → 109 passing (18.7% → 28.7%)
**Method:** Script that reads each page, identifies section elements by ID, and reorders them to canonical sequence.
**Risk:** Low — only moving existing `<section>` elements, no content changes.
**Scriptable:** Yes — can write a Node.js script to parse HTML, extract sections, reorder, and rewrite.

### Phase 2: Near Misses — Tier B Fixes (16 pages)
**Goal:** Move from 109 → 125 passing (28.7% → 32.9%)
**Method:** Per-page fixes:
- Section reordering (same script as Phase 1)
- Hero credit links: read each page, identify hero image source, add `<a>` credit
- JSON-LD dateModified sync: script to copy `last-reviewed` value into JSON-LD
- Author disclaimers: add standard disclaimer text

### Phase 3: Template Compliance — Tier C Hero + Section Remediation (254 pages)
**Goal:** Move toward 300+ passing (79%+)
**Method:** This is the bulk of the work. Two sub-approaches:

**Phase 3A: Hero section standardization**
- For 90 pages missing hero entirely: add `<section class="port-hero">` with image, overlay, and credit
- For 142 pages missing hero credit: add `<a>` credit link to existing hero
- For 10 pages with hero but no image: add image reference
- For 7 pages missing overlay: add h1 overlay structure

**Phase 3B: Missing section injection**
- Add stub `<section id="excursions">`, `<section id="depth-soundings">`, etc. where missing
- These need actual content — cannot be empty stubs (validator checks word counts)
- This is the hardest part: 248 pages need content additions

**Phase 3C: ICP-Lite v1.4 schema compliance (19 pages)**
- Add missing JSON-LD blocks (WebPage, FAQPage, mainEntity)
- Sync dateModified with last-reviewed
- Fix meta description to match JSON-LD description

### Phase 4: Special Cases (4 pages)
- Decide: should `tender-ports.html` be excluded from port validation?
- Resolve duplicates: `falmouth-jamaica.html` vs `falmouth.html`, `ho-chi-minh-city.html` vs `ho-chi-minh.html`
- Investigate `port-moresby.html` for structural issues

---

## Recommended Execution Order

1. **Phase 1 first** — highest ROI, scriptable, zero risk
2. **Phase 3C** — ICP-Lite schema fixes are scriptable and affect only 19 pages
3. **Phase 2** — 16 pages with mixed but manageable issues
4. **Phase 3A** — Hero remediation across 142+90 pages (scriptable for credit links; hero additions need images)
5. **Phase 3B** — Content-dependent section additions (requires human decisions on content)
6. **Phase 4** — Special cases (requires user decisions)

---

## Metrics to Track

| Metric | Baseline | After Ph1 | After Ph2 | After Ph3 | Target |
|--------|----------|-----------|-----------|-----------|--------|
| Pages passing v2 | 71 | ~109 | ~125 | ~300+ | 380 |
| Pass rate | 18.7% | 28.7% | 32.9% | 79%+ | 100% |
| Avg score (failing) | ~12 | ~15 | ~18 | ~60+ | 100 |

---

## Files Modified by This Plan

- 380 port HTML files (various phases)
- `ports.html` (3 pages need to be added to hub)
- JSON-LD schemas within port pages
- No new files created
- No JavaScript/CSS changes needed

---

## Open Questions for User

1. Should `tender-ports.html` be excluded from port-page validation (it's a hub page, not a port page)?
2. For the 254 Tier C pages missing required sections — should we add minimal stub content, or flag them for human content writing?
3. For hero images missing credits — should we attempt WikiMedia attribution lookup, or flag for manual review?
4. Are `falmouth-jamaica.html`/`ho-chi-minh-city.html` intentional duplicates or should they redirect?
