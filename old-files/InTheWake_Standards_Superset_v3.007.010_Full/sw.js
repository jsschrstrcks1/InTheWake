// /sw.js — In the Wake image cache (v0.4)
const CACHE = 'itw-img-v4';
const IMG_RE = /\.(?:jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i;
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { clients.claim(); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!IMG_RE.test(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreVary:true, ignoreSearch:false });
    const fetchPromise = fetch(req).then(resp => {
      if (resp && resp.ok) cache.put(req, resp.clone());
      return resp;
    }).catch(_ => cached);
    return cached || fetchPromise;
  })());
});
