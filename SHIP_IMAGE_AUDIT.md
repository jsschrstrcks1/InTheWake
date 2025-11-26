# Ship Image & Attribution Audit Report

**Date:** 2025-11-26
**Audited:** 50 RCL ship pages, 178 WebP images

---

## Executive Summary

**45 out of 50 ships have attribution issues.**

| Issue | Count | Severity |
|-------|-------|----------|
| Wrong ship in attributions ("Allure" template) | 32 ships | HIGH |
| Broken image paths (dining-hero.jpg) | 45+ files | MEDIUM |
| Missing attributions (images > citations) | 10 ships | HIGH |
| No attributions at all | 3 ships | CRITICAL |

---

## Image Inventory

### Flickers of Majesty Images (FOM)
**Count:** 120 images (60 jpeg + 60 webp pairs)
**Ships with FOM images:** 11

1. freedom-of-the-seas
2. grandeur-of-the-seas
3. harmony-of-the-seas
4. jewel-of-the-seas
5. liberty-of-the-seas
6. mariner-of-the-seas
7. oasis-of-the-seas
8. ovation-of-the-seas
9. radiance-of-the-seas
10. serenade-of-the-seas
11. utopia-of-the-seas

**Attribution Required:**
```html
<li>
  Ship photography © <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>
  (<a href="https://www.instagram.com/flickersofmajesty" target="_blank" rel="noopener">@flickersofmajesty</a>).
  Used with permission.
</li>
```

### Wikimedia Commons Images
**Count:** ~118 WebP images (non-FOM)
**Source:** Wikimedia Commons
**Licenses:** CC BY 2.0, CC BY-SA 2.0, CC BY-SA 3.0, CC BY-SA 4.0, Public Domain

---

## Ships Needing Fixes

### Critical - No Attributions
- [ ] discovery-class-ship-tbn.html
- [ ] nordic-prince.html
- [ ] oasis-class-ship-tbn-2028.html

### High - Wrong Ship Referenced ("Allure of the Seas" template pollution)
- [ ] adventure-of-the-seas.html
- [ ] anthem-of-the-seas.html
- [ ] explorer-of-the-seas.html
- [ ] grandeur-of-the-seas.html
- [ ] icon-of-the-seas.html
- [ ] icon-class-ship-tbn-2027.html
- [ ] icon-class-ship-tbn-2028.html
- [ ] independence-of-the-seas.html
- [ ] legend-of-the-seas.html
- [ ] legend-of-the-seas-1995-built.html
- [ ] legend-of-the-seas-icon-class-entering-service-in-2026.html
- [ ] liberty-of-the-seas.html
- [ ] monarch-of-the-seas.html
- [ ] navigator-of-the-seas.html
- [ ] nordic-empress.html
- [ ] oasis-of-the-seas.html
- [ ] odyssey-of-the-seas.html
- [ ] quantum-ultra-class-ship-tbn-2028.html
- [ ] quantum-ultra-class-ship-tbn-2029.html
- [ ] song-of-norway.html
- [ ] sovereign-of-the-seas.html
- [ ] spectrum-of-the-seas.html
- [ ] splendour-of-the-seas.html
- [ ] star-class-ship-tbn-2028.html
- [ ] star-of-the-seas.html
- [ ] star-of-the-seas-aug-2025-debut.html
- [ ] symphony-of-the-seas.html
- [ ] voyager-of-the-seas.html
- [ ] wonder-of-the-seas.html

### Medium - Missing Attributions (more images than citations)
- [ ] ovation-of-the-seas.html (13 images, 3 attributions)
- [ ] radiance-of-the-seas.html (13 images, 3 attributions)
- [ ] serenade-of-the-seas.html (12 images, 3 attributions)
- [ ] oasis-of-the-seas.html (9 images, 3 attributions)
- [ ] liberty-of-the-seas.html (9 images, 3 attributions)
- [ ] grandeur-of-the-seas.html (9 images, 3 attributions)
- [ ] icon-of-the-seas.html (6 images, 3 attributions)
- [ ] anthem-of-the-seas.html (6 images, 3 attributions)
- [ ] jewel-of-the-seas.html (6 images, 3 attributions)

### Low - Broken Image Paths
All 45+ ships reference non-existent `dining-hero.jpg` paths in subdirectories.

---

## Known Wikimedia Image Attributions

| Image File | Ship | Author | License |
|------------|------|--------|---------|
| Allure_of_the_seas_sideview.JPG | Allure | Zache | CC BY-SA 3.0 |
| Adventure_of_the_Seas_(ship,_2001)... | Adventure | Ebyabe | CC BY-SA 4.0 |
| Icon_of_the_Seas_(cropped) | Icon | Bahnfrend | CC BY-SA 4.0 |
| Rhapsody_of_the_Seas_in_Queen_Charlotte... | Rhapsody | PhillipC | CC BY 2.0 |
| Voyager_of_the_Seas_(8194516843) | Voyager | Rob Young | CC BY 2.0 |
| Monarch_of_the_seas_(2707258203) | Monarch | Håkan Dahlström | CC BY 2.0 |
| 1996_Sun_Viking_RCL_CRPgf527 | Sun Viking | CRP | CC BY-SA 3.0 |

---

## Recommended Fix Strategy

### Phase 1: Remove Template Pollution
1. Delete ALL "Allure of the Seas" references from non-Allure ship pages
2. Remove broken dining-hero.jpg references

### Phase 2: Add Proper Attributions
1. For FOM ships: Add Flickers of Majesty attribution
2. For Wikimedia images: Research and add proper author/license

### Phase 3: Verify
1. Run audit script again
2. Confirm 0 mismatches
3. Confirm image count = attribution count

---

## Attribution Template

```html
<section class="card attributions">
  <h2>Image Attributions</h2>
  <ul>
    <!-- Wikimedia Commons images -->
    <li>
      "[Image Title]" by <a href="[author_url]" target="_blank" rel="noopener">[Author Name]</a> via
      <a href="https://commons.wikimedia.org/wiki/File:[filename]" target="_blank" rel="noopener">Wikimedia Commons</a> —
      licensed under <a href="[license_url]" target="_blank" rel="noopener">[License Type]</a>.
    </li>

    <!-- Flickers of Majesty images (if applicable) -->
    <li>
      Ship photography © <a href="https://www.flickersofmajesty.com" target="_blank" rel="noopener">Flickers of Majesty</a>
      (<a href="https://www.instagram.com/flickersofmajesty" target="_blank" rel="noopener">@flickersofmajesty</a>).
      Used with permission.
    </li>
  </ul>
</section>
```

---

## Files Created

- `/assets/data/ship-image-catalog.json` - Image metadata catalog (needs completion)
- `/SHIP_IMAGE_AUDIT.md` - This report

---

**Next Steps:**
1. Research remaining Wikimedia image attributions
2. Build script to update all 50 ship pages
3. Remove template pollution site-wide
4. Add correct attributions for each ship
