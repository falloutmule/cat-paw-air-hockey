---
{"schema":"sfhs.one-shot-intake@1","status":"VERIFIED","facts":{"adapterIntegration":{"status":"VERIFIED","evidence":["one-shot/canonical-browser.json","src/main.ts"]},"physicalDevice":"REPORTED PASS"}}
---
# Intake Status

The committed `src/` tree is the authoritative product source. It imports the real Pixi v8 adapter and Pixi runtime, owns fixed-step renderer-neutral simulation, and requires a WebGL presentation with one primary surface. Historical candidate/archive/recovery material is non-authoritative and retained only through migration records.

The current pin is merged SFHS `37aa056b6bd0948d73fcd99c1aba558861f0037e`, Node 24, pnpm 11.9.0, Pixi 8.19.0, and the tested official Godot 4.7.1 Windows build. Canonical browser evidence is retained at `one-shot/canonical-browser.json`; the Godot-authored score cats, default paws, and contact puck remain presentation inside the same sole WebGL canvas. On 2026-08-12 the user reported PASS for exact PUCK-PAW-GODOT-001 build `cat-paw-air-hockey-06998a9ce8bc`; the report is retained at `one-shot/PHYSICAL-REPORT-PUCK-PAW-GODOT-001.json`. No Cat Paw remote mutation is authorized.
