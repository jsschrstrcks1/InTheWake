# Solo Cruising Module — Standards (v3.008.solo.002)
Baseline: **3.008** • Updated for **solo.html v3.008.019** and site CSS **v3.006+ patches**  
Scope: `solo.html` index + article fragments in `/solo/articles/` + full shareable article pages in `/solo/`

---

## 1) URL & File Structure (authoritative)

- **Index (collection page):**  
  `/solo.html` — renders intro + loads one article fragment into a host card.
- **Shareable full article pages (for users & SEO sharing):**  
  `/solo/{slug}.html` (e.g., `/solo/freedom-of-your-own-wake.html`)
  - These are lightweight HTML wrappers that fetch their corresponding fragment and set metas.
- **Article fragments (partials for mounting only):**  
  `/solo/articles/{slug}.html`  
  - **Must contain a single `<article …>` block only.** No `<html>`, `<head>`, `<body>`, header/footer/site nav, etc.
- **Author assets:**  
  `/authors/img/{authorId}.{webp|jpg}` (byline avatars)  
  `/authors/tinas-images/shirt{1..6}.png` (Tina’s CTA rotation, see §7)
- **Optional data hydrators (404-safe):**  
  `/data/authors.json`  
  `/assets/data/articles/index.json`

---

## 2) Index (`solo.html`) — HTML layout contract

### 2.1 Topbar (global change)
- The **skip link and primary nav live together on one line** in a top bar above the header:
  ```html
  <div class="topbar">
    <a href="#content" class="skip-link">Skip to main content</a>
    <nav class="pill-nav" aria-label="Primary">…</nav>
  </div>
  ```
- **Do not** place the nav inside the header hero; this prevents version badges/brand collisions.

### 2.2 Header hero (unchanged structure)
- Keep hero visuals and “tagline” **in the header**; nav stays in topbar.
- Version badge should **not** overlap nav; keep it in brand row or omit on solo.

### 2.3 Two-column layout (right rail)
- **Author rail** and **Related Reading rail** must render in an `<aside class="rail">` that is **sibling** to the main column:
  ```html
  <main class="wrap layout" id="content" role="main">
    <div class="maincol">…</div>
    <aside class="rail">…</aside>
  </main>
  ```
- The **grid is enforced at ≥980px**; mobile remains single-column.

---

## 3) CSS — layout & hero standards

### 3.1 Two-column grid enforcement (global)
- Site CSS (`/assets/styles.css`) may override grid. Ensure this **scoped, inline** reinforcement exists in `solo.html` **after** the site CSS:
  ```css
  /* #solo-two-col-layout + guard */
  main.wrap.layout{
    display:grid !important;
    grid-template-columns:minmax(0,1fr) !important;
    gap:24px !important;
    align-items:start !important;
  }
  @media (min-width:980px){
    main.wrap.layout{
      grid-template-columns:minmax(0,1fr) 320px !important;
      gap:32px !important;
    }
    main.wrap.layout>.maincol{ grid-column:1 !important; order:1 !important; }
    main.wrap.layout>aside.rail{ grid-column:2 !important; order:2 !important; position:sticky !important; top:96px !important; }
  }
  @media (min-width:1400px){
    main.wrap.layout{ grid-template-columns:minmax(0,1fr) 360px !important; }
  }
  ```
- **Reason:** prevents regressions from older `.wrap` or `.layout` rules and guarantees rail on the right.

### 3.2 Single-hero image standard (global)
- For all article figures **mounted inside** `#solo-article-host`:
  - Wrap hero and inline-hero media in a white **card frame** with 12–16px radius, border, and shadow.
  - Captions appear **below the image**, left-aligned, dashed top border.
  - Enforced via the scoped style block (ids: `#solo-host-hero-fix`), already present in `solo.html`.

**Do not** apply header hero background/filters to article figures; rules in the scoped block explicitly neutralize that.

### 3.3 Header hero scroll safety (global)
- Keep `html, body { overflow-x: hidden !important; }` in site CSS.  
- Use the patched header hero width (`100%` not raw `100vw`) to avoid sub-pixel overflow; your styles.css already contains the fix.

---

## 4) JavaScript — loader & SEO contract

### 4.1 Article picking & deep linking
- The loader selects the article by:
  1) `?a=slug`  
  2) `#slug`  
  3) Else: random pick not equal to `localStorage['solo:lastSlug']`, then `replaceState` with `#slug`.
- **Do not** use optional chaining; support evergreen browsers without transpile.
- Wrap `localStorage` access in `try/catch`.

### 4.2 Fragment fetch & validation (required)
- Fetch from `ARTICLE_BASE + '{slug}.html?v={ver}'` with `{ credentials:"omit", cache:"no-store" }`.
- **Must contain `<article…>`** and **must not** contain `<html|head|body|header>`; otherwise show a friendly failure card.

### 4.3 On mount
- Normalize media inside hero/inline-hero (remove width/height attrs, set `loading="lazy"`, collapse duplicate direct child images).
- Inject **article SEO metas** **only when deep-linked** (hash or `?a=`) so sharing a deep link shows correct OG/Twitter.  
- Ensure one compass (remove duplicates inside mounted article).

### 4.4 Share links (global behavior)
- “Share this article” buttons copy **the full page URL**: `https://…/solo/{slug}.html`.
- Related rail and author roll **link to full pages**, not fragments.

---

## 5) Rails — data, fallbacks, linking

### 5.1 Authors rail
- Hydrate from `/data/authors.json` if available; otherwise fall back to seed array.
- Sort authors by article count (desc).  
- Display avatar (`.webp` + `.jpg` fallback), name, and **up to 3** authored links.
- **Links target:** `/solo/{slug}.html` (full page).

### 5.2 Related rail
- Prefer `/assets/data/articles/index.json` with graceful 404 fallback to local seed (the two solo articles).
- De-duplicate by normalized URL; filter by context tags: `["solo","royal-caribbean","tips","reflection"]`.
- Card links should point to **full solo pages** (if source url is a fragment under `/solo/articles/`, rewrite to `/solo/…`).

---

## 6) Article fragment standard (partials)

**Required fields within `<article>`:**
- `id="{slug}"` (matches file name).
- `data-slug="{slug}"`.
- Use **one** top hero figure (`<figure class="hero">` or `<figure class="article-hero">`) wrapped by the card styling (index code enforces this).
- Byline: either include a `<footer class="byline">` or rely on the **byline fallback injector** (loader appends one using author seed).
- **Tina’s CTA (optional):** follow §7 for randomized image rotation.

**Forbidden in fragments:**
- Any full-page scaffolding (`<html>`, `<head>`, `<body>`, header, global footer, script tags that alter page-level nav/hero, etc.).

---

## 7) Dynamic randomized CTA (Tina)

**Goal:** Same CTA text/link, randomized shirt icon image on each load, from an updatable array.

**Asset convention:**  
`/authors/tinas-images/shirt1.png … shirt6.png`

**Fragment snippet (inside Tina’s article):**
```html
<p class="cta" id="author-pick-cta">
  <a href="https://www.etsy.com/listing/4388692258/life-is-better-on-a-cruise-shirt-blue?utm_source=cruisinginthewake&utm_medium=author_pick_cta&utm_campaign=tina_profile"
     target="_blank" rel="noopener noreferrer">
    <img id="shirt-img" src="/authors/tinas-images/shirt1.png" alt="Cruise T-shirt preview" width="120" height="120" loading="lazy" decoding="async">
    See the shirt I couldn’t cruise without →
  </a>
</p>
<script>
(function(){
  var img = document.getElementById('shirt-img');
  if (!img) return;
  var count = 6;
  var index = Math.floor(Math.random()*count)+1;
  var meta = document.querySelector('meta[name="page:version"]');
  var v = (meta && meta.content) ? meta.content : '3.008';
  img.src = '/authors/tinas-images/shirt'+index+'.png?v='+encodeURIComponent(v);
  img.alt = 'Cruise T-shirt #'+index+' preview';
})();
</script>
```
- **Updatable array:** to add more, bump `count`.  
- Keeps link/CTA text constant for analytics consistency.

---

## 8) Accessibility

- **Skip link** must be **visible and focusable** in the new topbar (no off-screen clip until focus).
- Share buttons receive `role="button"` and `tabindex="0"`, and support `Enter`/`Space`.
- All images must have meaningful `alt`. Hero/inline-hero get clear descriptive `alt`; decorative images (e.g., compass) use empty `alt` and `aria-hidden="true"` where appropriate.
- Rails: `aria-live="polite"` for async hydration targets (`#authors-list`, `#related-rail`).

---

## 9) Performance & cache-busting

- Include `?v={page:version}` on:
  - `/assets/styles.css`
  - Hero/inline-hero images where possible
  - Author avatars and CTA images
  - Fragment fetch: `/solo/articles/{slug}.html?v={page:version}`
- Use `cache:"no-store"` for fragment/data fetches to avoid stale HTML during rapid edits.

---

## 10) Browser support & JS constraints

- **Target:** Evergreen browsers (Chrome, Edge, Firefox, Safari current & N-2).  
- **Allowed JS:** ES2015 subset **without** optional chaining, nullish coalescing, or class fields.  
- Avoid `NodeList.prototype.forEach` assumptions on very old Safari; our code uses simple `for` loops where needed.  
- `position: sticky` is widely supported; when unavailable, rails degrade to static (acceptable).  
- Clipboard copy falls back to `window.prompt()` if `navigator.clipboard` is unavailable.

---

## 11) Versioning & SEO

- Index `<meta name="page:version">` and `<meta name="version">` must match the shipped version (currently **v3.008.019**).  
- **Deep-link SEO injection** runs only when the page is reached via `#slug` or `?a=slug` (prevents index OG churn).  
- Full article pages (`/solo/{slug}.html`) set canonical/OG to their own URL; fragments never set global metas themselves.

---

## 12) Known pitfalls & guardrails

- **Fragments that contain full documents** will be rejected by the loader; keep them clean.  
- **Rail stacking on desktop:** If you ever see the right rail drop below the main column, confirm the **inline grid enforcement block** is present and loaded **after** the site CSS.  
- **Authors JSON 404:** is acceptable; rails render from seeds. Don’t log it as an error to users.  
- **Duplicate compass:** mounted article should not re-inject site compass; the loader removes extras.

---

## 13) Snippet index (copy-ready)

- **Two-column grid enforcement:** see §3.1 block.  
- **Tina CTA rotation:** see §7 script.  
- **Related-rail link rewrite:** if a source URL starts with `/solo/articles/…`, rewrite to `/solo/{slug}.html`.

---

**End of file — `Solo_Cruising_Module_Standards_v3.008.solo.002.md`**
