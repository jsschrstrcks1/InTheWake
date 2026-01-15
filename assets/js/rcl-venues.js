/**
 * RCL Venues Module v1.000.000
 * Soli Deo Gloria
 *
 * Features:
 * - Displays venues organized by ship class
 * - URL parameter filtering (?class=icon, ?class=oasis, etc.)
 * - Category organization (dining, bars, activities, entertainment)
 * - Responsive venue cards with cost and ship availability info
 */

(function() {
  'use strict';

  const VENUES_JSON_PATH = '/assets/data/venues-v2.json';

  // Category display configuration
  const CATEGORY_CONFIG = {
    dining: {
      icon: '🍽️',
      title: 'Dining Venues',
      order: 1,
      subcategoryOrder: ['complimentary', 'specialty']
    },
    bars: {
      icon: '🍸',
      title: 'Bars & Lounges',
      order: 2,
      subcategoryOrder: ['bar', 'coffee']
    },
    activities: {
      icon: '🎢',
      title: 'Activities & Recreation',
      order: 3,
      subcategoryOrder: ['waterpark', 'sports', 'fitness', 'casino', 'games', 'observation']
    },
    entertainment: {
      icon: '🎭',
      title: 'Entertainment',
      order: 4,
      subcategoryOrder: ['theater', 'music', 'shows']
    },
    neighborhoods: {
      icon: '🏝️',
      title: 'Neighborhoods & Areas',
      order: 5,
      subcategoryOrder: ['area']
    }
  };

  // Ship class mappings
  const CLASS_MAPPINGS = {
    icon: 'Icon Class',
    oasis: 'Oasis Class',
    quantum: 'Quantum Class',
    'quantum-ultra': 'Quantum Ultra Class',
    freedom: 'Freedom Class',
    voyager: 'Voyager Class',
    radiance: 'Radiance Class',
    vision: 'Vision Class'
  };

  // Class descriptions
  const CLASS_DESCRIPTIONS = {
    'Icon Class': 'The largest ships at sea with 8 neighborhoods, Category 6 waterpark, and groundbreaking innovations',
    'Oasis Class': 'Revolutionary ships featuring Central Park, Boardwalk, and the Ultimate Abyss',
    'Quantum Class': 'Tech-forward ships with North Star, SeaPlex, and Two70 entertainment venue',
    'Quantum Ultra Class': 'Enhanced Quantum ships for the Asia-Pacific market with premium features',
    'Freedom Class': 'Classic Royal Caribbean experience with FlowRider and ice skating rink',
    'Voyager Class': 'The ships that started the mega-ship era with Royal Promenade',
    'Radiance Class': 'Mid-size ships known for panoramic views and glass elevators'
  };

  let venuesData = null;
  let shipsData = null;
  let venuesIndex = null;
  let currentFilter = 'all';

  /**
   * Initialize the module
   */
  async function init() {
    try {
      await loadVenuesData();
      setupFilterPills();
      handleURLParams();
      render();
    } catch (error) {
      console.error('Failed to initialize venues:', error);
      showError();
    }
  }

  /**
   * Load venues data from JSON
   */
  async function loadVenuesData() {
    const response = await fetch(VENUES_JSON_PATH);
    if (!response.ok) throw new Error('Failed to fetch venues data');

    const data = await response.json();
    venuesData = data.venues || [];
    shipsData = data.ships || {};

    // Build venue index for quick lookup
    venuesIndex = Object.fromEntries(venuesData.map(v => [v.slug, v]));
  }

  /**
   * Setup filter pill click handlers
   */
  function setupFilterPills() {
    const pills = document.querySelectorAll('.class-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Update active state
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        // Update filter and re-render
        currentFilter = pill.dataset.class;

        // Update URL without reload
        const url = new URL(window.location);
        if (currentFilter === 'all') {
          url.searchParams.delete('class');
        } else {
          url.searchParams.set('class', currentFilter);
        }
        window.history.replaceState({}, '', url);

        render();
      });
    });
  }

  /**
   * Handle URL parameters for deep linking
   */
  function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const classParam = params.get('class');

    if (classParam && CLASS_MAPPINGS[classParam.toLowerCase()]) {
      currentFilter = classParam.toLowerCase();

      // Update pill active state
      const pills = document.querySelectorAll('.class-pill');
      pills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.class === currentFilter);
      });
    }
  }

  /**
   * Get ships filtered by class
   */
  function getShipsByClass(classFilter) {
    if (classFilter === 'all') {
      return Object.entries(shipsData);
    }

    const targetClass = CLASS_MAPPINGS[classFilter];
    if (!targetClass) return [];

    return Object.entries(shipsData).filter(([slug, ship]) =>
      ship.class === targetClass
    );
  }

  /**
   * Get venues available for a set of ships, organized by category
   */
  function getVenuesForShips(ships) {
    const venueMap = new Map();

    ships.forEach(([shipSlug, ship]) => {
      (ship.venues || []).forEach(venueSlug => {
        const venue = venuesIndex[venueSlug];
        if (!venue) return;

        // Skip venues that should be consolidated
        if (venue.consolidate_into) return;

        if (!venueMap.has(venueSlug)) {
          venueMap.set(venueSlug, {
            ...venue,
            ships: []
          });
        }
        venueMap.get(venueSlug).ships.push(ship.name);
      });
    });

    return Array.from(venueMap.values());
  }

  /**
   * Organize venues by category
   */
  function organizeByCategory(venues) {
    const categories = {};

    venues.forEach(venue => {
      const category = venue.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(venue);
    });

    // Sort venues within each category
    Object.values(categories).forEach(venueList => {
      venueList.sort((a, b) => {
        // Sort by subcategory order, then by name
        const configA = CATEGORY_CONFIG[a.category];
        const configB = CATEGORY_CONFIG[b.category];

        if (configA && configB) {
          const orderA = configA.subcategoryOrder?.indexOf(a.subcategory) ?? 99;
          const orderB = configB.subcategoryOrder?.indexOf(b.subcategory) ?? 99;
          if (orderA !== orderB) return orderA - orderB;
        }

        // Complimentary before specialty
        if (a.subcategory !== b.subcategory) {
          if (a.subcategory === 'complimentary') return -1;
          if (b.subcategory === 'complimentary') return 1;
        }

        return (a.name || '').localeCompare(b.name || '');
      });
    });

    return categories;
  }

  /**
   * Render the venues display
   */
  function render() {
    const container = document.getElementById('venuesContainer');
    if (!container) return;

    const ships = getShipsByClass(currentFilter);

    if (ships.length === 0) {
      container.innerHTML = `
        <div class="no-venues-message">
          <p>No ships found for this class.</p>
        </div>
      `;
      return;
    }

    const venues = getVenuesForShips(ships);
    const categorized = organizeByCategory(venues);

    // Build HTML
    let html = '';

    // Add class header if filtered
    if (currentFilter !== 'all') {
      const className = CLASS_MAPPINGS[currentFilter];
      const description = CLASS_DESCRIPTIONS[className] || '';
      const shipNames = ships.map(([_, s]) => s.name).join(', ');

      html += `
        <section class="ship-class-venues-header">
          <div>
            <h2 class="ship-class-venues-title">${className}</h2>
            <p class="ship-class-venues-subtitle">${description}</p>
            <p class="ship-class-venues-subtitle"><strong>Ships:</strong> ${shipNames}</p>
          </div>
        </section>
      `;
    }

    // Render each category
    const categoryOrder = Object.keys(CATEGORY_CONFIG).sort(
      (a, b) => (CATEGORY_CONFIG[a]?.order || 99) - (CATEGORY_CONFIG[b]?.order || 99)
    );

    categoryOrder.forEach(categoryKey => {
      const venueList = categorized[categoryKey];
      if (!venueList || venueList.length === 0) return;

      const config = CATEGORY_CONFIG[categoryKey] || { icon: '📍', title: categoryKey };

      html += `
        <section class="venue-category" aria-labelledby="${categoryKey}-heading">
          <header class="venue-category-header">
            <span class="venue-category-icon" aria-hidden="true">${config.icon}</span>
            <h3 id="${categoryKey}-heading" class="venue-category-title">${config.title}</h3>
          </header>
          <div class="venue-grid">
            ${venueList.map(venue => createVenueCard(venue, ships.length)).join('')}
          </div>
        </section>
      `;
    });

    // Handle "other" categories not in config
    Object.keys(categorized).forEach(categoryKey => {
      if (CATEGORY_CONFIG[categoryKey]) return;

      const venueList = categorized[categoryKey];
      if (!venueList || venueList.length === 0) return;

      html += `
        <section class="venue-category" aria-labelledby="${categoryKey}-heading">
          <header class="venue-category-header">
            <span class="venue-category-icon" aria-hidden="true">📍</span>
            <h3 id="${categoryKey}-heading" class="venue-category-title">${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}</h3>
          </header>
          <div class="venue-grid">
            ${venueList.map(venue => createVenueCard(venue, ships.length)).join('')}
          </div>
        </section>
      `;
    });

    container.innerHTML = html;
  }

  /**
   * Create a venue card HTML
   */
  function createVenueCard(venue, totalShips) {
    const badgeClass = venue.premium ? 'specialty' : 'complimentary';
    const badgeText = venue.subcategory === 'specialty' ? 'Specialty' :
                      venue.premium ? 'Premium' : 'Included';

    const costHtml = venue.cost ? `<p class="venue-cost">${venue.cost}</p>` : '';

    // Show ship availability if not on all ships
    let shipsHtml = '';
    if (venue.ships && venue.ships.length < totalShips && totalShips > 1) {
      shipsHtml = `<p class="venue-ships">Available on: ${venue.ships.join(', ')}</p>`;
    }

    return `
      <article class="venue-card">
        <header class="venue-card-header">
          <h4 class="venue-name">${venue.name || venue.slug}</h4>
          <span class="venue-badge ${badgeClass}">${badgeText}</span>
        </header>
        <p class="venue-description">${venue.description || ''}</p>
        ${costHtml}
        ${shipsHtml}
      </article>
    `;
  }

  /**
   * Show error message
   */
  function showError() {
    const container = document.getElementById('venuesContainer');
    if (container) {
      container.innerHTML = `
        <div class="no-venues-message">
          <p>Unable to load venues. Please try again later.</p>
        </div>
      `;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
