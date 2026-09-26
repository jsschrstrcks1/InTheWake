#!/usr/bin/env node
// Sync FAQPage JSON-LD mainEntity to the visible FAQ questions the FAQ_COUNT
// regex actually sees. Answers are copied from the page — never invented.
// Also tags Petersburg-style <details> inside #faq with class="faq-item".
// Usage: node admin/scripts/sync-faq-count.mjs [--apply]
import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const PORTS = path.join(ROOT, "ports");

function strip(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/^\s*Q:\s*/i, "")
    .replace(/^\s*A:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPairs(html) {
  const pairs = [];
  const push = (q, a) => {
    q = strip(q);
    a = strip(a);
    if (q && a) pairs.push({ q, a });
  };
  let m;
  const qRe = /<p><strong>\s*Q:\s*([\s\S]*?)\s*<\/strong>\s*(?:<br\s*\/?>)?\s*([\s\S]*?)<\/p>/gi;
  while ((m = qRe.exec(html))) push(m[1], m[2]);
  const dRe = /<details class="faq-item"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((m = dRe.exec(html))) push(m[1], m[2]);
  const vRe = /<div[^>]*class="(?:[^"]*\s)?faq-item(?:\s[^"]*)?"[^>]*>\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((m = vRe.exec(html))) push(m[1], m[2]);
  const seen = new Set();
  const uniq = [];
  for (const p of pairs) {
    const k = p.q.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(p);
  }
  return uniq;
}

function pageCount(html) {
  const qPrefixed = (html.match(/<p><strong>Q:|<strong>Q:|<summary[^>]*>Q:/g) || []).length;
  const summaryFAQs = (html.match(/<details class="faq-item"[^>]*>\s*<summary/g) || []).length;
  const divFAQs = (html.match(/<div[^>]*class="(?:[^"]*\s)?faq-item(?:\s[^"]*)?"[^>]*>\s*<h[1-6]/gi) || []).length;
  return Math.max(qPrefixed, summaryFAQs, divFAQs);
}

function schemaCount(html) {
  return (html.match(/"@type":\s*"Question"/g) || []).length;
}

function findFaqPageScript(html) {
  const re = /<script type="application\/ld\+json">/gi;
  let m;
  while ((m = re.exec(html))) {
    const tagEnd = m.index + m[0].length;
    let i = tagEnd;
    while (i < html.length && html[i] !== "{") i++;
    if (html[i] !== "{") continue;
    let depth = 0;
    let j = i;
    for (; j < html.length; j++) {
      if (html[j] === "{") depth++;
      else if (html[j] === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const raw = html.slice(i, j);
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      continue;
    }
    if (obj && obj["@type"] === "FAQPage") {
      const close = html.indexOf("</script>", j);
      return { start: m.index, end: close + "</script>".length, obj, raw };
    }
  }
  return null;
}

function tagPetersburgDetails(html) {
  return html.replace(/(<section[^>]*id="faq"[^>]*>)([\s\S]*?)(<\/section>)/i, (all, open, body, close) => {
    const tagged = body.replace(
      /<details(?![^>]*\bfaq-item\b)(?![^>]*\bsection-collapse\b)([^>]*)>/gi,
      '<details class="faq-item"$1>'
    );
    return open + tagged + close;
  });
}

function buildEntity(p) {
  return {
    "@type": "Question",
    name: p.q,
    acceptedAnswer: { "@type": "Answer", text: p.a },
  };
}

const files = fs.readdirSync(PORTS).filter((f) => f.endsWith(".html")).sort();
let changed = 0;
let skipped = 0;
const report = [];

for (const f of files) {
  const fp = path.join(PORTS, f);
  let html = fs.readFileSync(fp, "utf8");
  const before = { sq: schemaCount(html), vq: pageCount(html) };
  let next = html;
  if (pageCount(html) === 0 && schemaCount(html) > 0) {
    next = tagPetersburgDetails(html);
  }
  const pairs = extractPairs(next);
  const vq = pageCount(next);
  const sq = schemaCount(next);
  if (sq === vq && vq > 0) {
    if (next !== html && APPLY) {
      fs.writeFileSync(fp, next);
      changed++;
      report.push(`${f}: tagged faq-item only`);
    } else if (next !== html) {
      report.push(`${f}: would tag faq-item`);
    } else skipped++;
    continue;
  }
  if (vq === 0) {
    report.push(`${f}: SKIP no visible FAQ_COUNT page items (schema ${sq})`);
    skipped++;
    continue;
  }
  const script = findFaqPageScript(next);
  if (!script) {
    report.push(`${f}: SKIP no FAQPage JSON-LD (page ${vq} schema ${sq})`);
    skipped++;
    continue;
  }
  if (pairs.length < vq) {
    report.push(`${f}: SKIP extracted ${pairs.length} pairs < page ${vq} (schema ${sq})`);
    skipped++;
    continue;
  }
  const use = pairs.slice(0, vq);
  script.obj.mainEntity = use.map(buildEntity);
  const pretty = JSON.stringify(script.obj, null, 2);
  const replacement = `<script type="application/ld+json">\n${pretty}\n  </script>`;
  next = next.slice(0, script.start) + replacement + next.slice(script.end);
  const after = { sq: schemaCount(next), vq: pageCount(next) };
  if (after.sq !== after.vq) {
    report.push(`${f}: FAIL after sync schema=${after.sq} page=${after.vq}`);
    skipped++;
    continue;
  }
  report.push(`${f}: ${before.sq}->${after.sq} schema, page ${after.vq}`);
  if (APPLY) {
    fs.writeFileSync(fp, next);
    changed++;
  }
}

console.log(report.join("\n"));
console.log(APPLY ? `applied ${changed}, skipped ${skipped}` : `dry-run ${report.length} rows, skipped ${skipped}. Pass --apply to write.`);
