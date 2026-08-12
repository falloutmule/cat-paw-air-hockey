import assert from "node:assert/strict";
import { EMPTY_ACTION_SNAPSHOT } from "../src/actions.ts";
import { FIXED_STEP_SECONDS, PUCK_DAMPING_PER_SECOND, RINK, WALL_RESTITUTION } from "../src/constants.ts";
import { stepGame } from "../src/physics.ts";
import { DEFAULT_MATCH_SETTINGS, normalizeMatchSettings, returnSpeedCap } from "../src/settings.ts";
import { createInitialGameState, type HockeyGameState } from "../src/state.ts";

function playing(settings = DEFAULT_MATCH_SETTINGS): HockeyGameState {
  return { ...createInitialGameState(), phase: "playing", activeMatchSettings: settings, pendingMatchSettings: settings } as HockeyGameState;
}
function puck(state: HockeyGameState, x: number, y: number, vx: number, vy: number, lastHitter?: 1 | 2): HockeyGameState {
  return { ...state, puck: { ...state.puck, position: { x, y }, previousPosition: { x, y }, velocity: { x: vx, y: vy }, trail: [{ x, y }], ...(lastHitter === undefined ? {} : { lastHitter }) } } as HockeyGameState;
}
function striker(state: HockeyGameState, player: 1 | 2, x: number, y: number): HockeyGameState {
  return { ...state, players: { ...state.players, [player]: { ...state.players[player], position: { x, y }, previousPosition: { x, y } } } } as HockeyGameState;
}
function step(state: HockeyGameState, count = 1): HockeyGameState { let next = state; for (let index = 0; index < count; index += 1) next = stepGame(next, EMPTY_ACTION_SNAPSHOT, FIXED_STEP_SECONDS); return next; }
const speed = (state: HockeyGameState): number => Math.hypot(state.puck.velocity.x, state.puck.velocity.y);

const oldExpansion = normalizeMatchSettings({ puckSpeed: 125, pawSpeed: { 1: 70, 2: 130 }, puckSize: 110, pawSize: { 1: 75, 2: 125 }, goalSize: { 1: 125, 2: 75 } });
assert.deepEqual(oldExpansion.returnSpeed, { 1: 100, 2: 100 });
const independent = normalizeMatchSettings({ ...oldExpansion, returnSpeed: { 1: 70, 2: 130 } });
assert.equal(independent.returnSpeed[1], 70);
assert.equal(independent.returnSpeed[2], 130);
assert.equal(normalizeMatchSettings({ returnSpeed: { 1: Number.NaN, 2: 999 } }).returnSpeed[1], 100);
assert.equal(normalizeMatchSettings({ returnSpeed: { 1: Number.NaN, 2: 999 } }).returnSpeed[2], 130);

function hitByPlayer1(returnSpeed: number): HockeyGameState {
  const settings = normalizeMatchSettings({ returnSpeed: { 1: returnSpeed, 2: 100 } });
  return step(puck(striker(playing(settings), 1, 270, 700), 270, 632, 0, 900));
}
const defaultReturn = hitByPlayer1(100);
const gentleReturn = hitByPlayer1(70);
const fastReturn = hitByPlayer1(130);
assert.equal(defaultReturn.puck.lastHitter, 1);
assert.ok(defaultReturn.puck.velocity.y < 0);
assert.ok(speed(gentleReturn) < speed(defaultReturn) * 0.72);
assert.ok(speed(fastReturn) > speed(defaultReturn) * 1.25);

const afterFirstHit = hitByPlayer1(70);
const separating = step(puck(afterFirstHit, afterFirstHit.puck.position.x, afterFirstHit.puck.position.y, afterFirstHit.puck.velocity.x, afterFirstHit.puck.velocity.y, 1), 4);
const expectedDamping = speed(afterFirstHit) * Math.pow(PUCK_DAMPING_PER_SECOND, FIXED_STEP_SECONDS * 4);
assert.ok(Math.abs(speed(separating) - expectedDamping) < 3, "separating overlap is damped normally and not multiplied again");

const wallSettings = normalizeMatchSettings({ returnSpeed: { 1: 70, 2: 100 } });
const wall = step(puck(playing(wallSettings), RINK.left + 24, 420, -1_000, 0, 1));
assert.ok(wall.puck.velocity.x > 900 * WALL_RESTITUTION, "wall restitution does not reapply the return multiplier");
assert.ok(Number.isFinite(speed(wall)));

const transferSettings = normalizeMatchSettings({ returnSpeed: { 1: 70, 2: 130 } });
const transferStart = puck(striker(playing(transferSettings), 2, 270, 260), 270, 328, 0, -900, 1);
const transferred = step(transferStart);
assert.equal(transferred.puck.lastHitter, 2);
assert.ok(transferred.puck.velocity.y > 0);
assert.ok(speed(transferred) <= returnSpeedCap(transferSettings, 2) + 0.01);

const serveSettings = normalizeMatchSettings({ puckSpeed: 130, returnSpeed: { 1: 70, 2: 130 } });
const served = step({ ...playing(serveSettings), phase: "countdown", phaseTimer: FIXED_STEP_SECONDS / 2 } as HockeyGameState);
assert.equal(served.phase, "playing");
assert.equal(served.puck.lastHitter, undefined);
assert.ok(speed(served) < returnSpeedCap(serveSettings, 2), "serve uses shared puck speed only");

let maximum = puck(striker(playing(normalizeMatchSettings({ puckSpeed: 130, pawSpeed: { 1: 130, 2: 130 }, returnSpeed: { 1: 130, 2: 130 }, puckSize: 75, goalSize: { 1: 75, 2: 125 } })), 1, 270, 700), 270, 632, 0, 2_200);
maximum = step(maximum, 30);
assert.ok(Number.isFinite(maximum.puck.position.x) && Number.isFinite(maximum.puck.velocity.y));
assert.ok(speed(maximum) <= returnSpeedCap(maximum.activeMatchSettings, maximum.puck.lastHitter ?? 1) + 0.01);

console.log(JSON.stringify({ schema: "cat-air-hockey.return-speed@1", passed: true, checks: 16 }, null, 2));
