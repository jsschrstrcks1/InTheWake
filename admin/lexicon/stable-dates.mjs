// Statement dates that survive a squash merge (Tekton itw-lexicon-stable-dates).
//
// WHY. The generators date a statement drawn from this site's own files by the last commit of the files it
// cites (ship-statements.mjs commitDate), and the date is part of the statement's id. A squash merge gives every
// file a pull request touched a new last commit, so the entity files a branch generated were stale on main the
// moment it merged: measured 2026-10-30, when the #2672 squash re-dated six ships' sources and the
// ship-statements test went red wherever the contract sits beside the checkout (fixed by hand in #2675).
//
// THE RULE. A statement keeps the dates it was first filed with for as long as everything else about it is
// unchanged: the same entity, property, value, unit, status, rank, evidence, publisher and actor. Only a new
// statement, or one whose content changed, takes a date from its sources' commits. The earlier dates are read
// from the entity files as COMMITTED at HEAD (never the working tree, so a hand edit cannot plant a date), and a
// squash keeps those files' content, so regenerating on main after a squash finds every date it needs.
//
// What a date then means: when this value, from these sources, was first filed. An edit elsewhere in a source
// file no longer re-dates a fact it did not change.
// Soli Deo Gloria.
import { execFileSync } from "node:child_process";

/** Everything that makes a statement what it is, except its dates and the id and uncertainty derived from them. */
export function signature(s) {
  return JSON.stringify([
    s.subject, s.ext?.pack, s.ext?.value, s.ext?.unit ?? null, s.ext?.rank ?? null, s.ext?.partition ?? null, s.ext?.tolerance_m ?? null,
    s.epistemic?.status, (s.epistemic?.evidence ?? []).map((e) => [e.ref, e.tier]),
    s.provenance?.publisher ?? null, s.provenance?.source_ref ?? null, s.provenance?.uri ?? null, s.actor?.id ?? null,
  ]);
}

/**
 * The dates of every statement in the entity files committed at HEAD, by signature: Map(sig -> { asserted_at,
 * observed_at }). One `git cat-file --batch` read. A file HEAD does not have contributes nothing; an unreadable
 * repository yields an empty map, so every date falls back to its sources' commits (the old behaviour).
 */
export function priorDates(root, relPaths) {
  const out = new Map();
  if (!relPaths.length) return out;
  let raw;
  try {
    raw = execFileSync("git", ["-C", root, "cat-file", "--batch"], { input: relPaths.map((p) => `HEAD:${p}`).join("\n") + "\n", maxBuffer: 1 << 30 });
  } catch { return out; }
  let i = 0;
  while (i < raw.length) {
    const nl = raw.indexOf(10, i);
    if (nl < 0) break;
    const header = raw.subarray(i, nl).toString("utf8");
    i = nl + 1;
    const m = /^\S+ blob (\d+)$/.exec(header);
    if (!m) continue; // "<name> missing": HEAD does not have this file
    const size = Number(m[1]);
    const body = raw.subarray(i, i + size).toString("utf8");
    i += size + 1;
    let doc;
    try { doc = JSON.parse(body); } catch { continue; }
    for (const s of doc.statements ?? []) {
      const t = s.timestamps ?? {};
      if (t.asserted_at || t.observed_at) out.set(signature(s), { asserted_at: t.asserted_at ?? null, observed_at: t.observed_at ?? null });
    }
  }
  return out;
}

/**
 * Make a statement through `make(at)` (a function of one date string, used for asserted, observed and the
 * clock) and keep the committed statement's dates when its content is unchanged. `fresh()` is called only when
 * there is no earlier statement, so a source with uncommitted edits is still refused for a new fact.
 */
export function keepDates(prior, make, fresh) {
  const probe = make("1970-01-01T00:00:00.000Z");
  const was = prior.get(signature(probe));
  if (was && was.asserted_at && was.observed_at && was.asserted_at === was.observed_at) return make(was.asserted_at);
  return make(fresh());
}
