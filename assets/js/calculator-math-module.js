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

// Load the script that populates window.ITW_MATH
await import('./calculator-math.js?v=10.0.0');

// Re-export from window for worker context
const compute = window.ITW_MATH?.compute;
const computeWithVouchers = window.ITW_MATH?.computeWithVouchers;

export { compute, computeWithVouchers };

// "Whatever you do, work heartily, as for the Lord and not for men" - Colossians 3:23
