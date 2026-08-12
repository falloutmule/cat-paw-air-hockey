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
| Current-artifact Samsung acceptance | UNTESTED | Settings/contact changes create a new exact artifact, so prior device results do not transfer |
| Settings defaults and phone controls | VERIFIED REPAIRED | Sizes default to 125% over 25–200%; speeds default to 75% over 70–130%; mirrored sticky Close and independent vertical scroll controls pass packed multi-viewport Chromium |
| Cat-matched contact puck | VERIFIED IMPLEMENTED | Last-hitter palette, puck squash/pop, paw recoil, reduced-motion suppression, focused resolver tests, and normal-pointer semantic browser proof |

## Canonical identity

The locally verified settings/contact target is build `cat-paw-air-hockey-d9c204866261`, 4,075,821 bytes, SHA-256 `34a3bbd431243f27797a5801095e7c5f210dca0effc4a114a19bd1efabf6dbd8`, source SHA-256 `d9c2048662618f62b1bdd2abe746fc4ecf93468e38850268e9fdce87acab4c7a`. The exact approved Board source remains 2,562,705 bytes with SHA-256 `cfba2b87c4fec52fb0f9a491ac9fca8421fba015c86425eaa9abe9517c68bf2d`. It retains the real 540×1200 edge-wall mechanics, R2A's single viewport authority, and the accepted double-size score-cat sheets.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra settings/contact gameplay session remains required.

Release terminology remains deliberately limited: automated gates pass, while artifact-bound physical-device acceptance is still UNTESTED. No R3 push, PR, release, or deployment has occurred.
