# Ship Quiz V2 Expansion Plan

**Created:** 2026-01-02
**Last Updated:** 2026-01-02
**Status:** Planning Complete — Ready for Implementation
**Target File:** `ships/allshipquiz.html` → rename to `ships/quiz.html` when complete
**Expansion Guide:** `admin/QUIZ_EXPANSION_GUIDE.md`

---

## Overview

Expand the existing RCL-only ship quiz to support 4 cruise lines via pill selector UI. Same questions, different result pools based on selection.

---

## UI Design

```
┌──────────────────────────────────────────────────────────────┐
│  Find Your Perfect Ship                                      │
│                                                              │
│  ┌─────┐ ┌──────────────────┐ ┌──────────┐ ┌─────┐ ┌─────┐  │
│  │ ALL │ │ Royal Caribbean  │ │ Carnival │ │ NCL │ │ MSC │  │
│  └─────┘ └──────────────────┘ └──────────┘ └─────┘ └─────┘  │
│    ○            ○                  ○          ○       ○      │
│                                                              │
│  [Same 8 questions for all selections]                       │
│                                                              │
│  → Results filtered to selected line(s)                      │
└──────────────────────────────────────────────────────────────┘
```

### Pill Behavior

| Selection | Behavior |
|-----------|----------|
| **ALL** | Scores all 4 cruise lines → Top 3 ships across all lines |
| **Royal Caribbean** | Scores 7 RCL classes → Top 3 RCL ships |
| **Carnival** | Scores 9 Carnival classes → Top 3 Carnival ships |
| **NCL** | Scores 9 NCL classes → Top 3 NCL ships |
| **MSC** | Scores 8 MSC classes → Top 3 MSC ships |

---

## Questions (Universal Across All Lines)

### Existing Questions (Keep As-Is)

| # | ID | Question |
|---|-----|----------|
| 1 | `group_type` | Who's sailing with you? |
| 2 | `first_timer` | Is this your first cruise? |
| 3 | `energy_level` | What's your ideal vacation pace? |
| 4 | `crowd_tolerance` | How do you feel about crowds? |
| 5 | `ship_vs_ports` | Ship or destinations—what matters more? |
| 6 | `sailing_length` | How long do you want to sail? |
| 7 | `budget_mindset` | What's your budget philosophy? |

### Question 8: Must-Have (Updated for Universal)

| Option | Icon | Covers |
|--------|------|--------|
| Water Slides & Pools | 🌊 | RCL waterparks, Carnival waterworks, NCL aqua park, MSC slides |
| Specialty Dining | 🍽️ | All lines have specialty restaurants |
| Live Shows & Entertainment | 🎭 | Broadway (RCL/NCL), Playlist Productions (Carnival), Cirque (MSC) |
| Unique Thrills | 🎢 | BOLT coaster, Go-Karts, iFly, North Star, rope courses |
| Scenic & Relaxation | 🌅 | Glass/views, adult-only areas, spas |
| Kids & Family Zones | 👨‍👩‍👧‍👦 | All lines' kids clubs and family areas |
| No Dealbreaker | 🤷 | Open to anything |

---

## Complete Food Quality Scoring System

### Formula

When dining matters to the user (`must_have = dining` OR `dining_style_preference = specialty_focused`):

```
Food Score =
    cruise_line_modifier     (-5 to +6)
  + class_dining_modifier    (-2 to +4)
  + amplified_bonus          (+1 if refurbished)
  + cdc_health_modifier      (-3 to +2)
```

**Maximum possible:** +6 + 4 + 1 + 2 = **+13** (RCL Icon, perfect CDC)
**Minimum possible:** -5 + (-2) + 0 + (-3) = **-10** (MSC Lirica, failed CDC)

---

### Layer 1: Cruise Line Modifiers

**Standard Dining (MDR, Buffet, Specialty):**

| Cruise Line | Modifier | Rationale |
|-------------|----------|-----------|
| **Royal Caribbean** | **+6** | Best across MDR, buffet, specialty |
| **Norwegian** | **+2** | Solid but declining post-COVID |
| **Carnival** | **-3** | Weak MDR/buffet; casual saves it |
| **MSC** | **-5** | Consistent complaints; only Italian excels |

**Casual Dining Only (`dining_style_preference = casual_only`):**

| Cruise Line | Modifier | Rationale |
|-------------|----------|-----------|
| **Carnival** | **+6** | Guy's, BlueIguana, Shaq's standouts |
| **Royal Caribbean** | **+4** | Sorrento's, El Loco Fresh solid |
| **Norwegian** | **+4** | O'Sheehan's 24/7 praised |
| **MSC** | **+2** | Pizza is good (Italian heritage) |

---

### Layer 2: Class Dining Modifiers

#### Royal Caribbean

| Class | Modifier | Notes |
|-------|----------|-------|
| **Icon** | **+2** | 40+ venues, newest concepts |
| **Oasis** | **+1** | Great variety, MDR service can lag |
| **Quantum** | **+1** | Modern venues, solid specialty |
| **Freedom** | **0** | Standard RCL experience |
| **Voyager** | **0** | Showing age, fewer options |
| **Radiance** | **-1** | Smaller buffet, limited specialty |
| **Vision** | **-1** | Fewest venues, dated |

#### Carnival

| Class | Modifier | Notes |
|-------|----------|-------|
| **Excel** | **+3** | ChiBang & Cucina free, Emeril, Big Chicken |
| **Vista** | **+1** | Good specialty options, modern |
| **Dream** | **+1** | Solid venues, well-maintained |
| **Venice** | **+1** | European flair, newer |
| **Conquest** | **0** | Standard Carnival, reliable |
| **Splendor** | **0** | Single ship, average |
| **Sunshine** | **0** | Refreshed but basic venues |
| **Spirit** | **-1** | Older, fewer options |
| **Fantasy** | **-2** | Very dated, limited options |

#### Norwegian

| Class | Modifier | Notes |
|-------|----------|-------|
| **Breakaway Plus** | **+2** | Best-reviewed for dining, 3 MDRs |
| **Prima/Prima+** | **+1** | Indulge Food Hall, but inconsistent service |
| **Breakaway** | **+1** | Good variety, solid |
| **Epic** | **0** | Good options, showing age |
| **Jewel** | **0** | Well-liked, classic experience |
| **Pride of America** | **0** | Unique (Hawaii), standard |
| **Dawn** | **-1** | Older, standard |
| **Sun** | **-1** | Limited options |
| **Spirit** | **-2** | Oldest, fewest venues |

#### MSC

| Class | Modifier | Notes |
|-------|----------|-------|
| **World** | **+4** | Eataly at sea, major improvement |
| **Meraviglia-Plus** | **+1** | Better than older, modern venues |
| **Seaside EVO** | **+1** | Improved over original Seaside |
| **Meraviglia** | **0** | Mixed reviews, crowding issues |
| **Seaside** | **0** | Mixed, buffet complaints |
| **Fantasia** | **-1** | European style, inconsistent |
| **Musica** | **-1** | Older, repetitive buffet |
| **Lirica** | **-2** | Oldest, cold food complaints |

---

### Layer 3: Amplified/Refurbishment Bonus

| Status | Modifier |
|--------|----------|
| Amplified (RCL) or major refurb within 5 years | **+1** |
| No recent refurbishment | **0** |

---

### Layer 4: CDC Health Inspection Modifier

**Data Source:** [CDC Vessel Sanitation Program](https://wwwn.cdc.gov/inspectionquerytool/)

| Score Range | Modifier | Status |
|-------------|----------|--------|
| **100** | **+2** | Perfect |
| **95-99** | **+1** | Excellent |
| **90-94** | **0** | Good (neutral) |
| **86-89** | **-2** | Marginal pass |
| **Below 86** | **-3** | Failed inspection |

#### Known CDC Scores (2025 Data)

**Royal Caribbean:**
| Ship | Score | Modifier |
|------|-------|----------|
| Allure of the Seas | 100 | +2 |
| Jewel of the Seas | 100 | +2 |
| Mariner of the Seas | 100 | +2 |
| Rhapsody of the Seas | 100 | +2 |
| Symphony of the Seas | 100 | +2 |
| Anthem of the Seas | 99 | +1 |
| Liberty of the Seas | 99 | +1 |
| Vision of the Seas | 99 | +1 |
| Adventure of the Seas | 98 | +1 |
| Brilliance of the Seas | 98 | +1 |
| Grandeur of the Seas | 98 | +1 |
| Harmony of the Seas | 98 | +1 |
| Ovation of the Seas | 98 | +1 |
| Radiance of the Seas | 98 | +1 |
| Serenade of the Seas | 98 | +1 |
| Enchantment of the Seas | 97 | +1 |
| Odyssey of the Seas | 97 | +1 |
| Quantum of the Seas | 97 | +1 |
| Voyager of the Seas | 97 | +1 |
| Freedom of the Seas | 96 | +1 |
| Harmony of the Seas | 96 | +1 |
| Navigator of the Seas | 96 | +1 |
| Wonder of the Seas | 95 | +1 |
| Explorer of the Seas | 93 | 0 |
| Independence of the Seas | 93 | 0 |
| Oasis of the Seas | 92 | 0 |

**Carnival:**
| Ship | Score | Modifier |
|------|-------|----------|
| Celebration | 100 | +2 |
| Conquest | 100 | +2 |
| Panorama | 100 | +2 |
| Venezia | 100 | +2 |
| Miracle | 99 | +1 |
| Spirit | 99 | +1 |
| Radiance | 98 | +1 |
| Breeze | 97 | +1 |
| Luminosa | 97 | +1 |
| Magic | 97 | +1 |
| Mardi Gras | 97 | +1 |
| Paradise | 97 | +1 |
| Sunrise | 97 | +1 |
| Freedom | 96 | +1 |
| Glory | 96 | +1 |
| Valor | 96 | +1 |
| Horizon | 95 | +1 |
| Dream | 94 | 0 |
| Elation | 93 | 0 |
| Liberty | 93 | 0 |
| Splendor | 93 | 0 |
| Vista | 93 | 0 |
| Legend | 90 | 0 |
| Pride | 86 | -2 |

**Norwegian:**
| Ship | Score | Modifier |
|------|-------|----------|
| Bliss | 100 | +2 |
| Breakaway | 100 | +2 |
| Escape | 100 | +2 |
| Gem | 100 | +2 |
| Jade | 100 | +2 |
| Jewel | 100 | +2 |
| Joy | 100 | +2 |
| Pearl | 100 | +2 |
| Sky | 100 | +2 |
| Sun | 100 | +2 |
| Escape | 99 | +1 |
| Jewel | 99 | +1 |
| Breakaway | 98 | +1 |
| Dawn | 98 | +1 |
| Encore | 98 | +1 |
| Sky | 98 | +1 |
| Prima | 97 | +1 |
| Spirit | 97 | +1 |
| Getaway | 95 | +1 |
| Gem | 94 | 0 |
| Star | 94 | 0 |
| Jade | 92 | 0 |
| Epic | 89 | -2 |

**MSC:**
| Ship | Score | Modifier |
|------|-------|----------|
| Lirica | 100 | +2 |
| Seascape | 100 | +2 |
| Meraviglia | 100 | +2 |
| Seashore | 100 | +2 |
| (Most others) | 90-99 | 0 to +1 |
| Magnifica | 86 | -2 |

---

### Example Food Score Calculations

| Ship | Line | Class | Amp | CDC | Total |
|------|------|-------|-----|-----|-------|
| Icon of the Seas | +6 | +2 | 0 | +1 | **+9** |
| Carnival Celebration | -3 | +3 | 0 | +2 | **+2** |
| Norwegian Encore | +2 | +2 | 0 | +1 | **+5** |
| MSC World America | -5 | +4 | 0 | +1 | **0** |
| Grandeur of the Seas | +6 | -1 | 0 | +1 | **+6** |
| Carnival Pride | -3 | -1 | 0 | -2 | **-6** |
| Norwegian Epic | +2 | 0 | 0 | -2 | **0** |
| MSC Armonia | -5 | -2 | 0 | 0 | **-7** |

---

## Ship Classes by Cruise Line

### Royal Caribbean (7 classes) — COMPLETE ✅

| Class | Intensity | Vibe | Dining Mod |
|-------|-----------|------|------------|
| Icon | 10 | max_resort_family | +2 |
| Oasis | 9 | mega_variety_social | +1 |
| Quantum | 7 | modern_innovative_balanced | +1 |
| Freedom | 7 | big_fun_value_balanced | 0 |
| Voyager | 6 | classic_goldilocks_value | 0 |
| Radiance | 4 | scenic_calm_ports | -1 |
| Vision | 3 | simple_classic_ports_value | -1 |

### Carnival (9 classes) — TO CREATE

| Class | Ships | Intensity | Vibe | Dining Mod |
|-------|-------|-----------|------|------------|
| Excel | Mardi Gras, Celebration, Jubilee | 9 | party_flagship_mega | +3 |
| Venice | Firenze, Venezia | 7 | eurozone_premium | +1 |
| Vista | Vista, Horizon, Panorama | 8 | modern_family_fun | +1 |
| Dream | Dream, Magic, Breeze | 7 | balanced_mainstream | +1 |
| Conquest | Conquest, Glory, Valor, Liberty, Freedom | 6 | classic_workhorse | 0 |
| Spirit | Spirit, Pride, Legend, Miracle, Luminosa | 5 | intimate_elegant | -1 |
| Splendor | Splendor | 6 | solo_workhorse | 0 |
| Sunshine | Sunshine, Sunrise, Radiance | 5 | refreshed_classic | 0 |
| Fantasy | Paradise, Elation | 3 | budget_short_getaway | -2 |

### Norwegian (9 classes) — TO CREATE

| Class | Ships | Intensity | Vibe | Dining Mod |
|-------|-------|-----------|------|------------|
| Prima/Prima+ | Aqua, Viva, Prima | 9 | modern_innovative_flagship | +1 |
| Breakaway Plus | Encore, Bliss, Joy, Escape | 8 | mega_variety | +2 |
| Breakaway | Getaway, Breakaway | 7 | mainstream_balanced | +1 |
| Epic | Epic | 7 | solo_friendly_mega | 0 |
| Jewel | Gem, Pearl, Jade, Jewel | 6 | mid_size_classic | 0 |
| Pride of America | Pride of America | 5 | hawaii_specialist | 0 |
| Dawn | Dawn, Star | 5 | classic_mid_size | -1 |
| Sun | Sun, Sky | 4 | intimate_value | -1 |
| Spirit | Spirit | 4 | intimate_classic | -2 |

### MSC (8 classes) — TO CREATE

| Class | Ships | Intensity | Vibe | Dining Mod |
|-------|-------|-----------|------|------------|
| World | World America, World Europa | 9 | mega_flagship | +4 |
| Meraviglia-Plus | Euribia, Virtuosa, Grandiosa | 8 | large_modern | +1 |
| Seaside EVO | Seascape, Seashore | 8 | beach_resort_style | +1 |
| Meraviglia | Bellissima, Meraviglia | 7 | mainstream_modern | 0 |
| Seaside | Seaview, Seaside | 7 | outdoor_focused | 0 |
| Fantasia | Preziosa, Divina, Magnifica, Splendida, Fantasia | 6 | classic_euro | -1 |
| Musica | Poesia, Orchestra, Musica | 5 | mid_size_euro | -1 |
| Lirica | Opera, Lirica, Sinfonia, Armonia | 4 | intimate_euro | -2 |

---

## Ships Without Pages

**Decision:** Show ship in results with link to stub page. Stub pages handled in separate thread.

**Result card display:**
- Full ship recommendation with match %, specs, highlights
- Link goes to stub page with "under construction" notice
- Ship class badge still displays

---

## ALL Mode Logic

1. Score all classes across all 4 cruise lines (7+9+9+8 = 33 classes)
2. Apply cruise-line-level modifiers (food quality, CDC, etc.)
3. No artificial diversity enforcement — pure best-score wins
4. Results show cruise line badge on each card for clarity

---

## Data Structure

### File: `assets/data/ship-quiz-data-v2.json`

```json
{
  "model_version": "2.0",
  "as_of_date": "2026-01-XX",
  "cdc_scores_updated": "2026-01-XX",

  "cruise_lines": {
    "rcl": {
      "name": "Royal Caribbean",
      "slug": "rcl",
      "food_modifier": 6,
      "food_modifier_casual": 4,
      "classes": {
        "icon": {
          "name": "Icon Class",
          "intensity": 10,
          "vibe": "max_resort_family",
          "dining_modifier": 2,
          "description": "...",
          "best_for": [...],
          "not_ideal_for": [...]
        }
      },
      "ships": {
        "icon-of-the-seas": {
          "name": "Icon of the Seas",
          "class": "icon",
          "cdc_score": 97,
          "cdc_score_date": "2025-06",
          ...
        }
      },
      "scoring_weights": { ... }
    }
  }
}
```

---

## Annual Maintenance (January)

1. **Update CDC Scores** — Pull from [CDC VSP](https://wwwn.cdc.gov/inspectionquerytool/)
2. **Review Food Quality** — Check 2025 reviews for pattern changes
3. **Fleet Changes** — Add new ships, mark retired ships
4. **Refurb Status** — Update amplified/refurbished flags

See `admin/QUIZ_EXPANSION_GUIDE.md` for detailed procedures.

---

## Launch Strategy

| Phase | Action |
|-------|--------|
| **Development** | Build as `ships/allshipquiz.html` |
| **Soft Launch** | Test with real users at `/ships/allshipquiz.html` |
| **Full Launch** | Rename to `/ships/quiz.html` on user's command |

**All 4 cruise lines must be ready before soft launch.**

---

## Implementation Order

1. ✅ RCL data (complete — existing quiz)
2. ⏳ Carnival class profiles + scoring weights
3. ⏳ NCL class profiles + scoring weights
4. ⏳ MSC class profiles + scoring weights
5. ⏳ Build `allshipquiz.html` with pill UI
6. ⏳ Create `ship-quiz-data-v2.json`
7. ⏳ Test all combinations
8. ⏳ Soft launch
9. ⏳ Rename to replace existing quiz

---

## Open Items for Implementation

- [ ] Finalize Carnival class descriptions and "best_for" / "not_ideal_for" lists
- [ ] Finalize NCL class descriptions
- [ ] Finalize MSC class descriptions
- [ ] Verify ship page coverage for each line
- [ ] Create scoring weights for Carnival, NCL, MSC (following RCL pattern)
- [ ] Build pill selector component matching site nav style
- [ ] Handle "ALL" mode normalization if needed
- [ ] Populate all CDC scores in ship data

---

## Research Sources

### Food Quality
- [Cruise Critic Reviews](https://www.cruisecritic.com/)
- [Tasting Table Ranking](https://www.tastingtable.com/1771881/ranking-cruise-ship-dining-packages/)
- [Royal Caribbean Blog](https://www.royalcaribbeanblog.com/)
- [Cruise.Blog Reviews](https://cruise.blog/)
- Reddit r/Cruise discussions

### CDC Health Inspections
- [CDC Vessel Sanitation Program](https://wwwn.cdc.gov/inspectionquerytool/)
- [Life Well Cruised - Cleanest Ships 2025](https://lifewellcruised.com/cleanest-and-dirtiest-cruise-ships/)
- [Cruise Fever - CDC Scores](https://cruisefever.net/the-15-cruise-ships-that-have-scored-a-perfect-cdc-score-in-first-half-of-2025/)

---

## Standards Compliance

Per ITW-Lite v3.010:
- ✅ AI-first, Human-first, Google second
- ✅ No affiliate links (stub pages instead of external links)
- ✅ Pure best-score results (no artificial diversity padding)
- ✅ Honest food quality assessment based on research
- ✅ CDC health data integrated for transparency
- ✅ Soli Deo Gloria invocation required

---

## Changelog

### 2026-01-02
- Initial plan creation
- Added multi-layer food scoring system
- Added CDC health inspection modifiers
- Added class-level dining modifiers for all 4 cruise lines
- Created `admin/QUIZ_EXPANSION_GUIDE.md` for future expansion
- Documented annual maintenance procedures

---

**Soli Deo Gloria** ✝️
