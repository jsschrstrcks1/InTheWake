#!/usr/bin/env bash
# validate-beta3.sh — "Charthouse" design contract + shared floor.
# Usage: tools/validate-beta3.sh <page.html>
set -u
f="${1:?usage: validate-beta3.sh <page.html>}"
[ -f "$f" ] || { echo "FAIL: no such file: $f"; exit 1; }
root="$(cd "$(dirname "$0")/.." && pwd)"
fails=0
ok(){ printf '  ok   %s\n' "$1"; }
bad(){ printf '  FAIL %s\n' "$1"; fails=$((fails+1)); }
echo "validate-beta3 (Charthouse): $f"

# --- Shared floor ---
head -n 20 "$f" | grep -q "Soli Deo Gloria" && ok "SDG comment before line 20" || bad "SDG comment missing in first 20 lines"
grep -qi 'name="robots"[^>]*noindex' "$f" && ok "noindex present (beta)" || bad "noindex missing"
grep -q 'name="ai-summary"' "$f" && grep -q 'name="last-reviewed"' "$f" && grep -q 'name="content-protocol"' "$f" && ok "ICP-2 metas present" || bad "ICP-2 metas incomplete"
grep -qiE 'style[[:space:]]*=' "$f" && bad "inline style= attribute present" || ok "no inline styles"
flat=$(tr '\n' ' ' < "$f")
if printf '%s' "$flat" | grep -oiE '<img\b[^>]*>' | grep -qiE '(src|srcset)="[^"]*\.(jpe?g|png)'; then bad "non-WebP <img> source"; else ok "images are WebP/SVG only"; fi
imgs=$(printf '%s' "$flat" | grep -oiE '<img\b' | wc -l | tr -d ' ')
withalt=$(printf '%s' "$flat" | grep -oiE '<img\b[^>]*\balt="[^"]+"' | wc -l | tr -d ' ')
if [ "$imgs" -gt 0 ] && [ "$imgs" -eq "$withalt" ]; then ok "all $imgs <img> have non-empty alt"; else bad "$((imgs-withalt)) of $imgs <img> missing alt"; fi
noWH=$(printf '%s' "$flat" | grep -oiE '<img\b[^>]*>' | grep -vc 'width='); [ "$noWH" -eq 0 ] && ok "<img> carry width/height" || bad "$noWH <img> lack width/height"
grep -qE 'href="http://' "$f" && bad "insecure http:// link" || ok "no http:// links"
grep -qiE '<audio|<video|autoplay|\.(mp3|mp4|wav|ogg|webm)\b' "$f" && bad "audio/video/autoplay present (policy: no audio)" || ok "no audio/video/autoplay"
css=$(grep -oE 'href="[^"]+\.css' "$f" | head -1 | sed 's/href="//'); cssfile="$root/${css#/}"
[ -f "$cssfile" ] && { grep -q 'prefers-reduced-motion' "$cssfile" && ok "stylesheet honors prefers-reduced-motion" || bad "stylesheet lacks prefers-reduced-motion"; } || bad "stylesheet not found: $css"
[ "$(grep -c '<style' "$f")" -eq 0 ] && ok "no <style> blocks" || bad "<style> block present"
[ "$(grep -oc '<h1' "$f")" -le 1 ] && ok "single <h1>" || bad "more than one <h1>"
grep -q 'class="felt-nav"' "$f" && ok "felt-nav present" || bad "felt-nav missing"

# --- Charthouse invariants ---
lh=$(grep -n 'class="hero"' "$f" | head -1 | cut -d: -f1)
lp=$(grep -n 'class="pathfinder"' "$f" | head -1 | cut -d: -f1)
lz=$(grep -n 'class="zones"' "$f" | head -1 | cut -d: -f1)
if [ -n "$lh" ] && [ -n "$lp" ] && [ -n "$lz" ] && [ "$lh" -lt "$lp" ] && [ "$lp" -lt "$lz" ]; then ok "primary action integrated inside the hero (above the directory)"; else bad "path-finder not integrated in hero / ordering wrong"; fi
grep -qE 'role="search"|name="q"' "$f" && ok "quiet search affordance present" || bad "search affordance missing"
zc=$(awk '/<ol class="zones"/{x=1} x&&/<li/{c++} /<\/ol>/{x=0} END{print c+0}' "$f")
[ "$zc" -eq 3 ] && ok "directory ordered into exactly 3 zones" || bad "expected 3 ordered zones, found $zc"

# --- Voice floor ---
banned='world-class|stunning|luxurious|unforgettable|breathtaking|must-see|must-do|bucket-list|hidden gem|seamless|delve|elevate|vibrant|nestled|boasts'
if grep -oiE ">[^<]*($banned)[^<]*<" "$f" | grep -qiE "$banned"; then bad "banned vocabulary in copy"; else ok "no banned vocabulary in copy"; fi

# --- Perf budget ---
hero=$(grep -oE '/assets/beta/[^" ]+\.webp' "$f" | head -1)
[ -n "$hero" ] && [ -f "$root/${hero#/}" ] && { bytes=$(wc -c < "$root/${hero#/}"); [ "$bytes" -le 204800 ] && ok "hero webp ${bytes}b within 200KB budget" || bad "hero webp ${bytes}b over budget"; }

echo "---"
[ "$fails" -eq 0 ] && { echo "PASS (Charthouse)"; exit 0; } || { echo "FAIL: $fails issue(s)"; exit 1; }
