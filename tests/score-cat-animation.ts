import assert from "node:assert/strict";
import { GOAL_FREEZE_SECONDS } from "../src/constants.ts";
import { resolveScoreCatFrames } from "../src/score-cat-animation.ts";
import { createInitialGameState, type HockeyGameState, type MatchPhase, type PresentationEvent } from "../src/state.ts";

function state(overrides: Partial<HockeyGameState> & { phase?: MatchPhase } = {}): HockeyGameState {
  return Object.freeze({ ...createInitialGameState(), ...overrides }) as HockeyGameState;
}

function winEvent(tick: number, player: 1 | 2): PresentationEvent {
  return Object.freeze({ id: 1, tick, kind: "win", player, x: 270, y: 600, strength: 1 });
}

assert.deepEqual(resolveScoreCatFrames(state({ phase: "playing", tick: 143 })), { 1: { frame: 0, reaction: "idle" }, 2: { frame: 0, reaction: "idle" } });
assert.deepEqual(resolveScoreCatFrames(state({ phase: "playing", tick: 144 })), { 1: { frame: 1, reaction: "idle" }, 2: { frame: 1, reaction: "idle" } });
assert.equal(resolveScoreCatFrames(state({ phase: "playing", tick: 149 }))[1].frame, 1);
assert.equal(resolveScoreCatFrames(state({ phase: "playing", tick: 150 }))[1].frame, 0);

for (const [age, scorerFrame, concededFrame] of [[0, 2, 6], [0.22, 3, 6], [0.28, 3, 7], [0.50, 4, 7], [0.76, 4, 8], [0.86, 5, 8]] as const) {
  const frames = resolveScoreCatFrames(state({ phase: "goal", phaseTimer: GOAL_FREEZE_SECONDS - age, lastScorer: 1 }));
  assert.deepEqual(frames, { 1: { frame: scorerFrame, reaction: "goal" }, 2: { frame: concededFrame, reaction: "conceded" } });
}
for (const [age, scorerFrame, concededFrame] of [[0.21, 2, 6], [0.27, 3, 6], [0.49, 3, 7], [0.75, 4, 7], [0.85, 4, 8]] as const) {
  const frames = resolveScoreCatFrames(state({ phase: "goal", phaseTimer: GOAL_FREEZE_SECONDS - age, lastScorer: 1 }));
  assert.equal(frames[1].frame, scorerFrame);
  assert.equal(frames[2].frame, concededFrame);
}

const opposite = resolveScoreCatFrames(state({ phase: "goal", phaseTimer: GOAL_FREEZE_SECONDS - 0.50, lastScorer: 2 }));
assert.deepEqual(opposite, { 1: { frame: 7, reaction: "conceded" }, 2: { frame: 4, reaction: "goal" } });

const finalGoal = resolveScoreCatFrames(state({ phase: "goal", phaseTimer: GOAL_FREEZE_SECONDS, lastScorer: 1, winner: 1 }));
assert.equal(finalGoal[1].frame, 2);
assert.equal(finalGoal[2].frame, 6);

for (const [ageTicks, winnerFrame] of [[0, 9], [17, 10], [38, 11], [60, 12], [87, 13], [117, 14]] as const) {
  const frames = resolveScoreCatFrames(state({ phase: "won", tick: 100 + ageTicks, winner: 2, events: Object.freeze([winEvent(100, 2)]) }));
  assert.equal(frames[2].frame, winnerFrame);
  assert.deepEqual(frames[1], { frame: 15, reaction: "defeated" });
}
for (const [ageTicks, winnerFrame] of [[16, 9], [37, 10], [59, 11], [86, 12], [116, 13]] as const) {
  const frames = resolveScoreCatFrames(state({ phase: "won", tick: 100 + ageTicks, winner: 1, events: Object.freeze([winEvent(100, 1)]) }));
  assert.equal(frames[1].frame, winnerFrame);
}

const pausedGoal = state({ phase: "paused", phaseBeforePause: "goal", phaseTimer: GOAL_FREEZE_SECONDS - 0.50, lastScorer: 1 });
assert.equal(resolveScoreCatFrames(pausedGoal)[1].frame, 4);
assert.equal(resolveScoreCatFrames(pausedGoal)[2].frame, 7);
assert.equal(resolveScoreCatFrames(state({ ...pausedGoal, phase: "goal", phaseBeforePause: undefined }))[1].frame, 4);

const pausedWin = resolveScoreCatFrames(state({ phase: "paused", phaseBeforePause: "won", winner: 1 }));
assert.deepEqual(pausedWin, { 1: { frame: 14, reaction: "win" }, 2: { frame: 15, reaction: "defeated" } });

const reducedGoal = resolveScoreCatFrames(state({ phase: "goal", phaseTimer: GOAL_FREEZE_SECONDS, lastScorer: 2, reducedEffects: true }));
assert.deepEqual(reducedGoal, { 1: { frame: 8, reaction: "conceded" }, 2: { frame: 5, reaction: "goal" } });
const reducedWin = resolveScoreCatFrames(state({ phase: "won", winner: 2, reducedEffects: true }));
assert.deepEqual(reducedWin, { 1: { frame: 15, reaction: "defeated" }, 2: { frame: 14, reaction: "win" } });

assert.equal(resolveScoreCatFrames(state({ phase: "countdown", tick: 144 }))[1].frame, 0);
assert.equal(resolveScoreCatFrames(state({ phase: "paused", phaseBeforePause: "playing", tick: 144 }))[1].frame, 0);
assert.equal(resolveScoreCatFrames(state({ phase: "countdown", tick: 0 }))[1].frame, 0);

const rematch = resolveScoreCatFrames(state({ phase: "countdown", winner: undefined, lastScorer: undefined, scores: Object.freeze({ 1: 0, 2: 0 }) }));
assert.deepEqual(rematch, { 1: { frame: 0, reaction: "idle" }, 2: { frame: 0, reaction: "idle" } });

console.log(JSON.stringify({ schema: "cat-paw.score-cat-animation-tests@1", passed: true, cases: 34 }, null, 2));
