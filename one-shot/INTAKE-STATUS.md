---
{"schema":"sfhs.one-shot-intake@1","status":"VERIFIED","facts":{"adapterIntegration":{"status":"VERIFIED","evidence":["one-shot/canonical-browser.json","src/main.ts"]},"physicalDevice":"REPORTED"}}
---
# Intake Status

The committed `src/` tree is the authoritative product source. It imports the real Pixi v8 adapter and Pixi runtime, owns fixed-step renderer-neutral simulation, and requires a WebGL presentation with one primary surface. Historical candidate/archive/recovery material is non-authoritative and retained only through migration records.

The current pin is SFHS `68ef8f021eea2ab90a57ca6e2f608d8166a39859`, Node 24, pnpm 11.9.0, Pixi 8.19.0. Canonical browser evidence is retained at `one-shot/canonical-browser.json`; physical Samsung evidence is REPORTED, not VERIFIED.
