import assert from "node:assert/strict";
import { CONTACT_FRAME_TIMES, CONTACT_REACTION_SECONDS, resolveContactPresentation } from "../src/contact-presentation.ts";
import { createInitialGameState, type HockeyGameState, type MatchPhase, type PresentationEvent } from "../src/state.ts";

const pawHit = (id: number, tick: number, player: 1 | 2, strength = 1, normal = { x: 0, y: -1 }): PresentationEvent => Object.freeze({ id, tick, kind: "paw-hit", x: 270, y: 600, strength, player, normal: Object.freeze(normal) });
const state = (overrides: Partial<HockeyGameState> = {}): HockeyGameState => Object.freeze({ ...createInitialGameState(), phase: "playing", ...overrides }) as HockeyGameState;
const withHit = (player: 1 | 2, tick = 100, eventTick = 100, strength = 1, reducedEffects = false, phase: MatchPhase = "playing", normal = { x: 0, y: -1 }): HockeyGameState => {
  const initial = createInitialGameState();
  return state({ phase, tick, reducedEffects, puck: Object.freeze({ ...initial.puck, lastHitter: player }), events: Object.freeze([pawHit(1, eventTick, player, strength, normal)]) });
};

const neutral = resolveContactPresentation(state());
assert.equal(neutral.owner, undefined);
assert.equal(neutral.activePlayer, undefined);
assert.equal(neutral.frame, 0);
assert.equal(neutral.ageSeconds, null);
assert.deepEqual(neutral.puckOffset, { x: 0, y: 0 });

const player1 = resolveContactPresentation(withHit(1));
assert.equal(player1.owner, 1);
assert.equal(player1.activePlayer, 1);
assert.equal(player1.eventId, 1);
assert.equal(player1.frame, 1);
assert.ok(player1.puck.scaleX > 1 && player1.puck.scaleY < 1);
assert.ok(player1.paws[1].scaleX < 1 && player1.paws[1].scaleY > 1);
assert.deepEqual(player1.paws[2], { scaleX: 1, scaleY: 1, rotation: 0 });
assert.deepEqual(player1.normal, { x: 0, y: -1 });
assert.ok(player1.puckOffset.y < 0 && player1.pawOffsets[1].y > 0);

const player2 = resolveContactPresentation(withHit(2, 100, 100, 1, false, "playing", { x: 3, y: 4 }));
assert.equal(player2.owner, 2);
assert.equal(player2.activePlayer, 2);
assert.deepEqual(player2.normal, { x: 0.6, y: 0.8 });
assert.deepEqual(player2.paws[1], { scaleX: 1, scaleY: 1, rotation: 0 });
assert.ok(player2.pawOffsets[2].x < 0 && player2.pawOffsets[2].y < 0);

for (const [index, seconds] of CONTACT_FRAME_TIMES.entries()) {
  const sampled = resolveContactPresentation(withHit(1, 600 + Math.ceil(seconds * 60), 600));
  assert.equal(sampled.frame, index + 1, `contact sample ${seconds}s selects authored frame ${index + 1}`);
}

const settled = resolveContactPresentation(withHit(1, 100 + Math.ceil(CONTACT_REACTION_SECONDS * 60) + 1));
assert.equal(settled.owner, 1, "ownership palette persists after the animation settles");
assert.equal(settled.activePlayer, undefined);
assert.equal(settled.frame, 0);
assert.deepEqual(settled.puckOffset, { x: 0, y: 0 });

const reduced = resolveContactPresentation(withHit(2, 100, 100, 1, true));
assert.equal(reduced.owner, 2);
assert.equal(reduced.activePlayer, undefined);
assert.equal(reduced.frame, 0);

for (const phase of ["ready", "countdown", "goal", "won", "paused"] as const) {
  const presentation = resolveContactPresentation(withHit(1, 100, 100, 1, false, phase));
  assert.equal(presentation.frame, 0, `${phase} uses the resting frame`);
  assert.equal(presentation.activePlayer, undefined);
}

const weak = resolveContactPresentation(withHit(1, 100, 100, 0.1));
assert.ok(Math.abs(weak.puckOffset.y) < Math.abs(player1.puckOffset.y));
assert.ok(weak.puck.scaleX > 1 && weak.puck.scaleX < player1.puck.scaleX);

const initial = createInitialGameState();
const repeated = state({ tick: 205, puck: Object.freeze({ ...initial.puck, lastHitter: 2 }), events: Object.freeze([pawHit(1, 180, 1), pawHit(2, 205, 2)]) });
assert.equal(resolveContactPresentation(repeated).activePlayer, 2, "the newest contact restarts the authored reaction");
assert.equal(resolveContactPresentation(repeated).frame, 1);

console.log(JSON.stringify({ schema: "cat-paw.contact-presentation-tests@2", passed: true, cases: 35 }, null, 2));
