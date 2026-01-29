/**
 * Ship-Port Cross-Linking Module
 * Version: 1.14.0
 *
 * Provides bidirectional linking between ship and port pages:
 * - Port pages show "Ships That Visit Here"
 * - Ship pages show "Ports on This Ship's Itineraries"
 *
 * Supported cruise lines: Royal Caribbean, Carnival, Celebrity, Norwegian, Princess, Holland America, MSC, Virgin Voyages, Costa Cruises, Cunard, Oceania, Regent, Seabourn, Silversea, Explora Journeys
 * Data source: /assets/data/ship-deployments.json
 */

(function shipPortLinks() {
  'use strict';

  const DEPLOYMENTS_URL = '/assets/data/ship-deployments.json';
  const SHIPS_URL = '/assets/data/ships.json';

  // Supported cruise lines with their URL paths and display info
  const CRUISE_LINES = {
    'rcl': {
      name: 'Royal Caribbean',
      path: '/ships/rcl/',
      bookingUrl: 'https://www.royalcaribbean.com/cruise-ships/',
      allShipsUrl: '/ships.html'
    },
    'carnival': {
      name: 'Carnival Cruise Line',
      path: '/ships/carnival/',
      bookingUrl: 'https://www.carnival.com/cruise-ships/',
      allShipsUrl: '/ships.html'
    },
    'celebrity': {
      name: 'Celebrity Cruises',
      path: '/ships/celebrity-cruises/',
      bookingUrl: 'https://www.celebritycruises.com/cruise-ships/',
      allShipsUrl: '/ships.html'
    },
    'ncl': {
      name: 'Norwegian Cruise Line',
      path: '/ships/ncl/',
      bookingUrl: 'https://www.ncl.com/cruise-ships/',
      allShipsUrl: '/ships.html'
    },
    'princess': {
      name: 'Princess Cruises',
      path: '/ships/princess/',
      bookingUrl: 'https://www.princess.com/ships-and-experience/ships/',
      allShipsUrl: '/ships.html'
    },
    'hal': {
      name: 'Holland America Line',
      path: '/ships/hal/',
      bookingUrl: 'https://www.hollandamerica.com/en_US/cruise-ships.html',
      allShipsUrl: '/ships.html'
    },
    'msc': {
      name: 'MSC Cruises',
      path: '/ships/msc/',
      bookingUrl: 'https://www.msccruises.com/cruise-ships',
      allShipsUrl: '/ships.html'
    },
    'virgin': {
      name: 'Virgin Voyages',
      path: '/ships/virgin/',
      bookingUrl: 'https://www.virginvoyages.com/ships',
      allShipsUrl: '/ships.html'
    },
    'costa': {
      name: 'Costa Cruises',
      path: '/ships/costa/',
      bookingUrl: 'https://www.costacruises.com/ships.html',
      allShipsUrl: '/ships.html'
    },
    'cunard': {
      name: 'Cunard',
      path: '/ships/cunard/',
      bookingUrl: 'https://www.cunard.com/en-gb/cruise-ships',
      allShipsUrl: '/ships.html'
    },
    'oceania': {
      name: 'Oceania Cruises',
      path: '/ships/oceania/',
      bookingUrl: 'https://www.oceaniacruises.com/ships/',
      allShipsUrl: '/ships.html'
    },
    'regent': {
      name: 'Regent Seven Seas',
      path: '/ships/regent/',
      bookingUrl: 'https://www.rssc.com/ships',
      allShipsUrl: '/ships.html'
    },
    'seabourn': {
      name: 'Seabourn',
      path: '/ships/seabourn/',
      bookingUrl: 'https://www.seabourn.com/en_US/cruise-ships.html',
      allShipsUrl: '/ships.html'
    },
    'silversea': {
      name: 'Silversea Cruises',
      path: '/ships/silversea/',
      bookingUrl: 'https://www.silversea.com/ships.html',
      allShipsUrl: '/ships.html'
    },
    'explora': {
      name: 'Explora Journeys',
      path: '/ships/explora/',
      bookingUrl: 'https://explorajourneys.com/ships/',
      allShipsUrl: '/ships.html'
    }
  };

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

    // Ship page: /ships/{cruise-line}/{ship-name}.html
    for (const [lineId, lineInfo] of Object.entries(CRUISE_LINES)) {
      if (path.startsWith(lineInfo.path) && path.endsWith('.html')) {
        const slug = path.replace(lineInfo.path, '').replace('.html', '');
        if (slug && !slug.includes('index')) {
          return { type: 'ship', slug: slug, cruiseLine: lineId };
        }
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
      'half-moon-cay': 'Half Moon Cay',
      'grand-turk': 'Grand Turk',
      'amber-cove': 'Amber Cove',
      'mahogany-bay': 'Mahogany Bay',
      'catalina-island': 'Catalina Island',
      'airlie-beach': 'Airlie Beach',
      'st-thomas': 'St. Thomas',
      'st-maarten': 'St. Maarten',
      'st-kitts': 'St. Kitts',
      'st-lucia': 'St. Lucia',
      'cape-liberty': 'Cape Liberty (Bayonne)',
      'port-canaveral': 'Port Canaveral',
      'fort-lauderdale': 'Fort Lauderdale',
      'long-beach': 'Long Beach',
      'new-orleans': 'New Orleans',
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
      'san-francisco': 'San Francisco',
      'buenos-aires': 'Buenos Aires',
      'punta-arenas': 'Punta Arenas',
      'san-cristobal': 'San Cristóbal',
      'great-stirrup-cay': 'Great Stirrup Cay',
      'new-york': 'New York',
      'ocean-cay': 'Ocean Cay MSC Marine Reserve',
      'abu-dhabi': 'Abu Dhabi',
      'bimini': 'The Beach Club at Bimini',
      'key-west': 'Key West',
      'palma-de-mallorca': 'Palma de Mallorca',
      'st-croix': 'St. Croix',
      'puerto-plata': 'Puerto Plata',
      'civitavecchia': 'Civitavecchia (Rome)',
      'punta-del-este': 'Punta del Este',
      'la-spezia': 'La Spezia',
      'quebec-city': 'Quebec City',
      'cape-town': 'Cape Town',
      'sydney-australia': 'Sydney, Australia',
      'monte-carlo': 'Monte Carlo'
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

    // Group ships by cruise line, then by class
    const shipsByCruiseLine = {};
    shipSlugs.forEach(slug => {
      const shipData = ships[slug];
      if (shipData) {
        const cruiseLine = shipData.cruise_line || 'rcl'; // Default to RCL for backward compatibility
        const shipClass = shipData.class || 'Other';

        if (!shipsByCruiseLine[cruiseLine]) {
          shipsByCruiseLine[cruiseLine] = {};
        }
        if (!shipsByCruiseLine[cruiseLine][shipClass]) {
          shipsByCruiseLine[cruiseLine][shipClass] = [];
        }

        shipsByCruiseLine[cruiseLine][shipClass].push({
          slug: slug,
          name: shipData.name || formatShipName(slug),
          class: shipClass
        });
      }
    });

    // Class order for sorting (larger ships first)
    const classOrders = {
      'rcl': ['Icon', 'Oasis', 'Quantum', 'Freedom', 'Voyager', 'Radiance', 'Vision', 'Other'],
      'carnival': ['Excel', 'Vista', 'Dream', 'Concordia', 'Venice', 'Destiny', 'Conquest', 'Spirit', 'Fantasy', 'Other'],
      'celebrity': ['Edge', 'Solstice', 'Millennium', 'Expedition', 'Other'],
      'ncl': ['Prima', 'Breakaway Plus', 'Breakaway', 'Epic', 'Jewel', 'Dawn', 'Sun', 'Spirit', 'Sky', 'America', 'Other'],
      'princess': ['Sphere', 'Royal', 'Grand', 'Coral', 'Other'],
      'hal': ['Pinnacle', 'Signature', 'Vista', 'R', 'Other'],
      'msc': ['World', 'Meraviglia Plus', 'Seaside EVO', 'Meraviglia', 'Seaside', 'Fantasia', 'Musica', 'Lirica', 'Other'],
      'virgin': ['Lady', 'Other'],
      'costa': ['Excellence', 'Venice', 'Diadema', 'Concordia', 'Spirit', 'Other'],
      'cunard': ['Ocean Liner', 'Queen', 'Other'],
      'oceania': ['Allura', 'Vista', 'Oceania', 'R-Class', 'Other'],
      'regent': ['Grandeur', 'Splendor', 'Explorer', 'Voyager', 'Mariner', 'Navigator', 'Other'],
      'seabourn': ['Encore', 'Odyssey', 'Expedition', 'Other'],
      'silversea': ['Nova', 'Muse', 'Spirit', 'Shadow', 'Wind', 'Expedition', 'Other'],
      'explora': ['Explora', 'Other']
    };

    // Brand colors for cruise lines
    const brandColors = {
      'rcl': { bg: '#e6f4f8', border: '#b8d4e3', hover: '#d0e8f0', text: '#0e6e8e' },
      'carnival': { bg: '#fff3e6', border: '#e3c8b8', hover: '#ffe6cc', text: '#c74a35' },
      'celebrity': { bg: '#f0f0f5', border: '#c0c0d0', hover: '#e0e0eb', text: '#1a1a4e' },
      'ncl': { bg: '#e6f0ff', border: '#b8c8e3', hover: '#d0e0f5', text: '#003087' },
      'princess': { bg: '#e6f2ef', border: '#b8d4cd', hover: '#d0e8e3', text: '#00665e' },
      'hal': { bg: '#e8eef5', border: '#c0cee0', hover: '#d8e4f0', text: '#1a3a5c' },
      'msc': { bg: '#e6e9f0', border: '#b8c0d0', hover: '#d0d5e5', text: '#1a2a4a' },
      'virgin': { bg: '#fce8e8', border: '#e8c0c0', hover: '#f5d5d5', text: '#cc0000' },
      'costa': { bg: '#fff8e6', border: '#e8d8b0', hover: '#fff0cc', text: '#c09000' },
      'cunard': { bg: '#f5e8e8', border: '#d8b0b0', hover: '#f0d8d8', text: '#8b0000' },
      'oceania': { bg: '#f5f0e8', border: '#d8c8b0', hover: '#f0e8d8', text: '#8b6914' },
      'regent': { bg: '#e8ecf5', border: '#b0b8d8', hover: '#d8e0f0', text: '#1a2a5e' },
      'seabourn': { bg: '#e8f0e8', border: '#b0d0b0', hover: '#d8e8d8', text: '#1a4a2e' },
      'silversea': { bg: '#f0f0f0', border: '#c0c0c0', hover: '#e8e8e8', text: '#404040' },
      'explora': { bg: '#f0eef5', border: '#c8c0d8', hover: '#e8e4f0', text: '#2a1a4e' }
    };

    let html = `
      <h3 id="ships-visiting-title">Ships That Visit Here</h3>
      <p class="tiny" style="margin-bottom: 0.75rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
        Cruise ships with ${formatPortName(portSlug)} on their itineraries:
      </p>
    `;

    // Render each cruise line's ships
    const cruiseLineOrder = ['rcl', 'celebrity', 'princess', 'hal', 'cunard', 'oceania', 'regent', 'seabourn', 'silversea', 'explora', 'ncl', 'msc', 'costa', 'virgin', 'carnival']; // Define display order
    const activeCruiseLines = cruiseLineOrder.filter(cl => shipsByCruiseLine[cl]);

    activeCruiseLines.forEach((cruiseLineId, index) => {
      const lineInfo = CRUISE_LINES[cruiseLineId];
      const colors = brandColors[cruiseLineId] || brandColors['rcl'];
      const classOrder = classOrders[cruiseLineId] || classOrders['rcl'];
      const shipsByClass = shipsByCruiseLine[cruiseLineId];

      if (activeCruiseLines.length > 1) {
        html += `
          <p style="margin: ${index > 0 ? '1rem' : '0'} 0 0.5rem 0; font-weight: 600; font-size: 0.9rem; color: ${colors.text};">
            ${lineInfo.name}
          </p>
        `;
      }

      html += `<div class="ship-links" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">`;

      const sortedClasses = Object.keys(shipsByClass).sort((a, b) => {
        return classOrder.indexOf(a) - classOrder.indexOf(b);
      });

      sortedClasses.forEach(shipClass => {
        shipsByClass[shipClass]
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(ship => {
            html += `
              <a href="${lineInfo.path}${ship.slug}.html"
                 class="ship-link-pill"
                 style="display: inline-block; padding: 0.35rem 0.75rem; background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 999px; font-size: 0.8rem; text-decoration: none; color: ${colors.text}; transition: background 0.2s;"
                 onmouseover="this.style.background='${colors.hover}'"
                 onmouseout="this.style.background='${colors.bg}'"
                 title="${ship.name} (${shipClass} Class)">
                ${ship.name}
              </a>
            `;
          });
      });

      html += `</div>`;
    });

    html += `
      <p class="tiny" style="margin-top: 0.75rem; color: var(--ink-light, #6b8a9a);">
        <a href="/ships.html">Browse all cruise ships →</a>
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
  function renderPortsForShip(shipSlug, deployments, cruiseLine) {
    const ships = deployments.ships || {};
    const shipData = ships[shipSlug];

    if (!shipData || !shipData.typical_ports || shipData.typical_ports.length === 0) return;

    // Find the FAQ section or another good insertion point
    const faqSection = document.querySelector('.faq');
    const mainContent = document.querySelector('.col-1 article') || document.querySelector('.col-1');

    if (!mainContent) return;

    // Get cruise line info
    const lineInfo = CRUISE_LINES[cruiseLine] || CRUISE_LINES['rcl'];

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
      <p style="margin-bottom: 0.75rem; color: var(--ink-mid, #3d5a6a);">
        ${shipData.name} typically sails from <strong>${homeports.map(formatPortName).join(', ')}</strong>
        on ${regions.map(r => r.replace(/-/g, ' ')).join(', ')} cruises.
      </p>
      <p style="margin-bottom: 1rem; font-size: 0.95rem; color: var(--ink, #1a2a3a);">
        <strong>Plan your shore days:</strong> Each port guide includes weather forecasts, best time to visit, what to pack, and local tips from cruisers who've been there.
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
        Itineraries vary by season. Check <a href="${lineInfo.bookingUrl}${shipSlug}" target="_blank" rel="noopener">${lineInfo.name}</a> for current sailings.
        <br><a href="/ports.html">Explore all 380+ port guides with weather, tips & excursions →</a>
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
        renderPortsForShip(context.slug, deployments, context.cruiseLine || 'rcl');
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
