// tests/unit/cruise-tipping/calc.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcDailyTotal, calcOnboardAutoGrats, calcCashExtras, calcGrandTotal } from "../../../assets/js/tools/cruise-tipping-calculator/calc.js";

const carnival = {
  bundledInFare: false,
  dailyRates: {
    tiers: [
      { slug: "standard", amount: 17, isDefault: true },
      { slug: "suite",    amount: 19, isDefault: false }
    ],
    upcomingChange: null
  },
  childPolicy: { exemptUnderAge: 2 },
  autoGratuities: { bar: { percent: 20 }, spa: { percent: 20 }, specialtyDining: { percent: 20 }, roomService: { percent: 20 } }
};
const princess = {
  bundledInFare: false,
  dailyRates: {
    tiers: [
      { slug: "standard",   amount: 18, isDefault: true },
      { slug: "mini-suite", amount: 19, isDefault: false },
      { slug: "suite",      amount: 20, isDefault: false }
    ],
    upcomingChange: null
  },
  childPolicy: { exemptUnderAge: null },
  autoGratuities: { bar: { percent: 20 }, spa: { percent: 20 }, specialtyDining: { percent: 20 }, roomService: { percent: 20 } }
};
const hal = {
  bundledInFare: false,
  dailyRates: {
    tiers: [
      { slug: "standard", amount: 17, isDefault: true },
      { slug: "suite",    amount: 19, isDefault: false }
    ],
    upcomingChange: {
      effectiveDate: "2026-06-01",
      tiers: [{ slug: "standard", amount: 18 }, { slug: "suite", amount: 20 }],
      autoGratuitiesPercent: 20
    }
  },
  childPolicy: { exemptUnderAge: null },
  autoGratuities: { bar: { percent: 18 }, spa: { percent: 18 }, specialtyDining: { percent: 18 }, roomService: { percent: 18 } }
};
const regent = { bundledInFare: true, dailyRates: null, childPolicy: null, autoGratuities: null };

test("daily total: 7 nights × 2 adults × $17 standard Carnival = $238", () => {
  assert.equal(calcDailyTotal(carnival, { cabinTier: "standard", nights: 7, adults: 2, childAges: [] }), 238);
});

test("daily total: Princess mini-suite ($19) for 7 nights × 2 = $266", () => {
  assert.equal(calcDailyTotal(princess, { cabinTier: "mini-suite", nights: 7, adults: 2, childAges: [] }), 266);
});

test("daily total: skip exempt children (Carnival under 2)", () => {
  assert.equal(calcDailyTotal(carnival, { cabinTier: "standard", nights: 7, adults: 2, childAges: [1, 5] }), 7 * 17 * 3); // 2 adults + 1 charged child (age 5)
});

test("daily total: HAL with sailing date >= 2026-06-01 picks upcoming rate ($18)", () => {
  assert.equal(calcDailyTotal(hal, { cabinTier: "standard", nights: 7, adults: 2, childAges: [], sailingDate: "2026-07-15" }), 7 * 18 * 2);
});

test("daily total: HAL with sailing date < 2026-06-01 picks current rate ($17)", () => {
  assert.equal(calcDailyTotal(hal, { cabinTier: "standard", nights: 7, adults: 2, childAges: [], sailingDate: "2026-05-20" }), 7 * 17 * 2);
});

test("daily total: bundled-in-fare line returns 0", () => {
  assert.equal(calcDailyTotal(regent, { cabinTier: "suite", nights: 10, adults: 2, childAges: [] }), 0);
});

test("daily total: unknown cabinTier slug falls back to default tier", () => {
  // Princess default is "standard" ($18); pass an unknown slug, expect $18 not a crash.
  assert.equal(calcDailyTotal(princess, { cabinTier: "bogus", nights: 7, adults: 2, childAges: [] }), 7 * 18 * 2);
});

test("onboard auto-grats: $300 bar at 20% = $60 (Carnival post-Dec-2025)", () => {
  const out = calcOnboardAutoGrats(carnival, { barTab: 300, barPrepaid: false, specialtyCost: 0, specialtyMeals: 0, spaTotal: 0, roomServiceCount: 0, roomServiceAvg: 0 });
  assert.equal(out.total, 60);
});

test("onboard auto-grats: prepaid bar package excludes bar tab", () => {
  const out = calcOnboardAutoGrats(carnival, { barTab: 300, barPrepaid: true, specialtyCost: 0, specialtyMeals: 0, spaTotal: 0, roomServiceCount: 0, roomServiceAvg: 0 });
  assert.equal(out.bar, 0);
});

test("onboard auto-grats: specialty dining 2 meals × $80 × 20% = $32 (Carnival)", () => {
  const out = calcOnboardAutoGrats(carnival, { barTab: 0, barPrepaid: false, specialtyCost: 80, specialtyMeals: 2, spaTotal: 0, roomServiceCount: 0, roomServiceAvg: 0 });
  assert.equal(out.specialty, 32);
});

test("cash extras sum: porter $2 × 4 bags + butler $5/day × 7 = $8 + $35 = $43", () => {
  const line = {
    bundledInFare: false,
    recommendedCashExtras: {
      porterPerBag: { default: 2, perBag: true, note: "" },
      butler: { default: 5, perDay: true, note: "" }
    }
  };
  const inputs = { cashExtras: { porterPerBag: { count: 4 }, butler: { override: null } }, nights: 7 };
  assert.equal(calcCashExtras(line, inputs), 43);
});

test("grand total = daily + onboard + cash (Carnival 20% auto-grats)", () => {
  const inputs = {
    cabinTier: "standard", nights: 7, adults: 2, childAges: [],
    barTab: 300, barPrepaid: false,
    specialtyCost: 80, specialtyMeals: 2,
    spaTotal: 150, roomServiceCount: 5, roomServiceAvg: 3,
    cashExtras: {}
  };
  const t = calcGrandTotal(carnival, inputs);
  // 238 daily + (60 bar + 32 specialty + 30 spa + 3 RS) + 0 cash = 363
  assert.equal(t.total, 363);
});
