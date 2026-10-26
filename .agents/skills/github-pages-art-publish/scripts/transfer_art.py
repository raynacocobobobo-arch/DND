#!/usr/bin/env python3
"""Publish approved originals without regenerating, resampling, or changing full-res pixels.

Use from a one-time GitHub Actions workflow after uploading images to a temporary
Google Doc. Source URLs are ephemeral and must not be left in permanent repo files.
Requires Pillow: python -m pip install Pillow
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import time
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from PIL import Image

ROOT_AREAS = {"minor-arcana", "assets"}


def safe_repo_path(root: Path, raw: str) -> Path:
    if not isinstance(raw, str) or "\\" in raw or not raw:
        raise ValueError("Invalid destination path")
    path = PurePosixPath(raw)
    if (path.is_absolute() or ".." in path.parts or "." in path.parts
            or path.parts[0] not in ROOT_AREAS or len(path.parts) < 3):
        raise ValueError(f"Unsafe repo path: {raw!r}")
    output = root.joinpath(*path.parts)
    if not output.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"Destination escapes repository: {raw!r}")
    return output


def validate_source_url(url: str) -> None:
    if not isinstance(url, str):
        raise ValueError("Image source URL must be a string")
    p = urlparse(url)
    if p.scheme != "https" or p.hostname != "docs.google.com" or not p.path.startswith("/docs-images-rt/"):
        raise ValueError("Expected the signed docs-images-rt URL from the temporary Google Doc")


def fetch_source(url: str, retries: int = 4) -> bytes:
    validate_source_url(url)
    last = None
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": "Verified-Art-Publish/1.0"})
            with urlopen(req, timeout=80) as res:
                payload = res.read(45 * 1024 * 1024 + 1)
            if len(payload) > 45 * 1024 * 1024:
                raise ValueError("Unusually large image; abort")
            if len(payload) < 100_000:
                raise ValueError("Image source is unexpectedly small")
            return payload
        except Exception as exc:
            last = exc
            if attempt < retries - 1:
                time.sleep(2 + attempt * 3)
    raise RuntimeError(f"Source transfer failed after {retries} attempts: {last}")


def publish_bytes(raw: bytes, entry: dict, root: Path, replace: bool = False) -> dict:
    """Write an actual source image as pixel-identical lossless WebP plus thumbnail."""
    full = safe_repo_path(root, entry["output_path"])
    thumb = safe_repo_path(root, entry["thumb_path"])
    if full == thumb or full.suffix.lower() != ".webp" or thumb.suffix.lower() != ".webp":
        raise ValueError("Expected separate .webp artwork and thumbnail destinations")
    if not replace and (full.exists() or thumb.exists()):
        raise FileExistsError("Output already exists: use a new -vN filename, or explicit --replace")
    with Image.open(io.BytesIO(raw)) as source:
        source.load()
        expected = tuple(entry["expected_size"])
        if len(expected) != 2 or any(not isinstance(x, int) or x < 1 for x in expected):
            raise ValueError("expected_size must contain positive integer width, height")
        if source.size != expected:
            raise ValueError(f"Source resolution {source.size} != approved {expected}. No auto-resize!")
        mode = "RGBA" if "A" in source.getbands() else "RGB"
        original = source.convert(mode)
    full.parent.mkdir(parents=True, exist_ok=True)
    thumb.parent.mkdir(parents=True, exist_ok=True)
    full_temp = full.with_name(full.name + ".uploading")
    thumb_temp = thumb.with_name(thumb.name + ".uploading")
    try:
        original.save(full_temp, "WEBP", lossless=True, method=5)
        with Image.open(full_temp) as roundtrip:
            roundtrip.load()
            if (roundtrip.format != "WEBP" or roundtrip.size != original.size
                    or roundtrip.convert(mode).tobytes() != original.tobytes()):
                raise AssertionError("Lossless pixel identity verification failed")
        preview = original.copy()
        preview.thumbnail((360, 640), Image.Resampling.LANCZOS)
        if mode == "RGBA":
            preview.save(thumb_temp, "WEBP", lossless=True, method=5)
        else:
            preview.save(thumb_temp, "WEBP", quality=91, method=5)
        os.replace(full_temp, full)
        os.replace(thumb_temp, thumb)
    finally:
        full_temp.unlink(missing_ok=True)
        thumb_temp.unlink(missing_ok=True)
    result = {
        "name": entry.get("name") or full.name,
        "source_sha256": hashlib.sha256(raw).hexdigest(),
        "published_sha256": hashlib.sha256(full.read_bytes()).hexdigest(),
        "pixel_sha256": hashlib.sha256(original.tobytes()).hexdigest(),
        "size": list(original.size),
        "output_path": str(full.relative_to(root)),
        "thumb_path": str(thumb.relative_to(root)),
        "byte_count": full.stat().st_size,
    }
    print("VERIFIED_ORIGINAL_PUBLISHED " + json.dumps(result, ensure_ascii=False), flush=True)
    return result


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--manifest", required=True, help="Path to temporary JSON manifest")
    ap.add_argument("--root", default=".", help="Checked-out gh-pages working directory")
    ap.add_argument("--paths-file", required=True, help="Write exact staged paths as NUL-separated bytes")
    ap.add_argument("--replace", action="store_true", help="Overwrite a known existing version; prefer new -vN")
    args = ap.parse_args()
    root = Path(args.root).resolve()
    entries = json.loads(Path(args.manifest).read_text("utf-8"))
    if not isinstance(entries, list) or not entries:
        raise ValueError("Manifest must be a nonempty list")
    output_names = [k for e in entries for k in (e["output_path"], e["thumb_path"])]
    if len(output_names) != len(set(output_names)):
        raise ValueError("Duplicate outputs in manifest")
    # Validate the entire manifest before fetching or writing files.
    for item in entries:
        validate_source_url(item["source_url"])
        safe_repo_path(root, item["output_path"])
        safe_repo_path(root, item["thumb_path"])
        if len(item.get("expected_size", [])) != 2:
            raise ValueError("Each entry needs its explicitly approved expected_size")
    published = []
    for item in entries:
        blob = fetch_source(item["source_url"])
        published.append(publish_bytes(blob, item, root, replace=args.replace))
    with open(args.paths_file, "wb") as handle:
        for entry in published:
            for key in ("output_path", "thumb_path"):
                handle.write(entry[key].encode("utf-8") + b"\0")
    print(f"ALL_APPROVED_ORIGINALS_VERIFIED count={len(published)}", flush=True)


if __name__ == "__main__":
    main()
