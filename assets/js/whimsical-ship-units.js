/* whimsical-ship-units.js v1.0.0
 * Displays ship-specific whimsical measurements on ship pages.
 * Uses the ship-stats-fallback JSON to get length and beam,
 * then converts via funDistance API.
 *
 * Soli Deo Gloria
 */

(function() {
  'use strict';

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function init() {
    var container = document.getElementById('whimsical-units-container');
    if (!container) return;
    if (!window.funDistance) {
      // Retry once funDistance is loaded
      setTimeout(init, 200);
      return;
    }

    // Get ship stats from the fallback JSON
    var fallbackEl = document.getElementById('ship-stats-fallback');
    if (!fallbackEl) return;

    var stats;
    try { stats = JSON.parse(fallbackEl.textContent || '{}'); } catch(e) { return; }
    if (!stats) return;

    var shipName = stats.name || 'This ship';
    var items = [];

    // Ship length
    var lengthMatch = String(stats.length || '').match(/(\d+(?:,\d+)?)\s*(?:ft|feet)/i);
    if (lengthMatch) {
      var lengthFeet = parseInt(lengthMatch[1].replace(/,/g, ''));
      var lengthConv = window.funDistance.shipLength(lengthFeet);
      if (lengthConv.practical) {
        items.push({
          label: escapeHtml(shipName) + ' is ' + lengthFeet.toLocaleString() + ' ft long',
          fun: lengthConv.practical
        });
      }
      if (lengthConv.absurd) {
        items.push({
          label: 'Bow to stern',
          fun: lengthConv.absurd
        });
      }
    }

    // Ship beam
    var beamMatch = String(stats.beam || '').match(/(\d+(?:,\d+)?)\s*(?:ft|feet)/i);
    if (beamMatch) {
      var beamFeet = parseInt(beamMatch[1].replace(/,/g, ''));
      var beamConv = window.funDistance.shipBeam(beamFeet);
      if (beamConv.practical) {
        items.push({
          label: escapeHtml(shipName) + ' is ' + beamFeet + ' ft wide',
          fun: beamConv.practical
        });
      }
      if (beamConv.absurd) {
        items.push({
          label: 'Port to starboard',
          fun: beamConv.absurd
        });
      }
    }

    // Guest capacity as a fun comparison
    var guestsMatch = String(stats.guests || '').match(/(\d+(?:,\d+)?)/);
    if (guestsMatch) {
      var guests = parseInt(guestsMatch[1].replace(/,/g, ''));
      if (guests > 1000) {
        var smallTowns = (guests / 2500).toFixed(1);
        items.push({
          label: guests.toLocaleString() + ' guests at full capacity',
          fun: 'That\'s roughly the population of ' + smallTowns + ' small towns'
        });
      }
    }

    if (items.length === 0) {
      container.style.display = 'none';
      return;
    }

    // Pick up to 3 random items
    var selected = items;
    if (items.length > 3) {
      selected = [];
      var indices = [];
      while (selected.length < 3) {
        var idx = Math.floor(Math.random() * items.length);
        if (indices.indexOf(idx) === -1) {
          indices.push(idx);
          selected.push(items[idx]);
        }
      }
    }

    var html = '<h3 style="margin:0 0 0.75rem;font-size:1rem;color:#083041;">Measuring in Whimsy</h3>';
    html += '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.6rem;">';
    selected.forEach(function(item) {
      html += '<li style="font-size:0.88rem;line-height:1.4;color:#345;">';
      html += '<strong style="color:#0e6e8e;">' + item.label + '</strong><br>';
      html += '<span class="tiny" style="color:#5a7a8a;">' + escapeHtml(item.fun) + '</span>';
      html += '</li>';
    });
    html += '</ul>';
    container.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();
