/* Service worker for the In the Wake — Family weather page.
   One job: installable + offline. Precache the shell + icons; cache-first for
   versioned static assets (icons, the Leaflet lib) so the page opens without a
   connection. Live weather/radar/alert APIs are NEVER cached — always network.
   Single-user-household personal page, so skipWaiting/clients.claim are intentional.

   ISOLATION (deliberate): this worker is scoped to /admin/family/ ONLY. It must never
   see, cache, or evict anything belonging to any other /admin/ page. So: (a) it only
   caches same-origin requests UNDER /admin/family/ (plus the Leaflet CDN), never a
   blanket "any same-origin 200"; (b) it only deletes caches named "family-*", never
   another page's cache. Nothing from a sibling page can land in this cache. */

const CACHE = "family-v1";
const SHELL = "/admin/family/weather-family.html";
const OWN_SCOPE = "/admin/family/";   // the only same-origin prefix this worker will cache
const PRECACHE = [
  SHELL,
  "/admin/family/icons/icon-192.png",
  "/admin/family/icons/icon-512.png",
  "/admin/family/icons/icon-maskable-512.png",
  "/admin/family/icons/apple-touch-180.png",
];
// Never cache these — always go to the network (live data).
const NO_CACHE = ["api.open-meteo.com", "api.rainviewer.com", "api.weather.gov"];

// May this request be stored in OUR cache? Only our own scope, or the Leaflet CDN. Nothing else.
function cacheable(url) {
  if (url.hostname.endsWith("cdnjs.cloudflare.com")) return true;
  return url.origin === self.location.origin && url.pathname.startsWith(OWN_SCOPE);
}

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      // ONLY clean up our own old family-* caches; never touch a sibling page's cache.
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("family-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (NO_CACHE.some((h) => url.hostname.endsWith(h))) return; // network passthrough

  // The HTML shell is NETWORK-FIRST: always try the live page so content updates
  // actually reach an installed device. A cache-first frozen shell pins the user to
  // a stale page forever. Fall back to cache only when offline. We only ever store
  // OUR shell path, never an arbitrary navigation (that path can't cross-cache a sibling).
  const isShell = req.mode === "navigate" ||
    (url.origin === self.location.origin && url.pathname === SHELL);
  if (isShell) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200 && url.pathname === SHELL) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL, copy));
        }
        return res;
      }).catch(() => caches.match(SHELL))
    );
    return;
  }

  // Static assets stay CACHE-FIRST — but only OUR-scope assets + Leaflet are ever stored.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res && res.status === 200 && cacheable(url)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(SHELL))
    )
  );
});
