import type { HockeyActionSnapshot, PlayerAction, PlayerId } from "./actions.ts";
import {
  CENTER_EXCLUSION,
  COUNTDOWN_SECONDS,
  GOAL_FREEZE_SECONDS,
  MAX_PHYSICS_SUBSTEPS,
  PLAYER_HOME,
  PUCK_DAMPING_PER_SECOND,
  PUCK_RADIUS,
  PUCK_SPEED_CAP,
  READY_HOLD_SECONDS,
  READY_TARGET,
  READY_TARGET_RADIUS,
  RINK,
  STRIKER_IMPULSE_SPEED_CAP,
  STRIKER_MAX_SPEED,
  STRIKER_RADIUS,
  STRIKER_RESTITUTION,
  WALL_RESTITUTION
} from "./constants.ts";
import { goalBounds, normalizeMatchSettings, puckRadius, puckSpeedCap, returnSpeedCap, strikerImpulseCap, strikerRadius, strikerSpeedCap, type MatchSettings } from "./settings.ts";
import type {
  HockeyGameState,
  MatchPhase,
  PresentationEvent,
  SoundCooldowns,
  StrikerState,
  Vector2
} from "./state.ts";

interface MutableVector { x: number; y: number }
interface MutableStriker { position: MutableVector; previousPosition: MutableVector; velocity: MutableVector; readyProgress: number; ready: boolean }
interface MutablePuck { position: MutableVector; previousPosition: MutableVector; velocity: MutableVector; trail: Vector2[]; lastHitter?: PlayerId }
interface MutableContext {
  events: PresentationEvent[];
  nextEventId: number;
  cooldowns: { wall: number; player1: number; player2: number };
  tick: number;
}

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));
const length = (vector: MutableVector): number => Math.hypot(vector.x, vector.y);
const dot = (a: MutableVector, b: MutableVector): number => a.x * b.x + a.y * b.y;

function capVelocity(vector: MutableVector, maximum: number): void {
  const speed = length(vector);
  if (speed > maximum && speed > 0) {
    const scale = maximum / speed;
    vector.x *= scale;
    vector.y *= scale;
  }
}

function freezeVector(vector: MutableVector): Vector2 {
  return Object.freeze({ x: vector.x, y: vector.y });
}

function freezeStriker(striker: MutableStriker): StrikerState {
  return Object.freeze({
    position: freezeVector(striker.position),
    previousPosition: freezeVector(striker.previousPosition),
    velocity: freezeVector(striker.velocity),
    readyProgress: striker.readyProgress,
    ready: striker.ready
  });
}

function emit(context: MutableContext, kind: PresentationEvent["kind"], x: number, y: number, strength: number, player?: PlayerId): void {
  context.events.push(Object.freeze({
    id: context.nextEventId++,
    tick: context.tick,
    kind,
    x,
    y,
    strength: clamp(strength, 0, 1),
    ...(player === undefined ? {} : { player })
  }));
}

function legalTarget(player: PlayerId, target: Vector2, settings: MatchSettings): MutableVector {
  const radius = strikerRadius(settings, player);
  const x = clamp(target.x, RINK.left + radius, RINK.right - radius);
  const y = player === 1
    ? clamp(target.y, RINK.centerY + CENTER_EXCLUSION + radius, RINK.bottom - radius)
    : clamp(target.y, RINK.top + radius, RINK.centerY - CENTER_EXCLUSION - radius);
  return { x, y };
}

function moveStriker(previous: StrikerState, action: PlayerAction, player: PlayerId, seconds: number, settings: MatchSettings): MutableStriker {
  const from = { x: previous.position.x, y: previous.position.y };
  let desired = { ...from };
  if (action.target !== undefined && action.held) {
    desired = legalTarget(player, action.target, settings);
  } else if (action.moveX !== 0 || action.moveY !== 0) {
    desired = legalTarget(player, {
      x: from.x + action.moveX * strikerSpeedCap(settings, player) * 0.62 * seconds,
      y: from.y + action.moveY * strikerSpeedCap(settings, player) * 0.62 * seconds
    }, settings);
  }
  const delta = { x: desired.x - from.x, y: desired.y - from.y };
  const distance = length(delta);
  const maximumMove = strikerSpeedCap(settings, player) * seconds;
  if (distance > maximumMove && distance > 0) {
    const scale = maximumMove / distance;
    delta.x *= scale;
    delta.y *= scale;
  }
  const position = legalTarget(player, { x: from.x + delta.x, y: from.y + delta.y }, settings);
  const velocity = { x: (position.x - from.x) / seconds, y: (position.y - from.y) / seconds };
  capVelocity(velocity, strikerImpulseCap(settings, player));
  return {
    position,
    previousPosition: from,
    velocity,
    readyProgress: previous.readyProgress,
    ready: previous.ready
  };
}

function readyIntent(action: PlayerAction, player: PlayerId): boolean {
  if (action.held && action.target !== undefined) {
    const ready = READY_TARGET[player];
    return Math.hypot(action.target.x - ready.x, action.target.y - ready.y) <= READY_TARGET_RADIUS;
  }
  return Math.abs(action.moveX) + Math.abs(action.moveY) > 0;
}

function updateReady(striker: MutableStriker, action: PlayerAction, player: PlayerId, seconds: number, context: MutableContext): void {
  const wasReady = striker.ready;
  if (readyIntent(action, player)) {
    striker.readyProgress = clamp(striker.readyProgress + seconds / READY_HOLD_SECONDS, 0, 1);
  } else {
    striker.readyProgress = clamp(striker.readyProgress - seconds * 2.8, 0, 1);
  }
  striker.ready = striker.readyProgress >= 1;
  if (!wasReady && striker.ready) {
    emit(context, "ready", striker.position.x, striker.position.y, 0.55, player);
  }
}

function resetStriker(player: PlayerId): MutableStriker {
  const home = PLAYER_HOME[player];
  return {
    position: { ...home },
    previousPosition: { ...home },
    velocity: { x: 0, y: 0 },
    readyProgress: 0,
    ready: false
  };
}

function resetPuck(): MutablePuck {
  return {
    position: { x: 270, y: 480 },
    previousPosition: { x: 270, y: 480 },
    velocity: { x: 0, y: 0 },
    trail: [{ x: 270, y: 480 }]
  };
}

function servePuck(puck: MutablePuck, serveNumber: number, settings: MatchSettings, lastScorer?: PlayerId): void {
  const direction = lastScorer === 1 ? -1 : lastScorer === 2 ? 1 : serveNumber % 2 === 0 ? -1 : 1;
  const lateral = ((serveNumber * 97) % 211 - 105) / 105;
  const scale = settings.puckSpeed / 100;
  puck.velocity.x = lateral * 185 * scale;
  puck.velocity.y = direction * 410 * scale;
}

function impactEvent(context: MutableContext, key: "wall" | "player1" | "player2", kind: "wall-hit" | "paw-hit", x: number, y: number, speed: number, player?: PlayerId): void {
  if (context.cooldowns[key] > 0 || speed < 42) return;
  context.cooldowns[key] = kind === "wall-hit" ? 0.04 : 0.055;
  emit(context, kind, x, y, clamp((speed - 35) / 1_250, 0.08, 1), player);
}

function resolvePost(puck: MutablePuck, cx: number, cy: number, settings: MatchSettings, context: MutableContext): void {
  const dx = puck.position.x - cx;
  const dy = puck.position.y - cy;
  const minimum = puckRadius(settings) + RINK.postRadius;
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared >= minimum * minimum) return;
  const distance = Math.sqrt(distanceSquared);
  let nx = distance > 0.0001 ? dx / distance : 0;
  let ny = distance > 0.0001 ? dy / distance : (cy < RINK.centerY ? 1 : -1);
  const overlap = minimum - distance;
  puck.position.x += nx * (overlap + 0.02);
  puck.position.y += ny * (overlap + 0.02);
  const normalVelocity = puck.velocity.x * nx + puck.velocity.y * ny;
  if (normalVelocity < 0) {
    const speed = -normalVelocity;
    puck.velocity.x -= (1 + WALL_RESTITUTION) * normalVelocity * nx;
    puck.velocity.y -= (1 + WALL_RESTITUTION) * normalVelocity * ny;
    impactEvent(context, "wall", "wall-hit", puck.position.x, puck.position.y, speed);
  }
}

function resolveStriker(puck: MutablePuck, striker: MutableStriker, interpolated: MutableVector, player: PlayerId, settings: MatchSettings, context: MutableContext): void {
  const dx = puck.position.x - interpolated.x;
  const dy = puck.position.y - interpolated.y;
  const minimum = puckRadius(settings) + strikerRadius(settings, player);
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared >= minimum * minimum) return;
  const distance = Math.sqrt(distanceSquared);
  let nx: number;
  let ny: number;
  if (distance > 0.0001) {
    nx = dx / distance;
    ny = dy / distance;
  } else {
    const relative = { x: puck.velocity.x - striker.velocity.x, y: puck.velocity.y - striker.velocity.y };
    const relativeLength = length(relative);
    nx = relativeLength > 0.0001 ? -relative.x / relativeLength : 0;
    ny = relativeLength > 0.0001 ? -relative.y / relativeLength : player === 1 ? -1 : 1;
  }
  const overlap = minimum - distance;
  puck.position.x += nx * (overlap + 0.03);
  puck.position.y += ny * (overlap + 0.03);
  const relativeVelocity = {
    x: puck.velocity.x - striker.velocity.x,
    y: puck.velocity.y - striker.velocity.y
  };
  const normalVelocity = dot(relativeVelocity, { x: nx, y: ny });
  if (normalVelocity < 0) {
    const speed = -normalVelocity;
    puck.velocity.x -= (1 + STRIKER_RESTITUTION) * normalVelocity * nx;
    puck.velocity.y -= (1 + STRIKER_RESTITUTION) * normalVelocity * ny;
    puck.velocity.x *= settings.returnSpeed[player] / 100;
    puck.velocity.y *= settings.returnSpeed[player] / 100;
    puck.lastHitter = player;
    capVelocity(puck.velocity, returnSpeedCap(settings, player));
    impactEvent(context, player === 1 ? "player1" : "player2", "paw-hit", puck.position.x, puck.position.y, speed, player);
  }
}

function resolveWalls(puck: MutablePuck, settings: MatchSettings, context: MutableContext): void {
  const radius = puckRadius(settings);
  const topGoal = goalBounds(settings, 2);
  const bottomGoal = goalBounds(settings, 1);
  if (puck.position.x - radius < RINK.left) {
    puck.position.x = RINK.left + radius;
    if (puck.velocity.x < 0) {
      impactEvent(context, "wall", "wall-hit", puck.position.x, puck.position.y, -puck.velocity.x);
      puck.velocity.x = -puck.velocity.x * WALL_RESTITUTION;
    }
  } else if (puck.position.x + radius > RINK.right) {
    puck.position.x = RINK.right - radius;
    if (puck.velocity.x > 0) {
      impactEvent(context, "wall", "wall-hit", puck.position.x, puck.position.y, puck.velocity.x);
      puck.velocity.x = -puck.velocity.x * WALL_RESTITUTION;
    }
  }

  const topMouth = puck.position.x > topGoal.left && puck.position.x < topGoal.right;
  const bottomMouth = puck.position.x > bottomGoal.left && puck.position.x < bottomGoal.right;
  if (!topMouth && puck.position.y - radius < RINK.top) {
    puck.position.y = RINK.top + radius;
    if (puck.velocity.y < 0) {
      impactEvent(context, "wall", "wall-hit", puck.position.x, puck.position.y, -puck.velocity.y);
      puck.velocity.y = -puck.velocity.y * WALL_RESTITUTION;
    }
  } else if (!bottomMouth && puck.position.y + radius > RINK.bottom) {
    puck.position.y = RINK.bottom - radius;
    if (puck.velocity.y > 0) {
      impactEvent(context, "wall", "wall-hit", puck.position.x, puck.position.y, puck.velocity.y);
      puck.velocity.y = -puck.velocity.y * WALL_RESTITUTION;
    }
  }
}

function advancePuck(puck: MutablePuck, players: Readonly<Record<PlayerId, MutableStriker>>, seconds: number, settings: MatchSettings, context: MutableContext): PlayerId | undefined {
  const travelSpeed = Math.max(length(puck.velocity), length(players[1].velocity), length(players[2].velocity));
  const substeps = clamp(Math.ceil(travelSpeed * seconds / (puckRadius(settings) * 0.42)), 1, MAX_PHYSICS_SUBSTEPS);
  const dt = seconds / substeps;
  for (let index = 0; index < substeps; index += 1) {
    const fraction = (index + 1) / substeps;
    puck.position.x += puck.velocity.x * dt;
    puck.position.y += puck.velocity.y * dt;
    const topGoal = goalBounds(settings, 2);
    const bottomGoal = goalBounds(settings, 1);
    resolveWalls(puck, settings, context);
    resolvePost(puck, topGoal.left, RINK.top, settings, context);
    resolvePost(puck, topGoal.right, RINK.top, settings, context);
    resolvePost(puck, bottomGoal.left, RINK.bottom, settings, context);
    resolvePost(puck, bottomGoal.right, RINK.bottom, settings, context);
    for (const player of [1, 2] as const) {
      const striker = players[player];
      resolveStriker(puck, striker, {
        x: striker.previousPosition.x + (striker.position.x - striker.previousPosition.x) * fraction,
        y: striker.previousPosition.y + (striker.position.y - striker.previousPosition.y) * fraction
      }, player, settings, context);
    }
    resolveWalls(puck, settings, context);
    if (puck.position.y < RINK.top - RINK.goalDepth && puck.position.x > topGoal.left && puck.position.x < topGoal.right) return 1;
    if (puck.position.y > RINK.bottom + RINK.goalDepth && puck.position.x > bottomGoal.left && puck.position.x < bottomGoal.right) return 2;
  }
  const damping = Math.pow(PUCK_DAMPING_PER_SECOND, seconds);
  puck.velocity.x *= damping;
  puck.velocity.y *= damping;
  if (length(puck.velocity) < 6.5) {
    puck.velocity.x = 0;
    puck.velocity.y = 0;
  }
  capVelocity(puck.velocity, puck.lastHitter === undefined ? puckSpeedCap(settings) : returnSpeedCap(settings, puck.lastHitter));
  return undefined;
}

function updateTrail(puck: MutablePuck): void {
  const newest = { x: puck.position.x, y: puck.position.y };
  const trail = [newest, ...puck.trail.slice(0, 8)];
  puck.trail = trail;
}

function countdownBoundary(previous: number, next: number): number | undefined {
  const before = Math.ceil(Math.max(0, previous));
  const after = Math.ceil(Math.max(0, next));
  if (after < before && before >= 1 && before <= 3) return before;
  return undefined;
}

export function stepGame(state: HockeyGameState, action: Readonly<HockeyActionSnapshot>, seconds: number): HockeyGameState {
  const tick = state.tick + 1;
  const context: MutableContext = {
    events: [],
    nextEventId: state.nextEventId,
    tick,
    cooldowns: {
      wall: Math.max(0, state.soundCooldowns.wall - seconds),
      player1: Math.max(0, state.soundCooldowns.player1 - seconds),
      player2: Math.max(0, state.soundCooldowns.player2 - seconds)
    }
  };
  let phase: MatchPhase = state.phase;
  let phaseBeforePause = state.phaseBeforePause;
  let phaseTimer = state.phaseTimer;
  let winner = state.winner;
  let lastScorer = state.lastScorer;
  let serveNumber = state.serveNumber;
  let activeMatchSettings = state.activeMatchSettings;
  let pendingMatchSettings = state.pendingMatchSettings;
  if (action.settingsRequested !== undefined) {
    const requested = normalizeMatchSettings(action.settingsRequested);
    const applyNow = phase === "ready" || phase === "won" || (phase === "paused" && state.phaseBeforePause === "ready");
    pendingMatchSettings = requested;
    if (applyNow) activeMatchSettings = requested;
  }
  let scores = { 1: state.scores[1], 2: state.scores[2] } as Record<PlayerId, number>;
  let players: Record<PlayerId, MutableStriker> = {
    1: moveStriker(state.players[1], action.players[1], 1, seconds, activeMatchSettings),
    2: moveStriker(state.players[2], action.players[2], 2, seconds, activeMatchSettings)
  };
  let puck: MutablePuck = {
    position: { ...state.puck.position },
    previousPosition: { ...state.puck.position },
    velocity: { ...state.puck.velocity },
    trail: state.puck.trail.map((point) => ({ ...point })),
    ...(state.puck.lastHitter === undefined ? {} : { lastHitter: state.puck.lastHitter })
  };

  if (action.pausePressed) {
    if (phase === "paused") {
      phase = phaseBeforePause ?? "ready";
      phaseBeforePause = undefined;
      emit(context, "resume", 270, 480, 0.35);
    } else {
      phaseBeforePause = phase;
      phase = "paused";
      emit(context, "pause", 270, 480, 0.35);
    }
  }

  if (phase === "paused") {
    players[1].velocity = { x: 0, y: 0 };
    players[2].velocity = { x: 0, y: 0 };
  } else if (phase === "ready") {
    updateReady(players[1], action.players[1], 1, seconds, context);
    updateReady(players[2], action.players[2], 2, seconds, context);
    puck = resetPuck();
    if (players[1].ready && players[2].ready) {
      phase = "countdown";
      phaseTimer = COUNTDOWN_SECONDS;
      players = { 1: resetStriker(1), 2: resetStriker(2) };
      emit(context, "countdown", 270, 480, 0.45);
    }
  } else if (phase === "countdown") {
    const previousTimer = phaseTimer;
    phaseTimer = Math.max(0, phaseTimer - seconds);
    const boundary = countdownBoundary(previousTimer, phaseTimer);
    if (boundary !== undefined) emit(context, "countdown", 270, 480, boundary / 3);
    puck = resetPuck();
    if (phaseTimer <= 0) {
      phase = "playing";
      serveNumber += 1;
      servePuck(puck, serveNumber, activeMatchSettings, lastScorer);
    }
  } else if (phase === "playing") {
    const scorer = advancePuck(puck, players, seconds, activeMatchSettings, context);
    updateTrail(puck);
    if (scorer !== undefined) {
      scores = { ...scores, [scorer]: scores[scorer] + 1 };
      lastScorer = scorer;
      winner = scores[scorer] >= state.targetScore ? scorer : undefined;
      phase = "goal";
      phaseTimer = GOAL_FREEZE_SECONDS;
      emit(context, "goal", puck.position.x, puck.position.y, 1, scorer);
      puck = resetPuck();
      players = { 1: resetStriker(1), 2: resetStriker(2) };
    }
  } else if (phase === "goal") {
    phaseTimer = Math.max(0, phaseTimer - seconds);
    puck = resetPuck();
    if (phaseTimer <= 0) {
      if (winner !== undefined) {
        phase = "won";
        emit(context, "win", 270, winner === 1 ? 720 : 240, 1, winner);
      } else {
        activeMatchSettings = pendingMatchSettings;
        phase = "countdown";
        phaseTimer = COUNTDOWN_SECONDS;
      }
    }
  } else if (phase === "won") {
    updateReady(players[1], action.players[1], 1, seconds, context);
    updateReady(players[2], action.players[2], 2, seconds, context);
    puck = resetPuck();
    if (players[1].ready && players[2].ready) {
      activeMatchSettings = pendingMatchSettings;
      scores = { 1: 0, 2: 0 };
      winner = undefined;
      lastScorer = undefined;
      phase = "countdown";
      phaseTimer = COUNTDOWN_SECONDS;
      players = { 1: resetStriker(1), 2: resetStriker(2) };
    }
  }

  return Object.freeze({
    phase,
    ...(phaseBeforePause === undefined ? {} : { phaseBeforePause }),
    tick,
    elapsedSeconds: state.elapsedSeconds + seconds,
    phaseTimer,
    scores: Object.freeze(scores),
    targetScore: state.targetScore,
    ...(winner === undefined ? {} : { winner }),
    ...(lastScorer === undefined ? {} : { lastScorer }),
    serveNumber,
    players: Object.freeze({ 1: freezeStriker(players[1]), 2: freezeStriker(players[2]) }),
    puck: Object.freeze({
      position: freezeVector(puck.position),
      previousPosition: freezeVector(puck.previousPosition),
      velocity: freezeVector(puck.velocity),
      trail: Object.freeze(puck.trail.map((point) => Object.freeze({ ...point }))),
      ...(puck.lastHitter === undefined ? {} : { lastHitter: puck.lastHitter })
    }),
    events: Object.freeze([
      ...state.events.filter((event) => tick - event.tick <= 180),
      ...context.events
    ]),
    nextEventId: context.nextEventId,
    soundCooldowns: Object.freeze(context.cooldowns) as SoundCooldowns,
    reducedEffects: state.reducedEffects,
    activeMatchSettings,
    pendingMatchSettings
  });
}

export function withReducedEffects(state: HockeyGameState, reducedEffects: boolean): HockeyGameState {
  return Object.freeze({ ...state, reducedEffects });
}
