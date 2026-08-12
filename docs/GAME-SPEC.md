# Game Specification

## Product

Cat Paw Air Hockey is a local two-player air-hockey game for one shared phone. It is designed for players sitting at opposite ends of a portrait device: each uses one finger to move a cat-paw striker in their legal half and tries to score a yarn-ball puck through the opposite goal.

## Platforms and presentation

- Primary target: Samsung Galaxy S21 Ultra, stable Android Chrome.
- Secondary target: desktop Chromium.
- Portrait-first 540×1200 (9:20) fixed-contain logical rink; landscape pauses play behind a rotate-to-portrait guide.
- WebGL-capable browser required. The game has one Pixi v8 WebGL canvas and no Canvas fallback.
- Safe-area and visual-viewport changes clear active touch ownership before input resumes.

## Match flow and controls

Both players hold their ready paw to start. A shared countdown begins once both are ready. During play each player drags a single finger inside their half of the rink; player 2 uses the top half and player 1 the bottom. The playfield walls are the logical side edges at x=0 and x=540, while striker and puck radii provide center clearance. The game rejects a third touch, clears on release/cancel/lost capture, resets after a goal, ends at five, and requires both players to hold again for a rematch.

Each goal says `GOAL`. Exactly four shared controls straddle the center side edges: Mute upper-left, Pause lower-left, Menu upper-right, and Fullscreen lower-right. When the match is won, Capture replaces Pause in the same lower-left position until rematch. Both defensive goal zones remain pure play space.

## Simulation

The renderer observes serializable simulation state; input produces semantic actions and SFHS owns the 60 Hz fixed-step loop. Paws and puck collide with walls, posts, and goals. The normal speed settings are 100% and remain adjustable from 70% to 130%. The normal puck, paw, and goal sizes are 200% and remain adjustable from 25% to 200%. Each player has an independent return-speed multiplier applied once to that player's discrete paw hit; wall/post contacts do not reapply it. Settings changed during active motion apply at the next safe serve boundary.

## Accessibility, audio, persistence, and content

Accessible text explains shared-device placement and interaction. Reduced effects retains game-state information. Procedural Web Audio unlocks only after an intentional user gesture; mute and background recovery are supported. Local storage persists valid gameplay settings, reduced-motion preference, the independent 1080×2400 Board PNG, and the legacy optional local theme; malformed or missing records fall back safely. A saved 1080×1920 R2 Board is retained but marked incompatible, and the new default Board is shown until replacement. Final score capture uses the existing primary Pixi surface.

The default art direction is a cute pixel-art cat rink with cat-paw strikers, a circular yarn puck, couch goals, and persistent impact effects. The yarn puck adopts the last hitter's score-cat palette; authoritative paw contact drives a presentation-only squash/pop and paw recoil. Reduced motion keeps the palette ownership but suppresses those transforms. The under-couch opening is the scoring mouth. The static full-surface Board is a replaceable rectangular bitmap below the dynamic goals, cats, paws, puck, HUD, and effects. The procedural Board remains a safe fallback; all user artwork stays local and adds no runtime requests.

## Non-goals and open decisions

Not implemented: network play, AI opponent, progression, unlocks, shops, achievements, or additional game modes. Physical Samsung acceptance for the current exact artifact is unresolved; it is not an automated-browser substitute.
