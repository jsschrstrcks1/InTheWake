#!/bin/bash
# ============================================================================
# Port Content Voice Hook — v1.0.0
#
# PostToolUse hook that fires on Edit|Write of port HTML files.
# Injects the Like-a-human voice guide into Claude's context so that
# any prose written for port pages follows the project's voice standard.
#
# This hook ONLY fires for ports/**/*.html files. Structural edits to
# non-port files, CSS, JS, JSON, or config files are not affected.
#
# Soli Deo Gloria
# ============================================================================

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
VOICE_FILE="$PROJECT_DIR/.claude/skills/Humanization/Like-a-human.md"

# Read tool information from stdin (required by hook protocol)
tool_info=$(cat)

# Extract tool name and file path
tool_name=$(echo "$tool_info" | jq -r '.tool_name // empty')
file_path=$(echo "$tool_info" | jq -r '.tool_input.file_path // empty')

# Only fire on Edit or Write
if [[ ! "$tool_name" =~ ^(Edit|Write|MultiEdit)$ ]]; then
    exit 0
fi

# Only fire for port HTML files
if [[ ! "$file_path" =~ /ports/[^/]+\.html$ ]]; then
    exit 0
fi

# Skip if voice file is missing
if [ ! -f "$VOICE_FILE" ]; then
    echo "⚠️ Like-a-human voice guide not found at $VOICE_FILE"
    exit 0
fi

# Inject the voice guide
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✒️  LIKE-A-HUMAN VOICE GUIDE — Active for port content"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat "$VOICE_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Remember: Both CAREFUL guardrails (process + technical) are also active."
echo "Voice applies to reader-facing prose. Careful applies to everything."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
