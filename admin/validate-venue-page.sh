#!/bin/bash
# =============================================================================
# Venue Page Validator — v1.1.0
# =============================================================================
# Validates venue/restaurant pages against the In the Wake standard.
# Based on superset analysis of existing venue pages (chops.html, windjammer.html, etc.)
#
# Usage: bash admin/validate-venue-page.sh <path-to-venue.html>
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    WARN_COUNT=$((WARN_COUNT + 1))
}

section_header() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# =============================================================================
# Input validation
# =============================================================================
if [ -z "$1" ]; then
    echo "Usage: $0 <venue-page.html>"
    exit 1
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
    echo "Error: File not found: $FILE"
    exit 1
fi

CONTENT=$(cat "$FILE")
FILENAME=$(basename "$FILE")
SLUG="${FILENAME%.html}"

echo "============================================================================"
echo "  Venue Page Validator — v1.1.0"
echo "  File: $FILE"
echo "============================================================================"

# =============================================================================
# Section 1: Theological Foundation
# =============================================================================
section_header "Section 1: Theological Foundation"

if echo "$CONTENT" | grep -qi "Soli Deo Gloria"; then
    check_pass "Soli Deo Gloria invocation present"
else
    check_fail "Soli Deo Gloria invocation MISSING"
fi

if echo "$CONTENT" | grep -q "Proverbs 3:5"; then
    check_pass "Proverbs 3:5 reference present"
else
    check_fail "Proverbs 3:5 reference MISSING"
fi

if echo "$CONTENT" | grep -q "Colossians 3:23"; then
    check_pass "Colossians 3:23 reference present"
else
    check_fail "Colossians 3:23 reference MISSING"
fi

# =============================================================================
# Section 2: AI-Breadcrumbs
# =============================================================================
section_header "Section 2: AI-Breadcrumbs"

if echo "$CONTENT" | grep -q "ai-breadcrumbs"; then
    check_pass "AI-breadcrumbs comment block present"
else
    check_fail "AI-breadcrumbs comment block MISSING"
fi

# Entity field - should not be generic
ENTITY=$(echo "$CONTENT" | grep -oP '(?<=entity:\s)[^\n]+' | head -1 | xargs)
if [ -n "$ENTITY" ] && [ "$ENTITY" != "Venue" ] && [ "$ENTITY" != "Restaurant" ]; then
    check_pass "entity field present: '$ENTITY'"
else
    check_fail "entity field MISSING or generic (should be venue's proper name)"
fi

# Type field - determine venue type for later checks
VENUE_TYPE=""
if echo "$CONTENT" | grep -qE "type:\s*(Restaurant|Dining)"; then
    VENUE_TYPE="dining"
    check_pass "type field present (Dining)"
elif echo "$CONTENT" | grep -qE "type:\s*(Bar|Lounge)"; then
    VENUE_TYPE="bar"
    check_pass "type field present (Bar/Lounge)"
elif echo "$CONTENT" | grep -qE "type:\s*Entertainment"; then
    VENUE_TYPE="entertainment"
    check_pass "type field present (Entertainment)"
elif echo "$CONTENT" | grep -qE "type:\s*Venue"; then
    VENUE_TYPE="venue"
    check_pass "type field present (Venue)"
else
    check_fail "type field MISSING (required: Restaurant/Dining, Bar/Lounge, Entertainment, Venue)"
fi

# Parent field
if echo "$CONTENT" | grep -q "parent:.*restaurants"; then
    check_pass "parent field present (/restaurants.html)"
else
    check_warn "parent field may be missing or incorrect"
fi

# Category field
if echo "$CONTENT" | grep -q "category:"; then
    check_pass "category field present"
else
    check_fail "category field MISSING"
fi

# Cruise-line field
if echo "$CONTENT" | grep -q "cruise-line:"; then
    check_pass "cruise-line field present"
else
    check_warn "cruise-line field missing (recommended)"
fi

# Updated field
if echo "$CONTENT" | grep -qE "updated:\s*[0-9]{4}-[0-9]{2}-[0-9]{2}"; then
    check_pass "updated field present with date"
else
    check_fail "updated field MISSING or invalid date format"
fi

# Answer-first field
if echo "$CONTENT" | grep -q "answer-first:"; then
    check_pass "answer-first field present"
else
    check_warn "answer-first field missing (recommended)"
fi

# =============================================================================
# Section 3: ICP-Lite v1.0 Protocol
# =============================================================================
section_header "Section 3: ICP-Lite v1.0 Protocol"

# ai-summary
AI_SUMMARY=$(echo "$CONTENT" | grep -oP '(?<=name="ai-summary" content=")[^"]+' | head -1)
if [ -n "$AI_SUMMARY" ]; then
    SUMMARY_LEN=${#AI_SUMMARY}
    if [ "$SUMMARY_LEN" -le 250 ]; then
        check_pass "ai-summary present ($SUMMARY_LEN chars, under 250 limit)"
    else
        check_warn "ai-summary too long ($SUMMARY_LEN chars, should be under 250)"
    fi
else
    check_fail "ai-summary meta tag MISSING"
fi

# last-reviewed
if echo "$CONTENT" | grep -qE 'name="last-reviewed" content="[0-9]{4}-[0-9]{2}-[0-9]{2}"'; then
    check_pass "last-reviewed present with ISO 8601 date"
else
    check_fail "last-reviewed meta tag MISSING or invalid date"
fi

# content-protocol
if echo "$CONTENT" | grep -q 'content="ICP-Lite v1.0"'; then
    check_pass "content-protocol is 'ICP-Lite v1.0'"
else
    check_fail "content-protocol meta tag MISSING or incorrect (required: ICP-Lite v1.0)"
fi

# =============================================================================
# Section 4: HTML Structure
# =============================================================================
section_header "Section 4: HTML Structure"

# DOCTYPE on line 1
FIRST_LINE=$(head -1 "$FILE")
if echo "$FIRST_LINE" | grep -qi "<!doctype html>"; then
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

# H1 count
H1_COUNT=$(echo "$CONTENT" | grep -c "<h1" || true)
if [ "$H1_COUNT" -eq 1 ]; then
    check_pass "Exactly 1 H1 tag present"
elif [ "$H1_COUNT" -eq 0 ]; then
    check_fail "No H1 tag found (required)"
else
    check_warn "Multiple H1 tags found ($H1_COUNT) — should be exactly 1"
fi

# =============================================================================
# Section 5: SEO Meta Tags
# =============================================================================
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
        check_warn "canonical URL may not be absolute"
    fi
else
    check_fail "canonical link MISSING"
fi

if echo "$CONTENT" | grep -q 'name="description"'; then
    check_pass "description meta present"
else
    check_fail "description meta MISSING"
fi

# Open Graph
OG_TAGS=("og:site_name" "og:type" "og:title" "og:url")
for tag in "${OG_TAGS[@]}"; do
    if echo "$CONTENT" | grep -q "property=\"$tag\""; then
        check_pass "$tag present"
    else
        check_fail "$tag MISSING"
    fi
done

if echo "$CONTENT" | grep -q 'name="twitter:card"'; then
    check_pass "twitter:card present"
else
    check_fail "twitter:card MISSING"
fi

# =============================================================================
# Section 6: JSON-LD Structured Data
# =============================================================================
section_header "Section 6: JSON-LD Structured Data"

if echo "$CONTENT" | grep -q '"@type":\s*"WebPage"' || echo "$CONTENT" | grep -q '"@type": "WebPage"'; then
    check_pass "JSON-LD WebPage schema present"
else
    check_fail "JSON-LD WebPage schema MISSING"
fi

if echo "$CONTENT" | grep -q '"@type":\s*"BreadcrumbList"' || echo "$CONTENT" | grep -q '"@type": "BreadcrumbList"'; then
    check_pass "JSON-LD BreadcrumbList schema present"
else
    check_fail "JSON-LD BreadcrumbList schema MISSING"
fi

if echo "$CONTENT" | grep -q '"@type":\s*"FAQPage"' || echo "$CONTENT" | grep -q '"@type": "FAQPage"'; then
    check_pass "JSON-LD FAQPage schema present"
    # Count questions
    FAQ_COUNT=$(echo "$CONTENT" | grep -c '"@type": "Question"' || true)
    FAQ_COUNT2=$(echo "$CONTENT" | grep -c '"@type":"Question"' || true)
    FAQ_COUNT=${FAQ_COUNT:-0}
    FAQ_COUNT2=${FAQ_COUNT2:-0}
    TOTAL_FAQ=$((FAQ_COUNT + FAQ_COUNT2))
    if [ "$TOTAL_FAQ" -ge 3 ]; then
        check_pass "FAQPage has $TOTAL_FAQ questions (3+ required)"
    else
        check_warn "FAQPage has only $TOTAL_FAQ questions (3+ recommended)"
    fi
else
    check_fail "JSON-LD FAQPage schema MISSING"
fi

if echo "$CONTENT" | grep -q '"@type":\s*"Person"' || echo "$CONTENT" | grep -q '"@type": "Person"'; then
    check_pass "JSON-LD Person/Author schema present"
else
    check_warn "JSON-LD Person/Author schema missing (recommended for E-E-A-T)"
fi

# =============================================================================
# Section 7: WCAG Accessibility
# =============================================================================
section_header "Section 7: WCAG Accessibility"

if echo "$CONTENT" | grep -q 'class="skip-link"'; then
    check_pass "Skip link present"
else
    check_fail "Skip link MISSING"
fi

if echo "$CONTENT" | grep -q 'role="status".*aria-live="polite"'; then
    check_pass "ARIA status live region present"
else
    check_warn "ARIA status live region missing"
fi

if echo "$CONTENT" | grep -q 'role="alert".*aria-live="assertive"'; then
    check_pass "ARIA alert live region present"
else
    check_warn "ARIA alert live region missing"
fi

if echo "$CONTENT" | grep -q 'role="banner"'; then
    check_pass "Header has role=\"banner\""
else
    check_warn "Header missing role=\"banner\""
fi

if echo "$CONTENT" | grep -q 'role="contentinfo"'; then
    check_pass "Footer has role=\"contentinfo\""
else
    check_warn "Footer missing role=\"contentinfo\""
fi

# =============================================================================
# Section 8: Required Content Sections
# =============================================================================
section_header "Section 8: Required Content Sections"

# Overview section
if echo "$CONTENT" | grep -q 'id="overview"'; then
    check_pass "Overview section (id=\"overview\") present"
else
    check_fail "Overview section MISSING"
fi

# Check for key overview elements
if echo "$CONTENT" | grep -q 'class="page-title"'; then
    check_pass "page-title class present in overview"
else
    check_warn "page-title class missing"
fi

if echo "$CONTENT" | grep -q 'class="answer-line"'; then
    check_pass "answer-line (Quick Answer) present"
else
    check_fail "answer-line (Quick Answer) MISSING"
fi

if echo "$CONTENT" | grep -q 'class="fit-guidance"'; then
    check_pass "fit-guidance (Best For) present"
else
    check_warn "fit-guidance (Best For) missing"
fi

if echo "$CONTENT" | grep -q 'class="key-facts"'; then
    check_pass "key-facts section present"
else
    check_fail "key-facts section MISSING"
fi

# Menu & Prices section
if echo "$CONTENT" | grep -q 'id="menu-prices"'; then
    check_pass "Menu & Prices section (id=\"menu-prices\") present"
else
    check_fail "Menu & Prices section MISSING"
fi

if echo "$CONTENT" | grep -q 'class="price-note"'; then
    check_pass "price-note present"
else
    check_warn "price-note missing"
fi

# Special Accommodations section
if echo "$CONTENT" | grep -q 'id="accommodations"'; then
    check_pass "Accommodations section (id=\"accommodations\") present"
else
    check_fail "Accommodations section MISSING"
fi

if echo "$CONTENT" | grep -q 'class="allergen-micro"'; then
    check_pass "allergen-micro note present"
else
    check_warn "allergen-micro note missing"
fi

# Availability section
if echo "$CONTENT" | grep -q 'id="availability"'; then
    check_pass "Availability section (id=\"availability\") present"
else
    check_fail "Availability section MISSING"
fi

# Logbook section
if echo "$CONTENT" | grep -q 'id="logbook"'; then
    check_pass "Logbook section (id=\"logbook\") present"
    # Check for review rating
    if echo "$CONTENT" | grep -qE '[0-9]\.[0-9]\s*★|[0-9]\.[0-9]/5'; then
        check_pass "Review rating present in logbook"
    else
        check_warn "Review rating not found in logbook"
    fi
else
    check_fail "Logbook section MISSING"
fi

# FAQ section
if echo "$CONTENT" | grep -q 'id="faq"'; then
    check_pass "FAQ section (id=\"faq\") present"
    # Count details elements
    DETAILS_COUNT=$(echo "$CONTENT" | grep -c '<details' || echo "0")
    if [ "$DETAILS_COUNT" -ge 3 ]; then
        check_pass "FAQ has $DETAILS_COUNT expandable items (3+ required)"
    else
        check_warn "FAQ has only $DETAILS_COUNT items (3+ recommended)"
    fi
else
    check_fail "FAQ section MISSING"
fi

# Sources section
if echo "$CONTENT" | grep -q 'id="sources"'; then
    check_pass "Sources section (id=\"sources\") present"
else
    check_fail "Sources section MISSING"
fi

# =============================================================================
# Section 8b: Entertainment Venue Content Depth (if applicable)
# =============================================================================
if [ "$VENUE_TYPE" = "entertainment" ]; then
    section_header "Section 8b: Entertainment Venue Content Depth"

    # Count show cards
    SHOW_CARD_COUNT=$(echo "$CONTENT" | grep -c 'class="show-card"\|id="show-' || true)
    if [ "$SHOW_CARD_COUNT" -ge 3 ]; then
        check_pass "Has $SHOW_CARD_COUNT show/experience cards (3+ required)"
    elif [ "$SHOW_CARD_COUNT" -ge 1 ]; then
        check_warn "Only $SHOW_CARD_COUNT show/experience card(s) (3+ recommended)"
    else
        check_fail "No show/experience cards found (entertainment venues require show cards)"
    fi

    # Check for ship assignments in show cards
    if echo "$CONTENT" | grep -q 'Ships:.*href="/ships/'; then
        check_pass "Show cards include ship assignments with links"
    else
        check_warn "Show cards missing ship assignment links"
    fi

    # Check for runtime/duration info
    if echo "$CONTENT" | grep -qi 'Runtime:\|Duration:\|~[0-9]\+ minutes'; then
        check_pass "Show runtime/duration information present"
    else
        check_warn "Show runtime/duration information missing"
    fi

    # Check for show reviews with ratings
    SHOW_REVIEW_COUNT=$(echo "$CONTENT" | grep -c 'class="show-review"\|<summary>.*Guest Review.*★' || true)
    if [ "$SHOW_REVIEW_COUNT" -ge 3 ]; then
        check_pass "Has $SHOW_REVIEW_COUNT show reviews (3+ required)"
    elif [ "$SHOW_REVIEW_COUNT" -ge 1 ]; then
        check_warn "Only $SHOW_REVIEW_COUNT show review(s) (3+ recommended)"
    else
        check_fail "No show reviews found (entertainment venues require per-show reviews)"
    fi

    # Check for technology features section
    if echo "$CONTENT" | grep -qi 'Technology Features\|<h3>Technology\|<h4>.*Technology'; then
        check_pass "Technology features section present"
    else
        check_warn "Technology features section missing (recommended for entertainment venues)"
    fi

    # Check for daytime programming
    if echo "$CONTENT" | grep -qi 'Daytime Programming\|Daytime.*Activities'; then
        check_pass "Daytime programming section present"
    else
        check_warn "Daytime programming section missing"
    fi
fi

# =============================================================================
# Section 9: Right Rail / Author Card
# =============================================================================
section_header "Section 9: Right Rail & Author"

if echo "$CONTENT" | grep -q 'class="rail"'; then
    check_pass "Right rail (aside.rail) present"
else
    check_warn "Right rail missing"
fi

if echo "$CONTENT" | grep -q 'author-card'; then
    check_pass "Author card present"
else
    check_warn "Author card missing"
fi

# =============================================================================
# Section 10: Performance & Scripts
# =============================================================================
section_header "Section 10: Performance & Scripts"

if echo "$CONTENT" | grep -q 'fetchpriority="high"'; then
    check_pass "fetchpriority=\"high\" found for LCP images"
else
    check_warn "No fetchpriority=\"high\" found for LCP optimization"
fi

if echo "$CONTENT" | grep -q 'loading="lazy"'; then
    check_pass "Lazy loading used for images"
else
    check_warn "No lazy loading found"
fi

if echo "$CONTENT" | grep -q "serviceWorker"; then
    check_pass "Service worker registration present"
else
    check_warn "Service worker registration missing"
fi

if echo "$CONTENT" | grep -q "_abs\s*=\|window._abs"; then
    check_pass "URL normalizer script present"
else
    check_warn "URL normalizer script missing"
fi

# =============================================================================
# Section 11: Navigation
# =============================================================================
section_header "Section 11: Navigation"

if echo "$CONTENT" | grep -q 'class="nav-toggle"'; then
    check_pass "Mobile nav-toggle (hamburger) present"
else
    check_fail "Mobile nav-toggle MISSING"
fi

if echo "$CONTENT" | grep -q 'id="site-nav"'; then
    check_pass "site-nav element present"
else
    check_fail "site-nav element MISSING"
fi

if echo "$CONTENT" | grep -q 'class="nav-dropdown"'; then
    check_pass "Dropdown menus present"
else
    check_warn "Dropdown menus not found"
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "============================================================================"
echo "  VALIDATION SUMMARY"
echo "============================================================================"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASS_COUNT"
echo -e "  ${RED}Errors:${NC}   $FAIL_COUNT"
echo -e "  ${YELLOW}Warnings:${NC} $WARN_COUNT"
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}✗ VALIDATION FAILED — $FAIL_COUNT critical error(s) must be fixed${NC}"
    exit 1
elif [ "$WARN_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ VALIDATION PASSED WITH WARNINGS — $WARN_COUNT item(s) should be addressed${NC}"
    exit 2
else
    echo -e "${GREEN}✓ VALIDATION PASSED — All checks passed${NC}"
    exit 0
fi
