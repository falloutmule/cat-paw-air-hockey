# Project Status

## Current playable scope

| Area | Status | Evidence / note |
| --- | --- | --- |
| Shared-phone local two-player air hockey | VERIFIED IMPLEMENTED | Input, physics, match-flow, and packed semantic browser suites |
| 540×1200 edge-to-edge mechanics | VERIFIED IMPLEMENTED | Walls at x=0/540; 22 focused tall-board checks; deep-defense screenshots |
| First-to-five, ready/countdown, goal reset, winner/capture/rematch | VERIFIED IMPLEMENTED | Match-flow and normal-action packed-browser proof |
| Pointer lifecycle, legal halves, third-touch rejection | VERIFIED IMPLEMENTED | 13 input scenarios and packed browser proof |
| Audio, mute, pause, background recovery, reduced effects | VERIFIED IMPLEMENTED | Audio suite and source/browser checks |
| Fullscreen, mirrored settings, return-speed handicaps, local themes | VERIFIED IMPLEMENTED | Canonical packed artifact and browser proof; Samsung evidence pending |
| Shared center controls and independent Board PNG | VERIFIED IMPLEMENTED | Four live controls; strict 1080×2400 Board migration/replacement/invariance proof |
| Dynamic couch goals | VERIFIED IMPLEMENTED | Persistent Pixi NineSliceSprite goals; independent 75%–125% mechanics/presentation; thick dual-contrast frame and outlined GOAL text |
| One Pixi WebGL canvas / no runtime external requests | VERIFIED IMPLEMENTED | SFHS manifest and packed Chromium proof |
| GitHub Pages | VERIFIED IMPLEMENTED / SUPERSEDED ARTIFACT | [Live site](https://falloutmule.github.io/cat-paw-air-hockey/) remains historical; R3 is local only and no remote action was authorized |
| Size-setting discoverability and deferred paw application | VERIFIED REPAIRED | Goal Size/Paw Size lead the menu; packed proof checks 90 -> 112.5 paw diameter at the safe boundary |
| Current-artifact Samsung acceptance | UNTESTED | The prior R3 file received a REPORTED FAIL / NEEDS REPAIR result; that result does not transfer to this repair |

## Canonical identity

The locally verified R3 repair target is build `cat-paw-air-hockey-32b6e5f50e9d`, 733,730 bytes, SHA-256 `47db45150895e881b94b370ff8b7e6a55b6f6d9d08891cbe420ddd76ed711416`, source SHA-256 `32b6e5f50e9da5437f7e977ebf8d8d5ce99855faf7a0a9e860770e5aa5897ab5`. It retains the real 540×1200 edge-wall mechanics and R2A's single viewport authority. The prior R3 file is superseded after the Samsung report showed that size controls and their deferred application were not clear enough.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra R3 gameplay session remains required.

Release terminology remains deliberately limited: automated gates pass, while artifact-bound physical-device acceptance is still UNTESTED. No R3 push, PR, release, or deployment has occurred.
