---
{"schema":"sfhs.one-shot-acceptance@1","status":"VERIFIED","facts":{"physicalDevice":"UNTESTED"}}
---
# Acceptance Criteria

- Central interaction: simultaneous opposite-end pointer ownership, independent release, cancellation, lost capture, resize mapping, and third-touch rejection.
- Highest-risk mechanic: fixed-step paw/puck and wall/post collision with exact-once goals.
- Portrait usability: primary shared-phone presentation; landscape pauses behind the rotate guide and restores safely.
- Artifact/evidence: real pinned-SFHS inspect, validate, check, pack, verify, and packed-artifact browser evidence pass.
- Semantic scenario: ready hold, countdown, goal reset, first-to-five winner, and two-player rematch.
- Required visual evidence: packed-artifact boot/play/landscape gate, one WebGL canvas, zero unexpected runtime requests.
- Required-before-completion tests: input, physics, match flow, audio, orientation, lifecycle/browser smoke, pack and exact verify.
- Rapier acceptance: dynamic CCD puck, position-based kinematic paws, visible fixed rails/posts, exact-once goals, finite stable state, and retained player constraints/settings.
- Physical gate: compare normal, hard, glancing, bank, and post shots plus rapid and simultaneous two-player control against accepted build `cat-paw-air-hockey-06998a9ce8bc` for several uninterrupted minutes.

All automated requirements are verified for CATPAW-RAPIER-001. Physical Samsung acceptance remains untested and is required before completion.
- Physical result: the user reported PASS for the exact PUCK-PAW-GODOT-001 preview and packed artifact; missing formal device/browser/thermal metadata remains explicit rather than inferred.
- Publication condition: a normal canonical-branch change runs the durable quality and Pages workflows; Pages serves only verified packed HTML whose downloaded SHA-256 matches the recorded canonical artifact.
- Physical-device condition: Samsung acceptance remains separate and artifact-bound; it is not implied by publication.
- R3 controls: exactly four shared buttons remain at the center side edges in the locked Mute/Pause/Menu/Fullscreen arrangement; winner Capture replaces only Pause; both defensive goal zones remain free.
- R3 mechanics: the deterministic logical Board is 540×1200 with rink bounds 0/540/54/1146, symmetric full-depth halves, and uniform contain scaling on every device.
- R3 Board: the full static Board maps to an exact 1080×2400 PNG slot; valid local art persists and resets, invalid replacements preserve the prior Board, and a legacy 1080×1920 record is retained but never stretched.
- Settings: normal sizes are 200% with 25–200% ranges; normal speeds are 100% with 70–130% ranges. Both mirrored halves retain an always-visible Close button and one thin native scrollbar, with no duplicate outer scroll control. Incompatible puck/goal combinations warn clearly but remain closable.
- R3 goals: mechanical bounds and visible couch NineSlices resize independently from 25% to 200%, with readable contrasting frames and outlined GOAL labels.
- R3 renderer proof: Board replacement reuses one persistent Pixi sprite in the sole WebGL canvas, does not mutate simulation/viewport/goals/controls, and makes no runtime network request.
- Score cats: both sprites use the tracked 4 x 4 Godot sheets at an exact double-size 160 x 160 logical display size, fixed `(40,72)` source anchors, nearest sampling, and a complete P2 rotation of pi without changing the separate 54 px scores.
- Score-cat reactions: both scoring directions, conceded assignment, final-goal transition, winner/defeated poses, rematch, pause/resume, reduced motion, and six-tick idle blinking follow the pure presentation resolver.
- Score-cat physical gate: preview and packed artifact identities in `docs/expansion/SCORE-CAT-GODOT-001-PHYSICAL-TEST-SEED.md` require an artifact-bound Samsung verdict before framework extraction.
- Gameplay actors: the default paws and puck use tracked, deterministic Godot 4.7.1 RGBA sheets with eight ordered cells (idle plus seven contact frames), matching cross-palette alpha masks, nearest sampling, and metadata/validation hashes.
- Contact presentation: an authoritative paw hit assigns the hitter's score-cat palette to the puck and synchronizes seven contact frames on the touching paw and puck over 0.64 seconds. Collision normal and strength affect presentation only; reduced motion holds frame 0 while preserving palette identity.
- Theme compatibility: a valid custom paw or puck cell keeps the legacy static-cell renderer and receives the same bounded transform fallback without requiring new theme schema or save data.
- Gameplay-actor physical gate: **REPORTED PASS** for the exact preview, packed artifact, manifest identities, and Godot version in `docs/expansion/PUCK-PAW-GODOT-001-PHYSICAL-TEST-SEED.md`.
