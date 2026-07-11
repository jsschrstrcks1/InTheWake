# Handoff — Persist 2026-07-11 session memories + HLS tasks to the true SSOT

**Author:** Claude Code (remote container session, 2026-07-11)
**For:** an agent running on the Mac (`/Users/kenbaker/ocs-work`) that can see the real household SSOT remote.
**Status:** Memories + tasks were WRITTEN and COMMITTED locally in the remote container, but could NOT be pushed. This doc lets you replay them against the true SSOT. Soli Deo Gloria.

---

## Why this handoff exists (the blocker)

This session ran in an ephemeral remote container with three repos cloned: `InTheWake`, `ken`, `open-claw-stuff`. I successfully:

- Encoded 6 new memories into `open-claw-stuff/.memory/cruising/` (via `ken/orchestrator/memory_ops.py`).
- Registered 4 InTheWake tasks into `open-claw-stuff/.household-library/catalog.jsonl` (via `admin/library.mjs register`).
- Committed all of it locally: **open-claw-stuff commit `22a761c`**, tag **`session-2026-07-11-memory-hls`**.

**I could not push it.** The container's `open-claw-stuff` remote branch `claude/port-validation-fixes-qajFr` was **force-updated by another session to a divergent lineage** (the public-domain skills-commons incarnation of open-claw-stuff — it has **no `.household-library/`** and a different `CLAUDE.md`). It shares **no merge base** with the household-SSOT lineage the container was provisioned with (shallow clone). Force-pushing my work would have **destroyed that other session's branch**, so I did not.

Additionally, my container's local household catalog is **stale** relative to the true SSOT: regenerating `InTheWake/admin/UNFINISHED_TASKS.md` from it would have **deleted 6 legitimate task rows** that were added on the Mac after this container was provisioned (`anthem-of-the-seas-deck-plan-layout-seo-article`, `freedom-class-gt-corpus-propagation`, `utopia-of-the-seas-gt-cascade`, `regenerate-ship-size-chart-images`, `royal-caribbean-vs-msc-html-samba-grill-fix`, `uniform-if-you-re-booked-decision-card`). I reverted that regeneration rather than corrupt the list.

**So: do NOT try to merge my container's open-claw-stuff state. Just replay the commands below against the live SSOT.** They are append-only and safe.

---

## PART A — Replay the 6 memories

Run from the household SSOT root (`/Users/kenbaker/ocs-work`). `M` = the memory CLI.

```bash
cd /Users/kenbaker/ocs-work
M="python3 ken/orchestrator/memory_ops.py"   # adjust path if ken is a sibling: /Users/kenbaker/.../ken/orchestrator/memory_ops.py
```

Before encoding, recall to avoid dupes — a strong FOM fact `5ff79914` already exists; relate new ones to it:

```bash
$M recall "FOM Flickers of Majesty ARR image licensing audit" --domain cruising --limit 8
```

### M1 — anti-pattern (protected): never source ARR/NC/ND images
```bash
$M encode cruising anti-pattern \
"IMAGE-SOURCING LESSON (2026-05-23 Flickr audit). A prior bulk pass downloaded Flickr images by visual fit and stamped 'Flickr (verify license)' placeholders in .attr.json + attributions.csv, deferring license checks. 'Verify later' NEVER happened. Audit of 867 unique Flickr URLs (868 image files, 122 ports) dual-verified each: 814 (94%) were NON-COMPLIANT — 772 All Rights Reserved, 23 CC-BY-NC, 19 CC-BY-ND, 4 deleted-on-Flickr. Only 54 were compliant CC. RULE: verify license BEFORE downloading any external image; NEVER persist a 'verify later' placeholder; if you cannot verify now, do not download. ALLOWED: CC0 1.0, Public Domain Mark 1.0, CC BY 2.0/4.0, CC BY-SA 2.0/4.0, US Gov Work, No Known Copyright Restrictions. FORBIDDEN: ARR, all NC variants, all ND variants (NC/ND look like CC at a glance but are unusable). DUAL-VERIFICATION STANDARD for Flickr: (1) regex-match creativecommons.org/licenses/<type>/<ver> in page HTML AND (2) parse Flickr embedded JSON \"license\":N (enum 0=ARR,4=BY2.0,5=BY-SA2.0,9=CC0,10=PDM,11=BY4.0,12=BY-SA4.0; all others restricted) — both must agree." \
--tags image-sourcing,licensing,flickr,careful-not-clever,inthewake,arr-audit --related 5ff79914 --protected
```

### M2 — decision (protected): disposition = replace port-by-port, not blind-delete
```bash
$M encode cruising decision \
"DISPOSITION of the 814 non-compliant Flickr images (2026-05-23 audit, InTheWake): operator direction shifted from bulk-DELETE to REPLACE PORT-BY-PORT (careful, not clever). A one-shot deletion commit (8fdb1bde) was made in a prior container but NEVER persisted to origin/main or the remote feature branch. Do NOT re-run a blind mass-delete. The remediation is a per-port re-source: 103 ports lost ALL Flickr-feed images, 16 lost some, 3 kept all. Re-source each slot from preferred CC sources (Wikimedia Commons, US LoC, gov tourism boards, filtered Flickr CC) under the dual-verification standard, one commit per port, so a rollback never loses other ports' progress. HLS task: itw-flickr-arr-remediation." \
--tags image-sourcing,licensing,disposition,inthewake,careful-not-clever --related 5ff79914 --protected
```

### M3 — preference (protected): operator chat images are FOM
```bash
$M encode cruising preference \
"OPERATOR DIRECTIVE (2026-07-11): ANY image the operator provides to an agent THROUGH CHAT is first-party (Flickers of Majesty) and MUST be saved with 'FOM' in the filename, following the FOM naming convention. Never store an operator-supplied chat image under a generic/CC name. Chat-supplied image => FOM-named + FOM attribution ('Photo ©', operator's own work) + FOM sidecar. This keeps operator-owned images permanently distinguishable from third-party CC images and excluded from CC-license audits." \
--tags fom-flickersofmajesty,operator-directive,image-sourcing,attribution,inthewake --related 5ff79914 --protected
```

### M4 — insight (protected): FOM IP-protection ladder
```bash
$M encode cruising insight \
"FOM (Flickers of Majesty) IP-PROTECTION strategy (discussed 2026-07-11). Nothing makes web images un-copyable; goal is 'expensive to steal, cheap to license' + legal teeth. HIGHEST-ROI LEVER: register the FOM photo catalog with the US Copyright Office BEFORE infringement — group registration (GRPPH published / GRUPH unpublished, up to 750 photos per ~\$55-65 filing) unlocks statutory damages (\$750-\$150k/work) + attorneys' fees; without pre-registration only actual damages (usually tiny). Supporting layers: cap web display ~1600px (masters offline), visible corner watermark + '© Flickers of Majesty' near each image + a /licensing/ page, preserve EXIF/IPTC copyright, hotlink protection, Pixsy/ImageRights contingency monitoring + DMCA takedowns. SKIP right-click-disable JS theater (DevTools defeats it). Not legal advice — confirm with counsel." \
--tags fom-flickersofmajesty,ip-protection,copyright,licensing,inthewake --related 5ff79914 --protected
```

### M5 — fact (not protected): git-state reality
```bash
$M encode cruising fact \
"GIT-STATE REALITY (InTheWake, 2026-07-11): branch claude/port-validation-fixes-qajFr was reset to and equals origin/main (dac2fca48). The earlier Flickr-deletion commit 8fdb1bde (delete 813 images/1628 files) exists only as an UNREFERENCED local object — it is NOT in main, NOT in the remote feature branch, NOT in the working tree. All ~868 Flickr images + their 'Flickr (verify' placeholders (961 rows in attributions/attributions.csv) remain INTACT. A future agent must NOT assume the deletion happened; the non-compliant images are still present to be re-sourced/replaced per itw-flickr-arr-remediation." \
--tags git-state,inthewake,flickr,image-sourcing --related 5ff79914
```

### M6 — decision (protected): FOM storage-structure proposal (PENDING operator)
```bash
$M encode cruising decision \
"FOM STORAGE-STRUCTURE proposal (2026-07-11, PENDING operator decision — see HLS task itw-fom-storage-structure). Current mess: ~235 FOM files scattered across assets/ships/ (150), ports/img/{cozumel,curacao,nassau}/ (85), plus strays; mixed extensions (117 webp + 77 jpeg dupes); two filename patterns ('-FOM- - N' literal space-dash-space vs '-FOM-N'); only 42 of ~195 images have .attr.json sidecars. PROPOSED (not yet approved): single root /assets/fom/{ships,ports,misc}/; filename <entity-slug>-FOM-NN.webp (kebab, zero-padded, webp-only); mandatory sidecar; separate /attributions/fom.csv never touched by CC audits. OPEN QUESTIONS for operator: (1) root /assets/fom/ vs /fom/; (2) exact FOM license label string; (3) scope = ship+port photography only or any first-party image; (4) whether to FOM-name reference images that are NOT operator's own. Migration of the 235 files is a SEPARATE session." \
--tags fom-flickersofmajesty,image-structure,proposal,inthewake,pending-decision --related 5ff79914 --protected
```

---

## PART B — Replay the 4 HLS tasks

Run from the SSOT root so `admin/library.mjs` resolves and (on the Mac, with `gh` available) also creates the linked GitHub issues. In my container `gh` was absent, so issue links were skipped.

```bash
cd /Users/kenbaker/ocs-work

node admin/library.mjs register \
  --title "Flickr non-compliant images: re-source port-by-port (103 gutted + 16 partial ports) — replace, do not blind-delete; dual-verify each new image (regex CC URL + Flickr license JSON); one commit per port" \
  --repo InTheWake --priority 1 --task-id itw-flickr-arr-remediation \
  --tags image-sourcing,licensing,flickr,remediation,careful-not-clever,session-2026-07-11 \
  --sources "memory:cruising:arr-audit-2026-05-23"

node admin/library.mjs register \
  --title "FOM image storage structure: decide root (/assets/fom/{ships,ports,misc}?), filename convention (<slug>-FOM-NN.webp), mandatory sidecars, separate /attributions/fom.csv; migrate ~235 scattered FOM files (webp-only, kill jpeg dupes + '- - ' pattern); backfill sidecars (only 42/~195 have them). OPEN operator decisions in memory." \
  --repo InTheWake --priority 2 --task-id itw-fom-storage-structure \
  --tags fom-flickersofmajesty,image-structure,migration,inthewake,pending-decision,session-2026-07-11 \
  --sources "memory:cruising:fom-structure-2026-07-11"

node admin/library.mjs register \
  --title "FOM chat-image intake workflow: when operator supplies an image via chat, save as <slug>-FOM-NN.webp with 'Photo ©' FOM attribution + sidecar + /attributions/fom.csv row; confirm entity/subject, never reuse NN, never store under generic/CC name (operator directive 2026-07-11)." \
  --repo InTheWake --priority 3 --task-id itw-fom-chat-image-intake \
  --tags fom-flickersofmajesty,workflow,operator-directive,image-sourcing,inthewake,session-2026-07-11 \
  --sources "memory:cruising:chat-image-fom-rule"

node admin/library.mjs register \
  --title "FOM IP protection: (1) US Copyright Office group registration of FOM catalog (GRPPH/GRUPH, highest-ROI legal lever) [confirm w/ counsel]; (2) /licensing/ page + '© Flickers of Majesty' near each image; (3) cap web display ~1600px, masters offline; (4) visible watermark + preserve EXIF/IPTC; (5) Pixsy/ImageRights monitoring + DMCA. Skip right-click-disable theater." \
  --repo InTheWake --priority 3 --task-id itw-fom-ip-protection \
  --tags fom-flickersofmajesty,ip-protection,copyright,licensing,inthewake,session-2026-07-11 \
  --sources "memory:cruising:fom-ip-protection-2026-07-11"
```

Then regenerate the InTheWake mirror from the AUTHORITATIVE catalog and commit:

```bash
node admin/library.mjs mirrors --repo InTheWake
# verify the 6 pre-existing rows are still present (they must NOT be dropped):
#   anthem-of-the-seas-deck-plan-layout-seo-article, freedom-class-gt-corpus-propagation,
#   utopia-of-the-seas-gt-cascade, regenerate-ship-size-chart-images,
#   royal-caribbean-vs-msc-html-samba-grill-fix, uniform-if-you-re-booked-decision-card
git -C /Users/kenbaker/ocs-work add .household-library/catalog.jsonl .household-library/events.jsonl docs/HOUSEHOLD-TASK-INDEX.md .memory/cruising
git -C /Users/kenbaker/ocs-work commit -m "memory+HLS: persist 2026-07-11 Flickr-audit lessons + FOM tasks"
```

---

## PART C — Operator decisions (RESOLVED 2026-07-11 — all recommendations accepted)

1. **Root path:** `/assets/fom/{ships,ports,misc}/` ✓
2. **License label:** `© Flickers of Majesty — all rights reserved` (sidecar + fom.csv); HTML uses Photo © ✓
3. **FOM scope:** any first-party operator image ✓
4. **Non-owned chat refs:** not FOM — use CC sourcing harness ✓

Canonical spec: `admin/FOM-STORAGE-SPEC.md` · Memories: `69ca600d`, `639cd9aa`

---

## PART D — Key session facts (context)

- **Flickr audit (2026-05-23):** 868 image files / 867 unique URLs / 122 ports classified by two independent methods (CC-URL regex + Flickr `"license":N` JSON), zero disagreements. Result: **54 keep** (compliant CC), **814 delete-or-replace** (772 ARR + 23 NC + 19 ND + 4 gone-from-Flickr). Per-image table was produced at `/tmp/flickr-audit-2026-05-23/per_image_license_table.tsv` (ephemeral — regenerate if needed).
- **Ports impact:** 103 fully gutted, 16 partial, 3 fully kept (`honningsvag`, `okinawa`, `port-everglades`). Full list is in memory M2 context / the audit artifacts.
- **Zero FOM images were touched by any deletion** — all deletions were under `ports/img/<port>/`; FOM lives at `assets/ships/` etc.
- **Nothing is currently deleted on disk.** The `8fdb1bde` deletion never persisted; all images + placeholders are intact (961 `Flickr (verify` rows still in `attributions/attributions.csv`).

---

## PART E — Where my un-pushed work still lives (container-local)

In the remote container only (will vanish when the container is reclaimed):
- `open-claw-stuff` commit **`22a761c`**, tag **`session-2026-07-11-memory-hls`** — contains the 6 memories + 4 catalog rows on the household-SSOT lineage.

Nothing depends on that commit surviving — **Parts A + B fully reproduce it.**
