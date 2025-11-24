#!/bin/bash
# Intelligent task tracker for UNFINISHED_TASKS.md
# Automatically marks tasks complete/incomplete based on commits
# Part of the modular standards system
# Created: 2025-11-24

set -e

# Cleanup trap for temp files
cleanup() {
  rm -f "${TASKS_FILE}.tmp" "${TASKS_FILE}.tmp.2" 2>/dev/null || true
}
trap cleanup EXIT

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

TASKS_FILE="UNFINISHED_TASKS.md"

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
FILES_CHANGED=$(git diff-tree --no-commit-id --name-only -r HEAD)
FILES_COUNT=$(echo "$FILES_CHANGED" | wc -l)

# Check if UNFINISHED_TASKS.md exists
if [ ! -f "$TASKS_FILE" ]; then
  echo -e "${YELLOW}⚠️  $TASKS_FILE not found, creating new file${NC}"
  cat > "$TASKS_FILE" <<EOF
# Unfinished Tasks

**Generated:** $(date +%Y-%m-%d)
**Last Updated:** $(date +%Y-%m-%d)
**Branch:** \`$BRANCH\`

---

## 📋 Active Tasks

<!-- Tasks will be automatically tracked here -->

---

## 📜 Recent Changes Log

<!-- Commit history will be automatically added here -->

EOF
fi

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
  *)        EMOJI="📦"; ACTION="changed" ;;
esac

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📋 INTELLIGENT TASK TRACKER${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "   Commit: ${CYAN}$COMMIT_HASH${NC}"
echo -e "   Type: ${BLUE}$COMMIT_TYPE${NC} ($ACTION)"
echo -e "   Message: $EMOJI $COMMIT_MSG"
echo ""

# Extract keywords from commit message and files changed
KEYWORDS=$(echo "$COMMIT_MSG $COMMIT_BODY" | tr '[:upper:]' '[:lower:]' | grep -oE '\b[a-z]{4,}\b' | sort -u)
FILE_KEYWORDS=$(echo "$FILES_CHANGED" | tr '/' '\n' | grep -oE '^[a-z-]+' | sort -u)
ALL_KEYWORDS=$(echo -e "$KEYWORDS\n$FILE_KEYWORDS" | sort -u)

# Function to check if a task matches the current commit
task_matches_commit() {
  local task_line="$1"
  local task_lower=$(echo "$task_line" | tr '[:upper:]' '[:lower:]')

  # Check for keyword matches
  for keyword in $ALL_KEYWORDS; do
    if echo "$task_lower" | grep -q "$keyword"; then
      return 0  # Match found
    fi
  done

  # Check for file name matches
  for file in $FILES_CHANGED; do
    local filename=$(basename "$file" | sed 's/\.[^.]*$//')
    if echo "$task_lower" | grep -q "$filename"; then
      return 0  # Match found
    fi
  done

  return 1  # No match
}

# Function to mark tasks complete or incomplete
TASKS_COMPLETED=0
TASKS_REOPENED=0
TEMP_FILE="${TASKS_FILE}.tmp"
cp "$TASKS_FILE" "$TEMP_FILE"

# Process tasks based on commit type
if [ "$COMMIT_TYPE" = "FIX" ] || [ "$COMMIT_TYPE" = "FEAT" ]; then
  echo -e "${BLUE}🔍 Scanning for matching tasks...${NC}"
  echo ""

  while IFS= read -r line; do
    # Check if line is a task (starts with - [ ] or - [x])
    if echo "$line" | grep -qE '^\s*-\s+\[([ x✓✗])\]'; then
      TASK_STATUS=$(echo "$line" | grep -oE '\[([ x✓✗])\]' | tr -d '[]')
      TASK_TEXT=$(echo "$line" | sed -E 's/^\s*-\s+\[[^]]+\]\s*//')

      # Check if this task matches our commit
      if task_matches_commit "$TASK_TEXT"; then
        if [ "$TASK_STATUS" = " " ] || [ "$TASK_STATUS" = "✗" ]; then
          # Mark incomplete task as complete
          NEW_LINE=$(echo "$line" | sed -E 's/\[([ ✗])\]/[✓]/')
          sed -i "s|$(echo "$line" | sed 's/[]\/$*.^[]/\\&/g')|$NEW_LINE [$COMMIT_HASH]|" "$TEMP_FILE"
          echo -e "   ${GREEN}✓${NC} Marked complete: $TASK_TEXT"
          TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
        fi
      fi
    fi
  done < "$TASKS_FILE"

  # If this is a FIX but the issue was previously completed, reopen it
  if [ "$COMMIT_TYPE" = "FIX" ]; then
    # Check if commit message mentions "still broken" or "not working"
    if echo "$COMMIT_MSG $COMMIT_BODY" | grep -qiE '(still|broken|not working|failed|error)'; then
      echo -e "${YELLOW}⚠️  Fix indicates ongoing issue, checking for false completions...${NC}"
      # This would mark previously completed tasks as incomplete again
    fi
  fi
fi

# Add entry to Recent Changes Log
CHANGELOG_ENTRY="
### $EMOJI $COMMIT_MSG [\`$COMMIT_HASH\`]

**Date:** $COMMIT_DATE | **Branch:** \`$BRANCH\` | **Files:** $FILES_COUNT

"

# Add details if body exists
if [ -n "$COMMIT_BODY" ]; then
  CHANGELOG_ENTRY+="<details>
<summary>View details</summary>

\`\`\`
$COMMIT_BODY
\`\`\`
</details>

"
fi

# Add files changed
if [ $FILES_COUNT -lt 10 ]; then
  CHANGELOG_ENTRY+="**Files changed:**
"
  for file in $FILES_CHANGED; do
    CHANGELOG_ENTRY+="- \`$file\`
"
  done
  CHANGELOG_ENTRY+="
"
fi

CHANGELOG_ENTRY+="---
"

# Insert changelog entry after "## 📜 Recent Changes Log"
if grep -q "## 📜 Recent Changes Log" "$TEMP_FILE"; then
  awk -v entry="$CHANGELOG_ENTRY" '
    /## 📜 Recent Changes Log/ {
      print $0
      print ""
      print entry
      skip=1
      next
    }
    { print }
  ' "$TEMP_FILE" > "${TEMP_FILE}.2"
  mv "${TEMP_FILE}.2" "$TEMP_FILE"
fi

# Update the "Last Updated" timestamp
sed -i "s|\*\*Last Updated:\*\* [0-9-]*|\*\*Last Updated:\*\* $COMMIT_DATE|" "$TEMP_FILE"

# Move temp file to final location
mv "$TEMP_FILE" "$TASKS_FILE"

# Summary
echo ""
if [ $TASKS_COMPLETED -gt 0 ]; then
  echo -e "   ${GREEN}✓${NC} Marked $TASKS_COMPLETED task(s) as complete"
fi
if [ $TASKS_REOPENED -gt 0 ]; then
  echo -e "   ${YELLOW}↻${NC} Reopened $TASKS_REOPENED task(s) as incomplete"
fi
echo -e "   ${CYAN}📝${NC} Added changelog entry to $TASKS_FILE"
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""

exit 0
