# Ship Page Standard v1.0

**Document Version:** 1.0
**Last Updated:** 2025-12-27
**Applies To:** All ship pages in `/ships/*/` directories
**Standard ID:** ITW-SHIP-001

---

## Overview

This standard defines the normalized structure, required elements, and validation rules for all ship information pages on In the Wake. Ship pages are entity pages that provide comprehensive information about cruise ships including specs, dining, tracking, and media.

---

## Page Types

Ship pages fall into three categories:

| Type | Description | Required Sections | Example |
|------|-------------|-------------------|---------|
| **Active Ship** | Currently sailing vessels | All standard sections | `harmony-of-the-seas.html` |
| **TBN Ship** | To-Be-Named future ships | Modified sections (limited data) | `icon-class-ship-tbn-2027.html` |
| **Retired Ship** | Historical/decommissioned ships | Historical context sections | `song-of-america.html` |

---

## Required File Naming

- **Pattern:** `{ship-slug}.html`
- **Format:** kebab-case (lowercase, hyphens)
- **Examples:** `adventure-of-the-seas.html`, `icon-class-ship-tbn-2027.html`

---

## HEAD Section Requirements

### 1. Document Structure Comment

```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
"Trust in the LORD with all your heart..." — Proverbs 3:5
"Whatever you do, work heartily, as for the Lord..." — Colossians 3:23

STANDARDS: Every Page v3.010.300 · Production Template · Unified Nav v3.010.300 · A11y/WCAG 2.1 AA Compliant
-->
```

### 2. AI-Breadcrumbs Comment (REQUIRED)

Must include these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `entity` | Yes | "Ship" |
| `name` | Yes | Full ship name |
| `class` | Yes | Ship class (e.g., "Oasis Class") |
| `operator` | Yes | "Royal Caribbean" (or other line) |
| `parent` | Yes | "/ships.html" |
| `siblings` | Yes | Comma-separated sister ships |
| `related` | Yes | Related page paths |
| `subject` | Yes | One-line summary |
| `intended-reader` | Yes | Target audience |
| `core-facts` | Yes | Key ship facts |
| `decisions-informed` | Yes | What decisions this page helps with |
| `updated` | Yes | YYYY-MM-DD format |

**Example:**
```html
<!-- ai-breadcrumbs
entity: Ship
name: Harmony of the Seas
class: Oasis Class
operator: Royal Caribbean
parent: /ships.html
siblings: Oasis of the Seas, Allure of the Seas, Symphony of the Seas, Wonder of the Seas, Utopia of the Seas
related: /ships.html, /cruise-lines/royal-caribbean.html, /ports.html
subject: Harmony of the Seas is an Oasis Class Royal Caribbean ship offering deck plans, live ship tracking, dining venue details, and video tours
intended-reader: Cruisers researching Harmony of the Seas or comparing Royal Caribbean ships
core-facts: launched 2016; 226,963 GT; about 6,780 guests; features seven neighborhoods
decisions-informed: whether Harmony of the Seas's size, layout, and vibe fit your travel style
updated: 2025-11-18
-->
```

### 3. ICP-Lite v1.4 Meta Tags (REQUIRED)

| Meta Tag | Max Length | Required | Mirroring |
|----------|------------|----------|-----------|
| `ai-summary` | 250 chars | Yes | Must match WebPage JSON-LD description |
| `last-reviewed` | YYYY-MM-DD | Yes | Must match WebPage JSON-LD dateModified |
| `content-protocol` | N/A | Yes | Must be "ICP-Lite v1.4" |

### 4. SEO Meta Tags (REQUIRED)

| Tag | Required | Constraints |
|-----|----------|-------------|
| `title` | Yes | Pattern: `{Ship Name} — Deck Plans, Live Tracker, Dining & Videos | In the Wake (V1.Beta)` |
| `description` | Yes | Must match `ai-summary` |
| `canonical` | Yes | Full URL to page |
| `robots` | Yes | `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1` |

### 5. Open Graph Tags (REQUIRED)

| Property | Required |
|----------|----------|
| `og:type` | Yes (`website`) |
| `og:site_name` | Yes (`In the Wake`) |
| `og:title` | Yes |
| `og:description` | Yes |
| `og:url` | Yes |
| `og:locale` | Yes (`en_US`) |
| `og:image` | Yes (path: `/assets/social/{slug}.jpg`) |

### 6. Twitter Card Tags (REQUIRED)

| Property | Required |
|----------|----------|
| `twitter:card` | Yes (`summary_large_image`) |
| `twitter:title` | Yes |
| `twitter:description` | Yes |
| `twitter:image` | Yes |

### 7. JSON-LD Schema Requirements (REQUIRED)

All ship pages must include these JSON-LD blocks:

| Schema Type | Required | Notes |
|-------------|----------|-------|
| Organization | Yes | Standard In the Wake org |
| WebSite + SearchAction | Yes | Site-wide search |
| BreadcrumbList | Yes | 4-level breadcrumb |
| Review | Yes | Ship overview review |
| Person (E-E-A-T) | Yes | Author: Ken Baker |
| WebPage (ICP-Lite) | Yes | With `mainEntity` |
| FAQPage | Yes | 4-6 ship-specific FAQs |

#### WebPage Schema Requirements

```json
{
  "@type": "WebPage",
  "name": "{Ship Name} — Deck Plans, Live Tracker, Dining & Videos",
  "url": "https://cruisinginthewake.com/ships/rcl/{slug}.html",
  "description": "{matches ai-summary exactly}",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "{matches last-reviewed exactly}",
  "inLanguage": "en-US",
  "mainEntity": {
    "@type": "Cruise",
    "name": "{Ship Name}"
  }
}
```

#### Review Schema Consistency

The `itemReviewed.description` MUST match the actual ship class:

- **BLOCKING:** Description must reference correct ship class
- **Example Error:** TBN 2027 says "Radiance-class" but should say "Icon-class"

---

## BODY Section Structure

### Required Section Order

Ship pages must follow this section ordering:

| Order | Section ID | Section Name | Required |
|-------|------------|--------------|----------|
| 1 | `page-intro` | Page Introduction | Yes |
| 2 | `first-look` | A First Look (Gallery + Stats) | Yes |
| 3 | `dining-section` | Dining Venues | Yes |
| 4 | `logbook-section` | Tales From the Wake | Yes |
| 5 | `video-section` | Video Highlights | Yes |
| 6 | `map-section` | Ship Map / Deck Plans | Yes |
| 7 | `tracker-section` | Live Ship Tracker | Yes* |
| 8 | `faq-section` | FAQ | Yes |
| 9 | `attribution` | Image Credits | Yes |
| 10 | `recent-rail` | Right Rail (Recent Stories) | Yes |

*For TBN ships, tracker shows "TBD" placeholder.

### Required Data Attributes

The page must include these data attributes:

| Attribute | Location | Required | Description |
|-----------|----------|----------|-------------|
| `data-ship` | Main container | Yes | Display name |
| `data-imo` | Tracker section | Yes* | IMO number (or "TBD") |
| `data-name` | Stats container | Yes | Uppercase ship name |
| `data-slug` | Various | Yes | Kebab-case slug |

---

## Section-Specific Requirements

### 1. Page Introduction

**Required Elements:**
- H1 with ship name
- "Looking for..." or "What this page covers" intro
- "Best For" traveler guidance
- Answer-first content block

### 2. A First Look Section

**Required Elements:**
- Swiper.js image carousel
- Ship-at-a-Glance stats card with fallback JSON
- Sister ships section
- Ship class explorer pills

**Stats Card Fields (Active Ships):**

| Field | Required | Format |
|-------|----------|--------|
| Length | Yes | `X ft (Y m)` |
| Beam | Yes | `X ft (Y m)` |
| Gross Tonnage | Yes | `X,XXX GT` |
| Guest Capacity | Yes | `X,XXX guests` |
| Crew | Yes | `X,XXX crew` |
| Year Built | Yes | `YYYY` |
| Ship Class | Yes | Class name |
| Last Refurb | No | `YYYY` or "N/A" |

**For TBN Ships:**
- Stats show "TBD" for unknown values
- Include "New Ship Class — Limited Information Available" alert

### 3. Dining Section

**Required Elements:**
- Hero image with proper alt text referencing the ship
- Dynamic dining loader
- Categories: MDR, Specialty, Casual, Bars
- `data-ship` attribute for dynamic loading

**BLOCKING Error:** Dining section must NOT reference wrong ship name in alt text or titles.

### 4. Logbook Section (Tales From the Wake)

**Required Elements:**
- Story carousel
- Navigation arrows
- Author attribution
- `data-ship` attribute

### 5. Video Section

**Required Elements:**
- Swiper video carousel
- YouTube-nocookie embeds
- Fallback message
- Title must reference correct ship name

**BLOCKING Error:** Video section heading must NOT reference wrong ship (e.g., "Watch Radiance Highlights" on Icon Class page).

### 6. Map Section

**Required Elements:**
- Link to official deck plans (RCL website)
- Placeholder image for deck plans

### 7. Live Tracker Section

**Required Elements:**
- MarineTraffic iframe (or placeholder for TBN)
- `data-imo` attribute
- Current position heading

**BLOCKING Error:** Tracker heading must NOT reference wrong ship name.

**For TBN Ships:**
- Show `data-imo="TBD"`
- Include notice about tracking unavailability

### 8. FAQ Section

**Required Elements:**
- Minimum 4 FAQs
- Maximum 8 FAQs
- `<details>` elements (collapsible)
- Contextual links to sister ships/restaurants

**FAQ Topics (Active Ships):**
1. What class is [Ship]?
2. How many passengers does [Ship] hold?
3. What are the best dining options on [Ship]?
4. How does [Ship] compare to sister ships?
5. What year was [Ship] built?
6. What itineraries does [Ship] sail?

**FAQ Topics (TBN Ships):**
1. When will [Ship] debut?
2. What features will [Ship] have?
3. What is a TBN ship?
4. How does this compare to existing [Class] ships?

### 9. Attribution Section

**Required Elements:**
- Image credits (Wikimedia Commons or Flickers of Majesty)
- Links to original sources

### 10. Right Rail (Recent Stories)

**Required Elements:**
- `#recent-rail` container
- `#recent-rail-nav-top` pagination
- `#recent-rail-nav-bottom` pagination
- `#recent-rail-fallback` loading state
- `#authors-rail` section

---

## JavaScript Requirements

### Required Scripts

| Script | Purpose | Required |
|--------|---------|----------|
| Swiper.js | Carousels | Yes |
| First Look Carousel | Image gallery | Yes |
| Ship Stats Loader | Dynamic stats | Yes |
| Dining Loader | Dynamic venues | Yes |
| Video Loader | Video carousel | Yes |
| Logbook Loader | Crew stories | Yes |
| Tracker Init | MarineTraffic | Yes |
| Articles Loader | Recent Stories | Yes |

### Script Duplication Rules

**BLOCKING Errors:**
- Only ONE `loadArticles()` function per page
- Only ONE Recent Stories script block
- No duplicate Swiper initializations for same carousel

---

## Image Requirements

### Image Counts

| Category | Minimum | Maximum | Notes |
|----------|---------|---------|-------|
| First Look Carousel | 3 | 10 | Ship photos |
| Dining Section | 1 | 1 | Hero image |
| Total Page Images | 5 | 20 | Including all sections |

### Image Attributes

| Attribute | Required | Constraints |
|-----------|----------|-------------|
| `alt` | Yes | 20+ characters, ship-specific |
| `loading` | Yes | "lazy" (except hero) |
| `decoding` | Yes | "async" |

### Image Paths

- Ship images: `/assets/ships/{slug}/` or `/assets/ships/{filename}.webp`
- Social images: `/assets/social/{slug}.jpg`
- Format priority: `.webp` > `.jpg`

---

## Cross-Linking Requirements

### Internal Links

| Link Type | Required | Destination |
|-----------|----------|-------------|
| Ships index | Yes | `/ships.html` |
| Cruise line | Yes | `/cruise-lines/royal-caribbean.html` |
| Sister ships | Yes | Each sibling ship page |
| Class page | No | Ship class index (if exists) |

### External Links

| Link Type | Required | Pattern |
|-----------|----------|---------|
| Official deck plans | Yes | RCL website |
| MarineTraffic | Yes* | Via iframe |

---

## Accessibility Requirements (WCAG 2.1 AA)

| Requirement | Status |
|-------------|--------|
| Skip to content link | Required |
| ARIA labels on interactive elements | Required |
| Keyboard navigation for carousels | Required |
| Alt text on all images | Required |
| Color contrast ratios | Required |
| Focus indicators | Required |

---

## Validation Rules Summary

### BLOCKING Errors (Must Fix)

1. Missing or invalid `content-protocol` (must be "ICP-Lite v1.4")
2. Missing `ai-summary` meta tag
3. `ai-summary` exceeds 250 characters
4. Missing `last-reviewed` meta tag
5. `last-reviewed` format not YYYY-MM-DD
6. Missing WebPage JSON-LD schema
7. WebPage description doesn't match `ai-summary`
8. WebPage dateModified doesn't match `last-reviewed`
9. Missing `mainEntity` in WebPage JSON-LD
10. Review schema references wrong ship class
11. Section headings reference wrong ship name
12. Alt text references wrong ship name
13. Missing required sections
14. Duplicate script blocks
15. Missing `data-imo` attribute (or "TBD" for TBN)

### Warnings (Should Fix)

1. `ai-summary` shorter than 100 characters
2. Missing optional sections
3. Image count below recommended
4. FAQ count below 4
5. Missing sister ship cross-links
6. Old thumbnail sizes (72x48 instead of 56x56)

---

## TBN Ship Special Rules

For To-Be-Named ships, the following modified rules apply:

| Standard Rule | TBN Modification |
|---------------|------------------|
| Stats values | May show "TBD" |
| Image carousel | May be empty |
| Live tracker | Shows placeholder |
| data-imo | Set to "TBD" |
| Review body | Describe expected features |
| FAQ topics | Focus on upcoming features |

**Required TBN Elements:**
- "New Ship Class — Limited Information Available" notice
- "Stay Updated" section with coming features
- Expected debut year in title

---

## File Checklist

Before publishing, verify:

- [ ] File follows naming convention (`{ship-slug}.html`)
- [ ] AI-breadcrumbs comment complete
- [ ] ICP-Lite v1.4 meta tags present
- [ ] All JSON-LD schemas valid
- [ ] mainEntity present in WebPage schema
- [ ] All sections present and ordered correctly
- [ ] data-ship attribute matches ship name
- [ ] data-imo attribute set (or "TBD")
- [ ] No wrong ship name references
- [ ] Recent Stories rail complete
- [ ] Images have proper alt text
- [ ] Sister ships linked
- [ ] FAQ section has 4+ questions

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial standard based on codebase analysis |

---

*Soli Deo Gloria*
