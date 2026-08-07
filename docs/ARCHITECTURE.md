# Architecture

The authoritative editable inputs are `src/`, `tests/`, `public/`, `sfhs.project.json`, and `one-shot/`. The source imports the real SFHS Pixi v8 adapter and runtime. It has one semantic flow: input → actions → fixed-step simulation → presentation. State is renderer-neutral and serializable; rendering observes state and does not alter gameplay.

`src/input.ts` owns pointer acquisition and cleanup. `src/scene.ts`, `src/state.ts`, and `src/physics.ts` own match state and rules. `src/presentation.ts` renders the sole Pixi WebGL surface, including one persistent Board sprite below separate dynamic goals/actors/HUD and noninteractive effects. `src/board-art.ts` derives the exact default 1080×1920 template from the 540×960 static layout; the old procedural Board remains underneath as fallback. `src/theme.ts` validates and persists independent Board PNGs without touching simulation. `src/audio.ts` owns gesture-gated procedural audio. `src/main.ts` binds lifecycle, shared center controls, menu, fullscreen, persistence, and the presentation/runtime lifecycle.

The SFHS runtime is the sole viewport owner. `runtime.getViewport()` supplies the current visual-viewport snapshot, fixed-contain transform, and orientation. `src/main.ts` projects that snapshot into the DOM shell and shared-control geometry; `src/input.ts` maps the current primary-canvas rectangle back into the same 540×960 logical space. The settings overlay is bounded to that shell, with two clipped half-viewport containers and independently scrolling inner panels. Board texture pixels never participate in layout.

The SFHS project manifest declares a 540×960 fixed-contain logical viewport, capped DPR, 60 Hz simulation, required WebGL, all-inline assets, and no runtime external URLs. `one-shot/SFHS-PIN.json` fixes the toolchain to SFHS `5acd8fc9a24834d9416a6e615bb78b8012962e30`; disposable materializations are build environments, not source authority.

The SFHS packer alone creates ignored `dist/index.html`. GitHub Pages receives only that verified file and `.nojekyll` from the deployment workflow; it never receives source, node modules, test output, or evidence bundles.
