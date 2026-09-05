# Voyage-usage relay (Cloudflare Worker)

**Soli Deo Gloria.** Plan: `docs/superpowers/plans/2026-09-05-voyage-pack-usage-tracking.md` §2.1 (Setting 1.5) and Task 5b.

## What it is for

The fourteen Voyage companions promise *"No tracking, no ads."* That sentence is not edited. The companions still need to answer "is anyone using this, which parts, and when in the voyage", so they send a handful of anonymous counts, and this relay is what makes the promise mechanical rather than a matter of client-side good behaviour:

| The relay keeps | The relay discards |
|---|---|
| event name (from a fixed list) | the client IP (no forwarded-for header of any kind reaches Umami) |
| whitelisted properties: pack, variant, scope, standalone, offline, phase, day, tabs | the client User-Agent (a fixed relay UA is sent instead) |
| country and state/province from Cloudflare's own request metadata | city, and any property not on the whitelist |

Umami therefore records one "visitor" at one location: this relay. There is nothing about a traveler to reconstruct.

## Deploy (operator, from a machine with Cloudflare credentials)

```bash
cd admin/voyage-usage-relay
npx wrangler deploy
```

Then bind a hostname (the companions expect `https://usage.cruisinginthewake.com/send`; change `ITW_USAGE_ENDPOINT` in the companion pages if you choose another) and add it to each companion's CSP `connect-src`, which the Phase C slices already do.

**Daily sitting-link dial, default off.** `npx wrangler secret put RELAY_SECRET` turns it on: sittings from the same phone within one calendar day share a `sitting_key`; after midnight the key is meaningless by construction. Remove the secret to turn it off. The IP never leaves the Worker in either mode.

## Tests

```bash
node --test tests/unit/voyage-usage/relay.test.mjs
```

The stated claim is *nothing about the traveler reaches Umami*. The test feeds a request carrying a spoofed forwarded-IP header, a real browser User-Agent, and city-level `cf` metadata, and reads the outbound request literally: no IP header, the fixed relay UA, no city, only whitelisted keys plus country and region.

## Honest limits

- Cloudflare's `request.cf.country` / `request.cf.region` field names are from memory; confirm against the Workers runtime docs on first deploy. The tests exercise the code path with those names.
- Cloudflare's free-tier request allowance was not checked this session; it is far above a few dozen companions' traffic, but confirm before relying on it.
- State-level place is the connecting network's location. At sea that is the ship's satellite provider, not the traveler's home.
