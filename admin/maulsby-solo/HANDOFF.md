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

### Ready-to-paste schema (JSON-LD)

Also saved as its own file in this folder: **`solo-cruising-schema.html`** (easiest to copy).

**Steps:**
1. Publish the Solo Cruising page first so you know its final URL/slug.
2. **This is a Multisite, so a `<script>` pasted into a Custom HTML block gets stripped on
   save** (unless you're a Super Admin). Use your **SEO plugin** instead: in RankMath/Yoast,
   open the page's schema settings and either build the **FAQ** + **Service** schema with the
   generator, or paste the JSON-LD below into the plugin's "custom schema / code" field
   (plugin fields bypass the content filter). A Super Admin, or a head-snippet plugin, can
   add the raw block instead.
3. **If your slug is not `/solo-cruising/`**, find-and-replace every
   `https://maulsbytravel.com/solo-cruising/` in the block with your real page URL before saving.
4. Validate at **search.google.com/test/rich-results** (paste the live URL). You should see
   *FAQ*, *Service*, *Person*, and *Breadcrumb* detected.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TravelAgency",
      "@id": "https://maulsbytravel.com/#agency",
      "name": "Maulsby Travel Co.",
      "url": "https://maulsbytravel.com/",
      "telephone": "+1-910-528-5077",
      "email": "tina@maulsbytravel.com",
      "areaServed": "US",
      "knowsAbout": ["Solo cruising", "Cruise planning", "Hosted group cruises", "Single supplement"],
      "founder": {"@id": "https://maulsbytravel.com/#tina"}
    },
    {
      "@type": "Person",
      "@id": "https://maulsbytravel.com/#tina",
      "name": "Tina Maulsby",
      "jobTitle": "Solo Cruise Specialist",
      "worksFor": {"@id": "https://maulsbytravel.com/#agency"},
      "knowsAbout": ["Solo cruising", "Cruise planning", "Norwegian Cruise Line", "Single supplement", "Hosted group cruises"],
      "sameAs": [
        "https://www.facebook.com/groups/1739046412949279",
        "https://www.facebook.com/profile.php?id=61582622205785",
        "https://www.instagram.com/maulsbytravel",
        "https://www.tiktok.com/@beyondboundarieswithtina"
      ]
    },
    {
      "@type": "Service",
      "@id": "https://maulsbytravel.com/solo-cruising/#service",
      "name": "Solo Cruise Planning",
      "serviceType": "Solo and hosted group cruise booking",
      "provider": {"@id": "https://maulsbytravel.com/#agency"},
      "areaServed": "US",
      "description": "Personalized planning for solo cruises and hosted group sailings, including cabin and single-supplement guidance, with a dedicated Solo Cruise Specialist."
    },
    {
      "@type": "WebPage",
      "@id": "https://maulsbytravel.com/solo-cruising/#webpage",
      "url": "https://maulsbytravel.com/solo-cruising/",
      "name": "Solo Cruising with Tina | Travel Solo, Never Alone — Maulsby Travel Co.",
      "description": "Tina Maulsby is a Solo Cruise Specialist with Maulsby Travel Co. who plans solo cruises and hosted group sailings for people traveling on their own, and founded a 55,000-member solo cruisers community.",
      "datePublished": "2026-06-15",
      "dateModified": "2026-06-15",
      "about": {"@id": "https://maulsbytravel.com/solo-cruising/#service"},
      "breadcrumb": {"@id": "https://maulsbytravel.com/solo-cruising/#breadcrumb"}
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://maulsbytravel.com/solo-cruising/#breadcrumb",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://maulsbytravel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Solo Cruising", "item": "https://maulsbytravel.com/solo-cruising/"}
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://maulsbytravel.com/solo-cruising/#faq",
      "mainEntity": [
        {"@type": "Question", "name": "Will I actually be alone on the ship?", "acceptedAnswer": {"@type": "Answer", "text": "Only as alone as you want to be. You get your own cabin and the freedom to do your own thing, but with hosted sailings and the community there are friendly faces for dinner, shore days, or a drink whenever you'd like company."}},
        {"@type": "Question", "name": "Do I have to be single to travel solo?", "acceptedAnswer": {"@type": "Answer", "text": "No. Solo isn't single. Plenty of solo cruisers are married; they just love traveling on their own terms. This is a solo community, not a dating or singles group."}},
        {"@type": "Question", "name": "Won't sailing alone cost double because of the single supplement?", "acceptedAnswer": {"@type": "Answer", "text": "Not always. The single supplement varies a lot by cruise line and sailing. A specialist finds the lines, ships, and dates that treat solo travelers fairly, including dedicated solo cabins where they exist."}},
        {"@type": "Question", "name": "Is solo cruising safe?", "acceptedAnswer": {"@type": "Answer", "text": "Cruising is one of the most comfortable ways to travel on your own: a secure ship, staff who know you, and a built-in community if you want it."}},
        {"@type": "Question", "name": "Does booking with a travel agent cost more than booking direct?", "acceptedAnswer": {"@type": "Answer", "text": "No. You get a specialist and a real person to call at no extra cost over booking the cruise yourself."}},
        {"@type": "Question", "name": "What if it's my first solo trip?", "acceptedAnswer": {"@type": "Answer", "text": "First-timers are welcome. A specialist helps you pick a first sailing that's easy to love, with both the agent and the community supporting you the whole way."}}
      ]
    }
  ]
}
</script>
```

---

## How to publish in WordPress (verified for this Multisite)

**Important:** maulsbytravel.com is a WordPress **Multisite**. On Multisite, site
administrators do **not** have the `unfiltered_html` capability — only Super Admins do.
That means WordPress **strips `<style>` and `<script>` tags out of page content** when a
normal admin saves. So you cannot just paste one big HTML file into the page. Instead the
page is split into three paste-safe deliverables, each going to the right place:

| Deliverable | Where it goes in WordPress | Notes |
|---|---|---|
| **`solo-cruising-body.html`** | The page itself — Classic editor **Text** tab, or a **Custom HTML** block | Uses only tags/attributes WordPress keeps (verified against WP 6.8 core). Keep the `<div id="mt-solo">` wrapper — it's what the CSS targets. |
| **`solo-cruising.css`** | **Appearance → Customize → Additional CSS** | A theme setting, so it is NOT stripped. Every rule is scoped to `#mt-solo`, so it only affects this page — it will not touch the rest of the site. |
| **`solo-cruising.js`** | Nothing to do | The page uses **no JavaScript** (FAQ is native `<details>`). |

**Steps:**
1. **Add the CSS first:** Appearance → Customize → Additional CSS → paste all of
   `solo-cruising.css` → Publish.
2. **Create the page:** Pages → Add New. Title it **Solo Cruising** (slug `solo-cruising`).
3. **Add the content:** switch the editor to the **Text** tab (or add a **Custom HTML**
   block) and paste all of `solo-cruising-body.html` (including the `<div id="mt-solo">`
   wrapper). Publish.
4. **Check it:** the page should now look like the preview. If it looks unstyled, the CSS
   step (1) didn't save or the wrapper div was removed.

**Schema (JSON-LD):** because `<script>` is also stripped from content on Multisite, do
**not** rely on pasting `solo-cruising-schema.html` into a Custom HTML block — a normal admin
save will strip it. Use one of these instead:
- **RankMath/Yoast** (whichever is installed): build the **FAQ** and **Service** schema with
  the plugin's schema generator, or paste the JSON-LD into the plugin's "custom schema" field
  (plugin fields bypass the content filter), **or**
- Ask a **Super Admin** to add the `solo-cruising-schema.html` block, **or**
- Use a code-snippets plugin that injects into `<head>`.

> Beaver Builder note: if you build the page in the Page Builder instead, use an **HTML
> module** for the body and the **Customizer → Code** area (or Additional CSS) for the styles.
> The same Multisite stripping applies to the HTML module for non-Super-Admins, so the
> CSS-in-Additional-CSS split above is still the reliable path.

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

All CSS is **scoped to `#mt-solo`** so it is safe to drop into site-wide Additional CSS
without affecting other pages.

---

## Status
- [x] Page built and previewable
- [x] Split into paste-safe deliverables (body / CSS / JS) for this Multisite
- [ ] Tina reviews + supplies photos / confirms numbers
- [ ] Publish: Additional CSS + page content + schema via SEO plugin
