/**
 * Currency Module - FX Rate Management & Conversion
 * Version: 1.0.0
 */

import CONFIG from './config.js';
import SafeStorage from './storage.js';

export class Currency {
  constructor() {
    this.currentCurrency = 'USD';
    this.rates = { USD: 1 };
    this.lastUpdate = null;
    this.source = null;
    this.isStale = false;
  }

  /**
   * Initialize - load saved currency and rates
   */
  async init() {
    // Load saved currency preference
    const saved = SafeStorage.get(CONFIG.STORAGE_KEYS.currency);
    if (saved && CONFIG.CURRENCIES.includes(saved)) {
      this.currentCurrency = saved;
    }
    
    // Load cached FX rates
    const cachedFX = SafeStorage.get(CONFIG.STORAGE_KEYS.fx);
    if (cachedFX) {
      this.rates = cachedFX.rates || { USD: 1 };
      this.lastUpdate = cachedFX.timestamp;
      this.source = cachedFX.source;
      
      // Check if stale
      const ageHours = (Date.now() - this.lastUpdate) / (60 * 60 * 1000);
      this.isStale = ageHours > CONFIG.CACHE.FX_STALE_HOURS;
    }
    
    // Refresh if needed
    if (!cachedFX || this.isStale) {
      await this.refresh();
    }
  }

  /**
   * Refresh FX rates from API
   */
  async refresh() {
    if (navigator.onLine === false) {
      console.log('[Currency] Offline, using cached rates');
      return false;
    }
    
    try {
      // Try Frankfurter first
      const data = await this.fetchFrankfurter();
      
      this.rates = { USD: 1, ...data.rates };
      this.lastUpdate = Date.now();
      this.source = 'ECB (Frankfurter)';
      this.isStale = false;
      
      // Cache for 12 hours
      SafeStorage.set(
        CONFIG.STORAGE_KEYS.fx,
        {
          rates: this.rates,
          timestamp: this.lastUpdate,
          source: this.source
        },
        CONFIG.CACHE.FX_REFRESH_HOURS * 60 * 60 * 1000
      );
      
      return true;
    } catch (err) {
      console.warn('[Currency] Frankfurter failed, trying fallback');
      
      try {
        // Try exchangerate.host
        const data = await this.fetchExchangeRateHost();
        
        this.rates = { USD: 1, ...data.rates };
        this.lastUpdate = Date.now();
        this.source = 'ECB (exchangerate.host)';
        this.isStale = false;
        
        SafeStorage.set(
          CONFIG.STORAGE_KEYS.fx,
          {
            rates: this.rates,
            timestamp: this.lastUpdate,
            source: this.source
          },
          CONFIG.CACHE.FX_REFRESH_HOURS * 60 * 60 * 1000
        );
        
        return true;
      } catch {
        console.error('[Currency] All FX APIs failed');
        return false;
      }
    }
  }

  /**
   * Fetch from Frankfurter API
   */
  async fetchFrankfurter() {
    const symbols = CONFIG.CURRENCIES.filter(c => c !== 'USD').join(',');
    const url = `${CONFIG.API.fxFrankfurter}?from=USD&to=${symbols}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'omit'
    });
    
    if (!response.ok) throw new Error('Frankfurter failed');
    
    return await response.json();
  }

  /**
   * Fetch from exchangerate.host API
   */
  async fetchExchangeRateHost() {
    const symbols = CONFIG.CURRENCIES.filter(c => c !== 'USD').join(',');
    const url = `${CONFIG.API.fxExchangeRate}?base=USD&symbols=${symbols}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'omit'
    });
    
    if (!response.ok) throw new Error('exchangerate.host failed');
    
    return await response.json();
  }

  /**
   * Convert USD amount to target currency
   */
  convert(amount, targetCurrency = this.currentCurrency) {
    const rate = this.rates[targetCurrency] || 1;
    return amount * rate;
  }

  /**
   * Format amount in target currency
   */
  format(amount, targetCurrency = this.currentCurrency) {
    const converted = this.convert(amount, targetCurrency);
    
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: targetCurrency
      }).format(converted);
    } catch {
      // Fallback for unsupported currencies
      return `${converted.toFixed(2)} ${targetCurrency}`;
    }
  }

  /**
   * Set current currency
   */
  setCurrency(code) {
    const upper = code.toUpperCase();
    
    if (!CONFIG.CURRENCIES.includes(upper)) {
      console.warn(`[Currency] Unsupported currency: ${code}`);
      return false;
    }
    
    this.currentCurrency = upper;
    SafeStorage.set(CONFIG.STORAGE_KEYS.currency, upper);
    
    return true;
  }

  /**
   * Get current currency
   */
  getCurrency() {
    return this.currentCurrency;
  }

  /**
   * Get rate for currency
   */
  getRate(currency) {
    return this.rates[currency] || 1;
  }

  /**
   * Get all rates
   */
  getAllRates() {
    return { ...this.rates };
  }

  /**
   * Get status info
   */
  getStatus() {
    const ageMs = this.lastUpdate ? Date.now() - this.lastUpdate : null;
    const ageHours = ageMs ? ageMs / (60 * 60 * 1000) : null;
    
    return {
      currentCurrency: this.currentCurrency,
      lastUpdate: this.lastUpdate,
      ageHours: ageHours ? ageHours.toFixed(1) : null,
      source: this.source,
      isStale: this.isStale,
      isOffline: navigator.onLine === false,
      ratesAvailable: Object.keys(this.rates).length
    };
  }

  /**
   * Get warning message if rates are stale
   */
  getWarning() {
    if (navigator.onLine === false) {
      return 'Offline - using last known rates';
    }
    
    if (this.isStale) {
      const ageHours = ((Date.now() - this.lastUpdate) / (60 * 60 * 1000)).toFixed(1);
      return `Rates are ${ageHours}h old - may be outdated`;
    }
    
    return null;
  }

  /**
   * Render currency selector
   */
  renderSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const select = document.createElement('select');
    select.id = 'currency-select';
    select.setAttribute('aria-label', 'Display currency');
    
    CONFIG.CURRENCIES.forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code;
      if (code === this.currentCurrency) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
      this.setCurrency(e.target.value);
      // Trigger re-render
      document.dispatchEvent(new CustomEvent('currency-changed', {
        detail: { currency: this.currentCurrency }
      }));
    });
    
    container.appendChild(select);
  }

  /**
   * Render status note
   */
  renderStatus(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const status = this.getStatus();
    const warning = this.getWarning();
    
    let text = '';
    
    if (status.source) {
      text += `Rates from ${status.source}`;
    }
    
    if (status.ageHours) {
      text += ` • ${status.ageHours}h ago`;
    }
    
    if (warning) {
      text += ` • ${warning}`;
    }
    
    text += ' • Display only; onboard charges in USD';
    
    container.textContent = text;
    container.style.color = warning ? '#b45309' : '';
  }
}

// Export singleton instance
export const currency = new Currency();

export default currency;
