/**
 * Drink Calculator v2 — Web Worker (Config-Driven)
 * Version: 2.000.000
 * Based on: v1.004.000
 *
 * v2 CHANGE: Imports calculator-math-v2.js (config-driven) instead of v1.
 * Passes lineConfig as 6th argument to compute().
 *
 * "Whatever you do, work at it with all your heart, as working for the Lord"
 * — Colossians 3:23
 */

'use strict';

// v2: Import config-driven math engine
importScripts('/assets/js/calculator-math-v2.js?v=2.000.000');

// Log ready state

// Verify math engine loaded
if (typeof ITW_MATH === 'undefined' || !ITW_MATH.compute) {

  throw new Error('Math engine failed to load');
}

/**
 * Message handler - receives compute requests from main thread
 */
self.addEventListener('message', (e) => {
  const { type, id, payload } = e.data;

  if (type === 'compute') {
    try {
      // Validate payload structure
      validatePayload(payload);

      const { inputs, economics, dataset, vouchers, forcedPackage, lineConfig } = payload;

      console.log('[Worker v2] Computing with forcedPackage:', forcedPackage || 'null (auto-recommend)');

      // v2: Pass lineConfig as 6th argument for config-driven calculations
      const results = ITW_MATH.compute(inputs, economics, dataset, vouchers, forcedPackage, lineConfig || null);

      // Validate results before sending
      if (!results || typeof results !== 'object') {
        throw new Error('Invalid results from compute');
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
          message: err.message || 'Unknown error',
          stack: err.stack || ''
        }
      });
    }
  }

  // Ignore unknown message types
});

/**
 * Apply forced package (user clicked a package card)
 * @param {Object} results - Original calculation results
 * @param {string} forcedPkg - User-selected package ('soda'|'refresh'|'deluxe')
 * @param {Object} inputs - User inputs
 * @param {Object} economics - Package economics
 * @param {Object} vouchers - Voucher data
 * @returns {Object} Modified results with forced package as winner
 */
function applyForcedPackage(results, forcedPkg, inputs, economics, vouchers) {

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
      console.log('[Worker] POLICY ENFORCED: Minors forced to Refreshment (', minors, 'minors × $', economics.pkg.refresh, '× ', days, 'days = $', minorCost, ')');
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

/**
 * Calculate total value of Crown & Anchor vouchers
 * Diamond: 4/day @ $14, Diamond+: 5/day @ $14, Pinnacle: 6/day @ $14
 *
 * @param {Object} inputs - User inputs
 * @param {Object} vouchers - Voucher data
 * @returns {number} Total voucher value in dollars
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

/**
 * Validate payload structure and security
 * Blocks prototype pollution and other malicious input
 *
 * @param {Object} payload - Message payload from main thread
 * @throws {Error} If payload is invalid or dangerous
 */
function validatePayload(payload) {
  // Must be plain object
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be a plain object');
  }

  const dangerous = ['__proto__', 'constructor', 'prototype'];

  // ✅ FIX: Use hasOwnProperty to check only OWN properties, not prototype chain
  // The 'in' operator checks inherited properties, causing false positives

  // Check root level
  for (let key of dangerous) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      throw new Error('Dangerous key detected in payload: ' + key);
    }
  }

  // Check inputs
  if (payload.inputs) {
    for (let key of dangerous) {
      if (Object.prototype.hasOwnProperty.call(payload.inputs, key)) {
        throw new Error('Dangerous key detected in inputs: ' + key);
      }
    }

    // Check inputs.drinks
    if (payload.inputs.drinks) {
      for (let key of dangerous) {
        if (Object.prototype.hasOwnProperty.call(payload.inputs.drinks, key)) {
          throw new Error('Dangerous key detected in drinks: ' + key);
        }
      }
    }
  }

  // Check economics
  if (payload.economics) {
    for (let key of dangerous) {
      if (Object.prototype.hasOwnProperty.call(payload.economics, key)) {
        throw new Error('Dangerous key detected in economics: ' + key);
      }
    }

    if (payload.economics.pkg) {
      for (let key of dangerous) {
        if (Object.prototype.hasOwnProperty.call(payload.economics.pkg, key)) {
          throw new Error('Dangerous key detected in pkg: ' + key);
        }
      }
    }
  }

  // Check dataset
  if (payload.dataset) {
    for (let key of dangerous) {
      if (Object.prototype.hasOwnProperty.call(payload.dataset, key)) {
        throw new Error('Dangerous key detected in dataset: ' + key);
      }
    }
  }

  // Check vouchers
  if (payload.vouchers) {
    for (let key of dangerous) {
      if (Object.prototype.hasOwnProperty.call(payload.vouchers, key)) {
        throw new Error('Dangerous key detected in vouchers: ' + key);
      }
    }
  }

  // Validate forcedPackage if present
  if (payload.forcedPackage !== undefined && payload.forcedPackage !== null) {
    const validPackages = ['soda', 'refresh', 'deluxe'];
    if (!validPackages.includes(payload.forcedPackage)) {
      throw new Error('Invalid forcedPackage value: ' + payload.forcedPackage);
    }
  }

  return true;
}

// Post ready message
self.postMessage({ type: 'ready' });

console.log('[Worker] Package recommendations: FIXED (accounts for uncovered drinks)');

