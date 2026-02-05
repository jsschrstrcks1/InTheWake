# Logbook Site-Wide Audit Report

**Date**: 2026-02-05
**Scope**: All 285 logbook JSON files in `assets/data/logbook/` plus gold standard files in `ships/rcl/assets/`
**Purpose**: Identify name collisions, templating/structural mirroring, quality issues, and build a reserved name registry for new logbook development.

---

## 1. Quality Tier Summary

| Tier | Count | Criteria | Action |
|------|-------|----------|--------|
| **T1 (Gold standard)** | 2 | `personas` key, 10+ entries, `##` headings, 300+ avg words | Done |
| **T1 (Gold, ships/ dir)** | 2 | Same quality, different path | Reference only |
| **T2 (Content, wrong format)** | 250 | `stories` key, no `##` headings, variable quality | Need rewrite to T1 for in-scope ships |
| **T3 (Skeleton stubs)** | 33 | <5 entries, <150 avg words | Need full rewrite for in-scope ships |

### Tier 1 Files (4 total)

| Ship | Path | Entries | Avg Words | Correct Headings |
|------|------|---------|-----------|------------------|
| Celebrity Constellation | `assets/data/logbook/celebrity-cruises/celebrity-constellation.json` | 10 | 638 | Yes |
| Celebrity Infinity | `assets/data/logbook/celebrity-cruises/celebrity-infinity.json` | 10 | 720 | Yes |
| Radiance of the Seas | `ships/rcl/assets/radiance-of-the-seas.json` | 10 | ~600 | Yes |
| Enchantment of the Seas | `ships/rcl/assets/enchantment.json` | 10 | ~500 | Partial (`###` not `##`) |

---

## 2. Reserved Name Registry

**76 unique names** across 4 gold standard / Tier 1 files. These names MUST NOT be reused in any new logbook.

### By Ship

#### Radiance of the Seas (Gold Standard)
- **Personas**: Harper, Mateo, Nora, Desmond, Lianna, Owen, Yasmin, Caleb, Sahana, Margot
- **Crewmates**: Lila, Alina, Anya, Priyanka, Jovie, Mara, Pilar, Irena

#### Enchantment of the Seas (Gold Standard)
- **Personas**: Marisol, Kendrick, Ellen, Nate, Tara, Selena, Marcus, Amaya, Harold, Lila, Jess, Rob
- **Crewmates**: Marcela, Carla, Liza, Napapat, Ana, Jessa, Claudia

#### Celebrity Constellation (Tier 1)
- **Personas**: Maren, James, Sofia, Ruth, Derek, Tom, Grace, Chen, Yuna, Ravi
- **Crewmates**: Dina, Mila, Joy, Mariel, Estrella, Katya, Jelena, Rosalie, Tessie, Gita

#### Celebrity Infinity (Tier 1)
- **Personas**: Athena, Simon, Alistair, June, Tariq, Helen, Phoebe, Ross, Frank, Patricia
- **Crewmates**: Zara, Ingrid, Olga, Wati, Amina, Sonia, Nina, Thea, Fernanda, Hana

### Alphabetical Master List (DO NOT REUSE)

Alina, Alistair, Amaya, Amina, Ana, Anya, Athena, Caleb, Carla, Chen, Claudia, Derek, Desmond, Dina, Ellen, Estrella, Fernanda, Frank, Gita, Grace, Hana, Harold, Harper, Helen, Ingrid, Irena, James, Jelena, Jess, Jessa, Jovie, Joy, June, Katya, Kendrick, Lianna, Lila, Liza, Mara, Marcela, Marcus, Maren, Margot, Mariel, Marisol, Mateo, Mila, Napapat, Nate, Nina, Nora, Olga, Owen, Patricia, Phoebe, Pilar, Priyanka, Ravi, Rob, Rosalie, Ross, Ruth, Sahana, Selena, Simon, Sofia, Sonia, Tara, Tariq, Tessie, Thea, Tom, Wati, Yasmin, Yuna, Zara

---

## 3. Existing Name Collisions Within Gold Standard Files

| Name | Ship 1 | Role 1 | Ship 2 | Role 2 | Status |
|------|--------|--------|--------|--------|--------|
| **Lila** | Radiance of the Seas | crewmate | Enchantment of the Seas | persona | Pre-existing, not our files |

This is the only collision within gold standard / Tier 1 files. It's in pre-existing files we didn't author.

---

## 4. In-Scope Ships Status

Ships that need Tier 1 logbook rewrites for the current task:

| Ship | Current Tier | Current Entries | Avg Words | Action |
|------|-------------|-----------------|-----------|--------|
| Celebrity Constellation | **T1 DONE** | 10 | 638 | Complete |
| Celebrity Infinity | **T1 DONE** | 10 | 720 | Complete |
| Celebrity Summit | T2 | 10 | 150 | Full rewrite |
| Celebrity Millennium | T2 | 13 | 196 | Full rewrite |
| Celebrity Xcel | T3 | 3 | 109 | Full rewrite |
| Celebrity Flora | T2 | 10 | 139 | Full rewrite |
| HAL Eurodam | T2 | 17 | 314 | Full rewrite |
| HAL Oosterdam | T2 | 16 | 281 | Full rewrite |
| HAL Noordam | T2 | 17 | 279 | Full rewrite |
| HAL Zaandam | T2 | 17 | 352 | Full rewrite |
| MSC World America | T2 | 13 | 271 | Full rewrite |

### Existing Persona Names in Stubs (to be replaced, NOT reserved)

These names are in the batch-generated stubs that will be fully replaced. They are NOT reserved since the stubs will be overwritten. Listed for reference only:

- **Summit**: Edward, Jennifer, Martha, Patricia, Catherine, Michael, Robert, Lisa, David, Steven, Ellen, Mark
- **Millennium**: Katherine, Robert, Barbara, Thomas, Michelle, William, Diane, Richard, Sandra, Christine, Jennifer, Thomas, Rebecca, James, Nicole, Harold
- **Xcel**: (no real names - "Fleet" placeholders)
- **Flora**: Richard, Katherine, Elizabeth, James, Caroline, Robert, Sarah, Michael, Thomas, Margaret, Rachel
- **Eurodam**: Joyce, Leonard, Deborah, Martin, Patricia, Helen, Robert, Raymond, Lawrence, James, Linda, Steven, Sandra, Jennifer, Marcus, Harold, Eleanor, David, Margaret
- **Oosterdam**: Patricia, Graham, Anne, Christopher, Margaret, William, Jean, Richard, Diane, Kenneth, Charles, Barbara, Nancy, Steven, Kenji, Marcus, Angela, Dorothy, Sandra, Michael, Katherine, Jennifer
- **Noordam**: Susan, Richard, Janet, Michael, Marie, Pierre, Elizabeth, David, Carol, Kenneth, Barbara, Thomas, William, Margaret, Catherine, Rebecca, Daniel, James, Sarah, Eleanor, Jennifer, Sandra, Patricia
- **Zaandam**: Patricia, Raymond, Mark, Jennifer, Janet, Michael, Margaret, Peter, Carol, Kenneth, Betty, Harold, James, Elizabeth, Emily, Jonathan, Bernard, Dorothy, Robert, Martha, Claire, Edward, Leonard
- **MSC World America**: Natasha, Jennifer, Marcus, Harold, Eleanor, Patricia, Maria, Robert, William

---

## 5. Templating / Structural Mirroring Analysis

### Tier 1 Files Comparison (Constellation vs Infinity)

The Constellation and Infinity persona sets were deliberately designed to NOT mirror each other:

**Constellation archetypes**: solo woman 50s, retired widower 72, newlywed couple, wheelchair grandmother + family, single father + daughter, solo man career break 38, grieving woman in suite, experienced couple 68, single mother 36, father + adult son

**Infinity archetypes**: Greek-American retiree returning to homeland, couple managing MS (Thalassotherapy Pool), solo photographer chasing volcanic light, four college friends reuniting, British-Pakistani family with halal needs, merchant mariner's widow, young solo woman writer 28, Deaf couple testing accessibility, retired naval officer, mother + adult autistic son

**Assessment**: No structural mirroring. Each persona set reflects the specific ship's actual passenger demographics and itinerary characteristics. Infinity's stories are grounded in Millennium-class features (Thalassotherapy Pool, onyx staircase, Canary Islands routing).

### T2 Archetype Pattern Matches (potential batch templating)

The audit detected these identical archetype sequences across T2 stub files:

| Match | Ships | Sequence |
|-------|-------|----------|
| 2-ship match | carnival-sunshine, carnival-valor | `other x10` (no archetypes detected) |
| 5-ship match | carnivale-1956, celebration-1987, holiday-1985, jubilee-1986, tropicale-1981 | `other x10` (all historical ships, all batch stubs) |
| 13-ship match | celebrity-compass, celebrity-seeker, discovery-class-ship-tbn, + 10 others | `other x2` (all T3 skeleton stubs) |
| 10-ship match | celebrity-galaxy, celebrity-mercury, celebrity-xcel, + 7 others | `other x3` (all T3 skeleton stubs) |
| 2-ship match | costa-deliziosa, msc-world-america | 13-entry identical sequence |

**Assessment**: The T2/T3 files are all batch-generated and inherently templated. This is expected and not a problem since they'll be fully replaced for in-scope ships. The key concern is preventing templating in our NEW Tier 1 files, which has been addressed by designing genuinely unique persona sets per ship.

---

## 6. T2 Stub Characteristics (format reference for replacements)

All 250 T2 files share these characteristics:
- Use `"stories"` key (not `"personas"`)
- Have `"author"` as dict with `name` and `location`
- Have `"persona_label"` as category string (e.g., "Galveston Pride", "Fleet History")
- Have `"intended_reader"` and `"core_insight"` fields
- No `##` section headings in markdown
- Markdown uses `**bold**` for opening lines
- Average 150-350 words per entry
- 10-17 entries per file
- No "A Female Crewmate's Perspective" section
- No disability/accessibility content as a dedicated section

### Required changes for T1 upgrade:
1. Change `"stories"` key to `"personas"`
2. Add `"id"` field (format: `p1-name`)
3. Rewrite `"persona_label"` to be a full narrative sentence
4. Add `"nav_port"` and `"nav_starboard"` fields
5. Add 7-section `##` heading structure
6. Add "A Female Crewmate's Perspective" with unique named crewmate
7. Minimum 500 words per entry, 10 entries per ship
8. Ensure all names unique across gold standard registry

---

## 7. Site-Wide Quality Metrics

| Cruise Line | Total Files | T1 | T2 | T3 | Avg Words Range |
|-------------|-------------|----|----|----|-----------------|
| Carnival | 45 | 0 | 42 | 3 | 27-680 |
| Celebrity | 22 | 2 | 14 | 6 | 98-720 |
| Costa | 10 | 0 | 10 | 0 | 299-401 |
| Cunard | 4 | 0 | 4 | 0 | 267-278 |
| Explora | 6 | 0 | 6 | 0 | 362-408 |
| Holland America | 38 | 0 | 38 | 0 | 219-374 |
| MSC | 24 | 0 | 24 | 0 | 215-279 |
| Norwegian | 20 | 0 | 20 | 0 | 157-258 |
| Oceania | 8 | 0 | 8 | 0 | 246-274 |
| Princess | 17 | 0 | 17 | 0 | 191-259 |
| RCL | 31 | 0 | 31 | 0 | 131-703 |
| Regent | 7 | 0 | 7 | 0 | 406-447 |
| Seabourn | 7 | 0 | 7 | 0 | 371-390 |
| Silversea | 12 | 0 | 12 | 0 | 373-431 |
| Virgin | 4 | 0 | 4 | 0 | 336-364 |

### Notable T2 files with higher quality (avg 400+ words):
- Costa line (10 files, avg ~350-400w)
- Regent line (7 files, avg ~420w)
- Seabourn line (7 files, avg ~380w)
- Silversea line (12 files, avg ~400w)
- HAL Zaandam (352w), Eurodam (314w)
- RCL Harmony of the Seas (703w), Wonder of the Seas (685w)

These are still T2 (wrong format, no headings) but have more substantial content that could inform rewrites.

---

## 8. Action Items

### Immediate (Current Sprint)
1. Write 9 remaining in-scope ship logbooks (Summit, Millennium, Xcel, Flora, Eurodam, Oosterdam, Noordam, Zaandam, MSC World America)
2. Each must have 10 genuinely unique personas with correct 7-section headings
3. All names must be checked against the 76-name reserved list above
4. Each ship's persona set must reflect its actual passenger demographics

### Future (Not In Scope)
- Lila collision between Radiance (crewmate) and Enchantment (persona) — pre-existing, owners' call
- Upgrade remaining T2 files to T1 standard across all cruise lines
- Enchantment uses `###` headings instead of `##` — may need alignment
