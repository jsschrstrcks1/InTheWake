#!/usr/bin/env node
// Jerusha payload build tool.
// The deployed admin/alaska-trip.html holds its whole page in ONE AES-GCM blob
// (var SALT="..",IV="..",CT=".."). Editing that by hand is error-prone, so:
//   extract  -> decrypt the blob into the gitignored plaintext source you edit
//   build    -> encrypt the source back into alaska-trip.html (keeps SALT, fresh IV)
//              and verifies the result re-decrypts byte-identical to the source.
// Passphrase comes from env JERUSHA_PASS (NEVER commit it). Run from repo root:
//   JERUSHA_PASS='…' node admin/jerusha-worker/jerusha-payload.mjs extract
//   # edit admin/jerusha-src/alaska-trip.payload.html (gitignored, lives only here)
//   JERUSHA_PASS='…' node admin/jerusha-worker/jerusha-payload.mjs build
//   git add admin/alaska-trip.html && git commit   # source stays untracked
import fs from 'node:fs';
import { webcrypto as wc } from 'node:crypto';
const subtle = wc.subtle;
const GATE = process.env.JERUSHA_GATE || 'admin/alaska-trip.html';
const SRC  = process.env.JERUSHA_SRC  || 'admin/jerusha-src/alaska-trip.payload.html';
const pass = process.env.JERUSHA_PASS;
if (!pass) { console.error('set JERUSHA_PASS (the page passphrase)'); process.exit(2); }
const b64d = s => Uint8Array.from(Buffer.from(s, 'base64'));
const b64e = u => Buffer.from(u).toString('base64');
const RE = /var SALT="([^"]*)",IV="([^"]*)",CT="([^"]*)"/;
const keyFor = async salt => {
  const bk = await subtle.importKey('raw', new TextEncoder().encode(pass.trim()), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', salt: b64d(salt), iterations: 150000, hash: 'SHA-256' }, bk, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};
async function extract() {
  const m = fs.readFileSync(GATE, 'utf8').match(RE); if (!m) throw new Error('no SALT/IV/CT in ' + GATE);
  const pt = await subtle.decrypt({ name: 'AES-GCM', iv: b64d(m[2]) }, await keyFor(m[1]), b64d(m[3]));
  fs.mkdirSync(SRC.replace(/\/[^/]*$/, ''), { recursive: true });
  fs.writeFileSync(SRC, Buffer.from(pt));
  console.log('extracted -> ' + SRC + ' (' + pt.byteLength + ' bytes)');
}
async function build() {
  const gate = fs.readFileSync(GATE, 'utf8'); const m = gate.match(RE); if (!m) throw new Error('no SALT/IV/CT in ' + GATE);
  const src = fs.readFileSync(SRC, 'utf8'); const key = await keyFor(m[1]);
  const iv = wc.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(src)));
  const out = gate.replace(RE, 'var SALT="' + m[1] + '",IV="' + b64e(iv) + '",CT="' + b64e(ct) + '"');
  if (out === gate) throw new Error('SALT/IV/CT replace failed');
  const m2 = out.match(RE); const back = new TextDecoder().decode(await subtle.decrypt({ name: 'AES-GCM', iv: b64d(m2[2]) }, await keyFor(m2[1]), b64d(m2[3])));
  if (back !== src) throw new Error('round-trip mismatch — not writing');
  fs.writeFileSync(GATE, out);
  console.log('built -> ' + GATE + ' (re-decrypt verified byte-identical to source)');
}
const cmd = process.argv[2];
(cmd === 'extract' ? extract() : cmd === 'build' ? build() : Promise.reject(new Error('usage: extract|build')))
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
