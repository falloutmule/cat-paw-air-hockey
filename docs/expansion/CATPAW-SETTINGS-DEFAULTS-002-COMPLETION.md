# CATPAW-SETTINGS-DEFAULTS-002 completion

## What was done

- Restored puck, both paw, and both return-speed defaults to 100%.
- Raised puck, both paw, and both goal-size defaults to 200%, retaining the 25–200% size ranges and 70–130% speed ranges.
- Added settings schema v3. Prior v2 values equal to the former 75% speed or 125% size normals migrate to the new 100%/200% normals; deliberate non-default values are preserved.
- Removed both large outer range-based scroll controls. Each mirrored half retains one thin native scrollbar and a sticky, always-visible Close button.
- Updated the packed browser and normal-action semantic driver for the legal 200% geometry.

## Verified

- Source suite: 211 focused scenarios pass.
- Pinned SFHS `5acd8fc9a24834d9416a6e615bb78b8012962e30`: lint, typecheck, pack, and exact verify pass.
- Packed Chromium 149: responsive settings/default/migration/layout checks pass with one canvas, no external runtime requests, and no page or console errors.
- Normal pointer lane observes real puck contact deformation and palette ownership, reaches 5–2, captures the Pixi canvas, and rematches.
- Canonical artifact: build `cat-paw-air-hockey-59c8fe2815c1`, 4,073,692 bytes, SHA-256 `3310e4f0992803d06f64ad1ed30f9e1f62c19481f476fc74e7180c4af398aa4e`, source SHA-256 `59c8fe2815c1a9d9cc89ccac77b936c05c9623fef85cc7332047947353d24c06`.

## Failed

- Early semantic attempts retained unreachable old-size boundaries or allowed the test driver to park a stationary puck near the neutral-zone wall. The failures were test-driver assumptions, not product exceptions. Radius-aware legal boundaries, explicit contact observation, and a neutral-zone recovery sweep repaired the lane without changing simulation or physics.

## Current exact state

- Product implementation and automated verification: **PASS**.
- Samsung physical result for these exact bytes: **REPORTED PASS** on 2026-08-12.
- Remote mutation: none; the Cat Paw branch remains local-only.

## Remaining blocker

None for the product gate. Formal device/browser metadata was not supplied with the PASS and is recorded as missing rather than inferred.

## Next

Begin the isolated renderer-neutral SFHS Godot animation workflow extraction; do not modify or push the Cat Paw product branch.

## Evidence

- `test-results/CATPAW-SETTINGS-DEFAULTS-002/packed-browser-pass/`
- `test-results/CATPAW-SETTINGS-DEFAULTS-002/semantic-browser/`
- `test-results/CATPAW-SETTINGS-DEFAULTS-002/phone/`
- `one-shot/canonical-browser.json`
- `one-shot/VERIFICATION-REPORT.md`

## Failure-mode audit

| Mode | Result | Guard |
| --- | --- | --- |
| A/B artifact drift and non-canonical output | PASS | Exact pinned materialization, pack, verify, and hash binding. |
| C/D external dependencies and CSP regression | PASS | Packed browser recorded only local `/` requests and zero runtime errors. |
| F layout containment | PASS | 412×915, 360×800, 390×844, 360×640, and 1080×2400 settings evidence. |
| H/J input and simulation ownership | PASS | Only settings defaults/migration and settings DOM changed; physics remained authoritative. |
| K touch scrolling | PASS | Native per-panel scrolling retained; duplicate outer touch sliders removed; Close remains sticky. |
| N save/settings migration | PASS | v2-to-v3 focused and packed migration assertions preserve deliberate values. |
| P/Q capture and one-canvas presentation | PASS | Semantic capture lane and packed one-canvas assertion pass. |
| T proof completeness | PASS | Automated evidence is artifact-bound and the user-reported Samsung PASS is bound to the exact artifact identity. Missing formal device metadata remains explicit. |
| Other catalog modes | N/A | No corresponding system was changed by this repair. |

## GitHub and publication

No push, pull request, release, deployment, tag, or remote branch change was authorized or performed.
