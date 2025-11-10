/**
 * Royal Caribbean Drink Calculator - Core Application
 * calculator-core.jsVersion: 10.0.0
 * Soli Deo Gloria ✝️
 * 
 * Main orchestrator: manages state, coordinates worker, handles persistence
 */

const VERSION = '10.0.0';

console.log(`[Core] v${VERSION} Initializing...`);

/* ==================== CONFIGURATION ==================== */

const CONFIG = {
  QUIZ_EXPIRY_DAYS: 90,
  SEA_WEIGHT_MAX: 40,
  DELUXE_CAP_FALLBACK: 14.0,
  VOUCHER_MAX_PER_PERSON: 10,
  FX_REFRESH_HOURS: 12,
  FX_STALE_HOURS: 48,
  CALC_DEBOUNCE_MS: 120
};

window.ITW_CONFIG = CONFIG;

const USE_WORKER = true;
const WORKER_URL = `/assets/js/calculator-worker.js?v=${VERSION}`;
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

/* ==================== UTILITIES ==================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function num(value) {
  const n = typeof value === 'number' ? value :
            parseFloat(String(value).replace(/[^\d.-]/g, ''));
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

/* ==================== STATE MANAGEMENT ==================== */

function createStore(initialState) {
  let state = structuredClone(initialState);
  const subscribers = new Map();
  
  function get() {
    return state;
  }
  
  function set(updates) {
    const nextState = { ...state, ...updates };
    const changedKeys = Object.keys(nextState).filter(key =>
      JSON.stringify(nextState[key]) !== JSON.stringify(state[key])
    );
    
    if (changedKeys.length === 0) return;
    
    state = nextState;
    
    changedKeys.forEach(key => {
      const callbacks = subscribers.get(key);
      if (callbacks) {
        callbacks.forEach(callback => callback(state[key], state));
      }
    });
    
    const globalCallbacks = subscribers.get('*');
    if (globalCallbacks) {
      globalCallbacks.forEach(callback => callback(state, state));
    }
  }
  
  function patch(path, value) {
    const nextState = structuredClone(state);
    let reference = nextState;
    const keys = path.split('.');
    
    for (let i = 0; i < keys.length - 1; i++) {
      reference = reference[keys[i]];
    }
    
    reference[keys[keys.length - 1]] = value;
    set(nextState);
  }
  
  function subscribe(keys, callback) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    
    keyList.forEach(key => {
      if (!subscribers.has(key)) {
        subscribers.set(key, new Set());
      }
      subscribers.get(key).add(callback);
    });
    
    return () => {
      keyList.forEach(key => {
        subscribers.get(key)?.delete(callback);
      });
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
    calcMode: 'simple',
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
    const updates = structuredClone(store.get());
    
    if (data.inputs) updates.inputs = data.inputs;
    if (data.economics) updates.economics = data.economics;
    
    store.set(updates);
  } catch (e) {
    console.warn('[Core] Failed to load from storage:', e);
  }
}

function saveToStorage() {
  try {
    const { inputs, economics } = store.get();
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
        if (item && item.id) {
          data.prices[item.id] = num(item.price);
        }
      });
    }
    
    // Normalize sets
    if (!data.sets) data.sets = {};
    if (!data.sets.alcoholic && data.sets.alcohol) {
      data.sets.alcoholic = data.sets.alcohol;
    }
    
    store.patch('dataset', data);
    
    // Update economics with dataset values
    const economics = { ...store.get().economics };
    
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

function formatMoney(amount) {
  const converted = convertUSD(amount, currentCurrency);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currentCurrency
    }).format(converted || 0);
  } catch (e) {
    return `${converted.toFixed(2)} ${currentCurrency}`;
  }
}

function setupCurrencySelector() {
  const selector = document.getElementById('currency-select');
  if (!selector) return;
  
  selector.value = currentCurrency;
  
  selector.addEventListener('change', () => {
    currentCurrency = selector.value.toUpperCase();
    
    if (!SUPPORTED_CURRENCIES.includes(currentCurrency)) {
      currentCurrency = 'USD';
    }
    
    localStorage.setItem('itw:currency', currentCurrency);
    
    setTimeout(() => {
      window.renderAll?.();
    }, 100);
  });
}

/* ==================== WORKER INTEGRATION ==================== */

let calcWorker = null;
let workerReady = false;
let requestCounter = 0;

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
  const { inputs, economics, dataset } = store.get();
  
  // Check if we can use worker
  const canUseWorker = initializeWorker() && workerReady;
  
  if (canUseWorker) {
    const requestId = ++requestCounter;
    calcWorker.postMessage({
      type: 'compute',
      payload: {
        inputs,
        economics,
        dataset: dataset || FALLBACK_DATASET
      },
      id: requestId
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
  } catch (error) {
    console.error('[Core] Calculation error:', error);
    store.patch('results', initialState.results);
  }
}

const debouncedCalc = debounce(scheduleCalculation);

/* ==================== INPUT WIRING ==================== */

function wireInputs() {
  $$('[data-input]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const key = input.dataset.input;
      const value = input.type === 'checkbox' ? e.target.checked : e.target.value;
      
      updateInput(key, value);
      debouncedCalc();
    });
    
    input.addEventListener('change', (e) => {
      const key = input.dataset.input;
      const value = input.type === 'checkbox' ? e.target.checked : e.target.value;
      
      updateInput(key, value);
      scheduleCalculation();
      saveToStorage();
    });
  });
}

function updateInput(key, rawValue) {
  const parsed = key === 'seaapply' ? Boolean(rawValue) : num(rawValue);
  
  switch (key) {
    case 'seaapply':
      store.patch('inputs.seaApply', parsed);
      break;
    case 'days': {
      const days = clamp(Math.round(parsed), 1, 365);
      store.patch('inputs.days', days);
      break;
    }
    case 'seadays': {
      const days = store.get().inputs.days || 7;
      const sea = clamp(Math.round(parsed), 0, days);
      store.patch('inputs.seaDays', sea);
      break;
    }
    case 'seaweight':
      store.patch('inputs.seaWeight', clamp(parsed, 0, CONFIG.SEA_WEIGHT_MAX));
      
      const output = document.getElementById('sea-weight-val');
      if (output) output.textContent = `${clamp(parsed, 0, CONFIG.SEA_WEIGHT_MAX)}%`;
      break;
    case 'adults':
      store.patch('inputs.adults', clamp(Math.round(parsed), 1, 20));
      break;
    case 'minors':
      store.patch('inputs.minors', clamp(Math.round(parsed), 0, 20));
      break;
    default:
      store.patch(`inputs.drinks.${key}`, Math.max(0, parsed));
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

/* ==================== EXPOSE API ==================== */

window.ITW = Object.assign(window.ITW || {}, {
  version: VERSION,
  store,
  formatMoney,
  getCurrency: () => currentCurrency,
  scheduleCalc: scheduleCalculation,
  debouncedCalc
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
  
  // Set up auto-save
  window.addEventListener('beforeunload', saveToStorage);
  
  console.log(`[Core] Initialized v${VERSION}`);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
