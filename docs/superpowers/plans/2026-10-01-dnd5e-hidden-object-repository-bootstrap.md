# D&D 5E Hidden-Object Repository Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap `raynacocobobobo-arch/DND` into the canonical production workspace for 15 complete, game-ready D&D / 5E Hidden-Object levels.

**Architecture:** The repository is documentation-first and gate-driven. Root navigation points to four shared systems (`MASTER/`, `WORKFLOW/`, `TEMPLATES/`, and `SCENES/`); every scene moves through Gates 0–7 and eventually yields a `LEVEL/` package with scene art plus structured hidden-object data. The first bootstrap populates the shared production OS, creates all 15 scene workspaces, and instantiates Candlekeep through Gate 1 without pretending the remaining scenes are production-ready.

**Tech Stack:** Markdown, CSV, JSON, Git/GitHub, Python 3 standard library for repository validation.

**Spec:** `docs/superpowers/specs/2026-10-01-dnd5e-hidden-object-production-system-design.md`

## Global Constraints

- Final product mission: 15 complete, game-ready D&D / 5E Hidden-Object levels.
- Research documents, 55–70-character casting assets, prompts, blocking and style boards are production assets, not the final product.
- Evidence labels are limited to `【SRD-5.1】`, `【SRD-5.2.1】`, `【OFFICIAL-SETTING】`, `【OFFICIAL-INDEX】`, and `【PROJECT】`.
- `【PROJECT】` decisions must never be presented as official lore.
- Scene logic outranks a rigid 60-character quota; the normal target is approximately 55–70 readable figures.
- Every level must pass Gates 0–7 in order; later stages do not start before the required gate is approved.
- Characters remain the visual subject; weak/compressed perspective is the global composition rule.
- Hidden-object design begins only after Scene QC / Gate 5.
- Level packaging must include final scene, targets, answer locations, clues/icons, UI, and metadata.
- Global art direction remains: clean black hand-drawn line, flat color + restrained cel shading, ~5–5.5 heads, non-chibi, readable faces/hands, no DOF, no painterly/3D/cinematic drift.
- Do not create new workflow versions to solve local image problems; use the correction hierarchy in the spec.
- Do not overwrite or reinterpret official-setting uncertainties; mark them as `【OFFICIAL-INDEX】` or unresolved.
- Initial bootstrap does not generate final scene art and does not claim all 15 levels are production-ready.

## Review Focus

1. **Lore vs project inference:** a reader must be able to tell sourced facts from project choices at a glance.
2. **Gate dependency integrity:** no workflow document may imply that a later stage can bypass an unapproved earlier gate.
3. **Scene folder authority:** unstarted scenes must not contain invented “completed” research; Candlekeep alone is instantiated through Gate 1.
4. **Game-level handoff completeness:** target/answer/metadata templates must be internally consistent and capable of representing a future playable level.
5. **Navigation integrity:** root docs and index links must resolve without stale filenames or duplicate canonical documents.

---

## File Structure

The implementation creates or modifies these files.

### Root

- `README.md` — project mission, navigation, 15-level list, gate summary, final deliverable contract.
- `CURRENT.md` — live operational state; Candlekeep is the active level and Gate 2 is the next actionable gate after approved Gate 0–1.
- `ACTIVE-DOCS-INDEX.md` — canonical authority map for all current shared documents and active scene files.

### MASTER

- `MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md` — existing master research migrated verbatim except for a short repository header if needed.
- `MASTER/PRODUCTION-STANDARD-V1.md` — existing production standard updated only where the approved spec supersedes it (final product = level, Gates 0–7, 55–70 norm).
- `MASTER/GATE-SYSTEM-V1.md` — standalone operational Gate 0–7 definition.
- `MASTER/STYLE-LOCK-V1.md` — canonical visual style and anti-drift rules.

### WORKFLOW

- `WORKFLOW/01-RESEARCH.md`
- `WORKFLOW/02-SUBSCENE-SELECTION.md`
- `WORKFLOW/03-SCENE-STATE.md`
- `WORKFLOW/04-POPULATION.md`
- `WORKFLOW/05-SPECIES-SCALE.md`
- `WORKFLOW/06-FACTION-STYLE.md`
- `WORKFLOW/07-CHARACTER-ASSETS.md`
- `WORKFLOW/08-PROPS-CREATURES.md`
- `WORKFLOW/09-EVENT-ISLANDS.md`
- `WORKFLOW/10-BLOCKING.md`
- `WORKFLOW/11-FINAL-SCENE.md`
- `WORKFLOW/12-SCENE-QA.md`
- `WORKFLOW/13-HIDDEN-OBJECTS.md`
- `WORKFLOW/14-LEVEL-DATA-AND-UI.md`
- `WORKFLOW/15-ARCHIVE.md`

Each workflow file has one responsibility, inputs, outputs, applicable gate, pass criteria, and failure return path.

### TEMPLATES

- `TEMPLATES/LOCATION-RESEARCH-TEMPLATE.md`
- `TEMPLATES/SUBSCENE-DECISION-TEMPLATE.md`
- `TEMPLATES/SCENE-STATE-TEMPLATE.md`
- `TEMPLATES/POPULATION-MODEL-TEMPLATE.md`
- `TEMPLATES/SPECIES-SCALE-TEMPLATE.md`
- `TEMPLATES/FACTION-STYLE-TEMPLATE.md`
- `TEMPLATES/60-CHARACTERS-TEMPLATE.csv`
- `TEMPLATES/PROPS-CREATURES-TEMPLATE.md`
- `TEMPLATES/EVENT-ISLANDS-TEMPLATE.md`
- `TEMPLATES/ACTOR-BLOCKING-TEMPLATE.md`
- `TEMPLATES/FINAL-PROMPT-TEMPLATE.md`
- `TEMPLATES/TARGETS-TEMPLATE.json`
- `TEMPLATES/ANSWER-MAP-TEMPLATE.json`
- `TEMPLATES/LEVEL-METADATA-TEMPLATE.json`
- `TEMPLATES/QA-TEMPLATE.md`

### SCENES

Each of the 15 scene folders receives `README.md` as its status/entry file so Git tracks the directory.

- `SCENES/S01-BALDURS-GATE/README.md`
- `SCENES/S02-CANDLEKEEP/README.md`
- `SCENES/S03-CALIMPORT/README.md`
- `SCENES/S04-MYTH-DRANNOR/README.md`
- `SCENES/S05-ICEWIND-DALE/README.md`
- `SCENES/S06-PORT-NYANZARU/README.md`
- `SCENES/S07-VALLAKI/README.md`
- `SCENES/S08-SALTMARSH/README.md`
- `SCENES/S09-GRACKLSTUGH/README.md`
- `SCENES/S10-MAELSTROM/README.md`
- `SCENES/S11-AVERNUS/README.md`
- `SCENES/S12-WITCHLIGHT-CARNIVAL/README.md`
- `SCENES/S13-ROCK-OF-BRAL/README.md`
- `SCENES/S14-RADIANT-CITADEL/README.md`
- `SCENES/S15-WELL-OF-DRAGONS/README.md`

Candlekeep also receives:

- `SCENES/S02-CANDLEKEEP/RESEARCH/01-LOCATION-RESEARCH.md`
- `SCENES/S02-CANDLEKEEP/RESEARCH/02-SUBSCENE-DECISION.md`
- `SCENES/S02-CANDLEKEEP/RESEARCH/03-SCENE-STATE.md`

Those files contain only the already established Gate 0–1 material and clearly mark unresolved details.

### Validation

- `scripts/validate_repo.py` — standard-library validator for required paths, Gate 0–7 terms, JSON template validity, 60-character template row count, active-scene state, and Markdown link targets.

---

# Task 1: Establish Root Project Navigation

**Files:**
- Create: `README.md`
- Create: `CURRENT.md`
- Create: `ACTIVE-DOCS-INDEX.md`
- Test via: `python3 - <<'PY' ... PY`

- [ ] **Step 1: Write a failing root-document existence check**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
required = ["README.md", "CURRENT.md", "ACTIVE-DOCS-INDEX.md"]
missing = [p for p in required if not Path(p).exists()]
assert not missing, f"missing root docs: {missing}"
PY
```

Expected: assertion failure listing all three files.

- [ ] **Step 2: Create `README.md`**

Include:
- one-sentence final mission;
- explicit statement that the final product is 15 complete game-ready levels, not research or illustrations;
- source/evidence policy;
- 15 locked levels;
- Gate 0–7 summary;
- final per-level `RESEARCH / PRODUCTION / LEVEL` contract;
- links to `CURRENT.md`, `ACTIVE-DOCS-INDEX.md`, `MASTER/`, `WORKFLOW/`, `TEMPLATES/`, and `SCENES/`.

- [ ] **Step 3: Create `CURRENT.md`**

Set:
- active level: `S02-CANDLEKEEP`;
- last approved package: Gate 0 + Gate 1;
- current next gate: Gate 2 — Population Lock;
- approved subscene: Court of Air / visitor interface;
- approved scene state: Seekers are being registered/routed while normal Avowed operations and Endless Chant continue;
- blockers: official body/map details still requiring verification must remain listed;
- next action: population model + species scale + faction/culture visual language.

- [ ] **Step 4: Create `ACTIVE-DOCS-INDEX.md`**

Index:
- approved spec;
- future master files;
- future workflow files;
- templates;
- active Candlekeep Gate 0–1 files;
- status labels: canonical / active / template / superseded.

Do not mark files canonical before they exist.

- [ ] **Step 5: Re-run root-document existence check**

Expected: exit 0.

- [ ] **Step 6: Verify mission wording**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
r = Path("README.md").read_text()
c = Path("CURRENT.md").read_text()
assert "15" in r and "Hidden-Object" in r
assert "game-ready" in r.lower() or "game ready" in r.lower()
assert "Gate 2" in c
assert "CANDLEKEEP" in c.upper()
print("root mission/state check: PASS")
PY
```

Expected: `root mission/state check: PASS`.

- [ ] **Step 7: Commit**

```bash
git add README.md CURRENT.md ACTIVE-DOCS-INDEX.md
git commit -m "docs: establish DND hidden-object project navigation"
```

---

# Task 2: Install the Shared Master Documents

**Files:**
- Create: `MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md`
- Create: `MASTER/PRODUCTION-STANDARD-V1.md`
- Create: `MASTER/GATE-SYSTEM-V1.md`
- Create: `MASTER/STYLE-LOCK-V1.md`
- Modify: `ACTIVE-DOCS-INDEX.md`
- Modify: `README.md`

- [ ] **Step 1: Write failing master-doc presence check**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
required = [
 "MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md",
 "MASTER/PRODUCTION-STANDARD-V1.md",
 "MASTER/GATE-SYSTEM-V1.md",
 "MASTER/STYLE-LOCK-V1.md",
]
missing=[p for p in required if not Path(p).exists()]
assert not missing, missing
PY
```

Expected: failure with four missing paths.

- [ ] **Step 2: Add the existing master research document**

Source authority: current conversation artifact `DND5E_MASTER_RESEARCH_AND_15_SCENES_V1.md`.

Preserve the researched content. Add only a repository header if necessary stating:
- evidence label policy;
- this is research substrate, not final deliverable;
- approved spec supersedes any older “15 illustrations = final product” wording.

- [ ] **Step 3: Add and reconcile the production standard**

Source authority: current conversation artifact `DND5E_HIDDEN_OBJECT_PRODUCTION_STANDARD_V1.md`.

Reconcile only the approved superseding decisions:
- final product = 15 level packages;
- normal casting range = 55–70, approximately 60;
- Gate system = 0–7;
- hidden-object lock and level lock are separate;
- level data is required.

Do not silently rewrite unrelated workflow logic.

- [ ] **Step 4: Create standalone `GATE-SYSTEM-V1.md`**

For every Gate 0–7 include:
- purpose;
- input;
- pass conditions;
- fail return;
- unlock;
- human approval requirement.

Add a one-line hard rule:
> No downstream production starts before the required gate is explicitly approved.

- [ ] **Step 5: Create `STYLE-LOCK-V1.md`**

Canonical constraints:
- clean European fantasy adventure ensemble comic;
- black hand-drawn line;
- flat color + restrained cel shading;
- 5–5.5 heads;
- non-chibi;
- readable faces and hands;
- species silhouette stability;
- weak/compressed perspective;
- foreground 105–110%, mid 100%, rear/platform 85–90%;
- background one detail level simpler;
- characters act, do not pose;
- no DOF, painterly, realistic 3D, cinematic concept-art drift.

Include the accepted-project principle:
> “a character comic that contains a setting,” not “a big setting containing many characters.”

- [ ] **Step 6: Update root navigation/index**

Add links to all four master documents and mark them canonical.

- [ ] **Step 7: Verify Gate completeness and style anchors**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
g=Path("MASTER/GATE-SYSTEM-V1.md").read_text()
s=Path("MASTER/STYLE-LOCK-V1.md").read_text()
for n in range(8):
    assert f"GATE {n}" in g.upper(), n
for phrase in ["5–5.5", "105–110", "85–90", "background"]:
    assert phrase.lower() in s.lower(), phrase
print("master gate/style check: PASS")
PY
```

Expected: `master gate/style check: PASS`.

- [ ] **Step 8: Commit**

```bash
git add MASTER README.md ACTIVE-DOCS-INDEX.md
git commit -m "docs: install master research production gates and style"
```

---

# Task 3: Create the Canonical Workflow Documents

**Files:**
- Create all 15 `WORKFLOW/*.md` files listed above.
- Modify: `README.md`
- Modify: `ACTIVE-DOCS-INDEX.md`

- [ ] **Step 1: Write failing workflow count check**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
files=sorted(Path("WORKFLOW").glob("*.md")) if Path("WORKFLOW").exists() else []
assert len(files)==15, f"expected 15 workflow docs, got {len(files)}"
PY
```

Expected: failure.

- [ ] **Step 2: Create Workflow 01–03**

Each file contains:
- Purpose
- Inputs
- Required work
- Output file
- Evidence rules
- Gate relationship
- Pass criteria
- Failure return
- “Do not” list

01: official research  
02: subscene selection  
03: scene state

- [ ] **Step 3: Create Workflow 04–08**

04: population model  
05: species scale  
06: faction/culture visual language  
07: character assets  
08: props/creatures

Important:
- Workflow 07 says approximately 55–70 people, default around 60;
- one scene = one casting set;
- no global actor library.

- [ ] **Step 4: Create Workflow 09–12**

09: event islands  
10: actor blocking  
11: final scene  
12: scene QA

Important:
- 8–12 event islands;
- 3–7 people typical per island;
- weak perspective;
- characters arranged before final background;
- scene must pass without UI.

- [ ] **Step 5: Create Workflow 13–15**

13: hidden-object design  
14: level data + UI  
15: archive/state update

Workflow 14 must define the minimum fields shared by targets, answer map and metadata.

- [ ] **Step 6: Verify 15 workflow docs and stage ordering**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
files=sorted(Path("WORKFLOW").glob("*.md"))
assert len(files)==15
nums=[int(p.name.split("-")[0]) for p in files]
assert nums==list(range(1,16)), nums
print("workflow sequence check: PASS")
PY
```

Expected: `workflow sequence check: PASS`.

- [ ] **Step 7: Update navigation/index and commit**

```bash
git add WORKFLOW README.md ACTIVE-DOCS-INDEX.md
git commit -m "docs: add canonical 15-stage production workflow"
```

---

# Task 4: Create Reusable Research, Production, and Level Templates

**Files:**
- Create all `TEMPLATES/*` files listed in File Structure.
- Modify: `ACTIVE-DOCS-INDEX.md`

- [ ] **Step 1: Write failing template existence and JSON-parse check**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
import json
required=[
 "LOCATION-RESEARCH-TEMPLATE.md","SUBSCENE-DECISION-TEMPLATE.md",
 "SCENE-STATE-TEMPLATE.md","POPULATION-MODEL-TEMPLATE.md",
 "SPECIES-SCALE-TEMPLATE.md","FACTION-STYLE-TEMPLATE.md",
 "60-CHARACTERS-TEMPLATE.csv","PROPS-CREATURES-TEMPLATE.md",
 "EVENT-ISLANDS-TEMPLATE.md","ACTOR-BLOCKING-TEMPLATE.md",
 "FINAL-PROMPT-TEMPLATE.md","TARGETS-TEMPLATE.json",
 "ANSWER-MAP-TEMPLATE.json","LEVEL-METADATA-TEMPLATE.json","QA-TEMPLATE.md"
]
missing=[n for n in required if not (Path("TEMPLATES")/n).exists()]
assert not missing, missing
for n in ["TARGETS-TEMPLATE.json","ANSWER-MAP-TEMPLATE.json","LEVEL-METADATA-TEMPLATE.json"]:
    json.loads((Path("TEMPLATES")/n).read_text())
PY
```

Expected: failure due to missing files.

- [ ] **Step 2: Create the Markdown templates**

Use the already established template package as the base, then update:
- 55–70 casting language;
- Gate 0–7 references;
- RESEARCH / PRODUCTION / LEVEL structure;
- final level data requirements.

- [ ] **Step 3: Create `60-CHARACTERS-TEMPLATE.csv`**

Columns:
```text
ID,Species,Sex,Age,Height,BodyType,FactionCulture,SocialRole,
ClassOrNPCArchetype,Clothing,Armor,Weapon,Tool,CarryItem,
ActionTendency,Expression,InteractionTarget,VisualPriority,EvidenceTag
```

Provide 60 blank rows `C01`–`C60` as the default sheet. Document elsewhere that scene logic may justify 55–70.

- [ ] **Step 4: Create `TARGETS-TEMPLATE.json`**

Use a valid JSON example with:
- `levelId`;
- `version`;
- `targets` array.

Each target example contains:
- `id`;
- `name`;
- `type`;
- `sceneRegion`;
- `answerRef`;
- `difficulty`;
- `eventIslandId`;
- `clue`;
- `thumbnail`;
- `required`.

Do not hard-code final coordinates in the template.

- [ ] **Step 5: Create `ANSWER-MAP-TEMPLATE.json`**

Use a valid example:
- `levelId`;
- `coordinateSystem`: documented placeholder such as `normalized-0-1`;
- `answers` keyed by target ID;
- each answer has a representative `bounds` object.

This selects normalized coordinates as the initial interoperable convention for the bootstrap. If the actual game implementation later requires pixels or polygons, that is a versioned interface change.

- [ ] **Step 6: Create `LEVEL-METADATA-TEMPLATE.json`**

Fields:
- `levelId`;
- `title`;
- `scene`;
- `subscene`;
- `version`;
- `gateStatus`;
- `sceneImage`;
- `targetsFile`;
- `answerMapFile`;
- `targetCount`;
- `notes`.

- [ ] **Step 7: Verify CSV row count and JSON cross-contract**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
import csv,json
rows=list(csv.DictReader(Path("TEMPLATES/60-CHARACTERS-TEMPLATE.csv").open()))
assert len(rows)==60, len(rows)
assert rows[0]["ID"]=="C01" and rows[-1]["ID"]=="C60"
t=json.loads(Path("TEMPLATES/TARGETS-TEMPLATE.json").read_text())
a=json.loads(Path("TEMPLATES/ANSWER-MAP-TEMPLATE.json").read_text())
m=json.loads(Path("TEMPLATES/LEVEL-METADATA-TEMPLATE.json").read_text())
assert t["levelId"]==a["levelId"]==m["levelId"]
assert a["coordinateSystem"]=="normalized-0-1"
print("template contract check: PASS")
PY
```

Expected: `template contract check: PASS`.

- [ ] **Step 8: Update index and commit**

```bash
git add TEMPLATES ACTIVE-DOCS-INDEX.md
git commit -m "docs: add reusable research production and level templates"
```

---

# Task 5: Create All 15 Scene Workspaces

**Files:**
- Create `README.md` in each of the 15 `SCENES/SXX-.../` directories.
- Modify: `README.md`
- Modify: `ACTIVE-DOCS-INDEX.md`

- [ ] **Step 1: Write failing scene count check**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
dirs=sorted([p for p in Path("SCENES").glob("S*") if p.is_dir()]) if Path("SCENES").exists() else []
assert len(dirs)==15, f"expected 15 scene dirs, got {len(dirs)}"
PY
```

Expected: failure.

- [ ] **Step 2: Create the 15 scene README files**

Each README includes:
- ID;
- official location;
- locked representative subscene;
- current status;
- current gate;
- last approved gate;
- link to master workflow;
- warning that a placeholder scene is not a lore claim.

All scenes except Candlekeep:
- status = `NOT STARTED`;
- current gate = `GATE 0 — Lore Lock`;
- no fabricated research content.

Candlekeep:
- status = `ACTIVE`;
- Gate 0 + Gate 1 approved;
- next = Gate 2.

- [ ] **Step 3: Verify exact 15 names**

Run a Python assertion against the exact folder-name list in the approved spec.

Expected: PASS.

- [ ] **Step 4: Update root/index and commit**

```bash
git add SCENES README.md ACTIVE-DOCS-INDEX.md
git commit -m "docs: create all 15 hidden-object level workspaces"
```

---

# Task 6: Instantiate Candlekeep Through Gate 1

**Files:**
- Create: `SCENES/S02-CANDLEKEEP/RESEARCH/01-LOCATION-RESEARCH.md`
- Create: `SCENES/S02-CANDLEKEEP/RESEARCH/02-SUBSCENE-DECISION.md`
- Create: `SCENES/S02-CANDLEKEEP/RESEARCH/03-SCENE-STATE.md`
- Modify: `SCENES/S02-CANDLEKEEP/README.md`
- Modify: `CURRENT.md`
- Modify: `ACTIVE-DOCS-INDEX.md`

- [ ] **Step 1: Write failing Candlekeep Gate 0–1 file check**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
base=Path("SCENES/S02-CANDLEKEEP/RESEARCH")
required=["01-LOCATION-RESEARCH.md","02-SUBSCENE-DECISION.md","03-SCENE-STATE.md"]
missing=[n for n in required if not (base/n).exists()]
assert not missing, missing
PY
```

Expected: failure.

- [ ] **Step 2: Add the established Candlekeep location research**

Use the current conversation's Gate A material as source.

Preserve:
- Candlekeep as fortress-like knowledge institution;
- Sea of Swords cliff / walls / towers;
- Seekers;
- written-work admission;
- Avowed roles;
- Endless Chant;
- SRD mapping;
- explicit unresolved map/body-text details.

Do not upgrade unresolved details to official fact.

- [ ] **Step 3: Add subscene decision**

Final selection:
- `Court of Air / visitor interface`.

Include candidate scoring and explicit exclusions:
- Great Library interior;
- Exaltation;
- Miirym/subterranean area;
- unrelated Mysteries incidents.

- [ ] **Step 4: Add scene state**

Lock as `【PROJECT】` where appropriate:
- morning around 10:30;
- fair/coastal windy conditions;
- new Seekers being registered/routed;
- Endless Chant crosses the public area;
- normal institutional work continues;
- no combat/mystery outbreak.

- [ ] **Step 5: Update Candlekeep status**

Set:
- Gate 0 = APPROVED;
- Gate 1 = APPROVED;
- Gate 2 = NEXT;
- next deliverables = population model, species scale, faction/culture visual language.

- [ ] **Step 6: Verify no premature Gate 2 claim**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
r=Path("SCENES/S02-CANDLEKEEP/README.md").read_text()
assert "Gate 0" in r and "APPROVED" in r
assert "Gate 1" in r and "APPROVED" in r
assert "Gate 2" in r and "NEXT" in r
assert "Gate 2 = APPROVED" not in r
print("Candlekeep gate-state check: PASS")
PY
```

Expected: `Candlekeep gate-state check: PASS`.

- [ ] **Step 7: Commit**

```bash
git add SCENES/S02-CANDLEKEEP CURRENT.md ACTIVE-DOCS-INDEX.md
git commit -m "docs: instantiate Candlekeep through gate 1"
```

---

# Task 7: Add Repository Validation

**Files:**
- Create: `scripts/validate_repo.py`
- Modify: `README.md`

- [ ] **Step 1: Write validator acceptance checklist before implementation**

The validator must fail non-zero on:
- missing required root/master/workflow/template/scene files;
- fewer or more than 15 scene workspaces;
- workflow numbering not 01–15;
- missing Gate 0–7 definitions;
- invalid JSON templates;
- character template not containing exactly 60 default rows;
- mismatched template `levelId` values;
- Candlekeep not identifying Gate 2 as NEXT;
- broken relative Markdown links in tracked `.md` files, excluding external URLs and image placeholders.

- [ ] **Step 2: Implement `scripts/validate_repo.py` using Python standard library only**

No third-party dependencies.

Functions should remain focused:
- `check_required_paths()`
- `check_workflow_sequence()`
- `check_gate_definitions()`
- `check_json_templates()`
- `check_character_template()`
- `check_scene_set()`
- `check_current_state()`
- `check_markdown_links()`

Return non-zero if any check fails.

- [ ] **Step 3: Run validator**

```bash
python3 scripts/validate_repo.py
```

Expected:
```text
DND repository validation: PASS
```

- [ ] **Step 4: Negative-test one validator condition**

Temporarily move or rename a required file in the isolated worktree:

```bash
mv WORKFLOW/15-ARCHIVE.md WORKFLOW/15-ARCHIVE.md.tmp
python3 scripts/validate_repo.py
```

Expected: non-zero and explicit missing-path/workflow failure.

Restore:

```bash
mv WORKFLOW/15-ARCHIVE.md.tmp WORKFLOW/15-ARCHIVE.md
python3 scripts/validate_repo.py
```

Expected: PASS.

- [ ] **Step 5: Add validation instructions to README**

Include:
```bash
python3 scripts/validate_repo.py
```

- [ ] **Step 6: Commit**

```bash
git add scripts README.md
git commit -m "chore: add repository structure validator"
```

---

# Task 8: Final Bootstrap Verification and Canonical-State Review

**Files:**
- Modify only if verification exposes issues:
  - `README.md`
  - `CURRENT.md`
  - `ACTIVE-DOCS-INDEX.md`
  - affected docs/templates

- [ ] **Step 1: Run full validator fresh**

```bash
python3 scripts/validate_repo.py
```

Expected: `DND repository validation: PASS`.

- [ ] **Step 2: Verify approved spec is still present and authoritative**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
p=Path("docs/superpowers/specs/2026-10-01-dnd5e-hidden-object-production-system-design.md")
assert p.exists()
s=p.read_text()
assert "15 complete, game-ready" in s
assert "GATE 7" in s.upper()
print("approved spec check: PASS")
PY
```

Expected: `approved spec check: PASS`.

- [ ] **Step 3: Verify project-state truthfulness**

Review:
- all non-Candlekeep scenes = not started / Gate 0;
- Candlekeep = Gate 0 and 1 approved, Gate 2 next;
- no file claims the 15 levels are finished;
- no generated art is falsely referenced as present.

- [ ] **Step 4: Verify final-product semantics**

Search repository for outdated framing that says the final product is “15 illustrations” rather than 15 complete levels.

Example:

```bash
grep -RniE "final product.*illustration|15.*illustration.*final|project is complete.*illustration" . --include='*.md' || true
```

Expected: no contradictory live/canonical wording. Historical text in explicitly superseded material is allowed only if labeled as such.

- [ ] **Step 5: Run full validator again after any fixes**

```bash
python3 scripts/validate_repo.py
```

Expected: PASS.

- [ ] **Step 6: Commit verification fixes if any**

If files changed:

```bash
git add .
git commit -m "docs: finalize DND hidden-object repository bootstrap"
```

If no files changed, do not create an empty commit.

---

## Final Whole-Branch Verification

Before claiming bootstrap completion:

```bash
python3 scripts/validate_repo.py
git status --short
git log --oneline --decorate -8
```

Expected:
- validator PASS;
- no unintended uncommitted changes;
- task commits visible.

Then apply `superpowers:verification-before-completion`.

After verification, use `superpowers:finishing-a-development-branch` and present the integration choices required by that skill. Do not merge or push/PR without the human partner choosing the integration option.

