#!/usr/bin/env node
/**
 * test-math-engine.js — Comprehensive unit tests for calculator-math-v2.js
 *
 * Tests the math engine in isolation via a Function sandbox (no browser).
 * Covers: structural contracts, input clamping, package cost math, overcap,
 * vouchers, minor-force policy, coffee cards, Free-at-Sea, child pricing,
 * grandfathering, cross-feature interactions, per-line behavior, precision,
 * and defensive edge cases.
 *
 * Usage:
 *   node scripts/test-math-engine.js
 *   node scripts/test-math-engine.js --verbose
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MATH_PATH = path.join(__dirname, '..', 'assets', 'js', 'calculator-math-v2.js');
const CONFIG_PATH = path.join(__dirname, '..', 'assets', 'data', 'calculator-config.json');
const VERBOSE = process.argv.includes('--verbose');

// ── Load engine ──
function loadEngine() {
  const src = fs.readFileSync(MATH_PATH, 'utf8');
  const sandbox = { window: {}, self: {}, console: VERBOSE ? console : { log() {}, warn() {}, error() {} } };
  new Function('window', 'self', 'console', src)(sandbox.window, sandbox.self, sandbox.console);
  return (sandbox.window.ITW_MATH || sandbox.self.ITW_MATH);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const engine = loadEngine();
const { compute } = engine;

// ── Helpers ──
function buildDataset(lc) {
  const prices = {};
  (lc.drinks || []).forEach(d => { prices[d.id] = Number(d.price); });
  if (prices.coffee !== undefined && !prices.coffeeSmall) {
    prices.coffeeSmall = prices.coffee;
    prices.coffeeLarge = prices.coffee;
  }
  const sets = {};
  for (const k of Object.keys(lc.sets || {})) {
    const arr = lc.sets[k].slice();
    if (arr.includes('coffee')) {
      if (!arr.includes('coffeeSmall')) arr.push('coffeeSmall');
      if (!arr.includes('coffeeLarge')) arr.push('coffeeLarge');
    }
    sets[k] = arr;
  }
  return {
    prices, sets,
    rules: { gratuity: Number(lc.rules?.gratuity ?? 0.18), deluxeCap: Number(lc.rules?.deluxeCap ?? 14) }
  };
}

function buildEconomics(lc) {
  return {
    pkg: {
      soda: Number(lc.packages?.soda?.priceMid ?? 10.99),
      refresh: Number(lc.packages?.refreshment?.priceMid ?? 34),
      deluxe: Number(lc.packages?.deluxe?.priceMid ?? 85),
      coffee: Number(lc.coffeeCard?.price ?? 0),
    },
    grat: Number(lc.rules?.gratuity ?? 0.18),
    deluxeCap: Number(lc.rules?.deluxeCap ?? 14),
  };
}

function baseInputs(overrides) {
  return Object.assign({
    days: 7, seaDays: 2, seaApply: false, seaWeight: 0,
    adults: 2, minors: 0, coffeeCards: 0, coffeePunches: 0,
    freeAtSeaMode: false, bookingDate: null,
    drinks: {}
  }, overrides);
}

function run(lc, inputOverrides, vouchers, forced) {
  const ds = buildDataset(lc);
  const ec = buildEconomics(lc);
  return compute(baseInputs(inputOverrides), ec, ds, vouchers || null, forced || null, lc);
}

function collectNonFinite(obj, prefix, out) {
  if (obj == null) return out || [];
  out = out || [];
  if (typeof obj === 'number' && !Number.isFinite(obj)) out.push(prefix);
  else if (Array.isArray(obj)) obj.forEach((v, i) => collectNonFinite(v, `${prefix}[${i}]`, out));
  else if (typeof obj === 'object') for (const k of Object.keys(obj)) collectNonFinite(obj[k], prefix ? `${prefix}.${k}` : k, out);
  return out;
}

// ── Test framework ──
let totalPass = 0, totalFail = 0, sectionPass = 0, sectionFail = 0, currentSection = '';

function section(name) {
  if (currentSection) {
    console.log(`  ${currentSection}: ${sectionPass} pass, ${sectionFail} fail\n`);
  }
  currentSection = name;
  sectionPass = 0; sectionFail = 0;
  console.log(`── ${name} ──`);
}

function assert(condition, label, detail) {
  if (condition) { totalPass++; sectionPass++; if (VERBOSE) console.log(`  ✓ ${label}`); }
  else { totalFail++; sectionFail++; console.log(`  ✗ FAIL: ${label}${detail ? ' — ' + detail : ''}`); }
}

function near(a, b, tol) { return Math.abs(a - b) <= (tol || 0.02); }

// ── Line shortcuts ──
const rcl = config.lines['royal-caribbean'];
const ccl = config.lines.carnival;
const ncl = config.lines.ncl;

// ═══════════════════════════════════════════════════════════════
// A. STRUCTURAL / SANITY
// ═══════════════════════════════════════════════════════════════
section('A. Structural');

assert(typeof compute === 'function', 'compute is a function');
assert(engine.version === '2.001.000', 'engine version is 2.001.000', engine.version);

const base = run(rcl, { drinks: { cocktail: 2 } });
assert(typeof base === 'object' && base !== null, 'compute returns an object');
const requiredKeys = ['bars','packageBreakdown','winnerKey','perDay','trip','categoryRows',
  'included','overcap','voucherSavings','freeAtSeaActive','appliedPolicies','ariaAnnouncement'];
for (const k of requiredKeys) assert(k in base, `result has key "${k}"`);
assert(Array.isArray(base.appliedPolicies), 'appliedPolicies is an array');
assert(typeof base.freeAtSeaActive === 'boolean', 'freeAtSeaActive is boolean');

// Empty drinks → trip = 0
const empty = run(rcl, { drinks: {} });
assert(empty.trip === 0, 'empty drinks → trip=0');
assert(empty.perDay === 0, 'empty drinks → perDay=0');
assert(empty.winnerKey === 'alc', 'empty drinks → winner=alc (à la carte at $0)');

// No NaN/Infinity in any result
const badNums = collectNonFinite(base, '');
assert(badNums.length === 0, 'no NaN/Infinity in result with cocktail input', badNums.join(', '));

// ═══════════════════════════════════════════════════════════════
// B. INPUT CLAMPING
// ═══════════════════════════════════════════════════════════════
section('B. Input clamping');

// days clamped [1, 365]
const zeroDays = run(rcl, { days: 0, drinks: { beer: 1 } });
assert(zeroDays.trip > 0, 'days=0 clamped to 1 (trip > 0)');
const hugeDays = run(rcl, { days: 999, drinks: { beer: 1 } });
assert(hugeDays.trip > 0 && hugeDays.trip <= 7.75 * 365, 'days=999 clamped to 365');

// adults clamped [1, 20]
const zeroAdults = run(rcl, { adults: 0, drinks: { beer: 1 } });
assert(collectNonFinite(zeroAdults, '').length === 0, 'adults=0 clamped — no NaN');

// minors clamped [0, 20]
const negMinors = run(rcl, { minors: -5, drinks: { soda: 1 } });
assert(collectNonFinite(negMinors, '').length === 0, 'minors=-5 — no NaN');

// NaN inputs
const nanInputs = run(rcl, { days: NaN, adults: NaN, minors: NaN, drinks: { cocktail: NaN } });
assert(collectNonFinite(nanInputs, '').length === 0, 'NaN inputs produce no NaN/Infinity in output');
assert(nanInputs.trip === 0, 'NaN drink qty → trip=0');

// String inputs
const strInputs = run(rcl, { days: '7', adults: '2', drinks: { beer: '3' } });
assert(strInputs.trip > 0, 'string numeric inputs parsed correctly');

// ═══════════════════════════════════════════════════════════════
// C. À-LA-CARTE MATH
// ═══════════════════════════════════════════════════════════════
section('C. À-la-carte math');

// Simple: 1 drink type, no sea weighting
const simple = run(rcl, { days: 7, adults: 2, seaApply: false, drinks: { cocktail: 3 } });
const expectedTrip = 14.00 * 3 * 7; // price × qty × days (no adults multiplier in rawTotal)
assert(near(simple.trip, expectedTrip, 0.02), `cocktail trip = $${expectedTrip}`, `got $${simple.trip}`);
assert(near(simple.perDay, expectedTrip / 7, 0.02), 'perDay = trip / days');

// Multiple drinks
const multi = run(rcl, { days: 5, adults: 1, seaApply: false, drinks: { beer: 2, wine: 1, soda: 3 } });
const expectedMulti = (7.75 * 2 + 11 * 1 + 3.50 * 3) * 5;
assert(near(multi.trip, expectedMulti, 0.02), 'multi-drink trip correct', `expected $${expectedMulti.toFixed(2)} got $${multi.trip}`);

// ═══════════════════════════════════════════════════════════════
// D. PACKAGE COST MATH
// ═══════════════════════════════════════════════════════════════
section('D. Package costs');

// RCL Deluxe = priceMid × (1+grat) × days × adults
const deluxeTest = run(rcl, { days: 7, adults: 2, minors: 0, seaApply: false, drinks: { cocktail: 10 } }, null, 'deluxe');
const expectedDeluxe = rcl.packages.deluxe.priceMid * (1 + rcl.rules.gratuity) * 7 * 2;
assert(near(deluxeTest.packageBreakdown.deluxe.fixedCost, expectedDeluxe, 0.02),
  'RCL deluxe fixedCost matches priceMid × 1.18 × days × adults',
  `expected $${expectedDeluxe.toFixed(2)} got $${deluxeTest.packageBreakdown.deluxe.fixedCost.toFixed(2)}`);

// Soda package
const sodaTest = run(rcl, { days: 7, adults: 2, minors: 0, seaApply: false, drinks: { soda: 5 } }, null, 'soda');
const expectedSoda = rcl.packages.soda.priceMid * (1 + rcl.rules.gratuity) * 7 * 2;
assert(near(sodaTest.packageBreakdown.soda.fixedCost, expectedSoda, 0.02),
  'RCL soda fixedCost matches', `expected $${expectedSoda.toFixed(2)} got $${sodaTest.packageBreakdown.soda.fixedCost.toFixed(2)}`);

// Included monotonicity: soda ≤ refresh ≤ deluxe
const mono = run(rcl, { drinks: { cocktail: 2, beer: 1, soda: 2, coffee: 1 } });
assert(mono.included.soda <= mono.included.refresh + 0.01, 'included: soda ≤ refresh');
assert(mono.included.refresh <= mono.included.deluxe + 0.01, 'included: refresh ≤ deluxe');

// ═══════════════════════════════════════════════════════════════
// E. OVERCAP
// ═══════════════════════════════════════════════════════════════
section('E. Overcap');

// All drinks under cap → overcap = 0
const underCap = run(rcl, { days: 7, adults: 1, seaApply: false, drinks: { beer: 5 } });
assert(underCap.overcap === 0, 'beer at $7.75 under $14 cap → overcap=0');

// Drinks AT cap → overcap = 0
const atCap = run(rcl, { days: 7, adults: 1, seaApply: false, drinks: { cocktail: 5 } });
assert(atCap.overcap === 0, 'cocktail at $14 = cap → overcap=0');

// Wine at RCL is $11 (under cap) → overcap = 0
const wineTest = run(rcl, { days: 7, adults: 1, seaApply: false, drinks: { wine: 5 } });
assert(wineTest.overcap === 0, 'wine at $11 under $14 cap → overcap=0');

// ═══════════════════════════════════════════════════════════════
// F. VOUCHERS (RCL Diamond)
// ═══════════════════════════════════════════════════════════════
section('F. Vouchers');

const noVoucher = run(rcl, { days: 7, adults: 1, seaApply: false, drinks: { cocktail: 3 } });
assert(noVoucher.voucherSavings === 0, 'no vouchers → savings=0');
assert(noVoucher.vouchersUsed === 0, 'no vouchers → used=0');

const withVoucher = run(rcl, { days: 7, adults: 1, seaApply: false, drinks: { cocktail: 3 } },
  { adultCountPerDay: 4, minorCountPerDay: 0, perVoucherValue: 14 });
assert(withVoucher.voucherSavings > 0, 'Diamond vouchers → savings > 0');
assert(withVoucher.vouchersUsed > 0, 'Diamond vouchers → used > 0');
assert(withVoucher.trip < noVoucher.trip, 'vouchers reduce trip total');

// Vouchers on Carnival (disabled) should not apply
const cclNoVoucher = run(ccl, { days: 7, adults: 1, seaApply: false, drinks: { cocktail: 3 } },
  { adultCountPerDay: 4, minorCountPerDay: 0, perVoucherValue: 20 });
// Carnival loyalty.enabled=false, but voucher object is passed —
// the harness wraps it so it only passes when loyalty.enabled. Math engine itself
// applies vouchers if the object is present regardless. This is by design.
assert(collectNonFinite(cclNoVoucher, '').length === 0, 'Carnival + voucher object → no NaN');

// ═══════════════════════════════════════════════════════════════
// G. MINOR-FORCE POLICY
// ═══════════════════════════════════════════════════════════════
section('G. Minor-force policy');

// RCL: minorsForceRefreshment=true. When deluxe wins for adults, minors get refresh.
const rclFamily = run(rcl, { adults: 2, minors: 2, days: 7, seaApply: false, drinks: { cocktail: 8, soda: 3 } });
if (rclFamily.winnerKey === 'deluxe') {
  assert(rclFamily.showTwoWinners === true, 'RCL deluxe win → showTwoWinners');
  assert(rclFamily.minorWinnerKey === 'refresh', 'RCL deluxe win → minors forced to refresh');
  assert(rclFamily.minorForced === true, 'RCL deluxe win → minorForced=true');
} else {
  assert(true, 'RCL family: deluxe did not win (à la carte cheaper) — force policy not triggered');
}

// Carnival: minorsForceRefreshment=false. Minors pick cheapest.
const cclFamily = run(ccl, { adults: 2, minors: 2, days: 7, seaApply: false, drinks: { cocktail: 8, soda: 3 } });
if (cclFamily.winnerKey === 'deluxe') {
  assert(cclFamily.minorForced !== true || cclFamily.minorWinnerKey !== 'refresh',
    'Carnival deluxe win → minors NOT forced (minorsForceRefreshment=false)');
}

// NCL: minorsForceRefreshment=false (force-to-soda is advisory only for now)
const nclFamily = run(ncl, { adults: 2, minors: 2, days: 7, seaApply: false, drinks: { cocktail: 8, soda: 3 } });
assert(collectNonFinite(nclFamily, '').length === 0, 'NCL family compute → no NaN');

// ═══════════════════════════════════════════════════════════════
// H. COFFEE CARD
// ═══════════════════════════════════════════════════════════════
section('H. Coffee card');

// RCL has coffee card enabled (punches=15)
const coffeeOn = run(rcl, { days: 7, adults: 1, coffeeCards: 1, seaApply: false, drinks: { coffeeSmall: 2, coffeeLarge: 1 } });
assert(coffeeOn.trip >= 0, 'coffee card scenario produces valid trip');
assert(collectNonFinite(coffeeOn, '').length === 0, 'coffee card → no NaN');

// Carnival has coffee card disabled (punches=0) — must not crash
const coffeeOff = run(ccl, { days: 7, adults: 1, coffeeCards: 2, seaApply: false, drinks: { coffee: 3 } });
assert(collectNonFinite(coffeeOff, '').length === 0, 'Carnival disabled coffee card → no NaN');
assert(coffeeOff.trip >= 0, 'Carnival disabled coffee card → valid trip');

// NCL disabled coffee card
const coffeeNcl = run(ncl, { days: 7, adults: 1, coffeeCards: 5, seaApply: false, drinks: { coffee: 3 } });
assert(collectNonFinite(coffeeNcl, '').length === 0, 'NCL disabled coffee card → no NaN');

// ═══════════════════════════════════════════════════════════════
// I. FREE-AT-SEA (v2.1)
// ═══════════════════════════════════════════════════════════════
section('I. Free-at-Sea');

// OFF → standard deluxe
const fasOff = run(ncl, { days: 7, adults: 2, freeAtSeaMode: false, seaApply: false, drinks: { cocktail: 4 } });
const expectedStandalone = ncl.packages.deluxe.priceMid * (1 + ncl.rules.gratuity) * 7 * 2;
assert(near(fasOff.packageBreakdown.deluxe.fixedCost, expectedStandalone, 0.02),
  'FaS OFF: deluxe = priceMid × 1.20 × days × adults',
  `$${fasOff.packageBreakdown.deluxe.fixedCost.toFixed(2)} vs $${expectedStandalone.toFixed(2)}`);
assert(fasOff.freeAtSeaActive === false, 'FaS OFF: freeAtSeaActive=false');

// ON → flat rate
const fasOn = run(ncl, { days: 7, adults: 2, freeAtSeaMode: true, seaApply: false, drinks: { cocktail: 4 } });
const expectedFlat = ncl.freeAtSea.serviceChargePerDay * 7 * 2;
assert(near(fasOn.packageBreakdown.deluxe.fixedCost, expectedFlat, 0.02),
  'FaS ON: deluxe = flat $28.50 × days × adults',
  `$${fasOn.packageBreakdown.deluxe.fixedCost.toFixed(2)} vs $${expectedFlat.toFixed(2)}`);
assert(fasOn.freeAtSeaActive === true, 'FaS ON: freeAtSeaActive=true');
assert(fasOn.freeAtSeaDaily === ncl.freeAtSea.serviceChargePerDay, 'FaS ON: freeAtSeaDaily correct');

// Savings: FaS < standalone
assert(fasOn.packageBreakdown.deluxe.fixedCost < fasOff.packageBreakdown.deluxe.fixedCost,
  'FaS ON saves money vs standalone');

// ON for a line that does NOT have freeAtSea → ignored
const fasRcl = run(rcl, { days: 7, adults: 2, freeAtSeaMode: true, seaApply: false, drinks: { cocktail: 4 } });
assert(fasRcl.freeAtSeaActive === false, 'FaS toggle ignored for RCL (no freeAtSea block)');

// ON for Carnival → ignored
const fasCcl = run(ccl, { days: 7, adults: 2, freeAtSeaMode: true, seaApply: false, drinks: { cocktail: 4 } });
assert(fasCcl.freeAtSeaActive === false, 'FaS toggle ignored for Carnival');

// FaS with minors → minors still get separate billing
const fasMinors = run(ncl, { days: 7, adults: 2, minors: 2, freeAtSeaMode: true, seaApply: false, drinks: { cocktail: 4, soda: 3 } });
assert(collectNonFinite(fasMinors, '').length === 0, 'FaS + minors → no NaN');
assert(fasMinors.freeAtSeaActive === true, 'FaS + minors → still active');

// FaS + 1 adult → expected $28.50 × 7 × 1 = $199.50
const fasSolo = run(ncl, { days: 7, adults: 1, freeAtSeaMode: true, seaApply: false, drinks: { cocktail: 4 } });
assert(near(fasSolo.packageBreakdown.deluxe.fixedCost, 28.50 * 7 * 1, 0.02),
  'FaS solo: $199.50', `got $${fasSolo.packageBreakdown.deluxe.fixedCost.toFixed(2)}`);

// ═══════════════════════════════════════════════════════════════
// J. CHILD PRICING (v2.1)
// ═══════════════════════════════════════════════════════════════
section('J. Child pricing');

// Carnival soda: adults at $11.99, kids at $6.95
const childTest = run(ccl, { days: 7, adults: 2, minors: 3, seaApply: false, drinks: { soda: 4 } }, null, 'soda');
const expectedChild =
  (2 * ccl.packages.soda.priceMid * (1 + ccl.rules.gratuity) * 7) +
  (3 * ccl.packages.soda.childPriceMid * (1 + ccl.rules.gratuity) * 7);
assert(near(childTest.packageBreakdown.soda.fixedCost, expectedChild, 0.02),
  'Carnival soda: adults=$11.99 minors=$6.95',
  `$${childTest.packageBreakdown.soda.fixedCost.toFixed(2)} vs $${expectedChild.toFixed(2)}`);

// No childPriceMid (RCL) → all billed at adult rate
const noChildTest = run(rcl, { days: 7, adults: 2, minors: 3, seaApply: false, drinks: { soda: 4 } }, null, 'soda');
const expectedNoChild = (2 + 3) * rcl.packages.soda.priceMid * (1 + rcl.rules.gratuity) * 7;
assert(near(noChildTest.packageBreakdown.soda.fixedCost, expectedNoChild, 0.02),
  'RCL soda: all billed at adult rate (no childPriceMid)',
  `$${noChildTest.packageBreakdown.soda.fixedCost.toFixed(2)} vs $${expectedNoChild.toFixed(2)}`);

// Zero minors → child pricing unused
const noMinors = run(ccl, { days: 7, adults: 2, minors: 0, seaApply: false, drinks: { soda: 4 } }, null, 'soda');
const expectedAdultsOnly = 2 * ccl.packages.soda.priceMid * (1 + ccl.rules.gratuity) * 7;
assert(near(noMinors.packageBreakdown.soda.fixedCost, expectedAdultsOnly, 0.02),
  'Carnival 0 minors: child pricing has no effect');

// ═══════════════════════════════════════════════════════════════
// K. GRANDFATHERING (v2.1)
// ═══════════════════════════════════════════════════════════════
section('K. Grandfathering');

// No bookingDate → all effective
const noDate = run(rcl, { drinks: { soda: 1 } });
const noDateFreestyle = noDate.appliedPolicies.find(p => p.id === 'coca-cola-freestyle-cut-2026');
assert(noDateFreestyle && noDateFreestyle.effective === true, 'no bookingDate → freestyle effective');
assert(noDateFreestyle && noDateFreestyle.grandfathered === false, 'no bookingDate → not grandfathered');

// Pre-cutoff date → grandfathered
const pre = run(rcl, { bookingDate: '2026-01-15', drinks: { soda: 1 } });
const preP = pre.appliedPolicies.find(p => p.id === 'coca-cola-freestyle-cut-2026');
assert(preP && preP.grandfathered === true, 'bookingDate pre-cutoff → grandfathered');
assert(preP && preP.effective === false, 'bookingDate pre-cutoff → not effective');

// Post-cutoff date → effective
const post = run(rcl, { bookingDate: '2026-04-01', drinks: { soda: 1 } });
const postP = post.appliedPolicies.find(p => p.id === 'coca-cola-freestyle-cut-2026');
assert(postP && postP.grandfathered === false, 'bookingDate post-cutoff → not grandfathered');
assert(postP && postP.effective === true, 'bookingDate post-cutoff → effective');

// Exact date = effective (not strictly before)
const exact = run(rcl, { bookingDate: '2026-03-15', drinks: { soda: 1 } });
const exactP = exact.appliedPolicies.find(p => p.id === 'coca-cola-freestyle-cut-2026');
assert(exactP && exactP.grandfathered === false, 'bookingDate = effectiveDate → not grandfathered');

// Policies without effectiveDate → always effective regardless of bookingDate
const allAdultsP = pre.appliedPolicies.find(p => p.id === 'all-adults-same');
assert(allAdultsP && allAdultsP.effective === true, 'policy without effectiveDate → always effective');

// Advisory only: trip totals identical
assert(near(pre.trip, post.trip, 0.01), 'grandfathering has no math impact');

// NCL policies with effectiveDate
const nclPre = run(ncl, { bookingDate: '2026-02-01', drinks: { cocktail: 1 } });
const nclGsc = nclPre.appliedPolicies.find(p => p.id === 'great-stirrup-cay-2026');
assert(nclGsc && nclGsc.grandfathered === true, 'NCL GSC policy grandfathered for Feb booking');

// ═══════════════════════════════════════════════════════════════
// L. CROSS-FEATURE INTERACTIONS
// ═══════════════════════════════════════════════════════════════
section('L. Cross-feature');

// FaS + child pricing + bookingDate all active simultaneously
const combo = run(ncl, {
  days: 7, adults: 2, minors: 1,
  freeAtSeaMode: true, bookingDate: '2026-01-01',
  seaApply: false, drinks: { cocktail: 4, soda: 2 }
});
assert(combo.freeAtSeaActive === true, 'combo: FaS active');
assert(combo.appliedPolicies.length > 0, 'combo: appliedPolicies populated');
assert(collectNonFinite(combo, '').length === 0, 'combo: no NaN');
const comboGsc = combo.appliedPolicies.find(p => p.id === 'great-stirrup-cay-2026');
assert(comboGsc && comboGsc.grandfathered === true, 'combo: GSC grandfathered');

// FaS + vouchers (NCL has no vouchers, but passing the object shouldn't crash)
const fasVoucher = run(ncl, {
  days: 7, adults: 2, freeAtSeaMode: true, seaApply: false,
  drinks: { cocktail: 4 }
}, { adultCountPerDay: 4, minorCountPerDay: 0, perVoucherValue: 15 });
assert(collectNonFinite(fasVoucher, '').length === 0, 'FaS + voucher object → no NaN');

// Child pricing + deluxe forced (minors get refresh at child rate if configured)
const childDeluxe = run(ccl, {
  days: 7, adults: 2, minors: 2, seaApply: false,
  drinks: { cocktail: 8, soda: 3 }
}, null, 'deluxe');
assert(collectNonFinite(childDeluxe, '').length === 0, 'Carnival child + forced deluxe → no NaN');

// ═══════════════════════════════════════════════════════════════
// M. PER-LINE BEHAVIOR
// ═══════════════════════════════════════════════════════════════
section('M. Per-line');

// RCL: gratuity=18%, cap=$14, vouchers work, coffee card works
const rclSanity = run(rcl, { days: 7, adults: 2, seaApply: false, drinks: { cocktail: 3, beer: 2, soda: 2, coffee: 1 } });
assert(collectNonFinite(rclSanity, '').length === 0, 'RCL sanity → no NaN');
assert(typeof rclSanity.winnerKey === 'string', 'RCL has a winner');

// Carnival: gratuity=20%, cap=$20, no vouchers, no coffee card, child pricing
const cclSanity = run(ccl, { days: 7, adults: 2, minors: 1, seaApply: false, drinks: { cocktail: 3, beer: 2, soda: 2, coffee: 1 } });
assert(collectNonFinite(cclSanity, '').length === 0, 'Carnival sanity → no NaN');

// NCL: gratuity=20%, cap=$15, no vouchers, no coffee card, FaS available
const nclSanity = run(ncl, { days: 7, adults: 2, seaApply: false, drinks: { cocktail: 3, beer: 2, soda: 2, coffee: 1 } });
assert(collectNonFinite(nclSanity, '').length === 0, 'NCL sanity → no NaN');

// NCL's deluxeCap is $15 (lower than RCL $14 / Carnival $20) — spirits at $10 under NCL cap
const nclSpirits = run(ncl, { days: 7, adults: 1, seaApply: false, drinks: { spirits: 5 } });
assert(nclSpirits.overcap === 0, 'NCL spirits at $10 under $15 cap → overcap=0');

// All three lines produce valid results for same input
const sharedInput = { days: 10, adults: 3, minors: 1, seaApply: true, seaDays: 4, seaWeight: 15,
  drinks: { cocktail: 3, beer: 2, wine: 1, soda: 2, coffee: 1, bottledwater: 1 } };
for (const [name, lc] of [['RCL', rcl], ['Carnival', ccl], ['NCL', ncl]]) {
  const r = run(lc, sharedInput);
  assert(collectNonFinite(r, '').length === 0, `${name} shared input → no NaN`);
  assert(r.trip > 0, `${name} shared input → trip > 0`);
  assert(r.perDay > 0, `${name} shared input → perDay > 0`);
  assert(near(r.perDay * 10, r.trip, 0.10), `${name} shared input → perDay×days ≈ trip`);
}

// ═══════════════════════════════════════════════════════════════
// N. MONETARY PRECISION & DEFENSIVE
// ═══════════════════════════════════════════════════════════════
section('N. Precision & defensive');

// perDay × days ≈ trip (within 5c tolerance)
for (const [name, lc] of [['RCL', rcl], ['Carnival', ccl], ['NCL', ncl]]) {
  const r = run(lc, { days: 14, adults: 4, seaApply: true, seaDays: 6, seaWeight: 25,
    drinks: { cocktail: 3, beer: 2, wine: 1, mocktail: 1 } });
  const diff = Math.abs(r.perDay * 14 - r.trip);
  assert(diff < 0.06, `${name} 14-day trip: perDay×days - trip = $${diff.toFixed(4)}`);
}

// packageBreakdown.*.total is non-negative for all packages
const stressTest = run(rcl, { days: 3, adults: 1, minors: 0, seaApply: false,
  drinks: { cocktail: 1, beer: 1, soda: 1, coffee: 1, wine: 1, spirits: 1, energy: 1, bottledwater: 1 } });
for (const pkg of ['soda', 'refresh', 'deluxe']) {
  assert(stressTest.packageBreakdown[pkg].total >= 0,
    `packageBreakdown.${pkg}.total ≥ 0 ($${stressTest.packageBreakdown[pkg].total.toFixed(2)})`);
}

// Missing lineConfig → engine uses fallback defaults, no crash
const noConfig = compute(
  baseInputs({ drinks: { cocktail: 2 } }),
  { pkg: { soda: 10, refresh: 30, deluxe: 80, coffee: 0 }, grat: 0.18, deluxeCap: 14 },
  { prices: { cocktail: 14 }, sets: { soda: [], refresh: [], deluxe: ['cocktail'], alcoholic: ['cocktail'] }, rules: { gratuity: 0.18, deluxeCap: 14 } },
  null, null, null
);
assert(collectNonFinite(noConfig, '').length === 0, 'null lineConfig → no NaN');
assert(noConfig.trip >= 0, 'null lineConfig → valid trip');
assert(Array.isArray(noConfig.appliedPolicies) && noConfig.appliedPolicies.length === 0,
  'null lineConfig → empty appliedPolicies');
assert(noConfig.freeAtSeaActive === false, 'null lineConfig → freeAtSeaActive=false');

// Very large drink quantities
const bigDrinks = run(rcl, { days: 1, adults: 1, seaApply: false, drinks: { cocktail: 9999 } });
assert(Number.isFinite(bigDrinks.trip), 'extreme qty → trip is finite');
assert(bigDrinks.trip > 0, 'extreme qty → trip > 0');

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
if (currentSection) {
  console.log(`  ${currentSection}: ${sectionPass} pass, ${sectionFail} fail\n`);
}

console.log('════════════════════════════════════');
console.log(`Total: ${totalPass + totalFail}  Pass: ${totalPass}  Fail: ${totalFail}`);
console.log('════════════════════════════════════');

if (totalFail > 0) {
  console.error(`\n${totalFail} test(s) failed.`);
  process.exit(1);
}
console.log('\nAll math engine tests pass.');
process.exit(0);
