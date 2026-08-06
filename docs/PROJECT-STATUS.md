# Project Status

## Current playable scope

| Area | Status | Evidence / note |
| --- | --- | --- |
| Shared-phone local two-player air hockey | VERIFIED IMPLEMENTED | Input, physics, and match-flow suites; packed Chromium smoke |
| First-to-five, ready/countdown, goal reset, winner/rematch | VERIFIED IMPLEMENTED | Match-flow suite |
| Pointer lifecycle, legal halves, third-touch rejection | VERIFIED IMPLEMENTED | 13 input scenarios and browser smoke |
| Audio, mute, pause, background recovery, reduced effects | VERIFIED IMPLEMENTED | Audio suite and source/browser checks |
| Fullscreen, mirrored settings, return-speed handicaps, score capture, local themes | VERIFIED IMPLEMENTED locally | Current local canonical artifact; Samsung evidence pending |
| One Pixi WebGL canvas / no runtime external requests | VERIFIED IMPLEMENTED | SFHS manifest and packed Chromium smoke |
| GitHub Pages | PROPOSED | Action workflow will publish verified `main` only |
| Current-artifact Samsung acceptance | UNTESTED | Earlier device results are artifact-specific and SUPERSEDED |

## Canonical identity

The local record is build `cat-paw-air-hockey-95ed3f8aa868`, 581,644 bytes, SHA-256 `816c04a93ac85d7653ab6a6af6ea61f3a80b0d47a0cf4569174f95a6d5fa1adf`, source SHA-256 `95ed3f8aa86811085394b277816344c229a42a0696aa37cac313a3554a3ea72e`. It is verified locally but has not yet been published to Pages. The publication commit and deployment run will replace this paragraph only after exact verification and byte comparison.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- GitHub Pages is not configured at the start of this graduation run.

Release terminology is deliberately withheld until the verified canonical branch and Pages parity gates complete.
