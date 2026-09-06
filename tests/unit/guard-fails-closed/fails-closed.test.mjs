// tests/unit/guard-fails-closed/fails-closed.test.mjs
//
// P0 #2592 — a guard that cannot run must BLOCK, never wave a commit through.
//
// Measured 2026-09-05 on a clean macOS checkout: `.githooks/pre-commit` printed six
// errors and exited **0**. `mapfile` is a bash 4+ builtin and macOS ships bash 3.2, so
// every array came back unset, `set -u` complained, execution carried on, and the
// unconditional `exit 0` at the end of the script passed the commit.
//
// `admin/scripts/factcheck-gate.sh` had the identical defect, and the hook INVOKES it,
// so the hook read that 0 as a pass. Its stated job is to block any voyage-pack commit
// lacking a fresh factcheck sidecar; it had been enforcing nothing.
//
// Two halves, and the tests below pin both, because fixing only the first leaves a
// repaired guard confidently calling a broken one:
//   1. CAPABILITY  — no bash-4-only builtins
//   2. FAIL CLOSED — an internal failure exits non-zero
//
// Per careful-not-clever's claim-evidence discipline, each rule gets a positive case
// (the guard still passes work it should pass) and a negative case (it refuses).

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const GUARDS = [".githooks/pre-commit", "admin/scripts/factcheck-gate.sh"];

// ── 1. CAPABILITY ────────────────────────────────────────────────────────────
// bash 3.2 is what macOS actually ships. A bash-4-only builtin is not a style
// preference here; it is the difference between a guard and a decoration.

for (const g of GUARDS) {
  test(`${g}: uses no bash-4-only builtins (macOS ships bash 3.2)`, () => {
    const src = fs.readFileSync(path.join(ROOT, g), "utf8");
    const offenders = ["mapfile", "readarray"].filter((b) =>
      new RegExp(`(^|[^#\\w])${b}\\s`, "m").test(src.replace(/^\s*#.*$/gm, "")),
    );
    assert.deepEqual(offenders, [],
      `${g} uses ${offenders.join(", ")}, absent in bash 3.2, so the guard silently does nothing on macOS`);
  });

  test(`${g}: is syntactically valid under bash`, () => {
    const r = spawnSync("bash", ["-n", path.join(ROOT, g)], { encoding: "utf8" });
    assert.equal(r.status, 0, `bash -n failed: ${r.stderr}`);
  });

  test(`${g}: installs an ERR trap so a broken guard cannot fall through to exit 0`, () => {
    const src = fs.readFileSync(path.join(ROOT, g), "utf8");
    assert.match(src, /trap .*ERR/,
      "without an ERR trap, any unhandled failure continues to the script's final exit 0");
    assert.match(src, /exit 2/, "the trap must exit non-zero");
  });
}

// ── 2. FAIL CLOSED, behaviourally ────────────────────────────────────────────
// Asserting the trap EXISTS is not the same as asserting it FIRES. These run the
// real guard text in a throwaway git repo, never against this checkout, because
// driving the real hook here writes real ledger rows.

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "guard-fc-"));
  execFileSync("git", ["init", "-q", "."], { cwd: dir });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "t"], { cwd: dir });
  return dir;
}

test("NEGATIVE: a guard whose internal command fails exits non-zero, not 0", () => {
  const dir = sandbox();
  const src = fs.readFileSync(path.join(ROOT, ".githooks/pre-commit"), "utf8");
  // Inject a failure after the trap is installed. This is the shape the real defect
  // took: something breaks mid-script and execution continues to the final `exit 0`.
  const injected = src.replace(
    /^(trap .*ERR)$/m,
    "$1\n__guard_selftest_failure__   # injected: a command that does not exist",
  );
  assert.notEqual(injected, src, "failed to inject after the ERR trap");
  fs.writeFileSync(path.join(dir, "hook"), injected, { mode: 0o755 });

  const r = spawnSync("bash", [path.join(dir, "hook")], { cwd: dir, encoding: "utf8" });
  assert.notEqual(r.status, 0,
    "a guard that hit an unrunnable command still exited 0 — this is the exact P0 fail-open");
  assert.match(`${r.stdout}${r.stderr}`, /GUARD ABORTED|GATE ABORTED/,
    "the refusal must say why, or the next reader assumes the guard passed");
});

test("POSITIVE: the healthy guard still exits 0 on a commit it has no reason to block", () => {
  const dir = sandbox();
  fs.writeFileSync(path.join(dir, "README.md"), "nothing a guard cares about\n");
  execFileSync("git", ["add", "README.md"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".githooks"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, ".githooks/pre-commit"), path.join(dir, ".githooks/pre-commit"));

  const r = spawnSync("bash", [path.join(dir, ".githooks/pre-commit")], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 0,
    `a guard that blocks everything is as useless as one that blocks nothing: ${r.stdout}${r.stderr}`);
});

test("TEETH: the fixed guard actually reads files, rather than passing vacuously", () => {
  // The pre-fix gate exited 0 having examined zero packs. A fix that merely stops
  // crashing, while still checking nothing, would pass every test above.
  const r = spawnSync("bash", [path.join(ROOT, "admin/scripts/factcheck-gate.sh"), "--all"],
    { cwd: ROOT, encoding: "utf8", timeout: 120000 });
  const out = `${r.stdout}${r.stderr}`;
  assert.match(out, /v0\.1[^\s]*\.md/,
    "the gate produced no per-pack verdict, so it is still checking nothing");
  assert.doesNotMatch(out, /command not found|unbound variable/,
    "the gate is still emitting shell errors");
});
