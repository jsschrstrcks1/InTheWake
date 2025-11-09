/**
 * Royal Caribbean Drink Package Calculator - Application Controller
 * Version: 10.0.0
 * Soli Deo Gloria ✝️
 * 
 * ARCHITECTURE:
 * - Thin controller layer, NO business logic
 * - All math done by engine via worker
 * - UI reads from store, renders results
 * - Input → Store → Worker → Engine → Store → UI
 * 
 * CONTRACTS:
 * - window.ITW.store: {get, subscribe, patch}
 * - window.ITW.money: (amount, opts) => string
 * - window.ITW.getCurrency: () => string
 */

(() => {
  'use strict';

  const VERSION = 'v10.0.0';

  // ==================== CONFIGURATION ====================
  const CONFIG = {
    WORKER_URL: `/assets/js/drink-worker.js?v=${VERSION}`,
    DS_URL: `/assets/data/lines/royal-caribbean.json?v=${VERSION}`,
    FX_API: 'https://api.frankfurter.app/latest?from=USD',
    
    WORKER_TIMEOUT_MS: 3000,
    CALC_DEBOUNCE_MS: 100,
    RATE_LIMIT_WINDOW_MS: 10000,
    RATE_LIMIT_MAX_CALCS: 50,
    
    MAX_GUESTS_TOTAL: 6,
    MAX_INPUT_LENGTH: 8,
    MAX_INPUT_VALUE: 99999,
    
    FX_STALE_HOURS: 24,
    DELUXE_CAP_FALLBACK: 14.0
  };

  // ==================== UTILITY FUNCTIONS ====================
  
  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function round2(n) {
    return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
  }

  /**
   * Locale-safe number parser (C3)
   * Handles: "1,000" "1.000" "1 000" → 1000
   */
  function parseNumericInput(value) {
    if (typeof value === 'number') return value;
    
    let str = String(value).trim();
    
    // Remove currency symbols
    str = str.replace(/[$€£¥₹]/g, '');
    
    // Handle thousands separators
    // "1,000" or "1.000" or "1 000" → remove separator before 3 digits
    str = str.replace(/[,.\s](?=\d{3}(?!\d))/g, '');
    
    // Replace remaining commas with dots (for decimal)
    str = str.replace(/,/g, '.');
    
    // Remove non-numeric except dot and minus
    str = str.replace(/[^\d.-]/g, '');
    
    const num = parseFloat(str);
    return Number.isFinite(num) ? num : 0;
  }

  /**
   * Sanitize text input (C11 Layer 2)
   */
  function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .substring(0, CONFIG.MAX_INPUT_LENGTH * 10);
  }

  /**
   * Sanitize input value (C11 Layer 4)
   */
  function sanitizeInput(value, type = 'number') {
    if (type === 'number') {
      const num = parseNumericInput(value);
      return clamp(num, 0, CONFIG.MAX_INPUT_VALUE);
    }
    return sanitizeText(value);
  }

  /**
   * Safe DOM element creation (C11 Layer 6)
   */
  function createElement(tag, attrs = {}, content = '') {
    const el = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else {
        el.setAttribute(key, String(value));
      }
    }
    
    if (content) {
      el.textContent = String(content);
    }
    
    return el;
  }

  /**
   * Money formatter - Single source of truth (C1)
   */
  function formatMoney(amount, options = {}) {
    const {
      currency = currentCurrency,
      showSymbol = true,
      approximate = false
    } = options;
    
    let prefix = '';
    if (approximate || (currency !== 'USD' && fxIsStale())) {
      prefix = '≈ ';
    }
    
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
      return prefix + formatted;
    } catch (err) {
      console.warn('[Money] Format error:', currency, err);
      const symbol = currency === 'USD' ? '$' :
                     currency === 'EUR' ? '€' :
                     currency === 'GBP' ? '£' : currency + ' ';
      return prefix + symbol + amount.toFixed(2);
    }
  }

  // ==================== SAFE STORAGE (C11 Layer 1) ====================
  
  const SafeStorage = {
    get(key) {
      try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        
        // Prevent prototype pollution
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          delete parsed.__proto__;
          delete parsed.constructor;
          delete parsed.prototype;
        }
        
        return parsed;
      } catch (err) {
        console.warn('[SafeStorage] Read error:', key, err);
        return null;
      }
    },
    
    set(key, value) {
      try {
        const json = JSON.stringify(value);
        // Check size (5MB limit typical)
        if (json.length > 5 * 1024 * 1024) {
          console.warn('[SafeStorage] Value too large:', key);
          return false;
        }
        localStorage.setItem(key, json);
        return true;
      } catch (err) {
        console.warn('[SafeStorage] Write error:', key, err);
        return false;
      }
    },
    
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (err) {
        return false;
      }
    }
  };

  // ==================== RATE LIMITER (C11, H5) ====================
  
  const RateLimiter = {
    calls: [],
    
    check() {
      const now = Date.now();
      this.calls = this.calls.filter(t => now - t < CONFIG.RATE_LIMIT_WINDOW_MS);
      
      if (this.calls.length >= CONFIG.RATE_LIMIT_MAX_CALCS) {
        console.warn('[RateLimiter] Too many calculations, throttling');
        return false;
      }
      
      this.calls.push(now);
      return true;
    },
    
    reset() {
      this.calls = [];
    }
  };

  // ==================== STATE STORE (C5) ====================
  
  function createStore(initialState) {
    let state = { ...initialState };
    const subscribers = {};

    return {
      get(key) {
        if (key) {
          const value = state[key];
          // Return deep copy to prevent mutations (C5)
          if (value && typeof value === 'object') {
            return JSON.parse(JSON.stringify(value));
          }
          return value;
        }
        // Return snapshot of entire state
        return JSON.parse(JSON.stringify(state));
      },

      patch(key, value) {
        const oldValue = state[key];
        state[key] = value;

        if (subscribers[key]) {
          subscribers[key].forEach(fn => {
            try {
              fn(value, oldValue);
            } catch (err) {
              console.error('[Store] Subscriber error:', err);
            }
          });
        }
      },

      subscribe(key, callback) {
        if (!subscribers[key]) {
          subscribers[key] = [];
        }
        subscribers[key].push(callback);
        
        // Return unsubscribe function (H8)
        return () => {
          const idx = subscribers[key].indexOf(callback);
          if (idx > -1) subscribers[key].splice(idx, 1);
        };
      }
    };
  }

  // ==================== GLOBAL STATE ====================
  
  const store = createStore({
    inputs: {
      days: 7,
      seaDays: 7,
      seaApply: true,
      seaWeight: 20,
      adults: 2,
      minors: 0,
      drinks: {
        soda: 0, coffee: 0, teaprem: 0, freshjuice: 0,
        mocktail: 0, energy: 0, milkshake: 0, bottledwater: 0,
        beer: 0, wine: 0, cocktail: 0, spirits: 0
      },
      vouchers: []
    },
    economics: {
      pkg: { soda: 13.99, refresh: 34.00, deluxe: 85.00 },
      grat: 0.18,
      deluxeCap: CONFIG.DELUXE_CAP_FALLBACK,
      minorDiscount: 0
    },
    results: null,
    ui: {
      chartReady: false,
      fxStale: false,
      workerReady: false
    }
  });

  // Expose store globally
  window.__itwStore = store;

  let currentCurrency = 'USD';
  let dataset = null;
  let fxRates = null;
  let worker = null;
  let workerReady = false;
  let calcId = 0;
  let calcTimeout = null;
  let calcDebounceTimeout = null;

  // ==================== WORKER SETUP (C2, H7) ====================
  
  function initWorker() {
    if (!('Worker' in window)) {
      console.warn('[Worker] Not supported');
      return;
    }

    try {
      worker = new Worker(CONFIG.WORKER_URL);
      
      worker.addEventListener('message', (e) => {
        const { type, payload, id } = e.data || {};
        
        // Validate message structure (C11 Layer 7)
        if (!type || typeof type !== 'string') {
          console.warn('[Worker] Invalid message type');
          return;
        }
        
        if (type === 'ready') {
          workerReady = true;
          store.patch('ui', { ...store.get('ui'), workerReady: true });
          console.log('[Worker] ✓ Ready');
          return;
        }
        
        if (type === 'result') {
          clearTimeout(calcTimeout);
          
          if (!payload || typeof payload !== 'object') {
            console.warn('[Worker] Invalid payload');
            return;
          }
          
          console.log(`[Worker] ✓ Result (${Date.now() - (window.__lastCalcStart || Date.now())}ms)`);
          store.patch('results', payload);
          render();
        }
        
        if (type === 'error') {
          clearTimeout(calcTimeout);
          console.error('[Worker] Error:', payload);
          // Could show error toast here
        }
      });

      worker.addEventListener('error', (err) => {
        console.error('[Worker] Error:', err);
        workerReady = false;
        store.patch('ui', { ...store.get('ui'), workerReady: false });
      });

    } catch (err) {
      console.error('[Worker] Init failed:', err);
    }
  }

  // ==================== CALCULATION TRIGGER ====================
  
  function scheduleCalc() {
    // H5: Rate limiting
    if (!RateLimiter.check()) {
      console.warn('[Calc] Rate limited');
      return;
    }

    clearTimeout(calcDebounceTimeout);
    
    calcDebounceTimeout = setTimeout(() => {
      doCalc();
    }, CONFIG.CALC_DEBOUNCE_MS);
  }

  function doCalc() {
    calcId++;
    const thisCalcId = calcId;
    
    clearTimeout(calcTimeout);

    const inputs = store.get('inputs');
    const economics = store.get('economics');

    // C8: Relational validations
    const validatedInputs = applyRelationalValidations(inputs);
    if (JSON.stringify(validatedInputs) !== JSON.stringify(inputs)) {
      store.patch('inputs', validatedInputs);
      // Don't return - continue with validated inputs
    }

    const payload = {
      inputs: validatedInputs,
      economics,
      dataset: dataset || getFallbackDataset()
    };

    window.__lastCalcStart = Date.now();

    // H7: Worker readiness guard
    if (worker && workerReady) {
      worker.postMessage({
        type: 'compute',
        payload,
        id: thisCalcId
      });

      // Timeout fallback
      calcTimeout = setTimeout(() => {
        if (calcId === thisCalcId) {
          console.warn('[Worker] Timeout');
          // Could show "Calculating..." message
        }
      }, CONFIG.WORKER_TIMEOUT_MS);
    } else {
      console.warn('[Calc] Worker not ready');
    }
  }

  /**
   * C8: Relational validations with chips (P3)
   */
  function applyRelationalValidations(inputs) {
    const validated = { ...inputs };
    const chips = [];

    // SeaDays can't exceed days
    if (validated.seaDays > validated.days) {
      validated.seaDays = validated.days;
      chips.push({
        type: 'info',
        text: `Adjusted sea days to ${validated.days} (cannot exceed cruise length)`
      });
    }

    // Total guests max 6
    const totalGuests = validated.adults + validated.minors;
    if (totalGuests > CONFIG.MAX_GUESTS_TOTAL) {
      const excess = totalGuests - CONFIG.MAX_GUESTS_TOTAL;
      if (validated.minors >= excess) {
        validated.minors -= excess;
      } else {
        const remaining = excess - validated.minors;
        validated.minors = 0;
        validated.adults = Math.max(1, validated.adults - remaining);
      }
      chips.push({
        type: 'warning',
        text: `Adjusted to ${CONFIG.MAX_GUESTS_TOTAL} guests maximum`
      });
    }

    // Days must be >= 1
    if (validated.days < 1) {
      validated.days = 1;
      chips.push({
        type: 'error',
        text: 'Cruise must be at least 1 night'
      });
    }

    // Adults must be >= 1
    if (validated.adults < 1) {
      validated.adults = 1;
      chips.push({
        type: 'error',
        text: 'At least 1 adult required'
      });
    }

    // P3: Show chips
    if (chips.length > 0) {
      renderRelationalChips(chips);
    } else {
      // Clear chips if no issues
      const container = document.getElementById('relational-chips');
      if (container) container.innerHTML = '';
    }

    return validated;
  }

  /**
   * P3: Render validation chips
   */
  function renderRelationalChips(chips) {
    const container = document.getElementById('relational-chips');
    if (!container) return;

    container.innerHTML = '';

    chips.forEach(chip => {
      const colors = {
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' },
        warning: { bg: '#fff3cd', color: '#856404', border: '#ffeeba' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }
      };
      
      const c = colors[chip.type] || colors.info;
      
      const el = createElement('span', {
        className: `chip chip-${chip.type}`,
        style: {
          display: 'inline-block',
          padding: '4px 8px',
          margin: '2px',
          borderRadius: '12px',
          fontSize: '0.85em',
          backgroundColor: c.bg,
          color: c.color,
          border: `1px solid ${c.border}`
        }
      }, chip.text);
      
      container.appendChild(el);
    });
  }

  // ==================== INPUT BRIDGE (C4) ====================
  
  function syncInputsToStore() {
    const inputs = store.get('inputs');

    // Days/Nights
    const daysEl = document.getElementById('input-days') || document.getElementById('nights');
    if (daysEl) {
      inputs.days = sanitizeInput(daysEl.value, 'number');
      inputs.days = clamp(Math.round(inputs.days), 1, 365);
    }

    // Sea days
    const seaDaysEl = document.getElementById('input-seadays') || document.getElementById('seadays');
    if (seaDaysEl) {
      inputs.seaDays = sanitizeInput(seaDaysEl.value, 'number');
      inputs.seaDays = clamp(Math.round(inputs.seaDays), 0, inputs.days);
    }

    // Adults
    const adultsEl = document.getElementById('input-adults') || document.getElementById('adults');
    if (adultsEl) {
      inputs.adults = sanitizeInput(adultsEl.value, 'number');
      inputs.adults = clamp(Math.round(inputs.adults), 1, 20);
    }

    // Minors
    const minorsEl = document.getElementById('input-minors') || document.getElementById('minors');
    if (minorsEl) {
      inputs.minors = sanitizeInput(minorsEl.value, 'number');
      inputs.minors = clamp(Math.round(inputs.minors), 0, 20);
    }

    // Drinks
    const drinkInputs = document.querySelectorAll('[data-category]');
    drinkInputs.forEach(input => {
      const category = input.getAttribute('data-category');
      if (category && inputs.drinks.hasOwnProperty(category)) {
        inputs.drinks[category] = sanitizeInput(input.value, 'number');
        inputs.drinks[category] = clamp(Math.round(inputs.drinks[category]), 0, 99);
      }
    });

    // Sync vouchers from UI
    syncVouchersFromUI(inputs);

    store.patch('inputs', inputs);
    scheduleCalc();
  }

  /**
   * Sync voucher selections from UI radios
   */
  function syncVouchersFromUI(inputs) {
    const totalGuests = inputs.adults + inputs.minors;
    const vouchers = [];
    
    for (let i = 1; i <= Math.min(totalGuests, CONFIG.MAX_GUESTS_TOTAL); i++) {
      const radios = document.querySelectorAll(`input[name="voucher-guest-${i}"]`);
      let selectedLevel = 'none';
      
      radios.forEach(radio => {
        if (radio.checked) {
          selectedLevel = radio.value;
        }
      });
      
      vouchers.push({ level: selectedLevel });
    }
    
    inputs.vouchers = vouchers;
  }

  /**
   * Attach input listeners with security (C11)
   */
  function initInputBridge() {
    const inputSelectors = [
      '#input-days', '#nights',
      '#input-seadays', '#seadays',
      '#input-adults', '#adults',
      '#input-minors', '#minors',
      '[data-category]'
    ];

    const inputs = document.querySelectorAll(inputSelectors.join(','));

    if (inputs.length === 0) {
      console.warn('[Input Bridge] No inputs found, retrying in 100ms');
      setTimeout(initInputBridge, 100);
      return;
    }

    inputs.forEach(input => {
      // C11 Layer 9: Prevent code injection via paste
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const sanitized = sanitizeInput(text, 'number');
        input.value = sanitized;
        syncInputsToStore();
      });

      // C11 Layer 9: Prevent drag/drop attacks
      input.addEventListener('drop', (e) => {
        e.preventDefault();
        console.warn('[Security] Drop blocked');
      });

      // C11 Layer 9: Filter keyboard input
      input.addEventListener('keydown', (e) => {
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
                        'Tab', 'Enter', 'Escape', '.', ',', '-'];
        if (allowed.includes(e.key) || /^\d$/.test(e.key)) {
          return;
        }
        e.preventDefault();
      });

      // Normal events
      input.addEventListener('input', syncInputsToStore);
      input.addEventListener('change', syncInputsToStore);
    });

    console.log('[Input Bridge] ✓ Attached to', inputs.length, 'inputs');
  }

  // ==================== RENDERING ====================
  
  function render() {
    const results = store.get('results');
    if (!results) return;

    renderTotals(results);
    renderGroupBreakdown(results);
    renderDeluxePolicyBanner(results);
    announceResults(results);
  }

  function renderTotals(results) {
    const totalsEl = document.getElementById('results-totals') || document.getElementById('totals');
    if (!totalsEl) return;

    totalsEl.innerHTML = '';

    const fxStale = store.get('ui').fxStale;
    const perDayText = formatMoney(results.perDay, { approximate: fxStale });
    const tripText = formatMoney(results.trip, { approximate: fxStale });

    const perDayDiv = createElement('div', { className: 'total-per-day' });
    perDayDiv.appendChild(createElement('span', { className: 'label' }, 'Per Day: '));
    perDayDiv.appendChild(createElement('strong', {}, perDayText));

    const tripDiv = createElement('div', { className: 'total-trip' });
    tripDiv.appendChild(createElement('span', { className: 'label' }, 'Total Trip: '));
    tripDiv.appendChild(createElement('strong', {}, tripText));

    totalsEl.appendChild(perDayDiv);
    totalsEl.appendChild(tripDiv);
  }

  function renderGroupBreakdown(results) {
    const tbody = document.getElementById('group-rows-body') || document.getElementById('group-table-body');
    if (!tbody || !results.groupRows) return;

    tbody.innerHTML = '';

    results.groupRows.forEach(row => {
      const tr = createElement('tr', {});

      const pkgLabel = {
        'alc': 'À-la-carte',
        'soda': 'Soda',
        'refresh': 'Refreshment',
        'deluxe': 'Deluxe'
      }[row.pkg] || row.pkg;

      tr.appendChild(createElement('td', {}, row.who || ''));
      tr.appendChild(createElement('td', {}, pkgLabel));
      tr.appendChild(createElement('td', {}, formatMoney(row.perDay, {})));
      tr.appendChild(createElement('td', {}, formatMoney(row.trip, {})));

      tbody.appendChild(tr);
    });
  }

  /**
   * P2: Deluxe policy banner
   */
  function renderDeluxePolicyBanner(results) {
    const banner = document.getElementById('deluxe-policy-note') || document.getElementById('policy-banner');
    if (!banner) return;

    const shouldShow = results.policy?.anyAdultDeluxe && store.get('inputs').adults > 1;

    if (shouldShow) {
      banner.style.display = 'block';
      banner.innerHTML = '';
      banner.appendChild(document.createTextNode('⚠️ '));
      banner.appendChild(createElement('strong', {}, 'Policy: '));
      banner.appendChild(document.createTextNode("Royal Caribbean's cabin rule: if any adult purchases Deluxe, all adults in the stateroom must also purchase Deluxe."));
    } else {
      banner.style.display = 'none';
    }
  }

  /**
   * P1: Render per-guest voucher UI (max 6)
   */
  function renderVoucherGrid() {
    const container = document.getElementById('voucher-grid');
    if (!container) return;

    const inputs = store.get('inputs');
    const totalGuests = inputs.adults + inputs.minors;

    // Show "too many" warning if > 6
    const warningEl = document.getElementById('voucher-note-too-many');
    if (warningEl) {
      warningEl.style.display = totalGuests > CONFIG.MAX_GUESTS_TOTAL ? 'block' : 'none';
    }

    container.innerHTML = '';

    const actualGuests = Math.min(totalGuests, CONFIG.MAX_GUESTS_TOTAL);

    for (let i = 1; i <= actualGuests; i++) {
      const isAdult = i <= inputs.adults;
      const label = isAdult ? `Adult ${i}` : `Minor ${i - inputs.adults}`;

      const row = createElement('div', {
        className: 'voucher-row',
        style: {
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '8px',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid #e0e0e0'
        }
      });

      row.appendChild(createElement('strong', {}, label));

      const radioGroup = createElement('div', {
        style: { display: 'flex', gap: '12px', flexWrap: 'wrap' }
      });

      const tiers = [
        { value: 'none', label: 'None' },
        { value: 'diamond', label: 'Diamond (4/day)' },
        { value: 'diamondplus', label: 'Diamond+ (5/day)' },
        { value: 'pinnacle', label: 'Pinnacle (5/day)' }
      ];

      // Get current selection from inputs
      const currentLevel = inputs.vouchers?.[i-1]?.level || 'none';

      tiers.forEach(tier => {
        const radioWrapper = createElement('label', {
          style: { display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }
        });

        const radio = createElement('input', {
          type: 'radio',
          name: `voucher-guest-${i}`,
          value: tier.value
        });

        if (tier.value === currentLevel) {
          radio.checked = true;
        }

        radio.addEventListener('change', () => {
          syncInputsToStore();
        });

        radioWrapper.appendChild(radio);
        radioWrapper.appendChild(createElement('span', {}, tier.label));
        radioGroup.appendChild(radioWrapper);
      });

      row.appendChild(radioGroup);
      container.appendChild(row);
    }
  }

  /**
   * H3: A11y announcements
   */
  function announceResults(results) {
    const announcer = document.getElementById('a11y-status');
    if (!announcer) return;

    const winnerLabel = {
      'alc': 'À-la-carte',
      'soda': 'Soda package',
      'refresh': 'Refreshment package',
      'deluxe': 'Deluxe package'
    }[results.winnerKey] || 'Unknown';

    announcer.textContent = `Best value: ${winnerLabel}, ${formatMoney(results.perDay)} per day`;
  }

  // ==================== FX & CURRENCY (C1, H2) ====================
  
  function fxIsStale() {
    if (!fxRates || !fxRates.timestamp) return true;
    const ageHours = (Date.now() - fxRates.timestamp) / (1000 * 60 * 60);
    return ageHours > CONFIG.FX_STALE_HOURS;
  }

  async function loadFX() {
    try {
      const response = await fetch(CONFIG.FX_API);
      if (!response.ok) throw new Error('FX API failed');

      const data = await response.json();
      
      // C11 Layer 10: Validate structure
      if (!data || !data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid FX data');
      }

      fxRates = {
        rates: data.rates,
        timestamp: Date.now()
      };

      SafeStorage.set('fx-rates', fxRates);
      updateFxStalenessIndicator();
      
      console.log('[FX] Rates loaded');
    } catch (err) {
      console.warn('[FX] Load failed, using cached:', err);
      const cached = SafeStorage.get('fx-rates');
      if (cached) {
        fxRates = cached;
        updateFxStalenessIndicator();
      }
    }
  }

  /**
   * H2: FX staleness indicator
   */
  function updateFxStalenessIndicator() {
    const isStale = fxIsStale();
    store.patch('ui', { ...store.get('ui'), fxStale: isStale });

    const chip = document.getElementById('fx-staleness-chip');
    if (chip && isStale && currentCurrency !== 'USD') {
      chip.style.display = 'inline-block';
      chip.textContent = '⚠️ Offline rates';
      chip.style.cssText = 'display:inline-block;padding:2px 6px;margin-left:8px;background:#fff3cd;border-radius:4px;font-size:0.85em;';
    } else if (chip) {
      chip.style.display = 'none';
    }
  }

  // ==================== DATASET LOADING ====================
  
  function getFallbackDataset() {
    return {
      version: VERSION,
      rules: { gratuity: 0.18, deluxeCap: CONFIG.DELUXE_CAP_FALLBACK },
      prices: {
        soda: 3.50, coffee: 4.00, teaprem: 4.00, freshjuice: 4.50,
        mocktail: 6.00, energy: 5.00, milkshake: 6.00, bottledwater: 3.00,
        beer: 7.50, wine: 10.00, cocktail: 13.00, spirits: 13.00
      },
      sets: {
        soda: ['soda', 'coffee', 'teaprem'],
        refresh: ['soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail', 'energy', 'milkshake', 'bottledwater'],
        alcoholic: ['beer', 'wine', 'cocktail', 'spirits']
      },
      packages: {
        soda: { price: 13.99 },
        refresh: { price: 34.00 },
        deluxe: { price: 85.00 }
      }
    };
  }

  async function loadDataset() {
    try {
      const response = await fetch(CONFIG.DS_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      // C11 Layer 10: Validate structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid dataset');
      }

      dataset = data;
      
      // Update economics from dataset
      const economics = store.get('economics');
      if (data.packages) {
        economics.pkg.soda = data.packages.soda?.price || economics.pkg.soda;
        economics.pkg.refresh = data.packages.refreshment?.price || economics.pkg.refresh;
        economics.pkg.deluxe = data.packages.deluxe?.price || economics.pkg.deluxe;
      }
      if (data.rules) {
        economics.grat = data.rules.gratuity ?? economics.grat;
        economics.deluxeCap = data.rules.caps?.deluxeAlcohol ?? economics.deluxeCap;
      }
      store.patch('economics', economics);

      console.log('[Dataset] Loaded');
    } catch (err) {
      console.error('[Dataset] Load failed:', err);
      dataset = getFallbackDataset();
    }
  }

  // ==================== BOOT SEQUENCE ====================
  
  async function boot() {
    console.log(`[Boot] Drink Calculator ${VERSION}`);
    console.log('[Boot] Soli Deo Gloria ✝️');

    // Init worker (C2, H7)
    initWorker();

    // Load FX rates (C1, H2)
    await loadFX();

    // Load dataset
    await loadDataset();

    // Attach input listeners (C4)
    initInputBridge();

    // P1: Render per-guest vouchers
    renderVoucherGrid();

    // Subscribe to guest changes to update voucher grid
    store.subscribe('inputs', (newInputs, oldInputs) => {
      if (newInputs.adults !== oldInputs?.adults || newInputs.minors !== oldInputs?.minors) {
        renderVoucherGrid();
      }
    });

    // H4: Currency selector
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.addEventListener('change', async (e) => {
        currentCurrency = sanitizeText(e.target.value).substring(0, 3);
        
        // H2: Reload FX if stale
        if (fxIsStale()) {
          await loadFX();
        }
        
        render();
      });
    }

    // Expose ITW globals
    window.__itwCurrency = currentCurrency;
    window.ITW = window.ITW || {};
    window.ITW.store = {
      get: (key) => store.get(key),
      subscribe: (key, fn) => store.subscribe(key, fn),
      patch: (key, val) => store.patch(key, val)
    };
    window.ITW.money = formatMoney;
    window.ITW.getCurrency = () => currentCurrency;
    window.ITW.fxApproxPrefix = () => fxIsStale() ? '≈ ' : '';

    // Initial calculation
    scheduleCalc();

    console.log('[Boot] ✓ Complete');
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
