# VA03-HUMAN — Human Species Variation Spec V1

**Status:** DRAFT SPEC  
**Parent style:** VA01 — Style Calibration V1  
**Face grammar:** VA02-FACE-GRAMMAR — current positive diagnostic, not yet LOCKED  
**Hand grammar:** VA02-HAND-GRAMMAR — DRAFT

## Purpose

Lock a stable Human anatomy system that can generate many different NPC identities without inventing a new body skeleton for every character.

VA03-HUMAN does **not** define a continuous character-creator slider space.

The production model is:

> **finite Body Chassis + narrow stature variation + identity variables**

This allows the later 55–70-character Hidden-Object scenes to contain substantial Human diversity while preserving one repeatable anatomy system.

## Core production rule

Human variation must not be built from arbitrary combinations of:
- very short / very tall;
- extremely thin / extremely heavy;
- different head/body ratios;
- independently changing limb length.

Instead:
1. select one approved Human Body Chassis;
2. preserve the shared ~5.3-head adult construction;
3. allow only a narrow stature adjustment around Human baseline;
4. layer identity through face, hair, skin tone, age, facial hair, clothing and role.

The result should read as many different Humans built by one production system, not six unrelated anatomical designs.

## Human Body Chassis

VA03-HUMAN V1 uses exactly four base chassis.

### H-B01 — STANDARD LIGHT

Structural read:
- normal adult Human skeleton;
- narrower shoulder / torso mass;
- lighter limb volume;
- no childlike shortening;
- no enlarged head.

Intended use:
- light-framed adults of any sex presentation.

### H-B02 — STANDARD MEDIUM

Structural read:
- baseline adult Human frame;
- moderate shoulder / torso / limb mass;
- neutral production reference.

Intended use:
- most ordinary adult Humans.

### H-B03 — STRONG

Structural read:
- broader shoulders and ribcage;
- thicker arms / legs;
- visibly greater muscle mass;
- still the same 5.3-head Human construction.

Intended use:
- physically strong adults of any sex presentation.

Do not equate STRONG with “male only.”

### H-B04 — BROAD / HEAVY

Structural read:
- broader torso and pelvis;
- greater soft-tissue volume;
- fuller arms / legs;
- stable adult skeletal proportions underneath.

Intended use:
- broad or heavy-bodied adults of any sex presentation.

Do not implement this chassis as merely an enlarged B02 or as a muscular B03.

## Stature limit

Human stature is a **secondary modifier**, not a separate body category.

Project production range:
- baseline Human = `1.00`;
- ordinary allowed visual variation = approximately **0.97–1.03** relative to Human baseline.

Rules:
- no separate SHORT / AVG / TALL chassis;
- stature scaling must preserve the same ~5.3-head ratio;
- do not shorten limbs or enlarge the head to make a shorter Human;
- do not lengthen limbs or shrink the head to make a taller Human;
- no Human sample may approach Halfling / Gnome construction;
- no Human sample should visually compete with genuinely larger species through arbitrary height inflation.

These are project production-control ratios, not universal D&D canonical heights.

## Identity layer

After a Body Chassis is selected, identity may vary through:
- Face Grammar-compliant facial identity;
- face width / jaw width / cheek fullness;
- skin-tone family;
- hairstyle / hair texture / hair color;
- facial hair;
- adult age;
- limited age-related posture change;
- neutral calibration clothing;
- later scene-specific faction / role clothing.

Identity variation must not silently alter the chassis.

## Required visual samples

Use **six adult Human identities** on a white/light neutral background with one exact ground line.

Required mapping:

| ID | Body Chassis | Age | Sex presentation | Primary test |
|---|---|---|---|---|
| H01 | H-B01 STANDARD LIGHT | adult | masculine | light frame is still adult Human |
| H02 | H-B02 STANDARD MEDIUM | adult | feminine | baseline Human |
| H03 | H-B03 STRONG | adult | feminine | strong female without changing species/anatomy system |
| H04 | H-B03 STRONG | adult | masculine | same strong chassis supports a different identity |
| H05 | H-B04 BROAD / HEAVY | adult | feminine | heavy/broad female without caricature |
| H06 | H-B02 STANDARD MEDIUM | older adult | masculine | age transfer without changing chassis or face grammar |

This mapping is a **diagnostic board roster**, not a recurring actor cast.

## Board requirements

Across H01–H06:
- exact shared ground line;
- orthographic-like standing presentation;
- no perspective scaling;
- all use approximately **5.3 heads**;
- neutral fantasy calibration clothing;
- no faction-specific uniform;
- no duplicate facial identities;
- at least three distinct hair families;
- at least three skin-tone families;
- rounded Human ears only;
- readable hands;
- Face Grammar inherited from VA02 positive diagnostic language;
- VA01 line / flat color / restrained cel-shading grammar.

## On-image labels

Only:
- `H01`–`H06`;
- chassis tag: `B01 / B02 / B03 / B04`;
- optional `OLDER` for H06;
- one shared `~5.3 HEADS` construction note.

Do **not** label SHORT / AVG / TALL.

No long paragraphs on the board.

## Human invariants

- unmistakably adult Human;
- rounded Human ears;
- one common ~5.3-head body ratio;
- functional adult limb proportions;
- one of the four approved chassis;
- stature remains inside the narrow Human band;
- VA01 rendering grammar;
- one shared Face Grammar system;
- readable hands;
- no chibi anatomy.

## Allowed variables

- Body Chassis selection: B01–B04;
- narrow stature modifier within ~0.97–1.03;
- facial identity;
- face shape;
- adult age;
- skin tone;
- hair;
- facial hair;
- mild posture differences;
- neutral calibration clothing.

## Forbidden variation

Do not create variation by:
- inventing a fifth body chassis;
- freely morphing limb length;
- changing head/body ratio;
- scaling one finished person up/down and calling it a new body type;
- making women automatically B01/B02 and men automatically B03/B04;
- treating B04 as comic obesity caricature;
- treating B03 as superhero anatomy;
- using age to switch to a more realistic facial rendering system;
- changing species anatomy.

## Chassis reuse rule for scene production

Later scene character sheets should reuse these chassis as underlying construction templates.

A large Human population should gain diversity primarily from:
- identity;
- face;
- hair;
- skin;
- age;
- clothing;
- equipment;
- role;
- action;
- expression.

The project should **not** require dozens of unique Human body meshes or skeletons to make a 60-person scene look varied.

## Face Grammar dependency

The rejected earlier VA03-HUMAN draft failed because different Human samples switched facial drawing systems.

For the regenerated draft:
- all six identities must inherit the same Face Grammar demonstrated by the current positive VA02 Human transfer diagnostic;
- the board may proceed as a **DRAFT diagnostic**;
- VA03-HUMAN must not become `REVIEW` or `LOCKED` until the required VA02 Face Grammar approval state is resolved.

## Pass criteria

- all four chassis are visibly distinct but belong to one Human anatomy system;
- H03 and H04 clearly share the STRONG chassis without looking like scaled copies;
- H01 remains an adult Human, not a Halfling/Gnome-like small body;
- H05 is broad/heavy without changing head/body ratio or becoming caricatured;
- H06 reads older while still using B02 anatomy and the same Face Grammar;
- sex presentation is independent from chassis;
- all six faces are different identities but one illustration system;
- no body difference is caused by perspective.

## Reject conditions

Reject if:
- the six figures behave like six independently invented body anatomies;
- body size is continuous and uncontrolled rather than chassis-based;
- one body is merely a scaled copy of another;
- any figure changes away from ~5.3 heads;
- shortness is created with a large head or shortened childlike limbs;
- STRONG becomes superhero / 7.5–8-head anatomy;
- BROAD / HEAVY becomes a caricature;
- women and men are locked to stereotyped chassis;
- age creates a different facial art system;
- M03 / M04 Face Grammar drift reappears.

## Rejected draft record

**2026-10-02 — Earlier draft rejected.**

Observed failure:
- H01 / H02 / H05 used a softer, larger-eye, rounder facial grammar;
- H03 / H04 / H06 used a narrower-eye, stronger-brow/jaw, more mature Western-comic facial grammar.

The rejected draft also used `SHORT / AVG / TALL` as an overly prominent design axis.

The replacement V1 draft uses:
- finite B01–B04 Body Chassis;
- narrow 0.97–1.03 stature variation only;
- one Face Grammar across all identities.
