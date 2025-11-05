/* install.js — lightweight PWA install affordance (v20.4) */

(() => {
  let deferredPrompt = null;
  let ui = null;

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
    txt.textContent = 'Install In the Wake for offline access?';

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
      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        bar.style.display = 'none';
      }
    });

    dismissBtn.addEventListener('click', () => {
      bar.style.display = 'none';
      deferredPrompt = null;
      try { localStorage.setItem('itw:pwa:dismissed', String(Date.now())); } catch {}
    });

    ui = bar;
    return bar;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    let quiet = false;
    try {
      const last = Number(localStorage.getItem('itw:pwa:dismissed') || 0);
      quiet = last && (Date.now() - last < 6 * 24 * 60 * 60 * 1000);
    } catch {}

    if (!quiet) {
      const bar = ensureUI();
      const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (!isiOS) bar.style.display = 'flex';
    }
  });

  function maybeShowIOSHint() {
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!crios|fxios).)*safari/i.test(navigator.userAgent);
    if (!(isiOS && isSafari)) return;
    try {
      const last = Number(localStorage.getItem('itw:pwa:iosHint') || 0);
      if (last && (Date.now() - last < 14 * 24 * 60 * 60 * 1000)) return;
      localStorage.setItem('itw:pwa:iosHint', String(Date.now()));
    } catch {}
    const bar = ensureUI();
    bar.firstChild.textContent = 'Add to Home Screen from Safari’s share menu for offline access.';
    bar.style.background = '#0a6';
    bar.style.display = 'flex';
  }

  window.addEventListener('load', () => {
    setTimeout(maybeShowIOSHint, 1200);
  });
})();
