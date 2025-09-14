In The Wake Standards (Full Expanded v2.223)
This document defines all rules for building, editing, and maintaining the In the Wake website, incorporating the Royal Caribbean International (RCI) ship list (current, former, and coming soon) as of September 13, 2025, and merging the "In The Wake – AI Project Ruleset (v1.0)" with prior versions (v2.201–v2.222). It is the single source of truth for structure, styling, content, linking, and QA, consolidating rules with no deletions, only additions, to ensure continuity. The RCI ship list is integrated to ensure comprehensive coverage in /ships/ and /assets/data/fleet_index.json. Version v2.223 updates the Absolute URLs rule to adopt §1.1’s wording as the gold standard, updates Grandeur’s path to /ships/rcl/grandeur-of-the-seas.html, and consolidates Versioning rules into §1.6.

Golden Reference: /ships/rcl/grandeur-of-the-seas.html is the visual/structural gold standard. Do not edit that file. Everything else must match its structure and conventions. The site owner updates it manually.


0) Principles

Single source of truth. The Standards define what the site must look like and how it must be wired. Code must conform to this doc — not the other way around.
Deterministic output. Rebuilders must rebuild the entire <main> block and footer to guarantee correct order and content.
Absolute paths only. All href/src must be absolute, pointing at the GitHub Pages host (e.g., https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html).
Double-Check Mandate. Every ship page changeset must pass the CI checks in §7 before shipping.
Continuity is king. Every update must preserve prior fixes, conventions, and style. No regressions.
Additive changes only. Updates to the standards must only add new rules, never delete existing ones, to maintain continuity and prevent regressions.


1) Global Rules (apply to every page)

Absolute URLs only

All href/src must be absolute, pointing at the GitHub Pages host.
✅ https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html
❌ ../ships/rcl/icon-of-the-seas.html, /ships/rcl/icon-of-the-seas.html


Single global stylesheet

Use exactly one CSS file for all layout/design:https://jsschrstrcks1.github.io/InTheWake/assets/styles.css?v=2.223
Never inline or page-level CSS into HTML documents. All styling flows from styles.css.
When updating site styling, only change styles.css and bump the version query.


Header/Hero (Grandeur pattern)

Components present in header: brand wordmark (left), version badge (v2.223), pill nav, hero area with lat/long grid, logo lockup + tagline (center-bottom), compass rose (top-right).
The compass appears once (right side). No duplicates.
No legacy “In the Wake” text banners.
The hero grid labels show ticks without numeric degrees, matching /ships/rcl/grandeur-of-the-seas.html.


Primary pill navigation

Present on all pages with absolute links in this order:
Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel


Class names and structure must match styles.css (e.g., .nav a pills).
Nav links point to canonical absolute URLs (e.g., /ships/ships.html, /cruise-lines/royal-caribbean.html).


Sticky secondary nav (when used)

Pages with many sections (e.g., Packing, Ships hub) include a sticky, pill-based section nav placed directly below the header.
Each section must have a stable id anchor. Use scroll-margin-top in CSS to avoid overlap.


Versioning

Every updated page (except /ships/rcl/grandeur-of-the-seas.html) shows version v2.223 in <title> and a badge in the brand block.
Current version: v2.223. Increment in steps of +0.001 for any shipped change affecting multiple pages or templates.
/ships/rcl/grandeur-of-the-seas.html retains its current version unless deliberately updated.
When a file is updated, increment the version site-wide as directed by the owner.


Accessibility (a11y)

Use meaningful headings in order (h1→h2→h3).
Add role="img" + aria-label on hero containers.
Use aria-labelledby to connect cards with their headings.
Add alt="" for decorative images (e.g., compass) and descriptive alt for content images.
Ensure nav and accordion elements are keyboard-accessible and visible focus states exist.


Performance & SEO basics

Optimize images (JPG preferred; PNG only for transparency/line art).
loading="lazy" for non-hero images.
Canonical link and OpenGraph/Twitter meta set on content pages.
Prefer 16:9 hero and OG images for rich sharing.
Every ship page includes:
<title> with ship name + brand (e.g., “Icon of the Seas — Royal Caribbean”).
<meta name="description"> with 1–2 polished sentences.
Open Graph (og:title, og:description, og:image, og:url).
Twitter card equivalent (twitter:card, twitter:title, twitter:description, twitter:image).
JSON-LD schema for Cruise Ship pages.


Root, restaurants, ports, etc., follow similar meta hygiene for SEO continuity.
Grandeur’s meta tags provided as snippets for user insertion only.


Attribution (images + videos) — required

All images must include attribution at the bottom of the page.
Your own photos must link to your photography site (e.g., http://www.flickersofmajesty.com/) for traffic.
Third-party/Wikimedia photos must include creator, license, and source link.
Video credits show title + channel (linked).


No duplicate CSS/headers

Do not paste header styling or HTML variants into body content. Use the standardized header markup + shared CSS only.




2) Repository Layout & Conventions
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


Required pages: For every cruise line and ship in /data/registry/fleet_index.json, create corresponding pages in /cruise-lines/ and /ships/. For Royal Caribbean International (RCI), this includes all 26 current ships, 7 former ships (labeled “Historical Ship”), and 5 coming soon ships (placeholders until operational). If content is missing, use “Coming soon” placeholders.
Root pages: Homepage, packing, drinks, ports, restaurants, solo, travel, disability, cruise-lines follow similar meta hygiene and Grandeur’s structural model (e.g., Welcome card on root).
Deprecated: /lines/ folder is replaced by /cruise-lines/.

Royal Caribbean International Ship Coverage

Current Ships (26): Icon of the Seas, Utopia of the Seas, Star of the Seas, Wonder of the Seas, Odyssey of the Seas, Spectrum of the Seas, Symphony of the Seas, Harmony of the Seas, Ovation of the Seas, Anthem of the Seas, Quantum of the Seas, Freedom of the Seas,
