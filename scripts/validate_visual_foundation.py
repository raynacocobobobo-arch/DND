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
    "VISUAL-ASSET-ANNOTATION-CONTRACT-V1.md",
]


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()



def _check_ui_and_generation(root: Path, errors: list[str], pv0_status: str | None) -> None:
    vf = root / FOUNDATION_REL
    ui = vf / "UI"
    generation = vf / "GENERATION"

    required_ui = [
        "UI-SPEC-V1.md",
        "UI-TOKENS-V1.json",
        "UI-COMPONENTS-V1.svg",
        "UI-COMPONENT-BOARD-V1.png",
    ]
    for name in required_ui:
        if not (ui / name).is_file():
            errors.append(f"missing deterministic UI source/review file: {FOUNDATION_REL / 'UI' / name}")

    token_path = ui / "UI-TOKENS-V1.json"
    if token_path.is_file():
        try:
            tokens = json.loads(token_path.read_text(encoding="utf-8"))
            for key in ["version", "referenceCanvas", "layout", "geometry", "typography", "palette", "rules"]:
                if key not in tokens:
                    errors.append(f"UI tokens missing key: {key}")
            rules = tokens.get("rules", {})
            if rules.get("uiInSceneArt") is not False:
                errors.append("UI tokens must set rules.uiInSceneArt to false")
            layout = tokens.get("layout", {})
            for key in ["safeMarginRatio", "bottomBarHeightRatio", "visibleTargetSlots", "targetSlotAspectRatio"]:
                if key not in layout:
                    errors.append(f"UI tokens layout missing key: {key}")
        except Exception as exc:
            errors.append(f"invalid UI-TOKENS-V1.json: {exc}")

    profile_path = generation / "GENERATION-PROFILE-V1.json"
    adapter_path = generation / "MODEL-ADAPTER-V1.md"
    if not profile_path.is_file():
        errors.append(f"missing Generation Profile: {FOUNDATION_REL / 'GENERATION/GENERATION-PROFILE-V1.json'}")
    else:
        try:
            profile = json.loads(profile_path.read_text(encoding="utf-8"))
            for key in ["profileVersion", "provider", "modelFamily", "modelVersion", "targetAspectRatio", "referenceRoles", "promptVersion", "seedPolicy", "uiInSceneArt"]:
                if key not in profile:
                    errors.append(f"Generation Profile missing key: {key}")
            if profile.get("uiInSceneArt") is not False:
                errors.append("Generation Profile uiInSceneArt must be false")
        except Exception as exc:
            errors.append(f"invalid GENERATION-PROFILE-V1.json: {exc}")
    if not adapter_path.is_file():
        errors.append(f"missing Model Adapter: {FOUNDATION_REL / 'GENERATION/MODEL-ADAPTER-V1.md'}")

    if pv0_status == "LOCKED" and not (ui / "UI-FULL-MOCKUP-V1.png").is_file():
        errors.append("PV0 LOCKED requires UI/UI-FULL-MOCKUP-V1.png")

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

        # All planned VA01–VA08 anchors require their textual spec even while DRAFT.
        if isinstance(anchor_id, str) and anchor_id.startswith(("VA01", "VA02", "VA03", "VA04", "VA05", "VA06", "VA07", "VA08")):
            spec_rel = anchor.get("spec")
            if not spec_rel or not (vf / spec_rel).is_file():
                errors.append(f"planned VA01–VA08 spec missing for {anchor_id}: {spec_rel}")

        if status == "LOCKED":
            file_rel = anchor.get("file")
            spec_rel = anchor.get("spec")
            annotations_rel = anchor.get("annotations")
            digest = anchor.get("sha256")
            annotations_digest = anchor.get("annotationsSha256")
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
            if not annotations_rel or not (vf / annotations_rel).is_file():
                errors.append(f"missing annotations file for {anchor_id}: {annotations_rel}")
            if not annotations_digest:
                errors.append(f"anchor {anchor_id} LOCKED requires annotationsSha256")
            if annotations_rel and (vf / annotations_rel).is_file():
                try:
                    annotations = json.loads((vf / annotations_rel).read_text(encoding="utf-8"))
                    for key in ["assetId","assetVersion","boardFile","specFile","status","controls","doNotInherit","samples","invariants","variables","forbiddenMisreads"]:
                        if key not in annotations:
                            errors.append(f"annotations for {anchor_id} missing key: {key}")
                    if annotations.get("assetId") != anchor_id:
                        errors.append(f"annotations assetId mismatch for {anchor_id}: {annotations.get('assetId')}")
                    for key in ["controls","doNotInherit","samples","invariants","variables","forbiddenMisreads"]:
                        if not annotations.get(key):
                            errors.append(f"annotations for {anchor_id} require non-empty {key}")
                except Exception as exc:
                    errors.append(f"invalid annotations JSON for {anchor_id}: {exc}")
            if annotations_digest and annotations_rel and (vf / annotations_rel).is_file():
                actual_annotations = _sha256(vf / annotations_rel)
                if actual_annotations != annotations_digest:
                    errors.append(
                        f"anchor {anchor_id} annotationsSha256 mismatch: expected {annotations_digest}, got {actual_annotations}"
                    )

    # planned VA01–VA08 spec presence check is intentionally stricter than image presence:
    # specs must exist before image generation; images may remain DRAFT.
    _check_ui_and_generation(root, errors, manifest.get("pv0Status"))

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
