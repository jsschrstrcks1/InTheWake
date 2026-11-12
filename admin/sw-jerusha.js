/* Service worker for the Jerusha page.
   READ FIRST: admin/claude/plans/jerusha-SYSTEM-OVERVIEW.md (how the whole app works)
   and admin/claude/plans/jerusha-UPGRADE-PLAN-2026-11.md (what is being changed and why).
   Two jobs:
   1. Web Push — receive pushes and show notifications (Slice 2). The SW has NO
      decryption key, so note pushes are contentless; daily affirmation pushes
      carry their (non-secret) text in the payload so they show on the lockscreen.
   2. Installable + offline — precache the shell + icons, cache-first for the app's
      own static assets so the page opens and decrypts without a connection.
   Single-user personal page, so skipWaiting/clients.claim are intentional.

   The page lives at SHELL. LEGACY is the old URL, now a redirect stub in the repo;
   old bookmarks and the installed icon may still open it. Until 2026-11 this worker
   precached and fell back to LEGACY, so an offline open served the stub, the stub
   redirected to SHELL, SHELL failed to fetch, and the fallback served the stub again.
   Offline never opened. Everything below keys on SHELL; LEGACY is answered with the
   cached SHELL when the network is gone (the gate is self-contained, so it runs
   correctly under either URL). */

const CACHE = "jerusha-v5";   // bump on every change to this file's caching rules
const SHELL = "/admin/alaska-trip.html";
const LEGACY = "/admin/weather-jerusha.html";
const PRECACHE = [
  SHELL,
  "/admin/jerusha-icons/icon-192.png",
  "/admin/jerusha-icons/icon-512.png",
  "/admin/jerusha-icons/icon-maskable-512.png",
  "/admin/jerusha-icons/apple-touch-180.png",
];
// Never cache these — always go to the network (live data / the notes relay).
const NO_CACHE = ["api.open-meteo.com", "api.rainviewer.com", "api.weather.gov", "workers.dev"];
// The ONLY same-origin paths this worker caches. Its registration scope is /admin/,
// which holds many unrelated pages; it must not cache or answer for them.
const OWN_STATIC = ["/admin/jerusha-icons/", "/admin/jerusha-gallery/", "/admin/jerusha.webmanifest"];

const isOurShell = (url) => url.origin === self.location.origin && (url.pathname === SHELL || url.pathname === LEGACY);
const isOwnStatic = (url) => url.origin === self.location.origin && OWN_STATIC.some((p) => url.pathname.startsWith(p));

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      // ONLY clean up our own old jerusha-* caches; never delete a sibling page's cache.
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("jerusha-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (NO_CACHE.some((h) => url.hostname.endsWith(h))) return; // network passthrough

  // The HTML shell is NETWORK-FIRST: always try the live page so content updates
  // (the encrypted payload) reach an installed device. Fall back to the cached
  // shell only when offline. Any OTHER navigation under /admin/ is not ours: leave
  // it to the browser, so an offline miss on a sibling page shows the browser's own
  // error instead of this page's passphrase gate.
  if (isOurShell(url)) {
    e.respondWith(
      fetch(req).then((res) => {
        // Store only the real shell. A redirected or non-200 answer is never cached.
        if (res && res.status === 200 && !res.redirected && url.pathname === SHELL) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL, copy));
        }
        return res;
      }).catch(() => caches.match(SHELL).then((hit) => hit || Response.error()))
    );
    return;
  }
  if (req.mode === "navigate") return;

  // The app's own static assets and the cdnjs libraries are CACHE-FIRST (versioned,
  // stable). Everything else passes through untouched.
  const cacheable = isOwnStatic(url) || url.hostname === "cdnjs.cloudflare.com";
  if (!cacheable) return;
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        // cdnjs answers are opaque (status 0) unless the tag asks for CORS; cache them
        // too, since they are pinned by version in the URL.
        if (res && (res.status === 200 || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
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
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      for (const c of cs) {
        if ((c.url.includes("alaska-trip") || c.url.includes("weather-jerusha")) && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(SHELL);
    })
  );
});
