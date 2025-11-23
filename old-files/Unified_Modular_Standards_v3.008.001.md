# In the Wake — Unified Modular Standards (Superset v3.008.000)

> **Lineage:** v2.233 → v2.245 → v2.256(.003/.022) → v2.4 → v2.257 → v3.001 → v3.002 → v3.003 → v3.007.010 → **v3.008.000**  
> **Golden Merge:** Newer wins · Additive only · No regressions · Explicit supersession


## 21) Global Navigation: Menus & Dropdowns (NEW)

### 21.1 Primary Menus (merged groups)
Two source groups were provided:
- **Group A:** Home · Travel · Shopping · Academic · Sports · Library
- **Group B:** Home · Discover · Spaces · Finance · Account · Upgrade · Install · iTW standards · Continue

**Merged Canonical Order (B ∪ A):**
Home · Discover · Travel · Spaces · Shopping · Academic · Sports · Library · Finance · Account · Upgrade · Install · iTW Standards · Continue

**Rules**
- Exactly **one** visible primary nav per page (`<nav aria-label="Primary">`).  
- Items must be keyboard reachable (Tab / Shift+Tab), with visible focus.  
- Use a **disclosure button** pattern for dropdowns (no hover-only menus):
  - `<button class="nav-disclosure" aria-expanded="false" aria-controls="m-<id>">Label</button>`
  - `<div id="m-<id>" role="menu" hidden>` … `</div>`
- Close logic: Escape closes; focus returns to the invoker. Outside‑click and focus‑trap enforced.
- Mobile: menu toggler must be a real button with `aria-expanded` and `aria-controls`.

**Accessibility**
- Each dropdown panel uses `role="menu"`; items use `role="menuitem"` or plain `<a>` with list semantics (`<ul role="menu">`).  
- Arrow key nav optional; Tab order must always work.  
- Screen-reader labels: `aria-label` on `<nav>` and `aria-labelledby` for grouped sections.

**SEO**
- Only **one H1** on page; nav must **not** contain headings higher than H2.  
- Avoid duplicate links to the same canonical URL within a single menu cluster.


### 21.2 Dropdown Not Working — Debug Checklist (add to CI)

Common root causes & quick fixes:

1) **Truncated HTML**: `<html lan` → must be `<html lang="en">` (invalid markup breaks scripts).  
2) **Non-button triggers**: Use `<button>` not `<a>` for toggles; ensure `type="button"`.  
3) **Missing `aria-controls` / `aria-expanded`**: keep state in sync and toggle `hidden` on the panel.  
4) **CSS `overflow:hidden` on ancestor**: prevents panel from showing; move panel to a layer or remove overflow.  
5) **`z-index` stacking**: panel appears behind hero/header; give positioned parent and higher z-index.  
6) **Pointer events disabled**: `pointer-events:none` on overlay or parent blocks interactions.  
7) **Event not attached**: DOMContentLoaded vs module defer; ensure init runs once and after elements exist.  
8) **Focus trap missing**: panel opens then immediately closes on blur; implement proper focus management.  
9) **Hover-only patterns**: replace with click/keyboard disclosure for touch & accessibility.  
10) **JS errors earlier in head**: break subsequent scripts; check console for first error.  


## 22) SEO Evaluation Baseline (applies to all pages)

Run this list when auditing any codebase (even partial).

**Required meta & head**
- Charset, viewport, robots, **referrer=no-referrer**, version tag, title (≤ 60 chars), description (≤ 160 chars).  
- Absolute **canonical** URL to production host.  
- OG/Twitter set, values match visible content; OG image ≥ 1200×630 and 200‑OK.

**Structured data**
- Exactly one each: Organization, WebSite+SearchAction, WebPage, BreadcrumbList; optional single Review with **numeric** ratingValue.  
- No PII in URLs or JSON‑LD; use `youtube-nocookie` for embeds.

**Content structure**
- One H1; logical heading ladder; landmark roles (`header/main/footer`).  
- Skip link to `#content`; first focusable element is skip or site logo link.

**Performance**
- LCP image uses `fetchpriority="high"`; CLS < 0.1; lazy‑load non-critical images/iframes.  
- Preconnect/preload only if actually used; version all local assets with `?v=`.

**Links**
- External links hardened to `noopener noreferrer` and open in new tab only when leaving origin.  
- No duplicate internal links with conflicting anchor text in the same menu cluster.

**Index hubs**
- Hubs (Home/Discover/Ships/Restaurants) expose crawlable cards with real anchors, not JS-only actions.  
- Search/filter UI progressively enhances (works without JS).

**CI checks**
- DOM fingerprint for head order; presence of `_abs()` and canonicalization script.  
- JSON contracts parse; personas/venues/videos schemas validate.  
- Lighthouse ≥ 90 SEO and A11y on cable‑3G test profile.


## Appendix — Change Ledger (Δ v3.007.010 → v3.008.000)

| Area | Change |
|------|--------|
| Navigation | Merged two menu groups into a canonical primary nav; added disclosure dropdown standard. |
| A11y | Enforced keyboard-first dropdown pattern with focus trap & Escape to close. |
| SEO | Added sitewide SEO evaluation baseline checklist module. |
| CI | Added dropdown debug checklist to automated audits. |



## 23) Invocation Header & Structured‑Data Compliance (Added from v3.002 + v3.006)

### 23.1 Hidden Invocation Comment (Required)
- Embed the hidden doxology + dedication block on **every HTML page** just inside `<body>`.
- Source of truth: `00-core/HIDDEN_INVOCATION_COMMENTS.html`.
- Must be wrapped so it is **not** announced by screen readers (HTML comment only).

### 23.2 Share Metadata Alignment
- OG/Twitter fields **must** reflect the visible `<title>`/`description` on the page.
- If share fields diverge by >10% characters or differ semantically, CI fails.

### 23.3 JSON‑LD Specific Validations (Hard rules)
- For `ItemList`, every `ListItem` **must** include a numeric `position` starting at 1, contiguous, and matching the DOM order of the corresponding anchors.
- For `Review.itemReviewed`, the object must use the correct Schema.org type (e.g., `Cruise`, `WebPage`, `Product`) and include a resolvable `url` and `name`.
- `reviewRating.ratingValue` must be a **number** (not string); `bestRating`/`worstRating` numeric if present.

### 23.4 Service‑Worker Guard (No regressions)
- Keep SW registration lazy (`window.load`), log a console warning on failure, never block content rendering.

---

## Appendix — Change Ledger (Δ v3.008.000 → v3.008.001)
| Area | Change |
|------|--------|
| Invocation | Added **Hidden Invocation Comment** requirement sitewide. |
| Social/SEO | Enforced **OG/Twitter alignment** with page title/description. |
| JSON‑LD | Hard validations for **ItemList.position** and **itemReviewed** shape. |
| SW | Re‑affirmed lazy registration guard (no behavior change). |

