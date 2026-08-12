# SCORE-CAT-GODOT-001 physical test seed

Status: **UNTESTED — PRODUCT GATE**. Test only these exact local files on the Samsung Galaxy S21 Ultra in stable Android Chrome:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `test-results/SCORE-CAT-GODOT-001/phone/score-cat-preview.html` | 44,916 | `816a87a8ae045b1a34e131bd519e27cbd072db37fcea3ed0ec234990120709f0` |
| `dist/index.html` | 4,065,857 | `c2fdf6b121ce015dcab6e7fe1be86f8f815ea20ffb1181f7dd407a2484413e94` |

Packed build: `cat-paw-air-hockey-1e9558fbf0aa`; source SHA-256 `1e9558fbf0aa97967ed024211b5b95c1da5c2609b26aad6e3c55f76a9a2400be`. The sheets were produced with Godot `4.7.1.stable.official.a13da4feb` from official Windows archive SHA-256 `c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1`.

## Phone checks

1. Open the preview and inspect both actual-size cats against the board colors. Tap Idle, Goal, Conceded, Win, Defeated, Player 1, Player 2, and Reduced motion. Confirm sharp pixels, readable expressions, no clipping, stable feet on settled poses, correct opposite palette, and no visual jump at the anchor.
2. Open the packed game in portrait. Confirm exactly one score cat per end, unchanged large numeric scores, full P2 rotation, no overlap with goals/controls, and no blurred scaling.
3. Score once in each direction. Confirm the scorer cheers while the opponent reacts, then both settle. Pause during a goal reaction and confirm the pose holds; resume and confirm it continues.
4. Enable Reduced motion. Confirm goal reactions jump to settled frames and winner/loser jump to their final poses.
5. Reach the final goal through ordinary play. Confirm the winner sequence, defeated hold, final-score capture containing both cats, and two-player rematch returning both cats to idle frame 0.
6. Recheck independent simultaneous touch, third-touch rejection, settings, fullscreen, portrait containment, and landscape gate.

Report `PASS` or `FAIL`, the two tested SHA-256 values, device model, Android version, Chrome version, and any screenshot/video. A FAIL remains a Cat Paw repair with a new artifact identity. A PASS authorizes only the already-planned local PASS commit and subsequent isolated SFHS extraction; it does not authorize a Cat Paw push or deployment.
