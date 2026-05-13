#!/usr/bin/env python3
"""
Image-sourcing harness for In the Wake port pages.

Wraps the mechanical steps of the six-step workflow documented in
admin/IMAGE_SOURCING_WORKFLOW.md so a session can drive sourcing
end-to-end without retyping curl flags, attribution JSON shapes, or
file-rename logic.

What the harness does NOT do (intentional integrity boundary):
- It does not invent search hits. WebSearch / WebFetch are tools
  the calling agent owns; the harness only takes URLs the agent has
  already produced.
- It does not skip visual verification. The 'fetch' subcommand puts
  the bytes on disk; the agent must Read() the file and confirm the
  scene before calling 'convert'. Bypassing that step reintroduces
  the college-fjord/Flickr-889 failure class.

Subcommands:
  doctor                          preflight: network, Pillow, validator
  inventory <slug>                files on disk, HTML refs, gaps
  audit-attr <slug>               flag Flickr-889 / placeholder attr shapes
  verify-flickr <url>             fetch photo page, extract CC license
  verify-loc <item-id>            JSON API: rights + downloadable file URLs
  fetch <url> <local-path>        --http1.1 --fail download with integrity check
  convert <src> <dst-webp>        Pillow -> WebP (quality 85, max 1600px)
  write-attr <webp-path> <kv...>  canonical attr.json with required fields
  rewrite-html <slug>             update <img> srcs to match files on disk
  validate <slug>                 run validate-port-page-v2.js, parse images
  plan <slug>                     end-to-end work plan for one port

Soli Deo Gloria.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import shlex
import subprocess
import sys
import urllib.parse
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path("/home/user/InTheWake")
PORTS_HTML = ROOT / "ports"
PORTS_IMG = ROOT / "ports" / "img"
ATTR_CSV = ROOT / "attributions" / "attributions.csv"
VALIDATOR = ROOT / "admin" / "validate-port-page-v2.js"
ALLOWLIST = ROOT / "admin" / "cross-port-image-allowlist.json"
HASH_CACHE = ROOT / "admin" / ".port-image-hashes.json"

USER_AGENT = "InTheWakePortPageRepair/1.0 (admin@cruisinginthewake.com)"
HTTP_TIMEOUT = 30

ACCEPTABLE_LICENSES = {
    "cc by 1.0", "cc by 2.0", "cc by 2.5", "cc by 3.0", "cc by 4.0",
    "cc by-sa 1.0", "cc by-sa 2.0", "cc by-sa 2.5", "cc by-sa 3.0", "cc by-sa 4.0",
    "cc0", "cc0 1.0",
    "public domain", "public domain mark", "no known restrictions",
    "u.s. government work",
}

UNACCEPTABLE_LICENSE_HINTS = (
    "all rights reserved",
    "by-nc", "by-nd", "by-nc-nd", "by-nc-sa",
    "noncommercial", "no derivatives",
)


# ---------- helpers ----------

def _run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=HTTP_TIMEOUT * 2, **kwargs)


def _curl(url: str, *, head_only: bool = False, output: Path | None = None,
          extra: list[str] | None = None) -> tuple[int, bytes, str]:
    cmd = [
        "curl", "-sSL", "--http1.1", "--max-time", str(HTTP_TIMEOUT),
        "-A", USER_AGENT,
    ]
    if head_only:
        cmd.append("-I")
    if output is not None:
        cmd += ["--fail", "-o", str(output), "-w", "%{http_code}\\n"]
    else:
        cmd += ["-w", "\\n%{http_code}\\n"]
    if extra:
        cmd += extra
    cmd.append(url)
    proc = subprocess.run(cmd, capture_output=True, timeout=HTTP_TIMEOUT * 2)
    body = proc.stdout
    if output is not None:
        # When -o is used, stdout is just the http_code from -w.
        try:
            code = int(body.decode("utf-8", "replace").strip().splitlines()[-1])
        except Exception:
            code = -1
        return code, b"", proc.stderr.decode("utf-8", "replace")
    # When body comes back, the last line is the http_code from -w.
    text = body.decode("utf-8", "replace")
    parts = text.rsplit("\n", 2)
    if len(parts) >= 2 and parts[-2].strip().isdigit():
        code = int(parts[-2].strip())
        body_str = parts[0]
    else:
        code = -1
        body_str = text
    return code, body_str.encode("utf-8"), proc.stderr.decode("utf-8", "replace")


def _slug_paths(slug: str) -> tuple[Path, Path]:
    return PORTS_HTML / f"{slug}.html", PORTS_IMG / slug


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _today() -> str:
    return _dt.date.today().isoformat()


def _attr_path_for(image_path: Path) -> Path:
    """ATTR-001 accepts <name>-attr.json or <name>.webp.attr.json.
    Canonical going forward: <stem>.webp.attr.json.
    """
    if image_path.suffix.lower() == ".webp":
        return image_path.with_suffix(".webp.attr.json")
    return image_path.with_name(image_path.name + ".attr.json")


def _is_placeholder_attr(attr: dict[str, Any]) -> str | None:
    """Detect the Flickr-889 / college-fjord-class shapes that ATTR-003 catches."""
    license_str = str(attr.get("license", "")).strip().lower()
    source_type = str(attr.get("source_type", "")).strip().lower()
    if license_str == "flickr (verify license)":
        return "license=='Flickr (verify license)' (Flickr-889 placeholder shape)"
    if "verify license" in license_str:
        return f"license still says 'verify': {license_str}"
    if source_type == "flickr public feed":
        return "source_type=='Flickr public feed' (placeholder shape)"
    if not attr.get("license") and not attr.get("license_url"):
        return "no license/license_url"
    if not (attr.get("source") or attr.get("sourceUrl") or attr.get("source_url") or attr.get("url")):
        return "no source URL of any kind"
    return None


# ---------- subcommands ----------

def cmd_doctor(args) -> int:
    print("=== preflight check ===")
    ok = True

    # Pillow
    try:
        from PIL import Image, features, __version__ as _v
        print(f"  Pillow: {_v} (webp={features.check('webp')})")
    except Exception as e:
        print(f"  Pillow: MISSING ({e}) — run: pip3 install --quiet Pillow")
        ok = False

    # Validator
    if VALIDATOR.exists():
        print(f"  validator: {VALIDATOR.relative_to(ROOT)}")
    else:
        print(f"  validator: MISSING at {VALIDATOR}")
        ok = False

    # Network egress (matches IMAGE_SOURCING_WORKFLOW.md sandbox table)
    expected_reachable = [
        "https://www.loc.gov/",
        "https://www.flickr.com/photos/",
        "https://images.unsplash.com/",
        "https://images.pexels.com/",
        "https://www.nps.gov/",
    ]
    expected_blocked = [
        "https://commons.wikimedia.org/",
        "https://upload.wikimedia.org/",
    ]
    print("  network:")
    for url in expected_reachable:
        code, _, _ = _curl(url, head_only=True)
        sym = "OK" if 200 <= code < 400 else "FAIL"
        if sym == "FAIL":
            ok = False
        print(f"    {sym:4s} {url}  {code}")
    for url in expected_blocked:
        code, _, _ = _curl(url, head_only=True)
        if code in (200, 301, 302):
            print(f"    NEW  {url}  {code}  (was blocked; doc may be stale)")
        else:
            print(f"    BLK  {url}  {code}  (expected blocked)")

    # tile.loc.gov has known HTTP/2 truncation; we force --http1.1 site-wide
    print("  loc-cdn-http1.1: enforced")

    # Attribution CSV reachable
    if ATTR_CSV.exists():
        rows = sum(1 for _ in ATTR_CSV.open())
        print(f"  {ATTR_CSV.relative_to(ROOT)}: {rows} rows")
    else:
        print(f"  {ATTR_CSV.relative_to(ROOT)}: MISSING")
        ok = False

    # Cross-port allowlist
    if ALLOWLIST.exists():
        try:
            data = json.loads(_read_text(ALLOWLIST))
            print(f"  allowlist: {len(data.get('reviewed', []))} approved cross-port duplicates")
        except Exception as e:
            print(f"  allowlist: PARSE ERROR ({e})")
            ok = False
    else:
        print(f"  allowlist: MISSING")
        ok = False

    print(f"\n  result: {'OK' if ok else 'BLOCKERS — fix before sourcing'}")
    return 0 if ok else 1


def cmd_inventory(args) -> int:
    slug = args.slug
    html_path, img_dir = _slug_paths(slug)
    if not html_path.exists():
        print(f"ERROR: no HTML page at {html_path}", file=sys.stderr)
        return 1
    html = _read_text(html_path)

    # Image files on disk
    files = sorted([p for p in img_dir.glob("*") if p.suffix.lower() in (".webp", ".jpg", ".jpeg", ".png")]) if img_dir.exists() else []
    attrs = sorted([p for p in img_dir.glob("*-attr.json")]) + sorted([p for p in img_dir.glob("*.webp.attr.json")]) if img_dir.exists() else []
    attr_set = {p.name.replace(".webp.attr.json", ".webp").replace("-attr.json", ".webp"): p for p in attrs}

    # HTML <img> refs scoped to this port
    refs = re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', html, re.IGNORECASE)
    own = []
    chrome = []
    other = []
    for r in refs:
        clean = r.split("?", 1)[0].split("#", 1)[0]
        if clean.startswith(f"/ports/img/{slug}/") or clean.startswith(f"ports/img/{slug}/"):
            own.append(clean)
        elif clean.startswith("/ports/img/"):
            other.append(clean)
        else:
            chrome.append(clean)

    own_resolved, own_broken = [], []
    for r in own:
        local = ROOT / r.lstrip("/")
        (own_resolved if local.exists() else own_broken).append(r)

    out = {
        "slug": slug,
        "html": str(html_path.relative_to(ROOT)),
        "img_dir": str(img_dir.relative_to(ROOT)) if img_dir.exists() else None,
        "files_on_disk": [p.name for p in files],
        "attr_files_on_disk": [p.name for p in attrs],
        "files_without_attr": [p.name for p in files if p.name not in attr_set and p.stem != f"{slug}-hero"],
        "html_img_refs": {
            "own_resolved": own_resolved,
            "own_broken": own_broken,
            "cross_port": other,
            "chrome": chrome,
        },
        "counts": {
            "files_on_disk": len(files),
            "attr_files": len(attrs),
            "img_tags_total": len(refs),
            "own_resolved": len(own_resolved),
            "own_broken": len(own_broken),
        },
    }
    print(json.dumps(out, indent=2))
    return 0


def cmd_audit_attr(args) -> int:
    slug = args.slug
    img_dir = PORTS_IMG / slug
    if not img_dir.exists():
        print(f"ERROR: no image dir at {img_dir}", file=sys.stderr)
        return 1

    findings = []
    for attr_path in sorted(img_dir.glob("*attr.json")):
        try:
            attr = json.loads(_read_text(attr_path))
        except Exception as e:
            findings.append({"file": attr_path.name, "issue": f"unparseable JSON: {e}"})
            continue
        problem = _is_placeholder_attr(attr)
        if problem:
            findings.append({"file": attr_path.name, "issue": problem,
                             "license": attr.get("license"),
                             "source": attr.get("source") or attr.get("sourceUrl") or attr.get("url")})

    # ATTR-003 source-URL diversity check (in-gallery)
    sources = []
    for attr_path in sorted(img_dir.glob("*attr.json")):
        try:
            attr = json.loads(_read_text(attr_path))
            sources.append(str(attr.get("source") or attr.get("sourceUrl") or attr.get("source_url") or attr.get("url") or ""))
        except Exception:
            pass
    distinct = len({s for s in sources if s})
    diversity = {"total_attr": len(sources), "distinct_sources": distinct,
                 "fail_attr_003": (len(sources) >= 4 and distinct <= 2)}

    print(json.dumps({"slug": slug, "placeholder_findings": findings,
                       "diversity_check": diversity}, indent=2))
    return 0 if not findings and not diversity["fail_attr_003"] else 2


def cmd_verify_flickr(args) -> int:
    url = args.url
    code, body, _ = _curl(url)
    if code != 200:
        print(json.dumps({"url": url, "http": code, "verdict": "FAIL", "reason": "non-200"}))
        return 2
    text = body.decode("utf-8", "replace")
    cc_links = re.findall(r"https?://creativecommons\.org/(?:licenses|publicdomain)/[\w\.\-/]+", text)
    if cc_links:
        license_url = cc_links[0]
        m = re.search(r"creativecommons\.org/licenses/([\w\-]+)/([\d\.]+)/?", license_url)
        if m:
            license_label = f"CC {m.group(1).upper()} {m.group(2)}"
        elif "publicdomain" in license_url:
            license_label = "Public Domain (CC0)"
        else:
            license_label = "Creative Commons (verify)"
        # author from schema.org / og:image:owner / "by USER" text
        author = None
        for pat in (r'"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"',
                    r'photos/([\w\-_]+)/'):
            m = re.search(pat, text)
            if m:
                author = m.group(1)
                break
        verdict = "OK" if license_label.lower() in ACCEPTABLE_LICENSES or "public domain" in license_label.lower() else "REVIEW"
        print(json.dumps({"url": url, "http": code, "license": license_label,
                          "license_url": license_url, "author": author, "verdict": verdict}, indent=2))
        return 0 if verdict == "OK" else 2
    # No CC link → ARR
    print(json.dumps({"url": url, "http": code, "verdict": "FAIL",
                       "reason": "no creativecommons.org link found (likely All Rights Reserved)"}))
    return 2


def cmd_verify_loc(args) -> int:
    item_id = args.item_id.strip().strip("/")
    json_url = f"https://www.loc.gov/item/{item_id}/?fo=json"
    code, body, _ = _curl(json_url)
    if code != 200:
        print(json.dumps({"item_id": item_id, "http": code, "verdict": "FAIL"}))
        return 2
    try:
        data = json.loads(body)
    except Exception as e:
        print(json.dumps({"item_id": item_id, "verdict": "FAIL", "reason": f"json parse: {e}"}))
        return 2
    item = data.get("item", {})
    rights = item.get("rights_information") or item.get("rights_advisory") or ""
    title = item.get("title", "")
    creators = item.get("contributor_names") or item.get("creator", "")
    files = []
    for r in data.get("resources", [])[:1]:
        for fg in r.get("files", []):
            for f in fg:
                if "jpeg" in str(f.get("mimetype", "")):
                    files.append({"url": f.get("url"), "size": f.get("size"),
                                  "info": f.get("info", "")})
    rights_lower = rights.lower() if isinstance(rights, str) else ""
    pd_signals = ("public domain", "no known restrictions", "no copyright")
    verdict = "OK" if any(s in rights_lower for s in pd_signals) else "REVIEW"
    print(json.dumps({"item_id": item_id, "title": title, "rights": rights,
                       "creators": creators, "files": files, "verdict": verdict,
                       "human_url": f"https://www.loc.gov/item/{item_id}/"}, indent=2))
    return 0 if verdict == "OK" else 2


def cmd_fetch(args) -> int:
    url = args.url
    out = Path(args.local_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    code, _, stderr = _curl(url, output=out)
    if code != 200 or not out.exists():
        print(json.dumps({"url": url, "http": code, "verdict": "FAIL", "stderr": stderr}))
        return 2
    size = out.stat().st_size
    # Sanity: tile.loc.gov sometimes truncates JPEGs. Try a Pillow load.
    try:
        from PIL import Image
        img = Image.open(out)
        img.load()
        ok = True
        info = {"size": size, "image_size": img.size, "mode": img.mode}
    except Exception as e:
        ok = False
        info = {"size": size, "load_error": str(e)}
    print(json.dumps({"url": url, "local": str(out), "http": code,
                       "verdict": "OK" if ok else "TRUNCATED — re-fetch",
                       **info}, indent=2))
    return 0 if ok else 3


def cmd_convert(args) -> int:
    src = Path(args.src)
    dst = Path(args.dst)
    if not src.exists():
        print(f"ERROR: source missing: {src}", file=sys.stderr)
        return 1
    dst.parent.mkdir(parents=True, exist_ok=True)
    from PIL import Image
    img = Image.open(src)
    img.load()
    if args.crop:
        l, t, r, b = (float(x) for x in args.crop.split(","))
        w, h = img.size
        img = img.crop((int(w * l), int(h * t), int(w * r), int(h * b)))
    if img.width > args.max_width:
        ratio = args.max_width / img.width
        img = img.resize((args.max_width, int(img.height * ratio)), Image.LANCZOS)
    img.save(dst, "WEBP", quality=args.quality, method=6)
    print(json.dumps({"src": str(src), "dst": str(dst),
                       "size": dst.stat().st_size,
                       "image_size": img.size}, indent=2))
    return 0


def cmd_write_attr(args) -> int:
    image_path = Path(args.image)
    if not image_path.exists():
        print(f"ERROR: image missing: {image_path}", file=sys.stderr)
        return 1
    fields: dict[str, Any] = {}
    for kv in args.fields or []:
        if "=" not in kv:
            print(f"ERROR: field must be key=value: {kv}", file=sys.stderr)
            return 1
        k, v = kv.split("=", 1)
        fields[k.strip()] = v.strip()

    # verifiedBy/verifiedDate auto-fill BEFORE the missing check so they don't
    # appear in the error message.
    fields.setdefault("verifiedDate", _today())
    fields.setdefault("verifiedBy", f"sourcing.py session {_today()}")

    required = {"sourceUrl", "license", "licenseUrl", "photographer", "title",
                "description", "alt"}
    missing = required - set(fields.keys())
    if missing and not args.allow_partial:
        print(f"ERROR: required fields missing: {sorted(missing)}\n"
              f"Pass --allow-partial only when you can document the gap.",
              file=sys.stderr)
        return 1

    # Defensive license check
    license_str = str(fields.get("license", "")).lower()
    if any(h in license_str for h in UNACCEPTABLE_LICENSE_HINTS):
        print(f"ERROR: license '{fields['license']}' is not acceptable for this site.", file=sys.stderr)
        return 1
    if "verify license" in license_str:
        print(f"ERROR: license '{fields['license']}' is the Flickr-889 placeholder shape.", file=sys.stderr)
        return 1

    out = _attr_path_for(image_path)
    out.write_text(json.dumps(fields, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    # Auto-fire registration into admin/sourced-images-registry.json.
    # Per Rule E of admin/SOURCING_HARDENING_PLAN_2026-05-12.md: every image
    # whose attr.json is written must also get a byte-level registry entry.
    # The slug is inferred from the image path (ports/img/<slug>/...).
    # Pass --no-register only when you have a documented reason.
    registry_result = None
    if not args.no_register:
        try:
            slug_from_path = None
            parts = image_path.resolve().parts
            if "ports" in parts and "img" in parts:
                i = parts.index("img")
                if i + 1 < len(parts):
                    slug_from_path = parts[i + 1]
            if not slug_from_path:
                print(f"WARNING: could not infer slug from path {image_path}; registry entry skipped. Pass --slug-override=<slug> next time or call register manually.", file=sys.stderr)
            else:
                registry_result = _register_image(
                    file_path=image_path,
                    slug=slug_from_path,
                    source_url=fields.get("sourceUrl", ""),
                    photographer=fields.get("photographer", ""),
                    license_str=fields.get("license", ""),
                    license_url=fields.get("licenseUrl", ""),
                    verdict="write-attr auto-register",
                    session=os.environ.get("SOURCING_SESSION", ""),
                )
                if registry_result.get("verdict") == "REFUSE":
                    print(json.dumps({
                        "attr_written": str(out),
                        "registry_verdict": "REFUSE",
                        "reason": registry_result.get("reason"),
                        "existing_entries": registry_result.get("existing_entries"),
                    }, indent=2), file=sys.stderr)
                    return 2
        except Exception as e:
            print(f"WARNING: auto-register failed: {e}", file=sys.stderr)

    print(json.dumps({"image": str(image_path), "attr": str(out),
                       "fields": list(fields.keys()),
                       "registry": registry_result.get("verdict") if registry_result else "skipped"}, indent=2))
    return 0


def _register_image(file_path, slug, source_url, photographer, license_str,
                     license_url, verdict, session):
    """Shared registration helper used by both cmd_register and cmd_write_attr.
    Refuses if md5 already exists for a different slug and isn't allowlisted.
    Returns dict with verdict + details.
    """
    import hashlib
    f = Path(file_path).resolve()
    md5 = hashlib.md5(f.read_bytes()).hexdigest()

    if REGISTRY_PATH.exists():
        registry = json.loads(REGISTRY_PATH.read_text())
    else:
        registry = {"_format": "1.0", "_purpose": "Byte-level record of every image sourced via admin/sourcing.py.", "entries": []}

    allowlist_hashes = set()
    if ALLOWLIST.exists():
        try:
            data = json.loads(ALLOWLIST.read_text())
            for entry in data.get("reviewed", []):
                allowlist_hashes.add(entry.get("hash"))
        except Exception:
            pass

    try:
        rel_file_check = str(f.relative_to(ROOT))
    except ValueError:
        rel_file_check = str(f)
    # Skip if already registered for same slug + same file (idempotent re-write)
    for e in registry["entries"]:
        if e.get("md5") == md5 and e.get("slug") == slug and e.get("file") == rel_file_check:
            return {"verdict": "ALREADY_REGISTERED", "entry": e}

    existing_other_slug = [e for e in registry["entries"]
                          if e.get("md5") == md5 and e.get("slug") != slug]
    if existing_other_slug and md5 not in allowlist_hashes:
        return {
            "verdict": "REFUSE",
            "reason": "md5 already registered for another slug and not allowlisted",
            "existing_entries": existing_other_slug,
            "md5": md5,
        }

    try:
        rel_file = str(f.relative_to(ROOT))
    except ValueError:
        rel_file = str(f)
    entry = {
        "slug": slug,
        "file": rel_file,
        "md5": md5,
        "size_bytes": f.stat().st_size,
        "source_url": source_url,
        "photographer": photographer or "",
        "license": license_str or "",
        "license_url": license_url or "",
        "verify_verdict": verdict or "",
        "registered_at": _dt.datetime.utcnow().isoformat() + "Z",
        "session": session or "",
    }
    registry["entries"].append(entry)
    REGISTRY_PATH.write_text(json.dumps(registry, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return {"verdict": "REGISTERED", "entry": entry}


def cmd_rewrite_html(args) -> int:
    """Repoint <img src> on a port HTML to the actual files on disk.
    Conservative: only rewrites refs whose stem matches an existing on-disk file.
    Reports unmatched refs without modifying them.
    """
    slug = args.slug
    html_path, img_dir = _slug_paths(slug)
    if not html_path.exists():
        print(f"ERROR: no HTML at {html_path}", file=sys.stderr)
        return 1
    html = _read_text(html_path)
    files_on_disk = {p.name for p in img_dir.glob("*") if p.suffix.lower() in (".webp", ".jpg", ".png")} if img_dir.exists() else set()

    # Build a stem-keyed lookup so 'pde-hero.webp' -> 'punta-del-este-hero.webp' if a clear match exists
    by_stem = {p.split(".")[0]: p for p in files_on_disk}
    by_token = {}
    for p in files_on_disk:
        for token in p.replace(".webp", "").split("-"):
            by_token.setdefault(token, set()).add(p)

    fixes: list[dict[str, str]] = []
    unmatched: list[str] = []

    def _replace(match: re.Match) -> str:
        full = match.group(0)
        src = match.group(1)
        clean = src.split("?", 1)[0].split("#", 1)[0]
        if not clean.startswith(f"/ports/img/{slug}/"):
            return full
        local = ROOT / clean.lstrip("/")
        if local.exists():
            return full
        wanted = local.name
        # Already-good-stem fallback: drop dir prefix variants
        if wanted in files_on_disk:
            return full
        # Try common renames: pde- -> <slug>-, .jpg -> .webp
        candidates = []
        if wanted.endswith(".jpg") or wanted.endswith(".jpeg"):
            stem = wanted.rsplit(".", 1)[0]
            cand = stem + ".webp"
            if cand in files_on_disk:
                candidates.append(cand)
        # Token overlap heuristic
        wanted_tokens = set(wanted.replace(".webp", "").split("-"))
        wanted_tokens.discard(slug)
        if wanted_tokens:
            for cand in files_on_disk:
                cand_tokens = set(cand.replace(".webp", "").split("-"))
                cand_tokens.discard(slug)
                if wanted_tokens & cand_tokens:
                    candidates.append(cand)
        if len(set(candidates)) == 1:
            chosen = candidates[0]
            fixes.append({"old": clean, "new": f"/ports/img/{slug}/{chosen}"})
            return full.replace(src, f"/ports/img/{slug}/{chosen}")
        unmatched.append(clean)
        return full

    new_html = re.sub(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', _replace, html, flags=re.IGNORECASE)
    if args.dry_run:
        print(json.dumps({"slug": slug, "fixes": fixes, "unmatched": sorted(set(unmatched)),
                          "would_write": new_html != html}, indent=2))
        return 0
    if new_html != html:
        html_path.write_text(new_html, encoding="utf-8")
    print(json.dumps({"slug": slug, "fixes": fixes, "unmatched": sorted(set(unmatched)),
                       "wrote": new_html != html}, indent=2))
    return 0


def cmd_validate(args) -> int:
    slug = args.slug
    html_path, _ = _slug_paths(slug)
    if not html_path.exists():
        print(f"ERROR: no HTML at {html_path}", file=sys.stderr)
        return 1
    proc = subprocess.run(
        ["node", str(VALIDATOR), f"ports/{slug}.html", "--json-output", "--quiet"],
        cwd=str(ROOT), capture_output=True, text=True, timeout=120,
    )
    try:
        data = json.loads(proc.stdout)
    except Exception:
        print("ERROR: validator did not return JSON", file=sys.stderr)
        print(proc.stdout[-2000:])
        return 2
    if not isinstance(data, dict):
        print("ERROR: validator JSON not an object", file=sys.stderr)
        return 2
    image_blockers = [b for b in data.get("blocking_errors", [])
                      if b.get("section") == "images"
                         or "image" in str(b.get("rule", "")).lower()
                         or b.get("rule") == "missing_image_file"]
    image_warnings = [w for w in data.get("warnings", [])
                      if w.get("section") == "images"]
    summary = {
        "slug": slug,
        "valid": data.get("valid"),
        "score": data.get("score"),
        "image_blockers": image_blockers,
        "image_warnings_count": len(image_warnings),
        "all_blockers_count": len(data.get("blocking_errors", [])),
    }
    print(json.dumps(summary, indent=2))
    return 0 if not image_blockers else 2


def cmd_plan(args) -> int:
    """End-to-end work plan for one port slug, derived from current state."""
    slug = args.slug
    html_path, img_dir = _slug_paths(slug)
    if not html_path.exists():
        print(f"ERROR: no HTML at {html_path}", file=sys.stderr)
        return 1
    inv_args = argparse.Namespace(slug=slug)
    saved_stdout = sys.stdout
    try:
        sys.stdout = open(os.devnull, "w")
        # Reuse inventory logic by capturing
        files_on_disk = sorted([p.name for p in img_dir.glob("*") if p.suffix.lower() in (".webp", ".jpg", ".png")]) if img_dir.exists() else []
        html = _read_text(html_path)
        refs = re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', html, re.IGNORECASE)
        own = [r.split("?", 1)[0].split("#", 1)[0] for r in refs
               if r.split("?", 1)[0].startswith(f"/ports/img/{slug}/")]
        own_resolved = [r for r in own if (ROOT / r.lstrip("/")).exists()]
        own_broken = [r for r in own if not (ROOT / r.lstrip("/")).exists()]
    finally:
        sys.stdout.close()
        sys.stdout = saved_stdout

    actions = []
    if own_broken:
        actions.append({
            "step": "rewrite-html",
            "rationale": f"{len(own_broken)} broken own-port refs; try heuristic rename first",
            "command": f"python3 admin/sourcing.py rewrite-html {slug} --dry-run",
        })
    files_without_attr = []
    if img_dir.exists():
        attrs = {p.name for p in img_dir.glob("*attr.json")}
        for f in files_on_disk:
            if f"{f}.attr.json" not in attrs and f"{f.rsplit('.', 1)[0]}-attr.json" not in attrs and not f.endswith("-hero.webp"):
                files_without_attr.append(f)
    if files_without_attr:
        actions.append({
            "step": "audit-attr",
            "rationale": f"{len(files_without_attr)} files lack attr.json",
            "command": f"python3 admin/sourcing.py audit-attr {slug}",
        })
    actions.append({
        "step": "validate",
        "rationale": "confirm image blockers cleared",
        "command": f"python3 admin/sourcing.py validate {slug}",
    })

    print(json.dumps({"slug": slug, "files_on_disk": len(files_on_disk),
                       "own_resolved": len(own_resolved),
                       "own_broken": len(own_broken),
                       "files_without_attr": files_without_attr,
                       "next_actions": actions}, indent=2))
    return 0


# ---------- audit-port-images ----------

def cmd_audit_port_images(args) -> int:
    """Per-port image audit — generates a checklist for Read-verification
    of every image file in the directory. Writes a per-port audit-trail
    markdown into admin/audit-reports/port-image-audits/.

    Use when a wrong-subject or placeholder image is found in a port dir.
    A diversity check (audit-attr) doesn't measure subject correctness;
    only Read-verifying every file does.
    """
    slug = args.slug
    img_dir = PORTS_IMG / slug
    if not img_dir.exists():
        print(f"ERROR: no image dir at {img_dir}", file=sys.stderr)
        return 1
    files = sorted([p for p in img_dir.glob("*") if p.suffix.lower() in (".webp", ".jpg", ".jpeg", ".png")])
    if not files:
        print(json.dumps({"slug": slug, "files": [], "message": "empty dir"}, indent=2))
        return 0
    import hashlib
    audit_dir = ROOT / "admin" / "audit-reports" / "port-image-audits"
    audit_dir.mkdir(parents=True, exist_ok=True)
    out_path = audit_dir / f"{slug}-{_today()}.md"
    if out_path.exists() and not args.overwrite:
        print(f"audit file already exists at {out_path} (pass --overwrite to replace)")
    rows = []
    for f in files:
        h = hashlib.md5(f.read_bytes()).hexdigest()
        attr = _attr_path_for(f)
        attr_data = {}
        if attr.exists():
            try:
                attr_data = json.loads(attr.read_text())
            except Exception:
                pass
        rows.append({
            "file": f.name,
            "size_bytes": f.stat().st_size,
            "md5": h,
            "attr_title": attr_data.get("title", "") or attr_data.get("description", ""),
            "attr_source": attr_data.get("sourceUrl") or attr_data.get("source") or attr_data.get("url") or "",
            "attr_license": attr_data.get("license", ""),
        })
    # Write the audit-trail md
    lines = [f"# Port image audit — {slug}", f"**Date:** {_today()}",
             f"**Files:** {len(files)}", "",
             "Read every file with the Read tool. Record the verdict in the table.",
             "Verdicts: `correct` · `wrong-subject` · `placeholder` · `unclear` · `pending`",
             "",
             "| # | File | Size | MD5 | Attr title | Attr source | Verdict | Visible identifier / notes |",
             "|---:|---|---:|---|---|---|---|---|"]
    for i, r in enumerate(rows, 1):
        title = (r["attr_title"] or "")[:60].replace("|", "&#124;")
        src = r["attr_source"][:60] if r["attr_source"] else ""
        lines.append(f"| {i} | `{r['file']}` | {r['size_bytes']} | `{r['md5'][:8]}…` | {title} | {src} | pending | |")
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    # Also print so the caller can immediately start Reading
    print(json.dumps({
        "slug": slug,
        "files_count": len(files),
        "audit_file": str(out_path.relative_to(ROOT)),
        "files_to_read": [str((img_dir / r["file"]).relative_to(ROOT)) for r in rows],
    }, indent=2))
    return 0


# ---------- reuse-check ----------

def cmd_reuse_check(args) -> int:
    """Byte-level reuse check for one port's images. Reports md5 collisions
    within the port, against the cross-port allowlist, and (if check-image-reuse.cjs
    exists) against the whole site.
    """
    slug = args.slug
    img_dir = PORTS_IMG / slug
    if not img_dir.exists():
        print(f"ERROR: no image dir at {img_dir}", file=sys.stderr)
        return 1
    import hashlib
    files = sorted([p for p in img_dir.glob("*.webp")])
    md5s = {}
    for f in files:
        h = hashlib.md5(f.read_bytes()).hexdigest()
        md5s.setdefault(h, []).append(f.name)
    intra_dupes = {h: v for h, v in md5s.items() if len(v) > 1}

    # Cross-port allowlist
    allowlist_hashes = set()
    if ALLOWLIST.exists():
        try:
            data = json.loads(ALLOWLIST.read_text())
            for entry in data.get("reviewed", []):
                allowlist_hashes.add(entry.get("hash"))
        except Exception:
            pass

    # Whole-site scan for cross-port duplicates
    cross_port_dupes = []
    site_hashes = {}
    for other_dir in PORTS_IMG.glob("*"):
        if not other_dir.is_dir() or other_dir.name == slug:
            continue
        for f in other_dir.glob("*.webp"):
            try:
                h = hashlib.md5(f.read_bytes()).hexdigest()
                site_hashes.setdefault(h, []).append(str(f.relative_to(ROOT)))
            except Exception:
                pass
    for h, names in md5s.items():
        if h in site_hashes:
            cross_port_dupes.append({
                "md5": h,
                "this_port": names,
                "other_ports": site_hashes[h],
                "allowlisted": h in allowlist_hashes,
            })

    print(json.dumps({
        "slug": slug,
        "files_count": len(files),
        "intra_port_duplicates": intra_dupes,
        "cross_port_duplicates": cross_port_dupes,
        "allowlist_entries": len(allowlist_hashes),
    }, indent=2))
    return 0 if not intra_dupes and not any(
        not d["allowlisted"] for d in cross_port_dupes
    ) else 2


# ---------- register ----------

REGISTRY_PATH = ROOT / "admin" / "sourced-images-registry.json"


def cmd_register(args) -> int:
    """Register a sourced image in the byte-level registry.

    Manual entry point. write-attr auto-fires this as of 2026-05-13;
    use this command for backfill registrations or for re-registering
    after a file is replaced.
    """
    f = Path(args.file)
    if not f.exists():
        print(f"ERROR: file missing: {f}", file=sys.stderr)
        return 1
    result = _register_image(
        file_path=f,
        slug=args.slug,
        source_url=args.source,
        photographer=args.photographer or "",
        license_str=args.license or "",
        license_url=args.license_url or "",
        verdict=args.verdict or "",
        session=args.session or "",
    )
    print(json.dumps(result, indent=2))
    return 0 if result.get("verdict") in ("REGISTERED", "ALREADY_REGISTERED") else 2


# ---------- argparse plumbing ----------

def main() -> int:
    p = argparse.ArgumentParser(description="Image-sourcing harness for In the Wake port pages")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("doctor", help="preflight: network, Pillow, validator")

    s = sub.add_parser("inventory", help="files on disk, HTML refs, gaps")
    s.add_argument("slug")

    s = sub.add_parser("audit-attr", help="flag Flickr-889 / placeholder attr shapes")
    s.add_argument("slug")

    s = sub.add_parser("verify-flickr", help="fetch photo page, extract CC license")
    s.add_argument("url")

    s = sub.add_parser("verify-loc", help="JSON API: rights + downloadable file URLs")
    s.add_argument("item_id", help="LoC item id, e.g. 2024686372")

    s = sub.add_parser("fetch", help="--http1.1 --fail download with integrity check")
    s.add_argument("url")
    s.add_argument("local_path")

    s = sub.add_parser("convert", help="Pillow -> WebP (quality 85, max 1600px)")
    s.add_argument("src")
    s.add_argument("dst")
    s.add_argument("--max-width", type=int, default=1600)
    s.add_argument("--quality", type=int, default=85)
    s.add_argument("--crop", help="crop fractions 'l,t,r,b' (e.g. 0.05,0.10,0.95,0.92)")

    s = sub.add_parser("write-attr", help="canonical attribution JSON (auto-fires registry write)")
    s.add_argument("image", help="path to webp file (sibling .webp.attr.json is written)")
    s.add_argument("fields", nargs="*", help="key=value pairs (sourceUrl=, license=, ...)")
    s.add_argument("--allow-partial", action="store_true",
                   help="allow missing required fields (document the gap in caller's notes)")
    s.add_argument("--no-register", action="store_true",
                   help="skip auto-registration into the byte-level registry (only for documented exceptions)")

    s = sub.add_parser("rewrite-html", help="update <img> srcs to match files on disk")
    s.add_argument("slug")
    s.add_argument("--dry-run", action="store_true")

    s = sub.add_parser("validate", help="run validate-port-page-v2.js, parse images")
    s.add_argument("slug")

    s = sub.add_parser("plan", help="end-to-end work plan for one port")
    s.add_argument("slug")

    s = sub.add_parser("audit-port-images", help="per-file Read-verification checklist for a port dir")
    s.add_argument("slug")
    s.add_argument("--overwrite", action="store_true", help="overwrite existing audit file")

    s = sub.add_parser("reuse-check", help="byte-level reuse check (intra-port + cross-port + allowlist)")
    s.add_argument("slug")

    s = sub.add_parser("register", help="register a sourced image in the byte-level registry")
    s.add_argument("file", help="path to the on-disk image (webp/jpg/png)")
    s.add_argument("--slug", required=True, help="port slug this image belongs to")
    s.add_argument("--source", required=True, help="source URL the image was fetched from")
    s.add_argument("--photographer", help="photographer name")
    s.add_argument("--license", help="license label, e.g. 'CC BY 2.0'")
    s.add_argument("--license-url", help="license URL")
    s.add_argument("--verdict", help="verify-flickr/verify-loc verdict at sourcing time")
    s.add_argument("--session", help="session id or label")

    args = p.parse_args()
    handler = {
        "doctor": cmd_doctor,
        "inventory": cmd_inventory,
        "audit-attr": cmd_audit_attr,
        "verify-flickr": cmd_verify_flickr,
        "verify-loc": cmd_verify_loc,
        "fetch": cmd_fetch,
        "convert": cmd_convert,
        "write-attr": cmd_write_attr,
        "rewrite-html": cmd_rewrite_html,
        "validate": cmd_validate,
        "plan": cmd_plan,
        "audit-port-images": cmd_audit_port_images,
        "reuse-check": cmd_reuse_check,
        "register": cmd_register,
    }[args.cmd]
    return handler(args)


if __name__ == "__main__":
    sys.exit(main())
