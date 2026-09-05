// The fourteen PWA companions: promise wording unchanged, every page names its registry slug, the
// relay is the only new connect-src, and the usage module loads before companion.js. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { patchCompanion, RELAY_ORIGIN, RELAY_ENDPOINT } from '../../../admin/scripts/instrument-voyage-companions.mjs';

const ROOT = new URL('../../../', import.meta.url);
const packs = JSON.parse(await readFile(new URL('admin/voyage-packs/packs.json', ROOT), 'utf8'));
const companions = packs.filter((p) => p.pwa);

test('the "No tracking" promise is byte-for-byte present in every companion and in the shared default', async () => {
  const files = (await readdir(new URL('admin/voyage-pwa/', ROOT))).filter((f) => f.endsWith('.html'));
  assert.ok(files.length >= 14, `expected at least 14 companion pages, found ${files.length}`);
  for (const f of files) {
    const html = await readFile(new URL('admin/voyage-pwa/' + f, ROOT), 'utf8');
    assert.ok(html.includes('No tracking, no ads, not a financial product.'), `${f} lost the footer promise`);
  }
  const js = await readFile(new URL('admin/voyage-pwa/companion.js', ROOT), 'utf8');
  assert.ok(js.includes('No tracking, no ads, not a financial product.'), 'companion.js default footer changed');
});

test('every registered companion carries its slug, the relay in connect-src, and the module before companion.js', async () => {
  for (const p of companions) {
    const html = await readFile(new URL(p.pwa, ROOT), 'utf8');
    assert.ok(html.includes(`window.__VOYAGE={slug:"${p.slug}",`), `${p.pwa} slug`);
    const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)[1];
    const connect = csp.split(';').find((d) => d.trim().startsWith('connect-src'));
    assert.ok(connect.includes(RELAY_ORIGIN), `${p.pwa} connect-src lacks the relay`);
    assert.ok(!connect.includes('umami'), `${p.pwa} must not talk to Umami directly`);
    const iEndpoint = html.indexOf(RELAY_ENDPOINT);
    const iModule = html.indexOf('/assets/js/voyage-usage.js');
    const iCompanion = html.indexOf('/admin/voyage-pwa/companion.js');
    assert.ok(iEndpoint > 0 && iEndpoint < iModule && iModule < iCompanion, `${p.pwa} script order`);
    assert.equal((html.match(/voyage-usage\.js/g) || []).length, 1, `${p.pwa} module included once`);
    assert.ok(p.instrumented.pwa, `${p.slug} registry flag not flipped`);
  }
});

test('patchCompanion is idempotent and refuses a page that already names a different slug', () => {
  const page = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; connect-src https://api.open-meteo.com https://api.rainviewer.com https://api.weather.gov; font-src \'self\'">\n<script>window.__VOYAGE={ship:"X"};</script>\n<script src="/admin/voyage-pwa/companion.js" defer></script>';
  const once = patchCompanion(page, 'v0.1.9-x');
  assert.deepEqual(once.changed, ['csp', 'slug', 'module']);
  const twice = patchCompanion(once.html, 'v0.1.9-x');
  assert.deepEqual(twice.changed, []);
  assert.equal(twice.html, once.html);
  assert.throws(() => patchCompanion(once.html, 'v0.1.9-other'), /different slug/);
});

test('the service worker precaches the usage module and keeps its scope discipline', async () => {
  const sw = await readFile(new URL('admin/voyage-pwa/sw.js', ROOT), 'utf8');
  assert.ok(sw.includes('const CACHE = "voyage-v5"'), 'cache name bumped');
  assert.ok(sw.includes('"/assets/js/voyage-usage.js"') || sw.includes('USAGE_MODULE = "/assets/js/voyage-usage.js"'));
  assert.ok(sw.includes('url.pathname === USAGE_MODULE'), 'cacheable() allows exactly that path');
  assert.ok(!sw.includes('usage.cruisinginthewake.com'), 'the relay is never cached');
});
