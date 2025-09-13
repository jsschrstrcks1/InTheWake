# In the Wake — Project Standards
**Version:** v2.214  
**Scope:** All public pages in the repo. Grandeur of the Seas remains the design **gold standard** for reference only (do not mutate automatically).

---

## 0) Principles
- **Single source of truth.** The Standards define what the site must look like and how it must be wired. Code must conform to this doc — not the other way around.
- **Deterministic output.** Rebuilders must rebuild the entire `<main>` block and footer to guarantee correct order and content.
- **Absolute paths only.** All asset URLs, CSS `url(...)`, and internal links must begin with `/`. No relative `assets/...` paths.
- **Double-Check Mandate.** Every ship page changeset must pass the CI checks in §7 before shipping.

---

## 1) Required Card Order (inside `<main>`)
Render these cards **in this exact order** for every ship page:

1. **A First Look**  
   ```html
   <h2 id="first-look">A First Look</h2>
   ```

2. **Why Book {Ship}?** (Marketing blurb text; can be placeholder until sourced)  
   ```html
   <h2 id="why-book">Why book {Ship}?</h2>
   ```

3. **Ken’s Logbook — A Personal Review** (pun/placeholder allowed until real notes)  
   ```html
   <h2 id="personal-review">Ken’s Logbook — A Personal Review</h2>
   ```

4. **Watch: {Ship} Highlights** — **single** swiper for all embeds  
   ```html
   <h2 id="video-highlights">Watch: {Ship} Highlights</h2>
   ```
   - On-page limit: **one best** per category: Walkthrough; Cabins (Interior, Ocean View, Balcony, Suite); Dining; Accessibility (prefix caption with ♿).
   - Backing JSON may hold up to **10** per category for swaps.
   - **No loose iframes** outside the swiper.

5. **Deck Plans** (left) **+** **Live Tracker** (right) in a **two-card grid**  
   ```html
   <h2 id="deck-plans">Ship Layout (Deck Plans)</h2>
   <h2 id="live-tracker">Where Is {Ship} Right Now?</h2>
   ```
   - Must render side-by-side on desktop using a `.grid-2` container; single column on small screens.

6. **Attribution & Credits**  
   ```html
   <h2 id="attribution">Attribution & Credits</h2>
   ```

> **Pass criteria:** Each required `id` exists and appears in strictly increasing index order within `<main>`.

---

## 2) Watermark (Fouled Anchor)
- Inject the CSS **in `<head>`** with id `watermark-style` and an **absolute** path:
```html
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
```
- **No relative paths.** `url('/assets/watermark.png')` is required.

---

## 3) Deck Plans + Live Tracker Grid
- Must be wrapped in a `.grid-2` container that enforces a 2-up layout on desktop:
```html
<style id="grid-2-style">
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
```
- Left column: Deck Plans card with official deck plan link.  
- Right column: Live tracker link (CruiseMapper or substitute).

---

## 4) Video Policy
- **Single swiper** per page under **Watch: {Ship} Highlights**.  
- Category coverage **on page:** Walkthrough; Cabins (Interior, Ocean View, Balcony, Suite); Dining; Accessibility.  
- **At least one Accessibility video** per ship (any category) before a page is considered “complete.”  
- **JSON store (ground truth):** Up to **10** videos per category for each ship; page displays 1 best per category.  
- **Creators:** Prefer **Green List**; allow high-quality non-green list if content rules are met.

---

## 5) Marketing Blurbs
- The **Why Book {Ship}?** card must contain the corresponding marketing blurb from the blurb source.  
- If blurb is unavailable, use the placeholder:  
  _“Overview coming soon. Summarize top reasons to book — dining standouts, entertainment, itineraries, and who this ship fits best.”_

---

## 6) Footer (Terminal)
- Footer must be the **last DOM block** before `</body></html>`:
```html
<footer id="site-footer" class="muted">
  <div>In the Wake — A Cruise Traveler’s Logbook</div>
  <div>© 2025 In the Wake — A Cruise Traveler’s Logbook</div>
</footer>
</body></html>
```
- No content after `</html>`; remove any earlier footers.

---

## 7) CI / Compliance Checks (must pass before shipping)
1. **Order in `<main>`** — Verify strictly increasing indices for ids:  
   `first-look`, `why-book`, `personal-review`, `video-highlights`, `deck-plans`, `live-tracker`, `attribution`.
2. **Highlights label** — Header must be **exactly** `Watch: {Ship} Highlights`; only one swiper; **no loose iframes.**
3. **Watermark present** — `<style id="watermark-style">` exists and uses `url('/assets/watermark.png')`.
4. **Grid present** — `.grid-2` style injected; Deck Plans + Tracker in a 2-up layout.
5. **Footer terminal** — Ends with `</footer></body></html>` (whitespace allowed).
6. **Links** — Deck Plans and Live Tracker `href` are valid and absolute where applicable.
7. **Version bump** — All modified ship pages carry the same site version tag (e.g., `v2.214`), **Grandeur excluded**.
8. **Grandeur protection** — Do not mutate Grandeur automatically.

---

## 8) Versioning
- Increment in steps of **+0.001** for any shipped change that affects multiple pages or templates.  
- Grandeur retains its current version unless deliberately updated.

---

## 9) Recovery & Guardrails
- When a page deviates from standards, **rebuild `<main>` and footer** deterministically to restore compliance.  
- Preserve existing Deck Plans and Live Tracker URLs if present; otherwise insert defaults.

---

## 10) Change Log (excerpt)
- **v2.214** — Enforced **absolute asset paths**; watermark must be `url('/assets/watermark.png')`. Added grid layout requirement for Deck Plans + Tracker. Clarified video policy and JSON max=10. Strengthened CI checks and defined deterministic rebuild of `<main>` + footer.
- v2.210—v2.213 — Strict DOM order, single swiper, footer-last; various compliance fixes.
