/**
 * Restaurants Dynamic Module v2.0.0
 * Soli Deo Gloria
 *
 * Features:
 * - Cruise line switching pills (RCL, NCL, Carnival, MSC, Virgin)
 * - Loads venue data per cruise line from separate JSON files
 * - Groups venues by category (dining, bars, entertainment)
 * - Category and cost filter pills
 * - Fuzzy search with Levenshtein distance
 * - Ships-per-venue chips (RCL only — other lines lack ship mapping)
 * - Links to individual restaurant pages with correct path prefix
 */

(function() {
  'use strict';

  // ─── Cruise line definitions ─────────────────────────────────────────────
  const CRUISE_LINES = [
    {
      key: 'rcl',
      label: 'Royal Caribbean',
      shortLabel: 'Royal Caribbean',
      dataFile: '/assets/data/venues-v2.json',
      dishesFile: '/assets/data/venue-dishes.json',
      urlPrefix: '/restaurants/',          // RCL pages live at /restaurants/slug.html
      hasShips: true,                      // venues-v2.json includes a ships object
      categories: ['dining', 'bars']
    },
    {
      key: 'ncl',
      label: 'Norwegian Cruise Line',
      shortLabel: 'Norwegian',
      dataFile: '/assets/data/ncl-venues.json',
      dishesFile: null,
      urlPrefix: '/restaurants/ncl/',
      hasShips: false,
      categories: ['dining', 'bars']
    },
    {
      key: 'carnival',
      label: 'Carnival Cruise Line',
      shortLabel: 'Carnival',
      dataFile: '/assets/data/carnival-venues.json',
      dishesFile: null,
      urlPrefix: '/restaurants/carnival/',
      hasShips: false,
      categories: ['dining', 'bars']
    },
    {
      key: 'msc',
      label: 'MSC Cruises',
      shortLabel: 'MSC',
      dataFile: '/assets/data/msc-venues.json',
      dishesFile: null,
      urlPrefix: '/restaurants/msc/',
      hasShips: false,
      categories: ['dining']
    },
    {
      key: 'virgin',
      label: 'Virgin Voyages',
      shortLabel: 'Virgin Voyages',
      dataFile: '/assets/data/virgin-venues.json',
      dishesFile: null,
      urlPrefix: '/restaurants/virgin/',
      hasShips: false,
      categories: ['dining', 'bars', 'entertainment']
    }
  ];

  // ─── Category display names and icons ────────────────────────────────────
  const CATEGORY_INFO = {
    'dining': {
      name: 'Dining',
      icon: '🍽️',
      description: 'Main dining rooms, specialty restaurants, and casual eateries'
    },
    'bars': {
      name: 'Bars & Lounges',
      icon: '🍸',
      description: 'Cocktail bars, pubs, coffee shops, and lounges'
    },
    'entertainment': {
      name: 'Entertainment',
      icon: '🎭',
      description: 'Theaters, shows, and performance venues'
    },
    'activities': {
      name: 'Activities',
      icon: '🏊',
      description: 'Pools, sports, spa, and recreational facilities'
    }
  };

  // ─── Venue images (RCL-focused; other lines fall through to defaults) ────
  const VENUE_IMAGES = {
    'mdr': '/assets/images/restaurants/photos/formal-dining.webp',
    'the-dining-room': '/assets/images/restaurants/photos/formal-dining.webp',
    'adagio-dining-room': '/assets/images/restaurants/photos/formal-dining.webp',
    'windjammer': '/assets/images/restaurants/photos/buffet.webp',
    'surfside-eatery': '/assets/images/restaurants/photos/buffet.webp',
    'aquadome-market': '/assets/images/restaurants/photos/buffet.webp',
    'park-cafe': '/assets/images/restaurants/photos/croissant.webp',
    'solarium-bistro': '/assets/images/restaurants/photos/croissant.webp',
    'pearl-cafe': '/assets/images/restaurants/photos/croissant.webp',
    'cafe-two70': '/assets/images/restaurants/photos/croissant.webp',
    'la-patisserie': '/assets/images/restaurants/photos/croissant.webp',
    'desserted': '/assets/images/restaurants/photos/croissant.webp',
    'starbucks': '/assets/images/restaurants/photos/croissant.webp',
    'rye-and-bean': '/assets/images/restaurants/photos/croissant.webp',
    'latte-tudes': '/assets/images/restaurants/photos/croissant.webp',
    'surfside-bites': '/assets/images/restaurants/photos/hotdog.webp',
    'basecamp': '/assets/images/restaurants/photos/hotdog.webp',
    'portside-bbq': '/assets/images/restaurants/photos/hotdog.webp',
    'johnny-rockets': '/assets/images/restaurants/photos/hotdog.webp',
    'dog-house': '/assets/images/restaurants/photos/hotdog.webp',
    'sorrentos': '/assets/images/restaurants/photos/pizza.webp',
    'playmakers': '/assets/images/restaurants/photos/pizza.webp',
    'el-loco-fresh': '/assets/images/restaurants/photos/tacos.webp',
    'sabor': '/assets/images/restaurants/photos/tacos.webp',
    'sabor-taqueria': '/assets/images/restaurants/photos/tacos.webp',
    'cantina-fresca': '/assets/images/restaurants/photos/tacos.webp',
    'izumi': '/assets/images/restaurants/photos/sushi.webp',
    'izumi-in-the-park': '/assets/images/restaurants/photos/sushi.webp',
    'sichuan-red': '/assets/images/restaurants/photos/sushi.webp',
    'hot-pot': '/assets/images/restaurants/photos/sushi.webp',
    'hooked-seafood': '/assets/images/restaurants/photos/sushi.webp',
    'pier-7': '/assets/images/restaurants/photos/sushi.webp',
    'giovannis': '/assets/images/restaurants/photos/italian.webp',
    'giovannis-italian-kitchen': '/assets/images/restaurants/photos/italian.webp',
    'jamies-italian': '/assets/images/restaurants/photos/italian.webp',
    '150-central-park': '/assets/images/restaurants/photos/italian.webp',
    'wonderland': '/assets/images/restaurants/photos/italian.webp',
    'celebration-table': '/assets/images/restaurants/photos/italian.webp',
    'empire-supper-club': '/assets/images/restaurants/photos/italian.webp',
    'lincoln-park-supper-club': '/assets/images/restaurants/photos/italian.webp',
    'samba-grill': '/assets/images/restaurants/photos/italian.webp',
    'chops': '/assets/images/restaurants/photos/formal-dining.webp',
    'chefs-table': '/assets/images/restaurants/photos/formal-dining.webp',
    'chic': '/assets/images/restaurants/photos/formal-dining.webp',
    'coastal-kitchen': '/assets/images/restaurants/photos/formal-dining.webp',
    'room-service': '/assets/images/restaurants/photos/formal-dining.webp',
    'schooner-bar': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'boleros': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'viking-crown-lounge': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'star-lounge': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'r-bar': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'olive-or-twist': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'diamond-club': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'bamboo-room': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'lous-jazz-n-blues': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'dueling-pianos': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'cloud-17': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'dazzles': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    '1400-lobby-bar': '/assets/images/restaurants/photos/cocktail-lounge.webp',
    'vintages': '/assets/images/restaurants/photos/bar-lounge.webp',
    'bionic-bar': '/assets/images/restaurants/photos/bar-lounge.webp',
    'sky-bar': '/assets/images/restaurants/photos/bar-lounge.webp',
    'globe-and-atlas': '/assets/images/restaurants/photos/bar-lounge.webp',
    'lime-and-coconut': '/assets/images/restaurants/photos/bar-lounge.webp',
    'north-star-bar': '/assets/images/restaurants/photos/bar-lounge.webp',
    'the-grove': '/assets/images/restaurants/photos/bar-lounge.webp',
    'point-and-feather': '/assets/images/restaurants/photos/bar-lounge.webp',
    'on-air': '/assets/images/restaurants/photos/bar-lounge.webp',
    'trellis-bar': '/assets/images/restaurants/photos/bar-lounge.webp',
    'the-overlook': '/assets/images/restaurants/photos/bar-lounge.webp',
    'bubbles': '/assets/images/restaurants/photos/cocktail.webp',
    'champagne-bar': '/assets/images/restaurants/photos/cocktail.webp',
    'swim-and-tonic': '/assets/images/restaurants/photos/cocktail.webp',
    'pesky-parrot': '/assets/images/restaurants/photos/cocktail.webp',
    'lemon-post': '/assets/images/restaurants/photos/cocktail.webp',
    '_default': '/assets/images/restaurants/photos/formal-dining.webp'
  };

  // ─── CTA/pitch text for notable venues ───────────────────────────────────
  const VENUE_CTAS = {
    'chops': 'Premium steakhouse experience with USDA Prime beef. Perfect for special occasions and those craving a classic American steakhouse.',
    'giovannis': 'Family-style Italian with generous portions. Great for groups who want to share dishes and linger over wine.',
    'izumi': 'Fresh sushi and teppanyaki. Ideal if you love Japanese cuisine or want to watch skilled hibachi chefs perform.',
    'wonderland': 'Molecular gastronomy and whimsical presentations. For adventurous eaters seeking Instagram-worthy dishes.',
    'mdr': 'Complimentary multi-course dining with rotating menus. The heart of traditional cruise dining with attentive service.',
    'windjammer': 'Buffet with global stations. Perfect for picky eaters, families, or when you want variety without reservations.',
    'schooner-bar': 'Classic cocktails and piano music. The traditional cruise bar for a relaxed evening with timeless ambiance.',
    'bionic-bar': 'Robot bartenders mix your drinks. Fun tech experience, especially for first-time cruisers and kids.',
    'boleros': 'Latin music and dancing. Great for couples or anyone who wants to move to live salsa rhythms.',
    'playmakers': 'Sports bar with arcade games. Where to catch the big game with wings and beer.',
    'coastal-kitchen': 'Exclusive to suite guests. Premium dining included with your suite, featuring Mediterranean-inspired cuisine.',
    'chefs-table': 'Multi-course tasting menu with wine pairings. The most exclusive dining experience onboard.',
    '150-central-park': 'Fine dining in Central Park. Seasonal menus and elegant atmosphere for a romantic evening.',
    'johnny-rockets': 'Classic American burgers and shakes. Nostalgic 50s diner fun, especially for kids.',
    'cafe-promenade': 'Quick bites on the Royal Promenade. Grab a late-night snack without missing the action.',
    'el-loco-fresh': 'Complimentary tacos and burritos. Fast, flavorful, and perfect poolside.',
    'sorrentos': 'Pizza by the slice, any hour. The go-to for a quick bite between activities.',
    'starbucks': 'Your favorite coffee drinks at sea. Familiar comfort when you need that specific latte.',
    'vintages': 'Wine bar with sommelier selections. Quiet spot for oenophiles to explore by the glass.',
    'solarium-bistro': 'Light fare in the adults-only Solarium. Peaceful breakfast away from the crowds.',
    'bamboo-room': 'Polynesian tiki bar. Tropical cocktails and vacation vibes in a relaxed setting.',
    'lime-and-coconut': 'Multi-level pool bar. The social hub for frozen drinks and meeting fellow cruisers.',
    '_default': 'Explore this venue to discover what makes it special on your cruise.'
  };

  // ─── State ───────────────────────────────────────────────────────────────
  let activeLine = CRUISE_LINES[0];   // Default to RCL
  let lineCache = {};                  // Cache loaded data per line key
  let dishesData = null;               // Dishes data (RCL only)

  // ─── Utility functions ───────────────────────────────────────────────────

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

  function fuzzyMatch(query, target, threshold) {
    if (!query || !target) return false;
    threshold = threshold || 0.3;
    var q = query.toLowerCase().trim();
    var t = target.toLowerCase();
    if (t.includes(q)) return true;
    var targetWords = t.split(/[\s\-]+/);
    for (var i = 0; i < targetWords.length; i++) {
      if (targetWords[i].startsWith(q)) return true;
      if (targetWords[i].includes(q)) return true;
    }
    if (q.length >= 3) {
      for (var j = 0; j < targetWords.length; j++) {
        var distance = levenshteinDistance(q, targetWords[j].substring(0, q.length + 2));
        var maxLen = Math.max(q.length, targetWords[j].length);
        if (distance / maxLen <= threshold) return true;
      }
      var dist2 = levenshteinDistance(q, t.substring(0, q.length + 3));
      if (dist2 <= Math.ceil(q.length * threshold)) return true;
    }
    return false;
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Normalize category names across cruise lines.
   * Some data files use "bar" (singular) instead of "bars".
   */
  function normalizeCategory(category) {
    if (category === 'bar') return 'bars';
    return category;
  }

  function getVenueImage(slug) {
    return VENUE_IMAGES[slug] || VENUE_IMAGES['_default'];
  }

  function getVenueCTA(slug, description) {
    return VENUE_CTAS[slug] || description || VENUE_CTAS['_default'];
  }

  function getShipsWithVenue(venueSlug, shipsData) {
    if (!shipsData) return [];
    var ships = [];
    for (var shipSlug in shipsData) {
      var shipInfo = shipsData[shipSlug];
      if (shipInfo.venues && shipInfo.venues.includes(venueSlug)) {
        ships.push({ slug: shipSlug, name: shipInfo.name, class: shipInfo.class });
      }
    }
    return ships;
  }

  function formatShipName(name) {
    return name.replace(' of the Seas', '');
  }

  function getVenueDishes(venueSlug) {
    if (!dishesData || !dishesData.venues || !dishesData.venues[venueSlug]) return [];
    var venueInfo = dishesData.venues[venueSlug];
    return [].concat(venueInfo.dishes || [], venueInfo.cuisine || []);
  }

  function getConsolidatedNames(venueSlug, allVenues) {
    return allVenues
      .filter(function(v) { return v.consolidate_into === venueSlug; })
      .map(function(v) { return v.name; })
      .join(' ');
  }

  // ─── Rendering ───────────────────────────────────────────────────────────

  function createVenueCard(venue, ships, consolidatedNames, urlPrefix) {
    var imageUrl = getVenueImage(venue.slug);
    var pageUrl = urlPrefix + venue.slug + '.html';
    var cta = getVenueCTA(venue.slug, venue.description);
    var categoryClass = normalizeCategory(venue.category || 'dining');

    var maxShips = 3;
    var displayShips = ships.slice(0, maxShips);
    var moreCount = ships.length - maxShips;

    var shipsHtml = displayShips.length > 0 ?
      '<div class="ships-available">' +
        displayShips.map(function(s) { return '<span class="ship-chip">' + escapeHtml(formatShipName(s.name)) + '</span>'; }).join('') +
        (moreCount > 0 ? '<span class="chip more">+' + moreCount + ' more</span>' : '') +
      '</div>' : '';

    var dishKeywords = getVenueDishes(venue.slug);
    var allKeywords = (consolidatedNames ? [consolidatedNames] : []).concat(dishKeywords);
    var searchAttr = allKeywords.length > 0
      ? ' data-search-keywords="' + allKeywords.join(' ').replace(/"/g, '&quot;') + '"'
      : '';

    return '<article class="item-card" data-venue="' + escapeHtml(venue.slug) + '" data-category="' + escapeHtml(categoryClass) + '"' + searchAttr + '>' +
      '<a href="' + escapeHtml(pageUrl) + '" class="item-card-link">' +
        '<div class="item-card-image">' +
          '<img src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(venue.name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + VENUE_IMAGES['_default'] + '\'" />' +
          '<span class="item-card-badge ' + escapeHtml(categoryClass) + '">' + escapeHtml(venue.subcategory || venue.category) + '</span>' +
        '</div>' +
        '<div class="item-card-content">' +
          '<h3 class="item-card-title">' + escapeHtml(venue.name) + '</h3>' +
          '<div class="item-card-meta">' +
            (venue.cost ? '<span class="badge">' + escapeHtml(venue.cost) + '</span>' : '') +
            (venue.premium ? '<span class="badge">Specialty</span>' : '<span class="badge">Included</span>') +
          '</div>' +
          '<p class="item-card-cta">' + escapeHtml(cta) + '</p>' +
          shipsHtml +
        '</div>' +
      '</a>' +
    '</article>';
  }

  function createCategorySection(categoryKey, venues, shipsData, allVenues, urlPrefix) {
    var info = CATEGORY_INFO[categoryKey] || { name: categoryKey, icon: '📍', description: '' };

    var venueCards = venues.map(function(venue) {
      var ships = getShipsWithVenue(venue.slug, shipsData);
      var consolidated = getConsolidatedNames(venue.slug, allVenues);
      return createVenueCard(venue, ships, consolidated, urlPrefix);
    }).join('');

    return '<section class="category-section" data-category="' + categoryKey + '" data-collapsed="false">' +
      '<div class="category-header" role="button" tabindex="0" aria-expanded="true">' +
        '<h2 class="category-title">' +
          '<span aria-hidden="true">' + info.icon + '</span> ' +
          info.name +
          ' <span class="category-count">' + venues.length + ' venue' + (venues.length !== 1 ? 's' : '') + '</span>' +
        '</h2>' +
        '<span class="category-toggle" aria-hidden="true">▼</span>' +
      '</div>' +
      '<div class="category-content">' +
        '<p class="tiny muted" style="margin-bottom: 1rem;">' + info.description + '</p>' +
        '<div class="item-grid">' + venueCards + '</div>' +
      '</div>' +
    '</section>';
  }

  /**
   * Build the cruise line pills row.
   */
  function createCruiseLinePills() {
    var pills = CRUISE_LINES.map(function(line) {
      var activeClass = line.key === activeLine.key ? ' active' : '';
      return '<button class="filter-pill' + activeClass + '" data-line="' + line.key + '" type="button">' +
        escapeHtml(line.shortLabel) + '</button>';
    });

    return '<div class="filter-bar cruise-line-bar" role="group" aria-label="Select cruise line">' +
      '<div class="filter-row">' + pills.join('') + '</div>' +
    '</div>';
  }

  /**
   * Build the category + cost filter pills for the active line.
   */
  function createFilterBar(categories) {
    var pills = [
      '<button class="filter-pill active" data-filter="all" data-filter-type="category" type="button">All</button>'
    ];

    if (categories.includes('dining')) {
      pills.push('<button class="filter-pill" data-filter="dining" data-filter-type="category" type="button">🍽️ Dining</button>');
    }
    if (categories.includes('bars')) {
      pills.push('<button class="filter-pill" data-filter="bars" data-filter-type="category" type="button">🍸 Bars & Lounges</button>');
    }
    if (categories.includes('entertainment')) {
      pills.push('<button class="filter-pill" data-filter="entertainment" data-filter-type="category" type="button">🎭 Entertainment</button>');
    }

    // Cost filters only if the line has a mix of included/premium
    pills.push('<button class="filter-pill" data-filter="included" data-filter-type="cost" type="button">✓ Included</button>');
    pills.push('<button class="filter-pill" data-filter="premium" data-filter-type="cost" type="button">💰 Premium</button>');

    return '<div class="filter-bar" role="group" aria-label="Filter venues">' +
      '<div class="filter-row">' + pills.join('') + '</div>' +
    '</div>';
  }

  /**
   * Main render function — builds venue cards for the active cruise line.
   */
  function renderVenues(venuesArray, shipsData, allVenues, lineConfig) {
    var container = document.getElementById('venuesContainer');
    if (!container) return;

    var categories = lineConfig.categories;
    var urlPrefix = lineConfig.urlPrefix;

    // Group venues by normalized category
    var grouped = {};
    for (var i = 0; i < venuesArray.length; i++) {
      var venue = venuesArray[i];
      var category = normalizeCategory(venue.category || 'other');
      if (!categories.includes(category)) continue;
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(venue);
    }

    // Sort alphabetically within each category
    for (var cat in grouped) {
      grouped[cat].sort(function(a, b) { return a.name.localeCompare(b.name); });
    }

    // Build HTML
    var cruiseLinePills = createCruiseLinePills();
    var filterBar = createFilterBar(categories);
    var sections = categories
      .filter(function(c) { return grouped[c] && grouped[c].length > 0; })
      .map(function(c) { return createCategorySection(c, grouped[c], shipsData, allVenues, urlPrefix); })
      .join('');

    container.innerHTML = cruiseLinePills + filterBar + sections;

    // Initialize interactions
    initializeCruiseLinePills();
    initializeFilters();
    initializeCollapsibles();
    initializeSearch();
    announceLoaded(venuesArray.length, lineConfig.label);
  }

  // ─── Cruise line pill interaction ────────────────────────────────────────

  function initializeCruiseLinePills() {
    var pills = document.querySelectorAll('.cruise-line-bar .filter-pill[data-line]');
    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        var key = pill.getAttribute('data-line');
        var line = CRUISE_LINES.find(function(l) { return l.key === key; });
        if (!line || line.key === activeLine.key) return;

        activeLine = line;

        // Update active state visually
        pills.forEach(function(p) { p.classList.remove('active'); });
        pill.classList.add('active');

        // Clear search
        var searchInput = document.getElementById('venueSearch');
        if (searchInput) searchInput.value = '';

        // Load and render the selected line
        loadAndRenderLine(line);
      });
    });
  }

  // ─── Category/cost filter interaction ────────────────────────────────────

  function initializeFilters() {
    var categoryPills = document.querySelectorAll('.filter-bar:not(.cruise-line-bar) .filter-pill[data-filter-type="category"]');
    var costPills = document.querySelectorAll('.filter-bar:not(.cruise-line-bar) .filter-pill[data-filter-type="cost"]');
    var venueCards = document.querySelectorAll('.item-card');
    var sections = document.querySelectorAll('.category-section');

    var activeCategory = 'all';
    var activeCostFilters = new Set();

    function applyFilters() {
      var categoryCounts = {};

      venueCards.forEach(function(card) {
        var cardCategory = card.dataset.category;
        var badges = Array.from(card.querySelectorAll('.badge:not(.item-card-badge)'));
        var isPremium = badges.some(function(badge) { return badge.textContent.trim() === 'Specialty'; });

        var categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;

        var costMatch = true;
        if (activeCostFilters.size > 0) {
          if (activeCostFilters.has('included') && !isPremium) {
            costMatch = true;
          } else if (activeCostFilters.has('premium') && isPremium) {
            costMatch = true;
          } else {
            costMatch = false;
          }
        }

        var shouldShow = categoryMatch && costMatch;
        if (shouldShow) {
          card.classList.remove('filter-hidden');
          categoryCounts[cardCategory] = (categoryCounts[cardCategory] || 0) + 1;
        } else {
          card.classList.add('filter-hidden');
        }
      });

      sections.forEach(function(section) {
        var category = section.dataset.category;
        var visibleInSection = categoryCounts[category] || 0;
        if (visibleInSection > 0) {
          section.style.display = '';
          section.classList.remove('filter-empty');
        } else {
          section.classList.add('filter-empty');
          if (activeCategory !== 'all' && category !== activeCategory) {
            section.style.display = 'none';
          }
        }
      });
    }

    categoryPills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        var clickedFilter = pill.dataset.filter;
        if (clickedFilter !== 'all' && activeCategory === clickedFilter) {
          activeCategory = 'all';
          categoryPills.forEach(function(p) { p.classList.remove('active'); });
          var allPill = document.querySelector('.filter-bar:not(.cruise-line-bar) .filter-pill[data-filter="all"]');
          if (allPill) allPill.classList.add('active');
        } else {
          activeCategory = clickedFilter;
          categoryPills.forEach(function(p) { p.classList.remove('active'); });
          pill.classList.add('active');
        }
        applyFilters();
      });
    });

    costPills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        var filter = pill.dataset.filter;
        if (activeCostFilters.has(filter)) {
          activeCostFilters.delete(filter);
          pill.classList.remove('active');
        } else {
          activeCostFilters.add(filter);
          pill.classList.add('active');
        }
        applyFilters();
      });
    });
  }

  // ─── Collapsible sections ────────────────────────────────────────────────

  function initializeCollapsibles() {
    var headers = document.querySelectorAll('.category-header');

    headers.forEach(function(header) {
      var section = header.closest('.category-section');
      var content = section.querySelector('.category-content');

      requestAnimationFrame(function() {
        content.style.maxHeight = content.scrollHeight + 'px';
      });

      header.addEventListener('click', function() {
        var isCollapsed = section.dataset.collapsed === 'true';
        section.dataset.collapsed = !isCollapsed;
        header.setAttribute('aria-expanded', isCollapsed);
        if (isCollapsed) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
      });

      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  // ─── Accessibility announcement ──────────────────────────────────────────

  function announceLoaded(count, lineName) {
    var status = document.getElementById('a11y-status');
    if (status) {
      status.textContent = count + ' ' + lineName + ' venues available';
    }
  }

  // ─── Search ──────────────────────────────────────────────────────────────

  function initializeSearch() {
    var searchInput = document.getElementById('venueSearch');
    var clearBtn = document.getElementById('clearVenueSearch');
    var resultsInfo = document.getElementById('venueSearchResults');

    if (!searchInput) return;

    var debounceTimer;

    function performSearch(query) {
      var trimmedQuery = query.trim();
      var venueCards = document.querySelectorAll('.item-card[data-venue]');
      var categorySections = document.querySelectorAll('.category-section');

      if (clearBtn) {
        clearBtn.style.display = trimmedQuery ? 'block' : 'none';
      }

      if (!trimmedQuery) {
        venueCards.forEach(function(card) { card.classList.remove('search-hidden'); });
        categorySections.forEach(function(section) { section.classList.remove('search-empty'); });
        if (resultsInfo) resultsInfo.textContent = '';
        return;
      }

      var matchCount = 0;
      var matchedCategories = new Set();

      venueCards.forEach(function(card) {
        var venueSlug = card.getAttribute('data-venue');
        var category = card.getAttribute('data-category');
        var searchKeywords = card.getAttribute('data-search-keywords') || '';

        var titleEl = card.querySelector('.item-card-title');
        var ctaEl = card.querySelector('.item-card-cta');
        var shipsEl = card.querySelector('.ships-available');

        var searchParts = [
          titleEl ? titleEl.textContent : '',
          venueSlug ? venueSlug.replace(/-/g, ' ') : '',
          category || '',
          ctaEl ? ctaEl.textContent : '',
          shipsEl ? shipsEl.textContent : '',
          searchKeywords
        ];
        var searchText = searchParts.join(' ').toLowerCase();

        if (fuzzyMatch(trimmedQuery, searchText)) {
          card.classList.remove('search-hidden');
          matchCount++;
          if (category) matchedCategories.add(category);
        } else {
          card.classList.add('search-hidden');
        }
      });

      categorySections.forEach(function(section) {
        var visibleVenues = section.querySelectorAll('.item-card:not(.search-hidden)');
        if (visibleVenues.length === 0) {
          section.classList.add('search-empty');
        } else {
          section.classList.remove('search-empty');
        }
      });

      if (resultsInfo) {
        if (matchCount === 0) {
          resultsInfo.innerHTML = '<strong>No venues found for "' + escapeHtml(trimmedQuery) + '"</strong> — try a different spelling';
        } else {
          var catText = matchedCategories.size > 1
            ? ' across ' + matchedCategories.size + ' categories'
            : '';
          resultsInfo.textContent = 'Found ' + matchCount + ' venue' + (matchCount !== 1 ? 's' : '') + catText;
        }
      }
    }

    searchInput.addEventListener('input', function(e) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        performSearch(e.target.value);
      }, 150);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
      });
    }

    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') e.preventDefault();
      if (e.key === 'Escape') {
        searchInput.value = '';
        performSearch('');
      }
    });
  }

  // ─── Data loading ────────────────────────────────────────────────────────

  /**
   * Load data for a specific cruise line and render it.
   */
  async function loadAndRenderLine(lineConfig) {
    var container = document.getElementById('venuesContainer');
    if (!container) return;

    // Show loading state — preserve the cruise line pills
    var cruiseLinePillsHtml = container.querySelector('.cruise-line-bar');
    var pillsHtml = cruiseLinePillsHtml ? cruiseLinePillsHtml.outerHTML : createCruiseLinePills();
    container.innerHTML = pillsHtml + '<div class="items-loading">Loading ' + escapeHtml(lineConfig.label) + ' venues</div>';
    initializeCruiseLinePills();

    try {
      // Use cache if available
      if (lineCache[lineConfig.key]) {
        var cached = lineCache[lineConfig.key];
        renderVenues(cached.filtered, cached.ships, cached.allVenues, lineConfig);
        return;
      }

      // Fetch data
      var fetches = [fetch(lineConfig.dataFile)];
      if (lineConfig.dishesFile) {
        fetches.push(fetch(lineConfig.dishesFile).catch(function() { return null; }));
      }

      var responses = await Promise.all(fetches);
      var venuesResponse = responses[0];

      if (!venuesResponse.ok) throw new Error('Failed to load ' + lineConfig.label + ' venue data');
      var data = await venuesResponse.json();

      // Load dishes data if available (RCL only)
      if (lineConfig.dishesFile && responses[1] && responses[1].ok) {
        dishesData = await responses[1].json();
      } else if (!lineConfig.dishesFile) {
        dishesData = null;
      }

      var shipsData = data.ships || null;
      var allVenues = data.venues || [];

      // Filter: only show configured categories, exclude consolidated venues
      var filtered = allVenues.filter(function(v) {
        var cat = normalizeCategory(v.category || 'other');
        return lineConfig.categories.includes(cat) && !v.consolidate_into;
      });

      // Cache
      lineCache[lineConfig.key] = { filtered: filtered, ships: shipsData, allVenues: allVenues };

      renderVenues(filtered, shipsData, allVenues, lineConfig);
    } catch (_) {
      showError(lineConfig.label);
    }
  }

  function showError(lineName) {
    var container = document.getElementById('venuesContainer');
    if (container) {
      var pillsHtml = createCruiseLinePills();
      container.innerHTML = pillsHtml +
        '<div class="no-results"><p>Unable to load ' + escapeHtml(lineName || '') + ' venue data. Please try refreshing the page.</p></div>';
      initializeCruiseLinePills();
    }
  }

  // ─── Initialize ──────────────────────────────────────────────────────────

  function init() {
    var container = document.getElementById('venuesContainer');
    if (!container) return;
    loadAndRenderLine(activeLine);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
