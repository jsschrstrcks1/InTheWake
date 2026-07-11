#!/bin/bash
# ============================================================================
# check-required-hooks.sh — guard against silent removal of Claude Code hooks
# from .claude/settings.json.
#
# WHY THIS EXISTS
#   A household-library settings.json rewrite (merged via another thread's
#   branch) silently dropped InTheWake's repo-local guardrail hooks AND the
#   Slice 6 cognitive-memory observation hook. Merges don't go through the
#   Write/Edit tools, so a Claude-Code PreToolUse hook can't catch this — only
#   a git pre-commit check that runs *including during merges* can. This is
#   that check.
#
# WHAT IT DOES
#   Verifies that .claude/settings.json still references every command in the
#   PROTECTED list below (matched by substring, so it's robust to path form —
#   $CLAUDE_PROJECT_DIR vs absolute — and to JSON reformatting). If any is
#   missing, it blocks the commit and names what's gone.
#
# HOW TO REMOVE A HOOK ON PURPOSE (operator consent)
#   Deleting a hook is legitimate only when you also delete its line from the
#   PROTECTED list below, in the SAME commit. That edit is the explicit,
#   reviewable record of consent. Removing the hook without touching this list
#   is exactly the silent drop this guard is here to stop.
#
# Exit 0 = all present. Exit 1 = a protected hook is missing (block).
#
# Soli Deo Gloria
# ============================================================================
set -u

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
SETTINGS="$REPO_ROOT/.claude/settings.json"

# Protected hook commands (substring match). One per line. To retire a hook,
# delete its line here in the same commit that removes it from settings.json.
PROTECTED=(
  "observe-tool-use.sh"                 # Slice 6 cognitive-memory observation
  "MEMORY_AUTO_OBSERVE_ENABLED"         # memory capture env flag
  "session-start-guardrail.sh"
  "session-pulse-scan.sh"
  "voice-audit-hook.sh"
  "prompt-injection-guard.js"
  "no-getbets-guard.js"                 # hard-ban enforcement
  "post-tool-use-tracker.sh"
  "ship-page-validator.sh"              # ship-page validation
  "port-content-voice-hook.sh"
  "indexnow-submit.sh"
  "library-preflight-inject.sh"         # household-library preflight (sibling)
  "library-preflight-guard.js"          # household-library guard (sibling)
)

if [ ! -f "$SETTINGS" ]; then
  echo "ERROR [required-hooks]: .claude/settings.json is missing entirely." >&2
  echo "  All Claude Code hooks are gone. Restore settings.json before committing." >&2
  exit 1
fi

missing=()
for cmd in "${PROTECTED[@]}"; do
  grep -qF "$cmd" "$SETTINGS" || missing+=("$cmd")
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo "ERROR [required-hooks]: .claude/settings.json is missing protected hook(s):" >&2
  for m in "${missing[@]}"; do echo "    - $m" >&2; done
  echo "" >&2
  echo "  These hooks must not be dropped without operator consent." >&2
  echo "  If a removal is intentional, delete the matching line(s) from the" >&2
  echo "  PROTECTED list in admin/check-required-hooks.sh in this SAME commit." >&2
  echo "  Otherwise, restore the hook(s) in .claude/settings.json." >&2
  exit 1
fi

exit 0
