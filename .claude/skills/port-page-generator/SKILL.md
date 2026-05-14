---
name: port-page-generator
description: "Generates new cruise port pages to gold standard (dubai.html). Enforces ICP-2 v2.1, LOGBOOK_ENTRY_STANDARDS v2.300, and all 21 audit detections."
version: 2.0.0
triggers:
  - "create a new port page"
  - "generate port page for"
  - "/port-gen"
---

# Port Page Generator — Gold Standard Edition

> Every port page helps someone plan their best day ashore.
> Be careful, not clever.

## When to Fire

- `/port-gen <port-name>` command
- When asked to create a new port page
- When asked to rebuild a port page from scratch

## Gold Standard Reference

**Template:** `ports/dubai.html` (score 96, 16 images, 15 h2s, 3686 words)
**Validator:** `admin/validate-port-page-v2.js` (ICP-2 v2.1 + LOGBOOK v2.300)
**Audit:** `admin/port-page-audit.cjs` (21 detections)

### What Makes a Gold Standard Page

From 7 orchestra passes auditing 48 pages with GPT/Gemini/Grok:

1. **All 14 sections present** in canonical order
2. **800+ word first-person logbook** with emotional pivots + reflection
3. **11+ unique WebP images** with photo credits
4. **Complete meta tags** (ai-summary, OG, Twitter Cards, canonical)
5. **3 JSON-LD schemas** (BreadcrumbList, WebPage with Place mainEntity, FAQPage)
6. **Port-specific content** (no generic templates, no copy-paste)
7. **Correct disclaimer level** per port-disclaimer-registry.json
8. **Zero audit issues** from all 21 detection functions

## Required HTML Structure

### Head Section
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <!-- ICP-2 v2.1 -->
    <meta name="ai-summary" content="[PORT] features [SIGNATURE]. [KEY FACT]. [WHAT CRUISERS DO]. Max 250 chars, first 155 standalone.">
    <meta name="last-reviewed" content="YYYY-MM-DD">
    <meta name="content-protocol" content="ICP-2 v2.1">
    <meta name="author" content="In the Wake">
    <meta name="description" content="First-person logbook guide to [PORT] — [KEY DETAILS]">
    <!-- OpenGraph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="In the Wake">
    <meta property="og:title" content="[PORT] Port Guide — [SUBTITLE]">
    <meta property="og:description" content="[SAME AS description]">
    <meta property="og:url" content="https://cruisinginthewake.com/ports/[SLUG].html">
    <meta property="og:image" content="https://cruisinginthewake.com/assets/social/port-hero.jpg">
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="[SAME AS og:title]">
    <meta name="twitter:description" content="[SAME AS og:description]">
    <meta name="twitter:image" content="https://cruisinginthewake.com/assets/social/port-hero.jpg">
    <title>[PORT] Cruise Port Guide — In the Wake</title>
    <link rel="canonical" href="https://cruisinginthewake.com/ports/[SLUG].html">
</head>
```

### JSON-LD Schemas (3 required)
```html
<!-- 1. BreadcrumbList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://cruisinginthewake.com/"},
    {"@type": "ListItem", "position": 2, "name": "Ports", "item": "https://cruisinginthewake.com/ports.html"},
    {"@type": "ListItem", "position": 3, "name": "[PORT]", "item": "https://cruisinginthewake.com/ports/[SLUG].html"}
  ]
}
</script>

<!-- 2. WebPage with Place mainEntity -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://cruisinginthewake.com/ports/[SLUG].html",
  "name": "[PORT] Port Guide",
  "description": "[SAME AS ai-summary]",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "mainEntity": {
    "@type": "Place",
    "name": "[PORT]",
    "geo": { "@type": "GeoCoordinates", "latitude": LAT, "longitude": LON }
  }
}
</script>

<!-- 3. FAQPage (5+ questions) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Q?", "acceptedAnswer": { "@type": "Answer", "text": "A." } }
  ]
}
</script>
```

### Body Section Order (canonical — ICP-2 v2.1)

All sections inside `<article class="card">` within `<main class="wrap page-grid">`:

```
1.  hero              — <section class="port-hero" id="hero">
2.  from-the-pier     — <nav class="from-the-pier" id="from-the-pier">
3.  logbook           — <details class="port-section" id="logbook" open="">
4.  cruise-port       — <details class="port-section" id="cruise-port" open="">
5.  getting-around    — <details class="port-section" id="getting-around" open="">
6.  map               — <details class="port-section" id="map" open="">
7.  beaches           — <details class="port-section" id="beaches" open=""> (if applicable)
8.  excursions        — <details class="port-section" id="excursions" open="">
9.  history           — <details class="port-section" id="history" open=""> (if applicable)
10. cultural          — <details class="port-section" id="cultural" open=""> (if applicable)
11. shopping          — <details class="port-section" id="shopping" open=""> (if applicable)
12. food              — <details class="port-section" id="food" open="">
13. notices           — <details class="port-section" id="notices" open="">
14. depth-soundings   — <details class="port-section" id="depth-soundings" open="">
15. practical         — <details class="port-section" id="practical" open="">
16. gallery           — <details class="port-section" id="gallery" open="">
17. credits           — <details class="port-section" id="credits" open="">
18. faq               — <details class="port-section" id="faq" open="">
19. weather-guide     — <details class="port-section" id="weather-guide" open="">
```

### Section Content Requirements

| Section | Min Words | Key Requirements |
|---------|-----------|-----------------|
| **hero** | — | `<img>` with WebP hero image, `loading="eager"`, overlay with port name, photo credit link |
| **logbook** | 800 | First-person voice, 2+ emotional pivot markers, 1+ reflection marker, 3+ senses used |
| **cruise-port** | 100 | Terminal name, taxi availability, distance to town, accessibility notes |
| **getting-around** | 200 | Transport options with prices in LOCAL CURRENCY, walking feasibility, accessibility |
| **excursions** | 400 | 4+ specific activities with prices, booking guidance (ship excursion + independent + book ahead) |
| **food** | 100 | Local cuisine, price ranges, specific restaurant names if possible |
| **notices** | 50 | Port-specific warnings, cultural considerations |
| **depth-soundings** | 100 | Port-specific practical tips (NOT generic "tap water varies" boilerplate) |
| **practical** | 100 | Currency, language, tipping, safety, communication |
| **gallery** | — | 6+ images in `<figure class="gallery-item">` with `<figcaption>` + photo-credit |
| **credits** | — | List every image with source attribution |
| **faq** | 200 | 5+ port-specific questions with detailed answers; **MUST include the 4 weather FAQ topics** (see Weather Guide Section below) |
| **weather-guide** | — | Canonical seasonal-guide skeleton inside `port-weather-widget`; honest content per port. See Weather Guide Section below — BLOCKING via `scripts/validate-port-weather.js` |

### Weather Guide Section (BLOCKING — `scripts/validate-port-weather.js`)

Structurally mandated by `scripts/port-weather-validator-core.js` for every port — tropical, temperate, polar, inland. The skeleton is the same for all ports; content inside each slot must be honest to the port. Reference template: `ports/cozumel.html` (passing). For non-Caribbean comparison: `ports/bergen.html` already uses this skeleton with North Atlantic content — note `"Beach: N/A"` is an acceptable honest activity-row value.

Required skeleton inside `<details class="port-section" id="weather-guide" open="">`:

```html
<div id="port-weather-widget" data-port-id="[SLUG]" data-port-name="[PORT]" data-lat="[LAT]" data-lon="[LON]" data-region="[REGION]">
  <noscript>
    <div class="seasonal-guide seasonal-guide-static">
      <!-- 1. At a Glance — all 5 metrics required (Temperature/Humidity/Rain/Wind/Daylight) -->
      <div class="seasonal-glance-grid">
        <div class="seasonal-glance-item"><span class="glance-label">Temperature</span><span class="glance-value">[honest range]</span></div>
        <!-- + Humidity, Rain, Wind, Daylight -->
      </div>
      <!-- 2. Best Time — 3 cruise-seasons + 5 activity-rows + months-to-avoid -->
      <div class="cruise-seasons-grid">
        <div class="cruise-season cruise-season-high"><span class="season-label">Peak Season</span><span class="season-months">[months]</span></div>
        <div class="cruise-season cruise-season-transitional"><span class="season-label">Transitional Season</span><span class="season-months">[months]</span></div>
        <div class="cruise-season cruise-season-low"><span class="season-label">Low Season</span><span class="season-months">[months]</span></div>
      </div>
      <div class="best-months-activities">
        <!-- All 5 activity-rows are required by label. For ports where an activity does not apply, the months value may be "N/A" or a brief honest note ("nearest swimmable beach is 90 min by car"). Never invent. -->
        <div class="activity-row"><span class="activity-label">Beach</span><span class="activity-months">[honest]</span></div>
        <div class="activity-row"><span class="activity-label">Snorkeling</span><span class="activity-months">[honest]</span></div>
        <div class="activity-row"><span class="activity-label">Hiking</span><span class="activity-months">[honest]</span></div>
        <div class="activity-row"><span class="activity-label">City Walking</span><span class="activity-months">[honest]</span></div>
        <div class="activity-row"><span class="activity-label">Low Crowds</span><span class="activity-months">[honest]</span></div>
      </div>
      <div class="months-to-avoid">
        <span class="avoid-label">Consider avoiding:</span>
        <span class="avoid-months">[months OR "None"]</span>
        <span class="avoid-reason">([honest regional reason])</span>
      </div>
      <!-- 3. What Catches Visitors Off Guard — 3-7 items -->
      <ul class="catches-list"><li>…</li></ul>
      <!-- 4. Packing Tips — 3-7 items -->
      <ul class="packing-list"><li>…</li></ul>
      <!-- 5. Weather Hazards — always present; for low-hazard regions, state that honestly -->
      <div class="hazard-warning">
        <span class="hazard-icon">⚠️</span>
        <div class="hazard-content"><strong>[Honest regional hazard name]</strong><p>[Season / risk window]</p></div>
      </div>
    </div>
  </noscript>
</div>
```

**Weather FAQ topics (BLOCKING — 4 required, must appear in BOTH on-page FAQ list AND FAQPage JSON-LD schema).** From `scripts/port-weather-validator-core.js` lines 127–132, the validator matches any of these regex patterns:

| Topic | Validator regex (alternatives) | Honest phrasing per port |
|---|---|---|
| Best time to visit | `best time…(visit\|go\|cruise)` OR `when…(visit\|go\|cruise)` | "When is the best time to visit [PORT]?" — answer with THAT port's actual peak season |
| Hurricane/storm season | `hurricane\|cyclone\|typhoon\|storm season\|severe weather\|bad weather\|weather…(bad\|severe\|stormy\|concern)` | Hurricane zone → "When is hurricane season?". Non-hurricane → "When is the storm season?" or "Are there severe weather periods?" — Bergen: "North Atlantic storm season Oct–Feb"; Mediterranean: "Meltemi winds Jul–Aug" |
| Packing for weather | `pack…(weather\|clothes\|clothing\|jacket\|layer)` OR `what…(pack\|bring\|wear)` OR `how…(dress\|pack)` | "What should I pack for [PORT]'s weather?" or "How should I dress?" |
| Rain concerns | `rain…(ruin\|cancel\|affect\|stop)` OR `will…rain` OR `weather…ruin` | "Will rain affect my visit?" or "Does rain ruin excursions?" |

The validator's `FAQ_COUNT` rule compares on-page FAQ count to FAQPage schema `Question` count. Keep them equal — add a schema `Question` entry for every on-page FAQ. Supported on-page formats (any one): `<details class="faq-item"><summary>question`, `<summary>Q: question`, or `<p><strong>Q: question</strong>...</p>`.

**Sourcing rule.** For an existing port being repaired, draw weather content from what is already verifiable on its page: lat/lon, region, existing climate references, existing Author's Note, existing notices. Do not fabricate temperatures, hurricane seasons, hazards, or activities that aren't supported by the page.

### Sidebar (`<aside>`)

```html
<aside class="card" style="grid-column: 2;">
  <!-- Author card -->
  <!-- At a Glance (country, currency, language, etc.) -->
  <!-- Key Facts -->
  <!-- Nearby Ports -->
  <!-- Recent Stories -->
  <!-- Whimsical Units (optional) -->
</aside>
```

## Content Rules (from careful-not-clever audit)

### MUST DO
- Use LOCAL CURRENCY for all prices (not USD unless the port uses USD)
- Write port-SPECIFIC depth soundings (not generic)
- Include "soundings in another's wake" disclaimer for unvisited ports
- Every `<img>` in a `<figure>` must have `<figcaption>` with `<span class="photo-credit">`
- All internal port links must end with `.html`
- Use `<div class="navbar">` for outer wrapper, `<nav class="site-nav">` for inner
- Populate all 5 weather-guide activity-rows (Beach/Snorkeling/Hiking/City Walking/Low Crowds) and all 4 weather FAQ topics for every port. For activities or hazards that do not apply to a port, write the honest answer ("Beach: N/A — nearest swimmable beach is 90 min by car"); never fabricate to satisfy the slot, but never omit the slot

### MUST NOT
- Use identical text from other port pages (template filler)
- Use generic weather data ("Varies by season — check forecast"). Substitute real ranges grounded in the port's existing climate references; if data is missing, say so honestly ("Cool maritime; expect 50–65°F summer, 30–45°F winter — verify against current forecast")
- Use "Tap water safety varies by destination" (specify actual water safety)
- Use forbidden words: nightlife, once-in-a-lifetime, must-do, life-changing, YOLO
- Repeat same emotional phrases across pages ("breath caught" is on 46 pages already)
- Have contradictory Author's Notes (sidebar says unvisited, body says visited)

### EMOTIONAL PIVOT MARKERS (need 2+ unique per page)
Choose DIFFERENT ones for each port — avoid "breath caught" and "whispered a quiet prayer" (overused):
- tears, wept, eyes welled/filled
- heart ached/swelled/leapt
- choked up, couldn't speak
- moment of silence, quiet grace
- hand reached/squeezed
- something shifted/changed/broke open
- for the first time in [my life]
- healing, reconciliation, forgiveness
- finally understood/saw

### REFLECTION MARKERS (need 1+ per page)
- "I learned/realized/understood/discovered"
- "The lesson:"
- "Looking back"
- "What matters is/was"
- "In retrospect"

## Validation Checklist

Before delivering a new port page, verify:

1. [ ] `node admin/validate-port-page-v2.js ports/[SLUG].html` → PASS
2. [ ] `node scripts/validate-port-weather.js ports/[SLUG].html` → PASS or WARN (BLOCKING sub-validator that v2 spawns; WARN with only `SPEC_REG` is acceptable when the port is not yet in `scripts/files-7/port-registry.json`)
3. [ ] `node admin/port-page-audit.cjs ports/[SLUG].html` → 0 CRITICAL, 0 HIGH
4. [ ] `node admin/validate-port-page-v2.js ports/[SLUG].html --gold-standard` → 0 gold standard gaps
5. [ ] `node admin/gold-standard-compare.cjs ports/[SLUG].html` → 0 differences
6. [ ] Port slug matches filename
7. [ ] `last-reviewed` set to today's date
8. [ ] `dateModified` in JSON-LD matches `last-reviewed`
9. [ ] Disclaimer level matches port-disclaimer-registry.json
10. [ ] All images exist on disk at `/ports/img/[SLUG]/`
11. [ ] Each image has `-attr.json` attribution file

## Integration

- **validate-port-page-v2.js** — Must pass with score 90+
- **validate-port-weather.js** — BLOCKING sub-validator spawned by v2. Required structural template + 4 FAQ topics; `SPEC_REG` (port-not-in-registry) is a non-blocking warning
- **port-page-audit.cjs** — Must have 0 CRITICAL/HIGH issues
- **gold-standard-compare.cjs** — Should match dubai.html structure
- **icp-2** — ICP-2 v2.1 compliance (ai-summary, last-reviewed, JSON-LD)
- **voice-audit hook** — Fires before git commit on content files
- **careful-not-clever** — Read before editing, verify, document

---

*Soli Deo Gloria* — Every port is a place God made. We help people experience it well.
