# Ship Quiz V2 Expansion Plan

**Created:** 2026-01-02
**Status:** Planning Complete — Ready for Implementation
**Target File:** `ships/allshipquiz.html` → rename to `ships/quiz.html` when complete

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

## Food Quality Modifiers

**Trigger:** When `must_have = dining` OR `dining_style_preference = specialty_focused`

| Cruise Line | Modifier | Rationale |
|-------------|----------|-----------|
| **Royal Caribbean** | **+6** | Best across MDR, buffet, specialty |
| **Norwegian** | **+2** | Solid but declining post-COVID |
| **Carnival** | **-3** | Weak MDR/buffet; casual saves it |
| **MSC** | **-5** | Consistent complaints; only Italian excels |

**When `dining_style_preference = casual_only`:**

| Cruise Line | Modifier | Rationale |
|-------------|----------|-----------|
| **Carnival** | **+6** | Guy's, BlueIguana, Shaq's standouts |
| **Royal Caribbean** | **+4** | Sorrento's, El Loco Fresh solid |
| **Norwegian** | **+4** | O'Sheehan's 24/7 praised |
| **MSC** | **+2** | Pizza is good (Italian heritage) |

### Research Sources
- [Cruise Critic Reviews](https://www.cruisecritic.com/)
- [Tasting Table Ranking](https://www.tastingtable.com/1771881/ranking-cruise-ship-dining-packages/)
- [Royal Caribbean Blog](https://www.royalcaribbeanblog.com/)
- Reddit r/Cruise discussions
- TripAdvisor cruise reviews

---

## Ship Classes by Cruise Line

### Royal Caribbean (7 classes) — COMPLETE ✅

| Class | Intensity | Vibe |
|-------|-----------|------|
| Icon | 10 | max_resort_family |
| Oasis | 9 | mega_variety_social |
| Quantum | 7 | modern_innovative_balanced |
| Freedom | 7 | big_fun_value_balanced |
| Voyager | 6 | classic_goldilocks_value |
| Radiance | 4 | scenic_calm_ports |
| Vision | 3 | simple_classic_ports_value |

### Carnival (9 classes) — TO CREATE

| Class | Ships | Proposed Intensity | Proposed Vibe |
|-------|-------|-------------------|---------------|
| Excel | Mardi Gras, Celebration, Jubilee | 9 | party_flagship_mega |
| Venice | Firenze, Venezia | 7 | eurozone_premium |
| Vista | Vista, Horizon, Panorama | 8 | modern_family_fun |
| Dream | Dream, Magic, Breeze | 7 | balanced_mainstream |
| Conquest | Conquest, Glory, Valor, Liberty, Freedom | 6 | classic_workhorse |
| Spirit | Spirit, Pride, Legend, Miracle, Luminosa | 5 | intimate_elegant |
| Splendor | Splendor | 6 | solo_workhorse |
| Sunshine | Sunshine, Sunrise, Radiance | 5 | refreshed_classic |
| Fantasy | Paradise, Elation | 3 | budget_short_getaway |

### Norwegian (9 classes) — TO CREATE

| Class | Ships | Proposed Intensity | Proposed Vibe |
|-------|-------|-------------------|---------------|
| Prima/Prima+ | Aqua, Viva, Prima | 9 | modern_innovative_flagship |
| Breakaway Plus | Encore, Bliss, Joy, Escape | 8 | mega_variety |
| Breakaway | Getaway, Breakaway | 7 | mainstream_balanced |
| Epic | Epic | 7 | solo_friendly_mega |
| Jewel | Gem, Pearl, Jade, Jewel | 6 | mid_size_classic |
| Pride of America | Pride of America | 5 | hawaii_specialist |
| Dawn | Dawn, Star | 5 | classic_mid_size |
| Sun | Sun, Sky | 4 | intimate_value |
| Spirit | Spirit | 4 | intimate_classic |

### MSC (8 classes) — TO CREATE

| Class | Ships | Proposed Intensity | Proposed Vibe |
|-------|-------|-------------------|---------------|
| World | World America, World Europa | 9 | mega_flagship |
| Meraviglia-Plus | Euribia, Virtuosa, Grandiosa | 8 | large_modern |
| Seaside EVO | Seascape, Seashore | 8 | beach_resort_style |
| Meraviglia | Bellissima, Meraviglia | 7 | mainstream_modern |
| Seaside | Seaview, Seaside | 7 | outdoor_focused |
| Fantasia | Preziosa, Divina, Magnifica, Splendida, Fantasia | 6 | classic_euro |
| Musica | Poesia, Orchestra, Musica | 5 | mid_size_euro |
| Lirica | Opera, Lirica, Sinfonia, Armonia | 4 | intimate_euro |

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
2. Apply cruise-line-level modifiers (food quality, etc.)
3. No artificial diversity enforcement — pure best-score wins
4. Results show cruise line badge on each card for clarity

---

## Data Structure

### File: `assets/data/ship-quiz-data-v2.json`

```json
{
  "model_version": "2.0",
  "as_of_date": "2026-01-XX",

  "cruise_lines": {
    "rcl": {
      "name": "Royal Caribbean",
      "slug": "rcl",
      "food_modifier": 6,
      "food_modifier_casual": 4,
      "classes": { ... },
      "ships": { ... },
      "scoring_weights": { ... }
    },
    "carnival": {
      "name": "Carnival",
      "slug": "carnival",
      "food_modifier": -3,
      "food_modifier_casual": 6,
      "classes": { ... },
      "ships": { ... },
      "scoring_weights": { ... }
    },
    "ncl": {
      "name": "Norwegian Cruise Line",
      "slug": "ncl",
      "food_modifier": 2,
      "food_modifier_casual": 4,
      "classes": { ... },
      "ships": { ... },
      "scoring_weights": { ... }
    },
    "msc": {
      "name": "MSC Cruises",
      "slug": "msc",
      "food_modifier": -5,
      "food_modifier_casual": 2,
      "classes": { ... },
      "ships": { ... },
      "scoring_weights": { ... }
    }
  }
}
```

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

---

## Standards Compliance

Per ITW-Lite v3.010:
- ✅ AI-first, Human-first, Google second
- ✅ No affiliate links (stub pages instead of external links)
- ✅ Pure best-score results (no artificial diversity padding)
- ✅ Honest food quality assessment based on research
- ✅ Soli Deo Gloria invocation required

---

**Soli Deo Gloria** ✝️
