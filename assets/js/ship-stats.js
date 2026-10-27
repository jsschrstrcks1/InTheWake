/* ship-stats.js v1.0.0
 * Renders a ship page's stats card (#ship-stats) from the page's own #ship-stats-fallback JSON.
 *
 * Why it exists (Tekton itw-stats-card-wiped-on-8-ship-pages, measured 2026-10-26): 152 of 278 ship
 * pages showed an empty stats card, because nothing on them ever filled #ship-stats. On 4 more
 * (Quantum, Radiance, Grandeur, Carnival Jubilee) an inline loader drew the card from the fallback
 * and then replaced it with a fetched logbook persona file that carries no stats, leaving the card
 * blank or holding "Class" alone. No fetched file ever added a stat the fallback lacked, so the
 * fallback is the one store (the ship page validator already calls it the single source of truth)
 * and this script reads nothing else.
 *
 * Rules:
 * - A mount that already holds hand-written content is left alone. Only whitespace, <noscript>
 *   and <script> children count as empty.
 * - A value that states no fact ("Historic", "N/A", "Unknown") is not shown. "TBD" is shown: for a
 *   ship not yet built it is the honest answer.
 * - Text goes in through textContent, never innerHTML.
 * - Length and beam get the fun-distance line when /assets/js/fun-distance-units.js is on the page.
 *
 * Soli Deo Gloria
 */
(function () {
  'use strict';

  var KEYS = ['class', 'entered_service', 'gt', 'guests', 'crew', 'length', 'beam', 'registry'];
  var LABELS = {
    class: 'Class', entered_service: 'Entered Service', gt: 'Gross Tonnage', guests: 'Guests',
    crew: 'Crew', length: 'Length', beam: 'Beam', registry: 'Registry'
  };
  var NO_FACT = /^(historic|n\/a|unknown)$/i;

  function isEmptyMount(mount) {
    for (var i = 0; i < mount.childNodes.length; i++) {
      var n = mount.childNodes[i];
      if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return false;
      if (n.nodeType === 1 && n.tagName !== 'SCRIPT' && n.tagName !== 'NOSCRIPT') return false;
    }
    return true;
  }

  function funLine(key, val) {
    if ((key !== 'length' && key !== 'beam') || !window.funDistance) return '';
    var m = String(val).match(/(\d+(?:,\d+)?)\s*(?:ft|feet)/i);
    if (!m) return '';
    var feet = parseInt(m[1].replace(/,/g, ''), 10);
    var conv = key === 'length' ? window.funDistance.shipLength(feet) : window.funDistance.shipBeam(feet);
    if (!conv) return '';
    var parts = [];
    if (conv.practical) parts.push(conv.practical);
    if (conv.absurd) parts.push(conv.absurd);
    return parts.join(', or ');
  }

  function render() {
    var mount = document.getElementById('ship-stats');
    var fbEl = document.getElementById('ship-stats-fallback');
    if (!mount || !fbEl || !isEmptyMount(mount)) return;
    var stats;
    try { stats = JSON.parse(fbEl.textContent || '{}'); } catch (_) { return; }
    if (!stats || typeof stats !== 'object') return;

    var lines = [];
    KEYS.forEach(function (k) {
      var v = stats[k];
      if (v === null || v === undefined) return;
      var text = String(v).trim();
      if (!text || NO_FACT.test(text)) return;
      var line = document.createElement('div');
      line.className = 'stat-line';
      var key = document.createElement('span');
      key.className = 'stat-key';
      key.textContent = LABELS[k];
      var val = document.createElement('span');
      val.className = 'stat-val';
      val.textContent = text;
      line.appendChild(key);
      line.appendChild(val);
      var fun = funLine(k, text);
      if (fun) {
        var f = document.createElement('span');
        f.className = 'stat-fun';
        f.textContent = fun;
        line.appendChild(f);
      }
      lines.push(line);
    });
    if (!lines.length) return;

    var noscripts = mount.querySelectorAll('noscript');
    for (var i = 0; i < noscripts.length; i++) noscripts[i].parentNode.removeChild(noscripts[i]);
    lines.forEach(function (line) { mount.appendChild(line); });
    mount.setAttribute('data-stats-rendered', String(lines.length));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
