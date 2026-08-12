# CATPAW-RAPIER-001 Candidate

CATPAW-RAPIER-001 is an automated-verification PASS and a physical-device candidate. It is not a completed or accepted upgrade until the exact packed artifact receives a Samsung verdict.

## Physics boundary

- Rapier 2D owns puck, paw, rail, and post rigid-body motion and contact.
- The puck is a zero-gravity dynamic circle with CCD, damping, restitution, and a product speed cap.
- Paws are speed-limited position-based kinematic circles, preserving direct simultaneous touch and legal player halves while transferring meaningful velocity.
- Rails and posts are fixed colliders aligned to the visible rink. Exact-once goal crossing, settings, match flow, event semantics, and impossible escape recovery remain product-owned.
- The accepted custom solver is absent from tracked production source. Its exact source/artifact is retained only in ignored A/B evidence and Git history.

## Automated evidence

The source and materialized suites cover 23 Rapier physics scenarios plus input, match flow, settings, return speed, audio, controls, tall-board geometry, actor animation, browser semantics, exact-file offline boot, pack, and exact verify. A temporary A/B harness confirms that straight and shallow rebounds preserve the accepted speed envelope, glancing motion remains useful, stationary paws reflect, moving paws add energy, and maximum speed remains capped.

The canonical browser snapshot reports backend `rapier2d`, 13 bodies, no page or console errors, and no runtime request outside the one-file artifact. The accepted custom-solver Samsung PASS remains separate historical evidence.

## Samsung gate

Test `test-results/CATPAW-RAPIER-001/phone/index.html` on the accepted Samsung device. Exercise normal, hard, glancing, bank, and post shots; rapid reversals; blocks; simultaneous two-player input; repeated goals; and several uninterrupted minutes. Report PASS only if the candidate feels better than, or at minimum clearly physically stronger than, build `cat-paw-air-hockey-06998a9ce8bc` without responsiveness, stability, heat, startup, or control regressions.
