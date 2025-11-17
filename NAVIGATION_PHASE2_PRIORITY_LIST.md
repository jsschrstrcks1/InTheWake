# Navigation Phase 2: Priority Tracking List

**Status:** Phased rollout approach - fixing high-traffic pages first  
**Started:** 2025-11-17  
**Excludes:** /vendors/ folder (not ours to modify)

---

## 🎯 Priority Tiers

### ✅ Tier 0: Already Complete (104 files)
All RCL ships, restaurants, core pages, authors - **DONE**

---

### 🔥 Tier 1: CRITICAL - Cruise Line Hub Pages (5 files)
**Impact:** Gateway pages users hit first
**Status:** ✅ COMPLETE - 2025-11-17

- [x] cruise-lines/carnival.html
- [x] cruise-lines/celebrity.html
- [x] cruise-lines/disney.html
- [x] cruise-lines/holland-america.html
- [x] cruise-lines/msc.html

---

### ⭐ Tier 2: HIGH - Newest/Flagship Ships (15 files)
**Impact:** Newest ships get the most traffic
**Status:** ✅ COMPLETE - 2025-11-17 (15/17 - 2 were already done)

**Carnival (Top 4 - 2 don't exist):**
- [x] ships/carnival/carnival-mardi-gras.html (Flagship - 2020)
- [x] ships/carnival/carnival-celebration.html (New - 2022)
- [x] ships/carnival/carnival-jubilee.html (New - 2023)
- [x] ships/carnival/carnival-vista.html (Vista-class lead - 2016)
- ~~ships/carnival/carnival-venezia.html~~ (File not found)
- ~~ships/carnival/carnival-firenze.html~~ (File not found)

**Holland America (Top 6):**
- [x] ships/holland-america-line/rotterdam.html (Newest - 2021)
- [x] ships/holland-america-line/nieuw-statendam.html (2018)
- [x] ships/holland-america-line/koningsdam.html (2016)
- [x] ships/holland-america-line/eurodam.html (Popular)
- [x] ships/holland-america-line/noordam.html (Popular)
- [x] ships/holland-america-line/nieuw-amsterdam.html (Popular)

**Celebrity (Top 5):**
- [x] ships/celebrity-cruises/celebrity-edge.html (Edge-class lead - 2018)
- [x] ships/celebrity-cruises/celebrity-apex.html (2020)
- [x] ships/celebrity-cruises/celebrity-beyond.html (2022)
- [x] ships/celebrity-cruises/celebrity-ascent.html (Newest - 2023)
- [x] ships/celebrity-cruises/celebrity-xcel.html (Coming 2025)

**Other:**
- [x] ships/msc/msc-world-america.html (Already had hero-header)
- [x] stateroom-check.html (Already had hero-header)

---

### 📊 Tier 3: MEDIUM - Popular Ships (35 files)
**Impact:** Solid traffic, good ROI
**Status:** ✅ COMPLETE - 2025-11-17 (33/35 - 2 files don't exist)

**Carnival (15 popular ships):**
- [x] ships/carnival/carnival-horizon.html
- [x] ships/carnival/carnival-panorama.html
- [x] ships/carnival/carnival-dream.html
- [x] ships/carnival/carnival-breeze.html
- [x] ships/carnival/carnival-magic.html
- [x] ships/carnival/carnival-conquest.html
- [x] ships/carnival/carnival-glory.html
- [x] ships/carnival/carnival-liberty.html
- [x] ships/carnival/carnival-valor.html
- [x] ships/carnival/carnival-freedom.html
- [x] ships/carnival/carnival-miracle.html
- [x] ships/carnival/carnival-splendor.html
- [x] ships/carnival/carnival-legend.html
- [x] ships/carnival/carnival-pride.html
- [x] ships/carnival/carnival-spirit.html

**Holland America (8 of 10):**
- ~~ships/holland-america-line/westerdam.html~~ (Not found)
- [x] ships/holland-america-line/oosterdam.html
- ~~ships/holland-america-line/zuiderdam.html~~ (Not found)
- [x] ships/holland-america-line/volendam.html
- [x] ships/holland-america-line/zaandam.html
- [x] ships/holland-america-line/amsterdam.html
- [x] ships/holland-america-line/maasdam.html
- [x] ships/holland-america-line/veendam.html
- [x] ships/holland-america-line/ryndam.html
- [x] ships/holland-america-line/statendam.html

**Celebrity (10 ships):**
- [x] ships/celebrity-cruises/celebrity-equinox.html
- [x] ships/celebrity-cruises/celebrity-solstice.html
- [x] ships/celebrity-cruises/celebrity-reflection.html
- [x] ships/celebrity-cruises/celebrity-silhouette.html
- [x] ships/celebrity-cruises/celebrity-eclipse.html
- [x] ships/celebrity-cruises/celebrity-millennium.html
- [x] ships/celebrity-cruises/celebrity-summit.html
- [x] ships/celebrity-cruises/celebrity-constellation.html
- [x] ships/celebrity-cruises/celebrity-infinity.html
- [x] ships/celebrity-cruises/celebrity-flora.html

---

### 📦 Tier 4: LOW - Remaining Ships (142 files)
**Impact:** Completeness, long-tail traffic  
**Status:** Not started

**Carnival remaining (~93 files):**
- All other Carnival ships in ships/carnival/ and ships/carnival-cruise-line/
- Older ships, Fantasy-class, Spirit-class, etc.

**Holland America remaining (~28 files):**
- All other HAL ships, historic vessels

**Celebrity remaining (~14 files):**
- Remaining Celebrity ships

**Other misc pages (~7 files):**
- [ ] offline.html
- [ ] terms.html
- [ ] ships/rooms.html
- [ ] admin/reports/sw-health.html
- [ ] assets/ships/grandeur-of-the-seas.html (orphan)
- [ ] standards/starter.html (template)

---

## 📈 Progress Tracker

### Summary:
- ✅ **Tier 0:** 104/104 files complete (100%)
- ✅ **Tier 1:** 5/5 files complete (100%) - CRITICAL hubs ✅
- ✅ **Tier 2:** 15/17 files complete (88%) - HIGH priority ships ✅
- ✅ **Tier 3:** 33/35 files complete (94%) - MEDIUM priority ships ✅
- 📦 **Tier 4:** 0/142 files complete (0%) - LOW priority ships

### Overall:
- **Total:** 157/303 files complete (52%)
- **Remaining:** 146 files to fix

---

## 🛠️ Fixing Strategy

### For Each File:
1. **Check** - Verify file doesn't already have complete hero-header
2. **Extract** - Get existing main content
3. **Inject** - Add production template (hero, nav, CSS, JS)
4. **Preserve** - Keep all existing content
5. **Test** - Verify navigation works, no duplication
6. **Mark** - Check off in this list

### Script Requirements:
- ✅ Detect existing hero-header (skip if present)
- ✅ No duplication of navigation
- ✅ Preserve all existing content
- ✅ Exclude /vendors/ folder
- ✅ Safe, reversible changes

---

## 🎯 Next Actions

1. **Build safe injection script** (2 hours)
2. **Fix Tier 1** - 5 cruise line hubs (1 hour)
3. **Fix Tier 2** - 17 flagship ships (2 hours)
4. **Fix Tier 3** - 35 popular ships (3 hours)
5. **Fix Tier 4** - 142 remaining ships (8 hours)

**Total estimated:** 16 hours to 100% completion

---

**Last Updated:** 2025-11-17  
**Progress:** 104/303 files (34%)
