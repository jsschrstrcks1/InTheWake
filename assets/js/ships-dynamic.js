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
      '/assets/ships/Icon_of_the_Seas_(cropped).webp',
      '/assets/ships/Icon_of_the_Seas_(kahunapulej).webp',
      '/assets/ships/Icon_of_the_Seas_stern_in_Philipsburg,_Sint_Maarten.webp'
    ],
    'star-of-the-seas': [
      '/assets/ships/Cádiz_-_Crucero_Star_of_the_Seas,_atracado_en_el_puerto_de_Cádiz_(25_julio_2025)_01.webp'
    ],

    // Oasis Class
    'oasis-of-the-seas': [
      '/assets/ships/Oasis-of-the-seas-FOM- - 1.webp',
      '/assets/ships/Oasis-of-the-seas-FOM- - 2.webp',
      '/assets/ships/Oasis-of-the-seas-FOM- - 3.webp'
    ],
    'allure-of-the-seas': [
      '/assets/ships/Allure_of_the_Seas_(ship,_2009)_001.webp',
      '/assets/ships/Allure_of_the_Seas_(ship,_2009)_001_(cropped).webp',
      '/assets/ships/Allure_of_the_Seas_(31597720550).webp'
    ],
    'harmony-of-the-seas': [
      '/assets/ships/Harmony-of-the-seas-FOM- - 1.webp',
      '/assets/ships/Harmony-of-the-seas-FOM- - 2.webp'
    ],
    'symphony-of-the-seas': [
      '/assets/ships/SymphonyOfTheSeas_(cropped)_02-2.webp',
      '/assets/ships/SymphonyOfTheSeas_(cropped)_02.webp',
      '/assets/ships/Mein_Schiff_2_&_Symphony_of_the_Seas.webp'
    ],
    'wonder-of-the-seas': [
      '/assets/ships/Wonder_of_the_Seas_-_August_2021.webp',
      '/assets/ships/Wonder_of_the_Seas_Jan_30_2025.webp',
      '/assets/ships/Wonder_of_the_Seas_atracando_en_Cartagena-España-.webp'
    ],
    'utopia-of-the-seas': [
      '/assets/ships/Utopia-of-the-seas-FOM- - 1.webp',
      '/assets/ships/Utopia-of-the-seas-FOM- - 2.webp'
    ],

    // Quantum Ultra Class
    'spectrum-of-the-seas': [
      '/assets/ships/Spectrum_of_the_Seas_01.webp',
      '/assets/ships/Royal_Caribbean_Spectrum_of_the_Seas_19-08-2023(2).webp',
      '/assets/ships/Royal_Caribbean_Spectrum_of_the_Seas_19-08-2023(4).webp'
    ],
    'odyssey-of-the-seas': [
      '/assets/ships/Odyssey_of_the_Seas.webp',
      '/assets/ships/Odyssey_of_the_Seas_(53429955475).webp',
      '/assets/ships/Odyssey_of_the_Seas_Abends.webp'
    ],

    // Quantum Class
    'quantum-of-the-seas': [
      '/assets/ships/Quantum_of_the_Seas_-_Wedel_04.webp',
      '/assets/ships/"Quantum_of_the_Seas".webp',
      '/assets/ships/0016_Quantum_of_the_Seas.webp'
    ],
    'anthem-of-the-seas': [
      '/assets/ships/ANTHEM_OF_THE_SEAS_0310.webp',
      '/assets/ships/Anthem_of_the_Seas,_docked_at_Nassau_Cruise_Port,_Bahamas_(March_14,_2024)_16-9.webp',
      '/assets/ships/Anthem_of_the_Seas_(ship,_2015)_001.webp'
    ],
    'ovation-of-the-seas': [
      '/assets/ships/ovation-of-the-seas-FOM-1.webp',
      '/assets/ships/ovation-of-the-seas-FOM-10.webp',
      '/assets/ships/ovation-of-the-seas-FOM-11.webp'
    ],

    // Freedom Class
    'freedom-of-the-seas': [
      '/assets/ships/freedom-of-the-seas-FOM- - 1.webp',
      '/assets/ships/freedom-of-the-seas-FOM- - 2.webp',
      '/assets/ships/freedom-of-the-seas-FOM- - 3.webp'
    ],
    'liberty-of-the-seas': [
      '/assets/ships/Liberty-of-the-seas-FOM- - 1.webp',
      '/assets/ships/Liberty-of-the-seas-FOM- - 2.webp',
      '/assets/ships/Liberty-of-the-seas-FOM- - 3.webp'
    ],
    'independence-of-the-seas': [
      '/assets/ships/Cruise_ship_Independence_of_the_Seas_R01.webp',
      '/assets/ships/1993-Independence_of_the_seas_na_Coruña.webp'
    ],

    // Voyager Class
    'voyager-of-the-seas': [
      '/assets/ships/"Voyager_of_the_Seas"_(8194516843).webp',
      '/assets/ships/Voyageroftheseas.webp'
    ],
    'mariner-of-the-seas': [
      '/assets/ships/mariner-of-the-seas-FOM- - 1.webp',
      '/assets/ships/mariner-of-the-seas-FOM- - 2.webp',
      '/assets/ships/mariner-of-the-seas-FOM- - 3.webp'
    ],
    'navigator-of-the-seas': [
      '/assets/ships/Navigator_of_the_Seas_(Grand_Cayman)_001.webp',
      '/assets/ships/Navigator_of_the_Seas_(ship,_2002)_in_Ensenada,_Mexico_(August_2024)_1.webp',
      '/assets/ships/Navigator_of_the_Seas,_Puerto_de_la_Bahía_de_Cádiz.webp'
    ],
    'adventure-of-the-seas': [
      '/assets/ships/Adventure_of_the_Seas_5.webp',
      '/assets/ships/Adventure_of_the_Seas_7.webp',
      '/assets/ships/Adventure_of_the_Seas_(ship,_2001)_comes_back_to_Grand_Cayman_(April_2025).webp'
    ],
    'explorer-of-the-seas': [
      '/assets/ships/Explorer_of_the_Seas,_Fremantle,_2015_(03).webp'
    ],

    // Radiance Class
    'radiance-of-the-seas': [
      '/assets/ships/Radiance-of-the-seas-FOM- - 1.webp',
      '/assets/ships/Radiance-of-the-seas-FOM- - 2.webp',
      '/assets/ships/Radiance-of-the-seas-FOM- - 3.webp'
    ],
    'brilliance-of-the-seas': [
      '/assets/ships/brilliance-of-the-seas1.webp',
      '/assets/ships/brilliance-of-the-seas2.webp',
      '/assets/ships/Brilliance_of_the_Seas_Boston_2014_02_(cropped).webp'
    ],
    'serenade-of-the-seas': [
      '/assets/ships/serenade-of-the-seas-FOM- - 1.webp',
      '/assets/ships/serenade-of-the-seas-FOM- - 2.webp',
      '/assets/ships/serenade-of-the-seas-FOM- - 3.webp'
    ],
    'jewel-of-the-seas': [
      '/assets/ships/Jewel-of-the-seas-FOM- - 1 (1).webp',
      '/assets/ships/Jewel-of-the-seas-FOM- - 1.webp',
      '/assets/ships/jewel-of-the-seas1.webp'
    ],

    // Vision Class
    'grandeur-of-the-seas': [
      '/assets/ships/Grandeur-of-the-seas-FOM- - 1.webp',
      '/assets/ships/Grandeur-of-the-seas-FOM- - 2.webp',
      '/assets/ships/Grandeur-of-the-seas-FOM- - 3.webp'
    ],
    'enchantment-of-the-seas': [
      '/assets/ships/enchantment-halifax-2011.webp',
      '/assets/ships/enchantment-labadee-2013.webp',
      '/assets/ships/enchantment-tampa-2025.webp'
    ],
    'rhapsody-of-the-seas': [
      '/assets/ships/2560px-Kobe_Rhapsody_of_the_Seas01n4592.webp',
      '/assets/ships/2560px-Kobe_Rhapsody_of_the_Seas03n4592.webp',
      '/assets/ships/rhapsody-of-the-seas1.webp'
    ],
    'vision-of-the-seas': [
      '/assets/ships/vision-of-the-seas1.webp',
      '/assets/ships/vision-of-the-seas2.webp'
    ],

    // Sovereign Class
    'majesty-of-the-seas': [
      '/assets/ships/MSMajestyOfTheSeasEdit1.webp',
      '/assets/ships/Majesty_of_the_Seas_(ship,_1992)_002.webp',
      '/assets/ships/majesty-of-the-seas1.webp'
    ],
    'sovereign-of-the-seas': [
      '/assets/ships/Sovereign_of_the_Seas_Nassau_Bahamas_(244161813)_(cropped)_(cropped).webp',
      '/assets/ships/MS_Sovereign_of_the_Seas.webp',
      '/assets/ships/Sovereign_of_the_Seas_Nassau_Bahamas_(244161813).webp'
    ],
    'monarch-of-the-seas': [
      '/assets/ships/2560px-Monarch_of_the_seas_(2707258203).webp',
      '/assets/ships/Monarch_of_the_Seas.webp'
    ],

    // Legend Class
    'splendour-of-the-seas': [
      '/assets/ships/Fotos_del_crucero_"Splendour_of_the_Seas"_de_Royal_Caribbean_en_el_muelle_de_Santa_Catalina_del_Puerto_de_Las_Palmas_de_Gran_Canaria_Islas_Canarias_(6424810807).webp',
      '/assets/ships/Fotos_del_crucero_"Splendour_of_the_Seas"_de_Royal_Caribbean_en_el_muelle_de_Santa_Catalina_del_Puerto_de_Las_Palmas_de_Gran_Canaria_Islas_Canarias_(6424818065).webp',
      '/assets/ships/Splendour_of_the_Seas_(at_Split_on_2011-0716).webp'
    ],

    // Historic Ships
    'song-of-norway': [
      '/assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped)-2.webp',
      '/assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped).webp',
      '/assets/ships/2560px-Song_of_Norway_Vigo.webp'
    ],
    'song-of-america': [
      '/assets/ships/Song_of_America,_1983.webp',
      '/assets/ships/Song_of_America_1982.webp'
    ],
    'sun-viking': [
      '/assets/ships/1996_Sun_Viking_RCL_CRPgf527.webp',
      '/assets/ships/Sun_Viking_in_Vancouver,_Canada_1990.webp',
      '/assets/ships/Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp'
    ],
    'nordic-empress': [
      '/assets/ships/NordicEmpress1.webp',
      '/assets/ships/NordicEmpress1_(cropped)_(cropped).webp',
      '/assets/ships/MS_Nordic_Empress_in_Miami_(bigger).webp'
    ],

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
        { name: 'Icon of the Seas', slug: 'icon-of-the-seas', year: 2024, gt: '250,800', capacity: 7600 },
        { name: 'Star of the Seas', slug: 'star-of-the-seas', year: 2025, gt: '250,800', capacity: 7600 }
      ]
    },
    'Oasis Class': {
      order: 2,
      ships: [
        { name: 'Oasis of the Seas', slug: 'oasis-of-the-seas', year: 2009, gt: '225,282', capacity: 6771 },
        { name: 'Allure of the Seas', slug: 'allure-of-the-seas', year: 2010, gt: '225,282', capacity: 6780 },
        { name: 'Harmony of the Seas', slug: 'harmony-of-the-seas', year: 2016, gt: '226,963', capacity: 6687 },
        { name: 'Symphony of the Seas', slug: 'symphony-of-the-seas', year: 2018, gt: '228,081', capacity: 6680 },
        { name: 'Wonder of the Seas', slug: 'wonder-of-the-seas', year: 2022, gt: '236,857', capacity: 6988 },
        { name: 'Utopia of the Seas', slug: 'utopia-of-the-seas', year: 2024, gt: '236,857', capacity: 5668 }
      ]
    },
    'Quantum Ultra Class': {
      order: 3,
      ships: [
        { name: 'Spectrum of the Seas', slug: 'spectrum-of-the-seas', year: 2019, gt: '169,379', capacity: 5622 },
        { name: 'Odyssey of the Seas', slug: 'odyssey-of-the-seas', year: 2021, gt: '169,379', capacity: 5510 }
      ]
    },
    'Quantum Class': {
      order: 4,
      ships: [
        { name: 'Quantum of the Seas', slug: 'quantum-of-the-seas', year: 2014, gt: '168,666', capacity: 4905 },
        { name: 'Anthem of the Seas', slug: 'anthem-of-the-seas', year: 2015, gt: '168,666', capacity: 4905 },
        { name: 'Ovation of the Seas', slug: 'ovation-of-the-seas', year: 2016, gt: '168,666', capacity: 4905 }
      ]
    },
    'Freedom Class': {
      order: 5,
      ships: [
        { name: 'Freedom of the Seas', slug: 'freedom-of-the-seas', year: 2006, gt: '156,271', capacity: 4515 },
        { name: 'Liberty of the Seas', slug: 'liberty-of-the-seas', year: 2007, gt: '156,271', capacity: 4960 },
        { name: 'Independence of the Seas', slug: 'independence-of-the-seas', year: 2008, gt: '156,271', capacity: 4370 }
      ]
    },
    'Voyager Class': {
      order: 6,
      ships: [
        { name: 'Voyager of the Seas', slug: 'voyager-of-the-seas', year: 1999, gt: '137,276', capacity: 3807 },
        { name: 'Explorer of the Seas', slug: 'explorer-of-the-seas', year: 2000, gt: '137,308', capacity: 3840 },
        { name: 'Adventure of the Seas', slug: 'adventure-of-the-seas', year: 2001, gt: '137,276', capacity: 3807 },
        { name: 'Navigator of the Seas', slug: 'navigator-of-the-seas', year: 2002, gt: '139,999', capacity: 3807 },
        { name: 'Mariner of the Seas', slug: 'mariner-of-the-seas', year: 2003, gt: '139,863', capacity: 3807 }
      ]
    },
    'Radiance Class': {
      order: 7,
      ships: [
        { name: 'Radiance of the Seas', slug: 'radiance-of-the-seas', year: 2001, gt: '90,090', capacity: 2501 },
        { name: 'Brilliance of the Seas', slug: 'brilliance-of-the-seas', year: 2002, gt: '90,090', capacity: 2543 },
        { name: 'Serenade of the Seas', slug: 'serenade-of-the-seas', year: 2003, gt: '90,090', capacity: 2476 },
        { name: 'Jewel of the Seas', slug: 'jewel-of-the-seas', year: 2004, gt: '90,090', capacity: 2501 }
      ]
    },
    'Vision Class': {
      order: 8,
      ships: [
        { name: 'Grandeur of the Seas', slug: 'grandeur-of-the-seas', year: 1996, gt: '74,137', capacity: 2440 },
        { name: 'Enchantment of the Seas', slug: 'enchantment-of-the-seas', year: 1997, gt: '82,910', capacity: 2252 },
        { name: 'Vision of the Seas', slug: 'vision-of-the-seas', year: 1998, gt: '78,491', capacity: 2435 },
        { name: 'Rhapsody of the Seas', slug: 'rhapsody-of-the-seas', year: 1997, gt: '78,491', capacity: 2435 }
      ]
    },
    'Sovereign Class': {
      order: 9,
      ships: [
        { name: 'Sovereign of the Seas', slug: 'sovereign-of-the-seas', year: 1988, gt: '73,192', capacity: 2852, retired: true },
        { name: 'Monarch of the Seas', slug: 'monarch-of-the-seas', year: 1991, gt: '73,937', capacity: 2764, retired: true },
        { name: 'Majesty of the Seas', slug: 'majesty-of-the-seas', year: 1992, gt: '74,077', capacity: 2767, retired: true }
      ]
    },
    'Historic Fleet': {
      order: 10,
      ships: [
        { name: 'Splendour of the Seas', slug: 'splendour-of-the-seas', year: 1996, gt: '69,130', capacity: 2076, retired: true },
        { name: 'Song of Norway', slug: 'song-of-norway', year: 1970, gt: '23,005', capacity: 1040, retired: true },
        { name: 'Song of America', slug: 'song-of-america', year: 1982, gt: '37,584', capacity: 1575, retired: true },
        { name: 'Sun Viking', slug: 'sun-viking', year: 1972, gt: '18,559', capacity: 726, retired: true },
        { name: 'Nordic Empress', slug: 'nordic-empress', year: 1990, gt: '48,563', capacity: 1606, retired: true }
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

    // Format capacity with commas
    const formattedCapacity = ship.capacity ? ship.capacity.toLocaleString() : '';

    return `
      <article class="ship-card item-card${ship.retired ? ' retired' : ''}" data-ship-slug="${ship.slug}">
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
            ${ship.retired ? `<span class="retired-badge item-card-badge" aria-label="Retired from fleet">Retired</span>` : ''}
          </div>
          <div class="ship-card-content item-card-content">
            <h3 class="ship-card-title item-card-title">${ship.name}</h3>
            <div class="ship-card-stats item-card-meta">
              <span class="badge">${ship.year}</span>
              ${ship.gt ? `<span class="badge">${ship.gt} GT</span>` : ''}
              ${formattedCapacity ? `<span class="badge">${formattedCapacity} guests</span>` : ''}
            </div>
            <p class="item-card-cta">${cta}</p>
            <span class="ship-card-cta-btn">${ship.retired ? 'View History' : 'Explore Ship'}</span>
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

    // Default to collapsed for all classes EXCEPT Icon Class
    const isIconClass = className === 'Icon Class';
    const expandedState = isIconClass ? 'true' : 'false';
    const collapsedClass = isIconClass ? '' : ' collapsed';

    return `
      <section class="ship-class-section${collapsedClass}" data-class="${className}">
        <button class="ship-class-toggle"
                type="button"
                aria-expanded="${expandedState}"
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

    // Start with allExpanded = false since only Icon Class is initially expanded
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
   * Fuzzy matching using Levenshtein distance
   */
  function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[m][n];
  }

  /**
   * Check if query fuzzy-matches target
   */
  function fuzzyMatch(query, target, threshold = 0.3) {
    if (!query || !target) return false;

    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();

    // Exact substring match
    if (t.includes(q)) return true;

    // Word-by-word matching
    const targetWords = t.split(/[\s\-]+/);
    for (const word of targetWords) {
      if (word.startsWith(q)) return true;
      if (word.includes(q)) return true;
    }

    // Fuzzy match using Levenshtein for short queries
    if (q.length >= 3) {
      for (const word of targetWords) {
        const distance = levenshteinDistance(q, word.substring(0, q.length + 2));
        const maxLen = Math.max(q.length, word.length);
        if (distance / maxLen <= threshold) return true;
      }

      // Also check against full target
      const distance = levenshteinDistance(q, t.substring(0, q.length + 3));
      if (distance <= Math.ceil(q.length * threshold)) return true;
    }

    return false;
  }

  /**
   * Get all searchable text for a ship
   */
  function getShipSearchText(ship, className) {
    const parts = [
      ship.name,
      ship.slug.replace(/-/g, ' '),
      className,
      String(ship.year),
      ship.gt || '',
      SHIP_CTAS[ship.slug] || ''
    ];
    return parts.join(' ').toLowerCase();
  }

  /**
   * Initialize search functionality
   */
  function initializeSearch() {
    const searchInput = document.getElementById('shipSearch');
    const clearBtn = document.getElementById('clearSearch');
    const resultsInfo = document.getElementById('searchResults');

    if (!searchInput) return;

    let debounceTimer;

    function performSearch(query) {
      const trimmedQuery = query.trim();
      const shipCards = document.querySelectorAll('.ship-card');
      const classSections = document.querySelectorAll('.ship-class-section');

      // Clear button visibility
      if (clearBtn) {
        clearBtn.style.display = trimmedQuery ? 'block' : 'none';
      }

      // If no query, show everything
      if (!trimmedQuery) {
        shipCards.forEach(card => card.classList.remove('search-hidden'));
        classSections.forEach(section => {
          section.classList.remove('search-empty');
          // Expand all sections when clearing search
          const toggle = section.querySelector('.ship-class-toggle');
          const content = section.querySelector('.ship-class-content');
          if (toggle && content) {
            toggle.setAttribute('aria-expanded', 'true');
            section.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        });
        if (resultsInfo) resultsInfo.textContent = '';
        return;
      }

      let matchCount = 0;
      const matchedClasses = new Set();

      // Check each ship
      shipCards.forEach(card => {
        const slug = card.getAttribute('data-ship-slug');
        const section = card.closest('.ship-class-section');
        const className = section ? section.getAttribute('data-class') : '';

        // Find ship data
        let ship = null;
        for (const [cls, data] of Object.entries(RC_FLEET)) {
          const found = data.ships.find(s => s.slug === slug);
          if (found) {
            ship = found;
            break;
          }
        }

        if (!ship) {
          card.classList.add('search-hidden');
          return;
        }

        const searchText = getShipSearchText(ship, className);
        const isMatch = fuzzyMatch(trimmedQuery, searchText);

        if (isMatch) {
          card.classList.remove('search-hidden');
          matchCount++;
          if (className) matchedClasses.add(className);
        } else {
          card.classList.add('search-hidden');
        }
      });

      // Hide/show class sections based on visible ships
      classSections.forEach(section => {
        const className = section.getAttribute('data-class');
        const visibleShips = section.querySelectorAll('.ship-card:not(.search-hidden)');

        if (visibleShips.length === 0) {
          section.classList.add('search-empty');
        } else {
          section.classList.remove('search-empty');
          // Expand sections with matches
          const toggle = section.querySelector('.ship-class-toggle');
          const content = section.querySelector('.ship-class-content');
          if (toggle && content) {
            toggle.setAttribute('aria-expanded', 'true');
            section.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        }
      });

      // Update results info
      if (resultsInfo) {
        if (matchCount === 0) {
          resultsInfo.innerHTML = `<strong>No ships found for "${trimmedQuery.replace(/</g, '&lt;')}"</strong> — try a different spelling or search for a class name`;
        } else {
          const classText = matchedClasses.size === 1
            ? `in ${Array.from(matchedClasses)[0]}`
            : matchedClasses.size > 1
              ? `across ${matchedClasses.size} classes`
              : '';
          resultsInfo.textContent = `Found ${matchCount} ship${matchCount !== 1 ? 's' : ''} ${classText}`;
        }
      }
    }

    // Debounced search on input
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(e.target.value);
      }, 150);
    });

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
      });
    }

    // Handle Enter key (prevent form submission if in form)
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        searchInput.value = '';
        performSearch('');
      }
    });
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
    initializeSearch();

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
