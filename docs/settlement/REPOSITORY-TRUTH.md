# Repository truth - BASELINE-SETTLE-001

## VERIFIED current repository

- Repository: `falloutmule/cat-paw-air-hockey`, public; default branch `main`.
- Settlement base: `05d39abdf8ec943b2ee4004163752a0305e1cc51`, the merge of PR #2.
- Authoritative editable source is committed directly in `src/`, with `tests/`, `public/`, `sfhs.project.json`, and `one-shot/` as product records.
- The active runtime imports `@sfhs/adapter-pixi-v8` and `@sfhs/pixi-runtime`; it presents one required WebGL Pixi surface and has no hidden Canvas world.
- The pin is SFHS `5acd8fc9a24834d9416a6e615bb78b8012962e30`, Node 24, pnpm 11.9.0, and Pixi 8.19.0. It supersedes the historical `36cf...` pin through the merged source lineage.

## VERIFIED migration and evidence disposition

- No `.remote-import/`, `.remote-restore/`, encoded archive chunks, candidate HTML, or restoration workflow remains in the active tree.
- PR #1 and the `codex/sfhs-github-migration` branch are historical recovery work; PR #2 is merged and supplies the readable source baseline. `tree-test` and `tree-test2` are obsolete remote branches with no role in this branch.
- The prior candidate and recovery claims are preserved in `docs/migration/` and Git history, labelled **SUPERSEDED** for canonical claims.
- Earlier reports that canonical pack/verify were blocked were accurate at their time but **SUPERSEDED**. Earlier reports of a canonical artifact are historical, not authority for this changed source tree.
- The original `canonical-sfhs.yml` was meaningful but incomplete: it lacked current One-Shot preflight, product-specific packed-artifact browser evidence, and a distinct strong-evidence lane. It is replaced by durable workflows.

## VERIFIED current canonical result

The R1 materialized source passed real `sfhs pack` and `sfhs verify`:

- `dist/index.html`: 560,309 bytes; SHA-256 `78d728fe96f74ee92bdbaecaa8a0e7bd880dff29efd6d19ec2fc09dcfe309534`
- Build ID `cat-paw-air-hockey-b6bee877e2dc`; source SHA-256 `b6bee877e2dcc2f1b6caa3261dc9eecec63dca2b2845d15f5c24d362e90a46bf`

The prior 560,167-byte artifact (`24d02527...`, build `cat-paw-air-hockey-0aee153962c5`) and the later 560,309-byte artifact (`3022f196...`, build `cat-paw-air-hockey-05dc1f192cf4`) are **SUPERSEDED**. The latter changed only with browser-smoke records and its physical Samsung evidence does not transfer.

`dist/` remains ignored and is never hand-edited or committed.

## REPORTED / UNTESTED

Historical Samsung acceptance applies to a prior exact artifact only. The R1 artifact preserves base-game behavior by source and browser evidence, but its Samsung device session is **UNTESTED**. The regression checklist is: simultaneous opposite-end touches, release/cancel, ready/countdown, rapid impacts/goals, pause one-shot sound, mute/unmute, background return, zero finger offset, winner/rematch, portrait, and landscape return.

## VERIFIED expansion supersession - CATPAW-EXPANSION-001

- The settled base-game artifact is **SUPERSEDED** for current canonical claims by a local, non-remote expansion build: `dist/index.html`, 579,921 bytes, SHA-256 `43243d2eec6775fa45ab93ef3b1facce92e4a387bc7141a12e128214607cc423`, build `cat-paw-air-hockey-9bbbce7fdf80`, source SHA-256 `9bbbce7fdf804d65040415e1b2c81fb87893deb4f1775d7afbd6ff70d6da67b3`.
- The fresh materialization passed direct lint, typecheck, source tests, SFHS inspect, validate, check, pack, verify, and exact packed Chromium smoke. Check retained `SFHS_TEST_SELECTION_REVIEW_REQUIRED` as a non-fatal coverage-review warning; its lint, typecheck, build-pack-verify, unit-all, and browser-smoke steps passed.
- The browser smoke proved Pixi WebGL, one visible canvas, no console/page errors, only the local root request, pointer lifecycle checks, landscape gate, pause/resume, ready/countdown, and mirrored paused-menu synchronization. Samsung evidence is **UNTESTED** for this changed artifact; prior physical acceptance remains **REPORTED** only.

## VERIFIED workflow repair - BASELINE-SETTLE-001-R1

- Actions quality run `30917337883` (job `92018696615`) failed on 2026-08-04. Checkout used `fetch-depth: 1`, so the pull-request base `05d39abdf8ec943b2ee4004163752a0305e1cc51` was absent. `git diff` emitted `fatal: bad object 05d39abdf8ec943b2ee4004163752a0305e1cc51`; the workflow's `|| true` then converted that failure into `changedPaths: []`. This is a CI correctness defect, not an empty change set.
- The same run's repository-root `pnpm test` passed all input, physics, match-flow, audio, and orientation scenarios. The later SFHS check reported only `pnpm run test failed with exit code 1`; its pinned CLI inherited a generic command plan and suppresses child-process output, so that record did not prove a failing Cat Paw test.
- A fresh disposable materialization was tested directly with `pnpm test`, with visible output: 13 input, 16 physics, 6 match-flow, 6 audio, and orientation scenarios all passed. The materialized package had no `lint` or `typecheck` scripts even though `sfhs check` requires them; those durable project scripts and their TypeScript/ESLint configuration are now present. This is the proven project/materialization gap repaired by R1.
- The direct materialized command passed, while SFHS's spawned `pnpm run test` did not. The product `test` script now runs its same five Node test commands directly, and Quality runs the materialized `pnpm test` first with visible output before retaining SFHS check as its separate required gate. The remaining executor defect is recorded below.
- Quality now checks out full history and proves the base object with `git cat-file -e "$base^{commit}"` before diffing. A missing base is fatal and can never be treated as an empty diff.

## SUPERSEDED pinned SFHS check executor

- Actions runs `30921067361`, `30921401375`, and `30921722974` all reproduced the remaining `sfhs check` failure after the direct materialized `pnpm test` had passed visibly. The check reported only `SFHS_TEST_STEP_FAILED` for `pnpm run test`.
- The pinned SFHS source at `68ef8f021eea2ab90a57ca6e2f608d8166a39859` proves the cause: `packages/cli/src/index.ts` calls `executeTestPlan(selected, options.workspaceRoot ?? workingDirectory, ...)`; `workingDirectory` is the SFHS checkout, not the `--project` path. Therefore `check --project <materialized game>` runs generic test-plan commands from SFHS rather than from the materialized game. The command's `--project` contract is not honored for its test executor.
- This was a **BLOCKED** SFHS framework defect. The product had direct materialized test output, project lint/typecheck scripts, successful inspect/validate/pack/verify, and a packed-artifact browser smoke. Making SFHS check green required a framework repair that passed the resolved project root to `executeTestPlan`.

## VERIFIED SFHS repair consumption - BASELINE-SETTLE-001-R2

- Failed quality run `30921941797`, canonical job `92034489558`, remains preserved evidence of the old pin's wrong-working-directory defect. The direct materialized test passed while the old CLI ran `pnpm run test` from the SFHS checkout.
- SFHS PR #14 merged the generic CLI repair as `5acd8fc9a24834d9416a6e615bb78b8012962e30`. The current pin consumes that exact commit; no newer SFHS revision is selected.
- R2 adds the project-owned `browser-smoke` command and materializes the pinned `@sfhs/browser-runner` overlay. The command packs the materialized project through its pinned workspace, then runs the existing exact-artifact smoke. Chromium installation occurs before `sfhs check` in durable CI. These are test/materialization changes only; gameplay source and behavior are unchanged.
- Quality run `30931895011` exposed a Linux-only wrapper portability gap: its first `pnpm --workspace-root` lookup could not locate the hidden materialization workspace. The wrapper now derives the exact pinned CLI entry from the junction-resolved browser-runner overlay and passes the absolute project path. This is a resolved Cat Paw wrapper issue, not an SFHS framework defect.
- A fresh R2 materialization passed direct `pnpm test`, `sfhs check` (lint, typecheck, unit-all, and browser-smoke), pack, exact verify, One-Shot audit, and the explicit packed-artifact Chromium smoke.
- The actual PR changed-path check also passed. It retained the non-fatal `SFHS_TEST_SELECTION_REVIEW_REQUIRED` warning for inherited unknown runtime-like paths (including `src/main.ts`, selected test records, and One-Shot evidence records); no warning was suppressed or promoted to a failure. Its selected static/build, unit, and browser-smoke steps all passed.
- The current Linux canonical result is `dist/index.html`, 560,309 bytes, SHA-256 `78d728fe96f74ee92bdbaecaa8a0e7bd880dff29efd6d19ec2fc09dcfe309534`, build `cat-paw-air-hockey-b6bee877e2dc`, source SHA-256 `b6bee877e2dcc2f1b6caa3261dc9eecec63dca2b2845d15f5c24d362e90a46bf`. It supersedes the former 560,309-byte identity after the timing-safe smoke assertion and does not add gameplay changes.
- Physical Samsung acceptance remains **UNTESTED** for this artifact. Historical physical evidence remains **REPORTED** and bound to its earlier identity.

## VERIFIED browser-smoke timing repair

- Quality runs `30932222927` and `30932492091` remained unable to expose the project-owned browser child's stderr after the prior wrapper repairs. Run `30932824397` retained `test-results/browser-smoke-error.txt` and proved the failure was `canonical-browser.ts:93`: a 30-second wait for the transient `countdown` phase after resuming.
- This was a browser-smoke assertion race, not a gameplay or SFHS defect. On a slower Linux runner, the live three-second countdown can advance to `playing` between resume and the phase poll. The smoke now proves the UI pause state is reached, the control changes to Resume, resume leaves the paused state, and the control returns to Pause. The deterministic match-flow suite continues to prove exact phase restoration.
