// assets/js/tools/cruise-tipping-calculator/checked.js — "last checked" for a line's tipping details (Lexicon Track C7d)
//
// Soli Deo Gloria. "Whatsoever ye do, do it heartily, as to the Lord" (Colossians 3:23).
//
// WHAT IT DOES. Tells the reader when the selected line's tipping details were last checked, and says plainly when
// that check is old enough that they may have changed. Ken's ruling, 2026-10-31: gratuities are knowledge that can go
// stale and must be marked as such.
//
// WHERE IT READS. /assets/data/lexicon/tipping-checked.json, generated from the line statements by
// admin/lexicon/package-statements.mjs. Per line it holds the date the tipping file was last verified and stale_after,
// the last instant those figures read fresh (from the Lexicon contract's freshness()). This module only compares the
// current date with stale_after.
//
// WHEN IT SAYS NOTHING. No line is shown when the record could not be loaded, has no entry for the selected line, or
// carries a date it cannot read. It never invents a date.
//
// Safety: same-origin fetch only, text set with textContent, no HTML from data, no eval, no inline handlers.

const DATA_URL = "/assets/data/lexicon/tipping-checked.json";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];

const own = (obj, key) => obj !== null && typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, key);

/** "2026-05-08" -> "May 8, 2026"; anything else -> null. Fixed English, no locale or time zone. */
export function longDate(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof ymd === "string" ? ymd : "");
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${month} ${Number(m[3])}, ${m[1]}` : null;
}

/** The line to show for one cruise line's entry, or null to show nothing. Returns { state: 'fresh' | 'stale', text }. */
export function note(entry, nowMs) {
  if (!entry || typeof entry !== "object") return null;
  if (typeof nowMs !== "number" || !Number.isFinite(nowMs)) return null;
  const checked = longDate(entry.checked);
  const staleAfter = Date.parse(entry.stale_after);
  if (!checked || !Number.isFinite(staleAfter)) return null;
  if (nowMs > staleAfter) {
    return { state: "stale", text: `Tipping details last checked ${checked}, so they may be out of date. Confirm with the cruise line before you sail.` };
  }
  return { state: "fresh", text: `Tipping details last checked ${checked}.` };
}

/** Accept only the shape the generator writes; anything else is treated as not loaded. */
export function accept(data) {
  if (!data || typeof data !== "object" || data.format !== "itw-tipping-checked/1") return null;
  if (!data.lines || typeof data.lines !== "object" || Array.isArray(data.lines)) return null;
  return data;
}

let loaded = null;
let loading = null;

/** Fetch the record once; resolves to it, or to null if it could not be read. */
export function load(fetchImpl = globalThis.fetch) {
  if (loading) return loading;
  if (typeof fetchImpl !== "function") return Promise.resolve(null);
  loading = Promise.resolve()
    .then(() => fetchImpl(DATA_URL, { cache: "default", credentials: "omit" }))
    .then((r) => (r && r.ok ? r.json() : null))
    .then((d) => { loaded = accept(d); return loaded; })
    .catch(() => { loaded = null; return null; });
  return loading;
}

/** Fill (or empty and hide) the element for the selected line. */
export function render(el, lineId, nowMs = Date.now()) {
  if (!el) return;
  const entry = loaded && typeof lineId === "string" && own(loaded.lines, lineId) ? loaded.lines[lineId] : null;
  const n = note(entry, nowMs);
  if (!n) {
    el.textContent = "";
    el.hidden = true;
    el.removeAttribute("data-state");
    return;
  }
  el.textContent = n.text;
  el.setAttribute("data-state", n.state);
  el.hidden = false;
}

/** For tests: forget what was loaded. */
export function reset() { loaded = null; loading = null; }
