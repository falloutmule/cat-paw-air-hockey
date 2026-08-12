---
{"schema":"sfhs.one-shot-report@1","status":"VERIFIED","facts":{"artifact":{"classification":"canonical","path":"dist/index.html","bytes":4117623,"sha256":"51b92216c60556d2df9885ba5155bc427da6904b0fc3fc6a89c864e30215f42a","buildId":"cat-paw-air-hockey-06998a9ce8bc","verifier":"sfhs verify","sourceSha256":"06998a9ce8bc8b8cd578018e42b716c3c4b5b017c13626d306aa609eddc5055b"},"sfhsCommit":"37aa056b6bd0948d73fcd99c1aba558861f0037e","renderer":"PIXI WebGL","externalReferences":"none","browserSmoke":"VERIFIED","physicalDevice":"UNTESTED"}}
---
# Verification Report

PUCK-PAW-GODOT-001 replaces the default procedural paws and puck with tracked Godot 4.7.1 sprite sheets. Each authoritative paw hit starts the same seven-frame, 0.64-second contact sequence on the touching paw and puck; the puck adopts the last hitter's palette, collision normal affects presentation only, and reduced motion holds frame 0. Custom themes retain a static-cell transform fallback.

Existing 100% speed defaults, 200% size defaults, mechanics, scoring, persistence, touch ownership, controls, capture, and one-canvas presentation remain unchanged. Repeated exports are byte-identical; source tests, focused animation tests, fresh pinned materialized lint/typecheck, SFHS pack/exact verify, responsive packed Chromium, and the normal-action contact/winner/capture/rematch lane pass. The new exact artifact is **UNTESTED** on Samsung; the prior reported PASS does not transfer to changed visible bytes.
