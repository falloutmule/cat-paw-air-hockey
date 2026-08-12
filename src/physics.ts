import type { HockeyActionSnapshot, PlayerAction, PlayerId } from "./actions.ts";
import {
  CENTER_EXCLUSION,
  COUNTDOWN_SECONDS,
  FIXED_STEP_SECONDS,
  GOAL_FREEZE_SECONDS,
  LOGICAL_CENTER,
  PLAYER_HOME,
  PUCK_DAMPING_PER_SECOND,
  READY_HOLD_SECONDS,
  READY_TARGET,
  READY_TARGET_RADIUS,
  RINK,
  STRIKER_RESTITUTION,
  WALL_RESTITUTION
} from "./constants.ts";
import {
  goalBounds,
  normalizeMatchSettings,
  puckRadius,
  puckSpeedCap,
  returnSpeedCap,
  strikerImpulseCap,
  strikerRadius,
  strikerSpeedCap,
  type MatchSettings
} from "./settings.ts";
import type {
  HockeyGameState,
  MatchPhase,
  PresentationEvent,
  SoundCooldowns,
  StrikerState,
  Vector2
} from "./state.ts";

interface PhysicsVector { readonly x: number; readonly y: number }
interface PhysicsBodyState {
  readonly id: string;
  readonly position: PhysicsVector;
  readonly linearVelocity: PhysicsVector;
}
interface PhysicsCollisionEvent { readonly bodyA: string; readonly bodyB: string; readonly started: boolean }
interface PhysicsStepResult { readonly collisions: readonly PhysicsCollisionEvent[] }
interface PhysicsWorld {
  readonly backend: "rapier2d";
  createBody(definition: {
    readonly id: string;
    readonly type: "dynamic" | "fixed" | "kinematic-position";
    readonly position: PhysicsVector;
    readonly linearVelocity?: PhysicsVector;
    readonly linearDamping?: number;
    readonly angularDamping?: number;
    readonly ccd?: boolean;
    readonly collider: {
      readonly shape: { readonly kind: "box"; readonly halfWidth: number; readonly halfHeight: number } | { readonly kind: "circle"; readonly radius: number };
      readonly density?: number;
      readonly friction?: number;
      readonly restitution?: number;
      readonly sensor?: boolean;
    };
  }): PhysicsBodyState;
  removeBody(id: string): boolean;
  getBody(id: string): PhysicsBodyState;
  step(): PhysicsStepResult;
  setBodyTransform(id: string, position: PhysicsVector, rotation: number): void;
  setNextKinematicTransform(id: string, position: PhysicsVector, rotation: number): void;
  setBodyVelocity(id: string, linearVelocity: PhysicsVector, angularVelocity?: number): void;
  destroy(): void;
}

export type CreatePhysicsWorld = (options: {
  readonly gravity: PhysicsVector;
  readonly timestepSeconds?: number;
}) => Promise<PhysicsWorld>;

interface MutableVector { x: number; y: number }
interface MutableStriker { position: MutableVector; previousPosition: MutableVector; velocity: MutableVector; readyProgress: number; ready: boolean }
interface MutablePuck { position: MutableVector; previousPosition: MutableVector; velocity: MutableVector; trail: Vector2[]; lastHitter?: PlayerId }
interface MutableContext {
  events: PresentationEvent[];
  nextEventId: number;
  cooldowns: { wall: number; player1: number; player2: number };
  tick: number;
}

export interface HockeyPhysicsDiagnostics {
  readonly backend: "rapier2d";
  readonly bodyCount: number;
  readonly initializationMilliseconds: number;
  readonly steps: number;
  readonly timingMilliseconds: Readonly<{ mean: number; p95: number; worst: number }>;
}

export interface HockeySimulation {
  stepGame(state: HockeyGameState, action: Readonly<HockeyActionSnapshot>, seconds: number): HockeyGameState;
  reset(): void;
  getDiagnostics(): HockeyPhysicsDiagnostics;
  destroy(): void;
}

const SCALE = 100;
const RAIL_THICKNESS = 20;
const PUCK_RESTITUTION = 1;
const WALL_COLLIDER_RESTITUTION = Math.max(0, WALL_RESTITUTION * 2 - PUCK_RESTITUTION);
const PAW_COLLIDER_RESTITUTION = Math.max(0, STRIKER_RESTITUTION * 2 - PUCK_RESTITUTION);
const BODY_IDS = [
  "puck", "paw-1", "paw-2", "rail-left", "rail-right",
  "rail-top-left", "rail-top-right", "rail-bottom-left", "rail-bottom-right",
  "post-top-left", "post-top-right", "post-bottom-left", "post-bottom-right"
] as const;

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));
const length = (vector: MutableVector): number => Math.hypot(vector.x, vector.y);
const toPhysics = (vector: Vector2): PhysicsVector => ({ x: vector.x / SCALE, y: vector.y / SCALE });
const fromPhysics = (vector: PhysicsVector): MutableVector => ({ x: vector.x * SCALE, y: vector.y * SCALE });

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

function emit(context: MutableContext, kind: PresentationEvent["kind"], x: number, y: number, strength: number, player?: PlayerId, normal?: Vector2): void {
  context.events.push(Object.freeze({
    id: context.nextEventId++,
    tick: context.tick,
    kind,
    x,
    y,
    strength: clamp(strength, 0, 1),
    ...(player === undefined ? {} : { player }),
    ...(normal === undefined ? {} : { normal: freezeVector(normal) })
  }));
}

function legalTarget(player: PlayerId, target: Vector2, settings: MatchSettings): MutableVector {
  const radius = strikerRadius(settings, player);
  return {
    x: clamp(target.x, RINK.left + radius, RINK.right - radius),
    y: player === 1
      ? clamp(target.y, RINK.centerY + CENTER_EXCLUSION + radius, RINK.bottom - radius)
      : clamp(target.y, RINK.top + radius, RINK.centerY - CENTER_EXCLUSION - radius)
  };
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
  return { position, previousPosition: from, velocity, readyProgress: previous.readyProgress, ready: previous.ready };
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
  striker.readyProgress = readyIntent(action, player)
    ? clamp(striker.readyProgress + seconds / READY_HOLD_SECONDS, 0, 1)
    : clamp(striker.readyProgress - seconds * 2.8, 0, 1);
  striker.ready = striker.readyProgress >= 1;
  if (!wasReady && striker.ready) emit(context, "ready", striker.position.x, striker.position.y, 0.55, player);
}

function resetStriker(player: PlayerId): MutableStriker {
  const home = PLAYER_HOME[player];
  return { position: { ...home }, previousPosition: { ...home }, velocity: { x: 0, y: 0 }, readyProgress: 0, ready: false };
}

function resetPuck(): MutablePuck {
  return { position: { ...LOGICAL_CENTER }, previousPosition: { ...LOGICAL_CENTER }, velocity: { x: 0, y: 0 }, trail: [{ ...LOGICAL_CENTER }] };
}

function servePuck(puck: MutablePuck, serveNumber: number, settings: MatchSettings, lastScorer?: PlayerId): void {
  const direction = lastScorer === 1 ? -1 : lastScorer === 2 ? 1 : serveNumber % 2 === 0 ? -1 : 1;
  const lateral = ((serveNumber * 97) % 211 - 105) / 105;
  const scale = settings.puckSpeed / 100;
  puck.velocity.x = lateral * 185 * scale;
  puck.velocity.y = direction * 410 * scale;
}

function impactEvent(context: MutableContext, key: "wall" | "player1" | "player2", kind: "wall-hit" | "paw-hit", x: number, y: number, speed: number, player?: PlayerId, normal?: Vector2): void {
  if (context.cooldowns[key] > 0 || speed < 42) return;
  context.cooldowns[key] = kind === "wall-hit" ? 0.04 : 0.055;
  emit(context, kind, x, y, clamp((speed - 35) / 1_250, 0.08, 1), player, normal);
}

function updateTrail(puck: MutablePuck): void {
  puck.trail = [{ x: puck.position.x, y: puck.position.y }, ...puck.trail.slice(0, 8)];
}

function countdownBoundary(previous: number, next: number): number | undefined {
  const before = Math.ceil(Math.max(0, previous));
  const after = Math.ceil(Math.max(0, next));
  return after < before && before >= 1 && before <= 3 ? before : undefined;
}

function settingsKey(settings: MatchSettings): string {
  return [settings.puckSize, settings.pawSize[1], settings.pawSize[2], settings.goalSize[1], settings.goalSize[2]].join(":");
}

function collisionIncludes(event: PhysicsCollisionEvent, id: string): boolean {
  return event.bodyA === id || event.bodyB === id;
}

function otherBody(event: PhysicsCollisionEvent, id: string): string {
  return event.bodyA === id ? event.bodyB : event.bodyA;
}

function wallNormal(bodyId: string, puck: MutableVector, settings: MatchSettings): MutableVector {
  if (bodyId === "rail-left") return { x: 1, y: 0 };
  if (bodyId === "rail-right") return { x: -1, y: 0 };
  if (bodyId.startsWith("rail-top")) return { x: 0, y: 1 };
  if (bodyId.startsWith("rail-bottom")) return { x: 0, y: -1 };
  const top = bodyId.startsWith("post-top");
  const left = bodyId.endsWith("left");
  const bounds = goalBounds(settings, top ? 2 : 1);
  const center = { x: left ? bounds.left : bounds.right, y: top ? RINK.top : RINK.bottom };
  const dx = puck.x - center.x;
  const dy = puck.y - center.y;
  const magnitude = Math.hypot(dx, dy);
  return magnitude > 0.0001 ? { x: dx / magnitude, y: dy / magnitude } : { x: 0, y: top ? 1 : -1 };
}

function crossingScorer(previous: MutableVector, next: MutableVector, settings: MatchSettings): PlayerId | undefined {
  const topLine = RINK.top - RINK.goalDepth;
  const bottomLine = RINK.bottom + RINK.goalDepth;
  if (previous.y >= topLine && next.y < topLine) {
    const fraction = (previous.y - topLine) / (previous.y - next.y);
    const x = previous.x + (next.x - previous.x) * fraction;
    const bounds = goalBounds(settings, 2);
    if (x > bounds.left && x < bounds.right) return 1;
  }
  if (previous.y <= bottomLine && next.y > bottomLine) {
    const fraction = (bottomLine - previous.y) / (next.y - previous.y);
    const x = previous.x + (next.x - previous.x) * fraction;
    const bounds = goalBounds(settings, 1);
    if (x > bounds.left && x < bounds.right) return 2;
  }
  const topBounds = goalBounds(settings, 2);
  if (next.y < topLine && next.x > topBounds.left && next.x < topBounds.right) return 1;
  const bottomBounds = goalBounds(settings, 1);
  if (next.y > bottomLine && next.x > bottomBounds.left && next.x < bottomBounds.right) return 2;
  return undefined;
}

function recoverClosedBoundaryEscape(puck: MutablePuck, settings: MatchSettings, context: MutableContext): void {
  const radius = puckRadius(settings);
  let recovered = false;
  if (puck.position.x < RINK.left + radius) {
    puck.position.x = RINK.left + radius;
    if (puck.velocity.x < 0) puck.velocity.x = -puck.velocity.x * WALL_RESTITUTION;
    recovered = true;
  } else if (puck.position.x > RINK.right - radius) {
    puck.position.x = RINK.right - radius;
    if (puck.velocity.x > 0) puck.velocity.x = -puck.velocity.x * WALL_RESTITUTION;
    recovered = true;
  }
  const topBounds = goalBounds(settings, 2);
  const bottomBounds = goalBounds(settings, 1);
  const inTopMouth = puck.position.x > topBounds.left && puck.position.x < topBounds.right;
  const inBottomMouth = puck.position.x > bottomBounds.left && puck.position.x < bottomBounds.right;
  if (!inTopMouth && puck.position.y < RINK.top + radius) {
    puck.position.y = RINK.top + radius;
    if (puck.velocity.y < 0) puck.velocity.y = -puck.velocity.y * WALL_RESTITUTION;
    recovered = true;
  } else if (!inBottomMouth && puck.position.y > RINK.bottom - radius) {
    puck.position.y = RINK.bottom - radius;
    if (puck.velocity.y > 0) puck.velocity.y = -puck.velocity.y * WALL_RESTITUTION;
    recovered = true;
  }
  if (recovered) impactEvent(context, "wall", "wall-hit", puck.position.x, puck.position.y, length(puck.velocity));
}

class RapierHockeySimulation implements HockeySimulation {
  private readonly world: PhysicsWorld;
  private readonly initializationMilliseconds: number;
  private readonly samples: number[] = [];
  private bodyCount = 0;
  private stepCount = 0;
  private currentSettingsKey = "";
  private rebuildRequired = true;
  private destroyed = false;

  constructor(world: PhysicsWorld, initializationMilliseconds: number) {
    this.world = world;
    this.initializationMilliseconds = initializationMilliseconds;
  }

  private requireActive(): void {
    if (this.destroyed) throw new Error("Cat Paw Rapier simulation has been destroyed.");
  }

  private removeBodies(): void {
    for (const id of BODY_IDS) this.world.removeBody(id);
    this.bodyCount = 0;
  }

  private createBodies(settings: MatchSettings, players: Readonly<Record<PlayerId, MutableStriker>>, puck: MutablePuck): void {
    this.removeBodies();
    const circle = (id: string, type: "dynamic" | "fixed" | "kinematic-position", position: Vector2, radius: number, restitution: number): void => {
      this.world.createBody({
        id,
        type,
        position: toPhysics(position),
        ...(type === "dynamic" ? {
          linearVelocity: toPhysics(puck.velocity),
          linearDamping: -Math.log(PUCK_DAMPING_PER_SECOND),
          angularDamping: 4,
          ccd: true
        } : {}),
        collider: { shape: { kind: "circle", radius: radius / SCALE }, density: 1, friction: 0, restitution }
      });
      this.bodyCount += 1;
    };
    const box = (id: string, left: number, top: number, right: number, bottom: number): void => {
      this.world.createBody({
        id,
        type: "fixed",
        position: toPhysics({ x: (left + right) / 2, y: (top + bottom) / 2 }),
        collider: {
          shape: { kind: "box", halfWidth: (right - left) / 2 / SCALE, halfHeight: (bottom - top) / 2 / SCALE },
          friction: 0,
          restitution: WALL_COLLIDER_RESTITUTION
        }
      });
      this.bodyCount += 1;
    };

    circle("puck", "dynamic", puck.position, puckRadius(settings), PUCK_RESTITUTION);
    circle("paw-1", "kinematic-position", players[1].previousPosition, strikerRadius(settings, 1), PAW_COLLIDER_RESTITUTION);
    circle("paw-2", "kinematic-position", players[2].previousPosition, strikerRadius(settings, 2), PAW_COLLIDER_RESTITUTION);
    box("rail-left", RINK.left - RAIL_THICKNESS, RINK.top, RINK.left, RINK.bottom);
    box("rail-right", RINK.right, RINK.top, RINK.right + RAIL_THICKNESS, RINK.bottom);
    const topGoal = goalBounds(settings, 2);
    const bottomGoal = goalBounds(settings, 1);
    box("rail-top-left", RINK.left, RINK.top - RAIL_THICKNESS, topGoal.left, RINK.top);
    box("rail-top-right", topGoal.right, RINK.top - RAIL_THICKNESS, RINK.right, RINK.top);
    box("rail-bottom-left", RINK.left, RINK.bottom, bottomGoal.left, RINK.bottom + RAIL_THICKNESS);
    box("rail-bottom-right", bottomGoal.right, RINK.bottom, RINK.right, RINK.bottom + RAIL_THICKNESS);
    for (const [id, x, y] of [
      ["post-top-left", topGoal.left, RINK.top], ["post-top-right", topGoal.right, RINK.top],
      ["post-bottom-left", bottomGoal.left, RINK.bottom], ["post-bottom-right", bottomGoal.right, RINK.bottom]
    ] as const) circle(id, "fixed", { x, y }, RINK.postRadius, WALL_COLLIDER_RESTITUTION);
    this.currentSettingsKey = settingsKey(settings);
    this.rebuildRequired = false;
  }

  private advancePuck(puck: MutablePuck, players: Readonly<Record<PlayerId, MutableStriker>>, settings: MatchSettings, context: MutableContext): PlayerId | undefined {
    if (this.rebuildRequired || this.currentSettingsKey !== settingsKey(settings)) this.createBodies(settings, players, puck);

    const before = { ...puck.position };
    for (const player of [1, 2] as const) {
      const paw = players[player].previousPosition;
      const minimum = puckRadius(settings) + strikerRadius(settings, player);
      const dx = puck.position.x - paw.x;
      const dy = puck.position.y - paw.y;
      const distance = Math.hypot(dx, dy);
      if (distance < minimum) {
        const relativeSpeed = Math.hypot(puck.velocity.x - players[player].velocity.x, puck.velocity.y - players[player].velocity.y);
        const nx = distance > 0.0001 ? dx / distance : relativeSpeed > 0.0001 ? -(puck.velocity.x - players[player].velocity.x) / relativeSpeed : 0;
        const ny = distance > 0.0001 ? dy / distance : relativeSpeed > 0.0001 ? -(puck.velocity.y - players[player].velocity.y) / relativeSpeed : player === 1 ? -1 : 1;
        puck.position.x += nx * (minimum - distance + 0.03);
        puck.position.y += ny * (minimum - distance + 0.03);
      }
    }
    this.world.setBodyTransform("puck", toPhysics(puck.position), 0);
    this.world.setBodyVelocity("puck", toPhysics(puck.velocity), 0);
    for (const player of [1, 2] as const) {
      const id = `paw-${player}`;
      this.world.setBodyTransform(id, toPhysics(players[player].previousPosition), 0);
      this.world.setNextKinematicTransform(id, toPhysics(players[player].position), 0);
    }

    const beforeVelocity = { ...puck.velocity };
    const started = typeof performance === "undefined" ? Date.now() : performance.now();
    const result = this.world.step();
    const ended = typeof performance === "undefined" ? Date.now() : performance.now();
    this.samples.push(ended - started);
    if (this.samples.length > 600) this.samples.shift();
    this.stepCount += 1;

    const puckBody = this.world.getBody("puck");
    puck.previousPosition = before;
    puck.position = fromPhysics(puckBody.position);
    puck.velocity = fromPhysics(puckBody.linearVelocity);

    const contacts = result.collisions.filter((event) => event.started && collisionIncludes(event, "puck"));
    const pawContacts = contacts.map((event) => otherBody(event, "puck"))
      .filter((id): id is "paw-1" | "paw-2" => id === "paw-1" || id === "paw-2")
      .map((id) => Number(id.at(-1)) as PlayerId)
      .sort((left, right) => {
        const relative = (player: PlayerId): number => {
          const dx = puck.position.x - players[player].position.x;
          const dy = puck.position.y - players[player].position.y;
          const magnitude = Math.hypot(dx, dy) || 1;
          return Math.abs((beforeVelocity.x - players[player].velocity.x) * dx / magnitude + (beforeVelocity.y - players[player].velocity.y) * dy / magnitude);
        };
        return relative(right) - relative(left) || left - right;
      });
    const hitter = pawContacts[0];
    if (hitter !== undefined) {
      const dx = puck.position.x - players[hitter].position.x;
      const dy = puck.position.y - players[hitter].position.y;
      const magnitude = Math.hypot(dx, dy) || 1;
      const normal = { x: dx / magnitude, y: dy / magnitude };
      const relativeSpeed = Math.abs((beforeVelocity.x - players[hitter].velocity.x) * normal.x + (beforeVelocity.y - players[hitter].velocity.y) * normal.y);
      const multiplier = settings.returnSpeed[hitter] / 100;
      puck.velocity.x *= multiplier;
      puck.velocity.y *= multiplier;
      puck.lastHitter = hitter;
      capVelocity(puck.velocity, returnSpeedCap(settings, hitter));
      impactEvent(context, hitter === 1 ? "player1" : "player2", "paw-hit", puck.position.x, puck.position.y, relativeSpeed, hitter, normal);
    }

    const wallContacts = contacts.map((event) => otherBody(event, "puck")).filter((id) => id.startsWith("rail-") || id.startsWith("post-"));
    let strongestWall: { speed: number; normal: MutableVector } | undefined;
    for (const id of wallContacts) {
      const normal = wallNormal(id, puck.position, settings);
      const speed = Math.abs(beforeVelocity.x * normal.x + beforeVelocity.y * normal.y);
      if (strongestWall === undefined || speed > strongestWall.speed) strongestWall = { speed, normal };
    }
    if (strongestWall !== undefined) impactEvent(context, "wall", "wall-hit", puck.position.x, puck.position.y, strongestWall.speed, undefined, strongestWall.normal);

    const scorer = crossingScorer(before, puck.position, settings);
    if (scorer === undefined) recoverClosedBoundaryEscape(puck, settings, context);
    if (length(puck.velocity) < 6.5) puck.velocity = { x: 0, y: 0 };
    capVelocity(puck.velocity, puck.lastHitter === undefined ? puckSpeedCap(settings) : returnSpeedCap(settings, puck.lastHitter));
    this.world.setBodyVelocity("puck", toPhysics(puck.velocity), 0);
    return scorer;
  }

  stepGame(state: HockeyGameState, action: Readonly<HockeyActionSnapshot>, seconds: number): HockeyGameState {
    this.requireActive();
    if (!Number.isFinite(seconds) || Math.abs(seconds - FIXED_STEP_SECONDS) > 0.000001) {
      throw new Error(`Cat Paw Rapier requires a fixed ${FIXED_STEP_SECONDS}-second step.`);
    }
    const tick = state.tick + 1;
    const context: MutableContext = {
      events: [], nextEventId: state.nextEventId, tick,
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
      position: { ...state.puck.position }, previousPosition: { ...state.puck.position }, velocity: { ...state.puck.velocity },
      trail: state.puck.trail.map((point) => ({ ...point })),
      ...(state.puck.lastHitter === undefined ? {} : { lastHitter: state.puck.lastHitter })
    };

    if (action.pausePressed) {
      if (phase === "paused") {
        phase = phaseBeforePause ?? "ready";
        phaseBeforePause = undefined;
        emit(context, "resume", LOGICAL_CENTER.x, LOGICAL_CENTER.y, 0.35);
      } else {
        phaseBeforePause = phase;
        phase = "paused";
        emit(context, "pause", LOGICAL_CENTER.x, LOGICAL_CENTER.y, 0.35);
      }
    }

    if (phase === "paused") {
      players[1].velocity = { x: 0, y: 0 };
      players[2].velocity = { x: 0, y: 0 };
    } else if (phase === "ready") {
      this.rebuildRequired = true;
      updateReady(players[1], action.players[1], 1, seconds, context);
      updateReady(players[2], action.players[2], 2, seconds, context);
      puck = resetPuck();
      if (players[1].ready && players[2].ready) {
        phase = "countdown";
        phaseTimer = COUNTDOWN_SECONDS;
        players = { 1: resetStriker(1), 2: resetStriker(2) };
        emit(context, "countdown", LOGICAL_CENTER.x, LOGICAL_CENTER.y, 0.45);
      }
    } else if (phase === "countdown") {
      this.rebuildRequired = true;
      const previousTimer = phaseTimer;
      phaseTimer = Math.max(0, phaseTimer - seconds);
      const boundary = countdownBoundary(previousTimer, phaseTimer);
      if (boundary !== undefined) emit(context, "countdown", LOGICAL_CENTER.x, LOGICAL_CENTER.y, boundary / 3);
      puck = resetPuck();
      if (phaseTimer <= 0) {
        phase = "playing";
        serveNumber += 1;
        servePuck(puck, serveNumber, activeMatchSettings, lastScorer);
      }
    } else if (phase === "playing") {
      const scorer = this.advancePuck(puck, players, activeMatchSettings, context);
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
        this.rebuildRequired = true;
      }
    } else if (phase === "goal") {
      this.rebuildRequired = true;
      phaseTimer = Math.max(0, phaseTimer - seconds);
      puck = resetPuck();
      if (phaseTimer <= 0) {
        if (winner !== undefined) {
          phase = "won";
          emit(context, "win", LOGICAL_CENTER.x, winner === 1 ? RINK.bottom - 186 : RINK.top + 186, 1, winner);
        } else {
          activeMatchSettings = pendingMatchSettings;
          phase = "countdown";
          phaseTimer = COUNTDOWN_SECONDS;
        }
      }
    } else if (phase === "won") {
      this.rebuildRequired = true;
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
        position: freezeVector(puck.position), previousPosition: freezeVector(puck.previousPosition), velocity: freezeVector(puck.velocity),
        trail: Object.freeze(puck.trail.map((point) => Object.freeze({ ...point }))),
        ...(puck.lastHitter === undefined ? {} : { lastHitter: puck.lastHitter })
      }),
      events: Object.freeze([...state.events.filter((event) => tick - event.tick <= 180), ...context.events]),
      nextEventId: context.nextEventId,
      soundCooldowns: Object.freeze(context.cooldowns) as SoundCooldowns,
      reducedEffects: state.reducedEffects,
      activeMatchSettings,
      pendingMatchSettings
    });
  }

  reset(): void {
    this.requireActive();
    this.rebuildRequired = true;
  }

  getDiagnostics(): HockeyPhysicsDiagnostics {
    const sorted = [...this.samples].sort((left, right) => left - right);
    const sum = sorted.reduce((total, value) => total + value, 0);
    return Object.freeze({
      backend: "rapier2d",
      bodyCount: this.bodyCount,
      initializationMilliseconds: this.initializationMilliseconds,
      steps: this.stepCount,
      timingMilliseconds: Object.freeze({
        mean: sorted.length === 0 ? 0 : sum / sorted.length,
        p95: sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]!,
        worst: sorted.at(-1) ?? 0
      })
    });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.world.destroy();
  }
}

export async function createHockeySimulation(createWorld: CreatePhysicsWorld): Promise<HockeySimulation> {
  const started = typeof performance === "undefined" ? Date.now() : performance.now();
  const world = await createWorld({ gravity: { x: 0, y: 0 }, timestepSeconds: FIXED_STEP_SECONDS });
  const ended = typeof performance === "undefined" ? Date.now() : performance.now();
  if (world.backend !== "rapier2d") {
    world.destroy();
    throw new Error(`Cat Paw requires the Rapier 2D backend; received ${String(world.backend)}.`);
  }
  return new RapierHockeySimulation(world, ended - started);
}

export function withReducedEffects(state: HockeyGameState, reducedEffects: boolean): HockeyGameState {
  return Object.freeze({ ...state, reducedEffects });
}
