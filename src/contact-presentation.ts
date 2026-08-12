import type { PlayerId } from "./actions.ts";
import type { HockeyGameState, PresentationEvent, Vector2 } from "./state.ts";

export const CONTACT_REACTION_SECONDS = 0.66;
export const CONTACT_FRAME_TIMES = Object.freeze([0, 0.08, 0.17, 0.28, 0.40, 0.52, 0.64]);

export interface ContactTransform {
  readonly scaleX: number;
  readonly scaleY: number;
  readonly rotation: number;
}

export interface ContactOffset {
  readonly x: number;
  readonly y: number;
}

export interface ContactPresentation {
  readonly owner?: PlayerId;
  readonly activePlayer?: PlayerId;
  readonly eventId?: number;
  readonly frame: number;
  readonly ageSeconds: number | null;
  readonly strength: number;
  readonly normal: Vector2;
  readonly puck: ContactTransform;
  readonly paws: Readonly<Record<PlayerId, ContactTransform>>;
  readonly puckOffset: ContactOffset;
  readonly pawOffsets: Readonly<Record<PlayerId, ContactOffset>>;
}

const IDENTITY: ContactTransform = Object.freeze({ scaleX: 1, scaleY: 1, rotation: 0 });
const ZERO: ContactOffset = Object.freeze({ x: 0, y: 0 });
const PAW_IDENTITIES = Object.freeze({ 1: IDENTITY, 2: IDENTITY });
const PAW_ZEROES = Object.freeze({ 1: ZERO, 2: ZERO });
const DEFAULT_NORMAL: Vector2 = Object.freeze({ x: 0, y: -1 });

interface ContactKeyframe {
  readonly puckX: number;
  readonly puckY: number;
  readonly pawX: number;
  readonly pawY: number;
  readonly rotation: number;
  readonly recoil: number;
}

const KEYFRAMES: readonly ContactKeyframe[] = Object.freeze([
  Object.freeze({ puckX: 1.18, puckY: 0.82, pawX: 0.88, pawY: 1.12, rotation: 0.10, recoil: 1.00 }),
  Object.freeze({ puckX: 0.84, puckY: 1.18, pawX: 1.10, pawY: 0.92, rotation: -0.08, recoil: -0.55 }),
  Object.freeze({ puckX: 1.11, puckY: 0.91, pawX: 0.94, pawY: 1.08, rotation: 0.06, recoil: 0.38 }),
  Object.freeze({ puckX: 0.92, puckY: 1.10, pawX: 1.06, pawY: 0.95, rotation: -0.04, recoil: -0.24 }),
  Object.freeze({ puckX: 1.06, puckY: 0.95, pawX: 0.97, pawY: 1.04, rotation: 0.025, recoil: 0.14 }),
  Object.freeze({ puckX: 0.97, puckY: 1.04, pawX: 1.02, pawY: 0.98, rotation: -0.012, recoil: -0.07 }),
  Object.freeze({ puckX: 1, puckY: 1, pawX: 1, pawY: 1, rotation: 0, recoil: 0 })
]);

const strengthMix = (value: number, strength: number): number => 1 + (value - 1) * strength;

function newestPawHit(state: Readonly<HockeyGameState>): PresentationEvent | undefined {
  return [...state.events].reverse().find((candidate) => candidate.kind === "paw-hit" && candidate.player !== undefined);
}

function normalizedNormal(event: PresentationEvent): Vector2 {
  const value = event.normal ?? DEFAULT_NORMAL;
  const length = Math.hypot(value.x, value.y);
  return length > 0.0001 ? Object.freeze({ x: value.x / length, y: value.y / length }) : DEFAULT_NORMAL;
}

function resolveFrame(ageSeconds: number): number {
  for (let index = CONTACT_FRAME_TIMES.length - 1; index >= 0; index -= 1) {
    if (ageSeconds + Number.EPSILON >= CONTACT_FRAME_TIMES[index]!) return index + 1;
  }
  return 1;
}

function idle(owner: PlayerId | undefined, ageSeconds: number | null = null, strength = 0, normal: Vector2 = DEFAULT_NORMAL): ContactPresentation {
  return Object.freeze({ owner, frame: 0, ageSeconds, strength, normal, puck: IDENTITY, paws: PAW_IDENTITIES, puckOffset: ZERO, pawOffsets: PAW_ZEROES });
}

export function resolveContactPresentation(state: Readonly<HockeyGameState>): ContactPresentation {
  const owner = state.puck.lastHitter;
  const event = newestPawHit(state);
  if (event === undefined) return idle(owner);
  const ageSeconds = Math.max(0, (state.tick - event.tick) / 60);
  const normal = normalizedNormal(event);
  if (state.reducedEffects || state.phase !== "playing" || ageSeconds > CONTACT_REACTION_SECONDS) return idle(owner, ageSeconds, event.strength, normal);

  const player = event.player!;
  const strength = Math.max(0.08, Math.min(1, event.strength));
  const frame = resolveFrame(ageSeconds);
  const keyframe = KEYFRAMES[frame - 1]!;
  const direction = player === 1 ? 1 : -1;
  const puck = Object.freeze({ scaleX: strengthMix(keyframe.puckX, strength), scaleY: strengthMix(keyframe.puckY, strength), rotation: keyframe.rotation * direction * strength });
  const paw = Object.freeze({ scaleX: strengthMix(keyframe.pawX, strength), scaleY: strengthMix(keyframe.pawY, strength), rotation: -keyframe.rotation * direction * strength * 0.65 });
  const recoil = keyframe.recoil * strength;
  const puckOffset = Object.freeze({ x: normal.x * recoil * 0.035, y: normal.y * recoil * 0.035 });
  const pawOffset = Object.freeze({ x: -normal.x * recoil * 0.05, y: -normal.y * recoil * 0.05 });
  return Object.freeze({
    owner,
    activePlayer: player,
    eventId: event.id,
    frame,
    ageSeconds,
    strength,
    normal,
    puck,
    paws: Object.freeze({ 1: player === 1 ? paw : IDENTITY, 2: player === 2 ? paw : IDENTITY }),
    puckOffset,
    pawOffsets: Object.freeze({ 1: player === 1 ? pawOffset : ZERO, 2: player === 2 ? pawOffset : ZERO })
  });
}
