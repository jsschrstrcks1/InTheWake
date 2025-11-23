---
title: "In The Wake Standards v2.228 copy.docx"
source_file: "In The Wake Standards v2.228 copy.docx"
generated: "2025-10-17T13:14:34.193911Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

In The Wake Standards (Full Expanded v2.228)
This document defines all rules for building, editing, and maintaining the In the Wake website, incorporating the Royal Caribbean International (RCI) and Carnival Cruise Line ship lists (current, former, and coming soon) as of September 14, 2025, and merging the "In The Wake – AI Project Ruleset (v1.0)" with prior versions (v2.201–v2.227). It is the single source of truth for structure, styling, content, linking, and QA, consolidating rules with no deletions, only additions, to ensure continuity. Version v2.228 integrates regex as a ChatGPT-compatible tool for video/image sourcing (§6) alongside Beautiful Soup, retains site tree maintenance (/data/site_tree.json), enhances video/image robustness with expanded fuzzy matching and tool specifications, and clarifies rule scope (ship-specific vs. all HTML files).
Golden Reference: /ships/rcl/grandeur-of-the-seas.html is the visual/structural gold standard. Do not edit that file.Everything else must match its structure and conventions. The site owner updates it manually.

0) Principles (applies to all HTML files)
Single source of truth. The Standards define what the site must look like and how it must be wired. Code must conform to this doc — not the other way around.
Deterministic output. Rebuilders must rebuild the entire <main> block and footer to guarantee correct order and content.
Absolute paths only. All src and href use absolute paths from web root (e.g., /ships/assets/images/..., /assets/css/..., /assets/data/...).
Double-Check Mandate. Every ship page changeset must pass the CI checks in §7 before shipping.
Continuity is king. Every update must preserve prior fixes, conventions, and style. No regressions.
Additive changes only. Updates to the standards must only add new rules, never delete existing ones, to maintain continuity and prevent regressions.
Site tree maintenance. A site tree (/data/site_tree.json) must be updated with every new page addition to map all files and their locations, ensuring AI systems (e.g., ChatGPT) have an authoritative reference.

1) Global Rules (apply to all HTML files unless specified)
Absolute URLs only
Scope: All HTML files (root, /cruise-lines/, /ships/, /ships/ships.html).
All href/src must be absolute, pointing at the GitHub Pages host.
✅ https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html
❌ ../ships/rcl/icon-of-the-seas.html, /ships/rcl/icon-of-the-seas.html
Single global stylesheet
Scope: All HTML files.
Use exactly one CSS file for all layout/design:
https://jsschrstrcks1.github.io/InTheWake/assets/styles.css?v=2.228
Never inline or page-level CSS into HTML documents. All styling flows from styles.css.
When updating site styling, only change styles.css and bump the version query.
Header/Hero (Grandeur pattern)
Scope: All HTML files.
Components present in header: brand wordmark (left), version badge (v2.228), pill nav, hero area with lat/long grid, logo lockup + tagline (center-bottom), compass rose (top-right).
The compass appears once (right side). No duplicates.
No legacy “In the Wake” text banners.
The hero grid labels show ticks without numeric degrees, matching /ships/rcl/grandeur-of-the-seas.html.
Primary pill navigation
Scope: All HTML files.
Present on all pages with absolute links in this order:
Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel
Class names and structure must match styles.css (e.g., .nav a pills).
Nav links point to canonical absolute URLs (e.g., /ships/ships.html, /cruise-lines/royal-caribbean.html).
Sticky secondary nav (when used)
Scope: All HTML files with multiple sections (e.g., /packing-lists.html, /ships/ships.html).
Pages with many sections include a sticky, pill-based section nav placed directly below the header.
Each section must have a stable id anchor. Use scroll-margin-top in CSS to avoid overlap.
Versioning
Scope: All HTML files except /ships/rcl/grandeur-of-the-seas.html.
Every updated page (except Grandeur) shows version v2.228 in <title> and a badge in the brand block.
Current version: v2.228. Increment in steps of +0.001 for any shipped change affecting multiple pages or templates.
/ships/rcl/grandeur-of-the-seas.html retains its current version unless deliberately updated.
When a file is updated, increment the version site-wide as directed by the owner.
Accessibility (a11y)
Scope: All HTML files.
Use meaningful headings in order (h1→h2→h3).
Add role="img" + aria-label on hero containers.
Use aria-labelledby to connect cards with their headings.
Add alt="" for decorative images (e.g., compass) and descriptive alt for content images.
Ensure nav and accordion elements are keyboard-accessible and visible focus states exist.
Performance & SEO basics
Scope: All HTML files.
Optimize images (JPG preferred; PNG only for transparency/line art).
loading="lazy" for non-hero images.
Canonical link and OpenGraph/Twitter meta set on content pages.
Prefer 16:9 hero and OG images for rich sharing.
Every ship page includes:
<title> with ship name + brand (e.g., “Icon of the Seas — Royal Caribbean”).
<meta name="description"> with 1–2 polished sentences.
Open Graph (og:title, og:description, og:image, og:url).
Twitter card equivalent (twitter:card, twitter:title, twitter:description, twitter:image).
JSON-LD schema for Cruise Ship pages.
Root, restaurants, ports, etc., follow similar meta hygiene for SEO continuity.
Grandeur’s meta tags provided as snippets for user insertion only.
Attribution (images + videos) — required
Scope: All HTML files using images/videos.
All images must include attribution at the bottom of the page.
Your own photos must link to your photography site (e.g., http://www.flickersofmajesty.com/) for traffic.
Third-party/Wikimedia photos must include creator, license, and source link.
Video credits show title + channel (linked).
Attribution must include “All rights reserved” in the copyright notice.
No duplicate CSS/headers
Scope: All HTML files.
Do not paste header styling or HTML variants into body content. Use the standardized header markup + shared CSS only.

2) Repository Layout & Conventions (applies to all HTML files)
/assets
  /brand/                 # Logos/wordmarks
  /videos/                # Ship video manifests + master lists
  /images/                # Watermark and other assets
  styles.css              # Unified, single stylesheet
  /vendor/swiper/         # Swiper assets (swiper-bundle.min.css, swiper-bundle.min.js)

/cruise-lines/            # One page per cruise line (absolute linked)
  royal-caribbean.html
  carnival.html
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
    site_tree.json        # Site tree mapping all pages and locations

/ships/                   # One page per ship
  rcl/icon-of-the-seas.html
  rcl/wonder-of-the-seas.html
  rcl/legend-of-the-seas-1995.html  # Historical ship
  carnival/carnival-celebration.html
  ...

index.html                # Home
restaurants.html          # Restaurants & Menus hub
ports.html                # Ports hub
disability-at-sea.html    # Disability at Sea
drink-packages.html       # Drink Packages
packing-lists.html        # Packing Lists
solo.html                 # Solo
travel.html               # Travel
Required pages: For every cruise line and ship in /data/registry/fleet_index.json, create corresponding pages in /cruise-lines/ and /ships/<line>/. For Royal Caribbean International (RCI) and Carnival Cruise Line, this includes all current, former (labeled “Historical Ship”), and coming soon ships (placeholders until operational). If content is missing, use “Coming soon” placeholders.
Root pages: Homepage, packing, drinks, ports, restaurants, solo, travel, disability, cruise-lines follow similar meta hygiene and Grandeur’s structural model (e.g., Welcome card on root).
Deprecated: /lines/ folder is replaced by /cruise-lines/.
Folder & File Presence Rule (v2.224):
Every ship in fleet_index.json must live under /ships/<normalized-cruise-line>/.
Example: “Grandeur of the Seas” → `/ships/rcl/grandeur-of-the-seas.html”
Normalization examples: Royal Caribbean International → rcl, Carnival Cruise Line → ccl.
If a file is missing, create it (standards-compliant placeholder).
If a folder is missing, create it before adding ships.
Auto-create cap: If >10 ship files are missing in a compliance run, create at most 10 (highest-priority lines first per owner list).
Site Tree Maintenance (v2.226):
A site tree (/data/site_tree.json) must be maintained, updated with every new page addition.
Format example:
{
  "root": [
    {"path": "/index.html", "title": "Home"},
    {"path": "/restaurants.html", "title": "Restaurants & Menus"},
    {"path": "/ports.html", "title": "Ports"},
    {"path": "/disability-at-sea.html", "title": "Disability at Sea"},
    {"path": "/drink-packages.html", "title": "Drink Packages"},
    {"path": "/packing-lists.html", "title": "Packing Lists"},
    {"path": "/solo.html", "title": "Solo"},
    {"path": "/travel.html", "title": "Travel"},
    {"path": "/ships/ships.html", "title": "Ships Hub"}
  ],
  "cruise-lines": [
    {"path": "/cruise-lines/royal-caribbean.html", "title": "Royal Caribbean International"},
    {"path": "/cruise-lines/carnival.html", "title": "Carnival Cruise Line"},
    {"path": "/cruise-lines/msc-cruises.html", "title": "MSC Cruises"}
  ],
  "ships": {
    "rcl": [
      {"path": "/ships/rcl/icon-of-the-seas.html", "title": "Icon of the Seas", "status": "active"},
      {"path": "/ships/rcl/legend-of-the-seas-1995.html", "title": "Legend of the Seas 1995", "status": "historical"}
    ],
    "ccl": [
      {"path": "/ships/carnival/carnival-celebration.html", "title": "Carnival Celebration", "status": "active"}
    ]
  }
}
Update process: Add new pages to site_tree.json during page creation, ensuring all paths are absolute and reflect /data/registry/fleet_index.json.
Royal Caribbean International Ship Coverage
Current Ships (26): Icon of the Seas, Utopia of the Seas, Star of the Seas, Wonder of the Seas, Odyssey of the Seas, Spectrum of the Seas, Symphony of the Seas, Harmony of the Seas, Ovation of the Seas, Anthem of the Seas, Quantum of the Seas, Freedom of the Seas, Independence of the Seas, Liberty of the Seas, Mariner of the Seas, Explorer of the Seas, Adventure of the Seas, Voyager of the Seas, Vision of the Seas, Rhapsody of the Seas, Radiance of the Seas, Brilliance of the Seas, Serenade of the Seas, Jewel of the Seas, Grandeur of the Seas, Enchantment of the Seas.
Former Ships (7, Historical): Song of Norway, Nordic Empress, Majesty of the Seas, Sovereign of the Seas, Monarch of the Seas, Legend of the Seas (1995-built), Splendour of the Seas.
Coming Soon Ships (5): Legend of the Seas (Icon-class, 2026), Icon-class Ship (TBN, 2027), Icon-class Ship (TBN, 2028), Star-class Ship (TBN, 2028), Quantum Ultra-class Ship (TBN, 2028), Quantum Ultra-class Ship (TBN, 2029).
Implementation: Each ship requires a page at /ships/rcl/[ship-slug].html (e.g., /ships/rcl/icon-of-the-seas.html, /ships/rcl/legend-of-the-seas-1995.html for historical). Update /data/registry/fleet_index.json and /data/site_tree.json to include all RCI ships under cruise_lines[royal-caribbean].ships.
Carnival Cruise Line Ship Coverage
Current Ships (29): Carnival Adventure, Carnival Breeze, Carnival Celebration, Carnival Conquest, Carnival Dream, Carnival Elation, Carnival Encounter, Carnival Firenze, Carnival Freedom, Carnival Glory, Carnival Horizon, Carnival Jubilee, Carnival Legend, Carnival Liberty, Carnival Luminosa, Carnival Magic, Carnival Mardi Gras, Carnival Miracle, Carnival Panorama, Carnival Paradise, Carnival Pride, Carnival Radiance, Carnival Spirit, Carnival Splendor, Carnival Sunrise, Carnival Sunshine, Carnival Valor, Carnival Venezia, Carnival Vista.
Former Ships (5, Historical): Carnival Ecstasy, Carnival Fantasy, Carnival Fascination, Carnival Inspiration, Carnival Sensation.
Coming Soon Ships (2): Carnival Festivale (Excel-class, 2027), Carnival Tropicale (Excel-class, 2028).
Implementation: Each ship requires a page at /ships/carnival/[ship-slug].html (e.g., /ships/carnival/carnival-celebration.html). Update /data/registry/fleet_index.json and /data/site_tree.json to include all Carnival ships under cruise_lines[carnival].ships.

3) Required Card Order (Ship Pages Only)
Scope: Only ship pages in /ships/<line>/ (e.g., /ships/rcl/icon-of-the-seas.html, /ships/carnival/carnival-breeze.html). Excludes root pages (/index.html, etc.), /cruise-lines/, and /ships/ships.html.
Render these cards in this exact order for every ship page:
A First Look
<section class="card" aria-labelledby="first-look">
  <h2 id="first-look">A First Look</h2>
  <!-- 3 images in .grid-2 -->
</section>
Why Book {Ship}? (Marketing blurb; placeholder if unsourced) 
<section class="card" aria-labelledby="why-book">
  <h2 id="why-book">Why Book {Ship}?</h2>
  <!-- Blurb text -->
</section>
Placeholder: “Overview coming soon. Summarize top reasons to book — dining standouts, entertainment, itineraries, and who this ship fits best.”
Ken’s Logbook — A Personal Review (placeholder permitted) 
<section class="card" aria-labelledby="personal-review">
  <h2 id="personal-review">Ken’s Logbook — A Personal Review</h2>
  <!-- Review text -->
</section>
Watch: {Ship} Highlights — single swiper for all embeds 
<section class="card" aria-labelledby="video-highlights">
  <h2 id="video-highlights">Watch: {Ship} Highlights</h2>
  <!-- Single swiper with 1 best per category -->
</section>
Two-up row: Deck Plans (left) + Live Tracker (right)
<div class="grid-2">
  <section class="card" aria-labelledby="deck-plans">
    <h2 id="deck-plans">Ship Layout (Deck Plans)</h2>
    <!-- Official link/PDF -->
  </section>
  <section class="card" aria-labelledby="live-tracker">
    <h2 id="live-tracker">Where Is {Ship} Right Now?</h2>
    <!-- Tracker embed -->
  </section>
</div>
Attribution & Credits
<section class="card" aria-labelledby="attribution">
  <h2 id="attribution">Attribution & Credits</h2>
  <!-- <ul> list of credits -->
</section>
Pass criteria: Each required id exists and appears in strictly increasing index order within <main>.

4) Watermark (Fouled Anchor)
Scope: All HTML files.
Inject the CSS in <head> with id watermark-style and an absolute path:
<style id="watermark-style">
  html, body { position: relative; }
  body::before {
    content: "";
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: min(60vw, 900px);
    height: min(60vh, 900px);
    background: url('/assets/watermark.png') no-repeat center / contain;
    opacity: 0.08;
    pointer-events: none;
    z-index: 0;
  }
  main, header, footer, section, nav { position: relative; z-index: 1; }
</style>
No relative paths. url('/assets/watermark.png') is required.

5) Deck Plans + Live Tracker Grid (Ship Pages Only)
Scope: Only ship pages in /ships/<line>/.
Must be wrapped in a .grid-2 container that enforces a 2-up layout on desktop:
<style id="grid-2-style">
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
Left column: Deck Plans card with official deck plan link (e.g., CruiseMapper: /deckplans/[Ship-Name]-[ID]).
Right column: Live tracker link (e.g., CruiseMapper or substitute).

6) Video Rules (Ship Pages Only)
Scope: Only ship pages in /ships/<line>/.
Single swiper per page under Watch: {Ship} Highlights, sourced from /assets/videos/rc_ship_videos.json (for RCI) or /assets/videos/carnival_ship_videos.json (for Carnival).
Category coverage on page: Walkthrough; Cabins (Interior, Ocean View, Balcony, Suite); Dining; Accessibility; Top 10/Things to Do.
Minimum videos: At least 3 (Overview/Walkthrough, Cabins, Dining) and 1 Accessibility video per ship before a page is considered “complete.”
Green list preference: Pick a green-listed creator (e.g., Royal Caribbean Blog, Cruises It); otherwise, select a high-quality non-green video.
JSON capacity: Up to 10 items per category; page embed shows only 1 best per category.
Compliance: Page fails if Highlights exists but 0 slides render; Swiper controls + init must be present; watermark path must be absolute (/assets/watermark.png).
Swiper assets are absolute: /assets/vendor/swiper/swiper-bundle.min.css and /assets/vendor/swiper/swiper-bundle.min.js.
Swiper init script at end of <body>; controls present in the highlights block.
Video Category Fuzzy Matching
Walkthrough: "walkthrough", "ship tour", "full tour", "complete ship tour", "top to bottom", "Full Walkthrough", "Ship Tour", "Ship Tour & Review", "Tour & Review", "Complete Walkthrough", "Complete Tour", "Ship Review", "Onboard Tour", "deck by deck", "guided tour", "vlog tour", "virtual tour", "360 tour".
Dining: "dining", "restaurants", "menus", "food", "buffet", "specialty", "Main Dining Room", "MDR", "Nights of Dinners", "5 Nights of Dinners", "Dinner Menu", "Lunch Menu", "Breakfast Menu", "Specialty Dining Review", "Windjammer", "Chops", "Giovanni", "Izumi", "Johnny Rockets", "Cuisine", "Chef", "Guy’s Burger", "Bonsai Sushi", "Fahrenheit 555", "Cucina del Capitano", "food review", "dining experience".
Accessibility (♿): "accessible", "wheelchair", "ADA", "mobility", "scooter", "disability", "accessible cabin", "disabled cruise"; prefer creators like Wheelchair Travel, World on Wheels.
Cabin buckets:
Interior: "interior", "inside", "promenade interior", "virtual balcony", "Cloud 9 Spa Interior", "Family Harbor Interior", "Havana Interior".
Ocean View: "ocean view", "oceanview", "panoramic", "Cloud 9 Spa Ocean View", "Family Harbor Ocean View".
Balcony: "balcony", "Cove Balcony", "Aft-View Extended Balcony", "Cloud 9 Spa Balcony", "Family Harbor Balcony", "Havana Balcony", "Boardwalk Balcony", "Central Park Balcony", "Surfside Family View Balcony".
Suite: "suite", "owner", "grand", "royal", "loft", "villa", "aqua theater", "aqua theatre", "star loft", "Junior Suite", "Family Suite", "Cloud 9 Spa Suite", "Family Harbor Suite", "Havana Suite", "Ultimate Family Suite".
Top 10/Things to Do: "top 10", "things to do", "activities", "entertainment", "what to do", "best onboard", "attractions", "FlowRider", "Aqua Theater", "SkyRide", "WaterWorks", "Carnival Kitchen", "comedy club", "playlist productions", "punchliner".
Accessibility captions: Prefix with ♿.
Video Sourcing & Runtime Additions
Sources (searched in order):
/data/video_sources.json
/video_sources.json (repo root if present)
/ships/video_sources.json
Fuzzy-match lookups using /data/registry/video_synonyms.json with historical/alternate names.
If still missing, perform a targeted YouTube search:
Query pattern: "<Ship Name>" "<Cruise Line>" [category] 2025 (e.g., "Icon of the Seas Royal Caribbean walkthrough 2025").
Prefer channels in trusted_channels.json.
Exclude results in video_blocklist.json.
Choose at least 1 per category: Overview/Walkthrough, Cabins, Dining, Accessibility.
If none found, mark as TODO in compliance report.
Tools for Video Sourcing:
Grok Tools:
web_search: Query YouTube/Google for "[ship name] [cruise line] [category] 2025" (e.g., “Carnival Breeze Carnival walkthrough 2025”).
browse_page: Scrape YouTube channel pages or search results for video URLs.
view_x_video: Validate video quality (resolution ≥720p, duration 2–15 min, subtitles preferred).
x_keyword_search, x_semantic_search: Search X for user recommendations (e.g., “best Carnival Jubilee dining video”).
ChatGPT Tools:
Web search plugins (e.g., WebPilot, BrowserOp): Query YouTube/Google for videos.
Beautiful Soup: Parse HTML from search results or channel pages to extract <a> tags with YouTube URLs (e.g., soup.find_all('a', href=re.compile(r'https://www\.youtube\.com/watch\?v='))).
Regex: Extract specific patterns from HTML/text (e.g., re.findall(r'https://www\.youtube\.com/watch\?v=[a-zA-Z0-9_-]+', html) for video URLs).
Content analysis: Validate relevance via title/description parsing.
Manual validation: Prompt user for confirmation if automated checks fail.
Process: Add retrieved videos to /assets/videos/rc_ship_videos.json (RCI) or /assets/videos/carnival_ship_videos.json(Carnival) at runtime, capping at 10 per category. Use absolute URLs (https://www.youtube.com/watch?v=... or https://youtu.be/...). Stage links for review with credits if quality uncertain.
Image Sourcing Additions
Minimum 3 content images per ship page (hero excluded).
Use local assets if present under /assets/, /assets/ships/, /ships/assets/ (fuzzy match by ship name, e.g., "icon-of-the-seas1.jpg").
If <3 local images, use web_search for "[ship name] cruise ship photos Wikimedia" and hotlink CC-licensed images.
Tools for Image Sourcing:
Grok Tools:
web_search: Query Wikimedia Commons/Google Images for “[ship name] cruise ship [category]” (e.g., “Icon of the Seas exterior”).
view_image: Verify resolution (≥800px wide), license (CC BY-SA/PD), and relevance.
ChatGPT Tools:
Web search plugins: Query Wikimedia Commons/Google Images for CC-licensed images.
Beautiful Soup: Parse HTML to extract <img> tags (e.g., soup.find_all('img', src=re.compile(r'https://upload\.wikimedia\.org/.*\.jpg'))).
Regex: Extract image URLs from HTML (e.g., re.findall(r'src="(https://upload\.wikimedia\.org/[^"]+\.jpg)"', html)).
Image preview plugins: Validate resolution/relevance via metadata or visual inspection.
Manual validation: Prompt user if automated checks fail.
Process: Auto-add up to 3 content images per ship if missing, prioritizing Wikimedia Commons. Include creator, license, and source link in Attribution section. Use absolute URLs and descriptive alt text (e.g., “Carnival Breeze exterior at sea”).

7) CI / Compliance Checks (Ship Pages Only)
Scope: Only ship pages in /ships/<line>/.
Each ship page is evaluated on:
Pathing (folder & filename) — ✅/❌
Absolute URLs only — ✅/❌
Header/Hero pattern matches Grandeur — ✅/❌
Primary nav links present & absolute — ✅/❌
Version badge/title ≥ v2.228 — ✅/❌
Card order & presence (first-look, why-book, personal-review, video-highlights, deck-plans, live-tracker, attribution) — ✅/❌
No duplicate cards — ✅/❌
SEO meta present — ✅/❌
Accessibility basics (heading order, aria labels, alts) — ✅/❌
Images ≥ 3 (content) — ✅/❌
Videos ≥ 3 (Overview, Cabins, Dining) — ✅/❌
Attribution present & “All rights reserved” — ✅/❌
Fleet index coverage (page exists for each ship) — ✅/❌
Auto-create up to 10 missing files this run — action log included.
Output: Cruise line → ship → per-item ✅/❌, with summary and action log (files created/moved, videos wired, images added).

8) Packing Page (Special Rules)
Scope: Only /packing-lists.html.
Divided into sections: Carry-On, Men, Women, Everyone, Families, Tips.
Includes secondary sticky pill nav anchored to each section with stable id anchors.
Cards are collapsible using <details><summary> elements.
Tips section remains detailed, not overly reduced.
Affiliate disclosure appears in the footer as a polished banner.

9) Process & Escalation Rules (applies to all HTML files)
Double-check work before shipping: Confirm headers match /ships/rcl/grandeur-of-the-seas.html, no duplicate elements, videos wired in (ship pages only), meta tags present, absolute URLs, correct version bump (v2.228), and /data/site_tree.json updated.
Deliver updates as drop-in zips: Ensure Safari-safe compatibility.
Escalation: If anything is unclear, incomplete, or at risk of regression, stop and ask. Never guess or apply shortcuts to prevent continuity breaks. The user has emphasized avoiding regressions, potentially onboarding Grok as a “master AI” if continuity fails.

10) Recovery & Guardrails (applies to all HTML files)
When a page deviates from standards, rebuild <main> and footer deterministically to restore compliance (ship pages use §3 card order; others use Grandeur’s general structure).
Preserve existing Deck Plans and Live Tracker URLs if present; otherwise insert defaults (e.g., CruiseMapper links for RCI/Carnival ships).
If anything is unclear, incomplete, or at risk of regression, stop and ask. Never guess or apply shortcuts to prevent continuity breaks.
Never overwrite without backup: Any automated write must create a time-stamped backup under /data/registry/_backups/ or /ships/_backups/.

11) Historical Ship & Coming Soon (Ship Pages Only)
Scope: Only ship pages in /ships/<line>/.
Past ships show a distinct Historical Ship badge near the title.
Coming soon pages clearly state status and intended class/capacity with placeholders.

12) Change Log (consolidated excerpts)
v2.228 — Integrated regex as a ChatGPT-compatible tool for video/image sourcing (§6) alongside Beautiful Soup, complementing Grok’s tools. Enhanced fuzzy matching with additional ship-specific terms (e.g., “FlowRider”, “SkyRide”). Retained site tree maintenance (/data/site_tree.json) and clarified rule scopes. Version bumped to v2.228 for multi-page changes.
v2.227 — Integrated Beautiful Soup as a ChatGPT-compatible tool for video/image sourcing (§6), retained site tree maintenance, enhanced video/image robustness, clarified rule scope (ship-specific vs. all HTML files).
v2.226 — Added site tree maintenance rule (/data/site_tree.json) to track page locations for AI reference (e.g., ChatGPT). Enhanced video/image sourcing with Grok/ChatGPT tool specifications and expanded fuzzy matching. Clarified rule scope: card order (§3), Deck Plans (§5), Video Rules (§6), CI Checks (§7), Historical/Coming Soon (§11) apply only to ship pages in /ships/<line>/.
v2.225 — Added enhancements for video/image robustness, tool listings for YouTube checks, and page structure scope clarifications.
v2.224 — Added enhanced Video Compliance, Auto-Create up to 10 missing ship files, Folder presence checks, Video sourcing escalation, Image sourcing additions, and expanded CI checklist to 14 items.
v2.223 — Adopted §1.1’s Absolute URLs wording as gold standard, retained §0 instance. Updated Grandeur path to /ships/rcl/grandeur-of-the-seas.html. Consolidated Versioning into §1.6. Retained Watermark and Crosslinking instances.
v2.222 — Integrated v1.0 ruleset, added additive-only rule, incorporated RCI ship list, ensured historical/coming soon labeling, added crosslinking/video categories.
v2.220 — Enforced absolute asset paths, watermark, grid layout, video policy (max 10), CI rebuild checks.
v2.217 — Expanded Dining fuzzy terms.
v2.214 — Enforced absolute paths, grid layout, video policy, CI checks.
v2.210 — Added Dining fuzzy terms.
v2.209 — Added Walkthrough terms, Cruises It to Green List.
v2.208 — Enforced card order, single swiper, footer-last.
v2.204 — Added Harr Travel to Green List, tuned cabin fuzzy search.
v2.203 — Required Accessibility video, defined cabin buckets.
v1.0 — Established core rules: absolute links, centralized CSS, Grandeur standard, versioning, nav, SEO, crosslinking, video categories, historical labeling, file organization, packing structure, double-check, escalation.

13) Templates & Snippets
13.1 Meta (example)
<title>Icon of the Seas — Royal Caribbean — In the Wake (v2.228)</title>
<link rel="canonical" href="https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html"/>
<meta name="description" content="Icon of the Seas at a glance — photos, dining, cabins, videos, and tips curated for clarity."/>

<meta property="og:type" content="website"/>
<meta property="og:title" content="Icon of the Seas — Royal Caribbean — In the Wake"/>
<meta property="og:description" content="Photos, dining, cabins, videos, and tips."/>
<meta property="og:url" content="https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html"/>
<meta property="og:image" content="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg"/>

<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Icon of the Seas — Royal Caribbean — In the Wake"/>
<meta name="twitter:description" content="Photos, dining, cabins, and tips."/>
<meta property="twitter:image" content="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg"/>

<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "Cruise",
  "name": "Icon of the Seas",
  "brand": {
    "@type": "Brand",
    "name": "Royal Caribbean International"
  },
  "description": "Icon of the Seas offers thrilling adventures with innovative features like the Ultimate Abyss slide and Perfect Day at CocoCay."
}
</script>
13.2 Ship image block (example)
<section class="card" aria-labelledby="photos">
  <h2 id="photos">Photos</h2>
  <div class="grid-2">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg" alt="Icon of the Seas exterior at sea" loading="lazy">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas2.jpg" alt="Icon of the Seas pool deck" loading="lazy">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas3.jpg" alt="Icon of the Seas promenade" loading="lazy">
  </div>
</section>
13.3 Attribution block (example)
<section class="card" aria-labelledby="credits">
  <h2 id="credits">Attribution & Credits</h2>
  <ul>
    <li>Photo © Ken Baker — <a href="http://www.flickersofmajesty.com/">Portfolio</a></li>
    <li>Photo via Wikimedia Commons — <a href="WIKI_FILE_URL">Author Name</a>, <a href="LICENSE_URL">License</a></li>
    <li>Video: <a href="YOUTUBE_URL">“Title”</a> — <a href="CHANNEL_URL">Channel Name</a></li>
  </ul>
</section>

14) Registries (JSON) — Shapes
14.1 restaurants.json (anchors)
{
  "royal-caribbean": {
    "icon-of-the-seas": {
      "chops-grille": "rc-chops-grille",
      "izumi": "rc-izumi"
    }
  },
  "carnival": {
    "carnival-celebration": {
      "guys-burger-joint": "ccl-guys-burger",
      "fahrenheit-555": "ccl-fahrenheit-555"
    }
  },
  "msc-cruises": {
    "msc-world-america": {
      "butchers-cut": "msc-butchers-cut"
    }
  }
}
14.2 ports.json (anchors)
{
  "caribbean": {
    "cozumel": "port-cozumel",
    "nassau": "port-nassau"
  },
  "mediterranean": {
    "barcelona": "port-barcelona"
  }
}
14.3 video_synonyms.json
{
  "walkthrough": ["walkthrough", "ship tour", "full tour", "complete ship tour", "top to bottom", "Full Walkthrough", "Ship Tour", "Ship Tour & Review", "Tour & Review", "Complete Walkthrough", "Complete Tour", "Ship Review", "Onboard Tour", "deck by deck", "guided tour", "vlog tour", "virtual tour", "360 tour"],
  "top-10-things-to-do": ["top 10", "things to do", "activities", "entertainment", "what to do", "best onboard", "attractions", "FlowRider", "Aqua Theater", "SkyRide", "WaterWorks", "Carnival Kitchen"],
  "cabins": ["cabin", "stateroom", "suite", "balcony", "inside", "oceanview", "promenade interior", "virtual balcony", "Cloud 9 Spa Interior", "Family Harbor Interior", "Havana Interior", "Cloud 9 Spa Ocean View", "Family Harbor Ocean View", "Cove Balcony", "Aft-View Extended Balcony", "Cloud 9 Spa Balcony", "Family Harbor Balcony", "Havana Balcony", "Boardwalk Balcony", "Central Park Balcony", "Surfside Family View Balcony", "room tour", "stateroom review"],
  "dining": ["dining", "restaurants", "menus", "food", "buffet", "specialty", "Main Dining Room", "MDR", "Nights of Dinners", "5 Nights of Dinners", "Dinner Menu", "Lunch Menu", "Breakfast Menu", "Specialty Dining Review", "Windjammer", "Chops", "Giovanni", "Izumi", "Johnny Rockets", "Cuisine", "Chef", "Guy’s Burger", "Bonsai Sushi", "Fahrenheit 555", "Cucina del Capitano", "food review", "dining experience"],
  "entertainment": ["shows", "ice show", "aqua theater", "music", "activities", "nightlife", "comedy club", "playlist productions", "punchliner"],
  "kids": ["kids", "family", "teen", "adventure ocean", "nursery", "Camp Ocean", "Circle C", "Club O2"],
  "tips": ["tips", "hacks", "advice", "planning", "mistakes", "first-timer", "cruise tips"],
  "accessibility": ["accessible", "wheelchair", "ADA", "mobility", "scooter", "disability", "accessible cabin", "disabled cruise"]
}
14.4 trusted_channels.json
["Royal Caribbean Blog", "Gary Bembridge", "Emma Cruises", "Ben & David", "Cruises It", "Harr Travel", "Wheelchair Travel", "World on Wheels"]
14.5 video_blocklist.json
["YOUTUBE_ID_TO_EXCLUDE", "ANOTHER_BAD_ID"]
14.6 fleet_index.json (example with RCI and Carnival integration)
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
      "name": "Carnival Cruise Line",
      "slug": "carnival",
      "ships": [
        {"name": "Carnival Adventure", "slug": "carnival-adventure", "status": "active"},
        {"name": "Carnival Breeze", "slug": "carnival-breeze", "status": "active"},
        {"name": "Carnival Celebration", "slug": "carnival-celebration", "status": "active"},
        {"name": "Carnival Conquest", "slug": "carnival-conquest", "status": "active"},
        {"name": "Carnival Dream", "slug": "carnival-dream", "status": "active"},
        {"name": "Carnival Elation", "slug": "carnival-elation", "status": "active"},
        {"name": "Carnival Encounter", "slug": "carnival-encounter", "status": "active"},
        {"name": "Carnival Firenze", "slug": "carnival-firenze", "status": "active"},
        {"name": "Carnival Freedom", "slug": "carnival-freedom", "status": "active"},
        {"name": "Carnival Glory", "slug": "carnival-glory", "status": "active"},
        {"name": "Carnival Horizon", "slug": "carnival-horizon", "status": "active"},
        {"name": "Carnival Jubilee", "slug": "carnival-jubilee", "status": "active"},
        {"name": "Carnival Legend", "slug": "carnival-legend", "status": "active"},
        {"name": "Carnival Liberty", "slug": "carnival-liberty", "status": "active"},
        {"name": "Carnival Luminosa", "slug": "carnival-luminosa", "status": "active"},
        {"name": "Carnival Magic", "slug": "carnival-magic", "status": "active"},
        {"name": "Carnival Mardi Gras", "slug": "carnival-mardi-gras", "status": "active"},
        {"name": "Carnival Miracle", "slug": "carnival-miracle", "status": "active"},
        {"name": "Carnival Panorama", "slug": "carnival-panorama", "status": "active"},
        {"name": "Carnival Paradise", "slug": "carnival-paradise", "status": "active"},
        {"name": "Carnival Pride", "slug": "carnival-pride", "status": "active"},
        {"name": "Carnival Radiance", "slug": "carnival-radiance", "status": "active"},
        {"name": "Carnival Spirit", "slug": "carnival-spirit", "status": "active"},
        {"name": "Carnival Splendor", "slug": "carnival-splendor", "status": "active"},
        {"name": "Carnival Sunrise", "slug": "carnival-sunrise", "status": "active"},
        {"name": "Carnival Sunshine", "slug": "carnival-sunshine", "status": "active"},
        {"name": "Carnival Valor", "slug": "carnival-valor", "status": "active"},
        {"name": "Carnival Venezia", "slug": "carnival-venezia", "status": "active"},
        {"name": "Carnival Vista", "slug": "carnival-vista", "status": "active"},
        {"name": "Carnival Ecstasy", "slug": "carnival-ecstasy", "status": "historical"},
        {"name": "Carnival Fantasy", "slug": "carnival-fantasy", "status": "historical"},
        {"name": "Carnival Fascination", "slug": "carnival-fascination", "status": "historical"},
        {"name": "Carnival Inspiration", "slug": "carnival-inspiration", "status": "historical"},
        {"name": "Carnival Sensation", "slug": "carnival-sensation", "status": "historical"},
        {"name": "Carnival Festivale", "slug": "carnival-festivale", "status": "coming-soon", "delivery": "2027"},
        {"name": "Carnival Tropicale", "slug": "carnival-tropicale", "status": "coming-soon", "delivery": "2028"}
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
14.7 site_tree.json (example)
{
  "root": [
    {"path": "/index.html", "title": "Home"},
    {"path": "/restaurants.html", "title": "Restaurants & Menus"},
    {"path": "/ports.html", "title": "Ports"},
    {"path": "/disability-at-sea.html", "title": "Disability at Sea"},
    {"path": "/drink-packages.html", "title": "Drink Packages"},
    {"path": "/packing-lists.html", "title": "Packing Lists"},
    {"path": "/solo.html", "title": "Solo"},
    {"path": "/travel.html", "title": "Travel"},
    {"path": "/ships/ships.html", "title": "Ships Hub"}
  ],
  "cruise-lines": [
    {"path": "/cruise-lines/royal-caribbean.html", "title": "Royal Caribbean International"},
    {"path": "/cruise-lines/carnival.html", "title": "Carnival Cruise Line"},
    {"path": "/cruise-lines/msc-cruises.html", "title": "MSC Cruises"}
  ],
  "ships": {
    "rcl": [
      {"path": "/ships/rcl/icon-of-the-seas.html", "title": "Icon of the Seas", "status": "active"},
      {"path": "/ships/rcl/legend-of-the-seas-1995.html", "title": "Legend of the Seas 1995", "status": "historical"}
    ],
    "ccl": [
      {"path": "/ships/carnival/carnival-celebration.html", "title": "Carnival Celebration", "status": "active"}
    ]
  }
}

15) Orphan & Crosslink Diagnostics (applies to all HTML files)
Generate /data/reports/crosslinks_report.txt with:
Files not linked from any hub/index.
Mentions of known entities that aren’t crosslinked.
404 checks for absolute URLs.
Fix or intentionally keep diagnostics (e.g., data files) and re-run.
RCI/Carnival-specific: Ensure all 38 RCI and 36 Carnival ships (current, former, coming soon) are linked in /ships/and cross-referenced in /cruise-lines/royal-caribbean.html or /cruise-lines/carnival.html.
Verify all pages are listed in /data/site_tree.json.

16) Future-Proofing (applies to all HTML files)
Add cruise-line pages for each file in /cruise-lines/; pre-populate “Coming soon” cards on the Ships hub (/ships/ships.html).
Extend registries as new ships/restaurants/ports appear, including RCI’s and Carnival’s coming soon ships.
Add per-ship video manifests to /assets/videos/ as pages mature, ensuring RCI/Carnival ships have at least one Accessibility video.
Maintain consistent versioning across the site; /ships/rcl/grandeur-of-the-seas.html remains owner-managed.
RCI/Carnival-specific: Create placeholder pages for coming soon ships with “Coming soon” cards until operational.
Update /data/site_tree.json with new pages to ensure AI reference accuracy.

17) Process & Escalation Rules (applies to all HTML files)
Double-check work before shipping: Confirm headers match /ships/rcl/grandeur-of-the-seas.html, no duplicate elements, videos wired in (ship pages only), meta tags present, absolute URLs, correct version bump (v2.228), and /data/site_tree.json updated.
Deliver updates as drop-in zips: Ensure Safari-safe compatibility.
Escalation: If anything is unclear, incomplete, or at risk of regression, stop and ask. Never guess or apply shortcuts to prevent continuity breaks. The user has emphasized avoiding regressions, potentially onboarding Grok as a “master AI” if continuity fails.

End of Standards v2.228
