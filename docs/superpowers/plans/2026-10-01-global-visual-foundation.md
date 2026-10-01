# Global Visual Foundation V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a locked global visual-inheritance layer so all 15 D&D 5E Hidden-Object levels can be produced across many sessions while still looking like the same art team and the same product.

**Architecture:** Keep the existing per-level G0–G7 pipeline unchanged. Add project-level PV0/PV1 visual milestones, eight canonical visual-anchor classes, deterministic UI assets, a machine-readable anchor manifest, a frozen generation profile/model adapter, per-scene Visual Packets, and cross-scene regression QA. Candlekeep remains the pilot: Gate 3 may start only after both Candlekeep Gate 2 and PV0 are explicitly approved.

**Tech Stack:** Markdown, JSON, SVG, PNG, Python 3 standard library validators, Git/GitHub, OpenAI image generation for visual boards, deterministic vector/UI generation for UI source assets.

**Spec:** `docs/superpowers/specs/2026-10-01-global-visual-foundation-design.md`

## Global Constraints

- Final product remains **15 complete, game-ready D&D / 5E Hidden-Object levels**.
- Existing per-level Gates remain `G0 Lore → G1 Scene → G2 Population → G3 Asset → G4 Blocking → G5 Scene QC → G6 Hidden-Object → G7 Level`.
- PV0 and PV1 are project-level visual milestones; they do not replace G0–G7.
- Formal Gate 3 asset production requires **both** the level's Gate 2 approval and PV0 approval.
- Text rules and visual anchors are both canonical; neither replaces the other.
- Canonical visual anchors are specification images, not casual mood-board references.
- Every locked visual anchor must have an ID, version, scope, priority, SHA-256, status, controls, and do-not-inherit list.
- Only `LOCKED` anchors may be used as canonical production references.
- UI is deterministic and component-based; it is not re-generated stylistically for every level.
- Scene artwork remains UI-free through Gate 5.
- A generator/model change requires a new Generation Profile / Model Adapter and calibration regression before production resumes.
- No visual anchor may exist only in chat history; canonical review copies must be repository-accessible.
- Species anatomy boards lock anatomy, not faction clothing.
- Scene-specific boards may not override global anchors outside their declared scope.
- Gold Master is created only after S02 Candlekeep passes Gate 7.
- Existing Candlekeep Gate 2 files remain `READY FOR HUMAN REVIEW — NOT APPROVED` until explicit human approval.

## Review Focus

1. **Text-only bootstrap drift:** the first Style Board must be grounded in explicitly selected, user-approved prior visual references rather than invented from prose alone.
2. **Visual-role / false-lock ambiguity:** each board must have a narrow declared responsibility, and validators must reject `LOCKED` anchors with missing files, hashes, specs, or profiles.
3. **Generator drift:** the same boards used through a materially changed generator must trigger calibration, not silent continuation.
4. **Species drift:** later scene-specific clothing or poses must never override locked species anatomy.
5. **UI drift:** scene content may change, but component geometry/spacing/state language must stay identical within a UI version.

---

## File Structure

### New global visual-foundation root

```text
MASTER/VISUAL-FOUNDATION/
├── README.md
├── 00-SEED-REFERENCES/
│   ├── SEED-REFERENCE-SELECTION-V1.md
│   └── selected approved reference images/crops
├── GLOBAL-VISUAL-FOUNDATION-V1.md
├── 15-LEVEL-VISUAL-INVENTORY-V1.md
├── VISUAL-ANCHOR-MANIFEST.json
│
├── 01-STYLE/
│   ├── STYLE-CALIBRATION-SPEC-V1.md
│   └── STYLE-CALIBRATION-BOARD-V1.png
├── 02-HUMAN-FACE-HAND/
│   ├── HUMAN-FACE-HAND-SPEC-V1.md
│   └── HUMAN-FACE-HAND-BOARD-V1.png
├── 03-SPECIES/
│   ├── SPECIES-MASTER-SPEC-V1.md
│   ├── SPECIES-CORE-BOARD-A-V1.png
│   └── SPECIES-CORE-BOARD-B-V1.png
├── 04-ROLE-ACTION/
│   ├── ROLE-ACTION-SPEC-V1.md
│   └── ROLE-ACTION-BOARD-V1.png
├── 05-EXPRESSION-INTERACTION/
│   ├── EXPRESSION-INTERACTION-SPEC-V1.md
│   └── EXPRESSION-INTERACTION-BOARD-V1.png
├── 06-COMPOSITION/
│   ├── CROWD-COMPOSITION-SPEC-V1.md
│   └── CROWD-COMPOSITION-BOARD-V1.png
├── 07-MATERIAL-PROP/
│   ├── MATERIAL-PROP-SPEC-V1.md
│   └── MATERIAL-PROP-BOARD-V1.png
├── 08-ANTI-DRIFT/
│   ├── ANTI-DRIFT-SPEC-V1.md
│   └── ANTI-DRIFT-BOARD-V1.png
├── UI/
│   ├── UI-SPEC-V1.md
│   ├── UI-TOKENS-V1.json
│   ├── UI-COMPONENTS-V1.svg
│   ├── UI-COMPONENT-BOARD-V1.png
│   └── UI-FULL-MOCKUP-V1.png
├── GENERATION/
│   ├── GENERATION-PROFILE-V1.json
│   └── MODEL-ADAPTER-V1.md
└── GOLD-MASTER/
    ├── GOLD-MASTER-SPEC-V1.md
    ├── GOLD-MASTER-SCENE-V1.png
    └── GOLD-MASTER-LEVEL-V1.png
```

### New templates

- `TEMPLATES/VISUAL-PACKET-TEMPLATE.md`
- `TEMPLATES/ANCHOR-MANIFEST-SNAPSHOT-TEMPLATE.json`
- `TEMPLATES/GENERATION-PROFILE-SNAPSHOT-TEMPLATE.json`
- `TEMPLATES/CROSS-SCENE-REGRESSION-TEMPLATE.md`

### Validation

- Create: `scripts/validate_visual_foundation.py`
- Modify: `scripts/validate_repo.py` so the repository validator invokes the visual-foundation validator when the subsystem exists.

### Existing docs to reconcile

- Modify: `README.md`
- Modify: `CURRENT.md`
- Modify: `ACTIVE-DOCS-INDEX.md`
- Modify: `MASTER/GATE-SYSTEM-V1.md`
- Modify: `MASTER/STYLE-LOCK-V1.md`
- Modify: `WORKFLOW/07-CHARACTER-ASSETS.md`
- Modify: `WORKFLOW/11-FINAL-SCENE.md`
- Modify: `WORKFLOW/12-SCENE-QA.md`
- Modify: `WORKFLOW/14-LEVEL-DATA-AND-UI.md`

### Candlekeep

- Review, do not auto-approve:
  - `SCENES/S02-CANDLEKEEP/PRODUCTION/04-POPULATION-MODEL.md`
  - `SCENES/S02-CANDLEKEEP/PRODUCTION/05-SPECIES-SCALE.md`
  - `SCENES/S02-CANDLEKEEP/PRODUCTION/06-FACTION-STYLE.md`
- Later create:
  - `SCENES/S02-CANDLEKEEP/PRODUCTION/VISUAL-PACKET/VISUAL-PACKET.md`
  - `SCENES/S02-CANDLEKEEP/PRODUCTION/VISUAL-PACKET/anchor-manifest-snapshot.json`
  - `SCENES/S02-CANDLEKEEP/PRODUCTION/VISUAL-PACKET/generation-profile-snapshot.json`

---

# Task 1: Establish the Visual-Foundation Contract and Validator

**Files:**
- Create: `MASTER/VISUAL-FOUNDATION/README.md`
- Create: `MASTER/VISUAL-FOUNDATION/GLOBAL-VISUAL-FOUNDATION-V1.md`
- Create: `MASTER/VISUAL-FOUNDATION/VISUAL-ANCHOR-MANIFEST.json`
- Create: `scripts/validate_visual_foundation.py`
- Modify: `scripts/validate_repo.py`
- Modify: `ACTIVE-DOCS-INDEX.md`

**Interfaces:**
- Consumes: approved visual-foundation spec.
- Produces: manifest schema and validator behavior used by every later task.

- [ ] **Step 1: Write the failing visual-foundation validation entry point**

Create `scripts/validate_visual_foundation.py` with checks for:
- required root docs;
- manifest JSON parseability;
- allowed statuses `DRAFT / REVIEW / LOCKED / RETIRED`;
- unique anchor IDs;
- file/spec path existence when an anchor is present;
- SHA-256 field required for `LOCKED` anchors;
- `provenance` required for every anchor record;
- `controls` and `doNotInherit` required and non-empty;
- locked anchor file hash must match the manifest;
- Generation Profile / Adapter required before PV0 can be declared locked.

Initial run must fail because the foundation files do not yet exist.

Run:
```bash
python3 scripts/validate_visual_foundation.py
```

Expected: non-zero with missing Foundation/manifest errors.

- [ ] **Step 2: Create Foundation root docs**

`README.md` explains:
- purpose;
- PV0 / PV1;
- board classes;
- anchor priority;
- where canonical images live;
- human approval rule.

`GLOBAL-VISUAL-FOUNDATION-V1.md` distills the approved spec into production rules without duplicating the entire design spec.

- [ ] **Step 3: Create initial manifest**

Create a valid manifest with:
- `foundationVersion: "V1"`;
- `pv0Status: "DRAFT"`;
- `pv1Status: "NOT_STARTED"`;
- planned anchor records for VA01–VA08 plus UI and Gold Master;
- all planned image anchors initially `DRAFT`;
- no fabricated hashes.

- [ ] **Step 4: Integrate validator**

Update `scripts/validate_repo.py` to run the visual validator via a directly importable function, not shell parsing.

Required interface in `validate_visual_foundation.py`:
```python
def validate(root: Path) -> list[str]:
    ...
```

`main()` prints PASS/FAIL for standalone use.

- [ ] **Step 5: Re-run validators**

```bash
python3 scripts/validate_visual_foundation.py
python3 scripts/validate_repo.py
```

Expected: both PASS for a DRAFT foundation.

- [ ] **Step 6: Negative-test false lock**

Temporarily mark one missing image anchor `LOCKED`.

Expected:
```text
Visual foundation validation: FAIL
```

Restore `DRAFT` and confirm PASS.

- [ ] **Step 7: Index and commit**

Commit:
```bash
git add MASTER/VISUAL-FOUNDATION scripts ACTIVE-DOCS-INDEX.md
git commit -m "feat: establish global visual foundation contract"
```

---

# Task 2: Audit the 15 Locked Levels and Review Candlekeep Gate 2 Inputs

**Files:**
- Create: `MASTER/VISUAL-FOUNDATION/15-LEVEL-VISUAL-INVENTORY-V1.md`
- Review: Candlekeep Gate 2 draft package
- Modify only if review finds factual/internal issues: the three Candlekeep Gate 2 draft files
- Modify: `CURRENT.md`

**Interfaces:**
- Consumes: locked 15 scene list, master research, Candlekeep G0–G2 drafts.
- Produces: exact PV0 species/role/material coverage requirements.

- [ ] **Step 1: Write an inventory completeness check**

The inventory must contain one row for each S01–S15 and columns:
- scene ID;
- subscene;
- likely recurring humanoid species;
- special/non-humanoid scale needs;
- dominant material/environment family;
- distinctive role/action needs;
- UI exception needs;
- whether a new species extension is likely.

Before creation, check must fail on missing inventory.

- [ ] **Step 2: Build the 15-level visual inventory**

Use only existing repository research and approved scene list.

Do not upgrade uncertain location-specific details to fact.

The inventory's purpose is not to finalize each scene population. It identifies what the global visual system must be capable of representing.

- [ ] **Step 3: Review Candlekeep Gate 2 as a package**

Check:
- population arithmetic;
- resident/staff/visitor logic;
- exact species list used by the proposal;
- compatibility between Population Model and Species Scale;
- Faction Style does not invent unsupported official costume facts;
- no Gate 2 file claims approval.

Output the review in `CURRENT.md` under a temporary “Gate 2 review findings” section.

**Human checkpoint:** present the findings and obtain an explicit Gate 2 decision. If changes are requested, revise the Gate 2 package and re-review. Do not derive the pilot species lock from an unapproved proposal.

- [ ] **Step 4: Derive PV0 core species set after Gate 2 decision**

PV0 must include:
- every species in the approved Candlekeep Gate 2 package;
- recurring species justified by the 15-level inventory.

Record:
- `PV0 REQUIRED`;
- `EXTENSION LATER`;
- evidence/source reason.

Do not pre-build every D&D species.

- [ ] **Step 5: Verify inventory and Gate truthfulness**

Expected:
- all 15 scene IDs present;
- Candlekeep Gate 2 state matches the explicit human decision;
- exact PV0 species list can be read from the inventory.

- [ ] **Step 6: Commit**

```bash
git add MASTER/VISUAL-FOUNDATION/15-LEVEL-VISUAL-INVENTORY-V1.md CURRENT.md SCENES/S02-CANDLEKEEP/PRODUCTION
git commit -m "docs: audit visual requirements across 15 levels"
```

---

# Task 3: Select Seed References and Write the Eight Visual-Board Specifications

**Files:**
- Create: `MASTER/VISUAL-FOUNDATION/00-SEED-REFERENCES/SEED-REFERENCE-SELECTION-V1.md`
- Add: 2–4 selected user-approved prior images or diagnostic crops under `00-SEED-REFERENCES/`
- Create all eight `*-SPEC-V1.md` files under `01-STYLE` through `08-ANTI-DRIFT`.
- Modify: `VISUAL-ANCHOR-MANIFEST.json`

**Interfaces:**
- Consumes: Task 2 inventory.
- Produces: exact briefs used by image generation in Tasks 5–6.

- [ ] **Step 1: Select visual seed references**

Review previously user-approved project outputs and select only 2–4 references that genuinely represent the desired project style.

For each selected source, record:
- source/reference ID;
- why the user approved it;
- exact properties to inherit;
- exact properties not to inherit;
- whether the whole image or only a crop is authoritative.

**Human checkpoint:** the user approves the seed set before VA01 generation. If prior approved images cannot be recovered at sufficient quality, stop and ask the user to re-upload the selected references rather than inventing replacements from memory.

- [ ] **Step 2: Write a failing spec-presence test**

Validator must require each planned VA01–VA08 spec path once its anchor record exists.

Expected before creation: FAIL.

- [ ] **Step 3: Write VA01–VA02 specs**

VA01 exact sections:
- controls;
- do-not-inherit;
- required panels;
- line hierarchy;
- fill/shadow/highlight behavior;
- detail density;
- rejection conditions.

VA02 exact sections:
- 5–5.5-head baseline;
- face detail level;
- age/body-type range;
- hand construction;
- full-body + face + hand required examples;
- rejection conditions.

- [ ] **Step 4: Write VA03 Species spec**

Use the PV0 species list from Task 2.

For every PV0 species require:
- front/3⁄4 full-body comparison;
- relative-height ground line;
- head/face inset;
- silhouette trait;
- forbidden misread.

Explicitly state: anatomy is inherited; clothing is not.

The Species spec must also encode the extension protocol:
- later unrepresented species requires a new extension board;
- compatible additions increment the Foundation minor version;
- existing locked species are not redrawn by default.

- [ ] **Step 5: Write VA04–VA05 specs**

VA04: class/social-role equipment + task/action grammar.

VA05: expression intensity + interaction grammar.

No reusable named actor library.

- [ ] **Step 6: Write VA06–VA08 specs**

VA06 must encode:
- 105–110 / 100 / 85–90 scale bands;
- 8–12 event-island examples;
- readable rear figures.

VA07 must encode recurring material rendering.

VA08 must require labeled rejection examples and failure category.

- [ ] **Step 7: Update manifest spec paths and run validator**

Expected: PASS with images still DRAFT.

- [ ] **Step 8: Commit**

```bash
git add MASTER/VISUAL-FOUNDATION
git commit -m "docs: define eight canonical visual board briefs"
```

---

# Task 4: Build Deterministic UI and Generation Profiles

**Files:**
- Create: `UI/UI-SPEC-V1.md`
- Create: `UI/UI-TOKENS-V1.json`
- Create: `UI/UI-COMPONENTS-V1.svg`
- Create: `UI/UI-COMPONENT-BOARD-V1.png`
- Defer until Task 8: `UI/UI-FULL-MOCKUP-V1.png`
- Create: `GENERATION/GENERATION-PROFILE-V1.json`
- Create: `GENERATION/MODEL-ADAPTER-V1.md`
- Modify: manifest
- Modify: visual validator

**Interfaces:**
- Produces deterministic UI source and generator configuration snapshots used by all level packets.

- [ ] **Step 1: Write failing UI/profile validation**

Require:
- parseable tokens JSON;
- stable token keys;
- SVG source exists;
- component board exists before UI source package can advance to REVIEW;
- UI Full Mockup is required only for final PV0 lock and is created in Task 8;
- Generation Profile includes provider/model/aspect/referenceRoles/promptVersion/uiInSceneArt;
- `uiInSceneArt` must be `false`.

- [ ] **Step 2: Define UI tokens**

Pin at least:
- reference canvas relation;
- bottom-bar height ratio;
- outer padding;
- slot aspect ratio;
- slot gap;
- border width;
- radius;
- icon inset;
- text hierarchy;
- default/selected/found states.

Do not use a generated PNG as the source of truth.

- [ ] **Step 3: Author vector UI components**

Create `UI-COMPONENTS-V1.svg` with reusable groups/IDs:
- `target-bar`;
- `target-slot`;
- `clue-panel`;
- `level-title`;
- `state-selected`;
- `state-found`.

- [ ] **Step 4: Render canonical UI component board**

Render the SVG/tokens into the component sheet.

Do not create the final PV0 UI Full Mockup yet; it must be composited onto the Task 8 calibration scene so it tests the real scene/UI relationship.

- [ ] **Step 5: Create Generation Profile and Model Adapter**

Record exact currently used image-generation configuration and anchor-slot mapping.

Do not claim seed control or parameters the active generator does not expose; mark unsupported properties explicitly.

- [ ] **Step 6: Verify deterministic regeneration**

Re-render UI board from the same SVG/tokens and compare deterministic file/hash output where rendering stack permits; otherwise compare SVG source hash plus token equality.

- [ ] **Step 7: Commit**

```bash
git add MASTER/VISUAL-FOUNDATION/UI MASTER/VISUAL-FOUNDATION/GENERATION scripts
git commit -m "feat: add deterministic UI and generation profile"
```

---

# Task 5: Generate and Lock VA01–VA03 Visual Boards

**Files:**
- Create:
  - `01-STYLE/STYLE-CALIBRATION-BOARD-V1.png`
  - `02-HUMAN-FACE-HAND/HUMAN-FACE-HAND-BOARD-V1.png`
  - `03-SPECIES/SPECIES-CORE-BOARD-A-V1.png`
  - `03-SPECIES/SPECIES-CORE-BOARD-B-V1.png`
- Modify: manifest

**Interfaces:**
- Consumes: exact specs from Task 3 and Generation Profile from Task 4.
- Produces first canonical visual anchors used by all later scene assets.

- [ ] **Step 1: Generate VA01 strictly from its spec**

Use image generation with:
- no scene-specific Candlekeep clothing as a global rule;
- multiple labeled visual samples;
- the approved overall European fantasy ensemble-comic language.

Do not mark LOCKED on first generation.

- [ ] **Step 2: Review VA01 against its spec**

Reject/regenerate if any of these appear:
- painterly rendering;
- 3D rendering;
- cinematic DOF;
- chibi proportions;
- background more detailed than characters;
- inconsistent line families within the same board.

Set manifest status to `REVIEW`.

**Human checkpoint:** user approves or requests revision.

- [ ] **Step 3: Generate/review VA02**

Required content:
- adult human full-body variants;
- face detail examples;
- age/body-type variation;
- hand/gesture examples;
- one consistent art style.

Human approval required before LOCKED.

- [ ] **Step 4: Generate Species Boards A/B**

Use exact PV0 species set and shared ground/scale logic.

No faction-specific clothing beyond neutral calibration garments.

Human approval required before LOCKED.

- [ ] **Step 5: Materialize approved images into repository paths**

For each approved generated image:
- establish exact binary file path;
- commit the PNG to the canonical path;
- compute SHA-256;
- update manifest record;
- set status `LOCKED`.

No anchor remains only in conversation history.

- [ ] **Step 6: Run validator**

Expected: VA01–VA03 locked records all have matching hashes and existing specs/images.

- [ ] **Step 7: Commit**

```bash
git add MASTER/VISUAL-FOUNDATION
git commit -m "art: lock style human and species visual anchors"
```

---

# Task 6: Generate and Lock VA04–VA08 Visual Boards

**Files:**
- Create five PNG boards under `04-ROLE-ACTION` through `08-ANTI-DRIFT`.
- Modify: manifest.

**Interfaces:**
- Consumes: locked VA01–VA03.
- Produces behavioral/composition/material/rejection anchors.

- [ ] **Step 1: Generate/review VA04 Role/Action Board**

Use VA01 style + VA02 human grammar + applicable VA03 species references.

Show role through equipment/action, not fixed class uniforms.

Human approval required.

- [ ] **Step 2: Generate/review VA05 Expression/Interaction Board**

Show both individual expressions and pair/group interaction.

Reject neutral-pose grids.

Human approval required.

- [ ] **Step 3: Generate/review VA06 Crowd Composition Board**

Must visibly demonstrate:
- weak/compressed perspective;
- 8–12 event-island logic;
- scale bands;
- readable rear figures;
- bad-vs-good composition mini examples where useful.

Human approval required.

- [ ] **Step 4: Generate/review VA07 Material/Prop Board**

Show shared rendering family across paper, cloth, leather, metal, wood, stone, glass and purposeful magic.

Human approval required.

- [ ] **Step 5: Create VA08 Anti-Drift Board**

This board may use intentionally generated bad examples plus clear labels.

It must visibly distinguish:
- photoreal;
- painterly;
- 3D;
- anime/chibi;
- deep-perspective tiny crowds;
- over-detailed background;
- random magic glow;
- species drift;
- neutral clone faces.

Human approval required.

- [ ] **Step 6: Materialize, hash, lock, validate**

Same binary/hash workflow as Task 5.

- [ ] **Step 7: Commit**

```bash
git add MASTER/VISUAL-FOUNDATION
git commit -m "art: lock action composition material and anti-drift anchors"
```

---

# Task 7: Add Scene Visual Packet and Cross-Scene Regression Interfaces

**Files:**
- Create four templates listed above.
- Modify:
  - `WORKFLOW/07-CHARACTER-ASSETS.md`
  - `WORKFLOW/11-FINAL-SCENE.md`
  - `WORKFLOW/12-SCENE-QA.md`
  - `WORKFLOW/14-LEVEL-DATA-AND-UI.md`
  - `MASTER/GATE-SYSTEM-V1.md`
  - `MASTER/STYLE-LOCK-V1.md`
  - `README.md`
  - `ACTIVE-DOCS-INDEX.md`

**Interfaces:**
- Produces the per-level inheritance mechanism and visual-regression contract.

- [ ] **Step 1: Write failing template/workflow checks**

Validator must require:
- Visual Packet template;
- manifest snapshot template;
- generation snapshot template;
- regression template;
- Workflow 07 contains PV0 precondition;
- Workflow 12 contains cross-scene regression;
- Workflow 14 declares deterministic UI source.

- [ ] **Step 2: Create templates**

`VISUAL-PACKET-TEMPLATE.md` records:
- foundation version;
- UI version;
- generation profile;
- Gold Master version;
- global anchor IDs;
- scene anchor IDs;
- exceptions.

Snapshot JSON templates contain exact copied version/ID/hash fields.

- [ ] **Step 3: Create regression template**

Required comparison crops:
- human face;
- hand/action;
- recurring species;
- material/background;
- crowd-scale;
- full-scene thumbnail.

Each row records:
- expected anchor;
- observed match;
- failure category;
- return stage.

- [ ] **Step 4: Reconcile workflows without renumbering Gates**

Add project-level precondition language only.

Do not create G8/G9.

- [ ] **Step 5: Update README/index/style lock and validate**

Expected: repository and visual validators PASS.

- [ ] **Step 6: Commit**

```bash
git add TEMPLATES WORKFLOW MASTER README.md ACTIVE-DOCS-INDEX.md scripts
git commit -m "docs: wire visual inheritance into scene workflow"
```

---

# Task 8: Run Generator Calibration and Prepare PV0 Review Package

**Files:**
- Create: `MASTER/VISUAL-FOUNDATION/PV0-REVIEW.md`
- Create calibration output image(s) under a `CALIBRATION/` subfolder if needed.
- Modify: manifest.
- Modify: `CURRENT.md`

**Interfaces:**
- Consumes: all VA01–VA08 anchors, UI, Generation Profile.
- Produces: evidence for human PV0 approval.

- [ ] **Step 1: Generate a calibration composition**

Use the active Generation Profile and only locked Foundation anchors.

The calibration image must contain enough material to test:
- human figure;
- at least two PV0 species;
- hands;
- multi-person interaction;
- materials;
- foreground/mid/rear scale.

It is not a game level and not the Gold Master.

- [ ] **Step 2: Compare calibration to anchors**

Record PASS/FAIL for:
- line;
- face;
- hand;
- species;
- material;
- composition;
- background hierarchy.

- [ ] **Step 3: Create the canonical UI Full Mockup**

Apply deterministic UI to the calibration image without modifying the scene artwork and save:
- `UI/UI-FULL-MOCKUP-V1.png`.

The image must be generated by composition from the locked UI source, not by asking an image model to redraw the interface.

- [ ] **Step 4: Test UI source/output consistency**

Verify the Full Mockup uses the current `UI-TOKENS-V1.json` and `UI-COMPONENTS-V1.svg` versions.

- [ ] **Step 5: Create PV0 review document**

Summarize:
- locked anchor list + hashes;
- UI version;
- Generation Profile;
- calibration findings;
- known limitations;
- unresolved failures.

Set manifest `pv0Status: "REVIEW"`.

- [ ] **Step 6: Human PV0 checkpoint**

Present:
- VA01–VA08 boards;
- UI component board + mockup;
- calibration scene;
- PV0 review summary.

Do **not** set PV0 to LOCKED without explicit user approval.

- [ ] **Step 7: Commit review package**

```bash
git add MASTER/VISUAL-FOUNDATION CURRENT.md
git commit -m "review: prepare PV0 visual foundation package"
```

---

# Task 9: Lock PV0 After Explicit Human Approval

**Files:**
- Modify: `VISUAL-ANCHOR-MANIFEST.json`
- Modify: `PV0-REVIEW.md`
- Modify: `CURRENT.md`
- Modify: `ACTIVE-DOCS-INDEX.md`

**Interfaces:**
- Consumes: explicit human PV0 approval.
- Produces: legal precondition for Gate 3 production.

- [ ] **Step 1: Verify approval exists in the active execution context**

If not explicit, stop.

- [ ] **Step 2: Recompute every locked anchor SHA-256**

Reject any stale manifest hash.

- [ ] **Step 3: Set `pv0Status: "LOCKED"`**

All mandatory PV0 anchors, UI sources, Generation Profile, and Adapter must be present and valid.

- [ ] **Step 4: Run full validators**

```bash
python3 scripts/validate_visual_foundation.py
python3 scripts/validate_repo.py
```

Expected:
```text
Visual foundation validation: PASS
DND repository validation: PASS
```

- [ ] **Step 5: Update CURRENT**

State:
- PV0 LOCKED;
- Candlekeep Gate 2 status unchanged unless separately approved;
- Gate 3 still blocked if Candlekeep Gate 2 is not approved.

- [ ] **Step 6: Commit**

```bash
git add MASTER/VISUAL-FOUNDATION CURRENT.md ACTIVE-DOCS-INDEX.md
git commit -m "feat: lock PV0 global visual foundation"
```

---

# Task 10: Instantiate the Candlekeep Scene Visual Packet

**Files:**
- Create the three Candlekeep Visual Packet files.
- Modify only after separate human approval: Candlekeep Gate state documents.

**Interfaces:**
- Consumes: locked PV0 plus Candlekeep G2 package.
- Produces: exact visual-reference snapshot that Candlekeep Gate 3 will use.

- [ ] **Step 1: Require both preconditions**

Assert:
- `pv0Status == LOCKED`;
- Candlekeep Gate 2 == APPROVED.

If either is false, stop and report the blocker.

- [ ] **Step 2: Snapshot manifest and generation profile**

Copy exact:
- version;
- anchor IDs;
- hashes;
- profile version.

No live/reference-by-latest semantics.

- [ ] **Step 3: Write Candlekeep Visual Packet**

Include:
- applicable global anchors;
- Candlekeep species subset;
- faction-style source;
- scene-specific exceptions;
- UI version;
- Gold Master = `NOT_AVAILABLE_PRE_PV1`.

- [ ] **Step 4: Validate packet references**

Every referenced anchor must be LOCKED and hash-match the global manifest.

- [ ] **Step 5: Commit**

```bash
git add SCENES/S02-CANDLEKEEP/PRODUCTION/VISUAL-PACKET
git commit -m "feat: freeze Candlekeep visual packet"
```

At this point Candlekeep can legally begin Gate 3 asset production.

---

# Task 11: Final Branch Verification

**Files:**
- Modify only if verification exposes defects.

**Interfaces:**
- Consumes: all Foundation, UI, manifest, validator, workflow, and Scene Visual Packet outputs from Tasks 1–10.
- Produces: verified branch state ready for Superpowers finishing workflow.

- [ ] **Step 1: Run full validation**

```bash
python3 scripts/validate_visual_foundation.py
python3 scripts/validate_repo.py
```

- [ ] **Step 2: Verify no false approvals**

Check:
- PV0 is LOCKED only if user approved;
- PV1 remains NOT_STARTED;
- Gold Master files are not falsely marked complete;
- Candlekeep Gate 2 is APPROVED only if separately approved;
- no later scene is advanced.

- [ ] **Step 3: Verify repository-accessible visual canon**

Every LOCKED image anchor must:
- exist in repository;
- match manifest SHA-256;
- have its spec file;
- have non-empty `controls` and `doNotInherit`.

- [ ] **Step 4: Verify UI determinism**

UI source-of-truth must still be SVG + tokens, not a generated PNG.

- [ ] **Step 5: Verify future-session resumability**

A new worker reading:
- `README.md`;
- `CURRENT.md`;
- `ACTIVE-DOCS-INDEX.md`;
- Foundation README;
- manifest;
- Scene Visual Packet

must be able to identify exactly which visual assets are canonical.

- [ ] **Step 6: Final commit only if fixes were needed**

Then invoke `superpowers:verification-before-completion` and `superpowers:finishing-a-development-branch`.

---

## Deferred PV1 Work

PV1 is intentionally **not** implemented in this plan because it depends on the future completion of Candlekeep through Gate 7.

A later plan will:
1. validate the final Candlekeep scene;
2. create `GOLD-MASTER-SCENE-V1.png`;
3. apply deterministic UI and create `GOLD-MASTER-LEVEL-V1.png`;
4. reconcile pilot lessons;
5. lock PV1;
6. make Gold Master regression mandatory for S01 and S03–S15.

This avoids falsely shipping a Gold Master before a real completed level exists.
