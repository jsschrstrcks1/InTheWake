# The door: read-only recipes for one person outside the house

## What it is

Atlas runs on a home machine and listens only on the private network. The door lets one
person who is not on that network open the recipes app, read-only, and nothing else.

```
her phone
  -> Worker "jerusha-recipes"      gate 1: sign-in cookie, GET/HEAD only, path allowlist
  -> tunnel hostname               gate 2: Cloudflare Access, service token only
  -> cloudflared on the home box   gate 3: ingress path regex, everything else 404
  -> Atlas on 127.0.0.1:8088       no gate (see Named limits)
```

Files:

- `worker.js` - the Worker. One file, no dependencies. It is the security boundary.
- `worker.test.mjs` - attacks on the Worker's claims. `node --test worker.test.mjs`
- `wrangler.toml` - Worker config. No secret values.
- `cloudflared-config.example.yml` - the tunnel ingress rule, with placeholders.
- `selfattack/run.py` - weakens each guard in a scratch copy and shows which test catches it.

## The gates

1. **Worker.** Every request needs the `door` cookie, except the sign-in link. Only GET and
   HEAD are forwarded. The path must pass hygiene unchanged (no `..`, `//`, backslash, control
   character, or percent-escape of any kind), must not be on the deny list, and must match the
   `recipes` room. The upstream URL is built from the `UPSTREAM` secret, never from the request.
   The visitor's Cookie and Authorization headers never go upstream. Redirects are not followed.
   Only answers stamped by Atlas (`x-atlas-origin: 1`) are relayed. Anything else is a 502.
2. **Cloudflare Access.** The tunnel hostname accepts only the service token the Worker holds.
   A person who learns the tunnel hostname gets nothing without it.
3. **cloudflared ingress.** Only the recipes paths reach Atlas. Everything else is 404 at the
   home machine, even for a caller holding the service token.

## Named limits. Read these before trusting it.

- **The door is the boundary.** By design it never relies on the app behind it to refuse a
  request. Gates 1 to 3 are the whole defence, so keep all three.
- **No recipe-level filtering.** She sees whatever the allowlisted routes return. The door does
  not filter by recipe level.
- **Read-only lives in the Worker alone.** The tunnel rule matches paths, not methods.
  `/recipe/correct` is closed at the tunnel by path as well, but no other layer checks the method.
- **The home machine must be up.** If it sleeps, or Atlas or cloudflared stops, she sees
  "Home is offline right now". There is no cached copy, on purpose.
- **The sign-in link is a bearer secret.** Anyone who gets the link gets in. It travels in a
  URL query once. The Worker cannot rate-limit guesses (it keeps no state), so the token must
  be long and random. Consider a Cloudflare rate limiting rule on `/_door/enter`.
- **The shared Atlas nav bar is not served.** `shell-mount.mjs` is refused, so the page shows
  no top bar. That is deliberate: the bar links to every other Atlas app, polls weather feeds,
  and can move the page to another household host.
- **No service worker, no offline mode.** `recipes-sw.js` is refused.
- **"Add to Home Screen" may give a plain bookmark.** Browsers fetch the web manifest without
  cookies, so the door answers it 401. On iOS a home screen web app may also keep its own
  cookie jar, in which case she must open the sign-in link from that app once. Not verified.
- **Corrections do not work.** The "correct this transcription" form posts to
  `/recipe/correct`, which the door refuses with 405. The page shows "refused". It is off by
  default in the page's Settings.
- **The person link does not work.** "X in People" points at `/people.html`, which is refused.
  Also off by default in Settings.
- **Atlas's CSP header is relayed as is.** It names the household's private-network peer
  addresses in `connect-src`. They are not reachable from outside, but she can read them.

## Setup order

Do these in order. Each step is safe to stop after.

1. **Atlas.** Confirm it answers on the home machine: `curl -s http://127.0.0.1:8088/ping`.
2. **Tunnel.** Create a tunnel and a DNS hostname for it. Fill in a copy of
   `cloudflared-config.example.yml` (tunnel id, credentials file, hostname). Start cloudflared.
3. **Access.** In Zero Trust, add a self-hosted application for the tunnel hostname. Give it
   one policy: action Service Auth, include the one service token. No other policy. Create the
   service token and keep its Client ID and Client Secret for step 5.
4. **Check the tunnel is closed.** From any network: `curl -i https://<tunnel hostname>/recipes`
   must NOT return recipes. Expect a 403 or a redirect to a login page.
5. **Worker secrets.** `wrangler secret put` each of `DOOR_TOKEN`, `UPSTREAM`,
   `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, and optionally `DOOR_COOKIE_KEY`.
   Make the door token with `openssl rand -base64 32 | tr '+/' '-_' | tr -d '='`.
6. **Tests.** `node --check worker.js && node --test worker.test.mjs`. All green before deploy.
7. **Deploy.** `wrangler deploy`.
8. **Send her the link.** `https://<worker hostname>/_door/enter?t=<DOOR_TOKEN>`, over a
   private channel. Put it behind the Recipes button in the app she already uses.

## How to add a room

1. In `worker.js`, add a key to `ROOMS` with `home`, `exact` and `prefixes`. List every static
   file the page loads (follow its imports) and every GET route it calls. Prefer `exact`.
   A prefix allows itself and anything after `prefix + "/"`, nothing else.
2. Check the new paths against `DENY`. If the page needs a denied path, stop and think.
3. Add the same paths to the regex in the cloudflared config. Keep it anchored with `^` and `$`.
4. Add the allowed paths and their look-alikes to `worker.test.mjs`. Run the tests, then
   `python3 selfattack/run.py .` and confirm no mutation survives.
5. The sign-in redirect and `/_door/health` name the recipes room. With a second room, decide
   which room a token opens before you deploy. Today one token opens every room.

## How to revoke

- **Her access, all devices:** `wrangler secret put DOOR_TOKEN` with a new value. Every
  cookie already issued stops working at once. Send a new link if she should keep access.
- **Sign every device out, keep the same link:** `wrangler secret put DOOR_COOKIE_KEY` with a
  new value.
- **One phone:** open `https://<worker hostname>/_door/leave` on it.
- **The Access service token:** delete or rotate it in Zero Trust, Access, Service Auth. The
  door answers 502 until the two `CF_ACCESS_*` secrets are updated.
- **`UPSTREAM`:** not a credential. If the tunnel hostname changes, put the new origin.
- **Everything, now:** `wrangler delete`, or stop cloudflared on the home machine, or delete
  the Access application. Any one of the three closes the door.

## How to test from a phone on mobile data

Turn Wi-Fi off and disconnect any VPN first, so the phone is truly outside.

1. Open `https://<worker hostname>/recipes.html` in a private tab. Expect "Please sign in again".
2. Open the sign-in link. Expect the recipe list. The address bar must show `/recipes.html`
   with no token in it.
3. Open a recipe. Search. Try the Pantry tab. Print a card (opens a new tab).
4. Open `https://<worker hostname>/_door/health`. Expect `{"ok":true,"room":"recipes"}`.
5. Open `/admin`, `/helm`, `/photos`, `/whoami`, `/`. Expect a short refusal each time, never
   an Atlas page.
6. Open `https://<tunnel hostname>/recipes` directly. Expect a refusal from Cloudflare Access.
7. Stop cloudflared at home and reload. Expect "Home is offline right now", never an empty
   list. Start it again.
8. Open `/_door/leave`, then `/recipes.html`. Expect "Please sign in again".
