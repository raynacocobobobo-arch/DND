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

Use:
- locked VA01/VA02 once available;
- approved PV0 species ratios/spec;
- SEED-E only for lineup organization.

Literal species from SEED-E are not copied unless separately required by the project.

## Generator change protocol

If provider/model behavior materially changes:
1. create a new Profile/Adapter version;
2. rerun calibration against locked PV0 anchors;
3. after PV1, compare against Gold Master;
4. do not resume production until regression passes.

## UI separation

The runtime does not draw final UI.

Gate 5 scene art remains UI-free. UI is composited from `UI-TOKENS-V1.json` and `UI-COMPONENTS-V1.svg`.
