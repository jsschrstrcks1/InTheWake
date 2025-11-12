/**
 * Royal Caribbean Drink Calculator - Web Worker
 * Version: 10.0.1 (Phase 2 Security Hardening)
 * 
 * "Whatsoever thy hand findeth to do, do it with thy might" - Ecclesiastes 9:10
 * 
 * Soli Deo Gloria ✝️
 * 
 * PHASE 2 SECURITY:
 * ✅ Message schema validation
 * ✅ Prototype pollution guards
 * ✅ Type checking on all payload fields
 */

'use strict';

/* ==================== IMPORT MATH MODULE ==================== */
importScripts('/assets/js/calculator-math.js?v=10.0.0');

/* ==================== MESSAGE VALIDATION ==================== */
/**
 * ✅ PHASE 2: Worker message schema validation
 * "Test all things; hold fast that which is good" - 1 Thessalonians 5:21
 * 
 * Validates incoming compute payloads to prevent:
 * - Prototype pollution attacks
 * - Type confusion attacks
 * - Malformed data causing crashes
 */
function validatePayload(payload) {
  // Type guard - must be a plain object
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, error: 'Payload must be an object' };
  }
  
  // Block dangerous prototype pollution keys
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key of dangerousKeys) {
    if (key in payload) {
      return { valid: false, error: 'Dangerous key detected' };
    }
  }
  
  // Validate inputs object
  if (!payload.inputs || typeof payload.inputs !== 'object' || Array.isArray(payload.inputs)) {
    return { valid: false, error: 'inputs must be an object' };
  }
  
  // Check for dangerous keys in inputs
  for (const key of dangerousKeys) {
    if (key in payload.inputs) {
      return { valid: false, error: 'Dangerous key in inputs' };
    }
  }
  
  // Validate economics object
  if (!payload.economics || typeof payload.economics !== 'object' || Array.isArray(payload.economics)) {
    return { valid: false, error: 'economics must be an object' };
  }
  
  // Check for dangerous keys in economics
  for (const key of dangerousKeys) {
    if (key in payload.economics) {
      return { valid: false, error: 'Dangerous key in economics' };
    }
  }
  
  // Validate dataset object
  if (!payload.dataset || typeof payload.dataset !== 'object' || Array.isArray(payload.dataset)) {
    return { valid: false, error: 'dataset must be an object' };
  }
  
  // Check for dangerous keys in dataset
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
    
    // Check for dangerous keys in vouchers
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
  const { type, payload } = event.data || {};
  
  // Validate message type
  if (!validateMessageType(type)) {
    console.error('[Worker] Invalid message type:', type);
    self.postMessage({
      type: 'error',
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
      
      // ✅ PHASE 2: Schema validation
      const validation = validatePayload(payload);
      if (!validation.valid) {
        throw new Error(`Invalid payload: ${validation.error}`);
      }
      
      // ✅ PHASE 1: Call unified compute() with optional vouchers
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
console.log('[Worker] v10.0.1 Ready (Phase 2 Security Hardening)');

// "Commit thy works unto the LORD, and thy thoughts shall be established" - Proverbs 16:3
// Soli Deo Gloria ✝️
