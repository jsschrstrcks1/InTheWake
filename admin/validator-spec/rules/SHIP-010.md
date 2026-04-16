---
id: SHIP-010
name: Swiper carousel initialization must not enable rewind or loop
family: ship
severity: warn
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateSwiperConfig
    lines: "1554-1570"
check: every `new Swiper({...})` initialization block in inline JS does NOT enable `rewind: true` or `loop: true` (these options make the carousel behave unpredictably with assistive tech and ruin page-order keyboard navigation)
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Swiper carousel initialization code (inline `new Swiper(...)` blocks) must NOT set `rewind: true` or `loop: true`. The validator parses each Swiper init and warns if either flag is present.

## Why (rationale)
Both options create accessibility problems:
- `loop: true` — slides duplicate in the DOM; screen readers announce the same content multiple times; keyboard Tab order becomes nondeterministic.
- `rewind: true` — last slide wraps back to first silently on "next"; users lose their place without warning.

A static carousel with explicit prev/next (which end at boundaries) is the a11y-safe default. Both flags exist for visual polish but ship-page carousels serving real travelers should prioritize predictable behavior.

## Pass example
```js
const gallery = new Swiper('.ship-gallery', {
  slidesPerView: 1,
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  keyboard: { enabled: true }
});
```
No rewind, no loop. Passes.

## Fail (warning) example
```js
const gallery = new Swiper('.ship-gallery', {
  slidesPerView: 1,
  loop: true,  // <-- flagged
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
});
```
Validator emits: `Swiper carousel has loop: true — disables bounds; hurts accessibility`.

## Fix guidance
Delete the flag. If visual continuity at boundaries matters, consider pagination dots rather than loop — dots let users see "you're at slide 3 of 8" without wrapping.
