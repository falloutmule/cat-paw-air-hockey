# SCORE-CAT-GODOT-001 physical test seed

Status: **UNTESTED — PRODUCT GATE**. Test only these exact local files on the Samsung Galaxy S21 Ultra in stable Android Chrome:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `test-results/CATPAW-SETTINGS-CONTACT-001/phone/score-cat-preview.html` | 46,886 | `da4665735e98edae6f77fbb66c16c6e07ad28d4be5f16adc47fbb466a81f61b2` |
| `test-results/CATPAW-SETTINGS-CONTACT-001/phone/index.html` | 4,075,821 | `34a3bbd431243f27797a5801095e7c5f210dca0effc4a114a19bd1efabf6dbd8` |

Packed build: `cat-paw-air-hockey-d9c204866261`; source SHA-256 `d9c2048662618f62b1bdd2abe746fc4ecf93468e38850268e9fdce87acab4c7a`. The score-cat sheets were produced with Godot `4.7.1.stable.official.a13da4feb` from official Windows archive SHA-256 `c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1` and are unchanged in this repair.

The prior exact-double artifact `cat-paw-air-hockey-ffaa71fb1d0d` is superseded by the requested settings and contact-puck work. Earlier score-cat FAIL results remain bound to their exact files and do not transfer.

## Phone checks

1. Open the packed game in portrait. Confirm all puck, paw, and goal size controls initially read 125%, while puck speed, both paw speeds, and both return speeds initially read 75%.
2. Confirm every size slider reaches 25% and 200%. Confirm each speed slider remains 70–130%.
3. In both mirrored settings halves, drag the dedicated vertical scroll slider from top to bottom. Confirm only that player's panel scrolls and Close settings remains visible at both ends.
4. Set the puck to 200% and one goal to 25%. Confirm the goal control and summary show a strong warning, then confirm Close settings still works and play is not blocked.
5. Reset to Normal. During ordinary play, strike the puck with each paw. Confirm the puck adopts the last hitter's cream/teal or lavender/coral cat palette, visibly squash/pops, and the contacting paw recoils.
6. Enable Reduced motion. Confirm the hitter palette still changes but the puck and paw do not squash, stretch, or recoil.
7. Recheck simultaneous two-player touch, third-touch rejection, both scoring directions, fullscreen, pause/resume, final-score capture, rematch, portrait containment, landscape gate, performance, and heat.

Report `PASS` or `FAIL`, the two tested SHA-256 values, device model, Android version, Chrome version, and any screenshot/video. A FAIL remains a Cat Paw repair with a new artifact identity. A PASS authorizes only the already-planned local PASS commit and subsequent isolated SFHS extraction; it does not authorize a Cat Paw push or deployment.
