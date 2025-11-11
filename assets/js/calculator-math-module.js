/**
 * Royal Caribbean Drink Calculator - ES6 Module Wrapper
 * calculator-math-module.js - Version: 10.0.0
 * 
 * "For just as the body is one and has many members, and all the members 
 *  of the body, though many, are one body, so it is with Christ."
 * - 1 Corinthians 12:12
 * 
 * Soli Deo Gloria ✝️
 * 
 * This wrapper bridges the main thread and worker thread,
 * enabling both contexts to access God's gift of calculation.
 */

// Load the script that populates globalThis.ITW_MATH
await import('./calculator-math.js?v=10.0.0');

// Workers use 'self' instead of 'window'
const globalScope = typeof window !== 'undefined' ? window : self;

// Re-export from global scope for worker context
const compute = globalScope.ITW_MATH?.compute;
const computeWithVouchers = globalScope.ITW_MATH?.computeWithVouchers;

if (!compute) {
  throw new Error('compute function not found in ITW_MATH');
}

export { compute, computeWithVouchers };

// "Whatever you do, work heartily, as for the Lord and not for men" - Colossians 3:23
