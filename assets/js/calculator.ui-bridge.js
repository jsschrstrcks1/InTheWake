/**
 * Royal Caribbean Drink Calculator - UI Bridge
 * Version: 10.0.0 assets/js/calculator.ui-bridge.js
 * Soli Deo Gloria ✝️
 * 
 * PURPOSE:
 * Provides clean API boundary between calculator core and UI layer
 * 
 * EXPORTS:
 * - window.ITW.store: {get, subscribe, patch}
 * - window.ITW.money: (amount, opts) => string
 * - window.ITW.getCurrency: () => string
 * - window.ITW.fxApproxPrefix: () => string
 * 
 * LOAD ORDER:
 * 1. drink-math.js
 * 2. drink-worker.js (loaded by app)
 * 3. drink-calculator.app.js
 * 4. calculator.ui-bridge.js ← THIS FILE
 * 5. calculator.ui.js
 */
(function() {
  'use strict';
  
  console.log('[ITW Bridge] Initializing...');
  
  // Wait for store to exist (check every 50ms, max 2.5 seconds)
  function waitForStore(attempts = 0) {
    if (window.__itwStore && window.ITW) {
      console.log('[ITW Bridge] ✓ Store found');
      initBridge();
    } else if (attempts < 50) {
      setTimeout(() => waitForStore(attempts + 1), 50);
    } else {
      console.error('[ITW Bridge] ❌ Store not found after 2.5 seconds');
      console.error('[ITW Bridge] Make sure drink-calculator.app.js loads before this file');
    }
  }
  
  function initBridge() {
    console.log('[ITW Bridge] ✓ Initialized v10.0.0');
    console.log('[ITW Bridge] ✓ Exports available: store, money, getCurrency, fxApproxPrefix');
    
    // Console shortcuts for debugging
    if (typeof window.storeGet === 'undefined') {
      window.storeGet = window.ITW.store.get;
      console.log('[ITW Bridge] 💡 Console shortcut: storeGet("inputs")');
    }
    
    // Dispatch ready event
    if (typeof CustomEvent !== 'undefined') {
      document.dispatchEvent(new CustomEvent('itw:bridge-ready'));
    }
  }
  
  // Start checking for store
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => waitForStore());
  } else {
    waitForStore();
  }
  
})();
