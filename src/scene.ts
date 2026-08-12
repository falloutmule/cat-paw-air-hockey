import type { SfhsGameScene, SfhsViewportState } from "@sfhs/pixi-runtime";
import type { HockeyActionSnapshot } from "./actions.ts";
import { createHockeySimulation, withReducedEffects, type CreatePhysicsWorld, type HockeyPhysicsDiagnostics } from "./physics.ts";
import { createInitialGameState, type HockeyGameState } from "./state.ts";

export interface CatHockeyScene extends SfhsGameScene<HockeyGameState, HockeyActionSnapshot, HockeyGameState> {
  setReducedEffects(value: boolean): void;
  getPhysicsDiagnostics(): HockeyPhysicsDiagnostics;
}

export async function createCatHockeyScene(createWorld: CreatePhysicsWorld): Promise<CatHockeyScene> {
  let reducedEffects = false;
  const simulation = await createHockeySimulation(createWorld);
  return {
    mount: createInitialGameState,
    enter(state): HockeyGameState { return withReducedEffects(state, reducedEffects); },
    update(state, action, seconds): HockeyGameState {
      const next = simulation.stepGame(state, action, seconds);
      return next.reducedEffects === reducedEffects ? next : withReducedEffects(next, reducedEffects);
    },
    snapshot(state): Readonly<HockeyGameState> { return state; },
    pause(): void {},
    resume(): void {},
    exit(): void {},
    resize(_state: HockeyGameState, _viewport: SfhsViewportState): void {},
    destroy(): void { simulation.destroy(); },
    setReducedEffects(value): void { reducedEffects = value; },
    getPhysicsDiagnostics(): HockeyPhysicsDiagnostics { return simulation.getDiagnostics(); }
  };
}
