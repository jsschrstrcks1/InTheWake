/**
 * Stateroom Sanity Check - Service Worker
 * Enables offline functionality for cruise guests without WiFi
 * Soli Deo Gloria ✝️
 */

const CACHE_VERSION = 'stateroom-check-v1.0.0';
const CACHE_NAME = `stateroom-check-${CACHE_VERSION}`;

// Critical assets to cache on install
const PRECACHE_ASSETS = [
  '/stateroom-check.html',
  '/assets/js/stateroom-check.js',
  '/manifest.json',
  // Ship data files (12 ships as of 2025-11-27)
  '/assets/data/staterooms/stateroom-exceptions.allure-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.anthem-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.enchantment-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.harmony-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.icon-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.oasis-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.quantum-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.radiance-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.star-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.symphony-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.utopia-of-the-seas.v2.json',
  '/assets/data/staterooms/stateroom-exceptions.wonder-of-the-seas.v2.json'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell and data');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('stateroom-check-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache-first strategy for assets and data
  if (
    request.url.includes('/assets/') ||
    request.url.includes('.json') ||
    request.url.endsWith('.html')
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version
            return cachedResponse;
          }

          // Not in cache - fetch from network and cache it
          return fetch(request)
            .then((networkResponse) => {
              // Only cache successful responses
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              // Network failed - return offline page if available
              if (request.url.endsWith('.html')) {
                return caches.match('/stateroom-check.html');
              }
            });
        })
    );
  }
});

// Message event - allow page to trigger cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log('[Service Worker] Loaded and ready');
