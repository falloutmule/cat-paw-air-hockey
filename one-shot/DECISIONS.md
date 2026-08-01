# Cat Paw Air Hockey — Decision Record

## D-001 — Primary orientation

- **Decision:** Portrait, 540 × 960 logical viewport, fixed-contain.
- **Evidence:** `evidence/orientation-comparison.json` compares 412 × 915 portrait against 915 × 412 landscape.
- **Reason:** Portrait uses the phone's long axis between opposing players. In the modelled S21-class viewport it provides about 248 px of legal half-depth versus about 139 px in landscape, leaves more center clearance, and presents a wider goal. Landscape receives a friendly rotate-device gate rather than a weakened secondary layout.
- **Physical status:** UNTESTED on the exact Samsung Galaxy S21 Ultra.

## D-002 — Finger-to-striker offset

- **Decision:** 0 logical pixels.
- **Reason:** The paw remains physically attached to the finger. Its broad, high-contrast silhouette is intended to remain readable without an artificial offset.
- **Physical status:** Finger occlusion remains UNTESTED.

## D-003 — Match rules

- **Target score:** First to 5.
- **Ready hold:** 0.62 seconds for each player.
- **Countdown:** 3.15 seconds.
- **Post-goal freeze:** 1.05 seconds.
- **Rematch:** Both players hold their ready areas after the win; scores reset immediately into another countdown.

## D-004 — Physics constants

- **Authoritative rate:** 60 Hz fixed step.
- **Puck radius:** 23 logical pixels.
- **Striker radius:** 45 logical pixels.
- **Puck speed cap:** 1,900 logical pixels/second.
- **Striker movement cap:** 2,650 logical pixels/second.
- **Transferred striker impulse cap:** 2,250 logical pixels/second.
- **Wall restitution:** 0.94.
- **Striker restitution:** 1.04.
- **Puck damping:** 0.56 retained per second.
- **Fast-motion protection:** Up to 10 bounded physics substeps per authoritative tick.
- **Reason:** These values preserve rapid swipes and hard contact while bounding tunnelling, touch jumps, and numerical instability.

## D-005 — Reduced effects

- **Default:** Follows `prefers-reduced-motion` when available; either player can toggle it from their edge.
- **Reduced behavior:** Removes the velocity trail, reduces confetti density and cat celebration movement, and disables screen shake.
- **Preserved information:** Puck, paws, goals, scores, ready rings, countdown, contact rings, goal result, and win result remain visible.

## D-006 — Art and audio

- **Art:** Procedural Pixi `Graphics` and persistent `Text`; no external image/font dependency.
- **Audio:** One procedural Web Audio context unlocked by intentional touch. Impact volume/timbre scales with collision strength. No music.
- **Reason:** Keeps the game self-contained and makes impact feedback causal without masking play.

## D-007 — Fallback candidate boundary

- **Decision:** Provide `candidate/index.unverified.html` because canonical SFHS tooling is blocked, while preserving `dist/` as absent.
- **Labels:** `CANDIDATE_BUILT`, `SFHS_PACK_NOT_RUN`, `SFHS_VERIFY_NOT_RUN`, `INTAKE_REQUIRED` are embedded in the HTML.
- **Runtime:** PixiJS 8.19.0 was bundled from the uploaded upstream source for this candidate only. Source continues to import the real `@sfhs/adapter-pixi-v8` and `@sfhs/pixi-runtime` packages.
- **Evidence:** Candidate Chromium WebGL2 screening passed for boot, one canvas, audio unlock, simultaneous pointer ownership, ready/countdown, one goal, pause/resume, and orientation round-trip with zero requests and zero errors.
- **Boundary:** The candidate is not canonical, not exact-verified, not `SFHS_NATIVE`, and must not be placed in `dist/` or renamed to the canonical deliverable.
