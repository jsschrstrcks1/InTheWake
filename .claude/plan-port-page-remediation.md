# Port Page Remediation Plan

**Created:** 2026-02-12
**Validator:** `admin/validate-port-page-v2.js` (ITC v1.1 + LOGBOOK_ENTRY_STANDARDS v2.300)
**Baseline:** 71/380 pass (18.7%), 309/380 fail (81.3%)

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
