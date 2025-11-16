#!/usr/bin/env python3
"""
Convert images to WebP format for optimal web performance
Usage: python3 convert_to_webp.py <input_image> [output_path] [--quality 85] [--max-width 1920]
"""

from PIL import Image
import os
import sys
import argparse

def convert_to_webp(input_path, output_path=None, quality=85, max_width=1920, verbose=True):
    """
    Convert image to WebP format with optimization

    Args:
        input_path: Path to input image
        output_path: Path for output (default: same name with .webp)
        quality: WebP quality 1-100 (default: 85)
        max_width: Maximum width in pixels (default: 1920)
        verbose: Print conversion details

    Returns:
        dict with conversion stats
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if output_path is None:
        output_path = os.path.splitext(input_path)[0] + '.webp'

    # Open and process image
    img = Image.open(input_path)
    original_width, original_height = img.size

    # Resize if too large
    resized = False
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        resized = True

    # Convert to appropriate mode for WebP
    if img.mode in ('RGBA', 'LA', 'P'):
        # Handle transparency
        if img.mode == 'P':
            img = img.convert('RGBA')
        # Save with alpha channel
        img.save(output_path, 'WEBP', quality=quality, method=6)
    else:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img.save(output_path, 'WEBP', quality=quality, method=6)

    # Get file sizes
    original_size = os.path.getsize(input_path)
    new_size = os.path.getsize(output_path)
    savings = ((original_size - new_size) / original_size) * 100

    result = {
        'input': input_path,
        'output': output_path,
        'original_size': original_size,
        'new_size': new_size,
        'savings_percent': savings,
        'original_dimensions': f"{original_width}x{original_height}",
        'new_dimensions': f"{img.width}x{img.height}",
        'resized': resized
    }

    if verbose:
        print(f"✓ Converted: {input_path}")
        print(f"  Output: {output_path}")
        print(f"  Size: {original_size:,} → {new_size:,} bytes ({savings:.1f}% smaller)")
        print(f"  Dimensions: {original_width}x{original_height} → {img.width}x{img.height}")
        if resized:
            print(f"  (Resized to fit max width: {max_width}px)")

    return result

def batch_convert(directory, pattern='*.jpg', quality=85, max_width=1920, delete_original=False):
    """
    Batch convert all images in a directory

    Args:
        directory: Directory to search
        pattern: File pattern (*.jpg, *.jpeg, *.png)
        quality: WebP quality
        max_width: Max width in pixels
        delete_original: Delete original files after conversion
    """
    import glob

    files = glob.glob(os.path.join(directory, '**', pattern), recursive=True)

    print(f"Found {len(files)} images matching '{pattern}' in {directory}")
    print(f"Converting to WebP (quality={quality}, max_width={max_width}px)...\n")

    total_original = 0
    total_new = 0
    converted = 0

    for filepath in files:
        # Skip if WebP already exists
        webp_path = os.path.splitext(filepath)[0] + '.webp'
        if os.path.exists(webp_path):
            print(f"⊘ Skipped (WebP exists): {filepath}")
            continue

        try:
            result = convert_to_webp(filepath, quality=quality, max_width=max_width, verbose=True)
            total_original += result['original_size']
            total_new += result['new_size']
            converted += 1

            if delete_original:
                os.remove(filepath)
                print(f"  Deleted original: {filepath}")

            print()
        except Exception as e:
            print(f"✗ Error converting {filepath}: {e}\n")

    if converted > 0:
        total_savings = ((total_original - total_new) / total_original) * 100
        print(f"\n{'='*60}")
        print(f"Batch conversion complete!")
        print(f"  Converted: {converted} images")
        print(f"  Total size: {total_original:,} → {total_new:,} bytes")
        print(f"  Total savings: {total_savings:.1f}%")
        print(f"{'='*60}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert images to WebP format')
    parser.add_argument('input', help='Input image file or directory')
    parser.add_argument('output', nargs='?', help='Output file path (optional)')
    parser.add_argument('-q', '--quality', type=int, default=85, help='WebP quality 1-100 (default: 85)')
    parser.add_argument('-w', '--max-width', type=int, default=1920, help='Maximum width in pixels (default: 1920)')
    parser.add_argument('-b', '--batch', action='store_true', help='Batch convert directory')
    parser.add_argument('-p', '--pattern', default='*.jpg', help='File pattern for batch mode (default: *.jpg)')
    parser.add_argument('--delete-original', action='store_true', help='Delete original files after conversion')

    args = parser.parse_args()

    if args.batch:
        batch_convert(
            args.input,
            pattern=args.pattern,
            quality=args.quality,
            max_width=args.max_width,
            delete_original=args.delete_original
        )
    else:
        convert_to_webp(
            args.input,
            output_path=args.output,
            quality=args.quality,
            max_width=args.max_width
        )
