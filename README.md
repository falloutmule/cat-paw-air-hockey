# Cat Paw Air Hockey

> A local, shared-phone air-hockey match where two players at opposite ends control cat-paw strikers and race to five goals.

**Play:** GitHub Pages deployment is being established by the verified-main publication workflow. The exact URL and deployed artifact hash are recorded in [Project Status](docs/PROJECT-STATUS.md) once deployment succeeds.

## Status

The readable source, tests, and SFHS project are authoritative. The current local canonical artifact is verified by the real SFHS packer and exact verifier; its Samsung Galaxy S21 Ultra session is still **UNTESTED**. GitHub Pages publication is **PROPOSED** until the canonical-branch workflow and byte-for-byte deployment check pass.

| Current local artifact | Value |
| --- | --- |
| Build ID | `cat-paw-air-hockey-64741220be29` |
| Source SHA-256 | `64741220be29f0db3a3044f977d4cbba8acb0fb92d4c181c571d11f8f3afeeca` |
| Artifact SHA-256 | `0d18270c36ff36987c8653579693a3dca3fc62b4271ea2cb55be0c13816f6b53` |
| Bytes | 581,644 |
| Verification | SFHS inspect, validate, check, pack, exact verify, and packed Chromium smoke |

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
