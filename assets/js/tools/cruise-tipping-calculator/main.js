// assets/js/tools/cruise-tipping-calculator/main.js
import { loadAll, getLine, listLines } from "./data.js";
import { createState } from "./state.js";
import { attachPersistence } from "./persist.js";
import { calcGrandTotal } from "./calc.js";
import { renderLineSelect, renderCabinTiers, renderBundledBanner, renderCashExtras, renderResult } from "./render.js";

const $ = (sel) => document.querySelector(sel);

async function init() {
  await loadAll();
  const state = createState({ line: listLines()[0]?.lineId || "royal-caribbean" });
  attachPersistence(state);

  const lineSelect = $("#line-select");
  const bundledBanner = $("#bundled-banner");
  const cashPanel = $("#panel-cash");
  const headline = $("#result-headline");
  const breakdown = $("#result-breakdown");

  renderLineSelect(lineSelect, listLines(), state.get().line);

  // Two-way binding: any input change → state.update.
  document.getElementById("tipping-form").addEventListener("input", (e) => {
    const t = e.target;
    if (!t.name && !t.dataset.extra) return;
    if (t.dataset.extra) {
      const cashExtras = { ...state.get().cashExtras };
      const k = t.dataset.extra;
      cashExtras[k] = { ...(cashExtras[k] || {}), [t.dataset.field]: t.value === "" ? null : Number(t.value) };
      state.update({ cashExtras });
      return;
    }
    // v1 simplification: synthesize childAges so each entered child counts as a charged guest
    // (age 99 is well above any line's exemptUnderAge). Per-age UI lands in a future task.
    if (t.name === "children") {
      const n = Number(t.value) || 0;
      state.update({ children: n, childAges: Array(n).fill(99) });
      return;
    }
    const v = t.type === "checkbox" ? t.checked : (t.type === "number" ? Number(t.value) : t.value);
    state.update({ [t.name]: v });
  });

  // Accordion toggle.
  document.querySelectorAll(".accordion__toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".accordion");
      const open = section.getAttribute("aria-expanded") === "true";
      section.setAttribute("aria-expanded", String(!open));
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  // Result-row click → scroll to the panel that drove it.
  breakdown.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-scroll-target]");
    if (!li) return;
    const panel = document.getElementById(li.dataset.scrollTarget);
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Reset.
  $("#reset").addEventListener("click", () => {
    localStorage.removeItem("ctc_v1");
    location.hash = "";
    location.reload();
  });

  // Print.
  $("#print-plan").addEventListener("click", () => window.print());

  // Compare toggle.
  $("#compare-toggle").addEventListener("click", () => {
    const col = $("#compare-column");
    col.hidden = !col.hidden;
    if (!col.hidden) renderCompareColumn(col, state);
  });

  // Re-render on every state change.
  state.subscribe((v) => {
    const line = getLine(v.line);
    if (!line) return;
    paintInputs(v);
    renderCabinTiers($("#cabin-tier"), line, v.cabinTier);
    renderBundledBanner(bundledBanner, line);
    renderCashExtras(cashPanel, line, v);
    const totals = calcGrandTotal(line, v);
    renderResult(headline, breakdown, line, totals, v);
    if (!$("#compare-column").hidden) renderCompareColumn($("#compare-column"), state);
  });

  // Initial paint.
  state.update({});
}

// Mirror state values back into form inputs so hash/storage restore is visible
// to the user. Programmatic .value writes do not refire input events, so this
// is safe to call from inside the subscriber.
function paintInputs(v) {
  const fields = [
    ["#line-select",        v.line],
    ["#cabin-tier",         v.cabinTier],
    ["#sailing-date",       v.sailingDate || ""],
    ["#nights",             v.nights],
    ["#adults",             v.adults],
    ["#children",           v.children],
    ["#bar-tab",            v.barTab],
    ["#specialty-cost",     v.specialtyCost],
    ["#specialty-meals",    v.specialtyMeals],
    ["#spa-total",          v.spaTotal],
    ["#room-service-count", v.roomServiceCount],
    ["#room-service-avg",   v.roomServiceAvg]
  ];
  for (const [sel, val] of fields) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const next = String(val ?? "");
    if (el.value !== next) el.value = next;
  }
  const prepaid = document.querySelector("#bar-prepaid");
  if (prepaid && prepaid.checked !== !!v.barPrepaid) prepaid.checked = !!v.barPrepaid;
}

function renderCompareColumn(col, state) {
  const v = state.get();
  const others = listLines().filter(l => l.lineId !== v.line);
  col.innerHTML = `
    <h3>Compare with</h3>
    <select id="compare-line">
      ${others.map(l => `<option value="${l.lineId}">${l.displayName}</option>`).join("")}
    </select>
    <div id="compare-output"></div>
  `;
  const output = col.querySelector("#compare-output");
  const select = col.querySelector("#compare-line");
  const paint = () => {
    const compareLine = getLine(select.value);
    if (!compareLine) { output.textContent = ""; return; }
    const totals = calcGrandTotal(compareLine, v);
    output.innerHTML = `<strong>${compareLine.displayName}:</strong> $${totals.total.toFixed(2)} total ($${(totals.total / v.nights).toFixed(2)}/night)`;
  };
  select.addEventListener("change", paint);
  paint();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
