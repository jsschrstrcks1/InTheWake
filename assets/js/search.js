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

// Display search results
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
  const maxResults = 50;
  const displayResults = results.slice(0, maxResults);

  // Group by category for better display
  const grouped = {};
  displayResults.forEach(result => {
    const cat = result.item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(result.item);
  });

  // Build results HTML
  let html = '<div class="results-grid">';

  displayResults.forEach(result => {
    const item = result.item;
    const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

    html += `
      <article class="result-card">
        <a href="${item.url}">
          <span class="result-category">${categoryLabel}</span>
          <h3 class="result-title">${escapeHtml(item.title)}</h3>
        </a>
        <p class="result-description">${escapeHtml(truncate(item.description, 100))}</p>
        <p class="result-cta">${escapeHtml(item.cta)}</p>
      </article>
    `;
  });

  html += '</div>';

  // Show category summary
  const categoryCounts = Object.entries(grouped)
    .map(([cat, items]) => `${items.length} ${CATEGORY_LABELS[cat] || cat}${items.length !== 1 ? 's' : ''}`)
    .join(', ');

  container.innerHTML = html;

  if (statusEl) {
    const totalText = results.length > maxResults
      ? `Showing ${maxResults} of ${results.length} results`
      : `${results.length} result${results.length !== 1 ? 's' : ''}`;
    statusEl.textContent = `${totalText} for "${query}" (${categoryCounts})`;
  }
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
