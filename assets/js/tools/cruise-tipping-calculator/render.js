// assets/js/tools/cruise-tipping-calculator/render.js
import { pickRegion } from "./calc.js";

// Currency symbol map. Kept tiny on purpose — every line in our 15 sails in one
// of these currencies. ISO codes that aren't here fall through to the code as
// the prefix (e.g. "AUD 14.50") so unknown currencies display honestly.
const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$" };
function symbol(code) { return CURRENCY_SYMBOLS[code] || (code + " "); }

// Format a numeric amount with the right currency symbol. Default USD so calls
// from cash-extras code (always USD) don't need to thread currency through.
const fmt = (n, currency = "USD") => symbol(currency) + n.toFixed(2).replace(/\.00$/, "");

export function renderLineSelect(el, lines, selected) {
  el.innerHTML = "";
  for (const line of lines) {
    const opt = document.createElement("option");
    opt.value = line.lineId;
    opt.textContent = line.displayName;
    if (line.lineId === selected) opt.selected = true;
    el.appendChild(opt);
  }
}

export function renderRegions(el, line, selectedSlug) {
  el.innerHTML = "";
  if (!line.regions || line.regions.length === 0) {
    el.hidden = true;
    el.disabled = true;
    return;
  }
  el.hidden = false;
  el.disabled = false;
  const fallback = (line.regions.find(r => r.isDefault) || line.regions[0]).slug;
  for (const region of line.regions) {
    const opt = document.createElement("option");
    opt.value = region.slug;
    opt.textContent = region.label;
    if (region.slug === selectedSlug) opt.selected = true;
    el.appendChild(opt);
  }
  if (!line.regions.some(r => r.slug === selectedSlug)) {
    el.value = fallback;
  }
}

export function renderCabinTiers(el, line, selectedSlug, regionSlug) {
  el.innerHTML = "";
  if (line.bundledInFare) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "—";
    el.appendChild(opt);
    el.disabled = true;
    return;
  }
  // Prefer the active region's tiers when present; otherwise fall through to the
  // line's top-level dailyRates. Mirrors the calc.pickTiers logic.
  const region = pickRegion(line, regionSlug);
  const tiers = region ? region.dailyRates.tiers : line.dailyRates?.tiers;
  if (!tiers || tiers.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "—";
    el.appendChild(opt);
    el.disabled = true;
    return;
  }
  el.disabled = false;
  const currency = region ? region.currency : (line.currency || "USD");
  const fallback = (tiers.find(t => t.isDefault) || tiers[0]).slug;
  for (const tier of tiers) {
    const opt = document.createElement("option");
    opt.value = tier.slug;
    opt.textContent = `${tier.label} (${fmt(tier.amount, currency)}/day)`;
    if (tier.slug === selectedSlug) opt.selected = true;
    el.appendChild(opt);
  }
  if (!tiers.some(t => t.slug === selectedSlug)) {
    el.value = fallback;
  }
}

export function renderChildAges(el, state, line) {
  const n = state.children || 0;
  if (n === 0) {
    el.hidden = true;
    el.innerHTML = "";
    return;
  }
  el.hidden = false;
  // Surface the line's child-rate rule so families know what triggers the discount.
  // Tiered model (Costa) wins; binary exemption (Carnival, Norwegian) is the fallback.
  const cp = line?.childPolicy || {};
  let note;
  if (Array.isArray(cp.ageMultipliers) && cp.ageMultipliers.length > 0) {
    const tiers = cp.ageMultipliers
      .map(t => t.label || `Ages ${t.minAge}–${t.maxAge}: ${t.multiplier === 0 ? "free" : t.multiplier === 1 ? "full rate" : `${t.multiplier}× rate`}`)
      .join("; ");
    note = `${line.displayName} uses tiered child rates — ${tiers}. Enter each child's age below.`;
  } else if (typeof cp.exemptUnderAge === "number") {
    note = `${line.displayName} exempts children under ${cp.exemptUnderAge}. Enter each child's age — leave at 99 if you want them counted as full-fare.`;
  } else {
    note = `${line?.displayName || "This line"} charges all guests regardless of age. Enter each child's age for record-keeping.`;
  }
  const ages = state.childAges || [];
  let html = `<p class="children-ages__note"><small>${note}</small></p>`;
  for (let i = 0; i < n; i++) {
    const age = ages[i] ?? 99;
    html += `<label>Age of child ${i + 1}
      <input type="number" min="0" max="21" step="1" value="${age}" data-child-index="${i}" inputmode="numeric">
    </label>`;
  }
  el.innerHTML = html;
}

export function renderBundledBanner(el, line) {
  if (line.bundledInFare) {
    el.hidden = false;
    el.textContent = line.bundledNote || "Gratuities are included in your fare on this line. Crew tipping is at your discretion.";
  } else {
    el.hidden = true;
    el.textContent = "";
  }
}

export function renderCashExtras(el, line, state) {
  const extras = line.recommendedCashExtras || {};
  el.innerHTML = "";
  for (const [key, def] of Object.entries(extras)) {
    if (def.default === 0 && !def.perBag && !def.perPerson && !def.perVisit && !def.perDay) continue;
    const wrap = document.createElement("label");
    const unit = def.perDay ? "/day" : def.perBag ? "/bag" : def.perPerson ? "/person" : def.perVisit ? "/visit" : "";
    const countField = (def.perBag || def.perPerson || def.perVisit)
      ? `<input type="number" min="0" value="0" data-extra="${key}" data-field="count"> count`
      : "";
    wrap.innerHTML = `${prettify(key)} (${fmt(def.default)}${unit})
      <input type="number" min="0" step="1" placeholder="${def.default}" data-extra="${key}" data-field="override">
      ${countField}
      <small>${def.note || ""}</small>`;
    el.appendChild(wrap);
  }
}

export function renderResult(headlineEl, breakdownEl, line, totals, state) {
  const partyText = `${state.adults} adult${state.adults === 1 ? "" : "s"}` +
                    (state.children ? ` + ${state.children} child${state.children === 1 ? "" : "ren"}` : "");
  const region = pickRegion(line, state.region);
  const cruiseCurrency = region ? region.currency : (line.currency || "USD");
  const cashCurrency = "USD"; // Cash extras (porter/butler/etc.) are always USD per the data files.
  const cruiseSubtotal = totals.daily + totals.onboard.total;
  const perNight = cruiseSubtotal / state.nights;

  // When the cruise charges and the cash extras are in different currencies
  // (Costa Med, MSC Med — both EUR for daily/onboard, USD for cash) we refuse
  // to fake an exchange rate. The headline shows two amounts side-by-side and
  // labels them honestly.
  if (cruiseCurrency !== cashCurrency && totals.cash > 0) {
    headlineEl.textContent =
      `${fmt(cruiseSubtotal, cruiseCurrency)} in cruise charges + ${fmt(totals.cash, cashCurrency)} in optional cash tips · ` +
      `${fmt(perNight, cruiseCurrency)}/night for ${partyText} on a ${state.nights}-night ${line.displayName} ${state.cabinTier === "suite" ? "suite" : "cabin"}.`;
  } else if (cruiseCurrency !== cashCurrency) {
    headlineEl.textContent =
      `${fmt(cruiseSubtotal, cruiseCurrency)} total · ${fmt(perNight, cruiseCurrency)}/night for ${partyText} on a ${state.nights}-night ${line.displayName} ${state.cabinTier === "suite" ? "suite" : "cabin"}.`;
  } else {
    headlineEl.textContent =
      `${fmt(totals.total, cruiseCurrency)} total · ${fmt(totals.total / state.nights, cruiseCurrency)}/night for ${partyText} on a ${state.nights}-night ${line.displayName} ${state.cabinTier === "suite" ? "suite" : "cabin"}.`;
  }

  breakdownEl.innerHTML = "";
  const rows = [
    { label: "Daily auto-charge",           amount: totals.daily,             currency: cruiseCurrency, target: "panel-sailing" },
    { label: "Bar auto-grats",              amount: totals.onboard.bar,       currency: cruiseCurrency, target: "panel-onboard" },
    { label: "Specialty dining auto-grats", amount: totals.onboard.specialty, currency: cruiseCurrency, target: "panel-onboard" },
    { label: "Spa auto-grats",              amount: totals.onboard.spa,       currency: cruiseCurrency, target: "panel-onboard" },
    { label: "Room service auto-grats",     amount: totals.onboard.roomService, currency: cruiseCurrency, target: "panel-onboard" },
    { label: "Cash extras",                 amount: totals.cash,              currency: cashCurrency,   target: "panel-cash" }
  ];
  for (const row of rows) {
    if (row.amount === 0) continue;
    const li = document.createElement("li");
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", `${row.label}: ${fmt(row.amount, row.currency)} — jump to source inputs`);
    li.dataset.scrollTarget = row.target;
    li.innerHTML = `<span>${row.label}</span><span>${fmt(row.amount, row.currency)}</span>`;
    breakdownEl.appendChild(li);
  }
}

function prettify(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}
