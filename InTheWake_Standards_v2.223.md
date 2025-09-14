# In The Wake Standards (Full Expanded v2.223)

> Single source of truth for site structure, wiring, metadata, media, QA, and CI. **Additive-only evolution**: rules are never removed; they are only extended.

## Golden Reference
- **/ships/rcl/grandeur-of-the-seas.html** is the visual/structural gold standard. **Never edit that file.**
- All other ship pages must match Grandeur’s structure and conventions.

---

## 0) Principles
- **Single source of truth.** Code conforms to this document.
- **Deterministic output.** Rebuilders replace the entire `<main>` and footer blocks to guarantee correct order and content.
- **Absolute paths only.** All `href`/`src` must be absolute and point to the GitHub Pages host:  
  ✅ `https://jsschrstrcks1.github.io/InTheWake/ships/rcl/icon-of-the-seas.html`  
  ❌ `../ships/rcl/icon-of-the-seas.html`, `/ships/rcl/icon-of-the-seas.html`
- **Double-Check Mandate.** Every ship page changeset must pass CI checks in §7 before shipping.
- **Continuity.** Preserve prior fixes and conventions. **No regressions.**
- **Additive changes only.** New rules may be added; none may be deleted.

---

## 1) Global Rules (apply to every page)
### 1.1 Absolute URLs
All `href`/`src` must be absolute to `https://jsschrstrcks1.github.io/InTheWake/…` (adopted as gold from §1.1).

### 1.2 Single global stylesheet
- Use exactly one CSS for all layout/design:  
  **`https://jsschrstrcks1.github.io/InTheWake/assets/styles.css?v=2.223`**
- No inline `<style>` or page-level CSS. Style updates occur only in `styles.css` with a version bump.

### 1.3 Header/Hero (Grandeur pattern)
- Brand wordmark (left), **version badge `v2.223`**, pill nav, hero with lat/long grid, logo+tagline (center-bottom), **single** compass (top-right).
- No legacy banner text; hero grid tick styling matches Grandeur.

### 1.4 Primary pill navigation
Order (absolute links): **Home • Ships • Restaurants & Menus • Ports • Disability at Sea • Drink Packages • Packing Lists • Cruise Lines • Solo • Travel**.  
Class names/structure match `styles.css`. Links point to canonical absolute URLs (e.g., `/ships/ships.html`, `/cruise-lines/royal-caribbean.html`).

### 1.5 Sticky secondary nav (when used)
- Sticky, pill-based section nav directly below header; anchors have stable ids; CSS uses `scroll-margin-top`.

### 1.6 Versioning
- All updated pages (except Grandeur) show **v2.223** in `<title>` and a badge in the brand block.
- **Do not** change Grandeur’s version unless owner directs it.
- Site-wide version increments only when the owner explicitly requests.

### 1.7 Accessibility (a11y)
- Proper heading order `h1 → h2 → h3`.
- Add `role="img"` + `aria-label` on hero container; use `aria-labelledby` for cards.
- `alt=""` for decorative images (e.g., compass), descriptive `alt` for content images.
- Keyboard-accessible nav/accordions with visible focus.

### 1.8 Performance & SEO
- Optimized images (JPG preferred; PNG for transparency/line art). `loading="lazy"` for non-hero images.
- Canonical, OpenGraph, and Twitter meta set on content pages; 16:9 hero & OG images preferred.
- Each ship page includes: `<title>`, `<meta name="description">`, OG/Twitter equivalents, canonical, and **JSON-LD `CruiseShip`** schema.

### 1.9 Attribution (images + videos)
- **Required** at page bottom. 
- Own photos: link to photographer site.
- Third-party/Wikimedia: include creator, license, and source.
- Video credits: show title + channel (linked).
- **Copyright notice must include “all rights reserved.”**

### 1.10 No duplicate CSS/headers
- Use standardized header markup + shared CSS only.

---

## 2) Repository Layout & Conventions
```
/assets
  /brand/
  /videos/
  /images/
  styles.css
  /vendor/swiper/

 /cruise-lines/
   royal-caribbean.html
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

/ships/
  rcl/icon-of-the-seas.html
  rcl/wonder-of-the-seas.html
  rcl/legend-of-the-seas-1995.html  # Historical ship
  carnival/carnival-adventure.html
  ...
```

- **Required pages:** For every line/ship in `/data/registry/fleet_index.json`, pages must exist in `/cruise-lines/` and `/ships/`.
- **RCI coverage:** All 26 current ships, 7 former (“Historical Ship” badge), and 5 coming soon (placeholder pages).
- **Deprecated:** `/lines/` is replaced by `/cruise-lines/`.

---

## 3) Carnival & RCI Rules (additive)
- Create `/ships/carnival/` for all Carnival fleet pages (present + historical + future placeholders).
- Create `/ships/rcl/` for Royal Caribbean; **/ships/rcl/grandeur-of-the-seas.html** remains untouchable.
- Deck plan links:
  - Carnival: `https://www.carnival.com/cruise-ships/[ship-slug]` (Deck Plans section or embedded PDF).
  - Royal: use official `royalcaribbean.com` ship pages where available; otherwise link to primary registry page.

---

## 4) Media Rules (images & videos)
### 4.1 Images (≥ 3 per ship page)
- If local `/assets/*` (including `/assets/ships/` and `/ships/assets/`) lacks 3+ images, **attempt hotlinking** from Wikimedia Commons (and other permissive sources) **with attribution**.
- Prefer landscape 16:9 where possible; add `loading="lazy"` and descriptive `alt` text.

### 4.2 Videos (rich, curated)
- Sources: `data/video_sources.json`, `video_sources.json`, `ships/video_sources.json`.
- **Fuzzy search** the repositories using canonical ship names and **synonyms** from `/data/registry/video_synonyms.json`.
- Respect `/data/registry/trusted_channels.json` (whitelist preference) and `/data/registry/video_blocklist.json` (exclude).
- Categories to fill (when applicable): **Ship Tour**, **Cabins/Suites**, **Dining**, **Entertainment**, **Pools/Slides**, **Kids & Teens**, **Bars/Lounges**, **Tips/What to Know**.
- If any category is missing after repo search, **enqueue a YouTube search** (see §6.4) and select the **best-available** video (long-form, recent, reputable channel). If automated search is unavailable at runtime, flag the missing category in the compliance report.

---

## 5) “Historical Ship” & “Coming Soon”
- Past ships show a distinct **Historical Ship** badge near the title.
- Coming soon pages clearly state status and intended class/capacity with placeholders.

---

## 6) Guardrails & Determinism
### 6.1 Never overwrite without backup
- Any automated write must create a time-stamped backup under `/data/registry/_backups/` or `/ships/_backups/`.

### 6.2 Folder presence
- Every cruise line in `fleet_index.json` must have a subfolder under `/ships/{normalized-line-name}/`.

### 6.3 File presence (new rule)
- **Every ship in the fleet JSON must exist as `/ships/{line}/{ship}.html`.**  
  - Example: `grandeur-of-the-seas.html` → `/ships/rcl/grandeur-of-the-seas.html`.
  - If a file is missing, create it (standards-compliant placeholder).
  - If a folder is missing, create it **before** adding ships.

### 6.4 Video sourcing escalation (new rule)
- Compliance checks must try, in order:
  1) Exact match in the three `video_sources.json` locations.
  2) Fuzzy match using `video_synonyms.json` and historical/alternate names.
  3) If still missing, **YouTube search** (respect trusted/blocklist registries), then stage links for review with credits.

---

## 7) Compliance Checklist (automatable)
Checks per ship page (Green ✓ / Red ✗):
1. **Pathing:** File exists in `/ships/{line}/` and matches fleet JSON naming.
2. **Absolute URLs:** All `href`/`src` are absolute to GitHub Pages host.
3. **Header/Hero:** Matches Grandeur pattern (brand, pill nav, hero grid, single compass, version badge).
4. **Meta & Schema:** `<title>`, `<meta description>`, canonical, OG/Twitter, **JSON-LD CruiseShip**.
5. **Section Order:** Cards in canonical order: Overview → Deck Plans → Cabins → Dining → Bars → Entertainment → Pools → Kids & Teens → Itineraries → Tips → Photos → Videos.
6. **Duplication:** No duplicate cards/sections.
7. **Attribution:** Image/video credits present; copyright includes **“all rights reserved.”**
8. **Images:** ≥ 3 content images (not counting decorative assets).
9. **Videos:** Category coverage filled via repositories; gaps flagged and **YouTube search** enqueued if still missing.
10. **A11y:** Headings order, aria-labels, alt text, keyboard focus visible.
11. **Performance:** `loading="lazy"` on non-hero images; image formats optimized.
12. **Versioning:** v2.223 shown in `<title>` and version badge (except Grandeur).
13. **Deck Plans:** Links present and correct (official site preferred).
14. **Crosslinks:** Cruise line/port/restaurant anchors resolve (per registries).

### Output of a Compliance Run
- **Ship-by-ship report:** `Cruise Line → Ship → [itemized checks with ✓/✗]`.
- If **>10 missing** ship files, **only 10** are created per run; remaining are queued for the next run.

---

## 8) RCI & Carnival Coverage Mandate
- RCI: Ensure all listed current, former (incl. both **Legend of the Seas** entries), and coming soon ships exist and comply.
- Carnival: Ensure all present + historical + future placeholders exist in `/ships/carnival/` with deck-plan links per rule.

---

## 9) Legal
- Footer must include site copyright text ending with **“all rights reserved.”**
- Respect all 3rd‑party licenses and attributions.

---

*This document supersedes prior summaries by addition only; earlier rules remain in force.*