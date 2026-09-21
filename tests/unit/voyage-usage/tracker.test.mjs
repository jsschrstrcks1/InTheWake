// assets/js/voyage-usage.js — the stated claim is "nothing personal leaves the device".
// These tests read the queued payload literally rather than trusting the whitelist by name.
// Soli Deo Gloria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const SRC = await readFile(new URL('../../../assets/js/voyage-usage.js', import.meta.url), 'utf8');

function makeWindow({ online = true, dnt = '0', gpc = false, umami = null, fetchImpl, protocol = 'https:' } = {}) {
  const store = new Map();
  const listeners = {};
  const sent = [];
  const w = {
    ITW_USAGE_ENDPOINT: 'https://usage.example.test/send',
    navigator: { onLine: online, doNotTrack: dnt, globalPrivacyControl: gpc, language: 'en-US' },
    location: { protocol, hostname: 'cruisinginthewake.com', pathname: '/admin/voyage-pwa/x.html' },
    document: { title: 'x', visibilityState: 'visible', readyState: 'complete' },
    screen: { width: 390, height: 844 },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
    },
    addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
    fetch: fetchImpl || ((url, opts) => { sent.push({ url, body: JSON.parse(opts.body) }); return Promise.resolve({ ok: true, status: 200 }); }),
    umami,
  };
  w.window = w;
  vm.runInNewContext(SRC, { window: w, Date, JSON, Object, String, Promise });
  return { w, sent, store, listeners, fire: (ev) => (listeners[ev] || []).forEach((fn) => fn()) };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

test('only whitelisted properties survive; personal-looking keys are dropped', async () => {
  const { w, sent } = makeWindow();
  w.ITW_USAGE.track('vp_pwa_open', { pack: 'v0.1.9-x', name: 'Jane', phone: '555-0100', email: 'j@x', ip: '1.2.3.4', lat: 28.3, phase: 'during', day: 4 });
  await tick();
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].body.payload.data, { pack: 'v0.1.9-x', phase: 'during', day: '4' });
  assert.equal(sent[0].body.payload.name, 'vp_pwa_open');
  assert.equal(sent[0].url, 'https://usage.example.test/send');
});

test('a prototype-polluting key cannot smuggle a property', async () => {
  const { w, sent } = makeWindow();
  const data = JSON.parse('{"pack":"v0.1.9-x","__proto__":{"tabs":"radar"},"constructor":"x"}');
  w.ITW_USAGE.track('vp_pwa_session', data);
  await tick();
  assert.deepEqual(sent[0].body.payload.data, { pack: 'v0.1.9-x' });
});

test('values are strings capped at 64 characters; markup is inert data', async () => {
  const { w, sent } = makeWindow();
  w.ITW_USAGE.track('vp_pwa_tab', { pack: '<script>alert(1)</script>' + 'a'.repeat(100), tabs: 12 });
  await tick();
  const d = sent[0].body.payload.data;
  assert.equal(d.pack.length, 64);
  assert.equal(typeof d.tabs, 'string');
});

test('Do-Not-Track: nothing sent, nothing stored', async () => {
  const { w, sent, store } = makeWindow({ dnt: '1' });
  w.ITW_USAGE.track('vp_pwa_open', { pack: 'v0.1.9-x' });
  await tick();
  assert.equal(sent.length, 0);
  assert.equal(store.size, 0);
});

test('Global Privacy Control: nothing sent, nothing stored', async () => {
  const { w, sent, store } = makeWindow({ gpc: true });
  w.ITW_USAGE.track('vp_pwa_open', { pack: 'v0.1.9-x' });
  await tick();
  assert.equal(sent.length, 0);
  assert.equal(store.size, 0);
});

test('offline: events queue in order and flush when the network returns', async () => {
  const { w, sent, fire } = makeWindow({ online: false });
  w.ITW_USAGE.track('vp_pwa_open', { pack: 'v0.1.9-x', day: 3 });
  w.ITW_USAGE.track('vp_pwa_session', { pack: 'v0.1.9-x', tabs: 'now,radar' });
  await tick();
  assert.equal(sent.length, 0);
  assert.equal(w.ITW_USAGE._queue().length, 2);
  w.navigator.onLine = true;
  fire('online');
  await tick();
  assert.deepEqual(sent.map((s) => s.body.payload.name), ['vp_pwa_open', 'vp_pwa_session']);
  assert.equal(w.ITW_USAGE._queue().length, 0);
});

test('a failed send is re-queued, not lost', async () => {
  let fail = true;
  const sent = [];
  const fetchImpl = (url, opts) => { if (fail) return Promise.reject(new Error('down')); sent.push(JSON.parse(opts.body)); return Promise.resolve({ ok: true, status: 200 }); };
  const { w, fire } = makeWindow({ fetchImpl });
  w.ITW_USAGE.track('vp_pwa_open', { pack: 'v0.1.9-x' });
  await tick();
  assert.equal(w.ITW_USAGE._queue().length, 1);
  fail = false;
  fire('online');
  await tick();
  assert.equal(sent.length, 1);
  assert.equal(w.ITW_USAGE._queue().length, 0);
});

test('the queue is capped at 200, oldest dropped', async () => {
  const { w } = makeWindow({ online: false });
  for (let i = 0; i < 230; i++) w.ITW_USAGE.track('vp_pwa_open', { pack: 'v0.1.9-x', day: i });
  const q = w.ITW_USAGE._queue();
  assert.equal(q.length, 200);
  assert.equal(q[0].data.day, '30');
});

test('event names must match vp_[a-z_] and fit the 50-character limit', async () => {
  const { w, sent } = makeWindow();
  w.ITW_USAGE.track('pageview', { pack: 'x' });
  w.ITW_USAGE.track('vp_' + 'a'.repeat(60), { pack: 'x' });
  w.ITW_USAGE.track('vp_Upper', { pack: 'x' });
  await tick();
  assert.equal(sent.length, 0);
});

test('when Umami\'s own tracker is present, events go through it instead of fetch', async () => {
  const calls = [];
  const { w, sent } = makeWindow({ umami: { track: (n, d) => calls.push([n, d]) } });
  w.ITW_USAGE.track('vp_buy_click', { pack: 'v0.1-x', price: 19 });
  await tick();
  assert.equal(sent.length, 0);
  assert.deepEqual(calls, [['vp_buy_click', { pack: 'v0.1-x', price: '19' }]]);
});

test('a file: page sends nothing (a saved copy is not the site)', async () => {
  const { w, sent, store } = makeWindow({ protocol: 'file:' });
  w.ITW_USAGE.track('vp_pwa_open', { pack: 'v0.1.9-x' });
  await tick();
  assert.equal(sent.length, 0);
  assert.equal(store.size, 0);
});
