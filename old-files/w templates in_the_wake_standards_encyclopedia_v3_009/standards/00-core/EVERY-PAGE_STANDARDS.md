# EVERY-PAGE_STANDARDS.md (v3.009)

This universal checklist applies to **every page** on cruisinginthewake.com and mirrors the v3.001+ superset with v3.009 CI addenda.

## Meta & Versioning
- `<meta name="page:version" content="vX.YYY.ZZZ">` present and matches **all** `?v=` querystrings.
- `<meta name="version" content="vX.YYY.ZZZ">` present and matches `page:version`.
- `<meta name="standards:baseline" content="3.008">` (or newer) when applicable.
- `<meta name="referrer" content="no-referrer">`.
- `<meta name="theme-color" content="#083041">` (brand navy).

## Head Order (required)
1. `<!doctype html>` + `<html lang="en">`
2. `<meta charset="utf-8">`
3. `<meta name="viewport" content="width=device-width, initial-scale=1">`
4. **Umami analytics** (immediately after viewport)
5. `_abs()` helper
6. Canonicalization script (apex → www, session-guarded)
7. `<title>__PAGE_TITLE__ — In the Wake (v__VERSION__)</title>`
8. Canonical `<link rel="canonical">` absolute URL
9. Description meta (≤160 chars)
10. OG/Twitter metas (absolute URLs)
11. Site CSS: `/_abs('/assets/styles.css?v=__VERSION__')`

## Accessibility
- Visible **Skip to main content** link in `.topbar` (or equivalent).
- Keyboard reachable nav with ARIA contracts; dropdowns use button + menu roles.
- Focus styles visible, color contrast ≥AA (text 4.5:1, large text 3:1).
- All non-hero images `loading="lazy"`; decorative images `alt=""` + `aria-hidden="true"`.

## Layout & Overflow
- No `100vw` in header/hero containers (use `width:100%`).
- `html, body { overflow-x:hidden }` to guard sub-pixel scroll bleed.
- At ≥980px, pages with rails render two-column grid; rail is sticky right.

## Fetch & Caching
- Only same-origin fetches; use `_abs()`; append `?v={page:version}`.
- Service Worker registered; update prompt on new build.

## SEO
- Unique title & meta description; canonical link set.
- OG/Twitter complete set; images absolute.
- JSON-LD present where applicable (Article/WebPage/CollectionPage).

## CI / QA
- Playwright nav tests pass (dropdown contract & keyboardability).
- Schema validation passes for `/data/authors.json` when used.
- Version-coupling check passes (every `?v=` == `page:version`).
- Lighthouse CI Accessibility ≥95.
