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
| GitHub Pages | VERIFIED IMPLEMENTED | [Live site](https://falloutmule.github.io/cat-paw-air-hockey/) from Pages workflow run `31099501221`; downloaded bytes match the canonical artifact |
| Current-artifact Samsung acceptance | UNTESTED | Earlier device results are artifact-specific and SUPERSEDED |

## Canonical identity

The verified touch-activation repair target is build `cat-paw-air-hockey-e15fc84c48fb`, 722,382 bytes, SHA-256 `2a45ce59d5a976a2196276de05d9672554f25467af6e44e3cbebda3f59d5d261`, source SHA-256 `e15fc84c48fb44ca4c8e6ddba9280c0586fde84e714e2e263d2b8e4f9d232cda`. Commit `eb7b3ce50e77aeec84c9d3144a3aa0d771f6270e` requests fullscreen from the trusted post-touch click instead of the pre-activation pointerdown. The prior Pages artifact is **SUPERSEDED** by the artifact-bound Samsung failure screenshot; physical acceptance has not transferred.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra session remains required, specifically confirming fullscreen entry and exit from the HTTPS GitHub Pages game in stable Android Chrome.

Release terminology remains deliberately limited: automated and deployment gates pass, while artifact-bound physical-device acceptance is still UNTESTED.
