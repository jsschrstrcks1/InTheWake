#!/bin/bash
# ============================================================================
# Ship Page Validator — v3.010.301
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

# Exclusion list: files that live in ships/ but are NOT ship pages
EXCLUDED_FILES="ships/rcl/venues.html"
BASENAME=$(echo "$FILE" | sed 's|.*/ships/|ships/|')
for EXCL in $EXCLUDED_FILES; do
    if [ "$BASENAME" = "$EXCL" ]; then
        echo -e "${YELLOW}Skipped: $FILE is in the exclusion list (not a ship page)${NC}"
        exit 0
    fi
done

echo "============================================================================"
echo "  Ship Page Validator — v3.010.301"
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
    # entity: Ship is CORRECT per spec (name: field carries the ship name)
    check_pass "entity field present"
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

if echo "$CONTENT" | grep -qE 'content="ICP-Lite v1\.(0|4)"'; then
    check_pass "content-protocol is ICP-Lite v1.x"
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

# Check for duplicate class attributes on same element (v2.3 external review)
DUPE_CLASS_COUNT=$(echo "$CONTENT" | grep -cE 'class="[^"]*"[^>]*class="' || echo "0")
if [ "$DUPE_CLASS_COUNT" -gt 0 ]; then
    check_warn "$DUPE_CLASS_COUNT element(s) have duplicate class attributes — second class is silently ignored"
else
    check_pass "No duplicate class attributes"
fi

# Check footer copyright year is current
CURRENT_YEAR=$(date +%Y)
FOOTER_YEAR=$(echo "$CONTENT" | grep -oE '©\s*[0-9]{4}|&copy;\s*[0-9]{4}' | grep -oE '[0-9]{4}' | tail -1)
if [ -z "$FOOTER_YEAR" ]; then
    check_warn "No copyright year found in footer"
elif [ "$FOOTER_YEAR" -lt "$CURRENT_YEAR" ]; then
    check_warn "Footer copyright year ($FOOTER_YEAR) is out of date — should be $CURRENT_YEAR"
else
    check_pass "Footer copyright year is current ($FOOTER_YEAR)"
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

# v2.3: Check for (V1.Beta) in title
if echo "$CONTENT" | grep -q '(V1\.Beta)'; then
    check_warn "Title contains (V1.Beta) — signals unfinished site to users and AI"
else
    check_pass "No beta tag in title"
fi

# v2.3: Check for V1.Beta navbar version badge
if echo "$CONTENT" | grep -q 'version-badge.*V1\.Beta\|V1\.Beta.*version-badge'; then
    check_warn "Navbar contains V1.Beta version badge — remove for production"
else
    check_pass "No V1.Beta navbar badge"
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

# v2.3: Check for generic/templated reviewBody text
if echo "$CONTENT" | grep -q 'offers memorable cruise experiences with excellent amenities'; then
    check_warn "Review contains generic templated text — reviewBody should reflect real editorial assessment"
else
    check_pass "reviewBody is not generic template text"
fi

# v2.3: Flag unverified ratingValue (all current ratings need editorial verification)
if echo "$CONTENT" | grep -qE '"ratingValue":\s*[0-9]'; then
    RATING_VAL=$(echo "$CONTENT" | grep -oE '"ratingValue":\s*[0-9.]+' | head -1 | grep -oE '[0-9.]+$')
    check_warn "Review has ratingValue $RATING_VAL — must be based on real editorial assessment, not templated"
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

# v2.3: Check for aria-hidden on SDG footer dedication (should be accessible)
if echo "$CONTENT" | grep -q 'aria-hidden="true".*Soli Deo Gloria\|Soli Deo Gloria.*aria-hidden="true"'; then
    check_warn "Soli Deo Gloria footer dedication has aria-hidden=\"true\" — should be accessible to all users"
else
    check_pass "SDG footer not hidden from assistive technology"
fi

# Check for images without alt (join lines to handle multiline img tags)
IMG_WITHOUT_ALT=$(echo "$CONTENT" | tr '\n' ' ' | grep -oE '<img [^>]+>' | grep -cv 'alt=' || echo "0")
if [ "$IMG_WITHOUT_ALT" -gt 0 ]; then
    check_warn "$IMG_WITHOUT_ALT image(s) missing alt attributes"
else
    check_pass "All images have alt attributes"
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
# Strip ?v= query strings before checking file existence
# Use while-read to handle filenames with spaces
MISSING_IMAGES=0
SHIP_IMAGE_COUNT=0
while IFS= read -r img; do
    [ -z "$img" ] && continue
    SHIP_IMAGE_COUNT=$((SHIP_IMAGE_COUNT + 1))
    FULL_PATH="$(dirname "$FILE")/../../$img"
    if [ ! -f "$FULL_PATH" ]; then
        # Try from repo root
        REPO_PATH="$(pwd)$img"
        if [ ! -f "$REPO_PATH" ]; then
            check_fail "Missing local image: $img"
            MISSING_IMAGES=$((MISSING_IMAGES + 1))
        fi
    fi
done <<< "$(echo "$CONTENT" | grep -oE 'src="/assets/ships/[^"]+' | sed 's/src="//; s/\?v=[^"]*$//' || true)"
if [ "$MISSING_IMAGES" -eq 0 ] && [ "$SHIP_IMAGE_COUNT" -gt 0 ]; then
    check_pass "All referenced ship images exist locally"
elif [ "$SHIP_IMAGE_COUNT" -eq 0 ]; then
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

# Accept both RCL-style and Carnival-style section IDs
check_section() {
    local name="$1"
    shift
    for pattern in "$@"; do
        if echo "$CONTENT" | grep -qE "$pattern"; then
            check_pass "$name present"
            return 0
        fi
    done
    check_fail "$name MISSING"
    return 1
}

check_section "First Look section" 'id="first-look"' 'id="overview-title"'
check_section "Ship Stats section" 'id="ship-stats"' 'class="stats-grid"'
check_section "Dining section" 'id="dining-card"' 'id="diningHeading"'
check_section "Logbook section" 'id="logbook"' 'id="logbook-title"' 'id="logbook-entries"'
check_section "Video section" 'id="video-highlights"' 'id="videos-title"' 'id="video-swiper"'
check_section "Deck Plans section" 'id="deck-plans"' 'id="deck-title"'
check_section "Live Tracker section" 'id="liveTrackHeading"' 'id="tracker-title"' 'class="tracker-frame"'
check_section "FAQ section" 'id="faq-heading"' 'id="faq-title"' 'class="faq-item"'

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

# Retired ship: logbook must have TWO types of static eulogy entries:
#   1. Editorial eulogy — the site's tribute to the ship (attributed to "In the Wake editorial")
#   2. Guest experience — a named passenger's personal story (attributed to a real person)
# Both must be static HTML, not noscript-only (invisible to JS users).
# This is how we honour retired vessels: the ship's service AND the people who sailed her.
if echo "$CONTENT" | grep -q "status: Retired Ship"; then
    STATIC_HTML=$(echo "$CONTENT" | awk '
        /<script[ >]/ && /<\/script/ { next }
        /<script[ >]/ { in_script=1; next }
        /<\/script/   { in_script=0; next }
        /<noscript/ && /<\/noscript/ { next }
        /<noscript/   { in_noscript=1; next }
        /<\/noscript/ { in_noscript=0; next }
        !in_script && !in_noscript { print }
    ')

    # Check 1: Editorial eulogy — the site's tribute to the ship
    if echo "$STATIC_HTML" | grep -q 'In the Wake editorial'; then
        check_pass "Retired ship: editorial eulogy present"
    else
        check_fail "Retired ship: editorial eulogy MISSING — needs a static editorial tribute to the ship's service"
    fi

    # Check 2: Guest experience — a named passenger's personal story
    GUEST_BYLINES=$(echo "$STATIC_HTML" | grep 'class="tiny">—' | grep -cv 'In the Wake' || echo "0")
    if [ "$GUEST_BYLINES" -gt 0 ]; then
        check_pass "Retired ship: guest experience story present"
    else
        check_fail "Retired ship: guest experience story MISSING — needs at least one named passenger's story"
    fi
fi

# ============================================================================
# Section 9b: First Look Carousel Images
# ============================================================================
section_header "Section 9b: First Look Carousel Images"

# Count actual images inside the firstlook swiper (not in scripts)
FIRSTLOOK_IMGS=$(echo "$CONTENT" | sed -n '/swiper firstlook/,/swiper-pagination/p' | grep -cE '<img[ >]|<img$' || echo "0")
if [ "$FIRSTLOOK_IMGS" -ge 1 ]; then
    check_pass "First Look carousel has $FIRSTLOOK_IMGS image(s)"
else
    check_fail "First Look carousel has NO images — carousel will render empty"
fi

# ============================================================================
# Section 9c: Sister Ships Completeness
# ============================================================================
section_header "Section 9c: Sister Ships Consistency"

# Extract siblings from ai-breadcrumbs
BREADCRUMB_SIBLINGS=$(echo "$CONTENT" | grep -oP 'siblings:\s*\K.*' | head -1 | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -c '\.html' || echo "0")

# Count sister ship pills in the HTML
SISTER_PILLS=$(echo "$CONTENT" | sed -n '/related-ships/,/See All Ships/p' | grep -c 'class="pill"' || echo "0")

if [ "$BREADCRUMB_SIBLINGS" -gt 0 ] && [ "$SISTER_PILLS" -gt 0 ]; then
    if [ "$BREADCRUMB_SIBLINGS" -eq "$SISTER_PILLS" ]; then
        check_pass "Sister ships match: $BREADCRUMB_SIBLINGS in breadcrumbs, $SISTER_PILLS in pills"
    else
        check_fail "Sister ship MISMATCH: $BREADCRUMB_SIBLINGS in ai-breadcrumbs vs $SISTER_PILLS in pill links"
    fi
elif [ "$BREADCRUMB_SIBLINGS" -gt 0 ] && [ "$SISTER_PILLS" -eq 0 ]; then
    check_fail "ai-breadcrumbs lists $BREADCRUMB_SIBLINGS siblings but no pill links found"
elif [ "$SISTER_PILLS" -gt 0 ] && [ "$BREADCRUMB_SIBLINGS" -eq 0 ]; then
    check_warn "$SISTER_PILLS sister pill links but no siblings in ai-breadcrumbs"
fi

# Check that FAQ answer about same-class ships mentions all siblings from breadcrumbs
if [ "$BREADCRUMB_SIBLINGS" -gt 0 ]; then
    SIBLINGS_LIST=$(echo "$CONTENT" | grep -oP 'siblings:\s*\K.*' | head -1)
    FAQ_CLASS_ANSWER=$(echo "$CONTENT" | tr '\n' ' ' | grep -oP 'Which ships are in the same class.*?</details>' | head -1)
    MISSING_IN_FAQ=0
    while IFS= read -r sibling_url; do
        [ -z "$sibling_url" ] && continue
        SIBLING_SLUG=$(echo "$sibling_url" | grep -oP '[^/]+\.html' | sed 's/\.html//')
        [ -z "$SIBLING_SLUG" ] && continue
        if ! echo "$FAQ_CLASS_ANSWER" | grep -qi "$SIBLING_SLUG"; then
            # Convert slug to readable name for display
            READABLE=$(echo "$SIBLING_SLUG" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
            check_warn "FAQ 'same class' answer may be missing sister: $READABLE"
            MISSING_IN_FAQ=$((MISSING_IN_FAQ + 1))
        fi
    done <<< "$(echo "$SIBLINGS_LIST" | tr ',' '\n' | sed 's/^ *//;s/ *$//')"
    if [ "$MISSING_IN_FAQ" -eq 0 ]; then
        check_pass "FAQ 'same class' answer mentions all sisters from breadcrumbs"
    fi
fi

# ============================================================================
# Section 9d: Image File Existence
# ============================================================================
section_header "Section 9d: Image File Existence (all src paths)"

# Get repo root (walk up from the file being validated)
REPO_ROOT=$(cd "$(dirname "$FILE")" && git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$(dirname "$FILE")/../.." && pwd)")

MISSING_IMG_COUNT=0
CHECKED_IMG_COUNT=0
while IFS= read -r img_path; do
    [ -z "$img_path" ] && continue
    # Strip query strings
    CLEAN_PATH=$(echo "$img_path" | sed 's/\?.*$//')
    FULL="${REPO_ROOT}${CLEAN_PATH}"
    CHECKED_IMG_COUNT=$((CHECKED_IMG_COUNT + 1))
    if [ ! -f "$FULL" ]; then
        check_fail "Image not found on disk: $CLEAN_PATH"
        MISSING_IMG_COUNT=$((MISSING_IMG_COUNT + 1))
    fi
done <<< "$(echo "$CONTENT" | grep -oP 'src="/assets/[^"]+\.(webp|jpg|jpeg|png|svg)(\?[^"]*)?"' | sed 's/src="//;s/"$//' | sort -u)"

# Also check srcset paths
while IFS= read -r img_path; do
    [ -z "$img_path" ] && continue
    CLEAN_PATH=$(echo "$img_path" | sed 's/\?.*$//')
    FULL="${REPO_ROOT}${CLEAN_PATH}"
    CHECKED_IMG_COUNT=$((CHECKED_IMG_COUNT + 1))
    if [ ! -f "$FULL" ]; then
        check_fail "srcset image not found on disk: $CLEAN_PATH"
        MISSING_IMG_COUNT=$((MISSING_IMG_COUNT + 1))
    fi
done <<< "$(echo "$CONTENT" | grep -oP 'srcset="/assets/[^"]+\.(webp|jpg|jpeg|png|svg)(\?[^"]*)?"' | sed 's/srcset="//;s/"$//' | sort -u)"

if [ "$MISSING_IMG_COUNT" -eq 0 ] && [ "$CHECKED_IMG_COUNT" -gt 0 ]; then
    check_pass "All $CHECKED_IMG_COUNT image paths verified on disk"
elif [ "$CHECKED_IMG_COUNT" -eq 0 ]; then
    check_warn "No /assets/ image paths found to verify"
fi

# ============================================================================
# Section 9e: Dining Venue Database Check
# ============================================================================
section_header "Section 9e: Dining Venue Database"

# Get the ship slug from the dining card
SHIP_SLUG=$(echo "$CONTENT" | grep -oP 'data-slug="[^"]+' | head -1 | sed 's/data-slug="//')
if [ -z "$SHIP_SLUG" ]; then
    SHIP_SLUG=$(echo "$CONTENT" | grep -oP '"ship_slug":"[^"]+' | head -1 | sed 's/"ship_slug":"//')
fi

VENUES_JSON="${REPO_ROOT}/assets/data/venues.json"
if [ -n "$SHIP_SLUG" ] && [ -f "$VENUES_JSON" ]; then
    # Check if ship exists in venues.json
    VENUE_COUNT=$(python3 -c "
import json,sys
try:
    d=json.load(open('$VENUES_JSON'))
    ship=d.get('ships',{}).get('$SHIP_SLUG',{})
    venues=ship.get('venues',[])
    print(len(venues))
except:
    print('0')
" 2>/dev/null || echo "0")

    SPECIALTY_COUNT=$(python3 -c "
import json,sys
try:
    d=json.load(open('$VENUES_JSON'))
    ship=d.get('ships',{}).get('$SHIP_SLUG',{})
    venue_slugs=ship.get('venues',[])
    venues_db={v['slug']:v for v in d.get('venues',[])}
    specialties=[s for s in venue_slugs if venues_db.get(s,{}).get('category')=='specialty']
    print(len(specialties))
except:
    print('0')
" 2>/dev/null || echo "0")

    if [ "$VENUE_COUNT" -gt 0 ]; then
        check_pass "Ship '$SHIP_SLUG' has $VENUE_COUNT venues in venues.json ($SPECIALTY_COUNT specialty)"
    else
        check_fail "Ship '$SHIP_SLUG' has NO venues in venues.json — dining section will render empty"
    fi

    # Check if FAQ mentions venues not in the database
    FAQ_DINING_ANSWER=$(echo "$CONTENT" | tr '\n' ' ' | grep -oP 'What dining options.*?</details>' | head -1)
    if [ -n "$FAQ_DINING_ANSWER" ]; then
        MENTIONED_VENUES=0
        NOT_IN_DB=0
        for venue_name in "150 Central Park" "Johnny Rockets" "Bionic Bar" "Pesky Parrot" "Boleros"; do
            if echo "$FAQ_DINING_ANSWER" | grep -qi "$venue_name"; then
                MENTIONED_VENUES=$((MENTIONED_VENUES + 1))
                # Check if this venue exists in the database (by searching all venue names)
                FOUND_IN_DB=$(python3 -c "
import json
d=json.load(open('$VENUES_JSON'))
name='$venue_name'.lower()
found=any(name in v.get('name','').lower() for v in d.get('venues',[]))
print('yes' if found else 'no')
" 2>/dev/null || echo "no")
                if [ "$FOUND_IN_DB" = "no" ]; then
                    check_warn "FAQ mentions '$venue_name' but it's not in venues.json — dining loader won't render it"
                    NOT_IN_DB=$((NOT_IN_DB + 1))
                fi
            fi
        done
        if [ "$MENTIONED_VENUES" -gt 0 ] && [ "$NOT_IN_DB" -eq 0 ]; then
            check_pass "All FAQ-mentioned premium venues exist in the database"
        fi
    fi
else
    if [ -z "$SHIP_SLUG" ]; then
        check_warn "Could not detect ship slug for venue database check"
    elif [ ! -f "$VENUES_JSON" ]; then
        check_warn "venues.json not found at $VENUES_JSON"
    fi
fi

# ============================================================================
# Section 9f: Skip Link Target Consistency
# ============================================================================
section_header "Section 9f: Skip Link Target"

SKIP_TARGET=$(echo "$CONTENT" | grep -oP 'href="#[^"]+[^>]*class="skip-link"|class="skip-link"[^>]*href="#[^"]+"' | grep -oP '#[a-zA-Z0-9_-]+' | head -1)
MAIN_ID=$(echo "$CONTENT" | grep -oP '<main[^>]+id="[^"]+' | grep -oP 'id="[^"]+' | sed 's/id="//' | head -1)
if [ -n "$SKIP_TARGET" ] && [ -n "$MAIN_ID" ]; then
    if [ "$SKIP_TARGET" = "#$MAIN_ID" ]; then
        check_pass "Skip link target ($SKIP_TARGET) matches main element ID"
    else
        check_fail "Skip link target ($SKIP_TARGET) does NOT match main element ID (#$MAIN_ID)"
    fi
elif [ -z "$SKIP_TARGET" ]; then
    check_warn "Skip link href not detected"
elif [ -z "$MAIN_ID" ]; then
    check_warn "Main element ID not detected"
fi

# ============================================================================
# Section 9g0: Attributions placement (must be inside col-1, before aside)
# ============================================================================
section_header "Section 9g0: Attributions Placement"

# Attributions must appear BEFORE </aside>, not after it.
# If attributions appears after the aside closes, it renders parallel to the
# sidebar instead of stacked in the main content column.
ATTRIB_LINE=$(echo "$CONTENT" | grep -n 'class="card attributions"' | head -1 | cut -d: -f1)
ASIDE_CLOSE_LINE=$(echo "$CONTENT" | grep -n '</aside>' | tail -1 | cut -d: -f1)
COL1_CLOSE_LINE=$(echo "$CONTENT" | grep -n 'End Main Content Column\|End main content column' | head -1 | cut -d: -f1)

if [ -n "$ATTRIB_LINE" ] && [ -n "$COL1_CLOSE_LINE" ]; then
    if [ "$ATTRIB_LINE" -lt "$COL1_CLOSE_LINE" ]; then
        check_pass "Attributions is inside col-1 (line $ATTRIB_LINE, col-1 closes line $COL1_CLOSE_LINE)"
    else
        check_fail "Attributions is OUTSIDE col-1 — renders parallel to sidebar instead of stacked. Move it before the col-1 closing tag"
    fi
elif [ -n "$ATTRIB_LINE" ] && [ -n "$ASIDE_CLOSE_LINE" ]; then
    if [ "$ATTRIB_LINE" -lt "$ASIDE_CLOSE_LINE" ]; then
        check_pass "Attributions appears before aside (correct placement)"
    else
        check_fail "Attributions is AFTER </aside> — renders parallel to sidebar. Move it inside col-1"
    fi
elif [ -z "$ATTRIB_LINE" ]; then
    check_warn "No attributions section found"
fi

# ============================================================================
# Section 9g: Swiper Lazy Loading Consistency
# ============================================================================
section_header "Section 9g: Swiper Lazy Loading"

# If Swiper init uses lazy:true, images must use data-src (not src)
# If images use native loading="lazy" with src, Swiper must use lazy:false
SWIPER_LAZY=$(echo "$CONTENT" | grep -oP "Swiper\('.swiper.firstlook'[^)]*lazy:\s*\Ktrue" | head -1)
NATIVE_LAZY_IN_CAROUSEL=$(echo "$CONTENT" | sed -n '/swiper firstlook/,/swiper-pagination/p' | grep -c 'loading="lazy"' || echo "0")
if [ "$SWIPER_LAZY" = "true" ] && [ "$NATIVE_LAZY_IN_CAROUSEL" -gt 0 ]; then
    check_fail "Swiper lazy:true conflicts with native loading=\"lazy\" — images after slide 1 won't load. Use lazy:false or switch to data-src"
elif [ "$SWIPER_LAZY" = "true" ]; then
    check_pass "Swiper lazy:true with data-src pattern (OK)"
else
    check_pass "Swiper lazy:false with native lazy loading (OK)"
fi

# ============================================================================
# Section 9h: Whimsical Units Script Type
# ============================================================================
section_header "Section 9h: Whimsical Units"

if echo "$CONTENT" | grep -q 'whimsical-port-units\.js'; then
    check_warn "Ship page loads whimsical-port-units.js — should use whimsical-ship-units.js for ship-specific measurements"
elif echo "$CONTENT" | grep -q 'whimsical-ship-units\.js'; then
    check_pass "Ship page uses ship-specific whimsical units"
else
    check_warn "No whimsical units script found"
fi

# ============================================================================
# Section 9i: Noscript Fallbacks (AI readability)
# ============================================================================
section_header "Section 9i: Noscript Fallbacks (AI/no-JS readability)"

# JS-dependent sections that MUST have noscript fallbacks
# AI crawlers don't execute JavaScript — empty divs = invisible content
NOSCRIPT_SECTIONS=(
    "ship-stats"
    "dining-content"
    "featuredVideos"
    "vf-tracker-container"
    "recent-rail"
    "authors-rail"
    "whimsical-units-container"
    "logbook-stories"
)

NOSCRIPT_LABELS=(
    "Ship Stats"
    "Dining Venues"
    "Video Carousel"
    "Live Tracker"
    "Recent Articles"
    "Authors Rail"
    "Whimsical Units"
    "Logbook"
)

NOSCRIPT_MISSING=0
for i in "${!NOSCRIPT_SECTIONS[@]}"; do
    SEC_ID="${NOSCRIPT_SECTIONS[$i]}"
    SEC_LABEL="${NOSCRIPT_LABELS[$i]}"
    # Check if the element exists on the page
    if echo "$CONTENT" | grep -q "id=\"$SEC_ID\""; then
        # Extract the block from the id to its closing tag and check for noscript
        if echo "$CONTENT" | tr '\n' ' ' | grep -oP "id=\"$SEC_ID\".*?</(?:div|section)>" | grep -q '<noscript'; then
            check_pass "$SEC_LABEL has noscript fallback"
        else
            check_warn "$SEC_LABEL (id=$SEC_ID) has NO noscript fallback — AI crawlers see empty content"
            NOSCRIPT_MISSING=$((NOSCRIPT_MISSING + 1))
        fi
    fi
done
if [ "$NOSCRIPT_MISSING" -eq 0 ]; then
    check_pass "All JS-dependent sections have noscript fallbacks"
fi

# ============================================================================
# Section 9j: Compass Rose Mobile Sizing
# ============================================================================
section_header "Section 9j: Compass Rose Mobile"

# Check global CSS for compass mobile override
STYLES_CSS="${REPO_ROOT}/assets/styles.css"
if [ -f "$STYLES_CSS" ]; then
    # Look for a media query that targets hero-compass
    if grep -A3 'max-width.*600\|max-width.*480\|max-width.*768' "$STYLES_CSS" | grep -q 'hero-compass'; then
        check_pass "Compass rose has mobile media query override"
    else
        check_warn "Compass rose has no mobile override — may overwhelm content on small screens (86px = ~23% of 375px iPhone)"
    fi
else
    check_warn "styles.css not found at $STYLES_CSS"
fi

# ============================================================================
# Section 9k: Article Thumbnail Existence
# ============================================================================
section_header "Section 9k: Article Thumbnail Paths"

ARTICLES_JSON="${REPO_ROOT}/assets/data/articles/index.json"
if [ -f "$ARTICLES_JSON" ]; then
    THUMB_MISSING=0
    THUMB_CHECKED=0
    while IFS= read -r thumb_path; do
        [ -z "$thumb_path" ] && continue
        CLEAN=$(echo "$thumb_path" | sed 's/\?.*$//')
        THUMB_CHECKED=$((THUMB_CHECKED + 1))
        if [ ! -f "${REPO_ROOT}${CLEAN}" ]; then
            check_fail "Article thumbnail missing: $CLEAN"
            THUMB_MISSING=$((THUMB_MISSING + 1))
        fi
    done <<< "$(python3 -c "
import json,sys
try:
    d=json.load(open('$ARTICLES_JSON'))
    for a in d.get('articles',[]):
        t=a.get('thumbnail','')
        if t: print(t)
except: pass
" 2>/dev/null)"
    if [ "$THUMB_MISSING" -eq 0 ] && [ "$THUMB_CHECKED" -gt 0 ]; then
        check_pass "All $THUMB_CHECKED article thumbnails exist on disk"
    elif [ "$THUMB_CHECKED" -eq 0 ]; then
        check_warn "No article thumbnails to verify"
    fi
else
    check_warn "articles/index.json not found"
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
