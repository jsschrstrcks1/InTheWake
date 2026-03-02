# Technical Standards — In the Wake

**Version:** 1.0.0
**Last Updated:** 2026-03-02
**Purpose:** Performance, accessibility, and SEO implementation patterns. Extracted from CLAUDE.md to keep the main file lean.

---

## Analytics (REQUIRED on Every Page)

**CRITICAL:** Every HTML page MUST include both analytics scripts in the `<head>`:

```html
<!-- Google Analytics (with IP anonymization for GDPR) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WZP891PZXJ"></script>
<script>
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  gtag('js',new Date());
  gtag('config','G-WZP891PZXJ',{anonymize_ip:true});
</script>

<!-- Umami (secondary analytics - privacy-focused) -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="9661a449-3ba9-49ea-88e8-4493363578d2"></script>
```

**Why Both?**
- **Google Analytics:** Industry standard, detailed insights, conversion tracking
- **Umami:** Privacy-first backup, cookie-free, GDPR-compliant by design

**Note:** The footer trust badge says "Minimal analytics" — this accurately reflects our use of analytics while maintaining user trust.

---

## Performance Optimization

### Service Worker (v14.2.0)

- Cache-first strategy for images
- Network-first for HTML/JSON
- Current limits:
  - `maxPages: 400` (site has 1,241 HTML pages)
  - `maxAssets: 150`
  - `maxImages: 600` (currently 682 ship images, 4,475 WebP total)
  - `maxData: 100` (1,310 JSON files in assets/data/)

### Caching Strategy

```html
<!-- Include once in <head> -->
<script src="/assets/js/site-cache.js" defer></script>

<!-- Pre-warm cache near </body> -->
<script>
(function(){async function warm(){try{await Promise.all([
  SiteCache.getJSON('/assets/data/fleet_index.json',{ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/data/venues.json',     {ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/data/personas.json',   {ttlDays:7,versionPath:['version']}),
  SiteCache.getJSON('/assets/videos/rc_ship_videos.json', {ttlDays:7,versionPath:['version']})
]);}catch(e){}} if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',warm,{once:true});} else {warm();}})();
</script>

<!-- Service Worker registration -->
<script>
  if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});}
</script>
```

### Image Optimization

- **Format:** WebP (77% file size reduction vs JPEG)
- **Lazy loading:** `loading="lazy"` on non-hero images
- **LCP optimization:** `fetchpriority="high"` on hero images
- **Responsive:** Explicit `width/height` or `aspect-ratio` in CSS
- **Hero logo:** Responsive srcset format (see Performance Optimizations doc)
- **Do NOT optimize .png images** — those require transparencies

**Example hero image:**
```html
<img src="/assets/ships/radiance-of-the-seas.webp"
     alt="Radiance of the Seas cruise ship"
     loading="eager"
     fetchpriority="high"
     width="1200"
     height="675">
```

---

## Accessibility (WCAG 2.1 AA)

**Required Elements:**
- Skip-link: `<a href="#main" class="skip-link">Skip to main content</a>`
- Labeled inputs: `<label for="search">Search</label>`
- ARIA attributes: `aria-live="polite"` for dynamic content
- Alt text: All images must have descriptive `alt` attributes

**Progressive Enhancement:**
```html
<!-- Add to <html> tag -->
<html class="no-js" lang="en">

<!-- Remove no-js early -->
<script>document.documentElement.classList.remove('no-js');</script>

<!-- CSS fallbacks -->
<style>
.no-js .fallback { display: block; }
.no-js .js-only { display: none; }
</style>
```

**Full checklist:** `.claude/skills/standards/resources/wcag-aa-checklist.md`

---

## SEO & Structured Data

### Required Meta Tags

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="[Descriptive content]">
<meta name="version" content="v3.006.006">
<meta name="content-protocol" content="ICP-Lite v1.4">
<meta name="ai-summary" content="[AI-friendly summary]">
<meta name="last-reviewed" content="2025-11-23">
```

**ICP-Lite v1.4 dual-cap rule:** `ai-summary` max 250 chars total; first ~155 chars must be a complete standalone sentence. JSON-LD description must exactly match ai-summary.

**Full ICP-Lite spec:** `admin/claude/ITW-LITE_PROTOCOL.md`

### Structured Data (JSON-LD)

- BreadcrumbList schema on all pages
- Article schema on blog posts
- FAQPage schema when FAQ sections present
- Organization/Person schema for E-E-A-T
- Ship pages: 7 JSON-LD blocks required (see ship-page-validator)

### Open Graph & Twitter

```html
<meta property="og:title" content="[Page Title]">
<meta property="og:description" content="[Description]">
<meta property="og:image" content="https://cruisinginthewake.com/assets/ships/[ship].webp">
<meta property="og:url" content="https://cruisinginthewake.com/[path]">
<meta name="twitter:card" content="summary_large_image">
```

---

## CSS Version Query

**CRITICAL:** Stylesheet must use version query `?v=3.010.400`:
```html
<link rel="stylesheet" href="/assets/styles.css?v=3.010.400">
```

Note: Some pages currently use `?v=3.010.300` or `?v=3.010.305`. New pages should use `?v=3.010.400`.

---

## Security Requirements

### Forbidden Files (Never Commit to Production Branch)

- `.env`, `.env.*` — Environment variables
- `*.key`, `*.pem`, `*.pfx` — Private keys
- `*.sql`, `*.db` — Database files
- `*.bak`, `*.old`, `*.tmp` — Backup files
- `credentials.*`, `secrets.*` — Credential files

### JavaScript Security Rules

- ❌ NEVER use `innerHTML` with user input or URL parameters
- ❌ NEVER use `eval()` or `new Function()` with user data
- ❌ NEVER use `document.write()`
- ✅ ALWAYS use `textContent` for user-controlled strings
- ✅ ALWAYS validate/sanitize URL parameters before rendering
- ✅ ALWAYS escape HTML entities when displaying user input

**Safe Escaping Pattern:**
```javascript
// CORRECT: Escape user input before display
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// CORRECT: Use textContent for user input
element.textContent = userInput;

// WRONG: Never do this with user input
element.innerHTML = userInput;  // XSS vulnerability!
```

### Trust Claims

- Footer trust badge MUST match actual site behavior
- If analytics are used, Privacy Policy must disclose them
- Current accurate badge: "✓ No ads. Minimal analytics. Independent of cruise lines. Affiliate Disclosure"

### Protected by .htaccess

- Python files (`.py`, `.pyc`, `.pyo`) — blocked
- Markdown files (`.md`) — blocked
- Shell scripts (`.sh`) — blocked
- Backup files (`.bak`, `.tmp`, `.old`) — blocked
- `/admin/` directory — blocked (except `/admin/reports/*.html`)
- `/scripts/` directory — blocked entirely

---

*Soli Deo Gloria*
