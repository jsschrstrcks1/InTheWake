
/* sw.js — In the Wake Service Worker (v12)
   Features:
   - Precache from /precache-manifest.json (pages, assets, images)
   - Optional sitemap seeding from /sitemap.json or /sitemap.xml (same-origin)
   - Runtime caching:
       * Versioned CSS/JS (?v=) -> cache-first (ASSET_CACHE)
       * Images (jpg/png/webp/avif/svg/gif) -> stale-while-revalidate (IMG_CACHE)
       * Pages (.html or navigation requests) -> network-first with offline fallback (PAGE_CACHE)
   - Messaging API: page can push extra URLs to precache
   - Gentle, storage-conscious pruning
*/

const SW_VERSION   = "v12";
const PREFIX       = "itw";
const PAGE_CACHE   = `${PREFIX}-page-${SW_VERSION}`;
const ASSET_CACHE  = `${PREFIX}-asset-${SW_VERSION}`;
const IMG_CACHE    = `${PREFIX}-img-${SW_VERSION}`;
const PRECACHE     = `${PREFIX}-pre-${SW_VERSION}`;

const MAX_PAGES    = 60;
const MAX_ASSETS   = 60;
const MAX_IMAGES   = 360;

// Utility ------------------------------------------------------------------
function sameOrigin(u) {
  try { return new URL(u, location.origin).origin === location.origin; }
  catch (_) { return false; }
}
function isImageURL(url) {
  return /\.(?:avif|webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(url);
}
function isVersionedAsset(url) {
  return (/\.(?:css|js)(\?.*)?$/i.test(url) && /[?&]v=/.test(url));
}
function isHTMLLike(request) {
  const dest = request.destination;
  if (dest === "document") return true;
  const url = new URL(request.url);
  return url.pathname.endsWith(".html");
}
function cacheKey(request) {
  const url = new URL(request.url);
  return new Request(url.href, { method: "GET" });
}
async function prune(cache, max) {
  try {
    const keys = await cache.keys();
    if (keys.length <= max) return;
    const toDelete = keys.length - max;
    for (let i = 0; i < toDelete; i++) await cache.delete(keys[i]);
  } catch (_) {}
}

// Install / Activate --------------------------------------------------------
self.addEventListener("install", (e) => {
  // Do not block install on network — we precache in the background
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    // Clean up old cache buckets
    const keep = new Set([PAGE_CACHE, ASSET_CACHE, IMG_CACHE, PRECACHE]);
    const names = await caches.keys();
    await Promise.all(names
      .filter(n => n.startsWith(`${PREFIX}-`) && !keep.has(n))
      .map(n => caches.delete(n)));

    // Kick off background precache warmup
    warmPrecache().catch(()=>{});
  })());
});

// Messaging API: page can push more URLs to precache -----------------------
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data && data.type === "SEED_URLS" && Array.isArray(data.urls)) {
    seedURLs(data.urls).catch(()=>{});
  }
});

// Warmup helpers ------------------------------------------------------------
async function warmPrecache() {
  // 1) Load /precache-manifest.json if present
  try {
    const res = await fetch("/precache-manifest.json", { credentials: "omit" });
    if (res.ok) {
      const manifest = await res.json();
      const urls = new Set();
      (manifest.pages  || []).forEach(u => sameOrigin(u) && urls.add(new URL(u, location.origin).pathname + new URL(u, location.origin).search));
      (manifest.assets || []).forEach(u => sameOrigin(u) && urls.add(new URL(u, location.origin).pathname + new URL(u, location.origin).search));
      (manifest.images || []).forEach(u => sameOrigin(u) && urls.add(new URL(u, location.origin).pathname + new URL(u, location.origin).search));
      await seedURLs([...urls]);
      // 2) Optionally seed from sitemap(s)
      const sitemaps = Array.isArray(manifest.sitemaps) ? manifest.sitemaps : ["/sitemap.xml"];
      for (const sm of sitemaps) {
        try { await seedFromSitemap(sm); } catch (_) {}
      }
    }
  } catch (_) {
    // silent
  }
}

async function seedFromSitemap(path) {
  if (!sameOrigin(path)) return;
  const url = new URL(path, location.origin).href;
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) return;

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  let urls = [];
  if (ct.includes("application/json")) {
    const data = await res.json();
    if (Array.isArray(data)) urls = data;
    else if (Array.isArray(data.urls)) urls = data.urls;
  } else {
    const xml = await res.text();
    // naive <loc> extractor
    urls = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)).map(m => m[1]);
  }
  const same = urls.filter(u => sameOrigin(u));
  await seedURLs(same);
}

async function seedURLs(urls) {
  if (!urls || !urls.length) return;
  const pre = await caches.open(PRECACHE);
  await Promise.all(urls.map(async (u) => {
    try {
      const absolute = new URL(u, location.origin).href;
      const req = new Request(absolute, { method: "GET" });
      const hit = await pre.match(req);
      if (hit) return;
      const res = await fetch(req);
      if (res && (res.ok || res.type === "opaque")) {
        await pre.put(req, res.clone());
      }
    } catch (_) {}
  }));
  // opportunistically copy into the appropriate runtime bucket
  copyPrecacheToRuntime().catch(()=>{});
}

async function copyPrecacheToRuntime() {
  try {
    const pre = await caches.open(PRECACHE);
    const keys = await pre.keys();
    const pageC = await caches.open(PAGE_CACHE);
    const assetC= await caches.open(ASSET_CACHE);
    const imgC  = await caches.open(IMG_CACHE);

    for (const req of keys) {
      const url = new URL(req.url);
      const res = await pre.match(req);
      if (!res) continue;
      if (isVersionedAsset(url.href)) {
        await assetC.put(req, res.clone());
      } else if (isImageURL(url.href)) {
        await imgC.put(req, res.clone());
      } else if (url.pathname.endsWith(".html") || url.pathname === "/") {
        await pageC.put(req, res.clone());
      }
    }
    prune(pageC, MAX_PAGES); prune(assetC, MAX_ASSETS); prune(imgC, MAX_IMAGES);
  } catch (_) {}
}

// Fetch handler -------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Same-origin only
  if (url.origin !== location.origin) return;

  const dest = req.destination || "";

  // Versioned CSS/JS
  if (isVersionedAsset(url.href)) {
    event.respondWith(cacheFirst(req, ASSET_CACHE, MAX_ASSETS));
    return;
  }

  // Images
  if (dest === "image" || isImageURL(url.href)) {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE, MAX_IMAGES));
    return;
  }

  // Pages (HTML / navigation)
  if (isHTMLLike(req)) {
    event.respondWith(networkFirst(req, PAGE_CACHE, MAX_PAGES));
    return;
  }

  // Fallback: pass-through
});

// Strategies ---------------------------------------------------------------
async function cacheFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  const cached = await cache.match(key);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && (res.ok || res.type === "opaque")) {
    cache.put(key, res.clone()).catch(()=>{});
    prune(cache, maxItems).catch(()=>{});
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  const cachedPromise = cache.match(key);

  const networkPromise = fetch(request)
    .then(res => {
      if (res && (res.ok || res.type === "opaque")) {
        cache.put(key, res.clone()).catch(()=>{});
        prune(cache, maxItems).catch(()=>{});
      }
      return res;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  return cached || (await networkPromise) || new Response("", { status: 504 });
}

async function networkFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  try {
    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(key, res.clone()).catch(()=>{});
      prune(cache, maxItems).catch(()=>{});
    }
    return res;
  } catch (_) {
    const cached = await cache.match(key);
    if (cached) return cached;
    // final fallback: try precache
    const pre = await caches.open(PRECACHE);
    const preHit = await pre.match(key);
    if (preHit) return preHit;
    return new Response("", { status: 504 });
  }
}
