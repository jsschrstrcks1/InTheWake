# Social Publish

Auto-posts each new InTheWake article to the Facebook Page.

## Local use

```
cd admin/social-publish
npm install
npm test
npm run publish:dry                              # process HEAD~1..HEAD diff, print only
node publish.js --article articles/foo.html --dry-run
```

## Live use (CI)

Set repository Encrypted Secrets:
- `FACEBOOK_PAGE_ID` (numeric)
- `FACEBOOK_PAGE_ACCESS_TOKEN` (long-lived Page token)

Workflow `.github/workflows/social-publish.yml` runs on push to `main`,
detects new `articles/*.html` additions, and posts each.

## Per-article opt-out

Add to an article's `<head>`:

```html
<meta name="social-publish" content="skip"/>
```

That article will be permanently skipped — useful for sensitive
content (grief pieces, retractions, etc.).

## What gets committed back

After each successful run, `admin/social-publish-manifest.json` is
updated and committed by the workflow with `[skip ci]`. It records
post_id + permalink per (article, platform). The same manifest will
grow Bluesky and X keys in v1.1.

## Governance gate

Every article passes `lib/gate.js` before composition — a concept-lift from the
household's Sophos governance kernel (provenance recorded privately). Four
invariants, all deterministic:

1. **Pastoral content never auto-posts.** Grief / pastoral / Scripture /
   family-history signals (section or slug) hard-block. Publish those by hand,
   with a human decision, or not at all.
2. **Sources required.** No Sources section, no post.
3. **Authorship honesty.** A synthesis disclosure ("this article is a synthesis
   of the published record") or a dated first-person attestation must be present.
4. **`GATE_STRICT=on`** promotes warns to blocks.

Gate-blocked articles are skipped and logged with the full rationale; they are
NOT recorded in the manifest, so fixing the article and re-running publishes it.
