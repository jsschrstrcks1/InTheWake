# Facebook Page Auto-Publish Setup

One-time setup the operator runs to wire In the Wake's Facebook Page to
the auto-publisher.

## Prerequisites

- Meta Developer account (developers.facebook.com), with a verified
  business or individual profile.
- Admin role on the In the Wake Facebook Page.

## Steps

### 1. Create the Meta Developer app

1. developers.facebook.com → My Apps → Create App.
2. Use case: "Other" → "Business".
3. App name: "InTheWake Auto-Publish".
4. Contact email: operator's email.
5. Business portfolio: select the InTheWake business if one exists, else
   skip.
6. After creation, the app starts in **Development mode** — fine for v1.

### 2. Add the Pages product

1. In the app dashboard → Add product → Pages → Set up.
2. Add the InTheWake Page.
3. Note the **App ID** and **App Secret** (Settings → Basic). These are
   not stored in GitHub but are needed for token exchange.

### 3. Get a short-lived User token

1. Tools → Graph API Explorer.
2. App: select the new app.
3. User or Page: User Token.
4. Permissions: `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`.
5. Generate Access Token → Continue as ... → Approve all permissions.
6. Copy the token. It's valid for ~1 hour.

### 4. Exchange for a long-lived User token

In any shell with the values from steps 2 and 3:

```
curl -G 'https://graph.facebook.com/v21.0/oauth/access_token' \
  --data-urlencode 'grant_type=fb_exchange_token' \
  --data-urlencode "client_id=APP_ID" \
  --data-urlencode "client_secret=APP_SECRET" \
  --data-urlencode "fb_exchange_token=SHORT_LIVED_USER_TOKEN"
```

Response includes `access_token`. That's the long-lived User token (~60
days).

### 5. Exchange for a long-lived Page token

```
curl -G 'https://graph.facebook.com/v21.0/me/accounts' \
  --data-urlencode "access_token=LONG_LIVED_USER_TOKEN"
```

Response is a JSON list of pages. Find the InTheWake entry. Its
`access_token` field is the **long-lived Page token** (~60 days in
Development mode, never-expiring after App Review approval).

Also note the page's `id` — that's `FACEBOOK_PAGE_ID`.

### 6. Set GitHub Encrypted Secrets

In the repo's Settings → Secrets and variables → Actions → New repository secret:

- `FACEBOOK_PAGE_ID` = the Page ID from step 5
- `FACEBOOK_PAGE_ACCESS_TOKEN` = the long-lived Page token from step 5

### 7. Verify

Trigger `Social Publish (Facebook)` via the Actions tab with
`dry_run: true` and `article: articles/cruise-tipping-2026.html`. The
log should print the composed post (in DRY-RUN mode) and exit 0. No FB
call yet — but secrets are reachable.

### 8. App Review submission (parallel track)

To upgrade from 60-day rotation to a permanent token, submit the app
for review. In the Meta Developer dashboard:

1. App Review → Permissions and Features.
2. Request `pages_manage_posts` (Live) and `pages_read_engagement` (Live).
3. Required materials:
   - **App icon** (1024×1024) — use a cropped section of the In the Wake
     logo or compass-rose mark.
   - **Privacy policy URL**: https://cruisinginthewake.com/privacy.html
   - **Terms of service URL**: https://cruisinginthewake.com/terms.html
   - **Data deletion instructions URL**: same as privacy policy.
   - **Screencast** (3–5 minutes): show the auto-publish flow end-to-end —
     a new article landing on `main`, the Actions run, the resulting post
     on the In the Wake Page. Record locally; upload via the Review form.
4. Submit. Meta typically responds in 5–14 calendar days.
5. On approval, regenerate the Page token (it'll be near-permanent). Update
   `FACEBOOK_PAGE_ACCESS_TOKEN` secret. No code change needed.

### 9. Token rotation discipline (until App Review approves)

The Development-mode token expires every ~60 days. There's no proactive
warning in v1 — instead, the next publish after expiry fails with a
clear error message in the Action log pointing to step 5 of this
runbook. Rotate within 24 hours of seeing the error to avoid missing
a post.

For v1.1, a watcher could open a GitHub issue 7 days before expiry.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Action fails with "TOKEN_INVALID" | Token expired, was revoked, or wrong page | Repeat steps 3–6 |
| Action fails with "PERMISSION_DENIED" | `pages_manage_posts` not granted | Re-do step 3 with both permissions checked |
| Post appears without an OG card | First-time URL, FB hasn't scraped yet | Wait ~30 seconds, refresh feed. If still missing after 5 min, hit FB Sharing Debugger (developers.facebook.com/tools/debug) with the URL |
| "RATE_LIMITED" error | Too many calls in a window | Unlikely at 1–2 articles/week — investigate before retrying |
