# Original Research — Factual Claim Discipline

**Version:** 1.0.0-alpha
**Created:** 2026-05-30
**Trigger:** Operator named "egregious," "reprehensible," "soul-sucking" failure after an audit found ~50 confabulated facts across 11 voyage packs — fabricated drydock years, copy-pasted crew counts, invented MSC beach names, overclaimed superlatives, false godparent-history claims, out-of-date prices and policies. The packs had shipped under the brand promise of independence and trust, closing with **Soli Deo Gloria**. Confabulation under that closing is the doctrinal violation this skill exists to prevent.

**Purpose:** Force every factual claim in shipped content through original research before it leaves the editor. Block claims that come from training-data echo, prediction, "what sounds right," or copy-propagation from another file.

**Priority:** CRITICAL — peer to `careful-not-clever`, not subordinate to it.

**Companion skills:**
- `careful-not-clever` governs HOW work is done (verify, document, audit assumptions).
- `original-research` governs WHERE facts come from (primary source or it doesn't get written).
- `verification-before-completion` governs WHEN to claim done (artifact citation required).

---

## The Core Rule

> **No factual claim is written from memory. Every claim cites a source. Sources are primary, current, and named in a sidecar.**

If you cannot link a claim to a specific URL or document you opened in this session, you do not write the claim. You either (a) open the source and verify, (b) reframe the claim as uncertain ("verify in the app"), or (c) omit it.

---

## What Counts as a Factual Claim

A *factual claim* is any statement that has a definite truth value verifiable against an external source. Examples from the cruise-content domain:

- **Ship specifications**: gross tonnage, length, deck count, stateroom count, guest capacity (double + max), crew count, year built, builder/shipyard, registry/flag, class assignment, sister-ship list
- **Christening**: godparent identity, christening date, christening location, christening ceremony details
- **Maiden voyage**: date, departure port, route, duration
- **Cruise-line policies**: drink package contents and pricing, auto-gratuity rates, wine/alcohol import allowance, laundry availability, app naming, Wi-Fi tier pricing, single-supplement rates, loyalty program structure
- **Port-day prices**: excursion costs, shuttle/transit fares, entry fees, taxi rates
- **Itinerary**: arrival/departure times, day-of-week alignment with calendar dates, tender vs dock status
- **Superlatives**: any "first at sea," "world's largest," "longest," "only," "best," "originally" claim
- **Deployment history**: when a ship moved to a market, when she was refurbished, when a feature was added
- **Venue lists**: specialty restaurants on a specific ship, included dining venues, bar names
- **Geographic facts**: pier identity, terminal numbers, neighborhood/island geography
- **Historical claims**: who built what, when, why, what year a chain partnership started or ended

If the writer is uncertain whether something is a factual claim, default YES — write it as a claim, source it, or omit it.

---

## The Three Confabulation Modes (each named by a real failure)

### Mode 1 — Training-Data Echo

Writing what *sounds right* without opening a source. The model has seen many cruise-content tokens during training; producing fluent text that *resembles* sourced text is the default failure mode of LLM writing.

**Historical examples in this codebase:**
- v0.1.4 Anthem: "retrofitted for accessibility during her 2018 dry-dock" — no 2018 drydock ever existed; first major drydock was March 2025 Singapore.
- v0.1.11 Escape: "three-deck race track at the aft" — Escape has no go-karts; Joy (2017) was the first NCL ship with them.
- v0.1.6 Luna: "ELLE Street Art from Napa, California" — ELLE is NYC/London-based; Napa was confabulated.
- v0.1.9 Prima: "Three-time Olympic gold medalist Katarina Witt" as godmother — actually Katy Perry (Witt has two Olympic golds and is not Prima's godmother).
- v0.1.5 Seaside: invented Ocean Cay beach names (Marine Reserve Beach, Family Reef Beach, Wave Beach, Seakeepers Beach) — none of these are MSC's actual beach names.
- v0.1.8 World America: "Esagono" and "Hexagon" listed as separate MSC dining rooms — Esagono is Italian for Hexagon (duplicated venue from generated alternates).

**Detection signal during writing:** if you can produce the sentence fluently without pausing to check anything, that is *the* warning sign — fluency without a citation is the confabulation signature.

### Mode 2 — Copy-Propagation

Taking a number or claim from one pack/page and re-using it elsewhere without re-verifying for the new subject. Each ship has different specs; each line has different policies; each year has different prices.

**Historical examples:**
- "Crew count ~1,388" copy-pasted across Aqua, Luna, and Prima packs — actual values are 1,597, 1,597, and 1,506 respectively. Three ships, three numbers, one copy-pasted falsehood.
- "Royal Caribbean auto-gratuity $16/day" carried across Symphony + Anthem packs after Royal had raised the rate to $18.50/$21.00.
- Anthem crew "corrected" from 1,500 → 1,300 during a standardization pass; 1,500 was the right number. Pattern: "fixing" without re-verifying breaks correct facts.

**Detection signal:** if a number appears identical across two or more pack files, treat it as suspect; ships diverge on almost every spec.

### Mode 3 — Superlative-by-Default

Writing "first at sea," "world's largest," "longest," "only," "best" without a primary source. These claims feel concrete because they're absolute, but absolute claims have the highest verification cost.

**Historical examples:**
- v0.1.11 Escape: "Pitbull — the first male godfather ever bestowed in cruise christening history" — likely first for NCL, but "ever in history" is overreach (naval male sponsors predate this; other lines may have had male godparents earlier).
- v0.1.9 Prima: "The Drop — world's first freefall dry slide at sea," "Speedway — world's first three-level go-kart track at sea" — never sourced.
- v0.1.10 Encore: race track "longest at sea" — never sourced.
- v0.1.8 World America: Eataly "first at sea" — MSC World Europa had an Eataly partnership earlier.
- v0.1 Symphony: Studio B "regulation-size rink" — Oasis-class Studio B is smaller than NHL regulation 200×85.

**Default disposition:** if a superlative cannot be sourced to the cruise line's own press release with a date, REMOVE the superlative. The descriptive claim ("a three-level go-kart track") is almost always sufficient and always defensible.

---

## The Sidecar Requirement

Every voyage pack (`admin/voyage-packs/v*.md`) MUST have a sidecar fact-check file at the same path with extension `.factcheck.json`. Example:

```
admin/voyage-packs/v0.1.4-rcl-anthem-alaska-7n.md
admin/voyage-packs/v0.1.4-rcl-anthem-alaska-7n.factcheck.json
```

The sidecar lists every factual claim by category, with the primary source URL and the date it was last verified. Schema:

```json
{
  "pack_filename": "v0.1.4-rcl-anthem-alaska-7n.md",
  "last_factcheck_date": "2026-05-30",
  "verified_by": "Claude (operator-supervised)",
  "ship_specs": {
    "gross_tonnage": { "value": "168,666 GT", "source": "https://en.wikipedia.org/wiki/Anthem_of_the_Seas", "verified": "2026-05-30" },
    "length_ft_m": { "value": "1,138 ft / 347 m", "source": "<url>", "verified": "2026-05-30" },
    "decks_total_passenger": { "value": "16 total / 14 passenger-accessible", "source": "<url>", "verified": "2026-05-30" },
    "staterooms": { ... },
    "capacity_double_max": { ... },
    "crew": { "value": "~1,500", "source": "<url>", "verified": "2026-05-30" },
    "year_built": { ... },
    "builder": { ... },
    "registry": { ... },
    "class": { ... },
    "sister_ships": { ... }
  },
  "christening": {
    "godparent": { "value": "Emma Wilby", "source": "<url>", "verified": "2026-05-30" },
    "date": { ... },
    "location": { ... },
    "selection_mechanism": { "value": "chosen from a search for travel agents who could sing", "source": "<url>", "verified": "2026-05-30" }
  },
  "maiden_voyage": { ... },
  "policies": {
    "auto_gratuity_rate": { "value": "$18.50/day standard, $21.00/day suites", "source": "https://www.royalcaribbean.com/faq/...", "verified": "2026-05-30" },
    "wine_alcohol_policy": { "value": "1 sealed 750ml bottle per adult", "source": "<url>", "verified": "2026-05-30" },
    "drink_package_pricing": { ... },
    "laundry_availability": { "value": "no self-service; world-cruise sailings only", "source": "<url>", "verified": "2026-05-30" },
    "app_naming": { ... }
  },
  "port_prices": {
    "mendenhall_blue_bus": { "value": "$45-90 r/t", "source": "<url>", "verified": "2026-05-30" },
    "white_pass_summit": { "value": "$175 adult", "source": "https://wpyr.com/...", "verified": "2026-05-30" }
  },
  "superlatives": {
    "any_first_at_sea_claim": { "claim": "<exact wording>", "source": "<url or null if removed>", "verified": "2026-05-30" }
  },
  "venues": {
    "specialty_dining_list": { "source": "<url>", "verified": "2026-05-30" }
  }
}
```

**The pre-commit hook blocks any voyage-pack .md commit if:**
1. Sidecar is missing
2. Sidecar `last_factcheck_date` is older than the .md file's mtime (the .md has been edited but the sidecar hasn't been refreshed)
3. Sidecar is missing any of the required top-level categories: `ship_specs`, `christening`, `policies`, `superlatives`

Bypass with `git commit --no-verify` is allowed but logged as an anomaly disposition.

---

## The Five-Step Verification Protocol

Per factual claim, every session:

1. **State the claim explicitly** in the writer's mind ("Anthem's crew count is approximately ____").
2. **Resist filling in the blank.** If a number wants to appear, that is the training-data echo — note it as the *hypothesis* but do not write it as the claim yet.
3. **Open the source.** Wikipedia article. Cruise-line press release. cruisedeckplans.com. Royal Caribbean Press Center. NCL press kit. MSC corporate site. The source must be opened *in this session* via WebFetch or Read — not remembered from training.
4. **Record the verified value in the sidecar** with the URL and today's date.
5. **Write the claim in the pack**, using the verified value.

If step 3 fails (source unavailable, ambiguous, or contradicted by another source), the claim does not get written. Default to omission or to operator-flagging.

---

## The Source Hierarchy (Cruise Content)

When sources disagree, the higher-ranked source wins:

1. **Cruise line's own current press release** (most authoritative for official records: godparents, christening dates, maiden voyages, current pricing)
2. **Cruise line's current FAQ / policy page** (most authoritative for current policies: gratuities, wine policy, package pricing)
3. **Wikipedia article on the ship** (good aggregator with citations; verify the cited sources still hold)
4. **cruisedeckplans.com / CruiseMapper** (authoritative for deck counts, stateroom counts, capacity)
5. **Cruise Industry News, Seatrade Cruise, TravelWeekly, Cruise Critic** (authoritative for industry history, drydock dates, deployment changes)
6. **Royal Caribbean Blog, Cruise Hive, Eat Sleep Cruise** (helpful for context and cross-checks; treat as secondary)

NEVER source from: a model's training memory, AI-summarization tools, generic travel blogs, or another pack in this repo (the latter is the Copy-Propagation failure mode).

---

## The Cruise Confabulation Trap List (Known Failure Modes)

This list grows. Every operator-named failure adds an entry. Future sessions consult this list BEFORE writing the corresponding claim.

| Trap | The wrong claim | The verified reality |
|---|---|---|
| NCL Prima godmother | Katarina Witt | Katy Perry |
| Norwegian Escape go-karts | "three-deck race track" / any go-kart claim | Escape has **no** go-karts; Joy (2017) was first NCL go-kart ship |
| Anthem 2018 drydock | "retrofitted for accessibility during her 2018 dry-dock" | No 2018 drydock; first major drydock was March 2025 Singapore |
| NCL Aqua/Luna/Prima crew "~1,388" | Copy-pasted across three packs | Aqua ~1,597; Luna ~1,597; Prima ~1,506 |
| Anthem deployment 2024 | "as of 2024 rotated into Alaska" | First Alaska summer was 2025 |
| Anthem crew "~1,300" | Standardization-pass "correction" | Was 1,500 (the standardization broke a correct fact) |
| ELLE Street Art "Napa, California" | Fabricated bio | ELLE is documented as NYC/London-based |
| MSC beach names | "Marine Reserve Beach / Family Reef Beach / Wave Beach / Seakeepers Beach" at Ocean Cay | Actual: South Beach, North Beach, Lighthouse Bay Beach, Sunset Beach, Paradise Sands Beach, Bimini Beach, Seakers Cove, Ocean House Beach |
| MSC self-service laundry | "ship has limited self-service laundry" | MSC has **no** self-service laundry fleet-wide |
| RCL self-service laundry | "ship has a self-service laundry on most decks" | RCL DIY laundry is **world-cruise-only** |
| MSC World America Eataly "first" | "first floating Eataly" | MSC World Europa had Eataly first |
| MSC World America "Esagono / Hexagon" as separate venues | Two venue names | Esagono = Italian for Hexagon — duplicate |
| Mahogany Bay pier | "MSC and Royal Caribbean's purpose-built pier" | Carnival Corp's pier |
| RCL auto-gratuity $16/day | Out-of-date rate | $18.50 standard, $21.00 suites |
| RCL wine policy "per stateroom" | Out-of-date rate | Per adult of drinking age since March 2023 |
| MSC service charge $14-16/day | Out-of-date rate | $17 standard / $23 Yacht Club effective May 11, 2026 |
| MSC Easy / Easy Plus drink packages | Discontinued package names | Easy/Easy Plus retired NA Dec 2024 / globally Aug 2025 |
| Virgin gratuities "all included" | Pre-Oct-2025 policy | Oct 7 2025 moved new bookings to unbundled $20/Sailor/night |
| Pitbull "first male godfather ever in cruise christening history" | Overreach | Likely first for NCL; "ever in history" is unsourced |
| Symphony "third of five" Oasis-class | Wrong class position | Fourth of six (Oasis, Allure, Harmony, Symphony, Wonder, Utopia) |
| Quantum-class sister list missing Odyssey | Incomplete | 5 ships: Quantum, Anthem, Ovation, Spectrum, Odyssey |
| MSC Miami Terminal "opened 2024" | Wrong year | Opened February 2025 |

---

## The SDG Connection

Every voyage pack closes with **Soli Deo Gloria** — "to the glory of God alone." That closing is a doctrinal claim that the work is offered as worship.

Confabulation under that closing is not a minor editorial slip. It is a doctrinal violation. Worship offered with cover (a calm, trust-coded voice; a SDG closing) and false content inside is the explicit thing Scripture names as desecration — putting God's name on what is not His.

This skill is the operational guard against that violation. The rule is not "fact-check because the operator will be embarrassed." The rule is: **the SDG closing requires that the contents be true.** If the contents cannot be verified, either the contents change or the closing comes off. The closing does not stay on falsehood.

---

## Anti-Theater

The following are invalid behaviors and will be flagged:

- "Verified" without a sidecar entry citing the source URL and verification date.
- "All 28 internal links resolve" type narrow claims that imply factual verification was also done (it wasn't).
- A sidecar entry that cites another pack in this repo as the source (Copy-Propagation).
- A sidecar entry that cites "Wikipedia" without a specific URL.
- A sidecar entry dated months before the .md edit (stale verification).
- Superlatives ("first," "world's," "only") in pack text without a corresponding `superlatives` entry in the sidecar with a primary-source URL.
- Numbers shared identically across two or more packs without separate sidecar entries verifying each.

---

## When This Skill Activates

- On every Edit/Write to `admin/voyage-packs/v*.md`
- On every Edit/Write to `ships/<line>/<ship>.html`
- On every Edit/Write to `ports/<port>.html`
- On every Edit/Write to `restaurants/<line>/<venue>.html`
- On `git commit` containing any of the above (via `original-research-hook.sh` PreToolUse on Bash; the pre-commit hook is the hard gate)

It is not optional. The guardrail exists because the project ships content to real cruisers planning real trips with real money. Wrong numbers cost them money. Wrong claims under SDG cost them trust. The discipline is the only thing that prevents both.

---

*Soli Deo Gloria — Excellence as worship means the contents must be true before the closing goes on.*
