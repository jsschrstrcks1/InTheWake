/**
 * Ship Size Atlas Module v1.0.0
 * Soli Deo Gloria
 *
 * Features:
 * - Load and display ship size data from JSON
 * - Filter by parent group, brand, size tier, status
 * - Sort by GT, passengers, length, year, name
 * - Three views: Ranked List, Ships by Brand, Master Table
 * - Compare up to 5 ships side-by-side
 * - Accessibility: keyboard navigation, ARIA live regions
 */

(function() {
  'use strict';

  // State
  let allShips = [];
  let filteredShips = [];
  let brands = [];
  let parentGroups = [];
  let compareList = [];
  const MAX_COMPARE = 5;

  // DOM Elements
  const elements = {
    search: null,
    searchClear: null,
    groupFilter: null,
    brandFilter: null,
    sizeFilter: null,
    sortSelect: null,
    statusFilter: null,
    resetBtn: null,
    shipCount: null,
    tabs: null,
    panels: null,
    rankedList: null,
    brandPanels: null,
    tableBody: null,
    compareSection: null,
    compareTray: null,
    compareClearBtn: null,
    railCompareCount: null,
    railCompareClear: null,
    railShipCount: null,
    railLastUpdated: null,
    a11yStatus: null
  };

  // Size tier thresholds (by passenger double occupancy)
  const SIZE_TIERS = {
    mega: { min: 4000, label: 'Mega' },
    large: { min: 2500, max: 4000, label: 'Large' },
    mid: { min: 1000, max: 2500, label: 'Mid-Size' },
    small: { max: 1000, label: 'Small' }
  };

  /**
   * Initialize the atlas
   */
  async function init() {
    cacheElements();
    attachEventListeners();
    await loadData();
    render();
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.search = document.getElementById('atlas-search');
    elements.searchClear = document.getElementById('atlas-search-clear');
    elements.groupFilter = document.getElementById('atlas-group-filter');
    elements.brandFilter = document.getElementById('atlas-brand-filter');
    elements.sizeFilter = document.getElementById('atlas-size-filter');
    elements.sortSelect = document.getElementById('atlas-sort');
    elements.statusFilter = document.getElementById('atlas-status-filter');
    elements.resetBtn = document.getElementById('atlas-reset');
    elements.shipCount = document.getElementById('atlas-ship-count');
    elements.tabs = document.querySelectorAll('.atlas-tab');
    elements.panels = document.querySelectorAll('.atlas-panel');
    elements.rankedList = document.getElementById('atlas-ranked-list');
    elements.brandPanels = document.getElementById('atlas-brand-panels');
    elements.tableBody = document.getElementById('atlas-table-body');
    elements.compareSection = document.getElementById('atlas-compare-section');
    elements.compareTray = document.getElementById('atlas-compare-tray');
    elements.compareClearBtn = document.getElementById('atlas-compare-clear');
    elements.railCompareCount = document.getElementById('rail-compare-count');
    elements.railCompareClear = document.getElementById('rail-compare-clear');
    elements.railShipCount = document.getElementById('rail-ship-count');
    elements.railLastUpdated = document.getElementById('rail-last-updated');
    elements.a11yStatus = document.getElementById('a11y-status');
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    // Search
    if (elements.search) {
      elements.search.addEventListener('input', debounce(handleSearch, 300));
    }
    if (elements.searchClear) {
      elements.searchClear.addEventListener('click', clearSearch);
    }

    // Filters
    if (elements.groupFilter) {
      elements.groupFilter.addEventListener('change', handleGroupChange);
    }
    if (elements.brandFilter) {
      elements.brandFilter.addEventListener('change', applyFilters);
    }
    if (elements.sizeFilter) {
      elements.sizeFilter.addEventListener('change', applyFilters);
    }
    if (elements.statusFilter) {
      elements.statusFilter.addEventListener('change', applyFilters);
    }
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', applyFilters);
    }
    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', resetFilters);
    }

    // Tabs
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.id));
    });

    // Compare clear buttons
    if (elements.compareClearBtn) {
      elements.compareClearBtn.addEventListener('click', clearCompare);
    }
    if (elements.railCompareClear) {
      elements.railCompareClear.addEventListener('click', clearCompare);
    }

    // Table header sorting
    document.querySelectorAll('.atlas-table th.sortable').forEach(th => {
      th.addEventListener('click', () => handleTableSort(th.dataset.sort));
    });
  }

  /**
   * Load data from JSON files
   */
  async function loadData() {
    try {
      const [shipsRes, brandsRes, groupsRes] = await Promise.all([
        fetch('/data/atlas/ship-size-atlas.json'),
        fetch('/data/atlas/brands.json'),
        fetch('/data/atlas/parent_groups.json')
      ]);

      const shipsData = await shipsRes.json();
      const brandsData = await brandsRes.json();
      const groupsData = await groupsRes.json();

      allShips = shipsData.ships || [];
      brands = brandsData.brands || [];
      parentGroups = groupsData.parent_groups || [];

      // Update metadata display
      if (elements.railShipCount) {
        elements.railShipCount.textContent = allShips.length;
      }
      if (elements.railLastUpdated) {
        elements.railLastUpdated.textContent = shipsData.last_updated || 'Unknown';
      }

      // Populate brand filter
      populateBrandFilter();

      // Initial filter
      applyFilters();

      announce(`Ship Size Atlas loaded with ${allShips.length} ships`);
    } catch (error) {
      console.error('Failed to load ship data:', error);
      showError('Unable to load ship data. Please refresh the page.');
    }
  }

  /**
   * Populate brand filter based on selected group
   */
  function populateBrandFilter(groupId = 'all') {
    if (!elements.brandFilter) return;

    const filteredBrands = groupId === 'all'
      ? brands.filter(b => b.included_in_atlas_v1)
      : brands.filter(b => b.parent_group_id === groupId && b.included_in_atlas_v1);

    elements.brandFilter.innerHTML = '<option value="all">All Brands</option>';
    filteredBrands
      .sort((a, b) => a.ui_order - b.ui_order)
      .forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = brand.display_name;
        elements.brandFilter.appendChild(option);
      });
  }

  /**
   * Handle parent group change
   */
  function handleGroupChange() {
    const groupId = elements.groupFilter.value;
    populateBrandFilter(groupId);
    applyFilters();
  }

  /**
   * Handle search input
   */
  function handleSearch() {
    const query = elements.search.value.trim().toLowerCase();
    elements.searchClear.classList.toggle('hidden', !query);
    applyFilters();
  }

  /**
   * Clear search
   */
  function clearSearch() {
    elements.search.value = '';
    elements.searchClear.classList.add('hidden');
    applyFilters();
  }

  /**
   * Apply all filters and re-render
   */
  function applyFilters() {
    const searchQuery = elements.search?.value.trim().toLowerCase() || '';
    const groupId = elements.groupFilter?.value || 'all';
    const brandId = elements.brandFilter?.value || 'all';
    const sizeFilter = elements.sizeFilter?.value || 'all';
    const statusFilter = elements.statusFilter?.value || 'operating';
    const sortValue = elements.sortSelect?.value || 'gt-desc';

    // Filter ships
    filteredShips = allShips.filter(ship => {
      // Search filter
      if (searchQuery && !ship.name_current.toLowerCase().includes(searchQuery)) {
        return false;
      }

      // Group filter
      if (groupId !== 'all' && ship.parent_group !== groupId) {
        return false;
      }

      // Brand filter
      if (brandId !== 'all' && ship.brand !== brandId) {
        return false;
      }

      // Size filter
      if (sizeFilter !== 'all') {
        const tier = getShipSizeTier(ship);
        if (tier !== sizeFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && ship.status !== statusFilter) {
        return false;
      }

      return true;
    });

    // Sort ships
    sortShips(sortValue);

    // Update count
    updateShipCount();

    // Render current view
    render();
  }

  /**
   * Get ship size tier
   */
  function getShipSizeTier(ship) {
    const pax = ship.pax_double || ship.pax_max || 0;
    if (pax >= SIZE_TIERS.mega.min) return 'mega';
    if (pax >= SIZE_TIERS.large.min) return 'large';
    if (pax >= SIZE_TIERS.mid.min) return 'mid';
    return 'small';
  }

  /**
   * Sort ships
   */
  function sortShips(sortValue) {
    const [field, direction] = sortValue.split('-');
    const multiplier = direction === 'desc' ? -1 : 1;

    filteredShips.sort((a, b) => {
      let aVal, bVal;

      switch (field) {
        case 'gt':
          aVal = a.gt || 0;
          bVal = b.gt || 0;
          break;
        case 'pax':
          aVal = a.pax_double || a.pax_max || 0;
          bVal = b.pax_double || b.pax_max || 0;
          break;
        case 'length':
          aVal = a.length_m || 0;
          bVal = b.length_m || 0;
          break;
        case 'year':
          aVal = a.year_built || 0;
          bVal = b.year_built || 0;
          break;
        case 'name':
          return multiplier * a.name_current.localeCompare(b.name_current);
        default:
          aVal = a.gt || 0;
          bVal = b.gt || 0;
      }

      return multiplier * (bVal - aVal);
    });
  }

  /**
   * Update ship count display
   */
  function updateShipCount() {
    if (elements.shipCount) {
      const total = allShips.length;
      const showing = filteredShips.length;
      elements.shipCount.textContent = showing === total
        ? `${total} ships`
        : `${showing} of ${total} ships`;
    }
  }

  /**
   * Reset all filters
   */
  function resetFilters() {
    if (elements.search) elements.search.value = '';
    if (elements.searchClear) elements.searchClear.classList.add('hidden');
    if (elements.groupFilter) elements.groupFilter.value = 'all';
    if (elements.brandFilter) {
      populateBrandFilter('all');
      elements.brandFilter.value = 'all';
    }
    if (elements.sizeFilter) elements.sizeFilter.value = 'all';
    if (elements.statusFilter) elements.statusFilter.value = 'operating';
    if (elements.sortSelect) elements.sortSelect.value = 'gt-desc';

    applyFilters();
    announce('Filters cleared');
  }

  /**
   * Switch tab
   */
  function switchTab(tabId) {
    // Update tab states
    elements.tabs.forEach(tab => {
      const isActive = tab.id === tabId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update panel visibility
    const panelId = tabId.replace('tab-', 'panel-');
    elements.panels.forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== panelId);
    });

    // Re-render the active view
    render();
  }

  /**
   * Main render function
   */
  function render() {
    const activeTab = document.querySelector('.atlas-tab.active');
    if (!activeTab) return;

    switch (activeTab.id) {
      case 'tab-ranked':
        renderRankedList();
        break;
      case 'tab-brand':
        renderBrandPanels();
        break;
      case 'tab-table':
        renderMasterTable();
        break;
    }

    renderCompareSection();
  }

  /**
   * Render ranked list view
   */
  function renderRankedList() {
    if (!elements.rankedList) return;

    if (filteredShips.length === 0) {
      elements.rankedList.innerHTML = `
        <div class="atlas-empty-state">
          <p>No ships match your filters.</p>
          <button type="button" class="atlas-btn" onclick="document.getElementById('atlas-reset').click()">Clear Filters</button>
        </div>
      `;
      return;
    }

    const maxGT = Math.max(...filteredShips.map(s => s.gt || 0));

    elements.rankedList.innerHTML = filteredShips.map((ship, index) => {
      const barWidth = maxGT > 0 ? ((ship.gt || 0) / maxGT * 100) : 0;
      const brand = brands.find(b => b.id === ship.brand);
      const tier = getShipSizeTier(ship);
      const isCompared = compareList.some(s => s.ship_id === ship.ship_id);

      return `
        <article class="atlas-ranked-item" data-ship-id="${escapeHtml(ship.ship_id)}">
          <div class="atlas-ranked-rank">${index + 1}</div>
          <div class="atlas-ranked-info">
            <div class="atlas-ranked-header">
              <h3 class="atlas-ranked-name">${escapeHtml(ship.name_current)}</h3>
              <span class="atlas-ranked-brand">${escapeHtml(brand?.display_name || ship.brand)}</span>
            </div>
            <div class="atlas-ranked-bar-container">
              <div class="atlas-ranked-bar tier-${tier}" style="width: ${barWidth}%"></div>
            </div>
            <div class="atlas-ranked-stats">
              <span class="atlas-stat"><strong>${formatNumber(ship.gt)}</strong> GT</span>
              <span class="atlas-stat"><strong>${formatNumber(ship.pax_double || ship.pax_max)}</strong> guests</span>
              <span class="atlas-stat"><strong>${ship.length_m || '—'}</strong>m</span>
              <span class="atlas-stat">${ship.year_built || '—'}</span>
              ${ship.confidence ? `<span class="badge badge-${escapeHtml(ship.confidence)}">${escapeHtml(ship.confidence)}</span>` : ''}
            </div>
          </div>
          <div class="atlas-ranked-actions">
            <button type="button"
                    class="atlas-btn atlas-btn-sm ${isCompared ? 'atlas-btn-active' : ''}"
                    onclick="window.atlasToggleCompare('${escapeHtml(ship.ship_id)}')"
                    aria-pressed="${isCompared}">
              ${isCompared ? '✓ Compare' : '+ Compare'}
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Render ships by brand view
   */
  function renderBrandPanels() {
    if (!elements.brandPanels) return;

    // Group ships by brand
    const shipsByBrand = {};
    filteredShips.forEach(ship => {
      if (!shipsByBrand[ship.brand]) {
        shipsByBrand[ship.brand] = [];
      }
      shipsByBrand[ship.brand].push(ship);
    });

    // Sort ships within each brand by GT
    Object.keys(shipsByBrand).forEach(brandId => {
      shipsByBrand[brandId].sort((a, b) => (b.gt || 0) - (a.gt || 0));
    });

    // Get active brands and sort by their order
    const activeBrands = brands
      .filter(b => shipsByBrand[b.id]?.length > 0)
      .sort((a, b) => a.ui_order - b.ui_order);

    if (activeBrands.length === 0) {
      elements.brandPanels.innerHTML = `
        <div class="atlas-empty-state">
          <p>No ships match your filters.</p>
          <button type="button" class="atlas-btn" onclick="document.getElementById('atlas-reset').click()">Clear Filters</button>
        </div>
      `;
      return;
    }

    elements.brandPanels.innerHTML = activeBrands.map(brand => {
      const ships = shipsByBrand[brand.id];
      const parentGroup = parentGroups.find(g => g.id === brand.parent_group_id);

      return `
        <section class="atlas-brand-panel" aria-labelledby="brand-${escapeHtml(brand.id)}">
          <header class="atlas-brand-header">
            <h3 id="brand-${escapeHtml(brand.id)}">${escapeHtml(brand.display_name)}</h3>
            <span class="atlas-brand-meta">${escapeHtml(parentGroup?.short_name || '')} · ${ships.length} ship${ships.length !== 1 ? 's' : ''}</span>
          </header>
          <div class="atlas-brand-ships">
            ${ships.map(ship => {
              const tier = getShipSizeTier(ship);
              const isCompared = compareList.some(s => s.ship_id === ship.ship_id);
              return `
                <div class="atlas-brand-ship tier-${tier}">
                  <div class="atlas-brand-ship-info">
                    <strong>${escapeHtml(ship.name_current)}</strong>
                    <span class="tiny">${formatNumber(ship.gt)} GT · ${formatNumber(ship.pax_double || ship.pax_max)} guests · ${ship.year_built || '—'}</span>
                  </div>
                  <button type="button"
                          class="atlas-btn atlas-btn-sm ${isCompared ? 'atlas-btn-active' : ''}"
                          onclick="window.atlasToggleCompare('${escapeHtml(ship.ship_id)}')"
                          aria-pressed="${isCompared}">
                    ${isCompared ? '✓' : '+'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }).join('');
  }

  /**
   * Render master table view
   */
  function renderMasterTable() {
    if (!elements.tableBody) return;

    if (filteredShips.length === 0) {
      elements.tableBody.innerHTML = `
        <tr><td colspan="10" class="atlas-empty-state">No ships match your filters.</td></tr>
      `;
      return;
    }

    elements.tableBody.innerHTML = filteredShips.map(ship => {
      const brand = brands.find(b => b.id === ship.brand);
      const isCompared = compareList.some(s => s.ship_id === ship.ship_id);

      return `
        <tr data-ship-id="${escapeHtml(ship.ship_id)}">
          <td><strong>${escapeHtml(ship.name_current)}</strong></td>
          <td>${escapeHtml(brand?.display_name || ship.brand)}</td>
          <td>${formatNumber(ship.gt)}</td>
          <td>${ship.length_m || '—'}</td>
          <td>${ship.beam_m || '—'}</td>
          <td>${formatNumber(ship.pax_double) || '—'}</td>
          <td>${formatNumber(ship.pax_max) || '—'}</td>
          <td>${ship.crew || '—'}</td>
          <td>${ship.year_built || '—'}</td>
          <td>
            <button type="button"
                    class="atlas-btn atlas-btn-sm ${isCompared ? 'atlas-btn-active' : ''}"
                    onclick="window.atlasToggleCompare('${escapeHtml(ship.ship_id)}')"
                    aria-pressed="${isCompared}">
              ${isCompared ? '✓' : '+'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Handle table column sort
   */
  function handleTableSort(field) {
    const currentSort = elements.sortSelect?.value || 'gt-desc';
    const [currentField, currentDir] = currentSort.split('-');

    let newDir = 'desc';
    if (currentField === field) {
      newDir = currentDir === 'desc' ? 'asc' : 'desc';
    }

    // Map table column names to sort values
    const sortMap = {
      name: 'name',
      brand: 'name', // Sort by name for brand (brand filter handles brand grouping)
      gt: 'gt',
      length: 'length',
      beam: 'gt', // No beam sort, default to GT
      pax_double: 'pax',
      pax_max: 'pax',
      crew: 'gt', // No crew sort, default to GT
      year_built: 'year'
    };

    const sortField = sortMap[field] || 'gt';
    if (elements.sortSelect) {
      elements.sortSelect.value = `${sortField}-${newDir}`;
      applyFilters();
    }

    // Update column header indicators
    document.querySelectorAll('.atlas-table th.sortable').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      if (th.dataset.sort === field) {
        th.classList.add(`sorted-${newDir}`);
      }
    });
  }

  /**
   * Toggle ship in compare list
   */
  function toggleCompare(shipId) {
    const ship = allShips.find(s => s.ship_id === shipId);
    if (!ship) return;

    const existingIndex = compareList.findIndex(s => s.ship_id === shipId);

    if (existingIndex >= 0) {
      compareList.splice(existingIndex, 1);
      announce(`${ship.name_current} removed from comparison`);
    } else {
      if (compareList.length >= MAX_COMPARE) {
        announce(`Maximum ${MAX_COMPARE} ships can be compared. Remove a ship first.`);
        return;
      }
      compareList.push(ship);
      announce(`${ship.name_current} added to comparison`);
    }

    render();
  }

  // Expose to window for onclick handlers
  window.atlasToggleCompare = toggleCompare;

  /**
   * Clear compare list
   */
  function clearCompare() {
    compareList = [];
    announce('Comparison cleared');
    render();
  }

  /**
   * Render compare section
   */
  function renderCompareSection() {
    // Update rail compare count
    if (elements.railCompareCount) {
      elements.railCompareCount.textContent = compareList.length === 0
        ? 'No ships selected'
        : `${compareList.length} ship${compareList.length !== 1 ? 's' : ''} selected`;
    }

    // Enable/disable clear buttons
    if (elements.railCompareClear) {
      elements.railCompareClear.disabled = compareList.length === 0;
    }

    // Show/hide compare section
    if (elements.compareSection) {
      elements.compareSection.classList.toggle('hidden', compareList.length === 0);
    }

    // Render compare cards
    if (elements.compareTray && compareList.length > 0) {
      elements.compareTray.innerHTML = compareList.map(ship => {
        const brand = brands.find(b => b.id === ship.brand);
        const tier = getShipSizeTier(ship);

        return `
          <div class="atlas-compare-card tier-${tier}">
            <button type="button"
                    class="atlas-compare-remove"
                    onclick="window.atlasToggleCompare('${escapeHtml(ship.ship_id)}')"
                    aria-label="Remove ${escapeHtml(ship.name_current)} from comparison">×</button>
            <h4>${escapeHtml(ship.name_current)}</h4>
            <p class="tiny muted">${escapeHtml(brand?.display_name || ship.brand)}</p>
            <dl class="atlas-compare-stats">
              <dt>GT</dt>
              <dd>${formatNumber(ship.gt)}</dd>
              <dt>Guests (DO)</dt>
              <dd>${formatNumber(ship.pax_double) || '—'}</dd>
              <dt>Guests (Max)</dt>
              <dd>${formatNumber(ship.pax_max) || '—'}</dd>
              <dt>Length</dt>
              <dd>${ship.length_m ? `${ship.length_m}m` : '—'}</dd>
              <dt>Beam</dt>
              <dd>${ship.beam_m ? `${ship.beam_m}m` : '—'}</dd>
              <dt>Crew</dt>
              <dd>${ship.crew || '—'}</dd>
              <dt>Built</dt>
              <dd>${ship.year_built || '—'}</dd>
            </dl>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Format number with commas
   */
  function formatNumber(num) {
    if (num === null || num === undefined) return null;
    return num.toLocaleString();
  }

  /**
   * Escape HTML entities to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Show error message
   */
  function showError(message) {
    if (elements.rankedList) {
      elements.rankedList.innerHTML = `<div class="atlas-error"><p>${escapeHtml(message)}</p></div>`;
    }
    if (elements.brandPanels) {
      elements.brandPanels.innerHTML = `<div class="atlas-error"><p>${escapeHtml(message)}</p></div>`;
    }
    if (elements.tableBody) {
      elements.tableBody.innerHTML = `<tr><td colspan="10" class="atlas-error">${escapeHtml(message)}</td></tr>`;
    }
  }

  /**
   * Announce message to screen readers
   */
  function announce(message) {
    if (elements.a11yStatus) {
      elements.a11yStatus.textContent = message;
    }
  }

  /**
   * Debounce helper
   */
  function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
