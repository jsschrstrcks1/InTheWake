# Skills — InTheWake

> The largest content engine. 45 skills configured — cruise content authoring, ITW-Lite Protocol enforcement, validator chain, accessibility, SEO, voice, image-reuse guardrails, deployment validation, webapp testing.

This document is the human-facing index of all Claude Code skills configured in this repository. The agent-facing pointer lives in [`CLAUDE.md`](CLAUDE.md). Skills follow the agent-skills-spec format and live under `.claude/skills/`.

**Total skills configured: 46.** This is the largest skill surface in the household. The repo serves 1,241 pages with a triple validator chain, so the skill stack covers content authoring, voice, accessibility, SEO, deployment, the ITW-Lite Protocol, and hard-ban guardrails.

---

## Quick reference (45 skills, grouped)

### Cruise content authoring

| Skill | Activation | Default | Purpose |
|---|---|---|---|
| [`port-page-generator`](#port-page-generator) | explicit | on | Generate port page from research |
| [`port-content-builder`](#port-content-builder) | explicit | on | Build port page content |
| [`venue-page-writer`](#venue-page-writer) | explicit | on | Restaurant/venue detail pages |
| [`seasonal-content-planner`](#seasonal-content-planner) | explicit | on | Plan content by cruise season |
| [`investigate`](#investigate) | explicit | on | 4-phase deep research → content page |

### Quality gates (validator chain)

| Skill | Activation | Default | Purpose |
|---|---|---|---|
| [`accessibility-audit`](#accessibility-audit) | automatic on page edits | on | WCAG 2.1 AA |
| [`seo-schema-audit`](#seo-schema-audit) | automatic on page edits | on | JSON-LD / Open Graph / AI meta |
| [`link-integrity`](#link-integrity) | automatic on link/image edits | on | Internal links + product↔category |
| [`publication-proofreader`](#publication-proofreader) | automatic post-draft | on | Curly quotes, em-dashes, alt text |
| [`emotional-hook-test`](#emotional-hook-test) | explicit pre-publish | on | Reader emotional resonance |
| [`internal-consistency-repair`](#internal-consistency-repair) | explicit | on | Cross-page consistency repair |
| [`image-reuse-guardrail`](#image-reuse-guardrail) | automatic on image use | on | Refuses copyrighted-image reuse |
| [`no-getbets`](#no-getbets) | automatic on every Write/Edit/MultiEdit + every commit | on | Hard ban on external scam-flagged casino domain reference |
| [`deployment-validator`](#deployment-validator) | explicit pre-deploy | on | Cloudflare Pages, redirects, custom domain |
| [`webapp-testing`](#webapp-testing) | explicit | on | Tests interactive tools |

### Voice + AI-discoverability

| Skill | Activation | Default | Purpose |
|---|---|---|---|
| [`voice-audit`](#voice-audit) | automatic post-draft | on | Voice authenticity |
| [`voice-dna`](#voice-dna) | explicit | on | Voice pattern discovery |
| [`like-a-human`](#like-a-human) | automatic during writing | on | Voice during writing |
| [`Humanization`](#humanization) | (legacy) | on | Older voice humanization (capitalized name) |
| [`audience-profiles`](#audience-profiles) | automatic during writing | on | Cruise traveler personas |
| [`ai-summary-rewriter`](#ai-summary-rewriter) | automatic on summary fields | on | Rewrites AI summaries to ITW-Lite voice |
| `icp-2` | automatic on content writing | on | Human-First SEO/AEO 2026 |

### Operations + content lifecycle

| Skill | Activation | Default | Purpose |
|---|---|---|---|
| [`careful-not-clever`](#careful-not-clever) | automatic on every file modification | on | Integrity guardrail |
| [`content-freshness`](#content-freshness) | explicit | on | Stale page detection |
| [`indexnow`](#indexnow) | automatic on page edits | on | IndexNow auto-submission |
| [`analytics-tracking`](#analytics-tracking) | explicit | on | GA4 + cruise conversion tracking |
| [`frontend-dev-guidelines`](#frontend-dev-guidelines) | automatic on frontend work | on | React/TS patterns |
| [`standards`](#standards) | automatic on standards reads | on | Wraps the layered new-standards/ docs |

### Multi-LLM orchestrator

| Skill | Slash | Default | Purpose |
|---|---|---|---|
| `consult` | `/consult` | on | Multi-LLM second opinion |
| `orchestrate` | `/orchestrate cruising` | on | Multi-LLM pipeline (cruising mode) |
| `orchestra` | `/orchestra` | on | Multi-LLM round-robin |
| `adversarial-review` | `/adversarial-review [base-ref] [model]` | on | External-audit backstop named in careful-not-clever v1.8.1-alpha §"Limit of this rule." Sends commit range to an adversarial reviewer (default: grok) for a ruthless first-pass critique. Implementation: `admin/external-audit.sh`. Orchestra mode: `ken/orchestrator/modes/adversarial-review.yaml`. |

### Standard household kit (16 skills) — see [section below](#standard-household-kit)

---

## How invocation works

Claude Code skills can fire three ways:

**1. Automatic activation** via YAML `keywords:` and surrounding context. Many skills here fire on page-edit shapes: `accessibility-audit`, `seo-schema-audit`, `link-integrity`, `publication-proofreader`, `image-reuse-guardrail`, `indexnow`.

**2. Explicit invocation:**

```
"Use port-page-generator to draft a Cabo San Lucas page from this research."
/skill port-page-generator
```

**3. Implicit invocation by task shape** — ship-page edits trigger the canonical validator chain (`admin/validate-ship-page.sh` via post-write hook); commits trigger pre-commit checks (placeholder images, invalid JSON, missing SDG comment).

---

## Cruise content authoring skills

### `port-page-generator`

Generates port page templates conforming to `new-standards/v3.010/PORT_PAGE_STANDARD_v3.010.md`.

### `port-content-builder`

Builds port page content from research (cruise lines visiting, dock vs tender, attractions, dining, accessibility notes).

### `venue-page-writer`

Writes restaurant/venue detail pages across the 5 cruise lines (RCL, NCL, Virgin, MSC, Carnival).

### `seasonal-content-planner`

Plans cruise content by season (Caribbean season, Mediterranean season, Alaska season, etc.).

### `investigate`

4-phase deep research pipeline for ship/port content. Pulls from Wikimedia Commons, cruise-line PR pages, port authority sources — always wrapped per the "never use training data as a source" rule.

---

## Quality-gate skills

### `accessibility-audit`

WCAG 2.1 AA compliance check. Lighthouse accessibility score must be 100 before deploy.

### `seo-schema-audit`

Validates JSON-LD, Open Graph, Twitter Cards, AI meta tags for cruise content.

### `link-integrity`

Validates all internal links use absolute HTTPS URLs starting with `https://www.cruisinginthewake.com/`. The hub is `/ships/index.html`, not `/ships.html`.

### `publication-proofreader`

Final typographic polish: curly quotes, em-dashes, alt text, price formatting.

### `emotional-hook-test`

Pre-publication test for cruise content emotional resonance. Real readers making real decisions with budgets on the line.

### `internal-consistency-repair`

Repairs cross-page inconsistencies (e.g., ship stats that drifted between ship page and ship hub).

### `image-reuse-guardrail`

Refuses to reuse copyrighted cruise-line images without proper attribution. WebP-only enforcement; Wikimedia Commons attribution required.

### `no-getbets`

Hard ban on the string `getbets` (case-insensitive) appearing in any production-facing file. Enforced via Claude Code PreToolUse hook (`.claude/hooks/no-getbets-guard.js`) which denies any Write/Edit/MultiEdit containing the string, and via `.githooks/pre-commit` check #5 which blocks any commit with the string in a non-exempt staged file. Documentation files explaining the ban itself are the only exempt context. Rationale: AI grounding probes pairing an external scam-flagged casino site with cruise-casino content — any reference, even defensive, would strengthen the adversarial SEO co-mention. Full rule: `.claude/skills/no-getbets/SKILL.md`.

### `deployment-validator`

Validates deployments — Cloudflare Pages, redirects, custom domain, host-level cache headers (`_headers`, `.htaccess`, `nginx-cache-headers.conf`).

### `webapp-testing`

Tests interactive tools (drink calculator across 15 cruise lines, stateroom checker against 270 ship JSON files, packing lists, internet-at-sea calculator).

---

## Voice skills

### `voice-audit`, `voice-dna`, `like-a-human`

The household voice trio, calibrated for cruise content. Voice rule: **honest, calm, concrete. Facts over superlatives.** *"The 9 a.m. tender to Cabo San Lucas runs every 20 minutes" beats "tenders run regularly".*

### `Humanization`

Older-style voice humanization skill (capitalized directory name). Likely predates `like-a-human` — may be deprecated or kept for legacy compatibility.

### `audience-profiles`

Cruise traveler personas: first-timers, solo cruisers, accessibility-focused, families, port-day enthusiasts. Feeds `emotional-hook-test` calibration.

### `ai-summary-rewriter`

Rewrites AI-generated summaries to fit ITW-Lite voice and answer-engine optimization standards. Activates on `<meta name="ai:summary">` and similar fields.

---

## Operations skills

### `careful-not-clever`

Integrity guardrail. Activates on every file modification.

### `content-freshness`

Stale-content detection for ship/port pages. Tied to `last-reviewed` meta tags.

### `indexnow`

Auto-submits pages to IndexNow when created or edited. Notifies Bing, Yandex, Naver, Seznam, Yep.

### `analytics-tracking`

GA4 + cruise-specific conversion tracking.

### `frontend-dev-guidelines`

React/TypeScript guidelines (likely shared with `flickersofmajesty` in form, distinct in calibration).

### `standards`

Wraps the layered `new-standards/` documentation (foundation/v3.007.010, v3.100, v3.008, plus v3.010 PORT_PAGE, LOGBOOK_ENTRY, SHIP_PAGE_CHECKLIST, MOBILE).

---

## Multi-LLM orchestrator

This repo defaults to **`cruising` mode** in the orchestrator hosted in [ken](https://github.com/jsschrstrcks1/ken). Lead model: Claude. **The cruising pipeline was invented here** and later adapted to `flickersofmajesty` as FOM-Lite.

| Skill | Slash | Usage |
|---|---|---|
| `consult` | `/consult` | `/consult gpt structure "review this ship page layout"` |
| `orchestrate` | `/orchestrate cruising "<task>"` | Pipeline: Read Standards → Generate → Content (GPT) → Completeness (Gemini) → UX (Grok) → Integrate |
| `orchestra` | `/orchestra "<task>"` | Multi-LLM round-robin debate |

**Context boundaries:**

- **SEND**: page requirements, content outlines, SEO targets, public cruise/travel data
- **NEVER SEND**: full codebase, internal standards docs, analytics data

All output must comply with **ITW-Lite v3.010**, hero + compass pattern, right-side rail, accessibility, canonical URLs.

First-time setup per session:

```bash
pip3 install -q -r /home/user/ken/orchestrator/requirements.txt
```

---

## Standard household kit

Common to every sister repo. Canonical versions live in `ken/.claude/skills/`.

| Skill | Activation | One-line |
|---|---|---|
| `brainstorming` | automatic on creative work | Pre-implementation creative exploration. |
| `cognitive-memory` | automatic on session start | Cross-session knowledge persistence. Memory scope: `/InTheWake`. |
| `executing-plans` | explicit | Use when executing a written plan. |
| `finishing-a-development-branch` | explicit | Decide merge / PR / cleanup. |
| `prompt-optimizer` | automatic on prompt-improvement requests | Optimizes raw prompts. Advisory only. |
| `receiving-code-review` | explicit | Use when receiving review feedback. |
| `requesting-code-review` | explicit | Use when completing tasks before merging. |
| `safety-guard` | automatic on destructive ops | Prevents destructive operations. |
| `security-review` | automatic on auth/secrets/payment | Security checklist + patterns. |
| `security-scan` | explicit | Scans `.claude/` config. |
| `session-checkpoint` | automatic + explicit | Atomic commits, checkpoint summaries, rate-limit recovery. |
| `subagent-driven-development` | explicit | Implementation plans with independent tasks. |
| `systematic-debugging` | automatic on bug/test-failure | Use before proposing fixes. |
| `using-git-worktrees` | explicit | Isolate feature work. |
| `verification-before-completion` | automatic on completion claims | Refuses "complete/fixed/passing" without observed output. |
| `writing-plans` | explicit | Use when you have a spec for a multi-step task. |

Plus `skill-developer` for skill authoring.

---

## Validator chain (load-bearing)

Three independent enforcement points gate the way to production:

```
Claude writes a page
    └─ .claude/hooks/ship-page-validator.sh fires (post-write)
       └─ admin/validate-ship-page.sh (canonical shell validator)
          └─ admin/validate.js (page-type dispatcher routes to the right validator)

git commit
    └─ .githooks/pre-commit fires
       └─ blocks: placeholder images, invalid JSON, missing SDG comment
```

**Never game the validator.** Reverse-engineering regex patterns to pass automated checks is a blocking integrity failure.

**Soli Deo Gloria comment required in every HTML file before line 20.** Validator enforces.

---

## Critical "Never Do" Rules (quick reference)

- ❌ Never use relative URLs in production HTML — absolute HTTPS only
- ❌ Never `/ships.html` — the correct path is `/ships/index.html`
- ❌ Never placeholder images — blocking error
- ❌ Never new JPEG/JPG — WebP only (logo_wake.png excepted for transparency)
- ❌ Never lorem ipsum or "coming soon" pages
- ❌ Never invent ship stats, port facts, or pricing from training data
- ❌ Never `console.log` / `console.warn` in production
- ❌ Never commit invalid JSON
- ❌ Never push to `main` / `master` directly

Full rule set in `CLAUDE.md` and the validator + hooks.

---

## See also

- [`admin/claude/CLAUDE.md`](admin/claude/CLAUDE.md) — admin-context Claude guide
- [`README.md`](README.md) — public-facing overview
- [`CLAUDE.md`](CLAUDE.md) — top-level Claude AI guide
- [`new-standards/`](new-standards/) — layered standards system (foundation + v3.010)
- [`admin/claude/SKILLS_REFERENCE.md`](admin/claude/SKILLS_REFERENCE.md) — historical skill reference
- [`admin/UNFINISHED_TASKS.md`](admin/UNFINISHED_TASKS.md) — master task list
- `flickersofmajesty` — child of ITW-Lite (see FOM-Lite Protocol)
- `ken` — hosts the orchestrator; canonical versions of the standard household kit
