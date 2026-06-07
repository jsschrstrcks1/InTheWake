#!/usr/bin/env bash
# validate-beta4.sh — "The Wake" contract. Validates a HOMEPAGE or a CONTENT page,
# plus the shared floor and a hard no-audio/video/autoplay rule.
# Usage: tools/validate-beta4.sh <page.html>
set -u
f="${1:?usage: validate-beta4.sh <page.html>}"
[ -f "$f" ] || { echo "FAIL: no such file: $f"; exit 1; }
root="$(cd "$(dirname "$0")/.." && pwd)"
fails=0; ok(){ printf '  ok   %s\n' "$1"; }; bad(){ printf '  FAIL %s\n' "$1"; fails=$((fails+1)); }
echo "validate-beta4 (The Wake): $f"

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
# KILL THE AUDIO: no audio/video/autoplay anywhere, ever.
if grep -qiE '<audio|<video|autoplay|\.(mp3|mp4|wav|ogg|webm)\b' "$f"; then bad "audio/video/autoplay present (policy: no audio)"; else ok "no audio/video/autoplay"; fi
css=$(grep -oE 'href="[^"]+\.css' "$f" | head -1 | sed 's/href="//'); cssfile="$root/${css#/}"
[ -f "$cssfile" ] && { grep -q 'prefers-reduced-motion' "$cssfile" && ok "stylesheet honors prefers-reduced-motion" || bad "stylesheet lacks prefers-reduced-motion"; } || bad "stylesheet not found: $css"
[ "$(grep -c '<style' "$f")" -eq 0 ] && ok "no <style> blocks" || bad "<style> block present"
[ "$(grep -oc '<h1' "$f")" -le 1 ] && ok "single <h1>" || bad "more than one <h1>"
banned='world-class|stunning|luxurious|unforgettable|breathtaking|must-see|must-do|bucket-list|hidden gem|seamless|delve|elevate|vibrant|nestled|boasts'
if grep -oiE ">[^<]*($banned)[^<]*<" "$f" | grep -qiE "$banned"; then bad "banned vocabulary in copy"; else ok "no banned vocabulary in copy"; fi

# --- Page-type contract ---
if grep -q 'class="hero"' "$f"; then
  echo "  -- homepage --"
  grep -q 'class="nav"' "$f" && ok "real nav present" || bad "nav missing"
  grep -q 'class="pathfinder"' "$f" && ok "single primary action (path-finder)" || bad "path-finder missing"
  grep -q 'class="zones"' "$f" && ok "ordered task zones present" || bad "task zones missing"
  grep -q 'class="logbook"' "$f" && grep -q 'authors/ken-baker' "$f" && ok "logbook byline links the author" || bad "logbook byline / author link missing"
  hero=$(grep -oE '/assets/beta/[^" ]+\.webp' "$f" | head -1)
  [ -n "$hero" ] && [ -f "$root/${hero#/}" ] && { b=$(wc -c < "$root/${hero#/}"); [ "$b" -le 204800 ] && ok "hero webp ${b}b within 200KB budget" || bad "hero webp ${b}b over budget"; }
elif grep -qE 'class="content-grid"|class="prose"'; then :; fi
if grep -qE 'class="content-grid"|class="prose"' "$f"; then
  echo "  -- content page --"
  grep -q 'class="content-hero"' "$f" && ok "content-hero present" || bad "content-hero missing"
  grep -q 'class="prose"' "$f" && ok "prose column present" || bad "prose column missing"
  if printf '%s' "$flat" | grep -q '<figure'; then printf '%s' "$flat" | grep -q '<figcaption' && ok "figures have captions" || bad "figure(s) missing figcaption"; else ok "no figures (text-only content is fine)"; fi
fi

if grep -q 'class="hub-grid"' "$f"; then
  echo "  -- hub page --"
  grep -q 'class="content-hero"' "$f" && ok "content-hero present" || bad "content-hero missing"
  n=$(grep -oc 'class="hub-card"' "$f"); [ "$n" -ge 3 ] && ok "hub grid present ($n cards)" || bad "hub grid sparse ($n cards)"
fi

echo "---"
[ "$fails" -eq 0 ] && { echo "PASS (The Wake)"; exit 0; } || { echo "FAIL: $fails issue(s)"; exit 1; }
