# Project Status

## Current playable scope

| Area | Status | Evidence / note |
| --- | --- | --- |
| Shared-phone local two-player air hockey | VERIFIED IMPLEMENTED | Input, physics, match-flow, and packed semantic browser suites |
| 540×1200 edge-to-edge mechanics | VERIFIED IMPLEMENTED | Walls at x=0/540; 25 focused tall-board/art checks; deep-defense screenshots |
| First-to-five, ready/countdown, goal reset, winner/capture/rematch | VERIFIED IMPLEMENTED | Match-flow and normal-action packed-browser proof |
| Pointer lifecycle, legal halves, third-touch rejection | VERIFIED IMPLEMENTED | 13 input scenarios and packed browser proof |
| Audio, mute, pause, background recovery, reduced effects | VERIFIED IMPLEMENTED | Audio suite and source/browser checks |
| Fullscreen, mirrored settings, return-speed handicaps, local themes | VERIFIED IMPLEMENTED | Canonical packed artifact and browser proof; Samsung evidence pending |
| Shared center controls and independent Board PNG | VERIFIED IMPLEMENTED | Four live controls; strict 1080×2400 Board migration/replacement/invariance proof |
| Dynamic couch goals | VERIFIED IMPLEMENTED | Persistent Pixi NineSliceSprite goals; independent 75%–125% mechanics/presentation; thick dual-contrast frame and outlined GOAL text |
| One Pixi WebGL canvas / no runtime external requests | VERIFIED IMPLEMENTED | SFHS manifest and packed Chromium proof |
| GitHub Pages | VERIFIED IMPLEMENTED / SUPERSEDED ARTIFACT | [Live site](https://falloutmule.github.io/cat-paw-air-hockey/) remains historical; R3 is local only and no remote action was authorized |
| Size-setting discoverability and deferred paw application | VERIFIED REPAIRED | Goal Size/Paw Size lead the menu; packed proof checks 90 -> 112.5 paw diameter at the safe boundary |
| Approved BOARD-ART-001 default | VERIFIED INTEGRATED | Exact approved 1080×2400 PNG; nearest-neighbor Board sprite; packed composed visual proof |
| Current-artifact Samsung acceptance | UNTESTED | BOARD-ART-001 changes the exact artifact, so prior device results do not transfer |

## Canonical identity

The locally verified BOARD-ART-001 target is build `cat-paw-air-hockey-512728228085`, 4,022,850 bytes, SHA-256 `1d6201909bec095f81a11bed9e31dd416fbfe25f0d6bb2409fb35cdcf6a16d8c`, source SHA-256 `5127282280858c4d46340b3ce5e1761df5ffe1d4349e920b3816a6a57bac2254`. The exact approved Board source is 2,562,705 bytes with SHA-256 `cfba2b87c4fec52fb0f9a491ac9fca8421fba015c86425eaa9abe9517c68bf2d`. It retains the real 540×1200 edge-wall mechanics and R2A's single viewport authority; the prior R3 artifact is superseded by this art-only source change.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra BOARD-ART-001 gameplay session remains required.

Release terminology remains deliberately limited: automated gates pass, while artifact-bound physical-device acceptance is still UNTESTED. No R3 push, PR, release, or deployment has occurred.
