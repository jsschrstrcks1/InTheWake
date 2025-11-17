# Navigation Phase 2: Production Template Upgrades Required

**Status:** 189 files (64% of site) need complete production template

**Current:** Phase 1 complete - 104 files (35%) have correct navigation  
**Remaining:** Phase 2 - 189 files need full template overhaul

---

## Problem

These 189 files are using an outdated, simplified template that's missing:

1. **`<header class="hero-header">` element** - Entire hero header section
2. **Logo and compass rose** - Brand identity elements
3. **Hero image** - Visual header/banner
4. **Complete card system** - Modern card-based layout
5. **Proper navigation structure** - Dropdown menus, z-index stacking
6. **Production CSS** - Full stylesheet matching v3.010.300 standards
7. **Accessibility features** - WCAG 2.1 AA compliance elements

Instead, they use a basic structure with:
- Simple `<header>` tags (not `.hero-header`)
- Minimal CSS
- No hero imagery
- Basic card styling
- Incomplete navigation

---

## Files Requiring Template Upgrade (189 total)

### Ships - Carnival (114 files)
All files in `ships/carnival/` and `ships/carnival-cruise-line/`:
- carnival-adventure.html
- carnival-breeze.html
- carnival-celebration.html
- carnival-conquest.html
- carnival-dream.html
- carnival-ecstasy.html
- carnival-elation.html
- carnival-encounter.html
- carnival-fantasy.html
- carnival-fascination.html
- carnival-festivale.html
- carnival-firenze.html
- carnival-freedom.html
- carnival-glory.html
- carnival-horizon.html
- carnival-imagination.html
- carnival-inspiration.html
- carnival-jubilee.html
- carnival-legend.html
- carnival-liberty.html
- carnival-luminosa.html
- carnival-magic.html
- carnival-mardi-gras.html
- carnival-miracle.html
- carnival-panorama.html
- carnival-paradise.html
- carnival-pride.html
- ... and 87 more Carnival ships

### Ships - Holland America (44 files)
All files in `ships/holland-america-line/`:
- amsterdam.html
- eurodam.html
- koningsdam.html
- maasdam.html
- nieuw-amsterdam.html
- nieuw-statendam.html
- noordam.html
- oosterdam.html
- prinsendam.html
- rotterdam.html
- ryndam.html
- statendam.html
- veendam.html
- volendam.html
- westerdam.html
- zaandam.html
- ... and 28 more Holland America ships

### Ships - Celebrity Cruises (29 files)
All files in `ships/celebrity-cruises/`:
- celebrity-apex.html
- celebrity-ascent.html
- celebrity-beyond.html
- celebrity-constellation.html
- celebrity-edge.html
- celebrity-eclipse.html
- celebrity-equinox.html
- celebrity-flora.html
- celebrity-infinity.html
- celebrity-millennium.html
- celebrity-reflection.html
- celebrity-silhouette.html
- celebrity-solstice.html
- celebrity-summit.html
- celebrity-xcel.html
- celebrity-xploration.html
- ... and 13 more Celebrity ships

### Cruise Lines (4 files)
- cruise-lines/carnival.html
- cruise-lines/celebrity.html
- cruise-lines/disney.html
- cruise-lines/holland-america.html
- cruise-lines/msc.html

### Other Pages (8 files)
- admin/reports/sw-health.html
- assets/ships/grandeur-of-the-seas.html (orphan file)
- ships/msc/msc-world-america.html
- ships/rooms.html
- offline.html
- stateroom-check.html
- terms.html

---

## Production Template Reference

Use these files as the "golden" template:

✅ **Primary references:**
- `index.html` - Homepage with full hero
- `ships.html` - Hub page with ship grid
- `ships/rcl/icon-of-the-seas.html` - Complete ship page
- `about-us.html` - Standard content page
- `solo.html` - Hub page with articles

✅ **Template documentation:**
- `NAVIGATION_COMPOSITE.md` - Complete nav HTML/CSS/JS
- `standards/starter.html` - Minimal production template

---

## Required Template Components

### 1. Hero Header Structure

```html
<header class="site-header hero-header" role="banner">
  <div class="navbar">
    <div class="brand">
      <img src="/assets/logo_wake.png?v=3.010.300" width="256" height="64" alt="In the Wake wordmark"/>
      <span class="tiny version-badge">v3.010.300</span>
    </div>
    <nav class="nav" aria-label="Main site navigation">
      <!-- Full dropdown navigation from NAVIGATION_COMPOSITE.md -->
    </nav>
  </div>

  <div class="hero" role="img" aria-label="Ship wake at sunrise">
    <div class="latlon-grid" aria-hidden="true"></div>
    <img class="hero-compass" src="/assets/compass_rose.svg?v=3.010.300" width="180" height="180" alt=""/>
    <div class="hero-title">
      <img class="logo" src="/assets/logo_wake.png?v=3.010.300" width="256" height="64" alt="In the Wake">
      <div class="tagline">A Cruise Traveler's Logbook</div>
    </div>
    <div class="hero-credit">
      <a class="pill long" href="https://instagram.com/flickersofmajesty">Photo © Flickers of Majesty</a>
    </div>
  </div>
</header>
```

### 2. Complete CSS Blocks Required

- `.hero-header` - Hero header container (z-index: 9000)
- `.navbar` - Navigation bar (z-index: 2000)
- `.brand` - Logo and version badge
- `.nav` - Navigation menu container
- `.nav-item` - Nav menu items
- `.nav-disclosure` - Dropdown buttons
- `.submenu` - Dropdown menus (z-index: 2100)
- `.hero` - Hero image section
- `.hero-compass` - Compass rose
- `.hero-title` - Title overlay
- `.latlon-grid` - Background grid
- Complete card system styles
- WCAG 2.1 AA accessibility styles

### 3. Required JavaScript

- Dropdown menu behavior (300ms hover delay)
- Keyboard navigation support
- Mobile responsive handling
- Focus management

### 4. SEO & Accessibility

- AI breadcrumbs comment
- Person schema (JSON-LD)
- Organization schema
- Breadcrumb schema
- OpenGraph tags
- Twitter cards
- ARIA labels and roles
- Skip links
- Screen reader elements

---

## Implementation Strategy

### Option 1: Automated Template Application (Recommended)

Create a Python script to:
1. Extract hero/nav/footer from reference files
2. Preserve existing main content
3. Inject production template structure
4. Update all file references
5. Test each file after conversion

**Pros:** Fast, consistent, repeatable  
**Cons:** Requires careful testing, may need manual fixes

### Option 2: Manual Template Application

For each file:
1. Open reference template (e.g., icon-of-the-seas.html)
2. Copy hero header section
3. Copy complete CSS block
4. Copy navigation JavaScript
5. Update page-specific content
6. Test dropdown navigation
7. Verify responsive design

**Pros:** More control, easier to verify  
**Cons:** Time-consuming (189 files × 15min = 47 hours)

### Option 3: Phased Rollout

Priority order:
1. **High-traffic ships** (top 20 by analytics)
2. **Cruise line hub pages** (5 pages)
3. **Remaining Carnival ships** (94 pages)
4. **Holland America ships** (44 pages)
5. **Celebrity Cruises ships** (29 pages)
6. **Misc pages** (7 pages)

**Pros:** Immediate impact on user experience  
**Cons:** Leaves some pages inconsistent

---

## Testing Checklist (Per File)

After applying production template:

- [ ] Page loads without errors
- [ ] Hero header displays correctly
- [ ] Logo and compass rose visible
- [ ] Navigation dropdowns work (hover + click)
- [ ] Z-index: dropdowns appear OVER content
- [ ] Keyboard navigation works (Tab, Arrow keys, Escape)
- [ ] Mobile: horizontal scrolling works
- [ ] Cards display properly
- [ ] All images load
- [ ] Links work
- [ ] Accessibility: screen reader compatible
- [ ] SEO: schemas validate

---

## Estimated Effort

### Automated Script Approach:
- Script development: 4-6 hours
- Testing & debugging: 4-6 hours
- Manual fixes for edge cases: 4-6 hours
- **Total: 12-18 hours**

### Manual Approach:
- Per file: 10-15 minutes
- 189 files × 12.5 min average = **39 hours**

### Phased Approach (Top 50 files):
- High-priority files: 50 × 15 min = **12.5 hours**

---

## Priority Recommendation

**Recommended:** Automated script approach with phased testing

1. Create template injection script (6 hours)
2. Test on 5 sample files from each directory (2 hours)
3. Run batch conversion on all 189 files (1 hour)
4. Manual QA spot-check of 20 random files (2 hours)
5. Fix edge cases discovered (4 hours)

**Total estimated time: 15 hours**

**Impact:** 
- Brings site from 35% to 100% navigation consistency
- Improves user experience across all cruise lines
- Ensures brand consistency site-wide
- Completes UNFINISHED_TASKS.md P0 #1

---

## Files Currently OK (104 files) ✅

These have correct navigation and don't need template upgrades:

**Root (14 files):**
- index.html
- ships.html
- planning.html
- travel.html
- solo.html
- accessibility.html
- about-us.html
- drink-calculator.html
- packing-lists.html
- disability-at-sea.html
- ports.html
- privacy.html
- restaurants.html
- cruise-lines.html

**Ships/RCL (50 files):**
- All Royal Caribbean ships in ships/rcl/

**Restaurants (25 files):**
- All restaurant pages

**Cruise Lines (5 files):**
- norwegian.html
- princess.html
- royal-caribbean.html
- viking.html
- virgin.html

**Authors (2 files):**
- ken-baker.html
- tina-maulsby.html

**Solo (3 files):**
- accessible-cruising.html
- freedom-of-your-own-wake.html
- visiting-the-united-states-before-your-cruise.html
- why-i-started-solo-cruising.html

**Other (5 files):**
- admin/reports/articles.html
- ships/index.html
- ships/grandeur-of-the-seas.html
- ships/template.html
- standards/starter.html

---

**Last Updated:** 2025-11-17  
**Phase 1 Completion:** 104/296 files (35%)  
**Phase 2 Target:** 296/296 files (100%)
