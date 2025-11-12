/**
 * Royal Caribbean Drink Calculator - Web Worker
 * Version: 10.0.1 (Production Ready)
 * 
 * "Whatsoever thy hand findeth to do, do it with thy might" - Ecclesiastes 9:10
 * 
 * Soli Deo Gloria ✝️
 * 
 * FIXES APPLIED:
 * ✅ Classic worker (not module) - fixes importScripts() error
 * ✅ Message validation - prevents prototype pollution
 * ✅ Schema validation - ensures payload integrity
 * ✅ Error handling - graceful degradation
 */

'use strict';

/* ==================== IMPORT MATH MODULE ==================== */
// This must be a classic worker (not module) to use importScripts()
importScripts('/assets/js/calculator-math.js?v=10.0.0');

/* ==================== MESSAGE VALIDATION ==================== */
/**
 * Validates incoming compute payloads to prevent:
 * - Prototype pollution attacks (__proto__, constructor, prototype)
 * - Type confusion attacks (non-object payloads)
 * - Malformed data causing crashes
 * 
 * "Test all things; hold fast that which is good" - 1 Thessalonians 5:21
 */
function validatePayload(payload) {
  // Type guard - must be a plain object
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, error: 'Payload must be an object' };
  }
  
  // Block dangerous prototype pollution keys
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  // Check top-level payload
  for (const key of dangerousKeys) {
    if (key in payload) {
      return { valid: false, error: 'Dangerous key detected in payload' };
    }
  }
  
  // Validate inputs object
  if (!payload.inputs || typeof payload.inputs !== 'object' || Array.isArray(payload.inputs)) {
    return { valid: false, error: 'inputs must be an object' };
  }
  
  // Check inputs for dangerous keys
  for (const key of dangerousKeys) {
    if (key in payload.inputs) {
      return { valid: false, error: 'Dangerous key in inputs' };
    }
  }
  
  // Check inputs.drinks if present
  if (payload.inputs.drinks) {
    if (typeof payload.inputs.drinks !== 'object' || Array.isArray(payload.inputs.drinks)) {
      return { valid: false, error: 'inputs.drinks must be an object' };
    }
    for (const key of dangerousKeys) {
      if (key in payload.inputs.drinks) {
        return { valid: false, error: 'Dangerous key in inputs.drinks' };
      }
    }
  }
  
  // Validate economics object
  if (!payload.economics || typeof payload.economics !== 'object' || Array.isArray(payload.economics)) {
    return { valid: false, error: 'economics must be an object' };
  }
  
  // Check economics for dangerous keys
  for (const key of dangerousKeys) {
    if (key in payload.economics) {
      return { valid: false, error: 'Dangerous key in economics' };
    }
  }
  
  // Check economics.pkg if present
  if (payload.economics.pkg) {
    if (typeof payload.economics.pkg !== 'object' || Array.isArray(payload.economics.pkg)) {
      return { valid: false, error: 'economics.pkg must be an object' };
    }
    for (const key of dangerousKeys) {
      if (key in payload.economics.pkg) {
        return { valid: false, error: 'Dangerous key in economics.pkg' };
      }
    }
  }
  
  // Validate dataset object
  if (!payload.dataset || typeof payload.dataset !== 'object' || Array.isArray(payload.dataset)) {
    return { valid: false, error: 'dataset must be an object' };
  }
  
  // Check dataset for dangerous keys
  for (const key of dangerousKeys) {
    if (key in payload.dataset) {
      return { valid: false, error: 'Dangerous key in dataset' };
    }
  }
  
  // Validate vouchers if present (optional parameter)
  if (payload.vouchers !== null && payload.vouchers !== undefined) {
    if (typeof payload.vouchers !== 'object' || Array.isArray(payload.vouchers)) {
      return { valid: false, error: 'vouchers must be an object or null' };
    }
    
    // Check vouchers for dangerous keys
    for (const key of dangerousKeys) {
      if (key in payload.vouchers) {
        return { valid: false, error: 'Dangerous key in vouchers' };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Validate message type to prevent unexpected commands
 */
function validateMessageType(type) {
  const allowedTypes = ['compute'];
  return allowedTypes.includes(type);
}

/* ==================== MESSAGE HANDLER ==================== */
self.addEventListener('message', (event) => {
  const { type, payload, id } = event.data || {};
  
  // Validate message type
  if (!validateMessageType(type)) {
    console.error('[Worker] Invalid message type:', type);
    self.postMessage({
      type: 'error',
      id: id,
      payload: { message: 'Invalid message type' }
    });
    return;
  }
  
  if (type === 'compute') {
    try {
      // Check math module loaded
      if (!self.ITW_MATH || typeof self.ITW_MATH.compute !== 'function') {
        throw new Error('Math module not loaded');
      }
      
      // Validate payload structure
      const validation = validatePayload(payload);
      if (!validation.valid) {
        throw new Error(`Invalid payload: ${validation.error}`);
      }
      
      // Call unified compute() with optional vouchers
      const results = self.ITW_MATH.compute(
        payload.inputs,
        payload.economics,
        payload.dataset,
        payload.vouchers || null
      );
      
      // Validate results before sending
      if (!results || typeof results !== 'object') {
        throw new Error('Invalid computation results');
      }
      
      // Send results back to main thread with ID for de-racing
      self.postMessage({
        type: 'result',
        id: id,
        payload: results
      });
      
    } catch (error) {
      console.error('[Worker] Computation error:', error);
      
      // Send error back to main thread
      self.postMessage({
        type: 'error',
        id: id,
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
console.log('[Worker] v10.0.1 Ready (Production)');

// "Commit thy works unto the LORD, and thy thoughts shall be established" - Proverbs 16:3
// Soli Deo Gloria ✝️
