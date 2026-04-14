---
name: port-content-builder
description: "Generates and updates cruise port pages from POI schema data, enforcing site standards, voice, and accessibility requirements. Knows the 388-port structure and content patterns."
version: 1.0.0
---

# Port Content Builder

> Every port page helps someone plan their best day ashore.

## Purpose

Generates and maintains port guide pages in `ports/` using the POI index schema and port map schema. Ensures consistent structure, accurate data, proper schema.org markup, and the site's faith-integrated voice.

## When to Fire

- When creating a new port page
- When updating an existing port page
- On `/port` command
- When POI data changes for a port

## Schema Files

- **POI Index:** `assets/data/schema/poi-index.schema.json` — Global point-of-interest definitions
- **Port Map:** `assets/data/schema/port-map.schema.json` — Per-port map configuration

### POI Schema Requirements
- `id`: lowercase, hyphens only (pattern: `^[a-z0-9-]+$`)
- Required: coordinates, categories, descriptions
- Optional: images, hours, pricing, accessibility info

### Port Map Requirements
- `port_slug`: matches filename (`/ports/{slug}.html`)
- `port_name`: human-readable name
- `port_pin`: cruise terminal coordinates
- POI references link to the global POI index

## Page Structure Standard

Every port page follows this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta: title, description, viewport, charset -->
  <!-- Schema.org: LocalBusiness or TouristDestination -->
  <!-- Open Graph + Twitter Cards -->
  <!-- AI meta: ai:summary, ai:target-audience, last-reviewed -->
  <!-- CSS + preconnect -->
</head>
<body>
  <header><!-- Site navigation with compass nav pattern --></header>

  <main>
    <section class="hero"><!-- Port hero image + name --></section>

    <aside class="port-info-rail">
      <!-- Right-side rail: country, currency, language, timezone, tender/dock -->
    </aside>

    <section id="overview"><!-- 2-3 paragraph port overview --></section>
    <section id="getting-there"><!-- How to get from ship to town --></section>
    <section id="getting-around"><!-- Local transport options --></section>
    <section id="must-see"><!-- Top attractions with POI references --></section>
    <section id="dining"><!-- Restaurant recommendations --></section>
    <section id="shopping"><!-- Shopping areas and markets --></section>
    <section id="beaches"><!-- Beach/excursion options (if applicable) --></section>
    <section id="accessibility"><!-- Accessibility notes for the port --></section>
    <section id="tips"><!-- Practical tips from experience --></section>
  </main>

  <footer><!-- Standard site footer --></footer>
</body>
</html>
```

## Voice Standards

- Write from real cruising experience (50+ voyages perspective)
- Faith-integrated but not preachy — "Soli Deo Gloria" in spirit, not in every paragraph
- Practical first: "The tender dock is a 5-minute walk from the main shopping area"
- Honest about limitations: "We haven't visited this port ourselves — this is researched content"
- Accessibility-aware: note wheelchair access, tender vs dock, terrain difficulty

## Content Requirements Per Section

### Overview (2-3 paragraphs)
- What kind of port this is (beach, cultural, adventure, shopping)
- Best for what type of cruiser
- One-sentence "if you only have 4 hours" recommendation

### Getting There
- Tender or dock? How far to town?
- Taxi availability and approximate costs
- Walking feasibility from the pier

### Must-See (3-5 POIs)
- Reference POI IDs from the poi-index
- Include distance from pier, approximate time needed, cost range
- Accessibility notes for each

### Dining (2-4 recommendations)
- Local cuisine highlights
- Budget range indicators
- Location relative to pier

### Practical Tips
- Currency and payment (cash vs card)
- Safety considerations
- Best time to go ashore (avoid crowds)
- Return-to-ship timing advice

## Validation Before Writing

Before generating or updating a port page:
1. Check POI index for existing POIs in this port
2. Verify the port slug matches the filename
3. Ensure all referenced POIs exist in the index
4. Validate against port-map schema
5. Check `last-reviewed` date will be set to today

## Integration

- **seo-schema-audit** — Validates the JSON-LD on generated pages
- **link-integrity** — Verifies all internal links from the new page
- **content-freshness** — Sets `last-reviewed` to current date
- **accessibility-audit** — Ensures WCAG 2.1 AA compliance
- **icp-2** — AI meta tags for answer engine optimization

---

*Soli Deo Gloria* — Every port is a place God made. We help people experience it well.
