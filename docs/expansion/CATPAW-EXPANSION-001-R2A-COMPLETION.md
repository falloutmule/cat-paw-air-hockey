# CATPAW-EXPANSION-001-R2A completion record

Status: `VERIFIED` locally / Samsung physical result `UNTESTED`

The Samsung report bound to deployed build `cat-paw-air-hockey-8115d17dfa2c` is retained as `REPORTED FAIL / NEEDS REPAIR`: the settings presentation was physically the wrong size. R2A changes viewport and layout mechanics only. It does not change gameplay geometry, physics, art, theme format, or product scope.

## Diagnosed cause and repair

The Pixi runtime already owned a fixed-contain 540 x 960 viewport, but the surrounding product UI independently sized itself with `100dvw` / `100dvh`, percentage positions, and its own `visualViewport` / `innerWidth` orientation read. The mirrored menu rotated the scrolling grid child directly. These competing layout paths could disagree on Android when browser chrome or fullscreen changed the visual viewport.

SFHS `runtime.getViewport()` is now the sole product viewport authority. One update copies that snapshot into the shell and derives the canvas/playfield screen rectangle used by the DOM controls. Orientation consumes the same snapshot. Pointer input continues to use the current canvas rectangle, with its duplicated conversion consolidated into one screen-to-logical function. Each menu half is a bounded viewport half; only its inner panel rotates and scrolls. The document never owns menu scrolling.

The 1080 x 1920 Board texture remains presentation data. Its persistent sprite is explicitly 540 x 960 logical units; bitmap pixels do not affect the viewport, DOM, controls, or input.

## Verification

- Standalone source tests: passed (13 input, 16 physics, 6 match-flow, 6 audio, orientation, 19 settings, 16 return-speed, 19 shared-control, 14 fullscreen checks).
- Fresh disposable materialization: tests, lint, and typecheck passed.
- One-Shot inspect/audit and SFHS inspect/validate/check/pack/verify: passed.
- `SFHS_TEST_SELECTION_REVIEW_REQUIRED`: retained as a non-fatal coverage-review warning.
- Packed Chromium: passed at 412 x 915, 360 x 800, and 412 x 1000, including exact viewport containment, no document overflow, independent half scrolling, one WebGL canvas, Board pixel/logical independence, safe shared controls, fullscreen resize, and exact screen-to-logical pointer mapping.
- Physical Samsung result: `UNTESTED`; use `CATPAW-EXPANSION-001-R2A-PHYSICAL-TEST-SEED.md`.

The exact final artifact identity is recorded in `one-shot/VERIFICATION-REPORT.md` and `one-shot/canonical-browser.json`.
