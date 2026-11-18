#!/usr/bin/env node
// Jerusha re-key tool: move every note and photo onto the CURRENT data key.
//
//   node admin/jerusha-worker/jerusha-rekey.mjs audit    read only: which key opens each note and photo
//   node admin/jerusha-worker/jerusha-rekey.mjs apply    re-encrypt whatever an OLD key opens, then audit again
//
// Read admin/jerusha-worker/ROTATION-RUNBOOK.md first. This is the only tool that
// rewrites the thread on the server.
//
// Where it gets what it needs (nothing is typed on the command line):
//   the key ring, the Worker address and the token   the gitignored payload source
//                                                    (admin/jerusha-src/alaska-trip.payload.html, or JERUSHA_SRC)
//   JERUSHA_TOKEN / JERUSHA_WORKER                   optional overrides
//   JERUSHA_BACKUP_DIR                               default ~/jerusha-backups
//
// What `apply` promises, and how each promise is kept:
//   1. Nothing is replaced before its original is on local disk (rekey-<stamp>/ under the backup dir).
//   2. Every replacement is read back from the server and must open with the current key
//      to the same content (SHA-256 of the plaintext, compared in memory, never stored).
//   3. A photo whose read-back fails gets its original bytes put back, and that is read back too.
//   4. It never deletes anything it cannot open. Those are reported and left exactly as they are.
//   5. It reports success only if a fresh audit afterwards finds everything on the current key.
// It can be run again at any time: items already on the current key are not touched.
//
// Exit codes: 0 everything is on the current key; 3 audit found items on an old key;
//             1 something is unreadable or a step failed; 2 bad setup.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { webcrypto as wc } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readRing, readConst, importRaw, encNote, decNoteAny, decBytesAny, encBytesLike, digestChunks } from './jerusha-keys.mjs';

const MAX_RETURN = 2000;        // worker.js returns at most this many notes; at the cap we cannot claim to have seen them all
const IMPORT_BATCH = 100;       // notes per /import call (the Worker caps a call at 1 MB and 2000 records)
const sha = async (text) => Buffer.from(await wc.subtle.digest('SHA-256', new TextEncoder().encode(text))).toString('hex');
const sameBytes = (a, b) => a.length === b.length && Buffer.compare(Buffer.from(a.buffer, a.byteOffset, a.length), Buffer.from(b.buffer, b.byteOffset, b.length)) === 0;
const safeId = (id) => typeof id === 'string' && id.length > 0 && id.length <= 200 && !/[\/\\]/.test(id) && !id.startsWith('.');

/**
 * opts: { cmd: 'audit'|'apply', src (payload source text), fetch, base?, token?, backupDir, log?, stamp? }
 * Returns a report. Never throws for a per-item failure; those land in report.problems.
 */
export async function run(opts) {
  const log = opts.log || (() => {});
  const f = opts.fetch;
  const ringB64 = readRing(opts.src);
  if (!ringB64.length) throw Object.assign(new Error('the key ring is empty: nothing to re-key until `jerusha-payload.mjs rotate` has run'), { setup: true });
  const keys = await Promise.all(ringB64.map(importRaw));
  const base = (opts.base || readConst(opts.src, 'NOTES_WORKER').replace(/\/notes$/, '')).replace(/\/+$/, '');
  const token = opts.token || readConst(opts.src, 'NOTES_TOKEN');
  const auth = { Authorization: 'Bearer ' + token };
  const problems = [];
  const report = { cmd: opts.cmd, ring: keys.length, problems, notes: null, media: null, changed: { notes: 0, media: 0 }, backup: null, ok: false };

  async function getJson(p) {
    const r = await f(base + p, { headers: auth });
    if (!r.ok) throw new Error('GET ' + p.split('?')[0] + ' answered ' + r.status);
    return r.json();
  }
  async function getBlob(id) {
    const r = await f(base + '/media/' + encodeURIComponent(id), { headers: auth });
    if (!r.ok) throw new Error('answered ' + r.status);
    return new Uint8Array(await r.arrayBuffer());
  }
  async function putBlob(id, bytes) {
    const r = await f(base + '/media/' + encodeURIComponent(id), { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/octet-stream', 'Content-Length': String(bytes.length) }, body: bytes });
    if (!r.ok) throw new Error('answered ' + r.status);
  }

  // One pass over the server: which key opens each item. Media blobs are returned so `apply` need not fetch twice.
  async function survey(keepBlobs) {
    const nj = await getJson('/notes?since=');
    const notes = Array.isArray(nj.notes) ? nj.notes : [];
    const ns = { total: notes.length, current: 0, legacy: 0, unreadable: 0, complete: notes.length < MAX_RETURN };
    const legacyNotes = [];
    for (const n of notes) {
      try {
        const d = await decNoteAny(keys, n.iv, n.ct);
        if (d.index === 0) ns.current++; else { ns.legacy++; legacyNotes.push({ rec: n, text: d.text }); }
      } catch { ns.unreadable++; problems.push('note ' + n.id + ': no key in the ring opens it (left untouched)'); }
    }
    if (!ns.complete) problems.push('the Worker returned its maximum of ' + MAX_RETURN + ' notes, so older ones may exist that this tool cannot see');
    const mj = await getJson('/media');
    const media = Array.isArray(mj.media) ? mj.media : [];
    const ms = { total: media.length, current: 0, legacy: 0, unreadable: 0 };
    const legacyMedia = [];
    for (const m of media) {
      let bytes;
      try { bytes = await getBlob(m.id); } catch (e) { ms.unreadable++; problems.push('media ' + m.id + ': could not be downloaded (' + e.message + ')'); continue; }
      try {
        const d = await decBytesAny(keys, bytes);
        if (d.index === 0) ms.current++; else { ms.legacy++; legacyMedia.push(keepBlobs ? { id: m.id, bytes, dec: d } : { id: m.id }); }
      } catch (e) { ms.unreadable++; problems.push('media ' + m.id + ': ' + e.message + ' (left untouched)'); }
    }
    return { ns, ms, legacyNotes, legacyMedia, notes, raw: nj };
  }

  if (opts.cmd === 'audit') {
    const s = await survey(false);
    report.notes = s.ns; report.media = s.ms;
    report.ok = !problems.length && s.ns.legacy === 0 && s.ms.legacy === 0;
    return report;
  }
  if (opts.cmd !== 'apply') throw Object.assign(new Error('usage: audit | apply'), { setup: true });

  const before = await survey(true);
  log('before: notes ' + JSON.stringify(before.ns) + '  media ' + JSON.stringify(before.ms));

  // The replace route must exist BEFORE anything is changed. The probe names an id that cannot exist, so a
  // Worker that has the route answers 404 and one that lacks it answers 405. Nothing is written either way.
  if (before.legacyMedia.length) {
    const pr = await f(base + '/media/' + encodeURIComponent('rekey-probe-no-such-id'), { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/octet-stream', 'Content-Length': '1' }, body: new Uint8Array([0]) });
    if (pr.status !== 404) throw Object.assign(new Error('the live Worker has no replace route for photos yet (probe answered ' + pr.status + ', expected 404). Deploy the Worker from this repo first. Nothing was changed.'), { setup: true });
  }

  // Promise 1: originals on disk first.
  const dir = path.join(opts.backupDir, 'rekey-' + (opts.stamp || new Date().toISOString().replace(/[:.]/g, '-')));
  fs.mkdirSync(path.join(dir, 'media'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'notes-before.json'), JSON.stringify(before.raw));
  if (JSON.parse(fs.readFileSync(path.join(dir, 'notes-before.json'), 'utf8')).notes.length !== before.notes.length) throw new Error('the notes backup did not read back whole; nothing was changed');
  report.backup = dir;

  /* ---- notes ---- */
  const want = new Map(); // id -> sha256 of the plaintext
  const fresh = [];
  for (const { rec, text } of before.legacyNotes) {
    if (rec.sender !== 'me' && rec.sender !== 'jerusha') { problems.push('note ' + rec.id + ': unknown sender, the Worker would refuse it (left untouched)'); continue; }
    const e = await encNote(keys[0], text);
    want.set(rec.id, await sha(text));
    fresh.push({ id: rec.id, sender: rec.sender, ts: rec.ts, iv: e.iv, ct: e.ct });
  }
  for (let i = 0; i < fresh.length; i += IMPORT_BATCH) {
    const batch = fresh.slice(i, i + IMPORT_BATCH);
    const r = await f(base + '/import', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: batch }) });
    const j = r.ok ? await r.json() : null;
    if (!j || j.imported !== batch.length) { problems.push('notes: a batch of ' + batch.length + ' was not fully accepted (status ' + r.status + '); originals are in ' + dir); break; }
  }
  if (fresh.length) {
    // Promise 2 for notes: read back, same ids, same content, current key.
    const after = await getJson('/notes?since=');
    const byId = new Map();
    for (const n of after.notes || []) byId.set(n.id, (byId.get(n.id) || []).concat([n]));
    // A note deleted on a phone while this ran must stay deleted: /import would have put it back.
    const gone = new Set(after.deletions || []);
    for (const rec of fresh) {
      if (gone.has(rec.id)) {
        const r = await f(base + '/notes?id=' + encodeURIComponent(rec.id), { method: 'DELETE', headers: auth });
        if (!r.ok) problems.push('note ' + rec.id + ': was deleted on a phone during the run and could not be removed again (status ' + r.status + ')');
        continue;
      }
      const got = byId.get(rec.id) || [];
      if (got.length !== 1) { problems.push('note ' + rec.id + ': expected one copy on the server after the re-key, found ' + got.length); continue; }
      try {
        const d = await decNoteAny(keys, got[0].iv, got[0].ct);
        if (d.index !== 0 || (await sha(d.text)) !== want.get(rec.id)) problems.push('note ' + rec.id + ': read-back does not match; original is in ' + dir);
        else report.changed.notes++;
      } catch { problems.push('note ' + rec.id + ': read-back does not open; original is in ' + dir); }
    }
    for (const n of before.notes) if (!byId.has(n.id) && !gone.has(n.id)) problems.push('note ' + n.id + ': was on the server before the run and is not there now; original is in ' + dir);
  }

  /* ---- media ---- */
  for (const m of before.legacyMedia) {
    if (!safeId(m.id)) { problems.push('media ' + m.id + ': id is not safe to use as a file name (left untouched)'); continue; }
    const file = path.join(dir, 'media', m.id + '.bin');
    fs.writeFileSync(file, m.bytes);
    if (!sameBytes(new Uint8Array(fs.readFileSync(file)), m.bytes)) { problems.push('media ' + m.id + ': local backup did not read back (left untouched)'); continue; }
    const wantDigest = await digestChunks(m.dec.chunks);
    const next = await encBytesLike(keys[0], m.dec);
    let good = false, why = '';
    try {
      await putBlob(m.id, next);
      const back = await getBlob(m.id);
      const d = await decBytesAny([keys[0]], back);
      good = sameBytes(back, next) && (await digestChunks(d.chunks)) === wantDigest;
      if (!good) why = 'read-back does not match';
    } catch (e) { why = e.message; }
    if (good) { report.changed.media++; continue; }
    // Promise 3: put the original back, and prove it is back.
    try {
      await putBlob(m.id, m.bytes);
      const back = await getBlob(m.id);
      problems.push('media ' + m.id + ': ' + why + '; ' + (sameBytes(back, m.bytes) ? 'the original was put back' : 'AND THE ORIGINAL DID NOT GO BACK CLEANLY: restore it by hand from ' + file));
    } catch (e) { problems.push('media ' + m.id + ': ' + why + '; AND PUTTING THE ORIGINAL BACK FAILED (' + e.message + '): restore it by hand from ' + file); }
  }

  // Promise 5: the verdict is a fresh measurement, not this run's own bookkeeping.
  const firstPass = problems.slice(); problems.length = 0;
  const end = await survey(false);
  for (const p of firstPass) if (!problems.includes(p)) problems.push(p);
  report.notes = end.ns; report.media = end.ms;
  report.ok = !problems.length && end.ns.legacy === 0 && end.ms.legacy === 0;
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({ at: new Date().toISOString(), ok: report.ok, notes: end.ns, media: end.ms, changed: report.changed, problems }, null, 2));
  return report;
}

/* ---------- command line ---------- */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const SRC = process.env.JERUSHA_SRC || 'admin/jerusha-src/alaska-trip.payload.html';
  const cmd = process.argv[2];
  (async () => {
    if (cmd !== 'audit' && cmd !== 'apply') { console.error('usage: jerusha-rekey.mjs audit | apply'); process.exit(2); }
    if (!fs.existsSync(SRC)) { console.error('no payload source at ' + SRC + ' (run jerusha-payload.mjs extract first)'); process.exit(2); }
    const report = await run({
      cmd, src: fs.readFileSync(SRC, 'utf8'), fetch: globalThis.fetch,
      base: process.env.JERUSHA_WORKER, token: process.env.JERUSHA_TOKEN,
      backupDir: process.env.JERUSHA_BACKUP_DIR || path.join(os.homedir(), 'jerusha-backups'),
      log: (m) => console.log(m),
    });
    const line = (name, s) => console.log(name + ': ' + s.total + ' total, ' + s.current + ' on the current key, ' + s.legacy + ' on an old key, ' + s.unreadable + ' unreadable');
    line('notes', report.notes); line('media', report.media);
    if (cmd === 'apply') console.log('re-keyed: ' + report.changed.notes + ' notes, ' + report.changed.media + ' media' + (report.backup ? '   originals: ' + report.backup : ''));
    for (const p of report.problems) console.error('PROBLEM: ' + p);
    if (report.ok) { console.log('OK: everything is on the current key.'); process.exit(0); }
    if (report.problems.length) { console.error('NOT OK: ' + report.problems.length + ' problem(s) above.'); process.exit(1); }
    console.log('Items remain on an old key. Run `apply` to move them.'); process.exit(3);
  })().catch((e) => { console.error('ERROR: ' + e.message); process.exit(e.setup ? 2 : 1); });
}
