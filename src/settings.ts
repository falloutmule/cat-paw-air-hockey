import { PUCK_RADIUS, PUCK_SPEED_CAP, RINK, STRIKER_IMPULSE_SPEED_CAP, STRIKER_MAX_SPEED, STRIKER_RADIUS } from "./constants.ts";
import type { PlayerId } from "./actions.ts";

export interface MatchSettings {
  readonly puckSpeed: number;
  readonly pawSpeed: Readonly<Record<PlayerId, number>>;
  readonly puckSize: number;
  readonly pawSize: Readonly<Record<PlayerId, number>>;
  readonly goalSize: Readonly<Record<PlayerId, number>>;
}

export const DEFAULT_MATCH_SETTINGS: MatchSettings = Object.freeze({
  puckSpeed: 100,
  pawSpeed: Object.freeze({ 1: 100, 2: 100 }),
  puckSize: 100,
  pawSize: Object.freeze({ 1: 100, 2: 100 }),
  goalSize: Object.freeze({ 1: 100, 2: 100 })
});

const clampStep = (value: unknown, low: number, high: number): number => {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : 100;
  return Math.min(high, Math.max(low, Math.round(numeric / 5) * 5));
};

export function normalizeMatchSettings(value: Partial<MatchSettings> | undefined): MatchSettings {
  return Object.freeze({
    puckSpeed: clampStep(value?.puckSpeed, 70, 130),
    pawSpeed: Object.freeze({
      1: clampStep(value?.pawSpeed?.[1], 70, 130),
      2: clampStep(value?.pawSpeed?.[2], 70, 130)
    }),
    puckSize: clampStep(value?.puckSize, 75, 125),
    pawSize: Object.freeze({
      1: clampStep(value?.pawSize?.[1], 75, 125),
      2: clampStep(value?.pawSize?.[2], 75, 125)
    }),
    goalSize: Object.freeze({
      1: clampStep(value?.goalSize?.[1], 75, 125),
      2: clampStep(value?.goalSize?.[2], 75, 125)
    })
  });
}

export function settingsEqual(left: MatchSettings, right: MatchSettings): boolean {
  return left.puckSpeed === right.puckSpeed && left.puckSize === right.puckSize
    && left.pawSpeed[1] === right.pawSpeed[1] && left.pawSpeed[2] === right.pawSpeed[2]
    && left.pawSize[1] === right.pawSize[1] && left.pawSize[2] === right.pawSize[2]
    && left.goalSize[1] === right.goalSize[1] && left.goalSize[2] === right.goalSize[2];
}

export function settingScale(value: number): number { return value / 100; }
export function puckRadius(settings: MatchSettings): number { return PUCK_RADIUS * settingScale(settings.puckSize); }
export function strikerRadius(settings: MatchSettings, player: PlayerId): number { return STRIKER_RADIUS * settingScale(settings.pawSize[player]); }
export function puckSpeedCap(settings: MatchSettings): number { return PUCK_SPEED_CAP * settingScale(settings.puckSpeed); }
export function strikerSpeedCap(settings: MatchSettings, player: PlayerId): number { return STRIKER_MAX_SPEED * settingScale(settings.pawSpeed[player]); }
export function strikerImpulseCap(settings: MatchSettings, player: PlayerId): number { return STRIKER_IMPULSE_SPEED_CAP * settingScale(settings.pawSpeed[player]); }
export function goalBounds(settings: MatchSettings, defender: PlayerId): Readonly<{ left: number; right: number }> {
  const width = (RINK.goalRight - RINK.goalLeft) * settingScale(settings.goalSize[defender]);
  return Object.freeze({ left: 270 - width / 2, right: 270 + width / 2 });
}

export function isClassicSettings(settings: MatchSettings): boolean { return settingsEqual(settings, DEFAULT_MATCH_SETTINGS); }

export function settingsSummary(settings: MatchSettings): string {
  if (isClassicSettings(settings)) return "Classic settings";
  return `Puck: ${settings.puckSpeed}% speed · ${settings.puckSize}% size | P1: ${settings.pawSpeed[1]}% speed · ${settings.pawSize[1]}% paw · ${settings.goalSize[1]}% goal | P2: ${settings.pawSpeed[2]}% speed · ${settings.pawSize[2]}% paw · ${settings.goalSize[2]}% goal`;
}
