/**
 * In the Wake - Dynamic Search
 * Soli Deo Gloria
 *
 * Instant fuzzy search across all site content using Fuse.js
 */

// Global variables
let searchIndex = [];
let fuse = null;

// Category display names
const CATEGORY_LABELS = {
  'restaurant': 'Restaurant',
  'ship': 'Ship',
  'article': 'Article',
  'cruise-line': 'Cruise Line',
  'hub': 'Hub',
  'tool': 'Tool',
  'about': 'About',
  'port': 'Port'
};

// Food-related keywords that should prioritize restaurants over ports
const FOOD_KEYWORDS = [
  'pizza', 'sushi', 'steak', 'burger', 'seafood', 'lobster', 'shrimp', 'crab',
  'pasta', 'italian', 'mexican', 'asian', 'chinese', 'japanese', 'thai', 'indian',
  'breakfast', 'lunch', 'dinner', 'brunch', 'buffet', 'dining', 'restaurant',
  'food', 'eat', 'menu', 'cuisine', 'chef', 'grill', 'bar', 'cafe', 'coffee',
  'dessert', 'ice cream', 'chocolate', 'cake', 'bakery', 'pastry',
  'wine', 'beer', 'cocktail', 'drink', 'beverage',
  'tacos', 'burrito', 'sandwich', 'salad', 'soup', 'appetizer',
  'vegetarian', 'vegan', 'gluten', 'allergy',
  'escargot', 'prime rib', 'filet', 'duck', 'lamb', 'formal', 'main dining',
  'ribeye', 'porterhouse', 'tiramisu', 'lasagna', 'parmesan', 'miso', 'tempura',
  'sashimi', 'teriyaki', 'gyoza', 'edamame', 'churros', 'guacamole', 'fajitas',
  'oysters', 'clam chowder', 'crab cake', 'milkshake', 'nachos', 'wings',
  'johnny rockets', 'chops', 'izumi', 'wonderland', 'sorrento', 'giovannis',
  'jamie', 'hibachi', 'teppanyaki', 'sabor', 'hooked', 'windjammer', 'playmakers'
];

// Location keywords that indicate port/destination intent
const LOCATION_KEYWORDS = [
  'italy', 'italian coast', 'greece', 'spain', 'france', 'caribbean', 'alaska',
  'mexico', 'bahamas', 'jamaica', 'cozumel', 'nassau', 'labadee', 'perfect day',
  'europe', 'mediterranean', 'asia', 'australia', 'hawaii', 'bermuda',
  'port', 'destination', 'visit', 'excursion', 'shore', 'day trip'
];

// Ship-related keywords that should prioritize ships
const SHIP_KEYWORDS = [
  'icon', 'star', 'oasis', 'allure', 'harmony', 'symphony', 'wonder', 'utopia',
  'quantum', 'anthem', 'ovation', 'spectrum', 'odyssey',
  'freedom', 'liberty', 'independence',
  'voyager', 'explorer', 'adventure', 'navigator', 'mariner',
  'radiance', 'brilliance', 'serenade', 'jewel',
  'vision', 'rhapsody', 'enchantment', 'grandeur', 'legend',
  'of the seas', 'class', 'deck plan', 'stateroom', 'cabin'
];

// Check if query contains food-related terms
function containsFoodTerm(query) {
  const lowerQuery = query.toLowerCase();
  return FOOD_KEYWORDS.some(term => lowerQuery.includes(term));
}

// Check if query contains location terms
function containsLocationTerm(query) {
  const lowerQuery = query.toLowerCase();
  return LOCATION_KEYWORDS.some(term => lowerQuery.includes(term));
}

// Check if query contains ship-related terms
function containsShipTerm(query) {
  const lowerQuery = query.toLowerCase();
  return SHIP_KEYWORDS.some(term => lowerQuery.includes(term));
}

// Determine the primary category order based on query analysis
function getCategoryOrderForQuery(query) {
  const hasFoodTerm = containsFoodTerm(query);
  const hasShipTerm = containsShipTerm(query);
  const hasLocationTerm = containsLocationTerm(query);

  // Ship queries prioritize ships
  if (hasShipTerm && !hasFoodTerm) {
    return ['ship', 'restaurant', 'article', 'port', 'tool', 'cruise-line', 'hub', 'about'];
  }

  // Food queries prioritize restaurants (ports already filtered out)
  if (hasFoodTerm && !hasLocationTerm) {
    return ['restaurant', 'ship', 'article', 'tool', 'cruise-line', 'hub', 'about'];
  }

  // Location queries prioritize ports
  if (hasLocationTerm && !hasFoodTerm) {
    return ['port', 'ship', 'restaurant', 'article', 'tool', 'cruise-line', 'hub', 'about'];
  }

  // Default order
  return ['restaurant', 'ship', 'article', 'port', 'tool', 'cruise-line', 'hub', 'about'];
}

// Filter results based on query context
function filterResultsByContext(results, query) {
  const hasFoodTerm = containsFoodTerm(query);
  const hasLocationTerm = containsLocationTerm(query);

  // If only food terms (no location), exclude ports
  if (hasFoodTerm && !hasLocationTerm) {
    return results.filter(r => r.item.category !== 'port');
  }

  // Otherwise, return all results
  return results;
}

// Initialize search
async function initSearch() {
  try {
    const response = await fetch('/assets/data/search-index.json');
    if (!response.ok) throw new Error('Failed to load search index');

    searchIndex = await response.json();

    // Configure Fuse.js for fuzzy search
    fuse = new Fuse(searchIndex, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'keywords', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'cta', weight: 0.1 }
      ],
      threshold: 0.4,          // Lower = stricter matching
      distance: 100,           // How far to search in string
      includeScore: true,
      ignoreLocation: true,    // Search entire string
      minMatchCharLength: 2,
      findAllMatches: true
    });

    // Set up input listener
    const input = document.getElementById('searchInput');
    if (input) {
      input.addEventListener('input', debounce(handleSearch, 150));

      // Handle Enter key for accessibility
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearch();
        }
      });
    }

  } catch (error) {

    showError('Unable to load search. Please try refreshing the page.');
  }
}

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Handle search input
function handleSearch() {
  const input = document.getElementById('searchInput');
  const query = input ? input.value.trim() : '';

  if (query.length === 0) {
    showInitialState();
    return;
  }

  if (query.length < 2) {
    updateStatus('Type at least 2 characters to search...');
    return;
  }

  performSearch(query);
}

// Perform the search
function performSearch(query) {
  if (!fuse) {
    showError('Search not ready. Please wait...');
    return;
  }

  let results = fuse.search(query);

  // Apply context-based filtering (e.g., exclude ports for food-only searches)
  results = filterResultsByContext(results, query);

  displayResults(results, query);
}

// Public function for popular search buttons
function doSearch(query) {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = query;
    performSearch(query);
    input.focus();
  }
}

// Display search results grouped by category with collapsible sections
function displayResults(results, query) {
  const container = document.getElementById('resultsContainer');
  const statusEl = document.getElementById('searchStatus');

  if (!container) return;

  // No results
  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h2>No results found</h2>
        <p>Try different keywords or check your spelling.</p>
        <p>Examples: "chops", "icon", "solo cruising", "drink calculator"</p>
      </div>
    `;
    if (statusEl) statusEl.textContent = `No results for "${query}"`;
    return;
  }

  // Limit results for performance
  const maxResults = 100;
  const limitedResults = results.slice(0, maxResults);

  // Group by category
  const grouped = {};
  limitedResults.forEach(result => {
    const cat = result.item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(result.item);
  });

  // Determine category order based on query type (food, ship, location, etc.)
  const categoryOrder = getCategoryOrderForQuery(query);

  // Sort categories: ordered ones first, then any others alphabetically
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Build results HTML with collapsible sections
  let html = '<div class="results-grouped">';

  sortedCategories.forEach((cat, catIndex) => {
    const items = grouped[cat];
    const categoryLabel = CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
    const pluralLabel = items.length !== 1 ? getCategoryPlural(cat) : categoryLabel;
    const isFirstCategory = catIndex === 0;

    html += `
      <details class="results-section" ${isFirstCategory ? 'open' : ''}>
        <summary class="results-section-header">
          <span class="results-section-title">${pluralLabel}</span>
          <span class="results-section-count">${items.length}</span>
        </summary>
        <div class="results-section-content">
          <div class="results-grid">
    `;

    items.forEach(item => {
      html += `
        <article class="result-card">
          <a href="${item.url}">
            <h3 class="result-title">${escapeHtml(item.title)}</h3>
          </a>
          <p class="result-description">${escapeHtml(truncate(item.description, 120))}</p>
          ${item.cta ? `<p class="result-cta">${escapeHtml(truncate(item.cta, 80))}</p>` : ''}
        </article>
      `;
    });

    html += `
          </div>
        </div>
      </details>
    `;
  });

  html += '</div>';

  container.innerHTML = html;

  // Update status
  if (statusEl) {
    const categoryCounts = sortedCategories
      .map(cat => `${grouped[cat].length} ${getCategoryPlural(cat).toLowerCase()}`)
      .join(', ');

    const totalText = results.length > maxResults
      ? `Showing ${maxResults} of ${results.length} results`
      : `${results.length} result${results.length !== 1 ? 's' : ''}`;
    statusEl.textContent = `${totalText} for "${query}"`;
  }
}

// Get plural form of category label
function getCategoryPlural(category) {
  const plurals = {
    'restaurant': 'Restaurants & Venues',
    'ship': 'Ships',
    'article': 'Articles',
    'cruise-line': 'Cruise Lines',
    'hub': 'Hubs',
    'tool': 'Tools',
    'about': 'About Pages',
    'port': 'Ports'
  };
  return plurals[category] || (CATEGORY_LABELS[category] || category) + 's';
}

// Show initial state with popular searches
function showInitialState() {
  const container = document.getElementById('resultsContainer');
  const statusEl = document.getElementById('searchStatus');

  if (container) {
    container.innerHTML = `
      <div class="initial-state" id="initialState">
        <p>Start typing to search across ${searchIndex.length} pages including ships, restaurants, articles, and tools.</p>
        <div class="popular-searches">
          <h3>Popular Searches</h3>
          <div class="popular-tags">
            <button class="popular-tag" onclick="doSearch('chops')">Chops Grille</button>
            <button class="popular-tag" onclick="doSearch('icon')">Icon of the Seas</button>
            <button class="popular-tag" onclick="doSearch('solo')">Solo Cruising</button>
            <button class="popular-tag" onclick="doSearch('drink')">Drink Calculator</button>
            <button class="popular-tag" onclick="doSearch('sushi')">Sushi</button>
            <button class="popular-tag" onclick="doSearch('grief')">Cruising After Loss</button>
            <button class="popular-tag" onclick="doSearch('wheelchair')">Accessibility</button>
          </div>
        </div>
      </div>
    `;
  }

  if (statusEl) statusEl.textContent = '';
}

// Show error message
function showError(message) {
  const container = document.getElementById('resultsContainer');
  if (container) {
    container.innerHTML = `
      <div class="no-results">
        <h2>Search Error</h2>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }
}

// Update status text
function updateStatus(message) {
  const statusEl = document.getElementById('searchStatus');
  if (statusEl) statusEl.textContent = message;
}

// Utility: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Utility: Truncate text
function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}
