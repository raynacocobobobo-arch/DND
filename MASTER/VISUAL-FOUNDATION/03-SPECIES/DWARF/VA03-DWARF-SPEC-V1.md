# VA03-DWARF — Dwarf Species Variation Spec V1

**Status:** DRAFT SPEC  
**Parent style:** VA01 — Style Calibration V1  
**Face grammar:** VA02-FACE-GRAMMAR — current positive diagnostic, not yet LOCKED  
**Research authority:** `MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md` + approved S02 Species Scale

## Purpose

Lock a reusable Dwarf anatomy system for later character sheets and 55–70-character Hidden-Object scenes.

This spec must be interpreted through `../SPECIES-VISUAL-DERIVATION-PROTOCOL-V1.md`:
**official D&D facts first, then the approved VA01 Dwarf exemplar, then project variation.**

The repository's existing Dwarf definition is authoritative:

- adult height around **80–83% Human production baseline**;
- broad ribcage and dense torso;
- shorter, powerful limbs;
- substantial forearms and hands;
- low, broad adult silhouette;
- unmistakably adult face and posture;
- beard is **not** a mandatory species marker;
- not a uniformly scaled-down Human.

The Dwarf board must prove that body density and limb construction are structural, not a simple scale transform.

## Official 5E evidence

### 2024 / current project rules source
Official D&D 2024 Basic Rules / SRD 5.2.1:
- Creature Type: Humanoid;
- Size: Medium;
- approximately 4–5 feet tall;
- official species description characterizes Dwarves as squat and often bearded;
- Stonecunning / resilience / underground association are lore-mechanical context, not mandatory costume.

### 2014 visual-description support
Official 2014 Basic Rules describes Dwarves as:
- short and stout;
- broad and compact enough that they can weigh as much as a Human nearly two feet taller;
- 4–5 feet tall, about 150 pounds average.

Project use:
- height, compactness and mass distribution are anatomy evidence;
- beard is common but not mandatory;
- mining/smith stereotypes remain forbidden as species shorthand.

## Approved VA01 Dwarf exemplar

Visual source:
`VA01 Style Calibration Board V3 → CORE SPECIES LINEUP → Dwarf`.

The approved exemplar establishes the project's visual translation:
- clearly shorter than adjacent Human/Elf;
- broad, compact torso;
- very low center of gravity;
- short lower limbs;
- thick upper arms / forearms;
- substantial hands;
- adult head and adult facial read;
- rounded compact silhouette;
- bold clean contour + flat color + restrained cel shading.

Sample-specific and **not invariant**:
- orange hair/beard;
- full beard;
- crossed arms;
- leather outfit;
- exact face;
- exact expression.

## Image-derived Dwarf diagnostic guides

These are **project visual diagnostics derived from the approved VA01 exemplar**, not official D&D measurements and not rigid rigging dimensions.

Primary visual source:
- full source: locked VA01, source file ID `file_00000000b8048207a408bf22121bcf83`;
- source dimensions inspected: 1672×941;
- Dwarf exemplar diagnostic crop: approximately `x=1165..1315, y=135..515`.

Secondary action confirmation:
- full source: SEED-A, source file ID `file_00000000f8988207b1b25b210f8231a7`;
- source dimensions inspected: 1672×941;
- Dwarf action diagnostic crop: approximately `x=585..790, y=275..540`.

Observed project construction:
- total standing silhouette reads at roughly **4.0–4.2 head heights**;
- shoulder span reads roughly **1.7–1.9 head widths** rather than a narrow Human shoulder line;
- trunk occupies a large share of total height;
- crotch-to-ground / lower-limb region stays **well under half of total height**;
- forearms remain thick almost to the wrist rather than tapering to a light Human wrist;
- hands read broad and adult, not child-small;
- feet are broad/grounded but are not enlarged cartoon feet;
- when the Dwarf bends forward in SEED-A, the broad torso + heavy forearm/hand system remains visible, confirming that these are structural traits rather than a standing-pose illusion.

Use these as a **silhouette regression band**, not as exact pixel geometry.

Critical rule:
> If a generated Dwarf can be converted back into a Human merely by scaling it taller, the anatomy is wrong.

## Dwarf Anatomy Core

Before body-chassis variation, every Dwarf must preserve:

- relative adult height: project ~80–83% Human baseline;
- project stylized head/body relation: **approximately 4.0 heads**, derived from the approved VA01 Dwarf exemplar rather than official rules;
- broad ribcage and compact trunk;
- pelvis/torso mass visibly denser than Human;
- short but powerful thighs and lower legs;
- forearms and hands visibly substantial;
- low center of gravity;
- adult face and mature posture;
- no childlike head enlargement.

The ~4.0-head value is a **project visual-control ratio**, not an official D&D measurement.

Critical Human comparison:
> A Dwarf is not a Human at 80% scale.  
> At similar head size, the Dwarf has a shorter/denser body, broader trunk, shorter limbs and heavier hands/forearms.

## Species construction

### Shared Dwarf skeleton

All Dwarves share:
- compact adult trunk;
- relatively short femur/tibia and forearm/upper-arm visual lengths compared with Human;
- broad ribcage;
- low center of mass;
- thicker wrists, hands and forearms;
- adult head and mature posture;
- full adult hand size appropriate to the dense frame.

Do not create Dwarf shortness by:
- enlarging the head;
- shrinking a Human proportionally;
- childlike short limbs with a small torso;
- perspective scaling.

## Body Chassis

VA03-DWARF V1 uses four reusable chassis.

### D-B01 — COMPACT LEAN

- leanest allowed Dwarf frame;
- still broad through ribcage relative to Human;
- dense forearms/hands remain;
- adult, not adolescent.

### D-B02 — STANDARD DENSE

- baseline Dwarf frame;
- broad torso;
- dense limbs;
- primary reusable Dwarf chassis.

### D-B03 — STRONG / POWERFUL

- greater shoulder/back/arm/thigh mass;
- powerful rather than tall;
- same low, compact Dwarf construction;
- no Human-heroic long limb drift.

### D-B04 — BROAD / HEAVY

- fuller torso and limbs;
- greater soft-tissue volume over the same dense skeleton;
- low, broad silhouette;
- not comedy obesity shorthand.

Sex presentation does not determine chassis.

## Height / head-body relation

Project production controls:
- stature: approximately **0.80–0.83 Human baseline**;
- all samples use one consistent Dwarf head/body construction around **~4.0 heads**;
- this ratio is a project visual-control decision, not an official D&D measurement.

The Dwarf head must read adult and proportionate to the dense frame. It must not be enlarged to create cuteness.

## Face Grammar

Faces inherit the current positive VA02 Face Grammar diagnostic.

Dwarf identity may use:
- broader face shapes;
- stronger cheek/jaw mass;
- thicker brows where appropriate;

but must preserve:
- one eye-size/detail family;
- one iris/pupil simplification;
- one nose simplification level;
- one mouth/teeth system;
- one line hierarchy;
- one restrained cel-shading system.

Do not switch to a second “gritty dwarf face” rendering system.

## Beard / hair rule

Beard is an identity variable, not a Dwarf invariant.

The board must include:
- at least two clean-shaven / no-beard Dwarves;
- at least two visibly bearded Dwarves;
- at least one short beard and one fuller beard;
- female presentation must not be defined by beard presence or absence.

Hair and beard should remain practical and subordinate to anatomy.

Avoid:
- giant braided beard gimmicks on every figure;
- oversized mustaches covering the face;
- identical red-haired beard templates;
- miner helmets / axes / smith tools as species shorthand.

## D01–D06 test roster

| ID | Chassis | Age | Sex presentation | Stature | Beard | Primary test |
|---|---|---|---|---:|---|---|
| D01 | D-B01 COMPACT LEAN | adult | masculine | 0.80 | clean-shaven | lean Dwarf still reads dense/adult |
| D02 | D-B02 STANDARD DENSE | adult | feminine | 0.81 | none | baseline female Dwarf |
| D03 | D-B03 STRONG / POWERFUL | adult | feminine | 0.82 | none | strong female Dwarf without Human drift |
| D04 | D-B03 STRONG / POWERFUL | adult | masculine | 0.83 | full beard | same chassis, different identity/sex presentation |
| D05 | D-B04 BROAD / HEAVY | adult | masculine | 0.81 | short beard | heavy Dwarf without caricature |
| D06 | D-B02 STANDARD DENSE | older adult | feminine | 0.80 | none | age transfer on baseline chassis |

Critical pair tests:
- D03 ↔ D04: same D-B03 chassis, different identities / sex presentation;
- D02 ↔ D06: same D-B02 chassis, different age / identity.

## Shared board construction

All six figures:
- one exact shared ground line;
- white/light neutral background;
- orthographic-like full-body front/slight 3/4 presentation;
- same relaxed standing stance family;
- approximately 4.0 heads throughout;
- both hands visible;
- fitted neutral fantasy clothing that reveals torso/limb mass;
- no armor, long cloak, giant tools or props;
- one Face Grammar;
- VA01 line / flat color / restrained cel shading.

## Clothing control

Use one restrained shared clothing family:
- simple fitted tunic/shirt;
- narrow belt;
- trousers;
- low/mid boots.

Small neckline, sleeve and color variation is allowed.

Do not use:
- mining gear;
- smith aprons;
- axes/hammers;
- heavy armor;
- clan/faction costume;
- giant belts or shoulder pads.

Species must read through anatomy, not occupation.

## Pass criteria

The board passes only if:
1. every sample reads immediately as adult Dwarf;
2. height sits around 80–83% Human baseline conceptually, without perspective tricks;
3. the torso is compact/broad and limbs are short/powerful;
4. hands/forearms carry more mass than Human;
5. D01 is lean but still Dwarf, not a short Human;
6. D03/D04 share D-B03 without becoming separate female/male body systems;
7. D05 is broad/heavy without caricature;
8. D02/D06 share D-B02 across age;
9. beard presence is independent from species recognition;
10. no sample relies on mining/smith equipment;
11. Face Grammar remains consistent;
12. head/body ratio remains stable.

## Reject conditions

Reject if:
- any sample is simply a Human scaled to 80%;
- any sample reads as a child;
- the head is enlarged to imply shortness;
- legs are shortened without torso/ribcage/arm reconstruction;
- hands/forearms become Human-light;
- all Dwarves are bearded men;
- all Dwarves are obese;
- D03/D04 become Human B03 bodies at smaller scale;
- D05 becomes a comedy fat caricature;
- old age introduces realistic facial rendering;
- mining/smith props do the species identification;
- Face Grammar drift reappears.

## On-image labels

Only:
- `D01`–`D06`;
- `DB01 / DB02 / DB03 / DB04`;
- optional `OLDER` for D06;
- one shared `~4.0 HEADS` note.

No long explanatory text.

## Lock rule

VA03-DWARF remains DRAFT until:
- visual board is generated;
- explicit human approval is given;
- SPEC + PNG + annotations package exists;
- required dependencies are satisfied;
- manifest validation passes.
