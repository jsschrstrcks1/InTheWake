/* sw.js — In the Wake Service Worker (v20.1)
   Fixes: no giant image precache; preserve ?v=; no double-?v; normalize '/'→'/index.html'
   Adds: dedup seeding; error log; cache stats; LRU-ish prune; stale-if-error(JSON);
         WebP-first images; offline fallback; priority warmup; copy precache→runtime
*/

const SW_VERSION = "v20.1";
let DEBUG = false; // can be toggled via a message if you want to add that later
const PREFIX = "itw";
const OFFLINE_URL = "/offline.html";

let CONFIG = {
  maxPages: 60, maxAssets: 60, maxImages: 360, maxFonts: 30, maxData: 30,
  staleMaxAge: 3600000 // 1h acceptable staleness for JSON
};

const CACHE = {
  PAGE:     `${PREFIX}-page-${SW_VERSION}`,
  ASSET:    `${PREFIX}-asset-${SW_VERSION}`,
  IMG:      `${PREFIX}-img-${SW_VERSION}`,
  FONT:     `${PREFIX}-font-${SW_VERSION}`,
  DATA:     `${PREFIX}-data-${SW_VERSION}`,
  PRECACHE: `${PREFIX}-pre-${SW_VERSION}`,
  META:     `${PREFIX}-meta-${SW_VERSION}` // LRU metadata store
};

const MANIFEST_URL = "/precache-manifest.json";
const ERROR_LOG = [];
const MAX_ERRORS = 50;

// ---------------- Lifecycle ----------------
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    await self.skipWaiting();
    await cacheOfflinePage().catch(()=>{});
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch(_) {}
    }
    await cleanupOldCaches();
    await loadConfig();
    await warmPrecache().catch(()=>{});
  })());
});

async function cacheOfflinePage(){
  const c = await caches.open(CACHE.PRECACHE);
  await c.add(new Request(OFFLINE_URL, { cache: "reload" })).catch(()=>{});
}

async function cleanupOldCaches(){
  const keep = new Set(Object.values(CACHE));
  const names = await caches.keys();
  await Promise.all(
    names.filter(n => n.startsWith(PREFIX) && !keep.has(n))
         .map(n => caches.delete(n))
  );
}

async function loadConfig(){
  try{
    const res = await fetch(MANIFEST_URL, { cache:"no-store", credentials:"omit" });
    if (res.ok){
      const data = await res.json();
      if (data && data.config) {
        CONFIG = { ...CONFIG, ...data.config };
        if (typeof CONFIG.debug === 'boolean') DEBUG = CONFIG.debug;
      }
    }
  }catch(_){}
}

// ---------------- Messaging ----------------
self.addEventListener("message", (event)=>{
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
});

// ---------------- Fetch routing ----------------
self.addEventListener("fetch", (event)=>{
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Health check endpoint
  if (url.pathname === "/__sw_health") {
    event.respondWith((async ()=>{
      const stats = await getCacheStats();
      return new Response(JSON.stringify({
        version: SW_VERSION,
        caches: Object.fromEntries(Object.entries(stats).map(([k,v])=>[k, v.count]))
      }), { headers: { "Content-Type":"application/json", "Cache-Control":"no-store" }});
    })());
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
    event.respondWith(handleHTML(event, req)); return;
  }
  // passthrough for everything else
});

// ---------------- Strategies: HTML ----------------
async function handleHTML(event, request){
  const pageCache = await caches.open(CACHE.PAGE);
  const normalized = normalizeURLForCache(request.url);
  const key = new Request(normalized.href, { method:"GET" });

  const isHardReload = /\bno-cache\b/i.test(request.headers.get("cache-control")||"")
                    || /\bno-cache\b/i.test(request.headers.get("pragma")||"");
  const forceNetwork = isHardReload || new URL(request.url).searchParams.has('v');

  try{
    const preload = event.preloadResponse ? (await event.preloadResponse) : null;
    if (preload && (preload.ok || preload.type === "opaque")) {
      pageCache.put(key, preload.clone()).catch(()=>{});
      updateLRU(CACHE.PAGE, key.url);
      prune(CACHE.PAGE, CONFIG.maxPages).catch(()=>{});
      return preload;
    }

    const res = await fetchWithTimeout(request, 8000);
    if (res && (res.ok || res.type === "opaque")) {
      // optional: inject critical CSS if you ship /assets/critical.css
      const enhanced = await maybeInjectCriticalCSS(res.clone());
      pageCache.put(key, enhanced).catch(()=>{});
      updateLRU(CACHE.PAGE, key.url);
      prune(CACHE.PAGE, CONFIG.maxPages).catch(()=>{});
    }
    return res;
  }catch(err){
    logError("handleHTML", err, request.url);
    const cached = await pageCache.match(key);
    if (cached) return cached;

    // Try precache, then offline page
    const pre = await caches.open(CACHE.PRECACHE);
    const preHit = (await pre.match(key)) || (await pre.match(OFFLINE_URL));
    return preHit || new Response("Offline", { status: 503 });
  }
}

async function maybeInjectCriticalCSS(response){
  try{
    const ct = (response.headers.get("content-type")||"").toLowerCase();
    if (!ct.includes("text/html")) return response;
    const assetC = await caches.open(CACHE.ASSET);
    const crit = await assetC.match("/assets/critical.css");
    if (!crit) return response;

    const [html, css] = await Promise.all([response.text(), crit.text()]);
    if (html.includes("<!-- critical-css-injected -->")) return new Response(html, { headers: response.headers, status: response.status });

    const enhanced = html.replace(
      "</head>",
      `<style>/* critical-css-injected */${css}</style></head>`
    );
    return new Response(enhanced, { headers: response.headers, status: response.status });
  }catch(_){
    return response;
  }
}

// ---------------- Strategies: Images ----------------
async function handleImage(request){
  const acceptsWebP = request.headers.get("accept")?.includes("image/webp");
  const url = new URL(request.url);
  if (acceptsWebP && /\.(jpe?g|png)$/i.test(url.pathname)) {
    const webpURL = url.pathname.replace(/\.(jpe?g|png)$/i, ".webp") + url.search;
    const webpReq = new Request(new URL(webpURL, location.origin).href);
    const imgCache = await caches.open(CACHE.IMG);
    const cached = await imgCache.match(webpReq);
    if (cached) {
      updateLRU(CACHE.IMG, webpReq.url);
      return cached;
    }
    try{
      const res = await fetch(webpReq);
      if (res && (res.ok || res.type === "opaque")) {
        imgCache.put(webpReq, res.clone()).catch(()=>{});
        updateLRU(CACHE.IMG, webpReq.url);
        prune(CACHE.IMG, CONFIG.maxImages).catch(()=>{});
        return res;
      }
    }catch(_){}
  }
  // Fallback to original format with SWR
  return staleWhileRevalidate(request, CACHE.IMG, CONFIG.maxImages);
}

// ---------------- Generic Strategies ----------------
async function cacheFirst(request, cacheName, maxItems){
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  const hit = await cache.match(key);
  if (hit) {
    updateLRU(cacheName, key.url);
    return hit;
  }
  const res = await fetchWithTimeout(request);
  if (res && (res.ok || res.type === "opaque")) {
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
  const networkPromise = fetchWithTimeout(request)
    .then(res=>{
      if (res && (res.ok || res.type === "opaque")) {
        cache.put(key, res.clone()).catch(()=>{});
        updateLRU(cacheName, key.url);
        prune(cacheName, maxItems).catch(()=>{});
      }
      return res;
    })
    .catch(()=>null);

  const cached = await cachedPromise;
  if (cached) {
    updateLRU(cacheName, key.url);
    return cached;
  }
  return (await networkPromise) || new Response("", { status: 504 });
}

async function staleIfError(request, cacheName, maxItems, maxAge){
  const cache = await caches.open(cacheName);
  const key = cacheKey(request);
  try{
    const res = await fetchWithTimeout(request);
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(key, res.clone()).catch(()=>{});
      updateLRU(cacheName, key.url);
      prune(cacheName, maxItems).catch(()=>{});
    }
    return res;
  }catch(err){
    const cached = await cache.match(key);
    if (cached) {
      // best-effort age check using Date header if present
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

// ---------------- LRU helpers ----------------
async function updateLRU(cacheName, url){
  try{
    const meta = await caches.open(CACHE.META);
    const metaKey = new Request(url + ":lru");
    await meta.put(metaKey, new Response(JSON.stringify({ lastAccess: Date.now(), cache: cacheName })));
  }catch(_){}
}

async function prune(cacheName, maxItems){
  try{
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxItems) return;

    const meta = await caches.open(CACHE.META);
    const entries = await Promise.all(keys.map(async k=>{
      const m = await meta.match(k.url + ":lru");
      const data = m ? await m.json() : { lastAccess: 0 };
      return { key:k, url:k.url, lastAccess:data.lastAccess||0 };
    }));
    entries.sort((a,b)=> a.lastAccess - b.lastAccess); // oldest first
    const remove = entries.slice(0, entries.length - maxItems);
    await Promise.all(remove.map(ent=>Promise.all([
      cache.delete(ent.key),
      meta.delete(ent.url + ":lru")
    ])));
  }catch(_){}
}

// ---------------- Warmup & seeding ----------------
async function warmPrecache(){
  try{
    const res = await fetch(MANIFEST_URL, { cache:"no-store", credentials:"omit" });
    if (!res.ok) return;

    const data = await res.json();
    const urls = new Set();

    const push = (arr=[]) => arr.forEach(item=>{
      const u = typeof item === 'string' ? item : item.url;
      if (!u || !sameOrigin(u)) return;
      const urlObj = new URL(u, location.origin);
      urls.add(urlObj.pathname + urlObj.search);
    });

    // Priority: pages (critical first if present), then assets/images/data
    const criticalPages = (data.pages||[]).filter(p=>p.priority==='critical');
    push(criticalPages);
    push(data.pages||[]);
    push(data.assets||[]);
    push(data.images||[]);
    push(data.data||[]);

    await seedURLs([...urls], "high");

    const sitemaps = Array.isArray(data.sitemaps) ? data.sitemaps : ["/sitemap.xml"];
    for (const sm of sitemaps) {
      try { await seedFromSitemap(sm); } catch(_){}
    }
  }catch(err){
    logError("warmPrecache", err);
  }
}

async function seedFromSitemap(path){
  if (!sameOrigin(path)) return;
  const bust = path.includes("?") ? "&" : "?";
  const res = await fetch(path + bust + `v=${SW_VERSION}`, { cache:"no-store", credentials:"omit" });
  if (!res.ok) return;

  let urls = [];
  const ct = (res.headers.get("content-type")||"").toLowerCase();
  if (ct.includes("json")){
    const data = await res.json();
    urls = Array.isArray(data) ? data : (Array.isArray(data.urls) ? data.urls : []);
  }else{
    const xml = await res.text();
    try{
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      urls = Array.from(doc.querySelectorAll("loc")).map(n => (n.textContent||"").trim());
    }catch(_){
      urls = Array.from(xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)).map(m=>m[1].trim());
    }
  }

  const filtered = urls
    .filter(u=>sameOrigin(u))
    .map(u=>normalizeURLForCache(u).href)
    .filter(u=>{
      const p = new URL(u, location.origin).pathname;
      return p !== "/" && p !== "/index.html";
    });

  await seedURLs(filtered, "normal");
}

async function seedURLs(urls, priority="normal"){
  if (!urls || !urls.length) return;

  const unique = [...new Set(urls.map(u=>{ try{ return new URL(u, location.origin).href; }catch{ return null; } }).filter(Boolean))];
  if (DEBUG) console.log(`[SW ${SW_VERSION}] Seeding ${unique.length} URLs (priority: ${priority})`);

  const pre = await caches.open(CACHE.PRECACHE);

  await Promise.all(unique.map(async (u)=>{
    try{
      const abs = new URL(u, location.origin);
      const fetchURL = new URL(abs.href);

      // Only add ?v= if the URL has no query at all (prevents ?v=x&v=y)
      if (!fetchURL.search) fetchURL.search = `?v=${SW_VERSION}`;

      const reqKey = new Request(abs.href, { method:"GET" }); // cache key = normalized original
      const hit = await pre.match(reqKey);
      if (hit) return;

      const res = await fetch(fetchURL.href, { cache:"no-store" });
      if (res && (res.ok || res.type === "opaque")) {
        await pre.put(reqKey, res.clone());
      }
    }catch(err){
      logError("seedURLs", err, u);
    }
  }));

  await copyPrecacheToRuntime().catch(()=>{});
}

async function copyPrecacheToRuntime(){
  try{
    const pre = await caches.open(CACHE.PRECACHE);
    const keys = await pre.keys();

    const pageC  = await caches.open(CACHE.PAGE);
    const assetC = await caches.open(CACHE.ASSET);
    const imgC   = await caches.open(CACHE.IMG);
    const fontC  = await caches.open(CACHE.FONT);
    const dataC  = await caches.open(CACHE.DATA);

    for (const req of keys){
      const url = new URL(req.url);
      const res = await pre.match(req);
      if (!res) continue;

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
        await dataC.put(req, res.clone());
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
      prune(CACHE.DATA,  CONFIG.maxData),
    ]);
  }catch(err){
    logError("copyPrecacheToRuntime", err);
  }
}

// ---------------- Utils ----------------
function normalizeURLForCache(u){
  const url = new URL(u, location.origin);
  // Normalize root to /index.html for PAGE cache keys
  if (url.pathname === "/") url.pathname = "/index.html";
  // strip tracking params (keep versioning)
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','mc_cid','mc_eid']
    .forEach(p => url.searchParams.delete(p));
  url.hash = "";
  return new URL(url.pathname + url.search, location.origin);
}

function sameOrigin(u){ try{ return new URL(u, location.origin).origin === location.origin; }catch{ return false; } }
function isImageURL(href){ return /\.(?:avif|webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(href); }
function isFontRequest(request){ if (request.destination === "font") return true; return isFontPath(new URL(request.url).pathname); }
function isFontPath(pathname){ return /\.(?:woff2|woff|ttf|otf)(\?.*)?$/i.test(pathname); }
function isJSONRequest(request){ if (request.destination === "script") return false; const url = new URL(request.url); return url.pathname.endsWith(".json"); }
function isVersionedAsset(href){ return /\.(?:css|js)(\?.*)?$/i.test(href) && /[?&]v=[^&]+/i.test(href); }
function isHTMLLike(request){ if (request.destination === "document") return true; const url = new URL(request.url); return url.pathname.endsWith(".html") || url.pathname === "/"; }
function cacheKey(request){ const url = new URL(request.url); return new Request(url.href, { method:"GET" }); }

async function fetchWithTimeout(req, ms=8000){
  const controller = new AbortController();
  const t = setTimeout(()=>controller.abort(), ms);
  try{
    const res = await fetch(req, { signal: controller.signal });
    clearTimeout(t);
    return res;
  }catch(err){
    clearTimeout(t);
    throw err;
  }
}

function logError(context, error, url=""){
  try{
    ERROR_LOG.push({
      time: new Date().toISOString(),
      context,
      message: error?.message || String(error),
      url,
      sw_version: SW_VERSION
    });
    if (ERROR_LOG.length > MAX_ERRORS) ERROR_LOG.shift();
    if (DEBUG) console.warn(`[SW ${SW_VERSION}] ${context}:`, error, url);
  }catch(_){}
}

async function getCacheStats(){
  const stats = {};
  for (const [key, name] of Object.entries(CACHE)){
    try{
      const c = await caches.open(name);
      const keys = await c.keys();
      stats[key] = { count: keys.length };
    }catch(_){
      stats[key] = { error: "unavailable" };
    }
  }
  return stats;
}
