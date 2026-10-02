# Style Binding Contract V1 — VA03 Species Boards

**Status:** ACTIVE GENERATION SAFETY RULE  
**Scope:** VA03-HUMAN / ELF / DWARF / HALFLING / GNOME / TIEFLING  
**Purpose:** prevent the image generator from replacing the approved project art family with a generic semi-realistic game-concept-sheet style.

## 1. Root failure

The rejected Dwarf attempts proved that prose such as “clean black lines / flat color / cel shading” is not a sufficient style lock.

A fresh text-to-image request can satisfy the anatomy prompt while silently switching to:
- semi-realistic character concept art;
- realistic skin and material rendering;
- gray studio lineup sheets;
- high-detail leather/armor;
- portrait-style faces;
- extra turnaround/headshot infographic panels.

Therefore VA03 species boards may no longer be generated from text alone.

## 2. Mandatory image authorities

### A. Primary board template — accepted VA03 Human candidate

Source:
- file: `va03人类角色诊断图表.png`
- conversation file ID: `file_00000000c4148211a2f8d8691d32df8c`
- SHA-256: `8a1f86030ca0e2388be6a54c17c0b44607834d39b5ff8a514e01f9a5e183a5a5`
- dimensions: 1448×1086

This image is the **direct visual template for all subsequent VA03 species boards**.

Inherit:
- white background;
- lineup spacing;
- one shared ground line;
- bold clean black contour language;
- simple internal linework;
- flat local color;
- restrained cel shading;
- face rendering family;
- simple neutral fantasy calibration clothing;
- board simplicity;
- label density and general visual hierarchy.

Do not inherit:
- Human anatomy;
- Human ears;
- Human height;
- Human chassis labels;
- exact identities.

### B. Locked VA01

Source:
- Library file ID: `libfile_2019bdea6c3081918b8ea7fa717d959b`
- source file ID: `file_00000000b8048207a408bf22121bcf83`
- SHA-256: `3ead1c8506bb415921d2cbbe971c149031ae17c177fe3691a99e8403e423a6e3`

Role:
- global rendering regression check;
- line / color / shading / face-hand art-family authority.

### C. SEED-A

Source:
- Library file ID: `libfile_5c34112bb40881919aaa8bf29989f972`
- source file ID: `file_00000000f8988207b1b25b210f8231a7`
- SHA-256: `3c60a705114a1b9d632ccad7ea13f9951bc6ca5cc21685e80b0e02a027d32b86`

Role:
- character-rendering feel and readable adult fantasy cartoon language.

SEED-A does not control species anatomy.

## 3. Binding priority

For VA03 non-Human species boards:

1. **Official 5E/SRD facts** — species truth.
2. **Matching VA01 species exemplar** — project anatomy/silhouette translation.
3. **Target species SPEC + annotations** — controlled variation space.
4. **VA01 + VA02 Face Grammar** — rendering grammar.
5. **Accepted Human Board** — board layout / label density / simple calibration-clothing behavior only.
6. **SEED-A** — general character-rendering regression.
7. Text prompt — execution detail only.

The Human Board is never a non-Human anatomy source.

## 4. Mandatory generation route

### Forbidden routes
- `Human body → scale/morph into non-Human species`
- `species prose only → fresh image with no visual species anchor`

### Required route
`official species facts + matching VA01 species exemplar → Species Anatomy Core → target species sample`

Then apply:
`VA01/VA02 rendering grammar + accepted Human Board board/layout grammar`.

The generator must build the target species anatomy from its own VA01 exemplar, while using the Human Board only to keep the diagnostic-board presentation consistent.

## 5. Single-sample preflight

Before generating all six samples for any new species, run one isolated diagnostic sample.

For Dwarf:
- target: `D02 / DB02 STANDARD DENSE / adult feminine Dwarf`;
- anatomy authority: official Dwarf facts + VA01 Dwarf exemplar;
- style authority: VA01 + current Face Grammar;
- board authority: accepted Human Board only for white background, ground line, label density and simple calibration clothing.

The preflight must pass both:
1. Species Truth;
2. Project Style.

Do not proceed to the six-Dwarf board until both pass.

## Dwarf anatomy-image binding

For the current Dwarf preflight, the positive anatomy images are explicit:

### Primary anatomy exemplar
- source: locked VA01;
- source file ID: `file_00000000b8048207a408bf22121bcf83`;
- diagnostic crop on the inspected 1672×941 source: `[1165,135,1315,515]`;
- controls: compact trunk, low broad silhouette, ~4.0-head project construction, short lower limbs, thick forearms/hands.

### Action confirmation
- source: SEED-A;
- source file ID: `file_00000000f8988207b1b25b210f8231a7`;
- diagnostic crop: `[585,275,790,540]`;
- controls: anatomy remains dense/broad during active forward-reaching pose.

### Dwarf preflight route
Do **not** edit H02 into a shorter person.

Generate/transform one isolated `D02 / DB02 STANDARD DENSE / adult feminine Dwarf` from the Dwarf exemplar anatomy, while borrowing the accepted Human Board only for:
- white background;
- simple tunic/trouser/boot presentation;
- clean black line family;
- flat color / cel shading;
- label simplicity.

If D02 has Human-length legs, Human-light forearms/hands, or becomes correct only after vertical scaling, reject as `SCALED_DOWN_HUMAN`.

## 6. Style-binding pass criteria

The edited sample must preserve:
- same black contour thickness family;
- same simple eye/nose/mouth rendering;
- same flat skin/clothing color behavior;
- same cel-shadow complexity;
- same simplified hair rendering;
- same simple tunic/trouser/boot material treatment;
- same white background;
- same board cleanliness.

Only the target species anatomy should change.

## 7. Immediate abort conditions

Abort and reject without further iteration if the output introduces:
- realistic or semi-realistic skin;
- detailed pores / facial modeling;
- 3D/CGI lighting;
- painterly texture;
- gray studio background;
- realistic leather/metal material studies;
- highly detailed armor;
- cinematic light;
- fine portrait linework;
- extra turnarounds;
- extra face close-up grids;
- large explanatory infographic blocks;
- a different eye/nose/mouth art system.

These are **style-binding failures**, not anatomy failures.

## 8. Negative-reference quarantine

All Dwarf images generated during the failed 2026-10-02 sequence are negative references only.

They must never be supplied to the generator together with a future Dwarf attempt, because doing so can contaminate the style context.

Their only valid use is to label the failure class:
`GENERIC_SEMI_REALISTIC_GAME_CONCEPT_SHEET_DRIFT`.

## 9. Reference loading rule

Before every VA03 non-Human generation:
1. verify official 5E/SRD facts for the target species;
2. load/inspect the matching VA01 species exemplar;
3. verify the target Species Anatomy Core / SPEC;
4. load/inspect VA01 and the current Face Grammar;
5. load/inspect the accepted Human Board only for board/layout/rendering consistency;
6. load/inspect SEED-A for character-rendering regression;
7. only then invoke generation/editing.

If the three images are not actually available in context, stop generation.

## 10. Approval / lock rule

Passing style binding does not approve a species board.

The normal sequence remains:
`style preflight → full species diagnostic → internal QC → human review → SPEC+PNG+annotations verification → LOCK`.

No automatic LOCK.
