# Unfinished Tasks

**Purpose:** Queue of tasks waiting to be worked on. Check IN_PROGRESS_TASKS.md before starting.
**Last Updated:** 2025-11-27
**Maintained by:** Claude AI (Thread tracking)

---

## How This File Works

1. Tasks are organized by priority (P0 = Critical, P1 = High, P2 = Medium, P3 = Low, P4 = Future)
2. Before starting a task, check IN_PROGRESS_TASKS.md for conflicts
3. When starting, move the task to IN_PROGRESS_TASKS.md
4. When complete (user confirmed), move to COMPLETED_TASKS.md

---

## P0 - Critical (User-facing issues)

### Fix Duplicate Dropdown JavaScript (15 files)
**Status:** IN PROGRESS - See IN_PROGRESS_TASKS.md
**Impact:** Duplicate JS causing potential issues

Files affected:
- [ ] about-us.html
- [ ] accessibility.html
- [ ] cruise-lines.html
- [ ] offline.html
- [ ] packing-lists.html
- [ ] planning.html
- [ ] admin/reports/articles.html
- [ ] cruise-lines/carnival.html
- [ ] cruise-lines/celebrity.html
- [ ] cruise-lines/disney.html
- [ ] cruise-lines/msc.html
- [ ] cruise-lines/norwegian.html
- [ ] cruise-lines/princess.html
- [ ] cruise-lines/viking.html
- [ ] cruise-lines/virgin.html

### Fix Placeholder Image Attributions (4 ships)
- [ ] Symphony of the Seas - Get proper Wiki Commons URLs
- [ ] Adventure of the Seas - Get proper Wiki Commons URLs
- [ ] Enchantment of the Seas - Add proper attributions for 5 images
- [ ] Explorer of the Seas - Get proper Wiki Commons URLs

### Stateroom Checker Tool - RCL Fleet Expansion
**Status:** Currently supports 3 ships (Icon of the Seas, Quantum of the Seas, Radiance of the Seas)
**Impact:** Major user engagement feature - expand to all 28 active RCL ships
**Data Required:** Cabin exception data for each ship (view obstructions, noise issues, motion sensitivity, connecting doors)

**Ships Needing Data (25 ships):**
- [ ] Adventure of the Seas
- [ ] Allure of the Seas
- [ ] Anthem of the Seas
- [ ] Brilliance of the Seas
- [ ] Enchantment of the Seas
- [ ] Explorer of the Seas
- [ ] Freedom of the Seas
- [ ] Grandeur of the Seas
- [ ] Harmony of the Seas
- [x] Icon of the Seas ✅
- [ ] Independence of the Seas
- [ ] Jewel of the Seas
- [ ] Liberty of the Seas
- [ ] Mariner of the Seas
- [ ] Navigator of the Seas
- [ ] Oasis of the Seas
- [ ] Odyssey of the Seas
- [ ] Ovation of the Seas
- [x] Quantum of the Seas ✅
- [ ] Serenade of the Seas
- [ ] Spectrum of the Seas
- [ ] Star of the Seas
- [ ] Symphony of the Seas
- [ ] Utopia of the Seas
- [ ] Vision of the Seas
- [ ] Voyager of the Seas
- [ ] Wonder of the Seas

**Data Structure:** JSON file per ship at `/assets/data/staterooms/stateroom-exceptions.{ship-slug}.v2.json`
**Exception Flags:** VIEW_PARTIAL_OVERHANG, VIEW_OBSTRUCTED_LIFEBOAT, VIEW_OBSTRUCTED_STRUCTURAL, NOISE_POOL_ABOVE, NOISE_MULTIDECK_ATRIUM, NOISE_ELEVATOR_TRAFFIC, NOISE_THEATER_BELOW, NOISE_GALLEY_ABOVE, MOTION_FORWARD, MOTION_AFT, MOTION_HIGH_DECK, CONNECTING_DOOR

**Process per Ship:**
1. Research cabin quirks from CruiseCritic, CruiseMummy, Reddit, DeckPlans
2. Generate JSON with cabin ranges, flags, evidence summaries, trust scores
3. Test on stateroom-check.html (update ship dropdown)
4. Document sources and verification

---

## P1 - High (Content completeness)

### Articles to Write (3 remaining)

#### Solo Cruising Expansion
**Status:** Partial - why-i-started-solo-cruising.html exists but not comprehensive
- [ ] Expand existing article OR create comprehensive-solo-cruising.html
- [ ] Cover all solo personas: grief, anxiety, introverts, by-choice, first-time
- [ ] Add ship size recommendations for solo travelers
- [ ] FAQ: dining alone, safety, meeting people, solo supplements

#### Healing Relationships at Sea
**Status:** Not created (15+ logbook references)
- [ ] Write full article page (~3,000 words)
- [ ] Sections: marriage restoration, family reconciliation, blended families, empty nest
- [ ] Topics: marriage crisis recovery, estranged relationships, prodigal situations

#### Rest for Wounded Healers
**Status:** Not created (10+ logbook references)
- [ ] Write full article page (~2,500 words)
- [ ] Topics: pastoral burnout, caregiver fatigue, single parent burnout
- [ ] Sabbath theology section, guilt management, Scripture integration

### Protocol Documentation (Missing)
- [ ] Create standards/ITW-LITE_PROTOCOL_v3.010.lite.md
- [ ] Create STANDARDS_INDEX_33.md master index
- [ ] Create/update root CLAUDE.md with AI wiring

### Complete Placeholder Content Pages
- [ ] /ports.html - Main hub page content (142 individual pages exist)
- [ ] /drinks.html - Drink packages overview, beverage policies
- [ ] /restaurants.html - Replace "being built" with actual content

### SEO External Tools Setup
- [ ] Set up Google Search Console
- [ ] Set up Bing Webmaster Tools
- [ ] Set up Google Analytics dashboard for trackers

---

## P2 - Medium (Enhancement)

### Port Expansion - Middle East (4 ports)
- [ ] Dubai, UAE
- [ ] Abu Dhabi, UAE
- [ ] Muscat, Oman
- [ ] Salalah, Oman

### Port Expansion - Caribbean Completion (8-10 ports)
- [ ] Antigua (St. John's)
- [ ] St. Lucia (Castries)
- [ ] Barbados (Bridgetown)
- [ ] St. Kitts
- [ ] Grenada (St. George's)
- [ ] Martinique (Fort-de-France)
- [ ] Guadeloupe (Pointe-à-Pitre)
- [ ] Dominica (Roseau)

### Image Tasks

#### Download Wiki Commons Images (19 ships)
After downloading, must add attribution sections to HTML.

**Active Ships (10):**
- [ ] Allure of the Seas
- [ ] Anthem of the Seas
- [ ] Icon of the Seas
- [ ] Independence of the Seas
- [ ] Navigator of the Seas
- [ ] Odyssey of the Seas
- [ ] Quantum of the Seas
- [ ] Spectrum of the Seas
- [ ] Voyager of the Seas
- [ ] Wonder of the Seas

**Historic/Retired Ships (9):**
- [ ] Sovereign of the Seas
- [ ] Monarch of the Seas
- [ ] Legend of the Seas
- [ ] Splendour of the Seas
- [ ] Nordic Empress
- [ ] Song of Norway
- [ ] Song of America
- [ ] Viking Serenade
- [ ] Sun Viking

#### Image Processing
- [ ] Convert downloaded images to WebP format
- [ ] Move to /assets/ships/ directory
- [ ] Rename to pattern: {ship-slug}1.webp, etc.

#### Image Research
- [ ] Star of the Seas - Search for construction photos
- [ ] Nordic Prince - Search for historic ship images
- [ ] Verify duplicate ships (Legend, Star variants)

### Cruise Line Hub Page Attributions
- [ ] Carnival.html - Replace placeholders with credited media
- [ ] Celebrity.html - Replace placeholders with credited media
- [ ] Disney.html - Replace placeholders with credited media
- [ ] Holland America.html - Replace placeholders with credited media
- [ ] MSC.html - Replace placeholders with credited media

### Data Completion
- [ ] Complete /assets/data/venues.json with all dining venues
- [ ] Map each ship to its specific venues
- [ ] Add pricing information for specialty restaurants
- [ ] Find YouTube ship tour videos for ships without videos

### Technical Tasks
- [ ] Verify WCAG 2.1 AA compliance across new pages
- [ ] Test keyboard navigation on dropdown menus
- [ ] Test screen reader compatibility
- [ ] Verify all images have proper alt text
- [ ] Run Google PageSpeed Insights on key pages
- [ ] Verify lazy loading for all images

### ICP-Lite Content Enhancements
- [ ] Add H1 + answer line to pilot ship pages
- [ ] Add fit-guidance cards to ship pages
- [ ] Add FAQ blocks with structured data
- [ ] Implement .no-js baseline globally

---

## P3 - Low (Nice to have)

### Port Expansion - Asia (10-15 ports)
- [ ] Osaka, Japan
- [ ] Busan, South Korea
- [ ] Taipei, Taiwan
- [ ] Phuket, Thailand
- [ ] Manila, Philippines
- [ ] Ho Chi Minh City, Vietnam
- [ ] Halong Bay, Vietnam
- [ ] Penang, Malaysia
- [ ] Colombo, Sri Lanka

### Port Expansion - Australia & South Pacific (15-20 ports)
- [ ] Sydney, Australia
- [ ] Melbourne, Australia
- [ ] Brisbane, Australia
- [ ] Auckland, New Zealand
- [ ] Wellington, New Zealand
- [ ] Fiji ports
- [ ] New Caledonia
- [ ] Vanuatu

### Multi-Cruise-Line Tracker Enhancement
- [ ] Cruise line selector dropdown on Port/Ship Tracker
- [ ] Separate ship databases per cruise line
- [ ] Cross-line tracking and achievements

### UI/UX Enhancements
- [ ] Design article rail navigation pattern
- [ ] Implement article rail site-wide
- [ ] Review intelligent breadcrumbs implementation

### Additional Themed Articles
- [ ] Medical recovery articles (post-cancer, post-stroke, chronic illness)
- [ ] Mental health articles (anxiety, PTSD/veteran, bipolar/depression)
- [ ] Family situation articles (infertility grief, adoption, homeschool)
- [ ] Demographic articles (senior travel, neurodiversity, burn survivors)
- [ ] Life transition articles (retirement, second marriage, work-life balance)

---

## P4 - Future Expansion (Post Royal Caribbean completion)

### Carnival Cruise Line Expansion (150-200 ports)
**Timeline:** 2026-2027+ (after Royal Caribbean core complete)
**Fleet:** 29 ships, 320+ unique ports

Phases:
- Phase 1: Carnival private islands + Caribbean unique (20-25 ports)
- Phase 2: Europe unique ports (40-50 ports)
- Phase 3: Australia/NZ/Pacific region (30-35 ports)
- Phase 4: Asia expansion (15-20 ports)
- Phase 5: South America/Africa/exotic (40-50 ports)

### Virgin Voyages Expansion (15-20 ports)
**Timeline:** 2027+
**Fleet:** 4 ships, ~120 curated ports

### Other Cruise Line Expansions
- [ ] Princess Cruises
- [ ] Norwegian Cruise Line
- [ ] Celebrity Cruises
- [ ] MSC Cruises
- [ ] Holland America Line

---

## Ship Logbooks - Future Ships (Cannot create yet)

These require ship names to be announced:
- [ ] Discovery-class ship TBN
- [ ] Icon-class ship TBN 2027
- [ ] Icon-class ship TBN 2028
- [ ] Oasis-class ship TBN 2028
- [ ] Quantum Ultra-class ship TBN 2028
- [ ] Quantum Ultra-class ship TBN 2029
- [ ] Star-class ship TBN 2028
- [ ] Legend of the Seas Icon-class 2026

---

## Duplicate Pages to Consolidate

- [ ] legend-of-the-seas-1995-built.html (duplicate of legend-of-the-seas.html)
- [ ] star-of-the-seas-aug-2025-debut.html (duplicate of star-of-the-seas.html)

---

## Reference Documents

For detailed planning, see:
- PORT_TRACKER_ROADMAP.md - Port expansion priorities and timeline
- admin/FIVE_ARTICLE_CATEGORIES.md - Article categories with logbook references
- assets/data/ports/*-master-list.md - Cruise line port inventories

---

**Related Files:**
- `IN_PROGRESS_TASKS.md` - Tasks currently being worked on
- `COMPLETED_TASKS.md` - Archive of finished work
**END OF HISTORICAL TASK ARCHIVE**

This archive is maintained additively - tasks are never removed from this section, only marked as complete. New completed tasks will be added as they are verified and removed from the active task list above.

## AUDIT #2 SUMMARY (2025-11-23)

**Verified After Rebase:**
- ✅ Service Worker v13.0.0 (maxPages: 400, maxAssets: 150, maxImages: 600, maxData: 100)
- ✅ Precache Manifest v13.0.0 (52 resources precached)
- ✅ ICP-Lite: 544/561 pages (97% coverage)
- ✅ Port pages: 147 total, 141 with LCP preload hints, 0 with under construction notices
- ✅ Ship pages: 50 total, all with responsive hero logo, all using WebP in meta tags
- ✅ Ship cards redesign COMPLETE (item-cards.css v1.0.0)
- ✅ Port Tracker & Ship Tracker COMPLETE
- ✅ Hawaii port batch COMPLETE (5 ports)
- ❌ REGRESSIONS: None found

**Major Progressions Documented:**
1. Under construction notices ALL REMOVED (was 6, now 0)
2. LCP preload hints on 141 pages (was documented as 30)
3. WebP meta tags COMPLETE on all 50 ship pages (was listed as P0 pending)
4. Ship cards redesign COMPLETE with enhanced CTAs (was P0 pending)

## THREAD-SAFETY WORK COMPLETED (claude/normalize-shell-thread-safety-01GkL7yZ6U6k7fE5xy13cFiw)

**Verified Complete 2025-11-22 (Merged to main in PR #172):**
- ✅ Service Worker updated to v13.0.0
  - maxPages: 100 → 400 (site has 561 pages)
  - maxData: 50 → 100 (was over limit at 76 JSON files)
  - maxImages: 500 → 600 (currently 285 ship images)
  - maxAssets: 100 → 150
- ✅ Precache Manifest updated to v13.0.0 (52 resources precached, was 25)
- ✅ Shell normalization: 141+ port pages cleaned (under construction notices removed)
- ✅ Hero logo normalization: 50 ship pages updated to responsive srcset format with fetchpriority="high"
- ✅ LCP preload hints: Added to 141 port pages (96% of all port pages)

---

## 📋 NEW TASK LIST - Site-Wide Pattern Standardization (2025-11-25)

**Context:** Comprehensive site-wide audit revealed inconsistent patterns across pages. Need to standardize all pages to match `index.html` reference pattern for right rail, author cards, article cards, hero sizing, and footer text.

**Reference Pattern:** `index.html` established as canonical pattern for:
- Right rail structure (Quick Answer, Best For, Key Facts, Author Card, Article Card)
- Hero sizing and logo placement
- Footer text format
- FAQ placement

### P0 - Critical (Design System Compliance)

#### index.html
- [ ] Move FAQ beneath cards for accessibility and About Us (not beneath article rail)
- [ ] Fix "in the wake" → "cruising in the wake" in FAQ section (manual, not script)
- [ ] Lower logo to match planning.html placement (currently goes outside viewable area)

#### planning.html
- [ ] Link travel advisor reference to Tina
- [ ] Update article rails to match index.html pattern (currently outdated with just image + title, missing CTA and Read Article button)

#### ships.html
- [ ] Add right rail: At a Glance, Key Facts (above Author Card and Article Card)
- [ ] Use index.html pattern for Author and Article cards
- [ ] Combine duplicate "Royal Caribbean ships organized by class" cards (one with search, one without)
- [ ] Set all class sections to start closed EXCEPT Icon class
- [ ] Hide/comment out "Ship layout" and "Where is the ship" sections
- [ ] Remove "Recent Stories" and "From the Journal" duplication
- [ ] Rebuild author/article section based on index.html pattern
- [ ] Fix logo sticking off top of viewable area

#### restaurants-and-menus.html
- [ ] Add right rail: Quick Answer, Key Facts, Best For
- [ ] Add Author and Article cards below (index.html style)
- [ ] Vary images (currently generic cloche on everything)
- [ ] Standardize FAQ to match other pages' pattern
- [ ] Cross-reference pass: ensure every venue links to page, mark missing pages
- [ ] Move "114 venues loaded" message to beneath header hero OR beneath footer (current placement wrong)
- [ ] Shred/replace article and author cards with index.html pattern
- [ ] Fix logo sticking above viewable area (match planning pattern)

#### ports.html (Port Index)
- [ ] Add right rail: Quick Answer, Key Facts, Best For, etc
- [ ] Add Author Card and Article Card beneath
- [ ] Shred/replace existing author/article cards with index.html pattern
- [ ] Cross-linking pass: link ports with HTML pages that aren't currently linked
- [ ] Document ports mentioned but lacking pages → add to tasks
- [ ] Fix logo sticking outside viewable area (match planning)

#### drink-packages.html
- [ ] Add right rail: Quick Answer, Best For, Key Facts
- [ ] Add Author Card and Article Card below
- [ ] Add content: Crown and Anchor loyalty status grants 4-6 free beverages/day
- [ ] Investigate: logo well-placed here but lower than planning, viewable area bigger

#### stateroom-check.html
- [ ] Add remaining ships to stateroom check tool
- [ ] Add right rail: Quick Answer, Best For, Key Facts, Author Card, Article Card (index style)
- [ ] Standardize header hero size (currently bigger than planning)
- [ ] Resize hero while keeping horizon centered in viewport
- [ ] Ensure logo stays within frame (all pages should match)

#### cruise-lines.html
- [ ] Fix divergent header hero structure (replicate packing pattern)
- [ ] Add right rail: Quick Answer, How to Use, Key Facts, Author Card, Article Card
- [ ] Standardize FAQ section to match other pages

#### packing-lists.html
- [ ] FIX: Infinite scroll bug
- [ ] Move author/article rails up (currently way far down)
- [ ] Shred/replace with index.html pattern

#### accessibility.html
- [ ] Move author card right beneath Key Facts (not down by FAQ)
- [ ] Standardize header hero and logo to match planning page

#### travel.html
- [ ] Fix divergent header hero shape (replicate planning)
- [ ] Update author/article cards to match index.html pattern
- [ ] FIX: Hundreds of pages of dead space before footer

#### solo.html (Solo Cruising Index)
- [ ] INVESTIGATE: Article fragments not loading - propose fix
- [ ] PREFER: Fix solo page frag loader (not the frags)
- [ ] IF frags carelessly altered: restore to frag format
- [ ] Update author card to index.html pattern, add Tina after Ken
- [ ] Article rail should call fragments (not full articles)
- [ ] SEO: Direct to full articles in /solo/ (not frags in /solo/articles/)
- [ ] FIX: Thousands of pages of blank space
- [ ] FIX: Find and kill CSS filter making hero muted colors (want vibrant like index.html)
- [ ] Move FAQ under main content (not on right rail)

#### port-logbook.html (Port Tracker)
- [ ] FIX BROKEN: No ports populate regardless of click
- [ ] Expand to encompass all RCL ports
- [ ] Add wiring for future cruise line expansion

#### Ship Tracker / Port Tracker (Navigation)
- [ ] SITE-WIDE: Rename "Ship Tracker" → "Ship Logbook" in nav
- [ ] SITE-WIDE: Rename "Port Tracker" → "Port Logbook" in nav

#### ship-tracker.html
- [ ] Add Author, Article, and ICP-Lite elements
- [ ] Fix hero section divergent pattern
- [ ] Add "A Cruise Traveler's Logbook" tagline beneath logo (white text)
- [ ] Standardize hero size (currently larger than most)
- [ ] Keep horizon centered in viewport
- [ ] ADD MISSING FOOTER

#### about.html (About Us)
- [ ] Update article rail to match index.html pattern

### P0 - Individual Ship Pages (ships/rcl/*.html)

**Reference:** Icon of the Seas as example

#### All 50 RCL Ship Pages
- [ ] Add right rail: Quick Answer, Best For, Key Facts
- [ ] Add Author and Article cards (index.html pattern) below
- [ ] Shred "Recent Stories," "Related Articles and Resources" → replace with index.html pattern

#### icon-of-the-seas.html (Specific)
- [ ] FIX: Map centered on Africa coordinates (should center on actual ship)
- [ ] FIX: Image attribution cites "Allure of the Seas" but photo shows Icon (verify all attributions)

#### star-of-the-seas.html (Specific)
- [ ] FIX: No images showing in swiper despite attributions existing
- [ ] FIX: Allure image in attribution but not displayed on page
- [ ] FIX: Live tracker works, but apply all Icon page fixes here too
- [ ] FIX: Some videos marked "private," others NOT for Star of the Seas

#### All Ship Pages - Distance Feature
- [ ] Integrate fun-distance-units.json feature on ships pages
- [ ] Review documentation for this feature

### P0 - Individual Port Pages (ports/*.html)

#### All Port Pages
- [ ] Add right rail: Quick Answer, Key Facts, Best For, etc
- [ ] Add Author and Article cards (index.html pattern)
- [ ] Change "A Positively Worded Word of Warning" to better heading
- [ ] Give "Getting Around" its own card (honor design language)
- [ ] Give renamed warning section its own card
- [ ] Shred/replace "About the Author," "Recent Articles," "Recent Stories" with index.html pattern

### P1 - Site-Wide Issues

#### Git Merge Conflicts
- [ ] SITE-WIDE: Find and remove all instances of:
  ```
  <<<<<<< HEAD
  =======
  >>>>>>> 4aa11716 (FIX: Add missing navigation script to 477 HTML pages)
  ```

#### Footer Text Standardization
- [ ] SITE-WIDE: Current footer varies: `© 2025 In the Wake — A Cruise Traveler's Logbook · Accessibility & WCAG 2.1 AA Commitment`
- [ ] SITE-WIDE: Replace with standard:
  ```
  © 2025 In the Wake · A Cruise Traveler's Logbook · All rights reserved.
  Privacy · Terms · About · Accessibility & WCAG 2.1 AA Commitment
  Soli Deo Gloria
  ```
- [ ] Position: Centered under page left column content (not precise center)

#### ICP-Lite Compliance Audit
- [ ] Run site-wide ICP-Lite audit for full compliance
- [ ] Document findings

### P2 - Content & Feature Work

#### Orphaned Articles (From Orphan Analysis)
- [ ] Add 3 orphaned articles to sitemap.xml:
  - solo/articles/accessible-cruising.html
  - solo/articles/freedom-of-your-own-wake.html
  - solo/articles/visiting-the-united-states-before-your-cruise.html
- [ ] Link from appropriate index pages

#### Orphaned Images Audit
- [ ] Review ORPHANED_IMAGES_CATALOG.md (491 images, ~276 MB)
- [ ] Sample 20-30 images to verify usage
- [ ] Wire orphaned images to appropriate endpoints (per user: "all images are used somewhere")
- [ ] Document any truly orphaned images for deletion

#### cruise-lines/royal-caribbean.html#vision
- [ ] Evaluate: Does this page justify existence?
- [ ] Currently rehashes data from other pages less attractively
- [ ] Decision needed: Refactor, repurpose, or recycle

### P3 - Investigation & Documentation

#### Distance Units Feature
- [ ] Locate documentation for fun-distance-units.json
- [ ] Plan attractive integration on ship pages

#### Logbook JSON Orphans
- [ ] Verify if assets/data/logbook/rcl/*.json files are dynamically loaded
- [ ] 50+ ship data files appear orphaned in analysis but may be used

---

**Task Count:** 80+ discrete tasks
**Estimated Effort:** 60-80 hours for complete standardization
**Priority:** Design system compliance critical for user trust

**Note:** This list created from comprehensive user audit on 2025-11-25. All tasks require matching reference pattern from index.html.

