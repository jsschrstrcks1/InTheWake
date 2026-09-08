#!/usr/bin/env node
// bootstrap-dispatch.mjs — multi-root workspace dispatcher for the loud-bootstrap hooks.
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md v1.2.0 §5.1 (A4 — multi-root deployment).
// HLS: p0-read-order-enforcement-bootstrap-hook-edit-guard-preflight-wi.
//
// WHY: per-repo `.claude/settings.json` hooks only load when Claude Code's project dir IS the
// repo. In multi-root workspaces (remote/web sessions with a parent workspace dir like
// /home/user containing several repos) they never load, so bootstrap-guard, the stamp hook,
// and the dangerous-command guard are silently inert — observed live 2026-07-19: a session
// committed to this repo repeatedly with no stamp root even existing. This dispatcher is
// registered at the USER level (~/.claude/settings.json, via admin/install-bootstrap-dispatch.mjs)
// and delegates each tool event to the canonical hooks of whichever onboarded repo the event
// targets. Delegation, not reimplementation: the per-repo hooks stay the single source of truth.
//
// Modes (argv[2]):
//   guard  — PreToolUse (Edit|Write|NotebookEdit|Bash): delegate to the target repo's
//            bootstrap-guard.mjs; exit 2 propagates (deny).
//   stamp  — PostToolUse (Read|Bash): delegate to the target repo's bootstrap-stamp-hook.mjs;
//            always exits 0 (observation must never block).
//
// Repo resolution:
//   Edit/Write/NotebookEdit/Read → walk up from tool_input.file_path/notebook_path.
//   Bash → absolute paths in the command + event cwd, each walked up. A memory-recall
//   command (repo-agnostic) additionally stamps every onboarded repo found in the
//   workspace (own repo root's parent, one level deep) — recall is session-global.
//   "Onboarded" = the directory contains .claude/hooks/bootstrap-guard.mjs.
//
// NAMED LIMITS (do not paper over — spec §4.1 grade: friction, not proof):
//   - Repos without the bootstrap hooks pass silently (un-onboarded ≠ enforced).
//   - User-level registration is enforced at latest from the next session start; some
//     harnesses load it immediately (observed live 2026-07-20 — plan for the floor).
//   - Fail-open on internal dispatcher error, loudly — a dispatch bug must not brick
//     every session (household precedent: bootstrap-guard, dangerous-command-guard).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MODE = process.argv[2];
// UL-175: must accept every recall spelling the Sophos skill documents — including
// `memory_evidence.py recall`, the K1 evidence-envelope path, which this regex omitted
// while bootstrap-lib.mjs included it, so multi-root sessions running the DOCUMENTED
// command left memory-recall unstamped (measured live 2026-08-08 and again 2026-08-19).
// Deliberately a local literal, not an import from ./bootstrap-lib.mjs: this dispatcher
// must fail OPEN on its own internal errors and never gain a load-time dependency that
// can brick every tool call. Parity with the lib is pinned by a test instead
// (tests/bootstrap-dispatch.test.mjs "UL-175" cases).
const RECALL_CMD_RE = /(memory_ops\.py\s+recall|recall-memory\.mjs|memory_evidence\.py\s+recall)/;
const OWN_REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function isOnboarded(dir) {
  try { return fs.existsSync(path.join(dir, ".claude", "hooks", "bootstrap-guard.mjs")); }
  catch { return false; }
}

// Walk up from p to the nearest onboarded repo root (bounded by filesystem root).
function repoRootFor(p) {
  let dir = path.resolve(String(p || ""));
  try { if (fs.statSync(dir).isFile()) dir = path.dirname(dir); } catch { dir = path.dirname(dir); }
  for (let i = 0; i < 40; i++) {
    if (isOnboarded(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

// Onboarded repos that are siblings of (or are) this clone — the workspace set for
// repo-agnostic events like memory recall. Bounded: one directory level.
function workspaceRepos() {
  const found = new Set();
  if (isOnboarded(OWN_REPO_ROOT)) found.add(OWN_REPO_ROOT);
  const wsRoot = path.dirname(OWN_REPO_ROOT);
  let entries = [];
  try { entries = fs.readdirSync(wsRoot, { withFileTypes: true }); } catch { /* bounded scan only */ }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const d = path.join(wsRoot, e.name);
    if (isOnboarded(d)) found.add(d);
  }
  return [...found];
}

function targetsFor(input) {
  const tool = input.tool_name || "";
  const targets = new Set();
  if (tool === "Edit" || tool === "Write" || tool === "NotebookEdit" || tool === "Read") {
    const fp = input.tool_input?.file_path || input.tool_input?.notebook_path || "";
    const root = fp ? repoRootFor(fp) : null;
    if (root) targets.add(root);
  } else if (tool === "Bash") {
    const cmd = String(input.tool_input?.command || "");
    for (const m of cmd.match(/\/[A-Za-z0-9_@%+=:,.~/-]+/g) || []) {
      const root = repoRootFor(m);
      if (root) targets.add(root);
    }
    // Relative `cd x`/`git -C x` targets resolve against the event cwd — without this,
    // `cd open-claw-stuff && git commit` from the workspace root evades attribution
    // (cwd walks UP, never down; landed self-attack probe, closed before ship).
    // UL-1018 (B): repoRoot must not come ONLY from input.cwd — a well-formed payload lacking cwd
    // resolved nothing and the gate guarded NOTHING, exiting 0 silently. Fall back to the process cwd
    // (where the dispatcher was invoked), so a mutation run from inside an onboarded repo is caught
    // even when the harness omits cwd. Silence is the defect: "measured nothing" != "nothing to guard".
    const cwd = input.cwd || process.cwd();
    if (cwd) {
      for (const m of cmd.matchAll(/(?:\bcd|\s-C)\s+([^\s;&|)]+)/g)) {
        const tok = m[1].replace(/^['"]|['"]$/g, "");
        if (tok.startsWith("/") || tok.startsWith("-")) continue;
        const root = repoRootFor(path.resolve(String(cwd), tok));
        if (root) targets.add(root);
      }
      const root = repoRootFor(cwd);
      if (root) targets.add(root);
    }
    if (MODE === "stamp" && RECALL_CMD_RE.test(cmd)) {
      for (const r of workspaceRepos()) targets.add(r);
    }
  }
  return [...targets];
}

try {
  if (MODE !== "guard" && MODE !== "stamp") {
    console.error(`bootstrap-dispatch: unknown mode '${MODE ?? ""}' (want guard|stamp), failing OPEN`);
    process.exit(0);
  }
  const raw = fs.readFileSync(0, "utf8");
  const input = JSON.parse(raw);
  const hookFile = MODE === "guard" ? "bootstrap-guard.mjs" : "bootstrap-stamp-hook.mjs";

  for (const repoRoot of targetsFor(input)) {
    const hook = path.join(repoRoot, ".claude", "hooks", hookFile);
    if (!fs.existsSync(hook)) continue;
    const r = spawnSync("node", [hook], { input: raw, encoding: "utf8" });
    if (r.stderr) process.stderr.write(r.stderr);
    if (MODE !== "guard") continue;      // stamp mode: observation must never block
    if (r.status === 2) process.exit(2); // explicit denial — first denial wins
    if (r.status === 0) continue;        // explicit allow

    // UL-1016: the guard EXISTS but could not RENDER A DECISION — uncaught throw, syntax
    // error, spawn failure, killing signal, any exit outside {0,2}. bootstrap-guard.mjs
    // exits only 0 or 2 by construction, so anything else means it did not get to decide.
    // Before this, only `status === 2` denied, so every such outcome fell through to the
    // loop's exit(0) and the mutation was ALLOWED — while isOnboarded() (a file-existence
    // test) still reported the repo as enforced. That is the household's "present is not
    // runnable" class (UL-888) sitting on the P0 mutation gate: onboarding measured
    // EXISTENCE where enforcement needs a DECISION. Measured 2026-08-23 with an inert
    // differential probe: guard exits 2 -> DENY (control); guard throws -> ALLOW; guard is
    // a syntax error -> ALLOW. (A guard writing 2MB to stdout then exiting 2 still DENIED,
    // so this is deliberately NOT a maxBuffer/ENOBUFS fix — that hypothesis was tested and
    // failed, and no maxBuffer is added here.)
    //
    // "Could not look" is UNAVAILABLE, never CLEAN. Deny, loudly and attributably.
    // The operator keeps the key at THIS level on purpose: a guard that has crashed cannot
    // honour its own HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK, so the dispatcher honours it instead
    // — otherwise this fix would be a brick with no way out.
    const why = r.error
      ? `spawn failed: ${r.error.message}`
      : r.signal
        ? `killed by signal ${r.signal}`
        : `exit ${r.status}`;
    if (process.env.HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK === "0") {
      console.error(`bootstrap-dispatch: guard for ${repoRoot} could not render a decision (${why}) — WARN-ONLY per HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0; ALLOWING.`);
      continue;
    }
    console.error(
      `⛔ BOOTSTRAP DISPATCH: the guard for ${repoRoot} could not render a decision (${why}).\n` +
      `A guard that cannot RUN is UNAVAILABLE, not CLEAN — denying rather than silently allowing this mutation.\n` +
      `  guard: ${hook}\n` +
      `Repair the guard, or set HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0 for warn-only (operator switch, not an agent's).`
    );
    process.exit(2);
  }
  process.exit(0);
} catch (e) {
  const why = e?.message || e;
  if (MODE === "guard" && process.env.HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK !== "0") {
    console.error(
      `⛔ BOOTSTRAP DISPATCH: internal error in GUARD mode (${why}) — the mutation gate cannot read or ` +
      `dispatch this request, so it cannot confirm the mutation is safe. DENYING (fail-closed, UL-1018).\n` +
      `  Malformed stdin or a dispatcher fault must not become permission to proceed.\n` +
      `  Set HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0 for warn-only (operator switch, not an agent's).`,
    );
    process.exit(2);
  }
  console.error(
    `bootstrap-dispatch: internal error (${why}) — ` +
    (MODE === "guard" ? "WARN-ONLY per HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0, ALLOWING" : "stamp observation lost, exit 0") + ".",
  );
  process.exit(0);
}
