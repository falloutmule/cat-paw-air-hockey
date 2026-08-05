import type { SfhsPixiGameRuntime } from "@sfhs/pixi-runtime";
import type { HockeyInput } from "./input.ts";
import type { HockeyGameState } from "./state.ts";

export interface CatHockeyDiagnostics {
  readonly schema: "cat-air-hockey.diagnostics@1";
  snapshot(): unknown;
}

declare global {
  interface Window { __CAT_AIR_HOCKEY__?: CatHockeyDiagnostics; }
}

export function installDiagnostics(options: {
  readonly getRuntime: () => SfhsPixiGameRuntime<HockeyGameState> | undefined;
  readonly input: HockeyInput;
  readonly getAudioStatus: () => string;
  readonly getOrientationGate: () => boolean;
}): () => void {
  const diagnostics: CatHockeyDiagnostics = Object.freeze({
    schema: "cat-air-hockey.diagnostics@1",
    snapshot(): unknown {
      const runtime = options.getRuntime();
      const state = runtime?.getState();
      return Object.freeze({
        schema: "cat-air-hockey.runtime-snapshot@1",
        renderer: runtime?.getDiagnostics() ?? null,
        viewport: runtime?.getViewport() ?? null,
        input: options.input.getDiagnostics(),
        audio: options.getAudioStatus(),
        orientationGateActive: options.getOrientationGate(),
        state: state === undefined ? null : {
          phase: state.phase,
          tick: state.tick,
          scores: state.scores,
          winner: state.winner ?? null,
          activeMatchSettings: state.activeMatchSettings,
          pendingMatchSettings: state.pendingMatchSettings,
          puck: state.puck,
          players: state.players,
          recentEvents: state.events
        }
      });
    }
  });
  window.__CAT_AIR_HOCKEY__ = diagnostics;
  return () => { if (window.__CAT_AIR_HOCKEY__ === diagnostics) delete window.__CAT_AIR_HOCKEY__; };
}
