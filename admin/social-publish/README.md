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
