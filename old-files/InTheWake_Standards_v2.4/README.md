# In the Wake — Site Standards v2.4
Generated: 2025-10-04T21:45:59.798791Z

This bundle contains modular, copy‑pasteable standards for **In the Wake**.  
They are written so that *any* page generator (even very literal ones) can produce a functioning, consistent page.

## What’s inside
- **root-standards.md** — Global rules (paths, analytics, canonicalization, CORS‑safe fetch)
- **main-standards.md** — Head/meta/SEO, assets, Swiper loading, accessibility
- **ships-standards.md** — Ship page schema + required sections + JSON contracts
- **cruise-lines-standards.md** — Cruise line landing/index pages
- **changelog.md** — v2.3 → v2.4 changes
- **examples/** — Minimal HTML scaffolds ready to duplicate
  - `examples/ships/rcl/template.html` — Ship page
  - `examples/cruise-lines/template.html` — Cruise line index page

## Quick start
1) Copy a template from **examples/** to your target path.
2) Replace placeholders: `__SHIP_NAME__`, `__SHIP_SLUG__`, `__CLASS_NAME__`, `__VERSION__`, etc.
3) Ensure JSON data files exist at the paths referenced in the template (see comments inside the file).
4) Commit and push. GitHub Pages will serve with correct canonical, absolute URLs, analytics, and fallbacks.
