# Quiz Edge Cases & Improvements Plan

## Critical Edge Cases Found

### 1. **CRITICAL BUG: Only 4 Lines Scored in "All Lines" Mode**
**Location:** `ships/allshipquiz.html:1589-1591`
```javascript
const linesToScore = selectedLine === 'all'
  ? ['rcl', 'carnival', 'ncl', 'msc']  // HARDCODED to 4 lines!
  : [selectedLine];
```

**Impact:** Despite the UI showing 15 cruise lines, when "All Lines" is selected, only RCL, Carnival, NCL, and MSC are scored. The other 11 lines (Celebrity, Princess, Holland America, Cunard, Costa, Virgin Voyages, Oceania, Regent, Seabourn, Silversea, Explora) are completely ignored.

**Fix Required:** Update to include all 15 lines:
```javascript
const linesToScore = selectedLine === 'all'
  ? Object.keys(quizData.scoring_weights)
  : [selectedLine];
```

### 2. **"Also Like" Section Also Hardcoded to 4 Lines**
**Location:** `ships/allshipquiz.html:1705`
```javascript
const otherLines = ['rcl', 'carnival', 'ncl', 'msc'].filter(l => l !== selectedLine);
```

**Fix Required:** Update to dynamically use all lines:
```javascript
const otherLines = Object.keys(quizData.scoring_weights).filter(l => l !== selectedLine);
```

### 3. **Results Limited to 3 Ships**
**Location:** `ships/allshipquiz.html:1621`
```javascript
const topResults = allResults.slice(0, 3);
```

**User Request:** Implement configurable limit up to 10 ships.

### 4. **Match Percentage Capped at 99%**
**Location:** `ships/allshipquiz.html:1627`
```javascript
const matchPercent = Math.min(99, Math.round(50 + score));
```

**Status:** Appears intentional - creates psychological incentive ("so close to perfect!"). No change needed.

### 5. **Potential Null Reference in "Also Like" Cards**
**Location:** `ships/allshipquiz.html:1734`
```javascript
style="color:${r.lineData.colors.primary}"
```

**Risk:** If a cruise line is missing from `quizData.cruise_lines`, this will throw an error.

**Fix:** Add null check or fallback color.

---

## Feature Integration from Ship Atlas

### Ship Atlas Features Available for Integration

| Feature | Atlas Location | Integration Priority |
|---------|----------------|---------------------|
| Compare Drawer | `assets/js/ships-atlas.js:658-710` | HIGH |
| Ship Cards with Stats | `assets/js/ships-dynamic.js:388-424` | MEDIUM |
| Size Tier Colors | `assets/css/ships-atlas.css` (tier-mega, etc.) | MEDIUM |
| Ranked List View | `assets/js/ships-atlas.js:415-466` | LOW |
| Fuzzy Search | `assets/js/ships-atlas.js:595-648` | LOW |

### Comparison Drawer Design (from Atlas)

The atlas comparison drawer supports:
- **Max 5 ships** side-by-side comparison
- **Stats displayed:** GT, Guests (DO), Guests (Max), Length, Beam, Crew, Built
- **Remove functionality:** Individual X button per ship
- **Responsive grid layout**

**Code Pattern:**
```javascript
// Atlas comparison card structure
<div class="atlas-compare-card tier-${tier}">
  <button class="atlas-compare-remove" onclick="toggleCompare('${ship.id}')">×</button>
  <h4>${ship.name}</h4>
  <p class="tiny muted">${brand}</p>
  <dl class="atlas-compare-stats">
    <dt>GT</dt><dd>${formatNumber(ship.gt)}</dd>
    <dt>Guests</dt><dd>${formatNumber(ship.capacity)}</dd>
    <dt>Year</dt><dd>${ship.year}</dd>
    // etc.
  </dl>
</div>
```

---

## Implementation Plan

### Phase 1: Fix Critical Bugs (Required)

1. **Update linesToScore to include all 15 lines**
   - Line 1589-1591: Use `Object.keys(quizData.scoring_weights)`

2. **Update "Also Like" section to show all other lines**
   - Line 1705: Use dynamic line list instead of hardcoded array

3. **Add null safety for lineData access**
   - Add fallback colors for missing line data

### Phase 2: Implement 10-Ship Limit

**Design:**
- Change `topResults = allResults.slice(0, 3)` to `slice(0, 10)`
- Add "Show More" button to progressively reveal results
- Initial display: 3 ships (current behavior)
- Click "Show More": Reveal remaining ships up to 10

**UI Considerations:**
- Top 3 ships get full cards with images and details
- Ships 4-10 get compact cards (similar to "Also Like" style)
- "Top Pick" badge only on #1

### Phase 3: Add Comparison Drawer

**Design:**
- Add "Compare" button to each result card
- Max 5 ships can be compared
- Floating drawer at bottom of screen
- Side-by-side comparison of key stats:
  - Ship name and cruise line
  - Year built
  - Gross tonnage
  - Guest capacity
  - Match percentage
  - Key highlights
- "View Full Comparison" link to expanded view

**UI Components Needed:**
1. Compare toggle button on each result card
2. Fixed-position compare tray at bottom
3. Compare card template
4. Clear all button
5. Expanded comparison modal (optional)

### Phase 4: Enhanced Results Display

**From Atlas:**
- Size tier color coding (mega=purple, large=blue, mid=cyan, small=green)
- Visual bars showing relative size
- CDC/SHIPSAN health scores display
- "Explore Ship" CTA buttons

---

## Recommended CSS Classes from Atlas

```css
/* Size tier colors */
.tier-mega { background: #7c3aed; }
.tier-large { background: #2563eb; }
.tier-mid { background: #0891b2; }
.tier-small { background: #059669; }

/* Compare tray styling */
.compare-tray {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--sky);
  border-top: 2px solid var(--rope);
  padding: 1rem;
  z-index: 100;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}
.compare-tray.visible { transform: translateY(0); }
```

---

## Files to Modify

1. `ships/allshipquiz.html` - Main quiz logic and UI
2. `assets/data/ship-quiz-data-v2.json` - No changes needed (data is complete)
3. `assets/css/` - May need new CSS file for comparison drawer

## Estimated Complexity

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1 | Low | Low |
| Phase 2 | Medium | Low |
| Phase 3 | High | Medium |
| Phase 4 | Medium | Low |

---

## Questions for User

1. Should the comparison drawer persist across page navigation (localStorage)?
2. For the 10-ship limit, should we show all 10 at once or use progressive disclosure?
3. Should luxury/adults-only lines show a warning for family group selections?
4. Should we add filtering options to the results (by cruise line, ship size, etc.)?
