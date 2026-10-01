#!/usr/bin/env python3
"""Validate the canonical DND hidden-object repository structure."""
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote

from validate_visual_foundation import validate as validate_visual_foundation

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []

SCENES = [
    "S01-BALDURS-GATE",
    "S02-CANDLEKEEP",
    "S03-CALIMPORT",
    "S04-MYTH-DRANNOR",
    "S05-ICEWIND-DALE",
    "S06-PORT-NYANZARU",
    "S07-VALLAKI",
    "S08-SALTMARSH",
    "S09-GRACKLSTUGH",
    "S10-MAELSTROM",
    "S11-AVERNUS",
    "S12-WITCHLIGHT-CARNIVAL",
    "S13-ROCK-OF-BRAL",
    "S14-RADIANT-CITADEL",
    "S15-WELL-OF-DRAGONS",
]

TEMPLATES = [
    "LOCATION-RESEARCH-TEMPLATE.md",
    "SUBSCENE-DECISION-TEMPLATE.md",
    "SCENE-STATE-TEMPLATE.md",
    "POPULATION-MODEL-TEMPLATE.md",
    "SPECIES-SCALE-TEMPLATE.md",
    "FACTION-STYLE-TEMPLATE.md",
    "60-CHARACTERS-TEMPLATE.csv",
    "PROPS-CREATURES-TEMPLATE.md",
    "EVENT-ISLANDS-TEMPLATE.md",
    "ACTOR-BLOCKING-TEMPLATE.md",
    "FINAL-PROMPT-TEMPLATE.md",
    "TARGETS-TEMPLATE.json",
    "ANSWER-MAP-TEMPLATE.json",
    "LEVEL-METADATA-TEMPLATE.json",
    "QA-TEMPLATE.md",
]

WORKFLOWS = [
    "01-RESEARCH.md",
    "02-SUBSCENE-SELECTION.md",
    "03-SCENE-STATE.md",
    "04-POPULATION.md",
    "05-SPECIES-SCALE.md",
    "06-FACTION-STYLE.md",
    "07-CHARACTER-ASSETS.md",
    "08-PROPS-CREATURES.md",
    "09-EVENT-ISLANDS.md",
    "10-BLOCKING.md",
    "11-FINAL-SCENE.md",
    "12-SCENE-QA.md",
    "13-HIDDEN-OBJECTS.md",
    "14-LEVEL-DATA-AND-UI.md",
    "15-ARCHIVE.md",
]


def fail(message: str) -> None:
    ERRORS.append(message)


def check_required_paths() -> None:
    required = [
        "README.md",
        "CURRENT.md",
        "ACTIVE-DOCS-INDEX.md",
        "MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md",
        "MASTER/PRODUCTION-STANDARD-V1.md",
        "MASTER/GATE-SYSTEM-V1.md",
        "MASTER/STYLE-LOCK-V1.md",
        "docs/superpowers/specs/2026-10-01-dnd5e-hidden-object-production-system-design.md",
        "docs/superpowers/plans/2026-10-01-dnd5e-hidden-object-repository-bootstrap.md",
        "SCENES/S02-CANDLEKEEP/RESEARCH/01-LOCATION-RESEARCH.md",
        "SCENES/S02-CANDLEKEEP/RESEARCH/02-SUBSCENE-DECISION.md",
        "SCENES/S02-CANDLEKEEP/RESEARCH/03-SCENE-STATE.md",
    ]
    required += [f"WORKFLOW/{name}" for name in WORKFLOWS]
    required += [f"TEMPLATES/{name}" for name in TEMPLATES]
    required += [f"SCENES/{name}/README.md" for name in SCENES]
    for rel in required:
        if not (ROOT / rel).is_file():
            fail(f"missing required file: {rel}")


def check_workflow_sequence() -> None:
    workflow_dir = ROOT / "WORKFLOW"
    if not workflow_dir.is_dir():
        fail("missing WORKFLOW directory")
        return
    files = sorted(p.name for p in workflow_dir.glob("*.md"))
    if files != WORKFLOWS:
        fail(f"workflow set/order mismatch: expected {WORKFLOWS!r}, got {files!r}")
        return
    nums = [int(name.split("-", 1)[0]) for name in files]
    if nums != list(range(1, 16)):
        fail(f"workflow numbering must be 01–15; got {nums!r}")


def check_gate_definitions() -> None:
    path = ROOT / "MASTER/GATE-SYSTEM-V1.md"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8").upper()
    for gate in range(8):
        if f"GATE {gate}" not in text:
            fail(f"MASTER/GATE-SYSTEM-V1.md missing Gate {gate} definition")


def load_json(rel: str):
    path = ROOT / rel
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"invalid JSON in {rel}: {exc}")
        return None


def check_json_templates() -> None:
    t = load_json("TEMPLATES/TARGETS-TEMPLATE.json")
    a = load_json("TEMPLATES/ANSWER-MAP-TEMPLATE.json")
    m = load_json("TEMPLATES/LEVEL-METADATA-TEMPLATE.json")
    if not all(isinstance(x, dict) for x in (t, a, m)):
        return
    level_ids = [t.get("levelId"), a.get("levelId"), m.get("levelId")]
    if len(set(level_ids)) != 1 or not level_ids[0]:
        fail(f"template levelId mismatch: {level_ids!r}")
    if a.get("coordinateSystem") != "normalized-0-1":
        fail("ANSWER-MAP-TEMPLATE.json coordinateSystem must be normalized-0-1")
    targets = t.get("targets")
    if not isinstance(targets, list) or not targets:
        fail("TARGETS-TEMPLATE.json must contain a non-empty example targets array")
    answers = a.get("answers")
    if not isinstance(answers, dict) or not answers:
        fail("ANSWER-MAP-TEMPLATE.json must contain example answers keyed by target ID")
        return

    required_target_fields = {
        "id", "name", "type", "sceneRegion", "answerRef", "difficulty",
        "eventIslandId", "clue", "thumbnail", "required",
    }
    for target in targets:
        if not isinstance(target, dict):
            fail("target entry must be an object")
            continue
        missing = sorted(required_target_fields - target.keys())
        if missing:
            fail(f"target {target.get('id')} missing fields: {missing}")
        answer_ref = target.get("answerRef")
        if answer_ref not in answers:
            fail(f"target {target.get('id')} answerRef {answer_ref!r} does not resolve in answer-map")

    if m.get("targetsFile") != "targets.json":
        fail("LEVEL-METADATA-TEMPLATE.json targetsFile must be targets.json")
    if m.get("answerMapFile") != "answer-map.json":
        fail("LEVEL-METADATA-TEMPLATE.json answerMapFile must be answer-map.json")


def check_character_template() -> None:
    path = ROOT / "TEMPLATES/60-CHARACTERS-TEMPLATE.csv"
    if not path.is_file():
        return
    try:
        with path.open(encoding="utf-8", newline="") as fh:
            rows = list(csv.DictReader(fh))
    except Exception as exc:
        fail(f"cannot parse character CSV: {exc}")
        return
    if len(rows) != 60:
        fail(f"character template must contain exactly 60 default rows; got {len(rows)}")
        return
    if rows[0].get("ID") != "C01" or rows[-1].get("ID") != "C60":
        fail("character template IDs must run from C01 through C60")


def check_scene_set() -> None:
    scene_root = ROOT / "SCENES"
    if not scene_root.is_dir():
        fail("missing SCENES directory")
        return
    actual = sorted(p.name for p in scene_root.iterdir() if p.is_dir() and p.name.startswith("S"))
    expected = sorted(SCENES)
    if actual != expected:
        fail(f"scene workspace set mismatch: expected {expected!r}, got {actual!r}")


def check_current_state() -> None:
    scene_readme = ROOT / "SCENES/S02-CANDLEKEEP/README.md"
    current = ROOT / "CURRENT.md"
    if scene_readme.is_file():
        text = scene_readme.read_text(encoding="utf-8")
        required = [
            "Gate 0 — Lore Lock: **APPROVED**",
            "Gate 1 — Scene Lock: **APPROVED**",
            "Gate 2 — Population Lock: **NEXT**",
        ]
        for item in required:
            if item not in text:
                fail(f"Candlekeep README missing required state: {item}")
        if "Gate 2 = APPROVED" in text or "Gate 2 — Population Lock: **APPROVED**" in text:
            fail("Candlekeep must not claim Gate 2 approved during bootstrap")
    if current.is_file():
        text = current.read_text(encoding="utf-8")
        if "S02 — CANDLEKEEP" not in text or "Gate 2 — Population Lock: **NEXT**" not in text:
            fail("CURRENT.md must identify Candlekeep with Gate 2 NEXT")


def check_master_integrity() -> None:
    research = ROOT / "MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md"
    production = ROOT / "MASTER/PRODUCTION-STANDARD-V1.md"

    if research.is_file():
        text = research.read_text(encoding="utf-8")
        lines = text.splitlines()
        if len(lines) < 2500:
            fail(f"master research appears truncated: {len(lines)} lines")
        for required_marker in ["# AI.", "# AJ.", "15关 × SRD资产映射矩阵"]:
            if required_marker not in text:
                fail(f"master research missing integrity marker: {required_marker}")

    if production.is_file():
        text = production.read_text(encoding="utf-8")
        lines = text.splitlines()
        if len(lines) < 800:
            fail(f"production standard appears truncated: {len(lines)} lines")
        if "# 21." not in text:
            fail("production standard missing final section # 21")
        if "GATE 7" not in text.upper():
            fail("production standard must reflect approved Gate 0–7 system")


def check_visual_foundation() -> None:
    ERRORS.extend(validate_visual_foundation(ROOT))


LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")


def _without_fenced_code(text: str) -> str:
    out: list[str] = []
    in_fence = False
    for line in text.splitlines():
        if line.lstrip().startswith(chr(96) * 3):
            in_fence = not in_fence
            continue
        if not in_fence:
            out.append(line)
    return "\n".join(out)


def check_markdown_links() -> None:
    for md in ROOT.rglob("*.md"):
        text = _without_fenced_code(md.read_text(encoding="utf-8"))
        for raw in LINK_RE.findall(text):
            target = raw.strip()
            if not target:
                continue
            if target.startswith("<") and target.endswith(">"):
                target = target[1:-1]
            lower = target.lower()
            if lower.startswith(("http://", "https://", "mailto:", "data:", "#")):
                continue
            if "{{" in target or "}}" in target or "<placeholder" in lower:
                continue
            if chr(96) in target:
                fail(f"invalid backtick in relative Markdown link: {md.relative_to(ROOT)} -> {target}")
                continue
            path_part = target.split("#", 1)[0].split("?", 1)[0].strip()
            if not path_part:
                continue
            resolved = (md.parent / unquote(path_part)).resolve()
            if not resolved.exists():
                fail(f"broken relative Markdown link: {md.relative_to(ROOT)} -> {target}")


def main() -> int:
    check_required_paths()
    check_workflow_sequence()
    check_gate_definitions()
    check_json_templates()
    check_character_template()
    check_scene_set()
    check_current_state()
    check_master_integrity()
    check_visual_foundation()
    check_markdown_links()

    if ERRORS:
        print("DND repository validation: FAIL")
        for message in ERRORS:
            print(f"- {message}")
        return 1
    print("DND repository validation: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
