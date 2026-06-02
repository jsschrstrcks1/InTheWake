# [Generator / Standards Violation] Multiple generators continue to emit the forbidden `/ships.html` link

**Labels:** bug, standards-violation, generator, link-integrity, high-priority, navigation

## Summary

Despite explicit, repeated documentation that the ships hub must be at `/ships/index.html` (never `/ships.html`), at least seven different generator scripts hard-code or emit the incorrect `/ships.html` path in navigation elements.

This violation is being actively generated into new content (port pages, venue pages across all cruise lines, show pages, etc.).

## Evidence

### 1. Violation present in all major generators (confirmed 2026-05-27 and re-verified 2026-05-28)

The string `href="/ships.html"` (or equivalent) appears in:

- `admin/generate-port-page.cjs:120`
- `admin/generate-venue-pages.js:502`
- `admin/generate-virgin-venue-pages.js:601`
- `admin/generate-ncl-venue-pages.js:568`
- `admin/generate-msc-venue-pages.js:479`
- `admin/generate-carnival-venue-pages.js:499`
- `admin/generate-show-pages.js:276`

### 2. Violation present in core hub files (fresh verification 2026-05-28)

- `index.html`: lines 312, 404, 566, 608
- `ships/index.html:151` (plus breadcrumb)
- `ports.html`: at least 14 occurrences (many in "Ships deployed" deployment notes and cross-references)

### 3. Direct contradiction of project standards

The rule is stated clearly and repeatedly:
- `README.md`
- `claude.md`
- `new-standards/` (multiple documents)
- Various admin docs

Quote: "NEVER `/ships.html` — the correct path is `/ships/index.html`." "All internal links are absolute HTTPS URLs."

## Impact

- Every visitor who clicks "Ships" from the homepage, ports pages, or generated venue/show pages lands on a 404 or incorrect page (depending on server configuration).
- The two primary entry points to the ships content (`index.html` and `ships/index.html`) themselves contain the wrong link.
- This is a generator-level failure: the tools that are supposed to enforce standards are the source of the violation.
- Undermines trust in the site's navigation and the "gold standard" claims around the content system.
- Contributes to the need for ongoing post-hoc fix scripts.

## Reproduction

```bash
# From a fresh clone or the current working tree
grep -r 'href="/ships.html"' --include="*.html" --include="*.js" --include="*.cjs" admin/ index.html ships/index.html ports.html | head -20
```

Or run any of the generators in dry-run mode and inspect the emitted navigation.

Live site check (as of 2026-05-28):
- Visit https://cruisinginthewake.com/
- Click "Ships" in the primary navigation or "What are you planning?" section.

## Suggested Fix Direction

- Remove or parameterize the hardcoded `/ships.html` references in all generators. Use a shared navigation partial / component / constant that points to `/ships/index.html`.
- Add a link-integrity or generator-level check that fails on emission of the old path (or any relative/internal link that violates the documented contract).
- Consider a one-time migration + redirect if needed for any historical links, but prioritize preventing new violations at the source.

## Related

- Draft ISSUE-10 and ISSUE-11 (specific generator duplication and standards leakage)
- Draft ISSUE-12 (proliferation of batch-fix scripts)
- Main audit report: `CODEBASE_AUDIT_2026-05-27-GITHUB_ISSUES.md` (Issue 1 + Resumption section)

**Soli Deo Gloria.**