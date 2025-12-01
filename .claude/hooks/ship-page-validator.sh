#!/bin/bash
# ============================================================================
# Ship Page Validator Hook — v3.010.300
#
# Auto-validates ship pages after they are created or modified.
# Called by Claude Code after Write/Edit operations on ship pages.
#
# Environment variables expected:
#   $TOOL_NAME - The tool that was used (Write, Edit, etc.)
#   $FILE_PATH - The file that was modified
#
# Output: JSON with validation results for Claude to process
#
# Soli Deo Gloria
# ============================================================================

# Get the file path from argument or environment
FILE="${1:-$FILE_PATH}"

# Only process ship pages
if [[ ! "$FILE" =~ ^.*/ships/[^/]+/[^/]+\.html$ ]]; then
    # Not a ship page, exit silently
    exit 0
fi

# Check if file exists
if [ ! -f "$FILE" ]; then
    exit 0
fi

# Run validation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATOR="$SCRIPT_DIR/../../admin/validate-ship-page.sh"

if [ ! -f "$VALIDATOR" ]; then
    echo "⚠️ Ship page validator not found at $VALIDATOR"
    exit 0
fi

# Capture validation output
OUTPUT=$("$VALIDATOR" "$FILE" 2>&1)
EXIT_CODE=$?

# Output results for Claude to see
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🚢 SHIP PAGE AUTO-VALIDATION"
echo "  File: $FILE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "$OUTPUT"

# Provide guidance based on exit code
if [ $EXIT_CODE -eq 1 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "  ❌ CRITICAL ERRORS DETECTED"
    echo ""
    echo "  The ship page has compliance issues that must be fixed."
    echo "  Reference: new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md"
    echo ""
    echo "  Claude: Please review the errors above and fix them before proceeding."
    echo "═══════════════════════════════════════════════════════════════════════════"
elif [ $EXIT_CODE -eq 2 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "  ⚠️ WARNINGS DETECTED"
    echo ""
    echo "  The ship page passed but has items that should be addressed."
    echo "  Reference: new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md"
    echo ""
    echo "  Claude: Consider addressing the warnings above for full compliance."
    echo "═══════════════════════════════════════════════════════════════════════════"
else
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "  ✅ SHIP PAGE FULLY COMPLIANT"
    echo "═══════════════════════════════════════════════════════════════════════════"
fi

exit $EXIT_CODE
