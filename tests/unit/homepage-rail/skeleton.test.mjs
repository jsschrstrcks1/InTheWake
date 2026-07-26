// tests/unit/homepage-rail/skeleton.test.mjs
// Text-invariant lock for the Recent Stories rail loading state (#2453). This UI
// cannot be eyeballed in CI, so these assertions pin the served index.html markup:
// a skeleton while JS loads, the muted color lifted off the inline style, and a
// real no-JS fallback so the placeholder never "loads forever" without scripts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const html = readFileSync(path.join(repoRoot, "index.html"), "utf8");

// Isolate the fallback element's opening tag.
const fallbackTag = html.match(/<[a-z]+[^>]*\bid="recent-rail-fallback"[^>]*>/i);

test("JS contract intact: #recent-rail-fallback element still exists", () => {
  assert.ok(fallbackTag, "the fallback element the rail JS drives must exist");
});

test("inline color is lifted: fallback carries .rail-fallback, no inline color", () => {
  assert.match(fallbackTag[0], /class="[^"]*\brail-fallback\b[^"]*"/, "must use the .rail-fallback class");
  assert.doesNotMatch(fallbackTag[0], /style="[^"]*color/i, "must not set color via inline style");
});

test(".rail-fallback rule uses the theme muted-text variable, not a hardcoded hex", () => {
  assert.match(html, /\.rail-fallback\s*\{\s*color:\s*var\(--text-muted\)/, "muted color must come from the CSS variable");
});

test("skeleton loader markup is present with a reduced-motion guard", () => {
  assert.match(html, /class="rail-skeleton"/, "skeleton list must be present");
  assert.match(html, /@keyframes\s+railShimmer/, "shimmer keyframes must be defined");
  assert.match(html, /prefers-reduced-motion:\s*reduce[^}]*\{[^}]*animation:\s*none/, "must disable shimmer under reduced-motion");
});

test("no-JS: head <noscript> hides the JS-only skeleton so it never shimmers forever", () => {
  assert.match(html, /<noscript>\s*<style>[^<]*#recent-rail-fallback\s*\{\s*display:\s*none/i);
});

test("no-JS: a real fallback links to the full articles page", () => {
  // A <noscript> block containing a link to /articles.html.
  const noscripts = html.match(/<noscript>[\s\S]*?<\/noscript>/gi) || [];
  assert.ok(
    noscripts.some((n) => /href="\/articles\.html"/.test(n)),
    "a <noscript> fallback must link to /articles.html"
  );
});
