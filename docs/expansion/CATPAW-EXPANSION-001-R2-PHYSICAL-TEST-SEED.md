# CATPAW-EXPANSION-001-R2 Samsung test seed

Status: **UNTESTED**. Bind the session to build `cat-paw-air-hockey-eb95d3516717`, 720,601 bytes, SHA-256 `50663604dfafb35cee2bc457daadd9f7420947b8f36532a93b1b3a952f12f88d`.

On Samsung Galaxy S21 Ultra / stable Android Chrome, record Android and Chrome versions, portrait/landscape viewport and DPR, screenshots, heat/responsiveness, and a **REPORTED PASS** or **REPORTED FAIL** for:

1. Exactly four shared controls are visible and reachable.
2. Center-edge placement does not interfere with normal rallies.
3. Both back halves and adjustable goals remain completely available defensively.
4. Mute, Pause, Menu, and Fullscreen work; Fullscreen remains visible after entry/exit.
5. Return-speed handicaps retain R1 behavior.
6. Download Board Template produces the exact 1080×1920 PNG.
7. A simple exact-size replacement fills the Board rectangle while goals stay aligned above it.
8. Wrong-size/corrupt replacements keep the prior Board; Reset Board restores default.
9. Custom Board survives reload, rematch, fullscreen, and settings changes.
10. Finish a match and confirm Capture replaces Pause only in the winner state.
11. The final score PNG includes the custom Board, goals, actors, score, and handicap summary but not DOM controls/menu.
12. Rematch restores Pause, then background/restore and confirm the Board persists.
13. Confirm no new heat, responsiveness, or touch-ownership regression.
