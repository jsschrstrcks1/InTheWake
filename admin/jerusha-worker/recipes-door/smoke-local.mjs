// Local smoke test: a real browser -> the door Worker's code -> an Atlas running on THIS machine.
// Run from the repo root, with Atlas listening on 127.0.0.1:8088:
//   node admin/jerusha-worker/recipes-door/smoke-local.mjs [dir-for-screenshot]
// It proves the recipes page works through the door and that the refusals refuse. It does not test
// Cloudflare, the tunnel, Access, or her phone. Token and ids below are throwaway test values.
// The Worker demands an https upstream, so UPSTREAM is a made-up https origin and this harness's
// fetch sends that origin to http://127.0.0.1:8088. Nothing leaves this machine.
import http from "node:http";
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("@playwright/test");
const worker = (await import(new URL("./worker.js", import.meta.url))).default;
const TOKEN = "smoke-token-not-a-secret-0123456789abcdef";
const env = { DOOR_TOKEN: TOKEN, UPSTREAM: "https://atlas.smoke.invalid", CF_ACCESS_CLIENT_ID: "smoke-id", CF_ACCESS_CLIENT_SECRET: "smoke-secret" };
const realFetch = globalThis.fetch; const upstreamCalls = [];
globalThis.fetch = (input, init) => {
  const u = new URL(typeof input === "string" ? input : input.url);
  if (u.origin === "https://atlas.smoke.invalid") { upstreamCalls.push((init && init.method || "GET") + " " + u.pathname); return realFetch("http://127.0.0.1:8088" + u.pathname + u.search, init); }
  return realFetch(input, init);
};
const srv = http.createServer(async (req, res) => {
  try {
    const r = await worker.fetch(new Request("http://127.0.0.1:8799" + req.url, { method: req.method, headers: req.headers }), env);
    const h = {}; r.headers.forEach((v, k) => { h[k] = v; });
    const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : []; if (sc.length) h["set-cookie"] = sc;
    res.writeHead(r.status, h); res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((ok) => srv.listen(8799, "127.0.0.1", ok));
const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage();
const bad = [], errs = [];
page.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + new URL(r.url()).pathname); });
page.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 160)));
page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160)); });
const out = {};
let r = await page.goto("http://127.0.0.1:8799/recipes.html"); out.noCookie = r.status();
r = await page.goto("http://127.0.0.1:8799/_door/enter?t=" + TOKEN); out.afterEnter = { status: r.status(), path: new URL(page.url()).pathname };
await page.waitForTimeout(4000);
out.title = await page.title();
out.bodyChars = (await page.locator("body").innerText()).length;
out.sample = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 260);
out.links = await page.locator("a[href]").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))].slice(0, 25));
if (process.argv[2]) await page.screenshot({ path: process.argv[2] + "/door-recipes.png" });
// open the first recipe the page offers, if any
const first = page.locator("[data-id], .recipe, .card, li a").first();
out.firstClickable = await first.count();
// probes from INSIDE the page, so the door cookie rides along (same origin)
const probe = (path, method = "GET") => page.evaluate(async ([p, m]) => { try { const r = await fetch(p, { method: m }); return r.status; } catch (e) { return "ERR " + e.message; } }, [path, method]);
out.probes = {};
for (const [p, m] of [["/recipes","GET"],["/recipes/daily","GET"],["/recipe/tools/tips","GET"],["/admin","GET"],["/helm","GET"],["/photos","GET"],["/whoami","GET"],["/console.html","GET"],["/recipe/correct","POST"],["/recipe/correct","GET"],["/recipes","POST"],["/recipes","DELETE"],["/recipes/../admin","GET"],["/recipes/%2e%2e/admin","GET"],["/recipes-evil","GET"],["/_door/health","GET"]]) out.probes[m + " " + p] = await probe(p, m);
// open one recipe: ask the list for an id, then load it the way the page does
out.oneRecipe = await page.evaluate(async () => { const l = await (await fetch("/recipes?limit=1")).json(); const id = l.recipes && l.recipes[0] && l.recipes[0].id; if (!id) return "no id"; const r = await fetch("/recipe?id=" + encodeURIComponent(id)); const j = await r.json(); return { status: r.status, hasTitle: !!(j.title || (j.recipe && j.recipe.title)), keys: Object.keys(j).slice(0, 8) }; });
out.badResponses = [...new Set(bad)]; out.errors = errs.slice(0, 12);
out.upstreamPaths = [...new Set(upstreamCalls)];
console.log(JSON.stringify(out, null, 1));
await browser.close(); srv.close();
