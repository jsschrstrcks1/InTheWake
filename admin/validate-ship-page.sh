#!/bin/bash
# ============================================================================
# Ship Page Validator — v3.010.600
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
echo "  Ship Page Validator — v3.010.400"
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
# Section 2: ICP-2 v2.1 — AI-Breadcrumbs Removal Check
# ============================================================================
section_header "Section 2: ICP-2 AI-Breadcrumbs (should be removed)"

if echo "$CONTENT" | grep -q "<!-- ai-breadcrumbs"; then
    check_warn "ai-breadcrumbs HTML comment still present — ICP-2 v2.1 says remove (no crawler reads HTML comments)"
else
    check_pass "No ai-breadcrumbs HTML comment (ICP-2 compliant)"
fi

# (ICP-2: ai-breadcrumbs field checks removed — no crawler reads HTML comments)

# ============================================================================
# Section 3: ICP-2 Protocol
# ============================================================================
section_header "Section 3: ICP-2 Protocol"

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

if echo "$CONTENT" | grep -q 'content="ICP-2"'; then
    check_pass "content-protocol is ICP-2"
elif echo "$CONTENT" | grep -qE 'content="ICP-Lite v1\.(0|4)"'; then
    check_warn "content-protocol is ICP-Lite v1.x — should be upgraded to ICP-2"
else
    check_fail "content-protocol meta tag MISSING or incorrect (should be ICP-2)"
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
DUPE_CLASS_COUNT=$(echo "$CONTENT" | grep -cE 'class="[^"]*"[^>]*class="' 2>/dev/null | tail -1 || echo "0")
DUPE_CLASS_COUNT=${DUPE_CLASS_COUNT:-0}
if [ "$DUPE_CLASS_COUNT" -gt 0 ]; then
    check_warn "$DUPE_CLASS_COUNT element(s) have duplicate class attributes — second class is silently ignored"
else
    check_pass "No duplicate class attributes"
fi

# Check footer copyright year is current (accepts both static and dynamic JS)
CURRENT_YEAR=$(date +%Y)
if echo "$CONTENT" | grep -qP '(©|&copy;)\s*<script>.*getFullYear'; then
    check_pass "Footer copyright year is dynamic (JS getFullYear)"
else
    FOOTER_YEAR=$(echo "$CONTENT" | grep -oE '©\s*[0-9]{4}|&copy;\s*[0-9]{4}' | grep -oE '[0-9]{4}' | tail -1)
    if [ -z "$FOOTER_YEAR" ]; then
        check_warn "No copyright year found in footer"
    elif [ "$FOOTER_YEAR" -lt "$CURRENT_YEAR" ]; then
        check_warn "Footer copyright year ($FOOTER_YEAR) is out of date — should be $CURRENT_YEAR"
    else
        check_pass "Footer copyright year is current ($FOOTER_YEAR)"
    fi
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
IMG_WITHOUT_ALT=$(echo "$CONTENT" | tr '\n' ' ' | grep -oE '<img [^>]+>' | grep -cv 'alt=' 2>/dev/null | tail -1 || echo "0")
IMG_WITHOUT_ALT=${IMG_WITHOUT_ALT:-0}
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

# Optional: "Who She's For" personality callout (emotional-hook-test.md)
# Not required — only pages that have been through emotional-hook review have this.
if echo "$CONTENT" | grep -qE 'id="who-shes-for"|who.she.s.for'; then
    check_pass "Who She's For personality section present"
else
    check_warn "No 'Who She's For' personality section. Consider adding one (see emotional-hook-test.md)"
fi

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
FIRSTLOOK_IMGS=$(echo "$CONTENT" | sed -n '/swiper firstlook\|photo-carousel swiper/,/swiper-pagination/p' | grep -cE '<img[ >]|<img$' || echo "0")
if [ "$FIRSTLOOK_IMGS" -ge 1 ]; then
    check_pass "First Look carousel has $FIRSTLOOK_IMGS image(s)"
else
    check_fail "First Look carousel has NO images — carousel will render empty"
fi

# Check carousel HTML structure — every swiper-slide must have a closing </div>
# Strategy: inside the firstlook carousel, count slide opens vs all </div> tags,
# then subtract 2 for the swiper-wrapper close and the pagination self-close.
CAROUSEL_HTML=$(echo "$CONTENT" | sed -n '/swiper firstlook\|photo-carousel swiper/,/swiper-pagination/p')
SLIDE_OPENS=$(echo "$CAROUSEL_HTML" | grep -c 'class="swiper-slide"' || echo "0")
ALL_DIV_CLOSES=$(echo "$CAROUSEL_HTML" | grep -c '</div>' || echo "0")
# Subtract: 1 for swiper-wrapper </div>, 1 for pagination <div.../></div>
SLIDE_CLOSES=$((ALL_DIV_CLOSES - 2))
if [ "$SLIDE_OPENS" -gt 0 ]; then
    if [ "$SLIDE_OPENS" -eq "$SLIDE_CLOSES" ]; then
        check_pass "Carousel HTML: $SLIDE_OPENS slides, all properly closed"
    elif [ "$SLIDE_OPENS" -gt "$SLIDE_CLOSES" ]; then
        MISSING=$((SLIDE_OPENS - SLIDE_CLOSES))
        check_fail "Carousel HTML BROKEN: $SLIDE_OPENS slides opened but $MISSING missing </div> — slides will nest incorrectly"
    else
        check_warn "Carousel has more </div> ($SLIDE_CLOSES) than slides ($SLIDE_OPENS) — possible extra closing tags"
    fi
fi

# Check for swiper-slides outside swiper-wrapper by comparing nesting depth
# Strategy: after the swiper-wrapper opening div, track depth. When depth returns to 0,
# we've exited swiper-wrapper. Any swiper-slide after that is orphaned.
SLIDES_OUTSIDE=$(echo "$CONTENT" | python3 -c "
import sys, re
content = sys.stdin.read()
m = re.search(r'(?:swiper firstlook|photo-carousel swiper).*?swiper-pagination', content, re.DOTALL)
if not m:
    print(0); sys.exit(0)
block = m.group()
# Find swiper-wrapper open, then track depth
idx = block.find('swiper-wrapper')
if idx < 0:
    print(0); sys.exit(0)
depth = 1
pos = block.find('>', idx) + 1
orphans = 0
while pos < len(block):
    next_open = block.find('<div', pos)
    next_close = block.find('</div>', pos)
    if next_close < 0:
        break
    if next_open >= 0 and next_open < next_close:
        depth += 1
        pos = block.find('>', next_open) + 1
    else:
        depth -= 1
        pos = next_close + 6
        if depth == 0:
            # We've exited swiper-wrapper. Count remaining swiper-slides
            remaining = block[pos:]
            orphans = len(re.findall(r'swiper-slide', remaining))
            break
print(orphans)
" 2>/dev/null)
SLIDES_OUTSIDE=${SLIDES_OUTSIDE:-0}
if [ "$SLIDES_OUTSIDE" -gt 0 ]; then
    check_fail "Carousel has $SLIDES_OUTSIDE swiper-slide(s) OUTSIDE swiper-wrapper — they won't display"
else
    check_pass "All carousel slides are inside swiper-wrapper"
fi

# ============================================================================
# Section 9b1: Stray HTML Tags in Text Content
# ============================================================================
section_header "Section 9b1: Stray HTML Tags in Text"

# Check for HTML tags appearing mid-sentence in visible text (corruption indicator)
STRAY_TAGS=$(echo "$CONTENT" | grep -cP '[a-z] </?(div|span|section|article|p)>[a-z0-9$]' || true)
if [ "$STRAY_TAGS" -gt 0 ]; then
    check_fail "Found $STRAY_TAGS likely corrupted HTML tag(s) inside text content — check for broken tags mid-sentence"
else
    check_pass "No stray HTML tags detected in text content"
fi

# ============================================================================
# Section 9c: Sister Ships Completeness
# ============================================================================
section_header "Section 9c: Sister Ships Consistency"

# Count sister ship pills in the HTML
SISTER_PILLS=$(echo "$CONTENT" | sed -n '/related-ships/,/See All Ships/p' | grep -c 'class="pill"' || echo "0")

if [ "$SISTER_PILLS" -gt 0 ]; then
    check_pass "Sister ship pills present: $SISTER_PILLS ships linked"

    # Cross-check FAQ about same-class ships mentions all pill-linked sisters
    FAQ_CLASS_ANSWER=$(echo "$CONTENT" | tr '\n' ' ' | grep -oP 'Which ships are in the same class.*?</details>' | head -1)
    MISSING_IN_FAQ=0
    while IFS= read -r pill_href; do
        [ -z "$pill_href" ] && continue
        SIBLING_SLUG=$(echo "$pill_href" | grep -oP '[^/]+\.html' | sed 's/\.html//')
        [ -z "$SIBLING_SLUG" ] && continue
        if [ -n "$FAQ_CLASS_ANSWER" ] && ! echo "$FAQ_CLASS_ANSWER" | grep -qi "$SIBLING_SLUG"; then
            READABLE=$(echo "$SIBLING_SLUG" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
            check_warn "FAQ 'same class' answer may be missing sister: $READABLE"
            MISSING_IN_FAQ=$((MISSING_IN_FAQ + 1))
        fi
    done <<< "$(echo "$CONTENT" | sed -n '/related-ships/,/See All Ships/p' | grep -oP 'href="/[^"]*\.html"' | sed 's/href="//;s/"//')"
    if [ "$MISSING_IN_FAQ" -eq 0 ] && [ -n "$FAQ_CLASS_ANSWER" ]; then
        check_pass "FAQ 'same class' answer mentions all linked sister ships"
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

# Prefer venues-v2.json (current), fall back to venues.json (legacy)
VENUES_JSON="${REPO_ROOT}/assets/data/venues-v2.json"
[ ! -f "$VENUES_JSON" ] && VENUES_JSON="${REPO_ROOT}/assets/data/venues.json"
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
# Section 9f2: Guest Count Consistency
# ============================================================================
section_header "Section 9f2: Guest Count Consistency"

# Extract guest count from the stats fallback JSON (source of truth)
STATS_GUESTS=$(echo "$CONTENT" | grep -oP '"guests":\s*"\K[^"]+' | head -1)
if [ -n "$STATS_GUESTS" ]; then
    # Extract the double-occupancy number (first number in the guests field)
    DOUBLE_OCC=$(echo "$STATS_GUESTS" | grep -oP '^[0-9,]+' | head -1)
    if [ -n "$DOUBLE_OCC" ]; then
        # Check if any FAQ answer uses a DIFFERENT guest count
        FAQ_GUESTS=$(echo "$CONTENT" | grep -oP 'about \K[0-9,]+ guests at double' | head -1 | grep -oP '^[0-9,]+')
        if [ -n "$FAQ_GUESTS" ] && [ "$FAQ_GUESTS" != "$DOUBLE_OCC" ]; then
            check_fail "Guest count MISMATCH: stats says $DOUBLE_OCC but FAQ says $FAQ_GUESTS — likely copy-pasted from another ship"
        elif [ -n "$FAQ_GUESTS" ]; then
            check_pass "Guest count consistent: $DOUBLE_OCC in stats and FAQ"
        fi

        # (ICP-2: ai-breadcrumbs guest cross-check removed — ai-breadcrumbs no longer used)
    fi
fi

# (Section 9f3 removed — ai-breadcrumbs related field no longer used per ICP-2 v2.1)

# ============================================================================
# Section 9f4: Dining Heading Browse All Link
# ============================================================================
section_header "Section 9f4: Dining Heading"

DINING_H2=$(echo "$CONTENT" | grep 'id="diningHeading"' | head -1)
if echo "$DINING_H2" | grep -q 'Browse All\|restaurants.html'; then
    check_pass "Dining heading has '→ Browse All' link to restaurants"
else
    check_warn "Dining heading missing '→ Browse All' link — Radiance reference page has inline link to /restaurants.html"
fi

# ============================================================================
# Section 9f5: Deck Plans CTA After Logbook
# ============================================================================
section_header "Section 9f5: Deck Plans CTA"

# Check for a deck plans button/link between the logbook and video sections
BETWEEN_LOG_VID=$(echo "$CONTENT" | sed -n '/id="logbook"/,/id="video-highlights"/p')
if echo "$BETWEEN_LOG_VID" | grep -q 'btn-deck-plans\|View Official.*Deck\|View Official.*Ship'; then
    check_pass "Deck Plans CTA present after logbook section"
else
    check_warn "No Deck Plans CTA between logbook and videos — Radiance reference has 'View Official Deck Plans →' link"
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
NATIVE_LAZY_IN_CAROUSEL=$(echo "$CONTENT" | sed -n '/swiper firstlook\|photo-carousel swiper/,/swiper-pagination/p' | grep -c 'loading="lazy"' || echo "0")
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
# Section 9l: ICP Version Check
# ============================================================================
section_header "Section 9l: ICP Version"

# ICP-2 v2.1: content-protocol should be "ICP-2", no ICP-Lite comments needed
if echo "$CONTENT" | grep -q 'content="ICP-2"'; then
    check_pass "ICP-2 protocol detected"
elif echo "$CONTENT" | grep -qE 'content="ICP-Lite'; then
    check_warn "Still on ICP-Lite — upgrade to ICP-2"
fi

# ============================================================================
# Section 9m: Stats Heading Format
# ============================================================================
section_header "Section 9m: Stats Heading Format"

# Stats heading should follow the pattern "Key Facts About [Ship Name]"
STATS_H3=$(echo "$CONTENT" | grep 'id="statsHeading"' | head -1)
if echo "$STATS_H3" | grep -q 'Key Facts About'; then
    check_pass "Stats heading follows 'Key Facts About [Ship Name]' pattern"
else
    ACTUAL_HEADING=$(echo "$STATS_H3" | sed 's/.*<h3[^>]*>//' | sed 's/<\/h3>//')
    check_warn "Stats heading is '$ACTUAL_HEADING' — expected 'Key Facts About [Ship Name]' pattern"
fi

# ============================================================================
# Section 9n: Fact-Block Completeness
# ============================================================================
section_header "Section 9n: Fact-Block Content"

FACT_BLOCK=$(echo "$CONTENT" | grep 'class="fact-block"' | head -1)
if [ -n "$FACT_BLOCK" ]; then
    # Check for crew mention
    if echo "$FACT_BLOCK" | grep -qi 'crew'; then
        check_pass "Fact-block mentions crew count"
    else
        check_warn "Fact-block does not mention crew count — add crew size for AI readability"
    fi
    # Check for year
    if echo "$FACT_BLOCK" | grep -qP '\b(19|20)\d{2}\b'; then
        check_pass "Fact-block mentions year of service"
    else
        check_warn "Fact-block does not mention year of service"
    fi
    # Check for GT
    if echo "$FACT_BLOCK" | grep -qi 'gross tons\|GT'; then
        check_pass "Fact-block mentions gross tonnage"
    else
        check_warn "Fact-block does not mention gross tonnage"
    fi
fi

# ============================================================================
# Section 9o: page.json Data File
# ============================================================================
section_header "Section 9o: page.json Data File"

# Ship pages should have a companion page.json in assets/data/ships/[line]/
PAGE_JSON="${REPO_ROOT}/assets/data/ships/$(echo "$FILE" | grep -oP 'ships/\K[^/]+')/${SHIP_SLUG}.page.json"
if [ -n "$SHIP_SLUG" ] && [ -f "$PAGE_JSON" ]; then
    check_pass "page.json data file exists at $(echo "$PAGE_JSON" | sed "s|$REPO_ROOT/||")"
else
    if [ -n "$SHIP_SLUG" ]; then
        check_warn "No page.json at assets/data/ships/$(echo "$FILE" | grep -oP 'ships/\K[^/]+')/${SHIP_SLUG}.page.json — drives prefetching, tracker config, dining sources"
    fi
fi

# ============================================================================
# Section 9p: Logbook Data File Existence
# ============================================================================
section_header "Section 9p: Logbook Data Files"

# Check if at least one of the logbook data sources exists
if [ -n "$SHIP_SLUG" ]; then
    LINE_DIR=$(echo "$FILE" | grep -oP 'ships/\K[^/]+')
    SHORT_SLUG=$(echo "$SHIP_SLUG" | sed 's/-of-the-seas//' | sed 's/-of-the-//')
    LOGBOOK_FOUND=0
    LOGBOOK_PATHS=(
        "${REPO_ROOT}/ships/${LINE_DIR}/assets/${SHIP_SLUG}.json"
        "${REPO_ROOT}/ships/${LINE_DIR}/assets/${SHORT_SLUG}.json"
        "${REPO_ROOT}/assets/data/logbook/${LINE_DIR}/${SHIP_SLUG}.json"
        "${REPO_ROOT}/assets/data/ships/${LINE_DIR}/${SHIP_SLUG}.json"
    )
    for lpath in "${LOGBOOK_PATHS[@]}"; do
        if [ -f "$lpath" ]; then
            LOGBOOK_FOUND=$((LOGBOOK_FOUND + 1))
        fi
    done
    if [ "$LOGBOOK_FOUND" -gt 0 ]; then
        check_pass "Logbook data: $LOGBOOK_FOUND of 4 source paths exist"
    else
        check_warn "No logbook data files found — logbook section will show noscript fallback only"
    fi
fi

# ============================================================================
# Section 9q: Dining v2 Category Handling
# ============================================================================
section_header "Section 9q: Dining v2 Category Handling"

# Check if inline renderVenues uses catLabels without a "dining" key
INLINE_DINING=$(echo "$CONTENT" | grep -c 'catLabels' || true)
if [ "$INLINE_DINING" -gt 0 ]; then
    if echo "$CONTENT" | grep -q 'catLabels' && ! echo "$CONTENT" | grep -qP 'dining\s*[:=].*["\x27]Dining["\x27]'; then
        check_fail "Inline renderVenues uses catLabels without 'dining' key — venues with category='dining' will render as 'undefined' heading (#1308)"
    else
        check_pass "Inline dining loader handles v2 'dining' category"
    fi
else
    check_pass "No inline catLabels found (may use external dining-card.js)"
fi

# ============================================================================
# Section 9r: Video Swiper Initialization
# ============================================================================
section_header "Section 9r: Video Swiper Initialization"

if echo "$CONTENT" | grep -q 'id="video-highlights"\|id="videos"'; then
    if echo "$CONTENT" | grep -q '__swiperReady\|initSwiper.*tries\|setTimeout.*[Ss]wiper'; then
        check_pass "Video section has Swiper retry/poll logic"
    else
        check_warn "Video section exists but has no retry/poll logic for Swiper readiness — videos may not render if Swiper loads late (#1311)"
    fi
else
    check_pass "No video section found (N/A)"
fi

# ============================================================================
# Section 9s: Video Fallback Text for Retired Ships
# ============================================================================
section_header "Section 9s: Video Fallback Text for Retired Ships"

IS_RETIRED=0
if echo "$CONTENT" | grep -qi 'retired\|no longer in service\|sold to\|withdrawn from\|scrapped\|decommissioned'; then
    IS_RETIRED=1
fi

if [ "$IS_RETIRED" -eq 1 ]; then
    if echo "$CONTENT" | grep -q 'will appear once.*sources sync\|will appear once.*sync'; then
        check_warn "Retired ship video fallback says 'will appear once sources sync' — should say 'No video content available' for retired ships (#1311)"
    else
        check_pass "No misleading video fallback text on retired ship"
    fi
else
    check_pass "Ship not retired (N/A)"
fi

# ============================================================================
# Section 9t: Passenger Count Consistency
# ============================================================================
section_header "Section 9t: Passenger Count Consistency"

if [ -n "$SHIP_SLUG" ]; then
    # Extract guest count from ship-stats-fallback JSON
    STATS_GUESTS_RAW=$(echo "$CONTENT" | grep -oP '"guests"\s*:\s*"[^"]*"' | head -1 | grep -oP ':\s*"\K[^"]+')
    # Extract first number from stats guests (handles "5,484 (double) / 6,780 (max)" → "5,484")
    STATS_GUESTS=$(echo "$STATS_GUESTS_RAW" | grep -oP '^[\d,]+' | head -1)
    # Extract guest count from ai-breadcrumbs answer-first
    BREADCRUMB_GUESTS=$(echo "$CONTENT" | grep -A1 'answer-first:' | grep -oP '[\d,]+ guests' | head -1 | grep -oP '[\d,]+')
    if [ -n "$STATS_GUESTS" ] && [ -n "$BREADCRUMB_GUESTS" ]; then
        # Normalize: strip commas for comparison
        STATS_NUM=$(echo "$STATS_GUESTS" | tr -d ',')
        BREAD_NUM=$(echo "$BREADCRUMB_GUESTS" | tr -d ',')
        if [ "$STATS_NUM" = "$BREAD_NUM" ]; then
            check_pass "Guest count consistent: stats JSON ($STATS_GUESTS) matches ai-breadcrumbs ($BREADCRUMB_GUESTS)"
        else
            check_warn "Guest count mismatch: stats JSON says '$STATS_GUESTS' but ai-breadcrumbs says '$BREADCRUMB_GUESTS' (#1309)"
        fi
    else
        check_pass "Guest count cross-check skipped (insufficient data)"
    fi
else
    check_pass "No ship slug — guest count check skipped"
fi

# ============================================================================
# Section 9u: Ship Class Consistency
# ============================================================================
section_header "Section 9u: Ship Class Consistency"

if [ -n "$SHIP_SLUG" ]; then
    BREADCRUMB_CLASS=$(echo "$CONTENT" | grep -oP 'ship-class:\s*\K.*' | head -1 | sed 's/[[:space:]]*$//')
    STATS_CLASS=$(echo "$CONTENT" | grep -oP '"class"\s*:\s*"[^"]*"' | head -1 | grep -oP ':\s*"\K[^"]+')
    KEY_FACTS_CLASS=$(echo "$CONTENT" | grep -oP '<strong>Class:</strong>\s*\K[^<]+' | head -1 | sed 's/[[:space:]]*$//')
    if [ -n "$BREADCRUMB_CLASS" ] && [ -n "$STATS_CLASS" ]; then
        if [ "$BREADCRUMB_CLASS" = "$STATS_CLASS" ]; then
            check_pass "Ship class consistent: ai-breadcrumbs and stats JSON both say '$BREADCRUMB_CLASS'"
        else
            check_warn "Ship class mismatch: ai-breadcrumbs says '$BREADCRUMB_CLASS' but stats JSON says '$STATS_CLASS' (#1310)"
        fi
    else
        check_pass "Ship class cross-check skipped (insufficient data)"
    fi
else
    check_pass "No ship slug — class check skipped"
fi

# ============================================================================
# Section 9v: Stats TBD Detection
# ============================================================================
section_header "Section 9v: Stats TBD Detection"

# Extract the stats JSON block (multi-line between entered_service and registry)
STATS_JSON=$(echo "$CONTENT" | sed -n '/"entered_service"/,/"registry"/p')
if [ -n "$STATS_JSON" ]; then
    TBD_COUNT=$(echo "$STATS_JSON" | grep -oi '"TBD"' | wc -l)
    if [ "$TBD_COUNT" -gt 0 ]; then
        # Check if this is a TBN (to-be-named) or future ship
        if echo "$CONTENT" | grep -qiP '(?<![-/])to be named|(?<![a-z-])TBN(?![a-z.])|under construction|not yet delivered'; then
            check_pass "Stats contain TBD but ship is TBN/under construction (acceptable)"
        else
            check_fail "Ship stats JSON contains $TBD_COUNT 'TBD' field(s) on a non-TBN page — populate with actual data (#1320)"
        fi
    else
        check_pass "No TBD values in ship stats JSON"
    fi
else
    check_pass "No stats JSON block found to check (N/A)"
fi

# ============================================================================
# Section 9w: FAQ Factual Freshness (Superlatives)
# ============================================================================
section_header "Section 9w: FAQ Factual Freshness"

# Extract FAQ answers from both JSON-LD and HTML (faq-answer or list-indent class)
FAQ_ANSWERS=$(echo "$CONTENT" | grep -oP 'class="(?:faq-answer|list-indent)">[^<]+' | sed 's/class="[^"]*">//' || true)
FAQ_ANSWERS_JSONLD=$(echo "$CONTENT" | grep -oP '"text"\s*:\s*"[^"]*"' || true)
FAQ_ALL="${FAQ_ANSWERS}${FAQ_ANSWERS_JSONLD}"
if [ -n "$FAQ_ALL" ]; then
    STALE_SUPERLATIVES=$(echo "$FAQ_ALL" | grep -oiP '\b(newest|largest|first|most recent|latest|biggest)\b' | wc -l)
    if [ "$STALE_SUPERLATIVES" -gt 0 ]; then
        # Check if any superlative lacks a date qualifier nearby
        if echo "$FAQ_ALL" | grep -qP '(newest|largest|first|most recent|latest|biggest).{0,80}(20[0-9]{2}|as of)'; then
            check_pass "FAQ superlatives have date qualifiers"
        else
            check_warn "FAQ answers contain $STALE_SUPERLATIVES superlative(s) (newest/largest/first) without date qualifier — these go stale (#1319)"
        fi
    else
        check_pass "No superlatives in FAQ answers"
    fi
else
    check_pass "No FAQ answers found (N/A)"
fi

# ============================================================================
# Section 9x: Retired Ship Booking CTA
# ============================================================================
section_header "Section 9x: Retired Ship Booking CTA"

if [ "$IS_RETIRED" -eq 1 ]; then
    if echo "$CONTENT" | grep -qi 'Book via cruise line\|Book via travel\|Reservations.*Book'; then
        check_warn "Retired ship has booking CTA — replace with retirement status notice (#1313)"
    else
        check_pass "No booking CTA on retired ship page"
    fi
else
    check_pass "Ship not retired — booking CTA is appropriate"
fi

# ============================================================================
# Section 9y: Attribution Artist Names
# ============================================================================
section_header "Section 9y: Attribution Artist Names"

ATTR_SECTION=$(echo "$CONTENT" | grep -c 'class="card attributions"' || true)
if [ "$ATTR_SECTION" -gt 0 ]; then
    # Check if any attribution <li> includes "by " or "photo by" or photographer name
    ATTR_BLOCK=$(echo "$CONTENT" | sed -n '/class="card attributions"/,/<\/section>/p')
    ATTR_LI_COUNT=$(echo "$ATTR_BLOCK" | grep -c '<li>' || true)
    ATTR_BY_COUNT=$(echo "$ATTR_BLOCK" | grep -ciP 'by [A-Z<]|photo by|image by|photographer|photography by' || true)
    if [ "$ATTR_LI_COUNT" -gt 0 ] && [ "$ATTR_BY_COUNT" -eq 0 ]; then
        # Cross-reference with .attr.json if it exists
        LINE_DIR_ATTR=$(echo "$FILE" | grep -oP 'ships/\K[^/]+')
        ATTR_JSON="${REPO_ROOT}/ships/${LINE_DIR_ATTR}/assets/${SHIP_SLUG}.attr.json"
        if [ -f "$ATTR_JSON" ]; then
            ARTIST=$(grep -oP '"artist"\s*:\s*"\K[^"]+' "$ATTR_JSON" | head -1)
            if [ -n "$ARTIST" ]; then
                check_warn "Attributions section has $ATTR_LI_COUNT item(s) but no photographer names — .attr.json has artist: '$ARTIST'. CC licenses require author attribution (#1317)"
            else
                check_warn "Attributions section has $ATTR_LI_COUNT item(s) but no photographer names and .attr.json has no artist field (#1317)"
            fi
        else
            check_warn "Attributions section has $ATTR_LI_COUNT item(s) but no photographer names — no .attr.json found to cross-reference (#1317)"
        fi
    else
        check_pass "Attribution items include photographer names ($ATTR_BY_COUNT of $ATTR_LI_COUNT)"
    fi
else
    check_pass "No attributions section (N/A)"
fi

# ============================================================================
# Section 9z: Logbook Title Sensitivity (INFO-level)
# ============================================================================
section_header "Section 9z: Logbook Title Sensitivity"

# Flag logbook titles that lead with a medical diagnosis — INFO only, not error
LOGBOOK_TITLES=$(echo "$CONTENT" | grep -oP '<h3[^>]*>[^<]*</h3>' | sed 's/<[^>]*>//g' || true)
SENSITIVE_TITLE=$(echo "$LOGBOOK_TITLES" | grep -iP '^The (Bipolar|Autistic|Diabetic|ADHD|Anxious|Depressed|OCD|Schizophren)' || true)
if [ -n "$SENSITIVE_TITLE" ]; then
    check_pass "INFO: Logbook title leads with medical identity — '$SENSITIVE_TITLE' — editorial review recommended (#1318)"
else
    check_pass "No sensitivity flags in logbook titles"
fi

# ============================================================================
# Section 9aa: Copyright Year Dynamic
# ============================================================================
section_header "Section 9aa: Copyright Year Dynamic"

if echo "$CONTENT" | grep -qP '(©|&copy;)\s*<script>.*getFullYear'; then
    check_pass "Footer copyright uses dynamic JS year"
elif echo "$CONTENT" | grep -qP '©\s*20[0-9]{2}\s*In the Wake'; then
    check_warn "Footer has hardcoded copyright year — replace with dynamic document.write(new Date().getFullYear()) (#1316)"
else
    check_pass "Copyright check skipped (no standard pattern found)"
fi

# ============================================================================
# Section 9ab: Venue Data Existence
# ============================================================================
section_header "Section 9ab: Venue Data Existence"

VENUES_FILE="${REPO_ROOT}/assets/data/venues-v2.json"
if [ -n "$SHIP_SLUG" ] && [ -f "$VENUES_FILE" ]; then
    # Check if ship slug exists in venues-v2.json ships index
    if grep -q "\"$SHIP_SLUG\"" "$VENUES_FILE"; then
        check_pass "Ship '$SHIP_SLUG' found in venues-v2.json"
    else
        if [ "$IS_RETIRED" -eq 1 ]; then
            check_pass "Retired ship '$SHIP_SLUG' not in venues-v2.json (acceptable)"
        else
            check_warn "Ship '$SHIP_SLUG' not found in venues-v2.json — dining section will have no data (#1321)"
        fi
    fi
else
    check_pass "Venue data check skipped (no slug or venues file)"
fi

# ============================================================================
# Section 9ac: Venue Data Freshness
# ============================================================================
section_header "Section 9ac: Venue Data Freshness"

if [ -f "$VENUES_FILE" ]; then
    VENUES_UPDATED=$(grep -oP '"updated"\s*:\s*"\K[0-9-]+' "$VENUES_FILE" | head -1)
    if [ -n "$VENUES_UPDATED" ]; then
        # Calculate days since update
        VENUES_EPOCH=$(date -d "$VENUES_UPDATED" +%s 2>/dev/null || echo "0")
        NOW_EPOCH=$(date +%s)
        if [ "$VENUES_EPOCH" -gt 0 ]; then
            DAYS_OLD=$(( (NOW_EPOCH - VENUES_EPOCH) / 86400 ))
            if [ "$DAYS_OLD" -gt 90 ]; then
                check_warn "venues-v2.json last updated $VENUES_UPDATED ($DAYS_OLD days ago) — consider refreshing (#1321)"
            else
                check_pass "venues-v2.json is $DAYS_OLD days old (within 90-day threshold)"
            fi
        else
            check_pass "Could not parse venues-v2.json date (skipped)"
        fi
    else
        check_warn "venues-v2.json has no 'updated' field in meta"
    fi
else
    check_pass "No venues-v2.json found (skipped)"
fi

# ============================================================================
# Section 9ad: Venue Price Coverage (INFO-level)
# ============================================================================
section_header "Section 9ad: Venue Price Coverage"

if [ -n "$SHIP_SLUG" ] && [ -f "$VENUES_FILE" ]; then
    # Use python for JSON parsing — bash can't reliably parse nested JSON
    PRICE_STATS=$(python3 -c "
import json, sys
try:
    with open('$VENUES_FILE') as f:
        d = json.load(f)
    ships = d.get('ships', {})
    ship = ships.get('$SHIP_SLUG', {})
    venue_slugs = ship.get('venues', [])
    if not venue_slugs:
        print('none')
        sys.exit(0)
    venues_by_slug = {v['slug']: v for v in d.get('venues', [])}
    total = 0
    with_price = 0
    for vs in venue_slugs:
        slug = vs if isinstance(vs, str) else vs.get('slug','')
        v = venues_by_slug.get(slug, {})
        if v.get('category') == 'dining':
            total += 1
            if v.get('price') or v.get('price_range') or v.get('cost'):
                with_price += 1
    if total == 0:
        print('none')
    else:
        pct = int(100 * with_price / total)
        print(f'{with_price}/{total}/{pct}')
except Exception as e:
    print('error')
" 2>/dev/null)
    if [ "$PRICE_STATS" = "none" ]; then
        check_pass "No dining venues for price check (N/A)"
    elif [ "$PRICE_STATS" = "error" ]; then
        check_pass "Price coverage check skipped (parse error)"
    else
        PRICE_WITH=$(echo "$PRICE_STATS" | cut -d/ -f1)
        PRICE_TOTAL=$(echo "$PRICE_STATS" | cut -d/ -f2)
        PRICE_PCT=$(echo "$PRICE_STATS" | cut -d/ -f3)
        if [ "$PRICE_PCT" -lt 50 ]; then
            check_pass "INFO: Venue price coverage is $PRICE_WITH/$PRICE_TOTAL ($PRICE_PCT%) — data enrichment target"
        else
            check_pass "Venue price coverage: $PRICE_WITH/$PRICE_TOTAL ($PRICE_PCT%)"
        fi
    fi
else
    check_pass "Price coverage check skipped (no slug or venues file)"
fi

# ============================================================================
# Section 9ae: Review Schema Class Name
# ============================================================================
section_header "Section 9ae: Review Schema Class Name"

# The JSON-LD Review schema should reference the correct ship class, not "[ShipName]-class"
# Look for description near itemReviewed (may be many lines apart in nested JSON)
REVIEW_BLOCK=$(echo "$CONTENT" | sed -n '/"itemReviewed"/,/"reviewBody"/p' | head -30)
REVIEW_DESC=$(echo "$REVIEW_BLOCK" | grep -oP '"description"\s*:\s*"\K[^"]+' | head -1)
if [ -n "$REVIEW_DESC" ]; then
    # Extract the class claim from the review description
    REVIEW_CLASS=$(echo "$REVIEW_DESC" | grep -oiP '(A|An) \K\S+-class' | head -1)
    if [ -n "$REVIEW_CLASS" ]; then
        # Check if it matches the actual ship class from ai-breadcrumbs
        BREADCRUMB_CLASS=$(echo "$CONTENT" | grep -oP 'ship-class:\s*\K.*' | head -1 | sed 's/[[:space:]]*$//')
        REVIEW_CLASS_CLEAN=$(echo "$REVIEW_CLASS" | sed 's/-class$//')
        if echo "$BREADCRUMB_CLASS" | grep -qi "$REVIEW_CLASS_CLEAN"; then
            check_pass "Review schema class matches breadcrumbs ('$REVIEW_CLASS')"
        else
            check_fail "Review schema says '$REVIEW_CLASS' but ship-class is '$BREADCRUMB_CLASS' — likely copy-paste error"
        fi
    else
        check_pass "Review schema uses non-class description (OK)"
    fi
else
    check_pass "No review schema description found (N/A)"
fi

# ============================================================================
# Section 9af: FAQ Text Quality (Garbled Sentences)
# ============================================================================
section_header "Section 9af: FAQ Text Quality"

# Check for garbled FAQ text: capital letter mid-sentence after ship name, fragments
FAQ_GARBLED=0
# Pattern: lowercase word followed by space then Capitalized word that should be lowercase
# Common garble: "fleet Entered service", "ship Built in", "seas Launched in"
GARBLE_HITS=$(echo "$CONTENT" | grep -oP 'faq-answer|list-indent|"text"\s*:\s*"' | wc -l)
if [ "$GARBLE_HITS" -gt 0 ]; then
    # Extract FAQ text and check for mid-sentence capitals after common words
    FAQ_TEXT=$(echo "$CONTENT" | grep -oP '"text"\s*:\s*"\K[^"]+' || true)
    FAQ_HTML=$(echo "$CONTENT" | grep -oP 'class="(?:faq-answer|list-indent)">\K[^<]+' || true)
    ALL_FAQ="${FAQ_TEXT} ${FAQ_HTML}"
    GARBLE_COUNT=$(echo "$ALL_FAQ" | grep -cP '(fleet|ship|seas|service|Caribbean)\s+[A-Z][a-z]+\s+(service|in|from|to|with)\b' || true)
    if [ "$GARBLE_COUNT" -gt 0 ]; then
        check_warn "FAQ text contains $GARBLE_COUNT likely garbled sentence(s) — check for copy-paste fragments with wrong capitalization"
    else
        check_pass "FAQ text has no obvious garbled sentences"
    fi
else
    check_pass "No FAQ text found to check (N/A)"
fi

# ============================================================================
# Section 9ag: datePublished Placeholder Detection
# ============================================================================
section_header "Section 9ag: datePublished Placeholder"

if echo "$CONTENT" | grep -q '"datePublished"\s*:\s*"2024-01-01"'; then
    check_warn "WebPage schema has placeholder datePublished '2024-01-01' — remove or set to actual publish date"
elif echo "$CONTENT" | grep -q '"datePublished"'; then
    check_pass "datePublished present (non-placeholder)"
else
    check_pass "No datePublished in schema (matches reference pattern)"
fi

# ============================================================================
# Section 9ah: dateModified Consistency Across Schemas
# ============================================================================
section_header "Section 9ah: dateModified Consistency"

DATE_MODS=$(echo "$CONTENT" | grep -oP '"dateModified"\s*:\s*"\K[^"]+' | sort -u)
DATE_MOD_COUNT=$(echo "$DATE_MODS" | grep -c '[0-9]' || true)
if [ "$DATE_MOD_COUNT" -gt 1 ]; then
    DATES_LIST=$(echo "$DATE_MODS" | tr '\n' ', ' | sed 's/, $//')
    check_warn "Multiple different dateModified values in JSON-LD schemas: $DATES_LIST — should be consistent"
elif [ "$DATE_MOD_COUNT" -eq 1 ]; then
    check_pass "dateModified consistent across schemas ($(echo "$DATE_MODS" | head -1))"
else
    check_pass "No dateModified found (N/A)"
fi

# ============================================================================
# Section 9ai: Logbook Guest Count vs Page Stats
# ============================================================================
section_header "Section 9ai: Logbook Guest Count Consistency"

if [ -n "$SHIP_SLUG" ]; then
    # Get guest count from stats JSON (first number)
    STATS_GUESTS_FIRST=$(echo "$CONTENT" | grep -oP '"guests"\s*:\s*"\K[\d,]+' | head -1 | tr -d ',')
    # Check logbook noscript and JSON for different guest counts
    LOGBOOK_NOSCRIPT=$(echo "$CONTENT" | sed -n '/id="logbook-stories"/,/<\/noscript>/p')
    if [ -n "$STATS_GUESTS_FIRST" ] && [ -n "$LOGBOOK_NOSCRIPT" ]; then
        # Find guest counts in logbook text
        LOGBOOK_GUESTS=$(echo "$LOGBOOK_NOSCRIPT" | grep -oP '[\d,]+ guests' | grep -oP '[\d,]+' | tr -d ',' | sort -u)
        MISMATCH=0
        for lg in $LOGBOOK_GUESTS; do
            if [ "$lg" != "$STATS_GUESTS_FIRST" ] && [ "$lg" -gt 500 ] 2>/dev/null; then
                # Allow max capacity variants (roughly 1.2-1.5x double occupancy)
                MAX_PLAUSIBLE=$((STATS_GUESTS_FIRST * 3 / 2))
                if [ "$lg" -gt "$MAX_PLAUSIBLE" ] || [ "$lg" -lt "$((STATS_GUESTS_FIRST * 8 / 10))" ]; then
                    check_fail "Logbook mentions '$lg guests' but stats JSON says '$STATS_GUESTS_FIRST' — likely wrong data in story"
                    MISMATCH=1
                fi
            fi
        done
        if [ "$MISMATCH" -eq 0 ]; then
            check_pass "Logbook guest counts consistent with page stats"
        fi
    else
        check_pass "Logbook guest count check skipped (insufficient data)"
    fi
else
    check_pass "No ship slug — logbook check skipped"
fi

# ============================================================================
# Section 9aj: Image Symlink Integrity
# ============================================================================
section_header "Section 9aj: Image Symlink Integrity"

BROKEN_SYMLINKS=0
while IFS= read -r img_path; do
    [ -z "$img_path" ] && continue
    [[ "$img_path" == http* ]] && continue
    FULL_PATH="${REPO_ROOT}/${img_path#/}"
    if [ -L "$FULL_PATH" ]; then
        # It's a symlink — check if target exists and filename makes sense
        TARGET=$(readlink -f "$FULL_PATH" 2>/dev/null)
        if [ ! -f "$TARGET" ]; then
            check_fail "Broken image symlink: $img_path → target does not exist"
            BROKEN_SYMLINKS=$((BROKEN_SYMLINKS + 1))
        else
            # Check if symlink target contains a different ship name
            TARGET_BASE=$(basename "$TARGET")
            SRC_BASE=$(basename "$img_path")
            # Extract ship names from both — use full "Name_of_the_Seas" pattern
            SRC_SHIP=$(echo "$SRC_BASE" | grep -oiP '^[A-Za-z_]+_of_the_[A-Za-z]+' | head -1)
            TGT_SHIP=$(echo "$TARGET_BASE" | grep -oiP '^[A-Za-z_]+_of_the_[A-Za-z]+' | head -1)
            # Fallback: if no "of the" pattern, use first word before underscore+digit
            [ -z "$SRC_SHIP" ] && SRC_SHIP=$(echo "$SRC_BASE" | grep -oiP '^[A-Za-z]+(?=_)' | head -1)
            [ -z "$TGT_SHIP" ] && TGT_SHIP=$(echo "$TARGET_BASE" | grep -oiP '^[A-Za-z]+(?=_)' | head -1)
            # Normalize: lowercase, strip trailing s/es for fuzzy match
            SRC_NORM=$(echo "$SRC_SHIP" | tr 'A-Z' 'a-z' | sed 's/_*$//')
            TGT_NORM=$(echo "$TGT_SHIP" | tr 'A-Z' 'a-z' | sed 's/_*$//')
            # Check if one starts with the other (handles "Sea" vs "Seas")
            SHIPS_MATCH=0
            [ "$SRC_NORM" = "$TGT_NORM" ] && SHIPS_MATCH=1
            echo "$SRC_NORM" | grep -q "^${TGT_NORM}" && SHIPS_MATCH=1
            echo "$TGT_NORM" | grep -q "^${SRC_NORM}" && SHIPS_MATCH=1
            if [ -n "$SRC_SHIP" ] && [ -n "$TGT_SHIP" ] && [ "$SHIPS_MATCH" -eq 0 ]; then
                check_fail "Image symlink cross-ship: $SRC_BASE → $TARGET_BASE (different ships)"
                BROKEN_SYMLINKS=$((BROKEN_SYMLINKS + 1))
            fi
        fi
    fi
done <<< "$(echo "$CONTENT" | grep -oP 'src="(/[^"]+\.(jpg|jpeg|png|webp|gif))"' | grep -oP '/[^"]+' || true)"
if [ "$BROKEN_SYMLINKS" -eq 0 ]; then
    check_pass "No broken or cross-ship image symlinks"
fi

# ============================================================================
# Section 9ak: Browse All Link Leaking Into Heading (#1322)
# ============================================================================
section_header "Section 9ak: Dining Heading Text Leak"

DINING_H2=$(echo "$CONTENT" | grep -oP '<h2 id="diningHeading">[^<]*' | head -1)
if [ -n "$DINING_H2" ] && echo "$DINING_H2" | grep -q '→ Browse All'; then
    check_fail "Dining heading contains raw '→ Browse All' text — should be inside a styled <a> tag, not bare text (#1322)"
elif echo "$CONTENT" | grep -q 'diningHeading.*Browse All.*</a>.*</h2>'; then
    check_pass "Dining heading has Browse All as styled link (correct)"
elif echo "$CONTENT" | grep -q 'diningHeading'; then
    check_pass "Dining heading present (no Browse All link)"
else
    check_pass "No dining heading found (N/A)"
fi

# ============================================================================
# Section 9al: FAQ Missing Class Name (#1323)
# ============================================================================
section_header "Section 9al: FAQ Class Name Completeness"

FAQ_BLANK_CLASS=$(echo "$CONTENT" | grep -cP 'is a (ship|cruise ship)[,.]' || true)
if [ "$FAQ_BLANK_CLASS" -gt 0 ]; then
    check_fail "FAQ/intro text says 'is a ship' without class name ($FAQ_BLANK_CLASS occurrence(s)) — should be 'is a [Class Name] ship' (#1323)"
else
    check_pass "No missing class names in FAQ/intro text"
fi

# ============================================================================
# Section 9am: Dining Category Labels Completeness (#1324)
# ============================================================================
section_header "Section 9am: Dining Category Labels"

if echo "$CONTENT" | grep -q 'catLabels'; then
    if [ -n "$SHIP_SLUG" ] && [ -f "$VENUES_FILE" ]; then
        MISSING_CATS=$(python3 -c "
import json
try:
    with open('$VENUES_FILE') as f: d = json.load(f)
    ship = d.get('ships', {}).get('$SHIP_SLUG', {})
    venue_slugs = ship.get('venues', [])
    venues_by_slug = {v['slug']: v for v in d.get('venues', [])}
    cats = set()
    for vs in venue_slugs:
        slug = vs if isinstance(vs, str) else vs.get('slug','')
        v = venues_by_slug.get(slug, {})
        cat = v.get('category', 'other')
        if cat != 'dining': cats.add(cat)
    known = {'mdr','specialty','casual','bar','bars','dining','activities','entertainment','neighborhoods','other'}
    missing = cats - known
    if missing: print(','.join(sorted(missing)))
except: pass
" 2>/dev/null)
        if [ -n "$MISSING_CATS" ]; then
            check_warn "Venue categories not in catLabels: $MISSING_CATS — these render as 'undefined' headings (#1324)"
        else
            check_pass "All venue categories have labels in catLabels"
        fi
    else
        check_pass "Category label check skipped (no ship/venues data)"
    fi
else
    check_pass "No inline catLabels (may use external dining-card.js)"
fi

# ============================================================================
# Section 9an: Sections Inside Main Content Region (#1326)
# ============================================================================
section_header "Section 9an: Content Region Integrity"

COL1_END=$(echo "$CONTENT" | grep -n 'End Main Content Column' | tail -1 | cut -d: -f1)
FAQ_LINE=$(echo "$CONTENT" | grep -n 'id="faq"\|class="faq-section"' | head -1 | cut -d: -f1)
if [ -n "$COL1_END" ] && [ -n "$FAQ_LINE" ]; then
    if [ "$FAQ_LINE" -gt "$COL1_END" ]; then
        check_fail "FAQ section (line $FAQ_LINE) is OUTSIDE main content region (col-1 ends line $COL1_END) (#1326)"
    else
        check_pass "FAQ section is inside main content region"
    fi
else
    check_pass "Content region check skipped (insufficient landmarks)"
fi

# ============================================================================
# Section 9ao: Dining Venue Name Completeness (#1330)
# ============================================================================
section_header "Section 9ao: Dining Venue Names"

DINING_NOSCRIPT=$(echo "$CONTENT" | sed -n '/id="dining-content"/,/<\/noscript>/p')
if [ -n "$DINING_NOSCRIPT" ]; then
    NAMELESS_VENUES=$(echo "$DINING_NOSCRIPT" | grep -cP '<li>\s*—' || true)
    if [ "$NAMELESS_VENUES" -gt 0 ]; then
        check_fail "Dining noscript has $NAMELESS_VENUES venue(s) with no name (renders as '— description') (#1330)"
    else
        check_pass "All dining noscript venues have names"
    fi
else
    check_pass "No dining noscript content to check"
fi

# ============================================================================
# Section 9ap: Retired Ship Loading State (#1332)
# ============================================================================
section_header "Section 9ap: Retired Ship Loading State"

if [ "$IS_RETIRED" -eq 1 ]; then
    if echo "$CONTENT" | grep -q 'Dining data is loading\|dining.*loading\.\.\.' ; then
        check_fail "Retired ship has permanent 'Dining data is loading...' message — should show 'no data available' (#1332)"
    else
        check_pass "No stuck loading states on retired ship page"
    fi
else
    check_pass "Ship not retired (N/A)"
fi

# ============================================================================
# Section 9aq: Sister Ship Link Integrity (#1333)
# ============================================================================
section_header "Section 9aq: Sister Ship Link Integrity"

SIBLINGS_LIST_AQ=$(echo "$CONTENT" | grep -oP 'siblings:\s*\K.*' | head -1)
if [ -n "$SIBLINGS_LIST_AQ" ]; then
    BROKEN_SIBLINGS=0
    while IFS= read -r sib_url; do
        [ -z "$sib_url" ] && continue
        SIB_PATH=$(echo "$sib_url" | sed 's|^/||')
        if [ ! -f "${REPO_ROOT}/${SIB_PATH}" ]; then
            check_fail "Sister ship link broken: $sib_url does not exist on disk (#1333)"
            BROKEN_SIBLINGS=$((BROKEN_SIBLINGS + 1))
        fi
    done <<< "$(echo "$SIBLINGS_LIST_AQ" | tr ',' '\n' | sed 's/^ *//;s/ *$//')"
    if [ "$BROKEN_SIBLINGS" -eq 0 ]; then
        check_pass "All sister ship links resolve to existing files"
    fi
else
    check_pass "No siblings list found (N/A)"
fi

# ============================================================================
# Section 9ar: Article Grammar — "a" Before Vowel Sounds (#1334)
# ============================================================================
section_header "Section 9ar: Article Grammar"

GRAMMAR_ERRORS=$(echo "$CONTENT" | grep -ciP '\b[Aa] [AEIOU][a-z]' || true)
# Subtract false positives: "a URL", "a UK", normal prose
FALSE_POS=$(echo "$CONTENT" | grep -ciP '\ba (URL|UK|US|EU)\b' || true)
GRAMMAR_ERRORS=$((GRAMMAR_ERRORS - FALSE_POS))
if [ "$GRAMMAR_ERRORS" -gt 0 ]; then
    check_warn "Found $GRAMMAR_ERRORS 'a [vowel-sound]' grammar error(s) — should be 'an' (#1334)"
else
    check_pass "No a/an grammar errors detected"
fi

# ============================================================================
# Section 9as: Attribution Empty Parentheses (#1336)
# ============================================================================
section_header "Section 9as: Attribution Rendering"

ATTR_BLOCK_AS=$(echo "$CONTENT" | sed -n '/class="card attributions"/,/<\/section>/p')
if [ -n "$ATTR_BLOCK_AS" ]; then
    EMPTY_PARENS=$(echo "$ATTR_BLOCK_AS" | grep -cP '\(\s*\)|\(\s*<a[^>]*>\s*</a>\s*\)' || true)
    if [ "$EMPTY_PARENS" -gt 0 ]; then
        check_fail "Attribution section has $EMPTY_PARENS empty parentheses '()' — photographer name not rendering (#1336)"
    else
        check_pass "No empty parentheses in attributions"
    fi
else
    check_pass "No attributions section (N/A)"
fi

# ============================================================================
# Section 9at: Key Facts Field Count Consistency (#1337)
# ============================================================================
section_header "Section 9at: Key Facts Field Count"

KEY_FACTS_COUNT=$(echo "$CONTENT" | sed -n '/class="key-facts"/,/<\/div>/p' | grep -c '<li>' || true)
if [ "$KEY_FACTS_COUNT" -gt 0 ]; then
    if [ "$KEY_FACTS_COUNT" -lt 4 ]; then
        check_warn "Key Facts has only $KEY_FACTS_COUNT fields — reference pages have 7+ fields (#1337)"
    else
        check_pass "Key Facts has $KEY_FACTS_COUNT fields"
    fi
else
    check_pass "No Key Facts section found (N/A)"
fi

# ============================================================================
# Section 9au: GT Consistency — Page vs Fleet Listing (#1327/#1329)
# ============================================================================
section_header "Section 9au: Tonnage Consistency"

if [ -n "$SHIP_SLUG" ] && [ -f "${REPO_ROOT}/ships.html" ]; then
    PAGE_GT=$(echo "$CONTENT" | grep -oP '"gt"\s*:\s*"\K[^"]+' | head -1 | grep -oP '[\d,]+' | head -1 | tr -d ',')
    FLEET_GT=$(grep -A3 "$SHIP_SLUG" "${REPO_ROOT}/ships.html" | grep -oP '[\d,]+\s*GT' | head -1 | grep -oP '[\d,]+' | tr -d ',')
    if [ -n "$PAGE_GT" ] && [ -n "$FLEET_GT" ]; then
        if [ "$PAGE_GT" = "$FLEET_GT" ]; then
            check_pass "GT consistent: page ($PAGE_GT) matches fleet listing ($FLEET_GT)"
        else
            check_warn "GT mismatch: page says $PAGE_GT but fleet listing says $FLEET_GT (#1327/#1329)"
        fi
    else
        check_pass "GT cross-check skipped (insufficient data)"
    fi
else
    check_pass "GT cross-check skipped (no slug or fleet page)"
fi

# ============================================================================
# Section 9av: Venue Data vs Noscript Coverage (#1325)
# ============================================================================
section_header "Section 9av: Venue Noscript Coverage"

if [ -n "$SHIP_SLUG" ] && [ -f "$VENUES_FILE" ]; then
    VENUE_COVERAGE=$(python3 -c "
import json, re, sys
with open('$VENUES_FILE') as f: d = json.load(f)
ship = d.get('ships', {}).get('$SHIP_SLUG', {})
venue_slugs = ship.get('venues', [])
vbs = {v['slug']: v for v in d.get('venues', [])}
# Count venues by category
cats = {}
for vs in venue_slugs:
    slug = vs if isinstance(vs, str) else vs.get('slug','')
    v = vbs.get(slug, {})
    cat = v.get('category', 'other')
    cats[cat] = cats.get(cat, 0) + 1
total = sum(cats.values())
# Check noscript content
html = sys.stdin.read()
ns = re.search(r'id=\"dining-content\".*?</noscript>', html, re.DOTALL)
ns_items = len(re.findall(r'<li>', ns.group())) if ns else 0
# Report
if total == 0:
    print('none')
elif ns_items == 0:
    print('empty|{}'.format(total))
elif ns_items < total * 0.5:
    print('partial|{}|{}'.format(ns_items, total))
else:
    print('ok|{}|{}'.format(ns_items, total))
" <<< "$CONTENT" 2>/dev/null)
    case "$VENUE_COVERAGE" in
        none)
            check_pass "No venue data for this ship (N/A)" ;;
        empty*)
            DB_TOTAL=$(echo "$VENUE_COVERAGE" | cut -d'|' -f2)
            check_warn "Ship has $DB_TOTAL venues in database but noscript is empty — no-JS users see nothing" ;;
        partial*)
            NS_COUNT=$(echo "$VENUE_COVERAGE" | cut -d'|' -f2)
            DB_TOTAL=$(echo "$VENUE_COVERAGE" | cut -d'|' -f3)
            check_warn "Noscript has $NS_COUNT items but database has $DB_TOTAL venues — missing categories (bars, entertainment, activities?)" ;;
        ok*)
            NS_COUNT=$(echo "$VENUE_COVERAGE" | cut -d'|' -f2)
            DB_TOTAL=$(echo "$VENUE_COVERAGE" | cut -d'|' -f3)
            check_pass "Noscript covers $NS_COUNT of $DB_TOTAL venues" ;;
        *)
            check_pass "Venue coverage check skipped" ;;
    esac
else
    check_pass "Venue coverage check skipped"
fi

# ============================================================================
# Section 9aw: Noscript Dining Matches Ship's Actual Venues (#1338)
# ============================================================================
section_header "Section 9aw: Noscript Dining Accuracy"

if [ -n "$SHIP_SLUG" ] && [ -f "$VENUES_FILE" ]; then
    MISMATCH_RESULT=$(python3 -c "
import json, re
try:
    with open('$VENUES_FILE') as f: d = json.load(f)
    ship = d.get('ships', {}).get('$SHIP_SLUG', {})
    venue_slugs = ship.get('venues', [])
    if not venue_slugs:
        print('skip'); exit()
    venues_by_slug = {v['slug']: v for v in d.get('venues', [])}
    # Get actual venue names for this ship
    actual_names = set()
    for vs in venue_slugs:
        slug = vs if isinstance(vs, str) else vs.get('slug','')
        v = venues_by_slug.get(slug, {})
        name = v.get('name', '')
        if name and v.get('category') == 'dining':
            actual_names.add(name.lower().strip())
    if not actual_names:
        print('skip'); exit()
    # Read noscript dining content from stdin
    import sys
    html = sys.stdin.read()
    m = re.search(r'id=\"dining-content\".*?</noscript>', html, re.DOTALL)
    if not m:
        print('skip'); exit()
    noscript = m.group()
    # Extract venue names from <strong> tags in noscript
    ns_names = set()
    for match in re.finditer(r'<strong[^>]*>(?:<a[^>]*>)?([^<]+)', noscript):
        ns_names.add(match.group(1).lower().strip())
    if not ns_names:
        print('skip'); exit()
    # Check if noscript names are a subset of actual names
    missing_from_data = ns_names - actual_names
    # Filter out generic labels like 'main dining', 'specialty dining'
    generic = {'main dining', 'specialty dining', 'bars & lounges', 'casual dining'}
    missing_real = missing_from_data - generic
    if len(missing_real) > len(ns_names) * 0.5:
        print('generic:{}'.format(len(missing_real)))
    else:
        print('ok')
except Exception as e:
    print('skip')
" <<< "$CONTENT" 2>/dev/null)
    if echo "$MISMATCH_RESULT" | grep -q '^generic:'; then
        GENERIC_COUNT=$(echo "$MISMATCH_RESULT" | cut -d: -f2)
        check_warn "Noscript dining has $GENERIC_COUNT venue(s) not in this ship's venues-v2.json data — may be generic template (#1338)"
    elif [ "$MISMATCH_RESULT" = "ok" ]; then
        check_pass "Noscript dining venues match ship's actual venue data"
    else
        check_pass "Noscript dining accuracy check skipped"
    fi
else
    check_pass "Noscript dining accuracy check skipped"
fi

# ============================================================================
# Section 9ax: Rendering Artifact "50+" (#1206)
# ============================================================================
section_header "Section 9ax: Rendering Artifacts"

# Check for "50+" or similar numeric artifacts appearing as visible text
# Strip scripts, styles, and noscript blocks first, then look for orphaned "50+"
VISIBLE_TEXT=$(echo "$CONTENT" | sed 's/<script[^>]*>.*<\/script>//g' | sed 's/<style[^>]*>.*<\/style>//g' | sed 's/<[^>]*>//g')
ARTIFACT_50=$(echo "$VISIBLE_TEXT" | grep -cP '(?<!\d)50\+(?!\d)' || true)
if [ "$ARTIFACT_50" -gt 0 ]; then
    # Check if it's in a reasonable context (e.g., "50+ dining venues" is fine)
    BARE_50=$(echo "$VISIBLE_TEXT" | grep -P '(?<!\d)50\+(?!\d)' | grep -cvP 'dining|venue|restaurant|activit|feature|deck|pool|bar|lounge|show|shop|port|destination|excursion' || true)
    if [ "$BARE_50" -gt 0 ]; then
        check_warn "Found $BARE_50 possible '50+' rendering artifact(s) — may be a template variable that didn't resolve (#1206)"
    else
        check_pass "All '50+' occurrences appear in valid content context"
    fi
else
    check_pass "No '50+' rendering artifacts detected"
fi

# ============================================================================
# Section 9ay: Fleet Page Ship Count Accuracy (#1335)
# ============================================================================
section_header "Section 9ay: Fleet Page Cross-Check"

# Only runs when validating a ship page — checks if this ship appears in ships.html
if [ -n "$SHIP_SLUG" ] && [ -f "${REPO_ROOT}/ships.html" ]; then
    if grep -q "$SHIP_SLUG" "${REPO_ROOT}/ships.html"; then
        check_pass "Ship '$SHIP_SLUG' found in fleet listing (ships.html)"
    else
        if [ "$IS_RETIRED" -eq 1 ]; then
            check_pass "Retired ship not expected in active fleet listing"
        else
            check_warn "Ship '$SHIP_SLUG' NOT found in fleet listing (ships.html) — may be missing from fleet table (#1335)"
        fi
    fi
else
    check_pass "Fleet cross-check skipped"
fi

# ============================================================================
# Section 9az: Crew Count Consistency (#3 in master list)
# ============================================================================
section_header "Section 9az: Crew Count Consistency"

SPEC_CREW=$(echo "$CONTENT" | grep -A2 'spec-label.*Crew\|spec-label">Crew' | grep -oP '[\d,]+' | head -1 | tr -d ',')
JSON_CREW=$(echo "$CONTENT" | grep -oP '"crew"\s*:\s*"\K[^"]+' | head -1 | tr -d ',~')
STAT_CREW=$(echo "$CONTENT" | grep -A1 'label">Crew\|label.*>Crew' | grep -oP '[\d,]+' | head -1 | tr -d ',')
CREWS=""
[ -n "$SPEC_CREW" ] && CREWS="$SPEC_CREW"
[ -n "$JSON_CREW" ] && [ "$JSON_CREW" != "$SPEC_CREW" ] && CREWS="$CREWS $JSON_CREW"
[ -n "$STAT_CREW" ] && [ "$STAT_CREW" != "$SPEC_CREW" ] && [ "$STAT_CREW" != "$JSON_CREW" ] && CREWS="$CREWS $STAT_CREW"
CREW_UNIQUE=$(echo $CREWS | tr ' ' '\n' | sort -u | grep -c '[0-9]')
if [ "$CREW_UNIQUE" -gt 1 ]; then
    check_warn "Crew count mismatch: specs=$SPEC_CREW json=$JSON_CREW stats=$STAT_CREW"
else
    check_pass "Crew count consistent"
fi

# ============================================================================
# Section 9ba: Cordelia Dining Image (#7)
# ============================================================================
section_header "Section 9ba: Dining Hero Image"

if echo "$CONTENT" | grep -q 'Cordelia_Empress_Food_Court'; then
    check_warn "Dining hero uses Cordelia Empress Food Court image — wrong cruise line for this ship"
else
    check_pass "No Cordelia dining image detected"
fi

# ============================================================================
# Section 9bb: Generic FAQ Boilerplate (#8)
# ============================================================================
section_header "Section 9bb: FAQ Specificity"

GENERIC_FAQ=$(echo "$CONTENT" | grep -cP 'Specialty restaurants vary by ship|Ship deployments vary by season|planning resources and community insights' || true)
if [ "$GENERIC_FAQ" -ge 3 ]; then
    check_warn "FAQ answers are generic boilerplate ($GENERIC_FAQ template phrases) — no ship-specific dining/itinerary information"
else
    check_pass "FAQ answers appear ship-specific"
fi

# ============================================================================
# Section 9bc: Luxury Line Content Mismatch (#9)
# ============================================================================
section_header "Section 9bc: Content Appropriate for Line"

CRUISE_LINE=$(echo "$CONTENT" | grep -oP 'cruise-line:\s*\K.*' | head -1 | sed 's/[[:space:]]*$//')
IS_LUXURY=0
case "$CRUISE_LINE" in
    *Silversea*|*Seabourn*|*Regent*|*Oceania*|*Cunard*|*Explora*) IS_LUXURY=1 ;;
esac
if [ "$IS_LUXURY" -eq 1 ] && echo "$CONTENT" | grep -q 'different travel styles and budgets'; then
    check_warn "Content says 'different travel styles and budgets' — inappropriate for luxury line $CRUISE_LINE"
else
    check_pass "Content appropriate for cruise line"
fi

# ============================================================================
# Section 9bd: Swiper Version Mismatch (#11)
# ============================================================================
section_header "Section 9bd: Swiper Version Consistency"

SWIPER_CSS_VER=$(echo "$CONTENT" | grep -oP 'swiper@\K\d+' | head -1)
SWIPER_JS_VER=$(echo "$CONTENT" | grep -oP 'swiper@\K\d+' | tail -1)
if [ -n "$SWIPER_CSS_VER" ] && [ -n "$SWIPER_JS_VER" ] && [ "$SWIPER_CSS_VER" != "$SWIPER_JS_VER" ]; then
    check_warn "Swiper version mismatch: CSS loads @$SWIPER_CSS_VER, JS fallback loads @$SWIPER_JS_VER"
else
    check_pass "Swiper versions consistent"
fi

# ============================================================================
# Section 9be: Page Grid Layout (#12)
# ============================================================================
section_header "Section 9be: Page Grid Layout"

if echo "$CONTENT" | grep -q 'class=".*page-grid'; then
    check_pass "Main element has page-grid class (2-column layout)"
else
    check_warn "Main element missing page-grid class — 2-column layout won't activate"
fi

# ============================================================================
# Section 9bf: Progressive Enhancement (#13)
# ============================================================================
section_header "Section 9bf: Progressive Enhancement"

if echo "$CONTENT" | grep -q 'class="no-js"\|class=.*no-js'; then
    check_pass "HTML element has no-js class for progressive enhancement"
else
    check_warn "HTML element missing no-js class — progressive enhancement CSS won't work"
fi

# ============================================================================
# Section 9bg: Duplicate Section IDs (#15)
# ============================================================================
section_header "Section 9bg: Duplicate Section IDs"

DUP_IDS=$(echo "$CONTENT" | grep -oP 'id="[^"]+' | sort | uniq -d)
if [ -n "$DUP_IDS" ]; then
    DUP_COUNT=$(echo "$DUP_IDS" | wc -l)
    DUP_LIST=$(echo "$DUP_IDS" | tr '\n' ', ' | sed 's/, $//')
    check_fail "Found $DUP_COUNT duplicate ID(s): $DUP_LIST"
else
    check_pass "No duplicate IDs"
fi

# ============================================================================
# Section 9bh: Placeholder Sections (#17)
# ============================================================================
section_header "Section 9bh: Placeholder Content"

PLACEHOLDER_COUNT=$(echo "$CONTENT" | grep -ciP 'coming soon\.|will appear here\.|details coming soon\.|information coming soon\.' || true)
if [ "$PLACEHOLDER_COUNT" -gt 0 ]; then
    check_warn "Found $PLACEHOLDER_COUNT placeholder section(s) with 'coming soon' / 'will appear here' text"
else
    check_pass "No placeholder sections detected"
fi

# ============================================================================
# Section 9bi: Page Title Leak Into Ship Name (#21)
# ============================================================================
section_header "Section 9bi: Title Leak Into Ship Name"

if echo "$CONTENT" | grep -q 'In the Wake.*cruise ship\|In the Wake.*Class.*ship\|In the Wake.*operated'; then
    check_fail "Site name 'In the Wake' appears in ship description — page title leaking into ship name"
else
    check_pass "No title leak detected"
fi

# ============================================================================
# Section 9bj: H1 Value Proposition (#24)
# ============================================================================
section_header "Section 9bj: H1 Value Proposition"

H1_TEXT=$(echo "$CONTENT" | grep -oP '<h1[^>]*>\K[^<]+' | head -1)
if [ -n "$H1_TEXT" ]; then
    if echo "$H1_TEXT" | grep -qP '—|–|:|\|'; then
        check_pass "H1 has value proposition subtitle: '$H1_TEXT'"
    else
        check_warn "H1 is bare ship name ('$H1_TEXT') — add subtitle like 'Deck Plans, Live Tracker, Dining & Videos'"
    fi
else
    check_pass "H1 check skipped (not found)"
fi

# ============================================================================
# Section 9bk: Embedded Live Tracker (#25)
# ============================================================================
section_header "Section 9bk: Embedded Live Tracker"

if echo "$CONTENT" | grep -q 'vesselfinder\|marinetraffic\|iframe.*track\|vf-tracker-container'; then
    check_pass "Embedded live tracker present"
elif echo "$CONTENT" | grep -q 'liveTrackHeading\|Live.*Tracker\|Where Is'; then
    check_warn "Live tracker section exists but has no embedded iframe — external link only"
else
    check_pass "No tracker section (N/A)"
fi

# ============================================================================
# Section 9bl: Ports / Itinerary Section (#26)
# ============================================================================
section_header "Section 9bl: Ports Section"

if echo "$CONTENT" | grep -qi 'id="ports"\|portsHeading\|Ports on\|Itinerary\|itineraryHeading'; then
    check_pass "Ports/itinerary section present"
else
    check_warn "No ports or itinerary section — users can't see where the ship sails"
fi

# ============================================================================
# Section 9bm: Sister Ships Section (#27)
# ============================================================================
section_header "Section 9bm: Sister Ships Section"

if echo "$CONTENT" | grep -qi 'related-ships\|Sister Ships\|class.*ships\|related-pills'; then
    check_pass "Sister ships / class explorer section present"
else
    check_warn "No sister ships or class explorer section — no cross-navigation to fleet siblings"
fi

# ============================================================================
# Section 9bn: FAQ Truncation (#30)
# ============================================================================
section_header "Section 9bn: FAQ Sentence Completeness"

TRUNC_FAQ=$(echo "$CONTENT" | grep -cP 'departure ports for \.' || true)
if [ "$TRUNC_FAQ" -gt 0 ]; then
    check_fail "FAQ answer truncated: 'departure ports for .' — ship name missing from sentence"
else
    check_pass "No FAQ truncation detected"
fi

# ============================================================================
# Section 9bo: Future Ship Status (#34)
# ============================================================================
section_header "Section 9bo: Future Ship Status"

ENTERED=$(echo "$CONTENT" | grep -oP '"entered_service"\s*:\s*\K\d+' | head -1)
CURRENT_YEAR=$(date +%Y)
if [ -n "$ENTERED" ] && [ "$ENTERED" -ge "$CURRENT_YEAR" ]; then
    if echo "$CONTENT" | grep -qi 'coming soon\|future\|expected\|TBN\|not yet\|under construction'; then
        check_pass "Future ship ($ENTERED) has appropriate status indicators"
    else
        check_warn "Ship enters service $ENTERED (future) but page presents it as if currently sailing"
    fi
else
    check_pass "Ship is current or past service"
fi

# ============================================================================
# Section 9bp: Year Built Consistency (#35)
# ============================================================================
section_header "Section 9bp: Year Built Consistency"

YEAR_SPEC=$(echo "$CONTENT" | grep -A2 'spec-label.*Year\|spec-label">Year' | grep -oP '20\d\d\|19\d\d' | head -1)
YEAR_JSON=$(echo "$CONTENT" | grep -oP '"entered_service"\s*:\s*\K\d+' | head -1)
YEAR_FACT=$(echo "$CONTENT" | grep 'fact-block' | grep -oP 'entered service in \K\d+' | head -1)
if [ -n "$YEAR_SPEC" ] && [ -n "$YEAR_JSON" ] && [ "$YEAR_SPEC" != "$YEAR_JSON" ]; then
    check_warn "Year built mismatch: specs=$YEAR_SPEC vs json=$YEAR_JSON"
elif [ -n "$YEAR_FACT" ] && [ -n "$YEAR_JSON" ] && [ "$YEAR_FACT" != "$YEAR_JSON" ]; then
    check_warn "Year built mismatch: fact-block=$YEAR_FACT vs json=$YEAR_JSON"
else
    check_pass "Year built consistent"
fi

# ============================================================================
# Section 9bq: Duplicate Stats Blocks (#38)
# ============================================================================
section_header "Section 9bq: Duplicate Stats Blocks"

SPECS_COUNT=$(echo "$CONTENT" | grep -c 'specsHeading\|Specifications' || true)
STATS_COUNT=$(echo "$CONTENT" | grep -c 'ship-stats-title\|Ship Statistics' || true)
if [ "$SPECS_COUNT" -gt 0 ] && [ "$STATS_COUNT" -gt 0 ]; then
    check_warn "Page has both Ship Specifications and Ship Statistics sections — redundant data with potential inconsistencies"
else
    check_pass "No duplicate stats blocks"
fi

# ============================================================================
# Section 9br: Construction Banner (#37)
# ============================================================================
section_header "Section 9br: Construction Banner"

if echo "$CONTENT" | grep -qi 'under construction\|page under construction'; then
    check_warn "Page has 'Under Construction' banner visible to users"
else
    check_pass "No construction banner"
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
