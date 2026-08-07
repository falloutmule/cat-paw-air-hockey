export const LOGICAL_WIDTH = 540;
export const LOGICAL_HEIGHT = 960;
export const SIMULATION_HZ = 60;
export const FIXED_STEP_SECONDS = 1 / SIMULATION_HZ;
export const MAXIMUM_FRAME_DELTA_MS = 250;

export const RINK = Object.freeze({
  left: 42,
  right: 498,
  top: 54,
  bottom: 906,
  centerY: 480,
  goalLeft: 178,
  goalRight: 362,
  goalDepth: 38,
  postRadius: 17
});

export const STRIKER_RADIUS = 45;
export const PUCK_RADIUS = 23;
export const STRIKER_MAX_SPEED = 2_650;
export const STRIKER_IMPULSE_SPEED_CAP = 2_250;
export const PUCK_SPEED_CAP = 1_900;
export const PUCK_DAMPING_PER_SECOND = 0.56;
export const WALL_RESTITUTION = 0.94;
export const STRIKER_RESTITUTION = 1.04;
export const MAX_PHYSICS_SUBSTEPS = 10;
export const TARGET_SCORE = 5;
export const READY_HOLD_SECONDS = 0.62;
export const GOAL_FREEZE_SECONDS = 1.05;
export const COUNTDOWN_SECONDS = 3.15;
export const CENTER_EXCLUSION = 11;
export const FINGER_OFFSET = 0;

export const BOARD = Object.freeze({
  x: 0,
  y: 0,
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  bitmapScale: 2,
  bitmapWidth: LOGICAL_WIDTH * 2,
  bitmapHeight: LOGICAL_HEIGHT * 2
});

export const PLAYER_HOME = Object.freeze({
  1: Object.freeze({ x: LOGICAL_WIDTH / 2, y: RINK.bottom - 132 }),
  2: Object.freeze({ x: LOGICAL_WIDTH / 2, y: RINK.top + 132 })
});

export const READY_TARGET = Object.freeze({
  1: Object.freeze({ x: LOGICAL_WIDTH / 2, y: RINK.bottom - 118 }),
  2: Object.freeze({ x: LOGICAL_WIDTH / 2, y: RINK.top + 118 })
});
export const READY_TARGET_RADIUS = 92;
