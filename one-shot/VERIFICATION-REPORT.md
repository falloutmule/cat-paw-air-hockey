---
{"schema":"sfhs.one-shot-report@1","status":"VERIFIED","facts":{"artifact":{"classification":"canonical","path":"dist/index.html","bytes":5857863,"sha256":"827d1b6d1e3aa8877b206d2be5c89baaea89b5cd04e8643196b394b3f7789b1a","buildId":"cat-paw-air-hockey-b83bd150d75e","verifier":"sfhs verify","sourceSha256":"b83bd150d75e68db243ed39b8d18aee32e6df349e634dc3f672fbd29d757fa1d"},"sfhsCommit":"fce070a0a08a9b4e0fbebda75440eaee80bb95a9","renderer":"PIXI WebGL","physics":"Rapier 2D","externalReferences":"none","browserSmoke":"VERIFIED","physicalDevice":"UNTESTED"}}
---
# Rapier Candidate Verification Report

CATPAW-RAPIER-001 replaces the production collision and motion layer with Rapier 2D while keeping the product-owned fixed-step state, rules, input, match flow, settings, and presentation boundary. The puck is dynamic with CCD; paws are position-based kinematic bodies; visible rails and posts are fixed colliders. Goal crossing and impossible closed-boundary recovery remain explicit Cat Paw rules.

Source tests, 23 focused Rapier scenarios, broader product tests, a classic-solver A/B envelope, fresh pinned materialized lint/typecheck, SFHS pack/exact verify, HTTP browser evidence, and exact-file offline boot pass. The packed artifact makes no external runtime request and reports a 13-body `rapier2d` world. Physical Samsung comparison is **UNTESTED** for this artifact, so the Rapier initiative is not complete.

The accepted custom-solver build `cat-paw-air-hockey-06998a9ce8bc` and its 2026-08-12 reported Samsung PASS remain preserved in `one-shot/PHYSICAL-REPORT-PUCK-PAW-GODOT-001.json`. That result is historical baseline evidence and is not transferred to this candidate.
