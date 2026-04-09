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
| **faq** | 200 | 5+ port-specific questions with detailed answers |

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

### MUST NOT
- Use identical text from other port pages (template filler)
- Use generic weather data ("Varies by season — check forecast")
- Use "Beach/Snorkeling" activities for non-tropical ports
- Use "Hurricane season" FAQ for non-hurricane-zone ports
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
2. [ ] `node admin/port-page-audit.cjs ports/[SLUG].html` → 0 CRITICAL, 0 HIGH
3. [ ] `node admin/validate-port-page-v2.js ports/[SLUG].html --gold-standard` → 0 gold standard gaps
4. [ ] `node admin/gold-standard-compare.cjs ports/[SLUG].html` → 0 differences
5. [ ] Port slug matches filename
6. [ ] `last-reviewed` set to today's date
7. [ ] `dateModified` in JSON-LD matches `last-reviewed`
8. [ ] Disclaimer level matches port-disclaimer-registry.json
9. [ ] All images exist on disk at `/ports/img/[SLUG]/`
10. [ ] Each image has `-attr.json` attribution file

## Integration

- **validate-port-page-v2.js** — Must pass with score 90+
- **port-page-audit.cjs** — Must have 0 CRITICAL/HIGH issues
- **gold-standard-compare.cjs** — Should match dubai.html structure
- **icp-2** — ICP-2 v2.1 compliance (ai-summary, last-reviewed, JSON-LD)
- **voice-audit hook** — Fires before git commit on content files
- **careful-not-clever** — Read before editing, verify, document

---

*Soli Deo Gloria* — Every port is a place God made. We help people experience it well.
