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
pnpm --dir <materialized-project> run lint
pnpm --dir <materialized-project> run typecheck
pnpm --dir <materialized-project> test
pnpm sfhs pack --project <materialized-project> --json
pnpm sfhs verify --project <materialized-project> --json
pnpm sfhs one-shot audit --project <materialized-project> --json
pnpm --dir <materialized-project> test:browser
```

`pnpm run lint` and `pnpm run typecheck` are deliberately materialized-project commands: the source imports the pinned SFHS adapter/runtime/physics packages and the graduation materializer provides the approved tool overlay without vendoring framework source into this repository. `pnpm test:source` runs project-owned suites that do not require the materialized SFHS overlay; the full `pnpm test` runs after materialization.

`one-shot graduate audit` runs against the untouched fresh materialization before pack or browser output is generated; those generated files deliberately change the disposable tree. The ordinary `one-shot audit` runs after pack and exact verify. GitHub runs Cat Paw's lint, typecheck, complete product suite, pack, exact verify, and canonical HTTP/offline browser smoke. It deliberately does not rerun the SFHS framework repository's own unit and determinism suites; those belong to SFHS and passed for the pinned Physics 2D change in PR #33. The slower semantic first-to-five/capture/rematch lane remains available as `pnpm test:r3-browser` for milestone or implementation evidence and is not required on every GitHub push.

## Pages release

The repository has two workflows only. `quality.yml` runs the lean verification matrix on pull requests. `pages.yml` runs on `main`, rebuilds and verifies the one-file artifact, performs the canonical browser smoke, and deploys only `index.html` plus `.nojekyll`. The post-deploy step downloads the served HTML and compares SHA-256 with the verified artifact. Samsung physical testing remains a separate artifact-bound gate and is already REPORTED PASS for CATPAW-RAPIER-001.
