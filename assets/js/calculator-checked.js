/* calculator-checked.js — "last checked" under each drink-package price (Lexicon Track C7c)
 *
 * Soli Deo Gloria. "Whatsoever ye do, do it heartily, as to the Lord" (Colossians 3:23).
 *
 * WHAT IT DOES. Tells the reader when the price on each package card was last checked, and says
 * plainly when that check is old enough that the price may have changed. Ken's ruling, 2026-10-31:
 * "Include gratuity but that's a piece of knowledge that can go stale it should be marked as such."
 *
 * WHERE IT READS. /assets/data/lexicon/calculator-checked.json, generated from the package and line
 * statements by admin/lexicon/package-statements.mjs. That file says, per cruise line and package,
 * which figure the record holds, when it was checked, and the last instant it reads fresh
 * (stale_after, from the Lexicon contract's freshness()). Nothing here computes freshness rules;
 * it only compares the current date with stale_after.
 *
 * WHEN IT SAYS NOTHING. It never vouches for a figure the record does not hold. No line is shown when:
 * the file could not be loaded; the line or package has no entry; the record is disputed; or the
 * price on the card is not the price in the record (for example, after the reader edits it).
 *
 * Safety: same-origin fetch only, text set with textContent, no HTML injection, no eval, no inline
 * handlers. Not financial advice; always confirm prices in your cruise planner.
 */
(function () {
  'use strict';

  var DATA_URL = '/assets/data/lexicon/calculator-checked.json';
  var VERSION = '1.000.000';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  // The calculator's card keys, and the package tier each one shows from calculator-config.json.
  var CARDS = { soda: 'soda', refresh: 'refreshment', deluxe: 'deluxe' };

  var own = function (obj, key) {
    return obj !== null && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, key);
  };

  /** "2026-04-14" -> "April 14, 2026"; anything else -> null. Fixed English, no locale or time zone. */
  function longDate(ymd) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof ymd === 'string' ? ymd : '');
    if (!m) return null;
    var month = MONTHS[Number(m[2]) - 1];
    return month ? month + ' ' + Number(m[3]) + ', ' + m[1] : null;
  }

  function pct(rate) {
    return Math.round(rate * 1000) / 10 + '%';
  }

  /**
   * The line to show under one card, or null to show nothing.
   *   entry  the read model's entry for this line and package
   *   shown  the price the card displays right now
   *   nowMs  the current time in milliseconds
   * Returns { state: 'fresh' | 'stale' | 'rests_on_stale', text }.
   */
  function note(entry, shown, nowMs) {
    if (!entry || typeof entry !== 'object' || entry.disputed !== false) return null;
    if (typeof shown !== 'number' || !isFinite(shown) || typeof entry.shown !== 'number') return null;
    if (Math.abs(shown - entry.shown) >= 0.005) return null;
    if (typeof nowMs !== 'number' || !isFinite(nowMs)) return null;
    var checked = longDate(entry.checked);
    var staleAfter = Date.parse(entry.stale_after);
    if (!checked || !isFinite(staleAfter)) return null;

    if (nowMs > staleAfter) {
      return {
        state: 'stale',
        text: 'Price last checked ' + checked + ', so it may be out of date. Confirm it in your cruise planner before you buy.'
      };
    }
    if (typeof entry.rate_stale_after === 'string' && typeof entry.gratuity_rate === 'number') {
      var rateChecked = longDate(entry.rate_checked);
      var rateStaleAfter = Date.parse(entry.rate_stale_after);
      if (rateChecked && isFinite(rateStaleAfter) && nowMs > rateStaleAfter) {
        return {
          state: 'rests_on_stale',
          text: 'Price last checked ' + checked + '. The ' + pct(entry.gratuity_rate) + ' gratuity added to it was last checked ' +
            rateChecked + ', so it may have changed.'
        };
      }
    }
    return { state: 'fresh', text: 'Price last checked ' + checked + '.' };
  }

  /** Accept only the shape the generator writes; anything else is treated as not loaded. */
  function accept(data) {
    if (!data || typeof data !== 'object' || data.format !== 'itw-calculator-checked/1') return null;
    if (!data.lines || typeof data.lines !== 'object' || Array.isArray(data.lines)) return null;
    return data;
  }

  var loaded = null;
  var loading = null;

  function load() {
    if (loading) return loading;
    if (typeof fetch !== 'function') return Promise.resolve(null);
    loading = fetch(DATA_URL + '?v=' + VERSION, { cache: 'default', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { loaded = accept(d); return loaded; })
      .catch(function () { loaded = null; return null; });
    return loading;
  }

  /** Fill (or empty and hide) each card's [data-checked] line from the loaded record. */
  function render() {
    if (typeof document === 'undefined') return;
    var lineId = (typeof window !== 'undefined' && window.ITW_LINE_CONFIG && window.ITW_LINE_CONFIG.id) || null;
    var store = typeof window !== 'undefined' && window.ITW && window.ITW.store;
    var economics = store && typeof store.get === 'function' ? store.get('economics') : null;
    var pkg = economics && economics.pkg;
    var line = loaded && lineId && own(loaded.lines, lineId) ? loaded.lines[lineId] : null;
    var now = Date.now();
    Object.keys(CARDS).forEach(function (card) {
      var el = document.querySelector('[data-checked="' + card + '"]');
      if (!el) return;
      var tier = CARDS[card];
      var entry = line && own(line, tier) ? line[tier] : null;
      var n = note(entry, pkg ? pkg[card] : undefined, now);
      if (!n) {
        el.textContent = '';
        el.hidden = true;
        el.removeAttribute('data-state');
        return;
      }
      el.textContent = n.text;
      el.setAttribute('data-state', n.state);
      el.hidden = false;
    });
  }

  var api = { note: note, longDate: longDate, accept: accept, load: load, render: render, DATA_URL: DATA_URL };
  if (typeof window !== 'undefined') {
    window.ITW_CHECKED = api;
    window.addEventListener('itw:line-changed', render);
    load().then(render);
  }
})();
