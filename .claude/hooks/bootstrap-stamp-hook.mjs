// bootstrap-stamp-hook.mjs — PostToolUse (Read|Bash): machine evidence of bootstrap (R1).
// Dual-runtime: Claude Code + Grok. Model never writes stamps.
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md
// HLS: loud-bootstrap-impl-claude-code · loud-bootstrap-impl-grok
import {
  isGenuineRecall,
  layersFromBashRead,
  readReturnedContent,
  actionFromBashCommand,
  pointerFromFilePath,
  readOrderViolation,
  newStamp,
  saveStamp,
  verifyStamp,
  missingLayers,
  mergeLayersFromDisk,
  appendEvent,
  readStdinJson,
  normalizeHookInput,
  resolveSessionId,
  ALL_LAYERS,
  layerFromFilePath,
  layerFromSkillName,
  isHouseholdRepo,
  getRepoRoot,
  getRuntime,
  runtimeSendsResult,
} from "./bootstrap-lib.mjs";

try {
  const raw = readStdinJson();
  const input = normalizeHookInput(raw);
  if (!input) process.exit(0);

  const repoRoot = getRepoRoot(input.raw || input);
  if (!isHouseholdRepo(repoRoot)) process.exit(0);

  const sessionId = resolveSessionId(input);   // SSOT — must match the guard exactly
  const tool = input.tool_name || "";
  const now = new Date().toISOString();

  // Red-team P2 closure (2026-09-12): a read must return SOMETHING to be a read. The first cut credited
  // on a plain absent result channel "for compatibility", which made the rung inert on any runtime that
  // omits it. A runtime that demonstrably SENDS a result channel gets no credit when the channel is
  // absent; an unknown runtime keeps the old behaviour, and that residue is a named limit.
  const rawIn = input.raw || input;
  const hasResultChannel =
    Boolean(rawIn) &&
    ["tool_response", "tool_result", "toolResponse", "toolResult", "result", "output"].some((k) => k in rawIn);
  // Only the lane whose result channel was MEASURED (hermes) is held to it. Other runtimes keep the
  // old behaviour; that residue is a named limit rather than a guess dressed as a rule.
  const knownResultRuntime = runtimeSendsResult(getRuntime());
  const noReadEvidence = readReturnedContent(rawIn) === false || (tool === "Read" && knownResultRuntime && !hasResultChannel);

  let layerHits = [];
  if (tool === "Read") {
    const hit = layerFromFilePath(input.tool_input?.file_path || "", repoRoot);
    if (hit) layerHits = [hit];
  } else if (tool === "Bash") {
    const command = String(input.tool_input?.command || "");
    if (isGenuineRecall(command)) {
      layerHits = ["memory-recall"];
    } else {
      // #3317: a shell read of one or more Layer 0/1 files credits each. The Read tool is not the
      // only way an agent legitimately loads the layers — "auto mode" reads them via cat/sed, and
      // an uncredited read falsely denied every mutation for a whole session (measured ~15 turns).
      // repoRoot is REQUIRED here: without it pathWithinAllowed cannot contain the path, and a
      // decoy outside every repo credits the layer (red-team finding 7, reopened 2026-09-18).
      layerHits = layersFromBashRead(command, repoRoot);
    }
  } else if (tool === "SkillView") {
    // Hermes loads the layers through `skill_view(name)`, not by file path. The tool
    // argument is a skill NAME, so a path-based credit can never fire here; accept a
    // path too, so either calling form lands the same credit. Only the four LAYER
    // skills count — loading an unrelated skill credits nothing.
    const arg = input.tool_input?.name ?? input.tool_input?.file_path ?? "";
    const hit = layerFromSkillName(arg) || layerFromFilePath(arg, repoRoot);
    if (hit) layerHits = [hit];
  }
  // Rung 1 (HLS p0-bootstrap-completeness, 2026-09-12). A read that returned no content is not a
  // read: if the runtime TOLD us the observation carried no content (a dedup/no-op re-read), the
  // meter must not move. Without this, the read order could be walked by re-reading each layer once
  // with no content returned — measured live this session, and the exact gaming move it closed.
  if (layerHits.length > 0 && noReadEvidence) {
    layerHits = [];
  }

  // Rung 2: the pointer checklist, observed as ACTIONS (credited on EXECUTION, not success).
  let actionHits = [];
  if (tool === "Read") {
    const a = pointerFromFilePath(input.tool_input?.file_path || "", repoRoot);
    if (a && !noReadEvidence) actionHits = [a];
  } else if (tool === "Bash") {
    const a = actionFromBashCommand(input.tool_input?.command || "");
    if (a) actionHits = [a];
  }

  if (layerHits.length === 0 && actionHits.length === 0) process.exit(0);

  let stamp = verifyStamp(sessionId, input.raw || input);
  if (stamp === null || stamp === "forged") {
    stamp = newStamp(sessionId, input.raw || input);
  }
  stamp.actions_read = stamp.actions_read || {};
  for (const hit of layerHits) {
    // #3431: REFRESH on every observed read; do not record only the first. Finding 18 (a read that
    // lands after a recorded order violation must supersede the old timestamp) is covered by this
    // without a special case.
    //
    // This was write-once (`if (!stamp.layers_read[hit])`), which made a posture read
    // UNREPEATABLE: once a layer carried a timestamp, reading it again changed nothing. Paired
    // with a reader that only tested whether the KEY EXISTED, the stored time was written once
    // and never consulted, so a session held its posture on paper for as long as it ran.
    //
    // The two halves are exact complements and NEITHER IS SAFE ALONE. Expiring reads while the
    // writer cannot refresh them is a permanent lockout: measured 2026-09-07 on the session that
    // built this, whose guard denied its own writes while the re-read it demanded was
    // unrecordable. Refreshing is not a weakening; the layer still had to be READ to be stamped
    // at all, and this only lets a re-read say so.
    stamp.layers_read[hit] = now;
  }
  for (const hit of actionHits) {
    if (!stamp.actions_read[hit]) stamp.actions_read[hit] = now;
  }

  // Rung 3 suspender: the WRITER also cries out when the order boundary is crossed, so the finding is
  // visible in the write path, not only when the guard later refuses. Loud, fail-open (never blocks).
  const orderProblem = readOrderViolation(stamp);
  if (orderProblem) console.error(`bootstrap-stamp-hook: ${orderProblem}`);

  // UL-078: union with whatever a concurrent Read wrote since we loaded, so a parallel Read is not
  // clobbered and the bootstrap event is not double-appended.
  stamp = mergeLayersFromDisk(stamp, input.raw || input);

  const missing = missingLayers(stamp);
  if (missing.length === 0 && !stamp.ledgered) {
    stamp.ledgered = appendEvent(
      {
        type: "bootstrap",
        patron: stamp.patron,
        session_id: sessionId,
        layers_read: ALL_LAYERS.length,
        layers_total: ALL_LAYERS.length,
        enforcement: "guard",
      },
      input.raw || input,
    );
  }
  saveStamp(stamp, input.raw || input);
} catch (e) {
  console.error(
    `bootstrap-stamp-hook: internal error (observation lost this call): ${e?.message || e}`,
  );
}
process.exit(0);
