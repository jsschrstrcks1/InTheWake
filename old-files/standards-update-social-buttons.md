---
title: "standards update - social buttons.rtf"
source_file: "standards update - social buttons.rtf"
generated: "2025-10-17T13:14:34.195197Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

Helvetica;
;;

irnatural
tightenfactor0

# In the Wake \'97 Frontend Standards v3.002 (Changelog)\
\
**Release Date:** 2025-10-10  \
**Applies To:** All public pages (HTML), shared JS/CSS utilities\
\
---\
\
## What\'92s new in v3.002\
\
### 1) Absolute-URL Normalizer (Origin Safety)\
- Ensures all same-site absolute links (a/img/link/script) are rewritten to the current `location.origin`.\
- Helps staging, www/non-www, and CDN/front-door mismatches.\
- Hooked on `DOMContentLoaded` (once).\
\
### 2) External Link Hardening\
- Global capture listener upgrades off-site links to `target="_blank"` + `rel="noopener"` automatically.\
- Avoids duplicate authoring and protects against `window.opener` abuse.\
\
### 3) Service Worker & SiteCache Guard\
- SW registered on `load`; failures are noop.\
- `ensureSiteCache()` defends against Safari defer races (loads `/assets/js/site-cache.js` if missing).\
- Graceful warmup calls added where appropriate.\
\
### 4) Universal Floating Share Bar\
- File: `/assets/js/share-bar.js` (right-aligned, safe-area aware, a11y).\
- Fade + gentle slide in after scroll; honors reduced-motion.\
- Channels: X (Twitter), Facebook, Instagram (Copy Link), WhatsApp, WeChat (QR modal).\
- Keyboard navigable; modal includes focus trap & ESC to close.\
\
### 5) Accessibility Upgrades\
- Page-level **Skip to main content** link.\
- Consistent focus outlines (`:focus-visible`) and reduced-motion guard.\
- Forced-colors fallbacks where needed.\
- ARIA labeling for navs, regions, and live regions used on status text and utility notes.\
\
### 6) Metadata Consistency\
- Canonical URL per page.\
- Open Graph + Twitter cards (title/description/image).\
- Page version surfaced in `<meta name="version">` and visible UI badge.\
\
### 7) Responsive Grid Baseline\
- 3-up responsive grid utilities:\
  - 1 col < 680px, 2 cols < 1024px, 3 cols  1024px.\
- Cards use equal-height flex columns.\
\
### 8) Safe Preload\
- Preload tiny common assets (e.g., `compass_rose.svg`) to improve first interaction.\
\
### 9) Defensive DOM Writes\
- Where lists are painted (e.g., venues), content is batched via `<template>` + `appendChild` to reduce reflow/AT churn.\
\
---\
\
## How to adopt on a page\
\
1. **Head**\
   - Include analytics, `absolute-URL normalizer` script, SW register, canonical, OG/Twitter, `styles.css?v=3.002`, preload small assets.\
2. **Body (top)**\
   - Add the **Skip link**.\
3. **Footer / Bottom**\
   - Include `/assets/js/share-bar.js` (defer).\
   - Optional warmup (`SiteCache` ensure + light fetches).\
4. **A11y**\
   - Use labeled navs/regions, ensure headings are in order, avoid duplicate elements (e.g., hero credits).\
\
---\
\
## Versioning\
- Bump query string on shared CSS/JS to `?v=3.002`.\
- Reflect version in `<title>` and visible `ver` badge where present.
