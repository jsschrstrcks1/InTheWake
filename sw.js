/* Service Worker v11.0.0 - In the Wake
 * Site-wide unified caching strategy with offline support
 * Supports: Ships, Ports, Restaurants, Planning Tools, Drink Calculator
 * Soli Deo Gloria ✝️
 */

const VERSION = '11.0.0';
const CACHE_PREFIX = 'itw-site';

const CACHES = {
  PRECACHE: `${CACHE_PREFIX}-precache-${VERSION}`,
  PAGES: `${CACHE_PREFIX}-pages-${VERSION}`,
  ASSETS: `${CACHE_PREFIX}-assets-${VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-${VERSION}`,
  DATA: `${CACHE_PREFIX}-data-${VERSION}`,
  FONTS: `${CACHE_PREFIX}-fonts-${VERSION}`,
  META: `${CACHE_PREFIX}-meta-${VERSION}`
};

const CONFIG = {
  maxPages: 100,           // Increased for ships, ports, restaurants pages
  maxAssets: 100,          // Increased for CSS/JS modules
  maxImages: 500,          // Increased for ship gallery images
  maxData: 50,             // Increased for fleet, port, restaurant data
  maxFonts: 30,
  staleMaxAge: 60 * 60 * 1000, // 1 hour
  calcDataMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  shipImagesMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (ship images rarely change)
  fetchTimeout: 8000
};

const OFFLINE_URL = '/offline.html';
const MANIFEST_URL = '/precache-manifest.json';
const CALC_DATA_PATH = '/assets/data/lines/royal-caribbean.json';

const errorLog = [];
const MAX_ERRORS = 50;

/* ==================== LIFECYCLE ==================== */

self.addEventListener('install', (event) => {
  console.log('[SW] Installing v' + VERSION);
  event.waitUntil(
    (async () => {
      await self.skipWaiting();
      
      // Precache offline page
      const cache = await caches.open(CACHES.PRECACHE);
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' })).catch(() => {});
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v' + VERSION);
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      
      // Enable navigation preload if available
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (e) {}
      }
      
      // Clean up old caches
      await cleanupOldCaches();
      
      // Load configuration
      await loadConfiguration();
      
      // Warm up precache
      await warmPrecache().catch(() => {});
    })()
  );
});

/* ==================== FETCH HANDLING ==================== */

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Health check endpoint
  if (url.pathname === '/__sw_health') {
    event.respondWith(handleHealthCheck());
    return;
  }
  
  // Same-origin only (with specific cross-origin exceptions)
  if (url.origin !== location.origin) {
    // Allow FX APIs
    if (url.hostname.includes('frankfurter.app') || 
        url.hostname.includes('exchangerate.host')) {
      event.respondWith(handleFXRequest(request));
      return;
    }
    
    // Allow CDN assets
    if (url.hostname.includes('cdn.jsdelivr.net')) {
      event.respondWith(cacheFirstStrategy(request, CACHES.ASSETS, CONFIG.maxAssets));
      return;
    }
    
    return; // Block other cross-origin requests
  }
  
  // Calculator data - network first with bounded stale
  if (isCalculatorData(url)) {
    event.respondWith(handleCalculatorData(request, event));
    return;
  }
  
  // Route by request type
  const destination = request.destination || '';
  
  if (destination === 'document' || isHTMLRequest(request)) {
    // Ship pages and ships index get network-first with fallback
    event.respondWith(handleHTMLRequest(request, event));
    return;
  }
  
  if (destination === 'script' || destination === 'style' || isVersionedAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, CACHES.ASSETS, CONFIG.maxAssets));
    return;
  }
  
  if (destination === 'image' || isImageURL(url)) {
    // Ship images get longer cache with cache-first strategy (they rarely change)
    if (isShipImage(url)) {
      event.respondWith(cacheFirstStrategy(request, CACHES.IMAGES, CONFIG.maxImages));
    } else {
      event.respondWith(staleWhileRevalidate(request, CACHES.IMAGES, CONFIG.maxImages));
    }
    return;
  }
  
  if (destination === 'font' || isFontURL(url)) {
    event.respondWith(cacheFirstStrategy(request, CACHES.FONTS, CONFIG.maxFonts));
    return;
  }
  
  if (isJSONRequest(url)) {
    event.respondWith(staleIfError(request, CACHES.DATA, CONFIG.maxData));
    return;
  }
});

/* ==================== MESSAGING ==================== */

self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: VERSION });
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0]?.postMessage({ type: 'CACHE_STATS', stats });
      });
      break;
      
    case 'FORCE_REFRESH_DATA':
      event.waitUntil(refreshCalculatorData());
      break;
      
    case 'CLEAR_CACHES':
      event.waitUntil(clearAllCaches());
      break;
  }
});

/* ==================== CACHING STRATEGIES ==================== */

async function cacheFirstStrategy(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key = normalizeRequest(request);
  
  const cached = await cache.match(key);
  if (cached) {
    updateLRU(cacheName, key.url);
    return cached;
  }
  
  try {
    const response = await fetchWithTimeout(request, CONFIG.fetchTimeout);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(key, response.clone());
      updateLRU(cacheName, key.url);
      pruneCache(cacheName, maxItems);
    }
    return response;
  } catch (error) {
    logError('cacheFirst', error, request.url);
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key = normalizeRequest(request);
  
  const cachedPromise = cache.match(key);
  const fetchPromise = fetchWithTimeout(request, CONFIG.fetchTimeout)
    .then(response => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(key, response.clone());
        updateLRU(cacheName, key.url);
        pruneCache(cacheName, maxItems);
      }
      return response;
    })
    .catch(() => null);
  
  const cached = await cachedPromise;
  if (cached) {
    updateLRU(cacheName, key.url);
    return cached;
  }
  
  return (await fetchPromise) || new Response('', { status: 504 });
}

async function staleIfError(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key = normalizeRequest(request);
  
  try {
    const response = await fetchWithTimeout(request, CONFIG.fetchTimeout);
    if (response && (response.ok || response.type === 'opaque')) {
      const timestamped = await addTimestamp(response.clone());
      cache.put(key, timestamped);
      updateLRU(cacheName, key.url);
      pruneCache(cacheName, maxItems);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(key);
    if (cached) {
      const age = await getAge(cached);
      if (age < CONFIG.staleMaxAge) {
        updateLRU(cacheName, key.url);
        return cached;
      }
    }
    throw error;
  }
}

/* ==================== SPECIALIZED HANDLERS ==================== */

async function handleHTMLRequest(request, event) {
  const cache = await caches.open(CACHES.PAGES);
  const key = normalizeRequest(request);
  
  try {
    // Try preload response first
    const preload = event.preloadResponse ? await event.preloadResponse : null;
    if (preload && (preload.ok || preload.type === 'opaque')) {
      cache.put(key, preload.clone());
      updateLRU(CACHES.PAGES, key.url);
      pruneCache(CACHES.PAGES, CONFIG.maxPages);
      return preload;
    }
    
    // Fetch from network
    const response = await fetchWithTimeout(request, CONFIG.fetchTimeout);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(key, response.clone());
      updateLRU(CACHES.PAGES, key.url);
      pruneCache(CACHES.PAGES, CONFIG.maxPages);
    }
    return response;
  } catch (error) {
    logError('handleHTML', error, request.url);
    
    // Try cache
    const cached = await cache.match(key);
    if (cached) return cached;
    
    // Fall back to offline page
    const precache = await caches.open(CACHES.PRECACHE);
    return (await precache.match(OFFLINE_URL)) || 
           new Response('Offline', { status: 503 });
  }
}

async function handleCalculatorData(request, event) {
  const cache = await caches.open(CACHES.DATA);
  const key = normalizeRequest(request);
  
  try {
    const response = await fetchWithTimeout(request, CONFIG.fetchTimeout);
    if (response && (response.ok || response.type === 'opaque')) {
      const timestamped = await addTimestamp(response.clone());
      cache.put(key, timestamped);
      updateLRU(CACHES.DATA, key.url);
      pruneCache(CACHES.DATA, CONFIG.maxData);
      
      // Notify clients of fresh data
      notifyClients({ type: 'DATA_REFRESHED', resource: 'calculator', url: request.url });
    }
    return response;
  } catch (error) {
    const cached = await cache.match(key);
    if (cached) {
      const age = await getAge(cached);
      if (age < CONFIG.calcDataMaxAge) {
        // Add headers to indicate stale data
        const decorated = await addStaleHeaders(cached, age, CONFIG.calcDataMaxAge);
        
        // Try to refresh in background
        event.waitUntil(refreshCalculatorData());
        
        updateLRU(CACHES.DATA, key.url);
        return decorated;
      }
    }
    
    logError('handleCalculatorData', error, request.url);
    throw error;
  }
}

async function handleFXRequest(request) {
  return staleIfError(request, CACHES.DATA, CONFIG.maxData);
}

async function handleHealthCheck() {
  const stats = await getCacheStats();
  const calcFreshness = await getCalculatorDataFreshness();
  
  const health = {
    version: VERSION,
    timestamp: new Date().toISOString(),
    caches: stats,
    calculator: calcFreshness,
    errorCount: errorLog.length
  };
  
  return new Response(JSON.stringify(health, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

/* ==================== HELPER FUNCTIONS ==================== */

async function cleanupOldCaches() {
  const keep = new Set(Object.values(CACHES));
  const names = await caches.keys();
  
  await Promise.all(
    names
      .filter(name => name.startsWith(CACHE_PREFIX) && !keep.has(name))
      .map(name => caches.delete(name))
  );
}

async function loadConfiguration() {
  try {
    const response = await fetch(MANIFEST_URL, { 
      cache: 'no-store', 
      credentials: 'omit' 
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.config) {
        Object.assign(CONFIG, data.config);
      }
    }
  } catch (e) {
    // Use defaults
  }
}

async function warmPrecache() {
  try {
    const response = await fetch(MANIFEST_URL, { 
      cache: 'no-store', 
      credentials: 'omit' 
    });
    
    if (!response.ok) return;
    
    const manifest = await response.json();
    const urls = [
      ...(manifest.pages || []),
      ...(manifest.assets || []),
      ...(manifest.images || []),
      ...(manifest.data || [])
    ].filter(url => isSameOrigin(url));
    
    const precache = await caches.open(CACHES.PRECACHE);
    
    await Promise.all(
      urls.map(async url => {
        try {
          const fullUrl = new URL(url, location.origin).href;
          const response = await fetch(fullUrl, { 
            cache: 'no-store', 
            credentials: 'omit' 
          });
          
          if (response && (response.ok || response.type === 'opaque')) {
            await precache.put(fullUrl, response);
          }
        } catch (e) {
          // Skip failed URLs
        }
      })
    );
    
    // Copy precache to runtime caches
    await copyPrecacheToRuntime();
  } catch (e) {
    logError('warmPrecache', e);
  }
}

async function copyPrecacheToRuntime() {
  const precache = await caches.open(CACHES.PRECACHE);
  const keys = await precache.keys();
  
  const runtimeCaches = {
    [CACHES.PAGES]: [],
    [CACHES.ASSETS]: [],
    [CACHES.IMAGES]: [],
    [CACHES.DATA]: [],
    [CACHES.FONTS]: []
  };
  
  for (const request of keys) {
    const response = await precache.match(request);
    if (!response) continue;
    
    const url = new URL(request.url);
    
    let targetCache;
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
      targetCache = CACHES.PAGES;
    } else if (isVersionedAsset(url)) {
      targetCache = CACHES.ASSETS;
    } else if (isImageURL(url)) {
      targetCache = CACHES.IMAGES;
    } else if (isFontURL(url)) {
      targetCache = CACHES.FONTS;
    } else if (url.pathname.endsWith('.json')) {
      targetCache = CACHES.DATA;
    }
    
    if (targetCache) {
      runtimeCaches[targetCache].push({ request, response: response.clone() });
    }
  }
  
  // Write to runtime caches
  for (const [cacheName, items] of Object.entries(runtimeCaches)) {
    if (items.length === 0) continue;
    
    const cache = await caches.open(cacheName);
    await Promise.all(
      items.map(({ request, response }) => cache.put(request, response))
    );
  }
}

async function refreshCalculatorData() {
  try {
    const url = new URL(CALC_DATA_PATH, location.origin).href;
    const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
    
    if (response.ok) {
      const timestamped = await addTimestamp(response.clone());
      const cache = await caches.open(CACHES.DATA);
      await cache.put(url, timestamped);
      
      notifyClients({ 
        type: 'DATA_REFRESHED', 
        resource: 'calculator', 
        url 
      });
    }
  } catch (e) {
    logError('refreshCalculatorData', e);
  }
}

async function clearAllCaches() {
  const names = await caches.keys();
  await Promise.all(names.map(name => caches.delete(name)));
}

function normalizeRequest(request) {
  const url = new URL(request.url);
  
  // Remove tracking parameters
  const trackingParams = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'mc_cid', 'mc_eid'
  ];
  trackingParams.forEach(param => url.searchParams.delete(param));
  
  // Remove hash
  url.hash = '';
  
  return new Request(url.href, { method: 'GET' });
}

async function updateLRU(cacheName, url) {
  try {
    const metaCache = await caches.open(CACHES.META);
    const meta = {
      lastAccess: Date.now(),
      cache: cacheName
    };
    await metaCache.put(
      `${url}:lru`,
      new Response(JSON.stringify(meta))
    );
  } catch (e) {}
}

async function pruneCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length <= maxItems) return;
    
    const metaCache = await caches.open(CACHES.META);
    const entries = await Promise.all(
      keys.map(async key => {
        const metaResponse = await metaCache.match(`${key.url}:lru`);
        const meta = metaResponse ? await metaResponse.json() : { lastAccess: 0 };
        return { key, lastAccess: meta.lastAccess || 0 };
      })
    );
    
    entries.sort((a, b) => a.lastAccess - b.lastAccess);
    
    const toRemove = entries.slice(0, entries.length - maxItems);
    await Promise.all(
      toRemove.map(({ key }) => 
        Promise.all([
          cache.delete(key),
          metaCache.delete(`${key.url}:lru`)
        ])
      )
    );
  } catch (e) {}
}

async function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('Date', new Date().toUTCString());
  
  const body = await response.clone().arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function addStaleHeaders(response, ageMs, maxAgeMs) {
  const headers = new Headers(response.headers);
  headers.set('X-SW-Fallback', '1');
  headers.set('X-SW-Age-MS', String(ageMs));
  headers.set('X-SW-Confidence', calculateConfidence(ageMs, maxAgeMs));
  
  const body = await response.clone().arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function calculateConfidence(ageMs, maxAgeMs) {
  const ratio = ageMs / maxAgeMs;
  if (ratio < 0.25) return 'high';
  if (ratio < 0.75) return 'medium';
  return 'low';
}

async function getAge(response) {
  try {
    const dateHeader = response.headers.get('Date');
    if (!dateHeader) return 0;
    
    const date = new Date(dateHeader);
    return Date.now() - date.getTime();
  } catch (e) {
    return 0;
  }
}

async function getCacheStats() {
  const stats = {};
  
  for (const [key, name] of Object.entries(CACHES)) {
    try {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      stats[key] = {
        name,
        count: keys.length
      };
    } catch (e) {
      stats[key] = { name, count: 0, error: e.message };
    }
  }
  
  return stats;
}

async function getCalculatorDataFreshness() {
  try {
    const cache = await caches.open(CACHES.DATA);
    const url = new URL(CALC_DATA_PATH, location.origin).href;
    const response = await cache.match(url);
    
    if (!response) {
      return { cached: false };
    }
    
    const ageMs = await getAge(response);
    return {
      cached: true,
      ageMs,
      confidence: calculateConfidence(ageMs, CONFIG.calcDataMaxAge),
      maxAgeMs: CONFIG.calcDataMaxAge
    };
  } catch (e) {
    return { cached: false, error: e.message };
  }
}

async function fetchWithTimeout(request, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function notifyClients(message) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clients => {
      clients.forEach(client => client.postMessage(message));
    });
}

function logError(context, error, url = '') {
  try {
    errorLog.push({
      timestamp: Date.now(),
      context,
      message: error?.message || String(error),
      url,
      version: VERSION
    });
    
    if (errorLog.length > MAX_ERRORS) {
      errorLog.shift();
    }
  } catch (e) {}
}

/* ==================== URL HELPERS ==================== */

function isSameOrigin(url) {
  try {
    return new URL(url, location.origin).origin === location.origin;
  } catch (e) {
    return false;
  }
}

function isHTMLRequest(request) {
  const url = new URL(request.url);
  return request.destination === 'document' || 
         url.pathname.endsWith('.html') || 
         url.pathname === '/';
}

function isCalculatorData(url) {
  return url.pathname === CALC_DATA_PATH ||
         /^\/assets\/data\/lines\/[^/]+\.json$/i.test(url.pathname);
}

function isVersionedAsset(url) {
  return /\.(css|js)(\?.*)?$/i.test(url.href) && /[?&]v=[^&]+/i.test(url.href);
}

function isImageURL(url) {
  return /\.(avif|webp|jpg|jpeg|png|gif|svg)(\?.*)?$/i.test(url.pathname);
}

function isFontURL(url) {
  return /\.(woff2?|ttf|otf)(\?.*)?$/i.test(url.pathname);
}

function isJSONRequest(url) {
  return url.pathname.endsWith('.json');
}

function isShipImage(url) {
  // Detect ship images from /ships/ directory and subdirectories
  return /^\/ships\/.*\.(avif|webp|jpg|jpeg|png)(\?.*)?$/i.test(url.pathname);
}

function isShipPage(url) {
  // Detect individual ship pages
  return /^\/ships\/rcl\/[^/]+\.html$/i.test(url.pathname);
}

function isShipsIndexPage(url) {
  // Detect ships.html or ships/ships.html
  return /^\/ships(\/ships)?\.html$/i.test(url.pathname);
}

console.log('[SW] v' + VERSION + ' loaded');
