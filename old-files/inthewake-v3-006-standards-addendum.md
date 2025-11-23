---
title: "InTheWake_v3.006_Standards_Addendum.txt"
source_file: "InTheWake_v3.006_Standards_Addendum.txt"
generated: "2025-10-17T13:14:34.195980Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# In the Wake — v3.006 Addendum (Superset Standards)

## Invocation (required in two places)
- MUST include the UTF-8 Invocation comment block at the very top of the file.
- MUST include a visible one-line invocation near the footer (exact text specified).
- Provide a canonical snippet in the standards so it’s copy/paste, not retyped.
```html
<!--
Soli Deo Gloria
All work on this project is offered as a gift to God.
“Trust in the LORD with all your heart, and do not lean on your own understanding.” — Proverbs 3:5
“Whatever you do, work heartily, as for the Lord and not for men.” — Colossians 3:23
-->
<footer class="tiny center">Soli Deo Gloria — All work on this project is offered to God.</footer>
```

## Canonical URLs (no GitHub in prod)
- MUST use absolute `https://www.cruisinginthewake.com/...` for all internal links and assets.
- MUST NOT use GitHub links except in the separate “staging” profile (and define what that profile is).

## Top Navigation Style
- MUST render the primary nav using `.pill-nav.pills` (not just `.nav`).
- Acceptable order: **brand → pills** within `.navbar`.
- `aria-current="page"` required on the active link.

## Search-First Layout
- MUST place the Search section before Classes/Ships.
- MUST use the shared `setupShipSearch(data)` hook only (no custom code).
- `window.SHIP_DATA` must use **absolute URLs** for each ship.
```js
window.SHIP_DATA = [
  { name: "Viking Star", url: "https://www.cruisinginthewake.com/ships/viking-star.html" }
];
```

## Single Hero / Single Compass Rule
- MUST include exactly one `.hero` and one `.hero-compass`.
- MUST NOT include extra compass roses elsewhere unless using the `page-watermark` component.

## “Every Page” Meta & Platform Bits
- MUST include:
  - `<meta name="page:version">` (matches title and .version-badge)
  - `<meta name="standards:baseline" content="3.006">`
  - OpenGraph & Twitter tags
  - JSON-LD (ItemList for listings)
  - Reduced-motion CSS guard
  - Service worker registration
```html
<meta property="og:title" content="Viking — In the Wake">
<meta property="og:url" content="https://www.cruisinginthewake.com/cruise-lines/viking.html">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": []
}
</script>
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js?v=3.006');
}
</script>
```

## Version Synchronization Rule
- On **v3.006 compliance update**, the following must all match:
  - Title `(v3.006)`
  - `<meta name="page:version" content="v3.006">`
  - `<meta name="standards:baseline" content="3.006">`
  - All cache-busting query params for global assets `?v=3.006`
  - Page-scoped assets `?v=v3.006`
- Audits fail if any mismatch occurs.

## Cache-Busting Rules
- Global (shared): `?v=3.006`
- Page-scoped: `?v=v3.006`
- No mixed-version cache busters on a page.
- Service Worker must key cache on the full versioned URL.

## Ship Page — MUST Checklist
- ✅ UTF-8 Invocation comment at top.
- ✅ Title + meta + .version-badge all match (v3.006).
- ✅ Canonical `<link>` and absolute URLs only.
- ✅ Pills nav present (`.pill-nav.pills`).
- ✅ Search-first layout with setupShipSearch.
- ✅ Single hero + single compass.
- ✅ OG/Twitter + JSON-LD present.
- ✅ Reduced-motion CSS guard present.
- ✅ Service worker registered.
- ✅ Visible footer invocation line.
- ✅ All versioned assets and cache busters correct.
- ✅ `standards:baseline=3.006` present.

Soli Deo Gloria.
