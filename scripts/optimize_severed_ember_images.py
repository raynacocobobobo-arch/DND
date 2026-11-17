#!/usr/bin/env python3
"""One-shot, conservative optimization of large active Severed Ember PNG art."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "severed-ember"
ASSET_ROOT = ROOT / "assets"
MIN_PNG_BYTES = 512 * 1024
WEBP_QUALITY = 92
MAX_REMAINING_RATIO = 0.90
TEXT_EXTS = {".html", ".css", ".js", ".json", ".md", ".xml"}

def main() -> None:
    candidates = sorted(
        p for p in ASSET_ROOT.rglob("*.png")
        if p.stat().st_size >= MIN_PNG_BYTES
    )
    changes: list[dict[str, object]] = []
    replacements: dict[str, str] = {}

    for png in candidates:
        webp = png.with_suffix(".webp")
        if webp.exists():
            raise RuntimeError(f"Refusing to overwrite existing art: {webp}")
        before = png.stat().st_size
        with Image.open(png) as original:
            original.load()
            size = original.size
            has_alpha = "A" in original.getbands() or "transparency" in original.info
            art = original.convert("RGBA" if has_alpha else "RGB")
            save_options = {"format": "WEBP", "quality": WEBP_QUALITY, "method": 6}
            profile = original.info.get("icc_profile")
            if profile:
                save_options["icc_profile"] = profile
            art.save(webp, **save_options)
        with Image.open(webp) as verification:
            verification.load()
            if verification.size != size or verification.format != "WEBP":
                raise RuntimeError(f"Decoded image did not match source dimensions: {png}")
        after = webp.stat().st_size
        if after >= before * MAX_REMAINING_RATIO:
            webp.unlink()
            continue

        original_ref = png.relative_to(ROOT).as_posix()
        optimized_ref = webp.relative_to(ROOT).as_posix()
        replacements[original_ref] = optimized_ref
        changes.append({
            "original": original_ref,
            "optimized": optimized_ref,
            "width": size[0],
            "height": size[1],
            "alpha": has_alpha,
            "original_bytes": before,
            "optimized_bytes": after,
            "saved_bytes": before - after,
        })

    if not changes:
        print("No PNG passed the safety and file-size savings checks")
        return

    # Rewrite URLs in all site pages, style sheets, scripts and reference notes.
    # The unchanged original artwork remains accessible in Git history.
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in TEXT_EXTS:
            continue
        if p.name == "OPTIMIZATION-20261117.json":
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        updated = text
        for old_ref, new_ref in replacements.items():
            updated = updated.replace(old_ref, new_ref)
        if text != updated:
            p.write_text(updated, encoding="utf-8")

    # Confirm the old file paths are no longer referenced by live HTML/CSS/JS.
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".html", ".css", ".js", ".json"}:
            continue
        text = p.read_text(encoding="utf-8")
        for old_ref in replacements:
            if old_ref in text:
                raise RuntimeError(f"Stale image reference in {p}: {old_ref}")

    for original_ref in replacements:
        (ROOT / original_ref).unlink()

    result = {
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "quality": WEBP_QUALITY,
        "image_count": len(changes),
        "original_bytes": sum(int(x["original_bytes"]) for x in changes),
        "optimized_bytes": sum(int(x["optimized_bytes"]) for x in changes),
        "saved_bytes": sum(int(x["saved_bytes"]) for x in changes),
        "images": changes,
    }
    output = ROOT / "OPTIMIZATION-20261117.json"
    output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"image_count": result["image_count"], "saved_mb": round(result["saved_bytes"] / 1048576, 2)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
