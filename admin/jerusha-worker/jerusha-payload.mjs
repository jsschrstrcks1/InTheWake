#!/usr/bin/env node
// Jerusha payload build tool.
// The deployed admin/alaska-trip.html holds its whole page in ONE AES-GCM blob
// (var SALT="..",IV="..",CT=".."). Editing that by hand is error-prone, so:
//   extract      -> decrypt the blob into the gitignored plaintext source you edit
//   build        -> encrypt the source back into alaska-trip.html (keeps SALT, fresh IV)
//                   and verifies the result re-decrypts byte-identical to the source.
//   rotate       -> change the passphrase (and, when needed, the data key and the token).
//   drop-legacy  -> remove old data keys from the page, once nothing on the server needs them.
// rotate and drop-legacy are the ONLY commands that may change the data-key ring.
// Read admin/jerusha-worker/ROTATION-RUNBOOK.md before running either.
//
// Passphrases come from the environment (NEVER commit them, never put them in a file).
// Run from repo root:
//   JERUSHA_PASS='…' node admin/jerusha-worker/jerusha-payload.mjs extract
//   # edit admin/jerusha-src/alaska-trip.payload.html (gitignored, lives only here)
//   JERUSHA_PASS='…' node admin/jerusha-worker/jerusha-payload.mjs build
//   git add admin/alaska-trip.html && git commit   # source stays untracked
//
//   JERUSHA_PASS='<current>' JERUSHA_NEW_PASS='<new>' node admin/jerusha-worker/jerusha-payload.mjs rotate [--new-data-key]
//     optional JERUSHA_NEW_TOKEN='<new NOTES_TOKEN>' swaps the token in the same build.
//   JERUSHA_PASS='<current>' node admin/jerusha-worker/jerusha-payload.mjs drop-legacy
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { webcrypto as wc } from 'node:crypto';
import { b64d, b64e, deriveKey, deriveRaw, importRaw, newKeyB64, randomB64, readRing, writeRing, readConst, writeConst, encNote, decNoteAny } from './jerusha-keys.mjs';
import { run as rekeyRun } from './jerusha-rekey.mjs';
const subtle = wc.subtle;
const GATE = process.env.JERUSHA_GATE || 'admin/alaska-trip.html';
const SRC  = process.env.JERUSHA_SRC  || 'admin/jerusha-src/alaska-trip.payload.html';
const pass = (process.env.JERUSHA_PASS || '').trim();   // the gate trims what is typed, so the tool does too
if (!pass) { console.error('set JERUSHA_PASS (the page passphrase)'); process.exit(2); }
const RE = /var SALT="([^"]*)",IV="([^"]*)",CT="([^"]*)"/;

function readGate() {
  const gate = fs.readFileSync(GATE, 'utf8'); const m = gate.match(RE);
  if (!m) throw new Error('no SALT/IV/CT in ' + GATE);
  return { gate, salt: m[1], iv: m[2], ct: m[3] };
}
async function openGate(g, pw) {
  try { return new TextDecoder().decode(await subtle.decrypt({ name: 'AES-GCM', iv: b64d(g.iv) }, await deriveKey(pw, g.salt), b64d(g.ct))); }
  catch { throw new Error('that passphrase does not open ' + GATE); }
}
// Encrypt `src` into the gate under `pw` and `salt`, prove it opens again to the same bytes, then hand back the file text.
async function sealGate(g, src, pw, salt) {
  const iv = wc.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, await deriveKey(pw, salt), new TextEncoder().encode(src)));
  const out = g.gate.replace(RE, () => 'var SALT="' + salt + '",IV="' + b64e(iv) + '",CT="' + b64e(ct) + '"');
  if (out === g.gate) throw new Error('SALT/IV/CT replace failed');
  const m2 = out.match(RE);
  const back = await openGate({ salt: m2[1], iv: m2[2], ct: m2[3] }, pw);
  if (back !== src) throw new Error('round-trip mismatch — not writing');
  return out;
}
const sameRing = (a, b) => a.length === b.length && a.every((k, i) => k === b[i]);
const hasRing = (s) => /var DATA_KEYS=\[/.test(s);
// The local source must be exactly what the live page holds, or a ring change would silently drop unbuilt edits.
function requireSourceInStep(live) {
  if (fs.existsSync(SRC) && fs.readFileSync(SRC, 'utf8') !== live) {
    throw new Error(SRC + ' differs from what ' + GATE + ' holds. Build your edits first (or extract again to discard them), then retry.');
  }
}

async function extract() {
  const pt = await openGate(readGate(), pass);
  fs.mkdirSync(SRC.replace(/\/[^/]*$/, ''), { recursive: true });
  fs.writeFileSync(SRC, pt);
  console.log('extracted -> ' + SRC + ' (' + Buffer.byteLength(pt) + ' bytes)');
}

async function build() {
  const g = readGate();
  const src = fs.readFileSync(SRC, 'utf8');
  // A source extracted BEFORE a rotation carries the old ring. Building it would ship a page that cannot read
  // the thread. Only rotate and drop-legacy may change the ring, so a build whose ring differs is refused.
  const live = await openGate(g, pass);
  if (hasRing(live)) {
    if (!hasRing(src)) throw new Error('the live page has a data-key ring and ' + SRC + ' has none. Extract again; do not build this source.');
    if (!sameRing(readRing(live), readRing(src))) throw new Error('the data-key ring in ' + SRC + ' is not the ring in the live page. Your source is stale: extract again. (Only rotate and drop-legacy change the ring.)');
  } else if (hasRing(src) && readRing(src).length) {
    throw new Error('the live page has no ring yet, so the source must carry an empty one. Use rotate to fill it.');
  }
  fs.writeFileSync(GATE, await sealGate(g, src, pass, g.salt));
  console.log('built -> ' + GATE + ' (re-decrypt verified byte-identical to source)');
}

async function rotate() {
  const newPass = (process.env.JERUSHA_NEW_PASS || '').trim();
  if (!newPass) throw new Error('set JERUSHA_NEW_PASS (the new passphrase)');
  if (newPass === pass) throw new Error('the new passphrase is the same as the current one');
  // The gate compares exactly what the phone's keyboard produces. Phones quietly swap some characters as you
  // type (curly quotes, long dashes, an ellipsis for three dots), and accented letters can be typed two ways.
  // A passphrase that needs any of those may be impossible to enter on a phone. Warn, never echo it.
  const risky = [];
  if (/[^\x20-\x7E]/.test(newPass)) risky.push('a character outside plain keyboard letters, digits and punctuation');
  if (/['"`]/.test(newPass)) risky.push('a quote mark (phones turn these curly)');
  if (/--|\.\.\./.test(newPass)) risky.push('two dashes or three dots in a row (phones turn these into one character)');
  if (/ {2,}/.test(newPass)) risky.push('two spaces in a row (phones turn these into a full stop)');
  if (risky.length) console.error('WARNING: the new passphrase has ' + risky.join('; ') + '. It may not be typeable on a phone. Type it on BOTH phones before you ship.');
  const wantNewKey = process.argv.includes('--new-data-key');
  const g = readGate();
  let src = await openGate(g, pass);
  requireSourceInStep(src);
  if (!hasRing(src)) throw new Error('the live page is older than the data-key ring, so there is nothing to rotate into. Ship the page that carries "var DATA_KEYS=[];" first.');
  let ring = readRing(src);
  const before = ring.length;
  if (!ring.length) {
    // First rotation. Until now the page derived its one data key from the passphrase. Keep that exact key as
    // the LAST key in the ring (so everything already written still opens) and put a new random key first.
    const salt = readConst(src, 'NOTES_SALT');
    const legacy = b64e(await deriveRaw(pass, salt));
    // Prove the kept key IS the key the old page used: seal with the old derivation, open with the kept bytes.
    const probe = await encNote(await deriveKey(pass, salt), 'ring-self-check');
    if ((await decNoteAny([await importRaw(legacy)], probe.iv, probe.ct)).text !== 'ring-self-check') throw new Error('legacy key self-check failed — not writing');
    ring = [newKeyB64(), legacy];
  } else if (wantNewKey) {
    ring = [newKeyB64(), ...ring];
  }
  src = writeRing(src, ring);
  const newToken = (process.env.JERUSHA_NEW_TOKEN || '').trim();
  if (newToken) {
    if (newToken === readConst(src, 'NOTES_TOKEN')) throw new Error('JERUSHA_NEW_TOKEN is the token the page already holds');
    src = writeConst(src, 'NOTES_TOKEN', newToken);
  }
  const out = await sealGate(g, src, newPass, randomB64(16));
  // The old passphrase must no longer open the page that is about to be written.
  const m2 = out.match(RE); let oldOpens = true;
  try { await openGate({ salt: m2[1], iv: m2[2], ct: m2[3] }, pass); } catch { oldOpens = false; }
  if (oldOpens) throw new Error('the old passphrase still opens the new page — not writing');
  fs.mkdirSync(SRC.replace(/\/[^/]*$/, ''), { recursive: true });
  fs.writeFileSync(SRC, src);
  fs.writeFileSync(GATE, out);
  console.log('rotated -> ' + GATE);
  console.log('  passphrase: changed (new salt; the old one no longer opens the page)');
  console.log('  data keys:  ' + before + ' -> ' + ring.length + (ring.length > 1 ? '   (' + (ring.length - 1) + ' old key(s) kept for reading until the re-key is done)' : ''));
  console.log('  token:      ' + (newToken ? 'changed in the page (set the same value on the Worker before shipping)' : 'unchanged'));
  console.log('Next: the runbook, from the step after "rotate". From now on JERUSHA_PASS is the NEW passphrase.');
}

async function dropLegacy() {
  const g = readGate();
  let src = await openGate(g, pass);
  requireSourceInStep(src);
  const ring = readRing(src);
  if (ring.length < 2) { console.log('nothing to drop: the ring holds ' + ring.length + ' key(s)'); return; }
  // Measure, do not trust: ask the live server whether anything still needs an old key.
  const report = await rekeyRun({
    cmd: 'audit', src, fetch: globalThis.fetch, base: process.env.JERUSHA_WORKER, token: process.env.JERUSHA_TOKEN,
    backupDir: process.env.JERUSHA_BACKUP_DIR || path.join(os.homedir(), 'jerusha-backups'),
  });
  for (const p of report.problems) console.error('PROBLEM: ' + p);
  if (!report.ok) throw new Error('refusing to drop old keys: the audit is not clean (notes on an old key: ' + report.notes.legacy + ', media on an old key: ' + report.media.legacy + ', problems: ' + report.problems.length + '). Run jerusha-rekey.mjs apply first.');
  src = writeRing(src, [ring[0]]);
  const out = await sealGate(g, src, pass, g.salt);
  fs.writeFileSync(SRC, src);
  fs.writeFileSync(GATE, out);
  console.log('dropped ' + (ring.length - 1) + ' old key(s) -> ' + GATE + '   (audit was clean: ' + report.notes.total + ' notes, ' + report.media.total + ' media, all on the current key)');
}

const cmd = process.argv[2];
const cmds = { extract, build, rotate, 'drop-legacy': dropLegacy };
(cmds[cmd] ? cmds[cmd]() : Promise.reject(new Error('usage: extract | build | rotate [--new-data-key] | drop-legacy')))
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
