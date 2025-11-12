/**
 * Royal Caribbean Drink Calculator - Web Worker
 * Version: 1.001.001 (Phase 1 Complete + Security)
 * 
 * "Whatsoever thy hand findeth to do, do it with thy might" - Ecclesiastes 9:10
 * 
 * Soli Deo Gloria ✝️
 * 
 * PHASE 1 FEATURES:
 * ✅ #3 Unified compute() API (one function handles all cases)
 * ✅ Size bomb protection (100KB limit)
 * ✅ Message validation (type and payload checks)
 * 
 * v1.001.001 FIXES:
 * ✅ Response property corrected (result → payload)
 */

'use strict';

/* ==================== IMPORT MATH MODULE ==================== */

// Import the math module
importScripts('/assets/js/calculator-math.js');

/* ==================== MESSAGE HANDLER ==================== */

/**
 * ✅ PHASE 1 ITEM #3: Unified math API
 * Worker now calls single compute() function with vouchers parameter
 * 
 * ✅ MINIMAL SECURITY: Size check to prevent browser DoS
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  // Basic validation
  if (!type || !payload) {
    self.postMessage({
      type: 'error',
      error: 'Invalid message format'
    });
    return;
  }
  
  // ✅ Size bomb protection
  // Prevent DoS via massive payloads
  const payloadStr = JSON.stringify(payload);
  if (payloadStr.length > 100000) { // 100KB limit
    self.postMessage({
      type: 'error',
      error: 'Payload too large'
    });
    return;
  }
  
  // Handle compute request
  if (type === 'compute') {
    try {
      // ✅ PHASE 1 ITEM #3: Unified compute() signature
      // Single function handles both regular and voucher calculations
      const result = self.ITW_MATH.compute(
        payload.inputs,
        payload.economics,
        payload.dataset,
        payload.vouchers || null  // Pass vouchers if present, null otherwise
      );
      
      // ✅ v1.001.001 FIX: Send 'payload' not 'result' to match core expectations
      self.postMessage({
        type: 'result',
        payload: result  // ← FIXED: Was 'result', now 'payload'
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message || 'Calculation failed'
      });
    }
  } else {
    // Unknown message type
    self.postMessage({
      type: 'error',
      error: `Unknown message type: ${type}`
    });
  }
});

/* ==================== READY SIGNAL ==================== */

// Signal that worker is ready
self.postMessage({
  type: 'ready'
});

// "In all thy ways acknowledge him, and he shall direct thy paths" - Proverbs 3:6
// Soli Deo Gloria ✝️
