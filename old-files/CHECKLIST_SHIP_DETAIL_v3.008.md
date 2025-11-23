# In the Wake — CI Checklist (v3.008)

This checklist mirrors our **CI internal checks** and enforces the **v3.008 unified standards** (Main + Root + Ships + Cruise Lines + WCAG addendum + Article Rail addendum + Nav Bar unification).
Use it in PR reviews and with the matching Node checker.

**Pass rule:** All ☑ checks must be true. Any ✗ is a hard block.

---

## Page Type: **Ship Detail (/ships/<line>/<slug>.html)**

### Paths & Linking

- [ ] Path pattern: /ships/<line>/<slug>.html
- [ ] Cross-links to restaurants, class hub, and other ships

### Content Blocks

- [ ] Hero + compass rule
- [ ] Logbook section (reviews) present
- [ ] Venues panel/cards present

### Data & Caching

- [ ] Use SiteCache for fleet_index, venues, personas, videos
- [ ] Images lazy load; SW cache-first

### Structured Data

- [ ] Article or WebPage JSON-LD with ship name and breadcrumb

### A11y

- [ ] Skip link, aria landmarks, descriptive alts

---
**Note:** If a check intentionally deviates for this page, document the exception in the PR and update the standards addendum.