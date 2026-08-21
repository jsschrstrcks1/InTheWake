/* In the Wake — Family pages: service-worker registration (shared by the
   Past/Future cruise pages, whose CSP allows no inline script). Soli Deo Gloria. */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/admin/family/sw-family.js", { scope: "/admin/family/" }).catch(function () {});
}
window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.__bip = e; });
window.addEventListener("appinstalled", function () { window.__bip = null; });
