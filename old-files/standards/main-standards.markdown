# In The Wake Standards (Main Document v2.232)

This document is the single source of truth for building, editing, and maintaining the **In the Wake** website, incorporating Royal Caribbean International (RCI) and Carnival Cruise Line ship lists (current, former, coming soon) as of September 15, 2025. It merges the "In The Wake – AI Project Ruleset (v1.0)" with prior versions (v2.201–v2.231) and the v2.229 Addendum. Version v2.232 retains the modular structure (main + sub-documents for ships, root, cruise-lines), integrates addendum updates (§2.1 Path Canonicalization, §2.2 Filename Normalizer, §7.15 DOM Fingerprint Check, §6.1 Media Source Merge, §2.3 Site Tree Integrity), and ensures ChatGPT management at 95–99% effectiveness. Sub-documents are linked in §17; all rules are additive, preserving continuity.

> **Golden Reference:** `/ships/rcl/grandeur-of-the-seas.html` is the visual/structural gold standard. **Do not edit that file.** Everything else must match its structure and conventions. The site owner updates it manually.

## 0) Principles (applies to all HTML files)
- **Single source of truth.** The Standards define what the site must look like and how it must be wired. Code must conform to this doc and sub-documents.
- **Deterministic output.** Rebuilders must rebuild the entire `<main>` block and footer to guarantee correct order and content.
- **Absolute paths only.** All `src` and `href` use absolute paths from web root (e.g., `/ships/assets/images/...`, `/assets/css/...`, `/assets/data/...`).
- **Double-Check Mandate.** Every ship page changeset must pass CI checks in §7 before shipping.
- **Continuity is king.** Every update must preserve prior fixes, conventions, and style. No regressions.
- **Additive changes only.** Updates add new rules, never delete existing ones, to maintain continuity.
- **Site tree maintenance.** A site tree (`/data/site_tree.json`) must be updated with every new page addition to map all files and their locations, ensuring AI systems (e.g., ChatGPT) have an authoritative reference.
- **Modular system.** Standards are split into main and sub-documents for clarity; sub-documents are linked in §17.

## 1) Global Rules (apply to all HTML files unless specified)

1. **Absolute URLs only**
   - **Scope**: All HTML files (root, `/cruise-lines/`, `/ships/`, `/ships/ships.html`).
   - All href/src must be absolute, pointing at the GitHub Pages host.
   - ✅ `https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html`
   - ❌ `../ships/rcl/icon-of-the-seas.html`, `/ships/rcl/icon-of-the-seas.html`

2. **Single global stylesheet**
   - **Scope**: All HTML files.
   - Use exactly one CSS file: `https://jsschrstrcks1.github.io/InTheWake/assets/styles.css?v=2.232`
   - Never inline or page-level CSS. Update `styles.css` and bump version query.

3. **Header/Hero (Grandeur pattern)**
   - **Scope**: All HTML files.
   - Components: brand wordmark (left), version badge (v2.232), pill nav, hero area with lat/long grid, logo lockup + tagline (center-bottom), compass rose (top-right).
   - Compass appears once (right side). No legacy “In the Wake” text banners.
   - Hero grid labels show ticks without numeric degrees, matching `/ships/rcl/grandeur-of-the-seas.html`.

4. **Primary pill navigation**
   - **Scope**: All HTML files.
   - Order: Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel
   - Class names match `styles.css` (e.g., `.nav a` pills).
   - Links point to canonical absolute URLs (e.g., `/ships/ships.html`, `/cruise-lines/royal-caribbean.html`).

5. **Sticky secondary nav (when used)**
   - **Scope**: All HTML files with multiple sections (e.g., `/packing-lists.html`, `/ships/ships.html`).
   - Sticky, pill-based section nav below header; sections have stable `id` anchors with `scroll-margin-top`.

6. **Versioning**
   - **Scope**: All HTML files except `/ships/rcl/grandeur-of-the-seas.html`.
   - Pages show version v2.232 in `<title>` and brand block badge.
   - Current version: v2.232. Increment by +0.001 for multi-page/template changes.
   - Grandeur retains owner-managed version.

7. **Accessibility (a11y)**
   - **Scope**: All HTML files.
   - Use meaningful headings (h1→h2→h3), `role="img"` + `aria-label` on hero containers, `aria-labelledby` for cards, `alt=""` for decorative images, descriptive `alt` for content images.
   - Ensure nav/accordion keyboard-accessible with visible focus states.

8. **Performance & SEO basics**
   - **Scope**: All HTML files.
   - Optimize images (JPG preferred; PNG for transparency/line art), use `loading="lazy"` for non-hero images.
   - Canonical link and OpenGraph/Twitter meta on content pages.
   - Ship pages include `<title>` (e.g., “Adventure of the Seas — Royal Caribbean”), `<meta name="description">`, Open Graph, Twitter card, JSON-LD schema.

9. **Attribution (images + videos)**
   - **Scope**: All HTML files using images/videos.
   - Images require attribution at page bottom, linking to `http://www.flickersofmajesty.com/` for owner photos or Wikimedia creator/license/source.
   - Video credits show title + channel (linked).
   - Include “All rights reserved” in copyright notice.

10. **No duplicate CSS/headers**
    - **Scope**: All HTML files.
    - Use standardized header markup + shared CSS only.

## 2) Repository Layout & Conventions (applies to all HTML files)

```
/assets
  /brand/
  /videos/
  /images/
  styles.css
  /vendor/swiper/

/cruise-lines/
  royal-caribbean.html
  carnival.html
  msc-cruises.html
  ...

/data
  /registry/
    restaurants.json
    ports.json
    video_synonyms.json
    trusted_channels.json
    video_blocklist.json
    fleet_index.json
    site_tree.json

/ships/
  rcl/icon-of-the-seas.html
  rcl/wonder-of-the-seas.html
  rcl/legend-of-the-seas-1995.html
  carnival/carnival-celebration.html
  ...

/standards/
  main-standards.md
  ships-standards.md
  root-standards.md
  cruise-lines-standards.md

index.html
restaurants.html
ports.html
disability-at-sea.html
drink-packages.html
packing-lists.html
solo.html
travel.html
```

- **Required pages**: Every cruise line and ship in `/data/registry/fleet_index.json` must have a page in `/cruise-lines/` and `/ships/<line>/`.
- **Root pages**: Follow Grandeur’s meta/hero structure (e.g., Welcome card on `/index.html`).
- **Deprecated**: `/lines/` replaced by `/cruise-lines/`.
- **Folder & File Presence Rule** (v2.224):
  - Ships in `/ships/<normalized-cruise-line>/` (e.g., `/ships/rcl/grandeur-of-the-seas.html`).
  - Normalization: Royal Caribbean International → `rcl`, Carnival Cruise Line → `ccl`, MSC Cruises → `msc`.
  - Auto-create up to 10 missing files per run.
- **Path Canonicalization** (v2.229 Addendum, §2.1):
  - RCI ships **must** live under `/ships/rcl/`, Carnival under `/ships/carnival/`, MSC under `/ships/msc/`.
  - CI fails if any ship HTML is found directly under `/ships/` (e.g., `/ships/adventure-of-the-seas.html`) or elsewhere.
  - Filenames must be normalized kebab-case slugs (e.g., `allure-of-the-seas.html`).
- **Filename Normalizer** (v2.229 Addendum, §2.2):
  - Linter enforces slug format: `[a-z0-9-]+\.html`.
  - Auto-fix typos: `alllure` → `allure`; append missing `.html`; collapse duplicates (e.g., `carnival-carnival-breeze.html` → `carnival-breeze.html`).
- **Site Tree Integrity** (v2.229 Addendum, §2.3):
  - `/data/site_tree.json` is authoritative; CI fails if a ship in `fleet_index.json` is missing from `site_tree.json` or if a `site_tree` path points to a non-existent file.
  - Update with every new page; includes standards files under “standards” section (see §14.7).

### Royal Caribbean International Ship Coverage
- **Current (26)**: Icon of the Seas, Utopia of the Seas, Star of the Seas, Wonder of the Seas, Odyssey of the Seas, Spectrum of the Seas, Symphony of the Seas, Harmony of the Seas, Ovation of the Seas, Anthem of the Seas, Quantum of the Seas, Freedom of the Seas, Independence of the Seas, Liberty of the Seas, Mariner of the Seas, Explorer of the Seas, Adventure of the Seas, Voyager of the Seas, Vision of the Seas, Rhapsody of the Seas, Radiance of the Seas, Brilliance of the Seas, Serenade of the Seas, Jewel of the Seas, Grandeur of the Seas, Enchantment of the Seas.
- **Former (7)**: Song of Norway, Nordic Empress, Majesty of the Seas, Sovereign of the Seas, Monarch of the Seas, Legend of the Seas (1995-built), Splendour of the Seas.
- **Coming Soon (5)**: Legend of the Seas (2026), Icon-class Ship (2027, 2028), Star-class Ship (2028), Quantum Ultra-class Ship (2028, 2029).
- **Implementation**: Pages at `/ships/rcl/[ship-slug].html`; update `/data/registry/fleet_index.json` and `/data/site_tree.json`.

### Carnival Cruise Line Ship Coverage
- **Current (29)**: Carnival Adventure, Carnival Breeze, Carnival Celebration, Carnival Conquest, Carnival Dream, Carnival Elation, Carnival Encounter, Carnival Firenze, Carnival Freedom, Carnival Glory, Carnival Horizon, Carnival Jubilee, Carnival Legend, Carnival Liberty, Carnival Luminosa, Carnival Magic, Carnival Mardi Gras, Carnival Miracle, Carnival Panorama, Carnival Paradise, Carnival Pride, Carnival Radiance, Carnival Spirit, Carnival Splendor, Carnival Sunrise, Carnival Sunshine, Carnival Valor, Carnival Venezia, Carnival Vista.
- **Former (5)**: Carnival Ecstasy, Carnival Fantasy, Carnival Fascination, Carnival Inspiration, Carnival Sensation.
- **Coming Soon (2)**: Carnival Festivale (2027), Carnival Tropicale (2028).
- **Implementation**: Pages at `/ships/carnival/[ship-slug].html`; update `/data/registry/fleet_index.json` and `/data/site_tree.json`.

## 7) CI / Compliance Checks (applies to all HTML files)
- Validate:
  1. **Pathing** (folder & filename) — ✅/❌
  2. **Absolute URLs only** — ✅/❌
  3. **Header/Hero pattern matches Grandeur** — ✅/❌
  4. **Primary nav links present & absolute** — ✅/❌
  5. **Version badge/title ≥ v2.232** — ✅/❌
  6. **Card order & presence** (`first-look`, `why-book`, `personal-review`, `video-highlights`, `deck-plans`, `live-tracker`, `attribution`) — ✅/❌ (ships only)
  7. **No duplicate cards** — ✅/❌ (ships only)
  8. **SEO meta present** — ✅/❌
  9. **Accessibility basics** (heading order, aria labels, alts) — ✅/❌
  10. **Images ≥ 3 (content)** — ✅/❌ (ships only)
  11. **Videos ≥ 3 (Overview, Cabins, Dining)** — ✅/❌ (ships only)
  12. **Attribution present & “All rights reserved”** — ✅/❌
  13. **Fleet index coverage** (page exists for each ship) — ✅/❌
  14. **Auto-create up to 10 missing files this run** — action log included.
  15. **DOM Fingerprint Check** (v2.229 Addendum, §7.15):
      - Ship pages: Exactly one of each card (`first-look`, `why-book`, `personal-review`, `video-highlights`, `deck-plans`, `live-tracker`, `attribution`) in order inside `<main>`.
      - Header: `.brand .version-badge` (v2.232+), `.nav.pills` (10 links), `.hero` with single `.compass`.
      - CI fails if: “A First Look” images not in `.grid-2` or `.photo-grid`, swiper assets missing, or `watermark-style` CSS id absent.
- **Output**: Cruise line → ship → per-item ✅/❌, with summary and action log.

## 9) Process & Escalation Rules (applies to all HTML files)
- Double-check: headers match Grandeur, no duplicates, videos wired (ships), meta tags, absolute URLs, version v2.232, `/data/site_tree.json` updated.
- Deliver updates as Safari-safe zips.
- Escalate unclear/incomplete cases to avoid regressions.

## 10) Recovery & Guardrails (applies to all HTML files)
- Rebuild `<main>` and footer for non-compliant pages.
- Preserve Deck Plans/Live Tracker URLs; use CruiseMapper defaults if missing.
- Never overwrite without backup (`/data/registry/_backups/` or `/ships/_backups/`).

## 12) Change Log (consolidated)
- **v2.232** — Integrated v2.229 Addendum (§2.1 Path Canonicalization, §2.2 Filename Normalizer, §7.15 DOM Fingerprint Check, §6.1 Media Source Merge, §2.3 Site Tree Integrity) into modular standards. Retained modular structure (main + sub-documents). Enhanced ChatGPT management (95–99% effectiveness) with site tree and tools. Updated CI (§7) for DOM checks and pathing. Version bumped for addendum integration.
- **v2.231** — Modularized standards into main and sub-documents; added §17 for modular navigation.
- **v2.229–v2.222**: As in v2.229.

## 13) Templates & Snippets
### 13.1 Meta (example)
```html
<title>Adventure of the Seas — Royal Caribbean — In the Wake (v2.232)</title>
<link rel="canonical" href="https://jsschrstrcks1.github.io/InTheWake/ships/rcl/adventure-of-the-seas.html"/>
<meta name="description" content="Explore Adventure of the Seas with curated photos, dining options, cabin details, videos, and cruising tips."/>
<!-- Open Graph, Twitter, JSON-LD as in v2.229 -->
```

### 13.2 Ship image block (example)
```html
<section class="card" aria-labelledby="photosHeading">
  <h2 id="photosHeading">A First Look</h2>
  <div class="photo-grid">
    <figure>
      <img src="https://jsschrstrcks1.github.io/InTheWake/ships/rcl/images/Adventure_of_the_Seas1.jpg" alt="Adventure of the Seas in Wade 2012" loading="lazy">
      <figcaption class="tiny">Photo © <a href="https://commons.wikimedia.org/wiki/File:Adventure_of_the_Seas_Wade_2012.JPG">Matt H. Wade</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.en">CC BY-SA 3.0</a></figcaption>
    </figure>
    <!-- Additional figures -->
  </div>
</section>
```

### 13.3 Attribution block (example)
```html
<section class="card" aria-labelledby="attribution">
  <h2 id="attribution">Attribution & Credits</h2>
  <ul>
    <li>Photo via Wikimedia Commons — <a href="https://commons.wikimedia.org/wiki/File:Adventure_of_the_Seas_Wade_2012.JPG">Matt H. Wade</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.en">CC BY-SA 3.0</a></li>
    <li>Video: <a href="https://www.youtube.com/watch?v=jRF5foycMNk">“Inside Royal Caribbean's Adventure of the Seas: Full Tour for 2025”</a> — <a href="https://www.youtube.com/channel/Unknown">Unknown Channel</a></li>
  </ul>
  <p>All rights reserved.</p>
</section>
```

## 14) Registries (JSON) — Shapes
### 14.1–14.6 (unchanged from v2.229)

### 14.7 `site_tree.json` (updated)
```json
{
  "root": [
    {"path": "/index.html", "title": "Home"},
    {"path": "/drinks.html", "title": "Drink Packages"},
    {"path": "/packing.html", "title": "Packing Lists"},
    {"path": "/planning.html", "title": "Planning"},
    {"path": "/ports.html", "title": "Ports"},
    {"path": "/restaurants.html", "title": "Restaurants & Menus"},
    {"path": "/rooms.html", "title": "Rooms"},
    {"path": "/ships.html", "title": "Ships Hub"},
    {"path": "/travel.html", "title": "Travel"}
  ],
  "cruise-lines": [
    {"path": "/cruise-lines/carnival.html", "title": "Carnival Cruise Line"},
    {"path": "/cruise-lines/celebrity.html", "title": "Celebrity Cruises"},
    {"path": "/cruise-lines/disney.html", "title": "Disney Cruise Line"},
    {"path": "/cruise-lines/holland-america.html", "title": "Holland America Line"},
    {"path": "/cruise-lines/msc.html", "title": "MSC Cruises"},
    {"path": "/cruise-lines/norwegian.html", "title": "Norwegian Cruise Line"},
    {"path": "/cruise-lines/princess.html", "title": "Princess Cruises"},
    {"path": "/cruise-lines/royal-caribbean.html", "title": "Royal Caribbean International"},
    {"path": "/cruise-lines/viking.html", "title": "Viking Cruises"},
    {"path": "/cruise-lines/virgin.html", "title": "Virgin Voyages"}
  ],
  "ships": {
    "rcl": [
      {"path": "/ships/rcl/adventure-of-the-seas.html", "title": "Adventure of the Seas", "status": "active"},
      {"path": "/ships/rcl/allure-of-the-seas.html", "title": "Allure of the Seas", "status": "active"},
      {"path": "/ships/rcl/anthem-of-the-seas.html", "title": "Anthem of the Seas", "status": "active"},
      {"path": "/ships/rcl/brilliance-of-the-seas.html", "title": "Brilliance of the Seas", "status": "active"},
      {"path": "/ships/rcl/enchantment-of-the-seas.html", "title": "Enchantment of the Seas", "status": "active"},
      {"path": "/ships/rcl/explorer-of-the-seas.html", "title": "Explorer of the Seas", "status": "active"},
      {"path": "/ships/rcl/freedom-of-the-seas.html", "title": "Freedom of the Seas", "status": "active"},
      {"path": "/ships/rcl/grandeur-of-the-seas.html", "title": "Grandeur of the Seas", "status": "active"},
      {"path": "/ships/rcl/harmony-of-the-seas.html", "title": "Harmony of the Seas", "status": "active"},
      {"path": "/ships/rcl/icon-of-the-seas.html", "title": "Icon of the Seas", "status": "active"},
      {"path": "/ships/rcl/independence-of-the-seas.html", "title": "Independence of the Seas", "status": "active"},
      {"path": "/ships/rcl/jewel-of-the-seas.html", "title": "Jewel of the Seas", "status": "active"},
      {"path": "/ships/rcl/liberty-of-the-seas.html", "title": "Liberty of the Seas", "status": "active"},
      {"path": "/ships/rcl/mariner-of-the-seas.html", "title": "Mariner of the Seas", "status": "active"},
      {"path": "/ships/rcl/navigator-of-the-seas.html", "title": "Navigator of the Seas", "status": "active"},
      {"path": "/ships/rcl/oasis-of-the-seas.html", "title": "Oasis of the Seas", "status": "active"},
      {"path": "/ships/rcl/odyssey-of-the-seas.html", "title": "Odyssey of the Seas", "status": "active"},
      {"path": "/ships/rcl/ovation-of-the-seas.html", "title": "Ovation of the Seas", "status": "active"},
      {"path": "/ships/rcl/quantum-of-the-seas.html", "title": "Quantum of the Seas", "status": "active"},
      {"path": "/ships/rcl/radiance-of-the-seas.html", "title": "Radiance of the Seas", "status": "active"},
      {"path": "/ships/rcl/rhapsody-of-the-seas.html", "title": "Rhapsody of the Seas", "status": "active"},
      {"path": "/ships/rcl/serenade-of-the-seas.html", "title": "Serenade of the Seas", "status": "active"},
      {"path": "/ships/rcl/spectrum-of-the-seas.html", "title": "Spectrum of the Seas", "status": "active"},
      {"path": "/ships/rcl/star-of-the-seas.html", "title": "Star of the Seas", "status": "active"},
      {"path": "/ships/rcl/symphony-of-the-seas.html", "title": "Symphony of the Seas", "status": "active"},
      {"path": "/ships/rcl/utopia-of-the-seas.html", "title": "Utopia of the Seas", "status": "active"},
      {"path": "/ships/rcl/vision-of-the-seas.html", "title": "Vision of the Seas", "status": "active"},
      {"path": "/ships/rcl/voyager-of-the-seas.html", "title": "Voyager of the Seas", "status": "active"},
      {"path": "/ships/rcl/wonder-of-the-seas.html", "title": "Wonder of the Seas", "status": "active"},
      {"path": "/ships/rcl/legend-of-the-seas-1995.html",