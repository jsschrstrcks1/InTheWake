#!/usr/bin/env node
// Statement gates (Tekton itw-c4-statement-gates; Project-Sophos docs/lexicon/LEXICON-PLAN-3.1.md section 8).
// Three checks keep the statement store and the pages rendered from it honest, at pre-commit and in CI:
//
//   itw_statement_unsourced  a statement that claims to be known (status verified, known or inference) names no
//                            evidence, or a `verified` one does not rest on a page read on the web. Training recall
//                            is never a source (operator directives 7f0df2b6, 4918b2a5); a claim with nothing under
//                            it is refused, not filed.
//   itw_infobox_drift        a pilot page's stats card is not what its statements render: edited by hand inside the
//                            markers, or written from statements, a fallback or a renderer that has since changed.
//   itw_conflict_published   a pilot card shows a value whose statements disagree (the contract's currentValue says
//                            conflicting), or the page's own figure stands in for a figure the statements dispute.
//
// TWO DEPTHS, NEVER A SILENT ONE. The statement contract lives in Project-Sophos, which is private, so this public
// repo's CI cannot load it. Where the contract is beside the checkout (or LEXICON_CONTRACT_DIR names it) every
// check runs in full: the cards are re-rendered and compared, and each shown value is resolved again. Without it
// (or with --ci) the checks that need no contract run: unsourced in full, drift through the hash manifest the
// renderer writes (admin/lexicon/render-infobox.mjs, assets/data/lexicon/infobox-manifest.json). The output says
// which depth ran and names what the shallow one cannot see; it never reports the full check as passed.
//
//   node admin/lexicon/statement-gates.mjs          full where the contract is found, else the manifest depth
//   node admin/lexicon/statement-gates.mjs --ci     the manifest depth only (what CI runs)
//
// No baseline: measured 2026-10-29 there were no unsourced statements (1,848 statements, 0 unsourced), so there is
// no debt for a shrink-only baseline to hold, and any unsourced statement is refused.
//
// Repairs by hand, with each code: assets/data/entities/README.md#gates-track-c4 (directive 4694f147).
// @exit 0 nothing refused (at the depth the output names)
// @exit 1 refused: itw_statement_unsourced, a statement claiming verified, known or inference names no evidence, or a verified one rests on no web page. remedy: assets/data/entities/README.md#gates-track-c4; file the claim from a record or the line's page with admin/lexicon/ship-statements.mjs, never by hand
// @exit 2 could not look: itw_statement_gates_unavailable, an entity file, a pilot page or the manifest could not be read. remedy: fix the file the message names; nothing unread is reported as clean
// @exit 3 refused: itw_infobox_drift, a pilot card differs from what its statements render, or the manifest says it was edited or written from files that have changed. remedy: node admin/lexicon/render-infobox.mjs, then commit the pages and the manifest it rewrites; never edit inside the markers
// @exit 4 refused: itw_conflict_published, a pilot card shows a value its statements dispute. remedy: re-render (the renderer withholds it); to show a value, settle the dispute in the statements first (README#disagreements)
// Soli Deo Gloria.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PILOT, OUT_DIR } from "./ship-statements.mjs";
import { ROWS, classifyMount, plan, loadCurrentValue, verifyManifest, manifestText, MANIFEST } from "./render-infobox.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOC = "assets/data/entities/README.md#gates-track-c4";
const CLAIMS_KNOWN = new Set(["verified", "known", "inference"]);
const fail = (code, message) => Object.assign(new Error(message), { code });

function entityFiles(root) {
  const base = path.join(root, path.dirname(OUT_DIR));
  const out = [];
  for (const type of fs.readdirSync(base)) {
    const dir = path.join(base, type);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).sort()) if (f.endsWith(".json")) out.push(path.join(path.dirname(OUT_DIR), type, f));
  }
  return out.sort();
}

/** itw_statement_unsourced: needs no contract. Returns [{ rel, subject, why }]. */
export function checkUnsourced(root) {
  const found = [];
  for (const rel of entityFiles(root)) {
    let doc;
    try { doc = JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
    catch (e) { throw fail("itw_statement_gates_unavailable", `${rel} could not be read (${e.message})`); }
    for (const s of doc.statements || []) {
      const status = s.epistemic?.status;
      if (!CLAIMS_KNOWN.has(status)) continue;
      const ev = Array.isArray(s.epistemic?.evidence) ? s.epistemic.evidence : [];
      const refs = ev.map((e) => (typeof e?.ref === "string" ? e.ref.trim() : ""));
      const subject = s.subject || `${s.ext?.entity}#${s.ext?.property}`;
      if (!refs.length || refs.some((r) => !r)) found.push({ rel, subject, why: `status ${status} with ${refs.length ? "a blank evidence ref" : "no evidence"}` });
      else if (!(typeof s.provenance?.source_ref === "string" && s.provenance.source_ref.trim())) found.push({ rel, subject, why: `status ${status} with no provenance.source_ref` });
      else if (status === "verified" && !refs.some((r) => /^https?:\/\//i.test(r))) found.push({ rel, subject, why: "status verified, but no evidence is a web page read in the session (verified is the line's own page)" });
    }
  }
  return found;
}

/** The statement properties a rendered row shows, read from the card itself (guests may show one half). */
function shownProps(row, text) {
  if (row.key !== "guests") return row.props;
  return row.props.filter((p) => (p === "guests_double" ? /\(double\)/.test(text) : /\(max\)/.test(text)));
}

/**
 * itw_conflict_published: needs the contract. For every marked pilot card, each value it shows from statements must
 * resolve, and a row it shows from the page's own records must have no statement at all. Returns [{ rel, why }].
 */
export function checkConflicts(root, currentValue, { at = new Date().toISOString(), pilot = PILOT } = {}) {
  const found = [];
  const rowOf = new Map(ROWS.map((r) => [r.key, r]));
  for (const p of pilot) {
    const statements = JSON.parse(fs.readFileSync(path.join(root, OUT_DIR, `${p.entity.split(":")[1]}.json`), "utf8")).statements;
    for (const pg of p.pages) {
      const rel = `ships/${pg}.html`;
      const html = fs.readFileSync(path.join(root, rel), "utf8");
      const where = classifyMount(html);
      if (where.kind !== "marked") continue; // an unconverted card is drift, not a published conflict
      const region = html.slice(where.start, where.end);
      for (const m of region.matchAll(/<div class="stat-line" data-prop="(page:)?([a-z_]+)"><span class="stat-key">[^<]*<\/span><span class="stat-val">([^<]*)<\/span><\/div>/g)) {
        const row = rowOf.get(m[2]);
        if (!row) { found.push({ rel, why: `row "${m[2]}" is not a card row the renderer writes` }); continue; }
        const props = m[1] ? row.props : shownProps(row, m[3]);
        for (const prop of props) {
          const r = currentValue(statements, `${p.entity}#${prop}`, { at });
          if (m[1] && r.state !== "none") found.push({ rel, why: `the page's own ${row.key} is shown where the statements hold ${prop} (${r.state})` });
          if (!m[1] && r.state !== "resolved") found.push({ rel, why: `${prop} is shown but its statements are ${r.state}` });
        }
      }
    }
  }
  return found;
}

async function main(argv) {
  const ci = argv.includes("--ci");
  let currentValue = null, why = "--ci";
  if (!ci) {
    try { currentValue = await loadCurrentValue(); } catch (e) { why = e.message; }
  }
  const say = (s) => process.stdout.write(`${s}\n`);
  const refuse = (code, items, remedy) => {
    process.stderr.write(`statement-gates: ${code}: ${items.length} finding(s)\n`);
    for (const f of items.slice(0, 20)) process.stderr.write(`  ${f.rel}${f.subject ? ` ${f.subject}` : ""}: ${f.why}\n`);
    if (items.length > 20) process.stderr.write(`  ... ${items.length - 20} more\n`);
    process.stderr.write(`  remedy: ${remedy}\n  repair by hand: ${DOC}\n`);
  };
  try {
    const codes = [];
    const unsourced = checkUnsourced(ROOT);
    if (unsourced.length) { refuse("itw_statement_unsourced", unsourced, "file the claim from a record or the line's page with node admin/lexicon/ship-statements.mjs; never write a statement by hand"); codes.push(1); }

    let drift, conflicts = [];
    if (currentValue) {
      const pages = plan(ROOT, currentValue);
      drift = pages.filter((p) => p.next !== p.html || p.kind === "hand" || p.kind === "none")
        .map((p) => ({ rel: p.rel, why: p.kind === "hand" || p.kind === "none" ? `hand-written or missing mount (${p.why || "no #ship-stats"})` : "differs from what its statements render" }));
      let manifestNow = null;
      try { manifestNow = fs.readFileSync(path.join(ROOT, MANIFEST), "utf8"); } catch { /* reported below */ }
      if (manifestNow !== manifestText(ROOT, pages)) drift.push({ rel: MANIFEST, why: "is not what a render of this tree writes" });
      conflicts = checkConflicts(ROOT, currentValue);
      say(`statement-gates: full depth (contract found): ${PILOT.flatMap((p) => p.pages).length} pilot cards re-rendered and compared, every shown value resolved again`);
    } else {
      drift = verifyManifest(ROOT);
      say(`statement-gates: manifest depth (${why === "--ci" ? "--ci" : `contract UNAVAILABLE: ${why}`})`);
      say("  checked: unsourced statements in full; every pilot card against the hashes the renderer recorded");
      say("  NOT checked here: that the recorded render was right, and itw_conflict_published (both need the statement contract)");
    }
    if (drift.length) { refuse("itw_infobox_drift", drift, "node admin/lexicon/render-infobox.mjs, then commit the pages and assets/data/lexicon/infobox-manifest.json it rewrites; change a figure in the statements, never inside the markers"); codes.push(3); }
    if (conflicts.length) { refuse("itw_conflict_published", conflicts, "re-render (the renderer withholds a disputed value); to show it, settle the dispute in the statements first"); codes.push(4); }
    if (!codes.length) say(`statement-gates: clear (${entityFiles(ROOT).length} entity files, ${PILOT.flatMap((p) => p.pages).length} pilot cards)`);
    return codes[0] ?? 0;
  } catch (err) {
    if (err.code !== "itw_statement_gates_unavailable" && err.code !== "itw_infobox_unavailable" && err.code !== "ENOENT") throw err;
    process.stderr.write(`statement-gates: itw_statement_gates_unavailable: ${err.message}\n  remedy: fix the file named; nothing unread is reported as clean. ${DOC}\n`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
