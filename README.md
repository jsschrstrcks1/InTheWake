# In the Wake — cruisinginthewake.com

A Christ-shaped cruise planning website for ordinary travelers.

> **Soli Deo Gloria.** Every line of code and every word of content is
> stewardship. Excellence as worship means getting it right, not getting
> it fast.

**Production:** [https://cruisinginthewake.com](https://cruisinginthewake.com)

---

## Table of Contents

- [What this site is](#what-this-site-is)
- [Site at a Glance](#site-at-a-glance)
- [Architecture](#architecture)
- [Page Types](#page-types)
- [Content Standards](#content-standards)
- [Interactive Tools (PWA)](#interactive-tools-pwa)
- [Development](#development)
- [Validation & Hooks](#validation--hooks)
- [Critical "Never Do" Rules](#critical-never-do-rules)
- [Multi-LLM Integration](#multi-llm-integration)
- [Documentation Map](#documentation-map)
- [Contributing](#contributing)

---

## What this site is

**In the Wake** helps real people make real decisions about cruise travel.
The audience is wider than the typical cruise blog:

- First-time cruisers who don't know which port to book or what to pack.
- Widows and widowers planning a first solo trip after loss.
- Disabled travelers who need accurate accessibility information.
- Caregivers looking for rest without abandoning the people they care for.
- Families balancing kids, grandparents, and dietary needs in one cabin.

Every port page, ship page, and tool answers a question someone is
actually asking — usually with a budget on the line, often with grief in
the background. The voice is honest, calm, and concrete: not chipper, not
performatively heavy.

---

## Site at a Glance

| Metric | Value |
|---|---|
| Total pages | ~1,241 |
| Ship pages | 295 across 5 cruise lines (RCL, NCL, Virgin, MSC, Carnival) |
| Port pages | 387 |
| Restaurant / venue pages | Many (RCL, NCL, Virgin, MSC, Carnival) |
| Solo travel articles | Multiple under `/solo/articles/` |
| WebP images | 4,475 (682 of them ship images) |
| JSON data files | 1,310 in `assets/data/` |
| Service Worker | v14.3.0 |
| Page template | v3.010.305 (some at v3.010.300 / v3.010.400) |
| CSS query | `?v=3.010.400` on new pages |

> Numbers are ground-truth as of the last `claude.md` audit. They drift —
> the canonical source is whatever the validator reports today.

---

## Architecture

```
/
├── index.html
├── ships/index.html          # Hub (NOT /ships.html)
├── ships/<line>/<slug>.html  # 295 ship pages
├── ports/                    # 387 port pages
├── restaurants/              # Dining venue pages
├── solo/articles/            # Solo travel articles
├── tools/                    # Port tracker, ship tracker, calculators
├── assets/
│   ├── css/                  # styles.css?v=3.010.400
│   ├── data/                 # 1,310 JSON files
│   └── ships/                # 682 WebP images (4,475 total)
├── new-standards/            # Official consolidated standards (foundation + v3.010)
├── standards/                # Legacy — SHIP_PAGE_STANDARD.md, drink-calculator.md
├── admin/claude/             # Claude documentation
└── admin/UNFINISHED_TASKS.md
```

All internal links are **absolute HTTPS** URLs. There are no relative
links in production HTML. The `/ships.html` URL does not exist — the hub
is `/ships/index.html`.

The site is a **Progressive Web App**:

- `manifest.webmanifest` — PWA manifest
- `sw.js` — Service Worker (precaching, offline fallback)
- `offline.html` — offline fallback page
- `_headers` / `.htaccess` / `nginx-cache-headers.conf` — host-level cache rules

---

## Page Types

| Type | Path | Standard |
|---|---|---|
| Homepage | `/index.html` | Hero + compass pattern |
| Ships hub | `/ships/index.html` | `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` |
| Ship page | `/ships/<line>/<slug>.html` | `standards/SHIP_PAGE_STANDARD.md` (v2.0, gold standard) |
| Ports hub | `/ports.html` | `new-standards/v3.010/PORT_PAGE_STANDARD_v3.010.md` |
| Port page | `/ports/<slug>.html` | `new-standards/v3.010/PORT_PAGE_STANDARD_v3.010.md` |
| Restaurant page | `/restaurants/<line>/<slug>.html` | Voice/logbook standards |
| Article | `/articles/<slug>.html` | `new-standards/v3.010/LOGBOOK_ENTRY_STANDARD_v3.010.md` |
| Tool page | `/tools/<name>.html` | Per-tool spec |

Every HTML file must have the **Soli Deo Gloria** comment before line 20.
This is immutable — not for SEO, not for performance, not for anything.

---

## Content Standards

The site is governed by a layered standards system. When sources
conflict, defer in this order:

1. `admin/claude/PASTORAL_GUARDRAILS.md` — pastoral care and theological
   foundation override everything.
2. `.claude/skills/careful-not-clever/CAREFUL.md` — integrity and
   carefulness override efficiency.
3. `claude.md` (architecture, never-dos, priorities).
4. `admin/claude/TECHNICAL_STANDARDS.md` — implementation patterns.
5. `new-standards/` — page-type specifics.
6. `admin/UNFINISHED_TASKS.md` — current work queue.

### Voice

- Honest, calm, concrete. Facts over superlatives.
- The "logbook entry" pattern uses an authentic emotional pivot — never
  flattened into something chipper.
- Pastoral content (grief, disability, caregiving) is non-negotiable.
- Negative reviews are surfaced and contextualized, not hidden.

### Integrity (inviolable)

- **Never use training data as a source.** Ship stats, IMO numbers, crew
  counts, tonnage, build dates, etc. come from on-page data, repo JSON,
  or original research (`WebSearch`, `WebFetch`, `/consult`, `/investigate`).
- **Never game the validator.** Reverse-engineering regex patterns to pass
  automated checks is a blocking integrity failure.
- **Never use placeholder images.** Blocking error, no exceptions.
- **Never commit invalid JSON.** Validator catches it; pre-commit blocks it.

---

## Interactive Tools (PWA)

The site ships with several JavaScript tools that handle real money
decisions. Each is testable in isolation via the `webapp-testing` skill.

| Tool | File | Purpose |
|---|---|---|
| Drink Calculator | `drink-calculator.html` / `drink-calculatorv2.html` | Compares drink package value across 15 cruise lines |
| Drink Packages overview | `drink-packages.html` | Side-by-side package comparison |
| Stateroom Checker | `stateroom-check.html` | Validates a stateroom against 270 ship-data JSON files |
| Countdown | `countdown.html` | Trip countdown widget |
| Packing Lists | `packing-lists.html` / `packing.html` | Packing checklists by trip type |
| Search | `search.html` | Site-wide search |
| First Cruise | `first-cruise.html` | Onboarding for first-timers |
| Disability at Sea | `disability-at-sea.html` | Accessibility planning |
| Internet at Sea | `internet-at-sea.html` | Wi-Fi packages compared |
| Solo travel | `solo.html` + `solo/articles/` | Solo cruising planner & articles |

---

## Development

### Local serve

```bash
python3 -m http.server 8000
# or
npx serve .
```

Open <http://localhost:8000/>.

### Linting

```bash
npm install        # one-time
npx eslint .       # JavaScript lint (eslint.config.js)
```

### Link checking

```bash
lychee --config lychee.toml .
```

### Page validation

The canonical ship-page validator is `admin/validate-ship-page.sh`. It is
wired to:

- The Claude Code post-write hook: `.claude/hooks/ship-page-validator.sh`
- The git pre-commit hook: `.githooks/pre-commit`
  (enable with `git config core.hooksPath .githooks`)
- The page-type dispatcher: `admin/validate.js`

The previous JavaScript validator at `admin/legacy/validate-ship-page.js`
is kept for reference only — it enforced obsolete rules (ICP-Lite v1.4,
ai-breadcrumbs comments, character-identical descriptions) that ICP-2
explicitly removed. Do not resurrect it without porting its checks into
the canonical shell validator first.

---

## Validation & Hooks

| Hook | Where | Purpose |
|---|---|---|
| Claude Code post-write | `.claude/hooks/ship-page-validator.sh` | Validates ship-page edits as Claude writes them |
| Claude Code session-start | `.claude/hooks/session-start-guardrail.sh` | Loads pastoral guardrails and skill list |
| Git pre-commit | `.githooks/pre-commit` | Blocks placeholder images, invalid JSON, missing SDG |
| Page-type dispatcher | `admin/validate.js` | Routes any page to the right validator |

Enable git hooks once after cloning:

```bash
git config core.hooksPath .githooks
```

---

## Critical "Never Do" Rules

### URLs & Navigation

- ❌ Never use relative URLs in production HTML — absolute HTTPS only.
- ❌ Never `/ships.html` — the correct path is `/ships/index.html`.
- ❌ Never remove "Cruise Lines" from primary nav.

### Images

- ❌ Never placeholder images — blocking error.
- ❌ Never convert `logo_wake.png` to WebP (transparency required).
- ❌ Never new JPEG/JPG — WebP only.
- ❌ Never skip attribution for Wikimedia Commons images.

### Content

- ❌ Never lorem ipsum or "coming soon" pages.
- ❌ Never remove logbook stories or grief-focused content.
- ❌ Never flatten the emotional pivot in a logbook story.
- ❌ Never rewrite a hard story into something chipper at the expense of
  honesty.

### Code

- ❌ Never `console.log` / `console.warn` in production.
- ❌ Never commit invalid JSON.
- ❌ Never break existing functionality — no regressions.
- ❌ Never push to `main` / `master` directly.

The full rule set lives in `claude.md` and is enforced by the validator +
hooks above.

---

## Multi-LLM Integration

This repository uses the multi-LLM orchestrator hosted in the
[ken](https://github.com/jsschrstrcks1/ken) repo. External models (GPT,
Gemini, Grok) serve as **consultants only** — Claude remains lead developer
and decision-maker.

| Skill | Usage | Purpose |
|---|---|---|
| `/consult` | `/consult gpt structure "review this ship page layout"` | Quick single-model second opinion |
| `/orchestrate cruising "<task>"` | Full multi-model pipeline | Read Standards (Claude) → Generate (Claude) → Content (GPT) → Completeness (Gemini) → UX (Grok) → Integrate (Claude) |
| Cognitive Memory | Automatic on session start | Cross-session knowledge persistence (scope `/InTheWake`) |

#### First-time setup (per session)

```bash
pip3 install -q -r /home/user/ken/orchestrator/requirements.txt
```

#### Context boundaries

- **Send:** page requirements, content outlines, SEO targets, public
  cruise/travel data.
- **Never send:** full codebase, internal standards docs, analytics data.

All output must comply with **ITW-Lite v3.010**, hero + compass pattern,
right-side rail, accessibility, canonical URLs.

---

## Documentation Map

### Integrity & process

| File | Purpose |
|---|---|
| `admin/claude/PASTORAL_GUARDRAILS.md` | Pastoral foundation. Non-negotiable. |
| `.claude/skills/careful-not-clever/CAREFUL.md` | Process integrity guardrail |
| `admin/CAREFUL.md` | Technical integrity — CSS semantics, pre-commit checks |
| `admin/claude/SKILLS_REFERENCE.md` | Skills, both CAREFUL files, task tracking |

### Task management

| File | Purpose |
|---|---|
| `admin/UNFINISHED_TASKS.md` | Master task list (P0–P4) |
| `admin/IN_PROGRESS_TASKS.md` | Active work in current session |
| `admin/COMPLETED_TASKS.md` | Completed work log |

### Technical reference

| File | Purpose |
|---|---|
| `admin/claude/SITE_REFERENCE.md` | Navigation, commands, page templates, date rules |
| `admin/claude/TECHNICAL_STANDARDS.md` | Performance, caching, accessibility, SEO, security |
| `admin/claude/IMAGE_WORKFLOW.md` | Sourcing, conversion, attribution |
| `admin/claude/WORKFLOW.md` | Dev workflow, git commit format, verification |
| `admin/claude/CODEBASE_GUIDE.md` | Repository structure & patterns |
| `claude.md` | Top-level Claude AI guide for this site |

### Standards

| File | Purpose |
|---|---|
| `new-standards/README.md` | Index of consolidated standards |
| `new-standards/foundation/Unified_Modular_Standards_v3.007.010.md` | Complete superset |
| `new-standards/foundation/SHIP_PAGE_STANDARDS_v3.007.010.md` | Ship pages |
| `new-standards/foundation/WCAG_2.1_AA_STANDARDS_v3.100.md` | Accessibility |
| `new-standards/foundation/PWA_CACHING_STANDARDS_v3.007.md` | Service Worker / PWA |
| `new-standards/foundation/NAVIGATION_STANDARDS_ADDENDUM_v3.008.md` | 12-link nav, ARIA |
| `new-standards/v3.010/PORT_PAGE_STANDARD_v3.010.md` | Port pages |
| `new-standards/v3.010/LOGBOOK_ENTRY_STANDARD_v3.010.md` | Logbook entries |
| `new-standards/v3.010/SHIP_PAGE_CHECKLIST_v3.010.md` | Pre-publish checklist |
| `new-standards/v3.010/MOBILE_STANDARDS_v1.000.md` | Mobile breakpoints, touch targets |
| `standards/SHIP_PAGE_STANDARD.md` | Ship page v2.0 (gold standard) |

---

## Contributing

This is a personal project, but family and close collaborators are
welcome. The workflow:

1. Branch from `main` as `claude/<topic>-<id>`.
2. Read `admin/claude/PASTORAL_GUARDRAILS.md` and `claude.md` first.
3. Run `git config core.hooksPath .githooks` once.
4. Write code that passes `admin/validate-ship-page.sh` for any ship-page
   change, and the page-type dispatcher for everything else.
5. Verify in a browser before claiming a feature complete.
6. Open a PR into `main`. Never push directly.

---

*Soli Deo Gloria. This site helps people process some of the hardest
experiences in life. Every accessibility improvement helps someone. Every
logbook story might be exactly what someone needs to read today.*
