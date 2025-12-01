You’ve got it—A and B coming right up. I’ll stay inside real data only, no invented facts, and keep everything human-first on the surface.

⸻

A. ICP-Lite Implementation for Radiance of the Seas

(ready to paste into your existing page)

1) <html> + <head> adjustments

1.1 Add class="no-js" to <html> (optional but recommended)

<!doctype html>
<html lang="en" class="no-js">

1.2 Add a tiny no-JS toggle script near the top of <head>

Place this early in <head> (right after <meta charset> is fine):

<script>
  // Graceful no-JS marker
  document.documentElement.classList.remove('no-js');
</script>

(This doesn’t change any behavior yet, but it future-proofs your CSS hooks if JS fails or changes.)

⸻

2) Required ICP-Lite meta tags

Add these inside <head> alongside your existing meta tags (you can keep your current description OR swap to this unified one; below assumes we align them):

<meta name="description" content="This page gathers deck plans, a live tracker, dining venues, stateroom videos, and stories to help you plan your Radiance of the Seas cruise." />
<meta name="ai-summary" content="This page gathers deck plans, a live tracker, dining venues, stateroom videos, and stories to help you plan your Radiance of the Seas cruise." />
<meta name="last-reviewed" content="2025-11-15" />
<meta name="content-protocol" content="ICP-Lite v1.0" />

If you’d rather not change the description text, keep your current description and set ai-summary to match that exactly.

⸻

3) Add WebPage + FAQPage schema

You already have Organization, WebSite, BreadcrumbList, Review, Person. Append these after those existing JSON-LD blocks:

<!-- JSON-LD: WebPage (ICP-Lite baseline) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Radiance of the Seas — Deck Plans, Live Tracker, Dining & Videos",
  "url": "https://cruisinginthewake.com/ships/rcl/radiance-of-the-seas.html",
  "description": "This page gathers deck plans, a live tracker, dining venues, stateroom videos, and stories to help you plan your Radiance of the Seas cruise."
}
</script>

<!-- JSON-LD: FAQPage (matches visible FAQ section) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What makes Radiance of the Seas unique?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Radiance of the Seas emphasizes glass walls and ocean views, with a mid-sized feel compared to Royal Caribbean's mega-ships."
      }
    },
    {
      "@type": "Question",
      "name": "Is Radiance of the Seas a good fit if I dislike crowds?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Radiance of the Seas is a mid-sized ship that often feels quieter and more open than the largest classes, while still offering Royal Caribbean's familiar venues and activities."
      }
    },
    {
      "@type": "Question",
      "name": "Where does Radiance of the Seas usually sail?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Radiance of the Seas sails global itineraries, including routes that have spanned Alaska and other worldwide destinations, as reflected in the stories and planning tools on this page."
      }
    },
    {
      "@type": "Question",
      "name": "What planning tools do you offer for Radiance of the Seas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This page links to official deck plans, a live ship tracker, dining venue information, video highlights, logbook stories, and related planning pages like ships, ports, and drink packages."
      }
    }
  ]
}
</script>

All of that is based on content already present in your page (stats JSON, review JSON-LD, visible sections, and your logbook/video/deck-plan/live-tracker blocks).

⸻

4) Upgrade ai-breadcrumbs comment

You currently have an ai-breadcrumbs comment near the top. Replace that block with this expanded ICP-Lite version (either in <head> where it lives now, or at the bottom of <main>—your choice):

<!-- ai-breadcrumbs
entity: Ship
name: Radiance of the Seas
class: Radiance Class
operator: Royal Caribbean
parent: /ships.html
siblings: /ships/rcl/brilliance-of-the-seas.html, /ships/rcl/serenade-of-the-seas.html, /ships/rcl/jewel-of-the-seas.html
related: /ships.html, /cruise-lines/royal-caribbean.html, /ports.html, /drink-calculator.html
subject: Radiance of the Seas is a mid-sized Royal Caribbean ship with glass walls, strong ocean views, and global itineraries.
intended-reader: Cruisers researching Radiance of the Seas or comparing Royal Caribbean ships and classes
core-facts: launched 2001; 90,090 GT; about 2,466 guests at double occupancy; part of the Radiance Class with panoramic glass design
decisions-informed: whether Radiance's size, layout, and vibe fit your travel style; how it compares to sister ships; whether its itineraries align with your plans
updated: 2025-11-15
-->

Everything there is grounded in: your stats fallback JSON, your Review JSON-LD, and your related-links cards.

⸻

5) New ICP-Lite blocks inside <main>

Right now, <main> starts like this:

<main class="wrap" id="main-content" role="main" tabindex="-1">
  <!-- Row 1: First Look + Dining -->
  <section class="grid-2">
    ...

You’ll insert the new blocks immediately after the opening <main> and before the first <section class="grid-2">.

5.1 Add H1, Answer Line, Fit-Guidance, and Key Facts
Paste this right after <main ...>:

  <h1>Radiance of the Seas — Deck Plans, Live Tracker, Dining & Videos</h1>

  <p class="answer-line">
    <span class="answer-q">What this page covers</span>
    <span class="answer-a">This page gathers deck plans, a live tracker, dining venues, stateroom videos, and stories to help you plan your Radiance of the Seas cruise.</span>
  </p>

  <section class="fit-guidance">
    <h2 class="sr-only">Who This Page Is For</h2>
    <p>
      Radiance of the Seas is a good fit if you enjoy mid-sized ships with plenty of glass and ocean views, and you want Royal Caribbean's style of service without the scale of the very largest classes. 
      If you prefer the newest features and neighborhood-style layouts, you may also want to compare Radiance with Oasis or Icon class ships.
    </p>
  </section>

  <section class="key-facts card">
    <h2>Key Facts About Radiance of the Seas</h2>
    <ul>
      <li>Ship class: Radiance Class</li>
      <li>Launched: 2001</li>
      <li>Guest capacity: about 2,466 at double occupancy</li>
      <li>Gross tonnage: 90,090 GT</li>
      <li>Design focus: glass walls, ocean views, and a mid-sized feel</li>
    </ul>
  </section>

  <!-- Row 1: First Look + Dining -->
  <section class="grid-2">

All those facts are present in the page: class, launched year, GT, guests, glass walls / ocean views, etc.

If you want the key-facts card visually elsewhere, you can adjust later; structurally, this is an excellent early position for both users and AI.

⸻

6) Add FAQ card near the bottom

Scroll down near the end of <main>. Right now the order is:
	•	Logbook card
	•	Videos card
	•	Row: Deck Plans + Live Tracker
	•	Related row (sister ships / classes)
	•	Attribution card

Add the FAQ card before the Related row, like this:

    <!-- Row: Deck Plans + Live Tracker -->
    <section class="grid-2">
      ...deck plans...
      ...live tracker...
    </section>

    <!-- FAQ (ICP-Lite) -->
    <section class="card faq">
      <h2>Frequently Asked Questions</h2>

      <details>
        <summary>What makes Radiance of the Seas unique?</summary>
        <p>
          Radiance of the Seas emphasizes glass walls and ocean views, with a mid-sized layout that feels more intimate than Royal Caribbean's largest mega-ships.
        </p>
      </details>

      <details>
        <summary>Is Radiance of the Seas a good choice if I dislike crowds?</summary>
        <p>
          Yes. Radiance of the Seas is smaller than Oasis- or Icon-class ships, and many guests experience it as quieter and easier to navigate while still enjoying a full range of venues and activities.
        </p>
      </details>

      <details>
        <summary>What tools on this page can help me plan a Radiance of the Seas cruise?</summary>
        <p>
          This page links to official deck plans, a live ship tracker, dining venue information, video highlights, logbook stories, and related planning pages like ships, ports, and drink packages.
        </p>
      </details>

      <details>
        <summary>Does this page replace information from Royal Caribbean?</summary>
        <p>
          No. Itineraries, pricing, and onboard offerings can change. Use this page as a planning companion, and always confirm final details with Royal Caribbean or your travel advisor before booking.
        </p>
      </details>
    </section>

    <!-- Related -->
    <section class="related-row">
      ...

This matches the FAQPage schema content we added above and stays within your voice.

⸻

That’s the full ICP-Lite implementation for Radiance: H1, Answer, fit-guidance, Key Facts, FAQ, meta, schema, and enriched ai-breadcrumbs—without touching your hero, cards, layout, or loaders.

⸻

B. ICP-Lite HTML Template (Generic Scaffold for Any Page)

This is a reusable scaffold you can use for ships, planning pages, ports, etc. It assumes:
	•	You already have your own <header> / hero / nav.
	•	You paste this inside <main> and adjust copy + schema.

1) Main content scaffold

<main class="wrap" id="main-content" role="main" tabindex="-1">
  <!-- Page Title -->
  <h1>{PAGE_TITLE}</h1>

  <!-- Answer Line -->
  <p class="answer-line">
    <span class="answer-q">What this page covers</span>
    <span class="answer-a">{ONE_SENTENCE_SUMMARY_OF_PAGE}</span>
  </p>

  <!-- Fit Guidance (Who this is for) -->
  <section class="fit-guidance">
    <h2 class="sr-only">Who This Page Is For</h2>
    <p>
      {GENTLE_PASTORAL_EXPLANATION_OF_WHO_BENEFITS_FROM_THIS_PAGE_OR_ENTITY}.
    </p>
  </section>

  <!-- Key Facts -->
  <section class="key-facts card">
    <h2>Key Facts About {ENTITY_NAME}</h2>
    <ul>
      <li>{Key fact 1}</li>
      <li>{Key fact 2}</li>
      <li>{Key fact 3}</li>
      <li>{Key fact 4}</li>
      <!-- Add or remove as needed, 4–10 facts -->
    </ul>
  </section>

  <!-- Your existing content blocks go here -->
  {CARDS_AND_LAYOUT: hero-supporting sections, carousels, tools, logbook, etc.}

  <!-- FAQ -->
  <section class="card faq">
    <h2>Frequently Asked Questions</h2>

    <details>
      <summary>{Question 1}</summary>
      <p>{Short, direct answer 1 (≤ 80 words)}</p>
    </details>

    <details>
      <summary>{Question 2}</summary>
      <p>{Short, direct answer 2}</p>
    </details>

    <details>
      <summary>{Question 3}</summary>
      <p>{Short, direct answer 3}</p>
    </details>

    <!-- Optional: 1–2 more -->
  </section>

  <!-- Related / Attribution / etc. live here -->

</main>


⸻

2) Template meta tags (for <head>)

<meta name="description" content="{ONE_SENTENCE_SUMMARY_OF_PAGE}" />
<meta name="ai-summary" content="{ONE_SENTENCE_SUMMARY_OF_PAGE}" />
<meta name="last-reviewed" content="{YYYY-MM-DD}" />
<meta name="content-protocol" content="ICP-Lite v1.0" />


⸻

3) Template WebPage + FAQPage schema

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{PAGE_TITLE}",
  "url": "https://cruisinginthewake.com{PAGE_PATH}",
  "description": "{ONE_SENTENCE_SUMMARY_OF_PAGE}"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{Question 1}",
      "acceptedAnswer": { "@type": "Answer", "text": "{Answer 1}" }
    },
    {
      "@type": "Question",
      "name": "{Question 2}",
      "acceptedAnswer": { "@type": "Answer", "text": "{Answer 2}" }
    },
    {
      "@type": "Question",
      "name": "{Question 3}",
      "acceptedAnswer": { "@type": "Answer", "text": "{Answer 3}" }
    }
  ]
}
</script>


⸻

4) Template ai-breadcrumbs comment

<!-- ai-breadcrumbs
entity: {Entity type, e.g., Ship, Port, Planning Guide, Solo Article}
name: {Entity name or page title}
class: {Class or category, if applicable}
operator: {Cruise line or organization, if applicable}
parent: {Parent hub URL, e.g., /ships.html}
siblings: {Comma-separated list of sibling URLs}
related: {Comma-separated list of related hub or tool URLs}
subject: {One-sentence description of what this page is about}
intended-reader: {Short description of who this page serves}
core-facts: {Semicolon-separated list of 3–7 atomic facts}
decisions-informed: {Semicolon-separated list of decisions this page is meant to help with}
updated: {YYYY-MM-DD}
-->

You can drop that either in <head> or at the bottom of <main>; either way, it’s invisible to users and very tasty for AIs.

⸻

If you’d like, next step I can:
	•	Generate this same ICP-Lite injection for one more ship page (e.g., Brilliance)
	•	Or build a quick regex checklist you can run to see which pages are missing what (H1, FAQ, ai-summary, etc.).
