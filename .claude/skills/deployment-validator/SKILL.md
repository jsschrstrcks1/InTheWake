---
name: deployment-validator
description: "Validates deployment artifacts (sitemap.xml, manifests, schemas, llms.txt) are consistent with actual site pages. Catches orphaned files, missing entries, and stale caches."
version: 1.0.0
---

# Deployment Validator

> Everything that says the site has a page should be right.

## Purpose

Validates that all deployment artifacts — sitemap, manifests, schemas, caches — accurately reflect the actual HTML pages in the repository. Catches inconsistencies before they reach production.

## When to Fire

- On `/deploy` command
- Before publishing changes
- After adding or removing pages
- After bulk content updates

## Artifacts to Validate

### sitemap.xml
- Every HTML page in the repo should have a `<url>` entry
- Every `<url>` entry should point to an existing page
- `<lastmod>` dates should reflect actual file modification dates
- No duplicate URLs

### manifest.json / manifest.webmanifest
- Valid JSON structure
- Icon paths resolve to actual files
- Start URL is valid
- Theme and background colors are valid hex

### precache-manifest.json
- Every referenced file exists in the repo
- No references to deleted files
- Critical pages (index, ships, ports) are included

### prefetch-images.json
- Every image path resolves to an actual file
- No broken image references
- Images are in optimized format (WebP preferred)

### llms.txt
- Described pages exist
- Tool descriptions match actual tool functionality
- URL paths are valid
- Content summary reflects current page content

### schema/*.json
- poi-index.schema.json: POI IDs match actual port page slugs
- port-map.schema.json: Port slugs match actual port HTML files
- All coordinates are valid (lat: -90 to 90, lng: -180 to 180)

## Validation Report

```
## Deployment Validation — [date]

### sitemap.xml
- Pages in repo: [N]
- URLs in sitemap: [N]
- Missing from sitemap: [list]
- In sitemap but missing from repo: [list]

### Manifests
- precache-manifest.json: [N] entries, [N] valid, [N] broken
- prefetch-images.json: [N] entries, [N] valid, [N] broken

### llms.txt
- Described pages: [N]
- Valid: [N]
- Stale descriptions: [list]

### Schemas
- POI entries: [N], matching port pages: [N], orphaned: [N]
- Port maps: [N], valid: [N]

### Overall: [PASS / FAIL — N issues]
```

## Integration

- **link-integrity** — overlapping concern (link-integrity checks page-to-page, deployment-validator checks artifacts-to-pages)
- **content-freshness** — stale pages may also have stale sitemap dates
- **seo-schema-audit** — validates in-page schema; this validates repo-level schema files
- **port-content-builder** — new port pages need sitemap + schema entries

---

*Soli Deo Gloria* — Excellence in deployment is stewardship of the visitor's experience.
