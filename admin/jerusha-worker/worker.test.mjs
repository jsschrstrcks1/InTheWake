// Tests for worker.js. Run: node --test worker.test.mjs   (Node 26, no installs)
//
// Drives the worker's default export directly (fetch(req, env), scheduled(event, env))
// against in-memory mocks. The mock KV PAGES its list() exactly like Workers KV
// (at most `limit` keys, a cursor, list_complete), so a worker that makes one list
// call and ignores the cursor is caught here instead of in production.
//
// No personal message text is written in this file: push lines are read out of
// worker.js at run time and the Alaska lines are pinned by hash, not by copy.
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash, webcrypto } from "node:crypto";
import worker from "./worker.js";

const SRC = readFileSync(new URL("./worker.js", import.meta.url), "utf8");
const TOKEN = "test-token-not-a-real-one";
const ORIGIN = "https://cruisinginthewake.com";
const BASE = "https://worker.test";
const MAX_RETURN = 2000; // mirrors worker.js; pinned against the source below

/* ---------- mocks ---------- */
class MockKV {
  constructor() { this.m = new Map(); this.putOptions = new Map(); this.listCalls = []; }
  async get(k) { return this.m.has(k) ? this.m.get(k) : null; }
  async put(k, v, opts) { this.m.set(k, String(v)); this.putOptions.set(k, opts); } // options recorded, not enforced
  async delete(k) { this.m.delete(k); }
  // Pages like real KV: lexicographic order, hard cap of 1000 per call, opaque cursor.
  async list({ prefix = "", limit = 1000, cursor } = {}) {
    this.listCalls.push({ prefix, limit, cursor });
    const all = [...this.m.keys()].filter((k) => k.startsWith(prefix)).sort();
    const start = cursor ? Number(String(cursor).replace("c", "")) : 0;
    const n = Math.max(1, Math.min(limit, 1000));
    const keys = all.slice(start, start + n).map((name) => ({ name }));
    const end = start + keys.length;
    return end >= all.length ? { keys, list_complete: true } : { keys, list_complete: false, cursor: "c" + end };
  }
}
class MockR2 {
  constructor() { this.m = new Map(); }
  async put(k, body) { this.m.set(k, body == null ? new Uint8Array(0) : new Uint8Array(await new Response(body).arrayBuffer())); }
  async get(k) { return this.m.has(k) ? { body: this.m.get(k) } : null; }
  async delete(k) { this.m.delete(k); }
}
function mkEnv(extra = {}) { return { NOTES: new MockKV(), MEDIA: new MockR2(), NOTES_TOKEN: TOKEN, ...extra }; }
function rq(path, { method = "GET", headers = {}, body, auth = true } = {}) {
  const h = { ...headers };
  if (auth && !h.Authorization) h.Authorization = "Bearer " + TOKEN;
  return new Request(BASE + path, { method, headers: h, body });
}
const pad = (i) => String(i).padStart(4, "0");
// Distinct, lexicographically increasing ISO timestamps: index i -> i seconds after a base.
const tsOf = (i) => new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString();
function seedNotes(env, n) {
  for (let i = 0; i < n; i++) {
    const ts = tsOf(i), id = "n" + pad(i);
    env.NOTES.m.set("note:" + ts + "-" + id, JSON.stringify({ v: 1, id, sender: "me", ts, iv: "iv", ct: "ct" }));
  }
}
// Replace globalThis.fetch for one test; returns the recorded calls.
function stubFetch(t, impl) {
  const calls = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (input, init) => { calls.push({ url: String(input && input.url ? input.url : input), init }); return impl(input, init); };
  t.after(() => { globalThis.fetch = orig; });
  return calls;
}

/* ---------- source pins ---------- */
test("source: MAX_RETURN in worker.js is the value these tests assume", () => {
  assert.match(SRC, /MAX_RETURN = 2000\b/);
});

function affirmLines() {
  const m = SRC.match(/const AFFIRM = \[\n([\s\S]*?)\n\];/);
  assert.ok(m, "AFFIRM array found in source");
  return m[1].split("\n").map((l) => JSON.parse(l.trim().replace(/,$/, "")));
}
function alaskaLines() {
  const m = SRC.match(/"anthem-alaska": \{\n([\s\S]*?)\n  \},/);
  assert.ok(m, "anthem-alaska block found in source");
  const out = {};
  for (const l of m[1].split("\n")) { const p = l.match(/^\s*("\d{4}-\d\d-\d\d"): (".*"),$/); assert.ok(p, "line parses: " + l); out[JSON.parse(p[1])] = JSON.parse(p[2]); }
  return out;
}



test("source: Alaska lines are unchanged, character for character (hash of the original DAILY entries)", () => {
  // sha256 over "date\tline\n" for the ten original DAILY entries, computed from the
  // pre-change worker.js. Any edit to a date or a line, however small, changes it.
  const a = alaskaLines();
  assert.equal(Object.keys(a).length, 10);
  const h = createHash("sha256").update(Object.keys(a).map((d) => d + "\t" + a[d] + "\n").join("")).digest("hex");
  assert.equal(h, "629e640923a4b08c31c996453eec1dfa2c825f37c3ad5947ec890b9e7f31d15f");
});

test("source: world-america-dec exists and is empty (its lines are the operator's to write)", () => {
  assert.match(SRC, /"world-america-dec": \{\},/);
});

/* ---------- auth ---------- */
test("auth: no token -> 401", async () => {
  const r = await worker.fetch(rq("/notes", { auth: false }), mkEnv());
  assert.equal(r.status, 401);
});
test("auth: wrong token -> 401 (Bearer, Basic and ?k=)", async () => {
  const env = mkEnv();
  assert.equal((await worker.fetch(rq("/notes", { headers: { Authorization: "Bearer nope" } }), env)).status, 401);
  assert.equal((await worker.fetch(rq("/notes", { headers: { Authorization: "Basic " + btoa("u:nope") } }), env)).status, 401);
  assert.equal((await worker.fetch(rq("/notes?k=nope", { auth: false }), env)).status, 401);
});
test("auth: wrong origin -> 403 even with a valid token", async () => {
  const r = await worker.fetch(rq("/notes", { headers: { Origin: "https://evil.example" } }), mkEnv());
  assert.equal(r.status, 403);
});
test("auth: Bearer accepted (with the allowed origin)", async () => {
  const r = await worker.fetch(rq("/notes", { headers: { Origin: ORIGIN } }), mkEnv());
  assert.equal(r.status, 200);
});
test("auth: Basic password accepted", async () => {
  const r = await worker.fetch(rq("/notes", { headers: { Authorization: "Basic " + btoa("anyuser:" + TOKEN) } }), mkEnv());
  assert.equal(r.status, 200);
});
test("auth: ?k= accepted", async () => {
  const r = await worker.fetch(rq("/notes?k=" + TOKEN, { auth: false }), mkEnv());
  assert.equal(r.status, 200);
});
test("auth: NOTES_TOKEN unset -> 401 for everyone", async () => {
  const r = await worker.fetch(rq("/notes"), mkEnv({ NOTES_TOKEN: undefined }));
  assert.equal(r.status, 401);
});

/* ---------- paging ---------- */
test("paging: GET /notes with 2500 notes returns the newest MAX_RETURN", async () => {
  // With the OLD single-call behaviour (one list({limit:1000}), no cursor) this test
  // FAILS: only the 1000 OLDEST keys are listed, so 1000 notes come back and the
  // newest 1500 are silently missing.
  const env = mkEnv(); seedNotes(env, 2500);
  const r = await worker.fetch(rq("/notes"), env);
  assert.equal(r.status, 200);
  const { notes } = await r.json();
  assert.equal(notes.length, MAX_RETURN);
  assert.equal(notes[0].id, "n0500");                       // oldest kept = 2500 - 2000
  assert.equal(notes[notes.length - 1].id, "n2499");        // the very newest is present
  assert.deepEqual(notes.map((n) => n.id), Array.from({ length: MAX_RETURN }, (_, i) => "n" + pad(i + 500)));
  assert.ok(env.NOTES.listCalls.filter((c) => c.prefix === "note:").length >= 3, "cursor was followed");
});

test("paging: GET /notes?since= still filters, across pages", async () => {
  const env = mkEnv(); seedNotes(env, 2500);
  const r = await worker.fetch(rq("/notes?since=" + encodeURIComponent(tsOf(2399))), env);
  const { notes } = await r.json();
  // Pre-existing semantics, deliberately unchanged: the filter compares "<ts>-<id>" > since,
  // so the note stamped exactly at `since` is INCLUDED (clients de-duplicate by id).
  assert.equal(notes.length, 101);
  assert.equal(notes[0].id, "n2399");
  assert.equal(notes[100].id, "n2499");
});

test("paging: tombstones beyond 1000 are all returned in deletions", async () => {
  const env = mkEnv();
  for (let i = 0; i < 1500; i++) env.NOTES.m.set("del:d" + pad(i), "1");
  const { deletions } = await (await worker.fetch(rq("/notes"), env)).json();
  assert.equal(deletions.length, 1500);
  assert.ok(deletions.includes("d1499"));
});

test("paging: DELETE /notes?id= finds a note beyond the first 1000 keys", async () => {
  const env = mkEnv(); seedNotes(env, 2500);
  const key = "note:" + tsOf(2400) + "-n2400";
  assert.ok(env.NOTES.m.has(key));
  const r = await worker.fetch(rq("/notes?id=n2400", { method: "DELETE" }), env);
  assert.deepEqual(await r.json(), { ok: true, deleted: 1 });
  assert.equal(env.NOTES.m.has(key), false);
  assert.equal(env.NOTES.m.get("del:n2400"), "1");
  assert.deepEqual(env.NOTES.putOptions.get("del:n2400"), { expirationTtl: 7776000 });
  assert.equal([...env.NOTES.m.keys()].filter((k) => k.startsWith("note:")).length, 2499);
});

test("paging: DELETE /notes?id= for an unknown id reports deleted:0 and still tombstones", async () => {
  const env = mkEnv(); seedNotes(env, 5);
  const r = await worker.fetch(rq("/notes?id=nope", { method: "DELETE" }), env);
  assert.deepEqual(await r.json(), { ok: true, deleted: 0 });
  assert.equal(env.NOTES.m.get("del:nope"), "1");
});

test("paging: GET /media lists all 1200 records", async () => {
  const env = mkEnv();
  for (let i = 0; i < 1200; i++) { const ts = tsOf(i), id = "m" + pad(i); env.NOTES.m.set("media:" + ts + "-" + id, JSON.stringify({ v: 1, id, kind: "photo", ts })); }
  const { media } = await (await worker.fetch(rq("/media"), env)).json();
  assert.equal(media.length, 1200);
  assert.equal(media[0].id, "m0000");
  assert.equal(media[1199].id, "m1199");
});

test("paging: DELETE /media/<id> removes metadata that sits beyond the first 1000 keys", async () => {
  const env = mkEnv();
  for (let i = 0; i < 1200; i++) { const ts = tsOf(i), id = "m" + pad(i); env.NOTES.m.set("media:" + ts + "-" + id, JSON.stringify({ v: 1, id, kind: "photo", ts })); }
  env.MEDIA.m.set("media/m1150", new Uint8Array([1]));
  const key = "media:" + tsOf(1150) + "-m1150";
  const r = await worker.fetch(rq("/media/m1150", { method: "DELETE" }), env);
  assert.deepEqual(await r.json(), { ok: true });
  assert.equal(env.NOTES.m.has(key), false);
  assert.equal(env.MEDIA.m.has("media/m1150"), false);
  assert.equal([...env.NOTES.m.keys()].length, 1199);
});

test("paging: GET /loc with 2500 fixes returns the newest MAX_RETURN, and since= filters", async () => {
  const env = mkEnv();
  for (let i = 0; i < 2500; i++) { const ts = tsOf(i); env.NOTES.m.set("loc:" + ts, JSON.stringify({ v: 1, lat: 1, lon: 2, ts })); }
  const { points } = await (await worker.fetch(rq("/loc"), env)).json();
  assert.equal(points.length, MAX_RETURN);
  assert.equal(points[0].ts, tsOf(500));
  assert.equal(points[points.length - 1].ts, tsOf(2499));
  const s = await (await worker.fetch(rq("/loc?since=" + encodeURIComponent(tsOf(2489))), env)).json();
  assert.equal(s.points.length, 10);
  assert.equal(s.points[0].ts, tsOf(2490));
});

/* ---------- existing shapes (an already-shipped page calls these) ---------- */
test("shape: POST /notes stores the note and answers {ok,id,ts}; no subscriptions is logged", async () => {
  const env = mkEnv();
  const r = await worker.fetch(rq("/notes", { method: "POST", body: JSON.stringify({ sender: "me", iv: "a", ct: "b" }) }), env);
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.deepEqual(Object.keys(j).sort(), ["id", "ok", "ts"]);
  const g = await (await worker.fetch(rq("/notes"), env)).json();
  assert.deepEqual(Object.keys(g).sort(), ["deletions", "notes"]);
  assert.equal(g.notes.length, 1);
  assert.equal(g.notes[0].id, j.id);
  assert.deepEqual(JSON.parse(env.NOTES.m.get("pushlog:jerusha")).results, ["no-subscriptions"]);
});

/* ---------- media `by` ---------- */
async function uploadBy(q) {
  const env = mkEnv();
  const r = await worker.fetch(rq("/media" + q, { method: "POST", body: new Uint8Array([1, 2, 3]) }), env);
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.deepEqual(Object.keys(j).sort(), ["id", "ok", "ts"]);
  const key = [...env.NOTES.m.keys()].find((k) => k.startsWith("media:"));
  const rec = JSON.parse(env.NOTES.m.get(key));
  assert.deepEqual([...env.MEDIA.m.get("media/" + j.id)], [1, 2, 3]);
  return rec;
}
test("media by: jerusha is stored", async () => { assert.equal((await uploadBy("?by=jerusha")).by, "jerusha"); });
test("media by: me is stored", async () => { assert.equal((await uploadBy("?kind=video&by=me")).by, "me"); });
test("media by: absent -> null (key present)", async () => {
  const rec = await uploadBy("");
  assert.ok(Object.hasOwn(rec, "by"));
  assert.equal(rec.by, null);
});
test("media by: garbage -> null", async () => {
  for (const g of ["ken", "Jerusha", "ME", "", "%20me", "me%20", "me%0A", "jerusha,me", "__proto__", "null", "%00me"]) {
    assert.equal((await uploadBy("?by=" + g)).by, null, "by=" + JSON.stringify(g));
  }
  assert.equal((await uploadBy("?by=evil&by=me")).by, null, "first value wins; a later valid one does not rescue it");
});
test("media by: old records without `by` are listed untouched", async () => {
  const env = mkEnv();
  const old = { v: 1, id: "old1", kind: "photo", mime: "", lat: null, lon: null, day: null, ts: tsOf(1) };
  env.NOTES.m.set("media:" + old.ts + "-old1", JSON.stringify(old));
  const { media } = await (await worker.fetch(rq("/media"), env)).json();
  assert.deepEqual(media, [old]);
  assert.equal(env.NOTES.m.get("media:" + old.ts + "-old1"), JSON.stringify(old));
});

/* ---------- cron ---------- */
// The push body is encrypted (RFC 8291) to the subscriber's key, so to see WHICH line
// was sent the test plays the browser: it owns the subscription's private key and
// decrypts what the worker handed to fetch. The worker's VAPID public key is fixed
// and its private half is a real secret we do not have, so the JWK import of the
// VAPID signing key (and only that import) is swapped for a throwaway test key.
async function cronSend(t, isoNow) {
  const subtle = webcrypto.subtle;
  const ua = await subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const uaPub = new Uint8Array(await subtle.exportKey("raw", ua.publicKey));
  const auth = webcrypto.getRandomValues(new Uint8Array(16));
  const b64u = (u) => Buffer.from(u).toString("base64url");
  const signer = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  const origImport = subtle.importKey.bind(subtle);
  const m = mock.method(globalThis.crypto.subtle, "importKey", (format, ...rest) => (format === "jwk" ? Promise.resolve(signer.privateKey) : origImport(format, ...rest)));
  t.after(() => m.mock.restore());
  mock.timers.enable({ apis: ["Date"], now: new Date(isoNow) });
  t.after(() => mock.timers.reset());
  const calls = stubFetch(t, async () => new Response(null, { status: 201 }));
  const env = mkEnv({ VAPID_PRIVATE: "unused-in-test" });
  env.NOTES.m.set("sub:jerusha", JSON.stringify([{ endpoint: "https://push.example/send/abc", keys: { p256dh: b64u(uaPub), auth: b64u(auth) } }]));
  await worker.scheduled({}, env);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://push.example/send/abc");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers["Content-Encoding"], "aes128gcm");
  const log = JSON.parse(env.NOTES.m.get("pushlog:jerusha"));
  assert.deepEqual(log.results, ["push.example -> 201"]);
  assert.equal(log.ts, new Date(isoNow).toISOString());
  assert.equal(env.NOTES.m.has("pushlog:me"), false, "cron pushes to jerusha only");

  // decrypt: salt(16) | rs(4) | idlen(1) | ephemeral pub(65) | ciphertext
  const body = new Uint8Array(calls[0].init.body);
  const salt = body.slice(0, 16), ephPub = body.slice(21, 86), ct = body.slice(86);
  const te = new TextEncoder();
  const cat = (...a) => new Uint8Array(Buffer.concat(a.map((x) => Buffer.from(x))));
  const hkdf = async (s, ikm, info, len) => new Uint8Array(await subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: s, info }, await origImport("raw", ikm, "HKDF", false, ["deriveBits"]), len * 8));
  const ephKey = await origImport("raw", ephPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await subtle.deriveBits({ name: "ECDH", public: ephKey }, ua.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(te.encode("WebPush: info\0"), uaPub, ephPub), 32);
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const pt = new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: nonce }, await origImport("raw", cek, "AES-GCM", false, ["decrypt"]), ct));
  assert.equal(pt[pt.length - 1], 2);
  return JSON.parse(new TextDecoder().decode(pt.slice(0, -1)));
}

test("cron: a fixed Alaska date sends that date's line", async (t) => {
  const sent = await cronSend(t, "2026-07-01T03:00:00Z");
  const want = alaskaLines()["2026-07-01"];
  assert.ok(want && want.length > 10);
  assert.equal(sent.body, want);
  assert.equal(affirmLines().includes(sent.body), false);
});

test("cron: first and last Alaska dates resolve too (evening run, same UTC day)", async (t) => {
  assert.equal((await cronSend(t, "2026-07-07T16:00:00Z")).body, alaskaLines()["2026-07-07"]);
});

test("cron: a date with no line sends the AFFIRM entry for that day of month", async (t) => {
  const sent = await cronSend(t, "2026-11-12T03:00:00Z");
  const lines = affirmLines();
  assert.ok(lines.includes(sent.body));
  assert.equal(sent.body, lines[12 % lines.length]);
  assert.equal(Object.values(alaskaLines()).includes(sent.body), false);
});

test("cron: the day after the Alaska voyage falls back to AFFIRM", async (t) => {
  const sent = await cronSend(t, "2026-07-08T03:00:00Z");
  assert.ok(affirmLines().includes(sent.body));
});

test("cron: every day of month 1..31 yields a defined AFFIRM line (no undefined body)", async (t) => {
  // No subscriptions: nothing is sent, so assert on the rotation arithmetic the worker
  // uses (getUTCDate() % AFFIRM.length) staying in range.
  const lines = affirmLines();
  for (let d = 1; d <= 31; d++) assert.equal(typeof lines[d % lines.length], "string");
  mock.timers.enable({ apis: ["Date"], now: new Date("2026-12-31T03:00:00Z") });
  t.after(() => mock.timers.reset());
  const env = mkEnv();
  await worker.scheduled({}, env);
  assert.deepEqual(JSON.parse(env.NOTES.m.get("pushlog:jerusha")).results, ["no-subscriptions"]);
  assert.deepEqual(env.NOTES.putOptions.get("pushlog:jerusha"), { expirationTtl: 604800 });
});

/* ---------- /cal ---------- */
const ICS = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nSUMMARY:Test événement\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
const SECRET_URL = "https://calendar.example/private/abc123/basic.ics";
const okIcs = async () => new Response(ICS, { status: 200, headers: { "Content-Type": "text/calendar" } });

test("/cal: no token -> 401, and nothing is fetched", async (t) => {
  const calls = stubFetch(t, okIcs);
  const r = await worker.fetch(rq("/cal?who=ken", { auth: false }), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 401);
  assert.equal(calls.length, 0);
});
test("/cal: wrong origin -> 403, and nothing is fetched", async (t) => {
  const calls = stubFetch(t, okIcs);
  const r = await worker.fetch(rq("/cal?who=ken", { headers: { Origin: "https://evil.example" } }), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 403);
  assert.equal(calls.length, 0);
});
test("/cal: bad or missing who -> 400 {error:'bad who'}, nothing fetched", async (t) => {
  const calls = stubFetch(t, okIcs);
  const env = mkEnv({ CAL_KEN_URL: SECRET_URL, CAL_JERUSHA_URL: SECRET_URL });
  for (const q of ["", "?who=", "?who=bob", "?who=Ken", "?who=KEN", "?who=ken%20", "?who=constructor", "?who=__proto__", "?who=toString", "?who=CAL_KEN_URL", "?who=NOTES_TOKEN", "?who=bob&who=ken"]) {
    const r = await worker.fetch(rq("/cal" + q), env);
    assert.equal(r.status, 400, q);
    assert.deepEqual(await r.json(), { error: "bad who" });
  }
  assert.equal(calls.length, 0);
});
test("/cal: secret unset -> 404 {error:'calendar not configured'}", async (t) => {
  const calls = stubFetch(t, okIcs);
  for (const env of [mkEnv(), mkEnv({ CAL_KEN_URL: "" }), mkEnv({ CAL_KEN_URL: "   " }), mkEnv({ CAL_JERUSHA_URL: SECRET_URL })]) {
    const r = await worker.fetch(rq("/cal?who=ken"), env);
    assert.equal(r.status, 404);
    assert.deepEqual(await r.json(), { error: "calendar not configured" });
  }
  assert.equal(calls.length, 0);
});
test("/cal: non-https secret -> 500 {error:'calendar misconfigured'}, nothing fetched", async (t) => {
  const calls = stubFetch(t, okIcs);
  for (const bad of ["http://calendar.example/basic.ics", "HTTP://calendar.example/x", "ftp://calendar.example/x", "file:///etc/passwd", "data:text/calendar,BEGIN", "javascript:alert(1)", "not a url", "//calendar.example/x", "webcal:calendar.example/x", "webcals://calendar.example/x"]) {
    const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: bad }));
    assert.equal(r.status, 500, bad);
    const j = await r.json();
    assert.deepEqual(j, { error: "calendar misconfigured" });
  }
  assert.equal(calls.length, 0);
});
test("/cal: webcal:// secret is fetched as https://", async (t) => {
  const calls = stubFetch(t, okIcs);
  const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: "webcal://calendar.example/private/abc123/basic.ics" }));
  assert.equal(r.status, 200);
  assert.deepEqual(calls.map((c) => c.url), [SECRET_URL]);
});
test("/cal: upstream 500 -> 502 {error:'calendar unreachable'}", async (t) => {
  stubFetch(t, async () => new Response("boom", { status: 500 }));
  const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 502);
  assert.deepEqual(await r.json(), { error: "calendar unreachable" });
});
test("/cal: upstream 404 -> 502, and the upstream body is not relayed", async (t) => {
  stubFetch(t, async () => new Response("upstream secret detail", { status: 404 }));
  const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 502);
  assert.equal(await r.text(), JSON.stringify({ error: "calendar unreachable" }));
});
test("/cal: network error -> 502, and the error text does not leak the secret URL", async (t) => {
  stubFetch(t, async () => { throw new TypeError("fetch failed: " + SECRET_URL); });
  const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 502);
  const text = await r.text();
  assert.equal(text, JSON.stringify({ error: "calendar unreachable" }));
  assert.equal(text.includes("abc123"), false);
});
test("/cal: body over 2 MB -> 502 {error:'calendar too large'} (no Content-Length to trust)", async (t) => {
  const chunk = new Uint8Array(1024 * 1024).fill(65);
  stubFetch(t, async () => { let n = 0; return new Response(new ReadableStream({ pull(c) { if (n++ < 3) c.enqueue(chunk); else c.close(); } }), { status: 200 }); });
  const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 502);
  assert.deepEqual(await r.json(), { error: "calendar too large" });
});
test("/cal: declared Content-Length over 2 MB -> 502 too large", async (t) => {
  stubFetch(t, async () => new Response("x", { status: 200, headers: { "Content-Length": "2097153" } }));
  const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 502);
  assert.deepEqual(await r.json(), { error: "calendar too large" });
});
test("/cal: exactly 2 MB is allowed", async (t) => {
  stubFetch(t, async () => new Response(new Uint8Array(2097152).fill(65), { status: 200 }));
  const r = await worker.fetch(rq("/cal?who=ken"), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 200);
  assert.equal((await r.arrayBuffer()).byteLength, 2097152);
});
test("/cal: success returns the ICS as-is with text/calendar, CORS and no-store; stores nothing", async (t) => {
  const calls = stubFetch(t, okIcs);
  const env = mkEnv({ CAL_KEN_URL: SECRET_URL });
  const r = await worker.fetch(rq("/cal?who=ken", { headers: { Origin: ORIGIN } }), env);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Content-Type"), "text/calendar; charset=utf-8");
  assert.equal(r.headers.get("Cache-Control"), "no-store");
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.deepEqual(Buffer.from(await r.arrayBuffer()), Buffer.from(ICS, "utf8"));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, SECRET_URL);
  assert.equal(calls[0].init.method, "GET");
  assert.equal(calls[0].init.redirect, "follow");
  assert.ok(calls[0].init.signal instanceof AbortSignal);
  assert.equal(calls[0].init.headers, undefined, "the caller's Authorization token is not forwarded upstream");
  assert.equal(env.NOTES.m.size, 0);
  assert.equal(env.MEDIA.m.size, 0);
});
test("/cal: who=jerusha uses CAL_JERUSHA_URL only", async (t) => {
  const calls = stubFetch(t, okIcs);
  const r = await worker.fetch(rq("/cal?who=jerusha"), mkEnv({ CAL_KEN_URL: SECRET_URL, CAL_JERUSHA_URL: "https://calendar.example/j.ics" }));
  assert.equal(r.status, 200);
  assert.deepEqual(calls.map((c) => c.url), ["https://calendar.example/j.ics"]);
});
test("/cal: non-GET -> 405, nothing fetched", async (t) => {
  const calls = stubFetch(t, okIcs);
  const r = await worker.fetch(rq("/cal?who=ken", { method: "POST", body: "{}" }), mkEnv({ CAL_KEN_URL: SECRET_URL }));
  assert.equal(r.status, 405);
  assert.equal(calls.length, 0);
});
test("/cal ATTACK: a URL supplied in the request is never fetched; only the secret's URL is", async (t) => {
  const calls = stubFetch(t, okIcs);
  const env = mkEnv({ CAL_KEN_URL: SECRET_URL });
  const evil = "https://evil.example/";
  const e = encodeURIComponent(evil);
  const attempts = [
    rq("/cal?who=ken&url=https://evil.example/"),
    rq("/cal?url=https://evil.example/&who=ken"),
    rq("/cal?who=ken&u=" + e + "&target=" + e + "&href=" + e + "&src=" + e + "&feed=" + e + "&ics=" + e + "&CAL_KEN_URL=" + e + "&cal=" + e + "&to=" + e + "&redirect=" + e),
    rq("/cal?who=ken&who=" + e),
    rq("/cal?who=ken#" + evil),
    rq("/cal?who=ken", { headers: { "X-Url": evil, "X-Forwarded-Host": "evil.example", "Referer": evil, "X-Original-URL": evil } }),
  ];
  for (const a of attempts) {
    const r = await worker.fetch(a, env);
    assert.equal(r.status, 200);
    assert.equal(await r.text(), ICS);
  }
  assert.equal(calls.length, attempts.length);
  for (const c of calls) assert.equal(c.url, SECRET_URL);
  assert.equal(calls.some((c) => c.url.includes("evil")), false);
  // and with NO secret set, the supplied URL does not become the fallback
  const r2 = await worker.fetch(rq("/cal?who=ken&url=https://evil.example/"), mkEnv());
  assert.equal(r2.status, 404);
  // and a URL as `who` is rejected outright
  const r3 = await worker.fetch(rq("/cal?who=" + e), env);
  assert.equal(r3.status, 400);
  assert.equal(calls.length, attempts.length, "no further fetches");
});
