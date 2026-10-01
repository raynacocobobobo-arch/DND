# D&D 5E Hidden-Object Level Production System — Design Spec

**Date:** 2026-10-01  
**Status:** Proposed / awaiting written-spec approval  
**Repository:** `raynacocobobobo-arch/DND`  
**Default branch:** `main`

## 1. Final product mission

This project exists to build **15 complete, game-ready D&D / 5E Hidden-Object levels**.

The final deliverable is **not** a lore archive, a collection of research notes, fifteen standalone illustrations, or sixty-character reference sheets by themselves. Those are production assets.

The actual product is:

> **A standardized D&D 5E Hidden-Object level-production system, used to deliver 15 visually coherent, lore-grounded, character-dense, playable hidden-object levels with complete target, clue, answer and UI data.**

Every research document, species sheet, character board, event island, blocking pass and prompt exists only to improve the reliability and quality of those 15 final levels.

### Product-level decision test

Before adding work to the project, ask:

> **Does this materially help us produce, validate, integrate or maintain one of the 15 final playable levels?**

If not, it is out of scope.

---

## 2. Final deliverables

### 2.1 Project-level Definition of Done

The project is complete only when all 15 scenes have become **complete level packages** that can be handed to a game implementation layer without re-deriving the art or gameplay design.

Each level must contain:

1. final large ensemble scene;
2. final hidden-object target set;
3. target answer locations;
4. clue crops / target thumbnails;
5. UI assets;
6. level metadata;
7. production source assets required for revision;
8. evidence-backed research and approval history.

### 2.2 Canonical scene goals

Each final level should:

- be grounded in official 5E / D&D setting material;
- use SRD 5.1 and SRD 5.2.1 as the shared rules/asset substrate;
- select one representative subscene rather than collapsing an entire region into one image;
- use a scene-specific casting population, generally about **55–70 readable figures**, rather than forcing an exact number where the location ecology says otherwise;
- preserve recognizable species anatomy, faction/cultural visual language, class/NPC behavior, tools, equipment and purposeful magic;
- organize the final crowd into 8–12 readable event islands;
- keep characters visually primary and the environment one detail level simpler;
- use weak/compressed perspective suitable for hidden-object gameplay;
- remain visually coherent before any hidden-object UI is added;
- expose structured target/clue/answer data so the level can be implemented rather than merely viewed.

The working norm remains approximately 60 characters, but **scene logic outranks a rigid numeric quota**.

---

## 3. Source hierarchy and evidence labels

Every factual claim in project research must carry or inherit one of these evidence classes.

### `【SRD-5.1】`
Wizards of the Coast SRD 5.1 open material.

Used primarily for:
- 2014 5E race/class baselines;
- NPC archetypes;
- adventuring, travel, rest and downtime;
- monsters, traps, poisons and planes where applicable.

### `【SRD-5.2.1】`
Wizards of the Coast SRD 5.2.1 open material.

Used primarily for:
- updated species;
- 2024 classes/backgrounds;
- detailed equipment and tool behavior;
- environmental effects;
- updated monsters/animals.

### `【OFFICIAL-SETTING】`
Official Wizards / D&D Beyond adventure, setting, map, article or art.

Used for:
- location identity;
- geography;
- local factions;
- named organizations;
- local culture and customs;
- campaign state;
- setting-specific species and creatures;
- architecture and visual references.

### `【OFFICIAL-INDEX】`
An official source confirms that a chapter/topic exists, but the accessible source does not expose enough body text to verify the full detail.

This tag is mandatory when the evidence is only a table of contents or public index.

### `【PROJECT】`
Project-side decisions and inference, including:
- exact 60-person counts;
- chosen time of day;
- event-island staging;
- character position;
- hidden-object placement;
- composition simplification.

**Hard rule:** `【PROJECT】` must never be presented as official lore.

---

## 4. Repository architecture

The repository root will use the following structure:

```text
/
├── README.md
├── CURRENT.md
├── ACTIVE-DOCS-INDEX.md
│
├── MASTER/
│   ├── DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md
│   ├── PRODUCTION-STANDARD-V1.md
│   ├── GATE-SYSTEM-V1.md
│   └── STYLE-LOCK-V1.md
│
├── WORKFLOW/
│   ├── 01-RESEARCH.md
│   ├── 02-SUBSCENE-SELECTION.md
│   ├── 03-SCENE-STATE.md
│   ├── 04-POPULATION.md
│   ├── 05-SPECIES-SCALE.md
│   ├── 06-FACTION-STYLE.md
│   ├── 07-CHARACTER-ASSETS.md
│   ├── 08-PROPS-CREATURES.md
│   ├── 09-EVENT-ISLANDS.md
│   ├── 10-BLOCKING.md
│   ├── 11-FINAL-SCENE.md
│   ├── 12-SCENE-QA.md
│   ├── 13-HIDDEN-OBJECTS.md
│   ├── 14-LEVEL-DATA-AND-UI.md
│   └── 15-ARCHIVE.md
│
├── TEMPLATES/
│   ├── LOCATION-RESEARCH-TEMPLATE.md
│   ├── SUBSCENE-DECISION-TEMPLATE.md
│   ├── SCENE-STATE-TEMPLATE.md
│   ├── POPULATION-MODEL-TEMPLATE.md
│   ├── SPECIES-SCALE-TEMPLATE.md
│   ├── FACTION-STYLE-TEMPLATE.md
│   ├── 60-CHARACTERS-TEMPLATE.csv
│   ├── PROPS-CREATURES-TEMPLATE.md
│   ├── EVENT-ISLANDS-TEMPLATE.md
│   ├── ACTOR-BLOCKING-TEMPLATE.md
│   ├── FINAL-PROMPT-TEMPLATE.md
│   ├── TARGETS-TEMPLATE.json
│   ├── ANSWER-MAP-TEMPLATE.json
│   ├── LEVEL-METADATA-TEMPLATE.json
│   └── QA-TEMPLATE.md
│
├── SCENES/
│   ├── S01-BALDURS-GATE/
│   ├── S02-CANDLEKEEP/
│   ├── S03-CALIMPORT/
│   ├── S04-MYTH-DRANNOR/
│   ├── S05-ICEWIND-DALE/
│   ├── S06-PORT-NYANZARU/
│   ├── S07-VALLAKI/
│   ├── S08-SALTMARSH/
│   ├── S09-GRACKLSTUGH/
│   ├── S10-MAELSTROM/
│   ├── S11-AVERNUS/
│   ├── S12-WITCHLIGHT-CARNIVAL/
│   ├── S13-ROCK-OF-BRAL/
│   ├── S14-RADIANT-CITADEL/
│   └── S15-WELL-OF-DRAGONS/
│
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

### Root documents

#### `README.md`
The entry point for humans and agents:
- project goal;
- 15 locked scenes;
- source policy;
- production flow;
- gate summary;
- where current work lives.

#### `CURRENT.md`
The operational status page:
- active scene;
- current gate;
- approved decisions;
- blockers;
- next required action.

#### `ACTIVE-DOCS-INDEX.md`
A canonical index of current authoritative files and superseded versions.

---

## 5. Five information / production layers

### Level A — Master Rule Database

Shared across all scenes.

Contains:
- species/races;
- 12 classes;
- backgrounds;
- NPC archetypes;
- equipment;
- tools;
- spells;
- vehicles;
- hirelings;
- environment;
- travel/rest/downtime;
- traps and general monster logic.

**Question answered:** “What does 5E support?”

### Level B — Location Bible

One per official location.

Contains:
- location;
- geography;
- history;
- architecture;
- climate;
- factions;
- residents;
- culture/customs;
- official maps;
- official art;
- campaign context.

**Question answered:** “What is this place?”

### Level C — Subscene Bible

One selected slice per scene.

Contains:
- exact sub-location;
- time;
- weather;
- campaign state;
- event;
- people present;
- visible boundaries;
- what is excluded.

**Question answered:** “What exact moment are we drawing?”

### Level D — Production Pack

Directly drives scene creation.

Contains:
- character table;
- species scale;
- faction/culture visual language;
- props;
- creature assets;
- event islands;
- actor blocking;
- prompt;
- scene corrections.

**Question answered:** “How is this exact scene built reliably?”

### Level E — Game Level Package

Directly drives gameplay implementation.

Contains:
- final scene image;
- target list;
- answer positions;
- clue images;
- target icons;
- UI;
- level metadata.

**Question answered:** “How does this scene become a playable hidden-object level?”

---

## 6. Standard production flow

Every scene follows the same ordered stages.

### Stage 01 — Official research
Output: `01-LOCATION-RESEARCH.md`

Research:
- official source and chapter;
- maps and art;
- geography;
- social customs;
- faction structure;
- residents;
- species;
- NPCs;
- monsters;
- tools;
- travel;
- local visual anchors.

No composition decisions yet.

### Stage 02 — Subscene selection
Output: `02-SUBSCENE-DECISION.md`

Candidate subscenes are scored 1–5 on:
- typicality;
- ability to naturally hold a crowd;
- event density;
- thumbnail recognizability;
- setting representativeness;
- differentiation from the other 14 scenes.

Only one subscene survives.

### Stage 03 — Scene-state lock
Output: `03-SCENE-STATE.md`

Lock:
- time;
- weather;
- campaign state;
- current event;
- event phase;
- reason the crowd is present;
- emotional tone.

Requirement:
> The scene must be explainable in one sentence.

### Stage 04 — Population model
Output: `04-POPULATION-MODEL.md`

Population is modeled in five layers:
1. permanent residents;
2. institutional staff;
3. temporary visitors;
4. special narrative roles;
5. non-humanoid creatures.

Species counts are assigned only after these layers are known.

### Stage 05 — Species scale
Output: `05-SPECIES-SCALE.md`

Lock:
- relative height;
- skeleton;
- head/body proportion;
- ears/horns/tail;
- species-consistent silhouette.

Purpose:
- stop dwarves, gnomes, dragonborn, goliaths, giants, etc. drifting in scale.

### Stage 06 — Faction / cultural visual language
Output: `06-FACTION-STYLE.md`

Lock per faction/culture:
- material;
- palette range;
- clothing silhouette;
- armor tendency;
- insignia;
- tools;
- forbidden elements.

Group resemblance is intentional.

### Stage 07 — 60-character casting sheets
Outputs:
- `07-60-CHARACTERS.csv`
- white-background Sheet A (01–20)
- Sheet B (21–40)
- Sheet C (41–60)

Each character records:
- ID;
- species;
- sex;
- age;
- height;
- body type;
- faction/culture;
- social role;
- class/NPC archetype;
- clothing;
- armor;
- weapon;
- tool;
- carried item;
- action tendency;
- expression;
- interaction target;
- visual priority;
- evidence tag.

### Stage 08 — Props and creatures
Output: `08-PROPS-CREATURES.md`

Priority:
1. location-specific official props;
2. SRD equipment;
3. SRD tools;
4. setting-specific creatures;
5. project additions.

Magic must have a purpose:
- Mage Hand moves/manipulates;
- Mending repairs;
- Detect Magic inspects;
- Bless prepares;
- Minor Illusion communicates/simulates.

No decorative glow-orb magic.

### Stage 09 — Event islands
Output: `09-EVENT-ISLANDS.md`

Target:
- 8–12 event islands;
- usually 3–7 people each.

Each island contains:
- primary action;
- secondary action;
- eye-line relationship;
- reaction/conflict;
- at least one readable prop.

Priority:
- A: 3–4 primary islands;
- B: 4–5 secondary islands;
- C: 2–4 detail/humor islands.

### Stage 10 — Actor blocking
Output: `10-ACTOR-BLOCKING.md`

Rules:
- weak/compressed perspective;
- stage-like horizontal spread;
- figures stay readable at the rear;
- avoid realistic continuous scale collapse.

Target figure scale:
- foreground: 105–110%;
- core midground: 100%;
- rear/platform: 85–90%.

Characters are arranged first. Background is fitted around them.

### Stage 11 — Background / final scene
Output:
- final background layout;
- integrated full scene;
- final prompt record.

Background priority:
1. location recognition anchor;
2. structures required for character actions;
3. paths;
4. functional props;
5. decoration.

Background stays one detail level simpler than characters.

### Stage 12 — Character correction
Correct in this order:
1. proportion;
2. species anatomy;
3. face/expression;
4. action;
5. density;
6. composition;
7. background detail;
8. color.

Local problems are fixed locally. Do not invent a new workflow version because one image has a local failure.

### Stage 13 — Hidden-object design
Only after the scene itself passes QC.

Outputs:
- target IDs;
- target set;
- proposed hiding logic;
- difficulty;
- clue concepts.

Targets must:
- fit the world;
- be readable;
- not rely on microscopic pixels;
- be hidden by context, overlap or similarity rather than arbitrary blur.

### Stage 14 — Level data and UI

Outputs in each scene's `LEVEL/` package:
- `scene-final.png`;
- `targets.json`;
- `answer-map.json`;
- `level-metadata.json`;
- clue crops;
- target icons;
- UI assets.

Each target record must support at least:
- ID;
- name;
- type: character / object / creature;
- scene region;
- answer location;
- difficulty;
- event-island relation;
- clue;
- thumbnail/icon;
- whether it is required.

The exact coordinate format is an implementation detail to be fixed in the implementation plan.

### Stage 15 — Archive / current-state update
Update:
- scene folder;
- `CURRENT.md`;
- `ACTIVE-DOCS-INDEX.md`;
- gate status;
- approval state.

---

## 7. Gate system

The gate system is a **hard production dependency graph**.

A later stage must not start until its required gate is explicitly approved.

### GATE 0 — Lore Lock

**Inputs**
- official source list;
- location research;
- evidence labels;
- official maps/art references.

**Pass conditions**
- location identity is correct;
- key factions are sourced;
- resident/visitor logic is distinguishable;
- species logic is not invented;
- unknowns are marked;
- project inference is labeled.

**Pass unlocks**
- subscene selection.

**Fail returns to**
- Stage 01.

---

### GATE 1 — Scene Lock

**Inputs**
- candidate subscene scorecard;
- chosen subscene;
- scene state.

**Pass conditions**
- one subscene only;
- one time slice;
- one main event;
- the scene can be summarized in one sentence;
- the choice is representative of the location;
- the choice is distinct from the other scenes.

**Pass unlocks**
- population modeling.

**Fail returns to**
- Stages 02–03.

---

### GATE 2 — Population Lock

**Inputs**
- population model;
- species scale;
- faction/culture visual language.

**Pass conditions**
- local population is the structural base;
- visitor groups are justified;
- special species are not added merely for variety;
- species scale is stable;
- faction/culture groups have visual cohesion;
- proposed total can resolve to ~60 readable figures.

**Pass unlocks**
- character asset production.

**Fail returns to**
- Stages 04–06.

---

### GATE 3 — Asset Lock

**Inputs**
- 60-character data table;
- white-background character sheets;
- props;
- creature assets.

**Pass conditions**
- all required characters exist;
- no major species-scale drift;
- faces and full bodies are readable;
- faction resemblance exists without clone repetition;
- equipment matches role;
- props/creatures fit the scene;
- no unintended style drift.

**Pass unlocks**
- event islands and blocking.

**Fail returns to**
- Stages 05–08.

---

### GATE 4 — Blocking Lock

**Inputs**
- 8–12 event islands;
- character placement;
- scale layers;
- background functional plan.

**Pass conditions**
- people are the compositional subject;
- no deep-perspective collapse;
- primary events read immediately;
- rear figures remain readable;
- crowd density is distributed;
- location anchors remain visible;
- event islands have clear eye-lines and interaction.

**Pass unlocks**
- final scene generation.

**Fail returns to**
- Stages 09–10.

---

### GATE 5 — Scene QC

**Inputs**
- full integrated scene;
- correction pass.

**Pass conditions**
- proportions stable;
- species anatomy stable;
- expressions varied;
- hands/faces sufficiently readable;
- equipment/action relationship is credible;
- environment recognizably matches the location;
- no meaningless magic;
- background does not dominate;
- scene still reads as a coherent 5E social/ecological moment.

**Pass unlocks**
- hidden-object design.

**Fail returns to**
- Stage 12 or the smallest earlier stage that caused the problem.

---

### GATE 6 — Hidden-Object Lock

**Inputs**
- target set;
- target IDs;
- proposed hiding locations;
- clue concepts;
- difficulty distribution.

**Pass conditions**
- target set is varied;
- targets are diegetically plausible;
- hiding is fair but not obvious;
- targets do not rely on tiny unreadable pixels;
- target selection does not damage the scene;
- difficulty spread is intentional.

**Pass unlocks**
- level-data and UI packaging.

**Fail returns to**
- Stage 13 unless the target problem exposes a deeper visual problem.

---

### GATE 7 — Level Lock

**Inputs**
- final scene;
- `targets.json`;
- `answer-map.json`;
- clues;
- target icons;
- UI;
- `level-metadata.json`.

**Pass conditions**
- every required target has a valid answer location;
- every required target has its clue/thumbnail;
- UI does not cover critical composition;
- IDs are unique and consistent across files;
- scene and game data agree;
- metadata identifies level and version;
- the package is self-contained enough for game implementation handoff.

**Pass unlocks**
- scene archive / level complete.

**Fail returns to**
- Stage 14 unless a deeper hidden-object or scene problem is discovered.

---

## 8. Human approval points

The project keeps approval overhead low while preserving control.

Human review is required at:

1. **Gate 0 + Gate 1 package** — lore/subscene/event.
2. **Gate 2** — population/species/faction.
3. **Gate 3** — 60-character assets.
4. **Gate 4** — blocking.
5. **Gate 5** — final scene.
6. **Gate 6** — hidden-object design.
7. **Gate 7** — final level package.

A scene may pause indefinitely at any gate without losing state because `CURRENT.md` and the scene folder record the last approved state.

---

## 9. Locked 15 scenes

1. Baldur’s Gate — Basilisk Gate
2. Candlekeep — Court of Air / visitor interface
3. Calimport — high-magic market street
4. Myth Drannor — outer-ruins research camp
5. Icewind Dale — Bryn Shander gate market
6. Port Nyanzaru — dinosaur-race market zone
7. Vallaki — festival square
8. Saltmarsh — main docks
9. Gracklstugh — Darklake District
10. Maelstrom — storm-giant court
11. Avernus — Wandering Emporium
12. Witchlight Carnival — giant snail race zone
13. Rock of Bral — Low City docks
14. Radiant Citadel — Concord Jewel arrival plaza
15. Well of Dragons — allied forward assembly camp

These may be refined inside their selected subscene, but replacing a locked scene requires an explicit project decision.

---

## 10. Visual style lock

Global art direction:

- European fantasy adventure ensemble comic illustration;
- clean stable black hand-drawn line art;
- flat color with restrained cel shading;
- bright, controlled saturation;
- approximately 5–5.5 heads tall;
- head slightly enlarged but not chibi;
- readable faces/hands;
- clear species silhouettes;
- weak perspective;
- stage-like horizontal composition;
- active character relationships;
- background one detail level simpler than characters;
- no depth-of-field blur;
- no painterly/3D/cinematic concept-art drift.

The style file is global and must not be silently rewritten per scene.

---

## 11. Failure-handling standard

Do not create a new methodology when a local problem appears.

Correction order:

1. proportion;
2. species trait;
3. face/expression;
4. event/action;
5. density;
6. blocking;
7. background detail;
8. color;
9. hidden-object;
10. UI.

Examples:
- wrong dwarf proportions → fix dwarf scale, not the whole pipeline;
- weak event readability → fix event blocking, not species research;
- background dominates → simplify background, do not redesign the location.

---

## 12. Version and canon management

### File versioning
- `V1` = first formally usable version;
- `V1.1` = small revision;
- `V2` = structural revision.

Avoid names such as:
- final-final;
- new-new;
- final2.

### Authority
`ACTIVE-DOCS-INDEX.md` states which file is current.

Older files remain historically useful but are not automatically canonical.

### Current state
`CURRENT.md` is the single operational answer to:
- what scene is active;
- what gate is current;
- what has been approved;
- what is blocked;
- what happens next.

---

## 13. Initial repository bootstrap scope

The first implementation pass will create:

1. root `README.md`;
2. root `CURRENT.md`;
3. root `ACTIVE-DOCS-INDEX.md`;
4. `MASTER/` with:
   - master 5E research;
   - production standard;
   - gate system;
   - style lock;
5. `WORKFLOW/` stage documentation;
6. `TEMPLATES/` reusable scene templates;
7. all 15 `SCENES/` folders;
8. Candlekeep Gate 0–1 files as the first live scene;
9. this Superpowers spec and the subsequent implementation plan.

The first bootstrap does **not** generate final scene art or complete all 15 production packs.

---

## 14. Bootstrap success criteria

The repository bootstrap is complete when:

- root navigation is understandable to a new contributor;
- the final product mission is explicit: **15 complete game-ready Hidden-Object levels**;
- every authoritative document is indexed;
- Gates 0–7 are documented with inputs/pass/fail/unlock behavior;
- each workflow stage has one canonical file;
- all scene folders exist;
- the reusable templates exist;
- the master research and production standard are preserved;
- Candlekeep records the current project state;
- no unofficial project inference is mislabeled as official;
- internal Markdown links resolve;
- `CURRENT.md` identifies the next actionable gate.



---

## 15. Final project Definition of Done

The project is **not complete** when the research is complete, when all character sheets exist, or even when all fifteen final illustrations exist.

It is complete only when:

- all 15 levels have passed **GATE 7 — Level Lock**;
- each level has a final scene;
- each level has a validated target set;
- each target has a valid answer location;
- required clues / target thumbnails exist;
- UI assets exist;
- level metadata exists;
- production source assets remain available for revision;
- the repository clearly records the final approved state of all 15 levels.

> **The final product is the set of 15 complete Hidden-Object game levels. Everything else in the repository is a means to produce and maintain them.**
