/* sw.js — In the Wake Service Worker (v20.4) */

const SW_VERSION = "v20.4";
const PREFIX = "itw";
const OFFLINE_URL = "/offline.html";

const CACHE = {
  PAGE:     `${PREFIX}-page-${SW_VERSION}`,
  ASSET:    `${PREFIX}-asset-${SW_VERSION}`,
  IMG:      `${PREFIX}-img-${SW_VERSION}`,
  FONT:     `${PREFIX}-font-${SW_VERSION}`,
  DATA:     `${PREFIX}-data-${SW_VERSION}`,
  PRECACHE: `${PREFIX}-pre-${SW_VERSION}`,
  META:     `${PREFIX}-meta-${SW_VERSION}` // LRU + timestamps
};

let CONFIG = {
  maxPages: 60,
  maxAssets: 60,
  maxImages: 360,
  maxFonts: 30,
  maxData: 30,
  staleMaxAge: 60 * 60 * 1000 // 1h default for JSON (non-calculator)
};

const MANIFEST_URL = "/precache-manifest.json";
const ERROR_LOG = [];
const MAX_ERRORS = 50;

// Calculator data + helpers
const CALC_JSON_PATH = "/assets/data/lines/royal-caribbean.json";
const CALC_JSON_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days bounded-stale

/* ---------------- Lifecycle ---------------- */

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    await self.skipWaiting();
    const c = await caches.open(CACHE.PRECACHE);
    await c.add(new Request(OFFLINE_URL, { cache: "reload" })).catch(()=>{});
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    if (self.registration.navigationPreload) { try{ await self.registration.navigationPreload.enable(); }catch(_){} }
    await cleanupOldCaches();
    await loadConfig();
    await warmPrecache().catch(()=>{});
  })());
});

async function cleanupOldCaches(){
  const keep = new Set(Object.values(CACHE));
  const names = await caches.keys();
  await Promise.all(names.filter(n => n.startsWith(PREFIX) && !keep.has(n)).map(n => caches.delete(n)));
}

async function loadConfig(){
  try{
    const res = await fetch(MANIFEST_URL, { cache: "no-store", credentials:"omit" });
    if (res.ok){
      const data = await res.json();
      if (data && data.config) CONFIG = { ...CONFIG, ...data.config };
    }
  }catch(_){}
}

/* ---------------- Messaging ---------------- */

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SEED_URLS" && Array.isArray(data.urls)) {
    seedURLs(data.urls, data.priority || "normal").catch(()=>{});
  }
  if (data.type === "GET_CACHE_STATS" && event.ports[0]) {
    getCacheStats().then(stats => event.ports[0].postMessage({ type:"CACHE_STATS", stats }));
  }
  if (data.type === "GET_ERROR_LOG" && event.ports[0]) {
    event.ports[0].postMessage({ type:"ERROR_LOG", errors: ERROR_LOG });
  }
  // Accept BOTH spellings from the page (bridge uses FORCE_DATA_REFRESH)
  if (data.type === "FORCE_REFRESH_DATA" || data.type === "FORCE_DATA_REFRESH") {
    event.waitUntil(refreshAndNotify(CALC_JSON_PATH));
  }
});

/* ---------------- Fetch routing (with small allowlist for cross-origin) ---------------- */

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // --- Allowlist a couple cross-origin resources (optional QoL) ---
  if (url.origin !== location.origin) {
    // FX APIs: network-first with bounded-stale fallback (12h)
    if (url.hostname.includes("frankfurter.app") || url.hostname.includes("exchangerate.host")) {
      event.respondWith(staleIfErrorTimestamped(req, CACHE.DATA, CONFIG.maxData, 12*60*60*1000, { event }));
      return;
    }
    // Chart.js CDN: cache-first (so it works offline)
    if (url.hostname.includes("cdn.jsdelivr.net")) {
      event.respondWith(cacheFirst(req, CACHE.ASSET, CONFIG.maxAssets));
      return;
    }
    return; // ignore all other cross-origin (browser handles normally)
  }

  // --- From here: same-origin only ---

  // Health probe
  if (url.pathname === "/__sw_health") {
    event.respondWith((async ()=>{
      const stats = await getCacheStats();
      const calculator = await getCalculatorFreshness();
      return new Response(JSON.stringify({
        version: SW_VERSION,
        stats,
        calculator
      }), { headers: { "content-type":"application/json", "cache-control":"no-store" } });
    })());
    return;
  }

  // ---------- Calculator: bounded-stale JSON + headers + background refresh ----------
  if (isCalculatorData(url)) {
    event.respondWith(staleIfErrorTimestamped(req, CACHE.DATA, CONFIG.maxData, CALC_JSON_MAX_AGE, { event }));
    return;
  }

  const dest = req.destination || "";

  if (isVersionedAsset(url.href)) {
    event.respondWith(cacheFirst(req, CACHE.ASSET, CONFIG.maxAssets)); return;
  }
  if (isFontRequest(req)) {
    event.respondWith(cacheFirst(req, CACHE.FONT, CONFIG.maxFonts)); return;
  }
  if (dest === "image" || isImageURL(url.href)) {
    event.respondWith(handleImage(req)); return;
  }
  if (isJSONRequest(req)) {
    event.respondWith(staleIfError(req, CACHE.DATA, CONFIG.maxData, CONFIG.staleMaxAge)); return;
  }
  if (isHTMLLike(req)) {
    // Opportunistic warmup when user visits the calculator page (no /planning/)
    const p = url.pathname;
    if (p === "/drinks-calculator.html" || p === "/drinks-calculator" || p === "/drinks/") {
      event.waitUntil(warmCalculatorCache());
    }
    event.respondWith(handleHTML(event, req)); return;
  }
  // passthrough
});

/* ---------------- Strategies: HTML ---------------- */

async function handleHTML(event, request){
  const pageCache = await caches.open(CACHE.PAGE);
  const normalized = normalizeURLForCache(request.url);
  const key = new Request(normalized.href, { method:"GET" });

  const isHardReload =
    /\bno-cache\b/i.test(request.headers.get("cache-control")||"") ||
    /\bno-cache\b/i.test(request.headers.get("pragma")||"");
  const forceNetwork = isHardReload || new URL(request.url).searchParams.has("v");

  try{
    const preload = event.preloadResponse ? (await event.preloadResponse) : null;
    if (preload && (preload.ok || preload.type === "opaque" || preload.type === "cors")) {
      pageCache.put(key, preload.clone()).catch(()=>{});
      updateLRU(CACHE.PAGE, key.url);
      prune(CACHE.PAGE, CONFIG.maxPages).catch(()=>{});
      return preload;
    }

    const res = forceNetwork ? await fetchWithTimeout(request, 8000) : await fetchWithTimeout(request, 8000);
    if (res && (res.ok || res.type === "opaque" || res.type === "cors")) {
      const enhanced = await injectCriticalCSS(res.clone());
      pageCache.put(key, enhanced).catch(()=>{});
      updateLRU(CACHE.PAGE, key.url);
      prune(CACHE.PAGE, CONFIG.maxPages).catch(()=>{});
    }
    return res;
  }catch(err){
    logError("handleHTML", err, request.url);
    const cached = await pageCache.match(key);
    if (cached) return cached;

    const pre = await caches.open(CACHE.PRECACHE);
    const preHit = await pre.match(key) || await pre.match(OFFLINE_URL);
    return preHit || new Response("Offline", { status: 503 });
  }
}

async function injectCriticalCSS(response){
  try{
    const ct = response.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return response;

    const html = await response.text();
    if (html.includes("<!-- critical-css-injected -->")) {
      return new Response(html, { headers: response.headers, status: response.status });
    }
    const assetCache = await caches.open(CACHE.ASSET);
    const cssRes = await assetCache.match("/assets/critical.css");
    if (!cssRes) return new Response(html, { headers: response.headers, status: response.status });

    const css = await cssRes.text();
    const upgraded = html.replace("</head>", `<style>/* critical-css-injected */${css}</style></head>`);
    return new Response(upgraded, { headers: response.headers, status: response.status });
  }catch(_){ return response; }
}

/* ---------------- Strategies: images ---------------- */

async function handleImage(request){
  const acceptsWebP = request.headers.get("accept")?.includes("image/webp");
  const url = new URL(request.url);
  if (acceptsWebP && /\.(jpe?g|png)(\?.*)?$/i.test(url.pathname)) {
    const webpURL = url.pathname.replace(/\.(jpe?g|png)$/i, ".webp") + url.search;
    try{
      const res = await fetchWithTimeout(webpURL, 8000);
      if (res && (res.ok || res.type === "opaque" || res.type === "cors")) {
        const imgCache = await caches.open(CACHE.IMG);
        const key = new Request(new URL(webpURL, location.origin).href, { method:"GET" });
        imgCache.put(key, res.clone()).catch(()=>{});
        updateLRU(CACHE.IMG, key.url);
        prune(CACHE.IMG, CONFIG.maxImages).catch(()=>{});
        return res;
      }
    }catch(_){}
  }
  return staleWhileRevalidate(request, CACHE.IMG, CONFIG.maxImages);
}

/* ---------------- Generic strategies ---------------- */

async function cacheFirst(request, cacheName, maxItems){
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  const cached = await cache.match(key);
  if (cached){ updateLRU(cacheName, key.url); return cached; }
  const res = await fetchWithTimeout(request, 8000);
  if (res && (res.ok || res.type === "opaque" || res.type === "cors")){
    cache.put(key, res.clone()).catch(()=>{});
    updateLRU(cacheName, key.url);
    prune(cacheName, maxItems).catch(()=>{});
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName, maxItems){
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  const cachedPromise = cache.match(key);
  const networkPromise = fetchWithTimeout(request, 8000)
    .then(res => {
      if (res && (res.ok || res.type === "opaque" || res.type === "cors")){
        cache.put(key, res.clone()).catch(()=>{});
        updateLRU(cacheName, key.url);
        prune(cacheName, maxItems).catch(()=>{});
      }
      return res;
    })
    .catch(()=>null);
  const cached = await cachedPromise;
  return cached || (await networkPromise) || new Response("", { status: 504 });
}

async function staleIfError(request, cacheName, maxItems, maxAge){
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  try{
    const res = await fetchWithTimeout(request, 8000);
    if (res && (res.ok || res.type === "opaque" || res.type === "cors")){
      const stamped = await withTimestamp(res.clone());
      cache.put(key, stamped.clone()).catch(()=>{});
      updateLRU(cacheName, key.url);
      prune(cacheName, maxItems).catch(()=>{});
    }
    return res;
  }catch(err){
    const cached = await cache.match(key);
    if (cached){
      const age = await ageMsOf(cached);
      if (age < maxAge){
        updateLRU(cacheName, key.url);
        return cached;
      }
    }
    throw err;
  }
}

/* ---------- Network-first with bounded-stale + headers + background refresh ---------- */
async function staleIfErrorTimestamped(request, cacheName, maxItems, maxAge, { event } = {}){
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);

  try{
    const res = await fetchWithTimeout(request, 8000);
    if (res && (res.ok || res.type === "opaque" || res.type === "cors")){
      const stamped = await withTimestamp(res.clone());
      cache.put(key, stamped.clone()).catch(()=>{});
      updateLRU(cacheName, key.url);
      prune(cacheName, maxItems).catch(()=>{});
      return stamped;
    }
    throw new Error("non-ok");
  }catch(err){
    const cached = await cache.match(key);
    if (cached){
      const age = await ageMsOf(cached);
      if (age < maxAge){
        const conf = confidenceFromAge(age, maxAge);
        const decorated = await withExtraHeaders(cached, {
          "X-SW-Fallback": "1",
          "X-SW-Age-MS": String(age),
          "X-SW-Confidence": conf
        });
        if (event) event.waitUntil(refreshAndNotify(request.url));
        updateLRU(cacheName, key.url);
        return decorated;
      }
    }
    logError("staleIfErrorTimestamped", err, request.url);
    throw err;
  }
}

/* ---------------- Warmup + seeding ---------------- */

async function warmPrecache(){
  try{
    const res = await fetch(MANIFEST_URL, { cache:"no-store", credentials:"omit" });
    if (!res.ok) return;
    const data = await res.json();

    const collect = (arr=[]) => arr.map(x => typeof x === "string" ? x : x.url).filter(Boolean);
    const urls = [
      ...collect(data.pages || []),
      ...collect(data.assets || []),
      ...collect(data.images || []),
      ...collect(data.data  || [])
    ].filter(u => sameOrigin(u));

    await seedURLs(urls, "high");

    for (const sm of (data.sitemaps || ["/sitemap.xml"])) {
      await seedFromSitemap(sm).catch(()=>{});
    }
  }catch(_){}
}

async function warmCalculatorCache(){
  try{
    const urls = [
      "/drinks-calculator.html",
      "/assets/js/drink-calculator.app.js",
      "/assets/js/drink-worker.js",
      CALC_JSON_PATH
    ];
    await seedURLs(urls, "high");
  }catch(_){}
}

async function seedFromSitemap(path){
  if (!sameOrigin(path)) return;
  const bust = path.includes("?") ? "&" : "?";
  const res = await fetch(path + `${bust}v=${SW_VERSION}`, { cache:"no-store", credentials:"omit" });
  if (!res.ok) return;

  const ct = (res.headers.get("content-type")||"").toLowerCase();
  let urls = [];
  if (ct.includes("application/json")){
    const data = await res.json();
    urls = Array.isArray(data) ? data : (Array.isArray(data.urls) ? data.urls : []);
  }else{
    const text = await res.text();
    try{
      const doc = new DOMParser().parseFromString(text, "text/xml");
      urls = Array.from(doc.querySelectorAll("loc")).map(loc => (loc.textContent||"").trim()).filter(Boolean);
    }catch(_){
      urls = Array.from(text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)).map(m => m[1].trim());
    }
  }

  const clean = urls
    .filter(u => sameOrigin(u))
    .map(u => normalizeURLForCache(u).href)
    .filter(u => {
      const p = new URL(u, location.origin).pathname;
      return p !== "/" && p !== "/index.html";
    });

  await seedURLs(clean, "normal");
}

async function seedURLs(urls, _priority){
  if (!urls || !urls.length) return;
  const unique = [...new Set(urls.map(u => { try{ return new URL(u, location.origin).href; }catch{ return null; } }).filter(Boolean))];
  const pre = await caches.open(CACHE.PRECACHE);

  await Promise.all(unique.map(async (absHref) => {
    try{
      const abs = new URL(absHref, location.origin);
      const reqKey = new Request(abs.href, { method:"GET" }); // cache key (no bust)
      const hit = await pre.match(reqKey);
      if (hit) return;

      const fetchURL = new URL(abs.href);
      if (!fetchURL.search) fetchURL.search = `?v=${SW_VERSION}`; // only when no query

      const res = await fetch(fetchURL.href, { cache:"no-store", credentials:"omit" });
      if (res && (res.ok || res.type === "opaque" || res.type === "cors")) {
        await pre.put(reqKey, res.clone());
      }
    }catch(err){
      logError("seedURLs", err, absHref);
    }
  }));

  await copyPrecacheToRuntime();
}

async function copyPrecacheToRuntime(){
  try{
    const pre = await caches.open(CACHE.PRECACHE);
    const keys = await pre.keys();
    const pageC = await caches.open(CACHE.PAGE);
    const assetC= await caches.open(CACHE.ASSET);
    const imgC  = await caches.open(CACHE.IMG);
    const fontC = await caches.open(CACHE.FONT);
    const dataC = await caches.open(CACHE.DATA);

    for (const req of keys){
      const res = await pre.match(req);
      if (!res) continue;
      const url = new URL(req.url);

      if (isVersionedAsset(url.href)) {
        await assetC.put(req, res.clone());
        updateLRU(CACHE.ASSET, req.url);
      } else if (isFontPath(url.pathname)) {
        await fontC.put(req, res.clone());
        updateLRU(CACHE.FONT, req.url);
      } else if (isImageURL(url.href)) {
        await imgC.put(req, res.clone());
        updateLRU(CACHE.IMG, req.url);
      } else if (url.pathname.endsWith(".json")) {
        await dataC.put(req, (await withTimestamp(res.clone())));
        updateLRU(CACHE.DATA, req.url);
      } else if (url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname === OFFLINE_URL) {
        const norm = new Request(normalizeURLForCache(req.url).href, { method:"GET" });
        await pageC.put(norm, res.clone());
        updateLRU(CACHE.PAGE, norm.url);
      }
    }

    await Promise.all([
      prune(CACHE.PAGE,  CONFIG.maxPages),
      prune(CACHE.ASSET, CONFIG.maxAssets),
      prune(CACHE.IMG,   CONFIG.maxImages),
      prune(CACHE.FONT,  CONFIG.maxFonts),
      prune(CACHE.DATA,  CONFIG.maxData)
    ]);
  }catch(err){
    logError("copyPrecacheToRuntime", err);
  }
}

/* ---------------- Background refresh + notify ---------------- */

async function refreshAndNotify(urlOrRequest){
  try{
    const url = typeof urlOrRequest === "string" ? urlOrRequest : new URL(urlOrRequest.url, location.origin).href;
    const res = await fetch(url, { cache: "no-store", credentials: "omit" });
    if (!res.ok) throw new Error("refresh non-ok");
    const stamped = await withTimestamp(res.clone());
    const dataCache = await caches.open(CACHE.DATA);
    await dataCache.put(new Request(url, { method:"GET" }), stamped);
    // Tell all open tabs (align with sw-bridge.js expectations)
    const cs = await clients.matchAll({ type: "window", includeUncontrolled: true });
    cs.forEach(c => c.postMessage({ type: "DATA_REFRESHED", resource: "pricing", url }));
  }catch(err){
    logError("refreshAndNotify", err, String(urlOrRequest || ""));
  }
}

/* ---------------- LRU helpers ---------------- */

async function updateLRU(cacheName, url){
  try{
    const meta = await caches.open(CACHE.META);
    await meta.put(new Request(url + ":lru"), new Response(JSON.stringify({ lastAccess: Date.now(), cache: cacheName })));
  }catch(_){}
}

async function prune(cacheName, max){
  try{
    const c = await caches.open(cacheName);
    const keys = await c.keys();
    if (keys.length <= max) return;

    const meta = await caches.open(CACHE.META);
    const entries = await Promise.all(keys.map(async k => {
      const m = await meta.match(k.url + ":lru");
      const data = m ? await m.json() : { lastAccess: 0 };
      return { key: k, lastAccess: data.lastAccess || 0 };
    }));

    entries.sort((a,b)=> a.lastAccess - b.lastAccess);
    const toRemove = entries.slice(0, entries.length - max);
    await Promise.all(toRemove.map(e => Promise.all([
      c.delete(e.key),
      meta.delete(e.key.url + ":lru")
    ])));
  }catch(_){}
}

/* ---------------- Utils ---------------- */

function normalizeURLForCache(u){
  const url = new URL(u, location.origin);
  if (url.pathname === "/") url.pathname = "/index.html";
  ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","fbclid","gclid","mc_cid","mc_eid"].forEach(p=> url.searchParams.delete(p));
  url.hash = "";
  return new URL(url.pathname + url.search, location.origin);
}

function sameOrigin(u){ try{ return new URL(u, location.origin).origin === location.origin; }catch{ return false; } }
function isImageURL(href){ return /\.(avif|webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(href); }
function isFontPath(path){ return /\.(woff2?|ttf|otf)(\?.*)?$/i.test(path); }
function isFontRequest(req){ return req.destination === "font" || isFontPath(new URL(req.url).pathname); }
function isJSONRequest(req){ const u = new URL(req.url); return u.pathname.endsWith(".json") && req.destination !== "script"; }
function isVersionedAsset(href){ return /\.(css|js)(\?.*)?$/i.test(href) && /[?&]v=[^&]+/i.test(href); }
function isHTMLLike(req){ return req.destination === "document" || /\.html$/i.test(new URL(req.url).pathname) || req.url.endsWith("/"); }
function cacheKey(req){ return new Request(new URL(req.url).href, { method:"GET" }); }
function isCalculatorData(url){
  if (url.pathname === CALC_JSON_PATH) return true;
  return /^\/assets\/data\/lines\/[^/]+\.json$/i.test(url.pathname);
}

async function fetchWithTimeout(input, ms=8000){
  const controller = new AbortController();
  const t = setTimeout(()=> controller.abort(), ms);
  try{
    const res = await fetch(input, { signal: controller.signal });
    clearTimeout(t);
    return res;
  }catch(err){
    clearTimeout(t);
    throw err;
  }
}

function logError(context, error, url=""){
  try{
    ERROR_LOG.push({ time: Date.now(), context, message: error?.message || String(error), url, sw: SW_VERSION });
    if (ERROR_LOG.length > MAX_ERRORS) ERROR_LOG.shift();
  }catch(_){}
}

async function getCacheStats(){
  const out = {};
  for (const [label, name] of Object.entries(CACHE)){
    try{
      const c = await caches.open(name);
      const k = await c.keys();
      out[label] = { name, count: k.length };
    }catch(_){
      out[label] = { name, error: true };
    }
  }
  try{
    if (navigator.storage && navigator.storage.estimate){
      const est = await navigator.storage.estimate();
      out.storage = {
        usageBytes: est.usage || 0,
        quotaBytes: est.quota || 0
      };
    }
  }catch(_){}
  return out;
}

/* --------- Timestamp helpers (adds Date header + exposes age/confidence) ---------- */

async function withTimestamp(response){
  try{
    const headers = new Headers(response.headers);
    headers.set("date", new Date().toUTCString());
    const body = await response.clone().arrayBuffer();
    return new Response(body, { status: response.status, statusText: response.statusText, headers });
  }catch{
    return response;
  }
}

async function ageMsOf(response){
  try{
    const date = response.headers.get("date");
    return date ? (Date.now() - new Date(date).getTime()) : 0;
  }catch{ return 0; }
}

function confidenceFromAge(ageMs, maxAgeMs){
  const pct = ageMs / maxAgeMs;
  if (pct < 0.25) return "high";
  if (pct < 0.75) return "medium";
  return "low";
}

async function withExtraHeaders(response, extra){
  try{
    const headers = new Headers(response.headers);
    Object.entries(extra || {}).forEach(([k,v]) => headers.set(k, String(v)));
    const body = await response.clone().arrayBuffer();
    return new Response(body, { status: response.status, statusText: response.statusText, headers });
  }catch{
    return response;
  }
}

async function getCalculatorFreshness(){
  try{
    const c = await caches.open(CACHE.DATA);
    const r = await c.match(new Request(new URL(CALC_JSON_PATH, location.origin).href, { method:"GET" }));
    if (!r) return { pricing: { cached:false } };
    const ageMs = await ageMsOf(r);
    return {
      pricing: {
        cached: true,
        ageMs,
        confidence: confidenceFromAge(ageMs, CALC_JSON_MAX_AGE),
        maxAgeMs: CALC_JSON_MAX_AGE
      }
    };
  }catch{
    return { pricing: { cached:false } };
  }
}
