
# Restaurants Page Standards (v2.256+)

**Module:** `restaurants.md`  
**Scope:** `restaurants.html` and future directory-style pages (searchable/filterable indexes).  
**Last updated:** v2.256.022

---

## 1) Purpose

The Restaurants page is a searchable, filterable directory of dining venues across the fleet. It pulls data from `assets/data/venues.json` and renders responsive cards in a consistent 3‑up grid on desktop, with accessibility and performance in mind.

---

## 2) Hero Section (Global Pattern)

**Use the global hero** (no page-specific overrides). The hero contains only:
- Wordmark (In the Wake) placed as the logo
- Global subtitle/tagline: “A Cruise Traveler’s Logbook”
- Single credit pill bottom-right

Do **not** place page-specific `<h1>` inside the hero. Page title lives **below** the hero (see §4).

> Class: `.hero` (or `.hero--wake` if you use that alias in ships). No custom hero size on restaurants—let the global CSS control min-height and layout.

---

## 3) Header / Topbar (Global)

Topbar appears inside `<header.site-header>` and includes a tiny logo, version label, and primary nav pills aligned to the right.

```html
<header class="site-header">
  <div class="topbar">
    <a class="logo-sm" href="/">…</a>
    <span class="ver">vX.XXX.XXX</span>
    <nav class="pill-nav" aria-label="Primary">…</nav>
  </div>
</header>
```

Notes:
- Version is the **page build version** (e.g., `v2.256.022`).
- All absolute links use the site origin; externals include `rel="noopener"`.

---

## 4) Below-Hero Page Header

Immediately below the hero, present the page title and subhead:

```html
<section class="page-header">
  <div class="section">
    <h1>Restaurants &amp; Menus <span class="version-badge">v2.256.022</span></h1>
    <p class="page-sub">Premium &amp; complimentary dining across the fleet — menus, prices, accessibility notes.</p>
  </div>
</section>
```

**Rationale:** keeps the hero universal and prevents hero height drift.

---

## 5) Instructions (Tips) Card

Optional but recommended for discoverability. Dismissible and remembered in `localStorage` under key `iw_rest_tips`.

### HTML

```html
<section class="section" id="how-to-section">
  <div id="how-to-card" class="tip-card" role="region" aria-label="How to filter restaurants">
    <div class="tip-head">
      <strong>Tips</strong>
      <button class="tip-dismiss" type="button" id="tipDismissBtn">Hide</button>
    </div>
    <ul class="tip-list">
      <li>Type to filter (try <kbd>suite</kbd>, <kbd>diamond</kbd>, <kbd>sushi</kbd>).</li>
      <li>Click category chips to narrow results.</li>
      <li>Use the brand / class / ship trays to focus on a fleet slice.</li>
      <li>Press <kbd>/</kbd> to jump to search.</li>
    </ul>
  </div>
</section>
```

### CSS

```css
.tip-card{
  background:#fff; border:2px solid var(--rope); border-radius:14px;
  box-shadow:0 2px 6px rgba(8,48,65,.08); padding:1rem; margin:.5rem 0 1rem;
}
.tip-head{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
.tip-head strong{ font-size:1.05rem; color:#083041 }
.tip-dismiss{
  appearance:none; border:1px solid #cfe1ea; background:#f7fdff; color:#0e6e8e;
  padding:.3rem .6rem; border-radius:999px; cursor:pointer; font-size:.85rem;
}
.tip-dismiss:hover{ background:#eef7fb }
.tip-list{ margin:.6rem 0 0 1.1rem; color:#163042; }
.tip-list li{ margin:.25rem 0; }
kbd{
  font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size:.85em; padding:.05em .35em; border:1px solid #cfe1ea; border-bottom-width:2px; border-radius:4px; background:#f7fdff;
}
```

### JS (dismiss)

```js
// On load: honor persisted preference
(function(){
  try {
    if (localStorage.getItem('iw_rest_tips') === 'off') {
      const hc = document.getElementById('how-to-card');
      if (hc) hc.style.display = 'none';
    }
  } catch(e) {}
})();

// Click handler
document.addEventListener('click', function(e){
  if (e.target && e.target.id === 'tipDismissBtn') {
    const hc = document.getElementById('how-to-card');
    if (hc) hc.style.display = 'none';
    try { localStorage.setItem('iw_rest_tips', 'off'); } catch(e){}
  }
}, {passive:true});
```

---

## 6) Search & Category Filters

- Search input: `#q` (with `aria-label`).
- Category chips live under `#filters` and toggle `aria-pressed`.
- Filtering logic is case-insensitive and supports synonyms and near-matches.

**Do not** mutate inner chip text; rely on data attributes:
- `data-kind="cat"` and `data-val="premium" | "complimentary" | "activity"`

---

## 7) Grid Layout (3‑up standard)

All restaurant sections use the same responsive grid:

```css
/* Base grid */
.section .grid{ display:grid; gap:1rem; }

/* Default: 1-up */
.section .grid-3{ grid-template-columns: 1fr; }

/* ≥680px: 2-up */
@media (min-width:680px){
  .section .grid-3{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}

/* ≥1024px: 3-up */
@media (min-width:1024px){
  .section .grid-3{ grid-template-columns: repeat(3, minmax(0,1fr)); }
}

/* Cards fill tracks */
.section .grid > .card{ display:flex; flex-direction:column; height:100%; }
```

Apply this to:
- `#grid-complimentary`
- `#grid-premium`
- `#grid-activity`

You may hard-target them if needed to avoid clashes:

```css
#grid-complimentary, #grid-premium, #grid-activity{
  display:grid; gap:1rem;
}
```

---

## 8) Brand / Class / Ship / Venue Trays

Placed inside:

```html
<nav id="brandbar" aria-label="Filter by brand, class, ship, or venue">…</nav>
```

### Behavior
- Buttons toggle trays; only one tray open at a time.
- Close on `mouseleave` or when focus leaves the tray.
- “Clear” resets all state (`STATE.cats`, `STATE.klass`, `STATE.ship`, `STATE.venue`, `STATE.query`).

### Class Sorting (Largest → Smallest)
Use a fixed order to sort ship classes:

```js
const CLASS_ORDER = [
  'icon','oasis','quantum ultra','quantum','freedom',
  'voyager','radiance','vision','sovereign','empress'
];
```

Normalize class names via:

```js
const cleanClass = s => String(s||'')
  .toLowerCase()
  .replace(/\s*class\s*$/,'')
  .trim();
```

When a class is selected, repopulate the Ship tray to show only ships in that class.

---

## 9) Filtering Logic

Each venue card anchor `<a>` includes attributes:

- `data-slug`, `data-cat`, `data-brand`
- `data-ships` = space-separated ship slugs (lowercase)
- `data-classes` = space-separated classes (lowercase)
- `data-tags` = searchable text composed from name, aliases, blurb, access, etc.

State object (all lowercase keys/values):

```js
const STATE = { cats:new Set(), query:'', brand:'rccl', klass:'', ship:'', venue:'' };
```

Match rules:
- **Text**: tokenized, includes synonyms and edit‑distance‑1 matches.
- **Category**: honor `STATE.cats` (empty = all).
- **Brand**: single brand for now (`rccl`).
- **Class/Ship**: exact slug/class match after normalization.
- **Venue**: `slug` equality.

---

## 10) Performance & Caching

- Data URL: `location.origin + '/assets/data/venues.json'`
- Fetch with `{cache:'no-store'}`
- After deploys, bump stylesheet query string to invalidate caches (e.g., `styles.css?v=2.246`).

---

## 11) Accessibility & SEO

- Unique `<title>` and `<meta name="description">`.
- Absolute `<link rel="canonical">`.
- ARIA:
  - `aria-label="Filter by brand, class, ship, or venue"` on the nav.
  - `aria-live="polite"` on `#search-meta`.
- Keyboard: `/` key focuses search.
- Role and `aria-pressed` on chips.

---

## 12) Script Conventions

- Inline IIFE to avoid globals.
- Function order:
  1. Helpers
  2. State
  3. Rendering
  4. Wire UI (chips, trays)
  5. Boot()
- Keep normalization single-source-of-truth (e.g., `norm()`, `cleanClass()`).
- Prefer `Set` for category filters.

---

## 13) Known Keys

- `localStorage['iw_rest_tips'] = 'off' | 'on'`

---

## 14) Acceptance Checklist

- [ ] Hero height & crop match global ship hero at common widths.
- [ ] Page title appears below hero and includes version badge.
- [ ] Tips card renders and hides permanently when dismissed.
- [ ] Grid displays 1‑up / 2‑up / 3‑up at the breakpoints above.
- [ ] Brand/Class/Ship trays open/close correctly.
- [ ] Class tray sorted Icon → Empress; unknowns at bottom (alpha).
- [ ] Clicking a class repopulates Ships with only ships in that class.
- [ ] Clicking a ship filters cards and the section headings hide when empty.
- [ ] Search works with synonyms and near‑matches.
- [ ] ARIA roles/labels present; `/` focuses search.
- [ ] JSON fetched with no-store; styles cache-busted on release.

---

## 15) Snippet Library

### 3‑Up Grid Patch

```html
<style id="restaurants-grid-patch">
.section .grid{ display:grid; gap:1rem; }
.section .grid-3{ grid-template-columns: 1fr; }
@media (min-width:680px){ .section .grid-3{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (min-width:1024px){ .section .grid-3{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
.section .grid > .card{ display:flex; flex-direction:column; height:100%; }
</style>
```

### Class Sorting Helpers

```js
const CLASS_ORDER=[
  'icon','oasis','quantum ultra','quantum','freedom','voyager','radiance','vision','sovereign','empress'
];
const cleanClass=s=>String(s||'').toLowerCase().replace(/\s*class\s*$/,'').trim();
```

---

## 16) Versioning

- Keep this module versioned with the page build (e.g., `v2.256.022`).
- When global hero changes, re-validate this page against §2 and §4.
