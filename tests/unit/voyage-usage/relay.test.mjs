// Geo-blind relay: the stated claim is "nothing about the traveler reaches Umami".
// Read what the Worker sends OUT, literally. Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle, scrub, coarsePlace } from '../../../admin/voyage-usage-relay/worker.js';

function req(body, { method = 'POST', path = '/send', headers = {}, cf } = {}) {
  const r = new Request('https://usage.example.test' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
  if (cf) Object.defineProperty(r, 'cf', { value: cf });
  return r;
}
function capture() {
  const out = [];
  const fetchFn = async (url, init) => { out.push({ url, init, body: JSON.parse(init.body) }); return { ok: true, status: 200 }; };
  return { out, fetchFn };
}

test('scrub: unknown events, unknown keys, and a malformed slug are refused', () => {
  assert.equal(scrub({ name: 'pageview', data: { pack: 'v0.1-x' } }), null);
  assert.equal(scrub({ name: 'vp_pwa_open', data: { pack: 'not-a-slug' } }), null);
  assert.equal(scrub(null), null);
  assert.equal(scrub([]), null);
  const ok = scrub({ name: 'vp_pwa_open', data: { pack: 'v0.1.9-x', name: 'Jane', ip: '1.2.3.4', city: 'Hudson', phase: 'during' } });
  assert.deepEqual(ok, { name: 'vp_pwa_open', data: { pack: 'v0.1.9-x', phase: 'during' } });
});

test('a client cannot claim a place: country/region in the body are dropped, cf metadata wins', async () => {
  const { out, fetchFn } = capture();
  const r = await handle(req({ name: 'vp_pwa_open', data: { pack: 'v0.1.9-x', country: 'ZZ', region: 'Nowhere', city: 'Hudson' } }, { cf: { country: 'US', region: 'Florida', city: 'Hudson' } }), {}, { fetchFn });
  assert.equal(r.status, 204);
  assert.deepEqual(out[0].body.payload.data, { pack: 'v0.1.9-x', country: 'US', region: 'Florida' });
});

test('nothing about the traveler reaches Umami: spoofed IP header, real UA, city all discarded', async () => {
  const { out, fetchFn } = capture();
  const r = await handle(req({ name: 'vp_pwa_session', data: { pack: 'v0.1.9-x', tabs: 'now,radar', day: 4 } }, {
    headers: { 'X-Forwarded-For': '203.0.113.9', 'CF-Connecting-IP': '203.0.113.9', 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
    cf: { country: 'US', region: 'Florida', city: 'Hudson', latitude: '28.36', longitude: '-82.69' },
  }), {}, { fetchFn });
  assert.equal(r.status, 204);
  const { url, init, body } = out[0];
  assert.equal(url, 'https://cloud.umami.is/api/send');
  const hdrs = Object.fromEntries(Object.entries(init.headers).map(([k, v]) => [k.toLowerCase(), v]));
  assert.equal(hdrs['x-forwarded-for'], undefined);
  assert.equal(hdrs['cf-connecting-ip'], undefined);
  assert.match(hdrs['user-agent'], /^itw-voyage-usage-relay\//);
  const text = JSON.stringify(body);
  assert.ok(!text.includes('203.0.113.9'));
  assert.ok(!text.includes('Hudson'));
  assert.ok(!text.includes('28.36'));
  assert.ok(!text.includes('iPhone'));
  assert.deepEqual(Object.keys(body.payload.data).sort(), ['country', 'day', 'pack', 'region', 'tabs']);
  assert.equal(body.payload.url, '/admin/voyage-pwa/v0.1.9-x');
});

test('daily dial off by default: no sitting_key without RELAY_SECRET', async () => {
  const { out, fetchFn } = capture();
  await handle(req({ name: 'vp_pwa_open', data: { pack: 'v0.1.9-x' } }, { headers: { 'CF-Connecting-IP': '203.0.113.9' } }), {}, { fetchFn });
  assert.equal(out[0].body.payload.data.sitting_key, undefined);
});

test('daily dial on: sitting_key is stable within a day and different across days, and is not the IP', async () => {
  const env = { RELAY_SECRET: 's3cret' };
  const mk = (now) => { const { out, fetchFn } = capture(); return handle(req({ name: 'vp_pwa_open', data: { pack: 'v0.1.9-x' } }, { headers: { 'CF-Connecting-IP': '203.0.113.9', 'User-Agent': 'UA' } }), env, { fetchFn, now }).then(() => out[0].body.payload.data.sitting_key); };
  const a = await mk(Date.UTC(2026, 8, 27, 10));
  const b = await mk(Date.UTC(2026, 8, 27, 22));
  const c = await mk(Date.UTC(2026, 8, 28, 1));
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.ok(!a.includes('203'));
});

test('wrong method or path is 404; malformed body is 400; nothing is forwarded either way', async () => {
  const { out, fetchFn } = capture();
  assert.equal((await handle(req(null, { method: 'GET' }), {}, { fetchFn })).status, 404);
  assert.equal((await handle(req({ name: 'vp_pwa_open', data: { pack: 'v0.1.9-x' } }, { path: '/other' }), {}, { fetchFn })).status, 404);
  assert.equal((await handle(req('{not json', {}), {}, { fetchFn })).status, 400);
  assert.equal(out.length, 0);
});

test('OPTIONS preflight allows only the site origin', async () => {
  const r = await handle(req(null, { method: 'OPTIONS' }), {});
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://cruisinginthewake.com');
});

test('an Umami failure is reported as 502, never as success', async () => {
  const fetchFn = async () => ({ ok: false, status: 500 });
  const r = await handle(req({ name: 'vp_pwa_open', data: { pack: 'v0.1.9-x' } }), {}, { fetchFn });
  assert.equal(r.status, 502);
});

test('coarsePlace never returns a city and validates the country code shape', () => {
  assert.deepEqual(coarsePlace({ country: 'US', region: 'Florida', city: 'Hudson' }), { country: 'US', region: 'Florida' });
  assert.deepEqual(coarsePlace({ country: 'usa' }), {});
  assert.deepEqual(coarsePlace(undefined), {});
});
