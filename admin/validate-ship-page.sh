#!/bin/bash
# ============================================================================
# Ship Page Validator — v3.010.300
#
# Validates ship pages against SHIP_PAGE_CHECKLIST_v3.010.md standards.
# Usage: ./admin/validate-ship-page.sh <path-to-ship-page.html>
#
# Exit codes:
#   0 = All checks passed
#   1 = Critical errors found (must fix)
#   2 = Warnings found (should fix)
#
# Soli Deo Gloria
# ============================================================================

# Don't use set -e as grep returns non-zero when no match found
# and arithmetic operations can return 0 which bash treats as failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
PASSES=0

# File to validate
FILE="$1"

if [ -z "$FILE" ]; then
    echo -e "${RED}Error: No file specified${NC}"
    echo "Usage: ./admin/validate-ship-page.sh <path-to-ship-page.html>"
    exit 1
fi

if [ ! -f "$FILE" ]; then
    echo -e "${RED}Error: File not found: $FILE${NC}"
    exit 1
fi

echo "============================================================================"
echo "  Ship Page Validator — v3.010.300"
echo "  File: $FILE"
echo "============================================================================"
echo ""

# Read file content
CONTENT=$(cat "$FILE")

# Helper functions
check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    PASSES=$((PASSES + 1))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

section_header() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
}

# ============================================================================
# Section 1: Theological Foundation (IMMUTABLE)
# ============================================================================
section_header "Section 1: Theological Foundation"

if echo "$CONTENT" | grep -q "Soli Deo Gloria"; then
    check_pass "Soli Deo Gloria invocation present"
else
    check_fail "CRITICAL: Soli Deo Gloria invocation MISSING (IMMUTABLE REQUIREMENT)"
fi

if echo "$CONTENT" | grep -q "Proverbs 3:5"; then
    check_pass "Proverbs 3:5 reference present"
else
    check_fail "CRITICAL: Proverbs 3:5 reference MISSING"
fi

if echo "$CONTENT" | grep -q "Colossians 3:23"; then
    check_pass "Colossians 3:23 reference present"
else
    check_fail "CRITICAL: Colossians 3:23 reference MISSING"
fi

# Check invocation is before line 20
INVOCATION_LINE=$(echo "$CONTENT" | grep -n "Soli Deo Gloria" | head -1 | cut -d: -f1)
if [ -n "$INVOCATION_LINE" ] && [ "$INVOCATION_LINE" -le 20 ]; then
    check_pass "Invocation before line 20 (line $INVOCATION_LINE)"
else
    check_warn "Invocation should be before line 20 (found at line $INVOCATION_LINE)"
fi

# ============================================================================
# Section 2: AI-Breadcrumbs
# ============================================================================
section_header "Section 2: AI-Breadcrumbs"

if echo "$CONTENT" | grep -q "<!-- ai-breadcrumbs"; then
    check_pass "AI-breadcrumbs comment block present"
else
    check_fail "AI-breadcrumbs comment block MISSING"
fi

# Check required fields
if echo "$CONTENT" | grep -q "entity:"; then
    # Check entity is not generic "Ship"
    if echo "$CONTENT" | grep -E "entity:\s*Ship\s*$" > /dev/null; then
        check_fail "entity field is generic 'Ship' — should be ship's proper name"
    else
        check_pass "entity field present with proper name"
    fi
else
    check_fail "entity field MISSING (required)"
fi

if echo "$CONTENT" | grep -q "type:"; then
    if echo "$CONTENT" | grep -q "type: Ship Information Page"; then
        check_pass "type field is 'Ship Information Page'"
    else
        check_warn "type field present but may not be 'Ship Information Page'"
    fi
else
    check_fail "type field MISSING (required)"
fi

if echo "$CONTENT" | grep -q "parent:"; then
    check_pass "parent field present"
else
    check_fail "parent field MISSING (required)"
fi

if echo "$CONTENT" | grep -q "category:"; then
    check_pass "category field present"
else
    check_fail "category field MISSING (required)"
fi

# Optional but recommended
for field in "cruise-line:" "ship-class:" "siblings:" "updated:" "answer-first:"; do
    if echo "$CONTENT" | grep -q "$field"; then
        check_pass "$field field present"
    else
        check_warn "$field field missing (recommended)"
    fi
done

# ============================================================================
# Section 3: ICP-Lite v1.0 Protocol
# ============================================================================
section_header "Section 3: ICP-Lite v1.0 Protocol"

if echo "$CONTENT" | grep -q 'name="ai-summary"'; then
    AI_SUMMARY=$(echo "$CONTENT" | grep -o 'name="ai-summary" content="[^"]*"' | sed 's/.*content="\([^"]*\)".*/\1/')
    SUMMARY_LEN=${#AI_SUMMARY}
    if [ "$SUMMARY_LEN" -le 250 ]; then
        check_pass "ai-summary present ($SUMMARY_LEN chars, under 250 limit)"
    else
        check_warn "ai-summary exceeds 250 chars ($SUMMARY_LEN chars)"
    fi
else
    check_fail "ai-summary meta tag MISSING (required)"
fi

if echo "$CONTENT" | grep -q 'name="last-reviewed"'; then
    if echo "$CONTENT" | grep -E 'name="last-reviewed" content="[0-9]{4}-[0-9]{2}-[0-9]{2}"' > /dev/null; then
        check_pass "last-reviewed present with ISO 8601 date"
    else
        check_warn "last-reviewed format may not be ISO 8601 (YYYY-MM-DD)"
    fi
else
    check_fail "last-reviewed meta tag MISSING (required)"
fi

if echo "$CONTENT" | grep -q 'content="ICP-Lite v1.0"'; then
    check_pass "content-protocol is 'ICP-Lite v1.0'"
else
    check_fail "content-protocol meta tag MISSING or incorrect (required)"
fi

# ============================================================================
# Section 4: HTML Structure
# ============================================================================
section_header "Section 4: HTML Structure"

if echo "$CONTENT" | head -1 | grep -q "<!doctype html>"; then
    check_pass "DOCTYPE on line 1"
else
    check_fail "DOCTYPE not on line 1"
fi

if echo "$CONTENT" | grep -q '<html lang="en"'; then
    check_pass "html lang=\"en\" present"
else
    check_fail "html lang=\"en\" MISSING"
fi

if echo "$CONTENT" | grep -q '<meta charset="utf-8"'; then
    check_pass "meta charset=\"utf-8\" present"
else
    check_fail "meta charset=\"utf-8\" MISSING"
fi

if echo "$CONTENT" | grep -q '<meta name="viewport"'; then
    check_pass "viewport meta present"
else
    check_fail "viewport meta MISSING"
fi

# Count H1 tags
H1_COUNT=$(echo "$CONTENT" | grep -c "<h1" || true)
if [ "$H1_COUNT" -eq 1 ]; then
    check_pass "Exactly 1 H1 tag present"
elif [ "$H1_COUNT" -eq 0 ]; then
    check_fail "No H1 tag found (required)"
else
    check_warn "Multiple H1 tags found ($H1_COUNT) — should be exactly 1"
fi

# ============================================================================
# Section 5: SEO Meta Tags
# ============================================================================
section_header "Section 5: SEO Meta Tags"

if echo "$CONTENT" | grep -q "<title>"; then
    check_pass "title tag present"
else
    check_fail "title tag MISSING"
fi

if echo "$CONTENT" | grep -q 'rel="canonical"'; then
    if echo "$CONTENT" | grep -q 'href="https://cruisinginthewake.com'; then
        check_pass "canonical URL is absolute with production hostname"
    else
        check_warn "canonical URL may not be absolute with production hostname"
    fi
else
    check_fail "canonical link MISSING"
fi

if echo "$CONTENT" | grep -q 'name="description"'; then
    check_pass "description meta present"
else
    check_fail "description meta MISSING"
fi

# OpenGraph
OG_TAGS=("og:type" "og:site_name" "og:title" "og:description" "og:url" "og:locale" "og:image")
for tag in "${OG_TAGS[@]}"; do
    if echo "$CONTENT" | grep -q "property=\"$tag\""; then
        check_pass "$tag present"
    else
        check_fail "$tag MISSING"
    fi
done

# Twitter Card
TWITTER_TAGS=("twitter:card" "twitter:title" "twitter:description" "twitter:image")
for tag in "${TWITTER_TAGS[@]}"; do
    if echo "$CONTENT" | grep -q "name=\"$tag\""; then
        check_pass "$tag present"
    else
        check_fail "$tag MISSING"
    fi
done

# ============================================================================
# Section 6: JSON-LD Structured Data
# ============================================================================
section_header "Section 6: JSON-LD Structured Data"

# Required schema types
SCHEMA_TYPES=("Organization" "WebSite" "BreadcrumbList" "Review" "Person" "WebPage" "FAQPage")
for schema in "${SCHEMA_TYPES[@]}"; do
    if echo "$CONTENT" | grep -q "\"@type\": \"$schema\""; then
        check_pass "JSON-LD $schema schema present"
    elif echo "$CONTENT" | grep -q "\"@type\":\"$schema\""; then
        check_pass "JSON-LD $schema schema present"
    else
        check_fail "JSON-LD $schema schema MISSING (required)"
    fi
done

# Check Review ratingValue is a number (not quoted)
if echo "$CONTENT" | grep -E '"ratingValue":\s*"[0-9]' > /dev/null; then
    check_fail "Review ratingValue is a STRING — must be NUMBER (no quotes)"
elif echo "$CONTENT" | grep -E '"ratingValue":\s*[0-9]' > /dev/null; then
    check_pass "Review ratingValue is a NUMBER"
fi

# Check BreadcrumbList has 4 items
BREADCRUMB_COUNT=$(echo "$CONTENT" | grep -c '"@type": "ListItem"' || true)
BREADCRUMB_COUNT2=$(echo "$CONTENT" | grep -c '"@type":"ListItem"' || true)
TOTAL_BREADCRUMBS=$((BREADCRUMB_COUNT + BREADCRUMB_COUNT2))
if [ "$TOTAL_BREADCRUMBS" -ge 4 ]; then
    check_pass "BreadcrumbList has $TOTAL_BREADCRUMBS items (4+ required)"
else
    check_warn "BreadcrumbList has $TOTAL_BREADCRUMBS items (4 recommended)"
fi

# Check FAQPage has 5 questions
FAQ_COUNT=$(echo "$CONTENT" | grep -c '"@type": "Question"' || true)
FAQ_COUNT2=$(echo "$CONTENT" | grep -c '"@type":"Question"' || true)
TOTAL_FAQ=$((FAQ_COUNT + FAQ_COUNT2))
if [ "$TOTAL_FAQ" -ge 5 ]; then
    check_pass "FAQPage has $TOTAL_FAQ questions (5 required)"
else
    check_warn "FAQPage has $TOTAL_FAQ questions (5 required)"
fi

# ============================================================================
# Section 7: WCAG Accessibility
# ============================================================================
section_header "Section 7: WCAG Accessibility"

if echo "$CONTENT" | grep -q 'class="skip-link"'; then
    check_pass "Skip link present"
else
    check_fail "Skip link MISSING (WCAG required)"
fi

if echo "$CONTENT" | grep -q 'role="status"' && echo "$CONTENT" | grep -q 'aria-live="polite"'; then
    check_pass "ARIA status live region present"
else
    check_warn "ARIA status live region missing"
fi

if echo "$CONTENT" | grep -q 'role="alert"' && echo "$CONTENT" | grep -q 'aria-live="assertive"'; then
    check_pass "ARIA alert live region present"
else
    check_warn "ARIA alert live region missing"
fi

if echo "$CONTENT" | grep -q 'role="banner"'; then
    check_pass "Header has role=\"banner\""
else
    check_warn "Header missing role=\"banner\""
fi

if echo "$CONTENT" | grep -q 'role="main"'; then
    check_pass "Main has role=\"main\""
else
    check_fail "Main missing role=\"main\" (WCAG required)"
fi

if echo "$CONTENT" | grep -q 'role="contentinfo"'; then
    check_pass "Footer has role=\"contentinfo\""
else
    check_warn "Footer missing role=\"contentinfo\""
fi

if echo "$CONTENT" | grep -q 'tabindex="-1"' | grep -q "main"; then
    check_pass "Main has tabindex=\"-1\""
fi

# Check for images without alt
IMG_WITHOUT_ALT=$(echo "$CONTENT" | grep -c '<img[^>]*[^"]>' | grep -v 'alt=' || echo "0")
if [ "$IMG_WITHOUT_ALT" -gt 0 ]; then
    check_warn "Some images may be missing alt attributes"
else
    check_pass "Images appear to have alt attributes"
fi

# ============================================================================
# Section 7b: Image Requirements (LOCAL IMAGES ONLY)
# ============================================================================
section_header "Section 7b: Image Requirements"

# Check for hotlinked images (external URLs in img src) - CRITICAL FAILURE
# Exclude: YouTube thumbnails, MarineTraffic embeds, CDN scripts
HOTLINKED_IMAGES=$(echo "$CONTENT" | grep -oE '<img[^>]+src="https?://[^"]+' | grep -v 'youtube\|marinetraffic\|cdn.jsdelivr\|googletagmanager' | wc -l || echo "0")
if [ "$HOTLINKED_IMAGES" -gt 0 ]; then
    check_fail "CRITICAL: $HOTLINKED_IMAGES hotlinked image(s) found — ALL images must be local"
    # Show the offending URLs
    echo "$CONTENT" | grep -oE '<img[^>]+src="https?://[^"]+' | grep -v 'youtube\|marinetraffic\|cdn.jsdelivr\|googletagmanager' | sed 's/.*src="/    → /' | head -5
else
    check_pass "All images use local paths (no hotlinking)"
fi

# Check that ship images exist in /assets/ships/
SHIP_IMAGES=$(echo "$CONTENT" | grep -oE 'src="/assets/ships/[^"]+' | sed 's/src="//' || true)
MISSING_IMAGES=0
for img in $SHIP_IMAGES; do
    FULL_PATH="$(dirname "$FILE")/../../$img"
    if [ ! -f "$FULL_PATH" ]; then
        # Try from repo root
        REPO_PATH="$(pwd)$img"
        if [ ! -f "$REPO_PATH" ]; then
            check_fail "Missing local image: $img"
            MISSING_IMAGES=$((MISSING_IMAGES + 1))
        fi
    fi
done
if [ "$MISSING_IMAGES" -eq 0 ] && [ -n "$SHIP_IMAGES" ]; then
    check_pass "All referenced ship images exist locally"
elif [ -z "$SHIP_IMAGES" ]; then
    check_warn "No ship images found in /assets/ships/"
fi

# ============================================================================
# Section 8: Performance
# ============================================================================
section_header "Section 8: Performance"

if echo "$CONTENT" | grep -q 'fetchpriority="high"'; then
    check_pass "LCP images have fetchpriority=\"high\""
else
    check_warn "No fetchpriority=\"high\" found for LCP images"
fi

if echo "$CONTENT" | grep -q 'loading="lazy"'; then
    check_pass "Lazy loading used for images"
else
    check_warn "No loading=\"lazy\" found"
fi

if echo "$CONTENT" | grep -q '?v=3.010'; then
    check_pass "Assets appear to be versioned"
else
    check_warn "Assets may not be versioned"
fi

# ============================================================================
# Section 9: Required Content Sections
# ============================================================================
section_header "Section 9: Required Content Sections"

REQUIRED_SECTIONS=(
    'id="first-look"'
    'id="ship-stats"'
    'id="dining-card"'
    'id="logbook"'
    'id="video-highlights"'
    'id="deck-plans"'
    'id="liveTrackHeading"'
    'id="faq-heading"'
)

SECTION_NAMES=(
    "First Look section"
    "Ship Stats section"
    "Dining section"
    "Logbook section"
    "Video section"
    "Deck Plans section"
    "Live Tracker section"
    "FAQ section"
)

for i in "${!REQUIRED_SECTIONS[@]}"; do
    if echo "$CONTENT" | grep -q "${REQUIRED_SECTIONS[$i]}"; then
        check_pass "${SECTION_NAMES[$i]} present"
    else
        check_fail "${SECTION_NAMES[$i]} MISSING"
    fi
done

# Check for ship-stats-fallback JSON
if echo "$CONTENT" | grep -q 'id="ship-stats-fallback"'; then
    check_pass "Ship stats JSON fallback present"
else
    check_warn "Ship stats JSON fallback missing"
fi

# Check for data-imo attribute
if echo "$CONTENT" | grep -q 'data-imo='; then
    check_pass "data-imo attribute present for live tracker"
else
    check_fail "data-imo attribute MISSING for live tracker"
fi

# ============================================================================
# Section 10: JavaScript Modules
# ============================================================================
section_header "Section 10: JavaScript Modules"

JS_PATTERNS=(
    "initFirstLook"
    "initShipLogbook"
    "initVideos"
    "initStats"
    "initDining"
    "initLiveTracker"
    "window._abs"
    "__swiperReady"
)

JS_NAMES=(
    "First Look carousel init"
    "Logbook loader"
    "Video loader"
    "Stats loader"
    "Dining loader"
    "Live tracker init"
    "URL normalizer"
    "Swiper loader"
)

for i in "${!JS_PATTERNS[@]}"; do
    if echo "$CONTENT" | grep -q "${JS_PATTERNS[$i]}"; then
        check_pass "${JS_NAMES[$i]} present"
    else
        check_warn "${JS_NAMES[$i]} may be missing"
    fi
done

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "============================================================================"
echo "  VALIDATION SUMMARY"
echo "============================================================================"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASSES"
echo -e "  ${RED}Errors:${NC}   $ERRORS"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}✗ VALIDATION FAILED — $ERRORS critical error(s) must be fixed${NC}"
    echo ""
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠ VALIDATION PASSED WITH WARNINGS — $WARNINGS item(s) should be addressed${NC}"
    echo ""
    exit 2
else
    echo -e "${GREEN}✓ VALIDATION PASSED — All checks passed!${NC}"
    echo ""
    exit 0
fi
