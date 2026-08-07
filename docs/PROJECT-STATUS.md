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

R2 local canonical target is build `cat-paw-air-hockey-eb95d3516717`, 720,601 bytes, SHA-256 `50663604dfafb35cee2bc457daadd9f7420947b8f36532a93b1b3a952f12f88d`, source SHA-256 `eb95d3516717b08a29efecbbf78287c6215982853a4fcf1953fa21bba15c9a2e`. The previously deployed R1 build `cat-paw-air-hockey-64741220be29` remains available on Pages but is **SUPERSEDED** for current local product claims. R2 is not pushed or deployed and has no transferred physical acceptance.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra session remains required.

Release terminology remains deliberately limited: automated and deployment gates pass, while artifact-bound physical-device acceptance is still UNTESTED.
