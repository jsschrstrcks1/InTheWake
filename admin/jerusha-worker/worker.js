// READ FIRST: admin/claude/plans/jerusha-SYSTEM-OVERVIEW.md (how the whole app works) and
// admin/jerusha-worker/CHANGE-GUIDE.md (how to change and deploy this file; back up before deploying).
//
// Jerusha notes relay + Web Push — Cloudflare Worker (Slice 1 + Slice 2)
//
// Slice 1: zero-knowledge notes relay (POST/GET /notes), ciphertext only.
// Slice 2: Web Push —
//   POST /subscribe {role, subscription}  -> store push subscription in KV
//   on a new note                          -> contentless push to the OTHER role
//   Cron                                   -> daily gentle push to Jerusha (encrypted body)
// Calendar: GET /cal?who=ken -> read-only ICS relay from a secret URL (NOT zero-knowledge).
//
// VAPID private key is a Worker SECRET (wrangler secret put VAPID_PRIVATE). The
// public key below is public by design. See README.md for deploy + the redeploy steps.

const ALLOW_ORIGIN = "https://cruisinginthewake.com";
const MAX_BYTES = 4096, MAX_RETURN = 2000;
const VAPID_PUBLIC = "BEL3ZiWyByJhb13fxPkKHmyFKjP-153wslofMSl4Wh334a_9MXu65xEMzbrVF_2jlSNWdDkL3nSq0_k-UQOhftE";
const VAPID_SUBJECT = "mailto:jcr.chilis@gmail.com";
// GET /cal: which Worker SECRET holds each person's calendar feed URL, and its limits.
const CAL_SECRETS = { ken: "CAL_KEN_URL", jerusha: "CAL_JERUSHA_URL" };
const CAL_MAX_BYTES = 2097152, CAL_TIMEOUT_MS = 10000; // 2 MB, 10 s

// Daily push lines, per voyage: voyage id -> { "YYYY-MM-DD" (UTC): line }. The cron
// looks today's date up across ALL voyages (see datedLine); a date with no line falls
// back to the AFFIRM rotation. Keyed by voyage so one trip's lines can be added or
// retired without touching another's.
const VOYAGE_PUSH = {
  "anthem-alaska": {
    "2026-06-28": "Flying to Seattle today. Not toward you, I know — but I carry you every mile of it. 💛",
    "2026-06-29": "Boarding the ship in Seattle. Wish you were walking up the gangway with me.",
    "2026-06-30": "A whole day at sea. I'll be in the hot tub by 9 thinking of you.",
    "2026-07-01": "Sitka this morning, then the bears this afternoon. Picking you up a little something.",
    "2026-07-02": "Skagway — riding the White Pass railway up into the mountains. The views will be unreal.",
    "2026-07-03": "Up early for Dawes Glacier, then whales. Two of my favorite things; you're the third I'm missing.",
    "2026-07-04": "Last sea day. Slow morning, pool later — counting the days till the one I finally make it to you.",
    "2026-07-05": "Victoria tonight — harbor lights and gardens. Saving it all to tell you.",
    "2026-07-06": "Off the ship in Seattle. The trip's behind me; you're still ahead of me.",
    "2026-07-07": "Flying home today. Wish the next flight was toward you.",
  },
  // These lines are written by Ken, the operator, in his own words. They must NEVER
  // be invented, drafted or filled in by anyone else (human or agent). Empty means
  // the cron falls back to AFFIRM on this voyage's dates, which is the correct
  // behaviour until Ken writes them.
  "world-america-dec": {},
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
// Today's dated line from whichever voyage has one, else null (caller falls back to AFFIRM).
// hasOwn, not a bare index: the lookup key must never resolve to an Object.prototype member.
function datedLine(day) {
  for (const voyage of Object.keys(VOYAGE_PUSH)) {
    const lines = VOYAGE_PUSH[voyage];
    if (Object.hasOwn(lines, day) && lines[day]) return lines[day];
  }
  return null;
}
// KV list() returns at most 1000 keys per call. A single call silently truncates past
// that: the NEWEST notes vanish from GET (keys sort oldest-first) and DELETE cannot
// find anything beyond the first page. Follow the cursor until list_complete and
// return every key name under the prefix, in KV's lexicographic (= oldest-first) order.
async function listAll(env, prefix) {
  const names = [];
  let cursor;
  for (;;) {
    const page = await env.NOTES.list(cursor ? { prefix, limit: 1000, cursor } : { prefix, limit: 1000 });
    for (const k of page.keys) names.push(k.name);
    // Stop on list_complete; also stop if no cursor came back, so a malformed page
    // can never spin this loop forever.
    if (page.list_complete || !page.cursor) break;
    cursor = page.cursor;
  }
  return names;
}

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
  const results = [];
  const raw = await env.NOTES.get("sub:" + role);
  if (!raw || !JSON.parse(raw).length) {
    await env.NOTES.put("pushlog:" + role, JSON.stringify({ ts: new Date().toISOString(), results: ["no-subscriptions"] }), { expirationTtl: 604800 });
    return results;
  }
  let subs = JSON.parse(raw), changed = false;
  await Promise.all(subs.map(async (s) => {
    const host = (() => { try { return new URL(s.endpoint).host; } catch { return "?"; } })();
    try {
      const r = await sendPush(s, text, env);
      results.push(host + " -> " + r.status);
      if (r.status === 404 || r.status === 410) { s._dead = 1; changed = true; }
    } catch (e) { results.push(host + " -> ERROR: " + (e && e.message ? e.message : String(e))); }
  }));
  if (changed) await env.NOTES.put("sub:" + role, JSON.stringify(subs.filter((s) => !s._dead)));
  await env.NOTES.put("pushlog:" + role, JSON.stringify({ ts: new Date().toISOString(), results }), { expirationTtl: 604800 });
  return results;
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

    // Push diagnostics. GET /push-status: subscription counts + endpoint hosts per
    // role, whether VAPID_PRIVATE is set, and the last push attempt's outcomes
    // (pushlog). POST /push-test {role}: fires a real test notification at that
    // role and returns the per-subscription results — turns silent failure into
    // a status code you can read.
    if (url.pathname === "/push-status" && req.method === "GET") {
      const out = { vapidPrivateSet: !!env.VAPID_PRIVATE, roles: {} };
      for (const role of ["jerusha", "me"]) {
        const raw = await env.NOTES.get("sub:" + role);
        const subs = raw ? JSON.parse(raw) : [];
        const log = await env.NOTES.get("pushlog:" + role);
        out.roles[role] = {
          subscriptions: subs.length,
          endpoints: subs.map((x) => { try { return new URL(x.endpoint).host; } catch { return "?"; } }),
          lastPush: log ? JSON.parse(log) : null,
        };
      }
      return json(out, 200);
    }
    if (url.pathname === "/push-test" && req.method === "POST") {
      let d; try { d = JSON.parse(await req.text()); } catch { return json({ error: "bad json" }, 400); }
      if (d.role !== "jerusha" && d.role !== "me") return json({ error: "bad role" }, 400);
      const results = await pushRole(env, d.role, JSON.stringify({ title: "\ud83d\udc9b In the Wake", body: "Test nudge \u2014 alerts are working." }));
      return json({ role: d.role, results }, 200);
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
        // Honor the FIX time (OwnTracks tst, epoch seconds) when sane. Queued fixes flush in
        // bursts on ship/hotel WiFi, and import-gpx.mjs replays past points — server-stamping
        // either collapses a whole day onto the flush moment. Bounds: ≤90 d past, ≤10 min future.
        let ts = null;
        const tst = Number(d.tst);
        if (isFinite(tst) && tst > 0) {
          const ms = tst * 1000, now = Date.now();
          if (ms >= now - 7776000000 && ms <= now + 600000) ts = new Date(ms).toISOString();
        }
        if (!ts) ts = new Date().toISOString();
        const rec = { v: 1, lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000, ts };
        await env.NOTES.put("loc:" + ts, JSON.stringify(rec), { expirationTtl: 864000 }); // 10 days
        return json([]); // OwnTracks expects a JSON array (friend cards); empty is fine

      }
      if (req.method === "GET") {
        const since = url.searchParams.get("since") || "";
        const names = (await listAll(env, "loc:")).filter((n) => n.slice(4) > since).slice(-MAX_RETURN);
        const points = [];
        for (const name of names) { const v = await env.NOTES.get(name); if (v) points.push(JSON.parse(v)); }
        points.sort((a, b) => (a.ts < b.ts ? -1 : 1));
        return json({ points });
      }
      return json({ error: "method not allowed" }, 405);
    }

    // Encrypted media gallery (photos + videos). Ciphertext blobs in R2 (binding
    // MEDIA), small metadata in KV. R2 object = [12-byte IV][AES-GCM ct]; zero-knowledge.
    // Metadata carries optional lat/lon/day so photos can surface on the map by day.
    if (url.pathname === "/media" || url.pathname.startsWith("/media/")) {
      if (!env.MEDIA) return json({ error: "media bucket missing" }, 500);
      const pid = url.pathname.startsWith("/media/") ? decodeURIComponent(url.pathname.slice(7)) : (url.searchParams.get("id") || "");
      if (req.method === "POST") {
        const id = pid || crypto.randomUUID();
        const q = url.searchParams;
        const kind = q.get("kind") === "video" ? "video" : "photo";
        const mime = (q.get("mime") || "").slice(0, 80);
        const lat = q.get("lat") != null && isFinite(Number(q.get("lat"))) ? Number(q.get("lat")) : null;
        const lon = q.get("lon") != null && isFinite(Number(q.get("lon"))) ? Number(q.get("lon")) : null;
        const day = (q.get("day") || "").slice(0, 12) || null;
        // Who uploaded it. Only the two roles are valid; anything else (or absent) is
        // stored as null rather than guessed. Records written before this field existed
        // simply have no `by` and are left alone.
        const byQ = q.get("by");
        const by = byQ === "jerusha" || byQ === "me" ? byQ : null;
        const len = Number(req.headers.get("content-length") || 0);
        if (len > 230686720) return json({ error: "too large" }, 413); // 220 MB ciphertext (chunked video)
        await env.MEDIA.put("media/" + id, req.body);
        const ts = new Date().toISOString();
        await env.NOTES.put("media:" + ts + "-" + id, JSON.stringify({ v: 1, id, kind, mime, lat, lon, day, by, ts }));
        return json({ ok: true, id, ts }, 201);
      }
      if (req.method === "GET" && !pid) {
        const out = [];
        for (const name of await listAll(env, "media:")) { const v = await env.NOTES.get(name); if (v) out.push(JSON.parse(v)); }
        out.sort((a, b) => (a.ts < b.ts ? -1 : 1));
        return json({ media: out });
      }
      if (req.method === "GET" && pid) {
        const obj = await env.MEDIA.get("media/" + pid);
        if (!obj) return json({ error: "not found" }, 404);
        return new Response(obj.body, { headers: { "Content-Type": "application/octet-stream", ...cors() } });
      }
      // Replace the bytes of ONE existing blob, and nothing else (the re-key tool,
      // admin/jerusha-worker/jerusha-rekey.mjs). Unlike POST, this writes no metadata
      // record, so the gallery keeps one entry per photo with its date, place and
      // uploader untouched. It refuses an id that does not exist: a replace must never
      // create. A body with no length is refused too, because R2 would store it as a
      // 0-byte photo. The body is streamed, never buffered: a video is far larger than
      // a Worker's memory. Not in the CORS method list on purpose: the page never calls this.
      if (req.method === "PUT") {
        if (!pid) return json({ error: "no id" }, 400);
        const len = Number(req.headers.get("content-length") || 0);
        if (!(len > 0)) return json({ error: "empty" }, 400);
        if (len > 230686720) return json({ error: "too large" }, 413);
        if (!(await env.MEDIA.head("media/" + pid))) return json({ error: "not found" }, 404);
        await env.MEDIA.put("media/" + pid, req.body);
        return json({ ok: true, id: pid });
      }
      if (req.method === "DELETE" && pid) {
        await env.MEDIA.delete("media/" + pid);
        const k = (await listAll(env, "media:")).find((name) => name.endsWith("-" + pid));
        if (k) await env.NOTES.delete(k);
        return json({ ok: true });
      }
      return json({ error: "method not allowed" }, 405);
    }

    // Read-only calendar relay: GET /cal?who=ken -> that person's ICS feed, as-is.
    // Sits behind the same origin + token checks as every other route (above).
    //
    // NOT ZERO-KNOWLEDGE. Unlike notes and media, the calendar is plaintext: this
    // worker (and Cloudflare) sees the calendar text in transit. It parses nothing,
    // stores nothing and logs nothing; it only passes the bytes through.
    //
    // The ONLY source of the URL that gets fetched is a Worker secret (CAL_KEN_URL /
    // CAL_JERUSHA_URL). Nothing from the request (query, header or body) is ever
    // used to build it; `who` only selects WHICH secret. A relay that fetched a
    // caller-supplied URL would be an open proxy (SSRF) for anyone holding the token.
    // The secret URL is itself a credential (private feed address), so it is never
    // echoed in a response or an error.
    if (url.pathname === "/cal") {
      if (req.method !== "GET") return json({ error: "method not allowed" }, 405);
      const who = url.searchParams.get("who");
      // hasOwn: "constructor" / "__proto__" must not resolve to a prototype member.
      if (typeof who !== "string" || !Object.hasOwn(CAL_SECRETS, who)) return json({ error: "bad who" }, 400);
      let target = env[CAL_SECRETS[who]];
      if (typeof target !== "string" || !target.trim()) return json({ error: "calendar not configured" }, 404);
      target = target.trim();
      // Calendar apps hand out webcal:// links; that scheme is just https by convention.
      if (target.startsWith("webcal://")) target = "https://" + target.slice(9);
      // https only: never fetch plaintext http, file:, data: or anything else.
      let parsed; try { parsed = new URL(target); } catch { return json({ error: "calendar misconfigured" }, 500); }
      if (parsed.protocol !== "https:") return json({ error: "calendar misconfigured" }, 500);
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), CAL_TIMEOUT_MS); // covers connect AND body read
      try {
        const r = await fetch(target, { method: "GET", redirect: "follow", signal: ac.signal });
        if (!r.ok) return json({ error: "calendar unreachable" }, 502);
        if (Number(r.headers.get("content-length") || 0) > CAL_MAX_BYTES) { ac.abort(); return json({ error: "calendar too large" }, 502); }
        // Content-Length can be absent or wrong, so count the bytes as they arrive and
        // stop at the cap instead of buffering an unbounded body.
        const chunks = []; let total = 0;
        if (r.body) {
          const reader = r.body.getReader();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.length;
            if (total > CAL_MAX_BYTES) { ac.abort(); return json({ error: "calendar too large" }, 502); }
            chunks.push(value);
          }
        }
        // Bytes passed through untouched (no decode/re-encode, nothing parsed).
        return new Response(cat.apply(null, chunks), { status: 200, headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store", ...cors() } });
      } catch (_) {
        return json({ error: "calendar unreachable" }, 502); // network error, abort/timeout
      } finally {
        clearTimeout(timer);
      }
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
      const names = (await listAll(env, "note:")).filter((n) => n.slice(5) > since).slice(-MAX_RETURN);
      const out = [];
      for (const name of names) { const v = await env.NOTES.get(name); if (v) out.push(JSON.parse(v)); }
      out.sort((a, b) => (a.ts < b.ts ? -1 : 1));
      // tombstones: ids the clients should drop from their local caches (delete propagation)
      const del = await listAll(env, "del:");
      return json({ notes: out, deletions: del.map((name) => name.slice(4)) });
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
      const k = (await listAll(env, "note:")).find((name) => name.endsWith("-" + id));
      if (k) await env.NOTES.delete(k);
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
    const body = datedLine(today) || AFFIRM[new Date().getUTCDate() % AFFIRM.length];
    await pushRole(env, "jerusha", JSON.stringify({ title: "💛 In the Wake", body }));
  },
};
