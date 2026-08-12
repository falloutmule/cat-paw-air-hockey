import type { PlayerId } from "./actions.ts";
import { GOAL_FREEZE_SECONDS, SIMULATION_HZ } from "./constants.ts";
import type { HockeyGameState } from "./state.ts";

export type ScoreCatReaction = "idle" | "goal" | "conceded" | "win" | "defeated";

export interface ScoreCatFrame {
  readonly frame: number;
  readonly reaction: ScoreCatReaction;
}

export type ScoreCatFrames = Readonly<Record<PlayerId, ScoreCatFrame>>;

function sample(age: number, frames: readonly number[], thresholds: readonly number[]): number {
  let selected = frames[0]!;
  for (let index = 0; index < thresholds.length; index += 1) {
    if (age + Number.EPSILON * 8 >= thresholds[index]!) selected = frames[index + 1]!;
  }
  return selected;
}

function idleFrame(tick: number): number {
  return tick % 150 >= 144 ? 1 : 0;
}

function pair(player: PlayerId, playerFrame: ScoreCatFrame, opponentFrame: ScoreCatFrame): ScoreCatFrames {
  return player === 1
    ? Object.freeze({ 1: Object.freeze(playerFrame), 2: Object.freeze(opponentFrame) })
    : Object.freeze({ 1: Object.freeze(opponentFrame), 2: Object.freeze(playerFrame) });
}

function wonFrames(state: Readonly<HockeyGameState>, paused: boolean): ScoreCatFrames | undefined {
  if (state.winner === undefined) return undefined;
  if (state.reducedEffects || paused) return pair(state.winner, { frame: 14, reaction: "win" }, { frame: 15, reaction: "defeated" });
  const winEvent = [...state.events].reverse().find((event) => event.kind === "win" && event.player === state.winner);
  const age = winEvent === undefined ? Number.POSITIVE_INFINITY : Math.max(0, (state.tick - winEvent.tick) / SIMULATION_HZ);
  return pair(state.winner, { frame: sample(age, [9, 10, 11, 12, 13, 14], [0.14, 0.28, 0.46, 0.68, 0.92]), reaction: "win" }, { frame: 15, reaction: "defeated" });
}

function goalFrames(state: Readonly<HockeyGameState>): ScoreCatFrames | undefined {
  const scorer = state.lastScorer ?? [...state.events].reverse().find((event) => event.kind === "goal")?.player;
  if (scorer === undefined) return undefined;
  if (state.reducedEffects) return pair(scorer, { frame: 5, reaction: "goal" }, { frame: 8, reaction: "conceded" });
  const age = Math.max(0, GOAL_FREEZE_SECONDS - state.phaseTimer);
  return pair(
    scorer,
    { frame: sample(age, [2, 3, 4, 5], [0.10, 0.25, 0.52]), reaction: "goal" },
    { frame: sample(age, [6, 7, 8], [0.14, 0.48]), reaction: "conceded" }
  );
}

export function resolveScoreCatFrames(state: Readonly<HockeyGameState>): ScoreCatFrames {
  const paused = state.phase === "paused";
  const effectivePhase = paused ? state.phaseBeforePause : state.phase;
  if (effectivePhase === "won") {
    const result = wonFrames(state, paused);
    if (result !== undefined) return result;
  }
  if (effectivePhase === "goal") {
    const result = goalFrames(state);
    if (result !== undefined) return result;
  }
  const frame = !paused && effectivePhase === "playing" ? idleFrame(state.tick) : 0;
  return Object.freeze({
    1: Object.freeze({ frame, reaction: "idle" as const }),
    2: Object.freeze({ frame, reaction: "idle" as const })
  });
}
