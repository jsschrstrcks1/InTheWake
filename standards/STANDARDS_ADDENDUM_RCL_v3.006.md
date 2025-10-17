# Cruise Line Page — Superset Addendum (Royal Caribbean Reference) v3.006.006

- **Invocation:** UTF‑8 invocation comment at top + visible invocation near footer (Soli Deo Gloria).
- **Versioning:** Title, `<meta name="version">`, and `.version-badge` must match the CSS/JS cache buster (`v3.006.006`).
- **Absolute URLs:** Only use `https://www.cruisinginthewake.com/...` for internal links/assets (no GitHub in prod).
- **Top Nav:** `.pill-nav.pills`; **Cruise Lines** link = `/cruise-lines.html`.
- **Hero Rule:** Exactly one hero image and one compass in the hero.
- **Search-first:** Live, no button; merges **Ships + Venues + Experiences**.
- **Class → Ships Pills:** Editorial order Icon → Oasis → Quantum → Quantum Ultra → Freedom → Voyager → Radiance → Vision → Archive.
- **Toggle:** “Show unfinished ships” OFF by default; applies to class pills, class grid, and search.
- **Dress Code:** Section above venues; Chef’s Table requires formal; most venues smart casual.
- **Venues Panel:** Right column; filter tabs (All, Premium, Included); links to `/restaurants/<slug>.html`.
- **Accessibility:** Skip-link; labeled inputs; aria-live for results.
- **Perf:** Cache buster increments by `.001` per batch (e.g., 3.006.006 → 3.006.007).
- **Attributions:** Maintain `/attributions/attributions.csv` (path, source URL, license, credit, notes).
