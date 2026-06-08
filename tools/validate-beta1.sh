#!/usr/bin/env bash
# validate-beta1.sh — "Quiet Harbor" design contract + shared floor.
# Usage: tools/validate-beta1.sh <page.html>
# Exit 0 = pass, 1 = fail. Modeled on admin/validate-ship-page.sh.
set -u
f="${1:?usage: validate-beta1.sh <page.html>}"
[ -f "$f" ] || { echo "FAIL: no such file: $f"; exit 1; }
root="$(cd "$(dirname "$0")/.." && pwd)"
fails=0
ok(){ printf '  ok   %s\n' "$1"; }
bad(){ printf '  FAIL %s\n' "$1"; fails=$((fails+1)); }

echo "validate-beta1 (Quiet Harbor): $f"

# --- Shared floor -----------------------------------------------------------
head -n 20 "$f" | grep -q "Soli Deo Gloria" && ok "SDG comment before line 20" || bad "SDG comment missing in first 20 lines"
grep -qi 'name="robots"[^>]*noindex' "$f" && ok "noindex present (beta)" || bad "noindex missing (beta must not be indexed)"
grep -q 'name="ai-summary"' "$f" && grep -q 'name="last-reviewed"' "$f" && grep -q 'name="content-protocol"' "$f" && ok "ICP-2 metas present" || bad "ICP-2 metas incomplete"
grep -qiE 'style[[:space:]]*=' "$f" && bad "inline style= attribute present (floor: none)" || ok "no inline styles"
# WebP-only images: no <img> pointing at jpg/jpeg/png. (flatten first — tags span lines)
flat=$(tr '\n' ' ' < "$f")
if printf '%s' "$flat" | grep -oiE '<img\b[^>]*>' | grep -qiE '(src|srcset)="[^"]*\.(jpe?g|png)'; then bad "non-WebP <img> source (floor: WebP only)"; else ok "images are WebP/SVG only"; fi
# Every img has non-empty alt
imgs=$(printf '%s' "$flat" | grep -oiE '<img\b' | wc -l | tr -d ' ')
withalt=$(printf '%s' "$flat" | grep -oiE '<img\b[^>]*\balt="[^"]+"' | wc -l | tr -d ' ')
if [ "$imgs" -gt 0 ] && [ "$imgs" -eq "$withalt" ]; then ok "all $imgs <img> have non-empty alt"; else bad "$((imgs-withalt)) of $imgs <img> missing alt"; fi
# Every img carries width/height (LCP/CLS)
noWH=$(printf '%s' "$flat" | grep -oiE '<img\b[^>]*>' | grep -vc 'width=')
if [ "$noWH" -eq 0 ]; then ok "<img> carry width/height"; else bad "$noWH <img> lack width/height"; fi
# No raw http:// (absolute HTTPS only)
grep -qE 'href="http://' "$f" && bad "insecure http:// link" || ok "no http:// links"
grep -qiE '<audio|<video|autoplay|\.(mp3|mp4|wav|ogg|webm)\b' "$f" && bad "audio/video/autoplay present (policy: no audio)" || ok "no audio/video/autoplay"

# --- Linked stylesheet: reduced-motion + no @import bloat -------------------
css=$(grep -oE 'href="[^"]+\.css' "$f" | head -1 | sed 's/href="//')
cssfile="$root/${css#/}"
if [ -f "$cssfile" ]; then
  grep -q 'prefers-reduced-motion' "$cssfile" && ok "stylesheet honors prefers-reduced-motion" || bad "stylesheet lacks prefers-reduced-motion"
else
  bad "linked stylesheet not found: $css"
fi

# --- Quiet Harbor invariants -----------------------------------------------
[ "$(grep -c '<style' "$f")" -eq 0 ] && ok "no <style> blocks (external CSS only)" || bad "<style> block present"
[ "$(grep -oc '<h1' "$f")" -le 1 ] && ok "at most one <h1> (single focal idea)" || bad "more than one <h1>"
grep -q 'class="felt-nav"' "$f" && ok "felt-nav present" || bad "felt-nav missing"
grep -q 'class="pathfinder"' "$f" && ok "single primary action (path-finder) present" || bad "path-finder missing"
grep -qiE 'box-shadow|class="card"' "$f" && bad "card/shadow detected (Quiet Harbor: none)" || ok "no cards/shadows in markup"

# --- Voice floor (like-a-human banned vocabulary, visible text) -------------
banned='world-class|stunning|luxurious|unforgettable|breathtaking|must-see|must-do|bucket-list|hidden gem|seamless|delve|elevate|vibrant|nestled|boasts'
if grep -oiE ">[^<]*($banned)[^<]*<" "$f" | grep -qiE "$banned"; then bad "banned marketing/AI vocabulary in copy"; else ok "no banned vocabulary in copy"; fi

# --- Perf budget: hero webp weight ------------------------------------------
hero=$(grep -oE '/assets/beta/[^" ]+\.webp' "$f" | head -1)
if [ -n "$hero" ] && [ -f "$root/${hero#/}" ]; then
  bytes=$(wc -c < "$root/${hero#/}")
  [ "$bytes" -le 204800 ] && ok "hero webp ${bytes}b within 200KB LCP budget" || bad "hero webp ${bytes}b exceeds 200KB budget"
fi

echo "---"
[ "$fails" -eq 0 ] && { echo "PASS (Quiet Harbor)"; exit 0; } || { echo "FAIL: $fails issue(s)"; exit 1; }
