// /sw.js — In the Wake runtime cache (v1.0)
const IMG_CACHE   = 'itw-img-v10';
const ASSET_CACHE = 'itw-asset-v10';
const MAX_IMG     = 240;
const MAX_ASSETS  = 40;

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    const keep = new Set([IMG_CACHE, ASSET_CACHE]);
    const names = await caches.keys();
    await Promise.all(names
      .filter(n => (n.startsWith('itw-')) && !keep.has(n))
      .map(n => caches.delete(n)));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Same-origin only
  if (url.origin !== location.origin) return;

  const dest = req.destination || '';
  const isImage = dest === 'image' || /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url.pathname + url.search);
  const isVersionedAsset =
    (dest === 'style' || dest === 'script') && url.search.includes('v=');

  // --- 1) Versioned CSS/JS: cache-first (immutable by version) -------------
  if (isVersionedAsset) {
    event.respondWith(cacheFirst(req, ASSET_CACHE, MAX_ASSETS));
    return;
  }

  // --- 2) Images: stale-while-revalidate (fast repeat views) ---------------
  if (isImage) {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE, MAX_IMG));
  }
});

// Strategies ---------------------------------------------------------------

async function cacheFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  const cached = await cache.match(key);
  if (cached) return cached;
  const res = await fetch(request);                 // normal HTTP caching still applies
  if (res && (res.ok || res.type === 'opaque')) {
    cache.put(key, res.clone()).catch(()=>{});
    prune(cache, maxItems).catch(()=>{});
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  const cachedPromise = cache.match(key);

  const networkPromise = fetch(request)             // let browser use its cache heuristics
    .then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        cache.put(key, res.clone()).catch(()=>{});
        prune(cache, maxItems).catch(()=>{});
      }
      return res;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  return cached || (await networkPromise) || new Response('', { status: 504 });
}

function cacheKey(request) {
  const url = new URL(request.url);
  // keep query string so ?v= busts remain distinct
  return new Request(url.href, { method: 'GET' });
}

async function prune(cache, max) {
  const keys = await cache.keys();                  // FIFO ≈ oldest first
  if (keys.length <= max) return;
  const toDelete = keys.length - max;
  for (let i = 0; i < toDelete; i++) { await cache.delete(keys[i]); }
}
