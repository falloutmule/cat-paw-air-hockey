# Cat Paw Air Hockey Agent Guide

This repository contains the Cat Paw Air Hockey product. SFHS remains an external pinned toolchain.

## Boundaries

- Preserve the existing local two-player portrait game.
- Use the PixiJS v8 lane and the real `@sfhs/adapter-pixi-v8` and `@sfhs/pixi-runtime` packages.
- Keep simulation renderer-neutral and fixed-step.
- Raw pointer input becomes semantic actions before simulation.
- Rendering reads state and never mutates gameplay.
- Edit readable source only. Never hand-edit `dist/index.html`.
- Do not vendor or copy SFHS packages into this repository.
- Do not add AI, handicap, co-op, network play, accounts, progression, publication, releases, or Pages deployment during migration.
- Preserve issue and evidence history. Use only `VERIFIED`, `REPORTED`, `INFERRED`, `PROPOSED`, `UNTESTED`, `BLOCKED`, and `SUPERSEDED` for evidence claims.

## Toolchain

- SFHS repository: `falloutmule/single-file-html-software`
- Pinned revision: `36cf483d04b4c743b5c7f90ca8c4879d690904d1`
- Node: 24 or newer
- pnpm: 11.9.0

The project is copied into a disposable SFHS workspace for canonical inspection, packing, verification, and browser evidence. The dedicated repository remains authoritative.
