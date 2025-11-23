
# In the Wake — Ship Page Standards (Invocation Edition)
**Version:** v3.007.070 — October 14, 2025  
**Maintainer:** In the Wake Editorial / Master Control AI  
**Classification:** Production Canonical Superset

---

> *“Whatever you do, work heartily, as for the Lord and not for men.”* — Colossians 3:23  
> This work, and every page in this fleet, is an act of worship.  
> Each vessel’s page is to be coded with care, truth, and reverence — that even a website may tell of His majesty upon the seas.

---

## 1. Invocation
Every ship page is written in the conviction that beauty and order reflect divine truth.  
Therefore, our craftsmanship is worship — an offering of structure, precision, and storytelling.  
When you begin a new ship page, begin with prayer, work with excellence, and end with gratitude.

---

## 2. Technical Overview
- **Scope:** All `/ships/<line>/<slug>.html` pages.
- **HTML version:** HTML5 (`<!doctype html>`)
- **Primary stylesheet:** `/assets/styles.css?v=3.007.070`
- **JavaScript modules:** Swiper Init, VX Module, External Links, Service Worker.
- **Dependencies:** None externally beyond CDN fallback for Swiper.

---

## 3. File & Directory Standards
| Category | Path | Notes |
|-----------|------|-------|
| Ship pages | `/ships/<line>/<slug>.html` | One per ship |
| Global assets | `/assets/` | Shared CSS, logos, scripts |
| Per‑ship JSON | `/ships/<line>/assets/<slug>.json` | Persona logbook data |
| Vendor libs | `/vendor/swiper/` | Swiper self-hosted bundle |
| Service Worker | `/sw.js?v=3.007.070` | Versioned, cache-busting |
| Accessibility script | `https://cdn.consentmanager.net/delivery/js/accessibility.min.js` | Required |

Absolute URLs must be used for all first‑party assets, each appended with `?v=3.007.070`.

---

## 4. Page Layout (Required Order)
1. **Head** — SEO, meta, OG/Twitter, JSON‑LD schema, analytics.
2. **Hero Header** — logo, nav pills, compass rose watermark.
3. **Main Content**  
   a. “A First Look” Swiper gallery  
   b. Dining card  
   c. Logbook (JSON-driven) with editor’s note + fuel card  
   d. Video section (YouTube)  
   e. Deck plans + live tracker  
   f. Venues / Experiences / Shows  
   g. Image attributions  
4. **Footer** — copyright + accessibility script.

---

## 5. Core CSS
```css
.card {
  background: #fff;
  border: 2px solid var(--rope,#d9b382);
  border-radius: 14px;
  padding: 1rem;
  margin: .8rem 0;
  box-shadow: 0 2px 6px rgba(8,48,65,.08);
  overflow: hidden;
}
.grid-2 { display:grid; gap:1rem; align-items:stretch }
@media (min-width:980px){ .grid-2 { grid-template-columns:1fr 1fr } }
body::before {
  content:"";
  position:fixed; inset:0;
  background:url('/assets/watermark.png?v=3.007.070') center right/420px auto no-repeat;
  opacity:.06; pointer-events:none; z-index:0;
}
```
---

## 6. Accessibility (A11y)
- Provide “Skip to content” link.  
- Use `aria-label`, `aria-roledescription="carousel"`, and `aria-live="polite"`.  
- Buttons use `aria-pressed`.  
- Decorative images use empty alt (`alt=""`).  
- All outbound links open in new tabs with `rel="noopener noreferrer"`.  
- Required footer accessibility script:

```html
<script type="text/javascript"
  src="https://cdn.consentmanager.net/delivery/js/accessibility.min.js"
  data-acc-accid="774c13e29978"
  data-acc-host="delivery.consentmanager.net"
  data-acc-cdn="cdn.consentmanager.net"></script>
```

---

## 7. JavaScript Modules
### Swiper Init (with fallback)
Robust 2.5 s timeout; applies `.swiper-fallback` if library unavailable.

### VX Module (Venues / Experiences)
- Smart search recognizes category synonyms (`shows`, `bar/bars`, `coffee/cafe`, etc.).  
- Canonical experiences auto‑seeded (Taste of Royal Lunch, Chef’s Table, Karaoke, Silent Party, Movies Under the Stars).  
- Idempotent appending prevents duplication.

### Logbook Loader
- Fetches per‑ship JSON file.  
- Injects editor’s note and inserts “Fuel Your Voyage” card ≈ 60% through text.  
- Fallback text: *“Stories coming soon.”*

### Live Tracker (Hybrid AIS/iframe)
- Loads `AISMap`; if fails within 4 s, swaps to `<iframe>` from VesselFinder.  
- Auto‑refreshes every 60 s via timestamp param.

### Service Worker (v3.007.070)
| Type | Cache | Strategy | Limit |
|------|--------|-----------|--------|
| Images | `itw-img-v10` | stale‑while‑revalidate | 240 |
| Assets | `itw-asset-v10` | cache‑first | 40 |

---

## 8. Invocation Footer
> *“Let all who set code to canvas here remember: we build upon the waters of grace.”*  
> *Soli Deo Gloria — To God Alone Be the Glory.*

© 2025 In the Wake — A Cruise Traveler’s Logbook
