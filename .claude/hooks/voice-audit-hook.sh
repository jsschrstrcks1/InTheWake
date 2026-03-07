#!/bin/bash
# ============================================================================
# Voice Audit Hook — v1.0.0
#
# PreToolUse hook that fires before Bash commands containing "git commit".
# Checks if any staged files are reader-facing content files.
# If so, injects the voice-audit diagnostic into Claude's context
# as a reminder to run the post-draft diagnostic before finalizing.
#
# Fires on:
#   PreToolUse → Bash (matcher: "Bash")
#   Only when tool_input.command contains "git commit"
#   Only when staged files include content paths
#
# Content paths (same as port-content-voice-hook.sh):
#   - ports/**/*.html
#   - ships/**/*.html
#   - restaurants/**/*.html
#   - cruise-lines/**/*.html
#   - solo/**/*.html
#   - **/logbook*/**/*.json
#   - index.html, planning.html, about-us.html (root content pages)
#
# Soli Deo Gloria
# ============================================================================

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
VOICE_AUDIT_FILE="$PROJECT_DIR/.claude/skills/Humanization/voice-audit.md"

# Read tool information from stdin (required by hook protocol)
tool_info=$(cat)

# Extract the command being run
command=$(echo "$tool_info" | jq -r '.tool_input.command // empty')

# Only fire on git commit commands
if ! echo "$command" | grep -q "git commit"; then
    exit 0
fi

# Check if voice-audit file exists
if [ ! -f "$VOICE_AUDIT_FILE" ]; then
    echo "⚠️ Voice audit file not found at $VOICE_AUDIT_FILE"
    exit 0
fi

# Check if any staged files are content files
staged_files=$(cd "$PROJECT_DIR" && git diff --cached --name-only 2>/dev/null || true)

if [ -z "$staged_files" ]; then
    # No staged files — might be using -a flag or amending; check anyway
    # Also check unstaged modified files in case of git commit -a
    if echo "$command" | grep -q "\-a\b\|--all"; then
        staged_files=$(cd "$PROJECT_DIR" && git diff --name-only 2>/dev/null || true)
    fi
fi

# If still no files, let the commit proceed without audit
if [ -z "$staged_files" ]; then
    exit 0
fi

# Check if any staged file is a content file
has_content=false

while IFS= read -r file; do
    # HTML files in content directories
    if echo "$file" | grep -qE '^(ports|ships|restaurants|cruise-lines|solo)/.*\.html$'; then
        has_content=true
        break
    fi
    # Root content pages
    if echo "$file" | grep -qE '^(index|planning|about-us|accessibility|travel|packing-lists|drink-packages)\.html$'; then
        has_content=true
        break
    fi
    # Logbook JSON files
    if echo "$file" | grep -qE 'logbooks?/.*\.json$'; then
        has_content=true
        break
    fi
done <<< "$staged_files"

# If no content files are staged, let the commit proceed silently
if [ "$has_content" = false ]; then
    exit 0
fi

# Count content files for the banner
content_count=0
content_files=""
while IFS= read -r file; do
    if echo "$file" | grep -qE '^(ports|ships|restaurants|cruise-lines|solo)/.*\.html$'; then
        content_count=$((content_count + 1))
        content_files="${content_files}\n  - ${file}"
    elif echo "$file" | grep -qE '^(index|planning|about-us|accessibility|travel|packing-lists|drink-packages)\.html$'; then
        content_count=$((content_count + 1))
        content_files="${content_files}\n  - ${file}"
    elif echo "$file" | grep -qE 'logbooks?/.*\.json$'; then
        content_count=$((content_count + 1))
        content_files="${content_files}\n  - ${file}"
    fi
done <<< "$staged_files"

# Inject the voice audit diagnostic
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VOICE AUDIT — Pre-Commit Diagnostic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ${content_count} content file(s) staged for commit:"
echo -e "$content_files"
echo ""
echo "  Before committing, run the voice-audit diagnostic against these files."
echo "  Check for: machine tells, voice drift, honesty, cadence, precision."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat "$VOICE_AUDIT_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Review the content files above against this diagnostic."
echo "  If authenticity risk is HIGH, restore the voice before committing."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EMOTIONAL HOOK TEST — 30-Second Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Also consider how the reader FEELS in the first 30 seconds:"
echo ""
echo "  1. CLARITY  (0-5s)   Can they tell what this page is FOR?"
echo "  2. CALM     (5-10s)  Does scanning feel calming or overwhelming?"
echo "  3. SEEN     (10-15s) Does it feel like someone thought about THEM?"
echo "  4. CONFIDENCE (15-20s) Do they feel 'I can do this'?"
echo "  5. GUIDED   (20-30s) Would a first-time cruiser feel guided?"
echo ""
echo "  See: .claude/skills/Humanization/emotional-hook-test.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Exit 0 to allow the commit to proceed (diagnostic is advisory, not blocking)
exit 0
