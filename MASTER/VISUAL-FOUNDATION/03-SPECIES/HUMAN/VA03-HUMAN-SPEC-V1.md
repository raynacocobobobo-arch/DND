# VA03-HUMAN — Human Species Variation Spec V1

**Status:** DRAFT SPEC  
**Parent style:** VA01 — Style Calibration V1  
**Humanoid grammar:** VA02 — Humanoid Rendering Grammar

## Controls
This asset locks the Human variation space used across the project:
- human adult anatomy under one fixed **5.3-head** project stylization;
- allowed height variation;
- allowed body-type variation;
- age variation;
- face-family variation;
- adult silhouette diversity.

It does not lock occupation, faction clothing, character identity, hairstyle, weapon, scene lighting or social role.

## Required visual samples
Use **six adults** on a white/light neutral background with one exact ground line.

Required spread:
- one shorter lean **adult Human with the same 5.3-head ratio**;
- one average-height average-build adult;
- one taller lean adult;
- one broad/strong adult;
- one heavy/soft-bodied adult;
- one older adult whose age is visible through face, hair and posture rather than photoreal wrinkles; body ratio remains 5.3 heads.

Across the six:
- both male and female presentation;
- no duplicate face templates;
- no duplicate orange-hair “small/large version” pairing;
- at least three distinct hair families;
- clothing remains neutral fantasy calibration clothing and must not imply one faction.

## On-image labels
Each figure receives only:
- ID: `H01`–`H06`;
- height tag: `SHORT / AVG / TALL`;
- body tag: `LEAN / AVG / BROAD / HEAVY`;
- optional `OLDER` tag.

No long paragraphs.

## Human invariants
- unmistakably adult;
- **all Human samples use the same 5.3-head body ratio**;
- functional adult limb proportions;
- readable hands;
- face grammar inherited from VA02;
- no chibi anatomy.

## Allowed variables
- relative adult height;
- body mass;
- shoulder width;
- age;
- skin-tone family;
- face shape;
- hair color/texture/style;
- neutral calibration clothing.

## Forbidden misreads
- all humans share one heroic body;
- women are always small/lean while men are always broad;
- old age represented only by gray hair on an otherwise identical face;
- one figure is merely a scaled-up or scaled-down copy of another;
- body-size differences created by perspective;
- fashion-model 7.5–8-head anatomy.


## Proportion lock

**Body-type variation must never be implemented by changing head/body ratio.**

For VA03-HUMAN V1:
- every sample uses **5.3 heads**;
- short / average / tall changes overall adult stature, not species scale;
- lean / average / broad / heavy changes width, mass distribution and soft-tissue volume;
- older changes face, hair and posture;
- no sample may use an enlarged head or shortened-limb construction to imply “short”;
- no Human may visually approach Halfling/Gnome construction.

The minimum short-human sample must still read immediately as a normal adult Human when shown without labels.


## Rejected draft record

**2026-10-02 — Draft rejected.**

Observed failure:
- H01 / H02 / H05 used a softer, larger-eye, rounder facial grammar;
- H03 / H04 / H06 used a narrower-eye, stronger-brow/jaw, more mature Western-comic facial grammar.

This is a **style-system inconsistency**, not acceptable within one species board.

Before regenerating VA03-HUMAN, VA02 must first establish one stable humanoid facial grammar. Human variation may change height, body mass, age, face shape and skin tone, but not the underlying eye/nose/mouth/jaw drawing system.
