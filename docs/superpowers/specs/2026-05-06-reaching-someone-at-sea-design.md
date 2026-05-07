# Reaching Someone at Sea — Family Emergency Contacts (Design Spec)

**Date:** 2026-05-06
**Branch:** `claude/review-docs-and-repo-ekA62`
**Spec status:** approved through brainstorming; awaiting user review of written form before implementation plan

---

## Why this exists

The fact-check pass on the v0.1.2 NCL Aqua and v0.1 Symphony voyage packs (commit `82739fcd`) verified a set of cruise-line and U.S. embassy emergency-contact numbers that materially affect a family member's ability to reach someone in a crisis. Those numbers currently live buried inside §6 *Practical Logistics* of each paid voyage pack, and there is no free, evergreen, sitewide reference page on cruisinginthewake.com that addresses the question *"how do I reach someone on a cruise ship right now."*

This spec covers two related deliverables that ship together:

1. A free sitewide page at `/reaching-someone-at-sea.html` covering universal/decision-tree material (no cruise-line directory, no comprehensive embassy phone book).
2. A new dedicated **Emergency Contacts** section in each voyage pack, consolidating per-line and per-itinerary contact information into one named, anchorable, shareable artifact tailored to that specific sailing.

The architectural split (free umbrella + paid per-itinerary detail) reinforces the W12 voyage-pack value proposition without paywalling the universal layer.

---

## Audience

The page and per-pack section serve **two readers** in opposite directions through the same content:

- **The family member at home reading right now in a crisis.** Wants the right number first; doesn't want a tutorial. Prose-style hero with bolded numbers; decision tree that says explicitly *"don't call 911 — it can't reach a ship in international waters."*
- **The cruiser preparing for a trip, before sailing.** Wants to understand the system and prepare a handoff. Reads from top to bottom; uses the page to fill in the family handoff card and share it with one trusted person ashore.

The dual-reader pattern is solved by ordering content so the urgent block lives at the top, the planner content sits below, and both readers can find what they need without scrolling past the other audience's material.

---

## Page identity

| Property | Value |
|---|---|
| URL | `/reaching-someone-at-sea.html` |
| Title tag | `Reaching Someone at Sea — Emergency Contacts \| In the Wake` |
| Meta description | `Free reference. How to reach someone on a cruise ship in a crisis: ship-to-shore numbers, U.S. embassy contacts by port, State Department 24/7 line, and what to do when the standard help line is closed.` |
| Footer placement | Last entry in the *Help* column of the footer, after Support |
| Main nav | Not added — page should be discoverable when needed but not visually prominent |
| Pastoral guardrails | No affiliate links, no urgency-coded language, no fearful framing, no banned vocabulary; treats reader as adult |

---

## Sitewide page structure (`/reaching-someone-at-sea.html`)

Five blocks, top to bottom:

### Block A — In-crisis hero (~150–200 words)
For the family member reading in real time.

- Plain prose, not a table.
- One universal number bolded: **State Department Overseas Citizens Services**, +1-202-501-4444 (from abroad) / +1-888-407-4747 (from U.S./Canada), 24/7.
- Pointer: *"If you have your family member's voyage pack, open Section 6 (Emergency Contacts). It contains the cruise-line and port-specific numbers tailored to their sailing. If you don't have it, the State Department line above is the right call."*
- Single line confirming what State Dept can do: locate the ship, contact the cruise line on the family's behalf, coordinate consular services if the situation is in port.

### Block B — Decision tree: which call do I make?
Four scenarios, each with the right routing and a one-sentence "and here's what they'll ask you for":

- **Medical emergency at sea** → State Department first; they coordinate with the cruise line.
- **Missing person at sea** → State Department; the Cruise Vessel Security and Safety Act of 2010 (Public Law 111-207) requires the cruise line to log incidents and report to the FBI.
- **Port-side emergency** → local emergency services first (911-equivalent varies by country); embassy/consulate second; State Department third.
- **Pre-cruise flight delay (cruiser missed connection or hasn't sailed yet)** → the cruise line's flight assistance hotline (in the voyage pack, or call the cruise line's main customer service).

Explicit anti-instructions:
- *Don't call 911 — it can't reach a ship in international waters.*
- *Don't call the cruise line's general booking line — it routes to sales, not emergencies.*

### Block C — "Send this page to one person at home before you sail"
Reframes for the cruiser. Short checklist of what to share with the trusted contact ashore:
- This page (the universal reference)
- Your voyage pack if you bought one (the per-itinerary detail)
- Ship name, sailing date, cabin number once assigned
- Travel insurance policy + 24-hour assist line
- Group host contact if applicable

Voice: positions the voyage pack as *the document your family will need if anything goes wrong* — same emotional weight as a will, no overstatement.

### Block D — How the systems actually work (~250 words)
Calm explainer for the planner who wants to understand before the trip.

- How port agents work (a local cruise-line employee at every port, contactable through the ship's daily program)
- What the cruise line is required to do under CVSSA 2010 (log + report incidents to the FBI; peephole + security latches in cabins; surveillance; time-sensitive safety information)
- How the State Department's overseas citizen services line dispatches (Bureau of Consular Affairs)
- Why ship-to-shore numbers vary by line (no industry standard; each line maintains its own family-contact desk)

This block is for the planner, not the in-crisis reader. Sits below the decision tree intentionally.

### Block E — When the news is the worst kind
Quiet pastoral footer for the rare incident-response case.

- One paragraph acknowledging that families occasionally receive very bad news from the ship, and pointing to:
  - `/solo/in-the-wake-of-grief.html` (existing logbook entry on grief at sea)
  - International Cruise Victim Lawyers Association (ICVLA) and CVSSA-related public-record resources for incident-response cases.
- No promotion. No affiliate links. Honors `admin/claude/PASTORAL_GUARDRAILS.md`.

---

## Sitewide page — blank handoff card (within Block C)

The sitewide page Block C contains a **blank** version of the same handoff card the voyage packs use. Same fields, no pack-specific defaults. Visitors who haven't bought a pack still get a usable artifact.

### Handoff card field list (same in sitewide and per-pack)

```
THE FAMILY HANDOFF CARD
(Fill in before sailing. Share with one trusted person ashore.)

Cruiser's full legal name (as it appears on passport): ______________________
Date of birth: ______________________
Passport number: ______________________  (only share with someone you fully trust)
Cruiser's mobile (works on Wi-Fi calling at sea): ______________________

Cruise line: __________________
Ship name: __________________
Sailing date: __________________
Disembark date: __________________
Booking / reservation number: __________________
Stateroom / cabin number: __________________  (assigned at or after check-in)

Travel insurance company: __________________
Policy number: __________________
24-hour assistance line: __________________

Group host (if applicable): __________________
Group host contact: __________________

Pre-cruise flight outbound (airline + flight number + date): __________________
Pre-cruise flight return (airline + flight number + date): __________________

Anything you want shared in a medical situation
(allergies, medications, conditions, advance directive on file): __________________

Trusted contact at home (for the cruiser's records):
Name: __________________  Phone: __________________  Relationship: __________________
```

### Card implementation across formats

| Format | Behavior |
|---|---|
| **Markdown (`.md`)** | Rendered as the underscored fillable lines above; designed to print on a single page |
| **HTML (`.html`)** | `<input type="text">` fields styled as underlines; persisted to `localStorage` keyed by pack ID (e.g., `inthewake-handoff-card-v0.1.2`, or `inthewake-handoff-card-sitewide`); a "Clear card" button wipes the data |
| **PDF download** | Generated client-side via `html2pdf.js` from the same DOM; the localStorage values are baked into the rendered card |
| **Print** | Native `window.print()` with print-only CSS that scopes the visible content to the card + universal contacts |

### Privacy framing inline above the card

> Passport number and date of birth are sensitive — share with a person you fully trust, and don't email this card unencrypted. Hand it physically, or use a secure-message medium that you trust.

No fear-mongering; adult-to-adult.

---

## Per-voyage-pack Emergency Contacts section

A new dedicated section consolidates content currently scattered through §6 *Practical Logistics* into one named, anchorable, shareable block. Identical structure across all voyage packs so a family member who has seen one recognizes it on any other.

### Position and renumbering

- Inserted as **§6 Emergency Contacts**, between the existing §5 Pre-Cruise Countdown and the existing §6 Practical Logistics.
- Practical Logistics renumbers from §6 to §7; subsequent sections renumber accordingly.
- All in-pack cross-references (TOC, "see Section X" mentions, `#section-N` anchors) updated to match the new numbering.
- Embassy bullets and cruise-line-emergency mentions in the old §6 (now §7) are **removed** — the new section is now the canonical home, and duplication would create drift.

### Section content (~600 words per pack)

1. **One-paragraph framing (~80 words)** — the dual-reader opener: *"If you're reading this in a crisis, the numbers below are the right calls in priority order. If you're the cruiser preparing for the trip, share this section with one trusted person ashore before sailing. Numbers verified [date]; cruise-line numbers may change with promotional cycles — confirm yours on your booking confirmation."*

2. **The fillable handoff card** (same field list as sitewide, but with cruise line / ship / sailing dates pre-populated where the pack already knows them).

3. **Universal 24/7 line, in bold** — State Department Overseas Citizens Services. Same on every pack.

4. **Cruise-line-specific numbers** (this line only):
   - Ship-to-shore family contact (toll-free US/Canada + international)
   - Flight assistance hotline (pre-cruise delays)
   - Customer service main line
   - Plus a one-line note: *for in-port emergencies the ship's port agent is reachable through the cruise line's emergency desk*

5. **Embassy/consulate per port** (this itinerary's ports only):
   - For v0.1 Symphony Western Caribbean: Bahamas (CocoCay), Honduras (Roatán), Mexico (Cozumel + Costa Maya).
   - For v0.1.2 NCL Aqua: Bahamas (Great Stirrup Cay), Jamaica (Ocho Rios), Cayman, Mexico (Cozumel).
   - Each entry: country, embassy/consulate location, business-hours phone, after-hours phone, address.
   - Verified numbers from commit `82739fcd` are canonical here.

6. **What to ask when you call** — three short bullet lists of what each authority will need from the caller (ship name, sailing date, name of person, cabin number, your relationship). Reduces panic-call confusion.

7. **Decision tree, abbreviated (~5 lines)** — same four scenarios as the sitewide page, scoped to *this* itinerary's specifics (e.g., *"in-port emergency in Cozumel → 911 reaches Mexican emergency services; the U.S. consulate in Mérida is the right call once safe"*).

8. **Bottom-of-section reminder** — link back to `/reaching-someone-at-sea.html` for the deeper systems explanation, and to the host (e.g., Tina Maulsby in v0.1.2) for group-cruise-specific coordination.

---

## PWA offline support

### Automatic, not manual

The page and per-pack HTML files are added to the existing service-worker precache list. After first load on any device, the PWA caches them automatically. The user does not download anything manually for the offline copy.

### Banner on each page (sitewide and per-pack)

> This page is part of In the Wake's offline-capable PWA. After your first visit, it works without Wi-Fi — even at sea, in port, or anywhere your family member loses signal.

Brief, calm. Linked separately to a one-paragraph "How to make this page available offline" mini-guide for users who haven't yet visited the page on the device they want it on.

### Voyage pack sales copy

A line is added to each voyage pack landing/hero (and to the v0.2 `/voyage-packs.html` landing page when built):

> Includes offline-capable emergency-contacts page that works without Wi-Fi at sea, on planes, or anywhere your family loses signal.

### Manifest considerations

- Confirm `/reaching-someone-at-sea.html` is included in `start_url` candidates so iOS/Android can pin it standalone if the user wants.
- Page must be reachable from the manifest's `scope` (it is — site root scope).

---

## Print and PDF download

### Buttons

**On `/reaching-someone-at-sea.html`** (no pack to scope against):
- `[Print this page]`
- `[Download as PDF]`

**On each voyage pack HTML page**, at the top of the new Emergency Contacts section:
- `[Print: just emergency contacts]`
- `[Print: the entire pack]`
- `[Download PDF: just emergency contacts]`
- `[Download PDF: the entire pack]`

### Print

- Native `window.print()` with `@media print` CSS.
- Scope toggled by adding a body class (`printing-emergency-only` or `printing-entire-pack`) before invoking print, then removing it after the print event.
- Print stylesheet: hides nav, TOC sidebar, swiper, footer chrome. Page-break sensibly between sections. Card prints on a single page when scoped to emergency-only.

### PDF

- `html2pdf.js` — chosen for client-side generation, no server, no privacy crossing. (`html2pdf.js` wraps `html2canvas` + `jsPDF`; if a future v0.2 needs more control, those underlying libraries are already on the page.)
- Library size ~150KB gzipped, **lazy-loaded** — only fetched when a PDF button is clicked, not on initial page load.
- Captures the same scoped content the print buttons would.
- Generated file name: `inthewake-emergency-contacts-[shipname]-[saildate].pdf` for emergency-only; `inthewake-voyage-pack-[shipname]-[saildate].pdf` for entire pack.
- localStorage card values are baked into the rendered PDF.

### What's removed from the original draft

- The proposed "Download as HTML" button is **removed entirely** — redundant with PWA automatic offline caching, which already does the same job better.

---

## Build order

| Step | Work | Rationale |
|---|---|---|
| 1 | Verify Royal Caribbean's three numbers (ship-to-shore family, flight assistance hotline, customer service main) to the same primary-source depth as the NCL pass. Append findings to `admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md`. | RCL detail is the only blocker for v0.1 Symphony pack updates. |
| 2 | Per-voyage-pack Emergency Contacts sections — v0.1.2 NCL Aqua (md + html) first, then v0.1 Symphony (md). Insert §6, renumber, delete duplicated content from old §6. | Source of truth lives in the packs; build there first. |
| 3 | Sitewide `/reaching-someone-at-sea.html` page using existing site CSS (`.wrap`, `.card`, `.prose`, `.hero-header`, color tokens). Five blocks per spec. ~900 words. Includes blank handoff card. | Free umbrella page can reference the per-pack sections. |
| 4 | Footer rollout — extend `admin/scripts/footer-rollout.py` to insert "Reaching someone at sea" link in the Help column. Re-run sitewide. | Pastoral exclusion already in place. |
| 5 | PWA precache addition — add new HTML files to service-worker manifest. Verify offline behavior with browser DevTools (Application → Service Workers → Offline). | One-line addition. |
| 6 | Print stylesheet, PDF generator wiring, localStorage card persistence, banner copy. | Self-contained client-side; lazy-loads `html2pdf.js`. |
| 7 | Voyage pack sales-copy mention of offline capability — add line to v0.1 + v0.1.2 hero blocks. | Surfaces the feature where buyers see it. |

## Verification before commit

1. `bash admin/validate-ship-page.sh` against the new sitewide page where applicable.
2. `lychee --config lychee.toml reaching-someone-at-sea.html` for link integrity.
3. Manual screen-reader pass over the handoff card to confirm form labels and tab order.
4. Print preview in Chrome and Safari — confirm one-page output for emergency-only scope.
5. Open the page with Wi-Fi disabled (after first load) — confirm offline behavior.
6. Voice audit pass against `admin/CTA-STYLE-GUIDE.md` — no banned vocabulary, no urgency framing.
7. Voyage-pack sections: grep for `#section-6` and `Section 6` and other numbered cross-references in both packs; renumber all references consistently.
8. PDF download test — confirm `[Download PDF: just emergency contacts]` produces a 1–2 page file with the card and contacts; `[Download PDF: the entire pack]` produces the full pack.
9. localStorage card test — fill the card, refresh the page, confirm values persist; click "Clear card" and confirm wipe.

## Commit cadence

One branch (`claude/review-docs-and-repo-ekA62`), separate atomic commits:

1. RCL number verification appended to fact-check log.
2. Per-voyage-pack Emergency Contacts sections (NCL Aqua + Symphony, md + html).
3. Sitewide `/reaching-someone-at-sea.html` page + footer rollout + service-worker precache.
4. Print + PDF + localStorage card wiring on both sitewide and pack pages.
5. Voyage-pack sales-copy mention of offline capability (v0.1 + v0.1.2 heroes).

## Out of scope (deferred)

- Adding more cruise lines to the per-voyage-pack scope — handled organically as new packs are written.
- Localizing the page — English only for v0.1.
- SMS/email "send to family" widget — privacy crossing; v0.2+ if at all.
- Rich PWA install-prompt UI for iOS — Apple's manual "Share → Add to Home Screen" flow has no programmatic prompt; a small instructional graphic suffices for v0.1.
- Server-side PDF generation — client-side PDF via html2pdf.js is sufficient and avoids any server, privacy, or auth surface.

---

## Pastoral guardrails (carried from `admin/claude/PASTORAL_GUARDRAILS.md`)

- No affiliate links anywhere on the sitewide page or in the per-pack section.
- No urgency-coded language ("act now," "must," "limited time").
- No fearful framing — page is calmly competent, not catastrophizing.
- No banned vocabulary from `admin/CTA-STYLE-GUIDE.md`.
- Block E ("When the news is the worst kind") honors pastoral surface rules — quiet, no promotion, no upsell.

## Voice and tone reference

- Brand-voice voice-DNA reference: existing voice-audit skill at `.claude/skills/voice-audit/`.
- Tone target: same as `/disability-at-sea.html` and `/internet-at-sea.html` — calm, factual, second-person where the audience benefits from direct address, third-person where systems are being explained.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Page becomes a crisis-tinted brand surface that contradicts the calm brand promise | Footer-only placement (not main nav); content is calm, not urgent; pastoral guardrails enforced |
| Per-pack section drifts out of sync with sitewide page if numbers change | Single canonical fact-check log (`admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md`) updated on every revision; quarterly check during W3 voice audits |
| PDF library bloat slows the page | `html2pdf.js` lazy-loaded only on button click |
| Family handoff card includes sensitive data (passport, DOB) and could leak | Inline privacy framing; localStorage scoped to device; "Clear card" button; no server transmission |
| Numbers shift again (cruise-line policy changes; embassy moves) | `last-reviewed` meta tag on the sitewide page; quarterly content-freshness audit covers it |
| Building the sitewide directory tempts mission creep into a 12-line phone book | Spec explicitly forbids comprehensive cruise-line directory on the sitewide page; per-itinerary detail lives only in voyage packs |
