# Phase 6 sourcing — count-claim corrections

**Audit date:** 2026-05-18
**Branch:** `claude/source-ship-page-images-nnVkF`

## Why this file exists

Across 24 ship-sourcing commits on this branch, four commit messages overstate
the post-source image count by exactly one. The integrity outcome
(`few_images` BLOCKING cleared) is unchanged in every case — the gap is only
between the count cited in the commit body and the count the validator
reports today. CAREFUL §"Claim-Evidence Discipline" §Mode B names this
exact pattern: claim wider than evidence, even though the evidence is right
next to the claim. The operator surfaced it after the audit question
"were you careful or clever?" produced the same answer twice in the same
session, so this file logs the actual numbers and what to do differently.

## The four slips

| Commit | Ship | Commit-message claim | Validator now | Off by |
|---|---|---|---:|---:|
| `5fdf9fb8` | Scarlet Lady | "6 → 14" | 13 | +1 |
| `322e7703` | Resilient Lady | "5 → 13" (table row inside body) | 12 | +1 |
| `99f55660` | Crown Princess | "6 → 13" | 12 | +1 |
| `6b2c0e24` | Celebrity Eclipse | "12" (body table) | 11 | +1 |

Verified via `node admin/validate-ship-page.js <path>.html` per ship on
2026-05-18; the value reported on the "Images: N" line of the validator
output is the count of record.

## All other 20 ships match exactly

| Commit | Ship | Claim | Validator |
|---|---|---|---:|
| `b88f4c19` | Valiant Lady | 5 → 11 | 11 ✓ |
| `03958090` | Brilliant Lady | 6 → 7 (partial) | 7 ✓ |
| `bffdbfd8` | Wonder of the Seas | 7 → 10 | 10 ✓ |
| `76d3200f` | Mariner of the Seas | 6 → 12 | 12 ✓ |
| `9037118e` | Queen Mary 2 | 7 → 14 | 14 ✓ |
| `cefaacd5` | Queen Victoria | 6 → 13 | 13 ✓ |
| `4b2bddad` | Zuiderdam | 6 → 9 | 9 ✓ |
| `87d91728` | Queen Anne | 7 → 14 | 14 ✓ |
| `cce212cc` | Queen Elizabeth | 6 → 13 | 13 ✓ |
| `9941e4f9` | Norwegian Breakaway | 7 → 15 | 15 ✓ |
| `dde3a401` | Caribbean Princess | 7 → 14 | 14 ✓ |
| `8174dad3` | Carnival Breeze | 7 → 15 | 15 ✓ |
| `bde224a8` | Westerdam | 5 → 12 | 12 ✓ |
| `8ad4d4b3` | Diamond Princess | 6 → 13 | 13 ✓ |
| `af3dacd6` | Norwegian Epic | 7 → 15 | 15 ✓ |
| `439a1d77` | Carnival Magic | 7 → 15 | 15 ✓ |
| `d430d081` | MSC Seascape | 7 → 11 | 11 ✓ |
| `6222c529` | Grand Princess | 7 → 13 | 13 ✓ |
| `7a8421f4` | Norwegian Star | 7 → 13 | 13 ✓ |
| `f87c7f42` | Costa Diadema | 7 → 10 | 10 ✓ |

## Pattern analysis

Every slip is "+1 in the after-count," not "−1" and not "mixed direction."
Likely mechanism: I counted slides I *intended* to embed (e.g. 8 fetched →
8 expected) rather than slides I *actually* embedded (the cropped Liverpool
variant on Scarlet Lady, the Princes_Pier reject on Queen Victoria didn't
get the count adjusted, the dropped Castries_Harbor on Crown Princess
didn't get the count adjusted). Equivalently: when I rejected a fetched
file pre-commit, I corrected the file inventory but not the claim
arithmetic in the commit body.

Mitigation going forward (the disciplined workflow):

1. **After embedding slides in the HTML, before writing the commit
   message, run the validator and copy the validator's "Images: N" line
   verbatim into the commit body.** Do not compute the after-count from
   memory.
2. The numeric claim in the commit subject line ("X → Y") must equal the
   validator's "Images: Y" output, not the fetched-file count.
3. The commit body's Claim-Evidence table must cite the validator's
   exact line as evidence for the count claim.

## Integrity outcome — unchanged

All four affected ships still cleared `few_images` BLOCKING:
- Scarlet Lady (13 ≥ 8) ✓
- Resilient Lady (12 ≥ 8) ✓ (placeholder also removed)
- Crown Princess (12 ≥ 8) ✓
- Celebrity Eclipse (11 ≥ 8) ✓ (placeholder also removed)

No work needs redoing. The slips are recorded so the pattern is no longer
named-but-uncorrected.
