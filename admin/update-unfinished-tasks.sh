#!/bin/bash
# Intelligent task tracker for the three-file task management system
# Updates UNFINISHED_TASKS.md, IN_PROGRESS_TASKS.md, and COMPLETED_TASKS.md
# Part of the modular standards system
# Updated: 2025-11-25

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Task files
UNFINISHED_FILE="admin/UNFINISHED_TASKS.md"
IN_PROGRESS_FILE="admin/IN_PROGRESS_TASKS.md"
COMPLETED_FILE="admin/COMPLETED_TASKS.md"

# Cleanup trap for temp files
cleanup() {
  rm -f "${UNFINISHED_FILE}.tmp" "${IN_PROGRESS_FILE}.tmp" "${COMPLETED_FILE}.tmp" 2>/dev/null || true
}
trap cleanup EXIT

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Not in a git repository, skipping task update${NC}"
  exit 0
fi

# Get the most recent commit info
COMMIT_HASH=$(git log -1 --format='%h')
COMMIT_DATE=$(git log -1 --format='%ci' | cut -d' ' -f1)
COMMIT_MSG=$(git log -1 --format='%s')
COMMIT_BODY=$(git log -1 --format='%b')
BRANCH=$(git branch --show-current)
FILES_CHANGED=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null || echo "")
FILES_COUNT=$(echo "$FILES_CHANGED" | grep -c . || echo "0")

# Extract commit type from message
COMMIT_TYPE=$(echo "$COMMIT_MSG" | grep -oE '^[A-Z]+' || echo "CHANGE")

# Determine emoji and action based on commit type
case "$COMMIT_TYPE" in
  FIX)      EMOJI="🐛"; ACTION="fixed" ;;
  FEAT)     EMOJI="✨"; ACTION="added" ;;
  DOCS)     EMOJI="📝"; ACTION="documented" ;;
  STYLE)    EMOJI="💎"; ACTION="styled" ;;
  REFACTOR) EMOJI="♻️"; ACTION="refactored" ;;
  PERF)     EMOJI="⚡"; ACTION="optimized" ;;
  TEST)     EMOJI="✅"; ACTION="tested" ;;
  CHORE)    EMOJI="🔧"; ACTION="updated" ;;
  ADMIN)    EMOJI="🔑"; ACTION="configured" ;;
  LINT)     EMOJI="🧹"; ACTION="cleaned" ;;
  STANDARDS) EMOJI="📏"; ACTION="standardized" ;;
  TASK)     EMOJI="📋"; ACTION="task management" ;;
  *)        EMOJI="📦"; ACTION="changed" ;;
esac

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📋 THREE-FILE TASK TRACKER${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "   Commit: ${CYAN}$COMMIT_HASH${NC}"
echo -e "   Type: ${BLUE}$COMMIT_TYPE${NC} ($ACTION)"
echo -e "   Message: $EMOJI $COMMIT_MSG"
echo -e "   Branch: ${CYAN}$BRANCH${NC}"
echo ""

# Check if task files exist
if [ ! -f "$UNFINISHED_FILE" ]; then
  echo -e "${YELLOW}⚠️  $UNFINISHED_FILE not found${NC}"
fi

if [ ! -f "$IN_PROGRESS_FILE" ]; then
  echo -e "${YELLOW}⚠️  $IN_PROGRESS_FILE not found${NC}"
fi

if [ ! -f "$COMPLETED_FILE" ]; then
  echo -e "${YELLOW}⚠️  $COMPLETED_FILE not found${NC}"
fi

# Update timestamps in all files that exist
for FILE in "$UNFINISHED_FILE" "$IN_PROGRESS_FILE" "$COMPLETED_FILE"; do
  if [ -f "$FILE" ]; then
    # Update the "Last Updated" timestamp
    sed -i "s|\*\*Last Updated:\*\* [0-9-]*|\*\*Last Updated:\*\* $COMMIT_DATE|" "$FILE"
    echo -e "   ${GREEN}✓${NC} Updated timestamp in $FILE"
  fi
done

# Update IN_PROGRESS_TASKS.md with thread history if it exists
if [ -f "$IN_PROGRESS_FILE" ]; then
  # Check if this branch is already in the thread history
  if ! grep -q "$BRANCH" "$IN_PROGRESS_FILE" 2>/dev/null; then
    # Add to thread history table if not present
    HISTORY_LINE="| $BRANCH | $COMMIT_MSG | ACTIVE | $COMMIT_DATE |"

    # Find the thread history section and add entry
    if grep -q "## Thread History" "$IN_PROGRESS_FILE"; then
      # Add after the header row
      sed -i "/^| Thread ID | Task | Status | Date |$/a\\$HISTORY_LINE" "$IN_PROGRESS_FILE" 2>/dev/null || true
      echo -e "   ${GREEN}✓${NC} Added branch to thread history"
    fi
  fi
fi

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📁 Task Files:${NC}"
echo -e "   • ${CYAN}$UNFINISHED_FILE${NC} - Queue of pending tasks"
echo -e "   • ${CYAN}$IN_PROGRESS_FILE${NC} - Thread coordination"
echo -e "   • ${CYAN}$COMPLETED_FILE${NC} - Archive of finished work"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""

exit 0
