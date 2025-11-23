# In the Wake — Article Production Standards (v3.008)

> Canonical front‑end & editorial standards for creating, hosting, and displaying articles on **cruisinginthewake.com**. Treat every article like a publication: reverent, precise, versioned, and verified.

---

## 0) Goals & Non‑negotiables
- **Respect & polish:** Publication-grade layout, grammar, alt text, and attribution.
- **No regressions:** Never break global rails, paths, or shared assets.
- **Cross‑linking:** Articles ↔ authors ↔ ships ↔ restaurants ↔ ports.
- **Versioning everywhere:** Append `?v=3.008` (or current) to **all** assets.
- **Disclosures:** Use canonical Logbook disclosures verbatim when applicable.
- **Accessibility:** Clear heading structure, meaningful links, high‑contrast UI.

---

## 1) Folder & Filename Conventions

```
/solo/                              # section (example)
  why-i-started-solo-cruising.html  # final article file

/assets/articles/
  why-i-started-solo-cruising.webp?v=3.008
  why-i-started-solo-cruising.jpg?v=3.008
  ...

/authors/
  ken-baker.html
  tina-maulsby.html

/authors/img/
  ken-baker.jpg?v=3.008
  ken1.webp?v=3.008
  ken1.jpg?v=3.008          # required fallback
  tina-maulsby.jpg?v=3.008

/authors/img/ico/
  ken1ico.webp?v=3.008
  tinaico.webp?v=3.008

/data/
  articles.json              # article index (see schema)
  authors.json               # author bios + headshots
```

---

## 2) Content Manifests (JSON)

### `/data/articles.json` (schema)
```json
{
  "version": "v3.008",
  "articles": [
    {
      "id": "why-i-started-solo-cruising",
      "title": "Why I Started Solo Cruising (and Built a Community)",
      "url": "/solo/why-i-started-solo-cruising.html",
      "date": "2025-10-18",
      "excerpt": "From that first solo gangway to a thriving community — lessons, courage, and the unexpected joy of sailing on your own terms.",
      "image": "/assets/articles/why-i-started-solo-cruising.jpg?v=3.008",
      "author": {
        "name": "Tina Maulsby",
        "url": "/authors/tina-maulsby.html",
        "image": "/authors/img/tina-maulsby.jpg?v=3.008"
      },
      "keywords": ["solo", "community", "safety", "first-time"]
    }
  ]
}
```
**Rules**
- `id` matches HTML `<article id>` and filename slug.
- `image` points to the **JPG** fallback (WebP is handled in-page via `<picture>`).
- Update `version` on every content change.

### `/data/authors.json` (schema)
```json
{
  "version": "v3.008",
  "authors": [
    {
      "slug": "tina-maulsby",
      "name": "Tina Maulsby",
      "title": "Solo Cruiser & Community Builder",
      "url": "/authors/tina-maulsby.html",
      "image": "/authors/img/tina-maulsby.jpg?v=3.008",
      "icon":  "/authors/img/ico/tinaico.webp?v=3.008",
      "bio": "Tina sails solo, builds community, and helps first-timers find their sea legs.",
      "social": {
        "instagram": "https://…",
        "tiktok": "https://…",
        "etsy": "https://…"
      }
    }
  ]
}
```

---

## 3) Article Page HTML Requirements

**Save as** `/SECTION/{slug}.html` (e.g., `/solo/why-i-started-solo-cruising.html`).

**Head**
- Invocation comment allowed; respectful tone.
- Required meta: charset, viewport, referrer, theme‑color, `meta[name=version]`.
- Unique `<title>` and `<meta name=description>` (≤ 160 chars).
- Canonical `<link rel="canonical" href="https://www.cruisinginthewake.com/…">`.
- OG/Twitter tags: `og:type=article`, title, description, image, url; `twitter:card=summary_large_image`.
- Stylesheet: `/assets/styles.css?v=3.008`.

**Body structure**
```
<header>           # global site header
<main class="article-page">
  <article id="{slug}" data-slug="{slug}">
    <figure class="article-hero card">
      <picture>WEBP + JPG</picture>
      <figcaption class="attribution">credit</figcaption>
    </figure>
    <h1>Title</h1>
    <p class="dek">Dek</p>
    <p class="byline">By <a href="/authors/{slug}.html">Author</a> · Updated <time datetime="YYYY-MM-DD">Mon DD, YYYY</time></p>

    <section class="prose">… body …
      <figure class="card">… picture + attribution …</figure>
      <figure class="pull card"><blockquote>…</blockquote><figcaption>—</figcaption></figure>
    </section>

    <!-- Optional Logbook disclosure block (must be verbatim text when used) -->
    <section aria-labelledby="personal-review">
      <h2 id="personal-review">The Logbook — Real Guest Stories</h2>
      <p class="pill"><strong>Full disclosure:</strong> … canonical disclosure text …</p>
    </section>

    <aside class="cta card">
      <h2>Sail with a Kind Crew</h2>
      <p>Join our Solo Cruisers community for practical tips, meetups, and honest port intel.</p>
      <p>
        <a class="button" href="/solo/index.html#join" data-cta="solo-starter-kit">Get the Solo Starter Kit</a>
        <a class="button ghost" href="/authors/{author}.html">More from {Author}</a>
      </p>
    </aside>

    <nav class="related">
      <h2>More for Solo Cruisers</h2>
      <ul>… related links …</ul>
    </nav>
  </article>

  <aside class="rail">
    <section id="author-rail"></section>
    <section id="recent-articles-rail"></section>
  </aside>
</main>
<footer class="site-footer">© 2025 In the Wake • Soli Deo Gloria</footer>
```

**Right‑side rails script (loads JSON → renders rails)**
```html
<script>
(function(){
  const ORIGIN=(location.origin||(location.protocol+'//'+location.host)).replace(/\/$/,'');
  window._abs=function(p){p=String(p||'');if(!p.startsWith('/'))p='/'+p;return ORIGIN+p;};
  document.addEventListener('DOMContentLoaded', async function(){
    try {
      const [authorsRes, articlesRes] = await Promise.all([
        fetch('/data/authors.json?v=3.008'),
        fetch('/data/articles.json?v=3.008')
      ]);
      const authors = await authorsRes.json();
      const articles = await articlesRes.json();

      const authorRail = document.getElementById('author-rail');
      if (authorRail && authors.authors) {
        // Example: pick current article's author; fallback to site owner
        const a = authors.authors.find(x => x.slug === 'tina-maulsby') || authors.authors[0];
        if (a) authorRail.innerHTML = `
          <div class="rail-card">
            <img src="${a.image}" alt="${a.name}" width="200" height="200" loading="lazy">
            <h3><a href="${a.url}">${a.name}</a></h3>
            <p>${a.title||''}</p>
          </div>`;
      }

      const recentRail = document.getElementById('recent-articles-rail');
      if (recentRail && articles.articles) {
        const items = articles.articles.slice(0,5).map(a => `
          <li>
            <a href="${a.url}">
              <img src="${a.image}" alt="${a.title}" width="120" height="68" loading="lazy">
              <span>${a.title}</span>
            </a>
          </li>`).join('');
        recentRail.innerHTML = `<h3>Recent Articles</h3><ul class="rail-list">${items}</ul>`;
      }
    } catch(e){ console.warn('Rail load error', e); }
  });
})();
</script>
```

---

## 4) Visual & CSS Hooks
```css
.card{ border:4px solid var(--rope); border-radius:1rem; padding:0; overflow:hidden; box-shadow:0 4px 24px rgba(8,48,65,.12) }
.article-hero img{ display:block; width:100%; height:auto }
.attribution{ font-size:.85rem; padding:.5rem .75rem; color:#083041a8; text-align:left }
.pull blockquote{ font-size:1.25rem; margin:0; padding:1rem 1.25rem }
.cta.card{ padding:1.25rem }
.button{ display:inline-block; padding:.6rem 1rem; border-radius:.75rem }
.button.ghost{ background:transparent; border:2px solid currentColor }
.rail .rail-card{ border-left:4px solid var(--rope); padding-left:.75rem; margin-bottom:1rem }
```

**Rules**
- Exactly **one hero** image and **one compass** watermark per page.
- Every image lives in a `.card` wrapper; attribution left‑aligned in `<figcaption>`.
- Hero loads `loading="eager"`, inline images `loading="lazy"`; all have `width`/`height`.

---

## 5) Accessibility & SEO
- **Alt text:** concrete & specific (no “image of”).  
- **Headings:** h1 → h2 → h3 logical order.  
- **Links:** meaningful labels; visible focus states.  
- **Meta:** unique title/description; canonical link.  
- **OG/Twitter:** complete set (title, description, image, url).  
- **JSON‑LD (recommended):**
```html
<script type="application/ld+json">
{
 "@context":"https://schema.org",
 "@type":"Article",
 "headline":"{Title}",
 "image":"https://www.cruisinginthewake.com{IMG_PATH}.jpg?v=3.008",
 "author":{"@type":"Person","name":"{Author}","url":"https://www.cruisinginthewake.com/authors/{author}.html"},
 "datePublished":"{YYYY-MM-DD}",
 "dateModified":"{YYYY-MM-DD}",
 "mainEntityOfPage":{"@type":"WebPage","@id":"https://www.cruisinginthewake.com/SECTION/{slug}.html"},
 "publisher":{"@type":"Organization","name":"In the Wake"}
}
</script>
```

---

## 6) Disclosures & Prices
- Use canonical **Logbook disclosure** text verbatim when first‑person ship/port evaluations are present. Do **not** paraphrase.
- When listing prices, append:  
  *“Prices are subject to change at any time without notice. These represent what they were the last time I sailed.”*

---

## 7) CTA Standards
- **Primary CTA:** community join / Solo Starter Kit.  
- **Secondary CTA:** More from author or related module.  
- Buttons: solid primary + ghost secondary. Add analytics hooks (e.g., `data-cta="solo-starter-kit"`).

---

## 8) Human & AI Workflow

**Human steps**
1. Draft manuscript; run grammar/style.  
2. Export images as **WebP + JPG**; name to match slug; write alt text & captions; verify rights.  
3. Place assets in `/assets/articles/`; append `?v=3.008`.  
4. Build article HTML from this standard; add CTA & related links.  
5. Update `/data/articles.json` and verify `/data/authors.json` entries.

**AI steps (Grok / ChatGPT)**
1. Polish copy (tighten dek, headings, pull‑quotes).  
2. Insert cross‑links to authors, related articles, ships/restaurants/ports.  
3. Validate disclosures and append price disclaimer if needed.  
4. Static QA: headings order, alt text, meta/OG, JSON‑LD, versioning on assets.

---

## 9) Build & Deploy Checklist
- **Links:** no 404s; absolute URLs where required.  
- **Images:** WebP + JPG fallback; hero eager; sizes correct.  
- **Rails:** JSON loads successfully over HTTPS; right rail renders on desktop layouts.  
- **Accessibility:** alt text, focus states, skip link present.  
- **SEO:** titles, descriptions, OG/Twitter, canonical, JSON‑LD.  
- **Versioning:** every asset URL uses `?v=3.008`.  
- **Changelog:** commit message + site change log updated.

---

## 10) Common Pitfalls & Fixes
- **WebP fallback not working:** ensure the JPG exists and the `<img>` inside `<picture>` points to the JPG path. Test in Safari.  
- **Rails empty:** bad JSON path or host mismatch. Confirm `/data/*.json?v=3.008` paths and production hostname/HTTPS.  
- **Missing attribution:** add `<figcaption class="attribution">` with proper credit/license (e.g., CC BY‑SA).  
- **Prices without disclaimer:** add the standard disclaimer in the same section as prices.

---

*Version:* **v3.008**  
*Owner:* In the Wake — Editorial & Front‑end


---

## v3.008 Addendum — Solo Module & Hosted Articles

This addendum codifies refinements we implemented on the **Solo** index page and any host page that mounts article HTML dynamically.

### A) Layout & Rail Placement
- `.wrap.layout` is **mobile-first** single column; at `min-width: 980px` it becomes a **two‑column grid** with the **rail on the right**.
- Recommended grid at ≥980px: `grid-template-columns: minmax(0,1fr) 320px; gap: 32px;`
- Optional at ≥1400px: `grid-template-columns: minmax(0,1fr) 360px;`
- Right rail uses `position: sticky` with `top: 96px` (adjust to match header height).

### B) Hosted Article Hero & Captions
- When an article is embedded inside `#solo-article-host`, hero `<figcaption>` **must be left‑aligned**.
- Keep exactly one hero media element per hero container; remove duplicate top‑level `<img>` siblings (safety CSS already included).

### C) Single‑Compass Guard
- Site pages must render **exactly one** `.hero-compass`. Host pages that mount article HTML must **strip any additional** `.hero-compass` found in the mounted content.

### D) Authors Rail — Data Source
- Prefer sitewide `/data/authors.json` as the **source of truth** for authors. Use hardcoded arrays only as a **fallback** when the JSON is unavailable.
- Resolve `avatarBase` from the `image` field; WebP primary with **JPG fallback** per standards.

### E) Placeholder Alt Text
- Article image placeholders: **“Placeholder image.”**
- Author avatar placeholders: **“Default author portrait.”**
- Real images continue to use **concrete, descriptive alt** text.

### F) Version Metas & Querystrings
- Include **both** `meta[name="version"]` and `meta[name="page:version"]` at the top of every page.
- The values must match each other, the visible version badge, and all asset querystrings (e.g., `?v=3.008.015`).

### G) SEO — Index vs. Article Pages
- `/solo.html` (index/collection) keeps `og:type="website"` and adds **CollectionPage JSON‑LD**:
  ```html
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@type":"CollectionPage",
    "name":"Solo Travel — In the Wake",
    "url":"https://www.cruisinginthewake.com/solo.html",
    "isPartOf":{"@type":"WebSite","name":"In the Wake","url":"https://www.cruisinginthewake.com/"}
  }
  </script>
  ```
- **Each article HTML file** (e.g., `/solo/articles/{slug}.html`) must ship static `<title>`, `<meta name="description">`, OG/Twitter, and `Article`/`BlogPosting` JSON‑LD at **build time**. JS injection is fine for social shares but **must not** be relied on for crawlers.

### H) Class Name Collisions in Rail
- Avoid reusing `.rail` inside the `<aside class="rail">`. Prefer `.rail-items` (or a similarly scoped class) for inner containers.

### I) Accessibility
- Dynamic mount points should toggle `aria-busy="true|false"` around async loads (e.g., `#solo-article-host`, `#authors-list`, `#related-rail`).
- Keep skip link present; ensure the rail and its controls are keyboard-reachable.

### J) Reference CSS Snippets (for convenience)

**Two-column layout (rail on right):**
```css
.wrap.layout{
  display:grid;
  grid-template-columns:minmax(0,1fr);
  gap:24px;
  align-items:start;
}
.wrap.layout .maincol{ order:1; min-width:0; }
.wrap.layout > aside.rail{ order:2; min-width:0; }
@media (min-width:980px){
  .wrap.layout{
    grid-template-columns:minmax(0,1fr) 320px;
    gap:32px;
  }
  .wrap.layout > aside.rail{
    position:sticky; top:96px; align-self:start;
  }
}
@media (min-width:1400px){
  .wrap.layout{ grid-template-columns:minmax(0,1fr) 360px; }
}
```

**Hosted hero caption (left aligned):**
```css
#solo-article-host figure.hero > figcaption,
#solo-article-host .article-hero > figcaption{
  text-align:left;
}
```

**Single-compass guard (JS):**
```js
(function ensureSingleCompass(){
  const host = document.getElementById('solo-article-host');
  if (!host) return;
  host.querySelectorAll('.hero-compass').forEach(n => n.remove());
})();
```
