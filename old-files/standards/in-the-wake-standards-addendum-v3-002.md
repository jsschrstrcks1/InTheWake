---
title: "in-the-wake-standards-addendum-v3.002.md"
source_file: "in-the-wake-standards-addendum-v3.002.md"
generated: "2025-10-17T13:14:34.196300Z"
note: "Verbatim import (lightly normalized). Newer addenda may supersede specific clauses; see supersets."
---

# In the Wake — Standards Addendum v3.002

## Motto Integration
> *“The calmest seas are found in another’s wake.”*

This motto is now an approved brand and accessibility tagline to be optionally displayed under the primary `<h1>` element on pages that include a “Welcome” or introductory section.  
It should appear in the following semantic and stylistic form:

```html
<p class="motto"><em>The calmest seas are found in another’s wake.</em></p>
```

### Recommended Style (Add to Standards CSS)
```css
.motto {
  font-style: italic;
  font-size: 0.95rem;
  color: var(--ink-muted, #4a5568);
  margin-top: -0.25rem;
  margin-bottom: 1rem;
  text-align: center;
  letter-spacing: 0.02em;
}
@media (prefers-color-scheme: dark) {
  .motto {
    color: var(--foam, #b0c4de);
  }
}
```

---

## WCAG 2.1 Level AA & ADA Compliance Summary

All In the Wake pages (v3.002+) must comply with **WCAG 2.1 Level AA** and **ADA digital accessibility requirements**.  
These standards apply to all HTML, CSS, and JavaScript deliverables.

### Key Compliance Areas

#### 1. Perceivable
- All images require meaningful `alt` attributes. Decorative images should use `alt=""`.
- Text must maintain a contrast ratio of at least 4.5:1 against its background (7:1 for essential content when possible).
- Content must be navigable via screen readers (use semantic `<h1>–<h6>`, `<nav>`, `<main>`, `<footer>`, `<section>`).

#### 2. Operable
- Include a **“Skip to main content”** link at the top of every page.
- All interactive elements (links, buttons, chips, filters) must be keyboard-accessible and indicate focus visibly.
- Avoid time-dependent interactions or auto-refresh behaviors.

#### 3. Understandable
- Navigation must remain consistent across all pages.
- Input fields and forms must have associated `<label>` elements.
- Provide clear error messages and instructions when applicable.

#### 4. Robust
- Code must validate under W3C HTML standards.
- Avoid ARIA roles unless necessary; when used, ensure correct application (`role="button"`, `aria-label`, etc.).
- JavaScript interactions must gracefully degrade if scripts fail or are disabled.

---

## Legal Compliance Footer (Required on Accessibility Pages)
For the `/disability-at-sea.html` page and related accessibility content, append this footer note:

```html
<p class="legal-note">
  This website conforms to the ADA and WCAG 2.1 Level AA standards for digital accessibility.
  We are committed to ensuring equal access and usability for all visitors.
  If you encounter a barrier or accessibility issue, please contact us at
  <a href="mailto:accessibility@cruisinginthewake.com">accessibility@cruisinginthewake.com</a>.
</p>
```

### Footer Note Style
```css
.legal-note {
  font-size: 0.85rem;
  color: var(--ink-muted, #555);
  margin-top: 1.5rem;
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 0.75rem;
  text-align: center;
}
@media (prefers-color-scheme: dark) {
  .legal-note {
    color: var(--foam, #b0c4de);
    border-color: rgba(255,255,255,0.1);
  }
}
```

---

### Version Tracking
- **Version:** v3.002  
- **Date:** 2025-10-10
- **Scope:** WCAG 2.1 AA + ADA integration, motto CSS inclusion, accessibility footer requirement.
