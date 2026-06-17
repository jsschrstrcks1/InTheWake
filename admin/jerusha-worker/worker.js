// Jerusha notes relay — Cloudflare Worker (Slice 1: zero-knowledge two-way thread)
//
// Stores CIPHERTEXT ONLY. Notes are AES-GCM-encrypted in the browser before they
// reach here, so this Worker and its KV never see plaintext. See README.md for the
// board review (CTO department) that shaped this design and for deploy + runbook.
//
// Board-required design points baked in:
//  - Systems Maintainer: ONE KV key per note (note:<isots>-<uuid>) — a pure write,
//    so there is NO read-modify-write race and NO need for Durable Objects.
//  - Engineer-Founder: this is the irreducible relay. Push is a SEPARATE later slice.
//  - Frontend Perf: `?since=` makes steady-state polls fetch ~0 notes; incremental.

const ALLOW_ORIGIN = "https://cruisinginthewake.com"; // CORS lock (the page origin)
const MAX_BYTES = 4096;   // per-note request cap (also the abuse cap)
const MAX_RETURN = 2000;  // safety bound on notes returned

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Vary": "Origin",
    ...extra,
  };
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}
// Bearer is a cheap bot-filter, NOT real auth (it ships inside the page). The real
// protection is the E2EE: a leaker can only post junk ciphertext, which won't decrypt.
function authorized(req, env) {
  const h = req.headers.get("Authorization") || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : "";
  return !!env.NOTES_TOKEN && t.length === env.NOTES_TOKEN.length && t === env.NOTES_TOKEN;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    if (url.pathname !== "/notes") return json({ error: "not found" }, 404);

    const origin = req.headers.get("Origin");
    if (origin && origin !== ALLOW_ORIGIN) return json({ error: "origin" }, 403);
    if (!authorized(req, env)) return json({ error: "unauthorized" }, 401);

    if (req.method === "GET") {
      const since = url.searchParams.get("since") || "";
      const listed = await env.NOTES.list({ prefix: "note:", limit: 1000 });
      // keys sort lexicographically == chronologically (ISO ts). Keep only ts > since.
      const names = listed.keys
        .map((k) => k.name)
        .filter((n) => n.slice(5) > since)
        .slice(-MAX_RETURN);
      const out = [];
      for (const name of names) {
        const v = await env.NOTES.get(name);
        if (v) out.push(JSON.parse(v));
      }
      out.sort((a, b) => (a.ts < b.ts ? -1 : 1));
      return json({ notes: out });
    }

    if (req.method === "POST") {
      const body = await req.text();
      if (body.length > MAX_BYTES) return json({ error: "too large" }, 413);
      let n;
      try { n = JSON.parse(body); } catch { return json({ error: "bad json" }, 400); }
      if (!n || typeof n.iv !== "string" || typeof n.ct !== "string" ||
          (n.sender !== "jerusha" && n.sender !== "me")) {
        return json({ error: "bad shape" }, 400);
      }
      const ts = new Date().toISOString();   // server timestamp — never trust the client clock
      const id = crypto.randomUUID();
      const rec = { v: 1, id, sender: n.sender, ts, iv: n.iv, ct: n.ct };
      await env.NOTES.put(`note:${ts}-${id}`, JSON.stringify(rec));
      // Slice 2 (deferred): notify the OTHER party via a contentless Web Push here.
      // The SW has no decryption key, so the push body stays generic; content is
      // fetched + decrypted in-app when she/you open the page.
      return json({ ok: true, id, ts }, 201);
    }

    return json({ error: "method not allowed" }, 405);
  },
};
