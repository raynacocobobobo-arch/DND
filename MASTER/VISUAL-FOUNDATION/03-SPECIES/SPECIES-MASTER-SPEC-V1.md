# VA03 — Species Master Spec V1

**Status:** DRAFT SPEC  
**PV0 required species:** Human, Elf, Dwarf, Halfling, Gnome, Tiefling.  
**Source:** approved S02 Candlekeep Gate 2 + 15-level visual inventory.  
**Seed authority:** SEED-E for lineup organization; SEED-A for rendering language.

## Controls
VA03 locks recurring species anatomy, relative scale and silhouette across the project.

It controls:
- relative adult height;
- skeletal mass;
- head/body relation;
- signature anatomy;
- species silhouette;
- pairwise scale comparison.

It does **not** lock faction clothing, profession, personality, scene lighting or character identity.

## Production scale baselines
These are project visual-control ratios, not universal canonical heights.

| Species | Human-relative production height | Structural read | Non-negotiable |
|---|---:|---|---|
| Human | 100% | baseline adult, multiple body types | ~5–5.5-head project stylization |
| Elf | 100–103% | lighter/narrower, longer visual line | pointed ears; adult, not fragile child-thin |
| Dwarf | 80–83% | broad ribcage, dense torso, shorter powerful limbs | adult low/broad silhouette |
| Halfling | 56–60% | compact small adult | unmistakably adult; not toddler |
| Gnome | 60–64% | small/light adult, narrower than Dwarf | distinct from Halfling; not child wizard |
| Tiefling | ~100% | human-scale adult frame | horns + tail integrated into silhouette; no default wings |

Individual adults may vary inside a narrow band.

## Required board structure
The former mixed A/B board approach is retired. Each PV0 species receives its own single-species board. All species boards must share:
- white/light neutral background;
- exact shared ground line;
- orthographic-like asset presentation;
- no perspective scaling;
- comparable full-body standing poses;
- one 3/4 variant per species;
- one head/face inset per species;
- clear labels outside figure silhouettes.

Each single-species board needs:
1. front or slight 3/4 full body;
2. comparison-scale neighbor;
3. face/head inset;
4. silhouette note;
5. one forbidden-misread mini example or annotation.

## Species rules

### Human
Baseline only; broad body variation. Do not make “default human” synonymous with heroic male fighter.

### Elf
Height near Human. Differentiate through finer build, posture, facial structure and pointed ears, not extreme height or exaggerated anime ears.

### Dwarf
Not a uniformly scaled-down Human. Broader torso, substantial hands/forearms, shorter powerful limbs, adult face/posture. Never childlike.

### Halfling
Around three-fifths Human height. Compact adult skeleton. Readability comes from silhouette and staging, not artificially increasing height.

### Gnome
Similar small-height category but a different build/face language from Halfling. Do not rely on pointed hats as species shorthand.

### Tiefling
Human-scale body with coherent horn geometry and a functional tail. No random demon appendages, no wings by default, no “red Human only” treatment.

## Pairwise calibration
Mandatory comparisons:
- Human ↔ Elf
- Human ↔ Dwarf
- Human ↔ Halfling
- Halfling ↔ Gnome
- Human ↔ Tiefling

## Extension protocol
A later species absent from this PV0 set requires:
1. lore/Gate 2 justification in its scene;
2. textual anatomy construction rules;
3. dedicated visual extension board;
4. review against VA01 + VA02 + existing VA03;
5. compatible Foundation minor-version bump, e.g. V1.1;
6. LOCK before that scene enters Gate 3.

Existing locked species are not redrawn simply because a new species is added.

## Reject conditions
- small species as children;
- every species forced into the same human skeleton;
- species difference shown only through skin color;
- faction costume used as anatomy shorthand;
- perspective differences mistaken for species height.


## Single-species asset rule

PV0 uses six separate mother assets:
- VA03-HUMAN
- VA03-ELF
- VA03-DWARF
- VA03-HALFLING
- VA03-GNOME
- VA03-TIEFLING

Each one must show meaningful within-species variation in height, body type, adult age and sex presentation. A species is not represented by one canonical mannequin.

Each asset follows the Visual Asset Annotation Contract and requires SPEC + PNG + annotations JSON before LOCK.
