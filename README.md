# Cat Paw Air Hockey

> A local, shared-phone air-hockey match where two players at opposite ends control cat-paw strikers and race to five goals.

**Play:** [Cat Paw Air Hockey on GitHub Pages](https://falloutmule.github.io/cat-paw-air-hockey/)

## Status

The readable source, tests, and SFHS project are authoritative. The current R2A artifact is locally verified by the real SFHS packer and exact verifier. It is not deployed under this local-only repair boundary, and its Samsung Galaxy S21 Ultra session is **UNTESTED**. The currently deployed earlier artifact has a `REPORTED FAIL / NEEDS REPAIR` physical layout result.

| Current canonical artifact | Value |
| --- | --- |
| Build ID | `cat-paw-air-hockey-5735c4c572c2` |
| Source SHA-256 | `5735c4c572c28fedac73ab0eb2308ca2b983c66170c525dc40f2a714df50c5dd` |
| Artifact SHA-256 | `acb55aec6d8d8d8d6bf1afa4634eefe5caeec51d77d95a743e4ddd29950e9c9c` |
| Bytes | 724,123 |
| Verification | SFHS inspect, validate, check, pack, exact verify, and multi-viewport packed Chromium smoke |
| Pages | [Currently deployed earlier build](https://falloutmule.github.io/cat-paw-air-hockey/); R2A was not deployed |

## Play

Place one phone flat in portrait orientation, one player at each short end. Both players hold their ready paw, wait for the countdown, then each drags one finger inside their own half of the rink. Score through the opposite cat goal; first to five wins. Both players hold again for a rematch.

The four shared controls straddle the center edges: Mute upper-left, Pause lower-left, Menu upper-right, and Fullscreen lower-right. Capture replaces Pause only after a win. The game intentionally shows a rotate-to-portrait gate in landscape.

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
