# CURRENT

## Repository bootstrap

**Status: VERIFIED COMPLETE**

## Active level

**S02 — CANDLEKEEP**

## Gate state

- Gate 0 — Lore Lock: **APPROVED**
- Gate 1 — Scene Lock: **APPROVED**
- Gate 2 — Population Lock: **APPROVED**
- Gate 3 — Asset Lock: **BLOCKED BY PV0**
- Gate 4 — Blocking Lock: BLOCKED
- Gate 5 — Scene Lock / Visual QC: BLOCKED
- Gate 6 — Hidden-Object Lock: BLOCKED
- Gate 7 — Level Lock: BLOCKED

## Approved scene decision

**Subscene:** Court of Air / visitor interface.

**Scene state:** New Seekers are being registered and routed through the public-facing Candlekeep workflow while normal Avowed work continues and the Endless Chant passes through the shared space.

The project-defined time/weather treatment remains `【PROJECT】` until explicitly revised.

## Global Visual Foundation

- Branch work: **PV0 in progress**
- Current Foundation status: **DRAFT**
- PV1: **NOT STARTED**
- Gate 3 cannot begin until both Candlekeep Gate 2 and PV0 are explicitly approved.

## Candlekeep Gate 2 review findings

Reviewed together:
1. `04-POPULATION-MODEL.md`
2. `05-SPECIES-SCALE.md`
3. `06-FACTION-STYLE.md`

### Checks that pass
- Population arithmetic: **60 = 36 resident/institutional + 24 visitor/special**.
- Layer arithmetic and species arithmetic are internally consistent.
- The institution remains the structural base rather than a generic adventurer crowd.
- Zero non-humanoid creatures is justified for this public visitor-interface slice.
- Endless Chant is integrated as institutional behavior, not spectacle.
- Species diversity is subordinate to role/institutional identity.
- Faction/style language explicitly avoids invented Candlekeep crests, magic-school uniforms and unsupported official costume claims.
- Magic is task-driven.

### Corrections made during review
- Clarified that Human/Elf/Dwarf/Halfling/Gnome/Tiefling counts are **project casting choices**, not an official Candlekeep species census.
- Removed a visual contradiction: Species Scale previously said “realistic adult head/body ratio”; it now inherits the project’s **~5–5.5-head** stylization baseline from `MASTER/STYLE-LOCK-V1.md`.
- Clarified that Candlekeep Gate 2 locks scene-relative species relationships only; cross-project anatomy is governed by the future PV0 Species Master before Gate 3.

### Remaining holds
- Exact Avowed costume details still require comparison against verified official Candlekeep visual references before Gate 3 character sheets.
- Gate 3 remains blocked until **PV0 — Global Visual Prelock** is explicitly approved and LOCKED.

## Gate 2 approved population lock

- Total readable figures: **60**
- Resident/institutional: **36**
- Visitor/special: **24**
- Non-humanoid creatures: **0**
- Approved species casting: Human 38, Elf 7, Dwarf 5, Halfling 4, Gnome 3, Tiefling 3
- Institutional visual principle: one old knowledge institution receiving many different visitors
- Scene-specific visual language remains subordinate to the Global Visual Foundation

## Known spatial blockers for later stages

- Court of Air building orientation and exact public-facing sightlines require final map/body-text verification before Blocking.
- Precise relationship among entrance spaces, the Emerald Door, and nearby service structures must not be invented.
- Avowed costume specifics must remain tied to verified official visual references rather than generic wizard-robes assumptions.

## Next action

Proceed with Global Visual Foundation PV0 construction at the **VA02-FACE-GRAMMAR** layer.

Immediate visual task:
1. run the mandatory **single-identity Face Construction Core preflight**;
2. vary only camera angle and mild expression;
3. obtain explicit human approval of that preflight;
4. only then run cross-identity Face Grammar validation;
5. do not resume VA03-HUMAN until Face Grammar has passed the required review path.

Candlekeep Gate 2 is **APPROVED**. Gate 3 remains blocked until **PV0 — Global Visual Prelock** is LOCKED.

The approved pilot species set is:
- Human
- Elf
- Dwarf
- Halfling
- Gnome
- Tiefling


## VA01 Style Lock

**VA01 — Style Calibration: LOCKED**

Human approved the third calibration iteration as the project's **mother-image asset**.

- Repository preview: `MASTER/VISUAL-FOUNDATION/01-STYLE/STYLE-CALIBRATION-BOARD-V1.png`
- Full-resolution canonical Library asset: `/DND/Global Visual Foundation/VA01_STYLE_CALIBRATION_BOARD_V1.png`
- Library file: `libfile_2019bdea6c3081918b8ea7fa717d959b`
- General style now inherits from VA01, not directly from the bootstrap Seed images.
- The former combined **VA02 — Human / Face / Hand** anchor is **RETIRED**.
- Current next visual anchor: **VA02-FACE-GRAMMAR — DRAFT**.

## VA02 Face Construction Core corrective state

**VA02-FACE-GRAMMAR: DRAFT — SINGLE-IDENTITY PREFLIGHT REQUIRED**

- VA03-HUMAN remains rejected/unusable and must not be regenerated yet.
- Earlier M03 / M04 outputs are **negative diagnostic references only**; they are not positive mother assets.
- Failure category: different samples switched eye, brow, nose, mouth and jaw construction systems.
- The next image must contain one fixed adult identity only.
- Required Phase A samples: `FC01`–`FC06` = front / 3Q-left / profile-left / 3Q-right / closed-mouth smile / mild open-mouth teeth.
- Fixed across samples: identity, age, face shape, skin tone, hair, crop, collar, light and background.
- Variable only: camera angle and mild expression.
- A Phase A pass does **not** LOCK VA02. Human approval is required before cross-identity validation.
- No visual asset may be marked `LOCKED` without explicit human approval and a valid SPEC + PNG + annotations package.
