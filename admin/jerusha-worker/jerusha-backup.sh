#!/usr/bin/env bash
# Off-Cloudflare keepsake backup for the Jerusha notes + media metadata.
# Pulls CIPHERTEXT ONLY (zero-knowledge — useless without the passphrase) to local
# disk, so the thread survives a lost Cloudflare account/namespace
# (jerusha-notes-persistence.md, threat row #4 — "the real gap"). Restore notes via
# the worker's POST /import.
#
# Token (never commit it): set JERUSHA_TOKEN to the NOTES_TOKEN bearer, e.g.
#   JERUSHA_TOKEN=xxxx ./jerusha-backup.sh
# Optional: JERUSHA_BACKUP_DIR (default ~/jerusha-backups), JERUSHA_WORKER.
# Optional: JERUSHA_BACKUP_BLOBS=1 also downloads every media blob (ciphertext) to
#   $DEST/media/<id>.bin. Off by default because blobs are large (video up to 220 MB
#   each); without it only the metadata is saved and the photos/videos themselves
#   live ONLY in R2. Blobs already on disk (non-zero size) are skipped, so re-runs
#   only fetch what is new. Needs python3.
# Cron (twice weekly): 0 9 * * 1,4  JERUSHA_TOKEN=xxxx /path/to/jerusha-backup.sh
set -euo pipefail
WORKER="${JERUSHA_WORKER:-https://jerusha-notes.inthewake-jerusha.workers.dev}"
DEST="${JERUSHA_BACKUP_DIR:-$HOME/jerusha-backups}"
: "${JERUSHA_TOKEN:?set JERUSHA_TOKEN to the NOTES_TOKEN bearer}"
mkdir -p "$DEST"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
auth=(-H "Authorization: Bearer ${JERUSHA_TOKEN}")
curl -fsS "${auth[@]}" "$WORKER/notes" -o "$DEST/jerusha-notes-$STAMP.json"
curl -fsS "${auth[@]}" "$WORKER/media" -o "$DEST/jerusha-media-meta-$STAMP.json"
notes=$(grep -o '"id"' "$DEST/jerusha-notes-$STAMP.json" | wc -l | tr -d ' ')
media=$(grep -o '"id"' "$DEST/jerusha-media-meta-$STAMP.json" | wc -l | tr -d ' ')
echo "Backup OK -> $DEST"
echo "  jerusha-notes-$STAMP.json       (~$notes note records, ciphertext)"
echo "  jerusha-media-meta-$STAMP.json  (~$media media records; blobs only with JERUSHA_BACKUP_BLOBS=1)"
echo "Restore notes: POST the notes JSON to $WORKER/import"

if [ "${JERUSHA_BACKUP_BLOBS:-0}" = "1" ]; then
  mkdir -p "$DEST/media"
  # Ids come from the JSON itself (python3 json), one per line, never from grep: a
  # grep for "id" would also match text inside other fields. Each id is printed with
  # its URL-encoded form (tab-separated) so an odd id cannot bend the request path.
  ids="$(python3 -c '
import json, sys, urllib.parse
with open(sys.argv[1]) as f:
    data = json.load(f)
for m in data.get("media", []):
    i = m.get("id")
    if isinstance(i, str) and i:
        print(i + "\t" + urllib.parse.quote(i, safe=""))
' "$DEST/jerusha-media-meta-$STAMP.json")"
  got=0; skipped=0; failed=0
  while IFS=$'\t' read -r id enc; do
    [ -n "$id" ] || continue
    # An id becomes a file name; refuse anything that could leave $DEST/media.
    case "$id" in
      */*|.*) echo "FAILED media blob id=$id (unsafe id, not saved)" >&2; failed=$((failed + 1)); continue ;;
    esac
    out="$DEST/media/$id.bin"
    if [ -s "$out" ]; then skipped=$((skipped + 1)); continue; fi
    # Download to a .part file and rename only on success, so an interrupted
    # download is never mistaken for a finished blob (and skipped) on the next run.
    if curl -fsS "${auth[@]}" "$WORKER/media/$enc" -o "$out.part" && [ -s "$out.part" ]; then
      mv "$out.part" "$out"; got=$((got + 1))
    else
      rm -f "$out.part"
      echo "FAILED media blob id=$id" >&2; failed=$((failed + 1))
    fi
  done <<< "$ids"
  echo "  media blobs -> $DEST/media  (downloaded $got, skipped $skipped already present, failed $failed)"
  # Keep going past a failure so one bad blob does not block the rest, but never
  # report success: a backup with a missing blob is not a backup.
  if [ "$failed" -gt 0 ]; then echo "Backup INCOMPLETE: $failed media blob(s) failed (ids above)" >&2; exit 1; fi
fi
