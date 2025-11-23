# ⚓ In the Wake — Solo Page Standards (v3.006.solo.002)
**Release Date:** 2025-10-15  
**Classification:** Canonical Planning Pass (Solo Module)  
**Maintainer:** In the Wake Editorial / abondservant  

---

## 1. Invocation & Doxology

Each Solo module page is treated as an act of craftsmanship and worship.  
Follow the same invocation ethics established in *Ship Page Standards v3.007.070*.

```html
<!-- Invocation: This page is an act of worship of God — may all we ship be true, beautiful, and helpful. -->
```

Add this line at the very top of each page (above `<!doctype html>`).  
At the bottom of every page, after `</html>`, append:

```html
<!-- Soli Deo Gloria — abondservant, A.D. 2025-10-10 -->
```

---

## 2. Scope & File Structure

| Path | Purpose |
|------|----------|
| `/solo.html` | Randomized article loader and collection index |
| `/solo/<slug>.html` | Standalone article pages (shareable) |
| `/solo/assets/` | Hero images, author images, and module JS/CSS |
| `/standards/08-encyclopedia/SOLO-MODULE_STANDARDS.md` | Canonical rule reference |

---

## 3. Required Imports (from other standards)

| Source Standard | Inheritance Scope |
|-----------------|-------------------|
| EVERY-PAGE_STANDARDS v3.002 | Core head/footer hygiene |
| SHIP-PAGE_STANDARDS v3.006 | Accessibility, lazy load, absolute URLs |
| ADDENDUM_RCL v3.006.006 | Invocation footer, attribution maintenance |
| SOCIAL BUTTONS v3.002 | Floating share bar + link hardening |
| RESTAURANTS v2.256 | Disclosure pill styling, price disclaimer |
| INVOCATION_SIGNATURE.html | Final page footer comment |

---

## 4. Versioning & Identity

- **Version Tag:** `<meta name="version" content="3.006.solo.002"/>`
- **Title Pattern:** `Solo Cruising — Reflections, Advice & Faith at Sea | In the Wake`
- **Canonical URL:** `/solo.html`
- **Referrer:** `no-referrer`
- **Robots:** `index, follow`
- **Theme Color:** `#0e6e8e`
- **Visible Footer Version Badge:** `.version-badge` optional but encouraged

---

## 5. Invocation Comment Block (Documentation)

Place this non-rendered comment block below the invocation:

```html
<!-- Standards Invocation
  - EVERY-PAGE_STANDARDS v3.002
  - SOLO-MODULE_STANDARDS v3.006.solo.002
  - SHIP-PAGE_STANDARDS v3.006 (a11y, perf)
  - ADDENDUM_RCL v3.006.006 (invocation footer + attribution)
  - Invocation Signature 2025-10-10
  Soli Deo Gloria
-->
```

---

## 6. Layout Structure

1. **Skip-link:** `<a href="#content" class="skip-link">Skip to main content</a>`  
2. **Hero Header:** logo, nav, tagline, and compass.  
3. **Main (`<main id="content">`)**  
   - Intro cards (Welcome, Overview)  
   - Dynamic article host section (`#solo-article-host`)  
4. **Sidebar (`<aside>`)**  
   - Authors Card  
   - Related Reading Card  
   - Community Links Card  
5. **Footer:** copyright + accessibility script + invocation signature.

---

## 7. Visual & Branding Rules

- **Hero Background:** Flickers of Majesty “Solo Tranquility” photo.  
- **Card Design:** White background, 2 px rope border, soft shadows.  
- **Fouled‑Anchor Watermark:** fixed background behind cards.

```css
body::before {
  content:"";
  position:fixed; inset:0;
  background:url('https://www.cruisinginthewake.com/assets/watermark.png?v=3.007.070')
             center right/520px auto no-repeat;
  opacity:.10; pointer-events:none; z-index:0;
}
.wrap, .cards, .card { position:relative; z-index:1; }
```

- **Palette:** Nautical blues and rope tones.  
- **Typography:** Serif headings, sans-serif body per global CSS.  

---

## 8. Head Requirements

- Include preconnects to `googletagmanager.com`, `cloud.umami.is`, `cdn.consentmanager.net`, `i.ytimg.com`, `youtube-nocookie.com`.
- `<meta name="referrer" content="no-referrer">`
- Canonical, OG, and Twitter cards (updated dynamically for deep-linked articles).
- Accessibility script required in footer.

---

## 9. Accessibility & Performance

- “Skip to content” required.
- `aria-live="polite"` on article loader region.
- All images: `alt` text (empty only if decorative).
- Lazy-load all non-hero images.
- Absolute URLs for all internal assets.  
- Lighthouse ≥ 90 Performance / ≥ 95 A11y.

---

## 10. Randomization & Deep-Linking Rules

- If `/solo.html` has no `?a=` or `#slug`, choose random article not equal to last read.  
- On deep-link load, fetch `/solo/<slug>.html`, inject into `#solo-article-host`, and update OG/Twitter/JSON‑LD tags accordingly.  
- “Share this article” copies standalone URL to clipboard.  
- Last read stored in `localStorage` as `solo:lastSlug`.

---

## 11. Disclosure & Theological Scent

- Use the *Solo Module Disclosure*:

> **Full disclosure:** I’ve stood the watch aboard many ships—mostly Royal Caribbean—with more than 150 nights at sea across three oceans and over 30 nations. These are no borrowed winds, but soundings taken in my own wake, trimmed and charted for those who follow.

- Theology should be subtle yet unmistakable—gratitude, providence, rest, humility.  
- Scripture allowed when it strengthens the moment (e.g., Luke 19:40).

---

## 12. Guest Author Policy

Imported verbatim from *Solo Cruising Module Standards v3.006.solo.001 §12*:

> Preserve the guest’s tone and phrasing. No added theology or doctrinal insertions.  
> Edits limited to grammar, clarity, SEO, and nautical style consistency.  
> Credit line: *“Edited for clarity and style by the In the Wake Editorial Crew (per Standards v3.006.solo.002).”*

---

## 13. Invocation Footer Example

```html
<footer class="wrap">
  © 2025 In the Wake — A Cruise Traveler’s Logbook  
  <span class="version-badge">v3.006.solo.002</span>
</footer>
<script type="text/javascript"
  src="https://cdn.consentmanager.net/delivery/js/accessibility.min.js"
  data-acc-accid="774c13e29978"
  data-acc-host="delivery.consentmanager.net"
  data-acc-cdn="cdn.consentmanager.net"></script>
<!-- Soli Deo Gloria — abondservant, A.D. 2025-10-10 -->
```

---

## 14. QA Checklist

- [ ] Invocation comments present top and bottom.  
- [ ] Absolute URLs verified.  
- [ ] Fouled-anchor watermark visible behind cards.  
- [ ] Skip-link and aria labels tested.  
- [ ] Dynamic OG/Twitter updates on deep-link.  
- [ ] Disclosure pill rendered.  
- [ ] Lighthouse thresholds met.  
- [ ] Footer includes accessibility script and signature.

---

© 2025 *In the Wake* — Maintained under Standards v3.006 Invocation Edition.  
*Soli Deo Gloria.*
