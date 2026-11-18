// Tests for the data-key tools: jerusha-keys.mjs, jerusha-rekey.mjs and the rotate / drop-legacy / build
// commands of jerusha-payload.mjs.   Run: node --test admin/jerusha-worker/jerusha-rekey.test.mjs
//
// Nothing here touches a live service. The REAL worker.js runs behind a local HTTP server with in-memory
// storage, so the tools speak to it over a real socket with the real fetch, headers and all. The page gate
// and payload are small fixtures built in a temp folder. Every passphrase, token and note below is made up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import worker from './worker.js';
import * as K from './jerusha-keys.mjs';
import { run } from './jerusha-rekey.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOKEN = 'test-token-not-a-real-one';
const SALT = K.b64e(new TextEncoder().encode('fixture-notes-salt'));
const OLD_PASS = 'old fixture phrase', NEW_PASS = 'new fixture phrase';

/* ---------- in-memory Worker storage (same shapes as worker.test.mjs) ---------- */
class MockKV {
  constructor() { this.m = new Map(); }
  async get(k) { return this.m.has(k) ? this.m.get(k) : null; }
  async put(k, v) { this.m.set(k, String(v)); }
  async delete(k) { this.m.delete(k); }
  async list({ prefix = '', limit = 1000, cursor } = {}) {
    const all = [...this.m.keys()].filter((k) => k.startsWith(prefix)).sort();
    const start = cursor ? Number(String(cursor).slice(1)) : 0;
    const keys = all.slice(start, start + Math.min(limit, 1000)).map((name) => ({ name }));
    const end = start + keys.length;
    return end >= all.length ? { keys, list_complete: true } : { keys, list_complete: false, cursor: 'c' + end };
  }
}
class MockR2 {
  constructor() { this.m = new Map(); }
  async put(k, body) { this.m.set(k, new Uint8Array(await new Response(body).arrayBuffer())); }
  async get(k) { return this.m.has(k) ? { body: this.m.get(k) } : null; }
  async head(k) { return this.m.has(k) ? { key: k } : null; }
  async delete(k) { this.m.delete(k); }
}

// The real worker behind a real socket. `hook(req)` may return a Response to answer instead of the worker,
// or change storage before the worker runs: that is how the fault tests inject a fault.
async function serve(t, env, hook) {
  const server = http.createServer(async (rq, rs) => {
    const chunks = []; for await (const c of rq) chunks.push(c);
    const body = Buffer.concat(chunks);
    const headers = new Headers(); for (const [k, v] of Object.entries(rq.headers)) headers.set(k, String(v));
    const req = new Request('http://worker.test' + rq.url, { method: rq.method, headers, body: body.length ? body : undefined });
    let res = hook ? await hook(req, body) : null;
    if (!res) res = await worker.fetch(req, env);
    rs.writeHead(res.status, Object.fromEntries(res.headers));
    rs.end(Buffer.from(await res.arrayBuffer()));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  t.after(() => new Promise((r) => { server.closeAllConnections(); server.close(r); }));
  return 'http://127.0.0.1:' + server.address().port;
}

/* ---------- fixtures ---------- */
const tmp = (t) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'jerusha-rekey-')); t.after(() => fs.rmSync(d, { recursive: true, force: true })); return d; };
const payloadSrc = (ring, base) => '<script>\nvar NOTES_WORKER="' + base + '/notes";\nvar NOTES_TOKEN="' + TOKEN + '";\nvar NOTES_SALT="' + SALT + '";\nvar DATA_KEYS=[' + ring.map((k) => '"' + k + '"').join(',') + '];\n</script>\n';
const tsOf = (i) => new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString();
const bytesOf = (n, seed) => { const u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = (i * 31 + seed) & 255; return u; };

async function seed(env, key, { notes = [], media = [] }) {
  let i = env.NOTES.m.size;
  for (const n of notes) {
    const e = await K.encNote(key, n.text), ts = tsOf(i++);
    env.NOTES.m.set('note:' + ts + '-' + n.id, JSON.stringify({ v: 1, id: n.id, sender: n.sender || 'me', ts, iv: e.iv, ct: e.ct }));
  }
  for (const m of media) {
    const ts = tsOf(i++);
    env.MEDIA.m.set('media/' + m.id, await K.encBytesLike(key, { chunked: m.chunks.length > 1, chunks: m.chunks }));
    env.NOTES.m.set('media:' + ts + '-' + m.id, JSON.stringify({ v: 1, id: m.id, kind: 'photo', mime: 'image/webp', lat: 1.5, lon: 2.5, day: '2026-01-02', by: 'jerusha', ts }));
  }
}
const snapshot = (env) => JSON.stringify([[...env.NOTES.m].sort(), [...env.MEDIA.m].map(([k, v]) => [k, Buffer.from(v).toString('base64')]).sort()]);
async function readAll(env, keyB64) {
  const key = await K.importRaw(keyB64), out = { notes: {}, media: {} };
  for (const [k, v] of env.NOTES.m) if (k.startsWith('note:')) { const r = JSON.parse(v); out.notes[r.id] = (await K.decNoteAny([key], r.iv, r.ct)).text; }
  for (const [k, v] of env.MEDIA.m) out.media[k.slice(6)] = await K.digestChunks((await K.decBytesAny([key], v)).chunks);
  return out;
}
// A thread written by the page as it was BEFORE any rotation, and the ring the first rotation produces for it.
async function world(t, extra) {
  const env = { NOTES: new MockKV(), MEDIA: new MockR2(), NOTES_TOKEN: TOKEN };
  const legacyRaw = K.b64e(await K.deriveRaw(OLD_PASS, SALT));
  const pageKey = await K.deriveKey(OLD_PASS, SALT); // exactly how the old page made its key
  const small = [bytesOf(900, 3)], chunked = [bytesOf(5000, 7), bytesOf(5000, 9), bytesOf(123, 11)];
  await seed(env, pageKey, { notes: [{ id: 'n-a', text: 'first fixture note' }, { id: 'n-b', text: 'second, with ünïcode 💛', sender: 'jerusha' }], media: [{ id: 'm-small', chunks: small }, { id: 'm-chunked', chunks: chunked }] });
  const ring = [K.newKeyB64(), legacyRaw];
  await seed(env, await K.importRaw(ring[0]), { notes: [{ id: 'n-new', text: 'already on the new key' }] });
  const want = { notes: { 'n-a': 'first fixture note', 'n-b': 'second, with ünïcode 💛', 'n-new': 'already on the new key' }, media: { 'm-small': await K.digestChunks(small), 'm-chunked': await K.digestChunks(chunked) } };
  const hook = extra && extra.hook ? (req, body) => extra.hook(req, body, env) : null;
  const base = await serve(t, env, hook);
  return { env, ring, base, want, src: payloadSrc(ring, base), backupDir: tmp(t) };
}
const go = (w, cmd) => run({ cmd, src: w.src, fetch: globalThis.fetch, backupDir: w.backupDir });

/* ---------- the ring in the source ---------- */
test('ring: reads back what it writes, in order', () => {
  const a = K.newKeyB64(), b = K.newKeyB64();
  const src = K.writeRing(payloadSrc([], 'http://x'), [a, b]);
  assert.deepEqual(K.readRing(src), [a, b]);
  assert.deepEqual(K.readRing(K.writeRing(src, [a])), [a]);
  assert.deepEqual(K.readRing(payloadSrc([], 'http://x')), []);
});
test('ring: refuses a source with no ring, two rings, a non-key, or the same key twice', () => {
  const a = K.newKeyB64();
  assert.throws(() => K.readRing('<script>var X=1;</script>'), /exactly one/);
  assert.throws(() => K.readRing(payloadSrc([a], 'http://x') + payloadSrc([a], 'http://x')), /exactly one/);
  assert.throws(() => K.readRing('var DATA_KEYS=["not-a-key"];'), /not a base64 32-byte key/);
  assert.throws(() => K.readRing('var DATA_KEYS=[' + JSON.stringify(a.slice(0, 20)) + '];'), /not a base64 32-byte key/);
  assert.throws(() => K.readRing('var DATA_KEYS=["' + a + '","' + a + '"];'), /twice/);
  assert.throws(() => K.writeConst(payloadSrc([], 'http://x'), 'NOTES_TOKEN', 'a"b'), /quote/);
});

/* ---------- formats ---------- */
test('notes and media: the kept legacy bytes open what the old page derivation sealed', async () => {
  const sealed = await K.encNote(await K.deriveKey(OLD_PASS, SALT), 'hello');
  const legacy = await K.importRaw(K.b64e(await K.deriveRaw(OLD_PASS, SALT)));
  const other = await K.importRaw(K.newKeyB64());
  assert.deepEqual(await K.decNoteAny([other, legacy], sealed.iv, sealed.ct), { text: 'hello', index: 1 });
  await assert.rejects(K.decNoteAny([other], sealed.iv, sealed.ct), /no key/);
});
test('media: small and chunked blobs keep their shape through a re-encrypt; damage is refused', async () => {
  const k1 = await K.importRaw(K.newKeyB64()), k2 = await K.importRaw(K.newKeyB64());
  for (const chunks of [[bytesOf(40, 1)], [bytesOf(3000, 2), bytesOf(3000, 3), bytesOf(7, 4)]]) {
    const a = await K.encBytesLike(k1, { chunked: chunks.length > 1, chunks });
    const d = await K.decBytesAny([k2, k1], a);
    assert.equal(d.index, 1); assert.equal(d.chunked, chunks.length > 1);
    assert.deepEqual(d.chunks.map((c) => c.length), chunks.map((c) => c.length));
    const b = await K.encBytesLike(k2, d);
    assert.equal(b.length, a.length);
    assert.equal(await K.digestChunks((await K.decBytesAny([k2], b)).chunks), await K.digestChunks(chunks));
    await assert.rejects(K.decBytesAny([k1, k2], a.subarray(0, a.length - 1)), /no key/);
    const flipped = Uint8Array.from(a); flipped[flipped.length - 1] ^= 1;
    await assert.rejects(K.decBytesAny([k1, k2], flipped), /no key/);
  }
});

/* ---------- audit and apply ---------- */
test('audit: counts what each key opens and changes nothing', async (t) => {
  const w = await world(t), before = snapshot(w.env);
  const r = await go(w, 'audit');
  assert.deepEqual(r.notes, { total: 3, current: 1, legacy: 2, unreadable: 0, complete: true });
  assert.deepEqual(r.media, { total: 2, current: 0, legacy: 2, unreadable: 0 });
  assert.equal(r.ok, false); assert.deepEqual(r.problems, []);
  assert.equal(snapshot(w.env), before);
  assert.deepEqual(fs.readdirSync(w.backupDir), []);
});
test('apply: everything ends on the current key, same content, same records, originals on disk', async (t) => {
  const w = await world(t);
  const keysBefore = [...w.env.NOTES.m.keys()].sort(), metaBefore = [...w.env.NOTES.m].filter(([k]) => k.startsWith('media:')).sort();
  const origSmall = Uint8Array.from(w.env.MEDIA.m.get('media/m-small'));
  const r = await go(w, 'apply');
  assert.deepEqual(r.problems, []); assert.equal(r.ok, true);
  assert.deepEqual(r.changed, { notes: 2, media: 2 });
  assert.deepEqual(r.notes, { total: 3, current: 3, legacy: 0, unreadable: 0, complete: true });
  assert.deepEqual(r.media, { total: 2, current: 2, legacy: 0, unreadable: 0 });
  // the current key ALONE now opens all of it, to the same content
  assert.deepEqual(await readAll(w.env, w.ring[0]), w.want);
  // no record was added, lost or renamed, and photo metadata is byte-for-byte what it was
  assert.deepEqual([...w.env.NOTES.m.keys()].sort(), keysBefore);
  assert.deepEqual([...w.env.NOTES.m].filter(([k]) => k.startsWith('media:')).sort(), metaBefore);
  // originals were saved first
  assert.deepEqual(new Uint8Array(fs.readFileSync(path.join(r.backup, 'media', 'm-small.bin'))), origSmall);
  assert.equal(JSON.parse(fs.readFileSync(path.join(r.backup, 'notes-before.json'), 'utf8')).notes.length, 3);
  assert.equal(JSON.parse(fs.readFileSync(path.join(r.backup, 'receipt.json'), 'utf8')).ok, true);
  // the legacy key opens none of it any more
  const legacy = await K.importRaw(w.ring[1]);
  for (const [k, v] of w.env.NOTES.m) if (k.startsWith('note:')) { const n = JSON.parse(v); await assert.rejects(K.decNoteAny([legacy], n.iv, n.ct)); }
  for (const v of w.env.MEDIA.m.values()) await assert.rejects(K.decBytesAny([legacy], v));
});
test('apply: a second run finds nothing to do and changes nothing', async (t) => {
  const w = await world(t);
  await go(w, 'apply');
  const mid = snapshot(w.env);
  const r = await go(w, 'apply');
  assert.equal(r.ok, true); assert.deepEqual(r.changed, { notes: 0, media: 0 });
  assert.equal(snapshot(w.env), mid);
});
test('apply: an item no key opens is reported, left byte-identical, and the run is not OK', async (t) => {
  const w = await world(t), stranger = await K.importRaw(K.newKeyB64());
  await seed(w.env, stranger, { notes: [{ id: 'n-lost', text: 'x' }], media: [{ id: 'm-lost', chunks: [bytesOf(50, 5)] }] });
  const noteKey = [...w.env.NOTES.m.keys()].find((k) => k.endsWith('-n-lost'));
  const noteBefore = w.env.NOTES.m.get(noteKey), blobBefore = Uint8Array.from(w.env.MEDIA.m.get('media/m-lost'));
  const r = await go(w, 'apply');
  assert.equal(r.ok, false);
  assert.equal(r.notes.unreadable, 1); assert.equal(r.media.unreadable, 1);
  assert.ok(r.problems.some((p) => p.includes('n-lost')) && r.problems.some((p) => p.includes('m-lost')));
  assert.equal(w.env.NOTES.m.get(noteKey), noteBefore);
  assert.deepEqual(w.env.MEDIA.m.get('media/m-lost'), blobBefore);
  assert.deepEqual(r.changed, { notes: 2, media: 2 }); // the readable ones still moved
});
test('apply: a Worker without the replace route stops the run before anything changes', async (t) => {
  const w = await world(t, { hook: (req) => (req.method === 'PUT' ? new Response('{"error":"method not allowed"}', { status: 405 }) : null) });
  const before = snapshot(w.env);
  await assert.rejects(go(w, 'apply'), (e) => e.setup === true && /no replace route/.test(e.message) && /Nothing was changed/.test(e.message));
  assert.equal(snapshot(w.env), before);
});
test('apply: a photo whose read-back fails gets its original put back', async (t) => {
  let corrupt = true;
  const w = await world(t, { hook: async (req, body, env) => {
    // The first real PUT to m-small lands as garbage; everything after behaves.
    if (req.method === 'PUT' && req.url.endsWith('/media/m-small') && corrupt) { corrupt = false; env.MEDIA.m.set('media/m-small', new Uint8Array(64)); return new Response('{"ok":true}', { status: 200 }); }
    return null;
  } });
  const orig = Uint8Array.from(w.env.MEDIA.m.get('media/m-small'));
  const r = await go(w, 'apply');
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('m-small') && p.includes('the original was put back')), r.problems.join(' | '));
  assert.deepEqual(w.env.MEDIA.m.get('media/m-small'), orig);
  assert.equal(r.media.legacy, 1); assert.equal(r.changed.media, 1);
  // and a later run finishes the job
  const again = await go(w, 'apply');
  assert.equal(again.ok, true); assert.deepEqual(await readAll(w.env, w.ring[0]), w.want);
});
test('apply: a note deleted on a phone during the run stays deleted', async (t) => {
  let done = false;
  const w = await world(t, { hook: async (req, body, env) => {
    if (req.method === 'POST' && new URL(req.url).pathname === '/import' && !done) {
      done = true;
      await worker.fetch(new Request('http://worker.test/notes?id=n-a', { method: 'DELETE', headers: { Authorization: 'Bearer ' + TOKEN } }), env);
    }
    return null;
  } });
  const r = await go(w, 'apply');
  assert.equal(r.ok, true, r.problems.join(' | '));
  assert.equal([...w.env.NOTES.m.keys()].some((k) => k.endsWith('-n-a') && k.startsWith('note:')), false);
  assert.equal(r.notes.total, 2);
});
test('apply: a read-back that opens fine but is the WRONG photo is caught and undone', async (t) => {
  // Garbage is the easy case: it will not decrypt. This server answers the replace with a perfectly valid
  // blob, sealed with the current key, that holds different content. Only comparing content catches it.
  const state = { ring: null, armed: true };
  const w = await world(t, { hook: async (req, body, env) => {
    if (req.method === 'PUT' && req.url.endsWith('/media/m-small') && state.armed) {
      state.armed = false;
      env.MEDIA.m.set('media/m-small', await K.encBytesLike(await K.importRaw(state.ring[0]), { chunked: false, chunks: [bytesOf(900, 99)] }));
      return new Response('{"ok":true}', { status: 200 });
    }
    return null;
  } });
  state.ring = w.ring;
  const orig = Uint8Array.from(w.env.MEDIA.m.get('media/m-small'));
  const r = await go(w, 'apply');
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('m-small') && p.includes('read-back does not match') && p.includes('the original was put back')), r.problems.join(' | '));
  assert.deepEqual(w.env.MEDIA.m.get('media/m-small'), orig);
  assert.equal(r.changed.media, 1);
});
test('apply: an old-key note that arrives during the run means NOT OK, with no problem line needed', async (t) => {
  // A phone still on the old page sends a note after the tool has looked. Every step of the run succeeds,
  // and the thread is still not all on the current key. Only the fresh audit at the end can know that.
  const state = { ring: null, armed: true };
  const w = await world(t, { hook: async (req, body, env) => {
    if (req.method === 'POST' && new URL(req.url).pathname === '/import' && state.armed) {
      state.armed = false;
      await seed(env, await K.importRaw(state.ring[1]), { notes: [{ id: 'n-late', text: 'sent from the old page' }] });
    }
    return null;
  } });
  state.ring = w.ring;
  const r = await go(w, 'apply');
  assert.deepEqual(r.problems, []);
  assert.equal(r.notes.legacy, 1);
  assert.equal(r.ok, false, 'a run with anything left on an old key must not report OK');
  assert.equal(JSON.parse(fs.readFileSync(path.join(r.backup, 'receipt.json'), 'utf8')).ok, false);
  const again = await go(w, 'apply');
  assert.equal(again.ok, true); assert.equal(again.changed.notes, 1);
});
test('an empty ring is a setup error, not a silent no-op', async (t) => {
  const d = tmp(t);
  await assert.rejects(run({ cmd: 'audit', src: payloadSrc([], 'http://127.0.0.1:1'), fetch: globalThis.fetch, backupDir: d }), (e) => e.setup === true && /ring is empty/.test(e.message));
});

/* ---------- the whole ladder through the command line ---------- */
test('rotate, re-key, drop-legacy: the passphrase changes and the thread survives', async (t) => {
  const env = { NOTES: new MockKV(), MEDIA: new MockR2(), NOTES_TOKEN: TOKEN };
  const base = await serve(t, env);
  const d = tmp(t), GATE = path.join(d, 'gate.html'), SRC = path.join(d, 'src', 'payload.html'), BK = path.join(d, 'bk');
  // A gate holding an OLD-style page (empty ring), sealed under the old passphrase.
  const src0 = payloadSrc([], base), pageSalt = K.randomB64(16), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await K.deriveKey(OLD_PASS, pageSalt), new TextEncoder().encode(src0)));
  fs.writeFileSync(GATE, '<html><script>var SALT="' + pageSalt + '",IV="' + K.b64e(iv) + '",CT="' + K.b64e(ct) + '";</script></html>');
  // The thread as the old page wrote it.
  const chunks = [bytesOf(700, 2)];
  await seed(env, await K.deriveKey(OLD_PASS, SALT), { notes: [{ id: 'n-1', text: 'written before the change' }], media: [{ id: 'm-1', chunks }] });
  const want = { notes: { 'n-1': 'written before the change' }, media: { 'm-1': await K.digestChunks(chunks) } };

  // Async on purpose: the Worker these commands call lives in THIS process, and a blocking spawn would freeze it.
  const cli = (script, args, extra) => new Promise((resolve) => {
    const c = spawn(process.execPath, [path.join(HERE, script), ...args], { env: { PATH: process.env.PATH, JERUSHA_GATE: GATE, JERUSHA_SRC: SRC, JERUSHA_BACKUP_DIR: BK, ...extra } });
    let stdout = '', stderr = '';
    c.stdout.on('data', (b) => { stdout += b; }); c.stderr.on('data', (b) => { stderr += b; });
    c.on('close', (status) => resolve({ status, stdout, stderr }));
  });
  const payload = (args, extra) => cli('jerusha-payload.mjs', args, extra);
  const rekey = (args) => cli('jerusha-rekey.mjs', args, {});
  const noSecrets = (r) => { for (const s of [OLD_PASS, NEW_PASS, TOKEN]) assert.equal((r.stdout + r.stderr).includes(s), false, 'a secret was printed'); };

  // refusals first
  let r = await payload(['rotate'], { JERUSHA_PASS: OLD_PASS });
  assert.equal(r.status, 1); assert.match(r.stderr, /JERUSHA_NEW_PASS/);
  r = await payload(['rotate'], { JERUSHA_PASS: OLD_PASS, JERUSHA_NEW_PASS: ' ' + OLD_PASS + ' ' });
  assert.equal(r.status, 1); assert.match(r.stderr, /same as the current/);
  r = await payload(['rotate'], { JERUSHA_PASS: 'wrong phrase', JERUSHA_NEW_PASS: NEW_PASS });
  assert.equal(r.status, 1); assert.match(r.stderr, /does not open/);
  const gateBefore = fs.readFileSync(GATE, 'utf8');

  // an old source lying around with unbuilt edits blocks a rotation
  fs.mkdirSync(path.dirname(SRC), { recursive: true }); fs.writeFileSync(SRC, src0 + '<!-- unbuilt edit -->');
  r = await payload(['rotate'], { JERUSHA_PASS: OLD_PASS, JERUSHA_NEW_PASS: NEW_PASS });
  assert.equal(r.status, 1); assert.match(r.stderr, /differs from what/);
  assert.equal(fs.readFileSync(GATE, 'utf8'), gateBefore);
  fs.writeFileSync(SRC, src0);
  const staleSource = src0;

  // rotate
  r = await payload(['rotate'], { JERUSHA_PASS: OLD_PASS, JERUSHA_NEW_PASS: NEW_PASS });
  assert.equal(r.status, 0, r.stderr); noSecrets(r);
  assert.match(r.stdout, /data keys:\s+0 -> 2/);
  const ring = K.readRing(fs.readFileSync(SRC, 'utf8'));
  assert.equal(ring.length, 2);
  assert.equal(ring[1], K.b64e(await K.deriveRaw(OLD_PASS, SALT)));
  assert.notEqual(fs.readFileSync(GATE, 'utf8').match(/SALT="([^"]*)"/)[1], pageSalt);
  // the old passphrase no longer opens the page; the new one does, to the source just written
  r = await payload(['extract'], { JERUSHA_PASS: OLD_PASS, JERUSHA_SRC: path.join(d, 'x.html') });
  assert.equal(r.status, 1); assert.match(r.stderr, /does not open/);
  r = await payload(['extract'], { JERUSHA_PASS: NEW_PASS, JERUSHA_SRC: path.join(d, 'y.html') });
  assert.equal(r.status, 0); assert.equal(fs.readFileSync(path.join(d, 'y.html'), 'utf8'), fs.readFileSync(SRC, 'utf8'));

  // a stale source (from before the rotation) must not be buildable
  const good = fs.readFileSync(SRC, 'utf8');
  fs.writeFileSync(SRC, staleSource);
  r = await payload(['build'], { JERUSHA_PASS: NEW_PASS });
  assert.equal(r.status, 1); assert.match(r.stderr, /stale|not the ring/);
  fs.writeFileSync(SRC, good.replace(/var DATA_KEYS=\[[^\]]*\];/, ''));
  r = await payload(['build'], { JERUSHA_PASS: NEW_PASS });
  assert.equal(r.status, 1); assert.match(r.stderr, /has none/);
  fs.writeFileSync(SRC, good + '<!-- an ordinary edit -->');
  r = await payload(['build'], { JERUSHA_PASS: NEW_PASS });
  assert.equal(r.status, 0, r.stderr);

  // dropping the old key now would lock the thread: refused, page untouched
  const gateMid = fs.readFileSync(GATE, 'utf8');
  r = await payload(['drop-legacy'], { JERUSHA_PASS: NEW_PASS });
  assert.equal(r.status, 1); assert.match(r.stderr, /refusing to drop/);
  assert.equal(fs.readFileSync(GATE, 'utf8'), gateMid);

  // audit says so, apply fixes it, audit agrees
  r = await rekey(['audit']); assert.equal(r.status, 3, r.stdout + r.stderr); noSecrets(r);
  r = await rekey(['apply']); assert.equal(r.status, 0, r.stdout + r.stderr); noSecrets(r);
  assert.match(r.stdout, /re-keyed: 1 notes, 1 media/);
  r = await rekey(['audit']); assert.equal(r.status, 0, r.stdout + r.stderr);

  // now the old key can go, and the one remaining key reads everything
  r = await payload(['drop-legacy'], { JERUSHA_PASS: NEW_PASS });
  assert.equal(r.status, 0, r.stderr); noSecrets(r);
  const finalRing = K.readRing(fs.readFileSync(SRC, 'utf8'));
  assert.deepEqual(finalRing, [ring[0]]);
  assert.deepEqual(await readAll(env, finalRing[0]), want);

  // a later plain passphrase change keeps the data key; --new-data-key adds one in front
  r = await payload(['rotate'], { JERUSHA_PASS: NEW_PASS, JERUSHA_NEW_PASS: 'third fixture phrase' });
  assert.equal(r.status, 0, r.stderr); assert.deepEqual(K.readRing(fs.readFileSync(SRC, 'utf8')), finalRing);
  r = await payload(['rotate', '--new-data-key'], { JERUSHA_PASS: 'third fixture phrase', JERUSHA_NEW_PASS: 'fourth fixture phrase', JERUSHA_NEW_TOKEN: 'another-made-up-token' });
  assert.equal(r.status, 0, r.stderr);
  const s4 = fs.readFileSync(SRC, 'utf8'), ring4 = K.readRing(s4);
  assert.equal(ring4.length, 2); assert.equal(ring4[1], finalRing[0]); assert.notEqual(ring4[0], finalRing[0]);
  assert.equal(K.readConst(s4, 'NOTES_TOKEN'), 'another-made-up-token');
  assert.equal((r.stdout + r.stderr).includes('another-made-up-token'), false);
});
