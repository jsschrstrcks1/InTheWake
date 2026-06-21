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
echo "  jerusha-media-meta-$STAMP.json  (~$media media records; blobs stay in R2)"
echo "Restore notes: POST the notes JSON to $WORKER/import"
