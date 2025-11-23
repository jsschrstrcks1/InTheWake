# In the Wake — Standards & CI Canonization (v3.009)

## Overview
This document formalizes the new dropdown navigation, right-rail system, and JSON contracts for author and article data. It also specifies continuous integration checks to ensure every page remains structurally and visually compliant with project standards.

---

## 1. Unified Navigation (v3.009)

### 1.1 Information Architecture
- **Primary IA:** `Home · Planning ▾ · Travel ▾ · About`
- **Planning submenu:** Planning (overview), Ports, Restaurants & Menus, Ships, Drink Packages, Cruise Lines, Packing Lists, Accessibility.
- **Travel submenu:** Travel (overview), Solo.

### 1.2 DOM & Accessibility Contract
- Each parent dropdown is a `.nav-item[aria-haspopup="true"]` element.
- The toggle is a `<button class="chip" type="button" aria-expanded="false" aria-controls="menu-id">`.
- The submenu container is a sibling `<div role="menu" id="menu-id">` containing `<a role="menuitem">` links.
- Keyboard support:
  - `Enter`/`Space` toggles open/close.
  - `ArrowDown` moves focus into the menu.
  - `Escape` closes and returns focus to the button.
- Menus close on outside-click or Escape key.
- Visual: one-line header, no horizontal scrolling nav.
- No `100vw` in header or hero containers; heroes use `width:100%` to avoid subpixel bleed.

---

## 2. Right Rail (v3.009)

### 2.1 Layout
- Two-column at ≥980px: main content left, right rail (authors + journal) right.
- Single column on mobile for accessibility.

### 2.2 Data Source
- Canonical source for authors: `/data/authors.json` (see schema below).
- Journal runtime maps each article’s `author.name` to `/data/authors.json` for canonical avatar resolution.
- Seed fallback images must match the correct author (e.g., Tina → `/authors/img/tina3.jpg`, Ken → `/authors/img/ken1.jpg`).

### 2.3 JSON Schema
Schema file: `schemas/authors.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://cruisinginthewake.com/schemas/authors.schema.json",
  "title": "Authors v1",
  "type": "object",
  "required": ["authors"],
  "properties": {
    "version": { "type": "string" },
    "generated": { "type": "string" },
    "authors": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "slug": { "type": "string" },
          "name": { "type": "string" },
          "url": { "type": "string" },
          "image": { "type": "string" },
          "webp": { "type": "string" },
          "avatar": { "type": "string" },
          "roles": { "type": "array", "items": { "type": "string" } },
          "sections": { "type": "array", "items": { "type": "string" } }
        },
        "anyOf": [
          { "required": ["webp"] },
          { "required": ["image"] },
          { "required": ["avatar"] }
        ]
      }
    }
  }
}
```

---

## 3. Cache-Busting and Version Coupling
- Each HTML page includes `<meta name="page:version" content="vX.YYY.ZZZ">`.
- All fetches, script and link tags must append `?v=<page version>`.
- CI validates that every versioned URL matches the page version.

---

## 4. Accessibility Addendum (v3.100)
- `.skip-link` required on every page and visible on focus.
- Dropdown menus fully keyboard-accessible.
- External links use `rel="noopener noreferrer"` and must not downgrade to HTTP.

---

## 5. CI Checks

### 5.1 Schema Validation
Validate `data/authors.json` against `schemas/authors.schema.json` using `ajv-cli`.

### 5.2 Forbidden 100vw
Fail build if `100vw` is found in CSS or inline styles.

### 5.3 Version Coupling
Ensure all versioned URLs (`?v=`) match the page version meta.

### 5.4 Nav Contract
Automated Playwright test checks that:
- Dropdowns exist (`.nav-item[aria-haspopup="true"]`).
- Buttons and menus have correct ARIA roles.
- Open/close and Escape behavior work as expected.

### 5.5 Avatar Existence
Validate that each `image`, `webp`, or `avatar` in `data/authors.json` exists in the repository or is a valid external URL.

### 5.6 Optional
- Lighthouse CI for accessibility score ≥95.
- Linkinator to confirm valid internal and external links.

---

## 6. GitHub Actions Workflow
`.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci

      - name: Validate authors.json schema
        run: npm run schema:authors

      - name: Check avatars exist
        run: npm run check:avatars

      - name: Forbid 100vw
        run: npm run lint:nowvw

      - name: Version coupling check
        run: npm run check:versions

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start static server
        run: |
          python3 -m http.server 8080 &
          echo $! > server.pid
        shell: bash

      - name: Nav dropdown tests
        run: npm run test:nav

      - name: Kill server
        if: always()
        run: kill $(cat server.pid) || true

      - name: Link check
        run: npm run check:links
```

---

## 7. Enforcement Summary
✅ Correct dropdown structure (ARIA + keyboard).  
✅ Consistent version coupling.  
✅ Accurate author photos and JSON schema.  
✅ No `100vw` overflow regressions.  
✅ Automated tests ensure these rules are never silently broken.

---

**Soli Deo Gloria — may every pixel and paragraph bear His reflection.**
