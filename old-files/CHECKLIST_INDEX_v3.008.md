# In the Wake — CI Checklist (v3.008)

This checklist mirrors our **CI internal checks** and enforces the **v3.008 unified standards** (Main + Root + Ships + Cruise Lines + WCAG addendum + Article Rail addendum + Nav Bar unification).
Use it in PR reviews and with the matching Node checker.

**Pass rule:** All ☑ checks must be true. Any ✗ is a hard block.

---

## Page Type: **Root Index (index.html)**

### Invocation & Versioning

- [ ] Page title includes (v3.008)
- [ ] meta[name=page:version] = v3.008
- [ ] Hero has exactly one compass image
- [ ] Invocation banner present (Soli Deo Gloria) near footer

### Unified Nav (order + targets)

- [ ] Home, Ships (/ships/), Restaurants, Ports, Disability at Sea, Drink Packages, Packing Lists, Planning, Solo, Travel, Cruise Lines, About Us
- [ ] All internal links absolute domain in production or normalized via origin normalizer
- [ ] aria-current=page on index

### Right Rail

- [ ] Article rail (From the Journal) pulls from /assets/data/articles/index.json
- [ ] Shows Ken and Tina and this page if applicable
- [ ] Fallback placeholder images present

### Caching

- [ ] site-cache.js included and warmup snippet present
- [ ] SW registered with ?v=3.008
- [ ] Images lazy where appropriate

### Structured Data

- [ ] WebSite JSON-LD present

---
**Note:** If a check intentionally deviates for this page, document the exception in the PR and update the standards addendum.