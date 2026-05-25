# Session Handoff — 2026-05-25 — claude/review-website-docs-W1n7w

**Branch:** `claude/review-website-docs-W1n7w`
**Last local commit:** `0eb28802` (merge of origin/main into branch after the v3 framework skill additions)
**Current main HEAD:** `32296f1d` (force-pushed; reverted multiple recent PR merges)
**Working tree:** clean

---

## Critical state — main was force-pushed; three articles lost

A `git push --force` on `origin/main` happened between `e662b9dd` (last clean main HEAD we'd merged in) and `32296f1d` (current main HEAD). The force-push dropped PR merges `#1572`, `#1573`, and `#1574` from main. Three articles I committed and pushed to my branch are no longer on main and are 404 on the live site.

### Articles missing from main / 404 on live

| Article | Local commit | Live URL status |
|---|---|---|
| `articles/cruise-travel-safety-shore-side-net.html` | `caef7cbe`, edited `4f3ba437` | 404 |
| `articles/perfect-day-mexico-rejected-2026.html` | `f62866f1` | 404 |
| `articles/msc-voyagers-club-status-match-from-rcl-diamond.html` | `f62866f1` | 404 |

### Articles preserved on main / live

| Article | Status |
|---|---|
| `articles/msc-seaside-service-review.html` | live ✓ |
| `articles/royal-caribbean-vs-msc.html` | live ✓ |
| `ports/cabo-san-lucas.html`, `ports/ensenada.html`, `ports/nassau.html`, `ports/cococay.html` (field notes addenda) | live ✓ |
| `ships/rcl/quantum-of-the-seas.html`, `ships/rcl/radiance-of-the-seas.html` (field notes addenda) | live ✓ |

### Skill updates also missing from main

| File | What's on my branch but not main |
|---|---|
| `.claude/skills/voice-audit/SKILL.md` | AI-Tell Detection Framework v3 section (v2.2.0) |
| `.claude/skills/like-a-human/SKILL.md` | AI-Tell Discipline rules section with positive/negative examples (v3.2.0) |
| `.claude/skills/voice-audit/falsification-test.md` | New file — three Spurgeon passages as falsification anchors |

### Recovery path

The work is intact on `claude/review-website-docs-W1n7w`. A new PR merge from that branch to main re-lands the missing articles and skill updates. Recommend running the PR through the normal review process — do not push to main directly per CLAUDE.md guardrails.

Whoever ran the force-push may have had reason. Confirm intent before re-merging in case the revert was deliberate (e.g., the cruise-travel-safety article needed editing before going live).

---

## In-flight work paused on user decision

The cruise-travel-safety article was being expanded to international scope (per-country consular emergency contacts for US, UK, Canada, EU, Australia/NZ, and other regions). Research is complete; per-country content is drafted in working notes; not yet committed.

User then added a directive: when a non-English-locale visitor is detected, the page should translate to their mother tongue. This is a significant scope expansion. The current state is **paused waiting on user decision** between four options presented in the last response:

- **Option A** — browser-native translation + English source (recommended)
- **Option B** — human-translated per-country safety blocks only, English narrative
- **Option C** — full multi-language article in 8+ languages (separate project)
- **Option D** — Google Translate widget

When the user confirms an option, the per-country content + selector + JS can ship as a single complete commit.

### Verified consular emergency numbers (research done, ready to use)

- US State Dept: +1-888-407-4747 (US/Canada), +1-202-501-4444 (abroad)
- UK FCDO: +44 20 7008 5000 (24/7)
- Canada Global Affairs: +1 613 996 8885 (24/7, collect calls accepted; WhatsApp +1-613-909-8881; Signal +1-613-909-8087)
- Germany Auswärtiges Amt: +49 30 1817 2000
- France Crisis and Support Centre: +33 1 43 17 34 34 (24/7)
- Italy Farnesina Unità di Crisi: +39 06 36225 (24/7)
- Spain Unidad de Emergencia Consular: +34 91 379 9700 (24/7 emergencies)
- Netherlands NetherlandsWorldwide: +31 247 247 247 (24/7)
- Australia DFAT: +61 2 6261 3305 (from overseas), 1300 555 135 (within Australia), 24/7
- Brazil Itamaraty Plantão Consular: +55 61 98197-2284 (24/7, WhatsApp)
- Singapore MFA Duty Officer: +65 6379 8800 (24/7)
- New Zealand: 24/7 line via safetravel.govt.nz (specific number not surfaced cleanly)
- Japan MOFA: no single 24/7 line — use nearest embassy/consulate

Plus: EU Directive 2015/637 (any EU embassy serves any unrepresented EU citizen), UK GHIC, EU EHIC, Australia/NZ reciprocal healthcare agreements.

---

## Other work completed this session

- Michelle Townsend bio rewrite (offline content for missionfirst.ai, not on this site)
- v3 AI-Tell Detection Framework + falsification test in both InTheWake and ken repos (see `ken` repo branch `claude/review-website-docs-Nh7hZ` for the ken side)

---

## Recommended next steps

1. Investigate why main was force-pushed. If it was intentional revert, confirm whether the dropped articles should remain dropped or be reworked before re-landing.
2. If re-landing: open a new PR from `claude/review-website-docs-W1n7w` to main. Three articles re-land + three skill files updated + falsification-test.md added.
3. Once cruise-travel-safety is back on main, resolve the in-flight translation decision (Option A/B/C/D) and execute the international per-country expansion.
4. After successful PR merge, the live URLs should serve again within a few minutes via GitHub Pages deployment.

---

*Soli Deo Gloria*
