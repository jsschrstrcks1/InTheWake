# Restaurants Standards — Maritime Dining Revision (v2.256.003)

## R-1 Canonical Venue Pages
- One canonical page per venue at `/restaurants/<slug>.html` (e.g., `/restaurants/chops-grille.html`).
- Ship pages must link to the canonical venue page; venue page must link back to ship pages where available.

## R-2 Variants & One‑Off Menus
- Ship‑ or class‑specific items live within the canonical page under **Ship‑Specific Variants** and receive a stable anchor (e.g., `#icon-class-variant`).
- Ship dining cards may deep‑link directly to the variant anchor.

## R-3 Menus & Prices
- Include **Core Menu (Fleetwide Standard)** with prices when verified. Unverified entries must be labeled and placed behind a **To Verify** note.
- Global price disclaimer: “Prices are subject to change at any time without notice. These represent what they were the last time I sailed.”

## R-4 Special Accommodations
- Dedicated card for gluten‑free, vegetarian, and allergy protocols. Include pre‑sailing notification guidance and onboard confirmation.

## R-5 Logbook — Dining Disclosures
- Use adapted Logbook disclosures (A/B/C) for dining. Example B: “Aggregate of vetted guest soundings… trimmed and edited to our dining standards.”
- Place immediately under the Logbook header, inside a `.pill` element.

## R-6 Styling & Compliance
- Absolute URLs everywhere; include `<meta name="referrer" content="no-referrer">`.
- Watermark `https://www.cruisinginthewake.com/assets/watermark.png` at ~0.08 opacity on cards.
- Version badge present on every restaurant page.
