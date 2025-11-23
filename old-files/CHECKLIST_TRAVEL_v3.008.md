# In the Wake — CI Checklist (v3.008)

This checklist mirrors our **CI internal checks** and enforces the **v3.008 unified standards** (Main + Root + Ships + Cruise Lines + WCAG addendum + Article Rail addendum + Nav Bar unification).
Use it in PR reviews and with the matching Node checker.

**Pass rule:** All ☑ checks must be true. Any ✗ is a hard block.

---

## Page Type: **Travel (travel.html)**

### Invocation & Versioning

- [ ] Title/OG/social reflect v3.008 content and correct image
- [ ] meta[name=page:version] = v3.008
- [ ] Article JSON-LD present (Ken + Tina allowed)

### Unified Nav

- [ ] Matches standard order and labels
- [ ] aria-current on Travel

### Layout

- [ ] Two-column layout: content + right rail
- [ ] Right rail contains (1) From the Journal, (2) Quick Chart (chips with separators)

### Quick Chart

- [ ] Anchors exist for each chip target
- [ ] Use • separators

### Article Rail

- [ ] Source: /assets/data/articles/index.json
- [ ] Filter: keywords includes 'travel' (and shared)
- [ ] Includes this page as article entry

### WCAG & A11y

- [ ] Skip link, landmarks, aria labels, descriptive alts
- [ ] External link hardener applied

---
**Note:** If a check intentionally deviates for this page, document the exception in the PR and update the standards addendum.