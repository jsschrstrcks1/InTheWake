/**
 * Article Rail — populates the "Recent Stories" sidebar section
 * Shared module loaded on all port pages (like nearby-ports.js)
 *
 * - If #recent-rail exists and is empty, fetches and renders articles
 * - If #recent-rail doesn't exist but sidebar does, creates the section first
 * - Escapes all user-facing strings to prevent XSS
 *
 * @version 1.0.0
 */
(async function () {
  "use strict";

  var DATA_URL = '/assets/data/articles/index.json';
  var MAX_ARTICLES = 5;

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function sanitizeUrl(url) {
    if (!url) return '#';
    if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return '#';
  }

  // Find or create the #recent-rail container
  var rail = document.getElementById('recent-rail');

  if (!rail) {
    // Try to inject into the sidebar
    var sidebar = document.querySelector('aside.rail');
    if (!sidebar) return; // No sidebar — nothing to do

    var section = document.createElement('section');
    section.className = 'card';
    section.setAttribute('style', 'grid-column: 1;');
    section.setAttribute('aria-labelledby', 'recent-rail-title');
    section.innerHTML =
      '<h3 id="recent-rail-title">Recent Stories</h3>' +
      '<p class="tiny content-text">Real cruising experiences, practical guides, and heartfelt reflections from our community.</p>' +
      '<div id="recent-rail" class="rail-list" aria-live="polite"></div>';

    // Insert before the whimsical-units container or at end of sidebar
    var whimsical = sidebar.querySelector('#whimsical-units-container');
    if (whimsical) {
      sidebar.insertBefore(section, whimsical);
    } else {
      sidebar.appendChild(section);
    }

    rail = document.getElementById('recent-rail');
  }

  // If already populated (by an inline script), skip
  if (!rail || rail.children.length > 0) return;

  try {
    var response = await fetch(DATA_URL);
    if (!response.ok) {
      console.warn('Article rail: fetch returned ' + response.status);
      return;
    }

    var data = await response.json();
    var articles = data.articles || data;

    if (!articles || !articles.length) return;

    rail.innerHTML = articles.slice(0, MAX_ARTICLES).map(function (article) {
      return '<div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #e0e8f0;">' +
        '<h4 style="margin:0 0 0.25rem;font-size:0.95rem;">' +
        '<a href="' + sanitizeUrl(article.url) + '">' + escapeHtml(article.title) + '</a></h4>' +
        '<p style="margin:0;font-size:0.8rem;color:#666;">' + escapeHtml(article.date || '') + '</p></div>';
    }).join('');
  } catch (err) {
    console.warn('Article rail error:', err.message || err);
  }
})();
