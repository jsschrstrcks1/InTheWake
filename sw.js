// /sw.js — In the Wake unified cache (v0.7-stable)
const CACHE = 'itw-img-v0.7';
const MAX_ITEMS = 200; // soft cap

self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => n.startsWith('itw-img-') && n !== CACHE)
           .map((n) => caches.delete(n))
    );
    // Optional: prefetch manifest and store if found
    try {
      const res = await fetch('/assets/cache-manifest.json', { cache: 'no-store' });
      if (res.ok) {
        const cache = await caches.open(CACHE);
        await cache.put('/assets/cache-manifest.json', res.clone());
      }
    } catch {}
  })());
});

// Allow manual update trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isLikelyImage =
    req.destination === 'image' ||
    /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url.pathname);

  if (!isLikelyImage) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Normalize key (strip ?v= and #hash)
    const normURL = new URL(url.href);
    normURL.search = '';
    normURL.hash = '';
    const normReq = new Request(normURL.href, { method: 'GET' });

    const cached = await cache.match(normReq);

    // Background refresh
    (async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        if (net && (net.ok || net.type === 'opaque')) {
          await cache.put(normReq, net.clone());
          pruneCache(cache, MAX_ITEMS).catch(() => {});
        }
      } catch {}
    })();

    // SWR: cache first, else network, else fallback pixel
    if (cached) return cached;
    try {
      const net = await fetch(req, { cache: 'no-store' });
      if (net && net.ok) {
        await cache.put(normReq, net.clone());
        pruneCache(cache, MAX_ITEMS).catch(() => {});
        return net;
      }
    } catch {}
    // Transparent 1x1 PNG fallback (prevents broken layout)
    const pixel =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    return fetch(pixel);
  })());
});

async function pruneCache(cache, maxItems) {
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  const toDelete = keys.length - maxItems;
  for (let i = 0; i < toDelete; i++) {
    await cache.delete(keys[i]);
  }
}
