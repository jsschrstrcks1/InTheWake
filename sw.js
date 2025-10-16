// /sw.js — In the Wake runtime cache (v11)
const IMG_CACHE    = 'itw-img-v11';
const ASSET_CACHE  = 'itw-asset-v11';
const PAGE_CACHE   = 'itw-solo-pages-v11';   // NEW: solo article HTML
const MAX_IMG      = 240;
const MAX_ASSETS   = 40;
const MAX_PAGES    = 60;

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    await self.clients.claim();
    const keep = new Set([IMG_CACHE, ASSET_CACHE, PAGE_CACHE]);
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(n => n.startsWith('itw-') && !keep.has(n))
        .map(n => caches.delete(n))
    );
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Same origin only (prevents CORS traps and analytics noise)
  if (url.origin !== location.origin) return;

  // Allow a manual opt-out
  if (url.searchParams.get('nocache') === '1') return;

  const dest = req.destination || '';

  // 1) Versioned CSS/JS (immutable by ?v=): cache-first
  const isVersionedAsset =
    (dest === 'style' || dest === 'script') && url.search.includes('v=');
  if (isVersionedAsset) {
    event.respondWith(cacheFirst(req, ASSET_CACHE, MAX_ASSETS));
    return;
  }

  // 2) Images (jpg/png/webp/avif/svg/gif): stale-while-revalidate
  const isImage =
    dest === 'image' ||
    /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url.pathname + url.search);
  if (isImage) {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE, MAX_IMG));
    return;
  }

  // 3) Solo article HTML: network-first with cache fallback
  const isSoloArticleHtml =
    url.pathname.startsWith('/solo/articles/') && /\.html$/i.test(url.pathname);
  if (isSoloArticleHtml) {
    event.respondWith(networkFirst(req, PAGE_CACHE, MAX_PAGES));
    return;
  }
});

// ---- Strategies ----------------------------------------------------------

async function cacheFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  const hit   = await cache.match(key);
  if (hit) return hit;
  const res = await fetch(request);
  if (okish(res)) {
    cache.put(key, res.clone()).catch(()=>{});
    prune(cache, maxItems).catch(()=>{});
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  const hitP  = cache.match(key);

  const netP = fetch(request)
    .then(res => {
      if (okish(res)) {
        cache.put(key, res.clone()).catch(()=>{});
        prune(cache, maxItems).catch(()=>{});
      }
      return res;
    })
    .catch(() => null);

  const hit = await hitP;
  return hit || (await netP) || new Response('', { status: 504 });
}

async function networkFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const key   = cacheKey(request);
  try {
    const res = await fetch(request, { cache: 'no-store' });
    if (okish(res)) {
      cache.put(key, res.clone()).catch(()=>{});
      prune(cache, maxItems).catch(()=>{});
    }
    return res;
  } catch {
    const hit = await cache.match(key);
    return hit || new Response('<h1>Offline</h1><p>This article is unavailable offline yet.</p>', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// ---- Helpers -------------------------------------------------------------

function cacheKey(request) {
  // Keep query string so ?v=… stays unique
  const url = new URL(request.url);
  return new Request(url.href, { method: 'GET' });
}
function okish(res) { return res && (res.ok || res.type === 'opaque'); }

async function prune(cache, max) {
  const keys = await cache.keys(); // FIFO-ish
  if (keys.length <= max) return;
  const drop = keys.length - max;
  for (let i = 0; i < drop; i++) { await cache.delete(keys[i]); }
}
