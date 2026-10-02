# VA02-FACE-GRAMMAR — Humanoid Face Grammar Spec V1

**Status:** DRAFT SPEC  
**Parent style:** VA01 — Style Calibration V1

## Purpose

Lock a reusable **face drawing grammar** that survives the project's real production chain:

`approved style → scene character assets → 55–70 readable figures → Hidden-Object level`.

VA02-FACE-GRAMMAR is not a character-design exercise and does not create a standard actor. It exists only because the rejected VA03-HUMAN draft showed multiple incompatible facial drawing systems inside one Human board.

The success question is:

> Can visibly different Human identities still look as if they were drawn by the same project art team, and remain readable at the scale used by the final ensemble scene?

## Product relevance rule

A Face Grammar test is useful only if it helps later Gate 3 character assets and Gate 5 ensemble-scene QC.

Do not spend production time on:
- six-view beauty turnarounds;
- reusable named actors;
- portrait realism;
- detailed character-sheet presentation that will not survive final Hidden-Object scale.

## Positive visual authority

### Primary — SEED-A
`00-SEED-REFERENCES/SEED-REFERENCE-SELECTION-V1.md` defines **SEED-A — 10-person volcano camp** as the character-rendering master seed.

For facial rendering inherit from SEED-A:
- clean black hand-drawn contours;
- compact readable adult fantasy faces;
- graphic, simplified eyes/noses/mouths;
- lively readable expression;
- flat local color;
- restrained hard-edged cel shading;
- no portrait-level skin rendering.

### Parent — VA01 Style Calibration
VA01 is LOCKED and controls:
- line hierarchy;
- flat-color behavior;
- restrained cel shading;
- detail hierarchy.

VA01 does not replace SEED-A's role as the original character-rendering seed; the two must agree.

### Not face authorities
- SEED-D controls event density / ensemble readability only.
- SEED-E controls white-background board organization / silhouette comparison only.
- M03 / M04 are negative diagnostic evidence only.

## Extracted Face Grammar

### Eyes
- readable, graphic adult comic eyes;
- larger than realistic portrait illustration for screen readability, but not oversized anime eyes;
- simple dark lid construction;
- iris/pupil rendered with low complexity;
- no glossy multi-highlight anime treatment;
- no narrow photoreal eye rendering.

### Brows
- simple dark graphic strokes;
- expressive but not anatomically over-modeled;
- no heavy realistic brow-ridge rendering;
- brow design may vary by identity, while stroke language remains the same.

### Nose
- highly simplified relative to portrait illustration;
- only enough bridge/tip/nostril information to read the form;
- no full realistic contour around the nose;
- no detailed nostril anatomy;
- nose shape may vary by identity, construction complexity may not.

### Mouth / teeth
- clear graphic mouth shape;
- lip anatomy simplified;
- open mouths use simple dark interior shapes;
- visible teeth read as one light graphic mass, not individually rendered teeth;
- expression may be broad and lively without adding portrait detail.

### Jaw / face
- compact adult face construction suited to the project's ~5–5.5-head body language;
- no fashion-illustration V-chin;
- no photoreal facial-plane modeling;
- different face widths and jaw shapes are allowed, but all use the same line/detail budget.

### Line
- outer head/hair contour strongest;
- facial feature lines subordinate to silhouette;
- detail lines sparse and purposeful;
- no sample may switch to fine portrait linework or another comic inking system.

### Color / shading
- clear local skin color;
- one restrained hard-edged cel-shadow family;
- minimal secondary occlusion where needed;
- no airbrush skin gradient;
- no pore texture;
- no cinematic light modeling.

## Validation method — Cross-Identity + Scale Test

The next test uses **three different Human identities**, not one repeated actor and not a six-angle turnaround.

Required identities:
1. `HG01` — adult Human, feminine presentation;
2. `HG02` — adult Human, masculine presentation;
3. `HG03` — older adult Human.

All must be unmistakably Human:
- normal rounded Human ears;
- no pointed ears;
- no horns;
- no tail;
- no non-Human anatomy.

The identities must be clearly different in face shape, hair and age while retaining one drawing grammar.

## Board layout

Use one simple light background. No elaborate character-sheet decoration.

### Top row — production review scale
Show the three different Human identities at a practical **character-asset review scale**, preferably upper-body / chest-up rather than giant beauty portraits.

Each sample:
- slight front or 3/4 orientation;
- mild natural expression;
- simple neutral fantasy calibration clothing;
- no faction-specific uniform;
- no dramatic lighting;
- no species markers beyond Human anatomy.

### Bottom row — final-scene readability check
Repeat the same three identities as reduced crops at approximately **25–35% of the top-row face size**.

Purpose:
- confirm the face system remains legible after reduction;
- confirm identity differences survive without adding extra facial detail;
- confirm the generator does not compensate for small scale by changing the art style.

The board is a diagnostic/regression asset, not a reusable cast sheet.

## Variables that should differ

Across HG01–HG03:
- identity;
- face width;
- jaw width;
- cheek fullness;
- age;
- hairstyle;
- hair color;
- skin-tone family;
- sex presentation.

## Invariants

Across HG01–HG03:
- Human anatomy;
- project facial-detail budget;
- eye construction complexity;
- iris/pupil complexity;
- nose simplification level;
- mouth/teeth simplification;
- line-weight hierarchy;
- restrained cel-shading grammar;
- overall SEED-A / VA01 art family.

## Pass criteria

The test passes only if:
1. HG01, HG02 and HG03 are visibly different people.
2. None looks like a different illustrator or different anime/comic/portrait system.
3. Eye scale/detail varies only as identity variation, not as style-family change.
4. Nose shapes differ but use one simplification grammar.
5. Mouths and visible teeth use one graphic system.
6. The older adult looks older through shape, hair and limited age marks, not by switching to realism.
7. All three reduced samples remain identifiable and stylistically consistent.
8. No sample becomes Elf/Tiefling/Dwarf/etc. by accident.
9. The result remains recognizably derived from SEED-A + VA01 rather than a generic character-design aesthetic.

## Reject conditions

Reject the board if:
- one identity becomes anime while another becomes Western-comic or semi-realistic;
- women receive systematically larger/more manga-like eyes than men;
- the older adult gains realistic wrinkles/skin rendering absent from the others;
- a Human gains pointed ears or other species anatomy;
- reduced samples require extra detail that changes the style;
- the board looks like polished portrait concept art rather than a diagnostic for scene production;
- any M03 / M04 facial system is reproduced as a positive style.

## Relationship to VA03-HUMAN

VA03-HUMAN remains DRAFT / rejected while this test is unresolved.

If this cross-identity + scale test is explicitly human-approved:
1. record the approved Face Grammar;
2. keep VA02-FACE-GRAMMAR DRAFT or REVIEW as appropriate until its full SPEC + PNG + annotations package is complete;
3. use the approved grammar as a mandatory inherited reference when regenerating VA03-HUMAN;
4. do not turn HG01–HG03 into recurring project characters.

## Lock rule

This diagnostic image does not auto-lock VA02.

VA02-FACE-GRAMMAR may become LOCKED only after:
- explicit human approval;
- SPEC + PNG + annotations are complete;
- manifest references all required files;
- hashes validate under the Visual Asset Annotation Contract.
