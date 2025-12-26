# ICP-Lite v1.4 Protocol — AI-First Metadata (ITW)

**Version**: 1.4
**Introduced**: v3.010.300 (v1.0 lineage)
**Status**: Active standard (core required + optional layers)
**Purpose**: Make each page easy to understand, easy to verify, and easy to cite—without breaking traditional SEO or accessibility.

**Soli Deo Gloria** ✝️

---

## Design Principles

1. **Standards-first, then custom.** Use Schema.org/JSON-LD for anything a standard already covers. Custom meta is allowed, but treated as additive and non-authoritative to external crawlers.
2. **Dual audience.** Humans first, but with an AI-friendly "front door" (summary + clear first paragraph + structured data).
3. **Truth posture.** Time-sensitive/variable facts (prices, menus, policies) must be labeled with as-of date + verification posture + disclaimer.
4. **No regressions.** Unknown meta tags should never harm indexing; they must degrade gracefully.

---

## Compliance Levels

### A. Core Compliance (Required)
- 3 required meta tags in `<head>`
- JSON-LD mirroring of summary + freshness
- First-paragraph "answer lead" discipline

### B. Enhanced Compliance (Strongly Recommended)
- `mainEntity` on entity pages (ships, venues, ports, tools)
- `BreadcrumbList` schema where a hierarchy exists
- `FAQPage` schema when there is real Q&A (not forced)

### C. Optional Layers (Low-risk / Experimental)
- `llms.txt` (experimental; may be ignored)
- IndexNow pings (Bing/Copilot speed-ups)
- Relationship reinforcement via `significantLink` / `relatedLink` in JSON-LD

---

## Required Head Meta Tags (3)

### 1) AI Summary

```html
<meta name="ai-summary" content="..."/>
```

**Goal**: one factual, answer-first summary designed for citation.

**Length rules (Dual-Cap)**:
- **Max**: 250 characters total
- **First-155 rule**: the first ~155 characters must be a complete standalone answer (so a truncated snippet still works for classic search).

**Tone rules**:
- Factual, specific, no hype, no calls to action.
- Prefer numbers and proper nouns when known.

---

### 2) Last Reviewed

```html
<meta name="last-reviewed" content="YYYY-MM-DD"/>
```

**Meaning**: last human review for accuracy and freshness (not just a rebuild).

---

### 3) Protocol Identifier

```html
<meta name="content-protocol" content="ICP-Lite v1.4"/>
```

**Meaning**: flags compliance for internal tooling and future parsers.

**Note**: Google publishes the list of supported meta tags/attributes; unknown tags may be ignored, but they are not inherently harmful when used responsibly.

---

## Required Schema Binding (JSON-LD Mirroring)

Every page must mirror ICP-Lite into Schema.org JSON-LD so standards-based crawlers get the same truth.

### Required mirroring rules
- `ai-summary` must equal JSON-LD `description`
- `last-reviewed` must equal JSON-LD `dateModified`
- JSON-LD must declare a page type (`WebPage` baseline)

### Baseline JSON-LD pattern (all pages)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "PAGE TITLE HERE",
  "description": "EXACT MATCH TO ai-summary",
  "dateModified": "2025-12-01",
  "datePublished": "2024-01-15"
}
</script>
```

---

## Entity Pages Must Declare mainEntity (Strongly Recommended)

If the page is "about" a ship, venue, port, tool, or article, declare the primary thing.

**Schema reference**: `mainEntity`.

### Ship page example

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Adventure of the Seas",
  "description": "EXACT MATCH TO ai-summary",
  "dateModified": "2025-12-01",
  "mainEntity": {
    "@type": "Product",
    "name": "Adventure of the Seas",
    "category": "Cruise Ship",
    "manufacturer": { "@type": "Organization", "name": "Royal Caribbean International" }
  }
}
</script>
```

---

## Body Structure Requirements (GEO-friendly, human-friendly)

### 1) Answer-First Opening Paragraph (Required)

The first paragraph (or first visible block) should answer:
- What is this page?
- Why does it matter / what does it help me do?
- What kind of data is it (and does it change)?

**Target**: ~60–100 words for content-heavy pages (tools, guides, hubs).
Ship/venue pages can be shorter if the "At a Glance" block is immediately visible.

### 2) Semantic Chunking (Strongly Recommended)

Use clear H2/H3 sections that map to real traveler questions (naturally; not spammy).
Question-format H2s are encouraged when it reads well.

### 3) "In Summary" boxes (Optional)

For long pages, a short summary box at the end of major sections can help both skim-reading humans and retrieval systems. Keep it factual.

---

## Volatile Data Discipline (Required where applicable)

**Applies to**: drink package prices, menus, operating hours, policy quirks, itinerary-dependent details.

### Required elements (visible to users)
- **As-of date** (YYYY-MM-DD)
- **Verification posture** (one of):
  - Verified in Cruise Planner
  - Observed onboard
  - Community-reported (with caution)
- **Disclaimer**: "Subject to change without notice."

### Example snippet:

```html
<p class="disclaimer" role="note">
  <strong>As of 2025-11-18:</strong> Verified in Cruise Planner. Prices and menus can change without notice—confirm in your Cruise Planner before purchase.
</p>
```

---

## Relationship & Topical Authority (Enhanced)

### Breadcrumbs (Strongly Recommended)

Where a hierarchy exists, include `BreadcrumbList` schema.

### Relationship links in JSON-LD (Optional)

Use Schema.org `significantLink` and/or `relatedLink` to reinforce clusters (ship ↔ dining ↔ cabins ↔ itineraries).

---

## Cross-Site Authority Linking (Optional, Recommended if you run multiple domains)

If you operate multiple related sites and want consistent entity identity, use `sameAs` in Person/Organization schema.

---

## Optional: llms.txt (Experimental)

Add `/llms.txt` at the site root with a brief site summary and pointers to key hubs. This is not a guaranteed standard and may be ignored.

**Rule**: keep it conservative—summary + top-level entry points only.

---

## Optional: IndexNow (Bing / Copilot Freshness)

If you want faster discovery of updates in Bing-based ecosystems, implement IndexNow pings in your deploy workflow.

**Rule**: only ping when substantive content changes, not on every build.

---

## Enforcement on GitHub (Required)

Because the site is hosted on GitHub Pages, enforcement should happen in CI.

### CI checks must fail the build if:
- Any of the 3 required meta tags are missing
- `ai-summary` exceeds 250 chars
- First ~155 chars of `ai-summary` is not a complete sentence/thought (best-effort heuristic)
- JSON-LD `description` does not exactly match `ai-summary`
- JSON-LD `dateModified` does not exactly match `last-reviewed`

### Recommended tooling
- A Node script that parses HTML, extracts meta + JSON-LD, validates parity
- Run in GitHub Actions on PR + main branch

---

## Examples

### Full `<head>` block pattern

```html
<!-- ICP-Lite v1.4 -->
<meta name="ai-summary" content="In the Wake helps cruise travelers compare ships, cabins, and onboard details using real voyage notes and structured guides. Data changes are labeled with as-of dates."/>
<meta name="last-reviewed" content="2025-12-01"/>
<meta name="content-protocol" content="ICP-Lite v1.4"/>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "In the Wake — Cruise Planning",
  "description": "In the Wake helps cruise travelers compare ships, cabins, and onboard details using real voyage notes and structured guides. Data changes are labeled with as-of dates.",
  "datePublished": "2024-01-15",
  "dateModified": "2025-12-01"
}
</script>
```

---

## Version Notes

### What's new in v1.4 (vs 1.0–1.3)
- Dual-Cap summary rule (first ~155 chars must stand alone; max 250 total)
- Schema parity is mandatory (description + dateModified mirroring)
- `mainEntity` expectation for entity pages
- Optional: `BreadcrumbList`, `significantLink`/`relatedLink`, `sameAs`, `llms.txt`, IndexNow
- Explicit GitHub CI enforcement requirements

---

**End of icp-lite-protocol.md**
