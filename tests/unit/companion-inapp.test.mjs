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

// THE COPY BUTTON MUST ALWAYS ANSWER (2026-10-16). In Facebook's Android browser the Copy link button did
// nothing: the old code waited on navigator.clipboard.writeText, which a WebView can leave unanswered, and
// only then fell back. These run copyPageLink against a fake page and pin the three ways it can go.
function copyHarness({ exec, clip }) {
  const start = src.indexOf('function legacyCopy(');
  const end = src.indexOf('var INAPP_STEPS=');
  assert.ok(start > 0 && end > start, 'companion.js defines legacyCopy() and copyPageLink()');
  const body = src.slice(start, end) + fn('cleanPageLink');
  const el = () => ({ children: [], style: {}, textContent: '', parentNode: null, setAttribute() {}, addEventListener() {},
    focus() {}, select() {}, setSelectionRange() {}, appendChild(c) { this.children.push(c); c.parentNode = this; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); } });
  const document = { activeElement: null, body: el(), createElement: el, createTextNode: (t) => ({ text: t }),
    execCommand: () => exec };
  const writeText = clip === 'hang' ? () => new Promise(() => {}) : clip === 'reject' ? () => Promise.reject(new Error('denied')) : () => Promise.resolve();
  const navigator = { clipboard: { writeText } };
  const location = { href: 'https://cruisinginthewake.com/admin/voyage-pwa/x.html?fbclid=IwAR0abc' };
  // eslint-disable-next-line no-new-func
  const copy = Function('document', 'navigator', 'location', 'setTimeout', 'clearTimeout', body + '; return copyPageLink;')(document, navigator, location, setTimeout, clearTimeout);
  const msg = el();
  return { msg, run: () => copy(msg) };
}
const said = (msg) => msg.children.filter((c) => c.text).map((c) => c.text).join('');
const box = (msg) => msg.children.find((c) => c.className === 'inapp-link');

test('copy: the textarea copy runs first, inside the tap, and the link is still shown', () => {
  const h = copyHarness({ exec: true, clip: 'hang' });
  h.run();
  assert.match(said(h.msg), /^Link copied/);
  assert.equal(box(h.msg).value, 'https://cruisinginthewake.com/admin/voyage-pwa/x.html');
});

test('copy TEETH: a clipboard that never answers still ends in a link to press and hold', async () => {
  const h = copyHarness({ exec: false, clip: 'hang' });
  h.run();
  assert.equal(h.msg.children.length, 0, 'nothing is claimed before the time limit');
  await new Promise((r) => setTimeout(r, 1700));
  assert.match(said(h.msg), /wouldn't let the button copy/);
  assert.equal(box(h.msg).value, 'https://cruisinginthewake.com/admin/voyage-pwa/x.html');
});

test('copy: a refused clipboard falls back at once, and a working one reports success', async () => {
  const refused = copyHarness({ exec: false, clip: 'reject' });
  refused.run();
  await new Promise((r) => setTimeout(r, 20));
  assert.match(said(refused.msg), /wouldn't let the button copy/);
  const ok = copyHarness({ exec: false, clip: 'ok' });
  ok.run();
  await new Promise((r) => setTimeout(r, 20));
  assert.match(said(ok.msg), /^Link copied/);
  assert.ok(box(ok.msg));
});
