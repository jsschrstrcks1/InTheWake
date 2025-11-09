/**
 * Drink Package Calculator — Application Controller (v9.003)
 * "In the Wake" — cruisinginthewake.com
 * 
 * Purpose:
 * Orchestrates state, dataset loading, FX conversion, computation (via worker or fallback),
 * rendering, and UI wiring for the Royal Caribbean drink package calculator.
 * 
 * "Whatever you do, work heartily, as for the Lord and not for men."
 * — Colossians 3:23
 * 
 * Soli Deo Gloria
 */

(function() {
  'use strict';

  /* ========================= CONSTANTS & CONFIGURATION ========================= */

  const VERSION = '9.003';
  const CONFIG = {
    DELUXE_CAP_FALLBACK: 14.00,
    GRAT_PCT_FALLBACK: 0.18,
    FX_STALE_MS: 24 * 60 * 60 * 1000, // 24 hours
    WORKER_TIMEOUT_MS: 3000,
    CALC_DEBOUNCE_MS: 150
  };

  // Dataset and manifest URLs
  let DS_URL = `/assets/data/lines/royal-caribbean.json?v=${VERSION}`; // Default, will be overridden by brand selection
  const BRANDS_MANIFEST_URL = `/assets/data/brands.json?v=${VERSION}`;
  const FX_URL = `/assets/data/fx-rates.json?v=${VERSION}`;

  // Global state
  let DATASET = null;
  let FX = null;
  let worker = null;
  let chart = null;
  let calcTimer = null;

  /* ========================= BRAND MANIFEST & SELECTOR ========================= */

  let BRANDS = [
    { id: 'royal-caribbean', label: 'Royal Caribbean', data: '/assets/data/lines/royal-caribbean.json' }
  ];
  const LS_BRAND_KEY = 'itw:brand';

  /**
   * Load the brands manifest from server
   * @returns {Promise<string>} Default brand ID from manifest
   */
  async function loadBrandsManifest() {
    try {
      const response = await fetch(BRANDS_MANIFEST_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Manifest fetch failed: ${response.status}`);
      
      const manifest = await response.json();
      if (Array.isArray(manifest?.brands) && manifest.brands.length) {
        BRANDS = manifest.brands;
      }
      return manifest?.default || 'royal-caribbean';
    } catch (err) {
      console.warn('[Brand] Manifest unavailable, using Royal Caribbean:', err.message);
      return 'royal-caribbean';
    }
  }

  /**
   * Set active brand and update DS_URL
   * @param {string} brandId - Brand identifier
   */
  function setBrand(brandId) {
    const chosen = BRANDS.find(b => b.id === brandId) || BRANDS[0];
    if (!chosen) return;
    
    // Update dataset URL with version cache-buster
    const dataPath = chosen.data || '/assets/data/lines/royal-caribbean.json';
    DS_URL = dataPath.includes('?') ? dataPath : `${dataPath}?v=${VERSION}`;
    
    // Persist to localStorage
    localStorage.setItem(LS_BRAND_KEY, chosen.id);
    
    // Update URL parameter (keep other params intact)
    const params = new URLSearchParams(location.search);
    if (chosen.id !== 'royal-caribbean') {
      params.set('brand', chosen.id);
    } else {
      params.delete('brand');
    }
    const queryString = params.toString();
    history.replaceState(null, '', queryString ? `?${queryString}` : location.pathname);
  }

  /**
   * Get brand from URL param or localStorage, with fallback
   * @param {string} defaultId - Fallback brand ID
   * @returns {string} Brand ID to use
   */
  function getBrandFromURLorLS(defaultId = 'royal-caribbean') {
    const params = new URLSearchParams(location.search);
    const fromURL = params.get('brand');
    const fromLS = localStorage.getItem(LS_BRAND_KEY);
    return fromURL || fromLS || defaultId;
  }

  /**
   * Wire up brand selector UI
   */
  function wireBrandUI() {
    const selector = document.getElementById('brand-select');
    if (!selector) return; // Graceful no-op if element missing
    
    // Populate options
    selector.innerHTML = BRANDS.map(b => 
      `<option value="${b.id}">${b.label}</option>`
    ).join('');
    
    // Set current selection
    const current = localStorage.getItem(LS_BRAND_KEY) || BRANDS[0]?.id || 'royal-caribbean';
    selector.value = current;
    
    // Handle brand changes
    selector.addEventListener('change', async () => {
      setBrand(selector.value);
      await loadDataset();     // Reload pricing for new brand
      scheduleCalc();          // Force recomputation
      window.renderAll();      // Refresh UI
    });
  }

  /* ========================= FX & CURRENCY HELPERS ========================= */

  let currentCurrency = 'USD';

  /**
   * Check if FX rates are stale
   * @returns {boolean} True if rates are older than 24 hours
   */
  function fxIsStaleNow() {
    const timestamp = FX?._ts ? new Date(FX._ts).getTime() : 0;
    return !timestamp || (Date.now() - timestamp) > CONFIG.FX_STALE_MS;
  }

  /**
   * Get approximate prefix for stale or drifted FX rates
   * @returns {string} "≈ " if stale or drift slider active, else ""
   */
  function fxApproxPrefix() {
    const driftPct = Number(store?.get?.().ui?.fxDriftPct ?? 0);
    return (driftPct !== 0 || fxIsStaleNow()) ? '≈ ' : '';
  }

  /**
   * Convert USD to target currency
   * @param {number} usdAmount - Amount in USD
   * @param {string} targetCurrency - Target currency code
   * @returns {number} Converted amount
   */
  function convertUSD(usdAmount, targetCurrency = 'USD') {
    if (targetCurrency === 'USD' || !FX) return Number(usdAmount || 0);
    const rate = Number(FX[targetCurrency] || 1);
    const drift = Number(store?.get?.().ui?.fxDriftPct ?? 0);
    const adjustedRate = rate * (1 + drift / 100);
    return Number(usdAmount || 0) * adjustedRate;
  }

  /**
   * Format money with standard symbol
   * @param {number} usdAmount - Amount in USD
   * @returns {string} Formatted currency
   */
  function money(usdAmount) {
    const converted = convertUSD(usdAmount, currentCurrency);
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currentCurrency
    }).format(converted || 0);
  }

  /**
   * Format money with narrow symbol (no trailing code)
   * @param {number} usdAmount - Amount in USD
   * @returns {string} Formatted currency with narrow symbol
   */
  function moneyInline(usdAmount) {
    try {
      const converted = convertUSD(usdAmount, currentCurrency);
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currentCurrency,
        currencyDisplay: 'narrowSymbol'
      }).format(converted || 0);
    } catch (err) {
      return money(usdAmount); // Fallback to standard formatter
    }
  }

  /**
   * Get currency code tag for once-per-block display
   * @returns {string} Currency code in parentheses
   */
  function currencyCodeTag() {
    return ` (${currentCurrency})`;
  }

  /**
   * Safe money formatter with defensive guards
   * @param {number} n - Amount to format
   * @returns {string} Formatted currency
   */
  function safeMoney(n) {
    const value = Number.isFinite(n) ? n : 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currentCurrency
      }).format(convertUSD(value, currentCurrency));
    } catch {
      return money(value);
    }
  }

  /* ========================= BREAK-EVEN HELPERS ========================= */

  /**
   * Calculate ceiling of drink count needed, with safety guards
   * @param {number} gapAmount - Money gap to close
   * @param {number} unitPrice - Price per drink
   * @returns {number} Integer drink count
   */
  function ceilDrinks(gapAmount, unitPrice) {
    const gap = Number(gapAmount || 0);
    const unit = Number(unitPrice || 0);
    if (!(unit > 0)) return 0;
    return Math.max(0, Math.ceil(gap / unit));
  }

  /* ========================= STATE MANAGEMENT ========================= */

  const store = (function() {
    let state = {
      inputs: {},
      economics: {},
      results: null,
      ui: { fxDriftPct: 0 }
    };
    const subscribers = {};

    return {
      get: () => state,
      
      patch: (key, value) => {
        state[key] = value;
        if (subscribers[key]) {
          subscribers[key].forEach(fn => fn(value));
        }
      },
      
      subscribe: (key, callback) => {
        if (!subscribers[key]) subscribers[key] = [];
        subscribers[key].push(callback);
      }
    };
  })();

  /* ========================= DATASET & FX LOADING ========================= */

  /**
   * Load cruise line pricing dataset
   */
  async function loadDataset() {
    try {
      const response = await fetch(DS_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Dataset fetch failed: ${response.status}`);
      DATASET = await response.json();
      console.log('[Dataset] Loaded:', DATASET?.meta?.line || 'Unknown');
    } catch (err) {
      console.error('[Dataset] Load failed:', err);
      DATASET = null;
    }
  }

  /**
   * Load FX rates
   */
  async function loadFX() {
    try {
      const response = await fetch(FX_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`FX fetch failed: ${response.status}`);
      FX = await response.json();
      console.log('[FX] Loaded:', FX?._ts || 'No timestamp');
    } catch (err) {
      console.error('[FX] Load failed:', err);
      FX = { USD: 1, _ts: new Date().toISOString() };
    }
  }

  /* ========================= WEB WORKER MANAGEMENT ========================= */

  /**
   * Initialize web worker
   */
  function initWorker() {
    try {
      worker = new Worker('/assets/js/drink-worker.js');
      worker.addEventListener('message', (e) => {
        if (e.data?.type === 'RESULT') {
          store.patch('results', e.data.payload);
        } else if (e.data?.type === 'ERROR') {
          console.error('[Worker] Computation error:', e.data.message);
          computeFallback();
        }
      });
      console.log('[Worker] Initialized');
    } catch (err) {
      console.warn('[Worker] Unavailable, using fallback:', err.message);
      worker = null;
    }
  }

  /**
   * Fallback computation when worker unavailable
   */
  function computeFallback() {
    if (!window.DrinkMath?.compute) {
      console.error('[Fallback] DrinkMath not available');
      return;
    }
    
    const inputs = store.get().inputs;
    const economics = store.get().economics;
    
    try {
      const results = window.DrinkMath.compute(inputs, economics);
      store.patch('results', results);
    } catch (err) {
      console.error('[Fallback] Computation failed:', err);
    }
  }

  /* ========================= COMPUTATION SCHEDULING ========================= */

  /**
   * Schedule a calculation with debounce
   */
  function scheduleCalc() {
    clearTimeout(calcTimer);
    calcTimer = setTimeout(() => {
      const inputs = store.get().inputs;
      const economics = store.get().economics;
      
      if (!economics?.pkg || !inputs) {
        console.warn('[Calc] Missing economics or inputs');
        return;
      }
      
      if (worker) {
        worker.postMessage({
          type: 'COMPUTE',
          payload: { inputs, economics }
        });
        
        // Fallback timeout
        setTimeout(() => {
          if (!store.get().results) {
            console.warn('[Worker] Timeout, using fallback');
            computeFallback();
          }
        }, CONFIG.WORKER_TIMEOUT_MS);
      } else {
        computeFallback();
      }
    }, CONFIG.CALC_DEBOUNCE_MS);
  }

  /* ========================= CHART MANAGEMENT ========================= */

  /**
   * Ensure chart is initialized (single source of truth)
   * @returns {Chart|null} Chart instance or null if unavailable
   */
  function ensureChart() {
    // Prevent double-initialization
    if (chart) return chart;
    
    // Defensive checks for canvas element
    const canvas = document.getElementById('breakeven-chart');
    if (!canvas) {
      console.error('[Chart] Canvas element #breakeven-chart not found');
      return null;
    }
    
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) {
      console.error('[Chart] 2D context unavailable on canvas');
      return null;
    }
    
    // Chart colors (hoisted for reuse)
    const colors = {
      alc: 'rgba(59, 130, 246, 0.8)',
      soda: 'rgba(139, 92, 246, 0.8)',
      refresh: 'rgba(16, 185, 129, 0.8)',
      deluxe: 'rgba(249, 115, 22, 0.8)'
    };
    
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['À-la-carte', 'Soda', 'Refreshment', 'Deluxe'],
        datasets: [{
          label: 'Total Cost',
          data: [0, 0, 0, 0],
          backgroundColor: [colors.alc, colors.soda, colors.refresh, colors.deluxe],
          borderWidth: 0,
          borderColor: []
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y || 0;
                const approx = fxApproxPrefix();
                return `${context.dataset.label}: ${approx}${moneyInline(value)}${currencyCodeTag()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => moneyInline(value)
            }
          }
        }
      }
    });
    
    return chart;
  }

  /**
   * Highlight winner bar with subtle border
   * @param {Chart} chartInstance - Chart.js instance
   * @param {string} winnerKey - Winner package key (alc|soda|refresh|deluxe)
   */
  function highlightWinnerBar(chartInstance, winnerKey) {
    if (!chartInstance || !chartInstance.data || !Array.isArray(chartInstance.data.labels)) return;
    
    const labels = chartInstance.data.labels;
    const indexMap = { 'alc': 0, 'soda': 1, 'refresh': 2, 'deluxe': 3 };
    const winnerIndex = indexMap[winnerKey] ?? -1;
    
    const dataset = chartInstance.data.datasets?.[0];
    if (!dataset) return;
    
    // Reset borders
    dataset.borderWidth = labels.map(() => 0);
    dataset.borderColor = labels.map(() => 'rgba(0,0,0,0)');
    
    // Highlight winner
    if (winnerIndex >= 0 && winnerIndex < labels.length) {
      if (!Array.isArray(dataset.borderWidth)) dataset.borderWidth = [];
      if (!Array.isArray(dataset.borderColor)) dataset.borderColor = [];
      dataset.borderWidth[winnerIndex] = 3;
      dataset.borderColor[winnerIndex] = 'rgba(24,24,27,0.55)';
    }
    
    chartInstance.update('none');
  }

  /**
   * Update chart with new results
   * @param {Object} results - Computation results
   */
  function updateChart(results) {
    const chartInstance = ensureChart();
    if (!chartInstance) return;
    
    const data = [
      results?.bars?.alc?.mean || 0,
      results?.bars?.soda?.mean || 0,
      results?.bars?.refresh?.mean || 0,
      results?.bars?.deluxe?.mean || 0
    ];
    
    chartInstance.data.datasets[0].data = data;
    highlightWinnerBar(chartInstance, results?.winnerKey);
  }

  /* ========================= INPUT VALIDATION ========================= */

  /**
   * Sanitize numeric input value
   * Allows: digits, decimal point, comma (for international formats), minus sign
   * @param {string} value - Raw input value
   * @returns {string} Sanitized value
   */
  function sanitizeNumericInput(value) {
    // Allow digits, decimal separators (. and ,), thousands separators, and minus
    return String(value).replace(/[^\d.,-]/g, '');
  }

  /**
   * Parse numeric input handling international formats
   * @param {string} value - Input value (may use . or , as decimal)
   * @returns {number} Parsed number
   */
  function parseNumericInput(value) {
    if (!value) return 0;
    
    const cleaned = String(value).trim();
    
    // Count occurrences of separators to determine format
    const dotCount = (cleaned.match(/\./g) || []).length;
    const commaCount = (cleaned.match(/,/g) || []).length;
    
    let normalized = cleaned;
    
    // German/European format: 1.234,56 → 1234.56
    if (commaCount === 1 && dotCount > 0) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    }
    // US format with thousands: 1,234.56 → 1234.56
    else if (dotCount === 1 && commaCount > 0) {
      normalized = cleaned.replace(/,/g, '');
    }
    // Only comma (assume decimal): 12,5 → 12.5
    else if (commaCount === 1 && dotCount === 0) {
      normalized = cleaned.replace(',', '.');
    }
    // Multiple commas (assume thousands): 1,234,567 → 1234567
    else if (commaCount > 1) {
      normalized = cleaned.replace(/,/g, '');
    }
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Wire numeric input validation
   * @param {HTMLInputElement} input - Input element
   */
  function wireNumericValidation(input) {
    if (!input) return;
    
    // Filter input in real-time
    input.addEventListener('input', (e) => {
      const cursorPos = e.target.selectionStart;
      const oldValue = e.target.value;
      const newValue = sanitizeNumericInput(oldValue);
      
      if (oldValue !== newValue) {
        e.target.value = newValue;
        // Restore cursor position
        e.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
      }
    });
    
    // Parse and normalize on blur
    input.addEventListener('blur', (e) => {
      const parsed = parseNumericInput(e.target.value);
      // Store the normalized value back (use standard format)
      e.target.value = parsed === 0 ? '' : String(parsed);
    });
  }

  /* ========================= UI RENDERING ========================= */

  /**
   * Render economics section
   * @param {Object} economics - Economics data
   */
  function renderEconomics(economics) {
    if (!economics) return;
    
    // Update package prices
    ['soda', 'refresh', 'deluxe'].forEach(key => {
      const priceEl = document.getElementById(`price-${key}`);
      if (priceEl && economics.pkg?.[key] != null) {
        priceEl.textContent = money(economics.pkg[key]);
      }
    });
    
    // Update caps
    const capBadge = document.getElementById('deluxe-cap-badge');
    if (capBadge && economics.deluxeCap != null) {
      const cap = Number(economics.deluxeCap);
      capBadge.textContent = `$${cap.toFixed(2)}`;
      
      // Update voucher face value inline text
      const faceInline = document.getElementById('voucher-face-inline');
      if (faceInline) {
        faceInline.textContent = `$${cap.toFixed(2)}`;
      }
    }
    
    // Update gratuity
    const gratBadge = document.getElementById('grat-badge');
    if (gratBadge && economics.gratPct != null) {
      const pct = Number(economics.gratPct * 100);
      gratBadge.textContent = `${pct.toFixed(0)}%`;
    }
  }

  /**
   * Render results section
   * @param {Object} results - Computation results
   */
  function renderResults(results) {
    if (!results) return;
    
    // Defensive UI pass: ensure minors never show "Deluxe" label
    if (Array.isArray(results?.groupRows) && results.groupRows.length) {
      results.groupRows = results.groupRows.map(row => {
        if (row?.isMinor && /deluxe/i.test(String(row.pkg || ''))) {
          return { ...row, pkg: 'Refreshment', pkgKey: 'refresh' };
        }
        return row;
      });
    }
    
    // Update winner cards
    ['soda', 'refresh', 'deluxe'].forEach(key => {
      const card = document.querySelector(`[data-card="${key}"]`);
      if (card) {
        card.classList.toggle('winner', results.winnerKey === key);
      }
    });
    
    // Update totals header
    const totalsEl = document.getElementById('results-totals');
    if (totalsEl && results.bars) {
      const winner = results.winnerKey || 'alc';
      const winnerLabels = {
        alc: 'À-la-carte',
        soda: 'Soda Package',
        refresh: 'Refreshment Package',
        deluxe: 'Deluxe Package'
      };
      const totalSpend = results.bars[winner]?.mean || 0;
      const approx = fxApproxPrefix();
      totalsEl.textContent = `Total: ${approx}${moneyInline(totalSpend)}${currencyCodeTag()} · Winner: ${winnerLabels[winner]}`;
    }
    
    // Update group rows table
    const tableBody = document.getElementById('group-rows-body');
    if (tableBody && Array.isArray(results.groupRows)) {
      tableBody.innerHTML = results.groupRows.map(row => `
        <tr>
          <td>${row.label || 'Guest'}</td>
          <td>${row.pkg || '—'}</td>
          <td>${moneyInline(row.perDay || 0)}/day</td>
          <td>${moneyInline(row.total || 0)}</td>
        </tr>
      `).join('');
    }
    
    // Render break-even helpers
    renderBreakevenHelpers(results);
    
    // Update chart
    updateChart(results);
    
    // Voucher-aware sanity guard (hint only, no forced override)
    enforceDeluxeSanityHint(results);
  }

  /**
   * Render break-even helper suggestions
   * @param {Object} results - Computation results
   */
  function renderBreakevenHelpers(results) {
    const helpersContainer = document.getElementById('breakeven-helpers');
    if (!helpersContainer || !results?.gaps) return;
    
    const economics = store.get().economics;
    const cap = Number(economics?.deluxeCap || CONFIG.DELUXE_CAP_FALLBACK);
    const grat = Number(economics?.gratPct || CONFIG.GRAT_PCT_FALLBACK);
    const capWithGrat = cap * (1 + grat);
    
    const gaps = results.gaps;
    const approx = fxApproxPrefix();
    let html = '';
    
    // Soda package helper
    if (gaps.soda > 0.5 && results.winnerKey !== 'soda') {
      const userSodas = results.drinks?.soda?.userPresent || [];
      if (userSodas.length > 0) {
        const cheapest = userSodas[0];
        const need = ceilDrinks(gaps.soda, cheapest.unit);
        html += `
          <div class="helper-block soda">
            <strong>Soda Package:</strong> 
            You're ${approx}${moneyInline(gaps.soda)} from break-even${currencyCodeTag()}.
            ${need} more ${cheapest.name} (${approx}${moneyInline(cheapest.unit)} each) would close the gap.
          </div>
        `;
      }
    }
    
    // Refreshment package helper
    if (gaps.refresh > 0.5 && results.winnerKey !== 'refresh') {
      const suggestions = results.drinks?.refresh?.suggestions || [];
      if (suggestions.length > 0) {
        const best = suggestions[0];
        const need = ceilDrinks(gaps.refresh, best.unit);
        html += `
          <div class="helper-block refresh">
            <strong>Refreshment Package:</strong> 
            You're ${approx}${moneyInline(gaps.refresh)} from break-even${currencyCodeTag()}.
            ${need} more ${best.name} (${approx}${moneyInline(best.unit)} each) would close the gap.
          </div>
        `;
      }
    }
    
    // Deluxe package helper
    if (gaps.deluxe > 0.5 && results.winnerKey !== 'deluxe') {
      const need = ceilDrinks(gaps.deluxe, capWithGrat);
      html += `
        <div class="helper-block deluxe">
          <strong>Deluxe Package:</strong> 
          You're ${approx}${moneyInline(gaps.deluxe)} from break-even${currencyCodeTag()}.
          ${need} more premium drinks (cap $${cap.toFixed(2)} + grat → ${approx}${moneyInline(capWithGrat)} each) would close the gap.
        </div>
      `;
    }
    
    helpersContainer.innerHTML = html;
  }

  /**
   * Sanity hint for Deluxe (non-destructive, UI only)
   * @param {Object} results - Computation results
   */
  function enforceDeluxeSanityHint(results) {
    const hintContainer = document.getElementById('sanity-hint');
    if (!hintContainer) return;
    
    // Skip hint when vouchers are active
    const vouchersActive = Number(results?.vouchersAppliedPerDay || 0) > 0;
    if (vouchersActive) {
      hintContainer.innerHTML = '';
      return;
    }
    
    // Check if à-la-carte exceeds Deluxe
    const economics = store.get().economics;
    const alcPerDay = Number(results?.bars?.alc?.mean || 0) / Number(store.get().inputs?.nights || 1);
    const deluxePerDay = Number(economics?.pkg?.deluxe || 0);
    
    if (deluxePerDay > 0 && alcPerDay >= deluxePerDay && results.winnerKey !== 'deluxe') {
      hintContainer.innerHTML = `
        <div class="alert alert-info xsmall">
          💡 Your à-la-carte spend appears to exceed Deluxe pricing. Consider reviewing your drink quantities.
        </div>
      `;
    } else {
      hintContainer.innerHTML = '';
    }
  }

  /* ========================= INPUT WIRING ========================= */

  /**
   * Wire all input elements
   */
  function wireInputs() {
    const inputs = store.get().inputs;
    
    // Wire numeric inputs with validation
    const numericInputs = [
      'nights',
      'adults', 'kids',
      'beer', 'wine', 'cocktails', 'shots',
      'soda', 'juice', 'smoothies', 'specialty-coffee',
      'water', 'energy', 'mocktails'
    ];
    
    numericInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        wireNumericValidation(input);
        
        input.addEventListener('input', (e) => {
          const key = id.replace(/-/g, '');
          inputs[key] = parseNumericInput(e.target.value);
          scheduleCalc();
        });
      }
    });
    
    // Wire vouchers
    const vouchersCheckbox = document.getElementById('vouchers-enabled');
    const vouchersPerDay = document.getElementById('vouchers-per-day');
    
    if (vouchersCheckbox) {
      vouchersCheckbox.addEventListener('change', (e) => {
        inputs.vouchersEnabled = e.target.checked;
        if (vouchersPerDay) vouchersPerDay.disabled = !e.target.checked;
        scheduleCalc();
      });
    }
    
    if (vouchersPerDay) {
      wireNumericValidation(vouchersPerDay);
      vouchersPerDay.addEventListener('input', (e) => {
        inputs.vouchersPerDay = parseNumericInput(e.target.value);
        scheduleCalc();
      });
    }
    
    // Wire currency selector
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        scheduleCalc();
      });
    }
  }

  /**
   * Wire persona cards
   */
  function wirePersonaCards() {
    document.querySelectorAll('[data-persona]').forEach(card => {
      card.addEventListener('click', () => {
        const personaKey = card.getAttribute('data-persona');
        if (typeof window.applyPersona === 'function' && personaKey) {
          window.applyPersona(personaKey);
        } else {
          console.warn('[Persona] applyPersona not available or invalid key:', personaKey);
        }
      });
    });
  }

  /**
   * Wire preset buttons
   */
  function wirePresetButtons() {
    document.querySelectorAll('[data-preset]').forEach(button => {
      button.addEventListener('click', () => {
        const presetKey = button.getAttribute('data-preset');
        if (typeof window.loadPreset === 'function' && presetKey) {
          window.loadPreset(presetKey);
        } else {
          console.warn('[Preset] loadPreset not available or invalid key:', presetKey);
        }
      });
    });
  }

  /* ========================= STATE SUBSCRIPTIONS ========================= */

  /**
   * Subscribe to economics changes
   */
  store.subscribe('economics', (economics) => {
    renderEconomics(economics);
    scheduleCalc();
  });

  /**
   * Subscribe to results changes
   */
  store.subscribe('results', (results) => {
    renderResults(results);
  });

  /* ========================= BOOT SEQUENCE ========================= */

  /**
   * Initialize application
   */
  async function boot() {
    console.log(`[Boot] Drink Package Calculator v${VERSION}`);
    
    // 1. Load brand manifest and set active brand
    const defaultBrand = await loadBrandsManifest();
    setBrand(getBrandFromURLorLS(defaultBrand));
    
    // 2. Load dataset and FX rates
    await Promise.all([
      loadDataset(),
      loadFX()
    ]);
    
    // 3. Initialize worker
    initWorker();
    
    // 4. Wire brand selector
    wireBrandUI();
    
    // 5. Parse dataset into economics
    if (DATASET?.pricing) {
      const pricing = DATASET.pricing;
      store.patch('economics', {
        pkg: {
          soda: Number(pricing.soda || 0),
          refresh: Number(pricing.refreshment || 0),
          deluxe: Number(pricing.deluxe || 0)
        },
        deluxeCap: Number(pricing.deluxe_cap || CONFIG.DELUXE_CAP_FALLBACK),
        gratPct: Number(pricing.gratuity || CONFIG.GRAT_PCT_FALLBACK)
      });
    }
    
    // 6. Initialize inputs from defaults or localStorage
    store.patch('inputs', {
      nights: 7,
      adults: 2,
      kids: 0,
      beer: 0,
      wine: 0,
      cocktails: 0,
      shots: 0,
      soda: 0,
      juice: 0,
      smoothies: 0,
      specialtycoffee: 0,
      water: 0,
      energy: 0,
      mocktails: 0,
      vouchersEnabled: false,
      vouchersPerDay: 0
    });
    
    // 7. Wire UI
    wireInputs();
    wirePersonaCards();
    wirePresetButtons();
    
    // 8. Initial calculation
    scheduleCalc();
    
    // 9. Expose renderAll globally for external triggers
    window.renderAll = () => {
      const results = store.get().results;
      const economics = store.get().economics;
      if (economics) renderEconomics(economics);
      if (results) renderResults(results);
    };
    
    console.log('[Boot] Ready');
  }

  /* ========================= INITIALIZATION ========================= */

  // Boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();

/**
 * Soli Deo Gloria
 * 
 * Every pixel and part of this project is offered as worship to God,
 * in gratitude for the beautiful things He has created for us to enjoy.
 */
