# Project Status

## Current playable scope

| Area | Status | Evidence / note |
| --- | --- | --- |
| Shared-phone local two-player air hockey | VERIFIED IMPLEMENTED | Input, physics, and match-flow suites; packed Chromium smoke |
| First-to-five, ready/countdown, goal reset, winner/rematch | VERIFIED IMPLEMENTED | Match-flow suite |
| Pointer lifecycle, legal halves, third-touch rejection | VERIFIED IMPLEMENTED | 13 input scenarios and browser smoke |
| Audio, mute, pause, background recovery, reduced effects | VERIFIED IMPLEMENTED | Audio suite and source/browser checks |
| Fullscreen, mirrored settings, return-speed handicaps, score capture, local themes | VERIFIED IMPLEMENTED | Canonical packed artifact and browser smoke; Samsung evidence pending |
| Shared center controls and independent Board PNG reskinning | VERIFIED IMPLEMENTED | Exactly four live shared controls; strict 1080×1920 Board loader/persistence/reset and packed browser proof |
| One Pixi WebGL canvas / no runtime external requests | VERIFIED IMPLEMENTED | SFHS manifest and packed Chromium smoke |
| GitHub Pages | VERIFIED IMPLEMENTED / SUPERSEDED ARTIFACT | [Live site](https://falloutmule.github.io/cat-paw-air-hockey/) serves an earlier verified build whose Samsung layout result is REPORTED FAIL / NEEDS REPAIR; R2A is local only |
| Current-artifact Samsung acceptance | UNTESTED | Earlier device results are artifact-specific and do not transfer |

## Canonical identity

The locally verified mechanics-first R2A target is build `cat-paw-air-hockey-5735c4c572c2`, 724,123 bytes, SHA-256 `acb55aec6d8d8d8d6bf1afa4634eefe5caeec51d77d95a743e4ddd29950e9c9c`, source SHA-256 `5735c4c572c28fedac73ab0eb2308ca2b983c66170c525dc40f2a714df50c5dd`. It replaces competing product viewport calculations with the SFHS runtime snapshot as sole authority and bounds each mirrored settings half to the visible viewport. The deployed `cat-paw-air-hockey-8115d17dfa2c` artifact remains preserved with a **REPORTED FAIL / NEEDS REPAIR** physical layout result; acceptance does not transfer.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra layout-first session remains required before full gameplay acceptance resumes.

Release terminology remains deliberately limited: automated and deployment gates pass, while artifact-bound physical-device acceptance is still UNTESTED.
