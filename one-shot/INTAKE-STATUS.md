---
{"schema":"sfhs.one-shot-intake@1","status":"VERIFIED","facts":{"adapterIntegration":{"status":"VERIFIED","evidence":["one-shot/canonical-browser.json","src/main.ts","src/physics.ts"]},"physicalDevice":"REPORTED","physicalResult":"REPORTED PASS","physicalEvidence":["one-shot/PHYSICAL-REPORT-CATPAW-RAPIER-001.json"]}}
---
# Intake Status

The committed `src/` tree is the authoritative product source. It imports the real Pixi v8 adapter and Pixi runtime, owns fixed-step renderer-neutral simulation, and requires a WebGL presentation with one primary surface. Historical candidate/archive/recovery material is non-authoritative and retained only through migration records.

The current pin is SFHS `fce070a0a08a9b4e0fbebda75440eaee80bb95a9`, Node 24, pnpm 11.9.0, Pixi 8.19.0, and the tested official Godot 4.7.1 Windows build. It adds only renderer-neutral position-based kinematic-body advancement to `@sfhs/physics-2d`. Canonical browser evidence is retained at `one-shot/canonical-browser.json`; Rapier/WASM is embedded in the single HTML and file-protocol boot makes no external request. The accepted custom-solver Samsung report remains at `one-shot/PHYSICAL-REPORT-PUCK-PAW-GODOT-001.json`. The exact Rapier artifact received a user-reported Samsung PASS for improved responsiveness and no regressions, recorded separately at `one-shot/PHYSICAL-REPORT-CATPAW-RAPIER-001.json`. No remote mutation is authorized.
