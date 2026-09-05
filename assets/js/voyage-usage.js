/* In the Wake — voyage-pack usage events. Anonymous, cookie-free, aggregate only.
 * Sends: an event name plus a whitelisted handful of properties. Never: handoff-card
 * values, chosen locations, identifiers of any kind. Silent under Do-Not-Track and
 * Global Privacy Control. Queues offline (at sea) and flushes when signal returns.
 * ES5 on purpose: the PWA companions and pack renders are ES5 pages with no build.
 * Soli Deo Gloria. */
(function (w) {
  'use strict';
  var WEBSITE = '9661a449-3ba9-49ea-88e8-4493363578d2';
  // Setting 1.5 (plan §2.1): companion pages point this at the geo-blind relay, e.g.
  // 'https://usage.cruisinginthewake.com/send'. Site pages may keep Umami's own endpoint.
  var ENDPOINT = (typeof w.ITW_USAGE_ENDPOINT === 'string' && w.ITW_USAGE_ENDPOINT) || 'https://cloud.umami.is/api/send';
  var KEY = 'itw:vp-usage-queue';
  var ALLOW = { pack: 1, price: 1, variant: 1, scope: 1, standalone: 1, offline: 1, phase: 1, day: 1, tabs: 1 };
  var MAX = 200;
  var NAME_RE = /^vp_[a-z_]{1,46}$/;

  function optedOut() {
    try {
      var n = w.navigator || {};
      return n.doNotTrack === '1' || n.globalPrivacyControl === true ||
        (w.location && w.location.protocol === 'file:');
    } catch (e) { return true; }
  }
  function clean(data) {
    var out = {}, k;
    if (!data || typeof data !== 'object') return out;
    for (k in data) {
      if (Object.prototype.hasOwnProperty.call(data, k) && ALLOW[k] === 1 && data[k] != null) {
        out[k] = String(data[k]).slice(0, 64);
      }
    }
    return out;
  }
  function load() { try { return JSON.parse(w.localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(q) { try { w.localStorage.setItem(KEY, JSON.stringify(q.slice(-MAX))); } catch (e) {} }
  function online() { try { return w.navigator.onLine !== false; } catch (e) { return true; } }

  function payload(ev) {
    var loc = w.location || {}, doc = w.document || {}, nav = w.navigator || {}, scr = w.screen;
    return { type: 'event', payload: {
      website: WEBSITE, hostname: loc.hostname || '', url: loc.pathname || '/',
      title: doc.title || '', language: nav.language || '',
      screen: scr ? (scr.width + 'x' + scr.height) : '',
      name: ev.name, data: ev.data
    } };
  }
  function requeue(ev) { var r = load(); r.push(ev); save(r); }
  function send(ev) {
    if (w.umami && typeof w.umami.track === 'function') {
      try { w.umami.track(ev.name, ev.data); } catch (e) {}
      return;
    }
    try {
      w.fetch(ENDPOINT, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(ev)) })
        .then(function (r) { if (!r || (!r.ok && r.status !== 400)) requeue(ev); }, function () { requeue(ev); });
    } catch (e) { requeue(ev); }
  }
  function flush() {
    if (optedOut() || !online()) return;
    var q = load(); if (!q.length) return;
    save([]);
    q.forEach(send);
  }
  function track(name, data) {
    if (optedOut() || typeof name !== 'string' || !NAME_RE.test(name)) return;
    var q = load(); q.push({ name: name, data: clean(data), t: Date.now() }); save(q);
    flush();
  }
  if (typeof w.addEventListener === 'function') {
    w.addEventListener('online', flush);
    w.addEventListener('visibilitychange', function () {
      if (w.document && w.document.visibilityState === 'hidden') flush();
    });
    if (w.document && w.document.readyState === 'complete') flush(); else w.addEventListener('load', flush);
  }
  w.ITW_USAGE = { track: track, flush: flush, _clean: clean, _queue: load };
})(window);
