# Game Specification

## Product

Cat Paw Air Hockey is a local two-player air-hockey game for one shared phone. It is designed for players sitting at opposite ends of a portrait device: each uses one finger to move a cat-paw striker in their legal half and tries to score a yarn-ball puck through the opposite goal.

## Platforms and presentation

- Primary target: Samsung Galaxy S21 Ultra, stable Android Chrome.
- Secondary target: desktop Chromium.
- Portrait-first 540×960 fixed-contain logical rink; landscape pauses play behind a rotate-to-portrait guide.
- WebGL-capable browser required. The game has one Pixi v8 WebGL canvas and no Canvas fallback.
- Safe-area and visual-viewport changes clear active touch ownership before input resumes.

## Match flow and controls

Both players hold their ready paw to start. A shared countdown begins once both are ready. During play each player drags a single finger inside their half of the rink; player 2 uses the top half and player 1 the bottom. The game rejects a third touch, clears on release/cancel/lost capture, resets after a goal, ends at five, and requires both players to hold again for a rematch.

Each goal says `GOAL`. Sound and Pause are on one goal side; Settings and Fullscreen are on the other, mirrored for the opposite player. The final-score image control is available only at the end of a match.

## Simulation

The renderer observes serializable simulation state; input produces semantic actions and SFHS owns the 60 Hz fixed-step loop. Paws and puck collide with walls, posts, and goals. Global puck speed and player paw speed are adjustable. Each player also has a 70–130% return-speed multiplier applied once to that player's discrete paw hit; wall/post contacts do not reapply it. Settings changed during active motion apply at the next safe serve boundary.

## Accessibility, audio, persistence, and content

Accessible text explains shared-device placement and interaction. Reduced effects retains game-state information. Procedural Web Audio unlocks only after an intentional user gesture; mute and background recovery are supported. Local storage persists valid gameplay settings, reduced-motion preference, and an optional local PNG theme; malformed settings fall back safely. Final score capture uses the existing primary Pixi surface.

The default art direction is a cat-themed rink with cat-paw strikers, a circular yarn puck, cat goals, and persistent impact effects. Optional user-loaded PNG themes stay local and do not add runtime requests.

## Non-goals and open decisions

Not implemented: network play, AI opponent, progression, unlocks, shops, achievements, or additional game modes. Physical Samsung acceptance for the current exact artifact is unresolved; it is not an automated-browser substitute.
