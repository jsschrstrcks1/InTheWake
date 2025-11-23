# In the Wake — CI Checklist (v3.008)

This checklist mirrors our **CI internal checks** and enforces the **v3.008 unified standards** (Main + Root + Ships + Cruise Lines + WCAG addendum + Article Rail addendum + Nav Bar unification).
Use it in PR reviews and with the matching Node checker.

**Pass rule:** All ☑ checks must be true. Any ✗ is a hard block.

---

## Page Type: **Ships Index (/ships/index.html)**

### Data & Images

- [ ] Primary JSON: /ships/assets/data/rc-fleet-index.json with fallback /data/rcl_of_the_seas.json (no merge)
- [ ] Only render slugs with at least one discoverable image
- [ ] Random per-load image selection; broken image guard

### Caching

- [ ] Images cached by SW (SWR strategy); JSON via SiteCache (TTL)
- [ ] ItemList JSON-LD present with correct position indexes

### Unified Nav

- [ ] Standard order; aria-current on Ships

### Attribution

- [ ] Attribution card on hub; external attribution links absolute

---
**Note:** If a check intentionally deviates for this page, document the exception in the PR and update the standards addendum.