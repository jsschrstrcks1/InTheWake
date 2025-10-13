// /sw.js — In the Wake image cache (v0.8)
const CACHE = 'itw-img-v8';
const MAX_ITEMS = 240;

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(names
      .filter(n => n.startsWith('itw-img-') && n !== CACHE)
      .map(n => caches.delete(n)));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // only same-origin images (no CORS surprises)
  if (url.origin !== location.origin) return;

  const isImage = req.destination === 'image' ||
                  /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url.pathname);
  if (!isImage) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Normalize away query so ?v=… still hits the same entry.
    const normURL = new URL(url.href); normURL.search = '';
    const normReq = new Request(normURL.href, { method: 'GET' });

    const cached = await cache.match(normReq);

    // Always kick a background refresh; return cached immediately if present.
    const refresh = (async () => {
      try{
        const res = await fetch(req, { cache: 'no-store' });
        if (res && (res.ok || res.type === 'opaque')) {
          await cache.put(normReq, res.clone());
          await prune(cache);
        }
        return res;
      }catch(_){ return null; }
    })();

    return cached || await refresh || new Response('', { status: 504 });
  })());
});

async function prune(cache){
  const keys = await cache.keys();
  if (keys.length <= MAX_ITEMS) return;
  const toDelete = keys.length - MAX_ITEMS;
  for (let i = 0; i < toDelete; i++){
    await cache.delete(keys[i]);
  }
}
