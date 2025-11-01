/* sw.js — In the Wake Service Worker (v17)
   Changes vs v16:
   - Incremented to v17
   - Patched 'seedURLs' to prevent double cache-busting (Claude's Bug #2)
   - Patched 'copyPrecacheToRuntime' to await prune (Claude's Bug #3)
   - Patched 'handleHTML' to prevent fallback to stale cache on
     a failed version bypass (Claude's Bug #4)
   
   Changes vs v15:
   - Replaced handleHTML() with a Cache-First, Network-Bypass strategy
     to fix the "stale inline JS" bug and improve page load performance.
   - Versioned FONT_CACHE to align with SW_VERSION to prevent stale fonts.
*/

const SW_VERSION = "v17"; // <--- CHANGED: Incremented version
const PREFIX = "itw";
const PAGE_CACHE = `${PREFIX}-page-${SW_VERSION}`;
const ASSET_CACHE = `${PREFIX}-asset-${SW_VERSION}`;
const IMG_CACHE = `${PREFIX}-img-${SW_VERSION}`;
const PRECACHE = `${PREFIX}-pre-${SW_VERSION}`;
const FONT_CACHE = `${PREFIX}-font-${SW_VERSION}`; // (Fixed in v16)
const DATA_CACHE = `${PREFIX}-data-${SW_VERSION}`;

const MAX_PAGES = 60;
const MAX_ASSETS = 60;
const MAX_IMAGES = 360;
const MAX_FONTS = 30;
const MAX_DATA = 30;

const BUST = () => `v=${SW_VERSION}-${Date.now()}`;

// Manifest sources
const MANIFEST_SOURCES = [
  "/precache-manifest.json",
  "/prefetch-images.json", // optional; if missing, we skip it
];

// Utils --------------------------------------------------------------------
function sameOrigin(u) {
  try {
    return new URL(u, location.origin).origin === location.origin;
  } catch (_) {
    return false;
  }
}
function isImageURL(url) {
  return /\.(?:avif|webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(url);
}
function isFontRequest(request) {
  if (request.destination === "font") return true;
  const url = new URL(request.url);
  return /\.(?:woff2|woff|ttf|otf)(\?.*)?$/i.test(url.href);
}
function isJSONRequest(request) {
  if (request.destination === "script") return false; // Exclude JS
  const url = new URL(request.url);
  return url.pathname.endsWith(".json");
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
    if (self.registration.navigationPreload) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (_) {}
    }
    const keep = new Set([PAGE_CACHE, ASSET_CACHE, IMG_CACHE, PRECACHE, FONT_CACHE, DATA_CACHE]);
    const names = await caches.keys();
    await Promise.all(names
      .filter(n => n.startsWith(`${PREFIX}-`) && !keep.has(n))
      .map(n => caches.delete(n)));

    // Warmup in background
    warmPrecache().catch(() => {});
  })());
});

// Messaging API -------------------------------------------------------------
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data && data.type === "SEED_URLS" && Array.isArray(data.urls)) {
    seedURLs(data.urls).catch(() => {});
  }
});

// Warmup helpers ------------------------------------------------------------
async function warmPrecache() {
  try {
    const excludePaths = new Set(["/", "/index.html"]);
    const allURLs = new Set();
    let sitemaps = [];

    // Load/merge every manifest source
    for (const src of MANIFEST_SOURCES) {
      const url = new URL(src, location.origin);
      url.search += (url.search ? "&" : "?") + BUST();
      let res;
      try {
        res = await fetch(url.href, { cache: "no-store", credentials: "omit" });
      } catch {
        res = null;
      }
      if (!res || !res.ok) continue;

      const data = await res.json();

      // 1) Original precache-manifest.json shape
      if (Array.isArray(data.pages) || Array.isArray(data.assets) || Array.isArray(data.images) || Array.isArray(data.data)) {
        const pushList = (arr = []) => arr.forEach(u => {
          if (!sameOrigin(u)) return;
          const uo = new URL(u, location.origin);
          if (!excludePaths.has(uo.pathname)) allURLs.add(uo.pathname + uo.search);
        });
        pushList(data.pages);
        pushList(data.assets);
        pushList(data.images);
        pushList(data.data);

        // handle sitemaps from main manifest
        if (src.includes("precache-manifest")) {
          if (Array.isArray(data.sitemaps)) sitemaps = data.sitemaps.slice();
          else sitemaps = ["/sitemap.xml"];
        }
      }

      // 2) Image prefetch file shape: { authors:[], ships:[], other:[] }
      if (Array.isArray(data.authors) || Array.isArray(data.ships) || Array.isArray(data.other)) {
        const pushList2 = (arr = []) => arr.forEach(u => {
          if (!sameOrigin(u)) return;
          const uo = new URL(u, location.origin);
          allURLs.add(uo.pathname + uo.search);
        });
        pushList2(data.authors);
        pushList2(data.ships);
        pushList2(data.other);
      }
    }

    // Seed merged URLs
    await seedURLs([...allURLs]);

    // Seed sitemaps (if any were discovered)
    for (const sm of (sitemaps && sitemaps.length ? sitemaps : ["/sitemap.xml"])) {
      try {
        await seedFromSitemap(sm);
      } catch (_) {}
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
      const fetchURL = new URL(abs.href);
      
      // <--- CHANGED (v17): Fix for Claude's Bug #2
      // Only add cache-bust if no version param exists
      if (!/[?&]v=/i.test(fetchURL.href)) {
        fetchURL.search += (fetchURL.search ? "&" : "?") + BUST();
      }

      const reqPut = new Request(abs.href, { method: "GET" }); // cache key
      const hit = await pre.match(reqPut);
      if (hit) return;

      const res = await fetch(fetchURL.href, { cache: "no-store" });
      if (res && (res.ok || res.type === "opaque")) {
        await pre.put(reqPut, res.clone());
      }
    } catch (_) {}
  }));
  copyPrecacheToRuntime().catch(() => {});
}

async function copyPrecacheToRuntime() {
  try {
    const pre = await caches.open(PRECACHE);
    const keys = await pre.keys();
    const pageC = await caches.open(PAGE_CACHE);
    const assetC = await caches.open(ASSET_CACHE);
    const imgC = await caches.open(IMG_CACHE);
    const fontC = await caches.open(FONT_CACHE);
    const dataC = await caches.open(DATA_CACHE);

    for (const req of keys) {
      const url = new URL(req.url);
      const res = await pre.match(req);
      if (!res) continue;

      if (isVersionedAsset(url.href)) {
        await assetC.put(req, res.clone());
      } else if (isFontRequest(req)) {
        await fontC.put(req, res.clone());
      } else if (isImageURL(url.href)) {
        await imgC.put(req, res.clone());
      } else if (isJSONRequest(req)) {
        await dataC.put(req, res.clone());
      } else if (url.pathname.endsWith(".html") || url.pathname === "/") {
        await pageC.put(req, res.clone());
      }
    }
    
    // <--- CHANGED (v17): Fix for Claude's Bug #3
    // Await all prunes to prevent race conditions
    await Promise.all([
      prune(pageC, MAX_PAGES),
      prune(assetC, MAX_ASSETS),
      prune(imgC, MAX_IMAGES),
      prune(fontC, MAX_FONTS),
      prune(dataC, MAX_DATA)
    ]);

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

  // Fonts
  if (isFontRequest(req)) {
    event.respondWith(cacheFirst(req, FONT_CACHE, MAX_FONTS));
    return;
  }

  // Images
  if (dest === "image" || isImageURL(url.href)) {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE, MAX_IMAGES));
    return;
  }

  // JSON Data
  if (isJSONRequest(req)) {
    event.respondWith(staleWhileRevalidate(req, DATA_CACHE, MAX_DATA));
    return;
  }

  // Pages (HTML / navigation)
  if (isHTMLLike(req)) {
    event.respondWith(handleHTML(event, req));
    return;
  }

  // passthrough for everything else
});


// <--- CHANGED (v17): Patched to handle 'forceNetwork'
// Fix for Claude's Bug #4
async function networkFirstHTML(event, request, cache, key, forceNetwork = false) {
  try {
    const preload = event.preloadResponse ? (await event.preloadResponse) : null;
    if (preload && (preload.ok || preload.type === "opaque")) {
      cache.put(key, preload.clone()).catch(() => {});
      prune(cache, MAX_PAGES).catch(() => {});
      return preload;
    }

    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(key, res.clone()).catch(() => {});
      prune(cache, MAX_PAGES).catch(() => {});
    }
    return res;
  } catch (err) {
    // If we were forced to go to the network (bypass), do NOT
    // fall back to the cache, as it's stale. Let it fail.
    if (forceNetwork) {
      throw err; // This will trigger the final catch block in handleHTML
    }

    // Standard fallback logic (not a forced bypass)
    const cached = await cache.match(key);
    if (cached) return cached;
    const pre = await caches.open(PRECACHE);
    const preHit = await pre.match(key);
    if (preHit) return preHit;
    
    // Re-throw the original error if nothing is found
    throw err;
  }
}

// <--- CHANGED (v16/v17): Core bug fix logic
async function handleHTML(event, request) {
  const cache = await caches.open(PAGE_CACHE);
  const key = cacheKey(request);
  const url = new URL(request.url);

  // Check for hard reload headers
  const cc = (request.headers && request.headers.get("cache-control")) || "";
  const pragma = (request.headers && request.headers.get("pragma")) || "";
  const isHardReload = /\bno-cache\b/i.test(cc) || /\bno-cache\b/i.test(pragma);

  // Check for version bypass
  const isVersionBypass = url.searchParams.has('v');
  const forceNetwork = isHardReload || isVersionBypass;

  try {
    // If it's a hard reload or version bypass, go Network-First
    if (forceNetwork) {
      return await networkFirstHTML(event, request, cache, key, true); // Pass true
    }

    // --- Default: Cache-First ---
    // Try to serve from cache for speed
    const cached = await cache.match(key);
    if (cached) return cached;

    // Not in cache, go to network (which will also cache it)
    return await networkFirstHTML(event, request, cache, key, false); // Pass false
  
  } catch (err) {
    // This catch block handles all failures, including the
    // thrown error from a failed 'forceNetwork' attempt.
    console.error(`[SW ${SW_VERSION}] HTML Fetch failed, serving precache fallback. Err:`, err.message);
    const pre = await caches.open(PRECACHE);
    const preHit = await pre.match(key);
    if (preHit) return preHit;
    
    // You should have an OFFLINE_URL defined at the top
    // const OFFLINE_URL = "/offline.html";
    // const offline = await pre.match(OFFLINE_URL) || await cache.match(OFFLINE_URL);
    // if (offline) return offline;
    
    return new Response("Network error. You appear to be offline.", { status: 504 });
  }
}


// Strategies ---------------------------------------------------------------
async function cacheFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  const cached = await cache.match(key);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && (res.ok || res.type === "opaque")) {
    cache.put(key, res.clone()).catch(() => {});
    prune(cache, maxItems).catch(() => {});
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  const cachedPromise = cache.match(key);

  const networkPromise = fetch(request)
    .then(res => {
      if (res && (res.ok || res.type === "opaque")) {
        cache.put(key, res.clone()).catch(() => {});
        prune(cache, maxItems).catch(() => {});
      }
      return res;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  return cached || (await networkPromise) || new Response("", { status: 504 });
}
