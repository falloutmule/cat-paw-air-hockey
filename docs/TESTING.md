# Testing and release verification

## Source checks

```powershell
pnpm install --frozen-lockfile
pnpm test
```

The suite covers 13 input lifecycle scenarios, 16 physics scenarios, 6 match-flow scenarios, 6 audio scenarios, orientation, settings migration/synchronization, and return-speed behavior.

## Canonical SFHS sequence

Materialize a fresh disposable project through the exact commit in `one-shot/SFHS-PIN.json`, then run the current pinned CLI against that project:

```powershell
pnpm sfhs one-shot inspect --project <materialized-project> --json
pnpm sfhs one-shot audit --project <materialized-project> --json
pnpm sfhs inspect --project <materialized-project> --json
pnpm sfhs validate --project <materialized-project> --json
pnpm sfhs check --project <materialized-project> --changed <path> --json
pnpm sfhs pack --project <materialized-project> --json
pnpm sfhs verify --project <materialized-project> --json
pnpm test:browser
```

`pnpm run lint` and `pnpm run typecheck` are deliberately materialized-project commands: the source imports the pinned SFHS adapter/runtime packages and the graduation materializer provides the approved tool overlay without vendoring framework source into this repository. Direct-source regression tests remain project-owned.

`SFHS_TEST_SELECTION_REVIEW_REQUIRED` can be a non-fatal warning for changed paths with broad runtime impact; it is recorded, never suppressed. A canonical result requires pack and exact verify of the same `dist/index.html` plus packed-artifact Chromium evidence. The browser evidence checks boot, one WebGL canvas, control layout, fullscreen, settings, capture, lifecycle/orientation, errors, and runtime requests.

## Pages release

The Pages workflow runs on `main` only after source tests and the same materialized canonical gates. It deploys only the verified packed HTML. The post-deploy audit downloads the served HTML and compares SHA-256 with the artifact recorded by the workflow. Samsung physical testing remains a separate gate.
