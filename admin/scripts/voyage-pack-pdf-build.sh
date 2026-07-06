#!/bin/bash
# voyage-pack-pdf-build.sh — generate PDF deliverables from Voyage Pack markdown sources
#
# Usage:
#   admin/scripts/voyage-pack-pdf-build.sh                  # build all packs (skip if up-to-date)
#   admin/scripts/voyage-pack-pdf-build.sh long             # build all long-form packs
#   admin/scripts/voyage-pack-pdf-build.sh condensed        # build all condensed (3-page) packs
#   admin/scripts/voyage-pack-pdf-build.sh handoff          # build all handoff cards (incl. agnostic)
#   admin/scripts/voyage-pack-pdf-build.sh symphony         # build only Symphony (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh ncl-aqua         # build only NCL Aqua (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh sisters-sea      # build only Sisters at Sea (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh anthem-alaska    # build only Anthem of the Seas Alaska 7N (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh bliss-solo       # build only NCL Bliss Kristie Alaska Jul 2026 (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh world-america    # build only MSC World America Denise Apr 2027 (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh prima            # build only NCL Prima Tina Solo Group Sep 2026 (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh encore           # build only NCL Encore Allison Vancouver-LA Oct 2026 (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh escape           # build only NCL Escape Thanksgiving Nov 2026 (long-form)
#   admin/scripts/voyage-pack-pdf-build.sh --force          # rebuild even if PDF is newer
#   admin/scripts/voyage-pack-pdf-build.sh --check          # exit 1 if any PDF is stale (no build)
#   admin/scripts/voyage-pack-pdf-build.sh --help
#
# What this script does:
#   - Detects an available pandoc PDF engine (weasyprint preferred)
#   - Idempotent by default: only rebuilds a pack if the .pdf is missing or older than the .md
#   - --force always rebuilds
#   - --check exits non-zero if any pack PDF is stale (used by pre-commit)
#   - Long-form packs use voyage-pack-print.css; condensed packs and handoff cards
#     use voyage-pack-condensed-print.css (tighter layout for 3-page / 1-page formats)
#   - Writes PDFs alongside markdown sources in admin/voyage-packs/ by default.
#     Long-form packs may opt out by setting a non-empty *_PDF override variable
#     to route to a custom path (e.g. ships/norwegian/...). The .md source stays
#     canonical in admin/voyage-packs/ regardless.
#
# Workflow:
#   - Generate the PDF once per pack version (one-time, not on every build)
#   - When the markdown source changes, regenerate (the pre-commit hook
#     enforces this — committing a modified pack .md without rebuilding
#     the .pdf is blocked)
#   - Upload the .pdf to the payment processor's product configuration once
#
# Prerequisites:
#   pandoc (always required):
#     macOS:    brew install pandoc
#     Debian:   apt install pandoc
#   plus ONE of these PDF engines:
#     weasyprint (recommended — best CSS support, pip3 install weasyprint)
#     wkhtmltopdf (legacy fallback, apt install wkhtmltopdf)
#     xelatex / pdflatex (texlive — apt install texlive-latex-recommended)
#
# Soli Deo Gloria.

set -uo pipefail

# Locate repo root regardless of where the script is invoked from
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

PACKS_DIR="admin/voyage-packs"
PDF_CSS_LONG="$PACKS_DIR/voyage-pack-print.css"
PDF_CSS_CONDENSED="$PACKS_DIR/voyage-pack-condensed-print.css"

# ----- Pack registry ---------------------------------------------------------
# Long-form packs: full multi-page Voyage Pack PDFs. Use voyage-pack-print.css.
# Each entry: "md_stem|pdf_output_path" (pdf path is optional override; empty
# = default which is "$PACKS_DIR/$stem.pdf")
LONG_FORM_PACKS=(
  "v0.1-symphony-western-caribbean-7n|"
  "v0.1.2-ncl-aqua-veterans-solo-group-dec-2027|"
  "v0.1.3-virgin-sisters-sea-feb-2027|"
  "v0.1.4-rcl-anthem-alaska-7n|"
  "v0.1.7-ncl-bliss-alaska-solo-group-jul-2026|ships/norwegian/v0.1.7-ncl-bliss-alaska-solo-group-jul-2026.pdf"
  "v0.1.8-msc-world-america-solo-group-apr-2027|ships/msc/v0.1.8-msc-world-america-solo-group-apr-2027.pdf"
  "v0.1.9-ncl-prima-solo-group-sep-2026|ships/norwegian/v0.1.9-ncl-prima-solo-group-sep-2026.pdf"
  "v0.1.10-ncl-encore-solo-group-oct-2026|ships/norwegian/v0.1.10-ncl-encore-solo-group-oct-2026.pdf"
  "v0.1.11-ncl-escape-thanksgiving-solo-group-nov-2026|ships/norwegian/v0.1.11-ncl-escape-thanksgiving-solo-group-nov-2026.pdf"
  "v0.1.12-mas-islander-solo-group-jan-2027|"
)

# Condensed 3-page packs: distilled pocket reference. Use voyage-pack-condensed-print.css.
# Always next to source (no override convention).
CONDENSED_PACKS=(
  "v0.1-symphony-western-caribbean-condensed"
  "v0.1.2-ncl-aqua-veterans-solo-group-condensed"
  "v0.1.3-virgin-sisters-sea-condensed"
  "v0.1.4-rcl-anthem-alaska-condensed"
  "v0.1.7-ncl-bliss-alaska-condensed"
  "v0.1.8-msc-world-america-condensed"
  "v0.1.9-ncl-prima-solo-group-condensed"
  "v0.1.10-ncl-encore-solo-group-condensed"
  "v0.1.11-ncl-escape-thanksgiving-solo-group-condensed"
)

# Handoff cards: 1-2 page emergency contact docs. Use voyage-pack-condensed-print.css.
# Sailing-specific cards (Bliss, World America, Prima) + one sailing-agnostic master card.
HANDOFF_CARDS=(
  "v0.1.7-ncl-bliss-handoff-card"
  "v0.1.8-msc-world-america-handoff-card"
  "v0.1.9-ncl-prima-handoff-card"
  "v0.1.10-ncl-encore-handoff-card"
  "v0.1.11-ncl-escape-thanksgiving-handoff-card"
  "emergency-handoff-card-agnostic"
)

# Mode flags
FORCE=0
CHECK_ONLY=0

# ----- engine detection -------------------------------------------------------
detect_pdf_engine() {
  for engine in weasyprint wkhtmltopdf xelatex pdflatex; do
    if command -v "$engine" >/dev/null 2>&1; then
      echo "$engine"
      return 0
    fi
  done
  return 1
}

# ----- registry helpers -------------------------------------------------------
# Parse a LONG_FORM_PACKS entry "stem|pdf" into stem + resolved PDF path
long_form_md() {
  local entry="$1"
  echo "$PACKS_DIR/${entry%%|*}.md"
}
long_form_pdf() {
  local entry="$1"
  local override="${entry#*|}"
  if [ -n "$override" ]; then
    echo "$override"
  else
    echo "$PACKS_DIR/${entry%%|*}.pdf"
  fi
}
long_form_label() {
  local entry="$1"
  echo "${entry%%|*}"
}

# For condensed and handoff (no override), simpler resolvers
simple_md() {
  echo "$PACKS_DIR/$1.md"
}
simple_pdf() {
  echo "$PACKS_DIR/$1.pdf"
}

# ----- staleness check --------------------------------------------------------
# Returns 0 (stale) if PDF is missing OR if .md source is newer than .pdf
pdf_is_stale() {
  local md="$1"
  local pdf="$2"
  if [ ! -f "$pdf" ]; then return 0; fi
  if [ "$md" -nt "$pdf" ]; then return 0; fi
  return 1
}

# ----- per-pack build ---------------------------------------------------------
# Args: md_path  label  engine  pdf_output  css_file
build_pack() {
  local md="$1"
  local label="$2"
  local engine="$3"
  local pdf="$4"
  local css="$5"

  if [ ! -f "$md" ]; then
    echo "  ✗ $label: source not found at $md" >&2
    return 1
  fi
  if [ ! -f "$css" ]; then
    echo "  ✗ $label: stylesheet not found at $css" >&2
    return 1
  fi

  mkdir -p "$(dirname "$pdf")"

  # Idempotency: skip if PDF is newer than .md (unless --force) and CSS too
  if [ "$FORCE" -eq 0 ] && [ -f "$pdf" ] && [ "$pdf" -nt "$md" ] && [ "$pdf" -nt "$css" ]; then
    echo "  · $label: up-to-date, skipping"
    return 0
  fi

  echo "  → $label ($(basename "$md")) using $engine"

  case "$engine" in
    weasyprint|wkhtmltopdf)
      # Convert /asset/path-style markdown image refs into file:// URLs
      # weasyprint can resolve. Also handles src="/..." in inline HTML img tags.
      sed "s|](/|](file://$REPO_ROOT/|g; s|src=\"/|src=\"file://$REPO_ROOT/|g" "$md" | pandoc \
        --pdf-engine="$engine" \
        --css="$css" \
        --metadata author="In the Wake" \
        --standalone \
        -o "$pdf"
      ;;
    xelatex|pdflatex)
      pandoc "$md" \
        --pdf-engine="$engine" \
        --metadata title="In the Wake — Voyage Pack" \
        --metadata author="In the Wake" \
        --toc --toc-depth=2 \
        -V geometry:margin=0.85in \
        -V fontsize=11pt \
        -V mainfont="Georgia" \
        -V colorlinks=true \
        -V linkcolor="0e6e8e" \
        -o "$pdf"
      ;;
    *)
      echo "  ✗ unsupported engine: $engine" >&2
      return 1
      ;;
  esac

  if [ -f "$pdf" ]; then
    local size
    size=$(wc -c < "$pdf")
    echo "  ✓ $label → $pdf ($((size / 1024))KB)"
    return 0
  else
    echo "  ✗ $label: build failed (no output)" >&2
    return 1
  fi
}

# ----- check-only mode --------------------------------------------------------
run_check_only() {
  local stale=0
  echo "Voyage Pack PDF staleness check"
  echo ""

  echo "Long-form packs:"
  for entry in "${LONG_FORM_PACKS[@]}"; do
    local md pdf label
    md="$(long_form_md "$entry")"
    pdf="$(long_form_pdf "$entry")"
    label="$(long_form_label "$entry")"
    [ -f "$md" ] || continue
    if pdf_is_stale "$md" "$pdf"; then
      if [ ! -f "$pdf" ]; then echo "  ✗ $label: PDF MISSING ($pdf)"
      else echo "  ✗ $label: PDF STALE ($pdf older than source)"; fi
      stale=$((stale + 1))
    else
      echo "  ✓ $label"
    fi
  done

  echo ""
  echo "Condensed packs:"
  for stem in "${CONDENSED_PACKS[@]}"; do
    local md pdf
    md="$(simple_md "$stem")"
    pdf="$(simple_pdf "$stem")"
    [ -f "$md" ] || continue
    if pdf_is_stale "$md" "$pdf"; then
      if [ ! -f "$pdf" ]; then echo "  ✗ $stem: PDF MISSING"
      else echo "  ✗ $stem: PDF STALE"; fi
      stale=$((stale + 1))
    else
      echo "  ✓ $stem"
    fi
  done

  echo ""
  echo "Handoff cards:"
  for stem in "${HANDOFF_CARDS[@]}"; do
    local md pdf
    md="$(simple_md "$stem")"
    pdf="$(simple_pdf "$stem")"
    [ -f "$md" ] || continue
    if pdf_is_stale "$md" "$pdf"; then
      if [ ! -f "$pdf" ]; then echo "  ✗ $stem: PDF MISSING"
      else echo "  ✗ $stem: PDF STALE"; fi
      stale=$((stale + 1))
    else
      echo "  ✓ $stem"
    fi
  done

  echo ""
  if [ "$stale" -gt 0 ]; then
    echo "$stale PDF(s) need a rebuild. Run:"
    echo "    admin/scripts/voyage-pack-pdf-build.sh"
    return 1
  fi
  return 0
}

# ----- batch builders ---------------------------------------------------------
build_all_long_form() {
  local engine="$1" failures=0
  for entry in "${LONG_FORM_PACKS[@]}"; do
    local md pdf label
    md="$(long_form_md "$entry")"
    pdf="$(long_form_pdf "$entry")"
    label="$(long_form_label "$entry")"
    build_pack "$md" "$label" "$engine" "$pdf" "$PDF_CSS_LONG" || failures=$((failures + 1))
  done
  return $failures
}

build_all_condensed() {
  local engine="$1" failures=0
  for stem in "${CONDENSED_PACKS[@]}"; do
    build_pack "$(simple_md "$stem")" "$stem" "$engine" "$(simple_pdf "$stem")" "$PDF_CSS_CONDENSED" || failures=$((failures + 1))
  done
  return $failures
}

build_all_handoff() {
  local engine="$1" failures=0
  for stem in "${HANDOFF_CARDS[@]}"; do
    build_pack "$(simple_md "$stem")" "$stem" "$engine" "$(simple_pdf "$stem")" "$PDF_CSS_CONDENSED" || failures=$((failures + 1))
  done
  return $failures
}

# Build a specific long-form pack by stem prefix
build_one_long() {
  local prefix="$1" engine="$2" failures=0 found=0
  for entry in "${LONG_FORM_PACKS[@]}"; do
    if [[ "$(long_form_label "$entry")" == *"$prefix"* ]]; then
      local md pdf label
      md="$(long_form_md "$entry")"
      pdf="$(long_form_pdf "$entry")"
      label="$(long_form_label "$entry")"
      build_pack "$md" "$label" "$engine" "$pdf" "$PDF_CSS_LONG" || failures=$((failures + 1))
      found=1
    fi
  done
  if [ "$found" -eq 0 ]; then
    echo "✗ No long-form pack matched prefix: $prefix" >&2
    return 1
  fi
  return $failures
}

# ----- main -------------------------------------------------------------------
target=""
for arg in "$@"; do
  case "$arg" in
    -h|--help|help)
      sed -n '2,30p' "$0"
      exit 0
      ;;
    --force) FORCE=1 ;;
    --check) CHECK_ONLY=1 ;;
    long|long-form|condensed|handoff|symphony|ncl-aqua|aqua|ncl|sisters-sea|sisters|virgin|anthem-alaska|anthem|alaska|bliss-solo|bliss|world-america|wa|prima|prima-solo|encore|encore-solo|escape|escape-solo|thanksgiving|margaritaville|mas|islander|all)
      target="$arg" ;;
    *)
      echo "Unknown argument: $arg. Use --help for usage."
      exit 2
      ;;
  esac
done

if [ "$CHECK_ONLY" -eq 1 ]; then
  run_check_only
  exit $?
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "✗ pandoc is required. Install:"
  echo "    brew install pandoc      (macOS)"
  echo "    apt install pandoc       (Debian/Ubuntu)"
  exit 1
fi

ENGINE=$(detect_pdf_engine || true)
if [ -z "$ENGINE" ]; then
  echo "✗ No PDF engine found. Install ONE of:"
  echo "    pip3 install weasyprint                (recommended — best CSS)"
  echo "    apt install wkhtmltopdf                (legacy fallback)"
  echo "    apt install texlive-latex-recommended  (xelatex/pdflatex)"
  exit 1
fi

echo "Voyage Pack PDF build"
echo "  pandoc  : $(command -v pandoc)"
echo "  engine  : $ENGINE"
echo "  packs   : $PACKS_DIR"
echo "  mode    : $([ "$FORCE" -eq 1 ] && echo "force-rebuild" || echo "idempotent (skip if up-to-date)")"
echo ""

target="${target:-all}"
failures=0

case "$target" in
  long|long-form)
    echo "── Long-form packs ──"
    build_all_long_form "$ENGINE" || failures=$((failures + $?))
    ;;
  condensed)
    echo "── Condensed packs ──"
    build_all_condensed "$ENGINE" || failures=$((failures + $?))
    ;;
  handoff)
    echo "── Handoff cards ──"
    build_all_handoff "$ENGINE" || failures=$((failures + $?))
    ;;
  symphony) build_one_long "symphony" "$ENGINE" || failures=$((failures + $?)) ;;
  ncl-aqua|aqua|ncl) build_one_long "ncl-aqua" "$ENGINE" || failures=$((failures + $?)) ;;
  sisters-sea|sisters|virgin) build_one_long "sisters-sea" "$ENGINE" || failures=$((failures + $?)) ;;
  anthem-alaska|anthem|alaska) build_one_long "anthem-alaska" "$ENGINE" || failures=$((failures + $?)) ;;
  bliss-solo|bliss) build_one_long "bliss" "$ENGINE" || failures=$((failures + $?)) ;;
  world-america|wa) build_one_long "world-america" "$ENGINE" || failures=$((failures + $?)) ;;
  prima|prima-solo) build_one_long "prima" "$ENGINE" || failures=$((failures + $?)) ;;
  encore|encore-solo) build_one_long "encore" "$ENGINE" || failures=$((failures + $?)) ;;
  escape|escape-solo|thanksgiving) build_one_long "escape" "$ENGINE" || failures=$((failures + $?)) ;;
  margaritaville|mas|islander) build_one_long "islander" "$ENGINE" || failures=$((failures + $?)) ;;
  all|"")
    echo "── Long-form packs ──"
    build_all_long_form "$ENGINE" || failures=$((failures + $?))
    echo ""
    echo "── Condensed packs ──"
    build_all_condensed "$ENGINE" || failures=$((failures + $?))
    echo ""
    echo "── Handoff cards ──"
    build_all_handoff "$ENGINE" || failures=$((failures + $?))
    ;;
  *)
    echo "✗ Unknown target: $target. See --help for valid options."
    exit 2
    ;;
esac

echo ""
if [ "$failures" -eq 0 ]; then
  echo "Done. PDFs are alongside their .md sources (or at override paths for long-form packs)."
  echo "Re-uploading the .pdf to your payment processor's product entry is only"
  echo "needed when the .md source changes (the pre-commit hook will block"
  echo "commits that change a pack .md without an updated .pdf)."
  exit 0
else
  echo "$failures build(s) failed. See errors above."
  exit 1
fi
