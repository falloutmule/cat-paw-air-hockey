# SCORE-CAT-GODOT-001 physical test seed

Status: **UNTESTED — PRODUCT GATE**. Test only these exact local files on the Samsung Galaxy S21 Ultra in stable Android Chrome:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `test-results/SCORE-CAT-GODOT-001/phone/score-cat-preview.html` | 46,886 | `f927f3f0e42283b77b38cc1b015a749c8ae3d08b8a23b8f7b5f0c0c9e06573db` |
| `dist/index.html` | 4,067,814 | `a2d26f85dbe66a8ba1db1a7c3df3d16fa7b044418198e57afdb4ca9429ab0b63` |

Packed build: `cat-paw-air-hockey-235ab3123bc4`; source SHA-256 `235ab3123bc48cd85d8f76541bd81d5c2ae66b5a7f109b27df386480d78fe70b`. The sheets were produced with Godot `4.7.1.stable.official.a13da4feb` from official Windows archive SHA-256 `c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1`.

The prior exact build `cat-paw-air-hockey-1e9558fbf0aa` received a Samsung **FAIL**: the cats were too small, the reactions were too fast/subtle, and the neutral paws obscured the eyes. That verdict is retained under ignored `test-results/SCORE-CAT-GODOT-001-R1/physical-fail/`; it does not transfer to this repaired artifact.

## Phone checks

1. Open the preview and inspect both actual 120 x 120 runtime-size cats against the board colors. Tap Idle, Goal, Conceded, Win, Defeated, Player 1, Player 2, and Reduced motion. Confirm clearly visible idle eyes, lowered neutral paws, sharp pixels, readable expressions, no clipping, stable feet on settled poses, correct opposite palette, and no visual jump at the anchor.
2. Open the packed game in portrait. Confirm exactly one score cat per end, unchanged large numeric scores, full P2 rotation, no overlap with goals/controls, and no blurred scaling.
3. Score once in each direction. Confirm the scorer cheers while the opponent reacts, then both settle. Pause during a goal reaction and confirm the pose holds; resume and confirm it continues.
4. Enable Reduced motion. Confirm goal reactions jump to settled frames and winner/loser jump to their final poses.
5. Reach the final goal through ordinary play. Confirm the winner sequence, defeated hold, final-score capture containing both cats, and two-player rematch returning both cats to idle frame 0.
6. Recheck independent simultaneous touch, third-touch rejection, settings, fullscreen, portrait containment, and landscape gate.

Report `PASS` or `FAIL`, the two tested SHA-256 values, device model, Android version, Chrome version, and any screenshot/video. A FAIL remains a Cat Paw repair with a new artifact identity. A PASS authorizes only the already-planned local PASS commit and subsequent isolated SFHS extraction; it does not authorize a Cat Paw push or deployment.
