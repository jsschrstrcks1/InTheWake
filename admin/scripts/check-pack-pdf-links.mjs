#!/usr/bin/env node
// check-pack-pdf-links.mjs — every link in a shipped Voyage Pack PDF must work on a reader's phone.
//
// Until 2026-09-26 the PDF build rewrote every site link to file://<build machine>/..., so a
// reader tapping "Port Canaveral" in the Prima PDF opened nothing (113 of its 119 links). This
// reads the link annotations out of each PDF and reports:
//   - any file:// link (a path on whatever machine built it), and
//   - any https://cruisinginthewake.com/ link whose page is not in this repo.
//
// Usage:
//   node admin/scripts/check-pack-pdf-links.mjs <file.pdf> [...]
//   node admin/scripts/check-pack-pdf-links.mjs --all      # every PDF packs.json names
//
// Three states, never two: CLEAN (exit 0), REPORT (exit 3, problems listed),
// UNAVAILABLE (exit 2, a PDF could not be read — never counted as clean).
//
// Soli Deo Gloria.
import { readFileSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SITE = 'https://cruisinginthewake.com/';

// Link targets live in /URI (...) entries, either in the file body or inside Flate streams.
export function extractUris(buf) {
  return scan(buf).uris;
}

// uris: every /URI target. linkAnnots: every /Subtype /Link annotation, so a PDF whose links
// could not be read is told apart from one that genuinely has none (a handoff card).
export function scan(buf) {
  const out = [];
  let linkAnnots = 0;
  const grab = (text) => {
    for (const m of text.matchAll(/\/URI\s*\(((?:\\.|[^\\)])*)\)/g)) out.push(m[1].replace(/\\([()\\])/g, '$1'));
    linkAnnots += (text.match(/\/Subtype\s*\/Link\b/g) || []).length;
  };
  const latin = buf.toString('latin1');
  grab(latin);
  // "endstream" contains "stream": resume after it, or the next match starts mid-object.
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(latin))) {
    const start = m.index + m[0].length;
    const end = latin.indexOf('endstream', start);
    if (end < 0) break;
    let stop = end;
    if (latin[stop - 1] === '\n') stop--;
    if (latin[stop - 1] === '\r') stop--;
    try { grab(inflateSync(buf.subarray(start, stop)).toString('latin1')); } catch { /* not a Flate stream */ }
    re.lastIndex = end + 'endstream'.length;
  }
  return { uris: out, linkAnnots };
}

export function siteTargetExists(uri, root = ROOT) {
  const rel = decodeURI(uri.slice(SITE.length)).split('#')[0].split('?')[0];
  if (rel === '' || rel.endsWith('/')) return existsSync(path.join(root, rel, 'index.html'));
  return existsSync(path.join(root, rel));
}

export function checkPdf(buf, root = ROOT) {
  const { uris, linkAnnots } = scan(buf);
  const fileLinks = uris.filter((u) => u.startsWith('file:'));
  const missing = [...new Set(uris.filter((u) => u.startsWith(SITE) && !siteTargetExists(u, root)))];
  const readable = buf.subarray(0, 5).toString('latin1') === '%PDF-';
  return { total: uris.length, linkAnnots, readable, fileLinks, missing };
}

function allPackPdfs() {
  const packs = JSON.parse(readFileSync(path.join(ROOT, 'admin/voyage-packs/packs.json'), 'utf8'));
  const found = new Set();
  const walk = (o) => {
    if (typeof o === 'string') { if (/\.pdf$/i.test(o)) found.add(o.replace(/^\//, '')); return; }
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') Object.values(o).forEach(walk);
  };
  walk(packs);
  return [...found].sort();
}

function main(argv) {
  const files = argv.includes('--all') ? allPackPdfs() : argv.filter((a) => !a.startsWith('--'));
  if (!files.length) { console.error('usage: check-pack-pdf-links.mjs <file.pdf> [...] | --all'); return 2; }
  let report = 0, unavailable = 0;
  for (const f of files) {
    let buf;
    try { buf = readFileSync(path.resolve(ROOT, f)); } catch (e) {
      unavailable++; console.log(`UNAVAILABLE ${f}: ${e.code || e.message}`); continue;
    }
    const r = checkPdf(buf);
    if (!r.readable) { unavailable++; console.log(`UNAVAILABLE ${f}: not a PDF`); continue; }
    if (r.total === 0 && r.linkAnnots > 0) { unavailable++; console.log(`UNAVAILABLE ${f}: ${r.linkAnnots} link annotation(s) whose targets could not be read`); continue; }
    if (r.total === 0) { console.log(`CLEAN ${f}: no links`); continue; }
    if (r.fileLinks.length || r.missing.length) {
      report++;
      console.log(`REPORT ${f}: ${r.total} links, ${r.fileLinks.length} file://, ${r.missing.length} missing site page(s)`);
      if (r.fileLinks.length) console.log(`  e.g. ${r.fileLinks[0]}`);
      for (const u of r.missing.slice(0, 5)) console.log(`  missing: ${u}`);
    } else {
      console.log(`CLEAN ${f}: ${r.total} links`);
    }
  }
  console.log(`\n${files.length} PDF(s): ${files.length - report - unavailable} clean, ${report} report, ${unavailable} unavailable`);
  return unavailable ? 2 : report ? 3 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
