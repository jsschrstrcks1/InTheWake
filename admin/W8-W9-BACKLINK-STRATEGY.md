# W8 / W9 — Backlink Acquisition Strategy

**Status:** Slow-compounding work, 6–12 month horizon. Begin Day 30+ of the v2.5 execution window; results show up at month 4–6.
**Plan reference:** v2.5 W8/W9 — Bing flagged "not enough inbound links from high quality domains" as a real SEO ceiling.
**Owner:** Ken
**Last updated:** 2026-05-06

This document captures the three workstreams the v2.5 plan called out (Wikipedia citations, guest-post outreach, Wikimedia author-page reciprocals) and adds two more (HARO/journalist-source response and university/library citations) that became visible after researching the actual link-acquisition landscape for an indie cruise publisher.

The strategy is **slow-compounding by design**. Backlinks from authority domains take weeks to be picked up by search engines and months to compound into ranking improvements. Don't expect to see ranking movement in 30 days; expect to see it at 4–6 months and continuing past that.

---

## Why backlinks matter for us specifically

Bing Webmaster Tools flagged "not enough inbound links from high quality domains" as a real ceiling. We have a strong AI-citation signal (21K Copilot citations / 90 days) but a weak traditional-link signal. The asymmetry is unusual and worth fixing because:

- **Traditional ranking still matters.** Despite AI search, organic clicks remain a meaningful slice of traffic; ranking depends on backlink profile.
- **AI grounding cross-checks against link graph.** Most AI assistants weight grounding context partly by how often the source is linked to from authority domains. A site with strong AI-citation but weak link graph is on borrowed time — Anthropic / OpenAI / Microsoft can update grounding heuristics any quarter and a thin link profile becomes a ranking + citation problem simultaneously.
- **Partnership conversations weigh link profile.** When we send the W6.2 media kit, prospective partners will check our link graph. A respectable profile makes the partnership conversation easier.

The goal is **20–40 high-quality inbound links over 12 months** from domains with strong authority and editorial credibility. Not hundreds of low-quality links; the FTC and Google both punish that pattern.

---

## Workstream 1 — Wikipedia citations

The single highest-leverage move available to a niche publisher with original content. Wikipedia citations are nofollow, but Wikipedia's *backlink graph* is what makes them indirectly valuable: AI training pipelines, search engines, and academic citation tools all weight Wikipedia heavily, and a citation in a Wikipedia article surfaces our domain in those secondary contexts.

### Eligibility check (Wikipedia's verifiability standards)

A reference is suitable for Wikipedia if it is:

1. **Published.** Has a stable URL on a real publication. ✅ We meet this.
2. **Independent of the subject.** Not the cruise line's own marketing. ✅ We are independent of every cruise line.
3. **Reliable.** Editorial standards, named author, fact-checked. ✅ We have ICP-2 standards, named author (Ken Baker), and a fact-check log.
4. **Used to support a specific claim.** Wikipedia editors reject sources used promotionally; references are used to verify specific factual claims. Our content is suitable.

Where we are likely to be rejected:

- ⚠ Self-published-blog-without-editorial-oversight is a common rejection rationale. Counter: we have an explicit ICP-2 standard, fact-check log, named author with credentials. Cite the `admin/voyage-packs/v0.1-v0.1.2-FACT-CHECK.md` audit trail as evidence of editorial discipline if challenged.
- ⚠ Promotional intent flagged. Counter: our content is editorial; we don't sell cruises; we don't take cruise-line commissions. Disclosure posture in `/affiliate-disclosure.html` is on our side.

### Target articles — prioritized by reach + content match

| Wikipedia article | Why we fit | Our matching content | Effort |
|---|---|---|---|
| **Endicott Arm** | Underexpanded article; we have detailed first-person port content | `/ports/endicott-arm.html` | Low |
| **Tracy Arm** | Same as above; comparison-with-Tracy-Arm content is useful | `/ports/endicott-arm.html` (comparison material) | Low |
| **Mahogany Bay (Roatán)** | Cruise-port article; we have port-day operational content | `/ports/roatan.html` (or whichever covers Mahogany Bay) | Low |
| **Cruise Vessel Security and Safety Act of 2010** | Recently-relevant article; our `/reaching-someone-at-sea.html` cites the law in the context of practical family advice | `/reaching-someone-at-sea.html` | Medium |
| **Air Carrier Access Act** (in service-animal context) | We have ACAA service-animal context tied to cruise travel | The voyage packs' veterans subsection on service animals | Medium |
| **Symphony of the Seas** | We have detailed, accurate ship history including the 2023 Cádiz drydock | `/ships/rcl/symphony-of-the-seas.html` | Low |
| **Norwegian Aqua** | New ship; underexpanded article | `/ships/norwegian/norwegian-aqua.html` | Low |
| **Majesty of the Seas** | Retired-ship article; we have the "now laid up in Greece" detail | `/ships/rcl/majesty-of-the-seas.html` | Low |
| **Quintana Roo (time zone section)** | Common confusion (tourists assume Cozumel is on Central Time); our voyage packs explain the EST year-round rule | The voyage packs' time-zone section | Medium |
| **Various cruise-port articles** | 388 of our port pages potentially fit Wikipedia targets; pick ports with thin Wikipedia articles | port pages | Variable |

### Process for adding a citation

1. **Read the Wikipedia article.** Find a specific sentence that needs a `[citation needed]` tag or a sentence with a thin source.
2. **Match the sentence to a specific paragraph on our page.** The reference should support a claim, not just appear in the article.
3. **Format the citation.** Wikipedia uses `<ref>` tags or templates. Example:

   ```
   <ref>{{cite web |url=https://cruisinginthewake.com/ports/endicott-arm.html |title=Endicott Arm, Alaska — Tracy Arm's quieter alternative |last=Baker |first=Ken |publisher=In the Wake |access-date=2026-07-01}}</ref>
   ```

4. **Submit a small edit.** Don't add the link as your first edit on a brand-new account; build a small editing history first (typo fixes, dead-link replacements) so the account isn't immediately flagged as single-purpose.
5. **If reverted, don't re-revert.** Take the conversation to the article's Talk page, explain the source's editorial standards, and let the community decide. Edit-warring kills credibility instantly.

### Pacing

**One Wikipedia citation per month, maximum.** More than that triggers spam-flagging heuristics. The goal is 8–12 Wikipedia citations over 12 months — not a campaign, a slow-trickle organic insertion as legitimate citation needs surface.

### What success looks like

- 6+ stable Wikipedia citations after 12 months (some will get reverted; that's expected)
- Zero account suspensions or block warnings
- Increased "wikipedia.org" referrer traffic in Umami within 3–6 months of stable citations

---

## Workstream 2 — Guest posts on cruise-content peer publications

Reciprocal-traffic-and-backlink relationship with editorial publications in the same space. The v2.5 plan's competitive context named six peer publications:

| Publication | Authority | Approachability | Fit |
|---|---|---|---|
| Cruise Critic | High | Low (large org, slow editorial process) | Fit only if introduction available |
| Royal Caribbean Blog | High in RCL niche | Medium | Fit; Matt Hochberg has hosted guest content before |
| Prof. Cruise | Medium | High (one-author site like ours) | Strong fit |
| Life Well Cruised | Medium | Medium | Fit |
| Cruise Maven | Medium | High | Strong fit |
| Eat Sleep Cruise | Medium | Medium | Fit |
| Cruise Hive | Medium-High (news-driven) | Medium | News content fit, less editorial fit |
| Cruzely | Medium | High | Strong fit |

### Pitch model

Don't pitch a "guest post" — that reads as link-building. Pitch a **piece of original content** that solves a problem the host publication's audience has and that you're uniquely positioned to write.

Three strong pitches available from existing site assets:

1. **"What we learned auditing 70 Amazon affiliate links across our cruise content"** — the Phase A story from the v2.5 plan. Original, candid, useful for any cruise-content publisher facing similar Amazon-account-survival pressure.
2. **"Building an offline-capable Emergency Contacts handoff for cruise families"** — original product engineering content; useful at sites that cover cruise-tech.
3. **"The 21K AI-citation moat — what it is and what it isn't worth"** — meta-publishing content; useful at industry-meta sites (Press Gazette, Digiday, Skift) more than cruise-niche sites.

Less-obvious pitches:

4. **"Revisiting Endicott Arm in the post-Tracy-Arm era"** — when Princess shifted Tracy Arm operations, Endicott Arm became the primary stop for Princess Alaska routings. Original travel content with operational substance.
5. **"What Norwegian Aqua's first-year passenger feedback revealed about the Prima Plus class"** — review-aggregation content tied to a brand-new ship.

### Pacing

**One pitch per month maximum.** Track responses. Don't pitch the same publication twice in 6 months unless they signal openness.

### What success looks like

- 3–5 published guest pieces over 12 months
- Each piece links back to In the Wake from the byline (standard guest-post convention)
- Direct referral traffic + indirect SEO from the link graph

---

## Workstream 3 — Wikimedia author-page reciprocals

Ken Baker's Wikimedia Commons author page (where he uploads the original ship/port photography that ends up on Wikipedia ship articles) can link to In the Wake; In the Wake's author page (`/authors/ken-baker.html`) can link back.

### Action items

- [ ] Confirm Ken Baker's Wikimedia Commons user page exists (commons.wikimedia.org/wiki/User:[handle]). If not, create one — it's a one-time setup.
- [ ] Add a link from the Wikimedia user page to `https://cruisinginthewake.com/authors/ken-baker.html`. Wikimedia user pages are allowed to link to the user's professional / publishing surfaces.
- [ ] Confirm the In the Wake author page links back to the Wikimedia user page.
- [ ] Same exercise for any other contributor (e.g., Tina Maulsby if she has a Wikimedia presence).

### Caveat

Wikimedia user-page links are nofollow, but they're an authority signal in the link graph and a credibility signal for any researcher tracking back from a Wikipedia ship-image attribution to our domain.

### What success looks like

- Working bidirectional link between Wikimedia user page(s) and In the Wake author page(s)
- Increased "commons.wikimedia.org" or "wikipedia.org" referrer traffic from the image-attribution path

---

## Workstream 4 — HARO / journalist-source response

HARO ("Help a Reporter Out") and its successors (Connectively, Featured.com, Qwoted) connect journalists to expert sources. A cruise expert with a credible publishing surface is exactly the kind of source these journalists routinely look for, and a placement in a national outlet (USA Today travel, Forbes travel, Washington Post travel section, etc.) is one of the highest-quality backlinks available to an indie publisher.

### Process

1. Subscribe to HARO and Featured.com (free tiers available).
2. Filter for the "Travel" or "Lifestyle" daily emails.
3. Respond to queries that match cruise-planning, cruise-accessibility, cruise-grief, or first-cruise content. **Quick is more important than perfect** — journalists pick from the first 3–5 thoughtful responses, not the most polished response submitted hours later.
4. Each response includes a one-sentence bio with a link to your most relevant page (not always the homepage — link to the specific page that proves your authority on the topic).

### Pacing

**Daily filter, weekly response.** Most days the queries don't fit; respond when they do. Five well-targeted responses per month typically yields one published placement.

### What success looks like

- 2–4 published placements per year in national outlets, each with a backlink to In the Wake
- Each placement lifts authority on the page linked-to; aggregate effect compounds

---

## Workstream 5 — University and library citations

Travel and tourism programs at universities (Cornell School of Hotel Administration, George Washington Tourism Studies Institute, several state-school tourism programs) maintain reading lists and link to industry publications they consider editorial-standard-compliant. This is a slow but extremely high-quality link source.

### Action items

- [ ] Identify 5–10 university programs that maintain public reading lists for travel/tourism/hospitality programs.
- [ ] Email the program coordinator / faculty contact with a brief introduction to In the Wake as an editorial-standard-compliant cruise publication, with specific page suggestions for their reading list (e.g., `/disability-at-sea.html` for accessibility coursework, `/articles/` archive for narrative travel writing instruction, the audit-log for media-ethics coursework).
- [ ] Don't ask for inclusion. Offer the resource and let them decide.

### Pacing

**One outreach per month for 6 months, then evaluate.** This is a long-tail effort; results may not surface for 6–12 months as program coordinators update reading lists between semesters.

### What success looks like

- Any university reading list including In the Wake within 12 months is a major win.
- Each .edu link is among the highest-authority backlinks available to a publisher of our scale.

---

## Tracking

Maintain this table; update as backlinks land or outreach goes out.

| Date | Workstream | Action | Outcome | Backlink URL (if landed) |
|---|---|---|---|---|
| (none yet) | | | | |

---

## What we will NOT do

These cross bright lines or are bad-faith link-building tactics:

- **Paid backlinks.** Including "guest post networks" that charge a placement fee. Google penalizes these aggressively, and the placements are detectable. Off-mission.
- **Reciprocal three-way schemes.** "We link to you, you link to a third party we coordinate with, they link to us." Detection-risk and bad faith.
- **Comment-spam backlinks.** Posting comments on related blogs with our URL. Universally low-quality and detectable.
- **Private blog networks.** Owning a network of low-quality blogs to seed links. Off-mission and reputationally toxic if discovered.
- **Forum-signature link spam.** Setting up Cruise Critic / cruise-forum accounts solely to drop our URL in signatures. Off-mission and forum bans likely.
- **Wikipedia citation spam.** More than one Wikipedia citation per month from a single account. The community detects and reverts.
- **HARO responses outside our actual expertise.** Responding to queries we can't substantiate just to get a backlink. Damages credibility for the entire publication.

---

## Pivot triggers (carried from v2.5 plan)

- **At month 6:** if fewer than 3 high-quality backlinks have landed across all five workstreams, the strategy is failing — investigate what's not working (likely candidate: brand-recognition is too low to support guest-post pitches, or the editorial-standards story isn't being told well in outreach).
- **At month 12:** if Bing's "not enough inbound links from high quality domains" warning has not improved, the link-graph build is moving slower than the keyword-position erosion. Consider a focused 3-month push on Workstream 1 (Wikipedia) since it's the only workstream with no gatekeeper.
- **If a partnership lands (W6.2):** the brand authority of a signed insurance partner provides backlink lift independent of these workstreams. Reassess priorities at that point.

---

## Why this is in v2.5 even though it's slow

The v2.5 plan named this as a real workstream because the AI-citation moat (21K/90d) is *load-bearing* but *fragile*. AI grounding heuristics will drift; some quarter, an update to Microsoft Copilot's grounding ranker will deprioritize publishers with weak link graphs. We can't predict when, but we know it's a real risk. The link-graph build is the slow insurance against that scenario.

It is also a 6–12-month payoff project. Don't expect short-term ROI; do expect compounding ROI starting at month 4–6 if the workstreams are running consistently.

---

*Soli Deo Gloria.*
