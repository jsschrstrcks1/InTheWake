# Unfinished Tasks - Both Threads

**Generated:** 2025-11-17
**Last Updated:** 2025-11-23 (COMPREHENSIVE AUDIT #3 added - 368 issues fixed, 10 files created)
**Threads Tracked:**
- Thread 1: `claude/evaluate-ai-human-strategy-01L5apYYXXKEUVyhFbyhAgZs`
- Thread 2: `claude/fix-logo-aspect-ratio-01JY4eRGk3Kd3vaBjbtQUukW`
- Thread 3: `claude/track-thread-status-01VdXW51MuvV3Vpa9UBrH2n9` (AUDIT #3)
- Current: `claude/track-thread-status-01VdXW51MuvV3Vpa9UBrH2n9` (rebased on main)

---

## 🔍 COMPREHENSIVE AUDIT #2 (2025-11-23)

**Status:** Full file-by-file verification after rebase and recent PR merges (#172, #171, #170, #169, #168)

### ✅ VERIFIED ACCURATE (No Changes Needed):

| Item | Claimed Status | Actual State | Verification |
|------|---------------|--------------|--------------|
| **Service Worker** | v13.0.0 with updated CONFIG | ✅ v13.0.0 (maxPages: 400, maxAssets: 150, maxImages: 600, maxData: 100) | sw.js:1-37 |
| **Precache Manifest** | v13.0.0 with 52 resources | ✅ v13.0.0 (16 pages, 17 assets, 3 images, 16 data) | precache-manifest.json:1-74 |
| **Total Port Pages** | 147 ports | ✅ 147 HTML files in /ports/ | Verified |
| **Hawaii Ports** | 5 ports created 2025-11-22 | ✅ All exist (honolulu, kona, hilo, maui, nawiliwili) | Verified |
| **ICP-Lite Coverage** | 544/561 pages (97%) | ✅ 544 pages with content-protocol meta tag | Grep verified |
| **Port Tracker** | 65KB, 2071 lines - COMPLETE | ✅ Matches exactly | tools/port-tracker.html |
| **Ship Tracker** | 42KB, 1132 lines - COMPLETE | ✅ Matches exactly | tools/ship-tracker.html |
| **Rhapsody of the Seas** | Still in active service | ✅ Correctly shows "entered service 1997" (no retirement) | Verified revert (354b9c5) |
| **Hero Logo Normalization** | 50 ship pages updated | ✅ All 50 /ships/rcl/*.html use responsive srcset | Grep verified |
| **Total HTML Files** | 561 pages | ✅ 561 HTML files | Find verified |

### 🎉 MAJOR PROGRESSIONS (Better than Documented):

| Item | Previous Claim | Actual Current State | Impact |
|------|---------------|----------------------|--------|
| **Under Construction Notices** | 6 ports have them (Hawaii + portland-maine) | ✅ **0 ports** have them - ALL REMOVED | PROGRESSION: Clean user experience |
| **LCP Preload Hints** | "30 Northern Europe port pages" | ✅ **141 port pages** have preload hints | PROGRESSION: 4.7x more coverage than documented |
| **WebP Image References** | P0 #6 "Update WebP references in HTML meta tags" | ✅ **ALL 50 ship pages** use .webp in og:image/twitter:image | PROGRESSION: Task COMPLETE |
| **Ship Cards Redesign** | P0 #5 "Ship cards redesign" | ✅ **COMPLETE** (commit c09b4e0, item-cards.css v1.0.0) | PROGRESSION: Enhanced CTAs, gradients, hover animations |

### 📊 Ship Cards Redesign Details (COMPLETE):

**Commit:** c09b4e0 "REDESIGN: Ship cards with prominent CTAs and better space utilization"
**CSS File:** /assets/css/item-cards.css (467 lines, 9.5KB)

**Features Implemented:**
- ✅ Enhanced CTA text: Gradient background, 3px left border accent, subtle shadow
- ✅ Improved CTA button: Full-width, gradient background, uppercase text, animated arrow (→) on hover
- ✅ Better visual hierarchy: Larger title (1.2rem, 700 weight), improved spacing with gap property
- ✅ Enhanced badges: Gradient backgrounds, box-shadows, backdrop blur for modern feel
- ✅ Improved grid layout: Responsive breakpoints (320px → 360px → 3-col at 1400px), better gaps (1.75-2.5rem)
- ✅ Better cards: Softer borders (#d4eeee), layered shadows, enhanced hover lift (6px)
- ✅ Enhanced images: 16:9 aspect ratio, stronger zoom effect (1.08x on hover)
- ✅ Retired badge styling: Grayscale filter (30%) on images, recolors on hover

**Visual Enhancements:**
- CTA text: 0.92rem, 1.55 line-height, gradient background (#fafcfc → #f5f9fa), 3px left border
- CTA button: Gradient from accent to sea, box-shadow, arrow icon slides right 4px on hover
- Card hover: translateY(-6px), enhanced shadow with accent color tint
- Image hover: scale(1.08) with smooth cubic-bezier easing

### ❌ REGRESSIONS FOUND: None

All recent PRs (#172 normalize-shell-thread-safety, #171 fix-logo-aspect-ratio, #170, #169 ship-cards-redesign) represent **progressions** or **accurate implementations** of planned work.

---

## 🔍 COMPREHENSIVE AUDIT FINDINGS (2025-11-22)

**Major Corrections from Audit:**

| Item | Previous Claim | Actual State | Status |
|------|---------------|--------------|---------|
| **Ship Tracker** | ⏳ PLANNED (HIGH PRIORITY NEXT) | ✅ COMPLETE (42KB, 1132 lines) | DONE |
| **ICP-Lite Coverage** | ~20/409 pages (5%) | 544/561 pages (97%) | MOSTLY COMPLETE |
| **Total HTML Pages** | 409 pages | 561 pages | +152 pages |
| **Template v3.010.300** | Deployment unknown | 478 files (85%+) | DEPLOYED |
| **Port Tracker** | ✅ COMPLETE | ✅ COMPLETE | Accurate ✓ |
| **Hawaii Port Batch** | ✅ COMPLETE | ✅ COMPLETE | Accurate ✓ |

**Key Takeaways:**
- Ship Tracker was completed but not documented as such
- ICP-Lite meta tags nearly site-wide (97%), not 5%
- Content-level ICP enhancements still pending (expansion plans)
- 17 pages still need ICP-Lite meta tags
- WebP images converted but HTML meta tags still reference .jpeg
- Protocol docs (ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md) still missing

**New Baseline:** This audit serves as the corrected baseline for all future task tracking.

---

## 🎯 ENGAGEMENT & TRACKING TOOLS

### ✅ Port Tracker Tool - COMPLETE (2025-11-22)
**Status:** ✅ COMPLETE - Fully functional at `/tools/port-tracker.html`
**Location:** /tools/port-tracker.html

**Features implemented:**
- [x] Interactive checklist of all 142 Royal Caribbean ports
- [x] Clickable links to individual port pages
- [x] Statistics dashboard (ports visited, %, countries, continents)
- [x] 14 achievement bingo cards (ABC Islands, Western Caribbean, Alaska, Mediterranean, etc.)
- [x] "How You Compare to Other Cruisers" social comparison section
  - [x] 9 percentile ranking tiers (Top 85% → Top 1%)
  - [x] Achievement badges (Getting Started → Ultimate Cruiser)
  - [x] Super Cruiser Club status (50+ ports)
- [x] Filter/search functionality
- [x] Export/import data (JSON)
- [x] Share stats card generator (Canvas API)
- [x] localStorage persistence
- [x] Comprehensive Google Analytics tracking (13 event types)
- [x] Added to main site navigation (18 pages updated)

**Analytics events tracked:**
1. page_view, 2. port_checked, 3. port_unchecked, 4. port_link_clicked (CONVERSION)
5. filter_changed, 6. port_search, 7. bingo_completed
8. achievement_level_reached, 9. share_stats_opened
10. share_image_downloaded (VIRALITY), 11. data_exported, 12. data_imported, 13. data_reset

### ✅ Ship Tracker Tool - COMPLETE (2025-11-22)
**Status:** ✅ COMPLETE - Fully functional at `/tools/ship-tracker.html`
**Location:** /tools/ship-tracker.html (42KB, 1132 lines)
**Rebranded as:** "Ship Logbook" in UI

**Features implemented:**
- [x] Interactive checklist of Royal Caribbean ships
- [x] Ship class grouping with collapsible sections
- [x] Statistics dashboard (ships sailed, percentage of fleet, classes completed, capacity, bingos)
- [x] Achievement bingo cards with progress tracking
- [x] Filter/search functionality
- [x] Export/import data (JSON)
- [x] Share stats card generator (Canvas API)
- [x] localStorage persistence
- [x] Analytics tracking integrated
- [x] Dynamic badge sorting
- [x] Collapsible sections with smooth animations
- [x] Added to main site navigation

**Reference:** See PORT_TRACKER_ROADMAP.md for future multi-cruise-line expansion plans

### Multi-Cruise-Line Tracker Enhancement - FUTURE FEATURE
**Status:** ⏳ PLANNED - Multi-cruise-line support for Port Tracker and Ship Tracker
**Priority:** P3 - After Carnival port expansion begins
**Impact:** Allows users to track ports/ships across multiple cruise lines

**Features planned:**
- [ ] Cruise line selector dropdown on Port Tracker page
  - [ ] Royal Caribbean (current default)
  - [ ] Carnival Cruise Line
  - [ ] Virgin Voyages
  - [ ] Princess Cruises
  - [ ] Norwegian Cruise Line
  - [ ] Celebrity Cruises
  - [ ] Disney Cruise Line
  - [ ] MSC Cruises
  - [ ] Holland America Line
  - [ ] "All Cruise Lines" mode (cross-line tracking)

- [ ] Enhanced Port Tracker features:
  - [ ] Show which cruise line(s) visit each port
  - [ ] Multi-line bingo cards (e.g., "Visit the same port on 3 different cruise lines")
  - [ ] Cross-cruise-line statistics ("You've visited 47 Royal Caribbean ports and 23 Carnival ports")
  - [ ] Separate localStorage tracking per cruise line
  - [ ] Export/import data with cruise line metadata

- [ ] Enhanced Ship Tracker features:
  - [ ] Separate ship databases per cruise line
  - [ ] "Ship Brand Loyalty" achievement (sail 5+ ships from same line)
  - [ ] "Line Hopper" achievement (sail ships from 3+ different lines)
  - [ ] Cross-line ship class comparisons (Oasis vs Vista vs Edge)

- [ ] UI/UX enhancements:
  - [ ] Cruise line color coding (Royal: navy, Carnival: red, Virgin: red, etc.)
  - [ ] Cruise line logos in navigation/headers
  - [ ] Filter ports/ships by cruise line availability
  - [ ] "Which cruise line for this port?" comparison tool

- [ ] Analytics tracking:
  - [ ] cruise_line_selected event
  - [ ] cross_line_comparison event
  - [ ] multi_line_achievement event

- [ ] Port page enhancements:
  - [ ] Show which cruise lines visit each port
  - [ ] Cruise line-specific tips/notes (e.g., "Carnival tenders here, Royal docks")
  - [ ] Itinerary length comparison (Carnival: 4-5 day, Royal: 7 day)

**Technical considerations:**
- Cruise line as metadata field in PORTS_DB array
- Multi-value support: `cruiseLines: ['royal-caribbean', 'carnival']`
- Backward compatibility with current Royal-only tracker
- Default to Royal Caribbean until user selects different line
- Cookie/localStorage to remember user's preferred cruise line(s)

**Timeline:** Phase 1 after Carnival private islands batch (2026+)
**Rationale:** Maximize engagement with users who cruise on multiple lines

---

## 🔍 COMPREHENSIVE AUDIT #3 (2025-11-19)

**Thread:** `claude/track-thread-status-01VdXW51MuvV3Vpa9UBrH2n9`
**Branch Status:** Rebased onto main (6d6a531)
**Verification Scripts:** `comprehensive_site_audit.py`, `verify_actual_state.py`
**Reports:** `admin/COMPREHENSIVE_AUDIT_2025_11_19.json`, `admin/THREAD_AUDIT_2025_11_19.md`

### Summary

**Total Issues Found:** 1,730 (comprehensive site audit)
**Issues Fixed:** 368 (195 P0 + 173 P2)
**Files Created:** 10
**Files Modified:** 173
**Lines Removed:** 36,509 (orphan cleanup)
**Lines Added:** 8,492

### ✅ Files Created This Thread

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `comprehensive_site_audit.py` | 22,837 bytes | Site audit script | ✅ EXISTS |
| `admin/COMPREHENSIVE_AUDIT_2025_11_19.json` | 234,309 bytes | Audit data (1730 issues) | ✅ EXISTS |
| `admin/COMPREHENSIVE_SITE_AUDIT_2025_11_19.md` | 12,717 bytes | Audit report | ✅ EXISTS |
| `assets/js/venue-boot.js` | 2,217 bytes | Restaurant page functionality | ✅ EXISTS |
| `ships/carnival-cruise-line/index.html` | 10,805 bytes | Carnival fleet index (47 ships) | ✅ EXISTS |
| `ships/celebrity-cruises/index.html` | 8,973 bytes | Celebrity fleet index (29 ships) | ✅ EXISTS |
| `ships/holland-america-line/index.html` | 10,074 bytes | HAL fleet index (44 ships) | ✅ EXISTS |
| `verify_actual_state.py` | 327 lines | State verification script | ✅ EXISTS |
| `admin/VERIFICATION_REPORT_2025_11_19.json` | Machine-readable | Verification data | ✅ EXISTS |
| `admin/THREAD_AUDIT_2025_11_19.md` | 172 lines | Thread audit report | ✅ EXISTS |
| `assets/data/logbook/rcl/nordic-prince.json` | 5.8KB | Historic ship logbook (1971-1995) | ✅ EXISTS (2025-11-23) |
| `assets/data/logbook/rcl/sun-viking.json` | 6.0KB | Historic ship logbook (1972-1998) | ✅ EXISTS (2025-11-23) |

### ✅ P0 Critical Fixes (195 Issues Resolved)

**1. Created 3 Missing Index Files (120 broken links fixed)**
- ✅ `/ships/carnival-cruise-line/index.html` - 47 ships
- ✅ `/ships/celebrity-cruises/index.html` - 29 ships
- ✅ `/ships/holland-america-line/index.html` - 44 ships
- **Impact:** All ship pages in these 3 directories now have working breadcrumb navigation

**2. Fixed search-index.json (72 broken refs removed)**
- ✅ Removed 72 non-existent restaurant pages from search index
- ✅ Kept 204 valid entries
- ✅ Search functionality no longer returns 404s

**3. Created venue-boot.js (3 restaurant pages fixed)**
- ✅ `/assets/js/venue-boot.js` (2,217 bytes)
- ✅ Initializes ship pills
- ✅ Loads venue data
- ✅ Fixes: chefs-table.html, chops.html, samba-grill.html

**4. Fixed 3 Invalid JSON Files**
- ✅ `assets/data/rc_bars_by_class.json` - Removed JS comments
- ✅ `assets/data/rc_ships_meta.json` - Restructured corrupted data
- ✅ `assets/data/logbook/rcl/spectrum-of-the-seas.json` - Fixed control characters
- **Note:** 8 JSON files still need manual review (complex corruption)

### ✅ P2 Medium Fixes (173 Issues Resolved)

**1. Orphan File Cleanup (41 files deleted)**
- ✅ Deleted `__pycache__/` directory (2 files)
- ✅ Deleted `vendor/` directory (39 swiper files)
- ✅ Deleted `cruise-lines/disney.html.bak`
- **Impact:** 35,709 lines removed, repo cleaned

**2. Added DOCTYPE to 60 Pages**
- ✅ Fixed browser rendering issues
- ✅ Affects: disability-at-sea, ports, restaurants, authors, cruise-lines

**3. Removed Console Statements (25 files)**
- ✅ Cleaned production JavaScript
- ✅ Removed console.log/warn/error from HTML and JS files

**4. Fixed Lorem Ipsum (47 Carnival ship pages)**
- ✅ Replaced placeholder text with "Ship details coming soon"
- ✅ All `ships/carnival/*.html` files cleaned

### Verified State (2025-11-19, updated 2025-11-23)

**Logbooks:**
- ✅ 40 ships have complete logbooks (38 active/retired + 2 historic added 2025-11-23)
- ✅ 2 historic ships COMPLETE (nordic-prince, sun-viking) - Added 2025-11-23
- ❌ 8 future ships (TBN) cannot create until announced
- ❌ 2 duplicate pages to consolidate

**ICP-Lite Coverage:**
- ✅ 544 of 561 pages (97.0%) have ICP-Lite meta tags
- **CORRECTION:** Previous claim of 5% was incorrect
- ❌ 17 pages still need ICP-Lite meta tags

**SEO Files:**
- ✅ `search.html` exists (23,688 bytes)
- ✅ `sitemap.xml` exists (108,035 bytes)

**Protocol Docs:**
- ❌ `standards/ITW-LITE_PROTOCOL_v3.010.lite.md` - MISSING
- ❌ `STANDARDS_INDEX_33.md` - MISSING
- ❌ `CLAUDE.md` - MISSING

### Commits Created This Thread

1. `344768b` - VERIFY: Update task list with confirmed completion status
2. `9b81da1` - AUDIT: Comprehensive site audit - 1730 issues found
3. `883e7fd` - FIX: P0 critical fixes - 195 issues resolved
4. `6d6a531` - FIX: P2 medium priority fixes - 162 files updated

### Remaining Work from Audit

**High Priority (P1):**
- 8 corrupted JSON files (manual review needed)
- 401 missing alt attributes (accessibility)
- 44 dining hero images (all RCL ships)
- 12 Disney/MSC ship pages (broken links)
- 3 protocol docs (ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md)

**Medium Priority (P2):**
- 50 pages with "coming soon" text
- 3 articles to write (Rest & Recovery, Family Challenges, Healing Relationships)
- ~~2 historic logbooks (nordic-prince, sun-viking)~~ ✅ COMPLETE 2025-11-23

**Last Verified:** 2025-11-19
**Verification Method:** File-by-file check via verify_actual_state.py
**Data Integrity:** No hallucinations - all findings from actual file system checks

---

## 🌍 PORT EXPANSION TASKS

**Current Coverage:** 147 ports with individual pages (all have under construction notices)
**Master Reference:** PORT_TRACKER_ROADMAP.md "Missing Ports by Priority" section

### ~~HIGH PRIORITY - Hawaii Batch (5 ports - ZERO coverage currently)~~ ✅ COMPLETE (2025-11-22)
**Impact:** Major gap closed - Hawaii is popular Royal Caribbean destination
- [x] Honolulu (Oahu) - ✅ Created 2025-11-22
- [x] Kona (Big Island) - ✅ Created 2025-11-22
- [x] Hilo (Big Island) - ✅ Created 2025-11-22
- [x] Maui (Lahaina/Kahului) - ✅ Created 2025-11-22
- [x] Nawiliwili (Kauai) - ✅ Created 2025-11-22

### HIGH PRIORITY - Middle East Expansion (4 ports)
- [ ] Dubai, UAE - Create port page
- [ ] Abu Dhabi, UAE - Create port page
- [ ] Muscat, Oman - Create port page
- [ ] Salalah, Oman - Create port page

### HIGH PRIORITY - Caribbean Completion (8-10 ports)
**Impact:** Complete coverage of most popular cruise region
- [ ] Antigua (St. John's)
- [ ] St. Lucia (Castries)
- [ ] Barbados (Bridgetown)
- [ ] St. Kitts
- [ ] Grenada (St. George's)
- [ ] Martinique (Fort-de-France)
- [ ] Guadeloupe (Pointe-à-Pitre)
- [ ] Dominica (Roseau)

### MEDIUM PRIORITY - Asia Expansion (10-15 ports)
- [ ] Osaka, Japan
- [ ] Busan, South Korea
- [ ] Taipei, Taiwan
- [ ] Phuket, Thailand
- [ ] Manila, Philippines
- [ ] Ho Chi Minh City, Vietnam
- [ ] Halong Bay, Vietnam
- [ ] Penang, Malaysia
- [ ] Colombo, Sri Lanka
- [ ] Additional Asia ports (see roadmap)

### MEDIUM PRIORITY - Australia & South Pacific (15-20 ports)
- [ ] Sydney, Australia
- [ ] Melbourne, Australia
- [ ] Brisbane, Australia
- [ ] Auckland, New Zealand
- [ ] Wellington, New Zealand
- [ ] Fiji ports
- [ ] New Caledonia
- [ ] Vanuatu
- [ ] Additional Pacific ports (see roadmap)

**For complete port expansion roadmap:** See PORT_TRACKER_ROADMAP.md sections:
- Missing Ports by Priority (HIGH/MEDIUM/LOWER)
- Recommended Timeline
- Success Metrics & KPIs

### FUTURE EXPANSION - Carnival Cruise Line Ports (150-200 new ports)
**Status:** ⏳ PLANNED - Multi-phase expansion for Carnival coverage (29 ships, 320+ unique ports)
**Priority:** P4 - After Royal Caribbean core coverage complete
**Impact:** Adds second major cruise line, doubles potential user base

**Carnival-Exclusive/Private Destinations (5 ports - HIGH PRIORITY when starting Carnival):**
- [ ] Celebration Key (Grand Bahama, Bahamas) - Opening July 2025
- [ ] Half Moon Cay (Little San Salvador, Bahamas) - Flagship private island
- [ ] Princess Cays (Eleuthera, Bahamas) - Private beach resort
- [ ] Amber Cove (Puerto Plata, Dominican Republic) - Private port (may already have Puerto Plata)
- [ ] Mahogany Bay/Isla Tropicale (Roatan, Honduras) - Private beach club expansion 2026

**Caribbean/Bahamas - Carnival Unique Ports (~15-20 new):**
- [ ] St. Vincent (Kingstown)
- [ ] Tobago (Scarborough)
- [ ] Trinidad (Port of Spain)
- [ ] La Romana, Dominican Republic
- [ ] Puerto Limón, Costa Rica
- [ ] Limón, Costa Rica (verify if duplicate)
- [ ] Colón, Panama (may already have)
- [ ] Additional Carnival-specific Caribbean calls

**Alaska - Carnival Unique (~2-3 new):**
- [ ] Endicott Arm & Dawes Glacier (cruising)
- [ ] Hubbard Glacier (cruising)
- [ ] Other Carnival-specific scenic cruising areas

**Europe - Carnival Unique Ports (~40-50 new):**

*Mediterranean:*
- [ ] Ibiza, Spain
- [ ] Valencia, Spain
- [ ] Catania, Sicily, Italy
- [ ] Cagliari, Sardinia, Italy
- [ ] Cadiz, Spain

*Northern Europe/Baltic:*
- [ ] Geiranger, Norway
- [ ] Olden, Norway
- [ ] Flam, Norway
- [ ] Riga, Latvia
- [ ] Klaipeda, Lithuania
- [ ] Gdansk/Gdynia, Poland
- [ ] Kiel, Germany
- [ ] Hamburg, Germany
- [ ] Cherbourg, France
- [ ] Zeebrugge (Bruges), Belgium
- [ ] Greenock (Glasgow), Scotland
- [ ] South Queensferry (Edinburgh), Scotland
- [ ] Dun Laoghaire (Dublin), Ireland

**Australia, New Zealand & South Pacific - ALL NEW (~30-35 ports):**

*Australia:*
- [ ] Sydney, Australia
- [ ] Brisbane, Australia
- [ ] Melbourne, Australia
- [ ] Adelaide, Australia
- [ ] Fremantle (Perth), Australia
- [ ] Hobart, Tasmania

*New Zealand:*
- [ ] Auckland, New Zealand
- [ ] Bay of Islands, New Zealand
- [ ] Wellington, New Zealand
- [ ] Christchurch (Lyttelton), New Zealand
- [ ] Dunedin (Port Chalmers), New Zealand
- [ ] Tauranga, New Zealand
- [ ] Napier, New Zealand
- [ ] Picton, New Zealand
- [ ] Milford Sound (cruising)
- [ ] Doubtful Sound (cruising)

*South Pacific:*
- [ ] Nouméa, New Caledonia
- [ ] Port Vila, Vanuatu
- [ ] Mystery Island, Vanuatu
- [ ] Lifou, Loyalty Islands, New Caledonia
- [ ] Suva, Fiji
- [ ] Lautoka, Fiji
- [ ] Dravuni Island, Fiji

**Asia - Carnival Unique (~15-20 new):**
- [ ] Shanghai (Baoshan), China
- [ ] Tianjin (Beijing), China
- [ ] Kobe/Osaka, Japan
- [ ] Nagasaki, Japan
- [ ] Jeju, South Korea
- [ ] Phu My (Ho Chi Minh City), Vietnam
- [ ] Laem Chabang (Bangkok), Thailand
- [ ] Chan May (Da Nang/Hue), Vietnam
- [ ] Bali (Benoa), Indonesia
- [ ] Additional Asia ports from Carnival world cruises

**South America - ALL NEW (~10-15 ports):**
- [ ] Buenos Aires, Argentina
- [ ] Montevideo, Uruguay
- [ ] Rio de Janeiro, Brazil
- [ ] Ushuaia, Argentina (Cape Horn/Drake Passage)
- [ ] Antarctic Peninsula (cruising)
- [ ] Punta Arenas, Chile
- [ ] Valparaíso (Santiago), Chile
- [ ] Callao (Lima), Peru
- [ ] Manta, Ecuador
- [ ] Guayaquil, Ecuador

**Africa & Indian Ocean - ALL NEW (~15-20 ports):**
- [ ] Cape Town, South Africa
- [ ] Port Elizabeth (Gqeberha), South Africa
- [ ] Durban, South Africa
- [ ] Maputo, Mozambique
- [ ] Nosy Be, Madagascar
- [ ] Mahé, Seychelles
- [ ] Mombasa, Kenya
- [ ] Zanzibar, Tanzania
- [ ] Walvis Bay, Namibia
- [ ] Praia, Cape Verde

**Exotic/Rare World Cruise Ports (~10-15 ports):**
- [ ] Papeete, French Polynesia
- [ ] Moorea, French Polynesia
- [ ] Mumbai, India
- [ ] Pitcairn Island (weather-dependent)
- [ ] Easter Island, Chile
- [ ] Otaru, Japan (2026+)
- [ ] Additional rare repositioning/world cruise calls

**Carnival Expansion Strategy:**
- **Phase 1:** Carnival private islands + Caribbean unique ports (20-25 ports)
- **Phase 2:** Europe unique ports (40-50 ports)
- **Phase 3:** Australia/NZ/Pacific region (30-35 ports)
- **Phase 4:** Asia expansion (15-20 ports)
- **Phase 5:** South America/Africa/exotic (40-50 ports)

**Total Carnival Unique Ports:** ~150-200 new port pages
**Timeline:** Post Royal Caribbean completion (2026-2027+)
**Reference:** Carnival operates 29 ships with 320+ unique ports (2022-2028 data)

### FUTURE EXPANSION - Virgin Voyages Ports (15-20 unique ports)
**Status:** ⏳ PLANNED - Premium/experiential alternative to mass-market focus
**Priority:** P4 - After Royal Caribbean core coverage, parallel with Carnival
**Impact:** Adds adults-only premium segment, targets experiential travelers
**Fleet:** 4 ships (Scarlet Lady, Valiant Lady, Resilient Lady, Brilliant Lady debut Sep 2025)
**Total Ports:** ~120 ports (curated, quality over quantity)

**Virgin-Exclusive/Unique Ports (~15-20 new ports not in Royal Caribbean):**

**Virgin Private Destination:**
- [ ] The Beach Club at Bimini (Bahamas) - Virgin's signature private beach club

**Caribbean/Atlantic Unique:**
- [ ] St. Croix, USVI (Frederiksted)
- [ ] King's Wharf, Bermuda (NYC roundtrips)

**Europe/Atlantic Coast Unique:**
- [ ] Bodrum, Turkey (NEW 2026 Med)
- [ ] Casablanca, Morocco (transatlantic)
- [ ] Vigo, Spain (transatlantic/Bay of Biscay)
- [ ] Le Verdon (Bordeaux), France (Bay of Biscay 2025)
- [ ] La Coruña, Spain (Bay of Biscay)
- [ ] Bilbao, Spain (Bay of Biscay)
- [ ] Ponta Delgada (Azores), Portugal (transatlantic)

**Iceland/Greenland Unique:**
- [ ] Nuuk, Greenland (NEW 2026 Arctic expansion)
- [ ] Isafjordur, Iceland (NEW 2026)

**Pacific/Central America Unique:**
- [ ] Puntarenas, Costa Rica (Panama Canal)
- [ ] Cabo San Lucas, Mexico (West Coast/Panama)

**Australia/NZ Unique:**
- [ ] Timaru, New Zealand (when/if Australia/NZ resumes post-2026)
- [ ] Burnie, Tasmania (when/if Australia/NZ resumes post-2026)

**Virgin Voyages Unique Features to Highlight:**
- Late-night stays: Ships stay until 10pm-midnight for nightlife (Ibiza, Mykonos, San Juan, Cozumel)
- Overnight stays: Ibiza and Mykonos regular overnights
- Adults-only (18+): Different port experience focus
- "Shore Things" curated excursions
- Premium/experiential vs mass-market

**Virgin Expansion Strategy:**
- **Phase 1:** Virgin-exclusive ports + premium Caribbean/Atlantic (10-12 ports)
- **Phase 2:** Virgin signature late-night/overnight experiences (highlight in existing port pages)
- **Phase 3:** Adults-only content angle for existing shared ports

**Total Virgin Unique Ports:** ~15-20 new port pages (many ports overlap with Royal/Carnival)
**Timeline:** Post Royal Caribbean core + Carnival Phase 1 (2027+)
**Reference:** Virgin operates 4 ships with ~120 curated ports (2022-2028 data)
**Market Position:** Premium/adults-only alternative, experiential focus vs volume

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
- [x] Nordic Prince - ✅ Historic logbook created 2025-11-23 (5.8KB, 2 memorial stories)
- [x] Sun Viking - ✅ Historic logbook created 2025-11-23 (6.0KB, 2 memorial stories)

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
- [ ] `/ports.html` - Complete main hub page content (142 individual port pages exist with under construction notices)
  - Current: Individual port pages exist for 142 ports (all have under construction notices added 2025-11-22)
  - Content needed: Main hub page with port overview, search/filter, regional breakdowns
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
**Note:** Picture tags verified balanced 2025-11-23
- [x] Full article exists with 5 universal principles
- [ ] Consider minor expansion: medical equipment, service animals, dietary restrictions, cruise line comparison
- **Topics covered:** Wheelchair, autism, stroke recovery, deaf/hard-of-hearing, chronic illness, PTSD, invisible disabilities
- **Key logbook stories:** "The Wheelchair Dance" (Brilliance), "Autistic Boy Who Found His Voice" (Radiance), "Stroke Survivor Who Walked Again" (Radiance), "Deaf Family's Inclusive Experience" (Explorer)

#### 3. Solo Cruising: Your Complete Guide to Traveling Alone at Sea
**Status:** ⚠️ PARTIAL (why-i-started-solo-cruising.html exists but not comprehensive) - 20 logbook references
**Note:** Article loads correctly on solo.html (picture tags fixed 2025-11-23 - see Performance Optimizations above)
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
- ✅ freedom-of-your-own-wake.html (Picture tags fixed 2025-11-23 - see Performance Optimizations above)
- ✅ why-i-started-solo-cruising.html (Picture tags fixed 2025-11-23 - see Performance Optimizations above)
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

### P0 - Critical (User-facing issues & engagement)
1. ~~**CRITICAL: Fix navigation on 281 pages (96% of site)**~~ - ✅ COMPLETE (done in main)
2. ~~**CRITICAL: Update code to use WebP images**~~ - ✅ COMPLETE (done in main, commit ecdb983)
3. ~~**CRITICAL: Create Port Tracker tool**~~ - ✅ COMPLETE (2025-11-22, /tools/port-tracker.html with analytics)
4. ~~**CRITICAL: Create Ship Tracker tool**~~ - ✅ COMPLETE (2025-11-22, /tools/ship-tracker.html, rebranded as "Ship Logbook")
5. ~~**Ship cards redesign**~~ - ✅ COMPLETE (2025-11-22, commit c09b4e0, item-cards.css with CTAs, gradients, hover animations)
6. ~~**Update WebP references in HTML meta tags**~~ - ✅ COMPLETE (All 50 ship pages use .webp in og:image/twitter:image/JSON-LD)
7. Fix placeholder attributions (Symphony, Adventure, Enchantment, Explorer) - Symphony appears complete
8. Download Wiki Commons images for 19 ships still needing images

### P1 - High (Content completeness)
8. ~~**CRITICAL: Write "Cruising After Loss" article**~~ - ✅ COMPLETE as "In the Wake of Grief" (722 lines, Grade A+)
9. ~~**CRITICAL: Create Hawaii port batch**~~ - ✅ COMPLETE (2025-11-22, 5 ports: Honolulu, Kona, Hilo, Maui, Nawiliwili)
10. **CRITICAL: Expand "Solo Cruising" article** - 20 logbook references, current article too narrow
11. **CRITICAL: Write "Healing Relationships at Sea" article** - 15+ logbook references, unique positioning
12. **CRITICAL: Write "Cruising for Rest & Recovery" article** - 25 logbook references, burnout/mental health
13. **CRITICAL: Write "Family Cruising Challenges" article** - 20 logbook references, blended/adoptive families
14. ~~**CRITICAL: Create search functionality**~~ - ✅ search.html EXISTS
15. **CRITICAL: Complete placeholder content pages** - drinks.html, ports.html hub, restaurants.html (all "coming soon")
16. **CRITICAL: Create missing protocol docs** - ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md (all missing)
17. ~~Create logbooks for active ships without them~~ - ✅ All active ships have logbooks (only 2 historic missing: nordic-prince, sun-viking)
18. Download remaining Wiki Commons images (19 ships) + attribution workflow
19. Complete venues.json with all dining data
20. ~~SEO setup (sitemap)~~ - ✅ sitemap.xml EXISTS; still need Google Search Console setup

### P2 - Medium (Enhancement)
21. Expand "Accessible Cruising" article (optional) - Article exists but could add: medical equipment, service animals, dietary, cruise line comparison
22. Middle East port batch (4 ports - Dubai, Abu Dhabi, Muscat, Salalah)
23. Caribbean completion batch (8-10 ports - Antigua, St. Lucia, Barbados, etc.)
24. ICP-Lite & ITW-Lite rollout (see dedicated section below)
25. ~~Create logbooks for historic ships (2 ships: Nordic Prince, Sun Viking)~~ ✅ COMPLETE 2025-11-23
26. Add video data for ships without videos
27. Cross-linking improvements
28. Performance optimization

### P3 - Low (Nice to have)
29. Multi-cruise-line tracker enhancement - Cruise line selector on Port Tracker/Ship Tracker
30. Asia expansion batch (10-15 ports - see roadmap)
31. Australia & Pacific batch (15-20 ports - see roadmap)
32. Create logbooks for future ships (TBN)
33. Additional themed articles (medical recovery, mental health, family situations, life transitions)
34. Advanced analytics and monitoring

### P4 - Future Expansion (Post Royal Caribbean completion)
35. **Carnival Cruise Line expansion** - 150-200 new unique ports (29 ships, 320+ total ports)
    - Phase 1: Carnival private islands + Caribbean unique (20-25 ports)
    - Phase 2: Europe unique ports (40-50 ports)
    - Phase 3: Australia/NZ/Pacific region (30-35 ports)
    - Phase 4: Asia expansion (15-20 ports)
    - Phase 5: South America/Africa/exotic (40-50 ports)
36. **Virgin Voyages expansion** - Adult-only luxury line
37. **Princess Cruises expansion** - Sister brand to Royal Caribbean
38. **Norwegian Cruise Line expansion** - Freestyle cruising competitor
39. **Celebrity Cruises expansion** - Premium Royal Caribbean sister brand
40. **Multi-cruise-line ship trackers** - Separate ship databases per cruise line

**Timeline:** 2026-2027+ (after Royal Caribbean core coverage complete)
**Rationale:** Maximize TAM (Total Addressable Market) by serving all major cruise lines

---

## 🤖 ICP-LITE & ITW-LITE ROLLOUT

> **Strategy:** Keep v3 architecture and progressive enhancement.
> **Protocol:** `standards/ITW-LITE_PROTOCOL_v3.010.lite.md` (AI-first, human-first).
>
> **CURRENT STATUS (verified 2025-11-22 - COMPREHENSIVE AUDIT):**
> - **544/561 pages have ICP-Lite meta tags** (content-protocol, ai-summary)
> - **561 total HTML pages** in repository (updated count)
> - **Coverage: 97%** - Near-complete site-wide deployment of meta tags ✅
> - **17 pages still need meta tags:** Asia/Pacific ports (10), solo/articles (4), solo/in-the-wake-of-grief.html (1), tracker tools (2)
> - **Protocol docs still missing:** ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md ❌
> - **Content-level enhancements pending:** H1+answer lines, fit-guidance cards, FAQ blocks, progressive enhancement

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

**Engagement Tools (UPDATED 2025-11-22):**
- ✅ Port Tracker COMPLETE - /tools/port-tracker.html (65KB, 2071 lines) with 147 ports, analytics, social comparison
- ✅ Ship Tracker COMPLETE - /tools/ship-tracker.html (42KB, 1132 lines) with bingo cards, share modal, collapsible sections
- Both rebranded as "Logbooks" in UI (Port Logbook, Ship Logbook)

**Port Pages (VERIFIED 2025-11-23):**
- ✅ Complete: 147 individual port HTML pages exist in /ports/ directory
- ✅ Port Tracker database: 147 ports tracked in /tools/port-tracker.html
- ✅ Under construction notices: ALL REMOVED (0 ports have them) - Clean user experience ✨
- ✅ LCP preload hints: 141 port pages have fetchpriority="high" preload (96% coverage)
- ✅ British Isles batch complete (10 ports: Liverpool, Cork, Invergordon, Kirkwall, Lerwick, Dover, Portland, Newcastle, Holyhead, Waterford)
- ✅ Hawaii batch complete (5 ports: Honolulu, Kona, Hilo, Maui, Nawiliwili) - 2025-11-22
- ✅ Portland duplicate fixed (portland.html = Dorset, portland-maine.html = Maine)
- ✅ Navigation updated: Port Tracker link added to 18 main pages
- ✅ Shell normalization complete: Navbar structure cleaned across port pages
- ⏳ HIGH PRIORITY: Middle East (4 ports), Caribbean completion (8-10 ports)
- ⏳ MEDIUM PRIORITY: Asia (10-15 ports), Australia/Pacific (15-20 ports)
- ⏳ FUTURE EXPANSION: Carnival Cruise Line (150-200 new ports across all regions)

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

**ICP-Lite (COMPREHENSIVE AUDIT 2025-11-22):**
- ✅ 544/561 pages (97%) have ICP-Lite meta tags - Near-complete site-wide deployment
- ⏳ 17 pages still need meta tags (Asia/Pacific ports, solo/articles, tracker tools)
- ❌ Protocol docs missing (ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md)
- ⏳ Content-level enhancements pending (H1+answer lines, fit-guidance, FAQ blocks, progressive enhancement)

**Templates:**
- ✅ v3.010.300 production-ready template created
- ⏳ Deployment status unknown (may be complete)

**Attribution:**
- ✅ Template and process documented
- ⏳ 4 ships need attribution fixes
- ⏳ 2 ships need attribution sections when images added

**Analytics (NEW 2025-11-22):**
- ✅ Port Tracker: 13 event types tracked (page_view, port_checked, port_link_clicked, bingo_completed, share_image_downloaded, etc.)
- ⏳ Ship Tracker: 7 event types planned (see roadmap)
- ⏳ Google Analytics dashboard setup needed
- ⏳ Conversion tracking and funnel analysis needed

---

## 📋 NEXT STEPS

**Immediate actions (verified priorities):**
1. **CRITICAL: Create Ship Tracker tool** - HIGH PRIORITY NEXT (full spec ready in PORT_TRACKER_ROADMAP.md)
   - Interactive checklist of 27-28 Royal Caribbean ships
   - 10 achievement bingo cards with ship class progression
   - Cross-reference with Port Tracker data
   - Analytics tracking (7 event types)
   - Share card generator with ship silhouettes
2. ~~**CRITICAL: Create Hawaii port batch**~~ - ✅ COMPLETE (2025-11-22, 5 ports: Honolulu, Kona, Hilo, Maui, Nawiliwili)
3. **CRITICAL: Create protocol docs** - ITW-LITE_PROTOCOL, STANDARDS_INDEX_33.md, CLAUDE.md all missing
4. **Write remaining 3 articles** - Rest & Recovery, Family Challenges, Healing Relationships
5. **Complete placeholder pages** - drinks.html, ports.html hub, restaurants.html need real content
6. Fix attribution for Symphony, Adventure, Enchantment, Explorer

**This week:**
7. ~~Create Port Tracker~~ - ✅ COMPLETE (2025-11-22)
8. ~~Create sitemap.xml~~ - ✅ Already exists
9. ~~Create search.html~~ - ✅ Already exists
10. Set up Google Search Console and Bing Webmaster Tools
11. Set up Google Analytics dashboard for Port Tracker monitoring
12. Create 2 historic ship logbooks (nordic-prince, sun-viking)

**This month:**
13. Middle East port batch (4 ports - Dubai, Abu Dhabi, Muscat, Salalah)
14. Caribbean completion batch (8-10 ports - Antigua, St. Lucia, Barbados, etc.)
15. ICP-Lite site-wide rollout (currently only ~5%)
16. Download Wiki Commons images for 19 ships
17. Performance optimization pass
18. Ship cards redesign (add CTAs, better space utilization)

**Next quarter:**
19. Asia expansion batch (10-15 ports - see roadmap)
20. Australia & Pacific batch (15-20 ports - see roadmap)
21. Additional solo travel articles based on logbook references
22. Advanced analytics: conversion tracking, funnel analysis, A/B testing

**Strategic reference documents:**
- PORT_TRACKER_ROADMAP.md - Complete specification for Ship Tracker and port expansion priorities
- FIVE_ARTICLE_CATEGORIES.md - Solo travel article categories with logbook references

---

**Last Updated:** 2025-11-23 (AUDIT #3 added - 368 issues fixed: broken links, JSON, orphans, placeholders)
**Maintained by:** Claude AI (Thread tracking)
**Current Thread:** claude/track-thread-status-01VdXW51MuvV3Vpa9UBrH2n9 (rebased on main)
**Previous Audit Threads:**
- AUDIT #2: claude/fix-logo-aspect-ratio-01JY4eRGk3Kd3vaBjbtQUukW
- AUDIT #1: claude/normalize-shell-thread-safety-01GkL7yZ6U6k7fE5xy13cFiw

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
