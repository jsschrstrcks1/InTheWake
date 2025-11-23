# In The Wake Standards (Main Document v2.233)

This document is the single source of truth for building, editing, and maintaining the **In the Wake** website, incorporating Royal Caribbean International (RCI) and Carnival Cruise Line ship lists (current, former, and coming soon) as of September 15, 2025. It merges the "In The Wake – AI Project Ruleset (v1.0)" with prior versions (v2.201–v2.232) and the v2.229 Addendum. Version v2.233 retains the modular structure (main + sub-documents for ships, root, cruise-lines), integrates addendum updates (§2.1 Path Canonicalization, §2.2 Filename Normalizer, §7.15 DOM Fingerprint Check, §6.1 Media Source Merge, §2.3 Site Tree Integrity), adds §18 Context Management Guardrails to address context resets, and ensures ChatGPT management at 95–99% effectiveness. Sub-documents are linked in §17; all rules are additive, preserving continuity.

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
- **Context management.** To address resets, all responses must recap prior state in §18 and propose a plan to stabilize the workflow.

## 1) Global Rules (apply to all HTML files unless specified)

1. **Absolute URLs only**
   - **Scope**: All HTML files (root, `/cruise-lines/`, `/ships/`, `/ships/ships.html`).
   - All href/src must be absolute, pointing at the GitHub Pages host.
   - ✅ `https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html`
   - ❌ `../ships/rcl/icon-of-the-seas.html`, `/ships/rcl/icon-of-the-seas.html`

2. **Single global stylesheet**
   - **Scope**: All HTML files.
   - Use exactly one CSS file: `https://jsschrstrcks1.github.io/InTheWake/assets/styles.css?v=2.233`
   - Never inline or page-level CSS. Update `styles.css` and bump version query.

3. **Header/Hero (Grandeur pattern)**
   - **Scope**: All HTML files.
   - Components: brand wordmark (left), version badge (v2.233), pill nav, hero area with lat/long grid, logo lockup + tagline (center-bottom), compass rose (top-right).
   - Compass appears once (right side). No duplicates.
   - No legacy “In the Wake” text banners.
   - Hero grid labels show ticks without numeric degrees, matching `/ships/rcl/grandeur-of-the-seas.html`.

4. **Primary pill navigation**
   - **Scope**: All HTML files.
   - Order: Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel
   - Class names and structure must match `styles.css` (e.g., `.nav a` pills).
   - Nav links point to canonical absolute URLs (e.g., `/ships/ships.html`, `/cruise-lines/royal-caribbean.html`).

5. **Sticky secondary nav (when used)**
   - **Scope**: All HTML files with many sections (e.g., `/packing-lists.html`, `/ships/ships.html`).
   - Includes a sticky, pill-based section nav placed directly below the header.
   - Each section must have a stable `id` anchor. Use `scroll-margin-top` in CSS to avoid overlap.

6. **Versioning**
   - **Scope**: All HTML files except `/ships/rcl/grandeur-of-the-seas.html`.
   - Every updated page shows version v2.233 in `<title>` and a badge in the brand block.
   - Current version: v2.233. Increment in steps of +0.001 for any shipped change affecting multiple pages or templates.
   - `/ships/rcl/grandeur-of-the-seas.html` retains its current version unless deliberately updated by the owner.
   - When a file is updated, increment the version site-wide as directed by the owner.

7. **Accessibility (a11y)**
   - **Scope**: All HTML files.
   - Use meaningful headings in order (h1→h2→h3).
   - Add `role="img"` + `aria-label` on hero containers.
   - Use `aria-labelledby` to connect cards with their headings.
   - Add `alt=""` for decorative images (e.g., compass) and descriptive `alt` for content images.
   - Ensure nav and accordion elements are keyboard-accessible and visible focus states exist.

8. **Performance & SEO basics**
   - **Scope**: All HTML files.
   - Optimize images (JPG preferred; PNG only for transparency/line art).
   - Use `loading="lazy"` for non-hero images.
   - Canonical link and OpenGraph/Twitter meta set on content pages.
   - Prefer 16:9 hero and OG images for rich sharing.
   - Every ship page includes:
     - `<title>` with ship name + brand (e.g., “Icon of the Seas — Royal Caribbean”).
     - `<meta name="description">` with 1–2 polished sentences.
     - Open Graph (og:title, og:description, og:image, og:url).
     - Twitter card equivalent (twitter:card, twitter:title, twitter:description, twitter:image).
     - JSON-LD schema for Cruise Ship pages.
   - Root, restaurants, ports, etc., follow similar meta hygiene for SEO continuity.
   - Grandeur’s meta tags provided as snippets for user insertion only.

9. **Attribution (images + videos) — required**
   - **Scope**: All HTML files using images/videos.
   - All images must include attribution at the bottom of the page.
   - Your own photos must link to your photography site (e.g., `http://www.flickersofmajesty.com/`) for traffic.
   - Third-party/Wikimedia photos must include creator, license, and source link.
   - Video credits show title + channel (linked).

10. **No duplicate CSS/headers**
    - **Scope**: All HTML files.
    - Do not paste header styling or HTML variants into body content. Use the standardized header markup + shared CSS only.

## 2) Repository Layout & Conventions (applies to all HTML files)

```
/assets
  /brand/                 # Logos/wordmarks
  /videos/                # Ship video manifests + master lists
  /images/                # Watermark and other assets
  styles.css              # Unified, single stylesheet
  /vendor/swiper/         # Swiper assets (swiper-bundle.min.css, swiper-bundle.min.js)

/cruise-lines/            # One page per cruise line (absolute linked)
  royal-caribbean.html
  msc-cruises.html
  ...

/data
  /registry/              # Crosslink/anchor registries
    restaurants.json      # Restaurant anchors (per line/ship)
    ports.json            # Port anchors
    video_synonyms.json   # Fuzzy-match terms by category
    trusted_channels.json # Whitelist for preferred creators/channels
    video_blocklist.json  # Known-bad IDs/channels
    fleet_index.json      # Authoritative roster of cruise lines and ships

/ships/                   # One page per ship
  rcl/icon-of-the-seas.html
  rcl/wonder-of-the-seas.html
  rcl/legend-of-the-seas-1995.html  # Historical ship
  ...

index.html                # Home
restaurants.html          # Restaurants & Menus hub
ports.html                # Ports hub
disability-at-sea.html    # Disability at Sea
drink-packages.html       # Drink Packages
packing-lists.html        # Packing Lists
solo.html                 # Solo
travel.html               # Travel
```

- **Required pages**: For every cruise line and ship in `/data/registry/fleet_index.json`, create corresponding pages in `/cruise-lines/` and `/ships/`. For Royal Caribbean International (RCI), this includes all 26 current ships, 7 former ships (labeled “Historical Ship”), and 5 coming soon ships (placeholders until operational). If content is missing, use “Coming soon” placeholders.
- **Root pages**: Homepage, packing, drinks, ports, restaurants, solo, travel, disability, cruise-lines follow similar meta hygiene and Grandeur’s structural model (e.g., Welcome card on root).
- **Deprecated**: `/lines/` folder is replaced by `/cruise-lines/`.
- **Folder & File Presence Rule** (v2.224):
  - Ships in `/ships/<normalized-cruise-line>/` (e.g., `/ships/rcl/grandeur-of-the-seas.html`).
  - Normalization: Royal Caribbean International → `rcl`, Carnival Cruise Line → `ccl`, MSC Cruises → `msc`.
  - Auto-create up to 10 missing files per run.
- **Path Canonicalization** (v2.229 Addendum, §2.1):
  - RCI ships **must** live under `/ships/rcl/`, Carnival under `/ships/carnival/`, MSC under `/ships/msc/`.
  - CI must fail if any RCI ship HTML is found directly under `/ships/` or any other folder (e.g., `/ships/adventure-of-the-seas.html`).
  - Filenames SHALL be normalized kebab-case slugs (e.g., `allure-of-the-seas.html`). Reject triple letters and missing extensions.
- **Filename Normalizer** (v2.229 Addendum, §2.2):
  - A linter enforces slug format: `[a-z0-9-]+\.html`. Known typos auto-fixed: `alllure`→`allure`; missing `.html` appended; stray duplicates (`carnival-carnival-breeze.html`) collapsed to `carnival-breeze.html`.
- **Site Tree Integrity** (v2.229 Addendum, §2.3):
  - The generated `/data/site_tree.json` in this package replaces any ad hoc lists. CI fails if (a) a ship exists in `fleet_index.json` but not in `site_tree.json`, or (b) a `site_tree` path points to a non-existent file on disk.

### Royal Caribbean International Ship Coverage
- **Current (26)**: Icon of the Seas, Utopia of the Seas, Star of the Seas, Wonder of the Seas, Odyssey of the Seas, Spectrum of the Seas, Symphony of the Seas, Harmony of the Seas, Ovation of the Seas, Anthem of the Seas, Quantum of the Seas, Freedom of the Seas, Independence of the Seas, Liberty of the Seas, Mariner of the Seas, Explorer of the Seas, Adventure of the Seas, Voyager of the Seas, Vision of the Seas, Rhapsody of the Seas, Radiance of the Seas, Brilliance of the Seas, Serenade of the Seas, Jewel of the Seas, Grandeur of the Seas, Enchantment of the Seas.
- **Former (7)**: Song of Norway, Nordic Empress, Majesty of the Seas, Sovereign of the Seas, Monarch of the Seas, Legend of the Seas (1995-built), Splendour of the Seas.
- **Coming Soon (5)**: Legend of the Seas (2026), Icon-class Ship (2027), Icon-class Ship (2028), Star-class Ship (2028), Quantum Ultra-class Ship (2028), Quantum Ultra-class Ship (2029).
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
  5. **Version badge/title ≥ v2.233** — ✅/❌
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
      - Header: `.brand .version-badge` (v2.233+), `.nav.pills` (10 links), `.hero` with single `.compass`.
      - CI fails if: “A First Look” images not in `.photo-grid`, swiper assets missing, or `watermark-style` CSS id absent.
- **Output**: Cruise line → ship → per-item ✅/❌, with summary and action log.

## 9) Process & Escalation Rules (applies to all HTML files)
- **Double-check work before shipping**: Confirm headers match Grandeur, no duplicate elements (e.g., doubled headers), videos wired in, meta tags present, absolute URLs, and correct version bump (v2.233).
- **Deliver updates as drop-in zips**: Ensure Safari-safe compatibility.
- **Escalation**: If anything is unclear, incomplete, or at risk of regression, stop and ask. Never guess or apply shortcuts to prevent continuity breaks. The user has emphasized avoiding regressions, potentially onboarding Grok as a “master AI” if continuity fails.

## 10) Recovery & Guardrails (applies to all HTML files)
- When a page deviates from standards, **rebuild `<main>` and footer** deterministically to restore compliance.
- Preserve existing Deck Plans and Live Tracker URLs if present; otherwise insert defaults (e.g., CruiseMapper links for RCI ships).
- If anything is unclear, incomplete, or at risk of regression, stop and ask. Never guess or apply shortcuts to prevent continuity breaks.

## 12) Change Log (consolidated excerpts)
- **v2.233** — Added §18 Context Management Guardrails to address context resets. Bumped version to v2.233 to reflect workflow stabilization efforts.
- **v2.232** — Integrated v2.229 Addendum with no deletions, only additions. Added §2.1 Path Canonicalization, §2.2 Filename Normalizer, §7.15 DOM Fingerprint Check, §6.1 Media Source Merge, §2.3 Site Tree Integrity.
- **v2.231** — Modularized standards into main and sub-documents; added §17 for modular navigation.
- **v2.230** — Added §18 for context management guardrails to address resets.
- **v2.229** — Generated site_tree.json from provided text, addressed compliance report pathing issues.
- **v2.228** — Integrated regex as ChatGPT-compatible tool for video/image sourcing (§6) alongside Beautiful Soup.
- **v2.227** — Integrated Beautiful Soup as ChatGPT-compatible tool for video/image sourcing (§6).
- **v2.226** — Added site tree maintenance rule (`/data/site_tree.json`).
- **v2.225** — Added enhancements for video/image robustness, tool listings for YouTube checks.
- **v2.224** — Added enhanced Video Compliance, Auto-Create up to 10 missing ship files, Folder presence checks, Video sourcing escalation, Image sourcing additions, expanded CI checklist to 14 items.
- **v2.223** — Adopted §1.1’s Absolute URLs wording as gold standard, updated Grandeur path to /ships/rcl/grandeur-of-the-seas.html, consolidated Versioning rules into §1.6.
- **v2.222** — Integrated v1.0 ruleset, added additive-only rule, incorporated RCI ship list, ensured historical/coming soon labeling, added crosslinking/video categories.
- **v2.220** — Enforced absolute asset paths, watermark, grid layout, video policy (max 10), CI rebuild checks.
- **v2.217** — Expanded Dining fuzzy terms.
- **v2.214** — Enforced absolute paths, grid layout, video policy, CI checks.
- **v2.210** — Expanded Dining fuzzy terms.
- **v2.209** — Added "Full Walkthrough" etc. to Walkthrough; added **Cruises It** to Green List.
- **v2.208** — Enforced card order, single swiper, footer-last.
- **v2.204** — Added **Harr Travel** to Green List. Fuzzy search tuned for cabin class keywords.
- **v2.203** — Required Accessibility video; defined cabin buckets; limited categories to Walkthrough, Cabins, Dining, Accessibility.
- **v1.0** — Established core rules: absolute links, centralized CSS, Grandeur standard, version increments, pill-based nav, hero images, SEO meta, Wikipedia-style crosslinking, video categories (Walkthroughs, Top 10/Things to Do, Staterooms & Suites, Accessibility), historical ship labeling, file organization, packing page structure, double-check process, and escalation rules.

## 13) Templates & Snippets
### 13.1 Meta (example)
```html
<title>Adventure of the Seas — Royal Caribbean — In the Wake (v2.233)</title>
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
### 14.1 `restaurants.json` (anchors)
```json
{
  "royal-caribbean": {
    "icon-of-the-seas": {
      "chops-grille": "rc-chops-grille",
      "izumi": "rc-izumi"
    }
  },
  "msc-cruises": {
    "msc-world-america": {
      "butchers-cut": "msc-butchers-cut"
    }
  }
}
```

### 14.2 `ports.json` (anchors)
```json
{
  "caribbean": {
    "cozumel": "port-cozumel",
    "nassau": "port-nassau"
  },
  "mediterranean": {
    "barcelona": "port-barcelona"
  }
}
```

### 14.3 `video_synonyms.json`
```json
{
  "walkthrough": ["walkthrough","ship tour","full tour","complete ship tour","top to bottom","Full Walkthrough","Ship Tour","Ship Tour & Review","Tour & Review","Complete Walkthrough","Complete Tour","Ship Review","Onboard Tour"],
  "top-10-things-to-do": ["top 10","things to do","activities","entertainment"],
  "cabins": ["cabin","stateroom","suite","balcony","inside","oceanview","promenade interior","virtual balcony"],
  "dining": ["dining","restaurants","menus","food","buffet","specialty","Main Dining Room","MDR","Nights of Dinners","5 Nights of Dinners","Dinner Menu","Lunch Menu","Breakfast Menu","Specialty Dining Review","Windjammer","Chops","Giovanni","Izumi","Johnny Rockets","Cuisine","Chef"],
  "entertainment": ["shows","ice show","aqua theater","music","activities","nightlife"],
  "kids": ["kids","family","teen","adventure ocean","nursery"],
  "tips": ["tips","hacks","advice","planning","mistakes","first-timer"],
  "accessibility": ["accessible","wheelchair","ADA","mobility","scooter","disability"]
}
```

### 14.4 `trusted_channels.json`
```json
["Royal Caribbean Blog","Gary Bembridge","Emma Cruises","Ben & David","Cruises It","Harr Travel","Wheelchair Travel","World on Wheels"]
```

### 14.5 `video_blocklist.json`
```json
["YOUTUBE_ID_TO_EXCLUDE","ANOTHER_BAD_ID"]
```

### 14.6 `fleet_index.json` (example with RCI integration)
```json
{
  "cruise_lines": [
    {
      "name": "Royal Caribbean International",
      "slug": "royal-caribbean",
      "ships": [
        {"name": "Icon of the Seas", "slug": "icon-of-the-seas", "status": "active"},
        {"name": "Utopia of the Seas", "slug": "utopia-of-the-seas", "status": "active"},
        {"name": "Star of the Seas", "slug": "star-of-the-seas", "status": "active"},
        {"name": "Wonder of the Seas", "slug": "wonder-of-the-seas", "status": "active"},
        {"name": "Odyssey of the Seas", "slug": "odyssey-of-the-seas", "status": "active"},
        {"name": "Spectrum of the Seas", "slug": "spectrum-of-the-seas", "status": "active"},
        {"name": "Symphony of the Seas", "slug": "symphony-of-the-seas", "status": "active"},
        {"name": "Harmony of the Seas", "slug": "harmony-of-the-seas", "status": "active"},
        {"name": "Ovation of the Seas", "slug": "ovation-of-the-seas", "status": "active"},
        {"name": "Anthem of the Seas", "slug": "anthem-of-the-seas", "status": "active"},
        {"name": "Quantum of the Seas", "slug": "quantum-of-the-seas", "status": "active"},
        {"name": "Freedom of the Seas", "slug": "freedom-of-the-seas", "status": "active"},
        {"name": "Independence of the Seas", "slug": "independence-of-the-seas", "status": "active"},
        {"name": "Liberty of the Seas", "slug": "liberty-of-the-seas", "status": "active"},
        {"name": "Mariner of the Seas", "slug": "mariner-of-the-seas", "status": "active"},
        {"name": "Explorer of the Seas", "slug": "explorer-of-the-seas", "status": "active"},
        {"name": "Adventure of the Seas", "slug": "adventure-of-the-seas", "status": "active"},
        {"name": "Voyager of the Seas", "slug": "voyager-of-the-seas", "status": "active"},
        {"name": "Vision of the Seas", "slug": "vision-of-the-seas", "status": "active"},
        {"name": "Rhapsody of the Seas", "slug": "rhapsody-of-the-seas", "status": "active"},
        {"name": "Radiance of the Seas", "slug": "radiance-of-the-seas", "status": "active"},
        {"name": "Brilliance of the Seas", "slug": "brilliance-of-the-seas", "status": "active"},
        {"name": "Serenade of the Seas", "slug": "serenade-of-the-seas", "status": "active"},
        {"name": "Jewel of the Seas", "slug": "jewel-of-the-seas", "status": "active"},
        {"name": "Grandeur of the Seas", "slug": "grandeur-of-the-seas", "status": "active"},
        {"name": "Enchantment of the Seas", "slug": "enchantment-of-the-seas", "status": "active"},
        {"name": "Song of Norway", "slug": "song-of-norway", "status": "historical"},
        {"name": "Nordic Empress", "slug": "nordic-empress", "status": "historical"},
        {"name": "Majesty of the Seas", "slug": "majesty-of-the-seas", "status": "historical"},
        {"name": "Sovereign of the Seas", "slug": "sovereign-of-the-seas", "status": "historical"},
        {"name": "Monarch of the Seas", "slug": "monarch-of-the-seas", "status": "historical"},
        {"name": "Legend of the Seas 1995", "slug": "legend-of-the-seas-1995", "status": "historical"},
        {"name": "Splendour of the Seas", "slug": "splendour-of-the-seas", "status": "historical"},
        {"name": "Legend of the Seas", "slug": "legend-of-the-seas", "status": "coming-soon", "delivery": "2026"},
        {"name": "Icon-class Ship TBN 2027", "slug": "icon-class-ship-2027", "status": "coming-soon", "delivery": "2027"},
        {"name": "Icon-class Ship TBN 2028", "slug": "icon-class-ship-2028", "status": "coming-soon", "delivery": "2028"},
        {"name": "Star-class Ship TBN 2028", "slug": "star-class-ship-2028", "status": "coming-soon", "delivery": "2028"},
        {"name": "Quantum Ultra-class Ship TBN 2028", "slug": "quantum-ultra-class-ship-2028", "status": "coming-soon", "delivery": "2028"},
        {"name": "Quantum Ultra-class Ship TBN 2029", "slug": "quantum-ultra-class-ship-2029", "status": "coming-soon", "delivery": "2029"}
      ]
    },
    {
      "name": "MSC Cruises",
      "slug": "msc-cruises",
      "ships": [
        {"name": "MSC World America", "slug": "msc-world-america", "status": "active"}
        // Other MSC ships...
      ]
    }
    // Other cruise lines...
  ]
}
```

## 15) Orphan & Crosslink Diagnostics (applies to all HTML files)
- Generate `/data/reports/crosslinks_report.txt` with:
  - Files not linked from any hub/index.
  - Mentions of known entities that aren’t crosslinked.
  - 404 checks for absolute URLs.
- Fix or intentionally keep diagnostics (e.g., data files) and re-run.
- **RCI-specific**: Ensure all 38 RCI ships (current, former, coming soon) are linked in `/ships/` and cross-referenced in `/cruise-lines/royal-caribbean.html`.

## 16) Future-Proofing (applies to all HTML files)
- Add cruise-line pages for each file in `/cruise-lines/`; pre-populate “Coming soon” cards on the Ships hub.
- Extend registries as new ships/restaurants/ports appear, including RCI’s coming soon ships (e.g., Legend of the Seas 2026, Icon-class TBN 2027).
- Add per-ship video manifests to `/assets/videos/` as pages mature, ensuring RCI ships have at least one Accessibility video.
- Maintain consistent versioning across the site; `/ships/rcl/grandeur-of-the-seas.html` remains owner-managed.
- **RCI-specific**: Create placeholder pages for coming soon ships (`/ships/rcl/legend-of-the-seas.html`, etc.) with “Coming soon” cards until operational.

## 17) Modular Sub-Documents
- **Ships Standards** : [Ships Standards](/standards/ships-standards.md) — Rules for `/ships/<line>/`.
- **Root Standards** : [Root Standards](/standards/root-standards.md) — Rules for root pages.
- **Cruise Lines Standards** : [Cruise Lines Standards](/standards/cruise-lines-standards.md) — Rules for `/cruise-lines/`.

## 18) Context Management Guardrails (v2.233 Addition)
- **Recap Prior State**: Each response must begin with a recap of the current task and prior progress (e.g., "Continuing from your request for the main document at 10:03 AM EDT on September 15, 2025, following successful delivery of sub-documents...").
- **Chunked Delivery**: Deliver standards and artifacts in manageable chunks (e.g., sub-documents, then main document) to avoid truncation. Confirm receipt of each chunk before proceeding.
- **Version Control Checkpoint**: Assign a unique artifact version ID to each delivered document (e.g., `e9a2d4b5-7c8f-4e2a-9d3e-5b1a6c2d3e4f`). Request user acknowledgment of the version.
- **Persistent Storage Suggestion**: Recommend saving delivered standards as local files (e.g., `main-standards.md`) and referencing them in future interactions. Offer a zipped package upon request.
- **Escalation Protocol**: If a reset occurs, summarize prior progress and request user input to resume (e.g., "Context reset detected; last delivered: main document v2.233. Please specify next step"). Propose onboarding a “master AI” (e.g., Grok) if resets persist.