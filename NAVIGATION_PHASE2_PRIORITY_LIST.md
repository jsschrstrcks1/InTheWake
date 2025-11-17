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
**Status:** Not started

**Carnival (Top 6):**
- [ ] ships/carnival/carnival-mardi-gras.html (Flagship - 2020)
- [ ] ships/carnival/carnival-celebration.html (New - 2022)
- [ ] ships/carnival/carnival-jubilee.html (New - 2023)
- [ ] ships/carnival/carnival-venezia.html (New - 2024)
- [ ] ships/carnival/carnival-firenze.html (Rebranded - 2024)
- [ ] ships/carnival/carnival-vista.html (Vista-class lead - 2016)

**Holland America (Top 6):**
- [ ] ships/holland-america-line/rotterdam.html (Newest - 2021)
- [ ] ships/holland-america-line/nieuw-statendam.html (2018)
- [ ] ships/holland-america-line/koningsdam.html (2016)
- [ ] ships/holland-america-line/eurodam.html (Popular)
- [ ] ships/holland-america-line/noordam.html (Popular)
- [ ] ships/holland-america-line/nieuw-amsterdam.html (Popular)

**Celebrity (Top 5):**
- [ ] ships/celebrity-cruises/celebrity-edge.html (Edge-class lead - 2018)
- [ ] ships/celebrity-cruises/celebrity-apex.html (2020)
- [ ] ships/celebrity-cruises/celebrity-beyond.html (2022)
- [ ] ships/celebrity-cruises/celebrity-ascent.html (Newest - 2023)
- [ ] ships/celebrity-cruises/celebrity-xcel.html (Coming 2025)

**Other:**
- [ ] ships/msc/msc-world-america.html (MSC newest)
- [ ] stateroom-check.html (Tool page)

---

### 📊 Tier 3: MEDIUM - Popular Ships (30 files)
**Impact:** Solid traffic, good ROI  
**Status:** Not started

**Carnival (15 more popular ships):**
- [ ] ships/carnival/carnival-horizon.html
- [ ] ships/carnival/carnival-panorama.html
- [ ] ships/carnival/carnival-dream.html
- [ ] ships/carnival/carnival-breeze.html
- [ ] ships/carnival/carnival-magic.html
- [ ] ships/carnival/carnival-conquest.html
- [ ] ships/carnival/carnival-glory.html
- [ ] ships/carnival/carnival-liberty.html
- [ ] ships/carnival/carnival-valor.html
- [ ] ships/carnival/carnival-freedom.html
- [ ] ships/carnival/carnival-miracle.html
- [ ] ships/carnival/carnival-splendor.html
- [ ] ships/carnival/carnival-legend.html
- [ ] ships/carnival/carnival-pride.html
- [ ] ships/carnival/carnival-spirit.html

**Holland America (10 more):**
- [ ] ships/holland-america-line/westerdam.html
- [ ] ships/holland-america-line/oosterdam.html
- [ ] ships/holland-america-line/zuiderdam.html
- [ ] ships/holland-america-line/volendam.html
- [ ] ships/holland-america-line/zaandam.html
- [ ] ships/holland-america-line/amsterdam.html
- [ ] ships/holland-america-line/maasdam.html
- [ ] ships/holland-america-line/veendam.html
- [ ] ships/holland-america-line/ryndam.html
- [ ] ships/holland-america-line/statendam.html

**Celebrity (10 more):**
- [ ] ships/celebrity-cruises/celebrity-equinox.html
- [ ] ships/celebrity-cruises/celebrity-solstice.html
- [ ] ships/celebrity-cruises/celebrity-reflection.html
- [ ] ships/celebrity-cruises/celebrity-silhouette.html
- [ ] ships/celebrity-cruises/celebrity-eclipse.html
- [ ] ships/celebrity-cruises/celebrity-millennium.html
- [ ] ships/celebrity-cruises/celebrity-summit.html
- [ ] ships/celebrity-cruises/celebrity-constellation.html
- [ ] ships/celebrity-cruises/celebrity-infinity.html
- [ ] ships/celebrity-cruises/celebrity-flora.html

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
- ⭐ **Tier 2:** 0/17 files complete (0%) - HIGH priority ships
- 📊 **Tier 3:** 0/35 files complete (0%) - MEDIUM priority ships
- 📦 **Tier 4:** 0/142 files complete (0%) - LOW priority ships

### Overall:
- **Total:** 109/303 files complete (36%)
- **Remaining:** 194 files to fix

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
