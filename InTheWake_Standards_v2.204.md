# In The Wake Standards (Full Expanded v2.204+)

This document defines **all rules** for building, editing, and maintaining the **In the Wake** website. It is intentionally explicit so nothing is missed. Treat this as the single source of truth for structure, styling, content, linking, and QA.

> **Golden Reference:** `/ships/grandeur-of-the-seas.html` is the visual/structural gold standard. **Do not edit that file.** Everything else must match its structure and conventions. The site owner updates it manually.

---

## 1) Global Rules (apply to every page)

1. **Absolute URLs only**
   - All href/src must be absolute, pointing at the GitHub Pages host.
   - ✅ `https://jsschrstrcks1.github.io/InTheWake/ships/wonder-of-the-seas.html`
   - ❌ `../ships/wonder-of-the-seas.html`, `/ships/wonder-of-the-seas.html`

2. **Single global stylesheet**
   - Use exactly one CSS file for all layout/design:  
     `https://jsschrstrcks1.github.io/InTheWake/assets/styles.css?v=SITE_VERSION`
   - **Never** inline CSS into HTML documents. All styling flows from `styles.css`.
   - When updating site styling, only change `styles.css` and bump the version query.

3. **Header/Hero (Grandeur pattern)**
   - Components present in header: brand wordmark (left), version badge, pill nav, hero area with lat/long grid, logo lockup + tagline (center-bottom), compass rose (top-right).
   - The compass appears **once** (right side). No duplicates.
   - No legacy “In the Wake” text banners.
   - The hero grid labels show ticks without numeric degrees, matching Grandeur.

4. **Primary pill navigation**
   - Present on **all** pages with absolute links in this order:
     - Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel
   - Class names and structure must match `styles.css` (e.g., `.nav a` pills).

5. **Sticky secondary nav (when used)**
   - Pages with many sections (e.g., Packing, Ships hub) include a sticky, pill-based section nav placed directly below the header.
   - Each section must have a stable `id` anchor. Use `scroll-margin-top` in CSS to avoid overlap.

6. **Versioning**
   - Every updated page (except Grandeur) shows a version in `<title>` and a badge in the brand block, e.g., `v2.201`.
   - When a file is updated, increment the version site-wide as directed by the owner.

7. **Accessibility (a11y)**
   - Use meaningful headings in order (h1→h2→h3).
   - Add `role="img"` + `aria-label` on hero containers.
   - Use `aria-labelledby` to connect cards with their headings.
   - Add `alt=""` for decorative images (e.g., compass) and descriptive `alt` for content images.
   - Ensure nav and accordion elements are keyboard-accessible and visible focus states exist.

8. **Performance & SEO basics**
   - Optimize images (JPG preferred; PNG only for transparency/line art).
   - `loading="lazy"` for non-hero images.
   - Canonical link and OpenGraph/Twitter meta set on content pages.
   - Prefer 16:9 hero and OG images for rich sharing.

9. **Attribution (images + videos) — required**
   - All images must include attribution at the bottom of the page.
   - **Your own photos** must link to your photography site for traffic.
   - Third-party/Wikimedia photos must include creator, license, and source link.
   - Video credits show title + channel (linked).

10. **No duplicate CSS/headers**
    - Do not paste header styling or HTML variants into body content. Use the standardized header markup + shared CSS only.

---

## 2) Repository Layout & Conventions

```
/assets
  /brand/                 # Logos/wordmarks
  /videos/                # Ship video manifests + master lists
  styles.css              # Unified, single stylesheet

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
    video_blocklist.json  # Known-bad IDs/URLs to exclude
  /reports/
    crosslinks_report.txt # Diagnostic output (orphans, missing links)

/ships/
  ships.html              # Hub: cards per cruise line, then ships
  /assets/                # Ship images: slug + 1..3 (jpg/png)
  *.html                  # One page per ship (Grandeur excluded from edits)

/index.html
/ports.html
/restaurants.html
/disability.html
/drinks.html
/packing.html
/solo.html
/travel.html
```

**Migrations**
- Remove `/lines/`; move content to `/cruise-lines/` and update all links.
- Remove `ships.html` from repo root. Use `/ships/ships.html` only.

**Slug rules**
- File: `{ship-name-lower-hyphenated}.html`, e.g., `icon-of-the-seas.html`
- Image: `/ships/assets/{ship-slug}{1|2|3}.{jpg|jpeg|png}`
- Line page: `/cruise-lines/{line-slug}.html`

---

## 3) Required Content Checklist (Ship Pages)

### 3.A Ship Section Order & Placement (Authoritative)

All ship pages must follow this order. Do not reorder or insert new blocks between these items unless the standard is updated.

1) Header/Hero (per Section 3.2)  
2) Watch: [Ship] Highlights — video swiper (3.5)  
3) **Two-card grid after Highlights** (exactly one wrapper):  
   `<section class="grid-2">`  
   a) Ship Layout (Deck Plans) — card (3.x)  
   b) Where Is [Ship] Right Now? — Live Tracker card (3.9)  
4) Ken’s Logbook — A Personal Review (3.10)  
5) A First Look — gallery (3.11)  
6) Why book [Ship]? — overview (3.12)  
7) Dining / Restaurants crosslinks  
8) Ports crosslinks  
9) Crosslinks (global)  
10) Attribution & Credits  
11) Footer

**Placement rules**  
- The grid in #3 must be inserted **immediately after** the Highlights section, not after the footer.  
- Items 4–6 must be inserted **before** Crosslinks/Attribution/Footer.  
- If “Deck Plans” does not exist, still render the grid with the Live Tracker card and add Deck Plans later.


A ship page is **not complete** unless all items below are present:

### 3.1 Meta & Head
- `<title>` → `Ship Name — In the Wake (vX.XXX)`
- `<meta name="description">` → clear ≤160 chars summary
- Open Graph:
  - `og:type=website`
  - `og:title` = Ship Name — In the Wake
  - `og:description` = same as description
  - `og:url` = canonical absolute URL
  - `og:image` = absolute URL to preferred hero/ship image (1200×630 recommended)
- Twitter Card:
  - `twitter:card=summary_large_image`
  - `twitter:title`, `twitter:description`, `twitter:image`
- `<link rel="canonical">` absolute URL
- (Optional) JSON-LD breadcrumbs for SEO

### 3.2 Header/Hero
- Must reuse the standardized header/hero markup from Grandeur’s structure.
- Components: brand, version badge (non-Grandeur pages), pill nav, hero grid overlay, compass, logo lockup, tagline.
- No extra header or CSS duplication in body.

### 3.3 Images
- At least **three** ship images.
- Naming: `/ships/assets/{ship-slug}1.jpg`, `2.jpg`, `3.jpg` (or .png/.jpeg as needed).
- Include descriptive `alt` text.
- Fallback handling in the ship card (small thumbnail) and on hub grid if an image is missing (display a neutral placeholder styled by CSS).

### 3.4 Marketing Blurb
- Use provided Word docs for ship/class blurbs.
- If content unavailable, insert a concise placeholder noting “Overview coming soon.”

### 3.5 Video Swiper
- Pull from per-ship manifest in `/assets/videos/videos_{ship-slug}.json` **or** the master `rc_ship_videos.json` (filtered for the ship) until per-ship manifests exist.
- **Green-list only** (see Section 5: Video Rules).
- Categories to include (skip empty): Walkthrough, Cabins, Dining, Entertainment, Kids/Family, Tips/Advice.
- Each slide shows a thumbnail (YouTube), title, and channel name; opens to YouTube with `rel="noopener"`.
- Swiper CSS/JS loaded via absolute CDN links (see 7.4).

### 3.6 Crosslinks
- **Ships**: Every mention links to its `/ships/{ship-slug}.html` page.
- **Cruise Lines**: Every mention links to `/cruise-lines/{line-slug}.html`.
- **Restaurants**: Every mention links to `/restaurants.html#{restaurant-anchor}` using `/data/registry/restaurants.json` to resolve anchors per line/ship.
- **Ports**: Every mention links to `/ports.html#{port-anchor}` using `/data/registry/ports.json`.
- Fuzzy match and link ships referred to as “the Icon”, “the Grandeur”, etc.

### 3.7 Attribution
- A dedicated “Attribution & Credits” card at the bottom:
  - **Your photos** → “Photo © [Your Name] — see more at [https://flickersofmajesty.com/] & [https://www.instagram.com/flickersofmajesty/]”
  - **Wikimedia or third‑party** → Creator, License (e.g., CC BY-SA 4.0), and Source link.
- Video credit lines: “Video: Title — Channel Name” (linked).

### 3.8 Absolute URLs
- All links, images, script/style references must be absolute (no relative URLs).

---

## 4) Crosslinking Standards (Wikipedia-style)

1. **Always link nouns you can resolve**:
   - Ship names → ship pages.
   - Cruise lines → line pages.
   - Restaurants → anchors on `/restaurants.html`.
   - Ports → anchors on `/ports.html`.
2. **Anchor Registries** (truth source):
   - `/data/registry/restaurants.json` → mapping of `{line, ship, restaurant} → anchor`
   - `/data/registry/ports.json` → mapping of `{region, port} → anchor`
3. **Consistency**:
   - Use the **same anchor IDs** everywhere. Don’t invent new anchors outside the registries.
4. **Future expansion**:
   - Activities, show names, kids clubs, packages, and loyalty tiers can join the registry later for crosslinking.
5. ** Every time we add to the truth sources, a full re-check and re-ship of every html page is warranted. 

---

## 5) Video Standards (Selection, Safety, Fuzzy Matching)

### 5.1 Content Standards (must pass all)
- **No profanity, explicit, or adult-only content.**
- **No unsafe, misleading, or non-cruise-related content.**
- **No political or culture‑war content.**
  - LGBTQ+ creators are welcome, but **content must stay on cruise topics** (no “why X is right/wrong” debates).
  - Prefer neutral-topic coverage when two videos are otherwise equal.
  - Veterans and autistic creators are welcome (fits disability topics).
- **No rights-restricted or age‑restricted videos.**
- Prefer videos ≤5 years old (except for retired/historical ships).
- Prefer clear audio, steady video, useful structure, and family‑friendly tone.

### 5.2 Source Lists & Controls
- **Green‑list manifests** (preferred): per‑ship JSON in `/assets/videos/`.
- **Master list**: `rc_ship_videos.json` until per-ship manifests are created.
- **Trusted channels**: `/data/registry/trusted_channels.json` → boost ranking.
- **Blocklist**: `/data/registry/video_blocklist.json` → exclude outright.

### 5.3 Fuzzy Matching (ship names & synonyms)
- Match any of the following patterns:
  - Full names: “Icon of the Seas”
  - Article forms: “the Icon”, “the Grandeur”
  - Abbreviations (secondary, not primary): “Icon OTS”, “Oasis OTS”, "RC Oasis", "RC's Oasis", "RCL Oasis", "RCCL Oasis", "Oasis" Near "Royal Caribbean".
  - Class + line references, where the ship is implied
- Category synonyms (examples, extensible in `video_synonyms.json`):
  - **Walkthrough**: ship tour, full tour, complete ship tour, walkthrough, “top to bottom”, "Deck by Deck".
  - **Cabins**: room, stateroom, suite, balcony, inside, oceanview, cabin tours
  - **Dining**: restaurants, venues, menus, food, buffet, specialty dining
  - **Entertainment**: shows, ice show, aqua theater, music, activities, nightlife
  - **Kids/Family**: kids club, Adventure Ocean, family activities, teen spaces
  - **Tips/Advice**: tips, hacks, advice, planning, mistakes, first-timer

### 5.4 Data Fields (for each video record)
```json
{
  "id": "YouTubeID",
  "title": "Exact video title",
  "channel": "Channel Name",
  "url": "https://www.youtube.com/watch?v=YouTubeID",
  "published": "YYYY-MM-DD",
  "categories": ["walkthrough","cabins","dining"],
  "ship": "icon-of-the-seas",
  "line": "royal-caribbean",
  "notes": "optional notes / reason selected",
  "flags": []
}
```

---

## 6) Ships Hub (`/ships/ships.html`)

1. **Sticky section nav** under header (pills): Royal Caribbean • MSC • (pre‑populate other line anchors based on `/cruise-lines/*.html` with “Coming soon” cards).
2. **Cards per cruise line**:
   - Royal Caribbean: grid of ship cards (modern + “Historical Ships” sub‑section).
   - MSC: grid with `MSC World America` (and others as added).
3. **Ship Cards**:
   - Thumbnail: `/ships/assets/{ship-slug}1.jpg` (fallback if missing).
   - Title: “Ship Name →”
   - Small badges (optional): “New”, “Historical”, “Oasis Class”, etc.
   - Entire card is a link to the ship page.
4. **Historical Ships**:
   - Separate sub‑grid. Start with Majesty of the Seas; include Sovereign/Monarch once added.

---

## 7) Technical Details & Includes

### 7.1 Head include (baseline)
- Use `<meta charset>`, viewport, title with version, canonical, description, OG/Twitter tags as in Section 3.1.
- Include `styles.css` via absolute URL + version query.

### 7.2 Images
- Place ship images in `/ships/assets/` with the naming convention.
- Use meaningful `alt` text. For decorative UI elements (compass), `alt=""`.

### 7.3 Anchors & Sticky Offset
- All section headings that are link targets must have an `id` and benefit from `scroll-margin-top` in CSS to sit below sticky navs.

### 7.4 Swiper (videos)
- Load Swiper via absolute CDN URLs in the ship page **head** (or before closing body).
- Initialize a basic Swiper with pagination and navigation buttons.
- Only render categories that have at least one video.
- All external video links `target="_blank" rel="noopener noreferrer"`.

---

## 8) Attribution Patterns

### 8.1 Your photos (required wording example)
> “Photo © Your Name. See more at FlickersofMajesty.com or on instagram: https://www.instagram.com/flickersofmajesty/.”

### 8.2 Wikimedia (example lines)
> “Photo by *Author Name*, *License Name* via Wikimedia Commons.”  
> Link **both** the file page and the license when feasible.

### 8.3 Video
> “Video: *Video Title* — *Channel Name*.” (link to video and channel)

---

## 9) Editorial Voice (Reality Filter)
- Objective, useful, curation‑first. Numbers are snapshots in time. Avoid hype.
- Family‑friendly; assume mixed audiences.
- Acknowledge uncertainty where it exists; prefer verified cross‑sources.
- Be concise in cards; expand in details/sections where appropriate.

---

## 10) QA Before Shipping (every file)

- [ ] **Deck Plans audit:** Each non-historical ship links to its official RC deck plans URL. Historical ships show the muted stub with no external link.


- [ ] **Order audit:** Highlights → grid(Deck+Tracker) → Logbook → First Look → Why Book → Crosslinks → Credits → Footer.
- [ ] **Grid audit:** Deck Plans + Live Tracker sit inside a single `<section class="grid-2">…</section>` immediately after Highlights.
- [ ] **Container audit:** New sections appear **above** Crosslinks/Attribution and **inside** the main content container (not after the footer).
- [ ] **Grandeur unchanged:** `/ships/grandeur-of-the-seas.html` not modified by automation.


- [ ] Version bump applied (except Grandeur).
- [ ] Absolute URLs everywhere (no relatives).
- [ ] Header/hero matches Grandeur; no duplicate compass or header CSS.
- [ ] Pill nav present & correctly ordered.
- [ ] Secondary pills (if used) sticky and anchors aligned.
- [ ] Cards render in a 2‑up (or responsive) grid, not stacked.
- [ ] Ship pages include: meta, 3+ images, blurb, video swiper, crosslinks, attribution.
- [ ] Video records pass content standards; green‑list only; fuzzy match applied.
- [ ] Crosslinks wired (ships, lines, restaurants, ports) based on registries.
- [ ] Attributions present (including your own images linking to your photo site).
- [ ] No orphan pages; diagnostics updated in `/data/reports/crosslinks_report.txt`.

---

## 11) Change Management

1. Make edits.  
2. Run link pass (crosslink new mentions).  
3. Update registries if you add anchors or new entities.  
4. Bump site version (except Grandeur).  
5. Validate that sticky nav/anchors behave correctly.  
6. Commit with message: `vX.XXX: <summary>`.  
7. Deploy and spot‑check pages (header, pills, cards, swiper, attributions).

---

## 12) Templates & Snippets

### 12.1 Meta (example)
```html
<title>Icon of the Seas — In the Wake (v2.201)</title>
<link rel="canonical" href="https://jsschrstrcks1.github.io/InTheWake/ships/icon-of-the-seas.html"/>
<meta name="description" content="Icon of the Seas at a glance — photos, dining, cabins, videos, and tips curated for clarity."/>

<meta property="og:type" content="website"/>
<meta property="og:title" content="Icon of the Seas — In the Wake"/>
<meta property="og:description" content="Photos, dining, cabins, videos, and tips."/>
<meta property="og:url" content="https://jsschrstrcks1.github.io/InTheWake/ships/icon-of-the-seas.html"/>
<meta property="og:image" content="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg"/>

<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Icon of the Seas — In the Wake"/>
<meta name="twitter:description" content="Photos, dining, cabins, videos, and tips."/>
<meta name="twitter:image" content="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg"/>
```

### 12.2 Ship image block (example)
```html
<section class="card" aria-labelledby="photos">
  <h2 id="photos">Photos</h2>
  <div class="grid-2">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas1.jpg" alt="Icon of the Seas exterior at sea" loading="lazy">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas2.jpg" alt="Icon of the Seas pool deck" loading="lazy">
    <img src="https://jsschrstrcks1.github.io/InTheWake/ships/assets/icon-of-the-seas3.jpg" alt="Icon of the Seas promenade" loading="lazy">
  </div>
</section>
```

### 12.3 Attribution block (example)
```html
<section class="card" aria-labelledby="credits">
  <h2 id="credits">Attribution & Credits</h2>
  <ul>
    <li>Photo © Ken Baker — <a href="http://www.flickersofmajesty.com/">Portfolio</a></li>
    <li>Photo via Wikimedia Commons — <a href="WIKI_FILE_URL">Author Name</a>, <a href="LICENSE_URL">License</a></li>
    <li>Video: <a href="YOUTUBE_URL">“Title”</a> — <a href="CHANNEL_URL">Channel Name</a></li>
  </ul>
</section>
```

---

## 13) Registries (JSON) — Shapes

### 13.1 `restaurants.json` (anchors)
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

### 13.2 `ports.json` (anchors)
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

### 13.3 `video_synonyms.json`
```json
{
  "walkthrough": ["walkthrough","ship tour","full tour","complete ship tour","top to bottom"],
  "cabins": ["cabin","stateroom","suite","balcony","inside","oceanview"],
  "dining": ["dining","restaurants","menus","food","buffet","specialty"],
  "entertainment": ["shows","ice show","aqua theater","music","activities","nightlife"],
  "kids": ["kids","family","teen","adventure ocean","nursery"],
  "tips": ["tips","hacks","advice","planning","mistakes","first-timer"]
}
```

### 13.4 `trusted_channels.json`
```json
["Royal Caribbean Blog","Gary Bembridge","Emma Cruises","Ben & David"]
```

### 13.5 `video_blocklist.json`
```json
["YOUTUBE_ID_TO_EXCLUDE","ANOTHER_BAD_ID"]
```

---

## 14) Orphan & Crosslink Diagnostics

- Generate `/data/reports/crosslinks_report.txt` with:
  - Files not linked from any hub/index.
  - Mentions of known entities that aren’t crosslinked.
  - 404 checks for absolute URLs.
- Fix or intentionally keep diagnostics (e.g., data files) and re-run.

---

## 15) Future‑Proofing

- Add cruise‑line pages for each file in `/cruise-lines/`; pre‑populate “Coming soon” cards on the Ships hub.
- Extend registries as new ships/restaurants/ports appear.
- Add per‑ship video manifests to `/assets/videos/` as pages mature.
- Maintain consistent versioning across the site; Grandeur remains owner‑managed.

---

**End of Standards v2.204+**
