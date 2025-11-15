/**
 * Royal Caribbean Drink Calculator - Unified Core Engine
 * Version: 1.003.000
 * 
 * "Whatever you do, work heartily, as for the Lord and not for men"
 * - Colossians 3:23
 * 
 * Soli Deo Gloria ✝️
 * 
 * PHASE 1 COMPLETE - All 12 Items:
 * ✅ #1  safeClone() replaces fake structuredClone
 * ✅ #2  hydrateAllowlist() prevents prototype pollution
 * ✅ #3  Unified math API (one compute function)
 * ✅ #4  parseQty() handles international numbers & ranges
 * ✅ #5  Inline package price editing support
 * ✅ #6  Presets moved to UI layer (removed from core)
 * ✅ #7  TTL tampering limits (90 days, no future timestamps)
 * ✅ #8  Safe render (textContent only)
 * ✅ #9  Gentle nudges system (breakeven suggestions)
 * ✅ #10 Health guidelines (CDC threshold warnings)
 * ✅ #11 Solo traveler preset (in UI layer)
 * ✅ #12 Soda drinker preset (in UI layer)
 * 
 * v1.001.001 FIXES:
 * ✅ VERSION constant corrected (removed 'v' prefix)
 * ✅ console.log syntax errors fixed
 * ✅ localStorage version migration added
 */

(function() {
'use strict';

/* ==================== VERSION & INITIALIZATION GUARD ==================== */

const VERSION = '1.003.000'; // ✅ FIXED: Removed 'v' prefix

if (window.ITW_BOOTED) {
  console.warn('[Core] Already initialized, skipping duplicate init');
  return;
}

console.log(`[Core] v${VERSION} Initializing (Phase 1 Complete)...`); // ✅ FIXED: Backtick syntax

/* ==================== CONFIGURATION ==================== */

const CONFIG = Object.freeze({
  VERSION: VERSION,
  LIMITS: Object.freeze({
    MIN_DAYS: 1, MAX_DAYS: 365, MIN_ADULTS: 1, MAX_ADULTS: 20,
    MIN_MINORS: 0, MAX_MINORS: 20, SEA_WEIGHT_MAX: 40,
    VOUCHER_MAX_PER_PERSON: 10, MAX_DRINK_QTY: 99,
    PKG_PRICE_MIN: 5, PKG_PRICE_MAX: 150 // ✅ #5 inline editing
  }),
  RULES: Object.freeze({
    GRATUITY: 0.18, DELUXE_CAP_FALLBACK: 14.0,
    DELUXE_DAILY_LIMIT: 15, CALC_DEBOUNCE_MS: 120,
    STORAGE_MAX_AGE_DAYS: 90 // ✅ #7 TTL limit
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
    enabled: true, // ✅ RE-ENABLED: Fixed worker validation (hasOwnProperty vs 'in' operator)
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
      soda: 2.00, coffeeSmall: 4.50, coffeeLarge: 4.50, teaprem: 3.50, freshjuice: 6.00,
      mocktail: 6.50, energy: 5.50, milkshake: 6.95, bottledwater: 2.95,
      beer: 8.50, wine: 11.00, cocktail: 13.00, spirits: 10.00
    },
    sets: {
      refresh: ['soda', 'coffeeSmall', 'coffeeLarge', 'teaprem', 'freshjuice', 'mocktail',
                'energy', 'milkshake', 'bottledwater'],
      soda: ['soda'],
      alcoholic: ['beer', 'wine', 'cocktail', 'spirits']
    }
  })
});

window.ITW_CONFIG = CONFIG;

/* ==================== UTILITIES ==================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * ✅ PHASE 1 ITEM #1: Safe shallow clone for POJOs
 * "The LORD is my rock" - Psalm 18:2
 * Replaces fake structuredClone polyfill
 */
function safeClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => safeClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = safeClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Basic number parser (simple version)
 */
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
 * ✅ PHASE 1 ITEM #4: International & range-aware quantity parser
 * "Trust in the LORD with all your heart" - Proverbs 3:5
 * 
 * Handles:
 * - Ranges: "2-3" or "2–3" → {min: 2, max: 3}
 * - EU decimals: "1,5" → 1.5
 * - EU thousands: "3.000" → 3000
 * - US format: "3,000" → 3000
 * - Currency symbols: "$12.50" → 12.5
 */
function parseQty(value, context = 'generic') {
  if (value === null || value === undefined || value === '') {
    return { value: 0, isRange: false, valid: true };
  }
  
  if (typeof value === 'number') {
    return { value: Math.max(0, value), isRange: false, valid: true };
  }
  
  let str = String(value).trim();
  str = str.replace(/[$€£¥₹\s]/g, '');
  
  // Check for range patterns: "2-3" or "2–3"
  const rangeMatch = str.match(/^(\d+[.,]?\d*)\s*[-–]\s*(\d+[.,]?\d*)$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1].replace(',', '.'));
    const max = parseFloat(rangeMatch[2].replace(',', '.'));
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return {
        value: { min: Math.max(0, Math.min(min, max)), max: Math.max(0, Math.max(min, max)) },
        isRange: true,
        valid: true
      };
    }
  }
  
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  
  let parsed;
  
  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // EU format: 1.234,56 → 1234.56
      parsed = parseFloat(str.replace(/\./g, '').replace(',', '.'));
    } else {
      // US format: 1,234.56 → 1234.56
      parsed = parseFloat(str.replace(/,/g, ''));
    }
  } else if (hasComma) {
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // EU decimal: 1,5 → 1.5
      parsed = parseFloat(str.replace(',', '.'));
    } else {
      // US thousands: 1,234 → 1234
      parsed = parseFloat(str.replace(/,/g, ''));
    }
  } else if (hasDot) {
    const parts = str.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // US decimal: 1.5 → 1.5
      parsed = parseFloat(str);
    } else {
      // EU thousands: 1.234 → 1234
      parsed = parseFloat(str.replace(/\./g, ''));
    }
  } else {
    parsed = parseFloat(str);
  }
  
  if (!Number.isFinite(parsed)) {
    return { value: 0, isRange: false, valid: false, error: 'Invalid number format' };
  }
  
  return { value: Math.max(0, parsed), isRange: false, valid: true };
}

/**
 * ✅ PHASE 1 ITEM #2: Allow-list hydrator (replaces deepMerge)
 * "Keep thy heart with all diligence" - Proverbs 4:23
 * 
 * Prevents prototype pollution by only accepting known keys
 */
function hydrateAllowlist(base, stored, allowedKeys) {
  const result = safeClone(base);
  
  if (!stored || typeof stored !== 'object') return result;
  
  for (const key of allowedKeys) {
    if (key in stored && key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      const storedValue = stored[key];
      const baseValue = base[key];
      
      if (isObject(storedValue) && isObject(baseValue)) {
        const nestedKeys = Object.keys(baseValue);
        result[key] = hydrateAllowlist(baseValue, storedValue, nestedKeys);
      } else {
        result[key] = storedValue;
      }
    }
  }
  
  return result;
}

function debounce(fn, ms = CONFIG.RULES.CALC_DEBOUNCE_MS) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * ✅ PHASE 1 ITEM #8: Safe announce (textContent only)
 */
function announce(message, level = 'polite') {
  const id = level === 'assertive' ? 'a11y-alerts' : 'a11y-status';
  const element = document.getElementById(id);
  if (element) {
    element.textContent = String(message);
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
  /**
   * ✅ PHASE 1 ITEM #7: TTL tampering limits
   * Reject timestamps older than 90 days or in the future
   */
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
      
      // ✅ PHASE 1 ITEM #7: TTL tampering protection
      const now = Date.now();
      const maxAge = CONFIG.RULES.STORAGE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
      
      // Reject future timestamps
      if (item.timestamp > now) {
        console.warn('[Storage] Rejecting future timestamp');
        this.remove(key);
        return null;
      }
      
      // Reject timestamps older than max age
      if (now - item.timestamp > maxAge) {
        console.warn('[Storage] Rejecting stale data (>90 days)');
        this.remove(key);
        return null;
      }
      
      // Check TTL if specified
      if (item.ttl && now - item.timestamp > item.ttl) {
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
      const now = Date.now();
      const maxAge = CONFIG.RULES.STORAGE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
      
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          const item = JSON.parse(raw);
          
          if ((item.ttl && now - item.timestamp > item.ttl) ||
              (now - item.timestamp > maxAge) ||
              (item.timestamp > now)) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          localStorage.removeItem(key);
          cleared++;
        }
      }
      
      if (cleared > 0) console.log(`[Storage] Cleared ${cleared} expired items`); // ✅ FIXED: Backtick syntax
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
    const parsed = parseQty(value);
    const n = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
    const rounded = Math.round(n);
    return {
      value: clamp(rounded, CONFIG.LIMITS.MIN_DAYS, CONFIG.LIMITS.MAX_DAYS),
      valid: rounded >= CONFIG.LIMITS.MIN_DAYS && rounded <= CONFIG.LIMITS.MAX_DAYS,
      error: (rounded < CONFIG.LIMITS.MIN_DAYS || rounded > CONFIG.LIMITS.MAX_DAYS)
        ? `Must be between ${CONFIG.LIMITS.MIN_DAYS} and ${CONFIG.LIMITS.MAX_DAYS} days` : null
    };
  },
  
  seaDays(value, totalDays) {
    const parsed = parseQty(value);
    const n = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
    const rounded = Math.round(n);
    return {
      value: clamp(rounded, 0, totalDays),
      valid: rounded >= 0 && rounded <= totalDays,
      error: rounded > totalDays ? `Cannot exceed total cruise days (${totalDays})` : null
    };
  },
  
  seaWeight(value) {
    const parsed = parseQty(value);
    const n = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
    const rounded = Math.round(n);
    return {
      value: clamp(rounded, 0, CONFIG.LIMITS.SEA_WEIGHT_MAX),
      valid: rounded >= 0 && rounded <= CONFIG.LIMITS.SEA_WEIGHT_MAX,
      error: (rounded < 0 || rounded > CONFIG.LIMITS.SEA_WEIGHT_MAX)
        ? `Must be between 0 and ${CONFIG.LIMITS.SEA_WEIGHT_MAX}%` : null
    };
  },
  
  adults(value) {
    const parsed = parseQty(value);
    const n = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
    const rounded = Math.round(n);
    return {
      value: clamp(rounded, CONFIG.LIMITS.MIN_ADULTS, CONFIG.LIMITS.MAX_ADULTS),
      valid: rounded >= CONFIG.LIMITS.MIN_ADULTS && rounded <= CONFIG.LIMITS.MAX_ADULTS,
      error: (rounded < CONFIG.LIMITS.MIN_ADULTS || rounded > CONFIG.LIMITS.MAX_ADULTS)
        ? `Must be between ${CONFIG.LIMITS.MIN_ADULTS} and ${CONFIG.LIMITS.MAX_ADULTS}` : null
    };
  },
  
  minors(value) {
    const parsed = parseQty(value);
    const n = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
    const rounded = Math.round(n);
    return {
      value: clamp(rounded, CONFIG.LIMITS.MIN_MINORS, CONFIG.LIMITS.MAX_MINORS),
      valid: rounded >= 0 && rounded <= CONFIG.LIMITS.MAX_MINORS,
      error: (rounded < CONFIG.LIMITS.MIN_MINORS || rounded > CONFIG.LIMITS.MAX_MINORS)
        ? `Must be between ${CONFIG.LIMITS.MIN_MINORS} and ${CONFIG.LIMITS.MAX_MINORS}` : null
    };
  },
  
  drinkQty(value) {
    const parsed = parseQty(value);
    if (parsed.isRange) {
      return {
        value: parsed.value,
        valid: true,
        error: null,
        isRange: true
      };
    }
    const n = parsed.value;
    return {
      value: Math.max(0, n),
      valid: n >= 0 && n <= CONFIG.LIMITS.MAX_DRINK_QTY,
      error: (n < 0 || n > CONFIG.LIMITS.MAX_DRINK_QTY)
        ? `Must be between 0 and ${CONFIG.LIMITS.MAX_DRINK_QTY}` : null,
      isRange: false
    };
  },
  
  voucherCount(value) {
    const parsed = parseQty(value);
    const n = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
    const rounded = Math.round(n);
    return {
      value: clamp(rounded, 0, CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON),
      valid: rounded >= 0 && rounded <= CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON,
      error: (rounded < 0 || rounded > CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON)
        ? `Must be between 0 and ${CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON}` : null
    };
  },
  
  /**
   * ✅ PHASE 1 ITEM #5: Package price validation for inline editing
   */
  packagePrice(value) {
    const parsed = parseQty(value);
    const n = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
    return {
      value: clamp(n, CONFIG.LIMITS.PKG_PRICE_MIN, CONFIG.LIMITS.PKG_PRICE_MAX),
      valid: n >= CONFIG.LIMITS.PKG_PRICE_MIN && n <= CONFIG.LIMITS.PKG_PRICE_MAX,
      error: (n < CONFIG.LIMITS.PKG_PRICE_MIN || n > CONFIG.LIMITS.PKG_PRICE_MAX)
        ? `Must be between ${CONFIG.LIMITS.PKG_PRICE_MIN} and ${CONFIG.LIMITS.PKG_PRICE_MAX}` : null
    };
  }
};

/* ==================== STATE MANAGEMENT ==================== */

function createStore(initialState) {
  let state = safeClone(initialState);
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
    const nextState = safeClone(state);
    Object.keys(updates).forEach(key => {
      nextState[key] = updates[key];
    });

    const changedKeys = Object.keys(nextState).filter(
      key => JSON.stringify(nextState[key]) !== JSON.stringify(state[key])
    );

    // CRITICAL FIX: Always notify 'results' subscribers, even if data appears unchanged
    // This ensures UI updates after calculations complete
    const keysToNotify = new Set(changedKeys);
    Object.keys(updates).forEach(key => {
      if (key === 'results') {
        keysToNotify.add(key);
        console.log('[Store] 🔥 FORCING results notification (bypass change detection)');
      }
    });

    const finalKeysToNotify = Array.from(keysToNotify);

    console.log('[Store] Keys changed:', changedKeys);
    console.log('[Store] Keys to notify:', finalKeysToNotify);

    if (finalKeysToNotify.length === 0) {
      console.log('[Store] No changes detected, skipping notification');
      return;
    }

    state = nextState;

    finalKeysToNotify.forEach(key => {
      const callbacks = subscribers.get(key);
      console.log(`[Store] Notifying ${callbacks?.size || 0} subscriber(s) for key: ${key}`);
      if (callbacks) callbacks.forEach(cb => {
        try {
          cb(state[key], state);
        } catch (err) {
          console.error(`[Store] Subscriber error for key "${key}":`, err);
        }
      });
    });

    const globalCallbacks = subscribers.get('*');
    if (globalCallbacks) {
      console.log(`[Store] Notifying ${globalCallbacks.size} global subscriber(s)`);
      globalCallbacks.forEach(cb => {
        try {
          cb(state, state);
        } catch (err) {
          console.error('[Store] Global subscriber error:', err);
        }
      });
    }
  }
  
  function patch(path, value) {
    if (!path) return;

    console.log(`[Store] patch("${path}") called`);

    const keys = path.split('.');
    if (keys.length === 1) {
      if (keys[0] === 'results') {
        console.log('[Store] ⚡ Patching RESULTS:', value);
      }
      set({ [keys[0]]: value });
      return;
    }

    const nextState = safeClone(state);
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
    console.log('[Store] ✓ New subscription to keys:', list);

    list.forEach(key => {
      if (!subscribers.has(key)) subscribers.set(key, new Set());
      subscribers.get(key).add(callback);
    });

    console.log(`[Store] Total subscribers for '${list[0]}':`, subscribers.get(list[0])?.size || 0);

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
    adults: 2, minors: 0, coffeeCards: 0, coffeePunches: 0,
    voucherAdult: 0, voucherMinor: 0,
    drinks: {
      soda: 0, coffeeSmall: 0, coffeeLarge: 0, teaprem: 0, freshjuice: 0,
      mocktail: 0, energy: 0, milkshake: 0, bottledwater: 0,
      beer: 0, wine: 0, cocktail: 0, spirits: 0
    }
  },
  economics: {
    pkg: { soda: 13.99, refresh: 34.0, deluxe: 85.0, coffee: 31.0 },
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
    policyNote: null,
    nudges: [], // ✅ #9 Gentle nudges
    healthNote: null // ✅ #10 Health guidelines
  },
  ui: {
    fallbackBanner: false,
    fxStale: false,
    chartReady: false,
    forcedPackage: null // 'soda', 'refresh', 'deluxe', or null for auto-recommendation
  }
};

const store = createStore(initialState);
window.__itwStore = store;

/* ==================== PERSISTENCE ==================== */

/**
 * ✅ PHASE 1 ITEM #2: Uses hydrateAllowlist instead of deepMerge
 * ✅ v1.001.001 NEW: Version migration to prevent stale state issues
 * "A new heart also will I give you" - Ezekiel 36:26
 */
function loadFromStorage() {
  try {
    const saved = SafeStorage.get(CONFIG.STORAGE_KEYS.state);
    if (!saved) return;
    
    // ✅ NEW v1.001.001: Version migration check
    // Prevents ghost calculations from incompatible versions
    const storedVersion = saved.version || '0.0.0';
    if (storedVersion !== VERSION) {
      console.log(`[Core] Version mismatch (${storedVersion} → ${VERSION}), clearing state`);
      SafeStorage.remove(CONFIG.STORAGE_KEYS.state);
      announce('Calculator updated, settings reset');
      return;
    }
    
    if (saved.inputs) {
      const allowedInputKeys = ['days', 'seaDays', 'seaApply', 'seaWeight', 'adults', 'minors', 
                                'coffeeCards', 'coffeePunches', 'voucherAdult', 'voucherMinor', 'drinks'];
      const hydratedInputs = hydrateAllowlist(initialState.inputs, saved.inputs, allowedInputKeys);
      store.patch('inputs', hydratedInputs);
    }
    
    if (saved.economics) {
      const allowedEconKeys = ['pkg', 'grat', 'deluxeCap'];
      const hydratedEcon = hydrateAllowlist(initialState.economics, saved.economics, allowedEconKeys);
      store.patch('economics', hydratedEcon);
    }
    
    console.log('[Core] State loaded from storage (protected by allowlist)');
  } catch (e) {
    console.warn('[Core] Failed to load from storage:', e);
  }
}

function saveToStorage() {
  try {
    const state = store.get();
    const { inputs, economics } = state;
    SafeStorage.set(CONFIG.STORAGE_KEYS.state, { inputs, economics, version: VERSION });
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
    console.warn(`[Core] Unsupported currency: ${code}`); // ✅ FIXED: Backtick syntax
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
      console.log(`[Core] Loaded brand: ${brand.label}`); // ✅ FIXED: Backtick syntax
      return brand;
    }
  } catch (error) {
    console.warn('[Core] Failed to load brand config:', error);
  }
  return null;
}

/* ==================== DATASET LOADING ==================== */

async function loadDataset() {
  try {
    const brand = store.get('brand') || await loadBrandConfig();
    const dataURL = brand?.resources?.data || `/assets/data/lines/royal-caribbean.json?v=${VERSION}`;
    
    const response = await fetch(dataURL, { cache: 'default', credentials: 'omit' });
    if (!response.ok) throw new Error('Dataset fetch failed');
    
    const data = await response.json();
    
    if (!data.prices && Array.isArray(data.items)) {
      data.prices = {};
      data.items.forEach(item => {
        if (item && item.id) {
          data.prices[item.id] = num(item.price);
        }
      });
    }
    
    if (!data.sets) data.sets = {};
    if (!data.sets.alcoholic && data.sets.alcohol) {
      data.sets.alcoholic = data.sets.alcohol;
    }
    
    store.patch('dataset', data);
    
    const economics = safeClone(store.get('economics'));
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
    
    const economics = safeClone(store.get('economics'));
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
    calcWorker = new Worker(CONFIG.WORKER.url);
    
    calcWorker.onmessage = (event) => {
      const { type, payload } = event.data || {};
      
      if (type === 'ready') {
        workerReady = true;
        console.log('[Core] Worker ready');
        return;
      }
      
      if (type === 'result') {
        store.patch('results', payload);
        calculationInProgress = false;
        document.dispatchEvent(new CustomEvent('itw:calc-updated'));
      }
    };
    
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
 * ✅ PHASE 1 ITEM #3: Unified math API (one compute function)
 */
function scheduleCalculation() {
  console.log('[Calc] ======================================');
  console.log('[Calc] scheduleCalculation() called');
  console.log('[Calc] ======================================');

  if (calculationInProgress) {
    console.warn('[Calc] Calculation already in progress, skipping');
    return;
  }

  calculationInProgress = true;
  console.log('[Calc] Starting calculation...');

  const state = store.get();
  const { inputs, economics, dataset, ui } = state;

  console.log('[Calc] Inputs:', inputs);
  console.log('[Calc] Economics:', economics);
  console.log('[Calc] Forced package:', ui?.forcedPackage || 'none (auto-recommend)');

  const hasVouchers = (inputs.voucherAdult > 0) || (inputs.voucherMinor > 0);

  const payload = {
    inputs,
    economics,
    dataset: dataset || CONFIG.FALLBACK_DATASET,
    vouchers: hasVouchers ? {
      adultCountPerDay: inputs.voucherAdult || 0,
      minorCountPerDay: inputs.voucherMinor || 0,
      perVoucherValue: economics.deluxeCap || 14.0
    } : null,
    forcedPackage: ui?.forcedPackage || null  // ✅ NEW: Package forcing feature
  };

  const canUseWorker = initializeWorker() && workerReady;

  if (canUseWorker) {
    console.log('[Calc] Using worker for calculation');
    calcWorker.postMessage({ type: 'compute', payload: payload });
    return;
  }

  // Fallback to main thread
  console.log('[Calc] Using main thread for calculation');

  if (!window.ITW_MATH || typeof window.ITW_MATH.compute !== 'function') {
    console.error('[Calc] Math module not available!');
    store.patch('results', initialState.results);
    calculationInProgress = false;
    return;
  }

  try {
    console.log('[Calc] Calling ITW_MATH.compute()...');

    // ✅ PHASE 1 ITEM #3: Unified API - single compute() function
    const results = window.ITW_MATH.compute(
      payload.inputs,
      payload.economics,
      payload.dataset,
      payload.vouchers,
      payload.forcedPackage  // ✅ NEW: Package forcing
    );

    console.log('[Calc] Computation complete, results:', results);
    console.log('[Calc] Patching store with results...');

    store.patch('results', results);
    calculationInProgress = false;

    console.log('[Calc] ✓ Calculation complete, store updated');
    console.log('[Calc] Dispatching itw:calc-updated event');

    document.dispatchEvent(new CustomEvent('itw:calc-updated'));
  } catch (error) {
    console.error('[Calc] ✗ Calculation error:', error);
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
  const parsed = key === 'seaapply' ? Boolean(rawValue) : parseQty(rawValue);
  const value = parsed.isRange ? (parsed.value.min + parsed.value.max) / 2 : parsed.value;
  
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
      store.patch('inputs.seaApply', Boolean(rawValue));
      break;
    case 'days': {
      const days = clamp(Math.round(value), CONFIG.LIMITS.MIN_DAYS, CONFIG.LIMITS.MAX_DAYS);
      store.patch('inputs.days', days);
      break;
    }
    case 'seaDays': {
      const days = store.get('inputs').days || 7;
      const sea = clamp(Math.round(value), 0, days);
      store.patch('inputs.seaDays', sea);
      break;
    }
    case 'seaWeight':
      store.patch('inputs.seaWeight', clamp(value, 0, CONFIG.LIMITS.SEA_WEIGHT_MAX));
      break;
    case 'adults':
      store.patch('inputs.adults', clamp(Math.round(value), CONFIG.LIMITS.MIN_ADULTS, CONFIG.LIMITS.MAX_ADULTS));
      break;
    case 'minors':
      store.patch('inputs.minors', clamp(Math.round(value), CONFIG.LIMITS.MIN_MINORS, CONFIG.LIMITS.MAX_MINORS));
      break;
    case 'coffeeCards':
      store.patch('inputs.coffeeCards', clamp(Math.round(value), 0, 10));
      break;
    case 'coffeePunches':
      store.patch('inputs.coffeePunches', clamp(value, 0, 5));
      break;
    case 'voucherAdult':
      store.patch('inputs.voucherAdult', clamp(Math.round(value), 0, CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON));
      break;
    case 'voucherMinor':
      store.patch('inputs.voucherMinor', clamp(Math.round(value), 0, CONFIG.LIMITS.VOUCHER_MAX_PER_PERSON));
      break;
    default:
      if (CONFIG.DRINK_KEYS.includes(normalizedKey)) {
        store.patch(`inputs.drinks.${normalizedKey}`, Math.max(0, value));
      } else {
        console.warn(`[Core] Unknown input key: ${key}`); // ✅ FIXED: Backtick syntax
      }
      break;
  }
}

/* ==================== GLOBAL HELPERS ==================== */

function resetInputs() {
  store.patch('inputs', safeClone(initialState.inputs));
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

/**
 * ✅ PHASE 1 ITEM #5: Inline package price editing
 * "In all thy ways acknowledge him" - Proverbs 3:6
 */
function updatePackagePrice(packageKey, newPrice) {
  const validated = Validation.packagePrice(newPrice);
  if (!validated.valid) {
    console.warn(`[Core] Invalid package price: ${newPrice}`); // ✅ FIXED: Backtick syntax
    return false;
  }
  
  const economics = safeClone(store.get('economics'));
  economics.pkg[packageKey] = validated.value;
  store.patch('economics', economics);
  saveToStorage();
  scheduleCalculation();
  announce(`${packageKey} package price updated`); // ✅ FIXED: Backtick syntax
  return true;
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
  updatePackagePrice, // ✅ #5 inline editing
  parseQty, // ✅ #4 export for UI use
  announce,
  _debug: {
    getState: () => store.get(),
    getFXRates: () => ({ ...fxRates }),
    getWorkerStatus: () => ({ ready: workerReady, inProgress: calculationInProgress })
  }
});

/* ==================== INITIALIZATION ==================== */

async function initialize() {
  console.log(`[Core] Initializing v${VERSION} (Phase 1 Complete)`); // ✅ FIXED: Backtick syntax
  
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
  console.log(`[Core] ✓ Initialized v${VERSION} - Phase 1 Complete`); // ✅ FIXED: Backtick syntax
  announce('Calculator ready');
  
  // ✅ Show calculator, hide loading
  const loadingState = document.getElementById('loading-state');
  const calculatorApp = document.getElementById('calculator-app');
  if (loadingState) loadingState.style.display = 'none';
  if (calculatorApp) calculatorApp.style.display = 'block';
}

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

})();

// "Whatever you do, work heartily, as for the Lord" - Colossians 3:23
// Soli Deo Gloria ✝️
