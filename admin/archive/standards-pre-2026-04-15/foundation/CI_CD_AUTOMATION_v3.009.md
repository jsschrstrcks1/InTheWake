In the Wake — Standards & CI Canonization (v3.009)

1. Unified Navigation (v3.009)
- Dropdown IA and ARIA contract
- Keyboard behavior and outside-click close
- No 100vw in header/hero; use 100% width

2. Right Rail (v3.009)
- Two-column at ≥980px; mobile single column
- Authors data source: /data/authors.json (schema below)
- Schema authors.schema.json (Draft 2020-12)

3. Cache-Busting & Version Coupling
- meta[name="page:version"] drives all ?v=
- CI enforces coupling

4. Accessibility Addendum (v3.100)
- Skip link visible
- External links rel=noopener

5. CI Checks
- Schema validation (ajv), forbid 100vw, version-coupling, Playwright nav tests, avatar existence, Lighthouse ≥95

6. GitHub Actions Workflow
(…workflow steps as provided…)

7. Enforcement Summary
✅ Correct dropdown structure (ARIA + keyboard).
✅ Consistent version coupling.
✅ Accurate author photos and JSON schema.
✅ No 100vw overflow regressions.
✅ Automated tests ensure these rules are never silently broken.
