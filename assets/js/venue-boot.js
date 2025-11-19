/**
 * Venue Boot - Restaurant page functionality
 * Handles ship pills, venue data loading, and interactive features
 * @version 2.257
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    version: '2.257',
    venueDataPath: '/assets/data/venues.json',
    shipDataPath: '/assets/data/fleets_index.json'
  };

  // Utility functions
  function getVenueSlug() {
    const path = window.location.pathname;
    const match = path.match(/\/restaurants\/([^/]+)\.html$/);
    return match ? match[1] : null;
  }

  // Initialize ship pills if present
  function initShipPills() {
    const pillsContainer = document.querySelector('.ship-pills');
    if (!pillsContainer) return;

    // Ship pills are typically pre-rendered in HTML
    // This just adds interactivity
    pillsContainer.querySelectorAll('a.chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        // Allow default link behavior
      });
    });
  }

  // Load venue-specific data if needed
  async function loadVenueData() {
    const slug = getVenueSlug();
    if (!slug) return;

    try {
      const response = await fetch(CONFIG.venueDataPath);
      if (!response.ok) return;

      const data = await response.json();
      const venue = data.venues ? data.venues[slug] : data[slug];

      if (venue) {
        // Update dynamic content if placeholders exist
        updateVenueContent(venue);
      }
    } catch (e) {
      // Venue data loading is optional - page works without it
      console.debug('[venue-boot] Venue data not loaded:', e.message);
    }
  }

  function updateVenueContent(venue) {
    // Update pricing if element exists
    const pricingEl = document.querySelector('[data-venue-pricing]');
    if (pricingEl && venue.pricing) {
      pricingEl.textContent = venue.pricing;
    }

    // Update ship availability if element exists
    const shipsEl = document.querySelector('[data-venue-ships]');
    if (shipsEl && venue.ships) {
      shipsEl.textContent = venue.ships.join(', ');
    }
  }

  // Boot sequence
  function boot() {
    initShipPills();
    loadVenueData();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
