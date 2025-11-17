# Unfinished Tasks - Both Threads

**Generated:** 2025-11-17
**Threads Tracked:**
- Thread 1: `claude/evaluate-ai-human-strategy-01L5apYYXXKEUVyhFbyhAgZs`
- Thread 3: `claude/track-thread-status-01VdXW51MuvV3Vpa9UBrH2n9` (current)

---

## 🖼️ IMAGE TASKS

### High Priority: Wiki Commons Image Downloads
**Status:** 19 ships need images downloaded from Wiki Commons

**Active Ships (10 ships):**
- [ ] Allure of the Seas - Download 3-4 images from [74 files](https://commons.wikimedia.org/wiki/Category:Allure_of_the_Seas_(ship,_2010))
- [ ] Anthem of the Seas - Download 3-4 images from [29 files](https://commons.wikimedia.org/wiki/Category:Anthem_of_the_Seas_(ship,_2015))
- [ ] Icon of the Seas - Download 3-4 images from [19 files](https://commons.wikimedia.org/wiki/Category:Icon_of_the_Seas_(ship,_2023))
- [ ] Independence of the Seas - Download 3-4 images from [131 files](https://commons.wikimedia.org/wiki/Category:Independence_of_the_Seas_(ship,_2008))
- [ ] Navigator of the Seas - Download 3-4 images from [multiple files](https://commons.wikimedia.org/wiki/Category:Navigator_of_the_Seas_(ship,_2002))
- [ ] Odyssey of the Seas - Download 3-4 images from [6 files](https://commons.wikimedia.org/wiki/Category:Odyssey_of_the_Seas_(ship,_2021))
- [ ] Quantum of the Seas - Download 3-4 images from [20 files](https://commons.wikimedia.org/wiki/Category:Quantum_of_the_Seas_(ship,_2014))
- [ ] Spectrum of the Seas - Download 3-4 images from [25 files](https://commons.wikimedia.org/wiki/Category:Spectrum_of_the_Seas_(ship,_2019))
- [ ] Voyager of the Seas - Download 3-4 images from [48 files](https://commons.wikimedia.org/wiki/Category:Voyager_of_the_Seas_(ship,_1999))
- [ ] Wonder of the Seas - Download 3-4 images from [11 files](https://commons.wikimedia.org/wiki/Category:Wonder_of_the_Seas_(ship,_2022))

**Historic/Retired Ships (9 ships):**
- [ ] Sovereign of the Seas - Download 3-4 images from [10 files](https://commons.wikimedia.org/wiki/Category:Sovereign_of_the_Seas_(ship,_1987))
- [ ] Monarch of the Seas - Download 3-4 images from [65 files](https://commons.wikimedia.org/wiki/Category:Monarch_of_the_Seas_(ship,_1991))
- [ ] Legend of the Seas - Download 3-4 images from [58 files](https://commons.wikimedia.org/wiki/Category:Legend_of_the_Seas_(ship,_1995))
- [ ] Splendour of the Seas - Download 3-4 images from [multiple files](https://commons.wikimedia.org/wiki/Category:Splendour_of_the_Seas_(ship,_1996))
- [ ] Nordic Empress - Download 3-4 images from [46 files](https://commons.wikimedia.org/wiki/Category:Nordic_Empress_(ship,_1990))
- [ ] Song of Norway - Download 3-4 images from [3 files](https://commons.wikimedia.org/wiki/Category:Song_of_Norway_(ship,_1970))
- [ ] Song of America - Download 3-4 images from [files available](https://commons.wikimedia.org/wiki/Category:Song_of_America_(ship,_1982))
- [ ] Viking Serenade - Download 3-4 images from [9 files](https://commons.wikimedia.org/wiki/Category:Viking_Serenade_(ship,_1982))
- [ ] Sun Viking - Download 3-4 images from [4 files](https://commons.wikimedia.org/wiki/Category:Sun_Viking_(ship,_1972))

### Image Processing Tasks
After downloading each set of images:
- [ ] Convert all downloaded images to WebP format using `python3 convert_to_webp.py <input>`
- [ ] Move WebP files to `/assets/ships/` directory
- [ ] Rename files to match pattern: `{ship-slug}1.webp`, `{ship-slug}2.webp`, `{ship-slug}3.webp`

### Image Research Needed
- [ ] Star of the Seas - Search Wiki Commons for construction photos (2025 debut)
- [ ] Nordic Prince - Search Wiki Commons for historic ship images
- [ ] Verify duplicate ships: Legend of the Seas variants (legend-of-the-seas.html vs legend-of-the-seas-1995-built.html vs legend-of-the-seas-icon-class-entering-service-in-2026.html)
- [ ] Verify duplicate ships: Star of the Seas variants (star-of-the-seas.html vs star-of-the-seas-aug-2025-debut.html)

### Ships Page Image Audit
- [ ] Audit ships page - ensure all ships in repository have images (check Google/Wikimedia Commons for identification)
- [ ] Verify all 50 RCL ships have proper images in swipers
- [ ] Check Carnival ships for image coverage
- [ ] Check Celebrity ships for image coverage

---

## 📝 IMAGE ATTRIBUTION TASKS

### Fix Placeholder Attributions (4 ships)
- [ ] Symphony of the Seas - Get proper Wiki Commons URLs for 3 uploaded images (symphony-of-the-seas1.jpeg, symphony-of-the-seas2.jpg, symphony-of-the-seas3.jpg)
- [ ] Adventure of the Seas - Get proper Wiki Commons URLs and create attribution section
- [ ] Enchantment of the Seas - Add proper Wiki Commons attributions for 5 images:
  - 2560px-Bahamas_Cruise_-_CocoCay_-_June_2018_(3390).jpg
  - 2560px-BOS_at_Valetta_121410.JPG
  - Bahamas_Cruise_-_ship_exterior_-_June_2018_(2140).jpg
  - Bahamas_Cruise_-_ship_exterior_-_June_2018_(3251).jpg
  - Enchantment_of_the_Seas.jpg
- [ ] Explorer of the Seas - Get proper Wiki Commons URLs and create attribution section

### Add Attribution Sections (When Images Added)
- [ ] Nordic Prince - Add attribution section when images are uploaded
- [ ] Sun Viking - Add attribution section when images are uploaded

### CRITICAL: Attribution for 19 Ships Getting Wiki Commons Images
**Status:** After downloading images from Wiki Commons, MUST get attribution details and add to HTML
**This is a required follow-up to the image download tasks above**

For EACH of the 19 ships getting Wiki Commons images, must:
- [ ] Get Wiki Commons details for each image:
  - Image file URL (e.g., `https://commons.wikimedia.org/wiki/File:Ship_Name.jpg`)
  - Author name and user URL
  - License type (CC BY, CC BY-SA, CC BY 2.0, etc.)
  - License URL
- [ ] Add attribution section to ship HTML page (before closing `</main>`)
- [ ] Add figcaption to each swiper image: "Photo served locally (attribution in page footer)."
- [ ] Verify attribution section renders correctly

**Ships requiring this workflow (19 total):**
- All 10 active ships (Allure, Anthem, Icon, Independence, Navigator, Odyssey, Quantum, Spectrum, Voyager, Wonder)
- All 9 historic ships (Sovereign, Monarch, Legend, Splendour, Nordic Empress, Song of Norway, Song of America, Viking Serenade, Sun Viking)

### Attribution for Cruise Line Hub Pages
**Status:** 5 cruise line pages need credited media attribution

- [ ] Carnival.html - Replace Wikimedia Commons placeholders with final credited media + attribution
- [ ] Celebrity.html - Replace Wikimedia Commons placeholders with final credited media + attribution
- [ ] Disney.html - Replace Wikimedia Commons placeholders with final credited media + attribution
- [ ] Holland America.html - Replace Wikimedia Commons placeholders with final credited media + attribution
- [ ] MSC.html - Replace Wikimedia Commons placeholders with final credited media + attribution

---

## 📚 SHIP LOGBOOK TASKS

### Ships Missing Logbooks (22 ships need logbook JSON files)

**Active Ships:**
- [ ] Enchantment of the Seas - Create logbook with diverse perspectives
- [ ] Legend of the Seas - Create logbook with diverse perspectives
- [ ] Majesty of the Seas - Create logbook with diverse perspectives
- [ ] Rhapsody of the Seas - Create logbook with diverse perspectives
- [ ] Vision of the Seas - Create logbook with diverse perspectives
- [ ] Star of the Seas - Create logbook with diverse perspectives

**Future Ships (TBN):**
- [ ] Discovery-class ship TBN - Create placeholder logbook (if applicable)
- [ ] Icon-class ship TBN 2027 - Create placeholder logbook (if applicable)
- [ ] Icon-class ship TBN 2028 - Create placeholder logbook (if applicable)
- [ ] Oasis-class ship TBN 2028 - Create placeholder logbook (if applicable)
- [ ] Quantum Ultra-class ship TBN 2028 - Create placeholder logbook (if applicable)
- [ ] Quantum Ultra-class ship TBN 2029 - Create placeholder logbook (if applicable)
- [ ] Star-class ship TBN 2028 - Create placeholder logbook (if applicable)
- [ ] Legend of the Seas Icon-class 2026 - Create placeholder logbook (if applicable)

**Historic/Retired Ships:**
- [ ] Majesty of the Seas - Create historic logbook
- [ ] Monarch of the Seas - Create historic logbook
- [ ] Nordic Empress - Create historic logbook
- [ ] Nordic Prince - Create historic logbook
- [ ] Splendour of the Seas - Create historic logbook
- [ ] Viking Serenade - Create historic logbook
- [ ] Sun Viking - Create historic logbook
- [ ] Legend of the Seas 1995 - Create historic logbook

**Current Ships with Logbooks (28 ships - COMPLETE):**
- ✅ Adventure of the Seas
- ✅ Allure of the Seas
- ✅ Anthem of the Seas
- ✅ Brilliance of the Seas
- ✅ Explorer of the Seas
- ✅ Freedom of the Seas
- ✅ Grandeur of the Seas
- ✅ Harmony of the Seas
- ✅ Icon of the Seas
- ✅ Independence of the Seas
- ✅ Jewel of the Seas
- ✅ Liberty of the Seas
- ✅ Mariner of the Seas
- ✅ Navigator of the Seas
- ✅ Oasis of the Seas
- ✅ Odyssey of the Seas
- ✅ Ovation of the Seas
- ✅ Quantum of the Seas
- ✅ Radiance of the Seas
- ✅ Serenade of the Seas
- ✅ Song of America
- ✅ Song of Norway
- ✅ Sovereign of the Seas
- ✅ Spectrum of the Seas
- ✅ Symphony of the Seas
- ✅ Utopia of the Seas
- ✅ Voyager of the Seas
- ✅ Wonder of the Seas

---

## 🎨 TEMPLATE & SEO TASKS

### Production Template Deployment
- [ ] Apply production template (v3.010.300) to all pages if not already done
- [ ] Test dropdown menus across devices (300ms hover delay)
- [ ] Verify structured data in Google Rich Results Test
- [ ] Submit sitemap to Google Search Console

### Short-term SEO Setup (This Week)
- [ ] Create sitemap.xml if not exists
- [ ] Set up Google Search Console
- [ ] Set up Bing Webmaster Tools
- [ ] Add search functionality for SearchAction schema

### Long-term SEO (This Month)
- [ ] Monitor search performance in Google Search Console
- [ ] Track rich snippet appearance in search results
- [ ] Analyze social sharing metrics
- [ ] Optimize based on search queries

---

## 📊 SHIP DATA TASKS

### Ship Stats JSON Files
**Status:** Need to verify which ships are missing stats JSON files

All 50 ships should have stats JSON at:
- `/assets/data/ships/{ship-slug}.json` OR
- `/ships/rcl/assets/{ship-slug}.json`

**Priority ships needing verification:**
- [ ] Verify all future ships (TBN) have placeholder stats
- [ ] Verify all historic ships have accurate stats
- [ ] Verify duplicate ships (Legend, Star variants) have correct data

### Dining Venues Data
- [ ] Complete `/assets/data/venues.json` with all Royal Caribbean dining venues
- [ ] Map each ship to its specific venues
- [ ] Add pricing information for specialty restaurants
- [ ] Add descriptions for all venue categories

### Video Data
- [ ] Create video JSON files for ships missing them (`/assets/data/videos/{ship-slug}.json`)
- [ ] Find YouTube ship tour videos for ships without videos
- [ ] Add accessible stateroom walkthrough videos where available

---

## ✍️ CONTENT TASKS

### Solo Travel Articles
**Status:** 4 articles complete

**Existing articles (COMPLETE):**
- ✅ accessible-cruising.html
- ✅ freedom-of-your-own-wake.html
- ✅ visiting-the-united-states-before-your-cruise.html
- ✅ why-i-started-solo-cruising.html

**New articles in progress:**
- [ ] Create full article page for "Cruising After Loss"
- [ ] Create cruising-after-loss.html fragment for article rail
- [ ] Write content for "Cruising After Loss" article
  - **Content guidance available:** ICP-Lite v1.0 logbook stories contain widow/widower narratives
  - **Key stories to reference:**
    - "The Widow Who Learned to Laugh Again" (Radiance logbook)
    - "The Widower's First Christmas Without Her" (Grandeur logbook)
    - "The FlowRider Widow" (Independence logbook)
  - **Topics to cover:** Timing after loss, ship size selection, finding community, first holidays, Scripture/faith integration, permission to grieve, practical tips
  - **Cross-link to:** Solo guide, accessibility resources, packing lists, ship logbooks

**Potential new articles:**
- [ ] Identify additional solo travel topics based on user research
- [ ] Consider accessibility guides for specific ship classes
- [ ] Consider port accessibility guides

### Cross-linking
- [ ] Review and fix any remaining restaurant URL cross-links in logbooks (recent fix completed for some)
- [ ] Add cross-links between related ship pages (same class)
- [ ] Add cross-links from solo articles to relevant ship pages

---

## 🎨 UI/UX TASKS

### CRITICAL: Dropdown Navigation Site-wide Fix
**Status:** 281 out of 292 pages (96.2%) have navigation issues
**Impact:** Critical - Users see broken vertical navigation instead of styled horizontal dropdowns

**Pages affected:**
- 197 pages - Missing dropdown nav HTML entirely
- 80 pages - Have nav HTML but MISSING CSS (appears as vertical list)
- 4 pages - Using external `/assets/styles.css` which lacks dropdown CSS

**Fix required:**
- [ ] Option 1: Run automated fix script `python3 audit_and_fix_nav.py --fix`
- [ ] Option 2: Manually add complete Nav CSS to all 281 pages
- [ ] Add dropdown JavaScript to all pages missing it
- [ ] Update `/assets/styles.css` with dropdown CSS for external CSS pages
- [ ] Test horizontal styled navigation on all 292 pages
- [ ] Verify 300ms hover delay works across all pages
- [ ] Verify keyboard navigation (Tab, Arrow keys, Escape) works
- [ ] Test mobile responsive horizontal scrolling

**Breakdown by directory:**
- ships/rcl: 44 pages need fixes
- ships/carnival-cruise-line: 47 pages need fixes
- ships/carnival: 58 pages need fixes
- ships/holland-america-line: 44 pages need fixes
- ships/celebrity-cruises: 29 pages need fixes
- restaurants: 25 pages need fixes
- cruise-lines: 10 pages need fixes
- root: 10 pages need fixes
- solo/articles: 3 pages need fixes
- authors: 2 pages need fixes

**Reference files:**
- Perfect examples: index.html, about-us.html, solo.html, travel.html
- Complete nav composite: NAVIGATION_COMPOSITE.md
- Audit script: audit_and_fix_nav.py
- Audit report: nav_audit_report.txt

### Ship Cards Redesign (ships.html and ship index pages)
- [ ] Add compelling CTA text to each ship card explaining WHY users should click
- [ ] Include WHO would want this ship (target audience/use case)
- [ ] Examples of CTA text:
  - Radiance: "Check out this ship if million dollar views through glass windows is important to you"
  - Each ship needs unique, value-focused CTA based on its strengths
- [ ] Better utilize card space - image and text currently too small relative to card size
- [ ] Shrink cards down to only needed space after adding CTA content
- [ ] Ensure cards remain responsive and accessible
- [ ] Test across different screen sizes

### Article Rail Navigation
- [ ] Design article rail navigation pattern for solo travel section
- [ ] Implement article rail site-wide (all solo articles)
- [ ] Test article rail on mobile devices
- [ ] Ensure article rail is accessible (keyboard navigation, screen readers)
- [ ] Style article rail to match site design (v3.010.300)

### Navigation Improvements
- [ ] Review intelligent breadcrumbs implementation across all pages
- [ ] Test navigation composite on different page types
- [ ] Ensure consistent navigation patterns site-wide

---

## 🔧 TECHNICAL TASKS

### CRITICAL: WebP Image References Update (Uncommitted Work from WebP Thread)
**Status:** Images converted (commit cff215b) but code NEVER updated to use them
**Impact:** Site not benefiting from 77% file size reduction (15.8MB → 4.9MB)

**Work needed:**
- [ ] Update 9 ship HTML files (~54 references total)
  - brilliance-of-the-seas.html (6 refs)
  - enchantment-of-the-seas.html (6 refs)
  - jewel-of-the-seas.html (6 refs)
  - majesty-of-the-seas.html (5 refs)
  - radiance-of-the-seas.html (7 refs)
  - rhapsody-of-the-seas.html (6 refs)
  - serenade-of-the-seas.html (6 refs)
  - vision-of-the-seas.html (6 refs)
  - grandeur-of-the-seas.html (6 refs)

- [ ] Update JavaScript files (~74 references total)
  - assets/js/ships-dynamic.js (~67 refs) - ship image arrays
  - assets/js/rcl.page.js (~4 refs) - placeholder images
  - assets/js/sw-bridge.js (~3 refs) - service worker cache

**Types of changes needed in each HTML file:**
- Meta tags: `og:image` and `twitter:image` (.jpeg → .webp)
- JSON-LD schema: `"image"` property (.jpeg → .webp)
- Swiper `<img src>` tags (.jpeg/.jpg → .webp)
- `onerror` fallback paths (.jpeg/.jpg → .webp)

**Available WebP images to reference:**
- 82 main images in `/assets/ships/`
- 8 thumbnails in `/assets/ships/thumbs/`
- All FOM (Flickers of Majesty) images converted

**Estimated effort:** 2-3 hours for careful find/replace across all files

### Bulk Updates
- [ ] Run `add_phase1_bulk.py` script if AI breadcrumbs/Person schema not yet applied to all pages
- [ ] Verify breadcrumbs are correct on all 289+ HTML files
- [ ] Test Person schema (E-E-A-T) is properly formatted

### Accessibility
- [ ] Verify WCAG 2.1 AA compliance across all new pages
- [ ] Test keyboard navigation on dropdown menus
- [ ] Test screen reader compatibility with new structured data
- [ ] Verify all images have proper alt text

### Performance
- [ ] Optimize WebP image sizes for faster loading
- [ ] Test DNS prefetch effectiveness
- [ ] Run Google PageSpeed Insights on key pages
- [ ] Verify lazy loading is working for all images

---

## 🚀 PRIORITY RANKING

### P0 - Critical (User-facing issues)
1. **CRITICAL: Fix navigation on 281 pages (96% of site)** - Missing dropdown CSS/JS
2. **CRITICAL: Update code to use WebP images** - ~128 references across 12 files (77% size reduction not realized)
3. **Ship cards redesign** - Add CTAs, better space utilization, make cards compelling
4. Fix placeholder attributions (Symphony, Adventure, Enchantment, Explorer)
5. Download Wiki Commons images for top 5 most-visited ships
6. Apply production template if not done (dropdown menu fix)

### P1 - High (Content completeness)
4. Create logbooks for active ships without them (6 ships)
5. Download remaining Wiki Commons images (19 ships)
6. Complete venues.json with all dining data
7. SEO setup (sitemap, Google Search Console)

### P2 - Medium (Enhancement)
8. ICP-Lite & ITW-Lite rollout (see dedicated section below)
9. Create logbooks for historic ships (8 ships)
10. Add video data for ships without videos
11. Cross-linking improvements
12. Performance optimization

### P3 - Low (Nice to have)
13. Create logbooks for future ships (TBN)
14. New solo travel articles
15. Advanced analytics and monitoring

---

## 🤖 ICP-LITE & ITW-LITE ROLLOUT

> **Strategy:** Keep v3 architecture and progressive enhancement.
> **Protocol:** `standards/ITW-LITE_PROTOCOL_v3.010.lite.md` (AI-first, human-first).

### Protocol & Documentation Setup

- [ ] Add `standards/ITW-LITE_PROTOCOL_v3.010.lite.md`
  - [ ] Commit protocol file and link it from `STANDARDS_INDEX_33.md`
  - [ ] Ensure it stays < 500 lines and matches current v3.010 standards

- [ ] Root `CLAUDE.md` + AI wiring
  - [ ] Create or trim `CLAUDE.md` at repo root
  - [ ] Point to:
    - `standards/ITW-LITE_PROTOCOL_v3.010.lite.md`
    - `STANDARDS_INDEX_33.md`
    - `/dev/active/` dev-docs folder
  - [ ] Instruct any AI tools to read ITW-Lite + module specs before editing

### Phase 1 — ICP-Lite on Core Pages

**Ship pages (pilot: Radiance of the Seas)**

- [ ] `/ships/rcl/radiance-of-the-seas.html`
  - [ ] Add single `<h1>` in main content
  - [ ] Add "answer line" under H1 (what this page covers)
  - [ ] Add "fit-guidance" card (Who this ship tends to fit / who should look elsewhere)
  - [ ] Add 3–5 question FAQ block near bottom (+ ensure FAQ schema wired)
  - [ ] Add meta tags:
    - [ ] `meta name="ai:summary"`
    - [ ] `meta name="content-protocol" content="ICP-Lite v1.0"`
    - [ ] `meta name="last-reviewed"`
  - [ ] Update `<!-- ai-breadcrumbs ... -->` to reflect answer & fit-guidance

- [ ] Roll out same pattern (H1 + answer line + FAQ + fit-guidance + ai:summary) to:
  - [ ] `/ships/` other Royal pages
  - [ ] High-traffic or "anchor" ship pages (top 5–10)

**Hub pages**

- [ ] `/index.html` (Home)
  - [ ] Add H1 + answer line for the whole site
  - [ ] Add small fit-guidance/prose section (who this site helps most)
  - [ ] Add 3–5 FAQ entries about In the Wake

- [ ] `/solo.html`
  - [ ] Add H1 + answer line
  - [ ] Add solo-specific fit-guidance (who solo content is for)
  - [ ] Add solo FAQ block

- [ ] `/drinks-calculator.html` or `/planning/drink-packages.html` (wherever canonical lives)
  - [ ] Add H1 + answer line (what the calculator helps answer)
  - [ ] Add FAQ (break-even, port days, skipping packages, etc.)

### Phase 2 — JS Failure & Progressive Enhancement

- [ ] Implement `.no-js` baseline globally
  - [ ] Add `class="no-js"` to `<html>`
  - [ ] Add early script to remove `no-js`
  - [ ] Add CSS:
    - [ ] `.no-js .fallback { display:block; }`
    - [ ] `.no-js .js-only { display:none; }`

- [ ] Add HTML fallbacks + graceful failure wrappers for:
  - [ ] Ship stats blocks (static snapshot when JSON/JS fails)
  - [ ] Dining venues lists (basic HTML list + JS enhancement)
  - [ ] Logbook/story blocks (static story or "Stories coming soon")
  - [ ] Video/Swiper sections (stacked figures when JS fails)
  - [ ] Live tracker/map modules (friendly "map temporarily unavailable" text)

- [ ] Verify pages with JS disabled:
  - [ ] Radiance ship page is fully readable and honest
  - [ ] Solo hub remains usable
  - [ ] Home page remains usable
  - [ ] Drink calculator falls back gracefully where possible

### Phase 3 — Optional Deep ICP (Only If ROI Justifies)

- [ ] Monitor:
  - [ ] AI citations (ChatGPT / Perplexity / Gemini referencing ITW)
  - [ ] Search referral traffic to ship pages
  - [ ] Engagement with new sections (FAQ, fit-guidance)

- [ ] If clear uplift:
  - [ ] Consider selective static pre-rendering of heavy JSON-driven sections
  - [ ] Add more fine-grained section/entity annotations (comments or JSON-LD)
  - [ ] Keep *all* AI-facing constructs hidden (comments/meta/JSON-LD), never visible UI

---

## 📈 PROGRESS SUMMARY

**Images:**
- ✅ Complete: 11 ships (FOM images)
- ✅ Complete: 8 ships (user uploaded)
- ⏳ In Progress: 19 ships (Wiki Commons categories found, need download)
- ❓ Research: 2-5 ships (Star of the Seas, Nordic Prince, duplicates)
- ⏭️ Future: 7 ships (TBN - no photos yet)

**Logbooks:**
- ✅ Complete: 28 ships
- ⏳ Needed: 22 ships (6 active, 8 historic, 8 future/TBN)

**Templates:**
- ✅ v3.010.300 production-ready template created
- ⏳ Deployment status unknown (may be complete)

**SEO:**
- ✅ Template includes comprehensive SEO
- ⏳ Need to set up external tools (GSC, Bing)

**Attribution:**
- ✅ Template and process documented
- ⏳ 4 ships need attribution fixes
- ⏳ 2 ships need attribution sections when images added

---

## 📋 NEXT STEPS

**Immediate actions:**
1. Prioritize fixing attribution for Symphony, Adventure, Enchantment, Explorer
2. Start downloading Wiki Commons images for most popular ships
3. Verify template deployment status
4. Create logbooks for active ships missing them

**This week:**
5. Complete Wiki Commons image downloads for all 19 ships
6. Convert all images to WebP
7. Set up Google Search Console and Bing Webmaster Tools
8. Create sitemap.xml

**This month:**
9. Complete all logbooks for active and historic ships
10. Performance optimization pass
11. Analytics and monitoring setup
12. User feedback collection on new features

---

**Last Updated:** 2025-11-17
**Maintained by:** Claude AI (Thread tracking)
