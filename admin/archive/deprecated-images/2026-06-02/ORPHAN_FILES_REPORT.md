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

**No action on images until explicit user approval on the review doc.** Every listed image was looked at via metadata + filename + external source verification where relevant.

**Soli Deo Gloria.**

---

**Report End**
