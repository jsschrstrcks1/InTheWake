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

    // Anonymous usage counts (assets/js/voyage-usage.js), only on a page that names its pack.
    // What is sent: the pack slug and the event name. Never a field value, never the card.
    const packSlug = (document.querySelector('main[data-pack]') || {}).dataset
      ? document.querySelector('main[data-pack]').dataset.pack : null;
    const usage = (name, data) => {
      if (!packSlug || !window.ITW_USAGE || typeof window.ITW_USAGE.track !== 'function') return;
      try { window.ITW_USAGE.track(name, Object.assign({ pack: packSlug }, data || {})); } catch (e) {}
    };
    const filledKey = 'itw:vp-handoff-filled:' + storageKey;

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
      // Once per device per pack: "someone filled this card in". A boolean, never the contents.
      try {
        const anyFilled = Object.keys(data).some((k) => String(data[k] || '').trim() !== '');
        if (anyFilled && !localStorage.getItem(filledKey)) {
          localStorage.setItem(filledKey, '1');
          usage('vp_handoff_filled');
        }
      } catch (e) {}
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
        usage('vp_print', { scope });
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
