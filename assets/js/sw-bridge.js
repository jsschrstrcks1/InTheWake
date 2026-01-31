/* sw-bridge.js v14.1.0 — Service Worker Registration & Bridge
 * Handles SW lifecycle, updates, client-SW communication,
 * and progressive offline caching (link/image scanning)
 * Soli Deo Gloria ✝️
 */

(function () {
  'use strict';

  const VERSION = '14.1.0';

  if (!('serviceWorker' in navigator)) {
    console.log('[SW-Bridge] Service Workers not supported');
    return;
  }

  /* ---------- Registration ---------- */

  navigator.serviceWorker.register('/sw.js', {
    updateViaCache: 'none'
  }).then(registration => {
    console.log('[SW-Bridge] v' + VERSION + ' registered:', registration.scope);

    // If there's a waiting SW, activate it
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New SW installed while old one still controlling
            console.log('[SW-Bridge] New version available');

            // Notify the page of available update
            window.dispatchEvent(new CustomEvent('sw-update-available', {
              detail: { registration }
            }));

            // Auto-activate for seamless updates
            installingWorker.postMessage({ type: 'SKIP_WAITING' });
          } else {
            // First install
            console.log('[SW-Bridge] Service Worker installed');
          }
        }
      });
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update().catch(() => {});
    }, 60 * 60 * 1000);

  }).catch(error => {
    console.error('[SW-Bridge] Registration failed:', error);
  });

  /* ---------- Controller Change ---------- */

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;

    console.log('[SW-Bridge] Controller changed, reloading for fresh content');
    window.location.reload();
  });

  /* ---------- Message Handling ---------- */

  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, data } = event.data || {};

    switch (type) {
      case 'DATA_REFRESHED':
        // Calculator data was refreshed in background
        window.dispatchEvent(new CustomEvent('sw-data-refreshed', {
          detail: data
        }));
        console.log('[SW-Bridge] Data refreshed:', data?.resource);
        break;

      case 'CACHE_STATS':
        // Response to GET_CACHE_STATS request
        window.dispatchEvent(new CustomEvent('sw-cache-stats', {
          detail: data
        }));
        break;

      default:
        // Forward unknown messages as custom events
        if (type) {
          window.dispatchEvent(new CustomEvent('sw-message', {
            detail: event.data
          }));
        }
    }
  });

  /* ---------- Public API ---------- */

  window.itwSWBridge = {
    version: VERSION,

    // Get current SW version
    async getVersion() {
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => resolve(e.data?.version || 'unknown');
        navigator.serviceWorker.controller?.postMessage(
          { type: 'GET_VERSION' },
          [channel.port2]
        );
        setTimeout(() => resolve('timeout'), 2000);
      });
    },

    // Get cache statistics
    async getCacheStats() {
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => resolve(e.data?.stats || {});
        navigator.serviceWorker.controller?.postMessage(
          { type: 'GET_CACHE_STATS' },
          [channel.port2]
        );
        setTimeout(() => resolve({}), 2000);
      });
    },

    // Force refresh calculator data
    refreshData() {
      navigator.serviceWorker.controller?.postMessage({
        type: 'FORCE_REFRESH_DATA'
      });
    },

    // Clear all caches
    clearCaches() {
      navigator.serviceWorker.controller?.postMessage({
        type: 'CLEAR_CACHES'
      });
    },

    // Skip waiting (activate new SW)
    skipWaiting() {
      navigator.serviceWorker.controller?.postMessage({
        type: 'SKIP_WAITING'
      });
    },

    // Check if SW is ready
    async isReady() {
      try {
        await navigator.serviceWorker.ready;
        return !!navigator.serviceWorker.controller;
      } catch {
        return false;
      }
    }
  };

  /* ---------- Progressive Offline Caching ---------- */
  /* After each page load, scan for same-origin links and key images,
   * then send them to the SW for background caching. This means every
   * page the user visits progressively caches linked pages — ports
   * link ships, ships link tools, tools link ports. By the time a
   * cruiser boards, most of the site is available offline. */

  function scanAndSeed() {
    const sw = navigator.serviceWorker.controller;
    if (!sw) return; // No active SW yet

    // Respect save-data preference
    const conn = navigator.connection || {};
    if (conn.saveData) return;

    // Collect same-origin HTML links
    const origin = location.origin;
    const seen = new Set();
    const pageUrls = [];
    const imageUrls = [];

    // Scan all <a> links for same-origin HTML pages
    const links = document.querySelectorAll('a[href]');
    for (const a of links) {
      try {
        const url = new URL(a.href, origin);
        // Same origin only
        if (url.origin !== origin) continue;
        // HTML pages only (skip anchors, JS, JSON, images, etc.)
        const path = url.pathname;
        if (!path.endsWith('.html') && !path.endsWith('/') && path !== '/') continue;
        // Skip admin, assets, offline, 404
        if (path.startsWith('/admin/') || path.startsWith('/assets/') ||
            path === '/offline.html' || path === '/404.html') continue;
        // Normalize: strip hash and query
        const normalized = url.origin + url.pathname;
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        pageUrls.push(url.pathname);
      } catch (e) { /* skip malformed */ }
    }

    // Scan for key images (hero images, ship images, large content images)
    const images = document.querySelectorAll(
      'img[src], source[srcset], [style*="background-image"]'
    );
    for (const el of images) {
      try {
        let src = el.src || el.srcset || '';
        // Extract URL from srcset (take first entry)
        if (el.srcset) {
          src = el.srcset.split(',')[0].trim().split(/\s+/)[0];
        }
        // Extract from inline background-image
        if (!src && el.style?.backgroundImage) {
          const match = el.style.backgroundImage.match(/url\(['"]?([^'")\s]+)/);
          if (match) src = match[1];
        }
        if (!src) continue;
        const url = new URL(src, origin);
        if (url.origin !== origin) continue;
        // Only cache WebP/JPG/PNG images (skip SVGs, icons)
        if (!/\.(webp|jpg|jpeg|png)(\?.*)?$/i.test(url.pathname)) continue;
        const normalized = url.origin + url.pathname;
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        imageUrls.push(url.pathname);
      } catch (e) { /* skip */ }
    }

    // Send pages first (high priority), then images (normal priority)
    if (pageUrls.length > 0) {
      sw.postMessage({ type: 'SEED_URLS', urls: pageUrls, priority: 'normal' });
    }
    if (imageUrls.length > 0) {
      sw.postMessage({ type: 'SEED_URLS', urls: imageUrls, priority: 'low' });
    }

    if (pageUrls.length + imageUrls.length > 0) {
      console.log('[SW-Bridge] Seeding ' + pageUrls.length + ' pages, ' +
                  imageUrls.length + ' images for offline');
    }
  }

  // Run after page is fully loaded and idle
  if (document.readyState === 'complete') {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(scanAndSeed, { timeout: 5000 });
    } else {
      setTimeout(scanAndSeed, 2000);
    }
  } else {
    window.addEventListener('load', function () {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(scanAndSeed, { timeout: 5000 });
      } else {
        setTimeout(scanAndSeed, 2000);
      }
    });
  }

  // Also send network info to SW for adaptive caching decisions
  if (navigator.connection) {
    const sendNetworkInfo = function () {
      const conn = navigator.connection;
      navigator.serviceWorker.controller?.postMessage({
        type: 'NETWORK_INFO',
        effectiveType: conn.effectiveType || '4g',
        downlink: conn.downlink || 10,
        saveData: !!conn.saveData
      });
    };
    navigator.serviceWorker.ready.then(sendNetworkInfo);
    navigator.connection.addEventListener('change', sendNetworkInfo);
  }

  console.log('[SW-Bridge] v' + VERSION + ' loaded');
})();
