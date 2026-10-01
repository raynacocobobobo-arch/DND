# ACTIVE DOCS INDEX

This file records authority. A path is marked **canonical** only after it exists and has been reviewed into the production system.

## Superpowers design authority

| Path | Status | Role |
|---|---|---|
| `docs/superpowers/specs/2026-10-01-dnd5e-hidden-object-production-system-design.md` | canonical | Approved architecture and product definition |
| `docs/superpowers/plans/2026-10-01-dnd5e-hidden-object-repository-bootstrap.md` | completed plan | Repository bootstrap execution record |

## Root operational docs

| Path | Status | Role |
|---|---|---|
| `README.md` | canonical | Human/agent entry point |
| `CURRENT.md` | active | Single operational current-state record |
| `ACTIVE-DOCS-INDEX.md` | canonical | Authority map |

## Shared master docs

| Path | Status | Role |
|---|---|---|
| `MASTER/DND5E-MASTER-RESEARCH-AND-15-SCENES-V1.md` | canonical | 5E/SRD + 15-location research substrate |
| `MASTER/PRODUCTION-STANDARD-V1.md` | canonical | Global production rules |
| `MASTER/GATE-SYSTEM-V1.md` | canonical | Gate 0–7 dependency and approval contract |
| `MASTER/STYLE-LOCK-V1.md` | canonical | Global visual style and anti-drift rules |

## Workflow docs

`WORKFLOW/01-RESEARCH.md` through `WORKFLOW/15-ARCHIVE.md` are **canonical** stage definitions.

## Templates

The following reusable interfaces are **canonical**:

- `TEMPLATES/LOCATION-RESEARCH-TEMPLATE.md`
- `TEMPLATES/SUBSCENE-DECISION-TEMPLATE.md`
- `TEMPLATES/SCENE-STATE-TEMPLATE.md`
- `TEMPLATES/POPULATION-MODEL-TEMPLATE.md`
- `TEMPLATES/SPECIES-SCALE-TEMPLATE.md`
- `TEMPLATES/FACTION-STYLE-TEMPLATE.md`
- `TEMPLATES/60-CHARACTERS-TEMPLATE.csv` — 60 default rows; scene logic may justify 55–70 figures
- `TEMPLATES/PROPS-CREATURES-TEMPLATE.md`
- `TEMPLATES/EVENT-ISLANDS-TEMPLATE.md`
- `TEMPLATES/ACTOR-BLOCKING-TEMPLATE.md`
- `TEMPLATES/FINAL-PROMPT-TEMPLATE.md`
- `TEMPLATES/TARGETS-TEMPLATE.json`
- `TEMPLATES/ANSWER-MAP-TEMPLATE.json`
- `TEMPLATES/LEVEL-METADATA-TEMPLATE.json`
- `TEMPLATES/QA-TEMPLATE.md`

## Active scene documents

Candlekeep Gate 0–1 files are **canonical**:

- `SCENES/S02-CANDLEKEEP/RESEARCH/01-LOCATION-RESEARCH.md` — Gate 0 approved location research
- `SCENES/S02-CANDLEKEEP/RESEARCH/02-SUBSCENE-DECISION.md` — Gate 1 approved subscene decision
- `SCENES/S02-CANDLEKEEP/RESEARCH/03-SCENE-STATE.md` — Gate 1 approved scene-state lock

Gate 2 production review package is now active but **not yet approved**:

- `SCENES/S02-CANDLEKEEP/PRODUCTION/04-POPULATION-MODEL.md` — active draft / human review
- `SCENES/S02-CANDLEKEEP/PRODUCTION/05-SPECIES-SCALE.md` — active draft / human review
- `SCENES/S02-CANDLEKEEP/PRODUCTION/06-FACTION-STYLE.md` — active draft / human review

## Scene workspaces

All 15 scene root `README.md` files are **canonical workspace status records**. S02 Candlekeep is active at Gate 2 NEXT; S01 and S03–S15 remain NOT STARTED at Gate 0.

- [S01 — Baldur’s Gate: Basilisk Gate](SCENES/S01-BALDURS-GATE/README.md)
- [S02 — Candlekeep: Court of Air / visitor interface](SCENES/S02-CANDLEKEEP/README.md)
- [S03 — Calimport: high-magic market street](SCENES/S03-CALIMPORT/README.md)
- [S04 — Myth Drannor: outer-ruins research camp](SCENES/S04-MYTH-DRANNOR/README.md)
- [S05 — Icewind Dale: Bryn Shander gate market](SCENES/S05-ICEWIND-DALE/README.md)
- [S06 — Port Nyanzaru: dinosaur-race market zone](SCENES/S06-PORT-NYANZARU/README.md)
- [S07 — Vallaki: festival square](SCENES/S07-VALLAKI/README.md)
- [S08 — Saltmarsh: main docks](SCENES/S08-SALTMARSH/README.md)
- [S09 — Gracklstugh: Darklake District](SCENES/S09-GRACKLSTUGH/README.md)
- [S10 — Maelstrom: storm-giant court](SCENES/S10-MAELSTROM/README.md)
- [S11 — Avernus: Wandering Emporium](SCENES/S11-AVERNUS/README.md)
- [S12 — Witchlight Carnival: giant snail race zone](SCENES/S12-WITCHLIGHT-CARNIVAL/README.md)
- [S13 — Rock of Bral: Low City docks](SCENES/S13-ROCK-OF-BRAL/README.md)
- [S14 — Radiant Citadel: Concord Jewel arrival plaza](SCENES/S14-RADIANT-CITADEL/README.md)
- [S15 — Well of Dragons: allied forward assembly camp](SCENES/S15-WELL-OF-DRAGONS/README.md)
\n## Validation\n\n| Path | Status | Role |\n|---|---|---|\n| `scripts/validate_repo.py` | canonical | Repository structure, interface, master-integrity and Markdown-link validation |\n
## Global Visual Foundation

| Path | Status | Role |
|---|---|---|
| `MASTER/VISUAL-FOUNDATION/README.md` | draft system root | Entry point for project-wide visual inheritance |
| `MASTER/VISUAL-FOUNDATION/GLOBAL-VISUAL-FOUNDATION-V1.md` | draft | PV0/PV1 and visual inheritance rules |
| `MASTER/VISUAL-FOUNDATION/VISUAL-ANCHOR-MANIFEST.json` | draft | Machine-readable visual-anchor authority map |
| `scripts/validate_visual_foundation.py` | canonical validator | Visual-anchor status/path/hash/profile validation |
