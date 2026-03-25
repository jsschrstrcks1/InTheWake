---
name: content-freshness
version: "1.0.0"
description: "Scans last-reviewed meta tags, flags stale pages, and generates a freshness report — tuned for cruise content with seasonal awareness"
type: audit
triggers:
  - command: "/freshness"
  - session_start: true
---

# Content Freshness Audit — InTheWake

**Purpose**: Identify stale content before visitors or AI crawlers encounter outdated information.
**Integrates with**: ICP-2 (which requires `last-reviewed` meta tags on all pages).

**Soli Deo Gloria**

---

## How It Works

When triggered by `/freshness` or at session start, perform the following audit across all HTML pages in the repository.

---

## Step 1: Scan `last-reviewed` Meta Tags

Search every `.html` file for:

```html
<meta name="last-reviewed" content="YYYY-MM-DD">
```

For each page, extract the date and compute days since last review relative to today.

**Missing tags**: Flag any HTML page that lacks a `last-reviewed` meta tag entirely — this is an ICP-2 compliance gap.

---

## Step 2: Apply Staleness Threshold

The default staleness threshold is **90 days**. The user may override this (e.g., `/freshness --threshold 60`).

Flag every page where `days_since_review > threshold`.

---

## Step 3: Prioritize by Content Sensitivity

Not all stale pages are equally urgent. Rank flagged pages using this priority order:

| Priority | Content Type | Detection | Why |
|----------|-------------|-----------|-----|
| **P0 — Critical** | Port pages (~388) | Path contains `/ports/` or filename matches port patterns | Cruise lines change itineraries seasonally; stale port info causes booking confusion |
| **P1 — High** | Ship profiles (~298) | Path contains `/ships/` or filename matches ship patterns | Ship amenities, deck plans, and deployments change regularly |
| **P2 — High** | Interactive tools & calculators | Path contains `/tools/`, `/calculators/`, or pages with calculator/form elements | Price data goes stale; wrong numbers erode trust |
| **P3 — Medium** | Seasonal content | See Step 4 below | Time-sensitive by definition |
| **P4 — Normal** | General articles & guides | Everything else | Still matters, but lower blast radius |

Within each priority tier, sort by staleness (most days since review first).

---

## Step 4: Seasonal Content Awareness

InTheWake has seasonal cruise content that must be reviewed **before** each season begins, regardless of the 90-day threshold.

### Season Calendar

| Season | Content Pattern | Must Be Fresh By |
|--------|----------------|-----------------|
| Alaska Summer | Pages referencing Alaska, Inside Passage, Glacier Bay, Juneau, Ketchikan, Skagway | April 1 |
| Caribbean Winter | Pages referencing Caribbean, Bahamas, Eastern/Western Caribbean | October 1 |
| Mediterranean Summer | Pages referencing Mediterranean, Greek Isles, Adriatic | March 1 |
| Holiday Sailings | Pages referencing holiday cruises, Christmas, New Year's | October 15 |
| Repositioning | Pages referencing transatlantic, repositioning cruises | March 1 and September 1 |

**Logic**: If today's date is within 60 days before a season's "Must Be Fresh By" date, flag any matching page that has not been reviewed since the previous season ended. These get elevated to **P3** even if they are within the normal 90-day window.

---

## Step 5: Cruise Line Data Currency

For port and ship pages, check whether the content reflects the current cruise season:

- Look for year references in the page body (e.g., "2025-2026 season"). If the referenced year is behind the current year, flag as **outdated season data**.
- Look for pricing mentions. If a page contains prices but the `last-reviewed` date is older than 6 months, flag as **price data potentially stale**.
- Look for itinerary references. If itinerary details are present and review date is older than the current season start, flag as **itinerary may have changed**.

---

## Step 6: Generate Freshness Report

Output a structured report in this format:

```
=== CONTENT FRESHNESS REPORT — InTheWake ===
Generated: [today's date]
Threshold: [N] days
Total HTML pages scanned: [count]
Pages missing last-reviewed tag: [count]
Pages within threshold: [count]
Pages STALE: [count]
Seasonal alerts: [count]

--- P0: CRITICAL (Port Pages) ---
[filepath] — last reviewed [date] ([N] days ago)
[filepath] — last reviewed [date] ([N] days ago)
...

--- P1: HIGH (Ship Profiles) ---
...

--- P2: HIGH (Interactive Tools) ---
...

--- P3: MEDIUM (Seasonal Alerts) ---
[filepath] — last reviewed [date] — SEASONAL: [season name] starts [date], review needed by [date]
...

--- P4: NORMAL (General Content) ---
...

--- MISSING TAGS (ICP-2 Compliance Gap) ---
[filepath] — no last-reviewed meta tag found
...
```

---

## Step 7: Actionable Summary

After the report, provide a brief summary:

1. **Top 5 most urgent pages** to review, with reason.
2. **Upcoming seasonal deadlines** within the next 60 days.
3. **ICP-2 compliance note** — count of pages missing `last-reviewed` tags.
4. **Recommended next action** — e.g., "Start with the 12 Alaska port pages — season opens April 1."

---

## Configuration

Users can customize behavior:

- `/freshness` — Run with defaults (90-day threshold, all priorities).
- `/freshness --threshold 60` — Use a 60-day threshold.
- `/freshness --priority P0` — Only show Critical items.
- `/freshness --seasonal-only` — Only show seasonal alerts.
- `/freshness --missing-only` — Only show pages missing `last-reviewed` tags.

---

**Soli Deo Gloria**
