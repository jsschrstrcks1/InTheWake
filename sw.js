// /sw.js — In the Wake image cache (v0.5)
const CACHE = 'itw-img-v5';
const MAX_ITEMS = 200; // soft cap

self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Claim clients and purge old caches
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(
      names.filter(n => n.startsWith('itw-img-') && n !== CACHE)
           .map(n => caches.delete(n))
    );
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Only same-origin images
  if (url.origin !== location.origin) return;

  // Prefer the browser’s classification over extension sniffing
  // (covers jpg/png/webp/avif/svg/gif reliably)
  if (req.destination !== 'image') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Cache lookup ignoring ?v= cache-busters, etc.
    const cached = await cache.match(req, { ignoreSearch: true });

    // Kick off background refresh
    const refresh = (async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        // Cache same-origin responses—even opaque is fine here
        if (net && (net.ok || net.type === 'opaque')) {
          // Put under a normalized key without querystring
          const normURL = new URL(url.href); normURL.search = '';
          await cache.put(new Request(normURL.href, { method: 'GET' }), net.clone());
          // Soft cap the cache
          pruneCache(cache, MAX_ITEMS).catch(() => {});
        }
        return net;
      } catch {
        return null;
      }
    })();

    // SWR: return cache first, then network if no hit
    return cached || (await refresh) || new Response('', { status: 504 });
  })());
});

// Remove oldest entries if we exceed MAX_ITEMS (best-effort)
async function pruneCache(cache, maxItems) {
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  const toDelete = keys.length - maxItems;
  for (let i = 0; i < toDelete; i++) {
    await cache.delete(keys[i]);
  }
}
