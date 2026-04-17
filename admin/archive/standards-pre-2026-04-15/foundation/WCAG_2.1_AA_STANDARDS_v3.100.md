
# Standards v3.100 — Accessibility (WCAG 2.1 AA) Addendum

## 0) Definition of Done (must pass to merge)
- ✅ **Keyboard-only**: all interactive elements are reachable, operable, and escape-able; visible focus at all times.
- ✅ **Contrast**: text ≥ 4.5:1 (normal) / 3:1 (≥18 pt or 14 pt bold); non-text UI parts & focus indicators ≥ 3:1.
- ✅ **Structure**: exactly one `<h1>`, ordered headings, landmarks present (`header`, `nav`, `main`, `footer`, `aside`).
- ✅ **Images/media**: accurate `alt`; decorative `alt=""`; video has captions (and AD plan if needed).
- ✅ **Reflow/responsive**: no horizontal scroll at **320 px** width; content/controls remain usable at 400% zoom.
- ✅ **Pointer/keyboard parity**: never hover-only; all interactions have a keyboard equivalent.
- ✅ **Status messages** announced via `aria-live` when content updates.
- ✅ **Motion/flashing**: respects `prefers-reduced-motion`; no content flashes > 3 times/second.
- ✅ **Programmatic names**: links/buttons have meaningful text; icons get `aria-label` or are hidden if decorative.
- ✅ **Automated checks**: pa11y/axe/Lighthouse AA gate passes; manual spot-check with a screen reader on one flow.

---

## 1) Global patterns (drop in once)

### 1.1 Skip link (required on every page)
```html
<a class="skip-link" href="#content">Skip to main content</a>
```
```css
/* styles.css */
.skip-link{position:absolute;left:-999px;top:auto}
.skip-link:focus{left:12px;top:12px;z-index:9999;background:#fff;border:2px solid var(--accent);padding:.4rem .6rem;border-radius:8px;outline:none}
```

### 1.2 Landmarks & headings
- Wrap the page with semantic landmarks: `<header class="site-header">`, `<nav aria-label="Primary">`, `<main id="content">`, `<footer>`.
- Exactly one `<h1>` per page; nest `<h2>…<h6>` in order (no jumps).

### 1.3 Focus visibility (do not remove outlines)
```css
:focus{outline:2px solid #0e6e8e; outline-offset:2px}
:focus-visible{outline:3px solid #0e6e8e; outline-offset:2px}
.pill:focus-visible,.chip:focus-visible{box-shadow:0 0 0 3px rgba(14,110,142,.25)}
```

### 1.4 Color/contrast tokens (ensure AA)
Use these or darker; never lighten without rechecking:
```css
:root{
  --ink:#083041;           /* text on light background */
  --accent:#0e6e8e;        /* links/buttons (AA on white) */
  --pill-bg:#ffffff;
  --pill-border:#bfa172;   /* slightly darker than rope for contrast */
}
.pill,.chip{
  background:var(--pill-bg);
  border:1px dashed var(--pill-border);
  color:var(--accent);
}
```

### 1.5 Reduced motion & hover parity
```css
@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
}
```
- Any hover effect must also appear on focus.
- No “content only on hover”; provide persistent or focus-triggered equivalents.

### 1.6 Keyboard disclosure pattern (menus, trays)
```js
// Generic disclosure buttons
document.querySelectorAll('[aria-controls]').forEach(btn=>{
  const panel=document.getElementById(btn.getAttribute('aria-controls'));
  if(!panel) return;
  btn.addEventListener('click',()=> {
    const open = btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });
  btn.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ btn.setAttribute('aria-expanded','false'); panel.hidden=true; btn.focus(); }
  });
});
```
```html
<button aria-expanded="false" aria-controls="tray-venue">Venue</button>
<div id="tray-venue" role="menu" hidden>…</div>
```

### 1.7 Live region for status (“Showing X of Y”)
```html
<div id="search-meta" class="tiny" aria-live="polite">Loading…</div>
```

---

## 2) Content rules

- **Images:**  
  - Informative: `<img src="…" alt="Izumi sushi bar — chef preparing nigiri">`  
  - Decorative: `<img src="…" alt="" aria-hidden="true">`
- **Links/buttons:** Link text must describe the destination, not just “Click here”. For icon-only, add `aria-label`.
- **Headings:** No empty headings; don’t style non-headings to look like headings.
- **Language:** `lang="en"` (already present); change per page if needed.
- **Errors (forms later):** Programmatically associate labels; announce errors in a live region.

---

## 3) Interaction specifics we already use

### 3.1 Pill nav / chips
- Each `a`/`button` is reachable and has text.  
- Keep `.pill`/`.chip` focus styles above.  
- For toggle chips, reflect state with `aria-pressed="true|false"`.

### 3.2 Filter trays (Brand/Class/Ship/Venue)
- Use pattern in **1.6**.  
- When opening a tray, move focus to the first focusable item; on close (Escape or click away), return focus to the trigger.

### 3.3 Search input
- Keep an explicit `<label for="q" class="sr-only">Filter restaurants</label>`:
```css
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
```

---

## 4) Media (when you add videos/carousels)
- Captions required; provide transcript (link near the player).  
- Auto-play off by default; if used, muted + controls + pause/stop; respect `prefers-reduced-motion`.  
- Carousels must be keyboard operable (arrow keys, Tab), pauseable, and not auto-advance for > 5 seconds without controls.

---

## 5) Reflow & responsiveness
- Test at **320 px** width and 400% zoom; no horizontal scrolling for main content.  
- Grids must stack; ensure minimum target size ≥ **44×44 px** for touch controls.

---

## 6) Status updates & errors
- Any JS that changes content (e.g., “Showing 12 of 84”) must update the `aria-live="polite"` node.  
- If something fails (e.g., venues.json), set a clear message (`role="alert"` if blocking).

---

## 7) Automated testing in CI (lightweight)
Add a tiny CI step:

```bash
# Install once
npm i -D pa11y-ci axe-core playwright
```

**pa11y-ci.json**
```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "level": "error",
    "timeout": 60000
  },
  "urls": [
    "https://cruisinginthewake.com/index.html",
    "https://cruisinginthewake.com/restaurants.html",
    "https://cruisinginthewake.com/ports.html",
    "https://cruisinginthewake.com/disability-at-sea.html"
  ]
}
```

**.github/workflows/a11y.yml**
```yaml
name: a11y
on: [push, pull_request]
jobs:
  pa11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci || npm i
      - run: npx pa11y-ci
```

*(For local dev, also run the Axe browser extension + Lighthouse; target score ≥ 100.)*

---

## 8) Footer compliance note (safe wording until full audit)
Add site-wide (or just on the Disability page) **now**:

```html
<p class="access-statement tiny" style="margin-top:.8rem">
  We design to meet WCAG 2.1 Level AA. Accessibility is an ongoing commitment; if you encounter a barrier, email
  <a href="mailto:accessibility@cruisinginthewake.com">accessibility@cruisinginthewake.com</a>.
  Last reviewed: 2025-10-09.
</p>
```

When the documented audit is complete, update to: “This site **conforms** to WCAG 2.1 Level AA as of &lt;date&gt; (scope: all public pages).”

---

## 9) Quick retrofits for current pages (action list)
- Add **skip link** and **`id="content"`** on all pages.  
- Ensure **focus styles** exist (snippet above) and are not suppressed by any CSS.  
- Add **`aria-live="polite"`** to the Restaurants “Showing X of Y” element.  
- Verify **contrast** of pills/chips and small text against backgrounds; tweak `--rope` usages where needed.  
- Add **`.sr-only` label** for the search input.  
- Confirm **keyboard behavior** for the tray menus (Enter/Space open/close, Escape closes, focus returns to trigger).
```
