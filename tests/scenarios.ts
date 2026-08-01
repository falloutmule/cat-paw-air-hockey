import assert from "node:assert/strict";
import { EMPTY_ACTION_SNAPSHOT, type HockeyActionSnapshot } from "../src/actions.ts";
import { FIXED_STEP_SECONDS, PUCK_SPEED_CAP, RINK, STRIKER_RADIUS } from "../src/constants.ts";
import { canAcquirePointer, classifyPointerStart } from "../src/input.ts";
import { stepGame } from "../src/physics.ts";
import { createInitialGameState, type HockeyGameState } from "../src/state.ts";

function mutablePlaying(): HockeyGameState {
  return { ...createInitialGameState(), phase: "playing" } as HockeyGameState;
}

function withPuck(state: HockeyGameState, x: number, y: number, vx: number, vy: number): HockeyGameState {
  return { ...state, puck: { ...state.puck, position: { x, y }, previousPosition: { x, y }, velocity: { x: vx, y: vy }, trail: [{ x, y }] } } as HockeyGameState;
}

function withStriker(state: HockeyGameState, player: 1 | 2, x: number, y: number): HockeyGameState {
  return { ...state, players: { ...state.players, [player]: { ...state.players[player], position: { x, y }, previousPosition: { x, y } } } } as HockeyGameState;
}

function step(state: HockeyGameState, action: HockeyActionSnapshot = EMPTY_ACTION_SNAPSHOT, count = 1): HockeyGameState {
  let result = state;
  for (let i = 0; i < count; i += 1) result = stepGame(result, action, FIXED_STEP_SECONDS);
  return result;
}

const results: Array<{ name: string; pass: boolean; details?: string }> = [];
function scenario(name: string, run: () => void): void {
  try { run(); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, details: error instanceof Error ? error.stack : String(error) }); }
}

scenario("pointer starts are split by rink half", () => {
  assert.equal(classifyPointerStart({ x: 270, y: 100 }), 2);
  assert.equal(classifyPointerStart({ x: 270, y: 900 }), 1);
});
scenario("simultaneous pointers own separate players", () => {
  assert.equal(canAcquirePointer({ 1: undefined, 2: undefined }, 11, 1), true);
  assert.equal(canAcquirePointer({ 1: 11, 2: undefined }, 22, 2), true);
});
scenario("third pointer cannot steal an occupied player", () => {
  assert.equal(canAcquirePointer({ 1: 11, 2: 22 }, 33, 1), false);
  assert.equal(canAcquirePointer({ 1: 11, 2: 22 }, 33, 2), false);
});
scenario("one pointer cannot own both players", () => {
  assert.equal(canAcquirePointer({ 1: 11, 2: undefined }, 11, 2), false);
});
scenario("direct wall impact reflects", () => {
  const state = withPuck(mutablePlaying(), RINK.left + 24, 400, -800, 0);
  const next = step(state);
  assert.ok(next.puck.velocity.x > 0);
  assert.ok(next.puck.position.x >= RINK.left + 22.9);
});
scenario("shallow wall impact preserves tangential motion", () => {
  const state = withPuck(mutablePlaying(), RINK.left + 24, 400, -700, 260);
  const next = step(state);
  assert.ok(next.puck.velocity.x > 0);
  assert.ok(next.puck.velocity.y > 150);
});
scenario("high-speed wall impact does not tunnel", () => {
  const state = withPuck(mutablePlaying(), 150, 400, -PUCK_SPEED_CAP, 0);
  const next = step(state, EMPTY_ACTION_SNAPSHOT, 8);
  assert.ok(next.puck.position.x >= RINK.left + 22.9);
  assert.ok(next.puck.position.x <= RINK.right - 22.9);
});
scenario("stationary striker impact reflects puck", () => {
  let state = mutablePlaying();
  state = withStriker(state, 1, 270, 700);
  state = withPuck(state, 270, 620, 0, 900);
  const next = step(state, EMPTY_ACTION_SNAPSHOT, 4);
  assert.ok(next.puck.velocity.y < 0);
});
scenario("fast moving striker transfers more energy", () => {
  let state = mutablePlaying();
  state = withStriker(state, 1, 170, 720);
  state = withPuck(state, 270, 720, 0, 0);
  const action: HockeyActionSnapshot = Object.freeze({
    players: Object.freeze({
      1: Object.freeze({ held: true, started: false, released: false, cancelled: false, pointerId: 1, target: { x: 290, y: 720 }, moveX: 0, moveY: 0 }),
      2: EMPTY_ACTION_SNAPSHOT.players[2]
    }),
    pausePressed: false
  });
  const next = step(state, action, 3);
  assert.ok(Math.abs(next.puck.velocity.x) > 150);
  assert.ok(Math.hypot(next.puck.velocity.x, next.puck.velocity.y) <= PUCK_SPEED_CAP + 0.01);
});
scenario("simultaneous wall and striker contact remains finite", () => {
  let state = mutablePlaying();
  state = withStriker(state, 1, RINK.left + STRIKER_RADIUS, 700);
  state = withPuck(state, RINK.left + 24, 640, -800, 900);
  const next = step(state, EMPTY_ACTION_SNAPSHOT, 12);
  assert.ok(Number.isFinite(next.puck.position.x));
  assert.ok(Number.isFinite(next.puck.velocity.y));
  assert.ok(Math.hypot(next.puck.velocity.x, next.puck.velocity.y) <= PUCK_SPEED_CAP + 0.01);
});
scenario("goal-post corner impact stays in rink system", () => {
  const state = withPuck(mutablePlaying(), RINK.goalLeft + 2, RINK.top + 70, -380, -1_600);
  const next = step(state, EMPTY_ACTION_SNAPSHOT, 20);
  assert.ok(Number.isFinite(next.puck.position.x));
  assert.ok(next.phase === "playing" || next.phase === "goal");
});
scenario("high-speed goal counts exactly once", () => {
  let state = withPuck(mutablePlaying(), 270, 120, 0, -PUCK_SPEED_CAP);
  state = step(state, EMPTY_ACTION_SNAPSHOT, 8);
  assert.equal(state.phase, "goal");
  assert.equal(state.scores[1], 1);
  state = step(state, EMPTY_ACTION_SNAPSHOT, 30);
  assert.equal(state.scores[1], 1);
});
scenario("puck starting overlapped is separated", () => {
  let state = mutablePlaying();
  state = withStriker(state, 1, 270, 700);
  state = withPuck(state, 270, 700, 0, 0);
  const next = step(state);
  const distance = Math.hypot(next.puck.position.x - next.players[1].position.x, next.puck.position.y - next.players[1].position.y);
  assert.ok(distance >= STRIKER_RADIUS + 22.8);
});
scenario("extreme pointer target is clamped and finite", () => {
  const action: HockeyActionSnapshot = Object.freeze({
    players: Object.freeze({
      1: Object.freeze({ held: true, started: true, released: false, cancelled: false, pointerId: 1, target: { x: 99_999, y: -99_999 }, moveX: 0, moveY: 0 }),
      2: EMPTY_ACTION_SNAPSHOT.players[2]
    }),
    pausePressed: false
  });
  const next = step(mutablePlaying(), action, 10);
  assert.ok(next.players[1].position.x <= RINK.right - STRIKER_RADIUS);
  assert.ok(next.players[1].position.y >= RINK.centerY + STRIKER_RADIUS);
  assert.ok(Math.hypot(next.players[1].velocity.x, next.players[1].velocity.y) <= 2_251);
});
scenario("corner-rest state does not numerically explode", () => {
  let state = withPuck(mutablePlaying(), RINK.left + 23, RINK.top + 23, 4, -3);
  state = step(state, EMPTY_ACTION_SNAPSHOT, 2_000);
  assert.ok(Number.isFinite(state.puck.position.x));
  assert.ok(Math.hypot(state.puck.velocity.x, state.puck.velocity.y) <= PUCK_SPEED_CAP + 0.01);
});
scenario("long-running repeated strikes remain stable", () => {
  let state = mutablePlaying();
  for (let tick = 0; tick < 12_000; tick += 1) {
    const p1x = 270 + Math.sin(tick * 0.07) * 150;
    const p2x = 270 + Math.cos(tick * 0.061) * 150;
    const action: HockeyActionSnapshot = Object.freeze({
      players: Object.freeze({
        1: Object.freeze({ held: true, started: false, released: false, cancelled: false, pointerId: 1, target: { x: p1x, y: 640 + Math.sin(tick * 0.11) * 100 }, moveX: 0, moveY: 0 }),
        2: Object.freeze({ held: true, started: false, released: false, cancelled: false, pointerId: 2, target: { x: p2x, y: 320 + Math.cos(tick * 0.09) * 100 }, moveX: 0, moveY: 0 })
      }),
      pausePressed: false
    });
    state = stepGame(state, action, FIXED_STEP_SECONDS);
    if (state.phase === "goal") state = { ...state, phase: "playing", phaseTimer: 0, puck: { ...state.puck, velocity: { x: 330, y: tick % 2 ? 570 : -570 } } } as HockeyGameState;
    assert.ok(Number.isFinite(state.puck.position.x));
    assert.ok(Math.hypot(state.puck.velocity.x, state.puck.velocity.y) <= PUCK_SPEED_CAP + 0.01);
  }
});

const failed = results.filter((result) => !result.pass);
console.log(JSON.stringify({ schema: "cat-air-hockey.focused-scenarios@1", total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length > 0) process.exitCode = 1;
