// /sw.js — In the Wake image cache (v0.8)
const CACHE = 'itw-img-v8';
const MAX_ITEMS = 240;

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('itw-img-') && n !== CACHE).map(n => caches.delete(n)));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // only cache same-origin images
  if (url.origin !== location.origin) return;
  const isLikelyImage = req.destination === 'image' ||
    /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url.pathname + url.search);
  if (!isLikelyImage) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // ✅ keep query string to respect ?v= cache-busters
    const normReq = new Request(url.href, { method: 'GET' });

    // Network-first, cache-fallback so fresh edits show immediately
    try {
      const fresh = await fetch(req, { cache: 'no-store' });
      if (fresh && (fresh.ok || fresh.type === 'opaque')) {
        cache.put(normReq, fresh.clone()).catch(()=>{});
        prune(cache).catch(()=>{});
      }
      return fresh;
    } catch {
      const cached = await cache.match(normReq);
      return cached || new Response('', { status: 504 });
    }
  })());
});

async function prune(cache){
  const keys = await cache.keys();
  if (keys.length <= MAX_ITEMS) return;
  const toDelete = keys.length - MAX_ITEMS;
  for (let i=0; i<toDelete; i++){ await cache.delete(keys[i]); }
}
