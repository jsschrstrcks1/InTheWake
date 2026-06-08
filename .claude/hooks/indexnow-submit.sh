#!/bin/bash
# indexnow-submit.sh — Auto-submit edited/created pages to IndexNow
#
# Fires: PostToolUse on Edit|Write for *.html files
# Purpose: Instantly notify Bing, Yandex, Naver, Seznam, and Yep
#          when a page is created or modified.
#
# This hook runs in the background (&) so it never blocks Claude Code.
# Failures are silent — IndexNow is best-effort, not blocking.
#
# Hook input arrives as JSON on stdin (PostToolUse protocol). The file
# path is .tool_input.file_path — NOT the $CLAUDE_FILE_PATH env var, which
# the harness does not set. (This was the bug fixed in #1837: the hook read
# the unset env var and exited early every time, so nothing was ever
# submitted. Sibling PostToolUse hooks in this repo already read stdin.)

# Read the tool event JSON from stdin and extract the changed file path.
tool_info=$(cat)
FILE_PATH=$(echo "$tool_info" | jq -r '.tool_input.file_path // empty')

# Fallback to stdin JSON if env not set (standard for Claude Code hooks)
if [ -z "$FILE_PATH" ] && [ ! -t 0 ]; then
  FILE_PATH=$(python3 -c '
import sys, json
try:
  data = json.load(sys.stdin)
  # Common keys in PostToolUse payload
  path = data.get("file_path") or data.get("path") or ""
  if not path:
    tool_input = data.get("tool_input", {})
    path = tool_input.get("file_path") or tool_input.get("path") or ""
  print(path)
except Exception as e:
  print("")
' 2>/dev/null || echo "")
fi

# Exit silently if no file path
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only fire for HTML files
case "$FILE_PATH" in
    *.html) ;;
    *) exit 0 ;;
esac

# Skip non-content files
BASENAME=$(basename "$FILE_PATH")
case "$BASENAME" in
    offline.html|search.html)
        exit 0
        ;;
esac

# Submit to IndexNow (background, silent for Claude Code, but logged so a
# future silent breakage is observable — the lesson of #1837).
LOG=/tmp/indexnow-submit.log
{
    echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) submit $FILE_PATH ==="
    python3 /home/user/ken/orchestrator/indexnow.py auto "$FILE_PATH" 2>&1
} >>"$LOG" 2>&1 &

exit 0
