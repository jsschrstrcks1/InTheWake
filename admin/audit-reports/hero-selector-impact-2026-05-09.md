# Hero-Selector Impact Audit (BeautifulSoup cross-check)

Selectors audited (from `assets/styles.css:2453–2461`):

  - `.hero-header img`
  - `.hero-ship img`
  - `.hero img`
  - `[class*="hero"] img`

| Page | Total imgs hit | Selectors that hit each |
|---|---:|---|
| `index.html` | 3 | `.hero img`, `.hero-header img`, `[class*="hero"] img` |
| `ships/carnival/carnival-celebration.html` | 1 | `.hero-header img`, `[class*="hero"] img` |
| `ports/abu-dhabi.html` | 2 | `.hero-header img`, `[class*="hero"] img` |
| `articles/cruise-tipping-2026.html` | 3 | `.hero img`, `.hero-header img`, `[class*="hero"] img` |
| `drink-calculator.html` | 3 | `.hero img`, `.hero-header img`, `[class*="hero"] img` |
| `restaurants/150-central-park.html` | 3 | `.hero img`, `.hero-header img`, `[class*="hero"] img` |
| `tools/cruise-budget-calculator.html` | 3 | `.hero img`, `.hero-header img`, `[class*="hero"] img` |
| `tools/port-day-planner.html` | 3 | `.hero img`, `.hero-header img`, `[class*="hero"] img` |

**Grand total imgs affected across sample:** 21


## Per-page detail


### `index.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.navbar > div.brand
- **src:** `/assets/compass_rose.svg?v=3.010.400`  
  **img class:** `hero-compass`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** html > body.page > header.hero-header > div.hero
- **src:** `/assets/logo_wake_560.png`  
  **img class:** `logo`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.hero > div.hero-title

### `ships/carnival/carnival-celebration.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.navbar > a.brand

### `ports/abu-dhabi.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.navbar > div.brand
- **src:** `/ports/img/abu-dhabi/abu-dhabi-hero.webp`  
  **img class:** `—`  
  **matched by:** `[class*="hero"] img`  
  **ancestry:** div > article.card > section.port-hero > div.port-hero-image

### `articles/cruise-tipping-2026.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.navbar > div.brand
- **src:** `/assets/compass_rose.svg?v=3.010.400`  
  **img class:** `hero-compass`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** html.no-js > body.page > header.hero-header > div.hero
- **src:** `/assets/logo_wake_560.png`  
  **img class:** `logo`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.hero > div.hero-title

### `drink-calculator.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.navbar > div.brand
- **src:** `/assets/compass_rose.svg?v=3.010.300`  
  **img class:** `hero-compass`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** html.no-js > body.page > header.hero-header > div.hero
- **src:** `/assets/logo_wake_560.png`  
  **img class:** `logo`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.hero-header > div.hero > div.hero-title

### `restaurants/150-central-park.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.venue-page > header.hero-header > div.navbar > div.brand
- **src:** `/assets/compass_rose.svg?v=3.010.300`  
  **img class:** `hero-compass`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** html.no-js > body.venue-page > header.hero-header > div.hero
- **src:** `/assets/logo_wake_560.png`  
  **img class:** `logo`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** body.venue-page > header.hero-header > div.hero > div.hero-title

### `tools/cruise-budget-calculator.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.site-header.hero-header > div.navbar > div.brand
- **src:** `/assets/compass_rose.svg?v=3.010.300`  
  **img class:** `hero-compass`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** html.no-js > body.page > header.site-header.hero-header > div.hero
- **src:** `/assets/logo_wake_560.png`  
  **img class:** `logo`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.site-header.hero-header > div.hero > div.hero-title

### `tools/port-day-planner.html`

- **src:** `/assets/logo_wake_256.png`  
  **img class:** `—`  
  **matched by:** `.hero-header img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.site-header.hero-header > div.navbar > div.brand
- **src:** `/assets/compass_rose.svg?v=3.010.300`  
  **img class:** `hero-compass`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** html.no-js > body.page > header.site-header.hero-header > div.hero
- **src:** `/assets/logo_wake_560.png`  
  **img class:** `logo`  
  **matched by:** `.hero-header img`, `.hero img`, `[class*="hero"] img`  
  **ancestry:** body.page > header.site-header.hero-header > div.hero > div.hero-title
