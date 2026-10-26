// The phone and the relay must agree on what an event looks like. Soli Deo Gloria.
// tracker.test.mjs and relay.test.mjs each passed on their own for a month while the phone sent
// Umami's envelope and the relay expected {name, data}: every companion event got a 400 and was
// dropped (found 2026-10-05 from a browser console). This test runs the phone's real output
// through the relay's real handler, so the two sides cannot drift apart again unnoticed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { handle } from '../../../admin/voyage-usage-relay/worker.js';

const SRC = await readFile(new URL('../../../assets/js/voyage-usage.js', import.meta.url), 'utf8');

// A companion page as it ships: the relay endpoint set, online, no Do-Not-Track.
function companionPhone() {
  const store = new Map();
  const sent = [];
  const w = {
    ITW_USAGE_ENDPOINT: 'https://usage.cruisinginthewake.com/send',
    navigator: { onLine: true, doNotTrack: '0', globalPrivacyControl: false, language: 'en-US' },
    location: { protocol: 'https:', hostname: 'cruisinginthewake.com', pathname: '/admin/voyage-pwa/x.html' },
    document: { title: 'x', visibilityState: 'visible', readyState: 'complete' },
    screen: { width: 390, height: 844 },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => { store.set(k, String(v)); } },
    addEventListener: () => {},
    fetch: (url, opts) => { sent.push({ url, body: opts.body }); return Promise.resolve({ ok: true, status: 204 }); },
  };
  w.window = w;
  vm.runInNewContext(SRC, { window: w, Date, JSON, Object, String, Promise });
  return { w, sent };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

async function relay(bodyText) {
  const out = [];
  const fetchFn = async (url, init) => { out.push(JSON.parse(init.body)); return { ok: true, status: 200, text: async () => '{}', json: async () => ({}) }; };
  const req = new Request('https://usage.cruisinginthewake.com/send', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: bodyText,
  });
  const res = await handle(req, {}, { fetchFn });
  return { status: res.status, out };
}

for (const [name, data] of [
  ['vp_pwa_open', { pack: 'v0.1.19-msc-world-america-family-dec-2026', standalone: true, offline: false, phase: 'before', day: 0 }],
  ['vp_pwa_session', { pack: 'v0.1.9-ncl-prima-solo-group-sep-2026', tabs: 'overview,voyage,now' }],
  ['vp_pwa_install', { pack: 'v0.1.19-msc-world-america-family-dec-2026' }],
]) {
  test(`${name} from a companion is accepted by the relay and forwarded to Umami`, async () => {
    const { w, sent } = companionPhone();
    w.ITW_USAGE.track(name, data);
    await tick();
    assert.equal(sent.length, 1, 'the phone sent one event');
    const { status, out } = await relay(sent[0].body);
    assert.notEqual(status, 400, 'the relay did not reject the phone\'s event as malformed');
    assert.equal(out.length, 1, 'the relay forwarded it');
    assert.equal(out[0].payload.name, name);
    assert.equal(out[0].payload.data.pack, data.pack);
  });
}
