/**
 * ITW Bridge v9.005.1
 * Minimal export shim for UI layer integration
 * Royal Caribbean Drink Calculator - In the Wake
 * Soli Deo Gloria
 * 
 * PURPOSE:
 * Provides a clean API boundary between the calculator app core (store, math)
 * and the UI layer (plugins, widgets, external integrations).
 * 
 * LOAD ORDER:
 * 1. drink-math.js
 * 2. drink-worker.js
 * 3. drink-calculator.app.js
 * 4. calculator.ui-bridge.js ← THIS FILE
 * 5. calculator.ui.js
 */
(function() {
  'use strict';
  
  if (!window.__itwStore) {
    console.error('[ITW Bridge] ❌ Store not found - ensure app.js loads first');
    return;
  }
  
  const store = window.__itwStore;
  
  window.ITW = window.ITW || {};
  
  window.ITW.store = {
    get: function(key) {
      return store.get(key);
    },
    
    subscribe: function(key, callback) {
      return store.subscribe(key, callback);
    },
    
    patch: function(key, value) {
      return store.patch(key, value);
    }
  };
  
  window.ITW.money = function(amount, options = {}) {
    const currency = options.currency || window.__itwCurrency || 'USD';
    const showCurrency = options.showCurrency !== false;
    
    let fxApprox = '';
    if (options.fxApprox !== undefined) {
      fxApprox = options.fxApprox;
    } else if (currency !== 'USD') {
      fxApprox = '≈ ';
    }
    
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        style: showCurrency ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
      return fxApprox + formatted;
    } catch (err) {
      console.warn('[ITW Money] Formatting error for', currency, err);
      const symbol = currency === 'USD' ? '$' : 
                     currency === 'EUR' ? '€' : 
                     currency === 'GBP' ? '£' : 
                     currency + ' ';
      return fxApprox + symbol + amount.toFixed(2);
    }
  };
  
  window.ITW.getCurrency = function() {
    return window.__itwCurrency || 'USD';
  };
  
  window.ITW.fxApproxPrefix = function() {
    const currency = window.ITW.getCurrency();
    return currency !== 'USD' ? '≈ ' : '';
  };
  
  console.log('[ITW Bridge] ✓ Initialized v9.005.1');
  console.log('[ITW Bridge] ✓ Exports: store.get/subscribe/patch, money, getCurrency, fxApproxPrefix');
  
  if (typeof window.storeGet === 'undefined') {
    window.storeGet = window.ITW.store.get;
    console.log('[ITW Bridge] 💡 Console shortcut: storeGet("inputs")');
  }
  
})();
