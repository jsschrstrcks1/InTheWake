/**
 * Royal Caribbean Drink Calculator - Web Worker
 * Version: 1.001.002 (Emergency Patch - Sync with Core)
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
 * v1.001.002 UPDATES:
 * ✅ Version synced with core and UI
 * ✅ Response property matches core expectations (payload)
 */

'use strict';

/* ==================== IMPORT MATH MODULE ==================== */

importScripts('/assets/js/calculator-math.js');

/* ==================== MESSAGE HANDLER ==================== */

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
      // ✅ Unified compute() API
      const result = self.ITW_MATH.compute(
        payload.inputs,
        payload.economics,
        payload.dataset,
        payload.vouchers || null
      );
      
      // ✅ Send as 'payload' to match core expectations
      self.postMessage({
        type: 'result',
        payload: result
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

self.postMessage({
  type: 'ready',
  version: '1.001.002'
});

// "In all thy ways acknowledge him, and he shall direct thy paths" - Proverbs 3:6
// Soli Deo Gloria ✝️
