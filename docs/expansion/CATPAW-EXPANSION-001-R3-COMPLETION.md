# CATPAW-EXPANSION-001-R3 completion record

Status: `VERIFIED` locally / Samsung physical result `UNTESTED`

Starting authority: branch `codex/fullscreen-menu-theme-001` at `53c3841053d63ac1f0ec7bd336fcc41ac5a8751a`. R2A's SFHS viewport snapshot, one contain transform, one canvas mapping, bounded settings halves, and fullscreen resize path remain intact.

## Mechanics

- Logical Board: 540 x 1200; center `(270, 600)`.
- Rink: left `0`, right `540`, top `54`, bottom `1146`.
- Player 1 home/ready: `(270, 1014)` / `(270, 1028)`.
- Player 2 home/ready: `(270, 186)` / `(270, 172)`.
- Mechanical rink width: 456 to 540 logical pixels. Default striker-center horizontal travel: 366 to 450.
- Default per-player vertical defensive travel: 325 to 445 logical pixels.
- The restitution, damping, default radii, target score, countdown, collision algorithms, return-speed rule, and match lifecycle are preserved.

## Board and goals

The Board is one persistent 540 x 1200 presentation sprite backed by an exact 1080 x 2400 PNG. An R2 `board-r2` record is retained in IndexedDB, reported as incompatible, and never stretched or deleted by launch/reset. R3 uses a separate `board-r3` record; invalid replacements leave the working Board untouched.

Both dynamic goals use a persistent Pixi v8 `NineSliceSprite` sourced from `art/goals/cat-paw-couch-goal.png`, plus Graphics frames/posts and outlined Pixi Text. The nominal mechanical opening remains 184 logical pixels. Browser diagnostics proved 138 pixels at 75%, 184 at 100%, and 230 at 125%; couch visual widths are 186, 232, and 278 respectively. Pixel textures use nearest-neighbor sampling.

## Viewport and input evidence

- 412 x 915: contained rectangle `x=0.125`, `y=0`, `411.75 x 915`.
- 360 x 800: exact full-viewport 20:9 containment.
- 390 x 844: uniform containment with minor horizontal margins.
- 360 x 640: contained rectangle `x=36`, `y=0`, `288 x 640`.
- Screen center maps to approximately `(270, 600)`; a 75% vertical point maps to approximately `(270, 900)` after ordinary and fullscreen resize.
- No crop, stretch, responsive physics, second viewport authority, bitmap-driven DOM size, or device-specific branch was added.

## Verification

- Source and fresh materialized tests: passed (13 input, 16 physics, 6 match-flow, 6 audio, orientation, 19 settings, 16 return-speed, 19 shared-control, 14 fullscreen, and 22 tall-board checks).
- Fresh materialized lint/typecheck: passed.
- One-Shot inspect, SFHS inspect/validate/check/pack/verify: passed. The non-fatal `SFHS_TEST_SELECTION_REVIEW_REQUIRED` warning is retained honestly.
- Packed Chromium: passed responsive/menu, input, Board migration/replacement invariance, independent goal resizing, fullscreen/orientation, deep defense, winner/capture, and rematch scenarios with no page/console errors or unexpected external requests.
- Production diff from R2A: 246 lines added, 130 deleted across `src/` and `sfhs.project.json`; obsolete 960-height geometry and old procedural goal drawing were removed.
- Physical Samsung status: `UNTESTED`; use `CATPAW-EXPANSION-001-R3-PHYSICAL-TEST-SEED.md`.

The exact final artifact identity is recorded in `one-shot/VERIFICATION-REPORT.md` and `one-shot/canonical-browser.json`.
