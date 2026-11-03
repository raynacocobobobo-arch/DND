#!/usr/bin/env python3
"""Local RAR/Unitypackage -> textured GLB converter for macOS.

Requirements:
    brew install assimp
    macOS provides bsdtar.

Usage:
    python3 LocalUnityGLBPipeline.py "/path/to/asset.rar" "/path/to/output"
"""
from __future__ import annotations
import argparse
import base64
import json
import shutil
import struct
import subprocess
import tarfile
from pathlib import Path, PurePosixPath

MODEL_SUFFIXES = {".fbx"}
TEXTURE_SUFFIXES = {".png", ".jpg", ".jpeg", ".tga", ".tif", ".tiff", ".bmp", ".dds", ".exr"}
MATERIAL_SUFFIXES = {".mat"}
JSON_CHUNK = 0x4E4F534A


def clean_pathname(data: bytes) -> str:
    text = data.decode("utf-8", errors="replace").split("\x00", 1)[0]
    lines = text.splitlines()
    return lines[0].strip() if lines else ""


def safe_path(root: Path, unity_path: str) -> Path:
    parts = PurePosixPath(unity_path.replace("\\", "/"))
    if parts.is_absolute() or any(part in {"", ".", ".."} for part in parts.parts):
        raise ValueError(f"Unsafe pathname: {unity_path!r}")
    target = root.joinpath(*parts.parts)
    if root.resolve() not in target.resolve().parents:
        raise ValueError(f"Unsafe pathname: {unity_path!r}")
    return target


def extract_unitypackage(package: Path, destination: Path) -> dict[str, int]:
    counts = {"fbx": 0, "textures": 0, "materials": 0}
    destination.mkdir(parents=True, exist_ok=True)
    with tarfile.open(package, "r:*") as archive:
        members = {member.name: member for member in archive.getmembers() if member.isfile()}
        folders = sorted({Path(name).parent.as_posix() for name in members})
        for folder in folders:
            pathname_member = members.get(f"{folder}/pathname")
            asset_member = members.get(f"{folder}/asset")
            if pathname_member is None or asset_member is None:
                continue
            pathname_file = archive.extractfile(pathname_member)
            asset_file = archive.extractfile(asset_member)
            if pathname_file is None or asset_file is None:
                continue
            unity_path = clean_pathname(pathname_file.read())
            suffix = PurePosixPath(unity_path).suffix.lower()
            if suffix not in MODEL_SUFFIXES | TEXTURE_SUFFIXES | MATERIAL_SUFFIXES:
                continue
            target = safe_path(destination, unity_path)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("wb") as output:
                shutil.copyfileobj(asset_file, output)
            if suffix in MODEL_SUFFIXES:
                counts["fbx"] += 1
            elif suffix in TEXTURE_SUFFIXES:
                counts["textures"] += 1
            else:
                counts["materials"] += 1
    return counts


def find_unitypackages(source: Path, archive_root: Path) -> list[Path]:
    if source.suffix.lower() == ".unitypackage":
        return [source]
    if source.is_dir():
        return sorted(source.rglob("*.unitypackage"))
    if source.suffix.lower() not in {".rar", ".zip", ".7z", ".tar", ".gz"}:
        raise ValueError("Source must be a local RAR, archive, unitypackage, or folder.")
    command = ["bsdtar", "-xf", str(source), "-C", str(archive_root)]
    subprocess.run(command, check=True)
    return sorted(archive_root.rglob("*.unitypackage"))


def texture_index(extracted_root: Path) -> dict[str, Path]:
    return {
        path.name.lower(): path
        for path in extracted_root.rglob("*")
        if path.is_file() and path.suffix.lower() in TEXTURE_SUFFIXES
    }


def texture_for_uri(uri: str, textures: dict[str, Path]) -> Path | None:
    leaf = Path(uri.replace("\\", "/")).name.lower()
    if leaf in textures:
        return textures[leaf]
    stem = Path(leaf).stem
    if Path(leaf).suffix.lower() == ".psd":
        for candidate in (f"{stem}_a.png", f"{stem}.png", f"{stem}_a.tga", f"{stem}.tga"):
            if candidate in textures:
                return textures[candidate]
    return None


def embed_textures(source: Path, destination: Path, textures: dict[str, Path]) -> list[str]:
    raw = source.read_bytes()
    if len(raw) < 12:
        raise ValueError(f"Invalid GLB: {source}")
    magic, version, total = struct.unpack_from("<4sII", raw, 0)
    if magic != b"glTF" or version != 2 or total != len(raw):
        raise ValueError(f"Invalid GLB: {source}")
    offset = 12
    chunks: list[tuple[int, bytes]] = []
    while offset < len(raw):
        if offset + 8 > len(raw):
            raise ValueError(f"Truncated GLB chunk header: {source}")
        length, kind = struct.unpack_from("<II", raw, offset)
        offset += 8
        if offset + length > len(raw):
            raise ValueError(f"Truncated GLB chunk: {source}")
        chunks.append((kind, raw[offset:offset + length]))
        offset += length
    if not chunks or chunks[0][0] != JSON_CHUNK:
        raise ValueError(f"Missing GLB JSON: {source}")
    document = json.loads(chunks[0][1].decode("utf-8").rstrip(" \x00"))
    missing = []
    for image in document.get("images", []):
        uri = image.get("uri")
        if not uri or uri.startswith("data:"):
            continue
        texture = texture_for_uri(uri, textures)
        if texture is None:
            missing.append(uri)
            continue
        suffix = texture.suffix.lower()
        if suffix not in {".png", ".jpg", ".jpeg"}:
            # Do not label TGA/TIFF/DDS/EXR bytes as PNG. If the converter
            # cannot supply a browser-safe PNG/JPEG, report it as missing.
            missing.append(uri)
            continue
        mime = "image/jpeg" if suffix in {".jpg", ".jpeg"} else "image/png"
        image["uri"] = f"data:{mime};base64,{base64.b64encode(texture.read_bytes()).decode('ascii')}"
        image["mimeType"] = mime
    json_bytes = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    chunks[0] = (JSON_CHUNK, json_bytes + b" " * ((-len(json_bytes)) % 4))
    body = b"".join(struct.pack("<II", len(chunk), kind) + chunk for kind, chunk in chunks)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(struct.pack("<4sII", b"glTF", 2, 12 + len(body)) + body)
    return missing


def convert_package(source: Path | str, destination: Path | str) -> dict:
    """Run the full local pipeline and return manifest data."""
    if shutil.which("bsdtar") is None or shutil.which("assimp") is None:
        raise RuntimeError("Missing local converter. On macOS run: brew install assimp")
    source = Path(source).expanduser().resolve()
    destination = Path(destination).expanduser().resolve()
    archive_root = destination / "_archive"
    extracted_root = destination / "extracted"
    raw_glb_root = destination / "_raw_glb"
    glb_root = destination / "glb"
    archive_root.mkdir(parents=True, exist_ok=True)
    packages = find_unitypackages(source, archive_root)
    if not packages:
        raise ValueError("No .unitypackage found in the selected source.")
    totals = {"fbx": 0, "textures": 0, "materials": 0}
    for package in packages:
        counts = extract_unitypackage(package, extracted_root / package.stem)
        for key, value in counts.items():
            totals[key] += value
    textures = texture_index(extracted_root)
    records = []
    for fbx in sorted(extracted_root.rglob("*.fbx")):
        relative = fbx.relative_to(extracted_root).with_suffix(".glb")
        raw_glb = raw_glb_root / relative
        raw_glb.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["assimp", "export", str(fbx), str(raw_glb), "-f", "glb2"], check=True)
        missing = embed_textures(raw_glb, glb_root / relative, textures)
        records.append({
            "source_fbx": str(fbx.relative_to(destination)),
            "glb": str((glb_root / relative).relative_to(destination)),
            "status": "converted" if not missing else "converted_with_missing_textures",
            "missing_texture_uris": missing,
        })
    manifest = {"extracted": totals, "models": records}
    (destination / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description="Local RAR/Unitypackage to textured GLB pipeline")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    manifest = convert_package(args.source, args.destination)
    missing_models = sum(bool(record["missing_texture_uris"]) for record in manifest["models"])
    print(f"Converted {len(manifest['models'])} GLB. Models with missing source textures: {missing_models}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
