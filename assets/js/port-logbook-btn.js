/**
 * Port Logbook Button — "Add to My Logbook"
 * Integrates with port-tracker.html's localStorage ('visited-ports')
 *
 * Auto-detects port ID from page URL (/ports/foo.html → "foo")
 * Renders a toggle button in #logbook-btn-container if it exists
 *
 * @version 1.0.0
 * Soli Deo Gloria
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'visited-ports';
  var CONTAINER_ID = 'logbook-btn-container';

  function getPortId() {
    var path = window.location.pathname;
    var match = path.match(/\/ports\/(?:[^/]+\/)?([^/.]+)\.html/);
    return match ? match[1] : null;
  }

  function getVisited() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch (e) {
      return new Set();
    }
  }

  function saveVisited(visited) {
    var arr = [];
    visited.forEach(function (id) { arr.push(id); });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      return false;
    }
  }

  function render(portId) {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    var visited = getVisited();
    var isVisited = visited.has(portId);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'logbook-btn' + (isVisited ? ' logbook-btn--added' : '');
    btn.setAttribute('aria-pressed', String(isVisited));
    btn.textContent = isVisited ? '\u2713 In My Logbook' : '+ Add to My Logbook';

    btn.addEventListener('click', function () {
      var current = getVisited();
      var adding = !current.has(portId);
      if (adding) { current.add(portId); } else { current.delete(portId); }
      if (!saveVisited(current)) return; // storage unavailable \u2014 leave UI in sync with reality
      if (adding) {
        btn.className = 'logbook-btn logbook-btn--added';
        btn.setAttribute('aria-pressed', 'true');
        btn.textContent = '\u2713 In My Logbook';
      } else {
        btn.className = 'logbook-btn';
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = '+ Add to My Logbook';
      }
    });

    container.textContent = '';
    container.appendChild(btn);
  }

  function init() {
    var portId = getPortId();
    if (!portId) return;
    render(portId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
