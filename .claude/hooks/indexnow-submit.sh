#!/bin/bash
# indexnow-submit.sh — Auto-submit edited/created pages to IndexNow
#
# Fires: PostToolUse on Edit|Write for *.html files
# Purpose: Instantly notify Bing, Yandex, Naver, Seznam, and Yep
#          when a page is created or modified.
#
# This hook runs in the background (&) so it never blocks Claude Code.
# Failures are silent — IndexNow is best-effort, not blocking.

# The file that was just edited/written
FILE_PATH="${CLAUDE_FILE_PATH:-}"

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

# Submit to IndexNow (background, silent)
python3 /home/user/ken/orchestrator/indexnow.py auto "$FILE_PATH" >/dev/null 2>&1 &

exit 0
