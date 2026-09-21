---
name: analytics-tracking
description: "Guides GA4 setup, conversion tracking, and UTM parameters for cruisinginthewake.com. Focuses on key metrics that matter for a cruise planning site."
version: 1.0.0
---

# Analytics Tracking — InTheWake

> Measure what matters. Ignore the rest.

## When to Fire

- On `/analytics` command
- When adding new pages or tools
- When discussing traffic, conversions, or user behavior

## GA4 Setup

### Key Events to Track

| Event | What it measures | Where |
|-------|-----------------|-------|
| `page_view` | Which pages get traffic | All pages |
| `tool_start` | User opens a calculator/tool | 9 interactive tools |
| `tool_complete` | User finishes a calculation | Drink calc, budget calc |
| `quiz_complete` | User finishes a quiz | Ship quiz, cruise line quiz |
| `port_view` | Port guide viewed | 388 port pages |
| `ship_view` | Ship profile viewed | 298 ship pages |
| `outbound_click` | Clicks to cruise line booking sites | Affiliate links |
| `offline_page` | PWA served offline content | Service worker |
| `scroll_depth` | How far users read | Articles, port guides |

### UTM Parameters

For church/social media promotion:
```
?utm_source=facebook&utm_medium=social&utm_campaign=port-guide&utm_content=nassau
```

Standard structure:
- `utm_source`: facebook, google, direct, email
- `utm_medium`: social, organic, referral, email
- `utm_campaign`: descriptive name
- `utm_content`: specific page or variant

### What NOT to Track

- Personal information (no user IDs, no login tracking)
- Individual user journeys (aggregate only)
- Anything requiring cookie consent banners (keep it simple)

## GA4 Code

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Place in `<head>` of every page. Replace `G-XXXXXXXXXX` with your Measurement ID from GA4.

### Custom Events

```javascript
// Tool usage
gtag('event', 'tool_start', { tool_name: 'drink-calculator' });
gtag('event', 'tool_complete', { tool_name: 'drink-calculator', result: 'worth-it' });

// Outbound clicks
gtag('event', 'outbound_click', { destination: 'royalcaribbean.com' });
```

## Voyage-pack usage events (fixed vocabulary — reuse, never invent)

Plan and rationale: `docs/superpowers/plans/2026-09-05-voyage-pack-usage-tracking.md`. Names are `vp_*`, at most 50 characters. Properties are a closed whitelist enforced twice (client module `assets/js/voyage-usage.js`, then the relay `admin/voyage-usage-relay/worker.js`); anything else is dropped.

| Event | Fires when | Properties |
|---|---|---|
| `vp_tip_click` | the tip-jar link on a `/voyage-packs.html` card (replaced `vp_buy_click` when the packs went free on 2026-09-05; `price` is no longer emitted by any surface) | `pack` |
| `vp_pdf_open` | a link to one of our PDFs is followed, including the free download link on each landing card | `pack`, `variant` (`full` / `condensed` / `handoff`) |
| `vp_print` | a `data-print-scope` button | `pack`, `scope` |
| `vp_pdf_download` | a `data-pdf-scope` button produced a PDF | `pack`, `scope` |
| `vp_handoff_filled` | first time on a device that a handoff field is non-empty | `pack` |
| `vp_pwa_open` | companion shell built | `pack`, `standalone`, `offline`, `phase` (`before` / `during` / `after`), `day` |
| `vp_pwa_session` | a companion sitting ends | `pack`, `phase`, `day`, `tabs` (sorted, comma-joined) |
| `vp_pwa_install` | `appinstalled` | `pack` |

Never sent: handoff-card contents, chosen location, unit preference, any identifier. The relay adds `country` / `region` from Cloudflare's request metadata (Setting 1.5) and never a city. The dashboard is owner-only on Atlas (`/admin/voyage-usage`); no usage data is committed to this repo.

## Integration

- **content-freshness** — correlate stale pages with traffic drops
- **seasonal-content-planner** — seasonal traffic patterns inform content priorities
- **deployment-validator** — verify analytics code is present on all pages

---

*Soli Deo Gloria*
