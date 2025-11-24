#!/bin/bash
# Post-write validation for Claude
# Usage: ./post-write-validate.sh <file1> <file2> ...
# Validates files after writing/modifying them

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

if [ $# -eq 0 ]; then
  echo "Usage: $0 <file1> <file2> ..."
  exit 1
fi

FILES="$@"
TOTAL_ERRORS=0
TOTAL_WARNINGS=0

# Detect file types
HTML_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.html$' || true)
JS_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.js$' || true)
CSS_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.css$' || true)
JSON_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.json$' || true)

# Header
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}🔍 POST-WRITE VALIDATION${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""

# Validate HTML Files
if [ -n "$HTML_FILES" ]; then
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}🌐 HTML VALIDATION${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  for file in $HTML_FILES; do
    if [ ! -f "$file" ]; then
      echo -e "   ${RED}✗${NC} $file (not found)"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
      continue
    fi

    echo -e "${BOLD}Checking: $file${NC}"

    # Check invocation
    if grep -q "Soli Deo Gloria" "$file"; then
      echo -e "   ${GREEN}✓${NC} Soli Deo Gloria invocation present"
    else
      echo -e "   ${RED}✗${NC} Missing Soli Deo Gloria invocation"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    if grep -q "Proverbs 3:5" "$file" || grep -q "Colossians 3:23" "$file"; then
      echo -e "   ${GREEN}✓${NC} Scripture references present"
    else
      echo -e "   ${RED}✗${NC} Missing scripture references"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    # Check DOCTYPE
    if grep -iq "<!doctype html>" "$file"; then
      echo -e "   ${GREEN}✓${NC} DOCTYPE declaration"
    else
      echo -e "   ${RED}✗${NC} Missing DOCTYPE"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    # Check lang attribute
    if grep -q 'lang="en"' "$file"; then
      echo -e "   ${GREEN}✓${NC} Language attribute"
    else
      echo -e "   ${YELLOW}⚠${NC}  Missing language attribute"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    # Check viewport
    if grep -q 'name="viewport"' "$file"; then
      echo -e "   ${GREEN}✓${NC} Viewport meta tag"
    else
      echo -e "   ${YELLOW}⚠${NC}  Missing viewport meta tag"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    # Check ICP-Lite
    if grep -q 'name="ai-summary"' "$file"; then
      echo -e "   ${GREEN}✓${NC} ICP-Lite ai-summary"
    else
      echo -e "   ${YELLOW}⚠${NC}  Missing ICP-Lite ai-summary"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    # Check for unclosed tags (simple check)
    OPEN_DIVS=$(grep -o "<div" "$file" | wc -l)
    CLOSE_DIVS=$(grep -o "</div>" "$file" | wc -l)
    if [ $OPEN_DIVS -eq $CLOSE_DIVS ]; then
      echo -e "   ${GREEN}✓${NC} Balanced <div> tags ($OPEN_DIVS opening, $CLOSE_DIVS closing)"
    else
      echo -e "   ${RED}✗${NC} Unbalanced <div> tags ($OPEN_DIVS opening, $CLOSE_DIVS closing)"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    # Check for common mistakes
    if grep -q "console\.log" "$file"; then
      echo -e "   ${YELLOW}⚠${NC}  Found console.log in HTML"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    if grep -q "debugger" "$file"; then
      echo -e "   ${RED}✗${NC} Found debugger statement"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    echo ""
  done
fi

# Validate JavaScript Files
if [ -n "$JS_FILES" ]; then
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}⚙️  JAVASCRIPT VALIDATION${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Try to find ESLint
  ESLINT_BIN=""
  for eslint_path in "$(which eslint 2>/dev/null)" "/opt/node22/bin/eslint" "node_modules/.bin/eslint"; do
    if [ -x "$eslint_path" ]; then
      ESLINT_BIN="$eslint_path"
      break
    fi
  done

  if [ -n "$ESLINT_BIN" ]; then
    echo -e "Using ESLint: ${CYAN}$ESLINT_BIN${NC}"
    echo ""

    for file in $JS_FILES; do
      if [ ! -f "$file" ]; then
        echo -e "   ${RED}✗${NC} $file (not found)"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        continue
      fi

      echo -e "${BOLD}Linting: $file${NC}"

      # Run ESLint
      ESLINT_OUTPUT=$($ESLINT_BIN "$file" 2>&1 || true)

      if echo "$ESLINT_OUTPUT" | grep -q "error"; then
        FILE_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c "error" || echo "0")
        echo -e "   ${RED}✗${NC} ESLint found $FILE_ERRORS error(s)"
        echo "$ESLINT_OUTPUT" | head -20
        TOTAL_ERRORS=$((TOTAL_ERRORS + FILE_ERRORS))
      elif echo "$ESLINT_OUTPUT" | grep -q "warning"; then
        FILE_WARNINGS=$(echo "$ESLINT_OUTPUT" | grep -c "warning" || echo "0")
        echo -e "   ${YELLOW}⚠${NC}  ESLint found $FILE_WARNINGS warning(s)"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + FILE_WARNINGS))
      else
        echo -e "   ${GREEN}✓${NC} No ESLint issues"
      fi

      # Check for debugging code
      if grep -q "console\.log" "$file"; then
        echo -e "   ${YELLOW}⚠${NC}  Found console.log"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
      fi

      if grep -q "debugger" "$file"; then
        echo -e "   ${RED}✗${NC} Found debugger statement"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
      fi

      # Check strict mode
      if grep -q '"use strict"' "$file" || grep -q "'use strict'" "$file"; then
        echo -e "   ${GREEN}✓${NC} Strict mode enabled"
      else
        echo -e "   ${YELLOW}⚠${NC}  No strict mode declaration"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
      fi

      # Check syntax with Node
      NODE_BIN=$(which node 2>/dev/null || echo "")
      if [ -n "$NODE_BIN" ]; then
        if $NODE_BIN --check "$file" 2>&1 >/dev/null; then
          echo -e "   ${GREEN}✓${NC} Syntax valid (Node.js check)"
        else
          echo -e "   ${RED}✗${NC} Syntax error detected"
          $NODE_BIN --check "$file" 2>&1 | head -5
          TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        fi
      fi

      echo ""
    done
  else
    echo -e "${YELLOW}⚠  ESLint not found, running basic checks only${NC}"
    echo ""

    for file in $JS_FILES; do
      if [ ! -f "$file" ]; then continue; fi

      echo -e "${BOLD}Checking: $file${NC}"

      # Basic checks
      if grep -q "console\.log" "$file"; then
        echo -e "   ${YELLOW}⚠${NC}  Found console.log"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
      fi

      if grep -q "debugger" "$file"; then
        echo -e "   ${RED}✗${NC} Found debugger statement"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
      fi

      echo ""
    done
  fi
fi

# Validate CSS Files
if [ -n "$CSS_FILES" ]; then
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}🎨 CSS VALIDATION${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  for file in $CSS_FILES; do
    if [ ! -f "$file" ]; then
      echo -e "   ${RED}✗${NC} $file (not found)"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
      continue
    fi

    echo -e "${BOLD}Checking: $file${NC}"

    # Check for focus-visible
    if grep -q ":focus-visible" "$file" || grep -q ":focus" "$file"; then
      echo -e "   ${GREEN}✓${NC} Focus styles present"
    else
      echo -e "   ${YELLOW}⚠${NC}  No focus styles found"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    # Check for reduced-motion
    if grep -q "prefers-reduced-motion" "$file"; then
      echo -e "   ${GREEN}✓${NC} Reduced motion support"
    else
      echo -e "   ${YELLOW}⚠${NC}  No reduced motion support"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    # Check for balanced braces
    OPEN_BRACES=$(grep -o "{" "$file" | wc -l)
    CLOSE_BRACES=$(grep -o "}" "$file" | wc -l)
    if [ $OPEN_BRACES -eq $CLOSE_BRACES ]; then
      echo -e "   ${GREEN}✓${NC} Balanced braces ($OPEN_BRACES opening, $CLOSE_BRACES closing)"
    else
      echo -e "   ${RED}✗${NC} Unbalanced braces ($OPEN_BRACES opening, $CLOSE_BRACES closing)"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    echo ""
  done
fi

# Validate JSON Files
if [ -n "$JSON_FILES" ]; then
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}📊 JSON VALIDATION${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  JQ_BIN=$(which jq 2>/dev/null || echo "")

  if [ -n "$JQ_BIN" ]; then
    for file in $JSON_FILES; do
      if [ ! -f "$file" ]; then
        echo -e "   ${RED}✗${NC} $file (not found)"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        continue
      fi

      echo -e "${BOLD}Validating: $file${NC}"

      if $JQ_BIN empty "$file" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Valid JSON syntax"
      else
        echo -e "   ${RED}✗${NC} Invalid JSON syntax"
        $JQ_BIN empty "$file" 2>&1 | head -5
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
      fi

      echo ""
    done
  else
    echo -e "${YELLOW}⚠  jq not found, skipping JSON validation${NC}"
    echo ""
  fi
fi

# Summary
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📊 VALIDATION SUMMARY${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""

if [ $TOTAL_ERRORS -eq 0 ] && [ $TOTAL_WARNINGS -eq 0 ]; then
  echo -e "   ${GREEN}✓ All validation checks passed!${NC}"
  echo ""
  exit 0
elif [ $TOTAL_ERRORS -eq 0 ]; then
  echo -e "   ${YELLOW}⚠${NC}  $TOTAL_WARNINGS warning(s) found"
  echo -e "   ${GREEN}✓${NC} No critical errors"
  echo ""
  exit 0
else
  echo -e "   ${RED}✗${NC} $TOTAL_ERRORS error(s) found"
  echo -e "   ${YELLOW}⚠${NC}  $TOTAL_WARNINGS warning(s) found"
  echo ""
  echo -e "   ${RED}Please fix errors before committing${NC}"
  echo ""
  exit 1
fi
