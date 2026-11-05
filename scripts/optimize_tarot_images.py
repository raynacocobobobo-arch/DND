#!/usr/bin/env python3
"""Compress Forbidden Arcana web assets in place without changing artwork or paths.

Run from the root of gh-pages. Re-encoding does not crop, retouch, recolor,
reorder, rename or alter card metadata. The original bytes remain in Git history.
"""
from __future__ import annotations

import glob
import hashlib
import json
import os
import tempfile
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

from PIL import Image

RULES = [
    ("assets/cards-hd/*.webp", 1536, 84),
    ("assets/cards/*.webp", 1536, 84),
    ("assets/cards-thumb/*.webp", 480, 78),
    ("minor-arcana/*/final/*.webp", 1600, 83),
    ("minor-arcana/*/thumbs/*.webp", 480, 77),
]
REPORT = Path("assets/tarot-optimization-report.json")
MIN_SAVING = 0.03


def encoded_webp(path: Path, limit: int, quality: int) -> tuple[bytes, tuple[int, int], tuple[int, int]]:
    with Image.open(path) as source:
        if source.format != "WEBP":
            raise ValueError(f"Not WebP: {path}")
        source.load()
        original_size = source.size
        profile = source.info.get("icc_profile")
        frame = source.copy()
        if frame.mode not in ("RGB", "RGBA"):
            frame = frame.convert("RGBA" if "A" in frame.getbands() or "transparency" in source.info else "RGB")
        if max(frame.size) > limit:
            frame.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        output = BytesIO()
        options = {"format": "WEBP", "quality": quality, "method": 6}
        if profile:
            options["icc_profile"] = profile
        frame.save(output, **options)
        data = output.getvalue()
        with Image.open(BytesIO(data)) as validated:
            validated.verify()
        if abs(frame.width / frame.height - original_size[0] / original_size[1]) > 0.002:
            raise ValueError(f"Aspect ratio changed: {path}")
        return data, original_size, frame.size


def main() -> None:
    paths: dict[Path, tuple[int, int]] = {}
    for pattern, maxedge, quality in RULES:
        hits = sorted(Path(p) for p in glob.glob(pattern))
        if not hits:
            raise RuntimeError(f"Expected tarot images missing: {pattern}")
        for p in hits:
            paths[p] = (maxedge, quality)

    before = sum(p.stat().st_size for p in paths)
    changed = []
    errors = []
    for n, (p, (maxedge, quality)) in enumerate(paths.items(), 1):
        old_bytes = p.stat().st_size
        try:
            data, old_size, new_size = encoded_webp(p, maxedge, quality)
            if len(data) <= old_bytes * (1 - MIN_SAVING):
                fd, tmp = tempfile.mkstemp(prefix=".webp-opt-", dir=p.parent)
                try:
                    with os.fdopen(fd, "wb") as output:
                        output.write(data)
                    os.replace(tmp, p)
                finally:
                    if os.path.exists(tmp):
                        os.unlink(tmp)
                changed.append({
                    "path": str(p), "before_bytes": old_bytes, "after_bytes": len(data),
                    "before_dimensions": list(old_size), "after_dimensions": list(new_size)
                })
        except Exception as exc:
            errors.append(f"{p}: {exc}")
        if n % 40 == 0:
            print(f"Processed {n}/{len(paths)}", flush=True)

    if errors:
        raise RuntimeError("Compression errors: " + "; ".join(errors))

    # The 22-card public manifest contains byte sizes and SHA-256 checksums.
    manifest = Path("assets/cards-hd/manifest.json")
    if manifest.exists():
        records = json.loads(manifest.read_text(encoding="utf-8"))
        for card in records:
            hd = Path(card["hd"])
            thumb = Path(card["thumbnail"])
            card["hd_bytes"] = hd.stat().st_size
            card["thumb_bytes"] = thumb.stat().st_size
            card["sha256"] = hashlib.sha256(hd.read_bytes()).hexdigest()
        manifest.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    after = sum(p.stat().st_size for p in paths)
    summary = {
        "asset_count": len(paths),
        "compressed_count": len(changed),
        "total_before_bytes": before,
        "total_after_bytes": after,
        "bytes_saved": before - after,
        "saved_percent": round(100 * (before - after) / before, 2),
        "max_full_card_edge_px": 1600,
        "max_thumbnail_edge_px": 480,
        "originals_preserved_in_git_history": True,
        "changed": changed,
    }
    REPORT.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in summary.items() if k != "changed"}, indent=2))
    if after >= before:
        raise RuntimeError("No image-size reduction observed")


if __name__ == "__main__":
    main()
