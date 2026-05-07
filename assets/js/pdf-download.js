/* In the Wake — PDF download for emergency contacts and voyage packs
 * Lazy-loads html2pdf.js from cdn.jsdelivr.net only when a PDF button
 * is first clicked. Three scopes per page:
 *   data-pdf-scope="emergency-only" — just the #emergency-contacts section
 *   data-pdf-scope="entire-pack"    — the entire voyage-pack page
 *   data-pdf-scope="page"           — the full sitewide page
 * Soli Deo Gloria.
 */

(function () {
  'use strict';

  const HTML2PDF_CDN = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/dist/html2pdf.bundle.min.js';
  let loaderPromise = null;

  function loadHtml2Pdf() {
    if (loaderPromise) return loaderPromise;
    loaderPromise = new Promise((resolve, reject) => {
      if (window.html2pdf) return resolve(window.html2pdf);
      const script = document.createElement('script');
      script.src = HTML2PDF_CDN;
      script.async = true;
      script.onload = () => resolve(window.html2pdf);
      script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
      document.head.appendChild(script);
    });
    return loaderPromise;
  }

  function getScopeElement(scope) {
    if (scope === 'emergency-only') {
      return document.getElementById('emergency-contacts');
    }
    if (scope === 'entire-pack' || scope === 'page') {
      return document.querySelector('main') || document.body;
    }
    return null;
  }

  function getFilename(scope) {
    const meta = document.querySelector('meta[name="vp-filename-base"]');
    const base = meta ? meta.content : 'inthewake-handoff';
    if (scope === 'emergency-only') return base + '-emergency-contacts.pdf';
    if (scope === 'entire-pack') return base + '-voyage-pack.pdf';
    return 'inthewake-reaching-someone-at-sea.pdf';
  }

  async function downloadPdf(scope, button) {
    const element = getScopeElement(scope);
    if (!element) {
      alert('Could not find the section to download. Please reload the page and try again.');
      return;
    }

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'Preparing PDF…';

    try {
      const html2pdf = await loadHtml2Pdf();
      const opts = {
        margin: 0.5,
        filename: getFilename(scope),
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await html2pdf().from(element).set(opts).save();
    } catch (err) {
      console.error('[pdf-download]', err);
      alert('Could not generate PDF. You can use Print → Save as PDF as a fallback.');
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  function init() {
    document.querySelectorAll('button[data-pdf-scope]').forEach(btn => {
      btn.addEventListener('click', () => downloadPdf(btn.dataset.pdfScope, btn));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
