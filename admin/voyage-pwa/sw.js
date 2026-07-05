/* Service worker for the In the Wake — Voyage Companion PWAs.
   One job: installable + offline. Precache the shared shell (CSS/JS/icons) and the
   Leaflet lib; cache-first for versioned static assets so a voyage page opens without
   a connection. Live weather/radar/alert APIs are NEVER cached — always network.
   Single-user-household personal pages, so skipWaiting/clients.claim are intentional.

   ISOLATION (deliberate): scoped to /admin/voyage-pwa/ ONLY. It never sees, caches, or
   evicts anything belonging to any other /admin/ page (the family page has its own
   worker at /admin/family/). So: (a) it only caches same-origin requests UNDER
   /admin/voyage-pwa/ (plus the Leaflet CDN), never a blanket "any same-origin 200";
   (b) it only deletes caches named "voyage-*", never another page's cache. Every voyage
   entry (anthem-alaska.html, prima-caribbean.html, …) shares this one worker + shell
   cache; each installs as its own home-screen app via its own manifest. */

const CACHE = "voyage-v3";
const OWN_SCOPE = "/admin/voyage-pwa/";   // the only same-origin prefix this worker will cache
const PRECACHE = [
  "/admin/voyage-pwa/companion.css",
  "/admin/voyage-pwa/companion.js",
  "/admin/voyage-pwa/icons/icon-192.png",
  "/admin/voyage-pwa/icons/icon-512.png",
  "/admin/voyage-pwa/icons/icon-maskable-512.png",
  "/admin/voyage-pwa/icons/apple-touch-180.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
];
// Never cache these — always go to the network (live data).
const NO_CACHE = ["api.open-meteo.com", "api.rainviewer.com", "api.weather.gov"];

// May this request be stored in OUR cache? Only our own scope, or the Leaflet CDN. Nothing else.
function cacheable(url) {
  if (url.hostname.endsWith("cdnjs.cloudflare.com")) return true;
  return url.origin === self.location.origin && url.pathname.startsWith(OWN_SCOPE);
}

self.addEventListener("install", (e) => {
  // addAll is atomic; a single 404 would fail the install. Add individually + tolerate
  // a missing CDN asset (the page still works online) so one hiccup can't brick install.
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(
      PRECACHE.map((u) => c.add(u).catch(() => null))
    )).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      // ONLY clean up our own old voyage-* caches; never touch a sibling page's cache.
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("voyage-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (NO_CACHE.some((h) => url.hostname.endsWith(h))) return; // live data — network passthrough

  // Voyage HTML pages are NETWORK-FIRST: always try the live page so content updates reach
  // an installed device; fall back to the cached copy only when offline. We only ever store
  // OUR-scope navigations (a voyage page under /admin/voyage-pwa/), never an arbitrary one.
  const inScope = url.origin === self.location.origin && url.pathname.startsWith(OWN_SCOPE);
  const isPage = req.mode === "navigate" && inScope;
  if (isPage) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match("/admin/voyage-pwa/companion.js")))
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
      }).catch(() => hit)
    )
  );
});
