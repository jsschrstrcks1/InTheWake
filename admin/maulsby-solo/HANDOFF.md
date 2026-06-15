# Solo Travel page — Maulsby Travel Co. (preview draft)

**File:** `solo-travel.html` (standalone, open it in any browser to preview)
**Purpose:** Show Tina first. Once approved, paste the body into WordPress.
**Positioning:** Hybrid / story-led service page. **Primary CTA:** Book a free consult.

---

## What's already real (from Tina's own words)

All factual claims trace to Tina's blog post *"How Solo Cruising Became 'My Thing'"*
(maulsbytravel.com/2026/06/14/10495/) and her In the Wake author page. Nothing invented.

- Solo Cruise Specialist; Maulsby is a full-service agency that books for everyone
- Top 2% travel agency · Top 25 with NCL out of 11,000+ agencies
- Founded the Solo Cruisers community — 55K+ members (post says "2nd largest, currently 55k")
- Tagline: **"Travel Solo, Never Alone"**
- **Solo ≠ Single** — solo community, not a singles/dating group
- Books solo cruises **and** hosted group sailings for the solo community
- Covid turning point: "stop waiting"
- Phone 910-528-5077 · tina@maulsbytravel.com
- Affiliate/license footer: ASAP Cruises Inc. · FST ST15578 · CST 2090937-50 · WA UBID 603189022

### Links wired in
- Solo Cruisers group: https://www.facebook.com/groups/1739046412949279
- Facebook page: https://www.facebook.com/profile.php?id=61582622205785
- Instagram (@maulsbytravel): https://www.instagram.com/maulsbytravel
- TikTok (@beyondboundarieswithtina): https://www.tiktok.com/@beyondboundarieswithtina  *(found in InTheWake repo: authors/tina-maulsby.html)*
- Contact CTA → https://maulsbytravel.com/contact/

---

## What Tina needs to supply — marked `[TINA: ...]` in the file

1. **Hero background photo** — Tina on a cruise deck / at sea (hero `.img-note`).
2. **Story photo** — headshot or favorite cruise photo (`.photo-slot`).
3. **Upcoming hosted sailings (optional)** — specific dates/ships, in the "Hosted group sailings" card (HTML comment marks the spot).
4. **Testimonials (optional, recommended)** — real client quotes. None were invented; add a section if she has them.

> The 55K figure was current as of her June 2026 post. Update if it's grown.

---

## Numbers to confirm before publishing
- "Top 25 with NCL out of 11,000+ agencies" — her wording was "top 25 ... out of over 11k." Confirm it's current.
- Single-supplement language is kept deliberately general (no specific % promised) — accurate and safe.

---

## How to publish in WordPress

The page is self-styled for preview. In WordPress you have two clean options:

**Option A — Page Builder / blocks (recommended for theme consistency)**
Rebuild the sections using the body copy (headings, paragraphs, CTAs) so it inherits
the Maulsby theme fonts/colors. The HTML is the content spec; copy the words section by section.

**Option B — Paste HTML directly (fastest)**
1. In the WP page editor, click the **Code** tab (next to Visual — see the editor screenshot).
2. Copy everything **inside `<body>`...`</body>`** from `solo-travel.html` (skip `<head>` and the
   `<!DOCTYPE>`).
3. The `<style>` block lives in `<head>` — if you want the exact preview look, move that
   `<style>...</style>` into the page too (paste it at the very top of the Code content). If you'd
   rather inherit the theme, leave the styles out and the structure still works.
4. Set the page title to something like **"Solo Cruising"** and publish.

> Note: the leading HTML comment in the file is repo/preview metadata — don't paste it into WP.

---

## Styling

Preview design tokens are matched to the **live maulsbytravel.com theme (OA-Agent-Theme)**,
pulled from the site's actual CSS/font links — not guessed:
- Headings: **Acme** (the theme's display font), fallback Montserrat
- Body: **Lato / Open Sans**
- Primary: steel-blue **#315b7c**; teal accent **#00a99d**; body grey **#2d2d2d**

So the preview already reads in Tina's brand language. On WordPress publish (Option B), you can
still drop my `<style>` block and inherit the theme directly — the result will be near-identical.

---

## Status
- [x] Page built and previewable
- [ ] Tina reviews + supplies photos / confirms numbers
- [ ] Choose Option A or B and publish in WordPress
