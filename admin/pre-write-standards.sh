#!/bin/bash
# Pre-write standards checker for Claude (YAML-Driven v2.0)
# Usage: ./pre-write-standards.sh <file1> <file2> ...
# Shows relevant standards before modifying files
# Reads from .claude/standards/*.yml (single source of truth)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Standards directory
STANDARDS_DIR=".claude/standards"

# Check if yq is available
if ! command -v yq &> /dev/null; then
  echo -e "${RED}Error: yq is required but not installed.${NC}"
  echo "Install yq to parse YAML standards files."
  exit 1
fi

if [ $# -eq 0 ]; then
  echo "Usage: $0 <file1> <file2> ..."
  exit 1
fi

FILES="$@"

# Detect file types
HTML_FILES=$(echo "$FILES" | tr ' ' '\n' | grep -E '\.html?$' || true)
JS_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.js$' || true)
CSS_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.css$' || true)
JSON_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.json$' || true)
MD_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.md$' || true)

# Function to display section header
show_section() {
  local title="$1"
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${BLUE}${title}${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to display a requirement
show_requirement() {
  local name="$1"
  local priority="$2"
  local severity="$3"
  local description="$4"
  local required="$5"

  # Icon based on severity
  local icon="ℹ️"
  if [ "$severity" = "error" ]; then
    icon="❌"
  elif [ "$severity" = "warning" ]; then
    icon="⚠️"
  fi

  # Priority indicator
  local priority_text=""
  if [ -n "$priority" ] && [ "$priority" != "null" ]; then
    priority_text=" [Priority: $priority]"
  fi

  # Required/Optional indicator
  local req_text="Optional"
  if [ "$required" = "true" ]; then
    req_text="Required"
  fi

  echo -e "${icon} ${BOLD}${name}${NC}${priority_text}"
  echo -e "   ${req_text} | Severity: ${severity}"
  if [ -n "$description" ] && [ "$description" != "null" ]; then
    echo -e "   ${description}"
  fi
  echo ""
}

# Header
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📋 PRE-WRITE STANDARDS REFERENCE (YAML-Driven)${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"

# Load and display theological standards (ALWAYS shown - IMMUTABLE)
show_section "✝️ THEOLOGICAL FOUNDATION (IMMUTABLE)"

if [ -f "$STANDARDS_DIR/theological.yml" ]; then
  echo -e "${BOLD}Soli Deo Gloria${NC}"
  FOUNDATION=$(yq -r '.foundation.purpose // empty' "$STANDARDS_DIR/theological.yml")
  if [ -n "$FOUNDATION" ]; then
    echo "$FOUNDATION" | sed 's/^/   /'
  fi
  echo ""

  # Show scripture
  echo -e "${BOLD}Scripture Foundation:${NC}"
  PRIMARY=$(yq -r '.foundation.scripture_primary.reference // empty' "$STANDARDS_DIR/theological.yml")
  PRIMARY_TEXT=$(yq -r '.foundation.scripture_primary.text // empty' "$STANDARDS_DIR/theological.yml")
  if [ -n "$PRIMARY" ]; then
    echo -e "   ${GREEN}${PRIMARY}${NC}"
    echo "   \"$PRIMARY_TEXT\""
  fi
  echo ""

  # Invocation requirement
  if yq -e '.invocation' "$STANDARDS_DIR/theological.yml" > /dev/null 2>&1; then
    INV_DESC=$(yq -r '.invocation.description // empty' "$STANDARDS_DIR/theological.yml")
    INV_IMMUTABLE=$(yq -r '.invocation.immutable // false' "$STANDARDS_DIR/theological.yml")

    echo -e "${RED}❌${NC} ${BOLD}Invocation Required (IMMUTABLE)${NC}"
    echo -e "   $INV_DESC"
    echo -e "   ${YELLOW}Cannot be disabled or overridden${NC}"
    echo ""

    # Show template
    TEMPLATE=$(yq -r '.invocation.template // empty' "$STANDARDS_DIR/theological.yml")
    if [ -n "$TEMPLATE" ]; then
      echo -e "${BOLD}Template:${NC}"
      echo "$TEMPLATE" | sed 's/^/   /'
    fi
  fi
fi

# HTML Standards
if [ -n "$HTML_FILES" ]; then
  show_section "🌐 HTML STANDARDS"

  if [ -f "$STANDARDS_DIR/html.yml" ]; then
    # Get all top-level keys except metadata
    SECTIONS=$(yq 'keys | .[] | select(. != "version" and . != "last_updated" and . != "category" and . != "extends")' "$STANDARDS_DIR/html.yml")

    for SECTION in $SECTIONS; do
      # Get section name and details
      REQUIRED=$(yq -r ".${SECTION}.required // false" "$STANDARDS_DIR/html.yml")
      SEVERITY=$(yq -r ".${SECTION}.severity // \"info\"" "$STANDARDS_DIR/html.yml")
      PRIORITY=$(yq -r ".${SECTION}.priority // null" "$STANDARDS_DIR/html.yml")
      DESC=$(yq -r ".${SECTION}.description // empty" "$STANDARDS_DIR/html.yml")

      # Format section name (replace underscores with spaces, title case)
      DISPLAY_NAME=$(echo "$SECTION" | tr '_' ' ' | sed 's/\b\(.\)/\u\1/g')

      show_requirement "$DISPLAY_NAME" "$PRIORITY" "$SEVERITY" "$DESC" "$REQUIRED"
    done

    # Special note about ICP-Lite v1.4
    echo -e "${BOLD}ICP-Lite v1.4 Required Meta Tags:${NC}"
    echo -e "   <meta name=\"ai-summary\" content=\"...\" />"
    echo -e "   ${CYAN}(Max 250 chars; first ~155 must be standalone sentence)${NC}"
    echo -e "   <meta name=\"last-reviewed\" content=\"YYYY-MM-DD\" />"
    echo -e "   <meta name=\"content-protocol\" content=\"ICP-Lite v1.4\" />"
    echo ""
    echo -e "${BOLD}JSON-LD Mirroring Required:${NC}"
    echo -e "   description must match ai-summary exactly"
    echo -e "   dateModified must match last-reviewed exactly"
    echo -e "   ${CYAN}(For entity pages: ships/*, ports/*, restaurants/* must also have mainEntity)${NC}"
    echo ""
  fi
fi

# JavaScript Standards
if [ -n "$JS_FILES" ]; then
  show_section "⚙️ JAVASCRIPT STANDARDS"

  if [ -f "$STANDARDS_DIR/javascript.yml" ]; then
    SECTIONS=$(yq 'keys | .[] | select(. != "version" and . != "last_updated" and . != "category")' "$STANDARDS_DIR/javascript.yml")

    for SECTION in $SECTIONS; do
      REQUIRED=$(yq -r ".${SECTION}.required // false" "$STANDARDS_DIR/javascript.yml")
      SEVERITY=$(yq -r ".${SECTION}.severity // \"info\"" "$STANDARDS_DIR/javascript.yml")
      PRIORITY=$(yq -r ".${SECTION}.priority // null" "$STANDARDS_DIR/javascript.yml")
      DESC=$(yq -r ".${SECTION}.description // empty" "$STANDARDS_DIR/javascript.yml")

      DISPLAY_NAME=$(echo "$SECTION" | tr '_' ' ' | sed 's/\b\(.\)/\u\1/g')

      show_requirement "$DISPLAY_NAME" "$PRIORITY" "$SEVERITY" "$DESC" "$REQUIRED"
    done

    # Security reminders
    echo -e "${BOLD}Security Checklist:${NC}"
    echo -e "   ${RED}✗${NC} No eval() or new Function() with user input"
    echo -e "   ${RED}✗${NC} No debugger statements"
    echo -e "   ${YELLOW}⚠${NC}  No console.log in production code"
    echo -e "   ${RED}✗${NC} No hardcoded API keys or secrets"
    echo -e "   ${YELLOW}⚠${NC}  Sanitize innerHTML before use"
    echo ""
  fi
fi

# CSS Standards
if [ -n "$CSS_FILES" ]; then
  show_section "🎨 CSS STANDARDS"

  if [ -f "$STANDARDS_DIR/css.yml" ]; then
    SECTIONS=$(yq 'keys | .[] | select(. != "version" and . != "last_updated" and . != "category")' "$STANDARDS_DIR/css.yml")

    for SECTION in $SECTIONS; do
      REQUIRED=$(yq -r ".${SECTION}.required // false" "$STANDARDS_DIR/css.yml")
      SEVERITY=$(yq -r ".${SECTION}.severity // \"info\"" "$STANDARDS_DIR/css.yml")
      PRIORITY=$(yq -r ".${SECTION}.priority // null" "$STANDARDS_DIR/css.yml")
      DESC=$(yq -r ".${SECTION}.description // empty" "$STANDARDS_DIR/css.yml")

      DISPLAY_NAME=$(echo "$SECTION" | tr '_' ' ' | sed 's/\b\(.\)/\u\1/g')

      show_requirement "$DISPLAY_NAME" "$PRIORITY" "$SEVERITY" "$DESC" "$REQUIRED"
    done

    # Accessibility reminders
    echo -e "${BOLD}Accessibility Checklist:${NC}"
    echo -e "   ${GREEN}✓${NC} Focus styles (:focus, :focus-visible)"
    echo -e "   ${GREEN}✓${NC} Reduced motion (@media prefers-reduced-motion)"
    echo -e "   ${GREEN}✓${NC} Sufficient color contrast (WCAG AA: 4.5:1)"
    echo -e "   ${GREEN}✓${NC} Minimum 16px base font size"
    echo ""
  fi
fi

# JSON Standards
if [ -n "$JSON_FILES" ]; then
  show_section "📋 JSON STANDARDS"
  echo -e "${GREEN}✓${NC} Valid JSON syntax (will be validated with jq)"
  echo -e "${GREEN}✓${NC} Proper indentation (2 spaces recommended)"
  echo ""
fi

# Markdown Standards
if [ -n "$MD_FILES" ]; then
  show_section "📝 MARKDOWN/DOCUMENTATION STANDARDS"
  echo -e "${GREEN}✓${NC} Clear, concise language"
  echo -e "${GREEN}✓${NC} Table of contents for long docs"
  echo -e "${GREEN}✓${NC} Code examples where applicable"
  echo -e "${GREEN}✓${NC} Version numbers documented"
  echo ""
fi

# Universal reminders
show_section "🔒 UNIVERSAL SECURITY & QUALITY"
echo -e "${RED}✗${NC} No API keys, tokens, or credentials in code"
echo -e "${RED}✗${NC} No TODO without issue reference (// TODO #123)"
echo -e "${RED}✗${NC} No commented-out code blocks"
echo -e "${GREEN}✓${NC} Code is your best work, worthy of offering to God"
echo ""

# Files to be modified
show_section "📝 FILES TO BE MODIFIED"
for file in $FILES; do
  if [ -f "$file" ]; then
    echo -e "   ${GREEN}✓${NC} $file ${CYAN}(exists)${NC}"
  else
    echo -e "   ${YELLOW}⚠${NC}  $file ${YELLOW}(will be created)${NC}"
  fi
done

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Review standards above before writing code${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${ITALIC}\"Whatever you do, work heartily, as for the Lord and not for men.\"${NC}"
echo -e "${ITALIC}— Colossians 3:23${NC}"
echo ""
