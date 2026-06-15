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

## SEO / AEO (ICP-2 v2.1 — verified against June 2026 best practices)

The preview is built answer-engine-ready: it's the most-cited structure for AI search
(FAQPage schema is the single highest-leverage element per current research).

**Built into the page:**
- `<title>`, meta `description`, `ai-summary`, `last-reviewed`, canonical
- Open Graph + Twitter card tags
- JSON-LD `@graph`: TravelAgency + Person (Tina, with real `sameAs` socials) + Service +
  WebPage + BreadcrumbList + **FAQPage** (6 genuine Q&As)
- Answer-first copy, semantic `<main>`/`<section>`/`<article>` structure, flat HTML (no
  JS-hidden content), 7 internal links, "as of June 2026" date on the ranking claims

**IMPORTANT — the `<head>` does NOT transfer when you paste the body into WordPress.**
WordPress + your SEO plugin control the head. So when you publish, set these in the page's
SEO plugin (Yoast or RankMath) and/or a schema block:

| Field | Value to use |
|---|---|
| Slug | `solo-cruising` (or your choice — then fix the canonical/OG URLs to match) |
| SEO title | Solo Cruising with Tina \| Travel Solo, Never Alone — Maulsby Travel Co. |
| Meta description | the `description` value from the file |
| Canonical | the page's real URL once published |
| OG image | upload a real photo; set its URL (placeholder is in the file) |
| Schema | paste the JSON-LD `<script>` block into a **Custom HTML block**, OR recreate FAQ + Service via the plugin's schema feature |

**Site-level (one-time, not this page) for AI citation eligibility:**
- `robots.txt` should allow GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- Real image `alt` text on the photos you add (describe what's in them factually)
- Link to this page from Home/About/Blog so it ranks organically (AI Overviews pull ~76%
  from page-one organic results)
- `llms.txt` is optional/low-value in 2026 — skip unless you want a low-cost experiment

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

Matched to the **live rendered maulsbytravel.com** (theme: OA-Agent-Theme), pulled from the
actual theme stylesheet (`assets/css/theme.css`) — not the admin UI, not guessed:
- **Aesthetic:** light, airy, flat — white / #fafafa sections, thin grey borders, minimal shadow
- **Headings:** Raleway · **Body:** Open Sans
- **Brand colors (the logo's):** navy **#145072** + orange **#f06023**, with sky-blue
  **#5aa1e3** rectangular (4px) buttons — same shape/color as the live "Book Travel Now" /
  "MORE CRUISES" buttons
- Footer is a light grey band, matching the live homepage footer

On WordPress publish (Option B) you can still drop my `<style>` block and inherit the theme
directly — the result will be near-identical since these are the theme's own tokens.

---

## Status
- [x] Page built and previewable
- [ ] Tina reviews + supplies photos / confirms numbers
- [ ] Choose Option A or B and publish in WordPress
