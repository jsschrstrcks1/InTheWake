# In The Wake Standards v2.203

## Required Video Categories (per ship)
Order in **Video Highlights**:
1. Walkthrough
2. Cabins — must include **all stateroom classes** before marked compliant:
   - Interior / Inside
   - Ocean View
   - Balcony
   - Suite (Junior/Grand/Owner's/Loft acceptable)
3. Dining
4. Accessibility — at least **one** video from a trusted disabled creator per ship

*Entertainment* and *Tips* are no longer required categories.

## Accessibility Labeling
- In the swiper caption, prepend **"♿ "** to accessibility videos. Example:  
  `♿ Wheelchair Accessible Cabin 3168 — <em>Wheelchair Travel</em>`

## Page Structure (Gold Standard: Grandeur)
1) A First Look (3 images)  
2) Why book {Ship}?  
3) Ken’s Logbook — A Personal Review (placeholder permitted)  
4) Video Highlights (swiper; categories in the order above)  
5) Grid: left = Deck Plans, right = Live Tracker  
6) Watermark: `assets/watermark.png` fixed behind all content

## Auditing Rules
- **Pass** when each required category has ≥1 video; **Cabins** passes only when **all four classes** are represented (Interior, Ocean View, Balcony, Suite).  
- **Accessibility** passes with ≥1 trusted disabled-creator video embedded on the page.  
- JSON is the **source of truth** for category membership; HTML is validated by embedded IDs.

## Trusted Disabled Creators (Green List)
- Wheelchair Travel
- World on Wheels
- (Add more as approved)


## v2.204 Updates
- Added **Harr Travel** to Green List.
- Fuzzy search tuned to catch patterns like "Full Walkthrough Tour & Review | 2024" and cabin class keywords.
- Selection rubric: prefer green list; then match category/class keywords; then recency/quality.
- JSON remains richer (≤10 per category), while HTML shows **one best** per category/class.
- Label Accessibility captions with **♿**.


## v2.208 — Video Highlights & Footer Enforcement
- **Card Order (exact, fleet-wide)**: A First Look → Why Book {Ship}? → Ken’s Logbook → **Video Highlights** → Deck Plans (L) + Live Tracker (R) → Attribution & Credits → Footer.
- **Video Highlights**: All videos must be embedded **inside a single swiper** under the Video Highlights card — no loose iframes elsewhere.
- **On-page limit**: **One (1) best** video per category/class (Walkthrough; Cabins: Interior/Ocean View/Balcony/Suite; Dining; Accessibility). JSON may keep up to **10** per category for future swaps.
- **Accessibility captions**: Prefix with **♿**.
- **Watermark**: Inject CSS with `id="watermark-style"` using `assets/watermark.png` centered behind all content.
- **Footer**: Must be the very last element with exactly:
  - `In the Wake — A Cruise Traveler’s Logbook`
  - `© 2025 In the Wake — A Cruise Traveler’s Logbook`
- **Double-check**: Before shipping, verify (1) watermark present, (2) section order correct, (3) no iframes outside highlights, (4) footer at bottom.
