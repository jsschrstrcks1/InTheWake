// assets/js/tools/cruise-tipping-calculator/calc.js
// Pure functions only. No DOM. No fetch. Inputs in, dollars out.

const round2 = (n) => Math.round(n * 100) / 100;

// Resolve the active region object for a line + region slug. Returns null when
// the line has no `regions` array or when no slug matches — callers fall back
// to the line's top-level dailyRates / currency in that case.
export function pickRegion(line, regionSlug) {
  if (!line.regions || line.regions.length === 0) return null;
  if (!regionSlug) {
    // No explicit selection — use the region marked isDefault, or the first.
    return line.regions.find(r => r.isDefault) || line.regions[0];
  }
  return line.regions.find(r => r.slug === regionSlug) || null;
}

// Resolve the currency code for the active region (or the line's top-level).
export function pickCurrency(line, regionSlug) {
  const region = pickRegion(line, regionSlug);
  if (region) return region.currency;
  return line.currency || "USD";
}

// Pick the tier set that applies for a sailing date.
//
// Resolution order:
//   1. If the line has a `regions` array AND a region matches `regionSlug`
//      (or its isDefault region exists), use that region's tiers.
//   2. Otherwise fall through to the line's top-level dailyRates.
//   3. If an upcomingChange is present on the chosen tier set and the sailing
//      date is on or after its effectiveDate, merge the upcoming amounts.
//
// upcomingChange is currently only modeled at the line top-level (HAL is the
// only line that uses it). Region-scoped upcoming changes (e.g. MSC's
// 2026-04-10 / 2026-05-11 staggered hikes) are encoded by setting each
// region's effectiveDate and treating the rate as already-effective at the
// verification date — no separate upcoming branch needed.
export function pickTiers(line, sailingDate, regionSlug) {
  const region = pickRegion(line, regionSlug);
  if (region) return region.dailyRates.tiers;
  if (!line.dailyRates) return null;
  const change = line.dailyRates.upcomingChange;
  if (change && sailingDate && sailingDate >= change.effectiveDate) {
    const updated = line.dailyRates.tiers.map(t => {
      const u = change.tiers.find(x => x.slug === t.slug);
      return u ? { ...t, amount: u.amount } : t;
    });
    return updated;
  }
  return line.dailyRates.tiers;
}

// Pick the auto-gratuity percent for a given category, honoring upcomingChange.
function pickPercent(line, category, sailingDate) {
  if (!line.autoGratuities || !line.autoGratuities[category]) return 0;
  const change = line.dailyRates?.upcomingChange;
  if (change && sailingDate && sailingDate >= change.effectiveDate && change.autoGratuitiesPercent != null) {
    return change.autoGratuitiesPercent;
  }
  return line.autoGratuities[category].percent || 0;
}

function tierAmount(tiers, slug) {
  if (!tiers || tiers.length === 0) return 0;
  const match = tiers.find(t => t.slug === slug);
  if (match) return match.amount;
  const def = tiers.find(t => t.isDefault) || tiers[0];
  return def.amount;
}

// Sum the per-child rate weight across all entered child ages.
//
// Resolution order:
//   1. childPolicy.ageMultipliers (tiered model — Costa under-4 free, 4-14 half,
//      15+ full). Each child's age picks one tier; missing tier → 1.0 (safe overcharge).
//   2. childPolicy.exemptUnderAge (binary model — Carnival under-2 free, all others full).
//   3. Neither set → every child counts as full-rate (1.0 each).
//
// Returns a non-integer weight for tiered lines (e.g., 1.5 for one half-rate
// child + one full-rate child). The daily-total calc multiplies by this directly,
// which produces fractional dollar/euro amounts that are still meaningful at the
// cent level (round2 handles the precision).
export function chargedChildrenWeight(line, childAges) {
  const cp = line.childPolicy || {};
  const ages = childAges || [];
  if (Array.isArray(cp.ageMultipliers) && cp.ageMultipliers.length > 0) {
    return ages.reduce((sum, age) => {
      const tier = cp.ageMultipliers.find(t => age >= t.minAge && age <= t.maxAge);
      return sum + (tier ? tier.multiplier : 1);
    }, 0);
  }
  const exemptUnder = cp.exemptUnderAge ?? 0;
  return ages.filter(age => age >= exemptUnder).length;
}

export function calcDailyTotal(line, inputs) {
  if (line.bundledInFare) return 0;
  const tiers = pickTiers(line, inputs.sailingDate, inputs.region);
  if (!tiers) return 0;
  const rate = tierAmount(tiers, inputs.cabinTier);
  const charged = inputs.adults + chargedChildrenWeight(line, inputs.childAges);
  return round2(rate * inputs.nights * charged);
}

export function calcOnboardAutoGrats(line, inputs) {
  if (line.bundledInFare || !line.autoGratuities) {
    return { total: 0, bar: 0, specialty: 0, spa: 0, roomService: 0 };
  }
  const barPct       = pickPercent(line, "bar", inputs.sailingDate);
  const specialtyPct = pickPercent(line, "specialtyDining", inputs.sailingDate);
  const spaPct       = pickPercent(line, "spa", inputs.sailingDate);
  const rsPct        = pickPercent(line, "roomService", inputs.sailingDate);
  const bar       = inputs.barPrepaid ? 0 : (inputs.barTab || 0) * (barPct / 100);
  const specialty = (inputs.specialtyCost || 0) * (inputs.specialtyMeals || 0) * (specialtyPct / 100);
  const spa       = (inputs.spaTotal || 0) * (spaPct / 100);
  const roomService = (inputs.roomServiceCount || 0) * (inputs.roomServiceAvg || 0) * (rsPct / 100);
  const total = bar + specialty + spa + roomService;
  return { total: round2(total), bar: round2(bar), specialty: round2(specialty), spa: round2(spa), roomService: round2(roomService) };
}

export function calcCashExtras(line, inputs) {
  const extras = line.recommendedCashExtras || {};
  const userVals = inputs.cashExtras || {};
  let total = 0;
  for (const [key, def] of Object.entries(extras)) {
    const userVal = userVals[key] || {};
    const amount = userVal.override != null ? userVal.override : def.default;
    if (def.perDay)    total += amount * (inputs.nights || 0);
    else if (def.perBag)    total += amount * (userVal.count || 0);
    else if (def.perPerson) total += amount * (userVal.count || 0);
    else if (def.perVisit)  total += amount * (userVal.count || 0);
    else                    total += amount; // flat one-time
  }
  return round2(total);
}

export function calcGrandTotal(line, inputs) {
  const daily = calcDailyTotal(line, inputs);
  const onboard = calcOnboardAutoGrats(line, inputs);
  const cash = calcCashExtras(line, inputs);
  return { total: round2(daily + onboard.total + cash), daily, onboard, cash };
}
