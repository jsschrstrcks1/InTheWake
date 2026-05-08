/**
 * Articles Hub — populates the #articles-container grid on /articles.html
 *
 * Pulls from the same /assets/data/articles/index.json source as
 * /assets/js/article-rail.js, so adding an article to the JSON shows up
 * on both the per-port rail and the articles hub.
 *
 * - Sorts by date desc
 * - Filters status === "published"
 * - Escapes user-facing strings to prevent XSS
 * - Falls back to a friendly message if the fetch fails
 *
 * @version 1.0.0
 */
(async function () {
  "use strict";

  var DATA_URL = '/assets/data/articles/index.json';
  var FALLBACK_THUMB = '/assets/social/articles-hero.jpg';

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

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  var container = document.getElementById('articles-container');
  if (!container) return;

  try {
    var response = await fetch(DATA_URL);
    if (!response.ok) {
      container.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center"><p>Articles list temporarily unavailable. Try refreshing.</p></div>';
      return;
    }

    var data = await response.json();
    var articles = (data.articles || data || [])
      .filter(function (a) { return a && a.status === 'published'; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

    if (!articles.length) {
      container.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center"><p>No articles published yet.</p></div>';
      return;
    }

    container.innerHTML = articles.map(function (article) {
      var thumb = sanitizeUrl(article.thumbnail || article.image || FALLBACK_THUMB);
      var url = sanitizeUrl(article.url);
      var title = escapeHtml(article.title);
      var excerpt = escapeHtml(article.excerpt || '');
      var dateLabel = escapeHtml(formatDate(article.date));
      var authorName = article.author && article.author.name ? escapeHtml(article.author.name) : '';

      return '<article class="card article-card" style="display:flex;flex-direction:column;overflow:hidden">' +
        '<a href="' + url + '" style="display:block;color:inherit;text-decoration:none">' +
          '<img src="' + thumb + '" alt="" loading="lazy" decoding="async" ' +
            'style="width:100%;height:180px;object-fit:cover;display:block" ' +
            'onerror="this.onerror=null;this.src=\'' + FALLBACK_THUMB + '\'"/>' +
          '<div style="padding:1rem 1.25rem">' +
            '<h3 style="margin:0 0 0.5rem;font-size:1.15rem;line-height:1.3">' + title + '</h3>' +
            '<p style="margin:0 0 0.75rem;font-size:0.95rem;color:#444;line-height:1.45">' + excerpt + '</p>' +
            '<p style="margin:0;font-size:0.8rem;color:#666">' +
              (authorName ? authorName + ' &middot; ' : '') + dateLabel +
            '</p>' +
          '</div>' +
        '</a>' +
      '</article>';
    }).join('');
  } catch (err) {
    console.warn('articles-hub.js: failed to load', err);
    container.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center"><p>Articles list temporarily unavailable. Try refreshing.</p></div>';
  }
})();
