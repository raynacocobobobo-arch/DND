#!/usr/bin/env python3
"""Compress active Severed Ember WebP artwork and create responsive mobile variants.

Run from repository root. This runs once through GitHub Actions and commits the
results back to gh-pages. All approved compositions and aspect ratios are kept.
Originals remain recoverable from Git history.
"""
from __future__ import annotations

import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image

SITE = Path(__file__).resolve().parents[1] / "severed-ember"
ASSETS = SITE / "assets"
REPORT = SITE / "PERFORMANCE-OPTIMIZATION-20261117.json"
MIN_SOURCE = 100_000
DESKTOP_TARGET = 200_000
MOBILE_TARGET = 100_000
DESKTOP_PLANS = (
    (1800, 80), (1700, 78), (1600, 76), (1500, 74),
    (1450, 72), (1350, 70), (1200, 69),
)
MOBILE_PLANS = ((960, 75), (900, 73), (840, 71), (800, 70))
IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
SRC_ATTR = re.compile(r"\bsrc\s*=\s*(['\"])(.*?)\1", re.IGNORECASE)


def encoded(image: Image.Image, max_side: int, quality: int) -> tuple[bytes, tuple[int, int]]:
    w, h = image.size
    factor = min(1.0, max_side / max(w, h))
    dimensions = (max(1, round(w * factor)), max(1, round(h * factor)))
    converted = image
    if dimensions != image.size:
        converted = image.resize(dimensions, Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    converted.save(buffer, format="WEBP", quality=quality, method=6)
    return buffer.getvalue(), dimensions


def find_best(image: Image.Image, plans: tuple[tuple[int, int], ...], target: int):
    candidates = []
    for limit, quality in plans:
        data, dims = encoded(image, limit, quality)
        candidates.append((data, dims, limit, quality))
        if len(data) <= target:
            break
    return candidates[-1]


def verify(payload: bytes, dimensions: tuple[int, int]) -> None:
    with Image.open(io.BytesIO(payload)) as test:
        test.verify()
    with Image.open(io.BytesIO(payload)) as test:
        if test.format != "WEBP" or test.size != dimensions:
            raise RuntimeError("Encoded WebP failed decode/dimension validation")


def main():
    before_files = list(ASSETS.rglob("*.webp"))
    before_bytes = sum(p.stat().st_size for p in before_files)
    pages = sorted(SITE.rglob("*.html"))
    live_html = "\n".join(p.read_text(encoding="utf-8") for p in pages)
    stats = []
    responsive: dict[Path, tuple[Path, int, int]] = {}
    optimized = 0

    # Never modify branding, logos, icons, or previously generated responsive images.
    for art in sorted(before_files):
        if art.name.endswith("-mobile.webp") or "branding" in art.parts:
            continue
        original_bytes = art.stat().st_size
        if original_bytes < MIN_SOURCE:
            continue
        with Image.open(art) as im:
            im.load()
            if getattr(im, "n_frames", 1) != 1:
                continue
            rgba = im.convert("RGBA" if ("A" in im.getbands() or "transparency" in im.info) else "RGB")
            original_dims = rgba.size

        desktop_payload, desktop_dims, desktop_limit, desktop_quality = find_best(
            rgba, DESKTOP_PLANS, DESKTOP_TARGET
        )
        after_bytes = original_bytes
        if len(desktop_payload) < original_bytes * 0.93:
            verify(desktop_payload, desktop_dims)
            art.write_bytes(desktop_payload)
            after_bytes = len(desktop_payload)
            optimized += 1
        else:
            desktop_dims = original_dims

        # Generate variants only for images used as HTML images. CSS background art
        # still benefits from the optimized full-sized WebP without changing layout.
        rel = art.relative_to(SITE).as_posix()
        referenced = rel in live_html and (
            re.search(r"<img\b[^>]*\bsrc=['\"][^'\"]*"+re.escape(art.name)+r"(?:\?[^'\"]*)?['\"]", live_html, re.I) is not None
        )
        mobile = art.with_name(art.stem + "-mobile.webp")
        if referenced and max(original_dims) > 950:
            mobile_payload, mobile_dims, mobile_limit, mobile_quality = find_best(
                rgba, MOBILE_PLANS, MOBILE_TARGET
            )
            if mobile_dims[0] < desktop_dims[0] and len(mobile_payload) < after_bytes * 0.9:
                verify(mobile_payload, mobile_dims)
                if mobile.exists():
                    raise RuntimeError("Refusing to overwrite existing mobile asset: " + str(mobile))
                mobile.write_bytes(mobile_payload)
                responsive[art.resolve()] = (mobile, mobile_dims[0], desktop_dims[0])
                mobile_bytes = len(mobile_payload)
            else:
                mobile_bytes = None
        else:
            mobile_bytes = None

        stats.append({
            "file": rel,
            "before_bytes": original_bytes,
            "after_bytes": after_bytes,
            "original_dimensions": list(original_dims),
            "desktop_dimensions": list(desktop_dims),
            "desktop_quality": desktop_quality if after_bytes != original_bytes else None,
            "mobile_bytes": mobile_bytes,
            "mobile_file": mobile.relative_to(SITE).as_posix() if mobile_bytes else None,
        })

    total_srcset = 0
    updated_pages = []
    for page in pages:
        contents = page.read_text(encoding="utf-8")
        count = 0

        def replace_img(match: re.Match[str]) -> str:
            nonlocal count
            tag = match.group(0)
            if re.search(r"\bsrcset\s*=", tag, re.I):
                return tag
            matched = SRC_ATTR.search(tag)
            if not matched:
                return tag
            url = matched.group(2)
            clean = url.split("?", 1)[0].split("#", 1)[0]
            if not clean.lower().endswith(".webp"):
                return tag
            file_path = (page.parent / clean).resolve()
            variants = responsive.get(file_path)
            if variants is None:
                return tag
            mobile, small_w, desktop_w = variants
            if desktop_w <= small_w:
                return tag
            # Use a 70vw mobile slot to prioritize the mobile asset on
            # high-DPR phones while keeping a full-resolution desktop fallback.
            suffix = url[len(clean):]
            mobile_url = clean[:-5] + "-mobile.webp" + suffix
            added = (
                f' srcset="{mobile_url} {small_w}w, {url} {desktop_w}w"'
                ' sizes="(max-width:800px) 70vw, (max-width:1200px) 76vw, 60vw"'
            )
            count += 1
            if tag.endswith("/>"):
                return tag[:-2].rstrip() + added + " />"
            return tag[:-1] + added + ">"

        updated = IMG_TAG.sub(replace_img, contents)
        if updated != contents:
            page.write_text(updated, encoding="utf-8")
            total_srcset += count
            updated_pages.append(page.relative_to(SITE).as_posix())

    after_full_bytes = sum(p.stat().st_size for p in before_files)
    mobile_total = sum(info[0].stat().st_size for info in responsive.values())
    report = {
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "desktop_target_bytes": DESKTOP_TARGET,
        "mobile_target_bytes": MOBILE_TARGET,
        "original_webp_bytes": before_bytes,
        "optimized_full_webp_bytes": after_full_bytes,
        "full_webp_saved_bytes": before_bytes - after_full_bytes,
        "mobile_variant_bytes": mobile_total,
        "total_webp_bytes_after_including_mobile": after_full_bytes + mobile_total,
        "converted_images": optimized,
        "mobile_variants": len(responsive),
        "responsive_img_tags": total_srcset,
        "updated_html_files": updated_pages,
        "images": stats,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "converted_images": optimized,
        "mobile_variants": len(responsive),
        "responsive_img_tags": total_srcset,
        "saved_full_mb": round((before_bytes - after_full_bytes) / (1024*1024), 2),
        "total_webp_after_mb": round((after_full_bytes + mobile_total) / (1024*1024), 2),
    }, ensure_ascii=False))
    if optimized < 50 or len(responsive) < 40 or total_srcset < 60:
        raise RuntimeError("Optimization unexpectedly small; inspect report before publication")


if __name__ == "__main__":
    main()
