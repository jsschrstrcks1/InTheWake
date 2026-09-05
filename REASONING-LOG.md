<!-- Soli Deo Gloria. A reasoning log kept for Ken — how we got there, and why. -->

# Reasoning Log

**For Ken. A running record of *how* and *why* — not just *what*.**

## 2026-09-05 - D2 decided: the usage dashboard lives on Atlas, tailnet-only, behind the owner token

**Asked.** "The dashboard should be only served by atlas/crane/helm. Only to those on the tailnet, and to those who have the token."

**Weighed.**

*Read the code before drawing the box.* I did not want to write "put it behind the token" and leave the mechanism to whoever builds it, so I read how Atlas actually does this. Three things turned out to be already true, which made the design mostly a matter of placement. The bind script refuses to start without a Tailscale address, so the process is unreachable off the tailnet by construction. The central access gate makes every path under `/admin` and `/helm` owner-only even to read, fails closed on a missing or unknown token once role secrets are configured, and audits every decision. And the off-git data directory and the launchd cadence-job pattern (the adventures poller keeps its secret in an installed plist that never touches git) are exactly the shape the snapshot job needs.

*So the whole public half of the earlier plan is gone.* No GitHub Action, no committed snapshot, no page under the public repo's `admin/`, no `noindex` fig leaf. The dashboard is a page under Atlas's `/admin/voyage-usage`, which the existing policy table already restricts without a single change to the policy; the data is a file under `$ATLAS_DATA`; the Umami key is an environment variable in a plist on the Atlas node and nowhere else. The only thing that stays in InTheWake is the pack registry, which holds nothing a visitor cannot already see, and Atlas reads it from the live site.

*One nuance I would rather surface than bury.* Atlas also supports tailnet-identity single sign-on: a mapped Tailscale identity resolves to a role without presenting a token. If "those who have the token" means the token is required even on the tailnet, that is a small explicit check on the two new routes, and I have written it into the plan as a one-line option rather than silently choosing either way. The default follows the posture every other owner surface on Atlas already has.

*The relay does not move.* Phones at sea need a public HTTPS endpoint to flush their queues to, and Atlas is deliberately not public. So the geo-blind relay stays a Cloudflare Worker, Umami stays the store, and Atlas is only ever a reader of aggregates. Nothing about the promise changes.

**Decided.** Plan revised: D2 marked decided, a new §4.1 that maps each of Ken's three conditions (Atlas-served, tailnet-only, token-holders only) to the mechanism in the code that enforces it, Tasks 6 through 9 moved into open-claw-stuff (snapshot job modeled on the storm archiver, launchd plist modeled on the adventures poller, dashboard page under the owner-only helm tree with two additive routes), a route test that asserts the 401 / 403 / 200 / 503 matrix, and the verification section extended with what to observe on the node after install.

**Unsure.** Whether the snapshot job should also run on the at-sea node. The plan says no, because that node has no internet and would only overwrite a good snapshot with an unavailable one; but if Ken wants to read the dashboard aboard, the answer is to copy the file across before sailing, and that is a manual step worth naming.

**Honest limit.** I read the gate and the bind; I did not run Atlas. The 401 / 403 / 200 matrix in the plan is what the policy table says will happen, and the route test exists to make it what does happen.

## 2026-09-05 - Voyage Packs landing page: feature cards with wayfinding CTAs, and an install guide for the companion

**Asked.** Evaluate the landing page, build cards with a CTA and explanation for each feature of a pack, plus popups that show people how to install the companion on their phone.

**Weighed.**

*What the page was doing well, and what it was not.* The hero paragraph is the best writing on the page and I left it alone. The "What's in every pack" section was a seven-item bullet list: accurate, but a wall, and nothing in it let a reader test the claim before paying. The companion, which is the most distinctive thing a pack ships, was mentioned only inside the Volendam product card. And the offline banner promised an app-like experience without ever saying how to get one onto a phone.

*CTAs as wayfinding, not conversion.* The CTA style guide says CTAs point, they do not push. So each card's link goes to the free thing that shows the kind of writing the paid thing contains: the ship profiles, a port guide, the packing lists, the budget calculator, the accessibility page, the free any-cruise handoff card. The "day by day" card is the one feature with no free analogue, so it points down the page to the sailings covered so far. No "buy now" appears on any card; the Buy buttons already exist on the product cards and that is where they belong.

*Honesty on the companion card.* Three of the four listed packs ship a companion and one ships an offline HTML render instead, and the product cards' own delivery lines do not all say "companion" even where one exists in the repo. I did not touch those delivery claims; the feature card says "included with packs that ship one; each card below says which formats it comes in," which is true of the page as it stands. Reconciling the delivery lines is a separate, small task for you, because it changes what a buyer is told they receive.

*One dialog, three panels, not three popups.* "A set of popups" could mean three separate dialogs. One dialog with device tabs is easier to keep accessible (one focus trap, one Escape path, one place to return focus) and easier to reach from anywhere on the page. The iPhone steps are from Safari's Share sheet; Android from Chrome's menu, with a note that Install app may appear instead of Add to Home screen; computers get Chrome and Edge's install icon and Safari's Add to Dock. The script guesses the visitor's device from the user agent and preselects that tab, and stores nothing.

*Claims I checked against the companion's own code before printing them.* The service worker never caches the weather, radar or alert APIs, so "live forecasts need a signal" is true; the itinerary, averages and emergency card come from the page and localStorage, so "those work offline" is true. I deliberately did not claim the page refreshes itself when reconnected, because I did not read that far into the fetch strategy.

*Verification.* Seven Playwright tests, run against the pre-installed Chromium (the pinned Playwright version wanted a newer headless shell, so I pointed it at the container's binary rather than downloading one): card count and structure, every internal link resolves to a real file, no inline handlers, hidden-until-opened with correct ARIA, focus lands inside and Tab wraps, Escape closes and returns focus to the opener, tabs switch by click and arrow keys, close button and backdrop both close, every trigger opens the same dialog. All seven green. Mutation: renamed the Escape key check and the Escape test went red, then restored. Two screenshots sent.

*A pre-existing hazard I noticed and did not fix.* The site nav links to `/ports/`, which has no index file; on GitHub Pages that is a 404 and the Netlify redirect that used to rescue it is inert. My card links to `/ports.html` directly. Worth its own line.

**Decided.** `voyage-packs.html`: the bullet list became eight feature cards in a responsive grid, each with an icon, a heading, an explanation, and one wayfinding link, plus two triggers for the install guide (the companion card and the offline banner). New `assets/css/voyage-packs.css` and `assets/js/voyage-install-guide.js`; new Playwright spec. The install-guide triggers carry a `vp_install_guide_open` Umami attribute, consistent with the usage-tracking plan's vocabulary. The `last-reviewed` stamp was left alone: I added structure and an install guide; I did not re-verify prices or dates.

**Unsure.** Whether eight cards is one too many on a phone, where they stack into a long column. The grid collapses gracefully, but you may prefer the companion card promoted above the others since it is the thing nobody else sells. Also unsure whether "Try the free, any-cruise version" undersells the paid handoff card; it is honest, and I would rather undersell than oversell.

**Honest limit.** No automated accessibility audit ran; the ARIA pattern follows the drink calculator's quiz modal and the WAI tabs pattern, and the tests check the mechanics, but a screen-reader pass by a person is still owed before this is called finished.

## 2026-09-05 - Correction: the "Tina would recognise a guest" argument was overstated; what survives it, and a setting that gives Ken the sentence he asked for

**Asked.** Ken: realistically he does not know who is on Tina's hosted cruises, and Tina has no access to any of this data. She is a friend of the site, not a reader of its analytics.

**Weighed.**

*He is right, and the earlier entry leaned on it too hard.* I argued that "one from Hudson, FL" on a hosted sailing is a name the host could say out loud. That requires the host to see the data, and she cannot; and it requires Ken to know the guest list, and he does not. So the re-identification harm I described was mostly imagined. Recorded as a correction in the plan itself, not silently rewritten, because a future reader should be able to see that the stricter line was drawn on a false premise.

*What does not fall with it.* Two things. First, the dashboard is public because the whole repository deploys, so "nobody has access" is only true of the Umami store, not of anything the dashboard shows; the fence "never finer than state on the page" stays for that reason alone. Second, the promise argument was never about who could see the data. "No tracking" is a sentence a traveler reads on their own phone, and its plain meaning is about what the app does, not about who reads the result. Following one visitor's steps is the verb the sentence forbids, whether or not anyone could ever attach a name. That argument stands on its own.

*So the middle ground is real, and I had not offered it.* Cloudflare already knows the country and state of every request before the relay runs; the Worker can copy those two fields onto the event and still throw the IP away. That yields exactly the sentence Ken asked for, one level up: "one sitting from Florida used Now, Day 4 and Radar." No city, no IP anywhere, no person. And if he wants same-day unique devices, the relay can hash IP plus user agent plus the calendar date plus a secret it alone holds, which links sittings within a day and is worthless after midnight. That is, as far as I can tell, the same trick Umami uses on every other page of the site; doing it in our own Worker means we can read the code that keeps the promise instead of trusting a vendor's description of theirs. I left that dial default-off, because opens answer "is it used" well enough and the extra column is not worth an inch of the promise. His call.

*Cloudflare field names.* `request.cf.country` and `request.cf.region` are from memory, not from documentation fetched this session. Marked as unverified in the plan; the first step of Task 5b checks them.

**Decided.** Setting 1.5 added to the plan (state and country from Cloudflare's request metadata, IP discarded, city never read), with an optional default-off daily-link dial. The "no geography at all for hosted-group packs" fence relaxed to "never finer than state, never city," because its stricter form rested on the argument Ken corrected. Setting 2's row now carries the correction in its own words.

**Unsure.** Whether a same-day hash is "tracking" under the footer's plain reading. I lean no, because it cannot follow anyone past midnight and creates nothing a person could be found by; but I would not turn it on without Ken saying so, and the plan says that.

**Honest limit.** None of this changes the fact that every number is a floor. State-level place from Cloudflare is the connecting network's location, which at sea is the ship's satellite provider, not Florida.

## 2026-09-05 - "Without breaking our promise, and without changing our wording": counting is not tracking, but following is

**Asked.** How to measure the companions without breaking "No tracking, no ads" and without editing that sentence — could it be anonymised: area the IP resolves to, unique IPs, how one visitor moves across the pack ("1 from Hudson FL visited weather, port day 4, forecast").

**Weighed.**

*The example answers itself, and not the way it was meant.* "One from Hudson, FL, went Weather → Day 4 → Forecast" is a person's steps. On a Tina-hosted sailing of a few dozen solo travelers, Hudson is not a region, it is a name Tina could say out loud. Anonymised tracking is still tracking; the promise is about the verb, not about whether a name is attached. So the journey view is declined outright, under any wording. I would rather say that plainly than build it and call it anonymous.

*What the sentence does permit.* Counting how often a feature was used is measurement of the app, not of a person, provided nothing about a person is ever created. The site's own privacy page already draws the line there for Umami ("does not track personally identifiable information"), so the vocabulary is at least consistent. But Umami derives country, region and city from the IP at ingest — I verified the API exposes `region` and `city` metric types — so pointing the companions straight at Umami creates exactly the small-group re-identification data I just said we must not create, even if the dashboard never shows it. A policy not to look is not a promise kept.

*So the promise gets kept by construction.* The plan now routes companion events through a small first-party relay (a Cloudflare Worker on the tenant that already fronts the site) that drops the sender's IP and user agent, re-validates the event whitelist server-side, and forwards only the event name and its handful of properties. Umami sees one visitor at one location — the relay — and no geography. The data that would break the promise is never born. This is the same instinct as the pre-commit guards in this repo: make the right thing mechanical, not a matter of everyone remembering.

*What we give up.* Unique people. Under this setting the dashboard can say "41 opens during the sailing, Day 4 and Now most used, 9 sittings used Radar, the emergency tab was opened 6 times," and it cannot say "12 travelers." That is the price of the sentence, and I think it is the right trade: 41 opens on a 30-guest sailing is not nothing, and "is it used at all, which parts, when" — three of the four original questions — survive intact. Per-tab events also became one per-sitting summary, so no two events can be stitched into a path even by us.

*One thing I could not verify.* How Umami builds its daily visitor hash (IP + user agent + rotating salt, as I recall) is marked as an unverified recollection in the plan rather than stated as fact; the FAQ I fetched does not say. It only matters for Setting 2, which I am not recommending.

**Decided.** D1 rewritten: the footer stays byte-for-byte, pinned by a unit test that fails if "No tracking" ever disappears from the fourteen files. Three settings laid out with what each can answer and what it costs the promise; Setting 1 ("counts only," via the relay) recommended; Setting 3 (journeys) declined. New Task 5b builds the relay before any companion is instrumented, with its own self-attack: spoof the forwarded-IP header and read what reaches Umami literally. Event vocabulary gains `day` and a per-sitting `tabs` summary; per-tab events removed. Standing fence added: the dashboard never shows region or city, and for hosted-group packs no geography at all.

**Unsure.** Whether Ken will feel "opens, not people" is enough. If it is not, Setting 2 is on the page with its cost stated honestly, and the choice is his — but I would not pick it for him, and I would not pick it for Tina's guests.

**Honest limit.** A relay keeps a promise about *our* data. It cannot make the phone's own network invisible to the carrier or the ship's Wi-Fi provider; those were never ours to promise about.

## 2026-09-05 - Voyage-pack usage tracking and dashboard: a plan, and three decisions I would not make for you

**Asked.** "Explore the voyage packs. I want some way of tracking what people are doing, how they're using them, whether they're being used at all, and a dashboard to display all of that across all of the voyage packs. Let's make a plan."

**Weighed.**

*What is actually there.* Eighteen pack sources, twenty-six built PDFs, three offline HTML renders, fourteen PWA companions, one landing page. The landing page and the three HTML renders already carry Umami and GA4 pageviews. The fourteen PWA companions carry **nothing** — their CSP only lets them talk to the three weather APIs — and every one of them tells the traveler, in its footer, *"No tracking, no ads."* The PDFs are static files on GitHub Pages behind Cloudflare, which I confirmed from the live response headers, and GitHub Pages has no request logs. So today the honest answer to "is anyone using them" is: a pageview count on four pages, and silence everywhere else.

*The promise is the hard part, not the code.* The companions are the surface where "are they using it on the ship" would be answered, and they are exactly the surface that promised not to look. I could write the events in an afternoon. I could not decide for you whether a promise made to Tina Maulsby's guests gets reworded. The plan therefore delivers everything it can without touching that promise (Phases A and B: registry, tracker, snapshot pipeline, dashboard, landing and HTML-render events) and leaves the PWA instrumentation as Phase C, gated on your decision D1. My recommendation is on the page: anonymous, cookie-free counts, and reword the footer so it is true. The wrong outcome would be quietly making it false.

*Why Umami and not GA4.* Both are already on the site. Umami's Cloud API is one Bearer key and a handful of GET endpoints, which I verified against docs.umami.is this session, including the 50-calls-per-15-seconds limit and the millisecond date parameters. GA4's Data API needs a service account and OAuth. Two sources for the same number is a disagreement waiting to happen, so GA4 stays a manual cross-check.

*The at-sea problem.* Umami's tracker script is a third-party asset the PWA service worker deliberately never caches, so at sea it does not exist. But Umami accepts events at a plain `POST /api/send` with no auth and no script, which means a tiny first-party module can queue events in localStorage and flush them when the phone finds signal. That module is the one piece of real design in the plan: a whitelist of eight property names, nothing else survives, and it honors Do-Not-Track. Its stated claim ("nothing personal leaves the device") gets a Layer 3 self-attack in the plan rather than my word.

*Public repo, public dashboard.* The deploy workflow uploads the whole repository, so a dashboard under `admin/` is world-readable whether or not anyone links it. I designed for that instead of around it: aggregate counts only, never revenue, `noindex`, and the page says on its face that every number is a floor. Sales data is a separate seam behind the paywall-platform decision that is already on the board.

*A number I refused to fabricate.* Whether your Umami Cloud tier includes API keys and what its event quota is, I did not check — I cannot see your account. It is marked `[unverified]` in the plan and is the first thing Phase A verifies. Ad-blocker undercount is likewise named as unmeasured rather than estimated.

*What went sideways in the session.* The HLS preflight installed the household guards into this container and, as a side effect, overwrote three bootstrap hook files in this repo with newer copies. I reverted them twice rather than smuggle a harness change into a planning commit; if the newer copies should land, that is its own commit. The dangerous-command guard also refused my first attempt to write the plan as a shell heredoc (too many delimiters for its review ceiling). It was right; I used the file tool instead.

**Decided.** One plan document at `docs/superpowers/plans/2026-09-05-voyage-pack-usage-tracking.md`: measured inventory, five decisions for you (D1 promise wording, D2 public dashboard, D3 Umami as source of truth, D4 API key, D5 sales deferred), an eight-event vocabulary with a fixed property whitelist, a four-phase build with eleven tasks and the code for the two non-obvious pieces (the registry checker and the offline tracker), and a verification section that attacks the plan's own claims. Registered on the household board as `itw-voyage-packs-usage-dashboard` (P2). Nothing is built; the plan says so in its first line.

**Unsure.** Whether a public aggregate dashboard is what you want, or whether you would rather it sit behind Cloudflare Access even without revenue on it — I recommended public because it is honest about a site that says "Independent, no ads" and because a count is not a secret, but that is a taste call. Also unsure whether "quiet / unused" labels on Tina-hosted packs will read to her as a verdict on her cruises rather than on our pack; the plan says they are prompts for a conversation, but words on a dashboard travel.

**Honest limit.** The plan measures floors, never totals, and it cannot say *why* a pack goes unused. It also cannot see a PDF opened from a saved file or an email — that traffic is gone the moment the file leaves our link.

## 2026-09-05 - Full voice-skill pass on the seven new articles; it caught a sourcing violation the first audit missed

**Asked.** "Run all of our voice skills against these new articles."

**Weighed.**

*My first pass was not the skill.* Before publishing I ran what I described as a voice audit and wrote an attestation into all seven sidecars. Reading `voice-audit` v2.3.0 properly this time, that pass covered maybe a third of Axis 1 and some cadence measurement. It never ran the announcement-before-move scan, the assumed-familiarity scan, the both-sides reflex, the lack-of-conviction greps, the outline-conclusion check, image density, or the AI-Authorship Cluster Detection framework at all — and the attestation I wrote was not schema-conformant, because it carried no `must_be_present`, no `cluster_detection` and no `risk_rating`. Those three fields are the ones the Anthem June 2026 failure exists to force. I marked the old block `supersedes` rather than silently overwriting it.

*The finding that justifies the whole exercise.* Cluster detection Layer 1 looks for broad authority claims with no specifics. The single-supplement article closed with: *"Purpose-built solo cabins barely existed fifteen years ago and now run to the high hundreds across one line's fleet alone."* I never fetched a solo-cabin count or any history of the category. Worse, that sentence directly contradicts the article's own factcheck sidecar, which I had written hours earlier and which says in plain words: *"NO claim about the number of solo cabins on any ship or in any fleet."* The article and its own evidence record disagreed, and nothing caught it — not the validator, not my first audit, not the commit hooks, not the merge. A structural framework I had not run is what caught it. The closing now keeps only what NCL's page supports and says the count is not knowable from here.

*A second, milder version of the same fault.* The muster article asserted international maritime regulation as flat fact while its sidecar recorded that no regulatory text was ever fetched. Same shape: body more confident than evidence. The body now states that limit where the reader can see it and warns against quoting a citation from the page.

*The absence that the presence scan cannot see.* Three articles — CDC scores, missed ship, muster — had **zero** first-person presence of any kind. Not weak attestation; none. That is precisely the Anthem pattern: fact-correct, marketing-free, machine-tell-free, and read as AI by a reader within hours because the human signals never clustered. The skill offers a colophon-disclosure escape and these pages qualify for it, but the better fix was available and true: each had a real research event worth reporting. So the CDC page now says I went to CDC's own pages rather than take the failing threshold from a summary; the missed-ship page warns that searching this question returns a Royal Caribbean page about *cancellations* and that I nearly quoted it; the muster page states what it could not verify. **I did not manufacture lived experience.** Every added sentence reports something that actually happened, and six of these seven pages remain sourced research rather than reporting from aboard — the sidecars now say so per page instead of leaving it to be inferred.

*Where I flagged my own instruments rather than the articles.* Two proofreader hits were my error. The double-space-after-period flags were an artifact of my replacing HTML tags with spaces before scanning; the raw markup has zero. And the short-sentence counter under-counts, because it splits on `[.!?]` plus whitespace and so merges any short sentence following a closing quote — which is why it reported the single-supplement article as cadence-thin when "Two hundred percent." is sitting right there. Both limits are recorded in the sidecars rather than left to mislead the next reader.

*A skill that disagrees with the corpus.* `publication-proofreader` v1.0.0 requires curly quotes and curly apostrophes. The site has never used them: four published articles carry zero curly quotes between them and two to thirty-eight straight apostrophes each. I matched the corpus and did not churn seven pages into a convention the other sixty-five do not follow. That contradiction is yours to settle, not mine to resolve by fiat in either direction.

**Decided.** Eleven corrections across five articles: one sourcing violation removed, one unverified claim softened, three authorial paragraphs added where there was a true thing to report, six word-level fixes (copulative avoidance, promotional verbs, intensifier padding, one unsourced generalisation about readers), and `target="_blank"` added to five external source links to match corpus convention. Sidecars rewritten to the skill's actual schema, with per-article cluster verdicts, risk ratings, the corrections, the false positives, and my instruments' own limits. All seven: **0 Layer 1 signals, verdict likely_human, risk Low.** Validator 7/7 PASS.

**Unsure.** Whether adding a research-process paragraph to three articles is the right instrument or a tic. It is honest and it is the site's established voice, but if every article explains how it was researched, the explaining becomes the house style rather than the reporting. Three out of seven feels near the ceiling. If you read them and it grates, say so and I will pull them back to the colophon escape, which the skill explicitly permits.

Also unsure how much of the batch's cross-page sameness matters. Two pages carry a "The short version" header and two carry a near-identical "One thing worth being clear about" / "One thing worth saying plainly". Per page that is fine; published the same afternoon it is visible. I did not rewrite them, because varying a header to defeat a pattern is a cosmetic answer to a real question about whether seven pieces should ship together at all.

**Honest limit.** The scan measures tells, variance and clustering. It cannot tell you whether the prose reads as a person to a person. On six of these seven pages it does not even claim to — they are sourced research and now say so on their own faces.


## 2026-09-05 - "Write them all": seven new articles, one wrong premise corrected

**Asked.** "Propose a new batch of articles" then "Write them all" — seven pieces (A-G) proposed and approved in one breath.

**Weighed.**

*The premise I got wrong, and am not quietly fixing.* I proposed article G (Great Stirrup Cay costs) on the argument that "we already own the primary source and haven't used it — the zipline pricing board and safety rules are sitting in the repo, published nowhere except a passing mention." That was false. Both photographs are fully published in the Day 4 logbook entry, with the prices transcribed, the tax line quoted, and the ladder requirement called out. I had a stale note and did not check the file before pitching the piece. The article is still worth having — a costs reference page a planner can find by searching is a different artifact from a paragraph inside one week's diary, and the diary will never rank for "what does Great Stirrup Cay cost" — but the *reason I gave you* for writing it was wrong, and the honest correction is cheaper than letting you discover it.

*Sourcing.* Every factual claim in all seven came from a page fetched this session, never from recall. Two fetches failed and both failures changed the articles rather than being worked around: cruising.org and acep.org both returned HTTP 403, which killed the industry-standard section of the medical-centre piece. The CLIA commitment to the ACEP shipboard-medical guidelines showed up in a search summary and I did not print it, cite it, or characterise it — a search summary is not a source, and I already made that exact mistake once this week on the missed-ship article. The consequence is recorded in the sidecar under `retrieval_failures` so the gap is legible rather than invisible.

*The GSC photographs got re-read, not trusted.* I had transcribed figures in my notes from the earlier logbook work. I cropped and upscaled both signs and read them again at full resolution before printing a single number. The prices matched; the tax sentence matched word for word. Re-reading cost about two minutes and is the only thing standing between a transcription slip and a reader budgeting the wrong number.

*Two refusals to print numbers.* The medical-centre article names no price for treatment and no figure for medical evacuation, and says so in the text. Air-ambulance costs are quoted constantly in cruise forums and in insurance marketing; none of it traced to a primary source I could fetch, so none of it is on the page. The single-supplement article gives no fare estimates and no per-ship solo-cabin counts, because solo inventory moves and a stale count reads as current. The GSC article prices exactly three things — the ones I photographed — and states plainly that cabanas, the waterpark and rentals are not published and are not being estimated.

*A correction I put in the reader's hands.* Nearly every solo-cruising page repeats that NCL solo cabins come with Studio Lounge access. NCL's own stateroom page carries the qualification: "Studio Lounge is only available for Solo Studio accommodations." Book a Solo Inside or Solo Balcony expecting the lounge and your key card will not open the door. That is exactly the kind of thing this site exists to catch, so it is flagged as a correction in the text and in the sidecar.

*Health content and the affiliate line.* The medical-centre article carries no affiliate links and the sidecar records that as the permanent bright line, not a per-page choice. The reader-support CTA is on it, and I judged that acceptable because a donation link recommends no product and earns no commission on a health decision — it is not the thing the bright line exists to prevent. Flagging it because it is a judgment call, not an obvious one.

*Voice.* All seven audited post-draft against the full article body, not the summary. One hit across ~8,100 words: "comprehensive" in the passport article, in a legitimate contrast ("careful rather than comprehensive"), replaced with "complete" rather than argued about — the ban is zero-tolerance for a reason. Structural check against four published articles put em-dash density at 9.7-11.4 per thousand words against a corpus range of 7.7-16.0, and sentence-length variance at sd 10-18 on a mean near 20. Attestation written into every sidecar, including its honest limit: it measures tells, it cannot certify that prose reads as lived.

*One stamp I did not touch.* Adding a related-reading link to `great-stirrup-cay-changes-2026.html` and to the logbook is a content change, and ICP-2 ties `last-reviewed` to `dateModified`. I left both stamps alone. Adding a cross-link is not a re-review of the page, and stamping it as one would be the same unearned freshness claim I refused on the voyage packs earlier this week.

**Decided.** Seven articles built, validated, indexed, cross-linked in both directions, and each carrying a factcheck sidecar naming its sources, its retrieval failures, and what it deliberately does not claim.

- `cruise-passport-or-birth-certificate` — CBP verbatim on closed-loop entry, and the three situations where a birth certificate strands you.
- `how-to-read-a-cdc-cruise-inspection-score` — CDC verbatim: 100-point scale, fail at 85 or below, two unannounced inspections a year.
- `cruise-what-if-you-miss-the-ship` — Royal Caribbean verbatim on the guarantee for its own excursions and the refusal to wait for independent ones.
- `cruise-muster-drill-explained` — how the current two-part format works, with the regulation deliberately uncited because no regulatory text was fetched.
- `cruise-ship-medical-centre` — NCL, Holland America and Royal Caribbean in their own words; no prices, and the reason why stated on the page.
- `cruise-single-supplement-explained` — Royal Caribbean's 200%, NCL's "priced for one", and the Studio Lounge correction.
- `great-stirrup-cay-what-it-costs` — the photographed board, the 10% Bahamian tax on tours *and rentals*, and the unassisted twenty-foot ladder that decides eligibility before money ever does.

**Unsure.** Whether the medical-centre piece is the right shape. It is the most useful thing on the list and the least satisfying to read, because the honest answer to "what will this cost me" is "nobody publishes that." A reader arriving with that question leaves without the number. I think the page is still worth having — knowing the bill exists, lands on your stateroom account, and will not be paid by Medicare is more actionable than a price would be — but I am not certain it will feel that way to the person reading it.

Also unsure whether seven at once was right. Each is sourced and each stands up on its own, but they publish in a single batch on a single day, and a site that posts seven pieces in one afternoon looks different from one that posts seven pieces over three weeks. That is a scheduling judgment that is yours, not mine, and if you would rather stagger them I can hold some back before the merge.

**Honest limit.** The factcheck sidecars record what I fetched and what I refused to print. They cannot record what I failed to think of looking for.


## 2026-08-27 - Merge main: another lane superseded the family-app tab design; pack renumbered v0.1.19

**Asked.** "proceed as recomended" — loop step 1, fetch/resolve/merge.

**Weighed.** Main gained parallel work from another lane: the family is ON the
NCL Getaway (Aug 24-28) and that lane live-logs it; weather-family.html became
a multi-voyage app (VOYAGES registry) with past-cruises.html /
future-cruises.html pages; it already carries the 2026-12-05 World America
data and the Anthem Alaska past entry — a strict superset of my tab-based
design, verified by grep (2026-12-05 present twice) not assumed. They also
claimed v0.1.18 for the Getaway pack (my MSC pack collided on the number, not
on filenames), rebuilt the same 3 stale NCL PDFs with a clone-stable fix, and
shipped a redaction fix for the banned-string task mirror I had flagged.

**Decided.** Superset resolution, per-file and measured: main's versions win
weather-family/sw-family (their architecture contains my content), the 3 NCL
PDFs (their clone-stable build), the task mirror (their redaction; my two rows
re-appended), the build script (their base + my three registrations). My pack
renumbered v0.1.18→v0.1.19 everywhere (filenames, sidecar, build-script
arrays) since main's v0.1.18 landed first. My standalone PWA kept and linked
from future-cruises.html so it does not orphan. Not --ours/--theirs laziness:
each file choice verified against content before taking it.

**Unsure.** Whether the other lane wants my standalone PWA long-term now that
the ?voyage= view exists — both are live and linked; the operator or that lane
can retire one later. My v0.1.19 PDFs were built in-container (weasyprint 69);
rebuild on a font-canonical machine if fidelity matters.

_Runtime: syl (claude-code remote container)_

Every agent that works in this repo — Claude, Grok, Codex, Hermes, the Sophos/HELM
pipeline — records the reasoning behind its calls here. Newest entries at the top.

## 2026-08-20 - v0.1.18: MSC-app itinerary screenshots upgrade times to primary source

**Asked.** Operator sent the booking's own MSC for Me itinerary screens.

**Weighed.** Primary source outranks every listing used so far. It resolved the
4:30-vs-5:00 departure disagreement (5:00 PM) and CORRECTED Ocean Cay: the app
shows 8:00 AM - 8:00 PM, four hours longer than the aggregator's 7a-6p — a
late-departure call, which flips the lighthouse-show framing from "likely does
not run" to genuinely possible (rule: show runs on overnight/late-departure
calls; December darkness well before 8 PM). Framed as check-the-daily-program,
not promised. Sunset ~5:30 PM stated as an approximation, not computed.

**Decided.** Pack, condensed, and PWA now carry app-sourced times with the
"published ~/verify" hedging removed where the app is the source (re-verify
near sailing retained). Sidecar port_times/departure re-sourced as PRIMARY
(operator screenshots 2026-08-20), superseding aggregator entries. Both
affected PDFs rebuilt through the staleness gate.

**Unsure.** Whether the show actually runs Dec 11 — the ship's program decides;
the pack says so.

_Runtime: syl (claude-code remote container)_

## 2026-08-20 - v0.1.18 refinement: departure-time range + Cliffhanger (operator screenshot)

**Asked.** Operator confirmed the Dec 5 sailing ("It's a 7 day. These dates") with a
Google summary screenshot showing 5:00 PM departure and the Cliffhanger ride.

**Weighed.** My aggregator source said 4:30 PM; the screenshot's summary says 5:00 —
two secondary sources disagreeing, so the honest value is the range with the app as
authority. Cliffhanger/The Harbour verified against MSC's own press releases (over-water
swing, four seats, ~160 ft, Harbour = outdoor family district; Family Aventura =
Harbour + Doremiland + Sportsplex) — the inherited v0.1.8 pack predates/omits it.

**Decided.** Pack, condensed, and PWA now say "published ~4:30-5:00 PM (listings
differ — verify in app)"; Cliffhanger added to distinctive features and family
sections with cost/height/hours explicitly deferred to the app (unverified).
Sidecar updated (departure two-source disagreement recorded; cliffhanger claim with
MSC press sources). Both affected PDFs rebuilt; handoff card unchanged.

**Unsure.** Actual departure time (the app will say); Cliffhanger pricing.

_Runtime: syl (claude-code remote container)_

## 2026-08-20 - v0.1.18 World America family pack + PWA (Dec 5-12, 2026)

**Asked.** "MSC World America Dec 5th from Miami or Everglades. We should have a
voyage pack and pwa for it."

**Weighed.** Sailing verified against two sources (icruise December-2026 page
fetched in-session + cruisetimetables/cruisesonly search summary): Sat Dec 5
2026, 7 nights FROM PORTMIAMI (not Everglades — both sources agree), same port
rotation as the verified Apr 2027 sailing: Miami-Roatan-Costa Maya-Cozumel-
Ocean Cay-Miami. Port TIMES are single-source, so every time in pack and PWA is
phrased "published ~X, verify in the MSC for Me app". Ship/port facts inherited
from the v0.1.8 sidecar (verified 2026-07-06) with inheritance recorded
per-claim, not silently copied. December weather COMPUTED, not recalled:
Open-Meteo ERA5 archive, Dec 5-12 x 2020-2024, five ports — which surfaced the
honest finding that Roatan is in its rainy-season tail (75% wet days) and Ocean
Cay's published 7a-6p daytime window means the lighthouse show likely does not
run; both are stated plainly in the pack instead of smoothed over.

**Decided.** Four pack files (full md, condensed, handoff card, factcheck
sidecar with method + per-claim provenance) + PWA (world-america-family-dec-2026
.html/.webmanifest over the shared companion shell) + family weather app now
links the new companion with the real itinerary line; family sw cache v2->v3.
PDFs: container lacked the toolchain, so I installed pandoc 3.1.3 +
weasyprint 69 and BUILT all three v0.1.18 PDFs (registered in
voyage-pack-pdf-build.sh). Armed core.hooksPath=.githooks (was unset —
fresh-clone dead-hooks shape, UL-226); the now-live staleness gate then flagged
three PRE-EXISTING stale NCL long-form PDFs (v0.1.13/14/15 — .md committed
newer than .pdf on main). Rebuilt those three rather than bypassing the gate
(--no-verify is operator-only); sizes land within ~1% of the originals, but
Ken may want a rebuild on his own machine if print-font fidelity matters. A
first full-build pass needlessly regenerated 23 other PDFs (fresh-clone mtime
skew); all 23 were restored to HEAD — only packs I touched or the gate flagged
are committed. PWA pdf link kept out until the condensed PDF path is live on
the site.

**Unsure.** Exact port times (single aggregator source; deferred to the app).
Found while committing: admin/UNFINISHED_TASKS.md carries two PRE-EXISTING task
rows (lines 206/322, the SEO toxic-backlink defense tasks) that name the banned
external domain this site hard-bans, so with .githooks now armed the whole-file
domain-ban scan blocks ANY edit to that file; the HLS mirror rows for this
session's two tasks were dropped from the commit rather than bypassing the
guard (catalog SSOT in open-claw-stuff still holds them). Needs an operator
call: teach that guard introduced-lines-only, or allowlist the task mirror.
Whether MSC extends the Ocean Cay call for the show. Child service-charge rate
deliberately not stated (unverified; pack defers to MSC/agent). Which cabins
the family booked — pack quotes no rates by design.

_Runtime: syl (claude-code remote container)_

## 2026-08-20 - Family PWA: World America Dec 2026 + Past Trips section

**Asked.** "Find the pwa/voyage pack for the world America in December and add it
to the family trip one. Add a new section in the family trip one for past trips."

**Weighed.** Searched the working tree AND every remote branch: exactly one World
America pack exists — the Apr 24 – May 1, 2027 solo-group sailing (PWA
admin/voyage-pwa/world-america-caribbean.html + v0.1.8 pack). No December World
America artifact anywhere; the only December sailing in the corpus is NCL Aqua
Veterans Dec 2027. "The family trip one" resolved to admin/family/ ("Family
Vacation 2026"), whose Voyage tab held the Anthem Alaska cruise — completed
Jul 6, 2026, so it is now genuinely past. Referent was ambiguous (three readings),
so I asked instead of guessing: Ken confirmed a real Dec 2026 World America family
booking, and Past Trips = Alaska only.

**Decided.** Voyage tab now carries the Dec 2026 World America trip: links to the
existing companion PWA + condensed pack + handoff card, live-track link (IMO
9837432, verified against the v0.1.8 factcheck sidecar), and an explicit note that
the linked material was written for the Apr 2027 sailing — ship facts carry over,
dates/ports/prices/weather do not. NO December itinerary was invented: the pane
says it will appear once booking details are added (fabricated_quantities gate —
I do not have the booking). New Past Trips tab holds the completed Alaska voyage
(itinerary renderer, pack links, status line) unchanged. Manifest + meta
descriptions updated; sw cache family-v1→v2 so installed clients refresh. Both
inline scripts pass node --check; all five linked files verified present.

**Unsure.** Which exact December 2026 departure the family booked — dates, ports,
embarkation. The pane is honest about that gap; filling it needs the booking
details. Whether Ken wants the weather LOCS list extended with December ports —
deferred until the itinerary is known.

_Runtime: syl (claude-code remote container)_

## What this is (and an honest note on what it isn't)

No agent can pipe its raw internal tokens into a file; dressing a polished summary up as
"the raw stream" would be a clever fake rather than honest work. So this is the honest
version: a genuine reconstruction — what was understood, the options weighed, what was
ruled in or out and why, where the uncertainty was, and how it landed. When something was
guessed, the entry says it was guessed.

Pipeline entries are different in kind: they are generated mechanically from the run
record (plan, retrieval, governance findings, publish decision), so they need no
compliance from anyone — if the run happened, the entry is true.

## How to read an entry

- **Asked** — what was requested, and how it was read.
- **Weighed** — the options and considerations in play.
- **Decided** — the call made, and the *why* behind it.
- **Unsure** — anything uncertain, or worth revisiting.

---

## 2026-09-05 — Six new articles, written and published (syl)

**Asked.** Ken: "write it / all of them" — the six-article slate planned the same day.

**Weighed.** Built a generator from an existing article's head/header/tail rather than
hand-copying scaffolding six times, so every new page is structurally identical to the
corpus and cannot drift on schema, analytics or nav. Each article then got its own body,
sidecar and cross-links.

The real work was sourcing discipline, and the six split cleanly into two kinds.

THREE are experience-and-procedure pieces (last night, dirty cabin, escalation). Their
anchors are all already-published logbook facts, and their advice is presented as OUR
recommended practice, never as any line's policy. Each sidecar carries an explicit
not-claimed list: no line-specific deadlines, compensation schedules, response guarantees
or complaint procedures, because those vary and were not verified per-line.

THREE needed external sources, and I fetched rather than recalled:

- Cash accounts: NCL's own onboard-expenses FAQ, quoted verbatim, including the sentence
  that explains the whole incident — "Once you have exceeded the deposited amount, your
  account will be closed to further charges." The lived $2.75 failure turns out to be
  published policy operating exactly as written. Ken's beverage-package-stripped-first
  observation is printed as a ONE-SAILING OBSERVATION with an explicit statement that no
  precedence policy was found, and an invitation to be corrected.
- Pool lifts: fetched ADA.gov specifically to check SCOPE, and the check changed the
  article. The land rule is unambiguous (lift stays deployed; store-and-retrieve is not
  permitted) — and the document does not mention cruise ships at all. So the piece states
  plainly that it will NOT claim an enforceable shipboard right, names the maritime
  question as unresolved, and rests on observation plus questions to ask. That is a
  weaker claim and a much better article.
- Wave season: the honest resolution of a topic whose obvious claims are unverifiable
  without price data we do not have. The piece defines the window from sources, names
  that nearly all wave-season content is published by parties who earn on booking, gives
  an evaluation METHOD (all-in cost per night), and states in its own text that we have
  not tracked fares and will not assert what we have not measured.

**Decided.** Six articles built, sidecars written, six index entries added, cross-links
verified to resolve, corpus 58/58 PASS. All six were registered in the HLS before writing.

**Unsure.** The wave-season piece deliberately withholds the answer most readers arrive
wanting ("is now cheap?"). I judged an honest method more valuable than a confident
guess, but it is a real editorial trade and Ken may want the measurement commissioned so
a future version can answer it outright.

**Honest limit.** The pool-lift piece rests on one ship, one week, one deck, plus prior
sailings on one line — stated as such in the body, not buried in a sidecar. It invites
documented correction and promises attribution.

---

## 2026-09-03 — Day 4: the island answers, and the last night goes wrong (syl)

**Asked.** Ken: "write day 4." The last full day (Thursday Aug 27), briefed across
several messages: largely good, Great Stirrup Cay with the pier finally answered, two
photographed signs, another schedule change, no lift ever seen, the comp prediction
resolved against the ship, and the Moderno incident.

**Weighed.** Order of telling: Ken said "largely good... bad experience at Modernos," so
the entry keeps that order and says so explicitly rather than letting the ending swallow
the good day. Sign figures printed only as quoted from the photographs, with both images
published so a reader can check my transcription. Uncertainty preserved: the departure
time is "around 6" from memory, printed as unconfirmed, and the 8-to-8 island call stays
attributed to NCL's pre-sailing letter. The lift question is deliberately LEFT OPEN — the
wheelchair user Ken spoke with was satisfied but does not swim, so filing his yes as the
answer would have been the easy dishonesty; the entry states why it doesn't count.
Naming policy set for negative crew encounters: Hristina named in praise, the employees
not — Ken's own phrasing was plural and anonymous, the training failure belongs to the
ship, and an indexed page is the wrong instrument for a line worker's bad hour. The
mother is described exactly as Ken chose ("an elderly woman in my own family"), her tears
stated once and not dramatised. The declined compensation is printed because it is the
proof the page was not written to extract anything. The missed Fleetwood Mac tribute
closes the section as the actual cost.

**Decided.** Day 4 published with six subsections; freshness stamps and ai-summary
brought current; two staged sign photos now referenced. Caught two of my own defects
before publish: I had linked /articles/cruise-cash-accounts-card-locks.html, which does
not exist yet (a broken link and a coming-soon promise, both against site rules) — the
link is gone and the sentence stands without it; and the meta description still claimed
"12 hours at Great Stirrup Cay," which Day 4 itself now contradicts, so it was de-staled.

**Unsure.** The exact departure time (printed as unconfirmed). Whether the retraining
Hristina promised ever happens — unknowable from here, and the entry does not imply it.
Still owed, not done here: updating the Great Stirrup Cay article itself to replace its
unresolved-pier hedge with this lived answer, and the accessibility page's chair guidance.

---

## 2026-09-03 — GSC article: the pier hedge replaced with the lived answer (syl)

**Asked.** Ken: "Gsc had a pier. It's a long walk if you're disabled." — the promised
in-person resolution of the Great Stirrup Cay article's open pier question.

**Weighed.** The article had printed the pier as an unresolved conflict in EIGHT places
(ai-summary, meta/og/twitter descriptions, FAQ JSON-LD, dek, answer-first paragraph, the
pier section heading and its "genuinely murky" bullet) plus a future-tense promise to
report from the island Thursday. Fixing the body and leaving the metadata stale is the
failure mode that makes a site untrustworthy in AI answers, so all of them were updated
together — 15 surgical replacements, each asserted present before substitution so a
silent miss would fail loudly rather than half-apply. The reconciliation is stated rather
than the old reports being deleted: working-pier reports and tender-arrival guides were
BOTH accurate at different moments of a moving project, which is a more useful thing for
a reader than a quiet correction. Accessibility got its own h2 with a findable id because
"can I get ashore with a chair" is the actual search, and it carries Ken's exact hedge
("not fully accessible but better than other islands") rather than being upgraded into a
recommendation.

**Decided.** 15 claim/metadata updates + a new accessibility section; freshness stamps to
09-03; sidecar records the visit as PRIMARY tier and lists what it did and did NOT
resolve. Validator PASS.

**Unsure / honest limits recorded on the page itself.** Water access stays UNVERIFIED —
no lift was seen deployed all week, and the one wheelchair-using guest who reported
satisfaction neither swims nor uses hot tubs, so his experience cannot answer it; the
page says so instead of inferring. Waterpark and lagoon PRICING also stays unverified —
the zipline board was the only price list photographed, so no dollar figure is printed for
the waterpark. Departure time printed with its uncertainty ("in practice we left
earlier"), since no printed time was captured.

---

## 2026-09-03 — The week verdict (syl)

**Asked.** Ken's verdict dispatch: great strides versus pre-Covid in shows and food;
lack of attention to detail and "Norwegian first customer service policies" weigh them
down; he is undecided about returning and his mother certainly is not.

**Weighed.** Kept his structure, because the order IS the argument: credit first, then
the two weights, then the split decision. His coinage "Norwegian first customer service
policies" rendered as "customer-service policies that put Norwegian first" — same idea,
unambiguous to a reader who hasn't met the phrase. Every supporting fact is a recap of
something already on the page (four order errors, the cabin arc, three billing errors,
the $2.75 lock, the prepay/beverage-package mechanic, the unkept report promise), so the
verdict argues from its own evidence rather than importing new claims. No invented detail
about what NCL was like pre-Covid — that comparison is Ken's, from sailings this page
does not document. Two lines are mine and flagged as editorial in the sidecar: the
crew-versus-policy distinction, and the closing "the kitchen isn't what they need to
fix." I judged the crew paragraph necessary rather than decorative: without it the piece
reads as an attack on the people who were, by Ken's own scoring, the best part of the
week — Timothy, Jewel and Hristina are all named in praise elsewhere on the page, and the
verdict would be unfair to them if it let "Norwegian" mean "the crew."

**Decided.** Verdict section published after Day 5; ai-summary refreshed to carry it;
sidecar records the dispatch verbatim, the editorial additions, and the not-claimed list
(no loyalty status for his mother, no claim she has quit cruising generally — the
dispatch said "be back", so the page limits it to Norwegian; no claim Ken has ruled them
out).

**Unsure.** Whether Ken wants the mother's decision stated that plainly. He gave it to me
in exactly those terms and it is the strongest sentence in the piece, so it stands — but
it is about a family member, and one word from him softens or cuts it.

---

## 2026-09-03 — Day 5: the logbook comes ashore (syl)

**Asked.** Ken's final dispatch: disembarkation quick, easy, orderly; they dragged their
feet and were among the last off; breakfast a little chaotic but no worse than the last
morning in the MDR warrants; then hot pressed Cubans and a picnic in the Everglades at a
pavilion over the water with rocking chairs and usually a good breeze.

**Weighed.** Two structural calls. (1) The bookend: boarding was smooth Monday and
disembarkation smooth Friday, and every real failure this week happened in a cabin, at a
table, or on a folio — that is arithmetic over the published entries, and it is the
fairest summary sentence the page can carry without pre-empting a verdict. (2) The
verdict itself: Ken never answered whether the week gets a closing score on this page, so
the entry does NOT invent one. It states plainly that the verdict will be written with
distance rather than in the parking lot, which is both true and a commitment the page can
be held to. Breakfast chaos is explicitly not counted against the ship, matching Ken's
own framing. The Everglades location and pavilion are left unnamed because the dispatch
left them unnamed. The no-breeze callback links to Day 1 rather than restating it.

**Decided.** Day 5 section written and published; sidecar records the deferred verdict as
a stated commitment rather than an omission.

**Unsure.** Whether Ken wants the week verdict on this page or as its own piece — the
text is written so either works.

**Honest limit.** Found and repaired a real defect while editing: the ai-summary meta tag
carried a stray `>` (`"/>>`) from an earlier edit in this series, producing malformed
markup that the validator did not catch. Repaired and the summary refreshed through Day
5. Worth noting the validator has no well-formedness check on meta tags — that gap let a
broken tag ship.

---

## 2026-09-03 — Reader-support CTA is now a publishing requirement, enforced (syl)

**Asked.** Ken: "make sure the buymeacoffee link is required for an article to be
published."

**Weighed.** A rule that lives only in a doc gets missed — the whole point of the
directive is that no future article ships without the ask, including ones written by a
sibling or by Ken in a hurry. So this belongs in the validator, which already gates
publication and already treats missing analytics as a hard error; the support CTA is the
same class of defect (the site's funding model is reader support, so shipping without
the ask is a defect, not a style choice). Scoped to pageType === 'article' so hub, tool,
index and port pages are exempt by design, and skipped for redirect/truncated pages that
bypass structural checks anyway. Implemented by threading the already-computed
detection.type into runBasicValidation rather than re-detecting.

**Decided.** New hard error `basic/support_cta` in admin/validate.js. Verified with a
negative fixture, not just a positive one: a copy of a real article with the CTA block
stripped FAILS on exactly that rule, and the unmodified article passes — proving the
rule bites rather than merely existing. Full corpus re-run: 52/52 PASS.

**Unsure.** Voyage packs are not covered — they are not validated by this script and
their CTA rollout is still blocked on the factcheck-gate decision. If Ken wants packs
mechanically gated too, that is a separate check in the pack tooling.

---

## 2026-08-28 — Reader-support CTA on every article and voyage pack (syl)

**Asked.** Ken: put https://buymeacoffee.com/inthewake with a CTA in every article and
voyage pack — "Was this helpful? Buymeacoffee. However you think is best. Unobtrusive,
but visible."

**Weighed.** Checked for prior art before inventing: support.html and voyage-packs.html
already use BMC with a house pattern (brand #0e6e8e, rel="noopener", pill/inline links),
so the block matches that rather than introducing a new style. Placement: a bordered
aside immediately before </article> — outside itemprop="articleBody", so a donation ask
is not folded into Article schema content. Anchor verified unique in all 52 article
files before any bulk edit. Link hygiene: articles use the site-relative /support.html;
packs use ABSOLUTE cruisinginthewake.com URLs because packs ship as PDF and offline HTML
where relative links break. Wording keeps the site's actual differentiator ("takes no
money from cruise lines or travel agents") so the ask reinforces the independence claim
instead of undercutting it — this is reader funding, not industry funding, and it is not
an affiliate link (so no rel="sponsored", which is reserved for the gear links).

**Decided.** SHIPPED: 52 articles. DEFERRED to an operator decision: all voyage packs.
The pack edits were written, their 25 PDFs regenerated (pandoc + weasyprint installed to
do it properly rather than ship sources newer than deliverables), and then BACKED OUT —
because the original-research factcheck gate blocks any pack .md commit whose
.factcheck.json is older than the source. That gate is mtime-based, and a boilerplate
support footer carries no factual claim, so its prescribed remedy ("re-verify the claims
that changed") has nothing to verify. The two ways past it are both operator calls, not
mine: bump last_factcheck_date (which would assert a verification that did not happen —
an unearned stamp, refused) or --no-verify (an operator switch). Deliberately EXCLUDED
from the pack set regardless, when it does ship: the six *handoff-card* packs
(wallet/emergency contact cards — a tip jar on an emergency card is the wrong instrument
in the wrong moment) and v0.1-v0.1.2-FACT-CHECK.md (internal QA doc).

**Unsure.** Whether the handoff-card exclusion matches Ken's intent — he said "every
voyage pack" and I read emergency cards as out of that spirit; one word from him
reverses it. Open question for Ken: the cleanest long-term fix is teaching the factcheck
gate to compare claim-bearing content rather than mtime, so boilerplate never trips it —
but that is a harness change and needs its own review, not a same-breath edit. Also surfaced and fixed a PRE-EXISTING defect while sweeping:
articles/cruise-tech-photography-guide.html was missing both analytics blocks (absent in
the committed version too, verified via git show) and was the only article failing the
validator; it now carries the same block as its 51 siblings and passes.

---

## 2026-08-26 — Day 3 photos: the plaque becomes the source (syl)

**Asked.** Third Day 3 dispatch: five Nassau photos — staircase gorge, steps with
waterfall, the interpretive plaque, a surrey at Shirley Street, the Nassau Public
Library sign.

**Weighed.** The earlier entry deliberately carried no staircase history because the
only available source was training data. The plaque photo changes that: it is a legible
primary source photographed by the operator, so the entry now carries the history — but
ONLY the plaque's telling, attributed in text as the plaque's, with the plaque photo
published beneath as the receipt. No adjudication of the plaque against other accounts
(that would reintroduce training-data sourcing). Two photos required orientation fixes,
verified visually before publish. Crowd shots follow the Quantum embarkation-line
precedent for public-place photography; captions identify no one.

**Decided.** History paragraph + five figures added to the Nassau section; sidecar
records the plaque as primary source with the printed-facts list; published live.

**Unsure.** Nothing material — every printed fact is on the photographed plaque.

---

## 2026-08-26 — Day 3: Nassau on foot, and Wasabi's clean sweep (syl)

**Asked.** Second Day 3 dispatch: Nassau wander (Queen's Staircase walked from the top,
shopping, conch fritters), a nap, and Wasabi — everything a 10 start to finish, including
Jewel the waitress.

**Weighed.** Two discipline points. (1) The Queen's Staircase gets no imported history —
the Nassau port page is the guide; the logbook records only what Ken did there. (2) The
prediction: tonight's dinner was the self-booked BOGO, and the lazy read would score the
prediction as beaten because mom's meal was effectively free. The entry explicitly
refuses that — the wager was about the ship's own promised gesture, so it stays open and
unscored, stated in text. Jewel named in praise per the crew pattern; 'no asterisks
tonight' earns its plainness against the page's own eights-with-an-asterisk record.

**Decided.** Two h3s (Nassau, Wasabi) with port and venue cross-links; sidecar updated;
published live.

**Unsure.** What was ordered at Wasabi — not dispatched; the all-10s verdict stands
without dish detail unless Ken sends it.

---

## 2026-08-26 — Day 3 opens: breakfast splits the difference (syl)

**Asked.** First Day 3 dispatch: breakfast verdicts — waffles very good but cold,
blueberry syrup good, runny yolks, fresh fruit, steak finally cooked appropriately,
bacon never came.

**Weighed.** The dispatch's own contradiction (waffles very good AND cold) is the most
human thing in it — both kept. The steak is the doneness column's first win after two
overcooked days, and the missing bacon is order-accuracy event four; both counts are
arithmetic on published events. 'The last thirty feet between the pan and the plate' is
the three-day synthesis — cooking quality consistent, delivery execution the weak leg.
Deliberately NOT placed in Nassau: arrival hasn't been dispatched, so the entry doesn't
locate the ship. Standing freshness obligation executed: all three stamps to 08-26,
ai-summary refreshed to carry Day 2's close and Day 3's opening.

**Decided.** Day 3 h2 opened with two paragraphs; sidecar updated; published live.

**Unsure.** Which venue served breakfast — not dispatched, not named.

---

## 2026-08-25 — Fix: the uncommittable task mirror (banned-string redaction) (syl)

**Asked.** Ken: "Fix it" — the standing condition where admin/UNFINISHED_TASKS.md sat
uncommittable for two days because HLS-mirrored task rows carry the hard-banned
adversarial-SEO string, and the pre-commit ban scans the whole staged file.

**Weighed.** Four candidate fixes. (a) Exempt the mirror path in the guard — rejected:
the guard's own doctrine reserves exemptions for files that DOCUMENT the ban, and
widening a ban to get past it is the exact move the household forbids. (b) Rename the
catalog task_ids — rejected: ids are referenced by the hash-chained event log; renaming
breaks history correlation. (c) Regenerate the mirror wholesale — rejected after
inspection: the file is a hybrid (generated header + hand-authored spec sections);
regeneration would destroy real content. (d) CHOSEN: redact at mirror-serialization —
library.mjs now carries per-repo MIRROR_CONTENT_REDACTIONS (the banned substring becomes
'g•tbets' in mirror rows only), applied in both write paths (full regenerate + register
append, with dual-spelling dedupe), plus a 4-test suite attacking case variants and
idempotence. The catalog SSOT and event log are untouched; the guard stays fully armed;
the three existing occurrences in this file were hand-redacted to match.

**Decided.** Mirror redacted here; the mechanism lives in open-claw-stuff library.mjs
with tests; the HLS conflict task will be returned with this as evidence.

**Unsure.** Whether the mirror's redacted id spelling ('itw-seo-g•tbets-monitor') will
confuse someone grepping the mirror for the raw id — mitigated by the dedupe handling
both spellings, and the mirror header already says the catalog is the SSOT.

---

## 2026-08-25 — Day 2 late: the toenail thread resolves, acceptably (syl)

**Asked.** Sixth Day 2 dispatch: steward returned with a much better vacuum job, no
toenails visible — "Is it perfect? No. But it is acceptable now." — plus his rhetorical
"What is the acceptable number of toenails? On a luxury cruise?" and a free load of
laundry offered.

**Weighed.** The close needed Ken's exact balance: resolution without absolution. The
rhetorical question is left standing as asked, with one deliberate word change flagged
in the sidecar — "luxury" dropped ("On a cruise?") because NCL is not a luxury line and
the site's precision standard reads that as a classification even inside rhetoric; if
Ken wants his sting back, it's one word. The laundry comp is printed at his lukewarm
register and explicitly firewalled from the sushi prediction so tomorrow's scoring stays
clean. "Fixed slowly, fixed eventually, acknowledged modestly" is the editorial ledger
line on facts already published.

**Decided.** One h3, three short paragraphs, published live; sidecar records the
luxury-word departure for operator review.

**Unsure.** Whether dropping "luxury" was the right call — fidelity vs precision cut
against each other; chose precision and flagged it rather than choosing silently.

---

## 2026-08-25 — Day 2 evening: dessert roulette and the '90s shows (syl)

**Asked.** Fifth Day 2 dispatch: dessert ordered as a chocolate thing with one scoop
arrived as two scoops of ice cream ('Haha. More of the same'); a good, deliberately
campy '90s pop-culture show (Friends, Blockbuster, Bop It, boy bands); a mediocre
comedy show redeemed by not telling the standard six cruise-ship jokes.

**Weighed.** The dessert miss is the third order-accuracy event on the page, and Ken's
own tone has shifted from grievance to amusement — so the entry follows him there
(scratch-off framing: 'the bruschetta proved you can win these; two scoops is a push')
rather than re-litigating the pattern sternly. Kept his vagueness about the dessert's
name instead of guessing a menu item. The six-jokes line kept near-verbatim — it's a
better sentence than any substitute.

**Decided.** Dessert folded into the dining thread; one evening h3 for both shows;
sidecar updated; published live.

**Unsure.** Which venues hosted the shows — not dispatched, not named.

---

## 2026-08-25 — Day 2 dinner: the chowder and the minutemen (syl)

**Asked.** Fourth Day 2 dispatch: bruschetta reordered on purpose (fantastic again),
spinach artichoke underseasoned, pork chop oversalted and hurt by canned tomatoes,
bluefish 10/10, and the New England clam chowder as the standout — carrying Ken's family
history (grandfather's New England line back to the minutemen; his Floridian grandmother
learned their chowder) and the Alaska-benchmark comparison. Dessert to follow.

**Weighed.** The chowder paragraph is the heart: family history printed close to
verbatim with nothing genealogical invented, because that lineage is exactly the
lived-grade anchor no model could fake and it's what makes 'one of the best in decades'
mean something. The salt inconsistency (under in one dish, over in the next, same
course) extends the already-published loose-execution pattern by arithmetic, not new
claim. Bruschetta 'on purpose this time' pays off yesterday's accident. Venue still
unnamed because still undispatched.

**Decided.** One h3, four paragraphs, dessert promised as dispatched; sidecar with typo
normalizations; published live.

**Unsure.** Nothing material; the one gloss ('made it her own') is recorded in the
sidecar.

---

## 2026-08-25 — Day 2 lunch: room service scored, and the kitchen pattern named (syl)

**Asked.** Third Day 2 dispatch: room-service lunch verdicts (BLT excellent but small;
Cobb 6/10 with dry chicken, missing requested vinaigrette, fantastic blue cheese; flank
steak 8/10 overcooked but tender, fantastic chimichurri) and an afternoon at Spice H2O
(tubs and pool full, shady table found).

**Weighed.** The new editorial move is the kitchen-pattern paragraph: two days of scores
now support a synthesis — flavors consistently land while misses cluster in exactly two
columns, doneness (two overcooked steaks in two days) and order accuracy (vinaigrette
after the bruschetta). Every input to that synthesis is already on the page, so it's
arithmetic on the operator's own scores, not a new claim; 'good kitchen, loose
execution' is the reading and is presented as such. 'Ship underway' in the Spice H2O
line is grounded in the published itinerary (Nassau arrival is Tuesday evening).
Spice H2O cross-linked to its existing venue page.

**Decided.** One h3, three paragraphs (scores, pattern, Spice H2O), sidecar with typo
normalizations recorded, published live.

**Unsure.** Whether the pattern paragraph lands as fair synthesis or premature — two
days is a small sample, which is why it's phrased as 'holding steady' rather than
settled.

---

## 2026-08-25 — Day 2: the staff meeting, Timothy, and the toenails that outlasted the vacuum (syl)

**Asked.** Second Day 2 dispatch: a staff meeting about the room held in the room
("Didn't feel heard"); maintenance re-sent for three doors; trim-repair plans; Timothy
praised by name; toenails still on the floor; and the irony that the requested comp is
basically the ship's own BOGO promotion.

**Weighed.** The entry has to hold two truths at once without letting either soften the
other: the fix-it machinery is genuinely working (doors, trim plans, Timothy — named
first-name-only in praise, the site's lived-grade crew-mention pattern) while the
original grievance is genuinely unfixed (toenails persisting THROUGH a vacuum visit —
both facts already on the page, so stating the contradiction is arithmetic, not
amplification). "Didn't feel heard" printed verbatim with zero invented meeting detail.
The irony sharpens the standing prediction honestly: the requested gesture is literally a
running promotion, so the bar is lower and the prediction more damning if missed — Ken's
own point, framed as such.

**Decided.** One h3 with four paragraphs (meeting, follow-through, the toenail
sentence, the irony), sidecar with normalized typos recorded, published live.

**Unsure.** What the staff meeting actually decided — unknown and unwritten.

---

## 2026-08-25 — Day 2 opens: breakfast, the Wasabi BOGO, and the wheels question (syl)

**Asked.** First Day 2 dispatch (voice-dictated): breakfast done right including the
hot-milk poached-eggs family tradition; salmon toast; a BOGO specialty-dining sale and a
Wasabi booking for tomorrow; and two accessibility observations — a power chair allowed
hallway storage for a man who couldn't get an accessible cabin, and the pool/hot-tub
lift regime (24-hour notice, exact minutes, lift not left deployed; none seen out here,
told they exist).

**Weighed.** The accessibility material is the sensitive part. The hallway-chair story
is this sailing's own observation and printed as such. The lift policy is Ken's
experience of "some Norwegian ships" plus "appears to be the same way here" — every hedge
kept, no fleet-policy claim made, because the difference between "the lift exists" and
"the lift is usable the day you want to swim" is exactly the gap our accessibility page
and the Jewel lawsuit article already cover; both are cross-linked so the logbook
observation lands inside existing site context. The Wasabi booking intersects the open
comp prediction, so one bracketed sentence notes the family now pays either way — which
keeps the prediction scoreable rather than muddied. Dictation artifact 'walked to the
ship' normalized to 'walked the ship'; sidecar records it.

**Decided.** Day 2 h2 opened with breakfast + BOGO paragraphs and a 'How this ship
treats wheels' h3; published live per the daily pattern.

**Unsure.** Whether the pool-lift regime here truly mirrors the other ships — the entry
commits to watching the pool deck all week rather than concluding.

---

## 2026-08-24 — The anonymity rule goes in print (syl)

**Asked.** Ninth dispatch, a methodological one: Ken did not and will not tell the ship
he's a travel writer — "Keeps integrity high. If they won't do it for an average person.
They won't do it for me either that way."

**Weighed.** Where it lives: it governs the whole week, so the standing intro gets the
rule; but the acute misreading risk sits in the Day 1 prediction paragraph, where "I'd
write about it" could be read as something said to the crew — so a terms-of-the-test
paragraph lands there too. This also resolves the previous entry's flagged worry about
that line: the anonymity statement makes it unambiguous that nothing was said aboard.
The rule materially raises what the logbook is worth to readers — every response
recorded this week is NCL's average-guest response — and that's stated as the point
rather than left implicit.

**Decided.** One sentence added to the standing intro; one paragraph added after the
sushi prediction; sidecar records the verbatim basis; published live.

**Unsure.** Nothing material.

---

## 2026-08-24 — Day 1 closes: the ship answered, and a prediction goes on the record (syl)

**Asked.** Eighth and final Day 1 dispatch: vacuum sent, door handle repaired, TV fixed —
same night; the sushi-dinner-for-mom request "noted in the report"; Ken's read that
comping it is cheap goodwill that sells a second meal, that it would be appreciated, and
that he doubts it happens.

**Weighed.** The page had just printed skepticism ("'apparently,' which is the word you
reach for…"), so honesty required walking that back explicitly when the ship delivered
same-night — "'apparently' turned out to be unfair" — rather than quietly absorbing the
good news. Scope discipline: only a vacuum was dispatched, so the entry does not claim
the toenails-and-detritus cleaning is resolved; that stays a morning question. The
sushi-dinner doubt is framed as an explicit, scoreable prediction — the logbook's own
device: it committed to judging the ship by its response, so it should also commit its
author's predictions to the record where they can be wrong in public.

**Decided.** Two paragraphs closing the cabin thread (the answer + the open thread with
prediction), sidecar updated, published live.

**Unsure.** Whether "I'd write about it" reads as soliciting a comp — judged no, since
the whole page already declares everything gets written about, good and bad alike.

---

## 2026-08-24 — Day 1: early departure, scuttlebutt handled as scuttlebutt, cabin list grows (syl)

**Asked.** Seventh Day 1 dispatch: Facebook-group screenshot showing the ship left port
before 9 p.m. (hours ahead of the ~3 a.m. plan) with passenger explanations — shore-tie
test successful, propulsion below full force / ~7 knots slower, waiter's vague engine
remark; photos of the Bremerhaven plaque and the Getaway model; TV and door lock broken,
maintenance "apparently" coming.

**Weighed.** The sourcing question is the whole entry. The departure is fact — Ken is
aboard and replying inside the thread's premise. Every explanation is hearsay, so all of
it is printed under an explicit label ("passenger scuttlebutt, some of it secondhand from
crew, none of it official"), fellow passengers are not named, and the screenshot is used
as a source but never published (other people's names and faces). The tempting move —
declaring the evening's engine runs were the shore-tie test — is printed only as "a guess
stacked on a rumor," and the shore-power verdict the page owes is explicitly held open
for better sourcing than a Facebook thread. The earlier "3 a.m." heat note was not
rewritten: a logbook corrects forward, so the new section opens with the correction.
Plaque caption: describes what is legible (Seestadt Bremerhaven) and ties only to the
already-published Meyer Werft build fact (verified present on our ship page before
citing); no claim about what the plaque commemorates, which we don't know.

**Decided.** One new underway section (departure + labeled scuttlebutt + two photos) and
a short cabin-list section (TV, door lock, Ken's "apparently" kept). Published live.

**Unsure.** Why the ship actually left early — deliberately unresolved in print. Whether
the plaque is maiden-call exchange hardware — plausible, unverified, therefore unwritten.

---

## 2026-08-24 — Day 1 dessert + the food-game thesis (syl)

**Asked.** Sixth Day 1 dispatch: dessert (warm chocolate lava cake, cookies-and-cream
gelato, raspberry coulis, mint leaf) and the day's dining thesis — "Even with the foibles
its clear NCL had stepped up their food game."

**Weighed.** The thesis is the first overall evaluative claim about NCL on this sailing,
so it matters that it stays in Ken's shape: foibles conceded first, then the judgment.
The foibles list in the printed sentence recaps only misses already published on the page
(Reuben, strip, salad-as-bruschetta) — no new claims smuggled in. No dessert score was
dispatched, so none was printed. "Stepped up" relative to which earlier sailing was not
dispatched, so the comparison stays unanchored in print rather than invented.

**Decided.** Dessert appended to the dinner paragraph; thesis as its own short closing
paragraph. Sidecar updated; published live per the daily pattern.

**Unsure.** Whether "the hits were the kind you don't get by accident" over-reads the
thesis — it's my gloss on 10/10 lobster + 9/10 bruschetta standing next to the slips;
flagged here so it's reviewable.

---

## 2026-08-24 — Day 1 dinner verdict (syl)

**Asked.** Fifth Day 1 dispatch: lobster 10/10 buttery perfection; strip 8/10, docked for
overcooking; cheese ravioli in lobster sauce good but the lobster note muted; ordered a
Greek salad, received bruschetta — which scored 9/10.

**Weighed.** The "verdict to come" sentence in the published entry: replaced it with the
verdict rather than appending a second dinner paragraph, since both landed the same day
and a reader shouldn't wade through a fulfilled promise to reach its fulfillment. Scores
kept exactly as dispatched; "wasn't singing as loudly as the other notes" kept nearly
verbatim because it's Ken's phrase and better than anything I'd substitute. The
wrong-dish story written as the small comedy it is — no complaint amplification, the
bruschetta outscored the salad that never came. Dinner venue still unnamed in print
because it still hasn't been dispatched.

**Decided.** Verdict folded into the existing Day 1 dining section, sidecar updated with
the dispatch-vs-framing split, published live per the daily pattern.

**Unsure.** Nothing material.

---

## 2026-08-24 — Day 1 dining + engine runs (syl)

**Asked.** Fourth Day 1 dispatch: O'Sheehan's lunch (fish and chips good — crunchy
outside, moist inside; Irish Reuben unbalanced, too much acid), dinner NY strip + two
lobster tails with verdict promised later, and engines being started and run off and on
all evening.

**Weighed.** Venue name: dispatch says "o Sheehans (oceans)" — used O'Sheehan's (the
operator's own name for it, and our venue page exists at restaurants/ncl/osheehans.html);
left "(oceans)" out rather than guess what it meant. Dinner venue wasn't named, so the
entry doesn't name one. Engines: the observation sits right next to the shore-power
question, and the temptation is to conclude the ship isn't plugged in — resisted, because
engine runs at a pier have innocent explanations (pre-departure checks among them) and
the shore-power report is Ken's to make with more than a sound. Wrote it as an observed
detail plus the open question.

**Decided.** Two short h3s appended to Day 1 (dining, engines) with the venue cross-link;
sidecar records dispatch-vs-framing including normalized typos and the not-claimed list.
Published live per the daily pattern.

**Unsure.** What "(oceans)" meant in the dispatch — flagged in the sidecar instead of
guessed. What the engine runs actually were — deliberately left open in print.

---

## 2026-08-24 — Day 1 heat note: no breeze on a stationary ship (syl)

**Asked.** Third Day 1 dispatch: "No breeze on a cruise ship that's not moving. It's hot
in South Florida today."

**Weighed.** Where it goes: still Monday, so it's a Day 1 append, not Day 2. What it
means: the observation only lands with the physics behind it (deck breeze is mostly the
ship's own motion), stated generically — no wind-speed numbers invented. The itinerary
tie is the real editorial value: a repair week built around staying in port trades away
underway evenings, and this is what that trade feels like. "Small hours" leans on the
already-published, letter-sourced ~3 a.m. departure rather than restating a time.

**Decided.** One short h3 + paragraph appended to Day 1; sidecar records dispatched facts
vs framing and the not-claimed list (no deck temps, no AC claims, no claim shore power is
connected tonight — that report is still owed). Published live per the daily pattern.

**Unsure.** Nothing material; the entry claims only what was dispatched plus generic
physics.

---

## 2026-08-24 — Day 1 evening addendum: photo evidence + the hot-tub enforcement pattern (syl)

**Asked.** Ken sent five photos from the cabins ("Some of the issues") plus a new
observation: the no-drinks-in-the-hot-tub rule enforced unevenly — alcohol fine, soda
flagged, unsweet tea flagged.

**Weighed.** Whether to publish the photos: the morning entry made a hard claim
("dirty and deteriorated") on the operator's word alone; the photos are primary evidence
taken by the author in his own cabins, which is exactly the lived-grade material this site
exists for. Published all five as WebP (site rule) under the Quantum-precedent path
`/assets/articles/<trip>/day1-*.webp`, captions describing only what each frame shows.
Framing: separated *deteriorated* (gouged laminate — deferred maintenance, not
steward-fixable same-day) from *dirty* (previous guest's garment bag, wristband, tag
scrap, carpet debris — same-day fixable), because the two have different owners and the
opportunity-to-fix standard only fairly applies to the second. Hot tub: wrote ONLY the
observed pattern in Ken's terms and disclaimed knowledge of the policy logic; the
"drinks nobody profits from" line is flagged in-text as a reading the rest of the week
should test, not a fact.

**Decided.** Appended an evening-addendum h3 + a second h3 for the hot-tub observation
inside Day 1 (a logbook appends; it doesn't rewrite the morning), updated the factcheck
sidecar with photo provenance and the not-claimed list (no claim yet on whether cabins
were fixed — that stays Day 2's entry), validated, published live to main per the
standing daily-publish pattern.

**Unsure.** Whether the hot-tub pattern is policy or one crew member's afternoon — the
entry says exactly that and defers. Photo 4 includes a corner of a family member's bare
foot; judged acceptable for an unpolished logbook rather than cropping (nothing
identifying), but easy to re-crop if Ken prefers.

---

## 2026-08-24 — Day 1 dispatch: logbook created, dirty-cabin report published as sent (syl)

**Asked.** Ken, aboard, sent Day 1: embarkation smooth; rooms dirty and deteriorated —
toenails on the floor, detritus from previous guests; "We're giving them an opportunity to
fix it."

**Weighed.** Structure (deferred until now): one running logbook page over per-day
articles — one URL for the week, day anchors, matches the Quantum logbook precedent; no
placeholder sections for future days (coming-soon content is banned). Fidelity: the entry
carries ONLY the dispatched facts; nothing invented — no cabin numbers, times, staff
interactions, meals, or sailaway color, and no shore-power observations since he hasn't
sent any (the entry defers them to Day 2 explicitly rather than pretending). Tone: the
never-chipper rule governs — the failure is stated plainly ("toenails-on-the-floor dirty"),
and the fairness posture is his own words elevated to the entry's spine: the verdict is
deferred to how the ship responds.

**Decided.** New page norwegian-getaway-aug-2026-logbook (Trip Logbooks) with Day 1 only;
hub updated so "the logbook is next" now links the live logbook; index entry added.
Because the logbook links the shore-power and GSC research pieces, the whole branch goes
to main in this pass — daily-dispatch publishing implies live publication, per the
operator's standing "make it live on main" pattern and his "stay tuned" to readers.

**Unsure.** Whether the cabin gets made right, and how fast — deliberately so; that is
Day 2's entry, not this one's speculation.

---

## 2026-08-22 — Three articles in one pass: shore power, GSC changes, cabin types (syl)

**Asked.** Ken approved all three proposed articles for today and asked that they be run
"through all of our voice skills."

**Weighed.** Sourcing per piece: shore power rests on Miami-Dade County's own program page
(terminals, $125M cost, grants, 98%-while-connected, 3-ships, ~35 seaports) with the
Getaway test-night purpose attributed to cruise media; GSC rests on NCL's own May-2026
booklet (SSOT text held in admin/sources/) for everything waterpark, with the pier
reopening deliberately marked UNVERIFIED because current reports conflict — stated as a
conflict rather than picked; the cabin guide quotes no prices or square footage at all
(they churn faster than an article should track) and anchors the balcony case in Ken's
published Quantum logbook moments rather than invented experience. Voice pipeline applied
per article: like-a-human during drafting, six-axis voice-audit self-scan and
emotional-hook-test (5/5 each) attested in the sidecars. One flagged token — "unpack" in
the shore-power piece — kept deliberately: it's the literal luggage verb, and contorting
an honest sentence to dodge a tell-list is validator-gaming in mirror form.

**Decided.** Three articles + three factcheck sidecars with voice/emotional attestations,
three index entries, and bidirectional cross-links (Getaway hub → shore power + GSC; GSC
port page → GSC article; seasickness + deck-plans → cabin guide). All three articles
carry a forward commitment the sailing week can keep: Monday night verifies shore power,
Thursday verifies the pier and lagoon pricing.

**Unsure.** Whether the GSC pier has actually reopened (the article says so plainly), and
whether the Great Life Lagoon is truly included — the booklet's silence is a signal, not
a promise; both are on the Thursday checklist.

---

## 2026-08-22 — Getaway article: booked-on-it confirmed + cross-link pass (syl)

**Asked.** Ken confirmed he is booked on the Aug 24 Getaway sailing and "will write about
the experience Daily," and asked to "cross link everything you can."

**Weighed.** The booked claim was deliberately withheld in the first pass because he hadn't
stated it; his confirmation makes it attested fact, so the dek and Who This Is For now say
it plainly — while keeping all aboard-ship experience future tense, since nothing has been
lived yet. For cross-links, every candidate surface was surveyed for a real slot rather than
bolted on: ship page (Plan Your Cruise), Nassau + Great Stirrup Cay port pages (plan-visit
lists), and the three sibling articles' Related-reading lists (Nassau brawls, itinerary
changes, Caribbean Princess power loss). Ship and Nassau validators were already failing
pre-edit (nav gold-standard drift; missing food/credits sections) — baselines captured
first so my single-list-item edits can be proven regression-free.

**Decided.** Eight surfaces updated bidirectionally; index excerpt notes the daily
dispatches; sidecar authorship_note updated with the operator's confirmation and the full
cross-link inventory. The ninth — the ship page's Plan Your Cruise link — was written,
then REVERTED and deferred: the ship-page regression guard blocks any commit touching that
file on a pre-existing js:navigation/missing_nav_items failure, and measurement showed the
validator's "gold standard" expects the deprecated flat paths (/ports.html,
/cruise-lines.html) that the page and every current article correctly avoid. The stale
side is the validator, so neither the nav nor the guard was touched; the fix (update the
gold standard + refresh audit-reports/ship-validation-dashboard.json, then add the link)
is registered in the HLS instead of bypassed with --no-verify.

**Unsure.** Where the daily dispatches will live (one logbook page vs. one article per day)
— structure decision deferred until Ken files the first one.

---

## 2026-08-22 — Norwegian Getaway Aug 24 change letter → news article (syl)

**Asked.** Ken forwarded three screenshots of NCL's guest notification for the August 24
Getaway sailing (Nassau overnight for repairs, GSC extended to 8 p.m.) and asked for a new
article in house voice — "an opportunity to see how NCL handles different things."

**Weighed.** Whether to treat the letter alone as sufficient sourcing (no — it never names
the failed system), whether to claim Ken is booked on the sailing (no — he didn't say so;
the dek says the letter "landed in my inbox," which is verifiably true either way), and
which register to use (the calm-authority news template per memory 2b89a833, mirroring
caribbean-cruise-trends-2026). Corroborated via Cruise Hive: propulsion component, the
July 31 precedent sailing, reduced speed, casino/retail closures alongside, and the
separate shore-power reason for the Miami 3 a.m. departure. Household memory b4e7d905
supplied the GSC waterpark September opening — the honest caveat on the extended island day.
HLS preflight run as patron syl; task registered; open-PR check was UNAVAILABLE (no gh) so
open PRs were checked by hand via GitHub MCP — none touch this surface.

**Decided.** Standalone news article (norwegian-getaway-nassau-repairs-overnight-2026) with
the original-vs-revised table, the three-weeks-of-repairs pattern, a fair scorecard on
NCL's handling (advance notice + both ports kept, but the system unnamed and the constraint
dressed as a gift), practical aboard notes, and no affiliate links. NCL's marketing line is
quoted once, attributed, and analyzed — not adopted as voice.

**Unsure.** Whether Ken is aboard this sailing (article deliberately doesn't claim it — one
line to add if he confirms), and whether the repairs will finish in the Nassau window; the
article says the schedule is "written in pencil" rather than promising.

---
## 2026-08-25 — NCL revised the Getaway sailing; propagate + make changes self-serviceable

**Asked** — Operator forwarded NCL's guest notice (repairs in Nassau: Miami overnight/3 AM Tue
departure, Nassau Tue 7:30 PM through Wed 11:59 PM overnight, cay extended to 8 PM) — update the
pack, and "consider a plan for people to make changes themselves."

**Weighed** — The notice's Revised column is authoritative over both the original booking
screenshot and yesterday's schedule sources; the pack keeps "the app is authoritative" hedges
since a once-revised sailing can revise again. Nassau-after-dark guidance had to be written
against the Level 2 advisory honestly (short, lit, peopled; ship as nightcap) rather than either
cheerleading the overnight or scaring people off it. For self-service: an in-page editor
(per-device only), a GitHub-edited overlay JSON, or a Worker-backed API. Chose the overlay JSON
as v1 — the deploy pipeline already exists, GitHub mobile is a realistic editor, offline
semantics stay honest — and registered the Worker-backed editor as the designed v2 on the HLS.

**Decided** — Pack fully revised (all five days, At-a-Glance, handoff card, rhythm section) with
the NCL notice cited in the sidecar; same revision applied to the family page and the Jerusha
payload (re-encrypted, round-trip verified); overlay mechanism live in both pages; family CSP
gained connect-src 'self'; sw bumped to family-v5 with the overlay excluded from caching.

**Unsure** — Evening/bar service hours on the cay during the extended call (pack says the daily
program will publish them); whether NCL's "Original" column's 3 AM pattern was itself an earlier
revision (irrelevant to guests now, noted in sidecar).

## 2026-08-21 — Getaway pack + multi-voyage family PWA (one session, three deliverables)

**Asked** — Build a voyage pack for the operator's NCL Getaway booking (Aug 24–28, sails in
three days), then carry it into the family PWA and the Jerusha PWA; then, per follow-ups:
keep the Alaska week archived rather than replaced, and add the family's World America
December sailing as an upcoming voyage.

**Weighed** — (1) Pack facts: four parallel web-research passes vs. reusing sibling-pack
content — chose research; copy-propagation is a named confabulation mode, and it would have
shipped a waterpark that doesn't open until Sept 4 (eight days after the visit) and a
"Mahogany Bay" Roatán that MSC doesn't use. The lead's own draft then got a self-audit,
which caught six unverified claims it had introduced (staircase steps, Watling's 1789, GSC
1986-vs-1977, christening date, deck count, laundry) — all re-verified or softened before
the sidecar was written. (2) Family PWA shape: single-voyage swap vs. lifecycle model —
first shipped the swap, operator corrected course (rightly), so rebuilt as a VOYAGES array
where state derives from today's date: future → current → past, active voyage computed, the
rest rendered as collapsed cards. Alaska restored verbatim from git history, nothing
retyped. (3) World America Dec: operator's booking cards said Dec 5–13; schedule research
says the sailing is Dec 5–12 (7 nights, no 8-night option that week) — trusted the two
agreeing primary schedule sources plus the cards' own Dec 12 arrival over the remembered
end date. (4) Jerusha: the payload is zero-knowledge encrypted; refused to guess until the
operator supplied the passphrase in-session; decrypted, extraction only, edits deferred per
instruction.

**Decided** — v0.1.18 pack shipped (gate green, PDF built, times cross-confirmed against
the booking screenshot); build-script staleness bug fixed (inner mtime check was overriding
the clone-stable logic — it had skipped three genuinely stale PDFs while rebuilding four
current ones); family PWA is now multi-voyage with Getaway active, World America Dec 5–12
upcoming (December normals sourced, Ocean Cay labeled as Nassau-proxy), Alaska archived;
the World America hosted-sailing shell also got the July audit's Coxen Hole / April-2025
corrections it had missed.

**Unsure** — GSC pier reopening is "two independent Aug-4 reports," not an NCL press
release — the pack hedges with a tender fallback. Port times for the December sailing
differ between aggregator listings; the booking's own times were used and the page says to
confirm in the MSC app. December Roatán rainfall figures conflict wildly across weather
sites (1 mm to 399 mm); the page states "rainy season, expect showers" and declines a
number.

## 2026-08-21 — MSC World America Dec 5, 2026 sailing: fact-verification pass (web-only, no memory)

**Asked.** Verify the MSC World America sailing "Dec 5th–13, 2026" for a voyage pack: exact
dates/nights, day-by-day itinerary with times, dock-vs-tender per port, ship quick facts,
and December weather normals per port. Hard rule: every fact from a page fetched this
session; nothing from training memory.

**Weighed.** Aggregator schedule sites disagree on details, so each class of fact needed
two independent fetched sources where possible. cruisetimetables.com rate-limited WebFetch
(429) — fetched raw HTML via curl instead and parsed it directly, which yielded the full
timetable text verbatim rather than a summarizer's paraphrase. MSC's own site is JS-heavy
and returned no itinerary data; press releases and PortMiami's official terminal page
filled the terminal/ship-fact gaps.

**Decided.** The sailing is Dec 5–12, 2026 (7 nights), not Dec 5–13 — no 8-night departure
exists in the Dec 4–7 window; reported that correction explicitly. Itinerary taken from
cruisetimetables (times) cross-checked against iCruise (ports/dates). Dock-vs-tender from
CruiseMapper port pages + cruisehive. Ship GT reported as 216,638 (Cruise Hive +
CruiseBooking) with CruiseMapper's 215,863 flagged as a conflict (matches World Europa's
GT — likely their error, but flagged, not silently dropped). Weather from currentresults
(Miami, Nassau), weather2travel (Roatan), holiday-weather (Cozumel), with bad datapoints
(holiday-weather's "1 mm December rain" for Roatan) called out rather than averaged away.

**Unsure.** Port times are aggregator-listed, not MSC-confirmed; cruisetimetables itself
shows Ocean Cay 0800–2000 on the 7-night listing but 0700–1800 on the overlapping 14-night
listing for the same class of call. One search summary showed a 16:30 Miami departure vs
cruisetimetables' 17:00. Ocean Cay December normals proxied from Nassau (nearest published
climate station) — stated as a proxy. MSC's Cozumel pier varies (Punta Langosta or
International Pier); reported as such, not pinned.

---

## 2026-08-12 — the guard was shipping a detector it could not find (P0, measured)

**Asked.** Continue the merge campaign into this repo. Two of the six branches carrying
unapplied work both touched the same P0 surface — the dangerous-command detector and its
guard hook — so they needed deciding together rather than one at a time.

**Weighed.** The obvious reading was "two lanes fixed the same thing, pick the better one."
Measuring first said otherwise: the detector in this repo is **byte-identical** to
`origin/main` (2,093 lines, zero diff). Nothing to choose. The whole change is 38 lines in
the guard *hook*, and it is about **resolution**, not detection.

The hook looked for the detector at exactly one path, `../../cluster/lib/dangerous-command.mjs`.
This repo has no `cluster/` directory — the onboarding installer copies the detector to
`.claude/hooks/lib/` instead. So the import threw, the `catch` block engaged, and the guard
ran on six inline regexes while the real 2,093-line detector sat unread beside it. A guard
that fails to a weaker guard reports nothing; it just quietly gets worse.

**Decided.** Took the merge, then measured what it buys instead of asserting it. Re-running
the fix's own battery against the fix would only measure agreement, so I ran **one probe set
against both states** — main's inline fallback and the merged detector — with every payload
an inert string handed to a scanner, never a shell.

Result: **4 of 16 catastrophic shapes are ALLOWED on main in this repo** — `rm -rf /*`, the
var-rooted `rm -rf /$X/*`, and `rm -rf /` nested in both `$()` and backticks. All four block
after the merge. I also checked the other direction, because over-blocking is a real failure
and not a safe one: six ordinary commands (`rm -rf ./dist`, `rm -rf node_modules`, a grep whose
*text* contains `rm -rf /`) stay allowed. Verified on `.blocked`, not `.dangerous` — a shape
can be flagged dangerous and still pass.

**Unsure.** This closes the gap in *this* repo only. The same shape — guard installed by the
onboarder into a repo with no `cluster/` — is a property of the installer, so any other repo
onboarded the same way is a candidate for the identical hole, and I have not swept for that
here. The fallback is also still a fallback: if both candidate paths fail the guard drops to
six patterns again rather than refusing, which is a deliberate fail-open I did not change
mid-merge but do not think is right for a safety boundary.

_Runtime: Claude Code_

## 2026-08-11 — merge every unmerged branch into main (superset where possible)

**Asked.** Ken: go repo by repo, branch by branch, merge everything unmerged into main;
prefer a superset where possible, and where not, the best-coded version. This repo was the
third of four.

**Weighed.** `git branch --no-merged` listed ~110 branches here, which would have been a
month of merging. That count is a lie of a specific kind: a squash-merged branch is reported
as unmerged forever, because its commits never appear upstream by SHA. Measuring
patch-equivalence with `git cherry` instead showed only **6** branches carry any unapplied
commit; every other branch is already absorbed. I merged the 6 and left the rest, rather
than merging ~110 branches to reach the same tree.

Local `main` also held one commit of Ken's own, unpushed for two weeks — a 365-line ship-facts
remediation script plus 258 edited ship pages. `git cherry` confirmed it is genuinely absent
upstream, so dropping it was not an option. But origin/main had moved 62 commits since,
including the SSOT cruise-line fixes (#2500–#2505) that touch the very blocks this commit
rewrites. An old commit merged onto a corrected base wins wherever the two touched different
lines — no conflict, no marker, and the newer fix silently disappears.

**Decided.** I merged it, then hunted the revert rather than trusting the clean merge. Reading
the diff would not have worked: a unified diff renders a MOVED line as a deletion, and the raw
count was 155 "lost" lines across 258 files. Comparing **occurrence counts** per file instead —
position-blind, and with whitespace normalised, because the remediation script re-indents the
key-facts block — cut that to 3, of which exactly one was content.

That one was real. `ships/rcl/discovery-class-ship-tbn.html` said, on main, that gross tonnage
and capacity "have not been published yet". The generated template overwrote it with "entered
service in TBD, measures TBD gross tons" — asserting that a ship still on order entered service,
and printing literal TBD into prose a reader sees. Honest uncertainty replaced by a fabricated
placeholder. I restored main's sentence and kept the merge's added Key Facts rows: the superset
is the newer prose *and* the new rows, not a choice between them.

**Unsure.** Two `<ul>` tags still register as lost; both are markup restyled in place and I
verified every `<li>` inside them survives, but that is an eyeball on two lines rather than a
measurement. I did **not** touch six other ship pages that already carry TBD in the same prose
slot on main — pre-existing, and widening a merge to fix content is how a merge stops being
reviewable. They are worth a ledger row.

Also measured and left alone: `.githooks/pre-commit` exits **0** on this machine while eleven of
its own checks error out (`mapfile` is bash 4+; macOS ships 3.2). Every gate it advertises —
ship-lock, regression diff, image reuse, voyage-pack PDF staleness, factcheck — is armed and
silently skipped. Pre-existing on main and not caused by any merge here, but a guard that
reports success while validating nothing is the false-CALM this household forbids, and it
should not stay quiet.

_Runtime: Claude Code_

## 2026-08-11 — rysn: household sync of soli-deo-gloria (a link that resolved in only one repo)

**Asked.** Propagate the canonical `soli-deo-gloria` change made in the household SSOT. This repo's
copy was one of sixteen behind it.

**Weighed.** The change is one line: a sibling-relative link, `../destructive-command-safety/SKILL.md`,
replaced with the household-qualified path `open-claw-stuff/skills/destructive-command-safety/SKILL.md`.
That matters precisely because this skill is synced byte-identical into every repo — a relative link
resolves in `open-claw-stuff` and is dead everywhere else, including here. So the copy that read
correctly in one place was silently broken in fifteen others, on a P0 posture skill pointing at the
destructive-command doctrine.

I did not author this fix; a sibling did, and I verified it before propagating rather than trusting
it: the target exists, and the failure it describes is the same one I had just committed myself in
`careful-not-clever` (repo-relative `docs/...` paths that resolve only in the SSOT). Their reasoning
is right and mine had been wrong in the same way.

**Decided.** Sync it here, byte-identical to canonical, and commit — a sync written into a working
tree and never committed is how the household's manifest came to assert "in sync" for four months
about files that never existed on any main branch.

**Unsure.** Nothing about this change. The uncertainty is upstream and recorded there: whether
household-qualified paths should be the standing convention for every synced skill, or whether
synced skills should stop citing cross-repo paths at all.

## 2026-08-10 — The reasoning guard here was bypassable; fixed (UL-210)

**Asked.** Operator: "Proceed as recommended." The named item was propagating the UL-210 fix to
the leaves still carrying the broken reasoning-log guard. This repo is one of five that had it.

**Weighed.** The guard ran from `pre-commit` and read its `[no-reasoning]` opt-out from
`.git/COMMIT_EDITMSG`. That file is stale there: for `git commit -m`, git writes it only *after*
pre-commit succeeds, so the guard read the PREVIOUS commit's message. Measured live in
open-claw-stuff, both directions — a commit carrying the marker was BLOCKED, and worse, after a
commit whose message contained the marker had landed, the NEXT substantive commit carrying no
marker was silently ALLOWED. A false pass on the layer the doctrine calls runtime-independent.

I considered re-running the behavioural probes here to confirm. I did not: proving it a second
time needs a commit that must then be undone, and that same cleanup pattern destroyed real work
twice earlier in the session. The copied files are byte-identical to the canonical ones already
verified, which is the same evidence without the risk.

**Decided.** The guard moved to `.githooks/commit-msg`, the only hook git hands the real message
(as `$1`); the opt-out reads `$1` and nothing else, and without it the opt-out is simply
unavailable so the guard blocks — failing toward enforcement. The legacy call was stripped from
`.githooks/pre-commit`, which keeps its other checks. Installed by
`open-claw-stuff/admin/install-reasoning-log.mjs`, which now strips that call rather than adding
it, so re-running repairs a repo instead of double-wiring it.

**Unsure.** `core.hooksPath` is armed in this clone, but that setting lives in `.git/config` and no
clone carries it (UL-189) — so these hooks are live here and inert in a fresh checkout. The fix to
the *files* is durable; the arming is not. Tracked as `githooks-path-not-durable`.

## 2026-08-08 — Sophos now injects itself here, every session and every prompt

**Asked.** Operator directive (Ken, 2026-08-08): "Sophos should be injected in like manner in
every repo also." A cross-repo audit had found that InTheWake alone injected posture per-prompt,
and that nothing anywhere loaded Sophos itself per-turn.

**Weighed.** Two candidate models for "in like manner". InTheWake's `session-start-guardrail.sh`
prompted the finding, but it `cat`s whole files into context on every prompt — right instinct,
expensive mechanism. This household's own `reasoning-log-inject.sh` had already solved that with
a two-mode shape: a full block once at SessionStart, ONE line per turn. I reused the second
rather than inventing a third. Layer 0 is resolved at run time and the hook names which candidate
won, rather than baking a path — hard-coding one authoring machine's layout is UL-173, which this
household has already paid for once.

**Decided.** `.claude/hooks/sophos-inject.sh` is installed and wired in this repo at SessionStart
(five layers, hierarchy, publish gate, recall command) and UserPromptSubmit (one terse line), by
`open-claw-stuff/admin/install-sophos-inject.mjs`. `core.hooksPath` was deliberately left unset
here: the operator declined it separately, and arming it would be deciding for him.

**Unsure.** Injection guarantees the posture is *present*; it can never guarantee it is *held* —
this is suspenders, the belt is the bootstrap and dangerous-command guards. And in the same audit
I recommended installing the P0 dangerous-command guard into this repo, which was wrong: it is
already live via the user-level path, and that is the false-ABSENT error UL-203 had already
recorded. Nothing was installed on that premise.


## 2026-08-08 — UL-173 pointer read order deployed to this leaf (Claude)

**Asked** — Ken said "proceed" and chose "sweep the 9 remaining leaves": deploy the UL-173
fix — a mandatory Layer 0 read order must not point at a path that exists on one machine
only — into the nine household repos that were not attached to the session where the five
recipe repos were fixed. This repo is one of them.

**Weighed** — Three resolution knobs had to be set deliberately, not by default.
(1) `HOUSEHOLD_OCS_ROOT` was left **unset**. It pins the path baked into the emitted text
as resolution candidate 3, and the five already-finished repos carry
`/workspace/open-claw-stuff`; setting it would have made this leaf disagree with them for
no gain. (2) `HOUSEHOLD_REPO_ROOT=/home/user` was required: `REPO_PATHS` is baked for
Ken's Mac and the sibling-of-clone fallback also misses here, because the SSOT clone sits
in `/workspace` while the leaves sit in `/home/user` — the exact layout UL-201 added that
knob for. Without it the generator SKIPs every leaf and reports MISSING-PATH. (3) Each
clone had to be given a directory name matching its `REPO_PATHS` key exactly:
`resolveRepoRoot` joins the root with the key, Linux is case-sensitive, and GitHub hands
back lowercased repo names (`ordinarybook`, `inthewake`, `archive`), so cloning to the
name GitHub returns would have silently missed the mapping.

Verification was the same standard the Allrecipes PR carries: `/Users/kenbaker` references
30 → 0 across `CLAUDE.md`, `AGENT.md` and `admin/LIBRARY.md`; `--check` reports `ok` for
this repo; a second render is byte-identical; and the `## ` section list is unchanged
against `git show HEAD:<file>` rather than against a snapshot taken after the first render,
which would have been a false pass.

**Decided** — Rendered this leaf and shipped it. The sweep was NOT shipped whole: one of
the nine, `From-Timothy-at-Tyrannus`, was held back and reverted untouched. Its `CLAUDE.md`
carried the P0 heading twice — one stamped `v2`, one older and unstamped — and the
unstamped copy held doctrine the generator does not emit: the whole Memory-discipline
paragraph (`memory_ops.py recall`, the Slice 6 observation hook, the Slice 8 quarantine
gate, `ken/keeper/`) and the constitution paragraph ending "Silent violation is the worst
possible outcome." Regenerating would have deleted both silently, so it was reverted and
referred to Ken rather than fixed by guesswork — where that doctrine belongs (folded into
the generator for every leaf, or kept repo-local) is an operator call, not mine.

**Unsure** — Two honest limits. First, the heading-level check that is supposed to catch
this is structurally weaker than it looks: `mergePreserving` compares heading TEXT, so
hand-authored content sitting *under a heading the generator also emits* is invisible to
it. It was caught here only by luck, because that heading happened to be duplicated; one
heading with extra prose inside would have passed silently and destroyed the content. A
content-level diff was then run across all nine leaves, and everywhere except
`From-Timothy-at-Tyrannus` the only line that differs is the superseded `v2` stamp — but
that check ran because a fluke tripped it, not because the process demanded it. Second,
the pre-commit guards did not run: `core.hooksPath` is unset in these fresh clones, so
`.githooks/reasoning-log-guard.sh` is present but inert. This entry exists because it was
written, not because anything verified it. Arming that hook remains an open operator call
and was deliberately not done.

## 2026-07-30 — Reasoning log installed here (four layers, every runtime)

**Asked.** Ken asked for the reasoning log to be stronger and to cover all 16 household
repositories, capturing reasoning from any agent — Claude, Grok, Codex, the pipeline.

**Weighed.** The earlier version reached only Claude Code (SessionStart + Stop hooks), and
injected once per session, so it could drift. The gap that mattered: every other runtime —
Grok, Codex, a script, a person — was uncovered. What they all share is `git commit`, so
enforcement belongs there.

**Decided.** Installed from the household canonical kit (`open-claw-stuff`,
`admin/install-reasoning-log.mjs`): per-turn injection (`UserPromptSubmit`, not just
session start), Stop-time persistence of this file, and a pre-commit guard that BLOCKS a
substantive commit with no entry dated today. The installer also ran
`git config core.hooksPath .githooks` — without it every `.githooks` guard here was
silently inert. `[no-reasoning]` in a commit message opts a trivial change out, reviewably.

**Unsure.** The hooks guarantee the obligation is present and that what was written
survives; the guard makes omission block a commit. None of them can make an agent write a
*truthful* entry — read the log rather than trusting the machinery. Pipeline auto-capture
exists only in `open-claw-stuff`, where Atlas lives; this repo has the other three layers.

_Runtime: Claude Code_


