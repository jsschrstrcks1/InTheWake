---
title: "EVERY-PAGE_STANDARDS.md"
source_file: "EVERY-PAGE_STANDARDS.md"
generated: "2025-10-17T13:14:33.914481Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# Every Page Standards — v3.006

## Non‑negotiables (apply to **every** page)
- Canonical charset, viewport, title, description, canonical URL.
- Open Graph + Twitter summary_large_image.
- Versioned CSS/JS includes (e.g., `?v=3.006`).
- Invocation: include hidden HTML dedication (see `HIDDEN_INVOCATION_COMMENTS.html`) and place the invocation banner (optional per page type).
- CSS: Load global `styles.css` (unified tokens: `--sea`, `--foam`, `--rope`, `--ink`, `--sky`, `--accent`) and maintain the hero layout rules.
- Accessibility: `aria-label`s on carousels, regions, and maps; keyboardable nav.
- Service Worker: register `/sw.js` with scoped, image‑first caching (cache name versioned). Do not cache JSON by SW; app‑level site cache handles JSON with TTL.
- External link hygiene: `rel="noopener"` on `target="_blank"`; **do not** rewrite external attribution links.

## Head boilerplate
Use `HEAD_SNIPPET.html` verbatim, then add page‑specific tags.

## Footer
Use `FOOTER_SNIPPET.html` verbatim. Keep per‑page scripts `defer` where possible.

## Structured Data
Follow `SEO_STRUCTURED_DATA.md` and the templates in `00-core/JSONLD_TEMPLATES`.
