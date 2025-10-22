/* sw.js — In the Wake Service Worker (v13)
   Changes vs v12:
   - Exclude / and /index.html from precache/sitemap seeding
   - Respect hard reloads: bypass caches on HTML when Cache-Control: no-cache
   - Enable navigation preload for faster networkFirst navigations
   - Fetch precache sources with no-store + bust param
*/

const SW_VERSION   = "v13";
const PREFIX       = "itw";
const PAGE_CACHE   = `${PREFIX}-page-${SW_VERSION}`;
const ASSET_CACHE  = `${PREFIX}-asset-${SW_VERSION}`;
const IMG_CACHE    = `${PREFIX}-img-${SW_VERSION}`;
const PRECACHE     = `${PREFIX}-pre-${SW_VERSION}`;

const MAX_PAGES    = 60;
const MAX_ASSETS   = 60;
const MAX_IMAGES   = 360;

const BUST = () => `v=${SW_VERSION}-${Date.now()}`;

// Utils --------------------------------------------------------------------
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
  if (request.destination === "document") return true;
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
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    // Enable faster navigations
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch(_) {}
    }
    // Clean old buckets
    const keep = new Set([PAGE_CACHE, ASSET_CACHE, IMG_CACHE, PRECACHE]);
    const names = await caches.keys();
    await Promise.all(names
      .filter(n => n.startsWith(`${PREFIX}-`) && !keep.has(n))
      .map(n => caches.delete(n)));

    // Warmup in background
    warmPrecache().catch(()=>{});
  })());
});

// Messaging API -------------------------------------------------------------
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data && data.type === "SEED_URLS" && Array.isArray(data.urls)) {
    seedURLs(data.urls).catch(()=>{});
  }
});

// Warmup helpers ------------------------------------------------------------
async function warmPrecache() {
  try {
    const res = await fetch(`/precache-manifest.json?${BUST()}`, { cache: "no-store", credentials: "omit" });
    if (!res.ok) return;
    const manifest = await res.json();
    const urls = new Set();

    const excludePaths = new Set(["/", "/index.html"]);

    (manifest.pages  || []).forEach(u => {
      if (!sameOrigin(u)) return;
      const uo = new URL(u, location.origin);
      if (!excludePaths.has(uo.pathname)) urls.add(uo.pathname + uo.search);
    });
    (manifest.assets || []).forEach(u => {
      if (!sameOrigin(u)) return;
      const uo = new URL(u, location.origin);
      urls.add(uo.pathname + uo.search);
    });
    (manifest.images || []).forEach(u => {
      if (!sameOrigin(u)) return;
      const uo = new URL(u, location.origin);
      urls.add(uo.pathname + uo.search);
    });

    await seedURLs([...urls]);

    const sitemaps = Array.isArray(manifest.sitemaps) ? manifest.sitemaps : ["/sitemap.xml"];
    for (const sm of sitemaps) {
      try { await seedFromSitemap(sm); } catch (_) {}
    }
  } catch (_) {}
}

async function seedFromSitemap(path) {
  if (!sameOrigin(path)) return;
  const url = new URL(path, location.origin);
  url.search += (url.search ? "&" : "?") + BUST();

  const res = await fetch(url.href, { cache: "no-store", credentials: "omit" });
  if (!res.ok) return;

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  let urls = [];
  if (ct.includes("application/json")) {
    const data = await res.json();
    if (Array.isArray(data)) urls = data;
    else if (Array.isArray(data.urls)) urls = data.urls;
  } else {
    const xml = await res.text();
    urls = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)).map(m => m[1]);
  }
  // Exclude index routes
  const same = urls.filter(u => {
    if (!sameOrigin(u)) return false;
    const p = new URL(u, location.origin).pathname;
    return p !== "/" && p !== "/index.html";
  });
  await seedURLs(same);
}

async function seedURLs(urls) {
  if (!urls || !urls.length) return;
  const pre = await caches.open(PRECACHE);
  await Promise.all(urls.map(async (u) => {
    try {
      const abs = new URL(u, location.origin);
      // Add a tiny bust only for seeding fetch, not for lookup keys
      const fetchURL = new URL(abs.href);
      fetchURL.search += (fetchURL.search ? "&" : "?") + BUST();

      const reqPut = new Request(abs.href, { method: "GET" });     // cache key
      const hit = await pre.match(reqPut);
      if (hit) return;

      const res = await fetch(fetchURL.href, { cache: "no-store" });
      if (res && (res.ok || res.type === "opaque")) {
        await pre.put(reqPut, res.clone());
      }
    } catch (_) {}
  }));
  copyPrecacheToRuntime().catch(()=>{});
}

async function copyPrecacheToRuntime() {
  try {
    const pre   = await caches.open(PRECACHE);
    const keys  = await pre.keys();
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
        // still allow other pages to be available offline
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
    event.respondWith(handleHTML(event, req));
    return;
  }

  // passthrough for everything else
});

async function handleHTML(event, request) {
  // Respect hard reloads: bypass caches
  const cc = (request.headers && request.headers.get("cache-control")) || "";
  const pragma = (request.headers && request.headers.get("pragma")) || "";
  const hardReload = /\bno-cache\b/i.test(cc) || /\bno-cache\b/i.test(pragma);

  const cache = await caches.open(PAGE_CACHE);
  const key   = cacheKey(request);

  try {
    // navigation preload (if available)
    const preload = event.preloadResponse ? (await event.preloadResponse) : null;
    if (!hardReload && preload && (preload.ok || preload.type === "opaque")) {
      cache.put(key, preload.clone()).catch(()=>{});
      prune(cache, MAX_PAGES).catch(()=>{});
      return preload;
    }

    // Always prefer network
    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(key, res.clone()).catch(()=>{});
      prune(cache, MAX_PAGES).catch(()=>{});
    }
    return res;
  } catch (_) {
    // Network failed: return cached (page or precache)
    const cached = await cache.match(key);
    if (cached) return cached;
    const pre = await caches.open(PRECACHE);
    const preHit = await pre.match(key);
    if (preHit) return preHit;
    return new Response("", { status: 504 });
  }
}

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
