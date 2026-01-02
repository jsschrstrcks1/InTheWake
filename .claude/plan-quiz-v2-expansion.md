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
| 2 | `cruise_experience` | How much have you cruised? |
| 3 | `energy_level` | What's your ideal vacation pace? |
| 4 | `crowd_tolerance` | How do you feel about crowds? |
| 5 | `ship_vs_ports` | Ship or destinations—what matters more? |
| 6 | `sailing_length` | How long do you want to sail? |
| 7 | `budget_mindset` | What's your budget philosophy? |

### Question 2: Cruise Experience (Updated from Binary)

**Old:** `first_timer` (true/false) — "Veteran cruiser" confused users with 4-5 cruises

**New:** `cruise_experience` (3-tier scale)

| Value | Label | Icon | Description |
|-------|-------|------|-------------|
| `first_time` | "First time!" | 🌟 | "Excited to discover cruising" |
| `a_few` | "A few cruises" | ⚓ | "I've got the basics down" |
| `seasoned` | "Seasoned sailor" | 🧭 | "Lost count of my sailings" |

**Scoring Weights:**

```json
"cruise_experience": {
  "first_time": {
    "freedom": 6, "voyager": 6, "oasis": 4,
    "conquest": 6, "dream": 6, "vista": 4,
    "breakaway": 6, "jewel": 6, "breakaway_plus": 4,
    "meraviglia": 6, "fantasia": 6, "seaside": 4
  },
  "a_few": {
    "oasis": 4, "quantum": 4, "freedom": 2,
    "vista": 4, "dream": 4, "excel": 2,
    "breakaway_plus": 4, "breakaway": 4, "prima": 2,
    "meraviglia_plus": 4, "seaside_evo": 4, "world": 2
  },
  "seasoned": {
    "icon": 4, "radiance": 4, "vision": 4,
    "excel": 4, "spirit": 4, "venice": 4,
    "prima": 4, "epic": 4, "sun": 4,
    "world": 4, "lirica": 4, "musica": 4
  }
}
```

**Rationale:**
- **First time:** Steer toward "safe" mainstream ships with broad appeal
- **A few cruises:** Ready to explore more variety, modern ships
- **Seasoned:** Open to flagships, niche ships, or intimate experiences

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

### Carnival (9 classes) — COMPLETE ✅

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

#### Carnival Class Profiles (Detailed)

**Excel Class** (Mardi Gras, Celebration, Jubilee)
- **Description:** Carnival's largest ships with 6,400+ guests. BOLT roller coaster, 20+ dining venues, themed zones. First LNG-powered Carnival ships.
- **Best for:** Families with kids, thrill-seekers, first-timers wanting "everything," groups wanting variety
- **Not ideal for:** Low crowd tolerance, value-first budgets, those seeking intimate/quiet atmosphere

**Vista Class** (Vista, Horizon, Panorama)
- **Description:** The most family-friendly Carnival class. SkyRide, IMAX theater, Family Harbor zone with protected staterooms, Havana section for adults.
- **Best for:** Families with kids of all ages, couples wanting Family Harbor or Havana perks, West Coast cruisers (Panorama)
- **Not ideal for:** Those seeking newest/flashiest experience, very budget-conscious travelers

**Dream Class** (Dream, Magic, Breeze)
- **Description:** Sweet spot between features and price. WaterWorks water park, comedy clubs, piano bars. Great for families and friend groups.
- **Best for:** Families with water-park-loving kids, friend groups, couples seeking value with amenities
- **Not ideal for:** Those wanting flagship experience, ultra-quiet seekers

**Conquest Class** (Conquest, Glory, Valor, Liberty, Freedom)
- **Description:** Carnival's budget workhorses. 3,000 guests, solid core Carnival experience. Some have enhanced waterparks, all have comedy clubs.
- **Best for:** Value-first travelers, first-timers on a budget, families wanting affordable fun, short getaway cruisers
- **Not ideal for:** Must-have-modern seekers, those wanting extensive specialty dining

**Spirit Class** (Spirit, Pride, Legend, Miracle, Luminosa)
- **Description:** Mid-size ships (2,100 guests) with highest percentage of balcony cabins. More intimate, can transit Panama Canal. Classic elegance.
- **Best for:** Couples seeking intimacy, destination-focused cruisers, Panama Canal/Alaska itineraries, those who prefer smaller ships
- **Not ideal for:** Families with young kids wanting big waterparks, thrill-seekers, nightlife-first travelers

**Venice Class** (Firenze, Venezia)
- **Description:** Costa ships transferred to Carnival with European flair. Italian design touches, refined atmosphere. Based in NYC/Long Beach.
- **Best for:** Couples, travelers wanting European feel without crossing Atlantic, NYC-based cruisers
- **Not ideal for:** Families wanting Carnival's traditional "fun ship" vibe, waterpark enthusiasts

**Splendor Class** (Splendor)
- **Description:** Solo ship bridging Dream and Conquest classes. Good variety without mega-ship scale.
- **Best for:** Balanced travelers, those wanting mid-size experience, value seekers
- **Not ideal for:** Those wanting newest features, families needing extensive kids programming

**Sunshine Class** (Sunshine, Sunrise, Radiance)
- **Description:** Refreshed older ships with modern Carnival touches. Serenity adult-only area, Guy's Burger Joint, RedFrog Pub.
- **Best for:** Value seekers, short getaway cruisers, adults seeking Serenity deck, traditional cruise feel
- **Not ideal for:** Families wanting big waterparks, must-feel-modern travelers

**Fantasy Class** (Paradise, Elation)
- **Description:** Carnival's oldest and smallest active ships. Simple, no-frills cruising. Great value for short getaways.
- **Best for:** Budget-first travelers, short 3-4 night getaways, first-timers testing the waters, port-intensive itineraries
- **Not ideal for:** Families with young kids, those wanting activities, ship-as-destination travelers

#### Carnival Scoring Weights

```json
"carnival_scoring_weights": {
  "energy_level": {
    "go_go_go": { "excel": 18, "vista": 14, "dream": 12, "conquest": 8, "venice": 6, "splendor": 6, "sunshine": 4, "spirit": 0, "fantasy": 0 },
    "balanced": { "dream": 14, "vista": 12, "conquest": 10, "splendor": 10, "venice": 8, "excel": 6, "sunshine": 6, "spirit": 4, "fantasy": 0 },
    "relax": { "spirit": 16, "fantasy": 12, "sunshine": 10, "venice": 8, "splendor": 6, "conquest": 4, "excel": -10, "vista": -6, "dream": 0 }
  },
  "crowd_tolerance": {
    "high": { "excel": 14, "vista": 10, "dream": 8 },
    "medium": { "dream": 8, "conquest": 8, "splendor": 6, "vista": 6, "venice": 6 },
    "low": { "spirit": 14, "fantasy": 12, "sunshine": 10, "venice": 8, "excel": -14, "vista": -10 }
  },
  "budget_mindset": {
    "premium": { "excel": 12, "vista": 8, "venice": 8, "dream": 6 },
    "balanced": { "dream": 10, "conquest": 10, "vista": 8, "splendor": 8, "spirit": 6 },
    "value": { "fantasy": 14, "conquest": 12, "sunshine": 12, "splendor": 10, "spirit": 8, "excel": -8 }
  },
  "sailing_length": {
    "short_3_4": { "fantasy": 12, "conquest": 10, "sunshine": 10, "dream": 6, "excel": 4 },
    "standard_5_7": { "dream": 10, "conquest": 10, "vista": 8, "excel": 8, "splendor": 8 },
    "long_8_plus": { "spirit": 12, "venice": 10, "vista": 8, "dream": 6, "excel": -6 }
  },
  "group_type": {
    "solo": { "spirit": 10, "venice": 8, "sunshine": 6, "splendor": 6 },
    "couple": { "spirit": 12, "venice": 10, "dream": 8, "vista": 6 },
    "friends": { "excel": 12, "dream": 10, "conquest": 10, "vista": 8 },
    "family_young": { "excel": 16, "vista": 14, "dream": 12, "conquest": 8, "spirit": -12, "fantasy": -14 },
    "family_teens": { "excel": 14, "vista": 12, "dream": 10, "conquest": 8 },
    "multigen": { "vista": 12, "excel": 10, "dream": 10, "conquest": 8, "spirit": 6 }
  },
  "ship_vs_ports": {
    "ship": { "excel": 14, "vista": 10, "dream": 8, "conquest": 4 },
    "balanced": { "dream": 8, "conquest": 8, "vista": 6, "splendor": 6 },
    "ports": { "spirit": 16, "fantasy": 14, "sunshine": 10, "venice": 8, "excel": -12, "vista": -8 }
  }
}
```

### Norwegian (9 classes) — COMPLETE ✅

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

#### NCL Class Profiles (Detailed)

**Prima/Prima+ Class** (Prima, Viva, Aqua)
- **Description:** NCL's newest, most upscale ships. Highest space-to-passenger ratio, 8-deck Haven complex, Indulge Food Hall, Ocean Boulevard wrap-around promenade.
- **Best for:** Couples seeking luxury, adults-only groups, upmarket resort experience, Haven suite guests
- **Not ideal for:** Families with young kids (limited kids activities on Prima/Viva), budget travelers
- **Note:** Aqua (2025) added more family features than Prima/Viva

**Breakaway Plus Class** (Encore, Bliss, Joy, Escape)
- **Description:** NCL's largest ships packed with activities. Go-karts, laser tag, Galaxy Pavilion VR, Broadway shows. Best dining variety in fleet.
- **Best for:** High-energy travelers, families with teens, entertainment lovers, groups wanting variety
- **Not ideal for:** Those seeking quiet/intimate, budget-first travelers, short getaways
- **Note:** Escape lacks go-karts/laser tag; Encore/Bliss/Joy are most feature-rich

**Breakaway Class** (Getaway, Breakaway)
- **Description:** Foundation for Breakaway Plus with slightly fewer features. Ropes course, Aqua Park, good nightlife. Solid mainstream experience.
- **Best for:** Families, first-time NCL cruisers, those wanting balance of features and value
- **Not ideal for:** Must-have-newest seekers, those wanting go-karts/laser tag

**Epic Class** (Epic)
- **Description:** Unique solo-focused ship with 128 Studio Staterooms and exclusive Studio Lounge. Large ship (4,200 guests) with ice bar, Cirque shows.
- **Best for:** Solo travelers, singles wanting social atmosphere, adults seeking variety
- **Not ideal for:** Families, couples wanting privacy, those wanting modern design (2010 ship)

**Jewel Class** (Gem, Pearl, Jade, Jewel)
- **Description:** Mid-size classics (2,400 guests) beloved by NCL loyalists. Relaxed resort feel, good specialty dining, less need for reservations.
- **Best for:** Couples, experienced cruisers, those preferring mid-size ships, freestyle purists
- **Not ideal for:** Families wanting waterparks, thrill-seekers, first-timers wanting "wow"

**Pride of America** (Pride of America)
- **Description:** Hawaii specialist - the only cruise ship sailing year-round inter-island Hawaii itineraries. US-flagged, American crew.
- **Best for:** Hawaii-focused travelers, those wanting inter-island experience, US travelers preferring American crew
- **Not ideal for:** Caribbean/Europe seekers, budget travelers, families wanting activities

**Dawn Class** (Dawn, Star)
- **Description:** Early Freestyle Cruising ships (2001-2002). Quirky layouts, solid service. Good for destination-focused cruising.
- **Best for:** Destination-focused cruisers, experienced travelers, those prioritizing itinerary over ship
- **Not ideal for:** Ship-as-destination travelers, families with young kids, first-timers

**Sun Class** (Sun, Sky) — *Note: Leaving fleet 2026-2027*
- **Description:** Oldest active NCL ships. Smaller, more intimate, often all-inclusive deals. Sky specializes in short cruises.
- **Best for:** Value seekers, short getaway cruisers, adults wanting quiet, intimacy lovers
- **Not ideal for:** Families, those wanting activities, long cruises

**Spirit Class** (Spirit)
- **Description:** Fleet's oldest ship (1998 build, joined NCL 2004). Well-maintained but lacking modern features. Classic cruising.
- **Best for:** Nostalgic cruisers, value seekers, destination-focused travelers
- **Not ideal for:** Families, those wanting activities, ship-as-destination travelers

#### NCL Scoring Weights

```json
"ncl_scoring_weights": {
  "energy_level": {
    "go_go_go": { "breakaway_plus": 18, "prima": 12, "breakaway": 12, "epic": 10, "jewel": 4, "dawn": 0, "sun": 0, "spirit": 0 },
    "balanced": { "jewel": 12, "breakaway": 12, "prima": 10, "epic": 8, "breakaway_plus": 6, "dawn": 6, "pride_of_america": 6 },
    "relax": { "sun": 16, "spirit": 14, "jewel": 12, "dawn": 10, "pride_of_america": 8, "breakaway_plus": -10, "prima": -6 }
  },
  "crowd_tolerance": {
    "high": { "breakaway_plus": 14, "prima": 10, "epic": 8, "breakaway": 8 },
    "medium": { "breakaway": 8, "jewel": 8, "epic": 6, "prima": 6 },
    "low": { "sun": 14, "spirit": 14, "jewel": 10, "dawn": 10, "breakaway_plus": -14, "epic": -10 }
  },
  "budget_mindset": {
    "premium": { "prima": 14, "breakaway_plus": 10, "epic": 6 },
    "balanced": { "breakaway": 10, "jewel": 10, "breakaway_plus": 8, "epic": 8, "dawn": 6 },
    "value": { "sun": 14, "spirit": 12, "dawn": 10, "jewel": 8, "prima": -10, "breakaway_plus": -6 }
  },
  "sailing_length": {
    "short_3_4": { "sun": 12, "spirit": 8, "breakaway": 6 },
    "standard_5_7": { "breakaway_plus": 10, "breakaway": 10, "jewel": 8, "prima": 8, "epic": 8 },
    "long_8_plus": { "pride_of_america": 14, "dawn": 10, "jewel": 8, "prima": 6, "sun": -8 }
  },
  "group_type": {
    "solo": { "epic": 16, "prima": 8, "jewel": 6, "sun": 6 },
    "couple": { "prima": 14, "jewel": 12, "breakaway_plus": 8, "dawn": 6 },
    "friends": { "breakaway_plus": 14, "breakaway": 12, "epic": 10, "prima": 8 },
    "family_young": { "breakaway_plus": 14, "breakaway": 12, "epic": -10, "sun": -14, "spirit": -14 },
    "family_teens": { "breakaway_plus": 16, "breakaway": 12, "prima": 8, "jewel": 6 },
    "multigen": { "breakaway_plus": 10, "jewel": 10, "breakaway": 8, "prima": 6 }
  },
  "ship_vs_ports": {
    "ship": { "breakaway_plus": 14, "prima": 12, "epic": 8, "breakaway": 6 },
    "balanced": { "breakaway": 8, "jewel": 8, "prima": 6, "breakaway_plus": 6 },
    "ports": { "pride_of_america": 16, "dawn": 14, "spirit": 12, "sun": 10, "jewel": 8, "breakaway_plus": -10 }
  }
}
```

### MSC (8 classes) — COMPLETE ✅

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

#### MSC Class Profiles (Detailed)

**World Class** (World America, World Europa)
- **Description:** MSC's largest, newest flagships (~216,000 GT, 6,700+ guests). Eataly restaurant, The Harbour family zone, bumper cars, Cliffhanger swing. LNG-powered.
- **Best for:** Families wanting megaship variety, couples seeking European flair, budget-conscious megaship seekers
- **Not ideal for:** Those wanting intimate experience, crowd-averse travelers, those wanting American-style service
- **Note:** World America (Caribbean) vs World Europa (Mediterranean) - different markets

**Meraviglia-Plus Class** (Grandiosa, Virtuosa, Euribia)
- **Description:** Large ships with covered LED promenade, Cirque shows, extensive dining. Indoor-focused design works well for varied weather.
- **Best for:** Families wanting entertainment, foodies, Mediterranean cruisers, tech/innovation lovers
- **Not ideal for:** Those wanting outdoor focus, intimate experience seekers

**Seaside EVO Class** (Seascape, Seashore)
- **Description:** Enhanced Seaside design with more outdoor space. Resort-style living, outdoor promenade, designed for warm-weather cruising.
- **Best for:** Caribbean cruisers, families wanting water features, sun lovers, couples seeking resort vibe
- **Not ideal for:** Cold-weather itinerary seekers, indoor-focused travelers

**Meraviglia Class** (Meraviglia, Bellissima)
- **Description:** High-tech entertainment, stunning LED promenade, modern European city feel at sea. Strong Cirque shows.
- **Best for:** Entertainment lovers, families, European cruisers, those wanting modern design
- **Not ideal for:** Outdoor-focused travelers, intimacy seekers
- **Note:** Bellissima is highest-rated MSC ship in customer reviews

**Seaside Class** (Seaside, Seaview)
- **Description:** First MSC ships designed for warm-weather/outdoor cruising. Broad outdoor promenade, zipline, outdoor spa. Calmer than Meraviglia.
- **Best for:** Warm-weather cruisers, couples seeking sun, families wanting water slides
- **Not ideal for:** Mediterranean winter sailings, those wanting extensive indoor options

**Fantasia Class** (Fantasia, Splendida, Divina, Preziosa, Magnifica)
- **Description:** MSC's "classic big ship" class (130,000+ GT). European elegance, Yacht Club suites, showing age but well-maintained.
- **Best for:** European-style experience lovers, Yacht Club guests, destination-focused travelers, value seekers
- **Not ideal for:** Must-feel-modern travelers, families wanting extensive activities

**Musica Class** (Musica, Orchestra, Poesia)
- **Description:** Mid-size ships with classic MSC décor. Relaxed, international atmosphere. Good for itinerary-focused cruising.
- **Best for:** Experienced cruisers, destination-focused travelers, those wanting smaller/calmer ships, value seekers
- **Not ideal for:** Activity seekers, families with young kids, first-timers wanting "wow"

**Lirica Class** (Lirica, Opera, Sinfonia, Armonia)
- **Description:** MSC's oldest ships (2003-2004, refurbished 2015). Smallest in fleet, intimate feel. Classic character retained.
- **Best for:** Budget travelers, destination-focused cruisers, intimacy lovers, European traditionalists
- **Not ideal for:** Families wanting activities, ship-as-destination travelers, those wanting modern amenities

#### MSC Scoring Weights

```json
"msc_scoring_weights": {
  "energy_level": {
    "go_go_go": { "world": 18, "meraviglia_plus": 14, "seaside_evo": 12, "meraviglia": 10, "seaside": 8, "fantasia": 4, "musica": 0, "lirica": 0 },
    "balanced": { "meraviglia": 12, "seaside": 10, "seaside_evo": 10, "fantasia": 8, "meraviglia_plus": 6, "world": 6, "musica": 6 },
    "relax": { "lirica": 16, "musica": 14, "fantasia": 10, "seaside": 6, "world": -10, "meraviglia_plus": -8 }
  },
  "crowd_tolerance": {
    "high": { "world": 14, "meraviglia_plus": 10, "seaside_evo": 8, "meraviglia": 8 },
    "medium": { "seaside": 8, "meraviglia": 8, "fantasia": 6, "seaside_evo": 6 },
    "low": { "lirica": 14, "musica": 14, "fantasia": 8, "world": -14, "meraviglia_plus": -10 }
  },
  "budget_mindset": {
    "premium": { "world": 12, "meraviglia_plus": 8, "seaside_evo": 6 },
    "balanced": { "seaside": 10, "meraviglia": 10, "fantasia": 8, "seaside_evo": 8 },
    "value": { "lirica": 14, "musica": 12, "fantasia": 10, "world": -6, "meraviglia_plus": -4 }
  },
  "sailing_length": {
    "short_3_4": { "lirica": 10, "seaside": 8, "musica": 6 },
    "standard_5_7": { "world": 10, "seaside_evo": 10, "meraviglia": 8, "seaside": 8, "meraviglia_plus": 8 },
    "long_8_plus": { "fantasia": 12, "musica": 10, "lirica": 8, "meraviglia_plus": 6 }
  },
  "group_type": {
    "solo": { "musica": 8, "lirica": 8, "fantasia": 6 },
    "couple": { "seaside_evo": 12, "seaside": 12, "world": 8, "fantasia": 8, "musica": 6 },
    "friends": { "world": 12, "meraviglia_plus": 10, "meraviglia": 10, "seaside_evo": 8 },
    "family_young": { "world": 16, "meraviglia_plus": 14, "seaside_evo": 12, "meraviglia": 10, "lirica": -12, "musica": -10 },
    "family_teens": { "world": 14, "meraviglia_plus": 12, "seaside_evo": 10, "meraviglia": 8 },
    "multigen": { "fantasia": 10, "world": 10, "meraviglia_plus": 8, "seaside_evo": 8 }
  },
  "ship_vs_ports": {
    "ship": { "world": 14, "meraviglia_plus": 10, "seaside_evo": 8, "meraviglia": 6 },
    "balanced": { "seaside": 8, "meraviglia": 8, "fantasia": 6, "seaside_evo": 6 },
    "ports": { "lirica": 16, "musica": 14, "fantasia": 10, "world": -10, "meraviglia_plus": -8 }
  }
}
```

---

## Ships Without Pages

**Decision:** Show ship in results with link to stub page. Stub pages handled in separate thread.

**Result card display:**
- Full ship recommendation with match %, specs, highlights
- Link goes to stub page with "under construction" notice
- Ship class badge still displays

---

## Multi-Line Results Display

### Brand-Aware Color Coding (No Trademarks)

| Cruise Line | Primary Color | Accent | Notes |
|-------------|---------------|--------|-------|
| Royal Caribbean | `#1a3d7c` (navy) | `#ffd700` (gold) | Crown/anchor vibes |
| Carnival | `#e31837` (red) | `#0033a0` (blue) | Fun ship energy |
| Norwegian | `#00205b` (deep blue) | `#ffffff` (white) | Fjord-inspired |
| MSC | `#003366` (marine blue) | `#b8860b` (gold) | Mediterranean elegance |

### Result Card Design

```
┌─────────────────────────────────────────┐
│ [Color bar matching cruise line]        │
│                                         │
│  🚢 Icon of the Seas                    │
│  Royal Caribbean • Icon Class           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 94%    │
│                                         │
│  250,800 GT • 5,610 guests • 2024       │
│  ✓ Category 6 waterpark                 │
│  ✓ 7 pools, 6 waterslides               │
│                                         │
│  [View Ship →]                          │
└─────────────────────────────────────────┘
```

### "You Might Also Like" Section

Always displayed below main results. Shows top-scoring ships from **unselected** cruise lines.

```
┌─────────────────────────────────────────────────────────────┐
│  You Might Also Like                                        │
│  ─────────────────────────────────────────────────────────  │
│  Ships from other cruise lines that match your preferences  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ [Carnival]  │  │ [NCL]       │  │ [MSC]       │         │
│  │ Celebration │  │ Encore      │  │ World Amer. │         │
│  │ 89% match   │  │ 87% match   │  │ 85% match   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎨 Color Guide:                                     │   │
│  │ ■ Royal Caribbean  ■ Carnival  ■ NCL  ■ MSC        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## URL Sharing

### Format

```
/ships/allshipquiz.html?line=rcl&r=BASE64_ENCODED_ANSWERS
```

| Parameter | Values | Purpose |
|-----------|--------|---------|
| `line` | `all`, `rcl`, `carnival`, `ncl`, `msc` | Selected cruise line filter |
| `r` | Base64 JSON | Encoded quiz answers (existing pattern) |

### Behavior

- If `line` param present, pre-select that pill on load
- If `r` param present, skip to results
- Both can be combined to share "here's what I got on Carnival"

---

## Mobile Experience

### Hamburger Menu for Pill Selector

On viewports < 768px:

```
┌──────────────────────────────────────────┐
│  Find Your Perfect Ship         [≡]     │
│                                          │
│  Currently showing: Royal Caribbean      │
│                                          │
└──────────────────────────────────────────┘

[≡] expands to:
┌──────────────────────────────────────────┐
│  Select Cruise Line              [×]    │
│  ─────────────────────────────────────  │
│  ○ ALL Cruise Lines                      │
│  ● Royal Caribbean                       │
│  ○ Carnival                              │
│  ○ Norwegian Cruise Line                 │
│  ○ MSC Cruises                           │
│  ─────────────────────────────────────  │
│  [← Back to Quiz]  (escape rope)         │
└──────────────────────────────────────────┘
```

---

## Performance

### Lazy Loading Strategy

```javascript
// On page load
fetch('ship-quiz-data-v2.json')  // Load lightweight index

// On cruise line selection (or ALL)
loadCruiseLineData(line)  // Load full data for selected line(s)
```

**Alternative:** Single file if <500KB gzipped (simpler, test during implementation)

---

## Edge Case Testing

### Test Personas

| Persona | Preferences | Expected Result |
|---------|-------------|-----------------|
| Budget Solo Relaxer | solo + value + relax + ports | NCL Spirit, Carnival Fantasy, MSC Lirica |
| Mega-Ship Family | family_young + go_go_go + ship | RCL Icon, Carnival Excel, MSC World |
| Intimate Couple | couple + relax + low crowds + ports | RCL Radiance, Carnival Spirit, NCL Jewel |
| Premium Foodies | couple + premium + dining must-have | RCL Oasis/Icon (food bonus), NCL Prima |
| Value First-Timer | first_time + value + balanced | RCL Voyager, Carnival Conquest, NCL Breakaway |
| Seasoned Adventurer | seasoned + go_go_go + unique_thrills | RCL Icon, Carnival Excel (BOLT), NCL Breakaway Plus (go-karts) |

### Validation Approach

1. **Pre-launch:** Run all test personas, verify expected classes appear
2. **Soft launch:** Facebook group feedback
3. **Post-launch:** Monitor for unexpected patterns

---

## Share Image (Canvas)

Follow existing pattern (1200×630px):

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  [Ship Image as Background]                            │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Your Perfect Ship Match                         │ │
│  │                                                  │ │
│  │  🚢 Icon of the Seas                             │ │
│  │  Royal Caribbean • 94% Match                     │ │
│  │                                                  │ │
│  │  Take the quiz: inthewake.io/ships/quiz         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Cruise line color bar at bottom]                     │
└────────────────────────────────────────────────────────┘
```

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
- **Changed `first_timer` to `cruise_experience`** — 3-tier scale (first_time / a_few / seasoned) to address user confusion with "veteran cruiser" label
- **Added complete Carnival class profiles** — 9 classes with descriptions, best_for, not_ideal_for, and scoring weights
- **Added complete NCL class profiles** — 9 classes with descriptions, best_for, not_ideal_for, and scoring weights
- **Added complete MSC class profiles** — 8 classes with descriptions, best_for, not_ideal_for, and scoring weights
- **All 4 cruise lines now have complete class data** — Ready for implementation

---

**Soli Deo Gloria** ✝️
