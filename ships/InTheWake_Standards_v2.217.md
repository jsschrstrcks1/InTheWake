# In The Wake — Standards v2.217 (delta)

## Video Sourcing & Fuzzy Search Rules
- **Dining** detection (JSON normalization & search) must match any of:
  dining, restaurant, MDR, "main dining room", buffet, Windjammer, Chops, Giovanni, Izumi, "Johnny Rockets", food.
- **Accessibility (♿)** detection must match any of:
  accessible, wheelchair, ADA, mobility, scooter, disability, and prefer known creators (Wheelchair Travel, World on Wheels, etc.).
- **Cabin buckets** by title keywords:
  - Interior: interior, inside, "promenade interior", "virtual balcony"
  - Ocean View: "ocean view", oceanview, panoramic
  - Balcony: balcony
  - Suite: suite, owner, grand, royal, loft, villa, "aqua theater", "aqua theatre", "star loft"
- **Per-ship requirement**: at least 1 ♿ Accessibility video for every ship.
- **Green list preference**: if multiple candidates exist, pick a green-listed creator; otherwise pick a high-quality non-green.
- **JSON capacity**: up to 10 items per category; **page embed** shows only 1 best per category.
- **Compliance**: page fails if Highlights exists but 0 slides render; Swiper controls + init must be present; watermark path must be absolute (`/assets/watermark.png`).

## Layout essentials (re-affirmed)
- Card order: First Look → Why Book → Ken’s Logbook → Watch: {Ship} Highlights → Deck Plans + Live Tracker (2-up grid) → Attribution.
- Swiper assets are absolute: `/assets/vendor/swiper/swiper-bundle.min.css` and `/assets/vendor/swiper/swiper-bundle.min.js`.
- Swiper init script at end of `<body>`; controls present in the highlights block.
- Watermark CSS uses absolute path: `url('/assets/watermark.png')`, behind content (z-index), opacity ~0.08.
- Terminal footer with: “In the Wake — A Cruise Traveler’s Logbook” + “© 2025 In the Wake — A Cruise Traveler’s Logbook”.
