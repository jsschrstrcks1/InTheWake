/**
 * Royal Caribbean Drink Calculator - Web Worker
 * Version: 10.0.0 (Phase 1 Complete)
 * 
 * "Whatsoever thy hand findeth to do, do it with thy might" - Ecclesiastes 9:10
 * 
 * Soli Deo Gloria ✝️
 * 
 * PHASE 1 FEATURES:
 * ✅ #3 Unified compute() API (one function handles all cases)
 */

'use strict';

/* ==================== IMPORT MATH MODULE ==================== */

// Import the math module
importScripts('/assets/js/calculator-math.js');

/* ==================== MESSAGE HANDLER ==================== */
/**
 * ✅ PHASE 1 ITEM #3: Unified math API
 * Worker now calls single compute() function with vouchers parameter
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  if (type === 'compute') {
    try {
      if (!self.ITW_MATH || typeof self.ITW_MATH.compute !== 'function') {
        throw new Error('Math module not loaded');
      }
      
      // Validate payload
      if (!payload || !payload.inputs || !payload.economics || !payload.dataset) {
        throw new Error('Invalid payload structure');
      }
      
      // ✅ PHASE 1 ITEM #3: Call unified compute() with optional vouchers
      const results = self.ITW_MATH.compute(
        payload.inputs,
        payload.economics,
        payload.dataset,
        payload.vouchers || null  // Pass vouchers or null
      );
      
      // Send results back to main thread
      self.postMessage({
        type: 'result',
        payload: results
      });
      
    } catch (error) {
      console.error('[Worker] Computation error:', error);
      
      // Send error back to main thread
      self.postMessage({
        type: 'error',
        payload: {
          message: error.message || 'Unknown error',
          stack: error.stack
        }
      });
    }
  }
});

/* ==================== INITIALIZATION ==================== */

// Signal that worker is ready
self.postMessage({ type: 'ready' });

console.log('[Worker] v10.0.0 Ready (Phase 1 Complete)');

// "Commit thy works unto the LORD, and thy thoughts shall be established" - Proverbs 16:3
// Soli Deo Gloria ✝️
