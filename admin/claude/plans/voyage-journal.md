# Voyage companion: the Journal tab

**Status:** Built 2026-09-26 (text; photos next). Code: `admin/voyage-pwa/companion.js` (Journal section); tests: `tests/unit/voyage-journal.test.mjs`.
**Target:** the shared companion (`admin/voyage-pwa/companion.js` and `companion.css`), so all
15 voyage companions get it at once.
**Goal:** a private place for each traveler to write about the trip, day by day, that stays on
their own phone.
**Last updated:** 2026-09-26
**Build order:** back to back with the ship-tab FAQ and the top-level Alerts tab (operator
decision 2026-09-26: order between the three does not matter).

Soli Deo Gloria.

---

## The promise, in the words the traveler sees

Shown at the top of the Journal tab the first time it opens, and kept one tap away after that:

> **Your journal is private.** It lives only on this phone. We never see it, and it is never
> sent anywhere.
>
> That also means: **if you delete this app, your journal is deleted with it. If you lose this
> phone, your journal is gone too.** Tap **Save a copy** to keep it safe.

**Extra line shown only on iPhone and iPad** (operator decision 2026-09-26):

> **On iPhone:** the app on your home screen keeps its own storage, separate from Safari.
> Anything you write in Safari before adding the app to your home screen will not show up in the
> app. Add the app to your home screen first, then write in it there.

(The underlying WebKit behavior is still to be confirmed against Apple's documentation before
the wording ships; see the limits below.)

The warning is not optional small print. A trip journal lost to a dropped phone is a real loss,
and the person has to know that before they write in it, not after.

## What the traveler sees

- **One journal per voyage.** The Prima trip and the Alaska trip never mix.
- **One page per day of the itinerary.** Today's page is already labelled from the schedule the
  companion carries (for example "Day 3, Grand Cayman" or "Day 4, At sea").
- **A blank page to write on**, with optional prompts under it for anyone who freezes at an
  empty box: "Best thing I ate", "Someone we met", "What I want to remember".
- **Saves as they type.** No save button to forget. Dictation works through the phone keyboard's
  microphone.

## How it stays on the phone

- Entries are stored in the browser's own database for this site (IndexedDB), keyed by voyage.
  Not in the service-worker cache, so updating the app never touches them.
- On first use, ask the browser to protect the storage from automatic clean-up
  (`navigator.storage.persist()`), and show nothing different if it says no.
- Nothing is sent anywhere. No server, no account, no tracking.

**Limits to confirm against Apple's and Google's own documentation before building** (written
here from memory, not yet checked):

- Uninstalling the app, or clearing the site's data, deletes the journal.
- On iPhone, the home-screen app keeps its storage separate from Safari. Anything written in
  Safari before installing will not appear in the installed app.
- A new phone starts empty.

## Save a copy

- **Save my journal**: one file that opens in any browser and prints cleanly, as a keepsake.
- A plain-data copy (JSON) that can be loaded back into the app on a new phone.
- On the last day of the voyage, the Journal tab reminds them to save a copy.
- Share through the phone's share sheet where it is supported; otherwise a normal download.

## Built to the house standards

- Entries are shown with `textContent`, never as HTML, so nothing typed can break the page.
- Real labels, visible focus outlines, and screen-reader-friendly structure (WCAG 2.1 AA).
- Works fully offline.

## Tests before it ships

- Write an entry, reload, and it is still there.
- Save a copy, load it back, and nothing is lost.
- Works offline.
- Checked at phone width.

## Decisions (operator, 2026-09-26)

1. **Text first, photos second.** Version 1 is text only. Photos (shrunk before saving) follow
   in the next build.
2. **Both, for couples.** Each person can keep a journal on their own phone, and people sharing
   one phone can turn on **"Whose entry"** so each entry carries a name. Each person can save
   their own copy.

## Settings page

A small **Settings** screen for the Journal:

- **"Whose entry"**: off by default. When on, each entry asks whose it is (names typed once and
  remembered on this phone), and Save a copy can save everyone's entries or just one person's.
- **Cloud backup: coming soon.** Shown as a disabled item with one plain line, so nobody thinks
  their journal is already backed up. No sign-up, no collection of anything, until it is real.

## Upcoming features page

A short **Coming soon** screen in the companion (operator decision 2026-09-26), so travelers can
see what is on the way without anything pretending to be ready:

- **Photos in your journal.** The next build after text.
- **Cloud backup, per trip.** See the section below.
- **Your favorite photos, printed and delivered.** Pick the ones you love and have them printed
  and sent to your home. (Idea stage: the printing partner, prices, and what leaves the phone
  to make a print all need deciding first. Sending a photo to a printer is the one place the
  "never sent anywhere" promise would bend, so it has to be opt-in, per order, and say so
  plainly.)

Rules for the page: no dates we cannot keep, no sign-up forms, no email collection. Each item is
one or two plain sentences and the word "Coming soon".

---

## Later: paid cloud backup (idea, not a commitment)

Operator note, 2026-09-26: we could sell a cloud backup **per trip for a few dollars**, saved to
our own VPS **and** kept locally on the phone, so a lost phone no longer means a lost journal.

Things that must be settled before this is built:

- **It changes the promise above.** "Never sent anywhere" stays true for everyone who does not
  buy the backup. For those who do, the wording has to say plainly what is sent, where it is
  kept, and for how long. It must be opt-in, per trip, and never on by default.
- **We should not be able to read it.** Encrypt on the phone before upload, with a key only the
  traveler holds, so the VPS stores sealed boxes. The trade-off to state plainly: if they lose
  the key, we cannot recover the journal either.
- **Deletion on request, and a stated retention period.**
- **Payment is a purchase of a service, nothing more.** We do not hold funds. The companion
  footer wording is not edited for this.
- **Restore path:** install the app on a new phone, unlock, and the journal comes back.
