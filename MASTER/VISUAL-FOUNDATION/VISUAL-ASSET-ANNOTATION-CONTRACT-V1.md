# Visual Asset Annotation Contract V1

**Status:** ACTIVE DESIGN RULE

## 1. Core rule

Every canonical visual mother asset must be a three-part package:

1. **SPEC** — what the asset controls and what it must not control.
2. **BOARD / PNG** — what the visual standard actually looks like.
3. **ANNOTATIONS JSON** — machine-readable data describing the samples, invariant traits, variable traits and inheritance boundaries.

A visual mother asset may be DRAFT or REVIEW without all three files, but it may not become **LOCKED** until all required package files exist and validate.

## 2. Why annotations are mandatory

The image alone is ambiguous. Future production must be able to distinguish:
- species-defining anatomy from individual hairstyle/clothing;
- fixed visual constraints from allowed variation;
- body-size variation from perspective;
- age variation from species differences;
- project style from one accidental character design.

Annotations therefore define what the model should and should not infer from each visible sample.

## 3. On-image annotation policy

Image boards must remain visually simple. Do not turn the board into a dense infographic.

Allowed visible labels:
- sample ID;
- short body-type tag;
- short age tag;
- short height-band tag;
- minimal arrows for one or two critical anatomical traits.

Do not put long paragraphs, full JSON fields, lore citations or production notes inside the image.

## 4. Required annotation package fields

Each `*.annotations.json` must contain:

- `assetId`
- `assetVersion`
- `boardFile`
- `specFile`
- `status`
- `controls`
- `doNotInherit`
- `samples`
- `invariants`
- `variables`
- `forbiddenMisreads`

Each sample must contain at least:

- `id`
- `species` or `subjectType`
- `sexPresentation`
- `ageBand`
- `heightBand`
- `bodyType`
- `headBodyRatio`
- `skinToneFamily`
- `hair`
- `pose`
- `clothingScope`
- `sampleControls`
- `sampleDoNotInherit`

Species boards additionally require:
- `relativeHeightToHuman`
- `skeletalRead`
- `signatureAnatomy`
- species-specific anatomy fields where applicable, such as `earRule`, `hornRule`, `tailRule`.

## 5. Variation principle

A Species Board must describe a **stable variation space**, not one canonical mannequin.

Every core species board should sample meaningful variation across:
- height within species range;
- lean / average / broad / heavy body types where anatomically plausible;
- young-adult / adult / older adult;
- more than one face family;
- more than one hairstyle;
- male/female presentation.

Species invariants remain stable while those variables change.

## 6. Inheritance priority

Annotations are interpreted together with the image and spec:

- SPEC defines the scope.
- PNG shows the appearance.
- JSON states which visible properties are invariant and which are accidental/sample-specific.

If the image appears to imply something the JSON explicitly marks `doNotInherit`, do not inherit it.

## 7. Lock rule

A visual mother asset can be `LOCKED` only if:

- spec exists;
- board image exists;
- annotations JSON exists;
- manifest points to all three;
- board SHA-256 matches the manifest;
- annotations SHA-256 matches the manifest;
- annotations reference the same asset ID/version;
- annotations contain non-empty `controls`, `doNotInherit`, `invariants`, `variables` and `samples`.

## 8. Species-board naming

PV0 species mother assets use:

- `VA03-HUMAN`
- `VA03-ELF`
- `VA03-DWARF`
- `VA03-HALFLING`
- `VA03-GNOME`
- `VA03-TIEFLING`

Each species gets its own board so the reference remains legible to both humans and image models.

## 9. Tiefling project sample rule

For this project's PV0 visual standard:
- primary default sample palette is **red-family skin**;
- the board may show multiple red-family values (crimson, brick, warm red, dark muted red);
- horns are required;
- a tail is required;
- wings are not default;
- body type, height, face, age, horn shape and hair may vary within the board.

This is a **project visual-default rule**, not an assertion that all D&D tieflings universally have red skin.
