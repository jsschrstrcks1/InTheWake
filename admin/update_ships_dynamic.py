#!/usr/bin/env python3
"""
Update ships-dynamic.js SHIP_IMAGES to use WebP
Soli Deo Gloria
"""

import re

# Read original file
with open('/home/user/InTheWake/assets/js/ships-dynamic.js', 'r') as f:
    content = f.read()

# Read new SHIP_IMAGES
with open('/home/user/InTheWake/admin/ship_images_js.txt', 'r') as f:
    new_ship_images = f.read()

# Pattern to match entire SHIP_IMAGES object
pattern = r'const SHIP_IMAGES = \{.*?\n  \};'

# Replace
new_content = re.sub(pattern, new_ship_images.strip(), content, flags=re.DOTALL)

# Write back
with open('/home/user/InTheWake/assets/js/ships-dynamic.js', 'w') as f:
    f.write(new_content)

print("✅ Updated ships-dynamic.js with WebP image paths")

# Count changes
old_jpg = content.count('.jpg')
old_jpeg = content.count('.jpeg')
new_jpg = new_content.count('.jpg')
new_jpeg = new_content.count('.jpeg')
new_webp = new_content.count('.webp')

print(f"Before: {old_jpg} .jpg, {old_jpeg} .jpeg")
print(f"After: {new_jpg} .jpg, {new_jpeg} .jpeg, {new_webp} .webp")
