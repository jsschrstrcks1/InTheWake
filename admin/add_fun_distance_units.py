#!/usr/bin/env python3
"""
Add fun distance units converter to all ship pages
Adds script tag and modifies renderStats function to display whimsical conversions
"""

import os
import re
from pathlib import Path

class FunDistanceDeployer:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.stats = {
            'processed': 0,
            'script_added': 0,
            'stats_modified': 0,
            'already_updated': 0,
            'errors': 0
        }

    def has_fun_distance_script(self, content):
        """Check if page already has fun-distance-units.js script."""
        return 'fun-distance-units.js' in content

    def has_fun_distance_logic(self, content):
        """Check if renderStats already has fun distance logic."""
        return 'window.funDistance' in content and 'stat-fun' in content

    def add_script_tag(self, content):
        """Add fun-distance-units.js script tag before ship stats loader."""
        # Find the ship stats loader comment
        pattern = r'(  <!-- ===== Ship stats loader ===== -->)'
        replacement = r'  <!-- ===== Fun Distance Units Converter ===== -->\n  <script src="/assets/js/fun-distance-units.js" defer></script>\n\n\1'

        new_content = re.sub(pattern, replacement, content)
        return new_content, new_content != content

    def modify_render_stats(self, content):
        """Modify renderStats function to add fun distance conversions."""
        # Find the existing renderStats function with the simple stat-line return
        # Using re.escape for literal matching and raw strings for regex patterns
        old_pattern = r"(mount\.innerHTML=keys\.map\(k=>\{\s+const val=obj\[k\]; if\(!val\) return '';\s+)return '<div class=\"stat-line\"><span class=\"stat-key\">'\+labels\[k\]\+'</span><span class=\"stat-val\">'\+String\(val\)\.replace\(/</g,'&lt;'\)\+'</span></div>';"

        new_code = r'''\1let statHtml = '<div class="stat-line"><span class="stat-key">'+labels[k]+'</span><span class="stat-val">'+String(val).replace(/</g,'&lt;')+'</span>';

        // Add fun distance conversions for length and beam
        if((k==='length'||k==='beam') && window.funDistance){
          const feetMatch = String(val).match(/(\\d+(?:,\\d+)?)\\s*(?:ft|feet)/i);
          if(feetMatch){
            const feet = parseInt(feetMatch[1].replace(/,/g,''));
            const conversion = k==='length' ? window.funDistance.shipLength(feet) : window.funDistance.shipBeam(feet);
            if(conversion && (conversion.practical || conversion.absurd)){
              const parts = [];
              if(conversion.practical) parts.push(conversion.practical);
              if(conversion.absurd) parts.push(conversion.absurd);
              if(parts.length > 0){
                statHtml += '<span class="stat-fun tiny" style="display:block;margin-top:.25rem;color:var(--ink-mid,#3d5a6a);font-style:italic">('+parts.join(', or ')+')</span>';
              }
            }
          }
        }

        statHtml += '</div>';
        return statHtml;'''

        new_content = re.sub(old_pattern, new_code, content, flags=re.MULTILINE | re.DOTALL)
        return new_content, new_content != content

    def process_file(self, filepath):
        """Process a single ship HTML file."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Check if already updated
            has_script = self.has_fun_distance_script(content)
            has_logic = self.has_fun_distance_logic(content)

            if has_script and has_logic:
                self.stats['already_updated'] += 1
                return

            modified = False

            # Add script tag if missing
            if not has_script:
                content, changed = self.add_script_tag(content)
                if changed:
                    modified = True
                    self.stats['script_added'] += 1

            # Modify renderStats if missing fun distance logic
            if not has_logic:
                content, changed = self.modify_render_stats(content)
                if changed:
                    modified = True
                    self.stats['stats_modified'] += 1

            # Write back if modified
            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✓ Updated: {filepath.relative_to(self.root_dir)}")

            self.stats['processed'] += 1

        except Exception as e:
            print(f"✗ Error processing {filepath}: {e}")
            self.stats['errors'] += 1

    def deploy(self):
        """Deploy fun distance units to all ship pages."""
        ships_dir = self.root_dir / 'ships'

        if not ships_dir.exists():
            print(f"Ships directory not found: {ships_dir}")
            return

        # Find all HTML files in ships directory
        ship_pages = list(ships_dir.rglob('*.html'))

        print(f"Found {len(ship_pages)} ship pages")
        print("Deploying fun distance units...\n")

        for filepath in sorted(ship_pages):
            self.process_file(filepath)

        # Print summary
        print("\n" + "="*60)
        print("DEPLOYMENT SUMMARY")
        print("="*60)
        print(f"Files processed:        {self.stats['processed']}")
        print(f"Script tags added:      {self.stats['script_added']}")
        print(f"Stats functions updated: {self.stats['stats_modified']}")
        print(f"Already up-to-date:     {self.stats['already_updated']}")
        print(f"Errors:                 {self.stats['errors']}")
        print("="*60)

if __name__ == '__main__':
    root = Path('/home/user/InTheWake')
    deployer = FunDistanceDeployer(root)
    deployer.deploy()
