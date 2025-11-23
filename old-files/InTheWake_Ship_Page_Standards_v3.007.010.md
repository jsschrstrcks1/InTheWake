# In the Wake — Ship Page Standards (v3.007.010, Superset)

> Invocation (required, hidden):  
> Place this exact HTML comment at the very top of every ship page (first line, before `<!doctype html>`):
>
> ```html
> <!-- Invocation: This page is an act of worship of God — may all we ship be true, beautiful, and helpful. -->
> ```
>
> Keep it exactly as-is (spelling and punctuation), single line.

---

## 0. Versioning & Page Identity
- **Version tag**: Set `<meta name="version" content="3.007.010"/>` and surface a small `.version-badge` in the navbar.
- **Title pattern**: `{Ship Name} — Deck Plans, Live Tracker, Dining & Videos | In the Wake`.
- **Canonical**: `/ships/{line}/{slug}.html`.
- **Robots**: `index, follow`.
- **Referrer**: `no-referrer`.
- **Theme color**: `#0e6e8e` via `<meta name="theme-color">`.

## 1. Invocation & Ethics
- Include the exact **Invocation comment** (above) in the source of every page.
- Pages should remain helpful, kind, and accurate. Avoid speculation and unsafe tips.

## 2. Structure & Order
- Preserve semantic order and existing ARIA labelling. Major sections:
  1. **Hero header** (logo, tagline, credit).
  2. **Row 1**: *A First Look* (carousel + stats) and **Dining** card.
  3. **Logbook** (JSON-driven), with the Editor’s pill and the 60% “Fuel Your Voyage” card injection.
  4. **Videos** (YouTube-nocookie embeds; Swiper).
  5. **Deck Plans** + **Live Tracker** (VesselFinder hybrid).
  6. **Related** (sister ships, classes).
  7. **Venues, Experiences & Shows** (search + chips + JSON augmentation).
  8. **Image Attributions**.
  9. **Footer**.
- **Hero watermark** and visual treatment unchanged.

## 3. Paths
- Detail pages: `/ships/{line}/{slug}.html`.
- Hub: `/ships/ships.html` (preserve new naming and order).

## 4. Data & Caching
- **Stats**: Prefer on-page fallback JSON (`#ship-stats-fallback`) and render immediately; future progressive enhancement can pull from fleet indices.
- **Venues/Experiences**: Base HTML cards + augment from embedded JSON `#entertainment-data` when present.
- **Videos**: Embedded JSON `<script type="application/json" id="videos-data">` → render.
- **Service Worker** handles assets caching; still explicitly set `loading="lazy"` for non-hero images.
- **Hidden rule**: Keep this section minimal in UI; full details live in source and standards docs.

## 5. Image Discovery (deprecated/kept quietly documented)
- *Deprecated behavior*: hiding ships with no discoverable images from grids. We preserve the **documentation** for historical context, but do **not** enforce it in UI by default.
- Historically preferred dirs: `/assets/ships/thumbs/` (pre-sized), fallback `/assets/ships/`, `/assets/`, `/images/`, `/ships/`, `/ships/assets/`, `/ships/{line}/images/`. Filenames: `{slug}.{jpg|jpeg|png}` or `{slug}1..3` variations.
- Retain this note only in **source** and **standards** (not UI).

## 6. Accessibility
- “Skip to content” link is required.
- ARIA: Keep `aria-label`, `aria-labelledby`, `role` attributes. Carousels use `aria-roledescription="carousel"`.
- Images: specific, non-duplicative `alt` text. Decorative images use empty `alt`.
- Buttons/links: maintain focus outlines and `aria-pressed` on chips.
- Keyboard: left/right arrows for logbook navigation.

## 7. Performance
- **Preconnect**: `googletagmanager.com`, `cloud.umami.is`, `youtube-nocookie.com`, `i.ytimg.com`, `vesselfinder.com`, `cdn.consentmanager.net`.
- **Preload**: key hero art + compass rose.
- **Lazy**: all non-critical images and iframes.
- **JS fallback**: self-hosted Swiper with jsDelivr fallback.

## 8. Analytics / Privacy
- Google tag (gtag.js) async load.
- Umami script defer.
- External links auto-upgraded to `target="_blank"` + `rel="noopener noreferrer"`.

## 9. SEO / Schema
- Organization, WebSite (with SearchAction), WebPage, Review, BreadcrumbList.
- OG/Twitter complete. `summary_large_image` card.

## 10. Logbook
- JSON source: `/ships/{line}/assets/{slug}.json` (or embedded).
- Default persona is `p0-ken` when present, else index `0`.
- Inject **Editor’s note** pill if `editor_note` absent.
- **Fuel card** injected around ~60% of paragraphs for entries with ≥3 paragraphs.
- **Navigation**: “Port/Starboard” wired via persona `nav_port`/`nav_starboard`.

### 10.a Persona JSON shape
```json
{
  "ship_name": "Grandeur of the Seas",
  "nights_stood_watch": 12,
  "editor_note": "Optional prewritten disclosure.",
  "personas": [
    {
      "id": "p0-ken",
      "title": "Ken — Sea Day Notes",
      "persona_label": "Ken (Editor)",
      "markdown": "## Sea Day\nWoke before dawn...",
      "nav_port":    { "label": "◀ Port", "target_persona_id": "pN-prev" },
      "nav_starboard": { "label": "Starboard ▶", "target_persona_id": "pN-next" }
    }
  ]
}
```

## 11. Venues, Experiences & Shows — Search & Filter (Repaired)
The **typed search** now understands category words and synonyms, not just literal names.  
- Typing **“shows”** matches any card tagged `shows` (even if the word *show* isn’t in the title).  
- Typing **“experiences”** or **“xperiences”** pulls Experience items (e.g., **Taste of Royal Lunch**, **Ship Tours**).  
- Typing **“bar”**, **“coffee”**, **“spa”**, **“kids”**, **“adults”**, **“music”**, **“included”**, **“specialty”** matches respective tags.  
- Plural forms are normalized (e.g., `shows` → `show` → `shows` tag).  
- Multiple terms combine (logical AND for text, OR for categories).

### 11.a Tagging rules
- Venue cards must include a `data-tags` attribute with space-delimited tags, e.g.:
  - `data-tags="venue included main-dining"`
  - `data-tags="experience shows music adults"`
- Experiences added from JSON default to `data-tags="experience"` plus specific sub-tags supplied by JSON (e.g., `shows`, `music`, `adults`).

## 12. Videos
- Use `youtube-nocookie.com` embeds, `loading="lazy"`, and unique titles.
- De-dup on `youtube_id`.

## 13. Live Tracker
- Hybrid **VesselFinder**: try AISMap first; fallback to details iframe.
- Auto-refresh iframe every 60s with `t=` cache-busting param.

## 14. Swiper
- Self-hosted Swiper CSS/JS, fallback to jsDelivr.
- Add `html.swiper-fallback` if initialization throws.

## 15. External Links Upgrade
- Convert off-site links to `target="_blank"` and `rel="noopener noreferrer"` post-load.
