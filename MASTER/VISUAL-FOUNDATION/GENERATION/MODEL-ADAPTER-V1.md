# Model Adapter V1 — OpenAI / ChatGPT Image Generation Runtime

**Status:** REVIEW  
**Generation Profile:** `GENERATION-PROFILE-V1.json`

## Purpose

Map the model-independent Global Visual Foundation into the currently available image-generation runtime without allowing tool behavior to become visual canon.

The visual canon is the locked Foundation. This adapter may be replaced later.

## Reference priority in this runtime

When the runtime can accept/see the required references, use them in this order for the feature they control:

1. applicable specialized LOCKED anchor;
2. after PV1, Gold Master for integrated output behavior;
3. SEED-A / locked VA01 for general rendering;
4. approved scene-specific board;
5. textual prompt.

SEED-D contributes event-density logic only.  
SEED-E contributes white-background asset-board organization only.

B and C remain excluded.

## Current runtime constraints

The current ChatGPT image-generation interface does not expose every low-level generation parameter.

Do **not** invent:
- seed values;
- denoise strength;
- CFG/guidance values;
- sampler names;
- hidden model build numbers.

If a parameter is not exposed, record it as unsupported/runtime-managed.

## Reference availability rule

A visual anchor must be actually available to the generation context.

Do not claim a board was used merely because its description is known.

If a mandatory reference cannot be supplied or inspected:
- stop that generation step;
- restore/materialize/re-upload the reference;
- then continue.

Do not reconstruct a missing seed from memory.

## Prompt partition

### Global block
Carries only:
- locked art style;
- human/face/hand grammar;
- applicable species anatomy;
- material rendering;
- crowd composition rules;
- anti-drift negatives.

### Scene block
Carries:
- location;
- current event;
- scene-specific faction/culture;
- exact cast/props/creatures;
- blocking.

### Output block
Carries:
- aspect ratio;
- board/scene purpose;
- background requirement;
- required labels only when the task is a diagnostic board.

Do not put UI instructions inside scene generation.

## VA01 generation mapping

Use SEED-A as the primary positive visual reference.

SEED-D may inform only:
- multiple readable local events;
- density without visual soup.

SEED-E must not control rendering style.

VA01 must not inherit:
- Candlekeep clothing;
- specific scene architecture;
- B/C imagery;
- UI.

## VA02 generation mapping

Use:
- locked VA01 if available;
- SEED-A as human-rendering fallback during PV0 construction;
- SEED-E only for shared-ground-line board presentation.

## VA03 generation mapping

**VA03 non-Human generation is SPECIES-EXEMPLAR-FIRST / IMAGE-BOUND.**

Do not use the accepted Human Board as a base anatomy canvas.

Mandatory authority split:
1. official 5E/SRD facts — species truth;
2. matching figure in the approved VA01 Core Species Lineup — species anatomy/silhouette image authority;
3. target Species Anatomy Core + SPEC/annotations — controlled variation;
4. VA01 + current VA02 Face Grammar — rendering grammar;
5. accepted Human Board — white-board layout, label density, simple calibration-clothing and rendering-consistency reference only;
6. SEED-A — character-rendering regression.

Before a six-sample board:
- load/inspect the matching VA01 species exemplar as an actual image reference;
- generate one isolated target-species preflight sample;
- test Species Truth and Project Style separately;
- reject if the sample can be explained as a scaled/morphed Human;
- reject if rendering becomes semi-realistic / realistic / 3D / painterly;
- proceed only when both axes pass.

For Dwarf, the first target is:
`D02 / DB02 STANDARD DENSE / adult feminine Dwarf`.

Its anatomy must derive from the approved VA01 Dwarf exemplar, not H02.

SEED-E is only fallback organization logic. The accepted Human Board controls presentation only.

See:
- `STYLE-BINDING-CONTRACT-V1.md`
- `../03-SPECIES/SPECIES-VISUAL-DERIVATION-PROTOCOL-V1.md`

## Generator change protocol

If provider/model behavior materially changes:
1. create a new Profile/Adapter version;
2. rerun calibration against locked PV0 anchors;
3. after PV1, compare against Gold Master;
4. do not resume production until regression passes.

## UI separation

The runtime does not draw final UI.

Gate 5 scene art remains UI-free. UI is composited from `UI-TOKENS-V1.json` and `UI-COMPONENTS-V1.svg`.


## Style-binding failure quarantine

Rejected species images must not be reintroduced as visual inputs for later attempts. In particular, the rejected 2026-10-02 Dwarf concept-sheet outputs are negative diagnostics only and must never accompany a positive generation request.


## Species derivation order

For every VA03 species, do not begin from another species' body.

Required order:
1. official 5E/SRD species facts;
2. matching species figure in approved VA01 Core Species Lineup;
3. Species Anatomy Core;
4. controlled chassis / variation spec;
5. VA02 face grammar + accepted Human Board for board/rendering behavior only;
6. one-sample anatomy + style preflight;
7. full board.

The accepted Human Board is never an anatomy authority for Dwarf, Elf, Halfling, Gnome or Tiefling.

See `../03-SPECIES/SPECIES-VISUAL-DERIVATION-PROTOCOL-V1.md`.
