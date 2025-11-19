/**
 * Ships Dynamic Module v1.000.000
 * Soli Deo Gloria
 *
 * Features:
 * - Hierarchical cruise line → ship class → ship display
 * - Intelligent image matching and cycling
 * - Collapsible sections with smooth transitions
 * - Share functionality
 * - Only shows ships with available images
 */

(function() {
  'use strict';

  // Ship image database - maps ship slugs to available images
  const SHIP_IMAGES = {
    // Icon Class
    'icon-of-the-seas': [
      '/assets/ships/rcl/icon-of-the-seas-1.jpg',
      '/assets/ships/rcl/icon-of-the-seas-2.jpg',
      '/assets/ships/rcl/icon-of-the-seas-aerial.jpg'
    ],
    'star-of-the-seas': [
      '/assets/ships/rcl/star-of-the-seas-1.jpg',
      '/assets/ships/rcl/star-of-the-seas-2.jpg'
    ],

    // Oasis Class
    'oasis-of-the-seas': [
      '/assets/ships/rcl/oasis-of-the-seas-1.jpg',
      '/assets/ships/rcl/oasis-of-the-seas-2.jpg',
      '/assets/ships/rcl/oasis-of-the-seas-aerial.jpg'
    ],
    'allure-of-the-seas': [
      '/ships/assets/images/allure-of-the-seas-3.jpg',
      '/ships/assets/images/allure2.jpg',
      '/ships/assets/images/allure3.jpg'
    ],
    'harmony-of-the-seas': [
      '/assets/ships/rcl/harmony-of-the-seas-1.jpg',
      '/assets/ships/rcl/harmony-of-the-seas-2.jpg',
      '/assets/ships/rcl/harmony-of-the-seas-aerial.jpg'
    ],
    'symphony-of-the-seas': [
      '/assets/ships/rcl/symphony-of-the-seas-1.jpg',
      '/assets/ships/rcl/symphony-of-the-seas-2.jpg',
      '/assets/ships/rcl/symphony-of-the-seas-aerial.jpg'
    ],
    'wonder-of-the-seas': [
      '/assets/ships/rcl/wonder-of-the-seas-1.jpg',
      '/assets/ships/rcl/wonder-of-the-seas-2.jpg',
      '/assets/ships/rcl/wonder-of-the-seas-aerial.jpg'
    ],
    'utopia-of-the-seas': [
      '/assets/ships/rcl/utopia-of-the-seas-1.jpg',
      '/assets/ships/rcl/utopia-of-the-seas-2.jpg',
      '/assets/ships/rcl/utopia-of-the-seas-aerial.jpg'
    ],

    // Quantum Ultra Class
    'spectrum-of-the-seas': [
      '/assets/ships/rcl/spectrum-of-the-seas-1.jpg',
      '/assets/ships/rcl/spectrum-of-the-seas-2.jpg',
      '/assets/ships/rcl/spectrum-of-the-seas-north-star.jpg'
    ],
    'odyssey-of-the-seas': [
      '/assets/ships/rcl/odyssey-of-the-seas-1.jpg',
      '/assets/ships/rcl/odyssey-of-the-seas-2.jpg',
      '/assets/ships/rcl/odyssey-of-the-seas-seaplex.jpg'
    ],

    // Quantum Class
    'quantum-of-the-seas': [
      '/assets/ships/rcl/quantum-of-the-seas-1.jpg',
      '/assets/ships/rcl/quantum-of-the-seas-2.jpg',
      '/assets/ships/rcl/quantum-of-the-seas-north-star.jpg'
    ],
    'anthem-of-the-seas': [
      '/assets/ships/rcl/anthem-of-the-seas-1.jpg',
      '/assets/ships/rcl/anthem-of-the-seas-2.jpg',
      '/assets/ships/rcl/anthem-of-the-seas-two70.jpg'
    ],
    'ovation-of-the-seas': [
      '/assets/ships/rcl/ovation-of-the-seas-1.jpg',
      '/assets/ships/rcl/ovation-of-the-seas-2.jpg',
      '/assets/ships/rcl/ovation-of-the-seas-alaska.jpg'
    ],

    // Freedom Class
    'freedom-of-the-seas': [
      '/assets/ships/rcl/freedom-of-the-seas-1.jpg',
      '/assets/ships/rcl/freedom-of-the-seas-2.jpg',
      '/assets/ships/rcl/freedom-of-the-seas-flowrider.jpg'
    ],
    'liberty-of-the-seas': [
      '/assets/ships/rcl/liberty-of-the-seas-1.jpg',
      '/assets/ships/rcl/liberty-of-the-seas-2.jpg',
      '/assets/ships/rcl/liberty-of-the-seas-pool.jpg'
    ],
    'independence-of-the-seas': [
      '/assets/ships/rcl/independence-of-the-seas-1.jpg',
      '/assets/ships/rcl/independence-of-the-seas-2.jpg',
      '/assets/ships/rcl/independence-of-the-seas-flowrider.jpg'
    ],

    // Voyager Class
    'voyager-of-the-seas': [
      '/assets/ships/rcl/voyager-of-the-seas-1.jpg',
      '/assets/ships/rcl/voyager-of-the-seas-2.jpg',
      '/assets/ships/rcl/voyager-of-the-seas-promenade.jpg'
    ],
    'explorer-of-the-seas': [
      '/assets/ships/rcl/explorer-of-the-seas-1.jpg',
      '/assets/ships/rcl/explorer-of-the-seas-2.jpg',
      '/assets/ships/rcl/explorer-of-the-seas-ice-rink.jpg'
    ],
    'adventure-of-the-seas': [
      '/ships/rcl/images/Adventure_of_the_Seas1.jpeg',
      '/ships/rcl/images/Adventure_of_the_Seas2.jpg',
      '/ships/rcl/images/Adventure_of_the_Seas3.jpg',
      '/ships/rcl/images/Adventure_of_the_Seas_docked_in_Aruba_2024.jpg',
      '/ships/rcl/images/Adventure_of_the_Seas_pool_area.jpg',
      '/ships/rcl/images/Adventure_of_the_seas_in_Willemstad.jpg'
    ],
    'navigator-of-the-seas': [
      '/assets/ships/rcl/navigator-of-the-seas-1.jpg',
      '/assets/ships/rcl/navigator-of-the-seas-2.jpg',
      '/assets/ships/rcl/navigator-of-the-seas-ice-rink.jpg'
    ],
    'mariner-of-the-seas': [
      '/assets/ships/rcl/mariner-of-the-seas-1.jpg',
      '/assets/ships/rcl/mariner-of-the-seas-2.jpg',
      '/assets/ships/rcl/mariner-of-the-seas-promenade.jpg'
    ],

    // Radiance Class
    'radiance-of-the-seas': [
      '/assets/ships/thumbs/radiance-of-the-seas.webp',
      '/assets/ships/thumbs/radiance-of-the-seas.jpg',
      '/ships/radianceots.jpg'
    ],
    'brilliance-of-the-seas': [
      '/assets/ships/thumbs/brilliance-of-the-seas.webp',
      '/assets/ships/thumbs/brilliance-of-the-seas.jpg'
    ],
    'serenade-of-the-seas': [
      '/assets/ships/thumbs/serenade-of-the-seas.webp',
      '/assets/ships/thumbs/serenade-of-the-seas.jpg'
    ],
    'jewel-of-the-seas': [
      '/assets/ships/thumbs/jewel-of-the-seas.webp',
      '/assets/ships/thumbs/jewel-of-the-seas.jpg'
    ],

    // Vision Class
    'grandeur-of-the-seas': [
      '/assets/ships/thumbs/grandeur-of-the-seas.webp',
      '/ships/assets/grandeur-of-the-seas1.jpg'
    ],
    'enchantment-of-the-seas': [
      '/assets/ships/thumbs/enchantment-of-the-seas.webp',
      '/assets/ships/thumbs/enchantment-of-the-seas.jpg',
      '/ships/assets/enchantment-of-the-seas1.jpg',
      '/ships/assets/images/Enchantment_of_the_Seas.jpeg',
      '/ships/assets/images/Enchantment_of_the_Seas,_San_Juan Medium.jpeg'
    ],
    'vision-of-the-seas': [
      '/assets/ships/thumbs/vision-of-the-seas.webp',
      '/assets/ships/thumbs/vision-of-the-seas.jpg',
      '/ships/assets/vision-of-the-Seas1.jpg',
      '/ships/assets/rcl/vision-of-the-Seas1.jpg'
    ],
    'rhapsody-of-the-seas': [
      '/assets/ships/thumbs/rhapsody-of-the-seas.webp',
      '/assets/ships/thumbs/rhapsody-of-the-seas.jpg',
      '/ships/assets/rhapsody-of-the-seas1.jpg',
      '/ships/assets/images/Rhapsody_of_the_Seas_(2)_(6451158929) Medium.jpeg',
      '/ships/assets/images/Rhapsody_of_the_Seas_(3731959629) Medium.jpeg',
      '/ships/assets/images/Rhapsody_of_the_Seas_2 Medium.jpeg'
    ],

    // Sovereign Class
    'sovereign-of-the-seas': [
      '/ships/assets/sovereign-of-the-seas1.jpg',
      '/ships/assets/sovereign-of-the-seas2.jpg',
      '/ships/assets/sovereign-of-the-seas3.jpg'
    ],
    'monarch-of-the-seas': [
      '/assets/ships/rcl/monarch-of-the-seas-1.jpg',
      '/assets/ships/rcl/monarch-of-the-seas-2.jpg'
    ],
    'majesty-of-the-seas': [
      '/assets/ships/majesty-of-the-seas1.webp',
      '/assets/ships/rcl/majesty-of-the-seas-1.jpg',
      '/assets/ships/rcl/majesty-of-the-seas-2.jpg'
    ]
  };

  // Ship CTA/pitch text - WHY choose this ship and WHO it's for
  const SHIP_CTAS = {
    // Icon Class
    'icon-of-the-seas': 'The biggest, newest ship with every innovation. Perfect for first-timers who want to experience everything Royal Caribbean offers in one sailing.',
    'star-of-the-seas': 'Icon-class with all the latest features. Ideal for families and thrill-seekers who want cutting-edge amenities and maximum variety.',

    // Oasis Class
    'oasis-of-the-seas': 'The original neighborhood ship that started a revolution. Great value for Oasis-class experience at a lower price point.',
    'allure-of-the-seas': 'Freshly refurbished with new venues. Excellent choice for families wanting the classic Oasis experience with modern updates.',
    'harmony-of-the-seas': 'First Oasis ship with waterslides and virtual balconies. Perfect for families with kids who love water thrills.',
    'symphony-of-the-seas': 'Refined Oasis-class with Ultimate Abyss slide. Great for groups wanting diverse dining and entertainment options.',
    'wonder-of-the-seas': 'The most refined Oasis ship before Icon. Ideal for those wanting newer amenities without the highest price tag.',
    'utopia-of-the-seas': 'Short Caribbean sailings from Florida. Perfect for quick getaways and first-time cruisers testing the waters.',

    // Quantum Ultra Class
    'spectrum-of-the-seas': 'Designed for Asian markets with unique venues. Great for foodies seeking diverse Asian cuisine options.',
    'odyssey-of-the-seas': 'Quantum innovation with Caribbean itineraries. Perfect for tech enthusiasts who want North Star and SeaPlex.',

    // Quantum Class
    'quantum-of-the-seas': 'The original smart ship with groundbreaking tech. Great for cruisers who prioritize innovation over traditional amenities.',
    'anthem-of-the-seas': 'Year-round from New Jersey. Ideal for East Coast cruisers who want to avoid flying to a homeport.',
    'ovation-of-the-seas': 'The Alaska specialist with incredible viewing. Perfect for those prioritizing scenery and destination immersion.',

    // Freedom Class
    'freedom-of-the-seas': 'Classic Royal Caribbean with FlowRider and H2O Zone. Great value for families with a mix of kids ages.',
    'liberty-of-the-seas': 'Popular Galveston homeport. Perfect for Texas cruisers wanting short Caribbean getaways.',
    'independence-of-the-seas': 'UK sailings and European itineraries. Ideal for European cruisers or those wanting to explore the continent.',

    // Voyager Class
    'voyager-of-the-seas': 'The ship that introduced the Royal Promenade. Great for nostalgia and excellent value.',
    'explorer-of-the-seas': 'Ice rink and rock climbing pioneer. Good for families wanting classic amenities at budget-friendly prices.',
    'adventure-of-the-seas': 'Shorter Caribbean sailings. Perfect for quick getaways or testing if cruising is for you.',
    'navigator-of-the-seas': 'LA homeport with Mexican Riviera. Ideal for West Coast cruisers wanting easy embarkation.',
    'mariner-of-the-seas': 'Short Bahamas sailings from Florida. Great for weekend cruises and Perfect Day at CocoCay access.',

    // Radiance Class
    'radiance-of-the-seas': 'Floor-to-ceiling windows throughout. Check out this ship if million-dollar views through glass walls matter to you.',
    'brilliance-of-the-seas': 'Intimate ship with elegant design. Perfect for couples and adults who prefer a quieter, refined experience.',
    'serenade-of-the-seas': 'Alaska and Panama Canal specialist. Ideal for destination-focused cruisers who want scenery over crowds.',
    'jewel-of-the-seas': 'European and exotic itineraries. Great for experienced cruisers seeking unique ports and longer voyages.',

    // Vision Class
    'grandeur-of-the-seas': 'Classic and intimate experience. Perfect for cruisers who prefer smaller ships and easier navigation.',
    'enchantment-of-the-seas': 'Budget-friendly with solid amenities. Great for value-seekers and those prioritizing itinerary over ship.',
    'vision-of-the-seas': 'The smallest active Royal ship. Ideal for those who want fewer crowds and a more traditional cruise feel.',
    'rhapsody-of-the-seas': 'Affordable exotic itineraries. Perfect for budget-conscious travelers wanting unique destinations.',

    // Sovereign Class (retired/sold but may have images)
    'sovereign-of-the-seas': 'Historic first megaship. For cruise history enthusiasts.',
    'monarch-of-the-seas': 'Classic 1990s cruise experience. For nostalgia.',
    'majesty-of-the-seas': 'Budget Bahamas sailings. Great value for quick getaways.'
  };

  // Royal Caribbean fleet data organized by class
  const RC_FLEET = {
    'Icon Class': {
      order: 1,
      ships: [
        { name: 'Icon of the Seas', slug: 'icon-of-the-seas', year: 2024 },
        { name: 'Star of the Seas', slug: 'star-of-the-seas', year: 2025 }
      ]
    },
    'Oasis Class': {
      order: 2,
      ships: [
        { name: 'Oasis of the Seas', slug: 'oasis-of-the-seas', year: 2009 },
        { name: 'Allure of the Seas', slug: 'allure-of-the-seas', year: 2010 },
        { name: 'Harmony of the Seas', slug: 'harmony-of-the-seas', year: 2016 },
        { name: 'Symphony of the Seas', slug: 'symphony-of-the-seas', year: 2018 },
        { name: 'Wonder of the Seas', slug: 'wonder-of-the-seas', year: 2022 },
        { name: 'Utopia of the Seas', slug: 'utopia-of-the-seas', year: 2024 }
      ]
    },
    'Quantum Ultra Class': {
      order: 3,
      ships: [
        { name: 'Spectrum of the Seas', slug: 'spectrum-of-the-seas', year: 2019 },
        { name: 'Odyssey of the Seas', slug: 'odyssey-of-the-seas', year: 2021 }
      ]
    },
    'Quantum Class': {
      order: 4,
      ships: [
        { name: 'Quantum of the Seas', slug: 'quantum-of-the-seas', year: 2014 },
        { name: 'Anthem of the Seas', slug: 'anthem-of-the-seas', year: 2015 },
        { name: 'Ovation of the Seas', slug: 'ovation-of-the-seas', year: 2016 }
      ]
    },
    'Freedom Class': {
      order: 5,
      ships: [
        { name: 'Freedom of the Seas', slug: 'freedom-of-the-seas', year: 2006 },
        { name: 'Liberty of the Seas', slug: 'liberty-of-the-seas', year: 2007 },
        { name: 'Independence of the Seas', slug: 'independence-of-the-seas', year: 2008 }
      ]
    },
    'Voyager Class': {
      order: 6,
      ships: [
        { name: 'Voyager of the Seas', slug: 'voyager-of-the-seas', year: 1999 },
        { name: 'Explorer of the Seas', slug: 'explorer-of-the-seas', year: 2000 },
        { name: 'Adventure of the Seas', slug: 'adventure-of-the-seas', year: 2001 },
        { name: 'Navigator of the Seas', slug: 'navigator-of-the-seas', year: 2002 },
        { name: 'Mariner of the Seas', slug: 'mariner-of-the-seas', year: 2003 }
      ]
    },
    'Radiance Class': {
      order: 7,
      ships: [
        { name: 'Radiance of the Seas', slug: 'radiance-of-the-seas', year: 2001 },
        { name: 'Brilliance of the Seas', slug: 'brilliance-of-the-seas', year: 2002 },
        { name: 'Serenade of the Seas', slug: 'serenade-of-the-seas', year: 2003 },
        { name: 'Jewel of the Seas', slug: 'jewel-of-the-seas', year: 2004 }
      ]
    },
    'Vision Class': {
      order: 8,
      ships: [
        { name: 'Grandeur of the Seas', slug: 'grandeur-of-the-seas', year: 1996 },
        { name: 'Enchantment of the Seas', slug: 'enchantment-of-the-seas', year: 1997 },
        { name: 'Vision of the Seas', slug: 'vision-of-the-seas', year: 1998 },
        { name: 'Rhapsody of the Seas', slug: 'rhapsody-of-the-seas', year: 1997 }
      ]
    },
    'Sovereign Class': {
      order: 9,
      ships: [
        { name: 'Sovereign of the Seas', slug: 'sovereign-of-the-seas', year: 1988 },
        { name: 'Monarch of the Seas', slug: 'monarch-of-the-seas', year: 1991 },
        { name: 'Majesty of the Seas', slug: 'majesty-of-the-seas', year: 1992 }
      ]
    }
  };

  /**
   * Get a random image for a ship (different each page load)
   */
  function getRandomShipImage(slug) {
    const images = SHIP_IMAGES[slug];
    if (!images || images.length === 0) return null;

    // Use a seed based on today's date and ship slug for pseudo-random selection
    const today = new Date().toDateString();
    const seed = (today + slug).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const index = Math.abs(seed) % images.length;
    return images[index];
  }

  /**
   * Check if ship has images
   */
  function hasImages(slug) {
    return SHIP_IMAGES[slug] && SHIP_IMAGES[slug].length > 0;
  }

  /**
   * Create ship card HTML
   */
  function createShipCard(ship) {
    const imageUrl = getRandomShipImage(ship.slug);
    const pageUrl = `/ships/rcl/${ship.slug}.html`;
    const placeholderUrl = '/assets/ship-placeholder.jpg';
    const cta = SHIP_CTAS[ship.slug] || 'Explore this ship to discover what makes it special for your cruise.';

    return `
      <article class="ship-card item-card" data-ship-slug="${ship.slug}">
        <a href="${pageUrl}" class="ship-card-link item-card-link">
          <div class="ship-card-image item-card-image">
            <img src="${imageUrl || placeholderUrl}"
                 alt="${ship.name}"
                 loading="lazy"
                 decoding="async"
                 onerror="this.onerror=null;this.src='${placeholderUrl}'" />
            ${imageUrl && SHIP_IMAGES[ship.slug] && SHIP_IMAGES[ship.slug].length > 1 ?
              `<span class="image-count-badge item-card-badge" aria-label="${SHIP_IMAGES[ship.slug].length} images available">${SHIP_IMAGES[ship.slug].length}</span>`
              : ''}
          </div>
          <div class="ship-card-content item-card-content">
            <h3 class="ship-card-title item-card-title">${ship.name}</h3>
            <p class="ship-card-year item-card-meta">Launched ${ship.year}</p>
            <p class="item-card-cta">${cta}</p>
          </div>
        </a>
      </article>
    `;
  }

  /**
   * Create ship class section HTML
   */
  function createShipClassSection(className, classData) {
    // Show all ships (with or without images)
    const ships = classData.ships;

    if (ships.length === 0) {
      return ''; // Don't show empty classes
    }

    const shipsHtml = ships.map(ship => createShipCard(ship)).join('');
    const shipCount = ships.length;

    return `
      <section class="ship-class-section" data-class="${className}">
        <button class="ship-class-toggle"
                type="button"
                aria-expanded="true"
                aria-controls="ships-${className.replace(/\s+/g, '-').toLowerCase()}">
          <h2 class="ship-class-title">
            ${className}
            <span class="ship-count">${shipCount} ship${shipCount !== 1 ? 's' : ''}</span>
          </h2>
          <span class="toggle-icon" aria-hidden="true">▼</span>
        </button>
        <div class="ship-class-content"
             id="ships-${className.replace(/\s+/g, '-').toLowerCase()}"
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
    // Sort classes by order
    const sortedClasses = Object.entries(RC_FLEET)
      .sort((a, b) => (a[1].order || 999) - (b[1].order || 999));

    const classesHtml = sortedClasses
      .map(([className, classData]) => createShipClassSection(className, classData))
      .filter(html => html) // Remove empty sections
      .join('');

    return `
      <section class="cruise-line-section" data-line="royal-caribbean">
        <div class="cruise-line-header">
          <h2 class="cruise-line-title">Royal Caribbean International</h2>
          <button class="view-all-btn" type="button" id="toggleAllClasses">
            Expand All Classes
          </button>
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

    let allExpanded = true;

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
   * Add share functionality
   */
  function initializeShare() {
    const shareBtn = document.getElementById('shareShipsPage');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'Royal Caribbean Ships — In the Wake',
        text: 'Explore the Royal Caribbean fleet with deck plans, live tracking, and detailed ship information.',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== 'AbortError') {
            fallbackShare();
          }
        }
      } else {
        fallbackShare();
      }
    });

    function fallbackShare() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = shareBtn.textContent;
        shareBtn.textContent = 'Link Copied!';
        setTimeout(() => {
          shareBtn.textContent = originalText;
        }, 2000);
      });
    }
  }

  /**
   * Initialize the ships page
   */
  function init() {
    const container = document.getElementById('shipsContainer');
    if (!container) return;

    // Render the cruise line section
    container.innerHTML = createCruiseLineSection();

    // Initialize interactivity
    initializeCollapsibles();
    initializeExpandAll();
    initializeShare();

    // Set initial state for all content sections
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
