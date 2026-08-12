import type { PlayerId } from "./actions.ts";
import type { HockeyGameState } from "./state.ts";

export const CONTACT_REACTION_SECONDS = 0.28;

export interface ContactTransform {
  readonly scaleX: number;
  readonly scaleY: number;
  readonly rotation: number;
}

export interface ContactPresentation {
  readonly owner?: PlayerId;
  readonly activePlayer?: PlayerId;
  readonly ageSeconds: number | null;
  readonly strength: number;
  readonly puck: ContactTransform;
  readonly paws: Readonly<Record<PlayerId, ContactTransform>>;
}

const IDENTITY: ContactTransform = Object.freeze({ scaleX: 1, scaleY: 1, rotation: 0 });
const PAW_IDENTITIES = Object.freeze({ 1: IDENTITY, 2: IDENTITY });

interface ContactKeyframe {
  readonly time: number;
  readonly puckX: number;
  readonly puckY: number;
  readonly pawX: number;
  readonly pawY: number;
  readonly rotation: number;
}

const KEYFRAMES: readonly ContactKeyframe[] = Object.freeze([
  Object.freeze({ time: 0, puckX: 1.2, puckY: 0.8, pawX: 0.88, pawY: 1.12, rotation: 0.12 }),
  Object.freeze({ time: 0.08, puckX: 0.9, puckY: 1.13, pawX: 1.08, pawY: 0.94, rotation: -0.07 }),
  Object.freeze({ time: 0.17, puckX: 1.05, puckY: 0.97, pawX: 0.97, pawY: 1.03, rotation: 0.035 }),
  Object.freeze({ time: CONTACT_REACTION_SECONDS, puckX: 1, puckY: 1, pawX: 1, pawY: 1, rotation: 0 })
]);

const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount;
const strengthMix = (value: number, strength: number): number => 1 + (value - 1) * strength;

function sample(age: number): ContactKeyframe {
  for (let index = 1; index < KEYFRAMES.length; index += 1) {
    const right = KEYFRAMES[index]!;
    if (age > right.time) continue;
    const left = KEYFRAMES[index - 1]!;
    const amount = (age - left.time) / (right.time - left.time);
    return Object.freeze({
      time: age,
      puckX: mix(left.puckX, right.puckX, amount),
      puckY: mix(left.puckY, right.puckY, amount),
      pawX: mix(left.pawX, right.pawX, amount),
      pawY: mix(left.pawY, right.pawY, amount),
      rotation: mix(left.rotation, right.rotation, amount)
    });
  }
  return KEYFRAMES[KEYFRAMES.length - 1]!;
}

export function resolveContactPresentation(state: Readonly<HockeyGameState>): ContactPresentation {
  const owner = state.puck.lastHitter;
  const event = [...state.events].reverse().find((candidate) => candidate.kind === "paw-hit" && candidate.player !== undefined);
  if (event === undefined) return Object.freeze({ owner, ageSeconds: null, strength: 0, puck: IDENTITY, paws: PAW_IDENTITIES });
  const ageSeconds = Math.max(0, (state.tick - event.tick) / 60);
  const player = event.player!;
  if (state.reducedEffects || ageSeconds > CONTACT_REACTION_SECONDS) return Object.freeze({ owner, ageSeconds, strength: event.strength, puck: IDENTITY, paws: PAW_IDENTITIES });
  const strength = Math.max(0.08, Math.min(1, event.strength));
  const frame = sample(ageSeconds);
  const direction = player === 1 ? 1 : -1;
  const puck = Object.freeze({ scaleX: strengthMix(frame.puckX, strength), scaleY: strengthMix(frame.puckY, strength), rotation: frame.rotation * direction * strength * 1.45 });
  const paw = Object.freeze({ scaleX: strengthMix(frame.pawX, strength), scaleY: strengthMix(frame.pawY, strength), rotation: -frame.rotation * direction * strength });
  return Object.freeze({ owner, activePlayer: player, ageSeconds, strength, puck, paws: Object.freeze({ 1: player === 1 ? paw : IDENTITY, 2: player === 2 ? paw : IDENTITY }) });
}
