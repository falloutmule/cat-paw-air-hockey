import { createPhysics2DWorld } from "@sfhs/physics-2d";
import { createHockeySimulation, type HockeySimulation } from "../src/physics.ts";

export async function createRapierTestSimulation(): Promise<HockeySimulation> {
  return createHockeySimulation(createPhysics2DWorld);
}
