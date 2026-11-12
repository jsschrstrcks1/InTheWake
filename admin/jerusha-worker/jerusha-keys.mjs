// Jerusha data keys: the one place the Node tools learn the page's encryption formats.
//
// The page (inside the encrypted payload) encrypts notes and media with the FIRST key
// in its DATA_KEYS ring and tries every key in the ring to decrypt. This module reads
// and writes that ring in the plaintext payload source, and reads and writes the same
// two ciphertext formats, so jerusha-payload.mjs (rotate, drop-legacy) and
// jerusha-rekey.mjs (audit, apply) cannot drift from each other.
//
// The formats here MUST match the page. tests/playwright/jerusha-keys.spec.js makes
// the real page decrypt what this module encrypted; change one side and that fails.
//
//   note   {iv, ct}: base64 12-byte IV, base64 AES-GCM ciphertext of the UTF-8 text
//   media  small:    [12-byte IV][AES-GCM ciphertext]
//          chunked:  "JCM1" [uint32 LE header length] [header JSON] [chunk ciphertexts]
//                    header = {c:[{i: base64 IV, n: ciphertext length}, ...]}
//
// Nothing in this file prints, stores or logs a key or a plaintext.
// Runbook: admin/jerusha-worker/ROTATION-RUNBOOK.md
import { webcrypto as wc } from 'node:crypto';
const subtle = wc.subtle;

export const b64d = (s) => Uint8Array.from(Buffer.from(s, 'base64'));
export const b64e = (u) => Buffer.from(u).toString('base64');

const PBKDF2 = { iterations: 150000, hash: 'SHA-256' };

/** The raw 32 bytes of a passphrase-derived key (what the page derived before the ring existed). */
export async function deriveRaw(pass, saltB64) {
  const bk = await subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await subtle.deriveBits({ name: 'PBKDF2', salt: b64d(saltB64), ...PBKDF2 }, bk, 256));
}
/** A passphrase-derived AES-GCM key (the page key). */
export async function deriveKey(pass, saltB64) {
  const bk = await subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', salt: b64d(saltB64), ...PBKDF2 }, bk, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export function importRaw(rawB64) {
  const raw = b64d(rawB64);
  if (raw.length !== 32) throw new Error('a data key must be 32 bytes, got ' + raw.length);
  return subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
export const newKeyB64 = () => b64e(wc.getRandomValues(new Uint8Array(32)));
export const randomB64 = (n) => b64e(wc.getRandomValues(new Uint8Array(n)));

/* ---------- the ring, as written in the payload source ---------- */
const RING_RE = /var DATA_KEYS=\[([^\]]*)\];/g;

/** The ring as an array of base64 strings. Throws unless the source declares it exactly once. */
export function readRing(src) {
  const all = [...src.matchAll(RING_RE)];
  if (all.length !== 1) throw new Error('expected exactly one "var DATA_KEYS=[...];" in the payload source, found ' + all.length);
  const body = all[0][1].trim();
  if (!body) return [];
  const keys = body.split(',').map((s) => s.trim());
  for (const k of keys) {
    if (!/^"[A-Za-z0-9+/]{43}="$/.test(k)) throw new Error('DATA_KEYS holds something that is not a base64 32-byte key');
  }
  const out = keys.map((k) => k.slice(1, -1));
  if (new Set(out).size !== out.length) throw new Error('DATA_KEYS holds the same key twice');
  return out;
}
/** The source with its ring replaced. Refuses a ring it could not read back. */
export function writeRing(src, keys) {
  readRing(src); // exactly one declaration, or throw
  const out = src.replace(RING_RE, () => 'var DATA_KEYS=[' + keys.map((k) => '"' + k + '"').join(',') + '];');
  const back = readRing(out);
  if (back.length !== keys.length || back.some((k, i) => k !== keys[i])) throw new Error('ring did not read back as written');
  return out;
}
/** A string constant from the payload source: var NAME="value"; declared exactly once. */
export function readConst(src, name) {
  const all = [...src.matchAll(new RegExp('var ' + name + '="([^"]*)";', 'g'))];
  if (all.length !== 1) throw new Error('expected exactly one var ' + name + '="..."; in the payload source, found ' + all.length);
  return all[0][1];
}
export function writeConst(src, name, value) {
  readConst(src, name);
  if (/["\\\n\r]/.test(value)) throw new Error(name + ' may not contain a quote, a backslash or a line break');
  const out = src.replace(new RegExp('var ' + name + '="[^"]*";', 'g'), () => 'var ' + name + '="' + value + '";');
  if (readConst(out, name) !== value) throw new Error(name + ' did not read back as written');
  return out;
}

/* ---------- notes ---------- */
export async function encNote(key, text) {
  const iv = wc.getRandomValues(new Uint8Array(12));
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  return { iv: b64e(iv), ct: b64e(new Uint8Array(ct)) };
}
/** Decrypt with whichever key fits. Returns {text, index}; index is the key's place in `keys`. Throws if none fits. */
export async function decNoteAny(keys, iv, ct) {
  for (let i = 0; i < keys.length; i++) {
    try {
      const buf = await subtle.decrypt({ name: 'AES-GCM', iv: b64d(iv) }, keys[i], b64d(ct));
      return { text: new TextDecoder('utf-8', { fatal: true }).decode(buf), index: i };
    } catch { /* wrong key: try the next */ }
  }
  throw new Error('no key in the ring opens this note');
}

/* ---------- media ---------- */
const MAGIC = [74, 67, 77, 49]; // "JCM1"
const isChunked = (u) => u.length >= 8 && MAGIC.every((b, i) => u[i] === b);

function parseChunked(u) {
  const hl = new DataView(u.buffer, u.byteOffset + 4, 4).getUint32(0, true);
  if (8 + hl > u.length) throw new Error('chunked blob: header runs past the end');
  const hdr = JSON.parse(new TextDecoder().decode(u.subarray(8, 8 + hl)));
  if (!hdr || !Array.isArray(hdr.c) || !hdr.c.length) throw new Error('chunked blob: no chunk list');
  let off = 8 + hl; const parts = [];
  for (const c of hdr.c) {
    if (!c || typeof c.i !== 'string' || !Number.isInteger(c.n) || c.n < 16) throw new Error('chunked blob: bad chunk entry');
    if (off + c.n > u.length) throw new Error('chunked blob: truncated');
    parts.push({ iv: b64d(c.i), ct: u.subarray(off, off + c.n) }); off += c.n;
  }
  if (off !== u.length) throw new Error('chunked blob: bytes left over after the last chunk');
  return parts;
}
async function decWith(key, u) {
  if (isChunked(u)) {
    const out = [];
    for (const p of parseChunked(u)) out.push(new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: p.iv }, key, p.ct)));
    return { chunked: true, chunks: out };
  }
  if (u.length < 12 + 16) throw new Error('blob too short to be ciphertext');
  return { chunked: false, chunks: [new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, key, u.subarray(12)))] };
}
/** Decrypt a media blob with whichever key fits. Returns {chunked, chunks, index}. Throws if none fits. */
export async function decBytesAny(keys, u) {
  let last;
  for (let i = 0; i < keys.length; i++) {
    try { return { ...(await decWith(keys[i], u)), index: i }; } catch (e) { last = e; }
  }
  throw new Error('no key in the ring opens this blob' + (last && /chunked blob|too short/.test(last.message) ? ' (' + last.message + ')' : ''));
}
/** Encrypt plaintext chunks back into the SAME shape they came in (small stays small, chunked keeps its chunk sizes). */
export async function encBytesLike(key, { chunked, chunks }) {
  if (!chunked) {
    const iv = wc.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, chunks[0]));
    const out = new Uint8Array(12 + ct.length); out.set(iv, 0); out.set(ct, 12); return out;
  }
  const hdr = { c: [] }, parts = [];
  for (const pt of chunks) {
    const iv = wc.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, pt));
    parts.push(ct); hdr.c.push({ i: b64e(iv), n: ct.length });
  }
  const hj = new TextEncoder().encode(JSON.stringify(hdr));
  const out = new Uint8Array(8 + hj.length + parts.reduce((n, p) => n + p.length, 0));
  out.set(MAGIC, 0); new DataView(out.buffer).setUint32(4, hj.length, true); out.set(hj, 8);
  let o = 8 + hj.length; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
/** SHA-256 (hex) over plaintext chunks in order. Used to compare before and after without keeping plaintext. */
export async function digestChunks(chunks) {
  const total = chunks.reduce((n, c) => n + c.length, 0), all = new Uint8Array(total);
  let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
  return Buffer.from(await subtle.digest('SHA-256', all)).toString('hex');
}
