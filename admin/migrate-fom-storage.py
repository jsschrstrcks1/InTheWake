#!/usr/bin/env python3
"""Inventory and migrate legacy FOM images into /assets/fom/{ships,ports,misc}/.

Spec: admin/FOM-STORAGE-SPEC.md · Memory: 69ca600d, 639cd9aa

Default is --dry-run (plan only). --apply moves files and writes sidecars for gaps.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
FOM_ROOT = REPO / "assets" / "fom"
FOM_CSV = REPO / "attributions" / "fom.csv"
LICENSE = "© Flickers of Majesty — all rights reserved"
SOURCE_URL = "https://www.flickersofmajesty.com"

# Legacy patterns: Ship-name-FOM- - 1.webp, ship-name-FOM-01.webp, *.jpeg dupes
FOM_RE = re.compile(r"(?i)(.+)-FOM-\s*-?\s*(\d+)\.(webp|jpe?g)$")

SCAN_DIRS = [
    (REPO / "assets" / "ships", "ships"),
    (REPO / "ports" / "img", "ports"),  # ports/img/<slug>/...
]


def _entity_slug_from_stem(stem: str) -> str:
    base = re.sub(r"(?i)-fom-\s*-?\s*\d+$", "", stem)
    return base.lower().replace(" ", "-")


def _canonical_name(entity: str, seq: int, ext: str = "webp") -> str:
    return f"{entity}-FOM-{seq:02d}.{ext}"


def _attr_path(webp: Path) -> Path:
    return webp.with_suffix(".webp.attr.json")


def _default_attr() -> dict:
    return {
        "source_type": "fom",
        "source": SOURCE_URL,
        "photographer": "Flickers of Majesty",
        "license": LICENSE,
        "attribution_html": "Photo © Flickers of Majesty",
    }


def discover() -> list[dict]:
    found: list[dict] = []
    for root, category in SCAN_DIRS:
        if not root.exists():
            continue
        if category == "ports":
            for port_dir in sorted(root.iterdir()):
                if not port_dir.is_dir():
                    continue
                for p in port_dir.iterdir():
                    m = FOM_RE.match(p.name)
                    if m:
                        entity = port_dir.name
                        found.append(_row(p, category, entity, m))
        else:
            for p in root.iterdir():
                m = FOM_RE.match(p.name)
                if m:
                    entity = _entity_slug_from_stem(m.group(1))
                    found.append(_row(p, category, entity, m))
    return found


def _row(path: Path, category: str, entity: str, m: re.Match) -> dict:
    seq = int(m.group(2))
    ext = m.group(3).lower()
    dest_dir = FOM_ROOT / category
    dest_name = _canonical_name(entity, seq)
    dest = dest_dir / dest_name
    return {
        "src": path,
        "category": category,
        "entity": entity,
        "seq": seq,
        "ext": ext,
        "dest": dest,
        "has_sidecar": _attr_path(dest if ext == "webp" else path.with_suffix(".webp")).exists()
            or _attr_path(path if path.suffix == ".webp" else path).exists(),
        "is_jpeg_dupe": ext in ("jpg", "jpeg"),
    }


def plan(rows: list[dict]) -> dict:
    webps = [r for r in rows if not r["is_jpeg_dupe"]]
    jpegs = [r for r in rows if r["is_jpeg_dupe"]]
    missing_sidecar = [r for r in webps if not r["has_sidecar"]]
    collisions: list[tuple[Path, Path]] = []
    seen: dict[tuple[str, str, int], Path] = {}
    for r in webps:
        key = (r["category"], r["entity"], r["seq"])
        if key in seen:
            collisions.append((seen[key], r["src"]))
        else:
            seen[key] = r["src"]
    return {
        "total_hits": len(rows),
        "webp_moves": len(webps),
        "jpeg_dupes_to_drop": len(jpegs),
        "missing_sidecars": len(missing_sidecar),
        "collisions": collisions,
        "rows": webps,
    }


def apply_plan(summary: dict) -> None:
    FOM_ROOT.mkdir(parents=True, exist_ok=True)
    csv_rows: list[dict] = []
    for r in summary["rows"]:
        dest: Path = r["dest"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            print(f"SKIP exists: {dest}")
            continue
        shutil.move(str(r["src"]), str(dest))
        attr = _attr_path(dest)
        if not attr.exists():
            attr.write_text(json.dumps(_default_attr(), indent=2) + "\n", encoding="utf-8")
        csv_rows.append({
            "file_path": str(dest.relative_to(REPO)),
            "entity_slug": r["entity"],
            "category": r["category"],
            "sequence": f"{r['seq']:02d}",
            "license": LICENSE,
            "source_url": SOURCE_URL,
            "notes": f"migrated from {r['src'].relative_to(REPO)}",
        })
        print(f"MOVED {r['src'].relative_to(REPO)} -> {dest.relative_to(REPO)}")
    if csv_rows:
        write_header = not FOM_CSV.exists() or FOM_CSV.stat().st_size == 0
        with FOM_CSV.open("a", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(csv_rows[0].keys()))
            if write_header:
                w.writeheader()
            w.writerows(csv_rows)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--dry-run", action="store_true", default=True)
    p.add_argument("--apply", action="store_true", help="execute moves")
    args = p.parse_args()
    dry = not args.apply

    rows = discover()
    summary = plan(rows)
    print(json.dumps({
        "dry_run": dry,
        "total_hits": summary["total_hits"],
        "webp_moves": summary["webp_moves"],
        "jpeg_dupes_to_drop": summary["jpeg_dupes_to_drop"],
        "missing_sidecars": summary["missing_sidecars"],
        "collisions": [(str(a), str(b)) for a, b in summary["collisions"]],
    }, indent=2))
    if dry:
        for r in summary["rows"][:20]:
            print(f"  PLAN {r['src'].relative_to(REPO)} -> {r['dest'].relative_to(REPO)}")
        if len(summary["rows"]) > 20:
            print(f"  ... and {len(summary['rows']) - 20} more")
        return 0
    apply_plan(summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())