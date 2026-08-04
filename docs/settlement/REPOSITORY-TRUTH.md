# Repository truth - BASELINE-SETTLE-001

## VERIFIED current repository

- Repository: `falloutmule/cat-paw-air-hockey`, public; default branch `main`.
- Settlement base: `05d39abdf8ec943b2ee4004163752a0305e1cc51`, the merge of PR #2.
- Authoritative editable source is committed directly in `src/`, with `tests/`, `public/`, `sfhs.project.json`, and `one-shot/` as product records.
- The active runtime imports `@sfhs/adapter-pixi-v8` and `@sfhs/pixi-runtime`; it presents one required WebGL Pixi surface and has no hidden Canvas world.
- The pin is SFHS `68ef8f021eea2ab90a57ca6e2f608d8166a39859`, Node 24, pnpm 11.9.0, and Pixi 8.19.0. It supersedes the historical `36cf...` pin through the merged source lineage.

## VERIFIED migration and evidence disposition

- No `.remote-import/`, `.remote-restore/`, encoded archive chunks, candidate HTML, or restoration workflow remains in the active tree.
- PR #1 and the `codex/sfhs-github-migration` branch are historical recovery work; PR #2 is merged and supplies the readable source baseline. `tree-test` and `tree-test2` are obsolete remote branches with no role in this branch.
- The prior candidate and recovery claims are preserved in `docs/migration/` and Git history, labelled **SUPERSEDED** for canonical claims.
- Earlier reports that canonical pack/verify were blocked were accurate at their time but **SUPERSEDED**. Earlier reports of a canonical artifact are historical, not authority for this changed source tree.
- The original `canonical-sfhs.yml` was meaningful but incomplete: it lacked current One-Shot preflight, product-specific packed-artifact browser evidence, and a distinct strong-evidence lane. It is replaced by durable workflows.

## VERIFIED current canonical result

The R1 materialized source passed real `sfhs pack` and `sfhs verify`:

- `dist/index.html`: 560,309 bytes; SHA-256 `3022f196f6c5d6abe9df1699d8ad57ea91e0db2b99dbb4ad748a79e8e9c2a228`
- Build ID `cat-paw-air-hockey-05dc1f192cf4`; source SHA-256 `05dc1f192cf43637373b558e3e66a0781223ecca252f791c3746910dcaf81da5`

The prior 560,167-byte artifact (`24d02527...`, build `cat-paw-air-hockey-0aee153962c5`) is **SUPERSEDED** by the R1 canonical identity. It changed with durable package-level validation configuration, not gameplay code. Its physical Samsung evidence does not transfer.

`dist/` remains ignored and is never hand-edited or committed.

## REPORTED / UNTESTED

Historical Samsung acceptance applies to a prior exact artifact only. The R1 artifact preserves base-game behavior by source and browser evidence, but its Samsung device session is **UNTESTED**. The regression checklist is: simultaneous opposite-end touches, release/cancel, ready/countdown, rapid impacts/goals, pause one-shot sound, mute/unmute, background return, zero finger offset, winner/rematch, portrait, and landscape return.

## VERIFIED workflow repair - BASELINE-SETTLE-001-R1

- Actions quality run `30917337883` (job `92018696615`) failed on 2026-08-04. Checkout used `fetch-depth: 1`, so the pull-request base `05d39abdf8ec943b2ee4004163752a0305e1cc51` was absent. `git diff` emitted `fatal: bad object 05d39abdf8ec943b2ee4004163752a0305e1cc51`; the workflow's `|| true` then converted that failure into `changedPaths: []`. This is a CI correctness defect, not an empty change set.
- The same run's repository-root `pnpm test` passed all input, physics, match-flow, audio, and orientation scenarios. The later SFHS check reported only `pnpm run test failed with exit code 1`; its pinned CLI inherited a generic command plan and suppresses child-process output, so that record did not prove a failing Cat Paw test.
- A fresh disposable materialization was tested directly with `pnpm test`, with visible output: 13 input, 16 physics, 6 match-flow, 6 audio, and orientation scenarios all passed. The materialized package had no `lint` or `typecheck` scripts even though `sfhs check` requires them; those durable project scripts and their TypeScript/ESLint configuration are now present. This is the proven project/materialization gap repaired by R1.
- The direct materialized command passed, while SFHS's spawned `pnpm run test` failed because the product `test` script nested five further `pnpm` invocations that re-entered package lifecycle context. The same five Node test commands now run directly, so the test suite is independent of the caller's package-manager lifecycle variables. Quality invokes the pinned CLI through `pnpm exec node packages/cli/src/main.ts`, runs the materialized `pnpm test` first with visible output, and retains SFHS check as a separate required gate.
- Quality now checks out full history and proves the base object with `git cat-file -e "$base^{commit}"` before diffing. A missing base is fatal and can never be treated as an empty diff.
