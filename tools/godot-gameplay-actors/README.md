# Gameplay actor source

This Godot 4.7.1 project is the canonical editable source for the default paw and puck sprite sheets. The two descriptor exports are renderer-neutral and use `@sfhs/godot-animation` from SFHS commit `37aa056b6bd0948d73fcd99c1aba558861f0037e`.

```powershell
pnpm gameplay-actors:build -- --godot-executable <Godot_v4.7.1-stable_win64_console.exe>
```

The command expects an ignored `.sfhs-godot-animation-workflow` checkout at the repository root unless `--sfhs-root` or `SFHS_ROOT` is supplied. Run twice on the same verified Windows environment; the second run must report every sheet as `verified`.
