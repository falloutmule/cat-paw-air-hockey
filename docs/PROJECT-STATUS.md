# Project Status

## Current playable scope

| Area | Status | Evidence / note |
| --- | --- | --- |
| Shared-phone local two-player air hockey | VERIFIED IMPLEMENTED / REPORTED PHYSICAL PASS | Input, Rapier physics, match-flow, packed semantic browser, and Samsung session |
| 540×1200 edge-to-edge mechanics | VERIFIED IMPLEMENTED | Walls at x=0/540; 25 focused tall-board/art checks; deep-defense screenshots |
| First-to-five, ready/countdown, goal reset, winner/capture/rematch | VERIFIED IMPLEMENTED | Match-flow and normal-action packed-browser proof |
| Pointer lifecycle, legal halves, third-touch rejection | VERIFIED IMPLEMENTED | 13 input scenarios and packed browser proof |
| Audio, mute, pause, background recovery, reduced effects | VERIFIED IMPLEMENTED | Audio suite and source/browser checks |
| Fullscreen, mirrored settings, return-speed handicaps, local themes | VERIFIED IMPLEMENTED | Canonical packed artifact, browser proof, and Samsung session |
| Shared center controls and independent Board PNG | VERIFIED IMPLEMENTED | Four live controls; strict 1080×2400 Board migration/replacement/invariance proof |
| Dynamic couch goals | VERIFIED IMPLEMENTED | Persistent Pixi NineSliceSprite goals; independent 75%–125% mechanics/presentation; thick dual-contrast frame and outlined GOAL text |
| One Pixi WebGL canvas / no runtime external requests | VERIFIED IMPLEMENTED | SFHS manifest and packed Chromium proof |
| GitHub Pages | VERIFIED IMPLEMENTED / SUPERSEDED ARTIFACT | [Live site](https://falloutmule.github.io/cat-paw-air-hockey/) remains historical; R3 is local only and no remote action was authorized |
| Size-setting discoverability and deferred paw application | VERIFIED REPAIRED | Goal Size/Paw Size lead the menu; packed proof checks 90 -> 112.5 paw diameter at the safe boundary |
| Approved BOARD-ART-001 default | VERIFIED INTEGRATED | Exact approved 1080×2400 PNG; nearest-neighbor Board sprite; packed composed visual proof |
| Accepted custom-solver Samsung baseline | REPORTED PASS | Exact build `cat-paw-air-hockey-06998a9ce8bc`; preserved artifact-bound report from 2026-08-12 |
| CATPAW-RAPIER-001 Samsung acceptance | REPORTED PASS | User reported snappier, more responsive play and no regressions for the exact artifact |
| Settings defaults and phone controls | VERIFIED REPAIRED | Sizes default to 200% over 25–200%; speeds default to 100% over 70–130%; mirrored sticky Close and one thin native scrollbar per half pass packed multi-viewport Chromium |
| Godot puck-and-paw contact animation | VERIFIED IMPLEMENTED | Five deterministic sheets, last-hitter palette, seven synchronized frames, collision-normal recoil, static-theme fallback, reduced-motion rest frames, focused resolver/export tests, and normal-pointer semantic browser proof |

## Canonical identity

The locally verified CATPAW-RAPIER-001 target is build `cat-paw-air-hockey-b83bd150d75e`, 5,857,863 bytes, SHA-256 `827d1b6d1e3aa8877b206d2be5c89baaea89b5cd04e8643196b394b3f7789b1a`, source SHA-256 `b83bd150d75e68db243ed39b8d18aee32e6df349e634dc3f672fbd29d757fa1d`. It uses SFHS commit `fce070a0a08a9b4e0fbebda75440eaee80bb95a9` and reports a 13-body Rapier 2D world. The prior accepted custom-solver identity remains unchanged as the physical baseline.

## Known limitations and blockers

- WebGL is mandatory.
- Formal device model, Android/Chrome versions, viewport/DPR, screenshots/video, and instrumented frame-pacing/thermal measurements were not supplied with the PASS.

Release terminology remains deliberately limited: CATPAW-RAPIER-001 automated gates pass and artifact-bound physical-device acceptance is REPORTED PASS. No push, PR, release, or deployment has occurred.
