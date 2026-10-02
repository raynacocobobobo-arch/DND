# VA02-FACE-GRAMMAR — Humanoid Face Grammar Spec V1

**Status:** DRAFT SPEC  
**Parent style:** VA01 — Style Calibration V1

## Purpose

Lock **one facial drawing system** for all humanoid assets before species boards continue.

This anchor does not decide Human/Elf/Dwarf/Tiefling anatomy. It fixes the common drawing grammar used to construct and render a humanoid face.

The current failure is not ordinary identity variation. Earlier multi-identity tests allowed the generator to switch between different facial drawing systems. Therefore VA02-FACE-GRAMMAR now uses a staged validation sequence that isolates facial construction before identity diversity is tested.

## Validation order

### Phase A — Mandatory Single-Identity Face Construction Core Preflight

The **next visual test must use one fixed adult identity only**.

Do not test multiple identities, species, body types, hairstyles, skin-tone families, or broad age differences in the same preflight image.

Phase A exists to answer one question only:

> Can the project preserve one Face Construction Core while camera angle and mild expression change?

A Phase A pass is **not sufficient to LOCK VA02-FACE-GRAMMAR**. It only permits the project to proceed to Phase B after explicit human approval.

### Phase B — Cross-Identity Transfer Validation

Phase B is deferred until the human reviewer explicitly approves the Phase A preflight.

Only then may the same Face Construction Core be tested across different face widths, ages, sex presentations, skin tones, and hairstyles.

Do not resume VA03-HUMAN generation before the Face Construction Core has passed Phase A and the subsequent cross-identity Face Grammar review has been human-approved.

## Controls

VA02-FACE-GRAMMAR controls:
- eye size and placement relative to the face;
- iris/pupil simplification;
- eyebrow construction and line language;
- nose construction;
- mouth/lip/teeth simplification;
- jaw/chin construction;
- cheek/face-plane simplification;
- facial line-weight hierarchy;
- restrained cel-shading treatment on the face;
- age rendering **after** the Face Construction Core has been validated.

## Non-controls

Do not inherit:
- exact facial identity;
- hairstyle;
- skin tone;
- species ears/horns/tails;
- body type;
- costume;
- role/class.

## Phase A board design

Keep the board intentionally simple.

Use **six head studies of the same fixed adult identity** on one light neutral background:

- `FC01` — front, neutral;
- `FC02` — left 3/4, neutral;
- `FC03` — left profile, neutral;
- `FC04` — right 3/4, neutral;
- `FC05` — front, mild closed-mouth smile;
- `FC06` — front, mild open-mouth / visible-teeth expression.

Across all six, keep fixed:
- identity;
- adult age;
- sex presentation;
- face width and jaw width;
- skin tone;
- hairstyle and hairline;
- brow density;
- facial hair state;
- head/neck proportion;
- crop scale;
- neutral collar/clothing;
- lighting direction;
- background.

The first preflight intentionally does **not** vary age. Age variation is deferred because it would add a second construction variable before the base system is proven.

Only these variables may change in Phase A:
- camera angle;
- mild facial expression needed to test mouth/teeth deformation.

## Face Construction Core

The following is one unified construction system. Camera rotation or expression may deform it, but may not replace it.

### Eyes

- Use moderate adult comic eyes, never anime-large and never photorealistically narrow.
- Eye width/height remains inside one narrow family across views; 3/4 and profile views may change only through normal perspective compression.
- The upper eyelid is the primary stroke.
- The lower eyelid is shorter/lighter and must not become a complete heavy outline around the eye.

### Iris / pupil

- Use one simplified iris/pupil treatment across every sample.
- Iris is a simple flat graphic shape, partially occluded by the lids when appropriate.
- Pupil is a small solid graphic mark.
- Do not alternate between detailed realistic irises, large manga pupils, and dot eyes.
- Eye highlights, if present, remain minimal and consistent with VA01.

### Eyebrows

- Eyebrows use one consistent line family and density.
- Expression may rotate or compress the brow, but must not convert it into a heavy Western-comic brow ridge or a soft manga brow system.
- Brow-to-eye spacing must remain structurally consistent for the identity.

### Nose

- Construct the nose with the same simplified **bridge → tip plane → minimal nostril** logic in every view.
- The bridge is implied with selective line/plane information rather than a fully outlined realistic nose.
- The tip remains a simple graphic wedge/plane.
- Nostrils are minimal marks, not photoreal anatomical rendering.
- A profile view changes projection, not the underlying construction language.

### Mouth / lips / teeth

- Use one dominant mouth-separation line.
- Lip contours are selective; do not fully outline both lips as glossy realistic forms.
- Closed-mouth expression changes must deform the same mouth construction.
- When teeth are visible, render them as one simplified light tooth mass; do not draw individually separated realistic teeth.
- Do not switch to anime mouth shorthand in one sample and detailed comic lips in another.

### Jaw / chin / face width

- The fixed identity keeps one recoverable 3D head structure across rotations.
- Cheek width, jaw angle, chin length, and lower-face width must remain consistent under perspective.
- Do not turn the same identity from a soft face into a heroic square-jaw face merely because the head rotates.
- The jaw/chin outer contour may change in projection but must use one graphic construction language.

### Line weight

Inherit VA01:
- head/hair outer contour = strongest facial line family;
- major feature lines = medium;
- small internal feature detail = lighter;
- age/detail lines = lightest when later introduced.

No panel may switch to a heavier ink system or a finer realistic portrait system.

### Cel shading

Inherit VA01:
- restrained flat local color;
- one primary hard-edged cel-shadow family per facial form;
- optional small occlusion only where needed for readability;
- no airbrush gradient;
- no painterly skin modeling;
- no photoreal pore/skin texture;
- no cinematic bloom dependency.

## Phase A pass criteria

The preflight passes only if all six studies satisfy all of the following:

1. The viewer can reconstruct one stable identity from every angle.
2. Eye size changes only through expected perspective, not through style drift.
3. Iris/pupil complexity is identical across the set.
4. Nose construction remains the same system in front, 3/4, and profile.
5. Mouth deformation preserves one mouth/lip system.
6. `FC06` keeps teeth as a simplified mass without realistic per-tooth rendering.
7. Jaw width/chin length remain structurally compatible across all rotations.
8. Line-weight hierarchy remains inherited from VA01.
9. Facial shading remains restrained VA01 cel shading.
10. No sample reads as anime, photoreal portraiture, painterly concept art, or a separate heavy Western-comic face system.

If any one study switches facial systems, the preflight fails as a whole.

## Phase A reject conditions

Reject the entire preflight if:
- a rotated view acquires substantially larger or rounder eyes;
- a profile suddenly uses realistic portrait anatomy while the front view is graphic;
- iris/pupil rendering changes complexity between samples;
- nose rendering changes from simplified planes to full realistic contouring;
- mouth/teeth rendering changes system between neutral and open-mouth samples;
- jaw/chin structure changes identity rather than perspective;
- one panel uses heavier brows/jaw in a different comic sub-style;
- one panel uses soft manga/anime facial construction;
- line thickness or cel shading changes art family.

## Failure-reference rule

The previously observed **M03 / M04 drift is negative diagnostic evidence only**.

M03 / M04 must not be used as:
- positive style references;
- identity references;
- canonical mother assets;
- examples to imitate.

Their only valid use is to identify the failure category: **Face Construction Core drift**.

## Phase B deferred variables

After explicit human approval of Phase A, a later DRAFT review may test:
- different facial identities;
- face width;
- jaw width;
- cheek fullness;
- young-adult / adult / older-adult age treatment;
- sex presentation;
- skin-tone family;
- hair family.

Those variables must inherit the already-approved Face Construction Core rather than inventing a new one.

## On-image labels for Phase A

Only:
- `FC01`–`FC06`;
- `FRONT / 3Q-L / PROFILE-L / 3Q-R`;
- `NEUTRAL / SMILE / OPEN`.

No paragraphs, construction notes, JSON fields, or long explanations on the image.

## Lock rule

VA02-FACE-GRAMMAR remains **DRAFT** during Phase A.

Do not set it to `REVIEW` or `LOCKED` merely because a generated preflight looks acceptable.

A status change requires:
1. Phase A human approval;
2. cross-identity validation using the approved construction core;
3. explicit human approval of the resulting Face Grammar asset;
4. complete SPEC + PNG + annotations package validation under the Visual Asset Annotation Contract.
