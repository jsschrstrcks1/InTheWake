/**
 * Royal Caribbean Drink Calculator - Core Application
 * Version: 10.0.0 assets/js/drink-calculator.app.js
 * Soli Deo Gloria ✝️
 *
 * Main orchestrator: manages state, coordinates worker, handles persistence
 */

const VERSION = '10.0.0';
console.log(`[Core] v${VERSION} Initializing...`);

/* ==================== CONFIGURATION ==================== */
const CONFIG = {
  SEA_WEIGHT_MAX: 40,
  DELUXE_CAP_FALLBACK: 14.0,
  VOUCHER_MAX_PER_PERSON: 10,
  FX_REFRESH_HOURS: 12,
  CALC_DEBOUNCE_MS: 120
};
window.ITW_CONFIG = CONFIG;

const USE_WORKER = true;
const WORKER_URL  = `/assets/js/calculator-worker.js?v=${VERSION}`;
const DATASET_URL = `/assets/data/lines/royal-caribbean.json?v=${VERSION}`;

const FALLBACK_DATASET = {
  version: VERSION,
  rules: { gratuity: 0.18, deluxeCap: CONFIG.DELUXE_CAP_FALLBACK },
  packages: { soda: 13.99, refresh: 34.0, deluxe: 85.0 },
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
};

/* ==================== POLYFILLS ==================== */
// structuredClone polyfill for Safari < 15.4, iOS < 15.4
if (typeof structuredClone !== 'function') {
  window.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

/* ==================== UTILITIES ==================== */
const $  = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Robust numeric parser: strips currency, commas, spaces; preserves minus and dot.
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

function announce(message, level = 'polite') {
  const id = level === 'assertive' ? 'a11y-alerts' : 'a11y-status';
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
    setTimeout(() => { element.textContent = ''; }, 3000);
  }
}

// Deep merge utility for store
function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
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
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

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

  // Deep-merge set
  function set(updates) {
    const nextState = deepMerge(state, updates);
    const changedKeys = Object.keys(nextState).filter(
      key => JSON.stringify(nextState[key]) !== JSON.stringify(state[key])
    );
    if (changedKeys.length === 0) return;

    state = nextState;

    changedKeys.forEach(key => {
      const callbacks = subscribers.get(key);
      if (callbacks) callbacks.forEach(cb => cb(state[key], state));
    });

    const globalCallbacks = subscribers.get('*');
    if (globalCallbacks) globalCallbacks.forEach(cb => cb(state, state));
  }

  // Dot-path or top-level patch
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
  inputs: {
    days: 7,
    seaDays: 3,
    seaApply: true,
    seaWeight: 20,
    adults: 1,
    minors: 0,

    // extra fields supported by UI
    coffeeCards: 0,
    coffeePunches: 0,
    voucherAdult: 0,
    voucherMinor: 0,

    drinks: {
      soda: 0, coffee: 0, teaprem: 0, freshjuice: 0,
      mocktail: 0, energy: 0, milkshake: 0, bottledwater: 0,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  economics: {
    pkg: { soda: 13.99, refresh: 34.0, deluxe: 85.0 },
    grat: 0.18,
    deluxeCap: CONFIG.DELUXE_CAP_FALLBACK
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
    deluxeRequired: false
  },
  ui: {
    fallbackBanner: false,
    chartReady: false,
    fxDriftPct: 0
  }
};

const store = createStore(initialState);

/* ==================== PERSISTENCE ==================== */
const STORAGE_KEY = 'itw:rc:calc:v10';

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const data = JSON.parse(saved);

    if (data.inputs) {
      // Merge saved inputs with defaults to handle schema changes
      const mergedInputs = deepMerge(initialState.inputs, data.inputs);
      store.patch('inputs', mergedInputs);
    }
    if (data.economics) {
      store.patch('economics', data.economics);
    }
  } catch (e) {
    console.warn('[Core] Failed to load from storage:', e);
  }
}

function saveToStorage() {
  try {
    const state = store.get();
    const { inputs, economics } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, economics }));
  } catch (e) {
    console.warn('[Core] Failed to save to storage:', e);
  }
}

/* ==================== DATASET LOADING ==================== */
async function loadDataset() {
  try {
    const response = await fetch(DATASET_URL, { cache: 'default' });
    if (!response.ok) throw new Error('Dataset fetch failed');

    const data = await response.json();

    // Normalize prices
    if (!data.prices && Array.isArray(data.items)) {
      data.prices = {};
      data.items.forEach(item => {
        if (item && item.id) data.prices[item.id] = num(item.price);
      });
    }

    // Normalize sets
    if (!data.sets) data.sets = {};
    if (!data.sets.alcoholic && data.sets.alcohol) {
      data.sets.alcoholic = data.sets.alcohol;
    }

    store.patch('dataset', data);

    // Update economics with dataset values
    const economics = structuredClone(store.get('economics'));

    if (data.packages) {
      const getPkgPrice = (pkg) => num(pkg?.priceMid ?? pkg?.price);
      economics.pkg = {
        soda:    getPkgPrice(data.packages.soda) || economics.pkg.soda,
        refresh: getPkgPrice(data.packages.refreshment || data.packages.refresh) || economics.pkg.refresh,
        deluxe:  getPkgPrice(data.packages.deluxe) || economics.pkg.deluxe
      };
    }

    if (data.rules) {
      economics.grat = num(data.rules.gratuity) || economics.grat;
      economics.deluxeCap =
        num(data.rules.caps?.deluxeAlcohol ?? data.rules.deluxeCap) || economics.deluxeCap;
    }

    store.patch('economics', economics);
    announce('Pricing data loaded');
  } catch (error) {
    console.warn('[Core] Dataset load failed, using fallback:', error);
    store.patch('dataset', FALLBACK_DATASET);
    store.patch('ui.fallbackBanner', true);
    announce('Using default pricing', 'polite');
  }
}

/* ==================== FX RATES ==================== */
const FX_STORAGE_KEY = 'itw:fx:v10';
const FX_MAX_AGE_MS = CONFIG.FX_REFRESH_HOURS * 60 * 60 * 1000;
const SUPPORTED_CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];

let currentCurrency = 'USD';
let fxRates = {
  base: 'USD',
  asOf: null,
  rates: { USD: 1 },
  timestamp: null
};

async function loadFXRates() {
  // Load saved currency preference
  try {
    const saved = localStorage.getItem('itw:currency');
    if (saved && SUPPORTED_CURRENCIES.includes(saved.toUpperCase())) {
      currentCurrency = saved.toUpperCase();
    }
  } catch (e) {}

  // Check cache
  try {
    const cached = localStorage.getItem(FX_STORAGE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - (data.timestamp || 0);
      if (age < FX_MAX_AGE_MS) {
        fxRates = data;
        return;
      }
    }
  } catch (e) {}

  // Fetch fresh rates
  try {
    const targets = SUPPORTED_CURRENCIES.filter(c => c !== 'USD').join(',');
    const url = `https://api.frankfurter.app/latest?from=USD&to=${encodeURIComponent(targets)}`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('FX fetch failed');

    const data = await response.json();

    fxRates = {
      base: data.base || 'USD',
      asOf: data.date,
      rates: { USD: 1, ...(data.rates || {}) },
      timestamp: Date.now()
    };

    localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(fxRates));
  } catch (error) {
    console.warn('[Core] FX fetch failed:', error);
  }
}

function convertUSD(amount, toCurrency = currentCurrency) {
  const rate = fxRates.rates[toCurrency] || 1;
  return amount * rate;
}

// Proper handling of zero values and fallback formatting
function formatMoney(amount) {
  const converted = convertUSD(amount, currentCurrency);
  const value = Number.isFinite(converted) ? converted : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currentCurrency
    }).format(value);
  } catch (e) {
    return `${value.toFixed(2)} ${currentCurrency}`;
  }
}

function setupCurrencySelector() {
  const selector = document.getElementById('currency-select');
  if (!selector) return;

  selector.value = currentCurrency;
  selector.addEventListener('change', () => {
    currentCurrency = selector.value.toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(currentCurrency)) currentCurrency = 'USD';

    localStorage.setItem('itw:currency', currentCurrency);

    setTimeout(() => {
      window.renderAll?.();
    }, 100);
  });
}

/* ==================== WORKER INTEGRATION ==================== */
let calcWorker = null;
let workerReady = false;

function initializeWorker() {
  if (!USE_WORKER) return false;
  if (calcWorker) return true;

  try {
    calcWorker = new Worker(WORKER_URL, { type: 'module' });

    calcWorker.onmessage = (event) => {
      const { type, payload } = event.data || {};

      if (type === 'ready') {
        workerReady = true;
        console.log('[Core] Worker ready');
        return;
      }

      if (type === 'result') {
        store.patch('results', payload);
        document.dispatchEvent(new CustomEvent('itw:calc-updated'));
      }
    };

    calcWorker.onerror = (error) => {
      console.error('[Core] Worker error:', error);
      workerReady = false;
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
function debounce(fn, ms = CONFIG.CALC_DEBOUNCE_MS) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

function scheduleCalculation() {
  const state = store.get();
  const { inputs, economics, dataset } = state;

  // Check if we can use worker
  const canUseWorker = initializeWorker() && workerReady;
  if (canUseWorker) {
    calcWorker.postMessage({
      type: 'compute',
      payload: {
        inputs,
        economics,
        dataset: dataset || FALLBACK_DATASET
      }
    });
    return;
  }

  // Fallback to main thread
  if (!window.ITW_MATH || typeof window.ITW_MATH.compute !== 'function') {
    console.warn('[Core] Math module not available');
    store.patch('results', initialState.results);
    return;
  }

  try {
    const results = window.ITW_MATH.compute(
      inputs,
      economics,
      dataset || FALLBACK_DATASET
    );
    store.patch('results', results);
    document.dispatchEvent(new CustomEvent('itw:calc-updated'));
  } catch (error) {
    console.error('[Core] Calculation error:', error);
    store.patch('results', initialState.results);
  }
}

const debouncedCalc = debounce(scheduleCalculation);

/* ==================== INPUT WIRING ==================== */
// Use 'change' to avoid duplicate fires; add 'input' only for range live UI
function wireInputs() {
  $$('[data-input]').forEach((input) => {
    input.addEventListener('change', (e) => {
      const key = input.dataset.input;
      const value = input.type === 'checkbox' ? e.target.checked : e.target.value;
      updateInput(key, value);
      scheduleCalculation();
      saveToStorage();
    });

    // Real-time feedback for range inputs
    if (input.type === 'range') {
      input.addEventListener('input', (e) => {
        const key = input.dataset.input;
        if (key === 'seaweight') {
          const output = document.getElementById('sea-weight-val');
          if (output) output.textContent = `${e.target.value}%`;
        }
      });
    }
  });
}

// Handle all input types including vouchers and coffee card fields
function updateInput(key, rawValue) {
  const parsed = key === 'seaapply' ? Boolean(rawValue) : num(rawValue);

  // Map hyphenated keys to camelCase
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
      const days = clamp(Math.round(parsed), 1, 365);
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
      store.patch('inputs.seaWeight', clamp(parsed, 0, CONFIG.SEA_WEIGHT_MAX));
      break;

    case 'adults':
      store.patch('inputs.adults', clamp(Math.round(parsed), 1, 20));
      break;

    case 'minors':
      store.patch('inputs.minors', clamp(Math.round(parsed), 0, 20));
      break;

    case 'coffeeCards':
      store.patch('inputs.coffeeCards', clamp(Math.round(parsed), 0, 10));
      break;

    case 'coffeePunches':
      store.patch('inputs.coffeePunches', clamp(parsed, 0, 5));
      break;

    case 'voucherAdult':
      store.patch('inputs.voucherAdult', clamp(Math.round(parsed), 0, CONFIG.VOUCHER_MAX_PER_PERSON));
      break;

    case 'voucherMinor':
      store.patch('inputs.voucherMinor', clamp(Math.round(parsed), 0, CONFIG.VOUCHER_MAX_PER_PERSON));
      break;

    default:
      // Must be a drink type
      if (normalizedKey in initialState.inputs.drinks) {
        store.patch(`inputs.drinks.${normalizedKey}`, Math.max(0, parsed));
      } else {
        console.warn(`[Core] Unknown input key: ${key}`);
      }
      break;
  }
}

/* ==================== GLOBAL HELPERS ==================== */
window.resetInputs = () => {
  store.patch('inputs', structuredClone(initialState.inputs));
  scheduleCalculation();
  saveToStorage();
  announce('All inputs reset');
};

window.shareScenario = () => {
  try {
    navigator.clipboard.writeText(location.href);
    announce('Link copied to clipboard');
  } catch (e) {
    console.error('[Core] Failed to copy link:', e);
  }
};

window.refreshDataset = async () => {
  await loadDataset();
  scheduleCalculation();
};

/* ==================== EXPOSE API ==================== */
window.ITW = Object.assign(window.ITW || {}, {
  version: VERSION,
  store,
  formatMoney,
  getCurrency: () => currentCurrency,
  scheduleCalc: scheduleCalculation,
  debouncedCalc,
  resetInputs: window.resetInputs,
  shareScenario: window.shareScenario,
  refreshDataset: window.refreshDataset
});

/* ==================== INITIALIZATION ==================== */
async function initialize() {
  console.log(`[Core] Initializing v${VERSION}`);

  // Load saved state
  loadFromStorage();

  // Set up currency
  await loadFXRates();
  setupCurrencySelector();

  // Load dataset
  await loadDataset();

  // Initialize worker
  if (USE_WORKER) {
    initializeWorker();
  }

  // Wire up inputs
  wireInputs();

  // Initial calculation
  scheduleCalculation();

  // Auto-save before unload
  window.addEventListener('beforeunload', saveToStorage);

  console.log(`[Core] Initialized v${VERSION}`);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
