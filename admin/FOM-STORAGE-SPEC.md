# FOM Storage Specification (approved 2026-07-11)

**Status:** Operator-approved — all recommendations from memory `69ca600d` / `639cd9aa`.  
**HLS:** `itw-fom-storage-structure` (migration execution) · `itw-fom-chat-image-intake` (workflow)

## Decisions (locked)

| # | Question | Decision |
|---|----------|----------|
| 1 | Root path | `/assets/fom/{ships,ports,misc}/` |
| 2 | License label (sidecar + CSV) | `© Flickers of Majesty — all rights reserved` |
| 3 | FOM scope | Any **first-party operator** image (ship, port, article, chat-supplied, etc.) |
| 4 | Non-owned chat refs | **Not** FOM — use CC/Wikimedia sourcing (`admin/sourcing.py`) |

Page HTML credits: **Photo ©** + [Flickers of Majesty](https://www.flickersofmajesty.com) link (per memory `5ff79914`).

## Directory layout

```
assets/fom/
  ships/     # ship photography (from legacy assets/ships/*-FOM-*)
  ports/     # port photography (from legacy ports/img/{port}/*-FOM-*)
  misc/      # other first-party operator images (articles, one-offs)
attributions/
  fom.csv    # FOM-only ledger — never mixed into Flickr/CC audits
  attributions.csv   # third-party CC sources (unchanged)
```

## Filename convention

```
<entity-slug>-FOM-NN.webp
```

- `<entity-slug>`: kebab-case entity (e.g. `harmony-of-the-seas`, `cozumel`)
- Literal `-FOM-` segment (case as shown)
- `NN`: zero-padded sequence per entity (`01`, `02`, …)
- **WebP only** on disk (no parallel `.jpeg` dupes)
- No spaced pattern (`FOM- - 1`) — legacy anti-pattern

## Sidecar (mandatory)

Sibling file: `<name>.webp.attr.json` (canonical per `admin/sourcing.py` ATTR-001).

```json
{
  "source_type": "fom",
  "source": "https://www.flickersofmajesty.com",
  "photographer": "Flickers of Majesty",
  "license": "© Flickers of Majesty — all rights reserved",
  "attribution_html": "Photo © Flickers of Majesty"
}
```

## `attributions/fom.csv` columns

```csv
file_path,entity_slug,category,sequence,license,source_url,notes
```

- `category`: `ships` | `ports` | `misc`
- One row per FOM image; append-only during intake
- **Never** write FOM rows into `attributions/attributions.csv`

## Chat-image intake (summary)

When the operator supplies an image via chat:

1. Confirm entity/subject and that it is **operator-owned** (not a pasted CC ref).
2. Pick next `NN` for that entity (never reuse).
3. Save under `/assets/fom/{category}/<entity-slug>-FOM-NN.webp`.
4. Write sidecar + `fom.csv` row.
5. Never store under a generic or CC filename.

Full workflow: HLS task `itw-fom-chat-image-intake`.

## Migration (not yet executed)

Legacy inventory (~235 files): scattered in `assets/ships/`, `ports/img/{cozumel,curacao,nassau}/`, mixed webp/jpeg, two filename patterns, ~42/~195 with sidecars.

```bash
# Dry-run inventory + move plan
python3 admin/migrate-fom-storage.py --dry-run

# Execute (after reviewing plan)
python3 admin/migrate-fom-storage.py --apply
```

After migration: update HTML `src` paths, remove jpeg dupes, regenerate mirrors.