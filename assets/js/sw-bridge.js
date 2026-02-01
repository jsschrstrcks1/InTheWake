/* sw-bridge.js v14.3.0 — Service Worker Registration & Bridge
 * Handles SW lifecycle, updates, client-SW communication,
 * progressive offline caching (link/image scanning),
 * and proactive port map tile prefetching
 * Soli Deo Gloria ✝️
 */

(function () {
  'use strict';

  const VERSION = '14.3.0';

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

      case 'TILES_CACHED':
        // Port map tiles were cached for offline use
        window.dispatchEvent(new CustomEvent('sw-tiles-cached', {
          detail: event.data
        }));
        console.log('[SW-Bridge] Map tiles cached for ' + (event.data.portId || 'unknown') +
                    ' (' + event.data.fetched + ' new, ' + event.data.total + ' total)');
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

  /* ---------- Map Offline Indicator ---------- */
  /* When the SW confirms tiles are cached for a port, show a subtle
   * "Map available offline" badge on the Leaflet map. */

  window.addEventListener('sw-tiles-cached', function (e) {
    var detail = e.detail || {};
    if (!detail.portId || detail.portId.indexOf('-nearby') !== -1) return; // Skip nearby-port notifications

    var mapContainer = document.getElementById('port-map');
    if (!mapContainer || !mapContainer._portMap) return;

    var map = mapContainer._portMap;

    // Don't add twice
    if (mapContainer._offlineIndicator) return;

    var control = L.control({ position: 'bottomleft' });
    control.onAdd = function () {
      var div = L.DomUtil.create('div', 'port-map-offline-badge');
      div.style.cssText = 'background: rgba(14,110,142,0.9); color: #fff; padding: 4px 10px; ' +
        'border-radius: 4px; font-size: 0.75rem; font-weight: 600; pointer-events: none; ' +
        'box-shadow: 0 1px 3px rgba(0,0,0,0.2);';
      div.textContent = 'Map available offline';
      return div;
    };
    control.addTo(map);
    mapContainer._offlineIndicator = control;
  });

  /* ---------- Proactive Port Map Tile Caching ---------- */
  /* When on a port page, compute OSM tile URLs for the port's bounding box
   * at zoom levels 12-15 and send them to the SW for background caching.
   * Also prefetch low-zoom tiles for the 3 nearest ports on fast connections. */

  // Standard "slippy map" tile coordinate formula (used by OSM, Leaflet, Google Maps)
  function latLonToTile(lat, lon, zoom) {
    var n = Math.pow(2, zoom);
    var x = Math.floor((lon + 180) / 360 * n);
    var latRad = lat * Math.PI / 180;
    var y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x: x, y: y };
  }

  function getTilesForBBox(bbox, zoom) {
    var topLeft = latLonToTile(bbox.north, bbox.west, zoom);
    var bottomRight = latLonToTile(bbox.south, bbox.east, zoom);
    var tiles = [];
    for (var x = topLeft.x; x <= bottomRight.x; x++) {
      for (var y = topLeft.y; y <= bottomRight.y; y++) {
        tiles.push({ z: zoom, x: x, y: y });
      }
    }
    return tiles;
  }

  function tilesToUrls(tiles) {
    var subdomains = ['a', 'b', 'c'];
    return tiles.map(function (t) {
      var s = subdomains[(t.x + t.y) % 3];
      return 'https://' + s + '.tile.openstreetmap.org/' + t.z + '/' + t.x + '/' + t.y + '.png';
    });
  }

  function prefetchWeatherData() {
    // Proactively warm the cache with seasonal-guides.json on port pages.
    // The file is 1.2 MB but changes rarely — staleWhileRevalidate in
    // the SW means subsequent port pages get instant cache hits.
    var portEl = document.querySelector('[data-port-id]');
    if (!portEl) return;

    var conn = navigator.connection || {};
    if (conn.saveData) return;

    // Use a low-priority fetch that the SW will cache
    fetch('/assets/data/ports/seasonal-guides.json', { priority: 'low' })
      .catch(function () { /* silent — weather widget handles its own fetch */ });
  }

  function prefetchPortTiles() {
    var sw = navigator.serviceWorker.controller;
    if (!sw) return;

    var conn = navigator.connection || {};
    if (conn.saveData) return;
    if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return;

    // Detect port page — look for data-port-id attribute
    var portEl = document.querySelector('[data-port-id]');
    if (!portEl) return; // Not a port page
    var portId = portEl.getAttribute('data-port-id');
    if (!portId) return;

    // Fetch the port's map manifest to get bbox_hint
    fetch('/assets/data/maps/' + portId + '.map.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (manifest) {
        if (!manifest || !manifest.bbox_hint) return;

        var bbox = manifest.bbox_hint;
        var zoomLevels = [12, 13, 14, 15];
        var allTiles = [];

        for (var i = 0; i < zoomLevels.length; i++) {
          var tiles = getTilesForBBox(bbox, zoomLevels[i]);
          allTiles = allTiles.concat(tiles);
        }

        // Safety cap — skip if bbox is too large (some scenic areas)
        if (allTiles.length > 150) {
          console.log('[SW-Bridge] Skipping tile prefetch for ' + portId +
                      ' — bbox too large (' + allTiles.length + ' tiles)');
          return;
        }

        var tileUrls = tilesToUrls(allTiles);
        if (tileUrls.length > 0) {
          sw.postMessage({ type: 'SEED_TILES', tiles: tileUrls, portId: portId });
          console.log('[SW-Bridge] Queued ' + tileUrls.length + ' tiles for offline map (' + portId + ')');
        }
      })
      .catch(function () { /* Port has no map manifest — silent skip */ });
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth radius in km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function prefetchNearbyPortTiles() {
    var sw = navigator.serviceWorker.controller;
    if (!sw) return;

    var conn = navigator.connection || {};
    if (conn.saveData) return;
    // Only on fast connections (4g with decent bandwidth)
    if (conn.effectiveType && conn.effectiveType !== '4g') return;
    if (conn.downlink && conn.downlink < 5) return;

    var portEl = document.querySelector('[data-port-id]');
    if (!portEl) return;
    var portId = portEl.getAttribute('data-port-id');
    if (!portId) return;

    fetch('/assets/data/ports/ports-geo.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.ports) return;

        var current = null;
        for (var i = 0; i < data.ports.length; i++) {
          if (data.ports[i].id === portId) { current = data.ports[i]; break; }
        }
        if (!current) return;

        // Find 3 nearest ports by haversine distance
        var withDist = data.ports
          .filter(function (p) { return p.id !== portId && p.lat && p.lon; })
          .map(function (p) {
            return { id: p.id, lat: p.lat, lon: p.lon, dist: haversineDistance(current.lat, current.lon, p.lat, p.lon) };
          })
          .sort(function (a, b) { return a.dist - b.dist; })
          .slice(0, 3);

        // Only z12-13 for nearby ports (~3-6 tiles each)
        var allTiles = [];
        for (var j = 0; j < withDist.length; j++) {
          var p = withDist[j];
          var bbox = { north: p.lat + 0.15, south: p.lat - 0.15, east: p.lon + 0.15, west: p.lon - 0.15 };
          for (var z = 12; z <= 13; z++) {
            allTiles = allTiles.concat(getTilesForBBox(bbox, z));
          }
        }

        var tileUrls = tilesToUrls(allTiles);
        if (tileUrls.length > 0) {
          sw.postMessage({ type: 'SEED_TILES', tiles: tileUrls, portId: portId + '-nearby' });
          console.log('[SW-Bridge] Queued ' + tileUrls.length + ' nearby-port tiles');
        }
      })
      .catch(function () { /* Silent fail */ });
  }

  // Run after page is fully loaded and idle
  function scheduleBackgroundTasks() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(scanAndSeed, { timeout: 5000 });
      requestIdleCallback(prefetchWeatherData, { timeout: 8000 });
      requestIdleCallback(prefetchPortTiles, { timeout: 10000 });
      requestIdleCallback(prefetchNearbyPortTiles, { timeout: 15000 });
    } else {
      setTimeout(scanAndSeed, 2000);
      setTimeout(prefetchWeatherData, 4000);
      setTimeout(prefetchPortTiles, 5000);
      setTimeout(prefetchNearbyPortTiles, 10000);
    }
  }

  if (document.readyState === 'complete') {
    scheduleBackgroundTasks();
  } else {
    window.addEventListener('load', scheduleBackgroundTasks);
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
