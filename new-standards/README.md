# Site Standards — Regenerated from Validator Spec

**Generated from:** `admin/validator-spec/` (138 rules, spec version 0.18.0)
**Date:** 2026-04-16
**Replaces:** `new-standards/foundation/*` and `new-standards/v3.010/*` (archived to `admin/archive/standards-pre-2026-04-15/`)

---

## How to use this directory

The canonical source of truth for every rule is now `admin/validator-spec/rules/<ID>.md`. This directory provides **human-readable summaries organized by topic** — not a second source of truth.

If a rule here disagrees with the rule file in `admin/validator-spec/rules/`, the rule file wins. This directory is regenerated from the spec; the spec is the authority.

---

## Standards by topic

### Theological Foundation (immutable)
- **THEO-001** — Soli Deo Gloria invocation before line 20 on all HTML pages

### ICP-2 / Metadata Protocol
| Rule | Summary |
|---|---|
| ICP-001 | ai-summary meta tag present |
| ICP-002 | ai-summary dual-cap (250 total, 155 standalone) — RESOLVED: promote validator to full dual-cap |
| ICP-003 | ai-summary length 150-250 range recommended |
| ICP-004 | meta description tag present |
| ICP-005 | last-reviewed meta tag present |
| ICP-006 | last-reviewed YYYY-MM-DD format |
| ICP-007 | 180-day staleness warning |
| ICP-008 | Canonical URL link present |
| ICP-009 | meta keywords tag forbidden |
| ICP-010 | geo meta tags forbidden |
| ICP-011 | ai-breadcrumbs kept (standards win) — RESOLVED |
| ICP-012 | No duplicate ai-summary tags |
| ICP-013 | JSON-LD dateModified = last-reviewed (exact) |
| ICP-014 | JSON-LD description = ai-summary (exact match) — RESOLVED |
| ICP-015 | Answer-first first paragraph |
| ICP-016 | Canonical absolute https://cruisinginthewake.com |
| ICP-017 | content-protocol version accepted values |

### JSON-LD / Schema.org
| Rule | Summary |
|---|---|
| SCHEMA-001 | mainEntity required on entity pages |
| SCHEMA-002 | All JSON-LD blocks must parse |
| SCHEMA-003 | WebPage (or TouristDestination) schema required |
| SCHEMA-004 | FAQPage schema required |
| SCHEMA-005 | BreadcrumbList schema required |
| SCHEMA-006 | Organization schema required (ship pages) |
| SCHEMA-007 | WebSite schema required (ship pages) |
| SCHEMA-008 | Review schema required (ship pages) |
| SCHEMA-009 | Person schema required (ship pages) |
| SCHEMA-010 | Review class reference must match actual ship class |
| SCHEMA-011 | Review body must not be templated |
| SCHEMA-012 | Review rating warned as unverified |

### Images & Attribution
| Rule | Summary |
|---|---|
| IMG-001 | Every img has meaningful alt text |
| IMG-002 | Figures have figcaption with credit link |
| IMG-003 | Alt text recommended >=20 chars |
| IMG-004 | Non-hero images loading="lazy" — RESOLVED: BLOCKING |
| IMG-005–006 | Port images 11-25 count range |
| IMG-007–011 | Hero section requirements (WebP, inside main, img present, overlay, section class) |
| IMG-012–013 | Port image directory exists and non-empty |
| IMG-014 | Placeholder hash detection |
| IMG-015 | Cross-port image duplication forbidden |
| ATTR-001 | Every port image has attr.json |
| ATTR-003 | Attribution source-URL diversity |

### Accessibility (WCAG 2.1 AA)
| Rule | Summary |
|---|---|
| A11Y-001 | Skip-link present — RESOLVED: BLOCKING |
| A11Y-002–003 | charset + viewport required |
| A11Y-004 | id="main-content" landmark |
| A11Y-005 | Exactly one h1 |
| A11Y-006–009 | ARIA labels on buttons, carousels, live regions |
| A11Y-010 | Breadcrumb aria-label="Breadcrumb" |
| A11Y-011 | SDG footer NOT aria-hidden |
| A11Y-012 | aria-hidden images have empty alt |
| A11Y-013 | Tag balance |
| A11Y-014 | html lang attribute |

### Page Structure
| Rule | Summary |
|---|---|
| STRUCT-001 | Ship section order (legacy + emotional-hook) |
| STRUCT-002 | Port section order (EXPECTED_MAIN_ORDER) |
| STRUCT-003 | Port 8 required sections |
| STRUCT-004 | Collapsible sections use details/summary |
| STRUCT-005 | Port total word count 2000-6000 |

### Port-Specific
| Rule | Summary |
|---|---|
| PORT-001 | Notices section present |
| PORT-002 | Logbook 800-2500 words |
| PORT-003–007 | Section word minimums (cruise_port 100, getting_around 200, excursions 400, depth_soundings 150, FAQ 200) |

### Ship-Specific
| Rule | Summary |
|---|---|
| SHIP-001 | answer-line + key-facts blocks |
| SHIP-002–003 | Required sections (active 7, TBN 6) |
| SHIP-004 | first_look 50-150 words |
| SHIP-005 | Dining hero tiered acceptance — RESOLVED: ship-specific > sister-class > line-generic |
| SHIP-006 | Logbook personas coverage |
| SHIP-007 | grid-2 layout for first_look + dining |
| SHIP-008 | Meta description coherence |
| SHIP-009 | Personality-first ordering detection |
| SHIP-010 | Swiper no rewind/loop |
| SHIP-011 | Internet at Sea nav link required |
| SHIP-012 | Trust badge in footer |

### Venue-Specific
| Rule | Summary |
|---|---|
| VENUE-001 | Correct Schema.org type per venue category |
| VENUE-002 | Required sections (logbook, faq, menu-prices for dining) |
| VENUE-003 | Menu prices must be real (not "Varies by venue") |
| VENUE-004 | FAQ >=3 items |
| VENUE-005 | Logbook ship+date attribution |
| VENUE-006 | venue-tags meta (96% missing) |
| VENUE-007 | No generic FAQ contamination |
| VENUE-008 | Meta description coherence |
| VENUE-009 | "Guest Experience Summary" placeholder forbidden (297 pages) |
| VENUE-010 | "Varies by venue" price forbidden (187 pages) |
| VENUE-011 | "Coming soon" on active venues forbidden |

### Mobile
| Rule | Summary |
|---|---|
| MOB-001 | Viewport meta with width=device-width + initial-scale=1 |
| MOB-002 | No inline widths >480px |
| MOB-003 | Hero image containment |
| MOB-004 | Table overflow handling |
| MOB-005 | Touch targets >=44px |
| MOB-006 | No horizontal scroll |
| MOB-007 | Font-size floor 15px |
| MOB-008 | Mobile hardening CSS section |

### Security
| Rule | Summary |
|---|---|
| SEC-001 | No eval() |
| SEC-002 | No debugger |
| SEC-003 | No console.log in production |
| SEC-004 | innerHTML requires sanitization review |
| SEC-005 | No hardcoded secrets |
| SEC-006 | No document.write() |

### Performance & PWA
| Rule | Summary |
|---|---|
| PERF-001 | Hero fetchpriority="high" + loading="eager" |
| PWA-001 | Service worker cache version bumped per release |

### Navigation
| Rule | Summary |
|---|---|
| NAV-001 | 12-link canonical navigation (orphan — no validator enforces count) |

### Voice & Authenticity
| Rule | Summary |
|---|---|
| VOI-001 | No AI-overrepresented vocabulary |
| VOI-002 | No hedging stacks |
| VOI-003 | Natural sentence-length variance |
| VOI-004 | No interchangeable descriptions |
| VOI-005 | Emotional precision (direct words) |
| VOI-006 | No road-map paragraphs |

### Logbook
| Rule | Summary |
|---|---|
| LOG-001 | 6-movement narrative anatomy |
| LOG-002 | ## Full disclosure section |
| LOG-003 | 7-section spine with Accessibility + Female Crewmate |
| LOG-004 | Emotional pivot not flattened (CLAUDE.md NEVER) |
| LOG-005 | No brochure/sales language |

### Publication Polish
| Rule | Summary |
|---|---|
| PROOF-001 | Curly quotes |
| PROOF-002 | Em-dashes not double-hyphens |
| PROOF-003 | No double spaces |
| PROOF-004 | Proper ellipsis |
| PROOF-005 | No placeholder text |

### Data Integrity
| Rule | Summary |
|---|---|
| DATA-001 | Port slug canonical across sources |
| DATA-002 | All JSON files must parse |
| DATA-003 | Ship spec consistency across surfaces |

### Link Integrity
| Rule | Summary |
|---|---|
| LINK-001 | Ship-venue references resolve to venue pages (~2,950 slots, 472 pages) |

### SEO
| Rule | Summary |
|---|---|
| SEO-001 | Open Graph tags |
| SEO-002 | Twitter Card tags |
| SEO-003 | Title tag present |
| SEO-004 | DOCTYPE present |
| SEO-005 | No duplicate title/description |

---

## Archived originals

The pre-spec standards documents are preserved with full git history at:
- `admin/archive/standards-pre-2026-04-15/foundation/` — 8 foundation docs
- `admin/archive/standards-pre-2026-04-15/v3.010/` — 8 v3.010 docs
- `admin/archive/standards-pre-2026-04-15/standards-legacy/` — 2 legacy docs

---

**Soli Deo Gloria.**
