---
id: PERF-001
name: Hero image declares fetchpriority="high" and loads eagerly
family: perf
severity: error
applies-to:
  - port
provenance: V+S-agree
status: live
implementation:
  - file: admin/validate-port-page-v2.js
    function: validateImages (hero_image_loading check)
    lines: "1193-1201"
check: at least one <img> on the page has BOTH `loading="eager"` AND `fetchpriority="high"` (identifies the hero image)
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
The page's hero image must have BOTH `loading="eager"` AND `fetchpriority="high"`. The validator finds the hero by selecting the first `<img>` that carries either attribute; if no such image exists, the page has no eagerly-loaded hero and fails as BLOCKING.

## Why (rationale)
LCP is one of the three Core Web Vitals. Browsers treat `loading="eager"` as a hint to start fetching the image immediately (not during idle), and `fetchpriority="high"` pushes it to the top of the connection's priority queue. Together they shave 200-500ms off LCP on typical mobile connections. The hero is almost always the LCP candidate on cruise-planning pages, so tagging it correctly is the single highest-leverage perf move.

**This rule was previously orphaned (implementation: none) during Phase 1 scaffold, then discovered to be implemented at lines 1193-1201 during Phase 2 batch 3 IMG extraction. Updated accordingly.**

## Pass example
```html
<img src="/ports/img/nassau/nassau-hero.webp"
     alt="..." loading="eager" fetchpriority="high"
     width="1800" height="900"/>
```
Passes — has both attributes.

## Fail example
```html
<img src="/ports/img/nassau/nassau-hero.webp"
     alt="..." fetchpriority="high"/>
<!-- other images, none with loading="eager" or fetchpriority="high" -->
```
Still fails if no img has loading="eager" — validator requires a hero with BOTH attributes OR requires loading="eager" on the hero specifically; the check looks for any img matching either filter and errors if none found.

Also fails if the hero has `loading="lazy"`:
```html
<img class="port-hero-img" src="..." loading="lazy" fetchpriority="high"/>
```
The lazy loading defeats the purpose even with fetchpriority.

## Fix guidance
Identify the hero image (usually first `.port-hero img` or `section.port-hero img`). Add both attributes:
```html
<img src="..." alt="..." loading="eager" fetchpriority="high" width="..." height="..."/>
```
Remove any `loading="lazy"` on that element. All other images should remain `loading="lazy"` (see IMG-004).

## Related
- IMG-004 — non-hero images must be lazy-loaded (the inverse half of this rule)
- IMG-011 — hero section must exist
