import assert from "node:assert/strict";
import { EMPTY_ACTION_SNAPSHOT, type HockeyActionSnapshot } from "../src/actions.ts";
import { FIXED_STEP_SECONDS, PUCK_SPEED_CAP, READY_TARGET, RINK, TARGET_SCORE } from "../src/constants.ts";
import { stepGame } from "../src/physics.ts";
import { createInitialGameState, type HockeyGameState } from "../src/state.ts";

function heldReady(): HockeyActionSnapshot {
  return Object.freeze({
    players: Object.freeze({
      1: Object.freeze({ held: true, started: false, released: false, cancelled: false, pointerId: 1, target: READY_TARGET[1], moveX: 0, moveY: 0 }),
      2: Object.freeze({ held: true, started: false, released: false, cancelled: false, pointerId: 2, target: READY_TARGET[2], moveX: 0, moveY: 0 })
    }),
    pausePressed: false
  });
}

function pauseAction(): HockeyActionSnapshot {
  return Object.freeze({ ...EMPTY_ACTION_SNAPSHOT, pausePressed: true });
}

function step(state: HockeyGameState, action: HockeyActionSnapshot = EMPTY_ACTION_SNAPSHOT, count = 1): HockeyGameState {
  let result = state;
  for (let index = 0; index < count; index += 1) result = stepGame(result, action, FIXED_STEP_SECONDS);
  return result;
}

function forcePlayerOneGoal(state: HockeyGameState): HockeyGameState {
  const playing = Object.freeze({
    ...state,
    phase: "playing" as const,
    phaseTimer: 0,
    puck: Object.freeze({
      ...state.puck,
      position: Object.freeze({ x: 270, y: RINK.top + 2 }),
      previousPosition: Object.freeze({ x: 270, y: RINK.top + 2 }),
      velocity: Object.freeze({ x: 0, y: -PUCK_SPEED_CAP }),
      trail: Object.freeze([{ x: 270, y: RINK.top + 2 }])
    })
  });
  let next = playing as HockeyGameState;
  for (let index = 0; index < 12 && next.phase === "playing"; index += 1) next = step(next);
  assert.equal(next.phase, "goal");
  return next;
}

const results: Array<{ name: string; pass: boolean; details?: string }> = [];
function scenario(name: string, run: () => void): void {
  try { run(); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, details: error instanceof Error ? error.stack : String(error) }); }
}

scenario("two-player hold ceremony enters countdown", () => {
  const state = step(createInitialGameState(), heldReady(), 45);
  assert.equal(state.phase, "countdown");
  assert.ok(state.events.some((event) => event.kind === "countdown"));
});

scenario("countdown starts a moving serve", () => {
  let state = step(createInitialGameState(), heldReady(), 45);
  state = step(state, EMPTY_ACTION_SNAPSHOT, 200);
  assert.equal(state.phase, "playing");
  assert.ok(Math.hypot(state.puck.velocity.x, state.puck.velocity.y) > 250);
});

scenario("non-winning goal freezes, resets, and returns to play", () => {
  let state = Object.freeze({ ...createInitialGameState(), phase: "playing" as const }) as HockeyGameState;
  state = forcePlayerOneGoal(state);
  assert.equal(state.scores[1], 1);
  assert.deepEqual(state.puck.position, { x: 270, y: 480 });
  state = step(state, EMPTY_ACTION_SNAPSHOT, 70);
  assert.equal(state.phase, "countdown");
  state = step(state, EMPTY_ACTION_SNAPSHOT, 200);
  assert.equal(state.phase, "playing");
});

scenario("first player to five reaches a clear won state", () => {
  let state = Object.freeze({ ...createInitialGameState(), phase: "playing" as const }) as HockeyGameState;
  for (let goal = 1; goal <= TARGET_SCORE; goal += 1) {
    state = forcePlayerOneGoal(state);
    assert.equal(state.scores[1], goal);
    state = step(state, EMPTY_ACTION_SNAPSHOT, 70);
    if (goal < TARGET_SCORE) {
      assert.equal(state.phase, "countdown");
      state = step(state, EMPTY_ACTION_SNAPSHOT, 200);
      assert.equal(state.phase, "playing");
    }
  }
  assert.equal(state.phase, "won");
  assert.equal(state.winner, 1);
  assert.ok(state.events.some((event) => event.kind === "win"));
});

scenario("both players can immediately ready a score-reset rematch", () => {
  let state = Object.freeze({ ...createInitialGameState(), phase: "playing" as const }) as HockeyGameState;
  for (let goal = 1; goal <= TARGET_SCORE; goal += 1) {
    state = forcePlayerOneGoal(state);
    state = step(state, EMPTY_ACTION_SNAPSHOT, 70);
    if (goal < TARGET_SCORE) state = step(state, EMPTY_ACTION_SNAPSHOT, 200);
  }
  assert.equal(state.phase, "won");
  state = step(state, heldReady(), 45);
  assert.equal(state.phase, "countdown");
  assert.deepEqual(state.scores, { 1: 0, 2: 0 });
  assert.equal(state.winner, undefined);
});

scenario("pause and resume preserve the prior match phase", () => {
  let state = Object.freeze({ ...createInitialGameState(), phase: "playing" as const }) as HockeyGameState;
  state = step(state, pauseAction());
  assert.equal(state.phase, "paused");
  assert.equal(state.phaseBeforePause, "playing");
  state = step(state, pauseAction());
  assert.equal(state.phase, "playing");
  assert.equal(state.phaseBeforePause, undefined);
});

const failed = results.filter((result) => !result.pass);
console.log(JSON.stringify({ schema: "cat-air-hockey.match-flow@1", total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length > 0) process.exitCode = 1;
