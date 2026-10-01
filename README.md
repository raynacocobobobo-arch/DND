# D&D 5E Hidden-Object Level Production System

## Final product mission

This repository exists to produce **15 complete, game-ready D&D / 5E Hidden-Object levels**. Research notes, character sheets, prompts, blocking diagrams, and reference assets are production inputs; they are not the final product.

Each finished level must ultimately include a final ensemble scene, a validated hidden-object target set, answer locations, clue crops or target thumbnails, UI assets, level metadata, and the production assets required to revise the level.

## Product rule

> Does this materially help us produce, validate, integrate, or maintain one of the 15 final playable levels?

If not, it is out of scope.

## Evidence policy

Project research distinguishes five evidence classes:

- `【SRD-5.1】` — Wizards SRD 5.1 open material.
- `【SRD-5.2.1】` — Wizards SRD 5.2.1 open material.
- `【OFFICIAL-SETTING】` — official D&D/Wizards/D&D Beyond sourcebook, map, article, or art.
- `【OFFICIAL-INDEX】` — an official index confirms the subject exists, but public body text is insufficient for the claimed detail.
- `【PROJECT】` — project-side decisions or inference.

`【PROJECT】` material must never be presented as official lore.

## Gate summary

- **Gate 0 — Lore Lock**: official location evidence is sufficient.
- **Gate 1 — Scene Lock**: one subscene, one time slice, one main event.
- **Gate 2 — Population Lock**: population ecology, species scale, faction/cultural visual language.
- **Gate 3 — Asset Lock**: scene-specific character, prop, and creature assets.
- **Gate 4 — Blocking Lock**: 8–12 event islands and readable crowd composition.
- **Gate 5 — Scene Lock / Visual QC**: final ensemble scene is visually sound without UI.
- **Gate 6 — Hidden-Object Lock**: target set, hiding logic, clues, and difficulty are approved.
- **Gate 7 — Level Lock**: final scene + target/answer/UI/metadata package is internally consistent and implementation-ready.

No downstream production starts before the required gate is explicitly approved.

## Canonical per-level structure

```text
SCENES/SXX-SCENE-NAME/
├── RESEARCH/
├── PRODUCTION/
└── LEVEL/
```

`RESEARCH/` proves the world and locks the exact moment. `PRODUCTION/` builds the scene. `LEVEL/` packages the playable target, answer, clue, UI, and metadata layer.

## Locked 15 levels

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

## Navigation

- [Current production state](CURRENT.md)
- [Canonical document index](ACTIVE-DOCS-INDEX.md)
- [Master research](MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md)
- [Production standard](MASTER/PRODUCTION-STANDARD-V1.md)
- [Gate system](MASTER/GATE-SYSTEM-V1.md)
- [Style lock](MASTER/STYLE-LOCK-V1.md)
- [Workflow 01 — Research](WORKFLOW/01-RESEARCH.md) through [Workflow 15 — Archive](WORKFLOW/15-ARCHIVE.md) — canonical 15-stage production workflow
- `TEMPLATES/` — reusable research, production, and level-data templates
- `SCENES/` — one workspace per level
- `docs/superpowers/` — approved design spec and implementation plans

## Validation

A repository validator will live at `scripts/validate_repo.py` after bootstrap Task 7.
