#!/usr/bin/env python3
"""
Venue Photo Processor — Smart Defaults + Per-Photo Overrides
Soli Deo Gloria

Processes rough venue photos into production-ready images for
cruisinginthewake.com venue pages and explore cards.

Pipeline:
  1. Auto-straighten (dominant line detection)
  2. Perspective correction (keystone fix)
  3. Auto-levels (histogram stretch)
  4. White balance (gray-world algorithm)
  5. Noise reduction (bilateral filter)
  6. Subject-aware smart crop (16:9 for cards, 3:2 for pages)
  7. Resize to output sizes (720w card, 1200w page)
  8. Gentle sharpening (unsharp mask)
  9. Export to WebP

Usage:
  python3 admin/process-venue-photos.py                      # Process all in originals/
  python3 admin/process-venue-photos.py --photo wonderland   # Process single photo
  python3 admin/process-venue-photos.py --preview            # Side-by-side preview mode
  python3 admin/process-venue-photos.py --list               # List available originals

Config:
  Per-photo overrides in assets/images/restaurants/venue-photo-config.json
"""

import os
import sys
import json
import math
import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

# ─── Paths ────────────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ORIGINALS_DIR = PROJECT_ROOT / "assets" / "images" / "restaurants" / "originals"
OUTPUT_DIR = PROJECT_ROOT / "assets" / "images" / "restaurants" / "photos" / "venues"
PREVIEW_DIR = PROJECT_ROOT / "assets" / "images" / "restaurants" / "previews"
CONFIG_FILE = PROJECT_ROOT / "assets" / "images" / "restaurants" / "venue-photo-config.json"

# ─── Output specs ─────────────────────────────────────────────────────────────

OUTPUT_SIZES = {
    "720w": {"width": 720, "height": 405},    # 16:9 — card thumbnails
    "1200w": {"width": 1200, "height": 675},   # 16:9 — venue page section image
}

WEBP_QUALITY = 82
TARGET_ASPECT = 16 / 9

# ─── Default processing parameters ───────────────────────────────────────────

DEFAULTS = {
    "straighten": True,           # Auto-straighten via line detection
    "perspective": True,          # Auto perspective/keystone correction
    "auto_levels": True,          # Histogram stretch
    "white_balance": True,        # Gray-world white balance
    "noise_reduction": True,      # Bilateral filter
    "sharpen": True,              # Unsharp mask after resize
    "smart_crop": True,           # Subject-aware crop to 16:9
    "brightness": 1.0,            # Brightness multiplier (1.0 = no change)
    "contrast": 1.0,              # Contrast multiplier
    "saturation": 1.0,            # Saturation multiplier
    "warmth": 0.0,                # Warmth shift (-1.0 cool to 1.0 warm)
    "crop_bias": "center",        # center, left, right, top, bottom
    "straighten_override": None,  # Manual rotation in degrees (overrides auto)
    "crop_override": None,        # Manual crop [x, y, w, h] as percentages 0-100
}


# ─── Configuration ────────────────────────────────────────────────────────────

def load_config():
    """Load per-photo override config, merging with defaults."""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"  ⚠️  Config error: {e} — using defaults")
    return {}


def get_photo_config(slug, config):
    """Get merged config for a specific photo (defaults + overrides)."""
    merged = dict(DEFAULTS)
    if slug in config:
        for key, value in config[slug].items():
            if key in merged:
                merged[key] = value
            else:
                print(f"  ⚠️  Unknown config key '{key}' for {slug}, ignoring")
    return merged


# ─── Image Discovery ─────────────────────────────────────────────────────────

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".tiff", ".tif"}


def discover_originals():
    """Find all original photos and map them to venue slugs."""
    photos = {}
    if not ORIGINALS_DIR.exists():
        return photos

    for file in sorted(ORIGINALS_DIR.iterdir()):
        if file.suffix.lower() in SUPPORTED_EXTENSIONS and not file.name.startswith("."):
            slug = file.stem.lower().replace(" ", "-").replace("_", "-")
            photos[slug] = file

    return photos


# ─── OpenCV Processing Pipeline ──────────────────────────────────────────────

def cv2_to_pil(cv2_img):
    """Convert OpenCV BGR image to PIL RGB Image."""
    rgb = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def pil_to_cv2(pil_img):
    """Convert PIL RGB Image to OpenCV BGR image."""
    rgb = np.array(pil_img.convert("RGB"))
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def auto_straighten(img, cfg):
    """Detect dominant lines and straighten the image.

    Uses Canny edge detection + Hough line transform to find
    the dominant angle, then rotates to correct it.
    """
    if cfg.get("straighten_override") is not None:
        angle = cfg["straighten_override"]
        print(f"    Straighten: manual override {angle:.1f}°")
    else:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)

        # Detect lines
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180,
                                threshold=100, minLineLength=80, maxLineGap=10)

        if lines is None or len(lines) == 0:
            print("    Straighten: no dominant lines found, skipping")
            return img

        # Calculate angles of detected lines
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
            # Normalize to -45..45 range (we care about near-horizontal/vertical)
            while angle > 45:
                angle -= 90
            while angle < -45:
                angle += 90
            angles.append(angle)

        if not angles:
            return img

        # Use median angle (robust to outliers)
        median_angle = float(np.median(angles))

        # Only correct if the tilt is noticeable but not extreme
        if abs(median_angle) < 0.3:
            print(f"    Straighten: {median_angle:.2f}° (negligible, skipping)")
            return img
        if abs(median_angle) > 15:
            print(f"    Straighten: {median_angle:.1f}° (too extreme, skipping)")
            return img

        angle = -median_angle
        print(f"    Straighten: correcting {median_angle:.2f}° → rotating {angle:.2f}°")

    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)

    # Calculate new bounding box to avoid clipping
    cos = abs(M[0, 0])
    sin = abs(M[0, 1])
    new_w = int(h * sin + w * cos)
    new_h = int(h * cos + w * sin)
    M[0, 2] += (new_w - w) / 2
    M[1, 2] += (new_h - h) / 2

    rotated = cv2.warpAffine(img, M, (new_w, new_h),
                              borderMode=cv2.BORDER_REPLICATE)
    return rotated


def perspective_correction(img, _cfg):
    """Detect and correct keystone distortion.

    Looks for strong vertical lines that should be parallel
    and applies a perspective transform to straighten them.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)

    # Detect vertical-ish lines
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180,
                            threshold=80, minLineLength=60, maxLineGap=15)

    if lines is None or len(lines) < 4:
        print("    Perspective: insufficient lines detected, skipping")
        return img

    # Find near-vertical lines (within 20° of vertical)
    vertical_lines = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = abs(math.degrees(math.atan2(x2 - x1, y2 - y1)))
        if angle < 20:
            vertical_lines.append((x1, y1, x2, y2, angle))

    if len(vertical_lines) < 2:
        print("    Perspective: not enough vertical lines, skipping")
        return img

    # Calculate average tilt of vertical lines
    tilts = [vl[4] for vl in vertical_lines]
    avg_tilt = np.mean(tilts)

    if avg_tilt < 1.5:
        print(f"    Perspective: {avg_tilt:.1f}° avg tilt (negligible, skipping)")
        return img

    if avg_tilt > 12:
        print(f"    Perspective: {avg_tilt:.1f}° avg tilt (too extreme, skipping)")
        return img

    # Apply a gentle perspective correction
    h, w = img.shape[:2]
    # Estimate correction amount based on tilt
    shift = int(w * math.tan(math.radians(avg_tilt)) * 0.3)

    src_pts = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst_pts = np.float32([
        [shift, 0], [w - shift, 0],
        [w, h], [0, h]
    ])

    M = cv2.getPerspectiveTransform(src_pts, dst_pts)
    corrected = cv2.warpPerspective(img, M, (w, h), borderMode=cv2.BORDER_REPLICATE)

    print(f"    Perspective: corrected {avg_tilt:.1f}° keystone (shift={shift}px)")
    return corrected


def auto_levels(img, _cfg):
    """Stretch histogram for proper exposure range.

    Clips the darkest 0.5% and brightest 0.5% of pixels
    and stretches the remaining range to 0-255.
    """
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_channel = lab[:, :, 0]

    # Calculate clip points
    hist = cv2.calcHist([l_channel], [0], None, [256], [0, 256]).flatten()
    total = l_channel.size
    clip_low = total * 0.005
    clip_high = total * 0.005

    # Find low clip point
    cumsum = 0
    low = 0
    for i in range(256):
        cumsum += hist[i]
        if cumsum >= clip_low:
            low = i
            break

    # Find high clip point
    cumsum = 0
    high = 255
    for i in range(255, -1, -1):
        cumsum += hist[i]
        if cumsum >= clip_high:
            high = i
            break

    if high <= low:
        print("    Auto-levels: histogram already optimal, skipping")
        return img

    # Stretch
    scale = 255.0 / (high - low)
    l_channel = np.clip((l_channel.astype(np.float32) - low) * scale, 0, 255).astype(np.uint8)
    lab[:, :, 0] = l_channel

    result = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    print(f"    Auto-levels: stretched {low}-{high} → 0-255")
    return result


def white_balance_grayworld(img, _cfg):
    """Apply gray-world white balance correction.

    Assumes the average color in the scene should be neutral gray.
    Adjusts each channel to bring the average toward gray.
    """
    result = img.astype(np.float32)
    avg_b = np.mean(result[:, :, 0])
    avg_g = np.mean(result[:, :, 1])
    avg_r = np.mean(result[:, :, 2])
    avg_all = (avg_b + avg_g + avg_r) / 3

    if avg_all == 0:
        return img

    result[:, :, 0] *= avg_all / max(avg_b, 1)
    result[:, :, 1] *= avg_all / max(avg_g, 1)
    result[:, :, 2] *= avg_all / max(avg_r, 1)

    result = np.clip(result, 0, 255).astype(np.uint8)
    shift_r = abs(avg_all - avg_r)
    shift_b = abs(avg_all - avg_b)
    print(f"    White balance: R shift {shift_r:.1f}, B shift {shift_b:.1f}")
    return result


def noise_reduction(img, _cfg):
    """Apply bilateral filter to reduce noise while preserving edges."""
    result = cv2.bilateralFilter(img, d=7, sigmaColor=50, sigmaSpace=50)
    print("    Noise reduction: bilateral filter applied (d=7)")
    return result


def find_salient_region(img):
    """Find the most visually interesting region of the image.

    Uses a combination of:
    - Edge density (areas with more detail)
    - Color saturation (vivid areas)
    - Center bias (slight preference for center)
    Returns (cx, cy) as the center of interest in pixel coords.
    """
    h, w = img.shape[:2]

    # Edge density map
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 30, 100)
    edge_map = cv2.GaussianBlur(edges.astype(np.float32), (51, 51), 0)

    # Saturation map
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    sat_map = cv2.GaussianBlur(hsv[:, :, 1].astype(np.float32), (51, 51), 0)

    # Center bias (gentle gaussian)
    cy, cx = h // 2, w // 2
    Y, X = np.ogrid[:h, :w]
    center_bias = np.exp(-((X - cx)**2 / (w * 0.6)**2 + (Y - cy)**2 / (h * 0.6)**2))

    # Combined saliency
    saliency = (edge_map / max(edge_map.max(), 1) * 0.4 +
                sat_map / max(sat_map.max(), 1) * 0.3 +
                center_bias * 0.3)

    # Find peak
    peak_idx = np.unravel_index(np.argmax(saliency), saliency.shape)
    return int(peak_idx[1]), int(peak_idx[0])  # (x, y)


def smart_crop_16_9(img, cfg):
    """Crop to 16:9 aspect ratio, centered on the most interesting region.

    Respects crop_bias and crop_override settings.
    """
    h, w = img.shape[:2]
    current_aspect = w / h

    # Check for manual crop override
    if cfg.get("crop_override"):
        cx, cy, cw, ch = cfg["crop_override"]
        x = int(w * cx / 100)
        y = int(h * cy / 100)
        crop_w = int(w * cw / 100)
        crop_h = int(h * ch / 100)
        cropped = img[y:y+crop_h, x:x+crop_w]
        print(f"    Crop: manual override [{cx},{cy},{cw},{ch}]%")
        return cropped

    if abs(current_aspect - TARGET_ASPECT) < 0.02:
        print(f"    Crop: already {current_aspect:.2f} (≈16:9), no crop needed")
        return img

    # Calculate target dimensions (maximize area within 16:9)
    if current_aspect > TARGET_ASPECT:
        # Image is wider than 16:9 — crop width
        target_w = int(h * TARGET_ASPECT)
        target_h = h
    else:
        # Image is taller than 16:9 — crop height
        target_w = w
        target_h = int(w / TARGET_ASPECT)

    # Find center of interest
    interest_x, interest_y = find_salient_region(img)

    # Apply crop bias
    bias = cfg.get("crop_bias", "center")
    if bias == "left":
        interest_x = int(interest_x * 0.5)
    elif bias == "right":
        interest_x = int(interest_x * 0.5 + w * 0.5)
    elif bias == "top":
        interest_y = int(interest_y * 0.5)
    elif bias == "bottom":
        interest_y = int(interest_y * 0.5 + h * 0.5)

    # Center the crop on the point of interest
    x = max(0, min(interest_x - target_w // 2, w - target_w))
    y = max(0, min(interest_y - target_h // 2, h - target_h))

    cropped = img[y:y+target_h, x:x+target_w]
    print(f"    Crop: {w}×{h} → {target_w}×{target_h} (16:9) "
          f"centered on ({interest_x},{interest_y}), bias={bias}")
    return cropped


def apply_warmth(img, warmth):
    """Shift color temperature. Positive = warmer, negative = cooler."""
    if abs(warmth) < 0.01:
        return img

    result = img.astype(np.float32)
    shift = warmth * 15  # Scale: ±1.0 → ±15 in color channels

    # Warm: boost red, reduce blue
    result[:, :, 2] = np.clip(result[:, :, 2] + shift, 0, 255)  # Red
    result[:, :, 0] = np.clip(result[:, :, 0] - shift * 0.6, 0, 255)  # Blue

    direction = "warmer" if warmth > 0 else "cooler"
    print(f"    Warmth: shifted {direction} by {abs(warmth):.2f}")
    return result.astype(np.uint8)


# ─── PIL Post-Processing ─────────────────────────────────────────────────────

def pil_adjustments(pil_img, cfg):
    """Apply brightness, contrast, saturation adjustments via PIL."""
    adjustments = []

    if cfg["brightness"] != 1.0:
        pil_img = ImageEnhance.Brightness(pil_img).enhance(cfg["brightness"])
        adjustments.append(f"brightness={cfg['brightness']:.2f}")

    if cfg["contrast"] != 1.0:
        pil_img = ImageEnhance.Contrast(pil_img).enhance(cfg["contrast"])
        adjustments.append(f"contrast={cfg['contrast']:.2f}")

    if cfg["saturation"] != 1.0:
        pil_img = ImageEnhance.Color(pil_img).enhance(cfg["saturation"])
        adjustments.append(f"saturation={cfg['saturation']:.2f}")

    if adjustments:
        print(f"    Adjustments: {', '.join(adjustments)}")

    return pil_img


def pil_sharpen(pil_img):
    """Gentle unsharp mask for output sharpening after resize."""
    return pil_img.filter(ImageFilter.UnsharpMask(radius=1.5, percent=80, threshold=3))


# ─── Main Processing ─────────────────────────────────────────────────────────

def process_photo(slug, input_path, cfg, preview_mode=False):
    """Run the full processing pipeline on a single photo."""
    print(f"\n{'='*60}")
    print(f"  Processing: {slug}")
    print(f"  Source: {input_path.name}")
    print(f"{'='*60}")

    # Load with OpenCV
    img = cv2.imread(str(input_path))
    if img is None:
        print(f"  ❌ Failed to load {input_path}")
        return False

    h, w = img.shape[:2]
    print(f"  Original: {w}×{h} ({w*h/1e6:.1f} MP)")

    original_for_preview = img.copy() if preview_mode else None

    # ── OpenCV pipeline ──

    if cfg["straighten"]:
        img = auto_straighten(img, cfg)

    if cfg["perspective"]:
        img = perspective_correction(img, cfg)

    if cfg["auto_levels"]:
        img = auto_levels(img, cfg)

    if cfg["white_balance"]:
        img = white_balance_grayworld(img, cfg)

    if cfg["warmth"] != 0:
        img = apply_warmth(img, cfg["warmth"])

    if cfg["noise_reduction"]:
        img = noise_reduction(img, cfg)

    if cfg["smart_crop"]:
        img = smart_crop_16_9(img, cfg)

    # ── Convert to PIL for final steps ──

    pil_img = cv2_to_pil(img)
    pil_img = pil_adjustments(pil_img, cfg)

    # ── Generate outputs ──

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for size_key, dims in OUTPUT_SIZES.items():
        out_path = OUTPUT_DIR / f"{slug}-{size_key}.webp"

        resized = pil_img.resize((dims["width"], dims["height"]), Image.LANCZOS)

        if cfg["sharpen"]:
            resized = pil_sharpen(resized)

        resized.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
        file_size = out_path.stat().st_size / 1024
        print(f"  ✅ {out_path.name} — {dims['width']}×{dims['height']} ({file_size:.0f} KB)")

    # ── Preview mode: generate side-by-side comparison ──

    if preview_mode and original_for_preview is not None:
        generate_preview(slug, original_for_preview, img)

    return True


def generate_preview(slug, original, processed):
    """Create a side-by-side before/after image for review."""
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    # Resize both to same height for comparison
    preview_h = 500
    orig_h, orig_w = original.shape[:2]
    orig_scale = preview_h / orig_h
    orig_resized = cv2.resize(original, (int(orig_w * orig_scale), preview_h))

    proc_h, proc_w = processed.shape[:2]
    proc_scale = preview_h / proc_h
    proc_resized = cv2.resize(processed, (int(proc_w * proc_scale), preview_h))

    # Add labels
    cv2.putText(orig_resized, "BEFORE", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    cv2.putText(proc_resized, "AFTER", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # Add separator
    separator = np.ones((preview_h, 4, 3), dtype=np.uint8) * 200

    combined = np.hstack([orig_resized, separator, proc_resized])

    preview_path = PREVIEW_DIR / f"{slug}-preview.jpg"
    cv2.imwrite(str(preview_path), combined, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(f"  📷 Preview: {preview_path}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Process venue photos for In the Wake")
    parser.add_argument("--photo", "-p", type=str,
                        help="Process a single photo by slug name")
    parser.add_argument("--preview", action="store_true",
                        help="Generate side-by-side before/after previews")
    parser.add_argument("--list", "-l", action="store_true",
                        help="List available original photos")
    parser.add_argument("--config", action="store_true",
                        help="Show current per-photo config")
    args = parser.parse_args()

    config = load_config()

    # List mode
    if args.list:
        photos = discover_originals()
        if not photos:
            print(f"No photos found in {ORIGINALS_DIR}")
            print(f"Place original photos there, named by venue slug")
            print(f"  e.g., wonderland.jpg, chops.png, schooner-bar.heic")
            return
        print(f"\nFound {len(photos)} original(s) in {ORIGINALS_DIR}:\n")
        for slug, path in photos.items():
            has_override = "✏️  (has config)" if slug in config else ""
            has_output = "✅ (processed)" if (OUTPUT_DIR / f"{slug}-720w.webp").exists() else ""
            print(f"  {slug:30s} ← {path.name}  {has_override} {has_output}")
        return

    # Config mode
    if args.config:
        if not config:
            print("No per-photo config found.")
            print(f"Create one at: {CONFIG_FILE}")
            print(f"\nExample:")
            print(json.dumps({
                "wonderland": {
                    "crop_bias": "center",
                    "warmth": 0.2,
                    "brightness": 1.05,
                    "saturation": 1.1
                }
            }, indent=2))
            return
        print(json.dumps(config, indent=2))
        return

    # Discover photos
    photos = discover_originals()
    if not photos:
        print(f"\n❌ No photos found in {ORIGINALS_DIR}")
        print(f"   Place original photos there, named by venue slug.")
        print(f"   Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}")
        sys.exit(1)

    # Single photo mode
    if args.photo:
        slug = args.photo.lower().replace(" ", "-").replace("_", "-")
        if slug not in photos:
            print(f"\n❌ No original found for '{slug}'")
            print(f"   Available: {', '.join(photos.keys())}")
            sys.exit(1)
        cfg = get_photo_config(slug, config)
        success = process_photo(slug, photos[slug], cfg, preview_mode=args.preview)
        if not success:
            sys.exit(1)
        return

    # Batch mode — process all
    print(f"\nProcessing {len(photos)} photo(s)...\n")
    successes = 0
    failures = 0
    for slug, path in photos.items():
        cfg = get_photo_config(slug, config)
        if process_photo(slug, path, cfg, preview_mode=args.preview):
            successes += 1
        else:
            failures += 1

    print(f"\n{'='*60}")
    print(f"  Done: {successes} processed, {failures} failed")
    print(f"  Output: {OUTPUT_DIR}")
    if args.preview:
        print(f"  Previews: {PREVIEW_DIR}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
