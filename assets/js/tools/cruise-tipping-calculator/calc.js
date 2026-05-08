// assets/js/tools/cruise-tipping-calculator/calc.js
// Pure functions only. No DOM. No fetch. Inputs in, dollars out.

const round2 = (n) => Math.round(n * 100) / 100;

// Pick the tier set that applies for a sailing date. If the line has an
// upcomingChange and the sailing date is on/after its effectiveDate, use the
// upcoming rates merged with the current tier metadata. Otherwise, current.
export function pickTiers(line, sailingDate) {
  if (!line.dailyRates) return null;
  const change = line.dailyRates.upcomingChange;
  if (change && sailingDate && sailingDate >= change.effectiveDate) {
    // Merge upcoming amounts onto the current tier shape (so we keep slug, label, isDefault).
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

export function calcDailyTotal(line, inputs) {
  if (line.bundledInFare || !line.dailyRates) return 0;
  const tiers = pickTiers(line, inputs.sailingDate);
  const rate = tierAmount(tiers, inputs.cabinTier);
  const exemptUnder = line.childPolicy?.exemptUnderAge ?? 0;
  const chargedChildren = (inputs.childAges || []).filter(age => age >= exemptUnder).length;
  const charged = inputs.adults + chargedChildren;
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
