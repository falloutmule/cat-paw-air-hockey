# Testing and release verification

## Source checks

```powershell
pnpm install --frozen-lockfile
pnpm test
```

The score-cat producer is pinned to the verified official Godot 4.7.1 stable Windows archive:

```powershell
pnpm score-cats:build -- --godot-executable <path-to-Godot_v4.7.1-stable_win64_console.exe>
```

Run it twice and compare the two sheet hashes before canonical materialization. Windows uses a hidden OpenGL compatibility window because Godot's literal `--headless` mode selects the non-rendering Dummy driver.

The gameplay actors use the merged renderer-neutral SFHS exporter at commit `37aa056b6bd0948d73fcd99c1aba558861f0037e`:

```powershell
pnpm gameplay-actors:build -- --godot-executable <path-to-Godot_v4.7.1-stable_win64_console.exe> --sfhs-root <clean-sfhs-37aa056-checkout>
```

Run it twice. The second run must verify all five existing sheets byte-for-byte. The actor tests bind sheet dimensions, SHA-256 identities, ordered distinct frames, transparent borders, and cross-palette alpha parity.

The suite covers 13 input lifecycle scenarios, 23 Rapier physics scenarios, 6 match-flow scenarios, 6 audio scenarios, orientation, settings migration/synchronization and 25–200% extremes, return-speed behavior, the exact shared-control contract, 29 focused tall-board checks, 34 score-cat cases, 35 contact-resolver cases, and 31 gameplay-actor identity/validation cases. The physics lane includes CCD/high-speed boundaries, wall tangents, stationary and moving paws, glancing contact, post stability, overlap and escape recovery, exact-once goals, simultaneous control, speed caps, reset, and long-running finite-state checks. Packed Chromium additionally covers strict 1080×2400 Board dimensions/decode, safe R2 legacy retention, failed-replacement preservation, IndexedDB reload, reset, texture disposal, one persistent sprite, all five Godot actor sheets, 25–200% settings, 200% default couch goals, sticky Close controls, one thin native scrollbar per mirrored half, fullscreen, and goal-zone clearance. The semantic browser lane observes synchronized real paw/puck frames and palette transfer, reaches a winner, saves the real canvas capture, and starts a rematch through normal UI and pointer actions.

## Canonical SFHS sequence

Materialize a fresh disposable project through the exact commit in `one-shot/SFHS-PIN.json`, then run the current pinned CLI against that project:

```powershell
pnpm sfhs one-shot inspect --project <materialized-project> --json
pnpm sfhs one-shot graduate audit --project <materialized-project> --json
pnpm sfhs inspect --project <materialized-project> --json
pnpm sfhs validate --project <materialized-project> --json
pnpm sfhs check --project <materialized-project> --json
pnpm sfhs pack --project <materialized-project> --json
pnpm sfhs verify --project <materialized-project> --json
pnpm sfhs one-shot audit --project <materialized-project> --json
pnpm test:r3-browser
```

`pnpm run lint` and `pnpm run typecheck` are deliberately materialized-project commands: the source imports the pinned SFHS adapter/runtime/physics packages and the graduation materializer provides the approved tool overlay without vendoring framework source into this repository. `pnpm test:source` runs project-owned suites that do not require the materialized SFHS overlay; the full `pnpm test` runs after materialization.

`one-shot graduate audit` runs against the untouched fresh materialization before pack or browser output is generated; those generated files deliberately change the disposable tree. The ordinary `one-shot audit` runs after pack and exact verify. Product paths are not passed to SFHS's framework-repository `--changed` selector: Cat Paw runs its complete project-owned suite directly, while `sfhs check --project` supplies the external-project lint, typecheck, full unit, and browser-smoke matrix. The shared Physics 2D change is separately covered by the SFHS PR's full quality and cross-platform determinism matrix. A canonical result additionally requires pack and exact verify of the same `dist/index.html`, a second same-source pack with an identical SHA-256, and packed-artifact Chromium evidence. The canonical browser lane checks HTTP and exact-file offline boot, one WebGL canvas, control layout, fullscreen, settings, capture, lifecycle/orientation, errors, physics timing, and runtime requests. The semantic lane uses normal UI/pointer actions to observe contact animation, reach a winner, capture, and rematch. R3 measures 412×915, 360×800, 390×844, and 360×640 portrait viewports, menu/document containment, independent half scrolling, Board pixel/logical independence, 20:9 input mapping, dynamic goal resizing, Board replacement invariance, and the normal-action match lifecycle.

## Pages release

The Pages workflow runs on `main` only after source tests and the same materialized canonical gates. It deploys only verified `index.html` plus `.nojekyll`, uses least-privilege Pages permissions and cancel-in-progress concurrency, and never runs for pull requests. The post-deploy audit downloads the served HTML and compares SHA-256 with the artifact recorded by the workflow. Samsung physical testing remains a separate artifact-bound gate and is already REPORTED PASS for CATPAW-RAPIER-001.
