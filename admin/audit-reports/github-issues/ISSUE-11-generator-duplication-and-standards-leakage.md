# [Architecture/Generator] Severe duplication across venue/page generators enables ongoing standards violations

**Labels:** technical-debt, generator, standards-enforcement, architecture, high-priority

## Summary
The project maintains multiple near-identical copies of site navigation, templates, and page structure logic across separate generator scripts for each cruise line (Carnival, MSC, NCL, Royal Caribbean via main venue generator, Virgin). 

This duplication is a primary reason why core standards violations (such as the forbidden `/ships.html` link) continue to be emitted into production pages despite clear "Never Do" rules.

## Evidence

### 1. Same violation repeated across independent generators
The exact string `<a href="/ships.html">Ships</a>` (or equivalent) appears in:
- `admin/generate-port-page.cjs:120`
- `admin/generate-venue-pages.js:502`
- `admin/generate-virgin-venue-pages.js:601`
- `admin/generate-ncl-venue-pages.js:568`
- `admin/generate-msc-venue-pages.js:479`
- `admin/generate-carnival-venue-pages.js:499`
- `admin/generate-show-pages.js:276`

Each of these is a separate file with its own copy of navigation HTML.

### 2. Per-line venue generators contain duplicated full navigation blocks
Reading `generate-carnival-venue-pages.js` (and siblings) shows they contain large, hand-maintained copies of the entire site navigation (Planning dropdown, Tools dropdown, Onboard dropdown, etc.).

These copies have diverged in small ways over time and are not generated from a single source of truth.

### 3. No shared component / partial system for critical navigation
Despite the extreme emphasis on navigation standards in `new-standards/` and `claude.md`, there is no single source file that generates or includes the primary site nav used by these tools.

## Impact
- Changing the navigation contract (e.g., enforcing `/ships/index.html`) requires edits in at least 7+ separate generator files.
- It is extremely easy for one generator to get out of sync (as has already happened).
- This architectural choice directly conflicts with the project's own high standards for consistency and "one canonical" patterns.
- Contributes to the large number of post-facto repair scripts.

## Root Cause
Historical evolution: Early pages were built manually or with simple scripts. As the site grew to 5 cruise lines + ports + shows, new per-line generators were created by copying existing ones rather than investing in a proper templating / component system.

The current generator architecture treats duplication as acceptable technical debt.

## Suggested Scope for Resolution
- Introduce a single source of truth for primary site navigation (could be a partial, a JS module that exports the nav HTML, or a build step).
- Update all generators to consume it.
- Add a pre-commit or generator-level check that the emitted nav matches the canonical version.

## Related
- Issue 1 and Issue 10 (specific `/ships.html` instances)
- Existence of the many `batch-fix-nav-*` and `fix-navigation*` scripts in `admin/`

**Soli Deo Gloria.**