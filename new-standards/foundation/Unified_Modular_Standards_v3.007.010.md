# In the Wake — Unified Modular Standards (Superset v3.007.010)

> **Version Lineage:** v2.233 → v2.245 → v2.256(.003/.022) → v2.4 → v2.257 → v3.001 → v3.002 → v3.003 → **v3.007.010**  
> **Merge Policy (Golden Merge):** Newer wins · Additive only · No regressions · Explicit supersession notes  
> **Canonical Host:** https://www.cruisinginthewake.com/

This superset integrates the Perplexity modular taxonomy, the historical v2.4 bundle, and the **Frontend Standards v3.007.010 (Grandeur template baseline)**. It is the single source of truth for structure, contracts, accessibility, performance, PWA, JSON‑LD, and CI.

---

## 0) Overview & Governance

- **Purpose:** Prevent drift across modules and generators; guarantee deterministic, standards‑compliant pages.  
- **Scope:** All HTML/JSON/CSS/JS under the In the Wake project.  
- **Semver-ish:** Use the site version consistently in `<meta name="version">`, visible badge (optional), and `?v=` query for assets.

**Contracts not to rename without migration:** `.card`, `.pills`, `.pill-nav`, `.grid-2`, `.visually-hidden-focusable`, `.hidden`, `.swiper.*`, `.voyage-tips`, `.prose`, `#vx-grid .vx`.

---

## 00-Core (Perplexity-aligned)

### 00.1 EVERY-PAGE_STANDARDS.md (Universal Checklist)
- Exactly one `<h1>` (may be visually hidden but programmatically reachable).  
- Landmarks: `<header>`, `<main id="content" tabindex="-1">`, `<footer>`.  
- **Skip link** to `#content` using `.visually-hidden-focusable`.  
- Absolute URLs only; `_abs()` available before any fetch/linking.  
- Versioned assets `?v=__VERSION__`.  
- Watermark background with low opacity (.06–.08).  
- Persona disclosure pill when first‑person narrative is present.  
- Referrer policy: `<meta name="referrer" content="no-referrer">`.

### 00.2 HEAD_SNIPPET.html (Canonical Head Insert)
Order:
1) `<!doctype html>` + `<html lang="en">`  
2) `<meta charset="utf-8">`  
3) `<meta name="viewport"...>`  
4) **Analytics** (Google tag async; Umami defer)  
5) **_abs() helper** and **canonicalization (apex→www)**  
6) `<title>`, description, robots, theme-color, **version**  
7) Canonical + OG/Twitter meta  
8) CSS bundle + Swiper loader (self‑hosted with CDN fallback)  
9) Optional preconnects/preloads that the page actually needs (LCP image, YouTube‑nocookie, i.ytimg.com, VesselFinder, ConsentManager)

### 00.3 FOOTER_SNIPPET.html (Canonical Footer Insert)
- Cache pre‑warm via `SiteCache.getJSON()` (fleet, venues, personas, videos).  
- Service worker registration (`/sw.js?v=__VERSION__`) with fail‑safe.  
- Hidden doxology comment injection (see 00.4).

### 00.4 HIDDEN_INVOCATION_COMMENTS.html
Embed, near `</html>`:
```html
<!-- Soli Deo Gloria — Every pixel and part of this project is offered as worship to God, in gratitude for the beautiful things He has created for us to enjoy. -->
```
(Use the visible banner per §05‑Brand.)

### 00.5 SEO_STRUCTURED_DATA.md + JSONLD_TEMPLATES/
- Provide Organization, WebSite+SearchAction, WebPage, BreadcrumbList, and one **Review** block (ratingValue numeric).  
- Supply copy‑paste templates in `/standards/00-core/JSONLD_TEMPLATES/`.

---

## 01-Index-Hub

### 01.1 INDEX-HUB_STANDARDS.md
- Unifies hub/index rules for: `/index.html`, `/ships/index.html`, `/restaurants.html`, ports, etc.  
- Search input normalizes against `venues.json` and fleet index.  
- 3‑up grid with proper breakpoints; keyboard‑navigable filters (chips).

### 01.2 SHIPS-INDEX_STANDARDS.md
- Fallback JSON sources, image gating and discovery order, hide entries without discoverable media.

### 01.3 scripts/fleet-cards.js
- Reference implementation for ship card rendering, caching, and fallback behavior.

---

## 02-Ship-Page

### 02.1 SHIP-PAGE_STANDARDS.md (v3.001+)
- Section order: **Hero → First Look → Stats → Dining → Logbook → Videos → Deck Plans → Live Tracker → Related → Attribution**.  
- JSON via `SiteCache.getJSON()` with TTL + version invalidation.  
- Image discovery: `/assets/ships/thumbs/` → `/assets/ships/` → `/assets/` → `/images/`. Randomized thumbnail selection; hide empty entries.

### 02.2 SWIPER_STANDARDS.md
- Self‑hosted assets under `/vendor/swiper/` with jsDelivr fallback; a11y enabled; `html.swiper-fallback` CSS pathway if library fails.  
- Carousels with `aria-roledescription="carousel"` and labelled headings.

### 02.3 VIDEO-SOURCES_STANDARDS.md
- Normalize YouTube IDs from `youtube_id|url|embed_url`; dedupe by ID; nocookie embeds; lazy iframes.  

### 02.4 DINING-CARD_STANDARDS.md
- Truth‑data fetch from `venues.json`, support aliases, and deep‑link variants with stable anchors.

---

## 03-Data

### 03.1 GOLDEN-MERGE_SPEC.md
- Newer wins; additive; explicit supersession; never destructive.  
- JSON contracts version‑tagged and checksum‑audited.

### 03.2 DATA-SCHEMAS.md
- Defines `fleet_index.json`, `venues.json`, `personas.json`, `rc_ship_videos.json` field maps.  
- JSON Schema fragments provided in §18.

---

## 04-Automation

### 04.1 CADENCE_STANDARDS.md
- **Daily** CI check (DOM fingerprint, SEO/A11y audit, JSON contracts).  
- **Weekly** manual re‑audit.  
- **Monthly** license/attribution verification.  
- PWA manifest and SW cache key bump verification.

---

## 05-Brand

### 05.1 TONE-AND-ETHOS.md
- Reverent, truthful, unhurried; comfort, convict, recalibrate. Avoid sensationalism. Tie to Logbook Personas tone.

### 05.2 INVOCATION-BANNER.md
- Visible footer invocation text required on every page. Place above closing wrapper; keep tiny, centered.  
- Must match the wording noted in 00.4 (visible vs hidden usage).

---

## 06-Legal Attribution

### 06.1 ATTRIBUTION_STANDARDS.md
- Proper credits, outbound links, license markers, and alt‑text guidance.  
- “Lineups can change by sailing …” disclaimers where applicable.  
- Prefer ranges for prices with “last verified” date unless auto‑updated.

---

## 07-Analytics

### 07.1 ANALYTICS_STANDARDS.md
- Google tag async minimal init; Umami defer; consent tooling optional and non‑blocking.  
- No cookies beyond analytics defaults; never collect PII in URLs.

---

## 08-Root / Main (consolidated from v3.002)

- `_abs()` absolute URL helper and **Apex→www** canonicalization (session‑guarded).  
- Umami placed immediately after `viewport`.  
- Swiper loader with CDN fallback.  
- Referrer `no-referrer`.  
- Append `?v=` to all assets.  
- OG/Twitter parity with visible content.  
- LCP image `fetchpriority="high"`; supply width/height to prevent CLS.

---

## 09-Restaurants Hub (v2.256.022)

- `/restaurants.html` search + filter trays; tips card persisted in `localStorage`.  
- Uses `venues.json` → `search_dict.keywords`.  
- Keyboard navigable, visible focus states; lazy‑load thumbnails.

---

## 10-Venue Standards (v2.257)

- Canonical page `/restaurants/<slug>.html`; reciprocal links with ship pages.  
- Sections: Overview · Menu & Prices · Accommodations · Availability · Persona Review · Sources.  
- Allergen micro‑component (`role="note"`).  
- Price bands: Lunch $21–25; Dinner $39–65 (+18%) with disclaimer.  
- QA checklist and Lighthouse ≥ 90.

---

## 11-Logbook Personas (v2.257)

- Ten archetypes with disclosure rules; JSON contract `/assets/data/personas.json`.  
- Each logbook entry must include ≥1 persona label.

---

## 12-PWA Layer (v3.001→v3.002)

- `site-cache.js` (TTL + version invalidation, same‑origin).  
- `sw.js` image cache `itw-img-v4`.  
- `starter.html` demonstrates cache pre‑warm (fleet, venues, personas, videos) and SW registration.

---

## 13-Security & Privacy

- Enforce `rel="noopener noreferrer"` on external anchors (auto‑upgrade script).  
- Third‑party scripts `async`/`defer`.  
- Never embed PII in URLs or JSON‑LD.

---

## 14-Ship Enhancements (v3.007.010)

### 14.1 Absolute URL Normalizer (staging/CDN safety)
- Convert hard‑coded production URLs to current origin on `DOMContentLoaded`; expose `_abs(path)` globally.

### 14.2 Structured Data (JSON‑LD lineup)
- Required: Organization, WebSite+SearchAction, WebPage, BreadcrumbList, **one** Review (numeric ratingValue).  
- Recommended OG image: **1200×630**; must resolve 200.

### 14.3 Data Blocks & JSON Fallbacks
- **Ship Stats Fallback** inline `<script type="application/json">` + renderer.  
- **Videos Data** inline list or `videos:{...}` object; nocookie embeds; dedupe IDs.  
- **Logbook Personas** remote JSON at `_abs('/ships/<line>/assets/<slug>.json')` with minimal markdown renderer.

### 14.4 Entertainment / Venues / Bars
- Static HTML seed + JSON augmentation; cards carry `data-tags` for filtering.  
- Filter UI: `.chips.pill-nav.pills` with `aria-pressed` toggles; searchable via `#vx-search`.  
- Always show tiny disclaimer: lineup changes by sailing.

### 14.5 Live Tracker (Hybrid VesselFinder)
- Prefer AISMap; fallback to iframe details page; refresh iframe every 60s with cache‑busting `t=` param.

---

## 15-Accessibility Details

- Carousels: `aria-roledescription="carousel"`, labelled headings; Swiper a11y ON.  
- Live regions: logbook body `aria-live="polite"`.  
- Hero as `<img alt="">` or container with `role="img" aria-label=""`.  
- Chips/filters maintain `aria-pressed` and `.is-on`.  
- **Skip link** focusable and visible on focus.

---

## 16-Performance Requirements

- LCP image `fetchpriority="high"`; fixed aspect ratios for carousels; lazy‑load non‑critical images & iframes.  
- Version all local assets `?v=3.007.010`.  
- Avoid layout thrash; prevent CLS > 0.1.

---

## 17-QA Checklists

### 17.1 SEO/A11y
- [ ] One H1 (visible or hidden, but accessible).  
- [ ] Canonical points to production; OG/Twitter present; OG image 200+ and sized.  
- [ ] BreadcrumbList JSON‑LD and a single Review JSON‑LD (numeric rating).  
- [ ] Skip link moves focus to `#content`.  
- [ ] Chips/buttons use `aria-pressed` when toggled.

### 17.2 JS/CSS
- [ ] Swiper loads or `html.swiper-fallback` engages (no console red).  
- [ ] Videos carousel renders or shows fallback text.  
- [ ] Live tracker hybrid fallback working.  
- [ ] Entertainment JSON augments grid without duplicates.  
- [ ] External link upgrader runs; `mailto:` / `tel:` unaffected.  
- [ ] No mixed content on staging/CDN (URL normalizer works).

### 17.3 Perf
- [ ] Lighthouse CLS ≤ 0.10; LCP within target on cable‑3G internal bar.  
- [ ] Third‑party scripts async/defer; no render‑blocking CSS beyond critical.

---

## 18-JSON Schema Fragments (for CI)

Provide the schema snippets for: Ship Stats, Videos, Logbook Personas, Entertainment — as given in v3.007.010 (unchanged).

---

## 19-Reusable Snippets

### 19.1 Hero (accessible variant)
- Use `role="img"` and hide decorative assets with `aria-hidden="true"`. Include compass, grid overlay, and versioned assets.

### 19.2 Voyage Tips Card
- `.card.voyage-tips` block injected around 60% into logbook body with links to drink packages and packing lists.

---

## 20-Editor, Dev, QA Workflow Notes

- Editors: hero/gallery source ≥ 1920px; target < 350 KB when possible.  
- Devs: when cloning a page, update canonical URL, title/description, hero paths, `data-imo`, stats fallback JSON, videos JSON, OG fields, and asset versions.  
- QA: use §17 checklist + Rich Results Test for JSON‑LD.

---

## Appendix A — Examples (v2.4 historical)
- `/examples/ships/rcl/template.html`  
- `/examples/cruise-lines/template.html`

## Appendix B — Change Ledger (Δ v3.003 → v3.007.010)

| Area | Change |
|------|--------|
| Versioning | Bumped baseline to **v3.007.010** (Grandeur template). |
| Head/Foot | Added canonical HEAD and FOOTER includes; expanded preconnect/preload guidance. |
| JSON‑LD | Added complete structured data lineup + templates and rules. |
| URL Safety | Introduced absolute URL normalizer for staging/CDN. |
| Security | External link hardening enforced globally. |
| Entertainment | New venues/bars/entertainment spec with filter UI contract and JSON augmentation. |
| Live Tracker | Hybrid VesselFinder logic (AISMap with resilient iframe fallback). |
| Schemas | Added JSON Schema fragments for Ship Stats, Videos, Personas, Entertainment. |
| QA | Expanded checklists for SEO/A11y/JS/Perf. |

---
**End of Superset v3.007.010**
