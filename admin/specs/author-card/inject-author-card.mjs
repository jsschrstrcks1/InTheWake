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

const CARD_CLASS = /class\s*=\s*"[^"]*\bauthor-card-vertical\b/;

/**
 * Inject the author card. Pure: returns { html, mode, removed } where mode is
 * replaced-marker | replaced-details | replaced-element | inserted, and `removed` counts the EXTRA
 * cards taken out. Every existing card is removed and the one component stands where the first one
 * stood (our marked region first, else the first measured variant). A page that already carries two
 * cards (the #1916 shape) leaves with exactly one; replacing only the first would keep the duplicate.
 */
export function injectAuthorCard(html, component) {
  const card = String(component ?? fs.readFileSync(CARD_PATH, "utf8")).trim();
  let out = String(html);
  let at = null;
  let mode = null;
  let removed = 0;

  // 1. Our own markers win: the marked region goes, and its place is where the card returns. The
  //    close pairs with the NEAREST open before it. Seven port pages carry a stray open comment with
  //    no close (measured 2026-10-26); pairing the first open with our close would cut out whatever
  //    sits between them (on ports/ocean-cay.html, an <aside>).
  const c = out.indexOf(CLOSE);
  const o = c === -1 ? -1 : out.lastIndexOf(OPEN, c);
  if (o !== -1 && c !== -1) {
    out = out.slice(0, o) + out.slice(c + CLOSE.length);
    at = o;
    mode = "replaced-marker";
  }

  // 2. Every remaining card (a measured variant, or a band-aid duplicate) is removed: the element that
  //    CARRIES the class, or its details wrapper. The first one's place is kept when no marker set it.
  for (let guard = 0; guard < 1000; guard++) {
    const classAt = out.search(CARD_CLASS);
    if (classAt === -1) break;
    const openAt = out.lastIndexOf("<", classAt);
    if (openAt === -1) break;
    const details = enclosingDetails(out, openAt);
    const own = matchElement(out, openAt);
    const target = details ?? (own ? { start: openAt, ...own } : null);
    // An element whose close tag cannot be found is left alone rather than cut at a guess.
    if (!target || !(target.end > target.start)) break;
    // An orphan open marker directly before the card (whitespace between) belongs to it and goes too.
    const lead = /<!-- Author Card -->\s*$/.exec(out.slice(0, target.start));
    if (lead) target.start = lead.index;
    out = out.slice(0, target.start) + out.slice(target.end);
    if (at === null) {
      at = target.start;
      mode = details ? "replaced-details" : "replaced-element";
    } else {
      removed += 1;
      if (target.start < at) at -= target.end - target.start;
    }
  }
  if (at !== null) return { html: out.slice(0, at) + card + out.slice(at), mode, removed };

  // 3. No card: place exactly one before </main>, else before </body>, else at the end.
  const mainClose = out.lastIndexOf("</main>");
  if (mainClose !== -1) return { html: out.slice(0, mainClose) + card + "\n" + out.slice(mainClose), mode: "inserted", removed };
  const bodyClose = out.lastIndexOf("</body>");
  if (bodyClose !== -1) return { html: out.slice(0, bodyClose) + card + "\n" + out.slice(bodyClose), mode: "inserted", removed };
  return { html: `${out}\n${card}\n`, mode: "inserted", removed };
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
    else { fs.writeFileSync(file, r.html); console.log(`wrote ${file} (${r.mode}${r.removed ? `, ${r.removed} duplicate card(s) removed` : ""})`); }
  } else {
    process.stdout.write(r.html);
    console.error(`(${r.mode})`);
  }
}

// Correct-form direct-invocation check (resolved paths, not the naive `file://${argv[1]}` form).
const invokedDirectly = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
