
# In the Wake — Solo Cruising Module Standards  
**Version:** v3.008.019 · **Baseline:** 3.008 · **Scope:** Solo index page (`/solo.html`), Solo article **fragments** (`/solo/articles/*.html`), and Solo **full pages** (`/solo/<slug>.html`); plus **global** deltas marked ⬆︎ Global.

---

## 0) What changed in v3.008.019 (TL;DR)
- ⬆︎ **Topbar layout:** “Skip to main content” + primary pill nav now live together in a single **.topbar** row (nav removed from header brand row).  
- **Right rail reliability:** Two-column CSS hardened; rail sticks right at ≥980px with `grid-template-columns` forced via `!important`.  
- **Hero/Caption treatment:** Enforced _card wrapper_ for `figure.hero`, `.article-hero`, and `figure.inline-hero` when mounted inside `#solo-article-host`.  
- **Shareable URLs:** Related/author rail links now point to **full pages** under `/solo/<slug>.html` (not fragments). Loader injects SEO only when deep-linked (`#slug` or `?a=`).  
- ⬆︎ **404-safe data hydration:** ` /data/authors.json` is optional; on 404 we silently fall back to built-ins.  
- ⬆︎ **Broad browser support:** Avoids optional chaining; no arrow-only features in critical paths; `fetch` guarded by simple usage; CSS Grid with mobile fallback (single column).  
- **Cache busting:** All dynamic loads include `?v=<meta[name=page:version]>` (e.g., `v3.008.019`).  
- **Accessibility:** Keyboardable Share button, visible skip link, ARIA roles, and `aria-busy` for host during loads.

---

## 1) Versioning & Meta
- Each page sets:
  - `<meta name="page:version" content="v3.008.019">` (used for cache busting)
  - `<meta name="version" content="v3.008.019">` (human reference)
  - `<meta name="standards:baseline" content="3.008">`
- Canonical and OG tags reflect **index** or are **injected per-article** when deep-linked.
- ⬆︎ **Standard:** Bump `page:version` on any structural or loader change that might affect caches.

---

## 2) Layout & Navigation
### 2.1 Topbar (new in .019)
- A single horizontal **.topbar** contains:
  - Visible **Skip to main content** link (`href="#content"`)
  - Primary **pill** navigation (`aria-label="Primary"`)
- The site header (`.hero-header`) is **brand + hero only**; nav no longer lives here to prevent overlap with version badge.
- CSS:
  - `.topbar { display:flex; align-items:center; gap:.75rem; padding:.4rem .9rem; border-bottom:1px solid rgba(8,48,65,.08); background:#fff; z-index:3 }`
  - Buttons are compact; on small screens pills scroll horizontally.

### 2.2 Two-column Grid (main + right rail)
- Mobile-first single column.
- At `min-width:980px`, force two columns with `!important`:
  - `grid-template-columns: minmax(0,1fr) 320px !important;`
  - Rail is `position: sticky; top:96px`.
- At `min-width:1400px`, rail grows to `360px`.
- ⬆︎ **Global:** Pages that use the “main + rail” pattern should adopt this grid to maintain consistency and avoid rail stacking regressions.

---

## 3) Article Loading Model
### 3.1 Sources
- **Fragments** live at: `/solo/articles/<slug>.html` (must start with a **single** `<article>` root, no `<html>`/`<head>`/`<body>`).
- **Full pages** for sharing live at: `/solo/<slug>.html` and hydrate their own SEO.

### 3.2 Picking & Loading
- On `/solo.html`, the loader picks the slug via `?a=<slug>` or `#<slug>`. If none, it randomly chooses (avoid repeating last via `localStorage` when available).
- Fetch URL: `"/solo/articles/" + slug + ".html?v=" + pageVersion` with `cache:"no-store"`.

### 3.3 Guardrails
- Rejects non-partials (if `<html|head|body|header>` present).
- Strips pasted full-page elements from fragments (`html, head, header.hero-header, footer.site, footer.wrap`).
- Sets `aria-busy="false"` when mounted.
- ⬆︎ **Global:** All module loaders should validate fragment structure and sanitize pasted full-page elements.

---

## 4) SEO & Sharing
- On `/solo.html`, dynamic SEO is injected **only** when deep-linked (via `#slug` or `?a=`) to avoid conflicting with index SEO:
  - Updates `<title>` and meta `name="description"`.
  - Sets OG/Twitter tags for the **current article**.
  - Injects `BlogPosting` JSON-LD with `headline`, `description`, `image`, `url`, `datePublished`.
- **All cross-links in rails point to `/solo/<slug>.html` (full pages)** to ensure clean share previews.  
- ⬆︎ **Global:** When an index loads content inline, keep canonical/OG for the index unless deep-linked; cross-links must target the dedicated full page for sharing.

---

## 5) Media “Card” Treatment in Articles
- Within `#solo-article-host`, enforce a card frame around:
  - `figure.hero`, `.article-hero`, `figure.inline-hero`
- Card Rules:
  - `margin:0 0 1rem 0; padding:10px; border-radius:16px; background:#fff`
  - `border:1px solid rgba(8,48,65,.10); box-shadow:0 6px 22px rgba(8,48,65,.08)`
  - Direct children `<picture>`/`<img>` are made fluid; duplicate direct `<img>` siblings hidden.
  - `figcaption` is **static block beneath image** with dashed top border.
- ⬆︎ **Global:** Card wrapper pattern may be reused for other modules; ensure scoping to the host container to avoid site-wide overrides.

---

## 6) Right Rail Content
### 6.1 Authors Rail
- Data source: optional `/data/authors.json?v=<pageVersion>`; on 404, fall back to `RAW_AUTHORS`.
- Render:
  - Author avatar via `picture` (`.webp` primary, `.jpg` fallback) with `?v=<pageVersion>`.
  - Up to 3 links to authored articles; **links go to `/solo/<slug>.html`**.

### 6.2 Related Reading Rail
- Primary source: `/assets/data/articles/index.json?v=3.008.017` (or newer).
- Fallback seed: articles defined in the current page loader.
- Filter: match module context tags (e.g., `["solo","royal-caribbean","tips","reflection"]`).
- Thumbnails/avatars have error fallbacks to placeholders.

---

## 7) Navigation & State
- Topbar nav sets `aria-current="page"` based on `location.pathname`.
- No duplicate header nav; this prevents version badge overlap.
- Skip link is visible and styled (no offscreen-only pattern).

---

## 8) Accessibility & UX
- Skip link is keyboard-first and **visible**.
- Share link in byline is a true button pattern (role, tabindex, Enter/Space).
- Live regions: `aria-live="polite"` and `aria-busy` on the article host.
- Figures include descriptive `alt` and accessible figcaptions; hero has role/label on header background image region.

---

## 9) Performance
- All article images in host: `loading="lazy"` and `decoding="async"` normalized by the loader.
- No dimension attributes enforced by fragments; loader strips width/height to ensure responsivity within the card shell.
- Cache busting uses `meta[name=page:version]` consistently.

---

## 10) Browser Support (Most Popular Desktop & Mobile)
- Avoids optional chaining and nullish coalescing in critical paths.
- No transpilation required for ES5-friendly features used.
- CSS Grid used for layout; mobile-first single column ensures graceful fallback on very old engines; primary target browsers (Chrome, Safari, Edge, Firefox, iOS Safari, Android Chrome) fully support Grid.
- Uses `fetch`; for extremely old browsers, module degrades to “No-JS fallback” links.

---

## 11) Error Handling & Resilience
- Fragment loader:
  - Catches network/HTTP errors and renders a friendly failure message with a link back to `/solo.html`.
- `authors.json`:
  - Optional; non-200 treated as “no override.” Rails still render from seeds.
- Thumbnail/Avatar:
  - `error` handlers swap to placeholders.

---

## 12) Content Rules for Fragments
- Root element **must be** a single `<article>` with `id="<slug>"` and `data-slug="<slug>"`.
- Do **not** include `<html>`, `<head>`, `<body>`, or site header/footer in fragments.
- Use `figure.hero` / `.article-hero` for top image; `figure.inline-hero` for inline large image.
- Byline footer is optional; if not present, loader injects a fallback byline based on author id.

---

## 13) Linking Rules
- From rails and inline cross-links on `/solo.html`, link to **full pages** under `/solo/<slug>.html`.
- Within a **full page** (`/solo/<slug>.html`), fetch the **fragment** and inject **page-local** SEO and OG/Twitter tags (handled by that page’s own loader).

---

## 14) CTA Image Rotation (Tina’s Author Pick) — Reference
- In article fragment, the CTA image `#shirt-img` should randomize from `/authors/tinas-images/shirt1.png` … `shirt6.png`:
  - `const count=6; const index=Math.floor(Math.random()*count)+1; img.src="/authors/tinas-images/shirt"+index+".png?v="+pageVersion;`
- Alt text should reflect the index (e.g., “Cruise T-shirt #3 preview”).

---

## 15) Security & Privacy
- `meta[name="referrer"]` is `no-referrer` site-wide for reduced leakage.
- External links use `target="_blank"` + `rel="noopener noreferrer"`.
- No client secrets; all data sources are public JSON.

---

## 16) Testing Checklist (per deploy)
- ✅ Rails appear on the **right** at ≥980px; stacked on mobile.  
- ✅ “Skip to main content” + primary nav share the topbar line; no badge overlap.  
- ✅ Deep-linking (`#why-i-started-solo-cruising`) injects article SEO.  
- ✅ Rails link to `/solo/<slug>.html` (not fragments).  
- ✅ `authors.json` 404 does **not** error the page.  
- ✅ Placeholders load on thumb/avatar errors.  
- ✅ Images adopt the card shell and figcaption style.  
- ✅ No console syntax errors in Safari, iOS Safari, Chrome, Edge, Firefox.

---

## 17) Snippets (Copy/Paste)
### 17.1 Force two-column grid at desktop
```css
@media (min-width:980px){
  .wrap.layout{
    grid-template-columns:minmax(0,1fr) 320px !important;
    gap:32px !important;
  }
  .wrap.layout > aside.rail{ position:sticky; top:96px; align-self:start; }
}
@media (min-width:1400px){ .wrap.layout{ grid-template-columns:minmax(0,1fr) 360px !important; } }
```

### 17.2 Fragment validation after fetch
```js
if(!/<article[\\s>]/i.test(html) || /<(html|head|body|header)[\\s>]/i.test(html)){
  throw new Error("Not a partial article");
}
host.innerHTML = html;
host.querySelectorAll('html, head, header.hero-header, footer.site, footer.wrap').forEach(n=>n.remove());
```

### 17.3 Link rails to full pages
```js
function permalink(slug){ return location.origin + "/solo/" + encodeURIComponent(slug) + ".html"; }
```

---

### Appendix A — Global Deltas to Adopt
1. **Topbar pattern** for pages with large hero headers (prevents badge overlap, improves skip-link UX).  
2. **Grid + sticky rail** with explicit column sizes and `!important` safeguards.  
3. **Optional JSON hydration** (404-safe) when progressively enhancing lists/rails.  
4. **Deep-link SEO injection** only when necessary to avoid index conflicts.  
5. **Card wrapper** for media blocks scoped to host containers to prevent global overrides.

---

**Document:** Solo_Module_Standards_v3.008.019.md · Generated for internal use.
