

## Canonical domain
- All pages must assume the site root at `https://www.cruisinginthewake.com`.
- All asset URLs must be domain‑absolute under `https://www.cruisinginthewake.com` (no repo‑relative paths).

## Header & Hero
- **Logo (wordmark)**: use `https://www.cruisinginthewake.com/assets/logo_wake.png`. Tiny variant is acceptable anywhere a small “wordmark” image is called for.
- **Compass**: use `https://www.cruisinginthewake.com/assets/compass_rose.svg` (underscore in filename).
- **Hero image**: default to `https://www.cruisinginthewake.com/assets/index_hero.jpg`; no overlay tints that mute color.
- **Firefox vibrancy**: allow a mild filter (e.g., `saturate(1.35) contrast(1.12) brightness(1.05)`) to ensure warm, saturated rendering.
- **Brand title text**: the small “In the Wake” text next to the logo is **not allowed**.
- **Attribution**: every page must include “Photo © Flickers of Majesty · Instagram” in the hero, linking to `https://www.flickersofmajesty.com` and `https://instagram.com/flickersofmajesty`.

## Card Watermark
- Use a **per‑card** watermark (not page‑wide) centered within each `.card`.
- Image: `https://www.cruisinginthewake.com/assets/watermark.png`.
- Behavior: non‑interactive, visually subtle.
- Reference CSS:

```html
<style>
  .card{ position:relative; overflow:hidden }
  .card::after{
    content:""; position:absolute; inset:0; margin:auto;
    width:min(60%, 360px); height:min(60%, 360px);
    background:url('https://www.cruisinginthewake.com/assets/watermark.png') center/contain no-repeat;
    opacity:.06; pointer-events:none;
  }
</style>
```

## Assets — Absolute Paths
- All CSS/JS/images/fonts **must** be referenced with absolute URLs rooted at `https://www.cruisinginthewake.com`.
- No `/InTheWake/...` or relative `/assets/...` paths in production HTML.
- Stylesheet canonical href: `https://www.cruisinginthewake.com/assets/styles.css?v=2.234`.