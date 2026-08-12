# Cat Paw Air Hockey

> A local, shared-phone air-hockey match where two players at opposite ends control cat-paw strikers and race to five goals.

**Play:** [Cat Paw Air Hockey on GitHub Pages](https://falloutmule.github.io/cat-paw-air-hockey/)

## Status

The readable source, tests, and SFHS project are authoritative. SCORE-CAT-GODOT-001 is locally verified by the real pinned SFHS packer and exact verifier. It is not deployed or pushed under this local-only boundary, and its Samsung Galaxy S21 Ultra session is **UNTESTED**.

| Current canonical artifact | Value |
| --- | --- |
| Build ID | `cat-paw-air-hockey-235ab3123bc4` |
| Source SHA-256 | `235ab3123bc48cd85d8f76541bd81d5c2ae66b5a7f109b27df386480d78fe70b` |
| Artifact SHA-256 | `a2d26f85dbe66a8ba1db1a7c3df3d16fa7b044418198e57afdb4ca9429ab0b63` |
| Bytes | 4,067,814 |
| Verification | SFHS inspect, validate, check, pack, exact verify, and multi-viewport packed Chromium smoke |
| Pages | [Currently deployed earlier build](https://falloutmule.github.io/cat-paw-air-hockey/); SCORE-CAT-GODOT-001 was not deployed |

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
- Godot 4.7.1-authored animated score cats with readable 120 x 120 nearest-neighbor presentation, palette-only P1/P2 sheets, slower exaggerated reactions, reduced-motion poses, and no runtime skeletal animation.

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
