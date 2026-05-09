# Mobile Phase B — Hero Selector Narrowed

**Date:** 2026-05-09
**Branch:** `claude/improve-mobile-friendliness-W90DR`
**Scope:** `assets/styles.css:2453–2461` only.

## Change

Narrowed the over-broad selector in the `MOBILE HARDENING v1.000` block (line 2447 `@media (max-width: 480px)`):

```diff
-  .hero-header img,
-  .hero-ship img,
-  .hero img,
-  [class*="hero"] img {
-    max-height: 50vh;
-    width: 100%;
-    object-fit: cover;
-  }
+  .article-hero img,
+  .port-hero-image img,
+  .hero-ship img {
+    max-height: 50vh;
+  }
```

Removed `width: 100%` and `object-fit: cover` because each retained selector already declares its own values for those properties; setting them again risked changing aspect handling on `figure.hero img` (which uses `object-fit: contain`).

## Why

The old selector group matched 21 unintended images across the 8-page sample (BeautifulSoup census in `hero-selector-impact-2026-05-09.md`). The most visible casualties:

- `.hero-compass` (`/assets/compass_rose.svg`) blown up from 48 px to 100 % of viewport width — produced the giant ring overlapping content in the user's iPhone Pro Max screenshot.
- `.brand img` in `.navbar` (the small wordmark next to "V1.Beta") forced to viewport-width.
- `.hero-title .logo` overridden away from its `clamp(189px, 23.1vw, 378px)` size.

`[class*="hero"]` is a substring match — it caught any class containing the four-letter substring "hero" (`.hero-header`, `.hero-compass`, `.hero-title`, `.hero-credit`, `.article-hero`, `.port-hero`, `.hero-ship`, etc.). The retained three selectors are the actual content-hero image classes.

## Verification

### Validator (8-page sample)

```
Total: 8 | Pass: 8 | Fail: 0
Blocking: 0 | Warnings: 4 | Info: 0
```

Identical to baseline (warnings are pre-existing MOB-007 font-size flags, untouched by this change).

### Visual diff (Playwright, Chromium, iOS user-agent)

Captured at three viewports — 430 (iPhone Pro Max) / 390 (iPhone 15) / 360 (Galaxy S) — in `admin/audit-reports/screenshots/{before,after}/`.

Confirmed fixed:
- `home-430.png`, `home-390.png`, `home-360.png` — compass ring gone, wordmark + hero logo render correctly.
- `calculator-430.png` — same fix path; hero is clean.

Confirmed unchanged (no regression):
- `port-430.png` — pixel-equivalent before/after.
- `ship-430.png`, `article-430.png`, `venue-430.png`, `tool-430.png` — visually unchanged.

### Known not-fixed (deferred to later phases)

- `home-*.png` — "A Cruise Traveler's Logbook" tagline still cut off behind the photo-credit pill. **Phase C, option 1 (wrap tagline + reposition pill).**
- `port-*.png` — `.page-grid` rail still shows side-by-side at 430 px instead of stacking. Pre-existing; **Phase E candidate.**

## Files changed

- `assets/styles.css` — 8 lines removed, 11 added (selector narrowed + comment).
- `admin/screenshot-mobile.mjs` — new helper for the before/after capture loop.
- `admin/audit-hero-selector.py` — new BeautifulSoup cross-check.
- `admin/audit-reports/hero-selector-impact-2026-05-09.md` — selector-impact census.
- `admin/audit-reports/screenshots/before/*.png`, `…/after/*.png` — 42 PNGs.

---

**Soli Deo Gloria.**
