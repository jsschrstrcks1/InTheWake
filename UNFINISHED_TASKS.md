# Unfinished Tasks - Both Threads

**Generated:** 2025-11-17
**Last Updated:** 2025-11-19 (Verified completion status - search.html EXISTS, 38/50 logbooks complete)
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

### Ships Missing Logbooks (12 ships - VERIFIED 2025-11-19)

**Future Ships (8 ships - cannot create content yet):**
- [ ] Discovery-class ship TBN - Create placeholder logbook (when ship announced)
- [ ] Icon-class ship TBN 2027 - Create placeholder logbook (when ship announced)
- [ ] Icon-class ship TBN 2028 - Create placeholder logbook (when ship announced)
- [ ] Oasis-class ship TBN 2028 - Create placeholder logbook (when ship announced)
- [ ] Quantum Ultra-class ship TBN 2028 - Create placeholder logbook (when ship announced)
- [ ] Quantum Ultra-class ship TBN 2029 - Create placeholder logbook (when ship announced)
- [ ] Star-class ship TBN 2028 - Create placeholder logbook (when ship announced)
- [ ] Legend of the Seas Icon-class 2026 - Create placeholder logbook (when ship announced)

**Duplicate Pages (2 pages - consider consolidation instead):**
- [ ] legend-of-the-seas-1995-built - Duplicate of legend-of-the-seas.html
- [ ] star-of-the-seas-aug-2025-debut - Duplicate of star-of-the-seas.html

**Historic Ships Actually Needing Logbooks (2 ships):**
- [ ] Nordic Prince - Create historic logbook
- [ ] Sun Viking - Create historic logbook

**Current Ships with Logbooks (38 ships - VERIFIED COMPLETE):**
- ✅ Adventure of the Seas
- ✅ Allure of the Seas
- ✅ Anthem of the Seas
- ✅ Brilliance of the Seas
- ✅ Enchantment of the Seas
- ✅ Explorer of the Seas
- ✅ Freedom of the Seas
- ✅ Grandeur of the Seas
- ✅ Harmony of the Seas
- ✅ Icon of the Seas
- ✅ Independence of the Seas
- ✅ Jewel of the Seas
- ✅ Legend of the Seas
- ✅ Liberty of the Seas
- ✅ Majesty of the Seas
- ✅ Mariner of the Seas
- ✅ Monarch of the Seas
- ✅ Navigator of the Seas
- ✅ Nordic Empress
- ✅ Oasis of the Seas
- ✅ Odyssey of the Seas
- ✅ Ovation of the Seas
- ✅ Quantum of the Seas
- ✅ Radiance of the Seas
- ✅ Rhapsody of the Seas
- ✅ Serenade of the Seas
- ✅ Song of America
- ✅ Song of Norway
- ✅ Sovereign of the Seas
- ✅ Spectrum of the Seas
- ✅ Splendour of the Seas
- ✅ Star of the Seas
- ✅ Symphony of the Seas
- ✅ Utopia of the Seas
- ✅ Viking Serenade
- ✅ Vision of the Seas
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
- [x] ~~Create sitemap.xml~~ - ✅ EXISTS (11,112 bytes at /sitemap.xml, also /solo/sitemap.xml)
- [ ] Set up Google Search Console
- [ ] Set up Bing Webmaster Tools
- [x] ~~Add search functionality for SearchAction schema~~ - ✅ search.html EXISTS

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

### CRITICAL: Placeholder Content Pages Need Completion
**Status:** Pages exist but contain placeholder/"coming soon" content only

- [ ] `/drinks.html` - Complete content (currently just "coming soon" meta description)
  - Content needed: Drink packages overview, beverage policies, price calculator intro
- [ ] `/ports.html` - Remove "Under Construction" notice and add real content
  - Content needed: Port guides, accessibility information, practical travel tips
- [ ] `/restaurants.html` - Replace "This page is currently being built" with actual content
  - Content needed: Dining guides, menus, restaurant recommendations
- [ ] Disability-at-Sea articles - JavaScript shows "coming soon", needs actual content
  - Content needed: Disability-focused travel articles

### Solo Travel & Life Journey Articles
**Status:** Analyzed all 32 logbooks - identified 5 core article categories (159 references, 180 themes)
**Analysis Document:** `admin/FIVE_ARTICLE_CATEGORIES.md`

**THE 5 ARTICLE CATEGORIES:**

#### 1. In the Wake of Grief: When Loss Needs Water
**Status:** ✅ COMPLETE - Grade A+ (722 lines, ~6,000 words)
**Location:** `/solo/in-the-wake-of-grief.html`
**Meta tags:** `/solo/in-the-wake-of-grief-meta.html`

- [x] Write full article page (~6,000 words with all enhancements)
- [x] H1 with dek + fit-guidance section
- [x] FAQ section (5 comprehensive questions with structured data)
- [x] Ship size recommendations (Option A: smaller/longer vs Option B: larger/shorter)
- [x] Anticipatory grief section ("Final Cruises: When the Journey Is About Legacy")
- [x] Cross-links throughout to solo guide, accessibility guide, ship logbooks
- [x] Back-links added to 7 logbook stories → article
- [x] Meta tags with JSON-LD Article and FAQ schemas
- [ ] Optional: Expand suicide loss and dating again sections (from original outline)

**Topics covered:** Timing after loss, solo after being a couple, first holidays (Margaret's Christmas), finding widow community, permission to feel joy, Scripture/faith integration, practical booking tips, ship size by grief need, anticipatory grief/final cruises, trigger management, anonymous community

**Key logbook stories referenced:** "The Widow Who Learned to Laugh Again" (Radiance), "Widower's First Christmas" (Grandeur, Jewel), "The FlowRider Widow" (Independence), "First Voyage After Loss" (Brilliance), "Grandpa's Last Alaska" (Radiance), "Grandmother's Last Gift" (Jewel)

**Cross-links implemented:** Solo travel guide (3x), accessibility guide (2x), Grandeur logbook, 5 widow/widower logbook stories, /solo/ hub, /ships/ index

**Back-links from logbooks:** Radiance (2), Brilliance (1), Grandeur (1), Jewel (2), Independence (1)

#### 2. Accessible Cruising: Complete Guide for Travelers with Disabilities
**Status:** ✅ COMPLETE (solo/articles/accessible-cruising.html) - 26 logbook references
- [x] Full article exists with 5 universal principles
- [ ] Consider minor expansion: medical equipment, service animals, dietary restrictions, cruise line comparison
- **Topics covered:** Wheelchair, autism, stroke recovery, deaf/hard-of-hearing, chronic illness, PTSD, invisible disabilities
- **Key logbook stories:** "The Wheelchair Dance" (Brilliance), "Autistic Boy Who Found His Voice" (Radiance), "Stroke Survivor Who Walked Again" (Radiance), "Deaf Family's Inclusive Experience" (Explorer)

#### 3. Solo Cruising: Your Complete Guide to Traveling Alone at Sea
**Status:** ⚠️ PARTIAL (why-i-started-solo-cruising.html exists but not comprehensive) - 20 logbook references
- [ ] Expand existing article OR create new comprehensive-solo-cruising.html
- [ ] Cover all solo personas: grief, anxiety, introverts, by-choice, first-time solo
- [ ] Add ship size recommendations for solo travelers
- [ ] FAQ: dining alone, safety, meeting people, solo supplements, shore excursions
- **Topics needed:** Transitioning from couple to solo travel, anxiety/introvert accommodation, widow/widower solo travel, choosing ships
- **Key logbook stories:** "The Widow Who Learned to Laugh Again" (Radiance), "Single Mom's First Solo Trip" (Grandeur), "Introvert's Forced Vacation" (Independence), "Anxiety Sufferer's Controlled Exposure" (Explorer)
- **Cross-links:** Cruising After Loss, accessibility (many disabled cruise solo), packing lists

#### 4. Healing Relationships at Sea: Marriage, Family, and Reconciliation
**Status:** ❌ NOT CREATED (15+ logbook references)
- [ ] Write full article page (~3,000 words)
- [ ] Create article fragment for rail navigation
- [ ] Separate sections: marriage restoration, family reconciliation, blended families, empty nest
- **Topics:** Marriage crisis/infidelity recovery, estranged parent-child relationships, prodigal situations, blended family dynamics, empty nest reconnection, faith-based reconciliation, when NOT to cruise together
- **Key logbook stories:** "The Glacier That Healed a Marriage" (Radiance), "Balcony That Saved Us" (Brilliance), "Couple Who Renewed Vows After Infidelity" (Grandeur), "Prodigal Son Returns" (Radiance, Explorer, Navigator, Serenade), "Blended Family's First Vacation" (Explorer, Jewel), "Empty Nest Reconnection" (Explorer, Serenade)
- **Cross-links:** Couples packing list, ship selection guides, marriage enrichment resources, solo travel (if not ready to travel together)

#### 5. Rest for Wounded Healers: Travel for Pastors, Caregivers, and the Burned-Out
**Status:** ❌ NOT CREATED (10+ logbook references)
- [ ] Write full article page (~2,500 words)
- [ ] Create article fragment for rail navigation
- [ ] Sabbath theology section, guilt management, Scripture integration
- **Topics:** Pastoral/ministry burnout, missionary sabbatical, teacher/helping professional exhaustion, caregiver fatigue, single parent burnout, seminary student rest, retired minister transition, rest as spiritual discipline, unplugging from ministry
- **Key logbook stories:** "Learning to Sabbath" (Radiance), "Learning to Rest" (Brilliance), "Retired Pastor's Sabbath" (Grandeur), "Seminary Student's Sabbath" (Jewel), "Teacher's First Summer Break in Years" (Liberty), "Single Mom's First Solo Trip" (Grandeur)
- **Cross-links:** Solo travel, mental health resources, pastoral sabbatical packing, anxiety travel

**Existing support articles (COMPLETE):**
- ✅ freedom-of-your-own-wake.html
- ✅ visiting-the-united-states-before-your-cruise.html

**Additional themes for future articles (2-10 references each):**
- Medical recovery: post-cancer travel, post-stroke travel, chronic illness, eating disorder recovery
- Mental health: anxiety travel, PTSD/veteran travel, bipolar/depression
- Family situations: infertility grief, adoption/adoptee identity, homeschool family socialization, kinship care
- Specific demographics: senior travel, neurodiversity, deaf/HOH travel, burn survivors
- Life transitions: retirement, second marriage/stepfamily, work-life balance

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

### ~~CRITICAL: Search Functionality Implementation~~ ✅ COMPLETE
**Status:** ✅ search.html EXISTS (verified 2025-11-19)
**Note:** SearchAction schema now points to working search page

- [x] ~~Create `/search.html` page~~ - ✅ EXISTS
- [ ] Verify search backend/functionality works correctly
- [ ] Verify site-wide search UI component
- [ ] Verify SearchAction schema target wired correctly
- [ ] Test search across ships, restaurants, articles, cruise lines
- [ ] Add search indexing for JSON data (logbooks, venues, stats)

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
1. ~~**CRITICAL: Fix navigation on 281 pages (96% of site)**~~ - ✅ COMPLETE (done in main)
2. ~~**CRITICAL: Update code to use WebP images**~~ - ✅ COMPLETE (done in main, commit ecdb983)
3. **Ship cards redesign** - Add CTAs, better space utilization, make cards compelling
4. Fix placeholder attributions (Symphony, Adventure, Enchantment, Explorer)
5. Download Wiki Commons images for top 5 most-visited ships

### P1 - High (Content completeness)
6. ~~**CRITICAL: Write "Cruising After Loss" article**~~ - ✅ COMPLETE as "In the Wake of Grief" (722 lines, Grade A+)
7. **CRITICAL: Expand "Solo Cruising" article** - 20 logbook references, current article too narrow
8. **CRITICAL: Write "Healing Relationships at Sea" article** - 15+ logbook references, unique positioning
9. **CRITICAL: Write "Cruising for Rest & Recovery" article** - 25 logbook references, burnout/mental health
10. **CRITICAL: Write "Family Cruising Challenges" article** - 20 logbook references, blended/adoptive families
11. ~~**CRITICAL: Create search functionality**~~ - ✅ search.html EXISTS
12. **CRITICAL: Complete placeholder content pages** - drinks.html, ports.html, restaurants.html (all "coming soon")
13. **CRITICAL: Create missing protocol docs** - ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md (all missing)
14. ~~Create logbooks for active ships without them~~ - ✅ All active ships have logbooks (only 2 historic missing: nordic-prince, sun-viking)
15. Download remaining Wiki Commons images (19 ships) + attribution workflow
16. Complete venues.json with all dining data
17. ~~SEO setup (sitemap)~~ - ✅ sitemap.xml EXISTS; still need Google Search Console setup

### P2 - Medium (Enhancement)
18. Expand "Accessible Cruising" article (optional) - Article exists but could add: medical equipment, service animals, dietary, cruise line comparison
19. ICP-Lite & ITW-Lite rollout (see dedicated section below)
20. Create logbooks for historic ships (8 ships)
21. Add video data for ships without videos
22. Cross-linking improvements
23. Performance optimization

### P3 - Low (Nice to have)
24. Create logbooks for future ships (TBN)
25. Additional themed articles (medical recovery, mental health, family situations, life transitions)
26. Advanced analytics and monitoring

---

## 🤖 ICP-LITE & ITW-LITE ROLLOUT

> **Strategy:** Keep v3 architecture and progressive enhancement.
> **Protocol:** `standards/ITW-LITE_PROTOCOL_v3.010.lite.md` (AI-first, human-first).
>
> **CURRENT STATUS (verified 2025-11-19):**
> - Only ~20 pages have ICP-Lite meta tags (content-protocol, ai-summary)
> - 409 total HTML pages in repository
> - **Coverage: ~5%** - NOT site-wide, hub pages only
> - Protocol docs still missing (ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md)

### Protocol & Documentation Setup

- [ ] Create `standards/ITW-LITE_PROTOCOL_v3.010.lite.md`
  - [ ] Write protocol document (< 500 lines)
  - [ ] Ensure matches current v3.010 standards
  - [ ] Document AI-first, human-first strategy

- [ ] Create `STANDARDS_INDEX_33.md` master index
  - [ ] Link all protocol documents
  - [ ] Link ITW-LITE_PROTOCOL
  - [ ] Create navigation for standards directory

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

**Logbooks (VERIFIED 2025-11-19):**
- ✅ Complete: 38 ships
- ⏳ Needed: 12 ships (2 historic, 8 future/TBN, 2 duplicates)
- 🎯 Actual work: Only nordic-prince and sun-viking need new logbooks

**SEO (VERIFIED 2025-11-19):**
- ✅ sitemap.xml EXISTS (11KB)
- ✅ search.html EXISTS
- ⏳ Need to set up external tools (GSC, Bing)

**ICP-Lite (VERIFIED 2025-11-19):**
- ⏳ Only ~20/409 pages (~5%) have ICP-Lite meta tags
- ❌ Protocol docs missing (ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md)
- ⏳ Site-wide rollout NOT complete

**Templates:**
- ✅ v3.010.300 production-ready template created
- ⏳ Deployment status unknown (may be complete)

**Attribution:**
- ✅ Template and process documented
- ⏳ 4 ships need attribution fixes
- ⏳ 2 ships need attribution sections when images added

---

## 📋 NEXT STEPS

**Immediate actions (verified priorities):**
1. **CRITICAL: Create protocol docs** - ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md all missing
2. **Write remaining 3 articles** - Rest & Recovery, Family Challenges, Healing Relationships
3. **Complete placeholder pages** - drinks.html, ports.html, restaurants.html need real content
4. Fix attribution for Symphony, Adventure, Enchantment, Explorer

**This week:**
5. ~~Create sitemap.xml~~ - ✅ Already exists
6. ~~Create search.html~~ - ✅ Already exists
7. Set up Google Search Console and Bing Webmaster Tools
8. Create 2 historic ship logbooks (nordic-prince, sun-viking)

**This month:**
9. ICP-Lite site-wide rollout (currently only ~5%)
10. Download Wiki Commons images for 19 ships
11. Performance optimization pass
12. Analytics and monitoring setup

---

**Last Updated:** 2025-11-19 (Verified completion: search.html EXISTS, sitemap EXISTS, 38/50 logbooks complete, ICP-Lite only 5% complete)
**Maintained by:** Claude AI (Thread tracking)
