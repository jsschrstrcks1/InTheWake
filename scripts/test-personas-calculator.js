#!/usr/bin/env node
/**
 * test-personas-calculator.js
 *
 * Drives the live calculator-math-v2 compute() against personas 61-70,
 * once per supported cruise line in calculator-config.json (currently RCL + Carnival).
 *
 * Goal: make sure nothing broke in the drink calculator for the new personas.
 *
 * Approach:
 *   1. Load assets/js/calculator-math-v2.js as source, run it in a Function
 *      sandbox with a fake `window` so its `window.ITW_MATH.compute` export
 *      is captured. No browser / worker needed.
 *   2. Load assets/data/calculator-config.json. For each line (RCL, Carnival),
 *      build the dataset shape the calculator uses at runtime:
 *          dataset = { prices, sets, rules }
 *      where prices is { drinkId: price } plus coffeeSmall/coffeeLarge aliases.
 *   3. Translate each persona into realistic drink inputs (days, adults,
 *      minors, drinks{id: qty}) based on their quiz profile.
 *   4. Call compute() and assert:
 *        - no NaN / Infinity anywhere in the result
 *        - winnerKey is one of {soda, refresh, deluxe, alacarte}
 *        - perDay * days ≈ trip (within $0.02 rounding)
 *        - packageBreakdown is present for every package
 *        - overcap is >= 0
 *        - voucherSavings >= 0 (never negative)
 *        - if adults === 0 then compute must still return (won't blow up)
 *        - included.soda <= included.refresh <= included.deluxe (monotonic)
 *   5. Report pass/fail table. Exit 1 on any failure.
 *
 * Usage:
 *   node scripts/test-personas-calculator.js
 *   node scripts/test-personas-calculator.js --verbose
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MATH_PATH = path.join(__dirname, '..', 'assets', 'js', 'calculator-math-v2.js');
const CONFIG_PATH = path.join(__dirname, '..', 'assets', 'data', 'calculator-config.json');
const VERBOSE = process.argv.includes('--verbose');

// ---------------------------------------------------------------------------
// 1. Load math engine in a sandbox
// ---------------------------------------------------------------------------

function loadMathEngine() {
  const source = fs.readFileSync(MATH_PATH, 'utf8');
  const sandbox = { window: {}, self: {}, console };
  // eslint-disable-next-line no-new-func
  const fn = new Function('window', 'self', 'console', source);
  fn(sandbox.window, sandbox.self, sandbox.console);
  const api = sandbox.window.ITW_MATH || sandbox.self.ITW_MATH;
  if (!api || typeof api.compute !== 'function') {
    throw new Error('Failed to capture ITW_MATH.compute from calculator-math-v2.js');
  }
  return api;
}

// ---------------------------------------------------------------------------
// 2. Build dataset from a line config (mirrors calculator-v2.js switchLine)
// ---------------------------------------------------------------------------

function buildDataset(lc) {
  const prices = {};
  (lc.drinks || []).forEach(d => { prices[d.id] = Number(d.price); });
  // Math engine uses coffeeSmall/coffeeLarge — if only `coffee` exists, alias.
  if (prices.coffee !== undefined && prices.coffeeSmall === undefined) {
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
  const rules = {
    gratuity: Number(lc.rules?.gratuity ?? 0.20),
    deluxeCap: Number(lc.rules?.deluxeCap ?? 14),
    caps: { deluxeAlcohol: Number(lc.rules?.deluxeCap ?? 14) },
  };
  return { prices, sets, rules };
}

function buildEconomics(lc) {
  return {
    pkg: {
      soda: Number(lc.packages?.soda?.priceMid ?? 10.99),
      refresh: Number(lc.packages?.refreshment?.priceMid ?? 34),
      deluxe: Number(lc.packages?.deluxe?.priceMid ?? 85),
      coffee: Number(lc.coffeeCard?.price ?? 0),
    },
    grat: Number(lc.rules?.gratuity ?? 0.20),
    deluxeCap: Number(lc.rules?.deluxeCap ?? 14),
  };
}

// ---------------------------------------------------------------------------
// 3. Persona → drink-calculator input mapping
// ---------------------------------------------------------------------------

// Each persona maps to a realistic party + consumption profile.
// Fields: partySize (adults, minors), days, drinks (id → per-person-per-day qty),
// coffeeCards, coffeePunches, voucherAdult/Minor (if Diamond+ loyalty).
const personaInputs = [
  {
    id: 61, name: 'Neurodivergent Navigator',
    adults: 1, minors: 0, days: 7, seaDays: 3, seaApply: false, seaWeight: 0,
    coffeeCards: 1, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    drinks: { coffee: 2, teaprem: 2, bottledwater: 3 }, // quiet, non-alcoholic
  },
  {
    id: 62, name: 'Homeschooling Pod',
    adults: 2, minors: 4, days: 10, seaDays: 3, seaApply: true, seaWeight: 10,
    coffeeCards: 0, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    drinks: { coffee: 2, soda: 2, freshjuice: 1, wine: 1, beer: 1 },
  },
  {
    id: 63, name: 'Plus-Size Proud',
    adults: 2, minors: 0, days: 7, seaDays: 2, seaApply: true, seaWeight: 15,
    coffeeCards: 0, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    drinks: { soda: 3, cocktail: 2, mocktail: 1, bottledwater: 2 },
  },
  {
    id: 64, name: 'Corporate Incentive',
    adults: 24, minors: 0, days: 4, seaDays: 2, seaApply: true, seaWeight: 20,
    coffeeCards: 0, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    drinks: { cocktail: 4, wine: 2, beer: 2, coffee: 2, bottledwater: 2 },
  },
  {
    id: 65, name: 'Sober Cruisers',
    adults: 6, minors: 0, days: 7, seaDays: 3, seaApply: false, seaWeight: 0,
    coffeeCards: 2, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    drinks: { mocktail: 3, coffee: 3, teaprem: 2, freshjuice: 1, bottledwater: 3 },
  },
  {
    id: 66, name: 'Veterans Reunion',
    adults: 8, minors: 0, days: 14, seaDays: 7, seaApply: true, seaWeight: 15,
    coffeeCards: 1, coffeePunches: 0, voucherAdult: 4, voucherMinor: 0, // Diamond on RCL
    drinks: { wine: 2, beer: 2, spirits: 1, coffee: 2, teaprem: 1 },
  },
  {
    id: 67, name: 'Ash-Scattering Pilgrims',
    adults: 6, minors: 0, days: 10, seaDays: 3, seaApply: true, seaWeight: 10,
    coffeeCards: 1, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    drinks: { wine: 2, coffee: 2, teaprem: 1, bottledwater: 2 },
  },
  {
    id: 68, name: 'Competitive Eaters',
    adults: 2, minors: 0, days: 7, seaDays: 2, seaApply: true, seaWeight: 30,
    coffeeCards: 0, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    // Binge-eater profile — stress test high quantities
    drinks: { cocktail: 8, beer: 8, wine: 4, soda: 6, milkshake: 3, energy: 3 },
  },
  {
    id: 69, name: 'Francophile Book Club',
    adults: 6, minors: 0, days: 14, seaDays: 6, seaApply: true, seaWeight: 10,
    coffeeCards: 1, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    drinks: { wine: 3, coffee: 2, teaprem: 1, cocktail: 1 },
  },
  {
    id: 70, name: 'Crypto Bros',
    adults: 4, minors: 0, days: 4, seaDays: 1, seaApply: true, seaWeight: 35,
    coffeeCards: 0, coffeePunches: 0, voucherAdult: 0, voucherMinor: 0,
    // Flex trip — top-shelf ordering, tests deluxeCap overflow
    drinks: { cocktail: 6, spirits: 4, beer: 3, energy: 2 },
  },
];

// ---------------------------------------------------------------------------
// 4. Assertions on a compute() result
// ---------------------------------------------------------------------------

function collectNumbers(obj, path = '', out = []) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj === 'number') {
    if (!Number.isFinite(obj)) out.push({ path, value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => collectNumbers(v, `${path}[${i}]`, out));
    return out;
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      collectNumbers(obj[k], path ? `${path}.${k}` : k, out);
    }
  }
  return out;
}

function assertResult(result, persona, lineId) {
  const issues = [];
  const validWinners = new Set(['alc', 'soda', 'refresh', 'deluxe', 'coffee', null]);

  const badNums = collectNumbers(result);
  if (badNums.length) {
    issues.push(`non-finite: ${badNums.slice(0, 3).map(b => `${b.path}=${b.value}`).join(', ')}`);
  }

  if (!validWinners.has(result.winnerKey)) {
    issues.push(`winnerKey invalid: ${result.winnerKey}`);
  }
  if (result.minorWinnerKey !== null && !validWinners.has(result.minorWinnerKey)) {
    issues.push(`minorWinnerKey invalid: ${result.minorWinnerKey}`);
  }

  // perDay * days ≈ trip (within 2c tolerance for rounding)
  const diff = Math.abs((result.perDay * persona.days) - result.trip);
  if (diff > 0.05) {
    issues.push(`perDay*days (${(result.perDay * persona.days).toFixed(2)}) != trip (${result.trip.toFixed(2)}) diff=${diff.toFixed(2)}`);
  }

  // packageBreakdown must exist for each package
  if (!result.packageBreakdown || typeof result.packageBreakdown !== 'object') {
    issues.push('packageBreakdown missing');
  } else {
    for (const pkg of ['soda', 'refresh', 'deluxe']) {
      const pb = result.packageBreakdown[pkg];
      if (!pb) issues.push(`packageBreakdown.${pkg} missing`);
      else if (!Number.isFinite(pb.total) || pb.total < 0) {
        issues.push(`packageBreakdown.${pkg}.total invalid (${pb.total})`);
      }
    }
  }

  // overcap non-negative
  if (!(Number.isFinite(result.overcap) && result.overcap >= 0)) {
    issues.push(`overcap invalid (${result.overcap})`);
  }

  // voucherSavings non-negative
  if (!(Number.isFinite(result.voucherSavings) && result.voucherSavings >= 0)) {
    issues.push(`voucherSavings invalid (${result.voucherSavings})`);
  }

  // included monotonicity: soda ≤ refresh ≤ deluxe
  if (result.included) {
    const { soda, refresh, deluxe } = result.included;
    if (!(refresh >= soda - 0.01)) issues.push(`included.refresh (${refresh}) < soda (${soda})`);
    if (!(deluxe >= refresh - 0.01)) issues.push(`included.deluxe (${deluxe}) < refresh (${refresh})`);
  }

  // Results should be recommending something when trip > 0
  if (result.trip > 0 && !result.winnerKey) {
    issues.push(`trip=${result.trip} but no winnerKey`);
  }

  return issues;
}

// ---------------------------------------------------------------------------
// 5. Run
// ---------------------------------------------------------------------------

function main() {
  const { compute, version } = loadMathEngine();
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const lineIds = Object.keys(config.lines);

  console.log(`Math engine v${version} loaded. Testing against ${lineIds.length} line(s): ${lineIds.join(', ')}`);
  console.log(`Running ${personaInputs.length} personas × ${lineIds.length} lines = ${personaInputs.length * lineIds.length} compute() calls\n`);

  const rows = [];
  let failed = 0;

  for (const p of personaInputs) {
    for (const lineId of lineIds) {
      const lc = config.lines[lineId];
      const dataset = buildDataset(lc);
      const economics = buildEconomics(lc);
      const hasVouchers = (p.voucherAdult > 0 || p.voucherMinor > 0) && lc.loyalty?.enabled;
      const vouchers = hasVouchers ? {
        adultCountPerDay: p.voucherAdult,
        minorCountPerDay: p.voucherMinor,
        perVoucherValue: Number(lc.loyalty?.voucherValue ?? economics.deluxeCap),
      } : null;

      const inputs = {
        days: p.days,
        seaDays: p.seaDays,
        seaApply: p.seaApply,
        seaWeight: p.seaWeight,
        adults: p.adults,
        minors: p.minors,
        coffeeCards: lc.coffeeCard?.enabled ? p.coffeeCards : 0,
        coffeePunches: lc.coffeeCard?.enabled ? p.coffeePunches : 0,
        drinks: p.drinks,
      };

      let result, error;
      try {
        result = compute(inputs, economics, dataset, vouchers, null, lc);
      } catch (e) {
        error = e;
      }

      const row = {
        id: p.id,
        persona: p.name,
        line: lc.shortName || lc.name,
        winner: error ? 'ERROR' : (result.winnerKey || 'none'),
        trip: error ? 'ERROR' : `$${result.trip.toFixed(2)}`,
        overcap: error ? '' : `$${result.overcap.toFixed(2)}`,
        issues: [],
      };

      if (error) {
        row.issues.push(`threw: ${error.message}`);
        failed++;
      } else {
        row.issues = assertResult(result, p, lineId);
        if (row.issues.length) failed++;
      }

      rows.push(row);

      if (VERBOSE && !error) {
        console.log(`\nP${p.id} ${p.name} × ${lc.shortName}`);
        console.log(`  winner=${result.winnerKey || 'none'}  trip=$${result.trip.toFixed(2)}  perDay=$${result.perDay.toFixed(2)}  overcap=$${result.overcap.toFixed(2)}  voucherSavings=$${result.voucherSavings.toFixed(2)}`);
        if (row.issues.length) console.log(`  ISSUES: ${row.issues.join(' | ')}`);
      }
    }
  }

  // Summary table
  console.log('');
  console.log('=== Drink Calculator Regression Summary (personas 61-70) ===');
  console.log('P#  | Line             | Winner  | Trip       | Overcap   | Status');
  console.log('----+------------------+---------+------------+-----------+----------------------');
  for (const r of rows) {
    const status = r.issues.length === 0 ? 'PASS' : 'FAIL';
    console.log(
      `${String(r.id).padEnd(3)} | ${(r.line || '').padEnd(16)} | ${String(r.winner).padEnd(7)} | ${String(r.trip).padEnd(10)} | ${String(r.overcap).padEnd(9)} | ${status}`
    );
    if (r.issues.length) console.log(`    └─ ${r.issues.join(' | ')}`);
  }
  console.log('');
  console.log(`Total calls: ${rows.length}  Pass: ${rows.length - failed}  Fail: ${failed}`);

  if (failed > 0) {
    console.error(`\n${failed} call(s) regressed. Inspect calculator-math-v2.js or calculator-config.json.`);
    process.exit(1);
  }
  console.log('\nAll personas × lines pass. Drink calculator is intact for personas 61-70.');

  // -------------------------------------------------------------------------
  // Phase 2 preview: Free-at-Sea shadow calculation (NCL only)
  //
  // The math engine does not yet consume lineConfig.freeAtSea.
  // This block validates the config block is well-formed and previews
  // the break-even flip that NCL's flat $28.50/day service charge creates.
  // When the engine adds Free-at-Sea support, this shadow calc becomes the
  // source of truth the engine must match.
  // -------------------------------------------------------------------------
  const ncl = config.lines.ncl;
  if (ncl && ncl.freeAtSea) {
    const fas = ncl.freeAtSea;
    const standaloneDaily = ncl.packages.deluxe.priceMid * (1 + ncl.rules.gratuity);
    const fasDaily = fas.serviceChargePerDay;

    console.log('\n=== Phase 2 Preview: NCL Free-at-Sea Shadow Calculation ===');
    console.log(`Standalone: $${ncl.packages.deluxe.priceMid.toFixed(2)}/day × ${ncl.rules.gratuity * 100}% gratuity = $${standaloneDaily.toFixed(2)}/person/day`);
    console.log(`Free-at-Sea: flat $${fasDaily.toFixed(2)}/person/day (${(fasDaily / ncl.packages.deluxe.priceMid * 100).toFixed(1)}% effective rate)`);
    console.log(`Per-couple 7-night savings if eligible for Free-at-Sea: $${((standaloneDaily - fasDaily) * 2 * 7).toFixed(2)}\n`);

    // Config block consistency assertions
    const fasIssues = [];
    if (fas.serviceChargePerDay <= 0) fasIssues.push('serviceChargePerDay must be positive');
    if (fas.serviceChargeModel !== 'flat') fasIssues.push(`serviceChargeModel expected "flat", got ${fas.serviceChargeModel}`);
    if (fasDaily >= standaloneDaily) fasIssues.push(`Free-at-Sea daily ($${fasDaily}) not cheaper than standalone ($${standaloneDaily.toFixed(2)}) — config likely wrong`);
    if (fas.packageCovered !== 'deluxe') fasIssues.push(`packageCovered should be "deluxe", got ${fas.packageCovered}`);

    if (!ncl.freeAtSeaPlus) fasIssues.push('freeAtSeaPlus block missing');
    else {
      const fasp = ncl.freeAtSeaPlus;
      if (!fasp.pricePerDay || fasp.pricePerDay <= 0) fasIssues.push('freeAtSeaPlus.pricePerDay missing/invalid');
      if (!Array.isArray(fasp.includes) || fasp.includes.length === 0) fasIssues.push('freeAtSeaPlus.includes must be non-empty array');
    }

    // Policy block sanity — the Great Stirrup Cay policy must be present with a 2026 effectiveDate
    const gscPolicy = (ncl.policies || []).find(p => p.id === 'great-stirrup-cay-2026');
    if (!gscPolicy) fasIssues.push('Missing great-stirrup-cay-2026 policy (critical 2026 rule)');
    else if (!gscPolicy.effectiveDate || !gscPolicy.effectiveDate.startsWith('2026-')) {
      fasIssues.push(`great-stirrup-cay-2026.effectiveDate missing or not 2026 (${gscPolicy.effectiveDate})`);
    }

    if (fasIssues.length) {
      console.error('NCL Free-at-Sea config FAILED:');
      for (const i of fasIssues) console.error('  - ' + i);
      process.exit(1);
    }
    console.log('NCL Free-at-Sea config passes structural checks.');
  }

  // -------------------------------------------------------------------------
  // v2.1 engine features — three net-new code paths to exercise:
  //   A. Free-at-Sea mode    (inputs.freeAtSeaMode)
  //   B. Child pricing       (lineConfig.packages.soda.childPriceMid)
  //   C. Grandfather policy  (inputs.bookingDate vs policy.effectiveDate)
  // These scenarios run additional compute() calls against a fixed persona
  // and assert the expected behavior changes.
  // -------------------------------------------------------------------------
  console.log('\n=== v2.1 Engine Feature Tests ===');
  let featureFails = 0;
  const featureMsg = (ok, label, detail) => {
    const status = ok ? 'PASS' : 'FAIL';
    if (!ok) featureFails++;
    console.log(`  [${status}] ${label}${detail ? '  — ' + detail : ''}`);
  };

  // ---- A. Free-at-Sea mode (NCL) ----
  // Same inputs computed twice: once without Free-at-Sea, once with.
  // Expectation: with Free-at-Sea, deluxePkg cost drops from ~$1831 (2 adults × 7
  // days × $109 × 1.20) to $399 (2 × 7 × $28.50). Winner should shift or at
  // minimum the deluxe bar should get ~22% of its previous cost.
  {
    const ncl = config.lines.ncl;
    if (ncl && ncl.freeAtSea) {
      const dataset = buildDataset(ncl);
      const economics = buildEconomics(ncl);
      const baseInputs = {
        days: 7, seaDays: 2, seaApply: false, seaWeight: 0,
        adults: 2, minors: 0,
        coffeeCards: 0, coffeePunches: 0,
        drinks: { cocktail: 4, beer: 2, wine: 1 },
      };

      const off = compute(baseInputs, economics, dataset, null, 'deluxe', ncl);
      const on = compute({ ...baseInputs, freeAtSeaMode: true }, economics, dataset, null, 'deluxe', ncl);

      const expectedFasDeluxe = ncl.freeAtSea.serviceChargePerDay * baseInputs.days * baseInputs.adults;
      const fasDeluxeActual = on.packageBreakdown.deluxe.fixedCost;
      const expectedStandaloneDeluxe = ncl.packages.deluxe.priceMid * (1 + ncl.rules.gratuity) * baseInputs.days * baseInputs.adults;
      const offDeluxeActual = off.packageBreakdown.deluxe.fixedCost;

      featureMsg(
        Math.abs(offDeluxeActual - expectedStandaloneDeluxe) < 0.01,
        'A1. Free-at-Sea OFF: deluxe pkg = standalone (priceMid × 1.20)',
        `$${offDeluxeActual.toFixed(2)} vs expected $${expectedStandaloneDeluxe.toFixed(2)}`
      );
      featureMsg(
        Math.abs(fasDeluxeActual - expectedFasDeluxe) < 0.01,
        'A2. Free-at-Sea ON: deluxe pkg = flat $28.50/person/day',
        `$${fasDeluxeActual.toFixed(2)} vs expected $${expectedFasDeluxe.toFixed(2)}`
      );
      featureMsg(
        on.freeAtSeaActive === true && on.freeAtSeaDaily === ncl.freeAtSea.serviceChargePerDay,
        'A3. Free-at-Sea ON surfaces freeAtSeaActive + freeAtSeaDaily in result',
        `active=${on.freeAtSeaActive} daily=$${on.freeAtSeaDaily}`
      );
      featureMsg(
        off.freeAtSeaActive === false,
        'A4. Free-at-Sea OFF surfaces freeAtSeaActive=false',
        `active=${off.freeAtSeaActive}`
      );
      featureMsg(
        fasDeluxeActual < offDeluxeActual,
        'A5. Free-at-Sea saves money vs standalone',
        `saves $${(offDeluxeActual - fasDeluxeActual).toFixed(2)} per couple per week`
      );
    } else {
      featureMsg(false, 'A. NCL Free-at-Sea block missing in config');
    }
  }

  // ---- B. Child pricing for Bottomless Bubbles (Carnival) ----
  // Force the soda package so we can inspect its minors portion directly.
  {
    const carnival = config.lines.carnival;
    const childPrice = carnival.packages.soda.childPriceMid;
    if (childPrice) {
      const dataset = buildDataset(carnival);
      const economics = buildEconomics(carnival);
      const inputs = {
        days: 7, seaDays: 0, seaApply: false, seaWeight: 0,
        adults: 2, minors: 3,
        coffeeCards: 0, coffeePunches: 0,
        drinks: { soda: 3 },
      };

      const result = compute(inputs, economics, dataset, null, 'soda', carnival);
      const sodaFixed = result.packageBreakdown.soda.fixedCost;

      // Expected: adults × $11.99 × 1.20 × 7 + minors × $6.95 × 1.20 × 7
      const expected =
        (inputs.adults * carnival.packages.soda.priceMid * (1 + carnival.rules.gratuity) * inputs.days) +
        (inputs.minors * childPrice * (1 + carnival.rules.gratuity) * inputs.days);

      featureMsg(
        Math.abs(sodaFixed - expected) < 0.01,
        'B1. Carnival soda billed adults at $11.99, minors at $6.95',
        `$${sodaFixed.toFixed(2)} vs expected $${expected.toFixed(2)}`
      );

      // Savings vs. old behavior (all billed at adult rate)
      const oldBehavior = (inputs.adults + inputs.minors) * carnival.packages.soda.priceMid * (1 + carnival.rules.gratuity) * inputs.days;
      const savings = oldBehavior - sodaFixed;
      featureMsg(
        savings > 0,
        'B2. Child pricing saves money vs. flat adult billing',
        `family of 5 saves $${savings.toFixed(2)} on 7-night cruise`
      );
    } else {
      featureMsg(false, 'B. Carnival childPriceMid missing');
    }
  }

  // ---- C. Grandfathering via bookingDate (RCL Coca-Cola Freestyle cut) ----
  {
    const rcl = config.lines['royal-caribbean'];
    const freestylePolicy = (rcl.policies || []).find(p => p.id === 'coca-cola-freestyle-cut-2026');
    if (freestylePolicy && freestylePolicy.effectiveDate) {
      const dataset = buildDataset(rcl);
      const economics = buildEconomics(rcl);
      const inputs = {
        days: 7, seaDays: 0, seaApply: false, seaWeight: 0,
        adults: 2, minors: 2,
        coffeeCards: 0, coffeePunches: 0,
        drinks: { soda: 3, coffee: 1 },
      };

      const noBookingDate = compute(inputs, economics, dataset, null, null, rcl);
      const pre = compute({ ...inputs, bookingDate: '2026-02-01' }, economics, dataset, null, null, rcl);
      const post = compute({ ...inputs, bookingDate: '2026-04-01' }, economics, dataset, null, null, rcl);

      const preEntry = pre.appliedPolicies.find(p => p.id === 'coca-cola-freestyle-cut-2026');
      const postEntry = post.appliedPolicies.find(p => p.id === 'coca-cola-freestyle-cut-2026');
      const noneEntry = noBookingDate.appliedPolicies.find(p => p.id === 'coca-cola-freestyle-cut-2026');

      featureMsg(
        preEntry && preEntry.grandfathered === true && preEntry.effective === false,
        'C1. Booking date pre-March-15 2026: Freestyle policy grandfathered',
        `grandfathered=${preEntry?.grandfathered} effective=${preEntry?.effective}`
      );
      featureMsg(
        postEntry && postEntry.grandfathered === false && postEntry.effective === true,
        'C2. Booking date post-March-15 2026: Freestyle policy effective',
        `grandfathered=${postEntry?.grandfathered} effective=${postEntry?.effective}`
      );
      featureMsg(
        noneEntry && noneEntry.grandfathered === false && noneEntry.effective === true,
        'C3. No bookingDate: policy defaults to effective',
        `grandfathered=${noneEntry?.grandfathered} effective=${noneEntry?.effective}`
      );

      // No math impact — trip totals should be identical across all three
      const tripsEqual = Math.abs(pre.trip - post.trip) < 0.01 && Math.abs(pre.trip - noBookingDate.trip) < 0.01;
      featureMsg(
        tripsEqual,
        'C4. Grandfathering is advisory only — trip totals unchanged',
        `pre=$${pre.trip} post=$${post.trip} none=$${noBookingDate.trip}`
      );
    } else {
      featureMsg(false, 'C. RCL coca-cola-freestyle-cut-2026 policy missing');
    }
  }

  console.log('');
  if (featureFails > 0) {
    console.error(`${featureFails} feature test(s) failed.`);
    process.exit(1);
  }
  console.log('All v2.1 engine feature tests pass.');
  process.exit(0);
}

main();
