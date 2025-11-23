#!/usr/bin/env python3
"""
Add Article Rail Site-wide

Adds the article rail pattern (HTML + JavaScript) to all HTML pages across the site.

Pattern includes:
- HTML section with "Recent Stories" heading and introductory text
- JavaScript to load and display articles from /assets/data/articles/index.json
- Automatic image fallback handling
- Accessibility announcements

Excludes: /vendors/, solo/articles/
"""

import os
import re
from pathlib import Path
from collections import defaultdict

class ArticleRailDeployer:
    def __init__(self, base_dir, dry_run=False):
        self.base_dir = Path(base_dir)
        self.dry_run = dry_run
        self.stats = {
            'total_files': 0,
            'has_html': 0,
            'has_js': 0,
            'needs_html': 0,
            'needs_js': 0,
            'files_modified': 0,
            'errors': 0
        }

        # The article rail HTML section
        self.article_rail_html = '''      <!-- Recent Articles rail -->
      <section style="grid-column: 1; grid-row: 1 / span 999;" class="card" aria-labelledby="recent-rail-title">
        <h3 id="recent-rail-title">Recent Stories</h3>
        <p class="tiny" style="margin-bottom: 1rem; color: var(--ink-mid, #3d5a6a); line-height: 1.5;">
          Real cruising experiences, practical guides, and heartfelt reflections from our community. Explore stories that inform, inspire, and connect.
        </p>
        <div id="recent-rail" class="rail-list" aria-live="polite"></div>
        <p id="recent-rail-fallback" class="tiny" style="display:none">Loading articles…</p>
      </section>'''

    def should_skip(self, filepath):
        """Check if file should be excluded."""
        path_str = str(filepath)
        skip_patterns = [
            '/vendors/', 'vendors/',
            '/solo/articles/', 'solo/articles/',
            '/old-files/', 'old-files/',
            '/admin/', 'admin/',
            'template.html',
            'invocation_signature.html'
        ]
        return any(pattern in path_str for pattern in skip_patterns)

    def has_article_rail_html(self, content):
        """Check if content has the article rail HTML section."""
        return 'id="recent-rail"' in content

    def has_new_article_rail_html(self, content):
        """Check if content has the NEW article rail pattern (with Recent Stories, intro text, excerpts)."""
        return 'id="recent-rail-title"' in content and 'Recent Stories' in content

    def has_new_article_rail_js(self, content):
        """Check if content has the NEW article rail JavaScript (with excerpts and CTA)."""
        return 'Read Article →' in content and 'article class="card"' in content

    def has_article_rail_js(self, content):
        """Check if content has the article rail JavaScript."""
        return 'Recent Articles Rail' in content or 'recentRail()' in content

    def find_insertion_point_html(self, content):
        """Find where to insert the article rail HTML (in aside/sidebar area)."""
        # Look for </aside> tag - insert before it
        aside_match = re.search(r'(\s*)</aside>', content)
        if aside_match:
            return aside_match.start()

        # Look for closing main tag - insert before it
        main_match = re.search(r'(\s*)</main>', content)
        if main_match:
            # We need to create an aside section
            return main_match.start()

        return None

    def find_insertion_point_js(self, content):
        """Find where to insert the article rail JavaScript."""
        # Look for the dropdown nav script or any closing script tag before </body>
        # Insert before the dropdown script if it exists
        dropdown_match = re.search(r'<!-- Dropdown nav behavior', content)
        if dropdown_match:
            return dropdown_match.start()

        # Otherwise look for </script> before </body>
        script_matches = list(re.finditer(r'</script>', content))
        if script_matches:
            # Get the last </script> tag before </body>
            body_match = re.search(r'</body>', content)
            if body_match:
                for match in reversed(script_matches):
                    if match.end() < body_match.start():
                        # Insert after this script tag
                        return match.end()

        # Last resort: insert before </body>
        body_match = re.search(r'</body>', content)
        if body_match:
            return body_match.start()

        return None

    def remove_old_article_rail_html(self, content):
        """Remove old article rail HTML section if it exists."""
        # Pattern for old article rail section
        # Matches: <!-- Recent Articles --> ... </section>
        pattern = r'<!-- Recent Articles(?:\s+rail)? -->\s*<section[^>]*aria-labelledby="recent-(?:articles-heading|rail-title)"[^>]*>.*?</section>'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        return content

    def remove_old_article_rail_js(self, content):
        """Remove old article rail JavaScript if it exists."""
        # Pattern for the article rail script block
        # Match from "Recent Articles Rail" comment to the end of the async function
        pattern = r'/\*\s*=+\s*Recent Articles Rail\s*=+\s*\*/\s*\(async function recentRail\(\)\{.*?\}\)\(\);'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        return content

    def add_article_rail_html(self, content):
        """Add article rail HTML to content."""
        insertion_point = self.find_insertion_point_html(content)
        if insertion_point is None:
            return content, False

        # Insert the article rail HTML
        new_content = content[:insertion_point] + '\n' + self.article_rail_html + '\n    ' + content[insertion_point:]
        return new_content, True

    def add_article_rail_js(self, content):
        """Add article rail JavaScript to content."""
        insertion_point = self.find_insertion_point_js(content)
        if insertion_point is None:
            return content, False

        # The complete JavaScript block
        js_block = '''
  <script>
  (function(){
    "use strict";

    /* ===== Recent Articles Rail ===== */
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
          }catch(err){

          }
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
          <article class="card" style="display:flex;flex-direction:column;gap:.75rem;padding:.85rem">
            <div style="display:grid;grid-template-columns:80px 1fr;gap:.75rem;align-items:start">
              <div style="width:80px;height:60px;overflow:hidden;border-radius:8px;background:#eef4f6;border:1px solid #dfe7ea;flex-shrink:0">
                <img class="article-thumb" alt="" decoding="async" loading="lazy" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div>
                <h4 style="margin:0 0 .35rem 0;font-size:.9rem;line-height:1.3;font-weight:600">
                  <a href="\\${href}" style="color:var(--accent,#0e6e8e);text-decoration:none">\\${title}</a>
                </h4>
                \\${excerpt ? `<p class="tiny" style="margin:0;line-height:1.4;color:var(--ink-mid,#3d5a6a)">\\${excerpt}</p>` : ''}
              </div>
            </div>
            <a href="\\${href}" class="pill" style="align-self:flex-start;font-size:.85rem;padding:.45rem .95rem;text-decoration:none">Read Article →</a>
          </article>`;
      }).join('');

      const cards = [...rail.querySelectorAll('article.card')];
      cards.forEach((card,i)=>{
        const p = view[i] || {};
        const el = card.querySelector('img.article-thumb');
        const href  = (pick(p,['url','path'],'')||'').toLowerCase();
        const title = (pick(p,['title','name'],'')||'').toLowerCase();

        let primary = pick(p, ['thumb','thumbnail','image','cover','img'], null);

        // FORCE override for Top-20
        if (/(top-20|first-?cruise-?questions)/.test(href) || /top\\s*20.*first.*cruise.*questions/.test(title)){
          primary = '/assets/articles/thumbs/top-20-questions/cover.webp';
        }
        // Friendly specifics
        if(!primary && (/freedom-of-your-own-wake/.test(href) || /freedom of your own wake/.test(title))){
          primary = '/assets/articles/thumbs/freedom-of-your-own-wake.webp';
        }
        if(!primary && (/why-i-started-solo-cruising/.test(href) || /why i started solo cruising/.test(title))){
          primary = '/assets/articles/thumbs/why-i-started-solo-cruising.webp';
        }
        if(!primary && (/\\/travel(\\.html)?$/.test(href) || /\\btravel\\b/.test(title))){
          primary = '/assets/articles/travel/cover.jpg';
        }

        // Heuristic fallback
        if(!primary){
          const slugify = s => (s||'').toLowerCase().replace(/https?:\\/\\/[^/]+/,'').replace(/[#?].*$/,'').split('/').filter(Boolean).pop()||'';
          const guess = slugify(href) || slugify(title);
          if(guess) primary = `/assets/articles/\\${guess}/cover.jpg`;
        }

        const alts = [];
        if(primary){
          const base = primary.replace(/\\.(jpg|jpeg|png|webp)$/i,'');
          alts.push(`\\${base}.jpeg`, `\\${base}.JPG`, `\\${base}.webp`, `\\${base}.png`);
        }
        setImageWithFallback(el, primary || '/assets/index_hero.webp', alts);
      });

      if(fallback) fallback.style.display = 'none';

      // Announce to screen readers
      const status = document.getElementById('a11y-status');
      if(status) {
        status.textContent = `\\${view.length} recent articles loaded`;
      }
    })();
  })();
  </script>

'''

        # Insert the JavaScript
        new_content = content[:insertion_point] + js_block + content[insertion_point:]
        return new_content, True

    def process_file(self, filepath):
        """Process a single HTML file."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"  ✗ Error reading {filepath.name}: {e}")
            self.stats['errors'] += 1
            return

        original_content = content
        has_html = self.has_article_rail_html(content)
        has_new_html = self.has_new_article_rail_html(content)
        has_js = self.has_article_rail_js(content)
        has_new_js = self.has_new_article_rail_js(content)

        if has_new_html and has_new_js:
            # Already has the new pattern, skip
            self.stats['has_html'] += 1
            self.stats['has_js'] += 1
            return

        modified = False
        rel_path = filepath.relative_to(self.base_dir)

        # Handle HTML
        if has_html and not has_new_html:
            # Has old pattern, replace it
            content = self.remove_old_article_rail_html(content)
            content, html_added = self.add_article_rail_html(content)
            if html_added:
                modified = True
                print(f"  ↻ Updated HTML: {rel_path}")
                self.stats['needs_html'] += 1
            else:
                print(f"  ⚠ Could not update HTML: {rel_path}")
        elif not has_html:
            # No article rail, add new one
            content, html_added = self.add_article_rail_html(content)
            if html_added:
                modified = True
                print(f"  + Added HTML: {rel_path}")
                self.stats['needs_html'] += 1
            else:
                print(f"  ⚠ Could not add HTML: {rel_path}")
        else:
            self.stats['has_html'] += 1

        # Handle JavaScript
        if has_js and not has_new_js:
            # Has old pattern, replace it
            content = self.remove_old_article_rail_js(content)
            content, js_added = self.add_article_rail_js(content)
            if js_added:
                modified = True
                print(f"  ↻ Updated JS: {rel_path}")
                self.stats['needs_js'] += 1
            else:
                print(f"  ⚠ Could not update JS: {rel_path}")
        elif not has_js:
            # No JavaScript, add new one
            content, js_added = self.add_article_rail_js(content)
            if js_added:
                modified = True
                print(f"  + Added JS: {rel_path}")
                self.stats['needs_js'] += 1
            else:
                print(f"  ⚠ Could not add JS: {rel_path}")
        else:
            self.stats['has_js'] += 1

        # Write file if modified
        if modified and not self.dry_run:
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.stats['files_modified'] += 1
            except Exception as e:
                print(f"  ✗ Error writing {filepath.name}: {e}")
                self.stats['errors'] += 1

    def run(self):
        """Run the deployment on all HTML files."""
        print("=" * 80)
        print("ARTICLE RAIL SITE-WIDE DEPLOYMENT")
        print("=" * 80)
        if self.dry_run:
            print("\n⚠️  DRY RUN MODE - No files will be modified")
        print(f"\nBase directory: {self.base_dir}")
        print("Excluding: /vendors/, /solo/articles/, /old-files/, /admin/\n")

        # Find all HTML files
        html_files = []
        for pattern in ['*.html', '**/*.html']:
            html_files.extend(self.base_dir.glob(pattern))

        # Filter out excluded directories
        html_files = [f for f in html_files if not self.should_skip(f)]
        self.stats['total_files'] = len(html_files)

        print(f"Found {len(html_files)} HTML files to process\n")

        # Process each file
        for filepath in sorted(html_files):
            self.process_file(filepath)

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print summary statistics."""
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Total HTML files: {self.stats['total_files']}")
        print(f"Files with article rail HTML: {self.stats['has_html']}")
        print(f"Files with article rail JS: {self.stats['has_js']}")
        print(f"Files needing HTML: {self.stats['needs_html']}")
        print(f"Files needing JS: {self.stats['needs_js']}")
        if not self.dry_run:
            print(f"Files modified: {self.stats['files_modified']}")
        print(f"Errors: {self.stats['errors']}")

def main():
    import sys
    dry_run = '--dry-run' in sys.argv
    deployer = ArticleRailDeployer('/home/user/InTheWake', dry_run=dry_run)
    deployer.run()

if __name__ == '__main__':
    main()
