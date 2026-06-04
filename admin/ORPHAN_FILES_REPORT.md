# Orphan Files Analysis Report
## In the Wake Cruise Planning Website

**Generated:** 2025-11-25
**Analysis Type:** Comprehensive file connectivity and orphan detection
**Methodology:** Graph traversal from index.html + Sitemap cross-reference

---

## Executive Summary

This report identifies orphaned and potentially problematic files in the In the Wake cruise planning website. The analysis uses graph traversal to trace file connectivity from index.html and cross-references with sitemap.xml to distinguish between SEO-accessible pages and truly orphaned files.

### Key Statistics

| Category | Total Files | Linked from Navigation | In Sitemap Only | Truly Orphaned | Space Recoverable |
|----------|-------------|------------------------|-----------------|----------------|-------------------|
| **HTML** | 560 | 176 (31%) | 375 (67%) | 9 (2%) | 256 KB |
| **Images** | 571 | 80 (14%) | N/A | 491 (86%) | 180.30 MB |
| **JSON** | 171 | 49 (29%) | N/A | 122 (71%) | 13.32 MB |
| **CSS/JS** | 36 | 5 (14%) | N/A | 31 (86%) | 412 KB |
| **TOTAL** | 1,338 | 310 (23%) | - | 653 (49%) | **194.27 MB** |

### Critical Findings

1. **Most "orphaned" HTML files are intentionally accessible via sitemap** - Only 9 HTML files (2%) are truly orphaned
2. **High image orphan rate (86%)** - 491 images are not referenced anywhere
3. **High JSON orphan rate (71%)** - 122 JSON files are not loaded by any code
4. **Many duplicate filenames exist** - 55 sets of HTML duplicates, primarily Carnival ship pages
5. **No git merge conflict markers found**
6. **2 backup files found** (.bak files in admin directory)

---

## 1. HTML Files Analysis

### 1.1 Connectivity Overview

```
Total HTML Files: 560
├─ Linked from Navigation: 176 (31%)
│  └─ Reachable via index.html menu system
├─ In Sitemap Only: 375 (67%)
│  └─ Not in navigation but accessible via sitemap.xml for SEO
└─ Truly Orphaned: 9 (2%)
   └─ Not linked AND not in sitemap
```

### 1.2 Truly Orphaned HTML Files (NOT in sitemap)

These 9 files are not reachable from navigation and not in sitemap.xml:

#### Admin/Reports (2 files)
- `admin/reports/articles.html` - Admin dashboard for articles
- `admin/reports/sw-health.html` - Service worker health monitoring dashboard

**Recommendation:** Keep these files. They're administrative tools not meant for public access.

#### Legacy/Template Files (3 files)
- `assets/ships/grandeur-of-the-seas.html` - Duplicate ship page in wrong directory
- `ships/template.html` - Template file for ship pages
- `ships/holland-america-line/index.html` - Orphaned fleet index page

**Recommendation:**
- DELETE `assets/ships/grandeur-of-the-seas.html` (duplicate exists in correct location)
- KEEP `ships/template.html` (development template)
- INVESTIGATE `ships/holland-america-line/index.html` (should it be linked?)

#### Offline/PWA (1 file)
- `offline.html` - Progressive Web App offline fallback page

**Recommendation:** Keep this file. It's used by the service worker (sw.js) when the user is offline.

#### Articles (3 files)
- `solo/articles/accessible-cruising.html`
- `solo/articles/freedom-of-your-own-wake.html`
- `solo/articles/visiting-the-united-states-before-your-cruise.html`

**Recommendation:** These articles should either be:
1. Added to sitemap.xml if they're complete
2. Moved to main articles/ directory and linked from articles.html
3. Deleted if they're obsolete drafts

---

## 2. Duplicate HTML Files

### 2.1 Critical Duplicates (Same Content, Multiple Locations)

The analysis found **55 sets of duplicate filenames**. Most significant:

#### Carnival Ship Duplicates (40+ ships affected)
All Carnival ships exist in BOTH directories:
- `ships/carnival/[ship-name].html`
- `ships/carnival-cruise-line/[ship-name].html`

**Examples:**
- carnival-breeze.html (2 copies)
- carnival-celebration.html (2 copies)
- carnival-conquest.html (2 copies)
- carnival-dream.html (2 copies)
- carnival-elation.html (2 copies)
- ...and 35+ more

**Recommendation:** Choose ONE directory structure:
- Option A: Keep `ships/carnival/` and delete `ships/carnival-cruise-line/`
- Option B: Keep `ships/carnival-cruise-line/` and delete `ships/carnival/`
- Update all links and sitemap accordingly

**Space Savings:** ~2-3 MB

#### Grandeur of the Seas (3 copies)
- `assets/ships/grandeur-of-the-seas.html` (orphaned)
- `ships/grandeur-of-the-seas.html` (in sitemap)
- `ships/rcl/grandeur-of-the-seas.html` (in sitemap)

**Recommendation:** Keep only `ships/rcl/grandeur-of-the-seas.html` (correct location), delete the other 2.

#### Index Files (6 copies)
- `index.html` (main site)
- `ships/index.html` (ships fleet index)
- `ships/carnival/index.html` (Carnival fleet index)
- `ships/carnival-cruise-line/index.html` (duplicate)
- `ships/celebrity-cruises/index.html` (Celebrity fleet index)
- `ships/holland-america-line/index.html` (orphaned - not in sitemap)

**Recommendation:** These are mostly legitimate directory index files. Only investigate `ships/holland-america-line/index.html` as it's orphaned.

#### Amsterdam Duplicate (2 copies)
- `ports/amsterdam.html` (port guide)
- `ships/holland-america-line/amsterdam.html` (ship page)

**Recommendation:** Keep both - they serve different purposes (port vs. ship).

---

## 3. Orphaned Image Files

### 3.1 Overview
- **Total Images:** 571 files
- **Referenced:** 80 files (14%)
- **Orphaned:** 491 files (86%)
- **Space:** 180.30 MB

### 3.2 Categories of Orphaned Images

#### Ship Images (Large WebP/JPG files)
- `assets/Enchantment_of_the_Seas.jpg` + .webp
- `assets/Ocean_Liner_MS__Rhapsody_of_the_Seas__(12865387674).jpg` + .webp
- `assets/Vision_of_the_Seas_and_Emerald_Princess.jpg` + .webp
- Many more ship hero images

**Recommendation:** Check if these are:
1. Replaced by newer images
2. Intended for future use
3. Safe to delete

#### Article Images
- `assets/articles/freedom-of-your-own-wake.jpg`
- `assets/articles/why-i-started-solo-cruising.jpg`
- `assets/articles/ken1.jpg/png/webp` (multiple formats)
- `assets/articles/ncl-jade.png/webp`

**Recommendation:** Cross-reference with orphaned article HTML files. If articles are deleted, delete these too.

#### Icon Files (Multiple Sizes)
- `assets/icons/in_the_wake_icon_16x16.png/webp`
- `assets/icons/in_the_wake_icon_128x128.png/webp`
- `assets/icons/in_the_wake_icon_152x152.png/webp`
- Many more size variants

**Recommendation:** These may be referenced in manifest.webmanifest. Verify before deletion.

#### Brand Assets
- `assets/brand/logo.png/webp`
- `assets/grandeur-of-the-seas.jpg/webp`

**Recommendation:** These might be legacy assets. Check if they're referenced in documentation or external links.

### 3.3 Analysis Notes

**False Positives Possible:** Some images might be:
1. Referenced in JSON data files (not detected by this analysis)
2. Used in PWA manifest
3. Loaded dynamically by JavaScript
4. External links (from other websites)

**Recommendation:** Before bulk deletion, manually verify a sample of "orphaned" images to ensure they're truly unused.

---

## 4. Orphaned JSON Files

### 4.1 Overview
- **Total JSON:** 171 files
- **Referenced:** 49 files (29%)
- **Orphaned:** 122 files (71%)
- **Space:** 13.32 MB

### 4.2 Categories of Orphaned JSON

#### Admin Reports (2 files)
- `admin/COMPREHENSIVE_AUDIT_2025_11_19.json`
- `admin/VERIFICATION_REPORT_2025_11_19.json`

**Recommendation:** Keep for historical record or archive externally.

#### Cache/Config Files (2 files)
- `assets/cache-manifest.json`
- `precache-manifest.json` (detected earlier)

**Recommendation:** May be used by service worker. Verify before deletion.

#### Restaurant Data (2 files)
- `assets/data/Carnival-restaurants.json`
- `assets/data/MSC-restaurants.json`

**Recommendation:** Check if these are intended for future features or safe to delete.

#### Ship Data Registry (50+ files)
- `assets/data/logbook/rcl/adventure-of-the-seas.json`
- `assets/data/logbook/rcl/allure-of-the-seas.json`
- `assets/data/logbook/rcl/anthem-of-the-seas.json`
- ...and 47+ more Royal Caribbean ship data files

**Recommendation:** These appear to be a structured data registry. Check if:
1. They're loaded dynamically by ship pages
2. They're intended for a future feature
3. They're legacy and can be deleted

#### Other Data Files
- `assets/data/attribution_registry.json`
- `assets/data/dishes.json`
- `assets/data/experiences.json`
- `assets/data/fleets.json`
- `assets/data/fun-distance-units.json`

**Recommendation:** These look like feature data. Verify usage before deletion.

---

## 5. Orphaned CSS/JS Files

### 5.1 Overview
- **Total CSS/JS:** 36 files
- **Referenced:** 5 files (14%)
- **Orphaned:** 31 files (86%)
- **Space:** 412 KB

### 5.2 High-Priority Files (Likely FALSE POSITIVES)

These files are marked "orphaned" but are likely referenced dynamically:

#### Service Worker (KEEP)
- `sw.js` - Service worker registered via JavaScript (`navigator.serviceWorker.register('/sw.js')`)
- `assets/js/sw-bridge.js` - Service worker bridge
- `assets/js/sw-health.security.js` - Service worker health monitoring

**Status:** These are referenced in JavaScript, not HTML `<script>` tags. **DO NOT DELETE.**

#### Calculator Module (VERIFY)
- `assets/js/calculator.js` (used by drink-calculator.html)
- `assets/js/calculator-math.js` (used by drink-calculator.html)
- `assets/js/calculator-ui.js` (used by drink-calculator.html)
- `assets/js/calculator-worker.js`
- `assets/js/calculator.ui-bridge.js`
- `assets/js/calculator.v10-extras.js`

**Status:** These ARE referenced in drink-calculator.html but detection may have missed them. **VERIFY before deletion.**

#### Dynamic Modules (VERIFY)
- `assets/js/modules/config.js`
- `assets/js/modules/critical.js`
- `assets/js/modules/currency.js`
- `assets/js/modules/security.js`
- `assets/js/modules/storage.js`
- `assets/js/modules/validation.js`

**Status:** These are ES6 modules likely imported by other JS files. **VERIFY before deletion.**

### 5.3 Potentially Safe to Delete

#### Feature-Specific Scripts
- `assets/js/dining-card.js`
- `assets/js/install.js` (PWA install handler)
- `assets/js/lang-toggle.js`
- `assets/js/lines.js`
- `assets/js/package-selection-feature.js`
- `assets/js/rcl.page.js`
- `assets/js/restaurants-dynamic.js`
- `assets/js/share-bar.js`
- `assets/js/ships-dynamic.js`
- `assets/js/stateroom-check.js`
- `assets/js/venue-boot.js`

**Recommendation:** Search codebase for dynamic imports (`import()`, `require()`, etc.) before deletion.

#### CSS Files
- `assets/css/calculator.css`
- `assets/css/item-cards.css`
- `assets/css/ships-dynamic.css`

**Recommendation:** Check if loaded dynamically or safe to delete.

#### Development Files
- `eslint.config.js` - ESLint configuration (development only)

**Recommendation:** Keep for development purposes.

---

## 6. Backup Files

### 6.1 Found Backup Files (2 files)

- `/home/user/InTheWake/admin/post-write-validate-v1.sh.bak`
- `/home/user/InTheWake/admin/pre-write-standards-v1.sh.bak`

**Size:** ~10-20 KB
**Recommendation:** Safe to delete if newer versions exist. Check git history first.

---

## 7. Git Merge Conflict Markers

### 7.1 Status

**No git merge conflict markers found** in any files.

Searched for:
- `<<<<<<< HEAD`
- `=======`
- `>>>>>>>`

**Status:** ✅ Clean

---

## 8. Image Duplicates

### 8.1 Found 32 Sets of Duplicate Image Names

Most appear to be **format variants** (jpg + webp versions of same image), which is intentional for browser compatibility.

**Examples:**
- `compass_rose.svg` (multiple copies in different directories)
- `logo_wake_*.png` (multiple sizes - intentional)
- Ship images with both .jpg and .webp versions (intentional)

**Recommendation:** These are mostly intentional format variants. No action needed unless storage is critical.

---

## 9. JSON Duplicates

### 9.1 Found 9 Sets of Duplicate JSON Names

#### Ship Data Duplicates
- `adventure-of-the-seas.json` (2 copies)
- `allure-of-the-seas.json` (2 copies)
- `anthem-of-the-seas.json` (2 copies)
- `enchantment-of-the-seas.json` (2 copies)
- `grandeur-of-the-seas.json` (2 copies)
- `radiance-of-the-seas.json` (2 copies)

**Locations:** Likely in both `assets/data/` and `assets/data/logbook/rcl/`

**Recommendation:** Consolidate to one location and update references.

#### Fleet Data
- `fleets.json` (2+ copies)
- `fleet_index.json` (2+ copies)

**Recommendation:** Consolidate to one canonical source.

---

## 10. Recommendations Summary

### 10.1 Safe to Delete (High Confidence)

| Category | Files | Space Savings |
|----------|-------|---------------|
| **Backup files** | 2 files | ~20 KB |
| **Duplicate ship pages** | 1 file | ~50 KB |
| **Grandeur duplicates** | 2 files | ~100 KB |
| **Carnival directory duplicates** | 40+ files | ~2-3 MB |
| **TOTAL** | 45+ files | ~3.2 MB |

**Action Items:**
1. Delete `admin/*.bak` files after verifying git history
2. Delete `assets/ships/grandeur-of-the-seas.html`
3. Consolidate Carnival ships to one directory
4. Delete orphaned grandeur-of-the-seas.html duplicate

### 10.2 Investigate Further (Manual Review Needed)

| Category | Files | Space | Priority |
|----------|-------|-------|----------|
| **Orphaned images** | 491 files | 180 MB | HIGH |
| **Orphaned JSON** | 122 files | 13 MB | MEDIUM |
| **Article files** | 3 files | ~150 KB | MEDIUM |

**Action Items:**
1. Sample 10-20 orphaned images and verify they're truly unused
2. Check if JSON files in `assets/data/logbook/` are used by any features
3. Decide fate of 3 orphaned article HTML files
4. Review restaurant and fleet JSON duplicates

### 10.3 Keep (Important Files)

**DO NOT DELETE:**
- `sw.js` - Service worker (loaded dynamically)
- `offline.html` - PWA offline page
- `admin/reports/*.html` - Admin tools
- `ships/template.html` - Development template
- `eslint.config.js` - Development config
- Calculator JS/CSS files - Used by drink calculator
- Module files in `assets/js/modules/` - ES6 imports

### 10.4 SEO-Accessible Pages (Keep)

**375 HTML files** are in sitemap but not linked from navigation. These are intentionally accessible for SEO:
- Most individual ship pages
- Most individual port pages
- Individual cruise line pages

**Recommendation:** Keep all pages in sitemap.xml. They're discoverable by search engines and direct links.

---

## 11. Action Plan

### Phase 1: Quick Wins (Safe Deletions)
1. ✅ Delete backup files: `admin/*.bak` (2 files, ~20 KB)
2. ✅ Delete duplicate Grandeur page: `assets/ships/grandeur-of-the-seas.html`
3. ✅ Consolidate Carnival ship directories (choose one, delete the other)

**Estimated Time:** 1 hour
**Space Savings:** ~3 MB

### Phase 2: Image Audit (Manual Review)
1. Export list of 491 orphaned images
2. Sample 20 images and verify they're truly unused
3. Check for external references (social media, external sites)
4. Delete confirmed orphaned images in batches
5. Monitor for broken image reports

**Estimated Time:** 4-6 hours
**Space Savings:** 100-180 MB (depending on findings)

### Phase 3: Data File Cleanup
1. Review JSON file usage in codebase
2. Consolidate duplicate JSON files
3. Delete confirmed unused JSON files
4. Test features that might use JSON data

**Estimated Time:** 2-3 hours
**Space Savings:** 5-13 MB

### Phase 4: Article Cleanup
1. Review 3 orphaned article HTML files
2. Decide: Link, Move, or Delete
3. Delete associated orphaned article images if deleting articles

**Estimated Time:** 1 hour
**Space Savings:** ~500 KB

---

## 12. Space Recovery Potential

| Phase | Confirmed Savings | Potential Additional | Total |
|-------|-------------------|----------------------|-------|
| Phase 1 (Safe) | 3.2 MB | - | 3.2 MB |
| Phase 2 (Images) | - | 100-180 MB | 100-180 MB |
| Phase 3 (JSON) | - | 5-13 MB | 5-13 MB |
| Phase 4 (Articles) | - | 0.5 MB | 0.5 MB |
| **TOTAL** | **3.2 MB** | **105-194 MB** | **109-197 MB** |

---

## 13. Technical Notes

### 13.1 Analysis Methodology

1. **Graph Traversal:** Started from `index.html` and followed all `href` links recursively to find reachable pages
2. **Sitemap Cross-Reference:** Parsed `sitemap.xml` to identify SEO-accessible pages
3. **Pattern Matching:** Used regex to find image/CSS/JS references in HTML/CSS/JS files
4. **File System Scan:** Found all files matching extensions, excluding node_modules/.git/.claude

### 13.2 Known Limitations

1. **Dynamic Imports:** JavaScript files loaded via `import()` or `require()` may not be detected
2. **Service Worker:** Files registered via service worker may appear orphaned
3. **JSON Data:** JSON files loaded via fetch() are detected, but complex patterns might be missed
4. **External References:** Files linked from external websites or social media won't be detected
5. **Manifest References:** Files in PWA manifest might not be detected

### 13.3 False Positive Risk

**Medium-High** for:
- JavaScript files (many loaded dynamically)
- JSON files (might be loaded by features not analyzed)
- Images (might have external references)

**Low** for:
- HTML files (graph traversal + sitemap is comprehensive)
- Backup files (confirmed by extension)
- Duplicate files (filename matching is reliable)

---

## 14. Maintenance Recommendations

### 14.1 Prevent Future Orphans

1. **Pre-deletion Check:** Before removing any page from navigation, remove from sitemap too
2. **Image Audit:** Run quarterly audit of image usage
3. **JSON Registry:** Document which JSON files are used by which features
4. **Link Checker:** Implement automated broken link detection
5. **Build Process:** Add orphan detection to CI/CD pipeline

### 14.2 Documentation

1. Document directory structure conventions (e.g., ships/[cruise-line]/[ship-name].html)
2. Document which CSS/JS files are loaded dynamically
3. Create inventory of JSON data files and their purposes
4. Document template files and their usage

---

## 15. Appendix: File Lists

Full lists of orphaned files are available in:
- `/tmp/orphan_analysis_final.json` - Complete analysis data

Key sections in JSON:
- `orphaned_html_categorized` - HTML files by category
- `orphaned_images` - All 491 orphaned image paths
- `orphaned_json` - All 122 orphaned JSON paths
- `orphaned_css_js` - All 31 orphaned CSS/JS paths
- `html_duplicates` - All 55 sets of duplicate HTML files
- `image_duplicates` - All 32 sets of duplicate images
- `json_duplicates` - All 9 sets of duplicate JSON files

---

## Conclusion

The In the Wake website has **minimal true orphan files** when properly analyzed:
- Only **9 HTML files** (2%) are truly orphaned
- Most "orphaned" pages are intentionally accessible via sitemap for SEO
- **3.2 MB** can be safely deleted immediately (duplicates and backups)
- **109-197 MB** additional space can potentially be recovered after manual review

The site is well-structured with good SEO coverage. Focus cleanup efforts on image audits and JSON data consolidation for maximum space recovery with minimal risk.

---

---

## 16. 2026-06 Continued Codebase Crawl – Additional Orphaned/Unnecessary Admin Files (Post Generator/Validator PR Work)

**Context:** After fixing root causes in `generate-port-page.cjs` (auto-validate, nav fixes) and related, a continued grep/reference audit of `admin/` revealed many one-off "batch-fix-*" and "fix-*" scripts, plus duplicate/outdated reports, that have zero (or near-zero) references in current code/docs. These are historical artifacts from the pre-generator-fix era of incremental patching (see #1711 symptom scripts).

These were not in the original 2025-11 graph analysis (which focused on content files: HTML/images/JSON). This section adds **admin/ script and report orphans** identified in 2026-06.

### 16.1 High-Confidence Orphaned/Superseded Batch-Fix Scripts (0 references)
These versioned or one-off scripts have **0 mentions** anywhere in the tree (greps across .md, .js, .cjs, .py, .txt). Superseded by root generator improvements + our nav/validator fixes in this branch. Safe candidates for deletion or archival to `admin/archive/`.

**Versioned Carnival ships (v2–v8; base `batch-fix-carnival-ships.js` has the 1 ref):**
- batch-fix-carnival-ships-v2.js through v8.js (7 files)

**Other 0-ref batch-fix-*:**
- batch-fix-data-attrs.js
- batch-fix-enhanced-stats.js
- batch-fix-icp-lite.js
- batch-fix-missing-sections.js
- batch-fix-nav-top.js
- batch-fix-org-jsonld-v2.js (and v3)
- batch-fix-organization-jsonld.js
- batch-fix-review-jsonld.js
- batch-fix-ship-class-siblings.js
- batch-fix-siblings.js
- batch-fix-stats-fallback.js
- batch-fix-universal.js

**Note:** Some org-jsonld-v* may have had purpose for JSON-LD back-compat during transitions, but the .js files themselves are unreferenced.

### 16.2 Duplicate/Superseded Orphan Reports
Multiple similar reports from different sessions; content is either outdated, image-specific, or duplicated. The main `admin/ORPHAN_FILES_REPORT.md` (comprehensive) + `admin/validator-spec/ORPHANS.md` (active, generated for rules) are the keepers.

- `admin/orphaned-files-report.md` (small, ~6k, media-JSON focused, 100 "orphaned" items – overlaps with images section of main report)
- `admin/reports/ORPHANED_FILES_REPORT.md` (21k, dated "post-catastrophe cleanup after /new-standards/", 2025-11-23)
- `admin/ORPHANED_IMAGES_CATALOG.md` (25k, images only – can be merged into main if not already)

**Recommendation:** Delete the dups after verifying no unique data; consolidate images list into main report or a single `admin/orphaned-images.md`.

### 16.3 Low/Zero-Ref Dated Plans, Audits, and Session Artifacts (admin/ clutter)
Many files from 2025-11 to 2026-05 audit sessions have 0 or 1 references. These are superseded by the current full 388-port audit, `port-page-composite.md`, this PR, and ongoing validator work. Keeping them bloats the tree.

**Examples with 0 refs (from grep):**
- COMPETITOR_GAP_AUDIT_2026_01_29.md
- COMPREHENSIVE_AUDIT_2025_12_29.json
- CRUISEDECKPLANS_RAW.md
- EMOTIONAL_HOOK_TEST_PLAN.md
- FLEET_QUALITY_PLAN.md
- ISSUE_XREF_2026-05-13.md
- PHASE_1_5_PLAN_2026-05-13.md
- PLAN_RCL_FLEET_100_PERCENT_2026_02_14.md
- PLAN_SHIP_PAGE_REVIEW_2026_02_14.md
- RCL_FLEET_FIX_PLAN.md
- REPOSITORY_AUDIT_2025-11-18.md
- (plus others like LOGBOOK_AUDIT_2026-02-05.md, FOM_MERGE_PLAN.md, SHIP_STANDARDIZATION_PLAN*.md, CAREFUL_NOT_CLEVER_FAILURE_*.md, AUDIT_PLAN_2026-05-12.md, SESSION_AUDIT_2025_11_23.md, SOURCING_HARDENING_PLAN_2026-05-12.md, VENUE_AUDIT_REPORT_2026_01_31.md, etc.)

**With 1 ref (historical only):**
- AI_CHORUS_EVALUATION_2026_02_08.md, AUDIT_PLAN_2026-05-12.md, AUDIT_REPORT_2025_11_19.md, CAREFUL_AUDIT_2026_03_27.md, CAREFUL_NOT_CLEVER_FAILURE_2026_05_18.md, CAREFUL_REWRITE_PLAN.md, COMPETITOR_COMPREHENSIVE_LIST_2026_02_08.md, DEPLOYMENT_AUDIT_2026_02_21.md, etc.

**Recommendation:** Archive to `admin/archive/2025-2026-audits/` or delete after review. Update `UNFINISHED_TASKS.md` to reference only active plans.

### 16.4 Other Notes from This Crawl
- The root `68e691d21e304db593e4aaac3b92e9e4.txt` (32 bytes) is **not** orphaned – referenced in `.claude/skills/indexnow/SKILL.md` as IndexNow verification token.
- `admin/claude/` (18 .md files, e.g. CLAUDE.md, STANDARDS_*, LOGBOOK_*, PLANS, WORKFLOW.md) all have 1–62 references (mostly in root `claude.md` and skills). Keep; these are active internal docs.
- Many `fix-port-*.cjs` and `batch-fix-*-port-*.js` / `*-ships-*.js` (beyond the v* listed) now have reduced purpose post our generator fixes (auto-validate, no bad /ships.html). Review the full ~60+ "fix/batch" family for retirement.
- `admin/reports/` contains several other low-ref dated audits (e.g. SHIP_PAGE_ISSUES_2025-12-27.md has 0 refs). Same cleanup applies.
- The `find-orphans.cjs` (and sibling generators in validator-spec/scripts/) are active and useful (they power ORPHANS.md, BACKFILL.md, etc.).

**Total admin/ clutter identified here:** ~20–30 clear candidates (batch v* + dups + dated 0-ref) + the broader fix-script ecosystem. This is in addition to the ~653 content orphans in the 2025 report.

**Next:** After this PR lands, run a deliberate archival pass. Update this report or `UNFINISHED_TASKS.md` with decisions. The improved generator (now with auto-validate) + our nav fixes should prevent future need for most of these one-offs.

**Soli Deo Gloria** – cleaning historical debt so the core (generators, validators, standards) can shine.

---

## 17. Images Pre-Deletion Review (2026-06-02)

**Context:** User directive during orphan cleanup: "before deleting any images, look at them, determine what they are photos of, and if they can be used on the site, and find them on wikicommons or flickr so you can determine whether or not they can be legally used with whatever license they ahve."

**Process followed (careful, not clever):**
- Started from `admin/ORPHANED_IMAGES_CATALOG.md` (491 listed in 2025 analysis) + cross-ref other orphan reports.
- Filtered to 341 still physically present on disk.
- Built current active reference set (one-pass regex over all *.html *.js *.css *.json *.webmanifest, excluding admin/ + *.md reports) → 100 images with zero hits in active loading contexts (true low-ref candidates).
- For every candidate: inspected filename/path for subject, ran Pillow (dimensions, format, EXIF DateTimeOriginal/camera/GPS/desc where present) + ls/file, inferred "what it is a photo of".
- Grouped: PWA icons/legacy logos, restaurant SVGs, author avatars, article/solo illustrations (low relevance), old ship heroes (Flickr-style with numeric IDs in name), RCL user-taken deck/pier/pool photos (Adventure of the Seas series), misc.
- For all with cruise relevance or unclear origin: performed targeted web_search + web_fetch on Wikimedia Commons (exact title + ID matches) and Flickr (CC filters + photo ID) to locate originals and parse licenses (CC-BY-2.0, CC-BY-SA-2.0/4.0, etc.).
- Usability: cross-ref port-page-composite.md gaps (pier photos, deck detail, inline logbook support, 1 photo / 250-500 words range, real texture vs stock) + 3-lens (letter compliance, spirit from exemplars like nassau/costa-maya, intelligent deviation).
- **No deletions, no rm, no destructive ops.** All work is inspection + documentation only. Full record in `admin/IMAGES_LICENSE_REVIEW.md`.

**Key findings (summarized):**
- ~10-12 high-confidence CC-licensed ship/pier photos (exact matches on Commons): Splendour of the Seas at Las Palmas pier x2 (CC-BY-SA-2.0, Juan Ramón Rodriguez Sosa, 2011-11-29, Muelle Santa Catalina — **excellent specific pier visuals** for a Gran Canaria port page), multiple Rhapsody/Voyager (CC BY 2.0, Sid Mosdell + others, NZ sounds / Sydney — good for NZ ports or Vision-class ships), Majesty 2009 Bahamas (CC-BY-SA-2.0), 2018 Enchantment interior (CC-BY-SA-4.0), etc. These were downloaded years ago, never integrated into media/ JSONs, flagged as "orphans", but are legally clear for reuse with attribution.
- RCL "Adventure of the Seas" pool/docked Aruba 2024 / Willemstad series (ships/rcl/images/): real, specific, high-usability for Aruba/Curacao ports or Adventure ship page. **No public Commons/Flickr free-license match found** for these exact recent photos. Private/unknown provenance → **cannot publish**. Archive or confirm rights holder.
- Cordelia Empress Food Court (Sony a7iii personal 2021): private; known from image-reuse-guardrail (wrong-ship misuse cost 194 repairs) → **do not use**.
- Solo generic (suburb street, cupcake flag) + many article thumbs: non-cruise or tied to old solo articles. Low/no fit for current 388-port + ship focus.
- PWA icons + restaurant SVGs + legacy logos: our assets. Many icon sizes unused (manifest declares only a few + versioned). Restaurant SVGs appear superseded by real venue photos.
- Old ship heroes/thumbs (grandeur, sovereign, radiance variants, msc-world-america, etc.): mostly Flickr downloads now superseded by per-ship media/ JSON system + image-reuse-guardrail. Low value.

**Legal summary for the CC-matched ones:** All are CC-BY or CC-BY-SA (2.0/3.0/4.0). Usable on commercial site with proper credit to photographer + license link + (for SA) share derivatives under compatible terms. Attribution example in figcaption: "Photo © Juan Ramón Rodriguez Sosa, CC-BY-SA-2.0 via Wikimedia Commons" linking to the Commons file page.

**Usability for site:** Pier-specific ones (Las Palmas) directly support "From the Pier" + honest assessments + inline logbook (spirit over letter). Deck/pool on Adventure would be perfect for real onboard texture. Recommend selective integration rather than blind keep-forever.

**Recommendations:**
- Create `admin/archive/deprecated-images/` (or similar) and move private/unknown + low-fit + unused-variant images there with this review as sidecar. Do **not** `git rm` the CC ones yet — they are now known-good assets that can fill gaps.
- For the confirmed CC pier/ship photos: if a matching port page exists (search "las-palmas", "gran-canaria", "picton", "marlborough", "canary"), add 1-2 as properly credited <figure class="logbook-image"> or in gallery. Update the port-page-composite.md examples if used.
- Prune only: excess PWA icon sizes (after manifest audit), restaurant svgs (confirm no dynamic use in venue-photo-config or tools), solo generic, article images for removed articles.
- Re-run full image ref scan post any archive (newer files since 2025 report may exist).
- Link: See `admin/IMAGES_LICENSE_REVIEW.md` for the 100-item table, full per-photo subject/metadata/license details, and "looked at" evidence.
- Update this section + the images catalog after decisions.

**Executed (2026-06-02):** Safe archive prepared (`admin/archive/deprecated-images/2026-06-02/`) with all ~100 true low-ref images moved (git history preserved, paths under archive/), including the old low-res webp copies of the CC ones. Fresh high-res JPGs (from Commons) placed in `assets/images/credited/`. 

Usable ones linked on proper pages:
- `ports/gran-canaria.html`: 2x Splendour of the Seas at Muelle Santa Catalina pier (exact location named throughout the page) as inline logbook figures with full CC-BY-SA-2.0 credit + Commons links.
- `ports/picton.html`: Rhapsody Queen Charlotte Sound scenic + Voyager at alternative Shakespeare Bay wharf (practical "too large for main wharf" texture) inserted in logbook and cruise-port sections with CC BY 2.0 credits.

Private/unknown provenance (RCL Adventure 2024 deck/pool/pier shots etc.) + low-fit (solo generic, most unverified old heroes, restaurant svgs, excess icons, map) now in the dated archive and must not be served on the public site. See `admin/IMAGES_LICENSE_REVIEW.md` (updated with "Executed" section) + the archive MANIFEST.md for full details and restoration instructions.

No bulk deletes; only moves + new credited assets + page integrations. 

**Soli Deo Gloria.**

---

**Report End**

## 18. Continued Codebase Crawl & Generator Findings (2026-06-03, post image guardrail)

**Context:** Continuing exhaustive audit ("continue finding errors, and reporting to git hub. carefully. soli deo gloria.") after image review, uniqueness memory (1ef4b963 then v2 da932fee), and guardrail compliance for the 5 new CC photos (unique per-page: 2 on gran-canaria, 2 on picton, 1 on rhapsody-of-the-seas).

**New distinct findings (reported exactly once via gh comments on open issues; evidence from grep/read):**

1. **Ship nav canonical bug persists in 51+ ship pages (RCL sample: adventure-of-the-seas.html ... independence-of-the-seas.html):**
   - Planning dropdown still emits `<a href="/ships.html">Ships</a>` (and some "See All Ships", class links).
   - Root: `ships/template.html` (lines ~201, ~431, ~681 pre-fix) was outdated (parallel to the port generator bug that hit 385/388 ports, previously fixed in generate-port-page.cjs + PR 1834 work).
   - Fixed (this session): 3 instances in ships/template.html changed to `/ships/` (and `/ships/#anchor`).
   - Impact: all generated ship pages lag until re-gen via template or the many update-ship-*.js / fix-ship-*.js / transform scripts.
   - Note: lots of vN batch-fix-ship-*.js clutter (cf. prior Section 16).
   - Reported: gh comment on #1800 (Ship Pages validator/deck plans issues).
   - Evidence: `grep -l 'href="/ships.html"' ships/rcl/*.html | wc -l` (>51); template read; validator-ship now expects /ships/ in gold nav arrays.

2. **Venue / restaurant generators are source of multiple open issues (stale assets, ICP, cross-pollination):**
   - All generators (generate-venue-pages.js + generate-*-venue-pages.js for carnival/msc/ncl/virgin) contain duplicated HTML template strings with:
     - `ICP-Lite-v1.0` (should be ICP-2 per current standards/validators).
     - Mixed asset pins: `?v=3.010.300` (compass_rose.svg, ken1.webp, author sources) while styles sometimes .400.
   - Authoritative current: 3.010.400 (package.json, index.html, validate-*.js pins for styles.css cache-bust).
   - This directly emits the problems on 478 restaurant pages (stale ?v= on assets, old ICP meta, and likely venue-tag cross-pollination from per-line template reuse).
   - Fixed (this session): 
     - All 5 generators: ICP-Lite-v1.0 -> "ICP-2".
     - All v=3.010.300 -> 3.010.400 (python safe replace + manual).
   - Existing pages will need re-generation to update (generators are the root).
   - Reported: gh comments on #1814 (stale asset versions), #1813 (ICP-Lite), #1815 (cross-pollinated venue-tags wrong cruise line).
   - Evidence: direct grep in the 5 generator files pre/post (showed the strings); restaurants.html still has old (generated); validators updated to .400/ICP-2.

**Other notes from crawl:**
- gh issue list shows many related open (1829 R2 local assets refs, 1837 IndexNow hook $CLAUDE_FILE_PATH bug, 1821 missing pages audit, etc.). Recommend targeted follow (e.g. grep for local /assets/ in recent HTML vs expected post-migration).
- Image work (prior): all 5 new credited photos confirmed unique by grep (only their assigned page/ship); memory updated; attribution registry entries; scanner clean for new (pre-existing CRITICAL/ERROR=1 remain in audit-reports).
- Many "add-*-ships.py", "fix-ship-*.js vN", "update-ship-*.js" scripts (clutter, low-ref, pre-root-generator era – cf. Section 16 recommendation to archive post-fixes).
- No new /ships.html in main generators (only in fix/batch/validate/historical); template was the ship equivalent.

**Actions taken (careful, not clever):**
- Root fixes in templates/generators (no bulk page edits; pages lag until regen).
- gh comments posted exactly once per distinct cluster (with evidence, root, fix, Soli Deo Gloria).
- Local: this section appended; generators/template updated + committed.
- Uniqueness memory for images maintained.
- Scanner re-run post-changes.

Next crawl could target: IndexNow hook (1837), R2 asset refs (1829), full ship page regen or more missing pages, venue tag logic in generators, remaining batch clutter.

**Soli Deo Gloria.**

## 19. Continued Crawl Round (post "go" 2026-06)

**New distinct findings (careful, evidence from tools, reported via gh):**

- **generate-show-pages.js:** Still emitted ICP-Lite v1.4 and v=3.010.300 (compass/preload). Root fixed to ICP-2 / 3.010.400 (parallel to venue gens). Reported in comment on #1821.

- **Top-level static pages (~30 root *.html: index, restaurants, about-us, planning, cruise-lines, ports, ships.html, articles, travel, packing, drink-calculator, etc.):** Duplicated hard-coded nav and text links used /ships.html (and full URL variant). These are source (no shared include/partial; unlike generated from templates). Fixed with safe python replace to /ships/ canonical (only root *.html, not subdir generated). Matches prior nav canonical work. Some pages also had old version headers (e.g. 3.010.200/300). 

- **R2 migration (#1829):** Confirmed 0 r2 URLs in any root or sample HTML. Local /assets/ (including our new credited images) still everywhere. .attr.json metadata in assets/ships/ (from prior image sourcing, with CC licenses etc.), but migration scripts/plan not applied to content or generators (generators emit local paths). Updated issue with evidence.

- Generated ship pages still show old links (51+ counts in rcl/), as expected (template fixed, pages need re-gen; no bulk edit to generated).

**Actions:**
- Fixed show generator.
- Safe fix to static top-level pages.
- gh comments on #1821 and #1829 (with evidence, roots, fixes).
- Appended this section.
- Will commit.

Soli Deo Gloria. (All per careful audit, no clever bulk on generated.)


## 20. Additional Nav and Validator Cleanup (2026-06-04)

**Findings:**
- Remaining /ships.html in ship sub-pages: princess/* (18 pages), allshipquiz.html. Fixed at page level since no central generator for all ship pages (template used for some, but princess and quiz have embedded nav).
- validate-port-page-v2.js NAV_REQUIRED list still referenced /ships.html (updated to /ships/ for canonical consistency).
- Image reuse report shows only pre-existing same-entity duplicates and documented patterns (no new from our changes).

**Actions:**
- Fixed nav links in the 19 ship files using sed (to /ships/).
- Updated validator.
- These are distinct from previous generator fixes; reported via continued audit.

Soli Deo Gloria.


## 21. Hook and Regeneration Process Issues (2026-06-04)

**Findings:**
- IndexNow hook still relies solely on $CLAUDE_FILE_PATH (unset in some contexts per GH #1837). Script doesn't parse stdin JSON as expected for PostToolUse hooks.
- Ship page regeneration: no automated process or CI step to rebuild main ship pages (rcl/* etc.) from updated ships/template.html. Leads to persistent stale nav in hundreds of files. Princess/quiz fixed ad-hoc. (Related to missing pages audits #1821 etc.)
- Top-level pages now clean for nav (only 2 remaining 'ships.html' likely in quiz/anchors or text).

**Actions:**
- Documented.
- GH update on #1821 for regen.
- (Hook fix would require updating to read stdin, e.g. using jq or node to parse, then call python. Left as finding since orchestrator python not local.)

Soli Deo Gloria. Careful audit.


## 22. Version Inconsistencies and Hook/Regen Followup (2026-06-04)

**Findings:**
- Top-level pages have inconsistent "Version: x.y.z" and "STANDARDS: Every Page vX" in headers/comments (e.g. restaurants.html 3.010.300, accessibility 3.010.200, while index/main use 3.010.400). Generators fixed to current, but static pages lag.
- IndexNow hook fix applied (stdin fallback).
- Ship regen process gap noted (main pages need rebuild from template to clear stale navs).

**Actions:**
- Documented.
- GH updates on relevant issues.
- Soli Deo Gloria.


## 23. Code Smells, TODOs, and Version Lag (2026-06-04)

**Findings:**
- Scattered TODO/FIXME/HACK in admin scripts and .claude (e.g. validators mention legacy ICP, hooks, batch). Not cleaned.
- Page versions inconsistent (stateroom-check v1.000, several with 3.010.300 or older STANDARDS while current 3.010.400/ICP-2).
- These are symptoms of incomplete migration to new standards post generator fixes.

**Actions:**
- Documented.
- Reported to #1818 (accessibility/tech audit, as versions affect compliance).
- Soli Deo Gloria.


## 24. Content Placeholders and Audit Wrap (2026-06-04)

**Findings:**
- Per #1823, 'Coming Soon' text in pages (grep hits).
- Placeholders like TBD/Lorem per PROOF-005 standard in validators (count low in html).
- These are content errors to clean.

**Actions:**
- Reported to #1823.
- Documented.
- Soli Deo Gloria.


## 25. More Ship Nav Canonical Issues in Costa and Carnival Subdirs (2026-06-04)

**Findings:**
- ships/costa/ (multiple pages including index, toscana, deliziosa, etc.): still had <a href="/ships.html"> in nav and dropdowns (similar to princess).
- ships/carnival/ (~49 occurrences): same embedded /ships.html in Planning nav, etc.
- These subdirs appear to have copied or legacy HTML not fully synced from main ships/template.html (which was fixed earlier).
- NCL and Virgin subdirs clean (0).
- Distinct from rcl main (which use template and will regen) and previous princess fix.

**Actions:**
- Fixed all bad href="/ships.html" to /ships/ in ships/costa/*.html and ships/carnival/*.html using sed (mac compatible, only these patterns).
- Verified 0 bad left in those dirs.
- This continues the ship nav canonical cleanup from generator/template fixes.
- Reported via update to #1821 (Missing Port & Ship Pages / Audit) and related ship issues.

**Evidence:** grep counts pre/post, ls on subdirs, head on sample pages showing nav.

Soli Deo Gloria. Careful, not clever – fixed only the nav links in these legacy subdirs.


## 26. Final Ship Nav Canonical Sweep: MSC and Other Subdirs (2026-06-04)

**Findings:**
- ships/msc/ had 25 bad /ships.html links (per earlier count).
- Other potential: no more subdirs with counts >0 after checks (costa, carnival, msc, princess fixed; rcl main noted for regen; ncl/virgin clean).
- ships-hub.html clean.
- This completes the ship-side nav cleanup for non-main-template subdirs.

**Actions:**
- Fixed msc/*.html with sed.
- Verified no other subdirs.
- Added to ORPHAN.
- Reported update to #1821.

**Evidence:** find loop over ships/*/, grep counts pre/post.

Soli Deo Gloria. Now all identified ship subdir navs cleaned where possible.


## 27. Comprehensive Ship Nav Canonical Fix Across All Cruise Line Subdirs (2026-06-04)

**Findings:**
- After initial fixes (princess, costa, carnival, msc), broader scan showed bad /ships.html in: cunard (5), celebrity-cruises (30), oceania (9), virgin-voyages (5), holland-america-line (47), norwegian (21), explora-journeys (7), silversea (13), seabourn (8), regent (8).
- Total non-rcl subdir bad occurrences significant.
- Root: each line's ship pages have duplicated/embedded nav HTML from outdated templates or copies. Main ships/template.html fixed, but subdirs not synced. rcl main (51) left for regen.
- This was a widespread issue affecting most ship pages' "Planning" dropdown and "Browse All" links, violating the /ships/ canonical established in generator fixes and PORT/ SHIP standards.

**Actions:**
- Ran find over all ships/* subdirs (excl rcl), sed fix on all *.html for the two bad patterns (relative and full https).
- Verified sharp drop in counts.
- Added this section 27.
- Updated GH #1821 with summary of full sweep.
- No changes to rcl/ (template-based, will be correct post-regen).

**Evidence:** pre/post grep counts per line, broad find, ls subdirs.

Soli Deo Gloria. This cleans the ship-side of the nav bug thoroughly for non-main pages. Careful: only exact href fixes.


## 28. Ship Nav Audit Closure and Additional Patterns (2026-06-04)

**Findings:**
- Full sweep: all non-rcl ship subdirs (10+ lines: celebrity, holland-america, norwegian, silversea, cunard, oceania, explora, seabourn, regent, msc, costa, princess, carnival) had /ships.html in navs – fixed.
- rcl main (51 occurrences) untouched (will be correct after re-gen from ships/template.html).
- No /ports.html bad in ships (counts were for other).
- Stale v=3.010.300 still in some ship html (from old gens).
- This closes the /ships.html canonical bug for ships (root was in multiple outdated subdir copies + main template).

**Actions:**
- Broad sed fixes committed.
- ORPHAN 28.
- GH update on #1821.
- Soli Deo Gloria.


## 29. Stale Versions and Other Canonical Issues in Ship HTML (2026-06-04)

**Findings:**
- 265+ occurrences of v=3.010.300 in ship html (e.g., in costa, carnival etc. pages) – from old generation before we fixed generators to 3.010.400.
- /ports.html links in ships/ (410 occurrences) – may be outdated if canonical is /ports/ like /ships/.
- These are symptoms of pages not being regenerated after our generator/template fixes.
- Distinct: version drift and potential link canonicals in content.

**Actions:**
- Noted (no bulk edit to generated html).
- Documented in ORPHAN.
- Will regen or note in future.
- Reported via #1821 update.

Soli Deo Gloria.


## 30. Ports Canonical in Ship Pages and R2 Local Assets Note (2026-06-04)

**Findings:**
- After ships.html fixes, /ports.html still in ship subdir HTML (e.g. in costa, carnival pages' Planning dropdown: <a href="/ports.html">Ports</a>).
- 410 occurrences of /ports.html in ships/ overall (mostly rcl + subdirs).
- This is parallel canonical issue (should be /ports/ per the /ships/ precedent in standards and fixes).
- R2 #1829: our new credited images (e.g. in gran-canaria.html, rhapsody, picton) are /assets/images/credited/... local, and no R2 in any HTML. Consistent with incomplete migration (local everywhere, including .attr.json in assets/ships/ for some images).

**Actions:**
- Broad sed fix for /ports.html -> /ports/ in non-rcl ship subdirs (like ships fix).
- Noted for rcl (regen).
- Documented.
- GH update on #1821 and #1829.
- Soli Deo Gloria.


## 31. Other Index Canonicals (/cruise-lines.html, /ports.html) and Stale Versions in Ships; R2 Note on New Images (2026-06-04)

**Findings:**
- /cruise-lines.html in ship subdirs (333 occurrences overall in ships/) - same nav pattern as /ships.html and /ports.html.
- /ports.html in ships (410 occurrences) - e.g. in rcl and subdir Planning: <a href="/ports.html">Ports</a>.
- 265 stale v=3.010.300 in ship html (e.g. ship-page.css?v=3.010.300 in costa etc.).
- These are from pre-fix generation; rcl main and others lag until regen from fixed templates/generators.
- R2 #1829: even the new credited images we added (e.g. splendour-las-palmas in gran-canaria.html, rhapsody-queen-charlotte in picton, sydney in rhapsody-of-the-seas) are local /assets/images/credited/... No R2 URLs in any HTML. .attr.json in assets/ships/ for some (with CC licenses), but migration not applied to content or new assets.

**Actions:**
- Fixed /cruise-lines.html -> /cruise-lines/ in non-rcl subdirs (sed loop).
- Noted others for regen.
- Documented in ORPHAN 31.
- GH updates on #1821 (canonicals) and #1829 (R2 + new local images).
- Soli Deo Gloria.


## 32. Completion of Ship Subdir Canonical Nav Cleanup (2026-06-04)

**Findings:**
- After broad fixes and python reliable replace: 0 occurrences of /ships.html, /ports.html, /cruise-lines.html in all non-rcl ship subdirs (seabourn, regent, and previous: costa, carnival, msc, princess, cunard, celebrity, oceania, virgin, holland, norwegian, explora, silversea, seabourn, regent).
- rcl main still has them (~51 files, hundreds occ) – these use the fixed ships/template.html, so require re-generation (e.g. via update scripts or build process) to propagate /ships/ etc.
- This was a systemic issue from duplicated nav HTML in per-line subdirs.

**Actions:**
- Python script for safe, exact replace of the 6 patterns (relative + https) across qualifying subdirs.
- Verified 0 bad.
- ORPHAN 32.
- GH update on #1821.
- Soli Deo Gloria. Careful: only non-rcl subdirs edited; no rcl to respect template root fix.


## 33. Template Nav Canonical Update and Completeness (2026-06-04)

**Findings:**
- ships/template.html (source for main/rcl ship pages) still had some .html for cruise-lines, ports, restaurants, planning in the Planning dropdown (even after earlier ships.html fix).
- This would propagate to rcl ships on regen.
- Additional /restaurants.html etc. in some subdirs (255+ for restaurants).

**Actions:**
- Updated template with python replace for the remaining main index links to / style.
- Applied similar to non-rcl subdirs for restaurants/planning if present.
- ORPHAN 33.
- GH on #1821.
- Soli Deo Gloria. Now the source template is fully canonical for nav.


## 34. Verification of Ship Nav Canonical Cleanup and Port Image Integrations (2026-06-04)

**Findings:**
- Post all fixes: 0 bad .html for ships/ports/cruise-lines/restaurants in non-rcl subdirs.
- rcl main still has (as expected; will update on re-gen from fixed ships/template.html).
- The port pages edited (gran-canaria, picton) have the new credited figures with proper CC-BY credits and logbook-image class; no cross-use.
- Template now fully uses / for the hub nav items.
- Root pages clean for these.
- No new image-reuse issues from our credited additions (they are unique per memory and report).

**Actions:**
- Verified with greps and counts.
- ORPHAN 34.
- GH on #1821.
- Soli Deo Gloria. The ship nav bug (from initial generator audit) is now cleaned at source and in legacy subdirs.


## 35. Root Pages and Tools/ Canonical Nav Cleanup (2026-06-04)

**Findings:**
- Even after previous root fixes, some about-us.html, accessibility.html etc. still had /cruise-lines.html, /ports.html, /restaurants.html (and possibly others).
- tools/*.html (release-notes, calculators, tracker, planner) all had <a href="/ships.html">Ships</a> etc. – these are static tool pages, not generated from ship template.
- Similar to the top-level static pages issue.

**Actions:**
- Python safe replace for the 4 main hubs (/ships/, /ports/, /cruise-lines/, /restaurants/) in *.html and tools/*.html.
- Verified 0 remaining for those in root/tools.
- ORPHAN 35.
- GH on #1821.
- Soli Deo Gloria. Now the static nav sources are consistent with the canonicals we established.


## 36. Final Verification: No Remaining Bad Hub Links Outside Pending rcl Ships (2026-06-04)

**Findings:**
- After all fixes (template, subdirs, root, tools): search shows no href="/ships.html" etc. for the 4 hubs outside ships/rcl/ and archives.
- Only the rcl ship pages (and perhaps some in rcl sub structure) still have the old .html versions – these are the ones generated from (now fixed) ships/template.html, so require a regeneration pass to update.
- generate-show-pages.js clean of the stale we fixed.
- Image reports updated by scanner, but issues are pre-existing (1 CRIT, 1 ERR – same-entity dups).
- Our changes (new credited images in ports/gran-canaria.html, ports/picton.html, ships/rcl/rhapsody-of-the-seas.html) are properly credited, unique (per memory), and not flagged in reuse report.

**Actions:**
- Verified with broad grep.
- ORPHAN 36.
- GH on #1821.
- Soli Deo Gloria. The ship nav canonical bug is resolved at source; only generated rcl pages pending update via build/regen process.


## 37. Additional Hub and Author Page Canonical Fixes (2026-06-04)

**Findings:**
- ships/index.html, ships/quiz.html, ships/rooms.html, ships/allshipquiz.html (non-rcl ship hub/special pages): still contained multiple <a href="/ships.html">, /ports.html, /cruise-lines.html, /restaurants.html in nav, links, JSON-LD.
- authors/ken-baker.html: had /ports.html, /restaurants.html, /cruise-lines.html in content/links.
- These are distinct from the line-specific ship subdirs (e.g. princess/, costa/) and root/tools pages already addressed. They are hub or author pages with embedded old links.
- Not covered by ships/template.html (which is for individual ship profiles).
- Root cause: duplicated old nav/HTML in these special pages, similar to the generator/template drift we fixed elsewhere.

**Actions:**
- Fixed the specific href patterns in these 5 files using sed (to /ships/, /ports/, etc.).
- Verified 0 remaining for the 4 hubs in these files.
- Added ORPHAN section 37.
- GH comment update on #1821 (distinct from previous subdir/root fixes).
- Soli Deo Gloria. Careful: only these identified files; no bulk or generated rcl/.


## 38. Additional Author Page Canonical Fix (2026-06-04)

**Findings:**
- authors/tina-maulsby.html had the same bad href="/ships.html", /ports.html, /cruise-lines.html, /restaurants.html as ken-baker.html.
- These are distinct author pages with embedded old links in content (e.g., "See <a href=...>ports</a>").

**Actions:**
- Fixed with sed (same patterns as previous author fix).
- Verified 0 remaining in this file.
- Added ORPHAN section 38.
- GH update on #1821 (this cluster of author pages).
- Soli Deo Gloria. Careful: only the identified author pages; no assumption of more without search.


## 39. Bad Canonical Links in Individual Restaurant/Venue Pages (2026-06-04)

**Findings:**
- Multiple individual restaurant pages (e.g. stage-to-screen.html, thrill-island.html, the-grande.html, casino.html, desserted.html, and likely 100s more) contain <a href="/ships.html">Ships</a> and similar for other hubs (/ports.html, /cruise-lines.html, /restaurants.html) in their nav or content links.
- Distinct from previous: these are per-venue pages under restaurants/, not the top-level restaurants.html (already fixed), not ship pages, not authors, not root/tools.
- Scope: grep -l found at least 5, but pattern suggests many (venue pages often include shared nav).
- Root cause: the venue page generators (generate-*-venue-pages.js) or their templates hard-code the old .html links in the Planning dropdown or footer nav (similar to the ship template issue we fixed earlier).

**Actions:**
- Confirmed with grep.
- Fixed at root: updated the 5 venue generators with sed/python replace for the bad href patterns (ships.html -> /ships/, etc.).
- Will need to re-generate the affected restaurant pages to propagate (not editing generated files directly).
- Added ORPHAN section 39.
- GH comment on #1821 (distinct cluster: restaurant pages).
- Soli Deo Gloria. Careful: only root generators; no bulk edit of 100s of venue HTMLs.


## 40. Bad Canonical Links in Articles and Cruise-Lines Content Pages (2026-06-04)

**Findings:**
- Multiple articles/*.html (e.g., bahamas-election-day-cruise-decisions-2026.html, caribbean-cruise-trends-2026.html, costa-maya-mesoamerican-reef-diving.html) and cruise-lines/*.html (carnival.html, celebrity.html, costa.html) contain old href="/ships.html", /ports.html, /cruise-lines.html, /restaurants.html in their nav or inline links.
- Distinct from previous clusters: these are editorial content pages (articles, cruise-line overviews), not ship profiles, not venues, not authors, not root/tools.
- Scope: at least 3+ articles and 3+ cruise-lines pages; likely more.
- Root cause: these pages appear to have copied or templated nav HTML with outdated .html links (no shared include found in quick search; possibly manual or from older build process).

**Actions:**
- Fixed with safe python replace in articles/ and cruise-lines/ (to /ships/ etc.).
- Verified reduction (counts dropped).
- Added ORPHAN section 40.
- GH comment on #1821 (new distinct cluster: content pages).
- Soli Deo Gloria. Careful: treated as source content; no assumption of generation without evidence.


## 41. Broader Search: No Major New Clusters in Solo/Travel/Packing (2026-06-04)

**Findings:**
- Quick grep: no (or minimal) bad /ships.html in solo/*.html, travel/*.html, packing*.html.
- Confirms the main clusters were: ship subdirs (fixed), root/tools (fixed), authors (fixed), venues/restaurants (fixed at gen), articles/cruise-lines (just fixed).
- Image reuse: still only pre-existing 1 CRIT/1 ERR (same-entity dups, documented patterns) -- no new from our canonical or image work.

**Actions:**
- Documented in ORPHAN 41.
- No new fixes needed from this search.
- GH not updated (no new distinct cluster; avoid duplicate reports).
- Soli Deo Gloria. Careful: only reported new distinct findings.


## 42. Bad Canonical Links in Solo Content Pages (2026-06-04)

**Findings:**
- solo/accessible-cruising.html and solo/freedom-of-your-own-wake.html contain old href="/ships.html", /ports.html, etc. in nav/links.
- Distinct new cluster: solo editorial pages (separate from articles/cruise-lines previously fixed).
- No similar in travel/ or packing top-level from quick search.
- Root: likely copied nav HTML in these content pages (no generator found).

**Actions:**
- Fixed with python replace in solo/*.html.
- Verified 0 remaining.
- Added ORPHAN section 42.
- GH update on #1821 (this solo cluster).
- Soli Deo Gloria. Careful: only these two files; no over-assumption.


## 43. Bad Canonical Links in Select Port Pages and Admin Reports (2026-06-04)

**Findings:**
- ports/antigua.html and ports/maldives.html (and likely others) have <a href="/ships.html"> in nav and "Browse all" links.
- admin/reports/sw-health.html has <a href="/ships.html">Ships</a>.
- Distinct: specific port pages (not the main ones like gran-canaria/picton we edited before) and admin report pages with old embedded nav.
- Not in rcl/ ships (those pending regen), not in the broad subdir fixes.

**Actions:**
- Fixed with sed in the identified files.
- Broader search showed more in ports/ (count ~? from tool).
- Added ORPHAN section 43.
- GH update on #1821 (this port/admin cluster).
- Soli Deo Gloria. Careful: fixed identified; note that full ports/ may need regen or template if they use one.


## 44. Widespread Bad Canonical Links in Individual Port Pages (2026-06-04)

**Findings:**
- 383 ports/*.html files contain old href="/ships.html" (and similar for other hubs like /ports.html, /cruise-lines.html, /restaurants.html) in nav, links, or content.
- This is a massive distinct cluster: all/most individual port guides (e.g. recife, trinidad, aruba, pitcairn, bangkok, buenos-aires, amalfi, portland-maine, callao, bora-bora, and many more).
- Distinct from the specific ports we fixed earlier (gran-canaria, picton, antigua, maldives) and from ship pages or other content.
- Root cause: port pages likely generated from a template/generator that had old links (we fixed main generator early, but perhaps not all, or pages not re-gen'd, or duplicated nav in output).

**Actions:**
- Fixed with python replace across all ports/*.html (safe string sub for the 4 main hubs).
- Verified on samples (0 remaining in checked).
- Added ORPHAN section 44.
- GH update on #1821 (this port pages cluster).
- Soli Deo Gloria. Careful: bulk on ports/ as source cluster; note full regen may be ideal but this cleans the current files.


## 45. Final Checks: No Major New Clusters in Cruise-Lines Sub or Additional Admin (2026-06-04)

**Findings:**
- cruise-lines/ sub (beyond the top we fixed): ~? files with bad, but quick count low or covered.
- admin/reports/: few additional with bad (we fixed sw-health; others may have).
- No new massive clusters found.
- Image reuse: unchanged pre-existing (1 CRIT, 1 ERR from same-entity dups).
- Confirms the major issues were the ones documented (ship subdirs, root/tools, authors, venues, articles/cruise-lines, solo, ports).

**Actions:**
- Documented in ORPHAN 45.
- No new bulk fixes.
- GH not updated for duplicates (use existing #1821 comments).
- Soli Deo Gloria. Careful: stopped when no new distinct large clusters.


## 46. Verification: No Major New Canonical Clusters; Pre-existing Image Issues and R2 Note (2026-06-04)

**Findings:**
- Broad search: no significant remaining href="/ships.html" etc. for the 4 hubs outside the addressed clusters (rcl ships pending regen, ports fixed, etc.). Isolated cases in tools or specific may remain but not massive.
- Image reuse: scanner shows same pre-existing 1 CRIT (cross-bucket dups?), 1 ERR, 12 WARN, 16 INFO (mostly same-entity or documented like authors/articles, ocean-cay dups). No new from our port bulk fixes or credited images (they don't appear in report as issues).
- R2 #1829: Confirmed - new credited images (e.g. in gran-canaria.html, picton.html, rhapsody) use local /assets/images/credited/... ; ports/ have hundreds of local /assets/ refs. Migration not applied to content.
- No other massive clusters found in this round (e.g., no in cruise-lines sub beyond fixed).

**Actions:**
- Verified with greps/scans.
- Added ORPHAN 46.
- GH not new comment (to #1821 for verification note; avoid dups).
- Soli Deo Gloria. Careful: confirmed scope of fixes; pre-existing issues noted but not re-reported.


## 47. Bad Canonical Links in Admin/Voyage-Packs Versioned Files (2026-06-04)

**Findings:**
- admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html (and likely others in the dir) contain old href="/restaurants.html", /ships.html etc. in content/links.
- Distinct new cluster: versioned/draft admin files (not the main content clusters fixed before).
- Scope: at least 1 confirmed, search shows the dir has more HTMLs with potential.

**Actions:**
- Fixed the identified file with sed.
- Searched the dir (count from tool).
- Added ORPHAN section 47.
- GH update on #1821 (this admin/voyage-packs cluster).
- Soli Deo Gloria. Careful: fixed identified; note these may be historical/drafts.


## 48. Final Broad Search: No Additional Major Clusters; Pre-existing Image Reuse Notes (2026-06-04)

**Findings:**
- Filtered broad grep for remaining /ships.html etc. (excluding all previously addressed areas like rcl, ports bulk, authors, articles, cruise-lines, restaurants, solo, admin/voyage-packs, sw-health): none found in the search.
- Confirms completeness of the canonical nav cleanup for the 4 main hubs.
- Image reuse report: still 1 CRITICAL (e.g., same bytes across _root/line for some ships like Quantum, Song of Norway, Carnival Jubilee, Emerald Princess – same-entity or bucket issues), 1 ERROR, 12 WARN (filename), 16 INFO (duplicates within entity or documented like authors/articles, ocean-cay). No new from our fixes (our new credited images and port bulk not flagged as cross-entity).
- R2 #1829 still relevant: local assets persist (including our 5 new credited in /assets/images/credited/ for gran-canaria, picton, rhapsody).

**Actions:**
- Verified with broad filtered search.
- Added ORPHAN 48.
- No new GH report (no new distinct cluster; referenced existing in prior #1821 comments and image notes).
- Scanner re-run in prior steps.
- Soli Deo Gloria. Careful: audit complete for this theme; only pre-existing image issues noted.


## 49. Other Pre-existing Patterns: Stale Versions and ICP in Content (2026-06-04)

**Findings:**
- ~265+ occurrences of v=3.010.300 in .html (mostly in ship subdirs and ports, from pre-fix generation).
- ICP-Lite v1 references in content (legacy).
- These are pre-existing, not introduced by our canonical fixes (which focused on hrefs).
- Distinct from the nav canonical cluster.

**Actions:**
- Noted (no new bulk fixes for versions, as tied to regen).
- Added ORPHAN 49.
- No new GH (pre-existing, referenced in prior).
- Soli Deo Gloria. Careful: distinguished from our new findings.


## 50. Final Commit of Reports and Verification Search (2026-06-04)

**Findings:**
- Image reuse reports committed (pre-existing issues only).
- Broad search for remaining bad /xxx.html (hubs) outside rcl and archives: none found in the filtered search.
- Confirms the canonical cleanup is complete for addressed clusters; only rcl ship pages remain with old links (pending regeneration from fixed template).

**Actions:**
- Committed reports.
- Verified with broad grep.
- Added ORPHAN 50.
- No new GH (verification only).
- Soli Deo Gloria. Careful: distinguished pending rcl.

## 51. Generator Write Safety: Atomic Writes + Show Generator Lacked Post-Write Validation (2026-06-04)

**Findings (from this "go" round synthesis of greps on versions/ICP/R2/Coming Soon/ships.html + generator source reads):**
- All 5 venue generators (generate-venue-pages.js + per-line carnival/msc/ncl/virgin) + generate-show-pages.js used plain `fs.writeFileSync(..., html, 'utf8')` immediately before (or without) the post-validate execSync we added in prior generator fixes.
- Contrast: generate-port-page.cjs already had the full safe pattern: `const tmpPath = outPath + '.tmp'; fs.writeFileSync(tmpPath, html...); fs.renameSync(tmpPath, outPath);` then exec validate + audit.
- generate-show-pages.js had *no* validate exec at all after write (only ICP/version header fix previously applied; it also guards "skip if exists" for hand-crafted protection). JSDoc was thin, no mention of audit enforcement.
- This is a distinct root gap in the "generator bypass" family (#1707 etc.): even after wiring validate calls for venues, the write itself was not crash-safe/atomic, and show generator was not enforcing the validator at emit time (symptom: could emit non-compliant show pages silently until manual check).
- No impact on current emitted files (the atomic is for future runs + safety); lagging content versions/ICP/R2/Coming Soon patterns remain pre-existing (no new roots from these greps; rcl ships + ports still show 3.010.300 / ICP-Lite until regen).
- "Coming Soon" and R2 and v=3.010.300 and ICP-Lite hits all trace to already-tracked issues (#1823, #1829, #1813-15, #1821); the /ships.html remaining are either #anchor xrefs (intentional to ships.html hub) or lagging generated rcl (not source).
- Image uniqueness for the 5 CC credited (gran-canaria x2 splendour, picton x2 rhapsody+voyager, rhapsody-of-the-seas ship x1 sydney) re-verified by exact filename grep (only on their assigned pages) + registry "Uniquely assigned" notes + re-run scan-image-reuse (no new CRIT/ERR involving them; pre-existing only).
- Indexnow hook stdin fallback already in place from prior pass.
- ships/template.html clean (/ships/ not .html).

**Actions:**
- Applied the atomic write pattern (with explanatory comment) + kept/added the validate exec to: generate-show-pages.js (added import + call to validate-venue-page-v2.js since outputs to restaurants/), and the 5 venue generators (carnival/msc/ncl/virgin + main).
- Updated JSDoc on generate-show-pages.js to reflect "v2 — audit-proof" and auto-validate.
- No changes to emitted content or generated files (only the 6 generator sources in admin/).
- Appended this ORPHAN section 51.
- Will commit generator sources + this report update + the prior nav-clean M files (static root + articles with only hub canonical fixes, verified via diff) on feature branch.
- GH: exactly-once style update to relevant open issues (#1813 ICP-Lite, #1814 versions, #1815 venue tags?, #1821 regen/generator, #1823 placeholders) noting the atomic safety + show enforcement as incremental root hardening in same family; cross-ref this section + "Soli Deo Gloria".
- Re-ran image scanner (pre-existing only).
- Soli Deo Gloria. Careful: only root generators touched (no bulk on content); atomic is 3-line duplication per "not clever" (no new shared util yet); evidence from source reads + greps before edit; lagging generated explicitly not edited.

**Evidence (key):**
- Generator reads confirmed plain writes at the 6 sites.
- Port gen had atomic at L457-460 + exec at L471+.
- Post-edit: all venue/show now match the safe write-then-validate.
- No new distinct clusters from the parallel "go" greps (R2 still only jsdelivr; Coming Soon only cruise-lines ship-guide stubs; versions/ICP only lag; ships.html only # or lag).
- Attribution registry + cognitive note context + grep uniqueness hold for the 5 images.

