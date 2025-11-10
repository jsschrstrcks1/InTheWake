/**
 * Configuration Module - Centralized App Settings
 * Version: 1.0.0
 */

export const CONFIG = {
  // Version
  VERSION: document.querySelector('meta[name="version"]')?.content || 'v.9.002.005',
  
  // API Endpoints
  API: {
    pricing: '/assets/data/lines/royal-caribbean.json',
    fxFrankfurter: 'https://api.frankfurter.app/latest',
    fxExchangeRate: 'https://api.exchangerate.host/latest'
  },
  
  // Cache Settings
  CACHE: {
    QUIZ_EXPIRY_DAYS: 90,
    FX_REFRESH_HOURS: 12,
    FX_STALE_HOURS: 48,
    PRICING_MAX_AGE_DAYS: 7
  },
  
  // Calculator Limits
  LIMITS: {
    MIN_DAYS: 1,
    MAX_DAYS: 365,
    MIN_ADULTS: 1,
    MAX_ADULTS: 20,
    MIN_MINORS: 0,
    MAX_MINORS: 20,
    SEA_WEIGHT_MAX: 40,
    VOUCHER_MAX_PER_PERSON: 10,
    MAX_DRINK_QTY: 99
  },
  
  // Business Rules
  RULES: {
    GRATUITY: 0.18,
    DELUXE_CAP_FALLBACK: 14.0,
    DELUXE_DAILY_LIMIT: 15,
    CALC_DEBOUNCE_MS: 120
  },
  
  // Supported Currencies
  CURRENCIES: ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'INR', 'CNY', 'MXN', 'BRL'],
  
  // Feature Flags
  FEATURES: {
    emailCTA: {
      enabled: true,
      showWhenSavingsAbove: 30,
      showWhenDrinksAbove: 4,
      alwaysShow: false
    },
    analytics: {
      enabled: false,
      provider: 'none'
    },
    quiz: true,
    presets: true,
    vouchers: true,
    itineraryMode: true,
    breakEvenTips: true
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    state: 'itw:rc:state:v1',
    currency: 'itw:currency',
    fx: 'itw:fx:v1',
    quiz: 'itw_quiz_v2',
    visited: 'calc_visited',
    csrf: 'csrf_token'
  },
  
  // Worker Configuration
  WORKER: {
    enabled: true,
    url: '/assets/js/drink-worker.js',
    timeout: 5000
  },
  
  // Fallback Dataset (used when API fails)
  FALLBACK_DATASET: {
    version: 'v.9.002.005',
    rules: {
      gratuity: 0.18,
      deluxeCap: 14.0
    },
    packages: {
      soda: 13.99,
      refresh: 34.0,
      deluxe: 85.0
    },
    prices: {
      soda: 2.00,
      coffee: 4.50,
      teaprem: 3.50,
      freshjuice: 6.00,
      mocktail: 6.50,
      energy: 5.50,
      milkshake: 6.95,
      bottledwater: 2.95,
      beer: 8.50,
      wine: 11.00,
      cocktail: 13.00,
      spirits: 10.00
    },
    sets: {
      refresh: ['soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail', 'energy', 'milkshake', 'bottledwater'],
      soda: ['soda'],
      alcoholic: ['beer', 'wine', 'cocktail', 'spirits']
    }
  },
  
  // Drink Categories
  DRINK_KEYS: [
    'soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail', 'energy',
    'milkshake', 'bottledwater', 'beer', 'wine', 'cocktail', 'spirits'
  ],
  
  DRINK_LABELS: {
    soda: 'Soda',
    coffee: 'Premium Coffee',
    teaprem: 'Specialty Tea',
    freshjuice: 'Fresh Juice/Smoothie',
    mocktail: 'Mocktail',
    energy: 'Energy Drink',
    milkshake: 'Milkshake',
    bottledwater: 'Bottled Water',
    beer: 'Beer',
    wine: 'Wine (glass)',
    cocktail: 'Cocktail',
    spirits: 'Spirits/Shot'
  }
};

// Freeze to prevent mutation
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.CACHE);
Object.freeze(CONFIG.LIMITS);
Object.freeze(CONFIG.RULES);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.WORKER);
Object.freeze(CONFIG.FALLBACK_DATASET);

export default CONFIG;
