# Cat Paw Air Hockey

> A local, shared-phone air-hockey match where two players at opposite ends control cat-paw strikers and race to five goals.

**Play:** [Cat Paw Air Hockey on GitHub Pages](https://falloutmule.github.io/cat-paw-air-hockey/)

## Status

The readable source, tests, and SFHS project are authoritative. PUCK-PAW-GODOT-001 is locally verified by the real pinned SFHS packer and exact verifier. It is not deployed or pushed under this local-only boundary, and the user reported **Samsung PASS** for its exact preview and packed artifact on 2026-08-12.

| Current canonical artifact | Value |
| --- | --- |
| Build ID | `cat-paw-air-hockey-06998a9ce8bc` |
| Source SHA-256 | `06998a9ce8bc8b8cd578018e42b716c3c4b5b017c13626d306aa609eddc5055b` |
| Artifact SHA-256 | `51b92216c60556d2df9885ba5155bc427da6904b0fc3fc6a89c864e30215f42a` |
| Bytes | 4,117,623 |
| Verification | SFHS inspect, validate, check, pack, exact verify, and multi-viewport packed Chromium smoke |
| Pages | [Currently deployed earlier build](https://falloutmule.github.io/cat-paw-air-hockey/); PUCK-PAW-GODOT-001 was not deployed |

## Play

Place one phone flat in portrait orientation, one player at each short end. Both players hold their ready paw, wait for the countdown, then each drags one finger inside their own half of the rink. Score through the opposite cat goal; first to five wins. Both players hold again for a rematch.

The four shared controls straddle the center edges: Mute upper-left, Pause lower-left, Menu upper-right, and Fullscreen lower-right. Capture replaces Pause only after a win. The game intentionally shows a rotate-to-portrait gate in landscape.

## Implemented

- Simultaneous independent two-player touch ownership, cancellation cleanup, and third-touch rejection.
- Fixed-step renderer-neutral air-hockey simulation with cat-paw strikers, yarn puck, posts, goals, winner, and rematch flow.
- Pause, mute, user-gesture audio unlock, background recovery, reduced effects, and accessible instructions.
- Shared mirrored settings with 100% normal speeds, 200% normal sizes, 70–130% speed ranges, and 25–200% size ranges. Each half has a sticky Close button and one thin native scrollbar; incompatible puck/goal sizes warn without locking the players out.
- Optional local PNG theme, fullscreen controls, and final-score PNG capture.
- One required Pixi v8 WebGL canvas, no runtime external requests, and a portrait-first adaptive viewport.
- Godot 4.7.1-authored animated score cats with exact double-size 160 x 160 nearest-neighbor presentation, palette-only P1/P2 sheets, slower exaggerated reactions, reduced-motion poses, and no runtime skeletal animation.
- Godot 4.7.1-authored gameplay paws and yarn puck use palette-only variants matching the score cats. Each authoritative paw contact synchronizes seven slower squash, stretch, recoil, overshoot, wobble, and settle frames; reduced motion preserves palette transfer while holding frame 0.

## Limits

The primary device target is Samsung Galaxy S21 Ultra in stable Android Chrome. Automated Chromium evidence does not replace an artifact-bound physical session. The current puck-and-paw artifact has no reported Samsung result; the previous settings artifact's PASS does not transfer. WebGL is required; there is deliberately no hidden Canvas fallback.

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
