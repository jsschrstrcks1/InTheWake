/**
 * In-App Browser Escape Banner
 * Detects Facebook/Instagram in-app browsers and shows a helpful banner
 * with instructions to open in the device's default browser.
 *
 * @version 1.0.0
 */

(function() {
  'use strict';

  // Check if we've already shown/dismissed the banner this session
  var DISMISSED_KEY = 'inAppBannerDismissed';

  /**
   * Detect if we're in an in-app browser (Facebook, Instagram, etc.)
   */
  function isInAppBrowser() {
    var ua = navigator.userAgent || navigator.vendor || window.opera || '';

    // Facebook in-app browser
    if (/FBAN|FBAV/.test(ua)) return 'facebook';

    // Instagram in-app browser
    if (/Instagram/.test(ua)) return 'instagram';

    // LinkedIn in-app browser
    if (/LinkedInApp/.test(ua)) return 'linkedin';

    // Twitter/X in-app browser
    if (/Twitter/.test(ua)) return 'twitter';

    // Generic WebView detection (less reliable)
    if (/; wv\)/.test(ua) || /WebView/.test(ua)) return 'webview';

    return false;
  }

  /**
   * Get platform-specific instructions
   */
  function getInstructions(browser) {
    var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    var isAndroid = /Android/.test(navigator.userAgent);

    if (browser === 'facebook' || browser === 'instagram') {
      if (isIOS || isAndroid) {
        return 'Tap <strong>⋯</strong> (bottom right) → <strong>"Open in Browser"</strong>';
      }
    }

    if (browser === 'linkedin') {
      return 'Tap <strong>⋯</strong> → <strong>"Open in browser"</strong>';
    }

    // Generic fallback
    return 'Look for <strong>⋯</strong> menu → <strong>"Open in Browser"</strong>';
  }

  /**
   * Create and show the banner
   */
  function showBanner(browser) {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    var instructions = getInstructions(browser);
    var appName = browser.charAt(0).toUpperCase() + browser.slice(1);

    // Create banner element
    var banner = document.createElement('div');
    banner.id = 'in-app-browser-banner';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');

    banner.innerHTML =
      '<div class="iab-content">' +
        '<span class="iab-icon">🌐</span>' +
        '<div class="iab-text">' +
          '<strong>For the best experience, open in your browser</strong>' +
          '<span class="iab-instructions">' + instructions + '</span>' +
        '</div>' +
        '<button class="iab-dismiss" aria-label="Dismiss banner" title="Dismiss">✕</button>' +
      '</div>';

    // Add styles
    var style = document.createElement('style');
    style.textContent =
      '#in-app-browser-banner {' +
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'right: 0;' +
        'z-index: 99999;' +
        'background: linear-gradient(135deg, #1a535c 0%, #0e6e8e 100%);' +
        'color: #fff;' +
        'font-family: system-ui, -apple-system, sans-serif;' +
        'font-size: 14px;' +
        'box-shadow: 0 2px 12px rgba(0,0,0,0.25);' +
        'animation: iabSlideIn 0.3s ease-out;' +
      '}' +
      '@keyframes iabSlideIn {' +
        'from { transform: translateY(-100%); opacity: 0; }' +
        'to { transform: translateY(0); opacity: 1; }' +
      '}' +
      '.iab-content {' +
        'display: flex;' +
        'align-items: center;' +
        'gap: 12px;' +
        'padding: 12px 16px;' +
        'max-width: 100%;' +
      '}' +
      '.iab-icon {' +
        'font-size: 24px;' +
        'flex-shrink: 0;' +
      '}' +
      '.iab-text {' +
        'flex: 1;' +
        'min-width: 0;' +
        'line-height: 1.4;' +
      '}' +
      '.iab-text strong {' +
        'display: block;' +
        'margin-bottom: 2px;' +
      '}' +
      '.iab-instructions {' +
        'display: block;' +
        'font-size: 13px;' +
        'opacity: 0.9;' +
      '}' +
      '.iab-dismiss {' +
        'background: rgba(255,255,255,0.2);' +
        'border: none;' +
        'color: #fff;' +
        'width: 32px;' +
        'height: 32px;' +
        'border-radius: 50%;' +
        'font-size: 18px;' +
        'cursor: pointer;' +
        'flex-shrink: 0;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'transition: background 0.2s;' +
      '}' +
      '.iab-dismiss:hover, .iab-dismiss:focus {' +
        'background: rgba(255,255,255,0.35);' +
      '}' +
      /* Add body padding when banner is shown */
      'body.has-iab-banner {' +
        'padding-top: 72px !important;' +
      '}' +
      '@media (max-width: 480px) {' +
        '.iab-content { padding: 10px 12px; gap: 10px; }' +
        '.iab-icon { font-size: 20px; }' +
        '#in-app-browser-banner { font-size: 13px; }' +
        'body.has-iab-banner { padding-top: 80px !important; }' +
      '}';

    document.head.appendChild(style);
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('has-iab-banner');

    // Dismiss handler
    banner.querySelector('.iab-dismiss').addEventListener('click', function() {
      banner.style.animation = 'none';
      banner.style.transform = 'translateY(-100%)';
      banner.style.transition = 'transform 0.2s ease-in';

      setTimeout(function() {
        banner.remove();
        document.body.classList.remove('has-iab-banner');
      }, 200);

      sessionStorage.setItem(DISMISSED_KEY, '1');
    });
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    var browser = isInAppBrowser();
    if (browser) {
      showBanner(browser);

      // Also add class to html for CSS targeting
      document.documentElement.classList.add('in-app-browser');
      document.documentElement.classList.add('in-app-' + browser);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
