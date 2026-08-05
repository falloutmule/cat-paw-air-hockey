import type { PlayerId } from "./actions.ts";
import { PLAYER_HOME, TARGET_SCORE } from "./constants.ts";
import { DEFAULT_MATCH_SETTINGS, type MatchSettings } from "./settings.ts";

export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export type MatchPhase = "ready" | "countdown" | "playing" | "goal" | "won" | "paused";
export type EventKind = "ready" | "countdown" | "paw-hit" | "wall-hit" | "goal" | "win" | "pause" | "resume";

export interface PresentationEvent {
  readonly id: number;
  readonly tick: number;
  readonly kind: EventKind;
  readonly x: number;
  readonly y: number;
  readonly strength: number;
  readonly player?: PlayerId;
}

export interface StrikerState {
  readonly position: Vector2;
  readonly previousPosition: Vector2;
  readonly velocity: Vector2;
  readonly readyProgress: number;
  readonly ready: boolean;
}

export interface PuckState {
  readonly position: Vector2;
  readonly previousPosition: Vector2;
  readonly velocity: Vector2;
  readonly trail: readonly Vector2[];
}

export interface SoundCooldowns {
  readonly wall: number;
  readonly player1: number;
  readonly player2: number;
}

export interface HockeyGameState {
  readonly phase: MatchPhase;
  readonly phaseBeforePause?: Exclude<MatchPhase, "paused">;
  readonly tick: number;
  readonly elapsedSeconds: number;
  readonly phaseTimer: number;
  readonly scores: Readonly<Record<PlayerId, number>>;
  readonly targetScore: number;
  readonly winner?: PlayerId;
  readonly lastScorer?: PlayerId;
  readonly serveNumber: number;
  readonly players: Readonly<Record<PlayerId, StrikerState>>;
  readonly puck: PuckState;
  readonly events: readonly PresentationEvent[];
  readonly nextEventId: number;
  readonly soundCooldowns: SoundCooldowns;
  readonly reducedEffects: boolean;
  readonly activeMatchSettings: MatchSettings;
  readonly pendingMatchSettings: MatchSettings;
}

function striker(player: PlayerId): StrikerState {
  const home = PLAYER_HOME[player];
  return Object.freeze({
    position: Object.freeze({ ...home }),
    previousPosition: Object.freeze({ ...home }),
    velocity: Object.freeze({ x: 0, y: 0 }),
    readyProgress: 0,
    ready: false
  });
}

export function createInitialGameState(): HockeyGameState {
  const center = Object.freeze({ x: 270, y: 480 });
  return Object.freeze({
    phase: "ready",
    tick: 0,
    elapsedSeconds: 0,
    phaseTimer: 0,
    scores: Object.freeze({ 1: 0, 2: 0 }),
    targetScore: TARGET_SCORE,
    serveNumber: 0,
    players: Object.freeze({ 1: striker(1), 2: striker(2) }),
    puck: Object.freeze({
      position: center,
      previousPosition: center,
      velocity: Object.freeze({ x: 0, y: 0 }),
      trail: Object.freeze([center])
    }),
    events: Object.freeze([]),
    nextEventId: 1,
    soundCooldowns: Object.freeze({ wall: 0, player1: 0, player2: 0 }),
    reducedEffects: false,
    activeMatchSettings: DEFAULT_MATCH_SETTINGS,
    pendingMatchSettings: DEFAULT_MATCH_SETTINGS
  });
}
