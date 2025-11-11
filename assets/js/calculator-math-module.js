/**
 * Royal Caribbean Drink Calculator - ES6 Module Wrapper
 * calculator-math-module.js - Version: 10.0.0
 * 
 * "For just as the body is one and has many members, and all the members 
 *  of the body, though many, are one body, so it is with Christ."
 * - 1 Corinthians 12:12
 * 
 * Soli Deo Gloria ✝️
 */

// Direct import - the functions are defined at module scope
import('/assets/js/calculator-math.js?v=10.0.0').then(module => {
  // For some bundlers/contexts, exports might be on default
  if (module.compute) {
    self.compute = module.compute;
    self.computeWithVouchers = module.computeWithVouchers;
  }
});

// Also check global scope as fallback
await new Promise(resolve => setTimeout(resolve, 100)); // Give import time to complete

const compute = self.ITW_MATH?.compute;
const computeWithVouchers = self.ITW_MATH?.computeWithVouchers;

if (!compute) {
  throw new Error('compute function not found');
}

export { compute, computeWithVouchers };

// "Whatever you do, work heartily, as for the Lord and not for men" - Colossians 3:23
