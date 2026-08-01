import type { SfhsGameScene, SfhsViewportState } from "@sfhs/pixi-runtime";
import type { HockeyActionSnapshot } from "./actions.ts";
import { stepGame, withReducedEffects } from "./physics.ts";
import { createInitialGameState, type HockeyGameState } from "./state.ts";

export interface CatHockeyScene extends SfhsGameScene<HockeyGameState, HockeyActionSnapshot, HockeyGameState> {
  setReducedEffects(value: boolean): void;
}

export function createCatHockeyScene(): CatHockeyScene {
  let reducedEffects = false;
  return {
    mount: createInitialGameState,
    enter(state): HockeyGameState { return withReducedEffects(state, reducedEffects); },
    update(state, action, seconds): HockeyGameState {
      const next = stepGame(state, action, seconds);
      return next.reducedEffects === reducedEffects ? next : withReducedEffects(next, reducedEffects);
    },
    snapshot(state): Readonly<HockeyGameState> { return state; },
    pause(): void {},
    resume(): void {},
    exit(): void {},
    resize(_state: HockeyGameState, _viewport: SfhsViewportState): void {},
    destroy(): void {},
    setReducedEffects(value): void { reducedEffects = value; }
  };
}
