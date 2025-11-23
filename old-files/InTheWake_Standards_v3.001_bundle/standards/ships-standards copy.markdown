# In The Wake Ships Standards (Sub-Document v2.233)

This sub-document defines rules for ship pages in `/ships/<line>/` (e.g., `/ships/rcl/icon-of-the-seas.html`, `/ships/carnival/carnival-breeze.html`). It is part of the modular "In The Wake Standards v2.233" and must be used with the [Main Standards](/standards/main-standards.md) for global rules (e.g., absolute URLs, versioning). Updates from v2.229 Addendum (§6.1 Media Source Merge) are included.

## 3) Required Card Order (inside <main>)
Render these cards in this exact order for every ship page:

1. A First Look  
   <section class="card" aria-labelledby="first-look">
     <h2 id="first-look">A First Look</h2>
     <!-- 3 images in .photo-grid -->
   </section>

2. Why Book {Ship}? (Marketing blurb; placeholder if unsourced)  
   <section class="card" aria-labelledby="why-book">
     <h2 id="why-book">Why Book {Ship}?</h2>
     <!-- Blurb text -->
   </section>

3. Ken’s Logbook — A Personal Review (placeholder permitted)  
   <section class="card" aria-labelledby="personal-review">
     <h2 id="personal-review">Ken’s Logbook — A Personal Review</h2>
     <!-- Review text -->
   </section>

4. Watch: {Ship} Highlights — single swiper for all embeds  
   <section class="card" aria-labelledby="video-highlights">
     <h2 id="video-highlights">Watch: {Ship} Highlights</h2>
     <!-- Single swiper with 1 best per category -->
   </section>

5. Two-up row: Deck Plans (left) + Live Tracker (right)  
   <div class="grid-2">
     <section class="card" aria-labelledby="deck-plans">
       <h2 id="deck-plans">Ship Layout (Deck Plans)</h2>
       <!-- Official link/PDF -->
     </section>
     <section class="card" aria-labelledby="live-tracker">
       <h2 id="live-tracker">Where Is {Ship} Right Now?</h2>
       <!-- Tracker embed -->
     </section>
   </div>

6. Attribution & Credits  
   <section class="card" aria-labelledby="attribution">
     <h2 id="attribution">Attribution & Credits</h2>
     <!-- <ul> list of credits -->
   </section>

Pass criteria: Each required id exists and appears in strictly increasing index order within <main>.

## 4) Watermark (Fouled Anchor)
- Inject the CSS in <head> with id watermark-style and an absolute path:
<style id="watermark-style">
  html, body { position: relative; }
  body::before {
    content: "";
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: min(60vw, 900px);
    height: min(60vh, 900px);
    background: url('/assets/watermark.png') no-repeat center / contain;
    opacity: 0.08;
    pointer-events: none;
    z-index: 0;
  }
  main, header, footer, section, nav { position: relative; z-index: 1; }
</style>
- No relative paths. url('/assets/watermark.png') is required.

## 5) Deck Plans + Live Tracker Grid
- Must be wrapped in a .grid-2 container that enforces a 2-up layout on desktop:
<style id="grid-2-style">
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
- Left column: Deck Plans card with official deck plan link (e.g., CruiseMapper: /deckplans/[Ship-Name]-[ID]).
- Right column: Live tracker link (e.g., CruiseMapper or substitute).

## 6) Video Rules
- Single swiper per page under Watch: {Ship} Highlights.
- Category coverage on page: Walkthrough; Cabins (Interior, Ocean View, Balcony, Suite); Dining; Accessibility.
- At least one Accessibility video per ship (any category) before a page is considered “complete.”
- Green list preference: Pick a green-listed creator; otherwise, select a high-quality non-green video.
- JSON capacity: Up to 10 items per category; page embed shows only 1 best per category.
- Compliance: Page fails if Highlights exists but 0 slides render; Swiper controls + init must be present; watermark path must be absolute (`/assets/watermark.png`).
- Swiper assets are absolute: `/assets/vendor/swiper/swiper-bundle.min.css` and `/assets/vendor/swiper/swiper-bundle.min.js`.
- Swiper init script at end of <body>; controls present in the highlights block.
- **Media Source Merge** (v2.229 Addendum, §6.1):
  - When sourcing videos for RCI ships, consult these JSONs in order and **merge** (dedupe by YouTube id):
    1. `/data/rc_ship_videos.json` (legacy root copy if present)
    2. `/ships/rc_ship_videos.json` (section copy if present)
    3. `/assets/data/fleet_index.json` cross-ref → `/assets/videos/rc_ship_videos.json` (canonical)
- The compliance pass now checks all three, preferring `/assets/videos/...` but backfilling from legacy locations to avoid gaps.

Video Category Fuzzy Matching

Walkthrough: "walkthrough", "ship tour", "full tour", "complete ship tour", "top to bottom", "Full Walkthrough", "Ship Tour", "Ship Tour & Review", "Tour & Review", "Complete Walkthrough", "Complete Tour", "Ship Review", "Onboard Tour", "deck by deck", "guided tour", "vlog tour".
Dining: "dining", "restaurants", "menus", "food", "buffet", "specialty", "Main Dining Room", "MDR", "Nights of Dinners", "5 Nights of Dinners", "Dinner Menu", "Lunch Menu", "Breakfast Menu", "Specialty Dining Review", "Windjammer", "Chops", "Giovanni", "Izumi", "Johnny Rockets", "Cuisine", "Chef", "Guy’s Burger", "Bonsai Sushi", "Fahrenheit 555", "Cucina del Capitano".
Accessibility (♿): "accessible", "wheelchair", "ADA", "mobility", "scooter", "disability"; prefer creators like Wheelchair Travel, World on Wheels.
Cabin buckets:
  Interior: "interior", "inside", "promenade interior", "virtual balcony"
  Ocean View: "ocean view", "oceanview", "panoramic"
  Balcony: "balcony"
  Suite: "suite", "owner", "grand", "royal", "loft", "villa", "aqua theater", "aqua theatre", "star loft"
Top 10/Things to Do: "top 10", "things to do", "activities", "entertainment".
Accessibility captions: Prefix with **♿**.

Video Sourcing & Runtime Additions
At runtime, if a category is missing in JSON, use web_search for "[ship name] [category] video" (e.g., "Grandeur of the Seas walkthrough video") and prioritize trusted channels.
Use browse_page to scrape YouTube search results for video IDs, then view_x_video to confirm quality/subtitles.
Add retrieved videos to /assets/videos/rc_ship_videos.json at runtime if not present, capping at 10 per category.
Prefer videos from trusted channels; blocklist bad IDs.

Image Sourcing Additions
If <3 local images for a ship, use web_search for "[ship name] cruise ship photos Wikimedia" and hotlink CC-licensed images via view_image to verify.
Auto-add up to 3 content images per ship if missing, prioritizing Wikimedia Commons for free use.

## 11) Historical Ship & Coming Soon
- Historical ships (e.g., Legend of the Seas 1995) are labeled “Historical Ship” with dedicated pages.
- Coming soon ships have placeholders (e.g., Legend of the Seas 2026).