#!/bin/bash
# ============================================================================
# reasoning-log-guard.sh — the RUNTIME-INDEPENDENT half of the reasoning log.
#
# Injection hooks (.claude/hooks/reasoning-log-inject.sh) only reach agents
# whose harness runs Claude Code hooks. Grok, Codex, Hermes, a shell script, a
# human — none of them see that text. But every one of them lands work the same
# way: `git commit`. So the obligation is enforced HERE, where all runtimes
# converge.
#
# RULE: when --reasoning has been requested for today, a substantive commit
#       requires a REASONING-LOG.md entry dated today. Otherwise: no requirement.
#
# Substantive = the commit stages something that is not itself bookkeeping.
# Exempt (never require an entry):
#   • commits that touch ONLY REASONING-LOG.md      (the log's own persistence)
#   • commits that touch ONLY .memory/ or .household-library/  (machine state)
#   • merge commits                                  (no new reasoning authored)
#   • commit message contains [no-reasoning]         (explicit, reviewable opt-out)
#   • REASONING_LOG_GUARD=0                          (operator debugging)
#
# Satisfied by EITHER: REASONING-LOG.md staged in this commit, OR an entry
# already dated today (one session's entry covers its several commits).
#
# Exit 0 = allowed. Exit 1 = blocked with instructions.
# Soli Deo Gloria
# ============================================================================
set -u

[ "${REASONING_LOG_GUARD:-1}" = "0" ] && exit 0

# ── OPT-IN GATE (operator ruling 2026-09-20) ────────────────────────────────
# The decision record is requested per-day with `--reasoning`, not on every
# commit. .claude/hooks/reasoning-log-inject.sh writes the marker when the
# operator asks; this guard reads the SAME marker, so the ask and the
# enforcement cannot drift apart. No marker for today means nobody asked for a
# write-up, and this guard requires nothing.
#
# Deliberately NOT fail-toward-enforcement here, and that is a real change: the
# old guard blocked by default. It now permits by default, because the operator
# made the record opt-in. What is enforced is the PROMISE: if you asked for the
# write-up today, a substantive commit has to carry it.
GUARD_GITDIR="$(git rev-parse --absolute-git-dir 2>/dev/null || echo .git)"
GUARD_MARKER="$GUARD_GITDIR/reasoning-log-optin"
GUARD_TODAY="$(date -u +%Y-%m-%d)"
[ -f "$GUARD_MARKER" ] || exit 0
[ "$(cat "$GUARD_MARKER" 2>/dev/null)" = "$GUARD_TODAY" ] || exit 0

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
LOG="$REPO_ROOT/REASONING-LOG.md"
TODAY="$(date -u +%Y-%m-%d)"

# A merge in progress authors no new reasoning of its own.
[ -f "$REPO_ROOT/.git/MERGE_HEAD" ] && exit 0

# UL-210 — the opt-out MUST come from the message git hands us, never from
# .git/COMMIT_EDITMSG. Read as a pre-commit hook, that file is STALE: for
# `git commit -m` git writes it only AFTER pre-commit succeeds, so it still
# holds the PREVIOUS commit's message. Measured live 2026-08-10, both directions:
#   · a commit carrying [no-reasoning] was BLOCKED (exit 1) — the documented
#     escape hatch did not work at all for the commonest commit form;
#   · and worse, once a commit whose message contained the marker had landed,
#     the NEXT substantive commit — carrying no marker and asking for nothing —
#     was silently ALLOWED (exit 0). A false PASS on the enforcement layer that
#     is supposed to be the runtime-independent one.
# So this guard now runs from `commit-msg`, the only hook git gives the real
# message, passed as $1. Invoked without $1 the opt-out is simply unavailable
# and the guard blocks — failing toward enforcement, never past it.
MSG_FILE="${1:-}"
if [ -n "$MSG_FILE" ] && [ -f "$MSG_FILE" ]; then
  grep -qiF '[no-reasoning]' "$MSG_FILE" && exit 0
fi

STAGED="$(git diff --cached --name-only 2>/dev/null)"
[ -z "$STAGED" ] && exit 0

# Is anything staged that is NOT pure bookkeeping?
SUBSTANTIVE=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    REASONING-LOG.md|.memory/*|.household-library/*) continue ;;
    *) SUBSTANTIVE=1; break ;;
  esac
done <<< "$STAGED"

[ "$SUBSTANTIVE" -eq 0 ] && exit 0

# Satisfied if the log is part of this commit.
echo "$STAGED" | grep -qxF 'REASONING-LOG.md' && exit 0

# Or if today's entry already exists (one entry covers a session's commits).
if [ -f "$LOG" ] && grep -qE "^## ${TODAY}" "$LOG" 2>/dev/null; then
  exit 0
fi

cat >&2 <<EOF
ERROR [decision record]: --reasoning was requested for ${TODAY}, but this
commit changes work and REASONING-LOG.md has no entry for that date.

  REASONING-LOG.md is a project decision record kept for the operator's own
  later reading, in the same genre as an architecture decision record. It
  documents the work: what was asked for, what the options were, what was
  chosen, and what is still open.

  Append to ${LOG#$REPO_ROOT/}, newest at the top:

    ## ${TODAY} - <short title>
    **Asked.**    What was requested, and how it was read.
    **Weighed.**  The options on the table, and what ruled each in or out.
    **Decided.**  The call, and what it rests on.
    **Unsure.**   What is still uncertain or worth revisiting.

  Write it plainly. If something was a guess, say so; leaving the uncertainty
  on the page is the point of keeping the file.

  Not needed for this commit? Add [no-reasoning] to the message, an explicit
  and reviewable record of that judgment. Done writing up for today?
  --no-reasoning in a request clears the opt-in. Operator debugging override:
  REASONING_LOG_GUARD=0.
EOF
exit 1
