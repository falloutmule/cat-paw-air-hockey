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

R2 local canonical target is build `cat-paw-air-hockey-36b74a1c8988`, 721,605 bytes, SHA-256 `81279cdd3319ea721469ea907461eca1f5c779f90bc6c0a4da388e2ac0d46f9f`, source SHA-256 `36b74a1c898885a2b9fee592cdaf133c44db2bf8bd3ebeedde62becc4430cc00`. It includes the bounded mobile fullscreen compatibility repair at `c554523bb556d9ed875971c1f1cc035ac99d450b`. The first R2 build `cat-paw-air-hockey-eb95d3516717` is **SUPERSEDED** after the user reported its fullscreen control did not work on the target device. R2 is not pushed or deployed and has no transferred physical acceptance.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra session remains required, specifically confirming fullscreen entry and exit from the downloaded HTML opened directly in stable Android Chrome.

Release terminology remains deliberately limited: automated and deployment gates pass, while artifact-bound physical-device acceptance is still UNTESTED.
