/**
 * Restaurants Dynamic Module v1.0.0
 * Soli Deo Gloria
 *
 * Features:
 * - Loads venue data from venues-v2.json
 * - Groups venues by category (dining, bars)
 * - Shows which ships have each venue
 * - Filter by category
 * - Links to individual restaurant pages
 */

(function() {
  'use strict';

  // Category display names and icons
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

  // Only show dining and bars categories for restaurants page
  const SHOW_CATEGORIES = ['dining', 'bars'];

  // Venue images - using category SVG placeholders
  const VENUE_IMAGES = {
    // Specialty Dining (fine dining)
    'wonderland': '/assets/images/restaurants/specialty-dining.svg',
    '150-central-park': '/assets/images/restaurants/specialty-dining.svg',
    'chefs-table': '/assets/images/restaurants/specialty-dining.svg',
    'chic': '/assets/images/restaurants/specialty-dining.svg',
    
    // Asian Cuisine
    'izumi': '/assets/images/restaurants/asian-cuisine.svg',
    'izumi-in-the-park': '/assets/images/restaurants/asian-cuisine.svg',
    'sichuan-red': '/assets/images/restaurants/asian-cuisine.svg',
    'hot-pot': '/assets/images/restaurants/asian-cuisine.svg',
    
    // Italian Cuisine
    'jamies-italian': '/assets/images/restaurants/italian-cuisine.svg',
    'giovannis': '/assets/images/restaurants/italian-cuisine.svg',
    'sorrentos': '/assets/images/restaurants/italian-cuisine.svg',
    
    // Steakhouse
    'chops': '/assets/images/restaurants/steakhouse.svg',
    
    // Bars & Lounges
    'schooner-bar': '/assets/images/restaurants/bar-lounge.svg',
    'vintages': '/assets/images/restaurants/bar-lounge.svg',
    'bionic-bar': '/assets/images/restaurants/bar-lounge.svg',
    'boleros': '/assets/images/restaurants/bar-lounge.svg',
    'playmakers': '/assets/images/restaurants/bar-lounge.svg',
    'viking-crown-lounge': '/assets/images/restaurants/bar-lounge.svg',
    'star-lounge': '/assets/images/restaurants/bar-lounge.svg',
    'sky-bar': '/assets/images/restaurants/bar-lounge.svg',
    'r-bar': '/assets/images/restaurants/bar-lounge.svg',
    'olive-or-twist': '/assets/images/restaurants/bar-lounge.svg',
    'diamond-club': '/assets/images/restaurants/bar-lounge.svg',
    'globe-and-atlas': '/assets/images/restaurants/bar-lounge.svg',
    
    // Default placeholder
    '_default': '/assets/images/restaurants/specialty-dining.svg'
  };

  // CTA/pitch text for venues (what makes this venue special)
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

  let venuesData = null;
  let currentFilter = 'all';

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
   * Get image for a venue
   */
  function getVenueImage(slug) {
    return VENUE_IMAGES[slug] || VENUE_IMAGES['_default'];
  }

  /**
   * Get CTA text for a venue
   */
  function getVenueCTA(slug, description) {
    return VENUE_CTAS[slug] || description || VENUE_CTAS['_default'];
  }

  /**
   * Get ships that have a specific venue
   */
  function getShipsWithVenue(venueSlug, shipsData) {
    const ships = [];
    for (const [shipSlug, shipInfo] of Object.entries(shipsData)) {
      if (shipInfo.venues && shipInfo.venues.includes(venueSlug)) {
        ships.push({
          slug: shipSlug,
          name: shipInfo.name,
          class: shipInfo.class
        });
      }
    }
    return ships;
  }

  /**
   * Format ship name for display (shorter version)
   */
  function formatShipName(name) {
    return name.replace(' of the Seas', '');
  }

  /**
   * Create venue card HTML
   */
  function createVenueCard(venue, ships) {
    const imageUrl = getVenueImage(venue.slug);
    const pageUrl = `/restaurants/${venue.slug}.html`;
    const cta = getVenueCTA(venue.slug, venue.description);
    const categoryClass = venue.category || 'dining';

    // Show first 3 ships, then "+N more"
    const maxShips = 3;
    const displayShips = ships.slice(0, maxShips);
    const moreCount = ships.length - maxShips;

    const shipsHtml = displayShips.length > 0 ? `
      <div class="ships-available">
        ${displayShips.map(s => `<span class="ship-chip">${formatShipName(s.name)}</span>`).join('')}
        ${moreCount > 0 ? `<span class="ship-chip more">+${moreCount} more</span>` : ''}
      </div>
    ` : '';

    return `
      <article class="item-card" data-venue="${venue.slug}" data-category="${categoryClass}">
        <a href="${pageUrl}" class="item-card-link">
          <div class="item-card-image">
            <img src="${imageUrl}"
                 alt="${venue.name}"
                 loading="lazy"
                 decoding="async"
                 onerror="this.onerror=null;this.src='${VENUE_IMAGES['_default']}'" />
            <span class="item-card-badge ${categoryClass}">${venue.subcategory || venue.category}</span>
          </div>
          <div class="item-card-content">
            <h3 class="item-card-title">${venue.name}</h3>
            <div class="item-card-meta">
              ${venue.cost ? `<span class="badge">${venue.cost}</span>` : ''}
              ${venue.premium ? '<span class="badge">Specialty</span>' : '<span class="badge">Included</span>'}
            </div>
            <p class="item-card-cta">${cta}</p>
            ${shipsHtml}
          </div>
        </a>
      </article>
    `;
  }

  /**
   * Create category section HTML
   */
  function createCategorySection(categoryKey, venues, shipsData) {
    const info = CATEGORY_INFO[categoryKey] || { name: categoryKey, icon: '📍', description: '' };

    const venueCards = venues.map(venue => {
      const ships = getShipsWithVenue(venue.slug, shipsData);
      return createVenueCard(venue, ships);
    }).join('');

    return `
      <section class="category-section" data-category="${categoryKey}" data-collapsed="false">
        <div class="category-header" role="button" tabindex="0" aria-expanded="true">
          <h2 class="category-title">
            <span aria-hidden="true">${info.icon}</span>
            ${info.name}
            <span class="category-count">${venues.length} venue${venues.length !== 1 ? 's' : ''}</span>
          </h2>
          <span class="category-toggle" aria-hidden="true">▼</span>
        </div>
        <div class="category-content">
          <p class="tiny muted" style="margin-bottom: 1rem;">${info.description}</p>
          <div class="item-grid">
            ${venueCards}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Create filter bar HTML
   */
  function createFilterBar(categories) {
    const buttons = [
      `<button class="filter-btn active" data-filter="all" type="button">All Venues</button>`
    ];

    for (const categoryKey of categories) {
      const info = CATEGORY_INFO[categoryKey];
      if (info) {
        buttons.push(
          `<button class="filter-btn" data-filter="${categoryKey}" type="button">
            <span aria-hidden="true">${info.icon}</span> ${info.name}
          </button>`
        );
      }
    }

    return `
      <div class="filter-bar" role="group" aria-label="Filter venues by category">
        ${buttons.join('')}
      </div>
    `;
  }

  /**
   * Render venues to container
   */
  function renderVenues(venuesArray, shipsData) {
    const container = document.getElementById('venuesContainer');
    if (!container) return;

    // Group venues by category
    const grouped = {};
    for (const venue of venuesArray) {
      const category = venue.category || 'other';
      if (!SHOW_CATEGORIES.includes(category)) continue;

      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(venue);
    }

    // Sort venues within each category alphabetically
    for (const category of Object.keys(grouped)) {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Build HTML
    const filterBar = createFilterBar(SHOW_CATEGORIES);
    const sections = SHOW_CATEGORIES
      .filter(cat => grouped[cat] && grouped[cat].length > 0)
      .map(cat => createCategorySection(cat, grouped[cat], shipsData))
      .join('');

    container.innerHTML = filterBar + sections;

    // Initialize interactions
    initializeFilters();
    initializeCollapsibles();
    initializeSearch();
    announceLoaded(venuesArray.length);
  }

  /**
   * Initialize filter buttons
   */
  function initializeFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const sections = document.querySelectorAll('.category-section');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        currentFilter = filter;

        // Update button states
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/hide sections
        sections.forEach(section => {
          const category = section.dataset.category;
          if (filter === 'all' || category === filter) {
            section.style.display = '';
          } else {
            section.style.display = 'none';
          }
        });
      });
    });
  }

  /**
   * Initialize collapsible sections
   */
  function initializeCollapsibles() {
    const headers = document.querySelectorAll('.category-header');

    headers.forEach(header => {
      const section = header.closest('.category-section');
      const content = section.querySelector('.category-content');

      // Set initial max-height
      requestAnimationFrame(() => {
        content.style.maxHeight = content.scrollHeight + 'px';
      });

      header.addEventListener('click', () => {
        const isCollapsed = section.dataset.collapsed === 'true';
        section.dataset.collapsed = !isCollapsed;
        header.setAttribute('aria-expanded', isCollapsed);

        if (isCollapsed) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
      });

      // Keyboard support
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  /**
   * Announce to screen readers
   */
  function announceLoaded(count) {
    const status = document.getElementById('a11y-status');
    if (status) {
      status.textContent = `${count} venues loaded across dining and bar categories`;
    }
  }

  /**
   * Initialize search functionality
   */
  function initializeSearch() {
    const searchInput = document.getElementById('venueSearch');
    const clearBtn = document.getElementById('clearVenueSearch');
    const resultsInfo = document.getElementById('venueSearchResults');

    if (!searchInput) return;

    let debounceTimer;

    function performSearch(query) {
      const trimmedQuery = query.trim();
      const venueCards = document.querySelectorAll('.item-card[data-venue]');
      const categorySections = document.querySelectorAll('.category-section');

      // Clear button visibility
      if (clearBtn) {
        clearBtn.style.display = trimmedQuery ? 'block' : 'none';
      }

      // If no query, show everything
      if (!trimmedQuery) {
        venueCards.forEach(card => card.classList.remove('search-hidden'));
        categorySections.forEach(section => {
          section.classList.remove('search-empty');
        });
        if (resultsInfo) resultsInfo.textContent = '';
        return;
      }

      let matchCount = 0;
      const matchedCategories = new Set();

      // Check each venue
      venueCards.forEach(card => {
        const venueSlug = card.getAttribute('data-venue');
        const category = card.getAttribute('data-category');

        // Build search text from venue data
        const titleEl = card.querySelector('.item-card-title');
        const ctaEl = card.querySelector('.item-card-cta');
        const shipsEl = card.querySelector('.ships-available');

        const searchParts = [
          titleEl ? titleEl.textContent : '',
          venueSlug ? venueSlug.replace(/-/g, ' ') : '',
          category || '',
          ctaEl ? ctaEl.textContent : '',
          shipsEl ? shipsEl.textContent : ''
        ];
        const searchText = searchParts.join(' ').toLowerCase();

        const isMatch = fuzzyMatch(trimmedQuery, searchText);

        if (isMatch) {
          card.classList.remove('search-hidden');
          matchCount++;
          if (category) matchedCategories.add(category);
        } else {
          card.classList.add('search-hidden');
        }
      });

      // Hide/show category sections based on visible venues
      categorySections.forEach(section => {
        const visibleVenues = section.querySelectorAll('.item-card:not(.search-hidden)');

        if (visibleVenues.length === 0) {
          section.classList.add('search-empty');
        } else {
          section.classList.remove('search-empty');
        }
      });

      // Update results info
      if (resultsInfo) {
        if (matchCount === 0) {
          resultsInfo.innerHTML = `<strong>No venues found for "${trimmedQuery.replace(/</g, '&lt;')}"</strong> — try a different spelling`;
        } else {
          const catNames = {
            'dining': 'Dining',
            'bars': 'Bars & Lounges'
          };
          const categoryText = matchedCategories.size === 1
            ? `in ${catNames[Array.from(matchedCategories)[0]] || Array.from(matchedCategories)[0]}`
            : matchedCategories.size > 1
              ? `across ${matchedCategories.size} categories`
              : '';
          resultsInfo.textContent = `Found ${matchCount} venue${matchCount !== 1 ? 's' : ''} ${categoryText}`;
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
   * Load venues data
   */
  async function loadVenuesData() {
    try {
      const response = await fetch('/assets/data/venues-v2.json');
      if (!response.ok) throw new Error('Failed to load venues data');

      venuesData = await response.json();

      // Filter to only dining and bars
      const filteredVenues = venuesData.venues.filter(v =>
        SHOW_CATEGORIES.includes(v.category)
      );

      renderVenues(filteredVenues, venuesData.ships);
    } catch (error) {

      showError();
    }
  }

  /**
   * Show error state
   */
  function showError() {
    const container = document.getElementById('venuesContainer');
    if (container) {
      container.innerHTML = `
        <div class="no-results">
          <p>Unable to load venue data. Please try refreshing the page.</p>
        </div>
      `;
    }
  }

  /**
   * Initialize
   */
  function init() {
    const container = document.getElementById('venuesContainer');
    if (!container) return;

    loadVenuesData();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
