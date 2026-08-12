# SCORE-CAT-GODOT-001 physical test seed

Status: **UNTESTED — PRODUCT GATE**. Test only these exact local files on the Samsung Galaxy S21 Ultra in stable Android Chrome:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `test-results/SCORE-CAT-GODOT-001/phone/score-cat-preview.html` | 46,886 | `da4665735e98edae6f77fbb66c16c6e07ad28d4be5f16adc47fbb466a81f61b2` |
| `dist/index.html` | 4,067,812 | `7a12db4fec3c6f38cd0c9e4ed5d197b36be27c9fa3a23e97728dc2469587dad2` |

Packed build: `cat-paw-air-hockey-ffaa71fb1d0d`; source SHA-256 `ffaa71fb1d0de2144997316b423628e84c0c43f928b195ad9041e42b47de8adf`. The sheets were produced with Godot `4.7.1.stable.official.a13da4feb` from official Windows archive SHA-256 `c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1`.

The prior exact build `cat-paw-air-hockey-1e9558fbf0aa` received a Samsung **FAIL**: the cats were too small, the reactions were too fast/subtle, and the neutral paws obscured the eyes. That verdict is retained under ignored `test-results/SCORE-CAT-GODOT-001-R1/physical-fail/`; it does not transfer to this repaired artifact.

Build `cat-paw-air-hockey-235ab3123bc4` is also superseded: it enlarged the cats only to 120 x 120 (1.5x), not the requested exact double size. The current build corrects both the packed board and preview to 160 x 160 (2x the original 80 x 80).

## Phone checks

1. Open the preview and inspect both actual 160 x 160 runtime-size cats against the board colors. Tap Idle, Goal, Conceded, Win, Defeated, Player 1, Player 2, and Reduced motion. Confirm clearly visible idle eyes, lowered neutral paws, sharp pixels, readable expressions, no clipping, stable feet on settled poses, correct opposite palette, and no visual jump at the anchor.
2. Open the packed game in portrait. Confirm exactly one score cat per end, unchanged large numeric scores, full P2 rotation, no overlap with goals/controls, and no blurred scaling.
3. Score once in each direction. Confirm the scorer cheers while the opponent reacts, then both settle. Pause during a goal reaction and confirm the pose holds; resume and confirm it continues.
4. Enable Reduced motion. Confirm goal reactions jump to settled frames and winner/loser jump to their final poses.
5. Reach the final goal through ordinary play. Confirm the winner sequence, defeated hold, final-score capture containing both cats, and two-player rematch returning both cats to idle frame 0.
6. Recheck independent simultaneous touch, third-touch rejection, settings, fullscreen, portrait containment, and landscape gate.

Report `PASS` or `FAIL`, the two tested SHA-256 values, device model, Android version, Chrome version, and any screenshot/video. A FAIL remains a Cat Paw repair with a new artifact identity. A PASS authorizes only the already-planned local PASS commit and subsequent isolated SFHS extraction; it does not authorize a Cat Paw push or deployment.
