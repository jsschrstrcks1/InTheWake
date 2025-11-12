/**
 * Royal Caribbean Drink Calculator - Unified Core Engine
 * Version: 10.0.0
 * 
 * "Whatever you do, work heartily, as for the Lord and not for men"
 * - Colossians 3:23
 * 
 * Soli Deo Gloria ✝️
 * 
 * COMPLETE PRODUCTION VERSION - All fixes included:
 * - deepMerge fix for dataset loading
 * - Voucher system integration (uses deluxe cap as voucher value)
 * - Worker and main thread voucher support
 */

(function() {
'use strict';

/* ==================== VERSION & INITIALIZATION GUARD ==================== */
const VERSION = '10.0.0';

if (window.ITW_BOOTED) {
  console.warn('[Core] Already initialized, skipping duplicate init');
  return;
}

console.log(`[Core] v${VERSION} Initializing...`);

/* ==================== CONFIGURATION ==================== */
const CONFIG = Object.freeze({
  VERSION: VERSION,
  LIMITS: Object.freeze({
    MIN_DAYS: 1, MAX_DAYS: 365, MIN_ADULTS: 1, MAX_ADULTS: 20,
    MIN_MINORS: 0, MAX_MINORS: 20, SEA_WEIGHT_MAX: 40,
    VOUCHER_MAX_PER_PERSON: 10, MAX_DRINK_QTY: 99
  }),
  RULES: Object.freeze({
    GRATUITY: 0.18, DELUXE_CAP_FALLBACK: 14.0,
    DELUXE_DAILY_LIMIT: 15, CALC_DEBOUNCE_MS: 120
  }),
  API: Object.freeze({
    brands: '/assets/data/brands.json',
    fxFrankfurter: 'https://api.frankfurter.app/latest',
    fxExchangeRate: 'https://api.exchangerate.host/latest'
  }),
  CACHE: Object.freeze({
    FX_REFRESH_HOURS: 12, FX_STALE_HOURS: 48, PRICING_MAX_AGE_DAYS: 7
  }),
  STORAGE_KEYS: Object.freeze({
    state: 'itw:rc:state:v10', currency: 'itw:currency',
    fx: 'itw:fx:v10', brands: 'itw:brands:v10'
  }),
  CURRENCIES: Object.freeze(['USD', 'GBP', 'EUR', 'CAD', 'AUD']),
  DRINK_KEYS: Object.freeze([
    'soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail', 'energy',
    'milkshake', 'bottledwater', 'beer', 'wine', 'cocktail', 'spirits'
  ]),
  DRINK_LABELS: Object.freeze({
    soda: 'Soda', coffee: 'Premium Coffee', teaprem: 'Specialty Tea',
    freshjuice: 'Fresh Juice/Smoothie', mocktail: 'Mocktail',
    energy: 'Energy Drink', milkshake: 'Milkshake',
    bottledwater: 'Bottled Water', beer: 'Beer', wine: 'Wine (glass)',
    cocktail: 'Cocktail', spirits: 'Spirits/Shot'
  }),
  WORKER: Object.freeze({
    enabled: true,
    url: `/assets/js/calculator-worker.js?v=${VERSION}`,
    timeout: 5000
  }),
  FALLBACK_DATASET: Object.freeze({
    version: VERSION,
    rules: { gratuity: 0.18, deluxeCap: 14.0 },
    packages: {
      soda: { priceMid: 13.99 },
      refreshment: { priceMid: 34.0 },
      deluxe: { priceMid: 85.0 }
    },
    prices: {
      soda: 2.00, coffee: 4.50, teaprem: 3.50, freshjuice: 6.00,
      mocktail: 6.50, energy: 5.50, milkshake: 6.95, bottledwater: 2.95,
      beer: 8.50, wine: 11.00, cocktail: 13.00, spirits: 10.00
    },
    sets: {
      refresh: ['soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail',
                'energy', 'milkshake', 'bottledwater'],
      soda: ['soda'],
      alcoholic: ['beer', 'wine', 'cocktail', 'spirits']
    }
  })
});

window.ITW_CONFIG = CONFIG;

/* ==================== POLYFILLS ==================== */
if (typeof structuredClone !== 'function') {
  window.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

/* ==================== UTILITIES ==================== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function num(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/[^0-9.\-]/g, '').trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, num(n)));
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge for nested objects
 * ✅ FIXED: Properly handles null/undefined target values
 */
function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        // FIX: Check if target[key] is also an object
        if (!(key in target) || !isObject(target[key])) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

function debounce(fn, ms = CONFIG.RULES.CALC_DEBOUNCE_MS) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

function announce(message, level = 'polite') {
  const id = level === 'assertive' ? 'a11y-alerts' : 'a11y-status';
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
    setTimeout(() => { element.textContent = ''; }, 3000);
  }
}

/* ==================== SECURITY & SANITIZATION ==================== */
const Security = {
  sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
  },
  sanitizeNumber(input, min = 0, max = 999) {
    const n = num(input);
    return clamp(n, min, max);
  },
  sanitizeString(input, maxLength = 200) {
    if (typeof input !== 'string') return '';
    return input.slice(0, maxLength)
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },
  wireSecureInput(input) {
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      const sanitized = this.sanitizeString(text);
      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, sanitized);
      } else {
        input.value = sanitized;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    input.addEventListener('drop', (e) => e.preventDefault());
    input.addEventListener('blur', () => {
      input.value = this.sanitizeString(input.value);
    });
  }
};

/* ==================== STORAGE ==================== */
const SafeStorage = {
  set(key, value, ttl = null) {
    try {
      const item = {
        value: JSON.stringify(value),
        timestamp: Date.now(),
        ttl: ttl,
        version: VERSION
      };
      const sanitizedKey = Security.sanitizeString(key, 100);
      localStorage.setItem(sanitizedKey, JSON.stringify(item));
      return true;
    } catch (err) {
      console.error('[Storage] Write error:', err);
      this.clearExpired();
      try {
        const item = { value: JSON.stringify(value), timestamp: Date.now(), ttl: ttl, version: VERSION };
        localStorage.setItem(Security.sanitizeString(key, 100), JSON.stringify(item));
        return true;
      } catch { return false; }
    }
  },
  get(key) {
    try {
      const sanitizedKey = Security.sanitizeString(key, 100);
      const raw = localStorage.getItem(sanitizedKey);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }
      return JSON.parse(item.value);
    } catch (err) {
      console.error('[Storage] Read error:', err);
      return null;
    }
  },
  remove(key) {
    try {
      const sanitizedKey = Security.sanitizeString(key, 100);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch { return false; }
  },
  clearExpired() {
    try {
      const keys = Object.keys(localStorage);
      let cleared = 0;
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          const item = JSON.parse(raw);
          if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          localStorage.removeItem(key);
          cleared++;
        }
      }
      if (cleared > 0) console.log(`[Storage] Cleared ${cleared} expired items`);
      return cleared;
    } catch { return 0; }
  },
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch { return false; }
  }
};

/* ==================== VALIDATION ==================== */
const Validation = {
  days(value) {
    const n = Security.sanitizeNumber(value, CONFIG.LIMITS.MIN_DAYS, CONFIG.LIMITS.MAX_DAYS);
    return {
      value: Math.round(n),
      valid: n >= CONFIG.LIMITS.MIN_DAYS && n <= CONFIG.LIMITS.MAX_DAYS,
      error: (n < CONFIG.LIMITS.MIN_DAYS || n > CONFIG.LIMITS.MAX_DAYS)
        ? `Must be between ${CONFIG.LIMITS.MIN_DAYS} and ${CONFIG.LIMITS.MAX_DAYS} days` : null
    };
  },
  seaDays(value, totalDays) {
    const n = Security.sanitizeNumber(value, 0, totalDays);
    return {
      value: Math.round(n),
      valid: n >= 0 && n <= totalDays,
      error: n > totalDays ? `Cannot exceed total cruise days (${totalDays})` : null
    };
  },
  seaWeight(value) {
    const n = Security.sanitizeNumber(value, 0, CONFIG.LIMITS.SEA_WEIGHT_MAX);
    return {
      value: Math.round(n),
      valid: n >= 0 && n <= CONFIG.LIMITS.SEA_WEIGHT_MAX,
      error: (n < 0 || n > CONFIG.LIMITS.SEA_WEIGHT_MAX)
        ? `Must be between 0 and ${CONFIG.LIMITS.SEA_WEIGHT_MAX}%` : null
    };
  },
  adults(value) {
    const n = Security.sanitizeNumber(value, CONFIG.LIMITS.MIN_ADULTS, CONFIG.LIMITS.MAX_ADULTS);
    return {
      value: Math.round(n),
      valid: n >= CONFIG.LIMITS.MIN_ADULTS && n <= CONFIG.LIMITS.MAX_ADULTS,
      error: (n < CONFIG.LIMITS.MIN_ADULTS || n > CONFIG.LIMITS.MAX_ADULTS)
        ? `Must be between ${CONFIG.LIMITS.MIN_ADULTS} and ${CONFIG.LIMITS.MAX_ADULTS}` : null
    };
  },
  minors(value) {
    const n = Security.sanitizeNumber(value, CONFIG.LIMITS.MIN_MINORS, CONFIG.LIMITS.MAX_MINORS);
    return {
      value: Math.round(n),
      valid: n >= CONFIG.LIMITS.MIN_MINORS && n <= CONFIG.LIMITS.MAX_MINORS,
      error: (n < CONFIG.LIMITS.MIN_MINORS || n > CONFIG.LIMITS.MAX_MINORS)
        ? `Must be between ${CONFIG.LIMITS.MIN_MINORS} and ${CONFIG.LIMITS.MAX_MINORS}` : null
    };
  },
  drinkQty(value) {
    if (value == null) return { value: 0, valid: true, error: null };
    const str = String(value).trim();
    const rangeMatch = str.match(/^(\d*\.?\d+)\s*[-–]\s*(\d*\.?\d+)$/);
    if (rangeMatch) {
      const min = Security.sanitizeNumber(rangeMatch[1], 0, CONFIG.LIMITS.MAX_DRINK_QTY);
      const max = Security.sanitizeNumber(rangeMatch[2], 0, CONFIG.LIMITS.MAX_DRINK_QTY);
      if (min > max) {
        return { value: { min: max, max: min }, valid: false, error: 'Min cannot be greater than max' };
      }
      return { value: { min, max }, valid: true, error: null, isRange: true };
    }
    const n = Security.sanitizeNumber(value, 0, CONFIG.LIMITS.MAX_DRINK_QTY);
    return {
      value: Math.max(0, n),
      valid: n >= 0 && n <= CONFIG.LIMITS.MAX_DRINK_QTY,
      error: (n < 0 || n > CONFIG.LIMITS.MAX_DRINK_QTY)
        ? `Must be between 0 and ${CONFIG.LIMITS.MAX_DRINK_QTY}` : null,
      isRange: false
    };
  },
  voucherCount(value) {
    const n = Security.sanitizeNumber(value, 0, CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON);
    return {
      value: Math.round(n),
      valid: n >= 0 && n <= CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON,
      error: (n < 0 || n > CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON)
        ? `Must be between 0 and ${CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON}` : null
    };
  }
};

/* ==================== STATE MANAGEMENT ==================== */
function createStore(initialState) {
  let state = structuredClone(initialState);
  const subscribers = new Map();

  function get(path) {
    if (!path) return state;
    const keys = path.split('.');
    let value = state;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  }

  function set(updates) {
    const nextState = deepMerge(state, updates);
    const changedKeys = Object.keys(nextState).filter(
      key => JSON.stringify(nextState[key]) !== JSON.stringify(state[key])
    );
    if (changedKeys.length === 0) return;
    state = nextState;
    changedKeys.forEach(key => {
      const callbacks = subscribers.get(key);
      if (callbacks) callbacks.forEach(cb => {
        try {
          cb(state[key], state);
        } catch (err) {
          console.error(`[Store] Subscriber error for key "${key}":`, err);
        }
      });
    });
    const globalCallbacks = subscribers.get('*');
    if (globalCallbacks) globalCallbacks.forEach(cb => {
      try {
        cb(state, state);
      } catch (err) {
        console.error('[Store] Global subscriber error:', err);
      }
    });
  }

  function patch(path, value) {
    if (!path) return;
    const keys = path.split('.');
    if (keys.length === 1) {
      set({ [keys[0]]: value });
      return;
    }
    const nextState = structuredClone(state);
    let ref = nextState;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!ref[k] || typeof ref[k] !== 'object') ref[k] = {};
      ref = ref[k];
    }
    ref[keys[keys.length - 1]] = value;
    set(nextState);
  }

  function subscribe(keys, callback) {
    const list = Array.isArray(keys) ? keys : [keys];
    list.forEach(key => {
      if (!subscribers.has(key)) subscribers.set(key, new Set());
      subscribers.get(key).add(callback);
    });
    return () => {
      list.forEach(key => subscribers.get(key)?.delete(callback));
    };
  }

  return { get, set, patch, subscribe };
}

/* ==================== INITIAL STATE ==================== */
const initialState = {
  version: VERSION,
  dataset: null,
  brand: null,
  inputs: {
    days: 7, seaDays: 3, seaApply: true, seaWeight: 20,
    adults: 1, minors: 0, coffeeCards: 0, coffeePunches: 0,
    voucherAdult: 0, voucherMinor: 0,
    drinks: {
      soda: 0, coffee: 0, teaprem: 0, freshjuice: 0,
      mocktail: 0, energy: 0, milkshake: 0, bottledwater: 0,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  economics: {
    pkg: { soda: 13.99, refresh: 34.0, deluxe: 85.0 },
    grat: 0.18,
    deluxeCap: CONFIG.RULES.DELUXE_CAP_FALLBACK
  },
  results: {
    hasRange: false,
    bars: {
      alc: { min: 0, mean: 0, max: 0 },
      soda: { min: 0, mean: 0, max: 0 },
      refresh: { min: 0, mean: 0, max: 0 },
      deluxe: { min: 0, mean: 0, max: 0 }
    },
    winnerKey: 'alc',
    perDay: 0,
    trip: 0,
    groupRows: [],
    categoryRows: [],
    included: { soda: 0, refresh: 0, deluxe: 0 },
    overcap: 0,
    deluxeRequired: false,
    policyNote: null
  },
  ui: {
    fallbackBanner: false,
    fxStale: false,
    chartReady: false
  }
};

const store = createStore(initialState);
window.__itwStore = store;

/* ==================== PERSISTENCE ==================== */
function loadFromStorage() {
  try {
    const saved = SafeStorage.get(CONFIG.STORAGE_KEYS.state);
    if (!saved) return;
    if (saved.inputs) {
      const mergedInputs = deepMerge(initialState.inputs, saved.inputs);
      store.patch('inputs', mergedInputs);
    }
    if (saved.economics) {
      store.patch('economics', saved.economics);
    }
    console.log('[Core] State loaded from storage');
  } catch (e) {
    console.warn('[Core] Failed to load from storage:', e);
  }
}

function saveToStorage() {
  try {
    const state = store.get();
    const { inputs, economics } = state;
    SafeStorage.set(CONFIG.STORAGE_KEYS.state, { inputs, economics });
  } catch (e) {
    console.warn('[Core] Failed to save to storage:', e);
  }
}

/* ==================== CURRENCY & FX RATES ==================== */
let currentCurrency = 'USD';
let fxRates = { base: 'USD', asOf: null, rates: { USD: 1 }, timestamp: null };

async function loadFXRates() {
  try {
    const saved = SafeStorage.get(CONFIG.STORAGE_KEYS.currency);
    if (saved && CONFIG.CURRENCIES.includes(saved.toUpperCase())) {
      currentCurrency = saved.toUpperCase();
    }
  } catch (e) {}

  try {
    const cached = SafeStorage.get(CONFIG.STORAGE_KEYS.fx);
    if (cached && cached.timestamp) {
      const ageMs = Date.now() - cached.timestamp;
      const maxAgeMs = CONFIG.CACHE.FX_REFRESH_HOURS * 60 * 60 * 1000;
      if (ageMs < maxAgeMs) {
        fxRates = cached;
        console.log('[Core] Using cached FX rates');
        return;
      }
    }
  } catch (e) {}

  if (navigator.onLine !== false) {
    try {
      const targets = CONFIG.CURRENCIES.filter(c => c !== 'USD').join(',');
      const url = `${CONFIG.API.fxFrankfurter}?from=USD&to=${encodeURIComponent(targets)}`;
      const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error('FX fetch failed');
      const data = await response.json();
      fxRates = {
        base: data.base || 'USD',
        asOf: data.date,
        rates: { USD: 1, ...(data.rates || {}) },
        timestamp: Date.now()
      };
      SafeStorage.set(CONFIG.STORAGE_KEYS.fx, fxRates);
      console.log('[Core] FX rates refreshed');
    } catch (error) {
      console.warn('[Core] FX fetch failed, using cached or defaults:', error);
      store.patch('ui.fxStale', true);
    }
  } else {
    console.log('[Core] Offline, using cached FX rates');
    store.patch('ui.fxStale', true);
  }
}

function convertUSD(amount, toCurrency = currentCurrency) {
  const rate = fxRates.rates[toCurrency] || 1;
  return amount * rate;
}

function formatMoney(amount, options = {}) {
  const currency = options.currency || currentCurrency;
  const converted = convertUSD(amount, currency);
  const value = Number.isFinite(converted) ? converted : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency
    }).format(value);
  } catch (e) {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function getCurrency() {
  return currentCurrency;
}

function setCurrency(code) {
  const upper = code.toUpperCase();
  if (!CONFIG.CURRENCIES.includes(upper)) {
    console.warn(`[Core] Unsupported currency: ${code}`);
    return false;
  }
  currentCurrency = upper;
  SafeStorage.set(CONFIG.STORAGE_KEYS.currency, upper);
  return true;
}

function setupCurrencySelector() {
  const selector = $('#currency-select');
  if (!selector) return;
  selector.value = currentCurrency;
  selector.addEventListener('change', () => {
    if (setCurrency(selector.value)) {
      setTimeout(() => {
        if (window.renderAll) window.renderAll();
      }, 50);
    }
  });
}

/* ==================== BRAND CONFIGURATION ==================== */
async function loadBrandConfig() {
  try {
    const response = await fetch(`${CONFIG.API.brands}?v=${VERSION}`, { cache: 'default' });
    if (!response.ok) throw new Error('Brands config fetch failed');
    const brandsData = await response.json();
    const defaultBrandId = brandsData.default || 'royal-caribbean';
    const brand = brandsData.brands.find(b => b.id === defaultBrandId && b.active);
    if (brand) {
      store.patch('brand', brand);
      console.log(`[Core] Loaded brand: ${brand.label}`);
      return brand;
    }
  } catch (error) {
    console.warn('[Core] Failed to load brand config:', error);
  }
  return null;
}

/* ==================== DATASET LOADING ==================== */
async function loadDataset() {
  console.log('[Core] 📂 loadDataset() called');
  try {
    const brand = store.get('brand') || await loadBrandConfig();
    console.log('[Core] Brand:', brand);
    const dataURL = brand?.resources?.data || `/assets/data/lines/royal-caribbean.json?v=${VERSION}`;
    console.log('[Core] 🌐 Attempting to fetch:', dataURL);
    const response = await fetch(dataURL, { cache: 'default', credentials: 'omit' });
    if (!response.ok) throw new Error('Dataset fetch failed');
    const data = await response.json();
    console.log('[Core] 📦 Raw dataset received:', data);

    if (!data.prices && Array.isArray(data.items)) {
      console.log('[Core] 🔨 Normalizing prices from items array...');
      data.prices = {};
      data.items.forEach(item => {
        if (item && item.id) {
          data.prices[item.id] = num(item.price);
          console.log(`[Core] Price set: ${item.id} = ${item.price}`);
        }
      });
      console.log('[Core] ✅ Final prices:', data.prices);
    }

    if (!data.sets) data.sets = {};
    console.log('[Core] 📋 Sets before normalization:', data.sets);
    if (!data.sets.alcoholic && data.sets.alcohol) {
      data.sets.alcoholic = data.sets.alcohol;
    }
    console.log('[Core] ✅ Final sets:', data.sets);

    store.patch('dataset', data);
    console.log('[Core] 📝 Dataset stored in store:', store.get('dataset'));
    console.log('[Core] 📝 Prices in store:', store.get('dataset')?.prices);
    console.log('[Core] 📝 Sets in store:', store.get('dataset')?.sets);

    const economics = structuredClone(store.get('economics'));
    if (data.packages) {
      const getPkgPrice = (pkg) => num(pkg?.priceMid ?? pkg?.price);
      economics.pkg = {
        soda: getPkgPrice(data.packages.soda) || economics.pkg.soda,
        refresh: getPkgPrice(data.packages.refreshment || data.packages.refresh) || economics.pkg.refresh,
        deluxe: getPkgPrice(data.packages.deluxe) || economics.pkg.deluxe
      };
    }
    if (data.rules) {
      economics.grat = num(data.rules.gratuity) || economics.grat;
      economics.deluxeCap = num(data.rules.caps?.deluxeAlcohol ?? data.rules.deluxeCap) || economics.deluxeCap;
    }
    store.patch('economics', economics);
    announce('Pricing data loaded');
    console.log('[Core] Dataset loaded successfully');
  } catch (error) {
    console.warn('[Core] Dataset load failed, using fallback:', error);
    const fallback = CONFIG.FALLBACK_DATASET;
    store.patch('dataset', fallback);
    const economics = structuredClone(store.get('economics'));
    if (fallback.packages) {
      const getPkgPrice = (pkg) => num(pkg?.priceMid ?? pkg?.price);
      economics.pkg = {
        soda: getPkgPrice(fallback.packages.soda) || 13.99,
        refresh: getPkgPrice(fallback.packages.refreshment) || 34.0,
        deluxe: getPkgPrice(fallback.packages.deluxe) || 85.0
      };
    }
    if (fallback.rules) {
      economics.grat = num(fallback.rules.gratuity) || 0.18;
      economics.deluxeCap = num(fallback.rules.deluxeCap) || 14.0;
    }
    store.patch('economics', economics);
    store.patch('ui.fallbackBanner', true);
    announce('Using default pricing', 'polite');
    console.log('[Core] Fallback economics applied:', economics);
  }
}

/* ==================== WORKER INTEGRATION ==================== */
let calcWorker = null;
let workerReady = false;
let calculationInProgress = false;

function initializeWorker() {
  if (!CONFIG.WORKER.enabled) return false;
  if (calcWorker) return true;
  try {
    calcWorker = new Worker(CONFIG.WORKER.url, { type: 'module' });
    console.log('[Core] 🔧 Setting up worker message handler...');
    calcWorker.onmessage = (event) => {
      console.log('[Core] 📨 Received message from worker:', event.data);
      const { type, payload } = event.data || {};
      if (type === 'ready') {
        workerReady = true;
        console.log('[Core] Worker ready');
        return;
      }
      if (type === 'result') {
        console.log('[Core] 📊 Received result from worker:', payload);
        store.patch('results', payload);
        calculationInProgress = false;
        console.log('[Core] 🔔 Dispatching calc-updated event');
        document.dispatchEvent(new CustomEvent('itw:calc-updated'));
        console.log('[Core] ✅ Result processed');
      }
    };
    console.log('[Core] ✅ Worker message handler installed');
    calcWorker.onerror = (error) => {
      console.error('[Core] Worker error:', error);
      workerReady = false;
      calculationInProgress = false;
      if (calcWorker) {
        calcWorker.terminate();
        calcWorker = null;
      }
    };
    return true;
  } catch (error) {
    console.warn('[Core] Worker initialization failed:', error);
    return false;
  }
}

/* ==================== CALCULATION SCHEDULING ==================== */
/**
 * ✅ WITH VOUCHER SUPPORT
 * Voucher value tied to deluxe cap (not hardcoded)
 */
function scheduleCalculation() {
  console.log('[Core] 🔄 scheduleCalculation called');
  if (calculationInProgress) {
    console.log('[Core] Calculation already in progress, skipping');
    return;
  }
  calculationInProgress = true;
  console.log('[Core] 🎯 Starting calculation...');
  
  const state = store.get();
  const { inputs, economics, dataset } = state;
  
  // ✅ Check for vouchers
  const hasVouchers = (inputs.voucherAdult > 0) || (inputs.voucherMinor > 0);
  
  const payload = {
    inputs,
    economics,
    dataset: dataset || CONFIG.FALLBACK_DATASET,
    vouchers: hasVouchers ? {
      adultCountPerDay: inputs.voucherAdult || 0,
      minorCountPerDay: inputs.voucherMinor || 0,
      perVoucherValue: economics.deluxeCap || 14.0 // ✅ Tied to deluxe cap
    } : null
  };

  console.log('[Core] 💎 Vouchers:', payload.vouchers);

  const canUseWorker = initializeWorker() && workerReady;
  console.log('[Core] 🤖 Worker available:', canUseWorker, '| Worker ready:', workerReady);
  
  if (canUseWorker) {
    console.log('[Core] 📤 Sending to worker...');
    calcWorker.postMessage({ type: 'compute', payload: payload });
    return;
  }

  // Fallback to main thread
  console.log('[Core] 🔧 Using fallback (main thread)...');
  if (!window.ITW_MATH || typeof window.ITW_MATH.compute !== 'function') {
    console.warn('[Core] ❌ Math module not available');
    store.patch('results', initialState.results);
    calculationInProgress = false;
    return;
  }

  try {
    console.log('[Core] 🧮 Computing with ITW_MATH...');
    console.log('[Core] 📦 Dataset being sent to compute:', payload.dataset);
    console.log('[Core] 💰 Prices being sent:', payload.dataset?.prices);
    console.log('[Core] 📋 Sets being sent:', payload.dataset?.sets);
    
    // ✅ Use computeWithVouchers when vouchers present
    let results;
    if (hasVouchers && typeof window.ITW_MATH.computeWithVouchers === 'function') {
      console.log('[Core] 💎 Computing WITH vouchers');
      results = window.ITW_MATH.computeWithVouchers(
        payload.inputs,
        payload.economics,
        payload.dataset,
        payload.vouchers
      );
    } else {
      console.log('[Core] 🧮 Computing WITHOUT vouchers');
      results = window.ITW_MATH.compute(
        payload.inputs,
        payload.economics,
        payload.dataset
      );
    }
    
    console.log('[Core] ✅ Results:', results);
    store.patch('results', results);
    calculationInProgress = false;
    document.dispatchEvent(new CustomEvent('itw:calc-updated'));
  } catch (error) {
    console.error('[Core] ❌ Calculation error:', error);
    store.patch('results', initialState.results);
    calculationInProgress = false;
  }
}

const debouncedCalc = debounce(scheduleCalculation);

/* ==================== INPUT HANDLING ==================== */
function wireInputs() {
  $$('[data-input]').forEach((input) => {
    if (input.type === 'text' || input.type === 'email') {
      Security.wireSecureInput(input);
    }
    input.addEventListener('input', (e) => {
      const key = input.dataset.input;
      const value = input.type === 'checkbox' ? e.target.checked : e.target.value;
      updateInput(key, value);
      debouncedCalc();
    });
    input.addEventListener('change', () => {
      saveToStorage();
    });
    if (input.type === 'range') {
      input.addEventListener('input', (e) => {
        const key = input.dataset.input;
        if (key === 'seaweight') {
          const output = $('#sea-weight-val');
          if (output) output.textContent = `${e.target.value}%`;
        }
      });
    }
  });
}

function updateInput(key, rawValue) {
  const parsed = key === 'seaapply' ? Boolean(rawValue) : num(rawValue);
  const keyMap = {
    'seaapply': 'seaApply',
    'seadays': 'seaDays',
    'seaweight': 'seaWeight',
    'coffee-cards': 'coffeeCards',
    'coffee-punches': 'coffeePunches',
    'voucher-adult': 'voucherAdult',
    'voucher-minor': 'voucherMinor'
  };
  const normalizedKey = keyMap[key] || key;

  switch (normalizedKey) {
    case 'seaApply':
      store.patch('inputs.seaApply', parsed);
      break;
    case 'days': {
      const days = clamp(Math.round(parsed), CONFIG.LIMITS.MIN_DAYS, CONFIG.LIMITS.MAX_DAYS);
      store.patch('inputs.days', days);
      break;
    }
    case 'seaDays': {
      const days = store.get('inputs').days || 7;
      const sea = clamp(Math.round(parsed), 0, days);
      store.patch('inputs.seaDays', sea);
      break;
    }
    case 'seaWeight':
      store.patch('inputs.seaWeight', clamp(parsed, 0, CONFIG.LIMITS.SEA_WEIGHT_MAX));
      break;
    case 'adults':
      store.patch('inputs.adults', clamp(Math.round(parsed), CONFIG.LIMITS.MIN_ADULTS, CONFIG.LIMITS.MAX_ADULTS));
      break;
    case 'minors':
      store.patch('inputs.minors', clamp(Math.round(parsed), CONFIG.LIMITS.MIN_MINORS, CONFIG.LIMITS.MAX_MINORS));
      break;
    case 'coffeeCards':
      store.patch('inputs.coffeeCards', clamp(Math.round(parsed), 0, 10));
      break;
    case 'coffeePunches':
      store.patch('inputs.coffeePunches', clamp(parsed, 0, 5));
      break;
    case 'voucherAdult':
      store.patch('inputs.voucherAdult', clamp(Math.round(parsed), 0, CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON));
      break;
    case 'voucherMinor':
      store.patch('inputs.voucherMinor', clamp(Math.round(parsed), 0, CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON));
      break;
    default:
      if (CONFIG.DRINK_KEYS.includes(normalizedKey)) {
        store.patch(`inputs.drinks.${normalizedKey}`, Math.max(0, parsed));
      } else {
        console.warn(`[Core] Unknown input key: ${key}`);
      }
      break;
  }
}

/* ==================== GLOBAL HELPERS ==================== */
function resetInputs() {
  store.patch('inputs', structuredClone(initialState.inputs));
  SafeStorage.remove(CONFIG.STORAGE_KEYS.state);
  scheduleCalculation();
  announce('All inputs reset');
}

function shareScenario() {
  try {
    navigator.clipboard.writeText(location.href);
    announce('Link copied to clipboard');
  } catch (e) {
    console.error('[Core] Failed to copy link:', e);
    announce('Unable to copy link', 'assertive');
  }
}

async function refreshDataset() {
  await loadDataset();
  scheduleCalculation();
}

/* ==================== PRESET SYSTEM ==================== */
const PRESETS = {
  light: {
    soda: 2, coffee: 1, teaprem: 0, freshjuice: 0,
    mocktail: 0, energy: 0, milkshake: 0, bottledwater: 1,
    beer: 1, wine: 1, cocktail: 0.5, spirits: 0
  },
  moderate: {
    soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
    mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
    beer: 2, wine: 2, cocktail: 2, spirits: 0.5
  },
  party: {
    soda: 2, coffee: 2, teaprem: 0, freshjuice: 1,
    mocktail: 1, energy: 1, milkshake: 0, bottledwater: 2,
    beer: 4, wine: 2, cocktail: 4, spirits: 2
  },
  coffee: {
    soda: 1, coffee: 4, teaprem: 1, freshjuice: 1,
    mocktail: 1, energy: 0, milkshake: 0.5, bottledwater: 2,
    beer: 0, wine: 0, cocktail: 0, spirits: 0
  },
  nonalc: {
    soda: 3, coffee: 2, teaprem: 1, freshjuice: 2,
    mocktail: 2, energy: 0.5, milkshake: 1, bottledwater: 2,
    beer: 0, wine: 0, cocktail: 0, spirits: 0
  }
};

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) {
    console.warn(`[Core] Unknown preset: ${presetKey}`);
    return;
  }
  const inputs = store.get('inputs');
  const drinks = { ...inputs.drinks };
  Object.keys(drinks).forEach(key => {
    drinks[key] = preset[key] !== undefined ? preset[key] : 0;
  });
  store.patch('inputs', { ...inputs, drinks });
  Object.keys(drinks).forEach(key => {
    const input = document.querySelector(`[data-input="${key}"]`);
    if (input) {
      input.value = drinks[key];
    }
  });
  scheduleCalculation();
  saveToStorage();
  announce(`Applied ${presetKey} preset`);
  console.log(`[Core] Applied preset: ${presetKey}`);
}

/* ==================== API EXPORTS ==================== */
window.ITW = Object.freeze({
  version: VERSION,
  config: CONFIG,
  store,
  formatMoney,
  getCurrency,
  setCurrency,
  scheduleCalc: scheduleCalculation,
  debouncedCalc,
  resetInputs,
  shareScenario,
  refreshDataset,
  applyPreset,
  announce,
  _debug: {
    getState: () => store.get(),
    getFXRates: () => ({ ...fxRates }),
    getWorkerStatus: () => ({ ready: workerReady, inProgress: calculationInProgress })
  }
});

/* ==================== INITIALIZATION ==================== */
async function initialize() {
  console.log(`[Core] Initializing v${VERSION}`);
  loadFromStorage();
  await loadFXRates();
  setupCurrencySelector();
  await loadBrandConfig();
  await loadDataset();
  if (CONFIG.WORKER.enabled) {
    initializeWorker();
  }
  wireInputs();
  scheduleCalculation();
  window.addEventListener('beforeunload', saveToStorage);
  window.ITW_BOOTED = true;
  console.log(`[Core] ✓ Initialized v${VERSION}`);
  announce('Calculator ready');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

})();

// Soli Deo Gloria ✝️
