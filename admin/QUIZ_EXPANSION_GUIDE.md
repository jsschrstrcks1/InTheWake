# Ship Quiz Expansion Guide

**Created:** 2026-01-02
**Last Updated:** 2026-01-02
**Purpose:** Document how to expand the multi-cruise-line ship quiz to additional cruise lines

---

## Overview

The ship selection quiz uses a weighted scoring system to recommend ships based on user preferences. This guide documents how to add new cruise lines and maintain existing data.

---

## Current Cruise Lines (v2.0)

| Cruise Line | Slug | Classes | Ships | Status |
|-------------|------|---------|-------|--------|
| Royal Caribbean | `rcl` | 7 | 28 | ✅ Complete |
| Carnival | `carnival` | 9 | ~25 | ⏳ In Progress |
| Norwegian | `ncl` | 9 | ~19 | ⏳ In Progress |
| MSC | `msc` | 8 | ~22 | ⏳ In Progress |

---

## Adding a New Cruise Line

### Step 1: Gather Class Information

From `assets/data/fleets.json`, identify all ship classes for the cruise line.

**Required per class:**
```json
{
  "class_slug": {
    "name": "Human-readable Class Name",
    "intensity": 0-10,           // Ship-as-destination vs port-focused
    "vibe": "descriptor_slug",   // e.g., "mega_flagship", "intimate_classic"
    "dining_variety": -2 to +4,  // Class-level food quality modifier
    "description": "2-3 sentence description",
    "best_for": ["Audience 1", "Audience 2"],
    "not_ideal_for": ["Audience 1", "Audience 2"],
    "avg_gt": 150000,            // Average gross tonnage
    "avg_capacity": 3500         // Average double-occupancy
  }
}
```

### Step 2: Gather Ship Information

For each active ship in the class:

```json
{
  "ship-slug": {
    "name": "Ship Name",
    "class": "class_slug",
    "year": 2024,
    "gt": 250800,
    "capacity": 5610,
    "status": "active",              // active | coming_soon | retired
    "amplified": false,              // true if major refurb (RCL-specific term)
    "amplified_year": null,
    "refurb_year": null,             // Last significant refurbishment
    "solo_studios": false,           // Has dedicated solo cabins
    "suite_class": true,             // Has premium suite program
    "suite_tiers": ["sea", "sky", "star"],
    "lng_fuel": true,                // LNG-powered (environmental)
    "weekend_positioned": false,     // Short getaway marketing
    "cdc_score": 97,                 // Most recent CDC inspection score
    "cdc_score_date": "2025-06",     // When score was recorded
    "highlights": ["Feature 1", "Feature 2"],
    "image": "/assets/social/ship-name.jpg",
    "page": "/ships/cruise-line/ship-name.html"
  }
}
```

### Step 3: Define Scoring Weights

Each cruise line needs scoring weights for all quiz questions. Use RCL as the template:

```json
"scoring_weights": {
  "energy_level": {
    "go_go_go": { "class1": 18, "class2": 16, ... },
    "balanced": { "class1": 14, "class2": 12, ... },
    "relax": { "class1": -12, "class2": 18, ... }
  },
  "crowd_tolerance": { ... },
  "budget_mindset": { ... },
  "sailing_length": { ... },
  "group_type": { ... },
  "ship_vs_ports": { ... }
}
```

**Weight Guidelines:**
- Strong positive: +14 to +18
- Moderate positive: +8 to +12
- Slight positive: +4 to +6
- Neutral: 0
- Slight negative: -4 to -6
- Strong negative: -10 to -15

### Step 4: Set Cruise Line Modifiers

```json
{
  "name": "Cruise Line Name",
  "slug": "line_slug",
  "food_modifier": 0,           // -5 to +6 based on research
  "food_modifier_casual": 0,    // Modifier when user prefers casual dining
  "classes": { ... },
  "ships": { ... },
  "scoring_weights": { ... }
}
```

### Step 5: Create Ship Pages (or Stub Pages)

- Full ship pages follow standards in `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md`
- Stub pages (for ships without full content) show "under construction" notice
- Quiz results link to ship pages; ships without pages still appear with "Page coming soon"

### Step 6: Add to Quiz Data File

Add the new cruise line to `assets/data/ship-quiz-data-v2.json`:

```json
{
  "model_version": "2.x",
  "cruise_lines": {
    "existing_line": { ... },
    "new_line": { ... }    // Add here
  }
}
```

### Step 7: Add Pill Button

In `ships/allshipquiz.html`, add the pill button to the selector:

```html
<button class="pill" data-line="new_line">New Cruise Line</button>
```

---

## Food Quality Scoring Formula

When dining matters to the user (`must_have = dining` OR `dining_style_preference = specialty_focused`):

```
Food Score =
    cruise_line_modifier     (-5 to +6)
  + class_dining_modifier    (-2 to +4)
  + amplified_bonus          (+1 if refurbished)
  + cdc_health_modifier      (-3 to +2)
```

### Cruise Line Food Modifiers (Research-Based)

| Cruise Line | Modifier | Rationale |
|-------------|----------|-----------|
| Royal Caribbean | **+6** | Best across MDR, buffet, specialty |
| Norwegian | **+2** | Solid but declining post-COVID |
| Carnival | **-3** | Weak MDR/buffet; casual saves it |
| MSC | **-5** | Consistent complaints; only Italian excels |

### Class Dining Modifiers

See `plan-quiz-v2-expansion.md` for complete class-by-class modifiers.

**General Pattern:**
- Newest/largest classes: +2 to +4 (more venues, better options)
- Mid-tier classes: 0 to +1
- Oldest/smallest classes: -1 to -2 (fewer options)

### CDC Health Inspection Modifier

| Score Range | Modifier | Notes |
|-------------|----------|-------|
| 100 | **+2** | Perfect score |
| 95-99 | **+1** | Excellent |
| 90-94 | **0** | Good (neutral) |
| 86-89 | **-2** | Marginal pass |
| Below 86 | **-3** | Failed inspection |

**Data Source:** [CDC Vessel Sanitation Program](https://wwwn.cdc.gov/inspectionquerytool/)

---

## Annual Maintenance Procedures

### January Update (Required)

Each January, update the following:

1. **CDC Scores**
   - Visit CDC Vessel Sanitation Program website
   - Update `cdc_score` and `cdc_score_date` for all ships
   - Flag any ships that failed (<86) for warning display

2. **Food Quality Review**
   - Search "[cruise line] food quality [year] reviews"
   - Check Cruise Critic, Reddit r/Cruise, TripAdvisor
   - Adjust class modifiers if significant patterns emerge
   - Document changes in this file

3. **Fleet Changes**
   - Add new ships (check cruise line press releases)
   - Mark retired ships as `status: "retired"`
   - Update `amplified` status for refurbished ships

4. **Class Updates**
   - Check if any ships changed class (rare)
   - Update intensity ratings if ship profiles have shifted

### Quarterly Check (Recommended)

- Monitor CDC scores for any dramatic changes
- Check for new ship announcements
- Review user feedback if available

---

## Intensity Scale Reference

| Score | Description | Example Classes |
|-------|-------------|-----------------|
| 10 | Maximum resort/activities | RCL Icon |
| 9 | Mega-ship with neighborhoods | RCL Oasis, Carnival Excel |
| 8 | Large modern with variety | NCL Breakaway Plus, MSC World |
| 7 | Balanced mainstream | RCL Quantum/Freedom, Carnival Vista |
| 6 | Classic mid-size | RCL Voyager, Carnival Conquest |
| 5 | Mid-size traditional | NCL Jewel, Carnival Spirit |
| 4 | Scenic/relaxed | RCL Radiance |
| 3 | Intimate/port-focused | RCL Vision, Carnival Fantasy |
| 2 | Small ship experience | (Luxury lines) |
| 1 | Expedition/yacht style | (Expedition lines) |

---

## Vibe Descriptors

Use consistent vibe slugs across cruise lines for similar experiences:

| Vibe Slug | Description |
|-----------|-------------|
| `max_resort_family` | Maximum activities, family paradise |
| `mega_variety_social` | Neighborhoods, social atmosphere |
| `modern_innovative_balanced` | Tech-forward, balanced appeal |
| `big_fun_value_balanced` | Classic big-ship fun, good value |
| `classic_goldilocks_value` | Not too big, not too small |
| `scenic_calm_ports` | Glass/views, relaxation focus |
| `simple_classic_ports_value` | Traditional, destination-focused |
| `party_flagship_mega` | High-energy flagship |
| `intimate_elegant` | Smaller, refined experience |
| `budget_short_getaway` | Value-priced short cruises |

---

## V2 Features

### "Why This Ship?" Explainer

Each result card includes a "Why This Ship?" button that reveals:

```
┌─────────────────────────────────────────────┐
│  Why Icon of the Seas?                      │
├─────────────────────────────────────────────┤
│  Your Preferences           Ship Match      │
│  ──────────────────         ──────────      │
│  ✅ High energy             +18 pts         │
│  ✅ Large ship okay         +14 pts         │
│  ✅ Family groups           +12 pts         │
│  ⚡ Ship-as-destination     +16 pts         │
│  🍽️ Food matters           +7 pts          │
│  ──────────────────         ──────────      │
│  Total Match Score:         67 pts          │
└─────────────────────────────────────────────┘
```

### URL Sharing Format

```
/ships/allshipquiz.html?line=rcl&r=icon-oasis-wonder
```

Parameters:
- `line`: Cruise line filter (all, rcl, carnival, ncl, msc)
- `r`: Encoded result (top 3 ships by slug)

---

## V2.1 Features (Post-Launch)

### "What If?" Toggle
Allows users to toggle between their answers and alternative responses to see how results change in real-time.

### Compare Top 3
Side-by-side comparison of the top 3 recommended ships with key differentiators highlighted.

### Take Quiz for Someone Else
Persona-based quizzing for vacation planning:
- Parents
- In-laws
- Kids
- Friends

---

## Future Cruise Lines to Consider

| Cruise Line | Parent Company | Complexity | Ship Pages Needed |
|-------------|----------------|------------|-------------------|
| Celebrity | RCL Group | Medium | ~14 ships |
| Princess | Carnival Corp | Medium | ~15 ships |
| Holland America | Carnival Corp | Medium | ~10 ships |
| Disney | Disney | Low (4 classes) | ~5 ships |
| Virgin Voyages | Virgin | Low (1 class) | ~4 ships |

---

## Data Validation Checklist

Before adding a new cruise line, verify:

- [ ] All active ships are included
- [ ] Each ship has a valid class assignment
- [ ] GT and capacity data is accurate
- [ ] CDC scores are current (within 12 months)
- [ ] Scoring weights sum to reasonable totals
- [ ] At least one ship page exists (or stub page planned)
- [ ] Food modifiers are research-backed
- [ ] `fleets.json` is updated with new classes/ships

---

## Changelog

### 2026-01-02
- Initial document creation
- Documented RCL, Carnival, NCL, MSC expansion
- Added CDC health inspection scoring
- Added annual maintenance procedures
- Added food quality scoring formula
- Changed `first_timer` (binary) → `cruise_experience` (3-tier: first_time / a_few / seasoned)
- Added V2 features: "Why This Ship?" explainer, URL sharing format
- Added V2.1 features: "What If?" toggle, Compare Top 3, Take Quiz for Someone Else
- Planning phase complete

---

**Soli Deo Gloria** ✝️
