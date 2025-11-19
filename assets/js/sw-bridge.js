/* sw-bridge.js v12.0.0 — Service Worker Registration & Bridge
 * Handles SW lifecycle, updates, and client-SW communication
 * Soli Deo Gloria ✝️
 */

(function () {
  'use strict';

  const VERSION = '12.0.0';

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

  console.log('[SW-Bridge] v' + VERSION + ' loaded');
})();
