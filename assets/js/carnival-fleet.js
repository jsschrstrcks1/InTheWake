/**
 * Carnival Fleet Module v1.000.000
 * Soli Deo Gloria
 *
 * Features:
 * - Hierarchical ship class → ship display
 * - Ship images from social assets
 * - Collapsible sections with smooth transitions
 * - Class descriptions and ship CTAs
 */

(function() {
  'use strict';

  // Carnival fleet organized by class
  const CARNIVAL_FLEET = {
    'Excel Class': {
      order: 1,
      description: 'The newest and largest ships featuring BOLT roller coaster, zones instead of decks, and the most dining options at sea.',
      ships: [
        { name: 'Carnival Mardi Gras', slug: 'carnival-mardi-gras', year: 2021, gt: '180,000', capacity: 5282 },
        { name: 'Carnival Celebration', slug: 'carnival-celebration', year: 2022, gt: '183,900', capacity: 5282 },
        { name: 'Carnival Jubilee', slug: 'carnival-jubilee', year: 2023, gt: '183,900', capacity: 5282 },
        { name: 'Carnival Festivale', slug: 'carnival-festivale', year: 2027, gt: '182,800', capacity: 5400, upcoming: true },
        { name: 'Carnival Tropicale', slug: 'carnival-tropicale', year: 2028, gt: '182,800', capacity: 5400, upcoming: true }
      ]
    },
    'Vista Class': {
      order: 2,
      description: 'Feature-rich ships with SkyRide, IMAX theater, and the first Havana section for Cuban-inspired relaxation.',
      ships: [
        { name: 'Carnival Vista', slug: 'carnival-vista', year: 2016, gt: '133,500', capacity: 3954 },
        { name: 'Carnival Horizon', slug: 'carnival-horizon', year: 2018, gt: '133,500', capacity: 3954 },
        { name: 'Carnival Panorama', slug: 'carnival-panorama', year: 2019, gt: '133,500', capacity: 3954 },
        { name: 'Carnival Venezia', slug: 'carnival-venezia', year: 2023, gt: '133,500', capacity: 4060, note: 'Ex-Costa' }
      ]
    },
    'Dream Class': {
      order: 3,
      description: 'Mid-size ships with Ocean Plaza, the Lanai promenade, and excellent sports facilities including SkyCourse ropes.',
      ships: [
        { name: 'Carnival Dream', slug: 'carnival-dream', year: 2009, gt: '130,000', capacity: 3646 },
        { name: 'Carnival Magic', slug: 'carnival-magic', year: 2011, gt: '130,000', capacity: 3690 },
        { name: 'Carnival Breeze', slug: 'carnival-breeze', year: 2012, gt: '130,000', capacity: 3690 }
      ]
    },
    'Conquest Class': {
      order: 4,
      description: 'Classic Fun Ship experience with great value. Features include the signature red funnel and spacious public areas.',
      ships: [
        { name: 'Carnival Conquest', slug: 'carnival-conquest', year: 2002, gt: '110,000', capacity: 2973 },
        { name: 'Carnival Glory', slug: 'carnival-glory', year: 2003, gt: '110,000', capacity: 2973 },
        { name: 'Carnival Valor', slug: 'carnival-valor', year: 2004, gt: '110,000', capacity: 2973 },
        { name: 'Carnival Liberty', slug: 'carnival-liberty', year: 2005, gt: '110,000', capacity: 2973 },
        { name: 'Carnival Freedom', slug: 'carnival-freedom', year: 2007, gt: '110,000', capacity: 2973 }
      ]
    },
    'Spirit Class': {
      order: 5,
      description: 'Elegant mid-size ships perfect for longer voyages with excellent suites and intimate atmosphere.',
      ships: [
        { name: 'Carnival Spirit', slug: 'carnival-spirit', year: 2001, gt: '88,500', capacity: 2124 },
        { name: 'Carnival Pride', slug: 'carnival-pride', year: 2001, gt: '88,500', capacity: 2124 },
        { name: 'Carnival Legend', slug: 'carnival-legend', year: 2002, gt: '88,500', capacity: 2124 },
        { name: 'Carnival Miracle', slug: 'carnival-miracle', year: 2004, gt: '88,500', capacity: 2124 }
      ]
    },
    'Splendor Class': {
      order: 6,
      description: 'Bridge between classic and modern Carnival with enhanced dining and entertainment options.',
      ships: [
        { name: 'Carnival Splendor', slug: 'carnival-splendor', year: 2008, gt: '113,300', capacity: 3006 }
      ]
    },
    'Sunshine Class': {
      order: 7,
      description: 'Extensively renovated ships with modern amenities including WaterWorks, Guy\'s Burger Joint, and RedFrog Pub.',
      ships: [
        { name: 'Carnival Sunshine', slug: 'carnival-sunshine', year: 2013, gt: '102,370', capacity: 3006, note: 'Renovated from Destiny' },
        { name: 'Carnival Sunrise', slug: 'carnival-sunrise', year: 2019, gt: '101,509', capacity: 2548, note: 'Renovated from Triumph' },
        { name: 'Carnival Radiance', slug: 'carnival-radiance', year: 2021, gt: '101,509', capacity: 2548, note: 'Renovated from Victory' }
      ]
    },
    'Fantasy Class': {
      order: 8,
      description: 'Classic ships offering great value for shorter cruises. Compact and easy to navigate.',
      ships: [
        { name: 'Carnival Elation', slug: 'carnival-elation', year: 1998, gt: '70,367', capacity: 2040 },
        { name: 'Carnival Paradise', slug: 'carnival-paradise', year: 1998, gt: '70,367', capacity: 2040 }
      ]
    },
    'Ex-Costa Fleet': {
      order: 9,
      description: 'Ships transferred from Costa Cruises with Italian heritage and unique features adapted for Carnival.',
      ships: [
        { name: 'Carnival Firenze', slug: 'carnival-firenze', year: 2024, gt: '135,500', capacity: 4126, note: 'Ex-Costa Firenze' },
        { name: 'Carnival Luminosa', slug: 'carnival-luminosa', year: 2022, gt: '92,720', capacity: 2260, note: 'Ex-Costa Luminosa' }
      ]
    },
    'Ex-P&O Australia': {
      order: 10,
      description: 'Ships from P&O Australia joining the Carnival fleet with Southern Hemisphere sailing experience.',
      ships: [
        { name: 'Carnival Adventure', slug: 'carnival-adventure', year: 2025, gt: '109,000', capacity: 2600, note: 'Ex-Pacific Adventure' },
        { name: 'Carnival Encounter', slug: 'carnival-encounter', year: 2025, gt: '109,000', capacity: 2600, note: 'Ex-Pacific Encounter' }
      ]
    }
  };

  // Ship CTAs - why choose this ship
  const SHIP_CTAS = {
    'carnival-mardi-gras': 'First ship with BOLT roller coaster at sea. Perfect for thrill-seekers wanting the newest innovations.',
    'carnival-celebration': 'Miami\'s newest mega-ship with 6 zones to explore. Ideal for families wanting variety and excitement.',
    'carnival-jubilee': 'Galveston\'s flagship with Texas-sized fun. Great for Gulf Coast cruisers wanting the latest features.',
    'carnival-festivale': 'Coming 2027 with even more innovations. Book early for the newest Excel-class experience.',
    'carnival-tropicale': 'Coming 2028 as the 5th Excel ship. Perfect for those who want to be first on the newest ship.',
    'carnival-vista': 'The original Vista-class that introduced SkyRide. Great value for Vista features at lower prices.',
    'carnival-horizon': 'Year-round from Miami with Caribbean itineraries. Perfect for Florida cruisers.',
    'carnival-panorama': 'Long Beach homeport for Mexican Riviera. Ideal for West Coast families.',
    'carnival-venezia': 'Italian-designed ship from Costa. Unique for those wanting something different.',
    'carnival-dream': 'The ship that revolutionized Carnival. Excellent value with proven amenities.',
    'carnival-magic': 'Popular for Caribbean sailings with extensive dining. Great for foodies.',
    'carnival-breeze': 'Newest Dream-class with the most refined features. Perfect for first-timers.',
    'carnival-conquest': 'Classic Fun Ship from New Orleans. Perfect for Mardi Gras-themed cruising.',
    'carnival-glory': 'New York homeport for Bermuda and Caribbean. Ideal for East Coast cruisers.',
    'carnival-valor': 'Puerto Rico sailings to Southern Caribbean. Great for exotic itineraries.',
    'carnival-liberty': 'Port Canaveral homeport near theme parks. Perfect for Orlando combo trips.',
    'carnival-freedom': 'Galveston homeport with Caribbean routes. Great value for Texas cruisers.',
    'carnival-spirit': 'Australia-based for South Pacific adventures. Perfect for exotic destinations.',
    'carnival-pride': 'Year-round from Baltimore. Ideal for mid-Atlantic cruisers avoiding flights.',
    'carnival-legend': 'Tampa homeport with Western Caribbean. Great for Florida Gulf Coast access.',
    'carnival-miracle': 'Alaska specialist in summer, California in winter. Perfect for scenic voyages.',
    'carnival-splendor': 'Unique ship bridging eras. Good for those wanting classic Carnival with modern touches.',
    'carnival-sunshine': 'Charleston homeport with extensive Bahamas sailings. Great for short getaways.',
    'carnival-sunrise': 'Miami homeport with Caribbean variety. Excellent for value-seekers.',
    'carnival-radiance': 'Newest Sunshine-class renovation. Modern amenities on a classic hull.',
    'carnival-elation': 'Jacksonville homeport for quick escapes. Perfect for first-time cruisers.',
    'carnival-paradise': 'Compact and easy to navigate. Great for those who prefer smaller ships.',
    'carnival-firenze': 'Italian-designed with unique entertainment. Perfect for those wanting something different.',
    'carnival-luminosa': 'Elegant ship with intimate feel. Great for couples and adult groups.',
    'carnival-adventure': 'New to the fleet in 2025. Great for trying something fresh.',
    'carnival-encounter': 'New to the fleet in 2025. Perfect for West Coast sailing options.'
  };

  // Class header images (use flagship ship)
  const CLASS_IMAGES = {
    'Excel Class': '/assets/social/carnival-mardi-gras.jpg',
    'Vista Class': '/assets/social/carnival-vista.jpg',
    'Dream Class': '/assets/social/carnival-dream.jpg',
    'Conquest Class': '/assets/social/carnival-conquest.jpg',
    'Spirit Class': '/assets/social/carnival-spirit.jpg',
    'Splendor Class': '/assets/social/carnival-splendor.jpg',
    'Sunshine Class': '/assets/social/carnival-sunshine.jpg',
    'Fantasy Class': '/assets/social/carnival-elation.jpg',
    'Ex-Costa Fleet': '/assets/social/carnival-firenze.jpg',
    'Ex-P&O Australia': '/assets/social/carnival-adventure.jpg'
  };

  /**
   * Get ship image URL
   */
  function getShipImage(slug) {
    return `/assets/social/${slug}.jpg`;
  }

  /**
   * Create ship card HTML
   */
  function createShipCard(ship) {
    const imageUrl = getShipImage(ship.slug);
    const pageUrl = `/ships/carnival/${ship.slug}.html`;
    const cta = SHIP_CTAS[ship.slug] || 'Explore this ship to discover what makes it special for your cruise.';
    const formattedCapacity = ship.capacity ? ship.capacity.toLocaleString() : '';

    let badges = '';
    if (ship.upcoming) {
      badges += `<span class="upcoming-badge item-card-badge" aria-label="Coming soon">Coming ${ship.year}</span>`;
    }
    if (ship.note) {
      badges += `<span class="note-badge item-card-badge" aria-label="${ship.note}">${ship.note}</span>`;
    }

    return `
      <article class="ship-card item-card${ship.upcoming ? ' upcoming' : ''}" data-ship-slug="${ship.slug}">
        <a href="${pageUrl}" class="ship-card-link item-card-link">
          <div class="ship-card-image item-card-image">
            <img src="${imageUrl}"
                 alt="${ship.name}"
                 loading="lazy"
                 decoding="async"
                 onerror="this.onerror=null;this.src='/assets/social/ships-hero.jpg'" />
            ${badges}
          </div>
          <div class="ship-card-content item-card-content">
            <h3 class="ship-card-title item-card-title">${ship.name}</h3>
            <div class="ship-card-stats item-card-meta">
              <span class="badge">${ship.year}</span>
              ${ship.gt ? `<span class="badge">${ship.gt} GT</span>` : ''}
              ${formattedCapacity ? `<span class="badge">${formattedCapacity} guests</span>` : ''}
            </div>
            <p class="item-card-cta">${cta}</p>
            <span class="ship-card-cta-btn">${ship.upcoming ? 'Coming Soon' : 'Explore Ship'}</span>
          </div>
        </a>
      </article>
    `;
  }

  /**
   * Create ship class section HTML
   */
  function createShipClassSection(className, classData) {
    const ships = classData.ships;
    if (ships.length === 0) return '';

    const shipsHtml = ships.map(ship => createShipCard(ship)).join('');
    const shipCount = ships.length;
    const classImage = CLASS_IMAGES[className] || '/assets/social/ships-hero.jpg';
    const classDescription = classData.description || '';

    const isFirstClass = className === 'Excel Class';
    const expandedState = isFirstClass ? 'true' : 'false';
    const collapsedClass = isFirstClass ? '' : ' collapsed';
    const classSlug = className.replace(/\s+/g, '-').toLowerCase();

    return `
      <section class="ship-class-section${collapsedClass}" data-class="${className}" id="${classSlug}">
        <button class="ship-class-toggle"
                type="button"
                aria-expanded="${expandedState}"
                aria-controls="ships-${classSlug}">
          <div class="ship-class-header-content">
            <div class="ship-class-image">
              <img src="${classImage}" alt="${className}" loading="lazy" decoding="async" />
            </div>
            <div class="ship-class-info">
              <h2 class="ship-class-title">
                ${className}
                <span class="ship-count">${shipCount} ship${shipCount !== 1 ? 's' : ''}</span>
              </h2>
              ${classDescription ? `<p class="ship-class-description">${classDescription}</p>` : ''}
            </div>
          </div>
          <span class="toggle-icon" aria-hidden="true">▼</span>
        </button>
        <div class="ship-class-content"
             id="ships-${classSlug}"
             role="region"
             aria-label="${className} ships">
          <div class="ship-grid">
            ${shipsHtml}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Create cruise line section HTML
   */
  function createCruiseLineSection() {
    const sortedClasses = Object.entries(CARNIVAL_FLEET)
      .sort((a, b) => (a[1].order || 999) - (b[1].order || 999));

    const classesHtml = sortedClasses
      .map(([className, classData]) => createShipClassSection(className, classData))
      .filter(html => html)
      .join('');

    const activeShips = Object.values(CARNIVAL_FLEET).reduce((sum, cls) =>
      sum + cls.ships.filter(s => !s.upcoming).length, 0);

    return `
      <section class="cruise-line-section" data-line="carnival">
        <div class="cruise-line-header">
          <div class="cruise-line-hero carnival-hero">
            <img src="/assets/social/carnival-mardi-gras.jpg" alt="Carnival Cruise Line fleet" loading="eager" decoding="async" />
            <div class="cruise-line-hero-overlay">
              <h2 class="cruise-line-title">Carnival Cruise Line</h2>
              <p class="cruise-line-stats">${activeShips} ships · ${Object.keys(CARNIVAL_FLEET).length} ship classes · "Choose Fun"</p>
            </div>
          </div>
          <div class="cruise-line-actions">
            <button class="view-all-btn" type="button" id="toggleAllClasses">
              Expand All Classes
            </button>
          </div>
        </div>
        <div class="cruise-line-content">
          ${classesHtml}
        </div>
      </section>
    `;
  }

  /**
   * Initialize collapsible sections
   */
  function initializeCollapsibles() {
    const toggleButtons = document.querySelectorAll('.ship-class-toggle');

    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        const content = button.nextElementSibling;
        const section = button.closest('.ship-class-section');

        button.setAttribute('aria-expanded', !expanded);
        section.classList.toggle('collapsed', expanded);

        if (!expanded) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
      });
    });
  }

  /**
   * Initialize "Expand All" functionality
   */
  function initializeExpandAll() {
    const toggleAllBtn = document.getElementById('toggleAllClasses');
    if (!toggleAllBtn) return;

    let allExpanded = false;

    toggleAllBtn.addEventListener('click', () => {
      const sections = document.querySelectorAll('.ship-class-section');
      const buttons = document.querySelectorAll('.ship-class-toggle');

      allExpanded = !allExpanded;
      toggleAllBtn.textContent = allExpanded ? 'Collapse All Classes' : 'Expand All Classes';

      sections.forEach((section, index) => {
        const button = buttons[index];
        const content = section.querySelector('.ship-class-content');

        button.setAttribute('aria-expanded', allExpanded);
        section.classList.toggle('collapsed', !allExpanded);

        if (allExpanded) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
      });
    });
  }

  /**
   * Initialize the Carnival fleet page
   */
  function init() {
    const container = document.getElementById('carnivalFleetContainer');
    if (!container) return;

    container.innerHTML = createCruiseLineSection();

    initializeCollapsibles();
    initializeExpandAll();

    requestAnimationFrame(() => {
      document.querySelectorAll('.ship-class-content').forEach(content => {
        content.style.maxHeight = content.scrollHeight + 'px';
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
