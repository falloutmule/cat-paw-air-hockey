# Score-cat Godot producer

This project is the canonical editable source for the two Cat Paw score-cat sheets. It is intentionally limited to the officially published Windows portable Godot 4.7.1 stable archive whose SHA-256 is `c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1`.

```powershell
pnpm score-cats:build -- --godot-executable <path-to-Godot_v4.7.1-stable_win64_console.exe>
```

The command validates the executable version, scrubs proxy variables, samples the descriptor in manual animation time, exports both 640 x 640 RGBA sheets, validates their structure and shared alpha masks, writes tracked metadata/validation JSON, and creates the ignored phone preview.

On Windows, Godot 4.7.1 `--headless` selects its Dummy renderer, which cannot read a 2D SubViewport texture. The tested Windows producer therefore runs a hidden 80 x 80 OpenGL compatibility window through Node's `windowsHide` option. It remains noninteractive CLI automation, but it is not described as Dummy-headless rendering. No other Godot version or cross-platform pixel-byte identity is claimed.

Tracked outputs live in `art/score-cats/`. The offline preview is generated at `test-results/SCORE-CAT-GODOT-001/phone/score-cat-preview.html`.
