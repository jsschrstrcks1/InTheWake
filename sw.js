// /sw.js — In the Wake unified cache (v0.6)
const CACHE = 'itw-img-v6';
const MAX_ITEMS = 200; // soft cap

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(
      names.filter(n => n.startsWith('itw-img-') && n !== CACHE)
           .map(n => caches.delete(n))
    );
    // optional: prefetch manifest if present
    fetch('/assets/cache-manifest.json', {cache:'no-store'}).catch(()=>{});
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Broader test: normal images or SVG/doc-classified ones
  const isLikelyImage = req.destination === 'image' ||
    /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url.pathname);
  if (!isLikelyImage) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // normalize key (strip ?v= etc.)
    const normURL = new URL(url.href);
    normURL.search = '';
    const normReq = new Request(normURL.href, { method: 'GET' });

    const cached = await cache.match(normReq);

    const refresh = (async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        if (net && (net.ok || net.type === 'opaque')) {
          await cache.put(normReq, net.clone());
          pruneCache(cache, MAX_ITEMS).catch(()=>{});
        }
        return net;
      } catch {
        return null;
      }
    })();

    // SWR: cache first, then background refresh
    return cached || (await refresh) || new Response('', { status: 504 });
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
