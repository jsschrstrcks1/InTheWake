/* In the Wake — Floating Share Bar (v1.2, standards v3.002)
   - Fixed, right-aligned; fade+slide in on scroll
   - X (Twitter), Facebook, Instagram (Copy Link), WhatsApp, WeChat (QR modal)
   - Safe-area aware, WCAG/ARIA, keyboard friendly
*/

(function () {
  // ---------- Config ----------
  const CFG = {
    minScrollShow: 150,    // show after this scrollY
    minScrollHide: 60,     // hide when above this
    slideY: 12,            // px translate when hidden
    iconsSize: 22,         // px for SVG viewbox scale
    qrSize: 180,           // modal QR size in px
    // Fallback QR endpoint (no tracking params)
    qrEndpoint: "https://api.qrserver.com/v1/create-qr-code/",
  };

  // Guard: only run once
  if (window.__itwShareBarMounted) return;
  window.__itwShareBarMounted = true;

  // ---------- Utilities ----------
  const ORIGIN = (location.origin || (location.protocol + "//" + location.host)).replace(/\/$/, "");
  function abs(path) {
    path = String(path || "");
    if (!path.startsWith("/")) path = "/" + path;
    return ORIGIN + path;
  }

  function buildShareData() {
    const url = location.href;
    const title =
      (document.querySelector('meta[property="og:title"]')?.getAttribute("content")) ||
      document.title ||
      "In the Wake";
    const desc =
      (document.querySelector('meta[name="description"]')?.getAttribute("content")) ||
      (document.querySelector('meta[property="og:description"]')?.getAttribute("content")) ||
      "";
    return { url, title, desc };
  }

  function enc(s) { return encodeURIComponent(s || ""); }

  // ---------- Icons (inline SVG, no external fetch) ----------
  function icon(name, label) {
    const sz = CFG.iconsSize;
    const base = `width="${sz}" height="${sz}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"`;
    switch (name) {
      case "x":       return `<svg ${base}><path d="M18.9 3H22l-7.8 9.1L22.7 21H16l-5-6.2-5.7 6.2H2.2L10.5 11 2.3 3h6.9l4.6 5.6L18.9 3Z"/></svg>`;
      case "fb":      return `<svg ${base}><path d="M13 22v-8h3l.5-4H13V7.3c0-1.1.3-1.8 1.9-1.8H17V2.1c-.3 0-1.3-.1-2.5-.1C11.7 2 10 3.5 10 6.4V10H7v4h3v8h3z"/></svg>`;
      case "ig":      return `<svg ${base}><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zM18 6.8a1.2 1.2 0 1 1-1.2-1.2A1.2 1.2 0 0 1 18 6.8z"/></svg>`;
      case "wa":      return `<svg ${base}><path d="M20.5 3.5A10.5 10.5 0 0 0 3.6 17.2L2 22l4.9-1.6A10.5 10.5 0 1 0 20.5 3.5zM12 20.1a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.4.8.8-2.4-.2-.3a8.1 8.1 0 1 1 6.2 3.2zm4.6-6.1c-.2-.1-1.3-.6-1.5-.7s-.4-.1-.6.1-.7.7-.8.9-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.3 0-.4.1-.6l.3-.4a2 2 0 0 0 .1-.4.5.5 0 0 0 0-.5C10.3 9.4 9.6 8 9.3 7.4s-.7-.6-1-.6h-.3a.9.9 0 0 0-.6.3A2.1 2.1 0 0 0 7 8.4 7.6 7.6 0 0 0 8.6 11a17.4 17.4 0 0 0 3.4 3.5A8 8 0 0 0 15 16a1.9 1.9 0 0 0 1.2-.8 1.7 1.7 0 0 0 .1-1.2c-.1-.2-.2-.2-.3-.3z"/></svg>`;
      case "wx":      return `<svg ${base}><path d="M9.5 4a7.5 7.5 0 1 0 0 15h.4l.4 2.9 3.3-2.9H15A7.5 7.5 0 1 0 9.5 4zM7 9a1 1 0 1 1 1 1A1 1 0 0 1 7 9zm5 0a1 1 0 1 1 1 1A1 1 0 0 1 12 9zm5 4.5a1 1 0 1 1-1-1A1 1 0 0 1 17 13.5z"/></svg>`;
      default:        return "";
    }
  }

  // ---------- Styles (injected once) ----------
  const css = `
  :root{
    --share-bar-right: 20px;
    --share-bar-bottom: 20px;
    --share-bar-z: 9999;
  }
  .itw-share-bar{
    position: fixed;
    right: calc(var(--share-bar-right) + env(safe-area-inset-right, 0px));
    bottom: calc(max(var(--share-bar-bottom), 12px) + env(safe-area-inset-bottom, 0px));
    z-index: var(--share-bar-z);
    display: flex;
    flex-direction: column;
    gap: .5rem;
    pointer-events: none;               /* container ignores clicks; children re-enable */
    opacity: 0;
    transform: translateY(${CFG.slideY}px);
    transition: opacity .24s ease, transform .24s ease;
  }
  .itw-share-bar.on{
    opacity: 1;
    transform: translateY(0);
  }
  .itw-share-btn{
    pointer-events: auto;
    appearance: none;
    border: none;
    padding: .5rem;
    border-radius: 999px;
    background: rgba(255,255,255,.96);
    box-shadow: 0 4px 18px rgba(8,48,65,.16), 0 0 0 1px rgba(13,59,102,.06) inset;
    cursor: pointer;
    line-height: 0;
  }
  .itw-share-btn:hover{ background: #fff; }
  .itw-share-btn:focus-visible{
    outline: 3px solid #0e6e8e;
    outline-offset: 2px;
  }
  .itw-share-btn svg{ display:block; }
  @media (prefers-reduced-motion: reduce){
    .itw-share-bar{ transition: none !important; }
  }

  /* Modal */
  .itw-modal-backdrop{
    position: fixed; inset: 0;
    background: rgba(0,0,0,.35);
    display: none;
    z-index: calc(var(--share-bar-z) + 1);
  }
  .itw-modal-backdrop.on{ display: block; }
  .itw-modal{
    position: fixed; inset: 0;
    display: grid; place-items: center;
    z-index: calc(var(--share-bar-z) + 2);
    padding: 1rem;
  }
  .itw-modal-card{
    width: min(92vw, 380px);
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(8,48,65,.28);
    border: 2px solid #D9B382;
    padding: 1rem;
  }
  .itw-modal-card h3{ margin: 0 0 .35rem; color:#083041; font-size:1.05rem }
  .itw-modal-actions{ display:flex; gap:.5rem; margin-top:.75rem; justify-content:flex-end }
  .itw-btn{
    appearance:none; border:1px solid #cfe1ea; background:#f7fdff; color:#0e6e8e;
    padding:.4rem .65rem; border-radius:8px; cursor:pointer;
  }
  .itw-btn:hover{ background:#eef7fb }
  .itw-input{
    width:100%; padding:.55rem .65rem; border-radius:10px; border:1px solid #cfe1ea;
    font-size:.95rem;
  }
  `;

  const style = document.createElement("style");
  style.id = "itw-share-bar-css";
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- DOM: bar + modal ----------
  const bar = document.createElement("div");
  bar.className = "itw-share-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Share this page");

  const { url, title } = buildShareData();

  function openPopup(u, w = 640, h = 560) {
    const y = Math.max(0, (screen.height - h) / 2);
    const x = Math.max(0, (screen.width - w) / 2);
    window.open(u, "_blank", `width=${w},height=${h},left=${x},top=${y},noopener,noreferrer`);
  }

  function makeBtn(name, label, onClick) {
    const b = document.createElement("button");
    b.className = "itw-share-btn";
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.title = label;
    b.innerHTML = icon(name, label);
    b.addEventListener("click", (e) => { e.preventDefault(); onClick(); });
    return b;
  }

  // X / Twitter
  const xBtn = makeBtn("x", "Share on X", () => {
    const u = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
    openPopup(u);
  });

  // Facebook
  const fbBtn = makeBtn("fb", "Share on Facebook", () => {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    openPopup(u);
  });

  // Instagram – copy link (there’s no web share endpoint)
  const igBtn = makeBtn("ig", "Copy link for Instagram", async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied! Paste in Instagram.");
    } catch {
      promptCopyFallback();
    }
  });

  // WhatsApp – use Web/Deep share or Web Share API if available
  const waBtn = makeBtn("wa", "Share on WhatsApp", async () => {
    const text = `${title} — ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; } catch {}
    }
    const ua = navigator.userAgent || "";
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const base = isMobile ? "whatsapp://send" : "https://wa.me/";
    const u = isMobile ? `${base}?text=${enc(text)}` : `${base}?text=${enc(text)}`;
    openPopup(u, 520, 620);
  });

  // WeChat – open modal with QR + copy link
  const wxBtn = makeBtn("wx", "Share on WeChat", () => openWeChatModal());

  [xBtn, fbBtn, igBtn, waBtn, wxBtn].forEach(b => bar.appendChild(b));
  document.body.appendChild(bar);

  // Modal
  const backdrop = document.createElement("div");
  backdrop.className = "itw-modal-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const modalWrap = document.createElement("div");
  modalWrap.className = "itw-modal";
  modalWrap.style.display = "none";
  modalWrap.innerHTML = `
    <div class="itw-modal-card" role="dialog" aria-modal="true" aria-labelledby="itw-wx-title">
      <h3 id="itw-wx-title">Share to WeChat</h3>
      <p class="tiny" style="margin:.1rem 0 .6rem;color:#345">
        Scan this QR in WeChat or copy the link below.
      </p>
      <div style="display:grid;place-items:center">
        <img id="itw-wx-qr" alt="QR code for this page" width="${CFG.qrSize}" height="${CFG.qrSize}"
             style="border-radius:12px;border:1px solid #eee;max-width:100%"/>
      </div>
      <div style="margin-top:.7rem">
        <input class="itw-input" id="itw-wx-link" value="${url}" readonly aria-label="Share link">
      </div>
      <div class="itw-modal-actions">
        <button class="itw-btn" id="itw-copy">Copy link</button>
        <button class="itw-btn" id="itw-close">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.body.appendChild(modalWrap);

  const wxImg = modalWrap.querySelector("#itw-wx-qr");
  const wxLink = modalWrap.querySelector("#itw-wx-link");
  const btnCopy = modalWrap.querySelector("#itw-copy");
  const btnClose = modalWrap.querySelector("#itw-close");

  function openWeChatModal() {
    const qr = `${CFG.qrEndpoint}?size=${CFG.qrSize}x${CFG.qrSize}&data=${enc(url)}`;
    wxImg.src = qr;
    wxLink.value = url;
    backdrop.classList.add("on");
    modalWrap.style.display = "grid";
    btnCopy.focus();
    trapFocus(modalWrap);
  }
  function closeWeChatModal() {
    backdrop.classList.remove("on");
    modalWrap.style.display = "none";
    releaseFocus();
    wxBtn.focus();
  }
  btnClose.addEventListener("click", closeWeChatModal);
  backdrop.addEventListener("click", closeWeChatModal);
  document.addEventListener("keydown", (e) => {
    if (modalWrap.style.display !== "none" && e.key === "Escape") closeWeChatModal();
  });
  btnCopy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch { promptCopyFallback(); }
  });

  // ---------- Scroll show/hide ----------
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > CFG.minScrollShow) bar.classList.add("on");
    else if (y <= CFG.minScrollHide) bar.classList.remove("on");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  // first paint
  onScroll();

  // ---------- Small toast ----------
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.style.cssText = `
        position:fixed; left:50%; bottom:calc(16px + env(safe-area-inset-bottom,0px));
        transform:translateX(-50%); background:rgba(0,0,0,.85); color:#fff; padding:.4rem .7rem;
        border-radius:999px; font-size:.9rem; z-index: calc(var(--share-bar-z) + 3);
        opacity:0; transition:opacity .2s ease; pointer-events:none`;
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    clearTimeout(toastT);
    toastEl.style.opacity = "1";
    toastT = setTimeout(() => (toastEl.style.opacity = "0"), 1200);
  }
  function promptCopyFallback() {
    window.prompt("Copy this link:", url);
  }

  // ---------- Focus trap for modal ----------
  let lastFocus, trapHandler;
  function trapFocus(scope) {
    lastFocus = document.activeElement;
    trapHandler = function (e) {
      if (e.key !== "Tab") return;
      const f = scope.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    };
    document.addEventListener("keydown", trapHandler);
  }
  function releaseFocus() {
    if (trapHandler) document.removeEventListener("keydown", trapHandler);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ---------- External links safety (defensive) ----------
  document.addEventListener("click", function (e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    try {
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    } catch (_) {}
  }, { capture: true });
})();
