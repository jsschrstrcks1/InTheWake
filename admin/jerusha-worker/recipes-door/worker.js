// The door - Cloudflare Worker `jerusha-recipes`.
//
// One person outside the household network gets READ-ONLY access to ONE Atlas app (recipes)
// and to nothing else:
//
//   phone -> THIS WORKER (allowlist) -> tunnel hostname behind Cloudflare Access (service token)
//         -> cloudflared on the home machine (ingress path rule) -> Atlas on 127.0.0.1
//
// WHY THIS FILE IS THE SECURITY BOUNDARY. By design the door never relies on the app behind
// it to refuse a request: this Worker decides, and the tunnel path rule is the second lock.
// So the rule here is default-deny: a request goes upstream only if its method is GET or HEAD,
// its path survives hygiene unchanged, it carries the door cookie, it is not on the deny list,
// and it matches a room. Everything else is answered here and never leaves the Worker.
//
// Secrets (wrangler secret put ...), never in this file:
//   DOOR_TOKEN               her sign-in token (the link she taps carries it once)
//   DOOR_COOKIE_KEY          optional; change it to sign every device out without a new link
//   UPSTREAM                 https origin of the tunnel hostname
//   CF_ACCESS_CLIENT_ID      Cloudflare Access service token id
//   CF_ACCESS_CLIENT_SECRET  Cloudflare Access service token secret
//
// This Worker logs nothing. A log line is the easiest place for a token or a cookie to leak.

/* ---------- config ---------- */

// ROOMS: what the door opens. A path is allowed only if it EQUALS an `exact` entry, or it
// equals a `prefixes` entry, or it starts with a `prefixes` entry followed by "/". The "/" is
// the boundary: prefix "/recipe/tools" allows "/recipe/tools/scale" and never
// "/recipe/tools-evil" or "/recipe/toolsX". Matching is case-sensitive, as Atlas's routes are
// (they are `path === "..."` comparisons in server.mjs).
//
// TO ADD A ROOM: add a key here with `home`, `exact` and `prefixes`; list every static file the
// page loads and every GET route it calls, exact where you can; add the same paths to the
// cloudflared ingress regex (the tunnel is the second gate and must agree); add tests for the
// new paths and for their look-alikes. Prefer `exact`. Use a prefix only for a family of
// read-only routes you have read on the Atlas side.
export const ROOMS = {
  recipes: {
    home: "/recipes.html",
    exact: [
      // The page and its print view. The static files Atlas really serves by these names.
      "/recipes.html", "/recipes.mjs", "/recipes-print.html", "/recipes-print.mjs",
      "/recipes.webmanifest", "/icons/atlas-recipes.svg",
      // Read routes the page calls with GET (recipes.mjs, recipes-print.mjs).
      "/recipes", "/recipes/random", "/recipes/analyze", "/recipes/bundle", "/recipes/duplicates",
      "/recipes/measures", "/recipes/tips", "/recipes/daily", "/recipes/confidence",
      "/recipes/by-ingredients", "/recipes/suggest", "/recipes/ingredients",
      "/recipe", "/recipe/card", "/recipe/measures",
    ],
    // Two families of read-only table lookups. The page builds the last segment at run time
    // (`/recipe/tools/${tool}`), and on Atlas both are single GET handlers that answer 404 for a
    // name they do not know.
    prefixes: ["/recipe/tools", "/recipes/build"],
  },
};

// DENY: refused even with a valid cookie, even for GET, checked BEFORE the rooms. Most of
// these would fall through the allowlist anyway. They are written down so that a future edit
// to ROOMS (a loose prefix, a new room) cannot quietly open them. An entry refuses itself and
// everything under it.
export const DENY = [
  "/recipe/correct",            // the write route. Never, by any method.
  "/admin", "/helm", "/console", "/api", "/whoami", "/capabilities", "/peers",
  "/photos", "/photo", "/people", "/flock", "/weather", "/flood", "/alerts", "/tropical",
  // The shared Atlas nav shell. It draws links to every other Atlas app, polls weather feeds,
  // and on a heartbeat failure moves the page to another household host (abort-shell.mjs
  // failOver). None of that belongs outside the house. recipes.html loads it as its own
  // <script type="module">, so refusing it leaves the recipes module untouched.
  "/shell-mount.mjs", "/abort-shell.mjs", "/danger-mode.mjs", "/host-race.mjs", "/flood-view.mjs",
  // No service worker through the door: it would cache page chrome on her phone and show an
  // offline page that talks about a tailnet she is not on. The page works without it.
  "/recipes-sw.js", "/pwa-enable.mjs", "/pwa", "/offline-recipes.html",
];

const COOKIE_NAME = "door";
const COOKIE_MAX_AGE = 180 * 24 * 3600;      // about 180 days
const COOKIE_LABEL = "door-cookie-v1";       // bump to sign everyone out by code change
const MIN_TOKEN_LEN = 24;                    // a short DOOR_TOKEN is a guessable one: treat as unset
const MAX_QUERY = 2000;
const UPSTREAM_TIMEOUT_MS = 15000;
// Request headers that may travel upstream. Never Cookie or Authorization: Atlas reads
// credentials from both, and the visitor's must not become Atlas's. Never a Tailscale identity
// header either (Atlas can map those to roles), which an allowlist gives for free.
const FORWARD_REQUEST_HEADERS = ["accept", "accept-language", "if-none-match", "if-modified-since", "range", "user-agent"];
// Response headers that may travel back. An allowlist, so set-cookie, cf-access-* and anything
// not thought of yet are dropped by construction rather than by remembering to strip them.
const RETURN_RESPONSE_HEADERS = ["content-type", "etag", "last-modified", "cache-control", "content-security-policy", "content-range", "accept-ranges"];

/* ---------- small helpers ---------- */

const enc = (s) => new TextEncoder().encode(s);
function hex(buf) { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i++) s += u[i].toString(16).padStart(2, "0"); return s; }

// Constant-time string equality. Both sides are hashed first, so the compare runs over two
// 32-byte digests whatever the inputs were: neither length nor a matching prefix shows in timing.
async function sameSecret(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc(a)), crypto.subtle.digest("SHA-256", enc(b))]);
  const p = new Uint8Array(x), q = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < p.length; i++) diff |= p[i] ^ q[i];
  return diff === 0;
}

// The cookie is NOT the token. It is HMAC-SHA256 keyed by DOOR_TOKEN over a fixed label, so a
// cookie read off the phone does not reveal the sign-in link, and rotating DOOR_TOKEN (or
// DOOR_COOKIE_KEY, which is folded into the message) makes every cookie already issued wrong.
async function cookieValue(env) {
  const key = await crypto.subtle.importKey("raw", enc(env.DOOR_TOKEN), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc(COOKIE_LABEL + "|" + (env.DOOR_COOKIE_KEY || ""))));
}
async function hasDoorCookie(req, env) {
  const want = await cookieValue(env);
  let ok = false;
  for (const part of (req.headers.get("cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0 || part.slice(0, i).trim() !== COOKIE_NAME) continue;
    if (await sameSecret(part.slice(i + 1).trim(), want)) ok = true;
  }
  return ok;
}

// Headers on every answer, ours or relayed.
function baseHeaders(extra = {}) {
  return { "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", ...extra };
}
function page(status, title, line, extra = {}) {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>` +
    `<body style="font:16px/1.5 Georgia,serif;margin:2em;max-width:32em"><h1 style="font-size:1.2em">${title}</h1><p>${line}</p></body></html>`;
  return new Response(body, { status, headers: baseHeaders({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", ...extra }) });
}
function json(status, obj, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: baseHeaders({ "Content-Type": "application/json", "Cache-Control": "no-store", ...extra }) });
}
// Home did not answer. A page for a page, JSON for everything else, and ALWAYS a 502: the
// recipes page turns a non-2xx into "Could not reach Atlas", where an empty 200 would have
// drawn an empty cookbook. Unreachable must never look like empty.
function offline(pathname) {
  if (pathname.endsWith(".html")) return page(502, "Home is offline right now", "The recipes live on a computer at home, and it is not answering. Nothing is wrong with your phone. Please try again later.");
  return json(502, { error: "home offline" });
}

/* ---------- path rules (pure, exported for the tests) ---------- */

// Split the RAW request URL by hand. `new URL()` would tidy "/a/../b" into "/b" before we ever
// looked, and the point of hygiene is to see what was actually sent.
export function splitRawUrl(rawUrl) {
  const m = /^https?:\/\/[^/?#]*(\/[^?#]*)?(?:\?([^#]*))?(?:#.*)?$/i.exec(String(rawUrl));
  if (!m) return null;
  return { path: m[1] || "/", query: m[2] || "" };
}

// Returns the pathname to match on, or null for "refuse with 400". We do not repair a strange
// path, we refuse it: every proxy between here and Atlas (the tunnel, cloudflared's regex,
// Node's URL parser) decodes and normalises a little differently, and an allowlist is only as
// good as the agreement between the string it checked and the string that arrives.
export function cleanPath(rawPath) {
  if (typeof rawPath !== "string" || rawPath[0] !== "/") return null;
  if (rawPath.includes("..")) return null;                    // traversal, and "..;" tricks
  if (rawPath.includes("//")) return null;                    // empty segment, "//host" confusion
  if (rawPath.includes("\\")) return null;                    // backslash is a slash to some parsers
  if (/[\u0000-\u001f\u007f]/.test(rawPath)) return null;     // NUL and control characters
  if (/%(2f|5c|2e)/i.test(rawPath)) return null;              // encoded slash, backslash, dot
  if (rawPath.includes("%")) return null;                     // no allowed path needs any escape at all
  if (!/^[A-Za-z0-9._\/-]+$/.test(rawPath)) return null;      // and none needs any other character
  let normal;
  try { normal = new URL(rawPath, "https://door.invalid").pathname; } catch { return null; }
  if (normal !== rawPath) return null;                        // the parser changed it: refuse
  return normal;
}

const under = (path, base) => path === base || path.startsWith(base + "/");
export function isDenied(path) { return DENY.some((d) => under(path, d)); }
export function roomFor(path) {
  for (const [name, room] of Object.entries(ROOMS)) {
    if (room.exact.includes(path)) return name;
    if (room.prefixes.some((p) => under(path, p))) return name;
  }
  return null;
}

/* ---------- upstream ---------- */

function upstreamOrigin(env) {
  try { const u = new URL(env.UPSTREAM); return u.protocol === "https:" ? u.origin : null; } catch { return null; }
}

async function relay(req, env, origin, pathname, query) {
  // Built from the configured origin and the checked pathname. The request's own host never
  // takes part, so no Host header or absolute-URL trick can point this fetch anywhere else.
  const target = origin + pathname + (query ? "?" + query : "");
  const headers = new Headers();
  for (const h of FORWARD_REQUEST_HEADERS) { const v = req.headers.get(h); if (v) headers.set(h, v); }
  headers.set("CF-Access-Client-Id", env.CF_ACCESS_CLIENT_ID);
  headers.set("CF-Access-Client-Secret", env.CF_ACCESS_CLIENT_SECRET);

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), UPSTREAM_TIMEOUT_MS);
  let up;
  // redirect "manual": a redirect is never followed. Followed, it could walk this Worker, with
  // the Access secret in hand, to a path or a host nobody allowlisted.
  try { up = await fetch(target, { method: req.method, headers, redirect: "manual", signal: ctl.signal }); }
  catch { return offline(pathname); }
  finally { clearTimeout(timer); }

  // No allowlisted Atlas route redirects, so a 3xx here is an Access login bounce or a
  // misconfiguration. 5xx is the tunnel or Atlas down. Both are "home offline", body discarded.
  if (up.status >= 500 || (up.status >= 300 && up.status < 400 && up.status !== 304)) return offline(pathname);
  // Atlas stamps every answer it builds with x-atlas-origin: 1 (server.mjs ATLAS_ORIGIN), put
  // there so that someone else's 200 is not mistaken for Atlas. An Access interstitial or a
  // cloudflared error page does not carry it, and is not shown as if it were the cookbook.
  if (up.headers.get("x-atlas-origin") !== "1") return offline(pathname);

  const out = new Headers(baseHeaders());
  for (const h of RETURN_RESPONSE_HEADERS) { const v = up.headers.get(h); if (v) out.set(h, v); }
  return new Response(req.method === "HEAD" ? null : up.body, { status: up.status, headers: out });   // streamed, not buffered
}

/* ---------- HTTP ---------- */

export default {
  async fetch(req, env) {
    env = env || {};
    // Fail closed on missing configuration, before anything else can answer.
    if (typeof env.DOOR_TOKEN !== "string" || env.DOOR_TOKEN.length < MIN_TOKEN_LEN) return page(503, "Door not configured", "door not configured");
    const origin = upstreamOrigin(env);
    if (!origin || !env.CF_ACCESS_CLIENT_ID || !env.CF_ACCESS_CLIENT_SECRET) return page(503, "Door not configured", "door not configured");

    // The app is served by this Worker to itself: same origin, so no CORS is granted to anyone.
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: baseHeaders({ "Cache-Control": "no-store" }) });
    // READ-ONLY lives here and only here. Atlas would accept the write.
    if (req.method !== "GET" && req.method !== "HEAD") return json(405, { error: "method not allowed" }, { Allow: "GET, HEAD" });

    const raw = splitRawUrl(req.url);
    if (!raw) return json(400, { error: "bad request" });
    const pathname = cleanPath(raw.path);
    if (pathname === null) return json(400, { error: "bad path" });
    if (raw.query.length > MAX_QUERY || /[\u0000- \u007f\\]/.test(raw.query)) return json(400, { error: "bad query" });

    // Sign-in. The token rides in the query because a #fragment never reaches a server. It is
    // answered with no-store and no-referrer, and the redirect lands on a URL without it.
    if (pathname === "/_door/enter") {
      let t = null;
      try { t = new URLSearchParams(raw.query).get("t"); } catch { t = null; }
      if (!t || !(await sameSecret(t, env.DOOR_TOKEN))) return page(401, "That link did not work", "Please ask for a new link.");
      const cookie = `${COOKIE_NAME}=${await cookieValue(env)}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
      return new Response(null, { status: 302, headers: baseHeaders({ Location: ROOMS.recipes.home, "Set-Cookie": cookie, "Cache-Control": "no-store" }) });
    }
    if (pathname === "/_door/leave") {
      return page(200, "Signed out", "This phone is signed out of Recipes.", { "Set-Cookie": `${COOKIE_NAME}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0` });
    }

    // Everything past this line needs the cookie. Without it the answer is the same 401 for
    // every path, so an outsider cannot map what exists behind the door.
    if (!(await hasDoorCookie(req, env))) return page(401, "Please sign in again", "Open the app and tap Recipes again.");

    if (pathname === "/_door/health") return json(200, { ok: true, room: "recipes" });   // never touches upstream
    if (isDenied(pathname)) return json(403, { error: "not available through this door" });
    if (!roomFor(pathname)) return json(404, { error: "not found" });
    return relay(req, env, origin, pathname, raw.query);
  },
};
