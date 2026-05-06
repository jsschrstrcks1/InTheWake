/* In the Wake — Family Handoff Card persistence
 * Saves filled fields to localStorage scoped by page identifier.
 * No server, no auth, no cross-device sync. Values stay on this device only.
 * Soli Deo Gloria.
 */

(function () {
  'use strict';

  function init() {
    const card = document.querySelector('.handoff-card');
    if (!card) return;

    const storageKey = card.dataset.storageKey;
    if (!storageKey) {
      console.warn('[handoff-card] missing data-storage-key on .handoff-card');
      return;
    }

    const inputs = card.querySelectorAll('input[type="text"]');

    // Restore saved values
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      inputs.forEach(input => {
        if (input.name && saved[input.name] !== undefined) {
          input.value = saved[input.name];
        }
      });
    } catch (e) {
      // Ignore corrupt localStorage; treat as empty
    }

    // Save on input
    function save() {
      const data = {};
      inputs.forEach(input => {
        if (input.name) data[input.name] = input.value;
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        // Quota exceeded or storage disabled — fail silently
      }
    }

    inputs.forEach(input => {
      input.addEventListener('input', save);
      input.addEventListener('change', save);
    });

    // Wire the Clear button
    const clearBtn = card.querySelector('button.clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!confirm('Clear all the fields on this card? This cannot be undone.')) return;
        inputs.forEach(input => { input.value = ''; });
        try { localStorage.removeItem(storageKey); } catch (e) {}
      });
    }

    // Wire the print buttons. Each print button has data-print-scope
    // ("emergency-only" or "entire-pack" or "page").
    card.querySelectorAll('button[data-print-scope]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scope = btn.dataset.printScope;
        document.body.classList.add('printing-' + scope);
        // Run print after the class lands; remove class after print dialog closes
        setTimeout(() => {
          window.print();
          // Browsers fire afterprint when the print dialog closes
          const cleanup = () => {
            document.body.classList.remove('printing-' + scope);
            window.removeEventListener('afterprint', cleanup);
          };
          window.addEventListener('afterprint', cleanup);
        }, 50);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
