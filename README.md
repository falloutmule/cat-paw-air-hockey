# Cat Paw Air Hockey

Local two-player cat-themed air hockey for one phone. Each player uses one finger from an opposite end of the device to control a cat-paw striker. The first player to five goals wins.

## Product

- Portrait-first, touch-first local play
- Two simultaneous independent pointer owners
- Cat-paw strikers and a circular yarn-ball puck
- Two-player ready ceremony, countdown, goal reset, win state, and rematch
- Pause, mute, procedural audio, reduced effects, and accessible instructions
- Primary target: stable Android Chrome on Samsung Galaxy S21 Ultra
- Secondary target: desktop Chromium

## Controls

Each player touches and drags the paw on their own half. Both players hold their ready areas to start or rematch. The mirrored controls provide pause, mute, and reduced-effects toggles from either end.

## Repository authority

Readable source in `src/`, `tests/`, and `one-shot/` is authoritative. `dist/index.html` is generated only by the pinned SFHS packer and must never be hand-edited.

The SFHS toolchain is intentionally external:

- repository: `falloutmule/single-file-html-software`
- pinned revision: `36cf483d04b4c743b5c7f90ca8c4879d690904d1`
- Node: `>=24`
- pnpm: `11.9.0`
- adapter: `@sfhs/adapter-pixi-v8`
- runtime: `@sfhs/pixi-runtime`
- PixiJS: `8.19.0`

## Development

Run project-owned source tests without installing Pixi:

```bash
pnpm test:source
```

For canonical work, clone the pinned SFHS repository beside this repository or set `SFHS_ROOT`, then materialize a disposable integration copy:

```bash
export SFHS_ROOT=/path/to/single-file-html-software
pnpm sfhs:prepare
cd "$SFHS_ROOT"
CI=true pnpm install --no-frozen-lockfile
pnpm sfhs one-shot inspect --project examples/cat-paw-air-hockey --json
pnpm sfhs one-shot audit --project examples/cat-paw-air-hockey --json
pnpm sfhs inspect --json --project examples/cat-paw-air-hockey
pnpm sfhs validate --json --project examples/cat-paw-air-hockey
pnpm sfhs check --json --project examples/cat-paw-air-hockey --changed examples/cat-paw-air-hockey
pnpm sfhs pack --json --project examples/cat-paw-air-hockey
pnpm sfhs verify --json --project examples/cat-paw-air-hockey
```

Only the final two commands may establish canonical `dist/index.html` identity.

## Status

| Gate | Status |
| --- | --- |
| Source tests | `VERIFIED` on the received later revision under Node 24.11.1 |
| Active adapter source integration | `INFERRED` from current source imports and architecture; canonical SFHS execution pending |
| Canonical artifact | `BLOCKED` until the pinned SFHS checkout and pnpm environment run |
| Browser evidence | Historical candidate evidence retained; exact canonical evidence pending |
| Physical device | Candidate experience `REPORTED`; exact canonical artifact `UNTESTED` |
| Release | `BLOCKED` |

## Non-goals for this migration

AI opponents, handicap mode, cooperative falling-puck play, online multiplayer, accounts, progression, unlocks, shops, achievements, new themes, broad redesign, release publication, and GitHub Pages deployment are excluded.

See `docs/migration/` and `one-shot/` for intake lineage, decisions, live issues, acceptance criteria, and evidence status.
