---
id: PERF-001
name: Hero image declares fetchpriority="high" and loads eagerly
family: perf
severity: warn
applies-to:
  - all
provenance: S-only
status: live
implementation: none
check: the largest-contentful-paint candidate image (hero-classed or first in-viewport img) has fetchpriority="high" AND does NOT have loading="lazy"
standards-source:
  - doc: admin/claude/TECHNICAL_STANDARDS.md
    section: "Image optimization — fetchpriority on hero"
  - doc: new-standards/foundation/PWA_CACHING_STANDARDS_v3.007.md
    section: "LCP image priority"
standards-backfill: no
decision: FINAL
last-updated: 2026-04-15
---

## Rule
The page's likely Largest-Contentful-Paint image (hero, above-the-fold, visible before any scroll) must be declared with `fetchpriority="high"` and must NOT have `loading="lazy"`. Lazy-loading the hero defers the image the browser most needs for first paint.

## Why (rationale)
LCP is one of the three Core Web Vitals. A lazy-loaded hero adds 200-500ms to LCP on typical mobile connections. Standards describe this; no validator currently enforces it. Rule is on the orphan list.

## Pass example
```html
<img src="/assets/ports/nassau/nassau-hero.webp"
     alt="Royal Caribbean ship at Prince George Wharf, Nassau"
     width="1800" height="900"
     fetchpriority="high"/>
```

## Fail example
```html
<!-- Lazy-loaded hero — common mistake -->
<img src="/assets/ports/nassau/nassau-hero.webp"
     alt="..." loading="lazy"/>

<!-- No fetchpriority — hero competes equally with below-the-fold assets -->
<img src="/assets/ports/nassau/nassau-hero.webp" alt="..."/>
```
No validator flags either today. Lighthouse catches it post-hoc as an LCP regression.

## Fix guidance
Identify the hero image (usually first `.port-hero img` or `.hero img`). Add `fetchpriority="high"`. Remove any `loading="lazy"` on that element. All other images remain lazy.

Implementation note for Phase 2+ validator: the check is easy — first `img` inside `main` (or a `.hero` / `.port-hero` class), inspect attributes. Expected rollout: add at `warn`, fix fallout across fleet, promote to `error`.
