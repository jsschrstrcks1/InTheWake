/**
 * Ships Dynamic Module v2.000.000
 * Soli Deo Gloria
 *
 * Features:
 * - Multi-cruise-line support with selector buttons
 * - Hierarchical cruise line → ship class → ship display
 * - Intelligent image matching and cycling
 * - Collapsible sections with smooth transitions
 * - Share functionality
 * - "Coming Soon" indicator for ships without pages
 * - Royal Caribbean pre-selected by default
 */

(function() {
  'use strict';

  // ===== CRUISE LINE CONFIGURATION =====
  const CRUISE_LINES = {
    'rcl': {
      name: 'Royal Caribbean',
      shortName: 'RCL',
      directory: 'rcl',
      heroImage: '/assets/social/royal-caribbean-hero.jpg',
      color: '#003366'
    },
    'carnival': {
      name: 'Carnival Cruise Line',
      shortName: 'Carnival',
      directory: 'carnival',
      heroImage: '/assets/social/carnival-hero.jpg',
      color: '#1f4e79'
    },
    'celebrity': {
      name: 'Celebrity Cruises',
      shortName: 'Celebrity',
      directory: 'celebrity-cruises',
      heroImage: '/assets/social/celebrity-hero.jpg',
      color: '#1a1a2e'
    },
    'norwegian': {
      name: 'Norwegian Cruise Line',
      shortName: 'NCL',
      directory: 'norwegian',
      heroImage: '/assets/social/ncl-hero.jpg',
      color: '#003b5c'
    },
    'princess': {
      name: 'Princess Cruises',
      shortName: 'Princess',
      directory: 'princess',
      heroImage: '/assets/social/princess-hero.jpg',
      color: '#004987'
    },
    'holland': {
      name: 'Holland America Line',
      shortName: 'HAL',
      directory: 'holland-america-line',
      heroImage: '/assets/social/hal-hero.jpg',
      color: '#002244'
    },
    'msc': {
      name: 'MSC Cruises',
      shortName: 'MSC',
      directory: 'msc',
      heroImage: '/assets/social/msc-hero.jpg',
      color: '#003366'
    },
    'costa': {
      name: 'Costa Cruises',
      shortName: 'Costa',
      directory: 'costa',
      heroImage: '/assets/social/costa-hero.jpg',
      color: '#f9d423'
    },
    'cunard': {
      name: 'Cunard Line',
      shortName: 'Cunard',
      directory: 'cunard',
      heroImage: '/assets/social/cunard-hero.jpg',
      color: '#8b0000'
    },
    'seabourn': {
      name: 'Seabourn',
      shortName: 'Seabourn',
      directory: 'seabourn',
      heroImage: '/assets/social/seabourn-hero.jpg',
      color: '#1a1a2e'
    },
    'oceania': {
      name: 'Oceania Cruises',
      shortName: 'Oceania',
      directory: 'oceania',
      heroImage: '/assets/social/oceania-hero.jpg',
      color: '#003366'
    },
    'regent': {
      name: 'Regent Seven Seas',
      shortName: 'Regent',
      directory: 'regent',
      heroImage: '/assets/social/regent-hero.jpg',
      color: '#002244'
    },
    'silversea': {
      name: 'Silversea Cruises',
      shortName: 'Silversea',
      directory: 'silversea',
      heroImage: '/assets/social/silversea-hero.jpg',
      color: '#4a4a4a'
    },
    'explora': {
      name: 'Explora Journeys',
      shortName: 'Explora',
      directory: 'explora-journeys',
      heroImage: '/assets/social/explora-hero.jpg',
      color: '#1a1a2e'
    },
    'virgin': {
      name: 'Virgin Voyages',
      shortName: 'Virgin',
      directory: 'virgin',
      heroImage: '/assets/social/virgin-hero.jpg',
      color: '#e31937'
    }
  };

  // Cruise line display order (tiers)
  const CRUISE_LINE_ORDER = [
    // Mainstream
    'rcl', 'carnival', 'norwegian', 'msc', 'costa',
    // Premium
    'celebrity', 'princess', 'holland', 'cunard', 'virgin',
    // Luxury
    'oceania', 'regent', 'seabourn', 'silversea', 'explora'
  ];

  // ===== SHIP IMAGE DATABASE =====
  const SHIP_IMAGES = {
    // Royal Caribbean Icon Class
    'icon-of-the-seas': [
      '/assets/ships/Icon_of_the_Seas_(cropped).webp',
      '/assets/ships/Icon_of_the_Seas_(kahunapulej).webp',
      '/assets/ships/Icon_of_the_Seas_stern_in_Philipsburg,_Sint_Maarten.webp'
    ],
    'star-of-the-seas': [
      '/assets/ships/Cádiz_-_Crucero_Star_of_the_Seas,_atracado_en_el_puerto_de_Cádiz_(25_julio_2025)_01.webp'
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
      '/assets/ships/Wonder_of_the_Seas_atracando_en_Cartagena-España-.webp'
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
      '/assets/ships/1993-Independence_of_the_seas_na_Coruña.webp'
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
      '/assets/ships/Navigator_of_the_Seas,_Puerto_de_la_Bahía_de_Cádiz.webp'
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
    // Historic Fleet
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
    'splendour-of-the-seas': [
      '/assets/ships/Fotos_del_crucero_"Splendour_of_the_Seas"_de_Royal_Caribbean_en_el_muelle_de_Santa_Catalina_del_Puerto_de_Las_Palmas_de_Gran_Canaria_Islas_Canarias_(6424810807).webp',
      '/assets/ships/Fotos_del_crucero_"Splendour_of_the_Seas"_de_Royal_Caribbean_en_el_muelle_de_Santa_Catalina_del_Puerto_de_Las_Palmas_de_Gran_Canaria_Islas_Canarias_(6424818065).webp',
      '/assets/ships/Splendour_of_the_Seas_(at_Split_on_2011-0716).webp'
    ],
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
    ]
  };

  // ===== FLEET DATA =====
  // Royal Caribbean Fleet
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
    'Historic Fleet': {
      order: 9,
      ships: [
        // Sovereign Class ships (former megaships that defined modern cruising)
        { name: 'Sovereign of the Seas', slug: 'sovereign-of-the-seas', year: 1988, gt: '73,192', capacity: 2852, retired: true },
        { name: 'Monarch of the Seas', slug: 'monarch-of-the-seas', year: 1991, gt: '73,937', capacity: 2764, retired: true },
        { name: 'Majesty of the Seas', slug: 'majesty-of-the-seas', year: 1992, gt: '74,077', capacity: 2767, retired: true },
        // Legend Class and earlier ships
        { name: 'Splendour of the Seas', slug: 'splendour-of-the-seas', year: 1996, gt: '69,130', capacity: 2076, retired: true },
        { name: 'Song of Norway', slug: 'song-of-norway', year: 1970, gt: '23,005', capacity: 1040, retired: true },
        { name: 'Song of America', slug: 'song-of-america', year: 1982, gt: '37,584', capacity: 1575, retired: true },
        { name: 'Sun Viking', slug: 'sun-viking', year: 1972, gt: '18,559', capacity: 726, retired: true },
        { name: 'Nordic Empress', slug: 'nordic-empress', year: 1990, gt: '48,563', capacity: 1606, retired: true }
      ]
    }
  };

  // Class descriptions
  const CLASS_DESCRIPTIONS = {
    // Royal Caribbean
    'Icon Class': 'The largest ships at sea with groundbreaking innovations like Category 6 water park and AquaDome.',
    'Oasis Class': 'Neighborhood-style megaships that pioneered Central Park, Boardwalk, and the AquaTheater.',
    'Quantum Ultra Class': 'Enhanced Quantum ships with expanded venues and Asian market features.',
    'Quantum Class': 'Smart ships with North Star observation pod, iFly skydiving, and Two70° entertainment.',
    'Freedom Class': 'FlowRider surf simulators, H2O Zone, and excellent value for families.',
    'Voyager Class': 'The original Royal Promenade ships with ice rinks and rock climbing walls.',
    'Radiance Class': 'Floor-to-ceiling glass throughout for stunning ocean views on every voyage.',
    'Vision Class': 'Intimate ships with classic Royal Caribbean charm and easier navigation.',
    'Historic Fleet': 'Historic ships that built Royal Caribbean\'s legacy from the 1970s through 1990s, including the Sovereign Class megaships that defined modern cruising.'
  };

  // Class header images
  const CLASS_IMAGES = {
    'Icon Class': '/assets/ships/Icon_of_the_Seas_(cropped).webp',
    'Oasis Class': '/assets/ships/Oasis-of-the-seas-FOM- - 1.webp',
    'Quantum Ultra Class': '/assets/ships/Spectrum_of_the_Seas_01.webp',
    'Quantum Class': '/assets/ships/Quantum_of_the_Seas_-_Wedel_04.webp',
    'Freedom Class': '/assets/ships/freedom-of-the-seas-FOM- - 1.webp',
    'Voyager Class': '/assets/ships/Voyageroftheseas.webp',
    'Radiance Class': '/assets/ships/Radiance-of-the-seas-FOM- - 1.webp',
    'Vision Class': '/assets/ships/Grandeur-of-the-seas-FOM- - 1.webp',
    'Historic Fleet': '/assets/ships/Sovereign_of_the_Seas_Nassau_Bahamas_(244161813)_(cropped)_(cropped).webp'
  };

  // Ship CTA text - WHY choose this ship
  const SHIP_CTAS = {
    'icon-of-the-seas': 'The biggest, newest ship with every innovation. Perfect for first-timers who want everything.',
    'star-of-the-seas': 'Icon-class with all the latest features. Ideal for families and thrill-seekers.',
    'oasis-of-the-seas': 'The original neighborhood ship that started a revolution. Great value for Oasis-class experience.',
    'allure-of-the-seas': 'Freshly refurbished with new venues. Excellent choice for families wanting the classic Oasis experience.',
    'harmony-of-the-seas': 'First Oasis ship with waterslides and virtual balconies. Perfect for families with kids.',
    'symphony-of-the-seas': 'Refined Oasis-class with Ultimate Abyss slide. Great for groups wanting diverse options.',
    'wonder-of-the-seas': 'The most refined Oasis ship before Icon. Ideal for newer amenities without highest price.',
    'utopia-of-the-seas': 'Short Caribbean sailings from Florida. Perfect for quick getaways and first-time cruisers.',
    'spectrum-of-the-seas': 'Designed for Asian markets with unique venues. Great for foodies seeking diverse cuisine.',
    'odyssey-of-the-seas': 'Quantum innovation with Caribbean itineraries. Perfect for tech enthusiasts.',
    'quantum-of-the-seas': 'The original smart ship with groundbreaking tech. Great for innovation-focused cruisers.',
    'anthem-of-the-seas': 'Year-round from New Jersey. Ideal for East Coast cruisers who want to avoid flying.',
    'ovation-of-the-seas': 'The Alaska specialist with incredible viewing. Perfect for scenery and destination immersion.',
    'freedom-of-the-seas': 'Classic Royal Caribbean with FlowRider and H2O Zone. Great value for families.',
    'liberty-of-the-seas': 'Popular Galveston homeport. Perfect for Texas cruisers wanting Caribbean getaways.',
    'independence-of-the-seas': 'UK sailings and European itineraries. Ideal for European cruisers.',
    'voyager-of-the-seas': 'The ship that introduced the Royal Promenade. Great for nostalgia and value.',
    'explorer-of-the-seas': 'Ice rink and rock climbing pioneer. Good for families wanting classic amenities.',
    'adventure-of-the-seas': 'Shorter Caribbean sailings. Perfect for quick getaways or testing if cruising is for you.',
    'navigator-of-the-seas': 'LA homeport with Mexican Riviera. Ideal for West Coast cruisers.',
    'mariner-of-the-seas': 'Short Bahamas sailings from Florida. Great for weekend cruises and CocoCay.',
    'radiance-of-the-seas': 'Floor-to-ceiling windows throughout. Million-dollar views through glass walls.',
    'brilliance-of-the-seas': 'Intimate ship with elegant design. Perfect for couples and adults.',
    'serenade-of-the-seas': 'Alaska and Panama Canal specialist. Ideal for destination-focused cruisers.',
    'jewel-of-the-seas': 'European and exotic itineraries. Great for experienced cruisers seeking unique ports.',
    'grandeur-of-the-seas': 'Classic and intimate experience. Perfect for cruisers who prefer smaller ships.',
    'enchantment-of-the-seas': 'Budget-friendly with solid amenities. Great for value-seekers.',
    'vision-of-the-seas': 'The smallest active Royal ship. Ideal for fewer crowds and traditional feel.',
    'rhapsody-of-the-seas': 'Affordable exotic itineraries. Perfect for budget-conscious travelers.',
    'sovereign-of-the-seas': 'Historic first megaship. For cruise history enthusiasts.',
    'monarch-of-the-seas': 'Classic 1990s cruise experience. For nostalgia.',
    'majesty-of-the-seas': 'Budget Bahamas sailings. Great value for quick getaways.'
  };

  // Current state
  let currentCruiseLine = 'rcl';
  let validatedShips = {}; // Will be populated from JSON if available

  /**
   * Get a random image for a ship (different each page load)
   */
  function getRandomShipImage(slug) {
    const images = SHIP_IMAGES[slug];
    if (!images || images.length === 0) return null;

    const today = new Date().toDateString();
    const seed = (today + slug).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const index = Math.abs(seed) % images.length;
    return images[index];
  }

  /**
   * Check if ship has a valid page (checks for HTML file existence via fetch)
   */
  async function checkShipPageExists(cruiseLineDir, slug) {
    const url = `/ships/${cruiseLineDir}/${slug}.html`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * Create ship card HTML
   */
  function createShipCard(ship, cruiseLineConfig, hasPage = true) {
    const imageUrl = getRandomShipImage(ship.slug);
    const pageUrl = `/ships/${cruiseLineConfig.directory}/${ship.slug}.html`;
    const placeholderUrl = '/assets/ship-placeholder.jpg';
    const cta = SHIP_CTAS[ship.slug] || 'Explore this ship to discover what makes it special for your cruise.';
    const formattedCapacity = ship.capacity ? ship.capacity.toLocaleString() : '';

    const cardClasses = ['ship-card', 'item-card'];
    if (ship.retired) cardClasses.push('retired');
    if (!hasPage) cardClasses.push('coming-soon');

    const cardContent = `
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
        ${!hasPage ? `<span class="coming-soon-badge item-card-badge" aria-label="Page coming soon">Coming Soon</span>` : ''}
      </div>
      <div class="ship-card-content item-card-content">
        <h3 class="ship-card-title item-card-title">${ship.name}</h3>
        <div class="ship-card-stats item-card-meta">
          <span class="badge">${ship.year}</span>
          ${ship.gt ? `<span class="badge">${ship.gt} GT</span>` : ''}
          ${formattedCapacity ? `<span class="badge">${formattedCapacity} guests</span>` : ''}
        </div>
        <p class="item-card-cta">${cta}</p>
        <span class="ship-card-cta-btn">${!hasPage ? 'Coming Soon' : ship.retired ? 'View History' : 'Explore Ship'}</span>
      </div>
    `;

    if (hasPage) {
      return `
        <article class="${cardClasses.join(' ')}" data-ship-slug="${ship.slug}">
          <a href="${pageUrl}" class="ship-card-link item-card-link">
            ${cardContent}
          </a>
        </article>
      `;
    } else {
      return `
        <article class="${cardClasses.join(' ')}" data-ship-slug="${ship.slug}">
          <div class="ship-card-link item-card-link" style="cursor: default;">
            ${cardContent}
          </div>
        </article>
      `;
    }
  }

  /**
   * Create ship class section HTML
   */
  function createShipClassSection(className, classData, cruiseLineConfig) {
    const ships = classData.ships;
    if (ships.length === 0) return '';

    const shipsHtml = ships.map(ship => createShipCard(ship, cruiseLineConfig, true)).join('');
    const shipCount = ships.length;
    const classImage = CLASS_IMAGES[className] || '/assets/ship-placeholder.jpg';
    const classDescription = CLASS_DESCRIPTIONS[className] || '';

    const isIconClass = className === 'Icon Class';
    const expandedState = isIconClass ? 'true' : 'false';
    const collapsedClass = isIconClass ? '' : ' collapsed';
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
   * Create cruise line selector buttons
   */
  function createCruiseLineSelector() {
    const buttons = CRUISE_LINE_ORDER.map(lineKey => {
      const line = CRUISE_LINES[lineKey];
      if (!line) return '';
      const isActive = lineKey === currentCruiseLine ? ' active' : '';
      return `
        <button class="cruise-line-btn${isActive}"
                data-cruise-line="${lineKey}"
                type="button"
                aria-pressed="${lineKey === currentCruiseLine}">
          ${line.shortName}
        </button>
      `;
    }).join('');

    return `
      <div class="cruise-line-selector" role="tablist" aria-label="Select cruise line">
        ${buttons}
      </div>
      <p class="tiny muted" style="margin-top: 0.5rem; text-align: center;">
        Select a cruise line to view their fleet. More ships and details coming soon.
      </p>
    `;
  }

  /**
   * Create cruise line section content
   */
  function createCruiseLineSection(lineKey) {
    const line = CRUISE_LINES[lineKey];
    const fleet = lineKey === 'rcl' ? RC_FLEET : {};

    // Sort classes by order
    const sortedClasses = Object.entries(fleet)
      .sort((a, b) => (a[1].order || 999) - (b[1].order || 999));

    const classesHtml = sortedClasses
      .map(([className, classData]) => createShipClassSection(className, classData, line))
      .filter(html => html)
      .join('');

    const activeShips = Object.values(fleet).reduce((sum, cls) =>
      sum + cls.ships.filter(s => !s.retired).length, 0);
    const classCount = Object.keys(fleet).length;

    if (lineKey !== 'rcl') {
      return `
        <section class="cruise-line-section" data-line="${lineKey}">
          <div class="cruise-line-header">
            <div class="cruise-line-hero" style="background: ${line.color};">
              <div class="cruise-line-hero-overlay">
                <h2 class="cruise-line-title">${line.name}</h2>
                <p class="cruise-line-stats">Fleet guide coming soon</p>
              </div>
            </div>
          </div>
          <div class="cruise-line-content">
            <div class="coming-soon-section" style="padding: 3rem 1rem; text-align: center; background: #f8f9fa; border-radius: 8px; margin: 1rem 0;">
              <h3 style="color: #5a7a8a; margin-bottom: 1rem;">🚢 ${line.name} Fleet Coming Soon</h3>
              <p style="color: #789; max-width: 500px; margin: 0 auto;">
                We're working on comprehensive guides for the ${line.name} fleet.
                In the meantime, explore our complete Royal Caribbean coverage or
                check out individual ship pages in the <a href="/ships/${line.directory}/" style="color: #0e6e8e;">ships/${line.directory}</a> directory.
              </p>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <section class="cruise-line-section" data-line="${lineKey}">
        <div class="cruise-line-header">
          <div class="cruise-line-hero">
            <img src="${line.heroImage}" alt="${line.name} fleet" loading="eager" decoding="async"
                 onerror="this.style.display='none';this.parentElement.style.background='${line.color}';" />
            <div class="cruise-line-hero-overlay">
              <h2 class="cruise-line-title">${line.name}</h2>
              <p class="cruise-line-stats">${activeShips} active ships · ${classCount} ship classes</p>
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
   * Initialize cruise line selector
   */
  function initializeCruiseLineSelector() {
    const buttons = document.querySelectorAll('.cruise-line-btn');
    const contentContainer = document.getElementById('cruiseLineContent');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lineKey = btn.getAttribute('data-cruise-line');
        if (lineKey === currentCruiseLine) return;

        // Update button states
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        // Update current state and re-render
        currentCruiseLine = lineKey;
        contentContainer.innerHTML = createCruiseLineSection(lineKey);

        // Re-initialize interactivity
        initializeCollapsibles();
        initializeExpandAll();
        initializeSearch();

        // Set initial state for content sections
        requestAnimationFrame(() => {
          document.querySelectorAll('.ship-class-content').forEach(content => {
            const section = content.closest('.ship-class-section');
            if (!section.classList.contains('collapsed')) {
              content.style.maxHeight = content.scrollHeight + 'px';
            }
          });
        });
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
        title: 'Ships — In the Wake',
        text: 'Explore cruise ship fleets with deck plans, live tracking, and detailed ship information.',
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
   * Escape HTML entities
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

    if (t.includes(q)) return true;

    const targetWords = t.split(/[\s\-]+/);
    for (const word of targetWords) {
      if (word.startsWith(q)) return true;
      if (word.includes(q)) return true;
    }

    if (q.length >= 3) {
      for (const word of targetWords) {
        const distance = levenshteinDistance(q, word.substring(0, q.length + 2));
        const maxLen = Math.max(q.length, word.length);
        if (distance / maxLen <= threshold) return true;
      }

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

      if (clearBtn) {
        clearBtn.style.display = trimmedQuery ? 'block' : 'none';
      }

      if (!trimmedQuery) {
        shipCards.forEach(card => card.classList.remove('search-hidden'));
        classSections.forEach(section => {
          section.classList.remove('search-empty');
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

      // Get current fleet data
      const fleet = currentCruiseLine === 'rcl' ? RC_FLEET : {};

      shipCards.forEach(card => {
        const slug = card.getAttribute('data-ship-slug');
        const section = card.closest('.ship-class-section');
        const className = section ? section.getAttribute('data-class') : '';

        let ship = null;
        for (const [cls, data] of Object.entries(fleet)) {
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

      classSections.forEach(section => {
        const visibleShips = section.querySelectorAll('.ship-card:not(.search-hidden)');

        if (visibleShips.length === 0) {
          section.classList.add('search-empty');
        } else {
          section.classList.remove('search-empty');
          const toggle = section.querySelector('.ship-class-toggle');
          const content = section.querySelector('.ship-class-content');
          if (toggle && content) {
            toggle.setAttribute('aria-expanded', 'true');
            section.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        }
      });

      if (resultsInfo) {
        if (matchCount === 0) {
          resultsInfo.innerHTML = `<strong>No ships found for "${escapeHtml(trimmedQuery)}"</strong> — try a different spelling or class name`;
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

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(e.target.value);
      }, 150);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
      });
    }

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

    // Create the main structure
    container.innerHTML = `
      ${createCruiseLineSelector()}
      <div id="cruiseLineContent">
        ${createCruiseLineSection(currentCruiseLine)}
      </div>
    `;

    // Initialize interactivity
    initializeCruiseLineSelector();
    initializeCollapsibles();
    initializeExpandAll();
    initializeShare();
    initializeSearch();

    // Set initial state for all content sections
    requestAnimationFrame(() => {
      document.querySelectorAll('.ship-class-content').forEach(content => {
        const section = content.closest('.ship-class-section');
        if (!section.classList.contains('collapsed')) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
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
