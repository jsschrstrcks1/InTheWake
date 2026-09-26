# Voyage companion: the Journal tab

**Status:** Planned. Not built.
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

## Open questions

1. Photos in the first version (shrunk before saving), or text first and photos second?
2. Couples on one phone: one journal per phone, or a name on each entry so two people can share?

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
