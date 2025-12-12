/**
 * Port Map Module
 * Renders interactive Leaflet maps with POI markers for port pages
 *
 * @version 1.0.0
 * @requires Leaflet 1.9.x (loaded via CDN)
 */

(function() {
  'use strict';

  // POI type configurations - colors and icons
  const POI_TYPES = {
    port: { color: '#d32f2f', icon: '⚓', label: 'Cruise Terminal', zIndex: 1000 },
    beach: { color: '#0288d1', icon: '🏖️', label: 'Beach', zIndex: 800 },
    landmark: { color: '#7b1fa2', icon: '🏛️', label: 'Landmark', zIndex: 700 },
    nature: { color: '#388e3c', icon: '🌿', label: 'Nature', zIndex: 600 },
    district: { color: '#f57c00', icon: '🏘️', label: 'District', zIndex: 500 },
    shopping: { color: '#c2185b', icon: '🛍️', label: 'Shopping', zIndex: 600 },
    museum: { color: '#512da8', icon: '🏛️', label: 'Museum', zIndex: 600 },
    attraction: { color: '#00796b', icon: '⭐', label: 'Attraction', zIndex: 600 },
    park: { color: '#689f38', icon: '🌳', label: 'Park', zIndex: 500 }
  };

  // Default fallback
  const DEFAULT_TYPE = { color: '#607d8b', icon: '📍', label: 'Point of Interest', zIndex: 400 };

  /**
   * Create a custom divIcon marker
   */
  function createMarkerIcon(poi, typeConfig) {
    const isPort = poi.type === 'port';
    const size = isPort ? 36 : 28;

    return L.divIcon({
      className: 'port-map-marker',
      html: `<div class="marker-pin" style="
        background-color: ${typeConfig.color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "><span style="transform: rotate(45deg); font-size: ${isPort ? '16px' : '12px'};">${typeConfig.icon}</span></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size]
    });
  }

  /**
   * Create popup content for a POI
   */
  function createPopupContent(poi, labelOverride) {
    const typeConfig = POI_TYPES[poi.type] || DEFAULT_TYPE;
    const displayName = labelOverride || poi.name;

    let html = `
      <div class="port-map-popup">
        <h4 style="margin: 0 0 0.5rem; color: ${typeConfig.color}; font-size: 1rem;">
          ${typeConfig.icon} ${displayName}
        </h4>
        <p style="margin: 0 0 0.5rem; font-size: 0.85rem; color: #456;">
          <strong>Type:</strong> ${typeConfig.label}
        </p>
    `;

    if (poi.notes) {
      html += `<p style="margin: 0 0 0.5rem; font-size: 0.85rem; color: #567;">${poi.notes}</p>`;
    }

    // Add directions links
    html += `
      <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #e0e8f0; font-size: 0.8rem;">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lon}"
           target="_blank" rel="noopener" style="color: #0077b6; margin-right: 1rem;">
          📍 Google Maps
        </a>
        <a href="https://maps.apple.com/?daddr=${poi.lat},${poi.lon}"
           target="_blank" rel="noopener" style="color: #0077b6;">
          🍎 Apple Maps
        </a>
      </div>
    `;

    html += '</div>';
    return html;
  }

  /**
   * Initialize the port map
   * @param {Object} options - Configuration options
   * @param {string} options.containerId - DOM element ID for the map
   * @param {string} options.portSlug - Port identifier (e.g., 'aruba')
   * @param {string} [options.poiIndexUrl] - URL to POI index JSON
   * @param {string} [options.portManifestUrl] - URL to port manifest JSON
   */
  async function initPortMap(options) {
    const {
      containerId,
      portSlug,
      poiIndexUrl = '/assets/data/maps/poi-index.json',
      portManifestUrl = `/assets/data/maps/${portSlug}.map.json`
    } = options;

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Port map container #${containerId} not found`);
      return null;
    }

    // Show loading state
    container.innerHTML = '<div class="port-map-loading" style="display: flex; align-items: center; justify-content: center; height: 100%; color: #678;">Loading map...</div>';

    try {
      // Fetch POI index and port manifest in parallel
      const [poiIndexRes, portManifestRes] = await Promise.all([
        fetch(poiIndexUrl),
        fetch(portManifestUrl)
      ]);

      if (!poiIndexRes.ok || !portManifestRes.ok) {
        throw new Error('Failed to load map data');
      }

      const poiIndex = await poiIndexRes.json();
      const portManifest = await portManifestRes.json();

      // Clear loading state
      container.innerHTML = '';

      // Initialize Leaflet map
      const map = L.map(containerId, {
        scrollWheelZoom: false, // Prevent accidental zooms while scrolling page
        tap: false // Fix for mobile double-tap issue
      });

      // Add OpenStreetMap tiles with attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Collect all POI coordinates for bounds calculation
      const bounds = [];
      const markers = [];

      // Add port pin first (always present)
      if (portManifest.port_pin) {
        const portPoi = {
          id: 'port-pin',
          name: portManifest.port_pin.label || 'Cruise Terminal',
          lat: portManifest.port_pin.lat,
          lon: portManifest.port_pin.lon,
          type: 'port'
        };

        const typeConfig = POI_TYPES.port;
        const marker = L.marker([portPoi.lat, portPoi.lon], {
          icon: createMarkerIcon(portPoi, typeConfig),
          zIndexOffset: typeConfig.zIndex
        });

        marker.bindPopup(createPopupContent(portPoi), {
          maxWidth: 280,
          className: 'port-map-popup-container'
        });

        markers.push(marker);
        bounds.push([portPoi.lat, portPoi.lon]);
      }

      // Add POI markers
      for (const poiId of portManifest.poi_ids || []) {
        const poi = poiIndex[poiId];
        if (!poi) {
          console.warn(`POI not found in index: ${poiId}`);
          continue;
        }

        // Skip if it's the port terminal (already added)
        if (poi.type === 'port') continue;

        const typeConfig = POI_TYPES[poi.type] || DEFAULT_TYPE;
        const labelOverride = portManifest.label_overrides?.[poiId];

        const marker = L.marker([poi.lat, poi.lon], {
          icon: createMarkerIcon(poi, typeConfig),
          zIndexOffset: typeConfig.zIndex
        });

        marker.bindPopup(createPopupContent(poi, labelOverride), {
          maxWidth: 280,
          className: 'port-map-popup-container'
        });

        markers.push(marker);
        bounds.push([poi.lat, poi.lon]);
      }

      // Add all markers to a layer group
      const markerGroup = L.layerGroup(markers).addTo(map);

      // Fit map to show all POIs with padding
      if (bounds.length > 0) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 14
        });
      } else if (portManifest.bbox_hint) {
        // Fallback to bounding box hint
        const bbox = portManifest.bbox_hint;
        map.fitBounds([
          [bbox.south, bbox.west],
          [bbox.north, bbox.east]
        ]);
      }

      // Enable scroll wheel zoom after user clicks on map
      map.once('focus', function() {
        map.scrollWheelZoom.enable();
      });

      // Add legend
      addLegend(map, portManifest, poiIndex);

      // Store reference for potential later use
      container._portMap = map;

      return map;

    } catch (error) {
      console.error('Error initializing port map:', error);
      container.innerHTML = `
        <div class="port-map-error" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #678; text-align: center; padding: 1rem;">
          <p style="margin: 0 0 0.5rem;">Unable to load map</p>
          <p style="margin: 0; font-size: 0.85rem; color: #999;">Please check your connection and try again</p>
        </div>
      `;
      return null;
    }
  }

  /**
   * Add a legend control to the map
   */
  function addLegend(map, portManifest, poiIndex) {
    // Collect unique POI types in this port
    const typesPresent = new Set(['port']); // Port is always shown

    for (const poiId of portManifest.poi_ids || []) {
      const poi = poiIndex[poiId];
      if (poi && poi.type) {
        typesPresent.add(poi.type);
      }
    }

    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'port-map-legend');
      div.innerHTML = '<h5 style="margin: 0 0 0.5rem; font-size: 0.85rem; color: #1a2a3a;">Map Legend</h5>';

      for (const [type, config] of Object.entries(POI_TYPES)) {
        if (typesPresent.has(type)) {
          div.innerHTML += `
            <div style="display: flex; align-items: center; margin-bottom: 0.25rem; font-size: 0.75rem;">
              <span style="display: inline-block; width: 12px; height: 12px; background: ${config.color}; border-radius: 50%; margin-right: 0.5rem;"></span>
              ${config.label}
            </div>
          `;
        }
      }

      return div;
    };

    legend.addTo(map);
  }

  // Expose to global scope
  window.PortMap = {
    init: initPortMap,
    POI_TYPES: POI_TYPES
  };

})();
