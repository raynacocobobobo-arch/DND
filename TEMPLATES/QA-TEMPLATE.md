# Scene / Level QA Template

## Gate 5 — Visual QC
Check in this order:
1. proportion;
2. species anatomy;
3. face/expression;
4. action;
5. density;
6. composition;
7. background detail;
8. color.

- [ ] Location reads immediately.
- [ ] People remain the compositional subject.
- [ ] 55–70 target, if used, is actually readable rather than merely counted.
- [ ] Rear figures remain readable.
- [ ] No style drift.
- [ ] No unintended duplicate/clone faces.
- [ ] No UI or hiding mechanics are compensating for a weak scene.

## Gate 6 — Hidden-Object QC
- [ ] Targets fit the world.
- [ ] Target types are varied: character / object / creature as appropriate.
- [ ] Difficulty is intentional.
- [ ] Hiding uses context/overlap/similarity, not blur or microscopic pixels.
- [ ] Every target has a clue and answer reference.

## Gate 7 — Level package QC
- [ ] Final scene exists.
- [ ] `targets.json` parses.
- [ ] `answer-map.json` parses.
- [ ] `level-metadata.json` parses.
- [ ] Target IDs and answer references agree.
- [ ] Coordinate convention is versioned and documented.
- [ ] Clue crops / thumbnails / target icons exist as required.
- [ ] Metadata points to the correct files.
- [ ] Package is implementation-ready without re-deriving art or gameplay design.

## Result
- Gate checked:
- PASS / FAIL:
- Blocking defects:
- Smallest stage to return to:
