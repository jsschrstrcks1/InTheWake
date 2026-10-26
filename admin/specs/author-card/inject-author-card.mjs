// inject-author-card.mjs — place the ONE author card on a page (M3.5).
//
// REPLACE, NEVER APPEND. If the page already carries a card — marked, or one of the three variants
// measured on 2026-10-19 (`section/h3`, `div/h4`, `details/summary`) — it is replaced in place. A
// page with no card gets exactly one, before `</main>`. Running it twice produces byte-identical
// output; the must-fail test is the append implementation this invariant refuses.
//
// No eval, no `new Function`, no inline handlers in the emitted markup (In The Wake's rules). The
// component is data read from author-card.html beside this file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const OPEN = "<!-- Author Card -->";
export const CLOSE = "<!-- /Author Card -->";
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CARD_PATH = path.join(HERE, "author-card.html");

const TAG_RE = /<\/?([A-Za-z][A-Za-z0-9-]*)(\s[^>]*)?>/g;

/** The matching close tag for the element that opens at `start`. Returns { innerStart, end } or null. */
export function matchElement(html, start) {
  const m = new RegExp(`<([A-Za-z][A-Za-z0-9-]*)(\\s[^>]*)?>`).exec(html.slice(start));
  if (!m) return null;
  const tag = m[1].toLowerCase();
  const openEnd = start + m[0].length;
  if (/\/\s*>$/.test(m[0])) return { tag, innerStart: openEnd, end: openEnd };
  TAG_RE.lastIndex = openEnd;
  let depth = 1;
  let t;
  while ((t = TAG_RE.exec(html))) {
    const name = t[1].toLowerCase();
    if (name !== tag) continue;
    if (t[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) return { tag, innerStart: openEnd, end: t.index + t[0].length };
    } else if (!/\/\s*>$/.test(t[0])) {
      depth += 1;
    }
  }
  return null;
}

/** The start index of the nearest enclosing `<details ...>` for a card at `cardIndex`, or null. */
function enclosingDetails(html, cardIndex) {
  const before = html.slice(0, cardIndex);
  let at = before.lastIndexOf("<details");
  while (at !== -1) {
    const end = matchElement(html, at);
    if (end && end.end > cardIndex) return { start: at, ...end };
    at = at === 0 ? -1 : before.lastIndexOf("<details", at - 1);
  }
  return null;
}

/**
 * Inject the author card. Pure: returns { html, mode } where mode is
 * replaced-marker | replaced-details | replaced-element | inserted | unchanged.
 */
export function injectAuthorCard(html, component) {
  const card = String(component ?? fs.readFileSync(CARD_PATH, "utf8")).trim();

  // 1. Our own markers win: replace the whole marked region.
  const o = html.indexOf(OPEN);
  const c = html.indexOf(CLOSE, o < 0 ? 0 : o);
  if (o !== -1 && c !== -1 && c > o) {
    return { html: html.slice(0, o) + card + html.slice(c + CLOSE.length), mode: "replaced-marker" };
  }

  // 2. A measured variant. Replace the element that CARRIES the class, or its details wrapper.
  const classAt = html.search(/class\s*=\s*"[^"]*\bauthor-card-vertical\b/);
  if (classAt !== -1) {
    const openAt = html.lastIndexOf("<", classAt);
    const details = enclosingDetails(html, openAt);
    const target = details ?? (openAt !== -1 ? { start: openAt, ...matchElement(html, openAt) } : null);
    if (target && target.end > target.start) {
      return { html: html.slice(0, target.start) + card + html.slice(target.end), mode: details ? "replaced-details" : "replaced-element" };
    }
  }

  // 3. No card: place exactly one before </main>, else before </body>, else at the end.
  const mainClose = html.lastIndexOf("</main>");
  if (mainClose !== -1) return { html: html.slice(0, mainClose) + card + "\n" + html.slice(mainClose), mode: "inserted" };
  const bodyClose = html.lastIndexOf("</body>");
  if (bodyClose !== -1) return { html: html.slice(0, bodyClose) + card + "\n" + html.slice(bodyClose), mode: "inserted" };
  return { html: `${html}\n${card}\n`, mode: "inserted" };
}

function main() {
  const i = process.argv.indexOf("--file");
  const write = process.argv.includes("--write");
  if (i < 0 || !process.argv[i + 1]) {
    console.error("usage: node inject-author-card.mjs --file <page.html> [--write]");
    process.exit(3);
  }
  const file = process.argv[i + 1];
  const before = fs.readFileSync(file, "utf8");
  const r = injectAuthorCard(before);
  if (write) {
    if (r.html === before) console.log(`unchanged (${r.mode})`);
    else { fs.writeFileSync(file, r.html); console.log(`wrote ${file} (${r.mode})`); }
  } else {
    process.stdout.write(r.html);
    console.error(`(${r.mode})`);
  }
}

// Correct-form direct-invocation check (resolved paths, not the naive `file://${argv[1]}` form).
const invokedDirectly = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
