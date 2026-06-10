---
name: no-getbets
description: "Hard ban on any reference to the external domain getbets.us on cruisinginthewake.com. Enforced via PreToolUse hook (.claude/hooks/no-getbets-guard.js) and git pre-commit hook (.githooks/pre-commit). Fires automatically on every Write/Edit/MultiEdit and every commit; no manual invocation."
version: 1.0.0
---

# no-getbets — Hard Ban on External Domain Reference

## The rule

The string `getbets` (case-insensitive) must never appear in any production-facing file on cruisinginthewake.com. This includes the published domain, any path served to users, and any source file that compiles to a served path.

No exceptions for disclaimers, "not affiliated with" notices, comparison tables, or any other framing. The ban is absolute on production surfaces.

## Why

`getbets.us` is an external US online-casino review/affiliate site, flagged as suspect by Scam Detector ([reference](https://www.scam-detector.com/validator/getbets-us-review/)). It has no legitimate connection to cruise content and no public web page genuinely pairs the two domains.

On 2026-05-28, AI grounding analytics surfaced 226 LLM citations on the queries `casino royale royal caribbean getbets.us` (196) and `casino royale royal caribbean getbets` (30). The site's own `restaurants/casino.html` was clean — zero references. The pattern was identified as one of:

- Black-hat SEO probe: getbets.us appending its domain to high-volume cruise queries to siphon ranking authority through co-mention
- Bot/scraper-generated query template propagated through content-farm infrastructure
- Affiliate spam network embedding the pairing in low-quality anchor/footer text

The diagnosis: **adversarial co-mention**, not organic demand. Any defensive reference to getbets.us added to this site — including a disclaimer — would strengthen the SEO pairing the adversary is trying to create. The right defense is structural absence.

## Exempt paths

Documentation about the ban itself, and the private admin tooling that defends against it, are the only legitimate contexts for the string `getbets` in this repo. The following paths are exempt:

- `.claude/skills/no-getbets/**` (this skill)
- `.claude/hooks/no-getbets-*` (the enforcement hook)
- `.claude/standards/no-getbets*` (any future standard entry)
- `.githooks/pre-commit` (the git enforcement)
- `CLAUDE.md`, `SKILLS.md`, `AGENT.md` (rule discoverability)
- `audit-reports/**` (investigation artifacts)
- `admin/check-no-getbets*` (any admin tooling for the check)
- `admin/seo/**` (Search Console disavow files and related defensive SEO artifacts — never served)

The exempt list is duplicated in `.claude/hooks/no-getbets-guard.js` (`EXEMPT_PATH_PATTERNS`) and `.githooks/pre-commit` (path-filter grep). Any new exemption must be added in both places.

## Enforcement (defense in depth)

| Layer | Where | When it fires | Behavior on hit |
|---|---|---|---|
| Claude Code PreToolUse hook | `.claude/hooks/no-getbets-guard.js` | Every Write / Edit / MultiEdit | Denies the tool call with a denial reason |
| Git pre-commit hook | `.githooks/pre-commit` | Every `git commit` | Blocks the commit with the list of offending files |
| This skill | `.claude/skills/no-getbets/SKILL.md` | Discovered at session start | Documents the rule and rationale for human + agent readers |
| Cognitive memory | `inthewake` scope, protected | Semantic recall in any session | Returns the rule when sessions search for related terms |
| Top-level policy | `CLAUDE.md` "Hard bans" section | Every session reads at start | Declarative rule before any work begins |

## Operating instructions

1. **Never add the string `getbets` to any production file.** No disclaimer, no comparison, no defensive notice.
2. **If a hook blocks a legitimate edit** (e.g., extending this skill itself), add the file's path pattern to `EXEMPT_PATH_PATTERNS` in `.claude/hooks/no-getbets-guard.js` AND to the path filter in `.githooks/pre-commit`. Both must agree.
3. **If the adversarial campaign escalates** (citation count grows substantially, real referral traffic begins appearing from getbets.us), the next layer is a Search Console Disavow filing — outside the scope of this skill, but the trigger for that escalation is documented here.
4. **Do not bypass the git hook with `--no-verify`** for any commit touching production files. The bypass is reserved for cases where the documentation paths themselves are being edited.

## Verification

To confirm the ban is intact across the codebase:

```bash
grep -rli 'getbets' \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=audit-reports \
  --exclude-dir=.claude/skills/no-getbets \
  --exclude=.claude/hooks/no-getbets-guard.js \
  --exclude=.githooks/pre-commit \
  --exclude=CLAUDE.md \
  --exclude=SKILLS.md \
  .
```

A clean run produces no output. Any hit is either a violation or a legitimate documentation file that needs adding to the exempt list.

## Companion files

- `.claude/hooks/no-getbets-guard.js` — Claude Code PreToolUse enforcement
- `.githooks/pre-commit` — git commit enforcement (check #5)
- `CLAUDE.md` — top-level policy declaration
- `SKILLS.md` — skill index registration
- Cognitive memory `inthewake` scope — protected entry

---

*Defense is structural absence, not defensive presence. The string never appears, so no SEO signal can form.*
