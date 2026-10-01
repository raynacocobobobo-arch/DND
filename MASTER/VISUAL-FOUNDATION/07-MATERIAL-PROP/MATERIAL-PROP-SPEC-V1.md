# VA07 — Material / Prop Rendering Spec V1

**Status:** DRAFT SPEC

## Controls
VA07 locks material and small-object rendering so very different settings still belong to one art system.

## Required material families
- parchment / paper;
- cloth;
- leather;
- common metal;
- wood;
- stone;
- glass / bottle;
- water / ice / fire treatment;
- purposeful magical light/effect.

## Rendering rule
Materials are distinguished through:
- local color;
- edge/shape language;
- one restrained shadow family;
- selective highlights;
- a small number of graphic texture cues.

They are **not** distinguished through photoreal PBR rendering or dense texture maps.

## Required board content
For each material:
- one simple swatch/object;
- one used/worn object;
- one small-scale in-scene crop.

Required prop examples should include book/parchment, belt/bag, weapon/tool metal, crate/table wood, masonry stone, bottle/glass and one functional spell effect.

## Magic
Magic must be visually coherent with the illustration:
- clear silhouette;
- limited glow;
- visible relationship to the task;
- no uncontrolled bloom washing out line art.

## Pass criteria
- material families distinguishable at a glance;
- props remain readable at Hidden-Object scale;
- all materials look illustrated by the same hand.

## Reject conditions
- photoreal metal reflections;
- texture-noise overload;
- painterly stone while characters are flat/cartoon;
- bloom-heavy magic;
- random glow on nonmagical props.
