// Tests for the door Worker. Run: node --test worker.test.mjs   (Node 26, no installs)
//
// These are written as ATTACKS on the stated claims, not as a tour of the code: every refusal
// is checked two ways, by its status AND by "the upstream was never called", because a 4xx
// that still reached Atlas would be a write that happened.
//
// Two kinds of request are used. `real()` builds a WHATWG Request, which is what a normal
// client produces (and which tidies some hostile paths before the Worker sees them). `raw()`
// hands the Worker the URL string untouched, which is what a hostile client or a
// non-normalising edge produces. Hygiene claims are tested with raw().

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import worker, { ROOMS, DENY, cleanPath, roomFor, isDenied } from "./worker.js";

const TOKEN = "test-door-token-0123456789abcdef";          // test value only
const UPSTREAM = "https://tunnel.test.invalid";
const ENV = Object.freeze({ DOOR_TOKEN: TOKEN, UPSTREAM, CF_ACCESS_CLIENT_ID: "test-access-id", CF_ACCESS_CLIENT_SECRET: "test-access-secret" });
const DOOR = "https://door.test.invalid";

let calls, upstream;
const atlasOk = () => new Response("atlas-body", { status: 200, headers: [
  ["content-type", "application/json"], ["x-atlas-origin", "1"], ["cache-control", "no-store, max-age=0"],
  ["content-security-policy", "default-src 'self'"], ["etag", "\"e1\""],
  ["set-cookie", "crane_token=leak; Path=/"], ["cf-access-authenticated-user-email", "someone@test.invalid"],
  ["x-pwa-build", "dev"],
] });
beforeEach(() => {
  calls = []; upstream = atlasOk;
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return upstream(url, init); };
});

const real = (path, { method = "GET", headers = {}, host = DOOR } = {}) => new Request(host + path, { method, headers });
const raw = (path, { method = "GET", headers = {}, host = DOOR } = {}) => ({ url: host + path, method, headers: new Headers(headers) });
const go = (req, env = ENV) => worker.fetch(req, env);

async function signIn(env = ENV) {
  const r = await go(real("/_door/enter?t=" + env.DOOR_TOKEN), env);
  assert.equal(r.status, 302);
  return r.headers.get("set-cookie").split(";")[0];          // "door=<value>"
}
const refused = (r) => assert.ok([400, 401, 403, 404, 405].includes(r.status), `expected a refusal, got ${r.status}`);

/* ---------- sign-in ---------- */

test("no cookie: /recipes.html is 401 and upstream is never called", async () => {
  const r = await go(real("/recipes.html"));
  assert.equal(r.status, 401);
  assert.match(await r.text(), /tap Recipes again/);
  assert.equal(calls.length, 0);
});

test("no cookie: every path gives the same 401, allowed or not", async () => {
  for (const p of ["/recipes", "/admin", "/recipe/correct", "/_door/health", "/nope"]) {
    const r = await go(real(p));
    assert.equal(r.status, 401, p);
  }
  assert.equal(calls.length, 0);
});

test("enter: wrong, empty and missing token are 401 with no cookie", async () => {
  for (const q of ["?t=wrong", "?t=", "", "?t=" + TOKEN + "x", "?t=" + TOKEN.slice(0, -1), "?T=" + TOKEN]) {
    const r = await go(real("/_door/enter" + q));
    assert.equal(r.status, 401, q);
    assert.equal(r.headers.get("set-cookie"), null, q);
  }
  assert.equal(calls.length, 0);
});

test("enter: right token is 302 with a Secure, HttpOnly, SameSite cookie that is not the token", async () => {
  const r = await go(real("/_door/enter?t=" + TOKEN));
  assert.equal(r.status, 302);
  assert.equal(r.headers.get("location"), "/recipes.html");
  assert.equal(r.headers.get("referrer-policy"), "no-referrer");
  assert.equal(r.headers.get("cache-control"), "no-store");
  const sc = r.headers.get("set-cookie");
  assert.match(sc, /^door=[0-9a-f]{64};/);
  assert.match(sc, /; Secure/); assert.match(sc, /; HttpOnly/); assert.match(sc, /; SameSite=Lax/); assert.match(sc, /; Path=\//);
  assert.match(sc, /; Max-Age=15552000/);
  assert.ok(!sc.includes(TOKEN), "cookie must not contain the token");
  assert.ok(!(r.headers.get("location") || "").includes(TOKEN));
  assert.equal(calls.length, 0);
});

test("the raw token used as a cookie value does not open the door", async () => {
  const r = await go(real("/recipes.html", { headers: { cookie: "door=" + TOKEN } }));
  assert.equal(r.status, 401);
  assert.equal(calls.length, 0);
});

test("rotating DOOR_TOKEN invalidates an old cookie; so does rotating DOOR_COOKIE_KEY", async () => {
  const cookie = await signIn();
  assert.equal((await go(real("/recipes.html", { headers: { cookie } }))).status, 200);
  calls.length = 0;
  const r1 = await go(real("/recipes.html", { headers: { cookie } }), { ...ENV, DOOR_TOKEN: "another-door-token-0123456789abcdef" });
  assert.equal(r1.status, 401);
  const r2 = await go(real("/recipes.html", { headers: { cookie } }), { ...ENV, DOOR_COOKIE_KEY: "k2" });
  assert.equal(r2.status, 401);
  assert.equal(calls.length, 0);
});

test("leave clears the cookie; health needs the cookie and never touches upstream", async () => {
  const l = await go(real("/_door/leave"));
  assert.match(l.headers.get("set-cookie"), /^door=;.*Max-Age=0/);
  assert.equal((await go(real("/_door/health"))).status, 401);
  const cookie = await signIn();
  const h = await go(real("/_door/health", { headers: { cookie } }));
  assert.equal(h.status, 200);
  assert.deepEqual(await h.json(), { ok: true, room: "recipes" });
  assert.equal(calls.length, 0);
});

/* ---------- configuration fails closed ---------- */

test("unset or short DOOR_TOKEN is 503 for every request", async () => {
  for (const env of [{ ...ENV, DOOR_TOKEN: undefined }, { ...ENV, DOOR_TOKEN: "" }, { ...ENV, DOOR_TOKEN: "short" }, { ...ENV, DOOR_TOKEN: 12345678901234567890123456789 }, {}, undefined, null]) {
    for (const p of ["/recipes.html", "/_door/enter?t=", "/_door/enter?t=short", "/_door/enter?t=undefined", "/_door/health"]) {
      const r = await worker.fetch(real(p), env);       // not go(): its default would put ENV back
      assert.equal(r.status, 503, p);
      assert.match(await r.text(), /door not configured/);
    }
  }
  assert.equal(calls.length, 0);
});

test("unset UPSTREAM or Access secrets is 503, and a non-https UPSTREAM is 503", async () => {
  const cookie = await signIn();
  for (const k of ["UPSTREAM", "CF_ACCESS_CLIENT_ID", "CF_ACCESS_CLIENT_SECRET"]) {
    const r = await go(real("/recipes.html", { headers: { cookie } }), { ...ENV, [k]: undefined });
    assert.equal(r.status, 503, k);
  }
  for (const bad of ["http://tunnel.test.invalid", "not a url", "javascript:alert(1)"]) {
    assert.equal((await go(real("/recipes.html", { headers: { cookie } }), { ...ENV, UPSTREAM: bad })).status, 503, bad);
  }
  assert.equal(calls.length, 0);
});

/* ---------- the allowlist ---------- */

const ALLOWED = [...ROOMS.recipes.exact,
  "/recipe/tools/health", "/recipe/tools/diabetic", "/recipe/tools/heart-smart", "/recipe/tools/substitute",
  "/recipe/tools/milk", "/recipe/tools/scale", "/recipe/tools/tips",
  "/recipes/build/cheese/styles", "/recipes/build/cheese", "/recipes/build/butter/sources",
  "/recipes/build/butter/styles", "/recipes/build/butter", "/recipes/build/adulterants"];

test("with cookie: each allowlisted path is forwarded once, to UPSTREAM, with Access headers and without the visitor's cookie", async () => {
  const cookie = await signIn();
  for (const p of ALLOWED) {
    calls.length = 0;
    const r = await go(real(p + "?id=abc&n=0", { headers: { cookie, authorization: "Bearer visitor", "tailscale-user-login": "owner@test.invalid", "x-forwarded-for": "1.2.3.4", accept: "text/html" } }));
    assert.equal(r.status, 200, p);
    assert.equal(calls.length, 1, p);
    assert.equal(calls[0].url, UPSTREAM + p + "?id=abc&n=0");
    const h = new Headers(calls[0].init.headers);
    assert.equal(h.get("cf-access-client-id"), "test-access-id");
    assert.equal(h.get("cf-access-client-secret"), "test-access-secret");
    assert.equal(h.get("cookie"), null, "visitor cookie must not travel upstream");
    assert.equal(h.get("authorization"), null);
    assert.equal(h.get("tailscale-user-login"), null);
    assert.equal(h.get("x-forwarded-for"), null);
    assert.equal(h.get("accept"), "text/html");
    assert.equal(calls[0].init.method, "GET");
    assert.equal(calls[0].init.redirect, "manual");
    assert.equal(calls[0].init.body, undefined);
  }
});

test("HEAD is forwarded as HEAD and returns no body", async () => {
  const cookie = await signIn();
  const r = await go(real("/recipes", { method: "HEAD", headers: { cookie } }));
  assert.equal(r.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, "HEAD");
  assert.equal(await r.text(), "");
});

const REFUSED = ["/admin", "/admin/scopes/mint", "/helm", "/photos", "/photo", "/flock", "/whoami", "/console.html", "/console",
  "/", "/index.html", "/recipe/correct", "/recipe/correct/", "/recipe/correct/x", "/recipes-evil", "/recipesX", "/recipes.htmlx",
  "/recipes/", "/recipe/", "/recipe/toolsX", "/recipe/tools-evil", "/recipes/buildX", "/recipes/build.html", "/recipex/tools/scale",
  "/people.html", "/shell-mount.mjs", "/abort-shell.mjs", "/peers/heartbeat", "/capabilities", "/api/waiting-on-you",
  "/recipes-sw.js", "/pwa/status", "/weather.html", "/alerts", "/ping", "/vendor/x.js", "/icons/atlas-weather.svg", "/icons/",
  "/app.mjs", "/recipes.mjs.map", "/_door", "/_door/enterx", "/Recipes.html", "/RECIPES", "/Admin", "/RECIPE/CORRECT", "/Recipe/Tools/scale"];

test("with cookie: every path outside the room is refused and upstream is never called", async () => {
  const cookie = await signIn();
  for (const p of REFUSED) {
    for (const mk of [real, raw]) {
      const r = await go(mk(p, { headers: { cookie } }));
      assert.ok(r.status === 403 || r.status === 404, `${p} -> ${r.status}`);
    }
  }
  assert.equal(calls.length, 0);
});

test("/recipe/correct is refused for GET and POST, with and without a query", async () => {
  const cookie = await signIn();
  assert.equal((await go(real("/recipe/correct", { headers: { cookie } }))).status, 403);
  assert.equal((await go(real("/recipe/correct?id=x", { headers: { cookie } }))).status, 403);
  assert.equal((await go(real("/recipe/correct", { method: "POST", headers: { cookie, "content-type": "application/json" } }))).status, 405);
  assert.equal(calls.length, 0);
});

test("matching is case-sensitive: /Recipes.html, /RECIPES and /Admin are refused", async () => {
  // Atlas's routes are exact `path === "/recipes"` comparisons (server.mjs), so they are
  // case-sensitive. Its static file branch is not reliably so on a case-insensitive disk,
  // which is one more reason the door matches exact strings and forwards nothing else.
  const cookie = await signIn();
  for (const p of ["/Recipes.html", "/RECIPES", "/Admin", "/recipes.HTML", "/Recipe"]) {
    const r = await go(raw(p, { headers: { cookie } }));
    assert.equal(r.status, 404, p);
  }
  assert.equal(calls.length, 0);
});

/* ---------- path hygiene ---------- */

const HOSTILE = ["/recipes/../admin", "/recipes/%2e%2e/admin", "/recipes/%2E%2E%2Fadmin", "/recipes//admin", "/recipes\\admin",
  "//evil.example/recipes", "/recipes/..;/admin", "/recipes\u0000", "/recipes%00", "/recipes%0a", "/recipes\n", "/recipes%0d%0aX-Evil:1",
  "/recipe/tools/..%2f..%2fadmin", "/recipe/tools/%2e%2e/%2e%2e/admin", "/recipe/tools/../../admin", "/recipe/tools/..%5c..%5cadmin",
  "/recipe/tools//scale", "/recipe/tools/./scale", "/recipe/tools/.%2e/x", "/recipe/tools/scale;x=1", "/recipe/tools/sc ale",
  "/recipe/tools/%73cale", "/recipe%2ftools/scale", "/recipes.html%00.png", "/recipe/tools/..", "/recipe/./correct", "/./recipe/correct",
  "/recipe/tools/\u202escale", "/recipes\t", "/recipe/tools/%252e%252e/admin"];

test("hostile paths sent raw are 400 and upstream is never called", async () => {
  const cookie = await signIn();
  for (const p of HOSTILE) {
    const r = await go(raw(p, { headers: { cookie } }));
    assert.equal(r.status, 400, JSON.stringify(p));
  }
  assert.equal(calls.length, 0);
});

test("hostile paths sent through a normalising client never reach a path outside the room", async () => {
  // A normalising client rewrites some of these before the Worker sees them ("/recipe/tools/./scale"
  // arrives as "/recipe/tools/scale", a trailing tab is dropped). That is a different, honest
  // request. The claim to hold is the one that matters: whatever arrives is either refused, or it
  // goes upstream as exactly an allowlisted path on the UPSTREAM origin.
  const cookie = await signIn();
  for (const p of HOSTILE) {
    calls.length = 0;
    let req; try { req = real(p, { headers: { cookie } }); } catch { continue; }
    const r = await go(req);
    if (calls.length === 0) { refused(r); continue; }
    assert.equal(calls.length, 1);
    const u = new URL(calls[0].url);
    assert.equal(u.origin, UPSTREAM);
    assert.ok(ALLOWED.includes(u.pathname), `${JSON.stringify(p)} reached ${u.pathname}`);
    assert.equal(calls[0].url.split("?")[0], UPSTREAM + u.pathname);
  }
});

test("an over-long query is 400; control characters and backslashes in a query are 400", async () => {
  const cookie = await signIn();
  assert.equal((await go(real("/recipes?q=" + "a".repeat(2001), { headers: { cookie } }))).status, 400);
  for (const q of ["?q=a\\b", "?q=a\u0000b", "?q=a b", "?q=a\nb"]) {
    assert.equal((await go(raw("/recipes" + q, { headers: { cookie } }))).status, 400, JSON.stringify(q));
  }
  assert.equal(calls.length, 0);
  const ok = await go(real("/recipes?q=" + "a".repeat(1900), { headers: { cookie } }));
  assert.equal(ok.status, 200);
});

test("a query cannot change the path: ?, # and encoded slashes in the query stay in the query", async () => {
  const cookie = await signIn();
  const r = await go(raw("/recipes?q=..%2f..%2fadmin&x=/admin?y#frag", { headers: { cookie } }));
  assert.equal(r.status, 200);
  assert.equal(calls[0].url, UPSTREAM + "/recipes?q=..%2f..%2fadmin&x=/admin?y");
  assert.equal(new URL(calls[0].url).pathname, "/recipes");
  assert.equal(new URL(calls[0].url).origin, UPSTREAM);
});

test("pure rules: boundaries of exact and prefix matching", () => {
  assert.equal(roomFor("/recipe/tools"), "recipes");
  assert.equal(roomFor("/recipe/tools/scale"), "recipes");
  for (const p of ["/recipe/toolsX", "/recipe/tools-evil", "/recipe/tool", "/recipes-evil", "/recipesX", "/recipes/x", "/recipe/x", "/RECIPES", ""]) {
    assert.equal(roomFor(p), null, p);
  }
  assert.equal(isDenied("/recipe/correct"), true);
  assert.equal(isDenied("/recipe/correct/x"), true);
  assert.equal(isDenied("/admin/scopes/mint"), true);
  assert.equal(isDenied("/recipe"), false);
  assert.equal(cleanPath("/recipes"), "/recipes");
  for (const p of ["recipes", "", null, "/a/../b", "/a//b", "/a\\b", "/a%2Fb", "/a%5Cb", "/a%2Eb", "/a%41", "/a b", "/a;b", "/é"]) assert.equal(cleanPath(p), null, String(p));
  // No allowlisted path is also on the deny list, and none fails hygiene.
  for (const p of ALLOWED) { assert.equal(isDenied(p), false, p); assert.equal(cleanPath(p), p); assert.equal(roomFor(p), "recipes"); }
  assert.ok(DENY.includes("/recipe/correct"));
});

/* ---------- methods ---------- */

test("every non-GET/HEAD method is 405 and upstream is never called, even on allowlisted paths", async () => {
  const cookie = await signIn();
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "FROBNICATE", "QUERY", "PROPFIND"]) {
    for (const p of ["/recipes", "/recipe/correct", "/recipes.html", "/recipe/tools/scale", "/admin", "/_door/enter?t=" + TOKEN, "/_door/health"]) {
      for (const hdrs of [{ cookie }, {}]) {
        const r = await go(real(p, { method, headers: hdrs }));
        assert.equal(r.status, 405, `${method} ${p}`);
        assert.equal(r.headers.get("set-cookie"), null);
      }
    }
  }
  // Method strings a real client cannot send but a raw one can: lower case, and override headers.
  for (const method of ["post", "get", "Get", "GET ", ""]) {
    assert.equal((await go(raw("/recipes", { method, headers: { cookie } }))).status, 405, JSON.stringify(method));
  }
  const o = await go(real("/recipes", { headers: { cookie, "x-http-method-override": "POST", "x-method-override": "POST" } }));
  assert.equal(o.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, "GET");
  assert.equal(new Headers(calls[0].init.headers).get("x-http-method-override"), null);
});

test("OPTIONS is 204 with no CORS allowance and no upstream call", async () => {
  const r = await go(real("/recipes", { method: "OPTIONS", headers: { origin: "https://evil.example", "access-control-request-method": "POST" } }));
  assert.equal(r.status, 204);
  for (const [k] of r.headers) assert.ok(!k.toLowerCase().startsWith("access-control-"), k);
  assert.equal(calls.length, 0);
});

/* ---------- where the upstream request goes ---------- */

test("host tricks: a request whose URL host is evil.example still goes to UPSTREAM only", async () => {
  const cookie = await signIn();
  const tries = [
    real("/recipes", { host: "https://evil.example", headers: { cookie } }),
    real("/recipes", { headers: { cookie, host: "evil.example", "x-forwarded-host": "evil.example", forwarded: "host=evil.example" } }),
    raw("/recipes", { host: "https://user:pw@evil.example:8443", headers: { cookie } }),
    raw("/recipes?next=https://evil.example/", { headers: { cookie } }),
  ];
  for (const req of tries) await go(req);
  assert.equal(calls.length, tries.length);
  for (const c of calls) {
    assert.equal(new URL(c.url).origin, UPSTREAM);
    assert.equal(new URL(c.url).pathname, "/recipes");
    const h = new Headers(c.init.headers);
    assert.equal(h.get("x-forwarded-host"), null); assert.equal(h.get("forwarded"), null);
  }
  // A URL that is not http(s)://host/path at all is refused.
  for (const u of ["/recipes", "ftp://door.test.invalid/recipes", "https:/recipes", ""]) {
    const r = await worker.fetch({ url: u, method: "GET", headers: new Headers({ cookie }) }, ENV);
    assert.equal(r.status, 400, JSON.stringify(u));
  }
  assert.equal(calls.length, tries.length);
});

/* ---------- what comes back ---------- */

test("response: body is relayed, set-cookie and cf-access-* are stripped, safety headers are added, kept headers are kept", async () => {
  const cookie = await signIn();
  const r = await go(real("/recipes", { headers: { cookie } }));
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "atlas-body");
  assert.equal(r.headers.get("set-cookie"), null);
  for (const [k] of r.headers) assert.ok(!k.toLowerCase().startsWith("cf-access"), k);
  assert.equal(r.headers.get("x-pwa-build"), null);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(r.headers.get("referrer-policy"), "no-referrer");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("content-type"), "application/json");
  assert.equal(r.headers.get("etag"), "\"e1\"");
  assert.equal(r.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(r.headers.get("content-security-policy"), "default-src 'self'");
});

test("an Atlas 404 is relayed as a 404 (a missing recipe is not 'home offline')", async () => {
  const cookie = await signIn();
  upstream = () => new Response("not found", { status: 404, headers: { "x-atlas-origin": "1", "content-type": "text/plain" } });
  const r = await go(real("/recipe?id=nope", { headers: { cookie } }));
  assert.equal(r.status, 404);
});

test("an upstream 302 is not followed: it becomes 502, with no Location and no cookie", async () => {
  const cookie = await signIn();
  upstream = () => new Response(null, { status: 302, headers: { location: "https://evil.example/", "set-cookie": "x=1", "x-atlas-origin": "1" } });
  for (const p of ["/recipes.html", "/recipes"]) {
    const r = await go(real(p, { headers: { cookie } }));
    assert.equal(r.status, 502, p);
    assert.equal(r.headers.get("location"), null);
    assert.equal(r.headers.get("set-cookie"), null);
  }
  assert.equal(calls.length, 2);                               // one each: nothing was followed
  for (const c of calls) assert.equal(c.init.redirect, "manual");
});

test("upstream network error, timeout abort, and 5xx: 502 html for .html, 502 json for API paths, never a 200", async () => {
  const cookie = await signIn();
  const failures = [
    () => { throw new TypeError("fetch failed"); },
    () => { const e = new Error("aborted"); e.name = "AbortError"; throw e; },
    () => new Response("bad gateway from the tunnel", { status: 502 }),
    () => new Response("error 1033", { status: 530 }),
    () => new Response("atlas blew up", { status: 500, headers: { "x-atlas-origin": "1" } }),
  ];
  for (const f of failures) {
    upstream = f;
    const h = await go(real("/recipes.html", { headers: { cookie } }));
    assert.equal(h.status, 502);
    assert.match(h.headers.get("content-type"), /^text\/html/);
    assert.match(await h.text(), /offline right now/);
    for (const p of ["/recipes", "/recipe?id=x", "/recipe/card?id=x&n=0", "/recipes.mjs", "/recipe/tools/scale"]) {
      const j = await go(real(p, { headers: { cookie } }));
      assert.equal(j.status, 502, p);
      assert.match(j.headers.get("content-type"), /^application\/json/);
      assert.deepEqual(await j.json(), { error: "home offline" });
    }
  }
});

test("a 200 that is not from Atlas (Access login page, tunnel error page) is 502, not shown as the cookbook", async () => {
  const cookie = await signIn();
  upstream = () => new Response("<html>Sign in with Cloudflare Access</html>", { status: 200, headers: { "content-type": "text/html" } });
  assert.equal((await go(real("/recipes.html", { headers: { cookie } }))).status, 502);
  const j = await go(real("/recipes", { headers: { cookie } }));
  assert.equal(j.status, 502);
  assert.deepEqual(await j.json(), { error: "home offline" });
  upstream = () => new Response("forbidden", { status: 403 });
  assert.equal((await go(real("/recipes", { headers: { cookie } }))).status, 502);
});

test("the upstream fetch carries an abort signal (the 15 s timeout is wired)", async () => {
  const cookie = await signIn();
  await go(real("/recipes", { headers: { cookie } }));
  assert.ok(calls[0].init.signal instanceof AbortSignal);
});

test("no answer from the Worker ever contains the token, the cookie value or an Access secret", async () => {
  const cookie = await signIn();
  const value = cookie.split("=")[1];
  const reqs = [real("/recipes.html"), real("/_door/enter?t=wrong"), real("/_door/leave"), real("/_door/health", { headers: { cookie } }),
    real("/admin", { headers: { cookie } }), real("/nope", { headers: { cookie } }), real("/recipes", { method: "POST", headers: { cookie } }),
    raw("/recipes/../admin", { headers: { cookie } }), real("/recipes", { headers: { cookie } })];
  for (const req of reqs) {
    const r = await go(req);
    const text = await r.text() + JSON.stringify([...r.headers]);
    for (const secret of [TOKEN, value, "test-access-id", "test-access-secret"]) assert.ok(!text.includes(secret), `${req.url} leaked`);
  }
});

/* ---------- the second gate agrees with the first ---------- */

test("cloudflared example: the ingress regex admits the allowlist and nothing on the refused lists", () => {
  const yml = readFileSync(join(import.meta.dirname, "cloudflared-config.example.yml"), "utf8");
  const m = /^\s*path:\s*'([^']+)'\s*$/m.exec(yml);
  assert.ok(m, "ingress path regex not found");
  const re = new RegExp(m[1]);
  assert.ok(m[1].startsWith("^") && m[1].endsWith("$"), "regex must be anchored at both ends");
  for (const p of ALLOWED) assert.ok(re.test(p), `tunnel would refuse ${p}`);
  for (const p of [...REFUSED, ...HOSTILE, ...DENY, "/recipe/tools/../../admin", "/recipes/build/../x"]) assert.ok(!re.test(p), `tunnel would admit ${JSON.stringify(p)}`);
  assert.match(yml, /service:\s*http_status:404\s*$/m);
  assert.match(yml, /service:\s*http:\/\/127\.0\.0\.1:8088/);
});
