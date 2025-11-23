---
title: "Index/Home Superset Standard v3.007.home"
module: "root-home"
generated: "2025-10-17T13:14:34.198081"
precedence:
  - "STANDARDS_ADDENDUM__CACHING_v3.007.md (wins on conflicts re: caching/versioned assets)"
  - "Root/Main Standards (absolute URLs, watermark, hero compass, pills)"
  - "Ship-derived behaviors (a11y, external-link hardening) – portable only"
  - "Dining/Venue privacy addition: meta referrer = no-referrer"
---

# Index/Home Superset Standard (v3.007.home)

## Scope
Applies to `/index.html` (homepage). Built from all uploaded standards and prior merges. Newer addenda win where conflicts exist; otherwise, rules are additive.

## Canonical & URL Discipline
- Absolute URLs only for links, assets, and scripts.
- Canonical must point to **https://www.cruisinginthewake.com/**.
- Include a safe, non-looping **force-WWW** helper (HTTPS only).

## Head / Metadata
- Required meta: charset, viewport, robots, theme-color, description.
- Privacy: `<meta name="referrer" content="no-referrer">`.
- Page version: `<meta name="version" content="3.007.home.###">` (bump on edits).
- OG/Twitter: set image to the home hero; keep proper dimensions.
- Load `/assets/styles.css?v=3.0` (global bundle), plus any per-page CSS with `?v=`.

## Accessibility
- Provide a top-of-page **Skip to content** link.
- Ensure visible focus, semantic headings (single H1), alt text on images.
- Include the footer **accessibility** script (consentmanager) site-wide.

## Brand Elements
- Maintain the **watermark** (fixed, low opacity) and single **hero compass**.
- Preserve **pills** navigation: single row on desktop, scrollable on mobile.

## Caching Model (v3.007 Addendum)
- In `<head>`: `<script src="/assets/js/site-cache.js" defer></script>`.
- Footer warm-up: seed core JSON (fleet, venues, personas, videos) via app cache.
- Service Worker: register `/sw.js` at footer; images = stale-while-revalidate.
- **Do not** cache JSON via SW; keep JSON in the app-level cache with TTL.
- Add **SEED_PRECACHE** footer snippet (and optional sitemap idle seeding).

## External Link Hardening
- On DOMContentLoaded, upgrade off-origin anchors to `target="_blank"` and `rel="noopener noreferrer"`.

## Right-Rail Article Feed
- Place a `.card` aside to the right of the Welcome Aboard card at desktop.
- Accessibility: container `role="feed"`, each item `role="article"`.
- Data: fetch same-origin JSON using `SiteCache.getJSON` (TTL 30–60 min).
- Performance: text-first by default; if using thumbnails, lazy-load and reserve aspect.
- If teaser text includes prices, append price disclaimer language.

## Structured Data
- Include JSON-LD: Organization + WebSite + minimal WebPage for the homepage.

## QA / CI
- Absolute URLs validated; canonical resolves 200.
- site-cache.js present; warm-up and SW registered; JSON kept out of SW.
- Hero marked as LCP (use `fetchpriority="high"` where applicable).
- External links hardened; accessibility footer script present.


