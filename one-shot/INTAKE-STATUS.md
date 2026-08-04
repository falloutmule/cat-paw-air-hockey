---
{"schema":"sfhs.one-shot-intake@1","status":"VERIFIED","facts":{"adapterIntegration":{"status":"VERIFIED","evidence":["one-shot/canonical-browser.json","src/main.ts"]},"physicalDevice":"UNTESTED"}}
---
# Intake Status

The committed `src/` tree is the authoritative product source. It imports the real Pixi v8 adapter and Pixi runtime, owns fixed-step renderer-neutral simulation, and requires a WebGL presentation with one primary surface. Historical candidate/archive/recovery material is non-authoritative and retained only through migration records.

The current pin is SFHS `5acd8fc9a24834d9416a6e615bb78b8012962e30`, Node 24, pnpm 11.9.0, Pixi 8.19.0. Canonical browser evidence is retained at `one-shot/canonical-browser.json`; physical Samsung evidence is historical REPORTED evidence, while the current artifact is UNTESTED.
