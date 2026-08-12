---
{"schema":"sfhs.one-shot-intake@1","status":"VERIFIED","facts":{"adapterIntegration":{"status":"VERIFIED","evidence":["one-shot/canonical-browser.json","src/main.ts"]},"physicalDevice":"UNTESTED"}}
---
# Intake Status

The committed `src/` tree is the authoritative product source. It imports the real Pixi v8 adapter and Pixi runtime, owns fixed-step renderer-neutral simulation, and requires a WebGL presentation with one primary surface. Historical candidate/archive/recovery material is non-authoritative and retained only through migration records.

The current pin is merged SFHS `37aa056b6bd0948d73fcd99c1aba558861f0037e`, Node 24, pnpm 11.9.0, Pixi 8.19.0, and the tested official Godot 4.7.1 Windows build. Canonical browser evidence is retained at `one-shot/canonical-browser.json`; the Godot-authored score cats, default paws, and contact puck remain presentation inside the same sole WebGL canvas. Samsung reported PASS for build `cat-paw-air-hockey-59c8fe2815c1`; that result remains bound to its exact bytes. PUCK-PAW-GODOT-001 changes visible contact animation and therefore requires a new artifact-bound Samsung verdict. No Cat Paw remote mutation is authorized.
