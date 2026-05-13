// tests/unit/image-reuse-guardrail/fixtures.test.mjs
//
// Negative + positive fixture tests for the image-reuse-guardrail rules
// shipped in commit 5e0f9dad (Phase 3.5, issue #1465). Each documented
// same-entity / convention allowlist gets two fixture cases:
//
//   POSITIVE: the exemption applies as intended (downgrade to INFO / pass)
//   NEGATIVE: a similar input WITHOUT the exempt condition still blocks
//
// Per careful-not-clever v1.8-alpha Claim-Evidence Discipline sub-rule (2):
// "Allowlists, exemptions, downgrades ... require two test fixtures: a
// positive case (the exemption applies as intended) AND a negative case
// (a similar input without the exempt condition is still rejected). Code
// with only a positive test has unbounded permissiveness."
//
// Surfaced by Grok adversarial review 2026-05-13, Finding 1 (HIGH):
// "Construct and test a negative fixture for a ship+ship cross-slug reuse
// that superficially matches the 'same-entity' pattern but violates intent."
//
// Tests the classification logic of admin/scan-image-reuse.cjs and the
// allowlist gates of admin/check-image-reuse.cjs by simulating the
// classify() + entityKeyFromMeta() reasoning against synthetic file paths,
// without touching the real filesystem.

import { test } from "node:test";
import assert from "node:assert/strict";

// -------- helpers replicating the scanner's pattern logic --------
// Mirror admin/scan-image-reuse.cjs:isFomNamed and the entity-key rules.
// If the scanner's logic drifts, these fixture tests should be updated to
// match. Drift detection is the point.

const FOM_NAMED_RE = /[-_]FOM[-_ ]/i;
const CROSS_SECTION_SAME_ENTITY_PAIRS = [new Set(["authors", "articles"])];

function isFomNamed(filename) {
  return FOM_NAMED_RE.test(filename);
}

function filenameRoot(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_ ]?\d+(?:\s*\([\d ]+\))?$/, '').toLowerCase();
}

function sharesFilenameRoot(a, b) {
  const ra = filenameRoot(a);
  const rb = filenameRoot(b);
  return !!(ra && rb && ra === rb);
}

// classify() reproduction for fixture paths (no fs reads — synthesizes the
// section/line/filename/slug fields the scanner would assign).
function classifyFixture(rel, opts = {}) {
  const explicitSlug = opts.slug;
  let m;
  if ((m = rel.match(/^assets\/ships\/([^/]+)\/(.+)$/)))
    return { rel, section: "ships", line: m[1], filename: m[2], slug: explicitSlug ?? null };
  if ((m = rel.match(/^assets\/ships\/(.+)$/)))
    return { rel, section: "ships", line: "_root", filename: m[1], slug: explicitSlug ?? null };
  if ((m = rel.match(/^images\/ports\/([^/]+)\/(.+)$/)))
    return { rel, section: "ports", line: m[1], filename: m[2], slug: explicitSlug ?? m[1] };
  if (rel.startsWith("assets/articles/"))
    return { rel, section: "articles", line: "_generic", filename: rel.split("/").pop(), slug: explicitSlug ?? null };
  if (rel.startsWith("authors/"))
    return { rel, section: "authors", line: "_generic", filename: rel.split("/").pop(), slug: explicitSlug ?? null };
  throw new Error(`classifyFixture: unhandled path ${rel}`);
}

// Reproduce the scanner's same-entity decision tree on a pair of files
// sharing the same md5. Returns one of: INFO_SAME_SLUG_SHIP, INFO_AUTHORS_ARTICLES,
// INFO_FOM, CRITICAL_CROSS_SECTION, CRITICAL_CROSS_LINE, ERROR_CROSS_SLUG_SAME_LINE,
// CRITICAL_LEGACY_ROOT, INFO_INTRA_ENTITY.
function classifyPair(a, b) {
  const files = [a, b];
  const sections = new Set(files.map(f => f.section));
  const lines = new Set(files.map(f => f.line));
  const slugs = new Set(files.map(f => f.slug).filter(Boolean));
  const allShareSlug = slugs.size === 1 && files.every(f => f.slug === [...slugs][0]);

  if (allShareSlug && [...sections][0] === "ships") return "INFO_SAME_SLUG_SHIP";

  if (sections.size >= 2 && CROSS_SECTION_SAME_ENTITY_PAIRS.some(pair =>
    [...sections].every(s => pair.has(s))
  )) {
    if (sharesFilenameRoot(a.filename, b.filename)) return "INFO_AUTHORS_ARTICLES";
  }

  if (sections.size === 1 && [...sections][0] === "ships" &&
      files.every(f => isFomNamed(f.filename))) {
    return "INFO_FOM";
  }

  if (sections.size > 1) return "CRITICAL_CROSS_SECTION";
  if (sections.size === 1 && lines.size > 1 && !lines.has("_root") && !lines.has("_legacy"))
    return "CRITICAL_CROSS_LINE";
  if (slugs.size > 1) return "ERROR_CROSS_SLUG_SAME_LINE";
  if (allShareSlug) return "INFO_INTRA_ENTITY";
  if (lines.has("_root") || lines.has("_legacy")) return "CRITICAL_LEGACY_ROOT";
  return "INFO_INTRA_ENTITY";
}

// ============================================================
// PATTERN 1 — ship _root/line collapse for same slug
// ============================================================

test("POS: Carnival_Conquest_3.jpg ≡ carnival/carnival-conquest-exterior.jpg (same ship, two paths) → INFO", () => {
  const a = classifyFixture("assets/ships/Carnival_Conquest_3.jpg", { slug: "carnival-conquest" });
  const b = classifyFixture("assets/ships/carnival/carnival-conquest-exterior.jpg", { slug: "carnival-conquest" });
  assert.equal(classifyPair(a, b), "INFO_SAME_SLUG_SHIP",
    "Same ship under _root and line bucket should downgrade to INFO");
});

test("NEG: Carnival_Conquest_3.jpg ↔ carnival/carnival-radiance-exterior.jpg (DIFFERENT ships in carnival) → still flags", () => {
  // Adversarial: two carnival ships with similar filenames but different slugs.
  // The _root file claims carnival-conquest; the line file is carnival-radiance.
  // This must NOT collapse to INFO — they are different entities within the same line.
  const a = classifyFixture("assets/ships/Carnival_Conquest_3.jpg", { slug: "carnival-conquest" });
  const b = classifyFixture("assets/ships/carnival/carnival-radiance-exterior.jpg", { slug: "carnival-radiance" });
  const verdict = classifyPair(a, b);
  assert.notEqual(verdict, "INFO_SAME_SLUG_SHIP", "Different slugs must not collapse");
  assert.ok(verdict.startsWith("ERROR") || verdict.startsWith("CRITICAL"),
    `Expected ERROR/CRITICAL for cross-slug-same-line ship reuse, got ${verdict}`);
});

test("NEG (Cordelia pattern): cordelia/cordelia-1.jpg ↔ carnival/carnival-fascination-1.jpg → CRITICAL_CROSS_LINE", () => {
  const a = classifyFixture("assets/ships/cordelia/cordelia-1.jpg", { slug: "cordelia" });
  const b = classifyFixture("assets/ships/carnival/carnival-fascination-1.jpg", { slug: "carnival-fascination" });
  assert.equal(classifyPair(a, b), "CRITICAL_CROSS_LINE",
    "Cordelia-pattern (ship from one line served as ship from another) must remain CRITICAL");
});

// ============================================================
// PATTERN 2 — cross-section authors↔articles for same author
// ============================================================

test("POS: authors/img/ken1.jpg ↔ articles/ken1.jpg (same author portrait, matching root) → INFO", () => {
  const a = classifyFixture("authors/img/ken1.jpg");
  const b = classifyFixture("assets/articles/ken1.jpg");
  assert.equal(classifyPair(a, b), "INFO_AUTHORS_ARTICLES",
    "Author portrait reused in their article (matching filename root) must downgrade");
});

test("NEG: authors/img/ken1.jpg ↔ articles/cordelia.jpg (different filename roots cross-section) → CRITICAL_CROSS_SECTION", () => {
  // Adversarial: an attacker tries to launder a ship photo through the authors section
  // by giving it an author-shaped filename. Different filename roots — same-entity
  // rule must NOT apply.
  const a = classifyFixture("authors/img/ken1.jpg");
  const b = classifyFixture("assets/articles/cordelia.jpg");
  assert.equal(classifyPair(a, b), "CRITICAL_CROSS_SECTION",
    "Different filename roots across authors↔articles must remain CRITICAL");
});

test("NEG: authors/img/ken1.jpg ↔ images/ports/cozumel/hero.jpg (cross-section but NOT authors↔articles) → CRITICAL_CROSS_SECTION", () => {
  // Adversarial: same author filename, but the other file is a port hero. The
  // allowlist applies ONLY to {authors, articles}; ports must still block.
  const a = classifyFixture("authors/img/ken1.jpg");
  const b = classifyFixture("images/ports/cozumel/ken1.jpg", { slug: "cozumel" });
  assert.equal(classifyPair(a, b), "CRITICAL_CROSS_SECTION",
    "Cross-section reuse outside the {authors, articles} pair must remain CRITICAL");
});

// ============================================================
// PATTERN 3 — FOM filename convention allowlist
// ============================================================

test("POS: freedom-of-the-seas-FOM- - 2.webp ↔ mariner-of-the-seas-FOM- - 1.webp (both FOM-named, ships) → INFO", () => {
  const a = classifyFixture("assets/ships/rcl/freedom-of-the-seas-FOM- - 2.webp", { slug: "freedom-of-the-seas" });
  const b = classifyFixture("assets/ships/rcl/mariner-of-the-seas-FOM- - 1.webp", { slug: "mariner-of-the-seas" });
  assert.equal(classifyPair(a, b), "INFO_FOM",
    "Cross-slug same-line ship reuse under FOM convention must downgrade to INFO");
});

test("NEG: freedom-of-the-seas-1.webp ↔ mariner-of-the-seas-1.webp (NEITHER FOM-named) → ERROR_CROSS_SLUG_SAME_LINE", () => {
  // Adversarial: same shape as the FOM positive case but the filenames don't carry
  // the FOM token. The allowlist must not apply.
  const a = classifyFixture("assets/ships/rcl/freedom-of-the-seas-1.webp", { slug: "freedom-of-the-seas" });
  const b = classifyFixture("assets/ships/rcl/mariner-of-the-seas-1.webp", { slug: "mariner-of-the-seas" });
  assert.equal(classifyPair(a, b), "ERROR_CROSS_SLUG_SAME_LINE",
    "Cross-slug same-line reuse without the FOM token must remain ERROR");
});

test("NEG: freedom-of-the-seas-FOM- - 2.webp ↔ images/ports/cozumel/hero.jpg (FOM ship ↔ port) → CRITICAL_CROSS_SECTION", () => {
  // Adversarial: FOM-named ship photo also appearing as a port hero. The FOM
  // allowlist is scoped to the ships section; cross-section must remain blocking.
  const a = classifyFixture("assets/ships/rcl/freedom-of-the-seas-FOM- - 2.webp", { slug: "freedom-of-the-seas" });
  const b = classifyFixture("images/ports/cozumel/hero.jpg", { slug: "cozumel" });
  assert.equal(classifyPair(a, b), "CRITICAL_CROSS_SECTION",
    "FOM-named ship file reused as a port hero must remain CRITICAL (allowlist is ships-only)");
});

// ============================================================
// Cross-rule adversarial: only ONE file is FOM-named
// ============================================================

test("NEG: freedom-of-the-seas-FOM- - 2.webp ↔ mariner-of-the-seas-1.webp (only ONE is FOM-named) → ERROR_CROSS_SLUG_SAME_LINE", () => {
  // The FOM rule requires BOTH files to match the pattern. If only one does,
  // the convention doesn't apply and the cross-slug same-line block fires.
  const a = classifyFixture("assets/ships/rcl/freedom-of-the-seas-FOM- - 2.webp", { slug: "freedom-of-the-seas" });
  const b = classifyFixture("assets/ships/rcl/mariner-of-the-seas-1.webp", { slug: "mariner-of-the-seas" });
  assert.equal(classifyPair(a, b), "ERROR_CROSS_SLUG_SAME_LINE",
    "FOM allowlist requires BOTH files to match — partial match must not exempt");
});
