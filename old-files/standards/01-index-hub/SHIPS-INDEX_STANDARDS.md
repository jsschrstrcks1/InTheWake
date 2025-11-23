# Ships Index Standards — v3.006

### Image Gate
- Only show cards for slugs that have at least one matching image file present.
- Known examples:
  - allure-of-the-seas → `/ships/assets/images/allure-of-the-seas-3.jpg`, `/ships/assets/images/allure2.jpg`, `/ships/assets/images/allure3.jpg`

### Data Fallback (no-merge)
- Try `/ships/assets/data/rc-fleet-index.json`, then `/data/rcl_of_the_seas.json`.

### Script Pattern
See `standards/01-index-hub/scripts/fleet-cards.js` for a reference implementation (no network assumptions).
