# Port Weather Guide Feature Plan

## Overview

Add current weather conditions and seasonal visiting guides to all 333 port pages.

---

## Current Architecture Summary

| Component | Location | Notes |
|-----------|----------|-------|
| Port coordinates | `/assets/data/ports/ports-geo.json` | Has lat/lon for all 333 ports |
| Port pages | `/ports/{slug}.html` | Static HTML with consistent sections |
| API integration pattern | `/assets/js/modules/currency.js` | Good template for weather API |
| Caching utility | `/assets/js/modules/storage.js` | SafeStorage class with TTL support |

**Existing weather mentions**: Some ports (Bali, Belize, Bermuda, Athens) have inline seasonal content - these are static HTML, not dynamic.

---

## Phase 1: Data Architecture

### 1.1 Seasonal Guides Data File

Create `/assets/data/ports/seasonal-guides.json`:

```json
{
  "barcelona": {
    "best_months": ["May", "June", "September", "October"],
    "avoid_months": ["August"],
    "seasons": [
      {
        "name": "Peak Summer",
        "months": "June-August",
        "temp_range_f": "75-85°F",
        "description": "Hot, dry Mediterranean summer",
        "cruise_notes": "Very crowded; pre-book attractions"
      },
      {
        "name": "Shoulder Season",
        "months": "April-May, Sep-Oct",
        "temp_range_f": "60-75°F",
        "description": "Ideal weather, manageable crowds",
        "cruise_notes": "Best time for walking tours"
      }
    ],
    "hurricane_zone": false,
    "rainy_season": "October-November"
  }
}
```

### 1.2 Regional Defaults

Create `/assets/data/ports/regional-climate-defaults.json` for ports without custom data:

| Region | Best Months | Avoid | Notes |
|--------|-------------|-------|-------|
| Caribbean | Dec-Apr | Sep-Oct | Atlantic hurricane season: **Jun 1 – Nov 30** |
| Mediterranean | May-Jun, Sep-Oct | Aug | Peak crowds in August |
| Alaska | Jun-Aug | - | Cruise season May-Sep |
| Northern Europe | Jun-Aug | - | Long daylight hours |
| South Pacific | May-Oct | Jan-Mar | Cyclone season: **Nov 1 – Apr 30** |
| Mexico (Pacific) | Nov-May | Sep-Oct | East Pacific hurricane season: **May 15 – Nov 30** |

---

## Phase 2: Weather API Integration

### 2.1 API Selection

| API | Cost | Key Required | Recommendation |
|-----|------|--------------|----------------|
| **Open-Meteo** | Free | No | ✅ Primary - no key, reliable |
| WeatherAPI | Free tier | Yes | Fallback option |
| OpenWeatherMap | Free tier | Yes | Alternative |

**Chosen approach**: Open-Meteo (free, no API key, good global coverage)

### 2.2 Weather Module

Create `/assets/js/modules/weather.js` following the `currency.js` pattern:

- Fetch current weather from Open-Meteo API
- 30-minute cache TTL in localStorage
- Graceful degradation if API unavailable
- Offline support (show cached data)

**API endpoint**:
```
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
```

---

## Phase 3: UI Components

### 3.1 Weather Section Structure

Insert after Hero section, before Logbook:

```html
<section class="port-section" id="weather-guide">
  <h2>Weather & Best Time to Visit</h2>

  <!-- Current conditions (dynamic) -->
  <div class="weather-current-widget" id="port-weather-current"
       data-port-id="barcelona" data-lat="41.3851" data-lon="2.1734">
  </div>

  <!-- Seasonal guide (from JSON) -->
  <div class="seasonal-guide" id="port-seasonal-guide"></div>
</section>
```

### 3.2 Visual Design

**Trust framing rule**: Always distinguish live data from historical data in labels. Use "Current conditions" or "Forecast" for live API data. Use "Typical for [month]" or "Seasonal guide" for historical averages. Never blend them as if they're the same thing.

**Current Weather Card**:
- Temperature (F/C toggle matching existing currency preference pattern)
- Weather icon + condition text
- Humidity, wind speed
- "Updated X minutes ago" timestamp
- **"Seasonal vs today" context line**: e.g., *"Typical for January: cooler + breezier. Today is warmer than usual."* (requires monthly averages in seasonal data)
- **Attribution line**: "Weather data by Open-Meteo (CC BY 4.0)" - required for compliance

**48-Hour Forecast Strip**:
- Compact 5-block forecast: **Today PM → Tonight → Tomorrow AM → Tomorrow PM → Next Day AM**
- Shows: temp, precipitation chance, wind
- **"Best window to go ashore"** highlight: algorithmically identify lowest rain + wind period in next 12 hours - cruise-specific value-add

**Seasonal Guide Cards**:
- Grid of 2-4 season cards
- Color-coded borders: green (best), yellow (shoulder), red (avoid)
- Each card shows: months, temp range, description, cruise tips

---

## Phase 4: Content Population Strategy

### Tiered Approach for 333 Ports

| Tier | Count | Ports | Content |
|------|-------|-------|---------|
| **Tier 1** | ~50 | Top destinations (Barcelona, Nassau, Cozumel, etc.) | Hand-curated detailed guides |
| **Tier 2** | ~150 | Popular secondary ports | Template + regional defaults |
| **Tier 3** | ~133 | Niche/expedition ports | Regional defaults only, labeled *"Baseline regional guide"* for transparency |

**Priority order for Tier 1**:
1. Caribbean (highest traffic)
2. Mediterranean
3. Alaska
4. Northern Europe
5. South Pacific

### Seasonal Guide Content Framework (Enhanced)

**Content guardrail**: Structured blocks, not essays. Avoid month-by-month prose narratives—they don't scale and become maintenance nightmares. Use repeatable, templated sections that can be populated systematically.

Each port's seasonal guide should include:

1. **At a glance**: temps, humidity, rain risk, sea state tendency, daylight hours
2. **Best months for specific activities**:
   - Beaches / swimming
   - Hiking / outdoor excursions
   - City walking / sightseeing
   - Snorkeling / water sports
   - Avoiding crowds
3. **"What catches people off guard"**: cruise-specific warnings
   - Wind on the pier during tender operations
   - Sudden afternoon squalls
   - Evening temperature drops
   - Humidity that wilts you by noon
4. **Packing nudges**: actionable gear advice
   - "Compact umbrella" vs "poncho month"
   - "Light layer for evening"
   - "Reef-safe sunscreen required"
   - "Bug spray essential"
5. **Standing disclaimer**: "Weather varies; forecasts are guidance, not guarantees"

---

## Phase 5: Implementation Files

| File | Action | Purpose |
|------|--------|---------|
| `/assets/data/ports/seasonal-guides.json` | Create | Seasonal guide data |
| `/assets/data/ports/regional-climate-defaults.json` | Create | Regional fallbacks |
| `/assets/js/modules/weather.js` | Create | API integration module |
| `/assets/js/port-weather.js` | Create | Page widget loader |
| `/assets/styles.css` | Modify | Weather widget styles |
| `/ports/*.html` (333 files) | Modify | Add weather section |
| `/assets/js/modules/config.js` | Modify | Add weather config |

---

## Phase 6: Caching Strategy

| Data | Storage | TTL | Notes |
|------|---------|-----|-------|
| Current weather | localStorage | 30 min | Per-port key |
| Seasonal guides | Browser cache | 7 days | Static JSON |
| User temp preference (F/C) | localStorage | Permanent | User setting |

---

## Technical Considerations

### Performance
- Weather API called only when section is visible (Intersection Observer)
- Parallel fetch of weather + seasonal data
- Skeleton loader during fetch

### Accessibility
- Standard semantic HTML (no ARIA live regions needed for V1—content is static on load, not auto-refreshing)
- Color-blind safe season indicators (icons + text labels, not color alone)
- Clear unit labels for screen readers

### SEO
- Seasonal content rendered server-side in HTML
- Schema.org markup for weather/climate info
- Noscript fallback for current weather

---

## Open Questions

1. **Temperature units**: Default to F with C toggle, or detect from browser locale?
2. **Refresh behavior**: Auto-refresh current weather while page is open, or only on load?

~~3. **Marine data**: Include sea temperature/wave conditions for beach ports?~~ → **Resolved: No for V1** (see rejections)

~~4. **Historical averages**: Show "typical weather for [month]" alongside current?~~ → **Resolved: Yes** - added as "Seasonal vs today" context line

## Pre-Implementation Verification

1. **Open-Meteo commercial tier**: Verify if site's ad revenue disqualifies us from free "non-commercial" tier. If so, budget for paid API key.
2. **Attribution placement**: Standardize exact wording and position for CC BY 4.0 attribution across all weather widgets.

---

## Estimated Scope

- **New files**: 4 (2 data, 2 JS modules)
- **Modified files**: 335 (333 port pages + styles + config)
- **Data entry**: ~50 detailed guides + regional defaults

---

## Rejected Suggestions (and why)

| Suggestion | Rejection Reason |
|------------|------------------|
| Edge proxy / Cloudflare Worker | Over-engineered. Open-Meteo needs no API key to hide. Client-side 30-min cache prevents rate limiting. Adds infra complexity for zero benefit. |
| Regional fallbacks (NWS, MET Norway, Stormglass) | Unnecessary complexity. Open-Meteo has solid global coverage. Different schemas to normalize, extra attribution, licensing constraints. Solving a problem we don't have. |
| Right rail placement | Weather is substantive content, not sidebar material. Mobile-first: right rail collapses anyway. |
| `weather_station_hint` field | Open-Meteo uses coordinates, not station IDs. We already have lat/lon. Unused schema fields = maintenance burden. |
| Lightning risk indicator | Open-Meteo free tier doesn't provide lightning data. Marginal value for complexity. |
| Docking-window mode | Requires itinerary data we don't have. User would need to input arrival time. Adds UI complexity for edge-case value. Users can eyeball the 48-hour strip if they know their dock time. |
| Sea & Tender Conditions panel | Open-Meteo explicitly warns about coastal accuracy. Most cruisers don't understand swell period/direction. Wave height without local context is meaningless. Tender ops are captain's call, not passenger planning. |
| Cross-brand gallery tie-in | Scope creep. Weather feature should be weather feature. |
| Cruise Countdown Tool | Separate feature entirely (new tool page, user input form, itinerary storage). Not part of port weather guide. If wanted, deserves its own plan. |
| Widget strategy (Mac/iPhone/Windows) | Different technical domain (WidgetKit, PWA, native dev). Nothing to do with adding weather to port pages. |
| Advanced Mode toggle | UI complexity (toggle state, accordion, preferences) for speculative value. 48-hour buckets already sufficient. Build if users demand it, not speculatively. |
| Port-day itinerary panels | Part of Countdown Tool which we're not building. Users viewing a port page are looking at ONE port. |
