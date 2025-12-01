# In the Wake — Caching Standards Addendum (v3.007)

**Purpose:** Make pages fast and resilient (even offline) without wrecking batteries, data plans, or SEO. This augments our global standards; anything here wins when there’s a conflict.

## 0) TL;DR

- We cache **a lot** of the site, **safely and gradually**.
- Order of prewarm = **order of `assets[]` in `/precache-manifest.json`** (top first).
- Same-origin only. Respect **Save-Data**, metered networks, and idle time.
- Version with a page `<meta name="version">` and `?v=` query on static assets.
- HTML & JSON are cached deliberately; images use **stale-while-revalidate**.

---

## 1) Cache Names & Limits

- `itw-asset-v12` — versioned CSS/JS, HTML, JSON; max ~**120** entries.
- `itw-img-v12` — images (jpg/png/webp/avif/svg); max **320** entries.

> Bump the suffix (`v12`) when you make breaking cache changes. The SW prunes old buckets on `activate`.

---

## 2) Versioning Rules

- Every deploy sets `<meta name="version" content="3.007.x">` on pages.
- All same-origin CSS/JS references must include `?v=${version}` (our cache-buster script enforces this).
- Images may omit `?v=`, but **hero/author images** can include `?v=` when you want deterministic updates.

---

## 3) Precache Manifest

**Path:** `/precache-manifest.json` (same-origin, no auth)

**Shape:**
```json
{
  "version": "3.007",
  "assets": [
    "/", "/solo.html", "/ships.html",
    "/assets/styles.css?v=3.007",
    "/assets/index_hero.jpg?v=3.007",
    "/solo/articles/freedom-of-your-own-wake.html?v=3.007",
    "/authors/img/tina1.webp?v=3.007"
  ],
  "images": [
    "/authors/tinas-images/ncl-jade.webp",
    "/authors/tinas-images/tinastanding.webp"
  ],
  "json": [
    "/api/ships.json?v=3.007",
    "/api/menus.json?v=3.007"
  ]
}
```

**Ordering:** Top-to-bottom is the **exact fetch order**. Put the most important/navigation-heavy URLs first.

---

## 4) Seeding Behavior (Service Worker)

- **Install/Activate:** claim clients; delete old `itw-*` caches.
- **Prewarm (post-activate):** the page sends `postMessage({type:'SEED_PRECACHE'})`.  
  SW fetches `/precache-manifest.json` and preloads `assets[]` **in order** with a small delay between requests.
- **Sitemap Pass (optional):** the page can read `/sitemap.xml`, filter same-origin, and send chunked lists via `postMessage({type:'CACHE_URLS', urls:[...]})`. SW caches them during idle windows.
- **Images:** on-demand requests use **stale-while-revalidate**; we also accept `images[]` from the manifest to preseed author/hero folders.

**Guards applied by default**
- Skip seeding when `navigator.connection.saveData === true` or `effectiveType === '2g'`.
- Use small back-off (`~150–250ms`) between prewarm requests.
- Respect `Cache-Control` headers; HTML/JSON are fetched with `cache: 'no-store'` and then `cache.put()`.

---

## 5) Runtime Strategies

- **Versioned CSS/JS (`?v=`):** `cache-first` (immutable by version).
- **Images:** `stale-while-revalidate`.
- **HTML & Article Fragments:**  
  - Fetch with `cache: 'no-store'`, then `cache.put()` on success (so we don’t cache personalized variants).  
  - Serve network on first view; cached copy available offline.
- **APIs / JSON:** mirror into cache (or IndexedDB when we need fine-grained control). Add them to `json[]` in the manifest if you want prewarm.

---

## 6) Page Snippet (to trigger prewarm politely)

Add once, near the end of `<body>` on layout pages:

```html
<script>
(async function(){
  if (!('serviceWorker' in navigator)) return;
  const c = navigator.connection;
  const ok = !c?.saveData && (!c?.effectiveType || !/^2g$/.test(c.effectiveType));
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', {scope:'/'});
    const send = () => reg.active?.postMessage({type:'SEED_PRECACHE'});
    if (ok) { reg.active ? send() : navigator.serviceWorker.addEventListener('controllerchange', send); }
  } catch {}
})();
</script>
```

**Optional sitemap seeding (idle):**
```html
<script>
(async function(){
  if (!navigator.serviceWorker?.controller) return;
  const idle = (cb)=>('requestIdleCallback'in window)?requestIdleCallback(cb,{timeout:1500}):setTimeout(cb,300);
  idle(async ()=>{
    try {
      const xml = await fetch('/sitemap.xml', {cache:'no-store'}).then(r=>r.text());
      const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m=>m[1])
        .filter(u => u.startsWith(location.origin))
        .filter(u => !/\/(admin|api|drafts)\b/i.test(u));
      for (let i=0;i<urls.length;i+=20) {
        navigator.serviceWorker.controller.postMessage({type:'CACHE_URLS', urls: urls.slice(i,i+20)});
        await new Promise(r=>setTimeout(r,500));
      }
    } catch {}
  });
})();
</script>
```

---

## 7) .webp / `<picture>` / OG images

- When a hero or byline image is **WebP**, also set `og:image:type = image/webp` (handled by our SEO injector).  
- Author/hero markup should prefer `<picture>` with `type="image/webp"` source, and a JPEG/PNG fallback `<img>`.

**Rule of thumb:** If a page’s primary share image is WebP, the SEO injector must add:
```js
setMeta('og:image:type','image/webp');
```

---

## 8) Attribution & Special Folders

- **`/authors/tinas-images/`** — always attribute Tina and link to `/authors/tina-maulsby.html` in captions/bylines.  
- These images are allowed in prewarm (`images[]`) and standard image cache.  
- Never strip alt text or attribution when inlining figures.

*(Attribution is content policy; caching does not alter the requirement.)*

---

## 9) User Controls & Ethics

- Provide a simple **“Make this site available offline”** toggle (future UI). When enabled, trigger both `SEED_PRECACHE` and sitemap seeding.
- Always honor **Save-Data**. Prefer Wi-Fi/ethernet for aggressive prewarm.
- Keep an eye on storage usage; prune aggressively.

---

## 10) Testing & Rollout

- Test in Chrome, Safari, and Firefox.
- Verify:
  - First-visit works with no SW.  
  - Second-visit shows **instant CSS/JS** and **cached images**.  
  - Offline: nav to recently viewed pages and prewarmed pages works.  
  - Storage quota not exceeded; caches prune correctly.
- Bump **cache names** and `<meta name="version">` on meaningful changes.

---

## 11) Common Pitfalls (and our rules)

- **No cross-origin HTML** in caches (CORS/opaque issues).  
- Don’t precache authenticated or personalized pages.  
- Don’t mass-fetch during page load; always **idle + stagger**.  
- Keep manifests small and curated. Use sitemap seeding for breadth.

---

## 12) Change Log

- **v3.007**
  - Added `/precache-manifest.json` with ordered prewarm.
  - Added sitemap-driven idle seeding.
  - Increased image cache to 320 entries.
  - Enforced `.webp` OG type rule in SEO injector.

---

**Soli Deo Gloria.**
