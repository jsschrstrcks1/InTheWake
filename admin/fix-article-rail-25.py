#!/usr/bin/env python3
"""
Fix article rail on 25 venue pages that have broken or missing JS.

Group A (11 pages): Have broken JS using (data||[]).filter instead of data.articles
Group B (14 pages): Have HTML container but no JS at all

For both groups:
1. Ensure the HTML section has the standard pattern (title, intro text, fallback)
2. Replace/add the standard recentRail() JS matching the other 350 venue pages
"""

import re
from pathlib import Path

BASE = Path('/home/user/InTheWake')

# Group A: broken (data||[]).filter pattern
GROUP_A = [
    'restaurants/adventure-ocean.html',
    'restaurants/arcade.html',
    'restaurants/carousel.html',
    'restaurants/casino.html',
    'restaurants/fitness-center.html',
    'restaurants/north-star.html',
    'restaurants/ripcord-by-ifly.html',
    'restaurants/rock-climbing.html',
    'restaurants/solarium.html',
    'restaurants/vitality-spa.html',
    'restaurants/zip-line.html',
]

# Group B: no JS at all
GROUP_B = [
    'restaurants/aqua-theater.html',
    'restaurants/comedy-live.html',
    'restaurants/flowrider.html',
    'restaurants/jogging-track.html',
    'restaurants/mini-golf.html',
    'restaurants/music-hall.html',
    'restaurants/on-air-club.html',
    'restaurants/perfect-storm.html',
    'restaurants/royal-theater.html',
    'restaurants/seaplex.html',
    'restaurants/sky-lounge.html',
    'restaurants/spotlight-karaoke.html',
    'restaurants/studio-b.html',
    'restaurants/whirlpools.html',
]

# The standard HTML section (matches the 350 working pages)
STANDARD_HTML_SECTION = '''      <section class="card" aria-labelledby="recent-rail-title">
        <h3 id="recent-rail-title">Recent Stories</h3>
        <p class="tiny" style="margin-bottom: 1rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
          Real cruising experiences, practical guides, and heartfelt reflections from our community.
        </p>
        <div id="recent-rail" class="rail-list" aria-live="polite"></div>
        <p id="recent-rail-fallback" class="tiny" style="display:none">Loading articles\u2026</p>
      </section>'''

# The standard JS block (matches the 350 working pages)
STANDARD_JS = '''<script>
  (function(){
    "use strict";

    (async function recentRail(){
      const rail = document.getElementById('recent-rail');
      if(!rail) return;

      const fallback = document.getElementById('recent-rail-fallback');
      if(fallback) fallback.style.display = '';

      async function fetchJSONWithFallback(urls){
        for (const u of urls){
          try{
            const res = await fetch(u, { credentials: 'omit', cache: 'no-cache' });
            if (res.ok) return await res.json();
          }catch(err){}
        }
        return null;
      }

      const pick = (obj, keys, fallback=null)=>{ for(const k of keys){ if(obj && obj[k] != null) return obj[k]; } return fallback; };

      function setImageWithFallback(imgEl, primary, altPaths=[]){
        if(!imgEl) return;
        const stamp='v=3.010.300';
        const tried=new Set();
        const queue=[primary,...altPaths].filter(Boolean).map(p => p.includes('?')?p+'&'+stamp:p+'?'+stamp);
        function tryNext(){
          const next=queue.shift();
          if(!next){ imgEl.removeAttribute && imgEl.removeAttribute('onerror'); return; }
          if(tried.has(next)) return tryNext();
          tried.add(next);
          imgEl.src=next;
        }
        imgEl.onerror=tryNext;
        tryNext();
      }

      const raw = await fetchJSONWithFallback(['/assets/data/articles/index.json','/assets/data/articles.json']);
      if(!raw) {
        if(fallback) {
          fallback.textContent = 'Unable to load articles';
          fallback.style.display = '';
        }
        return;
      }

      const items = Array.isArray(raw?.articles) ? raw.articles : (Array.isArray(raw) ? raw : []);
      if(!items.length) return;

      const here = location.pathname.replace(/\\/+$/,'');
      const view = items.filter(p=>{
        const href = pick(p,['url','path'],'#');
        const norm = (href||'').replace(/\\/+$/,'');
        return norm && norm !== here;
      }).slice(0,6);

      rail.innerHTML = view.map(p=>{
        const title = pick(p,['title','name'],'Article');
        const href  = pick(p,['url','path'],'#');
        const excerpt = pick(p,['excerpt','description'],'');
        return `
          <article class="card article-card">
            <div class="article-card-grid">
              <div class="article-thumb-wrap">
                <img class="article-thumb" alt="" decoding="async" loading="lazy">
              </div>
              <div class="article-card-body">
                <h4><a href="${href}">${title}</a></h4>
                ${excerpt ? `<p class="tiny excerpt">${excerpt}</p>` : ''}
              </div>
            </div>
            <a href="${href}" class="pill read-more">Read Article \\u2192</a>
          </article>`;
      }).join('');

      const cards = [...rail.querySelectorAll('article.card')];
      cards.forEach((card,i)=>{
        const p = view[i] || {};
        const el = card.querySelector('img.article-thumb');
        let primary = pick(p, ['thumb','thumbnail','image','cover','img'], null);
        if(!primary){
          const slugify = s => (s||'').toLowerCase().replace(/https?:\\/\\/[^/]+/,'').replace(/[#?].*$/,'').split('/').filter(Boolean).pop()||'';
          const guess = slugify(pick(p,['url','path'],'')) || slugify(pick(p,['title','name'],''));
          if(guess) primary = `/assets/articles/${guess}/cover.jpg`;
        }
        const alts = [];
        if(primary){
          const base = primary.replace(/\\.(jpg|jpeg|png|webp)$/i,'');
          alts.push(`${base}.jpeg`, `${base}.JPG`, `${base}.webp`, `${base}.png`);
        }
        setImageWithFallback(el, primary || '/assets/index_hero.webp', alts);
      });

      if(fallback) fallback.style.display = 'none';

      const status = document.getElementById('a11y-status');
      if(status) {
        status.textContent = `${view.length} recent articles loaded`;
      }
    })();
  })();
  </script>'''


def fix_html_section(content):
    """Ensure the article rail HTML section has the standard pattern."""
    # Check if it has the minimal pattern (just div, no title/intro/fallback)
    # Pattern: <section ...recent-rail-title...>...<div id="recent-rail"...>...</section>

    # Find the section containing recent-rail
    section_pattern = re.compile(
        r'(<section[^>]*aria-labelledby="recent-rail-title"[^>]*>)(.*?)(</section>)',
        re.DOTALL
    )
    match = section_pattern.search(content)
    if match:
        inner = match.group(2)
        # Check if it's missing intro text or fallback
        has_intro = 'Real cruising experiences' in inner
        has_fallback = 'recent-rail-fallback' in inner
        if not has_intro or not has_fallback:
            # Replace the entire section with standard
            content = content[:match.start()] + STANDARD_HTML_SECTION + content[match.end():]
            return content, True
    else:
        # No section with recent-rail-title, check for bare div
        bare_pattern = re.compile(
            r'<section[^>]*>\s*<h3[^>]*>Recent Stories</h3>\s*<div id="recent-rail"[^>]*></div>\s*</section>',
            re.DOTALL
        )
        bare_match = bare_pattern.search(content)
        if bare_match:
            content = content[:bare_match.start()] + STANDARD_HTML_SECTION + content[bare_match.end():]
            return content, True

    return content, False


def remove_broken_js(content):
    """Remove the broken inline JS for article loading."""
    # Pattern for the broken (data||[]).filter script block
    broken_pattern = re.compile(
        r'<script>\s*\(function\(\)\{\s*const rail=document\.getElementById\(\'recent-rail\'\).*?\}\)\(\);\s*</script>',
        re.DOTALL
    )
    new_content = broken_pattern.sub('', content)
    return new_content, new_content != content


def add_standard_js(content):
    """Add the standard recentRail JS before </body> or after dropdown.js."""
    # Check if already has recentRail
    if 'recentRail' in content:
        return content, False

    # Insert before the dropdown.js script or before </body>
    # Look for the venue-boot.js or dropdown.js script tag
    insert_before = '</body>'
    idx = content.rfind(insert_before)
    if idx == -1:
        return content, False

    content = content[:idx] + '\n' + STANDARD_JS + '\n\n' + content[idx:]
    return content, True


def process_file(filepath, group):
    """Process a single file."""
    path = BASE / filepath
    if not path.exists():
        print(f"  SKIP (not found): {filepath}")
        return False

    content = path.read_text(encoding='utf-8')
    original = content
    changes = []

    # Step 1: Fix HTML section
    content, html_changed = fix_html_section(content)
    if html_changed:
        changes.append('HTML section updated')

    # Step 2: Remove broken JS (Group A)
    if group == 'A':
        content, js_removed = remove_broken_js(content)
        if js_removed:
            changes.append('broken JS removed')

    # Step 3: Add standard JS
    content, js_added = add_standard_js(content)
    if js_added:
        changes.append('standard JS added')

    if content != original:
        path.write_text(content, encoding='utf-8')
        print(f"  FIXED ({', '.join(changes)}): {filepath}")
        return True
    else:
        print(f"  NO CHANGE: {filepath}")
        return False


def main():
    print("=" * 70)
    print("Fixing article rail on 25 venue pages")
    print("=" * 70)

    fixed = 0

    print(f"\nGroup A: 11 pages with broken data access pattern")
    for f in GROUP_A:
        if process_file(f, 'A'):
            fixed += 1

    print(f"\nGroup B: 14 pages with missing JS")
    for f in GROUP_B:
        if process_file(f, 'B'):
            fixed += 1

    print(f"\n{'=' * 70}")
    print(f"Fixed {fixed} / 25 pages")
    print("=" * 70)


if __name__ == '__main__':
    main()
