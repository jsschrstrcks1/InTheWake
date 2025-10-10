// /sw.js — In the Wake image cache (v0.7-stable)
const CACHE = 'itw-img-v7';
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
  if (url.origin !== location.origin) return;

  const isLikelyImage = req.destination === 'image' || /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url.pathname);
  if (!isLikelyImage) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const normURL = new URL(url.href); normURL.search = '';
    const normReq = new Request(normURL.href, { method: 'GET' });

    const cached = await cache.match(normReq);
    const refresh = (async () => {
      try{
        const res = await fetch(req, { cache: 'no-store' });
        if (res && (res.ok || res.type === 'opaque')) {
          await cache.put(normReq, res.clone());
          prune(cache);
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
  for (let i=0; i<toDelete; i++){ await cache.delete(keys[i]); }
}
