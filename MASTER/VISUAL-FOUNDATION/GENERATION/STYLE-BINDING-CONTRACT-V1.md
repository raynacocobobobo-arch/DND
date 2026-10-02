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

For VA03 species boards:

1. **Accepted Human Board** — direct image/template behavior.
2. **VA01** — art-family regression authority.
3. **SEED-A** — character-rendering regression authority.
4. **Target species SPEC + annotations** — anatomy changes only.
5. Text prompt — last priority.

If text conflicts with the actual image authorities on rendering style, the images win.

## 4. Mandatory generation route

### Forbidden route
`species text spec → fresh text-to-image board`

### Required route
`accepted Human Board image → image edit / transformation → target species anatomy`

The generator must treat the Human Board as the base canvas/template, not merely as an inspirational reference.

Only these categories should change:
- species skeleton;
- relative stature;
- signature anatomy;
- identity variables required by the target species contract;
- sample IDs / chassis tags.

Keep the rendering system and board system intact.

## 5. Single-sample preflight

Before editing all six samples for any new species, run one small diagnostic edit.

For Dwarf:
- source sample: H02 / B02 adult feminine Human;
- target: D02 / DB02 STANDARD DENSE adult feminine Dwarf;
- keep all other Human-board samples unchanged during the preflight.

The preflight checks whether the runtime can alter species anatomy **without changing drawing style**.

Do not proceed to the six-Dwarf board until the preflight passes.

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

Before every VA03 generation:
1. load/inspect the accepted Human Board;
2. load/inspect VA01;
3. load/inspect SEED-A;
4. verify exact target species SPEC;
5. only then invoke image editing.

If the three images are not actually available in context, stop generation.

## 10. Approval / lock rule

Passing style binding does not approve a species board.

The normal sequence remains:
`style preflight → full species diagnostic → internal QC → human review → SPEC+PNG+annotations verification → LOCK`.

No automatic LOCK.
