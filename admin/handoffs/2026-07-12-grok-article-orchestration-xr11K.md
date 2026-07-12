# Grok article orchestration session — 2026-07-12 (xr11K)

**Branch:** `claude/orchestrate-grok-article-xr11K` (all 3 repos)
**Status:** InTheWake **SHIPPED via PR #1517**; open-claw-stuff memory + HLS **committed locally in container, NOT PUSHED** (container has no git remote auth for OCS).
**Session:** `https://claude.ai/code/session_01ABbUuWM1XxTM18y5W2ggZM`

## What shipped to InTheWake

- `articles/hantavirus-cruise-ships-2026.html` — calm-voice explainer for the MV Hondius Andes hantavirus outbreak (9 confirmed, 3 deaths, one 176-pax expedition ship out of Ushuaia). ITW-Lite v3.010.400 compliant; FAQPage JSON-LD; sitemap priority 0.9 / changefreq daily for the active news window.
- `assets/data/articles/index.json` — new entry at top.
- `articles.html` — Popular Guides link.
- `sitemap.xml` — priority 0.9 entry.
- **Follow-up commit** `c4640133` added a supplementary ~5-paragraph norovirus section (Caribbean Princess May 11 2026, ~102 pax + 13 crew, deep-cleaned Port Canaveral) + a 7th FAQPage Q&A. Meta/title/lead unchanged — page remains primarily the hantavirus piece.
- Merged: **PR #1517**.

## Grok data — save-for-later article backlog

Grok delivered 4 batches of live X data article ideas (May 2026). Operator directed: use one now, save the rest for tomorrow. The hantavirus pivot was picked mid-turn. The registered HLS tasks (below) capture the top-ROI candidates per Grok's own ranking. Full Grok payload sits in the session transcript, not persisted separately (~30 candidate ideas across the 4 batches).

## Memories encoded — full content for re-encode on Mac SSOT

Container wrote these to `/home/user/open-claw-stuff/.memory/` and committed on branch `claude/orchestrate-grok-article-xr11K` (commit `1263c51`). If sync via git isn't possible, paste the commands below on Mac to recreate.

### 1. `cruising/bdd24fd0` — episode

```bash
python3 ~/ocs-work/ken/orchestrator/memory_ops.py encode cruising episode "2026-07-12 session: Orchestrated + shipped articles/hantavirus-cruise-ships-2026.html for InTheWake — calm-voice explainer for the MV Hondius Andes hantavirus outbreak (9 confirmed, 3 deaths, one 176-pax expedition ship out of Ushuaia). Grok delivered 4 batches of live X data article ideas May 2026 (general planning, health/Carnival/family, Mystery Island, Florida departures); operator chose top-priority hantavirus angle (a pivot mid-turn away from initial norovirus pick because pandemic-fear framing was the actual driver). Article structure: answer-first, timeline, virus explainer, why-not-a-pandemic, shipboard outbreak comparison table (noro/COVID/flu/Legionella/Andes), action items sorted by itinerary type, cruise-line response, 3 personas, FAQ w/ FAQPage JSON-LD. Voice: name the dead first, name the fear, then the math. Refused pandemic frame without dismissing grief. Merged via PR #1517 to InTheWake main. Follow-up commit c4640133 added ~5-paragraph norovirus supplementary section (Caribbean Princess ~102 pax + 13 crew, deep-cleaned Port Canaveral 2026-05-11) plus 7th FAQPage entry. Grok ROI backlog remaining: Norovirus 2026, Costa Maya Worth It, Cruise Budget Calculator demo, First-Time Cruiser Checklist 2026." --tags cruising,article-shipped,hantavirus,inthewake,pr-1517,ken-baker-voice,grok-orchestrate
```

### 2. `cruising/923621e7` — pattern (outbreak voice)

```bash
python3 ~/ocs-work/ken/orchestrator/memory_ops.py encode cruising pattern "InTheWake outbreak/health-panic content voice pattern (validated on hantavirus article shipped 2026-07-12): (1) Name the dead first — 'Three people are dead. A 70-year-old Dutch man who fell ill on April 6 and died on April 11...' — before any statistical framing. Their families are the first true thing. (2) Then the harder second thing: 'this is not the start of another pandemic' — don't dismiss the fear, contextualize it. (3) Sort action items by itinerary type BEFORE the epidemiology so readers who only want 'what do I do' can stop after section 3. (4) Refuse pandemic framing without dismissing grief — 'this virus does not pandemic, it hurts the people it reaches badly.' (5) Close with pastoral turn: 'if you're sailing soon and reading this at 2 a.m., the math is bounded, the rodent is not on your ship, the fear is real and the trip is fine.' (6) Structural: FAQPage JSON-LD (7 Q&As), comparison table (contested pathogens with primary spread / R / CFR / prevention columns), sitemap changefreq=daily + priority=0.9 during active news window. Reusable for future noro/COVID/Legionella cruise-health pieces." --tags cruising,voice,outbreak-content,ken-baker,pattern,itw-lite-3010,aeo,faq-schema --related bdd24fd0
```

### 3. `cruising/a6662e0c` — fact (article template layout)

```bash
python3 ~/ocs-work/ken/orchestrator/memory_ops.py encode cruising fact "InTheWake article file/directory conventions (verified 2026-07-12 against ITW-Lite v3.010.400): (a) New articles go in /articles/<slug>.html with the tipping template (see articles/cruise-tipping-2026.html:1-384 as gold standard). (b) Register the article in assets/data/articles/index.json — top of the array for newest. Fields: id, slug, title, url, date, published, status='published', excerpt, thumbnail, image, author {name, url, image}, keywords array. (c) Add link in articles.html Popular Guides section (~line 316) — the JS grid populates from index.json but the Popular Guides list is hand-curated. (d) Add sitemap entry in /sitemap.xml with lastmod, changefreq (daily for active news, weekly for planning, monthly for evergreen), priority (0.9 for timely, 0.7 for planning, 0.6 for evergreen). (e) Required meta: version=3.010.400, page:version=3.010.400, content-protocol=ICP-2, last-reviewed, ai-summary ≤80 words per ai-summary-rewriter skill. Required JSON-LD: Article + Person + BreadcrumbList; FAQPage if the piece has an FAQ block. Required page structure: hero-header with compass + logo + tagline, solo-article class, ICP-2 'Answer first' callout box, Ken Baker byline linking /authors/ken-baker.html, closing 'Last Reviewed' section with datetime. Soli Deo Gloria HTML comment at top." --tags inthewake,file-layout,article-template,itw-lite-3010,icp-2,checklist
```

### 4. `shared/bbbe4477` — pattern (Gemini adapter bug)

```bash
python3 ~/ocs-work/ken/orchestrator/memory_ops.py encode shared pattern "orchestrator/cruising-mode Gemini adapter failure (observed 2026-07-12): python3 /home/user/ken/orchestrator/orchestrate.py cruising <task> loads GPT + Grok + Perplexity + You.com adapters cleanly, but Gemini adapter dies with 'ModuleNotFoundError: No module named _cffi_backend' during import (pyo3-backed google-generativeai). Pipeline continues gracefully — step consult_completeness prints 'Unknown model gemini. Skipping.' and total cost lands around \$0.035 for 2 loops * (GPT structure + Grok challenge) instead of the intended 6 external steps. Fix path (untested): pip3 install cffi in the orchestrator env, or add cffi to /home/user/ken/orchestrator/requirements.txt. Workaround if not fixed: accept the reduced fleet — GPT for structure critique, Grok for adversarial UX challenge is enough for most cruising-mode article runs." --tags orchestrator,cruising-mode,gemini,adapter-failure,cffi,fix-untested
```

### 5. `shared/d6c59fa2` — observation (container access map)

```bash
python3 ~/ocs-work/ken/orchestrator/memory_ops.py encode shared observation "Container access map for /home/user/-rooted Claude Code sessions (verified 2026-07-12): Fully writable and accessible — /home/user/InTheWake (git remote OK, push works via local proxy 127.0.0.1:43635), /home/user/ken (read/write, no git remote auth), /home/user/open-claw-stuff (read/write including .memory/ and .household-library/, no git remote auth). NOT accessible — the Mac SSOT at /Users/kenbaker/ocs-work (referenced in InTheWake/ken CLAUDE.md pointer files). memory_ops._resolve_memory_root() correctly resolves to /home/user/open-claw-stuff/.memory/ via sibling-discovery — writes land in the persistent tracked store. library.mjs register works and writes catalog.jsonl + events.jsonl on this container (its stdout message references a Mac path because that's where the operator syncs; ignore that path — the write is local and syncs on git push/pull later). Implication: this container does NOT need sibling-bus handoff pattern e7bf541b, because the sibling-bus was designed for containers that CAN'T see open-claw-stuff. This container can. Full memory + HLS encode works directly." --tags container-access,sibling-bus,memory-system,hls,ocs-work,path-map
```

## HLS tasks registered — full re-register commands

Container wrote these to `/home/user/open-claw-stuff/.household-library/catalog.jsonl` (same OCS commit `1263c51`). If sync isn't possible:

```bash
cd ~/ocs-work

node admin/library.mjs register --title "InTheWake article: Norovirus on Cruises 2026 (Caribbean Princess) — standalone piece" --repo InTheWake --priority 1

node admin/library.mjs register --title "InTheWake article: Costa Maya Worth It or Skip It 2026" --repo InTheWake --priority 2

node admin/library.mjs register --title "InTheWake article: Cruise Budget Calculator 2026 (tool demo)" --repo InTheWake --priority 2

node admin/library.mjs register --title "InTheWake article: First-Time Cruiser Checklist 2026" --repo InTheWake --priority 3

node admin/library.mjs register --title "ken orchestrator: fix Gemini adapter (pip install cffi in bootstrap-env or requirements.txt)" --repo ken --priority 3

node admin/library.mjs mirrors --repo InTheWake
node admin/library.mjs mirrors --repo ken
git add .household-library docs/HOUSEHOLD-TASK-INDEX.md
git commit -m "hls: register 2026-07-12 grok article backlog + gemini adapter fix"
git push
```

## Operator follow-up sequence (Mac SSOT)

**Option A — sync-from-container (preferred if reachable):**

```bash
# On Mac
rsync -av --update <container>:/home/user/open-claw-stuff/.memory/ ~/ocs-work/.memory/
rsync -av --update <container>:/home/user/open-claw-stuff/.household-library/ ~/ocs-work/.household-library/
cd ~/ocs-work
git status  # confirm expected files
git add .memory .household-library docs/HOUSEHOLD-TASK-INDEX.md
git commit -m "memory+hls: sync 2026-07-12 xr11K session from container"
git push
```

**Option B — re-encode from this handoff (if container isn't reachable):**

1. Paste the 5 `memory_ops.py encode` commands above (§ Memories encoded).
2. Paste the 5 `library.mjs register` commands above (§ HLS tasks registered).
3. Commit and push OCS.

Container HEAD on `open-claw-stuff` before disconnect: **`1263c51`** — parent `b69ba7f`.

*Soli Deo Gloria.*
