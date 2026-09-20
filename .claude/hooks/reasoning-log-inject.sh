#!/bin/bash
# Soli Deo Gloria.
# reasoning-log-inject — surfaces the project decision record when it is asked for.
#
# Operator directive (Ken, 2026-07-30; REVISED 2026-09-20): REASONING-LOG.md is
# a project decision record kept for the operator's own later reading. It is the
# same genre as an architecture decision record or an engineering changelog: a
# short written summary of what a piece of work decided and what those decisions
# rest on, composed after the work as part of the deliverable.
#
# WHAT CHANGED 2026-09-20 (operator ruling):
#   1. OPT-IN. The record is no longer requested on every turn. It is requested
#      when the operator puts `--reasoning` in a request. Rationale: an ask that
#      fires unconditionally on every prompt is noise in a long session, and a
#      record written reflexively is worth less than one written on purpose.
#   2. REWORDED. Earlier revisions framed the entry as explaining how a
#      conclusion was reached. That framing described the wrong artifact. The
#      entry documents THE WORK: what was requested, what options were on the
#      table, what was chosen, what is still open. Ordinary engineering
#      documentation, written about the project, not about the writer.
#
# TWO MODES (argv[1], default "session"):
#   session — SessionStart: one line naming the file and how to ask for it.
#   prompt  — UserPromptSubmit: reads the request; emits the ask ONLY when the
#             operator included `--reasoning`. Silent otherwise.
#
# OPT-IN MARKER: <git-dir>/reasoning-log-optin, holding a date. Written when
# `--reasoning` is seen, removed by `--no-reasoning`. The commit guard
# (.githooks/reasoning-log-guard.sh) reads the same marker, so the ask and the
# enforcement cannot drift apart: a repo nobody opted into never blocks.
#
# HONEST LIMIT: this hook makes the request visible when it is made. It cannot
# make an entry get written, and it is not evidence one exists. Read the file.
#
# Fail-open: always exits 0. Kill-switch: REASONING_LOG_INJECT=0
set +e

[ "${REASONING_LOG_INJECT:-1}" = "0" ] && exit 0

MODE="${1:-session}"
PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG="$PROJ/REASONING-LOG.md"
TODAY="$(date -u +%Y-%m-%d)"

GITDIR="$(git -C "$PROJ" rev-parse --absolute-git-dir 2>/dev/null)"
MARKER="${GITDIR:-$PROJ/.git}/reasoning-log-optin"

entry_count() { grep -cE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' "$LOG" 2>/dev/null || echo 0; }
has_today()   { grep -qE "^## ${TODAY}" "$LOG" 2>/dev/null; }
opted_in()    { [ -f "$MARKER" ] && [ "$(cat "$MARKER" 2>/dev/null)" = "$TODAY" ]; }

if [ "$MODE" = "prompt" ]; then
    REQUEST="$(cat 2>/dev/null)"

    # Turn it off explicitly. Checked first so --no-reasoning always wins.
    if printf '%s' "$REQUEST" | grep -qiE '(^|[^a-z-])--no-reasoning([^a-z-]|$)'; then
        rm -f "$MARKER" 2>/dev/null
        echo "[decision record] off for today. Add --reasoning to a request to turn it back on."
        exit 0
    fi

    if printf '%s' "$REQUEST" | grep -qiE '(^|[^a-z-])--reasoning([^a-z-]|$)'; then
        [ -n "${GITDIR:-}" ] && printf '%s' "$TODAY" > "$MARKER" 2>/dev/null
        if has_today; then
            echo "[decision record] REQUESTED. REASONING-LOG.md already has a ${TODAY} section; add another for this work. Four parts: Asked / Weighed / Decided / Unsure. It is documentation of the work, written for Ken to read later."
        else
            echo "[decision record] REQUESTED. Write a ${TODAY} entry in REASONING-LOG.md covering this work, newest at the top. Four parts: Asked / Weighed / Decided / Unsure. It is documentation of the work, written for Ken to read later."
        fi
        exit 0
    fi

    # Not asked for. Stay quiet, but do not let an opted-in day go unfinished.
    if opted_in && ! has_today; then
        echo "[decision record] on for ${TODAY} and REASONING-LOG.md has no entry yet. The commit guard will ask for one."
    fi
    exit 0
fi

# ── session mode ──────────────────────────────────────────────────────────
if opted_in; then
    echo "[decision record] REASONING-LOG.md is ON for ${TODAY} ($(entry_count) entries). Write up this session's work before you finish. Turn off with --no-reasoning."
elif [ -f "$LOG" ]; then
    echo "[decision record] REASONING-LOG.md exists ($(entry_count) entries) and is OPT-IN. Add --reasoning to a request when you want this session's work written up for Ken."
else
    echo "[decision record] REASONING-LOG.md does not exist here yet. Opt in with --reasoning on a request to start one."
fi
exit 0
