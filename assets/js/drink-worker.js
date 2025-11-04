/* drink-worker.js — v.9.000.002 (module worker, last-message-wins, safe fallbacks) */

/* ------------------------- Versioned import ------------------------- */
// Derive version query (?v=...) from the worker URL so we import the same math version.
const v = new URLSearchParams(self.location.search).get('v') || '';
const mathURL = `/assets/js/drink-math.js${v ? `?v=${encodeURIComponent(v)}` : ''}`;

/* ------------------------- Safe zero payload ------------------------- */
const SAFE_ZERO = {
  hasRange: false,
  bars: {
    alc:     { min: 0, mean: 0, max: 0 },
    soda:    { min: 0, mean: 0, max: 0 },
    refresh: { min: 0, mean: 0, max: 0 },
    deluxe:  { min: 0, mean: 0, max: 0 }
  },
  winnerKey: 'alc',
  perDay: 0,
  trip: 0,
  groupRows: [],
  included: { soda: 0, refresh: 0, deluxe: 0 },
  overcap: 0,
  deluxeRequired: false
};

/* ------------------------- Minimal input sanitizer ------------------------- */
/* Guard against nonsense before compute() runs. Full clamps still belong in drink-math.js. */
function sanitizePayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const out = structuredClone(payload);

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(+n) ? +n : 0));
  const I = out.inputs = out.inputs || {};
  const E = out.economics = out.economics || {};
  const D = out.dataset = out.dataset || {};

  // Trip
  I.days    = clamp(Math.round(I.days ?? 7), 1, 365);
  I.seaDays = clamp(Math.round(I.seaDays ?? 0), 0, I.days);
  I.seaApply  = !!(I.seaApply ?? true);
  I.seaWeight = clamp(I.seaWeight ?? 20, 0, 40);
  I.adults  = clamp(Math.round(I.adults ?? 1), 1, 20);
  I.minors  = clamp(Math.round(I.minors ?? 0), 0, 20);

  // Drinks: coerce weird values to numbers >= 0 (range handling is in math file)
  I.drinks = I.drinks || {};
  for (const k of ['soda','coffee','teaprem','freshjuice','mocktail','energy','milkshake','bottledwater','beer','wine','cocktail','spirits']) {
    const v = I.drinks[k];
    if (v && typeof v === 'object') {
      const min = Math.max(0, +v.min || 0), max = Math.max(min, +v.max || 0);
      I.drinks[k] = { min, max };
    } else {
      I.drinks[k] = Math.max(0, +v || 0);
    }
  }

  // Economics: keep non-negative and bounded
  E.pkg = E.pkg || {};
  E.pkg.soda    = clamp(E.pkg.soda    ?? 13.99, 0, 200);
  E.pkg.refresh = clamp(E.pkg.refresh ?? 34.00, 0, 300);
  E.pkg.deluxe  = clamp(E.pkg.deluxe  ?? 85.00, 0, 400);
  E.grat        = clamp(E.grat ?? 0.18, 0, 0.50);
  E.deluxeCap   = clamp(E.deluxeCap ?? 14.00, 0, 200);
  E.minorDiscount = clamp(E.minorDiscount ?? 0.5, 0, 1);

  // Dataset presence is fine; detailed validation happens inside compute()
  return out;
}

/* ------------------------- Dynamic import with fallback ------------------------- */
let computeFn = null;

(async function init() {
  try {
    const mod = await import(mathURL);
    computeFn = typeof mod.compute === 'function' ? mod.compute : null;
    self.postMessage({ type: 'ready' });
  } catch (_err) {
    // Secondary fallback: legacy global exposure (unlikely)
    // eslint-disable-next-line no-undef
    if (self.ITW_MATH && typeof self.ITW_MATH.compute === 'function') {
      computeFn = self.ITW_MATH.compute;
    }
    // Always tell the UI we're "ready" so it can switch to inline compute if needed.
    self.postMessage({ type: 'ready' });
  }
})();

/* ------------------------- Last-message-wins ------------------------- */
/* We only post back the result for the latest compute request to avoid stale flashes. */
let lastReqId = 0;

self.onmessage = (e) => {
  const { type, payload } = e.data || {};
  if (type !== 'compute') return;

  const reqId = ++lastReqId;

  try {
    const clean = sanitizePayload(payload);
    // If sanitize fails, respond with safe zeros (still honoring last-message-wins).
    if (!clean) {
      if (reqId === lastReqId) self.postMessage({ type: 'result', payload: SAFE_ZERO });
      return;
    }

    // If computeFn is missing, still respond (UI will likely fall back inline).
    if (typeof computeFn !== 'function') {
      if (reqId === lastReqId) self.postMessage({ type: 'result', payload: SAFE_ZERO });
      return;
    }

    // Compute synchronously (math is fast); respect last-message-wins.
    const res = computeFn(clean.inputs, clean.economics, clean.dataset);
    if (reqId === lastReqId) {
      // Defensive: ensure we always post a well-formed object
      const payloadOut = (res && typeof res === 'object') ? res : SAFE_ZERO;
      self.postMessage({ type: 'result', payload: payloadOut });
    }
  } catch (_err) {
    // Any unexpected error: reply with safe zeros (if still latest)
    if (reqId === lastReqId) self.postMessage({ type: 'result', payload: SAFE_ZERO });
  }
};
