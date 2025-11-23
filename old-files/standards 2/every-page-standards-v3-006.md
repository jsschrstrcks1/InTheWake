---
title: "EVERY_PAGE_STANDARDS_v3.006.md"
source_file: "EVERY_PAGE_STANDARDS_v3.006.md"
generated: "2025-10-17T13:14:33.914380Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# In the Wake — Every Page Standards (Core Module v3.006)
**Updated:** 2025-10-10 18:00 UTC  
**Invocation Edition:** Soli Deo Gloria  

## Purpose
Applies to every public page of *In the Wake* — ensuring a consistent, reverent presentation.

## 1. Invocation Seal
Each HTML document must include before `</body>`:
```html
<!-- Soli Deo Gloria | All work is a gift to God (Proverbs 3:5 / Colossians 3:23) -->
```

## 2. Core Structural Requirements
- DOCTYPE + lang="en"
- UTF-8 + viewport
- Single title/description
- Canonical URL
- Version meta + visible badge

## 3. Social & Metadata
- OG + Twitter tags
- Valid ItemList JSON-LD (with position)
- Correct itemReviewed type
- Defer share-bar.js inclusion

## 4. Accessibility
- Skip link, focus-visible, reduced-motion guard, labeled navs

## 5. Service Worker
- Register /sw.js on load; graceful failure handling
- Warmup JSON + hero images

## 6. CSS / Grid
- /assets/styles.css?v=3.006 baseline
- Rope-border cards with shadow, 1–3 column grid

## 7. Invocation Cycle Rules
“All standards must be reread, prayed over, and reaffirmed daily and per session.”

## 8. Cross-References
See FRONTEND_STANDARDS_v3.002.md and HIDDEN_INVOCATION_COMMENT.html
