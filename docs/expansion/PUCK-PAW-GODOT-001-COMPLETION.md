# PUCK-PAW-GODOT-001 completion

## What was done

- Added a minimal Godot 4.7.1 project and renderer-neutral SFHS descriptors for the default paw and puck.
- Exported palette-only P1/P2 paw sheets and neutral/P1/P2 puck sheets. Every sheet contains idle plus seven ordered contact frames with transparent RGBA output and nearest-neighbor runtime sampling.
- Replaced the default procedural actors with Pixi sprites while retaining the existing custom-theme static-cell fallback.
- Synchronized the touching paw and puck for 0.64 seconds after an authoritative paw hit. Last-hit palette, collision normal, and collision strength affect presentation only.
- Kept reduced motion on frame 0 and preserved all mechanics, scoring, touch ownership, persistence, settings, capture, and one-canvas behavior.
- Added an offline phone preview with player, direction, strength, replay, and reduced-motion controls plus visible diagnostics.

## Verified

- Official Godot `4.7.1.stable.official.a13da4feb`; Windows archive SHA-256 `c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1`.
- Repeated paw and puck exports are byte-identical on the tested Windows producer.
- Focused tests cover descriptor outputs, PNG identities, frame order, palette silhouette parity, both players, all reaction frames, reduced motion, phase settling, event restart, and authoritative collision normals.
- Fresh merged-SFHS materialization passes lint, typecheck, tests, inspect, validate, check, pack, exact verify, responsive packed Chromium, and the normal-action contact/winner/capture/rematch lane.
- Canonical artifact: build `cat-paw-air-hockey-06998a9ce8bc`, 4,117,623 bytes, SHA-256 `51b92216c60556d2df9885ba5155bc427da6904b0fc3fc6a89c864e30215f42a`, source SHA-256 `06998a9ce8bc8b8cd578018e42b716c3c4b5b017c13626d306aa609eddc5055b`.

## Failed

- The first final semantic match reached 1–1 and then parked a finite puck at the side wall, matching the driver's documented low-frequency timing variance. The owning lane was rerun against identical verified bytes and passed 5–0 with contact animation, capture, and rematch. No product or physics change was made.

## Current exact state

- Product implementation and automated verification: **PASS**.
- Samsung physical result for these exact preview/game bytes: **REPORTED PASS** on 2026-08-12 (“Pass everything appears to work.”).
- The previous settings artifact's reported PASS is retained but does not transfer.
- Remote mutation: none; this branch is local-only.

## Remaining blocker

None for the bounded product initiative. Formal device/browser/thermal metadata remains unavailable and is not inferred.

## Evidence

- `test-results/PUCK-PAW-GODOT-001/phone/`
- `test-results/PUCK-PAW-GODOT-001/packed-browser/`
- `test-results/PUCK-PAW-GODOT-001/semantic-browser/`
- `one-shot/canonical-browser.json`
- `one-shot/VERIFICATION-REPORT.md`

## Failure-mode audit

| Mode | Result | Guard |
| --- | --- | --- |
| A/B artifact drift and non-canonical output | PASS | Repeated Godot export plus exact merged-SFHS pack and verify bind all delivered bytes. |
| D external dependency regression | PASS | Actor sheets are embedded by the packer; packed browser records only local `/` requests. |
| E timing/state coupling | PASS | A pure presentation resolver consumes authoritative events; physics and scoring do not read animation state. |
| F layout and clipping | PASS | Export validation, transparent borders, bounds checks, and responsive packed screenshots. |
| I reduced-motion behavior | PASS | Focused and packed diagnostics hold frame 0 while retaining palette identity. |
| Q capture/one-canvas presentation | PASS | Actors render in the sole Pixi WebGL canvas and the semantic capture path is unchanged. |
| R deterministic generated media | PASS | Same-environment reruns produce identical PNG, metadata, validation, and SHA-256 values. |
| S renderer/runtime boundary | PASS | Godot is authoring-time only; runtime uses pre-rendered Pixi textures with no skeletal system. |
| T proof completeness | PASS / REPORTED | Automated evidence is exact-artifact bound and the user's Samsung PASS is recorded against the exact preview/game identities; missing formal metadata remains explicit. |

## GitHub and publication

No push, pull request, release, deployment, tag, or remote branch change was authorized or performed.
