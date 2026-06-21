/* Service worker for the In the Wake — Family weather page.
   One job: installable + offline. Precache the shell + icons; cache-first for
   versioned static assets (icons, the Leaflet lib) so the page opens without a
   connection. Live weather/radar/alert APIs are NEVER cached — always network.
   Single-user-household personal page, so skipWaiting/clients.claim are intentional. */

const CACHE = "family-v1";
const SHELL = "/admin/weather-family.html";
const PRECACHE = [
  SHELL,
  "/admin/family-icons/icon-192.png",
  "/admin/family-icons/icon-512.png",
  "/admin/family-icons/icon-maskable-512.png",
  "/admin/family-icons/apple-touch-180.png",
];
// Never cache these — always go to the network (live data).
const NO_CACHE = ["api.open-meteo.com", "api.rainviewer.com", "api.weather.gov"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
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
  // a stale page forever. Fall back to cache only when offline.
  const isShell = req.mode === "navigate" ||
    (url.origin === self.location.origin && url.pathname === SHELL);
  if (isShell) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL, copy));
        }
        return res;
      }).catch(() => caches.match(SHELL))
    );
    return;
  }

  // Static assets (icons, cdnjs libs) stay CACHE-FIRST — they're versioned/stable.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res && res.status === 200 && (url.origin === self.location.origin || url.hostname.endsWith("cdnjs.cloudflare.com"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(SHELL))
    )
  );
});
