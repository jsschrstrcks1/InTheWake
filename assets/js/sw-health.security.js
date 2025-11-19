/* sw-health.security.js v12.0.0 — Security & Health Diagnostics
 * Displays browser security context and SW status
 * Soli Deo Gloria ✝️
 */

(function () {
  const VER = '12.0.0';

  // ---------- Small helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = (v) => (v === true ? '✅ Yes' : v === false ? '❌ No' : v ?? '—');

  function kvRow(k, v) {
    return `<div class="kv"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  }
  function section(title, bodyHTML) {
    return `<section class="card"><h3 style="margin:0 0 .5rem 0">${title}</h3>${bodyHTML}</section>`;
  }

  // ---------- Security checks ----------
  async function gatherSecurity() {
    // Basics
    const isSecure = window.isSecureContext;
    const crossOriginIso = !!(self.crossOriginIsolated);
    const referrerPolicy = document.referrerPolicy || '—';
    const cspMeta = $('meta[http-equiv="Content-Security-Policy"]')?.content || '—';
    const hasNonce = !!$('script[nonce]');

    // Permissions (best-effort)
    async function perm(name) {
      try {
        // Some browsers gate this; treat failure as unknown.
        const s = await navigator.permissions.query({ name });
        return s.state; // 'granted' | 'denied' | 'prompt'
      } catch { return 'unknown'; }
    }
    const [notif, push, clipboard, camera, mic] = await Promise.all([
      perm('notifications'),
      // Chrome “push” permission query may throw; we already guard.
      perm('push'),
      perm('clipboard-read'),
      perm('camera'),
      perm('microphone'),
    ]);

    // Service worker facts
    let sw = { supported: 'serviceWorker' in navigator };
    if (sw.supported) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const ctrl = navigator.serviceWorker.controller;
        sw = {
          ...sw,
          scope: reg?.scope || '—',
          scriptURL: reg?.active?.scriptURL || reg?.installing?.scriptURL || reg?.waiting?.scriptURL || '—',
          state: reg?.active ? 'active' : reg?.waiting ? 'waiting' : reg?.installing ? 'installing' : '—',
          updateViaCache: reg?.updateViaCache || '—',
          hasController: !!ctrl,
          controllerUrl: ctrl?.scriptURL || '—'
        };
      } catch { /* no-op */ }
    }

    // App config flags (if present)
    const secCfg = window.ITW_CFG?.security || {};
    const itw = {
      enableTelemetry: !!secCfg.enableTelemetry,
      enableIntegrityChecks: !!secCfg.enableIntegrityChecks,
      workerIntegrityHash: secCfg.workerIntegrityHash || '—',
    };

    // Passive header-ish signals we can infer client-side
    const https = location.protocol === 'https:';
    const hstsLikely = https ? 'Unknown (header not readable client-side)' : false;

    return {
      basics: { isSecure, crossOriginIso, https, hstsLikely, referrerPolicy, hasNonce, cspMeta },
      perms: { notif, push, clipboard, camera, mic },
      sw,
      itw
    };
  }

  function render(root, data) {
    const { basics, perms, sw, itw } = data;

    // CSS (scoped, very light)
    const style = document.createElement('style');
    style.textContent = `
      #security-root .kv { display:grid; grid-template-columns: 1fr 2fr; gap:.5rem; padding:.35rem 0; border-bottom:1px dashed #e5e7eb; }
      #security-root .kv:last-child { border-bottom:0; }
      #security-root .k { font-weight:700; color:#0a3d62; }
      #security-root .v { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; overflow-wrap:anywhere; }
      #security-root .muted { color:#64748b; font-size:.9rem; }
      #security-root code { background:#f1f5f9; padding:.1rem .3rem; border-radius:4px; }
      #security-root .row { margin:.4rem 0; }
    `;
    root.appendChild(style);

    // BASICS
    const basicsHTML = [
      kvRow('Secure context (HTTPS/localhost)', fmt(basics.isSecure)),
      kvRow('Location uses HTTPS', fmt(basics.https)),
      kvRow('Cross-Origin Isolated', fmt(basics.crossOriginIso)),
      kvRow('Referrer-Policy', `<code>${basics.referrerPolicy}</code>`),
      kvRow('Inline script nonce present', fmt(basics.hasNonce)),
      kvRow('CSP (meta)', `<div class="muted"><code>${basics.cspMeta}</code></div>`),
      kvRow('HSTS enforced', basics.hstsLikely === false ? '❌ No (HTTP)' : 'ℹ️ ' + basics.hstsLikely),
    ].join('');

    // SERVICE WORKER
    const swHTML = [
      kvRow('Supported', fmt(sw.supported)),
      kvRow('Active state', `<code>${sw.state}</code>`),
      kvRow('Registration scope', `<code>${sw.scope}</code>`),
      kvRow('Script URL', `<code>${sw.scriptURL}</code>`),
      kvRow('Controller present', fmt(sw.hasController)),
      kvRow('Controller URL', `<code>${sw.controllerUrl}</code>`),
      kvRow('updateViaCache', `<code>${sw.updateViaCache}</code>`),
      `<div class="row muted">Tip: active should be <code>active</code>, and controller should exist once a page is claimed.</div>`
    ].join('');

    // PERMISSIONS
    const permsHTML = [
      kvRow('Notifications', `<code>${perms.notif}</code>`),
      kvRow('Push', `<code>${perms.push}</code>`),
      kvRow('Clipboard (read)', `<code>${perms.clipboard}</code>`),
      kvRow('Camera', `<code>${perms.camera}</code>`),
      kvRow('Microphone', `<code>${perms.mic}</code>`),
      `<div class="row muted">States come from the Permissions API where supported (granted/denied/prompt/unknown).</div>`
    ].join('');

    // APP CONFIG
    const appHTML = [
      kvRow('Integrity checks enabled', fmt(itw.enableIntegrityChecks)),
      kvRow('Worker integrity hash', `<code>${itw.workerIntegrityHash}</code>`),
      kvRow('Telemetry enabled', fmt(itw.enableTelemetry)),
      `<div class="row muted">These map to <code>ITW_CFG.security</code> set in your HTML loader.</div>`
    ].join('');

    root.innerHTML = [
      section('🔒 Page & Headers', basicsHTML),
      section('⚙️ Service Worker', swHTML),
      section('🧩 Browser Permissions', permsHTML),
      section('🛠 App Security Config', appHTML),
      `<section class="card">
        <h3 style="margin:0 0 .5rem 0">Recommended Hardening (optional)</h3>
        <ul style="margin:.4rem 0 0 1.1rem;line-height:1.6">
          <li>Add <code>worker-src 'self'</code> to CSP if not already present.</li>
          <li>Consider <code>require-trusted-types-for 'script'</code> + a Trusted Types policy for DOM sinks.</li>
          <li>Serve with HSTS (e.g., <code>Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</code>).</li>
          <li>Pin your SW/script assets with SRI or a versioned hash in filename (you already version with <code>?v=10.0.0</code>).</li>
        </ul>
      </section>`
    ].join('');
  }

  async function init() {
    const root = document.getElementById('security-root');
    if (!root) return; // page doesn’t have the panel added

    try {
      const data = await gatherSecurity();
      render(root, data);
    } catch (e) {
      root.innerHTML = `<div class="card">Failed to load security diagnostics: ${String(e)}</div>`;
    }

    // Wire the tab button if the host page uses data-tab switching
    const btn = document.getElementById('tab-security-btn');
    const panel = document.getElementById('tab-security');
    if (btn && panel) {
      btn.addEventListener('click', () => {
        // Hide other panels
        $$('.tab-panel').forEach(p => p.hidden = true);
        // Deactivate other buttons
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        // Activate
        panel.hidden = false;
        btn.classList.add('active');
        // Announce
        const live = document.getElementById('a11y-status');
        if (live) live.textContent = 'Security tab selected';
      });
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
