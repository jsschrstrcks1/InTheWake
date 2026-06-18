/* Service worker for the Jerusha page.
   Two jobs:
   1. Web Push — receive pushes and show notifications (Slice 2). The SW has NO
      decryption key, so note pushes are contentless; daily affirmation pushes
      carry their (non-secret) text in the payload so they show on the lockscreen.
   2. Installable + offline — precache the shell + icons, cache-first for static
      assets so the page opens and decrypts without a connection.
   Single-user personal page, so skipWaiting/clients.claim are intentional. */

const CACHE = "jerusha-v1";
const PRECACHE = [
  "/admin/weather-jerusha.html",
  "/admin/jerusha-icons/icon-192.png",
  "/admin/jerusha-icons/icon-512.png",
  "/admin/jerusha-icons/icon-maskable-512.png",
  "/admin/jerusha-icons/apple-touch-180.png",
];
// Never cache these — always go to the network (live data / the notes relay).
const NO_CACHE = ["api.open-meteo.com", "api.rainviewer.com", "api.weather.gov", "workers.dev"];

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
  // cache-first for the shell + static assets (same-origin + cdnjs libs)
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res && res.status === 200 && (url.origin === self.location.origin || url.hostname.endsWith("cdnjs.cloudflare.com"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match("/admin/weather-jerusha.html"))
    )
  );
});

self.addEventListener("push", (e) => {
  let title = "💛 In the Wake";
  let body = "A new note is waiting for you.";
  try {
    if (e.data) {
      const d = e.data.json();
      if (d.title) title = d.title;
      if (d.body) body = d.body;
    }
  } catch (_) {
    if (e.data) body = e.data.text();
  }
  e.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/admin/jerusha-icons/icon-192.png",
    badge: "/admin/jerusha-icons/icon-192.png",
    tag: "jerusha",
    renotify: true,
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = "/admin/weather-jerusha.html";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      for (const c of cs) {
        if (c.url.includes("weather-jerusha") && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
