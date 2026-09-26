// bootstrap-guard.mjs — PreToolUse: loud half of household bootstrap (R2).
// Denies repo mutations when the session lacks a complete, HMAC-valid stamp.
// Dual-runtime: Claude Code + Grok (via normalizeHookInput).
// Escape hatch: HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0 → warn-only.
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md
// HLS: loud-bootstrap-impl-claude-code · loud-bootstrap-impl-grok
import fs from "node:fs";
import path from "node:path";
import {
  getRepoRoot,
  isHouseholdRepo,
  verifyStamp,
  loadStamp,
  newStamp,
  saveStamp,
  missingLayers,
  missingActions,
  readOrderViolation,
  layerReadStatus,
  LAYER_READ_TTL_MS,
  appendEvent,
  readStdinJson,
  normalizeHookInput,
  sessionIdValid,
  resolveSessionId,
  getRuntime,
} from "./bootstrap-lib.mjs";

const MUTATING_BASH_RE = new RegExp(
  [
    String.raw`\bgit\b[^|&;]*?\b(commit|push|merge|rebase|reset)\b`,
    // red-team finding 12: a path prefix, `command`, `sudo`, `env`, or `xargs` must not hide the verb.
    String.raw`(^|[;&|]\s*)(?:(?:command|sudo|nice|xargs)\s+|env\s+\S+\s+)*(?:\S*/)?(rm|mv|cp|tee|dd|truncate|install|chmod|chown)\s`,
    String.raw`\bsed\s+-i\b`,
    String.raw`library\.mjs['"]?\s+(register|checkout|release|complete|verify|reassign)\b`,
  ].join("|"),
);

/** A quote-stripped token that looks like a filesystem target rather than a flag. */
function unquote(t) {
  const s = String(t || "");
  const m = s.match(/^(['"])(.*)\1$/);
  return m ? m[2] : s;
}

/**
 * red-team finding 12 (closed 2026-09-12): a redirect or a copy target writes into the repo without
 * ever naming `rm`/`mv`. The checklist requirement must bind that writer too, so any `>`/`>>`,
 * `tee`, or `cp`/`install`/`dd of=` target that resolves inside the repo is a repository mutation.
 */
function writeTargetsInside(command, repoRoot) {
  if (!repoRoot) return false;
  const s = String(command || "");
  const targets = [];
  for (const m of s.matchAll(/>>?\s*("[^"]+"|'[^']+'|[^\s;&|]+)/g)) targets.push(m[1]);
  for (const m of s.matchAll(/\btee\s+(?:-\S+\s+)*("[^"]+"|'[^']+'|[^\s;&|]+)/g)) targets.push(m[1]);
  for (const m of s.matchAll(/\b(?:cp|install)\s+(?:-\S+\s+)*(?:\S+\s+)+("[^"]+"|'[^']+'|[^\s;&|]+)/g)) targets.push(m[1]);
  for (const m of s.matchAll(/\bdd\s+[^;&|]*\bof=("[^"]+"|'[^']+'|[^\s;&|]+)/g)) targets.push(m[1]);
  return targets
    .map((t) => unquote(t))
    .filter((t) => t && !/^[-&>]/.test(t) && !/^\/dev\//.test(t))
    .some((t) => insideRepo(path.isAbsolute(t) ? t : path.resolve(repoRoot, t), repoRoot));
}

function realOr(p) {
  const resolved = path.resolve(p);
  let ancestor = resolved;
  const suffix = [];
  for (;;) {
    try { return path.join(fs.realpathSync(ancestor), ...suffix); }
    catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") return resolved;
      const parent = path.dirname(ancestor);
      if (parent === ancestor) return resolved;
      suffix.unshift(path.basename(ancestor));
      ancestor = parent;
    }
  }
}

// Is `fp` inside `root`? Literal prefix first; then by REAL identity. #3077 landed this on
// its own probe: a repo reached through a symlinked prefix (macOS /var → /private/var,
// /tmp → /private/tmp) has its guard's module path resolved by Node to the REAL location,
// so the fallback repo root is the realpath while the tool input carries the alias — the
// literal comparison then reads an in-repo edit as out-of-repo and ALLOWS it. Same rule
// hls-claim-guard.mjs already applies (self-attack 2026-07-28). A not-yet-existing Write
// target resolves its nearest existing ancestor, preserving the missing suffix.
function insideRepo(fp, root) {
  const a = path.resolve(fp);
  const r = path.resolve(root);
  if (a.startsWith(r + path.sep)) return true;
  const ra = realOr(a);
  const rr = realOr(r);
  return ra === rr || ra.startsWith(rr + path.sep);
}

/** Every tool that can write into the tree, by every runtime's name for it. A8 (2026-09-12): the guard
 *  watched Bash and Claude's three file tools, and let every other writer walk. Measured live: while the
 *  guard denied `git commit`, `write_file` and `patch` wrote household files inside the repo in the same
 *  minutes. The rule was real for the shell and absent for the hand. A mutation is not a tool name; it is
 *  a write, and one boundary must judge them all. */
const FILE_MUTATION_TOOLS = new Set([
  "edit", "write", "notebookedit", "multiedit", "apply_patch", "applypatch",
  "write_file", "patch", "edit_file", "create_file", "delete_file", "move_file",
  "str_replace_editor", "str_replace", "insert_text", "append_file",
  "save_file", "rename_file", "remove_file", "copy_file", "upload_file",
]);

/** A name we have not met, judged by the verb it carries. The known set above is documentation; the
 *  mutation battery (2026-09-14) showed every name in it already matched the verb fallback, so the
 *  fallback is the teeth and the set is the census. `save`, `put`, `upload`, `store`, `rename`,
 *  `remove`, `copy`, `truncate`, `touch`, `mkdir`, `unlink`, `persist` were missing from the first cut:
 *  a `save_file` with a repo path walked past the guard. A name-based judgment can never be complete;
 *  the honest limit stays what it was, and the census grows every time a new runtime's writer is met. */
const MUTATION_VERB_RE = /(write|edit|create|delete|remove|move|rename|copy|patch|replace|append|insert|save|put|upload|store|truncate|touch|mkdir|unlink|persist)/i;

/** Reading is never a mutation, whatever the rest of the name says: `get_edit_history` with a repo path
 *  is a read, and this guard must never block a read (it would push the agent to the hatch). */
const READ_PREFIX_RE = /^(read|get|list|view|cat|show|search|find|grep|glob|open|stat|describe|inspect|preview|fetch|query|lookup)(_|$)/i;

function isFileMutationTool(tool) {
  const lower = String(tool || "").toLowerCase();
  if (!lower) return false;
  if (READ_PREFIX_RE.test(lower)) return false;
  return FILE_MUTATION_TOOLS.has(lower) || MUTATION_VERB_RE.test(lower);
}

/** The shell, by every runtime's name for it. `terminal` included: it is what Hermes calls its shell,
 *  and it was unguarded until now. */
const SHELL_TOOLS = new Set(["bash", "shell", "shell_command", "exec", "exec_command", "run_terminal_cmd", "terminal"]);

function fileTargetOf(input) {
  const t = input.tool_input || {};
  return String(
    t.file_path || t.filePath || t.path || t.notebook_path || t.notebookPath || t.target_file || t.filename || "",
  );
}

function isRepoMutation(input, repoRoot) {
  const tool = String(input.tool_name || "");
  const lower = tool.toLowerCase();

  if (SHELL_TOOLS.has(lower)) {
    const cmd = String(input.tool_input?.command || input.tool_input?.cmd || "");
    if (MUTATING_BASH_RE.test(cmd)) return true;
    return writeTargetsInside(cmd, repoRoot);
  }

  const fp = fileTargetOf(input);

  // Claude's original three, kept explicit so their behavior never depends on the census or the verbs.
  if (tool === "Edit" || tool === "Write" || tool === "NotebookEdit") {
    if (!fp || !repoRoot) return false;
    return insideRepo(fp, repoRoot);
  }

  // Every other writer, by census or by verb, judged by its payload: a runtime we have never seen
  // should not need us to have heard of it first.
  if (isFileMutationTool(tool)) {
    if (!fp || !repoRoot) return false;
    return insideRepo(fp, repoRoot);
  }
  return false;
}

function deny(blocking, msg) {
  console.error(msg);
  // Grok: JSON decision; Claude: exit 2. Both runtimes honor exit 2 on PreToolUse.
  if (blocking) {
    try {
      process.stdout.write(JSON.stringify({ decision: "deny", reason: msg }) + "\n");
    } catch {
      /* ignore */
    }
    process.exit(2);
  }
  process.exit(0);
}

try {
  const raw = readStdinJson();
  const input = normalizeHookInput(raw);
  if (!input) process.exit(0);

  const repoRoot = getRepoRoot(input.raw || input);
  // Outside household repos: no belt (Grok may be in ~/ unrelated work).
  if (!isHouseholdRepo(repoRoot)) process.exit(0);

  if (!isRepoMutation(input, repoRoot)) process.exit(0);

  // P1 gate liveness (Project-Sophos #114, ported 2026-09-15): configuration alone is not evidence
  // that Git dispatches the tracked hooks. A corrupt, foreign, absent, or stale RECEIPT denies just
  // like a missing bootstrap layer; the remedy (an inert probe through git's dispatcher) is never
  // blocked by this gate. The receipt is written by .githooks/pre-commit on Git dispatch, not by this
  // guard, so this gate does not certify its own plane. The recorder is loaded from the repo this
  // guard runs in. Two cases are NAMED on stderr and skipped rather than denied, because denying them
  // would block the only remedy (an edit) and make the gate unsatisfiable (UL-349): a leaf that
  // carries this guard but no admin/gate-liveness.mjs, and a recorder that does not load (measured
  // 2026-09-15: a half-edited recorder denied the edit that would have finished it).
  {
    const recorder = path.join(repoRoot, "admin", "gate-liveness.mjs");
    if (!fs.existsSync(recorder)) {
      console.error(`bootstrap-guard: no admin/gate-liveness.mjs under ${repoRoot}; git-plane liveness NOT assessed here (named limit, not a pass).`);
    } else {
      let liveness = null;
      try {
        const mod = await import(recorder);
        liveness = mod.assessGateLiveness(repoRoot);
      } catch (e) {
        console.error(`bootstrap-guard: admin/gate-liveness.mjs under ${repoRoot} does not load (${String(e?.message || e).slice(0, 100)}); git-plane liveness NOT assessed here (named limit, not a pass). Fix the recorder; that edit is not blocked.`);
      }
      if (liveness && !liveness.live) {
        deny(
          process.env.HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK !== "0",
          [
            `BOOTSTRAP GUARD: git-plane liveness is ${liveness.reason}; a configured hook is not proof it fired.`,
            `Denied: ${input.tool_name}: ${input.tool_input?.file_path || input.tool_input?.command || ""}`,
            `Run \`node admin/gate-liveness.mjs --probe\` from ${repoRoot}. It uses Git's hook dispatcher with an inert probe and requires core.hooksPath=.githooks. Reading is never blocked by this gate.`,
          ].join("\n"),
        );
      }
    }
  }

  const idValid = sessionIdValid(input.session_id);
  const sessionId = resolveSessionId(input);   // SSOT — must match the stamp writer exactly
  const stamp = verifyStamp(sessionId, input.raw || input);
  const missing = missingLayers(stamp);
  const missingSteps = missingActions(stamp, repoRoot);
  const orderProblem = readOrderViolation(stamp);
  const readStatus = layerReadStatus(stamp);

  if (idValid && stamp && stamp !== "forged" && missing.length === 0 && missingSteps.length === 0 && !orderProblem) {
    // Bootstrapped — allow (Grok optional explicit allow).
    if (getRuntime() === "grok") {
      try {
        process.stdout.write(JSON.stringify({ decision: "allow" }) + "\n");
      } catch {
        /* ignore */
      }
    }
    process.exit(0);
  }

  const blocking = process.env.HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK !== "0";
  const forged = stamp === "forged";
  const toolDesc =
    input.tool_name === "Bash"
      ? `Bash: ${String(input.tool_input?.command || "").slice(0, 120)}`
      : `${input.tool_name}: ${input.tool_input?.file_path || ""}`;

  // The verdict is already settled above: this is a guarded mutation whose stamp
  // was not affirmatively verified, so it WILL be denied. Everything from here to
  // saveStamp is BOOKKEEPING, and bookkeeping must never be able to turn that
  // denial into permission. Without this boundary an I/O failure here escapes to
  // the outer catch, which exits 0 (allow) — and because stampRoot() lives outside
  // repoRoot while isRepoMutation() only guards Write/Edit paths INSIDE repoRoot,
  // the guard's own state is unguarded, so a single `chmod` on the stamp dir
  // disarmed the guard for the rest of the session (measured DENIED -> ALLOWED,
  // persisting across further Writes and a `git commit`).
  // A failure to RECORD a denial is not consent to proceed.
  // HLS p1-guard-found-validating-p0-read-order-enforcement… / open-claw-stuff#2727;
  // same class as guard-hook-fail-open-on-error and hls-p0-the-c5-guard-fails-open.
  let ledgered = null; // null = not attempted (cap reached); false = skipped/failed; true = written
  try {
    let counter = loadStamp(sessionId, input.raw || input);
    if (!counter || typeof counter !== "object") {
      counter = newStamp(sessionId, input.raw || input);
    }
    if (forged) {
      counter = newStamp(sessionId, input.raw || input);
      counter.forge_detected = true;
    }
    counter.denials = (counter.denials || 0) + 1;
    // red-team finding 17 (closed 2026-09-12): the order violation lived only in the guard's message and
    // in the stamp, and the stamp is deletable. Record it on the append-only ledger and in the counter,
    // so erasing the stamp cannot erase the evidence.
    if (orderProblem) {
      counter.order_violation = orderProblem;
      counter.order_violation_at = new Date().toISOString();
    }
    if (counter.denials <= 3) {
      ledgered = appendEvent(
        {
          type: "bootstrap_guard_denial",
          patron: counter.patron,
          session_id: sessionId,
          denied_tool: input.tool_name,
          missing_layers: missing,
          forged,
          blocked: blocking,
          sessionid_invalid: !idValid,
          ...(orderProblem ? { order_violation: orderProblem } : {}),
        },
        input.raw || input,
      );
    }
    saveStamp(counter, input.raw || input);
  } catch (bookkeepingError) {
    // Loud, but never fatal to the verdict — fall through to deny().
    console.error(
      `bootstrap-guard: denial bookkeeping failed (${bookkeepingError?.message || bookkeepingError}) — denying anyway. A failure to record a denial must never become permission to proceed.`,
    );
  }

  const pointer = getRuntime() === "grok" ? "GROK.md" : "CLAUDE.md";
  const msg = [
    forged
      ? "BOOTSTRAP GUARD: stamp failed HMAC verification — a hand-written stamp is testimony, not evidence (spec R1/R5). Forgery is itself a governance finding."
      : !idValid
        ? "BOOTSTRAP GUARD: this session has no stable session_id, so its bootstrap cannot be attributed — a shared `unknown` stamp would let any un-read session inherit another's reads. Refusing (loud-bootstrap-sessionid-contract). The runtime must supply session_id, or use the escape hatch."
        : readStatus.stale.length && !readStatus.never.length && missingSteps.length === 0 && !orderProblem
          // #3431: telling an agent to read what it demonstrably DID read sends it hunting for a
          // file it already has. Name the decay instead: these were read, and then aged out.
          ? `BOOTSTRAP GUARD: this session's posture reads have EXPIRED (stale: ${readStatus.stale.join(", ")}). They were read, but more than ${Math.round(LAYER_READ_TTL_MS / 3600000)}h ago, so they no longer govern this session. Re-read them; reading is never blocked by this guard.`
          : `BOOTSTRAP GUARD: this session has not completed the Layer 0/1 read order (missing: ${missing.join(", ") || "none"}${readStatus.stale.length ? `; of those, EXPIRED rather than unread: ${readStatus.stale.join(", ")}` : ""}; missing steps: ${missingSteps.join(", ") || "none"}${orderProblem ? `; ${orderProblem}` : ""}).`,
    `Denied: ${toolDesc}`,
    // #3077: a leaf repo (Project-Sophos, the recipe repos) carries the guard but no library, so
    // there is no ledger to append to — say so rather than let a missing row read as "no denial".
    ...(ledgered === false
      ? [`Denial NOT ledgered: the ledger for ${repoRoot} is absent or could not be written — this message is the record.`]
      : []),
    `Read the layers in ${pointer} §Read order (front door skills/sophos first); the stamp hook records reads automatically.`,
    "Operator consent, read by EVERY runtime (no per-runtime hatch):",
    '  node admin/operator-allowance.mjs grant --scope bootstrap-guard --by <you> --reason "<20+ chars>" --expires-in 60',
    "  Signed, scope-narrow, single-use by default; every use is recorded beside the grant and, where a ledger exists, on it. A chat allowance is not one: this guard reads a record, not a conversation.",
    "Operator warn-only switch, where the harness passes env: HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0. Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md",
  ].join("\n");

  // A7 (2026-09-12): the ONE release valve, read by EVERY runtime's guard adapter, instead of a
  // Hermes-only environment variable that three of the four lanes could not reach. Checked here, after
  // the verdict is settled and before deny(), so it can only ever be a named, signed, expiring,
  // scope-narrow operator record. A forged or expired record is refused by validate().
  //
  // THE USE IS RECORDED BEFORE IT IS HONORED (2026-09-14). The first cut wrote a ledger row after the
  // fact and never read it back, so a one-use allowance stayed open for its whole window; and it said a
  // failed record was "not a failure to allow", which turns a key into a door the moment the record
  // cannot be written. Now: recordUse() beside the grant first; if THAT fails, the denial stands and
  // says why. The HLS ledger row is the second tie, best-effort and reported, never the permission.
  let allowance = { allowed: false, why: "not consulted" };
  let mod = null;
  try {
    mod = await import("../../admin/operator-allowance.mjs");
    allowance = mod.allowanceFor({ scope: "bootstrap-guard", root: repoRoot });
  } catch (e) {
    allowance = { allowed: false, why: `allowance check unavailable: ${e?.message || e}` };
  }
  if (allowance.allowed && allowance.record && mod) {
    const use = mod.recordUse(repoRoot, allowance.record, {
      session_id: sessionId,
      denied_tool: input.tool_name,
      missing_layers: missing,
    });
    if (!use.ok) {
      deny(
        blocking,
        `${msg}\nAn operator allowance (${allowance.record.id}, by ${allowance.record.by}) is in force but its use could not be recorded (${use.why}). An allowance that cannot be marked spent is a door left open, so it is not honored.`,
      );
    }
    const ledgered = appendEvent(
      {
        type: "bootstrap_guard_allowance_used",
        session_id: sessionId,
        denied_tool: input.tool_name,
        allowance_id: allowance.record.id,
        allowed_by: allowance.record.by,
        allowed_reason: allowance.record.reason,
        use_number: (allowance.spent || 0) + 1,
        uses: allowance.uses,
        missing_layers: missing,
      },
      input.raw || input,
    );
    deny(
      false,
      `BOOTSTRAP GUARD: allowed by operator allowance ${allowance.record.id}, by ${allowance.record.by}: ${allowance.record.reason} (use ${(allowance.spent || 0) + 1} of ${allowance.uses}, recorded in ${use.file}${ledgered ? "" : "; no HLS ledger here, so no ledger row"}).`,
    );
  } else {
    deny(blocking, `${msg}\nNo operator allowance is in force for this scope (${allowance.why}).`);
  }
} catch (e) {
  console.error(
    `bootstrap-guard: internal error, failing OPEN (named limit — guard bugs must not brick sessions): ${e?.message || e}`,
  );
  process.exit(0);
}
