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

R2 Git-LF canonical target is build `cat-paw-air-hockey-8115d17dfa2c`, 722,423 bytes, SHA-256 `1ca4e332244149bcd3cb3db4893cfc9e4e79b715ae81bd870f9b8fb5acaff34f`, source SHA-256 `8115d17dfa2c6cfa453fc36262905a398d822d78460e1c54418191909c47d41d`. It includes direct pointer-activation fullscreen at `4a11bb8511a40d00029ffd32ad9cae732de922d5` and displays an explicit message when an embedding viewer blocks fullscreen. Earlier R2 Windows-working-copy artifacts are **SUPERSEDED**. The branch and draft PR are pushed; Pages deployment remains gated and physical acceptance has not transferred.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra session remains required, specifically confirming fullscreen entry and exit from the downloaded HTML opened directly in stable Android Chrome.

Release terminology remains deliberately limited: automated and deployment gates pass, while artifact-bound physical-device acceptance is still UNTESTED.
