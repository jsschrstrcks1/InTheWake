# SEO & Structured Data — v3.006

## Principles
- Use **JSON‑LD** (`application/ld+json`) for all structured data.
- Only one primary `WebPage` node per page.
- Ships hub pages: use `ItemList` with **each** `itemListElement` containing a `ListItem` with `position` (1‑based).
- Reviews/AggregateRating: ensure `itemReviewed` is a **valid type** for the content (e.g., `Product`, `CreativeWork`, `Place`, `Organization`).

## Google Search Console Issues Addressed
- **Missing field "position" (in "itemListElement")** — fixed in ItemList template.
- **Invalid object type for field "itemReviewed"** — templates provide valid examples and notes.

## Testing
- Validate with Rich Results Test and Schema.org validator before release.
