// bootstrap-lib.mjs — shared loud-bootstrap stamp + guard logic.
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md v1.2.0 (R1–R3).
// HLS: loud-bootstrap-impl-claude-code · loud-bootstrap-impl-grok
//
// Dual-runtime: Claude Code (snake_case tools) + Grok (camelCase tools).
// Tamper-evidence grade: FRICTION, not proof (named limit, spec §4.1).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

/** Repo that contains this hooks tree (open-claw-stuff / ocs-work clone). */
export const HOOK_FILE_REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
/** @deprecated Prefer getRepoRoot(input) — kept for Claude test compatibility. */
export const REPO_ROOT = HOOK_FILE_REPO_ROOT;
export const REPO_NAME = path.basename(HOOK_FILE_REPO_ROOT);

// Layer keys → canonical file suffix (read-observed). memory-recall is
// command-observed (spec §4.1 per-layer observation table).
export const LAYER_SUFFIXES = {
  "soli-deo-gloria": "skills/soli-deo-gloria/SKILL.md",
  "careful-not-clever": "skills/careful-not-clever/SKILL.md",
  "sophos": "skills/sophos/SKILL.md",
  "sophos-os": "docs/SOPHOS-OPERATING-SYSTEM.md",
  "household-rulebook": "docs/HOUSEHOLD-AGENT-RULEBOOK.md",
  "household-library": "skills/household-library/SKILL.md",
};
// The `['"]?` after `.py` is load-bearing: the household's OWN SessionStart injection prints the
// recall command with the script path in DOUBLE QUOTES (python3 "/abs/memory_evidence.py" recall ...),
// so the closing quote sits between `.py` and the whitespace. Without tolerating it, the canonical
// printed command never stamps, an agent runs recall verbatim and is still denied every mutation for
// the whole session (measured 2026-09-05, cost ~15 turns; the same class as the cat/sed read-credit
// gap). Optional, and single- or double-quote, so both the quoted and the bare forms credit; `encode`
// still cannot match, because `recall` must follow.
export const RECALL_CMD_RE =
  /(memory_ops\.py['"]?\s+recall|recall-memory\.mjs|memory_evidence\.py['"]?\s+recall)/;

// A recall that CREDITS layer 5 must be a GENUINE recall, not a ritual: the command has to invoke a
// recall tool AND carry a non-empty task query. An empty `recall ""` or a bare `recall-memory.mjs` with
// no task is a checkbox, not the continuity layer, and it must not earn credit. This closes the shortcut
// where an agent runs the recall command for the sake of the stamp without recalling anything for the
// actual task. Same posture as the ledger: watch the behavior, not the shape of the command.
// The same optional quote after `.py` as RECALL_CMD_RE (#3476): a quoted script path is still a genuine recall.
export function isGenuineRecall(command) {
  const s = String(command || "");
  if (!RECALL_CMD_RE.test(s)) return false;
  const pyQuery = /(?:memory_ops\.py|memory_evidence\.py)['"]?\s+recall\s+["']?[A-Za-z0-9][^"';&|]*/.test(s);
  const mjsTask = /"task"\s*:\s*"[A-Za-z0-9][^"]*"/.test(s) && /recall-memory\.mjs/.test(s);
  return pyQuery || mjsTask;
}
export const ALL_LAYERS = [...Object.keys(LAYER_SUFFIXES), "memory-recall"];

// ── One house, one manifest, per-runtime read surface (measured 2026-09-12) ─────────────────────
// The house had TWO definitions of "the bootstrap is complete": this canonical set, and a second,
// longer list living inside the codex adapter. Two lanes disagreeing on what complete means is a
// governance defect, not a style difference: a session can satisfy one definition and fail the other
// while both report a completed bootstrap.
//
// The fix is not to pick a winner. The canonical seven ARE the layer set — what complete means in
// every runtime. A runtime may require MORE reads for its own read surface (codex has no trustworthy
// Read event and must read through Bash, so it names more components). Those extras are declared HERE,
// in data, with their paths, so the difference is visible and shared rather than accidental and buried
// in an adapter. Codex's extras stay exactly as strict as they were.
export const RUNTIME_EXTRA_LAYERS = {
  codex: {
    "sophos-kernel": "atlas/server/sophos.mjs",
    "hard-safety": "skills/destructive-command-safety/SKILL.md",
    "faithful-stewardship": "skills/faithful-stewardship/SKILL.md",
    "ken-voice": "skills/ken-voice/SKILL.md",
    "skynet-voice": "skills/skynet-voice/SKILL.md",
  },
};

/** Everything a runtime must read before a mutation: canonical layers, then its declared extras. */
export function requiredLayerPaths(runtime) {
  const extras = RUNTIME_EXTRA_LAYERS[String(runtime || "").toLowerCase()] || {};
  return { ...LAYER_SUFFIXES, ...extras };
}

/** Every layer NAME a runtime must carry, canonical set first. */
export function requiredLayers(runtime) {
  const extras = Object.keys(RUNTIME_EXTRA_LAYERS[String(runtime || "").toLowerCase()] || {});
  return [...ALL_LAYERS, ...extras];
}

// A Bash READ of one or more Layer 0/1 files credits each of them, mirroring RECALL_CMD_RE
// for recall. Closes the gap where an agent reading the layers via `cat`/`sed`/`head` — which
// "auto mode" actively instructs — got NO credit and was falsely denied every mutation for the
// whole session (measured live 2026-09-05, cost ~15 turns; HLS #3317). A read VERB is REQUIRED,
// so a mere mention (`echo path`), a delete (`rm path`), or a move (`mv path`) of a layer path
// is never miscredited as a read. The credit is no weaker than the Read tool's: both mean "the
// layer content was accessed", and neither can prove the agent absorbed it.
export const LAYER_READ_VERB_RE =
  /(?:^|[;&|]\s*|\s|\()(?:cat|bat|less|more|view|nl|od|xxd|sed|head|tail)\b/;
// ── Red-team findings 6-8, 11 (closed 2026-09-12) ───────────────────────────────
// The first cut of R1/R2 credited TEXT, not EXECUTION: `echo cat <layer path>` credited the layer,
// `/tmp/.../fake/skills/sophos/SKILL.md` credited it from outside the repo, and `echo "node
// admin/library.mjs claim-patron"` credited the checklist step. Every one was a substring match.
// Two rules close that family: a credit path must resolve INSIDE the household (or a named install
// home), and a printed/echoed string is never an execution.
function pathWithinAllowed(p, repoRoot) {
  if (!repoRoot) return true; // containment is enforced only when the caller names the root
  const home = os.homedir();
  const roots = [repoRoot, path.join(home, ".hermes", "skills"), path.join(home, ".grok", "skills")];
  const raw = String(p || "");
  // A relative path in a hook payload is relative to the session's repo (the runtime's cwd); an
  // absolute path must still resolve inside an allowed root. Both are contained; a decoy on disk is not.
  const a = raw
    ? path.isAbsolute(raw)
      ? path.resolve(raw)
      : path.resolve(repoRoot, raw)
    : "";
  if (!a) return false;
  // A leaf session may legitimately read the CANONICAL layer from the hub (spec §4.1: the canonical
  // file or its registered repo-local sync copy), so a path inside another household repo counts.
  //
  // BUT THE MARKER TEST IS CIRCULAR AND CANNOT STAND ALONE (measured 2026-09-18). HOUSEHOLD_MARKERS
  // includes `skills/sophos/SKILL.md` and `docs/SOPHOS-OPERATING-SYSTEM.md` — the very files a credit
  // path points at. So `mkdir -p /tmp/decoy/skills/sophos && echo x > .../SKILL.md` makes /tmp/decoy
  // a "household repo" BY THE ACT OF PLANTING THE DECOY, containment passes, and `cat` of that file
  // credits the sophos layer to a session that never opened the real doctrine. Six such files mint a
  // whole posture on any writable path. This hits the Read tool too, not only Bash.
  //
  // A real household repo is a CHECKOUT. Requiring .git does not make forgery impossible (an agent
  // that can mkdir can also `git init`), and that residual is named here rather than hidden: the
  // durable fix is an allowlist of known roots the candidate path cannot contribute to. What this
  // does buy is that the cheap attack — an ordinary directory — no longer authenticates itself.
  // Walk for an ancestor that is BOTH a household repo AND a checkout. walkHouseholdRoot alone
  // returns the FIRST marker-bearing ancestor, which in the leaf layout is the `.claude` directory
  // itself (it holds skills/sophos/SKILL.md), and that is not where .git lives. Checking only that
  // first hit rejected an honest cross-repo read of Project-Sophos, so this checks each level.
  let cur = path.dirname(a);
  for (let i = 0; i < 10; i++) {
    if (isHouseholdRepo(cur) && fs.existsSync(path.join(cur, ".git"))) return true;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return roots.some((r) => {
    const rr = path.resolve(r);
    return a === rr || a.startsWith(rr + path.sep);
  });
}

/** True when the command only PRINTS the words (echo/printf, or a leading true/:), never runs them. */
function isMentionOnly(s) {
  const head = String(s).trim().split(/[\s;&|()]+/).filter(Boolean)[0] || "";
  if (/^(echo|printf|print|true|:)$/.test(head)) return true;
  return /\b(echo|printf)\s[^;&|]*\b(?:cat|bat|less|more|view|nl|od|xxd|sed|head|tail)\b/.test(s);
}

function stripComments(s) {
  return String(s).replace(/(^|\s)#[^\n]*/g, " ");
}

export function layersFromBashRead(command, repoRoot = null) {
  const s = stripComments(command);
  if (isMentionOnly(s)) return []; // a mention is not a read
  if (!LAYER_READ_VERB_RE.test(s)) return [];
  // CONTAINMENT, reopened and closed 2026-09-18. The two rules above this function say a credit path
  // "must resolve INSIDE the household", and pathWithinAllowed was written for it, and THIS FUNCTION
  // NEVER CALLED IT. Only the mention half landed. So `cat /tmp/decoy/skills/sophos/SKILL.md` was a
  // genuine execution, with a genuine read verb, on a path inside no repo, and it credited the layer:
  // red-team finding 7 still live months after it was recorded as closed.
  //
  // The credit is now per-TOKEN, not per-substring. A bare `s.includes(suffix)` cannot tell which
  // path carried the suffix, so it could not be contained even in principle; splitting first means
  // the thing we resolve is the thing the shell would have opened.
  const tokens = s.split(/[\s;&|()<>'"]+/).filter(Boolean);
  const hits = [];
  for (const [key, suffix] of Object.entries(LAYER_SUFFIXES)) {
    const token = tokens.find((t) => t.includes(suffix));
    if (token && pathWithinAllowed(token, repoRoot)) hits.push(key);
  }
  return hits;
}

/**
 * Rung 1 (2026-09-12). A READ that returned no content is not a read: the meter must not move on a
 * dedup/no-op re-read. Measured live this session: a second read of soli-deo-gloria returned
 * "unchanged since last read" with `content_returned:false`, and the stamp credited the layer anyway.
 * An agent could then walk the read order by re-reading each layer once with no content returned.
 *
 * Returns true (content observed), false (the runtime SAID there was no content), or null (the
 * runtime supplied no result at all — see the named limit: we cannot tell a read from a re-run there,
 * so backward compatibility credits it rather than bricking runtimes that send no tool_response).
 */
export function readReturnedContent(raw) {
  const r =
    raw?.tool_response ?? raw?.tool_result ?? raw?.toolResponse ?? raw?.toolResult ?? null;
  if (r === undefined || r === null) return null; // no result channel — cannot tell
  if (typeof r === "object") {
    if (r.content_returned === false) return false;
    if (r.dedup === true) return false;
    let s = "";
    try {
      s = JSON.stringify(r);
    } catch {
      return null;
    }
    if (/unchanged since last read/i.test(s)) return false;
    return s.length > 2 ? true : null; // "{}" / "[]" is an empty observation, not content
  }
  const s = String(r);
  if (s.trim() === "") return null; // an empty string is not affirmative evidence either way
  if (/unchanged since last read/i.test(s)) return false;
  return true;
}

/**
 * Rung 1's result channel, runtime-agnostic by construction (operator directive 2026-09-12: "everything
 * you build should be agnostic of hermes; if it works for hermes, it works for grok, and codex").
 *
 * ONE table, ONE rule, a CLOSED enumeration of every runtime `getRuntime()` can return, and the
 * evidence for each row. The rule is not "hermes requires a result"; it is "a read must return
 * evidence, and a runtime is exempt only where that is a measured fact about the runtime". A row that
 * is `null` is UNMEASURED, and unmeasured must not be bricked on a guess, so it is not yet enforced;
 * `bootstrap-result-channel-coverage.test.mjs` refuses a runtime with no row at all, so a new runtime
 * cannot be silently skipped, and the follow-up is to measure each row rather than to special-case one.
 */
export const RUNTIME_RESULT_CHANNELS = {
  "claude-code": { sendsResult: null, evidence: "UNMEASURED — PostToolUse is documented to carry tool_response; not measured from this lane" },
  grok: { sendsResult: null, evidence: "UNMEASURED — camelCase payload; toolResponse handled if present" },
  codex: { sendsResult: null, evidence: "UNMEASURED — Stop payload observed; no result channel seen" },
  hermes: { sendsResult: true, evidence: "measured 2026-09-12: post_tool_call carries tool_response; a Read with none is not a read" },
};

/** Does this runtime send an observed result, per the table? Unmeasured rows (`null`) return false. */
export function runtimeSendsResult(runtime) {
  const k = String(runtime || "").toLowerCase();
  const row = RUNTIME_RESULT_CHANNELS[k] || RUNTIME_RESULT_CHANNELS["claude-code"]; // runtime-agnostic-lint: allowed the table's own default row, read and not decided
  return row.sendsResult === true;
}

// ── Rung 2 (2026-09-12): "fully" is the pointer's checklist, not just seven file reads ──────────
// HERMES.md / CLAUDE.md carry session steps beyond the read order: load the pointer, inject operator
// law, claim a patron, run the preflight. None were observed, so an agent could call a bootstrap
// "full" with the stamp green while skipping every one. These are observed as ACTIONS and credited on
// OBSERVED EXECUTION, never on success — `claim-patron` legitimately refuses on a shared machine, and
// the step is DONE when it has been run (the same posture as memory-recall being command-observed).
export const ACTION_KEYS = ["pointer", "directives_inject", "claim_patron", "preflight"];

const POINTER_BASENAMES = ["HERMES.md", "CLAUDE.md", "GROK.md", "AGENT.md", "AGENTS.md"];

/** Which checklist step a shell command satisfies, or null. */
export function actionFromBashCommand(command) {
  const s = stripComments(command);
  if (isMentionOnly(s)) return null; // printed, never executed
  if (/memory-directives-inject\.sh|memory_evidence\.py\s+directives/.test(s)) return "directives_inject";
  if (/library\.mjs['"]?\s+claim-patron/.test(s)) return "claim_patron";
  if (/library\.mjs['"]?\s+preflight/.test(s)) return "preflight";
  return null;
}

/** Which checklist step a Read satisfies (the runtime pointer file), or null. */
export function pointerFromFilePath(fp, repoRoot = null) {
  const base = String(fp || "").split("/").pop();
  if (!POINTER_BASENAMES.includes(base)) return null;
  if (!pathWithinAllowed(fp, repoRoot)) return null; // a decoy elsewhere on disk is not the pointer
  return "pointer";
}

/** The checklist steps not yet observed. An unreadable/forged stamp is missing ALL of them (loud). */
export function missingActions(stamp, repoRoot = null) {
  if (!stamp || stamp === "forged") return ACTION_KEYS.filter((k) => actionApplicable(k, repoRoot));
  return ACTION_KEYS.filter((k) => actionApplicable(k, repoRoot) && !stamp.actions_read?.[k]);
}

/**
 * Rung 2 applicability (careful-not-clever, #3077): a step may only be REQUIRED where it is
 * POSSIBLE. A leaf repo carries the guard but no `admin/library.mjs`, so requiring claim-patron or
 * preflight there would deny every mutation forever — the exact bricking #3077 exists to prevent.
 * UNAVAILABLE is not UNREAD (axiom 21): an inapplicable step is dropped from the requirement, not
 * silently credited.
 */
export function actionApplicable(step, repoRoot) {
  if (!repoRoot) return true;
  const has = (rel) => {
    try {
      return fs.existsSync(path.join(repoRoot, ...rel.split("/")));
    } catch {
      return false;
    }
  };
  switch (step) {
    case "pointer":
      return POINTER_BASENAMES.some((b) => has(b));
    case "directives_inject":
      return has(".claude/hooks/memory-directives-inject.sh") || has("admin/memory_evidence.py");
    case "claim_patron":
    case "preflight":
      return has("admin/library.mjs");
    default:
      return true;
  }
}

// ── Rung 3 (2026-09-12): the read order is enforced, narrowly ───────────────────────────────────
// The pointer says "do not skip to §5-6 without §0-4". A strict total order is NOT enforced here,
// deliberately: a genuine recall legitimately happens before any layer read, and parallel reads with
// near-equal timestamps would make a pairwise-inversion rule deny honest sessions. The enforced rule
// is the pointer's own boundary — a §5-6 read may not be credited before the first of §0-4.
// The order is DERIVED from the recorded layer timestamps, so no extra bookkeeping can drift from it.
export const READ_ORDER_HEAD = ["soli-deo-gloria", "careful-not-clever", "sophos", "sophos-os"];
export const READ_ORDER_TAIL = ["household-rulebook", "household-library"];

/** A description of the order violation, or null. Missing layers are a different finding (loud). */
export function readOrderViolation(stamp) {
  if (!stamp || stamp === "forged") return null;
  const lr = stamp.layers_read || {};
  const tsOf = (k) => {
    const v = lr[k];
    if (!v) return null;
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : null;
  };
  const headTimes = READ_ORDER_HEAD.map(tsOf).filter((t) => t !== null);
  // Finding 18 (closed 2026-09-12): a recorded violation STANDS until a full in-order re-read happens.
  // Without this the only cure was deleting the stamp, which is the unrecorded path; the honest remedy
  // must be re-reading, and that remedy must actually clear it.
  const floor = stamp.order_violation_at ? Date.parse(stamp.order_violation_at) : NaN;
  if (Number.isFinite(floor)) {
    const required = [...READ_ORDER_HEAD, ...READ_ORDER_TAIL];
    const reread = required.every((k) => {
      const t = tsOf(k);
      return t !== null && t > floor;
    });
    if (!reread) {
      return `read order violated at ${stamp.order_violation_at} (§5-6 before §0-4); re-read the layers in order to clear it`;
    }
  }
  if (!headTimes.length) return null;
  const earliestHead = Math.min(...headTimes);
  const offenders = READ_ORDER_TAIL.filter((k) => {
    const t = tsOf(k);
    return t !== null && t < earliestHead;
  });
  if (!offenders.length) return null;
  return `§5-6 read before §0-4: ${offenders.join(", ")} credited before the first of [${READ_ORDER_HEAD.join(", ")}]`;
}

/** Grok / Claude / Hermes tool names → canonical names used by stamp + guard.
 *  Keys are lower-case; lookup is case-insensitive (adv: `bash` / `RUN_TERMINAL_COMMAND`).
 *
 *  The Hermes entries are not cosmetic: without them a Hermes `write_file`/`patch`
 *  normalises to itself, isRepoMutation() matches nothing, and the bootstrap guard
 *  ALLOWS the edit while reporting wired. Measured 2026-09-11 while wiring the
 *  Hermes native hooks (pre_tool_call/post_tool_call) — the alias table was the
 *  whole difference between a belt and a decoration. */
const TOOL_ALIASES = {
  read: "Read",
  read_file: "Read",
  bash: "Bash",
  run_terminal_command: "Bash",
  shell: "Bash",
  edit: "Edit",
  write: "Write",
  multiedit: "Edit",
  search_replace: "Edit",
  notebookedit: "NotebookEdit",
  notebook_edit: "NotebookEdit",
  // Hermes (skynet2) tool names.
  terminal: "Bash",
  write_file: "Write",
  patch: "Edit",
  edit_file: "Edit",
  skill_view: "SkillView",
};

export function getRuntime() {
  const r = String(process.env.HOUSEHOLD_RUNTIME || "").trim().toLowerCase();
  if (r === "grok" || r === "claude-code" || r === "codex" || r === "hermes") return r; // runtime-agnostic-lint: allowed the runtime registry itself, the one place the names are canonicalised
  return "claude-code";
}

export function getPatron() {
  return process.env.HOUSEHOLD_PATRON
    || (getRuntime() === "grok" ? "grok1" : "claude-code"); // runtime-agnostic-lint: allowed the lane's own display name, named not hidden
}

// Household-repo markers — what makes the loud-bootstrap belt apply to a tree.
// #3077 (yumi, 2026-09-03): the original three markers are things only a FULL open-claw-stuff
// clone carries. Leaf repos onboarded per spec §5.2 (Project-Sophos, the recipe repos) carry
// the hook trio and the synced front door under .claude/ and NONE of the three — so the guard
// they carried answered "not a household repo", exited 0 on every unstamped mutation, and
// bootstrap-dispatch (which keys "onboarded" on the guard FILE existing) reported them as
// enforced. Measured live through the user-level dispatcher with inert probes: unstamped
// Write, Edit and `git commit` into Project-Sophos ALLOWED; the same probes into ocs-work
// DENIED. Four of 22 onboarded repos on the operator Mac had that shape. "Present is not
// runnable" (UL-888 / UL-1016 class) sitting on the P0 mutation gate.
// Rule: a marker must be something that STAYS (a moved document is UL-266 again), and the
// onboarding itself is a marker — carrying this guard IS being a household repo, which is
// the same definition bootstrap-dispatch.mjs uses for "onboarded". Named limit: a guard copy
// dropped into any tree makes that tree guarded; that is the belt doing its job, not a false
// positive — the dispatcher would already have spawned it.
export const HOUSEHOLD_MARKERS = [
  ".claude/hooks/bootstrap-guard.mjs", // the onboarding itself (spec §5.2) — dispatcher parity
  ".claude/skills/sophos/SKILL.md",    // synced front door (leaf-repo layout)
  "skills/sophos/SKILL.md",            // canonical front door (open-claw-stuff layout)
  ".household-root",                   // machine-neutral discovery file (household-root-resolver step 3)
  ".household-library",
  "docs/SOPHOS-OPERATING-SYSTEM.md",
];

export function isHouseholdRepo(root) {
  if (!root) return false;
  try {
    return HOUSEHOLD_MARKERS.some((m) => fs.existsSync(path.join(root, ...m.split("/"))));
  } catch {
    return false;
  }
}

function walkHouseholdRoot(start) {
  let cur = path.resolve(start);
  for (let i = 0; i < 8; i++) {
    if (isHouseholdRepo(cur)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}

/**
 * Resolve household repo root for this hook invocation.
 * Prefer env, then workspace/cwd markers, else the hooks tree's clone.
 */
export function getRepoRoot(input = null) {
  if (process.env.HOUSEHOLD_REPO_ROOT) {
    return path.resolve(process.env.HOUSEHOLD_REPO_ROOT);
  }
  if (input) {
    for (const key of ["workspaceRoot", "workspace_root", "cwd"]) {
      const v = input[key];
      if (v) {
        const found = walkHouseholdRoot(String(v));
        if (found) return found;
      }
    }
  }
  return HOOK_FILE_REPO_ROOT;
}

export function getRepoName(input = null) {
  return path.basename(getRepoRoot(input));
}

/**
 * Normalize Claude (snake_case) and Grok (camelCase) hook stdin into one shape.
 * tool_name is canonical (Read|Bash|Edit|Write|NotebookEdit|…).
 */
export function normalizeHookInput(raw) {
  if (!raw || typeof raw !== "object") return null;
  // Session id comes from the hook PAYLOAD only — deliberately never from the
  // environment. 2026-08-08: an agent proposed a CLAUDE_CODE_SESSION_ID fallback after
  // seeing an id-less denial, then found it broke three sessionid-contract tests and
  // was solving a bug that did not exist. Two reasons it must stay payload-only:
  //   1. The premise was wrong. This runtime DOES supply session_id — the denial came
  //      from a hand-made probe JSON that omitted it, not from a real invocation. The
  //      real failure was that the hooks were never registered at all (multi-root/remote;
  //      SOPHOS-OPERATING-SYSTEM §0 case 2, memory 6857086c, 2026-07-20). Fix the
  //      registration (admin/install-bootstrap-dispatch.mjs), not the attribution.
  //   2. Even if it were needed, env is AMBIENT, not per-invocation: an exported value
  //      lets an id-less call inherit an identity the runtime never assigned it, which
  //      is exactly the hole sessionIdValid() closes. The tests encode that contract.
  const session_id = raw.session_id ?? raw.sessionId ?? raw.sessionID ?? "";
  const rawTool = String(raw.tool_name ?? raw.toolName ?? "");
  const tool_name = TOOL_ALIASES[rawTool.toLowerCase()] || rawTool;
  const tool_input = raw.tool_input ?? raw.toolInput ?? {};
  // Unify path fields: Claude file_path, Grok target_file / path
  const file_path =
    tool_input.file_path
    ?? tool_input.target_file
    ?? tool_input.path
    ?? tool_input.notebook_path
    ?? "";
  // Shell command: string, or rare array form (join with spaces for scan only).
  let command = tool_input.command ?? tool_input.cmd ?? "";
  if (Array.isArray(command)) command = command.map(String).join(" ");
  else command = String(command ?? "");
  const normalized_input = {
    ...tool_input,
    file_path: file_path || tool_input.file_path,
    command,
  };
  return {
    session_id: String(session_id),
    tool_name,
    tool_input: normalized_input,
    workspaceRoot: raw.workspaceRoot ?? raw.workspace_root ?? raw.cwd ?? "",
    raw,
  };
}

// Stamp root is HOUSEHOLD-SHARED, not per-repo (spec §5.2 A5, operator directive
// 2026-07-20): the six-layer read order is household-global and a session is one
// session across every repo it touches — per-repo buckets demand the same canonical
// reads once per repo, and a multi-repo session bootstrapped in one repo is denied
// in the next. Measured live 2026-08-19: Project-Sophos's guard (A5-lineage hooks,
// shared bucket) was mechanically unsatisfiable because the canonical stamp hook
// filed reads in a per-repo bucket its checker never consulted. The A5
// implementation (5ba8fced) never merged to main; the per-repo variant arrived in a
// bulk hook import (66b53970) with no counter-rationale — this restores the spec'd
// design, keeping main's dual-runtime split and the env override. `input` stays in
// the signature for caller compatibility; the location no longer depends on it.
// Migration cost, named: stamps in the old per-repo buckets are not read from the
// new location, so each live session re-earns its stamp once via the read order.
// Operator applied 2026-08-19 (HLS p1-loud-bootstrap-spec-vs-lib-stamp-root).
export function stampRoot(input = null) {
  if (process.env.HOUSEHOLD_BOOTSTRAP_ROOT) {
    return process.env.HOUSEHOLD_BOOTSTRAP_ROOT;
  }
  const runtime = getRuntime();
  if (runtime === "grok") { // runtime-agnostic-lint: allowed grok's own stamp path, named not hidden
    return path.join(os.homedir(), ".grok", "household-bootstrap", "household-v2");
  }
  return path.join(os.homedir(), ".claude", "household-bootstrap", "household-v2");
}

export function eventsPath(input = null) {
  if (process.env.HOUSEHOLD_BOOTSTRAP_EVENTS) {
    return process.env.HOUSEHOLD_BOOTSTRAP_EVENTS;
  }
  return path.join(getRepoRoot(input), ".household-library", "events.jsonl");
}

function secretPath(input = null) {
  return path.join(stampRoot(input), ".secret");
}

// The HMAC key for stamp sealing/verification. A failed READ must never become a WRITE
// (p1-guard-residual / #2752): distinguish a genuine first run (no secret yet -> create) from
// an existing-but-UNREADABLE secret. Overwriting the latter would ROTATE the key and ERASE the
// on-disk tamper signal, and THROWING would escape bootstrap-guard's outer catch, which fails
// OPEN (exit 0). On any non-ENOENT read error — or a read-only caller (verify) that reached a
// missing secret — do neither: return an EPHEMERAL, unpersisted key so every HMAC check fails
// CLOSED ("forged") while the on-disk secret is left untouched. `allowCreate` is the asymmetry:
// only sealing (first run) may mint; verification is strictly read-only.
/**
 * The signing key AND whether it was actually ESTABLISHED (#2753 residual, measured 2026-09-06).
 *
 * getSecret returns an ephemeral key when the anchor cannot be read, so verification fails
 * CLOSED. That is right for VERIFYING and wrong for SEALING: saveStamp is bookkeeping and the
 * guard calls it on a denial, so an unreadable anchor caused the good on-disk seal to be
 * OVERWRITTEN with an ephemeral one. Restoring the file permissions then recovered nothing,
 * because the stamp no longer matched the real secret. A transient permission problem became a
 * PERMANENT disarm, which is precisely what bootstrap-guard's own comment says bookkeeping must
 * never do. Callers that WRITE must ask for the status and refuse to seal when it is false.
 */
export function secretStatus(input = null, { allowCreate = true } = {}) {
  const p = secretPath(input);
  try {
    return { key: fs.readFileSync(p, "utf8").trim(), established: true };
  } catch (e) {
    const code = e && e.code;
    if (code === "ENOENT" && allowCreate) {
      try {
        fs.mkdirSync(stampRoot(input), { recursive: true });
        const s = crypto.randomBytes(32).toString("hex");
        fs.writeFileSync(p, s, { mode: 0o600 });
        return { key: s, established: true };
      } catch {
        // Could not mint either. Fall through to the ephemeral key rather than throwing: an
        // uncaught throw here escaped to the guard's outer catch, which used to exit 0 (allow).
      }
    }
    console.error(
      `bootstrap-lib.getSecret: secret at ${p} could not be read (${code || "unknown"})${allowCreate ? "" : " under a read-only check"} — using an ephemeral key so verification fails CLOSED; the on-disk secret was NOT overwritten. Restore its permissions to re-enable bootstrap.`,
    );
    return { key: crypto.randomBytes(32).toString("hex"), established: false };
  }
}

export function getSecret(input = null, opts = {}) {
  return secretStatus(input, opts).key;
}

export function hmacOf(stamp, secret) {
  const { hmac, ...body } = stamp;
  // Recursively bind the read evidence too. A replacer array drops nested keys.
  // Legacy seals must be re-earned through observed reads; never accept both formats.
  const canon = JSON.stringify(canonicalEventBody(body));
  return crypto.createHmac("sha256", secret).update(canon).digest("hex");
}

// Invalid ids must never satisfy the gate (loud-bootstrap-sessionid-contract).
export function sessionIdValid(raw) {
  const s = String(raw ?? "").trim();
  return s !== "" && s.toLowerCase() !== "unknown";
}

/**
 * The ONE session-id resolution both the guard and the stamp writer use. They
 * MUST agree: if the stamp hook records reads under one key and the guard checks
 * another, a fully-bootstrapped session is denied and pushed to the escape hatch
 * (p2-bootstrap-guard-stamp-writer-session-id-split, measured 2026-08-09). An id
 * sessionIdValid rejects (empty, "unknown" in any case, whitespace-only) resolves
 * to the literal "unknown" — the same key the guard denies under — so the two can
 * never key a different stamp file for the same payload.
 */
export function resolveSessionId(input) {
  const id = input && typeof input === "object" ? input.session_id : input;
  return sessionIdValid(id) ? String(id) : "unknown";
}

export function stampPath(sessionId, input = null) {
  const safe = String(sessionId || "unknown").replace(/[^A-Za-z0-9_.-]/g, "_");
  return path.join(stampRoot(input), `${safe}.json`);
}

export function loadStamp(sessionId, input = null) {
  try {
    return JSON.parse(fs.readFileSync(stampPath(sessionId, input), "utf8"));
  } catch {
    return null;
  }
}

export function newStamp(sessionId, input = null) {
  const layers = {};
  for (const k of ALL_LAYERS) layers[k] = null;
  const runtime = getRuntime();
  return {
    session_id: String(sessionId || "unknown"),
    runtime,
    repo: getRepoName(input),
    patron: getPatron(),
    started_at: new Date().toISOString(),
    layers_read: layers,
    grade: "friction",
    written_by:
      runtime === "grok" ? "bootstrap-stamp-hook.mjs(grok)" : "bootstrap-stamp-hook.mjs", // runtime-agnostic-lint: allowed grok's stamp writer label, named not hidden
    ledgered: false,
    denials: 0,
  };
}

export function saveStamp(stamp, input = null) {
  // Never seal with a key that was not ESTABLISHED. Writing an ephemeral-key seal over a good
  // one turns a transient unreadable anchor into a permanent disarm: verification keeps failing
  // even after the permissions are restored, because the stamp no longer matches the real
  // secret. Losing this write is strictly better than corrupting the anchor, so we refuse it
  // LOUDLY and leave whatever is on disk intact.
  const { key, established } = secretStatus(input);
  if (!established) {
    // THROW rather than return quietly. Both callers already treat a failed write as a
    // bookkeeping failure and report it loudly (the guard prints "denial bookkeeping failed"
    // and still denies; the stamp hook logs and exits 0), and #2727 pins that report. A silent
    // return would suppress it, which is how a guard stops saying what it could not do.
    throw new Error(
      "refusing to re-seal the stamp with an ephemeral key: the trust anchor is not readable, " +
      "so sealing now would overwrite a good seal and make the disarm permanent. The existing " +
      "stamp is left untouched so bootstrap recovers once the anchor is restored.",
    );
  }
  fs.mkdirSync(stampRoot(input), { recursive: true });
  stamp.hmac = hmacOf(stamp, key);
  fs.writeFileSync(
    stampPath(stamp.session_id, input),
    JSON.stringify(stamp, null, 2) + "\n",
  );
}

/**
 * Merge-on-write for parallel Reads (UL-078). The stamp hook is read-modify-write: two Read events
 * in one session both load the SAME stamp, each set their own layer, and the last saveStamp()
 * clobbers the layer the other added. A fully-read session then looks incomplete and is denied.
 * Before writing, union this stamp layers_read with whatever is on disk NOW (a concurrent hook may
 * have written a layer since we loaded), keeping the LATER timestamp per layer (#3431), and adopt an
 * on-disk ledgered:true so the bootstrap event is not appended twice. Not a lock: it converts a
 * last-writer CLOBBER into a last-writer UNION, the standard mitigation for this class.
 */
export function mergeLayersFromDisk(stamp, input = null) {
  const onDisk = verifyStamp(stamp.session_id, input);
  if (!onDisk || typeof onDisk !== "object") return stamp;
  stamp.layers_read = stamp.layers_read || {};
  for (const [layer, ts] of Object.entries(onDisk.layers_read || {})) {
    if (!ts) continue;
    const mine = stamp.layers_read[layer];
    // #3431: LATEST read wins, not earliest.
    //
    // Earliest-wins was correct for what UL-078 solved (a concurrent Read must not be
    // clobbered, and the bootstrap event must not double-append) and WRONG for freshness: it
    // silently restored the OLD timestamp over a fresh one, so the stamp hook's refresh was
    // undone on the very next union and a posture read stayed write-once no matter what the
    // writer did. Write-once was enforced in TWO places, not one. UL-078's actual concern was
    // losing a layer's PRESENCE, which latest-wins preserves identically; double-append is
    // prevented by the separate `ledgered` flag below, never by the timestamp.
    // Finding 18 (a re-read that lands after a recorded order violation must supersede the old
    // stamp) is the same rule with no special case: the later read wins.
    stamp.layers_read[layer] = mine ? (mine > ts ? mine : ts) : ts;
  }
  // Rung 2: union the observed checklist steps too (same last-writer-clobber rationale).
  stamp.actions_read = stamp.actions_read || {};
  for (const [step, ts] of Object.entries(onDisk.actions_read || {})) {
    if (!ts) continue;
    const mine = stamp.actions_read[step];
    stamp.actions_read[step] = mine ? (mine < ts ? mine : ts) : ts;
  }
  if (onDisk.ledgered) stamp.ledgered = true;
  return stamp;
}

// null = missing; "forged" = HMAC mismatch; otherwise the verified stamp object.
export function verifyStamp(sessionId, input = null) {
  const stamp = loadStamp(sessionId, input);
  if (!stamp) return null;
  // Verification is READ-ONLY: never mint/write a secret while checking one (a failed read must
  // not become a write — p1-guard-residual/#2752).
  //
  // Ask whether the anchor was ESTABLISHED and refuse on the answer. #3135 made the same call
  // explicit on its own shape (`if (secret === null) return "forged"`), and that is the half of
  // it worth keeping: the old line inferred the refusal from an ephemeral key not matching,
  // which is arithmetic that happens to be true rather than a stated rule.
  const { key, established } = secretStatus(input, { allowCreate: false });
  if (!established) return "forged";
  if (!stamp.hmac || stamp.hmac !== hmacOf(stamp, key)) return "forged";
  return stamp;
}

// How long a posture read stays good (#3431). The stamp always RECORDED when each layer was read
// and never COMPARED it: this function tested that the KEY EXISTED and never looked at the VALUE.
// Measured 2026-09-07: a session still running that day showed 7 of 7 layers complete on reads
// timestamped 2026-08-13. By then the files had long left its working context, and it proposed
// rebuilding a field the code already wrote, having measured a ledger twice without reading the
// write path. The guard reported a governed session; the posture was a summary of a summary.
//
// 24h is deliberate, not a placeholder: long enough that a normal working session is never
// interrupted, short enough that "stale by weeks" cannot recur. There is deliberately NO env
// override, because HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK is already the operator's escape and a second
// knob here would be one more protective flag that fails unsafe when unset.
export const LAYER_READ_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Classify each required layer as never-read or read-too-long-ago.
 *
 * An absent or unparseable timestamp is STALE, never fresh: absence is not a measurement and the
 * safe direction is to ask again. A timestamp slightly in the FUTURE counts as fresh, because
 * small clock skew must not brick a session that just read the file; a maliciously future-dated
 * stamp is out of scope here and in scope for the hmac seal, which a caller cannot forge without
 * the anchor.
 */
export function layerReadStatus(stamp, now = Date.now(), ttlMs = LAYER_READ_TTL_MS) {
  if (!stamp || stamp === "forged") return { never: [...ALL_LAYERS], stale: [] };
  const never = [], stale = [];
  for (const k of ALL_LAYERS) {
    const raw = stamp.layers_read?.[k];
    if (!raw) { never.push(k); continue; }
    const t = Date.parse(raw);
    if (!Number.isFinite(t)) { stale.push(k); continue; }
    if (now - t > ttlMs) stale.push(k);
  }
  return { never, stale };
}

// ONE definition of "missing", so the guard, the stamp hook and bootstrap-status cannot disagree.
// A status that reports complete while the guard denies is the false-CALM this household keeps
// paying for, so a stale layer is missing everywhere or nowhere.
export function missingLayers(stamp, now = Date.now(), ttlMs = LAYER_READ_TTL_MS) {
  const { never, stale } = layerReadStatus(stamp, now, ttlMs);
  return [...never, ...stale];
}

/** Canonicalize like admin/event-chain.mjs so sealed hashes match library.mjs. */
function canonicalEventBody(value) {
  if (Array.isArray(value)) return value.map(canonicalEventBody);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalEventBody(value[key])]),
    );
  }
  return value;
}

/**
 * When the household events ledger has started a hash chain, seal appends so
 * hook denials cannot brick library.mjs with `unchained_event_after_chain`.
 * Test ledgers (HOUSEHOLD_BOOTSTRAP_EVENTS) and pre-chain ledgers stay plain.
 */
function sealIfChainStarted(payload, file) {
  if (process.env.HOUSEHOLD_BOOTSTRAP_EVENTS) return payload;
  let prior = [];
  try {
    const text = fs.readFileSync(file, "utf8");
    prior = text.trim()
      ? text.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l))
      : [];
  } catch {
    return payload;
  }
  let parent = null;
  for (let i = prior.length - 1; i >= 0; i--) {
    if (typeof prior[i]?.event_hash === "string") {
      parent = prior[i].event_hash;
      break;
    }
  }
  if (!parent) return payload; // chain not started (or empty)
  const sealed = { ...payload, prev_hash: parent };
  const body = { ...sealed };
  delete body.event_hash;
  const digest = crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalEventBody(body)), "utf8")
    .digest("hex");
  return { ...sealed, event_hash: `sha256:${digest}` };
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

// Hook side-channels share the library CLI's .catalog.lock. The CLI may repair
// events.jsonl from a full snapshot before appending; an unlocked hook append in
// that interval would otherwise be erased by the atomic rename.
function withLibraryLock(file, fn) {
  const root = path.dirname(file);
  fs.mkdirSync(root, { recursive: true });
  const lockPath = path.join(root, ".catalog.lock");
  const deadline = Date.now() + 5000;
  let fd = null;
  for (;;) {
    try {
      fd = fs.openSync(lockPath, "wx");
      fs.writeSync(fd, String(process.pid));
      break;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      try {
        const pid = Number.parseInt(fs.readFileSync(lockPath, "utf8").trim(), 10);
        const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
        const reclaim = Number.isInteger(pid)
          ? (!pidAlive(pid) || ageMs > 300_000)
          : ageMs > 30_000;
        if (reclaim) fs.unlinkSync(lockPath);
      } catch {
        /* raced away or already gone */
      }
      if (Date.now() > deadline) throw new Error("catalog locked by another live writer");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
  try {
    return fn();
  } finally {
    try { fs.closeSync(fd); } catch { /* already closed */ }
    try {
      if (Number.parseInt(fs.readFileSync(lockPath, "utf8").trim(), 10) === process.pid) {
        fs.unlinkSync(lockPath);
      }
    } catch { /* gone */ }
  }
}

export function appendEvent(ev, input = null) {
  try {
    const file = eventsPath(input);
    // #3077: a repo with no library has no ledger to append to. Creating one on the first
    // denial would plant an orphan .household-library/ (plus its .catalog.lock) in a leaf
    // repo that no union-merge ever reaches. The denial itself stays loud on stderr; only
    // the ledger row is skipped, and the caller is told (returns false) so it can say so.
    // Env-overridden paths (tests, operator redirection) are always written.
    if (!process.env.HOUSEHOLD_BOOTSTRAP_EVENTS && !fs.existsSync(path.dirname(file))) return false;
    withLibraryLock(file, () => {
      const payload = sealIfChainStarted(
        {
          at: new Date().toISOString(),
          runtime: getRuntime(),
          repo: getRepoName(input),
          ...ev,
        },
        file,
      );
      fs.appendFileSync(file, JSON.stringify(payload) + "\n");
    });
    return true;
  } catch {
    /* ledger append is best-effort */
    return false;
  }
}

export function readStdinJson() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return null;
  }
}

/** Layer path hit from a file path string. */
export function layerFromFilePath(fp, repoRoot = null) {
  const s = String(fp || "");
  if (!pathWithinAllowed(s, repoRoot)) return null; // a decoy suffix elsewhere on disk is not the layer
  for (const [key, suffix] of Object.entries(LAYER_SUFFIXES)) {
    if (s.endsWith(suffix)) return key;
  }
  // The Hermes home install (~/.hermes/skills/<name>/SKILL.md) is a genuine read of the
  // layer's canonical content, and the four layer skills match the generic suffixes above.
  // Kept as an explicit branch so the accepted homes are named, not inferred.
  if (s.includes(`${path.sep}.hermes${path.sep}skills${path.sep}sophos${path.sep}SKILL.md`)) {
    return "sophos";
  }
  if (s.includes(`${path.sep}.hermes${path.sep}skills${path.sep}soli-deo-gloria${path.sep}`)) {
    return "soli-deo-gloria";
  }
  if (s.includes(`${path.sep}.hermes${path.sep}skills${path.sep}careful-not-clever${path.sep}`)) {
    return "careful-not-clever";
  }
  if (s.includes(`${path.sep}.hermes${path.sep}skills${path.sep}household-library${path.sep}`)) {
    return "household-library";
  }
  // Also accept Grok home install copies of the front door.
  if (s.includes(`${path.sep}.grok${path.sep}skills${path.sep}sophos${path.sep}SKILL.md`)) {
    return "sophos";
  }
  if (s.includes(`${path.sep}.grok${path.sep}skills${path.sep}soli-deo-gloria${path.sep}`)) {
    return "soli-deo-gloria";
  }
  if (s.includes(`${path.sep}.grok${path.sep}skills${path.sep}careful-not-clever${path.sep}`)) {
    return "careful-not-clever";
  }
  if (s.includes(`${path.sep}.grok${path.sep}skills${path.sep}household-library${path.sep}`)) {
    return "household-library";
  }
  return null;
}

/**
 * A SKILL INVOCATION is a read of that skill's content — the Hermes runtime loads
 * layers through `skill_view(name)` rather than by file path, so without this the
 * agent can read every layer and still be denied. Only the four LAYER skills count;
 * an unrelated skill load credits nothing.
 *
 * Honest limit, same as every other credit here: this records that the content was
 * served into the session, not that the agent absorbed it. The Read-tool credit is
 * no stronger.
 */
export function layerFromSkillName(name) {
  const n = String(name || "").trim().toLowerCase();
  // Accept both the bare name and the qualified plugin form ("plugin:skill").
  const bare = n.includes(":") ? n.slice(n.lastIndexOf(":") + 1) : n;
  return Object.prototype.hasOwnProperty.call(LAYER_SUFFIXES, bare) ? bare : null;
}
