/* site-cache.js — SW helpers + intelligent prefetch (articles & cruise-line data) */

(function () {
  "use strict";

  const VERSION = "v3.010.102";

  /* ------------ SW Messaging (robust) ------------ */

  function postToSW(msg) {
    if (!("serviceWorker" in navigator)) return false;
    if (!navigator.serviceWorker.controller) return false;
    try {
      navigator.serviceWorker.controller.postMessage(msg);
      return true;
    } catch (_) { return false; }
  }

  function seedSW(urls, priority = "normal") {
    if (!("serviceWorker" in navigator)) return;

    const send = () => postToSW({ type: "SEED_URLS", urls, priority });

    // Try now; if controller not ready, wait for control then try again.
    if (send()) return;

    const onChange = () => { send(); navigator.serviceWorker.removeEventListener("controllerchange", onChange); };
    navigator.serviceWorker.addEventListener("controllerchange", onChange, { once: true });

    // Fallback: when ready promise resolves, try again
    setTimeout(() => {
      navigator.serviceWorker.ready.then(() => { send(); }).catch(()=>{});
    }, 1200);
  }

  // Expose globally for calculators / UI
  window.itwSeedSW = seedSW;

  /* ------------ Send network info to SW (adaptive strategies) ------------ */
  if ("connection" in navigator) {
    const c = navigator.connection;
    const pushInfo = () => postToSW({
      type: "NETWORK_INFO",
      effectiveType: c.effectiveType,
      downlink: c.downlink,
      saveData: !!c.saveData
    });
    // Initial send (in case SW is already controlling)
    pushInfo();
    c.addEventListener("change", pushInfo, { passive: true });
  }

  /* ------------ On-load warm seed (critical shell assist) ------------ */
  const BASE_SEEDS = [
    "/precache-manifest.json",
    "/sitemap.xml",
    "/sitemap.json",
    "/assets/styles.css?v="+VERSION,
    "/assets/js/site-cache.js?v="+VERSION,
    "/assets/data/articles/index.json?v="+VERSION
  ];

  window.addEventListener("load", () => seedSW(BASE_SEEDS, "high"));

  /* ------------ Hover prefetch: cruise-line pills ------------ */
  document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll('[data-cruise-line], .pill[data-src]');
    pills.forEach(pill => {
      const src = pill.getAttribute("data-src");
      const line = pill.getAttribute("data-cruise-line");
      const urls = [];
      if (src) urls.push(src);
      if (line) urls.push(`/assets/data/lines/${line}.json?v=${VERSION}`);

      if (!urls.length) return;

      const handler = () => { seedSW(urls, "high"); pill.removeEventListener("mouseenter", handler); };
      pill.addEventListener("mouseenter", handler, { once: true, passive: true });
      pill.addEventListener("touchstart", handler, { once: true, passive: true }); // mobile hint
    });
  });

  /* ------------ Hover prefetch: article links ------------ */
  // Prefetch when user hovers likely article links (solo/travel/planning/ports/…)
  const ARTICLE_PATH_RE = /^\/(?:solo(?:\/|\.html)|travel(?:\/|\.html)|planning(?:\/|\.html)|ports(?:\/|\.html)|restaurants(?:\/|\.html)|cruise-lines\/|ships\/|about-us\.html|accessibility\.html)/i;

  function setupHoverPrefetchForLinks(root = document) {
    const links = root.querySelectorAll('a[href^="/"]:not([data-no-prefetch])');
    links.forEach(a => {
      const href = a.getAttribute("href");
      if (!href || !ARTICLE_PATH_RE.test(href)) return;

      const onHover = () => { seedSW([href], "normal"); a.removeEventListener("mouseenter", onHover); };
      a.addEventListener("mouseenter", onHover, { once: true, passive: true });

      // For touch devices: when link scrolls near viewport, prefetch (low priority)
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(ent => {
            if (ent.isIntersecting) {
              seedSW([href], "low");
              io.disconnect();
            }
          });
        }, { rootMargin: "256px" });
        io.observe(a);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setupHoverPrefetchForLinks(document));
  } else {
    setupHoverPrefetchForLinks(document);
  }

  /* ------------ Prefetch next-likely pages (simple navigation graph) ------------ */
  const NAV_GRAPH = {
    "/drink-packages.html": ["/planning.html", "/restaurants.html", "/ports.html"],
    "/planning.html":       ["/ports.html", "/ships/", "/packing-lists.html"],
    "/solo.html":           ["/solo/why-i-started-solo-cruising.html", "/solo/freedom-of-your-own-wake.html", "/travel.html"]
  };

  function predictivePrefetch() {
    const next = NAV_GRAPH[location.pathname];
    if (!next) return;
    const doSeed = () => seedSW(next, "low");
    if ("requestIdleCallback" in window) {
      requestIdleCallback(doSeed, { timeout: 2500 });
    } else {
      setTimeout(doSeed, 1500);
    }
  }

  window.addEventListener("load", predictivePrefetch);

  /* ------------ Tiny helper for manual prefetch via data-prefetch ------------ */
  // <a href="/ports.html" data-prefetch="high">Ports</a>
  document.addEventListener("mouseover", (e) => {
    const a = e.target.closest('a[data-prefetch][href^="/"]');
    if (!a) return;
    const pri = (a.getAttribute("data-prefetch") || "normal").toLowerCase();
    seedSW([a.getAttribute("href")], pri);
  }, { passive: true });

})();
