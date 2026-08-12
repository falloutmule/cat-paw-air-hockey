# PUCK-PAW-GODOT-001 physical test seed

Status: **UNTESTED — PRODUCT GATE**. Test only the exact local files recorded in `test-results/PUCK-PAW-GODOT-001/phone/manifest.json`.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `test-results/PUCK-PAW-GODOT-001/phone/puck-paw-preview.html` | 44,921 | `4b21e28ec5739aed2ecd5c2bfe806db80e0ba8a6e2ccd30f22178b2b1183be76` |
| `test-results/PUCK-PAW-GODOT-001/phone/index.html` | 4,117,623 | `51b92216c60556d2df9885ba5155bc427da6904b0fc3fc6a89c864e30215f42a` |

Packed build: `cat-paw-air-hockey-06998a9ce8bc`; source SHA-256 `06998a9ce8bc8b8cd578018e42b716c3c4b5b017c13626d306aa609eddc5055b`. The actor sheets were produced with Godot `4.7.1.stable.official.a13da4feb` from official Windows archive SHA-256 `c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1` through merged SFHS `37aa056b6bd0948d73fcd99c1aba558861f0037e`.

The prior build `cat-paw-air-hockey-59c8fe2815c1` has a reported Samsung PASS. It is superseded for current visual acceptance because these actor sheets and contact frames change visible bytes; its result does not transfer.

## Phone checks

1. Open `puck-paw-preview.html`. Replay both players at low and high strength and in several directions. Confirm the touching paw and puck visibly share a slower, exaggerated seven-frame impact sequence and return cleanly to idle.
2. Enable Reduced motion. Confirm both actors hold their idle cell while the selected puck palette still identifies the hitter.
3. Open `index.html` in portrait. Confirm the default paws and puck match the cats, remain crisp at the normal 200% size, and do not clip or obscure controls, goals, scores, or the rink.
4. Strike the puck repeatedly with each paw. Confirm each contact restarts one synchronized sequence, P1/P2 palettes follow the last hitter, direction reads correctly, and the puck never visually detaches far from the authoritative position.
5. Test rapid alternating contacts and glancing contacts near walls/posts. Confirm no stale frame, wrong-paw reaction, flicker, teleport, scoring change, or input loss.
6. Set paw and puck sizes to 25%, 100%, and 200%. Confirm crisp nearest-neighbor rendering, correct collision registration, and no theme/settings regression.
7. Enable Reduced motion during play. Confirm frame 0 is stable and gameplay remains readable. If a custom theme is available, confirm its static paw/puck cells still react with the bounded fallback transform.
8. Recheck simultaneous two-player touch, third-touch rejection, both scoring directions, pause/resume, fullscreen, final-score capture, rematch, landscape gate, performance, battery heat, and any visible stutter.

Report `PASS` or `FAIL`, both tested file hashes from the manifest, device model, Android version, Chrome version, and any screenshot/video. A FAIL stays in PUCK-PAW-GODOT-001 and produces a new exact artifact. A PASS authorizes recording the artifact-bound result locally; it does not authorize a push or deployment.
