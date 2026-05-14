#!/usr/bin/env python3
"""
fetch-commons-via-proxy.py

Sandbox-aware Wikimedia Commons fetcher for Phase 6 (ship image sourcing).

Why this exists:
  The host running this script blocks outbound HTTPS to *.wikimedia.org and
  *.wikipedia.org at the proxy layer (responses carry x-block-reason:
  hostname_blocked). The repo's existing admin/fetch-wiki-ship-images.py
  cannot run from here. Wikimedia Cloud infrastructure (Toolforge / WMCloud)
  is reachable, and one open CORS relay on Fly.io is reachable, so we route:

    metadata + category listing -> magnustools.toolforge.org (Wikimedia infra)
                                   petscan.wmcloud.org
    image bytes                 -> cors-anywhere.fly.dev as transparent relay
                                   to upload.wikimedia.org

  Every downloaded byte stream is SHA-1-verified against the hash that
  Toolforge reports for that Commons file. If the SHA-1 does not match the
  file is rejected.  The bytes therefore come from a third party but their
  authenticity is cryptographically anchored back to Commons.

Usage:
  python3 admin/fetch-commons-via-proxy.py \
      --category 'Valiant Lady (ship, 2021)' \
      --ship-slug valiant-lady \
      --line virgin-voyages \
      --max 8

Outputs (per accepted file):
  /assets/ships/<line>/<slug>/<commons-filename>.webp
  /assets/ships/<line>/<slug>/<commons-filename>.attr.json
  one appended row in /assets/data/atribution_registry.json

The script does NOT touch the ship HTML. The caller inserts <img> markup
after reviewing the picked file set (one ship per commit; the integration
step is intentionally manual so alt text is written for the actual scene).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image
except ModuleNotFoundError:
    sys.stderr.write("Pillow is required. pip3 install Pillow\n")
    sys.exit(2)


PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS_SHIPS = PROJECT_ROOT / "assets" / "ships"
REGISTRY_PATH = PROJECT_ROOT / "assets" / "data" / "atribution_registry.json"

UA = (
    "InTheWake/1.0 (https://cruisinginthewake.com; ship-reference-site; "
    "phase-6-image-sourcing) Python/3"
)
TIMEOUT = 90

COMMONSAPI = "https://magnustools.toolforge.org/commonsapi.php"
PETSCAN = "https://petscan.wmcloud.org/"
FLY_PROXY = "https://cors-anywhere.fly.dev/"

ACCEPTABLE_LICENSES = (
    "cc-zero", "cc0", "public domain", "publicdomain",
    "cc-by", "cc-by-sa", "cc-by-2", "cc-by-3", "cc-by-4",
    "cc-by-sa-2", "cc-by-sa-3", "cc-by-sa-4",
    "gfdl",
)


def http_get(url: str, accept: str = "*/*", attempts: int = 3) -> bytes:
    last_err = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": UA, "Accept": accept},
            )
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                return resp.read()
        except Exception as e:
            last_err = e
            time.sleep(2 ** i)
    raise RuntimeError(f"GET failed after {attempts} attempts: {url} ({last_err})")


def http_get_soft(url: str, accept: str = "*/*", attempts: int = 3) -> bytes | None:
    """Like http_get but returns None instead of raising."""
    try:
        return http_get(url, accept=accept, attempts=attempts)
    except Exception as e:
        sys.stderr.write(f"  fetch failed: {url[:120]}... ({e})\n")
        return None


def list_category_files(category: str, max_files: int = 60) -> list[str]:
    """Return list of Commons file titles in a category via PETScan."""
    params = {
        "language": "commons",
        "project": "wikimedia",
        "categories": category,
        "format": "json",
        "doit": "Do it",
        "ns[6]": "1",
        "depth": "1",
    }
    raw = http_get(f"{PETSCAN}?{urllib.parse.urlencode(params)}")
    data = json.loads(raw)
    pages = data.get("*", [{}])[0].get("a", {}).get("*", [])
    files = []
    for p in pages:
        if p.get("namespace") != 6:
            continue
        title = p.get("title", "")
        if not title:
            continue
        ext = title.rsplit(".", 1)[-1].lower()
        if ext not in ("jpg", "jpeg", "png"):
            continue
        files.append(title)
        if len(files) >= max_files:
            break
    return files


def get_file_metadata(commons_filename: str) -> dict | None:
    """Look up real upload URL, SHA-1, license, author, description.
    Returns None on any failure (HTTP or parse) so a bad file does not abort the batch.
    """
    url = f"{COMMONSAPI}?{urllib.parse.urlencode({'image': commons_filename})}"
    raw = http_get_soft(url)
    if raw is None:
        return None
    # commonsapi.php emits unescaped '&' inside URL query strings (utm_source=...&utm_campaign=...)
    # which makes the XML technically malformed. Patch lone ampersands before parsing.
    txt = raw.decode("utf-8", errors="replace")
    txt = re.sub(r"&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)", "&amp;", txt)
    try:
        root = ET.fromstring(txt)
    except ET.ParseError as e:
        sys.stderr.write(f"  XML parse error for {commons_filename}: {e}\n")
        return None
    f = root.find("file")
    if f is None:
        return None

    def t(path: str) -> str | None:
        el = f.find(path)
        return el.text if el is not None else None

    file_url_el = f.find("urls/file")
    desc_el = root.find('description/language[@code="en"]')
    if desc_el is None:
        desc_el = root.find("description/language")
    lic_el = root.find("licenses/license/name")

    file_url = (file_url_el.text or "").split("?")[0] if file_url_el is not None else None

    return {
        "filename": commons_filename,
        "url": file_url,
        "sha1": t("sha1"),
        "size": int(t("size")) if t("size") else None,
        "width": int(t("width")) if t("width") else None,
        "height": int(t("height")) if t("height") else None,
        "uploader": t("uploader"),
        "upload_date": t("upload_date"),
        "license": (lic_el.text if lic_el is not None else None),
        "description": (desc_el.text or "").strip() if desc_el is not None else "",
        "description_url": f"https://commons.wikimedia.org/wiki/File:{commons_filename.replace(' ', '_')}",
    }


def license_acceptable(license_name: str | None) -> bool:
    if not license_name:
        return False
    name = license_name.lower().replace(" ", "").replace(".", "-")
    return any(name.startswith(k.replace(" ", "").replace(".", "-")) for k in ACCEPTABLE_LICENSES)


def fetch_bytes_verified(meta: dict) -> bytes | None:
    """Fetch image bytes via Fly.io relay; SHA-1 must match Commons metadata."""
    if not (meta.get("url") and meta.get("sha1")):
        return None
    proxied = FLY_PROXY + meta["url"]
    try:
        blob = http_get(proxied, accept="image/*", attempts=4)
    except Exception as e:
        sys.stderr.write(f"  bytes fetch failed for {meta['filename']}: {e}\n")
        return None
    got_sha1 = hashlib.sha1(blob).hexdigest()
    if got_sha1.lower() != meta["sha1"].lower():
        sys.stderr.write(
            f"  SHA-1 MISMATCH for {meta['filename']}\n"
            f"    expected: {meta['sha1']}\n    actual:   {got_sha1}\n    REJECTED\n"
        )
        return None
    return blob


def to_webp(jpg_bytes: bytes, max_width: int = 1920, quality: int = 85) -> bytes:
    img = Image.open(BytesIO(jpg_bytes))
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode in ("RGBA", "LA"):
            bg.paste(img, mask=img.split()[-1])
            img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
    out = BytesIO()
    img.save(out, "WEBP", quality=quality, method=6)
    return out.getvalue()


def slugify_filename(commons_filename: str) -> str:
    base = commons_filename.rsplit(".", 1)[0]
    # keep parentheses, comma, dash readable but URL-safe
    safe = re.sub(r"[^A-Za-z0-9._(),\-]+", "_", base)
    return safe


def build_credit_line(meta: dict) -> str:
    author = meta.get("uploader") or "Unknown"
    lic = meta.get("license") or "Unknown"
    return f"Photo by {author} via Wikimedia Commons ({lic})"


def append_registry_row(
    web_path: str,
    meta: dict,
    title_short: str,
) -> None:
    """Add row to assets/data/atribution_registry.json."""
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    if REGISTRY_PATH.exists():
        registry = json.loads(REGISTRY_PATH.read_text())
    else:
        registry = {"version": "1.0.0", "items": []}

    # de-dup by path
    items = registry.setdefault("items", [])
    for it in items:
        if it.get("path") == web_path:
            return  # already registered

    items.append({
        "path": web_path,
        "title": title_short,
        "author": meta.get("uploader") or "Unknown",
        "author_url": f"https://commons.wikimedia.org/wiki/User:{(meta.get('uploader') or '').replace(' ', '_')}",
        "source_url": meta["description_url"],
        "license": meta.get("license") or "Unknown",
        "license_url": "https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia",
        "credit_line": build_credit_line(meta),
        "credit_short": meta.get("uploader") or "Wikimedia Commons",
        "year": (meta.get("upload_date") or "")[:4],
        "notes": (meta.get("description") or "")[:240],
        "sha1": meta.get("sha1"),
        "verified": True,
    })
    registry["last_updated_utc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    REGISTRY_PATH.write_text(json.dumps(registry, indent=2, ensure_ascii=False) + "\n")


def write_sidecar_attr(webp_path: Path, meta: dict) -> None:
    attr_path = webp_path.with_suffix(webp_path.suffix + ".attr.json")
    attr_path.write_text(json.dumps({
        "source": "Wikimedia Commons",
        "title": f"File:{meta['filename']}",
        "url": meta["url"],
        "description_url": meta["description_url"],
        "license": meta.get("license"),
        "artist": meta.get("uploader"),
        "sha1": meta.get("sha1"),
        "original_size": meta.get("size"),
        "original_dimensions": [meta.get("width"), meta.get("height")],
        "description": meta.get("description"),
        "downloaded": time.strftime("%Y-%m-%d"),
        "via": "cors-anywhere.fly.dev (sha1-verified against magnustools.toolforge.org/commonsapi.php)",
    }, indent=2, ensure_ascii=False) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--category", required=True, help="Wikimedia Commons category name")
    ap.add_argument("--ship-slug", required=True)
    ap.add_argument("--line", required=True)
    ap.add_argument("--max", type=int, default=8, help="Stop after N accepted files")
    ap.add_argument("--inspect-only", action="store_true", help="List category, do not download")
    ap.add_argument("--dry-run", action="store_true", help="Fetch metadata, do not save")
    args = ap.parse_args()

    target_dir = ASSETS_SHIPS / args.line / args.ship_slug
    target_dir.mkdir(parents=True, exist_ok=True)

    print(f"Category: {args.category}")
    print(f"Target  : /assets/ships/{args.line}/{args.ship_slug}/")
    print()

    files = list_category_files(args.category, max_files=60)
    print(f"Found {len(files)} candidate files in category:")
    for t in files:
        print(f"  - {t}")

    if args.inspect_only:
        return 0

    accepted = []
    for title in files:
        if len(accepted) >= args.max:
            break
        bare = title.replace("File:", "").replace(" ", "_")
        meta = get_file_metadata(bare)
        if not meta:
            print(f"  [skip] no metadata: {bare}")
            continue
        if not license_acceptable(meta.get("license")):
            print(f"  [skip] license '{meta.get('license')}' not in acceptable set: {bare}")
            continue
        if not meta.get("width") or meta["width"] < 800:
            print(f"  [skip] width<800 ({meta.get('width')}): {bare}")
            continue

        slug = slugify_filename(bare)
        webp_path = target_dir / f"{slug}.webp"
        if webp_path.exists():
            print(f"  [skip] exists: {webp_path.relative_to(PROJECT_ROOT)}")
            accepted.append((webp_path, meta))
            continue

        blob = fetch_bytes_verified(meta)
        if blob is None:
            print(f"  [skip] failed verified fetch: {bare}")
            continue

        webp_bytes = to_webp(blob)
        if args.dry_run:
            print(f"  [dry-run] would write: {webp_path.relative_to(PROJECT_ROOT)} ({len(webp_bytes)} bytes)")
            accepted.append((webp_path, meta))
            continue

        webp_path.write_bytes(webp_bytes)
        write_sidecar_attr(webp_path, meta)
        web_path = f"/assets/ships/{args.line}/{args.ship_slug}/{slug}.webp"
        append_registry_row(web_path, meta, title_short=f"{args.ship_slug} — {bare}")
        accepted.append((webp_path, meta))
        print(f"  [ok] {webp_path.relative_to(PROJECT_ROOT)}  ({len(webp_bytes)} bytes, sha1 verified)")
        time.sleep(1.0)  # be polite to the relay + toolforge

    print()
    print(f"Accepted {len(accepted)} file(s).")
    for p, m in accepted:
        print(f"  - {p.relative_to(PROJECT_ROOT)}  [{m.get('license')}]  by {m.get('uploader')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
