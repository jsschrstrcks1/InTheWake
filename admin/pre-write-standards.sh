#!/bin/bash
# Pre-write standards checker for Claude
# Usage: ./pre-write-standards.sh <file1> <file2> ...
# Shows relevant standards before modifying files

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

# Detect file types
HTML_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.html$' || true)
JS_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.js$' || true)
CSS_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.css$' || true)
JSON_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.json$' || true)
MD_FILES=$(echo "$FILES" | tr ' ' '\n' | grep '\.md$' || true)

# Function to show a standard
show_standard() {
  local title="$1"
  local content="$2"

  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${BLUE}${title}${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${content}"
}

# Header
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📋 PRE-WRITE STANDARDS REFERENCE${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"

# HTML Files Standards
if [ -n "$HTML_FILES" ]; then
  show_standard "🌐 HTML FILES STANDARDS" "$(cat << 'EOF'
✝️ Invocation (IMMUTABLE - Top Priority)
   Required comment at top of every HTML file:
   <!--
   Soli Deo Gloria
   All work on this project is offered as a gift to God.
   "Trust in the LORD with all your heart..." — Proverbs 3:5
   "Whatever you do, work heartily..." — Colossians 3:23
   -->

📝 ICP-Lite v1.0 Protocol (Required)
   <meta name="ai-summary" content="Brief description"/>
   <meta name="last-reviewed" content="YYYY-MM-DD"/>
   <meta name="content-protocol" content="ICP-Lite v1.0"/>

🎯 AI-Breadcrumbs (Entity pages only)
   <!-- ai-breadcrumbs
   entity: Ship|Port|Restaurant
   name: Entity Name
   parent: /parent-url.html
   siblings: Related entities
   subject: What this page is about
   intended-reader: Who should read this
   core-facts: Key information
   decisions-informed: What users can decide
   updated: YYYY-MM-DD
   -->

♿ WCAG 2.1 AA Accessibility (Required)
   • Skip links: <a href="#main" class="skip-link">Skip to main content</a>
   • ARIA landmarks: role="banner", role="main", role="navigation"
   • Heading hierarchy: h1 → h2 → h3 (no skipping)
   • Alt text on ALL images
   • Form labels associated with inputs
   • Focus-visible styles on interactive elements

🏗️ Structure (Required)
   • <!doctype html>
   • <html lang="en">
   • Viewport meta tag
   • Canonical URL
   • Version number in comments or meta tag

🎨 Navigation Pattern (If nav present)
   • .nav-group class for dropdowns
   • data-open="false" attribute
   • .submenu with z-index: 10000
   • CSS selector: .nav-group[data-open="true"] > .submenu
EOF
)"
fi

# JavaScript Files Standards
if [ -n "$JS_FILES" ]; then
  show_standard "⚙️ JAVASCRIPT FILES STANDARDS" "$(cat << 'EOF'
📐 Code Quality (Required)
   • "use strict"; at top of functions
   • Single quotes for strings
   • 2-space indentation
   • Semicolons required
   • No trailing commas

🔒 Security (Critical)
   • NO console.log in production code
   • NO debugger statements
   • NO eval() or Function()
   • NO credentials, API keys, tokens
   • NO commented-out code blocks

🎯 Best Practices
   • const/let (not var)
   • Arrow functions where appropriate
   • Descriptive variable names
   • Comments for complex logic only
   • Error handling for async operations

📱 DOM Manipulation
   • Check element exists before accessing
   • Use querySelector/querySelectorAll
   • Event delegation for dynamic content
   • Remove event listeners when done

🔄 Service Worker (sw.js only)
   • Update VERSION constant
   • Test offline functionality
   • Clear old caches if structure changed
   • Document breaking changes
EOF
)"
fi

# CSS Files Standards
if [ -n "$CSS_FILES" ]; then
  show_standard "🎨 CSS FILES STANDARDS" "$(cat << 'EOF'
♿ Accessibility (Required)
   • WCAG 2.1 AA contrast: 4.5:1 for text, 3:1 for large text
   • Focus-visible on ALL interactive elements
   • :focus-visible { outline: 2px solid; }
   • Respect prefers-reduced-motion
   • NO content via CSS (use aria-label)

📱 Responsive Design
   • Mobile-first approach
   • Flexible units: rem, em, %, vh/vw
   • Avoid fixed pixel widths
   • Min tap target: 44px
   • Media queries for breakpoints

🎯 Best Practices
   • Use CSS custom properties (--var-name)
   • Logical properties (margin-inline, padding-block)
   • Avoid !important unless absolutely necessary
   • z-index scale: 0 (base) → 10000 (skip link/dropdowns)
   • Comments for complex selectors
EOF
)"
fi

# JSON Files Standards
if [ -n "$JSON_FILES" ]; then
  show_standard "📊 JSON FILES STANDARDS" "$(cat << 'EOF'
📋 Data Contract
   • Valid JSON syntax (no trailing commas)
   • Consistent key naming: camelCase
   • Version field for schemas
   • Required fields documented

🔍 Validation
   • Use jq to validate before committing
   • Proper escaping of special characters
   • UTF-8 encoding
   • No comments (use separate docs)

🎯 Structure
   • Arrays for ordered data
   • Objects for key-value pairs
   • Null for missing values (not empty string)
   • ISO 8601 for dates: "YYYY-MM-DD"
EOF
)"
fi

# Markdown Files Standards
if [ -n "$MD_FILES" ]; then
  show_standard "📚 MARKDOWN FILES STANDARDS" "$(cat << 'EOF'
📝 Documentation
   • Clear, concise language
   • Active voice preferred
   • Code blocks with language tags
   • Table of contents for >200 lines

🎯 Structure
   • # Title (one H1 only)
   • ## Sections
   • ### Subsections
   • Lists for related items
   • Tables for structured data
EOF
)"
fi

# Universal Standards
show_standard "🌟 UNIVERSAL STANDARDS (ALL FILES)" "$(cat << 'EOF'
✝️ Theological Foundation
   "Whatever you do, work heartily, as for the Lord and not for men."
   - Colossians 3:23

   All work offered as worship to God.
   Standards exist to honor Him through excellence.

🔒 Security Checklist
   ❌ NO API keys, tokens, credentials
   ❌ NO console.log, debugger in production
   ❌ NO commented-out code
   ❌ NO TODO without issue reference
   ❌ NO hardcoded secrets

🎯 Code Philosophy
   • Simple over clever
   • Readable over compact
   • Explicit over implicit
   • Consistent over custom
   • Accessible over flashy

📏 Formatting
   • 2-space indentation (JS, CSS, HTML)
   • UTF-8 encoding
   • Unix line endings (LF)
   • No trailing whitespace
   • Newline at end of file
EOF
)"

# Show files about to be modified
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}📝 FILES TO BE MODIFIED${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""
for file in $FILES; do
  if [ -f "$file" ]; then
    echo -e "   ${GREEN}✓${NC} $file (exists)"
  else
    echo -e "   ${YELLOW}+${NC} $file (new file)"
  fi
done
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════${NC}"
echo ""

exit 0
