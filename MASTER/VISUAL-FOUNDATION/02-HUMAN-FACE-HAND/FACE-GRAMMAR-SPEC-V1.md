# VA02-FACE-GRAMMAR — Humanoid Face Grammar Spec V1

**Status:** DRAFT SPEC  
**Parent style:** VA01 — Style Calibration V1

## Purpose

Lock **one facial drawing system** for all humanoid assets before species boards continue.

This board does not decide Human/Elf/Dwarf/Tiefling anatomy. It only fixes the common drawing grammar used to render a face.

## Controls

- eye size relative to face;
- iris/pupil simplification;
- eyebrow line language;
- nose construction;
- mouth/lip/teeth simplification;
- jaw/chin construction;
- cheek/face-plane simplification;
- line-weight hierarchy;
- cel-shading treatment on the face;
- age rendering within the same style.

## Non-controls

Do not inherit:
- exact facial identity;
- hairstyle;
- skin tone;
- species ears/horns/tails;
- body type;
- costume;
- role/class.

## Board design

Keep the board intentionally simple.

Use **8 head studies only** on a light neutral background:
- F01 young adult, feminine presentation, softer oval face;
- F02 adult, feminine presentation, longer face;
- F03 older adult, feminine presentation, fuller/rounder face;
- F04 adult, masculine presentation, narrow/angular face;
- F05 young adult, masculine presentation, softer square face;
- F06 adult, masculine presentation, broad face;
- F07 older adult, masculine presentation, mature angular face;
- F08 adult, ambiguous/androgynous presentation, balanced face.

All eight must clearly look like they were drawn by the **same artist using the same facial system**.

## Fixed grammar

Across all eight:
- eye height and width stay inside one narrow family;
- iris/pupil treatment is identical in complexity;
- eyelid line thickness is consistent;
- nose is built with the same simplified bridge/tip language;
- mouth line and teeth simplification stay consistent;
- jaw/chin lines vary by face shape but use the same graphic construction;
- shading remains restrained cel shading;
- no one face may drift into a different anime/comic/realistic sub-style.

## Allowed variation

- face width;
- jaw width;
- cheek fullness;
- age;
- wrinkle amount;
- brow thickness;
- skin tone;
- hair color/style;
- expression, but keep expression mild enough to compare construction.

## Forbidden failure

Reject the board if:
- some faces have much larger anime eyes;
- some faces use realistic narrow eyes while others use cartoon round eyes;
- one subgroup gets thick Western-comic brows/jaws while another subgroup gets soft manga faces;
- age is achieved by switching style rather than modifying one style;
- any sample reads as a different illustrator.

## On-image labels

Only:
- `F01`–`F08`;
- `YOUNG / ADULT / OLDER`;
- optional `SOFT / ANGULAR / BROAD / ROUND`.

No paragraphs on the image.
