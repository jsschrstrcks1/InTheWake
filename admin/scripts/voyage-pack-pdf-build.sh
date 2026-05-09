#!/bin/bash
# voyage-pack-pdf-build.sh — generate PDF deliverables from Voyage Pack markdown sources
#
# Usage:
#   admin/scripts/voyage-pack-pdf-build.sh                  # build all packs
#   admin/scripts/voyage-pack-pdf-build.sh symphony         # build only Symphony
#   admin/scripts/voyage-pack-pdf-build.sh ncl-aqua         # build only NCL Aqua
#   admin/scripts/voyage-pack-pdf-build.sh --help
#
# What this script does:
#   - Detects an available pandoc PDF engine (weasyprint preferred)
#   - Generates a styled PDF from each pack's markdown source
#   - Writes the PDF alongside the markdown source in admin/voyage-packs/
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
# Voyage Pack v0.1 (Symphony) and v0.1.2 (NCL Aqua) closes W12 launch
# checklist Item 4 (file deliverables — PDF version) when both PDFs land.
#
# Soli Deo Gloria.

set -uo pipefail

# Locate repo root regardless of where the script is invoked from
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

PACKS_DIR="admin/voyage-packs"
SYMPHONY_MD="$PACKS_DIR/v0.1-symphony-western-caribbean-7n.md"
NCL_AQUA_MD="$PACKS_DIR/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md"
PDF_CSS="$PACKS_DIR/voyage-pack-print.css"

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

# ----- per-pack build ---------------------------------------------------------
build_pack() {
  local md="$1"
  local label="$2"
  local engine="$3"

  if [ ! -f "$md" ]; then
    echo "  ✗ $label: source not found at $md" >&2
    return 1
  fi

  if [ ! -f "$PDF_CSS" ]; then
    echo "  ✗ $label: stylesheet not found at $PDF_CSS" >&2
    return 1
  fi

  local pdf="${md%.md}.pdf"
  echo "  → $label ($(basename "$md")) using $engine"

  case "$engine" in
    weasyprint|wkhtmltopdf)
      # CSS-based engines: pass our stylesheet through pandoc
      pandoc "$md" \
        --pdf-engine="$engine" \
        --css="$PDF_CSS" \
        --metadata title="In the Wake — Voyage Pack" \
        --metadata author="In the Wake" \
        --toc --toc-depth=2 \
        --standalone \
        -o "$pdf"
      ;;
    xelatex|pdflatex)
      # LaTeX route: use template variables instead of CSS
      pandoc "$md" \
        --pdf-engine="$engine" \
        --metadata title="In the Wake — Voyage Pack" \
        --metadata author="In the Wake" \
        --toc --toc-depth=2 \
        -V geometry:margin=0.85in \
        -V fontsize=11pt \
        -V mainfont="Georgia" \
        -V colorlinks=true \
        -V linkcolor="0a3d62" \
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

# ----- main -------------------------------------------------------------------
case "${1:-all}" in
  -h|--help|help)
    sed -n '2,18p' "$0"
    exit 0
    ;;
esac

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
echo ""

target="${1:-all}"
failures=0

case "$target" in
  symphony)
    build_pack "$SYMPHONY_MD" "Symphony Western Caribbean 7N" "$ENGINE" || failures=$((failures + 1))
    ;;
  ncl-aqua|aqua|ncl)
    build_pack "$NCL_AQUA_MD" "NCL Aqua Veterans/Solo Dec 2027" "$ENGINE" || failures=$((failures + 1))
    ;;
  all|"")
    build_pack "$SYMPHONY_MD" "Symphony Western Caribbean 7N" "$ENGINE" || failures=$((failures + 1))
    build_pack "$NCL_AQUA_MD" "NCL Aqua Veterans/Solo Dec 2027" "$ENGINE" || failures=$((failures + 1))
    ;;
  *)
    echo "✗ Unknown target: $target. Use 'symphony', 'ncl-aqua', or 'all'."
    exit 2
    ;;
esac

echo ""
if [ "$failures" -eq 0 ]; then
  echo "Done. PDFs are alongside their .md sources."
  echo "Next: bundle PDF + HTML into a zip per W12-PRODUCT-LAUNCH-CHECKLIST.md item 4,"
  echo "then upload to your chosen payment processor's product entry."
  exit 0
else
  echo "$failures pack(s) failed to build. See errors above."
  exit 1
fi
