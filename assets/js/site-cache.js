/* /assets/js/site-cache.js — In the Wake Site Cache Seeder (v3.010.102)
   Works with sw.js v20.1 and precache-manifest.json
   Purpose  : Provide a single “seedSW()” interface for runtime prefetching and offline warm-up
   Public   : window.itwSeedSW(urls [, priority])
*/

(function(){
  "use strict";

  const VERSION = "v3.010.102";

  /**
   * Main seed helper – posts a message to the active SW with the URLs to warm.
   * If the SW hasn’t taken control yet, wait for controllerchange.
   */
  function seedSW(urls, priority="normal"){
    if (!("serviceWorker" in navigator)) return;

    const send = ()=>{
      if (navigator.serviceWorker.controller){
        try{
          navigator.serviceWorker.controller.postMessage({ type:"SEED_URLS", urls, priority });
          return true;
        }catch(_){}
      }
      return false;
    };

    // Try immediately; otherwise retry when the SW claims the page.
    if (send()) return;
    navigator.serviceWorker.addEventListener("controllerchange", send, { once:true });

    // Fallback after 2 s in case controllerchange never fires
    setTimeout(()=>{ navigator.serviceWorker.ready.then(()=>send()); }, 2000);
  }

  // Expose public API for other modules (e.g. calculator JS)
  window.itwSeedSW = seedSW;

  /**
   * Core seed list – critical app shell + key assets for offline warm-up
   * Safe to update manually or extend per page.
   */
  const SEEDS = [
    // Pages (shell)
    "/", 
    "/drink-packages.html",
    "/planning.html",
    "/ports.html",
    "/restaurants.html",
    "/solo.html",

    // Assets (versioned)
    `/assets/styles.css?v=${VERSION}`,
    `/assets/js/site-cache.js?v=${VERSION}`,
    "/assets/critical.css",

    // Data (required by calculator and articles)
    `/assets/data/lines/royal-caribbean.json?v=${VERSION}`,
    `/assets/data/articles/index.json?v=${VERSION}`,

    // Icons / visual assets
    "/assets/logo_wake.png?v=3.010.102",
    "/assets/compass_rose.svg",

    // Offline support
    "/offline.html"
  ];

  /**
   * Seed core URLs after window load for maximum reliability.
   * This ensures critical pages and data are available offline.
   */
  window.addEventListener("load", ()=> seedSW(SEEDS, "high"));

  /**
   * Optional utility – diagnostic report of current SW cache state.
   * Usage:
   *   siteCacheDebug()
   *   (prints cache sizes to the console)
   */
  window.siteCacheDebug = async function(){
    if (!navigator.serviceWorker.controller){ console.warn("No active service worker"); return; }
    const mc = new MessageChannel();
    mc.port1.onmessage = (e)=>{ console.table(e.data.stats); };
    navigator.serviceWorker.controller.postMessage({ type:"GET_CACHE_STATS" }, [mc.port2]);
  };

})();
