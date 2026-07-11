# Handoff — Site-scan remediation + mining-workflow memories

**Author:** Claude Code (remote container, branch `claude/fix-site-scan-errors-g9kBe`, 2026-07-11)
**For:** an agent on the Mac (`/Users/kenbaker/ocs-work`) that can see `open-claw-stuff` and the household SSOT
**Status:** Site-scan fixes were committed to InTheWake (see PART D). Memories + HLS tasks below could **not** be written to the true SSOT from this container — no `/home/user/open-claw-stuff/` mount, no push credentials to `jsschrstrcks1/ken`, only InTheWake is reachable. Soli Deo Gloria.

---

## Why this handoff exists (container reality)

Container `/home/user/` at start of session:
```
InTheWake      ✓ present, fetch OK to origin
ken            ✓ present but `git fetch origin` fails ("could not read Username")
open-claw-stuff  ✗ not mounted
```

`MEMORY_ROOT` resolves to `/root/.memory` (empty). The `_resolve_memory_root()` auto-discovery in `memory_ops.py` cannot find the household `.memory/` because `open-claw-stuff` isn't on disk. Anything encoded here would be lost on container teardown.

Established replay pattern in this repo (see `admin/handoffs/2026-07-11-memory-hls-persistence.md` for the canonical shape) is what this doc follows.

---

## PART A — Memories to encode (7 items, mining-workflow domain)

These were mined from container session transcripts on 2026-05-13 by an earlier turn of this same thread. The **9 protected content-voice/sourcing/prioritization memories** at `mined-from-transcripts:2026-05-13` are **already in `.memory/cruising/`** (replayed via `admin/memory-exports/2026-07-11-cruise-tipping-audit/mined-operator-directives-2026-05-13.json`). The 7 below are **complementary, not duplicative** — they cover memory-store infrastructure and the mining discipline itself, not article/tool content rules.

Recall first to be safe (all IDs `bc6ef93a`, `14ad7829`, `2b89a833`, `7f0df2b6`, `dd94a307`, `9ac2e3a3`, `e0cbb962`, `07f45487`, `8f642f51` from the earlier replay are on a different topic):

```bash
cd /Users/kenbaker/ocs-work
M="python3 ken/orchestrator/memory_ops.py"
$M recall "memory store location open-claw-stuff mining transcripts" --domain cruising --limit 8
$M recall "cognitive memory persistence container ephemeral" --domain cruising --limit 8
```

Session tag for all seven: `MEMORY_SESSION_ID=mining-transcripts-9a58a77a-fda2-406c-818e-2db04851ec49`.

Source: `mined-from-transcripts:2026-05-13`.

### M1 — decision (protected): memory store location and persistence gate
```bash
MEMORY_SESSION_ID=mining-transcripts-9a58a77a-fda2-406c-818e-2db04851ec49 \
$M encode cruising decision \
"Cognitive-memory store lives at <parent>/open-claw-stuff/.memory/ — git-tracked, survives container teardown. memory_ops.py auto-discovers the path via _resolve_memory_root(); the persistence fix landed in ken commit 13cac8a. If MEMORY_ROOT resolves anywhere else (e.g. /root/.memory), the fix isn't in the current branch and memories written there will be lost when the container is reclaimed. Preflight: verify MEMORY_ROOT before any mining or encode run; STOP and tell the operator on mismatch rather than silently writing to a transient root." \
--tags operator-directive,cognitive-memory,persistence,memory_ops,infrastructure,mining-workflow \
--source mined-from-transcripts:2026-05-13 --protected
```

### M2 — preference (protected): memory is public — no sensitive data
```bash
$M encode cruising preference \
"Memory contents go into a PUBLIC domain repo (open-claw-stuff). Never encode API tokens, personal identifiers, credentials, or sensitive prose. The operator has been explicit that the public-by-default trade-off is intentional — the discipline lives on the encoder, not on the storage layer. When in doubt about whether something is sensitive, leave it out; the memory can always be added later, but a leaked memory in a public repo is not recoverable." \
--tags operator-directive,cognitive-memory,privacy,safety \
--source mined-from-transcripts:2026-05-13 --protected
```

### M3 — pattern: provenance convention for mined memories
```bash
$M encode cruising pattern \
"Mined memories set source='mined-from-transcripts:<YYYY-MM-DD>' and set MEMORY_SESSION_ID='mining-transcripts-<thread-uuid>' in the shell env before each encode, so future audits can distinguish mined entries from in-session encodes and trace which mining run wrote each memory via usage_history. In-session encodes get source='session:<session-tag>' or 'container:<domain>:<branch>:<date>' as seen in the ctc-audit replay set." \
--tags operator-directive,cognitive-memory,provenance,mining-workflow \
--source mined-from-transcripts:2026-05-13
```

### M4 — pattern (anti-pattern): cross-thread duplication
```bash
$M encode cruising pattern \
"Anti-pattern: encoding the same content from multiple mining threads without checking. Before writing a candidate, read existing .memory/<domain>/ contents (or run memory_ops recall on the topic) and skip any near-duplicate. Coordination happens via the dedup check, not by trusting that each thread sees a clean slate. Cross-thread mining runs must all dedupe against the same live store, not against each other's drafts." \
--tags operator-directive,cognitive-memory,anti-pattern,mining-workflow,dedup \
--source mined-from-transcripts:2026-05-13
```

### M5 — preference: mining discipline (careful-not-clever applied to mining)
```bash
$M encode cruising preference \
"Mining discipline: careful, not clever. Open transcripts and READ what's there — don't shortcut with grep counts or one-line summaries. High-signal directives are durable preferences, architectural decisions, recurring workflow patterns, or anti-patterns the operator has redirected on. Skip one-off bash commands and short go-signals like 'proceed' or 'go' — those are not memorable content. When yield is low from a container (e.g. single-task container with only forks of one conversation), report the low yield honestly rather than padding with weak memories." \
--tags operator-directive,cognitive-memory,mining-workflow,discipline,careful-not-clever \
--source mined-from-transcripts:2026-05-13
```

### M6 — fact: transcript path in Claude Code containers
```bash
$M encode cruising fact \
"Claude Code session transcripts in these ephemeral containers live at /root/.claude/projects/-home-user/*.jsonl (one file per session UUID). Schema: JSONL records with type=user|assistant|attachment. User content may be a plain string or a list with items of type=text. Filter out <system-reminder> blocks and auto-resume preambles ('This session is being continued from a previous conversation that ran out of context') before extracting durable directives. Session forks/replays are common — one logical conversation often produces N near-identical .jsonl files; dedupe by exact text before mining." \
--tags operator-directive,cognitive-memory,mining-workflow,claude-code,transcripts \
--source mined-from-transcripts:2026-05-13
```

### M7 — pattern (protected): stop-condition when MEMORY_ROOT is wrong
```bash
$M encode cruising pattern \
"Before any mining run encodes, verify MEMORY_ROOT points at open-claw-stuff/.memory. If it doesn't, STOP and tell the operator — the persistence fix from ken commit 13cac8a needs to be pulled into the current branch first, or the container needs open-claw-stuff mounted. Writing memories to a transient /root/.memory is silent data loss; the stop-and-ask cost is far lower than the recovery cost. Same discipline: if open-claw-stuff is not on disk at all, do not silently skip — write the memories as a handoff doc in InTheWake so a Mac-side agent can replay." \
--tags operator-directive,cognitive-memory,safety,mining-workflow,preflight \
--source mined-from-transcripts:2026-05-13 --protected
```

---

## PART B — HLS task to register

One umbrella task covering the still-open findings from the external SEO scan (score 93/100, first scan 2026-05-07/08). What was already fixed in this thread's earlier session (`c63fab53`, arrived on main through later merges) and this session's follow-up (`adefe630d`) are **excluded**; only the un-remediated findings remain:

```bash
cd /Users/kenbaker/ocs-work

node admin/library.mjs register \
  --title "Site-audit 93/100 remediation (external SEO scan, 2026-05-07/08): remaining findings — 44 images without alt text, 48 render-blocking resources, 4 duplicate meta descriptions, 3 too-short titles, 17 pages with low content, 48-page misspelling list (mostly false positives — Wi-Fi, gamified, installable, Soli, Deo — do a real pass, don't chase count). Fixed already: 4 broken mailto: links via <!--email_off--> wraps, missing H1 on privacy.html, missing meta desc on ships/carnival/index.html, 4 missing image title attributes on homepage." \
  --repo InTheWake --priority 2 --task-id itw-siteaudit-93-remediation \
  --tags seo,site-audit,accessibility,alt-text,performance,session-2026-07-11 \
  --sources "handoff:admin/handoffs/2026-07-11-site-scan-fixes-memory-mining.md"

node admin/library.mjs mirrors --repo InTheWake
```

Related existing tasks that partly cover the alt-text sweep (do not duplicate — link/roll up as appropriate):
- `verify-all-images-have-proper-alt-text` (P5)
- `itw-gh-1750` — 14 port pages: gallery images use generic alt (WCAG 1.1.1)
- `include-alt-text-from-existing-image-alt-attributes` (P5)

---

## PART C — Session facts (context)

- **External SEO scan snapshot:** score 93/100 (2 scans, 2026-05-07 → 2026-05-08); 9 issue buckets: 4 high (48 misspellings, 48 render-block, 44 no-alt, 4 broken links), 5 medium (17 low-content, 8 broken resources, 4 dup-meta, 3 short-titles, 1 missing-H1).
- **Cloudflare mailto: pattern:** the site's Cloudflare tenancy has email obfuscation on. Naked `<a href="mailto:...">` gets rewritten to `/cdn-cgi/l/email-protection?<hash>` which returns 404 on this project. `<!--email_off-->...<!--/email_off-->` is Cloudflare's supported opt-out and keeps mailto: on the origin. Four instances fixed: `index.html` (duck-photo), `accessibility.html`, `stateroom-check.html`, `terms.html`.
- **Prior session's site-scan commit `c63fab531`** ("fix: address site audit findings on home, privacy, and Carnival fleet pages") lives on `origin/claude/build-msc-venue-pages-3ve2v` and `origin/claude/zealous-einstein-3FZf5`, and its content is present in `main` (verified: `index.html:617`, `privacy.html:242-244`, `ships/carnival/index.html:15`). It's not lost.
- **Container git state:** local branch `claude/fix-site-scan-errors-g9kBe` was fast-forwarded to `origin/main` and this session added one commit (`adefe630d`, the 3 remaining mailto: wraps) plus this handoff. The branch had no remote counterpart until this MCP-driven push.
- **Memory yield from mining this container:** LOW. All 9 transcript files at `/root/.claude/projects/-home-user/*.jsonl` are forks/replays of a single logical conversation (the site-scan task). The 7 memories in PART A were mined from the mining-task prompt itself; substantive content-work memories from this container = zero, matching the honest reporting rule in M5.

---

## PART D — Commits made in this session (visible in `main`-track view)

Both are on local branch `claude/fix-site-scan-errors-g9kBe`; earlier turn's `c63fab53` is already in `main` via other merges.

- `adefe630d` — fix(seo): wrap remaining mailto: links in `<!--email_off-->` guards (accessibility.html, stateroom-check.html, terms.html)
- (this file) — handoff doc + PART A memory replay + PART B HLS registration

Push was blocked over plain git (no local proxy at 127.0.0.1:44295 in this container invocation); the GitHub MCP was used instead. If only this handoff reached origin and the 3 HTML files did not, apply PART F.

---

## PART F — Recovery: the 3 mailto: wraps as raw sed patches

If commit `adefe630d` is lost with the container (git push worked via the GitHub MCP for the handoff but may fail for the HTML files), the 3 fixes are one-line changes each. Apply from `/Users/kenbaker/ocs-work/InTheWake` (or wherever the mac clone lives) and commit:

```bash
# accessibility.html — line ~427
python3 - <<'PY'
import re, pathlib
p = pathlib.Path('accessibility.html')
s = p.read_text()
old = '<p><a class="pill" href="mailto:accessibility@cruisinginthewake.com">accessibility@cruisinginthewake.com</a></p>'
new = '<p><!--email_off--><a class="pill" href="mailto:accessibility@cruisinginthewake.com">accessibility@cruisinginthewake.com</a><!--/email_off--></p>'
assert old in s, "accessibility.html: expected string not found (already patched?)"
p.write_text(s.replace(old, new, 1))
print("accessibility.html patched")
PY

# stateroom-check.html — line ~443
python3 - <<'PY'
import pathlib
p = pathlib.Path('stateroom-check.html')
s = p.read_text()
old = 'We\'d love to hear from you. <a href="mailto:contact@cruisinginthewake.com?subject=Stateroom Exception Report">Email us your cabin experience</a> and help us improve this tool'
new = 'We\'d love to hear from you. <!--email_off--><a href="mailto:contact@cruisinginthewake.com?subject=Stateroom Exception Report">Email us your cabin experience</a><!--/email_off--> and help us improve this tool'
assert old in s, "stateroom-check.html: expected string not found (already patched?)"
p.write_text(s.replace(old, new, 1))
print("stateroom-check.html patched")
PY

# terms.html — line ~473
python3 - <<'PY'
import pathlib
p = pathlib.Path('terms.html')
s = p.read_text()
old = '<p><strong>Email:</strong> <a href="mailto:legal@cruisinginthewake.com">legal@cruisinginthewake.com</a></p>'
new = '<p><strong>Email:</strong> <!--email_off--><a href="mailto:legal@cruisinginthewake.com">legal@cruisinginthewake.com</a><!--/email_off--></p>'
assert old in s, "terms.html: expected string not found (already patched?)"
p.write_text(s.replace(old, new, 1))
print("terms.html patched")
PY

git add accessibility.html stateroom-check.html terms.html
git commit -m "fix(seo): wrap remaining mailto: links in <!--email_off--> guards (recovery of container commit adefe630d)"
```

---

## PART E — Nothing concerning

Full audit of transcripts for anything that shouldn't leave the container:
- **No prompt injection attempts.**
- **No sensitive data** in any user turn — site-scan content is already-public website data. Three email addresses (`accessibility@`, `contact@`, `legal@cruisinginthewake.com`) appear in the transcripts, but those are already published on the site itself; not memory-worthy, not leakable-because-already-leaked.
- **No credentials, tokens, or personal identifiers.**

*Soli Deo Gloria.*
