// Opened from Facebook: the companion tells the traveler to reopen it in Safari or Chrome. Soli Deo Gloria.
// Facebook, Messenger and Instagram open links in their own built-in browser, which cannot add a page to
// the home screen. Pinned 2026-10-05 when the notice was added: the detection must catch those three and
// must not fire in Safari, Chrome or Firefox, and the link it copies must drop Facebook's fbclid.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const pwa = new URL('../../admin/voyage-pwa/', import.meta.url);
const src = readFileSync(new URL('companion.js', pwa), 'utf8');

function fn(name) {
  const m = src.match(new RegExp('function ' + name + '\\(\\)\\{.*\\}', 'm'));
  assert.ok(m, `companion.js defines ${name}()`);
  return m[0];
}

function inAppFor(ua) {
  // eslint-disable-next-line no-new-func
  return Function('navigator', fn('inAppBrowser') + '; return inAppBrowser();')({ userAgent: ua });
}

function cleanLinkFor(href) {
  // eslint-disable-next-line no-new-func
  return Function('location', fn('cleanPageLink') + '; return cleanPageLink();')({ href });
}

const IN_APP = {
  'Facebook, iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.40.94;FBBV/600000000;FBDV/iPhone15,2]',
  'Facebook, Android': 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.82 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/460.0.0.48.109;]',
  'Messenger, iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/450.0.0.40.109;FBDV/iPhone15,2]',
  'Instagram, iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.27.92 (iPhone15,2; iOS 17_5; en_US)',
};
const REAL_BROWSERS = {
  'Safari, iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Chrome, Android': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
  'Chrome, iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
  'Firefox, Android': 'Mozilla/5.0 (Android 14; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0',
};

test('Facebook, Messenger and Instagram browsers are recognized', () => {
  for (const [name, ua] of Object.entries(IN_APP)) assert.equal(inAppFor(ua), true, name);
});

test('Safari, Chrome and Firefox are not mistaken for an in-app browser', () => {
  for (const [name, ua] of Object.entries(REAL_BROWSERS)) assert.equal(inAppFor(ua), false, name);
  assert.equal(inAppFor(''), false, 'an empty user agent');
});

test('the copied link drops fbclid and the fragment and keeps everything else', () => {
  const base = 'https://cruisinginthewake.com/admin/voyage-pwa/world-america-family-dec-2026.html';
  assert.equal(cleanLinkFor(base + '?fbclid=IwAR0abc'), base);
  assert.equal(cleanLinkFor(base + '?fbclid=IwAR0abc#faq'), base);
  assert.equal(cleanLinkFor(base + '?day=3&fbclid=IwAR0abc'), base + '?day=3');
  assert.equal(cleanLinkFor(base), base);
});

test('every companion page loads the companion version the service worker caches', () => {
  const sw = readFileSync(new URL('sw.js', pwa), 'utf8');
  const cache = sw.match(/const CACHE = "voyage-v(\d+)"/);
  assert.ok(cache, 'sw.js names its cache');
  const v = cache[1];
  assert.match(sw, new RegExp(`companion\\.js\\?v=${v}"`), 'sw.js precaches companion.js at the cache version');
  assert.match(sw, new RegExp(`companion\\.css\\?v=${v}"`), 'sw.js precaches companion.css at the cache version');
  for (const f of readdirSync(pwa).filter((x) => x.endsWith('.html'))) {
    const html = readFileSync(new URL(f, pwa), 'utf8');
    for (const m of html.matchAll(/companion\.(js|css)\?v=(\d+)/g)) {
      assert.equal(m[2], v, `${f}: companion.${m[1]} is v=${m[2]}, cache is v${v}`);
    }
  }
});
