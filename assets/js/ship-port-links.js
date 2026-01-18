/**
 * Ship-Port Cross-Linking Module
 * Version: 1.0.0
 *
 * Provides bidirectional linking between ship and port pages:
 * - Port pages show "Ships That Visit Here"
 * - Ship pages show "Ports on This Ship's Itineraries"
 *
 * Data source: /assets/data/ship-deployments.json
 */

(function shipPortLinks() {
  'use strict';

  const DEPLOYMENTS_URL = '/assets/data/ship-deployments.json';
  const SHIPS_URL = '/assets/data/ships.json';

  // Detect page type from URL
  function getPageContext() {
    const path = window.location.pathname;

    // Port page: /ports/cozumel.html
    if (path.startsWith('/ports/') && path.endsWith('.html')) {
      const slug = path.replace('/ports/', '').replace('.html', '');
      if (slug && slug !== 'index' && slug !== 'tender-ports') {
        return { type: 'port', slug: slug };
      }
    }

    // Ship page: /ships/rcl/icon-of-the-seas.html
    if (path.startsWith('/ships/rcl/') && path.endsWith('.html')) {
      const slug = path.replace('/ships/rcl/', '').replace('.html', '');
      if (slug && !slug.includes('index')) {
        return { type: 'ship', slug: slug };
      }
    }

    return null;
  }

  // Format ship name for display
  function formatShipName(slug) {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Format port name for display
  function formatPortName(slug) {
    const specialNames = {
      'cococay': 'Perfect Day at CocoCay',
      'st-thomas': 'St. Thomas',
      'st-maarten': 'St. Maarten',
      'st-kitts': 'St. Kitts',
      'st-lucia': 'St. Lucia',
      'cape-liberty': 'Cape Liberty (Bayonne)',
      'port-canaveral': 'Port Canaveral',
      'fort-lauderdale': 'Fort Lauderdale',
      'bar-harbor': 'Bar Harbor',
      'icy-strait-point': 'Icy Strait Point',
      'glacier-bay': 'Glacier Bay',
      'hubbard-glacier': 'Hubbard Glacier',
      'victoria-bc': 'Victoria, BC',
      'bay-of-islands': 'Bay of Islands',
      'la-spezia': 'La Spezia',
      'cabo-san-lucas': 'Cabo San Lucas',
      'puerto-vallarta': 'Puerto Vallarta',
      'costa-maya': 'Costa Maya',
      'grand-cayman': 'Grand Cayman',
      'nha-trang': 'Nha Trang',
      'koh-samui': 'Koh Samui',
      'hong-kong': 'Hong Kong',
      'portland-maine': 'Portland, Maine',
      'san-juan': 'San Juan',
      'new-caledonia': 'New Caledonia',
      'los-angeles': 'Los Angeles',
      'san-diego': 'San Diego',
      'san-francisco': 'San Francisco'
    };

    if (specialNames[slug]) return specialNames[slug];

    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Render "Ships That Visit Here" for port pages
  function renderShipsForPort(portSlug, deployments, shipsData) {
    const portToShips = deployments.port_to_ships || {};
    const ships = deployments.ships || {};
    const shipSlugs = portToShips[portSlug] || [];

    if (shipSlugs.length === 0) return;

    // Find insertion point (after nearby-ports section or before recent-rail)
    const nearbyPorts = document.querySelector('[aria-labelledby="nearby-ports-title"]');
    const recentRail = document.querySelector('[aria-labelledby="recent-rail-title"]');
    const insertPoint = nearbyPorts || recentRail;

    if (!insertPoint) return;

    // Create the section
    const section = document.createElement('section');
    section.className = 'card';
    section.setAttribute('aria-labelledby', 'ships-visiting-title');

    // Group ships by class for better organization
    const shipsByClass = {};
    shipSlugs.forEach(slug => {
      const shipData = ships[slug];
      if (shipData) {
        const shipClass = shipData.class || 'Other';
        if (!shipsByClass[shipClass]) shipsByClass[shipClass] = [];
        shipsByClass[shipClass].push({
          slug: slug,
          name: shipData.name || formatShipName(slug)
        });
      }
    });

    let html = `
      <h3 id="ships-visiting-title">Ships That Visit Here</h3>
      <p class="tiny" style="margin-bottom: 0.75rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
        Royal Caribbean ships with ${formatPortName(portSlug)} on their itineraries:
      </p>
      <div class="ship-links" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
    `;

    // Sort by class size (Oasis first, then Quantum, etc.)
    const classOrder = ['Icon', 'Oasis', 'Quantum', 'Freedom', 'Voyager', 'Radiance', 'Vision', 'Other'];
    const sortedClasses = Object.keys(shipsByClass).sort((a, b) => {
      return classOrder.indexOf(a) - classOrder.indexOf(b);
    });

    sortedClasses.forEach(shipClass => {
      shipsByClass[shipClass]
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(ship => {
          html += `
            <a href="/ships/rcl/${ship.slug}.html"
               class="ship-link-pill"
               style="display: inline-block; padding: 0.35rem 0.75rem; background: #e6f4f8; border: 1px solid #b8d4e3; border-radius: 999px; font-size: 0.8rem; text-decoration: none; color: var(--sea, #0e6e8e); transition: background 0.2s;"
               onmouseover="this.style.background='#d0e8f0'"
               onmouseout="this.style.background='#e6f4f8'"
               title="${ship.name} (${shipClass} Class)">
              ${ship.name}
            </a>
          `;
        });
    });

    html += `
      </div>
      <p class="tiny" style="margin-top: 0.75rem; color: var(--ink-light, #6b8a9a);">
        <a href="/ships.html">View all Royal Caribbean ships →</a>
      </p>
    `;

    section.innerHTML = html;

    // Insert after nearby-ports or before recent-rail
    if (nearbyPorts && nearbyPorts.nextSibling) {
      nearbyPorts.parentNode.insertBefore(section, nearbyPorts.nextSibling);
    } else if (recentRail) {
      recentRail.parentNode.insertBefore(section, recentRail);
    }
  }

  // Render "Ports on This Ship" for ship pages
  function renderPortsForShip(shipSlug, deployments) {
    const ships = deployments.ships || {};
    const shipData = ships[shipSlug];

    if (!shipData || !shipData.typical_ports || shipData.typical_ports.length === 0) return;

    // Find the FAQ section or another good insertion point
    const faqSection = document.querySelector('.faq');
    const mainContent = document.querySelector('.col-1 article') || document.querySelector('.col-1');

    if (!mainContent) return;

    // Create the section
    const section = document.createElement('section');
    section.className = 'card ports-visited';
    section.setAttribute('aria-labelledby', 'ports-itinerary-title');
    section.style.marginTop = '2rem';

    const homeports = shipData.homeports || [];
    const regions = shipData.regions || [];
    const ports = shipData.typical_ports || [];

    let html = `
      <h2 id="ports-itinerary-title">Ports on ${shipData.name}'s Itineraries</h2>
      <p style="margin-bottom: 1rem; color: var(--ink-mid, #3d5a6a);">
        ${shipData.name} typically sails from <strong>${homeports.map(formatPortName).join(', ')}</strong>
        on ${regions.map(r => r.replace(/-/g, ' ')).join(', ')} cruises.
      </p>
      <div class="port-links" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
    `;

    ports.forEach(portSlug => {
      html += `
        <a href="/ports/${portSlug}.html"
           class="port-link-pill"
           style="display: inline-block; padding: 0.4rem 0.85rem; background: linear-gradient(135deg, #f0f9fc 0%, #e6f4f8 100%); border: 1px solid #b8d4e3; border-radius: 999px; font-size: 0.85rem; text-decoration: none; color: var(--sea, #0e6e8e); transition: all 0.2s;"
           onmouseover="this.style.background='linear-gradient(135deg, #e6f4f8 0%, #d0e8f0 100%)'; this.style.transform='translateY(-1px)'"
           onmouseout="this.style.background='linear-gradient(135deg, #f0f9fc 0%, #e6f4f8 100%)'; this.style.transform='translateY(0)'">
          ${formatPortName(portSlug)}
        </a>
      `;
    });

    html += `
      </div>
      <p class="tiny" style="color: var(--ink-light, #6b8a9a);">
        Itineraries vary by season. Check <a href="https://www.royalcaribbean.com/cruise-ships/${shipSlug}" target="_blank" rel="noopener">Royal Caribbean</a> for current sailings.
        <br><a href="/ports.html">Browse all 333 port guides →</a>
      </p>
    `;

    section.innerHTML = html;

    // Insert before FAQ section if it exists, otherwise append to main content
    if (faqSection) {
      faqSection.parentNode.insertBefore(section, faqSection);
    } else {
      mainContent.appendChild(section);
    }
  }

  // Main initialization
  async function init() {
    const context = getPageContext();
    if (!context) return;

    try {
      const response = await fetch(DEPLOYMENTS_URL);
      if (!response.ok) throw new Error('Failed to load deployments');
      const deployments = await response.json();

      if (context.type === 'port') {
        renderShipsForPort(context.slug, deployments);
      } else if (context.type === 'ship') {
        renderPortsForShip(context.slug, deployments);
      }
    } catch (err) {
      console.log('Ship-port links: Could not load deployment data', err);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
