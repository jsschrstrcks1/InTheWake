#!/bin/bash
# Post-write validation script (YAML-Driven v2.0)
# Usage: ./post-write-validate.sh <file1> <file2> ...
# Validates files after modifications using YAML standards
# Reads from .claude/standards/*.yml (single source of truth)

set +e  # Don't exit on first error - collect all results

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
TOTAL_ERRORS=0
TOTAL_WARNINGS=0

# Function to show section header
show_section() {
  local title="$1"
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${title}${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to execute a check based on type
execute_check() {
  local file="$1"
  local check_type="$2"
  local check_pattern="$3"
  local check_cmd="$4"
  local description="$5"

  case "$check_type" in
    grep)
      if grep -q "$check_pattern" "$file" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} $description"
        return 0
      else
        echo -e "   ${RED}✗${NC} $description"
        return 1
      fi
      ;;

    grep_multi)
      # For OR operations with multiple patterns
      local found=false
      for pattern in $check_pattern; do
        if grep -q "$pattern" "$file" 2>/dev/null; then
          found=true
          break
        fi
      done

      if $found; then
        echo -e "   ${GREEN}✓${NC} $description"
        return 0
      else
        echo -e "   ${RED}✗${NC} $description"
        return 1
      fi
      ;;

    count_balance)
      # Balance checking for tags/braces
      local open_count=$(grep -o "$check_pattern" "$file" 2>/dev/null | wc -l || echo 0)
      local close_pattern="${check_pattern//</</}"  # Simple replacement
      close_pattern="${close_pattern//>/</}"

      # For HTML tags
      if [[ "$check_pattern" == *"<"* ]]; then
        local tag=$(echo "$check_pattern" | sed 's/<\([^>]*\).*/\1/')
        open_count=$(grep -o "<${tag}" "$file" 2>/dev/null | wc -l || echo 0)
        local close_count=$(grep -o "</${tag}>" "$file" 2>/dev/null | wc -l || echo 0)

        if [ "$open_count" -eq "$close_count" ]; then
          echo -e "   ${GREEN}✓${NC} Balanced <${tag}> tags ($open_count opening, $close_count closing)"
          return 0
        else
          echo -e "   ${RED}✗${NC} Unbalanced <${tag}> tags ($open_count opening, $close_count closing)"
          return 1
        fi
      else
        # For braces
        local open_count=$(grep -o "{" "$file" 2>/dev/null | wc -l || echo 0)
        local close_count=$(grep -o "}" "$file" 2>/dev/null | wc -l || echo 0)

        if [ "$open_count" -eq "$close_count" ]; then
          echo -e "   ${GREEN}✓${NC} Balanced braces ($open_count opening, $close_count closing)"
          return 0
        else
          echo -e "   ${RED}✗${NC} Unbalanced braces ($open_count opening, $close_count closing)"
          return 1
        fi
      fi
      ;;

    command)
      # Execute a command
      if eval "$check_cmd" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} $description"
        return 0
      else
        echo -e "   ${RED}✗${NC} $description"
        return 1
      fi
      ;;

    *)
      echo -e "   ${YELLOW}⚠${NC}  Unknown check type: $check_type"
      return 2
      ;;
  esac
}

# Function to validate a file against YAML standards
validate_file() {
  local file="$1"
  local standards_file="$2"
  local file_errors=0
  local file_warnings=0

  if [ ! -f "$file" ]; then
    echo -e "   ${RED}✗${NC} File not found: $file"
    return 1
  fi

  if [ ! -f "$standards_file" ]; then
    echo -e "   ${YELLOW}⚠${NC}  Standards file not found: $standards_file"
    return 0
  fi

  echo ""
  echo -e "${BOLD}Checking: $file${NC}"

  # Get all sections from YAML
  SECTIONS=$(yq 'keys | .[] | select(. != "version" and . != "last_updated" and . != "category" and . != "extends")' "$standards_file")

  for SECTION in $SECTIONS; do
    # Get check configuration
    CHECK_TYPE=$(yq -r ".${SECTION}.check.type // empty" "$standards_file")

    if [ -z "$CHECK_TYPE" ] || [ "$CHECK_TYPE" = "null" ]; then
      continue
    fi

    REQUIRED=$(yq -r ".${SECTION}.required // false" "$standards_file")
    SEVERITY=$(yq -r ".${SECTION}.severity // \"info\"" "$standards_file")
    DESCRIPTION=$(yq -r ".${SECTION}.description // empty" "$standards_file")
    PATTERN=$(yq -r ".${SECTION}.check.pattern // empty" "$standards_file")
    CMD=$(yq -r ".${SECTION}.check.cmd // empty" "$standards_file")

    # Execute the check
    if execute_check "$file" "$CHECK_TYPE" "$PATTERN" "$CMD" "$DESCRIPTION"; then
      # Check passed
      :
    else
      # Check failed
      if [ "$SEVERITY" = "error" ]; then
        ((file_errors++))
      elif [ "$SEVERITY" = "warning" ]; then
        ((file_warnings++))
      fi
    fi
  done

  echo ""
  return 0
}

# Header
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}🔍 POST-WRITE VALIDATION (YAML-Driven)${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"

# Validate each file based on type
for file in $FILES; do
  case "$file" in
    *.html|*.htm)
      show_section "🌐 HTML VALIDATION"

      # Check theological standards first (IMMUTABLE)
      if [ -f "$STANDARDS_DIR/theological.yml" ]; then
        echo ""
        echo -e "${BOLD}Checking: $file (Theological Requirements)${NC}"

        # Invocation check
        if grep -q "Soli Deo Gloria" "$file"; then
          echo -e "   ${GREEN}✓${NC} Soli Deo Gloria invocation present"
        else
          echo -e "   ${RED}✗${NC} Missing Soli Deo Gloria invocation"
          ((TOTAL_ERRORS++))
        fi

        # Scripture check (at least one)
        if grep -q "Proverbs 3:5\|Colossians 3:23" "$file"; then
          echo -e "   ${GREEN}✓${NC} Scripture references present"
        else
          echo -e "   ${RED}✗${NC} Missing scripture references"
          ((TOTAL_ERRORS++))
        fi
      fi

      # Check HTML standards
      validate_file "$file" "$STANDARDS_DIR/html.yml"

      # Check basic HTML structure
      if grep -q "<!doctype html>" "$file" 2>/dev/null || grep -q "<!DOCTYPE html>" "$file" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} DOCTYPE declaration"
      else
        echo -e "   ${RED}✗${NC} Missing DOCTYPE"
        ((TOTAL_ERRORS++))
      fi

      if grep -q 'lang="en"' "$file" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Language attribute"
      else
        echo -e "   ${YELLOW}⚠${NC}  Missing language attribute"
        ((TOTAL_WARNINGS++))
      fi

      if grep -q 'name="viewport"' "$file" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Viewport meta tag"
      else
        echo -e "   ${YELLOW}⚠${NC}  Missing viewport meta tag"
        ((TOTAL_WARNINGS++))
      fi

      # ICP-Lite v1.4 validation (delegated to Node.js validator)
      if command -v node &> /dev/null && [ -f "admin/validate-icp-lite-v14.js" ]; then
        # Run Node.js validator and capture output
        ICP_OUTPUT=$(node admin/validate-icp-lite-v14.js "$file" 2>&1)
        ICP_EXIT=$?

        if [ $ICP_EXIT -eq 0 ]; then
          echo -e "   ${GREEN}✓${NC} ICP-Lite v1.4 compliant"
        else
          echo -e "   ${RED}✗${NC} ICP-Lite v1.4 validation failed"
          # Show errors indented
          echo "$ICP_OUTPUT" | grep -E "ERROR:|WARNING:" | while IFS= read -r line; do
            if [[ "$line" =~ ERROR: ]]; then
              echo -e "      ${RED}→${NC} $(echo "$line" | sed 's/.*ERROR: //')"
            elif [[ "$line" =~ WARNING: ]]; then
              echo -e "      ${YELLOW}→${NC} $(echo "$line" | sed 's/.*WARNING: //')"
            fi
          done
          ((TOTAL_ERRORS++))
        fi
      else
        # Fallback to basic grep check if Node.js not available
        echo -e "   ${YELLOW}⚠${NC}  Node.js validator not available, using basic ICP-Lite check"
        if grep -q 'name="ai-summary"' "$file" 2>/dev/null; then
          echo -e "   ${GREEN}✓${NC} ICP-Lite ai-summary present"
        else
          echo -e "   ${RED}✗${NC} Missing ICP-Lite ai-summary"
          ((TOTAL_ERRORS++))
        fi
      fi

      # Unknown placeholder checks (incomplete content detection)
      UNKNOWN_PATTERNS="Unknown ship\|Unknown photographer\|Cruise Line: Unknown\|Photo by: Unknown\|Attribution: Unknown"
      if grep -qE "$UNKNOWN_PATTERNS" "$file" 2>/dev/null; then
        echo -e "   ${RED}✗${NC} Found 'Unknown' placeholder(s) - incomplete content"
        grep -n -E "$UNKNOWN_PATTERNS" "$file" 2>/dev/null | head -5 | while read line; do
          echo -e "      ${YELLOW}→${NC} $line"
        done
        ((TOTAL_ERRORS++))
      else
        echo -e "   ${GREEN}✓${NC} No 'Unknown' placeholders"
      fi

      # Div balance
      OPEN_DIVS=$(grep -o "<div" "$file" | wc -l || echo 0)
      CLOSE_DIVS=$(grep -o "</div>" "$file" | wc -l || echo 0)
      if [ "$OPEN_DIVS" -eq "$CLOSE_DIVS" ]; then
        echo -e "   ${GREEN}✓${NC} Balanced <div> tags ($OPEN_DIVS opening, $CLOSE_DIVS closing)"
      else
        echo -e "   ${RED}✗${NC} Unbalanced <div> tags ($OPEN_DIVS opening, $CLOSE_DIVS closing)"
        ((TOTAL_ERRORS++))
      fi

      # Heading tag balance (h1-h6)
      HEADING_OK=true
      for HLEVEL in 1 2 3 4 5 6; do
        OPEN_H=$(grep -oE "<h${HLEVEL}[[:space:]>]" "$file" | wc -l || echo 0)
        CLOSE_H=$(grep -o "</h${HLEVEL}>" "$file" | wc -l || echo 0)
        if [ "$OPEN_H" -ne "$CLOSE_H" ]; then
          echo -e "   ${RED}✗${NC} Mismatched <h${HLEVEL}> tags ($OPEN_H opening, $CLOSE_H closing)"
          ((TOTAL_ERRORS++))
          HEADING_OK=false
        fi
      done
      if $HEADING_OK; then
        echo -e "   ${GREEN}✓${NC} Balanced heading tags (h1-h6)"
      fi

      # Structural tag balance (section, details, article, aside, nav)
      for STAG in section details article aside nav; do
        OPEN_S=$(grep -oE "<${STAG}[[:space:]>]" "$file" | wc -l || echo 0)
        CLOSE_S=$(grep -o "</${STAG}>" "$file" | wc -l || echo 0)
        if [ "$OPEN_S" -ne "$CLOSE_S" ]; then
          echo -e "   ${RED}✗${NC} Unbalanced <${STAG}> tags ($OPEN_S opening, $CLOSE_S closing)"
          ((TOTAL_ERRORS++))
        fi
      done

      # Console.log in inline scripts (not in external .js files loaded via src)
      if grep -Pzo '(?s)<script(?![^>]*src=)[^>]*>.*?</script>' "$file" 2>/dev/null | grep -q 'console\.\(log\|warn\|error\|debug\)' 2>/dev/null; then
        echo -e "   ${YELLOW}⚠${NC}  Found console.log/warn/error in inline <script> block(s)"
        ((TOTAL_WARNINGS++))
      else
        echo -e "   ${GREEN}✓${NC} No console.log in inline scripts"
      fi

      # Meta author tag check
      if grep -q 'name="author"' "$file" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Meta author tag present"
      else
        echo -e "   ${YELLOW}⚠${NC}  Missing <meta name=\"author\"> tag"
        ((TOTAL_WARNINGS++))
      fi

      # Trust badge check (all pages)
      if grep -q 'class="trust-badge"' "$file" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Trust badge present in footer"
      else
        echo -e "   ${RED}✗${NC} Missing trust badge in footer"
        ((TOTAL_ERRORS++))
      fi

      # Last-reviewed stamp check (port pages only)
      if [[ "$file" == *"/ports/"* ]]; then
        if grep -q 'class="last-reviewed"' "$file" 2>/dev/null; then
          echo -e "   ${GREEN}✓${NC} Last-reviewed stamp present"
        else
          echo -e "   ${YELLOW}⚠${NC}  Missing last-reviewed stamp on port page"
          ((TOTAL_WARNINGS++))
        fi
      fi
      ;;

    *.js)
      show_section "⚙️ JAVASCRIPT VALIDATION"
      echo ""
      echo -e "${BOLD}Checking: $file${NC}"

      # Try ESLint
      ESLINT_BIN=""
      for eslint_path in "$(which eslint 2>/dev/null)" "/opt/node22/bin/eslint" "node_modules/.bin/eslint"; do
        if [ -x "$eslint_path" ]; then
          ESLINT_BIN="$eslint_path"
          break
        fi
      done

      if [ -n "$ESLINT_BIN" ]; then
        ESLINT_OUTPUT=$($ESLINT_BIN "$file" 2>&1 || true)

        if echo "$ESLINT_OUTPUT" | grep -q "error"; then
          FILE_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c "error" || echo "0")
          echo -e "   ${RED}✗${NC} ESLint found $FILE_ERRORS error(s)"
          ((TOTAL_ERRORS+=FILE_ERRORS))
        else
          echo -e "   ${GREEN}✓${NC} ESLint passed"
        fi

        if echo "$ESLINT_OUTPUT" | grep -q "warning"; then
          FILE_WARNINGS=$(echo "$ESLINT_OUTPUT" | grep -c "warning" || echo "0")
          echo -e "   ${YELLOW}⚠${NC}  ESLint found $FILE_WARNINGS warning(s)"
          ((TOTAL_WARNINGS+=FILE_WARNINGS))
        fi
      else
        echo -e "   ${YELLOW}⚠${NC}  ESLint not found, skipping linting"
      fi

      # Node syntax check
      if command -v node &> /dev/null; then
        if node --check "$file" 2>/dev/null; then
          echo -e "   ${GREEN}✓${NC} Valid JavaScript syntax"
        else
          echo -e "   ${RED}✗${NC} Syntax error"
          ((TOTAL_ERRORS++))
        fi
      fi

      # Security checks
      if grep -q "debugger" "$file"; then
        echo -e "   ${RED}✗${NC} Found debugger statement"
        ((TOTAL_ERRORS++))
      else
        echo -e "   ${GREEN}✓${NC} No debugger statements"
      fi

      if grep -q "console\.log" "$file"; then
        echo -e "   ${YELLOW}⚠${NC}  Found console.log statement(s)"
        ((TOTAL_WARNINGS++))
      else
        echo -e "   ${GREEN}✓${NC} No console.log statements"
      fi

      # Check for eval
      if grep -q "\\beval(" "$file"; then
        echo -e "   ${RED}✗${NC} Found eval() - security risk"
        ((TOTAL_ERRORS++))
      fi

      # Check for hardcoded secrets
      if grep -Eq "(api[_-]?key|apiKey|API_KEY|secret|SECRET|password|PASSWORD|token|TOKEN)" "$file"; then
        echo -e "   ${RED}✗${NC} Possible hardcoded secret detected"
        ((TOTAL_ERRORS++))
      fi
      ;;

    *.css)
      show_section "🎨 CSS VALIDATION"
      echo ""
      echo -e "${BOLD}Checking: $file${NC}"

      # Balanced braces
      OPEN_BRACES=$(grep -o "{" "$file" | wc -l || echo 0)
      CLOSE_BRACES=$(grep -o "}" "$file" | wc -l || echo 0)
      if [ "$OPEN_BRACES" -eq "$CLOSE_BRACES" ]; then
        echo -e "   ${GREEN}✓${NC} Balanced braces"
      else
        echo -e "   ${RED}✗${NC} Unbalanced braces"
        ((TOTAL_ERRORS++))
      fi

      # Focus styles
      if grep -Eq ":focus|:focus-visible" "$file"; then
        echo -e "   ${GREEN}✓${NC} Focus styles present"
      else
        echo -e "   ${YELLOW}⚠${NC}  No focus styles found"
        ((TOTAL_WARNINGS++))
      fi

      # Reduced motion
      if grep -q "prefers-reduced-motion" "$file"; then
        echo -e "   ${GREEN}✓${NC} Reduced motion support"
      else
        echo -e "   ${YELLOW}⚠${NC}  No reduced motion support"
        ((TOTAL_WARNINGS++))
      fi
      ;;

    *.json)
      show_section "📋 JSON VALIDATION"
      echo ""
      echo -e "${BOLD}Checking: $file${NC}"

      # JSON syntax check with jq
      if command -v jq &> /dev/null; then
        if jq empty "$file" 2>/dev/null; then
          echo -e "   ${GREEN}✓${NC} Valid JSON syntax"
        else
          echo -e "   ${RED}✗${NC} Invalid JSON syntax"
          ((TOTAL_ERRORS++))
        fi
      else
        echo -e "   ${YELLOW}⚠${NC}  jq not found, skipping JSON validation"
      fi
      ;;

    *)
      echo -e "${YELLOW}⚠${NC}  Unknown file type: $file"
      ;;
  esac
done

# Summary
echo ""
show_section "📊 VALIDATION SUMMARY"
echo ""

if [ $TOTAL_ERRORS -gt 0 ]; then
  echo -e "   ${RED}✗${NC} $TOTAL_ERRORS error(s) found"
else
  echo -e "   ${GREEN}✓${NC} No errors found"
fi

if [ $TOTAL_WARNINGS -gt 0 ]; then
  echo -e "   ${YELLOW}⚠${NC}  $TOTAL_WARNINGS warning(s) found"
fi

echo ""

if [ $TOTAL_ERRORS -gt 0 ]; then
  echo -e "   ${RED}Please fix errors before committing${NC}"
  echo ""
  echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
  exit 1
else
  echo -e "   ${GREEN}Validation passed!${NC}"
  echo ""
  echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
  exit 0
fi
