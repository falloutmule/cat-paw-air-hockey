---
{"schema":"sfhs.one-shot-decision-log@1","status":"VERIFIED","facts":{"decisions":["D-001 portrait-first shared-phone rink","D-002 zero finger offset","D-003 first-to-five ready/countdown/rematch flow","D-004 fixed-step bounded physics","D-005 optional reduced effects","D-006 procedural audio","D-007 readable committed source is authoritative","D-008 canonical output is packer-produced only"]}}
---
# Decisions

| ID | Status | Decision | Reason / evidence | Supersedes |
| --- | --- | --- | --- | --- |
| D-001 | VERIFIED | Portrait-first 540×960 fixed-contain rink; landscape pauses behind a rotate guide. | Shared-phone opposite-end play and orientation coverage. | None |
| D-002 | REPORTED | Zero logical-pixel finger offset. | Historical Samsung acceptance; maintain readable paw attachment. | None |
| D-003 | VERIFIED | First to five, joint ready hold, countdown, goal reset, and joint rematch. | Match-flow simulation tests. | None |
| D-004 | VERIFIED | 60 Hz fixed-step bounded physics with renderer-neutral state. | `src/physics.ts` and focused scenarios. | None |
| D-005 | VERIFIED | Reduced effects preserves game-state information. | Source/presentation contract. | None |
| D-006 | REPORTED | Procedural Web Audio uses accepted louder master gain and one intentional-gesture unlock. | Historical device acceptance; audio tests. | None |
| D-007 | VERIFIED | Committed readable source is authoritative; archives and candidates are historical only. | `docs/migration/SOURCE-LINEAGE.md`. | Bootstrap recovery route |
| D-008 | VERIFIED | Only the real SFHS packer may produce `dist/index.html`; it remains ignored. | `AGENTS.md`, project manifest, verifier. | Candidate delivery |
| D-009 | VERIFIED | The materialized project owns `browser-smoke`; it uses only the pinned SFHS workspace overlay to pack its own exact artifact before running the existing Chromium test. | SFHS PR #14 project-root repair and R2 direct materialized command/check evidence. | Old check execution from the SFHS checkout |
| D-010 | VERIFIED | The existing local expansion source is the current publication lineage; graduation does not alter its gameplay. | It descends from the settled source and has current local canonical verification. | Base-game-only publication framing |
| D-011 | PROPOSED | GitHub Pages receives only the packed verified HTML from canonical `main`, then the deployed bytes are compared to the workflow's artifact hash. | Repository-graduation authorization and `pages.yml`. | No prior Pages configuration |
