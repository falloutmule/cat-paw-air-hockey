# Architecture

The authoritative editable inputs are `src/`, `tests/`, `public/`, `sfhs.project.json`, and `one-shot/`. The source imports the real SFHS Pixi v8 adapter and runtime. It has one semantic flow: input → actions → fixed-step simulation → presentation. State is renderer-neutral and serializable; rendering observes state and does not alter gameplay.

`src/input.ts` owns pointer acquisition and cleanup. `src/scene.ts`, `src/state.ts`, and `src/physics.ts` own match state and rules. `src/presentation.ts` renders the sole Pixi WebGL surface, including noninteractive effects. `src/audio.ts` owns gesture-gated procedural audio. `src/main.ts` binds lifecycle, viewport, menu, fullscreen, persistence, and the presentation/runtime lifecycle.

The SFHS project manifest declares a 540×960 fixed-contain logical viewport, capped DPR, 60 Hz simulation, required WebGL, all-inline assets, and no runtime external URLs. `one-shot/SFHS-PIN.json` fixes the toolchain to SFHS `5acd8fc9a24834d9416a6e615bb78b8012962e30`; disposable materializations are build environments, not source authority.

The SFHS packer alone creates ignored `dist/index.html`. GitHub Pages receives only that verified file and `.nojekyll` from the deployment workflow; it never receives source, node modules, test output, or evidence bundles.
