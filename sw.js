/* sw.js — In the Wake Service Worker (v20.1a)
   Key features:
   - Correct versioning: preserves ?v= and never double-appends
   - Normalizes "/" to "/index.html" for PAGE cache keys
   - Cache partitioning + LRU-style pruning via metadata cache
   - Strategies: cacheFirst(assets/fonts), SWR(images/json), networkFirst(html)
   - WebP-first image serving with graceful fallback
   - JSON stale-if-error (default 1h)
   - Warm-up from precache-manifest.json + sitemap; dedupbed seeding
   - Message API: SEED_URLS, GET_CACHE_STATS, GET_ERROR_LOG
   - Health endpoint: /__sw_health (JSON)
*/

const SW_VERSION = "v20.1a";
let DEBUG = false; // You can toggle via site-cache.js message: {type:'SET_DEBUG', enabled:true}

const PREFIX = "itw";
const OFFLINE_URL = "/offline.html";
const MANIFEST_URL = "/precache-manifest.json";

// Cache names
const CACHE = {
  PAGE:     `${PREFIX}-page-${SW_VERSION}`,
  ASSET:    `${PREFIX}-asset-${SW_VERSION}`,
  IMG:      `${PREFIX}-img-${SW_VERSION}`,
  FONT:     `${PREFIX}-font-${SW_VERSION}`,
  DATA:     `${PREFIX}-data-${SW_VERSION}`,
  PRECACHE: `${PREFIX}-pre-${SW_VERSION}`,
  META:     `${PREFIX}-meta-${SW_VERSION}` // LRU metadata store
};

// Defaults (overridable by manifest.config)
let CONFIG = {
  maxPages: 60,
  maxAssets: 60,
  maxImages: 360,
  maxFonts: 30,
  maxData: 30,
  staleMaxAge: 3600000 // 1h JSON stale-if-error
};

const ERROR_LOG = [];
const MAX_ERRORS = 50;

// ---------- Utils ----------
function logError(context, error, url = "") {
  ERROR_LOG.push({
    time: Date.now(),
    context,
    message: error?.message || String(error),
    name: error?.name || "Error",
    url,
    sw_version: SW_VERSION
  });
  if (ERROR_LOG.length > MAX_ERRORS) ERROR_LOG.shift();
  if (DEBUG) console.warn(`[SW ${SW_VERSION}] ${context}:`, error, url);
}

function sameOrigin(u) {
  try { return new URL(u, location.origin).origin === location.origin; } catch { return false; }
}

function normalizeURLForCache(u) {
  const url = new URL(u, location.origin);
  if (url.pathname === "/") url.pathname = "/index.html"; // normalize root
  // strip only marketing noise, keep version pins
  ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","fbclid","gclid","mc_cid","mc_eid"]
    .forEach(p => url.searchParams.delete(p));
  url.hash = "";
  return new URL(url.pathname + url.search, location.origin);
}

function isImageURL(url) { return /\.(?:avif|webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(url); }
function isFontRequest(req) { return req.destination === "font" || /\.(?:woff2?|ttf|otf)(\?.*)?$/i.test(req.url); }
function isJSONRequest(req) {
  if (req.destination === "script") return false;
  return /\.json(\?.*)?$/i.test(req.url);
}
function isHTMLLike(req) {
  if (req.destination === "document") return true;
  const url = new URL(req.url);
  return url.pathname.endsWith(".html") || url.pathname === "/";
}
function isVersionedAsset(url) {
  return /\.(?:css|js)(\?.*)?$/i.test(url) && /[?&]v=[^&]+/i.test(url);
}
function cacheKey(request) {
  const url = new URL(request.url);
  return new Request(url.href, { method: "GET" });
}

async function fetchWithTimeout(request, ms = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(request, { signal: controller.signal });
    clearTimeout(t);
    return res;
  } catch (err) {
    clearTimeout(t);
    throw err;
  }
}

// ---------- LRU helpers ----------
async function updateLRU(cacheName, url) {
  try {
    const meta = await caches.open(CACHE.META);
    await meta.put(new Request(url + ":lru"), new Response(JSON.stringify({ lastAccess: Date.now() })));
  } catch (_) {}
}

async function prune(cacheName, max) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= max) return;

    const meta = await caches.open(CACHE.META);
    const items = await Promise.all(keys.map(async k => {
      const mk = await meta.match(k.url + ":lru");
      const data = mk ? await mk.json() : { lastAccess: 0 };
      return { key: k, lastAccess: data.lastAccess || 0 };
    }));

    items.sort((a, b) => a.lastAccess - b.lastAccess);
    const toDelete = items.slice(0, items.length - max);
    await Promise.all(toDelete.map(i => Promise.all([
      cache.delete(i.key),
      meta.delete(i.key.url + ":lru")
    ])));
  } catch (_) {}
}

// ---------- Install / Activate ----------
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    await self.skipWaiting();
    try {
      const c = await caches.open(CACHE.PRECACHE);
      await c.add(new Request(OFFLINE_URL, { cache: "reload" }));
    } catch (_) {}
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    try {
      await self.clients.claim();
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.enable(); } catch (_) {}
      }
      // cleanup old caches
      const keep = new Set(Object.values(CACHE));
      const names = await caches.keys();
      await Promise.all(names.filter(n => n.startsWith(PREFIX) && !keep.has(n)).map(n => caches.delete(n)));

      // load config & warm precache
      await loadConfig();
      await warmPrecache().catch(() => {});
    } catch (err) {
      logError("activate", err);
    }
  })());
});

async function loadConfig() {
  try {
    const r = await fetch(MANIFEST_URL, { cache: "no-store", credentials: "omit" });
    if (!r.ok) return;
    const data = await r.json();
    if (data && data.config) {
      CONFIG = { ...CONFIG, ...data.config };
      if (typeof CONFIG.debug === "boolean") DEBUG = CONFIG.debug;
    }
  } catch (err) {
    logError("loadConfig", err);
  }
}

// ---------- Messaging ----------
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SEED_URLS" && Array.isArray(data.urls)) {
    seedURLs(data.urls, data.priority || "normal").catch(() => {});
    return;
  }
  if (data.type === "GET_CACHE_STATS" && event.ports[0]) {
    getCacheStats().then(stats => event.ports[0].postMessage({ type: "CACHE_STATS", stats }));
    return;
  }
  if (data.type === "GET_ERROR_LOG" && event.ports[0]) {
    event.ports[0].postMessage({ type: "ERROR_LOG", errors: ERROR_LOG });
    return;
  }
  if (data.type === "SET_DEBUG") {
    DEBUG = !!data.enabled;
    return;
  }
});

// ---------- Health endpoint ----------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (url.pathname === "/__sw_health") {
    event.respondWith((async () => {
      const stats = await getCacheStats();
      const body = { version: SW_VERSION, time: Date.now(), stats };
      return new Response(JSON.stringify(body), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    })());
    return;
  }

  // routing
  const dest = req.destination || "";

  if (isVersionedAsset(url.href)) {
    event.respondWith(cacheFirst(req, CACHE.ASSET, CONFIG.maxAssets));
    return;
  }
  if (isFontRequest(req)) {
    event.respondWith(cacheFirst(req, CACHE.FONT, CONFIG.maxFonts));
    return;
  }
  if (dest === "image" || isImageURL(url.href)) {
    event.respondWith(handleImage(req));
    return;
  }
  if (isJSONRequest(req)) {
    event.respondWith(staleIfError(req, CACHE.DATA, CONFIG.maxData, CONFIG.staleMaxAge));
    return;
  }
  if (isHTMLLike(req)) {
    event.respondWith(handleHTML(event, req));
    return;
  }
  // passthrough for everything else
});

// ---------- Strategies ----------
async function cacheFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  const cached = await cache.match(key);
  if (cached) {
    updateLRU(cacheName, key.url);
    return cached;
  }
  const res = await fetchWithTimeout(request);
  if (res && (res.ok || res.type === "opaque")) {
    cache.put(key, res.clone()).catch(() => {});
    prune(cacheName, maxItems).catch(() => {});
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);

  const cachedPromise = cache.match(key);
  const networkPromise = fetchWithTimeout(request)
    .then(res => {
      if (res && (res.ok || res.type === "opaque")) {
        cache.put(key, res.clone()).catch(() => {});
        prune(cacheName, maxItems).catch(() => {});
      }
      return res;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  if (cached) {
    updateLRU(cacheName, key.url);
    return cached;
  }
  return (await networkPromise) || new Response("", { status: 504 });
}

async function staleIfError(request, cacheName, maxItems, maxAge) {
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  try {
    const res = await fetchWithTimeout(request);
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(key, res.clone()).catch(() => {});
      prune(cacheName, maxItems).catch(() => {});
    }
    return res;
  } catch (err) {
    const cached = await cache.match(key);
    if (cached) {
      const dateHdr = cached.headers.get("date");
      const age = dateHdr ? (Date.now() - new Date(dateHdr).getTime()) : 0;
      if (!age || age < maxAge) {
        updateLRU(cacheName, key.url);
        return cached;
      }
    }
    throw err;
  }
}

async function handleHTML(event, request) {
  const pageCache = await caches.open(CACHE.PAGE);

  // normalized key for pages
  const norm = normalizeURLForCache(request.url);
  const key = new Request(norm.href, { method: "GET" });

  const cc = (request.headers.get("cache-control") || "") + " " + (request.headers.get("pragma") || "");
  const hardReload = /\bno-cache\b/i.test(cc);
  const forceNetwork = hardReload || new URL(request.url).searchParams.has("v");

  try {
    // navigation preload has priority
    const preload = event.preloadResponse ? (await event.preloadResponse) : null;
    if (!forceNetwork && preload && (preload.ok || preload.type === "opaque")) {
      pageCache.put(key, preload.clone()).catch(() => {});
      prune(CACHE.PAGE, CONFIG.maxPages).catch(() => {});
      return preload;
    }

    const res = await fetchWithTimeout(request);
    if (res && (res.ok || res.type === "opaque")) {
      // Optionally inject critical CSS if you cache /assets/critical.css
      const enhanced = await maybeInjectCriticalCSS(res.clone());
      pageCache.put(key, enhanced).catch(() => {});
      prune(CACHE.PAGE, CONFIG.maxPages).catch(() => {});
    }
    return res;
  } catch (err) {
    logError("handleHTML", err, request.url);
    const cached = await pageCache.match(key);
    if (cached) return cached;

    const pre = await caches.open(CACHE.PRECACHE);
    const fallback = await pre.match(key) || await pre.match(OFFLINE_URL);
    return fallback || new Response("Offline", { status: 503 });
  }
}

async function maybeInjectCriticalCSS(response) {
  try {
    const ct = (response.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("text/html")) return response;
    const assetCache = await caches.open(CACHE.ASSET);
    const critical = await assetCache.match("/assets/critical.css");
    if (!critical) return response;

    const [html, css] = await Promise.all([response.text(), critical.text()]);
    if (html.includes("<!-- critical-css-injected -->")) {
      return new Response(html, { headers: response.headers, status: response.status });
    }
    const enhanced = html.replace(
      "</head>",
      `<style>/* critical-css-injected */\n${css}\n</style></head>`
    );
    return new Response(enhanced, { headers: response.headers, status: response.status });
  } catch (_) {
    return response;
  }
}

// WebP-first images, fallback to original + SWR
async function handleImage(request) {
  const acceptsWebP = request.headers.get("accept")?.includes("image/webp");
  const url = new URL(request.url);
  if (acceptsWebP && /\.(jpe?g|png)(\?.*)?$/i.test(url.pathname)) {
    const webpURL = url.pathname.replace(/\.(jpe?g|png)$/i, ".webp") + url.search;
    try {
      const res = await fetchWithTimeout(webpURL);
      if (res && res.ok) {
        const c = await caches.open(CACHE.IMG);
        await c.put(new Request(new URL(webpURL, location.origin).href), res.clone());
        prune(CACHE.IMG, CONFIG.maxImages).catch(() => {});
        return res;
      }
    } catch (_) { /* fall through */ }
  }
  return staleWhileRevalidate(request, CACHE.IMG, CONFIG.maxImages);
}

// ---------- Warmup / Seeding ----------
async function warmPrecache() {
  try {
    const r = await fetch(MANIFEST_URL, { cache: "no-store", credentials: "omit" });
    if (!r.ok) return;
    const data = await r.json();

    // optional: adjust config
    if (data.config) {
      CONFIG = { ...CONFIG, ...data.config };
      if (typeof CONFIG.debug === "boolean") DEBUG = CONFIG.debug;
    }

    // gather URLs (pages/assets/images/data)
    const urls = new Set();

    const push = (arr = [], normalize = true) => {
      arr.forEach(entry => {
        const href = typeof entry === "string" ? entry : entry.url;
        if (!sameOrigin(href)) return;
        const u = normalize ? normalizeURLForCache(href).href : new URL(href, location.origin).href;
        urls.add(u);
      });
    };

    if (Array.isArray(data.pages))  push(data.pages);
    if (Array.isArray(data.assets)) push(data.assets, false);
    if (Array.isArray(data.images)) push(data.images, false);
    if (Array.isArray(data.data))   push(data.data);

    await seedURLs([...urls], "high");

    // sitemaps
    const sitemaps = Array.isArray(data.sitemaps) ? data.sitemaps : ["/sitemap.xml"];
    for (const sm of sitemaps) {
      try { await seedFromSitemap(sm); } catch (err) { logError("seedFromSitemap", err, sm); }
    }
  } catch (err) {
    logError("warmPrecache", err);
  }
}

async function seedFromSitemap(path) {
  if (!sameOrigin(path)) return;
  const u = new URL(path, location.origin);
  u.search += (u.search ? "&" : "?") + `sv=${SW_VERSION}`;

  const res = await fetch(u.href, { cache: "no-store", credentials: "omit" });
  if (!res.ok) return;

  let urls = [];
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("application/json")) {
    const data = await res.json();
    urls = Array.isArray(data) ? data : (Array.isArray(data.urls) ? data.urls : []);
  } else {
    const text = await res.text();
    // DOMParser is supported in SW; fall back to regex if needed
    try {
      const doc = new DOMParser().parseFromString(text, "text/xml");
      urls = Array.from(doc.querySelectorAll("loc")).map(n => (n.textContent || "").trim());
    } catch {
      urls = Array.from(text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map(m => m[1]);
    }
  }

  const clean = urls
    .filter(u => sameOrigin(u))
    .map(u => normalizeURLForCache(u).href)
    .filter(u => {
      const p = new URL(u).pathname;
      return p !== "/" && p !== "/index.html";
    });

  await seedURLs(clean, "normal");
}

async function seedURLs(urls, priority = "normal") {
  if (!urls || !urls.length) return;

  // dedupe and absolutize
  const unique = [...new Set(urls.map(u => {
    try { return new URL(u, location.origin).href; } catch { return null; }
  }).filter(Boolean))];

  if (DEBUG) console.log(`[SW ${SW_VERSION}] Seeding ${unique.length} URLs (priority: ${priority})`);

  const pre = await caches.open(CACHE.PRECACHE);
  await Promise.all(unique.map(async (href) => {
    try {
      const reqKey = new Request(href, { method: "GET" });
      const hit = await pre.match(reqKey);
      if (hit) return;

      // cache-bust ONLY if no query at all (avoid double ?v=)
      const fetchURL = new URL(href);
      if (!fetchURL.search) fetchURL.search = `?v=${SW_VERSION}`;

      const res = await fetch(fetchURL.href, { cache: "no-store", credentials: "omit" });
      if (res && (res.ok || res.type === "opaque")) {
        await pre.put(reqKey, res.clone());
      }
    } catch (err) {
      logError("seedURLs", err, href);
    }
  }));

  await copyPrecacheToRuntime().catch(err => logError("copyPrecacheToRuntime", err));
}

async function copyPrecacheToRuntime() {
  const pre = await caches.open(CACHE.PRECACHE);
  const keys = await pre.keys();

  const pageC = await caches.open(CACHE.PAGE);
  const assetC = await caches.open(CACHE.ASSET);
  const imgC  = await caches.open(CACHE.IMG);
  const fontC = await caches.open(CACHE.FONT);
  const dataC = await caches.open(CACHE.DATA);

  for (const req of keys) {
    const res = await pre.match(req);
    if (!res) continue;

    const url = new URL(req.url);

    if (isVersionedAsset(url.href)) {
      await assetC.put(req, res.clone()).catch(() => {});
    } else if (isFontRequest(req)) {
      await fontC.put(req, res.clone()).catch(() => {});
    } else if (isImageURL(url.href)) {
      await imgC.put(req, res.clone()).catch(() => {});
    } else if (isJSONRequest(req)) {
      await dataC.put(req, res.clone()).catch(() => {});
    } else if (url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname === OFFLINE_URL) {
      const norm = new Request(normalizeURLForCache(req.url).href, { method: "GET" });
      await pageC.put(norm, res.clone()).catch(() => {});
    }
  }

  await Promise.all([
    prune(CACHE.PAGE,  CONFIG.maxPages),
    prune(CACHE.ASSET, CONFIG.maxAssets),
    prune(CACHE.IMG,   CONFIG.maxImages),
    prune(CACHE.FONT,  CONFIG.maxFonts),
    prune(CACHE.DATA,  CONFIG.maxData)
  ]);
}

// ---------- Cache stats ----------
async function getCacheStats() {
  const out = {};
  for (const [label, name] of Object.entries(CACHE)) {
    try {
      const c = await caches.open(name);
      const keys = await c.keys();
      out[label] = { name, count: keys.length };
    } catch {
      out[label] = { name, error: true };
    }
  }
  // Storage estimate if available
  try {
    if ("estimate" in navigator.storage) {
      const est = await navigator.storage.estimate();
      out.storage = {
        usageBytes: est.usage || 0,
        quotaBytes: est.quota || 0
      };
    }
  } catch (_) {}
  return out;
}
