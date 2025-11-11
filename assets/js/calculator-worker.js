/**
 * Royal Caribbean Drink Calculator - Web Worker
 * calculator-worker.js - Version: 10.0.0
 * Soli Deo Gloria ✝️
 * 
 * Handles compute-heavy operations off the main thread
 */
const VERSION = '10.0.0';

// Import the math module
let computeFn = null;
let computeWithVouchersFn = null;

// Safe zero result for error cases
const SAFE_ZERO = {
  hasRange: false,
  bars: {
    alc: { min: 0, mean: 0, max: 0 },
    soda: { min: 0, mean: 0, max: 0 },
    refresh: { min: 0, mean: 0, max: 0 },
    deluxe: { min: 0, mean: 0, max: 0 }
  },
  winnerKey: 'alc',
  perDay: 0,
  trip: 0,
  groupRows: [],
  categoryRows: [],
  included: { soda: 0, refresh: 0, deluxe: 0 },
  overcap: 0,
  deluxeRequired: false
};

// Initialize worker
let initPromise = null;
const messageQueue = [];

initPromise = (async function init() {
  try {
    // Dynamic import of math module
    const mathURL = `/assets/js/calculator-math.js?v=${VERSION}`;
    console.log('[Worker] Loading math module from:', mathURL);
    
    const module = await import(mathURL);
    
    computeFn = module.compute;
    computeWithVouchersFn = module.computeWithVouchers;
    
    console.log('[Worker] Math module loaded successfully');
    console.log('[Worker] computeFn available:', typeof computeFn);
    
    // Signal ready
    self.postMessage({ type: 'ready' });
    
    // Process any queued messages
    console.log('[Worker] Processing', messageQueue.length, 'queued messages');
    while (messageQueue.length > 0) {
      const event = messageQueue.shift();
      handleMessage(event);
    }
    
  } catch (error) {
    console.error('[Worker] Failed to load math module:', error);
    // Still signal ready but operations will return safe zeros
    self.postMessage({ type: 'ready' });
  }
})();
// Message handler
self.addEventListener('message', (event) => {
  // If still initializing, queue the message
  if (!computeFn) {
    console.log('[Worker] 🕐 Queueing message (still initializing)...');
    messageQueue.push(event);
    return;
  }
  
  handleMessage(event);
});

// Separate message handling function
function handleMessage(event) {
  console.log('[Worker] 📨 Received message:', event.data);
  
  const { type, payload, id } = event.data;
  
  console.log('[Worker] Message type:', type);
  
  if (type === 'compute') {
    console.log('[Worker] 🧮 Starting computation...');
    handleCompute(payload, id);
  } else {
    console.log('[Worker] ⚠️ Unknown message type:', type);
  }
}
});

/**
 * Handle computation request
 */
function handleCompute(payload, requestId) {
  console.log('[Worker] handleCompute called with payload:', payload);
  
  try {
    // Validate payload
    if (!payload || typeof payload !== 'object') {
      console.warn('[Worker] Invalid payload, returning SAFE_ZERO');
      sendResult(SAFE_ZERO, requestId);
      return;
    }
    
    // Sanitize inputs
    const clean = sanitizePayload(payload);
    
    if (!clean) {
      console.warn('[Worker] Sanitization failed, returning SAFE_ZERO');
      sendResult(SAFE_ZERO, requestId);
      return;
    }
    
    // Check if compute function is available
    if (typeof computeFn !== 'function') {
      console.error('[Worker] ❌ computeFn not available!');
      sendResult(SAFE_ZERO, requestId);
      return;
    }
    
    console.log('[Worker] 🧮 Calling computeFn...');
    
    // Perform calculation
    const result = computeFn(
      clean.inputs,
      clean.economics,
      clean.dataset
    );
    
    console.log('[Worker] ✅ Computation complete! Result:', result);
    sendResult(result || SAFE_ZERO, requestId);
    
  } catch (error) {
    console.error('[Worker] ❌ Compute error:', error);
    sendResult(SAFE_ZERO, requestId);
  }
}

/**
 * Send result back to main thread
 */
function sendResult(result, requestId) {
  console.log('[Worker] 📤 Sending result back to main thread');
  self.postMessage({
    type: 'result',
    payload: result,
    id: requestId
  });
  console.log('[Worker] ✅ Result sent!');
}

/**
 * Sanitize and validate payload
 */
function sanitizePayload(payload) {
  const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(+n) ? +n : 0));
  
  try {
    const clean = structuredClone(payload);
    
    // Sanitize inputs
    const inputs = clean.inputs || {};
    inputs.days = clamp(Math.round(inputs.days || 7), 1, 365);
    inputs.seaDays = clamp(Math.round(inputs.seaDays || 0), 0, inputs.days);
    inputs.seaApply = Boolean(inputs.seaApply ?? true);
    inputs.seaWeight = clamp(inputs.seaWeight || 20, 0, 40);
    inputs.adults = clamp(Math.round(inputs.adults || 1), 1, 20);
    inputs.minors = clamp(Math.round(inputs.minors || 0), 0, 20);
    
    // Sanitize drinks
    inputs.drinks = inputs.drinks || {};
    const drinkKeys = [
      'soda', 'coffee', 'teaprem', 'freshjuice', 'mocktail',
      'energy', 'milkshake', 'bottledwater', 'beer', 'wine',
      'cocktail', 'spirits'
    ];
    
    drinkKeys.forEach(key => {
      const value = inputs.drinks[key];
      if (value && typeof value === 'object') {
        const min = Math.max(0, +value.min || 0);
        const max = Math.max(min, +value.max || 0);
        inputs.drinks[key] = { min, max };
      } else {
        inputs.drinks[key] = Math.max(0, +value || 0);
      }
    });
    
    // Sanitize economics
    const economics = clean.economics || {};
    economics.pkg = economics.pkg || {};
    economics.pkg.soda = clamp(economics.pkg.soda || 13.99, 0, 200);
    economics.pkg.refresh = clamp(economics.pkg.refresh || 34.0, 0, 300);
    economics.pkg.deluxe = clamp(economics.pkg.deluxe || 85.0, 0, 400);
    economics.grat = clamp(economics.grat || 0.18, 0, 0.5);
    economics.deluxeCap = clamp(economics.deluxeCap || 14.0, 0, 200);
    
    clean.inputs = inputs;
    clean.economics = economics;
    clean.dataset = clean.dataset || {};
    
    return clean;
    
  } catch (error) {
    console.error('[Worker] Sanitization error:', error);
    return null;
  }
}

console.log(`[Worker] v${VERSION} initialized`);
