# Cat Paw Air Hockey

> A local, shared-phone air-hockey match where two players at opposite ends control cat-paw strikers and race to five goals.

**Play:** [Cat Paw Air Hockey on GitHub Pages](https://falloutmule.github.io/cat-paw-air-hockey/)

## Status

The readable source, tests, and SFHS project are authoritative. The current canonical artifact is verified by the real SFHS packer and exact verifier, and GitHub Pages serves byte-for-byte identical output. Its Samsung Galaxy S21 Ultra session is still **UNTESTED**.

| Current canonical artifact | Value |
| --- | --- |
| Build ID | `cat-paw-air-hockey-e15fc84c48fb` |
| Source SHA-256 | `e15fc84c48fb44ca4c8e6ddba9280c0586fde84e714e2e263d2b8e4f9d232cda` |
| Artifact SHA-256 | `2a45ce59d5a976a2196276de05d9672554f25467af6e44e3cbebda3f59d5d261` |
| Bytes | 581,644 |
| Verification | SFHS inspect, validate, check, pack, exact verify, packed Chromium smoke, and Pages byte parity |
| Pages | [https://falloutmule.github.io/cat-paw-air-hockey/](https://falloutmule.github.io/cat-paw-air-hockey/) (deployment workflow enforces exact artifact parity) |

## Play

Place one phone flat in portrait orientation, one player at each short end. Both players hold their ready paw, wait for the countdown, then each drags one finger inside their own half of the rink. Score through the opposite cat goal; first to five wins. Both players hold again for a rematch.

The top player reads the top controls upside down. Each end has Sound and Pause on one side of the goal, and Settings and Fullscreen on the other. The final-score capture control appears only after a match. The game intentionally shows a rotate-to-portrait gate in landscape.

## Implemented

- Simultaneous independent two-player touch ownership, cancellation cleanup, and third-touch rejection.
- Fixed-step renderer-neutral air-hockey simulation with cat-paw strikers, yarn puck, posts, goals, winner, and rematch flow.
- Pause, mute, user-gesture audio unlock, background recovery, reduced effects, and accessible instructions.
- Shared mirrored settings: puck speed/size, individual paw speed/size, goal opening, and return-speed handicaps (70–130%).
- Optional local PNG theme, fullscreen controls, and final-score PNG capture.
- One required Pixi v8 WebGL canvas, no runtime external requests, and a portrait-first adaptive viewport.

## Limits

The primary device target is Samsung Galaxy S21 Ultra in stable Android Chrome. Automated Chromium evidence does not replace an artifact-bound physical session. The current artifact has no reported Samsung result. WebGL is required; there is deliberately no hidden Canvas fallback.

## Architecture and verification

Editable product source is `src/`, with `tests/`, `public/`, `sfhs.project.json`, and `one-shot/` as authoritative product records. The canonical `dist/index.html` is generated only by the SFHS packer and is ignored by Git. The project uses the fixed SFHS revision in [one-shot/SFHS-PIN.json](one-shot/SFHS-PIN.json), Pixi v8, a 60 Hz fixed-step simulation, and a single WebGL presentation surface.

```powershell
pnpm install --frozen-lockfile
pnpm test
```

Use the pinned SFHS graduation materializer for linting, typechecking, canonical inspection, packing, verification, and browser evidence. See [Testing](docs/TESTING.md) for the exact release sequence.

## Project records

- [Game specification](docs/GAME-SPEC.md)
- [Project status](docs/PROJECT-STATUS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Testing and release verification](docs/TESTING.md)
- [Decisions](docs/DECISIONS.md)
- [Source authority](docs/SOURCE-AUTHORITY.md)
- [Evidence retention](docs/EVIDENCE-RETENTION.md)
- [Rights](RIGHTS.md)

No reuse license has been granted; see [RIGHTS.md](RIGHTS.md).
