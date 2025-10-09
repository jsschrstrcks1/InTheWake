// /sw.js — In the Wake image cache (v0.3)
const CACHE = 'itw-img-v3';
const IMG_RE = /\.(?:jpg|jpeg|png|webp)(\?.*)?$/i;
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { clients.claim(); });

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only cache GET requests for images (same-origin recommended; allow CDN if same host policy)
  if (req.method !== 'GET') return;
  if (!IMG_RE.test(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreVary:true, ignoreSearch:false });
    const fetchPromise = fetch(req).then(resp => {
      if (resp && resp.ok) cache.put(req, resp.clone());
      return resp;
    }).catch(_ => cached); // offline fallback to cache
    return cached || fetchPromise;
  })());
});
