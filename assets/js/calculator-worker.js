/**
 * Royal Caribbean Drink Calculator — Worker Updates
 * Version: 1.003.000
 * 
 * UPDATES for calculator-worker.js:
 * - Support for forcedPackage parameter (clickable package selection)
 * - Enhanced validation
 * - Minors + Deluxe policy enforcement
 * 
 * These code snippets should be integrated into your existing calculator-worker.js
 */

/* ==========================================
   UPDATE 1: Message Handler with Forced Package Support
   
   Location: Replace existing message event listener
   ========================================== */

self.addEventListener('message', (e) => {
  const { type, id, payload } = e.data;
  
  if (type === 'compute') {
    try {
      // Validate payload structure
      validatePayload(payload);
      
      const { inputs, economics, dataset, vouchers, forcedPackage } = payload;
      
      // Run main calculation
      let results = ITW_MATH.compute(inputs, economics, dataset, vouchers);
      
      // If user has selected a specific package, override winner
      if (forcedPackage && ['soda', 'refresh', 'deluxe'].includes(forcedPackage)) {
        results = applyForcedPackage(results, forcedPackage, inputs, economics, vouchers);
      }
      
      // Post results back to main thread
      self.postMessage({ 
        type: 'result', 
        id, 
        payload: results 
      });
      
    } catch (err) {
      // Post error back to main thread
      self.postMessage({ 
        type: 'error', 
        id, 
        payload: { 
          message: err.message, 
          stack: err.stack 
        } 
      });
    }
  }
});

/* ==========================================
   UPDATE 2: Apply Forced Package Function (NEW)
   
   Location: Add this function to worker
   ========================================== */

/**
 * Override calculation results with user-selected package
 * @param {Object} results - Original calculation results
 * @param {string} forcedPkg - User-selected package ('soda'|'refresh'|'deluxe')
 * @param {Object} inputs - User inputs
 * @param {Object} economics - Package economics
 * @param {Object} vouchers - Voucher data
 * @returns {Object} Modified results with forced package as winner
 */
function applyForcedPackage(results, forcedPkg, inputs, economics, vouchers) {
  console.log('[Worker] Applying forced package:', forcedPkg);
  
  // Calculate cost for this specific package
  const forcedCost = calculateForcedPackageCost(forcedPkg, inputs, economics, vouchers);
  
  // Calculate savings vs à la carte
  const savings = results.alacarte.afterVouchers - forcedCost.total;
  
  // Return modified results
  return {
    ...results,
    
    // Override winner
    winner: {
      package: forcedPkg,
      cost: forcedCost.total,
      savings: savings,
      costs: results.winner.costs,
      forced: true // Flag that this is user-selected, not calculated
    },
    
    // Store forced package details
    forcedPackage: forcedPkg,
    forcedCost: forcedCost,
    
    // Keep original recommendation for comparison
    recommendedPackage: results.winner.package,
    recommendedCost: results.winner.cost
  };
}

/* ==========================================
   UPDATE 3: Calculate Forced Package Cost (NEW)
   
   Location: Add this function to worker
   ========================================== */

/**
 * Calculate cost for a specific forced package
 * CRITICAL: Enforces minors + Deluxe policy
 * 
 * @param {string} pkg - Package type ('soda'|'refresh'|'deluxe')
 * @param {Object} inputs - User inputs
 * @param {Object} economics - Package economics
 * @param {Object} vouchers - Voucher data
 * @returns {Object} Cost breakdown
 */
function calculateForcedPackageCost(pkg, inputs, economics, vouchers) {
  const days = inputs.days || 7;
  const adults = inputs.adults || 1;
  const minors = inputs.minors || 0;
  const totalPeople = adults + minors;
  
  let adultCost = 0;
  let minorCost = 0;
  let minorPackage = pkg; // What package minors get
  let minorForced = false; // Is minor package forced by policy?
  
  if (pkg === 'deluxe') {
    // Adults: Deluxe package
    adultCost = economics.pkg.deluxe * adults * days;
    
    // CRITICAL POLICY: Minors MUST buy Refreshment when adults buy Deluxe
    if (minors > 0) {
      minorPackage = 'refresh';
      minorCost = economics.pkg.refresh * minors * days;
      minorForced = true;
    }
    
  } else if (pkg === 'refresh') {
    // Everyone gets Refreshment
    adultCost = economics.pkg.refresh * adults * days;
    minorCost = economics.pkg.refresh * minors * days;
    minorPackage = 'refresh';
    
  } else if (pkg === 'soda') {
    // Everyone gets Soda
    adultCost = economics.pkg.soda * adults * days;
    minorCost = economics.pkg.soda * minors * days;
    minorPackage = 'soda';
  }
  
  const total = adultCost + minorCost;
  const perPerson = totalPeople > 0 ? total / totalPeople : 0;
  const perDay = days > 0 ? total / days : 0;
  
  // Vouchers create conflict (can't use with packages)
  const hasVouchers = (inputs.voucherAdult > 0 || inputs.voucherMinor > 0);
  const voucherValue = hasVouchers ? calculateVoucherValue(inputs, vouchers) : 0;
  
  return {
    total: total,
    perPerson: perPerson,
    perDay: perDay,
    adultCost: adultCost,
    minorCost: minorCost,
    minorPackage: minorPackage,
    minorForced: minorForced,
    voucherConflict: hasVouchers,
    voucherValue: voucherValue
  };
}

/* ==========================================
   UPDATE 4: Calculate Voucher Value Helper (NEW)
   
   Location: Add this function if not already present
   ========================================== */

/**
 * Calculate total value of Crown & Anchor vouchers
 * Diamond: 4/day @ $14, Diamond+: 5/day @ $14, Pinnacle: 6/day @ $14
 */
function calculateVoucherValue(inputs, vouchers) {
  const days = inputs.days || 7;
  const adults = inputs.adults || 1;
  const minors = inputs.minors || 0;
  const voucherValue = vouchers.value || 14;
  
  const adultVouchers = (inputs.voucherAdult || 0) * adults * days * voucherValue;
  const minorVouchers = (inputs.voucherMinor || 0) * minors * days * voucherValue;
  
  return adultVouchers + minorVouchers;
}

/* ==========================================
   UPDATE 5: Enhanced Payload Validation
   
   Location: Update existing validatePayload function
   ========================================== */

/**
 * Enhanced validation with forcedPackage support
 */
function validatePayload(payload) {
  // Existing validations...
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be a plain object');
  }
  
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  
  // Check root
  for (let key of dangerous) {
    if (key in payload) {
      throw new Error('Dangerous key detected in payload: ' + key);
    }
  }
  
  // Check inputs
  if (payload.inputs) {
    for (let key of dangerous) {
      if (key in payload.inputs) {
        throw new Error('Dangerous key detected in inputs: ' + key);
      }
    }
    
    // Check inputs.drinks
    if (payload.inputs.drinks) {
      for (let key of dangerous) {
        if (key in payload.inputs.drinks) {
          throw new Error('Dangerous key detected in drinks: ' + key);
        }
      }
    }
  }
  
  // Check economics
  if (payload.economics) {
    for (let key of dangerous) {
      if (key in payload.economics) {
        throw new Error('Dangerous key detected in economics: ' + key);
      }
    }
    
    if (payload.economics.pkg) {
      for (let key of dangerous) {
        if (key in payload.economics.pkg) {
          throw new Error('Dangerous key detected in pkg: ' + key);
        }
      }
    }
  }
  
  // Check dataset
  if (payload.dataset) {
    for (let key of dangerous) {
      if (key in payload.dataset) {
        throw new Error('Dangerous key detected in dataset: ' + key);
      }
    }
  }
  
  // Check vouchers
  if (payload.vouchers) {
    for (let key of dangerous) {
      if (key in payload.vouchers) {
        throw new Error('Dangerous key detected in vouchers: ' + key);
      }
    }
  }
  
  // NEW: Validate forcedPackage if present
  if (payload.forcedPackage !== undefined && payload.forcedPackage !== null) {
    const validPackages = ['soda', 'refresh', 'deluxe'];
    if (!validPackages.includes(payload.forcedPackage)) {
      throw new Error('Invalid forcedPackage value: ' + payload.forcedPackage);
    }
  }
  
  return true;
}

/* ==========================================
   INTEGRATION NOTES
   ========================================== */

/**
 * INTEGRATION CHECKLIST for calculator-worker.js:
 * 
 * 1. Update message event listener to extract forcedPackage from payload
 *    (See UPDATE 1)
 * 
 * 2. Add applyForcedPackage() function
 *    (See UPDATE 2)
 * 
 * 3. Add calculateForcedPackageCost() function
 *    (See UPDATE 3)
 * 
 * 4. Add calculateVoucherValue() helper if not present
 *    (See UPDATE 4)
 * 
 * 5. Update validatePayload() to validate forcedPackage
 *    (See UPDATE 5)
 * 
 * 6. Ensure ITW_MATH.compute is imported correctly:
 *    importScripts('/assets/js/calculator-math.js?v=1.003.000');
 * 
 * 7. Update worker version comment:
 *    // Version: 1.003.000
 * 
 * 8. Test worker with forced packages:
 *    - Send message with forcedPackage: 'soda'
 *    - Send message with forcedPackage: 'refresh'
 *    - Send message with forcedPackage: 'deluxe'
 *    - Verify results.forcedPackage is set
 *    - Verify results.winner.package matches forced
 *    - Verify minors get Refreshment when adults get Deluxe
 * 
 * 9. Test without forcedPackage:
 *    - Send message with forcedPackage: null
 *    - Verify normal calculation (winner is calculated)
 * 
 * 10. Error handling:
 *     - Send invalid forcedPackage value ('invalid')
 *     - Verify error message is returned
 */

/* ==========================================
   EXAMPLE USAGE FROM MAIN THREAD
   ========================================== */

/**
 * Example: How to call worker with forced package
 * (This code goes in calculator.js or calculator-ui.js)
 */

// Normal calculation (no forced package)
worker.postMessage({
  type: 'compute',
  id: Date.now(),
  payload: {
    inputs: gatherInputs(),
    economics: currentEconomics,
    dataset: currentDataset,
    vouchers: currentVouchers,
    forcedPackage: null // or omit this property
  }
});

// Forced package calculation (user clicked Deluxe card)
worker.postMessage({
  type: 'compute',
  id: Date.now(),
  payload: {
    inputs: gatherInputs(),
    economics: currentEconomics,
    dataset: currentDataset,
    vouchers: currentVouchers,
    forcedPackage: 'deluxe' // <-- Force Deluxe package
  }
});

// Handle worker response
worker.addEventListener('message', (e) => {
  const { type, id, payload } = e.data;
  
  if (type === 'result') {
    const results = payload;
    
    // Check if this was a forced calculation
    if (results.forcedPackage) {
      console.log('User selected:', results.forcedPackage);
      console.log('Would have recommended:', results.recommendedPackage);
    }
    
    // Render results
    renderResults(results);
  }
  
  if (type === 'error') {
    console.error('Worker error:', payload.message);
    showErrorMessage(payload.message);
  }
});

/* ==========================================
   CONSOLE LOGGING (For Debugging)
   ========================================== */

// Add these console.log statements during development
// Remove or comment out in production

console.log('[Worker] v1.003.000 loaded');
console.log('[Worker] Forced package support: ENABLED');
console.log('[Worker] Minors + Deluxe policy: ENFORCED');

// In applyForcedPackage():
console.log('[Worker] Forcing package:', forcedPkg);
console.log('[Worker] Forced cost:', forcedCost);
console.log('[Worker] Original recommendation:', results.winner.package);

// In calculateForcedPackageCost():
if (pkg === 'deluxe' && minors > 0) {
  console.log('[Worker] POLICY ENFORCED: Minors forced to Refreshment');
  console.log('[Worker] Minor cost:', minorCost);
}
