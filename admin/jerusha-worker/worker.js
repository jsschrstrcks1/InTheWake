// Jerusha notes relay + Web Push — Cloudflare Worker (Slice 1 + Slice 2)
//
// Slice 1: zero-knowledge notes relay (POST/GET /notes), ciphertext only.
// Slice 2: Web Push —
//   POST /subscribe {role, subscription}  -> store push subscription in KV
//   on a new note                          -> contentless push to the OTHER role
//   Cron                                   -> daily gentle push to Jerusha (encrypted body)
//
// VAPID private key is a Worker SECRET (wrangler secret put VAPID_PRIVATE). The
// public key below is public by design. See README.md for deploy + the redeploy steps.

const ALLOW_ORIGIN = "https://cruisinginthewake.com";
const MAX_BYTES = 4096, MAX_RETURN = 2000;
const VAPID_PUBLIC = "BEL3ZiWyByJhb13fxPkKHmyFKjP-153wslofMSl4Wh334a_9MXu65xEMzbrVF_2jlSNWdDkL3nSq0_k-UQOhftE";
const VAPID_SUBJECT = "mailto:jcr.chilis@gmail.com";

// Daily push lines (editable). Cruise dates keyed; otherwise a gentle rotation.
const DAILY = {
  "2026-06-28": "Flying to Seattle today — the trip toward you (eventually) begins. 💛",
  "2026-06-29": "Boarding the ship in Seattle. Wish you were walking up the gangway with me.",
  "2026-06-30": "A whole day at sea. I'll be in the hot tub by 9 thinking of you.",
  "2026-07-01": "Sitka this morning, then the bears this afternoon. Picking you up a little something.",
  "2026-07-02": "Skagway — riding the White Pass railway up into the mountains. The views will be unreal.",
  "2026-07-03": "Up early for Dawes Glacier, then whales. Two of my favorite things; you're the third I'm missing.",
  "2026-07-04": "Last sea day. Slow morning, pool later. Counting down to seeing you.",
  "2026-07-05": "Victoria tonight — harbor lights and gardens. Saving it all to tell you.",
  "2026-07-06": "Off the ship in Seattle. The trip's behind me; you're still ahead of me.",
  "2026-07-07": "Flying home today. Wish the next flight was toward you.",
};
const AFFIRM = [
  "Good morning, love. You are thought of.",
  "You are with me here, even an ocean away. 💛",
  "Thinking of you first thing today.",
  "Wherever you are, you're carried with me.",
];

/* ---------- helpers ---------- */
function cors(x = {}) { return { "Access-Control-Allow-Origin": ALLOW_ORIGIN, "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Authorization,Content-Type", "Vary": "Origin", ...x }; }
function json(o, s = 200) { return new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", ...cors() } }); }
// Auth = the shared bot-filter token. Accept it three ways so different clients
// can all reach the worker: Bearer header (the page), HTTP Basic password
// (OwnTracks on iOS, which can't set a Bearer header), or a ?k= query param.
function authed(req, env) {
  const T = env.NOTES_TOKEN; if (!T) return false;
  const eq = (t) => typeof t === "string" && t.length === T.length && t === T;
  const h = req.headers.get("Authorization") || "";
  if (h.startsWith("Bearer ")) return eq(h.slice(7));
  if (h.startsWith("Basic ")) { try { const d = atob(h.slice(6)); return eq(d.slice(d.indexOf(":") + 1)); } catch (_) { return false; } }
  return eq(new URL(req.url).searchParams.get("k"));
}
function b64uTo(b) { b = b.replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "="; const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
function toB64u(buf) { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function cat() { let n = 0; for (const a of arguments) n += a.length; const o = new Uint8Array(n); let p = 0; for (const a of arguments) { o.set(a, p); p += a.length; } return o; }
const enc = (s) => new TextEncoder().encode(s);

/* ---------- VAPID (RFC 8292) ---------- */
async function buildJwt(endpoint, vapidPrivate) {
  const aud = new URL(endpoint).origin;
  const xy = b64uTo(VAPID_PUBLIC);
  const jwk = { kty: "EC", crv: "P-256", x: toB64u(xy.slice(1, 33)), y: toB64u(xy.slice(33, 65)), d: vapidPrivate, ext: true };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const header = toB64u(enc(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = toB64u(enc(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: VAPID_SUBJECT })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc(header + "." + payload));
  return header + "." + payload + "." + toB64u(sig);
}

/* ---------- payload encryption (RFC 8291 / aes128gcm) ---------- */
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
async function encryptPayload(sub, plaintext) {
  const asPub = b64uTo(sub.keys.p256dh), auth = b64uTo(sub.keys.auth);
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const ephPub = new Uint8Array(await crypto.subtle.exportKey("raw", eph.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", asPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(enc("WebPush: info\0"), asPub, ephPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const rec = cat(enc(plaintext), new Uint8Array([2])); // single record, 0x02 delimiter
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, rec));
  const rs = new Uint8Array([0, 0, 16, 0]); // record size 4096
  return cat(salt, rs, new Uint8Array([65]), ephPub, ct);
}
async function sendPush(sub, text, env) {
  const jwt = await buildJwt(sub.endpoint, env.VAPID_PRIVATE);
  const headers = { "Authorization": "vapid t=" + jwt + ", k=" + VAPID_PUBLIC, "TTL": "86400" };
  let body;
  if (text) { headers["Content-Encoding"] = "aes128gcm"; headers["Content-Type"] = "application/octet-stream"; body = await encryptPayload(sub, text); }
  return fetch(sub.endpoint, { method: "POST", headers, body });
}
async function pushRole(env, role, text) {
  const raw = await env.NOTES.get("sub:" + role);
  if (!raw) return;
  let subs = JSON.parse(raw), changed = false;
  await Promise.all(subs.map(async (s) => { try { const r = await sendPush(s, text, env); if (r.status === 404 || r.status === 410) { s._dead = 1; changed = true; } } catch (_) {} }));
  if (changed) await env.NOTES.put("sub:" + role, JSON.stringify(subs.filter((s) => !s._dead)));
}

/* ---------- HTTP ---------- */
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    const origin = req.headers.get("Origin");
    if (origin && origin !== ALLOW_ORIGIN) return json({ error: "origin" }, 403);
    if (!authed(req, env)) return json({ error: "unauthorized" }, 401);

    if (url.pathname === "/subscribe" && req.method === "POST") {
      const body = await req.text();
      if (body.length > MAX_BYTES) return json({ error: "too large" }, 413);
      let d; try { d = JSON.parse(body); } catch { return json({ error: "bad json" }, 400); }
      if ((d.role !== "jerusha" && d.role !== "me") || !d.subscription || !d.subscription.endpoint) return json({ error: "bad shape" }, 400);
      const keyName = "sub:" + d.role;
      let subs = []; const cur = await env.NOTES.get(keyName); if (cur) subs = JSON.parse(cur);
      if (!subs.some((s) => s.endpoint === d.subscription.endpoint)) subs.push(d.subscription);
      await env.NOTES.put(keyName, JSON.stringify(subs.slice(-10)));
      return json({ ok: true }, 201);
    }

    // Live location breadcrumb (Slice 4). Source: a background reporter on Ken's
    // phone (e.g. OwnTracks, HTTP mode + bearer). Coords are COARSENED (~110 m) and
    // every fix carries a 10-day TTL, so the trail self-prunes to the trip window.
    if (url.pathname === "/loc") {
      if (req.method === "POST") {
        const body = await req.text();
        if (body.length > MAX_BYTES) return json({ error: "too large" }, 413);
        let d; try { d = JSON.parse(body); } catch { return json({ error: "bad json" }, 400); }
        const lat = Number(d.lat), lon = Number(d.lon); // OwnTracks sends {_type:"location",lat,lon,tst}
        if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return json({ error: "bad coords" }, 400);
        const ts = new Date().toISOString();
        const rec = { v: 1, lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000, ts };
        await env.NOTES.put("loc:" + ts, JSON.stringify(rec), { expirationTtl: 864000 }); // 10 days
        return json([]); // OwnTracks expects a JSON array (friend cards); empty is fine

      }
      if (req.method === "GET") {
        const since = url.searchParams.get("since") || "";
        const listed = await env.NOTES.list({ prefix: "loc:", limit: 1000 });
        const names = listed.keys.map((k) => k.name).filter((n) => n.slice(4) > since).slice(-MAX_RETURN);
        const points = [];
        for (const name of names) { const v = await env.NOTES.get(name); if (v) points.push(JSON.parse(v)); }
        points.sort((a, b) => (a.ts < b.ts ? -1 : 1));
        return json({ points });
      }
      return json({ error: "method not allowed" }, 405);
    }

    // Restore from a backup file (Slice 5b). Body {notes:[{id,sender,ts,iv,ct},...]}.
    // Re-seeds KV using each record's OWN id+ts, so re-importing is idempotent (same
    // key overwrites identical data — no duplicates). Bigger size cap than /notes.
    if (url.pathname === "/import" && req.method === "POST") {
      const body = await req.text();
      if (body.length > 1048576) return json({ error: "too large" }, 413); // 1 MB
      let d; try { d = JSON.parse(body); } catch { return json({ error: "bad json" }, 400); }
      const arr = (d && Array.isArray(d.notes)) ? d.notes : (Array.isArray(d) ? d : null);
      if (!arr) return json({ error: "bad shape" }, 400);
      if (arr.length > 2000) return json({ error: "too many" }, 413);
      let n = 0;
      for (const r of arr) {
        if (!r || typeof r.iv !== "string" || typeof r.ct !== "string" || (r.sender !== "jerusha" && r.sender !== "me")) continue;
        const id = (typeof r.id === "string" && r.id) ? r.id : crypto.randomUUID();
        const ts = (typeof r.ts === "string" && r.ts) ? r.ts : new Date().toISOString();
        await env.NOTES.put("note:" + ts + "-" + id, JSON.stringify({ v: 1, id, sender: r.sender, ts, iv: r.iv, ct: r.ct }));
        n++;
      }
      return json({ ok: true, imported: n }, 201);
    }

    if (url.pathname !== "/notes") return json({ error: "not found" }, 404);

    if (req.method === "GET") {
      const since = url.searchParams.get("since") || "";
      const listed = await env.NOTES.list({ prefix: "note:", limit: 1000 });
      const names = listed.keys.map((k) => k.name).filter((n) => n.slice(5) > since).slice(-MAX_RETURN);
      const out = [];
      for (const name of names) { const v = await env.NOTES.get(name); if (v) out.push(JSON.parse(v)); }
      out.sort((a, b) => (a.ts < b.ts ? -1 : 1));
      // tombstones: ids the clients should drop from their local caches (delete propagation)
      const del = await env.NOTES.list({ prefix: "del:", limit: 1000 });
      return json({ notes: out, deletions: del.keys.map((k) => k.name.slice(4)) });
    }
    if (req.method === "POST") {
      const body = await req.text();
      if (body.length > MAX_BYTES) return json({ error: "too large" }, 413);
      let n; try { n = JSON.parse(body); } catch { return json({ error: "bad json" }, 400); }
      if (!n || typeof n.iv !== "string" || typeof n.ct !== "string" || (n.sender !== "jerusha" && n.sender !== "me")) return json({ error: "bad shape" }, 400);
      const ts = new Date().toISOString(), id = crypto.randomUUID();
      await env.NOTES.put("note:" + ts + "-" + id, JSON.stringify({ v: 1, id, sender: n.sender, ts, iv: n.iv, ct: n.ct }));
      // contentless push to the OTHER party (no payload encryption needed)
      const other = n.sender === "jerusha" ? "me" : "jerusha";
      await pushRole(env, other, null);
      return json({ ok: true, id, ts }, 201);
    }
    if (req.method === "DELETE") {
      const id = url.searchParams.get("id") || "";
      if (!id) return json({ error: "no id" }, 400);
      // find the one note key that ends with -<id> and remove it
      const listed = await env.NOTES.list({ prefix: "note:", limit: 1000 });
      const k = listed.keys.find((x) => x.name.endsWith("-" + id));
      if (k) await env.NOTES.delete(k.name);
      // leave a tombstone so the OTHER device drops it from its cache on next sync.
      // 90-day TTL: by then the note is long gone from every client anyway.
      await env.NOTES.put("del:" + id, "1", { expirationTtl: 7776000 });
      return json({ ok: true, deleted: k ? 1 : 0 });
    }
    return json({ error: "method not allowed" }, 405);
  },

  // Cron: gentle daily push to Jerusha (encrypted body)
  async scheduled(event, env) {
    const today = new Date().toISOString().slice(0, 10);
    const body = DAILY[today] || AFFIRM[new Date().getUTCDate() % AFFIRM.length];
    await pushRole(env, "jerusha", JSON.stringify({ title: "💛 In the Wake", body }));
  },
};
