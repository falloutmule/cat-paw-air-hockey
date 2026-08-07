# Project Status

## Current playable scope

| Area | Status | Evidence / note |
| --- | --- | --- |
| Shared-phone local two-player air hockey | VERIFIED IMPLEMENTED | Input, physics, and match-flow suites; packed Chromium smoke |
| First-to-five, ready/countdown, goal reset, winner/rematch | VERIFIED IMPLEMENTED | Match-flow suite |
| Pointer lifecycle, legal halves, third-touch rejection | VERIFIED IMPLEMENTED | 13 input scenarios and browser smoke |
| Audio, mute, pause, background recovery, reduced effects | VERIFIED IMPLEMENTED | Audio suite and source/browser checks |
| Fullscreen, mirrored settings, return-speed handicaps, score capture, local themes | VERIFIED IMPLEMENTED | Canonical packed artifact and browser smoke; Samsung evidence pending |
| One Pixi WebGL canvas / no runtime external requests | VERIFIED IMPLEMENTED | SFHS manifest and packed Chromium smoke |
| GitHub Pages | VERIFIED IMPLEMENTED | [Live site](https://falloutmule.github.io/cat-paw-air-hockey/) from Pages workflow run `31099501221`; downloaded bytes match the canonical artifact |
| Current-artifact Samsung acceptance | UNTESTED | Earlier device results are artifact-specific and SUPERSEDED |

## Canonical identity

The Linux canonical record is build `cat-paw-air-hockey-64741220be29`, 581,644 bytes, SHA-256 `0d18270c36ff36987c8653579693a3dca3fc62b4271ea2cb55be0c13816f6b53`, source SHA-256 `64741220be29f0db3a3044f977d4cbba8acb0fb92d4c181c571d11f8f3afeeca`. GitHub Pages workflow run `31099501221` packed, exactly verified, browser-smoked, deployed, and byte-compared that artifact at [the live site](https://falloutmule.github.io/cat-paw-air-hockey/). The prior Windows-only artifact is SUPERSEDED; its physical acceptance does not transfer.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra session remains required.

Release terminology remains deliberately limited: automated and deployment gates pass, while artifact-bound physical-device acceptance is still UNTESTED.
