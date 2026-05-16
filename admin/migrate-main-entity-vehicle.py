#!/usr/bin/env python3
"""
Migrate ship-page mainEntity @type from a blacklisted value to "Vehicle".

Per admin/POLICY_DECISIONS.md § 0.1 and admin/validator-config.json:
  blacklist = [Cruise, Service, Thing, WebPage]
  preferred = Vehicle (Schema.org subtype of Product for transport devices)

Targets only `mainEntity` keys whose VALUE is a JSON object with a top-level
`@type` field set to a blacklisted string. Arrays of Question objects (FAQPage
mainEntity) and any other shape are left untouched by design.

Usage:
    python3 admin/migrate-main-entity-vehicle.py <file.html> [<file2.html> ...]
    python3 admin/migrate-main-entity-vehicle.py --dry-run <file.html>

Exit codes:
    0 = success (one or more files modified, or all already correct)
    1 = file not found / unreadable
    2 = no blacklisted mainEntity found and at least one file given
"""
import sys
import re
import json
import pathlib

BLACKLIST = {"Cruise", "Service", "Thing", "WebPage"}
TARGET = "Vehicle"


def find_blacklisted_main_entity(html: str):
    """Return list of (script_start, script_end, type_value) tuples for every
    JSON-LD block whose top-level mainEntity is a dict with a blacklisted @type.
    Indices are byte offsets into html."""
    matches = []
    for m in re.finditer(
        r'<script type="application/ld\+json">(.*?)</script>',
        html,
        flags=re.DOTALL,
    ):
        body = m.group(1)
        try:
            d = json.loads(body.strip())
        except json.JSONDecodeError:
            continue
        if isinstance(d, dict) and isinstance(d.get("mainEntity"), dict):
            t = d["mainEntity"].get("@type")
            if t in BLACKLIST:
                matches.append((m.start(1), m.end(1), t))
    return matches


def rewrite(html: str, dry_run: bool = False):
    """Rewrite the first blacklisted mainEntity.@type within each JSON-LD block
    to TARGET. Returns (new_html, changes) where changes is a list of (block_index, old_type)."""
    matches = find_blacklisted_main_entity(html)
    if not matches:
        return html, []
    changes = []
    out = html
    # Process matches in reverse so byte offsets stay valid as we splice.
    for idx, (s, e, old_type) in enumerate(reversed(matches)):
        body = out[s:e]
        # Surgical regex: change ONLY the first `"@type": "<blacklisted>"`
        # that appears AFTER a `"mainEntity"` key inside this block. This
        # guards against accidentally rewriting the WebPage's outer @type.
        new_body, n = re.subn(
            r'("mainEntity"\s*:\s*\{\s*"@type"\s*:\s*")(' + re.escape(old_type) + r')(")',
            rf'\1{TARGET}\3',
            body,
            count=1,
            flags=re.DOTALL,
        )
        if n != 1:
            raise RuntimeError(
                f"Could not surgically replace mainEntity @type={old_type!r} "
                "in JSON-LD block (regex matched 0 times — block format unexpected)."
            )
        out = out[:s] + new_body + out[e:]
        changes.append((len(matches) - 1 - idx, old_type))
    return out, list(reversed(changes))


def main(argv):
    args = list(argv[1:])
    dry_run = False
    if "--dry-run" in args:
        dry_run = True
        args.remove("--dry-run")
    if not args:
        print(__doc__, file=sys.stderr)
        return 1
    overall = 0
    for path in args:
        p = pathlib.Path(path)
        if not p.is_file():
            print(f"ERROR: not a file: {path}", file=sys.stderr)
            return 1
        html = p.read_text(encoding="utf-8")
        new_html, changes = rewrite(html, dry_run=dry_run)
        if not changes:
            print(f"  no-op  {path}")
            continue
        # Re-validate: parse every JSON-LD block after rewrite, confirm none
        # has a blacklisted mainEntity, and confirm every JSON-LD block still
        # parses cleanly.
        after_matches = find_blacklisted_main_entity(new_html)
        if after_matches:
            raise RuntimeError(f"Post-rewrite still has blacklisted mainEntity in {path}")
        for m in re.finditer(
            r'<script type="application/ld\+json">(.*?)</script>',
            new_html,
            flags=re.DOTALL,
        ):
            try:
                json.loads(m.group(1).strip())
            except json.JSONDecodeError as exc:
                raise RuntimeError(f"Post-rewrite JSON-LD parse failure in {path}: {exc}")
        types = [t for _, t in changes]
        print(f"  fix    {path}  ({len(changes)} block(s): {types} -> {TARGET})")
        if not dry_run:
            p.write_text(new_html, encoding="utf-8")
            overall += 1
    if dry_run:
        print(f"\nDRY-RUN: would modify {sum(1 for _ in args)} candidates (no writes).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
