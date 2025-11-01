/* sw.js — In the Wake Service Worker (v19)
   Changes vs v18:
   - Incremented to v19
   - Fixed "Real Bug" (ChatGPT): warmPrecache() now uses separate push
     functions and does NOT normalize versioned assets (CSS/JS/Images).
   - Fixed "Cache Bloat" (Grok): handleHTML() now writes to the
     PAGE_CACHE using a normalized key, preventing 'utm_' bloat.
   - Fixed "Redundant Cache" (ChatGPT): Removed OFFLINE_URL from
     warmPrecache() as it's already handled in 'activate'.
*/

const SW_VERSION = "v19";
const DEBUG = false; // Set to true for local debugging
const PREFIX = "itw";
const OFFLINE_URL = "/offline.html"; // Your branded offline page

const PAGE_CACHE = `${PREFIX}-page-${SW_VERSION}`;
const ASSET_CACHE = `${PREFIX}-asset-${SW_VERSION}`;
const IMG_CACHE = `${PREFIX}-img-${SW_VERSION}`;
const PRECACHE = `${PREFIX}-pre-${SW_VERSION}`;
const FONT_CACHE = `${PREFIX}-font-${SW_VERSION}`;
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
  "/prefetch-images.json",
];

// Utils --------------------------------------------------------------------

/**
 * Strips known tracking/noise params from a URL.
 */
function normalizeURLForCache(u) {
  const url = new URL(u, location.origin);
  // Strip tracking/noisy params
  ['v','utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','mc_cid','mc_eid'].forEach(p => url.searchParams.delete(p));
  url.hash = '';
  // Return the full URL object
  return new URL(url.pathname + url.search, location.origin);
}
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

/**
 * Caches the offline page during activation
 */
async function cacheOfflinePage() {
  try {
    const cache = await caches.open(PRECACHE);
    await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
  } catch (err) {
    if (DEBUG) console.warn(`[SW ${SW_VERSION}] Failed to precache offline page:`, err);
  }
}

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

    // Precache offline page
    await cacheOfflinePage();
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
    
    // <--- CHANGED (v19): Removed redundant OFFLINE_URL add.
    // It is now handled 100% in the 'activate' event.

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
      
      // <--- CHANGED (v19): Start of ChatGPT's "Real Bug" fix.
      // Separate push functions to control normalization.
      const pushPages = (arr = []) => arr.forEach(u => {
        if (!sameOrigin(u)) return;
        const cleanURL = normalizeURLForCache(u); // NORMALIZE pages
        if (!excludePaths.has(cleanURL.pathname)) {
          allURLs.add(cleanURL.href);
        }
      });
      
      const pushAssets = (arr = []) => arr.forEach(u => {
        if (!sameOrigin(u)) return;
        const uo = new URL(u, location.origin); // DO NOT normalize assets
        allURLs.add(uo.pathname + uo.search);
      });
      
      const pushImages = (arr = []) => arr.forEach(u => {
        if (!sameOrigin(u)) return;
        const uo = new URL(u, location.origin); // DO NOT normalize images
        allURLs.add(uo.pathname + uo.search);
      });
      
      const pushData = (arr = []) => arr.forEach(u => {
        if (!sameOrigin(u)) return;
        const cleanURL = normalizeURLForCache(u); // NORMALIZE data files
        allURLs.add(cleanURL.href);
      });
      // <--- End of v19 fix block.

      // 1) Original precache-manifest.json shape
      if (Array.isArray(data.pages) || Array.isArray(data.assets) || Array.isArray(data.images) || Array.isArray(data.data)) {
        // <--- CHANGED (v19): Call new functions
        pushPages(data.pages);
        pushAssets(data.assets);
        pushImages(data.images);
        pushData(data.data);

        // handle sitemaps from main manifest
        if (src.includes("precache-manifest")) {
          if (Array.isArray(data.sitemaps)) sitemaps = data.sitemaps.slice();
          else sitemaps = ["/sitemap.xml"];
        }
      }

      // 2) Image prefetch file shape (Assumed no normalization needed)
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
  
  // (Fixed in v18): Normalize URLs from sitemap
  const same = urls
    .filter(u => sameOrigin(u))
    .map(u => normalizeURLForCache(u).href) // Normalize
    .filter(u => {
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
      // URL 'u' is now assumed to be normalized (if page/data) or original (if asset/image)
      const abs = new URL(u, location.origin);
      const fetchURL = new URL(abs.href);
      
      // (Fixed in v17): Only add cache-bust if no version param
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
      } else if (url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname === OFFLINE_URL) {
        await pageC.put(req, res.clone());
      }
    }
    
    // (Fixed in v17): Await all prunes
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
  // passthrough
});


// (Fixed in v17)
async function networkFirstHTML(event, request, cache, key, forceNetwork = false) {
  try {
    const preload = event.preloadResponse ? (await event.preloadResponse) : null;
    if (preload && (preload.ok || preload.type === "opaque")) {
      cache.put(key, preload.clone()).catch(() => {}); // Writes normalized key
      prune(cache, MAX_PAGES).catch(() => {});
      return preload;
    }

    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(key, res.clone()).catch(() => {}); // Writes normalized key
      prune(cache, MAX_PAGES).catch(() => {});
    }
    return res;
  } catch (err) {
    if (forceNetwork) {
      throw err; 
    }
    const cached = await cache.match(key); // Tries normalized key
    if (cached) return cached;
    // Fallback to precache (will be checked in outer handleHTML)
    throw err;
  }
}

// (Core v16 fix + v18/v19 polish)
async function handleHTML(event, request) {
  const cache = await caches.open(PAGE_CACHE);
  
  // <--- CHANGED (v19): Create one normalized key for PAGE_CACHE
  // and keep the original for PRECACHE fallback.
  const normalizedKey = new Request(normalizeURLForCache(request.url).href, { method:'GET' });
  const originalKey = cacheKey(request); // For precache fallback

  // Check for hard reload headers
  const cc = (request.headers && request.headers.get("cache-control")) || "";
  const pragma = (request.headers && request.headers.get("pragma")) || "";
  const isHardReload = /\bno-cache\b/i.test(cc) || /\bno-cache\b/i.test(pragma);

  // Check for version bypass (from original URL, not normalized one)
  const isVersionBypass = (new URL(request.url)).searchParams.has('v');
  const forceNetwork = isHardReload || isVersionBypass;

  try {
    // If it's a hard reload or version bypass, go Network-First
    if (forceNetwork) {
      // Pass the NORMALIZED key for writing to the PAGE_CACHE
      return await networkFirstHTML(event, request, cache, normalizedKey, true);
    }

    // --- Default: Cache-First ---
    // Read from PAGE_CACHE using the NORMALIZED key
    const cached = await cache.match(normalizedKey);
    if (cached) return cached;

    // Not in cache, go to network (which will also cache it)
    // Pass the NORMALIZED key for writing to the PAGE_CACHE
    return await networkFirstHTML(event, request, cache, normalizedKey, false);
  
  } catch (err) {
    if (DEBUG) {
      console.error(`[SW ${SW_VERSION}] HTML Fetch failed. ForceNetwork: ${forceNetwork}. Err:`, err.message);
    }
    
    // (Fixed in v18)
    // DON'T serve stale precache if user forced a refresh.
    if (!forceNetwork) {
      const pre = await caches.open(PRECACHE);
      
      // <--- CHANGED (v19): Check both keys in PRECACHE
      // 1. Try normalized key (v19+ standard)
      let preHit = await pre.match(normalizedKey);
      // 2. Try original key (for older/non-normalized precache entries)
      if (!preHit) preHit = await pre.match(originalKey);
      
      if (preHit) return preHit;
    }
    
    // Final fallback: The offline page
    const cacheOffline = await caches.open(PRECACHE); // Use PRECACHE
    const offlinePage = await cacheOffline.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    // Absolute final fallback
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
