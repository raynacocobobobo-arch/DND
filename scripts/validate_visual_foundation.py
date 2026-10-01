#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ALLOWED_STATUSES = {"DRAFT", "REVIEW", "LOCKED", "RETIRED"}
FOUNDATION_REL = Path("MASTER/VISUAL-FOUNDATION")
REQUIRED_ROOT_FILES = [
    "README.md",
    "GLOBAL-VISUAL-FOUNDATION-V1.md",
    "VISUAL-ANCHOR-MANIFEST.json",
]


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def validate(root: Path) -> list[str]:
    errors: list[str] = []
    vf = root / FOUNDATION_REL

    for name in REQUIRED_ROOT_FILES:
        if not (vf / name).is_file():
            errors.append(f"missing visual foundation file: {FOUNDATION_REL / name}")

    manifest_path = vf / "VISUAL-ANCHOR-MANIFEST.json"
    if not manifest_path.is_file():
        return errors

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"invalid visual anchor manifest JSON: {exc}")
        return errors

    anchors = manifest.get("anchors")
    if not isinstance(anchors, list):
        errors.append("visual anchor manifest anchors must be an array")
        return errors

    seen: set[str] = set()
    for anchor in anchors:
        if not isinstance(anchor, dict):
            errors.append("visual anchor record must be an object")
            continue

        anchor_id = anchor.get("id")
        if not anchor_id:
            errors.append("visual anchor missing id")
            continue
        if anchor_id in seen:
            errors.append(f"duplicate visual anchor id: {anchor_id}")
        seen.add(anchor_id)

        status = anchor.get("status")
        if status not in ALLOWED_STATUSES:
            errors.append(f"anchor {anchor_id} has invalid status: {status!r}")
        if not anchor.get("controls"):
            errors.append(f"anchor {anchor_id} controls must be non-empty")
        if not anchor.get("doNotInherit"):
            errors.append(f"anchor {anchor_id} doNotInherit must be non-empty")
        if not anchor.get("provenance"):
            errors.append(f"anchor {anchor_id} provenance is required")

        if status == "LOCKED":
            file_rel = anchor.get("file")
            spec_rel = anchor.get("spec")
            digest = anchor.get("sha256")
            if not digest:
                errors.append(f"anchor {anchor_id} LOCKED requires sha256")
            if not file_rel or not (vf / file_rel).is_file():
                errors.append(f"missing anchor file for {anchor_id}: {file_rel}")
            if not spec_rel or not (vf / spec_rel).is_file():
                errors.append(f"missing anchor spec for {anchor_id}: {spec_rel}")
            if digest and file_rel and (vf / file_rel).is_file():
                actual = _sha256(vf / file_rel)
                if actual != digest:
                    errors.append(
                        f"anchor {anchor_id} sha256 mismatch: expected {digest}, got {actual}"
                    )

    if manifest.get("pv0Status") == "LOCKED":
        gp = vf / "GENERATION/GENERATION-PROFILE-V1.json"
        adapter = vf / "GENERATION/MODEL-ADAPTER-V1.md"
        if not gp.is_file():
            errors.append("PV0 LOCKED requires GENERATION/GENERATION-PROFILE-V1.json")
        if not adapter.is_file():
            errors.append("PV0 LOCKED requires GENERATION/MODEL-ADAPTER-V1.md")

    return errors


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors = validate(root)
    if errors:
        print("Visual foundation validation: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Visual foundation validation: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
