# Voyage-Pack Adversarial Fact-Check Audit — 2026-07-06

**Scope:** all 14 long-form voyage packs in `admin/voyage-packs/`.
**Method:** one adversarial fact-checker per pack, each run with the "find every error the prior checker missed" framing and required to verify **every** checkable claim against a **primary source** (Wikipedia ship articles, cruise-line official FAQs, `.gov`/consulate pages, `timeanddate`/`date` for weekdays, tourism boards) via live web search — never from memory. 14 checkers, ~360 web lookups total. Cross-agent conflicts were then re-verified by the lead.

**Bottom line:** two packs came back **clean** (Breakaway Bermuda, Breakaway Fall Foliage). The other twelve carry a mix of **CRITICAL** (date/safety/real-money) and **MAJOR** (clear factual) errors — the great majority are **internal self-contradictions and stale figures the sidecars falsely attested as fixed**, not the ship-spec/date/currency spine (which is overwhelmingly correct). The single worst finding is the **Virgin "Sisters at Sea" pack: its entire itinerary is one day off** (Feb 14 2027 is a Sunday, not Saturday).

---

## Severity tally by pack

| Pack | CRIT | MAJOR | MINOR | Worst finding |
|---|---|---|---|---|
| v0.1.3 Virgin Sisters at Sea | **9** | 3 | 4 | Entire itinerary 1 day off (Sat→Sun) incl. emergency card |
| v0.1.2 Aqua Veterans | **2** | 3 | 3 | Stray "Friday/Saturday embark" text; gratuity "can't be adjusted" (false) |
| v0.1.8 MSC World America | **2** | 4 | 4 | Unverifiable emergency #; gratuity $14–16 stale ($17/$23) |
| v0.1.12 Margaritaville *(mine)* | **1** | 0 | 3 | Wrong cruise-line phone in handoff card |
| v0.1.11 Escape | **1** | 0 | 7 | "Nov 19 = day before Thanksgiving/busiest day" (it's a week before) |
| v0.1 Symphony | 0 | **5** | 2 | Roatán port reversed; CocoCay "free" pools are paid |
| v0.1.10 Encore | 0 | **4** | 3 | "three-deck track"/Hudson's/"southernmost Canada"/museum hours |
| v0.1.4 Anthem | 0 | **3** | 7 | Tramway $65↔$45 + Mendenhall $79↔$90 contradictions; "only" cathedral |
| v0.1.13 Gem *(mine)* | 0 | **3** | 1 | "Jewel Class 2006–2010" (→2005–2007); Cancún # |
| v0.1.16 Aqua Thanksgiving *(mine)* | 0 | **2** | 3 | Godfather missed (Stonestreet); staterooms ~1,469 (→~1,760) |
| v0.1.7 Bliss | 0 | **1** | 4 | "only Russian Orthodox cathedral in N. America" (→first) |
| v0.1.9 Prima *(mine)* | 0 | **1** | 5 | Cancún consular # defunct |
| v0.1.14 Breakaway Bermuda *(mine)* | 0 | 0 | 0 | **CLEAN** |
| v0.1.15 Breakaway Fall Foliage *(mine)* | 0 | 0 | 6 | **CLEAN** (all minor/defensible) |

*"(mine)" = built or sidecar-authored earlier this session; the rest predate this session.*

---

## What verified CLEAN across the fleet (the good news)

The adversarial pass **confirmed** the highest-stakes spine on essentially every pack:

- **Crew counts** — the recurring NCL "~1,388" training-data carryover was **avoided everywhere** (Prima 1,506, Gem 1,070, Breakaway 1,657, Bliss 1,700, Encore 2,100, Escape 1,733, Aqua 1,597, World America 2,138, Symphony 2,200, Anthem ~1,300, Resilient Lady 1,160 — all verified).
- **Currency direction** — the Cayman KYD peg (1 KYD = 1.20 USD, *stronger* than USD) is correct in all four packs that use it; Bermuda BMD 1:1 and Bahamian 1:1 correct. The historic "backwards peg" error stays fixed.
- **Gratuity rates** — NCL $20/$25, Margaritaville $22/$25, RCL $18.50/$21, Virgin $20/$22 all verified current. (Exceptions: World America $14–16 stale, and the Aqua Veterans "can't adjust onboard" policy claim — both flagged below.)
- **Ship-date architecture** — every embark/port/disembark weekday computed correctly on 12 of 14 packs; the Gem's Mardi-Gras/Ash-Wednesday framing and the Aqua-Thanksgiving Thanksgiving-day logic both verified exactly right.
- **Primary emergency line** — the State Dept OCS 24/7 number (+1-888-407-4747 / +1-202-501-4444) is correct in **every** handoff card, so no pack leaves a reader without a working emergency path even where a *secondary* consular number is stale.

---

## CRITICAL findings (date / safety / real-money — fix first)

**1. Virgin Sisters at Sea (v0.1.3) — the entire itinerary is one day off.**
Feb 14, 2027 is a **Sunday**, not Saturday; the voyage is Sunday→Sunday (verified three ways: `date`, virginvoyages.com's published "Sisters at Sea / Resilient Lady" itinerary, and the adjacent Feb 7 sailing's Saturday-Feb-13 Bimini call). Every weekday label is wrong across the cover, At-a-Glance, all six dated day-headers, the ports-of-call list, **and the family emergency handoff card**. Additionally: **Freeport is Day 2 (Mon Feb 15), not a Day-3 call after a sea day** — the actual pattern is Freeport → two sea days → Progreso; and **Progreso hours are 9 AM–6 PM, not 8 AM–5 PM** (affects the Chichén Itzá return math). Ship identity (Resilient Lady), specs, ports, and Virgin's unbundled-gratuity handling are all correct. *This was the known-OPEN "Sat vs Sun" item; now definitively confirmed.*

**2. Aqua Veterans (v0.1.2) — two real-money/date errors.**
(a) Line 400 carries stray template text — "Friday night before, Dec 11… Saturday morning embarkation" — but **Dec 11, 2027 is a Saturday and embarkation is Sunday Dec 12** (the rest of the pack says so). (b) The pack + sidecar claim NCL's service charge **"cannot be adjusted onboard… must write to NCL after the cruise"** — this **inverts NCL's actual policy** (the NCL FAQ says it *can* be adjusted at Guest Services). Both are real-money for an audience explicitly framed as veterans on tight budgets.

**3. MSC World America (v0.1.8) — safety + real-money.**
(a) Handoff-card "24/7 MSC Guest Services" numbers **954-624-4055 / 888-624-4655 appear in no MSC source**; MSC's published line is **1-877-665-4655** (at-sea satellite +870 765 097 163). (b) Gratuity stated as **$14–16/day is stale** — current MSC Caribbean rate is **$17 standard / $23 Yacht Club** (eff. May 11 2026), which governs the Apr 2027 sailing; the budget table understates. *(Note: my own sidecar wrongly claimed "the pack body does not assert a gratuity figure" — it does; that verification claim was false.)*

**4. Margaritaville (v0.1.12) — wrong cruise-line phone in handoff card.**
Lists **1-800-946-0377**; the official (and only) published Margaritaville at Sea number is **1-800-814-7100**. The bad number has no sidecar source.

**5. Escape (v0.1.11) — false date relationship (repeated 3×).**
The "fly in Nov 19 — the day *before* Thanksgiving, the busiest travel day of the year" rationale is false: **Nov 19, 2026 is a full week before Thanksgiving (Nov 26)**; the day before is Wed Nov 25, and the busiest-travel-day title belongs to that Wednesday / the Sunday after. The fly-in-early *advice* is fine; only its stated justification is wrong.

---

## MAJOR findings (clear factual errors)

**Recurring cross-pack errors (fix in all listed packs):**

- **Roatán port reversed** — "Mahogany Bay is Royal Caribbean's / MSC's purpose-built pier." Mahogany Bay is **Carnival Corporation's** port (rebranded "Isla Tropicale," 2026); **RCL (Symphony) and MSC (World America) dock at Coxen Hole / Port of Roatán.** The error anchors each pack's whole Roatán section (taxi prices, accessibility notes). → **Symphony (v0.1), World America (v0.1.8).**
- **Sitka "the only Russian Orthodox cathedral in North America"** — St. Michael's is the **first/oldest**, not the only (there are many). → **Anthem (v0.1.4, line 192 — and self-contradicts its own line 196), Bliss (v0.1.7).**

**Per-pack MAJORs:**

- **Symphony (v0.1):** "fourth-largest Oasis-class ship" → **third**-largest in class (the pack's own parenthetical lists 4 larger ships, making "fourth" self-impossible); CocoCay **wave pool + lazy river listed "free with fare"** → both are inside the **paid** Thrill Waterpark (~$100pp); the actual free pool (Oasis Lagoon) is omitted — real-money; **"1.7-mile rooftop track"** → the track is on **Deck 5**, ~0.4 mi/loop.
- **Encore (v0.1.10):** line 268 **"three-deck race track"** → two-level (contradicts the pack's own headers; sidecar falsely says this was fixed); **Beacon Hill "the southernmost point of Canada"** → false (that's Point Pelee, Ontario; keep the Mile-0 reference, drop the claim); **"Hudson's" listed as an Encore dining room** → Hudson's is a Prima-class venue, not on Encore; **Royal BC Museum "closed Mondays"** → open daily.
- **Anthem (v0.1.4):** Mount Roberts Tramway **$65 (body) vs $45 (costs-at-a-glance)** self-contradiction → $65; Mendenhall shuttle **$79 M&M Tours (body) vs $90 "Blue Bus" (day-plan)** → the "Blue Bus" the pack itself says no longer exists; both stale spots were falsely attested "fixed" in the sidecar's cross-fix note.
- **Gem (v0.1.13):** At-a-Glance **"Jewel Class (2006–2010 quartet)"** → the quartet is **2005–2007** (Jewel '05 … Gem '07); contradicts the pack's own sidecar; **"nearly $1,700"** OV→Balcony gap → it's **$1,710, just *over* $1,700**.
- **Aqua Thanksgiving (v0.1.16):** **godfather missed** — NCL named **Eric Stonestreet** godfather (my sidecar wrongly said none was verifiable); **"~1,469 staterooms"** → **~1,760** (mathematically inconsistent with the pack's own 3,571 double-occupancy; carried from the v0.1.2 sidecar).
- **Aqua Veterans (v0.1.2):** **"Spice H2O" adults-only area** → **not on Norwegian Aqua** (that's a Breakaway/Epic-class venue; Aqua has Vibe Beach Club + Infinity Beach), stated 3× and falsely "verified" in the sidecar; **wine policy** "1 bottle/stateroom, rest confiscated" → NCL has **no per-cabin cap**, charges $15 corkage, and *holds & returns* (doesn't confiscate); **godfather** same Stonestreet miss.
- **Bliss (v0.1.7):** the Sitka cathedral "only" error (above).
- **Prima (v0.1.9):** **Cancún Consular Agency +52-998-883-0272** flagged defunct → current per one agent is 999-316-7168 (MX) / +1-844-528-6611 (US). **Unresolved** — see conflicts below.

---

## Cross-agent conflicts — lead's resolution

- **Aqua godfather + christening date — RESOLVED.** NCL named **Eric Stonestreet** godfather; christening **April 13, 2025** in Miami (NCL newsroom + PR Newswire + Cruise Critic). Wikipedia's "April 14" is the error the packs inherited. **Fix both Aqua sidecars (v0.1.2, v0.1.16) and the v0.1.16 body** (godfather = Eric Stonestreet; date = April 13, 2025).
- **U.S. Consulate Mérida number — UNRESOLVED this session.** Packs disagree (Symphony/Aqua-Veterans/Virgin use **999-689-0660**; Prima/Gem/Margaritaville/Aqua-Thanksgiving use **999-942-5700**). `mx.usembassy.gov` returned "Technical Difficulties" on direct fetch, so I could not confirm the current number. **Recommend a targeted re-verify and standardization once the State Dept site is reachable.**
- **Cancún Consular Agency number — UNRESOLVED this session.** Split between **998-883-0272** (Margaritaville/Aqua-Thanksgiving agents confirmed via directories) and **defunct → 999-316-7168 / 844-528-6611** (Gem/Prima agents, citing the consular-agencies page). Same site-outage blocker. **Re-verify before relying on it.**
- **Mitigation:** every affected pack's **primary** emergency path (State Dept OCS, verified correct) is intact, so these are secondary-number corrections, not live safety gaps.

---

## Notable MINOR / stylistic (non-blocking)

- Grand Cayman "~74,000 people" is stale (~island 74k / territory ~88k) in Margaritaville, Prima, Aqua-Thanksgiving — low priority.
- "Dunn's River Falls, a 600-foot waterfall" conflates *climb length* (600 ft) with *height* (~180 ft) in Margaritaville, Aqua-Thanksgiving, Aqua-Veterans — defensible ("you climb"), reword optional.
- Real-money price drift: Anthem Empress tea $90→~$95 CAD, Mendenhall/tramway spots; Bliss Link light-rail $3.50→$3.00; Encore SF cable car $8→$9–12, Royal BC Museum $30→~$18–26; Escape Magens Bay taxi $12↔$17 self-contradiction; hurricane "peak mid-October" (→ ~Sept 10) in Prima + Escape.
- Superlative precision: Encore SF Chinatown "largest"→"oldest"; Escape Charlotte Amalie "largest Caribbean cruise port" (Cozumel usually cited); Symphony Daredevil's Peak "tallest in N. America"→RCL now says "Caribbean."
- **Sidecar-integrity theme:** several sidecars *attested corrections that were only partially applied to the pack body* (Anthem cross-fix, Encore "three-deck", World America "no gratuity figure", both Aqua "no godparent"). The lesson: **a `.factcheck.json` fix-attestation cannot be trusted without re-grepping the body.**

---

## Recommended fix queue (priority order)

1. **Virgin Sisters at Sea** — full date-layer correction (Sat→Sun across body + handoff card; Freeport re-sequence; Progreso hours). *Largest single fix.*
2. **World America** — emergency numbers → 1-877-665-4655; gratuity → $17/$23; terminal → 2025; Roatán → Coxen Hole; Ocean Cay → *south* of Bimini; correct the sidecar's false "no gratuity figure" claim.
3. **Aqua Veterans** — delete the stray Friday/Saturday text; correct the gratuity-adjustment policy; remove "Spice H2O"; fix wine policy; add Stonestreet to sidecar.
4. **Margaritaville** — phone → 1-800-814-7100.
5. **Escape** — fix the "day before Thanksgiving/busiest day" rationale.
6. **Symphony** — Roatán → Coxen Hole; "third-largest"; CocoCay free-vs-paid pools; Deck-5 track.
7. **Encore** — "two-level" track; drop "southernmost Canada"; drop "Hudson's"; museum open daily.
8. **Anthem** — reconcile tramway $65 + Mendenhall $79; "first" cathedral (line 192).
9. **Gem** — "2005–2007"; "just over $1,700".
10. **Aqua Thanksgiving** — staterooms ~1,760; add Stonestreet + April 13 to body/sidecar.
11. **Bliss** — "first" cathedral.
12. **Prima** — Cancún number *(after the consulate re-verify)*.

Per the standing "one at a time, careful-not-clever" rule, these should be worked sequentially — each: correct the `.md`, update the `.factcheck.json`, rebuild the PDF, re-run both gates, commit.

---

## Methodology note

Each pack was audited by an independent `general-purpose` subagent with web tools, instructed to be a hostile fact-checker "trying to take the prior fact-checker's job," to verify every claim against a primary source, and to mark anything it could not confirm **UNVERIFIABLE** rather than guess. One checker (Encore) misfired on its first run (zero tool uses) and was re-spawned. Cross-agent conflicts were re-verified by the lead; two (the Mérida/Cancún consular numbers) remain open pending State Dept site availability. Findings the checkers rated OK on the high-risk spine were spot-checked against the sidecars for internal consistency.

**Soli Deo Gloria.** This audit exists because the packs serve real people making real decisions; the errors above are exactly the kind that a genuine adversarial pass surfaces and a single author's self-review does not.

---

## RESOLUTION — all fixes applied (2026-07-06)

Every item in the fix queue above was corrected, verified against a primary source, and committed
(one pack per commit, per the careful-not-clever rule; PDFs + condensed + handoff derivatives
rebuilt; both gates re-run green each time):

1. **Virgin Sisters (v0.1.3)** — entire date layer corrected Sat→Sun; Freeport re-sequenced to Day 2; Progreso hours 9–6; handoff card + condensed fixed.
2. **World America (v0.1.8)** — emergency # → State Dept OCS 24/7 + MSC 877-665-4655; gratuity → $17/$23; terminal → Apr 2025; Roatán → Coxen Hole; Ocean Cay → south of Bimini; condensed + handoff swept.
3. **Aqua Veterans (v0.1.2)** — stray Friday/Saturday embark text; gratuity-adjustment policy; "Spice H2O" → Vibe Beach Club; wine policy; godfather (Eric Stonestreet) added.
4. **Margaritaville (v0.1.12)** — cruise-line phone → 1-800-814-7100.
5. **Escape (v0.1.11)** — "Nov 19 = day before Thanksgiving/busiest day" rationale corrected; PTO miscount; **plus** a residual condensed-only error (a nonexistent go-kart track) caught in a follow-up sweep.
6. **Symphony (v0.1)** — Roatán → Coxen Hole; "third-largest"; CocoCay free-vs-paid pools; Deck-5 track; length; Daredevil's Peak.
7. **Encore (v0.1.10)** — two-level track; dropped "southernmost Canada"; dropped "Hudson's"; museum open-daily; fares; condensed fixed.
8. **Anthem (v0.1.4)** — tramway $65 + Mendenhall $79 unified; "first" cathedral; Empress tea; condensed fixed.
9. **Gem (v0.1.13)** — Jewel-class years 2005–2007; "just over $1,700"; stale Mexico consulate #.
10. **Aqua Thanksgiving (v0.1.16)** — godfather (Stonestreet); staterooms ~1,760; Mexico #.
11. **Bliss (v0.1.7)** — "first" cathedral; godmother (Elvis Duran); Link fare $3.00; Hoonah pop.
12. **Prima (v0.1.9)** — stale Mexico consulate #; maiden-voyage "8 nights" → "~10 nights".

**Cross-cutting resolution — the Mérida/Cancún consulate-number conflict is settled.** The U.S.
Consulate General Mérida relocated to a new building in 2025, which killed the old Mérida
999-942-5700 and Cancún-Agency 998-883-0272 direct lines. All affected cards (Gem, Prima,
Margaritaville, Aqua-Thanksgiving, World America, and the sailing-agnostic card) were swept to
the current US Citizen Services routing (+1-844-528-6611 from US / 999-689-0660 local).

**Final state:** `factcheck-gate.sh --all` → PASS (14/14); `voyage-pack-pdf-build.sh --check` →
PASS. A residual-error grep for every flagged string across all pack bodies returns clean.

**Standing follow-ups** (verify-before-sailing, not errors): the Goldbelt/Mount-Roberts-Tram
operating status (Bliss) and NCL's 2027 fall Canada/NE port lineup (Fall Foliage) — both already
hedged in-pack.
