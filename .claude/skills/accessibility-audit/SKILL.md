---
name: accessibility-audit
description: "Audits WCAG 2.1 AA compliance across cruise content pages, interactive tools, and port guides — validates alt text, color contrast, heading hierarchy, ARIA labels, keyboard navigation, and screen reader compatibility"
version: 1.0.0
---

# Accessibility Audit — Cruise Content & Interactive Tools

## Purpose

Audit and enforce WCAG 2.1 AA compliance across all InTheWake pages. This skill validates image alt text, color contrast ratios, heading hierarchy, ARIA labeling, keyboard navigation, form accessibility, and screen reader compatibility — with special attention to the 9 interactive tools (calculators, quizzes) and 388 port pages that define this site.

## When to Fire

- When creating or editing any HTML page or template
- When adding or modifying images, forms, or interactive elements
- When building or updating calculators, quizzes, or other interactive tools
- When reviewing pages for accessibility compliance
- When prompted with `/accessibility-audit` or asked to check accessibility
- Before any page goes live or is merged to production
- When editing CSS that affects color, font size, or focus styles

## Instructions

### 1. Image Alt Text Validation

Check every `<img>` element for meaningful, descriptive `alt` attributes.

**Rules:**
- Every `<img>` MUST have an `alt` attribute — missing `alt` is a WCAG failure
- Alt text must describe the image content meaningfully, not generically (e.g., "Aerial view of Nassau cruise port with three docked ships" not "cruise port image")
- Decorative images (purely visual separators, background flourishes) must use `alt=""` — but cruise content images are almost never purely decorative
- Alt text should not begin with "Image of" or "Photo of" — screen readers already announce it as an image
- Alt text should be concise but specific: aim for 10-80 characters
- For port pages: alt text must identify the specific port, landmark, or feature shown
- For interactive tool screenshots or diagrams: alt text must convey the data or purpose the image represents

**Port page specifics (388 pages):**
- Each port page typically has hero images, attraction photos, and map graphics
- Hero images must include the port name and a distinguishing visual feature
- Map images must have alt text describing what the map shows (e.g., "Map of cruise terminal locations in Cozumel with walking distances to downtown")
- If an image conveys data (charts, infographics), provide the key data point in the alt text and consider a longer `aria-describedby` for full data

**Flag these violations:**
- `<img>` with no `alt` attribute at all — **Critical**
- `<img alt="image">`, `<img alt="photo">`, `<img alt="picture">` — **Critical** (non-descriptive)
- `<img alt="IMG_3847.jpg">` or any filename as alt text — **Critical**
- Alt text exceeding 150 characters without an `aria-describedby` companion — **Warning**

### 2. Color Contrast Ratio Validation

Validate that all text meets WCAG 2.1 AA contrast requirements against its background.

**Minimum ratios:**
- **Normal text** (below 18pt / 14pt bold): **4.5:1** contrast ratio
- **Large text** (18pt+ or 14pt+ bold): **3:1** contrast ratio
- **UI components and graphical objects**: **3:1** contrast ratio against adjacent colors

**What to check in CSS:**
- `color` against `background-color` on the same element or nearest ancestor with a background
- Text over background images or gradients — ensure sufficient contrast across all areas where text appears
- Hover, focus, and active states — contrast must be maintained in all interactive states
- Disabled states are exempt but should still be distinguishable

**InTheWake-specific checks:**
- Navigation bar text against the nav background
- Port page card text over hero image overlays — verify the overlay opacity provides enough contrast
- Interactive tool labels, input text, placeholder text, and result displays
- Footer links and copyright text
- Error messages and success confirmations in forms and calculators
- Quiz question text and answer option text against their backgrounds

**Flag these violations:**
- Any normal text below 4.5:1 ratio — **Critical**
- Any large text below 3:1 ratio — **Critical**
- Placeholder text with insufficient contrast — **Warning** (common failure)
- Focus indicators that do not meet 3:1 against adjacent colors — **Critical**

### 3. Heading Hierarchy Validation

Verify that heading levels follow a logical, sequential order with no skipped levels.

**Rules:**
- Each page must have exactly one `<h1>`
- Headings must not skip levels: `h1` → `h2` → `h3` is valid; `h1` → `h3` is a **violation**
- Heading levels can decrease by more than one (e.g., `h3` back to `h1` in a new section is fine at section boundaries, but `h3` back to `h1` within the same content flow is suspicious)
- Headings must not be used solely for visual styling — if text looks like a heading but is a `<p>` with large font, flag it
- If text is styled as a heading visually but uses `<div>` or `<span>`, flag as a violation

**InTheWake-specific checks:**
- Port pages: `h1` = port name, `h2` = major sections (Overview, Attractions, Tips), `h3` = subsections
- Interactive tools: Each tool section should have a proper heading, not just bold text
- Quiz pages: Question text should be headings or properly labeled, not just styled `<p>` tags
- `accessibility.html` and `disability-at-sea.html` must be exemplary — these pages represent the site's commitment to accessibility

### 4. ARIA Labels on Interactive Elements

Validate that all interactive components have proper ARIA labeling for assistive technology.

**Rules for all interactive elements:**
- Every interactive element must have an accessible name via `aria-label`, `aria-labelledby`, or visible `<label>`
- `aria-label` must be descriptive of the action, not the element type (e.g., "Calculate total cruise cost" not "calculator")
- `aria-labelledby` must reference an existing element `id` on the page
- `role` attributes must be used correctly per WAI-ARIA spec (e.g., `role="button"` only on elements that behave as buttons)
- Custom widgets must declare `role`, `aria-label`, and relevant states (`aria-expanded`, `aria-selected`, `aria-checked`, etc.)

**9 interactive tools — mandatory checks:**
- Each calculator must have `aria-label` on the overall container identifying the tool's purpose
- All input fields must have associated `<label>` elements or `aria-label`
- Range sliders must have `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` (for human-readable value)
- Result/output areas must use `aria-live="polite"` so screen readers announce updated results
- Quiz answer options must use proper `role="radio"` or `role="checkbox"` with `aria-checked` state
- Progress indicators (quiz progress, calculation steps) must use `role="progressbar"` with `aria-valuenow`
- Modal dialogs (if any) must use `role="dialog"` and `aria-modal="true"`

**Flag these violations:**
- Interactive element with no accessible name — **Critical**
- `aria-labelledby` referencing a nonexistent `id` — **Critical**
- Live region missing on dynamically updated content — **Critical**
- Incorrect `role` usage — **Warning**

### 5. Keyboard Navigation Paths

Verify that all interactive content is fully operable via keyboard alone.

**Rules:**
- Every interactive element must be reachable via `Tab` key (or `Arrow` keys within widget groups)
- Focus order must follow a logical reading sequence — typically left-to-right, top-to-bottom
- No keyboard traps: the user must be able to `Tab` away from every element they can `Tab` into
- `Escape` must close modals, dropdowns, and overlay panels
- Custom interactive elements must handle `Enter` and `Space` for activation
- `tabindex` usage must be correct:
  - `tabindex="0"` to add an element to natural tab order — acceptable
  - `tabindex="-1"` to make an element programmatically focusable but not in tab order — acceptable for managed focus
  - `tabindex` with positive values (1, 2, 3...) — **always a violation** (disrupts natural order)

**9 interactive tools — keyboard specifics:**
- Calculators: All inputs, buttons, and dropdowns must be keyboard-operable; results must be reachable after calculation
- Quizzes: Answer selection, navigation between questions, and result viewing must all work without a mouse
- Sliders/range inputs: Must respond to `Arrow` keys with reasonable step increments
- Any drag-and-drop interactions must have a keyboard alternative

**Flag these violations:**
- Element with `onclick` but no `onkeydown`/`onkeyup` equivalent and no native keyboard behavior — **Critical**
- Positive `tabindex` values — **Critical**
- Missing focus management after dynamic content updates (e.g., showing quiz results) — **Warning**
- Custom element not responding to `Enter`/`Space` — **Critical**

### 6. Form Labels and Error States

Validate that all forms are accessible with proper labeling and error handling.

**Rules:**
- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` (via `for`/`id` match) or `aria-label`
- Labels must be visible — `aria-label` alone is acceptable only when the visual design makes the purpose obvious (e.g., a search field with a magnifying glass icon)
- Required fields must be indicated via `aria-required="true"` and a visible indicator
- Error messages must be:
  - Programmatically associated with the field via `aria-describedby` or `aria-errormessage`
  - Announced to screen readers (via `aria-live` or `role="alert"`)
  - Specific about what went wrong ("Enter a number between 1 and 20" not just "Invalid input")
- Form submission errors must move focus to the first error or to an error summary

**InTheWake-specific form checks:**
- Calculator input fields: labels must describe what value to enter and the expected format
- Quiz submission: errors should indicate which questions are unanswered
- Contact or feedback forms: all fields labeled, error states accessible
- Newsletter signup forms: proper label, error handling, and success confirmation

**Flag these violations:**
- Input with no associated label or `aria-label` — **Critical**
- Error message not programmatically linked to its field — **Critical**
- Required field with no accessible indication — **Warning**
- Error message that lacks specificity — **Warning**

### 7. Skip-to-Content Links and Focus Indicators

**Skip navigation:**
- Every page must have a "Skip to main content" link as the first focusable element
- The link may be visually hidden but must become visible on focus
- The link must target a valid `id` on the `<main>` element or primary content area
- On port pages with long navigation menus, a skip link is especially critical

**Focus indicators:**
- Every focusable element must have a visible focus indicator
- The default browser outline is acceptable, but if overridden (`outline: none`), a custom focus style must be provided
- Focus indicators must have at least 3:1 contrast against adjacent backgrounds
- `:focus-visible` is preferred over `:focus` to avoid showing focus rings on mouse clicks

**Flag these violations:**
- No skip-to-content link — **Critical**
- `outline: none` or `outline: 0` without a replacement focus style — **Critical**
- Skip link targeting a nonexistent `id` — **Critical**
- Focus indicator with insufficient contrast — **Warning**

### 8. Screen Reader Compatibility

**Landmark regions:**
- Page must use semantic landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`
- If multiple `<nav>` elements exist, each must have a distinguishing `aria-label` (e.g., "Main navigation", "Port page sidebar")
- `<main>` must be present exactly once per page

**Content structure:**
- Data tables must use `<th>` with `scope="col"` or `scope="row"` — do not use tables for layout
- Lists of related items must use `<ul>`, `<ol>`, or `<dl>` — not a series of `<div>` elements
- Links must have descriptive text — no bare "click here" or "read more" without context (use `aria-label` to expand meaning if the visible text is short)
- Icons used as links/buttons must have screen reader text via `aria-label` or visually hidden `<span>`

**InTheWake-specific checks:**
- Port page lists (attractions, restaurants, tips) must use proper list markup
- Calculator results displayed in tables must have proper table headers
- Interactive tool instructions must be in a logical reading order for screen readers
- The `accessibility.html` page itself must be a flawless example of accessible markup

### 9. WCAG 2.1 AA Specific Checks

These additional WCAG 2.1 criteria often get overlooked:

- **1.3.4 Orientation**: Content must not be locked to portrait or landscape unless essential
- **1.3.5 Identify Input Purpose**: Form fields for personal data should use `autocomplete` attributes (e.g., `autocomplete="email"`)
- **1.4.10 Reflow**: Content must reflow at 320px width without horizontal scrolling (check all 9 interactive tools at narrow viewports)
- **1.4.11 Non-text Contrast**: UI components and graphical objects must have 3:1 contrast
- **1.4.12 Text Spacing**: Content must remain functional when text spacing is increased (line-height 1.5x, paragraph spacing 2x, letter spacing 0.12em, word spacing 0.16em)
- **1.4.13 Content on Hover or Focus**: Tooltips and popovers must be dismissible, hoverable, and persistent
- **4.1.3 Status Messages**: Status updates (calculation results, quiz scores, form confirmations) must be communicated to screen readers without receiving focus

### 10. Reporting Format

For each page or component audited, produce a report structured as:

```
## Accessibility Audit: [Page Title or Component Name]

### WCAG 2.1 AA Compliance Summary
- **Critical Violations**: [count]
- **Warnings**: [count]
- **Passed Checks**: [count]

### Critical Violations (must fix)
- [ ] [WCAG criterion number] [Description] — [Specific fix suggestion]

### Warnings (should fix)
- [ ] [WCAG criterion number] [Description] — [Recommendation]

### Passed Checks
- [x] [Check description]

### Interactive Tool Status (if applicable)
| Tool Name | Keyboard Nav | ARIA Labels | Live Regions | Focus Mgmt |
|-----------|-------------|-------------|--------------|------------|
| [name]   | Pass/Fail   | Pass/Fail   | Pass/Fail    | Pass/Fail  |
```

Prioritize critical violations. Always provide the specific WCAG criterion number (e.g., 1.1.1, 1.4.3) and a concrete fix suggestion — not just "fix contrast" but "Change `.port-card-title` color from `#999` to `#595959` to achieve 4.5:1 against white background."

---

*Soli Deo Gloria*
