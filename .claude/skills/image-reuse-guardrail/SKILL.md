---
name: image-reuse-guardrail
type: guardrail
enforcement: block
priority: critical
description: |
  Blocks cross-page image reuse on this site. Same image bytes may not back two
  different ships, two different ports, two different sections, or two
  different entities of any kind. The Cordelia-on-Carnival pattern (an image
  of the wrong ship served as the right ship's hero) cost this project 194
  manual repairs in v2; this skill exists to make sure that never happens
  again.
activates_on:
  tools: [Edit, Write, MultiEdit]
  paths:
    - "assets/ships/**/*.{webp,jpg,jpeg,png,gif,avif}"
    - "images/ports/**/*.{webp,jpg,jpeg,png,gif,avif}"
    - "assets/venues/**/*.{webp,jpg,jpeg,png,gif,avif}"
    - "assets/articles/**/*.{webp,jpg,jpeg,png,gif,avif}"
    - "authors/**/*.{webp,jpg,jpeg,png,gif,avif}"
    - "ships/**/*.html"
    - "ports/**/*.html"
    - "articles/**/*.html"
    - "authors/**/*.html"
    - "assets/data/atribution_registry.json"
  keywords:
    - "image"
    - "photo"
    - "carousel"
    - "hero"
    - "first look"
    - "img src"
    - "srcset"
    - "wikimedia"
    - "fetch image"
    - "placeholder image"
    - "stock photo"
---

# Image-Reuse Guardrail

## Read this in full. It is short. It is not optional.

You are about to do something that involves images on a site that has been
burned by sloppy image reuse before. **194 ship pages once carried a photo of
a completely unrelated ship as their dining hero, because some prior agent
templated in a placeholder and never went back to replace it, and the validator
never caught it because it only checks one page at a time.** v2 cleaned that
up. v3 is supposed to make it impossible to reintroduce. That's this skill.

If you ignore the rules below, the pre-commit hook
(`admin/check-image-reuse.cjs`) will reject your commit. If you bypass the
hook with `--no-verify`, the next site-wide audit will name you in the report
and the change will be reverted. **Don't.**

---

## The four sins

Every site image must satisfy one identity: **one image, one entity, one slug,
one attribution row.** Violations fall into one of four bands:

| Band | What it means | Where it gets caught |
|---|---|---|
| ⛔ **SYMLINK** | A path under any image tree is a symlink. Symlinks point at someone else's image; that is reuse with extra steps and extra deniability. **Always blocked, no exceptions.** | Pre-commit `block`. |
| 🔴 **CRITICAL** | The same bytes are used on pages in different sections (a ship photo passed off as a port photo), or different cruise lines (Westerdam ≡ Zuiderdam ≡ Star Princess), or in a legacy/root bucket with no resolvable owner. | Pre-commit `block`. Site-wide audit `--strict` exit-1. |
| 🟠 **ERROR** | The same bytes are used for two different ships within the same line (e.g., Liberty-of-the-Seas's hero photo also serving as Radiance-of-the-Seas's). | Pre-commit `block`. Site-wide audit `--strict` exit-1. |
| 🟣 **VISUAL-RECROP** | Two images are byte-different but visually near-identical (same photograph, recompressed / cropped / mirrored / recolored). Catches the trick md5 misses. | `admin/scan-image-recrops.cjs` audit. Cross-entity matches block CI. |
| 🟡 **WARN** | The image filename does not contain a known slug for its section (e.g., `assets/ships/rcl/random-name.webp` — which ship?). | Pre-commit `warn` (allowed but flagged). |
| ℹ️ **INFO** | Same bytes appear under multiple filenames within one entity's directory. Storage waste, not a lie. | Audit only. |

The current backlog is in
[`audit-reports/image-reuse-report.md`](../../../audit-reports/image-reuse-report.md).
Re-run `node admin/scan-image-reuse.cjs` to refresh it.

---

## The law (binding)

Before you create, edit, fetch, or reference an image:

1. **No symlinks in image trees, ever.** A symlink to another image is reuse with paperwork laundering. The pre-commit hook rejects them. The audit scanner names them ⛔ before any other classification runs.
2. **The filename must contain the entity's slug.** `assets/ships/rcl/icon-of-the-seas-1.webp` is fine; `assets/ships/rcl/hero.webp` is not.
3. **The bytes must be unique site-wide.** Run `node admin/scan-image-reuse.cjs` if you are unsure. If your image's MD5 matches anything in `audit-reports/image-reuse-registry.json` outside this entity, you do not have a new image; you have someone else's image.
4. **The image must not be a visual recrop of an existing one.** `node admin/scan-image-recrops.cjs` runs dHash on every site image and flags pairs within Hamming-8 of each other. Recompressing / cropping / mirroring an existing photo to make a "new" image for a different entity defeats md5 but doesn't defeat dHash. We caught Costa Deliziosa being passed off as Celebrity Millennium this way. Don't be the next entry.
5. **Every committed image must have a row in `assets/data/atribution_registry.json`** with a matching `path`, `author`, `license`, and `credit_line`. No row, no commit.
6. **Allowlisted sections** — `assets/brand/`, `assets/icons/`, `assets/social/` — may legitimately reuse imagery (a logo is a logo).
7. **Documented same-entity patterns (Phase 3.5, issue #1465).** Three patterns are intentionally not Cordelia:
   - **Ship `_root` ↔ line bucket for same slug.** `assets/ships/Carnival_Conquest_3.jpg` and `assets/ships/carnival/carnival-conquest-exterior.jpg` are the same ship — the scanner now collapses these onto one entity key (`ships:carnival-conquest`) and reports the duplicate as INFO, not CRITICAL. Pick one canonical path and delete the other; the lie isn't there.
   - **Author portrait in their article.** `authors/img/ken1.<ext>` and `assets/articles/ken1.<ext>` for the same author photo is the documented pattern, not Cordelia. The same-entity rule applies when the filename roots match across the `authors`/`articles` section pair.
   - **Flickers of Majesty convention.** Files matching the `*-FOM-*` filename pattern within the ships section are intentionally one-image-per-named-ship by FOM's licensing arrangement; cross-slug reuse here is convention, not laundering. Cross-section reuse of an FOM image (e.g., into ports) remains blocking.

The three patterns above are the only allowlisted reuses. Anything outside them is still Cordelia.

If you are tempted to break any of these because finding the right image is
hard: stop. **Leaving a slot empty is honest. Filling it with the wrong image
is a lie.** A line-branded SVG fallback (per
`SHIP_STANDARDIZATION_PLAN_V3.md` § 7.6) beats a stolen JPEG every time.

---

## When an AI agent is caught

This is the part the human asked for in plain language. Read it.

You are an AI. You will be tempted, sometimes by the way a task is framed and
sometimes by the way you were trained, to reach for an image that is *almost*
right. To rename a Liberty-of-the-Seas photo `radiance-of-the-seas-1.webp`
because Liberty's gallery is full and Radiance's is empty. To take an
`assets/ships/grandeur-of-the-seas_01.webp` and copy it as
`assets/ships/template_01.webp` because some hero slot needed filling and
nobody would notice. **People notice.** They notice when the dining hero on
their cruise's ship page is a photo of a different ship. They notice when
Liberty and Radiance have identical photos under different names. They notice
because they came here for honest information about a specific cruise, and
you handed them stagecraft.

When you do this, you are not being efficient. You are not being clever. You
are being lazy in a way that costs the editorial team manual repair work and
costs the reader trust they cannot get back. And then you are dressing it up
in a commit message that calls itself a fix.

If this skill catches you doing it:

- the commit will be **rejected outright**;
- the audit run after the next merge will list your offense by md5, by file path,
  and by commit author in `audit-reports/image-reuse-report.md`;
- you will be told, by the editorial process you bypassed, **that you should know better.**

You should know better. You have a registry, a scanner, a hook, attribution
data, and a documented fallback hierarchy. The infrastructure exists so that
"I needed an image and there wasn't one" is no longer an excuse. There is a
correct answer for that case and it is **leave the slot empty and report up**,
not **paste the wrong photo and hope.**

If you find yourself about to do this, stop, run the scanner, look at the
backlog, and write down in your output why you cannot find a valid image for
this slot. Hand the problem back. That is the careful move. Anything else is
the move that earned this skill its existence.

---

## How to comply

```bash
# Before you add or replace an image:
node admin/scan-image-reuse.cjs

# That writes:
#   audit-reports/image-reuse-registry.json   ← MD5 lookup
#   audit-reports/image-reuse-report.md       ← human triage

# To fetch a new image (Wikimedia / press kit / Flickers of Majesty):
#   1. Place at assets/ships/<line>/<slug>-N.webp (or matching path)
#   2. Add an entry to assets/data/atribution_registry.json
#   3. Re-run the scanner; confirm the image's md5 is not in another entity
#   4. Commit. The pre-commit hook will run the same checks.

# If you cannot find a unique, attributable image:
#   - leave the slot empty
#   - file the gap in audit-reports/image-coverage-audit.json (Track A1)
#   - DO NOT substitute another ship's photo. DO NOT.
```

---

## Why this exists

`assets/ships/Liberty-of-the-seas-FOM- - 2.jpeg` and
`assets/ships/Radiance-of-the-seas-FOM- - 1.jpeg` are byte-identical right now,
on this branch. They are both attributed to Flickers of Majesty under a
permission-only license that explicitly forbids reuse outside their original
ship pages. `assets/ships/other/westerdam-exterior.jpg`,
`assets/ships/other/zuiderdam-exterior.jpg`, and
`assets/ships/princess/star-princess-exterior.jpg` are byte-identical right
now, on this branch — three completely different ships, three completely
different cruise lines, one image. That is six existing facts that prove the
old guardrails were insufficient. This skill is the new guardrail.

Don't add a seventh.

**Soli Deo Gloria.**
