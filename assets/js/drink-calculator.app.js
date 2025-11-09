/**
 * Royal Caribbean Drink Calculator - Application Core (P0-CRITICAL-FIXES)
 * Version: 11.1.0
 * Soli Deo Gloria ✝️
 * 
 * P0 CRITICAL FIXES:
 * - Worker result validation (P0 #5)
 * - Enhanced error handling
 * - Fail-closed security
 * - Banner functions use CSS classes (no inline styles)
 */

(function() {
  'use strict';

  const VER = window.ITW_CFG?.version || '11.1.0';
  console.log('[App] Initializing v' + VER + ' - Soli Deo Gloria ✝️');

  // ==================== CONFIGURATION ====================
  
  const CONFIG = {
    FX_API: window.ITW_CFG?.api?.fxRates || 'https://api.frankfurter.app/latest?from=USD',
    DS_URL: window.ITW_CFG?.api?.dataset || '/assets/data/drink-prices.json?v=' + VER,
    WORKER_URL: window.ITW_CFG?.worker?.url || '/assets/js/drink-worker.js?v=' + VER,
    WORKER_HASH: window.ITW_CFG?.worker?.expectedHash,
    FX_CACHE_HOURS: 24
  };

  // ==================== GLOBAL STATE ====================
  
  let calcWorker = null;
  let workerReady = false;
  let dataset = null;
  let fxRates = null;
  
  // ==================== STORE (Central State Management) ====================
  
  const store = {
    state: {
      inputs: {
        days: 7,
        seaDays: 0,
        seaApply: true,
        seaWeight: 20,
        adults: 1,
        minors: 0,
        drinks: {},
        vouchers: []
      },
      economics: {
        pkg: { soda: 13.99, refresh: 34.00, deluxe: 85.00 },
        grat: 0.18,
        deluxeCap: 14.00,
        minorDiscount: 0
      },
      results: null,
      currency: 'USD',
      fxRate: 1.0
    },
    
    listeners: [],
    
    get(key) {
      return key ? this.state[key] : this.state;
    },
    
    patch(key, value) {
      if (!key || typeof key !== 'string') {
        console.error('[Store] Invalid patch key');
        return;
      }
      
      // Validate value is not polluted
      if (value && typeof value === 'object') {
        const dangerous = ['__proto__', 'constructor', 'prototype'];
        for (const dk of dangerous) {
          if (dk in value) {
            console.error('[Store] ⚠️ Blocked polluted object');
            if (window.SecurityEvents) {
              window.SecurityEvents.emit('payload_pollution_blocked', { key: dk });
            }
            return;
          }
        }
      }
      
      this.state[key] = value;
      this.notify(key, value);
    },
    
    subscribe(listener) {
      if (typeof listener === 'function') {
        this.listeners.push(listener);
      }
    },
    
    notify(key, value) {
      this.listeners.forEach(fn => {
        try {
          fn(key, value);
        } catch (err) {
          console.error('[Store] Listener error:', err);
        }
      });
    }
  };
  
  // Expose store globally
  window.__itwStore = store;

  // ==================== P0 FIX: WORKER RESULT VALIDATION ====================
  
  /**
   * P0 CRITICAL FIX #5: Validate worker results before applying to store
   * 
   * Problem: Original code accepted any object and patched to store
   * Fix: Strict schema validation of all required fields
   * 
   * Reference: ChatGPT Master Action List P0 #5
   */
  function validateResult(r) {
    // Must be an object
    if (!r || typeof r !== 'object') {
      console.warn('[Validation] Result is not an object');
      return false;
    }
    
    // Must have bars object
    if (!r.bars || typeof r.bars !== 'object') {
      console.warn('[Validation] Missing or invalid bars object');
      return false;
    }
    
    // Check all required bar types
    const requiredBars = ['alc', 'soda', 'refresh', 'deluxe'];
    for (const barType of requiredBars) {
      const bar = r.bars[barType];
      
      if (!bar || typeof bar !== 'object') {
        console.warn('[Validation] Missing bar type:', barType);
        return false;
      }
      
      // Each bar must have min, mean, max that are finite numbers
      if (!Number.isFinite(bar.min) || 
          !Number.isFinite(bar.mean) || 
          !Number.isFinite(bar.max)) {
        console.warn('[Validation] Invalid bar values for:', barType);
        return false;
      }
      
      // Sanity check: min <= mean <= max
      if (bar.min > bar.mean || bar.mean > bar.max) {
        console.warn('[Validation] Bar values out of order:', barType);
        return false;
      }
    }
    
    // Must have winnerKey string
    if (typeof r.winnerKey !== 'string') {
      console.warn('[Validation] Missing or invalid winnerKey');
      return false;
    }
    
    // Winner must be one of the valid bar types
    if (!requiredBars.includes(r.winnerKey)) {
      console.warn('[Validation] Invalid winnerKey:', r.winnerKey);
      return false;
    }
    
    // Must have numeric perDay and trip values
    if (!Number.isFinite(r.perDay)) {
      console.warn('[Validation] Missing or invalid perDay');
      return false;
    }
    
    if (!Number.isFinite(r.trip)) {
      console.warn('[Validation] Missing or invalid trip');
      return false;
    }
    
    // Optional fields (if present, must be valid)
    if (r.groupRows !== undefined && !Array.isArray(r.groupRows)) {
      console.warn('[Validation] groupRows must be array if present');
      return false;
    }
    
    if (r.included !== undefined && typeof r.included !== 'object') {
      console.warn('[Validation] included must be object if present');
      return false;
    }
    
    // All checks passed
    return true;
  }

  // ==================== WORKER THROTTLE ====================
  
  class WorkerThrottle {
    constructor(maxInFlight = 1, maxPerSecond = 10) {
      this.maxInFlight = maxInFlight;
      this.maxPerSecond = maxPerSecond;
      this.inFlight = 0;
      this.requestsThisSecond = 0;
      this.lastSecondReset = Date.now();
    }
    
    canSend() {
      const now = Date.now();
      
      // Reset per-second counter
      if (now - this.lastSecondReset > 1000) {
        this.requestsThisSecond = 0;
        this.lastSecondReset = now;
      }
      
      // Check limits
      if (this.inFlight >= this.maxInFlight) {
        if (window.SecurityEvents) {
          window.SecurityEvents.emit('rate_limit_exceeded', { reason: 'in_flight' });
        }
        return false;
      }
      
      if (this.requestsThisSecond >= this.maxPerSecond) {
        if (window.SecurityEvents) {
          window.SecurityEvents.emit('rate_limit_exceeded', { reason: 'per_second' });
        }
        return false;
      }
      
      return true;
    }
    
    markSent() {
      this.inFlight++;
      this.requestsThisSecond++;
    }
    
    markComplete() {
      this.inFlight = Math.max(0, this.inFlight - 1);
    }
  }
  
  const workerThrottle = new WorkerThrottle(1, 10);

  // ==================== BANNER HELPERS (CSS-BASED) ====================
  
  /**
   * P0 FIX: Banner functions now use CSS classes (no inline styles)
   */
  function showBanner(message, type = 'info') {
    const banner = document.createElement('div');
    banner.className = `itw-banner itw-banner--${type}`;
    banner.textContent = message;
    banner.setAttribute('role', 'alert');
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => banner.remove(), 5000);
  }
  
  function showDegradedModeBanner() {
    const banner = document.createElement('div');
    banner.className = 'itw-banner itw-banner--error';
    banner.textContent = '⚠️ Calculator in degraded mode. Please refresh the page.';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Don't auto-remove - user needs to see this
  }

  // ==================== WORKER INITIALIZATION (With Integrity) ====================
  
  async function initWorker() {
    console.log('[App] Initializing worker with integrity verification...');
    
    if (!CONFIG.WORKER_HASH || CONFIG.WORKER_HASH.includes('PLACEHOLDER')) {
      console.error('[App] ⚠️ NO WORKER HASH CONFIGURED!');
      console.error('[App] Run: node build-hashes.js');
      
      showBanner('⚠️ Development mode - worker integrity not verified', 'warning');
      
      // Load worker WITHOUT verification (dev mode only)
      try {
        calcWorker = new Worker(CONFIG.WORKER_URL);
        setupWorkerHandlers();
        return;
      } catch (err) {
        console.error('[App] Failed to create worker:', err);
        showDegradedModeBanner();
        return;
      }
    }
    
    // PRODUCTION: Verify integrity before loading
    try {
      if (!window.WorkerLoader) {
        throw new Error('WorkerLoader not available');
      }
      
      calcWorker = await window.WorkerLoader.verifyAndLoad(
        CONFIG.WORKER_URL,
        CONFIG.WORKER_HASH,
        { name: 'itw-calc', type: 'classic' }
      );
      
      console.log('[App] ✓ Worker verified and loaded');
      setupWorkerHandlers();
      
    } catch (err) {
      console.error('[App] ❌ Worker integrity check FAILED:', err);
      
      if (window.SecurityEvents) {
        window.SecurityEvents.emit('integrity_check_failed', {
          target: 'worker',
          error: err.message
        });
      }
      
      // FAIL CLOSED - no worker on integrity failure
      calcWorker = null;
      workerReady = false;
      
      showDegradedModeBanner();
      
      // Trigger security lockdown
      if (window.Security) {
        window.Security.lockdown('worker_integrity_failed');
      }
    }
  }
  
  function setupWorkerHandlers() {
    if (!calcWorker) return;
    
    calcWorker.onmessage = (e) => {
      const { type, payload, id } = e.data || {};
      
      workerThrottle.markComplete();
      
      if (type === 'ready') {
        workerReady = true;
        console.log('[App] ✓ Worker ready');
        
        // Initial calculation
        triggerCalculation();
        
      } else if (type === 'result') {
        // P0 CRITICAL FIX: Validate result before patching store
        if (validateResult(payload)) {
          store.patch('results', payload);
        } else {
          console.error('[App] ❌ Invalid result structure from worker');
          
          // Emit security event
          if (window.SecurityEvents) {
            window.SecurityEvents.emit('schema_validation_failed', {
              target: 'worker_result',
              payload: payload
            });
          }
          
          // Show error to user
          showBanner('Calculation error. Please refresh the page.', 'error');
        }
        
      } else if (type === 'error') {
        console.error('[App] Worker error:', payload?.message);
        
        if (window.SecurityEvents) {
          window.SecurityEvents.emit('worker_error', {
            message: payload?.message
          });
        }
        
        showBanner('Calculation error. Please try again.', 'warning');
      }
    };
    
    calcWorker.onerror = (err) => {
      console.error('[App] Worker error:', err);
      workerReady = false;
      
      if (window.SecurityEvents) {
        window.SecurityEvents.emit('worker_error', {
          message: err.message
        });
      }
      
      showDegradedModeBanner();
    };
  }

  // ==================== DATASET LOADING ====================
  
  async function loadDataset() {
    console.log('[App] Loading dataset...');
    
    try {
      const response = await fetch(CONFIG.DS_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      dataset = await response.json();
      
      // Validate structure
      if (!dataset.packages || !dataset.prices) {
        throw new Error('Invalid dataset structure');
      }
      
      console.log('[App] ✓ Dataset loaded');
      
    } catch (err) {
      console.error('[App] Dataset load failed:', err);
      
      if (window.SecurityEvents) {
        window.SecurityEvents.emit('dataset_load_failed', {
          error: err.message
        });
      }
      
      // Use fallback
      dataset = getFallbackDataset();
      showBanner('Using default pricing data', 'warning');
    }
  }
  
  function getFallbackDataset() {
    return {
      packages: {
        soda: { price: 13.99 },
        refresh: { price: 34.00 },
        deluxe: { price: 85.00 }
      },
      prices: {
        soda: 3.50,
        coffee: 3.50,
        beer: 7.50,
        wine: 9.50,
        cocktail: 12.50,
        spirits: 12.50
      },
      rules: {
        gratuity: 0.18,
        caps: { deluxeAlcohol: 14.00 }
      },
      sets: {
        soda: ['soda'],
        refresh: ['soda', 'coffee', 'teaprem', 'freshjuice'],
        alcoholic: ['beer', 'wine', 'cocktail', 'spirits']
      }
    };
  }

  // ==================== FX RATES LOADING ====================
  
  async function loadFX() {
    console.log('[App] Loading FX rates...');
    
    try {
      // Check cache first (if SecureStorage available)
      if (window.SecureStorage) {
        const cached = await window.SecureStorage.get('fx-rates');
        
        if (cached && cached.timestamp) {
          const age = Date.now() - cached.timestamp;
          const maxAge = CONFIG.FX_CACHE_HOURS * 60 * 60 * 1000;
          
          if (age < maxAge) {
            fxRates = cached;
            console.log('[App] ✓ Using cached FX rates');
            return;
          }
        }
      }
      
      // Fetch fresh rates
      const response = await fetch(CONFIG.FX_API);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid FX response');
      }
      
      fxRates = {
        rates: data.rates,
        timestamp: Date.now()
      };
      
      // Cache for offline (if SecureStorage available)
      if (window.SecureStorage) {
        await window.SecureStorage.set('fx-rates', fxRates);
      }
      
      console.log('[App] ✓ FX rates loaded');
      
    } catch (err) {
      console.warn('[App] FX load failed:', err);
      
      // Try cache as fallback
      if (window.SecureStorage) {
        const cached = await window.SecureStorage.get('fx-rates');
        if (cached) {
          fxRates = cached;
          showBanner('Using cached exchange rates', 'info');
          return;
        }
      }
      
      // No cache, use default
      fxRates = { rates: {}, timestamp: Date.now() };
    }
  }

  // ==================== CALCULATION TRIGGER ====================
  
  function triggerCalculation() {
    if (!calcWorker || !workerReady) {
      console.warn('[App] Worker not ready');
      return;
    }
    
    // Check runtime integrity before calculation
    if (window.Security && typeof window.Security.checkIntegrity === 'function') {
      if (!window.Security.checkIntegrity()) {
        console.error('[App] Integrity check failed before calculation');
        if (window.Security.lockdown) {
          window.Security.lockdown('integrity_check_failed');
        }
        return;
      }
    }
    
    // Check rate limit
    if (!workerThrottle.canSend()) {
      console.warn('[App] Worker throttled');
      return;
    }
    
    workerThrottle.markSent();
    
    const payload = {
      inputs: store.get('inputs'),
      economics: store.get('economics'),
      dataset: dataset
    };
    
    calcWorker.postMessage({
      type: 'compute',
      payload: payload,
      id: Date.now()
    });
  }
  
  // Subscribe to input changes
  store.subscribe((key, value) => {
    if (key === 'inputs' || key === 'economics') {
      triggerCalculation();
    }
  });

  // ==================== ITW NAMESPACE ====================
  
  window.ITW = {
    store: {
      get: store.get.bind(store),
      subscribe: store.subscribe.bind(store),
      patch: store.patch.bind(store)
    },
    
    money: function(amount, opts = {}) {
      const currency = opts.currency || store.get('currency') || 'USD';
      const fxRate = opts.fxRate || store.get('fxRate') || 1.0;
      
      const converted = amount * fxRate;
      
      if (currency === 'USD') {
        return '$' + converted.toFixed(2);
      }
      
      // Use Intl for other currencies
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency
        }).format(converted);
      } catch (err) {
        return currency + ' ' + converted.toFixed(2);
      }
    },
    
    getCurrency: function() {
      return store.get('currency');
    },
    
    fxApproxPrefix: function() {
      const currency = store.get('currency');
      return currency !== 'USD' ? '≈ ' : '';
    },
    
    version: VER
  };

  // ==================== INITIALIZATION ====================
  
  async function init() {
    console.log('[App] Starting initialization...');
    
    // Wait for SecureStorage to initialize (if available)
    if (window.SecureStorage && !window.SecureStorage._initialized) {
      if (typeof window.SecureStorage.init === 'function') {
        await window.SecureStorage.init();
      }
    }
    
    // Load external data
    await Promise.all([
      loadDataset(),
      loadFX()
    ]);
    
    // Initialize worker with integrity check
    await initWorker();
    
    console.log('[App] ✓ Initialization complete');
  }
  
  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[App] ✓ Core loaded v' + VER);

})();
