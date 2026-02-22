#!/bin/bash
# ============================================================================
# Content Voice Hook — v2.0.0
#
# PostToolUse hook that fires on Edit|Write of ANY reader-facing content.
# Injects the Like-a-human voice guide into Claude's context so that
# all prose follows the project's voice standard.
#
# Fires on:
#   - ports/**/*.html       (port pages)
#   - ships/**/*.html       (ship pages)
#   - restaurants/**/*.html (venue pages)
#   - cruise-lines/**/*.html
#   - solo/**/*.html
#   - **/logbooks/**/*.json (logbook story files)
#   - index.html, planning.html, about-us.html (root content pages)
#
# Does NOT fire on:
#   - *.css, *.js           (code, not prose)
#   - .claude/**, admin/**  (config/tooling)
#   - assets/**             (data files, not prose)
#   - *.md                  (docs — handled by Careful, not voice)
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

# Determine if this is a content file that needs voice guidance
is_content=false

# HTML files in content directories
if [[ "$file_path" =~ /(ports|ships|restaurants|cruise-lines|solo)/.*\.html$ ]]; then
    is_content=true
fi

# Root content pages
if [[ "$file_path" =~ /(index|planning|about-us|accessibility|travel|packing-lists|drink-packages)\.html$ ]]; then
    is_content=true
fi

# Logbook story JSON files
if [[ "$file_path" =~ /logbooks?/.*\.json$ ]]; then
    is_content=true
fi

# Exit if not a content file
if [ "$is_content" = false ]; then
    exit 0
fi

# Skip if voice file is missing
if [ ! -f "$VOICE_FILE" ]; then
    echo "⚠️ Like-a-human voice guide not found at $VOICE_FILE"
    exit 0
fi

# Determine content type for the banner
content_type="content"
if [[ "$file_path" =~ /ports/ ]]; then content_type="port content"; fi
if [[ "$file_path" =~ /ships/ ]]; then content_type="ship content"; fi
if [[ "$file_path" =~ /restaurants/ ]]; then content_type="venue content"; fi
if [[ "$file_path" =~ /logbooks?/ ]]; then content_type="logbook narrative"; fi
if [[ "$file_path" =~ /cruise-lines/ ]]; then content_type="cruise line content"; fi
if [[ "$file_path" =~ /solo/ ]]; then content_type="solo travel content"; fi

# Inject the voice guide
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✒️  LIKE-A-HUMAN VOICE GUIDE — Active for ${content_type}"
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
