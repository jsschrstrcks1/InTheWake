#!/usr/bin/env python3
import re
from pathlib import Path

base = Path('/home/user/InTheWake/ships/carnival')
files = [
    'carnival-carnival-breeze.html',
    'carnival-carnival-celebration.html',
    'carnival-carnival-conquest.html',
    'carnival-carnival-dream.html',
    'carnival-carnival-elation.html',
    'carnival-carnival-firenze.html',
    'carnival-carnival-freedom.html',
    'carnival-carnival-glory.html',
    'carnival-carnival-horizon.html',
    'carnival-carnival-jubilee.html'
]

for filename in files:
    filepath = base / filename
    if not filepath.exists():
        print(f"✗ {filename}: Not found")
        continue
    
    content = filepath.read_text(encoding='utf-8')
    
    # Remove old pill nav
    original_len = len(content)
    content = re.sub(
        r'<nav class="nav pills">.*?</nav>',
        '',
        content,
        flags=re.DOTALL
    )
    
    if len(content) < original_len:
        filepath.write_text(content, encoding='utf-8')
        print(f"✓ {filename}: Removed old pill nav")
    else:
        print(f"- {filename}: No pill nav found")
