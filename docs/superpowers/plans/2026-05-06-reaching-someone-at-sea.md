# Reaching Someone at Sea — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a free sitewide `/reaching-someone-at-sea.html` page plus a new dedicated *Emergency Contacts* section in each voyage pack, with a fillable family handoff card persisted to localStorage, automatic PWA offline capability, print + scoped client-side PDF downloads.

**Architecture:** Free umbrella page covers universal/decision-tree material; per-voyage-pack section is the source-of-truth for line + port specifics. Shared CSS/JS modules (`handoff-card.css`, `handoff-card.js`, `pdf-download.js`) keep behavior consistent across both surfaces. PWA caches automatically via the existing service-worker pattern; no manual download buttons. PDF generation uses lazy-loaded `html2pdf.js`.

**Tech Stack:** Static HTML/CSS/JS; no framework. Existing service worker at `/sw.js` (v14.3.0) + precache manifest at `/precache-manifest.json`. Existing CSS tokens: `--sea`, `--foam`, `--rope`, `--ink`, `--accent`. Existing footer-migration utility at `admin/scripts/footer-rollout.py`. `html2pdf.js` from cdn.jsdelivr.net (already an allowed CDN per service-worker fetch handler).

**Branch:** `claude/review-docs-and-repo-ekA62` (current).
**Spec:** `docs/superpowers/specs/2026-05-06-reaching-someone-at-sea-design.md` (committed `f27634ae`).

---

## File Structure

### Files created

| Path | Purpose |
|---|---|
| `reaching-someone-at-sea.html` | Free sitewide page; 5 blocks per spec |
| `assets/css/handoff-card.css` | Shared screen styling for the fillable card on sitewide + per-pack pages |
| `assets/css/handoff-card-print.css` | `@media print` rules for the card and the two print-scope modes |
| `assets/js/handoff-card.js` | localStorage persistence + Clear-card button + print-scope toggle |
| `assets/js/pdf-download.js` | Lazy-loads html2pdf.js on first PDF-button click and dispatches by scope |

### Files modified

| Path | Change |
|---|---|
| `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md` | Insert §6 Emergency Contacts; renumber Practical Logistics → §7 + downstream; delete duplicated embassy/cruise-line bullets from old §6 |
| `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html` | Same as above + fillable card form, print/PDF buttons, link to handoff-card assets |
| `admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md` | Insert §6 Emergency Contacts; renumber; delete duplicates |
| `admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md` | Append RCL number verification findings |
| `admin/scripts/footer-rollout.py` | Add `<a href="/reaching-someone-at-sea.html">Reach Family at Sea</a>` insertion in Help column |
| `precache-manifest.json` | Add `/reaching-someone-at-sea.html` to `pages` array (priority `normal`) |

### Files NOT touched

- Any pastoral file (`/solo/*`, grief-tagged articles): pastoral-exclusion preserved by footer-rollout.py
- `/sw.js` itself: precache list lives in the manifest, not the SW
- `manifest.webmanifest`: existing `start_url: /stateroom-check.html` stays; this page is reachable from scope `/`

---

## Task 1: Verify Royal Caribbean's three contact numbers

**Files:**
- Modify: `admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md`

**Why:** v0.1 Symphony pack's new Emergency Contacts section needs RCL-verified numbers at the same primary-source depth as the NCL pass. Three numbers needed: ship-to-shore family contact, flight-assistance hotline, customer-service main line.

- [ ] **Step 1: Run web searches against authoritative sources**

Run four parallel web searches:
1. `Royal Caribbean ship to shore family emergency contact phone number`
2. `Royal Caribbean Air2Sea flight assistance hotline phone number`
3. `Royal Caribbean customer service main phone number 2026`
4. `Royal Caribbean reach guest onboard ship from US`

Capture: official URL, exact phone string, any business-hours qualifier, the date the source page was last updated.

- [ ] **Step 2: Cross-check with one independent source per number**

For each number, check at least one of: Cruise Critic editorial, Royal Caribbean Blog, Cruzely. Flag any mismatch as `⏳ unable to confirm` and hedge in the pack rather than guessing.

- [ ] **Step 3: Append findings to the fact-check log**

Open `admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md`. After the "Items Verified But NOT Changed" section, add a new section:

```markdown
---

## Royal Caribbean — appended 2026-05-06 (for v0.1 Symphony Emergency Contacts section)

| Claim | Source check | Verdict |
|---|---|---|
| Ship-to-shore family contact (US toll-free) | [primary source URL] | [✅ verified / ⚠️ corrected: Xxx → Yyy / ⏳ unable to confirm] |
| Flight-assistance hotline (Air2Sea) | [primary source URL] | [verdict] |
| Customer service main line | [primary source URL] | [verdict] |

Notes: [any caveats — business hours, US-only, etc.]
```

Replace each `[primary source URL]` and `[verdict]` placeholder with the actual finding from Steps 1–2.

- [ ] **Step 4: Commit**

```bash
git add admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md
git commit -m "voyage-packs: verify Royal Caribbean contact numbers for v0.1 emergency contacts section

Appended to existing fact-check log. Three numbers verified against
Royal Caribbean's official Help/FAQ pages with one independent
cross-check per number. Numbers feed into the new Emergency Contacts
section being added to v0.1 Symphony Western Caribbean pack.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 2: Create the shared handoff-card CSS module

**Files:**
- Create: `assets/css/handoff-card.css`

**Why:** Same card styling on the sitewide page and inside each voyage pack. Single CSS file, no framework, uses existing site CSS tokens.

- [ ] **Step 1: Create the file**

Write `/home/user/InTheWake/assets/css/handoff-card.css`:

```css
/* In the Wake — Family Handoff Card
 * Shared between /reaching-someone-at-sea.html and per-voyage-pack pages.
 * Soli Deo Gloria.
 */

.handoff-card {
  background: var(--foam, #e6f4f8);
  border: 2px solid var(--sea, #0a3d62);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.handoff-card h3 {
  margin-top: 0;
  color: var(--ink, #083041);
  font-size: 1.1rem;
}

.handoff-card .card-intro {
  font-size: 0.95rem;
  color: var(--ink, #083041);
  margin-bottom: 1rem;
}

.handoff-card .card-privacy {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--ink, #083041);
  background: rgba(255,255,255,0.5);
  padding: 0.5rem 0.75rem;
  border-left: 3px solid var(--accent, #0e6e8e);
  margin: 0.75rem 0 1rem;
}

.handoff-card .card-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin: 0.5rem 0;
  align-items: baseline;
}

.handoff-card label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink, #083041);
  min-width: 14rem;
}

.handoff-card input[type="text"] {
  flex: 1;
  min-width: 12rem;
  padding: 0.35rem 0.5rem;
  border: 0;
  border-bottom: 1px solid var(--sea, #0a3d62);
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--ink, #083041);
}

.handoff-card input[type="text"]:focus {
  outline: 2px solid var(--accent, #0e6e8e);
  outline-offset: 2px;
  background: rgba(255,255,255,0.6);
}

.handoff-card .card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--sea, #0a3d62);
}

.handoff-card button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--sea, #0a3d62);
  background: white;
  color: var(--ink, #083041);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.handoff-card button:hover,
.handoff-card button:focus {
  background: var(--sea, #0a3d62);
  color: white;
}

.handoff-card button.clear {
  border-color: #999;
  color: #666;
}

/* Offline banner used near the card on every page that hosts it */
.offline-banner {
  background: rgba(217, 179, 130, 0.18); /* --rope at low opacity */
  border-left: 3px solid var(--rope, #d9b382);
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  font-size: 0.95rem;
  color: var(--ink, #083041);
}
```

- [ ] **Step 2: Verify the file was created and has the expected size**

```bash
wc -l /home/user/InTheWake/assets/css/handoff-card.css
```

Expected: ~85 lines.

- [ ] **Step 3: Commit (deferred — combine with Task 3)**

This file is committed together with Task 3's JS module in one atomic commit (see Task 3 final step).

---

## Task 3: Create the handoff-card JS module (localStorage persistence)

**Files:**
- Create: `assets/js/handoff-card.js`

**Why:** Persist the card values across visits, keyed per page so the sitewide blank card and each pack's pre-populated card don't collide. No server, no auth.

- [ ] **Step 1: Create the file**

Write `/home/user/InTheWake/assets/js/handoff-card.js`:

```javascript
/* In the Wake — Family Handoff Card persistence
 * Saves filled fields to localStorage scoped by page identifier.
 * No server, no auth, no cross-device sync. Values stay on this device only.
 * Soli Deo Gloria.
 */

(function () {
  'use strict';

  function init() {
    const card = document.querySelector('.handoff-card');
    if (!card) return;

    const storageKey = card.dataset.storageKey;
    if (!storageKey) {
      console.warn('[handoff-card] missing data-storage-key on .handoff-card');
      return;
    }

    const inputs = card.querySelectorAll('input[type="text"]');

    // Restore saved values
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      inputs.forEach(input => {
        if (input.name && saved[input.name] !== undefined) {
          input.value = saved[input.name];
        }
      });
    } catch (e) {
      // Ignore corrupt localStorage; treat as empty
    }

    // Save on input
    function save() {
      const data = {};
      inputs.forEach(input => {
        if (input.name) data[input.name] = input.value;
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        // Quota exceeded or storage disabled — fail silently
      }
    }

    inputs.forEach(input => {
      input.addEventListener('input', save);
      input.addEventListener('change', save);
    });

    // Wire the Clear button
    const clearBtn = card.querySelector('button.clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!confirm('Clear all the fields on this card? This cannot be undone.')) return;
        inputs.forEach(input => { input.value = ''; });
        try { localStorage.removeItem(storageKey); } catch (e) {}
      });
    }

    // Wire the print buttons. Each print button has data-print-scope
    // ("emergency-only" or "entire-pack" or "page").
    card.querySelectorAll('button[data-print-scope]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scope = btn.dataset.printScope;
        document.body.classList.add('printing-' + scope);
        // Run print after the class lands; remove class after print dialog closes
        setTimeout(() => {
          window.print();
          // Browsers fire afterprint when the print dialog closes
          const cleanup = () => {
            document.body.classList.remove('printing-' + scope);
            window.removeEventListener('afterprint', cleanup);
          };
          window.addEventListener('afterprint', cleanup);
        }, 50);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Verify the file was created**

```bash
wc -l /home/user/InTheWake/assets/js/handoff-card.js
```

Expected: ~70 lines.

- [ ] **Step 3: Commit Tasks 2 + 3 together**

```bash
git add assets/css/handoff-card.css assets/js/handoff-card.js
git commit -m "feat: shared handoff-card CSS + JS persistence module

CSS uses existing site tokens (--sea, --foam, --rope, --ink, --accent).
JS scopes localStorage by data-storage-key so the sitewide blank card
and each voyage-pack pre-populated card stay independent.

No server, no auth, no cross-device sync. Print buttons toggle a
body class so @media print rules can scope output to either the
emergency-contacts section only, the entire pack, or the full page.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 4: Create the print stylesheet (scoped output modes)

**Files:**
- Create: `assets/css/handoff-card-print.css`

**Why:** Three print scopes — `printing-emergency-only`, `printing-entire-pack`, `printing-page`. Each scope applies a body class; CSS hides everything outside that scope.

- [ ] **Step 1: Create the file**

Write `/home/user/InTheWake/assets/css/handoff-card-print.css`:

```css
/* In the Wake — Emergency Contacts print stylesheet
 * Three scopes via body classes set by handoff-card.js:
 *   .printing-emergency-only — print only the #emergency-contacts section + the universal 24/7 line
 *   .printing-entire-pack    — print the whole voyage pack, hide nav and TOC sidebar
 *   .printing-page           — print the whole sitewide page, hide nav
 * Soli Deo Gloria.
 */

@media print {
  /* Universal print hygiene */
  nav, .vp-toc, .vp-host-ribbon, .swiper, .offline-banner,
  .handoff-card .card-actions, .footer-cta, .skip-link {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
    font-size: 11pt;
    line-height: 1.4;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    color: #555;
  }

  .handoff-card {
    background: transparent !important;
    border: 1px solid #333 !important;
    page-break-inside: avoid;
  }

  .handoff-card input[type="text"] {
    border-bottom: 1px solid #333 !important;
    background: transparent !important;
    color: black !important;
  }

  /* Emergency-only scope: hide everything outside the emergency contacts section */
  body.printing-emergency-only > *:not(#emergency-contacts):not(.universal-247) {
    display: none !important;
  }
  body.printing-emergency-only #emergency-contacts {
    display: block !important;
  }

  /* Entire-pack scope: hide nav and sidebar but keep all sections */
  body.printing-entire-pack .vp-toc,
  body.printing-entire-pack header.site-header,
  body.printing-entire-pack .swiper {
    display: none !important;
  }

  /* Page scope (sitewide): hide site nav and footer chrome but keep page content */
  body.printing-page header.site-header,
  body.printing-page footer.site-footer-meta {
    display: none !important;
  }
}
```

- [ ] **Step 2: Verify**

```bash
wc -l /home/user/InTheWake/assets/css/handoff-card-print.css
```

Expected: ~55 lines.

- [ ] **Step 3: Commit (deferred — combine with Task 5)**

---

## Task 5: Create the PDF download module (lazy-loaded html2pdf)

**Files:**
- Create: `assets/js/pdf-download.js`

**Why:** PDF generation is opt-in via button click. html2pdf.js is ~150KB gzipped — lazy-load only on first PDF button click so it doesn't slow page load.

- [ ] **Step 1: Create the file**

Write `/home/user/InTheWake/assets/js/pdf-download.js`:

```javascript
/* In the Wake — PDF download for emergency contacts and voyage packs
 * Lazy-loads html2pdf.js from cdn.jsdelivr.net only when a PDF button
 * is first clicked. Three scopes per page:
 *   data-pdf-scope="emergency-only" — just the #emergency-contacts section
 *   data-pdf-scope="entire-pack"    — the entire voyage-pack page
 *   data-pdf-scope="page"           — the full sitewide page
 * Soli Deo Gloria.
 */

(function () {
  'use strict';

  const HTML2PDF_CDN = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/dist/html2pdf.bundle.min.js';
  let loaderPromise = null;

  function loadHtml2Pdf() {
    if (loaderPromise) return loaderPromise;
    loaderPromise = new Promise((resolve, reject) => {
      if (window.html2pdf) return resolve(window.html2pdf);
      const script = document.createElement('script');
      script.src = HTML2PDF_CDN;
      script.async = true;
      script.onload = () => resolve(window.html2pdf);
      script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
      document.head.appendChild(script);
    });
    return loaderPromise;
  }

  function getScopeElement(scope) {
    if (scope === 'emergency-only') {
      return document.getElementById('emergency-contacts');
    }
    if (scope === 'entire-pack' || scope === 'page') {
      return document.querySelector('main') || document.body;
    }
    return null;
  }

  function getFilename(scope) {
    const meta = document.querySelector('meta[name="vp-filename-base"]');
    const base = meta ? meta.content : 'inthewake-handoff';
    if (scope === 'emergency-only') return base + '-emergency-contacts.pdf';
    if (scope === 'entire-pack') return base + '-voyage-pack.pdf';
    return 'inthewake-reaching-someone-at-sea.pdf';
  }

  async function downloadPdf(scope, button) {
    const element = getScopeElement(scope);
    if (!element) {
      alert('Could not find the section to download. Please reload the page and try again.');
      return;
    }

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'Preparing PDF…';

    try {
      const html2pdf = await loadHtml2Pdf();
      const opts = {
        margin: 0.5,
        filename: getFilename(scope),
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await html2pdf().from(element).set(opts).save();
    } catch (err) {
      console.error('[pdf-download]', err);
      alert('Could not generate PDF. You can use Print → Save as PDF as a fallback.');
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  function init() {
    document.querySelectorAll('button[data-pdf-scope]').forEach(btn => {
      btn.addEventListener('click', () => downloadPdf(btn.dataset.pdfScope, btn));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Verify**

```bash
wc -l /home/user/InTheWake/assets/js/pdf-download.js
```

Expected: ~75 lines.

- [ ] **Step 3: Commit Tasks 4 + 5 together**

```bash
git add assets/css/handoff-card-print.css assets/js/pdf-download.js
git commit -m "feat: print stylesheet + lazy-loaded PDF download module

Print stylesheet supports three scopes (emergency-only / entire-pack /
page) toggled by body class set in handoff-card.js. PDF download
lazy-loads html2pdf.js from cdn.jsdelivr.net only on first button
click; CDN already allow-listed in sw.js fetch handler.

Files generate as inthewake-{base}-{scope}.pdf via the vp-filename-base
meta tag the voyage-pack pages set.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 6: Canonical Emergency Contacts section — markdown source

**Why:** Both voyage-pack markdown files use the same eight-block structure. Each pack inserts a tailored copy of this canonical block as **§6 Emergency Contacts**, between the existing §5 Pre-Cruise Countdown and the existing §6 Practical Logistics (which becomes §7).

The block below is a **template**. Tasks 7 (NCL Aqua) and 8 (Symphony) substitute the bracketed `{{LINE}}-{{ITINERARY}}` placeholders with the verified per-pack values.

```markdown
## Section 6 — Emergency Contacts

If you're reading this in a crisis, the numbers below are the right calls in priority order. Skip to the bold State Department line below if you don't know where to start. If you're the cruiser preparing for the trip, fill in the handoff card and share it with one trusted person ashore before sailing. Numbers verified 2026-05-06; cruise-line numbers occasionally change with promotional cycles — confirm yours on your booking confirmation.

> **This page is part of In the Wake's offline-capable PWA.** After your first visit, it works without Wi-Fi — even at sea, in port, or anywhere your family member loses signal.

### The family handoff card

*Fill in before sailing. Share with one trusted person ashore.*
*Privacy note: passport number and date of birth are sensitive — share with someone you fully trust, and don't email this card unencrypted.*

```
Cruiser's full legal name (as on passport): ______________________
Date of birth: ______________________
Passport number: ______________________
Cruiser's mobile (Wi-Fi calling at sea): ______________________

Cruise line: {{CRUISE_LINE}}
Ship name: {{SHIP_NAME}}
Sailing date: {{SAIL_DATE}}
Disembark date: {{DISEMBARK_DATE}}
Booking / reservation number: ______________________
Stateroom / cabin number: ______________________

Travel insurance company: ______________________
Policy number: ______________________
24-hour assistance line: ______________________

Group host (if applicable): {{GROUP_HOST}}
Group host contact: {{GROUP_HOST_CONTACT}}

Pre-cruise outbound flight (airline + flight number + date): ______________________
Pre-cruise return flight (airline + flight number + date): ______________________

Anything to share in a medical situation
(allergies, medications, conditions, advance directive on file): ______________________

Trusted contact at home (cruiser's records):
Name: __________  Phone: __________  Relationship: __________
```

### Universal 24/7 line — the right call when in doubt

**U.S. State Department, Overseas Citizens Services**
- From the U.S. or Canada: **+1-888-407-4747**
- From abroad: **+1-202-501-4444**
- Available 24 hours a day, every day. They can locate the ship, contact the cruise line on the family's behalf, and coordinate consular services if the situation is in port.

### Cruise-line numbers ({{CRUISE_LINE}})

The State Department line above is the right call for a true at-sea emergency. The cruise-line numbers below are useful for non-emergency communication (relaying a non-urgent message to the ship, pre-cruise flight delays, billing or booking questions). Per the cruise line's own published documentation, **{{CRUISE_LINE}} does not publish a separate free 24/7 emergency family-contact desk** — the ship-phone numbers below are paid relays that connect a caller to the ship's onboard phone system.

- **Ship-phone relay (paid, non-emergency communication):** {{SHIP_TO_SHORE_LINE}}. Per {{CRUISE_LINE}}'s official FAQ, this requires a major credit card; per-minute rates apply. Use this for non-urgent messages, not for delivering crisis news. The State Department line is faster and free for true emergencies.
- **Pre-cruise flight assistance (24/7):** {{FLIGHT_HOTLINE}}
- **Customer service / general inquiries:** {{CUSTOMER_SERVICE}}

For in-port emergencies the ship's port agent is reachable through the cruise line's customer-service desk; the agent's name and direct number for each port appear in the daily program once you board.

### U.S. embassies and consulates — this itinerary's ports

{{PER_PORT_BLOCK}}

### What each authority will need from you

Have these ready before you call. It cuts panic-call confusion in half.

**Calling the State Department:** ship name, sailing date, full legal name of the person aboard, your name, your relationship to them, what you know about the situation.

**Calling the cruise line ship-to-shore:** booking number, ship name, sailing date, full legal name of the person aboard, cabin number if assigned, your name, your relationship.

**Calling an embassy or consulate from a port:** your full name (you the caller), passport number if you're abroad, where you are physically right now, what you need, whether anyone is hurt.

### Decision tree — which call do I make?

- **Medical emergency at sea** → State Department first; they coordinate with the cruise line.
- **Missing person at sea** → State Department; the Cruise Vessel Security and Safety Act of 2010 requires the cruise line to log incidents and report to the FBI.
- **Port-side emergency** → local emergency services first; embassy/consulate second; State Department third.
- **Pre-cruise flight delay** → the cruise line's flight assistance hotline above.
- *Don't call 911 — it can't reach a ship in international waters.*
- *Don't call the cruise line's general booking line — it routes to sales, not emergencies.*

### Where to go next

- For the deeper systems explanation (how port agents work, what CVSSA 2010 requires of cruise lines, why ship-to-shore numbers vary by line), see [/reaching-someone-at-sea.html](/reaching-someone-at-sea.html).
{{GROUP_HOST_LINK_LINE}}
```

- [ ] **Step 1: No file action — this task defines the canonical content used by Tasks 7 and 8.**

The placeholders this template uses (substituted in the next two tasks):
- `{{CRUISE_LINE}}` — e.g., `Norwegian Cruise Line (NCL)` or `Royal Caribbean`
- `{{SHIP_NAME}}` — e.g., `Norwegian Aqua`
- `{{SAIL_DATE}}`, `{{DISEMBARK_DATE}}` — pre-filled where the pack already knows them; blank lines where it doesn't
- `{{GROUP_HOST}}`, `{{GROUP_HOST_CONTACT}}` — only present in v0.1.2 (Tina); replace with empty fillable line in v0.1
- `{{SHIP_TO_SHORE_LINE}}` — single combined string with the line's published ship-phone numbers and any paid-per-minute caveats (NCL: 1-888-627-4477 paid; RCL: 888-724-7447 / 321-953-9003 paid). Both lines publish only paid relays — there is no free emergency family-contact desk for either; the State Dept block above is the genuine emergency call.
- `{{FLIGHT_HOTLINE}}` — line-specific (NCL 1-800-456-7179; RCL Air2Sea 844-278-9745)
- `{{CUSTOMER_SERVICE}}` — line-specific; for RCL this is multi-line (general / reservations / international day-of-sailing)
- `{{PER_PORT_BLOCK}}` — bulleted list of embassies for *that itinerary's ports only*
- `{{GROUP_HOST_LINK_LINE}}` — `- For group-cruise coordination, contact [Host Name](contact).` in v0.1.2; omitted in v0.1

No commit yet — content is committed when applied to a pack in Task 7 or Task 8.

---

## Task 7: Add Emergency Contacts section to v0.1.2 NCL Aqua pack (md + html)

**Files:**
- Modify: `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md`
- Modify: `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html`

**Why:** Promote scattered embassy/cruise-line content into a dedicated, anchorable, fillable section. Renumber Practical Logistics from §6 to §7.

### Per-pack substitutions for v0.1.2

| Placeholder | Value |
|---|---|
| `{{CRUISE_LINE}}` | `Norwegian Cruise Line (NCL)` |
| `{{SHIP_NAME}}` | `Norwegian Aqua` |
| `{{SAIL_DATE}}` | `Sunday, December 12, 2027` |
| `{{DISEMBARK_DATE}}` | `Sunday, December 19, 2027` |
| `{{GROUP_HOST}}` | `Tina Maulsby, Maulsby Travel Co.` |
| `{{GROUP_HOST_CONTACT}}` | `tina@maulsbytravel.com · 910-528-5077` |
| `{{SHIP_TO_SHORE_LINE}}` | `**1-888-627-4477** from U.S./Canada (per [NCL's official FAQ](https://www.ncl.com/faq/how-do-you-contact-someone-cruise-ship)). International callers: confirm via your booking confirmation, as NCL does not publish a separate international ship-phone number on its primary FAQ. ⏳` |
| `{{FLIGHT_HOTLINE}}` | `1-800-456-7179 (24/7 from U.S./Canada — flight delays before boarding only)` |
| `{{CUSTOMER_SERVICE}}` | `1-866-234-7350 (Mon–Fri 9 AM – 5:30 PM ET; not for at-sea emergencies)` |
| `{{GROUP_HOST_LINK_LINE}}` | `- For group-cruise coordination, contact [Tina Maulsby](mailto:tina@maulsbytravel.com).` |

`{{PER_PORT_BLOCK}}` for v0.1.2 (canonical from fact-check log):

```markdown
- **Bahamas (U.S. Embassy, Nassau)** — Great Stirrup Cay falls under Bahamian jurisdiction.
  - Phone: +1-242-461-5025 (24/7; press option 1 for emergencies)
  - Address: 235 Shirley Street, Nassau
- **Jamaica (U.S. Embassy, Kingston)** — for Ocho Rios.
  - Phone: +1-876-702-6000 (24/7 for U.S.-citizen emergencies)
  - Address: 142 Old Hope Road, Kingston 6
- **Cayman Islands (U.S. Consular Agency, George Town)**
  - Business hours: +1-345-747-8172 (Mon–Fri 8 AM – 2 PM)
  - After-hours: routes through U.S. Embassy Kingston, Jamaica at +1-876-702-6000
- **Mexico (U.S. Consulate General, Mérida)** — covers Cozumel.
  - Phone: +52-999-689-0660 from Mexico, or 011-52-999-689-0660 from the U.S.
  - The ship's port agent can also reach the consular agent quickly for cruise-port emergencies.
```

- [ ] **Step 1: Open the markdown file and find the Section 5/6 boundary**

```bash
grep -n "^## Section " /home/user/InTheWake/admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md
```

Expected output identifies the line numbers of every section header. Confirm §5 Pre-Cruise Countdown and §6 Practical Logistics are adjacent.

- [ ] **Step 2: Insert the new §6 Emergency Contacts section**

Use Edit to find the existing `## Section 6 — Practical Logistics` heading and insert the canonical template (with the v0.1.2 substitutions above) immediately *before* it. After insertion, the file order should read:

```
## Section 5 — Pre-Cruise Countdown
...
## Section 6 — Emergency Contacts
... (the new content) ...
## Section 6 — Practical Logistics  ← will be renumbered in Step 3
```

- [ ] **Step 3: Renumber every later section**

Use Edit with `replace_all: true` for each rename, in this order (high to low to avoid double-renames):

```
"## Section 11 —" → "## Section 12 —"
"## Section 10 —" → "## Section 11 —"
"## Section 9 —"  → "## Section 10 —"
"## Section 8 —"  → "## Section 9 —"
"## Section 7 —"  → "## Section 8 —"
"## Section 6 — Practical Logistics" → "## Section 7 — Practical Logistics"
```

(The new "## Section 6 — Emergency Contacts" inserted in Step 2 stays as §6.)

Then renumber any in-text cross-references:

```bash
grep -n "Section [0-9]" /home/user/InTheWake/admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md
```

For each match, decide whether the reference points to a section that moved. Update individually. Common cross-references include "see Section 6" pointing to Practical Logistics — those become "see Section 7."

- [ ] **Step 4: Delete duplicated embassy + cruise-line bullets from the new §7 (was §6)**

In the new §7 Practical Logistics, find and delete:
- The five-bullet embassy list (the lines beginning with `- **Bahamas (U.S. Embassy, Nassau):**`, `Jamaica`, `Cayman`, `Mexico`, `From anywhere`)
- The "Share your itinerary before sailing" paragraph's NCL ship-to-shore phone-number block (the parenthetical *"NCL's ship-to-shore emergency family contact (toll-free from the U.S./Canada: +1-833-810-7963…)"*)

Replace each with a single line: `See [Section 6 — Emergency Contacts](#section-6-emergency-contacts) for the full contact list and the family handoff card.`

- [ ] **Step 5: Update the HTML version**

Open `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html`. Apply the same insertions and renumbering as Steps 2–4, but the §6 Emergency Contacts block becomes a `<section id="emergency-contacts">` with HTML markup. The fillable card uses real `<input>` elements:

```html
<section id="emergency-contacts" class="card">
  <h2>Section 6 — Emergency Contacts</h2>
  <p>If you're reading this in a crisis, the numbers below are the right calls in priority order. Skip to the bold State Department line below if you don't know where to start. If you're the cruiser preparing for the trip, fill in the handoff card and share it with one trusted person ashore before sailing. Numbers verified 2026-05-06; cruise-line numbers occasionally change with promotional cycles — confirm yours on your booking confirmation.</p>

  <div class="offline-banner">
    <strong>This page is part of In the Wake's offline-capable PWA.</strong>
    After your first visit, it works without Wi-Fi — even at sea, in port, or anywhere your family member loses signal.
  </div>

  <h3>The family handoff card</h3>
  <div class="handoff-card" data-storage-key="inthewake-handoff-v0.1.2">
    <p class="card-intro">Fill in before sailing. Share with one trusted person ashore.</p>
    <p class="card-privacy">Privacy note: passport number and date of birth are sensitive — share with someone you fully trust, and don't email this card unencrypted.</p>

    <div class="card-row"><label for="hc-name">Cruiser's full legal name (as on passport):</label><input type="text" id="hc-name" name="legal_name"/></div>
    <div class="card-row"><label for="hc-dob">Date of birth:</label><input type="text" id="hc-dob" name="dob"/></div>
    <div class="card-row"><label for="hc-passport">Passport number:</label><input type="text" id="hc-passport" name="passport"/></div>
    <div class="card-row"><label for="hc-mobile">Cruiser's mobile (Wi-Fi calling at sea):</label><input type="text" id="hc-mobile" name="mobile"/></div>

    <div class="card-row"><label>Cruise line:</label><span>Norwegian Cruise Line (NCL)</span></div>
    <div class="card-row"><label>Ship name:</label><span>Norwegian Aqua</span></div>
    <div class="card-row"><label>Sailing date:</label><span>Sunday, December 12, 2027</span></div>
    <div class="card-row"><label>Disembark date:</label><span>Sunday, December 19, 2027</span></div>
    <div class="card-row"><label for="hc-booking">Booking / reservation number:</label><input type="text" id="hc-booking" name="booking"/></div>
    <div class="card-row"><label for="hc-cabin">Stateroom / cabin number:</label><input type="text" id="hc-cabin" name="cabin"/></div>

    <div class="card-row"><label for="hc-ins-co">Travel insurance company:</label><input type="text" id="hc-ins-co" name="ins_company"/></div>
    <div class="card-row"><label for="hc-ins-policy">Policy number:</label><input type="text" id="hc-ins-policy" name="ins_policy"/></div>
    <div class="card-row"><label for="hc-ins-phone">24-hour assistance line:</label><input type="text" id="hc-ins-phone" name="ins_phone"/></div>

    <div class="card-row"><label>Group host:</label><span>Tina Maulsby, Maulsby Travel Co.</span></div>
    <div class="card-row"><label>Group host contact:</label><span>tina@maulsbytravel.com · 910-528-5077</span></div>

    <div class="card-row"><label for="hc-flt-out">Outbound flight (airline + number + date):</label><input type="text" id="hc-flt-out" name="flight_out"/></div>
    <div class="card-row"><label for="hc-flt-ret">Return flight (airline + number + date):</label><input type="text" id="hc-flt-ret" name="flight_ret"/></div>

    <div class="card-row"><label for="hc-medical">Medical info to share if needed:</label><input type="text" id="hc-medical" name="medical"/></div>

    <div class="card-row"><label for="hc-trusted-name">Trusted contact at home — name:</label><input type="text" id="hc-trusted-name" name="trusted_name"/></div>
    <div class="card-row"><label for="hc-trusted-phone">Trusted contact — phone:</label><input type="text" id="hc-trusted-phone" name="trusted_phone"/></div>
    <div class="card-row"><label for="hc-trusted-rel">Trusted contact — relationship:</label><input type="text" id="hc-trusted-rel" name="trusted_rel"/></div>

    <div class="card-actions">
      <button type="button" data-print-scope="emergency-only">Print: just emergency contacts</button>
      <button type="button" data-print-scope="entire-pack">Print: the entire pack</button>
      <button type="button" data-pdf-scope="emergency-only">Download PDF: just emergency contacts</button>
      <button type="button" data-pdf-scope="entire-pack">Download PDF: the entire pack</button>
      <button type="button" class="clear">Clear card</button>
    </div>
  </div>

  <h3 class="universal-247">Universal 24/7 line — the right call when in doubt</h3>
  <p class="universal-247"><strong>U.S. State Department, Overseas Citizens Services</strong></p>
  <ul class="universal-247">
    <li>From the U.S. or Canada: <strong>+1-888-407-4747</strong></li>
    <li>From abroad: <strong>+1-202-501-4444</strong></li>
    <li>Available 24 hours a day, every day. They can locate the ship, contact the cruise line on the family's behalf, and coordinate consular services if the situation is in port.</li>
  </ul>

  <h3>Cruise-line numbers (Norwegian Cruise Line)</h3>
  <p>The State Department line above is the right call for a true at-sea emergency. The numbers below are useful for non-emergency communication. <strong>Per NCL's own FAQ, NCL does not publish a separate free 24/7 emergency family-contact desk</strong> — its ship-phone number is a paid relay that connects a caller to the ship's onboard phone system.</p>
  <ul>
    <li><strong>Ship-phone relay (paid, non-emergency communication):</strong> <strong>1-888-627-4477</strong> from U.S./Canada (per <a href="https://www.ncl.com/faq/how-do-you-contact-someone-cruise-ship">NCL's official FAQ</a> — "You will need to pay with a MasterCard, Visa, or American Express"; per-minute rate applies). International callers: confirm via your booking confirmation. Use this for non-urgent messages, not for delivering crisis news.</li>
    <li><strong>Pre-cruise flight assistance (24/7):</strong> 1-800-456-7179</li>
    <li><strong>Customer service / general inquiries:</strong> 1-866-234-7350 (Mon–Fri 9 AM – 5:30 PM ET; not for at-sea emergencies)</li>
  </ul>
  <p>For in-port emergencies the ship's port agent is reachable through the cruise line's customer-service desk; the agent's name and direct number for each port appear in the daily program once you board.</p>

  <h3>U.S. embassies and consulates — this itinerary's ports</h3>
  <ul>
    <li><strong>Bahamas (U.S. Embassy, Nassau)</strong> — Great Stirrup Cay falls under Bahamian jurisdiction.<br/>+1-242-461-5025 (24/7; press option 1 for emergencies). Address: 235 Shirley Street, Nassau.</li>
    <li><strong>Jamaica (U.S. Embassy, Kingston)</strong> — for Ocho Rios.<br/>+1-876-702-6000 (24/7 for U.S.-citizen emergencies). Address: 142 Old Hope Road, Kingston 6.</li>
    <li><strong>Cayman Islands (U.S. Consular Agency, George Town):</strong> +1-345-747-8172 (Mon–Fri 8 AM – 2 PM). After-hours: routes through U.S. Embassy Kingston at +1-876-702-6000.</li>
    <li><strong>Mexico (U.S. Consulate General, Mérida)</strong> — covers Cozumel. +52-999-689-0660 from Mexico, or 011-52-999-689-0660 from the U.S.</li>
  </ul>

  <h3>What each authority will need from you</h3>
  <p><strong>Calling the State Department:</strong> ship name, sailing date, full legal name of the person aboard, your name, your relationship to them, what you know about the situation.</p>
  <p><strong>Calling the cruise line ship-to-shore:</strong> booking number, ship name, sailing date, full legal name of the person aboard, cabin number if assigned, your name, your relationship.</p>
  <p><strong>Calling an embassy or consulate from a port:</strong> your full name, passport number if you're abroad, where you are physically right now, what you need, whether anyone is hurt.</p>

  <h3>Decision tree — which call do I make?</h3>
  <ul>
    <li><strong>Medical emergency at sea</strong> → State Department first; they coordinate with the cruise line.</li>
    <li><strong>Missing person at sea</strong> → State Department; the Cruise Vessel Security and Safety Act of 2010 requires the cruise line to log incidents and report to the FBI.</li>
    <li><strong>Port-side emergency</strong> → local emergency services first; embassy/consulate second; State Department third.</li>
    <li><strong>Pre-cruise flight delay</strong> → the cruise line's flight assistance hotline above.</li>
    <li><em>Don't call 911 — it can't reach a ship in international waters.</em></li>
    <li><em>Don't call the cruise line's general booking line — it routes to sales, not emergencies.</em></li>
  </ul>

  <h3>Where to go next</h3>
  <ul>
    <li>For the deeper systems explanation, see <a href="/reaching-someone-at-sea.html">/reaching-someone-at-sea.html</a>.</li>
    <li>For group-cruise coordination, contact <a href="mailto:tina@maulsbytravel.com">Tina Maulsby</a>.</li>
  </ul>
</section>
```

- [ ] **Step 6: Wire the shared assets in the HTML `<head>`**

Add inside `<head>` (after the existing stylesheet links):

```html
<link rel="stylesheet" href="/assets/css/handoff-card.css"/>
<link rel="stylesheet" href="/assets/css/handoff-card-print.css"/>
<meta name="vp-filename-base" content="inthewake-norwegian-aqua-2027-12-12"/>
```

Add before `</body>`:

```html
<script src="/assets/js/handoff-card.js" defer></script>
<script src="/assets/js/pdf-download.js" defer></script>
```

- [ ] **Step 7: Update the floating TOC sidebar**

Find the existing `<aside class="vp-toc">` block. Insert a new `<a href="#emergency-contacts">Section 6 — Emergency Contacts</a>` link in the correct position (after Pre-Cruise Countdown, before Practical Logistics). Renumber the section labels in subsequent TOC entries to match the renumbering done in Step 3.

- [ ] **Step 8: Validate**

```bash
cd /home/user/InTheWake
grep -c "## Section " admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md
grep -c "id=\"emergency-contacts\"" admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html
```

Expected: section count is 1 higher than before; `id="emergency-contacts"` appears exactly once in the HTML.

- [ ] **Step 9: Commit**

```bash
git add admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html
git commit -m "voyage-packs: add Section 6 Emergency Contacts to v0.1.2 NCL Aqua

Promotes scattered embassy and cruise-line emergency content from §6
Practical Logistics (now §7) into a dedicated, anchorable, fillable
section. Includes the family handoff card with localStorage
persistence, print and PDF download buttons (emergency-only and
entire-pack scopes), and the verified ship-to-shore + embassy
numbers from commit 82739fcd.

Renumbers Practical Logistics → §7 and downstream sections; updates
the floating TOC sidebar to match. Old duplicate content in §7 is
replaced with a back-reference to the new section.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 8: Add Emergency Contacts section to v0.1 Symphony pack (md only)

**Files:**
- Modify: `admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md`

**Why:** Symphony pack is markdown-only at v0.1 (no HTML render yet). Insert §6 with Royal Caribbean–verified numbers from Task 1 and the Symphony itinerary's port embassies.

### Per-pack substitutions for v0.1 Symphony

| Placeholder | Value |
|---|---|
| `{{CRUISE_LINE}}` | `Royal Caribbean` |
| `{{SHIP_NAME}}` | `Symphony of the Seas` |
| `{{SAIL_DATE}}` | (left blank — generic 7-night) |
| `{{DISEMBARK_DATE}}` | (left blank) |
| `{{GROUP_HOST}}` | (omit; this isn't a hosted group cruise) |
| `{{GROUP_HOST_CONTACT}}` | (omit) |
| `{{SHIP_TO_SHORE_LINE}}` | `**(888) 724-7447** from U.S. · **(321) 953-9003** international (per [Royal Caribbean's official FAQ](https://www.royalcaribbean.com/faq/questions/onboard-phone-call-services)). $7.95 USD/min, billed to MasterCard or Visa; international additionally accrues long-distance charges.` |
| `{{FLIGHT_HOTLINE}}` | `844-278-9745 (24/7 from U.S./Canada — Air2Sea flight assistance)` |
| `{{CUSTOMER_SERVICE}}` | `800-256-6649 (general customer service / 24/7 day-of-sailing) · 866-562-7625 (reservations, Mon–Sun 7 AM – 2 AM ET) · 305-539-4107 (international day-of-sailing)` |
| `{{GROUP_HOST_LINK_LINE}}` | (omit) |

For the handoff-card lines `{{SAIL_DATE}}` and `{{DISEMBARK_DATE}}`, replace with blank fillable lines (`Sailing date: ______________________`).
For `{{GROUP_HOST}}` / `{{GROUP_HOST_CONTACT}}`, delete those two lines entirely.

`{{PER_PORT_BLOCK}}` for v0.1 Symphony Western Caribbean (canonical from fact-check log):

```markdown
- **Bahamas (U.S. Embassy, Nassau)** — Perfect Day at CocoCay falls under Bahamian jurisdiction.
  - Phone: +1-242-461-5025 (24/7; press option 1 for emergencies)
  - Address: 235 Shirley Street, Nassau
- **Honduras (U.S. Embassy, Tegucigalpa)** — covers Roatán.
  - Business hours (American Citizen Services): +504-2238-5114 ext. 4400
  - After-hours emergency: +504-2217-5100
- **Mexico (U.S. Consulate General, Mérida)** — covers Cozumel and Costa Maya.
  - Phone: +52-999-689-0660 from Mexico, or 011-52-999-689-0660 from the U.S.
  - The ship's port agent can also reach the consular agent quickly for cruise-port emergencies.
```

- [ ] **Step 1: Locate the §5 / §6 boundary**

```bash
grep -n "^## Section " /home/user/InTheWake/admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md
```

- [ ] **Step 2: Insert the new §6 Emergency Contacts**

Use Edit. Apply the canonical template from Task 6 with the Symphony substitutions above, inserted immediately *before* the existing `## Section 6 — Practical Logistics` heading.

- [ ] **Step 3: Renumber every later section**

High-to-low Edits with `replace_all: true` for each rename:

```
"## Section 11 —" → "## Section 12 —"
"## Section 10 —" → "## Section 11 —"
"## Section 9 —"  → "## Section 10 —"
"## Section 8 —"  → "## Section 9 —"
"## Section 7 —"  → "## Section 8 —"
"## Section 6 — Practical Logistics" → "## Section 7 — Practical Logistics"
```

(Verify against Step 1's grep output — Symphony pack may have a different total section count than NCL Aqua; adjust the high end accordingly.)

- [ ] **Step 4: Update in-text cross-references**

```bash
grep -n "Section [0-9]" /home/user/InTheWake/admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md
```

For each match, decide whether the reference points to a section that moved. Update individually.

- [ ] **Step 5: Delete duplicated bullets in the new §7 (was §6)**

In the new §7 Practical Logistics, find and delete the embassy bullet block (the four `- **Bahamas (...):**` / `Honduras` / `Mexico` / `From anywhere` lines added in commit `82739fcd`). Replace with a single line: `See [Section 6 — Emergency Contacts](#section-6--emergency-contacts) for the full contact list and the family handoff card.`

- [ ] **Step 6: Validate**

```bash
grep -c "^## Section " /home/user/InTheWake/admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md
```

Expected: section count is exactly 1 higher than before Task 8 began.

- [ ] **Step 7: Commit**

```bash
git add admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md
git commit -m "voyage-packs: add Section 6 Emergency Contacts to v0.1 Symphony

Promotes embassy bullets from §6 Practical Logistics (now §7) into a
dedicated section. Royal Caribbean ship-to-shore + customer service +
flight-assistance numbers from the verification pass in the
fact-check log; embassies from commit 82739fcd.

Renumbers Practical Logistics → §7 and downstream sections.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 9: Build the sitewide `/reaching-someone-at-sea.html` page

**Files:**
- Create: `reaching-someone-at-sea.html`

**Why:** Free umbrella page covering universal/decision-tree material. Five blocks per spec. No cruise-line directory. Includes a blank handoff card.

- [ ] **Step 1: Use `/support.html` as the page-shell template**

Read the head + outer structure of `/home/user/InTheWake/support.html` to copy the canonical site-shell pattern (charset, viewport, ICP-Lite meta tags, Umami analytics tag, manifest link, service-worker registration, header, footer). Reuse all of that verbatim except for the title/description/canonical/OG/Twitter blocks.

- [ ] **Step 2: Page-specific `<head>` overrides**

Replace the title/description block with:

```html
<title>Reaching Someone at Sea — Emergency Contacts | In the Wake</title>
<meta name="description" content="Free reference. How to reach someone on a cruise ship in a crisis: ship-to-shore numbers, U.S. embassy contacts by port, State Department 24/7 line, and what to do when the standard help line is closed."/>
<link rel="canonical" href="https://cruisinginthewake.com/reaching-someone-at-sea.html"/>
<meta property="og:title" content="Reaching Someone at Sea — Emergency Contacts"/>
<meta property="og:description" content="Free reference for families. How to reach someone on a cruise ship in a crisis."/>
<meta property="og:url" content="https://cruisinginthewake.com/reaching-someone-at-sea.html"/>
<meta name="twitter:title" content="Reaching Someone at Sea — Emergency Contacts"/>
<meta name="twitter:description" content="Free reference for families. How to reach someone on a cruise ship in a crisis."/>
<meta name="last-reviewed" content="2026-05-06"/>
<meta name="content-protocol" content="ICP-Lite v1.4"/>
<link rel="stylesheet" href="/assets/css/handoff-card.css"/>
<link rel="stylesheet" href="/assets/css/handoff-card-print.css"/>
```

- [ ] **Step 3: Body — five-block structure**

Inside `<main class="wrap">`, add:

**Block A — In-crisis hero**

```html
<section class="card hero-header">
  <h1>Reaching Someone at Sea</h1>
  <p class="lead">If you're trying to reach someone on a cruise ship right now, here is the call that always works first, and a calm guide to the others.</p>

  <div class="universal-247">
    <p><strong>U.S. State Department, Overseas Citizens Services — 24 hours a day, every day.</strong></p>
    <ul>
      <li>From the U.S. or Canada: <strong>+1-888-407-4747</strong></li>
      <li>From abroad: <strong>+1-202-501-4444</strong></li>
    </ul>
    <p>The State Department can locate the ship, contact the cruise line on your family's behalf, and coordinate consular services if the situation is in port. If you don't know where to start, this is the call.</p>
  </div>

  <p>If you have your family member's voyage pack — the document they were supposed to share with you before sailing — open <strong>Section 6 (Emergency Contacts)</strong>. It contains the cruise-line and port-specific numbers tailored to <em>their</em> sailing. If you don't have it, the State Department line above is the right call.</p>

  <div class="offline-banner">
    <strong>This page is part of In the Wake's offline-capable PWA.</strong>
    After your first visit, it works without Wi-Fi — even at sea, in port, or anywhere your family member loses signal.
  </div>
</section>
```

**Block B — Decision tree**

```html
<section class="card">
  <h2>Which call do I make?</h2>
  <ul>
    <li><strong>Medical emergency at sea</strong> → State Department first. They coordinate with the cruise line and can contact the ship's medical center directly.</li>
    <li><strong>Missing person at sea</strong> → State Department. The Cruise Vessel Security and Safety Act of 2010 (Public Law 111-207) requires the cruise line to log incidents and report to the FBI; the State Department line is the right path to that process.</li>
    <li><strong>Port-side emergency</strong> → local emergency services first (the equivalent of 911 varies by country); the U.S. embassy or consulate second; the State Department third. The voyage pack lists the embassy phone numbers for each itinerary port.</li>
    <li><strong>Pre-cruise flight delay or missed connection</strong> → the cruise line's flight assistance hotline. This is in the voyage pack; if you don't have it, the cruise line's main customer service line will route you.</li>
  </ul>
  <p><strong>Two things not to do:</strong></p>
  <ul>
    <li><em>Don't call 911 hoping to reach the ship.</em> 911 is a domestic dispatch service; it can't reach a ship in international waters.</li>
    <li><em>Don't call the cruise line's general booking line.</em> It routes to sales, not emergencies. Use the ship-to-shore family contact (in the voyage pack) or the State Department.</li>
  </ul>
</section>
```

**Block C — Handoff card (blank)**

```html
<section class="card">
  <h2>Send this page to one person at home before you sail</h2>
  <p>Before you leave for a cruise, fill in the handoff card below and share it with one trusted person ashore. The card stays on your device — nothing is sent to a server. After you fill it in and add this page to your phone's home screen (or theirs), it will be available offline if anything happens at sea.</p>

  <div class="handoff-card" data-storage-key="inthewake-handoff-sitewide">
    <p class="card-intro">Fill in before sailing. Share with one trusted person ashore.</p>
    <p class="card-privacy">Privacy note: passport number and date of birth are sensitive — share with someone you fully trust, and don't email this card unencrypted.</p>

    <div class="card-row"><label for="hc-name">Cruiser's full legal name (as on passport):</label><input type="text" id="hc-name" name="legal_name"/></div>
    <div class="card-row"><label for="hc-dob">Date of birth:</label><input type="text" id="hc-dob" name="dob"/></div>
    <div class="card-row"><label for="hc-passport">Passport number:</label><input type="text" id="hc-passport" name="passport"/></div>
    <div class="card-row"><label for="hc-mobile">Cruiser's mobile (Wi-Fi calling at sea):</label><input type="text" id="hc-mobile" name="mobile"/></div>

    <div class="card-row"><label for="hc-line">Cruise line:</label><input type="text" id="hc-line" name="line"/></div>
    <div class="card-row"><label for="hc-ship">Ship name:</label><input type="text" id="hc-ship" name="ship"/></div>
    <div class="card-row"><label for="hc-sail">Sailing date:</label><input type="text" id="hc-sail" name="sail"/></div>
    <div class="card-row"><label for="hc-disembark">Disembark date:</label><input type="text" id="hc-disembark" name="disembark"/></div>
    <div class="card-row"><label for="hc-booking">Booking / reservation number:</label><input type="text" id="hc-booking" name="booking"/></div>
    <div class="card-row"><label for="hc-cabin">Stateroom / cabin number:</label><input type="text" id="hc-cabin" name="cabin"/></div>

    <div class="card-row"><label for="hc-ins-co">Travel insurance company:</label><input type="text" id="hc-ins-co" name="ins_company"/></div>
    <div class="card-row"><label for="hc-ins-policy">Policy number:</label><input type="text" id="hc-ins-policy" name="ins_policy"/></div>
    <div class="card-row"><label for="hc-ins-phone">24-hour assistance line:</label><input type="text" id="hc-ins-phone" name="ins_phone"/></div>

    <div class="card-row"><label for="hc-host">Group host (if applicable):</label><input type="text" id="hc-host" name="host"/></div>
    <div class="card-row"><label for="hc-host-contact">Group host contact:</label><input type="text" id="hc-host-contact" name="host_contact"/></div>

    <div class="card-row"><label for="hc-flt-out">Outbound flight (airline + number + date):</label><input type="text" id="hc-flt-out" name="flight_out"/></div>
    <div class="card-row"><label for="hc-flt-ret">Return flight (airline + number + date):</label><input type="text" id="hc-flt-ret" name="flight_ret"/></div>
    <div class="card-row"><label for="hc-medical">Medical info to share if needed:</label><input type="text" id="hc-medical" name="medical"/></div>

    <div class="card-row"><label for="hc-trusted-name">Trusted contact at home — name:</label><input type="text" id="hc-trusted-name" name="trusted_name"/></div>
    <div class="card-row"><label for="hc-trusted-phone">Trusted contact — phone:</label><input type="text" id="hc-trusted-phone" name="trusted_phone"/></div>
    <div class="card-row"><label for="hc-trusted-rel">Trusted contact — relationship:</label><input type="text" id="hc-trusted-rel" name="trusted_rel"/></div>

    <div class="card-actions">
      <button type="button" data-print-scope="page">Print this page</button>
      <button type="button" data-pdf-scope="page">Download as PDF</button>
      <button type="button" class="clear">Clear card</button>
    </div>
  </div>
</section>
```

**Block D — How the systems actually work**

```html
<section class="card prose">
  <h2>How the systems actually work</h2>
  <p>If a true emergency happens at sea, three institutions can act on behalf of a family member onshore: the cruise line, the U.S. State Department, and (when the issue is in port) a local U.S. embassy or consulate. Knowing who does what reduces panic and speeds the call.</p>
  <p><strong>The cruise line</strong> maintains a 24-hour ship-to-shore family contact desk that exists specifically to relay urgent messages to a passenger onboard. Each line publishes a different number; some are toll-free in the U.S., some are international only. These numbers are listed in your voyage pack and on your booking confirmation. The cruise line's general customer-service line is not the same number — it routes to sales and reservations, not emergencies.</p>
  <p><strong>The U.S. State Department's Overseas Citizens Services line</strong> is the universal fallback. It is staffed continuously, anywhere in the world, and it is the right call when you don't have the ship-to-shore number, when the ship-to-shore line doesn't answer, or when the situation is serious enough to warrant a parallel official channel. The Bureau of Consular Affairs can locate a ship, contact the cruise line, and dispatch consular services where appropriate.</p>
  <p><strong>U.S. embassies and consulates</strong> are the right call when the issue is happening to a U.S. citizen in port — illness requiring hospitalization, lost passport, criminal incident, missed-the-ship situation. Each embassy publishes its own emergency phone number. Your voyage pack lists the embassies for the specific ports your family member is visiting.</p>
  <p><strong>The Cruise Vessel Security and Safety Act of 2010</strong> (Public Law 111-207, signed July 27, 2010) requires every cruise ship that visits a U.S. port to log incidents — disappearances, sexual assaults, theft above $10,000, deaths — and report them to the FBI. The Act also mandates peepholes and security latches on cabin doors, surveillance equipment, and time-sensitive safety information for passengers. If a family member needs to know whether an incident on a U.S.-port-calling ship has been logged, that record exists by federal mandate.</p>
  <p><strong>Why ship-to-shore numbers vary by line</strong> is a quirk of cruise-industry history: there is no industry standard. Each line maintains its own family-contact desk, sometimes operated by a third-party communications vendor. The number does not change ship-to-ship within a line — it is always the same line-wide number, no matter which of the line's ships your family member is on.</p>
</section>
```

**Block E — When the news is the worst kind**

```html
<section class="card prose">
  <h2>When the news is the worst kind</h2>
  <p>Some readers find this page after a crisis has already happened. If that is you, the practical resources below may be useful when you are ready for them.</p>
  <ul>
    <li><a href="/solo/in-the-wake-of-grief.html">In the Wake of Grief</a> — a logbook entry on grief at sea, written for cruisers who have lost someone.</li>
    <li>International Cruise Victim Lawyers Association (ICVLA), and the public records associated with the CVSSA, can sometimes help families navigate the post-incident process for the rare serious case.</li>
  </ul>
  <p>This page does not promote any service. The links above are reference material for readers who need them.</p>
</section>
```

- [ ] **Step 4: Add scripts before `</body>`**

```html
<script src="/assets/js/handoff-card.js" defer></script>
<script src="/assets/js/pdf-download.js" defer></script>
```

- [ ] **Step 5: Validate**

```bash
cd /home/user/InTheWake
ls -la reaching-someone-at-sea.html
xmllint --html --noout reaching-someone-at-sea.html 2>&1 | head -20
grep -c "id=\"emergency-contacts\"\|class=\"handoff-card\"" reaching-someone-at-sea.html
lychee --offline reaching-someone-at-sea.html
```

Expected: file exists; xmllint reports no fatal HTML errors; the handoff-card class appears once; lychee reports zero broken internal links.

- [ ] **Step 6: Commit**

```bash
git add reaching-someone-at-sea.html
git commit -m "feat: add /reaching-someone-at-sea.html — free family-emergency reference

Free sitewide page covering universal/decision-tree material plus a
blank handoff card families can fill in and share. Five blocks per
the approved spec: in-crisis hero, decision tree, handoff card,
systems-explanation, pastoral footer.

Uses the shared handoff-card.{css,js} + pdf-download.js modules.
Page is included in PWA precache (next task) so it is automatically
available offline after first visit. No cruise-line directory; per-
itinerary numbers stay in the voyage packs.

Pastoral guardrails: no affiliate links, no urgency language,
footer-only placement (next task), pastoral exclusion preserved.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 10: Extend footer-rollout.py and run sitewide

**Files:**
- Modify: `admin/scripts/footer-rollout.py`

**Why:** Add a new footer link `Reach Family at Sea → /reaching-someone-at-sea.html` after the Support link in the Help column. Pastoral exclusion (already in place for Support) carries forward to this link as well.

- [ ] **Step 1: Add the new link patterns**

Open `admin/scripts/footer-rollout.py`. Find the `STANDARD_NAV_NEW_DOT` constant (the post-Support insertion). Add a new constant immediately below for the second-pass insertion:

```python
# Second-pass insertion: add Reach Family at Sea link after Support
STANDARD_NAV_PRE_REACH_DOT = '''      <a href="/about-us.html">About</a> ·
      <a href="/support.html">Support</a> ·
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>'''
STANDARD_NAV_POST_REACH_DOT = '''      <a href="/about-us.html">About</a> ·
      <a href="/support.html">Support</a> ·
      <a href="/reaching-someone-at-sea.html">Reach Family at Sea</a> ·
      <a href="/accessibility.html">Accessibility &amp; WCAG 2.1 AA Commitment</a>'''
```

Repeat for the port-page variant (`PORT_NAV_OLD_DOT`/`PORT_NAV_NEW_DOT`) and the `<ul>/<li>` variant — find each existing post-Support pattern in the file and add a matching pre/post pair for the Reach Family at Sea insertion.

- [ ] **Step 2: Wire the new pass into the main migration loop**

Find the function that applies the Support insertion. Below it, add an analogous function `insert_reach_family_link()` that uses the new pre/post constants. Wire it into the main rollout loop after the Support insertion. Pastoral exclusion uses the existing `PASTORAL_PATH_RE` regex — call it from the new function exactly as the Support insertion does.

- [ ] **Step 3: Dry run**

```bash
cd /home/user/InTheWake
python3 admin/scripts/footer-rollout.py
```

Expected: dry-run output shows N files would have the Reach Family at Sea link inserted (where N is approximately the count from the prior Support rollout, ~769). Pastoral pages should report as skipped.

- [ ] **Step 4: Apply**

```bash
python3 admin/scripts/footer-rollout.py --apply
```

Expected: same N files modified. Idempotent — running it again produces zero changes.

- [ ] **Step 5: Spot-check pastoral exclusion**

```bash
grep -l "Reach Family at Sea" /home/user/InTheWake/solo/*.html /home/user/InTheWake/articles/in-the-wake-of-grief.html 2>/dev/null
```

Expected: zero output — pastoral pages should not have received the link.

- [ ] **Step 6: Commit**

```bash
git add admin/scripts/footer-rollout.py $(git diff --name-only | grep '\.html$')
git commit -m "footer: add Reach Family at Sea link sitewide (pastoral excluded)

Extends footer-rollout.py with a second-pass insertion for the new
/reaching-someone-at-sea.html link, placed after Support in the
Help column. Pastoral exclusion preserved via existing
PASTORAL_PATH_RE — solo/, grief, widow, after-loss patterns are
not modified.

Idempotent. Dry-run-first pattern preserved.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 11: Add the new page to the PWA precache manifest

**Files:**
- Modify: `precache-manifest.json`

**Why:** Service worker reads `precache-manifest.json` on install/activate. Adding the new page to the `pages` array makes the PWA cache it automatically on first visit, fulfilling the "works offline" promise on the page and in voyage-pack sales copy.

- [ ] **Step 1: Add the entry**

Edit `precache-manifest.json`. Inside the `pages` array, add:

```json
{ "url": "/reaching-someone-at-sea.html", "priority": "normal" },
```

Place it alphabetically (after `/privacy.html` if present, else at a sensible point in the existing list).

- [ ] **Step 2: Bump the manifest version**

In the same file, change `"version": "14.2.0"` to `"version": "14.3.1"` (matching the SW's current `14.3.0` plus a minor bump for the new precache entry). The SW reads this version on activate; bumping it triggers a refresh of the precache list.

- [ ] **Step 3: Validate JSON**

```bash
cd /home/user/InTheWake
python3 -c "import json; json.load(open('precache-manifest.json')); print('valid')"
```

Expected: `valid`.

- [ ] **Step 4: Commit**

```bash
git add precache-manifest.json
git commit -m "pwa: add /reaching-someone-at-sea.html to precache manifest

Service worker pre-caches the new family-emergency reference page on
install/activate. After first visit, page is available offline —
which is the basis for the offline-capability claim in voyage-pack
sales copy and on the page banner itself.

Manifest version bumped 14.2.0 → 14.3.1 to trigger SW refresh on
existing visitors.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 12: Add offline-capability mention to voyage-pack hero blocks

**Files:**
- Modify: `admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md`
- Modify: `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md`
- Modify: `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html`

**Why:** Surface the offline-emergency-contacts feature where a buyer sees it. One short line per hero.

- [ ] **Step 1: Locate the hero block in each file**

Each pack opens with a hero/intro paragraph. The line goes immediately after the existing hero copy, before the At-a-Glance table.

- [ ] **Step 2: Add the line**

In v0.1.2 NCL Aqua markdown:

Find the existing intro paragraph (around line 25 — the "It is calm by design..." sentence). Add a new paragraph immediately after it:

```markdown
**Includes an offline-capable Emergency Contacts section** — fillable family handoff card, cruise-line and embassy numbers tailored to this itinerary, available offline after first load via In the Wake's PWA. Designed to share with one trusted person ashore before sailing.
```

In v0.1 Symphony markdown: same insertion, same wording (the feature is identical).

In v0.1.2 NCL Aqua HTML: add as a `<p>` inside the existing hero `<section>`:

```html
<p><strong>Includes an offline-capable Emergency Contacts section</strong> — fillable family handoff card, cruise-line and embassy numbers tailored to this itinerary, available offline after first load via In the Wake's PWA. Designed to share with one trusted person ashore before sailing.</p>
```

- [ ] **Step 3: Validate**

```bash
grep -c "offline-capable Emergency Contacts" /home/user/InTheWake/admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md /home/user/InTheWake/admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md /home/user/InTheWake/admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html
```

Expected: each file reports 1.

- [ ] **Step 4: Commit**

```bash
git add admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html
git commit -m "voyage-packs: mention offline-capable emergency contacts in heroes

One-line addition to each pack's intro paragraph surfacing the new
offline-capable Emergency Contacts section. Buyers see the feature
in the hero before reaching the At-a-Glance table.

https://claude.ai/code/session_01MWXayHqZQR6BpFfzsbJKTb"
```

---

## Task 13: End-to-end verification + push

**Files:** None modified — verification only.

- [ ] **Step 1: Confirm all expected sections exist**

```bash
cd /home/user/InTheWake
grep -c "^## Section 6 — Emergency Contacts" admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.md admin/voyage-packs/v0.1-symphony-western-caribbean-7n.md
grep -c "id=\"emergency-contacts\"" admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html reaching-someone-at-sea.html
```

Expected: each grep reports 1 per file.

- [ ] **Step 2: Confirm fact-check log was updated**

```bash
grep -c "Royal Caribbean" admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md
```

Expected: ≥ 1.

- [ ] **Step 3: Confirm shared assets exist**

```bash
ls -la assets/css/handoff-card.css assets/css/handoff-card-print.css assets/js/handoff-card.js assets/js/pdf-download.js
```

Expected: all four files exist with non-zero size.

- [ ] **Step 4: Confirm PWA precache update**

```bash
grep -A1 "reaching-someone-at-sea" precache-manifest.json
python3 -c "import json; m=json.load(open('precache-manifest.json')); print('version:', m['version'])"
```

Expected: version is `14.3.1`; URL appears in the pages array.

- [ ] **Step 5: Confirm footer rollout was applied (and pastoral excluded)**

```bash
grep -l "Reach Family at Sea" *.html | wc -l
grep -l "Reach Family at Sea" solo/*.html articles/in-the-wake-of-grief.html 2>/dev/null
```

Expected: top-level count > 0; pastoral grep returns nothing.

- [ ] **Step 6: Voice audit on new content**

Run the existing voice-audit skill against the new sitewide page and the canonical Emergency Contacts section text. Confirm no banned vocabulary (must-have, etc.) and no urgency framing.

- [ ] **Step 7: Open in browser and test interactively**

If a local dev server is available, open `/reaching-someone-at-sea.html` in Chrome:
- Fill some card fields → reload → values persist
- Click "Print this page" → print preview opens with print-CSS scoping
- Click "Download as PDF" → html2pdf.js loads and a PDF downloads
- Click "Clear card" → confirm dialog, then fields wipe

Open `admin/voyage-packs/v0.1.2-ncl-aqua-veterans-solo-group-dec-2027.html`:
- Section 6 anchor `#emergency-contacts` jumps correctly
- Floating TOC shows the new section
- All four print/PDF buttons work
- Card values persist across reload (under a *different* localStorage key from the sitewide page)

- [ ] **Step 8: Final push**

```bash
git push -u origin claude/review-docs-and-repo-ekA62
```

Expected: all commits pushed successfully.

---

## Self-Review

**Spec coverage check:**

- ✅ Sitewide page identity (URL, title, meta) — Task 9 Step 2.
- ✅ Five blocks (in-crisis hero, decision tree, handoff card, systems explainer, pastoral footer) — Task 9 Step 3.
- ✅ Per-voyage-pack §6 Emergency Contacts insertion + renumbering — Tasks 7 + 8.
- ✅ Fillable handoff card with all spec field names — Tasks 7 (HTML) + 8 (md) + 9 (sitewide HTML).
- ✅ localStorage card persistence keyed per page — Task 3.
- ✅ Privacy framing inline above the card — Tasks 7, 9 (in card markup).
- ✅ Automatic PWA offline (no manual download button) — Task 11.
- ✅ Banner copy on each page — Tasks 7, 9.
- ✅ Sales-copy mention in voyage-pack heroes — Task 12.
- ✅ Print + PDF buttons with two scopes per pack, two on sitewide — Tasks 4, 5, 7, 9.
- ✅ html2pdf.js lazy-loaded — Task 5.
- ✅ Footer rollout with pastoral exclusion — Task 10.
- ✅ Pastoral guardrails: no affiliate links anywhere, no urgency framing, footer-only placement — Tasks 9, 10.
- ✅ Royal Caribbean number verification (gating v0.1 Symphony) — Task 1.
- ✅ Removal of "Download as HTML" button (replaced by automatic PWA) — Task 5 only emits PDF + Print buttons.

**Placeholder scan:** No `TBD`, `TODO`, or hand-wave instructions in any task. All code blocks contain complete, paste-ready content. The two Royal Caribbean numbers in Task 8 are intentional substitutions filled by Task 1's findings — that is a real dependency, not a placeholder.

**Type/name consistency:** `data-storage-key`, `data-print-scope`, `data-pdf-scope` attribute names used consistently across handoff-card.js, pdf-download.js, and the HTML markup in Tasks 7 and 9. Filename meta tag `vp-filename-base` defined once in pdf-download.js and used in Task 7 Step 6. Section number 6 used consistently across both packs after renumbering.

**Out-of-spec scope creep:** None added. The plan implements exactly what the spec specifies; deferred items (PDF for v0.2, additional cruise-line directories, localization) are not snuck in.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-06-reaching-someone-at-sea.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
