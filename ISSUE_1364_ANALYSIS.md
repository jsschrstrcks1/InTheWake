# Issue #1364: Carnival Horizon Duplicate Sections Analysis

**Status:** RESEARCH COMPLETE | Resolution planned  
**File:** `/ships/carnival/carnival-horizon.html`  
**Date:** 2026-05-25  
**Severity:** MEDIUM (UX confusion, redundant code, accessibility complexity)

---

## Executive Summary

Carnival Horizon page has **three duplicate section groups**:

1. **Video Tours** (line 611-624) + **Watch: Carnival Horizon Highlights** (line 677-690)
2. **Live Ship Tracker** (line 625-637) + **Live Ship Tracker** (line 698-704)
3. **Deck Plans** (commented out at line 624) + **Deck Plans & Tracker Grid** (line 688-704)

The duplicates exist in **two different page layouts**:
- **PRIMARY**: Lines 400-685 (main content column, `<section class="col-1">`)
- **SECONDARY**: Lines 677-830 (post-main footer/aside area)

The secondary duplicates appear to be **copy-paste remnants** from a page template refactor where both layouts were left in the file.

---

## Detailed Findings

### 1. Video Section Duplication

**FIRST OCCURRENCE** (line 611-624):
```html
<!-- Video Tours -->
<section class="card" aria-labelledby="videos-title">
  <h2 id="videos-title">Video Tours &amp; Reviews</h2>
  <div class="video-carousel swiper" id="video-swiper" aria-label="Carnival Horizon video gallery">
    <div class="swiper-wrapper" id="video-wrapper">
      <!-- Dynamic video thumbnails load here -->
    </div>
    <div class="swiper-button-prev" aria-label="Previous video"></div>
    <div class="swiper-button-next" aria-label="Next video"></div>
  </div>
  <p class="tiny" style="margin-top: 0.75rem;">Videos sourced from YouTube creators. Click to watch.</p>
</section>
```

**SECOND OCCURRENCE** (line 677-690):
```html
<!-- Videos -->
<section class="card" aria-labelledby="video-highlights">
  <h2 id="video-highlights">Watch: Carnival Horizon Highlights</h2>
  <p class="small">Swipe through ship walkthroughs, top-10s, and stateroom tours.</p>
  <div class="swiper videos" aria-label="Featured video carousel">
    <div class="swiper-wrapper" id="featuredVideos"></div>
    <div class="swiper-pagination" ></div>
    <div class="swiper-button-prev" aria-label="Previous slide"></div>
    <div class="swiper-button-next" aria-label="Next slide"></div>
  </div>
  <div id="videoFallback" class="tiny hidden">Videos will appear once our sources sync for this ship.</div>
</section>
```

**Issue:** Two video carousels with different IDs (`video-swiper` vs `videos`), different aria labels, different loading messages. Both target the same data source (`/assets/data/videos/carnival/carnival-horizon.json`).

**Impact:**
- Users see two "Videos" sections on page
- JavaScript initializes two separate Swiper instances (performance waste)
- Duplicate data load attempts
- Confusing UX — which videos to watch?
- Both have fallback loaders but different ID selectors

---

### 2. Live Ship Tracker Duplication

**FIRST OCCURRENCE** (line 625-637):
```html
<!-- Live Ship Tracker -->
<section class="card" aria-labelledby="tracker-title">
  <h2 id="tracker-title">Live Ship Tracker</h2>
  <p>Track Carnival Horizon's current position in real-time:</p>
  <div class="tracker-container">
    <iframe title="Carnival Horizon Live Position via MarineTraffic" 
            src="https://www.marinetraffic.com/en/ais/embed/zoom:10/centery:25.8/centerx:-80.2/maptype:1/shownames:true/mmsi:370039000/shipid:5769813/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false" 
            loading="lazy" referrerpolicy="no-referrer"></iframe>
  </div>
  <p class="tiny" style="margin-top: 0.75rem;">
    <strong>Current Homeport:</strong> Miami, Florida<br/>
    <strong>Typical Itineraries:</strong> Eastern Caribbean (Half Moon Cay, Amber Cove, Grand Turk), Western Caribbean (Cozumel, Grand Cayman, Mahogany Bay)
  </p>
</section>
```

**SECOND OCCURRENCE** (line 698-704):
```html
<section class="card itinerary" aria-labelledby="liveTrackHeading" data-imo="9688057" data-name="CARNIVALHORIZON">
  <h2 id="liveTrackHeading">Live Ship Tracker</h2>
  <div id="ship-tracker-container">
    <p>Track Carnival Horizon's current position and voyage details.</p>
  </div>
</section>
```

**Issue:**
- First is a **direct MarineTraffic iframe** with full tracking data
- Second is an **empty div** with a load placeholder (`#ship-tracker-container`) expecting JS to populate it
- Different tracking data sources (MarineTraffic vs VesselFinder/custom)
- The first is functional; the second relies on JavaScript that may or may not initialize
- Different heading IDs (`tracker-title` vs `liveTrackHeading`)

**Impact:**
- User confusion: two identical-looking sections, one working, one potentially blank
- Accessibility issue: two headings with same text
- Redundant data loads and rendering

---

### 3. Deck Plans Duplication

**FIRST OCCURRENCE** (line 624 — commented out):
```html
<!-- Deck Plans -->
```

**SECOND OCCURRENCE** (line 688-697):
```html
<!-- Deck Plans & Tracker Grid -->
<div class="grid-2">
  <section class="card" aria-labelledby="deck-plans">
    <h2 id="deck-plans">Carnival Horizon Deck Plans</h2>
    <div id="ship-map" data-ship="carnival-horizon">
      <p>Interactive deck plans for Carnival Horizon are available on the cruise line's official website.</p>
    </div>
  </section>
  <!-- ... Live Tracker second occurrence ... -->
</div>
```

**Issue:**
- First occurrence is just a comment (no actual section)
- Second occurrence is the functional version but appears in footer area
- Deck plans should appear once, prominently, in main content area
- Currently in a grid layout with Live Tracker (which is also duplicated)

---

### 4. Photo Carousel Duplication (Secondary Issue)

Within the "First Look: Carnival Horizon" section (lines 530-570), there are **nested, redundant photo slides**:

**Pattern:**
```html
<div class="swiper-slide">
  <img src="/assets/ships/carnival-horizon_01.webp" ... />
  <p class="photo-caption">...</p>
  
  <!-- THEN NESTED AGAIN: -->
  <div class="swiper-slide">
    <figure>
      <img src="/assets/ships/Carnival_Horizon_s_bow.jpg" ... />
      <figcaption>...</figcaption>
    </figure>
  </div>
  
  <!-- AND AGAIN... -->
  <div class="swiper-slide">
    <figure>
      <img src="/assets/ships/Carnival_Horizon_s_bow.jpg" ... />
      ...
    </figure>
  </div>
  <!-- Repeats 4-5 times per initial slide -->
</div>
```

**Issue:**
- Slides are nested improperly (swiper-slide inside swiper-slide)
- Same images appear multiple times
- Swiper carousel won't render correctly
- HTML structure violates carousel markup rules

**Impact:**
- Photos won't display in carousel
- Users see no ship imagery
- JavaScript carousel init fails silently
- Accessibility: broken figure/figcaption semantics

---

## Root Cause Analysis

**Hypothesis:** 
The page underwent a layout refactor:
1. Original: Single-column layout with main content sections
2. Updated: Two-column layout (main content + aside rail)
3. **Error:** Both versions left in the HTML file

**Evidence:**
- Lines 400-685: Complete, well-formed sections (Video, Live Tracker, FAQ, etc.)
- Lines 677-830: Incomplete/stubbed versions of the same sections
- The second set appears incomplete (e.g., Live Tracker missing iframe, Deck Plans minimal)
- Comment at line 624: `<!-- Deck Plans -->` suggests an incomplete transition

---

## Resolution Plan

### Phase 1: Remove Duplicate Sections (PRIMARY FIX)
**Delete lines 677-705** (the second "Videos", "Watch: Highlights", and "Live Ship Tracker"):
```html
<!-- Videos -->
<section class="card" aria-labelledby="video-highlights">
  ... (entire section, ~20 lines)
</section>

<!-- Deck Plans & Tracker Grid -->
<div class="grid-2">
  <section class="card" aria-labelledby="deck-plans"> ... </section>
  <section class="card itinerary" aria-labelledby="liveTrackHeading"> ... </section>
</div>
```

**Keep:** Lines 400-676 (primary content sections including Video Tours, Live Ship Tracker, Deck Plans in proper layout)

### Phase 2: Fix Photo Carousel Nesting (CRITICAL)
**Fix:** Lines 530-570  
**Action:** Remove all nested `<div class="swiper-slide">` elements. Keep only one slide per photo:

```html
<!-- BEFORE (BROKEN) -->
<div class="swiper-slide">
  <img src="/assets/ships/carnival-horizon_01.webp" ... />
  <div class="swiper-slide">
    <figure><img src="/assets/ships/Carnival_Horizon_s_bow.jpg" ... /></figure>
  </div>
</div>

<!-- AFTER (FIXED) -->
<div class="swiper-slide">
  <img src="/assets/ships/carnival-horizon_01.webp" ... />
  <p class="photo-caption">Carnival Horizon docked in Cozumel...</p>
</div>
<div class="swiper-slide">
  <img src="/assets/ships/Carnival_Horizon_s_bow.jpg" ... />
  <p class="photo-caption">Carnival Horizon docked in Cozumel...</p>
</div>
```

### Phase 3: Validate & Test
**Checklist:**
- [ ] HTML validates (no nested slides, proper heading hierarchy)
- [ ] Video carousel renders with Swiper
- [ ] Photos carousel displays all ships images
- [ ] Live tracker iframe loads MarineTraffic
- [ ] No console errors (JS init on both carousels)
- [ ] Accessibility: heading IDs are unique, aria-labels correct
- [ ] Page load performance: only one video loader, one tracker loader

---

## Files Affected

- **Target:** `/Volumes/1TB External/Projects/InTheWake/ships/carnival/carnival-horizon.html`
- **Data sources (unchanged):**
  - `/assets/data/videos/carnival/carnival-horizon.json`
  - `/assets/data/logbook/carnival/carnival-horizon.json`
  - MarineTraffic iframe (external)

---

## Testing Strategy

1. **Structural Validation:**
   - Run through HTML validator
   - Check Swiper carousel initialization (browser DevTools)
   - Verify JS console for errors

2. **Visual Testing:**
   - Load page in browser
   - Verify photos appear in carousel (all 6-8 images)
   - Verify video carousel loads without errors
   - Verify Live Tracker iframe renders

3. **Accessibility Audit:**
   - Heading order: h1 → h2s (no duplicates)
   - ARIA labels unique and descriptive
   - Carousel keyboard navigation works

4. **Performance Check:**
   - One Swiper instance for photos
   - One Swiper instance for videos
   - One MarineTraffic iframe load
   - Network tab: no duplicate requests

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Break existing page layout | Low | Keep primary sections; delete only duplicates |
| JS carousel init fails | Low | Both carousels have same init code; removing second one removes duplicate init |
| Photo carousel still doesn't render | Medium | Photo carousel is broken due to nesting; fixing nesting is critical fix |
| Lose data | Very Low | No data deletion; only HTML structure changes |

---

## Rollback Plan

If issues arise:
1. Revert to last good commit: `git revert <commit-hash>`
2. Manually restore Photo carousel structure from backup
3. Re-run validator

---

## Next Steps

1. Audit other ship pages for same duplication pattern
2. Create template documentation (to prevent future copy-paste errors)
3. Add pre-commit validation to catch duplicate section IDs

