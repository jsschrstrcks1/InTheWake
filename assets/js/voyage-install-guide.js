/* In the Wake — "Save the Voyage companion to your phone" dialog.
 * One accessible dialog (role="dialog", aria-modal) with three platform panels
 * (iPhone / Android / computer). Opens from any [data-vp-install-open] control,
 * traps focus, closes on Escape / backdrop / close button, and returns focus to
 * the control that opened it. No inline handlers, no HTML injection, no storage.
 * Soli Deo Gloria.
 */
(function () {
  'use strict';

  const dialog = document.getElementById('vp-install-dialog');
  if (!dialog) return;

  const closeBtn = dialog.querySelector('.vp-dialog-close');
  const tabs = Array.from(dialog.querySelectorAll('[role="tab"]'));
  const panels = Array.from(dialog.querySelectorAll('[role="tabpanel"]'));
  const status = document.getElementById('vp-install-status');
  let opener = null;

  function focusables() {
    return Array.from(dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter((el) => el.offsetParent !== null);
  }

  function selectTab(tab, { focus = false } = {}) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
    });
    panels.forEach((p) => {
      p.hidden = p.id !== tab.getAttribute('aria-controls');
    });
    if (focus) tab.focus();
    if (status) status.textContent = 'Showing steps for ' + tab.textContent.trim() + '.';
  }

  // Pick the panel that most likely matches the visitor's device. A guess only;
  // the tabs stay one tap away and nothing about the device is stored or sent.
  function guessPlatformTab() {
    const ua = (navigator.userAgent || '').toLowerCase();
    let key = 'desktop';
    if (/iphone|ipad|ipod/.test(ua) || (ua.includes('macintosh') && navigator.maxTouchPoints > 1)) key = 'ios';
    else if (ua.includes('android')) key = 'android';
    return tabs.find((t) => t.dataset.platform === key) || tabs[0];
  }

  function open(fromEl) {
    opener = fromEl || document.activeElement;
    dialog.hidden = false;
    dialog.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vp-dialog-open');
    selectTab(guessPlatformTab(), { focus: true });
  }

  function close() {
    dialog.hidden = true;
    dialog.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vp-dialog-open');
    if (opener && typeof opener.focus === 'function') opener.focus();
    opener = null;
  }

  document.querySelectorAll('[data-vp-install-open]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open(el);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);

  // Backdrop click: only when the click lands on the overlay itself.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab, { focus: true }));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next, { focus: true });
      }
    });
  });

  // Start closed and consistent, whatever the markup shipped with.
  dialog.hidden = true;
  dialog.setAttribute('aria-hidden', 'true');
  selectTab(tabs[0]);
})();
