---
id: VENUE-002
name: Venue page required sections (hero, about, dining/menu, logbook, faq)
family: venue
severity: error
applies-to:
  - venue
provenance: V-only
status: live
implementation:
  - file: admin/validate-venue-page-v2.js
    function: checkSections (section requirement list)
    lines: "370-390"
check: venue page contains required sections including id="logbook" and id="faq" (both required); id="menu-prices" required for dining-style venues
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
Every venue page must contain these required sections (by `id` attribute):
- `logbook` — guest review/experience content
- `faq` — frequently asked questions

Dining-style venues additionally require `menu-prices`. Non-dining styles (bar, activity, entertainment) are exempt from the menu-prices requirement but validator warns if they DO have a menu section with no real content.

## Why (rationale)
Every venue serves readers making a pay-or-skip decision. The logbook gives real-experience evidence; FAQ answers the practical questions; menu-prices tells dining-venue readers whether the price matches their budget. Missing any required section fails the decision-support purpose of the page.

## Pass example
Dining venue (Chops Grille steakhouse): page contains `id="logbook"`, `id="faq"`, `id="menu-prices"`. Passes.

Activity venue (Ultimate Abyss slide): page contains `id="logbook"`, `id="faq"`. No menu-prices needed. Passes.

## Fail example
Dining venue missing logbook section. Validator emits: `Required section "logbook" MISSING`.

## Fix guidance
Add the missing sections. See VENUE-003 for menu-prices content bar; VENUE-004 for FAQ depth; venue-page-writer skill for logbook content.
