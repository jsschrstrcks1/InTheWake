// /sw.js — In the Wake image cache (v0.4)
const CACHE = 'itw-img-v4';
const IMG_RE = /\.(?:jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i;

// Activate immediately
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Fetch handler — stale-while-revalidate for images
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!IMG_RE.test(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // normalize key (ignore ?v=, ?cache=, etc. for duplicates)
    const key = new Request(url.origin + url.pathname, { method: 'GET' });
    const cached = await cache.match(key);

    // fetch in background
    const fetchPromise = fetch(req)
      .then(resp => {
        if (resp && resp.ok) {
          cache.put(key, resp.clone()).catch(() => {});
        }
        return resp;
      })
      .catch(() => null);

    // return cache first if present, else wait for network
    return cached || (await fetchPromise) || new Response('', { status: 504 });
  })());
});
