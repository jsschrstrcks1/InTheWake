#!/usr/bin/env node
// A.B.O.R.T. destructive-command guard — PreToolUse hook (Claude + Grok).
//
// Inspects live shell commands only (Bash / run_terminal_command). Blocks exit 2
// (+ Grok deny JSON) if the command matches a catastrophic, irreversible pattern.
// SSOT detector: cluster/lib/dangerous-command.mjs
//
// Referencing a dangerous string in a FILE (Write/Edit) is fine — this only
// inspects live shell tool calls. Subagents hit the same PreToolUse path.
//
// Sophos OS §5 destructive_execution — operational gate outside sophosGovern.
// HLS: destructive-command-hook-grok (dual-runtime extension of Claude belt).

import crypto from "node:crypto";
import {
  normalizeHookInput,
  appendEvent,
  getRuntime,
  getPatron,
} from "./bootstrap-lib.mjs";

// Read + parse the event FIRST, so a minimal inline check can still run even if
// the detector import fails.
let rawText = "";
try {
  for await (const chunk of process.stdin) rawText += chunk;
} catch {
  /* no stdin */
}

let command = "";
let normalized = null;
try {
  const evt = JSON.parse(rawText || "{}");
  normalized = normalizeHookInput(evt);
  // Only inspect shell tools. After normalize, Grok run_terminal_command → Bash.
  // Missing tool_name with a command still inspected (bias-to-block; Claude suite).
  if (normalized?.tool_name && normalized.tool_name !== "Bash") process.exit(0);
  command = String(normalized?.tool_input?.command || "");
} catch {
  process.exit(0); // unparseable → not our danger
}
if (!command.trim()) process.exit(0);

function deny(msg, meta = {}) {
  process.stderr.write(msg);
  // Best-effort ledger (never breaks the deny path).
  try {
    const sessionId = normalized?.session_id || "unknown";
    const cmdHash = crypto.createHash("sha256").update(command).digest("hex").slice(0, 16);
    appendEvent(
      {
        type: "destructive_command_denial",
        patron: getPatron(),
        session_id: sessionId,
        command_hash: cmdHash,
        rule_id: meta.rule_id || null,
        runtime: getRuntime(),
      },
      normalized?.raw || normalized,
    );
  } catch {
    /* ignore */
  }
  try {
    if (getRuntime() === "grok") {
      process.stdout.write(
        JSON.stringify({ decision: "deny", reason: msg.replace(/\n+$/, "") }) + "\n",
      );
    }
  } catch {
    /* ignore */
  }
  process.exit(2);
}

// Load the shared detector. On import failure DO NOT fail fully open — a
// guard-module bug must not become a universal false-pass.
let scanCommand, explain;
try {
  ({ scanCommand, explain } = await import(
    new URL("../../cluster/lib/dangerous-command.mjs", import.meta.url)
  ));
} catch (e) {
  const INLINE = [
    /\brm\s+(?:-\S+\s+)*-[A-Za-z]*[rR][A-Za-z]*\s+(?:-\S+\s+)*(?:['"]?)(?:\/|~|\$\{?HOME\}?|\*)(?:['"\s/]|$)/i,
    /--no-preserve-root/i,
    /\bdd\b[^\n]*\bof=\/dev\/\w/i,
    /\bmkfs(?:\.\w+)?\b/i,
    /\w*\(\)\s*\{[^}]*\|[^}]*&[^}]*\}\s*;/,
    /\b(?:curl|wget|fetch)\b[^\n|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh|dash|python3?|perl|ruby|node)\b/i,
  ];
  if (INLINE.some((re) => re.test(command))) {
    deny(
      `⛔ dangerous-command-guard: detector unavailable AND the command matches a catastrophic inline pattern — BLOCKED (fail-closed). ${e?.message || e}\n`,
    );
  }
  process.stderr.write(
    `⚠ dangerous-command-guard: detector unavailable, allowing (no inline catastrophic match) — ${e?.message || e}\n`,
  );
  process.exit(0);
}

const result = scanCommand(command);
if (result.blocked) {
  const body = "⛔ A.B.O.R.T. destructive-command guard\n" + explain(result) + "\n";
  deny(body, { rule_id: result.matched?.[0]?.id || null });
}
process.exit(0);
