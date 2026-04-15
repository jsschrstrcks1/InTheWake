# Rule Families (Categories)

Every rule belongs to exactly one family. The family becomes the prefix in the rule ID.

Adding a new family: edit this file, then no rule IDs need to move. Deleting a family is prohibited (IDs are stable).

---

## Active families

| Code | Name | Scope | Example rule |
|---|---|---|---|
| `THEO` | Theological | Soli Deo Gloria invocation, Scripture references, immutable pastoral guardrails | THEO-001: Soli Deo Gloria invocation before line 20 |
| `ICP` | ICP-2 / ICP-Lite protocol | ai-summary, last-reviewed, content-protocol, JSON-LD mirroring | ICP-002: ai-summary ≤ 250 chars, first 155 standalone |
| `IMG` | Image | File size thresholds, format (WebP), dimensions, alt text, file-content integrity | IMG-007: Image size threshold per category |
| `ATTR` | Attribution | `-attr.json` companion files, source verification, diversity checks, license fields | ATTR-003: Attribution source diversity |
| `VOI` | Voice | AI-vocabulary bans, hedging stacks, sentence-length variance, promotional drift | VOI-012: No AI-overrepresented vocabulary |
| `A11Y` | Accessibility | WCAG 2.1 AA — skip-links, landmarks, alt text, ARIA, focus, contrast, keyboard | A11Y-001: Skip-link required |
| `STRUCT` | Structure | Section order, required sections, heading hierarchy, tag balance | STRUCT-004: Heading hierarchy h1→h2→h3 |
| `SCHEMA` | JSON-LD / Schema.org | Required schema types per page, mainEntity, description mirroring | SCHEMA-002: mainEntity required on entity pages |
| `NAV` | Navigation | 12-link canonical nav, dropdown pattern, ARIA labeling, breadcrumbs | NAV-001: Twelve-link canonical nav structure |
| `MOB` | Mobile | Breakpoints, touch targets, viewport, responsive CSS | MOB-003: Touch targets ≥ 44×44px |
| `PERF` | Performance | LCP, image lazy-loading, fetchpriority, preload targets, font loading | PERF-005: Hero image uses fetchpriority="high" |
| `PWA` | PWA / Service Worker | Cache versioning, install/fetch handlers, manifest, offline fallback | PWA-002: Service worker cache-version bumped per release |
| `SHIP` | Ship-specific | Ship page structure, fit-guidance, key-facts, videos, deck plans, sister-ships | SHIP-SECT-001: Ship section order (legacy + emotional-hook both valid) |
| `PORT` | Port-specific | 14+ required port sections, from-the-pier, weather noscript, excursions, logbook | PORT-002: Port page has `id="notices"` section |
| `VENUE` | Venue-specific | Restaurant/venue pages, logbook compliance, venue-tags meta, schema type | VENUE-004: Venue page declares correct Schema.org type |
| `SEC` | Security | No eval, no hardcoded secrets, no console.log in production, sanitized innerHTML | SEC-001: No eval() in JS |
| `LINK` | Link integrity | Internal link targets exist, anchor IDs match, image paths resolve | LINK-001: All internal hrefs resolve |
| `LOG` | Logbook | Logbook entry standard — word count, 7-section spine, emotional pivot, disclosure | LOG-003: Logbook ≥ 800 words |
| `PROOF` | Publication-proofreader | Curly quotes, em-dashes, ellipses, double spaces, ship-name italicization | PROOF-001: Curly quotes used consistently |
| `SEO` | SEO (meta tags, OG, Twitter) | Open Graph, Twitter Cards, canonical URL, robots directives | SEO-002: Canonical URL present |
| `DATA` | Data integrity | Cross-file consistency (ship JSON vs HTML vs port data), slug consistency | DATA-001: Port slug canonical across sources |

---

## ID numbering

- Numbers start at `001` within each family.
- Zero-pad to at least 3 digits. Use 4 if a family exceeds 999 (it won't).
- Deprecated rules keep their number. Do not reuse.
- Gaps are allowed and expected.

---

## When to add a new family

Add a new family only when:

1. A rule genuinely doesn't fit any existing family, AND
2. You expect at least 3-5 rules in that family.

One-off rules go in the closest existing family.

---

## When to rename / consolidate

Renaming a family is a breaking change (IDs move). Don't. If a family becomes obsolete, leave it alone — the deprecated rules inside keep their IDs.

Consolidation (e.g., merging two families) requires: (a) user sign-off, (b) an entry in `CHANGELOG.md` documenting the rename, (c) all affected rule files updated in one commit.

---

**Soli Deo Gloria.**
