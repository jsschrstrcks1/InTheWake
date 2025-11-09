/* install.js — PWA install affordance, engagement-aware (v10) */

(() => {
  // ---- config knobs ----
  const SNOOZE_DISMISS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
  const SNOOZE_IGNORE_MS  =  7 * 24 * 60 * 60 * 1000; // 7 days
  const IOS_HINT_MS       = 14 * 24 * 60 * 60 * 1000; // 14 days
  const IGNORE_AFTER_MS   = 10_000;                    // 10s no action = ignore
  const ENGAGE_DWELL_MS   = 35_000;                    // 35s + 2 clicks -> engaged
  const MIN_VISITS        = 2;                         // returning threshold

  // ---- storage keys ----
  const K = {
    visits:    'itw:pwa:visits',
    engaged:   'itw:pwa:engaged',
    dismissed: 'itw:pwa:dismissed',
    ignored:   'itw:pwa:ignored',
    iosHint:   'itw:pwa:iosHint',
  };

  let deferredPrompt = null;
  let ui = null;
  let ignoreTimer = null;

  // ---------- helpers ----------
  const now = () => Date.now();
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = () => /^((?!crios|fxios).)*safari/i.test(navigator.userAgent);
  const inStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari legacy flag:
    (typeof navigator.standalone === 'boolean' && navigator.standalone);

  const inBadContext = () => {
    // Skip if a modal/keyboard likely visible; tweak for your UI if needed
    const quizOpen = !!document.querySelector('#quiz-modal.show');
    return quizOpen;
  };

  function getNum(key) {
    try { return Number(localStorage.getItem(key) || 0); } catch { return 0; }
  }
  function setNum(key, v) {
    try { localStorage.setItem(key, String(v)); } catch {}
  }
  function setStamp(key) { setNum(key, now()); }
  function within(ms, stamp) { return stamp && (now() - stamp < ms); }

  function allowedByFrequency() {
    const d = getNum(K.dismissed);
    const i = getNum(K.ignored);
    const quiet = within(SNOOZE_DISMISS_MS, d) || within(SNOOZE_IGNORE_MS, i);
    return !quiet;
  }

  function allowedByEngagement() {
    const visits = getNum(K.visits);
    const engaged = localStorage.getItem(K.engaged) === '1';
    return visits >= MIN_VISITS || engaged;
  }

  // ---------- UI ----------
  function ensureUI() {
    if (ui) return ui;
    const bar = document.createElement('div');
    bar.id = 'pwa-install-bar';
    bar.style.cssText = `
      position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%);
      display: none; gap:.6rem; align-items:center;
      padding:.55rem .75rem; background:#0b5; color:#fff; border-radius:10px;
      font: 14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
      box-shadow: 0 6px 18px rgba(0,0,0,.18); z-index: 10000;
    `;

    const txt = document.createElement('span');
    txt.textContent = 'Install ITW – Cruise Drink Calculator for offline access?';

    const installBtn = document.createElement('button');
    installBtn.type = 'button';
    installBtn.textContent = 'Install';
    installBtn.style.cssText = `
      appearance:none;border:0;background:#fff;color:#0b5;
      padding:.35rem .7rem;border-radius:8px;font-weight:700;cursor:pointer;
    `;

    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.textContent = 'Not now';
    dismissBtn.style.cssText = `
      appearance:none;border:0;background:transparent;color:#e7fff1;
      padding:.35rem .2rem;border-radius:8px;cursor:pointer;
    `;

    bar.appendChild(txt);
    bar.appendChild(installBtn);
    bar.appendChild(dismissBtn);
    document.body.appendChild(bar);

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) { bar.style.display = 'none'; return; }
      clearTimeout(ignoreTimer);
      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        bar.style.display = 'none';
      }
    });

    dismissBtn.addEventListener('click', () => {
      clearTimeout(ignoreTimer);
      bar.style.display = 'none';
      deferredPrompt = null;
      setStamp(K.dismissed);
    });

    ui = bar;
    return bar;
  }

  // ---------- engagement tracking ----------
  (function trackEngagement(){
    try {
      setNum(K.visits, 1 + getNum(K.visits));

      let clicks = 0, dwellHit = false;
      const mark = () => { try { if (dwellHit && clicks >= 2) localStorage.setItem(K.engaged, '1'); } catch {} };

      setTimeout(() => { dwellHit = true; mark(); }, ENGAGE_DWELL_MS);
      document.addEventListener('click', () => { clicks++; mark(); }, { passive:true });

      // Optional: app can fire this once a calc completes:
      // window.dispatchEvent(new Event('itw:calc:done'));
      window.addEventListener('itw:calc:done', () => { try { localStorage.setItem(K.engaged, '1'); } catch {} });
    } catch {}
  })();

  // ---------- install prompt ----------
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (inStandalone() || inBadContext()) return;
    if (!allowedByFrequency() || !allowedByEngagement()) return;

    if (!isIOS()) {
      const bar = ensureUI();
      bar.style.display = 'flex';

      // If user neither clicks Install nor Dismiss after X seconds, mark as ignored.
      clearTimeout(ignoreTimer);
      ignoreTimer = setTimeout(() => {
        if (deferredPrompt) {
          setStamp(K.ignored);
          bar.style.display = 'none';
        }
      }, IGNORE_AFTER_MS);
    }
  });

  // ---------- iOS A2HS hint ----------
  function maybeShowIOSHint() {
    if (!(isIOS() && isSafari())) return;
    if (inStandalone() || inBadContext()) return;
    if (!allowedByFrequency() || !allowedByEngagement()) return;

    // respect hint frequency
    const last = getNum(K.iosHint);
    if (within(IOS_HINT_MS, last)) return;
    setStamp(K.iosHint);

    const bar = ensureUI();
    bar.firstChild.textContent = 'Add to Home Screen from Safari’s share menu for offline access.';
    bar.style.background = '#0a6';
    bar.style.display = 'flex';

    clearTimeout(ignoreTimer);
    ignoreTimer = setTimeout(() => {
      // treat no action as a gentle ignore for iOS too
      setStamp(K.ignored);
      bar.style.display = 'none';
    }, IGNORE_AFTER_MS);
  }

  window.addEventListener('load', () => {
    // Small delay so it never competes with first-paint UI
    setTimeout(maybeShowIOSHint, 1200);
  });

  // Optional: if app detects install success, hide bar
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', (e) => {
    if (e.matches && ui) ui.style.display = 'none';
  });
})();
