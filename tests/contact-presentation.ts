import assert from "node:assert/strict";
import { CONTACT_REACTION_SECONDS, resolveContactPresentation } from "../src/contact-presentation.ts";
import { createInitialGameState, type HockeyGameState, type PresentationEvent } from "../src/state.ts";

const pawHit = (id: number, tick: number, player: 1 | 2, strength = 1): PresentationEvent => Object.freeze({ id, tick, kind: "paw-hit", x: 270, y: 600, strength, player });
const state = (overrides: Partial<HockeyGameState> = {}): HockeyGameState => Object.freeze({ ...createInitialGameState(), ...overrides }) as HockeyGameState;
const withHit = (player: 1 | 2, tick = 100, eventTick = 100, strength = 1, reducedEffects = false): HockeyGameState => {
  const initial = createInitialGameState();
  return state({ tick, reducedEffects, puck: Object.freeze({ ...initial.puck, lastHitter: player }), events: Object.freeze([pawHit(1, eventTick, player, strength)]) });
};

const neutral = resolveContactPresentation(state());
assert.equal(neutral.owner, undefined);
assert.equal(neutral.activePlayer, undefined);
assert.equal(neutral.ageSeconds, null);
assert.deepEqual(neutral.puck, { scaleX: 1, scaleY: 1, rotation: 0 });

const player1 = resolveContactPresentation(withHit(1));
assert.equal(player1.owner, 1);
assert.equal(player1.activePlayer, 1);
assert.ok(player1.puck.scaleX > 1 && player1.puck.scaleY < 1);
assert.ok(player1.paws[1].scaleX < 1 && player1.paws[1].scaleY > 1);
assert.deepEqual(player1.paws[2], { scaleX: 1, scaleY: 1, rotation: 0 });
assert.ok(player1.puck.rotation > 0 && player1.paws[1].rotation < 0);

const player2 = resolveContactPresentation(withHit(2));
assert.equal(player2.owner, 2);
assert.equal(player2.activePlayer, 2);
assert.deepEqual(player2.paws[1], { scaleX: 1, scaleY: 1, rotation: 0 });
assert.ok(player2.puck.rotation < 0 && player2.paws[2].rotation > 0);

const rebound = resolveContactPresentation(withHit(1, 105));
assert.ok(rebound.puck.scaleX < 1 && rebound.puck.scaleY > 1);
assert.ok(rebound.paws[1].scaleX > 1 && rebound.paws[1].scaleY < 1);

const settled = resolveContactPresentation(withHit(1, 100 + Math.ceil(CONTACT_REACTION_SECONDS * 60) + 1));
assert.equal(settled.owner, 1, "ownership palette persists after the transform settles");
assert.equal(settled.activePlayer, undefined);
assert.deepEqual(settled.puck, { scaleX: 1, scaleY: 1, rotation: 0 });
assert.deepEqual(settled.paws, { 1: { scaleX: 1, scaleY: 1, rotation: 0 }, 2: { scaleX: 1, scaleY: 1, rotation: 0 } });

const reduced = resolveContactPresentation(withHit(2, 100, 100, 1, true));
assert.equal(reduced.owner, 2);
assert.equal(reduced.activePlayer, undefined);
assert.deepEqual(reduced.puck, { scaleX: 1, scaleY: 1, rotation: 0 });

const weak = resolveContactPresentation(withHit(1, 100, 100, 0.1));
assert.ok(weak.puck.scaleX > 1 && weak.puck.scaleX < player1.puck.scaleX);

const initial = createInitialGameState();
const repeated = state({ tick: 205, puck: Object.freeze({ ...initial.puck, lastHitter: 2 }), events: Object.freeze([pawHit(1, 180, 1), pawHit(2, 205, 2)]) });
assert.equal(resolveContactPresentation(repeated).activePlayer, 2, "the newest contact restarts the reaction");

console.log(JSON.stringify({ schema: "cat-paw.contact-presentation-tests@1", passed: true, cases: 18 }, null, 2));
