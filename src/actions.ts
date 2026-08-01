export type PlayerId = 1 | 2;

export interface LogicalPoint {
  readonly x: number;
  readonly y: number;
}

export interface PlayerAction {
  readonly held: boolean;
  readonly started: boolean;
  readonly released: boolean;
  readonly cancelled: boolean;
  readonly pointerId?: number;
  readonly target?: LogicalPoint;
  readonly moveX: number;
  readonly moveY: number;
}

export interface HockeyActionSnapshot {
  readonly players: Readonly<Record<PlayerId, PlayerAction>>;
  readonly pausePressed: boolean;
}

export const EMPTY_PLAYER_ACTION: PlayerAction = Object.freeze({
  held: false,
  started: false,
  released: false,
  cancelled: false,
  moveX: 0,
  moveY: 0
});

export const EMPTY_ACTION_SNAPSHOT: HockeyActionSnapshot = Object.freeze({
  players: Object.freeze({ 1: EMPTY_PLAYER_ACTION, 2: EMPTY_PLAYER_ACTION }),
  pausePressed: false
});
