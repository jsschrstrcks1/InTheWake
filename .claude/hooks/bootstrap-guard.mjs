// bootstrap-guard.mjs — PreToolUse: loud half of household bootstrap (R2).
// Denies repo mutations when the session lacks a complete, HMAC-valid stamp.
// Dual-runtime: Claude Code + Grok (via normalizeHookInput).
// Escape hatch: HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0 → warn-only.
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md
// HLS: loud-bootstrap-impl-claude-code · loud-bootstrap-impl-grok
import path from "node:path";
import {
  getRepoRoot,
  isHouseholdRepo,
  verifyStamp,
  loadStamp,
  newStamp,
  saveStamp,
  missingLayers,
  appendEvent,
  readStdinJson,
  normalizeHookInput,
  sessionIdValid,
  getRuntime,
} from "./bootstrap-lib.mjs";

const MUTATING_BASH_RE = new RegExp(
  [
    String.raw`\bgit\b[^|&;]*?\b(commit|push|merge|rebase|reset)\b`,
    String.raw`(^|[;&|]\s*)rm\s`,
    String.raw`(^|[;&|]\s*)mv\s`,
    String.raw`\bsed\s+-i\b`,
    String.raw`library\.mjs['"]?\s+(register|checkout|release|complete|verify|reassign)\b`,
  ].join("|"),
);

function isRepoMutation(input, repoRoot) {
  const tool = input.tool_name || "";
  if (tool === "Edit" || tool === "Write" || tool === "NotebookEdit") {
    const fp = String(input.tool_input?.file_path || input.tool_input?.notebook_path || "");
    if (!fp || !repoRoot) return false;
    const resolved = path.resolve(fp);
    return resolved.startsWith(repoRoot + path.sep);
  }
  if (tool === "Bash") {
    return MUTATING_BASH_RE.test(String(input.tool_input?.command || ""));
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

  const idValid = sessionIdValid(input.session_id);
  const sessionId = idValid ? input.session_id : "unknown";
  const stamp = verifyStamp(sessionId, input.raw || input);
  const missing = missingLayers(stamp);

  if (idValid && stamp && stamp !== "forged" && missing.length === 0) {
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

  let counter = loadStamp(sessionId, input.raw || input);
  if (!counter || typeof counter !== "object") {
    counter = newStamp(sessionId, input.raw || input);
  }
  if (forged) {
    counter = newStamp(sessionId, input.raw || input);
    counter.forge_detected = true;
  }
  counter.denials = (counter.denials || 0) + 1;
  if (counter.denials <= 3) {
    appendEvent(
      {
        type: "bootstrap_guard_denial",
        patron: counter.patron,
        session_id: sessionId,
        denied_tool: input.tool_name,
        missing_layers: missing,
        forged,
        blocked: blocking,
        sessionid_invalid: !idValid,
      },
      input.raw || input,
    );
  }
  saveStamp(counter, input.raw || input);

  const pointer = getRuntime() === "grok" ? "GROK.md" : "CLAUDE.md";
  const msg = [
    forged
      ? "BOOTSTRAP GUARD: stamp failed HMAC verification — a hand-written stamp is testimony, not evidence (spec R1/R5). Forgery is itself a governance finding."
      : !idValid
        ? "BOOTSTRAP GUARD: this session has no stable session_id, so its bootstrap cannot be attributed — a shared `unknown` stamp would let any un-read session inherit another's reads. Refusing (loud-bootstrap-sessionid-contract). The runtime must supply session_id, or use the escape hatch."
        : `BOOTSTRAP GUARD: this session has not completed the Layer 0/1 read order (missing: ${missing.join(", ")}).`,
    `Denied: ${toolDesc}`,
    `Read the layers in ${pointer} §Read order (front door skills/sophos first); the stamp hook records reads automatically.`,
    "Operator escape hatch: HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0 (warn-only). Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md",
  ].join("\n");

  deny(blocking, msg);
} catch (e) {
  console.error(
    `bootstrap-guard: internal error, failing OPEN (named limit — guard bugs must not brick sessions): ${e?.message || e}`,
  );
  process.exit(0);
}
