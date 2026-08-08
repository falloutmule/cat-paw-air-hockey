import assert from "node:assert/strict";
import { EMPTY_ACTION_SNAPSHOT, type HockeyActionSnapshot, type PlayerId } from "../src/actions.ts";
import { BOARD, CENTER_EXCLUSION, FIXED_STEP_SECONDS, LOGICAL_CENTER, LOGICAL_HEIGHT, LOGICAL_WIDTH, PLAYER_HOME, PUCK_RADIUS, PUCK_SPEED_CAP, READY_TARGET, RINK, STRIKER_RADIUS } from "../src/constants.ts";
import { stepGame } from "../src/physics.ts";
import { goalBounds, normalizeMatchSettings, type MatchSettings } from "../src/settings.ts";
import { createInitialGameState, type HockeyGameState } from "../src/state.ts";

function playing(settings: MatchSettings = normalizeMatchSettings(undefined)): HockeyGameState {
  return { ...createInitialGameState(), phase: "playing", activeMatchSettings: settings, pendingMatchSettings: settings } as HockeyGameState;
}

function targetAction(player1: Readonly<{ x: number; y: number }>, player2: Readonly<{ x: number; y: number }>): HockeyActionSnapshot {
  const action = (player: PlayerId, target: Readonly<{ x: number; y: number }>) => Object.freeze({ held: true, started: false, released: false, cancelled: false, pointerId: player, target, moveX: 0, moveY: 0 });
  return Object.freeze({ players: Object.freeze({ 1: action(1, player1), 2: action(2, player2) }), pausePressed: false });
}

function withPuck(state: HockeyGameState, x: number, y: number, vx: number, vy: number): HockeyGameState {
  return { ...state, puck: { ...state.puck, position: { x, y }, previousPosition: { x, y }, velocity: { x: vx, y: vy }, trail: [{ x, y }] } } as HockeyGameState;
}

function step(state: HockeyGameState, action: HockeyActionSnapshot = EMPTY_ACTION_SNAPSHOT, count = 1): HockeyGameState {
  let next = state;
  for (let index = 0; index < count; index += 1) next = stepGame(next, action, FIXED_STEP_SECONDS);
  return next;
}

assert.deepEqual({ width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT, center: LOGICAL_CENTER }, { width: 540, height: 1200, center: { x: 270, y: 600 } });
assert.deepEqual(RINK, { left: 0, right: 540, top: 54, bottom: 1146, centerY: 600, goalLeft: 178, goalRight: 362, goalDepth: 38, postRadius: 17 });
assert.deepEqual(BOARD, { x: 0, y: 0, width: 540, height: 1200, bitmapScale: 2, bitmapWidth: 1080, bitmapHeight: 2400 });
assert.deepEqual(PLAYER_HOME, { 1: { x: 270, y: 1014 }, 2: { x: 270, y: 186 } });
assert.deepEqual(READY_TARGET, { 1: { x: 270, y: 1028 }, 2: { x: 270, y: 172 } });
assert.deepEqual({ rinkWidthBefore: 456, rinkWidthAfter: RINK.right - RINK.left, pawCenterBefore: 366, pawCenterAfter: RINK.right - RINK.left - STRIKER_RADIUS * 2 }, { rinkWidthBefore: 456, rinkWidthAfter: 540, pawCenterBefore: 366, pawCenterAfter: 450 });
assert.deepEqual({ halfBefore: 426, halfAfter: RINK.centerY - RINK.top, legalBefore: 325, legalAfter: RINK.centerY - RINK.top - STRIKER_RADIUS * 2 - CENTER_EXCLUSION }, { halfBefore: 426, halfAfter: 546, legalBefore: 325, legalAfter: 445 });

let deep = playing();
deep = step(deep, targetAction({ x: -10_000, y: 10_000 }, { x: 10_000, y: -10_000 }), 120);
assert.ok(Math.abs(deep.players[1].position.x - STRIKER_RADIUS) < 0.01);
assert.ok(Math.abs(deep.players[1].position.y - (RINK.bottom - STRIKER_RADIUS)) < 0.01);
assert.ok(Math.abs(deep.players[2].position.x - (RINK.right - STRIKER_RADIUS)) < 0.01);
assert.ok(Math.abs(deep.players[2].position.y - (RINK.top + STRIKER_RADIUS)) < 0.01);

let centerClamp = playing();
centerClamp = step(centerClamp, targetAction({ x: LOGICAL_CENTER.x, y: 0 }, { x: LOGICAL_CENTER.x, y: LOGICAL_HEIGHT }), 120);
assert.ok(centerClamp.players[1].position.y >= RINK.centerY + CENTER_EXCLUSION + STRIKER_RADIUS);
assert.ok(centerClamp.players[2].position.y <= RINK.centerY - CENTER_EXCLUSION - STRIKER_RADIUS);

let wall = withPuck(playing(), RINK.left + PUCK_RADIUS + 1, LOGICAL_CENTER.y, -PUCK_SPEED_CAP, 420);
wall = step(wall, EMPTY_ACTION_SNAPSHOT, 40);
assert.ok(Number.isFinite(wall.puck.position.x) && Number.isFinite(wall.puck.velocity.y));
assert.ok(wall.puck.position.x >= RINK.left + PUCK_RADIUS - 0.1 && wall.puck.position.x <= RINK.right - PUCK_RADIUS + 0.1);

const asymmetric = normalizeMatchSettings({ goalSize: { 1: 75, 2: 125 } });
assert.deepEqual(goalBounds(asymmetric, 1), { left: 201, right: 339 });
assert.deepEqual(goalBounds(asymmetric, 2), { left: 155, right: 385 });

let topScore = withPuck(playing(asymmetric), LOGICAL_CENTER.x, RINK.top + 2, 0, -PUCK_SPEED_CAP);
topScore = step(topScore, EMPTY_ACTION_SNAPSHOT, 12);
assert.equal(topScore.scores[1], 1);
assert.equal(topScore.phase, "goal");
assert.deepEqual(topScore.puck.position, LOGICAL_CENTER);

let bottomScore = withPuck(playing(asymmetric), LOGICAL_CENTER.x, RINK.bottom - 2, 0, PUCK_SPEED_CAP);
bottomScore = step(bottomScore, EMPTY_ACTION_SNAPSHOT, 12);
assert.equal(bottomScore.scores[2], 1);
assert.equal(bottomScore.phase, "goal");

for (const [y, direction] of [[RINK.top, -1], [RINK.bottom, 1]] as const) {
  const goal = y === RINK.top ? goalBounds(asymmetric, 2) : goalBounds(asymmetric, 1);
  const postImpact = step(withPuck(playing(asymmetric), goal.left + 2, y - direction * 44, -480, direction * 1_600), EMPTY_ACTION_SNAPSHOT, 20);
  assert.ok(Number.isFinite(postImpact.puck.position.x) && Number.isFinite(postImpact.puck.velocity.y));
  assert.ok(postImpact.phase === "playing" || postImpact.phase === "goal");
}

console.log(JSON.stringify({ schema: "cat-air-hockey.tall-board@1", passed: true, checks: 22 }, null, 2));
