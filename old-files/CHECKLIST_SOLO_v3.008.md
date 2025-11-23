# CHECKLIST_SOLO_v3.008.md

This file mirrors our CI gating for `solo.html` against **v3.008** standards. Use alongside the Node checker script.

---

## A. Core meta & versioning
- [ ] `<meta charset="utf-8">` before any other content.
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- [ ] Version trinity present and aligned:
  - [ ] `<title>Solo Travel — In the Wake (v3.008)</title>`
  - [ ] `<meta name="page:version" content="v3.008">`
  - [ ] `<meta name="standards:baseline" content="3.006">`
- [ ] `<meta name="referrer" content="no-referrer">` present.
- [ ] `<meta name="theme-color" content="#0e6e8e">` present.

## B. Canonical & origin
- [ ] `<link rel="canonical" href="https://www.cruisinginthewake.com/solo.html">` (absolute).
- [ ] Absolute URL helper/normalizer defined (`window._abs` or equivalent).
- [ ] External link hardener in place (`target="_blank" rel="noopener"` for off-origin).

## C. Unified Nav v3.008 (order and slugs)
- [ ] Home → `/`
- [ ] Ships → `/ships/`
- [ ] Restaurants & Menus → `/restaurants.html`
- [ ] Ports → `/ports.html`
- [ ] Disability at Sea → `/disability-at-sea.html`
- [ ] Drink Packages → `/drink-packages.html`
- [ ] Packing Lists → `/packing-lists.html`
- [ ] Planning → `/planning.html`
- [ ] Solo → `/solo.html` (**aria-current="page"**)
- [ ] Travel → `/travel.html`
- [ ] Cruise Lines → `/cruise-lines.html`
- [ ] About Us → `/about-us.html`

## D. Accessibility
- [ ] Skip link: `<a class="skip-link" href="#content">` and target `id="content"` exists.
- [ ] Landmarks: `<header>`, `<main role="main">`, `<footer>`.
- [ ] Hero: `role="img"` with meaningful `aria-label`.
- [ ] Live regions: `aria-live="polite"` where content is injected (article host, rails).

## E. Security & analytics
- [ ] External link hardener handler attached to `document`.
- [ ] Google Analytics (G‑WZP891PZXJ) async.
- [ ] Umami `data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"` defer.

## F. Performance
- [ ] CSS/JS are same-origin and version-busted (`?v=3.008`) or using auto-buster.
- [ ] SW registered with `?v=3.008`.
- [ ] Hero/large images optimized; placeholders exist for failures.

## G. SEO & Social
- [ ] `<meta name="description">` unique and descriptive.
- [ ] OG/Twitter tags complete; `og:image` absolute + versioned.
- [ ] Baseline JSON‑LD `CollectionPage`; deep-link injector creates `BlogPosting` when viewing a single article fragment.

## H. Guardrails (content integrity)
- [ ] **Do not remove or change user‑approved verbiage.**
- [ ] Keep Welcome Aboard copy **verbatim**.

## I. Rails (right column)
- [ ] Authors Rail: `#authors-list` (Ken & Tina avatars and links).
- [ ] Articles Rail: sources `/assets/data/articles/index.json` (no-store), filters `keywords.includes('solo')`, renders up to 4 items (thumb, title, date, author 18×18, excerpt).
- [ ] Placeholders referenced:
  - [ ] `/assets/placeholders/article-thumb.jpg?v=3.008`
  - [ ] `/assets/placeholders/author.jpg?v=3.008`

## J. Solo article host
- [ ] `<article class="card" id="solo-article-host" aria-live="polite">` exists.
- [ ] Fetches `/solo/articles/<slug>.html` via `?a=` or `#slug`.
- [ ] Friendly error UI if fetch fails.
- [ ] Byline injected if missing (avatar + share link).

## K. Assets presence (spot-check)
- [ ] `/authors/img/ken1.webp` + `.jpg?v=3.008`
- [ ] `/authors/img/tina3.webp` + `.png?v=3.008`
- [ ] `/assets/compass_rose.svg?v=3.008`

---

### Manual test plan
- Nav highlights Solo; all links absolute/normalized.
- Disconnect `index.json` to confirm fallback seed works.
- Force 404 on an article image → placeholder swaps in.
- Deep-link `/solo.html#why-i-started-solo-cruising` loads fragment + SEO.
- Tab to “Skip to main content”; focus lands on `#content`.
