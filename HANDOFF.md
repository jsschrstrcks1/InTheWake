# HANDOFF.md — InTheWake Audit State
**Last updated:** 2026-05-26 (evening session)

---

## Issue #1364 — Carnival Horizon Duplicate Sections
**Status:** COMPLETE — Ready for merge to main
**Branch:** `fix/1364-carnival-horizon`

See `ISSUE_1364_ANALYSIS.md`, `ISSUE_1364_SUMMARY.md`, `ISSUE_1364_VERIFICATION.md` for full details.

---

## Systematic Audit — Session 2 (2026-05-26 Evening)

### What Was Done

Complete JS/CSS/HTML nav audit across all 1,282 pages. Built Python validators. Found and documented 10 new issues filed to GitHub.

### Issues Filed This Session

| # | Title | Severity | Scope |
|---|-------|----------|-------|
| [#1628](https://github.com/jsschrstrcks1/InTheWake/issues/1628) | `/assets/nav.js` missing (404) | **CRITICAL** | 97 restaurant pages |
| [#1629](https://github.com/jsschrstrcks1/InTheWake/issues/1629) | Fleet restaurant subdirs missing dropdown.js | **CRITICAL** | 198 pages (NCL/MSC/Carnival/Virgin) |
| [#1630](https://github.com/jsschrstrcks1/InTheWake/issues/1630) | Article pages missing dropdown.js | HIGH | 23 pages |
| [#1631](https://github.com/jsschrstrcks1/InTheWake/issues/1631) | Port pages missing dropdown.js | HIGH | 42 ports |
| [#1632](https://github.com/jsschrstrcks1/InTheWake/issues/1632) | CSS unversioned/stale cache-busting | MEDIUM | 342 pages (+ 259 ships w/ stale ship-page.css) |
| [#1633](https://github.com/jsschrstrcks1/InTheWake/issues/1633) | Nav inconsistency: /planning.html ships-only | MEDIUM | 312 ships + others |
| [#1634](https://github.com/jsschrstrcks1/InTheWake/issues/1634) | `in-app-browser-escape.js` missing | MEDIUM | 455 pages |
| [#1635](https://github.com/jsschrstrcks1/InTheWake/issues/1635) | Broken JS references (common.js, recent-rail.js, etc.) | MEDIUM | 10 port pages |
| [#1636](https://github.com/jsschrstrcks1/InTheWake/issues/1636) | Port pages missing og:url / canonical mismatch | MEDIUM | 16 ports |
| [#1637](https://github.com/jsschrstrcks1/InTheWake/issues/1637) | Duplicate `<script>` tags on 17 pages | LOW | 17 pages |

### Key Findings Summary

**JavaScript (most impactful):**
- `/assets/nav.js` — file deleted but 97 pages still reference it (404)
- 198 fleet restaurant pages (NCL/MSC/Carnival/Virgin) — no nav JS at all
- 23 article pages — no nav JS at all
- 42 port pages — no nav JS at all
- Total broken mobile nav: **~360 pages**
- `/assets/js/newnav.js` exists but 0 pages reference it (orphaned)

**CSS:**
- 329 port pages + 10 ship index pages: unversioned `styles.css` (no cache-busting)
- 259 ship pages: `ship-page.css?v=3.010.300` stale (current is v=3.010.400)
- Norwegian fleet + Virgin + Cunard are current; most others are stale

**Nav HTML:**
- Ship pages have `/planning.html` in Planning dropdown; all other page types don't
- Nav HTML structure is otherwise consistent (same classes, same link set)

**Other:**
- 455 pages missing `in-app-browser-escape.js` (Facebook/Instagram escape banner)
- 12 ports reference `common.js` (deleted), 12 reference `recent-rail.js` (deleted)
- 16 ports: og:url missing or has canonical mismatch
- 17 pages: duplicate `<script>` tags

### Validator Script Location

No standalone validator saved. All analysis was done via inline Python during the session. Key commands:

```bash
# Pages missing dropdown.js by section
find . -name "*.html" | grep -v ".claude" | xargs grep -L "dropdown.js" 2>/dev/null \
  | awk -F'/' '{print $2}' | sort | uniq -c | sort -rn

# Pages referencing missing JS files
python3 -c "
import os, re, glob
all_refs = set()
for path in glob.glob('./**/*.html', recursive=True):
    if '.claude' in path: continue
    content = open(path).read()
    refs = re.findall(r'src=\"(/assets/[^\"?]*\.js)', content)
    all_refs.update(refs)
for ref in sorted(all_refs):
    if not os.path.exists(ref.lstrip('/')): print('MISSING:', ref)
"
```

### Previously Filed (Session 1, same day)

Issues #1596, #1598, #1599, #1601, #1602, #1604, #1606, #1608, #1609, #1611, #1616, #1618, #1620, #1624 — homepage, about, robots.txt, sitemap, accessible-cruising audit.

---

## How to Resume Next Audit Session

1. Read this file
2. Check open issues: `https://github.com/jsschrstrcks1/InTheWake/issues`
3. The highest-priority remaining work:
   - **Batch fix**: Add `dropdown.js` + `in-app-browser-escape.js` to all 360 broken pages (#1628-#1631, #1634) — this is a batch operation
   - **Nav consistency**: Decide on /planning.html in nav globally (#1633)
   - **CSS version sweep**: Update all unversioned/stale CSS params (#1632)
4. Next pages to deep-audit (haven't been individually audited yet):
   - `ships.html` hub page
   - `cruise-lines.html` hub
   - First Carnival ship page (full deep dive)
   - A restaurant page in each fleet subdir
   - `search.html`
   - `tools/*.html` pages
