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
| Current-artifact Samsung acceptance | UNTESTED | Godot gameplay-actor sheets create a new exact artifact, so the previous settings/contact PASS does not transfer |
| Settings defaults and phone controls | VERIFIED REPAIRED | Sizes default to 200% over 25–200%; speeds default to 100% over 70–130%; mirrored sticky Close and one thin native scrollbar per half pass packed multi-viewport Chromium |
| Godot puck-and-paw contact animation | VERIFIED IMPLEMENTED | Five deterministic sheets, last-hitter palette, seven synchronized frames, collision-normal recoil, static-theme fallback, reduced-motion rest frames, focused resolver/export tests, and normal-pointer semantic browser proof |

## Canonical identity

The locally verified PUCK-PAW-GODOT-001 target is build `cat-paw-air-hockey-06998a9ce8bc`, 4,117,623 bytes, SHA-256 `51b92216c60556d2df9885ba5155bc427da6904b0fc3fc6a89c864e30215f42a`, source SHA-256 `06998a9ce8bc8b8cd578018e42b716c3c4b5b017c13626d306aa609eddc5055b`. The five gameplay-actor sheets were exported twice with Godot `4.7.1.stable.official.a13da4feb` and merged SFHS commit `37aa056b6bd0948d73fcd99c1aba558861f0037e`. It retains the real 540×1200 edge-wall mechanics, R2A's single viewport authority, and the accepted double-size score-cat sheets.

## Known limitations and blockers

- A physical Samsung Galaxy S21 Ultra report must name the exact packed build, byte size, and SHA-256; no prior acceptance transfers automatically.
- WebGL is mandatory.
- A new exact-artifact Samsung Galaxy S21 Ultra puck-and-paw gameplay session remains required.

Release terminology remains deliberately limited: automated gates pass, while artifact-bound physical-device acceptance is still UNTESTED. No R3 push, PR, release, or deployment has occurred.
