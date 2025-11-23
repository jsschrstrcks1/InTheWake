# SEO_STRUCTURED_DATA.md (v3.009)

Use **exact** Schema.org types and keep values concrete. Prefer one primary JSON-LD block per page.
- **WebPage** for standard pages, **Article/BlogPosting** for articles, **CollectionPage** for indexes.
- Always use **absolute** URLs.
- Dates: ISO `YYYY-MM-DD` (or full ISO timestamps), ensure `dateModified` updates on edits.
- Images: use JPG fallback URL; WebP is handled in `<picture>` in HTML.

## Do
- Validate with `https://validator.schema.org/`.
- Match `<title>`/meta description with JSON-LD `headline`/`description`.
- Use the site’s canonical host `https://www.cruisinginthewake.com/`.

## Don’t
- Don’t rely on JS-injected metas for crawlers; ship static `<title>`/description.
- Don’t include placeholder text (replace all `__PLACEHOLDER__`).

See `JSONLD_TEMPLATES/*.jsonld` for drop-in templates.
