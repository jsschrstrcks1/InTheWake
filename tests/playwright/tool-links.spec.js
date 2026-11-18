// tests/playwright/tool-links.spec.js
//
// Every same-site link a tool page shows, once its scripts and data have loaded, leads somewhere the site serves.
// Soli Deo Gloria.
//
// WHY. Check Links (lychee, in quality.yml) reads the HTML files as written. A tool page builds much of what a
// reader sees with scripts: the Ship Size Atlas renders its brand panels from data/atlas/*.json, the calculators
// fill in from data files. A link a script writes is invisible to lychee, so a broken one would reach readers with
// no check failing. That is how a 2026-05-13 audit could report the atlas linking to /ships/royal-caribbean/ while
// the pages live under /ships/rcl/. On main 2702a02b (2026-11-09) that report no longer reproduces: the atlas
// renders 12 links under /ships/ and every one resolves (memory b5aa9f71). This spec keeps it that way.
//
// WHAT IT CHECKS. Each tool page loads, then every [role=tab] on it is clicked so hidden panels render. Every
// same-site <a href> on the page is then requested from the test server, and anything that does not answer 200 is
// a failure, named with the page that showed it. Fragment-only, mailto: and tel: links are skipped; external links
// are Check Links' job.
//
// THE PAGES. Every tools/*.html, read from disk so a new tool page is covered without anyone adding it here, plus
// the tools that live at the site root.
//
// HONEST LIMIT. A link that appears only after a reader types into a form or picks an option is not seen.

import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";
import path from "node:path";

// Playwright compiles these specs to CommonJS, so __dirname is defined here and import.meta is not.
const ROOT = path.resolve(__dirname, "..", "..");
const ROOT_TOOLS = ["/drink-calculator.html", "/drink-calculator-v1.html", "/stateroom-check.html"];
const PAGES = [
  ...readdirSync(path.join(ROOT, "tools")).filter((f) => f.endsWith(".html")).sort().map((f) => `/tools/${f}`),
  ...ROOT_TOOLS,
];

// Keep to the test server, and keep the service worker out: its install fetches the whole precache list through the
// route, which is noise here and crashed the browser in CI on 2026-11-08 (see cruise-tipping-calculator.spec.js).
test.use({ serviceWorkers: "block" });
test.beforeEach(async ({ context, baseURL }) => {
  await context.route("**/*", (route) =>
    route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
});

/** The same-site links on the page, as absolute URLs without their fragment. */
async function sameSiteLinks(page, baseURL) {
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  const out = new Set();
  for (const h of hrefs) {
    if (!h || /^(#|mailto:|tel:|javascript:)/i.test(h.trim())) continue;
    const u = new URL(h, page.url());
    if (u.origin !== new URL(baseURL).origin) continue;
    u.hash = "";
    out.add(u.href);
  }
  return [...out].sort();
}

test("there are tool pages to check", () => {
  expect(PAGES.length).toBeGreaterThan(ROOT_TOOLS.length);
});

for (const url of PAGES) {
  test(`every same-site link on ${url} leads to a page the site serves`, async ({ page, request, baseURL }) => {
    const res = await page.goto(url);
    expect(res && res.status(), `${url} itself loads`).toBe(200);
    // Scripts fill tool pages in from data files after load; give them that.
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    const tabs = page.locator("[role=tab]");
    for (let i = 0; i < (await tabs.count()); i++) {
      const tab = tabs.nth(i);
      if (await tab.isVisible()) await tab.click().catch(() => {});
    }
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const links = await sameSiteLinks(page, baseURL);
    expect(links.length, `${url} shows at least its navigation links`).toBeGreaterThan(0);
    const broken = [];
    for (const link of links) {
      const r = await request.get(link);
      if (r.status() !== 200) broken.push(`${new URL(link).pathname} -> ${r.status()}`);
    }
    expect(broken, `links on ${url} that the site does not serve`).toEqual([]);
  });
}
