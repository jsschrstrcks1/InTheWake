// assets/js/tools/cruise-tipping-calculator/render.js
const fmt = (n) => "$" + n.toFixed(2).replace(/\.00$/, "");

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

export function renderCabinTiers(el, line, selectedSlug) {
  el.innerHTML = "";
  if (line.bundledInFare || !line.dailyRates) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "—";
    el.appendChild(opt);
    el.disabled = true;
    return;
  }
  el.disabled = false;
  const tiers = line.dailyRates.tiers;
  const fallback = (tiers.find(t => t.isDefault) || tiers[0]).slug;
  for (const tier of tiers) {
    const opt = document.createElement("option");
    opt.value = tier.slug;
    opt.textContent = `${tier.label} ($${tier.amount.toFixed(2)}/day)`;
    if (tier.slug === selectedSlug) opt.selected = true;
    el.appendChild(opt);
  }
  // If selectedSlug isn't valid for this line, snap the select to the line's default.
  if (!tiers.some(t => t.slug === selectedSlug)) {
    el.value = fallback;
  }
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
  const perNight = totals.total / state.nights;
  headlineEl.textContent = `${fmt(totals.total)} total · ${fmt(perNight)} per night for ${partyText} on a ${state.nights}-night ${line.displayName} ${state.cabinTier === "suite" ? "suite" : "cabin"}.`;

  breakdownEl.innerHTML = "";
  const rows = [
    { label: "Daily auto-charge", amount: totals.daily, target: "panel-sailing" },
    { label: "Bar auto-grats", amount: totals.onboard.bar, target: "panel-onboard" },
    { label: "Specialty dining auto-grats", amount: totals.onboard.specialty, target: "panel-onboard" },
    { label: "Spa auto-grats", amount: totals.onboard.spa, target: "panel-onboard" },
    { label: "Room service auto-grats", amount: totals.onboard.roomService, target: "panel-onboard" },
    { label: "Cash extras", amount: totals.cash, target: "panel-cash" }
  ];
  for (const row of rows) {
    if (row.amount === 0) continue;
    const li = document.createElement("li");
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", `${row.label}: ${fmt(row.amount)} — jump to source inputs`);
    li.dataset.scrollTarget = row.target;
    li.innerHTML = `<span>${row.label}</span><span>${fmt(row.amount)}</span>`;
    breakdownEl.appendChild(li);
  }
}

function prettify(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}
