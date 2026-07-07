// assets/js/tools/cruise-tipping-calculator/main.js
import { loadAll, getLine, listLines } from "./data.js";
import { createState } from "./state.js";
import { attachPersistence } from "./persist.js";
import { calcGrandTotal } from "./calc.js";
import { renderLineSelect, renderRegions, renderCabinTiers, renderBundledBanner, renderCashExtras, renderResult, renderChildAges } from "./render.js";

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
    if (!t.name && !t.dataset.extra && t.dataset.childIndex === undefined) return;
    // Line change: when the user switches lines, snap the region to the new
    // line's default region (or clear it if the new line has none) and
    // re-validate the cabin tier slug. This prevents stale region/tier values
    // from a multi-region line carrying over to a single-region line.
    if (t.name === "line") {
      const nextLine = getLine(t.value);
      if (!nextLine) { state.update({ line: t.value }); return; }
      const defaultRegion = (nextLine.regions && (nextLine.regions.find(r => r.isDefault) || nextLine.regions[0])) || null;
      const defaultRegionSlug = defaultRegion ? defaultRegion.slug : "";
      const tiers = defaultRegion ? defaultRegion.dailyRates.tiers : (nextLine.dailyRates?.tiers || []);
      const cur = state.get();
      const tierSlug = tiers.some(tt => tt.slug === cur.cabinTier)
        ? cur.cabinTier
        : (tiers.find(tt => tt.isDefault) || tiers[0] || { slug: "standard" }).slug;
      state.update({ line: t.value, region: defaultRegionSlug, cabinTier: tierSlug });
      return;
    }
    // Region change: snap the cabin tier to the new region's default if the
    // current slug isn't one of its tiers.
    if (t.name === "region") {
      const cur = state.get();
      const curLine = getLine(cur.line);
      const region = curLine?.regions?.find(r => r.slug === t.value);
      const tiers = region ? region.dailyRates.tiers : (curLine?.dailyRates?.tiers || []);
      const tierSlug = tiers.some(tt => tt.slug === cur.cabinTier)
        ? cur.cabinTier
        : (tiers.find(tt => tt.isDefault) || tiers[0] || { slug: "standard" }).slug;
      state.update({ region: t.value, cabinTier: tierSlug });
      return;
    }
    if (t.dataset.extra) {
      const cashExtras = { ...state.get().cashExtras };
      const k = t.dataset.extra;
      cashExtras[k] = { ...(cashExtras[k] || {}), [t.dataset.field]: t.value === "" ? null : Number(t.value) };
      state.update({ cashExtras });
      return;
    }
    // Per-child age input (data-child-index="N"). Updates a single slot of childAges
    // without touching the others, so editing child 2 doesn't reset child 1.
    if (t.dataset.childIndex !== undefined) {
      const i = Number(t.dataset.childIndex);
      const ages = (state.get().childAges || []).slice();
      ages[i] = Number(t.value);
      state.update({ childAges: ages });
      return;
    }
    // Children-count change: preserve existing per-slot ages, default new slots to 99.
    // 99 is the safe default — a user who doesn't engage with the age field still sees
    // the conservative (full-fare) total they expect, while a user who DOES enter an
    // age (e.g. 1 for a Carnival toddler) gets the line's exemption applied correctly.
    if (t.name === "children") {
      const n = Number(t.value) || 0;
      const cur = state.get().childAges || [];
      const ages = Array.from({ length: n }, (_, i) => cur[i] ?? 99);
      state.update({ children: n, childAges: ages });
      return;
    }
    let v = t.type === "checkbox" ? t.checked : (t.type === "number" ? Number(t.value) : t.value);
    if (t.name === "nights" && (!Number.isFinite(v) || v < 1)) v = 1;
    state.update({ [t.name]: v });
  });

  // Accordion toggle.
  // Section uses data-expanded (CSS hook); button uses aria-expanded (a11y state).
  // Both are kept in sync so screen readers see the correct expanded/collapsed
  // state whenever the panel's visibility changes.
  document.querySelectorAll(".accordion__toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".accordion");
      const open = section.getAttribute("data-expanded") === "true";
      section.setAttribute("data-expanded", String(!open));
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

  // Keyboard equivalent for the result-row scroll affordance. Each li carries
  // role="button" and tabindex=0; Enter and Space must activate it (WCAG 2.1.1).
  breakdown.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const li = e.target.closest("li[data-scroll-target]");
    if (!li) return;
    e.preventDefault();
    document.getElementById(li.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  $("#compare-toggle").addEventListener("click", (e) => {
    const col = $("#compare-column");
    col.hidden = !col.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!col.hidden));
    if (!col.hidden) renderCompareColumn(col, state);
  });

  // Re-render on every state change.
  state.subscribe((v) => {
    const line = getLine(v.line);
    if (!line) return;
    paintInputs(v);
    // Region picker: visible only on multi-region lines. Cabin tiers depend on
    // the active region, so render regions first, then cabin tiers.
    const regionSelect = $("#region-select");
    const regionLabel = $("#region-label");
    renderRegions(regionSelect, line, v.region);
    if (regionLabel) regionLabel.hidden = regionSelect.hidden;
    renderCabinTiers($("#cabin-tier"), line, v.cabinTier, v.region);
    renderChildAges($("#children-ages"), v, line);
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
    ["#region-select",      v.region || ""],
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
    <h3 id="compare-heading">Compare with</h3>
    <label for="compare-line" class="sr-only">Choose another cruise line to compare</label>
    <select id="compare-line" aria-labelledby="compare-heading">
      ${others.map(l => `<option value="${l.lineId}">${l.displayName}</option>`).join("")}
    </select>
    <div id="compare-output" aria-live="polite"></div>
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
