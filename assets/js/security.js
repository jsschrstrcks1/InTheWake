/**
 * Royal Caribbean Drink Calculator - Security Module
 * Version: 10.0.1 (Patch)
 * Soli Deo Gloria ✝️
 * 
 * FEATURES:
 * - C12: Worker import integrity (SHA-256 verification)
 * - C13: safeFetch with schema validation
 * - C14: Security telemetry (lightweight event bus)
 * 
 * USAGE:
 * Load this file AFTER drink-calculator.app.js
 * It will automatically patch the app with enhanced security features
 */

(() => {
  'use strict';

  console.log('[Security] v10.0.1 Patch Loading...');

  // ==================== C14: SECURITY TELEMETRY ====================
  
  /**
   * Lightweight security event bus
   * Tracks security events for monitoring and debugging
   */
  class SecurityEvents {
    constructor() {
      this.events = {};
      this.counts = {};
    }

    emit(eventType, details = {}) {
      const timestamp = new Date().toISOString();
      const event = {
        type: eventType,
        timestamp,
        details
      };

      if (!this.events[eventType]) {
        this.events[eventType] = [];
        this.counts[eventType] = 0;
      }

      this.events[eventType].push(event);
      this.counts[eventType]++;

      // Console log for development
      if (window.DEBUG || localStorage.getItem('debug-security')) {
        console.log(`[Security Event] ${eventType}`, details);
      }

      // Dispatch custom event for listeners
      window.dispatchEvent(new CustomEvent('security-event', { detail: event }));
    }

    getEvents(eventType) {
      return eventType ? (this.events[eventType] || []) : this.events;
    }

    getCounts() {
      return { ...this.counts };
    }

    getSummary() {
      const summary = {
        totalEvents: Object.values(this.counts).reduce((a, b) => a + b, 0),
        byType: this.counts
      };

      console.group('[Security Summary]');
      console.log('Total Events:', summary.totalEvents);
      console.log('By Type:', summary.byType);
      console.groupEnd();

      return summary;
    }

    reset() {
      this.events = {};
      this.counts = {};
    }
  }

  // Create global security events instance
  window.SecurityEvents = new SecurityEvents();

  // ==================== C12: WORKER INTEGRITY ====================
  
  /**
   * Compute SHA-256 hash of a file
   * Used to verify worker script integrity before import
   */
  async function computeHash(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (err) {
      console.error('[Security] Hash computation failed:', err);
      return null;
    }
  }

  /**
   * Verify worker script integrity
   * @param {string} url - Worker script URL
   * @param {string} expectedHash - Expected SHA-256 hash
   * @returns {Promise<boolean>} True if hash matches
   */
  async function verifyIntegrity(url, expectedHash) {
    if (!expectedHash) {
      console.warn('[Security] No expected hash provided for', url);
      window.SecurityEvents.emit('integrity_check_skipped', { url });
      return true; // Allow if no hash specified
    }

    const actualHash = await computeHash(url);

    if (!actualHash) {
      window.SecurityEvents.emit('integrity_check_failed', {
        url,
        reason: 'hash_computation_failed'
      });
      return false;
    }

    const matches = actualHash === expectedHash;

    if (matches) {
      window.SecurityEvents.emit('integrity_check_passed', {
        url,
        hash: actualHash
      });
    } else {
      window.SecurityEvents.emit('integrity_check_failed', {
        url,
        expected: expectedHash,
        actual: actualHash
      });
    }

    return matches;
  }

  // Expose for use in worker
  window.verifyIntegrity = verifyIntegrity;

  // ==================== C13: SAFE FETCH ====================
  
  /**
   * Schema definition examples:
   * {
   *   type: 'object',
   *   required: ['rates', 'base'],
   *   properties: {
   *     rates: { type: 'object' },
   *     base: { type: 'string' }
   *   }
   * }
   */

  /**
   * Validate data against schema
   */
  function validateSchema(data, schema) {
    if (!schema) return true;

    // Type check
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (actualType !== schema.type) {
        return { valid: false, error: `Type mismatch: expected ${schema.type}, got ${actualType}` };
      }
    }

    // Required fields (for objects)
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in data)) {
          return { valid: false, error: `Missing required field: ${field}` };
        }
      }
    }

    // Property validation (for objects)
    if (schema.properties && typeof data === 'object' && !Array.isArray(data)) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const result = validateSchema(data[key], propSchema);
          if (!result.valid) {
            return { valid: false, error: `Property ${key}: ${result.error}` };
          }
        }
      }
    }

    return { valid: true };
  }

  /**
   * Safe fetch with schema validation
   * @param {string} url - URL to fetch
   * @param {Object} schema - Schema to validate against
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Validated data or throws
   */
  async function safeFetch(url, schema, options = {}) {
    try {
      window.SecurityEvents.emit('fetch_initiated', { url });

      const response = await fetch(url, options);

      if (!response.ok) {
        window.SecurityEvents.emit('fetch_failed', {
          url,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate against schema
      if (schema) {
        const validation = validateSchema(data, schema);

        if (!validation.valid) {
          window.SecurityEvents.emit('schema_validation_failed', {
            url,
            error: validation.error
          });
          throw new Error(`Schema validation failed: ${validation.error}`);
        }

        window.SecurityEvents.emit('schema_validation_passed', { url });
      }

      window.SecurityEvents.emit('fetch_success', { url });
      return data;

    } catch (err) {
      window.SecurityEvents.emit('fetch_error', {
        url,
        error: err.message
      });
      throw err;
    }
  }

  // Expose globally
  window.safeFetch = safeFetch;

  // ==================== PATCH EXISTING APP ====================
  
  /**
   * Enhance existing app with security features
   */
  function patchApp() {
    console.log('[Security] Patching app with v10.0.1 features...');

    // Patch blocked input events
    document.addEventListener('paste', (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' && target.type === 'text') {
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        if (/<[^>]+>/.test(pastedText) || /script/i.test(pastedText)) {
          window.SecurityEvents.emit('blocked_input', {
            type: 'paste',
            target: target.id || target.name,
            content: pastedText.substring(0, 50)
          });
        }
      }
    }, true);

    // Patch drop events
    document.addEventListener('drop', (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT') {
        window.SecurityEvents.emit('blocked_input', {
          type: 'drop',
          target: target.id || target.name
        });
      }
    }, true);

    console.log('[Security] ✓ Patch complete');
  }

  // Apply patches when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchApp);
  } else {
    patchApp();
  }

  // ==================== CONSOLE HELPERS ====================
  
  window.getSecuritySummary = () => window.SecurityEvents.getSummary();
  window.resetSecurityEvents = () => window.SecurityEvents.reset();

  console.log('[Security] v10.0.1 Patch ✓ Loaded');
  console.log('[Security] Console commands: getSecuritySummary(), resetSecurityEvents()');

})();

/**
 * WORKER INTEGRATION EXAMPLE (for drink-worker.js):
 * 
 * // Add at top of worker init:
 * const EXPECTED_MATH_HASH = 'abc123...'; // Update with actual hash
 * 
 * (async function init() {
 *   try {
 *     // Verify integrity before import
 *     if (self.verifyIntegrity) {
 *       const valid = await self.verifyIntegrity(mathURL, EXPECTED_MATH_HASH);
 *       if (!valid) {
 *         throw new Error('Integrity check failed');
 *       }
 *     }
 *     
 *     const mod = await import(mathURL);
 *     // ... rest of init
 *   } catch (err) {
 *     console.error('[Worker] Init failed:', err);
 *     self.postMessage({ type: 'ready' }); // Still send ready
 *   }
 * })();
 */

/**
 * APP INTEGRATION EXAMPLE (for drink-calculator.app.js):
 * 
 * // Replace loadFX():
 * async function loadFX() {
 *   const schema = {
 *     type: 'object',
 *     required: ['rates'],
 *     properties: {
 *       rates: { type: 'object' }
 *     }
 *   };
 *   
 *   try {
 *     const data = await safeFetch(CONFIG.FX_API, schema);
 *     fxRates = { rates: data.rates, timestamp: Date.now() };
 *     SafeStorage.set('fx-rates', fxRates);
 *   } catch (err) {
 *     console.warn('[FX] Load failed:', err);
 *     const cached = SafeStorage.get('fx-rates');
 *     if (cached) fxRates = cached;
 *   }
 * }
 * 
 * // Replace loadDataset():
 * async function loadDataset() {
 *   const schema = {
 *     type: 'object',
 *     properties: {
 *       packages: { type: 'object' },
 *       rules: { type: 'object' },
 *       prices: { type: 'object' }
 *     }
 *   };
 *   
 *   try {
 *     dataset = await safeFetch(CONFIG.DS_URL, schema);
 *   } catch (err) {
 *     console.error('[Dataset] Load failed:', err);
 *     dataset = getFallbackDataset();
 *   }
 * }
 */
