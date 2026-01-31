/* Service Worker v14.2.0 - In the Wake
 * Site-wide unified caching strategy with offline support
 * Supports: Ships, Ports, Restaurants, Planning Tools, Drink Calculator
 * Soli Deo Gloria ✝️
 */

const VERSION = '14.2.0';
const CACHE_PREFIX = 'itw-site';

/* Network state (updated by client via NETWORK_INFO message) */
let networkInfo = {
  effectiveType: '4g',
  downlink: 10,
  saveData: false
};

const CACHES = {
  PRECACHE: `${CACHE_PREFIX}-precache-${VERSION}`,
  PAGES: `${CACHE_PREFIX}-pages-${VERSION}`,
  ASSETS: `${CACHE_PREFIX}-assets-${VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-${VERSION}`,
  DATA: `${CACHE_PREFIX}-data-${VERSION}`,
  FONTS: `${CACHE_PREFIX}-fonts-${VERSION}`,
  TILES: `${CACHE_PREFIX}-tiles-${VERSION}`,
  META: `${CACHE_PREFIX}-meta-${VERSION}`
};

const CONFIG = {
  maxPages: 1200,          // Updated 2026-01-31: Site has 1,167 HTML pages (380 ports, 297 ships, 404 restaurants, etc.)
  maxAssets: 150,          // CSS/JS modules
  maxImages: 600,          // 444 ship images + 2,906 WebP total, caching subset
  maxData: 150,            // Map manifests + JSON data files
  maxFonts: 30,
  maxTiles: 3000,            // OSM map tiles for offline port maps (~3k tiles covers visited ports at z10-16)
  staleMaxAge: 60 * 60 * 1000, // 1 hour
  fxApiMaxAge: 12 * 60 * 60 * 1000, // 12 hours — exchange rates don't change often
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

    // Allow OpenStreetMap tiles for offline port maps (cache-first — tiles rarely change)
    if (url.hostname.endsWith('tile.openstreetmap.org')) {
      event.respondWith(cacheFirstStrategy(request, CACHES.TILES, CONFIG.maxTiles));
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
  const { type, data, urls, priority } = event.data || {};

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

    case 'SEED_URLS':
      // Prefetch URLs sent from client (site-cache.js)
      event.waitUntil(seedUrls(urls || [], priority || 'normal'));
      break;

    case 'SEED_TILES':
      // Prefetch OSM map tiles for offline port maps
      event.waitUntil(seedTiles(event.data.tiles || [], event.data.portId || ''));
      break;

    case 'NETWORK_INFO':
      // Update network state for adaptive caching strategies
      networkInfo = {
        effectiveType: event.data.effectiveType || '4g',
        downlink: event.data.downlink || 10,
        saveData: !!event.data.saveData
      };
      console.log('[SW] Network info updated:', networkInfo);
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

async function staleIfError(request, cacheName, maxItems, maxAge) {
  const cache = await caches.open(cacheName);
  const key = normalizeRequest(request);
  const staleLimit = maxAge || CONFIG.staleMaxAge;

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
      if (age < staleLimit) {
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

  // Predictive prefetch: warm calculator shell when visiting related pages
  const pathname = new URL(request.url).pathname;
  if (pathname === '/' || pathname === '/index.html' || pathname === '/planning.html' ||
      pathname === '/drink-packages.html') {
    event.waitUntil(warmCalculatorShell());
  }

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
  return staleIfError(request, CACHES.DATA, CONFIG.maxData, CONFIG.fxApiMaxAge);
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

/* Predictive prefetch: when user visits planning.html or homepage,
 * warm the calculator shell so drink-calculator.html loads instantly. */
const CALC_SHELL_URLS = [
  '/drink-calculator.html',
  '/drink-packages.html',
  '/assets/js/calculator.js',
  '/assets/js/calculator-ui.js',
  '/assets/js/calculator-math.js',
  '/assets/js/calculator-worker.js',
  '/assets/css/calculator.css'
];
let calcShellWarmed = false;

async function warmCalculatorShell() {
  if (calcShellWarmed) return;
  calcShellWarmed = true;

  // Skip on slow or metered connections
  if (networkInfo.saveData || networkInfo.effectiveType === '2g') return;

  for (const url of CALC_SHELL_URLS) {
    try {
      const fullUrl = new URL(url, location.origin).href;
      const parsedUrl = new URL(fullUrl);

      // Determine target cache
      const isPage = parsedUrl.pathname.endsWith('.html');
      const cacheName = isPage ? CACHES.PAGES : CACHES.ASSETS;
      const maxItems = isPage ? CONFIG.maxPages : CONFIG.maxAssets;

      const cache = await caches.open(cacheName);
      const existing = await cache.match(fullUrl);
      if (existing) continue; // Already cached

      const response = await fetchWithTimeout(new Request(fullUrl), CONFIG.fetchTimeout);
      if (response && (response.ok || response.type === 'opaque')) {
        await cache.put(fullUrl, response);
        updateLRU(cacheName, fullUrl);
        pruneCache(cacheName, maxItems);
      }
    } catch (e) {
      // Skip failed prefetches — non-critical
    }
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

async function seedUrls(urls, priority = 'normal') {
  if (!urls || !urls.length) return;

  // Skip seeding on slow/metered connections unless priority is critical
  if (networkInfo.saveData && priority !== 'critical') {
    console.log('[SW] Skipping seed - save data mode');
    return;
  }

  if (networkInfo.effectiveType === '2g' && priority === 'low') {
    console.log('[SW] Skipping low-priority seed - slow connection');
    return;
  }

  // Limit concurrent fetches based on priority
  const concurrency = priority === 'critical' ? 6 : priority === 'high' ? 4 : 2;
  const chunks = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async url => {
        try {
          const fullUrl = new URL(url, location.origin).href;

          // Skip cross-origin unless it's allowed
          if (!isSameOrigin(fullUrl)) return;

          // Determine cache based on URL type
          const parsedUrl = new URL(fullUrl);
          let cacheName, maxItems;

          if (parsedUrl.pathname.endsWith('.html') || parsedUrl.pathname === '/' || parsedUrl.pathname.endsWith('/')) {
            cacheName = CACHES.PAGES;
            maxItems = CONFIG.maxPages;
          } else if (isImageURL(parsedUrl)) {
            cacheName = CACHES.IMAGES;
            maxItems = CONFIG.maxImages;
          } else if (parsedUrl.pathname.endsWith('.json')) {
            cacheName = CACHES.DATA;
            maxItems = CONFIG.maxData;
          } else if (isVersionedAsset(parsedUrl) || parsedUrl.pathname.match(/\.(css|js)$/i)) {
            cacheName = CACHES.ASSETS;
            maxItems = CONFIG.maxAssets;
          } else if (isFontURL(parsedUrl)) {
            cacheName = CACHES.FONTS;
            maxItems = CONFIG.maxFonts;
          } else {
            // Default to assets
            cacheName = CACHES.ASSETS;
            maxItems = CONFIG.maxAssets;
          }

          // Check if already cached
          const cache = await caches.open(cacheName);
          const existing = await cache.match(fullUrl);
          if (existing) {
            updateLRU(cacheName, fullUrl);
            return;
          }

          // Fetch and cache
          const response = await fetchWithTimeout(new Request(fullUrl), CONFIG.fetchTimeout);
          if (response && (response.ok || response.type === 'opaque')) {
            await cache.put(fullUrl, response);
            updateLRU(cacheName, fullUrl);
            pruneCache(cacheName, maxItems);
            console.log('[SW] Seeded:', fullUrl);
          }
        } catch (e) {
          // Silently skip failed seeds
        }
      })
    );

    // Small delay between chunks for low priority
    if (priority === 'low') {
      await new Promise(r => setTimeout(r, 100));
    }
  }
}

/* Proactive map tile caching — fetches OSM tiles for offline port maps.
 * Respects OSM tile usage policy: max 2 concurrent, 200ms inter-batch delay,
 * per-invocation cap of 100 tiles. */
async function seedTiles(tileUrls, portId) {
  if (!tileUrls.length) return;
  if (networkInfo.saveData) {
    console.log('[SW] Skipping tile seed — save-data mode');
    return;
  }
  if (networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g') {
    console.log('[SW] Skipping tile seed — slow connection');
    return;
  }

  const cache = await caches.open(CACHES.TILES);
  const maxPerSession = 100; // OSM policy: no bulk downloads
  let fetched = 0;
  let skipped = 0;

  // Max 2 concurrent requests (OSM tile usage policy)
  for (let i = 0; i < tileUrls.length && fetched < maxPerSession; i += 2) {
    const batch = tileUrls.slice(i, i + 2);
    await Promise.all(batch.map(async (url) => {
      try {
        const existing = await cache.match(url);
        if (existing) {
          updateLRU(CACHES.TILES, url);
          skipped++;
          return;
        }
        const response = await fetchWithTimeout(new Request(url, { mode: 'cors' }), CONFIG.fetchTimeout);
        if (response && response.ok) {
          await cache.put(url, response);
          updateLRU(CACHES.TILES, url);
          fetched++;
        }
      } catch (e) {
        // Silently skip failed tiles
      }
    }));
    // 200ms delay between batches — OSM politeness
    if (i + 2 < tileUrls.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  pruneCache(CACHES.TILES, CONFIG.maxTiles);

  if (fetched > 0 || skipped > 0) {
    console.log('[SW] Tile seed complete — fetched: ' + fetched + ', already cached: ' + skipped +
                (portId ? ' (' + portId + ')' : ''));
  }

  // Notify client that tiles are cached for this port
  if (portId && fetched > 0) {
    notifyClients({ type: 'TILES_CACHED', portId: portId, fetched: fetched, total: fetched + skipped });
  }
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
  // Detect individual ship pages from all cruise lines (rcl, carnival, celebrity-cruises, holland-america-line, msc)
  return /^\/ships\/[^/]+\/[^/]+\.html$/i.test(url.pathname);
}

function isShipsIndexPage(url) {
  // Detect ships.html or ships/ships.html
  return /^\/ships(\/ships)?\.html$/i.test(url.pathname);
}
