// tests/unit/cruise-tipping/calc.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcDailyTotal, calcOnboardAutoGrats, calcCashExtras, calcGrandTotal, pickRegion, pickCurrency } from "../../../assets/js/tools/cruise-tipping-calculator/calc.js";

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

// Multi-region fixture mirroring the costa.json shape post-region-pricing fix.
// Default region: South America USD $14.50; Med region: EUR 11.
const costa = {
  bundledInFare: false,
  currency: "USD",
  dailyRates: {
    tiers: [{ slug: "standard", label: "All cabins", amount: 14.50, isDefault: true }],
    upcomingChange: null
  },
  childPolicy: { exemptUnderAge: 4 },
  autoGratuities: { bar: { percent: 15 }, spa: { percent: null }, specialtyDining: { percent: null }, roomService: { percent: null } },
  regions: [
    {
      slug: "south-america",
      currency: "USD",
      isDefault: true,
      dailyRates: { tiers: [{ slug: "standard", amount: 14.50, isDefault: true }] }
    },
    {
      slug: "med-northern-europe",
      currency: "EUR",
      isDefault: false,
      dailyRates: { tiers: [{ slug: "standard", amount: 11.00, isDefault: true }] }
    }
  ]
};

// Multi-region MSC fixture: 3 regions, 2 tiers each.
const msc = {
  bundledInFare: false,
  currency: "USD",
  dailyRates: {
    tiers: [
      { slug: "standard", amount: 17, isDefault: true },
      { slug: "suite",    amount: 23, isDefault: false }
    ],
    upcomingChange: null
  },
  childPolicy: { exemptUnderAge: 2 },
  autoGratuities: { bar: { percent: 18 }, spa: { percent: 18 }, specialtyDining: { percent: 18 }, roomService: { percent: 18 } },
  regions: [
    { slug: "caribbean-alaska",    currency: "USD", isDefault: true,  dailyRates: { tiers: [{ slug: "standard", amount: 17, isDefault: true }, { slug: "suite", amount: 23 }] } },
    { slug: "med-northern-europe", currency: "EUR", isDefault: false, dailyRates: { tiers: [{ slug: "standard", amount: 12, isDefault: true }, { slug: "suite", amount: 16 }] } },
    { slug: "south-america",       currency: "USD", isDefault: false, dailyRates: { tiers: [{ slug: "standard", amount: 19, isDefault: true }, { slug: "suite", amount: 23 }] } }
  ]
};

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

// Region pricing — the P1 fix from the careful-not-clever audit on 2026-05-09.
test("Costa default region (South America USD): 7 nights × 2 adults × $14.50 = $203", () => {
  assert.equal(calcDailyTotal(costa, { cabinTier: "standard", nights: 7, adults: 2, childAges: [] }), 203);
});

test("Costa Med region (EUR): 7 nights × 2 adults × EUR 11 = EUR 154", () => {
  assert.equal(calcDailyTotal(costa, { cabinTier: "standard", nights: 7, adults: 2, childAges: [], region: "med-northern-europe" }), 154);
});

test("MSC region switch: Caribbean Yacht Club ($23) vs Med Yacht Club (EUR 16) on the same query", () => {
  const inputs = { cabinTier: "suite", nights: 7, adults: 2, childAges: [] };
  assert.equal(calcDailyTotal(msc, { ...inputs, region: "caribbean-alaska"   }), 322); // 23 × 7 × 2
  assert.equal(calcDailyTotal(msc, { ...inputs, region: "med-northern-europe" }), 224); // 16 × 7 × 2
  assert.equal(calcDailyTotal(msc, { ...inputs, region: "south-america"       }), 322); // 23 × 7 × 2
});

test("MSC default region (no slug given) uses isDefault region (Caribbean USD $17)", () => {
  assert.equal(calcDailyTotal(msc, { cabinTier: "standard", nights: 7, adults: 2, childAges: [] }), 238);
});

test("pickRegion: returns isDefault when slug is empty/undefined", () => {
  assert.equal(pickRegion(costa).slug, "south-america");
  assert.equal(pickRegion(costa, "").slug, "south-america");
  assert.equal(pickRegion(costa, "med-northern-europe").slug, "med-northern-europe");
  assert.equal(pickRegion(carnival, "anything"), null); // single-region line
});

test("pickCurrency: follows region; falls back to line.currency when no region matches", () => {
  assert.equal(pickCurrency(costa, "med-northern-europe"), "EUR");
  assert.equal(pickCurrency(costa, "south-america"), "USD");
  assert.equal(pickCurrency(costa, ""), "USD"); // default region is USD
  assert.equal(pickCurrency(carnival, ""), "USD"); // no regions → falls to top-level (line.currency missing → "USD")
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
