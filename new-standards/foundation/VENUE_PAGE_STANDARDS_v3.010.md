# Venue Page Standards v3.010

**Version:** 3.010.001
**Created:** 2026-03-27
**Applies to:** All 472 restaurant/venue pages across 5 cruise lines
**Gold standard pages:** `two70.html`, `mdr.html`, `windjammer.html`
**Validator:** `admin/validate-venue-page-v2.js` (40+ checks, 100% pass rate on structure)

> This standard defines what a **complete, indexable** venue page looks like.
> Structural validation already passes at 100%. This standard addresses the
> **content quality gap** between Gen2 pages (20%, Google indexes) and
> Gen1 stubs (80%, Google crawls but refuses to index).

---

## The Problem

Google Search Console (2026-03-23) reports **369 pages crawled but not indexed**.
An estimated 200+ are Gen1 venue stubs. These pages pass structural validation
but fail Google's quality threshold because they lack:

- Specific pricing (187 pages say "Varies by venue")
- Authentic voice (297 pages use generic "Guest Experience Summary")
- Ship availability data (18 pages say "coming soon")
- Venue-specific photos (96% use stock images only)
- Rich metadata (96% lack `venue-tags` meta)

---

## Venue Classification

The validator classifies venues into 10 styles. Standards differ by style:

| Style | Examples | Menu Required | Price Format | Photo Priority |
|-------|----------|--------------|-------------|----------------|
| fine-dining | Wonderland, 150 Central Park | Yes | Exact cover charge ($49–$89 pp) | High |
| specialty | Izumi, Chops Grille, Hooked | Yes | Exact surcharge ($XX pp) | High |
| casual-dining | MDR, Solarium Bistro | Yes | "Included" + upgrade context | Medium |
| counter-service | Sorrento's, El Loco Fresh | Yes | "Complimentary" | Medium |
| buffet | Windjammer, Lido Marketplace | Yes | "Included" | Medium |
| bar | Schooner Bar, Bamboo Room | No (drink list) | Drink price ranges ($12–$18) | Medium |
| coffee | Café Promenade, JavaBlue | No (drink list) | Specific items ($4.50 latte) | Low |
| dessert | Gelateria, Sugar Beach | No (item list) | Specific items ($5–$8) | Low |
| entertainment | Two70, Royal Theater, AquaTheater | No (show list) | "Complimentary" | High |
| activity | FlowRider, Rock Climbing, Zip Line | No | "Included" or "per session" | High |

---

## Required Sections (All Venues)

Every venue page MUST contain these 7 sections in this order:

### 1. Overview (`id="overview"`)

```
├── h1.page-title           — Venue name
├── p.subtitle              — "{Cruise Line} — {Category}"
├── figure.venue-photo      — Venue-specific image (if available)
├── p.answer-line           — Quick answer (complete sentence, not tagline)
├── p.fit-guidance          — "Best For: {specific personas}"
├── div.key-facts           — 4–7 specific facts (see Key Facts below)
├── p.lede                  — One-liner with personality
├── p.blurb                 — Full paragraph with context and cross-links
└── p.pill.version          — Version badge
```

**Key Facts — Required entries by style:**

| Fact | fine-dining | specialty | casual | counter | buffet | bar | entertainment | activity |
|------|:-----------:|:---------:|:------:|:-------:|:------:|:---:|:------------:|:--------:|
| Price | ✓ exact | ✓ exact | ✓ "Included" | ✓ "Complimentary" | ✓ "Included" | ✓ range | ✓ "Complimentary" | ✓ exact or "Included" |
| Hours | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Show times | Session times |
| Reservations | ✓ | ✓ | ✓ | — | — | — | "Open seating" | How to book |
| Dress code | ✓ | ✓ | ✓ | — | — | — | — | — |
| Location/Deck | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Capacity | Optional | Optional | Optional | — | — | — | ✓ | — |

**NEVER acceptable in Key Facts:**
- "Varies by venue" — always provide the specific price
- "Check onboard" — provide the real answer
- "TBD" / "Coming soon" — omit until known

### 2. Menu / Experience (`id="menu-prices"`)

**Dining venues:** Full menu with collapsible `<details>` sections per theme night or menu category. Grid layout: Starters | Mains | Desserts. Include actual dish names.

**Entertainment venues:** Show cards with:
- Show name, ships available, runtime
- 1–2 paragraph description
- Guest review with ship name, date, first-person narrative, star rating

**Activity venues:** Description of the experience, what to expect, tips.

**Bars/Coffee/Dessert:** Drink or item list with specific prices.

### 3. Accommodations (`id="accommodations"`)

- Allergen/dietary info specific to this venue
- Accessibility notes (wheelchair, hearing loop)
- Special accommodation details

### 4. Ship Availability (`id="availability"`)

- Grouped by ship class
- Each ship links to `/ships/{line}/{slug}.html`
- No placeholder text ("coming soon" is BLOCKING)

### 5. Traveler's Logbook (`id="logbook"`)

The voice and authenticity standard. This is what separates indexable pages from stubs.

**Gen2 standard (REQUIRED for normalization):**
```
├── h2: "Traveler's Logbook" or "The Logbook — Real Guest Soundings"
├── h3: "{Venue} Review: {Specific descriptor}" (NOT "Guest Experience Summary")
├── Named context: Ship name + date ("Quantum of the Seas, September 2024")
├── Subsections (h4): Food & Drinks, Service, Atmosphere, Conclusion
├── Specific observations: actual dish names, textures, temperatures
├── Personal voice: "I noticed...", "What surprised me...", "The thing that..."
├── Pro Tips (ul): 3–5 specific, actionable tips only a visitor would know
├── Rating: X.X/5 with summary sentence
└── Review schema JSON-LD with ratingValue
```

**NEVER acceptable in Logbook:**
- "Guest Experience Summary" as review title
- Generic observations that could apply to any venue
- "The food was excellent and the service attentive" (says nothing)
- Pro tips like "Arrive early" without context (early = how early? for what?)

### 6. Sources (`id="sources"`)

- Official cruise line website link
- Menu source (if external)
- Any referenced content

### 7. FAQ (`id="faq"`)

- Minimum 5 questions, maximum 9
- Each answer: 2–4 sentences with specific details
- Must include venue-specific questions (not just generic cruise dining FAQs)
- Must match FAQPage JSON-LD schema exactly

---

## Required Metadata

### Head Meta Tags

| Tag | Required | Example |
|-----|----------|---------|
| `ai-summary` | ✓ | "Wonderland is Royal Caribbean's whimsical molecular gastronomy restaurant..." (max 250 chars) |
| `last-reviewed` | ✓ | "2026-03-27" |
| `content-protocol` | ✓ | "ICP-Lite v1.4" |
| `venue-tags` | ✓ (NEW) | "wonderland, molecular, specialty, $49, oasis-class, quantum-class, dinner, reservations" |
| `description` | ✓ | ≤155 chars, standalone sentence |
| `canonical` | ✓ | Absolute HTTPS URL |
| Open Graph (4 tags) | ✓ | og:title, og:description, og:url, og:image |
| Twitter Card (4 tags) | ✓ | twitter:card, twitter:title, twitter:description, twitter:image |

### AI-Breadcrumbs Comment

```html
<!-- ai-breadcrumbs
     entity: {Venue Name}
     type: {Venue Type} (Restaurant, Bar, Entertainment Venue, Activity)
     parent: /restaurants.html
     category: {Category} (Fine Dining, Specialty, Casual, Buffet, Entertainment, Activity)
     cruise-line: {Cruise Line}
     ship-class: {Primary ship class(es)}
     updated: {YYYY-MM-DD}
     expertise: {comma-separated expertise keywords}
     target-audience: {comma-separated audience descriptors}
     answer-first: {Complete standalone sentence answering "What is this venue?"}
     -->
```

### JSON-LD Schema (Required Blocks)

1. **WebPage** — with `mainEntity` of appropriate `@type`:
   - Dining: `"@type": "Restaurant"`
   - Activity: `"@type": "SportsActivityLocation"`
   - Entertainment: `"@type": "PerformingArtsTheater"` or `"EntertainmentBusiness"`
   - Bar: `"@type": "BarOrPub"`

2. **BreadcrumbList** — Home → Restaurants → {Venue}

3. **FAQPage** — All FAQ questions with full answers

4. **Review** — Embedded in logbook section with `ratingValue`

### Immutable Requirements

- **Soli Deo Gloria** invocation before line 20
- **Skip-to-content** link
- **ARIA live regions** (`#a11y-status`, `#a11y-alerts`)
- **Author card** in right rail
- **Print Guide** button
- **No inline JavaScript** (except service worker registration and analytics)
- **WebP only** for images (except logo_wake.png)

---

## Content Quality Thresholds

### The Emotional Hook Test

Every venue page must pass all 5 questions:

1. **CLARITY** — Can the reader find what they need in 10 seconds?
   - Quick Answer visible without scrolling
   - Key Facts scannable
   - Price immediately clear

2. **CALM** — Does the tone reassure rather than sell?
   - No urgency language ("Don't miss!", "Book now!")
   - No superlatives without evidence
   - Honest about limitations

3. **SEEN** — Does the reader feel the writer has actually been here?
   - Named ship and date in logbook
   - Specific dish names, not categories
   - Observations only a visitor would make
   - **FAIL indicator:** "Guest Experience Summary" as review title

4. **CONFIDENCE** — Does the reader get actionable answers?
   - Specific prices, not "Varies"
   - Specific hours, not "Check onboard"
   - Specific ship list, not "Coming soon"
   - **FAIL indicator:** "Varies by venue" in Key Facts

5. **GUIDED** — Does the reader know what to do next?
   - Cross-links to related venues
   - Cross-links to ship pages
   - Clear next steps for booking/reservations

### Minimum Content Sizes

| Section | Minimum Words | Gen1 Typical | Gen2 Target |
|---------|-------------|-------------|-------------|
| Quick Answer | 25 | 8–12 | 30–50 |
| Blurb | 40 | 15–25 | 50–80 |
| Menu/Experience | 100 | 30–50 (bullet lists) | 150–400 (collapsible details) |
| Logbook | 150 | 60–80 (generic) | 200–400 (specific, first-person) |
| FAQ answers (each) | 20 | 10–15 | 25–50 |
| Total page text | 600 | 300–400 | 800–1,500 |

---

## Gen1 → Gen2 Normalization Checklist

For each Gen1 page being upgraded:

- [ ] Replace "Varies by venue" with specific price from venue data JSON
- [ ] Replace "Guest Experience Summary" with "{Venue} Review: {Specific descriptor}"
- [ ] Add named ship + date context to logbook
- [ ] Replace generic logbook text with venue-specific observations
- [ ] Add specific Pro Tips (3–5, actionable, venue-specific)
- [ ] Replace generic FAQ answers with substantive 2–4 sentence responses
- [ ] Add `venue-tags` meta tag (15–25 keywords)
- [ ] Update `ai-breadcrumbs` answer-first to complete sentence
- [ ] Expand Quick Answer from tagline to full sentence
- [ ] Update `last-reviewed` date
- [ ] Verify JSON-LD `@type` matches venue classification
- [ ] Verify JSON-LD `description` matches `ai-summary`
- [ ] Remove "Ship availability coming soon" — add real data or omit section
- [ ] Verify all FAQ answers match FAQPage schema
- [ ] Ensure no duplicated FAQ text

---

## Data Sources for Normalization

Venue metadata lives in JSON files that provide the truth data:

| File | Cruise Line | Venues | Has Menus |
|------|------------|--------|-----------|
| `assets/data/venues-v2.json` | RCL | 325 | Via separate files |
| `assets/data/ncl-venues.json` | NCL | 78 | `ncl-venue-menus.json` |
| `assets/data/carnival-venues.json` | Carnival | 23 | `carnival-venue-menus.json` |
| `assets/data/msc-venues.json` | MSC | 45 | `msc-venue-menus.json` |
| `assets/data/virgin-venues.json` | Virgin | 46 | `virgin-venue-menus.json` |

Use these files to pull accurate pricing, categories, ship availability, and menu items
when upgrading Gen1 pages. Do not invent data — if the JSON doesn't have a price,
research it or mark it honestly ("Specialty dining surcharge applies — check current pricing").

---

## Validator Reference

The v2 validator (`admin/validate-venue-page-v2.js`) checks:

**Technical (T01–T11):** Image duplication, menu presence, analytics, required sections,
Soli Deo Gloria, ICP-Lite tags, JSON-LD schemas, WCAG elements, navigation, local images

**Semantic (S01–S06):** Generic template text, generic "best for", dress code mismatch,
generic FAQ contamination, wrong stock image, unfulfilled description promises

**Quality (W01–W05):** No venue-specific images, template-length detection, missing author
card, missing OG/Twitter images, stale last-reviewed date

All 472 pages currently pass (100%). The gap this standard addresses is **content quality
beyond what the validator can measure** — authenticity, specificity, and emotional resonance
that determine whether Google indexes the page.

---

*Soli Deo Gloria*
