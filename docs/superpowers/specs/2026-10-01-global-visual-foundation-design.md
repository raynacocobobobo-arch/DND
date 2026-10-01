# Global Visual Foundation V1 — Design Spec

**Date:** 2026-10-01  
**Status:** Proposed / awaiting written-spec approval  
**Repository:** `raynacocobobobo-arch/DND`  
**Branch:** `superpowers/global-visual-foundation`

## 1. Mission

The repository already standardizes lore, subscene selection, population, assets, blocking, hidden-object design, and level packaging. The missing layer is a **global visual inheritance system** that makes all 15 levels look like the same art team and the same product even when they are produced many conversations and many iterations apart.

The final product remains:

> **15 complete, game-ready D&D / 5E Hidden-Object levels.**

The Global Visual Foundation is not a new final deliverable. It is the shared visual DNA used to keep those 15 levels consistent.

Success means that a viewer can compare an early and late level and still recognize the same:
- line language;
- figure proportions;
- face and hand grammar;
- species anatomy;
- class/social-role action language;
- expression and interaction language;
- crowd perspective and density;
- material rendering;
- UI system;
- hidden-object product presentation.

## 2. Core design principle

Text rules are necessary but insufficient for long-term visual consistency.

The project therefore uses a two-part canon:

1. **Rule Bible** — textual constraints, evidence, workflow, Gate logic, versioning.
2. **Visual Bible** — locked reference images, deterministic UI assets, and a manifest that defines exactly what each image controls.

A visual asset is not treated as a casual mood-board reference. Every locked image has:
- a stable ID;
- a version;
- a defined responsibility;
- an explicit priority;
- an “inherit” scope;
- a “do not inherit” scope;
- a status;
- a file hash.

## 3. Relationship to the existing Gate system

The existing per-level Gates remain unchanged:

`G0 Lore → G1 Scene → G2 Population → G3 Asset → G4 Blocking → G5 Scene QC → G6 Hidden-Object → G7 Level`

The Global Visual Foundation adds two **project-level visual milestones**, not new per-level Gates.

### PV0 — Global Visual Prelock

PV0 must pass before any level may begin formal Gate 3 character-asset production.

A level may still complete G0, G1, and G2 before PV0.

PV0 proves that the project has enough visual canon to produce character and scene assets without reinterpreting the art direction from text on every attempt.

### PV1 — Gold Master Lock

PV1 occurs after the pilot level, S02 Candlekeep, passes Gate 7.

PV1 converts the successfully completed pilot into the highest-level final-output visual reference for subsequent levels.

PV1 does not replace the individual foundation boards. It demonstrates how all locked rules look when integrated into a complete level.

## 4. Why the system uses PV0 and PV1

Requiring a final Gold Master before the first level would create a circular dependency:

`Need Gold Master → need completed level → need Gate 3+ assets → need visual baseline → need Gold Master`

PV0 breaks that loop by supplying pre-production visual standards.

Candlekeep then acts as the pilot:
`PV0 → S02 G3–G7 → Gold Master → PV1`

After PV1, S01 and S03–S15 inherit both:
- the specialized PV0 boards;
- the integrated Gold Master.

## 5. Repository architecture

The implementation will add:

```text
MASTER/
└── VISUAL-FOUNDATION/
    ├── README.md
    ├── GLOBAL-VISUAL-FOUNDATION-V1.md
    ├── VISUAL-ANCHOR-MANIFEST.json
    │
    ├── 01-STYLE/
    │   ├── STYLE-CALIBRATION-SPEC-V1.md
    │   └── STYLE-CALIBRATION-BOARD-V1.png
    │
    ├── 02-HUMAN-FACE-HAND/
    │   ├── HUMAN-FACE-HAND-SPEC-V1.md
    │   └── HUMAN-FACE-HAND-BOARD-V1.png
    │
    ├── 03-SPECIES/
    │   ├── SPECIES-MASTER-SPEC-V1.md
    │   ├── SPECIES-CORE-BOARD-A-V1.png
    │   └── SPECIES-CORE-BOARD-B-V1.png
    │
    ├── 04-ROLE-ACTION/
    │   ├── ROLE-ACTION-SPEC-V1.md
    │   └── ROLE-ACTION-BOARD-V1.png
    │
    ├── 05-EXPRESSION-INTERACTION/
    │   ├── EXPRESSION-INTERACTION-SPEC-V1.md
    │   └── EXPRESSION-INTERACTION-BOARD-V1.png
    │
    ├── 06-COMPOSITION/
    │   ├── CROWD-COMPOSITION-SPEC-V1.md
    │   └── CROWD-COMPOSITION-BOARD-V1.png
    │
    ├── 07-MATERIAL-PROP/
    │   ├── MATERIAL-PROP-SPEC-V1.md
    │   └── MATERIAL-PROP-BOARD-V1.png
    │
    ├── 08-ANTI-DRIFT/
    │   ├── ANTI-DRIFT-SPEC-V1.md
    │   └── ANTI-DRIFT-BOARD-V1.png
    │
    ├── UI/
    │   ├── UI-SPEC-V1.md
    │   ├── UI-TOKENS-V1.json
    │   ├── UI-COMPONENTS-V1.svg
    │   ├── UI-COMPONENT-BOARD-V1.png
    │   └── UI-FULL-MOCKUP-V1.png
    │
    └── GOLD-MASTER/
        ├── GOLD-MASTER-SPEC-V1.md
        ├── GOLD-MASTER-SCENE-V1.png
        └── GOLD-MASTER-LEVEL-V1.png
```

The PNG names above define the required canonical image assets. They are not optional illustration ideas.

## 6. Visual anchor classes

### VA01 — Style Calibration Board

Locks the rendering grammar:
- black-line character;
- line-weight relationship between character/background/detail;
- flat-color behavior;
- restrained cel-shadow behavior;
- highlight behavior;
- saturation range;
- edge clarity;
- background simplification;
- acceptable texture density.

It must include representative crops for:
- full-body character;
- face;
- hand;
- cloth;
- leather;
- metal;
- stone/wood;
- small multi-character interaction;
- background architecture.

It is not allowed to lock location-specific clothing or architecture.

### VA02 — Human / Face / Hand Board

Locks the human baseline used to judge all other humanoid figures:
- approximately 5–5.5 heads;
- head-size range;
- eye/nose/mouth simplification;
- age variation;
- body-type variation;
- male/female presentation range without turning into different art styles;
- hand construction and gesture readability;
- facial detail level at hidden-object viewing scale.

The board must show variety inside one style. It must not create a reusable actor cast.

### VA03 — Species Master Boards

Locks recurring species anatomy across the project.

PV0 core coverage must include species expected to recur across multiple locked levels, at minimum:
- Human;
- Elf;
- Dwarf;
- Halfling;
- Gnome;
- Tiefling;
- Orc / Half-Orc treatment as applicable to the project's 5E source version;
- Dragonborn.

Additional species are introduced through the extension protocol before their first Gate 3 use.

Each species entry must define visually:
- relative height;
- skeletal mass;
- head/body proportion;
- signature anatomy;
- face grammar;
- silhouette;
- adult-vs-child distinction where relevant;
- at least one forbidden misread.

Species boards lock anatomy, not faction clothing.

### VA04 — Class & Social Role Action Board

The project does not treat classes as fixed uniforms.

This board locks readable action/equipment language for:
- core adventuring classes used in the project;
- common NPC/social roles such as guard, scribe, noble, priest, scout, worker, courier, scholar.

It shows:
- characteristic equipment;
- characteristic body use;
- characteristic task/action;
- purposeful spell behavior where applicable;
- how to distinguish a role without costume cliché.

### VA05 — Expression & Interaction Board

Locks performance intensity.

It must show:
- focused;
- suspicious;
- amused;
- frustrated;
- anxious;
- tired;
- proud;
- surprised;
- covert;
- argumentative;
- collaborative expressions/actions.

It must also show:
- two-person handoff;
- argument;
- pointing/guiding;
- shared reading;
- carrying/repairing;
- hiding/stealing;
- observing;
- group reaction.

Purpose: stop 55–70-character scenes from becoming a collection of neutral standing poses.

### VA06 — Crowd Composition Board

Locks the global scene grammar:
- stage-like horizontal organization;
- weak/compressed perspective;
- foreground 105–110%;
- core midground 100%;
- rear/platform 85–90%;
- 8–12 event-island structure;
- readable rear figures;
- background one detail level simpler;
- no giant foreground portrait effect;
- no cinematic perspective collapse.

The board should contain multiple diagrammatic/illustrated examples, not only one finished scene.

### VA07 — Material / Prop Rendering Board

Locks rendering treatment across scene types:
- stone;
- wood;
- parchment/paper;
- cloth;
- leather;
- common metal;
- glass;
- magical light/effect;
- simple water/ice/fire where relevant.

The purpose is to keep Calimport, Icewind Dale, Candlekeep, Avernus, and Spelljammer scenes in the same rendering family despite different environments.

### VA08 — Anti-Drift Board

A canonical rejection board.

It visually demonstrates unacceptable drift:
- painterly concept-art rendering;
- 3D-render look;
- anime/manga drift;
- chibi proportions;
- photorealism;
- over-detailed background;
- deep perspective with microscopic rear crowds;
- random glow-orb magic;
- species anatomy drift;
- identical neutral faces;
- giant foreground heads;
- inconsistent UI illustration style.

Each rejection example must label the exact failure, not merely say “bad.”

## 7. UI architecture

UI is not generated anew inside every level image.

The scene artwork remains scene-only through Gate 5.

The UI is then assembled from deterministic, locked components.

### Required UI canonical sources

`UI-TOKENS-V1.json` defines:
- base canvas relation;
- bottom-bar height;
- target-slot aspect ratio;
- padding;
- gap;
- border width;
- corner radius;
- typography hierarchy;
- icon inset;
- state values.

`UI-COMPONENTS-V1.svg` is the reusable vector source for:
- target bar;
- target slot;
- clue panel;
- title card;
- completion/check state;
- selection/highlight state;
- difficulty/state badge where used.

`UI-COMPONENT-BOARD-V1.png` is the visual reference sheet.

`UI-FULL-MOCKUP-V1.png` proves the components work on a representative hidden-object scene.

### UI stability rule

Levels may change:
- title text;
- target thumbnails;
- clue text;
- completion state;
- target count within supported layout rules.

Levels may not silently change:
- component geometry;
- typography hierarchy;
- slot treatment;
- spacing system;
- border language;
- state language.

A structural UI change creates a new UI version.

## 8. Visual Anchor Manifest

`VISUAL-ANCHOR-MANIFEST.json` is the machine-readable authority map.

Each anchor record contains at least:

```json
{
  "id": "VA03-SPECIES-CORE-A",
  "file": "03-SPECIES/SPECIES-CORE-BOARD-A-V1.png",
  "spec": "03-SPECIES/SPECIES-MASTER-SPEC-V1.md",
  "version": "V1",
  "status": "LOCKED",
  "priority": "MANDATORY",
  "appliesTo": ["ALL_LEVELS"],
  "controls": ["species anatomy", "relative scale", "silhouette"],
  "doNotInherit": ["faction clothing", "scene lighting"],
  "supersedes": null
}
```

Allowed status values:
- `DRAFT`
- `REVIEW`
- `LOCKED`
- `RETIRED`

Only `LOCKED` anchors may be used as canonical production references.

## 9. Anchor priority

When visual references conflict, use this order:

1. applicable locked Species/Face/Material specialized board for the feature it controls;
2. Gold Master for integrated final-output behavior;
3. Style Calibration Board for general rendering;
4. current scene-specific approved board for local content;
5. prompt text.

A lower-priority reference must not override a higher-priority reference outside its scope.

Example:
- Species Board controls Dwarf anatomy.
- Candlekeep Faction Board controls that Dwarf's Avowed clothing.
- Gold Master controls overall final rendering integration.
- Prompt controls the current action.

## 10. Scene Visual Packet

Before any level enters formal Gate 3 asset production, it receives a Scene Visual Packet.

The packet records the exact global and scene-specific anchors used for that level.

```text
SCENES/SXX/PRODUCTION/VISUAL-PACKET/
├── VISUAL-PACKET.md
├── anchor-manifest-snapshot.json
├── scene-species-subset.md
├── scene-faction-board.*
├── character-board.*
├── props-creatures-board.*
└── blocking-board.*
```

`VISUAL-PACKET.md` must record:
- Global Visual Foundation version;
- UI version;
- Gold Master version if PV1 has passed;
- mandatory anchor IDs;
- scene-specific anchor IDs;
- exceptions;
- model/tool adapter notes if relevant.

The packet prevents a later conversation from silently changing the reference set.

## 11. Tool/model independence

The Global Visual Foundation describes visual outputs, not one image-generation product.

Model-specific prompt syntax and reference-image slot mapping are adapters, not canon.

If the project changes image-generation models:
- the locked boards remain authoritative;
- only the adapter changes;
- a test scene/crop must prove the new adapter still matches the locked anchors before production resumes.

This avoids tying 15-level consistency to one transient model version.

## 12. Species extension protocol

PV0 does not need to pre-build every species that could possibly appear in all D&D material.

If a later scene requires a species absent from the locked master boards:

1. verify lore eligibility in G0/G2;
2. add textual species construction rules;
3. create a dedicated visual species extension board;
4. review it against VA01/VA02 and existing Species boards;
5. version the Species Foundation as a compatible minor revision, e.g. V1.1;
6. lock the new anchor before that scene may enter Gate 3.

Existing locked species are not redrawn merely because a new species is added.

## 13. Gold Master

S02 Candlekeep is the pilot.

After Candlekeep passes Gate 7, create two Gold Master images:

### Gold Master Scene
The approved scene without UI.

Locks integrated behavior for:
- line;
- color/shadow;
- human/face/hand detail;
- species integration;
- crowd scale;
- background complexity;
- event density.

### Gold Master Level
The approved playable visual with deterministic UI applied.

Locks integrated behavior for:
- scene/UI relationship;
- safe area;
- target-thumbnail treatment;
- title/target hierarchy;
- final product density.

PV1 passes only after both are approved.

## 14. Cross-Scene Visual Regression

Gate 5 receives an additional consistency check.

### Before PV1

The pilot is compared against PV0 boards.

### After PV1

Every later final-scene candidate is compared against:
- applicable PV0 specialized anchors;
- Gold Master Scene.

The QA compares:
- line language;
- head/body proportion;
- face detail;
- hand detail;
- species anatomy;
- color/shadow;
- material rendering;
- crowd scale;
- background complexity;
- action/expression density.

A mismatch is routed to the smallest responsible production stage.

### Regression sheet

Each level should create a side-by-side regression sheet containing representative crops:
- human face;
- hand/action;
- at least one recurring species;
- material/background crop;
- crowd-scale crop;
- full-scene thumbnail.

The regression sheet is a QA artifact, not a new style reference.

## 15. Visual versioning and freeze rules

Visual canon uses:
- `V1` — first locked usable foundation;
- `V1.1` — additive or small compatible extension;
- `V2` — structural visual revision.

Once an anchor is `LOCKED`, do not overwrite its file in place while keeping the same version.

If a change is required:
1. create a new version;
2. update the manifest;
3. record what it supersedes;
4. state which levels use which foundation version.

A completed level records its exact foundation versions for reproducibility.

## 16. Image storage policy

Canonical visual-foundation boards should be stored in the repository in practical review-sized PNG form so future agents can retrieve the exact reference.

High-resolution editable/source files may later use Git LFS or another approved source-asset store if size requires it.

The manifest must always point to a repository-accessible canonical preview/reference image.

No anchor may exist only in chat history.

## 17. PV0 pass criteria

PV0 passes only when all of the following are human-approved and `LOCKED` in the manifest:

- VA01 Style Calibration Board;
- VA02 Human/Face/Hand Board;
- PV0 core Species Boards;
- VA04 Role/Action Board;
- VA05 Expression/Interaction Board;
- VA06 Crowd Composition Board;
- VA07 Material/Prop Board;
- VA08 Anti-Drift Board;
- UI Spec;
- UI Tokens;
- UI Components;
- UI Component Board;
- UI Full Mockup;
- Visual Anchor Manifest.

At that point formal scene Gate 3 production may begin.

## 18. PV1 pass criteria

PV1 passes only when:

- Candlekeep has passed Gate 7;
- Gold Master Scene is approved and locked;
- Gold Master Level is approved and locked;
- any lessons from the pilot have been reconciled into compatible Foundation revisions;
- the Manifest records the final PV1 authority order.

After PV1, all remaining levels use the locked Gold Master in Gate 5 regression.

## 19. Changes to existing project behavior

### Existing behavior retained
- G0–G7 remain unchanged.
- Evidence labels remain unchanged.
- One-scene-one-casting-set remains unchanged.
- 55–70 readable-figure norm remains unchanged.
- 8–12 event islands remain unchanged.
- Hidden-object design remains after Scene QC.
- `LEVEL/` target/answer metadata contract remains unchanged.

### New behavior
- Gate 3 is blocked until PV0 passes.
- Every Gate 3+ level has a Scene Visual Packet.
- UI is composed from deterministic components rather than regenerated stylistically per level.
- Gate 5 includes cross-scene visual regression.
- After the pilot, PV1 Gold Master becomes a mandatory integrated reference.
- Any new recurring species uses the extension protocol.

## 20. Pilot sequence

The intended order is:

1. approve this design;
2. write implementation plan;
3. build textual Visual Foundation specs and manifest schema;
4. create/review the PV0 visual boards;
5. lock deterministic UI assets;
6. pass PV0;
7. return to S02 Candlekeep Gate 2 review;
8. once Gate 2 passes, produce Gate 3 character/prop assets using the locked Foundation;
9. complete Candlekeep through Gate 7;
10. create and approve Gold Master Scene + Gold Master Level;
11. pass PV1;
12. produce the remaining 14 levels using Foundation + Gold Master regression.

## 21. Definition of Done for this subsystem

The Global Visual Foundation V1 subsystem is complete when:

- all PV0 mandatory rule files exist;
- all PV0 mandatory visual boards exist;
- the Manifest validates and all required anchor records are LOCKED;
- deterministic UI sources and mockup exist;
- the repository documents anchor priority and inheritance scope;
- Scene Visual Packet template exists;
- cross-scene regression checklist/template exists;
- the repository validator can detect missing locked anchors or broken manifest references;
- PV0 has explicit human approval.

PV1 is a later milestone and cannot be marked complete until the Candlekeep pilot itself passes Gate 7.
